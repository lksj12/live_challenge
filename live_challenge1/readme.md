# 🎬 Netflix Clone

## 핵심 요약
- Netflix UI를 참고하여 HTML과 CSS만으로 클론 구현한 정적 웹페이지입니다.
- 카드 호버 시 1.25배 확대 및 정보 패널이 표시되며, 1024px / 768px / 480px 3단계 반응형이 적용되어 있습니다.
- TMDB 공개 이미지 서버를 활용해 포스터를 불러오며, 모바일 햄버거 메뉴는 JavaScript 없이 CSS 체크박스 핵(Checkbox Hack)으로 구현되어 있습니다.

---

## 💬 개발 프롬프트 로그

### Step 1 - 초기 구조 설계

Q: 첫번째 이미지와 두 번째 이미지를 합친 웹페이지를 만들거야. 전반적인 구조는 세번째 이미지와 같이 만들거야. 일단은 이미지 없이 index.html과 css로 placeholder만 잡아서 웹페이지 구조를 잡아줘.

A: Header / Banner / Cards / Footer 4단 구조로 구성. Netflix 색상 테마(#141414, #E50914) 적용. 카드 섹션은 Portrait(세로형)과 Landscape(가로형) 두 종류로 분리.

---

### Step 2 - 로컬 서버 실행

Q: 이걸 5137포트에서 테스트 해보고 싶은데 어떻게 해야하지?

A: Python / Node.js(npx serve) / http-server / VS Code Live Server 총 4가지 방법 안내. 포트 5137 지정 방법 설명.

---

### Step 3 - CSS 파일명 오류 수정

Q: css가 적용이 안 됐는데

A: style.css vs styles.css 파일명 불일치 문제 확인. href 경로와 실제 파일명을 일치시키는 방법 안내.

Q: styles.css로 파일명을 잘못 입력했었네

A: 파일명 변경 또는 link 태그 href 수정 두 가지 해결책 제시.

---

### Step 4 - 카드 호버 효과 추가

Q: 아직 이미지는 넣지 말고 카드 쪽에 마우스를 올렸을 때 이미지가 확대되서 보이는 호버 기능만 추가해줘

A: scale(1.25) 확대 효과 적용. 호버 시 정보 패널(▶ + 👍 버튼, 제목, 장르) 페이드인. z-index: 100으로 다른 카드 위에 표시. transform-origin: center bottom으로 잘림 방지.

---

### Step 5 - 반응형 + 이미지 적용

Q: 이제 반응형으로 만들어주고 외부에서 이미지 링크 가져와서 이미지 채워줘

A: TMDB 공개 이미지 서버 사용. Portrait 카드는 /t/p/w500/ 사이즈, Landscape 카드는 /t/p/w780/ 사이즈, Banner 배경은 /t/p/original/ 사이즈 적용. 모바일 햄버거 메뉴 추가. 브레이크포인트 1024px / 768px / 480px 3단계 반응형 적용.

---

### Step 6 - 깨진 이미지 처리

Q: 몇 개는 이미지가 없는데

A: TMDB 이미지 경로 오류 수정. onerror 폴백 처리 추가. 깨진 이미지는 Picsum Photos로 대체.

---

### Step 8 - 깨진 이미지 재처리 및 JavaScript 제거

Q: 이미지가 ?로 나와 (Who Killed Sara?, Cobra Kai, Elite, The Witcher, Dark 5개 깨짐)

A: TMDB 이미지 URL 만료 확인. CSS onerror 폴백 추가(방법 1)와 URL 직접 교체(방법 2) 두 가지 해결책 제시. 5개 항목 최신 URL로 교체.

Q: 자바스크립트가 있었어? 자바스크립트 없이 구현은 안 되나?

A: CSS 체크박스 핵(Checkbox Hack) 방식으로 JS 완전 제거. input[type=checkbox] + label + ~ 형제 선택자 조합으로 햄버거 메뉴 토글 구현. script 태그 삭제. 체크박스 ON 시 .mobile-menu 표시 및 햄버거 아이콘 색상 변경(#E50914) CSS로 처리.

Q: 이미지 URL 교체 + 스크립트 삭제한 전체 버전 올려줘

A: index.html / style.css 전체 최종본 제공. 변경 항목: script 태그 삭제, button→label 교체, id="mobileMenu" 제거, 깨진 이미지 5개 URL 교체.

---

## 📄 라이선스

본 프로젝트는 학습 목적으로 제작된 Netflix UI 클론입니다.
실제 Netflix 서비스와 무관하며 상업적 목적으로 사용하지 않습니다.

© 2024 Netflix Clone Project