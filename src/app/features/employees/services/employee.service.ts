import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse } from '../../../core/models/api-response.model';
import {
  CreateEmployeeDto,
  Employee,
  EmployeeListFilter,
  UpdateEmployeeDto
} from '../models/employee.model';

function buildParams(filter: EmployeeListFilter): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  getAll(filter: EmployeeListFilter = { page: 1, pageSize: 20 }): Observable<PagedResponse<Employee>> {
    return this.http.get<PagedResponse<Employee>>(this.baseUrl, { params: buildParams(filter) });
  }

  getById(id: number): Observable<Employee> {
    return this.http
      .get<ApiResponse<Employee>>(`${this.baseUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  create(dto: CreateEmployeeDto): Observable<Employee> {
    return this.http
      .post<ApiResponse<Employee>>(this.baseUrl, dto)
      .pipe(map(res => res.data));
  }

  update(id: number, dto: UpdateEmployeeDto): Observable<Employee> {
    return this.http
      .put<ApiResponse<Employee>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map(res => res.data));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /** Typeahead search — GET /employees/search?q=, capped at 20 results server-side, unpaginated. */
  search(query: string): Observable<Employee[]> {
    return this.http
      .get<ApiResponse<Employee[]>>(`${this.baseUrl}/search`, { params: new HttpParams().set('q', query) })
      .pipe(map(res => res.data));
  }
}
