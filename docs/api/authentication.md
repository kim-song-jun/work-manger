# 인증 & 권한 (Authentication & Authorization)

---

## 1. 토큰 모델

JWT 기반의 Access + Refresh 듀얼 토큰.

| 토큰 | 위치 | TTL | 용도 |
|---|---|---|---|
| `access_token` | `Authorization: Bearer ...` 헤더 | **30분** | 모든 API 호출 |
| `refresh_token` | HTTPOnly Secure Cookie (웹) / 안전 저장소 (앱) | **14일** | Access 재발급 |

### Access Token Claims
```json
{
  "sub": "<user_id>",
  "mid": "<membership_id>",      // 활성 멤버십
  "cid": "<company_id>",
  "role": "EMPLOYEE",
  "loc": "ko",
  "iat": 1714800000,
  "exp": 1714801800,
  "jti": "<uuid>"
}
```

### Refresh Token
- Opaque 토큰 (랜덤 256bit). DB 에서 검증.
- Rotation 정책: refresh 사용 시 새 refresh 발급, 이전 토큰 즉시 무효화.
- 도난 감지: 동일 refresh 가 두 번 사용되면 해당 family 전체 무효화 + 사용자에게 알림.

---

## 2. 패스워드

- 해시: **bcrypt** cost=12 (CPU 예산 따라 조정)
- 정책: 8자 이상, 영문 + 숫자 + 특수문자 포함
- 이전 5개 비밀번호 재사용 금지 (옵션)
- 5회 연속 실패 시 15분 잠금 (점진적 백오프)

---

## 3. OAuth2

### Provider
- Google
- Kakao

### Flow
- Authorization Code with PKCE (SPA 안전)
- 콜백에서 회사 가입 안내 (회사 코드 입력 단계로 이동)

### 계정 연동
- 이메일이 일치하면 기존 계정에 자동 연동 (이메일 인증 완료 시)

---

## 4. 권한 매트릭스

| 도메인 | EMPLOYEE | MANAGER | ADMIN | OWNER |
|---|:---:|:---:|:---:|:---:|
| 본인 출퇴근 | ✅ | ✅ | ✅ | ✅ |
| 본인 연차 신청 | ✅ | ✅ | ✅ | ✅ |
| 팀 상태 조회 (소속 부서) | ✅ | ✅ | ✅ | ✅ |
| 전사 상태 조회 | ❌ | ❌ | ✅ | ✅ |
| 팀원 신청 승인 | ❌ | ✅ (직속) | ✅ | ✅ |
| 직원 등록 / 수정 | ❌ | ❌ | ✅ | ✅ |
| 연차 정책 변경 | ❌ | ❌ | ✅ | ✅ |
| 회사 설정 / 빌링 | ❌ | ❌ | ❌ | ✅ |
| 권한 위임 | ❌ | ❌ | ❌ | ✅ |

> Backend 는 모든 보호된 엔드포인트에 데코레이터/미들웨어로 권한 체크. 프론트는 UX 가이드일 뿐 실 권한은 서버 단일 진실(Single Source of Truth).

---

## 5. 보안 헤더 (응답)

| 헤더 | 값 |
|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | (별도 정의, 웹 프론트와 협의) |

CORS: 허용 origin 화이트리스트만. credentials 허용은 신뢰된 서브도메인만.

---

## 6. CSRF

- API 가 cookie 인증을 사용하는 경우 (웹 SPA) `X-CSRF-Token` 더블 서밋 패턴
- Mobile / Desktop 은 헤더 토큰만 사용 → CSRF 비대상

---

## 7. 토큰 무효화

- 사용자 로그아웃: 해당 refresh 만 무효화
- 비밀번호 변경 / 비밀번호 리셋 / 2FA 변경: 모든 refresh 무효화
- 관리자가 계정 비활성화: 모든 토큰 무효화
- Access token 은 stateless. 즉시 무효화가 필요한 케이스에 대비해 `jti` 블랙리스트 (Redis, TTL = access TTL)

---

## 8. 2FA (v1.x)

- TOTP (Authy / Google Authenticator)
- 회복 코드 10개 1회용 발급
- 관리자/오너는 강제 활성화 옵션

---

## 9. 감사 로그 (Audit)

다음 이벤트는 별도 `audit_log` 테이블에 기록 (변경 불가, append-only).

- 로그인 성공 / 실패
- 비밀번호 변경
- 권한 변경
- 직원 등록 / 비활성화
- 연차 정책 변경
- 회사 설정 변경
- 데이터 내보내기

보존: 최소 1년 (회사 설정 가능, 최대 7년).
