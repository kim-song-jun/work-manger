/** Admin dashboard KPI snapshot. */
export type AdminDashboard = {
  attendance_rate: number; // 0–100 %
  absent_count: number;
  pending_approvals: number;
  ongoing_overtime: number;
  headcount?: number;
  date?: string;
};
