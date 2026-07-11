# 과제5 설계·보안 기록

> Supabase는 사용하지 않았지만 인증, 권한, 사용자별 데이터 제한을 직접 구현했기 때문에 별도 설계·보안 기록을 작성합니다.  
> 최종 문서 수정일: 2026-07-11

---

## 1. 시스템 구성

```text
React 클라이언트
    ↓ HTTP 요청 + JWT
Express API 서버
    ↓ SQL
SQLite 데이터베이스
```

| 항목 | 적용 내용 |
|---|---|
| DB | SQLite |
| DB 파일 | `data/study.db` |
| 백엔드 | Node.js + Express |
| 비밀번호 | bcryptjs 해시 |
| 인증 | JWT |
| 로그아웃 | `jti` 기반 토큰 폐기 |
| 권한 | `admin`, `user` |
| 사용자별 접근 제한 | Express 미들웨어 + SQL `user_id` 조건 |
| 관리자 생성 | 서버의 `create-admin` 스크립트 |
| CORS | `CLIENT_URL` 허용 출처 제한 |
| Supabase/RLS | 미사용 |

---

## 2. 테이블 설계

### 2-1. `users`

| 컬럼 | 역할 |
|---|---|
| `id` | 사용자 고유 ID |
| `email` | 로그인 이메일, UNIQUE |
| `password_hash` | bcryptjs 해시 |
| `nickname` | 화면에 표시할 닉네임 |
| `role` | `admin` 또는 `user` |
| `created_at` | 생성 시각(UTC) |

정책:

- 공개 회원가입은 항상 `user`입니다.
- `Admin` 닉네임은 일반 사용자가 사용할 수 없습니다.
- 관리자는 생성 스크립트에서 닉네임을 `Admin`으로 고정합니다.
- 닉네임은 현재 UNIQUE가 아니므로 중복될 수 있습니다.

### 2-2. `studies`

| 컬럼 | 역할 |
|---|---|
| `id` | 학습 기록 ID |
| `user_id` | 작성자 ID |
| `title` | 학습 주제 |
| `study_minutes` | 총 학습 시간(분) |
| `understanding` | 이해도 |
| `memo` | 메모 |
| `created_at` | 생성 시각(UTC) |
| `updated_at` | 수정 시각(UTC) |

외래키:

```sql
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE
```

사용자가 삭제되면 해당 사용자의 학습 기록도 함께 삭제됩니다.

### 2-3. `revoked_tokens`

| 컬럼 | 역할 |
|---|---|
| `jti` | 폐기한 JWT 고유 ID |
| `expires_at` | JWT 만료 시각 |

만료된 폐기 기록은 인증 요청 시 정리합니다.

---

## 3. 역할별 권한 정책

| 역할 | 허용 | 차단 |
|---|---|---|
| 비로그인 | 회원가입, 로그인, health check | 학습 기록·관리자 API |
| `user` | 본인 학습 CRUD, 로그아웃, 회원 탈퇴 | 관리자 API, 다른 사용자 데이터 |
| `admin` | 사용자 목록, 대상 사용자 삭제, 로그아웃, 회원 탈퇴 | 학습 기록 CRUD |
| 관리자 자신 | 관리자 화면 이용 | 관리자 삭제 API로 자기 계정 삭제 |

프론트 화면도 역할별로 분기하지만, 실제 보안 판단은 백엔드가 수행합니다.

---

## 4. 인증 흐름

```text
1. 사용자가 회원가입 또는 로그인
2. 서버가 입력값과 비밀번호를 검증
3. 서버가 userId, email, nickname, role, jti, exp를 포함한 JWT 발급
4. 클라이언트가 JWT를 localStorage에 저장
5. 공통 http 모듈이 Authorization 헤더 자동 추가
6. requireAuth가 서명, 만료, jti 폐기 여부 검증
7. req.user와 req.auth에 검증된 값 저장
8. requireUser 또는 requireAdmin이 역할 검사
9. 라우트와 모델에서 요청 처리
```

요청 헤더:

```text
Authorization: Bearer <token>
```

---

## 5. 로그아웃과 토큰 폐기

JWT는 서버가 발급 후 자동으로 삭제할 수 있는 세션 파일이 아니므로 별도의 폐기 목록을 사용합니다.

```text
로그인
→ 고유 jti가 포함된 JWT 발급
→ 로그아웃 API 호출
→ jti와 exp를 revoked_tokens에 저장
→ 이후 같은 토큰 요청
→ requireAuth가 폐기 목록 확인
→ 401 반환
```

장점:

- 로그아웃한 현재 토큰의 재사용을 막을 수 있습니다.
- 서버를 재시작해도 SQLite에 폐기 정보가 남습니다.

한계:

- 사용자별 활성 토큰 전체 목록을 저장하지 않으므로 “모든 기기에서 로그아웃”은 지원하지 않습니다.
- 관리자가 사용자를 삭제해도 그 사용자의 기존 JWT를 사용자 단위로 모두 폐기하지는 못합니다.
- 토큰에 포함된 nickname/role은 토큰 만료 또는 재로그인 전까지 유지됩니다.

---

## 6. 사용자별 학습 기록 제한

조회:

```sql
SELECT ...
FROM studies
WHERE user_id = ?
```

단건 확인:

```sql
SELECT ...
FROM studies
WHERE id = ?
AND user_id = ?
```

수정:

```sql
UPDATE studies
SET ...
WHERE id = ?
AND user_id = ?
```

삭제:

```sql
DELETE FROM studies
WHERE id = ?
AND user_id = ?
```

따라서 다른 사용자가 기록 ID를 알아도 본인의 `user_id`와 다르면 조회·수정·삭제할 수 없습니다.

---

## 7. 관리자 생성 보안

최종 방식은 공개 회원가입 API에서 관리자 역할을 부여하지 않는 것입니다.

```text
공개 POST /api/auth/signup
→ 항상 role = user
```

관리자 생성:

```bash
cd server
npm run create-admin
```

스크립트는 다음 환경변수를 읽습니다.

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=초기_관리자_비밀번호
```

생성 이후 `ADMIN_PASSWORD`를 `.env`에서 삭제할 수 있습니다.

기존에 검토했던 `ADMIN_SIGNUP_CODE` 방식은 최종 구현에서 사용하지 않았습니다. 이메일과 가입 코드를 아는 사람이 공개 API를 호출할 위험을 줄이기 위해 로컬 스크립트 방식으로 변경했습니다.

---

## 8. 비밀번호와 환경변수

- 비밀번호는 bcryptjs로 해싱한 값만 저장합니다.
- `JWT_SECRET`, 관리자 초기 비밀번호를 코드에 작성하지 않습니다.
- `.env`는 `.gitignore`에 포함합니다.
- README에는 예시 값만 기록합니다.
- 로그, 캡처, 제출 문서에 토큰·비밀번호·JWT secret을 노출하지 않습니다.
- 배포 환경에서는 로컬 개발용 값보다 긴 secret을 사용합니다.

---

## 9. CORS

개발 중 모든 출처를 허용하는 다음 설정은 사용하지 않습니다.

```js
app.use(cors());
```

허용할 프론트 주소를 환경변수로 제한합니다.

```js
app.use(
    cors({
        origin: process.env.CLIENT_URL,
    }),
);
```

주의:

- CORS는 브라우저의 교차 출처 요청을 제한하는 기능입니다.
- curl, Postman, 서버 프로그램의 요청을 막는 인증 기능은 아닙니다.
- 실제 보호는 JWT와 역할 미들웨어가 담당합니다.

---

## 10. 프론트 토큰 저장

현재 Access Token은 `localStorage`에 저장합니다.

장점:

- 구현이 단순합니다.
- 새로고침 후 토큰을 읽어 사용자 상태를 복원할 수 있습니다.

한계:

- XSS가 발생하면 토큰이 탈취될 수 있습니다.
- 실제 서비스에서는 CSP, 입력값 안전 처리, 짧은 Access Token, HttpOnly Refresh Token 등을 검토해야 합니다.

---

## 11. 시간대 처리

SQLite의 `CURRENT_TIMESTAMP`는 UTC입니다.

저장:

```text
2026-07-11 02:30:00
```

프론트 표시:

```js
new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    ...
})
```

DB에는 UTC를 유지하고 표시 시점에 한국 시간으로 변환하여 서버 지역과 관계없이 일관되게 처리합니다.

---

## 12. 검증 시나리오

| 번호 | 시나리오 | 기대 결과 | 문서 상태 |
|---:|---|---|---|
| 1 | 토큰 없이 `/api/studies` | 401 | 구현 반영 |
| 2 | user가 `/api/admin/users` | 403 | 구현 반영 |
| 3 | admin이 `/api/studies` | 403 | 구현 반영 |
| 4 | user가 본인 기록 CRUD | 성공 | 구현 반영 |
| 5 | user가 타인 기록 ID로 수정/삭제 | 404 또는 변경 없음 | 최종 직접 테스트 권장 |
| 6 | admin이 사용자 목록 조회 | 성공 | 구현 반영 |
| 7 | admin이 다른 사용자 삭제 | 성공 | 구현 반영 |
| 8 | admin이 자신의 ID를 관리자 삭제 API로 삭제 | 400 | 구현 반영 |
| 9 | 로그아웃 토큰 재사용 | 401 | 최종 직접 테스트 권장 |
| 10 | 회원 탈퇴 | 사용자와 studies 연쇄 삭제 | 최종 직접 테스트 권장 |
| 11 | 일반 사용자가 Admin 닉네임으로 가입 | 400 | 구현 반영 |
| 12 | 회원가입 API로 admin 생성 시도 | user로만 생성 | 구현 반영 |

---

## 13. 알려진 한계와 개선 방향

| 한계 | 현재 이유 | 개선 방향 |
|---|---|---|
| localStorage 토큰 | 학습용 구현 단순화 | HttpOnly Refresh Token 구조 |
| 사용자별 전체 토큰 폐기 없음 | 활성 세션 테이블 미구현 | 사용자 ID 기반 session/token table |
| 삭제 사용자 토큰 일괄 무효화 없음 | blacklist가 jti 단위 | user token version 또는 세션 삭제 |
| rate limiting 없음 | 과제 범위 | 로그인·회원가입 요청 제한 |
| 이메일 인증 없음 | 과제 범위 | 인증 메일과 인증 상태 컬럼 |
| 비밀번호 재설정 없음 | 과제 범위 | 일회성 재설정 토큰 |
| HTTPS 미적용 | 로컬 환경 | 배포 시 HTTPS 강제 |
| 닉네임 중복 허용 | 요구사항 없음 | UNIQUE 또는 중복 확인 API |
| 입력 길이 제한이 제한적 | 기본 검증 중심 | 이메일·닉네임·제목·메모 최대 길이 |
| 감사 로그 없음 | 과제 범위 | 관리자 삭제 이력 저장 |

---

## 14. Supabase RLS와 비교

| 항목 | Supabase RLS | 이번 프로젝트 |
|---|---|---|
| 권한 적용 | DB policy | Express 미들웨어와 SQL 조건 |
| 사용자 식별 | `auth.uid()` | JWT의 `req.user.id` |
| 데이터 제한 | RLS | `WHERE user_id = ?` |
| 관리자 권한 | policy/claim | `requireAdmin` |
| 로그아웃 | Supabase session | `jti` 폐기 테이블 |
| 실행 환경 | Supabase 프로젝트 필요 | Node + SQLite 파일 |

이번 프로젝트는 RLS를 사용하지 않았으며, 유사한 사용자별 제한을 애플리케이션 서버 계층에서 구현했습니다.
