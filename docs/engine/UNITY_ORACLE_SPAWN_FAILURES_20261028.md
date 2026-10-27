# oracle 실패 조사 — enemy-spawn 531건 · stage-flow 1건 (2026-10-28)

브랜치 `claude/unity-pc-oracle-spawn-20261028` (기준 `origin/unity/main` 9f1cde54a). 결과: **enemy-spawn 204,592 검사 / 실패 0**(이전 205,123 / 531), **stage-flow 7,076 / 실패 0**(이전 1).

## 1. enemy-spawn 531건 = 원인 1종

| 유형 | 건수 | 구분 | 원인 | 조치 |
|---|---|---|---|---|
| `result._mwStk set in C# but undefined in web` | 531 (538 케이스 중 531, 케이스마다 1건) | **Core 이식 오류**(생성 파일 수동 편집) | B03b(e91404812)가 악의구 "악의 약화"를 위해 `EnemySpawn.cs`에 `public double _mwStk;`를 손으로 넣었다. 웹에서 `e._mwStk`는 `mkEn`이 만들지 않고 `_maliceWeakMul`(`const st=e._mwStk\|\|0 … e._mwStk=n`)이 처음 맞을 때 생긴다 = 생성 직후 `undefined`. oracle 규칙은 "웹에 없는 필드는 C#에서 null"이라 non-null `double`(0)은 모든 케이스에서 실패한다. 게다가 `EnemySpawn.cs`는 `gen-cs.cjs`가 만드는 "do not edit by hand" 파일이라 재생성하면 이 필드가 사라져 B03b가 깨진다. | `EnemySpawn.cs`에서 제거 → 손으로 쓰는 partial `EnemySpawn.Tick.cs`의 "웹이 나중에 만드는 필드" 목록(`double?`)으로 이동. `Simulation.Fireball.cs`는 `w._mwStk ?? 0`(웹 `\|\|0`과 같은 뜻). Core 한 커밋 dc54a1d0f. |

- oracle 추출 오류·웹 난수/순서 차이는 없었다. 531건 전부 같은 필드 하나(수동 `.fails.txt`로 확인: 고유 패턴 1개). 검사 수가 531 줄어든 것은 실패 한 건당 검사 한 건이 따로 셌기 때문(`205,123 → 204,592`).
- 이식 정확성은 그대로다: 같은 oracle이 다른 필드 전부·난수 소비 횟수·`canMv` 호출을 비트 단위로 대조해 통과했다. 악의 약화 스택의 동작도 skill-sim-test 67/0이 확인한다.
- 도구 개선: `enemy-spawn-oracle/Program.cs`가 영수증엔 처음 80건만 남기던 것을 `<영수증>.fails.txt`에 전부 남기게 했다(이번 같은 묶음 분석용).

## 2. stage-flow 1건

| 유형 | 건수 | 구분 | 원인 | 조치 |
|---|---|---|---|---|
| `extension: non-boss etype 77 still throws` | 1 | **낡은 기대(oracle 쪽 테스트)** | C07 시절 `Simulation.HurtEnemy`가 etype 0 외에는 `NotSupportedException`을 던졌다. C01 wire(8fec34897 "etype0 한정 예외 제거")가 hurtE를 모든 etype용 Core 호출로 바꾸며 가드가 사라졌는데 이 검사는 그대로였다. 던지지 않는 것이 현재 정답. | 기대를 "etype 77도 피해를 받는다(가드 없음)"로 갱신. 같은 검사의 앞 줄(`IsBoss` etype 77이 피해를 받음)은 그대로. |
- 같은 폴더에 `StageFlowTests.csproj`가 `.gitignore(*.csproj)` 때문에 저장소에 없어 클론에서는 이 oracle을 돌릴 수 없었다 → `git add -f`로 추가.

## 3. 같이 발견한 빌드 결함

테스트·oracle csproj 18개가 Core를 `Core/*.cs`(비재귀)로 모았는데 B03 이후 `Core/Skills/` 하위 폴더가 생겨 `Simulation` partial·`SkillRules`가 빠졌다 → enemy-ai-oracle 등이 `Exoduser.UnityPort.Core.Skills` 오류로 빌드 실패(A18 때 `FirstPracticeCombat.cs`가 `FireZone`을 쓰면서 enemy-ai-oracle이 눈에 띔). 모두 `Core/**/*.cs`로 바꿨다(툴링만, 동작 변경 없음). 커밋 671d562a8.

## 4. 회귀 결과 (이 브랜치, 비-Unity .NET 도구)

| 도구 | 결과 |
|---|---|
| enemy-spawn-oracle | 204,592 / 0 |
| stage-flow-oracle | 7,076 / 0 |
| dash-parry-oracle | 187,165 / 0 |
| enemy-pool-oracle | 26,271 / 0 |
| enemy-ai-oracle | 2,323,428 / 0 (692 시나리오) |
| enemy-tick-oracle | 3,253,978 / 0 |
| enemy-hurt-oracle | 688,490 / 0 |
| c01-field-oracle | 448 / 0 |
| region-oracle | 198,306 / 0 |
| region-test(ch1_map) | 55 / 0 |
| start-mobs-test(ch1_map) | 24 / 0 |
| player-hurt-oracle | 47,559 / 0 |
| damage-parity-oracle | 실패 0 |
| weapon-xbow-oracle | 108,780 / 0 |
| ki-slash-oracle | 93 / 0 |
| skill-sim-test | 67 / 0 |
| m1-check | 아래(창 모드) |
