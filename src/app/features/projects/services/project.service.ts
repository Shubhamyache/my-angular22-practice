/**
 * ═══════════════════════════════════════════════════════════════════
 * PROJECT SERVICE — Data Access Layer with Mock Data
 * ═══════════════════════════════════════════════════════════════════
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Project, CreateProjectDto } from '../models/project.model';
import { MockDataService } from '../../../core/services/mock-data.service';
import { MOCK_PROJECTS } from '../data/mock-projects.data';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly mockService = inject(MockDataService);
  private projects = [...MOCK_PROJECTS];

  getAll(): Observable<Project[]> {
    return this.mockService.getAll(this.projects);
  }

  getById(id: number): Observable<Project> {
    return this.mockService.getById(this.projects, id);
  }

  create(dto: CreateProjectDto): Observable<Project> {
    const newProject: Partial<Project> = {
      ...dto,
      status: 'Active',
      progress: 0,
      spent: 0,
      teamSize: 1,
      tags: []
    };
    return this.mockService.create(this.projects, newProject);
  }

  update(id: number, dto: Partial<CreateProjectDto>): Observable<Project> {
    return this.mockService.update(this.projects, id, dto as any) as Observable<Project>;
  }

  delete(id: number): Observable<void> {
    return this.mockService.delete(this.projects, id);
  }

  search(query: string): Observable<Project[]> {
    return this.mockService.search(
      this.projects,
      query,
      (proj, q) => {
        const searchable = [
          proj.name,
          proj.code,
          proj.description,
          proj.managerName,
          ...proj.tags
        ].join(' ').toLowerCase();
        return searchable.includes(q);
      }
    );
  }
}
