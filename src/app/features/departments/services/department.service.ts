import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { CreateDepartmentDto, Department, UpdateDepartmentDto } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/departments`;

  getAll(): Observable<Department[]> {
    return this.http
      .get<ApiResponse<Department[]>>(this.baseUrl)
      .pipe(map(res => res.data));
  }

  getById(id: number): Observable<Department> {
    return this.http
      .get<ApiResponse<Department>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  create(dto: CreateDepartmentDto): Observable<Department> {
    return this.http
      .post<ApiResponse<Department>>(this.baseUrl, dto)
      .pipe(map(res => res.data));
  }

  update(id: number, dto: UpdateDepartmentDto): Observable<Department> {
    return this.http
      .put<ApiResponse<Department>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map(res => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
