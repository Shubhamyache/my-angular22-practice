import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { EmployeeStore } from '../store/employee.store';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterModule, LoaderComponent],
  templateUrl: './employee-list.component.html'
})
export class EmployeeListComponent implements OnInit {
  protected readonly store = inject(EmployeeStore);

  ngOnInit(): void {
    this.store.loadEmployees();
  }

  confirmDelete(id: number): void {
    if (confirm('Are you sure you want to remove this employee?')) {
      this.store.removeEmployee(id);
    }
  }
}
