# 테스트 작성 표준 (Testing Standards)

> 모든 테스트 파일은 본 표준의 헤더 docstring + 케이스 코멘트 형식을 따른다.
> 표준에 맞지 않은 테스트가 추가된 PR 은 머지 거부.

---

## 1. 테스트 종류 (구분 명확히)

| 종류 | 위치 | 도구 | 격리 수준 |
|---|---|---|---|
| **Unit (BE)** | `services/api/tests/test_<unit>.py` 또는 도메인 내부 | pytest | 메모리 / mock |
| **Integration (BE)** | `services/api/tests/test_<feature>.py` | pytest + APIClient + 실제 Postgres / Redis | 트랜잭션 자동 롤백 |
| **Unit (FE)** | `apps/web/src/**/*.test.{ts,tsx}` | vitest + RTL | jsdom |
| **Story / Visual (FE)** | `apps/web/src/**/*.stories.tsx` | Storybook | 격리된 컴포넌트 |
| **E2E** | `apps/e2e/**/*.spec.ts` (예정) | Playwright | 실제 도커 스택 |

---

## 2. 헤더 docstring (필수)

모든 테스트 파일 첫 부분에 다음 정보를 docstring/JSDoc 으로 기재한다.

### Backend (Python)
```python
"""
Test: leave-balance accrual + expiry
Type: Integration (real Postgres, Celery task in-process via CELERY_TASK_ALWAYS_EAGER)
Why:  연차 자동 발생/소멸은 사용자 신뢰의 핵심 (사용자 메모리 §5).
      배치가 누락되면 잔여 표시가 어긋나 분쟁이 발생할 수 있으므로
      매월/매년 룰의 멱등성과 정확성을 회귀 보호한다.
Covers:
  - apps.leave.tasks.grant_monthly()           — 월차 부여 룰
  - apps.leave.tasks.grant_annual()            — 연차 일괄 부여 룰
  - apps.leave.services.expire_balances()      — 만료 처리
  - apps.leave.services.compute_balance()      — 잔여 합산
Out of scope:
  - 알림 발송 (test_notification.py 가 다룸)
  - UI 표시 (FE 단위 테스트가 다룸)
Coverage target: ≥ 90% lines for apps/leave/{services,tasks}.py
"""
```

### Frontend (TypeScript)
```ts
/**
 * Test: <feature> · <component name>
 * Type: Unit (vitest + RTL, jsdom)
 * Why:  <Toss-style 설계 원칙 또는 사용자 시나리오 한 줄>
 * Covers:
 *   - <component>.<behavior 1>
 *   - <component>.<behavior 2>
 * Out of scope:
 *   - 네트워크 응답 (msw 또는 e2e)
 *   - 시각 회귀 (Storybook + chromatic 향후)
 * Coverage target: 100% branches for this component
 */
```

### E2E (Playwright)
```ts
/**
 * Spec: 출근 골든 패스 (slide-to-clock-in)
 * Type: E2E (실 Postgres + Redis + Django + Vite, 도커 스택 사용)
 * Why:  사용자 핵심 동작. 09:00 트래픽 피크 시 마찰 없이 동작해야 한다.
 * Pre-conditions:
 *   - 회사 코드로 가입 완료, 본사 위치 등록 완료
 *   - GPS 권한 grant 모킹
 * Coverage:
 *   - 슬라이드 시 POST /v1/attendance/clock-in 호출
 *   - 성공 토스트 "출근이 등록됐어요" 표시
 *   - 카드 상태가 "근무 중" 으로 전환
 * SLO 검증: clock-in P95 < 1s (이 테스트는 1s 임계 어설션 포함)
 */
```

---

## 3. 케이스 docstring (각 함수/it 블록)

각 테스트는 한 줄 docstring으로 **무엇을** + **왜**를 적는다.

```python
def test_clock_in_out_of_range_returns_422():
    """위치가 범위 밖일 때 422 + 'LOCATION_OUT_OF_RANGE' 반환.
    이유: 모바일이 사용자에게 "수동 출근" 플로우를 보여줄지 결정한다.
    """
```

```ts
it("renders the disabled state when loading", () => {
  // Why: 사용자가 더블탭으로 중복 출근 요청을 보내지 못하게 막는다.
});
```

---

## 4. 커버리지 정책

### 단계별 임계값
| 단계 | 라인 | 함수 | 분기 |
|---|---|---|---|
| Phase 0 (현재) | 50% | 60% | 40% |
| Phase 1 (MVP 출시) | 75% | 80% | 60% |
| Phase 2 (GA 후 분기) | 85% | 85% | 70% |

### 도메인별 우선순위 (높을수록 커버리지 ↑)
1. **Critical (≥ 90%)**: `apps/attendance/services`, `apps/leave/services`, `apps/leave/tasks`,
   `apps/identity/onboarding_views`, `apps/approval/views` — 비즈니스 룰 / 자동 배치
2. **Standard (≥ 75%)**: 기타 `apps/*/services`, `core/*`
3. **Light (≥ 50%)**: views (행복 경로 + 1~2개 실패 케이스), serializers
4. **자유**: admin.py, apps.py, migrations (일반 룰)

### 측정
- BE: `docker compose exec api pytest --cov=apps --cov=core --cov-report=term-missing`
- FE: `docker compose exec web npm run test -- --coverage`

### 임계값 검증
- BE: `pytest-cov` `--cov-fail-under=50` (CI 게이트)
- FE: `vitest.config.ts` `coverage.thresholds`

---

## 5. AAA 패턴 (Arrange–Act–Assert)

```python
def test_decide_request_approves_and_creates_used_balance():
    # Arrange — given a pending leave with sufficient balance
    member = MembershipFactory()
    LeaveBalanceFactory(membership=member, kind="GRANTED", days=Decimal("5"))
    req = LeaveRequestFactory(membership=member, days=Decimal("2"), status="PENDING")
    task = ApprovalTaskFactory(target_id=req.id, target_type="LEAVE", approver=member)

    # Act
    decide_request(task, "APPROVE", member)

    # Assert
    req.refresh_from_db()
    assert req.status == "APPROVED"
    assert sum_used_days(member) == Decimal("2")
```

각 섹션 사이에 빈 줄 + 주석. 한 테스트는 **한 가지 행동**만 검증.

---

## 6. 안티패턴 — 즉시 PR 리뷰에서 거절

- 테스트가 두 개 이상의 unrelated assert (예: 출근 + 연차 둘 다)
- `time.sleep()` (대신 `freeze_time` / fake clock)
- 외부 네트워크 호출 (테스트는 격리되어야 함)
- "fix later" TODO 가 달린 expected==actual 뒤집기
- 헤더 docstring 누락
- 동일 데이터를 매 테스트마다 setUp 으로 매번 만들기 (대신 factory + scoped fixture)

---

## 7. CI 통합

```
ci-backend:
  - docker compose up -d db redis
  - docker compose exec api pytest --cov=apps --cov=core \
      --cov-report=xml --cov-fail-under=50

ci-frontend:
  - docker compose exec web npm run typecheck
  - docker compose exec web npm run test -- --coverage
  - docker compose exec web npm run build
```

커버리지 게이트가 실패하면 머지 차단. 임계값은 [4절](#4-커버리지-정책) 표 기반으로 분기마다 상향.
