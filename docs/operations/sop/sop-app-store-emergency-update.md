# SOP · App Store / Play Store 긴급 업데이트

- **Owner**: Mobile Lead / Release Manager
- **Last Reviewed**: 2026-05-04
- **참고**: [`architecture.md`](../../architecture/architecture.md) §5.3, [ADR-002](../../adr/ADR-002-flutter-webview-mobile.md)

## Purpose

모바일 앱(Flutter WebView 셸 — `apps/mobile/`) 의 critical 버그 / 보안 취약점 / WebView 진입 자체 불가 상태를 긴급히 수정해야 할 때, **TestFlight / Play Internal Testing 의 빠른 배포 채널 + 양 스토어의 expedited review** 를 활용해 최단 시간(목표 24~72시간) 내 사용자에게 도달하는 절차.

## Scope

- **포함**: iOS App Store + Google Play Store 양쪽 긴급 업데이트
- **제외**: WebView 안의 SPA 변경(=웹 배포 — 정기 화·목 또는 핫픽스 배포). SPA 변경은 스토어 심사 불필요(ADR-001).

## 발동 조건 (Trigger)

다음 중 하나 이상:

1. **WebView 자체가 안 뜸**: SPA URL 로딩 실패, 셸 크래시 다발, 첫 화면 white screen
2. **네이티브 권한 결함**: 위치 / 푸시 / 햅틱 브리지(`apps/mobile/lib/bridge/native_bridge.dart`) 가 모든 사용자에게 안 됨
3. **Firebase 키 / 인증서 회수**: APNs / FCM 인증서 즉시 교체 필요 (앱 업데이트 동반)
4. **법적 / 컴플라이언스 강제**: 스토어 정책 위반 노티스 (Apple / Google), 개인정보 정책 추가 동의 필요
5. **보안 취약점**: 셸 자체에 RCE / data leak 가능 (SPA 가 아니라 셸 코드)

## 의사결정 권한

- 발동: Mobile Lead + Tech Lead 양자
- expedited review 신청: Release Manager
- 양 스토어 자동 출시 게이트 통과 결정: Release Manager + Mobile Lead

## Steps

### 1. 인시던트 선언 + 영향 범위 확정

- PagerDuty 인시던트 → IC 지정
- Slack `#incidents` + `#mobile-release` 공지
- 영향 OS / 버전 범위:
  - iOS 어떤 버전 (`apps/mobile/ios/Runner/Info.plist` 의 minimum version 이상) 영향
  - Android 어떤 API level 이상 영향
- 사용자 수 추정: Firebase Analytics / Sentry 의 affected users metric

### 2. 핫픽스 코드 작성 + 회귀 테스트

- 브랜치: `hotfix/mobile-<short-desc>` (main 에서 분기)
- 변경은 **셸 코드 최소화** — 가능하면 브리지 1개 함수만 수정
- 단위 테스트 + 수동 시나리오 테스트:
  - iPhone (가장 흔한 모델 1종) 실기 + iOS Simulator
  - Android (가장 흔한 OS 버전 1종) 실기 + Android Emulator
  - 위치 / 푸시 / 햅틱 / WebView 로딩 / 자동 클락인 시나리오
- 코드 리뷰 — 평소 1명 → 긴급 시 2명 (Mobile Lead 필수)

### 3. 버전 번호 bump + 빌드

`apps/mobile/pubspec.yaml` 의 `version: 1.x.y+N` 에서:

- patch 만 bump (`1.0.3 → 1.0.4`)
- build number (`+N`) 는 **항상 증가** (Apple / Google 모두 거부 정책)

빌드:

```bash
# Android (AAB)
cd apps/mobile
flutter build appbundle --release \
  --dart-define=WEBVIEW_URL=https://app.work-manager.molcube.com

# iOS (IPA — Mac 필요)
flutter build ipa --release \
  --dart-define=WEBVIEW_URL=https://app.work-manager.molcube.com \
  --export-method app-store
```

산출물:

- `build/app/outputs/bundle/release/app-release.aab`
- `build/ios/ipa/Runner.ipa`

CI 빌드(GitHub Actions) 가 가능하면 우선 사용. 실기 빌드는 backup.

### 4. TestFlight (iOS) — 내부 검증

1. Xcode → `Product → Archive` 또는 `xcrun altool --upload-app -f Runner.ipa` 으로 App Store Connect 업로드
2. 처리 완료까지 ~10분 (Apple 의 binary processing)
3. TestFlight → Internal Testing 그룹에 즉시 배포 (심사 불요)
4. 내부 검증자(개발자 + Mobile Lead + QA) 가 실기 테스트 — 문제 없으면 다음
5. 외부 베타 그룹은 긴급 시 skip

### 5. Play Internal Testing (Android) — 내부 검증

1. Google Play Console → Internal Testing track → "Create release" → AAB 업로드
2. release notes 입력 (한국어 / 영어)
3. "Save → Review → Roll out to Internal testing" — 즉시 배포 (심사 불요)
4. 내부 테스터 그룹(Google Group) 의 실기 검증
5. 문제 없으면 다음

### 6. 양 스토어 프로덕션 제출

#### iOS — App Store

1. App Store Connect → "+ Version or Platform" → 새 버전 생성
2. TestFlight build 선택 → 사용자에게 노출할 build 지정
3. **Expedited Review 요청** — Resolution Center → "Contact Us" → "App Review" → "Request Expedited Review"
   - 사유: critical bug / security / store policy compliance
   - 정확한 영향 사용자 수 + 비즈니스 영향 명시
   - Apple 평균 응답: 6~24시간 (승인 시 1~12시간 내 심사)
4. 심사 통과 시 자동 출시 OR 수동 출시 선택. 긴급 시 자동.

#### Android — Google Play

1. Production track → "Create release" → Internal testing build promote
2. **Staged rollout**: 5% → 모니터링 → 50% → 100%
   - 단, 정말 긴급한 보안 패치는 100% 즉시
3. Play Store 는 expedited review 가 명시적으로 없음 — 일반 심사가 빠른 편 (수~24시간)
4. 거절 시 → 사유 정정 후 재제출

### 7. 사용자 강제 업데이트 안내 (선택)

WebView 안에서 SPA 가 셸 버전을 감지(`window.NativeBridge.appInfo()`) 후 기준 미달이면 강제 업데이트 다이얼로그.

```typescript
// apps/web/src/shared/lib/native.ts 의 appInfo 활용
const info = await appInfo();
if (info.platform !== 'WEB' && versionLessThan(info.version, MIN_REQUIRED_VERSION)) {
  showForceUpdateDialog();
}
```

`MIN_REQUIRED_VERSION` 은 SPA 의 환경변수 / remote config — 핫픽스와 함께 웹 배포로 갱신.

### 8. 모니터링 + 사후

- Firebase Crashlytics + Sentry 의 새 버전 crash rate 추적
- 24시간 내 사용자 업데이트율 (Play Console / App Store Connect)
- 24시간 내 사후 보고서: 발견 → 수정 → 제출 → 출시 timeline

## Success Criteria

- [ ] 발동 후 24시간 내 양 스토어 빌드 제출
- [ ] 72시간 내 양 스토어 프로덕션 출시 (iOS expedited / Android staged)
- [ ] 새 버전 crash rate < 0.5% 유지
- [ ] 7일 내 활성 사용자의 80% 가 새 버전 사용
- [ ] 사후 보고서 작성

## Rollback

iOS — 한 번 출시한 버전은 App Store 에서 내릴 수 없음. 다음 버전(역시 hotfix) 으로만 수정 가능. **그래서 핫픽스 회귀 테스트가 critical**.

Android — Play Console 에서 "Release halt" 가능 (staged rollout 단계라면). 이미 100% 출시된 버전은 직접 내릴 수 없으나, 이전 버전을 다시 release 로 push 하는 변칙(downgrade) 가능 (사용자가 이미 받은 새 버전을 자동 downgrade 하지는 않음).

권장: rollback 보다 forward fix — 다음 핫픽스 buildN+1 즉시 준비.

## Edge Cases

- **iOS expedited review 거절**: Apple 이 사유 부족이라고 판단. 사유 보강 후 재신청 + Apple Developer Relations 직접 컨택.
- **Android Play Store policy violation**: 정책 위반(권한 misuse 등) 으로 distribution suspended. 즉시 정책 검토 + 정정 PR + 재심사 (시간 소요 큼). 동시에 사용자에게 안내.
- **Firebase 인증서 / 키 회수와 동시**: 모바일 앱 업데이트와 백엔드 키 교체를 동기화. 사용자가 새 앱 받기 전까지 푸시 안 감.
- **셸 크래시가 dart-define 환경변수 잘못 주입**: 빌드 인자 검증 — 프로덕션 빌드는 `WEBVIEW_URL=https://app.work-manager.molcube.com` 만 허용하는 스크립트 wrapper 사용 권장.
- **WebView URL 자체 변경 (도메인 이전 등)**: 셸 업데이트 + 웹 배포 + DNS 변경 모두 동기화 필요. 사전 계획된 release 로만 진행 — 긴급 SOP 사용처 아님.

## 도구 / 시스템

- App Store Connect, Google Play Console
- TestFlight, Play Internal Testing
- Xcode (iOS 업로드), Android Studio
- CI: GitHub Actions (`.github/workflows/mobile-release.yml` — 작성 예정)
- Crashlytics, Sentry
- electron-builder 는 데스크톱용 — 무관

## 메모

- 핫픽스가 잦으면 SPA 측 `MIN_REQUIRED_VERSION` 을 자주 갱신해 사용자가 강제로 새 버전 받도록 함. 단 사용자 경험 저하 — 진짜 critical 만.
- 양 스토어의 release notes 는 한국어 우선 + 영어 병기. "보안 개선" / "안정성 향상" 같은 모호한 표현이 무난.
- SOP 정기 검토 분기별 1회 — 양 스토어 정책이 자주 바뀜.
- 데스크톱(Electron) 긴급 업데이트는 `electron-updater` 의 즉시 푸시 — 별도 SOP 미작성(electron-builder.yml 의 `publish` provider 가 wired 되면 작성 예정).
