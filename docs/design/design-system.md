# 디자인 시스템 (Design System)

> 핸드오프 원본: `_design/remix/project/hifi/tokens.css` + `_design/remix/project/디자인 문서.md`
> 본 문서는 **개발 적용 가이드**. 토큰 자체는 CSS 변수로 직접 사용.

---

## 1. 원칙 (Toss-style)

1. **시간에 여백을** — 정보 밀도보다 호흡감 우선.
2. **점진적 밀도** — 메인 화면 ↓, 디테일 페이지 ↑ 밀도.
3. **한 화면, 한 행동** — 주요 액션은 화면당 1개.
4. **블루는 인터랙션만** — 브랜드 블루는 클릭 가능한 요소에만.
5. **절제가 곧 신뢰** — 그라데이션 / 컬러 그림자 / 과한 모션 금지.
6. **한글과 영문 동등** — i18n 1급 시민.
7. **숫자는 타이포그래피** — `tabular-nums` + 700 + 전용 스케일.
8. **여백은 자산** — Whitespace는 콘텐츠.

---

## 2. 토큰 계층

```
Primitive (raw)   →   Semantic (의미)   →   Component (사용)
blue-500: #3182F6  →   --brand           →   .btn-primary { background: var(--brand) }
```

테마 전환은 Semantic 만 변경. Primitive 는 그대로.

---

## 3. 컬러

### 3.1 브랜드 / Primary
| 토큰 | Light | 비고 |
|---|---|---|
| `--blue-50` | `#E8F3FF` | soft bg |
| `--blue-500` | `#3182F6` | 기본 인터랙티브 |
| `--blue-600` | `#2272EB` | hover/pressed |
| `--brand` | `var(--blue-500)` | alias |
| `--brand-hover` | `var(--blue-600)` | |
| `--brand-soft` | `var(--blue-50)` | |
| `--brand-softer` | `#F4F8FE` | |

### 3.2 Neutrals (warm undertone)

| 토큰 | Light | 용도 |
|---|---|---|
| `--grey-900` | `#191F28` | primary heading |
| `--grey-800` | `#333D4B` | strong label |
| `--grey-700` | `#4E5968` | emphasized body |
| `--grey-600` | `#6B7684` | body |
| `--grey-500` | `#8B95A1` | caption |
| `--grey-400` | `#B0B8C1` | placeholder |
| `--grey-300` | `#D1D6DB` | strong border |
| `--grey-200` | `#E5E8EB` | default border |
| `--grey-100` | `#F2F4F6` | secondary bg |
| `--grey-50` | `#F9FAFB` | lightest bg |
| `--white` | `#FFFFFF` | |

### 3.3 Semantic

| 토큰 | 색 | 용도 |
|---|---|---|
| `--success` / `-soft` | `#03B26C` / `#E4F6ED` | 출근 완료, 승인 |
| `--warn` / `-soft` | `#FE9800` / `#FFF1DD` | 연차 |
| `--caution` / `-soft` | `#FFC342` / `#FFF6E0` | 휴게 |
| `--danger` / `-soft` | `#F04452` / `#FDE7E9` | 거절, 에러 |
| `--info` / `-soft` | `#18A5A5` / `#DFF1F1` | 정보 |
| `--purple` / `-soft` | `#A234C7` / `#F0DFF6` | 특별 카테고리 |

### 3.4 팀 상태

| 토큰 | 매핑 | 의미 |
|---|---|---|
| `--s-office` | `--success` | 본사 |
| `--s-wfh` | `--blue-500` | 재택 |
| `--s-leave` | `--warn` | 연차 |
| `--s-break` | `--caution` | 휴게 |
| `--s-off` | `--grey-400` | 퇴근/오프 |

### 3.5 다크 / 테마 변형

`body.theme-dark`, `body.theme-mint`, `body.theme-violet`, `body.theme-coral` 클래스로 Semantic 재정의. 자세한 값은 `tokens.css` 참조.

---

## 4. 타이포그래피

### 4.1 폰트 스택
```css
--font-kr:  'Toss Product Sans', 'Pretendard', -apple-system, BlinkMacSystemFont,
            'Apple SD Gothic Neo', 'SF Pro Display', Roboto, 'Noto Sans KR', sans-serif;
--font-num: 'Toss Product Sans', 'Pretendard', 'SF Pro Display', system-ui, sans-serif;
--font-mono:'SF Mono', SFMono-Regular, Menlo, Consolas, monospace;
```

### 4.2 타입 스케일 (utility class)

| Class | size / weight / line-height |
|---|---|
| `.t-display-hero` | 30 / 700 / 40 |
| `.t-display-lg` | 26 / 700 / 36 |
| `.t-heading-lg` | 22 / 700 / 30 |
| `.t-heading` | 20 / 600 / 28 |
| `.t-subtitle` | 16 / 600 / 24 |
| `.t-body-lg` | 16 / 400 / 24 |
| `.t-body` | 14 / 400 / 22 |
| `.t-body-strong` | 14 / 600 / 22 |
| `.t-body-sm` | 13 / 400 / 20 |
| `.t-caption` | 12 / 400 / 18 |
| `.t-caption-strong` | 12 / 600 / 18 |
| `.t-label` | 13 / 700 / 20 |

### 4.3 숫자 전용

| Class | 설명 |
|---|---|
| `.t-number-xl` | 40px / 700 / tabular |
| `.t-number-lg` | 30px / 700 / tabular |
| `.t-number-md` | 22px / 700 / tabular |

룰: 숫자는 700 + `tabular-nums`. 본문(400) 과 절대 섞지 않는다.

### 4.4 사용자 폰트 크기

```css
body.font-sm { font-size: 14px; }
body.font-md { font-size: 15px; }   /* 기본 */
body.font-lg { font-size: 17px; }
```

---

## 5. Spacing / Radius / Shadow

### 5.1 Spacing (8px 기반)

| 토큰 | 값 |
|---|---|
| `--sp-1` | 4 |
| `--sp-2` | 8 |
| `--sp-3` | 12 |
| `--sp-4` | 16 |
| `--sp-5` | 20 (기본 가로 패딩) |
| `--sp-6` | 24 |
| `--sp-8` | 32 |
| `--sp-10` | 40 |
| `--sp-12` | 48 |

### 5.2 Radius

| 토큰 | 값 | 용도 |
|---|---|---|
| `--r-xs` | 4 | 배지 |
| `--r-sm` | 8 | input, 작은 버튼 |
| `--r-md` | 12 | 표준 카드, dialog |
| `--r-lg` | 16 | featured 카드, bottom sheet |
| `--r-xl` | 20 | 큰 카드, 모달 |
| `--r-pill` | 9999 | 칩, 스위치 |

### 5.3 Shadow (단일 레이어 · 검정 · 낮은 투명도)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--shadow-1` | `0 1px 3px rgba(0,0,0,0.06)` | 기본 카드 |
| `--shadow-2` | `0 2px 8px rgba(0,0,0,0.08)` | hover |
| `--shadow-3` | `0 4px 12px rgba(0,0,0,0.12)` | floating sheet, toast |
| `--shadow-4` | `0 8px 24px rgba(0,0,0,0.16)` | modal, focus |

컬러 그림자 금지.

---

## 6. 모션

### 6.1 Duration
| 토큰 | 값 |
|---|---|
| `--motion-instant` | 0 |
| `--motion-fast` | 150ms |
| `--motion-standard` | 250ms |
| `--motion-slow` | 400ms |
| `--motion-page` | 350ms |

### 6.2 Easing
| 토큰 | 값 |
|---|---|
| `--ease-enter` | `cubic-bezier(0.0, 0.0, 0.2, 1)` |
| `--ease-exit` | `cubic-bezier(0.4, 0.0, 1, 1)` |
| `--ease-standard` | `cubic-bezier(0.4, 0.0, 0.2, 1)` |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

### 6.3 Reduce motion

`@media (prefers-reduced-motion: reduce)` 시 모든 모션 토큰을 0 으로 collapse. CSS 에서 자동 처리.

---

## 7. 컴포넌트 (구현 가이드)

핸드오프의 `_design/remix/project/hifi/component-specs.jsx` 가 권위 있는 spec.

각 컴포넌트는 다음을 포함:
- **Variants**: 외형 분류 (e.g., `primary`, `secondary`, `ghost`)
- **States**: `default`, `hover`, `active`, `focus`, `disabled`, `loading`
- **Sizes**: `sm`, `md`, `lg`
- **Anatomy**: 내부 구조 (icon-left, label, badge 등)
- **Props**: TypeScript interface
- **a11y**: keyboard, ARIA, screen reader

### 7.1 MVP 컴포넌트 목록

- Button (primary / secondary / ghost / destructive)
- Input · Field (text, password, search, with adornment)
- Chip · Badge · Status Dot
- Switch · Checkbox · Radio

### 7.2 Switch (토글)

> 구현 위치: `apps/web/src/shared/ui/Switch.tsx` (W4d)
> 관련 finding: F-DESIGN-013

#### Usage

```tsx
// Boolean (2-state)
<Switch checked={value} onChange={setValue} label="52시간 초과 차단" />

// Disabled
<Switch checked={true} disabled label="변경 불가" />
```

#### Props

```ts
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;            // 우측 텍스트 레이블 (SR 도 사용)
  disabled?: boolean;
  size?: 'sm' | 'md';       // 기본 'md'
  id?: string;               // label[htmlFor] 연결용
}
```

#### Variants & States

| 상태 | 외형 |
|---|---|
| OFF default | `--grey-200` track, `--white` thumb |
| ON default | `--brand` track, `--white` thumb |
| OFF hover | `--grey-300` track |
| ON hover | `--brand-hover` track |
| Focus (keyboard) | `box-shadow: 0 0 0 3px var(--brand-soft)` (focus ring, `--r-pill`) |
| Disabled OFF | `--grey-100` track, `--grey-300` thumb, `opacity: 0.5` |
| Disabled ON | `--brand-soft` track, `--white` thumb, `opacity: 0.5` |

#### 크기 (Size)

| Size | Track w×h | Thumb diameter | 전체 hit-target |
|---|---|---|---|
| `md` (기본) | 44×24 px | 20px | 44×44 px (터치 최솟값 준수) |
| `sm` | 32×18 px | 14px | 32×32 px |

> hit-target 44×44 px 미만 금지 (WCAG 2.5.8 / design-system 원칙).

#### Focus Ring

키보드 탐색 시 항상 가시적 focus ring 을 표시한다.

```css
.switch:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--brand-soft);
}
```

`outline: none` 단독 사용 금지.

#### Motion

thumb 이동: `transition: transform var(--motion-fast) var(--ease-standard)`.
track 색상: `transition: background-color var(--motion-fast) var(--ease-standard)`.
`prefers-reduced-motion: reduce` → duration 0.

#### Contrast

- OFF 상태 track (`--grey-200`) 과 배경(`--white`) 의 대비: 1.5:1 (비인터랙티브 경계선 — WCAG AA 면제).
- ON 상태 `--brand` (`#3182F6`) 와 thumb `--white`: 3.0:1 이상 (비텍스트 UI component WCAG AA 기준).
- label 텍스트: `--grey-800` 기본 — 배경 대비 7:1 이상.

#### a11y

```tsx
<button
  role="switch"
  aria-checked={checked}
  aria-label={label}
  aria-disabled={disabled}
  tabIndex={disabled ? -1 : 0}
>
```

- `role="switch"` + `aria-checked` 사용.
- `Space` 키로 토글 가능해야 한다.
- label 이 없을 경우 `aria-label` 필수.
- Card (basic / interactive / hero)
- Avatar · List Item
- Tabs · Segment · Pagination
- DatePicker · DateRange · Inline Calendar
- Select · Menu · Search Combobox
- Modal · Bottom Sheet · Dialog
- Toast · Banner · Tooltip

### 7.3 폴더 구조

```
apps/web/src/components/
├── tokens/                # 토큰 export (TS 매핑)
├── primitives/            # 단일 책임 (Button, Input, ...)
├── patterns/              # 조합 (PageHeader, ListItem, EmptyState)
└── feedback/              # Toast, Banner, Modal 등
```

---

## 8. 상태 디자인 (State Design)

모든 데이터 화면은 다음 상태를 정의해야 한다.

| 상태 | 패턴 |
|---|---|
| Empty | 일러스트 + 안내 + 1차 액션 |
| Loading | skeleton (목록), spinner (액션) |
| Error | 에러 메시지 + 재시도 / 새로고침 |
| Success | 토스트 또는 success 화면 (제출 완료 등) |

원본: `_design/remix/project/hifi/system.jsx` (`SysStates`).

---

## 9. 접근성 (a11y)

- WCAG 2.1 AA 준수
- 색약 대응: 상태는 색 + 아이콘 / 라벨
- 키보드 네비게이션: 모든 인터랙티브 요소 tabindex 적절히
- focus ring: 항상 보이게 (특히 키보드 사용자)
- screen reader: 의미있는 alt / aria-label
- 폰트 크기 3단계 사용자 설정

---

## 10. 다크 모드

- 시스템 prefers-color-scheme 자동 감지 (옵션)
- 사용자 명시 설정 우선
- Semantic 토큰만 변경 — Primitive 는 동일
- 그림자는 다크에서도 검정 (단, 더 강한 투명도 허용)

---

## 11. i18n

- 키는 dot notation (`leave.balance.title`)
- 복수형은 ICU MessageFormat (`{count, plural, one {1일} other {#일}}`)
- 한 화면에 하드코딩 문자열 없음 — lint 룰로 검출

---

## 12. 토큰 → Tailwind 매핑 (예시)

```ts
// apps/web/tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: 'var(--brand)',
        'brand-hover': 'var(--brand-hover)',
        'brand-soft': 'var(--brand-soft)',
        success: 'var(--success)',
        warn: 'var(--warn)',
        // ...
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        pill: 'var(--r-pill)',
      },
      boxShadow: {
        1: 'var(--shadow-1)',
        2: 'var(--shadow-2)',
        3: 'var(--shadow-3)',
        4: 'var(--shadow-4)',
      },
    },
  },
};
```

CSS 변수를 단일 진실로 두면 테마 전환이 무한히 단순해진다.
