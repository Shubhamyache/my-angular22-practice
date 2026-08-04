import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input
} from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  readonly appHasRole = input<string | string[]>('');

  private readonly authService  = inject(AuthService);
  private readonly templateRef  = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const roles = this.appHasRole();
      const userRole = this.authService.getUserRole();
      const rolesArray = Array.isArray(roles) ? roles : [roles];

      this.viewContainer.clear();
      if (rolesArray.includes(userRole)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
