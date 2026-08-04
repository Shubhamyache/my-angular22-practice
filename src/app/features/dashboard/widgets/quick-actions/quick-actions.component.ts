import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuickAction } from '../../models/dashboard.model';

/**
 * QUICK ACTIONS WIDGET — Presentational Component
 *
 * Renders a responsive grid of navigation shortcut cards.
 * Each card navigates to a feature route via RouterLink.
 *
 * DESIGN DECISION: Why pass actions as input?
 * ─────────────────────────────────────────────
 * The action list could be defined inside this component (hardcoded).
 * Instead, we pass it as an input from the parent.
 *
 * Benefits:
 *  ✓ Parent controls what actions to show (can vary by user role later)
 *  ✓ Component is generic — reusable for any set of quick actions
 *  ✓ Easy to test: just pass mock QuickAction[] array
 *  ✓ Future: filter actions based on user permissions in the parent
 */
@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickActionsComponent {
  readonly actions = input<QuickAction[]>([]);
}
