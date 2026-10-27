# A15 키 목록 E→Q MouseDown 진단 인계 — 2026-10-27

## 기준과 현재 판정

- 대상 원격 `unity/main=7c3027f037c5715f59c1c3e0cb6e20e531d12f55`; `NativeKeyBindList.cs` blob `ad31529782229530c1fcaccfa2c1b42d02f64a9f`, `NativePauseMenu.cs` blob `e35eccc603cda438fd31a26bf44cc44ef3688880`.
- PC UI 소스 하네스는 1920×1080·1280×720, `keyScroll=0`·`132` 네 경우의 가시 버튼 36개씩 draw/hit 중심을 원 action/slot에 대조해 **144/144 일치**했다. QA 독립 정적 oracle도 E/Q draw와 hit가 같은 `mainR`을 쓰며, 두 rect가 겹치지 않음을 확인했다. 이는 소스 수식의 정적 판정이다.
- Mac Player에서 보인 **E 클릭→Q 캡처 대기**는 실제 클릭 검수 실패이며 **RETOUCH/HOLD**다. Mac의 이전 진단 턴은 선택적 `systematic-debugging` 파일을 찾지 못해 계측에 착수하지 않고 종료했다. 이후 총괄이 스킬 없이 재현·사전 상태·동일 이벤트 좌표계·QA flag/DPI 분리의 진단 재개를 실제 전달했다. 이 문서 작성 시점에 Mac 새 계측 결과는 없다. 제품 수정은 원인 확인 뒤 판단한다.

## 일반 설정 Controls 화면의 비교 좌표

`GUI.matrix` 배율은 `min(Screen.width/1920, Screen.height/1080)`이고 `content=(80,260,1760,610)`이다. 목록 origin은 `(12,14-keyScroll)`, 오른쪽 열 x=`882`, 주 키 rect은 행 내부 `(x+345.09, y+5, 251.61,42)`, `y=62+floor(index/2)*57`이다. 초기 20행에서 E=`shield`, index5; Q=`parry`, index8. 표는 **Game 뷰 픽셀** 기준이며 OS 창 좌표에는 장식·Retina/DPI 변환이 있을 수 있다. `scroll=132`는 초기 20행의 계산상 bottom이며 실제 Player scroll 값은 로그로 확인한다.

| Game 뷰 | `keyScroll` | E/shield 주 버튼 범위 x,y | E 중심 → 기대 | Q/parry 주 버튼 범위 x,y | Q 중심 → 기대 |
|---|---:|---|---|---|---|
| 1920×1080 | 0 | x=1319.09..1570.70, y=455..497 | (1444.895,476) → `shield:main` | x=437.09..688.70, y=569..611 | (562.895,590) → `parry:main` |
| 1920×1080 | 132 | x=1319.09..1570.70, y=323..365 | (1444.895,344) → `shield:main` | x=437.09..688.70, y=437..479 | (562.895,458) → `parry:main` |
| 1280×720 | 0 | x=879.393..1047.133, y=303.333..331.333 | (963.263,317.333) → `shield:main` | x=291.393..459.133, y=379.333..407.333 | (375.263,393.333) → `parry:main` |
| 1280×720 | 132 | x=879.393..1047.133, y=215.333..243.333 | (963.263,229.333) → `shield:main` | x=291.393..459.133, y=291.333..319.333 | (375.263,305.333) → `parry:main` |

E→Q 중심 차이는 1920에서 `(-882,+114)` Game 뷰 픽셀, 1280에서 `(-588,+76)`이다. 1920 `content` 그룹 로컬 E 중심은 `(1364.895,216-keyScroll)`, Q는 `(482.895,330-keyScroll)`이다. 별도 legacy QA `keyPage`라면 표를 쓰지 말고 경로를 로그에 명시한다; 초기 1920 E 중심 `(1439.895,327)`, Q `(557.895,441)`이다.

## Mac 단일 MouseDown 영수증

클릭 **전**에 pending capture를 명시적으로 해제하고, 선택한 메뉴 경로·Player PID/창·QA 자동화 flag·`Listening`/`listenAction`·binding을 기록한다. 그다음 화면의 E 버튼 중심 한 번을 클릭해 **같은 MouseDown 프레임과 GUI pass**에 아래 값을 묶는다.

1. `Screen.width/height`, OS 창 bounds, Retina/DPI 배율, 요청한 OS 커서 좌표와 실제 커서 좌표, 화면 캡처에서 보인 E 중심.
2. `GUI.matrix`, `content`/부모 그룹, `keyScroll`, `visible`, 그룹 진입 전과 `BeginGroup(content)` 직후의 `Event.current.mousePosition`; 이 값들이 각각 어느 좌표계인지와 `GUIUtility.GUIToScreenPoint`로 변환한 E/Q `mainR`.
3. E/Q `mainR` 값과 `Rect.Contains` 결과, `Event.current.type/button`, 실제 실행된 `Click(mainR)`·`BeginListening(action,false)` 분기, 선택 action/slot, 이벤트 소비 여부.
4. `HandleCapture` 호출 전후와 클릭 전후의 `Listening`, `listenAction`, `CaptureConsumedFrame`, binding. `HandleCapture`는 모든 행의 `Click`보다 먼저 실행된다. 클릭 전부터 Q(`parry`)가 Listening이고 0.12초가 지났으면 이 MouseDown을 Q에 `mouse0`으로 적용하고 `e.Use()`할 수 있다. 이번 사례가 그 경로인지는 사전 상태와 binding 변화로 확인한다.

그룹 전 좌표가 보인 E와 다르면 OS 클릭/창/DPI 대응을 확인한다. 그룹 전은 E, 그룹 후는 Q라면 `GUI.matrix`/`BeginGroup` 변환을 계측한다. 그룹 후도 E인데 Q가 선택되면 `HandleCapture` 선소비와 각 GUI pass/`Click` 추적을 본다. 모두 E와 일치해 shield가 선택되면 이전의 창·PID·스크롤·캡처 상태를 비교한다. **원인 확정 전 제품 patch는 0**이다. 1280 휠은 별도로 그룹 밖 `content.Contains(Event.current.mousePosition)`과 실제 ScrollWheel 이벤트 좌표부터 확인한다.

## 근거 원본

- PC UI: `I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/ui-simple/A15_HITRECT_PC_SOURCE_DIAG_20261027.md` 및 `a15-hitrect-source-results.json`.
- PC QA: `I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/qa-simple/a15-keylist-mouse-oracle-20261027.md`.

이 인계는 위 두 독립 정적 진단 중 Mac MouseDown 계측에 필요한 좌표와 로그 항목을 추린 것이다. 전체 언어 GUI·실마우스 PASS·제품 수정 승인은 뜻하지 않는다.
