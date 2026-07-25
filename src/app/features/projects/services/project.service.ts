import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Project, CreateProjectDto } from '../models/project.model';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/projects`;

  getAll(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  getById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateProjectDto): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, dto);
  }

  update(id: number, dto: Partial<CreateProjectDto>): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
