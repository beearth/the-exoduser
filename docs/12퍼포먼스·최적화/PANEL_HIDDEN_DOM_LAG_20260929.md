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
- 커밋 미실시: 현재 브랜치 `codex/steam-languages-20260909`, game.html에 타세션 미커밋 변경 공존(MM). game.html main 단일 브랜치 규칙상 main 반영 필요.
