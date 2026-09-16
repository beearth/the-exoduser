# 시작 대사와 키 안내 통합 4컷 — 2026-09-14

사용자 요청: “오픈유어아이즈 인트로랑 키가이드를 합쳐라, 4컷, 스킵 가능”. 적용 파일은 `game.html`, `game-easy-test.html`이다. 세계관 프롤로그 영상 및 챕터별 실습 튜토리얼과는 별도인 첫 스테이지 시작 안내다.

| 컷 | `_INTRO_LINES` 대사 (한글 / 영문) | `_INTRO_KEY_STEPS` 제목 | 키보드·마우스 기본 조작 | 패드 기본 조작 |
|---|---|---|---|---|
| 1 | 눈을 떠 / Open your eyes | 이동과 공격 / Move & attack | WASD 이동, 좌클릭 무기 공격, 우클릭 마법(탭 투사체·홀드 빔) | L 스틱, A, R3 |
| 2 | 정신 차려 / Get a grip | 패링과 이동 / Parry & movement | Q 마법 패링·보호막, E 칼등 처내기, Shift 사슬 이동, 방향키 더블탭 또는 Space+방향키 전격이동 | Y, X, LB, LS 더블탭 또는 B+LS |
| 3 | 이제 진짜 지옥이야 / This is real hell | 스킬 / Skills | Space 지옥강타·분노 폭발, 1 가시덫, F 회복의 영역, Ctrl CT 스킬(뇌전걸음·얼음보주), T 석궁 자동발사 | B, LT+A, LT, RB. T는 기본 패드 매핑 없음: 패드 안내에서 행 생략 |
| 4 | 야! 몬스터다!!! / Hey! Monsters!!! | 살아남아 / Stay alive | R 줍기, Tab 인벤토리, Esc 설정. 설정 HP% 이하 자동 물약 | L3, D-pad 오른쪽, Start |

| 항목 | 런타임 계약 |
|---|---|
| 구성 | `_INTRO_LINES` 기존 문장 4개 보존, `_INTRO_KEY_STEPS`도 4개. 각 컷에 대사와 키 안내를 동시에 표시 |
| 순서 | `_startIntro()` → `_startIntroGuide()` → 컷 1~4 → `_finishIntroGuide()` → `_openIntroCurtain()`. 기존 `_showIntroLine`, `_showIntroDiff`, `_showIntroKeys`, `_ikB` 제거 |
| 진행 | 자동 넘김 없음. 안내 영역 클릭, 다음 버튼, Enter/Space, 패드 A로 다음 컷. 마지막 버튼은 시작 |
| 스킵 | 첫 컷부터 Space 2000ms 홀드 / 건너뛰기 버튼 / Esc / 패드 Start. 해당 인트로를 종료하고 같은 커튼 열기·스폰 경로로 진행 |
| 홀드 | Space 첫 누름부터 실시간 2000ms. 스킵 버튼 배경에 진행률 표시. 키 해제·blur·visibilitychange에서 취소하며 종료 뒤 이벤트 해제 |
| 입력 간격 | 첫 표시 및 다음 넘김 뒤 250ms 동안 다음 입력 무시. 스킵은 대기 없이 가능. key repeat 무시 |
| 포커스 | 시작 시 다음 버튼. Tab으로 다음·스킵 순환, Enter/Space로 포커스 버튼 실행. 완료 시 버튼 blur |
| 종료 방어 | `state.done`으로 중복 완료 차단, RAF 즉시 취소. 900ms 커튼 열림 동안 키 입력을 흡수한 뒤 `_disposeIntroGuide()`로 핸들러·상태 해제 |
| 패드 | 시작 시 눌린 버튼은 기준 상태로 기록. A·Start의 새 누름만 사용. 연결 상태가 바뀌면 안내 갱신. `G._intro` 동안 일반 패드 UI/전투 처리는 `_gpClearAll()` 후 Start 눌림 상태를 `_gpBtnsPrev._noUI9`에 기록하고 return(스킵 뒤 홀드로 설정창 열림 방지) |
| 언어 | 정식 game.html: 제목·설명·버튼·대사를 기존 `_L(ko,en)`로 조회하며 열린 안내도 변경 즉시 갱신. 미등록 비KO 문구는 영어 폴백. 대사는 선택 언어 한 줄(`introTextKr`), `introTextEn`은 빈 리프. game-easy-test.html은 기존 EN/KO 분기·한영 대사 병기 유지 |
| 키 변경 | 이동·공격·패링·사슬·Space·줍기·인벤토리·설정은 `BINDS`에서 현재 키를 읽어 `keyName(...,true)` 표시. 패드는 기본 매핑 안내 |
| DOM | `#introTextPanel`을 `#introKeys` 내부로 이동. 대사·제목·힌트·버튼은 리프 `textContent`; 조작 행은 `replaceChildren()` 뒤 `createElement`/`appendChild`로 생성 |
| 화면 | 중앙 패널 폭 `min(720px,calc(100vw - 96px))`, 높이 상한 `calc(100vh - 48px)`, 세로 넘침 스크롤. 진행 숫자 1 / 4~4 / 4 |
| 난이도 | 안내 시작에서 기존 고정값 `OPT.diff=5`, `G._stageDiffOff=0`, `saveSettings()` |
| 음성 | 공용 `voice_wakeup` 첫 컷에 1회 요청. 비동기 로드 완료 후 동일 세션이 진행 중일 때만 재생; 스킵/종료 뒤 새 재생 차단 |
| 게임 진입 | 기존 커튼 CSS 0.8초·900ms 후 숨김, 무적 600f, 안전 반경 500px, 580px 주변 5마리, 모닥불 t300/r280 보존 |

검증: `test/introFourCuts.test.js`는 양 엔트리에서 4컷 진행, 모든 컷 스킵, 중복 입력, 패드 홀드/Start, 늦은 음성 로딩을 실행한다. `test/gameStartGuideCinematic.test.js`는 통합 DOM·중앙 배치를 확인한다. 브라우저 증거는 `output/intro_four_20260914/qa.json` 및 각 컷 캡처에 저장한다.
