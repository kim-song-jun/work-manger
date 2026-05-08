# 기획 문서 (Documentation)

근무 관리 시스템의 기획 · 설계 · 운영 문서.

## 구성

| 문서 | 위치 | 설명 |
|---|---|---|
| 기능 명세서 | [`specs/feature-spec.md`](specs/feature-spec.md) | 도메인별 기능 요구사항 · 사용자 플로우 · 비즈니스 룰 |
| 도메인 모델 | [`specs/domain-model.md`](specs/domain-model.md) | 핵심 도메인 / 엔티티 / 상태 전이 |
| 화면 명세 | [`specs/screen-catalog.md`](specs/screen-catalog.md) | 모바일 / 웹 / 관리자 화면 카탈로그 |
| API 명세서 | [`api/api-spec.md`](api/api-spec.md) | REST 엔드포인트 / 요청 · 응답 / 에러 코드 |
| API 인증 | [`api/authentication.md`](api/authentication.md) | JWT · OAuth2 · 권한 매트릭스 |
| 아키텍처 설계도 | [`architecture/architecture.md`](architecture/architecture.md) | 시스템 컴포넌트 · 통신 흐름 · 배포 토폴로지 |
| 데이터 모델 | [`architecture/data-model.md`](architecture/data-model.md) | 테이블 스키마 · 인덱스 · 마이그레이션 정책 |
| 운영 유의사항 | [`operations/operations-guide.md`](operations/operations-guide.md) | 배포 · 모니터링 · 백업 · 보안 · 장애 대응 |
| 운영 인덱스 | [`operations/index.md`](operations/index.md) | 핵심 가이드 + SOP + 출시 체크리스트 입구 |
| 런북 | [`operations/runbook.md`](operations/runbook.md) | 장애 시나리오별 복구 절차 (R-001 ~ R-011) |
| 운영 SOP | [`operations/sop/`](operations/sop/) | 온보딩 / 데이터 처리 / 보안 사고 / 평판 / 스토어 긴급 업데이트 |
| 로컬 3-플랫폼 가이드 | [`operations/local-3platform.md`](operations/local-3platform.md) | Web / Desktop / Mobile 로컬 검증 (docker-android WSA EOL 대안 포함) |
| 의사결정 기록 (ADR) | [`adr/README.md`](adr/README.md) | ADR-001 ~ ADR-005 (React SPA / Flutter WebView / Django / Postgres / 디자인 토큰) |
| 디자인 시스템 | [`design/design-system.md`](design/design-system.md) | 토큰 / 타이포 / 컴포넌트 / 모션 |
| E2E / UI 감사 | [`qa/e2e-ui-ux-audit.md`](qa/e2e-ui-ux-audit.md) | Docker E2E 시나리오 매트릭스 / UI·UX 비교 / 검증 게이트 |
| 관리자 매뉴얼 | [`manuals/admin.md`](manuals/admin.md) | ADMIN 역할 기능 가이드 + SOP 링크 |
| OWNER 매뉴얼 | [`manuals/owner.md`](manuals/owner.md) | 회사 정보 변경 · 데이터 export/삭제 SOP |
| 가입 코드 매뉴얼 | [`manuals/admin-company-codes.md`](manuals/admin-company-codes.md) | 발급 · 회수 · 보안 가이드 |
| 로드맵 | [`roadmap.md`](roadmap.md) | 마일스톤 · 우선순위 · 마감 |

### SOP 빠른 링크

| SOP | 문서 |
|---|---|
| 신규 회사 온보딩 | [`operations/sop/sop-onboard-new-company.md`](operations/sop/sop-onboard-new-company.md) |
| 사용자 데이터 export 요청 처리 | [`operations/sop/sop-data-export-request.md`](operations/sop/sop-data-export-request.md) |
| 사용자 데이터 삭제 요청 처리 | [`operations/sop/sop-data-deletion-request.md`](operations/sop/sop-data-deletion-request.md) |
| 비밀번호 강제 리셋 | [`operations/sop/sop-emergency-password-reset.md`](operations/sop/sop-emergency-password-reset.md) |
| 이메일 평판 회복 (SES) | [`operations/sop/sop-email-reputation-recovery.md`](operations/sop/sop-email-reputation-recovery.md) |
| App Store / Play 긴급 업데이트 | [`operations/sop/sop-app-store-emergency-update.md`](operations/sop/sop-app-store-emergency-update.md) |

### ADR 빠른 링크

| ADR | 문서 |
|---|---|
| ADR-001 React SPA 단일 코드베이스 + 셸 어댑터 | [`adr/ADR-001-react-spa-shell-adapter.md`](adr/ADR-001-react-spa-shell-adapter.md) |
| ADR-002 Flutter WebView 채택 | [`adr/ADR-002-flutter-webview-mobile.md`](adr/ADR-002-flutter-webview-mobile.md) |
| ADR-003 Django REST + Channels | [`adr/ADR-003-django-rest-channels.md`](adr/ADR-003-django-rest-channels.md) |
| ADR-004 PostgreSQL 단일 DB / 멀티 테넌트 v2 연기 | [`adr/ADR-004-postgres-single-db-multitenant-deferred.md`](adr/ADR-004-postgres-single-db-multitenant-deferred.md) |
| ADR-005 디자인 토큰 = CSS 변수 + Tailwind 참조 | [`adr/ADR-005-design-tokens-css-vars-tailwind.md`](adr/ADR-005-design-tokens-css-vars-tailwind.md) |

## 작성 규칙

1. **모든 문서는 한국어 우선**. 기술 용어는 원문 병기 (예: 인증(Authentication)).
2. 결정사항은 [`adr/`](adr/) 디렉토리에 ADR(Architecture Decision Record) 형식으로 보관.
3. 변경 시 반드시 PR 리뷰. `docs/` 변경은 `@product` + `@tech-lead` 승인 필수.
4. 문서 내 링크는 상대경로 사용. 외부 링크는 `참고 자료` 섹션에 모은다.
5. API 변경 시 `api/api-spec.md` + `api/changelog.md` 동시 업데이트.

## 버전 정책

`docs/` 의 메이저 버전은 제품 마일스톤과 일치한다.

| 제품 버전 | 단계 | 비고 |
|---|---|---|
| v0.x | Pre-MVP | 기획 · POC |
| v1.0 | MVP | 출퇴근 · 연차 · 팀 상태 · 관리자 핵심 기능 |
| v1.x | GA | 위젯 · 데스크탑 앱 · 컴플라이언스(52시간) |
| v2.x | Enterprise | SSO, 감사 로그, 다중 법인 지원 |
