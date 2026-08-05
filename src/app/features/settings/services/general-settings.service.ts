/** §8 of FeaturesToImplement.md — `/settings/general` doesn't exist yet. PUT is Admin-only
 *  server-side; the route is already role-gated in settings.routes.ts. */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { GeneralSettingsDto } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class GeneralSettingsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/settings/general`;

  getSettings(): Observable<GeneralSettingsDto> {
    return this.http.get<ApiResponse<GeneralSettingsDto>>(this.baseUrl).pipe(map(res => res.data));
  }

  updateSettings(dto: GeneralSettingsDto): Observable<GeneralSettingsDto> {
    return this.http.put<ApiResponse<GeneralSettingsDto>>(this.baseUrl, dto).pipe(map(res => res.data));
  }
}
