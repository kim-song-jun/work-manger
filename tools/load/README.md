# Load Testing — Locust

operations-guide.md §11.1 의 부하 테스트 항목을 충족하기 위한 스켈레톤.

## 설치

```bash
pip install locust>=2.31
```

## 실행

```bash
# 1. 풀스택 기동 + seed
make up
docker compose --profile seed run --rm seed

# 2. 헤드리스 — 1000명 / 50명/s 램프 / 5분
locust -f tools/load/locustfile.py \
       --host http://localhost:4455 \
       --users 1000 --spawn-rate 50 \
       --run-time 5m --headless --print-stats

# 3. 웹 UI (인터랙티브)
locust -f tools/load/locustfile.py --host http://localhost:4455
# → http://localhost:8089
```

## 시나리오 가중치

`locustfile.py` 의 `EmployeeUser` 가 90% / `AdminUser` 가 10%.

| 작업 | 직원 가중치 | 관리자 가중치 |
|---|---|---|
| 출근 펀치 (POST /attendance/clock-in) | 10 | — |
| 오늘 출근 조회 (GET /attendance/today) | 5 | — |
| 연차 잔액 (GET /leave/balance) | 3 | — |
| 인박스 (GET /inbox) | 2 | — |
| 공지 (GET /notice) | 1 | — |
| 어드민 대시보드 (GET /admin/dashboard) | — | 5 |
| 어드민 승인 대기 (GET /admin/approvals) | — | 2 |
| 어드민 만료 연차 (GET /admin/leave/expiring) | — | 1 |

## 09:00 출근 피크 모사

`--spawn-rate 50` 으로 1000명까지 20초 안에 램프 → 09:00 ~ 09:00:20 의 동시 출근 행동 모사.
출근 펀치가 가중치 10 이라 첫 분에 1000건 이상 클럭인 발화. RDS 쓰기 + Celery 디스패치 부하가 함께 측정됨.

## 목표 SLA (operations-guide §13)

| 지표 | 목표 |
|---|---|
| 95p 응답 (clock-in) | < 800ms |
| 95p 응답 (read 계열) | < 300ms |
| 5xx 비율 | < 0.5% |
| 1000 users 5분 동안 평균 RPS | ≥ 200 |

미달 시: `infra/terraform/modules/api/main.tf` 의 ECS 태스크 수 / RDS instance class 조정.

## 트러블슈팅

- 로그인 5xx 다발: `services/api/work_manager/settings/test.py` 의 `SIMPLE_JWT.ROTATE_REFRESH_TOKENS` 가 True 면 N개 동시 로그인 시 refresh table 락이 병목. dev/stg 에서는 False 권장.
- DB connection pool 고갈: `DJANGO_DB_CONN_MAX_AGE` 와 `DJANGO_DB_CONN_HEALTH_CHECKS` env 확인.
- `503 Service Unavailable`: nginx upstream 시간 초과. WS 트래픽이 mixed 되면 `proxy_read_timeout` 상향 (60s → 180s).
