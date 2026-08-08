import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { GenerateReportRequest, ReportDto, ReportExportFormat, ReportPreviewDto } from '../models/report.model';

export interface GeneratedReportFile {
  blob: Blob;
  filename: string;
}

function extractFilename(contentDisposition: string | null, fallback: string): string {
  const match = contentDisposition?.match(/filename="?([^";]+)"?/);
  return match?.[1] ?? fallback;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  getAvailable(): Observable<ReportDto[]> {
    return this.http
      .get<ApiResponse<ReportDto[]>>(this.baseUrl)
      .pipe(map(res => res.data));
  }

  /** Same dataset `generate()` would produce, as JSON — for the preview modal's table. Does not
   *  count as "generating" the report server-side (no ReportExecutions row, no notification). */
  preview(reportId: string, request: GenerateReportRequest): Observable<ReportPreviewDto> {
    return this.http
      .post<ApiResponse<ReportPreviewDto>>(`${this.baseUrl}/${reportId}/preview`, request)
      .pipe(map(res => res.data));
  }

  /**
   * Returns raw PDF or Excel bytes (Content-Type varies by `format`), not JSON — per
   * UIIntegrationInfo.md §12, requested as a blob with the full HttpResponse so the real
   * filename can be read off Content-Disposition instead of guessing one client-side.
   */
  generate(reportId: string, request: GenerateReportRequest, format: ReportExportFormat = 'Pdf'): Observable<GeneratedReportFile> {
    return this.http
      .post(`${this.baseUrl}/${reportId}/generate`, request, {
        params: new HttpParams().set('format', format),
        responseType: 'blob',
        observe: 'response'
      })
      .pipe(
        map((response: HttpResponse<Blob>) => ({
          blob: response.body!,
          filename: extractFilename(response.headers.get('content-disposition'), `${reportId}.${format.toLowerCase()}`)
        }))
      );
  }
}
