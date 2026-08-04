/**
 * ═══════════════════════════════════════════════════════════════════
 * PROJECT DETAIL COMPONENT — Read-Only View
 * ═══════════════════════════════════════════════════════════════════
 *
 * COMPONENT PATTERN:
 * ───────────────────
 * This is a "Smart/Container" component that:
 * - Fetches data from store/service
 * - Handles navigation
 * - Manages local UI state (loading, error)
 * - Displays detailed information
 *
 * ROUTE PARAMS:
 * ──────────────
 * We use ActivatedRoute to get the :id from URL
 *
 *   URL: /projects/5
 *   route.snapshot.paramMap.get('id') → '5'
 *
 * snapshot vs subscribe:
 * - snapshot: For one-time read (simpler)
 * - paramMap.subscribe(): For dynamic updates (if same component reused)
 */

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectStore } from '../store/project.store';
import { Project } from '../models/project.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    LoaderComponent,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './project-detail.component.html'
})
export class ProjectDetailComponent implements OnInit {
  private readonly store  = inject(ProjectStore);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly project = signal<Project | null>(null);
  protected readonly loading = signal(true);
  protected readonly error   = signal<string | null>(null);

  private projectId = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectId = Number(id);
      this.loadProject();
    } else {
      this.error.set('Invalid project ID');
      this.loading.set(false);
    }
  }

  private loadProject(): void {
    this.store.loadProjectById(this.projectId);

    // We could also use store.selectedProject directly,
    // but showing local signal pattern for flexibility
    this.project.set(this.store.selectedProject());
    this.loading.set(this.store.loading());
    this.error.set(this.store.error());

    // In real app with better state management,
    // we'd subscribe to store changes
  }

  /**
   * Navigate to edit form
   */
  onEdit(): void {
    this.router.navigate(['/projects', this.projectId, 'edit']);
  }

  /**
   * Delete with confirmation
   */
  onDelete(): void {
    const proj = this.project();
    if (!proj) return;

    if (confirm(`Are you sure you want to delete "${proj.name}"?`)) {
      this.store.removeProject(proj.id);
      this.router.navigate(['/projects']);
    }
  }

  /**
   * Go back to list
   */
  onBack(): void {
    this.router.navigate(['/projects']);
  }
}
