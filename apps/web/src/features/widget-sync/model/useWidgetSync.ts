/**
 * Subscribe to `/v1/attendance/today` (already cached by react-query) and
 * forward each fresh snapshot into the home-screen widget store via
 * `window.NativeBridge.pushTodayStatus`. Strict no-op outside the Flutter
 * shell — `pushTodayStatus()` returns `false` when the bridge is absent.
 */
import { useEffect, useRef } from "react";

import { hasNativeBridge, pushTodayStatus } from "@shared/lib/native";
import type { AttendanceToday } from "@entities/attendance";

import { mapTodayToPayload } from "./mapTodayToPayload";

export type UseWidgetSyncArgs = {
  today: AttendanceToday | null | undefined;
  weekHours?: number;
  annualLeaveRemaining?: number;
  isLeaveDay?: boolean;
};

export function useWidgetSync(args: UseWidgetSyncArgs): void {
  const lastKey = useRef<string>("");

  useEffect(() => {
    if (!hasNativeBridge()) return;
    if (args.today === undefined) return; // not loaded yet

    const payload = mapTodayToPayload({
      today: args.today,
      weekHours: args.weekHours,
      annualLeaveRemaining: args.annualLeaveRemaining,
      isLeaveDay: args.isLeaveDay,
    });

    // Skip duplicate pushes — saves IPC + UserDefaults churn.
    const key = JSON.stringify(payload);
    if (key === lastKey.current) return;
    lastKey.current = key;

    void pushTodayStatus(payload);
  }, [
    args.today,
    args.weekHours,
    args.annualLeaveRemaining,
    args.isLeaveDay,
  ]);
}
