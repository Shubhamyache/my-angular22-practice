/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK COMMENTS — comment thread, embedded on Task Detail
 * ═══════════════════════════════════════════════════════════════════
 * PartTwoUIIntegration.md §10. Visibility is enforced server-side by reusing the exact same
 * rule as GET /tasks/{id} — if this component ever mounted for a task the caller can't see,
 * the GET below 403s and the error banner shows, same as any other scoped resource in this app.
 *
 * Delete button is shown for: the comment's own author, or Admin/Manager (role-only check,
 * same coarse-gate pattern used throughout Tasks — see TaskListComponent.canManageTasks for why
 * "is this Manager's own project" can't be precomputed client-side). The server enforces the
 * real ownership rule and 403s a Manager who isn't actually the project's manager.
 */
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TaskCommentService } from '../services/task-comment.service';
import { TaskCommentDto } from '../models/task-comment.model';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/utils/api-error.util';

const MAX_COMMENT_LENGTH = 1000;

@Component({
  selector: 'app-task-comments',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-comments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCommentsComponent implements OnInit {
  private readonly taskCommentService = inject(TaskCommentService);
  private readonly authService = inject(AuthService);

  readonly taskId = input.required<number>();

  protected readonly comments = signal<TaskCommentDto[]>([]);
  protected readonly loading  = signal(true);
  protected readonly error    = signal<string | null>(null);

  protected readonly draft     = signal('');
  protected readonly posting   = signal(false);
  protected readonly deletingId = signal<number | null>(null);

  protected readonly maxLength = MAX_COMMENT_LENGTH;

  private readonly canManageTasks = ['Admin', 'Manager'].includes(this.authService.getUserRole());
  private readonly currentUserId  = this.authService.currentUser()?.id;

  ngOnInit(): void {
    this.taskCommentService.getAll(this.taskId()).subscribe({
      next: comments => {
        this.comments.set(comments);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  canDelete(comment: TaskCommentDto): boolean {
    return comment.authorId === this.currentUserId || this.canManageTasks;
  }

  addComment(): void {
    const text = this.draft().trim();
    if (!text || this.posting()) return;

    this.posting.set(true);
    this.taskCommentService.add(this.taskId(), text).subscribe({
      next: comment => {
        this.comments.update(list => [...list, comment]);
        this.draft.set('');
        this.posting.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.posting.set(false);
      }
    });
  }

  deleteComment(comment: TaskCommentDto): void {
    if (!confirm('Delete this comment?')) return;

    this.deletingId.set(comment.id);
    this.taskCommentService.delete(this.taskId(), comment.id).subscribe({
      next: () => {
        this.comments.update(list => list.filter(c => c.id !== comment.id));
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null)
    });
  }
}
