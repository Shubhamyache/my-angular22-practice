export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export type UserRole = 'Admin' | 'HR' | 'Manager' | 'Employee';

export interface CurrentUserDto {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  employeeId: number | null;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
}

/** Decoded shape of the JWT access token's payload (client-side decode only, never trusted as verification). */
export interface DecodedAccessToken {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  jti: string;
  exp: number;
  iss?: string;
  aud?: string;
}
