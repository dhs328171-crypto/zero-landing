/**
 * ZERO API client — talks to the Express backend at /api
 * (Vite dev server proxies /api → http://localhost:3001)
 */

const API_BASE = "/api";

export function getToken(): string | null {
  return localStorage.getItem("zero_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("zero_token", token);
  else localStorage.removeItem("zero_token");
}

export interface ApiError {
  error: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** Build a query string from a flat object. Skips null/undefined/empty. */
export function qs(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (typeof v === "boolean") sp.set(k, v ? "true" : "false");
    else sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const isForm =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!isForm) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data as ApiError).error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data as T;
  } catch (e: any) {
    if (e.message === "Failed to fetch") {
      throw new Error("تعذّر الاتصال بالخادم. تأكد من تشغيل الـ backend.");
    }
    throw e;
  }
}

export const apiGet = <T = any>(path: string) => api<T>(path);
export const apiPost = <T = any>(path: string, body?: any) =>
  api<T>(path, { method: "POST", body: JSON.stringify(body || {}) });
export const apiPut = <T = any>(path: string, body?: any) =>
  api<T>(path, { method: "PUT", body: JSON.stringify(body || {}) });
export const apiDelete = <T = any>(path: string, body?: any) =>
  api<T>(path, { method: "DELETE", body: body ? JSON.stringify(body) : undefined });

/** Upload one or more files via multipart/form-data. Returns parsed JSON. */
export async function apiUpload<T = any>(
  path: string,
  files: File | File[],
  fieldName = "files"
): Promise<T> {
  const fd = new FormData();
  const arr = Array.isArray(files) ? files : [files];
  arr.forEach((f) => fd.append(fieldName, f));
  return api<T>(path, { method: "POST", body: fd });
}
