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
 * BE accepts `start_date`/`end_date`
 * (apps/leave/serializers.LeaveRequestCreateSerializer).
 */
export type LeaveApplyBody = {
  start_date: string;          // YYYY-MM-DD
  end_date: string;
  reason?: string;
  kind: LeaveKind;
};

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LeaveRequest = {
  id: string;
  start_date: string;
  end_date: string;
  kind: LeaveKind;
  days: number;
  status: LeaveRequestStatus;
  reason?: string;
};
