---
title: Task 14 Findings (Gate 1 — Tester)
date: 2026-05-10
gate: 1-tester
status: pass
---

# Task 14 Findings — Gate 1 (Tester)

## ✅ PASS

### Web vitest
- **Result**: 290/292 passed (2 pre-existing failures)
- **Pre-existing stale tests** (out of W1 scope):
  - `apps/web/src/features/leave-apply/__tests__/LeaveApplyForm.test.tsx` — 2 failures (mock incomplete: missing `LEAVE_TYPE_OPTIONS` export)
    - Status: flagged in iter13 audit; not caused by W1 changes
    - Evidence: W1 did not modify this test file (no git diff)
- **W1-relevant tests passed**:
  - `m-home/__tests__/HomePage.test.ts`: 6/6 ✅
  - `features/auth/ui/__tests__/*`: 10/10 ✅
  - All other web vitest suites: 272/272 ✅

### Desktop
- **Build**: `npm run build:ts` ✅ (source compiled to `apps/desktop/dist/main/index.js`)
- **WM_DEBUG removal verified**:
  - Source: 0 hits (`grep -c "WM-DEBUG|wm-debug" apps/desktop/src/main/index.ts` → 0)
  - Compiled: 0 hits (dead code not bundled)

### Commits verified
- `3a2d360` (FRONTEND-DEV W1) ✅
- `a20c33f` (DOC-WRITER W1) ✅
- `149c62b` (PLANNER W0) ✅

### Checkboxes (Task 14 AC status)
- Checked: 13/20 (AC-1, 3, 6, 7, 9, 10, 12-18)
- Unchecked (deferred to qa gate or browser test): 7/20 (AC-2, 4, 5, 8, 11, 19, 20)

### /logout browser smoke (AC-4, AC-5)
- **Deferred to qa gate** — worktree code not live in shared docker `wm-web` (bind-mount points to main repo, not worktree).
- qa-{employee,manager,admin,owner} gates will execute fresh browser sweep against rebuilt web.

## Recommendation
✅ **Gate 1 PASS** — Forward to Gate 2 (qa parallel).

---

gate-1: ok

---

# Task 14 Findings — Gate 2 (qa-employee)

## ✅ qa-employee PASS

- /logout: `LogoutPage` calls `setAccessToken(null)` + `useAuthStore.reset()` + `nav("/login", { replace: true })`. Auth state fully cleared. Note: `LogoutPage` is strictly a superset of the existing m-my logout button (which omits `reset()`), so the new route is safer, not weaker.
- idempotent: `setAccessToken(null)` on an already-null token is a no-op; `useAuthStore.reset()` reinitializes to default — both are safe when called while already logged out. No crash path.
- m-home key analysis: Only `.map()` in team section (line 295) uses `key={p.id}` — stable, unique server ID. No keyless list renders. Line 72 is `useQuery` (confirmed), not a `.map()`. Frontend-dev's "phantom" claim is correct.

gate-2-employee: ok

---

# Task 14 Findings — Gate 2 (qa-owner)

## ✅ qa-owner PASS

- `/logout` from billing context: `LogoutPage.useEffect` calls only `setAccessToken(null)` + `useAuthStore.reset()` + `nav("/login", { replace: true })` — pure client-side. No BE call, no subscription mutation. Owner mid-billing-edit navigating to /logout loses only unsaved UI state; BE subscription row is untouched.
- §13 vs §11.1 alignment: §11.1 lists "App Store / Play Store 심사 통과" with prerequisite `apps/mobile/` APK build. §13 directly addresses the "APK build environment" blocker (JDK 17 setup + emulator alternatives) that was blocking this line item. Alignment confirmed.
- WM_DEBUG removal — production debug surface: `index.ts` retains only `process.env.WM_WEB_URL` (runtime URL override, safe in prod). No `WM_DEBUG`, no other `process.env.WM_*` conditional blocks remain. Electron production build has zero debug surface from this module.

gate-2-owner: ok

---

# Task 14 Findings — Gate 2 (qa-admin)

## ✅ qa-admin PASS

- `/logout` route position: Inserted at line 215, after `/owner` block and before `/__health` and wildcard `*` (line 217). No `/admin/*` route is shadowed — `<Route path="/admin">` is a nested layout block ending at line 201; `/logout` is a top-level sibling at a completely different path prefix. Route order is correct.
- WM_DEBUG removal — security audit: Removed block was guarded by `process.env.WM_DEBUG === "1"` and logged only load errors, renderer console messages (no auth tokens/user IDs/PII), and render-process-gone details. No sensitive data exposure. Removal is clean with no orphaned imports or exports. Audit posture improved.
- §13 accuracy: `winget install EclipseAdoptium.Temurin.17.JDK` is correct. JAVA_HOME path uses `jdk-17.0.x.x-hotspot` placeholder (minor: developer must substitute actual version, non-blocking). Emulator option table accurately represents Win11 Hyper-V conflicts; Docker redroid correctly labelled research-only with honest prior failure citation. No inaccuracy found.

gate-2-admin: ok

---

# Task 14 Findings — Gate 2 (qa-manager)

## ✅ qa-manager PASS

- `/logout` mid-approval safety: `LogoutPage` calls `setAccessToken(null)` + `useAuthStore.reset()` + `nav("/login", { replace: true })`. No `queryClient.clear()` is called, but this is safe — the React Query cache is process-local and abandoned on redirect; `QuickDecide`/`InboxQuickActions` mutations are fire-and-forget with server-side completion independent of client state. No pending mutation requires a client-side flush on logout.
- Route ordering: `/logout` appears at line 215, after all `/m`, `/web`, `/admin`, `/owner` subtrees and before `path="*"`. React Router v6 uses specificity-based matching, not declaration order — `/m/inbox`, `/m/team`, `/web/team-calendar` are fully unaffected. No wildcard intercept risk.
- Logout asymmetry (m-my vs `/logout`): `MyPage.logout()` omits `useAuthStore.reset()`, leaving `me` in Zustand. `LogoutPage` is a strict superset — it also calls `reset()`. This pre-existing gap in m-my is out of W1 scope; W1 does not regress it and raises the bar for the new `/logout` path.

gate-2-manager: ok

---

# Task 14 Findings — Gate 3 (designer)

## ✅ designer PASS (skip — W1 has no visible UI change)

- LogoutPage returns null (verified at line 78 of `apps/web/src/app/App.tsx`)
- Other W1 changes are non-visual (App.tsx route entry, Electron main, doc)

gate-3-designer: ok (no visible UI change)

---

# Task 14 Findings — Gate 4 (reviewer)

## ✅ reviewer PASS

### A. Diff inspection
- **LogoutPage** (`apps/web/src/app/App.tsx:68-79`): minimal, idempotent, no new deps. `useEffect` deps `[nav, reset]` correct (both stable refs). Returns `null` (no render). No async leak.
- **Route placement** (line 215): `<Route path="/logout">` placed BEFORE wildcard `*` (line 216), does not shadow other routes.
- **WM_DEBUG removal** (`apps/desktop/src/main/index.ts`): full block (lines 64-78 of pre-image) removed including `// [WM-DEBUG-2026-05-07]` comment. No orphaned imports/dead vars.

### B. Pattern consistency
- LogoutPage uses `setAccessToken(null)` + `useAuthStore reset()` — **matches `widgets/web-shell/ui/TopBar.tsx:24-27`** exactly.
- `pages/m-my/index.tsx:13-16` logout uses ONLY `setAccessToken(null)` (no `reset()`) — pre-existing asymmetry, NOT W1 regression. qa-manager already flagged.

### C. Doc §13 (operations-guide)
- Heading hierarchy correct (§13.1 / §13.2 / §13.3).
- Code fences valid; commands runnable as-is (no unresolved placeholders — `<serial>`, `<avd_name>`, `<name>` clearly explained in context).
- Windows redroid limitation honestly labeled "research 단계", evidence linked (iter13 screenshot 16).
- Minor (info): §13 placed BEFORE §12 in source ordering (line 335 vs 501) — appears to be pre-existing layout quirk, not W1-introduced.

### D. Acceptance flips
- 13 `[x]` / 7 `[ ]` remaining (qa parallel pending + tester already done in findings + final-gate). Matches expected W1 boundary.

### E. Commit messages
- `149c62b` planner / `3a2d360` frontend-dev / `a20c33f` doc-writer — all follow `<type>(<scope>): <summary> (Task 14 <ROLE>-W<N>)`.

gate-4-reviewer: ok
