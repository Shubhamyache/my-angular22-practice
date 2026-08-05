import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ReportService } from '../services/report.service';
import { ReportDto } from '../models/report.model';
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

  protected readonly reports = signal<ReportDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error   = signal<string | null>(null);
  protected readonly generatingId = signal<string | null>(null);
  // Separate from `error` (which gates the whole page's loading/error/list state) so a failed
  // PDF generation shows a small inline notice without hiding the entire report grid.
  protected readonly generateError = signal<string | null>(null);

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

  /**
   * NOTE: `payroll-history` requires an `employeeId` parameter (UIIntegrationInfo.md §4) that
   * this screen has no input for — clicking Generate for that report will surface the
   * backend's 400 "employeeId parameter is required" via `error()` below, same as any other
   * validation failure. Not silently special-cased or hidden — there's simply no parameter
   * UI to build here without adding a new component, which is out of scope for this migration.
   */
  generateReport(reportId: string): void {
    if (this.generatingId()) return;
    this.generatingId.set(reportId);
    this.generateError.set(null);

    this.reportService.generate(reportId, { parameters: null }).subscribe({
      next: ({ blob, filename }) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.generatingId.set(null);
      },
      error: (err: Error) => {
        this.generateError.set(err.message);
        this.generatingId.set(null);
      }
    });
  }
}
