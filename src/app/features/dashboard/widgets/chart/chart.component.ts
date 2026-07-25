import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chart',
  standalone: true,
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-header bg-white border-0 fw-semibold pb-0 pt-3 px-4">
        <i class="bi bi-bar-chart-line me-2 text-primary"></i>{{ title() }}
      </div>
      <div class="card-body d-flex flex-column align-items-center justify-content-center py-5">
        <i class="bi bi-graph-up-arrow display-4 text-primary opacity-25 mb-3"></i>
        <p class="text-muted small mb-0">Chart placeholder</p>
        <small class="text-muted">Connect Chart.js or ngx-charts here</small>
      </div>
    </div>
  `
})
export class ChartComponent {
  readonly title = input<string>('Chart');
}
