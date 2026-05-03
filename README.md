# 근무 관리 시스템 (Work Manager)

토스 디자인 시스템 기반의 모바일 우선 근무 관리 플랫폼.

> **상태**: 기획 단계 (Phase 0 — 문서화)
> **목표**: MVP 이상의 완성도를 갖춘 운영 가능한 서비스

---

## 핵심 기능

| 영역 | 설명 |
|---|---|
| 출퇴근 체크 | 위치 기반 자동 감지 + 사용자 확인 (본사 / 재택) |
| 연차 자동화 | 입사일 / 근속연수 기반 자동 발생 · 소멸 전 자동 안내 |
| 초과근무 승인 | 정규 근무시간 외 자동 승인 요청을 상급자에게 전송 |
| 팀 상태 가시성 | 전 직원의 실시간 근무 상태(본사 / 재택 / 휴게 / 연차 / 퇴근) |
| 다국어 | 한글 / 영문 동등 지원 (i18n) |
| 관리자 | 승인 대기 통합, 직원 관리, 월간 / 주간 근태 리포트 |

---

## 기술 스택

| 레이어 | 기술 | 비고 |
|---|---|---|
| Frontend (Web) | React 18 + TypeScript + Vite | Toss Pretendard, CSS Variables 토큰 |
| Backend | Django 5 + Django REST Framework | PostgreSQL, Celery, Redis |
| Mobile App | Flutter (WebView) | 단일 React 코드베이스를 호스팅 |
| Desktop App | Electron | 메뉴바 / 트레이 알림, 자동 출퇴근 트리거 |
| Infra | Docker + Nginx + AWS (RDS · ElastiCache · S3) | CI/CD GitHub Actions |
| 인증 | JWT (Access / Refresh) + OAuth2 (Google · Kakao) | |

자세한 구조: [`docs/architecture/architecture.md`](docs/architecture/architecture.md)

---

## 저장소 구조

```
work-manager/
├── README.md                  # 본 문서
├── docs/                      # 기획 문서 (Spec / API / Architecture / Ops)
│   ├── README.md
│   ├── specs/                 # 기능 명세서
│   ├── api/                   # API 명세서
│   ├── architecture/          # 아키텍처 설계도
│   ├── operations/            # 운영 유의사항 / 런북
│   └── design/                # 디자인 시스템 요약
├── _design/                   # 원본 디자인 핸드오프 (claude.ai/design)
├── apps/
│   ├── web/                   # React (Vite) — 모바일 / 웹 / 관리자 통합 SPA
│   ├── mobile/                # Flutter WebView 셸
│   └── desktop/               # Electron 셸
├── services/
│   └── api/                   # Django + DRF
└── infra/                     # Docker, Terraform, Nginx, GitHub Actions
```

---

## 빠른 시작 (예정)

```bash
# Backend
cd services/api && python -m venv .venv && .venv/Scripts/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000

# Frontend
cd apps/web && pnpm install && pnpm dev
```

---

## 문서

- [기능 명세서](docs/specs/feature-spec.md)
- [API 명세서](docs/api/api-spec.md)
- [아키텍처 설계도](docs/architecture/architecture.md)
- [데이터 모델](docs/architecture/data-model.md)
- [운영 유의사항](docs/operations/operations-guide.md)
- [디자인 시스템](docs/design/design-system.md)
- [로드맵](docs/roadmap.md)

---

## 라이선스

Proprietary — Molcube © 2026
