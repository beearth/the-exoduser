# O-1 처치 꼬리 oracle — CX-04c1 병합 + CX-04c2 + Simulation 연결 (2026-10-28)

- 배정: 유니티 총괄 → unity-core-oracle-opus. 근거: `docs/engine/UNITY_ORACLE_COVERAGE_AUDIT_20261028.md`(main 18a5fbf02)의 G1·O-1.
- 브랜치: `claude/unity-pc-o1-killtail-20261028`(기준 origin/unity/main 781a59198). CX-04c1(c01 브랜치 6496a5660)은 merge로 가져왔다(732ec59ca, rebase 없음).
- 웹 기준: origin/main **5286c0464** `game.html`(sha256 `6f9253d9…3dfe01`, 65,958줄). `hurtE` 사망부 = 42701~43322(앞 42701~42951 / 뒤 42952~43322).
- 범위: 표준 .NET 8 oracle·하니스 결과. **Unity 빌드와 Unity 런타임 스모크(ReviveSmoke·AutoPotionSmoke·m1-check)는 실행하지 않았다**(메모리 조건 미충족, 총괄 지시).

## 1. 결과

| 검사 | 결과 |
|---|---|
| enemy-hurt-oracle (H1·H2·CH·H3·CH3 + **H4·CH4**) | **4,968케이스 5,755,060 / 0** |
| └ H4 뒷부분 단독 900케이스 | 1,134,027 / 0 |
| └ CH4 함수 전체 체인(H1→H2→H3a→H3b) 202케이스 | 309,621 / 0 |
| 변이 검사(DeathTail 10 + Head·DeathHead 3) | 13개 중 12개 검출. 남은 1개 = 리터럴 키 순서 교환(동치) |
| kill-wire-test (새 하니스: Simulation 연결) | 28 / 0 |
| start-mobs-test | 24 / 0 |
| region-test | 55 / 0 (한 줄 수정, §3-7) |
| region-oracle | 204,151 / 0 |
| enemy-spawn / tick / ai / pool / tables | 204,592 / 3,253,978 / 2,323,428 / 26,271 / 2,784, 전부 0 |
| dash-parry · parry-reflect · player-hurt | 187,165 · 48,708 · 47,559, 전부 0 |
| druid-boss-oracle (48 cases) · druid-remodel-test | 5,421,635 / 0 · 41,195 + 105 / 0 |
| stage-flow · c01-field · damage-parity · ki-slash · skill · weapon-xbow · auto-potion · drop | 7,076 · 448 · 18,354 · 93 · 8,416 · 108,780 · 2,438 · 5,900, 전부 0 |
| shield-revive · rage-malice (5286c0464 재export) | 34,821 · 12,765, 전부 0 |
| skill-sim-test · CoreTests · parry-reflect-test · first-practice | 67 · 35 · 26 · 88, 전부 0 |
| roll-oracle · save-oracle | **실행 불가(기존 결함, §5)** — 원본 unity/main에서도 같다 |

## 2. 바뀐 것

| 파일 | 내용 |
|---|---|
| `Core/EnemyHurt.DeathTail.cs` (신규) | `EnemyHurt.DeathTail` = 42952~43322 손 이식. 잔해·킬 체인 균열·M26·폭독혈·etype 사망 효과(1~7장)·속성 사망 장판·레어몹 보상·엘리트 모드(M07/M08/M10/M20)·슬라임·악의·물약·콤보 보너스·rollDrop·경험치·checkRooms·10킬 자동저장 |
| `Core/EnemyHurtContext.Tail.cs` (신규) | `JsObj`(웹 객체 리터럴: 키 순서·undefined 키 보존), `EnemyPotDef`, 뒷부분 전역·주입 함수 |
| `Core/EnemyHurt.cs` | 치명타 전용음(웹 780ac692b): `!isDot&&!noSound&&_critSfxCd<=0`이면 `_critSfxCd=12` + `playSample('crit_heavy',.45,_r(1,.05))` — **난수 1개 추가** |
| `Core/EnemyHurt.Death.cs` | STY-12 보스 마지막 사망 대사 `_bossLine('die'+stage)`(최신 원본은 스테이지 제한 없음, 등록된 대사 키 표시; 과거 si1~3 범위는 해제) · `_druidSinkStart`의 침강음(난수 1개)·`G._druidFled`·`_bossLine('sink0')`(웹 2c3c380ec·05d519db7) |
| `Core/EnemyHurtContext.cs`·`EnemySpawn.Hurt.cs`·`EnemyTickContext.cs` | `P._freezeSlow`·`P.r` / `_plagued`·`_plagueLv`·`_isSlime`·`matDrop`·`_eatenItems`·`_twPartnerDead` / `EnemyRift.si`·`spawned`(nullable) |
| `Core/Simulation.Death.cs` (신규) | **연결**: `RunWebDeath` = 상태 → 웹 객체 복사 → `DeathHead` → (Continue면) `DeathTail` → 결과를 Simulation으로. 분열·동반부활 적 등록, 다른 적 버프 반영, 이벤트(`ReviveTextRaised`·`BossRevived`·`KillDropped`·`BossLineRaised`·`AutosaveRequested`) |
| `Core/Simulation.cs` | `KillEnemy` = 부활 판정을 끈 웹 사망부(리모델 마지막 목숨·하니스·실습). 손 조립 경로(처치→콤보→악의+4→물약→엘리트 악의→장비→경험치) 삭제. 피해 경로가 Body 결과를 넘기고 `_critSfxCd`를 프레임 사이에 유지. Tick에 `TickDeathFrameStart`(`_sfxFrameReset`)·`TickDeathFrameEnd`(킬 체인 타이머·지연 등록·처치 checkRooms) 각 1줄 |
| `Core/Simulation.Revive.cs` | `OnEnemyZeroHp` → `RunWebDeath`(리모델 목숨 우선은 유지). `ReviveRules.OnZeroHp`/`SinkOnDeath`는 이 경로에서 빠짐(코드·shield-revive-oracle은 유지, `TickCorpse`는 그대로 사용) |
| `Tools/enemy-hurt-oracle/*` | export H3b·H4·CH4, VM 스텁, 재귀 리터럴 기록, Program 대조(H4·CH4·G4·JsObj), csproj, RED 스텁, README, oracle.json(5286c0464) |
| `Tools/kill-wire-test/` (신규) | Simulation 연결 확인 28검사 |
| `Tools/region-test/Program.cs` | 봉인 문구 시나리오 앞에 판정 위상 맞춤 1줄 |

## 3. 웹과 달랐던 점 (Unity 손 조립 경로 기준, 이번에 웹대로 맞춤)

1. **난수 소비 순서·개수**: 이전 Unity는 사망 때 머리부분의 고어 난수(처치마다 2~3개)를 쓰지 않았다. 뒷부분의 엘리트 잔해 판정(엘리트 1개), 속성 몹 사망 장판 20% 판정(비엘리트 원소 몹 1개), 엘리트·보스 악의 트레일 입자(4개), 치명타음 피치(웹 780ac692b 뒤, 12프레임마다 최대 1개)도 쓰지 않았다. 보스 즉시 부활의 피치(1개)·입자(72개) 난수는 `ReviveRules`도 쓰지 않았다. 이제 전부 웹 순서대로 소비한다.
2. **보상 순서**: Unity는 악의+4 → 물약 → 엘리트 악의 → 장비 → 경험치였다. 웹은 엘리트·보스 즉시 악의 → 물약 → +4 → 엘리트 추가 악의(난수 1) → rollDrop → 경험치다.
3. **보스 처치 물약**: Unity `ApplyKillDrop`은 보스 표시가 없어 일반 규칙(1개, 추가 판정 없음)을 썼다. 웹은 보스면 물약 2개 + 50% 추가 HP물약이다.
4. **etype 사망 효과가 없었다**. 1-1 해당: 화약병(8) 폭발, 분열사도(15) 2마리 분열, 빙판슬라임(25) 얼음 장판, 빙하골렘(28) 빙결파, **빙마(29, 1-1 문지기) 사망 시 8방향 탄 + 최종빙결**. 엘리트 모드 M07 회복·M08 분열·M10 대폭발·M20/M26 강화도 없었다.
5. **속성 사망 장판이 없었다**. 웹은 엘리트 100%, 일반 20% 확률로 독·화염·전기·빙결 장판을 남긴다(1-1 다안 육괴 = 독 속성).
6. **킬 체인 균열이 없었다**. 웹은 3초 안에 5킬이면 균열(`G.rifts`)을 만든다. 이제 카운터·타이머·균열 목록은 맞지만 **균열이 적을 부르는 update() 블록은 미이식**이다(§4).
7. **처치 때 `checkRooms()` 호출이 없었다**. 웹은 처치마다 바로 부르고, 이 호출도 30회 판정 카운터(`G._crT`)를 올린다. 그래서 관문 판정 시점이 앞당겨진다. Unity는 프레임의 정규 `Stage.Tick()` 직전에 처치 수만큼 실행한다(적 목록 순회 중 재진입 방지).
   - 같은 원인으로 봉인 문구(`_gameFrame%45` 조건)가 뜨는 위상도 웹처럼 바뀐다. region-test는 이전의 고정 위상에 기대고 있어 위상을 명시적으로 맞추는 1줄을 넣었다(웹 동작 변경 아님).
8. **comboMax·10킬 자동저장이 없었다**. `ComboMax`를 추가했고, 자동저장은 `AutosaveRequested` 이벤트로 낸다. 저장 소유자 연결은 아직 없다.
9. **fce195067 이식 뒤 웹 변경 3건**(§2의 EnemyHurt.cs·EnemyHurt.Death.cs)이 Core에 빠져 있었다. 감사 문서 G6(oracle 기준 판 낡음)의 실제 사례다.

## 4. 남은 것 (이번 범위 밖, 기록)

| 항목 | 지금 동작 | 필요한 작업 |
|---|---|---|
| 균열 생성·적 소환(update() 35880~ `G.rifts` 블록) | 균열은 목록에만 쌓이고 적을 부르지 않음 | 균열 update 이식 + oracle |
| 독·화염·전기 사망 장판(`poisonZone`), `_seaSlow`·`mine`·`bomb`, `eProjAt` 사망탄 | `Simulation.UnportedDeathShots`에 기록만 | 웹 투사체 루프의 poisonZone 틱 이식 |
| 필드 적 탄(빙마 8방향 등) | 드루이드 투사체 소유자가 있을 때만 발사, 없으면 `DroppedDeathShots`로 셈(기존 `SpawnFieldProjectile`과 같은 한계) | 필드 적 투사체 소유자 |
| 잔해(`debris`)·산소방울 줍기 | `UnportedWorldItems`에 기록만 | 줍기 이식 |
| holyPrison 장판·`_fromHole` | Unity에 소스가 없어 비어 있음 | 스킬·소환굴 쪽 연결 |
| `_hitSfxCd` | 피격마다 0부터 시작(기존 연결 그대로) — 웹은 프레임 사이 유지 | `_critSfxCd`처럼 유지 |
| Unity 빌드·런타임 스모크 | 미실행 | 메모리 조건(커밋 여유 20GB↑, 다른 Unity 없음) 충족 뒤 사후 검증 |

## 5. 같이 발견한 기존 결함 (원본 unity/main에서도 같음)

- `Tools/roll-oracle`: `RollTests.csproj`가 저장소에 없음(`*.csproj` gitignore) → 클론에서 실행 불가. stage-flow에서 고친 것과 같은 문제.
- `Tools/save-oracle`: `SimulationState.cs`의 `EnemySpawn` 참조를 csproj가 포함하지 않아 빌드 오류(CS0246).

## 6. 실행 방법

```powershell
git -C G:/exoduser show origin/main:game.html > <scratch>/game.html
node unity/Tools/enemy-hurt-oracle/export.cjs --source <scratch>/game.html --head <origin/main sha>
node unity/Tools/enemy-hurt-oracle/run.cjs --project <unity 폴더> --label green
dotnet build unity/Tools/kill-wire-test/KillWireTests.csproj -p:ExoduserProject=<unity 폴더>   # 실행: KillWireTests.dll [receipt.json]
```

## 7. R-B 병합 뒤 정리 (origin/unity/main c7b497131 merge = 89524e910)

| 항목 | 내용 |
|---|---|
| Tick 순서 | `TickDeathFrameStart`(프레임 시작, `_sfxFrameReset`) … `CapEnemies` → `TickFieldBosses` → `TickRegions` → `TickDeathFrameEnd`(분열·동반부활 등록 + 처치 때 checkRooms: 웹은 처치 순간에 불러 그 프레임의 정규 checkRooms보다 앞섬) → `Stage.Tick` → `TickSpawnHoles` → **`TickKillChain`**(킬 체인 타이머, 웹 35880 = 소환굴 업데이트 바로 뒤로 분리) |
| RegKill · 문지기 +10% | 처치 1회당 각 1회. `_regKill`은 DeathHead 안에서 웹 순서(atkTicketRelease → alive=false → kills++ → _stageKills++ → **_regKill** → _petOnKill)로, `Stage.OnGateGuardKilled`는 DeathHead 끝의 문지기 블록이 `G._gateGuardKilled`를 세운 직후 RunWebDeath에서 한 번. region-test 8번이 피격 처치 1회(처치 +1·지역 +1·GateGuardDefeated +1)와 죽은 문지기 재타격(추가 집계 0)을 확인 |
| 벽 끼임 사망 (EnemyTick 34625) | R-B의 `RegKill → KillEnemy(o)`를 웹대로 바꿈: `RollDrop → RollNormalEquipment`, `AddExp → AddExperience(e.exp||1)`, `RegKill → Kills++ · Alive=false · RegKill`. 웹 분기는 hurtE 사망부(콤보·악의·물약)를 타지 않는다. region-test 7번(R-B, 처치 0→1·지역 0→1) 통과 + 8번에서 악의·콤보 불변, addExp(1) → ~~(1/3) = 0 확인. 분기 자체는 Unity에서 아직 꺼져 있음(WallStuck 스텁) |
| 보스 대사 | unity/main의 `RemodelLine`(한 판에 한 번, `BossLineRaised`/`BossLineLog`)을 그대로 씀. O-1이 새로 만들었던 같은 이름의 이벤트는 삭제 |

회귀(merge 뒤, 31종, 전부 불일치 0): enemy-hurt 5,755,060 · fieldboss 302,271 · region-oracle 204,391 · region-test 117 · start-mobs 24 · kill-wire 28 · enemy-spawn 204,592 · tick 3,253,978 · ai 2,323,428 · pool 26,271 · tables 2,784 · dash-parry 187,165 · parry-reflect 48,708 · player-hurt 47,559 · druid-boss 5,421,635 · druid-remodel 97,830 + 124 · stage-flow 7,076 · c01 448 · damage-parity 18,354 · ki-slash 93 · skill 8,416 · xbow 108,780 · auto-potion 2,438 · drop 5,900 · shield-revive 34,821 · rage-malice 12,765 · skill-sim 67 · CoreTests 35 · parry-reflect-test 26 · first-practice 88. roll-oracle은 기존 결함(csproj 없음)으로 실행 불가.

## 8. m1-check 09b 진단 (10-28, 판정 불변·기록 추가 패치로 두 판 각 빌드 1회 + m1 1회)

O-1판(1332dcc96)은 m1 19/20(09b 가시덫 실패), 기준판(c7b497131, 새 detach worktree, o1-killtail Library를 robocopy /E /XJ로 복사)은 20/20. 산출: `I:\EXODUSER-Storage\qa\o1-killtail\diag-o1\`, `diag-base\` (빌드 receipt 출력 == 실행 exe 확인, 두 판 빌드 오류 0).

| 항목 | O-1판 | 기준판 |
|---|---|---|
| 09b 시작 물약 쿨다운 | 97297 | 97471 |
| 시작 물약 사용 수 | 0 | 0 |
| 시작 HP | 346.8 / 578 | 295.8 / 493 |
| 시작 악의 | 3065 | 3063 |
| 종료 물약 사용 수 | 0 (안 마심) | 0 (안 마심) |
| 처치 수 | 15 → 16 | 15 → 15 |
| 악의 변화 | −1 (이벤트 −5@틱0, +4@틱49) | −5 (이벤트 −5@틱0) |
| 처치 출처 | 가시덫 DOT가 A(etype0, 엘리트 0)를 49틱에 처치, 물약 뽑기 악의 0 | 처치 없음, A는 HP 246으로 생존 |

- 쿨다운 97k는 m1-check 73줄이 일부러 넣은 100000에서 줄어든 값이다(자동 물약 차단). 물약 가설은 빠진다.
- **① 갈린 원인**: 두 판의 무작위 흐름이 07 단계부터 다르다. O-1 사망 꼬리가 웹 순서대로 무작위 값을 뽑아서(물약 뽑기·rollDrop 등) 07 전리품 뽑기 2회 대 1회, 07b 접촉 시각 151 대 134틱, 07c 소환굴 적 73 대 63, 08 착용 장비(불꽃 허리띠 대 그림자 전투화), 09 경험치 6 대 9로 갈린다. 그래서 09b의 시작 상태(최대 HP 578 대 493, 무작위로 소환된 A)가 다르고, O-1판에서는 가시덫 DOT가 70틱 창 안(49틱)에 A를 죽였다. 처치 악의 규칙이 바뀐 것은 아니다. 두 판 모두 처치 1회에 +4를 준다(기준판 `KillEnemy` AddMalice(4), O-1 DeathTail `G.mats+=4`).
- **웹 근거**: `hurtE`(game.html 42308)에서 DOT도 `e.hp<=0`(42699) 사망 분기로 들어가고, 42699~43307 사이에 `isDot` 예외가 없어 DOT 처치도 모든 처치 기본 악의 `G.mats+=4`(43307)를 받는다. 가시덫 DOT는 25프레임마다 `hurtE(e,fz.dmg,…,{dot:true,shieldHit:true})`(37597·37649~37656).
- **oracle 범위**: enemy-hurt-oracle의 `CH4 … dot [HP forced low]` 11케이스가 DOT 처치의 사망 꼬리 전체(G.mats 포함)를 대조한다. rage-malice oracle(12,765)은 43307 공식 조각만 대조하고 DOT 경로 자체는 덮지 않는다.
- **③ 판정 = 테스트 기대값 수정, Core 수정 없음.** "70틱 뒤 악의가 정확히 −5"는 그 창 안에 처치가 없을 때만 맞는 값이었고, 기준판 통과도 무작위 흐름 덕이었다. 09b는 시전 프레임 직후 악의를 읽어 비용(5)을 확인하도록 고쳤다. 70틱 창의 처치 수는 메모에 같이 적는다. 물약 차단 같은 우회는 넣지 않았다.
- **후속 보강 후보(이번 병합 조건 아님)**: rage-malice oracle에 DOT 처치 경로(hurtE `{dot:true}` → 42699 사망 분기 → 43307 `G.mats+=4`)를 넣는다. 지금은 enemy-hurt-oracle CH4 dot 케이스만 이 경로를 대조한다.
- 승인(유니티 총괄 10-28): Core 수정 없이 09b 기대값만 고친다. 검증은 수정본 빌드 1회 + m1 1회.
- **병합 전 검증(완료 규칙 ①, 10-28 10:19~10:21)**: 09b 수정 eb6b0f46a에 origin/unity/main 26a11fd2f(RM-3)·4ceb18b51(M1 지역 HUD)를 차례로 merge(rebase 없음, 충돌 0) → cf266944a. `_pc_lock.json` 잠금 아래 빌드 1회(오류 0, 66초) + batchmode m1-check 1회 = **20/20**. 09b 메모 "malice 5, DOT, kills in window 1"(이번에도 창 안 DOT 처치가 있었고 비용 판정은 통과). Unity 빌드 영수증에는 커밋 필드가 없어, 검증 스크립트가 빌드 전후 HEAD 동일을 대조하고 영수증 옆 `build-commit.json`에 commit cf266944a·parents를 남겼다. 산출: `I:\EXODUSER-Storage\qa\o1-killtail\diag-o1fix\`.


## 2026-10-29 미리보기 통합 중 보스 부활 예외 수정

| 항목 | 확인·변경 |
|---|---|
| 실패 근거 | M1 `player-8628b9b7.log`에서 보스 사망 시 `RunWebDeath` NullReferenceException. 기존 kill-wire-test도 `Simulation.Death.cs:143`에서 동일 실패 |
| 원인 | `EnemyHurt.DeathHead`는 BossRevive·Decoy·Doppelganger 조기 반환 시 `null`을 돌려준다. 침강 위험요소 제거 분기가 반환값을 무조건 역참조했다 |
| 최소 수정 | `head != null`일 때만 `_sinkDruid`를 읽고 `Druid.ClearSinkHazards()`를 호출한다. 실제 침강 시 정리는 보존하고 부활 판정·난수·수치는 바꾸지 않는다 |
| 회귀 | 기존 `kill-wire-test` 수정 전 예외 재현 → 수정 후 **31검사 / 0실패**. 보스 즉시 부활·최종 침강·보상·사망 꼬리 연결 검사 포함 |
| 범위 | 미리보기 전용 브랜치. Unity 재빌드·최종 M1 결과는 `UNITY_PC_PREVIEW_ALL_20261029.md`에서 갱신한다 |

증거: `I:/EXODUSER-Storage/unity-preview/resume-brief2/kill-wire-red.log`, `kill-wire-green.log/json`.


## 2026-10-31 최신 원본의 보스 사망 대사 범위 후속

현행 변경·원본 수치·검수 및 미완료 게이트는 [게임 동작 웹 대조](UNITY_GAMEPLAY_PARITY_20261031.md)를 따른다. 과거 검수 수치는 이번 Player·전체 스킬 완료 근거로 소급하지 않는다.
