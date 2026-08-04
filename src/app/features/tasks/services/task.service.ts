/**
 * ═══════════════════════════════════════════════════════════════════
 * TASK SERVICE — Data Access Layer with Mock Data
 * ═══════════════════════════════════════════════════════════════════
 */

import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Task, CreateTaskDto } from '../models/task.model';
import { MockDataService } from '../../../core/services/mock-data.service';
import { MOCK_TASKS } from '../data/mock-tasks.data';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly mockService = inject(MockDataService);
  private tasks = [...MOCK_TASKS];

  getAll(projectId?: number): Observable<Task[]> {
    return this.mockService.getAll(this.tasks).pipe(
      map(allTasks => projectId
        ? allTasks.filter(t => t.projectId === projectId)
        : allTasks
      )
    );
  }

  getById(id: number): Observable<Task> {
    return this.mockService.getById(this.tasks, id);
  }

  create(dto: CreateTaskDto): Observable<Task> {
    const newTask: Partial<Task> = {
      ...dto,
      status: 'Todo',
      loggedHours: 0,
      tags: [],
      createdAt: new Date().toISOString().split('T')[0],
      // These would come from related data lookups in real app
      projectName: 'Unknown Project',
      assigneeName: 'Unknown User',
      assigneeInitial: 'U'
    };
    return this.mockService.create(this.tasks, newTask);
  }

  update(id: number, dto: Partial<CreateTaskDto>): Observable<Task> {
    return this.mockService.update(this.tasks, id, dto as any) as Observable<Task>;
  }

  delete(id: number): Observable<void> {
    return this.mockService.delete(this.tasks, id);
  }

  search(query: string): Observable<Task[]> {
    return this.mockService.search(
      this.tasks,
      query,
      (task, q) => {
        const searchable = [
          task.title,
          task.description,
          task.projectName,
          task.assigneeName,
          ...task.tags
        ].join(' ').toLowerCase();
        return searchable.includes(q);
      }
    );
  }
}
