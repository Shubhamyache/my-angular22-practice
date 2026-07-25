import { Component, input } from '@angular/core';

/**
 * STATS CARD WIDGET
 * ==================
 * Displays a single KPI metric: label, value, icon, trend indicator.
 *
 * LOADING SKELETON:
 * ──────────────────
 * The `loading` input controls whether to show a placeholder skeleton
 * (Bootstrap placeholder-glow animation) or the real content.
 *
 * Bootstrap placeholder classes:
 *   .placeholder-glow  → parent container, makes children pulse
 *   .placeholder        → on any element, replaces it with a gray block
 *   .col-N              → controls width of the placeholder block
 *
 * WHY SKELETON instead of a spinner?
 *   ✓ Reduces perceived loading time (content shape is visible immediately)
 *   ✓ Prevents layout shift (element occupies the same space)
 *   ✓ Better UX: users know what content is coming
 *
 * CHANGE DETECTION — input() signals:
 * ─────────────────────────────────────
 * All inputs are Signal Inputs. When the parent writes:
 *   [loading]="false"  →  [value]="248"
 * Angular detects the signal change and re-renders ONLY this component's
 * template — not the parent or siblings.
 *
 * This is "fine-grained" change detection vs zone.js's "check everything".
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  template: `
    <!--
      @if / @else is Angular 17+ block syntax (replaces *ngIf directive).
      It compiles to less code and works directly with the signal graph.
      No structural directive overhead.
    -->
    @if (loading()) {
      <!-- ── Skeleton State ──────────────────────────────────────── -->
      <div class="card border-0 shadow-sm h-100 placeholder-glow">
        <div class="card-body d-flex align-items-center gap-3 p-3">
          <!-- Icon circle skeleton -->
          <div class="rounded-circle placeholder flex-shrink-0"
               style="width:52px;height:52px;"></div>
          <!-- Text skeletons -->
          <div class="flex-grow-1">
            <div class="placeholder rounded col-6 mb-2" style="height:11px;display:block;"></div>
            <div class="placeholder rounded col-9 mb-2" style="height:28px;display:block;"></div>
            <div class="placeholder rounded col-5"       style="height:11px;display:block;"></div>
          </div>
        </div>
      </div>

    } @else {
      <!-- ── Real Content ─────────────────────────────────────────── -->
      <div class="card border-0 shadow-sm h-100">
        <div class="card-body d-flex align-items-center gap-3 p-3">

          <!-- Icon circle (color-coded per KPI) -->
          <div
            class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            [style]="'width:52px;height:52px;background:var(--bs-' + color() + '-bg-subtle, rgba(13,110,253,0.1))'">
            <i [class]="'bi ' + icon() + ' fs-4 text-' + color()"></i>
          </div>

          <div class="overflow-hidden">
            <!-- Label -->
            <div class="text-muted small text-truncate">{{ label() }}</div>

            <!-- Value (large bold number) -->
            <div class="fs-3 fw-bold lh-1 my-1">{{ value() }}</div>

            <!-- Trend indicator -->
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
                <span class="text-muted ms-1">vs last month</span>
              </div>
            }
          </div>

        </div>
      </div>
    }
  `
})
export class StatsCardComponent {
  readonly loading = input<boolean>(false);          // NEW: skeleton mode
  readonly label   = input<string>('');
  readonly value   = input<string | number>('');
  readonly icon    = input<string>('bi-bar-chart');
  readonly color   = input<string>('primary');
  readonly change  = input<number | null>(null);
}
