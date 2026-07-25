import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  readonly isOpen = input<boolean>(true);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard',   icon: 'bi-speedometer2',   route: '/dashboard' },
    { label: 'Employees',   icon: 'bi-people-fill',    route: '/employees' },
    { label: 'Departments', icon: 'bi-diagram-3-fill', route: '/departments' },
    { label: 'Payroll',     icon: 'bi-cash-coin',      route: '/payroll' },
    { label: 'Reports',     icon: 'bi-bar-chart-fill', route: '/reports' }
  ];
}
