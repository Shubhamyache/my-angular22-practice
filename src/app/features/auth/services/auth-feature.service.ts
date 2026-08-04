import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of, delay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../core/services/auth.service';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthFeatureService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  /**
   * MOCK LOGIN - For Development Only
   * Accepts any credentials and generates a fake JWT token
   * 
   * Test Credentials (any will work):
   * - Email: admin@example.com
   * - Password: any password
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // Use mock authentication for development
    if (!environment.production) {
      return this.mockLogin(credentials);
    }
    
    // Real API call for production
    return this.http
      .post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(tap(res => this.authService.setToken(res.token)));
  }

  /**
   * Generate a mock JWT token for development
   */
  private mockLogin(credentials: LoginRequest): Observable<LoginResponse> {
    // Simulate network delay
    return of(this.generateMockToken(credentials.email)).pipe(
      delay(500), // 500ms delay to simulate API call
      tap(res => this.authService.setToken(res.token))
    );
  }

  /**
   * Generate a fake JWT token
   * The token expires in 8 hours
   */
  private generateMockToken(email: string): LoginResponse {
    const now = Date.now();
    const expiresIn = 8 * 60 * 60 * 1000; // 8 hours
    const exp = Math.floor((now + expiresIn) / 1000);

    // Create fake JWT payload
    const payload = {
      sub: '1',
      name: this.getNameFromEmail(email),
      email: email,
      role: email.includes('admin') ? 'Admin' : 'User',
      exp: exp
    };

    // Create fake JWT (base64 encoded header + payload + fake signature)
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const fakeSignature = btoa('mock-signature');

    const token = `${encodedHeader}.${encodedPayload}.${fakeSignature}`;

    return {
      token: token,
      expiresAt: new Date(now + expiresIn).toISOString()
    };
  }

  /**
   * Extract name from email (e.g., john.doe@example.com -> John Doe)
   */
  private getNameFromEmail(email: string): string {
    const username = email.split('@')[0];
    return username
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
