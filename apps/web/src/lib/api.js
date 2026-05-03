const BASE = import.meta.env.VITE_API_URL ?? "";
export class HttpError extends Error {
    status;
    body;
    constructor(status, body) {
        super(body?.error?.message ?? `HTTP ${status}`);
        this.status = status;
        this.body = body;
    }
}
let access = localStorage.getItem("wm:access") ?? null;
export function setAccessToken(t) {
    access = t;
    if (t)
        localStorage.setItem("wm:access", t);
    else
        localStorage.removeItem("wm:access");
}
export async function api(path, init = {}) {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (init.json !== undefined) {
        headers.set("Content-Type", "application/json");
        init.body = JSON.stringify(init.json);
    }
    if (access)
        headers.set("Authorization", `Bearer ${access}`);
    const resp = await fetch(`${BASE}${path}`, { ...init, headers });
    const text = await resp.text();
    const body = text ? JSON.parse(text) : undefined;
    if (!resp.ok)
        throw new HttpError(resp.status, body);
    return body;
}
