import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { PayrollService } from '../services/payroll.service';
import { Payroll } from '../models/payroll.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { CurrencyFormatPipe } from '../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-payroll-list',
  standalone: true,
  imports: [LoaderComponent, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './payroll-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PayrollListComponent implements OnInit {
  private readonly payrollService = inject(PayrollService);

  protected readonly payrolls = signal<Payroll[]>([]);
  protected readonly loading  = signal(true);
  protected readonly error    = signal<string | null>(null);

  // "Run Payroll" button state — POST /payroll/generate now exists (UIIntegrationInfo.md §4)
  // but this screen has no date-range picker UI to choose a period, so — without adding any
  // new UI element, per this migration's constraints — the button runs payroll for the
  // current calendar month, computed client-side.
  protected readonly generating = signal(false);
  protected readonly generateResult = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPayrolls();
  }

  private loadPayrolls(): void {
    this.loading.set(true);
    this.payrollService.getAll().subscribe({
      next: data => {
        this.payrolls.set(data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  runPayroll(): void {
    if (this.generating()) return;

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    this.generating.set(true);
    this.generateResult.set(null);
    this.error.set(null);

    this.payrollService.generate({ periodStart, periodEnd }).subscribe({
      next: result => {
        this.generateResult.set(
          `Generated ${result.generatedCount} payroll run${result.generatedCount === 1 ? '' : 's'}` +
          (result.skippedCount > 0 ? ` (${result.skippedCount} already existed for this period).` : '.')
        );
        this.generating.set(false);
        this.loadPayrolls();
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.generating.set(false);
      }
    });
  }

  process(id: number): void {
    this.payrollService.process(id).subscribe({
      next: updated => {
        this.payrolls.update(list => list.map(p => (p.id === updated.id ? updated : p)));
      }
    });
  }
}
