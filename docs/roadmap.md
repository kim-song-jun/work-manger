# 로드맵 (Roadmap)

> **현재 단계**: Phase 0 — 기획 / 문서화 (2026-05)

각 단계는 **종료 기준 (Exit Criteria)** 를 충족해야 다음 단계로 진행한다.

---

## Phase 0 · 기획 / 문서화 (현재)

**기간**: 2주
**산출물**:
- 본 `docs/` 일체
- 디자인 핸드오프 검토 완료
- 기술 스택 / 인프라 비용 추정
- ADR-001 ~ 005 작성

**종료 기준**:
- [ ] 모든 docs/ 문서 v0.1 머지
- [ ] 운영팀 / 디자인팀 / 개발팀 검토 완료
- [ ] 1차 비용 추정 승인

---

## Phase 1 · 골격 / 디자인 시스템 (2주)

**목표**: "빈 화면" 까지 도달.

- Django 프로젝트 부트스트랩 + Health 엔드포인트
- React Vite 프로젝트 부트스트랩
- 토큰 / 타이포 / 기본 컴포넌트 (Button, Input, Card, Modal, Toast) 구현
- 라우팅 / i18n (ko/en) 골격
- Auth 골격 (이메일+비번 로그인)
- CI/CD: GitHub Actions → dev 환경 자동 배포
- 도커 / Terraform 으로 dev 환경 구성

**종료 기준**:
- [ ] 로그인 화면이 dev 도메인에서 렌더
- [ ] CI 가 main 푸시 시 dev 배포
- [ ] Storybook (또는 컴포넌트 도큐 페이지) 으로 atoms 확인 가능

---

## Phase 2 · MVP 핵심 (6주)

**목표**: 1개 회사가 실제로 출근 / 연차 / 승인을 처리할 수 있다.

| 주차 | 작업 |
|---|---|
| W1-2 | Identity / 회사 / 멤버십 / 온보딩 8단계 |
| W2-3 | Attendance: 출근 / 퇴근 / 휴게 (모바일 슬라이드 + 위치 검증) |
| W3-4 | Leave: 자동 부여 / 신청 / 승인 / 잔여 표시 |
| W4-5 | Overtime: 자동 요청 / 수동 신청 / 승인 |
| W5 | Team status (그리드 / 그룹) |
| W5-6 | Admin: 직원 관리 / 승인 통합 / 월간 리포트 |
| W6 | Notifications (푸시 + 이메일 + 인박스) |

**종료 기준**:
- [ ] [`screen-catalog.md`](specs/screen-catalog.md) 의 MVP 화면 100% 구현
- [ ] 부하 테스트 통과 (목표 DAU × 3)
- [ ] Stg 에서 1주 실사용 베타

---

## Phase 3 · 모바일 셸 + 데스크탑 셸 (3주)

- Flutter WebView 셸 (Android / iOS)
  - GPS / Geofencing / 푸시 / 권한
  - TestFlight / Play Internal Testing 배포
- Electron 셸 (Mac / Windows)
  - 트레이 / OS 알림 / 자동 출퇴근
  - 코드 사인 / Notarization

**종료 기준**:
- [ ] App Store / Play Store 심사 통과
- [ ] Electron auto-update 동작 검증

---

## Phase 4 · v1.0 출시

**목표**: 일반 공개

- 보안 점검 (외부 pen-test 권장)
- 개인정보처리방침 / 이용약관 작성
- 운영 SOP / 런북 완성
- 온콜 로테이션 시작
- 첫 유료 회사 온보딩

**종료 기준**:
- [ ] [`operations-guide.md`](operations/operations-guide.md) §11 출시 체크리스트 100%

---

## Phase 5 · v1.x 확장 (분기 단위)

| 항목 | 우선순위 |
|---|---|
| 팀 캘린더 (월 매트릭스) | 높음 |
| 컴플라이언스 52시간 보드 | 높음 |
| 출장 / 외근 등록 | 중간 |
| 홈화면 위젯 (iOS / Android) | 중간 |
| 화면 꾸미기 (테마 / 폰트 사용자 설정) | 중간 |
| 2FA (TOTP) | 중간 |
| 데이터 export (PDF) | 중간 |
| 슬랙 / 팀즈 봇 연동 | 낮음 |

---

## Phase 6 · v2 Enterprise

| 항목 | 비고 |
|---|---|
| SSO (SAML / OIDC) | 대기업 도입 필수 |
| SCIM 사용자 프로비저닝 | |
| 다중 법인 / 멀티 테넌트 | 그룹사 |
| 감사 로그 강화 / SIEM 연동 | |
| 외부 캘린더 양방향 동기화 (Google / Outlook) | |
| 급여 / HRIS 연동 (Workday / NamuwHR 등) | 파트너십 검토 |

---

## 마일스톤 일정 (목표)

| 마일스톤 | 시점 |
|---|---|
| Phase 0 종료 | 2026-05-18 |
| Phase 1 종료 | 2026-06-01 |
| Phase 2 종료 | 2026-07-13 |
| Phase 3 종료 | 2026-08-03 |
| **v1.0 GA** | **2026-08-17** |
| v1.1 (캘린더 + 컴플라이언스) | 2026-10 |
| v1.2 (위젯 + 테마) | 2026-12 |
| v2 Beta (SSO) | 2027 Q2 |

> 일정은 Phase 0 검토 결과에 따라 조정. 조정 사유는 ADR 또는 본 문서 PR 코멘트에 남긴다.
