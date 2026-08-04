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

  ngOnInit(): void {
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
}
