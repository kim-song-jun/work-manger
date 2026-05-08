# Task Index

> `/agent-all` 이 생성한 task doc + 세션 보고서 인덱스.

## 지금 Active

(없음)

## 최근 완료

- **[SESSION 2026-05-08 iter12](SESSION-2026-05-08-iter12-live-test.md)** — 3-platform 라이브 테스트 audit (5 sub-agent + main browser MCP) → 73 findings → 65 fix (P0×8 + P1×37 + P2×20). Wave 1 환경 fix (wm-api stale + CRLF + `.gitattributes`) + Wave 4a/4b/4c/4d/4e parallel fix. **PR #1 머지** (`7028389`). FE vitest 282/282, BE pytest 276/276. ✅
- **[02-iter12-live-test-fix.md](02-iter12-live-test-fix.md)** — iter12 task doc + Fix Plan + Acceptance ✅
- **[02-findings-{employee,manager,admin,owner,design,livetest}.md](02-findings-livetest.md)** — Wave 2 audit 6 doc (qa-x4 + designer + main live)
- **[SESSION 2026-05-08 iter11](SESSION-2026-05-08-iter11-remaining-backlog.md)** — SESSION 2026-05-07 보고서 정정 (3 fix) + ESLint v9 flat config + iter11 6 wave (exhaustive-deps + bundle splitting + BE bulk + load/chaos + 매뉴얼 + Help 보강 + AdminSettingsPage). 10 commits push. ✅
- **[SESSION 2026-05-07](SESSION-2026-05-07-audit-fix-bootstrap.md)** — 진단 / CLAUDE.md+agent 부트스트랩 / Web+Electron 라이브 테스트 / 7건 GAP fix / Android 환경 셋업 + APK 빌드 검증. 6 commits push. ✅ ([§12 정정 노트](SESSION-2026-05-07-audit-fix-bootstrap.md#12-감사-정정-노트-2026-05-08-추가) 참조)
- [01-live-test-findings.md](01-live-test-findings.md) — Web/Electron/Android 라이브 테스트 GAP 상세 (audit log)

## Backlog (다음 세션 권장)

### 코드 (즉시 가능)
- 모바일 geofence native 등록 — `apps/mobile/lib/geofence/geofence_service.dart:69,80` (Android emulator + iOS Mac 부재로 본 세션 보류)
- OpenAPI types regen — 신규 admin/settings + admin/approvals/bulk 라우트가 spec 에 노출되도록 drf-spectacular `@extend_schema` 추가

### 환경 (1회)
- Android emulator 부팅 — Hyper-V 충돌 해결 OR 실 단말 USB 연결
- Electron Setup.exe 코드사이닝 (EV 인증서 발급 후)
- Apple Notarization (Apple Developer ID + env)
- App Store / Play Store 개발자 계정 등록

### 운영 (코드 외)
- 외부 펜테스트, 법무 검토, GDPR 감사, prod Sentry/Grafana/PagerDuty DSN 주입, 온콜 로테이션, 백업 복원 리허설, stg 부하+카오스 실측 (스크립트 준비 완료)
