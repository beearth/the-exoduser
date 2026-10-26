# PC-A16 키 바인딩 변경 (웹 `#keyBindList`) — 2026-10-26

worktree `E:/exoduser-wt/pc-unity-a16`, 브랜치 `claude/unity-pc-a16-20261026`, 베이스 `f9636b021`(patch 검사는 `9ec4a3274`의 1~15번 기준), Unity 6000.6.7f1. 산출물 `E:/exoduser-wt/_out/pc-a16/`.

## 1. 웹 근거 (game.html, 현재 main 줄)

| 항목 | 위치 |
|---|---|
| 기본 키 `BINDS`(20), `BINDS2` | 6188-6207 |
| 충돌 규칙 `_chainAttackBindingConflict`, `_setInputBinding` | 6226-6249 |
| 이름 `BIND_NAMES`/`BIND_NAMES_EN`, `keyName` | 6256-6300 |
| 목록 그리기·초기화·패드 탭·안내 | `renderSettings` 48703-48880 |
| 키 대기(ESC 취소, 반복 무시, 지정 후 저장) | 13185-13203 |
| 마우스 버튼 캡처 `#bindOverlay`(120ms 뒤 활성), F5 초기화 | 48850-48876 |
| 실제 위치 | 설정 창 **조작 탭**(`#settings-tab-controls`) `#keyBindList` — 1736px 2열 격자 (명세의 "왼쪽 열"이 아니라 이 탭 전체 폭). CSS는 `#settings.panel .pbox #keyBindList` 계열(계산 스타일 덤프 기준) |

웹 캡처 `E:/exoduser-wt/_out/pc-a16/web/` (격리 서버 3416, 종료함): `a16_1_default` · `_2_listening_main` · `_3_alt_set` · `_4_chain_conflict` · `_5_gamepad_tab` · `_6_after_reset(_notif)`, 각 위/아래(스크롤 끝) + `.json` DOM 덤프, `_styles_keybind.json`(확장 스타일).

## 2. 파일

| 구분 | 경로 | 내용 |
|---|---|---|
| 신규(상태) | `Runtime/Core/KeyBindings.cs` | 동작 20개·기본 키·이름 한/영·`keyName`·충돌 규칙·`TrySet`/`ClearSecondary`/`ResetAll`. 순수 C#(웹 키 코드 문자열) |
| 신규(입력) | `Runtime/NativeKeyBindInput.cs` | 공용 `KeyBindings` 1개, 웹 `event.code` ↔ Unity `KeyCode` 표(107개), `Down(action)`/`Held(action)`(주 키·보조 키 모두, `mouseN` 포함) |
| 신규(그리기) | `Runtime/NativeKeyBindList.cs` | 웹 목록 그대로: 탭 2개, 행 2열, 주/보조 키, ✕, 대기 상태(행 강조·버튼·안내), 초기화 버튼, 패드 탭(제목·행·초기화·가이드 상자), 클릭·키·마우스 대기 입력, F5 |
| 신규(캡처) | `Runtime/NativeKeyBindList.Capture.cs` | `--unity-keybind-capture <dir>` |
| 신규(정의) | `Resources/Data/keybind_web.json`(전체, .NET 검사용), `keybind_ui_web.json`(Unity용 배열형), `keybind_glyphs.json` + `Resources/Art/ui/keybind/keybind_glyphs.png` | 정의만. 글리프는 Noto Sans KR에 없는 ⌨ 🎮 ⟨ ⟩ ✕ 를 웹 렌더로 구운 것 |
| 신규(도구) | `Tools/keybind-web/`(extract·bake·build·mk_cmp·웹 캡처 스크립트), `Tools/keybind-parity/`(.NET 검사) | `unity/.gitignore`에 csproj 예외 3줄 |
| 수정(PC 소유 입력) | `NativeInventory.Keyboard.cs`, `NativeSkills.cs`, `NativeStatPanel.cs`, `NativeForgePanel.cs` | 창 닫기 키를 바인딩으로: 인벤토리 `inventory`(ESC는 고정), 스킬 `skill`, 능력치 `stats`, 대장간 `forge`(ESC 고정). 창 안 방향키·Enter·C 등 고정 키는 그대로 |
| 연결 patch | `docs/engine/unity_patches/A16_nativepausemenu_keybinds.patch`(**16번**), `A16_nativegame_keybinds.patch`(**17번**) | 아래 4절 |

## 3. 상태 / 미이식

| 항목 | 상태 |
|---|---|
| 기본값 20개, 이름 ko/en, `keyName`, 충돌 거부, 보조 삭제, 초기화 | 구현. 웹 함수를 샌드박스에서 실제 실행한 결과와 .NET 검사로 대조 |
| 저장 | **미이식**. `NativeSettingsStore`(schema `exoduser.unity.settings` v1)에 키 필드가 없어 실행 중에만 유지. 목록 맨 아래 작은 줄 "저장 미이식 · 이번 실행에서만 유지" 표시 |
| 게임패드 탭 | 웹 레이아웃 그대로. "고정" 칸은 웹 문구, 지정 가능한 5칸(LB·RB·Start·L3·R3)은 값 대신 **"미이식"**, 클릭 불가. 패드 초기화 버튼은 흐리게·동작 없음. 조작 가이드 표(정의 텍스트)는 그대로 |
| 언어 | 한/영만. 영어 문구는 웹 `_EN`에 있는 것만(없으면 웹처럼 한글 그대로) |
| 이모지(⌨ 🎮) | 웹 그대로 그림(웹 렌더에서 구운 글리프). 프로젝트의 "UI 이모지 금지" 방침과 충돌 — 처리 방침은 맥북 총괄 결정 |
| 키보드 포커스 링 | 웹은 버튼 클릭 후 흰 테두리 링이 보임 → 미이식 |
| 키 모서리 2px 반경, 사슬·무기 같은 키 거부 문구 | 아래 웹 특이사항 참고 |

### 웹 특이사항(웹 그대로 옮김, 판단 필요)

1. **초기화는 18행만 남긴다.** `window._resetBinds`의 리터럴에 `irisToggle`, `bladeToggle`이 없어, 초기화하면 이 두 동작이 목록에서 사라지고 키 없음이 된다(새로고침 전까지). Unity도 같게 구현(`KeyBindings.ResetAll`, 검사에 포함). 고치려면 `ResetActions`에 두 줄 추가.
2. **거부 문구와 초기화 알림이 설정 창에 가려져 안 보인다.** `#ph`(z 15)·`#notif`(z 22)가 설정 창 아래라 `elementFromPoint`가 `#keyBindList`를 돌려준다(캡처 확인). Unity는 `NativeKeyBindList.ToastsVisible=false`(웹과 같음), `true`면 그려진다(캡처 `unity_kb_4_chain_conflict_toast`, `..._6_after_reset_notif_toast`). 거부를 사용자가 못 보는 건 웹의 결함이라 `true`를 권장하나 결정은 총괄.
3. 목록 행은 `Object.keys(BINDS)` 순서(스킬이 `stats` 다음, `skill` 이름 줄 중복 정의 무시).

## 4. patch 16·17 (14·15는 A26이 가져감) — 1~15 위 `git apply --check`·적용 통과, 되돌림 확인

### 16 `A16_nativepausemenu_keybinds.patch` (NativePauseMenu.cs, NativePauseMenu.Keyboard.cs)

Unity 설정 창은 680×576 일시정지 메뉴의 탭 3개(화면·소리·조작 안내)이고 웹의 2열·전체 폭 조작 탭이 없다 → 억지로 바꾸지 않고, 조작 안내 탭에 **"키 설정 변경" 버튼**을 달아 목록을 전체 화면 페이지(1920×1080 설계 공간, 마우스 휠 스크롤, ESC/뒤로 닫기)로 연다. 설정 창 배치는 Codex A15 소관.

| 위치 | 변경 |
|---|---|
| 필드 | `keyList`, `keyPage`, `keyScroll`, `KeyPageOpen`, `KeyCaptureActive` |
| `Reset()` | 페이지 닫기, 대기 취소 |
| `Draw()` 맨 앞 | `keyPage`면 `DrawKeyPage()` 후 반환(키 이벤트를 목록이 받도록 `Event.Use` 앞에서) |
| `DrawControls()` | 안내 줄 키 이름을 현재 바인딩으로(`WASD`·`TAB`·`K`·`ESC` 고정 문구 → `KeyName`), 줄 높이 44→38, "키 설정 변경" 버튼 |
| `DrawKeyPage()` 신규 | 배경, 제목, 스크롤 영역, `keyList.Draw`, `DrawToasts`, 뒤로 버튼 |
| `PollKeys()` | `keyPage`일 때 대기 중이면 무시, 아니면 ESC로 페이지 닫기(TAB/K 창 전환 등 다른 키 처리 앞) |

### 17 `A16_nativegame_keybinds.patch` (NativeGame.cs)

| 위치(원문 줄) | 이전 → 이후 |
|---|---|
| 능력치 창 열림: K / TAB 전환 | `KeyCode.K`/`Tab` → `Down("skill")`/`Down("inventory")` |
| 대장간 창 열림: K / TAB 전환 | 같음 |
| 인벤토리 열림: K | `Down("skill")` |
| 설정(ESC 분기) | `Escape` → `Escape \|\| Down("settings")`(ESC는 웹도 고정 뒤로 키) |
| 스킬 창 열림 TAB | `Down("inventory")` |
| 스킬 창 열기 K, 인벤토리 TAB | `Down("skill")`, `Down("inventory")` |
| 줍기 안내 R | `Down("interact")` |
| 패링·칼등 Q/E 안내 | `Down("parry") \|\| Down("shield")` |
| 이동 W A S D (FixedUpdate) | `Held("up"/"left"/"down"/"right")` |
| 공격 유지 마우스 0 | `Held("weapon")` |
| 줍기 유지 R | `Held("interact")` |
| `HandlePanelHotkeys` | 키 대기 중이면 무시(`pauseMenu.KeyCaptureActive`), G → `Down("forge")`, J → `Down("stats")` |

바꾸지 않은 것: F10(웹도 고정), 첫 연습 화살표 이동, 보관함 N(Unity에 보관함 창 없음).
PC 소유 경로의 BINDS 소비자는 위 표의 PC 수정 4개 파일에서 처리.

## 5. 검사 · 빌드 · 종료 코드

| 항목 | 결과 |
|---|---|
| `Tools/keybind-parity` (웹 샌드박스 시나리오 21단계 포함) | 1079 checks / 0 failures, `KEYBIND_PARITY_OK` |
| inventory-navigation / oracle / stat-parity | 35/35 · 892/0 · 2/2 MATCH |
| Win64 빌드 (a) patch 미적용 | Succeeded, errors 0, warning CS 0 |
| Win64 빌드 (b) patch 1~17 적용 | Succeeded, errors 0, warning CS 0 (이 worktree 기준에 없는 A24/A26 클래스 파일을 컴파일 확인 동안만 임시로 `9ec4a3274`에서 가져왔다가 삭제). 이후 17→1 역순 `apply -R`, `NativeGame*`·`NativePauseMenu*` 변경 0 |
| `--unity-keybind-capture` | 종료 코드 0, 점검 통과(코드표 107개 왕복, 기본 높이 688, 초기화 버튼 y 644, 키 사각형 x/폭, 대기 717, 패드 788.66, 초기화 후 18행 등), 이미지 13장 |
| 일시정지 메뉴의 "키 설정 변경" 페이지 | 컴파일·`apply --check`만 확인, 실제 화면 캡처는 없음(NativeGame 연결 상태에서의 동작 검증 필요) |

## 6. 비교 이미지 · 남은 차이

`E:/exoduser-wt/_out/pc-a16/cmp/`: 상태별 `a16_<상태>.jpg`(0.5x) + 1x 크롭 `a16_crop_rows3` `_waiting_button` `_waiting_hint` `_alt_delete` `_reset_button` `_pad_rows` `_toast_*`. 판정(1x 직접 확인): 탭·행·키 버튼·✕·대기 버튼·초기화 버튼·패드 가이드 모두 웹과 구분하기 어렵다.

남은 차이: Unity 쪽 배경은 검정(웹은 설정 창 프레임·마우스 커서 구역 포함), 포커스 링 없음, 키 버튼 모서리 직각, 대기 행 강조 그라데이션이 약간 약함, 저장 안내 줄(Unity만), 패드 값 칸 "미이식".

## 7. Codex 요청 초안 (구현 금지, 제안만)

1. **설정 저장 schema**(`exoduser.unity.settings` v1 → v2): 필드 `binds`(동작 id → 웹 키 코드 또는 null, 20개)와 `binds2`(보조). 기본값 = `KeyBindings`의 기본 20개, 보조는 전부 null. v1 파일에는 두 필드가 없으므로 기본값으로 읽기. 저장된 `binds`는 알려진 동작만 병합(웹 `if(k in BINDS)`와 같음), 알 수 없는 키·형식 오류는 무시. 쓸 때는 현재 `Listed`에 없는 동작(초기화 후 사라진 2개)도 기본값을 쓰지 않고 null로 저장할지 결정 필요(웹은 새로고침하면 기본값으로 복귀). 패드 매핑(`gpKeyMap`)은 Unity 패드 입력이 생길 때 별도 필드.
2. **설정 창 배치(A15)**: 웹 조작 탭은 전체 폭 2열 목록(스크롤 영역 약 1830×652)이다. Unity 설정 창이 이 폭을 받는 구조가 되면 patch 16의 전체 화면 페이지를 설정 창 안 `NativeKeyBindList.Draw(origin, visible)` 호출로 바꾸면 된다(API는 스크롤·클립을 호출하는 쪽이 갖는 형태).

## 9. 총괄 결정·검수 (맥북 총괄, 2026-10-26)

- 1x 비교 직접 확인: 탭·행(854×53)·주 키·보조·대기 버튼·초기화가 웹과 같다. 차이 = 대기 버튼의 금빛 포커스 테두리 없음, Unity 쪽 배경(설정 창 프레임 없음), "저장 미이식" 안내 줄.
- 웹 특이사항 3건은 **웹 그대로**(UI 웹 동일 원칙): ① 초기화가 18개만 되돌려 `irisToggle`·`bladeToggle` 행이 사라짐 — 그대로 ② 사슬 거부·초기화 알림이 설정 창 아래에 가려져 안 보임 — `ToastsVisible=false` 그대로 ③ 탭 이름의 ⌨·🎮 이모지 — 웹 원본에 있으므로 이식은 그대로 두고, 프로젝트 규칙(게임 UI 이모지 금지) 위반은 **웹 쪽에서 먼저 고친 뒤 따라간다**(웹 수정 여부는 사용자·전체총괄 판단). 셋 다 웹 결함 후보로 기록.
- patch 번호 확정: **16 `A16_nativepausemenu_keybinds`**, **17 `A16_nativegame_keybinds`**(1~15 위 적용·역순 확인).
- 상태: patch 16의 일시정지 메뉴 "키 설정 변경" 페이지는 컴파일·적용만 확인, 실제 화면 캡처가 없어 보드 **A16 = 1**. patch 1~17 적용 빌드에서 그 페이지 캡처·1x 확인 뒤 2.
- 브랜치: 이 커밋은 `claude/unity-pc-a16-20261026`(베이스 `f9636b021`). 누적 브랜치 병합은 `pc-unity-win` 작업(B11) 커밋 뒤.
