import { Component, input } from '@angular/core';
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
 *
 * ROUTERLINK:
 * ─────────────
 * [routerLink]="action.route"  → dynamic route binding
 * RouterLink is imported directly in this component's imports array.
 * In Angular 22 standalone components, RouterLink is just a directive
 * that lives in @angular/router — no RouterModule needed.
 *
 * What RouterLink does internally:
 *   1. Attaches a click handler to the host element
 *   2. On click: calls Router.navigate([action.route])
 *   3. Router evaluates the route table → lazy loads the feature chunk
 *   4. Activates the correct component in the nearest <router-outlet>
 *   5. History API pushes new URL (no full page reload)
 */
@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="row g-3">
      @for (action of actions(); track action.route) {
        <div class="col-6 col-md-4 col-lg-2">
          <!--
            Using <a> with routerLink for accessibility and SEO.
            Wrapping in <a> means:
              ✓ Right-click → "Open in new tab" works
              ✓ Tab key navigation works (keyboard accessibility)
              ✓ Screen readers announce it as a link
          -->
          <a [routerLink]="action.route" class="text-decoration-none" [attr.aria-label]="action.label">
            <div class="card border-0 shadow-sm text-center p-3 h-100 quick-action-card position-relative overflow-hidden">

              <!-- Subtle background gradient hint (color-coded top border) -->
              <div
                class="position-absolute top-0 start-0 end-0"
                style="height:3px; border-radius:0.375rem 0.375rem 0 0;"
                [style.background]="'var(--bs-' + action.color + ')'">
              </div>

              <!-- Icon circle -->
              <div class="d-flex justify-content-center mb-3 mt-1">
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center"
                  style="width:52px;height:52px;transition:transform 0.2s ease;"
                  [style.background]="'var(--bs-' + action.color + '-bg-subtle, rgba(13,110,253,0.08))'">
                  <i [class]="'bi ' + action.icon + ' fs-4 text-' + action.color"></i>
                </div>
              </div>

              <!-- Label -->
              <div class="fw-semibold mb-1" style="font-size:0.85rem;">
                {{ action.label }}
              </div>

              <!-- Description (hidden on smallest screens) -->
              <div class="text-muted d-none d-sm-block" style="font-size:0.7rem;line-height:1.3;">
                {{ action.description }}
              </div>

            </div>
          </a>
        </div>
      }
    </div>
  `,
  styles: [`
    .quick-action-card {
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .quick-action-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.1) !important;
    }
    .quick-action-card:hover .rounded-circle {
      transform: scale(1.1);
    }
  `]
})
export class QuickActionsComponent {
  readonly actions = input<QuickAction[]>([]);
}
