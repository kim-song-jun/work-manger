# Task Index

> `/agent-all` 이 생성한 task doc + 세션 보고서 인덱스.

## 지금 Active

(없음)

## 최근 완료

- **[14-prelaunch-smoke-fixes.md](14-prelaunch-smoke-fixes.md)** (2026-05-10) — 출시 직전 풀 스모크 GAP fix: `/logout` SPA route 추가 + WM_DEBUG 임시 진단 코드 제거 + operations-guide §13 Android troubleshooting (JDK 17 + emulator 3옵션 비교). HomePage React `key` warning 은 phantom 으로 판명 (이미 `key={p.id}` 보유). **PR #2 머지** (`3cab1a3`). 5 commits, 5 gates ✅ (tester + qa×4 + designer + reviewer + planner). 20/20 acceptance, runtime 4건 (AC-2/4/5/8) 은 post-merge smoke 위임. ✅
- **[SESSION 2026-05-08 iter13](SESSION-2026-05-08-iter13-backlog-clear.md)** — iter12 backlog 6항목 + 3-platform 빌드/설치 환경 일체 (T1 OpenAPI regen + T2 weekly stats BE+FE + T3 COMP LeaveType + T4 E2E Playwright 4 페르소나 + T5 mobile geofence native + Glance + T6 billing 스켈레톤). 5개 agent 병렬 dispatch + main 직접 commit. **8 commits push** (bb1d9f4 → 8d34519). 3-platform installable artifacts 재빌드 (web/Electron Setup.exe/APK). ✅
- **[SESSION 2026-05-08 iter12](SESSION-2026-05-08-iter12-live-test.md)** — 3-platform 라이브 테스트 audit (5 sub-agent + main browser MCP) → 73 findings → 65 fix (P0×8 + P1×37 + P2×20). Wave 1 환경 fix (wm-api stale + CRLF + `.gitattributes`) + Wave 4a/4b/4c/4d/4e parallel fix. **PR #1 머지** (`7028389`). FE vitest 282/282, BE pytest 276/276. ✅
- **[02-iter12-live-test-fix.md](02-iter12-live-test-fix.md)** — iter12 task doc + Fix Plan + Acceptance ✅
- **[02-findings-{employee,manager,admin,owner,design,livetest}.md](02-findings-livetest.md)** — Wave 2 audit 6 doc (qa-x4 + designer + main live)
- **[SESSION 2026-05-08 iter11](SESSION-2026-05-08-iter11-remaining-backlog.md)** — SESSION 2026-05-07 보고서 정정 (3 fix) + ESLint v9 flat config + iter11 6 wave (exhaustive-deps + bundle splitting + BE bulk + load/chaos + 매뉴얼 + Help 보강 + AdminSettingsPage). 10 commits push. ✅
- **[SESSION 2026-05-07](SESSION-2026-05-07-audit-fix-bootstrap.md)** — 진단 / CLAUDE.md+agent 부트스트랩 / Web+Electron 라이브 테스트 / 7건 GAP fix / Android 환경 셋업 + APK 빌드 검증. 6 commits push. ✅ ([§12 정정 노트](SESSION-2026-05-07-audit-fix-bootstrap.md#12-감사-정정-노트-2026-05-08-추가) 참조)
- [01-live-test-findings.md](01-live-test-findings.md) — Web/Electron/Android 라이브 테스트 GAP 상세 (audit log)

## Backlog (다음 세션 권장)

### 코드 (iter14)
- **F-OWNER-07 billing 모듈 — Stripe 통합** (T6 에서 스켈레톤만 작성). SDK init + `STRIPE_*` env, `POST /v1/billing/checkout` (Stripe Checkout Session), webhook receiver (`POST /v1/billing/webhook` writing Invoice rows + flipping subscription status to ACTIVE/PAST_DUE), enable "Change plan" CTA, downgrade/cancel flow, payment method management UI, cursor pagination on `/v1/billing/invoices`.
- **iOS native — geofence + Glance widget 대응본** (T5 에서 Android 만 구현, iOS 는 Mac signing host 부재로 deferred). Dart MethodChannel 은 iOS 에서 graceful no-op.
- **COMP 휴가 타입 별도 balance bucket** (T3 에서 ANNUAL bucket 공유로 임시 구현). 승인된 overtime → 1:1 comp 일수 자동 적립 로직 + 별도 LeaveBalance kind.
- **iter13 발견 pre-existing test 정리**: `tests/test_seed_demo.py::test_seed_demo_creates_expected_rows` (T3 의 9 leave requests 반영), `apps/web/src/features/leave-apply/...` 2 vitest cases (post-T3 stale).
- **F-MANAGER P3 5건 deadcode 정리** (iter12 에서 deferred).

### 환경 (1회)
- Android emulator 부팅 — Hyper-V 충돌 해결 OR 실 단말 USB 연결
- Electron Setup.exe 코드사이닝 (EV 인증서 발급 후) — 현재 `electron-builder.unsigned.yml` 로 unsigned 빌드 가능
- Apple Notarization (Apple Developer ID + env)
- App Store / Play Store 개발자 계정 등록

### 운영 (코드 외)
- 외부 펜테스트, 법무 검토, GDPR 감사, prod Sentry/Grafana/PagerDuty DSN 주입, 온콜 로테이션, 백업 복원 리허설, stg 부하+카오스 실측 (스크립트 준비 완료)
