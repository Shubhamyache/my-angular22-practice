import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ReportService } from '../services/report.service';
import { ReportDto } from '../models/report.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ReportPreviewModalComponent } from '../report-preview-modal/report-preview-modal.component';

@Component({
  selector: 'app-report-viewer',
  standalone: true,
  imports: [LoaderComponent, ReportPreviewModalComponent],
  templateUrl: './report-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportViewerComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  protected readonly reports = signal<ReportDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly error   = signal<string | null>(null);

  /** The report currently open in the preview modal, or null when the modal is closed. Download
   *  itself (both PDF and Excel) now happens inside ReportPreviewModalComponent — see that
   *  component for the actual generate()/blob-download flow. */
  protected readonly selectedReport = signal<ReportDto | null>(null);

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
   * this screen has no input for — opening the preview for that report will surface the
   * backend's 400 "employeeId parameter is required" via the modal's own `error()`, same as any
   * other validation failure. Not silently special-cased or hidden — there's simply no parameter
   * UI to build here without adding a new component, which is out of scope for this migration.
   */
  openPreview(report: ReportDto): void {
    this.selectedReport.set(report);
  }

  closePreview(): void {
    this.selectedReport.set(null);
  }
}
