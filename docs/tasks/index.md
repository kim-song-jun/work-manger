# Task Index

> `/agent-all` 이 생성한 task doc + 세션 보고서 인덱스.
> Backlog SDD: [`backlog.md`](backlog.md). 아카이브: [`archive/`](archive/).

## 지금 Active

(없음 — Phase 4 출시 준비 중. 다음 작업은 [`backlog.md`](backlog.md) 우선순위 참조.)

## 최근 완료

- **[14-prelaunch-smoke-fixes.md](14-prelaunch-smoke-fixes.md)** (2026-05-10) — 출시 직전 풀 스모크 GAP fix: `/logout` SPA route 추가 + WM_DEBUG 임시 진단 코드 제거 + operations-guide §13 Android troubleshooting. **PR #2 머지** (`3cab1a3`). 5 commits, 5 gates ✅. 20/20 acceptance, runtime 4건 post-merge smoke 위임. ✅
- **[14-findings.md](14-findings.md)** (2026-05-10) — prelaunch smoke finding 보고서
- 이전 iteration (iter11 ~ iter13) 의 SESSION 보고서 + findings 는 [`archive/`](archive/) 로 이동

## Backlog (SDD)

→ **[`backlog.md`](backlog.md)** — P0 (출시 블로커) / P1 (GA 직후) / P2 (v1.x) / P3 (v2) 분류

### 핵심 진행 후보 (P0/P1)

코드:
- **B-CODE-01** F-OWNER-07 Stripe 빌링 통합
- **B-CODE-02** iOS 네이티브 (geofence + WidgetKit)
- **B-CODE-03** COMP 휴가 별도 balance bucket
- **B-CODE-04** Pre-existing test 정리
- **B-CODE-06** admin_api + identity 백엔드 테스트 보강

운영 (P0):
- **B-OPS-01** Electron Setup.exe EV 코드사이닝
- **B-OPS-02** macOS Apple Notarization
- **B-OPS-03** App Store / Play Store 개발자 등록 + 첫 제출
- **B-OPS-04** 외부 펜테스트
- **B-OPS-05** prod 시크릿 + 모니터링 주입
- **B-OPS-06** 백업 / 복원 리허설
- **B-OPS-08** 법무 검토 + GDPR 감사

세부 acceptance criteria 및 의존성은 [`backlog.md`](backlog.md) 참조.

## SDD 베이스라인 문서 (2026-05-13 신규)

| 문서 | 목적 |
|---|---|
| [`../specs/implementation-status.md`](../specs/implementation-status.md) | 구현 현황 매트릭스 (도메인 × 플랫폼 × 인프라) |
| [`backlog.md`](backlog.md) | 작업 후보 SDD (acceptance criteria + 의존성) |
| [`../qa/feature-verification.md`](../qa/feature-verification.md) | 기능 검증 매트릭스 (페르소나 × 도메인) |
| [`../qa/ui-ux-verification.md`](../qa/ui-ux-verification.md) | UI/UX + a11y 검증 카탈로그 |
| [`../architecture/infra-verification.md`](../architecture/infra-verification.md) | Infra 검증 + Release Readiness Gate |

## 아카이브

- [archive/](archive/) — iter11/12/13 종료된 task doc + SESSION + findings (12 파일)
