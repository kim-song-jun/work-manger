# 경쟁사 분석 — Flex + 시프티 (2026-05-13)

> **Source**: 공식 사이트 (about.flex.team / shiftee.io) + 운영 가이드 + 외부 리뷰 (techview.best, reviewinsight.blog)
> **Purpose**: 우리 SaaS(Work Manager)의 기능 갭 + 차별화 포인트 식별

본 문서는 한국 시장 동급 SaaS (Flex, Shiftee) 의 기능을 정리해서 Work Manager 의 백로그 우선순위 결정에 사용한다.

---

## 1. Flex (flex.team) — 한국 HR 종합 SaaS

Flex 는 인사/조직관리/근태/급여/성과평가/채용까지 HR 전 영역을 통합한 종합 SaaS. 한국 시장 1위급 (300+ 임직원 회사 다수 도입).

### 1.1 근태 관리 (Time-tracking)

| 기능 | Flex 보유 | Work Manager v1.0 | 갭/메모 |
|---|---|---|---|
| 자동 근무 기록 (IP/WiFi) | ✅ | 🟡 (geofence + GPS) | IP 방식 미지원 — 추가 필요 |
| 출퇴근 버튼 (수동) | ✅ | ✅ slide-to-clock-in |  |
| 근태 대시보드 (출퇴근/초과/지각/코어타임) | ✅ | ✅ admin dashboard | 코어타임 시각화 보강 여지 |
| 다양한 근무제 (고정/시차/선택적/교대) | ✅ 100% 반영 | 🟡 고정 + 자동 OT (시차 일부) | **선택적 근무 + 교대 근무 미지원** |
| 출퇴근 알림 자동화 | ✅ | ✅ ntfy/APNs/Web Push |  |
| 동료 일정 캘린더 (휴가/재택) | ✅ | 🟡 `/web/team-calendar` (basic) | 풀 캘린더 보강 (B-V1X-01) |
| 직관적인 캘린더 입력 (drag-and-drop) | ✅ | ❌ | 우선순위 P2 |

### 1.2 휴가 관리

| 기능 | Flex | Work Manager v1.0 | 갭/메모 |
|---|---|---|---|
| 자동 연차 부여 / 소멸 | ✅ 정책 한 번 → 자동 | ✅ Celery beat (`grant_monthly/annual`, `expire_balances_task`) |  |
| 입사일/회계일 기준 시뮬레이션 | ✅ | 🟡 (정책 변경 시 미리보기 없음) | 정책 시뮬레이터 UI 필요 |
| 부서/조직/계약유형별 다른 정책 | ✅ | ❌ 회사 단위 단일 정책 | **B-V1X-X 후속** |
| 법정필수휴가 + 우리 회사 휴가 제도 | ✅ | 🟡 ANNUAL/COMP/SICK/PERSONAL 4 타입 | leave_type 확장 필요 |
| 휴가별 승인 / 사용 단위 / 증빙자료 | ✅ | 🟡 승인 ✅, 증빙 ❌ | 증빙 첨부 기능 P2 |
| 연차 촉진 + 노무수령거부 통지 | ✅ | 🟡 promote_unused_leave task | 통지 기록 UI 부재 |
| 보상휴가 자동 적립 (OT 승인 → COMP) | ✅ 통합 | 🟡 임시 (ANNUAL bucket 공유) | **B-CODE-03 backlog** |

### 1.3 인사 정보 관리 (HRIS)

| 기능 | Flex | Work Manager v1.0 |
|---|---|---|
| 인사 정보 통합 (입사/계약/직무/평가) | ✅ | ❌ — 우리는 근태 + 빌링만 |
| 조직도 / 부서 트리 | ✅ | 🟡 `/v1/team/organization-tree` (read-only) |
| 입퇴사 워크플로 | ✅ | ❌ |
| 평가 / 1on1 / 피드백 | ✅ | ❌ |
| 채용 ATS | ✅ | ❌ |

> Flex 는 HR 전 영역. 우리는 **근태 + 컴플라이언스 + 보상 통합** 에 특화 — 인사/평가/채용은 v2+ 또는 외부 연동(Workday/NamuwHR) 으로 위임.

### 1.4 보상 통합

| 기능 | Flex | Work Manager v1.0 |
|---|---|---|
| 포괄임금 계약 연계 | ✅ | ❌ |
| 보상휴가 운영 | ✅ | 🟡 (위) |
| 휴일 대체 적용 | ✅ | ❌ |
| 수당 지급 자동 계산 | ✅ | ❌ |
| 급여 정산 출력 (CSV/PDF) | ✅ | 🟡 `/admin/reports` CSV |

---

## 2. Shiftee (shiftee.io) — 인력관리 + 스케줄 특화

Shiftee 는 300,000+ 사업장 글로벌 도입. 스케줄 + 출퇴근 + 휴가 + 정산을 **다지점 / 시프트 근무** 에 강하게 특화.

### 2.1 출퇴근 (Timeclock)

| 기능 | Shiftee | Work Manager v1.0 | 갭/메모 |
|---|---|---|---|
| GPS 좌표 + 반경 | ✅ | ✅ |  |
| WiFi IP 인증 | ✅ | ❌ | 사무실 LAN 검증 필요 시 추가 |
| Anti-Cheating System (지문 / PC) | ✅ | ❌ | 보안성 향상 옵션 |
| 다지점 출퇴근 (동일 직원 여러 점포) | ✅ | ❌ 단일 회사 / 단일 위치 가정 | **차별화 포인트 — 식음료/리테일 타겟 시 필요** |
| 무일정 근무 출퇴근 (스케줄 없이) | ✅ | ✅ (현재 기본 동작) |  |
| 외근 / 재택 간주근로 | ✅ | 🟡 출장(`/m/trip`), 재택 부분 |  |
| 근무지 외 출퇴근 요청 | ✅ | 🟡 ManualClockInRequest 모델 있음, UI/플로우 보강 필요 |  |

### 2.2 근무일정 (Schedule)

| 기능 | Shiftee | Work Manager v1.0 |
|---|---|---|
| 근로/휴게 계획 (drag-and-drop) | ✅ | ❌ 직원별 고정 일정만 (`WorkSchedule`) |
| 교대 / 시프트 근무 | ✅ 강점 | ❌ |
| 다지점 직원 일정 동시 관리 | ✅ | ❌ |
| 자동 스케줄 생성 (룰 기반) | ✅ | ❌ |
| 일정 변경 승인 워크플로 | ✅ | 🟡 (ManualClockInRequest 와 통합 가능) |

### 2.3 휴가 + 정산

| 기능 | Shiftee | Work Manager v1.0 |
|---|---|---|
| 차감 일수 + 잔여 일수 | ✅ | ✅ LeaveBalance |
| 맞춤 보고서 (근태 + 급여) | ✅ | 🟡 월간 리포트 CSV/PDF |
| 전자결재 / 전자계약 | ✅ | ❌ |

---

## 3. 우리 (Work Manager) 의 차별화 + 갭

### 3.1 차별화 (유지 / 강화 권장)
- **Self-hosted push** (ADR-006) — Firebase 의존성 0, 한국 데이터 주권 친화
- **컴플라이언스 52h 보드** — 법 자동 준수 + 차단 정책 (`compliance_block_when_over`)
- **단일 React SPA 셸 어댑터** — Web/Desktop/Mobile 동일 UX (ADR-001) — 빠른 이터레이션
- **JWT + 2FA + lockout** — 강한 인증 (Flex/Shiftee 도 동등하나 명시 강조 가치)
- **무료 Firebase 의존성 0** — 운영 비용 측면 차별화

### 3.2 P1 갭 (v1.x 단기)
| ID | 갭 | 우선순위 | 근거 |
|---|---|---|---|
| B-V1X-08 | 다양한 근무제 (시차/선택적/교대) | P1 | Flex/Shiftee 모두 보유, 한국 시장 필수 |
| B-V1X-09 | WiFi IP 인증 (출퇴근 보안) | P2 | Shiftee 차별점, 우리도 옵션 추가 |
| B-V1X-10 | 부서/조직별 다른 휴가 정책 | P1 | Flex 강점, 대기업 도입 시 필수 |
| B-V1X-11 | 정책 시뮬레이터 UI (입사/회계일 변경 미리보기) | P2 | Flex 의 큰 셀링 포인트 |
| B-V1X-12 | 동료 일정 캘린더 — drag-and-drop 입력 | P2 | UX 직관성 격차 |
| B-V1X-13 | 연차 촉진 + 노무수령거부 통지 기록 UI | P1 | 법적 안전망 |
| B-V1X-14 | 다지점 / 시프트 근무 | P3 | 리테일/F&B 타겟 시 필수 (현재 SaaS 타겟 IT 중소기업) |
| B-V1X-15 | 휴가별 증빙자료 첨부 | P2 | 정책 유연성 |

### 3.3 P2/P3 (v2)
- HRIS 통합 (인사정보/입퇴사/평가/채용) — v2 Enterprise 또는 외부 파트너십
- 급여 정산 자동 계산 + 포괄임금 연동 — Flex 강점, 정산 파트너십 검토
- 전자결재 / 전자계약 — 외부 SaaS(SignNow, ModuSign) 연동

---

## 4. 시사점 — Native 앱 전환 동기

Flex/Shiftee 모두 **iOS/Android 풀 네이티브 앱**으로 출시:
- Flex: iOS/Android 풀 네이티브 (Flutter 사용 추정 — 정확 stack 비공개)
- Shiftee: iOS/Android 풀 네이티브 (kr.linkedin.com/company/shiftee-global)

**우리 (현재)**: 단일 React SPA + Flutter WebView 호스트
- 장점: 유지보수 비용 1/3, 기능 deploy 즉시 모바일 반영
- 단점: WebView 의 perceived performance (스크롤 부드러움 / 키보드 반응 / 네이티브 컨트롤 차이) 가 Flex/Shiftee 대비 열세
- 특히 출퇴근 슬라이드 / 푸시 / 위젯 / geofence 등 OS 기능 의존 영역에서 WebView 의 한계 노출

**결론**: WebView 셸 → 풀 네이티브 전환 검토 — [ADR-007](../adr/ADR-007-native-mobile-shift.md) 참조.

---

## 5. Sources

- [Flex 근태 관리 — about.flex.team](https://about.flex.team/features/time-tracking)
- [Flex 사용자 후기 / 가격 — techview.best](https://www.techview.best/software/325)
- [Flex HR 후기 2026 — reviewinsight.blog](https://reviewinsight.blog/2024/03/14/%ED%94%8C%EB%A0%89%EC%8A%A4flex-hr-%ED%94%8C%EB%9E%AB%ED%8F%BC-%EC%A3%BC%EC%9A%94-%EA%B8%B0%EB%8A%A5-%EB%B0%8F-%EC%82%AC%EC%9A%A9%EC%9E%90-%ED%9B%84%EA%B8%B0/)
- [Shiftee 통합 인력관리 — shiftee.io/en](https://shiftee.io/en)
- [Shiftee 출퇴근 기록 — shiftee.io/en/attendance](https://shiftee.io/en/attendance)
- [Shiftee 출퇴근 장소 설정 가이드](https://shiftee.io/ko/help/article/timeclockArea)
- [근태감시와 근태관리의 차이 — flexteam brunch](https://brunch.co.kr/@flexteam/26)
