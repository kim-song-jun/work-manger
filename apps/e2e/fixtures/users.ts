/**
 * Known demo accounts produced by `python manage.py seed_demo`.
 * Keep aligned with `services/api/apps/identity/management/commands/seed_demo.py`.
 *
 * Company: "Acme" (code "ACMEDM").
 * Password: "DemoPass!1" for every demo user.
 *
 * NOTE: Employees are randomized at seed time (seed_demo iterates EMPLOYEE_NAMES
 * with a random suffix). Specs that need a real employee account should call
 * `resolveEmployeeEmail()` from `auth.ts` to discover one under a manager session.
 * `DEMO_USERS.employee` exposes only the shared password — use the resolver to
 * fill in the email at runtime.
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
  // Stable, fixed-email manager — has direct reports under seed_demo.
  manager: { email: "manager1@acme.demo", password: DEMO_PASSWORD, role: "MANAGER" },
  manager2: { email: "manager2@acme.demo", password: DEMO_PASSWORD, role: "MANAGER" },
  // Employee is a placeholder — email resolved at runtime via /v1/team.
  // Specs that depend on a real EMPLOYEE membership should use
  // `resolveEmployeeEmail(managerSession)` from `auth.ts` and overwrite `email`.
  employee: { email: "<resolve-at-runtime>", password: DEMO_PASSWORD, role: "EMPLOYEE" },
  employeeFallback: { email: "admin@acme.demo", password: DEMO_PASSWORD, role: "ADMIN" },
};
