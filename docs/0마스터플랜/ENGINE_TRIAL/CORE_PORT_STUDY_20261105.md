# Core 이식 가능성 사전 조사 (EP 레인, 2026-11-05)

- 브리프: `docs/0마스터플랜/worklog/cloud-lanes/BRIEF_OVERNIGHT2_20261105.md` EP 절. 엔진 결정(DIRECTION_RESET 11-05 10:20, K1 블라인드 비교) 전에 "UE가 이기면 Core를 어떻게 옮기나"를 숫자로 준비한다.
- 방법: **코드는 세기만 했다(수정 0).** 모든 수치는 아래 명령으로 다시 낼 수 있다. 외부 런타임은 공개 자료만 보고 출처 URL과 접속 여부(열림/검색 발췌/미검증)를 적었다. Core 수치·판정 변경 제안은 "Core 제안 n"으로만 번호를 붙였고 코드에는 넣지 않았다.
- 기준 커밋: 이 브랜치 HEAD `2f8ef039eb28b322ba99750254ae6050958ead3b` (= 조사 시점 origin/unity/main `39bbbe53867a17d2f693d0e6acce1a4b766a8558`의 직전 커밋. `git diff --quiet origin/unity/main HEAD -- unity/Assets/Exoduser/Runtime/Core` → 차이 0, 즉 Core는 unity/main 최신과 바이트까지 같다). 웹 oracle 원문은 origin/main `b94c8fbff29d01fa94c9cd7a51a7f4eadc4d7fc8` game.html 66,211줄.
- 이 체크아웃은 sparse(`docs/0마스터플랜`·`docs/engine`·`tools`·`unity/Assets/Exoduser/Runtime`)라 `unity/Tools`는 `git show origin/unity/main:<경로>`로 읽었다. 하니스를 실행하지는 않았다(.NET·Node 실행 0). 검사 수는 docs에 적힌 최근 값이다.
- 결론 절(§8)은 추천이 아니라 **K1에서 UE가 이기면 1주차에 할 일 목록**이다.

## 1. Core 크기 (①)

| 항목 | 값 | 명령 |
|---|---:|---|
| `.cs` 파일 수 | **133** | `find unity/Assets/Exoduser/Runtime/Core -name '*.cs' \| wc -l` |
| 줄 수(wc -l 합) | **18,320** | `find … -name '*.cs' \| xargs wc -l \| tail -1` |
| 하위 폴더 | 루트 129 / `Skills` 3(Simulation.Skills 447·Simulation.Fireball 188·SkillRules 99) / `Platform` 1(QaRunPolicy 33) | `find … -type d` |
| 네임스페이스 | `Exoduser.UnityPort.Core` 125 파일, `.Core.Combat` 7, `.Core.Skills` 1 | `grep -rhoE 'namespace [A-Za-z0-9_.]+' … \| sort \| uniq -c` |
| public 타입 | class 218(그중 static 53) · struct 37 · enum 32 · interface 6 | `grep -rhoE 'public (sealed \|static \|abstract \|partial )*class [A-Za-z0-9_]+' … \| awk '{print $NF}' \| sort -u \| wc -l` 등 |
| 가장 큰 파일 10 | EnemyAi 782 · DropTablesData 596 · DruidBoss.Moves 553 · EnemyHurt.DeathTail 530 · EnemyFactory 511 · DruidBoss 508 · DruidBoss.Hazards 456 · Skills/Simulation.Skills 447 · Simulation 418 · ItemFactory 381 | `… \| xargs wc -l \| sort -rn \| head` |
| 한 줄 파일 | GateEnterDelay·DeferredQuitIntent·CombatDamageTelemetry (각 1줄, 압축 작성) | — |
| 표현층(Runtime 나머지) 대비 | Runtime 비Core `.cs` **293파일 34,145줄**. 그중 172파일이 `Exoduser.UnityPort.Core`를 참조, 124파일이 `Simulation`을 언급, `.Player/.Enemies/.Loot` 읽는 줄 433 | `find unity/Assets/Exoduser/Runtime -name '*.cs' -not -path '*/Core/*'`, `grep -rl 'Exoduser.UnityPort.Core' … \| grep -v /Core/` |

참고: 이식 대상은 Core 18,320줄이다. 표현층 34,145줄은 어느 안을 고르든 UE에서 다시 만든다(Unity 전용 코드).

## 2. 순수 C# 여부 — UnityEngine·Unity.* 참조 (②)

**어셈블리 수준에서 이미 봉인돼 있다.** `unity/Assets/Exoduser/Runtime/Core/Exoduser.Core.asmdef`:

```json
"references": [], "noEngineReferences": true, "allowUnsafeCode": false
```

`noEngineReferences: true`는 Unity 컴파일러가 UnityEngine.dll 참조 자체를 빼므로, Core 안의 어떤 파일도 `UnityEngine`·`Unity.*` 타입을 쓸 수 없다(쓰면 컴파일 실패). 표현층 `Exoduser.Runtime.asmdef`만 `Exoduser.Core`·InputSystem·Cinemachine·URP를 참조한다.

| 검색 | 파일 | 줄 | 내용 |
|---|---:|---:|---|
| `\bUnityEngine\b` | **2** | 2 | 둘 다 주석: `AutoPotion.cs:6` "Pure state and arithmetic, no UnityEngine", `KeyBindings.cs:7` "Pure C#, no UnityEngine" |
| `\bUnity\.[A-Z]` | 0 | 0 | — |
| `UnityEditor` | 0 | 0 | — |
| `Mathf` · `Vector2` · `Vector3` · `Time.deltaTime` · `Time.time` · `Resources.` · `Debug.Log` · `MonoBehaviour` · `ScriptableObject` · `SerializeField` · `PlayerPrefs` · `Random.Range` · `UnityEngine.Random` | 0 | 0 | — |
| `JsonUtility` | 1 | 1 | 주석(`SaveJson.cs:9`, "JsonUtility cannot write …" 이유 설명) |
| `Application.` | 1 | 1 | 주석(`Platform/QaRunPolicy.cs:22`, `-batchmode` 설명) |

명령: `grep -rl -E '\bUnityEngine\b' unity/Assets/Exoduser/Runtime/Core --include='*.cs'`, `grep -rn -E '\bUnity\.[A-Z]' …`, 식별자별 `grep -rl -E "\b$k" …`.

**UnityEngine 참조 파일 수 = 0(코드 기준) / 2(주석 포함).** Core는 .NET 표준 라이브러리만 쓰는 순수 C#이다. 실제로 oracle 하니스(§5)가 이 파일들을 Unity 없이 `net8.0` 콘솔 프로젝트에 `Compile Include`로 직접 넣어 CoreCLR에서 돌린다.

## 3. 외부 의존 종류별 사용 수 (③)

### 3.1 using 지시문 (명령: `grep -rh -E '^\s*using ' … \| sort \| uniq -c`)

| 네임스페이스 | 지시문 수 | 비고 |
|---|---:|---|
| `System` | 110 | 압축 한 줄 파일 4개는 `using System;using …`로 붙어 있어 따로 셈 |
| `System.Collections.Generic` | 68 | List·Dictionary·Queue |
| `System.Text` | 7 | StringBuilder |
| `System.Globalization` | 8 | InvariantCulture 파싱 |
| `System.IO` | **3** | `NativeSettingsStore.cs`·`CharacterRosterStore.cs`·`CombatSaveStore.cs` (합 550줄) — 파일 저장소. 이식 시 호스트 파일 API로 교체 가능한 경계 |
| `System.Reflection` | 1 | `CombatSave.cs:177` `typeof(InventoryItem).GetFields(…)`로 웹 아이템 필드 직렬화 |
| `System.Numerics` | 1 | `ItemFactory.cs:25` `BigInteger`로 JS `Number` 십진 출력(아이템 값 문자열)을 정확히 재현 |
| `System.Linq` | 1 | `Simulation.PlayerCombat.cs:3` |
| `System.Collections.ObjectModel` | 1 | ReadOnly 컬렉션 |

### 3.2 수학·난수·시계 (명령: `grep -rn -F "$k(" …`)

| 함수 | 줄 | 파일 | 이식 위험 |
|---|---:|---:|---|
| `Math.Max` / `Math.Min` | 296 / 225 | 71 / 63 | 없음 |
| `Math.Floor` / `Ceiling` / `Truncate` | 41 / 9 / 26 | 22 / 7 / 11 | 없음(IEEE 정확) |
| `Math.Sqrt` | 40 | 24 | 없음(IEEE 정확) |
| `Math.Abs` / `Sign` | 35 / 5 | 22 / 5 | 없음 |
| `Math.Round` | 19 (`MidpointRounding` 명시 3줄) | 8 | **있음**: C# 기본은 은행가 반올림, C/C++ `round()`는 half-away. 16줄은 기본 모드라 C++에서 `nearbyint`(FE_TONEAREST)로 옮겨야 함 |
| `Math.Pow` / `Exp` / `Log` | 11 / 1 / 0 | 8 / 1 / 0 | **있음**: .NET은 CRT를 호출하고 C++도 CRT지만 플랫폼(MSVC·Apple libm)마다 마지막 비트가 다를 수 있음. 12줄 전수 확인 대상 |
| `JsMath.Atan2` / `Sin` / `Cos` | 40 / 78 / 78 | 10 / 12 / 12 | `JsMath.cs`(180줄)가 **V8 fdlibm 5.3(e_atan2·s_atan·k_sin·k_cos·e_rem_pio2)을 C#으로 옮겨 비트 단위로 같게** 만든 것. 주석: ".NET calls the C runtime for these and differs from V8 in the last bit". C++로는 fdlibm 원문을 그대로 쓸 수 있어 오히려 쉬움(라이선스는 Sun 허용형, 반입 결정은 CTO) |
| 원시 `Math.Sin` / `Cos` / `Atan2` (JsMath 아님) | 33 / 33 / 30 | — | JsMath를 거치지 않는 호출. 대부분 `JsMath.cs` 내부와 각도 보조식으로 보이나 **전수 확인 필요**(이식 때 같은 분류 적용) |
| `Js.Int` / `Js.Or` | 196 | — | `Js.cs`(17줄): JS `~~x`(ToInt32 절단)·`a\|\|b`(falsy 기본값). C++ 한 줄씩 대응 |
| `System.Random` / `new Random` | **0** | 0 | 난수는 Core 자체 LCG `randomState*1664525+1013904223`(`Simulation.cs:55`) 또는 주입 `Func<double>` |
| `double` / `float` / `decimal` 줄 | 2,700 / 353 / 1 | — | 규칙 계산은 double(웹 JS Number와 동일). float는 `Simulation.cs` 42줄·`SimulationState` 22줄 등 위치·입력 필드. druid-boss-oracle은 이 float 때문에 허용 오차 1e-3px + 상대 1.2e-7을 둔다 |
| 벽시계 | `Simulation.cs:313` `NowMs = () => DateTimeOffset.UtcNow…`(아이템 생성 시각), `:343` `TodayKey = () => LevelExp.TodayKey(DateTime.Now)`(일일 경험치 키), `EnemyTickContext.Now`(performance.now), `CombatSaveStore.cs:75` `DateTime.UtcNow`(세이브 updated_at) | 4곳 | 전부 `Func<>` 기본값이라 호스트가 덮어쓸 수 있음. 결정론 재생에서는 반드시 주입 |

### 3.3 JS 형태를 그대로 옮긴 구조 (C++ 이식 때만 비용)

| 구조 | 수 | 명령 |
|---|---:|---|
| 문자열 상태기 (`State == "sBash"` 류 비교) | 65줄, `PlayerState.State`·`EnemyState.State`가 `string` | `grep -rn -E 'State ?[!=]= ?"' …` |
| `Dictionary<string, …>` 선언 | 42 | `grep -rn 'Dictionary<string,' …` |
| `object` 타입 필드·인자 | 63줄 | `grep -rn -E '\bobject\b' …` |
| `JsObj`(EnemyHurtContext.Tail 동적 객체) | 3파일 25줄 | `grep -rn '\bJsObj\b' …` |
| `JsonValue`(SaveJson 143줄, 순서 보존 JSON 트리) | 1 | 웹 세이브 모양 재현 |

C#→C#(B·C안)에서는 비용 0. C++(A안)에서는 enum화하면 oracle 비교가 문자열이라 변환표가 필요하다.

## 4. Core ↔ 표현 경계 (④)

### 4.1 컴파일 경계

- Core → Runtime 참조: **0** (`grep -rn -E 'Exoduser\.UnityPort\.(Native|Runtime|Vfx|Input|Tools)' Core` = 0, asmdef `references: []`라 불가능).
- Runtime → Core 참조: 172파일. 방향이 한쪽이다.

### 4.2 제어 역전 지점 — Core가 호스트를 부르는 곳

Core는 표현을 직접 부르지 않고 **델리게이트 필드·인터페이스·이벤트 큐**로 호스트에 맡긴다. 이 표면이 곧 이식 ABI다.

| 종류 | 수 | 위치(파일: 개수) | 명령 |
|---|---:|---|---|
| `public Func<>/Action<>` 필드 | **108** | EnemyTickContext 24 · EnemyHurtContext 22 · EnemyHurtContext.Death 17 · EnemyHurtContext.Tail 13 · Simulation 7 · SpawnHoles 6 · ReviveRules 4 · Simulation.Revive 2 · EnemyFactory 2 · DruidBoss.Hazards 2 · 나머지 9파일 각 1 | `grep -rc -E 'public (static )?(Func\|Action)<' …` |
| 호스트 인터페이스 | 6 | `IBossHost`(DruidBoss.cs:13) · `IEnemyAiHost`(EnemyAi.cs:8) · `IMeleeCombatHost`(MeleeAttackRules.cs:3) · `IBossReflectHost`·`IBossEnergyHost`(DruidBoss.Reflect.cs) · `ICombatDamageTelemetry` | `grep -rn -E '\binterface I[A-Z]' …` |
| `event` 선언 | 26 | — | `grep -rn '\bevent\b' …` |
| 표현 알림 큐 | 1 | `Feedback.cs` `Queue<FeedbackEvent> Feedback` — 12종 `FeedbackKind`, "Native view drains once after Tick", "the Core never draws a random number for sound" | — |
| 월드 질의 입력 | 5 | `Simulation.cs:18~22` `CanMove`·`HasLineOfSight`·`IsLootOnScreen`·`TryCollectLoot`·`Random01` | — |
| 틱 입력 | 1 | `Simulation.Tick(float moveX, float moveY, float aimX, float aimY, bool attack, bool pickup)` (`Simulation.cs:67`), 1 Tick = 웹 60Hz 1프레임(`docs/engine/UNITY_SOURCE_CORE_20261024.md` "좌표/시간") | — |
| 상태 읽기 폭 | PlayerState public 멤버 35 · EnemyState 22 · LootState · SimulationConfig | `SimulationState.cs` | — |

108개 델리게이트 중 이름이 표현·소리·텍스트 성격인 것(수기 분류, 재확인 필요): EnemyHurtContext의 `AddText`·`AddParts`·`Shake`·`DoHitFlash`·`PlaySample`·`HitSfxForEtype`·`Translate`·`PoolPart`·`AddImpact`·`AddBoom`·`FeelContact`(11), `.Death`의 `ReviveVfx`·`PlayVfxAng`·`AddBlastLight`·`AddTpBolt`·`DeathFx`·`SpawnLargeMonsterDeathFx`·`AddCorpse`·`AddBurnCorpse`·`AddGorePiece`·`AddDeathImpact`·`Lang`(11), `.Tail`의 `BossLine`·`WiPush`(2), EnemyTickContext의 `BossReviveGrandVfx`·`Translate`·`AddText`·`AddParts`·`Shake`·`PlaySample`(6), `SpawnHoles.Finished`·`DruidBoss.Hazards.OnSpawn`(2) = **약 32개**. 나머지 약 76개는 월드 질의(`CanMove`·`IsWall`·`HasLos`)·난수·스탯 조회·피해 전달 같은 규칙 입력이다. 이 32개는 웹 `hurtE`·`updateE` 원문이 그 자리에서 입자·텍스트를 찍던 흔적이며, 호스트가 null/빈 람다를 넣어도 규칙 결과는 같다(oracle이 그렇게 돌린다).

### 4.3 경계가 깨끗한가

- **깨끗하다(컴파일 기준).** Core에서 표현으로 가는 직접 호출 0, 정적 가변 상태 사실상 0(`static` 비readonly 필드 검색 결과는 전부 메서드·속성·정적 생성자).
- **넓다(ABI 기준).** 델리게이트 108 + 인터페이스 6 + 이벤트 26 + 상태 클래스 공개 필드 ≥ 57이 모두 호스트 접점이다. C안(DLL/IPC)에서는 이 전부를 C ABI로 평탄화해야 하고, B안에서는 그대로 쓴다.
- 접착층 집중: 훅·IO·인터페이스가 하나도 없는 "순수 계산" 파일은 **90/133 파일, 9,711줄**(`grep -L -E 'Func<|Action<|System\.IO|interface I'`). 나머지 43파일 8,609줄이 Simulation.* 접착·컨텍스트·저장소다.

## 5. 웹 oracle 테스트 구조 (⑤)

### 5.1 위치와 수 (origin/unity/main `39bbbe53`, `git ls-tree -r --name-only origin/unity/main unity/Tools`)

| 항목 | 값 |
|---|---:|
| `unity/Tools` 전체 파일 | 800 |
| `*.csproj` (C# 하니스) | **80** |
| `Program.cs` | 86 |
| `*-oracle` 폴더 | **36** (+ `map-oracle.cjs` 1) |
| `export*.cjs` (웹 원문 추출기) | 45 |
| 커밋된 골든 JSON (oracle 폴더 안) | 46파일 **131 MB** (27폴더) |
| `runs/*.json` (green/red 영수증) | 9 |
| `unity/Assets/Exoduser/Tests` | **없음**(sparse 목록에 있으나 unity/main에 폴더 없음). Unity Test Runner 테스트는 0, 전부 `unity/Tools`의 dotnet 콘솔 하니스 |
| 통합 실행기 | `unity/Tools/oracle-sweep/run.cjs`(PASS/FAIL/BUILD-BREAK/NEEDS-INPUT/SKIP 분류), `unity/Tools/verify-core.cjs`(`Tools/Tests/CoreTests.csproj` + `map-oracle.cjs` 2,523표본) |

### 5.2 골든 트레이스 수 (커밋된 oracle.json의 주 컬렉션 길이; 명령: 각 JSON을 `node -I count.js`로 최대 배열/객체 길이 집계)

| 하니스 | 주 컬렉션 | 수 | 크기 |
|---|---|---:|---:|
| enemy-hurt-oracle | cases | **4,968** | 25.1 MB |
| drop-oracle | mk | 3,000 | 4.3 MB |
| auto-potion-oracle | auto | 1,866 | 1.4 MB |
| enemy-tick-oracle | cases | 1,240 | 5.2 MB |
| enemy-ai-oracle | cases | 692 | **43.9 MB** |
| enemy-spawn-oracle | cases | 538 | 3.6 MB |
| fieldboss-oracle | faces | 400 | 10.4 MB |
| inv-salvage-oracle | rows | 224 | 16 KB |
| damage-parity-oracle | scenarios | 211 | 1.9 MB |
| dash-parry-oracle | blocks | 167 | 7.7 MB |
| dash-hit-oracle | cases | 160 | 219 KB |
| language-oracle | cases | 159 | 15 KB |
| enemy-pool-oracle | cases | 105 | 178 KB |
| parry-reflect-oracle | blocks | 55 | 9.9 MB |
| skill-oracle | blocks | 48 | 278 KB |
| weapon-xbow-oracle | blocks | 42 | 2.2 MB |
| ki-slash-oracle | scenarios | 40 | 39 KB |
| lobby-oracle | captions | 29 | 129 KB |
| inventory-oracle | cases | 27 | 99 KB |
| enemy-tables-oracle | executed | 26 | 53 KB |
| region-oracle | blocks | 20 | 12.5 MB |
| hud-oracle | rows | 15 | 16 KB |
| c01-field-oracle | holes | 14 | 22 KB |
| player-hurt-oracle | blocks | 13 | 2.3 MB |
| comparison / feedback / stage-flow | cases / live_comparison / blocks | 10 / 10 / 10 | 26 KB / 8 KB / 2.3 MB |
| roll-oracle | blocks | 9 | 3.1 MB |
| druid-boss·defense·resource·hunter·level-exp·rage-malice·save·shield-revive | (커밋 없음) | 실행 때 `git show origin/main:game.html`에서 다시 추출 | — |

"블록"은 틱 단위 시나리오 묶음이라 안의 검사 수는 훨씬 크다. docs에 적힌 최근 검사 수: 적 AI **1,424,276/0**, 분열 **6,067,801/0**, 생성 **264,064/0**(A안 모드, `docs/engine/DEBUG_LEAD_BOARD_20261103.md` D-T3), dash-parry 187,165/0, 처치 꼬리 CX-04c1 4,225,618/0(브랜치에만, `UNITY_ORACLE_COVERAGE_AUDIT_20261028.md`), 자원 530건·방어 240+11,520건(D-U3·D-U2). 11-04 일괄 점검(D-014): **C# 하니스 76개 중 FAIL 10, 게임 결함 0**, NEEDS-INPUT 9.

### 5.3 실행 방법 (하니스 하나의 흐름, `druid-boss-oracle` README·run.cjs·Program.cs 기준)

```powershell
& 'C:\nvm4w\nodejs\node.exe' unity/Tools/druid-boss-oracle/run.cjs --cases 48   # export → dotnet build → 비교(불일치 0이어야 통과)
& 'C:/nvm4w/nodejs/node.exe' ./unity/Tools/oracle-sweep/run.cjs                 # 전체 일괄(PASS/FAIL/BUILD-BREAK/NEEDS-INPUT/SKIP)
& 'C:\nvm4w\nodejs\node.exe' .\Tools\verify-core.cjs --source-root <wt> --project <wt>\unity --out <I:\…>
```

1. `run.cjs`가 `git show origin/main:game.html`로 **커밋된 웹 원문**을 꺼낸다(공용 작업본 사용 금지).
2. `export.cjs`가 원문에서 함수 블록을 줄 머리말·중괄호 균형으로 잘라내(`fn('function _bossAI')` 식, 각 블록 sha256 기록) Node VM에서 실행한다. `Math.random`은 **같은 LCG**(`s*1664525+1013904223`, `/2^32`)로 바꾸고, 입자·VFX 인자용 난수는 별도 스트림 `_vr`로 보낸다. 결과가 `oracle.json`("기대값은 손으로 쓰지 않는다").
3. `dotnet build <하니스>.csproj`(net8.0, `EnableDefaultCompileItems=false`, `Compile Include="$(ExoduserProject)/Assets/Exoduser/Runtime/Core/…"`)가 **Core .cs 원본을 그대로** 컴파일한다.
4. `Program.cs`가 oracle.json을 재생하며 틱마다 난수 추첨 횟수·상태 필드·`hurtP/hurtE/doParry` 호출 목록·투사체·장판을 비교한다. 호스트 인터페이스(`IBossHost`)는 `Fake` 클래스로 채운다.

이식 관점의 함의: **골든 데이터(131 MB + 재추출)는 엔진과 무관**하다. 하니스는 "Core 소스를 직접 컴파일"하므로, (B)안은 하니스를 그대로 쓰고, (C)안은 하니스가 DLL을 부르도록 바꾸며, (A)안은 Program.cs 86개를 C++ 호출로 바꾸거나 C++ Core를 P/Invoke로 감싸 기존 C# 하니스에서 호출한다.

주의: Core는 **이미 CoreCLR(.NET 8)에서 웹과 등가임이 검증된 상태**다. Unity는 Mono/IL2CPP로 돌리므로, UE용 .NET 런타임(B·C안)은 검증 환경과 더 가깝다.

## 6. 이식 경로 3안 비교

### 6.0 공통: 결정론(틱·난수) 유지 방법

- 틱: Core는 가변 dt가 없다. `Tick()` 1회 = 60Hz 1프레임, 모든 시간은 틱 수·프레임 수(예: `ChainDash.cs:65` `/60`). UE에서는 고정 스텝 누적기(또는 `t.FixedFrameRate=60`)로 호출 횟수만 맞추면 된다. 렌더는 보간.
- 난수: 기본 LCG(seed `uint`) + `Random01` 주입. oracle이 추첨 **횟수와 순서**를 비교하므로 어느 안이든 이 스트림을 그대로 둔다. UE `FRandomStream`을 쓰지 않는다.
- 시계: `NowMs`·`TodayKey`·`EnemyTickContext.Now`·세이브 `DateTime.UtcNow` 4곳을 호스트가 주입(재생 때 고정값).
- 부동소수: 규칙은 double. C++(A안)에서는 `/fp:precise`(MSVC)·`-ffp-contract=off`(clang), FMA 금지, `-ffast-math` 금지, x64 SSE2 동일. Round 모드·Pow 12줄·원시 Sin/Cos/Atan2 96줄은 전수 비트 검사(JsMath와 같은 방식: V8 vs 구현을 수천 인자로 대조).

### 6.1 A안 — C++ 수동 이식 + 골든 트레이스 등가 검증

| 항목 | 내용 |
|---|---|
| 작업량 근거 | 18,320줄 전부 손 이식. 순수 계산 9,711줄(90파일)은 기계적, 접착 8,609줄(43파일)은 델리게이트 108개를 C++ `TFunction`/인터페이스로 재설계. JS 형태(문자열 상태기 65·`Dictionary<string>` 42·`object` 63·`JsObj`·`JsonValue`·BigInteger 십진 출력)는 C++에서 자료형을 새로 정함 |
| 기간 추정 | DIRECTION_RESET 11-05 10:20의 "Core 18,320줄 이식 6~12주"가 이 안이다. 근거: 하니스 86개를 C++ 호출로 옮기는 일이 Core 이식과 같은 규모(unity/Tools C# 하니스는 Core를 소스로 포함하므로 전부 재작성 또는 P/Invoke 래퍼). 하루 300~500줄(이식+oracle 통과) 가정 시 Core만 37~61 작업일 |
| 위험 | ① 부동소수 마지막 비트(Round·Pow·원시 삼각) ② 문자열→enum 전환 시 oracle 비교표 ③ 두 벌(웹 oracle, Unity Core)과 세 번째 구현이 생겨 docs 동기화 대상 증가 ④ 이식 중 Core가 계속 바뀌면(IA·SK·CW 레인) 따라가기 |
| 장점 | UE 네이티브, 외부 런타임 의존 0, 패키징·플랫폼 문제 0, 디버깅 UE 안에서 |
| 결정론 | §6.0 전부 적용. JsMath는 fdlibm 원문 사용 가능(반입 여부 결정 필요) |

### 6.2 B안 — UE용 C# 런타임 (UnrealSharp 등) 위에 Core를 그대로 올림

조사한 세 프로젝트(전부 **Epic 공식 아님**, MIT):

| 프로젝트 | 설명(원문) | UE | .NET | 플랫폼 | 규모 | 최근 커밋 | 출처·접속 |
|---|---|---|---|---|---|---|---|
| **UnrealSharp** (`github.com/UnrealSharp/UnrealSharp`) | "a plugin to Unreal Engine 5, which enables developers to create games using C# (.NET10) with Hot Reload", "MIT licensed" | "Unreal Engine 5.6 – 5.8" | ".NET 10.0.5 or newer" | Windows 지원, macOS 지원, Linux·iOS·Android "Planned" | 2.0k★, 225 fork, 2,081 commits, GitHub Releases **없음**("There aren't any releases here") | **2026-10-26** (main, PR #794 "Guard against managed class deletion") | README·commits·releases 페이지 열림(2026-11-05). 문서 사이트 `unrealsharp.github.io`·Epic 포럼 스레드는 이 세션 네트워크에서 **미접속** → 패키징(Shipping 빌드)·GC·NativeAOT 여부 **미검증** |
| UnrealCSharp (`github.com/crazytuzi/UnrealCSharp`) | "based on .NET 10 (CoreCLR/Mono/LeanCLR), is a C# programming plugin for UE" | "Unreal Engine 5.0 - Unreal Engine 5.8" | .NET 10 | Windows/macOS/Linux/Android/iOS(README 표기) | 814★, 1,384 commits | **2026-10-08** (main, PR #594) | README·commits 열림 |
| UnrealCLR (`github.com/nxrighthere/UnrealCLR`) | "Unreal Engine .NET 6 integration" | "4.25.4 or higher" | .NET 6 | — | 3.3k★, 381 commits | **2023-06-07** ("Fix typo") | 열림. 2년 넘게 커밋 없음 → **휴면** |

(MonoUE 등 더 오래된 시도와 Epic의 공식 C# 입장은 공식 문서를 못 열어 미검증. Epic 공식 스크립트는 C++·Blueprint뿐이라는 전제로 본다.)

| 항목 | 내용 |
|---|---|
| 작업량 근거 | Core 이식 **0줄**(순수 C#, `noEngineReferences`라 UnityEngine 의존 없음). 할 일은 ① Core 133파일을 UnrealSharp 프로젝트(.csproj)에 넣기 ② 호스트 어댑터(델리게이트 108·인터페이스 6·Feedback 큐를 UE 액터로 연결) ③ 저장소 3파일의 경로를 UE 저장 경로로 ④ 하니스는 그대로 |
| 기간 추정 | Core 올리고 oracle 동일 결과까지 **1~2주**(스파이크 3일 + 어댑터). 단 표현층은 별도 |
| 위험 | ① 플러그인 성숙도: 릴리스 태그 없음, 버전 결합(5.6~5.8)이라 UE 업그레이드마다 플러그인 재검증 ② Shipping 패키징·Mac 패키징·Steam 배포 사례 **미검증** ③ .NET GC가 틱 중 멈춤(Core는 틱마다 `FeedbackEvent` 등 객체 할당 — 할당량 측정 필요) ④ 상용 게임 3종("Ballistic Brews", "Forged: Reconquest", "Prompt Crisis") 외 대형 사례 없음 ⑤ 외부 저장소가 멈추면 우리가 포크 유지 |
| 장점 | 검증 환경(CoreCLR)과 같음 → oracle 결과가 그대로 유효. Unity판과 Core 공유 가능(한 소스 두 호스트) |
| 결정론 | 그대로. .NET 10 CoreCLR의 `Math.Pow`·`Round` 동작은 .NET 8 하니스와 같은 구현 계열(확인 필요, oracle 1회로 판정) |

### 6.3 C안 — Core를 별도 C# DLL/프로세스로 두고 UE C++와 연결

| 항목 | 내용 |
|---|---|
| 형태 | C-1 **인프로세스 DLL**: .NET NativeAOT로 Core를 네이티브 `.dll/.dylib`로 빌드(`[UnmanagedCallersOnly]` export), UE C++가 `Create/Tick/ReadState/DrainFeedback/Destroy`를 직접 호출. 또는 hostfxr로 CoreCLR을 UE 프로세스에 임베드. C-2 **별도 프로세스**: 파이프/공유메모리로 틱 입력·상태 스냅샷 교환 |
| 작업량 근거 | Core 이식 0줄 + **C ABI 설계**: 델리게이트 108개를 함수 포인터 테이블로, 상태 읽기(현재 Runtime이 433줄에서 필드 직접 읽음)를 스냅샷 구조체로 평탄화. 약 32개 표현 콜백은 Feedback 큐로 합칠 수 있음(Core 제안 1). Reflection 1곳(CombatSave)·BigInteger는 NativeAOT에서 트리밍 경고 확인 |
| 기간 추정 | C-1: ABI 설계·마샬링 2~3주(Core 무변경 전제, 콜백 평탄화에 Core 제안 반영 시 +1주). C-2: C-1 + 직렬화·동기화 1~2주 |
| 지연·결정론 | C-1은 함수 호출이라 지연 0, 결정론 그대로. C-2는 왕복 1틱 지연이 생기고 입력·상태를 매 틱 직렬화(PlayerState 35 + Enemy n×22 + 투사체·장판)해야 해 60Hz에서 병목·드리프트 위험. **C-2는 폴백으로만** |
| 위험 | ① NativeAOT macOS/Windows 두 벌 빌드 파이프라인 ② UE 패키징에 외부 바이너리 동봉(플랫폼별 서명·노타리제이션) ③ 디버깅이 두 세계로 갈림 ④ 108 훅 평탄화는 사실상 Core 접착층 재설계 |
| 장점 | UE 플러그인 외부 의존 없음(.NET SDK만), Unity판과 소스 공유, 하니스 그대로 |

### 6.4 한눈 비교 (추천 아님)

| | A C++ 손 이식 | B UnrealSharp 류 | C DLL/IPC |
|---|---|---|---|
| Core 이식 줄 수 | 18,320 | 0 | 0 (+ABI) |
| 하니스(86 Program.cs) | 재작성 또는 P/Invoke | 그대로 | DLL 호출로 변경 |
| 기간(Core만) | 6~12주 | 1~2주 | 2~4주 |
| 외부 의존 | 없음 | 비공식 플러그인(활발, 릴리스 없음) | .NET SDK·NativeAOT |
| 결정론 | 비트 검사 필요(Round·Pow·삼각) | 검증 환경과 동일 | 동일(C-1) / 1틱 지연(C-2) |
| 가장 큰 미검증 | — | Shipping·Mac 패키징·GC | NativeAOT 트리밍·패키징 |
| 표현층 34,145줄 | 전부 재작성 | 전부 재작성 | 전부 재작성 |

### 6.5 Core 제안 (번호만, 미반영)

- **Core 제안 1**: 표현 성격 델리게이트 약 32개(`AddText`·`AddParts`·`Shake`·`PlaySample`·`DeathFx` 등)를 `FeedbackEvent` 큐로 통일하면 C안 ABI와 B안 어댑터가 모두 작아진다. 규칙 결과 무변경(oracle이 이미 이들을 무시하고 돈다).
- **Core 제안 2**: `NowMs`·`TodayKey`·`EnemyTickContext.Now`·`CombatSaveStore`의 벽시계 기본값을 "주입 필수"로 바꿔 재생 결정론을 컴파일 시점에 보장. 수치 무변경.
- **Core 제안 3**: `Math.Round` 기본 모드 16줄에 `MidpointRounding`을 명시해 C++ 이식 때 모호함 제거. 결과 무변경(현재 동작을 그대로 적는 것).

## 7. 미검증·출처

- 열림: `https://github.com/UnrealSharp/UnrealSharp`(README·`/commits/main`·`/releases`), `https://github.com/crazytuzi/UnrealCSharp`(README·`/commits/main`), `https://github.com/nxrighthere/UnrealCLR`(README·`/commits/master`). 모두 2026-11-05 접속.
- 검색 발췌(열지 못함): Epic 포럼 UnrealSharp 스레드, Gitee 미러 README(2026-03, "UE 5.5–5.7 / .NET 10.0.5+"), NuGet `UnrealSharp.Toolkit 1.2.1`(2024-07, 옛 버전).
- 미접속(세션 네트워크 차단): `unrealsharp.github.io`, `forums.unrealengine.com`, `dev.epicgames.com`, `api.github.com`(403). → B안의 Shipping 패키징·GC·NativeAOT 사용 여부, UE5 LWC(double 좌표) 공식 설명은 **미검증** 3건.
- 미검증(계산 아닌 수기 분류): 표현 성격 델리게이트 "약 32개", 원시 `Math.Sin/Cos/Atan2` 96줄의 용도 분류.
- 본 문서가 실행하지 않은 것: oracle 하니스·.NET·Unity. 검사 수는 `docs/engine/DEBUG_LEAD_BOARD_20261103.md`·`UNITY_ORACLE_COVERAGE_AUDIT_20261028.md`·`unity/Tools/README.md`에 적힌 값이다.

## 8. K1에서 UE가 이기면 1주차에 할 일

(엔진 결정 뒤 첫 5 작업일. 세 안 모두에 공통인 일을 먼저, 안 선택을 위한 스파이크를 그 다음에. 전부 Core 수치 무변경, docs·Tools·새 폴더만.)

1. **Core 독립 빌드 1개 고정** — `unity/Tools` 하니스가 하는 방식 그대로 `Exoduser.Core.csproj`(net8.0, 133파일 `Compile Include`) 하나를 만들고 `oracle-sweep/run.cjs`를 그 빌드에 대해 1회 돌려 **기준선 PASS 목록**(D-014 기준 76개 중 FAIL 10·NEEDS-INPUT 9)을 영수증으로 남긴다. 이후 모든 안의 합격 기준 = 이 목록과 동일.
2. **Core ABI v0 표** — §4.2의 델리게이트 108·인터페이스 6·이벤트 26·`Tick` 서명·`FeedbackEvent` 필드·상태 클래스 공개 필드를 `file:line`으로 한 표에 고정(`ENGINE_TRIAL/CORE_ABI_V0.md`). 표현 성격 32개는 따로 표시(Core 제안 1 판단 자료).
3. **결정론 봉인 점검** — 벽시계 4곳·`Random01`·원시 `Math.Sin/Cos/Atan2` 96줄·`Math.Round` 19줄·`Math.Pow/Exp` 12줄의 전수 목록을 만들고, 재생 모드에서 전부 주입/고정되는지 하니스 1개(druid-boss-oracle)로 확인. 필요한 Core 제안 2·3은 CTO 승인 뒤 별도 커밋.
4. **B안 스파이크(Mac, 3일 상한)** — UE 5.8 + UnrealSharp(main, 2026-10-26 이후 커밋) 빈 프로젝트에 Core 133파일을 넣어 컴파일 → `Simulation` 600틱(10초) 실행 → 1항 하니스와 같은 입력으로 상태 해시 비교. 함께 측정: 틱당 ms, GC 할당 KB/틱, **Shipping 패키징 성공 여부(Win·Mac)**. 문서 사이트·포럼을 열 수 있는 환경에서 패키징·GC 공식 설명을 먼저 읽고 출처를 적는다(이번 조사 미검증 항목).
5. **C-1 스파이크(2일 상한)** — Core를 NativeAOT `.dylib`로 빌드(Reflection 1곳·BigInteger 경고 기록), C 함수 6개(`Create/Tick/ReadPlayer/ReadEnemies/DrainFeedback/Destroy`)만 export해 UE C++ 빈 액터에서 600틱 호출, 4항과 같은 해시 비교. 108 훅은 이 스파이크에서 null 처리(oracle과 같은 조건).
6. **A안 준비 최소치** — `JsMath.cs`에 대응하는 fdlibm 원문 반입 여부를 CTO에 질의(라이선스 표기). 반입이 되면 C++ `atan2/sin/cos` 비트 검사 1,000인자(기존 oracle의 V8 대조 방식 재사용)만 1일로 해 두고, 본 이식은 4·5항 결과 뒤로.
7. **표현층 의존 분류** — Runtime 172파일이 Core에서 읽는 것을 "필드 HUD·적 뷰·보스 뷰·로비/세이브·QA 캡처"로 나눠 줄 수 기준 표를 만든다(UE 표현 재작성 견적의 입력, Core 이식 범위 밖).
8. **판정표** — 안별 go/no-go: ① 1항 PASS 목록과 동일 ② 틱 ≤ 1 ms(1-1 적 수 기준) ③ Win·Mac Shipping 패키징 성공 ④ 외부 의존의 최근 커밋 ≤ 90일. 결과를 `ENGINE_DECISION`(DIRECTION_RESET이 가리키는 파일, 조사 시점 unity/main에 **미존재**)에 붙일 수 있게 같은 폴더에 둔다.
9. 범위 밖(1주차에 하지 않음): Steam 업로드 경로 재작성, 표현층 이식, Core 제안 반영, UE 자산 작업.

