/**
 * DTOs for the Settings screens — Profile, Security, Notification Preferences, User
 * Preferences, and admin General Settings. None of these endpoints exist on the backend yet;
 * these types match the contract proposed in FeaturesToImplement.md exactly (§1, §3, §5–§8), so
 * the services below need zero changes once the backend ships them — see that doc for the full
 * spec, validation rules, and role gates.
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

// ── §3 Change password ───────────────────────────────────────────────────
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
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
