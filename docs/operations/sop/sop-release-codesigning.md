# SOP — 배포용 코드사이닝 + 스토어 등록 (Windows EV / Apple / Play)

> **대상 독자**: 운영/엔지니어링 리드
> **연관 backlog**: B-OPS-01 (Win EV), B-OPS-02 (macOS Notarization), B-OPS-03 (App/Play Store)
> **연관 인스톨러 경로**: [`docs/operations/install-guide.md`](../install-guide.md)
> **Last updated**: 2026-05-13

본 SOP 는 외부 vendor (DigiCert / Apple / Google) 와 진행해야 하는 코드사이닝 + 스토어 첫 제출 절차를 단계별로 정리한다. Claude / 엔지니어 가 단독으로 처리 불가 — **사람 결정 + 비용 + KYC 가 필수**.

---

## 1. Windows EV 코드사이닝 (B-OPS-01)

### 1.1 왜 필요한가
- 미서명 Setup.exe → Windows SmartScreen "알 수 없는 게시자" 경고. 일반 사용자 ~50% 다운로드 후 차단됨.
- EV(Extended Validation) 인증서 = 즉시 reputation 형성 (OV 는 평판 형성에 수십 회 다운로드 필요).

### 1.2 비용
| 항목 | 금액 (USD/year) | 비고 |
|---|---|---|
| EV 인증서 (DigiCert) | ~$400-600 | 1년 |
| EV 인증서 (Sectigo) | ~$200-300 | 1년, 대안 |
| Azure Trusted Signing | ~$10/month + 종량 | cloud signing, hardware-less |
| **권장**: Azure Trusted Signing | $120/year (~) | 사인용 H/W 불필요, GitHub Actions 통합 용이 |

### 1.3 절차

#### 1.3.1 인증서 발급 (DigiCert / Sectigo 기준)
1. 회사 명의 EV 인증서 신청 — 사업자등록증, 법인등기부등본, 대표자 신분증 제출
2. KYC (Know Your Customer) 검증 — 보통 5-10 영업일
3. 인증서 + USB 토큰 (Hardware Security Module) 발송 — EV 는 H/W 필수
4. PIN 설정 + 사인 환경 셋업

#### 1.3.2 Azure Trusted Signing (권장 경로)
1. Azure 구독 + Microsoft Partner Network 가입 (무료)
2. Trusted Signing Account 생성 (Azure Portal)
3. Identity Validation — 30-60일 대기 (운영 일정 여유 확보)
4. Code Signing Certificate 생성 + GitHub Actions 통합

#### 1.3.3 GitHub Actions 통합 (release.yml)
```yaml
# .github/workflows/release.yml 의 release-win job 에 추가
- name: Sign Windows Setup
  env:
    CSC_LINK: ${{ secrets.CSC_LINK }}              # base64 .p12
    CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
    WM_WIN_SIGN_MODE: cloud  # Azure Trusted Signing 경로
    AZURE_KEY_VAULT_URI: ${{ secrets.AZURE_KEY_VAULT_URI }}
    AZURE_KEY_VAULT_CERTIFICATE: ${{ secrets.AZURE_KEY_VAULT_CERTIFICATE }}
  run: npm run release:win   # electron-builder + signtool/cloud sign
```

### 1.4 시크릿 인계 체크리스트
- [ ] `.github/RELEASE_SECRETS.md` 에 본 SOP 링크 추가
- [ ] GitHub Secrets 등록: `CSC_LINK`, `CSC_KEY_PASSWORD`
- [ ] Azure 사용 시: `AZURE_KEY_VAULT_URI`, `AZURE_KEY_VAULT_CERTIFICATE`, `AZURE_CLIENT_ID/SECRET/TENANT_ID`
- [ ] `apps/desktop/scripts/win-sign.cjs` 의 cloud-sign 모드 검증 빌드 1회 통과
- [ ] 첫 서명 빌드 → SmartScreen 통과 확인 (수동 다운로드 + 실행)

### 1.5 시그니처 검증
```cmd
signtool verify /pa /v "Work Manager-Setup-0.1.0.exe"
```
- 출력 `Successfully verified` + `Issued by: DigiCert ...` 확인

---

## 2. macOS Notarization + Code Signing (B-OPS-02)

### 2.1 왜 필요한가
- macOS Gatekeeper 차단 — 사용자 첫 실행 시 "확인되지 않은 개발자" 경고
- Apple Notarization = Apple 서명 + 자동 악성코드 검증 → 경고 사라짐
- App Store 외부 배포는 Developer ID + Notarization 필수

### 2.2 비용 / 의존성
- Apple Developer Program 가입: **$99/year**
- Mac signing host: **M1/M2 Mac mini** 한 대 (구매 ~₩1.2M 또는 회사 임대 Mac)
- Apple ID + 2FA 활성

### 2.3 절차

#### 2.3.1 Apple Developer Program 가입
1. https://developer.apple.com/programs/ — 가입 신청 (개인 또는 회사)
2. **회사** 신청 시 D-U-N-S Number 발급 필요 (Dun & Bradstreet, 보통 1-2주 무료)
3. 결제 $99 → 24-48시간 후 활성
4. App Store Connect 접근 가능

#### 2.3.2 Developer ID Application 인증서 발급
1. https://developer.apple.com/account/resources/certificates/list
2. Create Certificate → **Developer ID Application**
3. macOS 의 Keychain Access 에서 Certificate Signing Request (CSR) 생성
4. CSR 업로드 → `.cer` 다운로드 → Keychain 에 import
5. Keychain 에서 인증서 우클릭 → Export → `.p12` (비밀번호 설정)
6. `.p12` 를 base64 인코딩 → GitHub Secret `MAC_CSC_LINK` (값) + `CSC_KEY_PASSWORD` (비밀번호)

#### 2.3.3 App-specific Password 생성 (notarytool 용)
1. https://appleid.apple.com → Sign-in 보안 → App-specific Passwords
2. "WM Notarize" 등 이름으로 생성 → GitHub Secret `APPLE_APP_SPECIFIC_PASSWORD`
3. Team ID 확인 → `APPLE_TEAM_ID`
4. Apple ID 이메일 → `APPLE_ID`

#### 2.3.4 GitHub Actions release.yml (이미 stub 존재)
- `apps/desktop/scripts/notarize.cjs` 가 `electron-builder` afterSign 후크에서 자동 호출
- 환경변수 누락 시 graceful skip — 발견된 시점부터 빌드만 통과

### 2.4 시크릿 인계 체크리스트
- [ ] Apple Developer Program 가입 + 결제 완료
- [ ] D-U-N-S Number 발급 (회사 등록)
- [ ] Developer ID Application 인증서 발급
- [ ] App-specific Password 생성
- [ ] GitHub Secrets: `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, `MAC_CSC_LINK`, `CSC_KEY_PASSWORD`
- [ ] Mac signing host 확보 (M1+ Mac, M-series 권장)
- [ ] `npm run release:mac` 한 번 실행 → DMG + ZIP 산출
- [ ] `spctl -a -vvv "release/Work Manager-X.Y.Z.dmg"` → `accepted` 확인
- [ ] Mac 사용자 다운로드 후 더블클릭 → 경고 없음 확인

### 2.5 시그니처 검증
```bash
codesign --verify --verbose=2 "release/mac/Work Manager.app"
spctl -a -vvv "release/Work Manager-0.1.0.dmg"
```

---

## 3. App Store Connect 등록 + 첫 제출 (B-OPS-03 — iOS)

### 3.1 의존성
- §2 (Apple Developer Program 가입)
- iOS native 빌드 가능 — B-CODE-02 (iOS native) + Mac signing host

### 3.2 절차

#### 3.2.1 App ID 등록
1. https://developer.apple.com/account/resources/identifiers/list
2. **Identifiers** → **+** → App IDs → App
3. Bundle ID: `com.molcube.workmanager` (Explicit)
4. Capabilities: Push Notifications, App Groups (Widget 공유), Location (Always & When In Use)

#### 3.2.2 Provisioning Profile
1. iOS App Development → `WorkManagerDev`
2. iOS App Store → `WorkManagerProd` (TestFlight + 출시)
3. Capabilities 활성 확인

#### 3.2.3 App Store Connect 앱 생성
1. https://appstoreconnect.apple.com
2. My Apps → **+** → New App
3. Platform: iOS, Name: "Work Manager", Primary Language: 한국어, Bundle ID: `com.molcube.workmanager`, SKU: `WM-IOS-001`
4. User Access: Full Access

#### 3.2.4 앱 정보 작성
- **카테고리**: Productivity (Business 보조)
- **연령 등급**: 4+
- **개인정보처리방침 URL**: https://www.molcube.com/privacy
- **앱 아이콘**: 1024×1024 PNG (no alpha, no rounded corners)
- **App Privacy**: 위치, 알림, 인증, 사용자 ID 수집 항목 표시

#### 3.2.5 TestFlight 외부 베타
1. Build 업로드 (Xcode → Archive → Distribute → App Store Connect)
2. Internal Testing → 회사 직원 ~10인
3. External Testing → 베타 그룹 등록 → 첫 Review (Apple, 24-48h)
4. 최소 5인 사용 + Crash report 0건 확보

#### 3.2.6 App Store 첫 제출
- **Localized name**: 한국어 "근무 관리"
- **부제 (Subtitle, 30자)**: "출퇴근부터 연차까지 한 번에"
- **프로모션 텍스트 (170자)**: 출시 시점에 최신 기능 강조
- **설명 (4000자)**: 핵심 기능 5-7개 bullet
- **키워드**: 근무관리, 출퇴근, 연차, 컴플라이언스, 52시간
- **스크린샷** 필수: 6.7" (iPhone 15 Pro Max), 6.5" (iPhone 11 Pro Max), 5.5" — 각 3-10장
- **Review 정보**: 시연 계정 (admin@acme.demo + DemoPass!1, 회사코드 ACMEDM)
- **Review Notes**: 위치 권한 사용 사유 + 푸시 권한 사용 사유 + 52h 컴플라이언스 한국 노동법 근거 명시

### 3.3 Review §5.1.1 위치 권한 — 핵심 통과 포인트
- "Always" 권한 요청 시 별도 onboarding 화면에서 명확 설명 — geofence 출퇴근용임을 강조
- 거부 시에도 앱 사용 가능 (수동 클락인 fallback)
- `NSLocationAlwaysAndWhenInUseUsageDescription` 한국어 + 영어 모두 등록 (`apps/mobile/ios/Runner/Info.plist`):
  ```
  위치 정보는 사무실 출퇴근 자동 인식에 사용됩니다.
  Used to detect office check-in/out automatically.
  ```

### 3.4 일정 예상
- D-1주: D-U-N-S Number 발급 (대기)
- D-Day: Developer Program 가입 + 결제
- D+1일: App ID + Provisioning + App Store Connect 앱 생성
- D+3일: TestFlight 첫 빌드 업로드
- D+5일: TestFlight 외부 베타 review (Apple)
- D+10일: 내부 사용 검증
- D+14일: App Store 정식 제출
- D+16-21일: Apple Review (보통 24-48h, 첫 제출은 추가 검토 가능성)

---

## 4. Google Play Console 등록 + 첫 제출 (B-OPS-03 — Android)

### 4.1 비용
- Google Play Developer 등록: **$25 (one-time)**

### 4.2 절차

#### 4.2.1 Developer 등록
1. https://play.google.com/console/signup
2. 결제 $25 → 즉시 활성
3. Identity Verification — 보통 1-2일

#### 4.2.2 앱 생성
1. Play Console → All apps → Create app
2. Default language: 한국어 (대한민국)
3. App name: "근무 관리 / Work Manager"
4. App or game: App
5. Free / Paid: Free (Subscription 은 별도 in-app billing)

#### 4.2.3 Internal Testing 트랙
1. Testing → Internal testing → 빌드 업로드 (APK 또는 AAB)
2. **AAB 권장**: Android App Bundle. APK 보다 ~30% 작음.
3. Internal tester group 등록 (회사 이메일)

#### 4.2.4 Production 출시 전 필수
- **Data safety** 설문: 위치 수집/공유, 사용자 ID, 알림 수집 항목 명시
- **App access**: Review 용 시연 계정 (admin@acme.demo + ACMEDM)
- **Content rating**: Productivity, IARC 4+
- **Target audience**: 18+ (회사 임직원)
- **Privacy policy URL**: https://www.molcube.com/privacy

#### 4.2.5 Production 출시
1. Production → Create new release
2. AAB 업로드
3. Release notes (한국어 + 영어)
4. Review submit → Google 검토 (보통 24-48h, 첫 제출은 ~5일)

### 4.3 keystore 관리 — 영구 보관 핵심
- Play App Signing 가입 (Google 이 release key 관리, upload key 만 우리)
- Upload keystore — **반드시 안전 보관** (`apps/mobile/android/key.properties` 는 git ignore, AWS Secrets / 1Password 백업)
- Keystore 분실 = 앱 영구 업데이트 불가

### 4.4 일정 예상
- D-Day: $25 결제 + Identity Verification 시작
- D+2일: 앱 생성 + Data safety + content rating
- D+3일: Internal Testing 첫 빌드 업로드
- D+5일: Internal 사용 + 회귀
- D+7일: Production 제출
- D+12일: Live (보통 24-48h, 첫 제출은 ~5일)

---

## 5. 통합 일정 (v1.0 GA 2026-08-17 역산)

| Date | 작업 | Owner |
|---|---|---|
| **2026-06-01** | Apple Developer Program 가입 (D-U-N-S 선행) | 운영 리드 |
| 2026-06-01 | Google Play Developer 등록 + Identity Verification | 운영 리드 |
| 2026-06-01 | EV 인증서 / Azure Trusted Signing 셋업 | SRE |
| 2026-06-05 | Apple Developer ID 인증서 발급 + GitHub Secrets 주입 | SRE |
| 2026-06-10 | B-CODE-02 (iOS native + WidgetKit) 완료 | Mobile |
| 2026-06-15 | TestFlight 첫 빌드 (외부 베타 25인) | Mobile |
| 2026-06-15 | Play Internal Testing 첫 빌드 | Mobile |
| 2026-06-22 | 1주 베타 → 회귀 + Crash 0 확보 | QA |
| 2026-07-01 | App Store + Play Production 제출 | Mobile |
| 2026-07-10 | Apple Review 통과 (예상) | Apple |
| 2026-07-08 | Play Production Live | Google |
| 2026-07-15 | B-OPS-04 외부 펜테스트 시작 | SRE + Vendor |
| **2026-08-17** | v1.0 GA — 공개 출시 | All |

---

## 6. 위험 + 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| D-U-N-S Number 발급 지연 | Apple 가입 차단 | 2주 일찍 신청 |
| App Review §5.1.1 위치 거부 | iOS 제출 거부 | 위치 사용 onboarding 화면 명확화 + fallback 흐름 검증 |
| EV 인증서 SmartScreen reputation 형성 | 첫 제출 후 ~수십 회 다운로드 까지 경고 | Azure Trusted Signing 즉시 reputation 보유 |
| Play App Signing keystore 분실 | 앱 영구 업데이트 불가 | AWS Secrets + 1Password 양쪽 보관 |
| Apple 의 Notarization 거부 (악성코드 false positive) | macOS 빌드 차단 | Apple Notary 로그 확인 + 재제출 |

---

## 7. References
- [`docs/operations/install-guide.md`](../install-guide.md) — 현재 설치 파일 위치
- [`docs/adr/ADR-007-native-mobile-shift.md`](../../adr/ADR-007-native-mobile-shift.md) — 일정 의존성
- [`.github/workflows/release.yml`](../../../.github/workflows/release.yml) — 자동화 스크립트
- [`apps/desktop/scripts/notarize.cjs`](../../../apps/desktop/scripts/notarize.cjs) — afterSign hook
- [`.github/RELEASE_SECRETS.md`](../../../.github/RELEASE_SECRETS.md) — 시크릿 인벤토리
- Apple App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Play Console App Submission: https://support.google.com/googleplay/android-developer/answer/9859152
