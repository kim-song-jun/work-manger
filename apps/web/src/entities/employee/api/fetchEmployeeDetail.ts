import { api, HttpError } from "@shared/api";

import type { EmployeeDetail, EmployeeRole, EmployeeStatus } from "../model/types";

type Envelope<T> = { data: T };
type Numberish = string | number | null | undefined;
type BackendEmployee = Partial<EmployeeDetail> & {
  department_name?: string | null;
  employee_no?: string | null;
  hired_at?: string | null;
  is_active?: boolean;
};
type BackendEmployeeDetail = Partial<EmployeeDetail> & {
  employee?: BackendEmployee;
  leave?: {
    granted?: Numberish;
    accrued?: Numberish;
    used?: Numberish;
    remaining?: Numberish;
    expiring?: Numberish;
  } | null;
  recent_attendance?: BackendAttendanceDay[];
};
type BackendAttendanceDay = {
  date?: string;
  work_date?: string;
  worked_minutes?: number | null;
  total_work_minutes?: number | null;
  status?: EmployeeStatus;
};

function numberValue(value: Numberish): number {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function roleValue(value: unknown): EmployeeRole {
  return value === "OWNER" || value === "ADMIN" || value === "MANAGER" || value === "EMPLOYEE"
    ? value
    : "EMPLOYEE";
}

function normalizeDetail(raw: BackendEmployeeDetail): EmployeeDetail {
  const employee: BackendEmployee = raw.employee ?? raw;
  const leave = raw.leave ?? null;
  const attendance: BackendAttendanceDay[] =
    (raw.attendance_30d as BackendAttendanceDay[] | undefined) ?? raw.recent_attendance ?? [];
  return {
    id: employee.id ?? "",
    name: employee.name ?? "",
    email: employee.email ?? "",
    role: roleValue(employee.role),
    team: employee.team ?? employee.department_name ?? employee.department ?? null,
    position: employee.position ?? null,
    department: employee.department ?? employee.department_name ?? null,
    joined_at: employee.joined_at ?? employee.hired_at ?? null,
    status: employee.status,
    active: employee.active ?? employee.is_active,
    leave: leave
      ? {
          remaining: numberValue(leave.remaining),
          used: numberValue(leave.used),
          accrued: numberValue(leave.accrued ?? leave.granted),
          expiring: numberValue(leave.expiring),
        }
      : raw.leave ?? null,
    attendance_30d: attendance.map((day) => ({
      date: day.date ?? day.work_date ?? "",
      worked_minutes: day.worked_minutes ?? day.total_work_minutes ?? 0,
      status: day.status,
    })),
    monthly_hours: raw.monthly_hours,
    remaining_leave_days: raw.remaining_leave_days,
  };
}

/** GET /v1/admin/employees/{id} — detail with leave + 30d attendance. */
export async function fetchEmployeeDetail(
  id: string,
): Promise<EmployeeDetail | null> {
  try {
    const r = await api<Envelope<BackendEmployeeDetail>>(`/v1/admin/employees/${id}`);
    return normalizeDetail(r.data);
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  }
}
