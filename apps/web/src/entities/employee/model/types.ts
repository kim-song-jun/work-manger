/** Employee entity types — admin-side directory and detail. */
export type EmployeeRole = "EMPLOYEE" | "MANAGER" | "ADMIN" | "OWNER";

export type EmployeeStatus =
  | "office"
  | "wfh"
  | "leave"
  | "break"
  | "off"
  | "active"
  | "inactive";

export type Employee = {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  team?: string | null;
  position?: string | null;
  department?: string | null;
  joined_at?: string | null;
  status?: EmployeeStatus;
  active?: boolean;
};

export type EmployeeListQuery = {
  q?: string;
  role?: EmployeeRole | "ALL";
};

export type EmployeeAttendanceDay = {
  date: string; // YYYY-MM-DD
  worked_minutes: number;
  status?: EmployeeStatus;
};

export type EmployeeDetail = Employee & {
  leave?: {
    remaining: number;
    used: number;
    accrued: number;
    expiring: number;
  } | null;
  attendance_30d?: EmployeeAttendanceDay[];
  monthly_hours?: number;
  remaining_leave_days?: number;
};

export type EmployeeUpdatePatch = {
  role?: EmployeeRole;
  position?: string | null;
  department?: string | null;
  active?: boolean;
};
