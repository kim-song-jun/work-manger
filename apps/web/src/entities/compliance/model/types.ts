/** 52h compliance status payload returned by the API. */
export type ComplianceStatus = "OK" | "WARN" | "OVER";

export type MyComplianceWeek = {
  hours: string; // Decimal-as-string
  threshold_hours: string;
  remaining_hours: string;
  status: ComplianceStatus;
  week_start: string; // YYYY-MM-DD
};

export type CompanyComplianceMember = {
  membership_id: string;
  name: string;
  department: string | null;
  role: string;
  hours: string;
  threshold_hours: string;
  remaining_hours: string;
  status: ComplianceStatus;
};

export type CompanyComplianceBoard = {
  week_start: string;
  threshold_hours: string;
  members: CompanyComplianceMember[];
};
