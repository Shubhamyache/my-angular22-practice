import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Task, CreateTaskDto } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  getAll(projectId?: number): Observable<Task[]> {
    const params = projectId
      ? new HttpParams().set('projectId', projectId)
      : undefined;
    return this.http.get<Task[]>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, dto);
  }

  update(id: number, dto: Partial<CreateTaskDto>): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
