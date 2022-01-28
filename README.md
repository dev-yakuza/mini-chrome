# 미니 크롬

## 상태 관리 (State Management)

- 메인 프로세스에서 싱글톤 패턴으로 전역 상태 관리

- windows : 모든 Window 인스턴스. 각 윈도우에는 현재 실행 중인 BrowserWindow 인스턴스와 tabs 정보 등이 함께 관리됨.

  - tabs : 특정 윈도우의 모든 Tab 인스턴스. 하나의 Tab 인스턴스에는 하나의 BrowserView 인스턴스와 tabId 정보가 함께 관리됨.

- tabId : 하나의 탭이 생성될 때마다 1씩 증가. 각 탭의 id로 배정되는 숫자 데이터.

## IPC(프로세스 간 통신) 로직 핵심 요약

- 특정 윈도우의 헤더 프로세스에서 메인 프로세스에 해당 윈도우 제거, 최소화, 최대화 토글 요청

- 특정 윈도우의 헤더 프로세스에서 메인 프로세스에 tabs 정보를 요청하고, 데이터를 응답받아 화면의 html 태그 추가 및 내용 수정

- 특정 윈도우의 뷰 프로세스에서 메인 프로세스에 개발자 도구 열기, 탭 제거 등의 요청하고, 메인 프로세스는 헤더 프로세스 혹은 해당 뷰 프로세스로 응답

## 디버그

- windowId 필요 : 2번째 창을 여는 경우 ipcRenderer 중복 등록 문제 발생

  - 혹은 복수의 창 생성 자체를 막는 것도 고려

- [x] 더블 클릭 방지 : loading 여부에 따라 잠시 동안 조작 불가능하도록

- [x] 메인 프로세스에서는 당연히 focusTabIdx 대신 focusTabId를 관리

- [ ] 처음 윈도우 생성 시점에 omnibox에 focus되지 않음

- [x] 이미 focus된 탭 클릭하는 경우 토글하는 것으로 간주하지 말기. 무의미한 재렌더링으로 인한 성능 저하.

## 구현할 기능 목록 (우테코 스타일)

### 윈도우

- [ ] 앱 실행시, 맥에서 아이콘 클릭시 새 윈도우 생성
- [ ] 페이지 내에서 target="\_blank" 등의 a 태그 클릭시, 커스텀 윈도우에 헤더, 탭이 새로 생성되도록 설정

### 헤더

#### 헤더 배경

- [x] 마우스로 텍스트 부분만 따로 선택할 수 없도록 설정
- [x] 헤더 내 스크롤 생성 방지
- [ ] focus되지 않은 윈도우에서는 위아래 색상 반대로 설정
- [ ] 더블클릭시 maximize

#### 신호등 컨트롤러

- [x] 윈도우든 맥이든 맥의 traffic lights 기능 그대로 구현
  - [x] 화면 닫기
  - [x] 화면 최소화
  - [x] 전체화면 모드 토글
- [x] 특정 버튼을 누르고 있으면 해당 버튼만 살짝 어둡게 색상 변경
- [x] 특정 버튼 누른 상태로 마우스 이동시, 드래그되지 않도록 설정
- [x] 특정 버튼에 마우스 hover시 클릭했을 때 발생할 이벤트에 대한 설명 표시
- [ ] focus되지 않은 윈도우에서는 세 버튼 모두 회색으로 설정
- hover했을 때 관련 아이콘 보여주기 (보류)

#### 탭

- [ ] 현재 윈도우에 존재하는 모든 view들에 대한 간략한 정보 표시
  - [ ] favicon
  - [x] 디폴트 favicon
  - [x] title 태그
- [ ] 특정 탭에 마우스 hover시 탭에 대한 정보 출력
  - [ ] title 태그
  - [ ] url 정보
- [x] 새 탭 생성 기능 구현

  - [x] 새 탭 생성 시점에 뷰 프로세스 갈아끼우기
  - [x] 새 탭 생성 시점에 input에 키보드 자동 focus
  - [x] 새 탭(=현재 화면에 보여지는 탭)은 다르게 보이도록 (focus)
  - [x] 새 탭 생성시, 메인 프로세스로부터 응답받을 때까지 로딩 상태. 탭 영역 클릭 방지.

- [x] 기존 탭 삭제 기능 구현

  - [x] 현재 focus된 탭을 닫는 경우 옆의 탭으로 focus 이동 + 페이지도 이동

- [x] 탭 클릭을 통해 화면에 보여주는 탭 변경

  - [x] 현재 화면에 대응되는 탭은 다르게 보이도록 (focus)

- [ ] 드래그 앤 드롭 기능 구현

  - [ ] 탭들 사이에서 좌우 이동시, 탭들의 순서 변경
  - [ ] 탭들의 영역을 벗어나는 경우 새로운 윈도우 생성

- [ ] 반응형 디자인 구현
  - [ ] 탭의 최소 width는 창 닫는 버튼 크기
  - [ ] focus된 탭은 창 닫는 x 버튼을 위로
  - [ ] focus되지 않은 탭은 favicon + title을 위로
  - [ ] 탭의 개수가 너무 많으면 새 탭 생성 버튼이 위로 오도록

#### omnibox

- [x] input에 focus된 상태에서는 border를 파란색으로
- [x] input에 url 입력하여 해당 탭에 페이지 로드
- [x] url 대신 키워드 입력하는 경우 구글 검색으로 이동

- [x] 로드된 페이지의 title로 해당 탭 업데이트

- [x] 엔터 누르면 곧바로 omnibox에서 unfocus되어 동일한 url 반복 입력 방지 - blur()

- [x] 현재 view에 표시되는 주소가 변한 경우 omnibox에 해당 url 출력

  - [x] url 입력에 따른 변화
  - [x] 페이지 내 이동에 따른 변화

- [ ] omnibox에 자체적으로 입력만 하고 전송하지 않은 데이터도 그대로 저장?

- https:// 부분은 보이지 않도록 설정

#### view utils

- [x] 뒤로 버튼 구현

  - [x] 뒤로 못 가는 경우 버튼 클릭 방지 및 어둡게

- [x] 앞으로 버튼 구현

  - [x] 앞으로 못 가는 경우 버튼 클릭 방지 및 어둡게

- [x] 뒤로/앞으로 가는 경우 탭의 정보와 뒤로/앞으로 갈 수 있는지의 여부 업데이트

- [x] 새로고침/중지 버튼 구현
  - [x] 로딩 중일 때는 중지 버튼으로 임시 변화
  - [x] 로딩 종료 후 새로고침 버튼으로 다시 변화

#### favorites

- [ ] 즐겨찾기 항목 클릭시, 현재 탭은 해당 url로 이동
- [ ] 각 url에서 별 모양 토글하여 즐겨찾기 추가 및 제거
  - [ ] 해당 데스크탑 내부에 자체적으로 즐겨찾기 목록 저장
  - [ ] 폴더 생성 기능 구현을 통해 즐겨찾기 목록 구조화

### 페이지

#### 새 탭 화면

- [x] 새 창 생성 시점에 생성되는 탭에 url이 없는 경우에 보이는 디폴트 화면
- [ ] 새 탭 생성 시점에 url이 없는 경우에만 보이는 디폴트 화면
- [ ] 새 탭의 화면 내부에서 즐겨찾기 목록 보이도록

#### 연결 실패 화면

- [x] 입력된 url로 페이지 로드 실패시, 실패 화면으로 이동

  - [x] 실패화면에 omnibox에 입력한 url 정보와 에러 코드 출력
    - [x] URI 디코딩을 통해 한국어 검색어 등 대응
  - [x] 실패화면의 title에는 omnibox에 입력했던 검색어 그대로 출력
    - [x] URI 디코딩을 통해 한국어 검색어 등 대응
  - [ ] favicon은 별도로 생성

#### 개발자 도구 범위 설정

- [ ] header : 개발 완료 후 개발자 도구 열릴 수 없도록 방지
- [ ] View : 개발자 도구 열릴 수 있도록 설정

#### 페이지 내 도구

- [ ] 화면 내에서 우클릭시 기본 기능

  - [ ] 개발자 도구 열기 기능
  - [ ] 새로고침
  - [ ] 뒤로
  - [ ] 앞으로

- [ ] a 태그 우클릭 후 링크 관련 기능
  - [ ] 새 탭에서 열기 기능
  - [ ] 새 창에서 열기 기능
  - [ ] 링크 주소 복사 기능

#### 단축키(윈도우 전체 혹은 현재 뷰에 설정)

- [ ] 개발자 도구

  - [ ] 맥 환경에서 COMMAND+OPTION+I 실행시, 현재 열린 탭의 View의 개발자 도구가 열리도록 설정
  - [ ] 윈도우 환경에서 F12 실행시, 현재 열린 탭의 View의 개발자 도구가 열리도록 설정

- [ ] 창 닫기 단축키 (COMMAND+W / CTRL+W)

- [ ] TAB으로 화면 내의 조작 가능한 영역들 순회
