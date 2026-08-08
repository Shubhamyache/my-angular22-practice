import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

/**
 * Decorates a real `<th>` — `<th [appSortableHeader]="'lastName'" ...>Name</th>` — with a
 * click-to-sort header, following the same icon vocabulary as ProjectListComponent's existing
 * sort dropdown (bi-sort-up / bi-sort-down / bi-arrow-down-up). Only emits the clicked key on
 * `sortChange`; toggle-vs-reset direction logic stays with the caller (store or component), the
 * same single-source-of-truth convention ProjectStore.setSorting already uses — this avoids two
 * places independently deciding "asc or desc".
 */
@Component({
  selector: 'th[appSortableHeader]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sortable-header.component.html',
  styleUrl: './sortable-header.component.scss',
  host: {
    '[class.sortable-header--active]': 'active()',
    '(click)': 'toggle()',
    '(keydown.enter)': 'toggle()',
    '(keydown.space)': 'toggle(); $event.preventDefault()',
    'role': 'columnheader',
    'tabindex': '0'
  }
})
export class SortableHeaderComponent {
  readonly appSortableHeader = input.required<string>();
  readonly sortBy = input<string | null>(null);
  readonly sortDirection = input<'asc' | 'desc'>('asc');
  readonly sortChange = output<string>();

  protected readonly active = computed(() => this.sortBy() === this.appSortableHeader());

  toggle(): void {
    this.sortChange.emit(this.appSortableHeader());
  }
}
