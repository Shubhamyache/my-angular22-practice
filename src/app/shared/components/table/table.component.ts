import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html'
})
export class TableComponent {
  readonly columns = input<TableColumn[]>([]);
  readonly rows    = input<Record<string, unknown>[]>([]);
  readonly loading = input<boolean>(false);
  readonly emptyMessage = input<string>('No records found.');
}
