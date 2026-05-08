# Chaos Testing

operations-guide.md §11.1 의 카오스 시나리오 — DB / Redis / Celery 다운 시 시스템 회복 검증.

## 전제

```bash
make up                                          # 풀스택 기동
docker compose --profile seed run --rm seed     # seed_demo
```

`tools/load/locustfile.py` 동시 실행 권장 (부하 + 카오스 합산 검증).

## 시나리오

| 스크립트 | 가설 | 검증 |
|---|---|---|
| `db_pause.sh` | RDS 일시 정지 시 API 가 graceful degradation (5xx 대신 503 + 재시도 헤더) | API 헬스 `/v1/health` 가 5xx 로 떨어졌다가 30초 내 회복 |
| `redis_down.sh` | Redis 다운 시 Celery 큐는 멈추고 API 의 cache miss 만 발생 (인증/세션 영향 없음) | API 가용성 유지, Celery 작업 backlog 가 redis 복구 후 drain |
| `celery_pause.sh` | Celery 워커 SIGSTOP 시 동기 API 응답은 영향 없음, 비동기 작업 (알림/리포트) 만 지연 | API 가 200 OK 유지, 알림 dispatch 시 outbox 에 누적 |
| `ntfy_down.sh` | ntfy 컨테이너 다운 시 푸시 알림이 fallback 경로 (Web Push / APNs) 만으로도 동작 | 알림 수신 일부 누락 허용, 5xx 무발생 |

## 실행

```bash
# 단일 시나리오
./tools/chaos/scripts/db_pause.sh        # DB 30초 멈춤
./tools/chaos/scripts/redis_down.sh      # Redis 60초 다운
./tools/chaos/scripts/celery_pause.sh    # Celery worker SIGSTOP 30초
./tools/chaos/scripts/ntfy_down.sh       # ntfy 60초 다운

# 통합 — 4 시나리오 순차
./tools/chaos/run_all.sh
```

각 스크립트는 시작/종료 타임스탬프 + 영향 범위 + 결과를 stderr 에 기록.

## 메트릭 수집

부하 테스트 + 카오스 동시 실행 시 다음 메트릭 캡처:

```bash
# 카오스 시작 직전 baseline
curl -fsSL http://localhost:4455/v1/health | jq .

# 카오스 동안 5초 간격 health probe
while true; do
  curl -s -o /dev/null -w "%{http_code} %{time_total}\n" http://localhost:4455/v1/health
  sleep 5
done > /tmp/health-probe.log &

./tools/chaos/scripts/db_pause.sh

# 카오스 종료 후 회복 확인
tail -20 /tmp/health-probe.log
```

## 관련 문서

- `docs/operations/runbook.md` §"DB 장애 복구 / Redis 장애 / Celery worker 멈춤"
- `docs/operations/operations-guide.md` §11.1
- `docs/architecture/architecture.md` §13 Capacity
