/** Per-day status used by the team calendar matrix view. */
export type CalendarMatrixStatus = "office" | "wfh" | "leave" | "break" | "off";

export type CalendarMatrixDay = {
  date: string; // YYYY-MM-DD
  status: CalendarMatrixStatus;
};

export type CalendarMatrixRow = {
  membership_id: string;
  name: string;
  department: string | null;
  days: CalendarMatrixDay[];
};

export type CalendarMatrix = {
  from: string;
  to: string;
  rows: CalendarMatrixRow[];
  groups?: { department: string; rows: CalendarMatrixRow[]; count: number }[];
};
