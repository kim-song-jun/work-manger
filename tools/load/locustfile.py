"""09:00 출근 피크 시뮬레이션 — Locust 부하 테스트.

operations-guide.md §11.1 의 권고 스켈레톤 (목표 DAU × 3 트래픽).

가정 시나리오:
  - 사용자가 출근 직전 ~ 직후 1-2분 사이에 대량으로 SPA 진입
  - 로그인 → 대시보드 → 출근 펀치 (5초 ~ 30초)
  - 일부 (~30%) 는 inbox / 알림 확인
  - 소수 (~5%) 는 연차 신청 / 잔액 조회

사용법 (헤드리스 1000명, 50/s 램프):
    locust -f tools/load/locustfile.py \\
           --host http://localhost:4455 \\
           --users 1000 --spawn-rate 50 \\
           --run-time 5m --headless

웹 UI 모드:
    locust -f tools/load/locustfile.py --host http://localhost:4455
    → http://localhost:8089

전제:
  - API 가 :4455 에서 응답
  - seed_demo 가 활성 (admin@acme.demo / DemoPass!1 + 25 employees + 회사 코드 ACMEDM)
  - 동시 로그인 시 토큰 발급이 병목이 되지 않도록 SimpleJWT 의 ALGORITHM=HS256 유지
"""
from __future__ import annotations

import random
from typing import Any

from locust import HttpUser, between, events, task


# ---- 설정 (env 로 override 가능) ---------------------------------------
DEFAULT_PASSWORD = "DemoPass!1"
EMPLOYEE_EMAILS = [
    f"emp{i:02d}@acme.demo" for i in range(1, 26)
]  # seed_demo 의 25명 직원
ADMIN_EMAIL = "admin@acme.demo"


@events.test_start.add_listener
def _print_setup(environment, **kwargs):
    print(
        f"[load] 시작 — host={environment.host} users={environment.parsed_options.num_users} "
        f"spawn-rate={environment.parsed_options.spawn_rate}"
    )


class EmployeeUser(HttpUser):
    """전형적인 직원 — 출근 → 잔액 → 알림 패턴."""

    wait_time = between(1, 3)
    weight = 9  # 90% of users

    def on_start(self) -> None:
        # 직원 풀에서 균등 추출 — 동일 계정 다중 로그인 방지하지 않음 (실제 모바일/데스크탑
        # 동시 로그인 케이스 모사)
        self._email = random.choice(EMPLOYEE_EMAILS)
        self.token: str | None = None
        with self.client.post(
            "/v1/auth/login",
            json={"email": self._email, "password": DEFAULT_PASSWORD},
            catch_response=True,
            name="POST /auth/login",
        ) as r:
            if r.status_code == 200:
                payload = r.json().get("data") or {}
                self.token = payload.get("access")
                if not self.token:
                    r.failure("login response missing access token")
            else:
                r.failure(f"login failed: {r.status_code}")

    def _headers(self) -> dict[str, str]:
        if self.token:
            return {"Authorization": f"Bearer {self.token}"}
        return {}

    @task(10)
    def clock_in(self) -> None:
        # 09:00 출근 피크의 핵심 — 가장 빈번
        self.client.post(
            "/v1/attendance/clock-in",
            headers=self._headers(),
            json={"kind": "OFFICE"},
            name="POST /attendance/clock-in",
        )

    @task(5)
    def fetch_today(self) -> None:
        self.client.get(
            "/v1/attendance/today",
            headers=self._headers(),
            name="GET /attendance/today",
        )

    @task(3)
    def fetch_balance(self) -> None:
        self.client.get(
            "/v1/leave/balance",
            headers=self._headers(),
            name="GET /leave/balance",
        )

    @task(2)
    def fetch_inbox(self) -> None:
        self.client.get(
            "/v1/inbox",
            headers=self._headers(),
            name="GET /inbox",
        )

    @task(1)
    def fetch_notice(self) -> None:
        self.client.get(
            "/v1/notice",
            headers=self._headers(),
            name="GET /notice",
        )


class AdminUser(HttpUser):
    """관리자 — 출근 피크에 대시보드 모니터링."""

    wait_time = between(2, 5)
    weight = 1  # 10% of users

    def on_start(self) -> None:
        self.token: str | None = None
        with self.client.post(
            "/v1/auth/login",
            json={"email": ADMIN_EMAIL, "password": DEFAULT_PASSWORD},
            catch_response=True,
            name="POST /auth/login (admin)",
        ) as r:
            if r.status_code == 200:
                payload = r.json().get("data") or {}
                self.token = payload.get("access")

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.token}"} if self.token else {}

    @task(5)
    def admin_dashboard(self) -> None:
        self.client.get(
            "/v1/admin/dashboard",
            headers=self._headers(),
            name="GET /admin/dashboard",
        )

    @task(2)
    def admin_approvals(self) -> None:
        self.client.get(
            "/v1/admin/approvals?status=pending",
            headers=self._headers(),
            name="GET /admin/approvals?status=pending",
        )

    @task(1)
    def admin_expiring_leave(self) -> None:
        self.client.get(
            "/v1/admin/leave/expiring",
            headers=self._headers(),
            name="GET /admin/leave/expiring",
        )
