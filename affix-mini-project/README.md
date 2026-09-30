# 유니크 어픽스 공방

EXODUSER의 미구현 유니크 어픽스 후보 22개를 살펴보는 독립 브라우저 미니 프로젝트다. 본게임 어픽스 적용, 아이템 저장, 세이브 데이터는 수정하지 않는다.

## 실행

리포 루트 `G:\exoduser`에서 프로젝트 서버를 켠다.

```powershell
& "C:\nvm4w\nodejs\node.exe" server.cjs
```

브라우저에서 [후보 공방](http://localhost:3333/affix-mini-project/)을 연다. 우선 제작 후보의 발동 순서를 직접 살펴보려면 [전투 루프 실험대](http://localhost:3333/affix-mini-project/sandbox.html?affix=U-D03)를 연다. 3333 서버가 이미 실행 중이면 다시 띄울 필요가 없다. 별도 패키지 설치나 빌드는 없다.

## 사용

| 기능 | 동작 |
|---|---|
| 원본 데이터 | `../docs/7아이템디자인/유니크_어픽스_리스트.md`의 D절 U-D01~22 표를 실행 시 읽는다. 문서의 효과·수치·코드 훅·위험 표기가 화면에 반영된다. |
| 후보 탐색 | 8개 계열 필터, 텍스트 검색, 우선 제작 TOP 8 필터를 조합한다. |
| 옵션 굴리기 | 문서의 정수 범위에서 균등 난수로 1회 굴리고 하·중·상옵을 표시한다. 프레임 롤은 초 환산도 보여준다. `%`의 아이템 저장값은 실제 구현 시 소수로 변환해야 한다. |
| 빌드 조합 | 후보 3개까지 선택한다. 선택한 id만 브라우저 `localStorage`의 `exoduser-affix-lab-build-v1`에 보관한다. 게임 세이브와 분리된다. |
| 문서 읽기 실패 | 서버에서 D절을 읽지 못하면 화면의 문서 선택으로 해당 `.md`를 직접 열 수 있다. |
| 전투 루프 실험대 | TOP 8 후보를 각각 2~3단계 행동으로 진행하며 분노·기동게이지·쿨다운·충격파/장판 수치를 본다. 옵션을 다시 굴리거나 같은 옵션으로 처음부터 반복할 수 있다. |

실험대의 적중·처치·장판 배치는 **미리 정한 상황**이다. D13·D14·D09의 피해 `100`은 실제 피해값이 아니라 비율을 읽기 위한 기준값이다. 전투 루프 실험은 조건과 계산 상한을 이해하기 위한 것이며, 본게임에서 스킬을 실행하거나 밸런스를 검증한 결과가 아니다.

## 파일

| 파일 | 역할 |
|---|---|
| `index.html` | 세 영역 레이아웃과 접근 가능한 조작 요소 |
| `styles.css` | 공방 화면과 반응형 배치 |
| `app.js` | 화면 이벤트와 문서 로딩 |
| `model.js` | D절 표 해석, 롤 판정, 빌드 선택 |
| `model.test.mjs` | 22개 데이터 로딩, 롤 구간, 빌드 중복·상한 검증 |
| `preview-desktop.png`, `preview-mobile.png` | 1440px·390px 실제 브라우저 검수 화면 |
| `sandbox.html`, `sandbox.css`, `sandbox.js` | TOP 8 행동 시퀀스 화면 |
| `scenario.js`, `scenario.test.mjs` | 시나리오 상태 계산과 상한·비용 검증 |
| `preview-sandbox-desktop.png`, `preview-sandbox-mobile.png` | 실험대의 1440px·390px 브라우저 검수 화면 |

검증: `C:\nvm4w\nodejs\node.exe --test affix-mini-project/model.test.mjs affix-mini-project/scenario.test.mjs`. Chrome 데스크톱·모바일에서 후보 22개 로딩, 상세 전환, 롤링, 빌드 선택, TOP 8 시나리오, 가로 넘침 없음도 확인했다.

이 화면은 기획 비교용이다. 실제 아이템 `UNIQUE_SPECIAL`, 전투 훅, 번역, 세이브 마이그레이션은 아직 구현되지 않았다.
