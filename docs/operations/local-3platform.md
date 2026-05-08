# 로컬 3-플랫폼 검증 가이드 (Web / Desktop / Mobile)

> **대상**: 개발자, QA — 로컬(Windows/macOS/Linux) 에서 Web · Electron Desktop · Flutter Mobile 세 플랫폼을 모두 검증하는 절차.
> **전제**: `make up` 으로 풀스택이 기동된 상태 (`http://localhost:4444` / `http://localhost:4455`).

---

## 1. Web (React SPA)

```bash
# 풀스택 기동
make up

# 브라우저
open http://localhost:4444
```

### 1.1 BE 코드 변경 후 필수 절차

BE(`services/api/`) 를 변경했을 때 `wm-api` 컨테이너를 **반드시 재빌드** 해야 한다.
컨테이너를 단순 재시작하면 변경이 적용되지 않는다 (F-LIVE-004).

```bash
docker compose build api
docker compose up -d api
```

빌드 후 신규 라우트가 정상 응답하는지 확인:

```bash
# 인증이 필요한 라우트 → 401 이어야 함 (404 이면 빌드 미적용)
curl -s -o /dev/null -w "%{http_code}" http://localhost:4455/v1/admin/settings
# → 401

curl -s -o /dev/null -w "%{http_code}" http://localhost:4455/v1/admin/leave/expiring
# → 401

# health 엔드포인트
curl http://localhost:4455/v1/health
# → {"status": "ok"}
```

### 1.2 Vite HMR 신규 라우트 미반영 시

`App.tsx` 에 Route 가 추가된 경우 HMR 은 자동 인식하지 못한다. `wm-web` 컨테이너 재시작이 필요하다.

```bash
docker restart wm-web
```

Windows 마운트 환경에서 HMR 이 불안정한 경우 `vite.config.ts` `server.watch.usePolling: true` 옵션을 검토한다.

---

## 2. Desktop (Electron)

```bash
# 빌드
npm run build --workspace=apps/desktop

# dev 기동 (풀스택 up 상태에서)
npm run dev --workspace=apps/desktop
```

트레이 아이콘이 시스템 트레이에 나타나면 정상. 자동 출근 (`auto-clock-in`) 동작은 `apps/desktop/src/main/tray.ts` 참조.

---

## 3. Mobile (Flutter WebView)

### 3.1 실 단말 (권장)

```bash
# USB 연결 후
flutter devices
flutter run -d <device_id>
```

### 3.2 macOS / Linux — 기본 에뮬레이터

```bash
flutter emulators --launch <emulator_id>
flutter run
```

### 3.3 Windows — docker-android (WSA EOL 대안)

> **배경**: Windows Subsystem for Android (WSA) 는 **2025-03-05 부로 EOL** 됐다.
> Windows 에서 Android 앱을 로컬 실행하려면 `budtmo/docker-android` 를 사용한다.
> 단, Windows Docker Desktop 은 `/dev/kvm` 하드웨어 가속이 없으므로 에뮬레이션 성능이
> 느리다. 가능하면 **실 단말 USB** 연결 또는 **Genymotion Desktop** 을 권장한다.

#### 3.3.1 docker-android 컨테이너 기동

```bash
docker run -d \
  --name wm-android \
  --network wm-net \
  -p 6080:6080 \
  -p 15554:5554 \
  -p 15555:5555 \
  -e EMULATOR_DEVICE="Samsung Galaxy S10" \
  -e WEB_VNC=true \
  budtmo/docker-android:emulator_11.0
```

- `--network wm-net`: 로컬 풀스택 (wm-api, wm-web) 과 동일 네트워크. API 호출 시 `http://wm-api:4455` 로 직접 통신.
- 포트 `6080`: noVNC 웹 VNC 뷰어.
- 포트 `15554`/`15555`: ADB 에뮬레이터 포트 (호스트 매핑).

#### 3.3.2 noVNC 접속

브라우저에서 `http://localhost:6080` 접속 → Android 에뮬레이터 화면 확인.

#### 3.3.3 ADB 연결

```bash
# 에뮬레이터가 준비될 때까지 대기 (~2분)
adb connect 127.0.0.1:15555

# 연결 확인
adb devices
# 127.0.0.1:15555   device  ← 이 줄이 있어야 함
```

또는 컨테이너 내부 IP 로 연결:

```bash
ANDROID_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' wm-android)
adb connect "$ANDROID_IP:5555"
```

#### 3.3.4 Flutter APK 빌드 및 설치

```bash
# debug APK 빌드
cd apps/mobile
flutter build apk --debug

# ADB 설치
adb install build/app/outputs/flutter-apk/app-debug.apk

# 앱 실행
adb shell am start -n com.molcube.workmanager/.MainActivity
```

#### 3.3.5 로그 확인

```bash
adb logcat -s flutter
```

#### 3.3.6 컨테이너 정리

```bash
docker stop wm-android && docker rm wm-android
```

---

### 3.4 대안 — Genymotion Desktop

- [https://www.genymotion.com/product-desktop/](https://www.genymotion.com/product-desktop/) (개인 무료 / 상업 유료)
- `/dev/kvm` 하드웨어 가속 지원 → docker-android 보다 성능 우수.
- ADB 연결은 동일: `adb connect <genymotion_ip>:5555`.

---

## 4. 플랫폼 간 API 주소 설정

| 플랫폼 | API BaseURL |
|---|---|
| Web (브라우저, localhost) | `http://localhost:4455` |
| Desktop (Electron, localhost) | `http://localhost:4455` |
| Mobile (실 단말, ADB) | `http://<호스트_IP>:4455` (Wi-Fi 연결 필요) |
| Mobile (docker-android `wm-net`) | `http://wm-api:4455` |

실 단말 연결 시 호스트 IP 확인:

```bash
# macOS/Linux
ipconfig getifaddr en0    # macOS
ip route get 1 | awk '{print $7}' | head -1  # Linux

# Windows
ipconfig | findstr IPv4
```

---

## 5. 빠른 헬스 체크 스크립트

```bash
# 풀스택 서비스 헬스 확인
curl http://localhost:4455/v1/health          # api
curl -s -o /dev/null -w "%{http_code}" http://localhost:4444  # web → 200

# 인증 필요 라우트 smoke (401 = route OK, 404 = BE rebuild 필요)
for ROUTE in \
  "/v1/admin/settings" \
  "/v1/admin/leave/expiring" \
  "/v1/admin/approvals/bulk" \
  "/v1/admin/employees" \
  "/v1/admin/dashboard"; do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:4455$ROUTE")
  echo "$CODE  $ROUTE"
done
```

기대 결과: 모든 라인이 `401` (인증 필요). `404` 가 있으면 `docker compose build api && docker compose up -d api` 를 실행한다.

---

## 6. Installable artifacts — 로컬 설치 가능한 빌드

> **대상**: 사용자/QA — dev mode 가 아닌 **installer 형태** 로 설치하여 테스트하는 절차.
> dev mode 는 위 §1-3 참조. 이 섹션은 배포 직전 상태의 로컬 설치를 위함.

### 6.1 Web (정적 파일)

```bash
# 빌드 (apps/web/dist/ 에 정적 자산 생성)
cd apps/web
npm install
npm run build

# 로컬 정적 서버 — Python 내장
cd dist
python -m http.server 4444
# → http://localhost:4444 접속
```

또는 docker `web` 컨테이너 (`make up` 의 wm-web) 가 이미 vite preview / dev server 로 서빙 중이면 그대로 사용.

**주의**: 빌드된 정적 파일은 환경변수 (`VITE_API_URL` 등) 를 빌드 시점에 인라인하므로,
다른 API 주소로 배포할 거면 환경변수 설정 후 재빌드 필요.

### 6.2 Desktop — Windows Setup.exe (NSIS, unsigned)

코드 사이닝이 없는 로컬 테스트용 unsigned 빌드:

```bash
cd apps/desktop
npm install   # 첫 1회만
npm run build:win -- --config electron-builder.unsigned.yml
# → apps/desktop/release/Work Manager-Setup-0.1.0.exe (~79MB)
```

`electron-builder.unsigned.yml` 은 `signtoolOptions: null` 로 sign 단계를 비활성화한 로컬 전용 config.
정식 배포 (Setup.exe 코드사이닝) 는 `electron-builder.yml` + EV 인증서 + `WM_WIN_SIGN_MODE=cloud` 사용.

**설치**:
1. `Work Manager-Setup-0.1.0.exe` 더블클릭
2. Windows SmartScreen 경고 → "추가 정보" → "실행" (unsigned 이라 발생하는 정상 경고)
3. 설치 경로 선택 → 완료
4. 시작 메뉴에서 "Work Manager" 실행

**제거**:
- 제어판 → 프로그램 추가/제거 → "Work Manager" 제거
- 또는 `apps/desktop/release/__uninstaller-nsis-@work-managerdesktop.exe` 직접 실행

### 6.3 Desktop — macOS / Linux

| 플랫폼 | 명령 | 산출 |
|---|---|---|
| macOS (signed + notarized) | `npm run build:mac` | `release/Work Manager-{ver}-{arm64,x64}.dmg` |
| macOS (local unsigned) | `WM_WIN_SIGN_MODE=skip npm run build:mac -- --config electron-builder.unsigned.yml` | `.dmg` (Gatekeeper 경고) |
| Linux | `npm run build:linux` | `release/Work Manager-{ver}.AppImage` |

### 6.4 Mobile — Android APK (debug)

```bash
# Docker 빌드 (호스트에 Android SDK 불필요)
make package-mobile
# → apps/mobile/build/app/outputs/flutter-apk/app-debug.apk (~196MB)
```

또는 호스트에 Flutter 가 설치된 경우:

```bash
cd apps/mobile
flutter pub get
flutter build apk --debug
```

**설치 — 실 단말 (USB)**:

```bash
# 단말 USB 연결 + 개발자 모드 + USB 디버깅 활성화
adb devices                                                # 단말 인식 확인
adb install apps/mobile/build/app/outputs/flutter-apk/app-debug.apk
adb shell am start -n com.molcube.workmanager/.MainActivity
```

**설치 — docker-android 에뮬레이터 (Windows 권장)**:
- 위 §3.3 docker-android 절차 (port 15555 ADB) → APK 설치 단계만 실행.

**API 연결**: 실 단말은 호스트 IP (`ipconfig | findstr IPv4` → `192.168.x.x`) 사용. 단말이
`http://192.168.x.x:4455` 도달 가능해야 함 (Wi-Fi 같은 네트워크).

### 6.5 Release APK / Play Store 빌드

debug APK 는 `assembleDebug` 로 코드 사이닝 키 없이 빌드된다. release 는 별도 절차:

```bash
# Play Store / 외부 배포용 — 코드 사이닝 키 필요
cd apps/mobile
flutter build apk --release   # apps/mobile/android/app/build.gradle 의 signingConfigs 필요
flutter build appbundle       # AAB (Play Store 권장)
```

`apps/mobile/android/key.properties` (gitignore) + `apps/mobile/android/app/upload-keystore.jks` 가
필요. 자세한 절차는 [Flutter Android deployment](https://docs.flutter.dev/deployment/android) 참조.

### 6.6 빠른 검증 — 3 platform 동시 헬스 체크

```bash
# 풀스택 기동 확인
curl -s http://localhost:4455/v1/health | grep '"status":"ok"' && echo "API OK"
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4444   # → 200 (Web)

# Desktop — Setup 실행 시 시작 시 API 연결 확인
# tray.ts 의 auto clock-in 이 동작하면 BE 연결 OK
ls -lh "apps/desktop/release/Work Manager-Setup-0.1.0.exe"

# Mobile APK 설치 후
adb logcat -s flutter | grep -i "api"
```

---

## 참고

- [operations-guide.md §11.1](operations-guide.md) — v1.0 출시 체크리스트
- [ADR-002 Flutter WebView](../adr/ADR-002-flutter-webview-mobile.md)
- [ADR-006 Self-hosted push](../adr/ADR-006-self-hosted-push-no-firebase.md)
