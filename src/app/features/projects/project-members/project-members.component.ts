/**
 * ═══════════════════════════════════════════════════════════════════
 * PROJECT MEMBERS COMPONENT — Manage Team
 * ═══════════════════════════════════════════════════════════════════
 * The backend's `getMembers`/`addMember`/`removeMember` endpoints (UIIntegrationInfo.md §4
 * "Projects") were already wired into ProjectService during the backend integration migration,
 * but no screen ever called them — the "Manage Team" button on project-detail had nowhere to
 * go. This is that screen.
 *
 * Route guard only checks the Admin/Manager role coarsely; a Manager who isn't the owner of
 * THIS specific project gets a 403 from POST/DELETE (UIIntegrationInfo.md §13's "own-managed
 * only" scoping can't be expressed in a route guard) — surfaced via the shared error toast.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { ProjectService } from '../services/project.service';
import { Project } from '../models/project.model';
import { Employee } from '../../employees/models/employee.model';
import { EmployeeService } from '../../employees/services/employee.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ConfirmDialogService } from '../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-project-members',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, LoaderComponent],
  templateUrl: './project-members.component.html'
})
export class ProjectMembersComponent implements OnInit {
  private readonly projectService  = inject(ProjectService);
  private readonly employeeService = inject(EmployeeService);
  private readonly route           = inject(ActivatedRoute);
  private readonly router          = inject(Router);
  private readonly confirmDialog   = inject(ConfirmDialogService);

  private projectId = 0;

  protected readonly project = signal<Project | null>(null);
  protected readonly members = signal<Employee[]>([]);
  protected readonly loading = signal(true);
  protected readonly error   = signal<string | null>(null);

  protected readonly searchQuery   = signal('');
  protected readonly searchResults = signal<Employee[]>([]);
  protected readonly searching     = signal(false);
  protected readonly addingId      = signal<number | null>(null);
  protected readonly removingId    = signal<number | null>(null);

  private readonly search$ = new Subject<string>();

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid project ID');
      this.loading.set(false);
      return;
    }
    this.projectId = Number(id);
    this.loadProjectAndMembers();

    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => {
          if (!query.trim()) return [];
          this.searching.set(true);
          return this.employeeService.search(query);
        })
      )
      .subscribe({
        next: results => {
          const memberIds = new Set(this.members().map(m => m.id));
          this.searchResults.set(results.filter(e => !memberIds.has(e.id)));
          this.searching.set(false);
        },
        error: () => this.searching.set(false)
      });
  }

  private loadProjectAndMembers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.projectService.getById(this.projectId).subscribe({
      next: project => {
        this.project.set(project);
        this.projectService.getMembers(this.projectId).subscribe({
          next: members => {
            this.members.set(members);
            this.loading.set(false);
          },
          error: (err: Error) => {
            this.error.set(err.message);
            this.loading.set(false);
          }
        });
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value);
    if (!value.trim()) {
      this.searchResults.set([]);
    }
  }

  addMember(employee: Employee): void {
    this.addingId.set(employee.id);
    this.projectService.addMember(this.projectId, { employeeId: employee.id }).subscribe({
      next: () => {
        this.members.update(list => [...list, employee]);
        this.searchResults.update(list => list.filter(e => e.id !== employee.id));
        this.addingId.set(null);
      },
      error: () => this.addingId.set(null)
    });
  }

  async removeMember(employee: Employee): Promise<void> {
    const confirmed = await this.confirmDialog.confirm({
      title: 'Remove Member',
      message: `Remove ${employee.firstName} ${employee.lastName} from this project?`,
      confirmText: 'Remove',
      confirmClass: 'btn-danger',
      icon: 'bi-person-dash',
      iconColor: 'text-danger'
    });
    if (!confirmed) return;

    this.removingId.set(employee.id);
    this.projectService.removeMember(this.projectId, employee.id).subscribe({
      next: () => {
        this.members.update(list => list.filter(m => m.id !== employee.id));
        this.removingId.set(null);
      },
      error: () => this.removingId.set(null)
    });
  }

  onBack(): void {
    this.router.navigate(['/projects', this.projectId]);
  }
}
