# 관리자 매뉴얼 — 회사 가입 코드 (Company Code)

> 대상: 회사 관리자 (Admin / Owner) 및 Customer Success
> 마지막 업데이트: 2026-05-04
> 관련 SOP: [신규 회사 온보딩 (sop-onboard-new-company)](../operations/sop/sop-onboard-new-company.md)

회사 가입 코드 (company code) 는 신규 직원이 본인 회사에 안전하게 합류하도록 하는 1회용 / 다회용 토큰입니다. 이메일 도메인 검증 외에 추가 신뢰 채널 (trust channel) 로 동작합니다.

---

## 1. 발급 절차 (Issue)

1. 관리자 페이지 (admin console) 로 로그인합니다.
2. 좌측 사이드바 → **`/admin/codes`** 메뉴 진입.
3. 우측 상단 **"발급 (Issue)"** 버튼 클릭.
4. 다음 항목을 입력합니다.
   - **사용 한도 (max_uses)**: 1 (권장 — 1회용) ~ 50.
   - **만료일 (expires_at)**: 기본 14일 후, 최대 30일.
   - **메모 (note)**: 누구에게 발급했는지 식별용 (예: "2026-Q2 신입 12명 — HR 팀 김** 요청").
5. **"발급"** 클릭 → 8자 영숫자 코드 (예: `K7XQ2-9MNP`) 가 1회만 표시됩니다.
6. 화면을 벗어나면 다시 볼 수 없으므로, 즉시 안전한 채널로 전달하세요 (§3 참고).

---

## 2. 직원 합류 안내문 템플릿 (Template)

### 이메일 (Email)

```
제목: [회사명] 근무 관리 시스템 가입 안내

안녕하세요, OOO 님.

근무 관리 시스템 (Work Manager) 가입을 위한 회사 코드 (company code) 를 안내드립니다.

  • 가입 URL: https://app.work-manager.molcube.com/signup
  • 회사 코드: K7XQ2-9MNP
  • 만료일 (expires at): 2026-05-18

가입 후 본인 인증 (이메일 verify) 까지 완료해 주세요.
문의: hr@example.com
```

### 슬랙 (Slack) DM

```
:wave: 안녕하세요! 근무 관리 시스템 가입 코드 보내드려요.
회사 코드: `K7XQ2-9MNP` (5월 18일 만료)
가입 URL: https://app.work-manager.molcube.com/signup
```

### 카카오톡 (KakaoTalk)

```
[회사명] 근무 관리 시스템 가입 코드: K7XQ2-9MNP (5월 18일 만료)
👉 https://app.work-manager.molcube.com/signup
```

> 코드는 **1인 1회**만 전달하세요. 단톡방 / 공개 채널 게시는 금지입니다.

---

## 3. 코드 회수 절차 (Revoke)

1. **`/admin/codes`** → 코드 목록에서 회수 대상 행을 찾습니다.
2. 우측 **"회수 (Revoke)"** 버튼 클릭 → 확인 다이얼로그 → 즉시 무효화.
3. 회수된 코드로 가입 시도 시 `CODE_REVOKED` 에러 (HTTP 410) 가 반환됩니다.
4. 회수 사유 (revoke reason) 는 **감사 로그 (audit_log)** 에 자동 기록됩니다.

회수 권장 시점:
- 발급 후 7일 이상 미사용 (max_uses 도달 전)
- 외부 유출 의심
- 직원 입사 취소 / 채용 철회

---

## 4. 보안 권고 (Security)

| 항목 | 권장 | 금지 |
|---|---|---|
| max_uses | **1 (1회용)** | 채용 시즌 외 다회용 |
| 만료일 (expires_at) | **14일 이내** | 30일 초과 |
| 전달 채널 | 사내 이메일 / 슬랙 DM / 카톡 1:1 | 공개 채널, 외부 SNS, SMS 평문 |
| 메모 (note) | 수령인 식별 가능 | 비워두기 |
| 회수 (revoke) | 의심 즉시 | "나중에" |

추가 정책:
- 만료된 코드 (expired) 는 자동 비활성화되며 새 발급은 자유.
- 동일 사용자가 동일 코드로 2회 가입 시도 시 `CODE_ALREADY_USED` (HTTP 409).
- 발급 / 사용 / 회수 모든 이벤트는 **`audit_log.action='company_code.*'`** 으로 90일 보존.

---

## 5. 트러블슈팅 (Troubleshooting)

| 증상 | 원인 | 조치 |
|---|---|---|
| `CODE_NOT_FOUND` (404) | 오타 / 다른 회사 코드 | 코드 재확인. 대소문자 구분, 하이픈 포함. |
| `CODE_EXPIRED` (410) | 만료일 경과 | 새 코드 발급 후 재전달. |
| `CODE_REVOKED` (410) | 관리자 회수 | 회수 사유 확인 → 새 코드 발급. |
| `CODE_USAGE_EXCEEDED` (409) | max_uses 한도 초과 | 한도 늘려 새로 발급 (기존 회수 권장). |
| `EMAIL_DOMAIN_MISMATCH` (422) | 직원 이메일 도메인이 회사 등록 도메인과 불일치 | 회사 도메인 정책 (`/admin/company`) 확인 또는 예외 등록. |
| 가입은 됐는데 회사가 보이지 않음 | 코드는 사용됐지만 멤버십 (membership) 활성화 실패 | 관리자 → `/admin/users` 에서 수동 승인. |

---

## 6. 자주 묻는 질문 (FAQ)

**Q. 코드를 잃어버렸어요.**
A. 보안상 동일 코드는 재표시되지 않습니다. 회수 후 새로 발급해 전달하세요.

**Q. 한 코드를 여러 명에게 줘도 되나요?**
A. 운영상 가능 (max_uses ≥ 2) 하지만, 누가 사용했는지 추적이 어려워집니다. 1인 1코드를 권장합니다.

**Q. 직원이 코드 없이 가입할 수 있나요?**
A. 아니오. 회사 코드 발급은 관리자만 가능하며, 가입 단계에서 필수입니다 (개인용 무료 플랜 제외).

---

문의 / 개선 요청: `#cs-admin-tools` 채널 또는 [`docs/operations/operations-guide.md`](../operations/operations-guide.md) §12 SOP 색인 참조.
