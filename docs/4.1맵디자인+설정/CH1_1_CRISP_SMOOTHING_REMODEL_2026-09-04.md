> **2026-09-16 CH1-1 PRODUCTION 적용 계약 — 이전 CH1-1 배경/경계 설명보다 우선:** 사용자 최신 지시에 따라 실제 `STAGES[0]`(표시 1-1)에 고정 수작업 전체맵을 적용했다. 현행 경계는 `assets/map/ch1/production_finish/layout.js`의 53점 polygon/8구역이며, 기본 배경은 `assets/map/ch1/production_finish`다. 8192² master의 1024px core를 **월드 1000px**로 그려 200×200타일(`T=40`, 8000²) 충돌 좌표와 일치시킨다. `smoothing`은 호환 phase 이름이며 과거 smoothing 폴더를 기본 로드한다는 뜻이 아니다. `outer` query는 과거 아트 비교용으로, 현행 경계와 시각 정합을 보증하지 않는다. authored62/runtime63, hand collision21/total22, 자동 scatter0. `_CH1S1`/stage1은 별도 맵이다. START `(100.5,185.5)`, 시체나무 `(102.5,90.5)`, 북쪽 gate y5/exit y7과 진행 조건은 유지한다. 아래의 이전 outer/smoothing 수치·좌표는 **해당 날짜의 이력**이며 현행값은 [전체 제작·수치·검증 보고서](CH1_1_PRODUCTION_FINISH_20260916.md)를 따른다. 기술 PASS와 시각 판정은 보고서에서 별도로 기록한다.

> **38차 현행(2026-09-27):** 구형 weapon_pile.png 및 동일사본4개 폐기·격리. m_wpile/m_c5wpile/weapon_pile 사용금지. 과거무기더미배치·접지기록은이력이다. 접지현행2장/0.5MiB,전체native87.81269454956055MiB,모듈20260927-38. [검수·폐기 SSOT](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md).

> **2026-09-27 37차 현행 폐기 결정:** 구형 tombstone.png와 exposed_root.png는 사용자 지정 저품질 원화로 사용 금지. 36차 접지 보강은 폐기되었다. 아래의 해당 에셋 수치·좌표·접지 기록은 과거 이력이며 현행 등록·배치가 아니다. 동일 원화 6파일 격리, CH1 authored 8배치 제거, 접지 계열은 3장/0.75MiB로 복귀. [폐기 SSOT](LOW_QUALITY_ASSET_RETIREMENT_20260927.md).

# CH1-1 흐릿한 베이크 에셋 선예도 리모델링 — 2026-09-04

> 적용 맵: CH1-1 / si0 / `G.stage===0`
> 상위 SSOT: `CH1_1_SMOOTHING_PASS.md`
> 범위: `baked_start_smoothing` 시각 합성기·마스터·64청크만 변경

## 문제와 원인

사용자 캡처에서 보인 흐릿한 갈색 대형 얼룩과 보라색 띠는 원본 ground asset 자체가 아니라 smoothing build pipeline에서 생성됐다. 약 900~1100px 원본을 최대 2200×1600px까지 `fit:'fill'`로 비율 변형한 뒤 raster blur `2~3px`, SVG Gaussian blur `48/72px`를 겹친 것이 원인이다. 대표적으로 기존 `chunk_4_3.png`는 화면 대부분이 저해상도 보라색 대각 띠와 번진 형태였다.

## 구현 계약

| id | 한글명 | 변경 전 | 현행 값 | 적용 위치/공식 |
|---|---|---:|---:|---|
| `rasterBlurPx` | 래스터 블러 | `2~3px` | `0px` | `.blur()` 호출 금지 |
| `svgGaussianBlurPx` | SVG 광역 블러 | `48/72px` | `0px` | `feGaussianBlur` 제거 |
| `stretchFit` | 종횡비 강제 변형 | `fit:'fill'` | `false` | `fit:'contain'` |
| `maxRasterUpscale` | 원본 확대 상한 | 최대 약 `2.2×` | `1.3×` | `scale > 1.3`이면 builder가 오류 종료 |
| `sharpSigma` | 합성 선예도 | 없음 | `1.15` | `sharpen(1.15,0.7,1.8)` |
| `purpleEdgeTint` | 보라색 광역 edge tint | 있음 | `false` | SVG 띠 전체 제거 |
| `masterSize` | 완성 master | `8192×8192` | `8192×8192` | 불변 |
| `chunkSize` | 청크 core/bleed | `1024/1px` | `1024/1px` | 파일 `1026×1026`, 64개 |
| `EDGE_SMOOTH` | 가장자리 연결 | `8` | `8` | source texture 8개 |
| `CORNER_VARIATION` | 코너 변주 | `4` | `4` | source texture 4개 |
| `TREE_BASIN` | 중앙 나무 분지 | `4` | `4` | footprint `1700×1500px`, alpha `0.30~0.34` |
| `SIDE_CONNECTION` | POI 연결 | `10` | `10` | scale `0.82~1.20×` |
| `OPEN_FIELD` | 열린 필드 저대비 패치 | `5` | `5` | alpha `0.16~0.17` |
| `SMALL` | 소형 scatter | `0` | `0` | 추가 없음 |
| `toxicAssetPatches` | 독지대 source patch | 광역 mass 3 + fragment 5 | `5` | 연속 chain 없음, saturation 최대 `0.34` |

재사용 source는 `prop_g_edge.png`, `prop_g_root.png`, `prop_g_corpse.png`, `prop_g_toxic.png`, `prop_g_battle.png`다. PixelLab 신규 캐릭터나 신규 vertical asset은 사용하지 않았다.

## 불변 계약

| 항목 | 검증 값 |
|---|---|
| map / hand hash | outer와 smoothing 동일 (`af4d3ead` / `5f783d64`) |
| authored / runtime | `63 / 64` |
| collision | total `23` / hand `22` |
| spawn | `(100.5,185.5)` |
| exits | `(99,7)`, `(100,7)`, `(101,7)` |
| `isW` differential | `0` |
| geometry / route / landmark / vertical | 변경 없음 |

## QA 결과

| 항목 | 결과 |
|---|---|
| builder syntax | PASS |
| smoothing regression | `17/17 PASS` |
| master/chunk seam | 64개, 1px copy bleed PASS |
| runtime pageerror / 404 | `0 / 0` |
| first-visible outer warm/draw | `10.9ms / 0.1ms` |
| first-visible smoothing warm/draw | `13.1ms / 0.1ms` |
| full-map outer warm/draw | `14.9ms / 0.3ms` |
| full-map smoothing warm/draw | `16.2ms / 0.3ms` |
| 카메라 증거 | `captures/ch1_1_smoothing_20260904/COMPARISON/CH1_1_SMOOTHING_COMPARISON_BOARD.jpg` |
| 대표 결함 비교 | 백업 `chunk_4_3.png`의 흐릿한 보라색 띠 제거, 현행 source detail 판독 가능 |

## MAP PRODUCTION REPORT

```text
================= MAP PRODUCTION REPORT =================

STAGE: CH1-1 / si0 / G.stage 0

MASTER
- silhouette: 기존 locked four-sided outer mass 유지
- regions: START / open field / tree basin / side POI / NORTH 유지
- main route: SOUTH → NORTH 변경 없음
- visual goal: 흐릿한 대형 얼룩과 보라색 띠 제거, 원본 ground detail 복구

LARGE OUTER MASS
- geometry/collision: 변경 없음
- baked source: locked outer master 그대로 사용
- unintended holes: 신규 없음

MEDIUM CONNECTION
- EDGE 8 / CORNER 4 / TREE 4 / SIDE 10 유지
- 모든 patch는 aspect-preserving source texture
- 최대 확대 1.3×, 실제 SIDE 범위 0.82~1.20×

GROUND CONNECTION
- raster blur: 0px
- SVG Gaussian blur: 0px
- purple edge tint: 없음
- low-opacity OPEN_FIELD 5로 전투 바닥 여백 유지

PLAYABLE / COMBAT
- authored/runtime: 63/64
- collision: total23/hand22
- spawn/exits/isW: outer baseline과 동일
- central combat field: 신규 vertical clutter 없음

LANDMARK / CENTER
- corpse tree, camp, altar, cocoon, pool, poison pit 좌표 불변
- TREE_BASIN: source-detail 기반 1700×1500px footprint

SMALL DETAIL
- SMALL 0
- scatter 추가 없음

CAMERA QA
- 01 CENTER TREE: ground root/bone detail 판독, 광역 smear 없음
- 02 COCOON: 중앙 POI와 어두운 바닥 분리 유지
- 03 TOXIC: 저채도 source patch 연결, 연속 보라 띠 없음
- 04 LOWER LEFT: 열린 전투 공간 유지
- 05 LOWER RIGHT PIT: wet source detail 유지
- 06 START: 6시 시작점과 북향 진행 축 유지
- 07 ALTAR: landmark hierarchy 유지
- 08 FULL MAP: 기존 silhouette·동선과 동일

TECH QA
- regression: 17/17 PASS
- seam: 64/64 PASS, core1024 + bleed1
- cache: 64/64 ready, error0
- runtime: pageerror0 / 404=0
- first-visible smoothing max warm/draw: 13.1ms/0.1ms
- full-map smoothing max warm/draw: 16.2ms/0.3ms
- map/hand hash equal: true/true
- isW differential: 0

FILES
- tools/build_ch1_start_smoothing.mjs
- assets/map/ch1/baked_start_smoothing/composition.json
- assets/map/ch1/baked_start_smoothing/CH1_1_START_SMOOTHING_MASTER.png
- assets/map/ch1/baked_start_smoothing/chunk_0_0.png ~ chunk_7_7.png
- test/ch1StartSmoothingPass.test.js
- docs/4.1맵디자인+설정/CH1_1_SMOOTHING_PASS.md
- docs/4.1맵디자인+설정/CH1_1_CRISP_SMOOTHING_REMODEL_2026-09-04.md

GIT
- code + baked master/chunks + test + docs를 동일 변경셋에 포함
- unrelated pre-existing worktree 변경은 포함하지 않음
- push/deploy 없음

VISUAL VERDICT:
PASS — 사용자 캡처와 동일한 대표 chunk에서 흐릿한 보라색 띠가 제거되고 뿌리·갈라진 흙·뼈 detail이 선명하게 복구됐다.

NEXT PASS:
신규 SMALL/vertical detail은 별도 요청 전까지 추가하지 않는다. geometry/collision/route는 재개방하지 않는다.
```


### 2026-09-25 CH1-1 생체 디테일 마감: 중복 독액 장식

| 적용 | 현재 계약 |
|---|---|
| 본편 stage0 렌더 | `m_c1gtoxic` 월드(6740,1620), 타일(168,40)만 기존 `m_c1pool` 이미지 로드 완료(complete 및 naturalWidth>1) 시 숨긴다. `Ch1LivingDetail.hideDuplicate` 사용 |
| 보존 | authored/MAP_OBJS 좌표·개수·충돌 불변. `m_c1gtoxicf`, 다른 좌표/스테이지, bossArena/fieldRebuildQA와 기존 bake에는 적용하지 않음 |
| 폴백 | 웅덩이 이미지 또는 효과 스크립트/API 미로드 시 기존 장식을 그린다 |
| 근거 | 겹친 두 웅덩이 실루엣을 하나로 정리하는 시각 전용 마감. 세부 수치·QA는 `docs/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md` 7차에 기록. 위 날짜별 제작 수치는 해당 시점 이력 |


### 2026-09-27 동측 독구덩이 경계 보강21차

| id / 적용 위치 | 현재 렌더 계약 | 보존 |
|---|---|---|
| m_c1gtoxicf / (6500,5460) | stage0 production에서 groundSprite로 보라색 경계64px 이내만 색 보정, 21차 당시18px 알파 전이(현행25차는 명도에 따라24~56px). 정적881×900 canvas 캐시1장. [공식·폴백·QA·메모리](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의21차/25차 참조 | prop_g_toxic.png·기존 bake·좌표·크기·반전·충돌·pit_poison 동작 유지. 과거의 m_c1gtoxicf 미적용 문구는 당시 효과 범위이며, 이번 경계 보정과 구분 |


## 2026-09-27 독구덩이 재질 연결22차

| 대상 | 현행 구현 | 보존·한계 |
|---|---|---|
| pit_poison / (6500,5580) | stage0 production의 기존16프레임 atlas에 prop_g_toxic.png의 벽·독액을 국소 샘플링. 이미지 미로드 시 기존 절차식 폴백, 로드 후 atlas 갱신. [런타임22차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의 crop/명암/QA 계약 참조 | 위치·크기200×scale·collision·수축·유입2개 유지. 원본 PNG 보존. 기존 절차식 atlas 설명은 최초 구현 이력이며 현재 재질은22차가 우선. 전체 원화/지면 통합은 RETOUCH |


### 2026-09-27 촉수 포복23차

| 대상 | 현행 움직임 | 보존 |
|---|---|---|
| Ch1LivingDetail dry 지면 촉수 | [런타임23차](CH1_LIVING_DETAIL_RUNTIME_20260925.md): 밑동 고정,끝이 먼저 뻗고 몸통이 지연되어 따라 당겨짐. 끝점 고정은10차 이력이며 dry 현행 동작은23차가 우선 | 기존 월드 앵커·collision·동선·atlas 크기·16프레임 유지. wet 독액 촉수는 기존 동작 |


### 2026-09-27 큰 늪 수면27차

| 대상 | 현행 동작 | 보존·자원 |
|---|---|---|
| m_c1gtoxicf(6500,5460) | Ch1LivingDetail.swamp가 큰원화의수면4곳에흐름·기포8개를직접합성.6400ms/16프레임. 26차까지는큰원화정적/작은pit만동적이었다. [런타임27차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)의polygon·공식·QA참조 | 바위·외곽·원본PNG·충돌유지. 기존정적경계캐시와별도로1760×1800RGBA atlas12.0849609375MiB추가. 벽분리변형아님 |


### 2026-09-27 늪 버블·가스28차

| 대상 | 현행 동작 | 보존 |
|---|---|---|
| 큰늪 m_c1gtoxicf(6500,5460) | 버블8개 팽창→주기60%에서파열→잔물결·물방울6개→같은자리탁한가스3lobes상승.6400ms/16프레임. [런타임28차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·QA참조 | 원본·바위형태·충돌보존. 가스는물마스크밖으로상승하며캐릭터뒤렌더. 기존atlas재사용,추가상주캐시0/피해0 |


### 2026-09-27 버블 가독성29차

| 대상 | 현행 교정 | 보존 |
|---|---|---|
| 큰늪 버블8개 | 최대반경8→16native px,볼록한황록돔·광택·접촉그림자. 주기46~60%/896ms최대팽창유지,60%에서파열. 파열시작반경16/8. [런타임29차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·검수참조 | 가스·수면흐름·좌표·충돌유지,기존atlas재사용 |


### 2026-09-27 버블 파열 가독성30차

27~29차의 버블16프레임·물방울6개·추가캐시0은 당시 이력. 현행 버블은 아래 값으로 대체하며 물·가스16프레임은 유지한다.

| 대상 | 현행 | 자원·경계 |
|---|---|---|
| 큰늪 m_c1gtoxicf(6500,5460),8vent | 6400ms/64프레임(자세간격100ms),직전눌림384ms·균열192ms→막8갈래 파열384ms·물방울8개768ms·잔물결1152ms. [런타임30차](CH1_LIVING_DETAIL_RUNTIME_20260925.md) 전체공식·검수 참조 | 버블768×768/2.25MiB추가,최대19drawImage. 수면·가스16프레임/400ms,원본·collision·공간구성 유지. 모듈20260927-30 |


### 2026-09-27 늪 접지31차

| 대상 | 현행 접지 | 보존·비용 |
|---|---|---|
| m_c1gtoxicf(6500,5460) | 원화alpha>80 윤곽에서외측28native px까지감쇠하는정적젖은흙. 원본아래합성,원형테두리미사용. [런타임31차](CH1_LIVING_DETAIL_RUNTIME_20260925.md) 공식·검수참조 | 30차버블/가스/수면/충돌보존.512²RGBA 1MiB추가,swamp최대20drawImage.30차19회기록은이력.모듈20260927-31 |


### 2026-09-27 동측 생체 지면 연결32차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| SIDE_R 중심(6060,5460),variant1 | 1440×800 지면전이(20차1200×800대체),서쪽회갈색조직→동쪽녹갈색오염. 얕은연결주름3줄/늪쪽마스크lobe추가. [런타임32차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)정확한색·곡선·마스크·QA참조 | 기존768×512캐시재사용/추가메모리0·draw0. 30차버블/31차접지/충돌·공간보존. 모듈20260927-32 |


### 2026-09-27 야영지 접지33차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_c1camp(1820,4020) | 원본하부알파윤곽을따라외측22native px까지감쇠하는정적재·그을음. 상부천막제외,body아래합성. [런타임33차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·검수참조 | 손3개·화로·상자·원본·충돌유지.512×400RGBA/0.78125MiB추가,대상camp1drawImage추가.모듈20260927-33 |


### 2026-09-27 야영지 전면 재질34차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| CAMP_FRONT 중심(1860,4300),960×640 | 재색흙→괴사피부의정적전이와얕은연결주름3줄. regionalSkin variant3,기존33차접지에서앞쪽빈바닥으로연결. [런타임34차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)전체규격·QA참조 | 768×512RGBA/1.5MiB추가,보일때1drawImage. 지역캐시4장/6MiB. 기존손동작·늪·충돌보존.모듈20260927-34 |


### 2026-09-27 야영지 잔해 접지35차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_c1sbone(1940,4340)/m_sword_pile(1580,4180)/m_wpile(2060,4220) | 원본하부alpha윤곽에서외측12native px감쇠접촉그림자. 상부해골장대제외. [런타임35차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)정렬·공식·QA참조 | 원본·손동작·34차지면·충돌유지.256²RGBA×최대3=.75MiB추가,보이는대상당1drawImage. 모듈20260927-35 |


### 2026-09-27 묘비·뿌리 접지36차

| 대상 | 현행 | 보존·비용 |
|---|---|---|
| m_tomb(1460,3900)/m_root(1980,3940) | 묘비밑동만/평면뿌리전체밑면의alpha윤곽접지. 별도모드캐시. [런타임36차](CH1_LIVING_DETAIL_RUNTIME_20260925.md)공식·규격·QA참조 | 원본·충돌·손동작보존.256²RGBA×2=.5MiB추가,35차대상포함5곳. 묘비/뿌리원화와주변스타일차이잔여.모듈20260927-36 |
