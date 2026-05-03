# 엔지니어링 가이드라인

> **상태**: v0.2 — 모든 신규 작업은 본 가이드를 따른다.

---

## 1. TDD (Test-Driven Development) — 필수

모든 도메인 / 비즈니스 로직 작업은 **빨강 → 초록 → 리팩터** 사이클로 진행한다.

1. **빨강 (Red)** — 테스트를 먼저 작성한다. 실패를 확인한다.
2. **초록 (Green)** — 테스트가 통과하는 가장 단순한 구현을 작성한다.
3. **리팩터 (Refactor)** — 중복 제거, 명명 개선. 테스트는 계속 통과해야 한다.

### 룰
- **테스트 없는 PR 거부.** 도메인 로직 / 서비스 / 뷰 / 시리얼라이저 모두 해당.
- **유닛 테스트는 1ms ~ 100ms** — 외부 의존성 mock 가능 시 mock.
- **통합 테스트는 실제 Postgres / Redis** 사용 (Docker 컴포즈 환경).
- **모든 테스트는 격리되어 실행 가능**해야 한다 (순서 의존 금지). pytest-django 의 트랜잭션 자동 롤백을 사용.
- **새로운 엔드포인트 = 통합 테스트 1개 이상** (성공 + 실패 + 권한). e.g. `tests/test_attendance.py::test_clock_in_success`.
- **새로운 비즈니스 룰 = 유닛 테스트 1개 이상**. e.g. 연차 부여 룰, 위치 범위 검증.
- **회귀 (Regression)**: 버그 수정 시 그 버그를 잡는 테스트를 먼저 추가한다.

### 디렉토리
```
services/api/
├── apps/<domain>/
│   ├── services.py       # 순수 비즈니스 로직 (유닛 테스트 대상)
│   ├── builders.py       # Builder 패턴 (3절 참조)
│   ├── views.py          # API 레이어 (통합 테스트 대상)
│   └── tests/            # 도메인 내부 테스트
├── tests/                # 크로스 도메인 / 통합 테스트
│   ├── factories.py      # factory-boy 팩토리
│   ├── test_*.py         # 도메인별 통합 테스트
└── pytest.ini
```

```
apps/web/src/
├── shared/               # FSD shared 레이어
├── entities/, features/, ...  # FSD 레이어 (2절 참조)
└── **/__tests__/         # 컴포넌트 / 훅 / 유틸 테스트 (vitest)
```

---

## 2. Frontend — Feature-Sliced Design (FSD)

`apps/web/src/` 는 **FSD (Feature-Sliced Design)** 레이어 구조를 따른다.
참고: https://feature-sliced.design/

### 레이어 (위 → 아래로 import)
```
app/        - 앱 부트스트랩 (Provider, Router, 전역 스타일)
processes/  - 다단계 비즈니스 프로세스 (예: 8-step onboarding)
pages/      - 라우트별 화면 컴포지션 (얇은 어댑터)
widgets/    - 페이지 레벨 위젯 (Header, Sidebar, BottomNav)
features/   - 사용자 인터랙션 단위 (clock-in 슬라이드, leave-apply 폼)
entities/   - 도메인 엔티티 (User, Attendance, Leave, Team)
shared/     - UI 키트, libs, api 클라이언트, configs
```

### 슬라이스 / 세그먼트
각 레이어는 **slice (도메인 폴더)** 로 나뉘고, 그 아래 표준 세그먼트:
```
features/clock-in/
├── ui/             # React 컴포넌트
├── model/          # state, hooks, store
├── api/            # 서버 통신
├── lib/            # 유틸
└── index.ts        # public API (단일 export 진입점)
```

### 룰
- **상위 레이어만 하위 레이어를 import** 한다. (페이지가 features 를, features 가 entities 를 import. 역방향 금지.)
- **같은 레이어의 다른 슬라이스 간 직접 import 금지**. 상위 레이어에서 조합한다.
- **각 슬라이스는 `index.ts` 만 외부에 노출**한다. 내부 파일 직접 import 금지.
- ESLint 룰로 강제 (`eslint-plugin-boundaries`).

### 매핑 (현재 도메인)
| 슬라이스 | 레이어 | 설명 |
|---|---|---|
| `auth` | features | login, signup, token mgmt |
| `clock-in` | features | 슬라이드 / 탭 / 위치 검증 |
| `leave-apply` | features | 신청 폼 |
| `inbox-decide` | features | 승인 / 반려 액션 |
| `attendance` | entities | AttendanceRecord 모델 + 카드 UI |
| `leave` | entities | Balance, Request 모델 + 카드 |
| `team` | entities | Member status 그리드 |
| `onboarding` | processes | 8단계 stepper |
| `m-home` | pages | `/m/home` |
| `mobile-shell` | widgets | TabBar + 헤더 |
| `ui-kit` | shared | Button, TextField, Card, ListRow ... |
| `api-client` | shared/api | fetch wrapper, types |
| `i18n` | shared/lib | i18next |
| `tokens` | shared/styles | tokens.css |

---

## 3. Backend — Builder & 기타 패턴

DRF / Django 코드에 다음 패턴을 적극 사용한다.

### 3.1 Builder
복잡한 도메인 객체 생성 / 검증을 분리.

```python
# apps/attendance/builders.py
class AttendanceRecordBuilder:
    def __init__(self, membership, work_date):
        self._m = membership; self._d = work_date
        self._location = None; self._kind = None; self._client_time = None
    def with_location(self, lat, lon, accuracy_m):
        self._lat, self._lon, self._accuracy = lat, lon, accuracy_m; return self
    def with_kind(self, kind):
        self._kind = kind; return self
    def at(self, when: datetime):
        self._client_time = when; return self
    def build_clock_in(self) -> AttendanceRecord:
        # validate location -> matched_location_id, set is_late, save row...
```

### 3.2 적용 영역
| 패턴 | 사용처 |
|---|---|
| **Builder** | AttendanceRecordBuilder, LeaveRequestBuilder, ApprovalTaskBuilder |
| **Strategy** | LeaveAccrualStrategy (회사별 룰) — `apps/leave/strategies.py` |
| **Repository** | 복잡 쿼리 격리 — `apps/<domain>/repositories.py` |
| **Service Layer** | `apps/<domain>/services.py` — 트랜잭션 경계, 비즈니스 룰 |
| **Specification** | 권한 / 자격 룰 — `core/specifications.py` |
| **Factory** | 테스트 픽스처 — `tests/factories.py` (factory-boy) |
| **Decorator** | DRF 권한 (`HasRole.at_least('MANAGER')`) — `core/permissions.py` |

### 3.3 레이어 분리
```
View ──> Service ──> Builder/Repository ──> Model/ORM
         (트랜잭션, 룰 조합)        (단일 책임)
```

- **View**: HTTP 변환 (직렬화 / 응답 코드). 비즈니스 로직 금지.
- **Service**: 트랜잭션 경계. 도메인 룰 호출. 외부 효과 (알림 발송) 큐잉.
- **Builder**: 단일 객체의 valid 한 인스턴스 생성. 검증 단계별 분리.
- **Repository**: 복잡한 쿼리 (조인 / 집계 / 윈도우 함수). 단순 CRUD 는 ORM 직접.

### 3.4 의존성 방향
- View → Service → Repository / Builder → ORM
- 역방향 import 금지 (Builder 가 View 를 알지 못한다).

### 3.5 예외 처리
- 비즈니스 예외는 `core.errors.DomainError` 상속.
- View 는 try/except 로 잡지 않는다 — 전역 `exception_handler` 가 응답 변환.

---

## 4. 코딩 스타일

### Python
- ruff (line length 100, isort 호환)
- mypy strict (점진적). 신규 모듈은 strict 통과 필수.
- 모든 함수에 type hint.

### TypeScript
- strict mode 켜져 있음 (이미 설정됨).
- `any` 금지. 부득이하면 `unknown` 후 좁히기.
- 컴포넌트는 함수형 + 200줄 이하. 넘으면 분리.

---

## 5. 커밋 / 브랜치

- 모든 커밋: `<type>(<scope>): <subject>` (Conventional Commits)
- types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`
- 테스트가 추가되지 않은 `feat` / `fix` 는 코드 리뷰에서 거절.

---

## 6. 빠른 체크리스트 (PR 머지 전)

- [ ] 새 비즈니스 룰 → 유닛 테스트
- [ ] 새 엔드포인트 → 통합 테스트 (성공 + 실패 + 권한)
- [ ] FE 신규 파일 → FSD 레이어 / 슬라이스 / 세그먼트 규칙 준수
- [ ] BE 신규 도메인 → Service / Builder / Repository 분리
- [ ] `docker compose exec api pytest -q` 100% 통과
- [ ] `docker compose exec web npm run typecheck && npm run build` 통과
- [ ] 새 엔드포인트는 `docs/api/api-spec.md` 에도 반영
- [ ] 새 화면은 `docs/specs/screen-catalog.md` 에 매핑
