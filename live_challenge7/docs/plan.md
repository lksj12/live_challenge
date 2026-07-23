# React 노트 앱 구현 계획

상태 표기: `[ ]` 시작 전 · `[-]` 진행 중 · `[x]` 완료 · `[!]` 문제

## 시작 상태

- npm install: 완료
- npm run dev: 클라이언트 5173·API 3001 실행
- npm run build: 완료
- 브라우저 콘솔: 전체 시나리오 최종 확인 필요
- 현재 구현 기능: 전체 기능 구현 완료
- 발견한 문제: Git 저장소·저장소 URL 없음

## 마일스톤 1. 기반 구조

- [x] `Note`, 인증, 관리자 타입 정의
- [x] Redux store와 typed hooks 구성
- [x] Provider 연결
- [x] 프론트엔드 `client/`, 백엔드 `server/` 분리
- [x] SQLite 마이그레이션과 API 골격
- [x] 로딩·빈 상태 화면

예상 변경 파일:

- `client/src/types/`, `client/src/store/`, `client/src/main.tsx`
- `server/src/db/`, `server/src/app.ts`, 루트 workspace 설정

검증 방법:

- `npm run typecheck`
- `npm run dev`
- `GET /api/health`

실제 결과:

- React·Redux·Express 개발 서버 실행
- SQLite 필수 테이블 마이그레이션 테스트 통과

## 마일스톤 2. 핵심 기능

- [x] 노트 목록
- [x] 노트 작성
- [x] 노트 선택·확인
- [x] 노트 수정
- [x] 노트 삭제
- [x] 로그인·회원가입·로그아웃 revoke
- [x] 회원 SQLite 저장·비회원 세션 저장
- [x] 관리자 권한과 사용자 관리
- [x] 태그·고정·보관함·휴지통
- [x] 검색·정렬·색상·우선순위

예상 변경 파일:

- `client/src/components/`, `client/src/api/`, `client/src/store/`
- `server/src/auth/`, `server/src/routes/`, `server/src/db/`

검증 방법:

- Redux reducer 테스트
- Supertest API 인증·소유권 테스트
- SQLite 메모리 데이터베이스 테스트

실제 결과:

- 사용자별 노트·태그 소유권 격리
- 관리자 비밀번호 초기화 시 기존 세션 revoke
- 사용자 삭제 시 관련 세션·노트 연쇄 삭제
- 회원·비회원 노트 상태 분리

## 마일스톤 3. 도전 기능·검증과 문서화

- [x] 빈 제목·공백 제목 처리
- [x] 삭제 후 선택·목록 상태 확인
- [x] Markdown 미리보기와 원본 HTML 차단
- [x] 자동 저장
- [x] 다크 모드
- [x] 기본·팔레트·HEX 사용자 색상
- [x] 접근성 보완
- [x] 자동 테스트 43개
- [x] `npm run typecheck` 성공
- [x] `npm run lint` 성공
- [x] `npm run build` 성공
- [x] README·작업 기록 완성
- [!] 브라우저 콘솔과 전체 수동 시나리오 확인
- [!] Git 최종 diff·commit·저장소 URL

검증 결과:

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | 성공 |
| `npm run lint` | 성공 |
| `npm run test` | 클라이언트 27개·서버 16개 성공 |
| `npm run build` | 성공 |

## 계획과 달라진 점

| 기존 계획 | 실제 변경 | 변경 이유 | 사람 확인 |
|---|---|---|---|
| 기본 노트 앱 | 인증·관리자 추가 | 사용자 요청 | 승인 |
| 브라우저 저장 | 회원 SQLite·비회원 세션 분리 | 영구성과 비회원 정책 | 승인 |
| 외부 DB 검토 | 로컬 SQLite 구현 | 외부 연동 제외 요청 | 승인 |
| 기본 색상만 제공 | 팔레트·HEX 입력 추가 | 사용자 후속 요청 | 승인 |
| Antigravity 사용 | Codex 사용 | 사용자 도구 선택 | 승인 |
| 기본 접근성 | 모달 포커스·모바일 탐색까지 보완 | 도전 기능 완료 | 승인 |

## 다음 작업

- 다음 작은 목표: 제출 전 브라우저 시나리오와 Git 증거 완성
- 예상 변경 파일: 문서의 저장소 URL·검증 결과, 화면 캡처
- 검증 방법:
  - 회원·비회원·관리자 전체 흐름 수동 실행
  - 320px·태블릿·데스크톱 확인
  - 라이트·다크 모드와 콘솔 확인
  - Git diff와 추적 제외 파일 확인
- 승인 상태: 승인 전
