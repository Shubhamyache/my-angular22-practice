/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK SERVICE — real backend integration
 * ═══════════════════════════════════════════════════════════════════
 * GET /tasks is dual-mode (UIIntegrationInfo.md §4/§6): omit `page`/`pageSize` entirely for a
 * full unpaginated result set (what TaskStore/Kanban board need for their existing
 * client-side computed() filtering), or supply both for normal server-side pagination.
 * `getAll(projectId?)` deliberately never sends page/pageSize, matching TaskStore's existing
 * "load everything, filter locally" design exactly — no tradeoff here, unlike Projects.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse } from '../../../core/models/api-response.model';
import {
  CreateTaskDto,
  PatchTaskStatusDto,
  Task,
  TaskListFilter,
  UpdateTaskDto
} from '../models/task.model';

function buildParams(filter: TaskListFilter): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  /** Full unpaginated fetch — no page/pageSize sent (see file header). */
  getAll(projectId?: number): Observable<Task[]> {
    const filter: TaskListFilter = projectId ? { projectId } : {};
    return this.http
      .get<PagedResponse<Task>>(this.baseUrl, { params: buildParams(filter) })
      .pipe(map(res => res.data));
  }

  /** Normal server-side-paginated fetch, for a future table-view migration off client-side paging. */
  getPaged(filter: TaskListFilter): Observable<PagedResponse<Task>> {
    return this.http.get<PagedResponse<Task>>(this.baseUrl, { params: buildParams(filter) });
  }

  getById(id: number): Observable<Task> {
    return this.http
      .get<ApiResponse<Task>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  create(dto: CreateTaskDto): Observable<Task> {
    return this.http
      .post<ApiResponse<Task>>(this.baseUrl, dto)
      .pipe(map(res => res.data));
  }

  update(id: number, dto: UpdateTaskDto): Observable<Task> {
    return this.http
      .put<ApiResponse<Task>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map(res => res.data));
  }

  patchStatus(id: number, dto: PatchTaskStatusDto): Observable<Task> {
    return this.http
      .patch<ApiResponse<Task>>(`${this.baseUrl}/${id}/status`, dto)
      .pipe(map(res => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  search(query: string): Observable<Task[]> {
    return this.getPaged({ search: query, page: 1, pageSize: 100 }).pipe(map(res => res.data));
  }
}
