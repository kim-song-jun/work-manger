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

## 참고

- [operations-guide.md §11.1](operations-guide.md) — v1.0 출시 체크리스트
- [ADR-002 Flutter WebView](../adr/ADR-002-flutter-webview-mobile.md)
- [ADR-006 Self-hosted push](../adr/ADR-006-self-hosted-push-no-firebase.md)
