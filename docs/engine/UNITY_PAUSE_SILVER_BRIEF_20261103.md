# Unity 일시정지 메뉴·인벤토리 제목 실버 헬 마감 — 작업 브리프 (2026-11-03)

- 요청 (사용자, Unity 캡처 2장):
  1. 일시정지 메뉴: "저기 ui 너무 투박하다 색이나 폰트나 다"
  2. 인벤토리: "저기 저렇게 대장간 고유 ui를 가릴거면 인벤토리 저 허접한 텍스트는 빼버려"
- 상태: **미착수(Unity)**. 클라우드 세션에서는 Unity 편집기가 없고 `unity/main`도 가져올 수 없어(디스크 한도) 코드를 읽어 원인 가설만 정리했다. 웹 쪽 인벤토리 제목 제거는 main 브랜치 `claude/festive-darwin-jrf8hy` 커밋 872f7326([WEB_UIUX_GAME 2026-11-03 절](../3.1%20ui%20hud%20디자인/WEB_UIUX_GAME_20261031.md#2026-11-03-인벤토리-제목-띠-제거))에서 끝났다.
- 브랜치: `unity/main`에서 `claude/unity-pc-*` 브랜치를 따서 작업하고 `unity/main`으로만 병합한다(CLAUDE.md "엔진별 버전 분리").

## 1. 일시정지 메뉴 — 코드 기준 원인 가설 (`unity/main` cbdcbc28 기준)

| 증상(캡처) | 원인 가설 | 고칠 방향 |
|---|---|---|
| 글자·판 전체가 회색으로 흐림 | `NativePauseMenu.Draw()`가 `GUI.enabled=oldEnabled&&navigation.Focused&&!navigation.WaitingForRelease`로 설정한다. 포커스가 없거나 키에서 손을 떼길 기다리는 동안 IMGUI 비활성 틴트가 걸리고, `MetalAction` 라벨도 `NativeSilverHellUi.Dim`(138,141,141)으로 바뀐다 | 입력 차단과 그리기를 분리해 정상 대비로 그린다 |
| 버튼판 뒤 판 크기의 회색 사각형 | `btn_plaque_20261029`·`btn_primary_composed`의 import 설정(Alpha Source, Alpha Is Transparency, 압축) 또는 `ButtonFocus`(`guide_button_glow`)가 모든 버튼에 그려지는지 의심 | 투명 영역이 그대로 보이는지 확인 |
| 계속하기 = 진홍 판 전체 | 주 버튼에 `btn_primary_composed`(진홍 판)를 쓴다 | 실버 헬 §1·§7(빨강은 작게)에 따라 은빛 판 + 진홍 빛(웹 `#gcModal .gc-ok` drop-shadow 수준)·양끝 보석 |
| 버튼 폭·정렬 불일치 | 계속하기 504px, 나머지 456px. 안내 두 줄은 왼쪽 정렬 | 폭·간격 통일, 안내 가운데 정렬 |
| 글꼴·색이 웹과 다름 | 제목 Hahmlet 300 32px `(226,223,217)`, 버튼 20px, 안내 16px `(157,160,160)` | 제목 = 웹 공통 제목 띠(40px `title_eye_medallion_20261031` + 24px Hahmlet 300 `#e6e3dc` 자간 .04em + 은빛 헤어라인). 버튼 Hahmlet 400 15~18px `#e6e3dc`(선택 `#f2f0ec`) 자간 .16em. 안내 Hahmlet 400 13~14px `#a7a49d`, 영문·키는 Cinzel |

`DrawSettingsA15`·`DrawQuit`도 같은 규칙을 쓰는지 확인한다. 웹 기준: `silver-hell-ui-kit.css`, [UI_COMPOSITION](../3.1%20ui%20hud%20디자인/UI_COMPOSITION_20260925.md) 2026-10-31(제목 띠)·2026-11-02(실습창 마감) 절.

## 2. 인벤토리 제목

Unity 인벤토리의 "인벤토리" 제목과 눈 메달이 상단 공통 탭 바 `대장간 [G]` 아래를 덮는다. 웹과 같게 제목·메달만 빼고, 전투력·악의오브·닫기 줄은 유지한다(웹 머리 줄 최소 높이 44px).

## 완료 조건

- 실제 Unity 플레이어에서 일시정지·종료 확인·인벤토리를 1920×1080·1600×900으로 캡처해 before/after·1x 크롭으로 직접 판정한다. 기준은 "웹 실버 헬 창 옆에 놓아도 같은 게임처럼 보이는가".
- 키보드 탐색(↑↓·Enter·ESC·TAB)과 포커스 표시가 그대로 동작한다.
- 컴파일·테스트 통과만으로 완료라고 하지 않는다. 결과는 이 문서 아래에 이어서 기록한다.
