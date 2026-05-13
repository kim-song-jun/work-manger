# Task Archive

> 종료된 iteration 의 task doc / findings / SESSION 보고서.
> 현재 active 작업과 미래 backlog 는 [`../index.md`](../index.md) 와 [`../backlog.md`](../backlog.md) 참조.

## 아카이브 이유

`docs/tasks/` 가 SESSION/findings 보고서로 비대해져 discoverability 가 저하됨 (2026-05-13 시점 15+ 파일). 종료 iteration 의 보고서를 본 디렉토리로 옮겨 main 디렉토리는 active + 최근 + backlog 만 유지한다.

git 히스토리는 `git mv` 로 보존됨 (각 파일 `git log --follow <path>` 로 추적 가능).

## 인덱스 (이전 순서: 신 → 구)

### iter13 backlog clear (2026-05-08)
- [SESSION-2026-05-08-iter13-backlog-clear.md](SESSION-2026-05-08-iter13-backlog-clear.md) — 5 agent 병렬 + main commit. 8 commits (bb1d9f4 → 8d34519). 3-platform installable artifacts 재빌드.

### iter12 live test (2026-05-08)
- [SESSION-2026-05-08-iter12-live-test.md](SESSION-2026-05-08-iter12-live-test.md) — 73 findings → 65 fix. PR #1 머지.
- [02-iter12-live-test-fix.md](02-iter12-live-test-fix.md) — iter12 task doc + Fix Plan + Acceptance
- [02-findings-admin.md](02-findings-admin.md), [02-findings-design.md](02-findings-design.md), [02-findings-employee.md](02-findings-employee.md), [02-findings-livetest.md](02-findings-livetest.md), [02-findings-manager.md](02-findings-manager.md), [02-findings-owner.md](02-findings-owner.md) — Wave 2 audit 6 doc

### iter11 remaining backlog (2026-05-08)
- [SESSION-2026-05-08-iter11-remaining-backlog.md](SESSION-2026-05-08-iter11-remaining-backlog.md) — ESLint v9 + iter11 6 wave. 10 commits.

### iter1~10 audit + bootstrap (2026-05-07)
- [SESSION-2026-05-07-audit-fix-bootstrap.md](SESSION-2026-05-07-audit-fix-bootstrap.md) — 진단 / CLAUDE.md+agent 부트스트랩 / Web+Electron 라이브 테스트 / 7건 GAP fix / Android 환경 셋업 + APK 빌드 검증
- [01-live-test-findings.md](01-live-test-findings.md) — Web/Electron/Android 라이브 테스트 GAP audit log

## 유지 정책

- 신규 task doc/finding 은 `docs/tasks/` 에 그대로 작성
- iteration 종료 + PR 머지 + 1주 경과 후 본 디렉토리로 이동
- 이동 시 [`index.md`](../index.md) "최근 완료" 에서 archive 링크로 갱신
- 영구 보존 (히스토리/감사 트레일 가치)
