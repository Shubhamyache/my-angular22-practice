import { Component, inject, output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  readonly menuToggled = output<void>();
  protected readonly authService = inject(AuthService);

  toggleMenu(): void {
    this.menuToggled.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
