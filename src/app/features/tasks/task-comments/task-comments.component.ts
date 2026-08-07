/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK COMMENTS — comment thread with @mention autocomplete
 * ═══════════════════════════════════════════════════════════════════
 * PartTwoUIIntegration.md §10 for the base comment CRUD. Visibility is enforced server-side by
 * reusing the exact same rule as GET /tasks/{id} — if this component ever mounted for a task
 * the caller can't see, the GET below 403s and the error banner shows, same as any other scoped
 * resource in this app.
 *
 * Delete button is shown for: the comment's own author, or Admin/Manager (role-only check,
 * same coarse-gate pattern used throughout Tasks — see TaskListComponent.canManageTasks for why
 * "is this Manager's own project" can't be precomputed client-side). The server enforces the
 * real ownership rule and 403s a Manager who isn't actually the project's manager.
 *
 * @MENTIONS (new): typing "@" opens a dropdown of the task's own project members (reusing
 * ProjectService.getMembers — the same endpoint ProjectMembersComponent already uses, no new
 * backend call invented). Picking one inserts "@FirstName LastName " into the draft and records
 * their employee id. On submit, mentionedEmployeeIds is recomputed from whichever "@Full Name"
 * substrings still actually appear in the final text (so deleting a mention after inserting it
 * correctly drops it) and sent alongside the comment — see CreateTaskCommentDto's docblock and
 * PartFourBEChanges.md for why the backend doesn't act on this field yet (it needs to start
 * sending an email to each mentioned employee; the UI side is fully wired and forward-compatible
 * today regardless).
 */
import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TaskCommentService } from '../services/task-comment.service';
import { TaskCommentDto } from '../models/task-comment.model';
import { ProjectService } from '../../projects/services/project.service';
import { Employee } from '../../employees/models/employee.model';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError } from '../../../core/utils/api-error.util';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

const MAX_COMMENT_LENGTH = 1000;

interface CommentSegment {
  type: 'text' | 'mention';
  value: string;
}

@Component({
  selector: 'app-task-comments',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-comments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskCommentsComponent implements OnInit {
  private readonly taskCommentService = inject(TaskCommentService);
  private readonly projectService = inject(ProjectService);
  private readonly authService = inject(AuthService);
  private readonly confirmDialog = inject(ConfirmDialogService);

  readonly taskId    = input.required<number>();
  readonly projectId = input.required<number>();
  /** Set from ?commentId= on /tasks/:id — see TaskDetailComponent. Scrolls to and briefly
   *  highlights that comment once loaded, for the "take me to the mention" email link
   *  (PartNineBEChannges.md documents the backend side of that link). */
  readonly highlightCommentId = input<number | null>(null);

  @ViewChild('draftInput') draftInputRef?: ElementRef<HTMLTextAreaElement>;

  protected readonly comments = signal<TaskCommentDto[]>([]);
  protected readonly loading  = signal(true);
  protected readonly error    = signal<string | null>(null);

  /** Non-null for a few seconds right after load, to drive a temporary highlight style — see
   *  scrollToHighlighted(). */
  protected readonly activeHighlightId = signal<number | null>(null);

  protected readonly draft      = signal('');
  protected readonly posting    = signal(false);
  protected readonly deletingId = signal<number | null>(null);

  protected readonly maxLength = MAX_COMMENT_LENGTH;

  // ── @mention state ────────────────────────────────────────────────────
  protected readonly projectMembers = signal<Employee[]>([]);
  protected readonly mentionQuery   = signal<string | null>(null); // null = not in mention mode
  protected readonly mentionResults = signal<Employee[]>([]);
  private mentionStart = -1; // index of the "@" that opened the current mention

  private readonly canManageTasks = ['Admin', 'Manager'].includes(this.authService.getUserRole());
  private readonly currentUserId  = this.authService.currentUser()?.id;

  ngOnInit(): void {
    this.taskCommentService.getAll(this.taskId()).subscribe({
      next: comments => {
        this.comments.set(comments);
        this.loading.set(false);
        this.scrollToHighlighted();
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });

    // Loaded eagerly (not lazily on first "@") so the dropdown appears instantly the first time
    // someone types "@" instead of showing a loading flicker mid-mention.
    this.projectService.getMembers(this.projectId()).subscribe({
      next: members => this.projectMembers.set(members)
    });
  }

  /** Scrolls to and briefly highlights the comment named by highlightCommentId(), if it's
   *  actually present in what just loaded (it may not be — e.g. the comment was deleted after
   *  the mention email was sent). Runs once per component instance, right after the initial
   *  load; not tied to a signal effect since there's nothing to re-run for. */
  private scrollToHighlighted(): void {
    const id = this.highlightCommentId();
    if (id === null || !this.comments().some(c => c.id === id)) return;

    this.activeHighlightId.set(id);
    queueMicrotask(() => {
      document.getElementById(`comment-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    setTimeout(() => this.activeHighlightId.set(null), 3000);
  }

  canDelete(comment: TaskCommentDto): boolean {
    return comment.authorId === this.currentUserId || this.canManageTasks;
  }

  /** Renders comment text as safe segments (plain interpolation, never innerHTML) so a
   *  "@Full Name" that matches an actual project member can be bolded without treating any part
   *  of the comment's free-text as markup. */
  renderSegments(text: string): CommentSegment[] {
    const members = this.projectMembers();
    if (members.length === 0) return [{ type: 'text', value: text }];

    const names = members
      .map(m => `${m.firstName} ${m.lastName}`)
      .sort((a, b) => b.length - a.length); // longest-first so "Jo Smith" doesn't shadow "Jo Smith Jr"

    const pattern = new RegExp(`@(${names.map(escapeRegExp).join('|')})\\b`, 'g');
    const segments: CommentSegment[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
      }
      segments.push({ type: 'mention', value: match[0] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ type: 'text', value: text.slice(lastIndex) });
    }
    return segments;
  }

  /**
   * Fires on every keystroke. Looks backward from the caret for an unclosed "@word" — if found,
   * that's the active mention query; typing a space or deleting past the "@" closes it.
   */
  onDraftInput(textarea: HTMLTextAreaElement): void {
    this.draft.set(textarea.value);

    const caret = textarea.selectionStart ?? textarea.value.length;
    const upToCaret = textarea.value.slice(0, caret);
    const atIndex = upToCaret.lastIndexOf('@');

    if (atIndex === -1) {
      this.closeMentionMenu();
      return;
    }

    const between = upToCaret.slice(atIndex + 1);
    if (/\s/.test(between)) {
      this.closeMentionMenu();
      return;
    }

    this.mentionStart = atIndex;
    this.mentionQuery.set(between);
    const query = between.toLowerCase();
    this.mentionResults.set(
      this.projectMembers()
        .filter(m => `${m.firstName} ${m.lastName}`.toLowerCase().includes(query))
        .slice(0, 6)
    );
  }

  selectMention(member: Employee): void {
    const textarea = this.draftInputRef?.nativeElement;
    const fullName = `${member.firstName} ${member.lastName}`;
    const current = this.draft();
    const mentionEnd = this.mentionStart + 1 + (this.mentionQuery() ?? '').length;

    const before = current.slice(0, this.mentionStart);
    const after = current.slice(mentionEnd);
    const inserted = `@${fullName} `;
    const next = `${before}${inserted}${after}`;

    this.draft.set(next);
    this.closeMentionMenu();

    if (textarea) {
      const caretPos = before.length + inserted.length;
      queueMicrotask(() => {
        textarea.focus();
        textarea.setSelectionRange(caretPos, caretPos);
      });
    }
  }

  private closeMentionMenu(): void {
    this.mentionQuery.set(null);
    this.mentionResults.set([]);
    this.mentionStart = -1;
  }

  addComment(): void {
    const text = this.draft().trim();
    if (!text || this.posting()) return;

    // Recomputed from the FINAL text rather than trusted from selectMention()'s running tally —
    // if the user deletes/edits a mention after inserting it, it should stop notifying that
    // employee.
    const mentionedEmployeeIds = this.projectMembers()
      .filter(m => text.includes(`@${m.firstName} ${m.lastName}`))
      .map(m => m.id);

    this.posting.set(true);
    this.taskCommentService.add(this.taskId(), { text, mentionedEmployeeIds }).subscribe({
      next: comment => {
        this.comments.update(list => [...list, { ...comment, mentionedEmployeeIds }]);
        this.draft.set('');
        this.posting.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(err.message);
        this.posting.set(false);
      }
    });
  }

  async deleteComment(comment: TaskCommentDto): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Delete Comment',
      message: 'Delete this comment? This action cannot be undone.',
      confirmText: 'Delete',
      confirmClass: 'btn-danger',
      icon: 'bi-trash3',
      iconColor: 'text-danger'
    });
    if (!confirmed) return;

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

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
