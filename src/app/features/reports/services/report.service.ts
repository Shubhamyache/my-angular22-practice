import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: 'HR' | 'Payroll' | 'Compliance';
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getAvailable(): Observable<ReportDefinition[]> {
    return this.http.get<ReportDefinition[]>(this.baseUrl);
  }

  generate(reportId: string, params: Record<string, unknown>): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/${reportId}/generate`, params, {
      responseType: 'blob'
    });
  }
}
