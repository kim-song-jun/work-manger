# 운영 유의사항 (Operations Guide)

> **대상 독자**: 백엔드 / SRE / 온콜 엔지니어
> **읽기 전제**: [`architecture.md`](../architecture/architecture.md) 숙지

---

## 1. 환경

| 환경 | 도메인 | 사용 시점 |
|---|---|---|
| local | localhost | 개발 |
| dev | `*.dev.work-manager.molcube.com` | PR 통합 테스트 |
| stg | `*.stg.work-manager.molcube.com` | 출시 전 회귀 테스트 (운영 동일 구성) |
| prod | `*.work-manager.molcube.com` | 실 사용자 |

원칙: **stg 를 거치지 않은 변경은 prod 에 가지 않는다.** 핫픽스도 stg 에 30분 이상 머무른 뒤 prod.

---

## 2. 배포

### 2.1 일정
- 정기 배포: 화·목 오후 2시 (KST). 점심시간 / 출근시간(09:00 전후) / 퇴근시간(18:00 전후) **금지**.
- 긴급 배포: 운영 영향 없는 패치만. 두 명 이상 승인 + Slack `#release` 공지 후.

### 2.2 절차
1. `main` 머지 → CI 자동으로 stg 배포
2. stg 회귀 테스트 (자동 + 수동 체크리스트)
3. 릴리스 태그 (`v1.x.y`) → CI 가 prod 배포 워크플로 트리거 (수동 승인 게이트)
4. blue/green 또는 ECS rolling (50% → 100%, 헬스체크 통과 시)
5. 배포 후 5분 모니터링 (에러율, P95 레이턴시, 알림 채널)

### 2.3 롤백
- ECS: 이전 task definition 으로 즉시 롤백 (rolling 5분 이내)
- DB 마이그레이션 포함된 배포 롤백 시:
  - 코드만 롤백 (forward-compatible 마이그레이션 원칙)
  - 컬럼 / 테이블 drop 은 별도 배포 (충분한 stable 기간 후)

---

## 3. 출퇴근 도메인 — 운영 관점 위험 포인트

### 3.1 동시성

- 동일 멤버십이 여러 디바이스에서 동시에 출근 시도 → DB UNIQUE 제약으로 차단
- 첫 요청만 201, 나머지는 409 `ALREADY_CLOCKED_IN`
- **테스트 필수**: 트래픽 급증(09:00) 시 동시성 부하 테스트

### 3.2 시간 / 타임존

- 회사 단위 타임존 (`Asia/Seoul` 기본)
- DB 는 항상 UTC 저장. 비교는 회사 TZ 기준.
- DST 가능성 있는 회사 (글로벌 확장 시) → 추가 검증 필요

### 3.3 위치

- GPS 정확도가 낮은 환경 (지하, 빌딩 안쪽) 다발 → "수동 출근 신청" 플로우 모니터링
- 오프라인 출근: 클라이언트 로컬 큐 → 온라인 복귀 시 동기화. 24h 이내만 인정.

### 3.4 자동 출퇴근 / 자동 초과근무

- Celery Beat 가 정시 트리거. **Beat 가 죽으면 자동 처리 누락** → Beat 단일 인스턴스 죽음 알림 즉시 (Sentry / CloudWatch Alarm).
- 자동 처리 결과는 사용자에게 항상 알림. 임의 처리 금지.

---

## 4. 연차 도메인 — 운영 관점 위험 포인트

### 4.1 자동 부여 / 소멸 배치

- 매일 자정에 실행. **실패 시 사용자 영향 큼** (잔여 표시 오류, 소멸 처리 누락).
- 배치는 멱등하게 작성: 같은 입력에 같은 결과. 재실행 안전.
- 실패 시 자동 재시도 3회 (5분, 15분, 60분 간격). 그 후 운영 알림.

### 4.2 정책 변경

- `leave_policy` 는 버전 관리. **기존 부여 데이터에 소급 적용 금지** (사용자 신뢰 훼손).
- 정책 변경은 ADMIN/OWNER 권한, 변경 이유 입력 필수, 감사 로그 자동 기록.

### 4.3 잔여 계산 캐싱

- 잔여 = balance 트랜잭션 합산. 사용자가 신청할 때마다 계산 → Redis 5분 캐시.
- 신청 / 승인 / 부여 / 소멸 발생 시 캐시 무효화.

---

## 5. 알림 발송

### 5.1 큐 / 백오프

- Celery 큐 분리: `notification.high` (즉시), `notification.bulk` (배치)
- 푸시 실패 시 3회 재시도 (지수 백오프). 그 후 NotificationLog 에 `failed_at` 기록.
- DeviceToken 이 invalid 응답 (`UNREGISTERED`) 받으면 자동 비활성화.

### 5.2 이메일

- AWS SES. 평판 (bounce / complaint rate) 모니터링.
- 회사 도메인 SPF / DKIM / DMARC 설정 가이드 운영팀 보유.
- Bounce 임계 (5%) 초과 시 Slack 알림.

### 5.3 푸시 — 한도

- iOS / Android 모두 한 사용자당 빈도 제한 (스팸 방지). 동일 종류 알림 1시간 1회.

### 5.4 Provider 설정 (env-vars)

Provider 코드는 `apps/notification/providers/` 에 모드별로 분리되어 있다.
실제 발송은 `NOTIFICATION_PROVIDER_MODE=real` 로 토글한다.

| env-var | 기본값 | 설명 |
|---|---|---|
| `NOTIFICATION_PROVIDER_MODE` | `stub` | `stub` (테스트 / dev) ↔ `real` (stg / prod) |
| `EMAIL_PROVIDER` | `ses` | `ses` (boto3) ↔ `smtp` (Django `send_mail` fallback) |
| `EMAIL_FROM` | `no-reply@work-manager.molcube.com` | SES Source / SMTP From |
| `AWS_REGION` | `ap-northeast-2` | SES 리전 (boto3) |
| `FCM_SERVICE_ACCOUNT_JSON` | (빈 값) | 서비스 계정 JSON 파일 경로 또는 inline JSON 문자열 |
| `APNS_KEY_ID` / `APNS_TEAM_ID` / `APNS_BUNDLE_ID` / `APNS_KEY_PEM` | (빈 값) | APNs HTTP/2 직접 경로용 (선택). 비어 있으면 iOS 토큰도 FCM 으로 라우트 |
| `APNS_USE_SANDBOX` | `True` | APNs sandbox 게이트웨이 사용 여부 |

#### Provider 스위치 (stub ↔ real)

- `stub`: `apps/notification/providers/{email,push,inapp}.py` — 네트워크 호출 없음.
  outbox / 큐 / 재시도 로직을 격리 테스트하기 위한 기본 모드. **테스트는 항상 stub.**
- `real`: `apps/notification/providers/{real_email,real_push,inapp}.py` — SES + FCM.
  prod / stg 만 활성화. 실패는 두 가지 마커로 분류:
  - `terminal:` 접두사 → outbox 가 **즉시 DEAD** (재시도 안 함). SES `MessageRejected`,
    FCM 401/403, 잘못된 페이로드 (FCM 400) 등.
  - 그 외 → outbox 가 백오프 후 재시도 (SES `Throttling`, FCM 5xx, 네트워크 오류).
- iOS 토큰은 `APNS_KEY_PEM` 이 비어 있으면 (기본) FCM 의 iOS 앱 설정을 통해 APNs 로
  fan-out. 직접 APNs 가 필요할 때만 `APNS_*` 와 `httpx[http2]` 를 추가하고
  `apps/notification/providers/real_push.py` 를 확장한다.
- DeviceToken `UNREGISTERED` (FCM 404) 시 해당 행 자동 삭제 (§5.1 참조).

토글은 deploy 단계 환경변수만으로 완결된다. 코드 변경 없음. 시크릿 로테이션은 §8.1.

---

## 6. 데이터베이스 운영

### 6.1 모니터링

- CloudWatch + RDS Performance Insights
- 알림 임계:
  - CPU > 70% (5분 지속) → 경고
  - CPU > 85% (5분 지속) → 페이지
  - Replication lag > 30s → 경고
  - Free storage < 20% → 경고

### 6.2 마이그레이션

- 큰 테이블 ALTER 시 `pg_repack` 또는 단계적 마이그레이션 사용
- 인덱스 추가는 `CONCURRENTLY`
- 운영 시간 외 (자정 ~ 새벽 5시) 권장

### 6.3 백업 복원 리허설

- 월 1회 stg 환경에 prod 백업 복원 → 헬스체크 → 결과 기록
- 분기 1회 모의 장애 (DB primary 강제 failover)

---

## 7. 캐시 (Redis)

- 키 네임스페이스: `wm:<env>:<domain>:<key>` (예: `wm:prod:leave:balance:<membership_id>`)
- TTL 명시 필수. 무한 TTL 키 금지.
- 메모리 80% 초과 → 알림. eviction policy: `allkeys-lru`.

---

## 8. 보안 운영

### 8.1 시크릿

- 로테이션:
  - JWT signing key: 6개월 (양키 롤링 — 새 키 발행 후 1주 동시 검증)
  - DB 패스워드: 1년
  - OAuth client secret: 1년
  - 외부 API 키 (FCM, APNs, SES): 6개월
- 노출 사고 시 즉시 로테이션 + 영향 분석.

### 8.2 권한

- AWS IAM: least privilege 원칙. 운영자 콘솔 직접 접근은 MFA 필수.
- prod DB 직접 SQL 실행은 2명 이상 승인. SELECT 만 허용 (운영 SOP).

### 8.3 취약점 관리

- `pip-audit` / `npm audit` / `flutter pub audit` 매주 실행 (CI)
- Critical CVE 공지 시 24시간 이내 패치 검토.
- 의존성 업그레이드는 분기별 정기 + 수시 보안 패치.

### 8.4 PII 보호

- 개인정보 (이름, 이메일, 전화, 위치) 는 로그에 남기지 않는다 (구조화 로그 schema 에서 자동 마스킹).
- 데이터 export 시 다운로드한 사람 / 시각 / IP 기록 (audit_log).
- 회사 계약 종료 시 30일 후 익명화. 90일 후 물리 삭제.

---

## 9. 모니터링 / 알림

### 9.1 SLI / SLO

| 지표 | 목표 | 비고 |
|---|---|---|
| API 가용성 | 99.9% / 월 | 다운타임 ≤ 43분 |
| API P95 레이턴시 | ≤ 300ms | 핵심 엔드포인트 |
| API P99 레이턴시 | ≤ 800ms | |
| 출퇴근 성공률 | ≥ 99.95% | 5xx + 의도하지 않은 4xx |
| WS 연결 성공률 | ≥ 99.5% | |

### 9.2 알림 채널

- Slack `#ops-alerts`: 모든 경고
- PagerDuty: 페이지 등급 (즉시 대응) — SLO 위반, DB 다운, 인증 시스템 장애
- 이메일: 일일 운영 요약

### 9.3 대시보드

- Grafana (또는 CloudWatch Dashboard)
  - API 트래픽 / 에러율 / 레이턴시 (엔드포인트별)
  - DB CPU / 커넥션 / lock waits
  - Redis 메모리 / hit rate
  - Celery 큐 길이 / 처리량 / 실패율
  - 비즈니스 지표: 일일 출근 수, 신청 수, 승인 처리 시간

---

## 10. 장애 대응

[`runbook.md`](runbook.md) 에 시나리오별 절차 보관.

기본 원칙:
1. **확인** — 알림 → 대시보드 / 로그 확인
2. **공지** — Slack `#incidents` 에 영향 범위 공유
3. **완화** — 우선 사용자 영향 최소화 (롤백 / 우회 / 캐시)
4. **근본 원인 조사** — 완화 후
5. **사후 보고서** — 24시간 내 (5 Whys, 재발 방지)

---

## 11. 출시 체크리스트 (Pre-launch)

### 11.1 v1.0 MVP 출시 전
- [ ] 부하 테스트 (목표 DAU × 3 트래픽)
- [ ] 카오스 테스트 (DB failover, Redis down, Celery down)
- [ ] 보안 점검 (OWASP Top 10, 의존성 audit)
- [ ] 개인정보처리방침 / 이용약관 / 통신판매업 신고 (해당 시)
- [ ] 한국 개인정보보호법 / GDPR 검토
- [ ] App Store / Play Store 심사 통과
- [ ] Apple Notarization (Mac Electron)
- [ ] Windows code signing
- [ ] 모니터링 대시보드 / 알림 룰 모두 활성
- [ ] 온콜 로테이션 확정
- [ ] 사용자 매뉴얼 / 도움말 / FAQ 작성
- [ ] 백업 / 복원 리허설 완료

---

## 12. 운영 SOP 색인

| SOP | 문서 |
|---|---|
| 신규 회사 온보딩 | (작성 예정) |
| 사용자 데이터 export 요청 처리 | (작성 예정) |
| 사용자 데이터 삭제 요청 처리 (GDPR / 개인정보보호법) | (작성 예정) |
| 비밀번호 강제 리셋 (대규모 사고 시) | (작성 예정) |
| 이메일 도메인 평판 회복 | (작성 예정) |
| App Store / Play Store 긴급 업데이트 | (작성 예정) |
