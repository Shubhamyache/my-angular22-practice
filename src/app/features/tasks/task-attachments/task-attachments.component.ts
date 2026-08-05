/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK ATTACHMENTS — file list, embedded on Task Detail
 * ═══════════════════════════════════════════════════════════════════
 * PartTwoUIIntegration.md §11. Same visibility/delete-permission reasoning as
 * TaskCommentsComponent — see that file's docblock.
 */
import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TaskAttachmentService } from '../services/task-attachment.service';
import { TaskAttachmentDto } from '../models/task-attachment.model';
import { AuthService } from '../../../core/services/auth.service';
import { ApiError, getFieldError } from '../../../core/utils/api-error.util';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip'
];

@Component({
  selector: 'app-task-attachments',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-attachments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TaskAttachmentsComponent implements OnInit {
  private readonly taskAttachmentService = inject(TaskAttachmentService);
  private readonly authService = inject(AuthService);

  readonly taskId = input.required<number>();

  protected readonly attachments = signal<TaskAttachmentDto[]>([]);
  protected readonly loading     = signal(true);
  protected readonly error       = signal<string | null>(null);
  protected readonly uploading   = signal(false);
  protected readonly downloadingId = signal<number | null>(null);
  protected readonly deletingId    = signal<number | null>(null);

  private readonly canManageTasks = ['Admin', 'Manager'].includes(this.authService.getUserRole());
  private readonly currentUserId  = this.authService.currentUser()?.id;

  ngOnInit(): void {
    this.taskAttachmentService.getAll(this.taskId()).subscribe({
      next: attachments => {
        this.attachments.set(attachments);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  canDelete(attachment: TaskAttachmentDto): boolean {
    return attachment.uploadedById === this.currentUserId || this.canManageTasks;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  iconFor(contentType: string): string {
    if (contentType.startsWith('image/')) return 'bi-file-image';
    if (contentType === 'application/pdf') return 'bi-file-pdf';
    if (contentType.includes('word')) return 'bi-file-word';
    if (contentType.includes('sheet') || contentType.includes('excel')) return 'bi-file-excel';
    if (contentType === 'application/zip') return 'bi-file-zip';
    return 'bi-file-earmark';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.error.set(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.error.set(`"${file.name}" isn't an allowed file type.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.error.set(`"${file.name}" is larger than the 10MB limit.`);
      return;
    }

    this.uploading.set(true);
    this.taskAttachmentService.upload(this.taskId(), file).subscribe({
      next: attachment => {
        this.attachments.update(list => [...list, attachment]);
        this.uploading.set(false);
      },
      error: (err: ApiError) => {
        this.error.set(getFieldError(err.fieldErrors, 'file') ?? err.message);
        this.uploading.set(false);
      }
    });
  }

  download(attachment: TaskAttachmentDto): void {
    this.downloadingId.set(attachment.id);
    this.taskAttachmentService.download(this.taskId(), attachment.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.fileName;
        a.click();
        window.URL.revokeObjectURL(url);
        this.downloadingId.set(null);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.downloadingId.set(null);
      }
    });
  }

  deleteAttachment(attachment: TaskAttachmentDto): void {
    if (!confirm(`Delete "${attachment.fileName}"?`)) return;

    this.deletingId.set(attachment.id);
    this.taskAttachmentService.delete(this.taskId(), attachment.id).subscribe({
      next: () => {
        this.attachments.update(list => list.filter(a => a.id !== attachment.id));
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null)
    });
  }
}
