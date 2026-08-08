import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { SortableHeaderComponent } from '../sortable-header/sortable-header.component';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [SortableHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html'
})
export class TableComponent {
  readonly columns = input<TableColumn[]>([]);
  readonly rows    = input<Record<string, unknown>[]>([]);
  readonly loading = input<boolean>(false);
  readonly emptyMessage = input<string>('No records found.');

  /** Only meaningful for columns with `sortable: true` — see SortableHeaderComponent. */
  readonly sortBy = input<string | null>(null);
  readonly sortDirection = input<'asc' | 'desc'>('asc');
  readonly sortChange = output<string>();
}
