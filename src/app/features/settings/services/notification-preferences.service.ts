/** §6 of PartTwoUIIntegration.md. Self-seeds all six default rows on first GET for a user. */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { NotificationPreferenceDto } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class NotificationPreferencesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users/me/notification-preferences`;

  getPreferences(): Observable<NotificationPreferenceDto[]> {
    return this.http
      .get<ApiResponse<NotificationPreferenceDto[]>>(this.baseUrl)
      .pipe(map(res => res.data));
  }

  updatePreferences(prefs: NotificationPreferenceDto[]): Observable<NotificationPreferenceDto[]> {
    return this.http
      .put<ApiResponse<NotificationPreferenceDto[]>>(this.baseUrl, prefs)
      .pipe(map(res => res.data));
  }
}
