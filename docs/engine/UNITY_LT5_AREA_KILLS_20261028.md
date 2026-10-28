# LT-5 지역 처치 분자 > 분모 (2026-10-28, unity-core-oracle)

> 결함: unity-latest 4ceb18b51 1-1 오른쪽 위 목표 패널 "지역 처치 17 / 14", "18 / 14" (최신버전 테스트 보드 LT-5).
> 브랜치 `claude/unity-pc-lt5-areakills-20261028` (기준 origin/unity/main efae9aa11).

## 1. 판정

| 질문 | 답 |
|---|---|
| Core 지역 집계(RegKill·지역 판정)인가 | 아니다. `RegKill`·지역 판정·클리어는 region-oracle 원본 대조 0 불일치 그대로 |
| HUD 표시인가 | **그렇다 (주 원인).** `NativeGame.cs` 목표 패널이 분자 `Simulation.Kills`(= 웹 `G.kills`, 판 전체 누적), 분모 `Stage.TotalSpawned`(스테이지 총량)를 넣었다 |
| 같이 찾은 Core 결함 | `StageFlow.StageKills`가 `sim.Kills + SurvivorKills`였다. 웹 `G._stageKills`는 `initStage`(31714) 안 31750에서 0이 되고 `G.kills`는 세이브를 따라 이어진다. 그래서 세이브를 불러온 판·두 번째 스테이지부터 이전 처치가 스테이지 처치로 섞였다(지역 없는 맵의 80 % 개방 판정에도 쓰이는 값) |

웹 원문 (game.html 60584~60586):

```
// [REGION] '지역 처치' = 현재 지역 처치/총량 (지역 없는 맵은 스테이지 전체 폴백). 클리어 지역은 총량으로 캡 표기
const _regCur=(G._regions&&G._regCurIdx>=0)?G._regions[G._regCurIdx]:null;
const _killTotal=_regCur?_regCur.total:(G._totalSpawned||0);const _stageK=_regCur?Math.min(_regCur.kills,_regCur.total):(G._stageKills||0);
```

지역 처치가 총량을 넘는 이유: 시작 적(문지기·호위·다안 육괴)은 태어난 지역의 처치로 들어가지만(`_regKill`은 태어난 자리 기준) 지역 총량은 소환굴 수만 센다. 웹은 `Math.min`으로 표기만 캡한다.

## 2. 바뀐 것

| 파일 | 내용 |
|---|---|
| `Runtime/Core/Simulation.Regions.cs` | `AreaKills(regCurIdx, out kills, out total)` 추가 — 웹 60585~60586 그대로 (현재 지역 `min(kills,total)/total`, 없으면 `G._stageKills / G._totalSpawned`) |
| `Runtime/Core/StageFlow.cs` | `StageKills = sim.Kills - killsAtFieldStart + SurvivorKills`, `killsAtFieldStart`는 `InitializeField`(Unity의 initStage 지점, 세이브가 Kills를 복원한 뒤 `StageFlowAttach`에서 불림)에서 잡는다. 웹의 처치 자리 8곳(34557·34623·37623·39872·40231·40620·42702·42901)은 모두 `G.kills++`와 `G._stageKills++`를 같이 올리므로 차이로 계산해도 같다 |
| `Runtime/NativeRegionHud.cs` | `CurIdx` 공개 (웹 `G._regCurIdx`는 Unity에서 지역 HUD가 들고 있음) |
| `Runtime/NativeGame.cs` | 목표 패널 `areaKills/areaTotal` ← `Simulation.AreaKills(regionHud.CurIdx, …)`. 스테이지가 있는데 총량 0이면 이전에는 "미이식", 이제 웹처럼 `0` |
| `Tools/region-oracle` | 새 섹션 `hudKills` 400케이스: 웹 60585~60586 두 줄을 그대로 VM에서 돌려(지역 유무·현재 지역 -1~3·kills>total·`_stageKills`/`_totalSpawned` undefined 포함) `AreaKills`와 대조 |
| `Tools/region-test` | 9번 블록 5검사: 실제 1-1 맵에서 북동 63/60 → `60 / 60`, 현재 지역 없음 → 스테이지 전체, 세이브 복원 G.kills 120 뒤 initStage → 스테이지 처치 0, 처치 3 → 3 (G.kills 123) |

## 3. 검증

| 항목 | 결과 |
|---|---|
| region-oracle | 204,791 / 0 (기존 204,391 + hudKills 400). 기존 5섹션 결과는 재추출 전후 동일 |
| 변이 | `Math.min` 캡 제거 → hudKills 98건 실패, 지역 없음 분기 변경 → 145건 실패 |
| region-test | 122 / 0 (기존 117 + 5) |
| .NET 회귀 31종 | 전부 0 (`I:\EXODUSER-Storage\qa\lt5\regress-1\summary.json` + `regress-1b`) |
| Unity 빌드 + m1-check | §5에 기록 |

## 4. 같이 고친 oracle 결함 (유니티 총괄 배정 2번)

| 도구 | 원인 | 수정 | 결과 |
|---|---|---|---|
| roll-oracle | `unity/.gitignore`가 `*.csproj`를 막고 허용 목록에 `RollTests.csproj`가 없어 한 번도 커밋되지 않음 | `RollTests.csproj` 작성(Core 전체 포함) + 허용 목록 추가 | 88,140 / 0 (커밋 13afecf09 기록과 같은 수) |
| drop-oracle | `DropTests.csproj`에만 `ExoduserProject` 기본값 줄이 없어, README처럼 `-p:ExoduserProject`를 빠뜨리면 Core가 통째로 빠져 CS0246 | 다른 csproj와 같은 기본값 줄 추가 | 5,900 / 0 |
| feedback-oracle "shared cast pitch consumes RNG" | 시험이 적 생성의 옛 뽑기 횟수·순서를 하드코딩(시전 2 + 적 5 = 7, 속도에 세 번째 값). 적 생성이 웹대로 9회로 바뀐 뒤 깨짐. 시전 2회는 웹과 같다(`_r(1,.05)` + `playSample`의 `0.92+Math.random()*0.16`, game.html 12515~12525·12621, oracle `casts[].randomCalls` 2) | 시전 횟수 = oracle `randomCalls`, 적 = 같은 흐름을 시전 횟수만큼 민 결과와 같음(etype·속도·HP)으로 대조. 적 생성 자체는 enemy-spawn·c01 oracle 몫 | 26 / 0 |
| save-oracle (O-1 §5에 적었던 것) | csproj가 Core 파일을 낱개로 넣어 `SimulationState.cs`의 `EnemySpawn`이 빠짐 → CS0246 | Core 전체 포함 | 빌드 오류 0. **실행 중 NullReference는 남음** — §6 |

shield-revive·rage-malice·save의 `oracle.json`은 저장소에 없고(앞 둘은 .gitignore, rage는 untracked) 새 worktree에서는 `export.cjs`를 먼저 돌려야 한다.

## 5. Unity 빌드 검증

| 항목 | 결과 |
|---|---|
| 병합 전 기준 | origin/unity/main 4a22a22af → 06b86008c(DT-01·02·03, QaRunPolicy, NativeQaSandbox fail-closed 37f1360df)를 차례로 merge, 충돌 0 → 6ee479b6a |
| 빌드 | 공용 실행기 `exo-unity.ps1 run -Method PortVerification.Build`(잠금·샌드박스), 오류 0, 빌드 전후 HEAD 동일 |
| m1-check | `exo-unity.ps1 player -AllowPlayer`(batchmode·GPU AMD RX 9070 XT·무음·창 0·사용자 세이브 변경 0) **21/21** |
| 화면 실측 | **미확인.** 무창 실행(headless RenderTexture)은 OnGUI를 그리지 않아(`guiRepaints 0`) 목표 패널이 캡처에 없다. `--unity-region-hud-capture`도 창 화면 캡처라 무창 규칙에서 못 쓴다. 숫자 표기는 통합 빌드에서 최신버전 테스트로 확인 필요 |
| .NET 회귀(merge 뒤) | 31종 0. merge로 들어온 `Core/Platform/QaRunPolicy.cs`를 fieldboss-oracle csproj(Core/*.cs만 포함)가 못 찾아 깨진 것을 고침(302,271/0). settings-persistence도 QaRunPolicy와 원래 빠져 있던 NativeOptionSet을 넣어 write 3·read 2 PASS |

실행기 결함: `exo-unity.ps1 build -Args '-output,…,-receipt,…'`는 build가 `-buildTarget Win64`를 먼저 붙여 -File 모드 쉼표 분리가 안 된다(-output 빈 값 → PortVerification.cs:232 ArgumentException). `run -Method PortVerification.Build -Args '-buildTarget,Win64,-output,…'`로 우회.

## 6. 후속 후보 (이번 범위 밖)

- `CombatSaveCodec.Encode`: 모델의 `Skills`/`SkillSlots`가 null이고 원본 저장(Raw)에도 그 키가 없으면 `root.Set(key, null)` → `SaveJson.Write` NullReference (save-oracle encode 첫 케이스). `ultSlot`·`activeCtSk`는 같은 경우를 처리한다. 실제 게임은 Skills를 늘 채워서 안 걸리는 것으로 보이나 웹 출력(새 저장의 `skills`) 기준 판정이 필요하다.
- rage-malice oracle에 DOT 처치 경로 추가 (O-1 §8).
