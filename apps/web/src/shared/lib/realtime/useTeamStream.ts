/**
 * useTeamStream — connect to /v1/ws/team and invalidate team queries on
 * `team.status.changed` events. Quietly no-ops in non-browser/test envs.
 */
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

type WsEvent = { type: string; payload?: unknown };

function getToken(): string | null {
  try {
    return localStorage.getItem("wm:access");
  } catch {
    return null;
  }
}

function makeUrl(token: string | null): string {
  const base = (typeof location !== "undefined" ? location.origin : "")
    .replace(/^http/, "ws");
  const tk = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${base}/v1/ws/team${tk}`;
}

export function useTeamStream(enabled: boolean = true): void {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled) return;
    if (typeof WebSocket === "undefined") return;
    const url = makeUrl(getToken());
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
      try {
        ws?.close();
      } catch {
        /* ignore */
      }
    };
  }, [enabled, qc]);
}
