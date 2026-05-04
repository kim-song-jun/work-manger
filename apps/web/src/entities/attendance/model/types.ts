export type ClockKind = "OFFICE" | "WFH";

export type ClockInBody = {
  location: { latitude: number; longitude: number; accuracy_m: number };
  kind: ClockKind;
  client_time: string;
};

export type AttendanceStatus = "OK" | "LATE" | "OT" | "OFF" | "LIVE";

export type AttendanceRecord = {
  id: string;
  work_date: string;            // YYYY-MM-DD
  clock_in_at: string | null;   // ISO
  clock_out_at: string | null;  // ISO
  total_minutes: number | null;
  is_late: boolean;
  status: AttendanceStatus;
  location_label?: string | null;
  kind?: ClockKind | null;
};

export type AttendanceToday = {
  clock_in_at: string | null;
  clock_out_at: string | null;
  worked_minutes: number;
  is_clocked_in: boolean;
  kind?: ClockKind | null;
};
