/**
 * Persona spec shared helpers (iter13 T4).
 *
 * Page-object-lite layer for the four-persona E2E suite. Composes
 * `apps/e2e/fixtures/auth.ts` + `users.ts` and adds:
 *
 *   - `loginPersona` — programmatic login + navigate to the persona's landing
 *   - role-aware default routes
 *   - resilient label selectors derived from `apps/web/src/shared/i18n/index.ts`
 *
 * Selector strategy (per task spec):
 *   - Prefer ARIA role + accessible name (regex tolerates whitespace/i18n drift).
 *   - Fall back to data-testid only when the underlying component already
 *     exposes one (e.g. inbox-item, inbox-approve, slider).
 *   - Avoid CSS class selectors — they break on every design tweak.
 */
import { expect, type Page } from "@playwright/test";
import {
  attachAuthToContext,
  loginViaApi,
  resolveEmployeeEmail,
  type AuthSession,
} from "@fixtures/auth";
import { DEMO_USERS, type DemoUser } from "@fixtures/users";

export type Persona = "employee" | "manager" | "admin" | "owner";

/**
 * Default landing route per persona.
 * EMPLOYEE / MANAGER → mobile (`/m/home`).
 * ADMIN / OWNER → admin web (`/admin`).
 *
 * Aligns with `App.tsx` post-login redirect rules and the role-guard that
 * sends ADMIN/OWNER straight to /admin (see `all-pages.spec.ts` "private route
 * permissions" assertions).
 */
export const PERSONA_LANDING: Record<Persona, RegExp> = {
  employee: /\/m\/home/,
  manager: /\/m\/home/,
  admin: /\/admin\/?$/,
  owner: /\/admin\/?$/,
};

/**
 * Resolve a DemoUser for a persona. The "employee" persona has its email
 * resolved at runtime via `/v1/team/status/grid` because seed_demo randomizes
 * employee local-parts.
 */
export async function resolvePersonaUser(persona: Persona): Promise<DemoUser> {
  if (persona === "owner") return DEMO_USERS.owner;
  if (persona === "admin") return DEMO_USERS.admin;
  if (persona === "manager") return DEMO_USERS.manager;

  // employee: ask the manager for a real EMPLOYEE-role membership email.
  const managerSession = await loginViaApi(DEMO_USERS.manager);
  const email = await resolveEmployeeEmail(managerSession);
  if (!email) {
    throw new Error(
      "[persona] could not resolve employee email — did `docker compose run --rm seed` complete?",
    );
  }
  return { email, password: DEMO_USERS.employee.password, role: "EMPLOYEE" };
}

/**
 * Programmatic login that bypasses the form and lands on the persona's
 * default route. Returns the auth session in case the spec needs to make
 * direct API calls (e.g. seeding a fixture row).
 */
export async function loginPersona(
  page: Page,
  persona: Persona,
): Promise<{ session: AuthSession; user: DemoUser }> {
  const user = await resolvePersonaUser(persona);
  const session = await loginViaApi(user);
  await attachAuthToContext(page.context(), session);
  // Visit the login page first so SPA bootstraps with the injected token,
  // then navigate to the persona landing. Mirrors `seedAuth` in all-pages.spec.
  await page.goto("/login", { waitUntil: "domcontentloaded", timeout: 30_000 });
  const landing = persona === "employee" || persona === "manager" ? "/m/home" : "/admin";
  await page.goto(landing, { waitUntil: "load", timeout: 30_000 });
  await expect(page).toHaveURL(PERSONA_LANDING[persona], { timeout: 10_000 });
  return { session, user };
}

/**
 * Korean labels referenced by specs. Keep aligned with
 * `apps/web/src/shared/i18n/index.ts` (Korean tree). Using regex with the `i`
 * flag absorbs minor copy edits and pluralization.
 */
export const KO = {
  // 출퇴근 (mobile home)
  slideIn: /밀어서 출근|출근/,
  slideOut: /밀어서 퇴근|퇴근/,
  clockInToast: /출근이 등록됐어요|근무 중|근무중/,
  // 휴게 — record-detail timeline label
  break: /휴게/,
  // 연차
  leaveApply: /연차 신청|신청하기/,
  leaveTab: /연차/,
  // Inbox / approvals
  approve: /승인/,
  reject: /반려|거절/,
  // 알림
  notifications: /알림/,
  // Admin
  adminEmployees: /직원/,
  adminAudit: /감사/,
  adminCodes: /코드|초대 코드/,
  adminSettings: /설정|회사 설정/,
  // Owner / company
  companyName: /회사명/,
  dataExport: /내보내기/,
  // Manager — team calendar + approvals
  teamCalendar: /팀 캘린더|팀 연차/,
  // Onboarding (company-join flow)
  companyCodeTitle: /회사 코드/,
  welcomeStart: /시작하기/,
} as const;

/**
 * Slide-to-clock-{in,out} drag helper. Copy-pasted from `clock-in.spec.ts`
 * because the persona suite needs the same gesture. We cannot import the
 * private helper — that spec keeps it module-local.
 */
export async function dragSliderRight(page: Page): Promise<void> {
  const slider = page.getByRole("slider").first();
  await expect(slider).toBeVisible({ timeout: 5_000 });
  const box = await slider.boundingBox();
  if (!box) throw new Error("slider has no bounding box — is /m/home rendered?");
  const startX = box.x + 20;
  const endX = box.x + box.width - 20;
  const y = box.y + box.height / 2;
  await page.mouse.move(startX, y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i += 1) {
    await page.mouse.move(startX + ((endX - startX) * i) / 10, y, { steps: 2 });
  }
  await page.mouse.up();
}
