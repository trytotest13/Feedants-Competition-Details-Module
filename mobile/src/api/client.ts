import { ApiEnvelope } from './types';

export const API_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** Token provider is injected by the auth layer to avoid a circular import. */
let tokenProvider: () => Promise<string | null> = async () => null;
let onUnauthorized: () => void = () => {};

export function configureApi(opts: {
  getToken: () => Promise<string | null>;
  onUnauthorized?: () => void;
}) {
  tokenProvider = opts.getToken;
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
}

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // fallthrough — non-JSON response
  }
  if (!res.ok || !body?.success) {
    const code = body?.error?.code ?? 'REQUEST_FAILED';
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    if (res.status === 401) onUnauthorized();
    throw new ApiClientError(res.status, code, message);
  }
  return body.data as T;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await tokenProvider();
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  return parseEnvelope<T>(res);
}

/** Multipart upload helper (submissions). */
export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const token = await tokenProvider();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { method: 'POST', body: form, headers });
  return parseEnvelope<T>(res);
}
