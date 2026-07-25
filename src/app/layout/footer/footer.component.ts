import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-dark text-secondary py-3 text-center border-top border-secondary border-opacity-25">
      <small>
        &copy; {{ year }} <strong class="text-light">Employee Management System</strong>
        &mdash; Angular 22 + .NET 10
      </small>
    </footer>
  `
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}
