/**
 * Known demo accounts produced by `python manage.py seed_demo`.
 * Keep aligned with `services/api/apps/identity/management/commands/seed_demo.py`.
 *
 * Company: "Acme" (code "ACMEDM").
 * Password: "DemoPass!1" for every demo user.
 */
export const DEMO_PASSWORD = "DemoPass!1";
export const DEMO_COMPANY_CODE = "ACMEDM";

export type DemoRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

export type DemoUser = {
  email: string;
  password: string;
  role: DemoRole;
};

export const DEMO_USERS: Record<string, DemoUser> = {
  owner: { email: "owner@acme.demo", password: DEMO_PASSWORD, role: "OWNER" },
  admin: { email: "admin@acme.demo", password: DEMO_PASSWORD, role: "ADMIN" },
  manager: { email: "manager1@acme.demo", password: DEMO_PASSWORD, role: "MANAGER" },
  manager2: { email: "manager2@acme.demo", password: DEMO_PASSWORD, role: "MANAGER" },
  // Employees are randomized (seed_demo iterates EMPLOYEE_NAMES with random
  // suffix). Specs needing a specific employee should resolve via /v1/team
  // under a manager session — see realtime.spec.ts for the pattern.
  employeeFallback: { email: "admin@acme.demo", password: DEMO_PASSWORD, role: "ADMIN" },
};
