# 설치 파일 안내 (Install Guide)

> **버전**: 0.1.0 (pre-launch v1.0)
> **Last updated**: 2026-05-13
> **대상**: 베타 / 내부 검증 / 라이브 테스트 운영

본 문서는 Electron 데스크탑 + Android Flutter 모바일의 현재 설치 아티팩트 위치 + 설치 절차 + 코드사이닝 상태를 정리한다. macOS 는 사이닝 인증서 미확보 (B-OPS-02) — 별도 트랙.

---

## 1. Windows — Electron 데스크탑

### 1.1 파일

| 항목 | 경로 | 크기 | 빌드일 |
|---|---|---|---|
| 설치 파일 | `apps/desktop/release/Work Manager-Setup-0.1.0.exe` | 78.2 MB | 2026-05-08 |
| 업데이트 매니페스트 | `apps/desktop/release/latest.yml` | — | 동일 |
| 차분 패치 블록맵 | `apps/desktop/release/Work Manager-Setup-0.1.0.exe.blockmap` | 0.1 MB | 동일 |

### 1.2 설치 절차

1. `Work Manager-Setup-0.1.0.exe` 더블 클릭
2. **SmartScreen 경고**: 현재 EV 코드사이닝 인증서 미확보 (B-OPS-01) → "추가 정보" → "실행"
3. 설치 위치 선택 → 설치 완료
4. 시작 메뉴에서 "Work Manager" 실행
5. 자동: 로그인 화면 (`http://localhost:4444/login` 또는 prod URL — `WM_WEB_URL` env 우선) 표시

### 1.3 라이브 테스트 환경 변수

| Env | 기본값 | 용도 |
|---|---|---|
| `WM_WEB_URL` | `http://localhost:4444` | Electron 이 로딩할 SPA URL. prod 는 `https://app.work-manager.molcube.com` |
| `WM_DEBUG` | `0` | `1` 로 설정 시 DevTools 자동 부착 (memory `feedback_live_testing_session.md` §1) |
| `WM_UPDATE_BUCKET` | (빈 값) | dev/staging 은 빈 값으로 auto-update no-op. prod 는 `wm-updates-prod-...` |
| `WM_UPDATE_FEED_URL` | (빈 값) | 제너릭 매니페스트 URL (대안) |

### 1.4 CDP 검증 (라이브 테스트)

```cmd
cd apps\desktop
node_modules\electron\dist\electron.exe dist\main\index.js --remote-debugging-port=9222
```

PowerShell:
```powershell
(Invoke-WebRequest 'http://localhost:9222/json/list' -UseBasicParsing).Content | ConvertFrom-Json | Select title, url
```
예상 응답 — 윈도우 1개 (`근무 관리`, `http://localhost:4444/login` 또는 prod URL).

### 1.5 코드사이닝 상태
- **현재**: 미서명 → SmartScreen 경고 표시
- **출시 차단 항목**: B-OPS-01 (EV 인증서 발급 ~$300/year, DigiCert/Sectigo) — 발급 후 release.yml 의 `WM_WIN_SIGN_MODE=cloud` 또는 직접 `CSC_LINK`+`CSC_KEY_PASSWORD` 환경에서 빌드 시 자동 서명.

### 1.6 빌드 (개발자용)

```bash
# 호스트(Windows)에서 직접:
cd apps/desktop
npm ci
npm run build:win    # → release/Work Manager-Setup-X.Y.Z.exe

# Docker (Linux 빌드 대안 — Linux 산출):
make package-desktop  # → apps/desktop/release/linux-unpacked/
```

---

## 2. Android — Flutter

### 2.1 파일

| 항목 | 경로 | 크기 | 빌드일 |
|---|---|---|---|
| Debug APK | `apps/mobile/build/app/outputs/flutter-apk/app-debug.apk` | 75.4 MB | 2026-05-10 |
| SHA-1 | `apps/mobile/build/app/outputs/flutter-apk/app-debug.apk.sha1` | — | 동일 |

> 본 세션(2026-05-13) 의 신규 빌드는 Gradle 환경 이슈로 실패 — `apps/mobile/build/.../app-debug.apk` 는 2026-05-10 prelaunch smoke 시 산출본. 본 PR (#4) 의 변경은 모두 WebView SPA 측이므로 코드 영향 없음.

### 2.2 설치 절차 (Android 디바이스)

#### USB Debugging 경로

1. 안드로이드 디바이스 USB 연결 + **Settings → Developer options → USB debugging** 활성화
2. PC 에서 `adb devices` 로 디바이스 확인 (state: `device`)
3. 설치:
   ```cmd
   "C:\dev\android\platform-tools\adb.exe" install apps\mobile\build\app\outputs\flutter-apk\app-debug.apk
   ```
4. 앱 서랍에서 "Work Manager" 실행
5. 위치 권한 다이얼로그 → 허용 (geofence 동작 위해 "always" 권장)
6. 알림 권한 다이얼로그 → 허용 (ntfy)

#### 사이드로드 경로 (APK 파일을 디바이스에 직접 복사)

1. APK 를 디바이스로 전송 (USB / 메일 / 클라우드)
2. 디바이스 **Settings → Apps → Install unknown apps** → 사용 앱 허용
3. 파일 매니저에서 APK 탭 → 설치

### 2.3 라이브 테스트 시 환경 의존

- BE: `http://10.0.2.2:4455` (Android emulator → 호스트 PC) 또는 prod URL
- WS: 동일
- ntfy: `http://ntfy:80` (compose 내부) 또는 prod URL
- **현재 APK 는 `http://localhost:4455` 로 빌드되어 있어서 prod 테스트 시 재빌드 필요** — `--dart-define=API_URL=https://api.work-manager.molcube.com`

### 2.4 검증 시나리오 (실 기기 확보 시)

```bash
# 1) 실행 후 logcat 으로 native 로그 확인
adb logcat | grep -E "wm.geofence|ntfy|WorkManager|inAppWebView"

# 2) 위치 권한 다이얼로그 + 강남 오피스 geofence 진입
# (디바이스를 사무실 좌표 근처로 가서 자동 클락인 알림 발화 확인)

# 3) ntfy 푸시 — admin 인박스에서 신청 결정 → 실시간 알림 도착 확인
# (NtfyForegroundService logcat: "ntfy: subscribed to wm-prod-membership-...")

# 4) Glance widget — 홈 화면 길게 누르기 → 위젯 추가 → "Work Status" 선택
# (오늘 출근 / 이번주 근무시간 표시)
```

### 2.5 GAP-16 — Emulator 환경 회귀

- `wm_test` AVD (Android 14 Pixel) 가 cold boot 후 즉시 종료 → adb devices 에 emulator-5554 가 offline 잔재
- 우회: 실 기기 USB-debugging / Genymotion / BrowserStack
- 진단 명령: `emulator -avd wm_test -verbose` 부팅 로그 캡처 권장

### 2.6 빌드 (개발자용)

```bash
# 호스트 (JDK 17 + Flutter 3.24 필요):
cd apps/mobile
flutter pub get
flutter build apk --debug    # → build/app/outputs/flutter-apk/app-debug.apk
flutter build apk --release  # → build/app/outputs/flutter-apk/app-release.apk (서명 필요)

# Docker (대안 — Linux 환경):
make package-mobile  # cirruslabs/flutter:3.24.5 컨테이너
```

### 2.7 코드사이닝 (Release 빌드)

- Debug APK: 디버그 키 자동 서명 (개발용)
- Release APK: 별도 keystore 필요 (운영 차단 — B-OPS-03 dependency)
  - keystore 발급 + `apps/mobile/android/key.properties` 에 비공개 경로 + Play Console 업로드 키 등록

---

## 3. macOS — Electron

### 3.1 현재 상태

- **빌드 없음** — Mac signing host (M1/M2) + Apple Developer ID 미확보
- **출시 차단 항목**: B-OPS-02 (Apple Notarization), B-OPS-03 (App Store 등록)
- 빌드 가능 시점: Mac host 에서 `npm run build:mac` 실행 → `release/Work Manager-0.1.0.dmg`

### 3.2 절차 (Mac 확보 시)

```bash
cd apps/desktop

# 1) 환경 시크릿
export APPLE_ID="ops@molcube.com"
export APPLE_APP_SPECIFIC_PASSWORD="xxxx-yyyy-zzzz-wwww"
export APPLE_TEAM_ID="XXXXXXXXXX"
export MAC_CSC_LINK="path/to/DeveloperID.p12"
export CSC_KEY_PASSWORD="..."

# 2) 빌드 + notarize (scripts/notarize.cjs 후크)
npm ci
npm run build:mac    # release/Work Manager-0.1.0.dmg + .zip

# 3) 서명 검증
spctl -a -vvv "release/Work Manager-0.1.0.dmg"   # → accepted (Notarized)
codesign --verify --verbose=2 "release/mac/Work Manager.app"
```

### 3.3 사용자 설치 (Notarized 상태 가정)

1. DMG 더블 클릭 → "Work Manager" 아이콘을 Applications 폴더로 드래그
2. 첫 실행 시 Gatekeeper 통과 (Notarized → 경고 없음)
3. Tray (메뉴바) 에 Work Manager 아이콘 노출 + 자동 클락인 옵션

---

## 4. iOS — Flutter

### 4.1 현재 상태
- **빌드 없음** — Apple Developer Program 미가입 + Mac signing host 부재
- **출시 차단 항목**: B-CODE-02 (iOS native — WidgetKit 수동 Xcode 셋업), B-OPS-02, B-OPS-03

### 4.2 절차 (확보 시)
- TestFlight (외부 베타) 우선 → 외부 5인 이상 사인오프 → App Store Connect 제출
- WidgetKit 수동 설정: `apps/mobile/ios/WorkManagerWidget/README.md` 5단계 절차

---

## 5. 운영 SOP 후속

본 가이드는 단발 라이브 테스트 / 베타 배포용. 실제 GA 출시 절차 + 자동 업데이트 + 코드사이닝 토글은 다음 SOP 에 위임:
- [release SOP — 작성 필요 (B-OPS-09 follow-up)](sop/sop-release-ga.md)
- [코드사이닝 회전 SOP — 작성 필요](sop/sop-codesigning-rotation.md)
- 기존: [sop-app-store-emergency-update.md](sop/sop-app-store-emergency-update.md)

---

## 6. 빠른 체크리스트

| 항목 | 상태 |
|---|---|
| Windows Setup.exe (unsigned) | ✅ `apps/desktop/release/Work Manager-Setup-0.1.0.exe` (78MB) |
| Windows 코드사이닝 | ❌ B-OPS-01 인증서 |
| Android Debug APK (unsigned in app sense) | ✅ `apps/mobile/build/app/outputs/flutter-apk/app-debug.apk` (75MB) |
| Android Release keystore | ❌ B-OPS-03 |
| macOS DMG | ❌ B-OPS-02 (Apple Notarization) |
| iOS IPA | ❌ B-CODE-02 + B-OPS-02 + B-OPS-03 |
| Linux AppImage | ✅ `apps/desktop/release/linux-unpacked/` (2026-05-13 빌드) |
