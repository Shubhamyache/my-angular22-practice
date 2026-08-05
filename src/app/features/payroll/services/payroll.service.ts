/**
 * Same documented tradeoff as ProjectService.getAll() (see that file): `getAll()` fetches up
 * to 100 rows on a single page to preserve payroll-list.component.ts's existing "load a flat
 * array once" design unchanged. GET /payroll has no unpaginated mode (UIIntegrationInfo.md §6);
 * `getPaged()` is exposed for a future proper table migration.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PagedResponse } from '../../../core/models/api-response.model';
import {
  GeneratePayrollRequest,
  GeneratePayrollResultDto,
  Payroll,
  PayrollListFilter
} from '../models/payroll.model';

function buildParams(filter: PayrollListFilter): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filter)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payroll`;

  getAll(): Observable<Payroll[]> {
    return this.getPaged({ page: 1, pageSize: 100 }).pipe(map(res => res.data));
  }

  getPaged(filter: PayrollListFilter): Observable<PagedResponse<Payroll>> {
    return this.http.get<PagedResponse<Payroll>>(this.baseUrl, { params: buildParams(filter) });
  }

  getByEmployee(employeeId: number): Observable<Payroll[]> {
    return this.http
      .get<ApiResponse<Payroll[]>>(`${this.baseUrl}/employee/${employeeId}`)
      .pipe(map(res => res.data));
  }

  getMonthly(year: number, month: number): Observable<Payroll[]> {
    return this.http
      .get<ApiResponse<Payroll[]>>(`${this.baseUrl}/monthly/${year}/${month}`)
      .pipe(map(res => res.data));
  }

  /** Backs the "Run Payroll" button — creates one Pending row per active employee for the period. */
  generate(request: GeneratePayrollRequest): Observable<GeneratePayrollResultDto> {
    return this.http
      .post<ApiResponse<GeneratePayrollResultDto>>(`${this.baseUrl}/generate`, request)
      .pipe(map(res => res.data));
  }

  process(id: number): Observable<Payroll> {
    return this.http
      .post<ApiResponse<Payroll>>(`${this.baseUrl}/${id}/process`, {})
      .pipe(map(res => res.data));
  }
}
