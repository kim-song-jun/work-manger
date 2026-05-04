# ADR-005 · 디자인 토큰(Design Tokens) = CSS 변수 + Tailwind 가 변수 참조

- **Status**: Accepted
- **Date**: 2026-05-04
- **Authors**: @design-lead, @frontend-lead

## Context

근무 관리 시스템은 Toss 스타일의 정밀한 디자인 시스템을 갖췄다. `docs/design/design-system.md` 가 가이드, `apps/web/src/shared/styles/tokens.css` 가 단일 소스(Single Source of Truth) 다.

요구사항:

- **단일 소스**: 디자이너가 토큰 값을 바꾸면 모든 UI에 반영. 두 곳에서 정의되는 일이 없어야 함.
- **Tailwind 와 호환**: 팀이 Tailwind utility class (`bg-brand`, `text-ink-700`) 를 즐겨 사용. 토큰을 Tailwind theme 으로도 노출해야 함.
- **3가지 셸에서 동일 토큰**: 웹 / Flutter WebView / Electron 모두 같은 SPA → 같은 CSS → 같은 토큰.
- **테마 스위칭(theme switching)**: 라이트/다크 + 회사별 브랜드 색 override 가능성. 미래 확장.
- **런타임 변경 가능**: 사용자/회사 설정에 따른 강조색 변경(예: 회사 브랜드 컬러 매핑) 을 빌드 없이.

`tokens.css` (약 110줄) 의 구조 (현재):

```css
:root {
  /* Primitive */
  --blue-500: #3182F6;
  --grey-900: #191F28;
  /* ... */

  /* Semantic */
  --brand:        var(--blue-500);
  --brand-hover:  var(--blue-600);
  --success: #03B26C; --success-soft: #E4F6ED;
  --danger:  #F04452; --danger-soft:  #FDE7E9;

  /* Status (team) */
  --s-office: var(--success);
  --s-wfh:    var(--blue-500);

  /* Elevation / Radii / Spacing / Motion / Typography */
  --shadow-2: 0 2px 8px rgba(0,0,0,0.08);
  --r-md: 12px;
  --sp-4: 16px;
  --motion-standard: 250ms;
}
```

`apps/web/tailwind.config.ts` (50줄):

```ts
theme: {
  extend: {
    colors: {
      brand: "var(--brand)",
      "brand-hover": "var(--brand-hover)",
      ink: { 900: "var(--grey-900)", 800: "var(--grey-800)", ... },
      success: "var(--success)",
      danger: "var(--danger)",
    },
    borderRadius: { md: "var(--r-md)", ... },
    boxShadow: { 2: "var(--shadow-2)", ... },
    fontFamily: { sans: ["Pretendard", ...] },
  },
},
```

## Decision

**`tokens.css` 의 CSS 사용자 정의 속성(CSS Custom Properties / CSS Variables) 가 디자인 토큰의 단일 소스 정의(canonical definition) 다.** Tailwind theme 은 그 변수들을 **참조만** 한다(직접 값 정의 금지). 컴포넌트 / 화면 코드는 Tailwind utility class 또는 `var(--...)` 둘 다 사용 가능.

규칙:

1. 모든 색상 / 라운드 / 그림자 / 간격 / 모션 토큰은 `apps/web/src/shared/styles/tokens.css` 에만 값 정의.
2. `tailwind.config.ts` 는 `colors`, `borderRadius`, `boxShadow` 등에서 항상 `var(--...)` 를 참조. 절대 hex/px/ms 직접 쓰지 않음.
3. 컴포넌트는 의미 있는 토큰(semantic) 우선 사용 (`--brand`, `--ink-700`, `--s-office`). 원자(primitive) 토큰(`--blue-500`) 은 토큰 파일 내부 구성에만.
4. 테마 변형(라이트/다크/브랜드)은 `:root[data-theme='dark']` 또는 `:root[data-brand='molcube']` 같은 CSS selector 로 변수만 재정의. JS / Tailwind config 변경 불필요.
5. 런타임 변경은 `document.documentElement.style.setProperty('--brand', companyColor)` 1줄로 가능.

## Alternatives Considered

### 1) Tailwind theme 이 토큰의 단일 소스 + CSS variable alias 만 추가

- **장점**:
  - Tailwind purge / IntelliSense 가 더 잘 동작. `bg-brand-500` 같은 자동완성에 모든 shade 가 노출.
  - `tailwind.config.ts` 한 곳만 보면 디자인 system 전체 파악.
- **단점**:
  - **런타임 테마 스위칭 불가**: Tailwind 가 빌드 타임에 클래스를 생성하므로, 사용자/회사별 강조색 override 가 빌드 없이 안 됨. 회사마다 다른 빌드를 만드는 건 비현실적.
  - 디자이너가 토큰 값 바꾸려면 TS 파일 수정 → 빌드 → 배포. CSS 한 줄로 끝나는 워크플로 손실.
  - Flutter WebView / Electron 셸에서 같은 SPA 가 동작 — 빌드 산출물 1개. 그 1개가 모든 회사를 지원하려면 런타임 테마가 사실상 필수.
  - 테마 미디어 쿼리 (`@media (prefers-color-scheme: dark)`) 가 Tailwind variant 로 가능하지만, 회사 브랜드 변형은 클래스 폭발(`brand-acme-500`, `brand-foo-500`).
- **결론**: 빌드 타임 단일성을 위해 런타임 유연성 / 운영 단순성을 잃는 trade-off. 채택 안 함.

### 2) CSS-in-JS (Emotion / styled-components) + JS 토큰 객체

- **장점**: 타입 안전한 토큰 객체. Storybook / 문서화 자동.
- **단점**:
  - 런타임 비용. SSR / hydration 복잡.
  - Tailwind 의 utility-first 워크플로 포기.
  - 팀이 이미 Tailwind 에 익숙.
- **결론**: 우리 워크플로 핏 아님.

### 3) Sass 변수

- **장점**: 익숙. preprocessing 시 컴파일.
- **단점**: 런타임 변경 불가(컴파일 타임 고정). CSS 변수의 핵심 이점을 잃음.
- **결론**: 시대를 거꾸로 가는 선택.

### 4) Design Token JSON (Style Dictionary) → 빌드 타임 출력

- **장점**: Figma / iOS / Android 토큰 동기화에 좋음. 다중 플랫폼 토큰 관리의 사실상 표준.
- **단점**:
  - 우리는 셸이 모두 SPA 호스팅이라 iOS/Android 네이티브 토큰이 거의 필요 없음(WebView 안에서 CSS 가 그대로 적용).
  - 추가 빌드 단계 / 디자이너 워크플로 변경 비용.
- **결론**: 셸이 풀 네이티브가 되는 v2~v3 시점에 재검토. 현재는 CSS 변수만으로 충분.

## Consequences

### 긍정적

- **단일 소스**: `tokens.css` 한 파일이 진실. 디자이너가 PR 한 줄 수정으로 모든 UI 반영.
- **런타임 테마 스위칭이 1줄**: `document.documentElement.setAttribute('data-theme', 'dark')` 또는 `style.setProperty('--brand', '#FF0000')`.
- **회사별 브랜딩 가능**: 회사 설정 로드 시 `--brand` 만 덮어쓰면 전체 화면이 자동 반영. 빌드 산출물 1개로 N 회사 지원.
- **Tailwind 의 DX 유지**: `bg-brand`, `rounded-md`, `shadow-2` 같은 익숙한 utility 그대로 작동.
- **JS 와 분리**: 런타임 색상 계산 비용 0. CSS 엔진이 처리.
- **Flutter WebView / Electron 동일 적용**: 셸이 CSS 를 건드리지 않음. SPA 가 받는 토큰 = 모든 셸에서 동일.
- **DevTools 친화**: Chrome/Safari DevTools 의 Computed Styles 에서 어떤 변수가 어떤 값으로 resolve 됐는지 즉시 확인.

### 부정적

- **Tailwind IntelliSense 의 색 미리보기 손실**: 자동완성이 `var(--brand)` 만 보여주고 색은 안 보여줌. 완화: Tailwind CSS IntelliSense 확장의 최신 버전이 CSS 변수 resolve 일부 지원, 또는 Storybook 으로 보완.
- **두 곳을 봐야 함**: 새 토큰 추가 시 `tokens.css` 에 정의 + `tailwind.config.ts` 에 mapping 추가. 완화: 코드 리뷰 체크리스트 + 추후 자동 동기화 스크립트(`tools/sync-tokens.ts`) 추가 가능.
- **shade 자동 생성 어려움**: Tailwind 의 `colors.brand.50 ~ 900` 같은 자동 음영 생성을 직접 해야 함. 완화: 디자이너가 모든 shade 를 토큰으로 명시 정의 (현재 `--blue-50/100/500/600/700` 만 정의 — 필요할 때 확장).
- **런타임 변경의 안전장치 필요**: JS 가 임의로 CSS 변수 변경 가능 → 코드 컨벤션으로 "테마 변경은 `lib/theme/` 어댑터만" 강제 필요. 완화: `apps/web/src/shared/lib/theme/` 모듈에서만 setProperty 허용, lint 룰로 강제 검토.
- **퍼지(purge) / 트리쉐이킹 약화**: Tailwind 가 클래스를 한 번만 생성 + 변수가 런타임 값 → 사용 안 하는 색 클래스도 번들에 남을 수 있음. 영향은 미미(현재 ~3KB 수준).

### 후속

- 다크 테마 도입 시: `tokens.css` 에 `:root[data-theme='dark'] { --brand: ...; --grey-900: ...; }` 추가. 한 파일.
- 회사 브랜딩 도입 시: `apps/web/src/shared/lib/theme/applyBrand.ts` (예정) 가 회사 설정 로드 후 `setProperty` 호출.
- 토큰의 변경은 `docs/design/design-system.md` 와 동기 PR. 디자인 리드 + 프론트 리드 승인 필수.
- Style Dictionary 도입 검토 시점: iOS/Android 네이티브 위젯이 늘어 SPA 외 토큰 소비처가 생길 때.
