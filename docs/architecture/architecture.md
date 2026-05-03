# 아키텍처 설계도 (System Architecture)

> **버전**: 0.1 · MVP 기준
> **변경 정책**: 큰 변경은 ADR 작성 후 반영.

---

## 1. 한 페이지 요약

근무 관리 시스템은 **단일 React SPA를 다양한 셸(Web / Flutter WebView / Electron)에 호스팅** 하고, **Django REST API + WebSocket** 으로 비즈니스 로직과 실시간을 처리한다. **PostgreSQL + Redis + Celery** 가 코어 데이터/캐시/배치를 담당하며, 알림은 **FCM / APNs / Web Push / 이메일** 로 분기된다.

---

## 2. 컴포넌트 다이어그램

```
   ┌─────────────────────────────┐    ┌─────────────────────┐
   │     Mobile (Flutter)        │    │   Desktop (Electron)│
   │   ┌──────────────────────┐  │    │  ┌────────────────┐ │
   │   │   WebView (React)    │  │    │  │  Renderer      │ │
   │   └──────────────────────┘  │    │  │  (React)       │ │
   │   Native Bridge:            │    │  └───────┬────────┘ │
   │   - 위치 / 푸시 / 위젯       │    │  Main Process:      │
   │                             │    │  - 트레이 / 알림     │
   │                             │    │  - 자동 출퇴근       │
   └────────────┬────────────────┘    └──────────┬──────────┘
                │                                  │
                │              ┌──────────────────┘
                │              │
                ▼              ▼
   ┌─────────────────────────────────────────────┐
   │   Web (React SPA · Vite · TS)               │
   │   - 라우터 / i18n / 디자인 시스템           │
   │   - REST + WebSocket 클라이언트              │
   └────────────────┬────────────────────────────┘
                    │ HTTPS / WSS
                    ▼
   ┌─────────────────────────────────────────────┐
   │            CDN + WAF (CloudFront)           │
   └────────────────┬────────────────────────────┘
                    │
                    ▼
   ┌─────────────────────────────────────────────┐
   │          API Gateway (Nginx / ALB)          │
   └─────┬───────────────┬───────────────┬───────┘
         │               │               │
         ▼               ▼               ▼
   ┌──────────┐   ┌──────────────┐   ┌──────────┐
   │  Django  │   │  Channels    │   │  Static  │
   │  + DRF   │   │  (WS)        │   │  / Media │
   │  (gunicorn)│ │  (daphne)    │   │  (S3)    │
   └────┬─────┘   └──────┬───────┘   └──────────┘
        │                │
        ├────────────────┼─────────────┐
        ▼                ▼             ▼
   ┌──────────┐    ┌──────────┐   ┌──────────┐
   │PostgreSQL│    │  Redis   │   │  Celery  │
   │ (RDS)    │    │ (Cache + │   │ Worker / │
   │          │    │  Pub/Sub)│   │  Beat    │
   └──────────┘    └──────────┘   └────┬─────┘
                                        │
                                        ▼
                              ┌────────────────────┐
                              │  Notifications     │
                              │  - FCM (Android)   │
                              │  - APNs (iOS)      │
                              │  - Web Push (VAPID)│
                              │  - SMTP (SES)      │
                              └────────────────────┘
```

---

## 3. 클라이언트 (Frontend)

### 3.1 단일 React 코드베이스

원칙: **하나의 React 코드베이스를 셸에 따라 어댑터로 분기**.

```
apps/web/src/
├── app/                    # 라우터, 레이아웃
│   ├── (mobile)/           # 모바일 폭 (≤ 480px) 라우트
│   ├── (web)/              # 웹 (개인 대시보드)
│   ├── (admin)/            # 관리자
│   └── shared/             # 공통 (auth, settings)
├── features/               # 도메인별 (attendance, leave, team, ...)
├── components/             # 디자인 시스템 (atoms, molecules, organisms)
├── lib/
│   ├── api/                # 자동 생성 클라이언트 (OpenAPI → ts)
│   ├── i18n/               # ko / en 번들
│   ├── theme/              # tokens.css, theme switcher
│   ├── shell/              # 셸 어댑터 (web / flutter / electron)
│   └── realtime/           # WebSocket 클라이언트
├── pages/                  # 화면 모듈 (screen-catalog ID 기준)
└── main.tsx
```

### 3.2 셸 어댑터

- **Web**: 일반 브라우저. 모든 기능 가능. 서비스 워커로 Web Push.
- **Flutter WebView**: `window.NativeBridge.*` 가 노출. 위치 / 푸시 / 햅틱 / 위젯 업데이트는 네이티브에 위임.
- **Electron**: `window.ElectronBridge.*` 가 노출. 메뉴바 / 트레이 / OS 알림 / 자동 출퇴근 트리거.

```ts
// lib/shell/index.ts
export const shell = (() => {
  if (window.ElectronBridge) return new ElectronShell();
  if (window.NativeBridge) return new FlutterShell();
  return new WebShell();
})();

shell.requestLocation();
shell.notify({ title: '...', body: '...' });
```

### 3.3 디자인 시스템

`tokens.css` 의 CSS 변수를 그대로 사용 + Tailwind 의 `theme.extend.colors` 가 동일 변수를 참조. 자세한 토큰: [`docs/design/design-system.md`](../design/design-system.md)

---

## 4. 백엔드 (Django + DRF)

### 4.1 디렉토리

```
services/api/
├── manage.py
├── work_manager/                 # 프로젝트 설정
│   ├── settings/
│   │   ├── base.py
│   │   ├── dev.py
│   │   ├── prod.py
│   │   └── test.py
│   ├── urls.py
│   ├── asgi.py                   # Channels (WS)
│   └── wsgi.py
├── apps/
│   ├── identity/                 # User, Company, Membership, Department
│   ├── attendance/               # AttendanceRecord, BreakRecord, OvertimeRequest
│   ├── leave/                    # LeavePolicy, LeaveBalance, LeaveRequest
│   ├── approval/                 # ApprovalTask
│   ├── notification/             # NotificationLog, DeviceToken, Preference
│   ├── compliance/               # 52h 모니터링
│   └── admin_api/                # 관리자 전용 엔드포인트
├── core/                         # 공통 (auth, permissions, exceptions, pagination)
├── ws/                           # Channels consumers
├── tasks/                        # Celery 태스크 (배치, 알림 발송)
└── tests/
```

### 4.2 주요 패키지

| 카테고리 | 패키지 |
|---|---|
| Web | Django 5, djangorestframework, drf-spectacular (OpenAPI), django-cors-headers |
| WS | channels, daphne, channels-redis |
| Auth | djangorestframework-simplejwt, django-allauth (OAuth) |
| Async | celery, redis, django-celery-beat |
| DB | psycopg[binary], django-environ |
| Test | pytest-django, factory-boy, pytest-cov |
| Lint | ruff, mypy, django-stubs |
| Notif | fcm-django, pywebpush, boto3 (SES) |

### 4.3 API → 클라이언트 타입 동기화

- DRF 엔드포인트 → drf-spectacular 로 OpenAPI 3.1 자동 생성
- 프론트는 `openapi-typescript` 로 `lib/api/types.ts` 자동 생성 (CI 단계)
- 변경 감지: PR 에서 `types.ts` 가 stale 하면 CI 실패

---

## 5. 모바일 (Flutter WebView)

### 5.1 역할

- 단순 컨테이너. 비즈니스 로직 없음.
- 네이티브 권한이 필요한 기능만 수행:
  - GPS / Geofencing
  - Push (FCM, APNs)
  - 홈화면 위젯
  - 햅틱 피드백
  - 카메라 / 갤러리 (프로필 사진 등)

### 5.2 통신 방식

- WebView ↔ Native: JavaScriptChannel (Android), userContentController (iOS)
- 노출 객체: `window.NativeBridge` (메서드 + 이벤트 리스너)

```dart
// flutter_inappwebview 예시
controller.addJavaScriptHandler(handlerName: 'requestLocation', ...)
```

### 5.3 빌드 / 배포

- Android: AAB → Google Play (내부 → 닫힌 → 프로덕션)
- iOS: TestFlight → App Store
- WebView URL 은 환경별 (`dev.work-manager.molcube.com`, `app.work-manager.molcube.com`)

---

## 6. 데스크탑 (Electron)

### 6.1 구조

```
apps/desktop/
├── main/                  # main process (TS)
│   ├── tray.ts
│   ├── notifications.ts
│   ├── auto-clock.ts      # 정규 출퇴근 시각 자동 트리거
│   └── ipc.ts
├── preload/               # contextBridge
│   └── bridge.ts          # window.ElectronBridge
├── renderer/              # React (web 코드 재사용)
└── electron-builder.yml
```

### 6.2 주요 기능

- 트레이 아이콘 (현재 상태 표시: 본사 / 재택 / 휴게)
- OS 알림 (출근 임박, 초과근무 자동 요청)
- 자동 출퇴근 (사용자 설정에 따라 OS 부팅 / 잠금 해제 시 트리거)
- 자동 업데이트 (electron-updater + S3)

### 6.3 배포

- Mac: notarized DMG (애플 공증 필수)
- Windows: signed installer (.exe / .msi)
- Linux: AppImage (선택)

---

## 7. 데이터 저장소

### 7.1 PostgreSQL

- AWS RDS (Multi-AZ)
- Engine: PostgreSQL 16
- 백업: 자동 일일 + 7일 보존, PITR 활성화
- 읽기 전용 replica 1대 (관리자 리포트, 분석용)
- 스키마: 모든 테이블 `company_id` 포함, 인덱스 (`company_id`, `...`)

### 7.2 Redis

- AWS ElastiCache
- 용도: 세션 / Celery 브로커 / Channels Pub/Sub / Rate Limit / JWT 블랙리스트
- 운영: cluster mode (1 primary + 1 replica) MVP, 확장 시 sharding

### 7.3 Object Storage

- AWS S3
- 정적 자산, 사용자 업로드 (프로필 이미지), 리포트 export PDF
- 업로드는 presigned URL 방식 (백엔드 부하 최소화)
- CloudFront 통해 서빙

---

## 8. 비동기 / 배치

Celery 워커 + Beat 스케줄러.

| 태스크 | 스케줄 | 설명 |
|---|---|---|
| `leave.grant_monthly` | 매일 00:05 KST | 입사 1년 미만 월차 부여 |
| `leave.grant_annual` | 회계연도 시작일 00:10 | 연차 일괄 부여 |
| `leave.notify_expiring` | 매일 09:00 | 소멸 임박 알림 |
| `leave.expire` | 매일 00:30 | 만료된 연차 처리 |
| `attendance.auto_clock_out` | 매시 정각 | 출근 후 24h 무응답 자동 퇴근 처리 |
| `compliance.check_52h` | 매일 22:00 | 52시간 임계 모니터링 |
| `report.weekly_summary` | 매주 월 08:00 | 매니저 주간 리포트 발송 |
| `notification.dispatch` | 큐 기반 | FCM / APNs / Email 발송 |

---

## 9. 실시간

- Django Channels + daphne
- Pub/Sub: Redis
- 채널 그룹: `team:{company_id}`, `inbox:{membership_id}`, `admin:{company_id}`
- 인증: 첫 메시지 또는 query string `?token=...` 검증
- 백오프 정책: 클라이언트는 exponential backoff (1s, 2s, 4s, ..., max 30s)

---

## 10. 인프라 / 배포

### 10.1 환경

| 환경 | 도메인 | 용도 |
|---|---|---|
| local | localhost | 개발 |
| dev | `*.dev.work-manager.molcube.com` | 통합 테스트 / QA |
| stg | `*.stg.work-manager.molcube.com` | 운영 동일 구성, 데이터는 마스킹 |
| prod | `*.work-manager.molcube.com` | 운영 |

### 10.2 컨테이너 / 오케스트레이션

- 모든 서비스 Docker 컨테이너
- 오케스트레이션: AWS ECS Fargate (MVP) → 트래픽 증가 시 EKS 검토
- 이미지 레지스트리: AWS ECR
- 프론트 정적 자산: S3 + CloudFront

### 10.3 CI/CD

- GitHub Actions
- Pipeline:
  1. `lint` (ruff / eslint / dartfmt)
  2. `typecheck` (mypy / tsc / dart analyze)
  3. `test` (pytest / vitest / flutter test)
  4. `build` (docker / vite / flutter / electron-builder)
  5. `deploy` (ECS task definition update / S3 sync / electron auto-update)
- 메인 브랜치: stg 자동 배포. 태그(`v*.*.*`): prod 배포 (수동 승인 게이트).

### 10.4 IaC

- Terraform (`infra/terraform/`)
  - VPC, ECS, RDS, ElastiCache, S3, CloudFront, Route53
- 환경별 워크스페이스: `dev`, `stg`, `prod`
- 시크릿: AWS Secrets Manager, 절대 git 에 평문 금지

---

## 11. 관측 (Observability)

| 영역 | 도구 |
|---|---|
| 로그 | CloudWatch Logs + JSON 구조화 + trace_id |
| 메트릭 | CloudWatch Metrics + Grafana (선택) |
| APM | Sentry (에러), 또는 OpenTelemetry → Grafana Tempo |
| 알림 | Slack (`#ops-alerts`) + PagerDuty (옵션) |
| 추적 | 요청별 `X-Request-ID` 자동 생성 + 모든 로그에 포함 |

---

## 12. 보안

- TLS 1.3 강제 (HSTS preload)
- 시크릿: Secrets Manager. 코드/Git 에 노출 금지
- DB: 휴면 / 전송 모두 암호화 (KMS)
- PII: 이름 / 이메일 / 전화 / 위치 좌표 / 사진 → 회사 정책에 따라 보존 / 익명화
- 비밀번호: bcrypt cost 12
- OAuth: PKCE 필수
- CORS / CSP / HSTS 모두 enforce
- 감사 로그: append-only, 별도 KMS 키로 암호화

---

## 13. 성장 / 확장 (Capacity Plan, MVP 기준)

| 단계 | 회사 수 | DAU | DB | API 인스턴스 |
|---|---:|---:|---|---|
| Pilot | 1 ~ 5 | ≤ 200 | RDS db.t4g.medium | 1 (1 vCPU, 2GB) |
| MVP | ~ 30 | ≤ 3,000 | db.t4g.large + replica | 2 ~ 4 (auto-scale) |
| Growth | ~ 200 | ≤ 30,000 | db.r6g.xlarge + replica × 2 | 4 ~ 16 |

스케일 임계점:
- API CPU 60% 지속 → auto-scale out
- WS 동시 접속 5k 초과 → daphne 인스턴스 분리
- DB write IOPS 70% 초과 → 인스턴스 업그레이드 또는 sharding 검토

---

## 14. 의사결정 기록 (ADR)

[`docs/adr/`](../adr/) 에 ADR-NNN-title.md 형식으로 기록. 초기 ADR 후보:

- ADR-001: React SPA 단일 코드베이스 + 셸 어댑터 채택
- ADR-002: Flutter WebView (네이티브 React Native 대신) 채택
- ADR-003: Django REST + Channels (FastAPI 대신) 채택
- ADR-004: PostgreSQL 단일 DB (멀티 테넌트는 v2 검토)
- ADR-005: 디자인 토큰은 CSS 변수 + Tailwind 참조
