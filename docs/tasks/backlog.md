# Backlog — 앞으로 작업해야 할 Task (SDD)

> **Document version**: 1.0
> **Last updated**: 2026-05-13
> **Phase**: 4 · v1.0 출시 준비
> **Source**: `docs/specs/implementation-status.md` §7 갭 인벤토리

본 문서는 향후 작업 후보의 SDD(Specification-Driven Development) 형식 목록이다. 각 항목은 ID, 목적, 사용자/시스템 플로우, 비즈니스 룰, 수용 기준(Acceptance Criteria), 의존성, 우선순위를 포함한다.

작업 등록 절차: 본 문서에서 **active** 화 → `docs/tasks/{N}-{slug}.md` 생성(/agent-all 또는 수동) → 진행 → `docs/tasks/index.md` 에 완료 보고.

---

## 우선순위 정의

- **P0** — v1.0 출시 블로커. 코드 또는 운영 사유로 GA 미실현.
- **P1** — v1.0 직후(GA + 2주). 기능 갭, 보안/안정성 위협.
- **P2** — v1.x 분기 단위 (캘린더 / 컴플라이언스 보드 등).
- **P3** — v2 Enterprise (SSO / SCIM / 멀티 테넌트).

---

## 코드 작업

### B-CODE-01 · F-OWNER-07 Stripe 빌링 통합

- **우선순위**: P1
- **갭 출처**: `docs/specs/implementation-status.md` §7.1, memory `project_status.md` Backlog
- **목적**: 회사 OWNER 가 플랜 변경 / 결제 수단 관리 / 인보이스 조회 / 다운그레이드 + 취소 플로우를 실제로 수행할 수 있어야 한다. 현재는 데이터 레이어만 존재, "Change plan" 버튼 비활성.

**사용자 플로우**:
1. OWNER 로그인 → `/owner/billing` → 현재 플랜 + 잔여 결제일 + 인보이스 목록
2. "Change plan" CTA → Stripe Checkout Session (redirect) → 결제 완료 시 webhook 으로 `CompanySubscription.status=ACTIVE` 전환
3. 카드 등록 / 변경 → Stripe Customer Portal (redirect)
4. 인보이스 다운로드 → `Invoice.pdf_url` (Stripe-hosted)
5. 취소 → 즉시 다운그레이드 또는 다음 결제일까지 유지(`canceled_at` + `current_period_end`)

**시스템 플로우**:
- `POST /v1/billing/checkout` — Stripe Checkout Session 생성, redirect URL 반환
- `POST /v1/billing/webhook` — Stripe 이벤트 수신 → Invoice/Subscription 동기화
- `POST /v1/billing/portal` — Customer Portal 세션 생성
- `GET /v1/billing/invoices?cursor=` — 커서 기반 페이지네이션

**비즈니스 룰**:
- Stripe API 키는 AWS Secrets Manager 주입(`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)
- Webhook 서명 검증 필수 (`stripe.Webhook.construct_event`)
- 멱등성: `event.id` 기반 dedup (`StripeEvent` 테이블 또는 cache)
- 인보이스 PDF 는 Stripe-hosted (자체 생성 금지 — Phase 5 까지)
- 통화: KRW (i18n 표시 단위는 회사 설정 참조)

**수용 기준**:
- [ ] OWNER 가 `/owner/billing` 에서 Free → Pro 플랜 업그레이드 완주 (실제 Stripe test 모드)
- [ ] 결제 완료 후 Webhook 도착 → `CompanySubscription.status=ACTIVE` + `Invoice.status=PAID` + `external_id` 채워짐
- [ ] 카드 변경 후 다음 결제일에 자동 갱신 — `INVOICE_PAID` event 처리
- [ ] 결제 실패 → `status=PAST_DUE` + 사용자 알림 (notification 채널)
- [ ] 취소 → 즉시 다운그레이드 (테스트) 및 결제일까지 유지(테스트) 둘 다 선택 가능
- [ ] BE 테스트 ≥ 10 case (정상 / 서명 위변조 / 중복 이벤트 / 다운그레이드 / past_due)
- [ ] Web 의 "Change plan" 활성화, i18n key `owner.billing.change_plan_tooltip` 제거
- [ ] OpenAPI 스키마 + drift check 통과
- [ ] `docs/api/api-spec.md` billing 섹션 보강

**의존성**: 없음
**추정**: 5-7 일 (Stripe sandbox + webhook ngrok 셋업 포함)

---

### B-CODE-02 · iOS 네이티브 geofence + WidgetKit 통합

- **우선순위**: P1
- **갭 출처**: implementation-status §2.3, project_status memory
- **목적**: iOS 사용자가 Android 와 동등한 UX (geofence 자동 클락인 + 홈 위젯) 사용 가능해야 한다. 현재 Dart MethodChannel은 iOS 에서 no-op, WidgetKit 코드는 존재하나 Xcode 셋업 + Mac signing host 미확보.

**사용자 플로우**:
- iOS 사용자가 사무실 진입 → 자동 클락인 알림 (Android 동등)
- iOS 홈화면 위젯에서 출퇴근 상태 + 이번주 근무시간 노출
- WidgetKit 위젯은 App Group 통해 데이터 공유

**시스템 플로우**:
- `apps/mobile/lib/geofence/geofence_service.dart` — iOS 분기 CoreLocation MethodChannel
- `apps/mobile/ios/Runner/` — CLLocationManager + region monitoring delegate
- `apps/mobile/ios/WorkManagerWidget/` — TimelineProvider + WidgetKit views (이미 Swift 코드 존재)
- App Group: `group.com.molcube.workmanager` (UserDefaults 공유)

**비즈니스 룰**:
- 위치 권한: "Always" 권한 요청 시 명확한 onboarding 설명 (App Store Review 가이드 §5.1.1)
- 백그라운드 위치 사용: `Info.plist` `NSLocationAlwaysAndWhenInUseUsageDescription` 한국어 문구
- 위젯 갱신 주기: 15분 (`TimelineProvider.getTimeline`)
- iOS 16+ Lock Screen widget 제외 (v1.x 검토)

**수용 기준**:
- [ ] iOS 시뮬레이터 / 실기기에서 geofence 진입 → `wm.geofence` MethodChannel 호출 → 자동 클락인
- [ ] WidgetKit 위젯이 홈화면에 표시 (Today Status + This Week 2종)
- [ ] App Group 통한 데이터 동기화 — 앱이 백그라운드에서도 위젯 데이터 업데이트
- [ ] TestFlight 빌드 통과 + App Store Review 가이드 §5.1.1 위치 권한 설명 명확
- [ ] Mobile 테스트 5 case (geofence ↔ MethodChannel, widget payload 인코딩)
- [ ] `apps/mobile/ios/WorkManagerWidget/README.md` 의 5단계 Xcode 셋업 절차 검증

**의존성**:
- Mac signing host (M1/M2 Mac) 확보
- Apple Developer ID + App Group entitlement
- TestFlight 등록 (운영 갭과 병행)

**추정**: 4-6 일

---

### B-CODE-03 · COMP 휴가 별도 balance bucket

- **우선순위**: P1
- **갭 출처**: implementation-status §7.1, iter13 backlog
- **목적**: 보상휴가(COMP)가 연차(ANNUAL)와 별도 bucket 으로 관리되어야 한다. 현재는 iter13 에서 ANNUAL 공유 임시 구현 — 정책 정확도 훼손.

**사용자 플로우**:
- 직원의 overtime 이 승인되면 → 자동으로 COMP balance 적립 (1.5× 또는 회사 설정 비율)
- 직원이 COMP 휴가 신청 → COMP bucket 우선 차감
- `/m/leave` 에서 ANNUAL / COMP 별도 표시
- 만료: COMP 는 별도 만료 정책 (회사 설정, 기본 6개월)

**시스템 플로우**:
- `LeaveBalance.kind` enum 에 `COMP_GRANTED` / `COMP_USED` / `COMP_EXPIRED` 추가 (또는 `bucket=ANNUAL|COMP` 필드 추가)
- `OvertimeRequest` APPROVED → `LeaveBalance(kind=COMP_GRANTED, days=approved_minutes / 60 / 8 * factor)` 적립
- LeaveRequest 신청 시 `leave_type=COMP` 분기 — COMP bucket 차감

**비즈니스 룰**:
- 변환 비율: 회사 설정 (`leave_policy.comp_conversion_factor`, 기본 1.5)
- COMP 만료: 회사 설정 (`leave_policy.comp_expiry_months`, 기본 6)
- 자동 적립은 Celery beat 또는 OvertimeRequest 승인 직후 트리거
- 적립 이력은 `LeaveBalance.related_request_id` 로 OvertimeRequest 연결 (감사 추적)

**수용 기준**:
- [ ] Overtime APPROVED → COMP balance 자동 적립
- [ ] 신청 시 COMP / ANNUAL 선택 가능 (UI + API)
- [ ] 잔여 표시에서 COMP / ANNUAL 별도 노출
- [ ] COMP 만료 배치 별도 동작 (ANNUAL 과 독립)
- [ ] BE 테스트 ≥ 6 case (적립 / 차감 / 만료 / 회사 정책 변경)
- [ ] 마이그레이션: 기존 iter13 임시 데이터 정합성 (`leave_type=COMP` rows 의 bucket 보정)

**의존성**: 없음
**추정**: 2-3 일

---

### B-CODE-04 · Pre-existing test 정리 ✅ 완료 (2026-05-13, `e61758d`)

- **우선순위**: P1
- **갭 출처**: iter13 SESSION report, memory backlog
- **목적**: CI 통과 유지 + 신뢰 회복. 다음 테스트가 iter13 변경 이후 stale.

**대상 테스트**:
1. `services/api/tests/test_seed_demo.py::test_seed_demo_creates_expected_rows` — iter13 T3 가 9 leave request 로 변경됨, fixture 기대치 갱신
2. `apps/web/src/features/leave-apply/...` 2개 vitest case — post-T3 stale
3. `apps/web/src/features/admin-issue-code/...` — 신규 추가, 테스트 0건

**수용 기준**:
- [ ] `make test-be` 통과 (현재 `test_seed_demo` 실패 가능성)
- [ ] `make test-fe` 통과
- [ ] admin-issue-code feature 에 최소 2 vitest case (정상 발급 / 권한 거부)

**의존성**: 없음
**추정**: 0.5 일

---

### B-CODE-05 · F-MANAGER P3 deadcode 정리

- **우선순위**: P2
- **갭 출처**: iter12 backlog, memory
- **목적**: iter12 에서 deferred 된 manager 페르소나 P3 deadcode 5건 — 사용되지 않는 코드/i18n 키/import 제거 (Tech Debt Never Defer).

**대상**: iter12 finding 보고서 참조 (`docs/tasks/02-findings-manager.md`)

**수용 기준**:
- [ ] 5건 모두 제거 또는 wire 완료 (어느 한쪽 — 미사용 상태 유지 불가)
- [ ] ESLint --max-warnings=0 유지

**의존성**: iter12 findings 재확인
**추정**: 0.5 일

---

### B-CODE-06 · admin_api + identity 백엔드 테스트 보강 ✅ 완료 (2026-05-13)

- **우선순위**: P1
- **갭 출처**: implementation-status §6, 백엔드 50 tests 중 0건
- **목적**: 보안 핵심 영역(인증 / 관리자 작업)에 회귀 방지망 부재. CVE/regression 위험 큰 영역에 테스트 0건은 출시 후 운영 부담.

**대상 흐름**:
- identity: signup → email verify → login → 2FA enable → 2FA challenge → password reset → recovery code 사용
- identity: 로그인 락아웃 (failed_login_count, locked_until)
- admin_api: dashboard 권한 가드, employees CRUD, approvals bulk decide, settings update, reports export, expiring-leave query
- admin_api: 비-관리자 접근 시 403

**수용 기준**:
- [ ] identity ≥ 10 test (auth flow + 2FA + lockout)
- [ ] admin_api ≥ 8 test (각 endpoint 권한 가드 + 정상 + 입력 검증)
- [ ] 커버리지 `--cov-fail-under=50` 무리 없이 유지 (현재 임계점, 상향 검토)

**의존성**: 없음
**추정**: 2-3 일

---

### B-CODE-07 · Web MSW 핸들러 확장 ✅ 완료 (2026-05-13, `c19a06c`)

- **우선순위**: P2
- **갭 출처**: implementation-status §2.1
- **목적**: 현재 MSW 는 `billing.ts` 1개. 새 feature 개발 / Storybook play 시 백엔드 부재 환경에서 작동하지 않음. 17개 entity 별 mock handler 정리.

**수용 기준**:
- [ ] `apps/web/src/shared/msw/handlers/` 18개 (entity 별 1개) 핸들러 정리
- [ ] `apps/web/src/shared/msw/handlers/index.ts` 합본 export
- [ ] Storybook decorator 가 MSW 사용 (`apps/web/.storybook/page-decorators.tsx`)
- [ ] vitest 의 setup 에서 자동 활성 (또는 명시적 `beforeAll`)

**의존성**: OpenAPI 타입 (`apps/web/src/shared/api/openapi-types.ts`) — 이미 존재
**추정**: 1-2 일

---

### B-CODE-08 · 푸시 디바이스 토큰 garbage collection 정책 ✅ 완료 (2026-05-13, `e2181c5`)

- **우선순위**: P2
- **갭 출처**: implementation-status §7.1
- **목적**: 현재 410 / badToken 시 즉시 삭제. 그러나 활성 토큰이지만 7일 이상 미사용 / 60일 이상 미접속 케이스 정책 부재.

**수용 기준**:
- [ ] `notification.cleanup_stale_device_tokens` Celery beat 추가
- [ ] 정책: `DeviceToken.last_seen_at < now() - 60d` 삭제
- [ ] 운영 가이드 §5.5 새 섹션 추가
- [ ] BE 테스트 1-2 case

**의존성**: 없음
**추정**: 0.5 일

---

## 운영 작업 (코드 외)

### B-OPS-01 · Electron Setup.exe EV 코드사이닝

- **우선순위**: P0
- **갭 출처**: operations-guide §11.1, implementation-status §7.2
- **목적**: Windows SmartScreen 통과. 미서명 시 다운로드 후 경고 + 차단 가능성.

**수용 기준**:
- [ ] EV(Extended Validation) 코드사이닝 인증서 발급 — DigiCert / Sectigo
- [ ] `.github/workflows/release.yml` 의 win-sign 환경 시크릿 주입 (`CSC_LINK`, `CSC_KEY_PASSWORD`)
- [ ] 첫 서명 빌드 → SmartScreen 평판 형성을 위해 수십 회 다운로드 필요 (Cloud signing 옵션 — Azure Trusted Signing 검토)
- [ ] `apps/desktop/scripts/win-sign.cjs` 환경에서 cloud-sign 모드 검증

**의존성**: 인증서 구매 결정 (예산 ~$300/year EV)

---

### B-OPS-02 · macOS Apple Notarization

- **우선순위**: P0
- **갭 출처**: operations-guide §11.1
- **목적**: macOS Gatekeeper 통과.

**수용 기준**:
- [ ] Apple Developer Program 가입 ($99/year)
- [ ] Developer ID Application 인증서 발급
- [ ] App-specific password 생성 (notarytool 전용)
- [ ] `.github/RELEASE_SECRETS.md` 의 `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `MAC_CSC_LINK`, `CSC_KEY_PASSWORD` 모두 GitHub Secrets 주입
- [ ] `apps/desktop/scripts/notarize.cjs` 빌드 통과
- [ ] Mac 다운로드 후 더블클릭 → 보안 경고 없이 실행

---

### B-OPS-03 · App Store / Play Store 개발자 등록 + 첫 제출

- **우선순위**: P0
- **갭 출처**: operations-guide §11.1
- **목적**: 모바일 배포 시작.

**수용 기준**:
- [ ] Apple Developer Program 가입 (B-OPS-02 와 공통)
- [ ] Google Play Developer 등록 ($25 일회)
- [ ] App Store Connect: bundle id `com.molcube.workmanager`, 권한 설명 6개 (위치 always, 알림, 카메라(2FA 백업), 백그라운드 모드)
- [ ] Play Console: package `com.molcube.workmanager`, target API 34
- [ ] 첫 TestFlight 외부 베타 (5인 이상)
- [ ] 첫 Play Internal Testing 트랙

**의존성**: B-CODE-02 (iOS 네이티브) — Mac signing host

---

### B-OPS-04 · 외부 펜테스트

- **우선순위**: P0
- **갭 출처**: operations-guide §11.1
- **목적**: 출시 전 외부 검증된 보안 점검.

**수용 기준**:
- [ ] 펜테스트 벤더 선정 (한국: Bugcrowd partner, 라온화이트햇, KISA 자문)
- [ ] 범위 정의: web SPA + API + WS + 모바일 셸 (개별 OS 제외)
- [ ] HIGH/CRITICAL findings 100% 해결
- [ ] 보고서 보관 + audit trail
- [ ] 일정: 2026-06 후반 ~ 2026-07 초

---

### B-OPS-05 · prod 시크릿 + 모니터링 주입

- **우선순위**: P0
- **갭 출처**: operations-guide §11.1
- **목적**: prod 환경에서 Sentry / Grafana / PagerDuty 가 실작동.

**수용 기준**:
- [ ] AWS Secrets Manager 에 다음 키 주입: `SENTRY_DSN_API`, `SENTRY_DSN_WEB`, `SENTRY_DSN_DESKTOP`, `SLACK_WEBHOOK_OPS`, `PAGERDUTY_INTEGRATION_KEY`
- [ ] `infra/terraform/envs/prod/terraform.tfvars` 에 `pagerduty_endpoint_url`, `alert_emails` 설정
- [ ] CloudWatch alarm 발화 → SNS → PagerDuty / Slack 통합 검증 (테스트 발화)
- [ ] Sentry 환경 별 프로젝트 4개 분리 (api / web / desktop / mobile)
- [ ] 첫 prod ERROR 도착 시 PagerDuty 페이지 작동

---

### B-OPS-06 · 백업 / 복원 리허설

- **우선순위**: P0
- **갭 출처**: operations-guide §11.1
- **목적**: 운영 사고 시 RPO/RTO 충족 검증.

**수용 기준**:
- [ ] RDS PITR(Point-in-time recovery) 복원 실제 수행 (stg 환경)
- [ ] S3 (SPA 정적자산 + 디스크탑 update 매니페스트) 복원 시뮬레이션
- [ ] RTO ≤ 2시간, RPO ≤ 1시간 측정
- [ ] runbook §6 복원 절차 갱신

---

### B-OPS-07 · stg 부하 + 카오스 실측

- **우선순위**: P1
- **갭 출처**: operations-guide §11.1
- **목적**: 출시 직후 09:00 트래픽 + 장애 시나리오 검증.

**수용 기준**:
- [ ] 부하 스크립트 (k6 / Locust — 준비 완료) stg 실행
- [ ] 09:00 트래픽 시뮬: DAU × 3 / 5분 burst
- [ ] 카오스: Beat 죽음 / Redis 일시 차단 / DB connection pool 고갈
- [ ] 알람 발화 검증 (CloudWatch + PagerDuty)
- [ ] capacity 측정 → `docs/architecture/architecture.md` §13 갱신

---

### B-OPS-08 · 법무 검토 + GDPR 감사

- **우선순위**: P0
- **갭 출처**: operations-guide §11.1
- **목적**: 한국 개인정보보호법 + GDPR 준수 확인.

**수용 기준**:
- [ ] 이용약관 v1.0 확정 (변호사 검토)
- [ ] 개인정보처리방침 v1.0 확정
- [ ] 데이터 처리 동의 흐름 검증 (signup + 회사 onboarding)
- [ ] DPA(Data Processing Agreement) 템플릿 — B2B 고객용
- [ ] GDPR Article 30 records of processing 작성
- [ ] data-export/deletion SOP 실 테스트 (각 회사 1건)

---

### B-OPS-09 · 온콜 로테이션

- **우선순위**: P1
- **갭 출처**: operations-guide §11.1
- **목적**: 24/7 사고 대응 체계.

**수용 기준**:
- [ ] PagerDuty 스케줄 (primary / secondary)
- [ ] runbook 모든 시나리오 (R-001~R-011) 1차 리뷰
- [ ] 첫 fire drill 수행 (계획된 알람 발화 → 대응 시간 측정)

---

## v1.x 작업 (P2)

| ID | 영역 | 작업 | 우선순위 |
|---|---|---|---|
| B-V1X-01 | 캘린더 | 팀 캘린더 (월 매트릭스) — 사양 `screen-catalog.md` 참조 | P2 |
| B-V1X-02 | 컴플라이언스 | 52시간 보드 시각화 강화 (현재는 API 만) | P2 |
| B-V1X-03 | 출장 | 출장 / 외근 등록 폼 완성도 향상 | P2 |
| B-V1X-04 | 위젯 | 디스크탑 + iOS Lock Screen widget | P2 |
| B-V1X-05 | 테마 | 사용자별 화면 꾸미기 (theme / font) 영구 저장 | P2 |
| B-V1X-06 | 데이터 export | PDF 리포트 (개인 / 회사) — 현재는 CSV | P2 |
| B-V1X-07 | 슬랙 / 팀즈 | Slack 봇 + Teams 봇 연동 | P3 |

---

## v2 Enterprise (P3)

| ID | 영역 | 작업 | 비고 |
|---|---|---|---|
| B-V2-01 | SSO | SAML / OIDC — 대기업 도입 필수 | ADR-004 멀티 테넌트와 함께 |
| B-V2-02 | SCIM | 사용자 프로비저닝 | |
| B-V2-03 | 멀티 테넌트 | 그룹사 — 단일 DB / 다중 스키마 또는 row-level isolation | ADR-004 |
| B-V2-04 | SIEM | 감사 로그 강화 + Splunk / Datadog 연동 | |
| B-V2-05 | 외부 캘린더 | Google / Outlook 양방향 sync | |
| B-V2-06 | HRIS | Workday / NamuwHR 등 연동 | 파트너십 |

---

## 작업 흐름 (Workflow)

1. **활성화** — 본 문서에서 P0/P1 선택 → `docs/tasks/{N}-{slug}.md` 신규 생성 (또는 /agent-all 호출)
2. **진행** — task doc 안의 acceptance criteria 체크박스 + 변경 사항 commit
3. **완료** — `docs/tasks/index.md` 의 "최근 완료" 에 한 줄 + 본 문서의 해당 항목 ✅
4. **수정** — 사양 변경 시 본 문서 acceptance criteria 갱신 + `implementation-status.md` §7 동기화

---

## 의존성 그래프 (간략)

```
B-OPS-01 (Win EV) ──┐
B-OPS-02 (Mac Notar) ┼─→ v1.0 GA (2026-08-17 목표)
B-OPS-03 (App Store) ─→ B-CODE-02 (iOS native) 선행 필요
B-OPS-04 (Pen test) ──┤
B-OPS-05 (prod 시크릿)─┤
B-OPS-06 (백업 리허설)┤
B-OPS-08 (법무)───────┘

B-CODE-01 (Stripe) — v1.0 직후 (P1)
B-CODE-02 (iOS) — B-OPS-03 와 묶음
B-CODE-03 (COMP) — v1.0 직후
B-CODE-04~07 — 병행 가능 (independent)
```

---

## 부록 — 본 문서 산출 근거

| 데이터 | 출처 |
|---|---|
| 기존 backlog | `~/.claude/projects/.../memory/project_status.md` Backlog 섹션, `docs/tasks/index.md` |
| 코드 갭 | `docs/specs/implementation-status.md` §7.1, §7.2 |
| 운영 갭 | `docs/operations/operations-guide.md` §11.1 v1.0 출시 체크리스트 |
| 테스트 갭 | `docs/specs/implementation-status.md` §6 |
| 우선순위 정의 | `docs/roadmap.md` Phase 4 출시 기준 |
