import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Payroll } from '../models/payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/payroll`;

  getAll(): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(this.baseUrl);
  }

  getByEmployee(employeeId: number): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(`${this.baseUrl}/employee/${employeeId}`);
  }

  getMonthly(year: number, month: number): Observable<Payroll[]> {
    return this.http.get<Payroll[]>(`${this.baseUrl}/monthly/${year}/${month}`);
  }

  process(id: number): Observable<Payroll> {
    return this.http.post<Payroll>(`${this.baseUrl}/${id}/process`, {});
  }
}
