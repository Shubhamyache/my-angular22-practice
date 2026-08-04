/**
 * ═══════════════════════════════════════════════════════════════════
 * REUSABLE CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Content Projection (Transclusion)
 * ──────────────────────────────────────────────────────
 * <ng-content> acts as a "slot" where a parent component can inject
 * custom content — similar to React's children prop or Vue's slots.
 *
 * NAMED SLOTS:
 * ────────────
 * - select="[card-header]" → Header slot
 * - select="[card-footer]" → Footer slot
 * - Default → Body slot
 *
 * DETECTING OPTIONAL PROJECTED CONTENT:
 * ───────────────────────────────────────
 * We only want to render the header/footer wrapper divs when the parent
 * actually projected something into that slot. Angular's typed content
 * queries (`contentChild()`) only match a *directive/component type* —
 * that would force every consumer template to import a marker directive
 * just to use `<div card-header>`, which breaks every existing usage.
 *
 * Instead we inspect the host's light DOM directly in `ngAfterContentInit`
 * (content projection has resolved by then, but the component's own view
 * hasn't rendered yet) via `ElementRef.nativeElement.querySelector`. This
 * is a standard technique for optional-slot detection and requires zero
 * changes to any consumer template.
 *
 * USAGE EXAMPLES:
 * ───────────────
 * // Basic card
 * <app-card>
 *   <p>Card content here</p>
 * </app-card>
 *
 * // Card with header and footer
 * <app-card [elevation]="2">
 *   <div card-header><h5>Task #123</h5></div>
 *   <p>Task description goes here</p>
 *   <div card-footer><button class="btn btn-primary">Edit</button></div>
 * </app-card>
 */

import { AfterContentInit, ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, signal } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements AfterContentInit {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  // ════════════════════════════════════════════════════════════════
  // CONFIGURATION INPUTS
  // ════════════════════════════════════════════════════════════════
  readonly showBorder = input(true);
  readonly hoverable = input(false);
  readonly elevation = input<0 | 1 | 2 | 3>(1);
  readonly padding = input<2 | 3 | 4>(3);
  readonly borderColor = input<'primary' | 'success' | 'danger' | 'warning' | 'info'>();
  readonly maxWidth = input<string>();

  // ════════════════════════════════════════════════════════════════
  // CONTENT DETECTION — set once content has been projected
  // ════════════════════════════════════════════════════════════════
  protected readonly hasHeaderContent = signal(false);
  protected readonly hasFooterContent = signal(false);

  protected readonly shadowClass = computed(() => {
    const elevation = this.elevation();
    return 'shadow-' + (elevation === 0 ? 'none' : elevation === 1 ? 'sm' : elevation === 2 ? '' : 'lg');
  });

  ngAfterContentInit(): void {
    const host = this.elementRef.nativeElement;
    this.hasHeaderContent.set(!!host.querySelector('[card-header]'));
    this.hasFooterContent.set(!!host.querySelector('[card-footer]'));
  }
}
