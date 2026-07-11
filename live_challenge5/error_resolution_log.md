# 과제5 오류 해결 기록표

> 목적: 발생한 오류·경고·동작 문제의 원문 또는 증상, 원인, 수정 방법, 재실행 결과를 기록합니다.  
> 최종 문서 수정일: 2026-07-11

---

## 1. 오류 해결 요약

| 번호 | 단계 | 오류 메시지 또는 증상 | 원인 | 해결 | 결과 |
|---:|---|---|---|---|---|
| 1 | DB 스키마 변경 | `SqliteError: NOT NULL constraint failed: studies.user_id` | 기존 seed가 user_id 없이 insert | seed 제거, DB 재생성 | 서버 정상 실행 |
| 2 | 정적 파일 제공 | `ReferenceError: clientDistPath is not defined` | 경로 변수 선언 누락 | path와 dist/index 경로 선언 | 서버 정상 실행 |
| 3 | 회원가입 | `ReferenceError: createToken is not defined` | 토큰 함수 누락 | token.js 생성 및 import | token 반환 |
| 4 | React 수정폼 | `Calling setState synchronously within a effect can trigger cascading renders` | effect에서 여러 setState | 초기값 함수 + key 재마운트 | 경고 해소 |
| 5 | 폴더 경로 | `serever@1.0.0` 표시 | 폴더명 오타 | `server`로 수정 | 경로 통일 |
| 6 | 시간 컬럼 변경 | `study_time`과 `study_minutes` 혼재 | 저장 정책 변경 | DB 재생성, 총 분 기준 통일 | 구조 정리 |
| 7 | ESLint 정적 분석 | `catch`에서 `data = null`이 불필요하다는 경고 | 이미 null로 초기화된 변수 재대입 | `response.json().catch(() => null)` 사용 | 경고 해소 |
| 8 | 인증 추가 후 목록 조회 | `로그인이 필요합니다.` | 보호 API에 JWT가 없음 | 공통 http에서 Bearer 토큰 자동 추가 | 로그인 후 정상 조회 |
| 9 | 로그아웃 보안 | 로그아웃 후 복사한 JWT가 만료 전까지 사용 가능 | stateless JWT 특성 | jti와 revoked_tokens 추가 | 폐기 토큰 차단 구조 반영 |
| 10 | 작성일 표시 | 작성일이 한국 시간보다 9시간 느림 | SQLite CURRENT_TIMESTAMP가 UTC | dateUtils에서 Asia/Seoul 변환 | 한국 시간 표시 |
| 11 | 인증 화면 전환 | 로그인 값이 회원가입 화면에 남음 | AuthForm state 유지 | 모드 변경 시 모든 입력 state 초기화 | 입력창 초기화 |
| 12 | 관리자 가입 보안 | ADMIN_EMAIL을 아는 사람이 먼저 가입할 가능성 | 공개 signup에서 role 결정 | signup은 user 고정, create-admin 스크립트 | 공개 admin 가입 차단 |

---

## 2. 상세 기록

### 오류 1. SQLite NOT NULL 제약조건 실패

#### 원문

```text
SqliteError: NOT NULL constraint failed: studies.user_id
```

#### 원인

`studies.user_id`를 `NOT NULL`로 변경했지만 기존 예시 데이터 삽입 코드는 `user_id`를 넣지 않았습니다.

#### 해결

- 기존 `data/study.db` 삭제
- seed insert 코드 제거
- 로그인한 사용자의 POST 요청으로만 학습 기록 생성

#### 결과

서버가 정상 실행되고 모든 새 학습 기록에 사용자 ID가 포함되었습니다.

---

### 오류 2. `clientDistPath` 미정의

#### 원문

```text
ReferenceError: clientDistPath is not defined
```

#### 원인

```js
app.use(express.static(clientDistPath));
```

를 사용하면서 변수를 먼저 선언하지 않았습니다.

#### 해결

```js
const path = require("path");

const clientDistPath = path.join(
    __dirname,
    "..",
    "client",
    "dist",
);

const clientIndexPath = path.join(
    clientDistPath,
    "index.html",
);
```

#### 결과

React build 파일 정적 제공 코드가 정상 실행되었습니다.

---

### 오류 3. `createToken` 미정의

#### 원문

```text
ReferenceError: createToken is not defined
```

#### 원인

회원가입 라우트에서 토큰 생성 함수를 호출했지만 함수가 정의되거나 import되지 않았습니다.

#### 해결

`server/utils/token.js`에 `createToken`, `verifyToken`을 만들고 인증 라우트와 미들웨어에서 import했습니다.

#### 결과

회원가입과 로그인 응답에서 JWT가 정상 반환되었습니다.

---

### 오류 4. React effect 내부 동기 setState 경고

#### 원문

```text
Calling setState synchronously within a effect can trigger cascading renders
```

#### 원인

수정 대상이 바뀔 때 `useEffect`에서 여러 입력 state를 동시에 설정했습니다.

#### 해결

`getInitialForm(editingStudy)`로 초기값을 만들고 대상이 바뀔 때 컴포넌트를 재마운트했습니다.

```jsx
<StudyForm
    key={
        editingStudy
            ? `edit-${editingStudy.id}`
            : "create"
    }
    ...
/>
```

#### 결과

lint 경고 없이 수정 폼에 기존 값이 표시되었습니다.

---

### 오류 5. 서버 폴더명 오타

#### 증상

```text
serever@1.0.0
```

#### 원인

서버 폴더가 `serever`로 생성되었습니다.

#### 해결

폴더명을 `server`로 변경하고 코드·문서·터미널 경로를 통일했습니다.

---

### 오류 6. 시간 컬럼 혼재

#### 증상

기존 `study_time`과 새 `study_minutes` 구조가 함께 남을 가능성이 있었습니다.

#### 원인

처음에는 정수 시간으로 저장하다가 시간/분 입력과 총 분 저장으로 변경했습니다.

#### 해결

개발 DB를 삭제하고 `study_minutes INTEGER NOT NULL` 기준으로 새로 생성했습니다.

#### 결과

프론트는 시간/분을 입력하고 백엔드·DB는 총 분만 처리하도록 통일되었습니다.

---

### 오류 7. `data = null` 불필요한 대입 경고

#### 발생 코드

```js
let data = null;

try {
    data = await response.json();
} catch {
    data = null;
}
```

#### 원인

`data`는 이미 `null`이므로 JSON 변환 실패 시 다시 `null`을 대입할 필요가 없습니다.

#### 해결

```js
const data = await response
    .json()
    .catch(() => null);
```

#### 결과

공통 HTTP 응답 처리는 유지하면서 정적 분석 경고를 제거했습니다.

---

### 오류 8. 보호 API의 401 응답

#### 증상

```text
로그인이 필요합니다.
```

#### 원인

기존 프론트 API 요청은 인증 도입 전에 작성되어 `Authorization` 헤더를 보내지 않았습니다.

#### 해결

- `tokenStorage.js` 생성
- `http.js`에서 저장된 토큰 조회
- 모든 API 요청에 Bearer 헤더 자동 추가

```js
if (token) {
    headers.Authorization = `Bearer ${token}`;
}
```

#### 결과

개별 `studyApi.js`, `authApi.js`, `adminApi.js`에서 JWT 코드를 반복하지 않고 보호 API에 접근할 수 있게 되었습니다.

---

### 오류 9. 로그아웃한 JWT 재사용 가능 문제

#### 증상

초기 로그아웃은 클라이언트의 토큰만 삭제하므로 복사해 둔 JWT는 만료 전까지 유효했습니다.

#### 원인

JWT는 서버 세션처럼 발급 즉시 서버가 보관하고 삭제하는 구조가 아닙니다.

#### 해결

- JWT에 `jti` 추가
- `revoked_tokens` 테이블 추가
- 로그아웃 시 `jti`, `exp` 저장
- `requireAuth`에서 폐기 여부 확인

#### 결과

로그아웃한 현재 JWT를 다시 사용하면 401을 반환하는 구조로 변경했습니다.

> 제출 전 실제 폐기 토큰 재사용 테스트 결과를 별도로 확인합니다.

---

### 오류 10. 작성일이 한국 시간과 9시간 차이

#### 증상

학습 기록 작성일과 사용자 가입일이 실제 한국 시간보다 9시간 느리게 표시되었습니다.

#### 원인

SQLite의 `CURRENT_TIMESTAMP`는 UTC이고, 반환 문자열에는 시간대 표시가 없습니다.

#### 해결

UTC임을 나타내도록 `Z`를 붙인 뒤 `Asia/Seoul`로 변환했습니다.

```js
const utcDateTime = dateTime.includes("T")
    ? dateTime
    : `${dateTime.replace(" ", "T")}Z`;
```

```js
new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    ...
});
```

#### 결과

DB 원본은 UTC로 유지하면서 화면에서 한국 시간으로 표시했습니다.

---

### 오류 11. 로그인/회원가입 전환 시 입력값 유지

#### 증상

로그인 화면에 입력한 이메일과 비밀번호가 회원가입 화면으로 이동해도 남았습니다.

#### 원인

동일한 `AuthForm` 컴포넌트가 모드만 변경되고 내부 state는 유지되었습니다.

#### 해결

```js
function handleModeChange() {
    setEmail("");
    setPassword("");
    setNickname("");

    onModeChange(
        isSignup ? "login" : "signup",
    );
}
```

#### 결과

로그인과 회원가입 화면을 전환할 때 모든 입력창이 초기화되었습니다.

---

### 오류 12. 공개 회원가입을 통한 관리자 생성 가능성

#### 증상

초기에는 환경변수의 관리자 이메일과 일치하면 공개 회원가입 API에서 admin 역할을 부여했습니다.

#### 원인

프론트에서 관리자 UI를 숨겨도 사용자가 직접 API를 호출할 수 있습니다.

#### 해결

- 공개 회원가입은 무조건 `user`
- `server/scripts/createAdmin.js` 추가
- `npm run create-admin`으로만 관리자 생성
- 관리자 닉네임은 `Admin` 고정

#### 결과

공개 API로 관리자 계정을 만들 수 없도록 구조를 변경했습니다.

---

## 3. 오류 해결 과정에서 배운 점

1. DB 스키마 변경 시 기존 데이터·seed·외래키를 함께 확인해야 합니다.
2. 프론트 화면에서 버튼을 숨기는 것만으로는 권한 보호가 되지 않습니다.
3. 공통 HTTP 모듈을 만들면 토큰과 오류 처리를 반복하지 않아도 됩니다.
4. JWT 로그아웃은 로컬 삭제와 서버 폐기가 서로 다른 문제입니다.
5. UTC 저장과 사용자 지역 시간 표시는 분리하는 것이 안전합니다.
6. 실행 오류가 아니더라도 lint 경고와 UX 문제를 해결 기록에 남길 수 있습니다.
7. AI 제안은 실제 오류 메시지와 프로젝트 구조를 대조한 뒤 반영해야 합니다.
