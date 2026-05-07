export type OvertimeStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export type OvertimeRequest = {
  id: string;
  work_date: string;          // YYYY-MM-DD
  requested_minutes: number;
  reason: string;
  status: OvertimeStatus;
  created_at?: string;
};

export type OvertimeRequestBody = {
  work_date: string;
  requested_minutes: number;
  reason: string;
};

export type OvertimeSettings = {
  auto_enabled: boolean;
  auto_threshold_minutes: number;
};

export type OvertimeHistoryMonth = {
  ym: string; // YYYY-MM
  approved_minutes: number;
  approved_count: number;
};
