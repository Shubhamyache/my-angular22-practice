import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent, ToastComponent],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  private readonly router         = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef     = inject(DestroyRef);
  private readonly errorHandler   = inject(ErrorHandlerService);

  protected readonly errorNotice = this.errorHandler.notice;

  // ── Responsive state ─────────────────────────────────────────────────────────
  /** true when viewport < 992px (Bootstrap lg breakpoint) */
  private readonly _isMobile = signal(
    typeof window !== 'undefined' ? window.innerWidth < 992 : false
  );
  protected readonly isMobile = this._isMobile.asReadonly();

  /**
   * Sidebar open state:
   *  - Desktop: starts open (250 px wide)
   *  - Mobile:  starts closed (slides off-screen)
   */
  protected readonly sidebarOpen = signal(
    typeof window !== 'undefined' ? window.innerWidth >= 992 : true
  );

  /** Show backdrop only when sidebar is open on mobile */
  protected readonly showOverlay = computed(
    () => this._isMobile() && this.sidebarOpen()
  );

  // ── Page title (read from route data) ─────────────────────────────────────
  protected readonly pageTitle = signal('Dashboard');
  protected readonly pageIcon  = signal('bi-speedometer2');

  constructor() {
    // Window resize → update isMobile signal
    if (typeof window !== 'undefined') {
      const onResize = (): void => {
        const mobile = window.innerWidth < 992;
        this._isMobile.set(mobile);
        // Restore sidebar when resizing back to desktop
        if (!mobile) this.sidebarOpen.set(true);
      };
      window.addEventListener('resize', onResize);
      this.destroyRef.onDestroy(() => window.removeEventListener('resize', onResize));
    }

    // Router events → auto-close sidebar on mobile + update page title
    const navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this._isMobile()) this.sidebarOpen.set(false);
        this.updatePageMeta();
      });

    this.destroyRef.onDestroy(() => navSub.unsubscribe());
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeOverlay(): void {
    this.sidebarOpen.set(false);
  }

  /** Walk the activated-route tree to the deepest child and read its data */
  private updatePageMeta(): void {
    let route = this.activatedRoute.root;
    while (route.firstChild) route = route.firstChild;
    const data = route.snapshot.data as { title?: string; icon?: string };
    this.pageTitle.set(data['title'] ?? 'Dashboard');
    this.pageIcon.set(data['icon']  ?? 'bi-speedometer2');
  }
}
