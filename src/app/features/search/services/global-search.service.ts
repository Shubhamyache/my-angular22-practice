/**
 * Fans a single query out to the three existing scoped search endpoints — no new backend work
 * needed, `EmployeeService.search`/`ProjectService.search`/`TaskService.search` already existed
 * (UIIntegrationInfo.md §4's `/employees/search`, and the `search` param on `/projects`/`/tasks`)
 * but nothing in the UI ever called them until now.
 *
 * Employee search is role-gated server-side to Admin/HR/Manager (§13 — "Employees: list/search"
 * is hidden entirely from Employee) — GlobalSearchComponent skips that call for an Employee
 * caller rather than firing a request that's guaranteed to 403.
 */
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EmployeeService } from '../../employees/services/employee.service';
import { ProjectService } from '../../projects/services/project.service';
import { TaskService } from '../../tasks/services/task.service';
import { Employee } from '../../employees/models/employee.model';
import { Project } from '../../projects/models/project.model';
import { Task } from '../../tasks/models/task.model';

export interface GlobalSearchResults {
  employees: Employee[];
  projects: Project[];
  tasks: Task[];
}

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly employeeService = inject(EmployeeService);
  private readonly projectService  = inject(ProjectService);
  private readonly taskService     = inject(TaskService);

  search(query: string, includeEmployees: boolean): Observable<GlobalSearchResults> {
    return forkJoin({
      employees: includeEmployees
        ? this.employeeService.search(query).pipe(catchError(() => of([] as Employee[])))
        : of([] as Employee[]),
      projects: this.projectService.search(query).pipe(catchError(() => of([] as Project[]))),
      tasks: this.taskService.search(query).pipe(catchError(() => of([] as Task[])))
    });
  }
}
