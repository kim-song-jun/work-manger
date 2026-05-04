/**
 * Lightweight WebSocket subscription for inbox + notifications.
 *
 * Connects to `${VITE_WS_URL}/v1/ws/inbox?token=...`. On `inbox.task.decided`
 * or `notification.created` events, invalidates the relevant react-query keys
 * so the UI refreshes without polling.
 *
 * Resilient: swallows connection errors (jsdom / SSR safe), reconnects with
 * a small backoff. Designed to be mounted in pages — `useEffect` cleans up.
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

type InboxEvent =
  | { type: "inbox.task.decided"; id: string; status: "APPROVED" | "REJECTED" }
  | { type: "inbox.task.created"; id: string }
  | { type: "notification.created"; id: string }
  | { type: string; [k: string]: unknown };

function getToken(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem("wm:access");
  } catch {
    return null;
  }
}

function wsUrl(): string | null {
  if (typeof window === "undefined") return null;
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  const base = env.VITE_WS_URL ?? "";
  // Same-origin fallback (vite dev proxy handles /v1/ws/* upgrade).
  if (!base) {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    return `${proto}://${window.location.host}/v1/ws/inbox`;
  }
  return base.replace(/^http/, "ws") + "/v1/ws/inbox";
}

export function useInboxStream(opts: { enabled?: boolean } = {}) {
  const enabled = opts.enabled ?? true;
  const qc = useQueryClient();
  const sockRef = useRef<WebSocket | null>(null);
  const retriesRef = useRef(0);

  useEffect(() => {
    if (!enabled || typeof WebSocket === "undefined") return;
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      const url = wsUrl();
      if (!url) return;
      const token = getToken();
      const full = token ? `${url}?token=${encodeURIComponent(token)}` : url;
      let sock: WebSocket;
      try {
        sock = new WebSocket(full);
      } catch {
        scheduleReconnect();
        return;
      }
      sockRef.current = sock;

      sock.addEventListener("open", () => {
        retriesRef.current = 0;
      });
      sock.addEventListener("message", (ev) => {
        try {
          const msg = JSON.parse(String(ev.data)) as InboxEvent;
          if (msg.type === "inbox.task.decided" || msg.type === "inbox.task.created") {
            qc.invalidateQueries({ queryKey: ["inbox"] });
          } else if (msg.type === "notification.created") {
            qc.invalidateQueries({ queryKey: ["notifications"] });
            qc.invalidateQueries({ queryKey: ["inbox"] });
          }
        } catch {
          /* ignore non-JSON frames */
        }
      });
      sock.addEventListener("close", () => {
        if (!cancelled) scheduleReconnect();
      });
      sock.addEventListener("error", () => {
        try { sock.close(); } catch { /* noop */ }
      });
    }

    function scheduleReconnect() {
      if (cancelled) return;
      const delay = Math.min(30_000, 1000 * 2 ** Math.min(retriesRef.current, 5));
      retriesRef.current += 1;
      reconnectTimer = setTimeout(connect, delay);
    }

    connect();
    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (sockRef.current) {
        try { sockRef.current.close(); } catch { /* noop */ }
        sockRef.current = null;
      }
    };
  }, [enabled, qc]);
}
