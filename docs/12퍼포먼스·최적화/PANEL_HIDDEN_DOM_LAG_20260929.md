# 2026-09-29 패널 닫은 뒤 렉 — 숨은 패널 DOM + :has() 재평가

사용자 보고: 설정(ESC)·유골함·보관함에 들어갔다 나오면 렉. localhost:3333(Chrome)과 NW.js 패키지 모두 발생.

## 원인

| 항목 | 내용 |
|---|---|
| 구조 | `.panel`(settings/invPanel/forge/statPanel/skillPanel)은 닫혀도 `display:flex; opacity:0` — 전체화면 요소로 DOM·스타일 트리에 계속 남음 |
| 트리거 | 인벤토리 유골함·보관함 탭을 열면 `#invPanel` 하위 DOM ~1995개 생성 (설정 446개). 닫아도 유지 |
| 증폭 | 스타일시트의 `:has()` 선택자 46개 (`body:has(#invPanel.on) …`, `body:has(:is(#settings,…).on) …` 등). HUD가 매 프레임 DOM을 바꿀 때마다 숨은 패널 DOM까지 스타일 재계산 |
| 증상 | 게임 로직 U·그리기 D는 1~2ms로 정상인데 Long Animation Frame의 render 구간이 50~90ms → FPS 231 → 73 → 33 |

## 실측 (사용자 Chrome 실탭, 2534×1262, Lv28 CH1-1)

| 구간 | FPS |
|---|---|
| 플레이 0~29s | 231 |
| 유골함·보관함 다녀온 뒤 | 73 → 33 → 29 |
| 런타임 `.panel:not(.on){display:none}` 주입 | 231 |
| 주입 제거 | 35 |
| 최종 수정 CSS 주입 후 유골함·보관함 2회 왕복 / 설정 왕복 | 240 / 240 / 239 |

자동화(Playwright, 새 프로필, 1920×1080 및 5626×2524 DPR0.5)에서는 재현 실패 — 설정만 여닫고 유골함·보관함 DOM을 만들지 않았기 때문.

## 수정 (game.html)

| 위치 | 변경 |
|---|---|
| `.panel` CSS (L378~) | `transition:opacity .25s,display .25s allow-discrete` + `.panel:not(.on){display:none}` + `@starting-style{.panel.on{opacity:0}}` — 닫힌 패널을 스타일/레이아웃 트리에서 제거, 열림 페이드인·닫힘 페이드아웃 유지 (Chromium 117+, NW.js 0.111.2 OK) |
| `renderSettings` F5 리셋 핸들러 | 매 렌더마다 새 함수 생성 후 remove → 기존 리스너 미제거로 keydown 리스너 누적. `window._bindResetHandler` 최초 1회만 등록으로 변경 |

## 주의·후속

- 닫힌 패널은 이제 `display:none` — 닫힌 패널 내부 요소의 크기(offsetWidth 등)를 읽는 코드는 0을 받는다. 패널은 열 때 render*로 다시 그리므로 현재 영향 없음.
- `:has()` 46개 자체도 비용 요인. 추가 최적화 필요 시 body:has 규칙을 JS 클래스 토글(body.panel-open 등)로 대체 검토.
- 관련 회귀: settings*/uiPanelInitialization/renderSettingsRestore/statPanelTransactions 39 PASS. `inventoryPaperdollLayout` 1 FAIL은 HEAD에서도 EQ_POS 10개 범위 이탈인 기존 실패(무관).
- 위 수정은 `13da66824`에 포함되어 main에 반영됐다. 아래 배포 사본 점검과 원본 수정 이력은 구분한다.

## 2026-09-30 실행 사본 재확인

| 사본 | 닫힌 패널 `display:none` / F5 핸들러 1회 등록 | 확인 결과 |
|---|---|---|
| 현재 main `game.html` | 둘 다 포함 | 3,943,470바이트, SHA256 `0bd8aafb499a1324f2155d230d4c7101738a886047b38a70f34b064ab54932b4` |
| 바탕화면 `EXODUSER_최신빌드_20260929/package.nw/game.html` | 둘 다 포함 | 현재 main과 바이트·SHA256 동일. 파일 수정 시각 2026-09-29 23:31 KST |
| G: 최초 바탕화면 준비본 / 퍼블리셔 r2 / 퍼블리셔 1005 | 둘 다 미포함 | 과거 스냅샷. 현재 바탕화면 실행 사본과 혼동하지 않는다 |

위 사본들 모두 전투 텍스처 워밍업은 존재한다. 이 점검에서 실행 중인 EXODUSER 프로세스는 없었고 사용자 빌드·세이브·프로필은 변경하지 않았다. 파일 일치 확인만으로 현재 빌드의 모든 프레임 드랍이 해소됐다고 판단하지 않는다.

### 같은 바탕화면 소스의 NW.js 재검수

실제 바탕화면 `game.html`을 읽어 계측만 추가한 독립 QA 사본으로 실행했다. 네이티브 EXE·nw.dll은 바탕화면과 해시를 대조했고, 정적 에셋은 바탕화면 사본을 사용했다. 포트3338·전용 APPDATA/Chromium 프로필·저장 함수 차단·QA 무적은 검사용에만 적용했다. 첫 인트로 진입 실패와 튜토리얼 대기 측정은 제외하고, 컷신과 연습 건너뛰기 UI를 거친 일반 필드만 최종 결과로 채택했다.

| 측정 조건 | 패널 왕복 전 draw FPS | 왕복 후 draw FPS | 후 draw p99 / 최대 | 적 수(전/후) |
|---|---:|---:|---:|---:|
| NW.js 0.111.2, 1600×900 | 239.05 | 239.75 | 2.9 / 3.7ms | 43 / 44 |
| 같은 실행, 전체화면5120×1440 | 238.42 | 239.75 | 1.6 / 3.1ms | 43 / 42 |

| 검수 항목 | 확인 결과 |
|---|---|
| 설정·길이 | high/resScale100/fpsCap0, 각 전·후12초×2해상도=48초 |
| 실제 UI 왕복 | 각 해상도에서 `qsTAB`→유골함→보관함→닫기2회, `qsESC`→설정→닫기4회 |
| 숨은 DOM | 보관함 방문 후 인벤토리1704개·설정442개 자손. 열림 `flex`, 닫힘 `none` 확인 |
| 프레임 공백 | 4개 표본 모두 rAF 간격>34ms 0회, Long Task0 / Long Animation Frame0 |
| 유효성 | G.on=true / paused=false, 튜토리얼 비활성. hidden·blur·해상도변경·정지 표본0 |
| 확인 범위 | CH1-1 고정 위치에서 실제 적 AI·공격이 진행되는 동안 패널 왕복 후 성능. 이동·전체 스킬·보스·장시간 전투까지 검수 완료한 것은 아님 |
| 파일·프로세스 | 원본 게임·패키지 설정·개인 세이브 수정0. 경로를 확인한 이번 QA 프로세스만 종료 |
| 근거 | `tmp/panel-lag-20260930/result.json`, `source.json`, `1600x900-after.png`, `fullscreen-after.png` |

현재 바탕화면 사본에서 패널 왕복 후 지속적인 FPS 붕괴는 재현되지 않았다. 이 결과는 과거 퍼블리셔 ZIP의 패치·재패키징·재업로드 완료를 뜻하지 않는다.
