import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

interface DecodedToken {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly router = inject(Router);
  private readonly _token = signal<string | null>(
    sessionStorage.getItem('ems_token')
  );

  readonly isAuthenticated = computed(() => {
    const token = this._token();
    if (!token) return false;
    const decoded = this.decodeToken(token);
    return decoded ? decoded.exp * 1000 > Date.now() : false;
  });

  getToken(): string | null {
    return this._token();
  }

  setToken(token: string): void {
    sessionStorage.setItem('ems_token', token);
    this._token.set(token);
  }

  logout(): void {
    sessionStorage.removeItem('ems_token');
    this._token.set(null);
    this.router.navigate(['/auth/login']);
  }

  getDecodedUser(): DecodedToken | null {
    return this.decodeToken(this._token());
  }

  getUserRole(): string {
    return this.getDecodedUser()?.role ?? '';
  }

  getUserName(): string {
    return this.getDecodedUser()?.name ?? '';
  }

  private decodeToken(token: string | null): DecodedToken | null {
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload)) as DecodedToken;
    } catch {
      return null;
    }
  }
}
