import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TaskService } from '../services/task.service';
import { Task, TaskStatus } from '../models/task.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

const COLUMNS: Array<{ status: TaskStatus; label: string; icon: string; color: string }> = [
  { status: 'Todo',       label: 'To Do',       icon: 'bi-circle',            color: 'border-secondary' },
  { status: 'InProgress', label: 'In Progress', icon: 'bi-arrow-repeat',      color: 'border-primary' },
  { status: 'InReview',   label: 'In Review',   icon: 'bi-eye',               color: 'border-warning' },
  { status: 'Done',       label: 'Done',        icon: 'bi-check-circle-fill', color: 'border-success' }
];

@Component({
  selector: 'app-task-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent],
  templateUrl: './task-board.component.html'
})
export class TaskBoardComponent implements OnInit {
  private readonly taskService = inject(TaskService);

  protected readonly allTasks = signal<Task[]>([]);
  protected readonly loading  = signal(true);
  protected readonly error    = signal<string | null>(null);

  protected readonly columns = COLUMNS;

  /** Returns tasks filtered to a given status */
  protected tasksFor(status: TaskStatus): Task[] {
    return this.allTasks().filter(t => t.status === status);
  }

  ngOnInit(): void {
    this.taskService.getAll().subscribe({
      next: data => { this.allTasks.set(data); this.loading.set(false); },
      error: (err: Error) => { this.error.set(err.message); this.loading.set(false); }
    });
  }
}
