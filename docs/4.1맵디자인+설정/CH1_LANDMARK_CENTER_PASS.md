> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# CH1 si1 — LANDMARK / CENTER GATE 6 PASS

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **38차 현행(2026-09-27):** 구형 weapon_pile.png 및 동일사본4개 폐기·격리. m_wpile/m_c5wpile/weapon_pile 사용금지. 과거무기더미배치·접지기록은이력이다. 접지현행2장/0.5MiB,전체native87.81269454956055MiB,모듈20260927-38. [검수·폐기 SSOT](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md).

> **2026-09-27 37차 현행 폐기 결정:** 구형 tombstone.png와 exposed_root.png는 사용자 지정 저품질 원화로 사용 금지. 36차 접지 보강은 폐기되었다. 아래의 해당 에셋 수치·좌표·접지 기록은 과거 이력이며 현행 등록·배치가 아니다. 동일 원화 6파일 격리, CH1 authored 8배치 제거, 접지 계열은 3장/0.75MiB로 복귀. [폐기 SSOT](LOW_QUALITY_ASSET_RETIREMENT_20260927.md).

> 기준일: 2026-08-30  
> 적용 가이드: `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`  
> 상태: **GATE 6 PASS / GATE 7 SMALL DETAIL 미착수**  
> 범위: 기존 CH1 si1 geometry와 OUTER LARGE+MEDIUM을 보존한 landmark ground integration

## 1. 진행 게이트

| GATE | 상태 | 증거 / 판정 |
|---:|---|---|
| 1 MASTER PLAN | PASS | canonical `200×200` geometry와 7-region blueprint 보존 |
| 2 OUTER LARGE | PASS | `CH1_OUTER_MASS_FIRST_PASS.md`, BACK 18 + LARGE 21 |
| 3 OUTER MEDIUM | PASS | MEDIUM 17, small prop 0, 64-chunk seam PASS |
| 4 GROUND CONNECTION | PASS | 외곽 root/shadow/corpse contamination과 24px visual blend |
| 5 PLAYABLE / COMBAT | PASS | 실제 WASD 42 segment, toxic/camp/altar 왕복, tree 양쪽 bypass, boss 접근 |
| 6 LANDMARK / CENTER | **PASS** | 본 문서의 5개 POI ground identity와 negative-space 보호 |
| 7 SMALL DETAIL | NOT STARTED | 이번 패스에서 small prop 0, 신규 gameplay asset 0 |
| 8 CAMERA QA | GATE 6 검증 PASS | 동일 8카메라 + full-map + SOUTH/tree combat 직접 검사 |

## 2. 불변 계약

| 항목 | 값 | 결과 |
|---|---|---|
| geometry source | `assets/map/ch1/geometry/ch1_si1_geometry.js` | SHA-256 `5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f`, 변경 없음 |
| runtime map | `200×200` | SHA-256 `a67605a94904e4cc2a564d6a6d060ab1da55bb35f185221522eef3616ef1a033`, 이전과 동일 |
| collision / route | canonical geometry + 기존 landmark collider | 변경 0 |
| authored/runtime | `_CH1S1 12 / MAP_OBJS hand 12` | skip 0, 좌표 변경 0 |
| START / EXIT | `(100.5,185.5)` / `(99~101,33)` | 변경 0 |
| 신규 vertical prop | `0` | 중앙 silhouette 추가 없음 |
| runtime flag | `ch1OuterMass=landmark_center` | 기본 OFF, 기존 baked loader 경로만 재사용 |

`game.html`의 production 변경은 기존 `_ch1OuterMassPhase()` whitelist에 `landmark_center`를 추가한 1줄이다. renderer, loader, collision, map system은 확대하지 않았다.

## 3. LANDMARK hierarchy와 ground identity

| 계층 | id / tile | ground 문법 | 사용 source |
|---|---|---|---|
| PRIMARY | `m_c1tree (83,80)` | 비대칭 corpse stain + root halo, 나무 양쪽 bypass 보호 | `prop_g_corpse`, `prop_g_root` |
| SECONDARY | `m_c1camp (49,122)` | 낮은 채도의 ash/warm decay | `prop_g_battle` |
| SECONDARY | `m_c1altar (151,91)` | ritual scar와 짧은 root 방향선 | `prop_g_root` |
| TERTIARY | `m_c1pool (49,151)` | toxic이 pocket 바닥으로 번지는 녹색 contamination | `prop_g_toxic` |
| TERTIARY | `m_c1cocoon (151,136)` | cocoon에서 route 쪽으로 자라는 organic root stain | `prop_g_root` |

총 5개 POI에 기존 floor source 4종을 6회 사용했다. 독립된 원형 stamp가 full-map에서 읽히지 않도록 source opacity를 `0.13~0.18`로 낮추고, 불규칙 저채도 stain/root SVG가 주형이 되게 했다. asset 수를 늘리지 않았고 small bone/pod/tiny root는 사용하지 않았다.

## 4. CENTER / negative space 보호

| 보호 공간 | sample tile | final baked alpha | 판정 |
|---|---:|---:|---|
| SOUTH combat void | `(115,158)` | `0` | OPEN |
| central compression | `(86,110)` | `0` | OPEN |
| tree left bypass | `(75,80)` | `0` | OPEN |
| tree right bypass | `(104,82)` | `0` | OPEN |
| boss approach | `(110,38)` | `0` | OPEN |
| primary tree ground | `(83,80)` | `159` | landmark identity visible |

ground layer는 canonical walkable mask 안으로만 제한하고 위 5개 공간은 별도 alpha hole로 다시 보호한다. SOUTH arena, transition, 양쪽 bypass, boss funnel에는 신규 major silhouette가 없다.

## 5. master / chunk / runtime

| 역할 | 경로 / 값 |
|---|---|
| base master | `assets/map/ch1/baked_spike/outer_mass/large_medium/CH1_OUTER_LARGE_MEDIUM_MASTER.png` |
| GATE 6 master | `assets/map/ch1/baked_spike/outer_mass/landmark_center/CH1_LANDMARK_CENTER_MASTER.png` |
| chunks | `landmark_center/chunk_0_0.png` … `chunk_7_7.png`, 64개 |
| chunk 규격 | `1026×1026`, core `1024×1024`, copy bleed `1px` |
| builder | `tools/build_ch1_landmark_center.mjs` |
| contract test | `test/ch1LandmarkCenterPass.test.js` |

## 6. 실제 QA

| 검사 | 결과 |
|---|---|
| GATE 6 + OUTER regression | `10/10 PASS` |
| camera capture | START, SOUTH L/R, MID L/R, TREE L/R, NORTH 8개 |
| full-map | CURRENT LARGE_MEDIUM vs LANDMARK_CENTER 동일 framing |
| baked request/ready/error | `64/64/0` |
| decode/warm | `64/64`, max warm `14.3ms` |
| max baked draw | `0.1ms` |
| pageerror / asset 404 | `0 / 0` |
| combat SOUTH | enemy 5, projectile 3, parry/VFX, `canMove=true`, `inWall=false` |
| combat TREE | enemy 5, projectile 3, parry/VFX, `canMove=true`, `inWall=false` |
| seam | 지정 vertical/horizontal pair exact-pixel PASS |

직접 이미지 검사 결과 START·SOUTH·central·NORTH의 빈 공간은 유지되고, tree/camp/altar/toxic/cocoon 주변에만 낮은 명도의 지면 정체성이 생겼다. player/enemy/projectile/parry 색은 두 전투 화면에서 분리된다. 외곽은 기존 연속 organic mass를 그대로 보존한다.

## 7. 산출물

| 산출물 | 경로 |
|---|---|
| GATE 6 blueprint | `captures/ch1_landmark_center_20260830/BLUEPRINT/01_GATE6_LANDMARK_CENTER_BLUEPRINT.png` |
| BEFORE 8-view/full-map | `captures/ch1_landmark_center_20260830/BEFORE/LARGE_MEDIUM/` |
| FINAL 8-view/full-map | `captures/ch1_landmark_center_20260830/RUNTIME_FINAL/LANDMARK_CENTER/` |
| camera comparisons | `captures/ch1_landmark_center_20260830/COMPARISON/01_CAMERA_COMPARISON.jpg`, `02_CAMERA_COMPARISON.jpg` |
| full-map comparison | `captures/ch1_landmark_center_20260830/COMPARISON/03_FULL_MAP_COMPARISON.jpg` |
| combat | `captures/ch1_landmark_center_20260830/GATE6_COMBAT/` |
| source backup | `captures/ch1_landmark_center_20260830/SOURCE_BEFORE/` |

## 8. MAP PRODUCTION REPORT

```text
MAP NAME = CH1 si1
MAP TYPE = OPEN-FIELD / 7-region SOUTH→NORTH
CURRENT GATE = 6 LANDMARK / CENTER

OUTER MASS
- LEFT = 기존 low/wide horizontal mass 보존
- RIGHT = 기존 high/twisted vertical mass 보존
- TOP = 기존 asymmetric natural funnel 보존
- SOUTH = 기존 open threshold 보존

STRUCTURE
- LARGE count = 21
- MEDIUM count = 17
- SMALL count = 0

GROUND
- transition = 5 POI irregular stain/root identity
- shadow = low-opacity floor source integration
- playable clarity = 5 protected negative-space sample alpha 0

LANDMARK
- primary = corpse tree (83,80)
- secondary = camp (49,122), altar (151,91)
- tertiary = toxic (49,151), cocoon (151,136)

QA
- camera views = 8/8 captured and inspected
- combat readability = PASS
- collision = unchanged / PASS
- route = unchanged / 42-segment PASS
- loading = 64/64 ready, error 0
- pageerror = 0
- 404 = 0

FINAL VERDICT
- VISUAL = PASS FOR GATE 6
- GAMEPLAY = PASS
- TECH = PASS
- NEXT = GATE 7 SMALL DETAIL (not started)
```

commit / push / deploy는 수행하지 않았다.


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
