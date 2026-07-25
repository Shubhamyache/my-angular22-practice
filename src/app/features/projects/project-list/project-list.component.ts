import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { Project, ProjectStatus, ProjectPriority } from '../models/project.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterModule, LoaderComponent, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './project-list.component.html'
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  protected readonly projects       = signal<Project[]>([]);
  protected readonly loading        = signal(true);
  protected readonly error          = signal<string | null>(null);
  protected readonly activeFilter   = signal<ProjectStatus | 'All'>('All');

  protected readonly filtered = computed(() => {
    const f = this.activeFilter();
    return f === 'All'
      ? this.projects()
      : this.projects().filter(p => p.status === f);
  });

  protected readonly statusFilters: Array<ProjectStatus | 'All'> = [
    'All', 'Active', 'OnHold', 'Completed', 'Cancelled'
  ];

  protected readonly statusConfig: Record<ProjectStatus, { badge: string; label: string }> = {
    Active:    { badge: 'bg-success',   label: 'Active' },
    OnHold:    { badge: 'bg-warning text-dark', label: 'On Hold' },
    Completed: { badge: 'bg-primary',   label: 'Completed' },
    Cancelled: { badge: 'bg-secondary', label: 'Cancelled' }
  };

  protected readonly priorityConfig: Record<ProjectPriority, { badge: string; dot: string }> = {
    Low:      { badge: 'bg-secondary', dot: 'bg-secondary' },
    Medium:   { badge: 'bg-info text-dark', dot: 'bg-info' },
    High:     { badge: 'bg-warning text-dark', dot: 'bg-warning' },
    Critical: { badge: 'bg-danger',    dot: 'bg-danger' }
  };

  ngOnInit(): void {
    this.projectService.getAll().subscribe({
      next: data => { this.projects.set(data); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  setFilter(f: ProjectStatus | 'All'): void {
    this.activeFilter.set(f);
  }
}
