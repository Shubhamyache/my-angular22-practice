/**
 * ═══════════════════════════════════════════════════════════════════
 * REUSABLE CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════
 *
 * ENTERPRISE PATTERN: Content Projection (Transclusion)
 * ──────────────────────────────────────────────────────
 * This component demonstrates Angular's powerful content projection
 * feature, allowing flexible, reusable layouts.
 *
 * CONTENT PROJECTION:
 * ───────────────────
 * <ng-content> acts as a "slot" where parent component can inject
 * custom content. This is similar to React's children prop or
 * Vue's slots.
 *
 * WHY CONTENT PROJECTION?
 * ───────────────────────
 * - Maximum flexibility (parents control content)
 * - Reusable structure with custom data
 * - Composition over inheritance
 * - Single Responsibility: Card handles layout, parent handles content
 *
 * NAMED SLOTS:
 * ────────────
 * Multiple <ng-content> with 'select' attribute allows targeting
 * specific sections:
 * - select="[card-header]" → Header slot
 * - select="[card-footer]" → Footer slot
 * - Default → Body slot
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
 *   <div card-header>
 *     <h5>Task #123</h5>
 *   </div>
 *   
 *   <p>Task description goes here</p>
 *   
 *   <div card-footer>
 *     <button class="btn btn-primary">Edit</button>
 *   </div>
 * </app-card>
 *
 * // Card with custom styling
 * <app-card [hoverable]="true" [borderColor]="'primary'">
 *   <div card-header>Header</div>
 *   <p>Content</p>
 * </app-card>
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="card"
      [class.border-0]="!showBorder"
      [class.card-hoverable]="hoverable"
      [class]="'shadow-' + (elevation === 0 ? 'none' : elevation === 1 ? 'sm' : elevation === 2 ? '' : 'lg')"
      [class]="borderColor ? 'border-' + borderColor : ''"
      [style.max-width]="maxWidth">

      <!-- HEADER SLOT: Optional card header -->
      <div class="card-header bg-white border-bottom" *ngIf="hasHeaderContent">
        <ng-content select="[card-header]" />
      </div>

      <!-- BODY SLOT: Main card content (default slot) -->
      <div class="card-body" [class]="'p-' + padding">
        <ng-content />
      </div>

      <!-- FOOTER SLOT: Optional card footer -->
      <div class="card-footer bg-white border-top" *ngIf="hasFooterContent">
        <ng-content select="[card-footer]" />
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .card-hoverable {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
    }

    .card-hoverable:hover {
      transform: translateY(-4px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }

    .card-header,
    .card-footer {
      padding: 1rem;
    }

    /* Border color variants */
    .border-primary { border-color: #0d6efd !important; }
    .border-success { border-color: #198754 !important; }
    .border-danger { border-color: #dc3545 !important; }
    .border-warning { border-color: #ffc107 !important; }
    .border-info { border-color: #0dcaf0 !important; }
  `]
})
export class CardComponent {
  // ════════════════════════════════════════════════════════════════
  // CONFIGURATION INPUTS
  // ════════════════════════════════════════════════════════════════
  
  @Input() showBorder = true;
  @Input() hoverable = false;
  @Input() elevation: 0 | 1 | 2 | 3 = 1;
  @Input() padding: 2 | 3 | 4 = 3;
  @Input() borderColor?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
  @Input() maxWidth?: string;

  // ════════════════════════════════════════════════════════════════
  // CONTENT DETECTION
  // ════════════════════════════════════════════════════════════════
  // These would be detected via ViewChild in a full implementation
  // Simplified for this example
  
  protected hasHeaderContent = true; // Detect if [card-header] content exists
  protected hasFooterContent = true; // Detect if [card-footer] content exists
}
