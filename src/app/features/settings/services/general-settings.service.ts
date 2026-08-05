/** §8 of PartTwoUIIntegration.md. GET is any authenticated user; PUT is Admin-only server-side —
 *  GeneralSettingsComponent disables the form for non-Admins rather than gating the route. */
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
