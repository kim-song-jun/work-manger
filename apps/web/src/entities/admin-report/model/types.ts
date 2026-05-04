/** Monthly admin report payload. */
export type ReportTeamRow = {
  team: string;
  attendance_rate: number;
  avg_weekly_hours: number;
  avg_overtime_hours: number;
};

export type AdminMonthlyReport = {
  ym: string; // YYYY-MM
  on_time_rate: number;
  avg_weekly_hours: number;
  total_overtime_hours: number;
  leave_usage_rate: number;
  teams: ReportTeamRow[];
};
