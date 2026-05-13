# Runbook — 장애 시나리오별 대응

> 각 시나리오는 **증상 → 즉시 조치 → 근본 원인 조사 → 재발 방지** 순으로 구성.
> 신규 시나리오는 PR 로 추가, 사후 보고서가 출처가 되어야 함.

---

## R-001 · API 응답 5xx 급증

### 증상
- CloudWatch alarm: `5xx_rate > 1% / 5분`
- Sentry 새 이슈 폭증

### 즉시 조치
1. Slack `#incidents` 에 공지 (영향 범위 추정)
2. CloudWatch Logs 에서 trace_id 샘플 확보
3. 최근 배포 확인:
   - 배포 5분 ~ 30분 이내 → 즉시 롤백 검토 (이전 ECS task definition)
   - 배포 외 시점 → 의존 서비스 (DB / Redis / 외부 API) 상태 확인
4. 트래픽 패턴 (DDoS 의심 시 WAF 룰 확인)

### 근본 원인 조사
- 에러 로그 클러스터링 (동일 stack trace 그룹)
- DB lock waits, slow query
- 의존 서비스 타임아웃

### 재발 방지
- 회귀 테스트 추가
- 알림 임계 / 메트릭 보강
- 배포 프로세스 개선

---

## R-002 · 출근 실패 다발 (09:00 KST 트래픽 피크)

### 증상
- `/attendance/clock-in` 5xx 또는 P95 > 2s
- 사용자 문의 급증

### 즉시 조치
1. ECS API 인스턴스 수 즉시 증가 (수동 scale out)
2. DB 커넥션 풀 사용량 확인 — 100% 도달 시 인스턴스 업그레이드 / 풀 사이즈 조정
3. Redis 메모리 / latency 확인
4. 앱 측에 "잠시 후 다시 시도" 안내 푸시 (관리자 승인)

### 근본 원인 조사
- DB row lock (`attendance_record` UNIQUE 충돌 정상이지만 트랜잭션 길이 점검)
- ORM N+1 쿼리
- 외부 의존 (위치 검증, 푸시 발송) 동기 호출 여부 → 비동기로 분리

### 재발 방지
- 09:00 / 18:00 piek 부하 테스트 정기화
- HPA 임계 조정 (CPU 50% → 40% 트리거)
- 출근 핵심 경로는 외부 의존성 제거, 후속 작업은 큐로

---

## R-003 · 연차 자동 부여 배치 실패

### 증상
- Celery Beat 실패 알림
- 다음날 사용자 잔여 표시 이상

### 즉시 조치
1. Celery 워커 / Beat 상태 확인
2. 마지막 성공 실행 시각 확인 (Beat schedule meta)
3. 수동 재실행:
   ```bash
   python manage.py shell -c "from tasks.leave import grant_monthly; grant_monthly.delay()"
   ```
4. 결과 검증 — 임의 사용자 잔여가 정확히 부여됐는지

### 근본 원인 조사
- 정책 변경 후 룰 파싱 에러
- DB 마이그레이션 미적용
- 배치 실행 시간 초과 (큰 회사 진입 시)

### 재발 방지
- 배치 단위 작게 (회사별 chunk)
- dry-run 모드 — 실제 변경 없이 결과 검증
- 매일 결과 요약을 운영팀 메일로 발송

---

## R-004 · DB Primary 장애

### 증상
- API 5xx, "could not connect to server" 다발
- RDS console 에서 instance status FAILED

### 즉시 조치
1. AWS console 에서 Multi-AZ failover 진행 상태 확인 (자동 실행됨, 약 60~120초)
2. failover 완료 후 API 자동 복구 확인
3. 미복구 시 ECS 서비스 재시작 (커넥션 풀 리셋)
4. 사용자 영향 공지 (배너 / 푸시)

### 근본 원인 조사
- AWS RDS 이벤트 로그 / Performance Insights
- 디스크 / 메모리 / IOPS 한계 도달 여부
- 갑작스런 long query / lock contention

### 재발 방지
- 자동 failover 검증 (분기별 시뮬레이션)
- read replica 추가 운영
- 모니터링 임계 강화

---

## R-005 · Redis 장애

### 증상
- 세션 / 캐시 / Celery 브로커 사용 불가
- API 가 캐시 미스 다발 → DB 부하 급증
- WS 연결 끊김

### 즉시 조치
1. ElastiCache failover 자동 실행 확인
2. API 코드 레벨 fallback (캐시 없이 동작) 작동 확인
3. WS 사용자 재접속 안내

### 근본 원인 조사
- 메모리 부족 (eviction 폭증)
- 네트워크 / AZ 장애

### 재발 방지
- 메모리 사용량 알림 강화
- 캐시 의존 제거 가능한 코드 식별 (graceful degradation)

---

## R-006 · 푸시 알림 미발송

### 증상
- 사용자가 출근 알림 / 승인 알림 받지 못함

### 즉시 조치
1. Celery `notification.high` 큐 길이 확인
2. FCM / APNs 응답 코드 분석 (`UNREGISTERED`, `NOT_REGISTERED`, `InvalidApnsCredentials` 등)
3. APNs 인증서 / FCM 서비스 계정 키 만료 여부 확인
4. 만료 시 즉시 갱신 → 워커 재시작

### 근본 원인 조사
- 인증서 / 키 만료
- 토큰 일괄 invalid (앱 업데이트 후 토큰 무효화 케이스)

### 재발 방지
- 인증서 만료 30일 / 14일 / 7일 전 자동 알림
- 디바이스 토큰 재등록 플로우 검증

---

## R-007 · OAuth 로그인 실패

### 증상
- Google / Kakao 로그인 100% 실패

### 즉시 조치
1. Provider console 에서 키 / 콜백 URL 검증
2. 최근 client secret 로테이션 여부 확인
3. provider 의 status page 확인

### 근본 원인 조사
- 도메인 / 콜백 URL 변경 누락
- 시크릿 만료

### 재발 방지
- OAuth client secret 만료 알림 자동화

---

## R-008 · 위치 기반 출근 불가 (광범위)

### 증상
- "위치 범위 외" 사용자 다발

### 즉시 조치
1. 회사 location 좌표 변경 여부 확인 (오설정 포함)
2. radius_m 임시 조정 가능 (관리자 승인)
3. "수동 출근 신청" 플로우 안내

### 근본 원인 조사
- 회사 사옥 이전 / 좌표 변경
- 모바일 OS GPS 권한 변경
- 서버 시간 / 위치 검증 룰 변경

### 재발 방지
- 회사 위치 변경은 관리자 페이지에서 확인 다이얼로그 + 감사 로그
- 위치 검증 실패율 모니터링 → 임계 초과 시 알림

---

## R-009 · WebSocket 연결 끊김 다발

### 증상
- `wss://` 연결 실패율 급증
- 실시간 보드 업데이트 안 됨

### 즉시 조치
1. daphne 인스턴스 상태 / CPU 확인
2. ALB target health 확인
3. ElastiCache pubsub 정상 여부

### 근본 원인 조사
- daphne 워커 한계 동시 연결 도달
- 네트워크 ACL 변경

### 재발 방지
- daphne 인스턴스 분리, 동시 연결 한계 모니터링

---

## R-010 · 데이터 export 요청 (GDPR / 개인정보보호법)

### 증상
- 사용자가 본인 데이터 export 요청

### 즉시 조치
1. 신원 검증 (이메일 인증)
2. 관리자 페이지 → 사용자 → "데이터 export" 메뉴 사용
3. 24시간 내 export ZIP S3 presigned URL 전달 (7일 유효)

### 근본 원인 조사
해당 없음 (정상 운영 절차).

### 재발 방지
해당 없음.

---

## R-011 · 의심스러운 로그인 시도

### 증상
- 단일 사용자 / 단일 IP 에서 로그인 실패 다수
- 또는 비정상 지역에서 성공한 로그인

### 즉시 조치
1. 해당 사용자 계정 잠금 (로그인 실패 5회 시 자동, 수동 잠금 가능)
2. 사용자에게 비밀번호 재설정 안내
3. 같은 IP 의 모든 계정 보호 모드

### 근본 원인 조사
- credential stuffing
- phishing 으로 유출된 비밀번호

### 재발 방지
- 2FA 강제 정책 (관리자/오너부터)
- 비정상 로그인 자동 알림 강화

---

## R-PoC-01 · Home Native PoC 베타 토글 운영

### 베타 사용자 enable

```bash
# 특정 사용자 enable
docker compose exec api python manage.py set_user_setting \
  --user-id=<UUID> --key=use_native_home --value=true

# 전체 active 사용자 enable (대량 베타)
docker compose exec api python manage.py set_user_setting \
  --bulk --key=use_native_home --value=true
```

다음 앱 부팅 시 `_BootState._resolve` 가 `GET /v1/me/settings` → `use_native_home=true` 확인 → `WMHomeScreen` 으로 분기.

### 회귀 발생 시 disable

```bash
docker compose exec api python manage.py set_user_setting \
  --bulk --key=use_native_home --value=false
```

다음 부팅 시 WebView 로 전체 fallback. 즉시 끄기가 필요하면 React SPA settings 화면에서 사용자에게 PATCH `/v1/me/settings` 안내.

### KPI 수집

Sentry 대시보드:
- `home.boot` transaction → cold start 측정 (p50/p95)
- `home.load` transaction → GET /v1/me/dashboard latency
- `home.clock-in` transaction → POST /v1/attendance/clock-in latency

베타 5인 × 14일 라이브 종료 시 Sentry 에서 numbers 추출 → spec §9 KPI 표 채움.

### 회의 SOP
- Go/No-Go 회의 — Plan-A spec §11 분기 표 따름
- Go: ADR-007 Accepted 승격, B-NAT-03/04 backlog active 등록
- No-Go: ADR-007 보류, WebView polish 검토
