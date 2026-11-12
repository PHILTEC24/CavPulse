import { AuthUser, UserRole } from '@cavpulse/shared';

const ACCESS_TOKEN_KEY = 'cavpulse_access_token';
const REFRESH_TOKEN_KEY = 'cavpulse_refresh_token';
const USER_KEY = 'cavpulse_user';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  try {
    return JSON.parse(userJson) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(USER_KEY);
  } else {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getRoleDashboardPath(role?: UserRole): string {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return '/dashboard/admin';
    case UserRole.ACADEMIC_ADMIN:
      return '/dashboard/academic';
    case UserRole.HEAD_OF_DEPARTMENT:
      return '/dashboard/hod';
    case UserRole.LECTURER:
      return '/dashboard/lecturer';
    case UserRole.STUDENT:
      return '/dashboard/student';
    default:
      return '/auth/login';
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    if (!parsed.exp) return false;
    // Buffer by 30 seconds
    return Date.now() >= parsed.exp * 1000 - 30000;
  } catch {
    return true;
  }
}

