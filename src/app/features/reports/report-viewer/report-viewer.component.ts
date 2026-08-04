import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ReportService, ReportDefinition } from '../services/report.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [LoaderComponent],
  templateUrl: './report-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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
