## 2026-10-08 — CH1-1 런타임 나무 층 + 시작 카메라 클램프

| 순서/위치 | 내용 |
|---|---|
| 청크 바닥 직후 | `Ch1ForestSway.draw` → `Ch1FaceLife.draw`(군락 앵커 61) → **`Ch1RotTrees.draw`**(구운 나무 36그루 런타임 스프라이트: 5조각 shear 흔들림·전체 눈 깜빡임·혹/입) → `Ch1BorderForeground.drawBack`. 나무 본체는 더 이상 청크에 없음(헤일로만). 청크 cache key `20261008-rotforest-98` |
| MAP_OBJS 패스 | `_OBJ_META[id].rotTree`가 있는 `m_ctree13~20`은 `Ch1RotTrees.drawObj`로 그림(실패 시 기존 `drawImage`). y정렬·occ 가림·충돌 불변 |
| 엔티티 위 전경 | `Ch1BorderForeground.drawFront`의 나무 9그루 = `Ch1RotTrees.drawTreeBand`(같은 흔들림의 띠 사본) |
| 카메라 | `_clampCamToMap()` 헬퍼 = 맵 bounds 클램프(기존 update 공식). `update()` 매 프레임 + `_loadZone`·`initStage`·`_startIntro` 카메라 세팅 직후 호출 — `G.on=false` 인트로/튜토리얼 정지 프레임에서도 맵 밖(구형 지형 폴백) 비노출 |
| 첫 화면 준비 | `_prepareStartScene` pending에 `Ch1RotTrees.qa().pending` 합산 |

SSOT: [CH1_ROTTEN_FOREST_RUNTIME_TREES_PASS98_20261008.md](CH1_ROTTEN_FOREST_RUNTIME_TREES_PASS98_20261008.md), 카메라는 [CH1_HIDDEN_UNDERLAY_20260929.md](CH1_HIDDEN_UNDERLAY_20260929.md) 10-08 절.

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
