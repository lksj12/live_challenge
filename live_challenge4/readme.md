# Mini Spreadsheet Web App
## 프로젝트 개요
HTML, CSS, JavaScript로 만든 간단한 스프레드시트 웹앱입니다.  
사용자는 셀에 직접 값을 입력하고, 행/열을 추가 또는 삭제할 수 있으며, 입력한 데이터를 `.xlsx` 또는 `.csv` 파일로 저장할 수 있습니다.
## 사용 기술
- HTML
- CSS
- JavaScript
- SheetJS
- localStorage
- File System Access API
## 파일 구조
```text
mini-spreadsheet/
├── index.html
├── style.css
├── app.js
└── README.md

주요 기능

1. 스프레드시트 생성

* 기본 9행 × 9열 생성
* 열 헤더: A~I
* 행 헤더: 1~9
* 각 셀은 input type="text"로 구성
* JavaScript로 동적 생성

2. 셀 선택 표시

셀을 클릭하면 현재 위치가 표시됩니다.

Cell: D4

선택된 셀의 행 헤더, 열 헤더, 셀 자체가 하이라이트됩니다.

3. 데이터 입력 및 저장

* 한글, 영어, 숫자 입력 가능
* 각 셀 값은 독립적으로 유지
* 입력값과 행/열 개수는 localStorage에 저장
* 새로고침 후에도 데이터 유지

4. 행/열 추가 및 삭제

* Add Row: 마지막에 행 추가
* Delete Row: 선택된 행 또는 마지막 행 삭제
* Add Column: 마지막에 열 추가
* Delete Column: 선택된 열 또는 마지막 열 삭제
* 최소 1개의 행과 열은 유지

5. 파일 Export

Export SpreadSheet 버튼을 누르면 로컬 저장 창이 열립니다.

저장 창에서 다음을 선택할 수 있습니다.

* 저장 위치
* 파일명
* 파일 형식

지원 형식:

* .xlsx
* .csv

.xlsx와 .csv 생성에는 SheetJS를 사용합니다.

데이터 구조

셀 데이터는 2차원 배열로 관리됩니다.

[
    ["", "", ""],
    ["3333", "", ""],
    ["", "", "ㅇ의"]
]

셀과 배열 위치는 다음처럼 대응됩니다.

셀	배열 위치
A1	data[0][0]
A2	data[1][0]
D4	data[3][3]

주요 함수

함수	설명
createGrid()	스프레드시트 생성
updateFocusedCell()	현재 셀 좌표 표시
highlightHeaders()	행/열 헤더 하이라이트
collectGridData()	전체 셀 데이터 수집
addRow()	행 추가
deleteRow()	행 삭제
addColumn()	열 추가
deleteColumn()	열 삭제
saveStateToLocalStorage()	데이터 저장
loadStateFromLocalStorage()	데이터 불러오기
exportSpreadsheet()	파일 Export

실행 방법

1. 프로젝트 폴더에 아래 파일을 생성합니다.

index.html
style.css
app.js
README.md

2. index.html 파일을 브라우저에서 엽니다.
3. 셀 입력, 행/열 추가 삭제, Export 기능을 테스트합니다.

테스트 항목

* 기본 9×9 그리드가 표시되는지 확인
* 셀 클릭 시 Cell: C1, Cell: D4처럼 표시되는지 확인
* 선택된 행/열 헤더가 하이라이트되는지 확인
* 셀 입력값이 새로고침 후에도 유지되는지 확인
* 행/열 추가 및 삭제가 정상 동작하는지 확인
* .xlsx 또는 .csv로 저장되는지 확인
* Google Spreadsheet에서 Import했을 때 셀 위치가 유지되는지 확인

참고 사항

showSaveFilePicker()는 Chrome, Edge 등 일부 브라우저에서만 지원됩니다.
지원하지 않는 브라우저에서는 기본 .xlsx 다운로드 방식으로 동작합니다.