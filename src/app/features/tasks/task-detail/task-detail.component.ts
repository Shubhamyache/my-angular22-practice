/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK DETAIL COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 * `task`/`loading`/`error` are `computed()` signals reading directly from the store — see the
 * matching note in project-detail.component.ts for why (the previous version's synchronous
 * local-signal copy immediately after an async `loadTaskById()` call never actually reflected
 * the loaded data; same latent bug, same minimal fix, not a UI redesign).
 */

import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { TaskStore } from '../store/task.store';
import { TaskService } from '../services/task.service';
import { TaskTimeLogService } from '../services/task-time-log.service';
import { TaskTimeLogDto } from '../models/task-time-log.model';
import { TaskStatus } from '../models/task.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { ApiError } from '../../../core/utils/api-error.util';
import { TaskCommentsComponent } from '../task-comments/task-comments.component';
import { TaskAttachmentsComponent } from '../task-attachments/task-attachments.component';

/** hours=0 and minutes=0 together is "logged nothing" — reject it at the form level rather than
 *  letting a no-op POST reach the backend. */
function atLeastSomeTime(control: AbstractControl): ValidationErrors | null {
  const hours = Number(control.get('hours')?.value) || 0;
  const minutes = Number(control.get('minutes')?.value) || 0;
  return hours + minutes > 0 ? null : { noTimeLogged: true };
}

const STATUS_ORDER: TaskStatus[] = ['Todo', 'InProgress', 'InReview', 'Done'];

@Component({
  selector: 'app-task-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    LoaderComponent,
    DateFormatPipe,
    ModalComponent,
    TaskCommentsComponent,
    TaskAttachmentsComponent
  ],
  templateUrl: './task-detail.component.html'
})
export class TaskDetailComponent implements OnInit {
  private readonly store          = inject(TaskStore);
  private readonly taskService    = inject(TaskService);
  private readonly timeLogService = inject(TaskTimeLogService);
  private readonly authService    = inject(AuthService);
  private readonly confirmDialog  = inject(ConfirmDialogService);
  private readonly fb             = inject(FormBuilder);
  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);

  /** Admin/Manager per §13 — see task-list.component.ts for why this is role-only, not
   *  per-record ownership (TaskDto has no project.managerId to check against). */
  protected readonly canManageTasks = ['Admin', 'Manager'].includes(this.authService.getUserRole());
  private readonly myEmployeeId = this.authService.employeeId();

  private readonly invalidId = signal(false);
  private readonly deleting  = signal(false);

  protected readonly task    = computed(() => this.store.selectedTask());
  protected readonly loading = computed(() => this.store.loading());
  protected readonly error   = computed(() =>
    this.invalidId() ? 'Invalid task ID' : this.store.error()
  );

  /** Log Time and Change Status are both available to Admin/Manager (any task) or the task's own
   *  assignee (canChangeTaskStatus's shape in permissions.util.ts, minus the per-project-manager
   *  branch task-list/detail already can't check client-side — same simplification noted above). */
  protected readonly canAct = computed(() => {
    const t = this.task();
    if (!t) return false;
    return this.canManageTasks || t.assigneeId === this.myEmployeeId;
  });

  /** Terminal status — once Done, no further status changes (§3 of the UI change request). */
  protected readonly canChangeStatus = computed(() => this.canAct() && this.task()?.status !== 'Done');

  protected readonly statusOptions = STATUS_ORDER;
  protected readonly changingStatus = signal(false);

  private taskId = 0;

  /** ?commentId= from a mention notification's link — see task-comments.component.ts's
   *  highlightCommentId input and PartNineBEChannges.md for the backend side (the link itself
   *  needs to start including this). Access control needs no extra code here: if the caller
   *  can't see this task at all, store.loadTaskById() 403s and the error() branch above renders
   *  instead of ever reaching the comments section. Read once from the route snapshot (not a
   *  signal) — same one-time-read convention this component already uses for taskId. */
  protected readonly highlightCommentId: number | null = (() => {
    const raw = this.route.snapshot.queryParamMap.get('commentId');
    return raw ? Number(raw) : null;
  })();

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

  // ── Log Time modal ────────────────────────────────────────────────────────
  protected readonly logTimeModalOpen = signal(false);
  protected readonly loggingTime      = signal(false);
  protected readonly logTimeError     = signal<string | null>(null);

  protected readonly timeLogs        = signal<TaskTimeLogDto[]>([]);
  protected readonly timeLogsLoading = signal(true);

  protected readonly logTimeForm = this.fb.group({
    hours:       [0, [Validators.required, Validators.min(0), Validators.max(24)]],
    minutes:     [0, [Validators.required, Validators.min(0), Validators.max(59)]],
    description: ['', [Validators.required, Validators.maxLength(500)]]
  }, { validators: atLeastSomeTime });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskId = Number(id);
      this.store.loadTaskById(this.taskId);
      this.loadTimeLogs();
    } else {
      this.invalidId.set(true);
    }
  }

  private loadTimeLogs(): void {
    this.timeLogsLoading.set(true);
    this.timeLogService.getAll(this.taskId).subscribe({
      next: logs => {
        this.timeLogs.set(logs);
        this.timeLogsLoading.set(false);
      },
      error: () => this.timeLogsLoading.set(false)
    });
  }

  onEdit(): void {
    this.router.navigate(['/tasks', this.taskId, 'edit']);
  }

  async onDelete(): Promise<void> {
    const t = this.task();
    if (!t || this.deleting()) return;

    const confirmed = await this.confirmDialog.confirmDelete(t.title);
    if (!confirmed) return;

    this.deleting.set(true);
    this.taskService.delete(t.id).subscribe({
      next: () => {
        this.store.removeTask(t.id);
        this.router.navigate(['/tasks']);
      },
      error: () => {
        this.deleting.set(false);
      }
    });
  }

  onBack(): void {
    this.router.navigate(['/tasks']);
  }

  /**
   * Moves the task to the next status in STATUS_ORDER via PATCH /tasks/{id}/status (the same
   * endpoint task-board.component.ts's Kanban prev/next buttons already use). Exposed here as a
   * plain dropdown so a status change doesn't require navigating to the board — not every user
   * who can change a task's status necessarily wants the full Kanban view.
   */
  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value as TaskStatus;
    const t = this.task();
    if (!t || this.changingStatus() || newStatus === t.status) return;

    this.changingStatus.set(true);
    this.taskService.patchStatus(t.id, { status: newStatus }).subscribe({
      next: updated => {
        this.store.updateTask(updated);
        this.changingStatus.set(false);
      },
      error: () => {
        select.value = t.status; // revert the <select> to the last confirmed status
        this.changingStatus.set(false);
      }
    });
  }

  // ── Log Time modal ────────────────────────────────────────────────────────

  openLogTimeModal(): void {
    if (!this.canAct()) return;
    this.logTimeForm.reset({ hours: 0, minutes: 0, description: '' });
    this.logTimeError.set(null);
    this.logTimeModalOpen.set(true);
  }

  closeLogTimeModal(): void {
    if (this.loggingTime()) return;
    this.logTimeModalOpen.set(false);
  }

  /**
   * POSTs to the dedicated time-log endpoint (see task-time-log.service.ts's docblock — this
   * doesn't exist on the backend yet, PartNineBEChannges.md documents it) instead of the old
   * approach of sending a full PUT /tasks/{id} with an incremented loggedHours. That old approach
   * is why Employees couldn't log time at all: PUT /tasks/{id} is Admin/Manager-only server-side
   * (it's the same endpoint the Edit Task form uses), so any Employee's own "Log Time" click was
   * silently rejected. The new endpoint is expected to authorize the same way canChangeStatus
   * does — Admin/Manager (any) or the task's own assignee — which is also what canAct() above
   * gates the button on client-side.
   */
  submitLogTime(): void {
    const t = this.task();
    if (!t || this.loggingTime() || this.logTimeForm.invalid) {
      this.logTimeForm.markAllAsTouched();
      return;
    }

    const { hours, minutes, description } = this.logTimeForm.getRawValue();
    this.loggingTime.set(true);
    this.logTimeError.set(null);

    this.timeLogService.log(t.id, {
      hours: hours ?? 0,
      minutes: minutes ?? 0,
      description: description ?? ''
    }).subscribe({
      next: entry => {
        this.timeLogs.update(list => [entry, ...list]);
        this.store.updateTask({
          ...t,
          loggedHours: t.loggedHours + entry.hours + entry.minutes / 60
        });
        this.loggingTime.set(false);
        this.logTimeModalOpen.set(false);
      },
      error: (err: ApiError) => {
        this.logTimeError.set(err.message);
        this.loggingTime.set(false);
      }
    });
  }
}
