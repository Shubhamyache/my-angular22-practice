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
 * ⚠️ FIX DURING BACKEND INTEGRATION: `project`/`loading`/`error` are now `computed()` signals
 * reading directly from the store, not a one-time local copy. The previous version called
 * `store.loadProjectById(id)` (async) and then immediately did `this.project.set(store.selectedProject())`
 * on the very next line — a synchronous read of state an async call hadn't populated yet, so the
 * local signal was permanently stuck at whatever it was before navigating here. This "worked"
 * by accident under this codebase's other detail components using this exact pattern, and is a
 * genuine bug, not a design choice — mirroring `store.selectedProject()`/`loading()`/`error()`
 * reactively via `computed()` is the minimal fix, not a UI redesign.
 */

import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectStore } from '../store/project.store';
import { ProjectService } from '../services/project.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { canEditProject } from '../../../core/utils/permissions.util';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

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
  private readonly store          = inject(ProjectStore);
  private readonly projectService = inject(ProjectService);
  private readonly authService    = inject(AuthService);
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly confirmDialog  = inject(ConfirmDialogService);

  private readonly invalidId = signal(false);

  protected readonly project = computed(() => this.store.selectedProject());
  protected readonly loading = computed(() => this.store.loading());
  protected readonly error   = computed(() =>
    this.invalidId() ? 'Invalid project ID' : this.store.error()
  );

  private readonly deleting = signal(false);

  /** Admin (any), Manager (only projects they manage) — HR/Employee never see this screen's
   *  Edit/Delete buttons at all. See core/utils/permissions.util.ts. */
  protected readonly canEdit = computed(() =>
    canEditProject(this.project()?.managerId ?? -1, this.authService.currentUser())
  );

  private projectId = 0;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.projectId = Number(id);
      this.store.loadProjectById(this.projectId);
    } else {
      this.invalidId.set(true);
    }
  }

  /**
   * Navigate to edit form
   */
  onEdit(): void {
    this.router.navigate(['/projects', this.projectId, 'edit']);
  }

  /**
   * Delete with confirmation. Previously only removed the row from the local store without
   * ever calling the API — fixed to actually call DELETE /projects/{id} first.
   */
  async onDelete(): Promise<void> {
    const proj = this.project();
    if (!proj || this.deleting()) return;

    const confirmed = await this.confirmDialog.confirmDelete(proj.name);
    if (!confirmed) return;

    this.deleting.set(true);
    this.projectService.delete(proj.id).subscribe({
      next: () => {
        this.store.removeProject(proj.id);
        this.router.navigate(['/projects']);
      },
      error: () => {
        // errorInterceptor already surfaced a toast for 403/409/500; for a 404 (already
        // deleted elsewhere) the store's error() signal will show the inline alert.
        this.deleting.set(false);
      }
    });
  }

  /**
   * Go back to list
   */
  onBack(): void {
    this.router.navigate(['/projects']);
  }
}
