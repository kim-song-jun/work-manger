/**
 * Test: shared/api · client (api + HttpError + setAccessToken)
 * Type: Unit (vitest, jsdom)
 * Why:  Every server call routes through `api()`. Lost Authorization header
 *       breaks auth across the app; missing JSON body breaks every POST.
 *       HttpError shape is the contract that the toast layer relies on.
 * Covers:
 *   - GET 200 happy path returns the parsed body
 *   - 4xx throws HttpError with status + envelope body
 *   - Authorization header attached when token set; cleared when null
 *   - Content-Type set automatically when `json` body is provided
 *   - JSON body is the stringified `json` payload
 * Out of scope:
 *   - Refresh-token retry (not implemented in client.ts)
 *   - Network-error path (re-thrown by fetch — caller's job)
 * Coverage target: ≥ 90% lines for client.ts
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { api, HttpError, setAccessToken } from "./client";

function mockFetchOnce(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const text = body === undefined ? "" : JSON.stringify(body);
  const resp = {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    text: () => Promise.resolve(text),
  } as unknown as Response;
  return vi.spyOn(window, "fetch").mockResolvedValueOnce(resp);
}

describe("shared/api · client", () => {
  beforeEach(() => {
    localStorage.clear();
    setAccessToken(null);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("GET 200 returns the parsed body", async () => {
    const spy = mockFetchOnce({ data: { ok: true } });
    const r = await api<{ data: { ok: boolean } }>("/v1/ping");
    expect(r.data.ok).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBe("/v1/ping");
    const [, init] = spy.mock.calls[0];
    const headers = init!.headers as Headers;
    expect(headers.get("Accept")).toBe("application/json");
  });

  it("attaches Authorization header when access token is set", async () => {
    setAccessToken("tok-xyz");
    const spy = mockFetchOnce({ data: 1 });
    await api("/v1/me");
    const headers = (spy.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer tok-xyz");
  });

  it("does NOT send Authorization when token is null", async () => {
    const spy = mockFetchOnce({ data: 1 });
    await api("/v1/public");
    const headers = (spy.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("setAccessToken(null) removes the header for subsequent calls", async () => {
    setAccessToken("first");
    setAccessToken(null);
    const spy = mockFetchOnce({ data: 1 });
    await api("/v1/x");
    const headers = (spy.mock.calls[0][1] as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
    expect(localStorage.getItem("wm:access")).toBeNull();
  });

  it("setAccessToken persists the value to localStorage", () => {
    setAccessToken("persist-me");
    expect(localStorage.getItem("wm:access")).toBe("persist-me");
  });

  it("attaches Content-Type and serializes body when `json` provided", async () => {
    const spy = mockFetchOnce({ data: { id: "u1" } });
    await api("/v1/auth/login", { method: "POST", json: { email: "a@b" } });
    const init = spy.mock.calls[0][1] as RequestInit;
    const headers = init.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ email: "a@b" }));
  });

  it("throws HttpError with status and envelope body on 4xx", async () => {
    mockFetchOnce(
      { error: { code: "INVALID_CREDENTIALS", message: "wrong password" } },
      { ok: false, status: 401 },
    );
    await expect(api("/v1/auth/login")).rejects.toMatchObject({
      status: 401,
    });

    mockFetchOnce(
      { error: { code: "FORBIDDEN", message: "no access" } },
      { ok: false, status: 403 },
    );
    try {
      await api("/v1/inbox");
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(HttpError);
      expect((e as HttpError).status).toBe(403);
      expect((e as HttpError).message).toBe("no access");
    }
  });

  it("HttpError default message uses HTTP <status> when body missing", async () => {
    mockFetchOnce(undefined, { ok: false, status: 500 });
    try {
      await api("/v1/x");
      throw new Error("unreachable");
    } catch (e) {
      expect((e as HttpError).message).toBe("HTTP 500");
    }
  });
});
