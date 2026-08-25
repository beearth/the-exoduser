# MAP RUNTIME ARCHITECTURE — EXODUSER: HELL LORD

> **역할**: 현재 game.html 맵 런타임의 실제 구조 감사. 이후 모든 구현 Task의 기술 SSOT.
> **상태**: 2026-08-23 초판. 코드 변경 없음. **모든 식별자/라인번호는 병렬 조사로 실측**. game.html은 타세션 상시 편집 → 라인번호는 ±수십 줄 드리프트 가능, 식별자 grep으로 재확인 권장.
> **NOT FOUND 원칙**: 존재하지 않는 것은 명시. 브리핑에 있었으나 코드에 없는 것: `FIXED_MAPS`(→maps_data.js), `StageSeeder`·`genMap`·`isSolid`·`isWall`·`canWalk`(전부 코드 부재, 실제 등가물 병기).

---

## 1. 맵 런타임 개요 (데이터 흐름)

```
maps_data.js:FIXED_MAPS[0]  ─┐
_MAP_COMPOSE[si] (14216)     ├→ _getFixedMapForStage(si) (24508)
kit builders (24417~24507)   ─┘        │
                                       ▼
                              genFromTemplate(tmpl,si) (24590)  ── 또는 fallback ──▶ genGauntlet(si) (23594)
                                       │  (all-wall→carve→tileRLE decode)
                                       ▼
                              G.map / G.mw / G.mh / G.rooms / G.exits / G.bossGate / G.spawnHoles  (commit 25039)
                                       │
                    ┌──────────────────┼───────────────────────┐
                    ▼                  ▼                        ▼
             buildMapCache()     initMapObjects()          spawn*(mkEn)
             (21496, →texture)   (20507, MAP_OBJS)         (25447~25821)
                    │
             stream? _shouldStreamMapCache (20289) → _streamChunks (20278+)
                    ▼
             draw() (43xxx) — 청크 합성 _streamVpCvs → 컬링 → 엔티티/VFX → ATMOS
```

---

## 2. 타일 & 월드 (Q1: 이동가능 영역은 무엇으로 결정되는가)

- **T=40** (`game.html:13682`). 타일당 40px.
- **G.map[ty][tx]** — 2D 배열, row-major(y 바깥). `genFromTemplate` 24592에서 **전부 벽(1)로 초기화 후 바닥을 깎아냄(carve)**.
- **셀 값 legend** (단일 legend 주석 없음, 사용처로 검증):
  | 값 | 의미 | 근거 |
  |---|---|---|
  | `1` | 벽(solid) — **유일한 solid** | isW `v===1` (25984) |
  | `0` | 바닥(carved) | RLE decode `v=(v===1)?0:1` (24637) |
  | `2` | 출구 타일 | `map[ty2][tx2]=2;exits.push` (23898/24025) |
  | `4` | 바닥(1×1 fallback 전용) | `G.map=[[4]]` (25846), `_floorAt` (20548) |
  | `6` | 포탈/존 타일 | write 25032, read 35582 |
- 에디터→게임 변환: `0=용암,1=바닥,2=벽,3=높은벽 → 게임 0=바닥,1=벽` (`24636`).
- **Q1 답**: 이동가능(walkable) = `isW(px,py)===false` = 타일값 ≠ 1 AND bone-wall 없음 AND 충돌 MAP_OBJS 없음.

---

## 3. Collision (Q3: isW 영향)

| 함수 | 라인 | 역할 |
|---|---|---|
| `isW(px,py,skipBone)` | 25984 | 핵심 벽 판정: OOB→solid, 타일===1→solid, `G._boneWalls` 링, 충돌메타 MAP_OBJS(`_colObjs`) |
| `canMv(x,y,r)` | 25985 | 4코너 AABB `isW` |
| `canMvBlink(x,y,r)` | 25988 | skipBone=1 |
| `_isWallTile(px,py)` | 25992 | **타일만** 판정(MAP_OBJS 무시) |
| `_canMvTile(x,y,r)` | 25993 | 4코너 `_isWallTile` (적 밀어내기) |
| `safePt(x,y,r)` | 25990 | 나선 탐색 최근접 walkable |
| `_pushOutWall(e)` | 25995 | 벽에서 엔티티 방출 |
| `_chgPathClear(e,len)` | 25987 | 돌진 경로 레이마치 |
- **isW 프리필터** `[ISW-OPT]` (25979): `_colObjs`는 충돌메타(`_OBJ_META[type].collision||col`) 가진 MAP_OBJS만 캐시, `_ensureColObjs`가 identity/length 변화 시에만 재빌드. 재빌드 시 인스턴스 `scale||1`을 `colW`/`colH`/`colSz`에 곱한 `_colW`/`_colH`/`_colSz`를 1회 저장하며 `isW()`는 저장값만 읽는다. **성능 핵심 — 손대면 회귀 위험.**
- **다각형/알파 콜라이더 없음.** 오브젝트 충돌 = 렌더 스케일이 반영된 원(colSz) 또는 타원(colW/colH/colOy)만.

---

## 4. 맵 오브젝트 데이터

| 식별자 | 라인 | 상태 | 필드 |
|---|---|---|---|
| `MAP_OBJS` | 14039 | 활성 | `{type,x,y,hell,...}` world px |
| `_CH_DECO` | 14070 | 활성(hell키) | `{id,file,sz,light?}` 데코 스프라이트 |
| `_OBJ_META` | ~14257전 | 활성 | 타입별 collision/col/colW/colH/colOy/colSz/sz |
| `SWAY_OBJECTS` | 20415 | **비활성**(20417 `=[];return`) | 흔들리는 초목 |
| `WALL_EYES` | 20440 | hell3 전용 | 벽 눈동자 |
| `GLOW_OBJECTS` | 20494 | **비활성** | — |
| `FIXED_MAPS` | (maps_data.js:6+) | 활성 | `FIXED_MAPS[0]` = CH1 골격 |
- `initMapObjects` (20507)이 MAP_OBJS/데코 채움. `_CH_DECO[hell]` 소비 20674.

---

## 5. 맵 생성

| 함수 | 라인 | 역할 |
|---|---|---|
| `genFromTemplate(tmpl,si)` | 24590 | **메인** 데이터 생성기. all-wall→carve rooms/corridors→tileRLE decode→commit(25039) |
| `genGauntlet(si)` | 23594 | 절차 fallback(fixed map 없을 때) |
| `_tCarveCircle/Ellipse/Rect/Cross/Corridor` | 23482~23516 | 타일 깎기 |
| `_cloneField11(si)` | 24417 | FIXED_MAPS[0] 클론 + `_MAP_COMPOSE[si]`로 tileRLE 재구성 |
| `_buildKitFieldOne` / `_buildKitFieldProd` | 24463 / 24485 | QA 플레이트(단일이미지 테스트맵) |
| `_getFixedMapForStage(si)` | 24508 | fixed 템플릿 or null |
| `genBossArena(si)` | 25059 | 별도 128×108 보스 아레나 |
| `buildMapCache()` | 21496 | **G.map을 텍스처로 렌더**(생성 아님) |
| `MAP_ALL_FLOOR` | 24589 | si0 전용, 내부 벽1→바닥0 (테두리만 벽) |
- **NOT FOUND**: `StageSeeder`, `genMap`. → AUTOLOOP "불변보호영역 StageSeeder"는 **코드에 부재**. 실제 시드/생성 = `genFromTemplate`/`genGauntlet`. **보호 의도는 이 두 생성기 + `_MAP_COMPOSE` 데이터로 해석해야 함.** (§13 위험변경)

---

## 6. 플레이어 스폰

- `initStage` (25840): start room(`type==='start'`||rooms[0])의 cx,cy → 벽이면 나선보정 → `P.x=(_spX+.5)*T` (25867). iframes=360.
- `_loadZone` 스폰 24560–24570 (iframes=90, 카메라 스냅).
- 보스 아레나 진입 25136.
- 시작방 안전: 500px 적 퍼지(25879), 봉불 배리어 `G._bonfire`(25910).

---

## 7. 적 스폰 (Q4: AI도 같은 경계 사용?)

| 함수 | 라인 | 역할 |
|---|---|---|
| `mkEn(x,y,si,etype,ib,el,room)` | 25447 | 적 팩토리. `safePt`로 벽 밖 재배치(25450), 무효 시 null |
| `spawnRoomEns(ri)` | 25712 | 방별 대량(리스폰 없음). start/boss방 제외 |
| `spawnCorridorEns(si)` | 25805 | 복도, 보스게이트 앞 20~29 강제 |
| `spawnTileRLEEns(si)` | 25781 | 오픈필드 밀도, 400px 시작안전 |
| `spawnFormation(cx,cy,si,el,ri)` | 25689 | 방패+원거리 군집 |
- **모든 스폰이 `canMv`/`safePt` 게이트** → 적은 PLAY(walkable) 안에만 생성. **Q4 답: 예, AI/스폰 모두 isW 경계 공유.** RIM/OUTER로 적 탈출 방지는 이 경계로 보장됨.
- **소환굴(progressive spawn)**: `G.spawnHoles=[{x,y,size,timer,alive,room}]`, 런타임 emit 29644–29694(2000px 근접트리거, ~15s 순차, 700캡). `SPAWN_HOLE` 25370.
- **필드 보스**(심연의 앵글러): `_fbTick`, **CH1-1 전용**, 2500px 진행 후 게이트(월드몹 변형 1500px). 등장=`spawnIn` 꿈틀 상승 54틱(본체 즉시 표시 없음). 커밋 `29e91d85` 정합.
- 적 하드캡 700 (`[ENS-CAP]` 28487), AI 컬링 ±300px(28577).

---

## 8. 보스 스폰 / 아레나 (Q9 관련)

- `findBoss()` 15379 → `G._bossRef`. 게이트 상태: `G.bossGate`(타일배열)/`bossGateOpen`/`bossSealed`/`_gateY`/`_bossCx/_bossCy`/`_bossUnlocked`/`_gateGuardKilled`.
- **게이트 개방**: `checkRooms` 35591 — `_stageKills/_totalSpawned + 0.10(가드보너스) >= 0.8` (80%). 추적스폰 0이면 즉시개방(소프트락 가드).
- **보스 로드 스테이트머신**: `_bossLoadPhase` 1=페이드아웃→`_enterBossArena()`(35514), 2=네임카드, 3=페이드인, 4=보스등장. 트리거 = 출구타일 밟기(`bossAlive && !_bossArena && _bossUnlocked`, 35606).
- `_enterBossArena()` 25111: `_preArenaBackup`로 던전 백업(25113) → 생존몹 kills 전환 → 풀 클리어 → `G.map=arena.map`(25130) → 보스 mkEn(ib=true, 25139) → 캐시 재빌드.
- **Q9(배경표현→실엔티티) 최저위험 경로**: `_preArenaBackup`/`_enterBossArena` 구조가 이미 "월드↔아레나 스왑"을 함. 배경표현은 **탐험 맵의 MAP_OBJS에 거대 실루엣 오브젝트(비충돌, OUTER 레이어)를 두고**, 아레나 진입 시 기존 `_enterBossArena`로 실 엔티티 스폰 → 신규 프레임워크 불필요. (`MAP_IMPLEMENTATION_ROADMAP.md PHASE 7`)

---

## 9. 미니맵 (Q5: 어떤 데이터를 쓰는가)

- `drawMM()` 51400–51446 (element `mm`, ctx `MX`).
- **읽는 데이터**: `G.map` 타일(캐시 `_mmCache`, `_mmTickBuild` 51315) + `G.spawnHoles`(51431) + `ens`(60캡, 30프레임 갱신) + 플레이어 `P.x/P.y/P.facing`.
- **읽지 않는 것**: `G.rooms`, `G.exits` (미니맵 렌더에서 미사용).
- 플레이어 마커 `_mmDrawPlayerMarker` 51366–51398 (초상 `_mmPortraitImgs`, 방향삼각형, 이중링). 20프레임 캐시.
- **보스/이벤트/게이트/존 마커 = NOT FOUND.** → **Q5 답 + 갭**: 미니맵은 타일+스폰홀+적+플레이어만. 세계 구조(상승통로/보스/사이드포켓) 가독성 마커 없음 → `MAP_IMPLEMENTATION_ROADMAP.md PHASE 6`에서 추가.

---

## 10. 전환 / 로딩 (Q6: 어느 단위로 로딩)

- **스테이지 단위 로딩.** 스테이지 로드 진입점(각각 `G.map=;G.exits=` 대입): genGauntlet 23985 / genFromTemplate 25039 / `_loadZone` 24532 / `_enterBossArena` 25130 / fallback 25846.
- `nextStage` = `showStageTransition(()=>nextStage())` (53750). 로드 커튼 `#stageTransition`(2869, rgba .80, fade .3s), `showStageTransition()` 53641(랜덤아트+로딩바 45%→100%).
- `_cacheExitCenter()` 15204: 출구 평균 → `_exitCX/_exitCY`.
- **Q6 답**: 로딩 단위 = 스테이지(200×200) 통째. 스테이지 내부는 스트리밍으로 무로딩.

---

## 11. 카메라 & 렌더 컬링 (Q7/Q8)

- 카메라: `VW/VH`(3856/3932), 팔로우 29730–29742(룩어헤드 `P.v*25`, 보스 중간점, boss zoom 0.80), `[CAM-CLAMP]` 29743–29746(**zoom-aware 맵경계 클램프 → 코너 void 노출 방지**), 렌더보간 52219–52228, 월드 transform 43532.
- 컬링: 적 AI ±300px(28577) / 적 draw pad 120~200px(44371) / 투사체 despawn 2500px(28771) / 타일 뷰포트 범위(43533) / 아이템 ±40~150px.
- **Q7(스테이지를 더 큰 seamless로 만들 때 병목)**:
  1. `buildMapCache` 텍스처 크기 — `_shouldStreamMapCache`(20289)가 ≥1000²타일/>texLimit/>64Mpx에서 스트리밍 전환. 200×200=8000²는 이미 스트리밍/타일캐시 처리됨.
  2. **적 하드캡 700**(28487) — 대형 존일수록 밀도 분산 튜닝 필요.
  3. `_streamVpCvs` 합성 비용 — 청크 퇴거 주기(60/180, margin4, 43605)와 재합성 임계(3타일 드리프트).
  4. MAP_OBJS/`_colObjs` 선형 순회 — 오브젝트 급증 시 isW 비용(프리필터가 완화하나 상한 있음).
- **Q8(OUTER 데코 증가 → draw/render)**: OUTER는 패럴랙스(비활성 9631/43539) 재활성 또는 Vista 경로 사용. 원경은 저해상도 캐시 캔버스 1~2장 drawImage로 억제 권장(엔티티당 draw 아님). 성능 봉인(평상시 140fps/700마리 60fps) 준수 — `MAP_QA_GATES.md Performance`.

---

## 12. 진행 / 클리어 조건 (Q10 관련)

- `G._stageKills`(리셋 25870) / `G._totalSpawned`(24987, 소환굴 용량합).
- 게이트 개방 80%(35598, +10% 가드), 스테이지 클리어 = **보스 처치 후 아레나 출구 도달**(35626, kill-all 아님), 타임어택 90%(35631).
- HUD `killCnt = _stageKills / _totalSpawned` (51529).

---

## 13. 재사용 가능 / 신규필요 / 위험변경 / 마이그레이션

### 재사용 (Existing first — 신규 프레임워크 만들지 말 것)
| 목적 | 재사용 대상 |
|---|---|
| PLAY 경계 | `isW`/`canMv`/`safePt` (25984+) — AI/스폰 공유 |
| 대형 스트리밍 | `_streamChunks`+`_shouldStreamMapCache` (20278+) — 이미 1000²까지 |
| 존 스왑(보스) | `_enterBossArena`/`_preArenaBackup` (25111) |
| 로드 커튼 | `showStageTransition` (53641) |
| 미니맵 | `drawMM`+`_mmCache` (51400) |
| OUTER 렌더 | 패럴랙스 config(9631, 비활성 재활성) / Vista(9725) |
| 경계 자연화 | `_fillVoidWithFloor`+`[EDGE-FADE]` (9781) |

### 신규 필요(최소)
- **ZONE 정의 데이터**: PLAY/RIM/OUTER 및 START/COMBAT/SIDE/EVENT/MINIBOSS/BOSS/GATE 태깅. 후보: `_MAP_COMPOSE[si]`에 `zones:[]` 필드 추가(기존 `empty`/`rim` 확장), 또는 미사용 `fm.zones` 활성. **비침습 우선**.
- **미니맵 마커 레이어**: 보스/게이트/이벤트/포켓 마커(drawMM 확장).
- **OUTER 배경 재활성**: `_bgLayers=null`(43539) 조건부 복구.
- **거대보스 배경 표현 오브젝트 타입**: MAP_OBJS 비충돌 실루엣.

### 위험 변경 (건들면 안 됨 / 회귀 위험)
- `isW`/`_colObjs` 프리필터 로직 (성능 핵심, `[ISW-OPT]`).
- `_streamChunks` 퇴거/재합성 임계 (블리드/드리프트 재발).
- `_enterBossArena`/`_preArenaBackup` 스왑 순서.
- 워밍업 실제 위치 = **18540–18584** (`_warmupEnsAtlas`/`_warmupNext`). ⚠ AUTOLOOP가 지목한 "49342–49389 워밍업 봉인"은 **오류 — 그 구간은 AoE VFX**(gate-well/wall-push/poison-pool/cage-trap). 봉인 대상 재확인 필요.
- AUTOLOOP 보호목록의 `StageSeeder`는 코드 부재 → 실제 보호대상 = `genFromTemplate`/`genGauntlet`/`_MAP_COMPOSE`.

### 마이그레이션 플랜 (개요, 상세 ROADMAP)
PHASE 순서로 **비침습 데이터 확장 → 렌더 재활성 → 마커 → 배경보스 → 아레나 연동**. 기존 생성/충돌/스폰 코어는 유지, 확장 필드/레이어만 추가.

---

## 14. 투자 질문 답 요약 (Q1~Q10)
- Q1 이동영역=`isW===false`(타일≠1+콜라이더). Q2 PLAY/OUTER 최소변경=`_MAP_COMPOSE.zones` 데이터+OUTER 렌더 재활성(코드경계 신설 불필요, isW 재사용). Q3 isW=단일 벽판정, 프리필터 보존. Q4 AI/스폰 isW 공유(예). Q5 미니맵=G.map+spawnHoles+ens+player. Q6 스테이지 단위 로딩. Q7 병목=텍스처/700캡/합성/오브젝트순회. Q8 OUTER=캐시캔버스 drawImage로 억제. Q9 배경보스=MAP_OBJS 실루엣+기존 _enterBossArena. Q10 재사용=§13 표(신규 프레임워크 불요).

## 15. CODE CHANGE
**NONE.** 감사 전용.
