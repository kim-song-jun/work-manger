# Task Index

> `/agent-all` 이 생성한 task doc + 세션 보고서 인덱스.

## 지금 Active

(없음)

## 최근 완료

- **[SESSION 2026-05-07](SESSION-2026-05-07-audit-fix-bootstrap.md)** — 진단 / CLAUDE.md+agent 부트스트랩 / Web+Electron 라이브 테스트 / 7건 GAP fix / Android 환경 셋업 + APK 빌드 검증. 6 commits push. ✅
- [01-live-test-findings.md](01-live-test-findings.md) — Web/Electron/Android 라이브 테스트 GAP 상세 (audit log)

## Backlog (다음 세션 권장)

### 코드 (즉시 가능)
- BE bulk endpoint 2건 — `/v1/admin/leave/expiring` + admin batch decide bulk
- 모바일 geofence native 등록 — `apps/mobile/lib/geofence/geofence_service.dart:69,80` Workmanager 등록 + 플랫폼 엔진 wiring
- AdminSettingsPage 실제 구현 (회사 설정 / 알림 정책 / 브랜드) — GAP-A 의 정상 형태 보강
- 부하/카오스 스크립트 (`tools/load/locustfile.py`, `tools/chaos/`) — operations §11.1

### 환경 (1회)
- Android emulator 부팅 — Docker 종료 후 재시도 OR 실 단말 USB 연결
- Electron Setup.exe 코드사이닝 (EV 인증서 발급 후)
- Apple Notarization (Apple Developer ID + env)
- App Store / Play Store 개발자 계정 등록

### 운영 (코드 외)
- 외부 펜테스트, 법무 검토, GDPR 감사, 사용자 매뉴얼, prod 모니터링 연동, 온콜 로테이션, 백업 복원 리허설
