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

export type LeaveApplyBody = {
  starts_on: string;          // YYYY-MM-DD
  ends_on: string;
  reason?: string;
  kind: LeaveKind;
};

export type LeaveRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type LeaveRequest = {
  id: string;
  starts_on: string;
  ends_on: string;
  kind: LeaveKind;
  days: number;
  status: LeaveRequestStatus;
  reason?: string;
};
