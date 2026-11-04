# L3 oracle-triage — debug-oracle-sweep FAIL 10 원인 분석 (2026-11-04)

- 레인: 클라우드 L3, 브랜치 `claude/unity-cloud-oracle-triage-20261104`. 분석만 했고 Core·Tools는 고치지 않았다. 수정안은 아래 패치로만 적는다.
- 기준: origin/unity/main = `2f9fb68ab`(배정문에 적힌 e3d8d6a54보다 새 커밋. e3d8d6a54는 조상이다). 웹 = origin/main `b94c8fbff`. 스윕이 쓴 웹 `06ac6882b` 이후 main 커밋 2개는 game.html·skill-forge.js를 건드리지 않았으므로 웹 원문은 같다.
- 실행 환경: 이 클라우드 컨테이너에는 dotnet이 없다. **C# 하니스 실행은 모두 "실행 미확인"이다.** node로 실제로 돌린 것은 enemy-tables-oracle의 `export.cjs`·`gen-cs.cjs`(스크래치 폴더 출력, 저장소 쓰기 0)뿐이다. 나머지 판정은 코드·커밋·보드 기록을 읽어 낸 것이다.

## 0. 먼저 바로잡을 전제

1. **14ae05cbb는 이미 unity/main에 있다.** `git branch -r --contains 14ae05cbb` = unity/main, du3·du5·ai-oracle-a-layer·이 레인. 스윕 결과(summary.json/md)는 PC `I:/EXODUSER-Storage/debug/oracle-sweep-20261104/`에만 있어 이 환경에서 읽지 못했다. FAIL 10 목록은 판정 커밋 `11115a337`(병합 da50c9ae)의 변경 파일과 DEBUG_LEAD_BOARD D-014에서 복원했다.
2. **D-U1·D-U2·D-U3·D-U5는 스윕 FAIL 10에 들어 있지 않다.** 이 넷은 전용 oracle(hunter·defense·resource)과 D-U3 대조에서 나왔다. 스윕 Core 기준 `bea021bcf`에는 D-U1(309892b1d, 02:54)과 D-U2(a0038d37, 06:54)가 이미 들어 있었다. D-U3(70502a2b4)는 스윕 뒤 병합됐고, 병합 기록에 "sweep 77 동일"이 있다. 그래서 아래 표를 둘로 나눈다: §1 스윕 FAIL 10, §2 D-U 결함 브랜치.

## 1. 스윕 FAIL 10 — 지금 상태

| # | 프로젝트 | 스윕 때 차이 | 원인(Unity ↔ 웹) | 지금 unity/main | 고친 곳 | 남은 일·위험 |
|---|---|---|---|---|---|---|
| 1 | enemy-ai-oracle | 61,645 | 패링 G2 A안 투사체 정책(사용자 G0 선택). Core `EnemyFactory.cs:154-156,188`(`EnemyProjectilePolicy.Interval`, `MeleeAttackRules.Target`→9999), `EnemyAi.cs:761` ↔ 웹 `game.html:31576-31580,31589`(`_projCd` 보스 50·noProj 9999·나머지 240) | A안 모드 PASS 1,424,276/0(PC 기록). 이 레인 실행 미확인 | 하니스 `8572a7b52`(병합 d56289619). 스윕 기본 모드 = `a-plan`(`run.cjs` `--expectation-mode`) | 게임 결함 아님. `--expectation-mode web`은 의도대로 계속 FAIL. Core 수정 불필요 |
| 2 | enemy-spawn-oracle | 7,543 | 1과 같은 정책 + 하니스가 `EnemySpawn.Ai.cs` 값형 AI 필드 13개를 "웹 undefined"로 셈 | A안 PASS 264,064/0(PC 기록). 실행 미확인 | `11115a337`(AI 필드 예외) + `8572a7b52` | 결함 아님. 예외 목록 `AiRuntimeFields`가 새 필드를 몰래 삼키지 않는지는 enemy-ai-oracle이 동작으로 본다 |
| 3 | enemy-hurt-oracle(분열) | 372 | 1의 이동·상태 여파 | A안 PASS 6,067,801/0(PC 기록). 실행 미확인 | `8572a7b52` | 결함 아님 |
| 4 | player-hurt-oracle | flashT·scrFlashA | Core는 feel 끈 상태 값, 화면은 `KiImpactView.FeelEnabled`일 때만 그림 ↔ 웹 `game.html:6452` `_FEEL_ENABLED`(`?feel=0`), `scrFlashA` 대입 `33897` 등 | PASS 47,559/0(PC 기록). 실행 미확인 | `11115a337` export `location.search='?feel=0'` | 결함 아님. 단, D-U2(a0038d37)가 `HurtPlayer`를 바꾼 뒤의 스윕이므로 D-U2와도 일치 |
| 5 | save-oracle | `game.stageDiffOff` | Unity 전용 키 `CombatSave.cs:52`(쓰기)·`:145`(읽기, 없으면 0) ↔ 웹은 `G._stageDiffOff`를 저장하지 않음(`game.html:17066` 초기값, `31547` 사용, `62782`·`63875` 0 리셋) | PASS 2,604/0(PC 기록). 실행 미확인 | `11115a337` 비교에서 그 키만 뺌 | 결함 아님. 세이브: 웹 세이브 → Unity 읽기 0, Unity 세이브 → 웹은 키 무시. 위험 0 |
| 6 | settings-persistence | 키 20 ↔ 21 | 낡은 기대값(KeyBindings 21개) | PASS 91/0(PC 기록). 실행 미확인 | `11115a337` `KeyBindings.Actions.Length`로 | 결함 아님. **주의**: 이제 자기 상수와 비교하므로 웹 키 개수 회귀는 이 하니스가 못 잡는다(keybind-parity 몫) |
| 7 | startup-flow | 인트로 언어 줄 수 | 낡은 기대값(en 26줄) → 29언어×27줄(2cca15bef) | PASS 29/0(PC 기록). 실행 미확인 | `11115a337` | 결함 아님 |
| 8 | affix-defs-parity | 어픽스 문구 2개 | 낡은 기준(endMaliceGain 이름, goldFind 설명; 2315838a7·e9898f795 의도 문구) | PASS(PC 기록). 실행 미확인 | `11115a337` `affix_defs_before.json` | 결함 아님 |
| 9 | **enemy-tables-oracle** | `STG[33].bn` 1건 | **Core 값이 낡았다.** Core `EnemyTables.cs:227` `Bn = "Killu"`(옛 웹 스냅샷 571954a97에서 생성) ↔ 웹 `game.html:17046` `HELL_BOSSES[6]=['검은 성의 수호자','킬루','지옥 군주']` | **FAIL 그대로**(고친 커밋 없음). node로 현 웹에서 `export.cjs`→`gen-cs.cjs`를 돌려 Core와 대조: 주석 줄(앵커 줄 번호·헤더) 말고 값 차이는 이 1줄뿐, EliteTables.cs 값 차이 0 | 없음 | D-014는 "e9898f795 의도된 로캘 이름"이라 판정했지만, e9898f795는 정본 키를 `킬루`로 두고(`bossbar_web.json` si33 `"boss":"킬루"`, `demo_text.json` 키 `킬루` → 언어별 Killu) Core `EnemyTables.cs`는 건드리지 않았다. 런타임 영향: `.Bn` 사용처 0(보스바는 bossbar_web.json을 씀) → 화면·세이브·밸런스 영향 0. 수정안 P1 |
| 10 | **skill-ui** | 13 ↔ 16칸 | 웹 10-31 9a5be1fac 고정 기술 3칸(Space 구르기·X 처형·T 활) ↔ Core `SkillUiState.cs:8` `SlotCount=13`, `skill_ui.json` 13칸. 웹 `skill-forge.js:19-29` `SLOTS` 16개. 하니스 `Program.cs` `SequenceEqual`(13키)에서 실패 | **FAIL 그대로** | 없음(D-U4 UI 담당) | 표현층 결정. **함정**: `skill-ui/export.cjs`는 `Resources/Data/skill_ui.json`을 직접 덮어쓴다. 현 웹으로 저장소 안에서 돌리면 16칸이 되고 `NativeSkills.cs`의 `slots.Length!=13` 검사가 예외를 던져 스킬창이 깨진다. 스윕은 임시 경로에서만 돌려 무해. 수정안 P2 |

요약: 10개 중 8개는 하니스 쪽에서 정리됐고 Core 결함이 아니다(PC 재실행 기록 기준, 이 레인 실행 미확인). 남은 FAIL 2개 중 #9는 Core 데이터가 실제로 낡은 것이다(런타임 영향 0). #10은 UI 범위 결정(D-U4)이다.

## 2. D-U 결함 브랜치 (스윕 밖, 전용 oracle)

| ID | 브랜치 · SHA | unity/main 상태 | 병합 가능성 | 위험 |
|---|---|---|---|---|
| D-U1 사냥꾼 | `claude/unity-pc-du1-hunter-20261104` dab4bf742 | 병합됨(309892b1d). 앞선 커밋 0 | — | 끝 |
| D-U2 방어 | `claude/unity-pc-du2-defense-20261104` 68baafcf0 | 병합됨(a0038d37). 앞선 커밋 0 | — | 끝 |
| D-U3 자원 | `claude/unity-pc-du3-resources-20261104` 8fd82e677 | 병합됨(70502a2b4). 앞선 커밋 0 | — | 끝 |
| D-U5 이속·재생 | `claude/unity-pc-du5-speed-regen-20261104` 98cf59aab | **병합 안 됨**. 2커밋 앞섬(4b5c905e Core, 98cf59aa docs), 14커밋 뒤처짐 | `git merge-tree --write-tree` 충돌 0(트리 24c43c4aa). Core 6파일(+7/−5): `InventoryState.SpeedBonus()` = movSpeed + movSpeedCombat + `_iMovSpd`×.01, `PlayerHpRegen += lifeRegen/60`, `MoveSpeedOoc` → `Config.PlayerOocSpeed` → Q(sBlock) 홀드 걸음 `.35×(1+OOC)` | 웹 대응: `game.html:28341`(P.speed), `28342`(`_oocSpeed`), `28344`(`P.hpR`). 세이브 영향 0(새 저장 키 없음). 밸런스: 해당 어픽스를 단 장비만 웹과 같아진다(지금 Unity는 무효). 미이식: `_altSpd`·`pPredSpd`·onKill 속도·`injuredSpeed`(D-U6, 웹이 applyStats 때만 잠그는 값). 이 레인은 resource-oracle 재실행을 못 했다(dotnet 없음) → 병합 전 PC에서 resource-oracle·defense-oracle·스윕 `--only player-hurt-oracle,save-oracle` 1회 |

## 3. 수정안 (패치, 미적용)

### P1 — `STG[33].bn` 웹과 맞추기 (Core 데이터, 위험 낮음)

생성 파일이므로 손으로 고치지 않고 생성기로 다시 만든다. 값 차이는 아래 1줄뿐이고, 나머지 변경은 주석의 앵커 줄 번호와 헤더다(이 레인이 node로 확인).

```bash
# 자기 Unity 작업본에서. game.html은 origin/main에서 꺼낸 임시 파일
git show origin/main:game.html > <tmp>/game.html
node unity/Tools/enemy-tables-oracle/export.cjs --source <tmp>/game.html --out unity/Tools/enemy-tables-oracle/oracle.json
node unity/Tools/enemy-tables-oracle/gen-cs.cjs   # EnemyTables.cs·EliteTables.cs 재생성(LF)
```

```diff
--- a/unity/Assets/Exoduser/Runtime/Core/EnemyTables.cs
+++ b/unity/Assets/Exoduser/Runtime/Core/EnemyTables.cs
@@ -227 +227 @@
-            new EnemyStageDef { N = "HELL CASTLE", Kr = "지옥성 2구역", W = "#1c1038", F = "#060410", Ac = "#cc88ff", Bn = "Killu", Be = 3, MonLv = 700, Hell = 6, HellFloor = 1, IsHellBoss = false, Chapter = 6 },
+            new EnemyStageDef { N = "HELL CASTLE", Kr = "지옥성 2구역", W = "#1c1038", F = "#060410", Ac = "#cc88ff", Bn = "킬루", Be = 3, MonLv = 700, Hell = 6, HellFloor = 1, IsHellBoss = false, Chapter = 6 },
--- a/unity/Tools/enemy-tables-oracle/oracle.json
+++ b/unity/Tools/enemy-tables-oracle/oracle.json
@@ -3229 +3229 @@
-    "bn": "Killu",
+    "bn": "킬루",
```

- 주의: export.cjs는 `git -C <source 폴더> rev-parse HEAD`로 head를 적는다. 임시 파일로 돌리면 head가 빈칸이 되니, head를 남기려면 웹 체크아웃 경로를 `--source`로 준다.
- 위험: `.Bn` 런타임 사용처 0 → 화면·세이브·밸런스 0. 확인: enemy-tables-oracle 1회(기대 FAIL 0).
- 대안(Core 무변경): D-014 판정을 유지하려면 하니스가 si33 bn을 예외로 둬야 하는데, 정본 키가 `킬루`인 지금은 근거가 약하다. P1을 권한다.

### P2 — 스킬창 16칸 (D-U4, UI 결정 대기)

Core를 웹에 맞추는 최소 변경:

```diff
--- a/unity/Assets/Exoduser/Runtime/Core/SkillUiState.cs
+++ b/unity/Assets/Exoduser/Runtime/Core/SkillUiState.cs
-  public const int LmbSlot=6,SlotCount=13;
+  public const int LmbSlot=6,SlotCount=16;   // web skill-forge.js SLOTS (10-31 9a5be1fac): +Space roll, X execution (intrinsic), T bow (fixed)
```

같이 바꿀 것(한 커밋):
- `skill-ui/export.cjs`로 `skill_ui.json`을 16칸으로 다시 뽑는다. 앞 13칸의 키·순서는 웹과 같고(1,2,3,4,F,Z,LMB,RMB,Shift,E,Q,Ctrl,Space), 뒤 3칸은 `intrinsic roll`·`intrinsic execution`·`fixed bow`.
- `NativeSkills.cs`의 `slots.Length!=13` 두 곳을 `SkillUiState.SlotCount`로 바꾸고, 3칸 배치·아이콘·표시 문자열(번역 등록)을 만든다.
- `skill-ui/Program.cs`의 13키 `SequenceEqual`을 16키로 바꾼다. `skill_defs_web.json`(webHead 057f6f4b7, 13칸)도 다시 뽑는다.
- 위험: 세이브 0(`Simulation.Skills.Slots`는 `SkillRules.SlotCount`라 별개). 화면이 바뀌므로 디자인총괄 1x 판정 대상. 스킬 장착 규칙은 LMB만 허용하는 지금 그대로다.
- 그 전까지: `skill-ui/export.cjs`를 저장소 안에서 돌리지 않는다(§1 #10 함정).

### P3 — D-U5 병합 (브랜치 있음)

`claude/unity-pc-du5-speed-regen-20261104` 98cf59aab를 그대로 `merge --no-ff`(충돌 0 확인). 새 패치 없음. 병합 전 PC 검사는 §2.

## 4. DEBUG_LEAD_BOARD 대조 메모 (보드 수정은 CTO 병합 때)

- D-014 ⑤ "Killu = 의도된 로캘 이름"은 고쳐야 한다. 웹 정본은 `킬루`이고 Unity 데이터도 e9898f795부터 `킬루` 키를 쓴다. Core `EnemyTables.cs` 값만 옛 스냅샷이다 → P1.
- D-014 ⑥·D-U4: export.cjs 덮어쓰기 함정(§1 #10)을 D-U4 줄에 더한다.
- D-T3로 A안 3종이 기본 모드에서 PASS가 됐으므로, D-014의 "FAIL로 남음" 문장은 지난 상태다.
- D-U5: 보드 §5 백로그에 있고 브랜치 98cf59aab가 준비됐으나 unity/main 미병합.
