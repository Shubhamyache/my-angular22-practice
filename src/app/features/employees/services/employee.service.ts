import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee.model';
import { PagedResponse } from '../../../core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/employees`;

  getAll(page = 1, pageSize = 20): Observable<PagedResponse<Employee>> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);
    return this.http.get<PagedResponse<Employee>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.baseUrl}/${id}`);
  }

  create(dto: CreateEmployeeDto): Observable<Employee> {
    return this.http.post<Employee>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateEmployeeDto): Observable<Employee> {
    return this.http.put<Employee>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  search(query: string): Observable<Employee[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Employee[]>(`${this.baseUrl}/search`, { params });
  }
}
