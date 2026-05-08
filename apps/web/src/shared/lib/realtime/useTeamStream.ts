/**
 * useTeamStream — connect to /v1/ws/team and invalidate team queries on
 * `team.status.changed` events. Quietly no-ops in non-browser/test envs.
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@shared/lib/store/useAuthStore";

type WsEvent = { type: string; payload?: unknown };

function makeUrl(token: string): string {
  const base = (typeof location !== "undefined" ? location.origin : "")
    .replace(/^http/, "ws");
  return `${base}/v1/ws/team?token=${encodeURIComponent(token)}`;
}

function closeSocketQuietly(ws: WebSocket): void {
  if (ws.readyState === WebSocket.CONNECTING) {
    ws.addEventListener("open", () => ws.close(), { once: true });
    return;
  }
  try {
    ws.close();
  } catch {
    /* ignore */
  }
}

export function useTeamStream(enabled: boolean = true): void {
  const qc = useQueryClient();
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasMembership = useAuthStore((s) => Boolean(s.me?.memberships?.length));
  useEffect(() => {
    if (!enabled) return;
    if (!accessToken) return;
    if (!hasMembership) return;
    if (typeof WebSocket === "undefined") return;
    const url = makeUrl(accessToken);
    let ws: WebSocket | null = null;
    let cancelled = false;
    try {
      ws = new WebSocket(url);
    } catch {
      return;
    }
    ws.addEventListener("message", (ev) => {
      if (cancelled) return;
      try {
        const data = JSON.parse(String(ev.data)) as WsEvent;
        if (data?.type === "team.status.changed") {
          qc.invalidateQueries({ queryKey: ["team-status"] });
          qc.invalidateQueries({ queryKey: ["team-status", "grid"] });
          qc.invalidateQueries({ queryKey: ["team-status", "grouped"] });
          qc.invalidateQueries({ queryKey: ["team-status", "timeline"] });
        }
      } catch {
        /* ignore non-JSON frames */
      }
    });
    return () => {
      cancelled = true;
      if (ws) closeSocketQuietly(ws);
    };
  }, [enabled, accessToken, hasMembership, qc]);
}
