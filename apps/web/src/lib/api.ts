const BASE = import.meta.env.VITE_API_URL ?? "";

type ApiError = { code: string; message: string; details?: unknown };

export class HttpError extends Error {
  constructor(public status: number, public body: { error?: ApiError } | undefined) {
    super(body?.error?.message ?? `HTTP ${status}`);
  }
}

let access: string | null = localStorage.getItem("wm:access") ?? null;

export function setAccessToken(t: string | null) {
  access = t;
  if (t) localStorage.setItem("wm:access", t);
  else localStorage.removeItem("wm:access");
}

export async function api<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.json !== undefined) {
    headers.set("Content-Type", "application/json");
    init.body = JSON.stringify(init.json);
  }
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const resp = await fetch(`${BASE}${path}`, { ...init, headers });
  const text = await resp.text();
  const body = text ? JSON.parse(text) : undefined;
  if (!resp.ok) throw new HttpError(resp.status, body);
  return body as T;
}
