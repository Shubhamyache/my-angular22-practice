/**
 * ═══════════════════════════════════════════════════════════════════
 * NOTIFICATION BELL — dropdown panel under the navbar bell icon
 * ═══════════════════════════════════════════════════════════════════
 * PartTwoUIIntegration.md §9. Replaces the old hardcoded `signal(4)` badge. No push/websocket
 * channel exists on the backend, so the unread count is kept fresh by polling
 * GET /notifications/unread-count on an interval + on window focus, per the doc's suggested
 * wiring — this is a deliberate tradeoff (simplicity over real-time), not an oversight.
 */
import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Observable, interval, merge, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../services/notification.service';
import { NotificationDto } from '../models/notification.model';

const POLL_INTERVAL_MS = 45_000;

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [RouterModule, DatePipe],
  templateUrl: './notification-bell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationBellComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  protected readonly unreadCount = signal(0);
  protected readonly open        = signal(false);
  protected readonly loading     = signal(false);
  protected readonly recent      = signal<NotificationDto[]>([]);
  protected readonly loaded      = signal(false);

  ngOnInit(): void {
    // Poll on a timer AND on window focus (e.g. switching back to this tab) — either source
    // triggers a fresh unread-count fetch. No websocket/push exists (§9), this is pure polling.
    merge(
      interval(POLL_INTERVAL_MS),
      new Observable<void>(sub => {
        const handler = () => sub.next();
        window.addEventListener('focus', handler);
        return () => window.removeEventListener('focus', handler);
      })
    )
      .pipe(startWith(0), switchMap(() => this.notificationService.getUnreadCount()), takeUntilDestroyed())
      .subscribe(count => this.unreadCount.set(count));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  toggle(): void {
    this.open.update(v => !v);
    if (this.open() && !this.loaded()) {
      this.loadRecent();
    }
  }

  private loadRecent(): void {
    this.loading.set(true);
    this.notificationService.getAll({ page: 1, pageSize: 10 }).subscribe({
      next: res => {
        this.recent.set(res.data);
        this.loaded.set(true);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onNotificationClick(notification: NotificationDto): void {
    if (!notification.isRead) {
      this.recent.update(list =>
        list.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      this.unreadCount.update(n => Math.max(0, n - 1));
      this.notificationService.markRead(notification.id).subscribe();
    }

    this.open.set(false);
    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  markAllRead(): void {
    this.recent.update(list => list.map(n => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
    this.notificationService.markAllRead().subscribe();
  }
}
