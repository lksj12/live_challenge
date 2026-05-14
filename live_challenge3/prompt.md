# Prompt Log

GitHub Finder 과제를 진행하면서 AI와 주고받은 주요 질문과 답변 흐름을 정리한 문서입니다.

## 1. 과제 진행 순서 정리

### 내가 입력한 말

```text
첫번째 그림의 리소스 형상(manifest)이 올라간 결과물 레포 주소 (URL 제출)

(하위과제)

● 자바스크립트 OOP를 이용해서 구현합니다.
● 비동기 통신을 이용합니다.
● 위의 기능 외에 잔디밭 기능, Spinner 기능 등 원하는 기능을 추가해봅니다.

이렇게 과제관련 자료를 받았어
처음부터 너가 다 만들지 말고 하나씩 차근차근 뭐부터 해야할 지 알려줘
```

### AI 답변 요약

```text
과제 요구사항을 먼저 정리하고, HTML/CSS/Vanilla JavaScript 기반으로 단계별로 구현하는 방향을 제안했다.

구현 순서는 다음과 같이 정리되었다.

1. 프로젝트 폴더와 파일 구조 만들기
2. index.html 뼈대 작성
3. style.css 기본 디자인 작성
4. github.js에서 GitHub API 요청 클래스 작성
5. ui.js에서 화면 출력 클래스 작성
6. app.js에서 이벤트 처리 연결
7. Spinner, 잔디밭, 예외 처리 등 추가 기능 구현
8. README 작성 및 배포 준비
```

---

## 2. 프로젝트 파일 구조 생성

### 내가 입력한 말

```text
이렇게 만들었어
```

### AI 답변 요약

```text
파일 구조가 잘 만들어졌다고 확인하고, 다음 단계로 index.html 뼈대를 작성하도록 안내했다.

index.html에는 다음 영역을 만들도록 안내했다.

- 상단 navbar
- 검색 영역
- 사용자 프로필 출력 영역
- 최신 저장소 출력 영역
- JavaScript 파일 연결
```

---

## 3. index.html 작성 후 다음 단계 진행

### 내가 입력한 말

```text
index.html 채웠어
```

### AI 답변 요약

```text
다음 단계로 style.css에 기본 디자인을 추가하도록 안내했다.

주요 스타일 대상은 다음과 같았다.

- body 기본 스타일
- navbar
- container
- search-card
- searchUser input
- profile 영역
- repos 영역
- footer
```

---

## 4. 들여쓰기 방식 요청 및 github.js 단계 진행

### 내가 입력한 말

```text
들여쓰기는 공백 4칸으로 부탁해
다음 단계로 가자
```

### AI 답변 요약

```text
앞으로 코드 들여쓰기를 공백 4칸으로 맞추겠다고 하고, github.js에서 GitHub API 요청을 담당하는 GitHub 클래스를 작성하도록 안내했다.

또한 app.js에서 GitHub 클래스가 잘 작동하는지 console.log로 확인하는 코드를 안내했다.
```

---

## 5. 검색창 입력 후 반응 없음 문제

### 내가 입력한 말

```text
검색창에 이름 넣고 엔터 쳐도 아무 일이 안 일어나는데
```

### AI 답변 요약

```text
당시 코드는 화면에 출력하는 단계가 아니라 console.log로 API 응답을 확인하는 단계였기 때문에 화면에는 아무것도 나타나지 않는 것이 정상이라고 설명했다.

이후 Enter 키를 눌렀을 때만 검색되도록 app.js의 이벤트 방식을 keydown으로 수정하도록 안내했다.
```

---

## 6. GitHub 클래스 인식 오류

### 내가 입력한 말

```text
github.js:1 Uncaught ReferenceError: GitHub is not defined
    at github.js:1:16
(anonymous) @ github.js:1
```

### AI 답변 요약

```text
GitHub 클래스를 정의하기 전에 new GitHub()를 실행했기 때문에 발생한 오류라고 설명했다.

github.js에는 class GitHub만 두고, app.js에는 const github = new GitHub();를 작성해야 한다고 안내했다.

또한 index.html의 script 로딩 순서를 다음과 같이 확인하도록 안내했다.

1. js/github.js
2. js/ui.js
3. js/app.js
```

---

## 7. API 응답 확인 성공

### 내가 입력한 말

```text
아 잘 나온다
```

### AI 답변 요약

```text
API 연결이 성공한 상태라고 확인하고, 다음 단계로 콘솔에 찍히는 데이터를 화면에 출력하기 위해 ui.js를 작성하도록 안내했다.

UI 클래스에는 다음 기능을 만들도록 안내했다.

- showProfile(user)
- showRepos(repos)
- clearProfile()
- showAlert(message)
- clearAlert()
- formatDate(dateString)
```

---

## 8. 프로필과 저장소 화면 출력 확인

### 내가 입력한 말

```text
지금은 이렇게 나와
```

### AI 답변 요약

```text
기능은 동작하고 있지만 CSS가 아직 프로필 카드와 저장소 카드를 꾸미지 않아서 화면이 정리되지 않은 상태라고 설명했다.

style.css에 다음 스타일을 추가하도록 안내했다.

- profile-card
- profile-left
- profile-img
- profile-link
- profile-right
- badges
- info-list
- repo-card
- repo-name
- repo-stats
- alert
- 반응형 스타일
```

---

## 9. 스타일 적용 성공

### 내가 입력한 말

```text
잘 나오네
```

### AI 답변 요약

```text
사용자 검색, GitHub API 요청, 프로필 출력, 저장소 목록 출력, OOP 구조 분리가 완료되었다고 정리했다.

다음 단계로 예외 처리와 Spinner 기능을 추가하는 방향을 제안했다.
```

---

## 10. Spinner 기능 추가 중 오류 발생

### 내가 입력한 말

```text
이렇게 했는데 

7app.js:35 Uncaught (in promise) TypeError: ui.hideSpinner is not a function
    at HTMLInputElement.<anonymous> (app.js:35:12)
```

### AI 답변 요약

```text
hideSpinner()가 UI 클래스 안에 들어가 있지 않거나, 브라우저가 최신 ui.js를 읽지 못했을 가능성이 있다고 설명했다.

UI 클래스 안에 showSpinner()와 hideSpinner()가 들어가야 한다고 안내했다.
```

---

## 11. ui.js 코드 확인

### 내가 입력한 말

```text
class UI {
    constructor() {
        this.profile = document.getElementById("profile");
        this.repos = document.getElementById("repos");
    }

    showProfile(user) {
        ...
    }

    showRepos(repos) {
        ...
    }

    clearProfile() {
        this.profile.innerHTML = "";
        this.repos.innerHTML = "";
    }

    showSpinner() {
    this.profile.innerHTML = `
        <div class="spinner"></div>
    `;
    this.repos.innerHTML = "";
    }

    hideSpinner() {
        const spinner = document.querySelector(".spinner");

        if (spinner) {
            spinner.remove();
        }
    }

    ...
}
```

### AI 답변 요약

```text
ui.js 구조는 맞고, showSpinner() 내부 들여쓰기만 정리하면 된다고 했다.

그래도 에러가 계속되면 브라우저 캐시나 script 순서를 확인해야 한다고 안내했다.
```

---

## 12. UI prototype 확인

### 내가 입력한 말

```text
console.log(UI.prototype);
console.log(Object.getOwnPropertyNames(UI.prototype));
```

이미지로 콘솔 결과를 공유했다.

### AI 답변 요약

```text
콘솔 결과에서 현재 브라우저가 읽은 UI 클래스에 showSpinner()와 hideSpinner()가 포함되어 있지 않다고 확인했다.

index.html의 script에 버전 쿼리를 붙이거나, 강력 새로고침을 통해 최신 파일을 불러오도록 안내했다.
```

---

## 13. 서버 재시작 후 정상 작동

### 내가 입력한 말

```text
서버 종료 후에 다시 해보니깐 정상 작동해
```

### AI 답변 요약

```text
문제 원인이 코드 자체보다는 개발 서버 또는 브라우저 캐시가 예전 ui.js를 들고 있었던 것으로 정리했다.

이 내용을 README의 트러블슈팅 항목으로 활용할 수 있다고 안내했다.
```

---

## 14. 잔디밭 기능 선택

### 내가 입력한 말

```text
B로 할래
```

### AI 답변 요약

```text
이전 선택지 중 B였던 잔디밭 기능 추가를 진행했다.

GitHub의 실제 contribution graph를 그대로 가져오는 대신, GitHub REST API의 public events 데이터를 이용해 최근 30일 공개 활동을 시각화하는 방식으로 구현하자고 안내했다.

사용한 API는 다음과 같다.

```text
https://api.github.com/users/{username}/events/public
```

추가 작업으로 다음을 안내했다.

1. index.html에 grass 영역 추가
2. github.js에서 events API 요청 추가
3. ui.js에 grass 요소와 showGrass() 추가
4. app.js에서 showGrass(data.events) 호출
5. style.css에 grass 관련 스타일 추가
```

---

## 15. 잔디밭이 안 나오는 문제

### 내가 입력한 말

```text
잔디밭이 안 나오는데
```

그리고 index.html, style.css, github.js, app.js, ui.js 코드를 공유했다.

### AI 답변 요약

```text
ui.js에는 showGrass()가 정의되어 있지만, app.js에서 ui.showGrass(data.events)를 호출하지 않아서 잔디밭이 화면에 표시되지 않는다고 확인했다.

다음 코드로 수정하도록 안내했다.

```js
ui.showProfile(data.profile);
ui.showGrass(data.events);
ui.showRepos(data.repos);
```
```

---

## 16. 잔디밭 정상 출력 확인

### 내가 입력한 말

```text
정상적으로 잘 보여
```

### AI 답변 요약

```text
현재까지 구현된 기능을 정리했다.

완료된 기능은 다음과 같다.

1. GitHub 사용자 검색
2. GitHub API 비동기 통신
3. 사용자 프로필 출력
4. 최신 저장소 목록 출력
5. Spinner 기능
6. 빈 입력값 / 사용자 없음 예외 처리
7. 최근 공개 활동 기반 잔디밭 기능
8. JavaScript OOP 구조

다음 단계로 README 작성을 제안했다.
```

---

## 17. README 정리 요청

### 내가 입력한 말

```text
정리해줘
```

### AI 답변 요약

```text
README.md에 넣을 수 있는 내용을 정리했다.

포함된 항목은 다음과 같다.

- 과제 개요
- 주요 기능
- 사용 기술
- 사용한 API
- 프로젝트 구조
- 파일별 역할
- 구현 흐름
- JavaScript OOP 적용
- AI 활용 과정
- 트러블슈팅
- 실행 방법
- 테스트한 사용자명
- 느낀 점
```

---

## 18. README 플레인 텍스트 요청

### 내가 입력한 말

```text
렌더링 하지 말고 플레인 텍스트로 하되 마크다운 문법으로 다시 정리해줘
```

### AI 답변 요약

```text
README.md에 그대로 붙여 넣을 수 있도록, 마크다운 문법을 유지한 플레인 텍스트 형태로 다시 정리했다.
```

---

## 19. prompt.md 생성 요청

### 내가 입력한 말

```text
프롬프트 로그를 prompt.md로 만들어줘
이 또한 렌더링 없이 플레인 텍스트로 마크다운 문법으로 만들어줘
```

### AI 답변 요약

```text
과제 진행 중 AI를 어떻게 활용했는지 정리하는 prompt.md 초안을 작성했다.

하지만 일부 문장은 실제 사용자가 입력한 표현과 다르게 일반화되어 있었기 때문에, 이후 사용자가 실제로 하지 않은 말은 넣지 말라고 요청했다.
```

---

## 20. prompt.md 수정 기준

### 내가 입력한 말

```text
내가 안했던 말 넣지 말고
```

### 수정 기준

```text
prompt.md에는 실제로 사용자가 입력한 말과 그에 대한 AI 답변 요약만 작성한다.

사용자가 직접 말하지 않은 프롬프트 문장은 새로 만들어 넣지 않는다.

필요한 경우 AI 답변은 "AI 답변 요약"으로 따로 정리하되, "내가 입력한 말"에는 실제 입력한 내용만 넣는다.
```