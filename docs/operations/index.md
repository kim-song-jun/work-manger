# 운영 문서 인덱스 (Operations Index)

> 백엔드 / SRE / 온콜 / DPO / Mobile / Release Manager 가 사용하는 운영 문서 모음.

## 핵심 가이드

| 문서 | 용도 |
|---|---|
| [`operations-guide.md`](operations-guide.md) | 환경 / 배포 / 모니터링 / 보안 / 출시 체크리스트 — 모든 운영자 필독 |
| [`runbook.md`](runbook.md) | 장애 시나리오별 복구 절차 (R-001 ~ R-011) |
| [`ci-cd.md`](ci-cd.md) | CI / CD 파이프라인 상세 |

## 출시 체크리스트

[`operations-guide.md`](operations-guide.md) §11.1 — v1.0 MVP 출시 전 12개 항목의 현재 상태와 책임자.

## SOP (Standard Operating Procedures)

| SOP | 문서 | Owner |
|---|---|---|
| 신규 회사 온보딩 | [`sop/sop-onboard-new-company.md`](sop/sop-onboard-new-company.md) | Customer Success Lead |
| 사용자 데이터 export 요청 처리 | [`sop/sop-data-export-request.md`](sop/sop-data-export-request.md) | DPO / 보안 담당 |
| 사용자 데이터 삭제 요청 처리 | [`sop/sop-data-deletion-request.md`](sop/sop-data-deletion-request.md) | DPO / 보안 담당 |
| 비밀번호 강제 리셋 | [`sop/sop-emergency-password-reset.md`](sop/sop-emergency-password-reset.md) | Security Lead |
| 이메일 평판 회복 (SES bounce/complaint) | [`sop/sop-email-reputation-recovery.md`](sop/sop-email-reputation-recovery.md) | DevOps Lead |
| App Store / Play Store 긴급 업데이트 | [`sop/sop-app-store-emergency-update.md`](sop/sop-app-store-emergency-update.md) | Mobile Lead |

## 관련 문서

- 시스템 아키텍처: [`../architecture/architecture.md`](../architecture/architecture.md)
- 데이터 모델: [`../architecture/data-model.md`](../architecture/data-model.md)
- API 명세: [`../api/api-spec.md`](../api/api-spec.md)
- 인증 정책: [`../api/authentication.md`](../api/authentication.md)
- 의사결정 기록: [`../adr/`](../adr/README.md)

## 작성 / 갱신 규칙

- 새 SOP 추가 시: 이 인덱스 + `operations-guide.md` §12 양쪽 갱신.
- SOP 의 `Last Reviewed` 는 분기별 또는 운영 변경 시 갱신.
- 새 runbook 시나리오는 사후 보고서가 출처.
- 모든 문서 한국어 우선, 기술 용어는 영문 병기.
