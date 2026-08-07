/**
 * Talks to the (not-yet-built, see PartNineBEChannges.md) POST/GET /tasks/{id}/time-logs
 * endpoints. Mirrors TaskCommentService/TaskAttachmentService's shape — a small per-task
 * sub-resource service, not folded into TaskService itself.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { LogTaskTimeDto, TaskTimeLogDto } from '../models/task-time-log.model';

@Injectable({ providedIn: 'root' })
export class TaskTimeLogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = (taskId: number) => `${environment.apiUrl}/tasks/${taskId}/time-logs`;

  getAll(taskId: number): Observable<TaskTimeLogDto[]> {
    return this.http
      .get<ApiResponse<TaskTimeLogDto[]>>(this.baseUrl(taskId))
      .pipe(map(res => res.data));
  }

  log(taskId: number, dto: LogTaskTimeDto): Observable<TaskTimeLogDto> {
    return this.http
      .post<ApiResponse<TaskTimeLogDto>>(this.baseUrl(taskId), dto)
      .pipe(map(res => res.data));
  }
}
