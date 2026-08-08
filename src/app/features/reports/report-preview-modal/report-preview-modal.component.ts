import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TableColumn, TableComponent } from '../../../shared/components/table/table.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ReportService } from '../services/report.service';
import { ReportExportFormat, ReportPreviewDto } from '../models/report.model';

/**
 * Preview-before-download modal for a report: fetches the exact same dataset
 * ReportService.generate() would export (ReportService.preview(), no ReportExecutions row logged
 * server-side for a preview) and renders it client-side paginated via the existing shared
 * app-table/app-pagination components. The two download buttons in the footer call generate()
 * with the same (reportId, parameters) and differ only in `format`, guaranteeing the download
 * matches what was just previewed.
 */
@Component({
  selector: 'app-report-preview-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, TableComponent, PaginationComponent],
  templateUrl: './report-preview-modal.component.html'
})
export class ReportPreviewModalComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  readonly reportId = input.required<string>();
  readonly reportName = input.required<string>();
  readonly closed = output<void>();

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly preview = signal<ReportPreviewDto | null>(null);

  protected readonly downloadingFormat = signal<ReportExportFormat | null>(null);
  protected readonly downloadError = signal<string | null>(null);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);

  protected readonly sortColumn = signal<string | null>(null);
  protected readonly sortDirection = signal<'asc' | 'desc'>('asc');

  protected readonly columns = computed<TableColumn[]>(() =>
    (this.preview()?.headers ?? []).map((label, i) => ({ key: String(i), label, sortable: true }))
  );

  protected readonly totalRows = computed(() => this.preview()?.rows.length ?? 0);

  /** Sorted once here, then sliced for pagination below — sorting always applies to the full
   *  dataset, not just the currently visible page. */
  protected readonly sortedRows = computed(() => {
    const rows = this.preview()?.rows ?? [];
    const col = this.sortColumn();
    if (col === null) return rows;

    const index = Number(col);
    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) =>
      (a[index] ?? '').localeCompare(b[index] ?? '', undefined, { numeric: true, sensitivity: 'base' }) * direction
    );
  });

  protected readonly pagedRows = computed<Record<string, unknown>[]>(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.sortedRows().slice(start, start + this.pageSize()).map(row => {
      const record: Record<string, unknown> = {};
      row.forEach((cell, i) => (record[String(i)] = cell));
      return record;
    });
  });

  ngOnInit(): void {
    this.reportService.preview(this.reportId(), { parameters: null }).subscribe({
      next: data => {
        this.preview.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  download(format: ReportExportFormat): void {
    if (this.downloadingFormat()) return;
    this.downloadingFormat.set(format);
    this.downloadError.set(null);

    this.reportService.generate(this.reportId(), { parameters: null }, format).subscribe({
      next: ({ blob, filename }) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        this.downloadingFormat.set(null);
      },
      error: (err: Error) => {
        this.downloadError.set(err.message);
        this.downloadingFormat.set(null);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onSortChange(columnKey: string): void {
    if (this.sortColumn() === columnKey) {
      this.sortDirection.update(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(columnKey);
      this.sortDirection.set('asc');
    }
    this.currentPage.set(1);
  }

  close(): void {
    this.closed.emit();
  }
}
