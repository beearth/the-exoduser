## 2026-10-08 — CH1 렌더 consumer 추가

[정확 계약·검수·§23 보고](CH1_SIDE_RAVINE_RELIEF_20261008.md). `ch1-side-ravines.js`를 실제 main 바닥에 연결: 서420/220/86·동500/300/128(width/renderDepth/renderRise), 기존 m_c1gedge 재질·live wall3×3 보호. 새 물리 고도/추락/보행/충돌 변경0. source-raster SIDE L/R만 검수, 실제 게임8camera·GPU·청취·save 미인수 / **RETOUCH**. 아래 기존 hill·경계·원화 설명은 각 모듈/시점 계약을 유지한다.

## 2026-10-01 — [DEPTH-SLICE] CH1-1 draw order 분할 (플래그 OFF 기본)

`?depthSlice=1`(또는 `G._depthSlice=true`, CH1-1 한정) 활성 시 draw order가 다음처럼 바뀐다. **OFF(기본)에서는 기존 순서·수치와 동일**하며, MAP_OBJS 루프 본문이 `_drawMapObjOne(mo,_hellWinterTone)` 함수로 추출되어 호출되는 형태 차이만 있다(실행 경로 동일, test/depthSlice.test.js 잠금).

| 변경점 | 내용 |
|---|---|
| MAP_OBJS 패스(벤치마크 §2 순서 14) | `occ:1` tall 오브젝트(`m_ctree13~20`+`m_c1tree`) 중 분할선 `footY=y+sz×scale×footYF > P.y`인 것을 건너뛰고 `_dsFrontObjs`로 이월. footYF: m_ctree*=.45(시각 밑동), m_c1tree=-.058(몸통 기준선 — 뿌리 치마 위는 가리지 않음). 아치(m_ctree15/18)는 고리 안 플레이어 시 예외(가림 없음) |
| `drawP()` 직후(순서 21) | `_dsDrawFrontPass()`: 프런트 오브젝트를 footY 오름차순으로 재드로우. 플레이어 AABB와 겹치면 알파 1→.62 lerp(≈150ms) + 플레이어 현재 아틀라스 프레임 α.55 엑스레이 고스트 1회 |
| 적 인스턴싱(순서 18) | `_prepEnemyInstanced`가 화면 내 적을 y 오름차순 큐잉(같은 버킷 안에서만 유효, 배치 분할 없음) |
| 접지 그림자 | 플레이어 α.25→.38 소프트 스탬프, 적 α.18→.30, 전부 SE 오프셋 — **월드 키라이트 SSOT = 북서(NW), 그림자 남동(SE)** (PLAYER_RELIEF·ch1-living-detail skew와 일치, MAP-012 결정) |

수치·검증·게이트·잔여는 [DEPTH_SLICE1_20261001.md](DEPTH_SLICE1_20261001.md)가 SSOT다.

## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

> **2026-09-16 CH1-1 PRODUCTION 적용 계약 — 이전 CH1-1 배경/경계 설명보다 우선:** 사용자 최신 지시에 따라 실제 `STAGES[0]`(표시 1-1)에 고정 수작업 전체맵을 적용했다. 현행 경계는 `assets/map/ch1/production_finish/layout.js`의 53점 polygon/8구역이며, 기본 배경은 `assets/map/ch1/production_finish`다. 8192² master의 1024px core를 **월드 1000px**로 그려 200×200타일(`T=40`, 8000²) 충돌 좌표와 일치시킨다. `smoothing`은 호환 phase 이름이며 과거 smoothing 폴더를 기본 로드한다는 뜻이 아니다. `outer` query는 과거 아트 비교용으로, 현행 경계와 시각 정합을 보증하지 않는다. authored62/runtime63, hand collision21/total22, 자동 scatter0. `_CH1S1`/stage1은 별도 맵이다. START `(100.5,185.5)`, 시체나무 `(102.5,90.5)`, 북쪽 gate y5/exit y7과 진행 조건은 유지한다. 아래의 이전 outer/smoothing 수치·좌표는 **해당 날짜의 이력**이며 현행값은 [전체 제작·수치·검증 보고서](CH1_1_PRODUCTION_FINISH_20260916.md)를 따른다. 기술 PASS와 시각 판정은 보고서에서 별도로 기록한다.

> **48차 현행(2026-09-27):** 정상부/ramp surface 합성에 alpha 실루엣 기반 그림자 rgba(10,9,12,.32), blur20, offset(0,18) 추가. 정적 언덕 캐시에만 적용. [적용 범위·검증](CH1_HILL_DEPTH_PASS48.md).


> **47차 현행(2026-09-27):** 제단 정상부·ramp floor 반복 크기 round(_gtTileSz(floor)×1.4), texture에만 saturate(.7)/contrast(.92)/brightness(.92) 적용. 공통 월드 원점·46차 윤곽·44차 feather 유지. [현행 수치·검증](CH1_HILL_MATERIAL_PASS47.md).


> **46차 현행(2026-09-27):** 정상부의 정확한 타원을 96점 비대칭 폐곡선으로 교체. 사면 명암은 organicSkirt 전체에 적용. 44차 feather·45차 색상/월드 정렬·높이·충돌 유지. [윤곽 공식·검증](CH1_HILL_CONTOUR_PASS46.md).


> **45차 현행(2026-09-27):** 제단 사면의 갈색 radial wash를 저채도 방향광으로 교체하고, ramp 바닥을 정상부와 같은 월드 좌표에 정렬. 44차 48px alpha·높이·충돌 유지. [현행 색상·검증](CH1_HILL_SHADING_PASS45.md).


> **44차 렌더 보강(2026-09-27):** smoothing 언덕의 정상부·오르막 접합과 전체 외곽에 48px L1거리/smoothstep 알파 감쇠 적용. 캐시 1900×960 유지. 높이·충돌·서쪽ramp·원본PNG·배경청크불변. [현행공식·검증](CH1_HILL_EDGE_BLEND_PASS44.md).

> **최신 QA 적용:** [Rootworld blockout2](ROOTWORLD_BLOCKOUT_20260924.md). `20260924-blockout-2`는 stage0 QA 전용 34점 외곽/12점 중앙 질량과 서·동 양방향 동선을 사용한다. 템플릿 통행 13396칸, 나무 `(102.5,112.5)`, 북측 gate y5/exit y7, 시각 gate clearance x88~112/y2~35. 아래 이전 수치·미적용 설명은 당시 이력이며 본편 LOCK은 변경하지 않는다.

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

- 기본 탐험 phase의 smoothing master는 build 시 locked `baked_start_outer` 8192² base 위에 overlay를 합성한 완성본이다. runtime `_CH1_START_ROOT`는 smoothing 또는 outer-only 중 한 root만 선택해 그린다. 둘 다 8×8/64 chunk, core1024 + copy bleed1(파일1026)이다. 2026-09-24 QA 예외: `_DIABLO_FIELD_QA`이면 `rootworld_outer` 한 세트를 선택한다. 이 세트도 8192²/64청크/1024 core/1px bleed이며 청크 하나를 월드 1000px로 그린다. mask는 `_buildDiabloField(0,200,200)`를 사용하며 collision을 수정하지 않는다. 상세 수치는 `ROOTWORLD_OUTER_MASS_20260924.md`를 따른다.
- `?ch1StartPhase=outer`는 outer-only set 비교, `?ch1StartOuter=0`은 selected baked set 전체 OFF 비교다. `G._bossArena===true`에서는 자동 OFF다.
- smoothing은 기존 stage0 cache/decode/GPU warm/draw 경로를 재사용한다. QA는 64/64 ready, error0, max warm<17ms, draw<=.4ms, pageerror/404 0이다.
- `_MAP_COMPOSE[0].forestBoundary=1`, `MAP_ALL_FLOOR=false`다. `_buildCh1StartForestRLE(200,200)`이 side/top/south baked forest와 대응하는 canonical tile wall을 만들며 이 `G.map` 경계를 player `isW/canMv`, enemy 이동, flow/path, spawn `safePt`, minimap이 공통 사용한다.
- `_applyCh1StartNorthGate`가 `bossCx=100`, `gateY=5`, exits `(99..101,7)`과 north approach `x88..112,y2..35`를 forest RLE 뒤에 재적용한다. procedural wall-edge/pillar fallback은 `_ch1StartOuterEnabled()`일 때 suppress한다.
- `m_c1b*`/`m_c1cn/cs/ce/cw*` structural module 59개와 wall 뒤 `m_eye_tree(185,55)` 1개는 authored layout에서 제거했다. 따라서 과거 quadrant/perimeter alpha와 structural tone 경로는 호환 코드일 뿐 현행 instance 0이다. `m_c1tree`는 smoothing 조건에서 기존 metadata filter + CH1 tone을 단일 `_drawFilter`로 합쳐 기존 save/restore 경로를 사용한다.
- 현행 authored63/runtime64, structural0, collision total23/hand22이며 tile은 floor23199/wall16495/exit3/gate3/boss300이다. baked outer/smoothing master와 landmark/vertical 수치는 유지한다.
- 실제 WASD는 START `(100.5,185.5)`에서 north `y23.43`까지 전 segment PASS했고 exits는 y7이다. pageerror/404는 0/0이다.
- **시각 바닥 경계 (2026-09-01, render-only):** `_useSoftFloorEdge()`가 stage4/boss/vista/paint를 제외한 soil 맵에서 occupancy **1타일 dilate** + `_FLOOR_SOFT_SCALE=4` + `_FLOOR_SOFT_BLUR=5`로 `_blitSoftFloor` 한다. 캐시는 `_SOFT_FLOOR_BACKDROP` 통짜 fill. 근거리 벽 칸 40px 검정 계단과 rim overlay는 없다. CH1-1 `_drawCh1StartOuter`의 현행 `production_finish` 배경은 x scale 1이며, legacy `baked_start_outer` 비교 분기에서만 `_CH1_OUTER_HUG_X=0.965`로 좌우 forest를 중앙에 겹친다. 남북은 1.0. `isW`·tileRLE·spawn·minimap 불변. CH2-1은 `_traceCh2AuthoredFloor` 경로를 유지한다.

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
- **게이트 개방 (2026-09-30 [REGION] 규칙 교체)**: 오픈필드 맵은 **4분면 지역 4곳 전부 클리어** 시 개방 (`G._regions` + `_regionClearedCount()>=4`). 지역 클리어 = 지역 kills/total ≥ 0.8 (+문지기 처치 시 **게이트 지역 한정** +0.10) AND (CH1-1) 담당 앵글러 사망. CH1-1 `_fbDone`(`_krakenOk`)은 이중 안전망으로 유지. **소형 맵(한 변 180타일 미만 — 던전·소환굴·보스아레나) 폴백 = 구 규칙**: `_stageKills/_totalSpawned + 0.10(가드보너스) >= 0.8` (80%). 상세 = `REGION_CLEAR_GATE_20260930.md`.
- **보스 로드 스테이트머신**: `_bossLoadPhase` 1=페이드아웃→`_enterBossArena()`(35514), 2=네임카드, 3=페이드인, 4=보스등장. 트리거 = 출구타일 밟기(`bossAlive && !_bossArena && _bossUnlocked`, 35606).
- `_enterBossArena()` 25111: `_preArenaBackup`로 던전 백업(25113) → 생존몹 kills 전환 → 풀 클리어 → `G.map=arena.map`(25130) → 보스 mkEn(ib=true, 25139) → 캐시 재빌드.
- **1-1 필드몹/보스 아레나 분리 (2026-09-28):** `si0` 아레나 진입 시 `G._fieldBoss`, `G._fieldBosses`, `G._fireDevils`을 비우고 `G._worms=[]`로 초기화한다. `_fbTick`·`_fdTick`은 `G._bossArena && G.stage===0`이면 저장 배열을 비우고 스폰 전에 반환한다. `_wmTick`도 같은 조건에서 곰치 배열을 비우고 반환한다. 탐험 필드의 4각 위치·HP·탄막·게이트 조건 `G._fbDone`은 유지하며, 기존 데모 si3 피날레 곰치 차단도 유지한다.
- **Q9(배경표현→실엔티티) 최저위험 경로**: `_preArenaBackup`/`_enterBossArena` 구조가 이미 "월드↔아레나 스왑"을 함. 배경표현은 **탐험 맵의 MAP_OBJS에 거대 실루엣 오브젝트(비충돌, OUTER 레이어)를 두고**, 아레나 진입 시 기존 `_enterBossArena`로 실 엔티티 스폰 → 신규 프레임워크 불필요. (`MAP_IMPLEMENTATION_ROADMAP.md PHASE 7`)

---

## 9. 미니맵 (Q5: 어떤 데이터를 쓰는가)

- `drawMM()` 51400–51446 (element `mm`, ctx `MX`).
- **읽는 데이터**: `G.map` 타일(캐시 `_mmCache`, `_mmTickBuild` 51315) + `G.spawnHoles`(51431) + `ens`(60캡, 30프레임 갱신) + 플레이어 `P.x/P.y/P.facing`.
- **읽지 않는 것**: `G.rooms`, `G.exits` (미니맵 렌더에서 미사용).
- 플레이어 마커 `_mmDrawPlayerMarker` 51366–51398 (초상 `_mmPortraitImgs`, 방향삼각형, 이중링). 20프레임 캐시.
- **[REGION] 마커 추가 (2026-09-30, 구 "게이트/존 마커 NOT FOUND" 갭 해소)**: ① 4분면 경계 십자선(정적 캐시 `_mmTickBuild` 완료 블록, `rgba(255,255,255,.14)`) ② 클리어 지역 딤 오버레이(`rgba(30,60,30,.42)` fillRect, 동적) ③ 지옥문 자물쇠(봉인=빨강 🔒 / 개방=파랑 🔓, `G._bossCx/G._gateY` 위치) ④ CH1-1 앵글러 속성색 원형 마커(생존만 표시, 사망 시 제거; 미스폰 시 `_FB_SITES` 사이트 위치). 동적 마커는 캐시 리빌드 없이 drawMM(20프레임 스로틀)에서 직접 그림. 잔여 갭: 보스방 외 사이드포켓 마커.

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
- 게이트 개방([REGION] 2026-09-30)=4지역 클리어(§8, 소형 맵(한 변<180타일) 폴백=80%+10% 가드), 스테이지 클리어 = **보스 처치 후 아레나 출구 도달**(35626, kill-all 아님), 타임어택 90%(35631, [REGION] 무관 — 기존 유지).
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


## 2026-09-16 — 대형탄 패링 분열탄 유도·적중 임팩트 수정

| 항목 / 적용 위치 | 현재 코드 계약 |
|---|---|
| 원인 | 원형 5발 분열 이후 일반 magic의 250px 탐색만 사용. shQuery에 없는 크라켄·화마귀·지상뱀장어는 유도에서 누락. 필드몹 적중에는 전용 속성 임팩트·타격음이 없고, hitCd 중 접촉은 탄 소멸로 처리되지 않았음 |
| 분열 / _splitParriedBigEnergy | 크라켄 fbEnergy와 화마귀 fdEnergy 공통. 5발·원형 균등 72° 간격·반지름12px 스폰·속도7.5·r8·사거리900·발당 max(1,floor(totalDmg/5))·magic/_parryMagicShot·혜성 길이246.4px 유지. Q 보상×10 유지 |
| 탐색 / 플레이어 투사체 유도 루프 | _parryMagicShot만 탐색 반경900px, 최대 선회0.7×_dtSp rad/갱신, (G._gcT+i)%2===0에서 갱신. 일반 magic은 기존250px/0.35 유지. 반사 쿨다운 동안 유도 중단 유지 |
| 필드 타깃 / _parryMagicFieldTarget | 일반 적 후보와 G._fieldBosses(없으면 G._fieldBoss)·G._fireDevils·G._worms를 거리로 비교. asleep, 사망, _fmCanHit 불가, _hitSet 포함 대상 제외. 크라켄 TP 중 _fmXY의 tpX/tpY를 추적하며 화마귀·뱀장어는 실제 충돌과 동일한 x/y 사용. 타깃이 사라지면 다음 갱신에 재탐색 |
| 물 적중 / _parryMagicHitFx | EL.I: waterImpact r72/66f, Water_ImpactWater_Sheet.png 전체16프레임, 최대 표시216px. 분열 시작 Q 물보라는 기존 r96/72f·최대288px. 임팩트 위치는 탄 접촉 x/y |
| 기타 속성·소리 | 물 이외에는 기존 _projHitFx(x,y,el,false). 모든 분열탄 적중에 playSampleAt('bullet_hit',0.3,1,x,y). 일반 적 magic 타격음 중복 호출 제외 |
| 필드 접촉 / _hurtFieldMobs(...,parryShot) | 선택적 여섯째 인수에 분열탄 전달. 유효한 필드몹 접촉 시 임팩트·음향·탄 회수를 보장하고 일반 적 충돌까지 중복 진행하지 않음. 기존 _fmApply의 hitCd=8 피해 간격 유지: 쿨다운 중에는 추가 피해 없이 접촉 효과 후 소멸. 기존 다른 호출은 피해 적용 횟수 반환 유지 |
| 적용 / 검증 | game.html 및 game-easy-test.html. test/parryMagicTrackingImpact.test.js: 5발 모두600px 크라켄 도달, 일반 적600px 포착, 일반 magic 범위 보존, 필드 쿨다운 접촉 효과·소멸 계약, TP 좌표·비활성 타깃 제외. 백업 tmp/kraken_parry_20260916/ |

분열탄은 공용 magic 벽 반사 경로를 그대로 사용한다. 기존 문서의 ‘튕김 미사용’은 arcMissile 전용 튕김을 뜻하며, 실제 공용 벽 반사는 _maxBounce||3에 따라 최대3회, 반사 후 _bounceCool=6이다. 이번 수정은 이 값을 변경하지 않는다.

검증 결과: 관련6개 테스트 파일43개 PASS. Chrome 실제 런타임에서 `_hurtFieldMobs`의 쿨다운 중 분열탄 접촉 반환1·waterImpact r72/66f 생성·물 시트 로드·화면 물보라 표시 확인, 브라우저 error 로그0. 캡처 `tmp/kraken_parry_20260916/water-impact.jpg`. 브라우저 검증은 접촉 함수를 직접 실행한 효과 확인이며 키 입력 기반 전체 Q패링 전투 검증과 구분한다.


## 2026-09-29 시작 맵 준비 후 공개

| id / 적용 위치 | 현행 계약·검증 |
|---|---|
| 두HTML 부트 | _bootLoadActive:show=true/killed=false,hide=false/killed=true. active로딩은 _startLoop/loop 자동숨김에서 보호. _prepareStartMapView를7개부트완료분기에서100%보다먼저await |
| 맵 준비 | _ch1StartOuterViewIds의현재visible+1이웃만요청,30ms재검사/status=ready(GPUwarm완료)까지98%준비. error또는12000ms면전체selected baked layer안정된지형폴백,_ch1StartOuterBootFallback=true. 새준비/재시작에서false로재시도. 기존GPU lifetime LOCK보존 |
| 실화면 | CSS/render5074×1318/high100/nativefocus:본편첫프레임16/16,500draw부분표시0(직전부분12회). 정상reload24/24복귀,보조판전면복귀첫16/16. QA청크1차단시fallback진행·차단해제확인 |
| 프레임 / 한계 | 10초cap60실제109→134AI,draw600=60FPS/최대11.5ms,맵CPU최대.2ms,rAF최대12.5ms. 무제한재측정은실제blur로폐기. 이전87.7ms지연·장시간/Steam/전체visual은미해결·미검증 |
| 검사·기록 | 신규16PASS/관련11파일54PASS/HTML실행script각6구문PASS. 확대69검사중기존ellipse테스트1FAIL은수정전에도재현. [계약·실측·메모리·MAP PRODUCTION REPORT](../12퍼포먼스·최적화/MAP_STARTUP_READY_20260929.md). VISUAL VERDICT RETOUCH. 커밋·배포미완료 |


현행 보강 — 숨은 창: _prepareStartMapView의12000ms 제한은 document.hidden=false일 때만 적용하며, visibilitychange로 다시 보이면 deadline=performance.now()+12000으로 재설정한다. 초기청크error는 숨김 여부와 관계없이 안정된폴백으로 진행한다. 성공·실패·stage변경 모든 반환에서 visibility 리스너를 finally로 제거한다. 숨은 Chrome의 타이머 제한을 실제 에셋실패로 잘못 판정하지 않는다. 두HTML 추가2검사 RED2FAIL→GREEN2PASS,신규총18PASS/관련11파일최종56PASS. 앞의16/54 및 확대69검사는 이 보강 전 기록이다.


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.


---

## 2026-10-02 — 보스 사망 후 필드 진행 보존 (현행 재도전 계약)

기존 §8의 맵 단위 backup/복원을 필드 진행 수명 계약으로 보강했다. 일반 arena에서 보스 진입 전 capture, 해금 완료 CH1-1 일반 필드 사망에서는 현재 field capture 후 restore한다. 그 외 필드 사망은 기존 initStage를 유지한다. 시연 si=3 직접 재도전 선행도 유지한다.

| 그룹 | 정확한 capture key | 복사/복원 계약 |
|---|---|---|
| 맵·게이트 | `map`, `mw`, `mh`, `rooms`, `exits`, `curRoom`, `bossGate`, `bossGateOpen`, `bossSealed`, `_bossCx`, `_bossCy`, `_gateY`, `_bossEntY`, `_isTileRLE`, `_isOpenField` | map 각 행 복사; rooms/exits/bossGate 배열 복사(내부 객체 참조 유지), 나머지 스칼라 원값 |
| 필드 엔티티·상호작용 | `ens`, `mapObjs`, `worldItems`, `_fow`, `spawnHoles`, `rifts`, `_editorEyes` | 새 배열에 원 엔티티/오브젝트/아이템/소환굴/리프트/eye 참조 유지. 죽은 적 제거·부활·HP 재설정 없음. FOW typed array 복사. nullable eyes 원값 보존. mapObjs는 전역 MAP_OBJS로 복원 |
| 필드 진행 | `_bossUnlocked`, `_stageKills`, `_totalSpawned`, `_gateGuardKilled`, `_gateGuard`, `_deathSpawned` | 스칼라 원값, _gateGuard는 원 적 참조 |
| 지역 | `_regions`, `_regMidX`, `_regMidY`, `_regCurIdx`, `_regBannerCd`, `_regGateIdx` | 현재 평면 region 객체를 capture/restore 각각 얕게 복사, 메타데이터 원값. null/undefined 보존 |
| CH1 앵글러·화마귀 | `_fieldBoss`, `_fieldBosses`, `_fbDone`, `_fbSpawned`, `_fbAnnounced`, `_fbStage`, `_fireDevils`, `_fdSpawned`, `_fdAnnounced`, `_fdStage` | nullable 배열과 null 슬롯·원 엔티티 참조/HP/AI 유지, flags/stage 원값. CH1 진입에서 refs 분리; easy의 3개 CH1 가드는 본편과 동일 |
| 필드 곰치 | `_worms`, `_wmStage` | nullable 배열과 null 슬롯·원 refs 보존. 진입 시 일시 []와 _wmStage=G.stage, 복귀는 원 _wmStage 정확 복원. 일반 arena의 worm tick 가드 확대 없음 |

mapObjs는 전역 MAP_OBJS로 복원한다. 배열 identity는 새로 만들되 원 적/오브젝트 refs·죽음/HP/AI 상태를 유지한다. _stageKills는 진입 전 값으로 복원하여 arena 진입 시 잔여 적 소멸 크레딧을 필드로 누적하지 않는다. P/INV/EXP·G._sStats/deaths·G.stageTime·계정/저장 스키마 snapshot 0.

| 시점/대상 | 정확한 처리 | 검수 경계 |
|---|---|---|
| 복원 전 미니맵·배경 큐 | `_mmInitDone=true;_mmInitCtx=null;_mmDirty=1;`, `_bgInitQueue.length=0;_bgInitIdx=0;_bgInitDone=true;` | 이전 build context/오브젝트 초기화 큐가 복원 상태를 덮어쓰지 않게 함 |
| 출구·탐색 | `_cacheExitCenter()`, `G._fowDirty=true` | FOW 원 데이터 복원; 새 빈 FOW 생성 제거 |
| 적 공간 해시·시체 풀 | `_shDirty=true;shRebuild();rebuildDeadPool()` | `_shDirty`는 그림자가 아니라 적 공간 해시 dirty |
| 미니맵/방향 화살표 | `_mmRegOvlKey='';_raT=0;drawMM._enCnt=0;drawMM._enT=29;` | 현재 field 표시 파생 데이터 무효화, 실제 렌더 미검수 |
| 정적 조명 | `_slDirty=true;_litCamX=1e9;_litCamY=1e9;` | 다음 lighting 갱신 유도; GPU/첫 화면 미검수 |
| 충돌 | 복원 `MAP_OBJS`의 새 배열 identity → 실제 `safePt/isW`의 `_ensureColObjs` 재빌드 | 실제 collision 함수 source fixture 검수; 지형/충돌 설계 변경 0 |
| 맵 캐시·파생 조명 | `buildMapCache();initTorchLights()`; 지연 큐는 `initSwayObjects/initWallEyes/_initEyes/initGlowObjects` | `initMapObjects` 제외하여 상호작용 상태 재생성 방지. cache token/bitmap 경계는 source 읽기, 실제 idle/GPU 일정은 미실행 |

실제 분기/게이트 복귀 좌표·플레이어 일시 상태 목록은 [CH1-1 보스 사망 진행 보존 정본](CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md)를 따른다. _shDirty는 적 공간 해시이며 그림자 dirty가 아니다. geometry/art/layout·좌표·비용·CD·합체 수치 변경 0. 검수 영수증 `tmp/mac-migration-runtime/continued-review-20261002/boss-respawn-backup/receipt.json`: 양판 actual source 30/30 PASS(각 15), 공통 자원 인접 회귀 5/5 PASS(최종 후 1회), inline JS 12/importmap JSON 2 구문 PASS. SHA와 46개 필드·대역/미검증 범위는 전용 정본에 기록한다. 검수는 실제 source 추출 + controlled fixture에 한정한다. 실제 게임·등록 이벤트·카메라·시각·오디오·성능은 미인수이며 source PASS를 runtime/visual PASS로 대체하지 않는다.

### ROOT-CH1-1-THREE-TERRAIN-CONSUMER-20261007 — 2026-10-07 최초 연결 이력
2026-10-08 현행 샘플링: `ROOT-CH1-PAINTED-MAGNIFICATION-SHARPNESS-20261008`. 기존 CH1 main `ch1Three=1` 지면에 WebGL2 확대 RGB 보정0.35를 연결했다. 양축 texel footprint가 각각 `(0,1]`일 때만 적용하며, core 경계 거리0.5~1.5 texel에 smoothstep을 적용해 경계는 원래 sample을 유지한다. Linear/noMip/clamp/sRGB·alpha·1026² Image·UV·map/nav·소유 캐시 수명은 기존 계약을 유지한다. 아래 옛 핀·CPU/native 수치는 2026-10-07 이력이다. 신규 검수는 통제 THREE/DOM/renderer에서 실제 전체 JS 8그룹만 통과했으며 GLSL/GPU/실화면/성능/청취/save는 미검수다. 현행 정본: [CH1 확대 보정](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-painted-sharpness-20261008).


| 항목 | 현재 구현·정확 경계 |
|---|---|
| 소비 경로 | `game.html::_drawCh1StartOuter → _drawCh1ThreeTerrain → createCh1FieldTerrain().render`; 실제 `G.map/P/G.cam`을 표시용으로 읽는다. 별도 Rift/editor lab이 아니다. |
| 사용 범위 | hostname `127.0.0.1`/`localhost`, port `3387`, query `ch1Three=1`; stage0·비boss·`smoothing`·production root에서만. 기본 OFF, 다른 port/stage 불변. 검수 URL은 `classic=1&mapqa=1&ch1Three=1&webgpu=0`. |
| 지도·권한 | mw=mh200/T40/world8000²·기존53점/8구역 유지. main이 만든 맵/충돌/P/AI가 권한을 가진다. 새 renderer의 simulation/nav/save 쓰기0. |
| 투영 | local Three r160, orthographic50°/scale400. X=(x−4000)/400, Y=0, Z=(y−4000)/(400sin50°). near.1/far1000. 실제 높이0이며 baked 절벽 픽셀을 분리한 physical relief/3Dactor 구현0. |
| 소스·UV | 기존 ready Image1026²·bleed1/core1024를 world1000에 등록. UV1/1026..1025/1026, 4vertices/2triangles. 원PNG/scene/nav/배치·paint96/cache97·64청크/23레이어 유지. |
| 해상도·예산 | 논리 width/height≤4096, zoom.3..4, backingScale≤4. 출력 round(logical×min(2,backingScale)) 각1..4096, rendererpixelRatio1. DPR 재곱0. visible mesh/texture/geometry/material 각≤25, Linear/noMipmaps/clamp/sRGB. |
| 합성·캐시 | 완성 canvas를 `X.drawImage(canvas,left,top,width/zoom,height/zoom)`로 기존 world transform에 합성. cam/zoom/shake/SSAA 중복 적용0. 변경 frame만 `_glVer++`; 같은 view/map/image signature는 canvas재사용. 새 RAF/timer/Image 생성0. |
| 폴백 | cold/invalid/outside8000/25초과/backing초과/import실패/renderer실패는 기존 background 경로. Three `debug.onShaderError` flag와 contextlost/GLerror를 publish전에 검사. 부모 X의 GPU upload 예외는 기존 proxy가 숨겨 완전한 성공/폴백 보장은 UNKNOWN. |
| 순서·수명 | native actor→DS→Border 및 sway/face/hill/moat 순서 보존. 현재 visibleIds/drawnIds 갱신. map identity변경/suspend에서 own records해제, pagehide lateimport차단 및 `_freeMapTex`/dispose. 부분constructor/drop예외·물리GPU free·WebGPU해제 UNKNOWN. |
| 코드 핀 | 최종module7699B/`26d66ae478230e4d4a9a80d94a4a00586712580970f59f62ac2feed76e2301a9`; checkout game4052452B/`66d384052dc021a43792991fa9b36dee91cf16ca87e5639fc8d00917a10aa48b`. Git game은 HEAD+자기hook4052267B/`61325949fbf8a21563d107d1e2999dc3d4acf0eed18120231e810f400cbe69af`만. 기존 foreign185B차이 보존/채택0. |
| 신규 CPU | 최종module 실제전체 + 실제Three geometry/math + 통제renderer 최초1회:8그룹43조건PASS/FAIL0/미도달0/exit0/unhandled0. shader-only 통제callback 실패는 frame게시0·재render0; 실제GPU shader실패 관측 아님. |
| 신규 native | shader guard 전 module7559/d4856 source에서 Chrome1/3조건PASS. 실제 W로 P.y7420→7302.446200000009/map exact/GL0/pageerror0/HTTP오류0; readychunks2→4. 이후 geometry/mainhook 불변, guard만 최소보정; 최종guard 뒤 추가Chrome0. CPU와 합쳐 clean46PASS로 세지 않는다. |
| 안전·비용 | fresh context/기존3387만, 외부요청차단, `/api/mats` POST1은 route에서 차단/서버도달0. headless Three draw첫45.4ms/최종20.4ms는 관측값, 성능인수 아님. save/청취/실보상 조작0. |
| 판정·근거 | root PNG2직접판독. `VISUAL VERDICT: RETOUCH`. 시작금빛효과가 지면·캐릭터를 가리고 baked지면은 평면. 실제 높이·rig actor·전체route/전투획득/보스개방/사망부활/재도전·청취·save·A급 미인수. 근거 `ch1-1-2_5d-production-20261007/validation-receipt.json`3572B/`ce099bce7b4312690d31e78004b7b267fa9034e556866352527ed3d534faddee`. |

#### §23 MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE/MASTER PLAN | 실제 CH1-1/si0,200²/T40/world8000. 기존53점/8구역·시작(4020,7420)·출구(4020,300)·route/nav 보존. |
| LARGE OUTER MASS | 기존64baked청크 소비; 독립 수직 절벽 mesh/높이 미구현. |
| MEDIUM CONNECTION | 기존 연결·포켓 유지. 전체 route 재주행0. |
| GROUND CONNECTION | Three50°/height0/core1024→world1000 지면을 같은 main화면에 연결. |
| PLAYABLE/COMBAT | 실제 W이동·카메라 추적 확인. mapQA3조건이며 전투/loot/native6 인수0. |
| LANDMARK/CENTER·SMALL DETAIL | 배치/스케일/콜라이더/원PNG 수정0. |
| CAMERA QA | 시작·북쪽이동1280×720 PNG2 직접판독. 전체8view/대규모전투 카메라 미검수. |
| TECH QA | 최종CPU8그룹43조건PASS와 guard 전native3조건PASS는 별도epoch. 부분할당/부모GPU복사 예외/물리GPUfree UNKNOWN. |
| FILES/GIT | newmodule1+game자기hook+관련docs13. foreign game185B/WIP/ownerSTATELOG/protected2_3/기존23/save 보존. 정상commit/push·remoteexact은 완료영수증에서 별도확인. |
| VISUAL VERDICT | RETOUCH — 지면 연결만 확인. 평면 재질·높이·3D캐릭터·시작FX가림 미해결. |
| NEXT PASS | 실제 승인된1-1 outer mass/높이/foreground 계약 소비→main rig/발접지→SKILL/ENEMY/BOSS/UI/NPC/사운드 및 같은후보6단계. |

## ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007 — 본편 전사 표시 부분 연결

이 절은 본편의 현재 부분 채택 상태다. 앞선 terrain-only/독립 lab/읽기 계획에서 적힌 `main rig 0`·`actors3D 0`은 해당 epoch의 이력이며, terrain 모듈의 `actors3DAccepted=false`는 그대로다. 전체 플레이어·물리지형·본편 인수 완료를 뜻하지 않는다.

| 항목 | 현재 정확 계약 |
|---|---|
| 사용 범위 | `localhost`/`127.0.0.1`의 포트 `3387`, `ch1Three=1&ch1Rig=1`을 함께 지정할 때만 ON. 기본 OFF. stage `0`, 비보스, production smoothing, 전사 `_charIdx===0` |
| 본편 소비자 | `drawP`의 최종 본체 표시만 `_drawCh1PlayerRigBody`로 대체. `P.s==='idle'`의 `idle` 2프레임 / `walk`·`run` 8프레임. 실제 `P._sa.f`와 방향을 소비하며 phase=`(f+.5)/N`, 방향 순서 `s,se,e,ne,n,nw,w,sw` |
| 크기·발 | 기존 X의 카메라/캐릭터 배율·호흡·회전 유지. 48px 셀 중심에서 catalog 발 `(22,46)`으로 로컬 `(-2,+22)` 이동, reference `32`. `heightWorld` API 인수는 부모 **body-local** reference이며 새 지형 고도가 아니다 |
| 동작 시간 | `ROOT-CH1-RIG-ACTIVE-TICK-CLOCK-20261007`: 같은 P/map/class/scope에서 `delta(_gameFrame)*PHYS_STEP/1000`, `PHYS_STEP=1000/60`, 상한 `.05`초. 현재/직전 틱 모두 safe integer일 때만 계산하며 초기·교체·비활성·paused/hidden은 0. `_gameTime` 증가만으로 진행시키지 않으며 Rift/lesson guard를 draw에서 다시 호출하지 않음. 기존 `P._sa`·X breathing 정지 계약은 바꾸지 않음 |
| 가림 고스트 | DS/Border 기존 1회 제한 유지. 같은 `_now`/map/P/animator/class/generation/publication/canvas `_glVer`에서 복사한 6개 X 행렬과 동일 canvas/rect를 재사용. 추가 `rig.update`·renderer render·translate/scale 없음. 이번 native `ghostFrames=0`이므로 실제 가림 인수는 미완료 |
| 폴백·미채택 | 로딩/실패·공격·사망·특수 상태는 기존 아틀라스. 실버테일은 방향별 packed rounding/padding 보정 미확정으로 본편 채택 보류. adapter API의 silvertail/attack 지원과 본편 채택은 별개 |
| 보존 | P/G/전투/충돌/AI/DS/Border/그림자·원PNG/scene/nav/사용자 save/보호2_3/Q전용 규칙 불변. 독립 actor canvas이며 완전 3D 모델이나 높이·경사 구현 아님. 실제 보상/save·청취·native6·A급 미인수 |

소스: `tools/2_5d/ch1-player-rig.mjs` **12712B / acc523025d9a56d5e777a2cf5b4145172d57b21ba7f35d4f5e535d4b19ebac0e**. 최종 checkout `game.html` **4057058B / c0176bfa3f012187972b3b1b9170d44149f5afd21ffac81abf376fec6293b007**. Git에는 HEAD+root 소유 hook의 **4056873B / a291ee71f7b02e7b7dacd4045161ddcfb5b311fdd496c231f71b6f7d4ce845ce** blob만 보존한다. 기존 foreign 185B 차이는 checkout에 남기며 채택하지 않는다.

검수 epoch를 합산하지 않는다. 최초 adapter CPU는 3그룹·13조건 PASS 뒤 maxX 단독 변형 오라클 FAIL1/후속8그룹 미도달/exit1이었다. 실제 minX와 maxY가 변했으므로 오라클을 바로잡은 **별도 제한 후속 9그룹·48조건 PASS/FAIL0/미도달0/exit0**를 보존했다. 원 하네스·원 FAIL은 그대로이며 첫 stdout 파일 미보존도 명시했다. 실제 이미지 factory/GPU는 이 CPU의 통제 rig와 별개다.

새 native **1 Chrome/context/page, 5조건 PASS/FAIL0/미도달0/exit0**: 실제 본편 idle→W 이동(run)의 방향/phase 소비, P.y `7420→7346.907759999999`, run frame `2`/phase `.3125`/direction `4`, 동일 map/source7핀, actor canvas `53×53`의 alpha>16 픽셀 `356`/bbox `(18,6)…(37,36)`/GL0, trusted pagehide rig·renderer dispose 각1. mutation POST1은 차단되어 서버 도달0. 이 native의 main 소스는 clock 보정 전 **4056765B/d67cbeb3ac94afec3f9da56b2b0997e39a3ce0aa0aac0980302dd16780ef9139**이며, 최종 clock guard는 별도 CPU 경계 검수로 구분한다. 보정 후 Chrome 추가0.

근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-player-rig-20261007/`의 `implementation-receipt.json`, `main-implementation-receipt.json`, `clock-guard-implementation.json`, `cpu-first-failure-receipt.json`, `cpu-limited-final-receipt.json`, `native-player-result.json`, `main-hook-static-review.json`, `visual-verdict.json`. 원화 확대 흐림·실높이·절벽/전경·시작 금빛 효과의 몸/발 가림이 남는다. **VISUAL VERDICT: RETOUCH**. 다음은 실제 발 투영·전경 접합·클래스/특수 동작 보정과 같은 후보의 전투·획득→보스 개방→사망·부활→재도전 인수다.

Clock 첫 CPU는 7그룹·37조건 PASS 뒤 직전 fractional invalid 틱 `100.5→101`에서 `.008333333333333333`이 전달되어 기대0 FAIL1/잔여4조건 미도달/exit1을 보존했다. 실제 `_gameFrame`은 정수이며 이 실패는 통제 invalid 경계다. 최종 소스에 `Number.isSafeInteger(previous.frame)` 조건을 추가했고, 원37PASS를 반복하지 않는 실패1+잔여4 한정 검수로 분리한다.

최종 c0176bfa 소스의 별도 clock 제한 CPU는 실패1+잔여4만 **5조건 PASS/FAIL0/미도달0/exit0/source 전후 exact**로 완료했다. 원37PASS와 합산한 clean42PASS로 표시하지 않으며 native5조건과도 별개다. 추가 근거는 `clock-guard-cpu-receipt.json`, `clock-invalid-implementation.json`, `clock-guard-limited-receipt.json`이다.

### ROOT-CH1-1-WARRIOR-STRIKE-RIG-20261007 — 본편 전사 LMB 베기 표시 부분 연결

기존 production3387 opt-in의 동일 map/P/camera/X 안에서 전사 LMB-origin 베기 본체만 부분 대체한다. terrain/geometry/충돌/전투 권위는 그대로다.

정확한 origin·atlas gate·셀·phase·anchor·미채택 상태는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 sparse guard의 새 한정 CPU는 6조건 PASS/FAIL0/미도달0/exit0이며 최초 공격 CPU100PASS·1FAIL은 별도 보존한다. root가 인계한 동일2a052 소스의 새 main native는 Chrome/context/page 각1, 실제 LMB east/index2의4조건 PASS/FAIL0/미도달0/exit0이다. 실제 atk2 f2/phase2.5÷9/609vertices/canvas85×85/alpha>16픽셀581/GL0, 현재 owned LMB-origin1을 관측했고 wRecover에서 bodyCurrent=false, idle 복귀 owner=null을 관측했다. pageerror/httpfailure0 및 POSTmats1 차단/서버도달0이다. W setup1300ms 입력 중 xy4020,7420이 변하지 않아 이동 성공을 주장하지 않는다. root PNG 직접 판독은 main 시작 금빛FX가 몸·발을 가리고 격리 공격 그림은 보이는 상태다. VISUAL VERDICT: RETOUCH. 실제 발·native8방향·회수 rig·DS ghost·native6·audio·save는 미인수다. 이전 idle/W native5 및 clock5 CPU와 합산하지 않는다.

최초 공격 CPU는 2a052 epoch에서9그룹 도달/8그룹 완료/100조건 PASS·1FAIL/exit1이었다. native.every가 sparse hole(index8)을 건너뛰어 잘못된 배열을 허용한 반례를 원 result.json에 동결했다. 최종8a4e 소스는 i0…8 직접 for-loop와 Object.hasOwn(native,i)로 각 셀의 실재 own index를 요구한다. 최초100PASS를 재실행하지 않은 sparse 한정 후속은 6조건 PASS/FAIL0/미도달0/exit0이다. hole8·hole0·hole4·inherited-only4·own undefined8은 렌더0으로 차단했고 dense 대표 n/f4는 phase.5/anchor(0,18)/단회 렌더를 유지했다. 앞선 native4PASS는 2a052 소스의 결과이며 최종 own-index guard의 native 검수는 미실행/추가Chrome0이다. clean 전체 PASS로 합산하지 않는다.

검수 원문은 외부 ch1-main-warrior-attack-20261007/validation-receipt.json에 epoch별로 보존한다. 최종 game SHA는 8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2, sparse 한정 원문은 9440B/637d3d33c0c3d861c3902f3da808ca07d5ffa1e8c588beefde14c4b9dcdc9f7a이다. docs 전체 무제외 관련 검색45경로 중 현재정본13을 동기화하고 역사·타모드·owner WIP·보호2_3의32경로는 그대로 보존했다.

### ROOT-CH1-NATURAL-SPAWN-VISIBILITY-20261007 — 최종 소스의 새 실화면 관측

앞선 2a052 공격4조건/금빛FX 가림과 별개로, 최종 game4058588B/8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2에서 새1Chrome/context/page·3조건 PASS/FAIL0/미도달0/exit0을 관측했다. 기존 공격4조건·CPU100PASS1FAIL·sparse 한정6PASS를 재실행하거나 합산하지 않았다.

실제 LMB 후 W 입력 동안 document focus=true/BODY, BINDS.up=KeyW, trusted keydown/up, K/KH=true→false, frame57→137을 기록했고 P.y7420→7200.653340000013으로 이동했다. 이번 관측은 정상 이동의 한 사례이며 이전 W 무이동 원인은 여전히 UNKNOWN이다. G._bonfire.t243→0/frame57→300의 자연 종료를 기다렸으며 FX·시간·위치 강제 변경0이다. 최종 own-index guard의 정상 dense 공격 한 장면도 본편에서 도달했다. sparse/inherited 음수 경계는 CPU6조건 범위다.

root가 자연 종료 후 idle/strike PNG2를 직접 판독했다. 전사의 몸과 하단 다리·발 주변은 해당 pose에서 식별되나 평면 baked 지면·공격FX/인접 적 가림은 남는다. VISUAL VERDICT: RETOUCH. 전체 동작의 해부학적 접지·8방향·회수 rig·DS ghost·실높이·같은후보 native6·청취·실보상save·A급 인수는 미완료다. 원 source/PNG/scene/nav/세이브는 보존했고 POSTmats1은 서버 도달 전에 차단했다.

외부 원문: ch1-main-warrior-attack-20261007/natural-visibility/result.json36127B/287d70769f01f02651e9aec4a4b2911a03f6898c1125fa05649376b29acd3f53. 이 별도 관측은 기존 코드 완료18cc60d5806c8e82c0295e1bdbbb50ba89d00278에 대한 추가 증거이며 새 제품 코드 변경0이다.

### ROOT-CH1-LOBBY-OPTION-CARRY-20261007 — 로비 왕복의 명시적 2.5D 옵션 전달

3387에서 실제 로비 진입을 거쳐 기존 main terrain/rig opt-in을 요청할 수 있도록 URL 전달 경계를 연결했다. scene/map/P/camera/terrain/전투 권위 및 각 consumer gate는 변경하지 않는다.

정확한 전달 key·host/port·첫값/target-key 우선·미전파·원래 저장/지연 수명은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 동일 completion 절을 따른다.

신규 carry CPU는 실제 showCharGate/goToLobby 함수 전체를 추출한 통제 VM의 최초1회로7그룹·25복합조건 PASS25/FAIL0/미도달0/setup0/exit0이다. source2 전후 exact 및 원 working 원문 역치환 exact를 보존했다. 옵션·host/port·중복 첫값/특수문자·demo/test/normal/story·stale·활성화 실패·save await 후 이동/저장 실패 뒤 이동/죽음 복구 후 save·두 실제 함수의 통제 왕복을 확인했다. CPU 전 별도 준비 읽기의 zsh optional-wildcard 오류는 제품/CPU 실패가 아니며 최초 하니스 재실행0이다. 실제 로비→게임→로비→게임 자연 입력·실제 save ACK·전체 native6·청취는 미인수다. 기존 rig/attack CPU·native 숫자를 재집계하지 않는다. 근거는 동일 외부 폴더의 cpu-receipt.json5520B/5d404e0940578fce4e806dd2f3be6054423653a9b3732c9e1b381e3a83f187d3와 result.json32935B/54f24ec8d4751a72b19ed756cc261b91486ac7344111549f2fd13b22aa84bb1a이다.


### ROOT-CH1-LMB-RECOVERY-RIG-20261007 — 정상 LMB에서 승계한 회수 본체 표시

동일 map/P/camera/기존 X에서 정상 LMB의 atk3 회수 표시만 확장한다. 기존 terrain·DS/Border·shadow·camera/geometry는 유지하며 회수 ghost도 이미 그린 같은 canvas/matrix만 재사용한다.

정확한 owner phase/정상 전이 승계/특수·acceptedQ revoke/atk3 gate/회수 counter는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

이번 source523a recovery CPU는 실제 main 함수/전이/Q 취소와 통제 animator·side-effect port를 소비한 최초1회6그룹42복합조건 PASS42/FAIL0/미도달0/setup0/exit0다. finisher는 revoke 전이 prefix만 실행했고 실제 PNG/renderer/GPU/save는0이다. 별도 신규 native는 같은 최종 source의 실제 본편 Chrome/context/page 각1회,3조건 PASS3/FAIL0/미도달0/exit0다. 실제 LMB→wRecover/atk3 f6→7→8·phase6.5/9→7.5/9→8.5/9·owner recovery·609정점·heightLocal32·alpha>16 579픽셀·GL0와 실제 idle 복귀/owner null을 관측했다. source8/같은 map exact, pageerror/HTTP실패0, POST /api/mats1은 서버 도달 전 차단, 사용자 save 조작0·owned browser 닫힘이다. CPU42와 native3 및 기존 carry25/strike4/과거 FAIL·한정 결과를 합산하거나 재실행하지 않는다. root PNG2 직접판독은 현 east pose의 회수 몸 표시/대기 복귀만 한정 인수했다. 검기FX 몸·발 부근 가림, 회색 평면 baked 지면/배경 확대 흐림이 남으므로 VISUAL VERDICT: RETOUCH다. 해부학 발/8방향/실DS ghost/높이/전체 native6/청취/실보상save/A급은 미인수다. 근거: 외부 recovery/validation-receipt.json2702B/4fc6af74bf6ffae5140d9e1648937093cf2741735f994baaf7ab82f79daea9c2, cpu-receipt.json9965B/50b6e6e80c21ef3595cc6ab9afec37e07e9db3831eef9352c9bebb47a47723c6, native-result.json102950B/26a12f81168296c6b9b5130a69180c46f17a0b78f3e1083aa6765b97b84d09de, visual-verdict.json2514B/c78360ecf19835709c4f87d3d683c77d88b2632d3b93c9b44507ac2398a3ec91.

MAP PRODUCTION REPORT (§23)
STAGE: CH1-1/main 전사 정상 LMB 회수 표시 부분.
MASTER PLAN: 기존 guidev0.9/현재 stage LOCK·SSOT 순서 보존.
LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION: geometry/nav/충돌/원PNG/지면 수치 변경0.
PLAYABLE / COMBAT: 기존 정상 wSwing→wRecover 표시 승계만 연결. 전투 판정/소모/시간 변경0, 새 실제 LMB→회수→대기 한 방향 표시만 관측; 전체 자연 전투/보상은 미인수.
LANDMARK / CENTER / SMALL DETAIL: 배치·맵 디테일 변경0.
CAMERA QA: 새 회수8방향·발/가림 미인수.
TECH QA: 새 recovery CPU6그룹42조건PASS와 별도 actual main native1Chrome/3조건PASS, 모두FAIL·미도달0; 이전 검수 숫자 재집계0.
FILES / GIT: root 소유 game hook+관련 현재docs만, foreign185B/3.3 사용자 WIP 및 owner/보호 문서 보존.
VISUAL VERDICT: RETOUCH — 현 east 회수 몸/대기 복귀 표시만 관측; 검기FX 가림·배경 확대 흐림·평면 재질 남음.
NEXT PASS: 실버테일 packed frame 연결·다크드루이드 body seam·발/가림/지형 입체감 및 전체 전투→획득→보스개방→사망/부활→재도전 인수. 통과한 새 회수 검사 반복0.


### ROOT-CH1-SILVERTAIL-PACKED-MAIN-20261007 — 실버테일 본편 packed 대기·보행 표시

이 절은 이전 warrior/strike/recovery 및 public1254 고해상도 시험 epoch 뒤의 새 본편 소비 범위다. 이전 소스 핀·검사·실버테일 채택 보류 기록은 당시 결과로 보존하고, 현행 main packed 소비에는 이 절을 우선한다.

| runtime 접점 | 현행 계약 |
|---|---|
| scope | class1 localhost/127.0.0.1:3387의 명시 ch1Three=1&ch1Rig=1(기본OFF), P.hp>0/P.s=idle/stage0·비보스·production smoothing에서만 실제 최종 native idle2/walk4/run4 48×48 셀을 빌려 표시한다. |
| 권위 상태 | 같은 P/G.map/P._sa/img/fm/native배열/f 및 atlas generation 소비. 대체 map·fixture·자체 simulation 없음 |
| body transform | reference45/anchor24,47·기존 body X 내0,23. 기존 .65/_pScale 및 breathing/camera transform 재사용·중복배율0 |
| clock | class1도 같은 active-tick Δ_gameFrame*PHYS_STEP/1000 cap.05; 정지/hidden/initial/identity 경계0. _gameTime clock 신규사용0 |
| ghost | 기존 같은프레임 canvas/rect와6원소 X matrix/publication/generation 재사용. 두 번째 rig update/render0. 실제 DS ghost 미인수 |
| map | geometry/collision/nav/outer mass/카메라·P.x/y 수정0, Silvertail 공격/특수/사망은native |

정확한 optional API·세 소스 핀·공통 경계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 source의 새 main currentness CPU3그룹15조건 PASS와 actual factory/adapter 한정 CPU9그룹39조건 PASS는 별도 epoch다. 첫 실제 main native Chrome/context/page 각1의3조건 PASS 및 trusted W 이동/대기복귀를 관측했다. 최초 CPU 오라클FAIL2개 이력과 최종 pageErrors SecurityError1을 보존하므로 전체 clean PASS로 합산하지 않는다. 이 오류는 main3check 뒤 about:blank와 무조건 classseed localStorage source상 하니스 cleanup으로 추정되지만 직접 stack/시점 귀속은 미관측이다. root PNG2 직접 판독은 몸 표시/이동만 한정 인수, 전체 VISUAL VERDICT: RETOUCH. 실제 클래스선택 UI·해부학적 발·8방향·공격/특수/사망 rig·live DS ghost·전체 native6·청취·실보상save ACK/A급은 미인수다.

최초 main VM은6그룹 중52조건 PASS 뒤 P4scope의 suspend1 기대 오라클FAIL1/후속P5·P6 두그룹 미도달/exit1이었다. 실제제품의 packed retire와 기존scope fence가 idempotent suspend2를 호출하므로 오라클한정 expected2로 정정; 별도P4/P5/P6의3그룹6조건 PASS/FAIL0/미도달0/exit0. 원52재실행0·clean58합산0·이 오라클로 인한제품수정0. 이후 읽기에서 발견한 별도currentness 접점을 최종main/adapter에서 보강했다.


| 최종 currentness 보강 | 정확 범위 |
|---|---|
| adapter live native | 같은 animator여도 own anim/f, fm의mode_direction 배열 identity/정확 count/선택 cell identity와 own crop x/y/w/h가 captured source와 같아야 publication/render를 유지 |
| main live frame | _ch1RigPackedFrameCurrent가 현재 P/map/atlas/animator와 native direction/mode/f·배열/count·selectedcell/crop을 확인. snapshot/publication을 parent blit 앞에서 검증 |
| ghost | packedOwner+packedCapture를 가진 class1 sameframe ghost는 adapter snapshot 전후 live frame 현재성을 모두 확인. 기존 canvas/matrix 단회 재사용 |
| blit 이후 | 이미 완료한 synchronous drawImage 뒤 scope/프레임 변화는 ghost publication만 retire하고 returntrue하여 legacy 본체 중복 draw를 요청하지 않음. 완료 pixel rollback이나 parent silent GPU upload 검증은 UNKNOWN |

최초 main CPU52PASS·오라클FAIL1 및 별도limited6PASS는 보강 전325e/bc6f/e1f1 epoch 이력이다. 최종525d/8de8 소스의 새 guard/combinedCPU/native 결과와 합산하거나 최초실패를 지우지 않는다. 최종 검수는 아래 별도 epoch 결과로만 인수한다.

최종 검수는 main15/combined한정39/native3을 별도 계산하며 원52·12와 각각오라클FAIL/한정6 및 최종SecurityError1을 보존한다. native idle7(SW)/run4(N)·trusted W y7420→7336.933640000013→idle와borrowed480×1136/48²/609정점만관측, classseed사용으로실제class선택UI미인수. root PNG2몸/이동한정·전체RETOUCH, exit0은전체browsercleanPASS가아니다. SecurityError는about:blank/classseedsource상cleanup추정일뿐직접귀속未관측. 정확epoch·원문핀/종료오류/미인수는 DIRECTIONAL 동일completion절을따른다.


## 2026-10-07 다크드루이드 NORMAL 본체 borrowedSheet 소비 — ROOT-CH1-DRUID-NORMAL-MAIN-20261007

| 계층 | 현재 계약 |
|---|---|
| 맵 권위 | 기존 G.map/ens와 stage0만 관측. production_finish/smoothing field200×200와 _bossArena128×108; geometry/nav/collision/좌표/카메라 변경0 |
| scene owner | G/map/ens/arena/mw/mh identity로 scene를 교체. actor 제거·death/phase/lastStand/defeated/revive pending/live-band/intent 변경으로 owner/lifeGeneration 교체 |
| image lease | image native decode+source fingerprint+src/srcset/sizes observer/takeRecords, scene+owner+life+sheetRecord binding. pending deadline30000ms/noRAF/timer,동일 미정산/실패 binding 재요청0 |
| frame 권위 | 기존 native selector가 정한 frame/crop/direction만 전달. exact selectedFrame·state·sheetRecord/img·imageGeneration currentness를 adapter와main pass경계마다 재확인 |
| 부모 공간 | 기존 translate(e.x,e.y+tdY−6+breath),inverse_btScaleMul·dw9.3r/dh14.1r 보존. heightWorld=dh×ref/ch,scaleX=dw×ch/(dh×cw),anchorLocal=(−dw/2+ax×dw/cw,−.86dh+ay×dh/ch) |
| frame 재사용 | adapter canvas,left,top,width,height를 source-over+lighter2의 기존3pass에 재사용. 성공한 synchronousblit 후 stale이면 후속pass 중단·legacy 중복draw 없음; 이미그린pixelrollback UNKNOWN |

상세 API·source3 전체 핀·검수 epoch와 한계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다. 맵 제작 순서/LOCK/SSOT를 이 표시 접점이 덮어쓰지 않는다.

| 최종 복수보스 guard | 현재 실제 제한 |
|---|---|
| `_ch1DruidSingleBoss()` | ens의 own-data `ib===true` 멤버가2개 이상이면 Druid rig scope 전체를 거부해 해당 보스 본체를 모두 legacy로 유지한다. 한 보스만 임의 우선 표시하지 않으며 다른 player/terrain adapter의 gate를 바꾸지 않는다 |
| count 경계 | 살아 있는 보스만 세지 않는다. dead/revive pending companion도 ens에 남은 ib 멤버이면 계속 거부; 제거 후에만 단일 scope 재진입 가능. ib가 아닌 일반몹은 count에서 제외 |
| 원인/보존 | 공용 HTMLImage lease의 복수 owner starvation과 단일 Druid adapter 공유를 코드 검토로 확인해 최소범위 제한. 여러 보스 rig 동시 지원은 미구현/미인수이며 기존 전투·생성·부활·ens 구성 변경0 |

| 검수 epoch | 실제 결과와 한계 |
|---|---|
| factory 새 CPU | 최종 factory c6dd source의 실제 factory/catalog/Three 수학·609정점/12본, 통제 HTMLImageElement getter. 최초1회 7그룹36조건 PASS, FAIL/미도달/setup/unhandled/cleanup0, exit0. native image/decode/PNG/GPU/main0 |
| combined adapter 새 CPU | 최종 modules c6dd/27dd의 실제 전체 factory+adapter/catalog/Three와 통제 Image/renderer. 최초1회 6그룹15조건 PASS, FAIL/미도달/setup/unhandled0, exit0; source4 전후 exact. GPU/PNGdecode/main0 |
| main 최초 guards CPU | b0c3 source의 실제 main 함수·원 pagehide statement 추출/통제 포트. 최초 Node1회/VM13개, 11그룹31조건 PASS, FAIL/미도달/unhandled0, exit0; game 전후 exact. 최종 복수보스 가드 이전이며 구31 재실행0 |
| native 최초1회 — 가드 전 | b0c3 source 실제 Chrome1/context1/page1의 기존 bosstest=0 testbed. 3조건 PASS, FAIL/미도달0, exit0. real HTMLImage/native decode2·ready2·failure0, idle base8와 normal attack887×1774·609정점/alpha127095·206083/GL0. pageerror/HTTP4040, POSTmats1 서버 도달 전 차단/user-save0. 실제walk0 |
| 최종 복수보스 한정 CPU | dd1d 최종 source의 실제 main 함수/통제 포트, Node1회4조건 PASS, FAIL/미도달0, exit0/source exact. 단일보스 admission,두보스 legacy,owner/observer revoke,pending companion·nonboss 경계만. 구31/native3 재실행0/추가Chrome0 |
| root PNG2 / 시각 | 가드 전 idle-main/resumed-main 직접판독: 정상 idle/attack 본체만 확인. 보스상단 camera 잘림·player/label/FX 겹침·평면 baked ground가 남아 VISUAL VERDICT: RETOUCH |

factory36/combined15/main31/native3/final-limited4를 하나의 clean 전체 PASS로 합산하지 않는다. native3와 시각은 b0c3 이전 source의 한정 증거이고 최종 dd1d source의 native 인수는0이다. 기존 bosstest=0에는 player boost/pillar removal 원동작이 내장되어 있어 정상 새게임→지역/게이트/보스전 전체 진행 인수0이다. 이전 warrior/strike/recovery/Silvertail CPU·native·실패·limited/cleanup epoch도 재실행·합산하지 않는다. 실제walk/native8방향·해부학발·DSghost·특수/사망·부활·보상/저장/audio·전체 본편/native6·물리 relief/full3D는 미인수다.

최종 근거는 외부 `druid-normal-main/validation-receipt.json`5368B/`dfdda24546843f67e2aff44b71d2770a46de4267a8aa29ef1089815c758fe5e1`, `visual-verdict.json`5420B/`3f6dcc7818ffe5e7d9a110d60d3baf62e995edb8129e3aae59b55e45cd161460`, `native-result.json`56979B/`70a55e20696a1b7fd4fd0ac8a5e8cea2204d5e8463622dc44de7893828ef1c92`, `multi-boss-limited-result.json`1043B/`88dc0a15ef1278ac3e25d4032cecb8ea695d69f7ff0f12ff30bfc3d9ff34171c`다. 최초main31/native3는 b0c3,최종한정4는 dd1d로 분리한다.

외부 `druid-normal-main/remote-preservation-receipt.json`는 root가 이 completion의 정상 commit/push 뒤 exact SHA·remote를 기록하는 보존 참조다. 정본문서에 자기 commitSHA를 순환 기입하지 않으며 이 참조를 현재 push 완료로 미리 주장하지 않는다.


## 2026-10-07 CH1 드루이드 단일보스 카메라 Y 프레이밍 — ROOT-CH1-BOSS-CAMERA-Y-FRAMING-20261007

기존 §11의 보스 중간점/zoom 및 과거 소스 줄번호는 그 조사 epoch다. 현행 camera 구간은 기본 추적 뒤 아래 opt-in Y 예외와 기존 CAM-CLAMP를 적용한다.

현행 `game.html` working은 4,082,515B / `a2fa7293ab4b14041d2d512fe7661f7b4d645f50985f6264f32c4bd15004fad2`, root owned HEAD+변경 blob은 4,082,330B / `2abd290f0deb4cb9fb0559b41d9925fdddb73e3c414c07b0a0a175a1c7cd16db`다. shared game의 타인 WIP185B를 그대로 보존한다. 이번 변경은 카메라 targetY 한 접점이며 기존 보스 시트·rig factory/adapter·원본 이미지·AI·충돌·전투·저장 수치를 바꾸지 않는다.

| 경계 | 현재 계약 |
|---|---|
| opt-in | `localhost`/`127.0.0.1`:3387의 명시적 `ch1Three=1&ch1Rig=1`; 기본 OFF, storage/schema 추가0 |
| 본편 범위 | 기존 `_ch1DruidScope()`의 stage0·smoothing·production_finish 범위 안에서 editor 아님, `G.on`, `_bossArena===true`, 현재 ens에 속한 단일 보스, NORMAL intent와 native animation/image/sheet ready일 때만 적용 |
| 시트 | slash/slam/windup 또는 DruidVolleyWind/Volley는 attack, walk는 walk, 나머지는 base8. 기존 선택 시트 ready 필요, 새 프레임 시계0 |
| 유지 | 기존 targetX, boss zoom0.80/일반1.0, dt 보간→정수화→최종 map clamp 순서 |
| 폴백 | field·si3/finale·특수 intent·dead/revive pending·복수 보스·no-opt-in·editor·소스 미준비·유효하지 않은 경계는 기존 targetY 유지 |
| 한계 | authored 본체 사각형+P.r 충돌원만 고려. 실제 alpha/플레이어 sprite/label/FX 또는 첫 보간 프레임 fit을 보장하지 않음 |

기존 테스트베드 P+lookahead/본편 보스 중간점 표·예제는 기본 추적 경로다. 아래 좁은 opt-in에서는 기본 targetY 계산 뒤 Y 허용 구간을 적용한다. targetX는 그대로이며 bosstest X를 무조건 보스 중간점으로 해석하지 않는다.

| 계산 | 현행 값/공식 |
|---|---|
| 보간 | `camSpd=1-pow(P.s==='dodge'?.85:P.s==='attack'?.95:.92,_dtSp)`; lookahead=`P.vx/vy*25`, smooth=`1-pow(.9,_dtSp)` |
| 기본 보스 추적 | `_btActive` 아님·살아 있는 bossRef이면 P/보스 각 .5 중간점+lookahead*.3; finale 기존 frame 우선 |
| 다음 zoom | `_czTgt=finaleFrame?finaleFrame.zoom:aliveBoss?0.80:1.0`; `_z0=G._camZoom||1`; `_zRate=1-pow(finaleFrame?(_czTgt<_z0?.88:.98):.94,_dtSp)`; `_zNext=_z0+(_czTgt-_z0)*_zRate` |
| 본체 | `_dw=cb.r*cs.dw`, `_dh=cb.r*cs.dh`; 현재 dw9.3/dh14.1 calibration 유지 |
| 기준 Y | `_mul=_btScaleMul||1`, `_off=_btOffsetY||0`, `_drop=cb._teleDropY||0`; `_base=cb.y+_off+_mul*(_drop-6)` |
| 호흡 | base8만 `_breath=abs(_mul)*2`, 그 외0. 부모 scale은 body 역scale과 상쇄하나 translation에는 남음 |
| 합성 bounds | left=`min(cb.x-dw/2,P.x-P.r)`, right=`max(cb.x+dw/2,P.x+P.r)`, top=`min(base-dh*.86-breath,P.y-P.r)`, bottom=`max(base+dh*.14+breath,P.y+P.r)` |
| intro | `_bar=_bossCine.active?VH*.1:0`; 활성일 때 위/아래 각각 최대 화면 높이10% 예약 |
| 맵 Y | half=`VH/(2*max(.3,_zNext))`, mapH=`G.mh*T`; mapH≤half*2이면 mapLo=mapHi=mapH/2, 그 외 mapLo=half/mapHi=mapH-half |
| 기하 구간 | lo=`max(bottom-(VH/2-bar)/zNext,mapLo)`, hi=`min(top+(VH/2-bar)/zNext,mapHi)` |
| 정수 구간 | `_loInteger=ceil(_lo)`, `_hiInteger=floor(_hi)`; 허용 정수 center가 있는 경우만 채택 |
| 유효성 | VW,VH,zNext,mul,dw,dh,P.r,targetY,camSpd,left,right,top,bottom,mapH,loInteger,hiInteger 모두 finite; VW,VH,zNext,mul,dw,dh,P.r,mapH 양수, `0<camSpd<=1`, `(right-left)*zNext<=VW`, `loInteger<=hiInteger` |
| 적용/oversize | 만족 시 `targetY=max(loInteger,min(hiInteger,round(targetY)))`, `_ch1CamFitY=true`. 가로 overflow·정수 구간 없음·비정상 수치이면 legacy targetY 유지. X 재중앙화/zoom 축소/맵·충돌 수정0 |
| 후속 정수화 | 이전Y를 `_ch1CamYBefore`에 보관하고 기존 camSpd 보간 후, `_ch1CamFitY`에서만 이전Y<targetY이면 ceil(Y), 그 외 floor(Y). flag false면 기존 `~~Y`; X는 항상 기존 `~~X`. 이후 기존 zoom/map clamp 순서 유지, 새 G 상태0. 첫 화면 fit은 별도 미인수 |

| 검수 epoch | 실제 결과와 인수 경계 |
|---|---|
| 최초044b CPU | 최초 Node1/VM60, 7그룹36조건 PASS/FAIL0/미도달0/exit0. 이 중 한계 관측은 PASS라는 이름으로 결함을 숨기지 않음: south130 상승 정착 bottom650.4 vs intro 가용하단648, 2.4CSS clip 반례를 발견 |
| 최초044b 미인수 | 첫 보간 screenTop−166.8352 vs intro72로 238.8352CSS 침범, 초기 zoom .988의 불가능 fit도 관측. 첫 보간/zoom 진입은 최종 directional rounding 이후에도 별도 미인수 |
| 철회된2306 CPU | 최초 한정1회 PASS0/FAIL1/미도달4그룹. `1/camSpd` 여유가 intro 허용 밴드보다 커 raw midpoint fallback, top−134.8352 관측. `ceil(lo+1/camSpd)`는 현재 계약에서 철회했으며 실패 원문 보존 |
| 최종a2fa CPU | 현재a2fa source의 최초 한정 Node1/VM53, 6그룹14복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 명시30case의 방향 정수화/정착 경계만 검증; south130 양방향 cam1954에서 top72.3648/bottom640.8, 단일 정수 band1954에서는 bottom648. universal/all-frame/actual alpha fit 인수0, 원36조건 재실행0 |
| 최초044b native | Chrome/context/page 각1, 기존 bosstest0 1280×720→1600×900 resize 2조건 PASS/FAIL0/미도달0/exit0; GL0·source5 exact·pageerror/HTTP failure0. 최종 directional rounding 전 이력이며 final native로 재사용하지 않음 |
| 최초044b 관측 | authored body+P.r snapshot 첫 screenTop81.8868/bottom591.0075, 둘째9.27929/518.39929, zoom 약.8000000034. rig quadTop80.5632/11.2104는 별도 read 시점 기하, PNG 동일 drawframe 인수0 |
| 최종a2fa native | 현재a2fa source의 최초 Chrome/context/page 각1, capture fit 1조건 PASS/FAIL0/미도달0/exit0, GL0/pageerror·HTTP failure0/source5 exact. trusted S 직후 delta130.0755였으나 90frame 뒤 보스가 약108 이동하여 capture delta54.5188; 고정 south130 native 인수0. 최종 authored top75.836074/bottom584.956853, rig quadTop73.97527은 capture 시점 관측만. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘; physical GPU 해제 UNKNOWN |
| 직접 PNG 이력 | 최초 PNG2에서 큰 머리 잘림 개선·본체 식별, 둘째 뿔 상단 가장자리 가까움. label/FX/플레이어 겹침·반복 어두운 baked 지면으로 전체 VISUAL VERDICT: RETOUCH. 첫 PNG intro 검정 bar와 snapshot active=false 시점차 미해결 |
| 최종 직접 PNG 판독 | root가 현재 capture PNG를 직접 확인: full antler/body 식별, 아래 player/green FX 겹침·반복 baked 지면이 남아 RETOUCH. state bar0인데 PNG 검정 bar가 남아 intro draw/state 정렬은 UNKNOWN |
| 미인수 | 고정 south130 native, 완전 alpha/전방향 fit, 첫 보간/zoom 진입, normal route, 모든 resize, anatomical foot, native6/audio/reward/save, 전체 성능 |
| fixture | 기존 bosstest0 playerboost/pillar removal 포함. 정상 진행의 보스 진입 인수0. CPU/native/visual epoch별 별도 계수, clean 합산0 |

외부 증거 디렉터리: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-boss-camera-20261007/`. 최초 `camera-cpu-final-receipt.json` 8,969B / `d68d0679bb77ed45769cf87bfe128525fe10e788ef075faefc1b1acf0eafd35c`, 원결과 `camera-cpu-result.json` 31,138B / `0f862be1ba96ec337b9e052e15995a8afd7427ee896eec0da67ea20151a37dd9`, 최초 native `native-result.json` 8,562B / `c92d3982da42549996f0c261bacf1cd1a91911d7f72b17a485ebeddfea36cc50`는 보정 전044b epoch다. 철회된 중간 코드의 `quantization-implementation-receipt.json` 1,689B / `d5683e0a66d7f33cf4ef32b65863c13270e1927d049cd70bd86c418d107c4ae5`에 inverse exact/foreign185 보존이 기록된다. 해당 `camera-quantization-limited-receipt.json`은 1,660B / `88d4179ca7739f7f5aca088ad3dc302175c2b2328ebd9a30f4f700fd0c9b580e`다. 현재 최종 `directional-round-implementation-receipt.json` 2,666B / `d1ff0383c339fc0cb1ef4610ca959a8f941332a4c0e82c4725e555815080197d`의 rs3/inverse exact/foreign185 보존을 따른다. 최초 visual `visual-verdict.json` 4,437B / `c8767f12ab4d3c5ca4ab4e2d22522ad506f04db450ba8326000779e064a96626`와 최종 검수는 epoch를 분리한다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA로 확정하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 관측 당시 checkpoint 전이며 deploy0이다.

최종 증거는 `camera-directional-limited-receipt.json` 1,194B / `ca55b57abcb6ca8dac42b1095bc6d0068e654d702788c7f558a7975190356e66`와 원결과 `camera-directional-limited-result.json` 27,932B / `eec9c743a15c2bbaf60aa67f95767676137927cac1a2dfe24a0b75e38f9c8f45`, `native-directional-result.json` 6,106B / `87217d74229d870ca564743d344da9dab690e11533b4e17a7ac30ac0caa2ee18`, `validation-receipt.json` 4,176B / `44b3be782d4c962d6bf2fcfefc3c7f7b4ef36d137e5ebd0ea63a8dc3e048521d`, `visual-verdict-final.json` 5,811B / `acf4a2165bb087d736815370ed1e55cca7485b73fe92f610d1b253d18411af2f`로 각각 보존한다. 최초044b36조건/native2조건·철회2306 FAIL1·현재a2fa CPU14/native1은 clean 전체 PASS로 합산하지 않는다.


## 2026-10-07 CH1 카메라 zoom과 마우스 조준 소비 — ROOT-CH1-CAMERA-MOUSE-AIM-20261007

카메라 projection의 입력 역변환 접점을 명시한다. 렌더 zoom의 하한 .3과 이번 CH1 입력 역변환 zoom을 같은 계약으로 취급하지 않는다.

현재 `game.html` working은 4,084,115B / `b3439a539397e73dcc929d565f172a720facdb282b654e741b9f495e8fc6e6f3`, root owned HEAD+변경 blob은 4,083,930B / `ae8244039d7ecc7383fc96076d7ad7bf9e17d7044330d8c0737a333240130073`다. 원래 타인 WIP185B를 보존한다. 이번 단위는 카메라를 바꾸는 대신 입력 좌표가 실제 현재 zoom을 소비하게 한다. camera framing·zoom 보간·시트·애니메이션·전투·AI·충돌·저장 수치는 변경하지 않는다.

| 접점 | 현행 정확 계약 |
|---|---|
| `_ch1MouseScene()` | editor 아님, 기존 `_ch1RigRequested` 명시 localhost/127.0.0.1:3387 동시 `ch1Three=1&ch1Rig=1` opt-in, `G.on`, stage0, smoothing, `assets/map/ch1/production_finish`, Array G.map. `_bossArena===false`·200×200 field 또는 `_bossArena===true`·128×108 arena만. default OFF |
| `_ch1MousePoint(rect,clientX,clientY)` | effective zoom=`G._camZoom||1`. 이 computed zoom이 positive finite여야 함. 0/NaN/undefined 등 falsy 원값은 `||1`에 의해1로 처리, truthy 음수/Infinity/비수치 값은 거부. 입력의 .3 cap은 없음 |
| 좌표 | screenX=`(clientX-rect.left)*(VW/rect.width)`, screenY=`(clientY-rect.top)*(VH/rect.height)`; x=`VW/2+(screenX-VW/2)/zoom`, y=`VH/2+(screenY-VH/2)/zoom` |
| point 검증/반환 | clientXY/rect left·top·width·height/VW/VH/computedzoom 전부 finite, width/height/VW/VH/zoom 양수, derived screenXY/x/y finite. 성공은 새 `{screenX,screenY,x,y}`, 실패 null. point 자체 publication0 |
| 전역 `_setMousePosition` guard | scope와 무관하게 clientXY/rect/VW/VH/rawXY finite·rectwidth/height/VW/VH 양수 검사. 실패 false, client/screen/effective mouse fields 변경0 |
| scoped `_set` | point 계산/검증이 모두 끝나야 clientXY·raw screenXY·effective xy를 게시. scoped point invalid이면 원자 publication0/false. GP inactive는 point.xy, GP active는 rawXY를 저장하되 point 검증 자체는 생략하지 않음. 성공 true |
| 범위 밖 `_set` | valid raw를 게시한 뒤 기존 `_syncDruidFinaleMouse()` 적용. 전역 guard는 원시 위치 검증이며 범위 밖 legacy/finale의 effective 좌표 수식 전체를 새로운 scoped point 검증으로 대체하지 않음 |
| scoped sync | `_gpActive` 또는 기존 screenXY nonfinite이면 기존 early return. 현재 rect와 저장 clientXY로 point 재계산; 실패면 screen/effective4fields 모두 유지, 성공이면 `_screenX/Y`와 x/y를 함께 갱신. resize·arena→field 잔여 zoom을 현재 값으로 소비 |
| 범위 밖 sync | 기존 demo 마지막 stage3 arena는 `max(.3,G._camZoom||1)` 역변환; 그 외 일반 화면은 raw 경로. finale의 기존 facing 갱신과 GP 덮어쓰기 방지는 유지 |
| 정상 mousemove/mousedown | `_setMousePosition(e)` true일 때만 `_setMouseFacing()`. 위치 invalid는 facing publication0; MB/MBjust arming·G.paused·listeningBind·브라우저 기본동작의 기존 권한은 그대로 |
| 패드→마우스 첫 이동 | GP active이며 `abs(movementX)+abs(movementY)>3`이면 기존 해제/`inputMode='kbm'`/cursor/`_gpClearAll()` 후, scoped일 때만 `_set` 성공→facing. 새 storage key0 |
| 유지 경계 | WASD는 저장 mouse facing을 덮어쓰지 않음. `_rootRiftBlock('facing')`·GP facing·피날레 facing·MB arming·키설정·Q/보호2_3·save 유지, 새 RAF/timer0·new G state0 |

`mouse.x/y`는 절대 world 좌표 자체가 아니라 기존 world 조준 계산용 effective 입력 좌표다. `_setMouseFacing`은 기존 `sx=P.x-G.cam.x+VW/2`, `sy=P.y-G.cam.y+VH/2`, `atan2(mouse.y-sy,mouse.x-sx)`를 유지한다. 따라서 scoped 역변환으로 screen offset이 현재 zoom으로 나뉘되, 기존 camera/world 원점·WASD/facing 저장 규칙은 바꾸지 않는다. scoped sync가 모든 일반 facing을 매번 재게시한다고 확대 해석하지 않는다.

| 검수 | 현재 상태/경계 |
|---|---|
| 신규 CPU | 현재b343 source의 신규 actual main 함수·실제 input callbacks VM 검수: 최초 Node1/VM24/DOM rect141, 7그룹28복합조건 PASS/FAIL0/미도달0/exit0. 통제 DOM/gamepad 경계이며 실제 GPU/하드웨어 gamepad 인수와 구분 |
| 신규 native | 현재b343 source의 최초 실제 main bosstest0 Chrome/context/page 각1, 3조건 PASS/FAIL0/미도달0/exit0. 동일 trusted mousemove의 effective point/facing 오차0; 같은 이벤트의 legacy 각도 오차는 −.3038275023834693rad. resize1280×720→1600×900에서 새 mousemove0·point 오차0·저장 facing 유지, trusted W 이동 중 저장 facing 유지. source5 exact·GL0·pageerror/HTTP failure0. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘 |
| visual | root가 실제 PNG1을 직접 판독: Druid antler/body 식별, 아래 작은 player·green FX 겹침과 반복 평면 baked 지면 남음. VISUAL VERDICT: RETOUCH. 그림의 보스 alpha 지점에 실제 공격이 적중한다는 pixel target hit 인수는 아님 |
| 이력 분리 | 이전 AIM read-only 계획의 구현0은 작성 당시 상태다. 현재 구현은 위 source핀과 실제 검수로 판단하며 옛 camera14/native1/105검색·공식원문 보존을 새 성과로 재실행/합산하지 않음 |
| 미인수 | 하드웨어 GP·arena exit 잔여 zoom의 native·normal route·boss lifecycle·shake/round/interpolation/alpha alignment·performance·native6/audio/reward/save. controlled CPU의 GP/arena exit 케이스를 실제 native 인수로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-camera-aim-20261007/`이다. `implementation-receipt.json` 4,493B / `045a27500ee5504a75440a7d913359badd5a0c72ed885352a8072bd5d9423c86`의 exact replacements/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 epoch checkpoint 전·deploy0이다.

최종 `aim-cpu-receipt.json` 1,124B / `f4a25b7ae304f8c4665d9f7f821ced2f89e23fbdeb8f168ae661cd39056b6c7c`, `native-result.json` 12,782B / `451a9070a4177502675978364ae877263d32ed7f6ba4e33ba98f216fa8dcf901`, `validation-receipt.json` 1,994B / `be8dc72efa2c1b886df9683a6f89ca7a4667ffd8fd9f05f9235c0d825ccf490e`, `visual-verdict.json` 4,764B / `22108e6e5e55733b0a4c83150f6ed31a791d3ce07900c29f85a94d8c740c593a`를 각각 보존한다. CPU28과 native3은 별도 검수이며 clean 전체 조건으로 합산하지 않는다. 0707 공식 raw6와 다음 retry 계획도 별도 원자료로, 이번 AIM 제품 인수에 합산하지 않는다.


---

## 2026-10-07 본편 출구 표시의 앵글러 완료 조건 — ROOT-CH1-EXIT-LABEL-DISPLAY-20261007

기존 §8 게이트 상태/로드 계약과 별개로, 본편의 표시 읽기를 한 helper로 통일한다.

표시용 `_bossGateDisplayOpen()`는 `!!G._bossUnlocked && (G.stage!==0 || !!G._fbDone)`만 반환하며 상태를 쓰지 않는다. CH1은 해금과 앵글러 완료가 모두 참일 때 표시상 개방이고, 다른 stage는 기존 해금 플래그를 따른다. 실제 진입·해금 생산자·지역 정화·전투·재도전·저장 순서는 변경하지 않는다.

| 소비자 | 새 읽기 계약 |
|---|---|
| 출구 `_gUnlk` 및 라벨 | `_bossGateDisplayOpen()` |
| 나무 `_drawPortalTinted` 개방 인자 | 같은 helper |
| 미니맵 `_mmDrawLock` 개방 인자 | 같은 helper |
| `_regionArrowTarget()` 지옥문 안내 분기 | 같은 helper |

지역이 있고 CH1에서 `_regionClearedCount()>=4`이지만 `!G._fbDone`이면 `지옥문 봉인 · 앵글러 목표 미완료` / `Gate Sealed · Angler objective incomplete`를 표시한다. 이는 완료 플래그 설명이며 앵글러가 살아 있다고 단정하지 않는다. 나머지 지역 N/4 및 지역 없는 맵의 80% 라벨은 유지한다.

실제 `checkRooms`는 CH1 `_fbDone` 거절 후 `_bossUnlocked`를 확인하는 기존 순서를 유지한다. 지역 4곳/80%/가드10% 해금 생산자, `_bossLoadPhase`, 재시도 스냅샷 키, save는 변경하지 않았다. 이번 helper는 localhost 또는 2.5D opt-in 전용으로 제한된 기능이 아니라 기존 본편 출구 표시의 CH1 조건 투영이다.

본편 `game.html` working 4088007B / `dd3e24dd9b02929e2e4a71cebc57c8b3362cc4a10bebfd667a17b1861f53192f`. HEAD+소유 변경 blob 4087822B / `f8104295b740a645bc233a3b78370d444a161fbe30ea25a78cfbec1d2585313b`이며 foreign 185B는 보존한다. Easy는 이번 변경 대상이 아니다.

상세 정본: `docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md`의 이번 후속 절. 외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/display-cpu-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/native-display-fixture-result.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/validation-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/visual-verdict.json`. Git 사실은 같은 디렉터리의 `remote-preservation-receipt.json`에서 정상 commit/push 및 원격 정확 SHA로 확정한다. 이 문서 안에 자기 commit SHA를 순환 기입하지 않는다.

<!-- ROOT-CH1-START-BARRIER-LAYER-20261007 -->

## 2026-10-07 시작 장벽 표시 계층 동기화 — ROOT-CH1-START-BARRIER-LAYER-20261007

**기존 표현의 epoch 정정:** 위 `2026-09-03 시작 화톳불 완전 안전결계 계약`의 `G._bonfire` 행(이번 추가 전 179행)에 있는 적용 위치 `포스트 렌더`는 source9230 이전의 호출 위치 기록이다. 현재 CH1 `stage===0`·비보스방·활성 `t>0`에서는 아래 early 예외가 우선한다. 초기화·안전구역·적 이격 계약의 수치는 바뀌지 않는다.

### 현재 표시 계약과 보존 값

이 변경은 기존 CH1 시작 결계의 표시 순서 조정이다. CH1 해당 scope에 전역 적용되며 별도 opt-in은 없다. 본체 원화·rig·시뮬레이션·안전구역을 변경하지 않는다.

| 항목 | 현재 값·적용 위치 | 보존·제한 |
|---|---|---|
| early 조건 | `G.stage===0 && !G._bossArena && !!(G._bonfire && G._bonfire.t>0)` | 이 조건에서만 base capture와 early 호출 |
| base 행렬 | `X.clearRect` 직후 native `X.getTransform()`의 `a,b,c,d,e,f` 또는 GPU `_mat()[0..5]`를 6개 scalar로 복사 | 배열/DOMMatrix 참조 보관0, DPR/SSAA 재곱0 |
| 표시 helper | `_drawBonfireBarrierScreen(a,b,c,d,e,f)` | `X.save()` 뒤 `try`에서 6인자 `setTransform`·translate·drawImage, `finally`에서 `X.restore()` |
| CH1 active 호출 | 기존 `_levelUpVfx` behind 및 `drawP()`보다 앞에서 배리어1회 | 기존 `drawP()` 추가0, 별도 RAF/timer0 |
| 그 외 호출 | `!_bfBeforePlayer`이면 기존 late helper1회 | 다른 stage/보스방의 기존 후반 위치 유지; expired/missing은 helper 내 무표시 |
| 중심 | `C.width/2+(G._bonfire.x-G.cam.x)`, `C.height/2+(G._bonfire.y-G.cam.y)` | 기존 좌표식 유지; 화면 중앙/줌/shake 전수 정합을 새로 인수한 것은 아님 |
| 시간·기본 반경 | `300f=5초`, `r=280px`, 기존 `t-=sp` | 생성/감소·적 이격·충돌·개방 권한 불변 |
| alpha | `Math.min(1,t/120)*.9` | 실제 RGB/postprocess 색 동일성 미인수 |
| 맥동·크기 | `1+Math.sin(_now/300)*.03`; drawR=`r*pulse`, size=`drawR*2` | 기존 수치 유지 |
| 이미지 admission | `_bonfireBarrierWarmDone && image.complete && image.naturalWidth>0` | 원 `sprites/bonfire_barrier.png`(1536×1024) 차용, 신규 이미지/원PNG 수정0 |
| 비용 범위 | CH1 early는 `_tDP0` 이전 및 옛 late `_pC1-_pC0` 밖 | wall/GPU시간·분류 영향·성능 개선 UNKNOWN |

### 검수 epoch와 실제 인수 경계

| 구분 | 실제 도달·결과 | 범위 |
|---|---|---|
| CPU 최초 준비 | 추출 준비 FAIL1, 조건0, 제품VM0, 8그룹 미도달, exit1 | 원문/원runner 유지; 제품 실패 또는 PASS로 바꾸지 않음 |
| CPU 별도 제한 | actual source fragments 8그룹·46조건 PASS46/FAIL0/미도달0, exit0 | 물리 Node 총2, 실제 source 검수 epoch1; 통제 X/G/C/Image 준비 port이며 full draw/main·GPU0 |
| 새 headed Chrome | 기존3387 Chrome1/context1/page1/maxLive1, 신규 phase3조건 PASS3/FAIL0/미도달0, exit0 | old suite0; CPU46과 합쳐 clean49PASS로 세지 않음 |
| active | 관측frame/관측전/관측후 `t=272/272/241`, current body publication blit1, 배리어 호출1 | PNG와 snapshot이 같은 draw라는 주장0 |
| fade | `t=88/88/56`, body1, 배리어1 | 감소 구간의 실제 표시 |
| expired | `t=0/0/0`, body1, 배리어0 | 자연 만료 뒤 무표시 |
| 오류·네트워크 | pageerror0/HTTPerror0; sourceHTTP4 exact(2파일×prelaunch/actual-body), local source2 전후exact | requestfailed5는 fonts 의도차단3+local intro abort2, intro 직접원인 UNKNOWN |
| API·종료 | savePOST0; 합성 `/api/mats` POST1, forwarded0, durableACK=false; context/browser 닫힘 | 사용자 save/backend 성공·durable reward 미인수 |
| 미인수 | GL UNKNOWN, audio0, native6=false, physical GPU해제 UNKNOWN, 정상 보스방 route·해부학 발·전체 A급0 | postprocess 색·줌/shake/SSAA 전수·성능 UNKNOWN |

직접 PNG 판독의 한정 결과는 **현재 시작 본체가 active/fade 금빛 장벽 위에서 식별되고 expired에서 장벽이 없어짐**이다. 반복된 회색 baked 바닥, 큰 펫 대사/그림, 주변 적·라벨·FX 점유는 남아 있다. 몸 가림 개선만 인수하며 전체 **VISUAL VERDICT: RETOUCH**를 유지한다.

### 정확 source·증거·검색 범위

| 자료 | bytes / SHA256 |
|---|---|
| 현재 working game.html | 4,090,587 / `9230a686ed148891309132f8da3c1e5f67bac1d74d774b3f5a9cb2e33afbd489` |
| ROOT owned game.html | 4,090,402 / `eefa78a08219cf1a56813d670513df05c3263ac7f039825d4048888e5e26742a` |
| parry-lesson.js(변경0) | 52,747 / `f7113a41be241a5510ad84109bc55dc418f140dfc880857b1267171bbb624121` |
| D/implementation-receipt.json | 1,771 / `0090e55a8e65b5ba5af6b0d3fbe634fa9b33196b4ddac86e2c5ee024882a50d3` |
| D/cpu-limited-receipt.json | 9,521 / `38a674f8786a9d9fc572d54cfb378a44830643967baecfca9d62cccd0960ef08` |
| D/native-first-only/result.json | 4,699 / `461d2783be8f5e5e98a2628a2a08ccad4a319813d9ad305013eb371b7beec95d` |
| D/validation-receipt.json | 5,902 / `58793ba797c13018c7d574c584a07c119bda71724c058c0791ed7bfcfa7173a9` |
| D/visual-verdict.json | 3,347 / `c6e34859e27c019c69d763219b34c466a7a499c8c6f1cc791caa7cbfa7919199` |

D=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-start-barrier-layer-20261007`. 실제3PNG=`D/native-first-only/active.png`, `fade.png`, `expired.png`; ROOT 직접판독3장 및 문서 동기화 담당도 저장 PNG3장 읽기만 수행했다. 이 문서 작업의 CPU/Chrome/입력 재실행0.

관련 검색1회는 eligible text1,016(그중 Markdown817), 매칭44path/82행/85occurrence이다. 관리 STATE/LOG8개(그중 Markdown4)와 보호2_3 본문은 제외했으므로 `docs 모든 파일 무제외 검색/전수 본문읽기`로 부르지 않는다. binary/archive258 분류는 이미지·압축·docx251 및 Python4·HTML백업3을 포함하며 전부 binary라는 뜻이 아니다. 일반 Markdown이 이258 목록에서 누락된 경우는0. 검색 원문은 `D/docs-plan/docs-related-keywords.raw.jsonl` 71,338B/SHA256 `402e632e65efe52fd91be01b00d46148909632ebeed95245ac66fa7cb1173bbc`, 영수증은 `D/docs-plan/search-receipt.json`이다. 역사 raw/과거 검수는 해당 epoch으로 보존한다.

working game의 foreign185B는 미채택 그대로이며 3.3 foreign2,948B·STATE/LOG·보호2_3·원PNG/scene/nav/장비·save는 이번 문서 소유 밖으로 수정0이다. 선택 GOALS 문서는 이번10개 소유에서 제외한다.

### MAP PRODUCTION REPORT — 가이드 §23

| 항목 | 이번 범위의 사실·Gate |
|---|---|
| STAGE | 실제 CH1-1 기존 후보 시작 장벽의 본체 앞/뒤 합성 소비. 새 지형·원화 제작 없음 |
| MASTER | silhouette/regions/main route/side spaces: 모두 기존 권위 유지 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 불변; major holes 이번 해결 대상0 |
| LARGE | source assets: 기존 barrier/맵 PNG; composites: active CH1 장벽 뒤 본체; overlap: current active/fade 본체 식별 한정 개선; repeated silhouette: 반복 baked바닥 미해결 |
| MEDIUM | connections 불변; remaining holes 별도 검수/해결0 |
| GROUND | shadow/contamination 불변; structure integration: 평평한 baked 지형 한계 유지 |
| PLAYABLE | main arenas/travel/breathing/threat space 불변; combat readability: 시작 본체 가림 한정 개선, 라벨/펫/FX 겹침 RETOUCH |
| LANDMARK | primary/secondary/tertiary 배치·원자료 불변; 새 랜드마크 시각 인수0 |

| CAMERA QA 8뷰 | 현재 관측 |
|---|---|
| START | active/fade/expired 3phase 실제 PNG에서 한정 판독 |
| EARLY | 같은 시작점 세 phase만; 다른 초기 지역/줌·shake/SSAA 전수 미인수 |
| ARENA | 기존 late source 조건은 제한 CPU; 새 arena 실제화면0 |
| SIDE L | 신규 관측0/UNKNOWN |
| SIDE R | 신규 관측0/UNKNOWN |
| LANDMARK | 신규 관측0/UNKNOWN |
| LATE | 신규 관측0/UNKNOWN |
| EXIT | 신규 관측0/UNKNOWN; 정상 보스방 route 개방 미인수 |

| TECH QA | 사실·한계 |
|---|---|
| route | 경로 변경0; 별도 정상B는 부분 필드 관측, 6단계 완료 아님 |
| collision | 원300f/r280 안전구역·nav·충돌식 불변; 신규 전수 충돌 QA0 |
| pageerror | 새 headed phase3 run0 |
| 404 | 새 run HTTPerror0; requestfailed5는 별도로 보존 |
| seam | 새 원화/맵 seam 변경0; 전수 시각 seam 개선 인수0 |
| loading | warm/image gate 제한 CPU, 실제 sourceHTTP4/local2 exact; intro abort2 직접원인 UNKNOWN |
| performance | 신규 시간/비용 인수0, early CH1 비용은 옛 late 측정 범위 밖; GL UNKNOWN |
| FILES | stage-owned: ROOT game 표시 hunk 및 지정 동기화 docs10; concurrent touched: game foreign185/3.3 foreign2948 미채택 보존; unrelated touched: 이 문서 작업0 |
| GIT | staged/commit/push는 ROOT 완료소유 checkpoint 예정, 이 담당 Git쓰기0·새 commit SHA 추정0; deploy0 |
| VISUAL VERDICT | **RETOUCH** — 시작 본체 가림 개선 한정, 전체맵 A급/정상 route 완료 아님 |
| NEXT PASS | 정상 route의 실제 지역80%+담당Angler→개방→보스전→death/retry·장비/회복을 같은 후보에서 이어 관측하고, 별도 zoom/shake/SSAA·postprocess색·라벨/FX 및 지형 가독성 Gate를 통과해야 함. 자동 재검사·임의 원화/geometry/nav 수정0 |

## 2026-10-07 지역 목표·앵글러·게이트 사유 HUD — ROOT-CH1-REGION-PROGRESS-HUD-20261007

현재 변경은 Main CH1(stage0)의 필드 HUD 표시 6개 hunk다. 보스방 권한·지역 정화 상태·전투·저장·맵 geometry/nav/원 PNG를 바꾸지 않는다. 3387은 새 검수의 격리 실행 주소이며, 소비자 자체를 3387 opt-in 전용으로 한정하지 않는다.

### 현재 계약과 기존 설명의 범위

이 문서의 이전 전역 `killCnt=_stageKills/_totalSpawned` 설명은 이전 epoch 또는 현재 지역이 없는 폴백에 해당한다. 현재 지역이 있으면 기존 `min(r.kills,r.total)/r.total` 값을 그대로 유지하고, 새 설명 leaf만 3줄로 갱신한다.

| id/위치 | 값·순서·적용 범위 |
|---|---|
| `_updateRegionKillLabel(r)` | `#hudKillLabel`/`#killCnt`의 `children.length===0` 확인; 자식 컨테이너 교체0 |
| active | 두 leaf + `G.on && G.stage===0 && r && !G._bossArena && !(G._bossLoadPhase>0) && !G.stageCleared && G.bossAlive` |
| target | total>0이면 `Math.max(0,Math.ceil((.8-1e-9-bonus)*r.total))`, total0이면0 |
| bonus | guardKilled이고 현재 지역과 게이트 지역이 일치할 때 .10, 나머지0 |
| 1행 | `r.cleared`이면 `정화 완료`/`Purged`; 아니면 `목표 N`/`Target N` |
| 2행 | `_regionFbAlive(r)` true이면 `앵글러 생존`/`Angler alive`, false이면 `앵글러 조건 충족`/`Angler OK` |
| 3행 | `_bossGateDisplayOpen()` true를 먼저 표시. 이후 cleared<4 → `봉인: 정화 n/4`/`Sealed: regions n/4`, `!G._fbDone` → `봉인: 앵글러`/`Sealed: Anglers`, 그 외 `개방 대기`/`Gate pending` |
| 숫자 leaf | 기존 지역 처치 값 및 펄스 유지; 3줄 label의 첫 줄에 `alignSelf='flex-start'`로 맞춤 |
| 줄바꿈/복귀 | 활성 label `whiteSpace='pre-line'`; inactive는 label/value inline 속성을 각각 `''`로 복귀하고 `지역 처치`/`Area kills` 표시 |
| 가독성 class | active 판정 직후 `mmLvl.classList.toggle('region-progress',!!active)`; missing leaf도 inactive이므로 기존 class 제거. 패널 없음은 안전하게 생략 |
| CSS | `#mmLvl.region-progress{transform:scale(max(var(--ui-scale),1))}`. 활성 최소 scale1 → 기본 font12CSSpx; 원 font/width/offset/padding 변경0. scope exit에서 class 제거 및 기존 transform 복귀 |
| slow 훅 | 기존 slow HUD의 숫자 갱신 후 helper1회; 기본 label의 중복 쓰기 제거 |
| 언어 훅 | `_refreshPersistentHudLanguage`의 labels loop 직후 current region 또는 null로 helper1회. paused는 active 제외 조건이 아니므로 paused 언어 refresh에서도3줄 동기화 |
| 초기화 | `G.on=false`에서는 inactive여서 늦은 REGION 상수 접근0; 새 타이머/RAF/state authority 없음 |
| 캐시 | `_hset`은 캐시와 실제 leaf값을 비교하므로 언어 loop의 직접 쓰기 뒤에도 현재 label 복구 |

`Angler OK`는 조건 충족 표시이며 실제 앵글러 사망을 입증하지 않는다. 4지역·정화 래치·`_fbDone`·gate 진입·retry·save·combat 권한은 기존 그대로다. Main에 적용되며 Easy 완료/28언어 전파 완료로 확대하지 않는다.

### 소스와 검수 epoch

최종 `game.html` working 4,092,122B / SHA256 `b8be6378b7d2805b32ca38f92cca03179f8f1ebb2732bebacec6300f5fe7ad3a`, ROOT owned 4,091,937B / SHA256 `05fa7031c8f1d4b1e02643e9fd9964f81c3a80a25d698ab22a002c2330f1ddc0`의 6개 hunk 기준이다. 기존 foreign 185B는 미채택 상태로 보존한다.

ROOT owned 이외 foreign185B는 MB paused guard와 DOT3 모두 미채택 기존 바이트다. 설정3.3 foreign2948B 및 보호2_3/WOLF/STORY/tree-card는 이번 소유 밖이다.

| epoch | 실제 완료 범위 | 보존 경계 |
|---|---|---|
| initial33a80, 4,091,887B | source static language 회귀 발견 후 실행 전에 보정 | CPU/native0; 결과를 이후 핀으로 승격0 |
| 29c1, 4,091,972B | 최초 CPU7그룹68조건(동작65/정적3) PASS68/FAIL0/미도달0/exit0; native Chrome/context/page1, layout4+paused language2조건 PASS/FAIL0/미도달0/exit0 | 기존1280 font8CSS·640 font4CSS로 ROOT 가독 RETOUCH; 이 epoch 재실행0 |
| final B8, 4,092,122B | 새 한정 CPU4그룹8조건(동작7/정적1) PASS8/FAIL0/미도달0/exit0, 신규 Node1 | class/복귀/missing leaf·panel/paused language/CSS만; static CSS를 실제 computed CSS로 승격0 |
| final B8 native | 새 headed Chrome/context/page1, KO/EN640×720 두 조건 PASS2/FAIL0/미도달0/exit0 | 최소12CSSpx/scale1, 패널216×182.484375, viewport 안/clock·minimap 겹침 없음/첫줄 정렬; 최종1280 재실행0 |

각 epoch를 clean 단일 suite로 합산하지 않는다. 기존 suite 재실행0. ROOT PNG 직접 판독은 이전4장+최종2장=6장이고, 이 문서 작성자는 CPU/Chrome을 추가 실행하지 않았다. 최종 language selectOption 관측은 synthetic change(`isTrusted=false`)이며 실제 UI class 선택 인수와 다르다.

최종 native의 pageerror0/HTTPerror0, sourceHTTP4건(두 파일의 prelaunch/실제 응답) exact, context/browser 닫힘을 기록한다. requestfailed6은 외부 font 의도적 차단3 + 로컬 intro abort3이며 후자의 직접 원인은 UNKNOWN이다. 합성 mats POST1/forwarded0/save POST0/durableACKfalse; GL UNKNOWN, 청취0, native6false. DOM fit를 GL·실제 저장·전체 route 인수로 승격하지 않는다.

| 외부 근거 | 정확 pin |
|---|---|
| `H/validation-receipt.json` | 3,629B / `13342746490d1a29146e0f98c35f97db09cb5669faeb458dbf6be3bb4f527406` |
| `H/cpu-readable-receipt.json` | 8,561B / `78806d0c04b242e031881bfb1e51ea02e22a122b58678c1fc09a21c339f6441f` |
| `H/native-readable-first-only/result.json` | 4,789B / `7a4e95ed8a828406fbb5e44aff65595270b2cdf39e572d1c43cbb4292b7c9b41` |
| `H/visual-verdict.json` | 2,934B / `f7f280e29c09f5fc5347816a0e1743e7099d72449bee2d1186ef4917ca69d0d9` |

`H=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-region-progress-hud-20261007`. 이 append는 기존 본문 prefix를 보존한다.

### docs 동기화 검색 근거

최초33a80에서 docs 전체 관련키워드 검색1회: inventory1282/허용 텍스트1024(그중 Markdown817)/owner STATELOG7 path-only/바이너리·container251 path-only, 44매칭경로/154행/181 occurrence, exit0. 보호2_3 본문은 제외했다. 텍스트 범위에 Python4/HTML backup3도 포함했고, path-only 전체를 모두 바이너리라고 부르지 않는다. 전체 검색은 전체 문서 full read를 의미하지 않는다. 29c1에서 `_refreshPersistentHudLanguage` 단일 delta 검색1회는1경로1행이었다. 최종B8에서 `region-progress` 단일 literal delta만 기존1024 경로에 수행하여0경로0행(rg no-match exit1)을 기록했다. 전체 검색 반복0이며 현재 필수8문서만 동기화한다.

### §23 MAP PRODUCTION REPORT

| 항목 | 이번 단위의 실제 상태 |
|---|---|
| STAGE | CH1-1 actual Main stage0 필드 HUD 표시; 전체 맵 제작 완료 아님 |
| MASTER PLAN / silhouette | 기존 실루엣 보존; 재평가 미실시 |
| MASTER PLAN / regions | 기존4지역 authority 보존 |
| MASTER PLAN / main route | 기존6시 시작→12시 출구 보존; 이번 전체 route 관측0 |
| MASTER PLAN / side spaces | 변경0; 새 QA 미실시 |
| LARGE OUTER MASS / LEFT·RIGHT·TOP·SOUTH | 전부 변경0 |
| LARGE OUTER MASS / major holes | 새 관측 미실시 |
| LARGE / source assets·composites·overlap | 원 PNG/합성/배치 변경0 |
| LARGE / repeated silhouette | 새 관측 미실시 |
| MEDIUM CONNECTION / connections | 변경0 |
| MEDIUM CONNECTION / remaining holes | 새 관측 미실시 |
| GROUND CONNECTION / shadow·contamination | 변경0 |
| GROUND CONNECTION / structure integration | 변경0; 평평한 baked 지면과 확대 흐림은 남음 |
| PLAYABLE/COMBAT / main arenas·travel·breathing·threat spaces | 전부 변경0; 이번 전투 인수0 |
| PLAYABLE/COMBAT / combat readability | 지역 목표·게이트 사유는 더 읽기 쉬움. opening FX/배경/전체 전투 가독은 RETOUCH |
| LANDMARK/CENTER / primary·secondary·tertiary | 전부 변경0/새 검수0 |
| SMALL DETAIL | HUD label/class 표시만 변경; 맵 detail 추가0 |
| CAMERA QA / START | KO/EN640 HUD 두 화면 한정. 글자12CSS/패널216×182.484375와 clock/minimap 비겹침 확인; transient startareaTitle 오른쪽과 패널 겹침 남음 |
| CAMERA QA / EARLY | 새 관측 미실시 |
| CAMERA QA / ARENA | 새 관측 미실시 |
| CAMERA QA / SIDE L | 새 관측 미실시 |
| CAMERA QA / SIDE R | 새 관측 미실시 |
| CAMERA QA / LANDMARK | 새 관측 미실시 |
| CAMERA QA / LATE | 새 관측 미실시 |
| CAMERA QA / EXIT | 새 관측 미실시 |
| TECH QA / route·collision | 코드/원 nav 보존; 새 전체 route 인수0 |
| TECH QA / pageerror·404 | 각 격리 native run에서 pageerror0/HTTPerror0 |
| TECH QA / seam | 새 관측 미실시 |
| TECH QA / loading | Main ready 확인; font 차단/intro abort는 위 별도 분류. shader/GL UNKNOWN |
| TECH QA / performance | 프레임 시간/CPU·GPU 성능 인수0, 영향 UNKNOWN |
| FILES / stage owned | `game.html` ROOT owned6hunk + 필수 current docs8 |
| FILES / concurrent touched | game foreign185B와 설정3.3 foreign2948B 보존, 본 작업 미수정 |
| FILES / unrelated touched | 본 문서 작업에서0 |
| GIT / staged·commit·push | ROOT 완료소유 보존 예정; 이 append 시점 미완료, 새 SHA 추정0 |
| GIT / deploy | 0 |
| VISUAL VERDICT | **RETOUCH**. ROOT 직접 판독에서 HUD 가독 개선 한정; startareaTitle overlap·회색 baked 맵·확대 흐림·heavy opening FX·물리 높이0 잔존 |
| NEXT PASS | title/패널 safe zone, 실제 정상 gate/전투 route 관측, 맵 재질/높이/저장 NPC consumer의 별도 단위. 본편 native6/audio/durable save 미인수 유지 |

이번 표시 검수는 이전 normal-play B/root-adjudication(f830)의19관측이나 장벽 검수와 별도이며,19PASS 또는 정상 보스방 개방/보스 사망·재시도 완료로 합산하지 않는다.

## 2026-10-07 전사 rig 접촉 AO 후보 — ROOT-CH1-RIG-CONTACT-SHADOW-20261007

> 2026-10-08 현행: 시험3387 ch1Three/ch1Rig의 접지 core는 기본ON, 첫 ch1FootAO=0만OFF다. 아래 defaultOFF/명시1·검수는2026-10-07 opt-in 이력이다. [현재 계약](MAP_RUNTIME_ARCHITECTURE.md#ch1-warrior-contact-shadow-default-20261008).

사용자의 “인게임에서 한번 보고 구체화” 요청에 따라 실제 Main을 관찰한 뒤, 기존 그림자·캐릭터 크기·충돌을 유지하는 작은 접촉 AO를 **defaultOFF 미감 후보**로 추가했다. 본편 전체 rig·실높이·해부학 발/IK 완료를 뜻하지 않는다.

### 현재 source 계약

`ch1FootAO`는 기존 로비 옵션 carry4키에 포함되지 않는다. 직접 Main 시험 URL의 명시값1에 한정하며 로비 왕복 자동 유지/일반 설정 UI/새 query 메뉴 추가는 없다.

| id/위치 | 값·범위·순서 |
|---|---|
| 요청 | 기존 `ch1Three=1` + `ch1Rig=1` 범위에 `ch1FootAO=1`까지 명시해야 요청됨. 기존 격리3387 scope의 opt-in; 기본 OFF |
| actor/mode | 전사 class0, 살아있는 P/현재 rig scope, `P.s==='idle'`; animator mode `idle`/`walk`/`run`만. walk/run 애니메이션도 P.s idle 안에서 소비됨 |
| 기존 scope | stage0·비보스방·기존 production_finish/smoothing rig consumer 범위 유지 |
| 기존 shadow | 중심 `(_px,_py+_pR+12)`, `shW=isCharge?_pR+6:_pR+2`, rx=`shW`, ry=`_pR*.35` 그대로 |
| 기존 shadow 출력 | DS `_dsBlob(...,.38)`/기존 SE offset, 또는 기존 hard ellipse `rgba(0,0,0,.25)` 유지. 새 AO로 기존 alpha/방향을 대체하지 않음 |
| `_ch1RigCaptureGroundContact` | 기존 shadow 직후 호출. 먼저 이전 record를 null로 취소하고 유효 중심/양수 반지름/유한 matrix만 캡처 |
| ground matrix6 | GPU/GL은 `_mat().slice(0,6)`, Canvas2D는 `X.getTransform()`의 a,b,c,d,e,f를6 scalar로 복사. 이후 body translate와 분리 |
| trial core | 중심 동일, rx=`shW*.35`, ry=`(_pR*.35)*.4`, `fillStyle='#000'`, `globalAlpha=.10`; 미감 시험값 |
| current identity | 같은 `_now`, `_gameFrame`, `G.map`, `P`, `P._sa`; class0/`_ch1RigAlive`/scope/HP/idle와 mode 재검사. 별도 새 생명 token을 제공한다고 주장하지 않음 |
| 호출 seam | adapter의 nonnull 준비 frame와 유한 body matrix를 얻은 뒤, parent body `X.drawImage` **직전**에 `_drawCh1RigGroundContact(mode)` 호출 |
| 1회 소비 | `drawn`을 외부 drawing 전에 true로 예약. fill 성공 뒤 draws 증가. ghost 경로에는 AO 호출0(정적 source 확인) |
| context restore | `X.save`→복사 ground matrix 적용→작은 core fill→`finally X.restore`; 원 body-local transform으로 돌아와 기존 body blit 진행 |
| 수명 | `_ch1RigBeginBodyFrame` 시작과 pagehide에서 record null; 기존 alive/scope 수명 사용. 추가 RAF/timer/update0 |
| 진단 | `__ch1PlayerRigQA().contactShadow` = frozen `{requested,draws,accepted:false}`. counter는 성공 fill 호출 관측이며 매프레임 pixel/upload 보장 아님 |

OFF/준비 frame 없음/불가 mode/낡은 identity의 검사 범위에서는 core draw0이다. 그러나 core는 parent body blit보다 먼저 칠해진다. 그 **뒤 parent `X.drawImage`가 throw하거나 proxy upload가 조용히 실패하면 core를 rollback하지 않는다.** 기존 body fallback 권한은 유지하지만, 모든 fallback의 원 pixel 동등성은 미인수다. controlled fill throw 뒤 body blit가 계속되는 CPU 결과도 이 parent 실패 후 pixel 동등성의 근거가 아니다.

원 PNG/scene/nav/geometry/충돌·AI·전투·저장/UV·bone·body 크기와 world foot은 변경0이다. crop 하단을 해부학 발로 확정하지 않는다. 새 renderer/context/texture/이미지/RAF/timer는 없으며, matrix 복사·record·ellipse의 실제 비용은 성능 인수하지 않았다.

최종 `game.html` working **4,093,695B / SHA256 `cbc459f7a86e8b3ba15610f34554fd1f81353dbaf691879da9e17f32ca5ae2fb`**, ROOT owned **4,093,510B / SHA256 `7523cbab51c8bbcb008062c0ed2f646da777720b782b06a8a5eb27312e2f41c7`**의7hunk 기준이다. foreign185B는 미채택 기존 바이트로 보존한다.

### 구현/검수 epoch와 한계

| 구분 | 실제 근거 | 과장 금지 경계 |
|---|---|---|
| 최초 구현 준비 | source seam selector가3곳에 맞아 assert 중단, 제품 write0; exact oldshadow seam으로 한정 보정하고 기존 backup 재사용 | 제품 실패/의미 검수 실패로 계산0 |
| 현재 CPU | physical Node1/actual-source 의미 실행1,7그룹52조건 PASS/FAIL0/setup0/미도달0/exit0. 실제 helper2+whole warrior body 함수를 통제 VM에서 소비 | 동작45조건+정적7조건. adapter/GPU/native getTransform은 통제 port. unhandled는 계측하지 않았고 동기 하네스/Promise 경로0. ghost는 source 부재 검사만 |
| CBC 실제 native | 새 headed Chrome/context/page/maxLive1,1280×720에서 natural bonfire 종료 뒤 순idle 및 trusted W+D 이동/run **관측2건** | 2PASS가 아님. 강제 위치/HP/시간/AI/해금0. same-pose OFF/ON 비교0/미감 acceptedfalse |
| native counter | idle draw130 / moving-run draw158 / 종료 draw169·bodyFrames169, requestedtrue | 당시 관측치이며 매프레임169/169 동등성을 보장하지 않음 |
| 이전 B8 실화면 | `main-view-first-only/result.json`의2관측, 다른 context/scene | 새 CBC와 same-scene A/B 또는 clean 합산0 |
| ROOT 시각 판독 | B8 PNG2 + 새 contact PNG2 =4장. 다리 하단과 작은 dark contact 표시 관측 | 해부학 발/미감 개선/전체 A급 판정0. 큰 pet 대사 초상·몹FX 겹침·평평한 baked 지형 남음 |

새 native source 전후 및 실제 HTTP exact, pageerror0/HTTPerror0, context/browser 닫힘/exit0/미도달phase0이다. requestfailed5는 의도적으로 차단한 외부 font3 + local intro abort2(직접원인 UNKNOWN)다. 모든 API는 합성 격리이며 mats POST1 forwarded0/save POST0/durableACKfalse다. GL UNKNOWN/물리GPUfree UNKNOWN/audio0/native6false. 이전 HUD·공격·rig·normal route suite를 반복하거나 합산하지 않는다.

| 외부 D 근거 | 정확 pin |
|---|---|
| `contact-implementation.json` | 914B / `e63ccb8c629b4878d15deb11be48c99a80fafee108844facf2e116aea3f2d929` |
| `contact-cpu-final-receipt.json` | 7,973B / `4bf926962640ea1036c061b16ac9f587f37ef0e7d133a29b087ee54e38f49629` |
| `native-contact-first-only/result.json` | 22,362B / `82c61b60b65abba3dc5d29a2c6941117312eeebb812c34faa79dda6589115214` |
| `contact-validation-receipt.json` | 2,407B / `725801375623247a36d2b6b8ce61c67960db812d0918327b365327851ed38827` |
| `contact-visual-verdict.json` | 4,038B / `8dcd09af0896cfcf1adc37ff23315bd68064777861c05a329326fbe009a2c4c5` |
| 이전 B8 `main-view-first-only/result.json` | 9,040B / `4ba333e806be1a328d0167a0bce447a44d8eead8ab63c62b853eb41ec3a81c37` |

`D=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-in-game-concretization-20261007`.

### docs 관련검색

이번 AO 키워드로 docs 전체 허용 텍스트 검색1회: inventory1283, eligible text1024/Markdown817,70매칭경로/214행/229 occurrence, exit0. owner/관리8 및 binary·container251은 path-only로 분리하고 보호2_3 본문은 읽지 않았다. path-only 전체를 모두 바이너리라고 부르지 않는다. raw150,752B/SHA256 `13720056a14eb6f5ad3840be2dc95916be9baf2424ddb0c4e148aa56f121d76c`와 파일별 disposition을 외부 보존했다. 전체검색은 전체문서 full read가 아니며, 이전 HUD 검색을 반복한 것이 아니다. current 필수6만 동기화하고 역사/다른대상/불변 spec/설정3.3은 보존한다.

### §23 MAP PRODUCTION REPORT

| 항목 | 이번 scope의 실제 상태 |
|---|---|
| STAGE | CH1-1 actual Main 전사 표시의 작은 접촉 core 후보; defaultOFF |
| MASTER PLAN / silhouette | 기존 silhouette 변경0; 새 실루엣 평가0 |
| MASTER PLAN / regions | 기존 지역·gate authority 변경0 |
| MASTER PLAN / main route | 기존6시 시작/12시 출구 보존; 이번 전체 정상route 인수0 |
| MASTER PLAN / side spaces | 변경0/새 관측0 |
| LARGE OUTER MASS / LEFT·RIGHT·TOP·SOUTH | 전부 변경0 |
| LARGE OUTER MASS / major holes | 새 관측0 |
| LARGE / source assets·composites·overlap | 원 PNG/합성/배치 변경0 |
| LARGE / repeated silhouette | 새 관측0 |
| MEDIUM CONNECTION / connections | 변경0 |
| MEDIUM CONNECTION / remaining holes | 새 관측0 |
| GROUND CONNECTION / shadow | 원 중심/반지름/ground matrix 재사용; 기존 shadow 유지 + opt-in .35/.4 반지름 배율·alpha.10 core만 |
| GROUND CONNECTION / contamination | 변경0 |
| GROUND CONNECTION / structure integration | physicalHeight0/평면 baked 지형 그대로; 접촉 개선 미인수 |
| PLAYABLE/COMBAT / main arenas·travel·breathing·threat | 변경0. 실제 W+D 이동 한 사례를 전체 전투/route 완료로 승격0 |
| PLAYABLE/COMBAT / combat readability | 큰 pet 초상/몹FX 겹침 잔존, 개선 인수0 |
| LANDMARK/CENTER / primary·secondary·tertiary | 전부 변경0/새 검수0 |
| SMALL DETAIL | 작은 접촉 AO core1후보, prepared warrior idle/walk/run만. ghost0은 정적 source 근거 |
| CAMERA QA / START | 현재1280×720 순idle/run PNG2관측. 이전B8 PNG2는 별도. same-pose OFF/ON0 |
| CAMERA QA / EARLY | 새 인수0 |
| CAMERA QA / ARENA | 새 관측0 |
| CAMERA QA / SIDE L | 새 관측0 |
| CAMERA QA / SIDE R | 새 관측0 |
| CAMERA QA / LANDMARK | 새 관측0 |
| CAMERA QA / LATE | 새 관측0 |
| CAMERA QA / EXIT | 새 관측0 |
| TECH QA / route·collision | 기존 코드/nav 불변, 새 전체route 인수0 |
| TECH QA / pageerror·404 | 새 native pageerror0/HTTPerror0 |
| TECH QA / seam | 새 인수0 |
| TECH QA / loading | 실제 Main/rig body 도달. externalfont 차단3/introabort2 UNKNOWN 별도. GL UNKNOWN |
| TECH QA / performance | 추가 RAF/timer/시뮬레이션/texture/image0; 실제 비용·성능 영향 UNKNOWN |
| FILES / stage owned | ROOT game7hunk + current docs6 |
| FILES / concurrent touched | game foreign185B·설정3.3 foreign2948B 보존, 본 docs 작업 미수정 |
| FILES / unrelated touched | 본 작업0; 원PNG/scene/nav/보호2_3 불변 |
| GIT / staged·commit·push | ROOT 완료소유 보존 예정. 이 append 시점 미완료, 자기 SHA 추정0 |
| GIT / deploy | 0 |
| VISUAL VERDICT | **RETOUCH**. 실제 core 도달과 다리 하단은 관측했지만 미감 개선 미인수. 평평한 지형/FX·초상 겹침 잔존 |
| NEXT PASS | same-pose OFF/ON 비교 및 실제 actor-ground 접촉 미감, DS 가림/전체 정상route 별도Gate. 본편native6/청취/durableSave/A급 미인수 유지 |


## 2026-10-07 ROOT-CH1-DRUID-CORPSE-SOURCE-CONSUMER-20261007 · 드루이드 시체 원본 캡처

기존 승인된 드루이드 base8 방향 원화가 실제 `_addCorpse`의128² bitmap 캡처에 연결됐다. 전용 death sheet·사망 애니메이션·새 원화·새 rig가 아니다. 앞선 normal live rig의 death legacy 문장은 해당 consumer/source epoch로 보존하며, 새 예외는 이 시체 bitmap source에만 적용한다.

최종 `game.html` working **4,108,637B / SHA256 `e126009e20157a98c0561e3a3f111d94372b26df39bb45964e4d6591af31c757`**, ROOT owned **4,108,452B / `6787cb308cf3d085c5821d3b9eed95e2d760eb584473f3ceec2dbfcb816ed981`**의 2hunk 기준이다. foreign185B는 미채택 기존 바이트로 보존한다.

| source/seam | 정확 값·흐름 |
|---|---|
| helper | `_captureCh1DruidCorpse(c,e)` boolean, **8278B/SHA256 `379cc4cd601aa208d28f58f8df9ac030754e92d71a9eb08072bdfd0c092a80d1`** |
| 연결 순서 | `_addCorpse` OPT.deathFx early return→기존pool/물리설정/clear→기존 fieldmob sheet→새helper→원 bossDirAtlas→external boss idle→bossWalkAtlas→generic south/meta→etype→circle→기존gore/headgib |
| opt-in scope | 기존 `_ch1RigRequested`·`_ch1DruidAlive` lifecycle 활성, `_CH1_START_PHASE==='smoothing'`, root=`assets/map/ch1/production_finish`, G.on true/stage0. request 정책/defaultOFF 변경0 |
| map/actor | 같은 G/ens/map/scene, field200×200 또는 arena128×108과 mw/mh 일치. 현재 ens에 해당 e가 있고 ib boss 유일1 |
| 사망 signature | e.ib true/alive false/finite hp<=0/deaths safeint>=1; 같은 owner.band live/pendingfalse/intent normal/state·phase·lastStand·defeated·life 일치, owner.deaths+1===e.deaths. actor관찰·revive/전투권한 추가0 |
| 원 timer | `_reviveTimer` undefined→0, finite>=0/zero허용. 필수양수 death timer 조건 없음 |
| lease/source | 이전 live owner가 소유한 base8 sheetRecord/image의 ready/settled/open lease, 같은 scene/life·generation/decodedGeneration, frozen borrowed record·native image complete/dim/src/currentSrc/srcset/sizes fingerprint 일치 |
| mutation | native `MutationObserver.prototype.takeRecords` queue가 있으면 기존 `_ch1DruidCloseLease(lease,'source-mutated')`→false. 현재 일관성 보정이며 실제 live 오채택 결함 재현으로 주장0 |
| 원화 | 기존 `assets/sprites/boss/boss_dark_druid_8dir_v3.png` 1656×1240/4×2/414×620, 3,668,669B/SHA256 `ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549`; 원핀은 bitmap 검수 기록 |
| 방향 | 기본 facing; eWalk/eChase/eApproach&&(vx||vy)일 때 atan2(vy,vx). round(angle/(PI/4))의0..7 octant→`_DRUID_DIRMAP=[6,7,0,1,2,3,4,5]`. public catalog 방향입력과 구분 |
| crop | col=dir%4/row=floor(dir/4), sx/sy 및 다음경계 `round(n*dimension/count)` 차이; w414/h620. source crop 밖 확장0 |
| destination | spec use2D/anim true, dw=r*9.3/dh=r*14.1; k=min(128/dw,128/dh), x=(128−k*dw)/2/y=(128−k*dh)/2/w=k*dw/h=k*dh. r44에서는 authored409.2×620.4 비율 |
| ctx | ctx.canvas===c.c/128² 확인, save→identity CTM/alpha1/source-over→queue drain/owner·source 재확인→draw→finally restore. attempted draw 예외 시 identity clear를 시도하고 false; 무조건 rollback 보장 주장0 |
| unchanged pool/options | `_CORPSE_MAX=120`/각128². `OPT.deathFx=false`는 함수 최초 return. 새Image/fetch/decode/texture/RAF/timer0 |
| unchanged size/life | 일반 보스 `max(96,r*3.0)`/600(r44 size132); 일반 `max(40,min(260,r*2.9))`/420. 기존 fieldmob 크기/220 유지 |
| unchanged motion | spd=min(5,1.5+(power||1)*.8), r=killAng+PI*.5/rv=(random−.5)*.2; wall bounce vx/vy*−.4·rv*−1, vx/vy*.85**sp·rv*.92**sp, t-=sp |
| unchanged render | 마지막40% fade/alpha<.05 제거·skip, cull margin40/max25, translate→rotate→Y scale.5→sz×sz 중앙draw. gore overlay/headgib/floortrace 유지 |
| unchanged authority | PNG/scene/nav/geometry/LOCK·카메라·AI·HP/죽음/부활/피해/보상/quest/save 정책·OPT 수치 변경0 |

호출 흐름은 `정상 죽음의 기존 _addCorpse → ready 현재 base8 캡처 조건 → true면 bitmap 채택 / false면 기존 fallback → 기존 gore·head·물리·renderer`다. source를 얻으려고 actor를 살리거나 새 decode를 시작하지 않는다. 현재 ready base8 lease가 없으면 새 source 소비가 보장되지 않는다.

### 실행 epoch와 인수 경계

| epoch | 실제 결과 | 한계 |
|---|---|---|
| 최초 CPU | Node1/8그룹 계획·7그룹완료/42도달41PASS·1FAIL·미도달0/exit1/unhandled0; 동작38·inverse/helper정적3 PASS | 마지막 renderer 정적 oracle가 첫 공통for를 잡아 물리400B를 선택. 실제 제품 renderer 결함 확정0 |
| renderer 한정 후속 | 별도Node1/제품함수실행0/정적1PASS/FAIL·미도달0/exit0. 원renderer599B/SHA256 `b14c4102ada08b1e9d59f2114a4d906b1fbc442344b0228e507af2e6dca519af` exact·Y.5 1회 | 원41PASS 재실행0·최초FAIL 보존·clean42PASS 합산0 |
| 실제PNG/software bitmap | 최초한정1회/actualhelper+로컬PNG/software canvas·통제 lifecycle/image fingerprint/observer,8dir capture true/nonempty·exit0/source·원PNG전후exact | actual HTMLImageElement/브라우저/GPU/실사망/부활0. 방향별 alphaPixels `[6350,6901,6891,6898,6538,6551,6821,6853]`, bbox x22..105/y0..127(일부y1)는 관측값이지 셀알파 완전성 증거 아님 |
| 새 본편 native | **NOT_RUN**, Chrome/context/page0 | 사용자 기존 IAB tab13 old loaded source 유지/no reload·새게임0·새소스적용0 |
| 준비 이력 | 구현 backup Pythonparse1/write0→한정정정, docs primary 경로조회exit2·경로오타readexit1/write0 | 제품CPU/native FAIL과 별개 |

최초 actual-source CPU는 Node1/8그룹 계획·7그룹 완료/42조건 도달 **41PASS·1FAIL·미도달0·exit1**이다(동작38·inverse/helper 정적3 PASS). 마지막 FAIL은 renderer 대신 물리 update 루프를 선택한 추출 오라클 오류로, 제품 결함 확정이 아니다. 이후 원41조건 재실행 없이 실제 renderer599B exact·`X.scale(1,.5)` 보존만 별도 Node1/정적1조건 PASS·exit0으로 확인했다. 실제 원PNG/software canvas+현재 helper의 8방향 bitmap은 모두 비어있지 않음·exit0이지만 통제 lifecycle/image fingerprint/observer 포트이며 HTMLImageElement·GPU·실본편 사망 검수가 아니다. 이 세 실행을 clean42PASS나 native PASS로 합산하지 않는다.

새 본편 death native는 **NOT_RUN**(Chrome/context/page0)이다. 사용자의 기존 IAB tab13은 old loaded source를 유지하며 새로고침·새 게임0, 새 corpse consumer 적용0이다. ROOT의 bitmap PNG 직접 판독은 몸·뿔 식별 한정이며 회전/Y.5 썸네일은 작고 어둡다. 셀 경계 alpha 완전성·해부학적 발·접지·실제 사망/부활·전투 겹침·동일후보6단계/native6·audio·durableSaveACK·성능·A급은 미인수다. **VISUAL VERDICT: RETOUCH**.

8dir PNG 보드 `bitmap/source-capture-eight-directions.png`는197267B/SHA256 `1f068bd9d3581ae360d62eba28780f3ed0774be383cdec591c544f84c7d78cb9`이며, 하단은 fixture r40/size120/회전PI/2·Y.5 예시다. 실제r44 main 사망 화면이 아니며 gore/head/floor는 생략됐다. ROOT가 직접 판독했고 문서담당 재판독·제품/CPU/Chrome 실행0이다.

### §23 MAP PRODUCTION REPORT

| 항목 | 이번 scope의 실제 상태 |
|---|---|
| STAGE | CH1-1 드루이드 시체 source consumer 구현·CPU/software bitmap 한정. 실제맵제작/본편사망 NOT_RUN |
| MASTER / silhouette·regions·main route·side spaces | 원맵/지역·동선·측면공간 변경0·신규 현장 인수0 |
| OUTER MASS / LEFT·RIGHT·TOP·SOUTH·major holes | 변경0·새화면검수0·major holes 미관측 |
| LARGE / source assets·composites | 기존1656×1240 base8→128² 선택셀 중앙fit, 환경합성·신규asset0 |
| LARGE / overlap·repeated silhouette | 실본편시체/플레이어/FX겹침·환경반복 신규검수0 |
| MEDIUM / connections·remaining holes | 변경0·현장검수0·남은hole미관측 |
| GROUND / shadow·contamination·structure integration | 기존바닥흔적/gore권한유지·실사망0·접지/해부학발미인수 |
| PLAYABLE / main arenas·travel·breathing·threat | 전투장·이동/nav·숨쉴공간·위협/AI/충돌변경0·실보스사망0 |
| PLAYABLE / combat readability | softwarebitmap몸/뿔식별 한정, 작은어두운시체·실전가독성미인수 |
| LANDMARK / primary·secondary·tertiary | 배치변경0·새현장검수0 |
| CAMERA QA / START | 미실행·8방향bitmap은맵카메라보드아님 |
| CAMERA QA / EARLY | 미실행 |
| CAMERA QA / ARENA | 미실행 |
| CAMERA QA / SIDE L | 미실행 |
| CAMERA QA / SIDE R | 미실행 |
| CAMERA QA / LANDMARK | 미실행 |
| CAMERA QA / LATE | 미실행 |
| CAMERA QA / EXIT | 미실행 |
| TECH QA / route·collision | 원본불변·실경로/충돌재검사0 |
| TECH QA / pageerror·404 | 브라우저/HTTP검수미실행·UNKNOWN |
| TECH QA / seam | 실제맵seam검수0 |
| TECH QA / loading | 로컬PNG/softwaredecode·8dirnonempty만, HTMLImageElement/GPU/실게임로딩미인수 |
| TECH QA / performance | 추가RAFtimer0은source계약; frame시간/실본편성능/physicalGPU미측정 |
| FILES / stage-owned | ROOT game2hunk+이번정본docs7. 문서담당제품/Git실행0 |
| FILES / concurrent touched | game foreign185B·3.3 foreign WIP·타인작업보존·본작업미수정 |
| FILES / unrelated touched | 본작업0·원PNG/scene/nav/보호2_3미수정 |
| GIT / staged·commit·push | ROOT 완료소유 정상보존 예정. 본append시점미완료·자기SHA추정0 |
| GIT / deploy | 0 |
| VISUAL VERDICT | **RETOUCH**·몸/뿔식별한정·실사망/접지/셀경계/전투겹침미인수 |
| NEXT PASS | 사용자게임상태보존조건의 다음승인범위에서 실제보스사망/시체/폴백/부활·셀alpha/몸뿔/접지/FX겹침 관측. native6/audio/durableACK/A급미인수유지 |

코드후 의무 related-keyword docs검색은 1회,137경로/605행/748매칭이다. 전체 문서 전수완독을 주장하지 않으며 giant owner subtree·SUPERVISOR STATE/LOG는 path-only/본문·hash0, 보호2_3본문0으로 제외했다. 텍스트 backup/archive와 원측정이력은 보존하고 binary와 일괄동일시하지 않았다. 현행필수7은 본문에새append하고원prefix/이력수치·핀은유지한다.

외부 근거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-druid-corpse-consumer-20261007`의 `implementation-receipt.json`(1,102B/`299f04e4d5e2dd9c909605efd3a4e51a10d2ce88eaf17d9a7391bb7afbfd4822`), `validation-receipt.json`(20,425B/`74db21d0c3d0c933709df5377f6ea7243e3c3ad05b803511c852fa1d7e3908be`), `visual-verdict.json`(9,562B/`da1bb7a4dc8e5d84a2354f8c45345f83890a7bafb9eab5757e4b6e92e92ae9a1`)이다. Git stage/commit/push는 ROOT의 완료소유 보존 예정이며 이 부록에서 완료 SHA를 미리 주장하지 않는다.

## 2026-10-08 ROOT-CH1-AREA-TITLE-HUD-SEPARATION-20261008

### 현재 소스와 위치 소비

이번 기록은 **ROOT-CH1-AREA-TITLE-HUD-SEPARATION-20261008**의 현재 구현 계약이다. 이전 640×720 KO/EN 화면의 시작 제목·커진 HUD 겹침은 당시 관측 이력이며, 이번 소스만으로 시각 해결을 인수하지 않는다. 최종 working `game.html`은 4,112,493B / SHA256 `0b6beffafbb9d2335d668d14993a0b9b5d0e1f9a98a14d8668f019a0ff946e88`이다.

| 항목 | 정확 계약·근거 |
|---|---|
| working game | 4,112,493B / `0b6beffafbb9d2335d668d14993a0b9b5d0e1f9a98a14d8668f019a0ff946e88` |
| owned game | 4,112,308B / `4ba56388cdcad7fa9387ee3a78f4a25c769a4e350923ee0618ad6b7028a85218`; foreign185B 미채택 보존 |
| 수정2hunk | 기존 update 첫 줄/root block 앞 `_syncHudAreaTitleScope()`; region label 뒤 observer controller |
| 위치 | `max(18%, calc(HUD의 actual bottom + 15px + var(--gap-md)))`; 기존 gap8px. 제목 resting top 조정이며 모든 animation frame의 화면 fit 보장 아님 |
| 유지 | 제목3.1s·Y−15..+7px·문구·폰트, HUD3줄·scale 최소1/기본12CSSpx, 원 PNG/scene/nav/배치·충돌·전투·save |
| 활성 조건 | 현재 title/panel/root identity·connected·playing·G.on·!document.hidden·panel.on/region-progress·title.show·유한 bottom 및 양수 width/height |
| 측정 | MutationObserver: panel class/자식/문자 및 root style, ResizeObserver: panel, resize/visibility/animation event에서 bbox. update 활성 scope 확인은 layout read0; 비활성은 다음 기존 update 경계에서 복원. G.on 변경 callback의 즉시 원자성 주장0 |
| 소유 | 첫 실제 top 쓰기 직전 inline 값과 priority를 저장. 자기 값+priority가 현재 모두 일치할 때만 복원. 외부 변경은 해당 animation yield하며 hidden-first 전환도 포함 |
| 미지원·종료 | MutationObserver/ResizeObserver 미지원은 legacy. pagehide에서 observer/listener/helper 해제 및 자기 top 복원. RAF/timer 추가0 |

기존 640×720 KO/EN HUD 가독 검수에서 남은 시작 제목 겹침 RETOUCH는 이전 source epoch로 보존한다. 옛 제목18%/regionBanner28%의 보편적 비충돌 설명은 현재 조건부 제목 top에 대한 보장이 아니다. 배너 top28%·2.7s/정화 flare1.4s와 tick15f/경계1.5tile/쿨다운300f는 그대로다. 두 show class의 잔류와 opacity0을 실제 동시 표시로 오인하지 않는다. 동시 재생 가능성은 source 계약이며 현재 실제 제목↔regionBanner 겹침은 UNKNOWN/추가 위치 patch0이다.

### 검증·완료 경계

| 단계 | 결과·범위 |
|---|---|
| 정적 후보 | scope signal/기준 priority/hidden-first yield gaps는 최초 CPU 전에 보정. 실제 사용 중 외부 writer 발생 또는 새 런타임 실패가 확인된 것으로 기록하지 않음 |
| 새 actual controller CPU | Node1/VM9·6그룹25조건 PASS/FAIL0/준비실패0/미도달0/exit0. 통제 DOM/observer/animation ports, native animation delivery/layout 아님 |
| 이전 검사 | view zoom CPU25·옛640 KO/EN native 등은 각 source epoch. 새25와 clean 합산0/재실행0 |
| 새 화면 | Chrome0/GPU0/PNG0/native NOT_RUN/UI NOT_ASSESSED. 기존 user IAB13 old-loaded 유지/no reload/newgame |
| 미인수 | 실제 animation/resize/font/language/regionBanner/viewport fit, 물리 높이·전체 route/6단계·audio·durable save ACK·전체맵 A급 |
| 검증 영수증 | H2/validation-receipt.json 1,310B / `5175260e463cffbbae77ca56cb9c9e157f4c4131e741066be03643c040739623` |
| CPU 원결과 | H2/cpu-result.json 1,025B / `707dd4aa40358385c3023d3304b64df752b26ee2ed2b0e1d5ca4e94c053adb59` |
| 시각 경계 | H2/visual-verdict.json 4,149B / `1baa24724d61ef8785d6ece8debe47f7bd4906ba45e52472aa8fc758b2f29dc7`; UI NOT_ASSESSED/전체 RETOUCH |

H2=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-area-title-hud-separation-20261008`. 초기 implementation-receipt의 중간 bd7be source는 이력이며 최종 검증 source는 위0b6be다. 새 관련 검색은 source 이후1회/27경로115행133occurrence, 원문 `H2/docs-plan/docs-keyword-search.txt` 111,099B / `28dc1bd2cfc17193a87b83f89fec544f1669d4fddac92bec45e4a3c1c8bbe50f`이다. 보호2_3·3.3 foreign·owner STATE/LOG/dispatch 본문을 제외했고 전 문서 full read를 주장하지 않는다. 현재 직접 배치 설명6정본만 append하며 이전 task report/QA raw·무변경 badge/번역/clear typography는 보존한다.

### MAP PRODUCTION REPORT — 가이드 §23

| 항목 | 이번 범위의 사실·Gate |
|---|---|
| STAGE | 실제 CH1 main 시작 지역 제목·지역 진행 HUD 분리 consumer. source/통제 CPU 범위, 새 native0 |
| MASTER | silhouette/regions/main route/side spaces: 기존 scene/nav 권위 유지 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0; 기존 blur/품질 한계 남음 |
| LARGE | source assets·composites 변경0; overlap: 기존640 KO/EN 겹침이 동기이나 새 위치 시각 NOT_ASSESSED; repeated silhouette 미해결 |
| MEDIUM | connections 불변; remaining holes 새 관측0 |
| GROUND | shadow/contamination 불변; structure integration의 물리 높이0 미해결 |
| PLAYABLE | main arenas/travel/breathing/threat space 및 gameplay/input/geometry 불변; combat readability 새 실화면 인수0 |
| LANDMARK | primary/secondary/tertiary 위치·원자료 불변; 새 관측0 |
| CAMERA QA / START | NOT_ASSESSED; 사용자 old-loaded IAB13 유지 |
| CAMERA QA / EARLY | NOT_ASSESSED |
| CAMERA QA / ARENA | NOT_ASSESSED |
| CAMERA QA / SIDE L | NOT_ASSESSED |
| CAMERA QA / SIDE R | NOT_ASSESSED |
| CAMERA QA / LANDMARK | NOT_ASSESSED |
| CAMERA QA / LATE | NOT_ASSESSED |
| CAMERA QA / EXIT | NOT_ASSESSED |
| TECH QA / route | 경로 불변·새 route suite0 |
| TECH QA / collision | map/nav/gameplay/충돌식 변경0 |
| TECH QA / pageerror | native NOT_RUN; 새 실제 브라우저 오류 검수0 |
| TECH QA / 404 | native NOT_RUN |
| TECH QA / seam | 원화/맵 seam 변경0·새 시각 인수0 |
| TECH QA / loading | actual controller 수명·DOM/observer/animation event는 통제 CPU만, native layout/animation delivery 미인수 |
| TECH QA / performance | NOT_MEASURED; 새 RAF/timer0, update 활성 scope layout read0, observer-driven bbox. 실제 비용·DOM/animation 성능 인수0 |
| FILES | stage-owned: ROOT game2hunk 및 현재 관련6docs. concurrent: foreign game185/settings2948/ownerWIP 보존. 이 문서 작업 unrelated touched0 |
| GIT | stage/commit/push는 ROOT 완료소유 checkpoint 예정, 이 담당 Git쓰기0/새 SHA 추정0/deploy0 |
| VISUAL VERDICT | **RETOUCH**; 이번 UI NOT_ASSESSED, 자동 CPU PASS를 미감 PASS로 대체0 |
| NEXT PASS | 새 native640×720/1280×720 KO/EN의 모든 제목 animation phase·resize/font/language·regionBanner·viewport fit. 기존 IAB13 재로드 없이 별도 승인 검수 필요. 실제 main 품질 및 같은 후보6단계 인수 계속 필요 |

## 2026-10-08 ROOT-CH1-TIMEWARP-SPACE-LIFETIME-20261008 — map identity와 rewind 기록

| 경계 | 현재 runtime 계약 |
|---|---|
| 전역 main | _twRecord/activateTimeWarp 첫행의 _twSyncSpaceOwner로 현재 G/P/map/stage/mw/mh/Boolean(arena)를 비교. URL opt-in0 |
| 교체 | 객체 identity 또는 해당 값 변경 시 idx/filled0. 같은 G/P/stage여도 arena 진입 bool 변경·field restore의 새 map은 이전 기록 소비0 |
| 저장과 구분 | 기존 300buffer·10record 최소 유지. 46-key field capture/restore·P/INV·지형·충돌·자원/전투식·save schema/API 변경0 |
| 정지 검수 한계 | CPU의 producer 배제는 통제 G.on=false/dead/fallen 범위. 실제 paused/hidden·등록 이벤트·전체 update 검수로 확대하지 않음 |

field200×200와 CH1 arena128×108의 기존 맵 권위/진입·복귀 좌표는 유지한다. 이번 수명 key는 그 경계를 넘는 과거 좌표를 기존 ringbuffer에서 잘못 소비하지 않도록 한다. 정상 같은 공간 rewind 및 기존 비용/쿨다운/효과/합체는 변경하지 않는다.

소스는 working4,113,146B/`30b33fab3c562cd2c98baa545954d0b79a4ee67be4a63d32d866da91987ed770`, owned4,112,961B/`393c08dd6cd0359f32f7caec00737bc22085535090f03458f091a34a0f78fbf2`의 ROOT3hunk다. 최종 통제 wholefunction CPU Node1/VM13·7그룹74PASS/exit0, 이전 원소스 Node1/VM1 반례관측2조건은 별도이며 clean 합산하지 않는다. 고정 unhandled metadata를 rejection 관측값으로 사용하지 않는다. native/Chrome0·IAB13 old-loaded 유지·새 시각 NOT_ASSESSED/전체 **RETOUCH**. §23 표준 보고는 ROOT 별도 report 소유이며 이 CPU 결과로 맵/카메라/TECH/native PASS를 선언하지 않는다. 상세 스킬 계약은 [2_1 정본](<../2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md>)의 같은 TASK 절을 따른다.

기존 §7의 모든 스폰 PLAY 보장 문구는 이번 소환수 안전 위치 검색 null까지 보장하는 보편 명제로 확장하지 않는다. 본 절은 실제 반경 성공 보정과 null 원좌표 보존을 구분한다.

## 2026-10-08 bossSummonWind 실제 소환수 반경 위치 소비

작업 ID: `ROOT-DRUID-SUMMON-SAFE-POSITION-CONSUMER-20261008`. 본편 `game.html` 공통 소환 상태의 현재 계약이다. CH1 또는 URL opt-in 한정 기능으로 해석하지 않으며, easy판·다른 스폰 소비자 수정/검수를 뜻하지 않는다. 원 source9 및 기존 검수 원문은 해당 epoch의 이력으로 보존하고 아래 현재 계약을 우선한다.

| id / 적용 위치 | 현재 계약 | 보존·미인수 경계 |
|---|---|---|
| `bossSummonWind` 위치 보정 | mkEn이 반환한 실제 소환수 `ne.r`로 안전 위치를 검증하고 성공한 결과만 `ne.x/ne.y`에 반영 | 보스 자신의 반경으로 소환수 footprint를 대신하지 않음 |
| 검색 null | 좌표를 새로 대입하지 않고 mkEn 반환 좌표 보존 | 보스 좌표로 강제 fallback 없음. null에서도 안전 배치가 보장된다는 뜻은 아님 |
| FX | 기존 `ens.push` 뒤 최종 `ne.x/ne.y`를 사용 | 기존 삽입/효과 순서 유지 |
| 수량·전투 | 기존 `3+trunc(stage×.5)`, HP 절반·shield0 유지 | RNG/생성 인자·전투식·저장 변경0 |
| 예외·회복 | 기존 `finally`의 recover70f 유지 | mkEn null의 기존 `ne.hp` 예외와 부분 삽입 prefix·원 예외 전파를 새 rollback/retry로 변경하지 않음 |
| 전조 시간 | 기존 `tele || 55` fallback, 소환 metadata `tele=45` 구분 | 기존 문서의 고정55f는 이전 표현이며 모든 실제 소환 전조가55f라는 뜻으로 사용하지 않음. 타이머 수치 변경0 |
| 맵 권한 | 기존 map/isW/canMv/safePt/nav 소비 유지 | geometry·stageLOCK·scene·원PNG·collision/route 설계 변경0 |

| 근거 | 상태 |
|---|---|
| working game.html | 4114570B / `2639d248b63b748a2bdc2f33dbabe6c22afe353a599e7bdba80d9a1db589a050` |
| owned game.html | 4114385B / `9466d5bccc5b3799f71adee0af0f6f6240cacaf0ac88043f621b299797c6d19e` |
| 변경 | 2hunk/+110B. ROOT implementation receipt의 working/owned inverse exact; foreign185B 미채택 |
| CPU | 첫 Node는 하네스 G04의 닫는 괄호 누락으로 module parse 실패/제품 조건0·20미도달. 해당1문자만 새 파일에 보정한 최초 제품 suite1은 Node1/newFunction2/fixture32/VM0, 6그룹20PASS(동적18·정적2), FAIL/setup/미도달0·exit0. before 벽겹침 반례1은 별도이며21clean으로 합산하지 않음. 물리Node총2. 실mkEn/전체update/실맵/native/음향/save 검수 아님. |
| native/시각 | whole-map native NOT_RUN/미인수. 실제 보스 자연 도달·벽 인접 소환 화면·전체 route·GPU·청취·저장 인수 없음 |
| 판정 | 최소 본편 구현·통제 CPU 한정 검수 완료이며 이번 화면 NOT_ASSESSED / 전체 VISUAL RETOUCH. 옛 source9 검사와 합산하지 않음 |
| Git | ROOT 최종 completion 및 remote-preservation 영수증에서 소유 code/docs 정상 보존 여부를 확인한다 |

외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-druid-summon-safe-position-20261008/implementation-receipt.json`, `docs-search.json`, `docs-disposition.json`, `docs-sync-plan.json`. CPU 수치는 ROOT의 cpu-corrected-execution-receipt.json 기준이며 native/시각·청취·durable save로 승격하지 않는다.


<a id="ch1-warrior-contact-shadow-default-20261008"></a>
## 2026-10-08 — 전사 2.5D 시험 경로의 접지 core 기본 표시

`ROOT-CH1-WARRIOR-CONTACT-SHADOW-DEFAULT-20261008`: 기존 접촉 AO의 요청 상수 한 곳만 변경했다. 아래는 표시 기본값 계약이며 물리 고도·시각 승인 완료를 뜻하지 않는다.

| 항목 | 현재 계약 |
|---|---|
| 요청 | `_ch1RigRequested && new URLSearchParams(location.search).get('ch1FootAO')!=='0'`. hostname127.0.0.1/localhost·port3387·`ch1Three=1&ch1Rig=1` 시험 경로 안에서 기본 ON. 첫 query값이 정확히0일 때 OFF; 누락·1·그 밖의 값은 ON. 일반 게임 기본 옵션 추가 없음. |
| 캐리 | 기존 로비 carry4키에 ch1FootAO를 추가하지 않는다. 명시0의 왕복 유지 보장은 없고, 생략된 복귀 URL은 시험 경로의 새 기본ON을 따른다. |
| 기존 대상·현재성 | class0/HP>0/P.s idle/idle·walk·run, 같은 now/frame/map/actor/animator 및 alive/scope, 준비된 body frame·현재 record의 단회 가드 그대로. 다른 캐릭터·공격·점프·사망 확대0. |
| 기존 표시 | 원래 shadow 유지. 같은 중심, core rx=shW*.35 / ry=(_pR*.35)*.4 / black alpha.10 / ground matrix6 scalar 후 restore. 본체 geometry·발 좌표·바닥 Y=0 불변. |
| 한계 | body blit 직전 AO이므로 이후 blit throw/silent upload 실패의 픽셀 rollback 없음. crop 하단의 해부학 발·물리 고도·전체 fallback pixel 동일성·native/A급 승인 보장 없음. contactShadow.accepted:false 등 승인 플래그 불변. |
| 검수 | 저위험 표시 기본값1hunk이므로 새 tests/Node/VM/GPU/Chrome/audio/PNG/save0. 새 actual source 요청→기존 capture/body consumer 정적 대조와 peer blocker0만. 기존52조건/native2 관측은2026-10-07 이력으로 재실행·합산0. |
| 보존 | main working/HEAD 선 fullbyte2백업·같은1hunk·inverseexact·foreign185B 미채택 유지. 원PNG/scene/nav/LOCK/새 RAF·timer·save 스키마 변경0. 실제 사용자 탭 reload/조작0; 새 코드 live 적용 주장 없음. |

**VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED.** 외부 `ch1-warrior-contact-shadow-default-20261008/completion.json`의 §23 보고와 최종 GIT을 따른다.
