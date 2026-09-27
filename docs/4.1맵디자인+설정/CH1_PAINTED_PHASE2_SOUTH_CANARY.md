# CH1 PAINTED PHASE 2 — SOUTH CANARY SIDE MASS

> **38차 현행(2026-09-27):** 구형 weapon_pile.png 및 동일사본4개 폐기·격리. m_wpile/m_c5wpile/weapon_pile 사용금지. 과거무기더미배치·접지기록은이력이다. 접지현행2장/0.5MiB,전체native87.81269454956055MiB,모듈20260927-38. [검수·폐기 SSOT](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md).

> **2026-09-27 37차 현행 폐기 결정:** 구형 tombstone.png와 exposed_root.png는 사용자 지정 저품질 원화로 사용 금지. 36차 접지 보강은 폐기되었다. 아래의 해당 에셋 수치·좌표·접지 기록은 과거 이력이며 현행 등록·배치가 아니다. 동일 원화 6파일 격리, CH1 authored 8배치 제거, 접지 계열은 3장/0.75MiB로 복귀. [폐기 SSOT](LOW_QUALITY_ASSET_RETIREMENT_20260927.md).

> 2026-08-30 후속 outer/GATE 6 pass: 이 문서의 SOUTH 20-chunk canary와 `ch1BakedSpike=1`은 역사/호환 비교 경로로 보존한다. CH1 전체 외곽과 landmark ground 비교는 별도 opt-in `ch1OuterMass=large|large_medium|landmark_center`, phase별 64 chunk를 사용하며 `CH1_OUTER_MASS_FIRST_PASS.md`와 `CH1_LANDMARK_CENTER_PASS.md`가 현행 visual composition SSOT다. geometry·collision·route는 변하지 않았다.

> 기준일: 2026-08-29  
> 상태: **HISTORICAL VISUAL CANARY / GEOMETRY REDESIGN으로 SUPERSEDED**  
> 기본값: OFF  
> 범위: START·남측 arena·toxic·cocoon·북측 transition 일부만

> 이 문서의 `75/75`, collision 변경 0, full-floor 보행률은 visual-only canary 당시 QA 기록이다. 현행 canonical은 `CH1_SI1_ACTUAL_STAGE_GEOMETRY.md`: walkable `13,732/40,000(34.33%)`, authored/runtime `12/12`, stage-local collision boundary, exit `(99~101,33)`. SOUTH master는 같은 20-chunk loader를 유지하되 canonical mask의 walkable은 투명, non-walkable만 organic mass, 경계는 `20px` feather다.

## 1. 런타임 계약

| 항목 | 현행 값 | 코드/파일 | 불변 조건 |
|---|---:|---|---|
| stage | `1` | `_CH1_BAKED_SPIKE.stage` | 다른 stage 미적용 |
| master bounds | world `(0,4096)`, `8192×4096px` | `CH1_SOUTH_MASTER.png` | SOUTH 밖 확대 금지 |
| master local bounds | `(0,0)~(8192,4096)` | build script | world Y는 local Y+4096 |
| chunk size | `1024px` | `_CH1_BAKED_SPIKE.chunkSize` | 변경 없음 |
| bleed | `1px` | `_CH1_BAKED_SPIKE.bleed` | 각 PNG `1026×1026` |
| registered chunks | `20` | 아래 표 | 75-layout과 무관 |
| baked opt-in | `ch1BakedSpike=1` | `_ch1BakedSpikeEnabled()` | 기본 OFF |
| B suppression opt-in | `ch1BakedSuppressVisual=1` | `_ch1BakedSuppressVisualEnabled()` | baked flag와 stage 1일 때만 유효 |
| render position | current floor 뒤, hill/MAP_OBJS 앞 | `_drawCh1BakedSpike(X)` | loader/renderer 구조 유지 |
| authored layout | `75/75`, skip `0` | `_CH1S1` | 좌표·수량 불변 |
| collision | 변경 `0` | 기존 map/MAP_OBJS | draw-only suppression, collider 보존 |

### chunk 표

| world chunk Y | X | 수량 | 적용 권역 |
|---:|---|---:|---|
| `4` | `3,4` | 2 | north transition 중앙 |
| `5` | `0~7` | 8 | arena·toxic/cocoon 상부 |
| `6` | `0~7` | 8 | arena·toxic/cocoon 하부 |
| `7` | `3,4` | 2 | START 중앙 |
| **합계** |  | **20** | stage 1 SOUTH only |

파일명 공식은 `assets/map/ch1/baked_spike/south_visual_pass/chunk_{x}_{y}.png`다. `tools/build_ch1_south_mass.mjs`가 하나의 master에서 1px copy bleed를 포함해 재추출한다.

## 2. SOUTH master 파일

| 역할 | 경로 | 규격 | 설명 |
|---|---|---:|---|
| CURRENT 보존 master | `captures/ch1_south_canary_side_mass_20260829/SOURCE_BEFORE/CURRENT_SOUTH_MASTER.png` | `8192×4096` | 수정 전 20개 chunk core를 재조립한 보존본 |
| CURRENT 보존 chunks | `captures/ch1_south_canary_side_mass_20260829/SOURCE_BEFORE/chunks/` | 20×`1026²` | 수정 전 원본, 덮어쓰기 금지 |
| build base | `assets/map/ch1/baked_spike/south_visual_pass/CH1_SOUTH_BASE.png` | `8192×4096` | 수정 전 SOUTH visual base |
| AFTER master | `assets/map/ch1/baked_spike/south_visual_pass/CH1_SOUTH_MASTER.png` | `8192×4096` | 현행 합성 source of truth |
| composition manifest | `assets/map/ch1/baked_spike/south_visual_pass/composition.json` | JSON | bounds·소스·depth·overlap·center 보호 |
| deterministic builder | `tools/build_ch1_south_mass.mjs` | Node+sharp | master 합성→20 chunks 재추출→overview 생성 |

## 3. 합성 구조

모든 side는 `BACK DARK MASS → MID COMPOSITE → FRONT BREAKUP` 순서다. 단순 검은 overlay 한 장이 아니라 불규칙 gradient/recess와 기존 root/corpse texture를 함께 사용한다.

| side | grammar | source composites | nominal overlap | depth | floor connection |
|---|---|---|---:|---|---|
| LEFT | 낮고 넓은 수평 뿌리/시체 벽 | `corner_sw`, `corner_nw`, `bound_w` | `30~50%` | BACK/MID/FRONT | `prop_g_root`, `prop_g_toxic`, `prop_s_root`, dark wet recess |
| RIGHT | 높고 뒤틀린 수직 뿌리/시체 벽 | `bound_e`, `corner_ne`, `corner_sw`, `corner_nw` | `30~50%` | BACK/MID/FRONT | `prop_g_corpse`, `prop_s_root`, `prop_s_pod`, corpse/root shadow |

| layer | 밝기/선명도 | 역할 | 반복 은폐 |
|---|---|---|---|
| BACK | brightness `0.28~0.35`, saturation `0.36~0.44`, blur `1~1.4` | screen outer edge까지 이어지는 dark mass·recess | crop/flip/rotation, 낮은 alpha |
| MID | brightness `0.38~0.48`, saturation `0.43~0.58` | 주 면적과 좌우 silhouette grammar | 30~50% overlap, 크기·깊이 차이 |
| FRONT | brightness `0.48~0.58`, saturation `0.54~0.72` | playable edge의 root/toxic/corpse 접속 | 작은 돌출만 판독, center 미침범 |

중앙 protected visual band는 world X `3450~4800`, 폭 `1350px=33.75 tiles`다. 이 구간은 ground-paint-only이며 대형 vertical prop·corpse/tree mass를 넣지 않는다. 좌우 inner edge만 카메라 양끝에 약하게 들어오며 실제 collision이나 전투 폭은 바뀌지 않는다.

## 4. A/B 표시 규칙

| pass | query | 표시 | 목적 |
|---|---|---|---|
| CURRENT | flag 없음 | 현행 floor+모든 props | 수정 전 기준 |
| A | `ch1BakedSpike=1` | baked+모든 기존 props | 기술 안전성·중복 비교 |
| B | `ch1BakedSpike=1&ch1BakedSuppressVisual=1` | baked+SOUTH visual representation suppression | 최종 시각 평가 |

B는 `MAP_OBJS`를 삭제·filter·splice하지 않는다. `MAP_OBJS` draw loop에서 다음 조건에만 `continue`한다.

| 조건 | 값 |
|---|---|
| stage/flag | stage 1 + baked ON + suppression ON |
| authored | `mo._hand===1` |
| SOUTH Y | `mo.y>=112*T` |
| exact ids | `m_c1gbattle`, `m_c1gbattler`, `m_c1gtoxic`, `m_c1gtoxicf`, `m_c1gcorpse`, `m_c1gcorpsef`, `m_c1gedge`, `m_c1gedgef`, `m_c1sroot`, `m_c1sbone`, `m_c1spod` |

`m_c1pool`과 `m_c1cocoon`은 landmark이므로 B에서도 보존한다. toxic은 LEFT의 root contamination/dark wet ground에서 번지고, cocoon은 RIGHT의 corpse/root ground에서 증식하는 구도로 master에 접속부를 bake했다.

## 5. Visual QA

동일 1600×900 camera 좌표를 사용했다.

| 화면 | tile camera | CURRENT | B 판정 |
|---|---:|---|---|
| START | `(100,185)` | 남측 `gedge`가 블록 띠로 노출 | 좌우 외곽 질감이 screen edge로 이어지고 center 개방 |
| south arena | `(104,146)` | 독립 원형 battle patch | patch 단위 제거, 중앙 저밀도·side 고밀도 유지 |
| LEFT/toxic | `(35,151)` | 원형 toxic patch+pool 섬, 사각 edge | 낮고 넓은 root/toxic mass에 pool 접속 |
| RIGHT/cocoon | `(165,158)` | 원형 corpse patch+cocoon 섬, 사각 edge | 높은 corpse/root mass에 cocoon 접속 |
| north transition | `(100,120)` | 빈 ground 중심 | 좌우 inner edge만 진입, 주 통로 보존 |

| 질문 | 최종 B |
|---|---|
| LEFT 대형 구조물 수를 셀 수 있는가 | NO |
| RIGHT 대형 구조물 수를 셀 수 있는가 | NO |
| 구조물 사이 넓은 빈 ground가 보이는가 | NO |
| LEFT가 연속 환경 mass인가 | YES |
| RIGHT가 연속 환경 mass인가 | YES |
| screen outer edge까지 이어지는가 | YES |
| side가 ground에 붙는가 | YES |
| 중앙 arena가 열려 있는가 | YES |
| LEFT/RIGHT grammar가 다른가 | YES |
| block-placement 인상이 감소했는가 | YES |

전투 B 캡처는 arena에 player 1, enemy 5, enemy projectile 3, red parry state, fire/blue skill particles를 동시에 표시했다. player/enemy/projectile/parry/skill VFX는 중앙 저밀도 바닥 위에서 판독되며 foreground mass가 전투 실루엣을 덮지 않는다.

## 6. Runtime QA

| 항목 | 결과 | 근거 |
|---|---:|---|
| registered/ready/error | `20/20/0` | `__ch1BakedSpikeQA()` B run |
| decode | first `18.5ms`, last `314.9ms` | async decode |
| GPU warm | `20/20`, max `12.1ms` | 기존 `_scheduleGpuWarm/_warmImageGpu` |
| draw | max sampled `0.1ms` | camera-culled draw |
| seam | PASS | 모든 인접 chunk의 양방향 1px bleed pixel equality |
| pageerror | `0` | CURRENT/A/B/combat/route run |
| asset 404 | `0` | 동일 |
| authored | `75/75`, skip `0` | `[HAND_DECO]`와 runtime facts |
| START/EXIT | walkable | `(100,185)`, `(100,10)` `isW=false`, `canMove=true` |
| central axis | walkable | y `40,60,80,100,120,140,160` 전부 true |
| pool/cocoon | 중심 collision 유지, 사방 접근 가능 | 기존 collision probe |
| coordinates/collision | 변경 `0` | `_CH1S1`, map, collider code 미수정 |

기존 `tmp/verify_ch1_si1_final.mjs`의 종합 `ALL_PASS`는 CURRENT와 B 모두 false다. 원인은 visual pass가 아니라 비결정적 이동 timeout과 낡은 보행률 허용치(`0.60~0.72`; 현행 `0.9747`)다. 핵심 비교값인 stage/map/authored/placed/spawn/central axis/landmark collision/pageerror/404는 CURRENT와 B가 동일하다.

## 7. 산출물

| 산출물 | 경로 |
|---|---|
| SOUTH MASTER AFTER overview | `captures/ch1_south_canary_side_mass_20260829/AFTER/SOUTH_MASTER_OVERVIEW.jpg` |
| CURRENT/A/B START | `COMPARISONS/01_start_CURRENT_A_B.jpg` |
| CURRENT/A/B arena | `COMPARISONS/02_south_arena_CURRENT_A_B.jpg` |
| CURRENT/A/B LEFT | `COMPARISONS/03_left_toxic_CURRENT_A_B.jpg` |
| CURRENT/A/B RIGHT | `COMPARISONS/04_right_cocoon_CURRENT_A_B.jpg` |
| CURRENT/A/B transition | `COMPARISONS/05_north_transition_CURRENT_A_B.jpg` |
| LEFT close-up | `COMPARISONS/LEFT_mass_closeup.jpg` |
| RIGHT close-up | `COMPARISONS/RIGHT_mass_closeup.jpg` |
| combat readability | `B/06_combat_readability.png` |
| runtime facts | `CURRENT/qa.json`, `A/qa.json`, `B/qa.json`, `B/combat_qa.json` |
| 최종 보고서 | `captures/ch1_south_canary_side_mass_20260829/FINAL_REPORT.md` |

## 8. 판정

`PASS` — 구조물 재료의 개별 단위보다 LEFT/RIGHT의 연속 환경 질량이 먼저 읽힌다. 중앙은 열려 있고 전투 가독성·75 authored layout·collision·loader/warm 경로는 유지된다. 이 판정은 SOUTH canary visual pass에만 해당하며 CENTER/NORTH production 확대 승인은 아니다.


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
