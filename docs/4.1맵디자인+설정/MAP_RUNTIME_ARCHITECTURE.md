# MAP RUNTIME ARCHITECTURE — EXODUSER: HELL LORD

> **데모 피날레 필드몹 예외 (2026-09-09):** `?demo`/`?bic` 마지막 si3 아레나에서는 `_enterBossArena`와 `_wmTick`이 `G._worms`를 비우며 곰치를 생성·갱신하지 않는다. 일반 필드/일반 모드의4마리 스폰·공격은 유지한다. [v0.4 계약](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md).

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.

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
- **Q1 답**: 이동가능(walkable) = `isW(px,py)===false` = 타일값 ≠ 1 AND CH1-1 authored hill cliff band 없음 AND bone-wall 없음 AND 충돌 MAP_OBJS 없음.

---

## 3. Collision (Q3: isW 영향)

| 함수 | 라인 | 역할 |
|---|---|---|
| `isW(px,py,skipBone)` | 식별자 grep | 핵심 벽 판정: OOB→solid, 타일===1→solid, CH1-1 `_ch1HillBandBlocks`, `G._boneWalls` 링, 충돌메타 MAP_OBJS(`_colObjs`) |
| `canMv(x,y,r)` | 25985 | 4코너 AABB `isW` |
| `canMvBlink(x,y,r)` | 25988 | skipBone=1 |
| `_isWallTile(px,py)` | 25992 | **타일만** 판정(MAP_OBJS 무시) |
| `_canMvTile(x,y,r)` | 25993 | 4코너 `_isWallTile` (적 밀어내기) |
| `safePt(x,y,r)` | 25990 | 나선 탐색 최근접 walkable |
| `_pushOutWall(e)` | 25995 | 벽에서 엔티티 방출 |
| `_chgPathClear(e,len)` | 25987 | 돌진 경로 레이마치 |
- **isW 프리필터** `[ISW-OPT]` (25979): `_colObjs`는 충돌메타(`_OBJ_META[type].collision||col`) 가진 MAP_OBJS만 캐시, `_ensureColObjs`가 identity/length 변화 시에만 재빌드. 재빌드 시 인스턴스 `scale||1`을 `colW`/`colH`/`colSz`에 곱한 `_colW`/`_colH`/`_colSz`를 1회 저장하며 `isW()`는 저장값만 읽는다. **성능 핵심 — 손대면 회귀 위험.**
- **다각형/알파 콜라이더 없음.** 오브젝트 충돌 = 렌더 스케일이 반영된 원(colSz) 또는 타원(colW/colH/colOy)만.

### CH1-1 authored high-ground geometry (2026-08-29)

- `_CH1_HILL={cx:147,cy:98,rx:18,ry:9,inner:.84,outer:1.04,rampX0:125,rampX1:135,rampY:98,rampHalf0:1.8,rampHalf1:3}`.
- `_ch1HillBandBlocks(px,py)`는 `G.stage!==0`이면 즉시 false다. stage 0에서는 타원 band만 solid로 만들고 `_ch1HillRampAt` 내부는 false로 열어 둔다.
- `_ch1HillHeightAt(px,py)`는 저지대 0, ramp smoothstep 0→1, inner plateau 1을 반환한다. 현행은 높이 기반 데미지/투사체 보정이 아니라 이동·시각 판독용 authored height다.
- `_drawCh1Hill`은 기존 `m_c1gedge` 이미지를 offscreen canvas에 한 번 합성한 후 map floor 뒤, MAP_OBJS/엔티티 앞에 그린다. 이 지형은 `MAP_OBJS`가 아니며 현행 authored63/runtime64, hand collision22 수치에 포함되지 않는다.
- 실제 WASD: low `(125.95,98.91,h=.026)` → mid `(131.14,98.10,h=.668)` → plateau `(137.99,98.10,h=1)` → 북벽 정지 → ramp descent `(123.33,98.00,h=0)` PASS.

### CH1-1 stage0 baked outer + smoothing (2026-08-30)

- 기본 탐험 phase의 smoothing master는 build 시 locked `baked_start_outer` 8192² base 위에 overlay를 합성한 완성본이다. runtime `_CH1_START_ROOT`는 smoothing 또는 outer-only 중 한 root만 선택해 그린다. 둘 다 8×8/64 chunk, core1024 + copy bleed1(파일1026)이다.
- `?ch1StartPhase=outer`는 outer-only set 비교, `?ch1StartOuter=0`은 selected baked set 전체 OFF 비교다. `G._bossArena===true`에서는 자동 OFF다.
- smoothing은 기존 stage0 cache/decode/GPU warm/draw 경로를 재사용한다. QA는 64/64 ready, error0, max warm<17ms, draw<=.4ms, pageerror/404 0이다.
- `_MAP_COMPOSE[0].forestBoundary=1`, `MAP_ALL_FLOOR=false`다. `_buildCh1StartForestRLE(200,200)`이 side/top/south baked forest와 대응하는 canonical tile wall을 만들며 이 `G.map` 경계를 player `isW/canMv`, enemy 이동, flow/path, spawn `safePt`, minimap이 공통 사용한다.
- `_applyCh1StartNorthGate`가 `bossCx=100`, `gateY=5`, exits `(99..101,7)`과 north approach `x88..112,y2..35`를 forest RLE 뒤에 재적용한다. procedural wall-edge/pillar fallback은 `_ch1StartOuterEnabled()`일 때 suppress한다.
- `m_c1b*`/`m_c1cn/cs/ce/cw*` structural module 59개와 wall 뒤 `m_eye_tree(185,55)` 1개는 authored layout에서 제거했다. 따라서 과거 quadrant/perimeter alpha와 structural tone 경로는 호환 코드일 뿐 현행 instance 0이다. `m_c1tree`는 smoothing 조건에서 기존 metadata filter + CH1 tone을 단일 `_drawFilter`로 합쳐 기존 save/restore 경로를 사용한다.
- 현행 authored63/runtime64, structural0, collision total23/hand22이며 tile은 floor23199/wall16495/exit3/gate3/boss300이다. baked outer/smoothing master와 landmark/vertical 수치는 유지한다.
- 실제 WASD는 START `(100.5,185.5)`에서 north `y23.43`까지 전 segment PASS했고 exits는 y7이다. pageerror/404는 0/0이다.
- **시각 바닥 경계 (2026-09-01, render-only):** `_useSoftFloorEdge()`가 stage4/boss/vista/paint를 제외한 soil 맵에서 occupancy **1타일 dilate** + `_FLOOR_SOFT_SCALE=4` + `_FLOOR_SOFT_BLUR=5`로 `_blitSoftFloor` 한다. 캐시는 `_SOFT_FLOOR_BACKDROP` 통짜 fill. 근거리 벽 칸 40px 검정 계단과 rim overlay는 없다. CH1-1 `_drawCh1StartOuter`는 `_CH1_OUTER_HUG_X=0.965`로 좌우 forest만 중앙에 붙여 walkable 가장자리에 overlap 한다. 남북은 1.0. `isW`·tileRLE·spawn·minimap 불변. CH2-1은 `_traceCh2AuthoredFloor` 경로를 유지한다.

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
| `MAP_ALL_FLOOR` | 식별자 grep | `false`; stage0은 all-floor 우회 대신 `forestBoundary:1` RLE 사용 |
| `_buildCh1StartForestRLE(200,200)` | 식별자 grep | baked forest와 대응하는 canonical floor/wall geometry |
| `_applyCh1StartNorthGate` | 식별자 grep | bossCx100/gateY5, exits y7, x88..112/y2..35 approach 복구 |
- **NOT FOUND**: `StageSeeder`, `genMap`. → AUTOLOOP "불변보호영역 StageSeeder"는 **코드에 부재**. 실제 시드/생성 = `genFromTemplate`/`genGauntlet`. **보호 의도는 이 두 생성기 + `_MAP_COMPOSE` 데이터로 해석해야 함.** (§13 위험변경)

---

## 6. 플레이어 스폰

- `initStage` (25840): start room(`type==='start'`||rooms[0])의 cx,cy → 벽이면 나선보정 → `P.x=(_spX+.5)*T` (25867). iframes=360.
- `_loadZone` 스폰 24560–24570 (iframes=90, 카메라 스냅).
- 보스 아레나 진입 25136.
- 시작방 안전: 500px 적 퍼지(27846), 화톳불 배리어 `G._bonfire`(27876).

### 시작 화톳불 완전 안전결계 계약 (2026-09-03)

| id/대상 | 한글명 | 수치·공식 | 적용 위치 | 비고 |
|---|---|---|---|---|
| `G._bonfire` | 시작 화톳불 결계 | 중심=`P.x/P.y`, 시각·기본 반경 `280px`, 지속 `300f=5초` | `initStage`, 리스폰/테스트 재시작 경로, 포스트 렌더 | `t>0` 동안 활성 |
| 일반 `ens` | 일반 몬스터 | 최소 중심거리=`280 + clearance`; 일반형 `clearance=e.r` | 적 AI 루프 전·후 `_pushOutsideBonfire` | 이동·돌진·잠복 결과보다 마지막 결계 투영이 우선. 보스(`ib`) 제외 |
| etype 36 | 사행 사도 | `clearance=e.r×2` | `_bonfireEnemyClearance` | 꼬리 끝까지 결계 밖 |
| etype 65 | 장어 사도 | `clearance=e.r×1.6` | `_bonfireEnemyClearance` | 장형 몸통 끝까지 결계 밖 |
| etype 75 | 불뱀 | `clearance=e.r×1.5` | `_bonfireEnemyClearance` | 꼬리 화염 끝까지 결계 밖 |
| `G._worms` | 지상뱀장어/곰치 | `clearance=75px`; 최소 중심거리 `280+75=355px` | `_wmLockDest`, `_wmAppear`, `_wmTick` | 일반 `ens` 밖 독립 몬스터도 목적지·재등장·매 틱 모두 차단 |

`_pushOutsideBonfire`는 결계 중심에서 대상 중심으로 향하는 단위벡터에 `결계 반경+clearance`를 곱해 즉시 경계 밖으로 투영한다. 안쪽을 향하는 넉백 성분도 제거해 다음 틱 재침범과 경계 떨림을 막는다.

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
- **필드 보스**(심연의 앵글러): `_fbTick`, **CH1-1 전용 맵 4마리 4각** `_FB_SITES`/`_FB_ELS` (SW물/SE화/NW암/NE뇌), 홈 1000px 기상. HP=`(1800+lv×350)×7.5`. 등장=`asleep`→`spawnIn` 꿈틀 상승 54틱. 에스카 충전 180f / 거대 에너지탄(`fbEnergy`: **3초 텀**, raw 10×1.8 **직선**, **화마귀와 동일한 렌더 240px**, 탄·플레이어 상대 스윕+보이는 핵 히트 `P.r+max(p.r,sz)`=`P.r+96`, 중심+원주 8점 벽 스윕, Q `P.r+sz+90`→원본 즉시 회수+기본 `magic` 충돌의 r8 동일 속성 혜성형 마법탄 5발(`_parryMagicShot`, `proj_bolt_comet.png` 승인 대형 시각 246.4px, 일반 먼지·`arcMissile` 미사용, 총 반사 피해 5등분)+자원회수 ×10, 플레이어·벽 접촉 시 항상 r220 폭발·무적/돌진 중 피해 0). 기본 Q/평화의보호 Q만 분열하며 E·비Q 반사와 friendly 대형 30관통은 없음.
- **화마귀**: `_fdTick/_fdDraw`, CH1-1 안쪽 4마리 `_FD_SITES` `(78,125)/(125,125)/(78,70)/(125,70)`, 홈 1000px. 연기 시트 54틱 등장. `_FD_SPD=1.8` 추적. 이동 중 `_fdWalkClock` 8방향(`12/1/3/5/6/7/9/11`) 전용 시트를 6틱/프레임으로 재생하고 11시는 1시 시트를 수평 반전한다. 충전 중 좌표는 정지하되 매 틱 플레이어를 바라보는 현재 방향 시트를 `chargeWalkT` 18틱/프레임으로 느리게 재생한다. 일반 정지·에셋 로딩 전에는 `fieldboss_firedevil_dir.png` 폴백. 화염 충전 180f 후 비행탄(`fdEnergy`: **3초 텀**, raw 6×1.8 **직선**, **렌더 240px**, 스폰 r18→23.4/sz48→96, 탄·플레이어 상대 스윕+보이는 핵 히트 `P.r+max(p.r,sz)`=`P.r+96`, 중심+원주 8점 벽 스윕, Q `P.r+sz+90`→원본 즉시 회수+기본 `magic` 충돌의 r8 빨간 혜성형 마법탄 5발(`_parryMagicShot`, `proj_bolt_comet.png` 승인 대형 시각 246.4px, 일반 먼지·`arcMissile` 미사용, 총 반사 피해 5등분)+자원회수 ×10, 플레이어·벽 접촉 시 항상 r220 폭발·무적/돌진 중 피해 0). 기본 Q/평화의보호 Q만 분열하며 E·비Q 반사와 friendly 대형 30관통은 없음. HP=`(1800+lv×350)×2.5`. 지옥문 조건 아님.
- 적 하드캡 700 (`[ENS-CAP]` 28487), AI 컬링 ±300px(28577).

---

## 8. 보스 스폰 / 아레나 (Q9 관련)

- `findBoss()` 15379 → `G._bossRef`. 게이트 상태: `G.bossGate`(타일배열)/`bossGateOpen`/`bossSealed`/`_gateY`/`_bossCx/_bossCy`/`_bossUnlocked`/`_gateGuardKilled`.
- **게이트 개방**: `checkRooms` — `_stageKills/_totalSpawned + 0.10(가드보너스) >= 0.8` (80%). CH1-1(`G.stage===0`)은 **추가로** 앵글러 4마리 전멸(`G._fbDone`). 추적스폰 0이어도 CH1-1은 `_fbDone` 필수.
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
  3. `_streamVpCvs` 합성 비용 — 청크 퇴거 주기(60/180, margin4, 43605)와 재합성 임계(4타일 합성 여백 안에서 3타일 이동 시 갱신, 1타일 안전여백).
  4. MAP_OBJS/`_colObjs` 선형 순회 — 오브젝트 급증 시 isW 비용(프리필터가 완화하나 상한 있음).
- **Q8(OUTER 데코 증가 → draw/render)**: 전역 후보는 패럴랙스/Vista이나, CH1-1 stage0은 local 64-chunk outer+smoothing 예외를 사용한다. 원경 draw 증가는 cache/GPU warm 경로와 `MAP_QA_GATES.md Performance`로 봉인한다.

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
| OUTER 렌더 | 전역 후보=패럴랙스/Vista; CH1-1 local=build-time outer+overlay 완성본인 `baked_start_smoothing` 또는 비교용 `baked_start_outer` 중 선택한 64-chunk set 하나 |
| 경계 자연화 | `_fillVoidWithFloor`+`[EDGE-FADE]` (9781) |

### 신규 필요(최소)
- **ZONE 정의 데이터**: PLAY/RIM/OUTER 및 START/COMBAT/SIDE/EVENT/MINIBOSS/BOSS/GATE 태깅. 후보: `_MAP_COMPOSE[si]`에 `zones:[]` 필드 추가(기존 `empty`/`rim` 확장), 또는 미사용 `fm.zones` 활성. **비침습 우선**.
- **미니맵 마커 레이어**: 보스/게이트/이벤트/포켓 마커(drawMM 확장).
- **전역 OUTER 배경 재활성**: `_bgLayers=null`(43539) 조건부 복구. CH1-1 local baked 예외와 별개.
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
