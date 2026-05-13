# UI/UX 검증 (UI/UX Verification — SDD)

> **Document version**: 1.0
> **Last updated**: 2026-05-13
> **Phase**: 4 · v1.0 출시 준비
> **Owner**: QA + Designer
> **Sources**: `docs/design/design-system.md` (디자인 토큰 / 원칙), `docs/specs/screen-catalog.md` (MVP 화면), `apps/web/src/shared/styles/tokens.css` (CSS 변수)

본 문서는 디자인 시스템 준수 + 접근성(a11y) + 페르소나 동선의 검증 절차 카탈로그다. design-smoke 자동화는 기본 측정값을, 본 문서는 그 외 확장 시나리오 + 수동 점검 + 라이브 테스트 박제 기준을 정의한다.

---

## 0. 검증 카테고리

| 카테고리 | 목적 | 자동화 정도 |
|---|---|---|
| 디자인 토큰 준수 | 하드코딩 색상/간격 0건 | 자동(ESLint custom 또는 grep) + 수동 |
| 측정값 검증 | 화면 폭 / 간격 / 입력 크기 | 자동 (`apps/e2e/scripts/design-smoke.mjs`) |
| 시각 회귀 | 스크린샷 비교 | 자동 (Storybook + Chromatic), 반자동 (design-smoke + manual review) |
| i18n 패리티 | ko/en 키 누락 0 + `?[key]` 출력 0 | 자동(키 카운트) + 수동 |
| 접근성 (a11y) | WCAG AA, 키보드 동선, 스크린리더, color contrast | 반자동 (axe-core / Storybook a11y addon) + 수동 |
| 페르소나 동선 | 4 페르소나 × 주요 task 동선 끊김 없음 | 수동 (라이브 테스트) + 일부 E2E |
| 반응형 | 모바일(390px), 태블릿, 데스크탑(1280px+) | 수동 + design-smoke |
| 다크 모드 | (Phase 5 검토) — 본 문서는 light 만 | — |

---

## 1. 디자인 시스템 준수 (Design Tokens)

### 1.1 SSOT

- `apps/web/src/shared/styles/tokens.css` — CSS 변수 (Primitive → Semantic → Component)
- `docs/design/design-system.md` — 원칙 + 토큰 표 + 컴포넌트 가이드

**원칙** (design-system.md §1, "Toss-style"):
1. 시간에 여백을 — 정보 밀도보다 호흡감 우선
2. 점진적 밀도 — 메인 ↓ / 디테일 ↑
3. 한 화면, 한 행동 — 주요 액션 화면당 1개
4. 블루는 인터랙션만 — `--brand` 는 클릭 가능 요소에만
5. 절제가 곧 신뢰 — 그라데이션 / 컬러 그림자 / 과한 모션 금지
6. 한글과 영문 동등
7. 숫자는 타이포그래피 — `tabular-nums` + 700 + 전용 스케일
8. 여백은 자산

### 1.2 검증 항목

| ID | 규칙 | 검증 방법 |
|---|---|---|
| UX-DT-01 | 컴포넌트 내부 색상 → CSS var 만 사용. `#xxxxxx` / `rgba(` 직접 0건. | `grep -r "#[0-9a-fA-F]\{6\}" apps/web/src --exclude-dir=node_modules` → 결과 0건 (tokens.css 제외) |
| UX-DT-02 | 간격 → `var(--space-*)` 또는 Tailwind 클래스. 임의 `padding: 13px` 금지 | code review + ESLint rule(있다면) |
| UX-DT-03 | radius → `var(--r-*)` (--r-sm/--r-md/--r-lg/--r-pill) | grep 검증 |
| UX-DT-04 | 폰트 weight → tokens 정의된 4단계(400/500/600/700) | |
| UX-DT-05 | 그라데이션 / boxShadow 컬러 → 절제. `linear-gradient` / 컬러 shadow 0건 | |
| UX-DT-06 | 브랜드 블루 → 클릭 가능한 요소에만 (텍스트 색은 grey-700 이상) | manual review |
| UX-DT-07 | tabular-nums → 숫자 표시 컴포넌트 (KPIStat, StatRow, ListRow 의 amount) | |

### 1.3 자동 점검 (design-smoke)

`apps/e2e/scripts/design-smoke.mjs` 측정값 (현행 baseline):

| 화면 | 뷰포트 | shell 폭 | 주요 입력 크기 | 비고 |
|---|---|---|---|---|
| /login | 390×844 | 390 | email/password 표준 | greyish-50 배경, brand W tile |
| /signup | 390×844 | 390 | 3개 input | login 과 동일 골조 |
| /onboarding/welcome | 390×844 | — | 3 feature cards + bottom CTA | catalog 일치 |
| /onboarding/company-code | 390×844 | — | 6 code inputs 각 44×56 | tap target ≥ 44px |

산출물: `apps/e2e/test-results/design-smoke/*.png`

**확장 권장** (현 갭): 페이지 4개 → 18개(/m/*, /web/*, /admin/* 주요 화면)로 확대. 측정 항목: 폰트 weight, 라인 높이, brand 클릭요소 인덱스.

---

## 2. 측정값 검증 (Layout / Sizing)

| ID | 화면 | 측정 항목 | 기준 | 도구 |
|---|---|---|---|---|
| UX-SZ-01 | 모든 모바일 화면 | 콘텐츠 폭 | 모바일 ≤ 390px, 좌우 padding 16-20px | design-smoke |
| UX-SZ-02 | 클릭/탭 타겟 | 최소 크기 | ≥ 44×44 px (WCAG 2.1 AA: 2.5.5) | design-smoke + axe |
| UX-SZ-03 | 모달 / Sheet | 백드롭 + ESC/외부 클릭 닫기 | 동작 검증 | manual |
| UX-SZ-04 | TabBar | 5개 이하 (현 4개), 각 ≥ 44×44 | design-smoke + manual |
| UX-SZ-05 | KPIStat 카드 | 숫자 weight 700 + tabular-nums | design-smoke 확장 |
| UX-SZ-06 | List rows | 행 간격 ≥ 56px | design-smoke 확장 |
| UX-SZ-07 | Sticky header | 스크롤 시 그림자 + opacity | manual |
| UX-SZ-08 | Form | label + input 간격 ≥ 8px, error 메시지 4px below | manual |
| UX-SZ-09 | 가로 overflow | 모바일에서 가로 스크롤 0건 | `all-pages.spec.ts` 의 horizontal overflow 체크 |

---

## 3. 시각 회귀 (Visual Regression)

### 3.1 Storybook + Chromatic

- `apps/web/.storybook/` 68 stories
- Chromatic: `.storybook/chromatic.json`
- 베이스라인 갱신은 PR 머지 시 자동 (또는 reviewer 명시적 승인)

### 3.2 design-smoke 스크린샷

- 위치: `apps/e2e/test-results/design-smoke/`
- 박제: 라이브 테스트 보고서에서 `docs/qa/screenshots/<slug>/` 로 복사 + commit

### 3.3 검증 항목

| ID | 항목 | 도구 |
|---|---|---|
| UX-VR-01 | atoms 컴포넌트 변경 시 Storybook 시각 diff 0 (혹은 명시 승인) | Chromatic |
| UX-VR-02 | 핵심 화면 (login/signup/onboarding 4단계) 폭/요소 매치 | design-smoke |
| UX-VR-03 | 페르소나 sweep 후 박제 스크린샷 | manual + 라이브 테스트 보고서 |

---

## 4. i18n 패리티 (ko/en)

### 4.1 SSOT

- `apps/web/src/shared/i18n/index.ts` (1583 lines) — 18 namespace
- 키 namespace: `auth`, `home`, `team`, `leave`, `my`, `onb`, `tweaks`, `push`, `trip`, `notice`, `common`, `web`, `inbox`, `records`, `team_leave`, `compliance`, `leave_apply`, `admin`, `owner`, `mobile`

### 4.2 검증 항목

| ID | 규칙 | 검증 방법 |
|---|---|---|
| UX-I18N-01 | ko / en 키 카운트 동일 | `apps/web/src/shared/i18n/__tests__/parity.test.ts` (있음 가정 — 없으면 추가) |
| UX-I18N-02 | `?[key.path]` 출력 0건 | console-smoke + 라이브 테스트 sweep |
| UX-I18N-03 | 신규 페이지 추가 시 ko/en 동시 추가 | code review |
| UX-I18N-04 | 시간 / 통화 / 숫자 — locale 별 포맷 (`Intl`) | spot check (4 페르소나 sweep) |

**`?[key]` 정규식 검출** (memory `feedback_live_testing_session.md` §3):

```js
document.body.innerText.matchAll(/\?\[([a-zA-Z0-9_.]+)\]/g)
```

라이브 테스트 시 페이지 로딩 후 위 정규식 실행 → 결과 비어야 함.

---

## 5. 접근성 (a11y)

### 5.1 기준

- WCAG 2.1 Level AA
- 모바일 (Korean) primary, English secondary

### 5.2 검증 항목

| ID | 항목 | 검증 방법 |
|---|---|---|
| UX-A11Y-01 | 텍스트 contrast 비율 ≥ 4.5:1 (small) / 3:1 (large) | axe-core via Storybook addon |
| UX-A11Y-02 | 모든 form input 에 `<label>` 또는 `aria-label` | axe |
| UX-A11Y-03 | 키보드 동선 — Tab 으로 모든 인터랙티브 도달, ESC 모달 닫기 | manual |
| UX-A11Y-04 | 스크린리더 (VoiceOver/TalkBack) — 페이지 제목 / 헤더 정확 | manual |
| UX-A11Y-05 | Focus visible — `:focus-visible` outline 또는 ring | tokens 검증 |
| UX-A11Y-06 | 색 외 정보 전달 — 상태(WORKING/COMPLETED)에 아이콘 + 텍스트 동반 | manual |
| UX-A11Y-07 | 클릭/탭 타겟 ≥ 44×44 | UX-SZ-02 와 동일 |
| UX-A11Y-08 | 모션 감소 (`prefers-reduced-motion`) — 슬라이드 클락인 등 | manual |
| UX-A11Y-09 | 폰트 크기 사용자 확대 — `100% ~ 200%` 깨짐 없음 | manual |
| UX-A11Y-10 | 에러 메시지 — 시각 + 텍스트 + 스크린리더 announce (`role="alert"`) | manual |

### 5.3 자동화 권장

- Storybook a11y addon (`@storybook/addon-a11y`) 활성화
- e2e 에 axe-playwright 추가하여 `/login`, `/m/home`, `/admin` 3 페이지 자동 점검
- 갭: 현재 자동 a11y 점검 0건 → backlog 등록 권장 (B-CODE-09 a11y 자동화)

---

## 6. 페르소나 동선 (Persona Walkthrough)

### 6.1 EMPLOYEE (직원)

`docs/manuals/employee.md` (있다면) 와 일치 검증. 동선:

1. `/login` → 로그인 → `/m/home`
2. 슬라이드 클락인 → 위치 검증 → WORKING 상태
3. `/m/leave` → 잔여 확인 → `/m/leave/apply` → 신청 → 성공
4. `/m/inbox` → 본인 신청 PENDING 확인
5. `/m/my` → 프로필 / 알림 설정 / 로그아웃

**검증 포인트**:
- 각 화면 진입 시간 ≤ 2s
- TabBar 4개 항목 모두 도달 가능 (home/team/leave/my)
- WORKING 상태에서 클락아웃 슬라이드 노출 + 휴게 버튼 명확
- `/m/help` → FAQ + 매뉴얼 접근 가능

### 6.2 MANAGER (팀 리더)

1. `/login` → `/m/home` (직원과 공통)
2. 데스크탑/웹: `/web` 로 변경 → 팀 인박스 + 캘린더 위주
3. `/web/inbox` 또는 `/m/inbox/quick` → 본인 팀 신청 처리
4. WS 통한 신규 신청 실시간 표시 (no refresh)
5. swipe-to-approve UX 작동 검증

**검증 포인트**:
- 본인 팀 외 신청 미노출 (권한 가드)
- 본인 신청을 본인이 승인 시도 → 403 또는 UI 차단
- 일괄 승인 / 거부 잘 작동
- 거부 시 사유 입력 필수

### 6.3 ADMIN (HR / 운영)

1. `/login` → `/admin` redirect (admin 메뉴 우선)
2. 대시보드 KPI 노출 (출석률, pending, OT 진행중)
3. `/admin/employees` → 직원 일괄 등록 / 역할 변경 / 비활성화
4. `/admin/approvals` → 일괄 결정
5. `/admin/reports` → 월간 리포트 → CSV export
6. `/admin/expiring-leave` → 만료 예정 알림 발송
7. `/admin/audit` → 감사 로그 필터링 / 조회
8. `/admin/codes` → 회사 코드 발급 / 회수
9. `/admin/compliance` → 52h 보드
10. `/admin/settings` → 회사 설정 변경 (브랜드 / 정책 / 위치)

**검증 포인트**:
- 모든 ADMIN 화면이 nav 에 노출 + 빈 상태 명확 (empty state)
- 설정 변경 시 audit 로그 자동 기록 (audit 화면에서 즉시 확인)
- bulk 작업 후 toast + 인박스 갱신

### 6.4 OWNER (최고 관리자)

ADMIN 의 모든 권한 + 추가:

1. `/owner/billing` 접근 가능 (ADMIN 은 redirect)
2. 현재 플랜 + 결제 수단 + 인보이스 목록 노출
3. "Change plan" 버튼 — **현재 비활성 + tooltip "iter14 예정 — Stripe 결제 연동 후 활성화"**
4. 역할 위임 (OWNER → ADMIN) 가능

**검증 포인트**:
- ADMIN 이 `/owner/billing` 직접 URL → `/admin` redirect
- "Change plan" 비활성 상태 정확 (i18n key `owner.billing.change_plan_tooltip`)
- 인보이스 목록 read-only — 다운로드는 placeholder 또는 비활성 (B-CODE-01 후 활성)

---

## 7. 반응형 / 멀티 디바이스

| 디바이스 | 뷰포트 | 검증 |
|---|---|---|
| 모바일 (Android) | 390×844 (대표), 360×640 (구형) | 모든 `/m/*` 페이지 + 온보딩 |
| 태블릿 | 768×1024 | shell 자동 — `/m/*` 모바일 유지 또는 `/web/*` 전환 정책 검증 |
| 데스크탑 | 1280×800, 1920×1080 | `/web/*` + `/admin/*` 메인 사용 환경 |
| Electron | 위 데스크탑 동일 | 추가: 트레이 + 자동 클락인 + 자동 업데이트 |
| WebView (iOS Safari) | 390×844 | NativeBridge 통한 위치 / 푸시 권한 다이얼로그 |
| WebView (Android Chrome) | 390×844 | Glance 위젯 데이터 동기화 |

---

## 8. 라이브 테스트 (Live Test) — 박제 기준

라이브 테스트 시 다음을 모두 박제 (`docs/qa/live-test-YYYY-MM-DD-*.md` + `docs/qa/screenshots/<slug>/`):

1. **환경 확인 박제**:
   - `make up` 출력 (api/ws/web 부팅)
   - `curl /v1/health` → 200 JSON
   - Electron `http://localhost:9222/json/list` → 페이지 URL 확인
   - Flutter / Android emulator 상태

2. **페르소나 sweep**:
   - 4 페르소나 (employee / manager / admin / owner) 각 로그인 → 주요 화면 5-10개 visit → 스크린샷
   - i18n `?[key]` 정규식 결과 (비어야 함)
   - console-smoke / network-smoke 결과 (0 failure)

3. **GAP 보고**:
   - 발견 GAP 마다: 화면 + 재현 절차 + 우선순위(P0/P1/P2) + 스크린샷
   - 보고서는 PR 의 task doc 으로 연결

**과거 라이브 테스트 보고서** (참고용):
- `docs/qa/iter13-live-test-findings.md` (2026-05-09)
- `docs/qa/live-test-2026-05-10-prelaunch-smoke.md` (2026-05-10) — 최신, GAP 14 — 모두 fix 됨

---

## 9. Release Gate (UI/UX)

다음 모두 통과해야 GA:

1. design-smoke 스크린샷 신규 + 측정값 모두 통과 (e2e-ui-ux-audit.md §3 표 일치)
2. console-smoke + onboarding-console-smoke 0 failure
3. 본 문서 §1 디자인 토큰 준수 — 하드코딩 검출 0
4. 본 문서 §4 i18n 패리티 — ko/en 키 카운트 동일 + `?[key]` 0
5. 본 문서 §6 4 페르소나 sweep 1회 이상 통과 + 박제 commit

추가 (Phase 4 한정):
6. axe-core 1차 점검 통과 (HIGH/CRITICAL 0)
7. WCAG AA contrast 점검 (자동 + 수동)

---

## 10. 다음 단계

### 자동화 갭
- **a11y 자동화** — backlog 등록 권장 (axe-playwright 추가)
- **design-smoke 확대** — 18개 화면으로 확장 (현재 4개)
- **Storybook → Chromatic 베이스라인** — 정기 갱신 워크플로 명확화

### 문서 갭
- 페르소나별 화면 동선 다이어그램 (mermaid) — 본 문서 §6 보강 가능
- 컬러 contrast 매트릭스 (모든 토큰 조합) — design-system.md §3 보강 가능

### 박제 정책
- 라이브 테스트 보고서 → reviewer 1인 + designer 1인 sign-off
- 스크린샷 commit 정책 — `docs/qa/screenshots/` 만 (apps/e2e/test-results 는 untracked)
