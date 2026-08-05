/**
 * §1 of FeaturesToImplement.md. `GET /users/me/profile` and `PUT /users/me/profile` don't exist
 * on the backend yet — calling these today 404s, surfaced inline by the calling component
 * (ProfileSettingsComponent), not as a global toast (UIIntegrationInfo.md §11 — 404 is always
 * handled inline). No Angular changes needed once the backend ships this.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { UpdateUserProfileDto, UserProfileDto } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users/me/profile`;

  getProfile(): Observable<UserProfileDto> {
    return this.http.get<ApiResponse<UserProfileDto>>(this.baseUrl).pipe(map(res => res.data));
  }

  updateProfile(dto: UpdateUserProfileDto): Observable<UserProfileDto> {
    return this.http.put<ApiResponse<UserProfileDto>>(this.baseUrl, dto).pipe(map(res => res.data));
  }
}
