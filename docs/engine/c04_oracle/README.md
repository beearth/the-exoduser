# C04-ORACLE — 1-1 웹 정답 데이터와 대조 스크립트 (2026-10-27)

맵 보드 §2.0 C04-1(START→EXIT 도달)·C04-2(막힘 일치)·C04-4(스폰 위치/수)의 **웹 기준값**과, Unity 결과를 넣으면 차이를 뽑아 주는 스크립트다. Unity 구현은 포함하지 않는다. 판정은 맵 총괄.

- 정본 배정: `E:/exoduser-wt/_out/c04-oracle/SPEC.md`(맵 총괄) · 맵 보드 `origin/main:docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md` §2.0
- 브랜치: `claude/unity-pc-c04-oracle-20261027` (시작점 `origin/unity/main`). 쓰는 경로는 `tools/c04-oracle/`, `docs/engine/c04_oracle/` 둘뿐.

## 1. 한눈에 (웹 1-1 = `G.stage===0`, FIXED_MAPS[0] "1장 1층 썩은숲", 200×200, T=40)

| 항목 | 웹 값 |
|---|---|
| 걷기 타일 / 막힘 타일 | **19,538 / 20,462** (`isW(타일중심, skipBone)` 기준) |
| 부분 막힘 타일(타일 내부 ±10px 4점이 중심과 다른 판정) | **286** |
| START 타일 | **(100,185)** (px 4020,7420). 시작 방 `s` 중심과 같음 |
| EXIT(출구) 타일 `G.exits`, map값 2 | **(99,7) (100,7) (101,7)** — 모두 START에서 4방향 BFS 도달, 거리 193·194·195 |
| 보스 게이트 타일(`G.bossGate`) | (99,5) (100,5) (101,5) — `boss_gate_col` 충돌 오브젝트(`_gateY=5`)로 **막힘**, BFS 미도달 (웹 정상 상태) |
| START에서 BFS 도달 | **19,538 = 걷기 타일 전부**, 도달 불가인데 걷기 가능한 섬 **0** |
| 소환굴(런타임 `G.spawnHoles`) | **14개**, 5회 실행 모두 같은 위치. 막힌 칸 위 **0** |
| `initStage(0)` 직후 적(`ens`) | **14~18마리**(5회: 16·14·16·18·15), 막힌 칸 위 **0**. 고정 3마리 + 보스방 호위 무작위 |
| 5회 실행 결정성 | 타일맵 해시·걷기 격자·부분막힘·소환굴 위치·출구·START 모두 동일 |

## 2. 파일

| 파일 | 내용 |
|---|---|
| `ch1_1_walk.json` | `rows[ty]` = 200글자 문자열(`0` 걷기 / `1` 막힘, 타일 중심 `isW`). `partial.tiles` = `[tx,ty,중심막힘,모서리마스크]`(bit0 (-,-) bit1 (+,-) bit2 (-,+) bit3 (+,+) 가 중심과 다름). `mapObjs` = 1-1의 `MAP_OBJS` 37개(충돌 오브젝트 20개), `hill` = 언덕 띠 상수 |
| `ch1_1_rooms.json` | `templateRooms`(= `FIXED_MAPS[0].rooms` 그대로: id·type·cx·cy·shape·rx·ry·spawns·pillars), `runtimeRooms`(`G.rooms` 사각형 x·y·w·h, 인덱스 0~5), START·EXIT·보스 게이트 좌표, `features`(alcove 3) |
| `ch1_1_reach.json` | START·EXIT 도달 정보(`exits[].reached/dist`), `bossGateTiles`, 걷기/막힘/도달 수, `islands`(0개), `reached` = 도달 타일 `[tx,ty]` 전체 목록 |
| `ch1_1_spawns.json` | `holesRuntime`(14), `holesDefinition`(rooms[].spawns 7 + tmpl.spawnHoles 9 + corridorSpawns 2 = 18개 정의와 가장 가까운 런타임 굴 거리), `enemies.perRun`(5회 전체), `enemies.fixedAcrossAllRuns`(3), `roomCountRange`, `bossRoomEtypeSets`, `blocked` |
| `ch1_1_collision.png` | 800×800, 1타일=4px. 어두운 회색=막힘 / 초록=걷기·BFS 도달 / 주황·황토=부분 막힘 / 보라=도달 불가 걷기(없음) / 하늘 선=방 사각형·타원 / 노랑 점=소환굴 / 주황 점=적 / 파랑=START / 흰·연노랑=EXIT·게이트 |
| `source_receipt.json` | main SHA, game.html·maps_data.js SHA-256(커밋본·디스크 둘 다), 사용 함수와 줄 번호, 부팅 순서, 결정성 점검 결과, 추출 시각 |

## 3. 어떻게 뽑았나

`node tools/c04-oracle/extract.mjs [--runs 5] [--ref origin/main] [--main-repo G:/exoduser] [--out docs/engine/c04_oracle]`

1. `origin/main`의 **커밋된** `game.html`·`maps_data.js` blob을 Playwright route로 요청에 끼워 넣는다(main 체크아웃 디스크의 game.html에 다른 세션 미커밋 수정이 있었기 때문 — `source_receipt.json`의 `diskDiffersFromCommitted`가 `true`). 서버(3333)는 정적 파일 서빙에만 쓰고 건드리지 않는다.
2. headless Chrome(`--mute-audio`)으로 열고 `G._cutsceneDone=true; if(!P)P=mkP(); G.stage=0; initStage(0)` 로 1-1 생성이 끝난 상태를 만든다. 로비·캐릭터 선택은 거치지 않는다.
3. 같은 부팅을 **새 페이지로 5번** 반복해 결정성을 확인한다. 걷기 판정은 실제 게임 함수 `isW(px,py,true)`를 그대로 호출한다(`skipBone=true`: 뼈벽 등 스킬 산물 제외). 정적 파싱이 아니다.
4. BFS는 타일 중심 판정 기준 4방향(상하좌우)이다. 플레이어 반지름(`canMv`)·대각 이동은 반영하지 않는다.

## 4. 웹 측 특이점 (Unity가 놓치기 쉬운 것)

- **걷기 = `G.map` + 언덕 띠 + 충돌 오브젝트.** `G.map[ty][tx]===1`만 보면 안 된다. 1-1은 우측 제단 언덕 띠 `_CH1_HILL`(cx147 cy98 rx18 ry9, 타원 정규거리 0.84~1.04 구간이 막힘, 서쪽 램프 tx125~135·ty98±1.8~3은 열림)가 막힘을 더하고(`_ch1HillBandBlocks`, `_FDG_RUINED_FOREST_FIRST`가 켜지면 꺼짐 — 이 추출은 꺼져 있지 않은 기본 상태), `MAP_OBJS` 중 `_OBJ_META[type].collision/col`을 가진 오브젝트(1-1에서 20개: 제단·캠프·고치·연못·큰 나무·독 웅덩이·뼈 아치 등, 일부는 `colParts` 회전 사각형)가 더한다.
- **부분 막힘 286타일.** 타일 중심은 걷기인데 모서리가 막혔거나 그 반대인 타일이다(오브젝트·언덕 띠 경계). 대조 보고서는 걷기 차이가 이 타일 위에 있는지를 따로 센다(`onWebPartial`) — 경계 판정 차이는 곧 오류가 아니라 정책 차이일 수 있다.
- **EXIT는 보스방 북쪽 끝(y=7)에 있고, 그 앞 보스 게이트(y=5)는 `boss_gate_col`로 막혀 있다.** C04-1의 "EXIT 도달"은 `G.exits`(map값 2) 타일 3개 도달이다. 게이트 3타일은 웹 정상 상태에서도 BFS 미도달이다 — Unity가 게이트를 열어 둔 채 덤프하면 "Unity만 도달"로 잡히는 것이 정상일 수 있으니 클리어/게이트 규칙(C04-3)과 같이 본다.
- **소환굴 14개가 위치 정답, 적은 일부 무작위.** `initStage(0)` 직후 적 = 고정 3마리(etype4 (87,167), etype4 (113,164), etype29 (100,8), 보스방 중앙) + 보스방 호위 11~15마리(etype 종류·좌표 무작위, 방 rect 5 안, 방별 범위 12~16). 나머지 몬스터는 소환굴이 타이머(600프레임대)로 이후 낸다 — 이 추출은 그 시점을 다루지 않는다. 소환굴 `room` 필드는 원본이 1/-1로만 채운다(실제 방은 `geomRoom`).
- 정의 18개(rooms[].spawns 7 + tmpl.spawnHoles 9 + corridorSpawns 2)가 런타임 14개가 되는 이유는 500px 이내 중복 제거·상한 때문이다. 정의→런타임 대응과 거리는 `holesDefinition[].nearestRuntimeHole`에 있다(예: r1 두 번째 굴 (106,155)는 런타임 (94,155)와 12타일 차이 — 정의 좌표 그대로 심지 않는다).
- 위 스폰 값은 `G.stage===0` 첫 생성 기준이다. 보스방 호위는 매번 달라서 Unity는 "범위 안인가"로 비교한다.

## 5. Unity 덤프 형식 (Codex가 이대로 JSON을 쓴다)

```json
{
  "walk": [[0,1,...200개], ... 200행],
  "start": [100, 185],
  "exit": [[99,7],[100,7],[101,7]],
  "spawns": [
    { "room": 5, "tx": 100, "ty": 25, "grade": 0 },
    { "room": 5, "tx": 100, "ty": 8, "etype": 29, "grade": 0 }
  ]
}
```

- `walk`: 200×200, `0`=걷기 `1`=막힘. 타일 `(tx,ty)`의 **중심**(px = tx*40+20, ty*40+20)에서 Unity의 걷기 판정을 찍는다. 행 배열의 배열 / 행 문자열 배열 / 길이 40000 평탄 배열 중 아무거나 받는다. 좌표는 웹과 같다: tx 오른쪽, ty 아래쪽(Unity 월드 z 방향을 뒤집지 말고 타일 인덱스로 변환해서 넣는다).
- `start`: Unity에서 플레이어가 생성되는 타일. `exit`: Unity의 출구 타일(1개 `[x,y]` 또는 목록).
- `spawns`: `etype`이 숫자(≥0)이면 **적**, 없거나 -1이면 **소환굴**. `tx,ty`는 타일, `room`은 참고용(대조는 좌표로 방을 정한다), `grade`는 참고.
- 덤프 시점: 1-1 생성이 끝난 직후, 플레이어 조작·스킬 산물(뼈벽 등) 없는 상태.

## 6. 대조 실행

```bash
node tools/c04-oracle/compare.mjs <unity_dump.json> [--out <보고서 폴더>] [--tol 2] [--max-list 2000]
```

- 출력: `<입력이름>.compare.json`(전체) + `<입력이름>.compare.md`(짧은 표). 종료코드 0 = 모든 항목 차이 0, 1 = 차이 있음.
- 비교 항목: ① 걷기 차이 — 웹 걷기→Unity 막힘, 웹 막힘→Unity 걷기 타일 목록(웹 부분막힘 타일 위 차이는 따로 셈) ② START에서 각자 4방향 BFS 한 도달 집합 차이 ③ EXIT 도달 여부·출구 타일 일치 ④ 소환굴 14개 위치(허용 `--tol` 타일, 기본 2) 누락/초과 ⑤ 고정 적 3마리(etype 일치 + 허용 타일) ⑥ 적 총수(14~18)·방별 수 범위 ⑦ 막힌 칸 위 스폰 수(웹 기준 0).
- **차이 0이면 해당 조건 통과 후보**다. 최종 판정은 맵 총괄.

### 자기 시험 (`node tools/c04-oracle/selftest.mjs`, 2026-10-27 1회 실행, 전부 통과)

1. 웹 oracle을 Unity 형식으로 바꿔 넣음 → 모든 항목 PASS(차이 0).
2. 열린 곳 걷기 타일 하나(90,3)를 막힘으로 → 걷기 차이 정확히 1개(그 타일), 도달 차이도 그 타일 하나, 스폰 항목 영향 없음.
3. 막힘 타일 하나(86,3)를 걷기로 → 걷기 차이 1개, Unity만 도달 1개.
4. 소환굴 하나를 5타일 옮김 → 누락 1 + 초과 1.
5. 출구 타일 3개를 막음 → EXIT 도달 FAIL.

## 7. 한계·후속

- 이 oracle은 `G.stage===0` 첫 생성 시점이다. 소환굴이 타이머로 내는 몬스터, 클리어 후 게이트 해제, 보스 아레나 좌표(C04-5)·3D 끔/켬 동일 경로(C04-6)는 범위 밖(C04-3·5·6은 이 단위 아님).
- BFS는 점 판정 4방향이다. 플레이어 반지름이 있는 실제 이동 가능성(좁은 통로)은 반영하지 않는다 — 필요하면 `canMv`(반지름) 기준 격자를 추가로 뽑을 수 있다.
- 추출 재실행은 서버 3333이 떠 있고 `origin/main`을 fetch한 뒤에 한다. 원본 game.html이 바뀌면 `source_receipt.json`의 SHA가 달라지므로 oracle을 다시 뽑는다.
