# Mac ↔ PC Unity UI 누적 패치 사전 대조 — 2026-10-26

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
