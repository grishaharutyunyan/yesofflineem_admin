const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

export interface AdminUser {
  id: number;
  email: string;
  role: string;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem(USER_KEY);
  return s ? JSON.parse(s) : null;
}

export function setAuth(token: string, user: AdminUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
