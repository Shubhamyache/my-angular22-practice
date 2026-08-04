import { ChangeDetectionStrategy, Component, input } from '@angular/core';

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
 * CHANGE DETECTION — input() signals:
 * ─────────────────────────────────────
 * All inputs are Signal Inputs. When the parent writes:
 *   [loading]="false"  →  [value]="248"
 * Angular detects the signal change and re-renders ONLY this component's
 * template — not the parent or siblings. This is "fine-grained" change
 * detection vs zone.js's "check everything".
 */
@Component({
  selector: 'app-stats-card',
  standalone: true,
  templateUrl: './stats-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatsCardComponent {
  readonly loading = input<boolean>(false);          // NEW: skeleton mode
  readonly label   = input<string>('');
  readonly value   = input<string | number>('');
  readonly icon    = input<string>('bi-bar-chart');
  readonly color   = input<string>('primary');
  readonly change  = input<number | null>(null);
}
