/** Pending approvals (leave / overtime / trip / manual_clock_in) shown to admin. */
export type ApprovalKind = "leave" | "overtime" | "outwork" | "trip" | "manual_clock_in";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ApprovalRow = {
  id: string;
  kind: ApprovalKind;
  status: ApprovalStatus;
  employee_id: string;
  employee_name: string;
  team?: string | null;
  summary: string; // e.g. "5/2 ~ 5/3 · 2일"
  reason?: string | null;
  submitted_at: string; // ISO
};
