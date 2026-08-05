/**
 * PartTwoUIIntegration.md §11. Upload/download follow the same disk-storage mechanics as avatar
 * upload (settings/services/user-profile.service.ts) and Reports PDF download
 * (UIIntegrationInfo.md §12) respectively — see those for the underlying rationale.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TaskAttachmentDto } from '../models/task-attachment.model';

@Injectable({ providedIn: 'root' })
export class TaskAttachmentService {
  private readonly http = inject(HttpClient);

  private url(taskId: number): string {
    return `${environment.apiUrl}/tasks/${taskId}/attachments`;
  }

  getAll(taskId: number): Observable<TaskAttachmentDto[]> {
    return this.http
      .get<ApiResponse<TaskAttachmentDto[]>>(this.url(taskId))
      .pipe(map(res => res.data));
  }

  /** Do not set a Content-Type header — HttpClient sets the multipart boundary automatically
   *  for a FormData body (same caveat as avatar upload). */
  upload(taskId: number, file: File): Observable<TaskAttachmentDto> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<ApiResponse<TaskAttachmentDto>>(this.url(taskId), formData)
      .pipe(map(res => res.data));
  }

  /** Attachments are NOT served as static files (unlike avatars) — the same task-visibility
   *  check gates every download, so this always goes through the API, not a direct URL. */
  download(taskId: number, attachmentId: number): Observable<Blob> {
    return this.http.get(`${this.url(taskId)}/${attachmentId}/download`, { responseType: 'blob' });
  }

  delete(taskId: number, attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.url(taskId)}/${attachmentId}`);
  }
}
