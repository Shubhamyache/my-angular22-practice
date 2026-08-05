/**
 * ═══════════════════════════════════════════════════════════════════
 * PROJECT SERVICE — real backend integration
 * ═══════════════════════════════════════════════════════════════════
 *
 * ⚠️ KNOWN TRADEOFF: `getAll()` fetches a single page of up to 100 projects and returns it as
 * a flat array, because `ProjectStore.filteredProjects`/`stats` (project.store.ts) are built as
 * `computed()` signals over the FULL in-memory project list — an architecture carried over
 * unchanged from the mock-data version per this migration's "preserve the UI, don't redesign"
 * constraint. Unlike Tasks, the real `GET /projects` endpoint has no unpaginated "fetch
 * everything" mode (UIIntegrationInfo.md §6) — `pageSize` is capped at 100 server-side. For an
 * org with more than 100 projects, this store would silently show only the first 100. Migrating
 * ProjectStore to server-side pagination/filtering (the backend fully supports it —
 * `ProjectListFilter`) is the correct long-term fix, but is a store-architecture change outside
 * this migration's scope; flagging it here rather than quietly working around it.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse } from '../../../core/models/api-response.model';
import { Employee } from '../../employees/models/employee.model';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  Project,
  ProjectListFilter,
  UpdateProjectDto
} from '../models/project.model';

function buildParams(filter: ProjectListFilter): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  getAll(): Observable<Project[]> {
    return this.http
      .get<PagedResponse<Project>>(this.baseUrl, { params: buildParams({ page: 1, pageSize: 100 }) })
      .pipe(map(res => res.data));
  }

  getPaged(filter: ProjectListFilter): Observable<PagedResponse<Project>> {
    return this.http.get<PagedResponse<Project>>(this.baseUrl, { params: buildParams(filter) });
  }

  getById(id: number): Observable<Project> {
    return this.http
      .get<ApiResponse<Project>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  create(dto: CreateProjectDto): Observable<Project> {
    return this.http
      .post<ApiResponse<Project>>(this.baseUrl, dto)
      .pipe(map(res => res.data));
  }

  update(id: number, dto: UpdateProjectDto): Observable<Project> {
    return this.http
      .put<ApiResponse<Project>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map(res => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getMembers(id: number): Observable<Employee[]> {
    return this.http
      .get<ApiResponse<Employee[]>>(`${this.baseUrl}/${id}/members`)
      .pipe(map(res => res.data));
  }

  addMember(id: number, dto: AddProjectMemberDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/members`, dto);
  }

  removeMember(id: number, employeeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/members/${employeeId}`);
  }

  search(query: string): Observable<Project[]> {
    return this.getPaged({ search: query, page: 1, pageSize: 100 }).pipe(map(res => res.data));
  }
}
