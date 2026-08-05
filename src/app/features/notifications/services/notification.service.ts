/**
 * PartTwoUIIntegration.md §9. No push/websocket mechanism exists — unread count is driven by
 * polling (see NotificationBellComponent), not a live feed.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse } from '../../../core/models/api-response.model';
import { NotificationDto, NotificationListFilter } from '../models/notification.model';

function buildParams(filter: NotificationListFilter): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  getAll(filter: NotificationListFilter): Observable<PagedResponse<NotificationDto>> {
    return this.http.get<PagedResponse<NotificationDto>>(this.baseUrl, { params: buildParams(filter) });
  }

  getUnreadCount(): Observable<number> {
    return this.http
      .get<ApiResponse<{ count: number }>>(`${this.baseUrl}/unread-count`)
      .pipe(map(res => res.data.count));
  }

  markRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/read-all`, {});
  }
}
