/**
 * Maps `/v1/attendance/today` (+ optional weekly + leave hints) into the
 * shape WidgetChannels.pushTodayStatus on the native side expects. Pure
 * function so it's trivial to unit-test.
 */
import type { AttendanceToday } from "@entities/attendance";
import type { TodayStatus, TodayStatusPayload } from "@shared/lib/native";

export type WidgetSyncInputs = {
  today: AttendanceToday | null;
  weekHours?: number;
  annualLeaveRemaining?: number;
  /** When the day is a registered LEAVE day, override status. */
  isLeaveDay?: boolean;
};

export function mapTodayToPayload(
  inputs: WidgetSyncInputs,
): TodayStatusPayload {
  const { today, weekHours, annualLeaveRemaining, isLeaveDay } = inputs;
  const status: TodayStatus = isLeaveDay
    ? "LEAVE"
    : today?.is_clocked_in
      ? "WORKING"
      : today?.clock_out_at
        ? "OFF"
        : "UNKNOWN";

  return {
    status,
    clockInAt: today?.clock_in_at ?? null,
    workedMinutes: today?.worked_minutes ?? 0,
    weekHours: weekHours ?? 0,
    annualLeaveRemaining: annualLeaveRemaining ?? 0,
  };
}
