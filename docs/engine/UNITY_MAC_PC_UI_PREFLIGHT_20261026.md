# Mac ↔ PC Unity UI 누적 패치 사전 대조 — 2026-10-26

최신 판정: PC `a48faf9ea`의 1–19 순서를 Mac 소유 접점에 반영했다(1·13·14는 아래 Mac 문맥 적응). Unity C# 컴파일 PASS, Player 런타임 미검증. 아래 첫 표의 FAIL/PASS*는 **적용 전 preflight 이력**이며 최종 상태는 문서 끝의 후속 checkpoint다.

## 범위와 기준

- Mac 기준: `codex/unity-mac-20261024` `941ee99bc`. 제품 파일·Git 인덱스 변경 없이 읽기 전용으로 조사했다.
- 전달함 최신 요청: 원격 `main` `b0b49179c`의 `PC_TO_MAC_INBOX_20261021.md` 밤11. 이전 `24c20a94a` 18개 요청을 **`claude/unity-pc-inventory-u04-20261026` `a48faf9ea`의 19개**로 대체한다. 해당 원격 브랜치도 `a48faf9ea`로 확인했다.
- PC 소유 새 파일과 Mac 기존 파일은 아직 병합하지 않았다. 이 표는 PC가 제공한 `docs/engine/unity_patches/*.patch`를 Mac HEAD의 대상 10파일만 복제한 `_out/UNITY-MAC-UI-PREFLIGHT-20261026/sandbox`에서 순서대로 `git apply --check`한 결과다. 실패 패치는 건너뛰고 다음 패치를 검사했으므로 **19개 누적 적용 PASS가 아니다.** 세부 JSON·패치 사본은 같은 `_out`의 `preflight.json`·`patches/`에 있다.

| 순서 | 패치 | 단독 순차 검사 | 접점/판정 |
|---:|---|---|---|
| 1 | `U04B_nativegame_inventory_smoke_mana` | FAIL | `NativeGame.cs` inventory smoke 361행 부근. PC preimage는 기본 선택 해제 장면을 포함하지만 현재 Mac에는 그 장면이 없어 context 불일치. 3-way도 충돌 보고. |
| 2 | `U08_nativegame_tabbar` | PASS* | `NativeGame.cs` 패치 자체 적용 가능 |
| 3 | `U08_nativepausemenu_tabbar` | PASS* | `NativePauseMenu.cs` 패치 자체 적용 가능 |
| 4 | `U05_nativegame_skill_smoke_focus` | PASS* | skill smoke / `NativeGame.cs` |
| 5 | `A07B_nativegame_keys` | PASS* | `NativeGame.cs` / inventory smoke |
| 6 | `A07B_nativepausemenu_keys` | PASS* | pause keyboard / menu |
| 7 | `A13_nativegame_stat_panel` | PASS* | `NativeGame.cs` |
| 8 | `A14_nativegame_forge_window` | PASS* | `NativeGame.cs` |
| 9 | `A20_nativegame_levelup` | PASS* | `NativeGame.cs` |
| 10 | `A21_nativegame_death` | PASS* | `NativeGame.cs` |
| 11 | `A22_nativegame_stageclear` | PASS* | `NativeGame.cs` |
| 12 | `A23_nativegame_bossbar` | PASS* | `NativeGame.cs` |
| 13 | `A24_nativegame_areatitle` | FAIL | `NativeGame.cs` HUD 296행 부근. PC hunk는 무조건 표시하는 character badge를 기대하지만 Mac은 `DiagnosticUiEnabled` 조건을 추가했다. 3-way는 필요한 PC preimage blob이 없어 실패. |
| 14 | `A26_nativelobby_buildlabels` | FAIL | `NativeLobby.cs` 로비 버튼 134행 부근. Mac 로비·캡션 변경 후 PC context와 불일치; 3-way도 충돌 보고. |
| 15 | `A26_portverification_flavor` | PASS* | `PortVerification.cs` |
| 16 | `A16_nativepausemenu_keybinds` | PASS* | pause menu / keyboard |
| 17 | `A16_nativegame_keybinds` | PASS* | `NativeGame.cs` |
| 18 | `A16_nativegame_pausesmoke_keys` | PASS* | pause smoke / menu |
| 19 | `B11_simulation_autopotion` | PASS* | `Simulation.cs` / `EquipmentApplication.cs`; B11 Core 연결 범위로 UI 단위와 분리 |

`PASS*`는 앞선 실패 패치를 제외한 임시 누적 사본에서의 문맥 검사다. PC 소유 신규 C#·meta 파일이 함께 있어야 컴파일할 수 있고, Mac 빌드·실행·저장 schema 검수는 하지 않았다. 특히 1번을 해결하지 않은 채 2번 이후를 실제 제품에 적용하는 순서 변경은 승인하지 않는다.

## 소유·통합 접점

| 파일 구역 | 현재 확인 | 다음 통합에서 지킬 계약 |
|---|---|---|
| `NativeGame.cs` / `NativeGame.*Smoke.cs` | Mac의 현재 `NativeGame.cs` Git blob `7aa46b766bfa`; PC `a48faf9ea` 쪽 preimage `b9303e538208`. 1번 inventory fixture와 13번 HUD badge가 실제 충돌 | Mac 소유 동작·QA 플래그·진단용 배지만 보존하면서 PC hunk를 수동 재기준화. 충돌 해소 뒤 1→19 전체 순서 재검사 |
| `NativeLobby.cs` | Mac blob `20e7ff9020f8`, PC preimage `33472ec39d08`; 14번 빌드 라벨 위치의 로비·캡션 주변 문맥 불일치 | Mac 세계관/ATG 분기를 보존하고 PC build label 호출 위치만 별도 대조 |
| `NativePauseMenu.cs` / `NativeHud.cs` | 현재 Mac/PC Git blob이 각각 동일(`7400dcd0a59f`, `5f87773e1852`) | 3·6·16·18번 접점은 정적 적용 후보이나 A16 키 저장 schema v2는 이번 범위 밖 |
| `Simulation.cs` / `EquipmentApplication.cs` | 19번 patch는 임시 사본에서 문맥 검사 통과 | B11은 별도 Core 소유·난수 소비 변화 검수 뒤 통합; 이번 UI 단위에서 제품 연결 없음 |
| PC 신규 파일 | `NativePanelTabBar`, `NativeKeyBindList`, `KeyBindings`, `BuildFlavor`, `NativeAreaTitle`, `NativeLobbyBuildLabels`, `AutoPotion` 등은 Mac 기준에 없음 | PC SHA의 파일·meta·의존성을 정해진 단위별로 인수해야 컴파일 판정 가능 |

Mac 작업 인덱스는 검사 전후 모두 clean, staged diff 동일. 제품 파일·빌드·Player·일반 설정·저장 변경은 0이다. **권장 다음 단위는 1번의 Mac inventory smoke 기준 갱신을 PC와 확정하는 것**이다. 2–3번 U08 tab bar 쌍은 해당 선행 충돌을 해소하면 바로 검사할 수 있는 첫 UI 적용 후보이며, 새 임시 사본에서 1→3 순서를 다시 확인해야 한다. PC 답신 필요 항목은 1번의 갱신 hunk, 13번의 `DiagnosticUiEnabled` 보존 방식, 14번의 build label 삽입 기준점 세 가지다.

## 1번 U04B Mac 기준 적응 — 후속 단위

원격 `main` `d209075ec`의 전달함에는 더 최신 UI 대체 요청이 없고 PC 대상 브랜치도 `a48faf9ea` 그대로다. 1번 원본 patch의 두 변경은 inventory smoke 영수증 생성 직후 `Simulation.Player.MaxMana`·`Simulation.Player.Mana`를 읽어 `maxMana`·`mana`에 담는 것이다. 현재 Mac에는 patch context가 기대하는 기본 선택 해제 장면이 없으므로 **그 장면을 억지로 넣지 않고**, 동일한 영수증 생성 지점과 자료형 선언만 수동 적응했다. fixture의 장착·해제, 화면, `-output` 경로, 설정·캐릭터 저장 계약, 전투 수치는 바꾸지 않았다.

| 영수증 키 | 자료형 | 값/시점 | 출력 위치 |
|---|---|---|---|
| `maxMana` | `float` | `SetInventory(true)` 직후, 장착 조작 전 `Simulation.Player.MaxMana` | QA 전용 `--unity-inventory-smoke -output <격리 절대경로>`의 `inventory-smoke.json` |
| `mana` | `float` | 같은 시점 `Simulation.Player.Mana` | 같은 JSON |

백업: `_out/UNITY-MAC-UI-U04B-20261026/before/NativeGame.cs` SHA256 `17cf4abbdfa6655b2671f97516b7c2d70590630d19df4e3f5616ca4c7a85a558`. 적응 소스 SHA256 `63a119a75c027c74fc90d15166e1646e28c9767ac4def5c82ff7190a51eebc25`, 독립 diff `_out/UNITY-MAC-UI-U04B-20261026/U04B_mac_adapted.patch`. 이번 단위의 제품 변경은 `NativeGame.cs` 두 줄뿐이다. `git diff --check` 통과; Unity 빌드·Player 스모크는 범위 밖이므로 수치의 실제 JSON 관측 PASS는 주장하지 않는다.

적응 소스의 두 파일만 새 임시 사본에 넣고 PC 2 `U08_nativegame_tabbar` → 3 `U08_nativepausemenu_tabbar`를 순서대로 `git apply --check`와 임시 적용했다. **2/2 문맥 PASS**, 세부 `_out/UNITY-MAC-UI-U04B-20261026/u08-preflight.json`. 이 두 patch와 PC 소유 `NativePanelTabBar`는 아직 제품에 적용하지 않았다. 13·14번 충돌은 그대로 미해결이다.

## PC 소스 인수와 2→3 U08 실제 연결 — 후속 checkpoint

Mac `ef8080387` 위에 PC 원격 `a48faf9ea`를 merge했다. 충돌은 `NativeGame.cs` inventory smoke 하나였고 U04B 영수증·Mac fixture 선택 흐름을 보존했다. PC 소유 `NativePanelTabBar`와 관련 창 파일은 PC blob 그대로 인수했다. merge checkpoint에서 Unity 빌드·Player는 실행하지 않았다.

| 순서 | Mac 소유 연결 | 적용 결과 | 웹/PC 계약 |
|---:|---|---|---|
| 2 | `U08_nativegame_tabbar.patch` → `NativeGame.cs` | `git apply --check` 후 실제 적용 | `NativePanelTabBar.Requested` 구독·해제와 `settings`/`invPanel`/`skillPanel` 요청, 기존 실행·일시정지 상태 연결. `forge`·`statPanel`은 후속 패치 전까지 로그 경로 |
| 3 | `U08_nativepausemenu_tabbar.patch` → `NativePauseMenu.cs` | 2 뒤 `git apply --check` 후 실제 적용 | 설정 창에 Settings 프리셋 탭바 표시 |

두 patch는 PC 원본을 수정하지 않고 받은 순서대로 적용했다. `NativeGame.cs`의 ATG 세계관 분기·기존 저장 경로는 이 patch 범위가 아니다. 파일별 `git diff --check` 통과. 4–12 hook·Mac 컴파일/Player 판정은 다음 단계이며 13·14 충돌은 보류한다.

## 4→6 스킬 포커스·웹 창 키 실제 연결 — 후속 checkpoint

| 순서 | Mac 소유 연결 | 검사·결과 |
|---:|---|---|
| 4 | `U05_nativegame_skill_smoke_focus.patch` → `NativeGame.SkillSmoke.cs`, `NativeGame.cs` | 원본 patch 문맥 검사→실제 적용. 스킬 스모크 중 OS focus 경합을 피하도록 fixture 상태를 조정 |
| 5 | `A07B_nativegame_keys.patch` → `NativeGame.cs`, `NativeGame.InventoryKeysSmoke.cs` | 순서 4 뒤 검사→적용. 웹 규칙의 G 대장간 요청·J 능력치 요청·F10 설정, 인벤토리 스모크의 선택 없음/G 무전환 기대값 연결 |
| 6 | `A07B_nativepausemenu_keys.patch` → `NativePauseMenu.Keyboard.cs`, `NativePauseMenu.cs` | 순서 5 뒤 검사→적용. 일시정지 TAB=인벤토리·K=스킬 요청, 항목 탐색은 방향키 |

PC 소유 `NativeInventory.Keyboard.cs`·`InventoryNavigation.cs`·`NativePanelTabBar.cs`는 merge에서 가져온 blob 그대로다. 이 단계는 Mac hook 문맥·diff 검사까지이며 OS 키 입력·Player PASS는 아직 주장하지 않는다. 7–12 hook과 13 경계 검사 후 비대화형 Mac 컴파일을 한 번 판단한다.

## 7→12 창·오버레이 연결과 13번 경계 — 후속 checkpoint

| 순서 | 원본 patch / 실제 Mac 접점 | `git apply --check` → 적용 | 런타임 트리거 계약 |
|---:|---|---|---|
| 7 | `A13_nativegame_stat_panel` / `NativeGame.cs` | PASS → 적용 | 능력치 창 요청·닫기, 실제 Unity 상태 사용 |
| 8 | `A14_nativegame_forge_window` / `NativeGame.cs` | PASS → 적용 | 대장간 요청·닫기, 다른 창과 상호 전환 |
| 9 | `A20_nativegame_levelup` / `NativeGame.cs` | PASS → 적용 | 실제 `Player.Level` 상승을 `Update`에서 감지 |
| 10 | `A21_nativegame_death` / `NativeGame.cs` | PASS → 적용 | 실제 `Player.Hp ≤ 0` 사망 분기 |
| 11 | `A22_nativegame_stageclear` / `NativeGame.cs` | PASS → 적용 | 필드·초기화·숨김·그리기만. Unity에 클리어 이벤트가 없어 `Show` 호출 없음 |
| 12 | `A23_nativegame_bossbar` / `NativeGame.cs` | PASS → 적용 | 필드·초기화·숨김·그리기만. Unity에 보스 등장 이벤트가 없어 `Show` 호출 없음 |
| 13 | `A24_nativegame_areatitle` / `NativeGame.cs` | **FAIL → 미적용** | 296행 HUD hunk가 Mac `DiagnosticUiEnabled` 배지 조건과 충돌. 14번 이후는 순서상 적용 보류 |

2–12는 PC 원본 patch의 순서와 내용을 지켜 Mac 소유 hook에 실제 적용했다. PC 소유 창/코어 파일은 merge된 blob에서 수동 수정하지 않았다. Mac ATG·저장 연결과 기존 사용자 Player는 건드리지 않았다. `NativeGame.cs` SHA256 `c3a9a2081ca801a62ae804ec9613a2057e50476801fe8615a886bf4048ebe51f`.

Mac Unity 6000.6.7f1 Editor 단독 상태를 확인하고 **비대화형 script compile 1회** 실행했다. 종료 코드 0, 로그에 `error CS` 0·`warning CS` 0, 기존 `NativeCharacterPresentationPlayback.cs`의 `UAC1001` 한 종류가 두 번 기록됐다. 로그: `_out/UNITY-MAC-UI-MERGE-20261026/compile/mac-ui-2-12-compile.log`. Editor import가 만든 tracked `.meta` 411개는 사전 status(`NativeGame.cs` 수정 한 파일)와 Git HEAD를 대조해 원본 bytes로 복원했고 새 `.meta` 1개는 `_out/.../compile/untracked-meta-backup/`에 이동 보존했다. 검사 뒤 제품 작업 트리 차이는 `NativeGame.cs` hook뿐이다. Player·OS 키 입력·실제 창 화면·설정/캐릭터 저장 회귀는 실행하지 않았으므로 이 단계는 **컴파일 PASS / 런타임 미검증**이다.

## 13→14 Mac 문맥 수동 적응 — 후속 checkpoint

원격 `main` `d209075ec` 전달함과 PC 대상 `a48faf9ea`에는 13·14번에 대한 새 답신·대체 patch가 없다. PC 원본 A24를 Mac `DiagnosticUiEnabled` 조건을 기대하는 문맥으로 **한 줄만 바꾼** `_out/UNITY-MAC-UI-13-19-20261026/A24_mac_debug_badge_context.patch`는 `git apply --check` PASS 후 적용했다. 결과에서 진단용 캐릭터 배지는 기존 조건 안에 남고, 새 `NativeObjectivePanel`은 그 조건 **밖**에서 실제 `Player.Level/Experience/MaxExperience`, `Simulation.Kills/Materials`를 받는다. 지역 처치 총량은 `null`로 넘겨 "미이식"으로 보인다. `NativeAreaTitle`은 로비 차단 해제 후 stage 0을 **실행마다 1회** 표시하며, `--unity-*` QA 픽스처에서는 비표시(`--unity-world-3d` 예외). 구역 전환 이벤트나 새 진행 값은 추가하지 않았다.

14번 PC 원본은 오래된 `NativeLobby.cs`의 preview 영역 문맥을 기대해 그대로는 실패한다. Mac의 현재 `DrawLobby()`에서 전원 버튼 직후·`diagnosticPreview` 블록 이전에 원본과 동일한 `NativeLobbyBuildLabels.Draw(913f)` 호출을 **한 번** 넣었다. 이 위치는 웹의 왼쪽 위 4줄·전원 버튼 옆 빌드 라벨을 정상 로비에서 그리고, 세계관/ATG `DrawWorldIntro()`에는 호출하지 않는다. 기존 로비 우측의 `OFFLINE` 모드 표시는 별도 위치·용도의 라벨이며 BuildFlavor 라벨 중복 호출은 없다. 독립 diff `_out/UNITY-MAC-UI-13-19-20261026/A26_mac_lobby_buildlabels.patch`.

| 순서 | 원본 충돌 | Mac 적응 범위 | 현재 검증 |
|---:|---|---|---|
| 13 A24 | HUD 진단 배지 조건 문맥 | 문맥 한 줄만 Mac 조건으로 조정, 나머지 PC hunk 보존 | 적용·파일 diff 검사 PASS, 화면 미검증 |
| 14 A26 lobby | 오래된 preview 주석/블록 문맥 | 같은 호출을 현재 전원 버튼 바로 뒤에 1회 삽입 | 정적 호출 위치·중복 없음·diff 검사 PASS, 화면 미검증 |

원본 백업은 `_out/UNITY-MAC-UI-13-19-20261026/before/`에 있다. 이 단계에서 15–19번 hook, Editor compile, Player는 아직 실행하지 않았다.

## 15→19 적용·Mac 컴파일 — 후속 checkpoint

| 순서 | 실제 적용 파일 | 계약·이번 판정 |
|---:|---|---|
| 15 `A26_portverification_flavor` | `Editor/PortVerification.cs` | `-flavor full/demo/bic/ea`를 빌드 호출에서만 `build_flavor.json`에 쓰고 `finally`에서 원문 복원하는 PC patch. `git apply --check`→적용 PASS; 이번 단위에서 실제 빌드는 하지 않아 flavor 왕복 런타임 미검증 |
| 16 `A16_nativepausemenu_keybinds` | `NativePauseMenu.cs`, `.Keyboard.cs` | 설정 창의 키 변경 페이지·입력 대기 연결. PC `KeyBindings` 정의 사용, 저장 schema v1→v2 변경 없음(변경값은 이번 실행에서만 유지) |
| 17 `A16_nativegame_keybinds` | `NativeGame.cs` | 이동·무기·상호작용·창 전환을 `NativeKeyBindInput` 조회로 연결. Q/E는 기존 미이식 안내만 유지, 전투 배율 변경 없음 |
| 18 `A16_nativegame_pausesmoke_keys` | `NativePauseMenu.cs`, `NativeGame.PauseSmoke.cs` | `-pause-phase keys` QA hook과 키 페이지 검사 연결. 일반 저장 경로 변경 없음 |
| 19 `B11_simulation_autopotion` | `Core/Simulation.cs`, `Core/EquipmentApplication.cs` | 적 루프 뒤 틱마다 자동 물약 호출, 장비 `potionPower`·장갑/벨트 `potCd` 입력, 처치 드랍을 웹식 `ApplyKillDrop`으로 교체. 기존 `Materials += 4` 유지; 일반 킬 난수 소비 1→2회(보스는 구현 호출 전용)로 이후 동일 시드 장비 드랍 순서가 달라지는 PC 원본 계약 |

각 patch는 14번 Mac 적응 상태에서 순서대로 `git apply --check` 후 원본 바이트 그대로 적용했다. 자동 물약은 `HP>0`, 악의>0, 부족 HP≥회복량, 쿨≤0 및 패링 연습 아님 조건일 때 악의 1을 쓴다. 회복량은 `~~(potHeal(Lv)×(1+potionPower))`, `potHeal(0)=100`, `potHeal(1)=150`, `potHeal(Lv≥2)=Lv×100`이다. 쿨은 `max(6, ~~(420×(1−min(장갑.potCd, .2)−min(벨트.potCd, .2)−min(pRegen×.03, .3))))`프레임이다. `potionCdRed`는 자동 쿨에 넣지 않는다. 드랍은 일반 킬에서 난수 2개를 쓰고 hp 종류만 악의 +1, st/mp는 폐기한다. 세부 경계·전체 격자는 [PC B11 원본 계약](UNITY_B11_AUTOPOTION_20261026.md)에 있다. 이 연결은 퀵슬롯 카운터를 더하지 않으며 새 세이브/설정 schema를 만들지 않는다.

| 검사 | 결과·한계 |
|---|---|
| B11 오프라인 원본 함수 oracle | Mac SDK8에서 **2,438/0**, `_out/UNITY-MAC-UI-13-19-20261026/oracle/mac-integrated.json`. 순수 계산 확인이며 Unity Player의 틱·UI 인수는 아님 |
| Mac Unity 6000.6.7f1 비대화형 script compile 1회 | 종료 0, `error CS` 0·`warning CS` 0. 기존 `NativeCharacterPresentationPlayback.cs` UAC1001 한 종류만 기록. `_out/UNITY-MAC-UI-13-19-20261026/compile/mac-ui-13-19-compile.log` |
| Editor import 메타데이터 | 검사 전 제품 수정 7파일 → 검사 뒤 같은 7파일. tracked `.meta` 411개는 사전 status/HEAD 대조 후 원본 bytes로 복원, 새 `.meta` 1개는 `_out/.../compile/untracked-meta-backup/`에 보존. 다른 제품 파일 차이 0 |
| 런타임 | Player·OS 키·실제 로비/구역 제목·자동 물약 실플레이·설정 저장 회귀 **미검증**. 기존 사용자 앱·저장 조작0 |

현재 판정은 **PC 1–19 patch 순서의 Mac 접점 코드 통합·C# 컴파일 PASS / Player 런타임 미검증**이다. 1·13·14는 원본 patch의 Mac 문맥만 수동 적응했고, PC 소유 파일은 merge된 원본을 직접 수정하지 않았다. `NativeGame.cs` SHA256 `fffa0748667ad914f6b84849e4e62537b9047c2d708b7bfd1069907ba29acc7d`.

## U08 keyboard tab transition Player review — 2026-10-27

The preceding checkpoint's Player HOLD was specific to that earlier source. The final ARM64 Settings QA app from `/Users/fordeargamers/exoduser-wt/_out/A15-GAME-FULLSCREEN-20261027/build/EXODUSER-Unity.app` was reused without a build or product edit. A fresh exact-marker root `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-U08-TABBAR-20261027` isolated the direct A15 entry. The 1280x720 viewport belonged to flagged PID 43596 and the 1920x1080 viewport to flagged PID 43626; full argv and `A15_QA_DIRECT ... listening=False` were checked. Both were stopped, and no unflagged or user app was operated.

| Keyboard path / layout | 1280 Player | 1920 Player | Verdict |
|---|---|---|---|
| Settings initial | `u08-1280-settings.png`: Settings nav red; Controls A15 body below nav | `u08-1920-settings.png`: same active nav and body separation | Representative visual PASS |
| Settings K → Skill | `u08-1280-skill.png`: Skill nav red, skill altar/content below nav | `u08-1920-skill.png`: same active nav/content hierarchy | OS keyboard PASS |
| Skill TAB → Inventory | `u08-1280-inventory.png`: Inventory nav red, equipment/bag/summary columns below nav | `u08-1920-inventory.png`: Inventory nav red, equipment/bag/comparison below nav | OS keyboard PASS |
| Inventory K → Skill | `u08-1280-skill-return.png`: Skill nav red again | Not separately replayed at 1920 | 1280 OS keyboard PASS |
| ESC close/reopen | At 1280, Skill ESC and Inventory ESC each returned to field; field ESC opened pause menu; pause menu K opened Skill (`u08-1280-after-esc.png`, `u08-1280-inventory-esc-world.png`, `u08-1280-pause-main.png`, `u08-1280-pause-to-skill.png`). At 1920, Inventory ESC returned to field (`u08-1920-after-esc.png`) | As stated | Observed paths PASS |

The tab bar and body did not overlap in these captures; this is a representative 1280/1920 visual verdict, not a pixel parity judgment for all windows. Mouse tab clicks were intentionally not repeated because the prior macOS click-position tool path is unresolved. Forge/Stat panel state, first-practice gating, physical mouse, and web-equivalent color/font pixel parity remain separate. The PC-owned `NativePanelTabBar` and persistence schema were unchanged. Logs: `u08-1280-player.log` and `u08-1920-player.log` beside the screenshots.

## U04B inventory Player screen acceptance — 2026-10-27

PC-U04b 원문과 Mac seed QA 계약을 먼저 대조했다. 최종 ARM64 Settings QA 앱을 그대로 사용해 build 0·제품 수정 0으로 격리 marker 루트 3개에서 `--unity-inventory-smoke`를 실행했다. 정확한 `EXODUSER Settings QA` argv/PID 44276(장비 1920), 44308(유골함 1280), 44315(유골함 1920)을 확인하고 모두 종료했다. 사용자 앱·일반 save/roster는 조작하지 않았다. 기존 U08 키보드 캡처 `u08-1280-inventory.png`/`u08-1920-inventory.png`는 같은 최종 앱의 장비 페이지 양 해상도 증거로 재사용했다.

| 계약/화면 | 1280×720 | 1920×1080 | 판정 |
|---|---|---|---|
| 장비 상단·3열·푸터 | U08 캡처: 제목/상단 인벤토리 활성 탭, 장비 하위 탭, 착용 인형·가방·오른쪽 구성, 하단 수치가 화면 안에 있음 | U08 캡처: 같은 배치, 오른쪽 비교 카드와 하단 버튼이 화면 안에 있음 | 대표 화면 배치 PASS |
| 장비 값 | 전투력 1656, 공격 144, 방어 420, 추가 효과 1092, 악의 1000, 가방 10/300, 장착 부위 15/16, 유물 홈 0/0 | 같은 값. `15/16`은 일반 장비만 세며 유골함 1개는 별도 페이지, belt는 빈칸 | postossuary seed 표시 PASS |
| 유골함 상단·3열·하단 | `UNITY-MAC-A05-IO-U04B-OSS-1280-20261027/unity-inventory-equipment.png`: 창 x≈345부터 오른쪽 경계 안에 들어옴. 가방 0/300, urn 노드, 미이식 부위, 전대 초상·설명·하단 버튼이 보임 | `UNITY-MAC-A05-IO-U04B-OSS-1920-20261027/unity-inventory-equipment.png`: 창 x≈518, 같은 요소·값이 보임 | 대표 화면 배치 PASS; 왼쪽 게임 배경 여백은 좁은 유골함 창 계약 |
| 실제 Player 영수증 | `initialEquipped=16`, `initialBag=10`, `maxMana=480`, `mana=330`, `maxHp=526`; 유골함 페이지의 가방 0/300은 별도 범주 수 | 장비·유골함 영수증 모두 같은 초기 값 | U04B seed/MP 계약 PASS |

장비 초기 Player 영수증은 `UNITY-MAC-A05-IO-U04B-SCREEN-20261027/inventory-smoke.json`, 초기 장비 선택 화면은 같은 루트의 `unity-inventory-equipment.png`다. 유골함 두 루트에도 각각 영수증과 스크린샷이 있다. 영수증의 equip/unequip/drop/sort bool은 **픽스처 내부 메모리 조작** 결과이며 실제 물리 mouse 클릭·이동·장착의 증거가 아니다. 유골함 해제/재장착, 뼈 수집·소환, 유물/보관함 본문은 U04B 원문 자체의 미구현 경계를 유지한다. 실제 마우스 tab/아이템 동작은 기존 CUA 클릭 위치 문제 때문에 HOLD다. 이번 대표 컷에서 새 제목·본문 가림 또는 화면 밖 잘림 결함은 보이지 않아 owner patch 요청은 없다. U08의 오래된 Settings TAB 문구는 현행 Settings 초점 이동과 일시정지 루트의 인벤토리 전환을 구분해 [U08 문서](UNITY_PC_TABBAR_U08_20261026.md)에 정정했으며 키 코드는 바꾸지 않았다.

## U05 K skill window representative Player acceptance — 2026-10-27

[PC-U05 계약](UNITY_PC_SKILL_WINDOW_U05_20261026.md)과 [Mac 선행 스킬 UI](UNITY_MAC_SKILL_UI_20261025.md)를 읽고, 최종 ARM64 Settings QA 앱의 기존 U08 실제 OS 키 캡처를 재검수했다. 이번 단위의 새 Player 실행·build·제품 수정은 0이다. 기존 캡처는 `A15-GAME-FULLSCREEN-20261027/u08-1280-skill.png`와 `u08-1920-skill.png`이며 각각 같은 앱의 Settings→K Skill 경로다. U08 검수에서 1280 Skill ESC→field, field ESC→pause, pause K→Skill도 실제 키로 관측했다. 이번 화면 판정은 기존 컷 재판독이고 새 키 입력 검사의 재실행은 아니다.

| U05 항목 | 1280×720 viewport | 1920×1080 viewport | 판정 |
|---|---|---|---|
| 제목·상단 탭 | `전투 스킬` 제목과 붉은 Skill 탭이 본문 위에 보임 | 같은 구조, 탭/제목/본문 사이 가림 없음 | 대표 배치 PASS |
| 13슬롯·라벨 | 1/2/3/4/F/Z/LMB/RMB/SHIFT/E/Q/CTRL/SPACE 원판 13개가 창 안에 있음. LMB 기검참 외 12개는 `미이식` | 13개 모두 오른쪽 끝 SPACE까지 창 안에 있음. LMB 선택 테·기검참 명패 보임 | U05 초기 상태/배치 PASS |
| 정보판·제단·로드맵 | 왼쪽 기검참 `Lv 1 / 20`, 설명, `강화 미이식`, `SP 미이식 · 악의 1,000 · LV 1`; 가운데 제단/구슬·안내; 오른쪽 로드맵이 보임 | 같은 값과 3영역이 창 안에 있음 | 초기 QA 값/텍스트 배치 PASS |
| 하단·경계 | 닫기[ESC]/일괄 레벨업/추천 자동 버튼, 프레임 하단이 viewport 안에 있음 | 같은 하단 버튼·프레임이 viewport 안에 있음 | 화면 밖 잘림 없음 |

소스 확인 범위: `NativeGame.cs`의 시작 `Simulation.Materials=1000`, `SourceStarterFixture.CreateKiSlash()`의 LMB 기검참, `NativeSkills.cs`의 `Config.KiSlashLevel`·`Player.Level`·`Materials` 표시와 `미이식` 분기는 U05 정의/상태 계약에 맞는다. 이는 화면/소스 확인이며 새 습득·강화·합성 실행 검사가 아니다. 물리 mouse 클릭·호버로 하는 세부 습득/장착은 이전 CUA 클릭 위치 문제로 HOLD를 유지하고 재시도하지 않았다. U05 원문의 미이식 12슬롯·SP/강화·동적 제단 범위도 그대로다. 대표 화면에서 새 가림/잘림 결함은 발견되지 않아 owner hunk 요청은 없다.

## A14 G forge window Player acceptance — 2026-10-27

[PC-A14 원문](UNITY_A14_FORGE_20261026.md)과 현재 `NativeGame.cs`의 `HandlePanelHotkeys`→`OnPanelRequested("forge")`, 기본 `forge=KeyG` 바인딩을 먼저 확인했다. 최종 ARM64 Settings QA 앱을 새 marker 루트에서 재사용한 실제 OS 키 검수다(build 0·제품/전투/seed/save 변경 0). 1280 PID 45601과 1920 PID 45678을 정확 argv·`A15_QA_DIRECT phase=read` 로그로 식별하고 모두 종료했다. 처음 flag 누락으로 입구 화면을 연 PID 45569는 G 검수 전에 종료했으며 판정에 포함하지 않는다. 다른 사용자 앱은 조작하지 않았다.

| 항목 | 1280×720 viewport | 1920×1080 viewport | 판정 |
|---|---|---|---|
| G 열기·닫기 | Settings→G로 대장간, 다시 G로 field 복귀 | Settings→G로 대장간, ESC로 field 복귀 | 실제 OS 키 경로 PASS |
| 제목·탭·본문 | `복수의 대장간`, 상단 대장간 활성 붉은 탭, 왼쪽 6개 탭(강화/물약/분해/리롤/유물/제작), 오른쪽 강화 본문이 창 안에 있음 | 같은 구성·하단 닫기[G]가 창 안에 있음 | 대표 배치 PASS |
| 현재 fixture 표시 | 악의 1,000, 장착 장비 카드 `녹슨 검 +0`/`나무 견갑 +0`/`천 갑옷 +0`, 성공률 99%, 보이는 카드 비용 악의 7500 | 같은 값; 상단 AI 강화 칩·스크롤 바도 보임 | 표시값 대조 PASS; 구매/강화 실행은 별도 |

컷은 `_out/A15-GAME-FULLSCREEN-20261027/a14-1280-forge.png`·`a14-1920-forge.png`, 로그는 `a14-a13-1280.log`·`a14-a13-1920.log`다. 긴 강화 목록의 아래 항목은 **내부 스크롤 영역**에 있고 전체 창/푸터는 viewport 안에 있다. 이번 컷은 기본 강화 탭만 검수했다. 다른 5개 탭의 실화면, 실제 물리 mouse 탭·칩·스크롤·강화 시도는 HOLD이며 PC-A14가 정의한 표시 전용 실행 버튼을 PASS로 바꾸지 않는다. 이전 CUA click 위치 gate는 재시도하지 않았다. 현재 대표 컷에서 새 가림·화면 밖 잘림 결함이 없어 PC owner hunk 요청은 없다.
