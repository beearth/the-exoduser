# Unity 대장간 창 (분모 A14, 웹 `#forge`) — PC-A14 (2026-10-26)

기준: 사용자 확정 "UI는 일단 그대로 이식". 웹 기준 커밋 `d5f32ff57`(`game.html` `renderForge` 50516~51200 및 `#forge` CSS). 구현: 단순작업2. 베이스 `d5f32ff57`, 브랜치 `claude/unity-pc-forge-a14-20261026`. 커밋은 맥북 총괄 검수 뒤.

## 1. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 신규 | `unity/Assets/Exoduser/Runtime/NativeForgePanel.cs` | 창 골격(1920×1080 설계 좌표), 글꼴·텍스트·글리프 도우미, 왼쪽 탭·닫기·스크롤바(웹 스크롤바 모양), 탭 전환·칩 선택 상태 |
| 신규 | `unity/Assets/Exoduser/Runtime/NativeForgePanel.Tabs.cs` | 6개 탭 본문(강화·물약·분해·리롤·유물·제작) |
| 신규 | `unity/Assets/Exoduser/Runtime/NativeForgePanel.Capture.cs` | `--unity-forge-capture <dir>` 검증 진입(NativeGame 수정 없이 스스로 열고 탭별 캡처·영수증 저장 후 종료) |
| 신규 | `unity/Assets/Exoduser/Runtime/NativeForgeData.cs` | 정의 JSON 클래스 + `ForgeFormulas`(웹 공식 이식) |
| 신규 | `unity/Assets/Exoduser/Resources/Data/forge_web.json` | 웹에서 뽑은 **정의**(이름·문구·탭 구성·공식 문구·어픽스 이름/단위 표). 출처 커밋·추출 시각 기록 |
| 신규 | `unity/Assets/Exoduser/Resources/Data/forge_glyphs.json` + `Art/ui/forge/forge_glyphs.png` | 웹 렌더 1x 크롭 글리프 아틀라스(이모지·슬롯 SVG 글리프·✔✖) 183개 |
| 신규 | `unity/Assets/Exoduser/Resources/Art/ui/forge/window_base.png` | 웹 대장간 창 정적 바탕(프레임·투구 장식·제목판·악의 띠·내용판)을 동적 요소를 숨기고 캡처한 980×1056 |
| 신규 | `docs/engine/unity_patches/A14_nativegame_forge_window.patch` | 창 열기 연결(NativeGame 소유 → patch만). 기존 6개 다음 7번째 |
| 읽기만 | `NativePanelTabBar.cs`(대장간 프리셋 사용), `NativeInventoryWebLayout.cs` | 수정 없음 |

웹 추출·캡처 스크립트와 산출물은 `E:/exoduser-wt/_out/pc-a14/`(`cap_forge_web.cjs`, `extract_forge_assets.cjs`, `build_atlas.py`, `build_defs.py`, `make_cmp.py`).

## 2. 정의와 상태 (전체총괄 원칙)

| 구분 | 값 | 출처 |
|---|---|---|
| 정의 | 제목 "복수의 대장간", 원소 안내 줄, 탭 6개 이름, 각 탭 제목·안내·필터·버튼 문구, 슬롯 이름·이모지, 등급 이름, 어픽스 이름·단위, 비용/확률 문구(제작 비용 100000, 영웅 90%·전설 10%, 리롤 100) | `forge_web.json` |
| 상태(Unity에서 읽음) | 악의 `Simulation.Materials`, 장착 장비 17슬롯(`InventoryState.Equipped`: 이름·등급·강화 `enh`·atk·티어·어픽스), 가방 목록(`InventoryState.Bag`, 분해 목록), 물약 단계 `Simulation.PotionState.PotLv`와 물약 레벨 게이트용 `Simulation.Player.Level` | Unity 실제 값(B11 물약 연결 포함) |
| 공식 이식(상태에서 계산) | 성공률 `99×0.99^n`(최소 0.5%), 비용 `_malCost(ceil(enhCostRaw×등급배율))`, ATK/DEF/HP/ST/MP 보너스 줄, 분해 악의 `salvageVal`, AI 자동 강화 예상 악의 | `ForgeFormulas`(줄번호 주석) |
| 미이식 표시 | 유물 가방(보유 수·가루·목록), 분해 선택 수(선택 기능 미이식이라 0) | 그 자리에 "미이식" |

웹 시작 스냅샷(`악의 1000`, 무기 `녹슨 검` 등)은 상태로 고정하지 않았다. Unity 값이 웹과 달라 보이는 곳(장비 이름·접두/접미 이름·분해 목록 8개 항목)은 무작위 롤 차이다.

## 3. 동작 범위

| 동작 | 상태 |
|---|---|
| 왼쪽 탭 전환(6개) | 구현 |
| 강화 탭 AI 자동 강화 칩 선택(선택 시 목표 강화치·예상 악의·시작 버튼 줄 표시) | 구현(표시 전환) |
| 스크롤(패널·분해 목록·리롤 목록, 휠·썸 드래그·화살표·트랙 클릭, 웹 스크롤바 모양) | 구현 |
| 닫기 [G]·ESC(+ 창 전환 K/TAB, 탭바 클릭) | 구현(연결은 patch) |
| 물약 카드 선택·확인 바·제작 클릭 | 구현(B11, `PotionState`·악의·플레이어 레벨 읽기). 강화 단계는 실행 중 상태이며 Unity save는 미이식. 실제 물리 마우스 검수는 별도 |
| 강화 시도·AI 강화 시작·분해·리롤·유물·일반 제작 실행, 분해 필터·선택, 유물 하위 탭·필터 | 모양만(누르면 아무 일 없음) |

## 4. 이모지 사용 위치 (웹 렌더 1x 크롭, 생성 이미지 아님)

총괄이 나중에 아이콘 교체 여부를 결정한다. 아틀라스 이름은 `<컨텍스트>:<글자>`.

| 위치 | 컨텍스트(글꼴 크기) | 글자 |
|---|---|---|
| 원소 안내 줄(`#forgeLore`) | `lore12`(12px) | 🔴 🔵 ⚪ |
| 강화 탭 AI 자동 강화 제목 | `ai15_2`(15.2px) | ⚡ |
| 강화 탭 AI 칩 14개 | `chip12_8`(12.8px) | ⚔️ 🛡️ 🦺 👑 👢 🏹 🧤 👖 📿 💍 🧣 ⭕ 🎀 ⚱️ |
| 강화 탭 장비 카드 제목 | `card14`(14px) | 위 14개 |
| 강화 탭 AI 예상 줄 | `tx_ok12_8`(12.8px, 글자색 입힘) | ✔ ✖ |
| 물약 탭 제목 | `pot14_4`(14.4px) | ⬆ |
| 물약 탭 카드 제목 | `card14` | ❤️‍🔥 |
| 분해 탭 슬롯 필터 | `salchip12`(12px) | ⚔️ 🛡️ 🦺 ⛑️ 👢 🏹 🧤 👖 📿 💍 ⭕ 🎀 |
| 제작 탭 제목 | `craft16_8`(16.8px) | 🔨 |
| 제작 탭 슬롯 카드 14개 | `craft20_8`(20.8px) | ⚔️ 🏹 🦺 🛡️ 👑 👖 🧤 👢 🥋 📿 💍 🧣 ⭕ 🎀 |
| 분해 목록·리롤 목록 슬롯 글리프(SVG 선 아이콘) | `svg<슬롯번호>:<색>`(15px, 등급색 7종×17슬롯) | 웹 `_slotGlyph` |

## 5. 연결 patch

`A14_nativegame_forge_window.patch`(NativeGame.cs만): `NativeForgePanel forge` 필드·생성, `OnPanelRequested("forge")`(열기/토글, 다른 창 닫기), 설정·인벤토리·스킬 요청 시 대장간 닫기, `Update`에서 대장간 열림 중 ESC 닫기·K/TAB 전환, `OnGUI` 그리기, `SetForge`, `ResetRun` 시 닫기. G 키는 기존 `HandlePanelHotkeys`가 `OnPanelRequested("forge")`로 보낸다. 순서는 기존 6개(U04B→U08 NativeGame→U08 PauseMenu→U05→A07B NativeGame→A07B PauseMenu) → A13(`A13_nativegame_stat_panel.patch`) → **A14** 의 누적 patch다(A14 변경만 담고 A13 변경은 넣지 않음). 8개를 순서대로 `git apply --check` 통과, 이 worktree에 실제 적용해 Win64 빌드 errors 0, 되돌린 뒤 NativeGame*·NativePauseMenu* 변경 0을 확인했다. A14 patch는 `statPanel`·`settings`·`invPanel`·`skillPanel` 요청 때 대장간을 닫고, `forge` 요청은 통계·스킬·인벤토리를 닫는다. 연결 동작은 `--unity-forge-capture`가 `NativePanelTabBar.Request`(탭 클릭·G 키가 일으키는 같은 이벤트)로 열기/토글/창 전환 9건을 검사한다(G 키 입력 자체는 기존 `HandlePanelHotkeys` 코드라 키 주입은 하지 않음).

## 6. 남은 차이

- 글꼴: 제목판·소제목 굵기는 나눔명조를 합성 굵게로 그려 웹(Noto Serif KR/나눔명조 실제 굵기)보다 약간 굵고 글자 폭이 3~5% 넓다. 소수 글자 크기(12.8·13.6·15.2px)는 IMGUI 정수 크기로 반올림.
- 둥근 모서리(3~6px) 칩·버튼은 사각 모서리.
- 마우스 호버 효과는 왼쪽 탭·닫기 버튼만.
- 웹 배경의 게임 장면 비침(5~15%)은 바탕을 검정에 구운 창 위에 Unity 장면이 겹치는 것으로 대체.
- 이모지·글리프는 1x 크롭이라 해상도 배율을 바꾸면 흐려진다(설계 좌표 1920×1080 기준).

2026-10-30 PC 현행 시각 자산·은빛 팔레트·Linear 글자 보정은 [Unity UI 원화 반영](UNITY_UI_ASSETS_20261030.md)을 따른다. 기능·저장·미이식 범위와 위 검수 이력은 유지하며, 현재 원화의 실제 Player 결과는 해당 문서의 정확 후보 영수증으로 구분한다.
