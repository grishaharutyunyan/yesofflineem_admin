const BASE = '/api/admin';

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

function authHeader(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

async function req<T>(method: string, path: string, token: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeader(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Public — no token
export async function login(email: string, password: string) {
  const res = await fetch('/api/admin/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid email or password');
  return res.json() as Promise<{ access_token: string; user: { id: number; email: string; role: string } }>;
}

export const changePassword = (token: string, currentPassword: string, newPassword: string) =>
  req<void>('PATCH', '/auth/change-password', token, { currentPassword, newPassword });

// Events
export const getEvents = (token: string, params = '') =>
  req<{ items: ApiEvent[]; count: number }>('GET', `/events${params ? '?' + params : ''}`, token);

export const getEvent = (token: string, id: number) =>
  req<ApiEvent>('GET', `/events/${id}`, token);

export const createEvent = (token: string, dto: object) =>
  req<ApiEvent>('POST', '/events', token, dto);

export const updateEvent = (token: string, id: number, dto: object) =>
  req<ApiEvent>('PUT', `/events/${id}`, token, dto);

export const deleteEvent = (token: string, id: number) =>
  req<void>('DELETE', `/events/${id}`, token);

// Videos
export const getVideos = (token: string) =>
  req<{ items: ApiVideo[]; count: number }>('GET', '/videos', token);

export const getVideo = (token: string, id: number) =>
  req<ApiVideo>('GET', `/videos/${id}`, token);

export const createVideo = (token: string, dto: object) =>
  req<ApiVideo>('POST', '/videos', token, dto);

export const updateVideo = (token: string, id: number, dto: object) =>
  req<ApiVideo>('PUT', `/videos/${id}`, token, dto);

export const deleteVideo = (token: string, id: number) =>
  req<void>('DELETE', `/videos/${id}`, token);

// Upload
export async function uploadImage(token: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()).url as string;
}

export async function uploadImages(token: string, files: File[]): Promise<string[]> {
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));
  const res = await fetch(`${BASE}/upload/images`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()).urls as string[];
}

export async function uploadVideo(token: string, file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(`${BASE}/upload/video`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return (await res.json()).url as string;
}
