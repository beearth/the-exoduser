> 2026-10-16 통합 범위: 웹 본편 수치·현행은 최신 main 기준, 별도 Native/FDG 항목은 source pin9a4534b4의 부분 이식·명시 opt-in 계약이다. 전체 최신 본편 이식 완료가 아니다. 상세: docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md.

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

## native 원근 지면 coverage 수리 — 2026-10-15

현재 NativePerspectiveView는 원R36376~36379의 map-bound 의도를 실제8000×8000 source 두 floor pass와 원근4corner footprint에 적용하여 E전진 남쪽 끝의 하단 void를 막는다. camera angle/distance/zoom·기존INHERIT보간/Player·맵좌표/geometry/navLOCK/지면extent·UV·원PNG 변경0. 기존 ray API cached transform으로 첫coverage2FAIL→OFF진단2PASS→최종실Projection+global_transform/INHERIT3PASS로 구분, 총새GPU/Main3/각error0·Camera2DWarning1, 옛E18/Q/공간/PNG·asset/import/hash재연0. 이식 전체/전camera품질은 여전히RETOUCH/latestfullfalse. [정확알고리즘·실제값·실패/진단·최종영향검수·MAP REPORT](../engine/FDG_GODOT_NATIVE_FIRST_20261013.md#perspective-ground-coverage-20261015)를 따른다. 기존후보/GUI/ship은 보존하며 이 checkpoint를 과거 launcher와 혼동하지 않는다.

## 2026-10-14 원본 OBJ metadata 현재owner 반영

| 현재 범위 | 코드·최초 검증 |
|---|---|
| originalsameWorld metadata | 원초기77→CHDECO250in-place merges/기존31sameDict/현재296key. RHS28원JSfalsy·optionalfield조건보존/knownundefined4226은present키+null+declaredUndefinedmask/untouchedabsent와분리. |
| 원current후처리쓰기 | 실제edge4현재Canvas교체뒤samecurrentMeta _edgeErasednumeric1작성/원Metaamount유지/metadatawritegap4해소. CSS5실처리미완 _filterBakedwrite0/strictfullOBJ·WaitStageNR/sourceG.onfalse. |
| API·수명 | get_source_object_meta_publication()0arg / get_native_source_object_meta(key,field="")2arg(currentref/present/mask) / signal native_source_object_meta_changed(key,meta,phase). INITIALIZED77+MERGED250+CALLBACK_WRITE4=331events/epoch·ref·lifetime/신호재진입취소guard/namespacewithdraw. |
| 새검수 | actualMain1 FIRST13/13 PASS7.985673초/ERROR0/CameraWarning1/product수리0. 기존OBJ14/extra23+2/원성공군·PNG자료재검수재연0/신규helper·testleaf·assetcopyhashimport0. |

정확API·28필드·296/4226값·원JSmerge/필터미완·nullmask외부쓰기한계는 [중앙 엔진 정본](../engine/FDG_ENGINE.md)의 「원본 OBJ metadata 실제 현재 소유·후처리 쓰기」를 따른다. 이전meta원writer4미연결은당시이력이다. MAP PRODUCTION REPORT: currentmetadata+flagwriteronly,geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.**

> **2026-10-14 실제 Main 커튼 서비스:** 기존 HUD에 ART 원view를 hidden bind하고 실제900ms callback을 소비했다. 첫15 중14valid/1FAIL→실패only1clean(906ms callback1), 제품수리0·성공재연0. sourcecontroller/G.on/600frames/GPU/fullMain 미연결, shadow80px/z45 gap 유지. 함께Root G-only publicplanner9/292와 Startup 원producer14/791를 동결기술scope로 정상 보존하며 실제Gwriter/18fields 일괄ACK0. [Main 커튼 정본](../engine/FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_FIRST_20261014.md).

# MAP RUNTIME ARCHITECTURE — EXODUSER: HELL LORD

> 현행 검수(2026-10-11): v0.17은 명시 ENGINE_AUTHORING terrainCutaway로 실제 투영된 높이 지형 안쪽의 전경만 노출한다. 별도 QA 입구→경사→정상420px, Z0→34.398→64, 저장/reload를 확인했다. 수정 후 경계16px 이상 바깥30,358픽셀은 RGBA 차이0이다. 이번 높이 지형 노출 범위 VISUAL PASS / 전체 production FAIL·UNADOPTED. 마지막 v0.17 표가 현행이며 이전1057/Play8/R1/R2/v0.16.2 검수는 동결·재실행0이다.

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
- **현행 오브젝트 콜라이더:** 원(`colSz`), 타원(`colW/colH/colOy`), `colParts` 기반 회전 사각형 조합을 지원한다. polygon/알파 마스크 기반 콜라이더는 없다. `_ensureColObjs`/`isW`의 회전·scale·부분 사각형 전처리 계약을 보존한다. FDG 타일 미리보기의 원형 타일 충돌은 본편 `MAP_OBJS`/hill/bone 판정을 대체하지 않는다. [FDG adapter 범위](../engine/FDG_LEGACY.md).

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
- 컬링: 적 AI ±300px(28577) / 적 draw pad 120~200px(44371) / 투사체 원거리 despawn은 거리제곱6250000 초과 및 실제 가시 영역+100px 밖(2026-10-31; 기존28771은 옛 라인) / 타일 뷰포트 범위(43533) / 아이템 ±40~150px.
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

## 2026-10-10 FDG 제작 스튜디오 연결

맵 브러시·RLE·리소스 편집은 [FDG 엔진 계약](../engine/FDG_ENGINE.md)을 따른다. field200×200/T40·editor1=floor, canonical CH1-1 경계 스냅샷 및 시작100,185/출구100,7을 기술 미리보기로 사용한다. 본편 적용은 `genFromTemplate`/`_MAP_COMPOSE`/gate/콜라이더 어댑터 단계다. 기존 layout/texture 에디터 정본은 유지한다. [두 체크아웃 통합 경계](../engine/FDG_INTEGRATION_INTERFACE.md).

## 2026-10-10 FDG 높이 geometry 시험의 범위

| 항목 | 계약 |
|---|---|
| 새 시험 | Studio optional terrainScene v1의 실제 XYZ primitive 계단/경사/플랫폼/회전기둥. 높이64px/8단·단높이8·경사.25·허용단차12/경사.6, 기존 FDGRuntime tile 원충돌+terrain support |
| production 경계 | 기존 CH1-1 제단147,98의 logical height1·원래 ramp entry·stage/nav/LOCK/START/EXIT 유지. 새64px는 production height1 변환값이 아님. 1-1↔1-2 전이/arrival/waypoint는 MAP manifest 제출 전 엔진팀 임의 ID 생성 없음 |
| 제작/QA | full MAP guideline/SSOT 순서 적용, 신규 primitive 시험만 CAMERA/TECH 확인. 기존 r9·원PNG·실제 맵 제작 Gate 재검수0 |
| 정본 / 보고 | [모든 새 수치·미완료](../engine/FDG_TERRAIN_SCENE.md), [신규 §23 보고](/Users/fordeargamers/.codex/visualizations/fdg-height-scene-20261010/engine-review.md). primitive 시각 PASS와 production 완성맵 FAIL 판정 분리 |

## 2026-10-10 FDG 독립 World 참조 소비 v0.7

| 구분 | 실제 구현 / SSOT 경계 |
|---|---|
| ENGINE_FIXTURE | 기존CPUterrain geometry2지역만·areaKey engine_fixture_a/b·stageRef ENGINE_FIXTURE/A/B. exit 실제접근/gate/arrival/camera/지역state/저장복원. source게임맵등록0 |
| MAP corrected-v2 | 두JSON실제참조→World스키마검증PASS, stageId si0/stage0·si1/stage1(_CH1S1)은stageRef출처. map_reference_stage0/1은엔진참조ID이며생산areaID등록아님 |
| null/DERIVED | source scene/resource설명·8구역·graph proposal·분지100/122 보존, sceneProject/arrival만엔진정규화null. basin을입구로발명0·미확정edge등록0·unresolved-scene정상실패 |
| 진행보존 | REGION→gate→exit→bossarena→bosskill→stageCleared→nextStage→si1. 실제boss중간scene/도착/관문계약없이직접1-1→1-2 이동 추가0 |
| 높이/ground/nav | source논리0..1·원좌표/반경/절벽설명보존. fixture64px/120px로환산0. exactarrivalXYZ/camera/manifest/height물리단위/nav/reentry확정필요 |
| UI/인수 | v0.7지역속성목록뒤v0.8에서같은지형map/graph/실제WP발견·활성·이동UI구현. 실제 MAP 등록은후속. 실제CH1등록/전환0·game/save/원PNG/nav/LOCK0·완성환경visual인수0 |
| 정본/§23 | [FDG_WORLD_TRANSITION](../engine/FDG_WORLD_TRANSITION.md), E/fdg-world-transition-20261010/engine-review.md. primitive시험PASS와생산환경FAIL분리 |

현행 v0.8의 새필드/상한/단위/수명·21신규검증/실제UI/UTF-8 JSON byte왕복은 [동일 World 지도·웨이포인트 정본](../engine/FDG_WORLD_MAP_WAYPOINT.md)을 따른다. 실제 CH1등록/전환0·기존완료suite재실행0·GPU/native/완성환경 인수미완료를 유지한다.

## v0.8 동일지도·웨이포인트 ENGINE_FIXTURE 소비

| 계약 | 값/소비 |
|---|---|
| 지도 | 현재CPUterrain bounds/resources/nodeyaw footprint·실제actorXYZ/camera가mini/region에동일소비, graph는실제areas/transitions만. layout좌표는UI전용 |
| 시험WP | engine_fixture_wp_a/b, A(cx−31.2,cy+46.8,0)/B(cx+31.2,cy+46.8,0), discovery24/activation16px·Ztol16, arrivalIdarrival·B추가fixture_gate_open. 생산WPID등록0 |
| 진행/도착 | 실제enabled/open directed route·중간boss scene/arrival·대상travelGateKeys·원형floor/terrain support를source수명변경전검사. MAPchain관문우회0 |
| 검수 | 새21고유PASS·실제WP발견/활성/차단/저장/byte왕복/685편집. MAPsource corrected-v2/새delta추가소비0·실제CH1등록/전환0·기존맵아트/nav/LOCK변경0 |


## CH1-1 source data 첫 검토 · v0.9 당시 기록

당시 원본 검토/이미지 helper만 구현했고 project/world 생성·실제CH1 렌더/이동은0이었다. 이 검사 완료기록을 다시실행하지 않는다. native revision-v2에서 기존 collider85 표기는 visual placements85로 정정됐다. 원본 논리높이0..1과 명시 엔진 환산은 별도이며, 현재 실행 구현과 미제출source는 아래 v0.14 미리보기와 별도 물리 실행 정본을 따른다.

## CH1-1 원본 이미지·흙 바닥 제작 미리보기 · v0.13 완료 동결

| 구현 / 상태 | 계약 |
|---|---|
| 실제 제작 흐름 | [미리보기 정본](../engine/FDG_SOURCE_VISUAL_PREVIEW.md): 기존3333 exact 승인 props9+soil1=10 PNG·native85 imageLayers 유지·polygon-only 이동·owner60Hz/camera·전용 저장/재열기 |
| 바닥 | 승인 soil ground_dark_soil.png 실제1024×1024 fullcrop; ENGINE_AUTHORING origin[0,0]/repeat1024×1024/opacity1·원 brightness.85/saturation.48. 원53 tile-corner×40 polygon clip 후 ground→props/actor. visible repeat 최대64, native UV UNKNOWN·나머지 mask/litter/commonSkin3 PENDING |
| 실제 결과 | 기존4020,7410에 바닥 설치→공개북쪽10px→4020,7400·camera4020,7400/followtrue·저장/다운로드JSON/reload 복원. 현재viewport 원본4/85·native 캐릭터·흙 표시. START4020,7420 유지 |
| 경계 | UNADOPTED; 실제collision/cliff/logicalHeight SOURCE_PENDING·height:null·actualObjectColliderCount:null·native anchor/crop/origin/START심볼UNKNOWN. World/스킬/VFX 차단. sourceScene 물리/production 인수는 대기 |
| 검증 / 시각 | 새ground contract 수정후4/4 + runtime 첫4/4 =8고유PASS; 첫contract helper import누락0/4 실패/수정 증거 보존. 완료13/5·15/23/16 등 이전suite 재실행0. 현재captured error0·preview VISUAL RETOUCH / production FAIL. 실전FPS/VRAM/Windows 미측정 |


## CH1-1 정확 높이·경사로·절벽 제작 미리보기 · v0.14 동결 이력

| 구현 / 상태 | 계약 / 실제 인수 |
|---|---|
| 정본 / 입력 | [미리보기 정본](../engine/FDG_SOURCE_VISUAL_PREVIEW.md); optional sourcePreview.heightPreview에 실제 source-v4 full envelope·nativeParams11·exactEvaluator3개를 소비. tx=worldX/40, ty=worldY/40 연속좌표; sample tile은 셀인덱스, px는 셀센터. source 논리0..1은 원본 물리Z가 아님 |
| 작성 환산 / 이동 | ENGINE_AUTHORING scale64/offset0, engineFootZ=offset+logical×scale; maxStep16/maxSlope.75. 원 polygon nav + 정확 point band + 엔진 보수적 원형발 gate, 서쪽 ramp 원 전체 포함 시 통과. actor 저장XY2·height:null 유지, 내부Z만 파생. follow cameraY=actorY−engineFootZ |
| 바닥 / 부하 | 기존 승인soil1·props9/배치85 유지. owner-local 원soil 높이 cache1720×944·2024삼각형 최초 build1회, visible frame1draw/offscreen0. 각축2048/총4194304pixels 상한, flat repeat64+cache1→groundDrawCalls65 상한; 현재 nominalRGBA6494720bytes, disposepixels0. 원53/nav/PNG 재작성0 |
| 실제 경사로 QA | 별도 QA actor4990,3940→공개동쪽10px×23=5220,3940·원식 logical0.5747500000000001/Z36.784000000000006(실제UI0.5748/36.78). offset1 편집→원논리 동일/Z37.784000000000006(실제UI37.78),0복원+20회=5420,3940·logical1/Z64·camera5420,3876/followtrue. 저장/다운로드JSON/reload 복원. START4020,7420으로부터 도달 검수0 |
| 실제 절벽 QA | 별도 동쪽6670,3940→서쪽3회6640,3940/Z0; 4번째6630 시도 source-cliff-band 차단/XY·Z 유지. 저장/JSON/reload XY6640,3940/Z0. blockedReason은 현재 이동 결과로 저장하지 않음 |
| UI / 첫 실패 | heightReady=선택heightPreview+런타임 logicalHeight/engineFootZ finite. 새project/이전runtime 설치 전환의 toFixed 오류를 수정. entry studio.js?v=0.14.1, 높이 모듈·관련 import0.14.0. 환산 편집 시 heightEngineAuthoredInputSnapshot/heightRuntimeObservation/camera도 동기화. 수정 후 해당 entry captured error0 |
| 신규 검사 | height contract 첫4/4PASS + runtime 첫2/4PASS(검사용 긴sweep·잘못된loadAssets 호출2FAIL), fixture/public load 수정 후 affected2/2PASS = 신규8고유PASS. 기존 preview13/server5/soil8/15·23·16·원9PNG/source/Git 동결 검증 재실행0 |
| 경계 / 시각 | logicalHeight/cliff SOURCE_CONSUMED, 실제 object collision SOURCE_PENDING·actualObjectColliderCount:null/UNKNOWN. sourcePhysicalZClaim:false·native UV/anchor/crop·다른ground3 PENDING. World/스킬/VFX/본편 물리/production 미인수. 절벽 장식이 캐릭터를 가림·높이 시각 가독성 보정 필요: preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL |
| 새 증거 | 외부 engine-stage0-height-preview/actual-height-proof.json·actual-height-ramp-mid.png·actual-height-ramp-reopen.png·actual-height-cliff-blocked.png·실제 export2개·신규검사/ownedpatch/checkpoint/§23 engine-review.md. 60FPS/VRAM/Windows 성능 미측정 |


## v0.15 완료 이력(동결) · 원본 미리보기 가림·높이 가독성 보정

앞의 v0.14 높이·soil·원본/검사 증거는 당시 이력으로 동결한다. 현재 수치·API 전체 정본은 [원본 제작 미리보기](../engine/FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.15 표를 따른다.

| 항목 | 현행 결과·범위 |
|---|---|
| 저장 / 분류 | optional appearancePreview version1/engine-authored-readability; provenance.appearanceEngineAuthoredInputSnapshot에 전체명시작성입력. native anchor/crop/origin·실collider UNKNOWN, sourcePhysicalZClaim:false 유지 |
| actor / depth | 현재sprite frame과기존projected depth 순서. actor1회, 교차한앞장식 body ellipse 내부.24/band.62/feather8px·밖원opacity. foregroundCutawayObjects/cutawayDrawCalls 추가. actor를맨위에덧그림0 |
| terrain / cache | 원soil·원height만소비. directional light[-.45,-.65,.75], ambient.45/contrast.65·flat1normalize·brightness.55..1.2. south profiles128/32기준max96·probe.5px/rasterheight>.25px·faceopacity1/brightness.55. 신규receipt profile80/wall184/total2208/shaded329; 기존cache1·1720×944/6494720bytes·ground<=65 유지 |
| 부하 / query | props<=255draw·ground<=65, source consumer<=320(actor/배경별도). entry/관련modulev0.15.0·pureheightv0.14.0·physical/CSSv0.10.0/ASTv0.11.0 유지; GPU/native성능 claim0 |
| actual QA | 별도cliff6640/3940/Z0 actor표시→공개북쪽10px차단/좌표유지/save/export/reload. ramp5420/3940→서쪽10px×20→5220/3940/Z36.784000000000006·camera5220/3903.216/followtrue/save/export/reload. STARTreachability검수0 |
| 신규 검사 / 오류 | pure4첫PASS+runtime4첫PASS=8신규고유PASS·fail0; oldheight8/soil8·완료suite/원PNG/count/봉인반복0. 새publicUI captured error/warn[]; 처음artifact필터가번호download제외하여wrongbase선택한실패는수집만교정·기록보존 |
| 시각 / 대기 | actor 완전가림해소, 큰장식이원height경계를가려terrain가독성약함. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. native per-prop source crop/origin/pivot/depth·실제 _OBJ_META+stage0 collider인스턴스입력대기 |
| 증거 / 범위 | 외부E/engine-stage0-readability-preview의newpictures/exports/firsttests/API/patch/projection/§23보고. game/nav/sourcegeometry/LOCK/START/EXIT/본편save/PNG변경0·새reviewUI/기능/팀확장0·push/deploy0 |


## v0.16 수동 충돌 소비 완료 이력(동결) · 2026-10-11

v0.15 가림·명암과 앞선 height/soil/원본 검수는 완료 이력으로 동결한다. 이번 변경은 별도 QA 위치에서 실제 v6 수동 배치 충돌을 소비하며 전체 맵 또는 START 보행 인수가 아니다.

| 항목 | 현재 코드·수치·상태 |
|---|---|
| 원본 입력 | MAP/ch1-1.hand-colliders.execution-v6.json; handProps36 / metadata type28 / collisionEnabled13 / collider entry13. visual85와 서로 다른 집합. 전체 native collider count UNKNOWN |
| native 의미 | game.html _rebuildColObjs/isW: colSz는 원반경, colW/colH는 타원 X/Y반경. v6 row 수치는 scale 적용 완료 → 재곱셈0·/2변환0. ellipse centerY=effectiveWorldY+colOy; offset에는 scale을 곱하지 않음 |
| adapter | normalizeMapSourceHandColliders(input)→{ok,errors,pending,sourceExecutionData}; 전체 raw nativeExecutionSnapshot·unknown metadata와 MAP_HAND_COLLIDER_BINDING version1을 별도 보존. exact onFloor tile-center=(rawTile+.5)×40만 변환; off-floor snap UNKNOWN→SOURCE_INPUT, raw colParts 미전개→ENGINE_IMPLEMENTATION pending. attachMapSourcePreviewCollision(existingProject,{sourceExecutionData,scope})는 candidateProject만 반환; project/world:null, adoption UNADOPTED |
| subset contract | collisionPreview version1/native-object-collision-subset; exact canonical array/count·full source envelope·scope 보존. scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32 필수. fullObjectColliderCount:null/sourcePhysicalZClaim:false. geometry claim은 제출된 2D subset에만 한정 |
| 선택 설치 | sourcePreview.status.collision=SOURCE_SUBSET_CONSUMED; provenance.supportedSourceObjectColliderCount=13 / collisionSourceRole=native-object-world-px-subset / collisionEngineAuthoredInputSnapshot={scope}; provenance.actualObjectColliderCount:null·productionAdopted:false·nativeAnchor/Crop/Origin UNKNOWN 유지 |
| 이동·저장 | source world XY에서 기존 polygon → subset 전체 발 원 충돌 → exact cliff/height 순서. 발 radius1..19, EPS1e-7 접촉 차단, ellipse 거리48회, sweep 간격<=min(10,radius)·최대16384. 막히면 XY/Z·카메라 유지; 허용 이동은 카메라 worldY−engineZ 추적. runtime capture/JSON/reopen에 PARTIAL과 unresolved 저장; blockedReason은 재열기 시 초기화 |
| runtime/UI | navScope polygon+exact-native-hill-band+source-object-subset; sourcePending=[collision-assembly]; collisionCoverage PARTIAL/supportedSourceObjectColliderCount13/fullObjectColliderCount:null. 화면에 수동 배치 충돌 13영역 · 전체 연결 대기 · 별도 QA 배치 / production 미인수 표시 |
| cache | entry/studio/runtime/project/map-adapter/source-panel/source-preview/source-preview-runtime 및 new collision/source-scene exports v0.16.0. appearance/height-ground v0.15.0, exact height v0.14.0, 기존 physical consumer/CSS v0.10.0·AST v0.11.0·World0.8.x 유지 |
| 새 깊이 receipt | 772×370 fakeCanvas mid: visiblewalls39·depth3994.25..4190.029676289736·wall90draw; summit37·depth3994.25..4175.406771212186·wall86draw. 두곳 visibleprops3 projecteddepth3980/4260/4820;4260/4820 props는모든visiblewall뒤에그려지므로여전히윤곽을덮을수있다. fakeCanvas는시각PASS/PNGalpha/실가림양증거가아님 |
| 신규 검증 | pure contract 최초4/4 PASS + runtime/adapter/owner 최초4/4 PASS = 신규 고유8/8 PASS·fail0. actual circle3297→3307,7380 east10허용/다음east10차단/north10허용→3307,7370; ellipse1586.5→1596.5,4020 허용/다음east10차단/north10허용→1596.5,4010. 각각 save/export/reload·camera followtrue/Z0 보존. native rotation0만 실제 입력, 회전 ellipse/expanded box는 synthetic UNIT만 |
| 시각·잔여 | preview VISUAL VERDICT RETOUCH / production FAIL. 큰 장식의 native pivot/opaque/depth identity 미확정, 캐릭터 대비 약함. 수동13 전체 추출·렌더85와 연결을 같다고 주장하지 않음. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending을 원 snapshot에 그대로 보존 |
| 상세 SSOT·증거 | [FDG_SOURCE_VISUAL_PREVIEW](../engine/FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.16 계약·13수치·새 QA표; E/engine-stage0-collision-preview/engine-review.md(§23), 신규 first-test2개·actual-collision-ui-proof.json·actual-collision-export-proof.json·실제 캡처/exports. 별도 pageerror/404/실전 FPS/GPU/Windows 인증 claim 없음 |

## v0.16 동결 AUTHORING 이력 · DESIGN START → EXIT 실제 제작 종주 (2026-10-11)

같은 실제 CH1-1 sourcePreview에서 정상 시작 초기화 후 공개 입력으로 제작 종주를 마쳤다. 앞선 v0.16 충돌 최초8검사·별도 위치 QA 및 v0.12~v0.15 증거는 동결 이력이며 재실행·재집계하지 않았다. 이번 변경은 코드0·상태 문서만이다.

| 항목 | 실제 관측 / 인수 범위 |
|---|---|
| 시작·원본 | 기존 DESIGN START4020,7420으로 정상 초기화1회. 원 soil·visual85·height64/0·native 수동 subset13·nav·START/EXIT·배치·source snapshot 보존. 도중 위치 강제설정/teleport0 |
| 실제 입력 | Play clock0.283초 → 공개 ArrowUp 단일 press 후0.367초/변위0 → 정지0.400초. 이후 paused AUTHORING의 공개10px 이동 버튼1057회: 허용1056회/차단1회/실이동10560px. 연속 키보드 Play 보행 PASS 주장0 |
| 경사로·충돌 | START→4020,3940→4990,3940/Z0→5220,3940/원0.5748·Z36.78→5420,3940/원1·Z64→4020,3940/Z0. 직진 북쪽 입력637은4020,3860에서 native-hand-8-m_c1tree 차단/변위0. 공개 서쪽 우회 후 원 EXIT근처4020,300 도달 |
| 저장·수명 | EXIT save/JSON export/reload 후4020,300·camera4020,300/followtrue·logical0/Z0·subset13/PARTIAL 보존. actual export를 공개 import해 같은 장면 교체 경계도 확인·clock0.000초. 기존 setProject의 previous consumer dispose 및 pagehide의 owner dispose 경로를 사용; private disposed counter·listener/VRAM 누수 계측은 미실행 |
| 잔여·시각 | fullObjectColliderCount:null/actualObjectColliderCount:null·productionAdopted:false. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending 그대로. native collider↔visual85 identity/crop/origin/pivot/depth·본편 전투/스킬/VFX/보스 관문/1-2 연결 미인수. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL |
| 신규 증거 | E= /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-route-preview. actual-route-step-trace.json(1057행)·actual-route-ui-proof.json·actual-route-export-proof.json·actual-route-lifecycle-proof.json·actual-route-exit-export.fdg.json·실제 캡처·engine-review.md(§23). 신규 자동 suite0·완료 proof 재실행0·push/deploy0 |

## v0.16.1 완료 이력(동결) · 실제 Play 입력과 v7 추가 충돌 (2026-10-11)

같은 승인 CH1-1 원본 제작 미리보기에 공개 연속 방향 입력과 MAP v7 변경분만 연결했다. 이전 v0.16 AUTHORING START→EXIT1057회·collision 최초8검사·v0.12~v0.15 증거는 동결하여 재실행·재집계0이다. 이번 연속 보행 증거는 paused10px 제작 이동과 별개다.

| id / 적용 위치 | 코드 계약 / 실제 관측 / 인수 범위 |
|---|---|
| FDGRuntime.setMoveInput / moveInputDirection | setMoveInput(direction)는 문자열 west/north/south/east 또는 null만 소비. null은 clearInput, 방향은 inputEnabled+running에서만 허용하고 keyboard Set을 비운다. getter moveInputDirection은 현재 방향 또는 null. 실제 actor 위치를 즉시 바꾸지 않고 기존 owner _update(dt)의60Hz tick에서 속도156px/s로 이동. 별도 입력 timer/RAF0. 기존 keyboard WASD/방향키와 대각 정규화 유지 |
| 입력 해제 / 수명 | 같은 방향 다시 클릭·이동 해제·유효 keyboard 이동keydown·canvas/window blur·document hidden·입력disable·pause/stop/dispose는 held UI 방향을 해제한다. UI 방향keydown 전환에서는 keyboard가 이어받는다. focusin이 이동 제어영역/캔버스 밖으로 나가면 clearInput. setProject는 _applyProject 뒤 pause하여 기존RAF 취소·입력/accumulator 해제 후 asset load; 교체 후 clock0/paused. step은 해제된 입력 상태의1/60초 |
| 공개 UI / DOM | source-play-controls role group 내 source-play-west/north/south/east는 aria-pressed native button, source-input-stop은 이동 해제. running 준비된 sourcePreview에서만 방향 활성. source-input-state leaf role=status에 현재 방향/해제/일시정지 표시. source-delta-import+source-delta-file은 공개 파일선택. 4방향click+해제click+document focusin+delta open+filechange=신규 UI handler8개; 부모 컨테이너 textContent 교체0 |
| v7 추가 자료 / API | map-source-adapter.js applyMapSourceHandColliderDelta(previewProject,{delta,scope}) → ok/errors/pending/candidateProject/sourcePreview/project:null/world:null/adoption:UNADOPTED/inspection. 실행 중·4MiB 초과파일·프로젝트 변경race·중복delta·비canonical baseline·invalid data/scope는 설치 거부. 새 후보만 store.replace하며 현재 actor/camera를 capture해서 유지. 상세 계약은 FDG_HAND_COLLIDER_DELTA_V7.md |
| v6 원본 / v7 / 작성권위 | collision sourceExecutionSnapshot.nativeExecutionSnapshot은 기존 raw v6, nativeDeltaSnapshot은 전체 raw v7, baseSourceExecutionSnapshot은 기존 normalized13을 각각 보존. ENGINE_AUTHORING scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32를 별도 보존. 원본 raw13 prefix 불변; corpse2 metadata collision:false로 제외·pit_poison1만 추가. 현재metaMissing0, v6 raw의 과거missing3 기록은 유지 |
| pit_poison / 충돌 수 | native-hand-13-pit_poison circle center[6500,5580]/radius80px. 원 기존13(11circle+2ellipse)+새1circle=수동14(12circle+2ellipse). sourcePreview.status.collision SOURCE_SUBSET_CONSUMED, supportedSourceObjectColliderCount14/collisionCoverage PARTIAL, actualObjectColliderCount:null/fullObjectColliderCount:null, navScope polygon+exact-native-hill-band+source-object-subset/sourcePending=[collision-assembly]. 화면 수동 배치 충돌14영역·전체 연결 대기; 전체 count/visual85와 identity UNKNOWN |
| 실제 Play 시작 / 해제 | 이전 저장 EXIT4020,300을 정상 현재 입력으로 소비하고 v7 설치 후 Play 시작. 공개남쪽 held에서 clock0.500/4020,336.4→4.733/4020,996.8, 해제5.017/4020,1002.0→30.483에도 같은XY(Play clock 계속). pause30.517·paused ArrowDown 단일press 변위0/clock동일·step30.533·resume30.767에도 방향해제/같은XY. 자동화도구 held keyboard 기능이 없어 공개 연속방향 UI로 검수했으며 연속keyboard 실보행 PASS 주장은0 |
| 실제 나무 / 경사 / 카메라 | 정상 Play 남쪽 이동4020,3381에서 native-hand-8-m_c1tree 차단·clock61.783→88.600에도 같은XY. 서쪽3682 우회 후 실제3986.8경사선 접근. [5216,3986.8] 원0.5599/Z35.83 → [5405.8,3986.8] 원1/Z64, 카메라 실제export[5405.80000000018,3922.7999999999033]/followtrue. summit save/export/reimport 같은포즈·clock0/방향null·Z64; 다시 Play 서쪽[4989.8,3986.8]/Z0으로 내려왔다 |
| 실제 신규pit 차단 / 우회 | 실제 Play [4989.8,5601.4]에서 동쪽 이동→[6409.4,5601.4] native-hand-13-pit_poison 차단. clock168.367→174.367에도 같은XY. 접촉점 북쪽도 [6409.4,5596.2]에서 원 안쪽 진입 차단. 실제 서쪽[6219.6,5596.2]→북쪽[6219.6,5338.8]→동쪽[6492.6,5338.8]/[6763,5338.8]→남쪽[6763,5596.2]로 우회·Z0. actor강제위치/teleport/합성키/BFS이동0 |
| 최종 저장 / reload / 교체 | public pause/save/export 후 actor[6763,5596.2]·Z0·수동14/PARTIAL 유지. browser reload 및 동일actual export 공개import 뒤 같은pose·camera follow·clock0.000/paused/heldnull. v6 raw+v7 raw+scope/원 nav/START/EXIT/85/soil/height/appearance/기존캐릭터 clips 보존. 실제pose/camera의 unrounded 수치는 actual-play-final-export-proof.json 참조. World·본편 save·combat 연동을 인수한 것은 아님 |
| 신규 검사 / 관측 실패 | 신규 input4/4+delta4/4=고유8/8 PASS·fail0. delta 안전보충 affected1/1은 고유검사 합계에 추가하지 않는다. old suite/proof/PNG/source/Git seal 재실행0. Play UI 첫 긴Y대기 tool timeout은 실제입력으로 북쪽복귀, 이후 짧은clock대기+finally해제로 수집; final export는 완료 후 download wait10초기한초과/reset, AX저장/내보내기 확인하고 기존Downloads(11)만 회수·반복export0. 두 관측실패receipt 보존 |
| 버전 / 캐릭터 / 범위 | Studio/CSS entry v0.16.1·studio의 runtime/adapter imports v0.16.1; project/source-panel/source-preview/source-preview-runtime/source-collision은 v0.16.0, appearance/height-ground0.15.0·exactheight0.14.0·physical0.10/AST0.11·World0.8 유지. 해당 제작클립 기본목표 실제24장+24FPS, 이번 기존클립 frames/FPS/interpolation 일괄변경0·상한24 강제0·신규캐릭터/모델/리그 생성0 |
| 시각 / 미인수 | 실제actor 이동·가림·ramp 높이·camera와 신규pit 충돌/우회 확인. soil/뿌리와 actor 대비, 경사/충돌 윤곽 가독성 약함: preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. full MAP_OBJS/_nearFloor/colParts/visual↔collider identity/native crop/origin/pivot/depth/UV/원physicalZ·본편 스킬/VFX/보스관문/1-2 미인수. captured console warn/error[]는 수집범위이며 별도pageerror/network404/VRAM/GPU/실전FPS/Windows 성능인증0 |
| 증거 / 파일 소유 | E=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-play-input. actual-play-ui-proof.json·ramp/final export와proof·새pit/ramp/reopen 캡처·first-tests-runtime.json·worker-delta 최초검사/patch·관측실패receipt·engine-review.md(§23). 변경소유 code5+신규test2+docs16=23파일, 코드전disk/HEAD/absence/실parent/non-symlink backup·소유 정/역byte patch·normal checkpoint 포함. 본편/원본PNG/확정문서 변경0·push/deploy0 |

다음 인수는 새 제작 UI 증가보다 동일 장면의 시각 가독성 보정과 실제 full assembly 입력 소비다. 게임 전용 스킬·VFX·성능 연결은 그 뒤 실제 화면/저장 흐름에서 검수한다.


## v0.16.2 완료 이력(동결) · 높이 옆면의 깊이 순서 수정 (2026-10-11)

| 항목 / 적용 위치 | 정확 계약·검수 범위 |
|---|---|
| 확인 원인 | source-preview-height-ground.js는 floor와 frontWalls를 동일 cache에 먼저 그렸고 source-preview-runtime.js는 그 뒤85개props와 actor를 그렸다. 이미 존재한 profile.depthY(projected-bottom-midpoint)는 painter에 쓰이지 않아 옆면의 깊이 순서가 누락됐다 |
| 변경 / API | SourcePreviewHeightGround._build는 원본soil floor만 cache1에 그림. 동일profile/UV/삼각형의 정적 commands를 _walls에 저장, depth 오름차순. visibleWalls(owner,left,top)은 localBounds viewport cull; drawWall(ctx,entry,image,left,top,{alpha,brightness,saturation})는 원본soil commands만 실행하고 finally복원·draw수 반환 |
| painter | 원 polygon clip의 projected53점은 draw마다1회계산·재사용; flat ground→projected floor cache→props와wall 두 depth배열 merge. 동depth이면 prop→wall, projected actorDepth=worldY−engineFootZ 이하를 그린 뒤 actor1회, 나머지 앞props/wall. actor/cutaway를 항상 최전면으로 강제하지 않음 |
| 색 / 투영 | floor의 기존40px+1024UV경계·높이투영·1px법선광원 그대로. wallalpha=ownerAlpha×ground.opacity×frontWalls.opacity; wallbrightness=ground.brightness×frontWalls.brightness, saturation=ground.saturation. 원본 PNG/원props native opacity/color/worldRect/sourceRect·source height/nav/evaluator 수정0 |
| 카운터 / 자원 | groundWallDrawCalls=현재viewport의실제wall drawImage수, visibleGroundWalls=현재그린wall profile수. groundDrawCalls/drawCalls에 wall포함. groundHeightTriangles는 floor+wall 정적triangle 총수, groundHeightWallTriangles는 wall정적명령 수(매프레임 수가 아님). cache1·1720×944·1623680pixels·명목RGBA6494720bytes, 신규Canvas/image/RAF/listener/timer/GPU0, dispose는 cache0×0과commands참조해제 |
| 상한 / 비용 | profiles<=96, profile당UV분할<=4cell×2triangle=8, wallcommands<=768; floor<=2024, 정적총<=2792. viewport ground<=flat64+floorcache1+wall768=833draw, props<=255, source consumer<=1088draw(actor/배경별도). v0.15의320draw는동결이력이다. 새wall은viewport에매프레임원PNG draw하며 GPU/VRAM/FPS성능인증0 |
| 현재 설정 / 권위 | R2 actorCutaway inner.14/outer.46/feather14px, terrainLighting direction[-.45,-.65,.75]/ambient.45/contrast.82/min.50/max1.2, frontWalls128/32·opacity1/brightness.55/probe.5. mapping64/0·source85·수동14/PARTIAL 그대로, full collision/physical Z/native anchor/crop/origin/UV 권위추가0 |
| 공개 QA / 이동 | 새 별도QA mid[5216,3986.8] normalized.559872→Z35.831808, 동쪽10px[5226,3986.8]→normalized.59695075/Z38.204848(공개UI38.20). summit[5405.8,3986.8] normalized1/Z64, 동쪽10px[5415.8,3986.8] normalized1/Z64·ramp−1·bandfalse. 새START종주0, Play/키보드홀드재검증0 |
| 새 저장 / 재열기 | 정상 새QAendpoint[5415.8,3986.8]·camera[5415.8,3922.8]/followtrue·clock0/input해제 공개저장/reload/JSONexport. 현재QA입력 대비 /actor/position,/camera,/provenance/heightRuntimeObservation만변경, map/native85/ground/nav/height14PARTIAL/appearance는동일. 이전R2 저장proof재실행0 |
| 신규 검증 | test/fdg-height-wall-depth.test.mjs 신규4/4 PASS·fail0/skip0. depth merge/actor1회·equal-depth prop→wall·원soil UV/scene불변·cache1/cull/dispose·throw/finally복원. 변경JS4 syntax PASS. 이전전체suite/1057/Play8/실패R1/성공R2 seals재검수0 |
| 버전 | index badge0.16.2, 최종cache key entry studio.js/runtime/source-preview-runtime0.16.2-final→height-ground0.16.2. CSS/studio adapter0.16.1·source schema/collision0.16.0·appearance0.15.0·exactheight0.14.0 유지. schema/validator/main game/server변경0 |
| 실제 시각 / 다음 접점 | 새 mid·summit·재열기·최종code PNG4 직접검수: actor존재와Z변화는확인, 이동면·경사·정상옆면은큰root props에계속묻힘. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. 현행 actorCutaway는actorFrame주변만대상, terrain projected coverage를대상으로하는전경가림소비필드가없음. 다음필요접점은 terrain coverage의가림규칙이며 임의새schema/수치/PNG생성으로완료를주장하지않음 |
| 증거 | engine-stage0-height-readability-final/ actual-height-ramp-mid.png, actual-height-ramp-summit.png, actual-height-qa-reopened.png, actual-height-qa-final.png, public-ui-trace.json, actual-height-qa-reopened-export.fdg.json, new-endpoint-consumption.json, wall-depth-test-first.log, visibility-depth-receipt.json, engine-review.md. captured warn/error[]는 수집범위, pageerror/404/seam/실전combat/Windows성능은미검수 |

## v0.17 현행 · 명시 높이 지형 노출 (2026-10-11)

이번 인수 범위는 별도 QA 위치의 높이 지형 노출 소비다. 전체 맵·본편 엔진·충돌 assembly·native physical Z 인수로 확대하지 않는다. 상세 schema/API/합성 수명은 [FDG_SOURCE_VISUAL_PREVIEW](../engine/FDG_SOURCE_VISUAL_PREVIEW.md)의 마지막 v0.17 표를 따른다. 앞선 버전의 검수·미구현 표현은 해당 버전 완료 이력이다.

| ID / 항목 | 현행 코드·수치·상태 |
|---|---|
| FDG-TEX-CONTRACT | appearancePreview.terrainCutaway는 optional 명시 ENGINE_AUTHORING. kind=projected-height-region, authority=ENGINE_AUTHORING, depthPolicy=after-region-max-projected-depth, sourcePhysicalZClaim=false, authoredBy 비공백 필수. foregroundOpacity 0..1 / featherPx >0..64 world/CSS px(zoom1). 작성 initializer SOURCE_PREVIEW_TERRAIN_CUTAWAY_DEFAULTS=opacity0.1/feather24; 자동 채움0 |
| FDG-TEX-STRICT | 필수 기존 appearance 검증·4MiB/깊이64/방문1,000,000 JSON 한계·unknown 안전 JSON 보존을 유지. attachSourcePreviewAppearance의 전체 작성 입력 snapshot이 별도 provenance에 깊은 일치해야 함. 누락·권위/단위/범위/claim 오류·snapshot 불일치 거부. 필드 absent 또는 opacity1이면 기존 렌더와 추가 exposure Canvas0 |
| FDG-TEX-REGION | 기존40px+1024UV cuts의 실제 engine height-projected raised floor triangle + south wall quad 합집합, 원53corner polygon의 같은 height 투영과 교집합. 대상 prop은 region의 최대 projectedY보다 strict 앞(entry.depth > max)일 때만. 같은 깊이·뒤쪽 제외. 이번 입력 coverage1032 / max projected depth4240 world px |
| FDG-TEX-BLEND | 원PNG의 해당 projected 영역 내부만 native opacity×(1−(1−foregroundOpacity)×maskAlpha). maskAlpha=blur(featherPx)×hard coverage; 외부 mask alpha0. hard alpha>0 row-run을 한 번 readback·같은 span 연속 row 세로병합 → disjoint union clip; inside nonzero / outside complement evenodd. floor/wall 중첩 XOR0 |
| FDG-TEX-OUTSIDE | 원PNG direct outside / source color를1회 적용한 scratch inside의2 draw. 원worldRect/sourceRect·depth/native opacity/brightness/saturation·actor1회·기존 actor ellipse3영역·wall painter 순서 보존. 브라우저 cached Path2D 및 정적 outside path, Path2D 없는 환경 rect fallback. 바깥 bbox 전체를 scratch로 대체하는 첫 구현은 폐기 |
| FDG-TEX-CACHE | owner-local floor1+mask1+scratch1=Canvas3, 새 raf/listener/timer/image/GPU 소유0. 동일 soil decode당 build1/maskbuild1/hard readback1. dispose에서3 Canvas0×0, refs/coverage/clip rect/Path2D/outside map 해제. 이번1720×944: floor6,494,720 + exposure12,989,440 =19,484,160 nominal RGBA bytes. GPU/실VRAM 인증 아님 |
| FDG-TEX-BOUND | 기존 cache≤2048 each dimension/4,194,304 pixels·floor static triangles≤2024·wall profiles≤96/commands≤768·static total≤2792 유지. source draw 최대≤1513/frame=ground≤64+floor1+wall768+85props×3actor passes×2main+85×2scratch. actor/background·build2024+mask2 draw 제외. viewport cull 먼저·mask readback/build 시만 |
| FDG-TEX-COUNTERS | snapshot: terrainCutawayMaskBuilds/terrainCutawayMaskReadbacks/terrainCutawayClipRects/terrainCutawayCoveragePolygons/terrainCutawayProjectedDepth/ownedTerrainCutawayCanvases/terrainCutawayCacheBytes. draw: terrainCutawayObjects/terrainCutawayDrawCalls/terrainCutawayScratchDrawCalls. 기존 ownedHeightCanvases는floor1·groundHeightCacheBytes는floor만; drawCalls는scratch2도 포함 |
| FDG-TEX-TEST | test/fdg-terrain-exposure.test.mjs 기존 새5개를 수정 영향으로 확인 PASS5; 신규 procedural RGBA 보존1개 PASS1. first procedural teardown은 native test backend의0크기 정규화로 assertion 실패→consumer null refs 해제 확인으로 fixture만 수정·그1개만 재실행. renderer 수정0·과거 suite/oldproof0. 수정 후JS7 syntax PASS |
| FDG-TEX-ACTUAL | 새 own project fdg-stage0-terrain-exposure-v17. paused AUTHORING/public동쪽10px×42=420px; [4980,3986.8]Z0→[5000,3986.8]Z0→[5210,3986.8]normalized0.53746875/Z34.398→[5400,3986.8]normalized1/Z64/ramp1/bandfalse. clock0/input해제·camera5400,3922.8 followtrue. DESIGN START/EXIT 종주·Play/본편 검수 아님 |
| FDG-TEX-PIXELS | 새770×371 CUA canvas enabled/disabled 동일 pose 비교. 첫 bbox 합성은 outside≥16px 30,358 중5,732픽셀 delta>2/max15로 FAIL→mask union clipping 수정. 수정 후 같은 밖30,358픽셀 changed0/maxRGBA0; inside241,329 중226,738 changed/max168. 경계8/16px 따로 분리·native opaque alpha/physical Z 증명 아님 |
| FDG-TEX-SAVE | 새 own project만 public 저장/reload/JSONexport. 최종 공개 export 전체는 before-save export와 깊은 일치, appearance↔별도 snapshot 일치. 최초 새 own QA input과 map/height/nav/visual85/metadata/hand14PARTIAL 동일(행동 position/camera/heightRuntimeObservation만 갱신). 원R2파일 쓰기0 |
| FDG-TEX-ENTRY | index badge v0.17 / studio.js 및 이번변경8개파일의 관련 dependency query0.17.1. CSS0.16.1·다른 collision/adapter/height/physical/AST/World entry들은 기존값 유지. 독립 SourcePreviewRuntime 소비만 추가, game.html/본편save/combat/START/nav/geometry/sourcePNG 권위 변경0 |
| FDG-TEX-ACCEPTANCE | 실제 revised entry/mid/summit/reopened 화면에서 위쪽soil·경사·어두운south옆면·발 높이와 외부 전경 보존 확인. **이번 높이 지형 노출 VISUAL PASS / 전체 production FAIL·UNADOPTED.** full assembly/native anchor/crop/origin/UV/물리Z·다른3재질·본편/관문/1-2·Windows/FPS/GPU는 미인수 |
| FDG-TEX-EVIDENCE | 외부 E=engine-stage0-terrain-exposure-final. actual-terrain-*.revised.png / revised.qa.png, public-ui-trace.json, actual-terrain-reopened.revised-export.fdg.json, new-save-reopen-revised-contract-proof.json, terrain-exposure revised test receipts, pixel-preservation-revised-qa.json, engine-review.md. 첫 실패 증거 보존. own8code+1test+15docs=24 checkpoint, 공유Git rollback0/oldseal 재검사0 |


## 2026-10-31 stage=0 초광폭 진입 계약

stage=0은 실제 CH1-1 200×200 본편을 선택한다. 과거 55×31 원화 QA는 mapTest=1/v4 또는 stage=0&plate=prod, 36×27은 stage=0&plate=fieldone/v1로 명시한다. 작은 원화 판에는 production 청크와 8000px 좌표 나무를 섞지 않는다. 기존 전체 VW/VH 시야·카메라 클램프·geometry·충돌·스폰 예산·루트는 유지한다. [화면 밖 처리·실제 4해상도 검수](../12퍼포먼스·최적화/WORLD_ULTRAWIDE_20261031.md).
