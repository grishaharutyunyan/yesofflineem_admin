import { clearAuth, getToken, setAuth, type AdminUser } from './auth';

const BASE = '/api/admin';

interface AuthPayload {
  access_token: string;
  user: AdminUser;
}

// Concurrent 401s during one silent-refresh should share a single in-flight
// /auth/refresh call instead of each racing their own rotation.
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
        if (!res.ok) return false;
        const data = (await res.json()) as AuthPayload;
        setAuth(data.access_token, data.user);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

// Attempts to (re)establish a session from the httpOnly refresh cookie —
// used by AuthGuard on mount, since the access token itself never survives
// a reload (it's memory-only, see lib/auth.ts).
export const ensureSession = () => refreshAccessToken();

export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
  } finally {
    clearAuth();
  }
}

function handleUnauthorized(): never {
  clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  throw new Error('Session expired. Please log in again.');
}

async function readErrorCode(res: Response): Promise<string | undefined> {
  try {
    const text = await res.text();
    return text ? (JSON.parse(text)?.code as string | undefined) : undefined;
  } catch {
    return undefined;
  }
}

// A page's own data-loading effect can fire before AuthGuard's silent
// refresh has populated the in-memory token (React runs a component's
// hooks on mount regardless of what JSX it conditionally returns), so a
// 401 here can mean "no token yet" just as often as "token expired" —
// both are worth one refresh-and-retry. Only a genuinely bad/invalid
// token (wrong signature, wrong role) skips straight to logout.
const RETRYABLE_401_CODES = new Set(['ACCESS_TOKEN_EXPIRED', 'ACCESS_TOKEN_MISSING']);

// Central fetch wrapper: attaches the in-memory access token, and on a
// retryable 401 transparently refreshes once via the cookie and retries
// the original request before giving up and sending the admin to /login.
async function authedFetch(path: string, init: RequestInit = {}, isRetry = false): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' });

  if (res.status === 401) {
    if (!isRetry && RETRYABLE_401_CODES.has((await readErrorCode(res.clone())) ?? '')) {
      const refreshed = await refreshAccessToken();
      if (refreshed) return authedFetch(path, init, true);
    }
    handleUnauthorized();
  }
  return res;
}

export interface LocaleText { en: string; hy: string; }
export interface LocaleStringList { en: string[]; hy: string[]; }
export interface EventDateRange { start: string; end: string; }
export interface EventHost { name: LocaleText; role: LocaleText; imageUrl: string | null; }
export interface EventCoordinates { lat: number; lng: number; address: LocaleText; }
export interface ScheduleItem { time: string; label: LocaleText; sub: LocaleText; }

export interface ApiEvent {
  id: number;
  slug: string;
  status: string;
  label: LocaleText;
  title: LocaleText;
  dates: EventDateRange;
  location: LocaleText;
  locationDetail: LocaleText;
  shortDescription: LocaleText;
  longDescription: LocaleText;
  includes: LocaleStringList;
  schedule: ScheduleItem[];
  host: EventHost;
  coordinates: EventCoordinates;
  maxCapacity: number;
  bookedCount: number;
  price: number;
  cardImageUrl: string | null;
  galleryImageUrls: string[] | null;
  ctaLabel: LocaleText | null;
  hostSectionTitle: LocaleText | null;
  goodToKnowTitle: LocaleText | null;
  goodToKnowText: LocaleText | null;
  goodToKnowTextTitle: LocaleText | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiVideo {
  id: number;
  title: LocaleText;
  subtitle: LocaleText;
  url: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

async function req<T>(method: string, path: string, body?: object): Promise<T> {
  const res = await authedFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

// Public — no token, but credentials:'include' so the Set-Cookie refresh
// token from a successful login is stored.
export async function login(email: string, password: string): Promise<AuthPayload> {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid email or password');
  return res.json() as Promise<AuthPayload>;
}

export const changePassword = (currentPassword: string, newPassword: string) =>
  req<void>('PATCH', '/auth/change-password', { currentPassword, newPassword });

// Events
export const getEvents = (params = '') =>
  req<{ items: ApiEvent[]; count: number }>('GET', `/events${params ? '?' + params : ''}`);

export const getEvent = (id: number) =>
  req<ApiEvent>('GET', `/events/${id}`);

export const createEvent = (dto: object) =>
  req<ApiEvent>('POST', '/events', dto);

export const updateEvent = (id: number, dto: object) =>
  req<ApiEvent>('PUT', `/events/${id}`, dto);

export const deleteEvent = (id: number) =>
  req<void>('DELETE', `/events/${id}`);

// Videos
export const getVideos = () =>
  req<{ items: ApiVideo[]; count: number }>('GET', '/videos');

export const getVideo = (id: number) =>
  req<ApiVideo>('GET', `/videos/${id}`);

export const createVideo = (dto: object) =>
  req<ApiVideo>('POST', '/videos', dto);

export const updateVideo = (id: number, dto: object) =>
  req<ApiVideo>('PUT', `/videos/${id}`, dto);

export const deleteVideo = (id: number) =>
  req<void>('DELETE', `/videos/${id}`);

// Messages
export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string;
  source: string;
  message: string;
  createdAt: string;
}

export const getMessages = (source?: string) =>
  req<ContactMessage[]>('GET', `/contacts${source ? `?source=${source}` : ''}`);

// Upload
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await authedFetch('/upload/image', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()).url as string;
}

export async function uploadImages(files: File[]): Promise<string[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  const res = await authedFetch('/upload/images', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()).urls as string[];
}

export async function uploadVideo(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await authedFetch('/upload/video', { method: 'POST', body: fd });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()).url as string;
}

// Orders
export interface GuestDetail {
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
}

export interface ApiOrder {
  id: number;
  orderNumber: string;
  eventId: number;
  eventSlug: string;
  eventTitle: LocaleText;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  notes: string | null;
  guests: number;
  guestDetails: GuestDetail[] | null;
  amount: number;
  currency: string;
  status: string;
  panMasked: string | null;
  actionCode: string | null;
  actionCodeDescription: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrders {
  items: ApiOrder[];
  count: number;
  page: number;
  limit: number;
  offset: number;
}

export const getOrders = (query = "") =>
  req<PaginatedOrders>("GET", `/orders${query ? `?${query}` : ""}`);

export const getOrder = (id: number) =>
  req<ApiOrder>("GET", `/orders/${id}`);

export const refundOrder = (id: number) =>
  req<ApiOrder>("POST", `/orders/${id}/refund`);

export const reverseOrder = (id: number) =>
  req<ApiOrder>("POST", `/orders/${id}/reverse`);

// Maps ISO 4217 numeric currency codes (as stored by the payment gateway) to
// their human-readable alphabetic code. Mirrors the backend's mapping.
const CURRENCY_LABELS: Record<string, string> = {
  "051": "AMD",
};

export const currencyLabel = (code: string) => CURRENCY_LABELS[code] ?? code;

export const ordersCsvUrl = (query = "") =>
  `${BASE}/orders/export${query ? `?${query}` : ""}`;

export async function exportOrders(query = ""): Promise<Blob> {
  const res = await authedFetch(`/orders/export${query ? `?${query}` : ""}`, {});
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.blob();
}
