import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/auth.model';

interface NavItem {
  label:  string;
  icon:   string;
  route:  string;
  badge?: number;
  /** Roles allowed to see this item. Omit for "visible to every authenticated role." */
  roles?: UserRole[];
}

interface NavGroup {
  heading: string;
  items:   NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly isOpen        = input<boolean>(true);
  readonly isMobile      = input<boolean>(false);
  readonly closeRequested = output<void>();

  private readonly authService = inject(AuthService);

  /**
   * Nav groups allow logical grouping of sidebar items.
   * Each group renders a section heading (when expanded)
   * followed by its nav links.
   */
  protected readonly navGroups: NavGroup[] = [
    {
      heading: 'Overview',
      items: [
        { label: 'Dashboard', icon: 'bi-speedometer2',   route: '/dashboard' }
      ]
    },
    {
      heading: 'Work',
      items: [
        // Employee directory: Admin/HR/Manager per UIIntegrationInfo.md §13 — Employee has no
        // directory access at all.
        { label: 'Employees',   icon: 'bi-people-fill',    route: '/employees',  badge: 248, roles: ['Admin', 'HR', 'Manager'] },
        { label: 'Projects',    icon: 'bi-kanban-fill',    route: '/projects' },
        { label: 'Tasks',       icon: 'bi-check2-square',  route: '/tasks' }
      ]
    },
    {
      heading: 'HR & Finance',
      items: [
        // Departments: Admin only. Not gated by a roleGuard at the route level (list/detail are
        // reachable by any role, matching the DEPARTMENT_ROUTES comment — only create/edit are
        // guarded), so this is a nav-visibility-only restriction, same pattern as Employees below.
        { label: 'Departments', icon: 'bi-diagram-3-fill', route: '/departments', roles: ['Admin'] },
        // Payroll: Admin/HR only per §13 (matches the existing roleGuard on the /payroll route).
        { label: 'Payroll',     icon: 'bi-cash-coin',      route: '/payroll', roles: ['Admin', 'HR'] },
        // Reports: Employee has zero access to the Reports controller per §4/§13.
        { label: 'Reports',     icon: 'bi-bar-chart-fill', route: '/reports', roles: ['Admin', 'HR', 'Manager'] }
      ]
    },
    {
      heading: 'System',
      items: [
        { label: 'Settings', icon: 'bi-gear-fill', route: '/settings' }
      ]
    }
  ];

  /** Role-filtered nav, recomputed whenever the decoded token's role changes (e.g. re-login). */
  protected readonly visibleNavGroups = computed<NavGroup[]>(() => {
    // Reading currentUser() here just to make this computed() re-run once /auth/me resolves on
    // app bootstrap — the actual role check below intentionally still uses the JWT (available
    // immediately on login, before /auth/me responds), not currentUser().role.
    this.authService.currentUser();
    const role = this.authService.getUserRole() as UserRole;

    return this.navGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item => !item.roles || item.roles.includes(role))
      }))
      .filter(group => group.items.length > 0);
  });

  close(): void {
    this.closeRequested.emit();
  }
}
