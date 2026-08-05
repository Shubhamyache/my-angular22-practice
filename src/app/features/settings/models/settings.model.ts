/**
 * DTOs for the Settings screens — Profile, Security, Notification Preferences, User
 * Preferences, and admin General Settings. All of these now exist on the backend
 * (PartTwoUIIntegration.md §1, §3, §5–§8) — these types match that contract exactly.
 */

// ── §1 Profile ────────────────────────────────────────────────────────────
export interface UserProfileDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  avatarUrl: string | null;
}

export interface UpdateUserProfileDto {
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
}

/** Response of POST /users/me/avatar (PartTwoUIIntegration.md §2) — avatarUrl is a relative
 *  path (e.g. "/uploads/avatars/3f2a....png"), not an absolute URL. */
export interface AvatarUploadResult {
  avatarUrl: string;
}

// ── §3 Change password ───────────────────────────────────────────────────
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// ── §4 Two-factor authentication ─────────────────────────────────────────
export interface TwoFactorSetupDto {
  secret: string;
  qrCodeUri: string;
}

// ── §5 Active sessions ───────────────────────────────────────────────────
export interface SessionDto {
  id: number;
  device: string | null;
  ipAddress: string | null;
  lastActiveAt: string;
  isCurrent: boolean;
}

// ── §6 Notification preferences ──────────────────────────────────────────
export interface NotificationPreferenceDto {
  eventKey: string;
  email: boolean;
  inApp: boolean;
}

// ── §7 User preferences ──────────────────────────────────────────────────
export interface UserPreferencesDto {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  itemsPerPage: number;
  enableNotifications: boolean;
  emailDigest: 'daily' | 'weekly' | 'never';
  compactView: boolean;
  showAvatars: boolean;
}

// ── §8 Admin general settings ────────────────────────────────────────────
export interface GeneralSettingsDto {
  appName: string;
  timezone: string;
  dateFormat: string;
  pageSize: number;
}
