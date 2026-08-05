/**
 * §1/§2 of PartTwoUIIntegration.md — profile view/edit + avatar upload, both live on the
 * backend now.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { AvatarUploadResult, UpdateUserProfileDto, UserProfileDto } from '../models/settings.model';

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly http = inject(HttpClient);
  private readonly profileUrl = `${environment.apiUrl}/users/me/profile`;
  private readonly avatarUrl = `${environment.apiUrl}/users/me/avatar`;

  getProfile(): Observable<UserProfileDto> {
    return this.http.get<ApiResponse<UserProfileDto>>(this.profileUrl).pipe(map(res => res.data));
  }

  updateProfile(dto: UpdateUserProfileDto): Observable<UserProfileDto> {
    return this.http.put<ApiResponse<UserProfileDto>>(this.profileUrl, dto).pipe(map(res => res.data));
  }

  /**
   * Real multipart upload — do NOT set a Content-Type header here. HttpClient sets
   * `multipart/form-data; boundary=...` automatically for a FormData body; setting it manually
   * drops the boundary and the server can't parse the request (PartTwoUIIntegration.md §2).
   */
  uploadAvatar(file: File): Observable<AvatarUploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post<ApiResponse<AvatarUploadResult>>(this.avatarUrl, formData)
      .pipe(map(res => res.data));
  }

  removeAvatar(): Observable<void> {
    return this.http.delete<void>(this.avatarUrl);
  }
}
