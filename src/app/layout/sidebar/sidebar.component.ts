import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavItem {
  label:  string;
  icon:   string;
  route:  string;
  badge?: number;
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
        { label: 'Employees',   icon: 'bi-people-fill',    route: '/employees',  badge: 248 },
        { label: 'Projects',    icon: 'bi-kanban-fill',    route: '/projects' },
        { label: 'Tasks',       icon: 'bi-check2-square',  route: '/tasks' }
      ]
    },
    {
      heading: 'HR & Finance',
      items: [
        { label: 'Departments', icon: 'bi-diagram-3-fill', route: '/departments' },
        { label: 'Payroll',     icon: 'bi-cash-coin',      route: '/payroll' },
        { label: 'Reports',     icon: 'bi-bar-chart-fill', route: '/reports' }
      ]
    },
    {
      heading: 'System',
      items: [
        { label: 'Settings', icon: 'bi-gear-fill', route: '/settings' }
      ]
    }
  ];

  close(): void {
    this.closeRequested.emit();
  }
}
