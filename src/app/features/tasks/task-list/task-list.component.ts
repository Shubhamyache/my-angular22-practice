import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Task, TaskPriority, TaskStatus } from '../models/task.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [RouterModule, LoaderComponent, DateFormatPipe],
  templateUrl: './task-list.component.html'
})
export class TaskListComponent implements OnInit {
  private readonly taskService = inject(TaskService);

  protected readonly tasks        = signal<Task[]>([]);
  protected readonly loading      = signal(true);
  protected readonly error        = signal<string | null>(null);
  protected readonly activeStatus = signal<TaskStatus | 'All'>('All');

  protected readonly filtered = computed(() => {
    const s = this.activeStatus();
    return s === 'All' ? this.tasks() : this.tasks().filter(t => t.status === s);
  });

  protected readonly statuses: Array<TaskStatus | 'All'> = [
    'All', 'Todo', 'InProgress', 'InReview', 'Done'
  ];

  protected readonly statusConfig: Record<TaskStatus, { badge: string; label: string; icon: string }> = {
    Todo:       { badge: 'bg-secondary', label: 'To Do',      icon: 'bi-circle' },
    InProgress: { badge: 'bg-primary',   label: 'In Progress', icon: 'bi-arrow-repeat' },
    InReview:   { badge: 'bg-warning text-dark', label: 'In Review', icon: 'bi-eye' },
    Done:       { badge: 'bg-success',   label: 'Done',        icon: 'bi-check-circle-fill' }
  };

  protected readonly priorityConfig: Record<TaskPriority, { badge: string; label: string }> = {
    Low:      { badge: 'text-secondary border border-secondary', label: 'Low' },
    Medium:   { badge: 'text-info border border-info',           label: 'Medium' },
    High:     { badge: 'text-warning border border-warning',     label: 'High' },
    Critical: { badge: 'text-danger border border-danger',       label: 'Critical' }
  };

  ngOnInit(): void {
    this.taskService.getAll().subscribe({
      next: data => { this.tasks.set(data); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  setStatus(s: TaskStatus | 'All'): void {
    this.activeStatus.set(s);
  }
}
