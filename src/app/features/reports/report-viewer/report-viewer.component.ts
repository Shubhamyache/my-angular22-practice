import { Component, OnInit, inject, signal } from '@angular/core';
import { ReportService, ReportDefinition } from '../services/report.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [LoaderComponent],
  template: `
    <div class="container-fluid py-2">
      <div class="mb-4">
        <h2 class="fw-bold mb-0">
          <i class="bi bi-bar-chart-fill me-2 text-info"></i>Reports
        </h2>
        <p class="text-muted small mb-0">Generate and export reports from the .NET 10 API</p>
      </div>

      @if (loading()) {
        <app-loader />
      } @else if (error()) {
        <div class="alert alert-danger">{{ error() }}</div>
      } @else {
        <div class="row g-4">
          @for (report of reports(); track report.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <div class="card border-0 shadow-sm h-100">
                <div class="card-body">
                  <div class="d-flex align-items-start gap-3">
                    <div class="rounded-circle p-2 bg-info bg-opacity-10 flex-shrink-0">
                      <i class="bi bi-file-earmark-bar-graph text-info fs-5"></i>
                    </div>
                    <div class="overflow-hidden">
                      <h6 class="fw-bold mb-1 text-truncate">{{ report.name }}</h6>
                      <p class="text-muted small mb-2">{{ report.description }}</p>
                      <span class="badge rounded-pill text-bg-info">{{ report.category }}</span>
                    </div>
                  </div>
                </div>
                <div class="card-footer bg-white border-0 pt-0">
                  <button
                    class="btn btn-outline-info btn-sm w-100"
                    (click)="generateReport(report.id)">
                    <i class="bi bi-download me-1"></i> Generate & Export PDF
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-12 text-center py-5 text-muted">
              <i class="bi bi-file-earmark-x display-6 d-block mb-2"></i>
              No reports available.
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ReportViewerComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  protected readonly reports = signal<ReportDefinition[]>([]);
  protected readonly loading = signal(true);
  protected readonly error   = signal<string | null>(null);

  ngOnInit(): void {
    this.reportService.getAvailable().subscribe({
      next: data => {
        this.reports.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  generateReport(reportId: string): void {
    this.reportService.generate(reportId, {}).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportId}-${Date.now()}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  }
}
