# Unity 공통 상단 탭바 (PC-U08, 2026-10-26)

기준 웹: `game.html` `_PANEL_TABS`·`_injectPanelNav` 44024~44048(탭 클릭 = `openPanel(id)`, 활성 탭 클릭 무시), 기본 `.panel-nav-tab` CSS, 창별 덮어쓰기 CSS(`ui-refinement.css`). 계산 스타일 덤프 `_out/pc-u08/web_tabbar_dump.json`.
브랜치 `claude/unity-pc-inventory-u04-20261026`, 베이스 `c2fdfc158`. 커밋은 맥북 총괄이 한다.

## 1. 컴포넌트 `Runtime/NativePanelTabBar.cs`

`Draw(Preset, activeId)` — 탭 5개를 그리고 클릭된(비활성) 탭 id를 돌려주며 `static event Action<string> Requested`("settings"/"invPanel"/"forge"/"skillPanel"/"statPanel")를 발생시킨다. 구독자가 없으면 클릭은 무동작이다. 활성 탭 클릭은 무시(웹과 동일). 배경 이미지는 웹 `button.webp`의 PNG 변환본(`Art/ui/inventory/plate.png`, U-04에서 변환)을 쓴다.

웹 근거(computed style): 탭 `font 500 12px(설정 창만 14px) Noto Sans KR`, `letter-spacing .02em`, `text-shadow 0 1px 2px #000`, 배경 = `linear-gradient(rgba(21,20,23,.51), rgba(11,10,12,.675))` + plate(100% 100%) + `#232225`, 활성 = `linear-gradient(rgba(87,23,12,.6), rgba(38,9,7,.72))` + plate, 색 없음, `inset 0 -2px #ac7953`, 글자 `#f4e6cb`(비활성 `#c7bead`), `:hover{filter:brightness(1.16)}`(Unity는 흰색 5% 덮개로 근사), nav 아래 1px 선.

| 창 | 프리셋 | nav x y w h | 탭 w x h | 간격 | 글꼴 | 아래선 |
|---|---|---|---|---|---|---|
| 설정 | Settings | 40 32 1840 49 | 363.2 x 40 | 6 | 14px | rgb(91,81,66) |
| 인벤토리(장비 페이지) | Inventory | 42 48 1836 48 | 365.6 x 39 | 2 | 12px | rgba(198,139,91,.24) |
| 인벤토리(유골함 페이지) | InventoryOssuary | 548 48 1330 48 | 264.4 x 39 | 2 | 12px | rgba(198,139,91,.24) |
| 대장간 | Forge | 500 48 920 41 | 182.4 x 32 | 2 | 12px | rgb(91,81,66) |
| 스킬 | Skill | 36 26 1848 41 | 368 x 32 | 2 | 12px | rgb(91,81,66) |
| 능력치 | Stat | 35 27 1850 41 | 368.4 x 32 | 2 | 12px | rgb(73,58,49) |

폰트: 웹 500은 Noto Sans KR Regular보다 굵게 보여 SemiBold 파일로 맞췄다(500 전용 파일 없음).

## 2. 적용

| 위치 | 변경 |
|---|---|
| `NativeInventoryDock.DrawNavigation` | 표시 전용 탭 대신 컴포넌트(장비/유골함 페이지 프리셋 자동 선택). 웹에 있는 nav 아래선도 새로 그려짐 |
| `NativeSkills.Draw` | 창 좌표를 1920x1080로 바꿔 스킬 프리셋 탭바를 맨 위에 그림. 기존 1280x720 본문은 탭바 아래(오프셋 64,72, 1.4배)로 내림. U-05에서 창 전체를 다시 그릴 때 탭바 호출 한 줄을 그대로 쓴다 |
| 설정 창 | `NativePauseMenu`(수정 금지)는 patch로 |

## 3. 연결 patch (적용 안 함, `git apply --check` OK)

| patch | 내용 |
|---|---|
| `docs/engine/unity_patches/U08_nativegame_tabbar.patch` (원본 `_out/pc-u08/nativegame_tabbar.patch`) | `Requested` 구독/해제, `OnPanelRequested`(settings = 일시정지 메뉴, invPanel = `SetInventory(true)`, skillPanel = `SetSkills(true)`, forge/statPanel = 로그만, 열려 있던 다른 창은 먼저 닫음, 메뉴에서 넘어올 때 `Running=true`로 복귀 상태 보존). 웹 키 규칙: 인벤토리가 열린 상태에서 K → 스킬 창으로 전환, 스킬 창이 열린 상태에서 TAB → 인벤토리로 전환 |
| `docs/engine/unity_patches/U08_nativepausemenu_tabbar.patch` | 일시정지/설정 메뉴에 설정 프리셋 탭바 그리기(배경 덮개 직후, 1920x1080 행렬) |

patch를 적용하지 않은 빌드에서도 컴포넌트는 이벤트만 쏘므로 무동작이다(이번 빌드·스모크는 patch 미적용 상태).

## 4. 웹 키 동작 조사 (`game.html`)

| 상황 | 웹 동작 | 근거 |
|---|---|---|
| 창이 닫힌 상태에서 TAB/K/J | 해당 창 열기 | `update()` 32117~32121 `isJust('inventory'/'skill'/'stats')` → `togglePanel` |
| 창 A가 열린 상태에서 다른 창 키(예: 인벤토리에서 K) | A를 닫고 곧바로 B를 연다(직접 전환, 게임은 계속 일시정지) | `togglePanel(id)` 44051: `closeAllPanels()` 후 열려 있던 창이 아니면 연다 |
| 같은 창 키를 다시 | 닫기(토글) | 같은 함수의 `isOn` 분기 |
| G (대장간) | `G.forgeOpen`이면 닫고, 아니면 `openPanel('forge')`로 열기. 다른 창이 열려 있어도 직접 전환 | 32122 |
| 탭 클릭 | 비활성 탭 → `openPanel(id)`(다른 창 전환), 활성 탭 → 무시 | 44044 |
| ESC | `_panelBack()`: 팝업/하위 상태를 먼저 닫고, 그다음 열린 창(inv/forge/stat/skill)이면 모두 닫기(게임 재개), 설정이 열려 있으면 설정 닫기. 아무 것도 없을 때만 설정 열기. 즉 인벤토리에서 ESC는 설정이 아니라 닫기 | 13184~13188, 44060~44076 |
| F10 | `togglePanel('settings')`(어느 창에서든 설정으로 전환) | 13207 |

Unity 현재 동작과 차이(이번 단위에서는 키 동작을 바꾸지 않음, 위 patch의 K/TAB 전환만 제안):

| 항목 | Unity | 웹 | 상태 |
|---|---|---|---|
| 인벤토리에서 K | 무시 | 스킬 창으로 전환 | patch에 포함 |
| 스킬 창에서 TAB | 무시 | 인벤토리로 전환 | patch에 포함 |
| 인벤토리에서 G | `InventoryKey.SwitchPane`(가방/장비 칸 전환) | 대장간 열기(직접 전환) | **충돌, 총괄 결정 필요**(대장간 창이 Unity에 없음) |
| J | 없음 | 능력치 창 | 창 없음 |
| 일시정지 메뉴에서 TAB | 메뉴 항목 이동 키 | 인벤토리로 전환 | **충돌**(patch는 메뉴 내 TAB 전환을 넣지 않음) |
| 인벤토리 ESC | 닫기 | 닫기 | 동일 |

## 5. 상태 값 처리 원칙 반영 (웹 값은 "정의"만, "상태"는 Unity에서)

| 항목 | 이전 값 | 새 출처 / 처리 | 근거 |
|---|---|---|---|
| 머리줄 "악의: N" | `1000` 고정 문자열 | `NativeGame.Instance.Simulation.Materials` (NativeGame 수정 없이 읽기). 형식은 웹 `_L('악의: ')+G.mats`(game.html 50170)와 같이 천 단위 구분 없음. Instance 없으면 "미이식" | 상태 |
| 장비 페이지 "유물 홈 a / b" | `0 / 0` 고정 | 장착 아이템의 `crystals.Length` 합 / `socketCount` 합(상태 계산). Unity는 소켓 0 아이템만 받으므로 결과 0 / 0 | 상태에서 계산 |
| 오른쪽 "유물 장착 a / b" | `0 / 0` 고정 | 위와 같은 계산 | 상태에서 계산 |
| "장착 부위 n / 16" | 이미 계산 | 장착 칸 수(봉안함 제외) / 16(슬롯 정의) | 유지 |
| 전투력, 공격/방어/추가 분해 값 | 이미 계산 | `InventoryCombatPower`(U-04) | 유지 |
| 가방 "(n/300)"(장비 페이지) | 이미 계산 | `State.Bag.Count`, 300 = `BagMax` 정의 | 유지 |
| 가방 "(0/300)"(유골함 페이지) | `0` 고정 | 가방에서 slot==ossuary인 아이템 수(Unity는 받지 않아 0) | 상태에서 계산 |
| "수집 0 / 4"(유골함 헤더) | 고정 | **"수집 미이식"** | Unity에 유골 수집 개념(INV.ossCollect) 없음 |
| 뼈 노드 4개 "미수집" | 고정 | **"미이식"** | 위와 같음 |
| 푸터 "유골 수집 중" 칩, 초상 아래 "유골 수집 중" | 고정 | **"미이식"** | 웹은 수집 상태로 결정(50124) |
| 초상 "유골 수집 0 / 4" | 고정 | **"미이식"** | 웹 50125 |
| "소환 전대 1 / 1" | 고정 | 유지 | 웹 50126 `(ai+1)/ANC_ROSTER.length`: 정의 목록(철갑 전대 1종)의 순번/크기. 선택 상태 없음 → 정의로 취급, 총괄 판단 가능 |
| 전대 이름 "철갑 전대", "ANCESTOR · 01", 안내문, 부위 이름 | 고정 | 유지 | 이름·문구 정의 |

## 6. 검사

| 검사 | 결과 |
|---|---|
| inventory-navigation | 34/34 |
| inventory-oracle (`u08-01`) | 892 checks / 0 failures (변화 없음) |
| Win64 빌드 | passed:true, errors 0 (patch 미적용) |
| 인벤토리 스모크(장비 / 유골함 페이지) | 전 필드 통과, initialEquipped 16, maxHp 526 |
| 스킬 스모크 | passed:true, failures 0 (6개 검사 모두 PASS) |

## 7. 남은 차이

| 번호 | 차이 |
|---|---|
| T-1 | `:hover` brightness(1.16)는 흰색 5% 덮개로 근사 |
| T-2 | 탭 글자는 SemiBold로 근사(웹 500) |
| T-3 | 스킬 창 본문(제단, 슬롯, 프레임, 창 테두리)은 임시 레이아웃. U-05 재작성 대상 |
| T-4 | 설정 창·대장간·능력치 창은 Unity에 없음(설정은 patch 대기, 대장간/능력치는 프리셋만) |
