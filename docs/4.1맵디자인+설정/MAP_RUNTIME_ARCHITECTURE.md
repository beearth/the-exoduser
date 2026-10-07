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

### ROOT-CH1-1-THREE-TERRAIN-CONSUMER-20261007 — 실제 1-1 지면 연결

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
