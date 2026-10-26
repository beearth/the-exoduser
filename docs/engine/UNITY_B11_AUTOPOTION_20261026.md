# Unity 자동 물약 Core + 원본 함수 oracle (마스터 보드 B11) — 2026-10-26

기준: 전체총괄 결정 "PC가 B군 Core 계산을 새 파일로 구현, Codex 기존 파일 수정 0, 연결은 patch". 근거 문서 `UNITY_B11_WEB_EXTRACT_20261026.md`(main) + `unity_b11/b11_web_values.json`. 웹 원본 `G:/exoduser/game.html`(HEAD 1770c2698, 작업 트리 기준 줄). 구현: 단순작업2. 위치 `E:/exoduser-wt/pc-unity-win`(`9ec4a3274` 위, Unity 6000.6.7f1). 커밋은 맥북 총괄 검수 뒤. 상태 기준: 추출표만=0, **oracle 일치=1**, 게임 연결·동작=2.

## 0. 먼저 알아 둘 것 (이 단위에서 새로 확인한 사실)

1. **웹은 자동 물약·드랍의 떠오르는 텍스트를 평소 플레이에서 그리지 않는다.** `game.html` 54830-54845의 플로팅 텍스트 렌더는 `window._btActive`(전투 테스트베드)가 아닐 때 `_numStr`(피해 숫자)가 없는 텍스트를 화이트리스트(`시전`·`그로기`·`무적`·`CRIT`·`사망`·`탈출`·`✟`·`🌋`)에 든 것만 그린다. `악의 추출: +v HP`, `피해 증가!`, `+1`, `HP물약 +2` 등은 전부 목록 밖이라 **정식 플레이에서는 보이지 않는다**(`addTxt` 호출만 일어남). 추출표·명세의 "피드백 = 떠오르는 텍스트"는 코드를 호출 기준으로 읽은 것이고 화면 기준이 아니다. 그래서 **NativeGame 피드백 patch를 쓰지 않았고** Core가 문구·색·수명·오프셋을 이벤트(`AutoPotionDrunk`, `KillDropped`)로 내보내기만 한다(문구는 이모지 없이). 화면에 문구를 띄우는 것은 웹과 달라지는 선택이므로 디자인 총괄·맥북 총괄 결정 사항이다.
2. **소리(`SFX.potion`)는 WebAudio 절차 생성음**(`SFX.potion()` 12756, 파일 샘플 없음)이라 Unity에 대응이 없다 → **미이식**(이벤트는 있음). `SFX.pickup`(드랍)도 같다.
3. **파일 위치 편차**: 명세는 `Runtime/Core/Combat/AutoPotion.cs`였으나 `Runtime/Core/AutoPotion.cs`(평면)로 두었다. 기존 .NET 검사 프로젝트 10개가 `Runtime/Core/*.cs` 와일드카드로 Core를 컴파일하므로, 하위 폴더에 두면 patch 적용 후 그 프로젝트들이 `Simulation.TickAutoPotion`을 못 찾아 깨진다. 평면에 두면 csproj 수정 0.
4. **킬 드랍은 웹이 난수 2개를 쓴다**(`Math.random()<(e.ib?1:1)` 한 번 + 종류 선택 한 번, 보스는 추가 한 번). 기존 Unity는 1개를 썼다. 웹 그대로 2개로 바꾸면 이후 장비 드랍 굴림의 시드 순서가 바뀐다. 기존 검사(ki-slash 93, poise 7, verify-core 36)는 영향 없음을 확인했다.

## 1. 웹 근거 (줄은 이번 추출 시점 실제 값)

| 항목 | game.html | Core |
|---|---|---|
| `potHeal(lv)`: lv≤0→100, 1→150, n→n×100 | 28074 | `AutoPotion.PotHeal` |
| 자동 블록: `autoPotCd-=sp` → `~~(potHeal×(1+potionPower))` → 조건(`!패링연습 ∧ cd≤0 ∧ hp>0 ∧ 악의>0 ∧ 부족HP≥회복량`) → 악의 −1, cd=`max(6,~~(420×(1−min(장갑.potCd,.2)−min(벨트.potCd,.2)−min(pRegen×.03,.3))))`, HP 회복, 전설 벨트 시 `_lBeltT=300`, 통계 +1 | 35895-35913 | `AutoPotion.Tick`, `CooldownFrames`, `HealAmount` |
| `_malCost(v)`: 0 이하 0, 그 밖 `max(1,ceil(v×0.5))` | 28082-28087 | `MalCost` |
| 대장간 물약 카드: 비용 `_malCost((lv+1)×5)`, 게이트 `(lv+1)×100`, `회복량 cur → next`(next=`potHeal(lv+1)`), 클릭 조건 `!maxed&&lvOk` | 50697-50707 | `ForgeCost`, `ForgeLevelGate`, `ForgeHeal`, `ForgeMaxed`, `ForgeCanSelect` |
| 대장간 실행 `_fgCraft`: Shift/Ctrl이면 최대 10회, 반복마다 `G.mats<cost`만 검사(비용은 선택 시점 고정, 최대 단계·레벨 재검사 없음) | 50466-50477 | `ForgeEnhance` |
| 킬 드랍: 난수 1(항상 참) → 종류 `~~(r×3)`(hp/st/mp, hp만 악의 +cnt, 보스 cnt=2) → 보스만 난수 1 더(`<.5` → +1) | 43094-43099 + `addPotion` 28252-28268 | `KillDrop` |
| 보물상자: 악의 `5+~~(stage×2)` + hp 물약 2 = +2 | 32877-32878 | `ChestDrop` |
| 중형 이상 상자: `_dt>=1`일 때만 난수 1, `<.4` → +1 | 32909 | `MediumChestDrop` |
| 파괴물(loot 'potion'): +1 | 32843 | `BreakablePotionDrop` |

결정 4건(웹 그대로): ① `potionCdRed` 어픽스는 자동 쿨에 넣지 않음 ② 킬 드랍은 hp만 악의로(1/3 확률), st/mp 버림 ③ 능력치 창 물약 쿨 표시(300f)는 건드리지 않음(A13 남은 차이) ④ 대장간 반복 강화의 비용 재검사 없음(웹이 레벨 10을 넘기는 것도 그대로: 캡처에서 Lv.11 확인). `OPT.autoPotThr`는 쓰지 않는다.

## 2. 새 파일 (PC 소유, 전부 신규)

| 파일 | 내용 |
|---|---|
| `unity/Assets/Exoduser/Runtime/Core/AutoPotion.cs` | 순수 계산(UnityEngine 의존 없음). `AutoPotionState`(PotLv, Cooldown, PotionsUsed, BeltBuffTicks), `AutoPotionInput`, `AutoPotionResult`/`AutoPotionFeedback`, `DropResult`/`DropText`, 정적 `AutoPotion` |
| `unity/Assets/Exoduser/Runtime/Core/AutoPotionEquipment.cs` | 장비 입력 읽기(`potionPower` 어픽스 합 = 웹 `_eqAffix`, 장갑·벨트 `potCd`), **`Simulation` 새 partial**(`PotionState`, 입력 필드, `AutoPotionDrunk`/`KillDropped` 이벤트, `TickAutoPotion`, `ApplyKillDrop`, `ApplyAutoPotionEquipment`) — 기존 `Simulation.cs`는 수정하지 않음(patch가 호출만 추가) |
| `unity/Tools/auto-potion-oracle/` | oracle(아래 3). `unity/.gitignore`에 `AutoPotionTests.csproj` 예외와 `runs/` 무시 추가 |
| `Runtime/NativeForgePanel.Potion.cs` | 대장간 물약 탭 선택·확인 바·제작 버튼(PC A14 파일) |
| `Runtime/NativeAutoPotionSmoke.cs` | `--unity-autopotion-smoke <dir>` 실제 Simulation 스모크 |
| 수정(내 파일) | `NativeForgePanel.Tabs.cs`(`DrawPotion` 값 연결), `NativeForgePanel.cs`(탭 전환 시 선택 해제·확인 바 호출), `NativeForgePanel.Capture.cs`(물약 검사), `NativeStageClearOverlay.cs`(`WithAutoPotion`), `NativeStageClearOverlay.Capture.cs`(실제 물약 통계) |
| patch | `docs/engine/unity_patches/B11_simulation_autopotion.patch`(번호 없음) |

## 3. oracle — 원본 함수 실행 대조 (손으로 옮긴 기대값 없음)

`unity/Tools/auto-potion-oracle/README.md`에 방식·래퍼 표·기록. 요약: `export.cjs`가 위 원문 블록을 텍스트 앵커로 추출(줄 번호·블록 sha256 기록)해 Node VM에서 실행(최소 전역 래퍼, `Math.random`은 호출자 난수열)하고 `oracle.json`을 만든다. 격자(자동 블록 1,866건, 240프레임 순환 12건, 킬 드랍 192건, 상자 41·20건, 파괴물 1건, 대장간 카드 144건, 반복 강화 160건)를 C# `AutoPotion`이 전부 같은 값으로 재현하는지 `Program.cs`(.NET 8)가 대조한다. 문구는 이모지를 뗀 문자열로, 좌표는 플레이어/대상 기준 오프셋으로 비교한다.

| 실행 | 결과 |
|---|---|
| RED(`RedStub`: 구현 없음) | 2,438검사 중 **1,053 실패**(기대) |
| green-01 | 8 실패 — 하니스 결함(순환 케이스의 SFX 카운터가 프레임 간 누적), `export.cjs` 수정 |
| green-02 / green-03 | **2,438 checks / 0 failures** |
| 변이(쿨 기준 420→300, `Ceiling`→`Floor`) | 2,438 중 **620 실패**(검사가 민감함) |

기록: `E:/exoduser-wt/_out/pc-b11-impl/runs/`. 이 oracle은 원본 `hurtE`·`update()` 전체를 실행한다는 주장이 아니라 위 블록들의 대조다.

## 4. patch (`B11_simulation_autopotion.patch`, 번호 없는 이름, 3 hunk)

| hunk | 파일 | 내용 |
|---|---|---|
| 1 | `Core/Simulation.cs` Tick | 적 루프·`TickKiTimers()` 뒤에 `TickAutoPotion();`(웹 update() 자동 블록 위치, 프레임당 1회) |
| 2 | `Core/Simulation.cs` KillEnemy | 구 퀵슬롯 카운터 3줄을 `ApplyKillDrop(enemy);`로 교체. 기존 `Materials += 4`는 그대로(웹의 별도 악의 드랍은 B군 몫) |
| 3 | `Core/EquipmentApplication.cs` | `ApplyEquipment` 끝에 `ApplyAutoPotionEquipment(inventory);`(potionPower·potCd를 장비에서 읽음) |

`NativeGame`·`NativeHud` 등은 건드리지 않았다(§0-1). 보스 플래그가 `EnemyState`에 없어 킬 드랍은 일반 규칙만 쓴다(보스 cnt=2·추가 굴림은 `KillDrop(isBoss:true)`로 준비됨, 호출은 보스 이식 뒤). 1~15번(저장소 `unity_patches/`) 적용 상태에서 `git apply --check` 통과, 적용·빌드·역순 `-R` 확인.

## 5. 대장간 물약 탭 · 스테이지 클리어 (PC 파일)

- 카드: `HP 물약 Lv.N`, `회복량 cur → next`(최대 단계는 `최대 강화`·`(MAX)`), 레벨 게이트 미달이면 빨간 `⚠ Lv.N 필요`, 비용 `악의 N`. 값은 `Simulation.PotionState`·`Materials`·`Player.Level`에서 읽는다("미이식" 문자열 제거). 클릭 가능 조건은 웹 그대로(`!maxed && 플레이어 Lv ≥ (lv+1)×100`).
- 선택 → 확인 바(웹 `#forgeConfirm`: 688×120.39, 2px #b79560, 110° 그라디언트, 이름 14px·설명 12px·`제작` 알약 99.69×42) → 제작 클릭: `AutoPotion.ForgeEnhance`(Shift/Ctrl 10회). 악의 부족이면 아무것도 안 하고 `악의가 부족합니다!`(웹 `notify`)를 확인 바 위에 2초 표시, 선택 유지. 성공하면 선택 해제(웹 `_forgeSel=null`). 탭 전환 시 선택 해제.
- 스테이지 클리어 "물약 N회": `NativeStageClearOverlay.WithAutoPotion(input, state)`가 `AutoPotionState.PotionsUsed`를 넣는다. 트리거는 여전히 없음(A22 기록 그대로). 캡처의 실제 상태 프레임이 이 값을 쓴다(0회).

## 6. 검증 (Unity 6000.6.7f1, Win64, D3D12)

| 항목 | 결과 |
|---|---|
| 회귀(Simulation patch 적용 상태) | inventory-oracle 892 checks/0 failures, inventory-navigation 35/35, stat-parity 2/2 MATCH, ki-slash-oracle **93/0**, poise 7/0, verify-core **36/0** |
| 빌드 (a) patch 미적용 | errors 0, error CS 0, warning CS 0 |
| 빌드 (b) patch 1~15 + B11 적용 | errors 0, error CS 0, warning CS 0 |
| 역순 `git apply -R` 16개 | 전부 통과, 되돌린 뒤 `NativeGame*`·`NativePauseMenu*`·`NativeLobby.cs`·`PortVerification.cs`·`Simulation.cs`·`EquipmentApplication.cs` 변경 0 |
| `--unity-autopotion-smoke`(b 빌드, 실제 Simulation) | 종료 0, passed, 11검사 PASS: 첫 틱 악의 5→4·HP +100·cd 420, 419프레임 동안 추가 물약 없음, 420프레임째 두 번째 물약(악의 3), 부족HP 50은 미발동, 악의 0·패링 연습 중은 미발동, 킬(난수 0=hp) +4+1, 킬(난수 .99=mp) +4만, 문구 `악의 추출: +100 HP`(이모지 없음) |
| `--unity-forge-capture`(b 빌드) | 종료 0, passed, failures 0: 물약 카드 잠김/선택, 한 번 제작(Lv0→1, 악의 3, 선택 해제), Shift/Ctrl 10회(Lv.11까지, 웹 quirk), 악의 부족 안내·선택 유지 등 + 기존 탭·A14 wiring 검사 전부 |
| `--unity-overlay-capture clear`(b 빌드) | 종료 0, passed |

캡처·비교 이미지 `E:/exoduser-wt/_out/pc-b11-impl/`: 대장간 `caps_forge/unity_forge_potion_{gate,select,lv1,max,short}.png`, 웹 02b와 나란히 `cmp/potion_select_full.jpg`, 1x 크롭 `cmp/potion_card_select_1x.jpg`·`potion_confirm_1x.jpg`, 상태 모음 `cmp/unity_potion_states.jpg`.

## 7. 미이식·남은 차이

- 미이식: 자동 물약 효과음(WebAudio 절차음), 떠오르는 텍스트의 화면 표시(웹도 평소엔 안 그림 — §0-1), 전설 벨트 피해 +15%의 피해 적용(`_lBeltT`는 상태만 세움), 회복력 패시브 `pRegen`(값 0), 시스템 튜토리얼 통지(`_systemLesson.recovered`), 구세이브 `qslots` 호환 파서, `potLv` 세이브(Unity 세이브 없음 → 대장간 강화 단계는 실행 중에만 유지), 보스 킬 드랍·상자·파괴물 호출 지점(함수만 준비), 능력치 창 물약쿨 표시.
- 웹과 다른 점: 대장간 확인 바 "제작" 글자는 웹이 Black Han Sans, Unity는 Noto Sans KR SemiBold(글꼴 파일 없음). 카드의 `악의 N` 줄이 웹은 굵게. 설명 줄의 하트 글리프는 14px 크롭을 12px 줄에 사용. 최대 단계 카드 높이(72)는 추정. `악의가 부족합니다!` 안내는 웹 toast 대신 확인 바 위 문구(웹 toast 위치·모양 미확인).
- 튜토리얼 문구(`NativeLobby.StartupPresentation.cs:172`)는 웹과 같은 오해 문구라 바꾸지 않았다(기록만).
- 킬 드랍 난수 소비 수 변화로 같은 시드의 이후 장비 드랍 순서가 기존 Unity와 달라진다(웹 그대로).

## 총괄 검수 (맥북 총괄, 2026-10-26)

- 원본 대조: 정식 플레이의 떠오르는 텍스트 화이트리스트 `game.html` 54835-54842(`시전·그로기·무적·CRIT·사망·탈출·✟·🌋` 포함 문구와 피해 숫자만 그림) → "악의 추출: +v HP" 등은 웹 화면에 안 나온다. Unity도 Core 이벤트만 내보내고 화면에 그리지 않는 것이 웹 동일. 띄우는 것은 웹과 다른 선택이라 디자인 총괄 판단 사항으로 남긴다.
- 파일 위치: 명세·Codex 통보의 `Core/Combat/` 대신 `Core/` 평면 — 기존 .NET 검사 프로젝트 10개가 `Runtime/Core/*.cs` 와일드카드라 하위 폴더면 patch 적용 뒤 검사 컴파일이 깨지기 때문(csproj 수정 0 유지). `AutoPotionEquipment.cs`는 Codex `Simulation`의 **새 partial 파일**(기존 파일 수정 0). Codex 소유 `Simulation.cs`·`EquipmentApplication.cs` 변경은 patch만.
- 대장간 물약 카드 1x 웹 일치 확인. oracle 2,438/0(원본 줄 범위 실행, 변이 검사로 민감도 확인), patch 적용 빌드에서 `--unity-autopotion-smoke` 11/11 → 보드 **B11 = 2**(patch 적용 기준, Mac 병합 대기).
