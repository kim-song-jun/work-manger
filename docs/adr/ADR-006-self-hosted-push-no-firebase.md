# ADR-006 · 자체 호스팅 푸시 스택 (Firebase 의존성 제거)

- **Status**: Accepted
- **Date**: 2026-05-04
- **Authors**: @tech-lead, @backend-lead, @mobile-lead

## Context

[ADR-002](./ADR-002-flutter-webview-mobile.md) 가 Flutter WebView 셸을
확정했을 때, 푸시 전송은 자연스럽게 Firebase Cloud Messaging (FCM) +
Apple Push Notification service (APNs) 라우팅 (FCM 의 iOS fan-out) 으로
시작했다. 이는 빠른 MVP 출시에 적합했지만, 운영을 시작하면서 다음이 누적
되었다.

1. **Google 의존성**. 우리 서비스는 한국 기업 고객 대상이며, 일부 보안
   리뷰에서 "외부 SaaS 푸시 게이트웨이가 사용자 메시지 메타데이터를
   처리한다" 가 빨간 깃발로 잡힌다. FCM 프로젝트 ID, 토큰, 메시지 본문
   (개인 정보 포함 가능) 이 Google Cloud 를 거친다.
2. **블랙박스 라우팅**. FCM 이 iOS 로 fan-out 할 때 우리는 APNs 응답을
   직접 보지 못한다. 디바이스 토큰이 죽었는지 (BadDeviceToken), 메시지가
   throttle 됐는지 ops 가 알 수 없다.
3. **개발 마찰**. `google-services.json`, `GoogleService-Info.plist`,
   `firebase_options.dart` 세 파일을 환경별 (dev/stg/prod) 로 시크릿
   매니저에 보관하고 CI 단계에서 주입해야 한다. flutter 플러그인 업그레이드
   시 양 OS 회귀 테스트.
4. **장기 비용 / 정책 리스크**. FCM 은 현재 무료지만 Google 의 무료
   tier 정책 변경 이력 (Maps, reCAPTCHA, Firebase Dynamic Links 종료) 을
   고려하면 단일 벤더 lock-in 자체가 위험.

요구사항 (재확인):

- iOS, Android, Web (브라우저), Electron 데스크톱 모두에 푸시.
- 한 명의 사용자가 여러 디바이스를 등록할 수 있고, 한 채널이 실패해도
  다른 채널로 전달 (best-effort fan-out).
- ops 가 실패 원인을 채널별로 분류 가능 (terminal vs transient).
- 자체 호스팅 비용은 docker compose 에 포함 가능한 수준.

## Decision

**Firebase / FCM 의존성을 완전히 제거하고, 채널별로 표준 / 자체 호스팅
프로토콜에 직접 연결한다.**

| 채널 | 프로토콜 | 인프라 | 라이브러리 |
|---|---|---|---|
| 브라우저 + Electron renderer + Flutter WebView 포그라운드 | **Web Push (VAPID, RFC 8030)** | 브라우저 push service (mozilla autopush, Apple push, Chrome push) — 우리는 표준 HTTP 로 publish | `pywebpush` (BE), 표준 ServiceWorker (FE) |
| iOS 네이티브 | **APNs HTTP/2 직접** | Apple gateway | `httpx[http2]` + ES256 JWT (PyJWT) |
| Android 네이티브 | **ntfy** (https://ntfy.sh) | docker compose 내부 `ntfy` 서비스 | 표준 stdlib `urllib` (BE publish), `web_socket_channel` (Flutter 구독) |
| 이메일 | AWS SES | (변경 없음) | `boto3` |

라우팅 책임:

- `apps/notification/providers/__init__.py` 의 router 가 채널 + DeviceToken
  platform 매트릭스를 한 함수 (`_real_push_fanout`) 에서 처리.
- 한 멤버가 WEB + IOS + ANDROID 토큰을 모두 갖고 있으면 세 모듈에 모두
  publish; 한 채널만 성공해도 outbox 는 SENT 로 마크.
- `ProviderResult.details` 에 per-platform 결과를 적재 (`successes`,
  `failures` dict) → ops 가 grafana / log 에서 단일 채널 fail 추적.

압축한 구체 결정:

- **Web Push**: VAPID 키쌍은 환경별 1개 (`manage.py generate_vapid_keys`).
  공개 키는 FE 빌드 env (`VITE_VAPID_PUBLIC_KEY`) + BE endpoint
  (`GET /v1/notifications/vapid-public-key`) 양쪽에서 노출. `DeviceToken.token`
  컬럼에 W3C `PushSubscription` JSON 을 그대로 저장.
- **APNs direct**: `.p8` 키를 시크릿으로 보관. JWT 캐시 50 분 (Apple 의
  60 분 한도 안전 마진). HTTP/2 가 멀티플렉스 지원하지만 단순화를 위해
  send 마다 `httpx.Client(http2=True)` 새로 생성 — 멤버당 한 번만 호출되어
  부하가 크지 않다 (필요 시 client pool 도입은 follow-up).
- **ntfy**: `binwiederhier/ntfy:v2.10.0` 이미지를 compose 내부 네트워크에
  띄우고 nginx 가 `/v1/ntfy/` 로 프록시. ACL `deny-all` 기본; BE publisher
  사용자에게만 `wm-prod-*` write, 모두에게 read 부여. 토픽 = `{prefix}-
  membership-{id}` (예측 가능 → 안드로이드 클라이언트가 onboarding 직후
  바로 구독). Foreground service (`NtfyForegroundService.kt`) 가 WebSocket
  을 Doze 너머로 유지.

## Alternatives Considered

### 1) FCM 유지 (status quo)

- **장점**: 변경 0. 푸시 전송 안정성 검증됨.
- **단점**: 위 Context 의 4 가지 문제. 특히 한국 기업 시장 진입 장벽.
- **결론**: 단기 안정성 < 장기 의존성 / 보안 / 가시성 비용.

### 2) AWS SNS (FCM 의 셀프 호스팅 유사 wrapper)

- **장점**: AWS 계정 1개로 정리. SNS endpoint 가 platform 추상화.
- **단점**: 결국 SNS 도 FCM / APNs 를 호출 (wrapper). 중간 레이어가 늘어
  실패 분류만 어려워짐. 비용 발생 (메시지당).
- **결론**: 추상화의 이점이 우리 규모에서 비용 / 복잡도를 정당화하지 못함.

### 3) 모든 OS 에 ntfy 통일

- **장점**: 단일 프로토콜.
- **단점**: iOS 는 백그라운드 WebSocket 을 사실상 못 함 (Apple OS 정책).
  iOS 에 ntfy 를 쓰려면 별도 push 게이트웨이 (ntfy 프로젝트의 iOS 앱이
  사용하는) 가 필요한데 그게 다시 외부 서비스 의존성이라 ADR 의 목적에
  반함.
- **결론**: iOS 는 APNs 직결이 유일하게 깔끔.

### 4) Mercure / Apache Pulsar 기반 자체 push

- **장점**: 프로토콜 통일.
- **단점**: 모바일 클라이언트 라이브러리 미성숙. 우리는 OS native push
  (lock screen, badges) 가 필요한데 Mercure/Pulsar 는 본질적으로
  서버-to-서버 실시간 메시지.
- **결론**: 사용 범위 mismatch.

## Consequences

### 긍정적

- **Google 의존성 0**. 보안 리뷰 / 컴플라이언스 통과 용이.
- **채널별 가시성**. APNs 응답 코드 (BadDeviceToken, DeviceTokenNotForTopic)
  를 직접 보고 ops 가 정확한 사용자 행동 (디바이스 교체, 앱 삭제) 을
  추론 가능.
- **단일 벤더 lock-in 제거**. ntfy 는 OSS (Apache 2.0), VAPID/APNs 는 표준.
- **동일 셸이 Web/Electron/WebView 포그라운드까지 커버**. WebView 의
  Service Worker 가 외부 푸시를 받지 못해도 Android native ntfy +
  Flutter local_notifications 으로 보완.
- **테스트 격리 향상**. 각 provider 모듈이 독립적이라 unit test 가
  monkeypatch 1 단계로 끝남. 기존 FCM 테스트의 `google.auth` mock 이
  사라짐.

### 부정적

- **배터리 영향 (Android)**. Foreground service 가 항상 실행되어 배터리
  소모가 미세하게 증가. 완화: `IMPORTANCE_LOW` 채널 + ongoing notification
  + 사용자에게 "실시간 알림 연결 중" 명시. Doze whitelist 요구하지 않음.
- **FCM 신뢰성 vs 자체 호스팅 ntfy**. FCM 은 Google 인프라의 가용성을
  활용. ntfy 컨테이너 다운 시 Android 푸시 끊김 → 단일 컨테이너이므로
  HA 구성 (replica + LB) 은 follow-up.
- **App Store 심사 리스크**. iOS 는 APNs direct 가 표준 경로이므로 무영향.
  Android 는 Foreground service 가 Play Store 의 "Background restrictions"
  정책에 걸릴 수 있음 → Manifest 의 `foregroundServiceType="dataSync"` +
  공개 가능한 정책 페이지로 정당화 필요. 대안: WorkManager 주기 polling
  (지연 ↑) 으로 fallback 가능하지만 즉시성 손해.
- **운영 부담 +**. VAPID 키 회전, ntfy 사용자 관리, APNs `.p8` 회전 SOP
  를 ops 가 학습. 6 개월 회전 주기 [§8.1](../operations/operations-guide.md#81-시크릿).
- **WebView 포그라운드 지연**. 기존 FCM 은 SDK 가 푸시를 OS 알림으로 즉시
  surface 했지만, 새 구조는 ntfy WebSocket → Dart → flutter_local_notifications
  의 3 단계 → 평균 100~300ms 추가. 사용자 인지 임계 미만.

### 후속 결정 / 작업

- **ntfy HA**: 트래픽이 임계 (DAU 5k+) 를 넘으면 ntfy 컨테이너 2 개 +
  postgres backend (현재는 SQLite) 로 마이그레이션. ADR-007 후보.
- **Web Push 압축**: pywebpush 가 이미 aes128gcm 사용. 추가 작업 없음.
- **iOS Live Activities / Critical Alerts**: APNs direct 는 두 기능을
  모두 지원 (별도 entitlement + payload 차이만). 필요 시 `real_push.py`
  의 `apns-push-type` 헤더만 분기.
- **이메일 vs 푸시 연동**: 사용자가 푸시 모든 채널 실패해도 critical
  알림은 이메일로 fallback (이미 channel-별 outbox 라 자연스럽게 동작).
- **ADR-002 cross-reference**: Flutter 셸 ADR 의 후속 결정 섹션이 FCM
  구체 구조를 언급하므로 본 ADR 로 링크 (이미 추가).
- **GDPR / 개인 정보**: 푸시 본문에 PII 가 들어가면 자체 인프라가 처리
  하므로 외부 위탁 신고 의무 사라짐. 다만 Apple/브라우저 push gateway
  는 여전히 통과 → 페이로드를 최소화 (제목 + 짧은 본문) 하고 상세는
  앱 내에서 fetch 하는 패턴 권장.

이 ADR 로 Firebase 마이그레이션은 일회성 작업이며, 이후 신규 채널 추가
(예: 데스크톱 native bridge 푸시) 도 같은 router 분기에 한 줄 추가로 끝나는
구조가 유지된다.
