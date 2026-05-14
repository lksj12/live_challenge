# GitHub Finder

GitHub 사용자명을 입력하면 GitHub REST API를 통해 사용자 프로필, 최신 저장소 목록, 최근 공개 활동 데이터를 조회하여 화면에 출력하는 웹 애플리케이션입니다.

## 1. 과제 개요

본 프로젝트는 단순한 정적 화면 구현이 아니라, 실제 GitHub API 데이터를 비동기 통신으로 가져와 UI에 렌더링하는 것을 목표로 합니다.

사용자는 검색창에 GitHub username을 입력하고 Enter 키를 누르면 해당 사용자의 프로필 정보와 최신 저장소 목록을 확인할 수 있습니다. 추가 기능으로 최근 공개 활동 데이터를 기반으로 한 잔디밭 UI와 로딩 Spinner 기능을 구현했습니다.

## 2. 주요 기능

### 2.1 GitHub 사용자 검색

- 사용자가 GitHub username을 입력할 수 있습니다.
- Enter 키 입력 시 GitHub API 요청이 실행됩니다.
- 빈 입력값일 경우 안내 메시지를 출력합니다.

### 2.2 사용자 프로필 출력

GitHub API 응답 데이터를 기반으로 다음 정보를 화면에 출력합니다.

- 프로필 이미지
- GitHub 프로필 링크
- 이름 또는 username
- 소개글
- 공개 저장소 수
- 팔로워 수
- 팔로잉 수
- 회사
- 웹사이트
- 위치
- GitHub 가입일

### 2.3 최신 저장소 목록 출력

사용자의 최신 저장소 5개를 조회하여 출력합니다.

- 저장소 이름
- 저장소 링크
- Stars 수
- Watchers 수
- Forks 수

### 2.4 Spinner 기능

API 요청 중에는 로딩 상태를 나타내는 Spinner를 표시합니다.

데이터 요청이 완료되면 Spinner를 제거하고 결과 화면을 출력합니다.

### 2.5 예외 처리

다음 상황에 대한 예외 처리를 구현했습니다.

- 빈 사용자명 입력
- 존재하지 않는 사용자 검색
- API 요청 중 오류 발생

### 2.6 최근 공개 활동 기반 잔디밭 기능

GitHub REST API의 public events 데이터를 사용하여 최근 30일 동안의 공개 활동을 잔디밭 형태로 시각화했습니다.

단, 이 기능은 실제 GitHub 프로필의 contribution graph와 완전히 동일하지 않습니다.

GitHub REST API에서 공개적으로 제공하는 `/users/{username}/events/public` 데이터를 기반으로 만든 활동 시각화 기능입니다.

## 3. 사용 기술

- HTML
- CSS
- JavaScript
- JavaScript OOP
- Fetch API
- Async / Await
- GitHub REST API

## 4. 사용한 API

### 4.1 사용자 프로필 API

```text
https://api.github.com/users/{username}
```

사용자 프로필 정보를 가져오기 위해 사용했습니다.

### 4.2 사용자 저장소 API

```text
https://api.github.com/users/{username}/repos?sort=created&per_page=5
```

사용자의 최신 저장소 목록 5개를 가져오기 위해 사용했습니다.

### 4.3 사용자 공개 활동 API

```text
https://api.github.com/users/{username}/events/public
```

최근 공개 활동 데이터를 가져와 잔디밭 기능을 구현하기 위해 사용했습니다.

## 5. 프로젝트 구조

```text
github-finder/
├── index.html
├── style.css
├── js/
│   ├── github.js
│   ├── ui.js
│   └── app.js
└── README.md
```

## 6. 파일별 역할

### 6.1 `index.html`

전체 화면 구조를 담당합니다.

주요 영역은 다음과 같습니다.

- 검색 입력창
- 사용자 프로필 출력 영역
- 최근 활동 잔디밭 출력 영역
- 최신 저장소 목록 출력 영역

### 6.2 `style.css`

전체 UI 스타일을 담당합니다.

- 상단 네비게이션 바
- 검색 카드
- 프로필 카드
- 저장소 카드
- Spinner
- 잔디밭 UI
- 반응형 레이아웃

### 6.3 `github.js`

GitHub API 요청을 담당하는 `GitHub` 클래스를 정의했습니다.

```js
class GitHub {
    constructor() {
        this.reposCount = 5;
        this.reposSort = "created";
    }

    async getUser(username) {
        // 사용자 정보, 저장소 목록, 공개 활동 데이터를 요청
    }
}
```

### 6.4 `ui.js`

화면 출력을 담당하는 `UI` 클래스를 정의했습니다.

주요 메서드는 다음과 같습니다.

```text
showProfile()
showRepos()
showGrass()
showSpinner()
hideSpinner()
showAlert()
clearProfile()
```

### 6.5 `app.js`

사용자 입력 이벤트와 전체 실행 흐름을 담당합니다.

흐름은 다음과 같습니다.

```text
사용자명 입력
→ Enter 키 입력
→ 빈 입력값 검사
→ Spinner 표시
→ GitHub API 요청
→ 사용자 존재 여부 확인
→ 프로필 / 잔디밭 / 저장소 출력
→ 오류 발생 시 안내 메시지 출력
```

## 7. 구현 흐름

본 프로젝트의 데이터 처리 흐름은 다음과 같습니다.

```text
입력 → 요청 → 응답 → 출력
```

### 7.1 입력

사용자가 검색창에 GitHub username을 입력하고 Enter 키를 누릅니다.

### 7.2 요청

입력받은 username을 기반으로 GitHub API에 비동기 요청을 보냅니다.

### 7.3 응답

GitHub API로부터 JSON 형태의 데이터를 응답받습니다.

### 7.4 출력

응답받은 데이터를 필요한 형태로 가공하여 DOM에 렌더링합니다.

## 8. JavaScript OOP 적용

본 프로젝트는 기능별 책임을 분리하기 위해 JavaScript 클래스를 사용했습니다.

### 8.1 `GitHub` 클래스

API 요청을 담당합니다.

- 사용자 프로필 요청
- 저장소 목록 요청
- 공개 활동 데이터 요청

### 8.2 `UI` 클래스

화면 출력을 담당합니다.

- 프로필 렌더링
- 저장소 목록 렌더링
- 잔디밭 렌더링
- 로딩 Spinner 표시
- 에러 메시지 표시

이처럼 API 요청 로직과 UI 출력 로직을 분리하여 코드의 역할을 명확히 했습니다.

## 9. AI 활용 과정

### 9.1 GitHub API 구조 조사

#### 질문 내용

GitHub 사용자 프로필과 저장소 목록을 가져오려면 어떤 API를 사용해야 하는지 질문했습니다.

#### 활용 결과

사용자 정보 API와 저장소 목록 API의 URL 구조를 확인했습니다.

```text
https://api.github.com/users/{username}
https://api.github.com/users/{username}/repos?sort=created&per_page=5
```

이를 바탕으로 `github.js`에서 Fetch API를 사용해 데이터를 요청하도록 구현했습니다.

### 9.2 비동기 통신 구현 방식 확인

#### 질문 내용

JavaScript에서 GitHub API 요청을 어떻게 비동기로 처리할 수 있는지 질문했습니다.

#### 활용 결과

`async / await`과 `fetch()`를 사용하는 방식으로 구현했습니다.

```js
const profileResponse = await fetch(`https://api.github.com/users/${username}`);
const profile = await profileResponse.json();
```

이를 통해 API 응답을 받은 뒤 프로필과 저장소 데이터를 화면에 출력할 수 있었습니다.

### 9.3 OOP 구조 설계

#### 질문 내용

과제 조건에 맞게 JavaScript OOP를 적용하려면 파일과 클래스를 어떻게 나누면 좋을지 질문했습니다.

#### 활용 결과

API 요청을 담당하는 `GitHub` 클래스와 화면 출력을 담당하는 `UI` 클래스로 역할을 분리했습니다.

```text
GitHub 클래스 → API 요청 담당
UI 클래스 → DOM 출력 담당
app.js → 이벤트 처리 및 흐름 제어
```

이 구조를 통해 코드의 책임을 명확히 나눌 수 있었습니다.

### 9.4 잔디밭 기능 구현 방식 조사

#### 질문 내용

GitHub 프로필의 잔디밭과 비슷한 기능을 어떻게 구현할 수 있는지 질문했습니다.

#### 활용 결과

GitHub REST API의 public events 데이터를 사용하여 최근 30일 동안의 공개 활동을 날짜별로 계산하는 방식으로 구현했습니다.

```text
https://api.github.com/users/{username}/events/public
```

각 날짜별 활동 수에 따라 CSS 클래스를 다르게 적용하여 잔디밭 UI를 만들었습니다.

## 10. 트러블슈팅

### 10.1 `ui.hideSpinner is not a function` 오류

#### 문제 상황

Spinner 기능을 추가한 뒤 검색을 실행했을 때 다음 오류가 발생했습니다.

```text
TypeError: ui.hideSpinner is not a function
```

#### 원인

`hideSpinner()` 메서드를 `UI` 클래스에 추가했지만, 브라우저 또는 개발 서버가 이전 버전의 `ui.js` 파일을 사용하고 있었습니다.

그 결과 현재 실행 중인 `UI` 객체에는 `hideSpinner()` 메서드가 등록되어 있지 않았습니다.

#### 해결 과정

콘솔에서 현재 `UI` 클래스에 등록된 메서드를 확인했습니다.

```js
console.log(Object.getOwnPropertyNames(UI.prototype));
```

확인 결과 `hideSpinner()`가 목록에 없었습니다.

이후 개발 서버를 종료하고 다시 실행한 뒤 새로고침하여 최신 JavaScript 파일이 반영되도록 했습니다.

#### 해결 결과

서버 재시작 후 `hideSpinner()` 메서드가 정상적으로 인식되었고, Spinner 기능이 정상 작동했습니다.

#### 배운 점

JavaScript 코드를 수정했는데도 변경 사항이 반영되지 않을 경우, 코드 오류뿐만 아니라 브라우저 캐시나 개발 서버 상태도 함께 확인해야 한다는 것을 배웠습니다.

### 10.2 잔디밭 UI가 화면에 표시되지 않는 문제

#### 문제 상황

`ui.js`에 `showGrass()` 메서드를 작성했지만 화면에는 `Recent GitHub Activity` 제목만 보이고 잔디밭 칸이 출력되지 않았습니다.

#### 원인

잔디밭을 출력하는 메서드인 `showGrass()`를 만들었지만, `app.js`에서 실제로 호출하지 않았습니다.

기존 코드:

```js
ui.showProfile(data.profile);
ui.showRepos(data.repos);
```

#### 해결 방법

프로필 출력과 저장소 출력 사이에 `showGrass()` 호출 코드를 추가했습니다.

```js
ui.showProfile(data.profile);
ui.showGrass(data.events);
ui.showRepos(data.repos);
```

#### 해결 결과

GitHub public events 데이터를 기반으로 최근 30일 활동 잔디밭이 정상적으로 화면에 표시되었습니다.

#### 배운 점

메서드를 정의하는 것만으로는 화면에 기능이 반영되지 않으며, 실제 실행 흐름에서 해당 메서드를 호출해야 한다는 점을 확인했습니다.

## 11. 실행 방법

1. 프로젝트 폴더를 엽니다.
2. `index.html`을 브라우저에서 실행합니다.
3. 검색창에 GitHub username을 입력합니다.
4. Enter 키를 누릅니다.
5. 사용자 프로필, 최근 활동, 최신 저장소 목록을 확인합니다.

## 12. 테스트한 사용자명

```text
lksj12
octocat
torvalds
```

## 13. 느낀 점

JavaScript OOP를 사용하여 API 요청 로직과 UI 렌더링 로직을 분리하니 코드의 역할이 명확해졌습니다.

또한 Spinner, 예외 처리, 잔디밭 기능을 추가하면서 사용자 경험을 고려한 기능 구현의 필요성을 알게 되었습니다.

GitHub REST API에서 제공하는 데이터 구조를 분석하고, 필요한 데이터만 추출하여 DOM에 출력하는 과정을 통해 비동기 통신과 데이터 기반 UI 구성에 대한 이해를 높일 수 있었습니다.
```