import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DatePipe } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { NotificationDto } from '../models/notification.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [RouterModule, DatePipe, LoaderComponent, PaginationComponent],
  templateUrl: './notification-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly notifications = signal<NotificationDto[]>([]);
  protected readonly loading    = signal(true);
  protected readonly error      = signal<string | null>(null);
  protected readonly page       = signal(1);
  protected readonly totalCount = signal(0);
  protected readonly unreadOnly = signal(false);
  protected readonly pageSize   = PAGE_SIZE;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.notificationService.getAll({ page: this.page(), pageSize: this.pageSize, unreadOnly: this.unreadOnly() || undefined }).subscribe({
      next: res => {
        this.notifications.set(res.data);
        this.totalCount.set(res.totalCount);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      }
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }

  toggleUnreadOnly(): void {
    this.unreadOnly.update(v => !v);
    this.page.set(1);
    this.load();
  }

  onNotificationClick(notification: NotificationDto): void {
    if (!notification.isRead) {
      this.notifications.update(list =>
        list.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
      this.notificationService.markRead(notification.id).subscribe();
    }

    if (notification.link) {
      this.router.navigateByUrl(notification.link);
    }
  }

  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    this.notificationService.markAllRead().subscribe();
  }
}
