/**
 * ═══════════════════════════════════════════════════════════════════
 * EMPLOYEE SERVICE — Data Access Layer with Mock Data
 * ═══════════════════════════════════════════════════════════════════
 *
 * EXPLANATION:
 * ─────────────
 * This service acts as the single source of truth for employee data.
 * Components should NEVER directly access MOCK_EMPLOYEES. Always go
 * through this service.
 *
 * WHY?
 * ─────
 * 1. **Encapsulation**: Data source can change without touching components
 * 2. **Consistency**: All components see the same data mutations
 * 3. **Testing**: Easy to mock this service in unit tests
 * 4. **Observable Pattern**: Maintains async contract even with sync data
 *
 * DEPENDENCY INJECTION:
 * ──────────────────────
 * The `inject()` function is Angular's new (v14+) functional DI API.
 * Alternative (older) approach:
 *
 *   constructor(private mockDataService: MockDataService) {}
 *
 * Modern approach (preferred in Angular 22):
 *
 *   private readonly mockDataService = inject(MockDataService);
 *
 * Benefits:
 * - More concise
 * - Works in functions, not just constructors
 * - Better tree-shaking
 * - Signals-friendly
 *
 * INTERVIEW QUESTION:
 * ────────────────────
 * Q: "Why use a service instead of importing MOCK_EMPLOYEES directly?"
 * A: "Services provide a layer of abstraction. When we switch to a real
 *     API, we only change this service. All components remain unchanged."
 */

import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Employee, CreateEmployeeDto, UpdateEmployeeDto } from '../models/employee.model';
import { PagedResponse } from '../../../core/models/api-response.model';
import { MockDataService } from '../../../core/services/mock-data.service';
import { MOCK_EMPLOYEES } from '../data/mock-employees.data';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private readonly mockService = inject(MockDataService);

  /**
   * In-memory data store. Shared across all instances.
   * In real app, this would be the backend database.
   */
  private employees = [...MOCK_EMPLOYEES];

  /**
   * GET ALL with Pagination
   * ────────────────────────
   * Returns a page of employees with metadata.
   * Even though data is in-memory, we simulate paging
   * to match real API behavior.
   */
  getAll(page = 1, pageSize = 20): Observable<PagedResponse<Employee>> {
    return this.mockService.getAll(this.employees).pipe(
      map(allEmployees => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paged = allEmployees.slice(startIndex, endIndex);

        return {
          data: paged,
          totalCount: allEmployees.length,
          pageNumber: page,
          pageSize: pageSize,
          totalPages: Math.ceil(allEmployees.length / pageSize),
          message: 'Employees retrieved successfully',
          success: true,
          statusCode: 200
        };
      })
    );
  }

  /**
   * GET BY ID
   * ──────────
   * Returns single employee or error if not found.
   */
  getById(id: number): Observable<Employee> {
    return this.mockService.getById(this.employees, id);
  }

  /**
   * CREATE
   * ───────
   * Adds new employee. Backend would generate ID; we simulate it.
   */
  create(dto: CreateEmployeeDto): Observable<Employee> {
    const newEmployee: Partial<Employee> = {
      ...dto,
      employeeCode: `EMP${String(this.employees.length + 1).padStart(3, '0')}`,
      isActive: true
    };
    return this.mockService.create(this.employees, newEmployee);
  }

  /**
   * UPDATE
   * ───────
   * Partial update of existing employee.
   */
  update(id: number, dto: UpdateEmployeeDto): Observable<Employee> {
    return this.mockService.update(this.employees, id, dto);
  }

  /**
   * DELETE
   * ───────
   * Soft or hard delete. Here we do hard delete (remove from array).
   * Production apps often use soft delete (set isActive = false).
   */
  delete(id: number): Observable<void> {
    return this.mockService.delete(this.employees, id);
  }

  /**
   * SEARCH
   * ───────
   * Case-insensitive search across multiple fields.
   * In real app, backend would handle this with SQL LIKE or full-text search.
   */
  search(query: string): Observable<Employee[]> {
    return this.mockService.search(
      this.employees,
      query,
      (emp, q) => {
        const searchable = [
          emp.firstName,
          emp.lastName,
          emp.email,
          emp.employeeCode,
          emp.department,
          emp.jobTitle
        ].join(' ').toLowerCase();
        return searchable.includes(q);
      }
    );
  }
}
