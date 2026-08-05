import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CreateTaskCommentDto, TaskCommentDto } from '../models/task-comment.model';

@Injectable({ providedIn: 'root' })
export class TaskCommentService {
  private readonly http = inject(HttpClient);

  private url(taskId: number): string {
    return `${environment.apiUrl}/tasks/${taskId}/comments`;
  }

  getAll(taskId: number): Observable<TaskCommentDto[]> {
    return this.http
      .get<ApiResponse<TaskCommentDto[]>>(this.url(taskId))
      .pipe(map(res => res.data));
  }

  add(taskId: number, dto: CreateTaskCommentDto): Observable<TaskCommentDto> {
    return this.http
      .post<ApiResponse<TaskCommentDto>>(this.url(taskId), dto)
      .pipe(map(res => res.data));
  }

  delete(taskId: number, commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.url(taskId)}/${commentId}`);
  }
}
