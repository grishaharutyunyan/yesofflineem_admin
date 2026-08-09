export interface AdminUser {
  id: number;
  email: string;
  role: string;
}

// Access token lives in memory only — never localStorage — so it can't be
// read by an XSS payload. It's lost on a hard reload by design; AuthGuard
// repopulates it via a silent /auth/refresh call using the httpOnly cookie.
let accessToken: string | null = null;
let currentUser: AdminUser | null = null;

export function getToken(): string | null {
  return accessToken;
}

export function getUser(): AdminUser | null {
  return currentUser;
}

export function setAuth(token: string, user: AdminUser): void {
  accessToken = token;
  currentUser = user;
}

export function clearAuth(): void {
  accessToken = null;
  currentUser = null;
}
