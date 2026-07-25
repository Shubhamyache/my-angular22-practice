import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { StatsCardComponent } from './widgets/stats-card/stats-card.component';
import { ChartComponent } from './widgets/chart/chart.component';

interface DashboardStats {
  totalEmployees: number;
  activeDepartments: number;
  openPositions: number;
  monthlyPayrollLabel: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatsCardComponent, ChartComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly stats = signal<DashboardStats>({
    totalEmployees: 248,
    activeDepartments: 12,
    openPositions: 7,
    monthlyPayrollLabel: '$1.24M'
  });

  ngOnInit(): void {
    // In production: inject a DashboardService and call the .NET 10 API
  }
}
