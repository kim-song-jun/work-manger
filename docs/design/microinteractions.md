# 마이크로인터랙션 패턴 카탈로그 (Microinteractions)

> **Last updated**: 2026-05-13
> **Source of truth**: `apps/web/src/shared/styles/tokens.css` + 본 문서

Toss-style "절제가 신뢰" 원칙 위에서 사용자가 **느낄 수 있는** 모션을 정의한다. 각 패턴은 **언제 사용**(triggers) + **어떻게**(implementation) + **금지**(don't) 까지.

> **공통 원칙**:
> 1. `prefers-reduced-motion` 존중 — 모든 키프레임/transition 이 0ms 로 무효화 됨 (`tokens.css` `@media` block).
> 2. 시간 토큰만 사용 — `--motion-fast` (150ms) · `--motion-standard` (250ms) · `--motion-slow` (400ms) · `--motion-page` (350ms).
> 3. easing 토큰만 사용 — `--ease-enter` · `--ease-exit` · `--ease-standard` · `--ease-spring`.
> 4. 절대 금지: 회전 360° 스피너, 무한 bounce, "광고스러운" 그림자 펄스, 화면 가로지르는 파티클.

---

## 1. Pulse Dot — 활성 상태 시각화

**언제**: 사용자가 무언가 "진행 중" 임을 알아야 할 때 — WORKING 상태, 라이브 알림 카운트, 진행 중 OT.

**Tokens**: `--motion-standard` (2s loop), 흰색 또는 currentColor + 0 → 8px box-shadow ring expand.

**Implementation** (CSS, 본 페이지 §m-home/styles.css 의 `.wm-home-status-dot`):
```css
@keyframes wm-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(255,255,255,0.55); }
  70%  { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
  100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
}
.pulse-dot { animation: wm-pulse 2s var(--ease-standard) infinite; }
```

**Don't**: 정적 정보 옆에 사용 금지. "진행 중" 의미 없이 데코로 쓰면 사용자 피로.

---

## 2. Slide-to-Confirm — 결정 게이트

**언제**: 비가역 액션 의도 명확화 — 출퇴근 슬라이드 (`SlideToClockIn`), 향후 인박스 신청 취소 등.

**Implementation**: `@features/clock-in/SlideToClockIn`. Pointer-driven, threshold 60% + spring snap back.

**Behavior**:
- 시작 위치 `x: 0` → drag → `x: 0..width`
- 60% 미만 release → spring back (`--ease-spring`, 400ms)
- 60% 이상 release → snap end + commit callback
- Disabled 시 슬라이더 grey-300 + cursor not-allowed

**Don't**: 단순 click 대안이 가능한 곳에 슬라이드 금지. 모바일 UX 한정.

---

## 3. Stagger Reveal — 페이지 진입 시 카드 등장

**언제**: 페이지 첫 진입에서 카드 여러 개가 동시에 나타나는 경우 — 시각 부하 완화.

**Tokens**: `--motion-standard` · `--ease-enter` · 6px translateY + opacity 0→1.

**Implementation** (m-home 의 `.wm-home-anim`):
```css
.stagger-item {
  animation: rise var(--motion-standard) var(--ease-enter) both;
}
@keyframes rise {
  from { transform: translateY(6px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}
/* 카드별 delay */
.stagger-item:nth-child(2) { animation-delay: 60ms; }
.stagger-item:nth-child(3) { animation-delay: 120ms; }
```

**Don't**: 200ms 초과 delay 금지 (사용자 대기 인지). 4개 이상 stagger 시 max-delay 180ms cap.

---

## 4. Skeleton Shimmer — 로딩 상태

**언제**: 데이터 fetch 중 (200ms 이상 예상되는 모든 API). 빈 카드 + shimmer.

**Tokens**: `wm-skeleton` class (이미 tokens.css 에 정의됨).

**Implementation**:
```html
<div class="wm-skeleton" style="height: 92px; border-radius: var(--r-md);"></div>
```

**Don't**: 100ms 이하 fetch 에 skeleton 보이지 말 것 — flash. 우선 `staleTime: 30_000` + 캐시 hit 검증.

---

## 5. Toast — 결과 통지

**언제**: 사용자 액션 결과 (success / danger / info). 인박스 신청, 클락인, 설정 저장.

**Tokens**: `--motion-standard` slide-in 위, 3-4s 표시 후 fade-out.

**Implementation**: `@shared/ui/Toast` — `useToast().show(text, variant)` 호출. variant: `success` / `danger` / `info`.

**Behavior**:
- 우측 아래 (모바일: 하단 중앙) 16-20px margin
- aria-live="polite" + role="status" (success) / "alert" (danger)
- 다중 toast 시 stack (max 3, 옛것 자동 제거)

**Don't**: 페이지 내 inline feedback 으로 충분한 경우 toast 금지 (시각 노이즈). 폼 검증 에러는 inline.

---

## 6. Sheet (Bottom Sheet) — Mobile Modal

**언제**: 모바일에서 보조 입력 (leave-apply, overtime, trip request). 화면 전환 없이 컨텍스트 유지.

**Tokens**: `wm-anim-sheet` 클래스 — `translateY(40px) → 0` + opacity, `--motion-standard` · `--ease-enter`.

**Implementation**:
```html
<div class="wm-anim-sheet" role="dialog" aria-modal="true">…</div>
```

**Don't**: 데스크탑 화면에서 sheet 사용 금지 — 모달 우선. Sheet 와 사용자 페이지 간 backdrop 필요 (touch outside → 닫기).

---

## 7. Card Tap Feedback — 마이크로 액티브

**언제**: 카드 자체가 클릭 가능한 경우 (KPI tile, list row). 0.985 scale + 50ms.

**Tokens**: `--motion-fast` (150ms) · `--ease-standard`.

**Implementation**:
```css
.tappable-card {
  transition: transform var(--motion-fast) var(--ease-standard);
}
.tappable-card:active {
  transform: scale(0.985);
}
```

**Don't**: 데스크탑에서는 hover scale 대신 box-shadow 사용. 모바일 hover 미발생.

---

## 8. Progress Bar — 시간 / 진척 시각화

**언제**: 정규 시간 대비 누적 (m-home hero), 인박스 처리율, 폼 단계.

**Tokens**: `--motion-slow` (400ms) width transition · `--ease-standard`.

**Implementation** (m-home 의 `.wm-home-progress`):
```css
.progress-bar {
  height: 3px;
  background: var(--brand);
  transition: width var(--motion-slow) var(--ease-standard);
}
```

**Don't**: indeterminate 스피너 대용 금지. 진척 비율이 명확할 때만.

---

## 9. Empty State — 비어있을 때

**언제**: 데이터 0건 (예: "처리할 항목이 없어요", "감사 항목이 없어요").

**Composition**:
- 일러스트레이션 (SVG, line art, brand-soft tint)
- 1-line copy (이유) + 0.85 size sub-copy (다음 행동 안내)
- 1 primary CTA (선택적)

**Tokens**: 일러스트 컬러는 `var(--grey-300)` ~ `var(--grey-200)` 한정. brand 컬러 금지 (실수 hint).

**Don't**: "데이터 없음" 같은 시스템적 문구. 사용자 관점 메시지 ("처리할 항목이 없어요" / "잠시 후 다시 확인해주세요").

---

## 10. Status Color Tier — 상태 컬러 시스템

**언제**: 출퇴근 상태, 신청 status, 컴플라이언스 단계.

**Tokens (semantic)**:
| 상태 | Color | Soft bg |
|---|---|---|
| office (출근) | `--success` `#03B26C` | `--success-soft` |
| wfh (재택) | `--brand` `#3182F6` | `--brand-soft` |
| leave (휴가) | `--warn` `#FE9800` | `--warn-soft` |
| break (휴게) | `--caution` `#FFC342` | `--caution-soft` |
| off (퇴근) | `--grey-400` | `--grey-100` |
| pending | `--info` | `--info-soft` |
| rejected | `--danger` | `--danger-soft` |

**Implementation**: `--s-{status}` alias (이미 tokens.css 정의). 컬러는 항상 dot + 텍스트 동반 (a11y — 컬러 외 정보).

**Don't**: 색만으로 상태 구분 (색맹 사용자 차단). 항상 dot + label.

---

## 11. Hero Gradient — WORKING 상태 시각 강조

**언제**: 사용자가 "지금 진행 중" 임을 한눈에. m-home 의 WORKING 카드.

**Tokens**: `linear-gradient(135deg, var(--brand) 0%, var(--brand-hover) 100%)` + radial-gradient glow ring (white 16% → 0%, 6s slow infinite).

**Implementation** (m-home `.wm-home-hero[data-active="true"]`):
```css
.hero-active {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-hover) 100%);
}
.hero-active::before {
  content: "";
  position: absolute;
  inset: -40px -40px auto auto;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.16) 0%, transparent 70%);
  animation: glow 6s var(--ease-standard) infinite;
}
@keyframes glow {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50%      { transform: scale(1.15); opacity: 1; }
}
```

**Don't**: brand 외 컬러 gradient 사용 금지 (한국 SaaS 의 "브랜드 블루는 인터랙션만" 원칙).

---

## 12. Focus Ring — 키보드 동선

**언제**: 모든 인터랙티브 요소 (Button, TextField, Card 가 onClick 있을 때).

**Tokens**: `outline: 2px solid var(--brand)` + `outline-offset: 2px`. `:focus-visible` 만 (마우스 click 후엔 노이즈).

**Implementation** (글로벌):
```css
*:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
  border-radius: var(--r-xs);
}
```

**Don't**: `outline: none` 전역 적용 금지 (a11y 위반). 디자인 우선이라도 focus 시각은 필수.

---

## 13. Page Transition — 라우트 변경

**언제**: 모바일에서 페이지 push 시 — slide from right.

**Tokens**: `--motion-page` (350ms) · `--ease-standard`.

**Implementation**: react-router-dom `<Outlet>` 위에 framer-motion 등 추가 가능 (현재 미사용 — fade only).

**현 상태**: 별도 transition 없음. fade-in (`wm-anim-fade`, 250ms) 만 적용. **권장**: framer-motion 추가 후 모바일 한정 slide-right (B-V1X-XX).

**Don't**: 모든 라우트에 elaborate transition 적용 금지 — 사용자 컨텍스트 손실. fade or none 이 기본.

---

## 14. Form Validation — 인라인 + 즉시

**언제**: 모든 폼 input. zod refine + i18n 메시지.

**Tokens**: 에러 텍스트는 `--danger` + 11-12px + 4px margin-top. 박스는 `border: 1px solid var(--danger)` + `outline-offset: 2px`.

**Implementation**: `@shared/ui/FormField` — `error?: string` prop 으로 에러 메시지 노출.

**Behavior**:
- submit 전: blur 후 검증 (사용자 입력 중 방해 금지)
- submit 후: 모든 필드 검증 + 첫 에러로 focus 이동

**Don't**: 입력 중 (onChange) 매 키스트로크 검증 금지 — 사용자 거슬림.

---

## 15. Adoption Checklist

신규 컴포넌트 / 페이지 추가 시 본 카탈로그 항목들을 적용 여부 점검:

- [ ] focus ring (모든 인터랙티브)
- [ ] skeleton (200ms+ fetch)
- [ ] empty state (0건 가능 영역)
- [ ] toast or inline feedback (사용자 액션 결과)
- [ ] status color + label (상태 표시)
- [ ] tap feedback (카드 클릭 가능 시)
- [ ] reduced-motion 검증 (브라우저 setting → 애니메이션 0)
- [ ] axe-core 통과 (color-contrast + label + role)

---

## 16. 참고
- Toss 디자인 시스템 원칙: `docs/design/design-system.md`
- 토큰 정의: `apps/web/src/shared/styles/tokens.css`
- a11y 자동화: `apps/e2e/scripts/a11y-smoke.mjs` (axe-core wcag2aa+best-practice)
- WCAG 2.1 AA Quick Reference: https://www.w3.org/WAI/WCAG21/quickref/
- Material Motion (참고): https://m3.material.io/styles/motion/overview
