/** §7 of PartTwoUIIntegration.md. Self-seeds server defaults on first GET; the app also keeps a
 *  localStorage copy as an optimistic local cache (see PreferencesSettingsComponent). */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UserPreferencesDto } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users/me/preferences`;

  getPreferences(): Observable<UserPreferencesDto> {
    return this.http.get<ApiResponse<UserPreferencesDto>>(this.baseUrl).pipe(map(res => res.data));
  }

  updatePreferences(dto: UserPreferencesDto): Observable<UserPreferencesDto> {
    return this.http.put<ApiResponse<UserPreferencesDto>>(this.baseUrl, dto).pipe(map(res => res.data));
  }
}
