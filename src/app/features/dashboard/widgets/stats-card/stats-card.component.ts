import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  template: `
    <div class="card border-0 shadow-sm h-100">
      <div class="card-body d-flex align-items-center gap-3 p-3">
        <div
          class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          [style]="'width:52px;height:52px;background:var(--bs-' + color() + '-bg-subtle, rgba(13,110,253,0.1))'">
          <i [class]="'bi ' + icon() + ' fs-4 text-' + color()"></i>
        </div>
        <div class="overflow-hidden">
          <div class="text-muted small text-truncate">{{ label() }}</div>
          <div class="fs-3 fw-bold lh-1 my-1">{{ value() }}</div>
          @if (change() !== null) {
            <div class="small"
              [class.text-success]="change()! > 0"
              [class.text-danger]="change()! < 0"
              [class.text-muted]="change() === 0">
              @if (change()! > 0) {
                <i class="bi bi-arrow-up-short"></i>{{ change() }}%
              } @else if (change()! < 0) {
                <i class="bi bi-arrow-down-short"></i>{{ change()! * -1 }}%
              } @else {
                <i class="bi bi-dash"></i> No change
              }
              <span class="text-muted ms-1">this month</span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class StatsCardComponent {
  readonly label  = input<string>('');
  readonly value  = input<string | number>('');
  readonly icon   = input<string>('bi-bar-chart');
  readonly color  = input<string>('primary');
  readonly change = input<number | null>(null);
}
