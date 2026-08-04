/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK DETAIL COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 */

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TaskStore } from '../store/task.store';
import { Task } from '../models/task.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent, DateFormatPipe],
  templateUrl: './task-detail.component.html'
})
export class TaskDetailComponent implements OnInit {
  private readonly store  = inject(TaskStore);
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly task    = signal<Task | null>(null);
  protected readonly loading = signal(true);
  protected readonly error   = signal<string | null>(null);

  private taskId = 0;

  protected readonly statusConfig = {
    Todo:       { badge: 'bg-secondary',        label: 'To Do',       icon: 'bi-circle' },
    InProgress: { badge: 'bg-primary',          label: 'In Progress', icon: 'bi-arrow-repeat' },
    InReview:   { badge: 'bg-warning text-dark', label: 'In Review',   icon: 'bi-eye' },
    Done:       { badge: 'bg-success',          label: 'Done',        icon: 'bi-check-circle-fill' }
  };

  protected readonly priorityConfig = {
    Low:      { badge: 'bg-secondary', label: 'Low' },
    Medium:   { badge: 'bg-info',      label: 'Medium' },
    High:     { badge: 'bg-warning',   label: 'High' },
    Critical: { badge: 'bg-danger',    label: 'Critical' }
  };

  protected readonly Math = Math;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskId = Number(id);
      this.loadTask();
    } else {
      this.error.set('Invalid task ID');
      this.loading.set(false);
    }
  }

  private loadTask(): void {
    this.store.loadTaskById(this.taskId);
    this.task.set(this.store.selectedTask());
    this.loading.set(this.store.loading());
    this.error.set(this.store.error());
  }

  onEdit(): void {
    this.router.navigate(['/tasks', this.taskId, 'edit']);
  }

  onDelete(): void {
    const t = this.task();
    if (!t) return;

    if (confirm(`Are you sure you want to delete "${t.title}"?`)) {
      this.store.removeTask(t.id);
      this.router.navigate(['/tasks']);
    }
  }

  onBack(): void {
    this.router.navigate(['/tasks']);
  }
}
