export type LeaveBalance = {
  remaining: number;
  used: number;
  accrued: number;
  expiring: number;
};

export type TeamLeaveDay = {
  date: string;                         // YYYY-MM-DD
  members: { id: string; name: string }[];
};

export type TeamLeaveCalendar = {
  from: string;                          // YYYY-MM-DD
  to: string;
  days: TeamLeaveDay[];
};

export type LeaveKind = "FULL" | "AM_HALF" | "PM_HALF";

/**
 * iter13 T3 — logical leave category. Defaults to ANNUAL on the BE so the
 * field is optional in submit bodies (preserves backwards compatibility).
 * COMP (보상휴가) shares the ANNUAL balance bucket today; SICK / PERSONAL
 * are reserved for upcoming policy work.
 */
export type LeaveType = "ANNUAL" | "COMP" | "SICK" | "PERSONAL";

/** Options surfaced in the apply UI (i18n key per option). */
export const LEAVE_TYPE_OPTIONS: ReadonlyArray<{
  value: LeaveType;
  i18nKey: string;
}> = [
  { value: "ANNUAL", i18nKey: "leave.type.annual" },
  { value: "COMP", i18nKey: "leave.type.comp" },
];

/**
 * BE accepts `start_date`/`end_date`
 * (apps/leave/serializers.LeaveRequestCreateSerializer).
 */
export type LeaveApplyBody = {
  start_date: string;          // YYYY-MM-DD
  end_date: string;
  reason?: string;
  kind: LeaveKind;
  leave_type?: LeaveType;
};

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type LeaveRequest = {
  id: string;
  start_date: string;
  end_date: string;
  kind: LeaveKind;
  leave_type?: LeaveType;
  days: number;
  status: LeaveRequestStatus;
  reason?: string;
};
