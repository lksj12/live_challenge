# 과제 6. React 쇼핑몰 앱 만들기 — README 템플릿 v0.3

## 1. 과제 소개

| 항목 | 내용 |
|---|---|
| 과정명 | AI SW 장기교육 |
| 선수 강의 | 따라하며 배우는 리액트 A-Z |
| 핵심 기술 | React, 전역 상태관리, Firebase Authentication |
| 상품 데이터 | Fake Store API 또는 기록된 mock 대체 |
| 선택 기술 | TypeScript |
| 결과 예시 | https://drive.google.com/file/d/1fUeCYpSu0H_BU154iN7t1IHM37cDo6mz/view?usp=sharing |

### 한 줄 소개

> 이 프로젝트는 __________________ 사용자가 상품을 조회하고 Firebase로 로그인하며, 원하는 상품을 전역 장바구니에 담아 예상 총액을 확인할 수 있는 React 쇼핑몰입니다.

### 결과 예시와 다른 점

- 참고한 기능 흐름:
- 다르게 설계한 UI·기능:
- 복제하지 않은 이미지·브랜드·문구:

## 2. 실행 화면

| 화면 | 파일·링크 | 설명 |
|---|---|---|
| 상품 목록·로딩 |  |  |
| 로그인·인증 상태 |  |  |
| 장바구니·총액 |  |  |
| 오류·빈 상태·선택 기능 |  |  |

```md
![상품 목록](./screenshots/products.png)
![로그인 상태](./screenshots/auth.png)
![장바구니](./screenshots/cart.png)
```

### 실시간 응시와 최종 보완 비교

| 항목 | 1시간 종료 시 | 최종 제출 시 | 보완 내용 |
|---|---|---|---|
| 데이터·상태·인증 설계 |  |  |  |
| 전역 장바구니 |  |  |  |
| Firebase 인증 |  |  |  |
| 상품 API·대체 경로 |  |  |  |
| README·테스트 |  |  |  |

## 3. 구현 기능

### 필수 기능

| 기능 | 상태 | 확인 방법 | 비고 |
|---|---|---|---|
| 상품 데이터 조회 또는 mock 대체 | □ 완료 / □ 부분 / □ 미완료 |  |  |
| loading·error·empty | □ 완료 / □ 부분 / □ 미완료 |  |  |
| 상품 목록·카드 | □ 완료 / □ 부분 / □ 미완료 |  |  |
| 전역 상태관리 라이브러리 | □ 완료 / □ 부분 / □ 미완료 |  |  |
| 장바구니 담기·목록 | □ 완료 / □ 부분 / □ 미완료 |  |  |
| 총액 계산 | □ 완료 / □ 부분 / □ 미완료 |  |  |
| Firebase 로그인 | □ 완료 / □ 부분 / □ 미완료 |  |  |
| 인증 초기·사용자 상태 | □ 완료 / □ 부분 / □ 미완료 |  |  |
| 로그인 오류·로그아웃 | □ 완료 / □ 부분 / □ 미완료 |  |  |

### 권장 기능

| 기능 | 상태 | 설명 |
|---|---|---|
| 수량 변경 | □ 완료 / □ 미구현 |  |
| 항목 삭제 | □ 완료 / □ 미구현 |  |
| 빈 장바구니 안내 | □ 완료 / □ 미구현 |  |
| API 다시 시도 | □ 완료 / □ 미구현 |  |
| 인증 로딩 UX | □ 완료 / □ 미구현 |  |
| 로그인 전후 UI | □ 완료 / □ 미구현 |  |

### 도전 기능

| 기능 | 상태 | 적용 범위·효과 |
|---|---|---|
| TypeScript | □ 적용 / □ 미적용 |  |
| 검색 | □ 적용 / □ 미적용 |  |
| 카테고리 필터 | □ 적용 / □ 미적용 |  |
| LocalStorage | □ 적용 / □ 미적용 |  |
| 수량 배지 | □ 적용 / □ 미적용 |  |
| 반응형·접근성 | □ 적용 / □ 미적용 |  |

## 4. 상품 데이터 구조

- 표준 endpoint: `https://fakestoreapi.com/products`
- 실제 사용 경로: API / mock 대체
- mock을 사용한 경우 이유:
- 사용한 응답 필드:
- 내부 product 변환 위치:

### `product`

| 필드 | 자료형 | 원본 필드 | 사용 위치 | 검증 |
|---|---|---|---|---|
|  |  |  |  |  |
|  |  |  |  |  |

### API 상태

| 상태 | 화면 처리 |
|---|---|
| loading |  |
| success |  |
| error |  |
| empty |  |
| mock fallback |  |

## 5. 전역 상태관리 구조

- 사용 라이브러리:
- Redux Toolkit을 사용하지 않은 경우 선택 이유:
- store 위치:
- cart slice 또는 상태 모듈:
- Provider 연결 위치:
- 총액 계산 위치:

### `cartItem`

| 필드 | 자료형 | 값의 출처 | 변경 규칙 |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |

### action·selector

| 구분 | 이름 | 역할 | 테스트 |
|---|---|---|---|
| action |  |  |  |
| action |  |  |  |
| selector |  |  |  |
| selector |  |  |  |

### 장바구니 정책

| 항목 | 선택 |
|---|---|
| 같은 상품 재추가 |  |
| 최소 수량 |  |
| 수량 0 처리 |  |
| 로그아웃 시 cart |  |
| 저장 방식 | 메모리 / LocalStorage / 기타 |

## 6. Firebase Authentication

- 로그인 방식:
- 인증 상태 관리 위치:
- 로그인 성공 화면:
- 로그인 실패 안내:
- 인증 초기 로딩:
- 로그아웃 처리:

### `authUser`

| 필드 | 사용 | 화면 표시 | 개인정보 보호 |
|---|:---:|:---:|---|
| uid |  |  |  |
| displayName |  |  |  |
| email |  |  |  |
| photoURL |  |  |  |

### 인증 흐름

```text
앱 시작
→ 인증 상태 확인
→ 로그인 또는 비로그인 화면
→ 로그인 성공·실패
→ 사용자 상태 표시
→ 로그아웃
```

## 7. 사용 기술

| 구분 | 기술 | 버전 | 사용 이유 |
|---|---|---|---|
| UI | React |  |  |
| 전역 상태 |  |  |  |
| 인증 | Firebase Authentication |  |  |
| 상품 데이터 | Fake Store API / mock |  |  |
| 스타일 |  |  |  |
| 언어 | JavaScript / TypeScript |  |  |
| AI 도구 |  |  |  |

## 8. 설치·환경 변수·실행

### 요구 환경

- Node.js:
- 패키지 관리자:
- 브라우저:
- Firebase 인증 제공자:
- Firebase Authorized Domain 확인:

### 설치와 실행

```bash
npm install
npm run dev
```

### `.env.example`

실제 값 대신 자리표시자만 작성합니다.

```env
VITE_FIREBASE_API_KEY=replace_with_your_value
VITE_FIREBASE_AUTH_DOMAIN=replace_with_your_value
VITE_FIREBASE_PROJECT_ID=replace_with_your_value
VITE_FIREBASE_APP_ID=replace_with_your_value
```

> service account JSON, Admin SDK private key, 비밀번호, access token은 포함하지 않습니다.

### 실행 확인

1. 개발 서버가 실행됩니다.
2. 인증 초기 상태가 표시됩니다.
3. 로그인·실패 안내·로그아웃이 동작합니다.
4. API 또는 mock 상품이 표시됩니다.
5. 장바구니와 총액이 전역 상태로 동작합니다.
6. console에 치명적 오류가 없습니다.

## 9. 폴더·파일 구조

```text
[후보 예시입니다. 실제 구조로 교체합니다.]
project/
├─ README.md
├─ package.json
├─ .env.example
├─ src/
│  ├─ app/
│  │  └─ store...
│  ├─ features/
│  │  └─ cart...
│  ├─ services/
│  │  ├─ firebase...
│  │  └─ productApi...
│  ├─ components/
│  └─ App...
└─ screenshots/
```

| 파일·폴더 | 역할 | 내가 수정한 내용 |
|---|---|---|
|  |  |  |
|  |  |  |

## 10. 데이터·상태 흐름

```text
Fake Store API 또는 mock
→ product 변환
→ ProductList·ProductCard
→ dispatch(addToCart)
→ 전역 cart state
→ Cart·CartSummary

Firebase Authentication
→ 인증 listener
→ 초기·로그인·비로그인·오류 UI
```

## 11. AI 활용 기록

| 번호 | 목적 | AI 도구 | 프롬프트 요약 | 결과 활용 | 내가 수정한 부분 |
|---:|---|---|---|---|---|
| 1 | 요구사항·설계 |  |  |  |  |
| 2 | Redux 상태 |  |  |  |  |
| 3 | Firebase 인증 |  |  |  |  |
| 4 | 상품 API |  |  |  |  |
| 5 | 통합 검토·오류 |  |  |  |  |

### 대표 프롬프트 1

```text
[실제 사용한 설계·구현 프롬프트]
```

### 대표 프롬프트 2

```text
[실제 사용한 검토·수정 프롬프트]
```

## 12. AI 생성 결과 검토

| 항목 | 결과 | 수정 |
|---|---|---|
| 전역 상태 사용 | □ 통과 / □ 보완 |  |
| action·reducer·selector | □ 통과 / □ 보완 |  |
| Firebase 실제 인증 | □ 통과 / □ 보완 |  |
| 인증 초기·오류·로그아웃 | □ 통과 / □ 보완 |  |
| API loading·error·empty | □ 통과 / □ 보완 |  |
| 총액·수량 | □ 통과 / □ 보완 |  |
| 비밀정보·개인정보 | □ 통과 / □ 보완 |  |
| 과도한 구현 | □ 통과 / □ 보완 |  |

## 13. 테스트 기록

| 번호 | 시나리오 | 기대 결과 | 실제 결과 | 통과 |
|---:|---|---|---|:---:|
| 1 | 최초 실행 | 인증·상품 loading |  | ☐ |
| 2 | 로그인 성공 | 사용자 상태 |  | ☐ |
| 3 | 로그인 실패 | 오류 안내 |  | ☐ |
| 4 | 로그아웃 | 비로그인 상태 |  | ☐ |
| 5 | API 성공 | 상품 목록 |  | ☐ |
| 6 | API 실패·대체 | 오류·mock |  | ☐ |
| 7 | 상품 2개 담기 | cart·total 일치 |  | ☐ |
| 8 | 빈 cart | 0원·오류 없음 |  | ☐ |

## 14. 오류 해결 기록

| 번호 | 영역 | 오류 메시지 | 원인 | 수정 | 재실행 |
|---:|---|---|---|---|---|
| 1 | Redux / Firebase / API |  |  |  |  |
| 2 |  |  |  |  |  |

## 15. 보안·개인정보·저작권

| 항목 | 확인 |
|---|:---:|
| `.env` 실제 값·service account를 커밋하지 않았습니다. | ☐ |
| 비밀번호·토큰·Admin private key가 없습니다. | ☐ |
| 실제 이메일·UID·주소·전화번호가 캡처에 없습니다. | ☐ |
| 실제 결제·주문·배송·회원 등급이 없습니다. | ☐ |
| 결과 예시를 그대로 복제하지 않았습니다. | ☐ |
| 이미지·브랜드·문구 사용 범위를 확인했습니다. | ☐ |
| 레포·Drive·배포 링크 권한을 확인했습니다. | ☐ |

### 외부 자료

| 자료 | 출처 | 사용 범위 |
|---|---|---|
| Fake Store API | https://fakestoreapi.com/products | 상품 데이터 실습 |
| 결과 예시 | https://drive.google.com/file/d/1fUeCYpSu0H_BU154iN7t1IHM37cDo6mz/view?usp=sharing | 기능 흐름 참고 |
|  |  |  |

## 16. 배운 점·한계·다음 개선

1.
2.
3.

### JavaScript 또는 TypeScript

- 사용 언어:
- TypeScript 적용 범위:
- 정의한 타입:
- 다음 보완:

### 알려진 문제

- 미완료 기능:
- 다른 환경 문제:
- Firebase 설정 주의:

| 한계 | 원인 | 다음 개선 | 우선순위 |
|---|---|---|---|
|  |  |  |  |

## 17. 제출 정보

| 항목 | 링크·설명 |
|---|---|
| 결과물 레포 URL |  |
| 실행·배포 URL |  |
| 제출 폼 | https://goor.me/aiswwork1 |
