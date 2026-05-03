# 화면 카탈로그 (Screen Catalog)

> 디자인 핸드오프(`_design/remix/project/근무 관리 하이파이.html`)에 정의된 모든 화면 정리.
> 각 항목은 구현 우선순위 — **MVP** / **v1.x** / **v2** — 로 분류.

| 우선순위 | 정의 |
|---|---|
| **MVP** | v1.0 출시 필수. 핵심 사용자 플로우. |
| **v1.x** | MVP 출시 후 4~12주 내 추가. |
| **v2** | Enterprise 단계 (SSO, 다중 법인, 컴플라이언스 강화). |

---

## 1. 인증 & 온보딩

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `auth.signup` | 회원가입 (이메일 인증) | MVP | |
| `auth.login` | 로그인 | MVP | OAuth 버튼 포함 |
| `auth.forgot` | 비밀번호 찾기 | MVP | |
| `onb.intro` | 온보딩 인트로 (3 슬라이드) | MVP | |
| `onb.welcome` | 1·환영 | MVP | |
| `onb.company-code` | 2·회사 코드 입력 | MVP | |
| `onb.profile` | 3·프로필 | MVP | |
| `onb.location` | 4·위치 등록 | MVP | |
| `onb.schedule` | 5·근무시간 | MVP | |
| `onb.notifications` | 6·알림 설정 | MVP | |
| `onb.widget` | 7·위젯 추천 | v1.x | |
| `onb.done` | 8·완료 | MVP | |

## 2. 모바일 · 홈 (출퇴근)

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `home.slide` | A·밀어서 출근 | MVP | 기본 채택 (3안 중 결정) |
| `home.tap` | B·탭하여 출근 | v1.x | 사용자 선택지 |
| `home.cards` | C·카드 스택 | v1.x | 사용자 선택지 |

## 3. 모바일 · 초과근무

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `ot.sheet` | 초과근무 요청 시트 | MVP | |
| `ot.settings` | 자동 요청 설정 | MVP | |
| `ot.history` | 초과근무 이력 | MVP | |

## 4. 모바일 · 연차

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `leave.home` | 연차 대시보드 (잔여·소멸) | MVP | |
| `leave.apply` | 연차 신청 | MVP | |
| `leave.success` | 제출 완료 | MVP | |
| `leave.expiry-alert` | 소멸 경고 풀스크린 | MVP | |

## 5. 모바일 · 팀 & 인박스

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `team.tabs` | 탭 통합 (그리드/팀별/타임라인) | MVP | |
| `team.grid` | A·그리드 | MVP | |
| `team.grouped` | B·팀별 그룹 | MVP | |
| `team.timeline` | C·타임라인 | v1.x | |
| `inbox.list` | 통합 인박스 (탭) | MVP | |
| `inbox.quick` | 빠른 승인 | MVP | |

## 6. 모바일 · 마이 & 부가

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `settings.main` | 설정 | MVP | |
| `profile.full` | 마이 페이지 (KPI + 메뉴) | MVP | |
| `customize` | 화면 꾸미기 | v1.x | 테마/폰트 |
| `trip` | 출장·외근 등록 | v1.x | |
| `help` | 도움말 / FAQ | v1.x | |

## 7. 모바일 · 디테일

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `record.detail` | 근무 기록 상세 | MVP | |
| `approval.detail` | 승인 상세 (이력) | MVP | |
| `weekly.report` | 주간 리포트 | v1.x | |
| `noti.center` | 알림 센터 | MVP | |
| `notice` | 공지사항 | MVP | |

## 8. 모바일 · 위젯 & 엣지케이스

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `widget.ios` | iOS 홈화면 위젯 | v1.x | 네이티브 코드 필요 |
| `widget.android` | Android 홈화면 위젯 | v1.x | |
| `widget.gallery` | 위젯 갤러리 | v1.x | |
| `empty.notifications` | 알림 빈 상태 | MVP | |
| `loc.picker` | 위치 수동 선택 | MVP | |
| `error.gps` | GPS 실패 | MVP | |

## 9. 웹 · 개인 대시보드

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `web.dashboard` | 대시보드 (메인) | MVP | |
| `web.team-leave` | 팀 연차 캘린더 | MVP | |
| `web.records` | 근무 기록 상세 | MVP | |
| `web.responsive.*` | 1440 / 1280 / 1024 / 768 반응형 | MVP | 4 break point 모두 |

## 10. 웹 · 통합 인박스

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `web.inbox` | 3-pane Inbox | MVP | |

## 11. 관리자

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `admin.approvals` | 승인 대기 한눈에 | MVP | |
| `admin.expiring-leave` | 연차 소멸 안내 | MVP | |
| `admin.reports` | 월간 근태 리포트 | MVP | |
| `admin.employees` | 직원 관리 | MVP | |
| `admin.live-board` | 실시간 현황 보드 | v1.x | |
| `admin.employee-detail` | 직원 상세 | MVP | |

## 12. 데스크탑 앱

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `desktop.menubar` | macOS 트레이 드롭다운 | v1.x | Electron |
| `desktop.win-tray` | Windows 시스템 트레이 | v1.x | Electron |
| `desktop.win-app` | Windows 데스크탑 앱 | v1.x | Electron |
| `desktop.settings` | 환경설정 — 초과근무 | v1.x | |
| `desktop.notifications` | 알림 토스트 스택 | v1.x | |

## 13. 특수 기능 (컴플라이언스)

| ID | 화면 | 우선순위 | 비고 |
|---|---|---|---|
| `comp.mob` | 컴플라이언스 모바일 | v1.x | 52시간 룰 |
| `comp.block` | 출근 차단 | v2 | 강제 차단은 회사 옵션 |
| `comp.admin` | 관리자 보드 | v1.x | |
| `cal.mob` | 팀 캘린더 모바일 | v1.x | |
| `cal.web` | 팀 캘린더 웹 매트릭스 | v1.x | |

---

## 화면 ID 명명 규칙

- 파일/라우트: `kebab-case` (`leave/expiry-alert`)
- 컴포넌트: `PascalCase` (`LeaveExpiryAlert`)
- 모바일 한정: 라우트 prefix `/m/...`, 웹: `/`, 관리자: `/admin/...`, 데스크탑: 별도 Electron 윈도우

## 디자인 원본 위치

각 화면의 픽셀 레퍼런스는 핸드오프 번들 내에서 다음 경로로 찾는다.

```
_design/remix/project/hifi/<area>.jsx
```

- `mobile.jsx` — 모바일 홈/온보딩/공통
- `web.jsx`, `web-responsive.jsx` — 웹 대시보드
- `admin.jsx` — 관리자
- `inbox.jsx` — 통합 인박스 (모바일/웹)
- `desktop-and-settings.jsx` — Electron 화면
- `widgets.jsx` — 위젯
- `compliance-calendar-onboarding.jsx` — 컴플라이언스 / 캘린더 / 온보딩
- `detail-pages.jsx` — 디테일 화면
- `extra-pages.jsx` — 마이/도움말/공지 등 부가

`_design/remix/project/hifi/tokens.css` — 디자인 토큰 원본.
