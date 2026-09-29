## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — 생체 디테일 캐시 제작86차

본편 living module은 **20260929-86**. 캠프손·나무뿌리 첫캐시를 단일 유휴 큐(3ms목표/requestIdle120ms/타이머8ms,mesh32cell·접지8행yield)로 분할했다. 준비/실패중원본sprite폴백,동일이미지중복제작0. 기존애니메이션·PNG·geometry유지;배경cache/bakeVersion20260929-outer-85/21빌드레이어/64청크불변. 본편8뷰60제한59.81~60.00FPS,64적12초59.74FPS,준비후34ms초과0. cold GPU업로드290ms잔여로전체프레임해결은아님. 총60검사PASS·실제Chrome6픽셀표본변경0.

[86차 수치·한계·MAP PRODUCTION REPORT](CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md). 아래모듈버전과동기캐시제작표현은당시제작이력이며,현행준비중organic=false 계약은위SSOT를따른다.

## 2026-09-29 — CH1-1 피부–사목 접합85차 적용

현행 cache/bakeVersion은 **20260929-outer-85**, 빌드 레이어는 **21개**다. 서측 하단의 피부 바닥–사목 어깨를 낮은 부패 수피·괴사막으로 연결했다. 비보행101764px만 변경/보행0/고목 핵심 보호3579735px 변경0, 변경chunk1_6 1개·동일63개. 새로고침한 본편8기본 카메라+접합·전투2위치, 이벤트 기반 S/W 이동·24적 공격/Q, 게임error·contextloss0/64청크 응답실패0. 기존 회귀55PASS,21레이어 전체 마스터 재현·224경계 동일. 새 모션0/geometry·충돌 변경0. 전체 **VISUAL VERDICT: RETOUCH**.

[85차 수치·출처·MAP PRODUCTION REPORT SSOT](CH1_OUTER_CONNECTION_PASS85_20260929.md). 아래84차 이하의 '현행'은 당시 제작 이력이다.84차의 미완료 문구는 저장된 최종 검수로 보정했다.

## 2026-09-29 — CH1-1 고목 접합84차 제작 이력

현행 배경은 cache/bakeVersion **20260929-outer-84**다. 서측 부채꼴 고사리 구역을 낮은 부패 수피·괴사막으로 연결했다. master8192²/world8000²/tile40/64청크(core1024/bleed1/1026²), 변경chunk_1_5 1개·동일63개. 총109465px 변화(보행재질12058/비보행97407), geometry·충돌 변경0. 고목 보호2904814px 변경0; 이전 패치 보호 해제는 crop-local[495,340,835,655] 내부뿐(기존 패치 변화70882/창밖0). 타원밖·zero-mask·crop밖0, 선택crop의 near-black≤12/18/22는17595→17392 /64360→63422 /124323→122945. 재질 채널하한24, ellipse[635,490,260,180]/feather.25/opacity.96/줄기보호MaxFilter25·blur18. skin65→outer66..84 총20레이어, 마지막patch x1024/y5120/2048². 기존61차 생체 모듈·늪·동맥 유지/새모션0. 후보9카메라 오류0/G.map동일. 84차 본편18카메라·24적30초 전투·전체 베이크 재현 검수 완료는 저장된 live/runtime·promotion·로그로 확인했다. 현행85차와 상세 검수는 문서 맨 위 링크를 따른다.

[84차 출처·검수 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer84). 아래83차 이하의 현행 표기는 당시 제작 이력이다. 전체 VISUAL VERDICT: RETOUCH.

> 2026-09-29 배경83차: 검정 비보행 공동 재질/54청크/cache20260929-outer-83. 기존61차 생체 모듈·동맥·늪 버블/가스 유지; 신규 모션0. [현행 MAP REPORT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83).

> 2026-09-29 현행 baked 배경은82차(`20260929-outer-82`)다. 기존61차 Ch1LivingDetail 모듈·geometry·늪/가스/동맥은 그대로이며82차 새모션0. [82차 배경 계약](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer82). 아래81차 이하의 배경 표기는 제작 이력이다.

> 2026-09-29 배경81차: master/chunk_1_5.png/chunk_2_5.png/cache20260929-outer-81의서측피부위쪽국소접합이다.생체모듈61차·늪버블/가스/동맥·충돌유지,신규움직임0.연속카메라검수종료원인은미확정. [현행배경·MAP PRODUCTION REPORT](CH1_1_PRODUCTION_FINISH_20260916.md).

> 2026-09-28 배경80차 기록(81차 이전): chunk_1_5.png/chunk_1_6.png와master/cache20260928-outer-80을서측피부접합에부분반영했다. 생체모듈61차와늪버블/가스/동맥·충돌은그대로다. 신규움직임0. [현행배경·MAP PRODUCTION REPORT](CH1_1_PRODUCTION_FINISH_20260916.md).

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

# CH1-1 기존 맵 디테일·접지·생체 움직임

> **53차 현행(2026-09-27):** CH1서쪽 m_bone_arch(1420,6020)에 하단alpha접촉그림자256²/.25MiB 추가.원화·불꽃·충돌·타챕터아치유지.모듈20260927-53. [수치·검증](CH1_ARCH_CONTACT_PASS53.md).


> **52차 현행(2026-09-27):** 북동pool 남쪽에 regionalSkin variant4, tile(167,47)/900×680 지면전이 추가.768×512/1.5MiB, 가시때1draw.기존버블·접지·충돌유지,모듈20260927-52. [현행색·영역·검증](CH1_POOL_APPROACH_PASS52.md).


> **51차 현행(2026-09-27):** 북동pool 접지폭을 균일24px에서 비대칭18~44캐시px로 변경. 왼쪽아래·오른쪽의 젖은 번짐, 기존512²캐시/버블/충돌유지. 모듈20260927-51. [현행공식·검증](CH1_POOL_SEEP_PASS51.md).


> **50차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)의 기존 표면 효과를3개 파열 vent로 교체. 큰늪64프레임 버블 atlas 재사용+gas512²/1MiB.49차접지·충돌유지,모듈20260927-50. [현행동작·검증](CH1_POOL_BURST_PASS50.md).


> **49차 현행(2026-09-27):** 북동 m_c1pool(6700,1740)에 원화 alpha 윤곽의 젖은 접지512²/1MiB 추가. 기존 수축·충돌 유지. 모듈20260927-49. 이전 버전·메모리 기록은 해당 pass 이력이며 [현행 추가분·검증](CH1_POOL_CONTACT_PASS49.md) 참조.


> **48차 현행(2026-09-27):** 정상부/ramp surface 합성에 alpha 실루엣 기반 그림자 rgba(10,9,12,.32), blur20, offset(0,18) 추가. 정적 언덕 캐시에만 적용. [적용 범위·검증](CH1_HILL_DEPTH_PASS48.md).


> **47차 현행(2026-09-27):** 제단 정상부·ramp floor 반복 크기 round(_gtTileSz(floor)×1.4), texture에만 saturate(.7)/contrast(.92)/brightness(.92) 적용. 공통 월드 원점·46차 윤곽·44차 feather 유지. [현행 수치·검증](CH1_HILL_MATERIAL_PASS47.md).


> **46차 현행(2026-09-27):** 정상부의 정확한 타원을 96점 비대칭 폐곡선으로 교체. 사면 명암은 organicSkirt 전체에 적용. 44차 feather·45차 색상/월드 정렬·높이·충돌 유지. [윤곽 공식·검증](CH1_HILL_CONTOUR_PASS46.md).


> **45차 현행(2026-09-27):** 제단 사면의 갈색 radial wash를 저채도 방향광으로 교체하고, ramp 바닥을 정상부와 같은 월드 좌표에 정렬. 44차 48px alpha·높이·충돌 유지. [현행 색상·검증](CH1_HILL_SHADING_PASS45.md).


> **44차 렌더 보강(2026-09-27):** smoothing 언덕의 정상부·오르막 접합과 전체 외곽에 48px L1거리/smoothstep 알파 감쇠 적용. 캐시 1900×960 유지. 높이·충돌·서쪽ramp·원본PNG·배경청크불변. [현행공식·검증](CH1_HILL_EDGE_BLEND_PASS44.md).

> **43차 현행(2026-09-27):** m_leaf/leaf_pile 원화·고정1배치폐기. 낙엽유지였던이전기록은검수이력. scatter현재m_fbones,m_poison 2항목,전체폐기34id. 공유뼈·시체유지. [현행SSOT](CH1_LEAF_RETIREMENT_PASS43.md).

> **42차 현행(2026-09-27):** 구형 spider_web 원화·동일사본4개와CH2 seamWeb4배치폐기. CH2 authored105/시스템포함107,충돌51+비충돌54,seam6,wall-belt27. 구형거미줄유지였던41차기록은검토이력. 큰거미줄뼈기둥보존. [현행SSOT](CH2_WEB_RETIREMENT_PASS42.md).

> **41차 현행(2026-09-27):** 구형장식 acid_pool/poison_puddle/flesh_pile/meat_stake 4원화·사본11개폐기. 기존배치/재작업계획은이력. 실제독구덩이·대형늪·거미줄유지. [현행SSOT](CH1_SMALL_ORGANIC_RETIREMENT_PASS41.md).

> **40차 현행(2026-09-27):** 흰부유돌처럼읽히는 moss_patch/ash_pile/mud_stain/ground_crack 지면원화4종폐기. loader·고정8배치·scatter후보에서제거. leaf와전투VFX ground_crack_sheet는유지. [현행SSOT](CH1_GROUND_DECAL_RETIREMENT_PASS40.md).

> **39차 현행(2026-09-27):** 구형 rotten_tree/vine_pillar 원화와사본7개 폐기. 게임·편집기·충돌·나무움직임에서제외. 과거배치/확대재작업계획은이력. dry아틀라스는전용 _atlasDry:1로분리해동작보존. [현행폐기SSOT](CH1_LOW_QUALITY_RETIREMENT_PASS39.md).

> **38차 현행(2026-09-27):** 구형 weapon_pile.png 및 동일사본4개 폐기·격리. m_wpile/m_c5wpile/weapon_pile 사용금지. 과거무기더미배치·접지기록은이력이다. 접지현행2장/0.5MiB,전체native87.81269454956055MiB,모듈20260927-38. [검수·폐기 SSOT](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md).

> **2026-09-27 37차 현행 폐기 결정:** 구형 tombstone.png와 exposed_root.png는 사용자 지정 저품질 원화로 사용 금지. 36차 접지 보강은 폐기되었다. 아래의 해당 에셋 수치·좌표·접지 기록은 과거 이력이며 현행 등록·배치가 아니다. 동일 원화 6파일 격리, CH1 authored 8배치 제거, 접지 계열은 3장/0.75MiB로 복귀. [폐기 SSOT](LOW_QUALITY_ASSET_RETIREMENT_20260927.md).

> 2026-09-27 보석함 작업 후속: 아래 역사적 검증 결과의 `inventory-gems-finish.css` NW.js FILES 누락은 보석함 작업에서 `build-nwjs.mjs` 복사 목록에 추가했다. CSS 참조·목록 포함은 디스크 소스로 확인했으며 전체 패키징 테스트/실제 빌드는 재실행하지 않았다. 아래 당시 실패 수를 성공으로 바꿔 기록하지 않는다. 이 보완은 맵 코드·설계 변경이 아니다.

사용자 지시: 현재 1-1을 보존하고 디테일·입체감·동적 움직임만 추가한다. 기존 production_finish 베이스 위의 국소 보강이며 v4~v8 정지 원화의 게임 적용이 아니다.

## 런타임 계약

| id / 적용 위치 | 값 / 동작 |
|---|---|
| 구현 | `ch1-living-detail.js?v=20260927-36`, 전역 `Ch1LivingDetail.draw/deform/shadows/hideDuplicate/groundSprite/swamp/pit/organic`; `build-nwjs.mjs` 배포 FILES에도 포함 |
| 구역 지면 전이 | `skinRegions`/`regionalSkin`: SIDE_L·SIDE_R·ARENA·CAMP_FRONT의 정적 피부막. 각768×512 RGBA, 최대4장/6MiB. 위치·팔레트·베이크 규격은 아래20차·32차·34차 표. 기존 국소 움직임과 별도이며 전체 지면 교체 아님 |
| 범위 | `G.stage===0`, `_bossArena` 및 `_fieldRebuildQA` 제외 |
| 지면 순서 | `_drawCh1Hill` 다음, 오브젝트·캐릭터·전투 효과 이전. `surfaceOnly=true` 잔물결은 맵 오브젝트 뒤/캐릭터 앞 |
| 앵커 배율 | `m_c1tree:2.1`, `m_c1cocoon:1.1`, `m_c1pool:1.25`, `m_c1spod:.65`, `m_c1sroot:.75`, `pit_poison:1.2`, `m_rotten_tree:1` |
| 실제 배율 s | 앵커 배율 × `min(1.6, mo.scale || 1)` |
| 시야 제외 | 카메라 반폭/반높이 + `160*s`; zoom=`max(.3, _edZoom || _camZoom || 1)` |
| 렌더 자원 | 런타임 생성 투명 canvas atlas 6종(조직3형태/독액 주변/수면/체액), 각각 1280², 4×4칸, 셀320², 16프레임. 최대 RGBA 37.5MiB, 최초 사용 후 재사용 |
| 접지 Y 오프셋 | `m_c1tree:230`, `m_c1cocoon:100`, `m_c1spod:40`, `m_rotten_tree:50` px × `(mo.scale || 1)`; 기타0. 수면은 오프셋0 |
| 합성 | source-over 기본, 인접 두 프레임 alpha `1-mix`/`mix`. GPU에는 `drawImage`만 전달, 곡선/gradient는 native Canvas2D에서 최초 베이크 |
| 맥동 | 각속도 `.00095 rad/ms`, 약6.614초/주기; 앵커 위상 `x*.017+y*.011`; 프레임16개 사이 선형 혼합 |
| 접촉 그림자 | 중심(12,24), Y축 .42; 반경12→156, alpha `.48/.25/0`(stop `0/.48/1`) |
| 힘줄 | dry3/4/5갈래, wet5갈래; seed=variant*1.7, 각도간격2.399rad, 길이 `100+42*sin(seed+j*1.7)`, 지면 Y `.55`; 고정 시작부(0,14), 중간 굽힘7*sin(phase-j*.8)*sin(πu)^2 px(10차), wet 끝점 고정; dry는23차 끝 선행 포복 추가, 갈래 위상차.8rad |
| 힘줄 명암 | 4차 연속 리본 면: 아래 공식 표 참조. 기존24분절 스트로크를32구간 표본의 연결 면으로 교체, 겹치는 선 끝의 어두운 마디 제거 |
| 독액 | `m_c1pool`/`pit_poison` 주변 끊어진 잔물결3개; X반경14→59, Y반경5→17, alpha 최대.16. 맥동과 같은 주기 |
| 고치·독낭 | `m_c1cocoon`/`m_c1spod`만 변형; `sin(now*.00105+x*.017+y*.011)`, 약5.984초; X±1.8%, Y∓1.2%, 기준점 `(x,y+32)` |
| 나무 움직임 | `m_c1tree`, `m_rotten_tree`, `m_vine_pillar`, `m_ctree숫자` 대상. wave=`sin(now*.00072+x*.017+y*.011)+.3*sin(now*.00131+y*.019)`; 시체나무 회전wave×.009rad, 기타×.018rad |
| 나무 접지 | size=`(meta.sz||400)*(scale||1)`, pivot=(x,y+size×.2016) 시체나무 / (x,y+size×.45) 기타. 회전 시 밑동 고정, 충돌 불변 |
| 투영 그림자 | 위 나무의 기존 이미지 알파를 이용해 최초1회 생성, 이미지별 WeakMap 캐시. 640×320 transparent canvas; source rect 반영; translate(170,24), transform(1,0,-.55,-.52,0,0), blur4px, 원본을(-145,-400,290,400)에 투영 |
| 그림자 명암 | source-in RGB(8,5,12), Y24→260 gradient alpha .65/.36/0 @stop0/.65/1. 런타임 alpha .6, scale=`size*(시체나무?.72:1)/400`; X drift=`sin(now*.00072+x*.017+y*.011)*4*scale` |
| 그림자 위치/제외 | (x-170×scale+drift,foot-24×scale), 크기(640×scale,320×scale); 카메라 반폭/반높이+size 밖 제외. 소스 미로드 시 스킵 |
| 길 가장자리 조직 | `tissue_bed:1.8`, 아래 고정11좌표. MAP_OBJS·충돌에 추가하지 않는 지면 렌더, 새 scatter 아님. 기본 맥동 주기 공유, angle은 고정 회전 |
| 보존 | MAP_OBJS/geometry/collision/START/EXIT/진행/데미지/원본 청크 수정 없음. 자동 scatter 추가0 |
| 폴백 | 스크립트 미로드 시 optional global 검사로 기존 맵을 계속 렌더. 신규 외부 이미지 다운로드 없음 |

색상/곡선 제어점의 상세값은 동명의 소스에 대응하며 조직 몸체 RGBA `(87,44,52,.78)`, 독액 몸체 `(63,61,35,.65)`, 상면 `(158,119,114,.3)`, 가지 `(71,43,44,.3)`, 잔물결 RGB `(149,142,83)`이다. 전체 지면 피부 교체와 대형 외곽 높이 재설계는 범위 밖이다. 동측 작은 구덩이 깊이/국소 수축은 9차에 적용, 기존 대형 원화의 벽 분리 변형은 미구현이다. 단,27차부터 큰늪 수면4곳의 흐름·기포는 구현되며 바위·외곽은 정적이다.

### 2차 길 가장자리 고정 좌표

월드 좌표는 `(타일+.5)*40`. 각 패치는320×1.8=576px footprint이며 지면 낮은 조직이다.

| id | 타일x | 타일y | 회전rad |
|---|---:|---:|---:|
| G01 | 91 | 181 | -.3 |
| G02 | 114 | 177 | .5 |
| G03 | 87 | 155 | .7 |
| G04 | 122 | 148 | -.5 |
| G05 | 79 | 124 | .2 |
| G06 | 119 | 114 | -.8 |
| G07 | 85 | 96 | .4 |
| G08 | 126 | 81 | -.6 |
| G09 | 91 | 62 | .5 |
| G10 | 116 | 47 | -.2 |
| G11 | 97 | 27 | .8 |

## 검증

- `test/ch1LivingDetail.test.js`: stage/arena/실험맵 격리, 결정적 시간 변화, 화면 밖 제외, 게임 데이터 및 canvas 상태 보존, 곡선 API 없는 GPU proxy 지원.
- `tools/qa_ch1_living_detail.py`: 로컬3333의 본편 경로, 8개 기본 카메라+나무/고치/독액 상세3개, pageerror/console error/HTTP error, 렌더 CPU 표본, 지형 무변경 검사.
- 1차 근거: `captures/ch1_living_detail_20260925/`. 2차 근거: `captures/ch1_living_detail_pass2_20260925/`; before는 같은 현재 게임에 1차 효과 스크립트만 라우팅한 비교, after는2차. before/after 및 영상은 로컬 검수 파일이며 git ignore 대상.
- 최초 검수에서 GPU proxy의 `bezierCurveTo` 미지원으로 월드 그리기가 중단됨을 발견했다. 실패 재현 테스트 후 atlas drawImage 방식으로 수정했다.

## MAP PRODUCTION REPORT

STAGE: CH1-1 production.

MASTER: silhouette/8 regions/남북 main route/side spaces는 기존 고정 배치 유지.

OUTER MASS: LEFT/RIGHT/TOP/SOUTH 베이스 보존. major holes 새로 메우거나 외곽을 재설계하지 않음.

LARGE: source assets는 기존 production_finish 및 시체나무/고치/웅덩이. composites/overlap/repeated silhouette 변경 없음. 2차에서 기존 나무 스프라이트의 밑동 고정 회전과 원본 알파 기반 투영 그림자 추가.

MEDIUM: 기존 나무/뿌리 주변 및 남북 진행 길 어깨11곳에 낮은 생체 연결 추가. remaining holes는 이번 범위의 수정 대상 아님.

GROUND: 부드러운 접촉 shadow, 저대비 괴사조직, 가는 동맥과 상면빛으로 structure integration 보강. 지면 원본 보존.

PLAYABLE: main arenas/travel/breathing/threat space 보존. 저대비 지면 효과이며 신규 장애물 없음. 다수 적 실전 가독성은 별도 확인 필요.

LANDMARK: primary 시체나무, secondary 고치/독액, tertiary 뿌리·독낭에 기존 좌표 기반 효과.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 및 상세3개를 캡처해 확인한다. 전체 아트 최종 승인과 구분한다.

TECH QA: 1차13검사 PASS. 2차 총16검사 PASS(효과8/기존배치5/문법1/패키징2), 나무 접지 불변/입구 조직/알파 실루엣 그림자 회귀 추가. 최종11카메라 pageerror/console error/HTTP error 및 지형 무변경은 각 runtime.json에 기록. native Canvas2D CPU 표본은120회이며 GPU 프레임시간 아님. seam은 기존 청크를 유지하며 추가 경계 없음. 전체 전투 FPS 보증으로 해석하지 않는다.

FILES: stage-owned `ch1-living-detail.js`, 테스트, QA 도구, 본 문서. concurrent touched `game.html`과 맵디테일 문서에는 이번 변경만 적용. unrelated touched 없음.

GIT: 다른 작업의 staged 변경을 포함하지 않는 부분 체크포인트. push/deploy 없음.

VISUAL VERDICT: RETOUCH — 국소 입체감·움직임 보강. 전체 생체지옥 재질 완성 및 대규모 전투 최종 검수는 미완료.

NEXT PASS: 사용자 플레이 피드백에 따라 강도 조정. 기존 구도 보존 원칙 유지.

2차 직접 확인: <http://localhost:3333/captures/ch1_living_detail_pass2_20260925/index.html>. 게임 전체 화면 녹화 `after/camera-tour.webm`에는 자동 카메라 이동과 나무 앞6초 정지가 포함된다. QA 인트로 Escape 반복이 설정 패널을 열던 문제를 발견하여 컷씬일 때만 Escape를 누르고 촬영 전에 `closeAllPanels()`를 호출한다. 패널/흰 레이어로 가려진 초기 촬영은 완료 근거에서 제외한다.

## 3차: 수면과 고치의 국소 반응

| id | 값 / 적용 |
|---|---|
| 접지 얼룩 | 7개, 중심(cos(j*2.399)*38,18+sin(j*2.399)*17), Y배율.38, 반경3→48, alpha.22→0. wet RGB52,53,29 / dry55,29,40; 끝 RGB30,19,28 alpha0 |
| 기포 | m_c1pool/pit_poison에5개, 기존6.614초 주기. p=fract(phase/2π+j*.219), 중심(cos(j*2.399)*42,sin(j*2.399)*19) |
| 팽창 | p<.72, r=2+5*sin(min(1,p/.72)*π/2); 중심Y-r*.45, 반경(r,r*.65), RGB25,30,16 alpha=sin(p/.72*π)*.65 |
| 상면 | 중심(-1,-1) 이동, 반경(r*.72,r*.43), 회전-.2, arc3.4→5.7, RGB156,151,94 alpha=sin(p/.72*π)*.48, 폭1.2 |
| 붕괴 | p≥.72, q=(p-.72)/.28; 반경(7+15q,3+6q), arc.2→5.4, RGB143,140,83 alpha=(1-q)*.3, 폭1 |
| 체액 | m_c1cocoon/m_c1spod에3개, 기존feet Y오프셋 적용. p=fract(phase/2π+j/3), x=(j-1)*23 |
| 방울 | p<.65, q=p/.65; 중심(x+sin(phase+j)*2,-42+56q²), 반경(2.2,3+3q), RGB92,74,55 alpha=sin(qπ)*.65 |
| 착지 | p≥.65, q=(p-.65)/.35; 중심(x,14), 반경(3+14q,1+4q), arc.3→5.7, RGB115,88,71 alpha=(1-q)*.3, 폭1 |
| 자원/격리 | atlas4종 최대25MiB, 기존16프레임 crossfade; stage0 production만. 기존 물결3개/속도/피해/충돌/좌표 유지 |

MAP PRODUCTION REPORT (3차): MASTER/OUTER MASS/LARGE/PLAYABLE 기존 보존. MEDIUM/GROUND 접지 얼룩, LANDMARK 웅덩이 기포·고치 체액 추가. CAMERA QA는 기본8곳+상세3곳, 상세마다6초 정지 녹화. TECH QA 17검사 PASS(효과9/배치5/문법1/패키징2). FILES/GIT는 본문과 동일한 작업 전용 부분 커밋. 근거 `captures/ch1_living_detail_pass3_20260925/after/runtime.json` 및 영상.

3차 브라우저 결과: 11카메라 촬영 완료, pageerror/console error/HTTP error 모두0. 고치/웅덩이 상세 스크린샷 직접 확인. 전체 카메라를 직접 플레이한 결과는 아니며 영상에는 카메라 강제 이동이 포함된다. 확인 페이지: <http://localhost:3333/captures/ch1_living_detail_pass3_20260925/index.html>.

VISUAL VERDICT: RETOUCH — 국소 효과 보강, 전체 생체 재질과 대규모 전투 최종 검수 미완료.


## 4차: 연속 동맥과 이동하는 압력 맥동

| id | 값 / 공식 |
|---|---|
| 표본 | k=0..32, u=k/32, v=1-u, taper=v^.8. 기존 cubic 경로·굴곡8px·주기6.614초 유지 |
| 압력 | pressure=(.5+.5*sin(phase-u*2π-j*.8))^6. 동맥 길이를 따라 이동하는 국소 팽창, 별도 발광 없음 |
| 폭 | w=(5.2+pulse*1.5+pressure*4)*taper+.2. pulse=.5+.5*sin(phase-j*.8) |
| 면 연결 | 이전/다음 표본 방향의 수직 단위벡터로 좌우 경계 생성, 끝에서 역순 연결 후 fill. 기존 atlas 최초 생성에만 적용 |
| 그림자 | 반폭 w*.6+2.2, 오프셋(1.5,2.5), RGBA13,7,12,.32 |
| 몸체 | 반폭 w*.5, 오프셋0, dry RGBA77,40,47,.68 / wet63,61,35,.65 |
| 상면 | 반폭 w*.19, 오프셋(-.7,-1.3), RGBA148,112,110,.22 |
| 보존 | atlas4종/16프레임/25MiB/기포5개/체액3개/길11곳, geometry·충돌·게임플레이 불변 |

MAP PRODUCTION REPORT — 4차

STAGE: CH1-1. MASTER: silhouette/8region/남북 동선/side spaces 보존. OUTER MASS: LEFT/RIGHT/TOP/SOUTH 및 기존 holes 불변. LARGE: 기존 source/composites/overlap/repeated silhouette 유지. MEDIUM: 기존11지면 연결과 앵커의 동맥 면 개선, holes 재설계 없음. GROUND: 연속 접촉 그림자·괴사색 몸체·이동하는 팽창으로 접지와 높이 보강. PLAYABLE: arena/travel/breathing/threat 공간 유지, 전투 가독성 최종 대규모 검수 미완료. LANDMARK: 시체나무/고치/독액/뿌리 위계 유지. CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 및 상세3곳 촬영; START에도6초 정지 추가. TECH QA: 17검사 PASS, 기존 route/collision 및 원본 chunk seam 보존. 브라우저 로그는 captures/ch1_living_detail_pass4_20260925/after/runtime.json. FILES: 전용효과/QA/문서, 공유 game.html 캐시버전과 콘셉트 문서 해당 행만 변경. GIT: 이번 변경만 부분커밋, push/deploy 없음.

VISUAL VERDICT: RETOUCH — 국소 동맥 표현 개선. 전체 지면 피부화/외곽 생체지옥 완성은 미완료.
4차 브라우저 실측: 11카메라 촬영 완료, pageerror/console error/HTTP error 모두0. START 및 TREE_DETAIL 직접 이미지 검수: 분절 선 끝의 반복 마디 감소, 중앙 플레이어·전투 이펙트와 구분됨. 나뭇가지형 조직의 반복 배치와 전체 재질 차이는 잔여 RETOUCH. 대규모 전투 FPS를 보증하지 않는다. 확인 영상: <http://localhost:3333/captures/ch1_living_detail_pass4_20260925/index.html>.

NEXT PASS: 실제 플레이 피드백에 맞춰 강도·주변 연결 개선.


## 5차: 반복 완화와 바닥 접합

| id | 적용 / 수치 |
|---|---|
| 형태 선택 | dry만 variant=abs(floor(x/40)*7+floor(y/40)*11)%3. wet/surface는0. 동일 좌표 항상 동일 형태, 무작위 프레임 변화 없음 |
| 갈래 | dry3+variant, wet5. seed=variant*1.7; 각도seed+j*2.399, 길이100+42*sin(seed+j*1.7). 실제 시간 위상은 기존 x*.017+y*.011과 atlas 위상 유지 |
| 시작점 | sx=sin(j*1.3+seed)*22, sy=8+cos(j*1.9+seed)*12; cubic 시작 항 v³*sx/v³*sy. 중앙 한 점 집중을 분산 |
| 지면 출현 | 기존 폭w에 emerge=sin(min(1,u/.14)*π/2)를 곱해 시작14%를0→전체 폭으로 연결. 잘린 관 단면처럼 보이는 시작점 보정 |
| 끝 접합 | ground atlas만 destination-in radial 중심(0,12), 반경82에서alpha1→155에서0. 셀(-160,-160,320,320) clip 후 적용해 인접 프레임 침범 방지 |
| 자원 | dry3 + wet ground1 + surface2 = 최대6장,1280²각각, RGBA37.5MiB. 이전4장25MiB 대비12.5MiB 증가. visible 앵커가 필요로 하는 형태만 최초 생성, 재사용 |
| 불변 | .00095rad/ms 맥동/16frame/충돌/동선/오브젝트 좌표/11지면 패치 보존. 전체 맵 피부 재질 교체 아님 |

MAP PRODUCTION REPORT — 5차

STAGE CH1-1. MASTER silhouette/region/남북 route/side spaces 기존 유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH와 major holes 불변. LARGE source/composites/overlap 유지, 신규 대형 반복 없음. MEDIUM 기존 앵커의 형태를3종으로 분화, remaining holes 범위 밖. GROUND shadow/contamination 유지, 동맥 시작점 분산과 끝 감쇠로 structure integration 보강. PLAYABLE arenas/travel/breathing/threat 공간 보존, 대규모 전투 가독성 최종 미검수. LANDMARK primary시체나무/secondary고치·독액/tertiary뿌리 유지. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세3곳. TECH QA17검사 PASS, route/collision 보존, 기존 chunk seam 불변; pageerror/404/loading은 captures/ch1_living_detail_pass5_20260925/after/runtime.json. 메모리 비용 위 표 참고, GPU FPS 보증 아님. FILES 전용효과/QA/docs, 공유 game 캐시버전·콘셉트 행만 수정, unrelated 변경 없음. GIT 전용 부분커밋, push/deploy 없음.

VISUAL VERDICT: RETOUCH — 국소 반복 감소, 전체 재질·외곽 완성 및 대규모 전투 검수 미완료.
5차 최종 재촬영: 11카메라 완료, pageerror/console error/HTTP error 모두0. START_motion 및 ARENA 직접 이미지 확인. 초기 촬영에서 잘린 관 시작점 확인 후 emerge 보정하고 재촬영함. 입구의 일부 형태 반복과 주변 흙 대비 조직 재질 차이는 잔여 RETOUCH. 확인 페이지 <http://localhost:3333/captures/ch1_living_detail_pass5_20260925/index.html>.

NEXT PASS: 화면 피드백에 따른 국소 연결 보강.


## 6차: 사용자 “잘 안 보이지만” 대응

이전4/5차 표는 해당 시점 이력. 현재 동맥 폭·변위·색은 아래 값이 우선한다.

| id | 변경 / 현재 값 |
|---|---|
| 굽힘 | bend=sin(phase-j*.8)*22, 이전8 대비2.75배. cubic 제어점 변위이며 전체 픽셀 이동량22px를 보장하는 뜻 아님 |
| 압력 폭 | w=((5.2+pulse*1.5+pressure*9)*taper+.2)*emerge. 압력 계수4→9 |
| 들림 | 표본Y=기존ny-pressure*7*sin(u*π). 양끝은 고정, 내부 국소 들림 |
| 색 | dry body RGBA87,44,52,.78; wet body63,61,35,.65 유지; 상면158,119,114,.3. additive 발광/점멸 없음 |
| 보존 | 주기6.614초, 16frame, atlas6장37.5MiB,3형태/11앵커/지형/충돌/진행 유지 |
| 확인 | 게임 카메라 TISSUE_DETAIL 타일91,184 추가. 실제 화면 영역(400,80,480,360)을24회 캡처해 반복 GIF, 각 캡처 사이250ms 대기. GIF 실제 측정 간격 사용, 인위적 가속 없음 |

MAP PRODUCTION REPORT — 6차

STAGE CH1-1. MASTER silhouette/regions/main route/side spaces 보존. OUTER MASS LEFT/RIGHT/TOP/SOUTH·holes 보존. LARGE source/composites/overlap/repeat 보존. MEDIUM 기존 앵커의 가시성 조정, 신규 holes 처리 없음. GROUND 그림자/오염 유지, 동맥 굽힘·압력 폭·들림과 상면 대비 강화. PLAYABLE arena/travel/breathing/threat 공간 불변, 화면 전체 흔들림 없음, 대규모 전투 최종 QA 미완료. LANDMARK primary시체나무/secondary고치·독액/tertiary뿌리 기존. CAMERA QA 기본8곳+기존상세3곳+동맥상세1곳. TECH QA 기존17검사 및 브라우저 pageerror/404 기록, route/collision/chunk seam 불변, GPU 성능 보증 아님. FILES 전용효과/QA/docs 및 공유game 캐시·맵디테일 행, unrelated 변경 없음. GIT 전용 부분커밋, push/deploy 없음.

VISUAL VERDICT: RETOUCH — 움직임 가시성 보강 단계, 전체 재질/외곽 완성과 별도.
6차 검수: 17검사 PASS,12카메라 완료, pageerror/console error/HTTP error0. TISSUE_DETAIL 직접 이미지에서 굵기와 상면 변화 확인. 실제 게임 화면 crop24프레임 GIF 저장, 리뷰 페이지에서2배 표시(480×360→960×720), 속도는 실제 측정 간격. 전체 플레이 배율 영상도 제공. <http://localhost:3333/captures/ch1_living_detail_pass6_20260925/index.html>.

NEXT PASS: 정상 플레이 배율에서 사용자 시인성 피드백 확인.


## 7차: 국소 피부막과 웅덩이 마감

사용자 “다음 맵디테일 완성해”에 따라 기존 맵 보존 범위의 디테일을 마감한다. 전체 신규 생체맵 원화로 교체하는 작업과 구분한다.

| id | 현재 적용 / 정확한 수치 |
|---|---|
| 피부막 캐시 | membrane(wet,variant), dry3+wet1 최대4장,320² RGBA 총1.5625MiB. 기존6atlas37.5MiB와 합산39.0625MiB(나무 그림자 별도). 기존 atlas 생성 시에만 합성, 프레임마다 재생성 없음 |
| 형태 | 72구간 폐곡선. angle=j/72*2π, r=102+18*sin(angle*3+variant)+11*cos(angle*5-variant), x=cos(angle)*r*1.12, y=12+sin(angle)*r*.62 |
| 피부 명암 | linear Y-70→85, stop0 RGBA34,25,31,.12 / .43 dry102,79,82,.54 또는 wet74,72,48,.54 / 1 RGBA26,18,25,.12 |
| 미세 재질 | LCG seed=781+variant*357+(wet?91:0), next=(imul(seed,1664525)+1013904223)>>>0, rand=seed/4294967296. 1600점: x=rand*290-145,y=rand*180-90,r=.35+rand*1.3,크기1.8r×r. j%3이면RGBA33,20,28,.08,그외169,144,130,.1. 고정 재질이므로 시간 깜빡임 없음 |
| 주름 | 9개. y=-42+j*12,x=-104+sin(j*2.1+variant)*16; cubic제어(-42,y-16),(32,y+13),끝(104-cos(j)*18,y-5). 암부RGBA29,18,27,.18 폭1.7, 상면Y-1.2/RGBA171,143,132,.12 폭.8 |
| 경계 | destination-in radial중심(0,12)반경28alpha1→143alpha0. 기존 지면 atlas 감쇠82→155도 마지막에 적용 |
| 웅덩이 수축 | m_c1pool만, wave=sin(now*.00095+x*.017+y*.011). pivot(x,y),X=1+wave*.012,Y=1-wave*.018. 중심 고정,충돌과 좌표 불변. 구덩이 수직벽을 별도 분리 변형한 구현 아님 |
| 순서 | 접촉 그림자→피부막→오염→동맥→기존 오브젝트→수면/체액→캐릭터. 캐릭터/UI 위에 피부막을 합성하지 않음 |
| QA | 기존12카메라+AUTHORED_POOL(167,45). 별도 시작부 WASD이동/LMB공격/Q입력 및90RAF간격 기록. 강제 카메라 이동과 실제 입력 검수를 구분 |
| QA 생존 조건 | 테스트 브라우저에서50ms마다 살아 있는 P.hp를P.mhp로 보충. 적/탄/VFX·입력은 유지. production 코드/밸런스/세이브 변경 없음. 난이도·생존 검증이 아닌 화면·입력 검수 |

MAP PRODUCTION REPORT — 7차

STAGE: CH1-1 production. MASTER: 기존53점 silhouette/8regions/남북 route/side spaces 유지. OUTER MASS: LEFT/RIGHT/TOP/SOUTH,holes 보존. LARGE: 기존 source/composites/overlap/repeated silhouette 유지, 전체 원화 교체 없음. MEDIUM: 기존 나무/고치/동맥 연결부에 피부막 추가,remaining holes 재설계 없음. GROUND: 기존 접지 그림자/오염 위에 주름진 피부막을 연결. PLAYABLE: arenas/travel/breathing/threat 공간 보존,새장애물0. LANDMARK: primary시체나무/secondary고치·독액/tertiary뿌리 계층 보존. CAMERA QA: 기본8곳+상세5곳 캡처 및 실제 입력 전투 화면. TECH QA: 19검사(효과11/geometry5/문법1/패키징2),route/collision 및 원본chunk seam 불변. 브라우저·성능·입력 결과는 captures/ch1_living_detail_pass7_20260925/after/runtime.json. FILES: 효과/test/QA/docs 및 공유game캐시·콘셉트행,unrelated 변경 없음. GIT: 전용 부분커밋,push/deploy 없음.

VISUAL VERDICT: RETOUCH — 기존 맵 보존 범위의 피부막·움직임·북동 웅덩이 중복 마감 반영. 전체 화면은 여전히 일반 흙과 식생 비중이 높고, 고치/나무와 지면의 스타일 차이가 남아 전체 생체지옥 콘셉트 FINAL PASS로 판정하지 않는다. 자동19검사로 visual PASS를 대체하지 않는다.

초기7차 촬영 실패: 사망 후 `_fallenResolve`가 없는 DOM의 disabled를 설정하며 `[LOOP CRASH] Cannot set properties of null` 발생. 이후 동일 정지 화면이 반복되어 카메라 근거로 폐기. 원본 실패 로그 `tmp/ch1-pass7-failed-death-runtime.json` 보존. 사망/리플레이 관련 동시작업과 충돌하지 않도록 이번 맵 작업에서 해당 시스템을 변경하지 않음. 재촬영은 위 체력 보충 조건을 명시하며 사망 흐름 자체의 해결 증거로 삼지 않는다.


7차 중복 POI 마감: 위 `hideDuplicate` 계약 적용. 북동 m_c1gtoxic 월드(6740,1620)를 loaded m_c1pool이 있을 때만 렌더 제외. authored/MAP_OBJS/충돌 개수 유지,시각중복1건 제거. 다른 toxicf 및 baked 청크 불변. 단계별 문서·에셋목록·CHANGELOG에도 같은 현행 예외를 동기화했다.

7차 최종 after 결과: 카메라13곳 및 COMBAT 촬영, 전체 contact board/AUTHORED_POOL/COMBAT 직접 확인. errors/HTTP errors0, mapUnchanged=true. 실제 입력 전후 위치(4020,7220)→(4011.69222,7211.69222); 네 방향 복귀 입력이므로 총 이동거리가 아닌 종료 좌표다.90RAF 표본 median33.4ms/p95 50.1ms(1280×720 headless·녹화중). 이는 대규모 전투 성능 통과 근거가 아니다. native효과 CPU 표본은 별도로runtime.json에 보존. 최초 사망 오류는 미해결이며 재촬영의0오류와 구분한다.

확인 페이지: <http://localhost:3333/captures/ch1_living_detail_pass7_20260925/index.html>. before는 같은 현재게임에6차 효과 스크립트를 연결한 아트 비교이며, 이전 게임 전체버전을 실행한 결과가 아니다. 기존 맵의 국소 디테일 마감과 전체 콘셉트 완성 상태를 구분한다.

## 8차: 독액 증기와 고치 점액 연결

| id / 적용 | 현재 수치·공식 |
|---|---|
| 증기 / m_c1pool,pit_poison | surfaceOnly 기존 수면 atlas에3갈래 추가. j=0..2,p=fract(phase/(2π)+j/3),phase=now*.00095+x*.017+y*.011. 주기약6.614초, 기존16프레임 보간 사용 |
| 이동·크기 | local x=(j-1)*35+sin(p*2π+j)*14,y=6-p*105,radius=13+p*17. 타원배율(.72,1.4). 위로105local px 상승,기존 오브젝트별 배율 적용 |
| 증기 합성 | opacity=sin(p*π)^1.4*.24. radial 0 RGB157,150,105 alpha opacity / .45 RGB105,111,74 alpha opacity*.65 / 1 RGB74,83,55 alpha0. source-over,양끝 투명,글로우 없음 |
| 점액 줄기 / m_c1cocoon,m_c1spod | 기존3개 낙하 체액에서 p<.65,q=p/.65,그중 q<.82일 때만 목 연결. x=(j-1)*23,endY=-42+q²*56,drift=sin(phase+j)*2 |
| 줄기 곡선 | 시작(x,-44),quadratic제어(x-3+drift,-40+(endY+42)*.45),끝(x+drift,endY). 폭2.2*(1-q/.82)+.35,RGBA112,91,66,alpha(1-q/.82)*.55 |
| 줄기 상면 | X-.65,폭.65,RGB176,151,108,alpha(1-q/.82)*.24. 분리 후 기존 방울·착지 파문 유지 |
| 자원·영향 | 기존 atlas에만 추가해6atlas+4membrane의39.0625MiB 상한 유지(나무 그림자 별도). 새파일/로드/파티클/충돌/피해/스폰 없음. 네이티브 canvas에서 최초 생성, GPU proxy에는 drawImage만 전달 |
| QA | 카메라13곳+COMBAT. TISSUE_DETAIL/COCOON_DETAIL/AUTHORED_POOL은 각각24프레임 GIF,측정한 캡처 간격으로 재생. 체력50ms보충 조건 유지. 촬영 후 보충 중단·부활불가 설정·_fallenResolve 직접 호출로 사망 UI 분리 검사 |

MAP PRODUCTION REPORT — 8차

STAGE: CH1-1 production. MASTER: 기존53점 silhouette,8regions,남북 main route,side spaces 보존. OUTER MASS: LEFT/RIGHT/TOP/SOUTH와 holes 보존. LARGE: 기존 sources/composites/overlap/repeated silhouette 유지. MEDIUM: 기존 연결부와 remaining holes 변경 없음. GROUND: 기존 피부막/오염/그림자/동맥 유지. PLAYABLE: arenas/travel/breathing/threat 공간·장애물·충돌 불변. LANDMARK: primary시체나무 유지,secondary고치·독액에 점액 목과 상승증기 추가,tertiary뿌리 유지. CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 및 상세5곳,contact board와 웅덩이/고치 원배율 화면 직접 확인. TECH QA: 20검사(효과12/geometry5/문법1/패키징2) PASS;mapUnchanged=true,errors/HTTP errors0,route/collision/chunk seam 보존.90RAF median33.3ms,p95 50ms(headless1280×720녹화중),native효과CPU p95약.1ms;대규모 전투 성능PASS 근거 아님. FILES: stage-owned효과/test/QA/본 문서,concurrent touched game캐시·맵디테일2행만,unrelated touched없음. GIT: 전용 부분커밋,코드+docs포함,push/deploy없음.

VISUAL VERDICT: RETOUCH — 기존 맵의 국소 습기·체액 움직임 추가는 확인. 전체 흙·식생과 생체 오브젝트의 재질 통합은 미완료. 새 원화 전체 적용이나 구덩이 벽 변형을 완료로 판정하지 않는다.

사망 재검수: 이번 현재 작업트리에서 deathReplayBtn 존재=true,_fallenResolve 이후 death 표시=true,error=null. 7차 사망오류는 이번 조건에서 재현되지 않았으며 이 작업이 사망 시스템을 수정한 것은 아니다. 자연 사망부터 리플레이·재시작까지의 전체 회귀 검수는 별도다.

확인: <http://localhost:3333/captures/ch1_living_detail_pass8_20260925/index.html>. before는 현재게임에7차 효과를 연결한 비교. NEXT PASS: 전체 재질 통합과 동측 독액 POI의 평면적인 원형 마커 접합 검토. 원본·충돌 유지, 위험범위 가독성을 먼저 검증할 것.

## 9차: 동측 독구덩이 안쪽 깊이 (2026-09-26)

| id | 구현 계약 / 정확한 수치 |
|---|---|
| 범위 | `Ch1LivingDetail.pit`, enabled(stage0,!bossArena,!fieldRebuildQA)이며 pit_poison 월드(6500,5580)만 true. 그 외 false. default sprite 분기 전에 호출, true면 기존 sprite 중복 렌더 제외. API 없으면 원본 폴백 |
| atlas | 1024² RGBA1장,4×4셀256²,16프레임,4MiB추가. 기존39.0625MiB+4=43.0625MiB(나무 그림자 별도). 최초 사용 시 native canvas 생성. GPU proxy에는 drawImage만 전달 |
| 좌표·크기 | 각셀 중심(128,128),clip(-128,-128,256,256). 실제 draw 크기(meta.sz 또는200)*scale,원점(o.x-sz/2,o.y-sz/2),좌표/충돌/개수 불변 |
| contour | n=0..96,t=n/96*2π,r=1+.035sin(5t)+.025cos(9t),squeeze=sin(phase-2t)*inset. px=cos(t)*(rx*r+squeeze),py=cy+sin(t)*(ry*r+squeeze*.6). phase=f/16*2π |
| 접촉 그림자 | scaleY.7,radial중심(0,15),반경65alpha.7→124alpha0,RGB12,10,11 |
| 외측 턱 | contour(106,80,9,1.6),fill#38372c,strokeRGBA148,128,96,.18,폭2 |
| 안쪽 벽 | contour(97,71,9,1.6),linearY-65→78,stops0 #100f11 / .55 #26231d / 1 #69604a |
| 벽 미세 재질 | 280점,x=sin(j*12.989)*103,y=9+cos(j*7.31)*76,2×(1+j%4). 홀수RGBA120,109,82,.2,짝수RGBA8,10,8,.3. 시간 고정 |
| 벽 균열 | 안쪽 벽 clip안19개,t=j/19*2π,시작(cos(t)*98,9+sin(t)*72),끝(px*.88,py+19),RGBA10,9,10,.5,폭2+j%3 |
| 낮은 독액 | contour(86,48,23,2),linearY-25→73,stops0 #1b2416 / .5 #45522a / 1 #788052. 벽과 독액 모두 clip해 가장자리 밖 유출 방지 |
| 침전물 | 32개,px=sin(j*12.989)*81,py=23+cos(j*7.31)*43,타원반경(3+j%5,1+j%3),회전.2. 홀수RGBA16,24,14,.24 / 짝수147,151,90,.19 |
| 수면 흐름 | 3개,p=(f/16+j/3)%1,중심((j-1)*24,22+sin(j)*14),반경(8+p*28,3+p*10),회전-.1,호.4→5.3,RGB176,173,110,alpha(1-p)*.24,폭1.3 |
| 앞턱 가림(9차/현행 미로드 폴백;재질로드는26차) | j=0..48,t=j/48*π,rx=99+sin(phase-2t)*1.6,px=cos(t)*rx,py=9+sin(t)*73. RGBA36,28,26,.9 폭4;상면Y-2,RGBA143,125,91,.3 폭1.6. 수면보다 뒤에 그려 전경 턱 표현 |
| 재생 | fract((now*.00095+x*.017+y*.011)/(2π))*16. 현재/다음프레임alpha(1-mix)/mix,기존6.614초 주기. 함수 전후 context state 보존 |
| 구분 | 절차식 작은 pit의 깊이·국소 변형 구현. 뒤쪽 큰 m_c1gtoxicf 그림의 수직벽 분리·변형이나 전체 맵 높이/지형 변경은 아님. 기존 증기/기포/지면 층 유지 |

MAP PRODUCTION REPORT — 9차

STAGE: CH1-1 production. MASTER: 53점 silhouette/8regions/main route남북/side spaces보존. OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes보존. LARGE: 원본source assets/composites/overlap/repeated silhouette보존. MEDIUM: 동측 독액 POI의 평면 원형 표현 교체,대형 원화 접합 잔여. GROUND: 국소 contact shadow·탁한 독액·지면 턱 연결;기존 contamination/동맥 유지. PLAYABLE: main arenas/travel/breathing/threat공간과 충돌 보존,녹색 독액과 어두운 경계 식별 유지. LANDMARK: primary시체나무/tertiary뿌리보존,secondary동측 독구덩이 깊이 보강. CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세5곳,POOL_DETAIL 움직임GIF 추가. TECH QA: 21검사(효과13/geometry5/문법1/패키징2);route/collision/chunk seam원본불변,브라우저검수 결과 아래 기록. FILES: stage-owned효과/test/QA/본 문서;concurrent touched game전용hook·캐시/맵디테일2행/4개문서추가계약;unrelated touched없음. GIT: 코드+docs전용부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 국소 구덩이 깊이 보강. 전체 지면/대형 독액 원화와의 재질 통합 및 대규모 전투 최종 검수는 남음. NEXT PASS: 서로 다른 원화의 접합을 큰 재질 단위로 정리하되 넓은 공터·기존 배치 유지.

9차 최종 QA: 최초 화면의 매끈한 그릇형 테두리를 확인하여 외측 명암/앞턱 폭을 낮추고 벽 미세 재질을 추가한 뒤 재촬영. POOL_DETAIL과 전체 camera-board 직접 확인. before/after 각13곳+COMBAT,오류/HTTP오류0,mapUnchanged=true. 재촬영90RAF median16.7ms,p95 49.9ms(1280×720 headless녹화중);성능등급 확정 아님. 실제 WASD/LMB/Q 입력,체력50ms보충 조건. 사망 UI 직접 호출buttonPresent/shown=true,error=null. 21검사 PASS. 뒤쪽 포토 재질과 절차식 구덩이의 스타일 차이가 남아 RETOUCH 유지.

확인 페이지: <http://localhost:3333/captures/ch1_living_detail_pass9_20260926/index.html>. 변경 전은 현재게임에8차효과를 라우팅한 비교다. 기존 원본 pit_poison.png와 대형 웅덩이 에셋 보존.

## 10차: 분리되어 보이는 촉수의 유착 고정 (2026-09-26)

사용자 지적: “촉수들은 붙어있어야할텐데 왜 나눠졌다가 흩어졌다가 그러지 지렁이 3마리같이”. 5차의 분산 시작점과 서로 다른 굽힘,동맥 경로와 독립 좌표로 그린 작은 가지 때문에 붙어 있는 조직보다 독립 생물처럼 읽혔다. 해당 표현은 승인된 완성형이 아니며 아래 계약으로 대체한다. 5/6차 수치는 당시 이력이다.

| 대상 | 현재 계약 |
|---|---|
| 시작부 | 모든 갈래 sx=0,sy=14(local),시간/갈래에 따른 위치 분산 제거. 앵커 월드좌표·고정angle 유지 |
| 굽힘 | bend=sin(phase-j*.8)*7. ny=v³*sy+3*v²*u*(ey*.1)+3*v*u²*(ey*.95)+u³*ey+bend*sin(πu)². 양끝 굽힘0,중간만 움직임. 이전 cubic 제어점±22 변형 폐기 |
| 시작 두께 | emerge=.7+.3*sin(min(1,u/.14)*π/2). 기존0 시작 대신 .7로 연결 폭 유지. 압력파/리본 명암/끝 감쇠는 기존 유지 |
| 작은 가지 | 시작점을 ex*.58,ey*.6에서 실제 동맥 표본points[19]의 x/y로 변경. parent 변형을 그대로 따라 분리 틈 방지. 제어/끝 좌표는 기존 유지 |
| 고정 유착부 | 모든 갈래 렌더 후 translate(0,14),scale(1,.42),radial반경2→23. stop0 dryRGBA83,47,53,.95 / wet64,60,37,.95; .55 dry81,50,57,.75 / wet66,59,40,.75; 1 RGBA63,40,46,0. 영역(-23,-23,46,46). 고정 피부 이음새로 시작부 연결 |
| 유지 | 길11곳·기존tree/cocoon/pool등 앵커·16프레임·주기6.614초·pressure9·들림7px·기포/증기/나무/구덩이 유지. 시작/끝 좌표는 고정,중간 형태·굵기만 변화. geometry/collision/배치/게임플레이 무변경 |
| 자원 | 기존 native atlas내에 합성,추가 atlas/메모리 없음. 런타임drawImage 및 culling 계약 유지 |

MAP PRODUCTION REPORT — 10차

STAGE CH1-1. MASTER silhouette/regions/남북main route/side spaces유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/holes유지. LARGE source/composites/overlap/repeated silhouette유지. MEDIUM 촉수 갈래 연결 수정,대형 접합 잔여. GROUND 그림자/오염 유지,고정 피부 유착부 추가. PLAYABLE arenas/travel/breathing/threat 공간 유지,독립 생물처럼 보이는 바닥 움직임 완화. LANDMARK primary/secondary/tertiary보존. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세5곳,동맥 확대GIF. TECH QA 기존21검사,geometry/collision/chunk seam보존,브라우저 결과 아래 기록. FILES stage-owned효과/QA/본 문서,concurrent touched game캐시·맵디테일2행,unrelated없음. GIT 코드+docs전용부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 사용자 지적한 분리된 촉수 표현 수정. 전체 맵 재질 통합은 남아 있음. NEXT PASS: 고정 유착부와 주변 원화의 재질 접합 검토.

10차 검수: TISSUE_DETAIL 원배율 화면에서 갈래의 공통 유착부 확인.13카메라+COMBAT 촬영,실제 입력WASD/LMB/Q,체력50ms보충 조건. 오류/HTTP오류0,21검사PASS. 동맥24프레임GIF와 전후 캡처: <http://localhost:3333/captures/ch1_living_detail_pass10_20260926/index.html>. 비교의 이전 화면은9차 당시캡처이며 현재 전체코드 동일시점 A/B는 아니다. 런타임 원본은 after/runtime.json에 보존.

## 11차: 오른쪽 아래 독액 지대 접합 (2026-09-26)

작업 위치는 사용자의 두 번째 스크린샷 `스크린샷 2026-09-26 042826.png`에 해당한다. 오른쪽 위 m_c1pool(167,43)과 혼동하지 않는다. 동측 pit_poison(162,139),월드(6500,5580)만 기존9차 atlas 내에서 수정하며 뒤쪽 큰 m_c1gtoxicf의 원본은 보존한다.

| id | 현행 값 / 변경 |
|---|---|
| 불규칙 경계 | contour의 r=1+.06*sin(5t)+.035*cos(9t). 기존9차 .035/.025 계수 대체. 나머지 rx/ry/cy와 수축 범위 유지 |
| 젖은 지면 연결 | 외측 턱 이전9곳. j=0..8,t=j/9*2π,중심(cos(t)*99,9+sin(t)*73),회전t,scaleY.55. radial반경3→24,RGB36,36,24 alpha.58→0,48² 영역. 같은 위치의 고정 오염으로 경계 분절 |
| 유입 자국 | j=0,1. 시작(-27,-69)/(34,-57),끝(-17,-6)/(22,2). cubic제어(sx-9,sy+19),(ex+8,ey-23),시작·끝 고정 |
| 자국 깊이 | RGB14,20,14 alpha.82 폭8-j*2;내측 RGB95,108,58 alpha.48 폭3-j*.5 |
| 습윤 상면 | X-1,폭1,RGB161,159,99,alpha=.14+.07*sin(phase-j),범위.07~.21. 기존6.614초 주기. 자국의 위치는 움직이지 않음 |
| 렌더 순서 | contact shadow→젖은 지면→외측 턱→안쪽 벽/침전물/수면→유입 자국→앞턱. 기존256²셀/16프레임/pitAtlas4MiB 재사용,추가 atlas없음 |
| 보존 | 10차 촉수 고정 유착부·중간 맥동 유지. 배치/geometry/collision/크기/물리/피해/맵 데이터/대형 원본 불변 |

MAP PRODUCTION REPORT — 11차

STAGE CH1-1. MASTER silhouette/8regions/main route남북/side spaces보존. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes유지. LARGE source/composites/overlap/repeated silhouette보존. MEDIUM 동측 큰독액과 작은구덩이 사이 시각연결 보강,대형 재질접합 잔여. GROUND 접촉그림자 유지·젖은흙9곳·유입자국2개. PLAYABLE arenas/travel/breathing/threat공간 보존,새장애물0. LANDMARK primary시체나무/tertiary뿌리 유지,secondary오른쪽아래독액만 수정. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세5곳,POOL_DETAIL 확대. TECH QA21검사(효과13/geometry5/문법1/패키징2),route/collision/chunk seam보존,브라우저 결과 아래기록. FILES stage-owned효과/QA/본 문서,concurrent touched game캐시·맵디테일2행,unrelated없음. GIT 코드+docs전용부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 오른쪽 아래 국소 접합 보강. 전체 생체지옥 재질 완성 판정은 아님. NEXT PASS: 지면과 구조물의 큰 재질 차이 개선,넓은 전투공간 유지.

11차 최종 검수: POOL_DETAIL과camera-board 직접 확인.13카메라+COMBAT,errors/HTTPerrors0,mapUnchanged=true,사망UI직접호출error=null. 실제 WASD/LMB/Q입력,체력50ms보충 조건.90RAF median16.7ms,p95 33.4ms(headless1280×720녹화중);대규모 전투 성능통과 판정 아님.21검사PASS. 원본기록 after/runtime.json,확인 페이지 <http://localhost:3333/captures/ch1_living_detail_pass11_20260926/index.html>. 이전비교는10차 당시캡처. 큰독액과작은구덩이의 재질차이는 잔여RETOUCH.

## 13차 제작 이력: 화로의 시체 손 관절 동작 (2026-09-26)

사용자 “그냥 흐물거리네”, “손이 움직여야지” 교정. 원인은 12차 camp 변형 영역이 실제 세 손보다 가시와 힘줄에 걸쳐 있었기 때문이다. **m_c1camp의 3구역 수평 출렁임을 제거하고 손 3개만 관절 변형한다.** 나무는 12차 유지. 아래 12차의 camp 영역·규격·메모리 설명은 제작 이력이며 13차 당시에는 본 절의 계약이 우선하며 현행 관절식은14차를 따른다. 원본 PNG는 변경하지 않는다.

| id / 적용 | 현행 값·공식 |
|---|---|
| 진입 | 기존 organic의 stage0,!bossArena,!fieldRebuildQA,loaded/meta/srcRect 가드 이후 campHands로 분기. 렌더 콜리전/배치/외부 API 변화 없음 |
| 기준 좌표 | 기존 prop_camp.png 880×663. campHandRigs의 wrist/axis/outline은 이 좌표계. 원본max변880,확대금지;ratio=min(1,880/max(iw,ih)),w/h=round(iw/ih*ratio),sx=w/880,sy=h/663 |
| 왼손 | wrist(452,504),axis(-19,12),sign=-1. outline[(458,495),(461,509),(448,515),(440,532),(428,541),(413,540),(410,526),(414,513),(427,504),(442,501)] |
| 오른손 | wrist(591,541),axis(8,18),sign=1. outline[(581,536),(600,535),(608,545),(622,557),(626,574),(616,587),(596,588),(578,575),(576,556)] |
| 위쪽 손 | wrist(580,420),axis(12,-17),sign=-1. outline[(569,422),(575,403),(578,383),(601,378),(622,385),(620,405),(617,424),(589,431),(579,427)] |
| 분리 | minX/Y=outline최소-18,pw/ph=ceil(outline최대-min+18). source캔버스에 outline clip 후 원본 draw. 정적body에서는 같은 outline을 destination-out으로 제거,원래 손과 움직이는 손이 중복되지 않음. 생성 중 source/mesh는 임시 |
| 실제 규격 | body880×663. 왼손 patch(minX392,minY477,pw87,ph82),오른손(558,517,86,89),위쪽(551,360,89,89). 각24포즈6×4atlas+patch크기blendcanvas. camp 캐시4.391345977783203MiB RGBA |
| 손목 좌표계 | axis길이len,ux=axisX/len,uy=axisY/len. dx=x+minX-wristX,dy=y+minY-wristY;u=dx*ux+dy*uy,v=-dx*uy+dy*ux. u<=0은 손목 고정,forearm은 원본 그대로 |
| 관절 | grip0~1,angle=sign*grip*(.65+v*.006),distal=angle+sign*grip*.5. u<=14는 palm 좌표(u,v) 유지. u>14:first=min(11,u-14),last=max(0,u-25),rot=u>25?distal:angle;pu=14+cos(angle)*first+cos(distal)*last-sin(rot)*v,pv=sin(angle)*first+sin(distal)*last+cos(rot)*v |
| 손목 회전 | wristAngle=sign*grip*.18*clamp(u/10,0,1). (pu,pv)를 wristAngle로 회전한 (ru,rv)를 원축으로 복귀: x=wristX+ru*ux-rv*uy-minX,y=wristY+ru*uy+rv*ux-minY. 손바닥·첫마디·끝마디가 별도 각도로 굽음 |
| 베이크 | 각frame0..23의grip=frame/23.6px격자의quad를(0,1,2)/(0,2,3) 두 triangle로 나누고 원본→pose의 affine변환을clip내drawImage로 적용. triangle중심에서각vertex로 .35px clip확장하여 안티앨리어싱 틈 완화 |
| affine | p,q,r→d,e,f;ax=qX-pX,ay=qY-pY,bx=rX-pX,by=rY-pY,det=ax*by-ay*bx. A=((eX-dX)*by-(fX-dX)*ay)/det,B=((eY-dY)*by-(fY-dY)*ay)/det,C=((fX-dX)*ax-(eX-dX)*bx)/det,D=((fY-dY)*ax-(eY-dY)*bx)/det;transform(A,B,C,D,dX-A*pX-C*pY,dY-B*pX-D*pY) |
| 동작 | p=fract(now/5200+index*.27),ease(t)=t²*(3-2t). p<.18:0, .18~.4:ease((p-.18)/.22), .4~.57:1, .57~.84:1-ease((p-.57)/.27), .84~1:0. 5.2초 주기,펴기→움켜쥐기→유지→이완,세 손 시간차 |
| 재생 | key=round(grip*92),sample=key/4,frame=floor(sample),next=min(23,frame+1),mix=sample-frame.93보간상태. key변경 시 source-over alpha1-mix+lighter alpha mix,reset alpha1/source-over,_glVer++. 손별patch만 갱신 |
| draw | size=(meta.sz또는400)*scale,ar=w/h,dw=size*min(1,ar),dh=size*min(1,1/ar),dx=o.x-dw/2,dy=o.y-dh/2. body1회,손3회. 손 draw(dx+minX/880*dw,dy+minY/663*dh,pw/880*dw,ph/663*dh) |
| 전체 비용 | 기존43.0625+tree12.7149658203125+raisedShadow1.5625+camp4.391345977783203=61.7313117980957MiB native캐시. 기존나무그림자/임시생성canvas/GPU복제별도. 최초손atlas베이크는 동기 실행 비용 존재 |
| 검사 | 실제 원본 손가락3영역의포즈차이,forearm/가시/상자의정지 비교 추가. 이 검사는12차에서실패→13차PASS. 총24검사(효과16/geometry5/문법1/패키징2). QA --camp-only 추가,현재13차 after/와12차라우팅 before/지원 |

MAP PRODUCTION REPORT — 13차

STAGE CH1-1. MASTER silhouette/8regions/남북main route/side spaces 유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes 유지. LARGE sourceassets/composites/overlap/repeated silhouette 유지. MEDIUM 화로의 손목 연결 보존,큰 재질접합 잔여. GROUND 기존 shadow/contamination/structure integration 유지. PLAYABLE main arenas/travel/breathing/threat공간과 충돌 유지,움직임은 야영지 손3개. LANDMARK primary나무 유지,secondary야영지 손동작 교정,tertiary 유지. CAMERA QA 이번에는CAMP_DETAIL와COMBAT,START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체 재촬영은 하지 않음(12차 자료). TECH QA route/collision24검사,배경 로딩대기,브라우저오류·성능은 아래최종검수기록. FILES stage-owned효과/test/QA/본 문서;concurrent touched game캐시/맵디테일2행/에셋목록/production문서/CHANGELOG의해당계약;unrelated없음. GIT 코드+docs부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 손 관절 동작으로 대상 교정. 전체맵 재질·성능 완성 판정은 아님. NEXT PASS: 손 동작 실제배율 가시성,지면/대형구조물 접합.

## 12차 제작 이력: 야영지 힘줄·화로와 대왕나무 뿌리 (2026-09-26)

최종 검수 보충(아래 최초 검수 이후): 보간 갱신 빈도만 낮춘 중간 검사에서 tree median33.4/p95 83.4ms,camp33.3/50ms로 나무 지연이 남아, 최종적으로 정적 몸체와 동적 patch를 분리했다. 최종 규격은 아래 표를 따른다. `--motion-only` TREE/CAMP/COCOON+COMBAT 최종 결과 errors/HTTPerrors0,mapUnchanged=true,사망UI직접호출error=null. 각60RAF tree median33.3/p95 33.4ms,camp33.3/66.6ms;COMBAT90RAF33.3/50ms(headless1280×720녹화중). 적상태·녹화부하가 다른 짧은 표본이며 야영지p95는 악화되어 전체 성능 PASS로 보고하지 않는다. 최종 코드23검사PASS, TREE/CAMP 최종 원배율 이미지 직접 확인. QA는 visibleIds가 비어있지 않고 전부 drawnIds에 포함될 때까지 최대30000ms 대기하여 배경chunk 로딩 전 캡처를 방지한다. 최종 캡처는 motion-optimized/에 보존. 배경에 구워진 뿌리는 정적이며 이번 변형은 m_c1tree 원본 안의 뿌리다. 다음 잔여 작업은 배경 뿌리 움직임·대형 재질 접합·야영지 지연이다. 동기화 추가파일: 맵오브젝트_에셋목록.md,CH1_1_PRODUCTION_FINISH_20260916.md,docs/CHANGELOG_SYNC.md. 확인 페이지 <http://localhost:3333/captures/ch1_living_detail_pass12_20260926/index.html>.

사용자 `스크린샷 2026-09-26 141253.png`는 `m_c1camp` 원본 오른쪽 아래의 뼈·힘줄 화로다. 이번 작업은 고치/독낭 그림자 보강에 더해 해당 야영지와 대왕나무의 기존 그림 안에 국소 움직임을 넣는다. 모든 맵 오브젝트 애니메이션을 완료했다고 해석하지 않는다.

| id / 적용 | 현재 계약 |
|---|---|
| organic | `Ch1LivingDetail.organic(c,g,o,now,meta,img)`. enabled(stage0,!bossArena,!fieldRebuildQA),type m_c1tree/m_c1camp,로드된 이미지,meta존재,meta.srcRect없음일 때만 true. 그외 false→기존sprite폴백. game 기존sprite분기 내부에서 호출,기존 tone/alpha/나무 전체sway 계승 |
| 야영지 위치 | m_c1camp authored(45,100),scale1.55. 원본prop_camp.png의 화로·힘줄만 국소변형,상자/돌테두리/천막의 대부분은 변형영역 밖. 신규 이미지 생성 없음 |
| 나무 위치 | 기존m_c1tree runtime(102.5,90.5). hand크기계수.72,pivotY.72 유지. 몸통과 뿌리 연결부는 국소 변형 영역 밖,기존 전체나무 sway 유지 |
| 캐시 | type별WeakMap→이미지별atlas 및blendcanvas. 원본max변1024(tree)/512(camp),확대금지. w/h=round(원본w/h*min(1,max/max(iw,ih))).8프레임4×2atlas |
| 실제 규격 | tree원본1143×1400→full836×1024,동적patch(56,628,732,376),최종atlas2928×752. static+atlas+blend12.7149658203125MiB. camp원본880×663→full512×386,patch(13,92,389,196),최종atlas1556×392,static+atlas+blend3.3715362548828125MiB. 합16.086502075195312MiB RGBA. 생성 중 전체8프레임atlas는 임시,최종patch 복사후보존안함 |
| 국소장 공식 | 각지역(cx,cy,rx,ry,amp,offset). d=((u-cx)/rx)^2+((v-cy)/ry)^2. d<1만 shift+=(1-d)^2*sin(phase+v*9+offset)*amp*w. 경계에서 변위/기울기0,수평방향만 변형 |
| tree 지역3 | (.27,.79,.20,.17,.011,0),(.75,.80,.19,.17,.011,1.4),(.50,.89,.12,.085,.004,2.1). 좌우뿌리와아래조직,몸통 고정 |
| camp 지역3 | (.60,.64,.11,.09,.010,0),(.70,.37,.08,.12,.008,1.5),(.14,.43,.11,.13,.009,2.8). 화로위힘줄/오른쪽조직/왼쪽촉수 |
| 래스터 | 프레임phase=f/8*2π. 원본축소canvas복사 후 영역에 닿는4px행만 clear,가로32구간. source left=j*w/32,right=(j+1)*w/32,rh=min(4,h-y),v=(y+rh/2)/h;dest dl=left+shift(j/32,v),dr=right+shift((j+1)/32,v),폭dr-dl+.15. cellclip으로 atlas이웃침범 방지 |
| 동적 영역 절단 | x0=max(0,floor(min(cx-rx)*fullW)-2),x1=min(fullW,ceil(max(cx+rx)*fullW)+2). y0=max(0,floor(min(cy-ry)*fullH/4)*4-4),y1=min(fullH,ceil(max(cy+ry)*fullH/4)*4+4). pw=x1-x0,ph=y1-y0.8개patch를4×2atlas로복사하고staticBody의동일rect만clear. 매갱신업로드면적은tree원본32.15%,camp38.58% |
| 재생 | phase=fract((now*.0008+x*.017+y*.011)/(2π))*8,주기약7.854초. blendKey=floor(phase*16),sample=key/16,frame=floor(sample),next=(frame+1)%8,mix=sample-frame.128보간상태/주기(약61.36ms간격),느린변형의텍스처업로드빈도제한 |
| 불투명도 보존 | patch크기blendcanvas clear→source-over alpha1-mix 현재프레임→lighter alpha mix 다음프레임. native premultiplied 합성. key변경 시만 _glVer 증가;기존WebGL/WebGPU 동적canvas업로드·동일크기GPU텍스처재사용 계약 사용. 정적인 상자/몸통이 프레임보간 때문에 반투명해지지 않도록 테스트 |
| 실제 draw | sz=(meta.sz또는400)*scale,ar=fullW/fullH,dw=sz*min(1,ar)*factor,dh=sz*min(1,1/ar)*factor. hand tree factor.72,py.72;그외factor1,py.5.좌상(dx,dy)=(o.x-dw*.5,o.y-dh*py). staticBody전체1회+blendpatch1회. patch좌상(dx+x0/fullW*dw,dy+y0/fullH*dh),크기(pw/fullW*dw,ph/fullH*dh) |
| raised shadows | m_c1cocoon/m_c1spod만 별도이미지별WeakMap캐시640×320.2종총1.5625MiB. size=(meta.sz또는280)*scale,s=size/320,foot=o.y+feet[type]*scale;feet100/40.카메라반폭/높이+size밖스킵 |
| 투영 | native translate(260,32),transform(1,0,-.65,-.32,0,0),blur5.원본 또는meta.srcRect를(-160,-320,320,320)에투영. source-in linearY32→175,RGBA9,7,13 alpha.58/.26/0 @0/.6/1 |
| 밑동접촉 | source-over translate(260,32),scaleY.22,radial반경8→135,RGB9,6,12 alpha.42→0,270²영역.바닥접촉은실루엣그림자와 같은tex에합성 |
| 그림자 호흡 | wave=sin(now*.00105+x*.017+y*.011),pivot(o.x,foot),scale(1+wave*.018,1-wave*.012),alpha기존*.85,draw(-260*s,-32*s,640*s,320*s).밑동좌표고정.평평한pool에는추가하지않음 |
| 비용·보존 | 기존43.0625MiB+이번16.086502075195312+1.5625=60.71150207519531MiB native캐시(기존나무그림자/임시canvas/GPU복제별도). 최초atlas베이크비용과가시중동적blend업로드비용존재.고정배치/충돌/원본파일/다른stage/촉수공동유착불변 |
| QA | 기존13카메라+CAMP_DETAIL(46,104),TREE_DETAIL/CAMP_DETAIL 확대GIF·각60RAF표본추가. 총14카메라+COMBAT.체력50ms보충조건 유지.23검사(효과15/geometry5/문법1/패키징2) |

MAP PRODUCTION REPORT — 12차

STAGE CH1-1. MASTER silhouette/8regions/main route남북/side spaces보존. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes유지. LARGE sourceassets보존,composites/overlap/repeated silhouette동일. MEDIUM 나무/야영지의기존붙은조직만국소변형,대형접합잔여. GROUND 고치/독낭 투영·밑동그림자추가,오염유지. PLAYABLE arenas/travel/breathing/threat공간·충돌보존,상자/돌/몸통국소변형제외. LANDMARK primary대왕나무뿌리/secondary야영지힘줄 움직임,tertiary독낭그림자. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT+상세6곳. TECH QA23검사,route/collision/chunkseam보존,pageerror/404/loading/성능아래기록. FILES stage-owned효과/test/QA/본 문서,concurrent touched game캐시+spritehook/맵디테일2행,unrelated없음. GIT 코드+docs전용부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 지정된 생체 오브젝트의 국소 움직임 확대. 전체맵 재질·애니메이션완성은아님. NEXT PASS: 실제플레이배율의가시성과가시영역성능검수결과를기준으로움직임범위조정.

12차 최초 전후검수: 동일현재게임에11차효과를라우팅한before와12차초기after,각14카메라+COMBAT,errors/HTTPerrors0,mapUnchanged=true. TREE/CAMP/COCOON 원배율이미지 직접확인.23검사PASS. headless1280×720녹화중 각60RAF: tree before median33.3/p95 50.1ms→초기after33.4/83.3ms,camp33.3/50→33.3/50ms. 적상태·녹화부하가동일하지않아엄밀한성능비교는아니지만나무구간의지연증가를보아최종보간상태를256→128로조정. 초기30.68ms업로드주기를61.36ms로완화하고 `--motion-only`로TREE/CAMP/COCOON+COMBAT를재검수한다. 메모리규격/위치/변형범위는동일. 최초전체검수는after/,최종대상검수는motion-optimized/에분리보존.


13차 최종 검수: 현재 게임에12차모듈을라우팅한before/13차after 각각CAMP_DETAIL+COMBAT,errors/HTTPerrors0,mapUnchanged=true. 양쪽camp60RAF median16.7/p95 33.4ms,COMBAT90RAF16.7/33.4ms. headless1280×720녹화·체력50ms보충 조건,전체 대규모전투 성능검증 아님. after 사망UI 직접호출error=null. 24검사PASS. 원배율CAMP_DETAIL 및 확대 손포즈2장 직접확인. 확인페이지 pageerror0: <http://localhost:3333/captures/ch1_living_detail_pass13_20260926/index.html>. 확대canvas는 현행 모듈·동일 원본을 직접 재생하며 실제게임 전후GIF/녹화영상도 함께 제공. QA 산출물은ignored captures/에 보관.


## 14차 제작 이력: 손가락 순차 접힘과 관절 연결 보강 (2026-09-27)

13차의 손목·마스크·크기·포즈수·시간표·메모리 계약을 유지한다. 아래 관절식은13차의 관절 행을 대체한다. 기존 식은 u=14/25 경계에서 v방향의 회전값이 갑자기 바뀌었으므로 연속된 가중치로 연결한다.

| 항목 | 현행 수치/공식 |
|---|---|
| smooth | t=clamp(t,0,1),smooth(t)=t²*(3-2t) |
| 손가락별 지연 | delay=min(.28,abs(v)*.012),finger=smooth((grip-delay)/(1-delay)),tip=smooth((finger-.15)/.85). 가운데 손가락→양옆,첫마디→끝마디 순으로 접힘 |
| 관절각 | angle=sign*finger*(.65+v*.006),distal=sign*tip*.5,joint=angle*smooth((u-10)/8),end=distal*smooth((u-22)/6). 첫관절 전이 u10~18,끝관절 전이 u22~28 |
| 첫관절 좌표 | pu=14+(u-14)*cos(joint)-v*sin(joint),pv=(u-14)*sin(joint)+v*cos(joint) |
| 끝관절 좌표 | jx=14+11*cos(joint),jy=11*sin(joint),ex=pu-jx,ey=pv-jy;pu=jx+ex*cos(end)-ey*sin(end),pv=jy+ex*sin(end)+ey*cos(end). 이후13차 wristAngle/원축변환 유지. u<=0변위0 |
| 베이크 최적화 | source getImageData1회,6px격자quad의주변1px까지 알파를 검사. py=max(0,y-1)..min(ph,y+7)미만,px=max(0,x-1)..min(pw,x+7)미만에서alpha>0인셀만mesh에저장.24포즈가 같은mesh재사용,투명셀 triangle생략. .35px clip확장/원본마스크 유지 |
| 보존 | 화로/팔/손목 연결·맵좌표·콜리전·전투·나무·다른stage 불변. 추가지속캐시없음,mesh/pixels는생성중임시. native캐시61.7313117980957MiB 그대로 |
| 검증 | 기존24검사PASS. 효과실제원본손검사 Node 실행 표본410.8→124.1ms(베이크 포함 전체테스트시간,엄밀벤치마크 아님). 실제 게임검수는14차 after/runtime.json |

MAP PRODUCTION REPORT — 14차

STAGE CH1-1. MASTER silhouette/regions/main route/side spaces 유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes 유지. LARGE sourceassets/composites/overlap/repeated silhouette 유지. MEDIUM 손관절 연결만 연속화,큰 재질접합 잔여. GROUND shadow/contamination/structure integration 유지. PLAYABLE arenas/travel/breathing/threat/combat공간 불변. LANDMARK primary나무/tertiary 유지,secondary야영지 손동작 보강. CAMERA QA CAMP_DETAIL+COMBAT,START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT는이전검수자료 유지. TECH QA24검사,route/collision불변,visible chunk 로딩대기,오류/성능 아래최종결과. FILES stage-owned효과/QA/본 문서,concurrent touched game캐시·맵디테일2행·에셋목록·production·CHANGELOG해당내용,unrelated없음. GIT 코드+docs전용커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 손 연결·접힘 순서 보강,전체맵 완성 판정 아님. NEXT PASS: 맵의 큰 재질접합과 생체 구조물 가시성.


14차 최종 검수: CAMP_DETAIL+COMBAT,errors/HTTPerrors=0/0,mapUnchanged=True. camp60RAF median33.3/p95 33.4ms,COMBAT90RAF33.3/33.4ms. headless1280×720녹화·체력50ms보충. 사망UI직접호출error=None. 24검사PASS. 확대포즈2장/실제게임CAMP_DETAIL 검수,확인페이지pageerror=0. 전체전투 성능 판정 아님. 확인페이지 <http://localhost:3333/captures/ch1_living_detail_pass14_20260927/index.html>.


## 15차 제작 이력: 대왕나무 외측 뿌리 굽힘 (2026-09-27)

12차 tree의3구역 수평변형/4px행 stretch는 폐기한다. 기존 원본 안에서 바깥으로 뻗은 뿌리2축을 따라 회전량을 늘려 끝이 들렸다 내려오게 한다. 다른 레이어에 구워진 배경 뿌리는 이번 대상이 아니다. 손14차 유지.

| 항목 | 현행 수치·공식 |
|---|---|
| roots | 정규화원본좌표(ax,ay,tx,ty,radius,angle,offset). 좌(.38,.67,.09,.795,.047,.085,0),우(.65,.70,.91,.81,.045,-.075,2.1). 원본max변1024/축소full836×1024 유지 |
| 축 좌표 | vx=tx-ax,vy=ty-ay,length2=vx²+vy²,rx=px/w-ax,ry=py/h-ay. u=(rx*vx+ry*vy)/length2,d=abs(rx*vy-ry*vx)/sqrt(length2)/radius |
| 고정·감쇠 | u<=.15 또는 u>=1.25 또는 d>=1이면변위0. smooth(t)=clamp(t,0,1)²*(3-2*clamp(t,0,1)). weight=smooth((u-.15)/.85)*(1-d²)²*(1-smooth((u-1.05)/.2)). 몸통쪽15% 고정,옆경계와끝범위에서연속감쇠 |
| 들기 | lift=(.5+.5*sin(phase-u*.75+offset))²,theta=angle*lift*weight. bx=px-ax*w,by=py-ay*h. dx+=bx*(cos(theta)-1)-by*sin(theta),dy+=bx*sin(theta)+by*(cos(theta)-1). pose=(px+dx,py+dy). 좌우시간차·길이방향지연 |
| 래스터 | source전체복사→patch영역clear→16px격자quad두triangle(0,1,2)/(0,2,3). 네 꼭짓점 변위가 모두0이면원본셀drawImage1회,그외13차와동일affine/중심방향.35px확장clip. phase=f/8*2π,8프레임4×2 유지 |
| patch | x0=0,y0=floor(.60*h),x1=w,y1=min(h,ceil(.90*h)+16). 실제(0,614,836,324),atlas3344×648. source동일rect제거→staticBody전체+동적patchdraw. 기존128보간상태/약7.854초/_glVer/culling외부계약 유지 |
| 비용 | tree static+atlas+blend12.56500244140625MiB. 기존43.0625+tree12.56500244140625+raised1.5625+camp4.391345977783203=61.58134841918945MiB native캐시. tree포함추가18.518848419189453MiB. 임시/GPU복제/기존나무shadow별도 |
| 검증 | 실제끝을나타내는밝은표식의Y중심이5시점에서4px초과이동하며고정몸통표식이보존되는검사추가.14차실패→15차PASS.25검사(효과17/geometry5/문법1/패키징2). QA --tree-only 추가,before는14차모듈 |
| 보존 | 원본에셋/배치/크기/pivot/남북동선/충돌/전투규칙/다른stage/손동작 불변 |

MAP PRODUCTION REPORT — 15차

STAGE CH1-1. MASTER silhouette/regions/main route/side spaces 유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes 유지. LARGE sourceassets/composites/overlap/repeated silhouette 유지. MEDIUM 나무뿌리 연결부 고정,큰 재질접합 잔여. GROUND shadow/contamination 유지,원본뿌리 끝의 국소들기. PLAYABLE arenas/travel/breathing/threat/combat공간 유지. LANDMARK primary대왕나무 외측뿌리2개 굽힘,secondary/tertiary 유지. CAMERA QA TREE_DETAIL+COMBAT,START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT전체는이전자료. TECH QA25검사,route/collision불변,로딩·오류·성능최종기록아래. FILES stage-owned효과/test/QA/본 문서,concurrent touched game캐시·맵디테일2행·에셋목록·production·CHANGELOG부분,unrelated없음. GIT 코드+docs부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 나무원본의뿌리 동작 보강. 전체배경뿌리 애니메이션/재질완성은아님. NEXT PASS: 큰 재질접합과 배경에 구워진 뿌리의 분리 검토.


15차 최종 검수: TREE_DETAIL+COMBAT,errors/HTTPerrors=0/0,mapUnchanged=True. tree60RAF median33.3/p95 50.0ms,COMBAT90RAF33.3/50.0ms. headless1280×720녹화·체력50ms보충. 사망UI직접호출error=None.25검사PASS. 확대포즈2장과실제TREE_DETAIL 검수,확인페이지pageerror=0. 전체전투 성능검증 아님. 확인페이지 <http://localhost:3333/captures/ch1_living_detail_pass15_20260927/index.html>. 이전비교GIF는동일뿌리효과였던12차최종검수영상.


## 16차 제작 이력: 나무에 매달린 고치와 시체 (2026-09-27)

사용자 “바뀐지 잘 모르겠다”에 따라 원배율에서 윤곽 이동이 읽히는 매달린 물체를 추가한다. 나무 원본 안의 고치3개·왼쪽시체1개를 코드 마스크로 분리하며 원본 PNG는 보존한다. 오른쪽 시체와 상단 작은 고치는 이번에 분리하지 않는다. 손14차/뿌리15차 유지.

| id | anchor(원본1143×1400) | amp(rad) | speed(rad/ms) | phase | 실제crop(x,y,w,h) | outline |
|---|---|---|---|---|---|---|
| 좌상고치 | [222, 424] | 0.1 | 0.00135 | 0.0 | (135, 308, 64, 113) | [[217, 424], [227, 424], [239, 455], [263, 485], [268, 532], [250, 562], [224, 572], [192, 546], [188, 510], [202, 470], [214, 447]] |
| 좌하작은고치 | [303, 608] | 0.13 | 0.00165 | 1.8 | (197, 442, 54, 138) | [[298, 608], [308, 608], [314, 641], [340, 673], [340, 726], [325, 766], [311, 790], [295, 766], [277, 718], [273, 681], [292, 640]] |
| 좌측시체 | [140, 609] | 0.085 | 0.0011 | 3.1 | (73, 443, 65, 200) | [[134, 609], [146, 609], [150, 624], [170, 642], [183, 685], [185, 758], [174, 824], [156, 862], [139, 876], [126, 834], [106, 803], [103, 698], [106, 654], [120, 627]] |
| 우측큰고치 | [1005, 430] | 0.11 | 0.00145 | 4.4 | (695, 312, 85, 232) | [[998, 430], [1010, 430], [1015, 470], [1036, 494], [1053, 518], [1063, 564], [1059, 650], [1043, 680], [1038, 706], [1025, 728], [1001, 740], [987, 727], [982, 691], [971, 666], [960, 633], [953, 568], [958, 523], [979, 486], [990, 453]] |

| 항목 | 현행 계약 |
|---|---|
| treeHangers | source축소836×1024기준sx=width/1143,sy=height/1400. organic tree캐시 생성시 실행. stage/load/srcRect 가드는기존계승 |
| 추출 | x0/y0=max(0,floor(outline최소*sx/sy)-2),x1/y1=min(source크기,ceil(outline최대*sx/sy)+2). tex크기차이. 원본에서 outline clip→tex복사,source동일outline destination-out. 그후 기존뿌리atlas베이크. source/staticBody에는 원래매달린물체가중복되지않음 |
| 회전 | angle=sin(now*speed+phase)*amp. source축척pivot(ax,ay)=anchor*(sx,sy);worldpivot=(dx+ax/fullW*dw,dy+ay/fullH*dh). save→translate(pivot)→rotate(angle)→draw(tex,(x0-ax)/fullW*dw,(y0-ay)/fullH*dh,tex.width/fullW*dw,tex.height/fullH*dh)→restore |
| 순서 | 기존staticBody→rootpatch→매달린4개. 매듭좌표고정,물체길이·형태는rigid회전으로유지. 기존전체나무sway계승. 추가텍스처는정적이며 매프레임GPU업로드없음,draw4회추가 |
| 메모리 | hanging추가0.1808319091796875MiB,기존61.58134841918945+추가=61.76218032836914MiB native캐시. GPU복제/임시/기존나무shadow별도. 기존나무바닥투영그림자는정적캐시유지 |
| QA | HANGING_DETAIL tile(102,82)추가,전체카메라15개. --tree-only는TREE_DETAIL+HANGING_DETAIL,--hanging-only는HANGING_DETAIL. 해당GIF clip(100,100,1050,480),24프레임/250ms대기+실측간격. 기존상세clip유지. before=15차모듈라우팅. 총26검사(효과18/geometry5/문법1/패키징2) |
| 보존 | 나무원본·콜리전·동선·크기·pivot·나머지stage 불변. 매달린물체 윤곽이빈공간을가로지르지만플레이충돌추가없음 |

MAP PRODUCTION REPORT — 16차

STAGE CH1-1. MASTER silhouette/regions/main route/side spaces유지. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes유지. LARGE sourceassets/composites/overlap/repeated silhouette유지. MEDIUM 매달린연결부고정,대형재질접합잔여. GROUND shadow/contamination/접지유지. PLAYABLE arenas/travel/breathing/threat/combat공간보존. LANDMARK primary나무의매달린4개동작,secondary/tertiary유지. CAMERA QA TREE_DETAIL/HANGING_DETAIL+COMBAT,기본START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT는이전자료. TECH QA26검사,route/collision불변,오류/로딩/성능아래최종기록. FILES stage-owned효과/test/QA/본 문서,concurrent touched game캐시·맵디테일2행·에셋목록·production·CHANGELOG부분,unrelated없음. GIT 코드+docs부분커밋,push/deploy없음.

VISUAL VERDICT: RETOUCH — 원배율 윤곽 움직임 보강. 모든 고치·시체의 애니메이션/전체맵 완성 아님. NEXT PASS: 큰 재질접합과 실제 전투배율의 가시성.


16차 최종 검수: 초기TREE_DETAIL+HANGING_DETAIL+COMBAT 후,피해색/튜토리얼가림을제거한HANGING_DETAIL+COMBAT재검수. errors/HTTPerrors=1/0,mapUnchanged=True. hanging60RAF median16.7/p95 33.4ms,COMBAT90RAF16.7/33.4ms. headless1280×720녹화·체력50ms보충. 카메라촬영동안50ms마다P.iframes최소60유지,COMBAT전에플래그false/P.iframes=0으로해제. 사망UI직접호출error=None.26검사PASS. 최초오류기록initial-runtime.json보존. baseline15차에서도errors=1,동일calcCP→renderInv→_invChangeCategory→ui-panels.js:init의P=null/baseAtk오류가재현됨. 새맵렌더와별도인인벤토리초기화오류이며이번범위에서UI코드수정안함. 전체런타임오류0이라고보고하지않는다. 확대2포즈/실제HANGING_DETAIL 확인,확인페이지pageerror=0,이전/수정후토글정상. 전체전투성능판정아님. <http://localhost:3333/captures/ch1_living_detail_pass16_20260927/index.html>. 동일캔버스의15차/16차렌더토글로피해필터조건차이없이윤곽이동비교가능.


## 17차 제작 이력: 오른쪽 매달린 시체 보강 (2026-09-27)

기존 맵 보강 재개. 16차에서 정지 상태로 남은 오른쪽 시체를 추가 분리했다. 상단 작은 고치는 정적이다. 원본 파일·가지·몸통·고치3개·왼쪽시체·뿌리·손 동작 계약은 유지한다.

| id | 적용 위치 / 값 / 공식 |
|---|---|
| RIGHT_CORPSE | m_c1tree 원본1143×1400, anchor=[928,415], amp=.065rad, speed=.0012rad/ms, phase=2.4rad; angle=sin(now*.0012+2.4)*.065, 주기약5.236초 |
| outline | [[924, 415], [933, 415], [934, 435], [947, 433], [958, 444], [960, 461], [949, 481], [948, 510], [945, 548], [947, 579], [936, 600], [940, 623], [938, 640], [926, 633], [919, 604], [916, 622], [921, 642], [912, 651], [902, 640], [907, 612], [907, 591], [901, 603], [897, 582], [897, 546], [899, 509], [899, 484], [905, 469], [922, 454], [926, 437]] |
| 추출 | 16차 outline clip/destination-out 재사용. 축소836×1024 기준 crop=(654,301,51,178), 정적 RGBA 캐시1장 추가. 원본PNG 불변 |
| 순서 | staticBody→rootpatch→오른쪽시체→기존4개. 매달린 고치3개·시체2개 총5개, draw5회. 신규 프레임별 텍스처 업로드 없음 |
| 메모리 | 이번 증가0.03462982177734375MiB, hanging합계0.21546173095703125MiB, 전체 native캐시61.796810150146484MiB. 기존43.0625MiB 대비 추가18.734310150146484MiB. 임시/GPU복제/기존나무shadow 별도 |
| 격리 | stage0 production만, arena/fieldRebuild 제외, 미로드/srcRect 폴백 유지. geometry/collision/START/EXIT/배치/진행 불변 |
| 검증 | 오른쪽 몸통 crop(904,490,30,115) 시간 변화 실패 재현 후 PASS. 가지 crop(895,350,40,50) 고정. 효과19검사 PASS. QA before=16차 모듈, 출력 captures/ch1_living_detail_pass17_20260927 |

MAP PRODUCTION REPORT — 17차 완료 기록

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음.
LARGE: 기존 원본·composites·overlap·repeated silhouette 유지.
MEDIUM: 오른쪽 시체 매듭 고정, 큰 재질 연결 문제 잔여.
GROUND: shadow/contamination/structure integration 유지; 전체 피부 재질 통합 미완료.
PLAYABLE: arenas/travel/breathing/threat 공간 유지. 추가 충돌 없음, HANGING_DETAIL/입구 COMBAT에서 플레이어·스킬 윤곽 확인. 대규모 전투 검수는 미실시.
LANDMARK: primary 대왕나무 오른쪽 시체 보강; secondary 고치/독액 및 tertiary 뿌리 유지.
CAMERA QA: HANGING_DETAIL 및 COMBAT 촬영·직접 이미지 확인 완료. START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT는 이번 재촬영 전.
TECH QA: 27검사 PASS(효과19/geometry5/문법1/패키징2); route/collision 구현 불변, mapUnchanged=true. pageerror/console error/HTTP error=0. 로드28/28청크 ready, seam 관련 청크 변경 없음. HANGING_DETAIL 60RAF median33.4/p95 50.1ms, COMBAT90RAF 33.4/66.7ms. headless1280×720 녹화, 카메라 무적/50ms 체력 보충, 전투 전 무적 해제. 전체 전투 성능 PASS를 뜻하지 않음. 사망UI error=null.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js/tools/qa_ch1_living_detail.py/본 문서. concurrent touched game.html 캐시버전·맵디테일 해당2행. unrelated 수정 없음.
GIT: 변경 누적100개 방지를 위한 작업 단위 부분 체크포인트. 기존 타 작업 staged 보존. push/deploy 없음.
VISUAL VERDICT: RETOUCH — 국소 움직임 보강, 전체맵 완성 아님.
NEXT PASS: 기존 구도를 유지하며 큰 재질 접합 보강. 상단 작은 고치와 나무 투영 그림자 내부 실루엣은 정적. 기본8카메라 전체 재촬영·대규모 전투 검수는 이번에 미실시.

확인: <http://localhost:3333/captures/ch1_living_detail_pass17_20260927/index.html>. 기존16차와 현행17차를 같은 시간·캔버스에서 전환한다. 실제 게임 영상/움직임 GIF/runtime.json 포함. 코드 체크포인트 fc49313f2. 후속 문서 동기화 커밋은 별도. 기존 다른 작업의 staged 변경은 보존했다.


## 18차 현행: 시체나무 뿌리의 접촉 그림자 (2026-09-27)

GATE4 지면 접합 보강. 기존 나무 원본의 하단 뿌리 알파를 이용해 밑동과 지면 사이에 낮은 접촉 그림자를 추가한다. 매달린5개/뿌리/손의 동작과 원본 PNG·배치·콜리전은 유지한다. 새 소품 또는 전체 지면 피부화가 아니다.

| id | 적용 위치 / 수치 / 공식 |
|---|---|
| rootContactCache | m_c1tree 이미지별 WeakMap. 기존 stage0 production·로드·시야 guard 내부, native Canvas2D 최초1회 생성 |
| 원본 범위 | r=meta.srcRect 또는 전체이미지. (r.x,r.y+r.h*.72,r.w,r.h*.28), 하단28% 알파를 사용 |
| 텍스처 | 투명512×192, 원본범위를(16,16,480,160)에 그린다. 최초 blur6px 이후 filter=none |
| 색·감쇠 | source-in, Y0→192 linear gradient. RGB(18,12,17), alpha stop0:0/.25:.3/.7:.65/1:0. 원본의 투명 여백 보존 |
| 배율 | size=(meta.sz\|\|400)*(o.scale\|\|1), factor=_hand?.72:1, ar=r.w/r.h, dw=size*min(1,ar)*factor, dh=size*min(1,1/ar)*factor |
| 접지 | sx=dw/480,sy=dh*.28*.55/160,base=o.y+dh*(_hand?.28:.5). dest=(o.x-dw/2-16*sx,base-dh*.28*.55-16*sy+dh*.012,512*sx,192*sy) |
| 합성·순서 | 기존 shadows()에서 기존 나무 투영그림자보다 먼저 source alpha로 drawImage1회. 캐릭터·전투효과 아래. 동적 업로드/프레임별 blur 없음 |
| 메모리 | 이미지1종 기준0.375MiB 추가. native 합계62.171810150146484MiB, 기존43.0625 대비19.109310150146484MiB. 기존나무투영그림자/임시/GPU복제 별도 |
| 보존 | geometry/collision/START/EXIT/regions/전투공간/나무원본/기존동작 유지. 추가 MAP_OBJS/scatter0 |
| 테스트 | 고정 foot 위쪽의 접촉 알파 및 사각형 얼룩 없음 검사를 실패 재현한 뒤 PASS. 효과20+geometry5+문법1=26검사 PASS. 최초 패키징2개 중1개 실패: 동시작업 inventory-gems.css가 NW.js FILES에 빠짐. 맵 변경 외부 사유 |

MAP PRODUCTION REPORT — 18차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/main route SOUTH→NORTH/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 및 major holes 유지.
LARGE: source assets/composites/overlap/repeated silhouette 유지.
MEDIUM: 매달린 연결부 변경 없음, 큰 재질 접합은 잔여.
GROUND: 원본 하단 뿌리 알파 기반 낮은 contact shadow 추가, contamination 유지, 밑동 접지 보강.
PLAYABLE: main arenas/travel/breathing/threat 공간 유지. 전투 가독성 검수는 아래 결과에 한정.
LANDMARK: primary 대왕나무 접촉 그림자, secondary 고치/독액·tertiary 뿌리 동작 유지.
CAMERA QA: TREE_DETAIL/HANGING_DETAIL/COMBAT 촬영. START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체 재촬영은 이번 범위 아님.
TECH QA: route/collision 구현 불변. 기존 chunk seam 불변. pageerror/404/loading/performance는 아래 실측 기록.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js/tools/qa_ch1_living_detail.py/본 문서. concurrent touched game.html 캐시버전·맵디테일2행·에셋목록·production·CHANGELOG 해당행. unrelated 수정 없음.
GIT: 이번 코드+docs만 격리 커밋. 기존 staged/다른 작업 보존. push/deploy 없음. 동시작업으로 전체 변경100개 초과, 타 작업을 임의 커밋하지 않음. 예약 자동정리 재등록 없음.
VISUAL VERDICT: RETOUCH — 국소 접지 보강, 전체 재질 통합·대규모 전투 최종 검수 미완료.
NEXT PASS: 기존 구도 보존, 큰 재질 접합 개선 및 전체8카메라 검수.


18차 실제 검수: {"errors": [], "httpErrors": [], "mapUnchanged": true, "cameras": [{"name": "TREE_DETAIL", "frameTimesMs": {"median": 33.30000000000291, "p95": 33.400000000001455, "samples": 60}}, {"name": "HANGING_DETAIL", "frameTimesMs": {"median": 33.30000000000291, "p95": 33.400000000001455, "samples": 60}}], "combatRAF": {"median": 33.30000000000291, "p95": 50, "samples": 90}, "deathCheck": {"buttonPresent": true, "shown": true, "error": null}, "ready": 28}. headless1280×720 녹화·50ms 체력보충·카메라무적 후 전투 전 무적해제. 전체성능 보증 아님. 확인 <http://localhost:3333/captures/ch1_living_detail_pass18_20260927/index.html>.


## 19차: 전체 카메라 검수 및 주 랜드마크 QA 좌표 교정 (2026-09-27)

런타임 아트는18차 `20260927-18`을 유지한다. 이번 코드 변경은 QA 도구의 LANDMARK 카메라와 네트워크 실패 기록뿐이다. 전체 촬영 결과를 새 재질이 구현된 것으로 보고하지 않는다.

| 항목 | 현재 값 / 범위 |
|---|---|
| LANDMARK 검수 좌표 | 타일(83,80)→(102,90). 기존 카메라는 SI1의 옛 기준을 따라 나무가 화면 오른쪽으로 잘림. 현행 production 시체나무 runtime(4100,3620)=(102.5,90.5)*40과 일치시킴. 실제 나무 배치 변경0 |
| 카메라 수 | 기본8 + 상세7 =15곳, COMBAT1. 전체 초기촬영 LANDMARK는 옛 위치이며 보드/갤러리에서는 `landmark-fix/after/LANDMARK.png` 재촬영으로 교체. 원본 촬영 기록 보존 |
| requestFailures | page.on('requestfailed')에서 url/failure를 배열로 보존, runtime.json 최상위 requestFailures에 기록. 기존 errors/HTTP 오류 기록 유지 |
| 경로/격리 검사 | test/ch1LivingDetail.test.js20 + test/ch1ProductionFinish.test.js5 =25 PASS. Windows GLib manifest 경고1건, 검사 실패0 |
| 전체촬영 로그 | errors=5,HTTP오류=0,mapUnchanged=True. errors는 모두 ERR_NETWORK_ACCESS_DENIED. 초기 버전은 실패URL을 수집하지 않아 주소 특정 불가. 로그를 삭제하지 않음 |
| 랜드마크 재촬영 | 네트워크 접근 허용 후 errors=0,HTTP오류=0,requestFailures=8,mapUnchanged=True. 단일 재촬영0건을 전체촬영0건으로 바꾸지 않음 |
| 로딩 | 전체 requests=64,ready=64,chunk errors=0. 각 촬영은 visibleIds 전부 drawnIds일 때 진행 |
| 성능 표본 | [{"name": "TREE_DETAIL", "median": 16.80000000000291, "p95": 33.40000000000873, "samples": 60}, {"name": "HANGING_DETAIL", "median": 16.69999999999709, "p95": 33.40000000000873, "samples": 60}, {"name": "CAMP_DETAIL", "median": 33.19999999999709, "p95": 33.40000000000873, "samples": 60}]. 전체촬영 COMBAT={"median": 16.70000000001164, "p95": 49.89999999999418, "samples": 90}. headless1280×720녹화 부하 포함,전체성능 PASS 아님 |
| 보존 | MAP_OBJS/geometry/collision/전투규칙/새에셋/런타임효과 수치 변경0. 카메라 무적60하한·체력50ms보충,COMBAT전 무적해제. 이동은 QA강제전환이며 실제 종주 아님 |

| CAMERA QA | 타일 | 직접 이미지 검수 | 판정 |
|---|---|---|---|
| START | (100,180) | 전투면과 남북 방향은 읽힘. 좌우 조직 갈래 형태 반복이 남음. | RETOUCH |
| EARLY | (100,157) | 넓은 회피 공간. 흙 균열 재질이 지배하며 피부 재질은 아직 약함. | RETOUCH |
| ARENA | (100,120) | 공간 유지. 낙엽 패턴 반복과 구역 간 재질 차이 부족. | RETOUCH |
| SIDE_L | (49,151) | 통로 유지. 넓은 낙엽 바닥의 반복이 강해 우선 리터치 대상. | RETOUCH |
| SIDE_R | (151,136) | 독성 지형으로 장소 구별. 오염 원화의 보라 테두리·절차식 구덩이 재질 차이 잔여. | RETOUCH |
| LANDMARK | (102,90) | 검수 좌표 교정. 나무 몸통·뿌리 위계와 플레이어 확인, 주위 바닥 통합 잔여. | RETOUCH |
| LATE | (100,48) | 통로와 적 윤곽 확인. 초반과 바닥 색·재질의 차이가 작음. | RETOUCH |
| EXIT | (100,15) | 북쪽 게이트 접근과 측면 프레임 확인. 최종 보스 진행을 완료한 검사는 아님. | RETOUCH |

| NEXT PASS 우선순위 | 위치 / 개선할 결함 | 보존할 계약 |
|---|---|---|
| 1 지면 재질 | SIDE_L(49,151),SIDE_R(151,136),ARENA(100,120)의 반복 낙엽. 선택영역에서 괴사한 피부막·습윤 오염으로 국소 전이 필요 | 기존 베이스/레이어 보존, 전체재생성 금지, 넓은 공터·충돌 불변 |
| 2 독구덩이 접합 | POOL_DETAIL(162,141),기존 큰 오염원화와 작은 절차식 pit의 색/밀도차,보라빛 외곽 경계 | pit collision/위치/동작 유지,경계를 바닥과 부드럽게 연결 |
| 3 구역 구분 | EARLY/LATE의 유사한 흙 균열·갈색 팔레트 | 새 장애물·scatter 대신 지면 재질과 저대비 오염 변화 |

MAP PRODUCTION REPORT — 19차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지. route 테스트PASS.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 유지. 이번8카메라는 주요 공간 기준, 외곽 전체를 연속 답사한 검수는 아님. major holes 전체 해소 판정 안함.
LARGE: source assets/composites/overlap/repeated silhouette 변경 없음. source원본 반복감은 지면 반복과 구분.
MEDIUM: connections 유지,큰 재질 접합 문제 잔여.
GROUND: 18차 접촉shadow 유지,contamination/structure integration 잔여 결함 위표에 지정.
PLAYABLE: main arenas/travel/breathing/threat 공간 유지. START/LATE/COMBAT에서 플레이어·적·스킬 윤곽 확인;다수 적·드롭·모든 탄종의 대규모 검수 아님.
LANDMARK: primary나무(102,90) QA교정,secondary야영지/고치/독액·tertiary뿌리 유지.
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 직접검수,7상세촬영 및 COMBAT. 판정 위표.
TECH QA: route/collision25검사,초기network5/HTTP0→랜드마크재촬영0. seam명백한청크격자미관찰이나전청크경계전수검사아님. loading/성능은위수치.
FILES: stage-owned tools/qa_ch1_living_detail.py/본 문서. captures와tmp는기존ignore검수파일. concurrent/unrelated 코드 수정 없음.
GIT: QA코드+docs만 로컬격리커밋,다른staged보존,push/deploy없음.
VISUAL VERDICT: RETOUCH — 큰 공간은 유지되지만 반복 지면과 재질 접합 보강 필요.
NEXT PASS: 위표의 SIDE_L/SIDE_R 지면 재질부터 기존 베이스의 부분 편집. 미실행 새 아트를 완료라고 보고하지 않음.

검수 갤러리: <http://localhost:3333/captures/ch1_full_review19_20260927/index.html>.


## 20차: 공터의 정적 피부막 전이 (2026-09-27)

19차 NEXT PASS의 반복 낙엽 바닥을 대상으로 GATE4 재질 연결을 보강한다. 원본 production 청크·원화는 보존하고, 기존 draw()의 지면 단계에서만 저대비 정적 재질을 겹친다. 신규 생성 이미지·소품·콜리전·지면 전체 변형은 없다.

| id / 적용 위치 | 타일 중심 | 월드 중심(px) | 월드 폭×높이(px) | variant / 의미 |
|---|---|---|---|---|
| SIDE_L | (49.5,151.5) | (1980,6060) | 1280×880 | 0 / 회갈색 괴사 피부막 |
| SIDE_R | (151.5,136.5) | (6060,5460) | 1200×800 | 1 / 황회색 젖은 조직 전이 |
| ARENA | (100.5,120.5) | (4020,4820) | 1360×820 | 2 / 중앙 공터의 낮은 피부 주름 |

| 변수·항목 | 구현 계약 |
|---|---|
| skinRegions / regionalSkin / regionSkins | 위3개 고정 영역, variant별 최초 사용시 native Canvas2D 캐시. MAP_OBJS 추가0 |
| 텍스처·메모리 | 768×512 투명 RGBA×최대3장=4.5MiB 상주 추가. 마스크768×512는 베이크 임시자원, 캐시에 보존하지 않음. 18차 native62.171810150146484 기준 최대66.671810150146484MiB(기존 투영그림자·임시·GPU복제 별도) |
| 범위·순서 | stage0 production, bossArena/fieldRebuild 제외. surfaceOnly=false에서만 기존 힘줄보다 먼저; 오브젝트·캐릭터·전투효과 아래. 기존 shadows 호출 뒤. 표면 패스 재합성 없음 |
| 카메라 제외 | zoom=max(.3,_edZoom||_camZoom||1), 중심거리 > 카메라 반폭+영역폭/2 또는 반높이+영역높이/2이면 제외. 화면 내 영역당 globalAlpha=기존alpha×.6으로 drawImage1회 후 alpha 복원, 프레임별 gradient/베이크/텍스처 업로드 없음 |
| 기본색 | dry variant0/2: #342e31→#4c403e→#342e2f. wet variant1: #303329→#494a37→#32342b. gradient (0,0)→(180,512), stop0/.45/1 |
| 결정적 seed | 1397+variant×971, LCG=(imul(seed,1664525)+1013904223)>>>0, rand=seed/4294967296. 시간·게임 난수와 독립 |
| 넓은 얼룩 | 28개, x=rand×768/y=rand×512/r=35+rand×100. 중심 j%3 ? rgba(27,22,26,.23) : rgba(118,101,84,.14), 경계 rgba(40,29,34,0) |
| 미세 재질 | 9500개, x/y 동일범위, r=.4+rand×1.6, 크기(r×1.8,r). j%3 ? rgba(23,18,21,.09) : rgba(170,150,126,.08) |
| 피부 주름 | 23개, x=40+rand×510,y=48+rand×400,len=35+rand×90,bend=6+rand×12. translate(x,y),rotate((rand-.5)×1.4) 후 local cubic (0,0)→(.3len,-bend)→(.7len,.4bend)→(len,-.3bend). 어두운 선 rgba(29,22,27,.22), 폭1.2+rand×1.6; 밝은 선 y-1.4, rgba(156,134,116,.14), 폭.8 |
| 비대칭 마스크 | (중심x,y,rx,ry)=(300,255,288,210)/(500,225,232,172)/(440,332,220,152), x에(variant-1)×18. 각 정규화 반경.12→1 gradient, stop0 alpha.88/.48 alpha.75/1 alpha0, source-over 결합→destination-in. 사각 텍스처 경계는 투명 |
| 시간·상태 | 정적인 재질. 동맥 맥동·고치/시체/나무 동작은 기존 계약 유지. 캔버스 alpha/transform 복원. 원본맵·geometry·route·collision·START/EXIT·게임플레이·원본PNG 변경 없음 |
| 테스트 | 지면 중앙의 가시성 검사 실패를 먼저 재현. 현행 효과21+지형5+구문1+패키징2=29 PASS. native canvas가 Windows GLib manifest 경고1건 출력했으나 검사 실패0 |

실제 전후 검수와 MAP PRODUCTION REPORT는 아래와 같다.


20차 실제 검수: before(18차 런타임)/after(첫20차)/final(대비 보정20차)를 별도 보존. 초기 넓은 회색 면과 평행 주름을 발견해 palette를 어둡게, 합성alpha를.6으로 낮추고 주름 길이·각도를 보정했다. 최종값은 위표다.

| CAMERA QA | 이번 직접 검수 | 판정 |
|---|---|---|
| START / EARLY | 기존 넓은 통로와 국소 힘줄 유지. 피부막 추가 영역 밖이며 갈색 바닥 반복은 잔여 | RETOUCH |
| ARENA | 기존 바닥 결을 보존하며 낮은 회갈색 전이. 플레이어 윤곽 유지. 피부 재질로 완전히 교체된 상태 아님 | RETOUCH |
| SIDE L | 낙엽 대비 완화와 낮은 주름. 사각 경계 없음. 반복 낙엽이 여전히 읽힘 | RETOUCH |
| SIDE R | 황회색 전이로 독성 지형 주변 연결. 대형 독구덩이 보라 테두리·절차식 pit 재질차는 잔여 | RETOUCH |
| LANDMARK / LATE / EXIT | 기존 나무·후반 지면·북쪽 게이트 유지, 추가 대형 구조물 없음 | RETOUCH |
| COMBAT | 입구 이동·공격·Q 입력과 적/스킬 윤곽 확인. 세 지면 영역의 대규모 전투 검수는 아님 | RETOUCH |

| TECH QA | 실제 결과 / 한계 |
|---|---|
| 자동검사 | 29 PASS(효과21/geometry5/구문1/패키징2), Windows canvas GLib manifest 경고1건 |
| 오류 | 최종 errors5건은 외부 Google Fonts3/Three.js2의 ERR_NETWORK_ACCESS_DENIED. before에도 동일5건. 수집로그의 JS pageerror stack 없음,HTTP오류0. 런타임 오류0이라고 보고하지 않음 |
| requestFailures | 외부 차단5 + intro.mp4 ERR_ABORTED8 =13. 인트로 생략에 따른 중단 기록 보존 |
| 충돌·이동 | mapUnchanged=true. 입구 WASD 이동 (4020,7220)→(4098.803036043917,7247.681663849677), 종주/보스 클리어 검수 아님 |
| loading / seam | 요청46/ready46/chunk오류0. 각 화면 visibleIds 모두 drawnIds 포함 후 촬영. 원본 청크 변경0, seam 전수 검사 아님 |
| frame time | ARENA/SIDE_L/SIDE_R 각60RAF median16.7ms/p95≈33.4ms. COMBAT90RAF median16.7ms/p95≈33.4ms. headless1280×720 녹화, 성능 표본이며 전체성능 PASS 아님 |
| 렌더 CPU 표본 | 최종 EXIT 위치의 draw120회 p95≈.1ms/max≈.1ms. 새 지면 영역 밖이므로 새 재질 비용 측정값으로 사용하지 않음 |
| QA 조건 | 카메라 촬영 중 체력50ms보충/iframes60하한,전투 전 무적보충 해제. 사망UI검사 error=null |

MAP PRODUCTION REPORT — 20차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 및 major holes 변경 없음. 외곽 완성 판정 아님.
LARGE: source assets/composites/overlap/repeated silhouette 유지. 새 생성 이미지0.
MEDIUM: 기존 connections 유지,큰 재질 접합은 잔여.
GROUND: 기존 shadow 유지,3구역 저대비 피부 주름·습윤 contamination 전이 추가. 완전한 피부 재질화 아님.
PLAYABLE: main arenas/travel/breathing/threat 공간 유지,추가 충돌0. 플레이어 가독성 확인,대규모 전투 최종 검수 미실시.
LANDMARK: primary시체나무/secondary야영지·고치·독구덩이/tertiary뿌리 유지.
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 8카메라+COMBAT 전후 촬영. 위표 참조.
TECH QA: route/collision29검사 및 mapUnchanged=true. pageerror/404/seam/loading/performance의 확인범위는 위표.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent touched game.html의버전1행·런타임문서20차추가·맵디테일1행만. unrelated touched 없음. 백업/검수도구/영상은 tmp/ch1-pass20 및 captures/ch1_skin_regions20_20260927(기존ignore).
GIT: 이번5파일의 코드+docs 격리 체크포인트를 준비했으나 git hash-object -w가 .git/objects 권한 거부로 실패. require_escalated 승인 후 재시도도 exec_command 셸 생성 오류(-1073283067)로 실패하여 커밋 미완료. 실제 공유 index·타작업 staged/unstaged 보존. 시작100→중간102→완료조회106개(동시작업 변동 포함)로 타 작업 누적이 이미 한계이며 타 작업을 개수만 줄이려고 숨기거나 임의커밋하지 않음. push/deploy 없음. 준비 스크립트 tmp/ch1-pass20/checkpoint.mjs는 권한·셸 정상화 후 재준비/검토가 필요하다.
VISUAL VERDICT: RETOUCH — 국소 바닥 전이 보강. 전체 피부 재질·독구덩이 경계 통합은 미완료.
NEXT PASS: 보라빛 구덩이 외곽 접합과 반복 낙엽을 기존 아트의 국소 편집으로 개선. 전체맵 재생성·새 장애물 추가 없이 큰 재질 연결을 우선한다.

전후 갤러리: <http://localhost:3333/captures/ch1_skin_regions20_20260927/index.html>.


## 21차: 동측 독구덩이의 보라색 경계와 알파 접합 (2026-09-27)

이 절의18px 알파 폭은21차 당시 계약이다. 현행25차는 아래 명도별24~56px로 대체하며,색 보정·거리장·폴백 계약은 유지한다.

20차 잔여인 동측 대형 오염 원화의 보라색 테두리를 런타임에서 국소 보정한다. 원본 PNG·베이크 청크를 수정하지 않으며, 기존 독액·바위의 내부 질감을 보존한다. 작은 pit_poison의 벽·잔물결·수축과는 별개다.

| id / 항목 | 현행 계약 |
|---|---|
| groundSprite | Ch1LivingDetail의 스프라이트 반환 API. 게임 default 장식 렌더에서 원본 _OBJ_SPR를 받은 뒤 호출. 기존 keepAR/flip/alpha/filter/crop/anchor 처리 경로 유지 |
| 대상 | stage0 production의 m_c1gtoxicf, 월드(6500,5460)=타일(162.5,136.5) 한 배치. _bossArena/_fieldRebuildQA 제외. 원본 assets/map/ch1/floor_objects/prop_g_toxic.png |
| 로딩·격리 폴백 | meta 없음/srcRect 있음/img 없음/complete===false/폭0 또는 대상 외 조건이면 입력 img 그대로 반환. API 미로드면 기존 그림. 다른 stage·좌표·오브젝트·우상단 m_c1pool/m_c1gtoxic 불변 |
| toxicRimCache | 이미지 키 WeakMap. 처음 쓸 때 원본폭w×높이h native Canvas2D에 복사·getImageData 후 처리, 이후 같은canvas 재사용. complete=true/naturalWidth=w/naturalHeight=h로 기존 스프라이트 로드·비율 계약 유지 |
| 크기·메모리 | 원본881×900, 정적RGBA1장=3.0246734619140625MiB 추가. 20차 native66.671810150146484 기준 최대69.69648361206055MiB. 처리중 ImageData/Float32Array 각w×h×4byte 임시, GPU복제 별도. 프레임별 픽셀처리/업로드 없음 |
| 거리장 초기값 | 알파<=8이면d=0. 그외 min(64,x+1,y+1,w-x,h-y). 첫 정방향 순회에서 좌/위 d+1, 역방향 순회에서 우/아래 d+1 최소값. 투명 윤곽·패인 부분·이미지 경계를 기준으로 한 L1거리, 대각 보간거리 아님 |
| 보라색 분리 | spill=max(0,min(R,B)-G-6),mix=min(1,spill/10)×min(1,max(0,(64-d)/24)). 색차가 없거나 경계로부터64px 이상이면 색 불변 |
| 경계색 | L=.299R+.587G+.114B, target=(.96L,.9L,.76L). RGB=원본+(target-원본)×mix. Uint8ClampedArray 반올림. 내부 독액/황색/바위 전체에 광역 필터를 씌우지 않음 |
| 알파 전이 | f=min(1,d/18),A'=A×f²×(3-2f). 원본 공간의18px 범위만 짧게 페더. source footprint/배치/scale/meta 불변,추가 그림자·장애물 없음 |
| 원본 보존 | 원본img·PNG·_OBJ_SPR·meta·MAP_OBJS·geometry·collision·START/EXIT·진행 불변. 캐시canvas만 기존 렌더에 전달 |
| 테스트 | 미구현 API 실패 재현 후 테두리alpha/보라색 감소·내부olive RGBA(71,86,44,255)·원본 불변·cache재사용·stage/arena/QA/좌표/srcRect/미로드 폴백 검사 PASS. 초기 효과22+geometry5+구문1+패키징2=30 PASS. 경계색 최종 보정 후29 PASS/패키징1 FAIL: 동시작업에서 game.html에 추가한 inventory-gems-finish.css가 NW.js FILES에 없음. 맵 관련28검사와 나머지 패키징1검사는 PASS. 해당 CSS/패키징은 이번 맵 수정 범위 밖이며 완료로 보고하지 않음. Windows canvas GLib manifest 경고1건 |



21차 최종 검수: 보라 경계 잔여를 직접 확인해 초기거리48/색분모24에서 최종거리64/색분모10/감쇠폭24로 조정했다. 위표는 최종값이다. before=20차,after=21차초기,final=21차최종이며 각기 다른 게임 실행이므로 전투 상태·시간은 일치하지 않는다.

| CAMERA QA | 실제 검수 / 판정 |
|---|---|
| START / EARLY / ARENA / SIDE L | 기존 지면20차·넓은 전투면 유지. 이번 효과의 대상 밖. 기존 반복 낙엽 문제 잔여. RETOUCH |
| SIDE R / POOL_DETAIL | 독성 원화의 보라색 가장자리 감소·짧은 지면 전이 확인. 내부 독액·바위 윤곽 유지. 작은 절차식pit와 사진성 대형 원화의 재질차는 잔여. RETOUCH |
| LANDMARK / LATE / EXIT | 시체나무·후반/북쪽 게이트 유지. 추가 장애물 없음. RETOUCH |
| AUTHORED_POOL | 우상단 m_c1pool 기존 원본·위치·맥동 유지. 동측 원화 처리와 격리. RETOUCH |
| COMBAT | 입구 공격·Q 입력·적/스킬 윤곽 촬영. 독구덩이 앞 전투 경고도 POOL_DETAIL에 보임. 대규모 전투/모든 탄종 검수 아님. RETOUCH |

| TECH QA | 결과와 한계 |
|---|---|
| 검사 | 초기30 PASS. 최종29 PASS/1 FAIL: 맵관련28검사(효과22/geometry5/구문1)와 패키징1검사 PASS; inventory-gems-finish.css NW.js FILES 누락으로 패키징1검사 FAIL. 동시작업 파일이며 이번에 수정 안함 |
| 오류 | 전후/최종 공통 errors5: 외부 Google Fonts3/Three.js2 ERR_NETWORK_ACCESS_DENIED. JS pageerror stack 수집0,HTTP오류0. 최종 requestFailures13=외부차단5+intro.mp4 ERR_ABORTED8. 인트로 생략 중단 기록 보존. 전체오류0이라 보고하지 않음 |
| 로딩 | requests56/ready56/chunk오류0. visibleIds가 drawnIds에 모두 포함된 후 촬영. 원본 청크 수정0,전청크 seam 전수검사 아님 |
| 상태·이동 | mapUnchanged=true, 원본 PNG의 Git blob hash 동일. 입구 WASD 입력 시작(4020,7220)→끝(4020,7217.20968). 순차 왕복 입력의 순변위이며 전체 종주·각 방향 이동거리 검사 아님. 사망UI error=null |
| 성능 | SIDE_R/POOL_DETAIL 각60RAF median16.7ms/p95≈33.4ms. COMBAT90RAF median16.7ms/p95≈33.4ms. headless1280×720 녹화,전체성능 보증 아님. draw120회 CPU p95≈.1ms/max≈.1ms는 마지막 AUTHORED_POOL 지점 표본으로 신규groundSprite 처리 비용이 아님 |
| 조건 | 카메라중 체력50ms보충/iframes60하한,전투전 무적보충 해제. 독구덩이 앞 적과 플레이어 상태는 전후 다를 수 있음 |
| 디스크 확인 | 개발서버 ch1-living-detail.js?v=20260927-21 응답과 디스크 byte 동일. 갤러리HTTP200. 원본 prop_g_toxic.png는 HEAD와 blob동일 |

MAP PRODUCTION REPORT — 21차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음.
LARGE: source assets/composites/overlap/repeated silhouette 유지. 원본PNG 변경0,신규 이미지0.
MEDIUM: 기존 connections 유지,독구덩이 재질 접합은 일부 개선·잔여 존재.
GROUND: 기존 shadow 유지. 동측 toxic contamination의 보라 경계64px 이내 색 보정/18px alpha전이로 structure integration 보강.
PLAYABLE: main arenas/travel/breathing/threat 공간과 충돌 유지. 캐릭터/전투 경고 윤곽 확인,대규모 전투 미검수.
LANDMARK: primary시체나무 유지,secondary동측 독구덩이의 접합만 변경. 우상단 웅덩이·tertiary뿌리 유지.
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+POOL_DETAIL/AUTHORED_POOL+COMBAT 최종 촬영·보드 검수.
TECH QA: route/collision/map 불변,검사29PASS/패키징1FAIL. 오류·404·seam·loading·performance는 위표 범위.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent touched game.html의버전·스프라이트변환3행,런타임/맵디테일/관련기획6문서/CHANGELOG의21차 기록만. unrelated touched 없음. tmp/ch1-pass21 백업·검수도구와 captures/ch1_toxic_rim21_20260927은 기존ignore.
GIT: 이전20차에서 확인된 .git 쓰기권한 제한과 승인 재시도 셸 생성 실패로 유효한 커밋 실행 경로가 확보되지 않음. 이번21차 커밋 미완료. 공유index·타작업 staged 보존. 시작106→중간112→완료조회113개(동시작업 변동 포함); 타 작업을 숨기거나 강제커밋하지 않음. push/deploy 없음. tmp/ch1-pass20/checkpoint.mjs는20차전용이므로21차에 사용하지 않는다.
VISUAL VERDICT: RETOUCH — 국소 경계 개선,전체 구덩이/바닥 재질 통합 미완료.
NEXT PASS: 작은 절차식pit와 큰 오염 원화의 접점을 실제 독액/벽 재질에 맞춰 통합하고,반복 낙엽을 기존 아트의 부분 편집으로 보강. 기존 구도와 넓은 전투면 유지.

전후 갤러리: <http://localhost:3333/captures/ch1_toxic_rim21_20260927/index.html>.


## 22차: 작은 독구덩이에 기존 원화 재질 연결 (2026-09-27)

21차에서 남은 절차식 구덩이와 사진성 오염 원화의 재질 차이를 줄인다. 기존 prop_g_toxic.png의 벽과 독액을 샘플링하며 새 이미지 생성·원본 수정은 없다.

| id / 항목 | 현행 계약 |
|---|---|
| 대상·호출 | Ch1LivingDetail.pit(c,g,o,now,meta,img), stage0 production pit_poison 월드(6500,5580)만. game.html이 _OBJ_SPR.m_c1gtoxicf를 전달. bossArena/fieldRebuildQA 제외 |
| material 판정 | img 존재, complete!==false, (naturalWidth 또는 width)>1, (naturalHeight 또는 height)>1. 나머지는 null |
| 로딩·캐시 | pitAtlasSource와 material이 달라지거나 atlas가 없을 때 재생성. 미로드는 기존 절차식 렌더, 로드 후 재질 버전으로 교체. 동일 이미지면 재사용. API 미로드는 원래 pit sprite 렌더 |
| atlas·메모리 | 기존1024×1024 RGBA,4×4셀/각256×256/16프레임/4MiB 교체. 지속 atlas 수 증가0,21차 native 합계69.69648361206055MiB 유지(기타shadow·GPU복제 제외). 교체중 이전4MiB가 GC 전 잠시 공존 가능 |
| 외측 턱 | contour(106,80,9,1.6) 클립. source=(.67iw,.16ih,.24iw,.36ih), destination=(-114,-78,228,172). rgba(20,19,16,.38) 음영 |
| 안쪽 벽 | contour(97,71,9,1.6) 클립. 같은 source를 destination=(-110,-75,220,160)에 배치. gradient(0,-65→0,78):0 rgba(8,9,8,.76),.55 rgba(14,14,11,.48),1 rgba(24,23,18,.22) |
| 독액 | contour(86,48,23,2) 클립. source=(.16iw,.15ih,.34iw,.4ih),destination=(-92,-31,184,108). rgba(9,15,8,.3) 음영. iw/ih는 원본881×900의 실제치 |
| 절차식 폴백 | 기존 wall 점280/균열19/독액 반점32는 material 없을 때만. 기존 기본색·그라디언트는 재질 아래 유지 |
| 명암 | 잔물결3개의 alpha=(1-p)×.14(재질)/.24(폴백),p=(f/16+j/3)%1. 22차 당시 앞턱 강조 rgba(143,125,91,.14) / 폴백 .3,선폭1.6. 현행 재질로드 앞턱은26차에서 .12/1px 및 불규칙 접촉선으로 대체 |
| 동작·구조 | phase=((now×.00095+x×.017+y×.011)/(2π)%1+1)%1×16,인접프레임 보간. sz=(meta.sz 또는200)×(scale 또는1). 기존 contour·수축·접촉shadow·습윤9곳·유입2개·충돌·좌표·배치개수 유지 |
| 원본 보존 | 원본PNG Git blob이 HEAD와 동일. _OBJ_SPR 이미지 픽셀 변경 없음. 큰 원화의21차 groundSprite 경계처리와 별개 |
| 자동검사 | 신규 재질 테스트의 실패를 먼저 확인한 뒤 구현. 폴백→로드 전환/같은 재질 재현성/소스불변/다시 null 폴백 검사. 효과23+geometry5+구문1=29 PASS. 패키징1 PASS/1 FAIL,전체31중30 PASS. 기존 동시작업 inventory-gems-finish.css의 NW.js FILES 누락은 미수정. Windows canvas GLib manifest 경고 |

| CAMERA / TECH QA | 결과·한계 |
|---|---|
| SIDE R / POOL_DETAIL | 구덩이 벽·수면에 기존 원화 질감 적용 확인. 단순 녹색 반점 감소. 겹치는 윤곽·큰 원화와 바닥 밀도 차이는 잔여 RETOUCH |
| START/EARLY/ARENA/SIDE L/LANDMARK/LATE/EXIT | 7카메라 직접 보드 검수. 기존 남북 동선·넓은 전투면·시체나무 유지. 반복 낙엽과 전체 피부 재질화는 잔여 RETOUCH |
| AUTHORED_POOL / COMBAT | 우상단 웅덩이 격리 유지. 입구 공격/Q 촬영. 전후 적·게임시간은 달라 픽셀 완전일치 비교 아님 |
| 오류·로딩 | errors5(외부 Google Fonts3/Three.js2 네트워크차단),JS pageerror stack0,HTTP오류0. requestFailures14=외부5+인트로생략 ERR_ABORTED9. requests56/ready56/chunk오류0,visibleIds가 drawnIds에 모두 포함. 전청크 seam 전수검수 아님 |
| 상태·입력 | mapUnchanged=true,사망UI error=null. 체력50ms보충/카메라 iframes60하한,전투전 무적보충 해제. WASD 순차왕복 시작과끝(4020,7220) 동일; 순변위만 기록하여 각방향 이동/전체종주 입증 아님 |
| 성능 | headless1280×720 녹화. SIDE_R/POOL_DETAIL 각60RAF median16.7ms/p95≈33.4ms,COMBAT90RAF median16.7ms/p95 50ms. 전투 p95가21차보다 높아 전체 성능 PASS 판정하지 않음. 마지막 AUTHORED_POOL draw표본 CPU p95≈.1ms는 새 atlas 생성비용 측정 아님 |
| 실서버 | ch1-living-detail.js?v=20260927-22 응답과 디스크 byte 동일. 전후갤러리 HTTP200. captures/ch1_pit_material22_20260927/{before,after}/runtime.json·PNG·webm 보존 |

MAP PRODUCTION REPORT — 22차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음.
LARGE: source assets/composites/overlap/repeated silhouette 유지. 원본PNG 수정0,신규생성0.
MEDIUM: 독구덩이 connection의 국소 재질 통합,겹치는 윤곽과 remaining holes는 미해결.
GROUND: 기존 shadow·contamination 유지. 작은 pit의 벽/독액을 같은 원화에 연결하여 structure integration 보강.
PLAYABLE: main arenas/travel/breathing/threat 공간·충돌 유지. 추가장애물0. 전투경고 윤곽 확인,대규모 전투 미검수.
LANDMARK: primary시체나무/tertiary뿌리 유지. secondary동측 구덩이 재질만 변경.
CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+POOL_DETAIL/AUTHORED_POOL+COMBAT 전후 촬영·검수.
TECH QA: route/collision/map 보존,맵관련29 PASS. pageerror/404/seam/loading/performance 한계는 위표. 전체31중30PASS/기존 패키징1FAIL.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent touched game.html은버전·pit 이미지인자만,관련맵문서8개/CHANGELOG에22차 동기화. unrelated touched 없음. tmp/ch1-pass22 백업·도구와 captures/ch1_pit_material22_20260927은 기존ignore.
GIT: .git 쓰기권한 제한과 승인 재시도 셸 생성오류(-1073283067)로 커밋 미완료. 공유index·타작업 staged 보존. 시작113→중간114→완료조회115개(동시작업 포함). 임의숨김/강제커밋 없음,push/deploy 없음. pass20 전용 체크포인트는20차 외 실행을 차단하도록 보호.
VISUAL VERDICT: RETOUCH — 작은 구덩이의 재질 연결 개선. 전체 구덩이 윤곽·바닥 통합은 미완료.
NEXT PASS: 겹치는 턱 윤곽과 큰 독성 원화의 바닥 접합을 부분 보강. 반복 낙엽/전체 피부 재질도 잔여. 넓은 전투면과 기존 geometry 유지.

전후 갤러리: <http://localhost:3333/captures/ch1_pit_material22_20260927/index.html>.


## 23차: 밑동 고정·끝 선행 촉수 포복 (2026-09-27)

사용자 스크린샷 2026-09-27 184846.png의 지면 촉수에 대한 “끝이 먼저 기어가고 몸통이 따라 당겨지는 움직임” 승인 반영. 10차의 dry 끝점 고정을 대체한다. 오브젝트 전체의 월드 이동이나 충돌 이동은 아니다.

| id / 항목 | 현행 수치·동작 |
|---|---|
| 대상 | 기존 paint의 dry 촉수3/4/5갈래,길 어깨11곳 및 기존 dry 오브젝트 접지 촉수. stage0 production만. wet(m_c1pool/pit_poison) 촉수는 기존 동작 |
| tendonCrawl | u=0..1,phase=now×.00095+seed,branch=j. q=fract((phase-j×.8-(1-u)×.85)/(2π)). 밑동에서 지연이 크고 끝에서0. 가지별.8rad 차이 |
| 뻗기·당김 | S(t)=t²(3-2t). q<.32:R=S(q/.32); .32≤q<.52:R=1; .52≤q<.86:R=1-S((q-.52)/.34); 이후R=0. 뻗기32%/유지20%/당김34%/휴지14% |
| 전진·횡굴곡 | along=18×R×u^1.7; side=9×sin(phase-5u-.8j)×sin(πu)+3×sin(phase-.8j)×u². 단위 atlas px. 밑동u=0 이동0,끝은 전진0..18 및 좌우±3. 중간9는 기존굽힘/압력에 더하는 값 |
| 방향 | axis=(ex,ey-14)/hypot(ex,ey-14). x+=axis.x×along-axis.y×side,y+=axis.y×along+axis.x×side. 기존 압력/중간굽힘/폭 유지 |
| 곁가지 | points[19]와 함께 이동. dry control=(joint.x-12,joint.y-9),end=(joint.x-23,joint.y-23). wet 기존 ex/ey 공식 보존 |
| 주기·스케일 | 기존16프레임·선형보간·약6.614초·1280² atlas/320²셀 유지. dry3종을 같은 크기로 교체,추가 상주atlas0. 지면tissue_bed s=1.8에서는 전진 최대32.4월드px(카메라zoom 전). 원래 알파 페더 유지 |
| 보존 | 밑동(0,14)/공동 유착부/지면막·그림자/월드 앵커/충돌·START·EXIT 유지. 새 산포·원본이미지수정0. 22차 독구덩이 재질 유지 |
| 검사 | 신규 실패를 먼저 확인. 밑동 고정/끝 이동/몸통 지연/2π 루프 검사와 기존 효과24+geometry5+구문1=30 PASS. 이번에는 패키징검사 재실행 안함;22차의 별도 FILES 누락 해결 여부는 미확인 |

MAP PRODUCTION REPORT — 23차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 유지.
LARGE: source/composites/overlap/repeated silhouette 유지,원본변경0.
MEDIUM: 기존connections/remaining holes 유지.
GROUND: dry 촉수 국소 포복,기존shadow·contamination·structure integration 유지.
PLAYABLE: main arenas/travel/breathing/threat 공간·충돌 유지,새장애물0.
LANDMARK: primary시체나무/secondary야영지·구덩이/tertiary뿌리 유지. 그 아래 dry 접지 촉수만 동작 변경.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html은캐시버전1행,맵문서8개/CHANGELOG에23차 동기화. unrelated touched 없음. tmp/ch1-pass23 백업·QA 및 captures/ch1_tendon_crawl23_20260927은 기존ignore.
GIT: 앞서 확인한 .git 쓰기권한 제한/승인후 셸 생성오류로 커밋 미완료. 공유index·타작업 보존,push/deploy 없음.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및 COMBAT 촬영. 촉수 GIF의0/8/16프레임과 전체보드 직접검수. 밑동은 붙어 있고 끝/몸통 형태가 변하며 촬영영역에서 셀 경계 잘림 미관찰. 적/VFX가 일부 가리는 프레임 포함.
TECH QA: 자동30 PASS,mapUnchanged=true,사망UI error=null. HTTP오류0,pageerror stack0,외부 Fonts3/Three.js2 차단5건. requestFailures15=외부5+인트로생략중단10. 청크56/56 ready,촬영시 visibleIds 모두 drawnIds에 포함(전청크 seam 전수검수 아님). WASD 왕복입력 시작(4020,7220)→끝(4020,7217.31134):각방향 이동·종주 증명 아님. 체력50ms보충/카메라iframes60,전투전 무적보충 해제. SIDE_R/POOL_DETAIL60RAF median16.7ms/p95 33.4ms,COMBAT90RAF median16.7ms/p95 50ms. headless1280×720 녹화이며 전체성능 PASS 아님. 개발서버23차와 디스크 byte 동일.
GIT 누적: 시작116→완료조회118개(동시작업 포함). 타작업을 숨기거나 임의커밋하지 않음.
VISUAL VERDICT: RETOUCH — 요청한 촉수 포복은 적용·실게임 확인. 기존 지면막 재질접합·전체 피부바닥은 잔여.
NEXT PASS: 사용자 확인에 맞춰 촉수의 이동폭/속도를 조정할 수 있으나,현재 적용값은 위표. 기존 지면막 윤곽과 바닥 재질접합 보완 잔여.

움직임: <http://localhost:3333/captures/ch1_tendon_crawl23_20260927/index.html>.


## 24차: 촉수 피부막의 잘린 윤곽 접합 (2026-09-27)

23차 실제 화면에 남은 피부막의 종이 패치 같은 경계를 보강한다. 원래 불규칙 윤곽에 걸린 알파를 안쪽에서 감쇠하며,촉수 움직임·중앙 피부 주름은 보존한다.

| id / 항목 | 현행 수치·공식 |
|---|---|
| 대상 | membrane(false,variant)의 dry3종만. wet1종·regionalSkin3구역은 변경 없음. stage0 production의 기존 dry 접지 촉수 아래 |
| 기준좌표 | 기존320×320 canvas의 픽셀중심 dx=(x+.5-160)/1.12,dy=(y+.5-172)/.62,angle=atan2(dy,dx) |
| 기존 윤곽 반경 | radius=102+18×sin(3angle+variant)+11×cos(5angle-variant). clip의 기존72구간 윤곽과 같은 함수 사용 |
| 알파 감쇠 | depth=radius-hypot(dx,dy),t=clamp(depth/28,0,1),A'=A×t²×(3-2t). 기존 방사형 알파 이후 곱함. 28은 타원 정규화 좌표 폭으로 실제 유클리드 거리28px와 다름. RGB 변경0 |
| 실행·메모리 | 각320² native 캐시 최초 생성시에만 getImageData/putImageData. 픽셀연산102400회/종,ImageData409600byte(0.390625MiB) 임시. 프레임별 처리0,새 상주atlas0. 기존 native 합계 산정69.69648361206055MiB 유지(기타shadow/GPU/임시 제외) |
| 보존 | 기존 촉수 포복23차·밑동·지면shadow·막 중심·원본이미지·월드배치·충돌 유지. 새 산포0. 기존 wet membrane의 native RGBA byte가23차와 동일함을 별도비교 |
| 회귀검사 | 실패 먼저 확인: 윤곽 안쪽3 정규화 단위의 alpha최대92. 구현후 dry3종 경계alpha≤5,중앙alpha>30 검사 PASS. 효과25+geometry5+구문1=31 PASS. 패키징 재검사 안함,기존 별도누락 해결 여부 미확인 |
| 동일시점 비교 | tmp/ch1-pass24/before-after.png:23차 왼쪽/24차 오른쪽,1600ms·같은 위치·같은 단색배경. 기존 윗면의 끊긴 윤곽 완화,중앙 주름·촉수 형태 보존. 실제 게임 증거와 구분 |

MAP PRODUCTION REPORT — 24차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 유지.
LARGE: source/composites/overlap/repeated silhouette 유지. 원본에셋수정0.
MEDIUM: 기존 connections 유지,remaining holes 미변경.
GROUND: dry 피부막의 불규칙 윤곽 감쇠로 structure integration 보강,기존shadow·contamination 보존.
PLAYABLE: arenas/travel/breathing/threat 공간·충돌 유지,새장애물0.
LANDMARK: primary시체나무/secondary야영지·독구덩이/tertiary뿌리 유지.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 캐시버전1행,런타임문서·맵디테일·CHANGELOG에24차 동기화. unrelated touched 없음. tmp/ch1-pass24 백업·QA 및 captures/ch1_tissue_join24_20260927은 기존ignore.
GIT: 앞서 확인한 .git 쓰기권한 제한/승인후 셸생성오류로 커밋 미완료. 공유index·타작업 보존,push/deploy 없음.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및 COMBAT 촬영. 실제 촉수 상세와 전체보드 직접 확인: dry 피부막의 잘린 윤곽 감소,밑동·포복 유지. 전후 실게임은 서로 다른 실행이라 적·시간 불일치.
TECH QA: 자동31 PASS,mapUnchanged=true,사망UI error=null. 외부 Fonts3/Three.js2 차단5건,JS pageerror stack0,HTTP오류0. requestFailures13=외부5+인트로생략 ERR_ABORTED8. 청크56/56 ready,촬영시 visibleIds 모두 drawnIds 포함;전청크 seam 전수검수 아님. WASD 입력 시작(4020,7220)→끝(4022.70348,7222.70348),왕복 순변위로 전체종주·방향별 이동 검증 아님. 체력50ms보충/카메라iframes60,전투전 무적보충 해제. SIDE_R/POOL_DETAIL 각60RAF median16.7ms/p95 33.4ms,COMBAT90RAF median16.7ms/p95 50ms. headless1280×720녹화이며 전체 성능PASS 아님. 개발서버24차와 디스크byte 동일,갤러리HTTP200.
GIT 누적: 시작118→완료조회119개(동시작업 포함). 타작업 숨김/임의커밋 없음.
VISUAL VERDICT: RETOUCH — 피부막의 패치 경계 개선,전체 피부지면과 독구덩이의 큰 재질차는 잔여.
NEXT PASS: 넓은 공터의 반복 낙엽·독성 원화와 바닥 사이 큰 재질 연결 보완. 촉수23차 이동은 유지.

비교·움직임: <http://localhost:3333/captures/ch1_tissue_join24_20260927/index.html>.


## 25차: 독구덩이 원화의 명도별 바닥 접합 (2026-09-27)

큰 독구덩이 원화가 지면 위의 잘린 타원처럼 읽히는 경계를 보강한다. 밝은 바위를 비교적 보존하고,어두운 오염흙에는 더 넓은 알파 전이를 적용한다. 재질 분류 AI가 아니라 원본 명도를 사용하는 시각적 근사다.

| id / 항목 | 현행 수치·공식 |
|---|---|
| 대상 | groundSprite의 stage0 production m_c1gtoxicf 월드(6500,5460) 한 배치. 기존 제외조건·로딩·srcRect 폴백 유지 |
| 명도 | 색보정 전 원본RGB의 L=.299R+.587G+.114B. rock=clamp((L-35)/100,0,1) |
| 전이폭 | edgeSpan=24+32×(1-rock). L≤35이면56px,L≥135이면24px,그사이 선형. 기존21차의 고정18px 대체 |
| 알파 | f=min(1,d/edgeSpan),A'=A×f²×(3-2f). d는21차와 같은L1거리장/상한64. 단위는원본881×900픽셀. 밝은경계도최소24px 감쇠하며 완전 불변이라는 뜻 아님 |
| 보존 | 기존 보라색 제거RGB공식·내부거리≥64px·원본PNG·캐시크기881×900·배치·비율·충돌 유지. 작은pit22차/포복23차/피부막24차 유지. 신규에셋0/추가상주캐시0,기존3.0246734619140625MiB 재사용 |
| 비용 | 기존 최초 캐시 픽셀순회에 clamp·선형폭 계산만 추가. 프레임별픽셀처리0. 별도픽셀버퍼추가0 |
| 검사 | 실패 먼저 확인 후 darkRGB30의거리24px alpha<180,brightRGB160은alpha>240,거리100px 내부RGBA(30,30,30,255),원본byte보존 검사 PASS. 효과26+geometry5+구문1=32 PASS. 패키징검사 재실행 안함 |
| 비교 | tmp/ch1-pass25/before-after.png 동일 단색배경·같은 원본24차/25차 비교. 어두운테두리 감소,내부질감 보존. 실제게임검수와 구분 |

MAP PRODUCTION REPORT — 25차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 유지.
LARGE: source/composites/overlap/repeated silhouette 유지,원본이미지수정0.
MEDIUM: 독성원화와 지면의connection 국소보강,remaining holes 유지.
GROUND: 기존shadow/contamination 유지,명도별알파로structure integration 보강.
PLAYABLE: arenas/travel/breathing/threat 공간·충돌 유지,새장애물0.
LANDMARK: primary시체나무/tertiary뿌리 유지,secondary동측큰독구덩이 경계만 수정.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 캐시버전1행,맵문서8개/CHANGELOG25차 동기화. unrelated touched없음. tmp/ch1-pass25 백업·QA와 captures/ch1_toxic_join25_20260927은기존ignore.
GIT: 앞서확인한 .git 쓰기권한제한/승인후 셸생성오류로커밋미완료. 공유index·타작업보존,push/deploy없음.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및 COMBAT 촬영. POOL_DETAIL·전체보드 직접검수:외곽 어두운띠 감소,내부독액·바위 유지. 전후적·시간은 서로달라 완전동일프레임 비교아님.
TECH QA: 자동32 PASS,mapUnchanged=true,사망UI error=null. 외부 Fonts3/Three.js2 차단5,pageerror stack0,HTTP오류0. requestFailures11=외부5+인트로생략중단6. 청크56/56 ready,촬영시visibleIds 모두drawnIds 포함;전청크 seam 전수검수아님. WASD 시작(4020,7220)→끝(4022.79942,7222.79942),순차왕복 순변위이며 각방향/전체종주 증명아님. 체력50ms보충/카메라iframes60,전투전 무적보충해제. SIDE_R/POOL_DETAIL60RAF median16.7ms/p95 33.4ms,COMBAT90RAF median16.7ms/p95 33.5ms. headless1280×720녹화,전체성능PASS아님. 개발서버25차byte동일/갤러리HTTP200/원본PNG HEAD blob동일.
GIT 누적: 시작123→완료조회122개(동시작업포함). 임의숨김/타작업커밋없음.
VISUAL VERDICT: RETOUCH — 국소경계 연결개선. 원화와 바닥의 전체질감차·겹친구덩이윤곽은잔여.
NEXT PASS: 작은구덩이 앞턱의 중복윤곽·큰원화와 바닥의 재질밀도차 보완. 기존촉수포복·넓은전투면 유지.

비교: <http://localhost:3333/captures/ch1_toxic_join25_20260927/index.html>.


## 26차: 작은 독구덩이의 중복 반원 앞턱 제거 (2026-09-27)

22차 재질 위의 매끈한 앞턱 반원이 기존 찢어진 벽 윤곽과 겹쳤다. material 로드 상태의 앞턱만 동일한 불규칙 반경을 따르며 접촉선을 끊는다. 구덩이 수면/벽 깊이·collision 변경은 없다.

| id / 항목 | 현행 수치·동작 |
|---|---|
| 대상 | stage0 production pit_poison(6500,5580),material 로드 상태의 pitAtlas 앞턱만 |
| 경로 | j=0..48,t=j/48×π,squeeze=sin(phase-2t)×1.6,rough=1+.06sin(5t)+.035cos(9t). px=cos(t)×(99rough+squeeze),py=9+sin(t)×(73rough+.6squeeze). 외벽과 같은 비정형 반경 |
| 접촉선 | material에서 native setLineDash([13,7,5,11]),offset 기본0. rgba(36,28,26,.42),폭2. 기존 .9/4px의 매끈한 반원 대체 |
| 젖은 강조 | 동일dash 유지,Y-2px,rgba(143,125,91,.12),폭1. 기존 .14/1.6px 대체 |
| 폴백 | material 없으면rough1,py=9+sin(t)×73,dash없음,접촉 .9/4px,강조 .3/1.6px.25차native동일시점RGBA byte완전동일 확인 |
| 비용·보존 | 기존16프레임·1024²atlas/4MiB 내부 생성만 변경,추가캐시0. GPU프록시에는기존drawImage만 전달. 프레임별path연산0. 원본PNG·수면·유입2개·수축·좌표·collision 유지 |
| 검증 | 기존 효과26+geometry5+구문1=32 PASS. 단순선명암수정용 구현복제테스트 추가0. tmp/ch1-pass26/before-after.png 동일1600ms/같은원본·배경 비교에서 두번째반원 윤곽감소. 패키징재검사안함 |

MAP PRODUCTION REPORT — 26차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 유지.
LARGE: source/composites/overlap/repeated silhouette 유지,원본이미지변경0.
MEDIUM: 독구덩이 기존connection 유지,remaining holes 미변경.
GROUND: 작은pit 접촉선의중복윤곽감소로structure integration 보강. 기존shadow·contamination 유지.
PLAYABLE: arenas/travel/breathing/threat 공간·충돌 유지,새장애물0.
LANDMARK: primary시체나무/tertiary뿌리 유지,secondary동측작은구덩이 앞턱만 변경.
FILES: stage-owned ch1-living-detail.js. concurrent game.html 캐시버전1행,런타임·맵디테일·관련기획3문서·CHANGELOG 동기화. unrelated touched없음. tmp/ch1-pass26 백업·QA와 captures/ch1_pit_lip26_20260927은기존ignore.
GIT: 기존 .git 쓰기권한제한/승인후 셸생성오류로커밋미완료. 공유index·타작업보존,push/deploy없음.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및 COMBAT촬영. POOL_DETAIL·전체보드직접검수:앞턱 중복반원감소·수면깊이와기존큰원화유지. 전후는서로다른게임실행이라적·시간불일치.
TECH QA: 자동32 PASS,mapUnchanged=true,사망UI error=null. 외부 Fonts3/Three.js2 차단5,pageerror stack0,HTTP오류0. requestFailures12=외부5+인트로생략중단7. 청크56/56ready,촬영시visibleIds 모두drawnIds포함;전청크seam전수검수아님. WASD시작(4020,7220)→끝(4017.20084,7220),순차왕복순변위로각방향/전체종주증명아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. SIDE_R/POOL_DETAIL60RAF median16.7ms/p9533.4ms,COMBAT90RAF median16.8ms/p9550ms. headless1280×720녹화,전체성능PASS아님. 개발서버26차byte동일/갤러리HTTP200.
GIT 누적: 시작124→완료조회124개(동시작업포함). 임의숨김/타작업커밋없음.
VISUAL VERDICT: RETOUCH — 앞턱중복선개선,큰원화와바닥의재질밀도차·전체피부지면은잔여.
NEXT PASS: 반복낙엽과생체재질이따로보이는넓은공터의중간크기연결보강. 기존큰구도·포복·충돌유지.

비교: <http://localhost:3333/captures/ch1_pit_lip26_20260927/index.html>.

최종 diff --check: 이번효과·문서는통과. 공유game.html의타작업 보석필터버튼행14513/14516에trailing whitespace2건발견. 이번수정캐시버전행과무관하며타작업행은변경하지않음.


## 27차: 큰 늪 원화 내부의 실제 수면 흐름 (2026-09-27)

27차의 기포 수치·마스크 밖에는 기반만 표시한다는 설명은 당시 구현 이력이다. 현행28차는 기포 팽창/파열 수치를 대체하고,물 마스크 뒤에 가스를 추가하여 위쪽으로 벗어나도록 한다. 바위의 형태·위치는 계속 고정이다.

사용자 “큰 변화는 안 보이는데 늪 동적 움직임은 있는가” 교정. 26차까지 큰 m_c1gtoxicf는 정적이고 작은pit/주변기포만 움직였다. 이번부터 큰 원화 내부 수면4곳을 직접 움직인다. 원본PNG는 그대로이며 캐시된 수면영상만 위에 합성한다.

| id / 항목 | 현행 계약 |
|---|---|
| swamp API | Ch1LivingDetail.swamp(c,g,o,now,meta,img). game.html 기본 장식 렌더의 groundSprite 보정·filter/blend/alpha 적용 후 organic 이전 호출. true면 원래 정적스프라이트 분기 대체 |
| 대상·폴백 | stage0 production m_c1gtoxicf(6500,5460)만. bossArena/fieldRebuildQA·다른위치·이미지미로드/0크기·meta없음/srcRect/sheet/rot·o.rot·anchorBottom·pivotX/Y 있으면 false,기존렌더 유지 |
| 크기·반전 | size=(meta.sz 또는450)×(scale 또는1). sourceSize 또는 실제이미지 비율 사용. keepAR&&!squareDraw이면 dw=size×min(1,ar),dh=size×min(1,1/ar),그외 정사각형. meta.flip은 x반전. 원래 위치·alpha·filter/blend 문맥 보존 |
| 정적 기반 | 25차 경계보정이 끝난881×900 이미지를 먼저 그대로 그린다. 바위·외곽·가지와 마스크 밖 픽셀은 이 기반만 표시 |
| 수면 마스크 | 아래4개 원본881×900 좌표polygon을440×450에 축소. alpha<128을거리0으로하는 L1거리장,거리상한6. alpha×S(d/6),S(t)=t²(3-2t),윤곽안쪽6native px에서 페더 |
| 수면 왜곡 | 각frame의phase=f/16×2π. native y=0..449의4px띠마다 dx=4sin(phase-.065y)+2sin(2phase+.035y),dy=2cos(phase+.04y). 원본이미지를440×450으로샘플링하여 해당띠에만그린뒤 수면마스크 적용. dx최대±6native px/dy±2,바위좌표변형0 |
| 주기·프레임 | 6400ms,16프레임,phase=fract(now/6400)×16. 인접2프레임을 기존globalAlpha×(1-mix),×mix로 정적기반위에source-over 합성. 수면외곽은고정 |
| 기포 | 수면4곳×2개=8. 중심은polygon꼭짓점 산술평균을축소. k0=(-12,-8),k1=(15,7),q=(f/16+.23j+.47k)%1,r=2+6q. ellipse(r,.6r),몸체rgba(15,23,13,.48sinπq) |
| 기포 강조·파열 | 중심(-1,-1),ellipse(.8r,.45r),회전-.2,호3.3..5.9,rgba(181,172,99,.55sinπq),폭1.1. q>.65이면burst=(q-.65)/.35,파열ellipse(8+13burst,4+6burst),호.4..5.5,rgba(159,153,88,.28(1-burst)),폭.8 |
| 캐시·메모리 | swampCache WeakMap 이미지키. 새 atlas1760×1800(4×4셀,각440×450)/RGBA12.0849609375MiB. 종전합계69.69648361206055→81.78144454956055MiB(native산정,기타shadow/GPU제외). 임시mask/frame 각.75531005859375MiB,ImageData.75531005859375MiB,Uint8거리장.1888275146484375MiB. 캐시초기화때만생성 |
| 프레임 비용 | 기존정적1drawImage 대신 정적1+수면2=3drawImage. 매프레임pixel/path연산·atlas업로드없음. 최초생성비용·GPU메모리 별도 |
| 검사 | API미구현 실패 확인후 실제수면픽셀시간변화·바위영역불변·6400ms루프·동일시간재현·원본byte불변·상태불변·stage/위치/로드/srcRect폴백 검사. 효과27+geometry5+구문1=33PASS. 패키징검사재실행안함 |

| 수면 id | 원본881×900 polygon 좌표(순서대로 닫음) |
|---|---|
| 0 / 상부 | (225,145),(345,130),(434,142),(460,213),(494,269),(453,342),(390,370),(307,361),(268,310),(305,296),(250,253),(213,226) |
| 1 / 우중부 | (532,295),(584,316),(658,322),(693,365),(687,417),(638,445),(600,478),(541,477),(476,489),(423,470),(421,421),(464,388),(488,339) |
| 2 / 좌중부 | (186,397),(228,403),(302,416),(347,444),(362,503),(328,548),(266,548),(233,513),(188,510),(153,493),(165,444) |
| 3 / 하부 | (416,537),(475,524),(539,547),(574,582),(591,628),(557,660),(474,658),(421,635),(385,611) |

MAP PRODUCTION REPORT — 27차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 유지.
LARGE: source/composites/overlap/repeated silhouette 유지,원본PNG변경0. 큰늪 내부수면만동적합성.
MEDIUM: 기존connections/remaining holes 유지.
GROUND: 큰늪 수면4곳 흐름·기포8개. 기존shadow·contamination·경계접합 보존.
PLAYABLE: arenas/travel/breathing/threat 공간·충돌 유지,새장애물0.
LANDMARK: primary시체나무/tertiary뿌리 유지. secondary큰늪이정적원화에서국소동적수면으로변경. 바위고정.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 캐시버전·swamp호출분기,관련맵문서8개/CHANGELOG27차동기화. unrelated touched없음. tmp/ch1-pass27 백업·QA와 captures/ch1_swamp_flow27_20260927은기존ignore.
GIT: 기존 .git 쓰기권한제한/승인후 셸생성오류로커밋미완료. 공유index·타작업보존,push/deploy없음.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및 COMBAT촬영. SWAMP_DETAIL·전체보드직접검수. 별도같은원본·시간32프레임GIF(좌정적/우동적)와실게임24프레임GIF보존. 물무늬·기포이동,바위고정확인. 플레이어/적이일부수면가림.
TECH QA: 자동33PASS,mapUnchanged=true,사망UI error=null. probe/water-audit.json에서실제MAP_OBJS/_OBJ_META/groundSprite입력으로swamp used=true·object불변확인(meta.sz450,keepAR1,flip1). cachedDrawMs약.1ms 단일native샘플로초기생성비용이나GPU전체비용아님. 외부 Fonts3/Three.js2 차단5,pageerror stack0,HTTP오류0. requestFailures13=외부5+인트로생략중단8. 청크56/56ready,visibleIds 모두drawnIds포함;전청크seam전수검수아님. WASD시작(4020,7220)→끝(4020,7217.22268),순차왕복순변위로각방향/전체종주증명아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. SWAMP_DETAIL/SIDE_R/POOL_DETAIL 각60RAF와COMBAT90RAF 모두median16.7ms/p9533.4ms. headless1280×720녹화,전체성능PASS아님. 개발서버27차byte동일/갤러리HTTP200/원본PNG HEAD blob동일.
GIT 누적: 시작128→완료조회129개(동시작업포함). 임의숨김/타작업커밋없음.
VISUAL VERDICT: RETOUCH — 큰늪의동적수면은실제구현·게임활성화확인. 원화와바닥의재질차·전체피부지면은잔여.
NEXT PASS: 실제플레이배율에서수면흐름·기포의가독성을유지하며바닥재질접합보완. 큰늪전체회전/바위출렁임은적용하지않음.

움직임 비교: <http://localhost:3333/captures/ch1_swamp_flow27_20260927/index.html>.

최종diff --check 공유game.html의기존보석UI행 trailing whitespace 경고는 별도타작업으로분리. 이번맵효과/문서는아래전용검사로확인.


## 28차: 버블 팽창·파열과 늪 가스의 연동 (2026-09-27)

이 절의 버블 크기·돔 명암·파열 시작 반경은 28차 이력이다. 사용자 가독성 교정에 따라 현행 29차 값으로 대체한다. 가스·물방울·파열 시점은 유지한다.

사용자 요청: “늪이니까 가스가 올라오면서 버블이 터지고”. 큰늪8개 기포에 팽창→파열/물방울→같은자리 가스상승을 연결한다. 가스는 물마스크 밖 위쪽으로 올라가지만 캐릭터·전투렌더보다 아래에 합성된다. 피해·충돌을 주는 독가스 기믹은 아니다.

| id / 항목 | 현행 수치·공식 |
|---|---|
| 대상·주기 | 27차 swamp의 수면4곳×2개=8개 vent. 기존좌표·q=(f/16+.23j+.47k)%1·6400ms/16프레임 유지 |
| 팽창 | q<.6. swell=q/.6,r=2+6×swell²(3-2swell),appear=min(1,q/.08). ellipse 중심(bx,by-.25r),반경(r,.65r),몸체rgba(15,23,13,.58appear) |
| 버블 광택 | 중심(bx-1,by-.25r-1),반경(.8r,.45r),회전-.2/호3.3..5.9,rgba(181,172,99,.65appear),폭1.2 |
| 파열·잔물결 | q≥.6이면돔표시중단. burst=(q-.6)/.4,반경(8+18burst,4+8burst),호.4..5.5,rgba(159,153,88,.38(1-burst)),폭1 |
| 튀는 물방울 | .6≤q<.78,6개/파열. splash=(q-.6)/.18,angle=n/6×2π+.7j. px=bx+cos(angle)(4+14splash),py=by+sin(angle)(2+5splash)-8sin(πsplash). 타원반경(1.3,1.6)×(1-.5splash),rgba(154,151,85,.55(1-splash)) |
| 가스 시점 | paintSwampGas(c,bx,by,q,seed),q≤.6 또는q≥1이면그리지않음. p=(q-.6)/.4,opacity=sin(πp)^1.4×.5. seed=1.7j+k. 파열이전에는가스없음,주기끝완전소멸 |
| 가스 형태 | vent당3개부드러운lobes,인덱스n=0..2. x=bx+sin(4p+seed+n)(5+10p)+(n-1)7p,y=by-8-78p+6n,r=12+20p+2n. native축척(.85,1.3). 상향이동78native px/주기후반,좌우로흩어짐 |
| 가스 색·투명도 | alpha=opacity×[.9,.65,.45][n]. radial stop0 rgba(133,145,81,alpha),stop.5 rgba(89,104,56,.5alpha),stop1 rgba(46,59,35,0). 탁한황록색,가장자리완전투명 |
| 합성 순서 | 수면왜곡→버블/잔물결/물방울→수면마스크(destination-in)→가스(source-over)→기존atlas셀에저장. 가스는물가·바위위로지나갈수있으나바위형태를변형하지않음. 플레이어/전투는기존오브젝트뒤순서에서정상표시 |
| 자원·폴백 | 기존1760×1800/12.0849609375MiB atlas 재사용,추가상주캐시0·매프레임path/pixel작업0. 기존native합계81.78144454956055MiB(기타shadow/GPU제외)유지. stage/로드/메타폴백·원본·collision불변 |
| 테스트 | 신규실패확인후 가스파열전비표시/수면위상승/아래로침강없음/주기끝소멸검사. 기존루프·원본·바위·맵검사포함 효과28+geometry5+구문1=34PASS. 패키징재검사안함 |
| 시각 보정 | 초기 가스가수면무늬에묻혀최종 opacity.5·상승78·r12+20p+2n·축척.85/1.3으로보강. after는초기,final이현행캡처. 비교GIF는최종코드로재생성 |

MAP PRODUCTION REPORT — 28차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 유지.
LARGE: source/composites/overlap/repeated silhouette 유지,원본PNG변경0.
MEDIUM: 기존 connections/remaining holes 유지.
GROUND: 큰늪 수면4곳의버블8개 팽창→파열·물방울→탁한가스상승. 기존shadow·contamination·structure integration 유지.
PLAYABLE: arenas/travel/breathing/threat 공간·충돌유지,추가피해·장애물0. 가스는캐릭터뒤렌더.
LANDMARK: primary시체나무/tertiary뿌리 유지,secondary큰늪의부패가스만추가.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 캐시버전1행,맵문서8개/CHANGELOG28차동기화. unrelated touched없음. tmp/ch1-pass28 백업·QA와 captures/ch1_swamp_gas28_20260927은기존ignore.
GIT: 기존 .git 쓰기권한제한/승인후 셸생성오류로커밋미완료. 공유index·타작업보존,push/deploy없음.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및COMBAT촬영. 최종SWAMP_DETAIL·전체보드직접검수,동일조건32프레임전후GIF및실게임24프레임GIF보존. 파열후가스상승·기포시차확인,플레이어윤곽유지.
TECH QA: 최종자동34PASS,mapUnchanged=true,사망UI error=null. 최종errors11=외부Fonts3/Three.js2/CloudFront이미지4 차단9+보석에셋404 2. HTTP오류2:assets/gems/cursed_relics_1.png 및cursed_relics_2.png(타작업에셋,이번늪코드미수정). JS pageerror stack0. requestFailures17=외부9+인트로생략중단8. 청크56/56ready,visibleIds 모두drawnIds포함;전청크seam전수검수아님. WASD시작(4020,7220)→끝(4022.7807,7220),순차왕복순변위로각방향/종주증명아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. SWAMP_DETAIL/SIDE_R60RAF median33.2ms/p9533.4ms,POOL_DETAIL60RAF/COMBAT90RAF median16.7ms/p9533.4ms. headless1280×720녹화,전체성능PASS아님. 개발서버28차byte동일/갤러리HTTP200.
GIT 누적: 시작132→완료조회135개(동시작업포함). 타작업임의숨김/커밋없음.
VISUAL VERDICT: RETOUCH — 요청한버블파열·늪가스는적용·실게임확인. 전체지면재질통합은잔여.
NEXT PASS: 현재효과의실제플레이가독성유지,전체바닥재질연결보완. 가스의피해기믹은별도요청전추가하지않음.

움직임: <http://localhost:3333/captures/ch1_swamp_gas28_20260927/index.html>.


## 29차: 실제 게임에서 안 보이던 버블의 가독성 교정 (2026-09-27)

사용자 “버블 같은 건 안 보이는데” 교정. 원인은 기존 최대 반경8native px의 어두운 몸체·얇은 광택이 물 원화의 기포와 겹쳐 읽히지 않는 것이다. 코드 동작 유무 검사만으로 가시성을 보장하지 못했다. 450px 표시 크기의 동일시간 대조에서 버블 몸체 대비를 측정하고 실제 원화 위 전후를 검수한다.

| 항목 | 현행 수치·동작 |
|---|---|
| 팽창·유지 | q<.6 유지. swell=min(1,q/.46),r=3+13×swell²(3-2swell),appear=min(1,q/.08). 최대반경16native px/지름32. q=.46~.6에서최대크기유지,6400×.14=896ms. q=.6에서기존대로파열 |
| 몸체 위치 | cy=by-.32r,타원반경(r,.85r). 수면에서 솟은 돔 실루엣으로 표현 |
| 접촉 그림자 | 중심(bx,by+.2r),반경(1.12r,.42r),rgba(9,15,8,.55appear) |
| 돔 재질 | radial 시작(bx-.3r,cy-.35r,1),끝(bx,cy,1.05r). stop0 rgba(167,177,99,.95appear),.38 rgba(93,116,51,.95appear),.8 rgba(47,65,27,.94appear),1 rgba(19,29,14,.9appear) |
| 외곽선 | rgba(136,153,72,.7appear),폭1 |
| 광택 호 | 중심(bx-.08r,cy-.08r),반경(.78r,.62r),회전-.2,호3.4..5.7. rgba(208,210,137,.9appear),폭1.8 |
| 막 반사점 | 중심(bx-.25r,cy-.32r),반경(.24r,.13r),회전-.35. rgba(218,220,154,.55appear) |
| 파열 반경 | burst=(q-.6)/.4,ellipse(16+18burst,8+8burst). 기존8/4 시작반경을 커진 돔16/8에맞춤. 나머지28차선색·두께·물방울·가스 유지 |
| 가독성 회귀 | 원본대용RGB(21,26,18),표시450px,3200ms의상부vent ROI(147,97,36,30)에서G>65픽셀수:이전18→수정635. 최소130 회귀 기준. 실제사진원화 검수와구분하며전체시각품질점수로쓰지않음 |
| 검증 | 신규검사가이전18픽셀로실패하는것을먼저확인. 효과29+geometry5+구문1=35PASS. 바위·원본·루프·가스시점 검사포함. 패키징재검사안함 |
| 보존·자원 | 8vent/6400ms/16프레임/기존1760×1800atlas 유지,추가상주캐시0. 파열·가스시점 .6/기존collision·수면흐름 유지. 원본PNG수정0. 처리량증가는캐시최초생성시에만발생 |
| 반영 | game.html의모듈버전20260927-29. 이미열린게임은기존JS를메모리에유지하므로새로로드한페이지에서새효과가반영됨 |

MAP PRODUCTION REPORT — 29차

STAGE: CH1-1 production.
MASTER: silhouette/8regions/남북 main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 유지.
LARGE: source/composites/overlap/repeated silhouette 유지,원본변경0.
MEDIUM: 기존 connections/remaining holes 유지.
GROUND: 큰늪 버블의 몸체·접촉그림자·광택으로 가독성 보강. 기존 contamination/structure integration 유지.
PLAYABLE: arenas/travel/breathing/threat 공간·충돌유지,추가피해·장애물0.
LANDMARK: primary시체나무/tertiary뿌리 유지,secondary큰늪 버블의표시크기만교정.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 캐시버전1행,맵문서8개/CHANGELOG29차동기화. unrelated touched없음. tmp/ch1-pass29 백업·QA와 captures/ch1_bubble_readability29_20260927은기존ignore.
GIT: 기존 .git 쓰기권한제한/승인후 셸생성오류로커밋미완료. 공유index·타작업보존,push/deploy없음.

CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및COMBAT촬영. 실제SWAMP_DETAIL에서물무늬와분리된황록돔이보임을직접확인. 전체보드검수,실게임24프레임GIF와같은시간/배율32프레임전후GIF보존.
TECH QA: 자동35PASS,mapUnchanged=true,사망UI error=null. 외부리소스차단8,pageerror stack0,HTTP오류0. requestFailures15=외부8+인트로생략중단7. 청크56/56ready,visibleIds 모두drawnIds포함;전청크seam전수검수아님. WASD시작(4020,7220)→끝(4020,7214.45992),순차왕복순변위로각방향/종주증명아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. SWAMP_DETAIL/SIDE_R/POOL_DETAIL 각60RAF median16.7ms/p9533.4ms,COMBAT90RAF median16.7ms/p9550ms. headless1280×720녹화,전체성능PASS아님. 개발서버29차byte동일/갤러리HTTP200.
GIT 누적: 시작135→완료조회136개(동시작업포함). 타작업임의숨김/커밋없음.
VISUAL VERDICT: RETOUCH — 버블가독성은이전대비개선·실게임확인. 전체지면재질통합은잔여.
NEXT PASS: 실제사용자화면에서버블가독성을유지하며늪재질과의조화보완. 큰구도·수면·충돌유지.

실게임·전후영상: <http://localhost:3333/captures/ch1_bubble_readability29_20260927/index.html>.


## 30차: 버블 막 파열과 튀는 물방울을 분리한 빠른 동작 (2026-09-27)

사용자 “뽕 하고 터지는 게 안 보인다” 교정. 29차 돔은 커졌지만 물과 같은 16프레임/6400ms 캐시를 사용하여 자세 간격400ms로 파열이 희미하게 넘어갔다. 물·가스는 기존 속도를 유지하고 버블만64프레임으로 분리한다. 27~29차의 버블 프레임·물방울6개·합성순서·추가캐시0 설명은 당시 이력이며 현행은 아래 표가 대체한다. 29차 몸체·그림자·광택 재질은 유지한다.

| id / 적용 위치 | 현행 수치·공식 |
|---|---|
| 대상 | stage0 production의 m_c1gtoxicf(6500,5460). 수면4곳×2vent=8, polygon/좌표/위상offset=.23j+.47k 유지. 원본 PNG 변경0 |
| 함수 | paintSwampBubble(x,bx,by,q), swampVents, bubbleAtlas(), swampBubbleAtlas. 함수·캐시는 모듈 내부, 공개 API 추가0 |
| 버블 시간 | pose=fract(now/6400+offset)×64, b=floor(pose), bn=(b+1)%64. 두 자세를 기존 alpha×(1-blend),alpha×blend로 보간. 100ms 자세 간격. q=f/64로 베이크 |
| 최대 돔·긴장 | 29차 r=3+13×swell²(3-2swell),swell=min(1,q/.46),q<.6. .46~.54에서 최대크기 정지512ms; .54~.6의384ms는 tension=sin((q-.54)/.06×π), (bx,by) 기준 scale(1+.2tension,1-.3tension). 최대 가로1.2/세로.7 |
| 균열 | .57<q<.6,192ms. crack=min(1,(q-.57)/.03),3갈래 angle=n/3×2π-.8. (bx,cy)→(bx+cos(angle+.25)×.38r,cy+sin(angle+.25)×.3r)→(bx+cos(angle)×.78r,cy+sin(angle)×.65r). rgba(14,24,10,.9crack),폭1.8 |
| 잔물결 | .6≤q<.78,1152ms. ripple=(q-.6)/.18,ellipse(16+26ripple,8+12ripple),호.2..6,rgba(185,184,107,.75(1-ripple)),폭1.8 |
| 막 파열 | .6≤q<.66,384ms. tear=(q-.6)/.06,outer=16+18√tear,inner=13+8tear,lift=12sin(πtear). 8갈래 angle=n/8×2π+.2, p(a,r)=(bx+cos(a)r,by+.65sin(a)r-lift). path p(angle-.15,inner)→quadratic p(angle-.08,.9outer),p(angle,outer)→quadratic p(angle+.08,.9outer),p(angle+.15,inner)→close |
| 파열 재질 | 채움 rgba(129,151,64,.9(1-tear)),테두리 rgba(211,214,133,.9(1-tear)),폭1.6. 빈 중심 ellipse(11(1-tear),5(1-tear)),rgba(7,16,7,.7(1-tear)) |
| 물방울 | .6≤q<.72,768ms,8개. flight=(q-.6)/.12,angle=n/8×2π+.25,distance=14+25flight. x=bx+cos(angle)distance,y=by+.5sin(angle)distance-18sin(πflight). 반경(2.6,3.4)×(1-.6flight),회전angle,rgba(179,189,98,.95(1-flight)) |
| 소멸 | q≥.78에서 버블·파열·잔물결 완전비표시. 다음 주기 시작에서 다시성장. 가스는28차 공식을 유지하고 .6~1에서 상승·소멸 |
| 합성 | 원본기반→물마스크적용 수면+가스의16프레임atlas→별도 버블64프레임atlas. 파열물방울은 물마스크로 잘리지 않고 물가 밖까지 튈 수 있음. 캐릭터·전투 뒤, 바위형태 불변 |
| 캐시 | 버블 cell96×96, 중심(48,64),8×8배치768×768 RGBA=2.25MiB. 셀별clip으로 이웃침범방지. 물·가스1760×1800/12.0849609375MiB 유지. native 합계84.03144454956055MiB(기타 shadow/GPU/임시베이크 제외) |
| 프레임 비용 | 기존3drawImage→최대19회(기반1+물가스2+8vent×2). path/pixel 작업은 캐시 생성시에만, 매프레임 vent 위상8개와 drawImage 추가. 무비용 보강으로 보고하지 않음 |
| 검사 | 신규 막파열 외측픽셀/직전눌림/파열후소멸 검사 RED→GREEN. 효과30+geometry5+인라인구문1=36PASS. 기존 루프·원본·바위·폴백 검사 포함. 패키징 재검사 안함 |
| 반영 | game.html 모듈버전20260927-30. 이미 열린 게임은 새로 로드해야 최신 모듈을 사용 |


MAP PRODUCTION REPORT — 30차

STAGE: CH1-1 production, 큰늪의 버블 파열 가독성 교정.
MASTER PLAN: silhouette/8regions/남북 main route/side spaces 보존.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경0.
LARGE: source/composites/overlap/repeated silhouette 유지. 원본 prop_g_toxic.png HEAD blob과 현재 hash 9367ee29021977d792c533310d9cfe5d60b14595 동일.
MEDIUM CONNECTION: 기존 connections/remaining holes 변경0.
GROUND CONNECTION: 버블 직전 눌림·균열, 막 파열·물방울 확대. 기존 shadow/contamination/structure integration 보존.
PLAYABLE/COMBAT: arenas/travel/breathing/threat 공간·collision 유지, 추가 피해·장애물0.
LANDMARK/CENTER: primary시체나무/tertiary뿌리 유지,secondary큰늪의 국소 동작 교정.
CAMERA QA: 기본 START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및 SWAMP_DETAIL/TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL. 실게임72프레임GIF의 연속 contact sheet에서 4→5→6,15→16→17번 등의 눌림→막파열→물방울/잔물결 확인. 단독 자세표와 원본450px/50ms/128프레임 전후GIF 별도 보존.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 캐시버전1행,맵문서8개/CHANGELOG 동기화. unrelated 변경0. tmp/ch1-pass30 백업과 captures/ch1_bubble_pop30_20260927 검수자료는 기존ignore.
GIT: .git 쓰기권한제한 및 기존 승인 후 셸 생성오류로 커밋 미완료. 재확인에서도 명시한 PowerShell 경로 대신 stale WindowsApps pwsh를 호출하며 CreateProcessW -1073283067. 공유index·타작업 보존, push/deploy없음. 코드+docs 함께 커밋할 후속 작업 남음.
VISUAL VERDICT: RETOUCH — 요청한 버블 파열은 실제 게임에서 구분됨. 전체 지면 재질 통합은 잔여이며 이번 국소 파열 교정을 전체 맵 PASS로 보고하지 않음.
NEXT PASS: 사용자 플레이 화면에서 파열 가독성 확인 유지, 전체 바닥 재질 연결 보완. 큰 구도·수면·collision 유지.

실게임·전후영상: <http://localhost:3333/captures/ch1_bubble_pop30_20260927/index.html>.


TECH QA (30차 최종): verify/runtime.json 기준 효과30+geometry5+구문1=36PASS. mapUnchanged=true(별도draw3회 불변검사이며 cpuP95 필드는3표본으로 성능지표에 사용하지 않음). 사망UI error=null. JS pageerror stack0,HTTP오류0. 외부Fonts3/Three.js2/CloudFront1 네트워크차단6; requestFailures15=외부6+인트로생략중단9. 청크56/56ready,visibleIds 모두drawnIds포함;전청크seam전수검수아님. WASD왕복 시작(4020,7220)→끝(4017.24894,7214.49788),각방향/전체경로종주 증명아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. SWAMP_DETAIL/SIDE_R/POOL_DETAIL 각60RAF median16.7ms/p9533.4ms,COMBAT90RAF median16.8ms/p9533.4ms. headless1280×720녹화 조건,전체성능PASS아님. 최초after 촬영은72프레임GIF·12카메라가저장됐으나최종JSON미저장되어verify로카메라/전투/오류기록재검수,verify가최종기술근거. 전체보드 직접검수. 개발서버30차byte동일/갤러리HTTP200,효과·테스트·맵문서diff --check PASS.
GIT 누적 (30차): 시작136→중간140→완료조회140개(동시작업포함). 타작업 임의숨김/삭제/커밋0. 자동예약정리 재등록0.


## 31차: 큰늪 윤곽을 따라 번지는 젖은 흙 접지 (2026-09-27)

30차 버블 파열을 사용자가 승인한 뒤 다음 디테일 작업. 큰 원화의 돌 가장자리가 주변 바닥에서 분리되어 보이는 국소 접합을 보완한다. 불규칙한 원본 알파 윤곽에서 바깥으로 젖은 흙색을 감쇠시켜 연결한다. 바닥 전체 교체나 새로운 장애물·오브젝트 배치가 아니다. 30차 버블·가스·물 흐름은 그대로 유지한다.

| id / 항목 | 현행 수치·공식·적용 위치 |
|---|---|
| 대상 | 기존 swamp 전용 m_c1gtoxicf(6500,5460),stage0 production. 기존 stage/좌표/로드/crop/rotation/pivot 폴백 계약 유지 |
| 내부 함수 | swampApron(img). 입력은 groundSprite로 보정된 원화. source PNG를 수정하지 않고 캐시 생성시에만 픽셀 처리 |
| 규격 | 512×512 RGBA,입력 drawImage(img,36,31,440,450). 중심은 원본 기준(256,256),원본 여백 X36/Y31 |
| 실루엣 거리 | alpha>80인 픽셀을d=0,나머지28. 전진/후진2패스 L1 거리,상한28. x/y 이웃+1의 최소값. 원본alpha형상을 따르며 원형/타원형 그림자 stamp 아님 |
| 외측 감쇠 | edge=1-d/28,fade=edge²(3-2edge). 외측 최대28native px,끝alpha0. 여백보다작아 canvas 사각 테두리노출없음 |
| 흙결 | grain=.76+.14sin(.19x+2sin(.11y))+.1sin(.31y-.09x). 시간·random 미사용,항상같은정적질감 |
| 젖은 흙색 | damp=.5+.5sin(.043x+2sin(.027y)). RGB=(27+10damp,28+10damp,19+4damp). alpha=round(255×.48×fade×grain),alpha0이면RGB도0 |
| 합성 | swamp의save/위치이동/기존flip 이후,원본기반 이전에 한 번 그린다. drawImage(apron,-dw/2-36dw/440,-dh/2-31dh/450,512dw/440,512dh/450). 기존globalAlpha 상속,추가filter/blend없음 |
| 캐시·비용 | 기존swampCache의값에apron 추가,원화별512²×4=1MiB. 기존30차native합계84.03144454956055→85.03144454956055MiB(기타shadow/GPU/임시베이크제외). swamp 최대19→20drawImage. 최초생성2패스거리/픽셀작업,매프레임1drawImage만추가 |
| 검증 | 원본바깥접지픽셀존재·외측감쇠·canvas상단/좌측완전투명·입력byte보존 신규검사 RED→GREEN. 기존버블파열·수면·바위고정·루프·폴백 포함 효과31+geometry5+인라인구문1=37PASS. 패키징미재검사 |
| 반영 | game.html 모듈버전20260927-31. 원본PNG·버블64프레임·수면가스16프레임·6400ms주기·좌표·collision변경0 |


MAP PRODUCTION REPORT — 31차

STAGE: CH1-1 production,기존 늪 가장자리의 국소 접지.
MASTER: silhouette/8regions/남북 main route/side spaces 보존.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경0.
LARGE: 기존 source assets/composites/overlap/repeated silhouette 유지. 원본PNG HEAD hash와현재 9367ee29021977d792c533310d9cfe5d60b14595 동일.
MEDIUM: 기존 connections/remaining holes 유지,새오브젝트0.
GROUND: shadow·contamination을원본alpha윤곽과연결하는젖은흙층 추가. 외곽28native px의약한전이. structure integration 국소보강,전체피부바닥완성아님.
PLAYABLE: main arenas/travel/breathing/threat 공간과collision보존. 플레이어·적·투사체·전투효과와접지색분리확인.
LANDMARK: primary시체나무/secondary큰늪/tertiary뿌리 위계유지. secondary늪의바닥연결만수정.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및COMBAT. 실제SWAMP_DETAIL·전체보드직접검수. 30차버블파열 유지. 동일원화·시간·크기의별도비교이미지는캡처바닥일부에재합성한자료이며실제게임촬영과구분.
TECH QA: 효과31+geometry5+구문1=37PASS. 기존입출구·나무우회·POI경로/collision검사PASS. 별도draw3회 mapUnchanged=true,해당3회 cpuP95필드는성능지표로사용하지않음. JS pageerror stack0,HTTP오류0. 외부리소스차단6,requestFailures14=외부6+인트로생략중단8. 사망UI error=null. 청크56/56ready/visibleIds 모두drawnIds포함,전청크seam전수검수아님. SWAMP_DETAIL/SIDE_R/POOL_DETAIL60RAF 및COMBAT90RAF median16.7ms/p9533.4ms. headless1280×720녹화조건,전체성능PASS아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. WASD왕복(4020,7220)→(4020,7222.79266),전경로종주증명아님. 개발서버31차byte동일/갤러리HTTP200.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 모듈버전1행,맵문서8개+CHANGELOG동기화. unrelated변경0. tmp/ch1-pass31백업/검수와captures/ch1_swamp_ground31_20260927은기존ignore.
GIT: staged공유index보존,commit미완료(.git쓰기제한/기존승인후Windows셸생성오류),push/deploy없음. 코드+docs함께커밋할후속작업남음. 변경누적시작142/완료142개,타작업임의숨김·삭제·커밋없음.
VISUAL VERDICT: RETOUCH — 늪의외곽접지는소폭개선,전체바닥재질과랜드마크통합은잔여. 기술검사PASS를전체맵시각PASS로대체하지않음.
NEXT PASS: 동측늪주변오염과기존생체지면의넓은재질전이검토. 기존큰구도·버블가독성·전투공간유지.

검수: <http://localhost:3333/captures/ch1_swamp_ground31_20260927/index.html>.


## 32차: 동측 생체 지면에서 늪으로 이어지는 재질 전이 (2026-09-27)

31차 국소 접지를 사용자 승인 후,넓은 동측 지면의 조직색과 오염색 연결을 보강한다. 20차 동측 영역의 폭·팔레트·마스크는 아래 값으로 대체하며 서측/중앙 영역은 보존한다. 장애물·geometry·collision·늪 버블/가스/물 흐름은 변경하지 않는다.

| id / 항목 | 현행 수치·공식·적용 위치 |
|---|---|
| SIDE_R / skinRegions variant1 | 중심(6060,5460),tile(151.5,136.5)유지. 폭1200→1440,높이800. 표시bounds X5340..6780/Y5060..5860. 픽셀bounds는투명여백포함,충돌범위아님 |
| 재질 색 | variant1 팔레트 #3a3034/#424237/#303829. createLinearGradient(0,256,768,256),stop0/.45/1. 서쪽회갈색조직→중간괴사흙→동쪽녹갈색오염. variant0/2의기존팔레트·(0,0,180,512)gradient유지 |
| 얕은 연결주름 | variant1만3줄. [sx,sy,cx,cy,ex,ey,width]=[245,192,455,215,691,273,12];[330,358,495,307,715,319,9];[432,120,556,161,678,230,7]. move(sx,sy)→bezier(cx,sy,cx,cy,ex,ey) |
| 주름 명암 | 본선rgba(24,26,19,.16),폭각12/9/7native px. y-2상면선rgba(120,112,84,.12),폭1.1. 최초베이크에서기존세부주름23개뒤/알파마스크전에추가. 움직이는촉수나벽아님 |
| 늪방향 마스크 | 기존3lobes에 variant1만[670,270,94,142]추가. 각좌표 [x,y,rx,ry],기존variant중심오프셋(variant-1)×18은variant1에서0. 기존radial stop .12부터/.48/1,alpha .88/.75/0 유지. 외곽x764에서완전감쇠하여768px사각경계가노출되지않음 |
| 합성·비용 | 기존 regionalSkin 768×512 RGBA캐시재사용,최대3장4.5MiB유지. frame alpha .6,영역당1drawImage·culling·surfaceOnly제외유지. 추가상주캐시0/추가프레임draw0. 총native85.03144454956055MiB 유지(기타shadow/GPU/임시제외) |
| 검증 | 동측마스크(680,270)alpha>150,끝(767,270)alpha<4,동일캐시재사용신규회귀RED→GREEN. 효과32+geometry5+구문1=38PASS. 기존타stage/화면밖/surfaceOnly/버블파열/접지·원본검사포함. 패키징미재검사 |
| 반영 | game.html 모듈20260927-32. 30차버블/31차늪접지와기존전체맵공간유지 |


MAP PRODUCTION REPORT — 32차

STAGE: CH1-1 production,동측지면→늪의낮은대비재질연결.
MASTER: silhouette/8regions/main route남북/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경0.
LARGE: source assets/composites/overlap/repeated silhouette 유지,기존원본에셋변경0.
MEDIUM: 기존connections/remaining holes유지. 새오브젝트0.
GROUND: 기존shadow보존. 동측contamination색상전이와얕은주름3줄로structure integration보강. 기존31차늪접지연결.
PLAYABLE: main arenas/travel/breathing/threat 공간·collision유지. 캐릭터·적·투사체·전투색분리보존. 바닥의낮은대비변화이며입체장애물추가없음.
LANDMARK: primary시체나무/secondary늪/tertiary뿌리위계유지,secondary주변지면만연결.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/POOL_DETAIL/AUTHORED_POOL 및COMBAT촬영. SIDE_R/SWAMP_DETAIL/전체보드직접검수. 재질비교이미지는단색바탕에native캐시표시이며실제게임촬영과구분.
TECH QA: 효과32+geometry5+구문1=38PASS. 경로·충돌보존검사PASS,mapUnchanged=true(draw3회,해당cpuP95필드는성능지표로사용안함). JS pageerror stack0/HTTP오류0/외부차단6. requestFailures16=외부6+인트로중단10. 사망UI error=null. 청크56/56ready/visibleIds모두drawnIds포함,전청크seam전수검수아님. SWAMP_DETAIL/SIDE_R/POOL_DETAIL60RAF median16.7ms/p9533.4ms,COMBAT90RAF median16.7ms/p9550ms. headless1280×720녹화,전체성능PASS아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. WASD왕복시작·끝약(4020,7220),순변위0으로개별방향이나전체경로종주를증명하지않음.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 모듈버전1행/맵문서8개+CHANGELOG동기화. unrelated변경0. tmp/ch1-pass32백업·QA/captures/ch1_east_transition32_20260927은기존ignore.
GIT: staged공유index보존,commit미완료(.git쓰기제한/기존승인후셸생성오류),push/deploy없음. 코드+docs함께커밋후속남음. 변경누적시작143→완료144개(동시작업포함),타작업숨김·삭제·강제커밋0.
VISUAL VERDICT: RETOUCH — 동측조직/늪색연결은소폭개선. 전체맵의피부지면·원화재질통합은잔여,자동PASS와구분.
NEXT PASS: 서측야영지주변의재/그을음과기존생체지면접합검토. 기존손동작·넓은전투면보존.

검수: <http://localhost:3333/captures/ch1_east_transition32_20260927/index.html>.


## 33차: 서측 야영지의 재·그을음 접지 (2026-09-27)

32차 승인 후 다음 디테일. 원본 야영지의 하부 알파 윤곽을 따라 얇은 회갈색 재·그을음을 합성한다. 움직이는 손3개,화로/상자/천막 원본,전체맵 공간은 보존한다. 원본하부와기존바닥사이의국소연결이며넓은서측전체피부지면교체가아니다.

| id / 항목 | 현행 수치·공식·적용 위치 |
|---|---|
| 대상 | organic의기존stage0 production범위 내 m_c1camp(1820,4020),authored tile(45,100),scale1.55. 다른좌표camp는기존렌더. 로드/srcRect/타stage폴백유지 |
| 내부 함수 | campGround(img),campHands의cached.ground에최초대상표시시캐시. 공개API추가0 |
| 규격 | 512×400 RGBA. 원본880×663을(36,32)에440×331.5로그린뒤알파윤곽거리계산 |
| 거리 | 원본축소alpha>80이면d0,그외22. 전진/후진2패스 L1 이웃+1 최소,상한22. edge=1-d/22,fade=edge²(3-2edge). 실루엣외측최대22native px에서소멸 |
| 하부 제한 | lower=clamp((y-140)/120,0,1). 하부가중치lower²(3-2lower). y≤140은완전투명,y≥260은최대. 천막상부가평면재얼룩으로나오지않도록제한 |
| 재·그을음 질감 | grain=.72+.18sin(.31x+2sin(.13y))+.1cos(.47y-.17x). ash=.5+.5sin(.073x+3cos(.041y)). RGB=(30+25ash,27+23ash,26+18ash). alpha=round(255×.46×fade×lower²(3-2lower)×grain). alpha0이면RGB0. 시간/random미사용 |
| 합성 | 기존campHands의body직전. dx=o.x-dw/2,dy=o.y-dh/2. drawImage(ground,dx-36dw/440,dy-32dh/331.5,512dw/440,400dh/331.5). 기존sprite의tone/globalAlpha상속,손3개는body이후기존대로합성 |
| 자원 | 512×400×4=0.78125MiB추가. camp4.391345977783203→5.172595977783203MiB. 전체native85.03144454956055→85.81269454956055MiB(기타shadow/GPU/임시베이크제외). 대상camp매프레임1drawImage추가,최초생성에만거리/픽셀처리 |
| 검사 | 신규하부접지픽셀/위쪽완전투명/바깥감쇠/하단테두리투명/원본byte보존 RED→GREEN. 손3개동작과팔/화로고정보존기존검사포함 효과33+geometry5+구문1=39PASS. 패키징미재검사 |
| 반영 | game.html 모듈20260927-33. 원본PNG·맵좌표·collision·기존늪효과·동측지면변경0 |


MAP PRODUCTION REPORT — 33차

STAGE: CH1-1 production,서측야영지하부재·그을음접지.
MASTER: silhouette/8regions/남북main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes변경0.
LARGE: 원본source assets/composites/overlap/repeated silhouette보존.
MEDIUM: 기존connections/remaining holes유지,새오브젝트0.
GROUND: 원본하부윤곽에맞는재·그을음색접지로shadow/contamination/structure integration국소보강. 상부천막평면얼룩제외.
PLAYABLE: main arenas/travel/breathing/threat공간·collision유지. 야영지촬영에서캐릭터/적/공격예고구분유지. 손·화로일부는전투중몬스터에정상가림. COMBAT촬영의붉은사각VFX잔여는이번접지범위밖이며전체시각PASS로보지않음.
LANDMARK: primary시체나무/secondary야영지·늪/tertiary뿌리위계유지. 야영지손3개동작보존.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/POOL_DETAIL/AUTHORED_POOL 총13시점및COMBAT촬영. CAMP_DETAIL/전체보드직접검수. 동일원화/1800ms포즈/660px비교는단색배경렌더이며실게임촬영과구분.
TECH QA: 효과33+geometry5+구문1=39PASS. 기존경로·충돌검사PASS. mapUnchanged=true(draw3회,해당cpuP95필드는성능지표로사용하지않음). JS pageerror stack0/HTTP오류0/외부차단6;requestFailures15=외부6+인트로생략중단9. 사망UI error=null. 청크60/60ready,visibleIds모두drawnIds포함,전청크seam전수검수아님. SWAMP_DETAIL/SIDE_R/CAMP_DETAIL/POOL_DETAIL60RAF median16.7ms/p9533.4ms,COMBAT90RAF median16.7ms/p9549.9ms. headless1280×720녹화,전체성능PASS아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. WASD왕복(4020,7220)→(4022.70062,7222.70062),개별방향/전경로종주증명아님.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 모듈버전1행/맵문서8개+CHANGELOG동기화. unrelated변경0. tmp/ch1-pass33백업·QA/captures/ch1_camp_ground33_20260927은기존ignore.
GIT: staged공유index보존,commit미완료(.git쓰기제한/기존승인후셸생성오류),push/deploy없음. 코드+docs함께커밋후속남음. 시작146→완료조회147개(동시작업포함),타작업임의숨김·삭제·강제커밋0.
VISUAL VERDICT: RETOUCH — 하부접지는국소개선,야영지전체바닥재질·맵전체통합잔여. 자동PASS와전체시각완성구분.
NEXT PASS: 야영지앞빈바닥과기존뿌리주변의넓은재질전이검토,손동작·전투공간보존.

검수: <http://localhost:3333/captures/ch1_camp_ground33_20260927/index.html>.


## 34차: 야영지 앞 바닥과 뿌리의 넓은 재질 연결 (2026-09-27)

33차 하부접지 승인 후,야영지 앞 전투면에 재색흙→괴사피부색의 정적 지면 전이를 추가한다. 소품이나충돌을추가하지않으며,기존손동작·늪효과·서측/동측/중앙피부막을보존한다. 20차/32차의regionalSkin최대3장/4.5MiB는당시이력이며현행최대4장/6MiB로대체한다.

| id / 항목 | 현행 수치·공식·적용 위치 |
|---|---|
| CAMP_FRONT / skinRegions variant3 | tx46/ty107,world중심(1860,4300),표시960×640. bounds X1380..2340/Y3980..4620. 투명여백포함시각범위,collision변경없음 |
| 재질 | palette #302d2c/#47403c/#3a3035. createLinearGradient(384,0,384,512),stop0/.45/1. 상부재색흙→중간회갈색재→하부괴사피부. native768×512 |
| 바탕질감 | 기존regionalSkin규칙의얼룩28개/세부9500개/짧은주름23개유지. variant3 seed=1397+3×971=4310으로별도결. 시간·Math.random미사용,고정정적캐시 |
| 연결주름3줄 | [sx,sy,cx,cy,ex,ey]=[185,178,280,245,370,386];[310,168,385,246,558,320];[456,204,517,293,490,416]. move(sx,sy)→bezier(cx,sy,cx,cy,ex,ey). native폭5/rgba(26,22,25,.2). 상면(-1,-1)이동,폭1/rgba(133,117,105,.16) |
| 비대칭마스크 | variant3전용[x,y,rx,ry]=[300,220,280,180],[500,290,190,145],[340,365,200,120]. variant중심오프셋0. 기존radial시작반경.12/끝1,stop0/.48/1,alpha.88/.75/0. 사각경계전에감쇠 |
| 합성·캐시 | 기존draw의오브젝트전지면패스. alpha=.6×기존globalAlpha,화면밖culling,surfaceOnly제외,stage0 production한정. 추가RGBA1장768×512=1.5MiB,지역캐시합계6MiB,전체native87.31269454956055MiB(기타shadow/GPU/임시제외). 보이는동안1drawImage추가,최초베이크후프레임path/pixel작업0 |
| 회귀검사 | 캠프전면중앙픽셀표시/1700ms후byte동일/surfaceOnly비표시/stage1비표시 RED→GREEN. 기존손·화로·늪·경로보존포함 효과34+geometry5+구문1=40PASS. 패키징미재검사 |
| 반영 | game.html 모듈20260927-34. 원본PNG·오브젝트배치·collision·기존생체동작변경0 |


MAP PRODUCTION REPORT — 34차

STAGE: CH1-1 production,야영지전면재색흙·괴사조직전이.
MASTER: silhouette/8regions/남북main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes변경0.
LARGE: source assets/composites/overlap/repeated silhouette보존,원본PNG변경0.
MEDIUM: 기존connections/remaining holes유지,새오브젝트0.
GROUND: 기존33차shadow/contamination접지에서야영지앞빈바닥으로색과주름연결. 구조물주변좁은외곽과넓은지면을연속화.
PLAYABLE: main arenas/travel/breathing/threat공간·collision유지. 넓은전투면과캐릭터/적/공격예고의대비확인. 낮은지면전이이며장애물추가없음.
LANDMARK: primary시체나무/secondary야영지·늪/tertiary뿌리위계유지. 손3개동작보존.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/POOL_DETAIL/AUTHORED_POOL 총13시점및COMBAT. CAMP_DETAIL을(46,107)로옮겨전면검수. 이전33차모듈라우팅before와34차verify의동일카메라직접비교,전투시간/적상태는상이. 전체보드직접검수.
TECH QA: 효과34+geometry5+구문1=40PASS,기존경로/충돌보존검사PASS. mapUnchanged=true(draw3회,해당cpuP95는성능지표아님). verify JS pageerror stack0/HTTP오류0/외부차단6;requestFailures13=외부6+인트로중단7. 사망UI error=null. 청크60/60ready,visibleIds모두drawnIds포함,전청크seam전수검수아님. SWAMP60RAF median16.8/p9533.4ms,SIDE_R33.2/33.4,CAMP/POOL33.3/33.4,COMBAT90RAF33.3/50. headless1280×720녹화,전후검수프로세스일부동시실행으로전체성능PASS/단독성능회귀판정불가. before HTTP오류0/외부차단6,camp median33.3/p9533.4ms. 체력50ms보충/카메라iframes60,전투전무적보충해제. WASD왕복(4020,7220)→(4025.37004,7225.37004),전경로종주증명아님.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 모듈버전1행/맵문서8개+CHANGELOG동기화. unrelated변경0. tmp/ch1-pass34백업·QA/captures/ch1_camp_foreground34_20260927은기존ignore.
GIT: staged공유index보존,commit미완료(.git쓰기제한/기존승인후셸생성오류),push/deploy없음. 코드+docs동반커밋후속남음. 시작148→완료조회148개(동시작업포함),타작업임의숨김·삭제·강제커밋0.
VISUAL VERDICT: RETOUCH — 야영지전면의바닥연결개선,전체맵피부재질·독립소품접합잔여. 자동PASS와전체맵시각승인구분.
NEXT PASS: 야영지앞뼈무더기와잔해의바닥접지검토. 기존넓은전투면·손동작보존.

검수: <http://localhost:3333/captures/ch1_camp_foreground34_20260927/index.html>.


## 35차: 야영지 앞 뼈·무기 잔해의 하부 접촉 그림자 (2026-09-27)

34차 전면지면 승인 후,원본알파를따르는얇은그림자로소형잔해의바닥접촉을보강한다. 지정3개만적용하며다른배치/챕터에는전파하지않는다. 높은해골장대의상부실루엣은평면그림자에서제외한다.

| id / 항목 | 현행 수치·공식·적용 위치 |
|---|---|
| 대상3개 | m_c1sbone(1940,4340),m_sword_pile(1580,4180),m_wpile(2060,4220). 각각authored tile(48,108)/(39,104)/(51,105). 기존좌표·scale·collision유지 |
| 진입 | Ch1LivingDetail.shadows의stage0 production가드후exact type+좌표확인. 이미지로드/메타필수. srcRect/sheet/meta.rot/o.rot/anchorBottom/pivotX/pivotY 있으면접지생략,기존sprite유지 |
| 내부캐시 | debrisContact(img),debrisContactCache WeakMap. 원본을(32,32)에192×192로베이크한256×256RGBA. 원본픽셀수정0 |
| 거리감쇠 | alpha>80→d0,그외12. 전진/후진2패스L1이웃+1최소,상한12. e=1-d/12,edge=e²(3-2e) |
| 상부제외 | t=clamp((y-128)/64,0,1),가중치t²(3-2t). y≤128완전투명,y≥192최대. 바닥닿는하부만표시 |
| 색·결 | RGB(29,24,24),grain=.82+.18sin(.37x+2cos(.21y)). alpha=round(255×.56×e²(3-2e)×t²(3-2t)×grain). alpha0이면RGB0. 시간/random미사용 |
| 원본정렬 | size=(meta.sz또는200)×(o.scale또는1). source=meta.sourceSize또는원본폭높이,ar=w/h. keepAR&&!squareDraw면dw=size×min(1,ar),dh=size×min(1,1/ar),그외dw=dh=size. meta.flip반영 |
| 표시 | translate(o.x,o.y),기존alpha상속. drawImage(tex,-dw/2-32dw/192,-dh/2-32dh/192,256dw/192,256dh/192). 객체전그림자패스. camera기준hw+dw/hh+dh밖culling |
| 비용 | 객체이미지당256²RGBA=.25MiB,대상3개최대.75MiB추가. 전체native88.06269454956055MiB(기타shadow/GPU/임시제외). 화면내대상당1drawImage추가,픽셀/거리작업은최초캐시생성만 |
| 검사 | 하부픽셀/상부완전투명/좌표1941미적용/타stage미적용/원본byte보존 RED→GREEN. 기존손·늪·지면·경로검사포함 효과35+geometry5+구문1=41PASS. 패키징미재검사 |
| 반영 | game.html 모듈20260927-35. 기존34차지면/33차야영지하부/손동작·소품원본·배치·collision보존 |


MAP PRODUCTION REPORT — 35차

STAGE: CH1-1 production,야영지뼈·무기잔해3개접지.
MASTER: silhouette/8regions/남북main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes변경0.
LARGE: source assets/composites/overlap/repeated silhouette보존,원본PNG변경0.
MEDIUM: 기존connections/remaining holes유지,새오브젝트0.
GROUND: 원본하부알파를따르는접촉shadow로34차지면과잔해의structure integration보강. 기존contamination보존. 높은장대의상부평면그림자제외.
PLAYABLE: main arenas/travel/breathing/threat공간·collision유지. 캐릭터·적·공격예고대비보존. 지면상부만낮은대비보강.
LANDMARK: primary시체나무/secondary야영지·늪보존,tertiary뼈/잔해접지보강. 손3개동작보존.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/POOL_DETAIL/AUTHORED_POOL 총13시점및COMBAT. CAMP_DETAIL/전체보드/동일원본1.5배확대비교직접검수. 단색확대렌더와실게임촬영구분.
TECH QA: 효과35+geometry5+구문1=41PASS. 경로/충돌보존검사PASS,mapUnchanged=true(draw3회,해당cpuP95필드는성능지표로사용하지않음). JS pageerror stack0/HTTP오류0/외부차단6;requestFailures15=외부6+인트로중단9. 사망UI error=null. 청크60/60ready,visibleIds모두drawnIds포함,전청크seam전수검수아님. SWAMP60RAF median16.7/p9533.4ms,SIDE_R/POOL33.3/33.4,CAMP33.2/33.4,COMBAT90RAF33.2/50. headless1280×720녹화,전체성능PASS아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. WASD왕복(4020,7220)→(4022.68788,7217.31212),전경로종주증명아님.
LIVE RENDER PROOF: probe/runtime.json에서실제MAP_OBJS/_OBJ_SPR/_OBJ_META를사용한shadows단독호출 drawImage=3확인. pivotX/Y는세대상모두실제undefined(Playwright→Python JSON에서는null표시). 실제sz bone150/keepAR1,sword200/keepAR0,wpile64/keepAR0;scale기본1. 캡처메타직렬화의null을가드실패로잘못판정하지않도록호출수로검증.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 모듈버전1행/맵문서8개+CHANGELOG동기화. unrelated변경0. tmp/ch1-pass35백업·QA/captures/ch1_camp_debris35_20260927은기존ignore.
GIT: staged공유index보존,commit미완료(.git쓰기제한/기존승인후셸생성오류),push/deploy없음. 코드+docs동반커밋후속남음. 시작149→완료조회149개(동시작업포함),타작업임의숨김·삭제·강제커밋0.
VISUAL VERDICT: RETOUCH — 세잔해하부의접촉개선,전체맵재질통합잔여. 자동PASS와전체맵시각승인구분.
NEXT PASS: 야영지뒤묘비와노출뿌리의바닥연결검토. 기존소품위치·전투면·손동작보존.

검수: <http://localhost:3333/captures/ch1_camp_debris35_20260927/index.html>.


## 36차: 야영지 뒤 묘비 밑동과 노출 뿌리의 접지 (2026-09-27)

35차 잔해접지 승인 후 지정묘비와평면뿌리2곳을추가한다. 묘비는상부실루엣을제외하는기존밑동감쇠,납작한뿌리는원본전체밑면에접촉그림자를사용한다. 원화스타일차이를새그림자로해결했다고보고하지않는다. 묘비48×64의밝은픽셀원화/뿌리256²의흑백에가까운원화와주변재질차이는잔여.

| id / 항목 | 현행 수치·공식·적용 위치 |
|---|---|
| 추가대상 | m_tomb(1460,3900),authored tile(36,97),기본sz56. m_root(1980,3940),tile(49,98),기본sz110. 기존잔해3곳포함총5곳,다른동일type배치미적용 |
| 묘비 | debrisContact(img,false),기존35차t=clamp((y-128)/64,0,1)와t²(3-2t)유지. 상부비표시/밑동접촉. 원본48×64이나기존keepAR0정사각표시계약유지 |
| 평면뿌리 | debrisContact(img,true),t=1로상부감쇠해제. 256²원본의전체alpha윤곽을따라받침. 하부반쪽만그리지않으며원본뿌리·흙패턴보존 |
| 캐시분리 | debrisContactCache=밑동형,rootSoilCache=평면형의별도WeakMap. 같은img가두모드로쓰여도캐시충돌없음. 기본flat=false |
| 공통공식 | 35차256²RGBA/원본(32,32,192,192)베이크,alpha>80실루엣,L1상한12,RGB(29,24,24),grain=.82+.18sin(.37x+2cos(.21y)),alpha=round(255×.56×e²(3-2e)×t²(3-2t)×grain). 투명픽셀RGB0 |
| 정렬·폴백 | 35차shadows패스·exact좌표·stage0 production·keepAR/squareDraw/flip·화면밖culling·unsupported crop/sheet/rotation/pivot폴백그대로. 원본·배치·collision변경0 |
| 비용 | 추가2이미지×256²RGBA=.5MiB. 이접지계열총5장최대1.25MiB. 전체native88.56269454956055MiB(기타shadow/GPU/임시제외). 새대상이보일때각1drawImage추가 |
| 검사 | 동일입력이미지에서묘비밑동/상부비표시와평면뿌리상하부표시차이·다른좌표1981미적용·원본byte불변 RED→GREEN. 효과36+geometry5+구문1=42PASS. 패키징미재검사 |
| 반영 | game.html 모듈20260927-36. 35차잔해/34차지면/손동작·늪효과보존 |


MAP PRODUCTION REPORT — 36차

STAGE: CH1-1 production,야영지뒤묘비/노출뿌리접지.
MASTER: silhouette/8regions/남북main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes변경0.
LARGE: source assets/composites/overlap/repeated silhouette보존,원본PNG변경0.
MEDIUM: 기존connections/remaining holes유지,새오브젝트0.
GROUND: 묘비밑동/평면뿌리전체밑면의contact shadow분리로structure integration보강. 기존contamination보존. 원화스타일차이잔여.
PLAYABLE: main arenas/travel/breathing/threat공간·collision유지. 플레이어/공격예고식별가능. 기존야영지와전투효과가뿌리를일부가림,가림구조변경하지않음.
LANDMARK: primary시체나무/secondary야영지·늪위계보존,tertiary묘비/뿌리접지보강. 손동작보존.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 기본8+SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL 총14시점및COMBAT. CAMP_REAR(43,97)신규,원배율/전체보드직접검수. 묘비3배·뿌리2배단색확대비교별도,실게임에서가려진뿌리전체를육안확인했다고보고하지않음.
TECH QA: 효과36+geometry5+구문1=42PASS. 경로/충돌보존검사PASS,mapUnchanged=true(draw3회,cpuP95필드는성능지표아님). JS pageerror stack0/HTTP오류0/외부차단6;requestFailures12=외부6+인트로중단6. 사망UI error=null. 청크60/60ready,visibleIds모두drawnIds포함,전청크seam전수검수아님. SWAMP/SIDE_R/CAMP_DETAIL/CAMP_REAR60RAF median16.7/p9533.4ms,POOL16.8/33.4,COMBAT90RAF33.3/33.5. headless1280×720녹화,전체성능PASS아님. 체력50ms보충/카메라iframes60,전투전무적보충해제. WASD왕복(4020,7220)→(4088.28615,7157.71381),전경로종주증명아님.
LIVE RENDER: 실제MAP_OBJS/_OBJ_SPR/_OBJ_META와진단camera(1820,4020)를사용한shadows호출 drawImage5회확인. 신규묘비sz56/root110,둘다keepAR0. 진단camera는복사된G에만적용,실제게임상태변경0.
FILES: stage-owned ch1-living-detail.js/test/ch1LivingDetail.test.js. concurrent game.html 모듈버전1행/맵문서8개+CHANGELOG동기화. unrelated변경0. tmp/ch1-pass36백업·QA/captures/ch1_camp_rear36_20260927은기존ignore.
GIT: staged공유index보존,commit미완료(.git쓰기제한/기존승인후셸생성오류),push/deploy없음. 코드+docs동반커밋후속남음. 시작151→완료조회151개(동시작업포함),타작업임의숨김·삭제·강제커밋0.
VISUAL VERDICT: RETOUCH — 접지개선,밝은픽셀묘비/흑백뿌리의원화재질차이와전체맵통합잔여. 자동PASS와시각완성구분.
NEXT PASS: 야영지전체소품의재질·명도조화를검토. 기존원화보존및넓은전투공간/손동작유지.

검수: <http://localhost:3333/captures/ch1_camp_rear36_20260927/index.html>.

## 37차: 사용자 지정 저품질 원화 폐기 (2026-09-27)

현행 계약은 [폐기 SSOT](LOW_QUALITY_ASSET_RETIREMENT_20260927.md) 표를 따른다. 36차 보강을 폐기하고 두 원화와 사본6개를 격리했다. module20260927-37,접지3장0.75MiB,전체native88.06269454956055MiB.


MAP PRODUCTION REPORT — 37차

STAGE: CH1-1 저품질 원화 폐기, CH5/CH7 동일 사본과 편집기 등록 정리.
MASTER: silhouette/regions/main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음.
LARGE: 구형 묘비/노출뿌리 원화2종 및 동일 사본 포함6파일 격리. 기존 composites/overlap 유지. 신규 반복실루엣 없음.
MEDIUM: connections 유지. 제거 대상은 소형 비충돌 데코로 연결구조 변경 없음. remaining holes 전수 검수 아님.
GROUND: 폐기2대상의 접촉shadow/flat모드 제거. 기존오염·야영지바닥·잔해3곳접지 유지. 기존재질통합 개선 여지 잔여.
PLAYABLE: main arenas/travel/breathing/threat space 유지. 남쪽START/북쪽EXIT와 시체나무 양쪽우회 geometry 검사 통과. 전투화면 가독성 유지.
LANDMARK: primary시체나무/secondary야영지·늪 유지,tertiary구형묘비·노출뿌리 제거.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 8개와 SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL,합계14시점+COMBAT 캡처. CAMP_REAR 원배율 및 전체보드 직접검수,밝은묘비가 사라지고 기존지면 연결 유지.
TECH QA: 43테스트 PASS. 보조game-easy-test inline6개/editor1개/tilemap-editor1개 추가 구문검사 PASS. 격리6파일 SHA256 일치 및 활성경로 부재검사 PASS. 실게임 retired objects/sprites/metadata 모두0,기존잔해shadows drawImage3. JS pageerror0/HTTP오류0,외부네트워크차단6개와인트로중단9개. 60청크 ready/60,visibleIds=drawnIds. 캡처시 seam 관찰,전청크전수검수아님. 사망UI error=null. 카메라체력50ms보충/iframes60,전투전무적보충해제. WASD왕복(4020,7220)→(4113.96369,7238.51573),전경로종주아님. COMBAT90RAF median33.3/p9533.4ms(headless1280×720녹화),전체성능PASS 아님. mapUnchanged=true;draw샘플cpuP95=0은성능근거로사용하지않음. NW.js 전체빌드와CH5/CH7화면검수 미수행.
FILES: stage-owned ch1-living-detail.js/test2개/archive6개+manifest/폐기SSOT. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련맵문서/CHANGELOG. unrelated touched0. tmp백업·captures는기존ignore.
GIT: staged 공유index보존. commit미완료(.git쓰기제한/기존승인후셸생성실패),push/deploy없음. 시작154→완료174개(동시작업포함). 타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋후속필요.
VISUAL VERDICT: RETOUCH — 지정저품질원화 제거는 확인. 전체맵소품의 재질·명도 통합은 잔여이며 전체맵최종PASS로보고하지않음.
NEXT PASS: 남은구형소품을 현재지면·랜드마크와 비교해 저품질후보를 분류. 폐기된 두원화의 재보강·재사용 금지.

## 38차: 구형무기더미 폐기

현행값과검수분류는 [38차SSOT](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md)를 따른다.


MAP PRODUCTION REPORT — 38차

STAGE: CH1-1 소형구형무기더미폐기 및CH5동일사본정리.
MASTER: silhouette/regions/남북main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경없음.
LARGE: source assets 구형무기더미1종/동일사본4개격리. composites/overlap/repeated silhouette 변경없음.
MEDIUM: connections 유지,remaining holes 전수검수아님. 새배치없음.
GROUND: 무기더미전용접지제거. shadow2곳유지,contamination/structure integration은기존상태보존.
PLAYABLE: main arenas/travel/breathing/threat space 보존. 작은픽셀더미제거로전투면확보,combat readability 유지.
LANDMARK: primary시체나무/secondary야영지·늪보존. tertiary구형무기더미제거,큰sword_pile보호.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL 총14시점+COMBAT. CAMP_DETAIL원배율/전체보드직접검수. 제거된위치의지면연결유지.
TECH QA: route/collision geometry검사PASS,전체44테스트PASS. 보조game inline6/editor1/tilemap1문법PASS. retired objects/sprites/metadata모두0,유지접지drawImage2. JS pageerror0/HTTP오류0. 외부네트워크차단6건,총requestFailures16건(인트로중단포함). 청크60/60ready,visibleIds모두drawnIds포함. seam전체전수검사아님. WASD(4020,7220)→(4017.2245,7220),전체경로종주아님. 카메라체력50ms보충/iframes60,전투전무적보충해제. 사망UI오류없음. COMBAT90RAF median33.3/p9533.5ms,headless1280×720녹화환경측정. 전체성능PASS/NW.js빌드/CH5시각검수는미수행.
FILES: stage-owned ch1-living-detail.js/test/mapAssetRetirement.test.js/archive4개+manifest/검수문서. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련맵docs/CHANGELOG. unrelated touched0.
GIT: shared index보존,staged추가없음. commit미완료(.git쓰기제한/기존셸실행오류). push/deploy없음. 시작175→완료186개. 타작업숨김/삭제/강제커밋없음.
VISUAL VERDICT: RETOUCH — 구형무기더미제거확인. 나머지구형소품과지면재질통합잔여.
NEXT PASS: rotten_tree/vine_pillar 등구형픽셀소품의충돌·공유사용부터확인후정리. 이번검수만으로폐기확정하지않음.

## 39차: 구형나무·기둥과충돌정리

[현행값·폐기목록](CH1_LOW_QUALITY_RETIREMENT_PASS39.md). 내부dry아틀라스는 _atlasDry:1로분리했고일반/표면패스픽셀동일을확인했다.


MAP PRODUCTION REPORT — 39차

STAGE: CH1-1 구형나무·기둥폐기,CH7동일기둥등록제거.
MASTER: silhouette/regions/main route/side spaces 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes 변경없음.
LARGE: source assets2종7사본격리. composites/overlap 유지,구형픽셀나무·기둥실루엣제거.
MEDIUM: connections유지,remaining holes 신규발견없음(전체전수검수아님).
GROUND: 구형나무앵커제거. shadow/contamination/structure integration의기존지역효과유지. dry아틀라스일반/표면패스원시RGBA해시수정전후동일확인. _atlasDry로내부종속성분리.
PLAYABLE: main arenas/travel/breathing/threat space/남북루트보존. 두소품충돌제거로통행면확보. 새보이지않는충돌없음. combat readability유지.
LANDMARK: primary시체나무/secondary고치·야영지·늪유지. tertiary구형나무/기둥제거,큰뼈아치보호.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 8개+SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL/OLD_TREE(56,47)/OLD_PILLAR(34,156),합계16시점+COMBAT. 제거2지점원배율과전체보드직접검수. 신규빈사각패치없음,남은밝은지면소품은후속검토.
TECH QA: 45테스트PASS. 보조game inline6/editor1/tilemap1구문PASS. route/terrain geometry검사PASS,오브젝트충돌은의도된제거. 실제retired objects/sprites/metadata/collisions모두0. JS pageerror0/HTTP오류0,외부차단6/총requestFailures13(인트로중단포함). 청크64ready,visibleIds모두drawnIds포함. seam전청크전수검수아님. 최종verify-final만승인증거(중간verify는수정전내부앵커문제포함). WASD(4020,7220)→(4017.2453,7222.7547),전경로종주아님. 카메라50ms체력보충/iframes60,전투전무적보충해제. 사망UI오류없음. COMBAT90RAF median16.7/p9550ms,headless1280×720녹화로전체성능PASS아님. CH7시각검수/NW.js전체빌드미수행.
FILES: stage-owned ch1-living-detail.js/test2개/archive7개+manifest/39차문서. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련docs/CHANGELOG. unrelated touched0. tmp백업·captures기존ignore.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸실행오류),push/deploy없음. 시작186→완료204개(동시작업포함),타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 구형나무·기둥제거및기존동맥동작보존확인. 전체맵지면재질/남은구형소품통합잔여.
NEXT PASS: 흰부유돌처럼보이는 moss_patch/ash_pile 등지면데칼의실제원화·배치검수. 저해상도만으로일괄폐기하지않음.

## 40차: 지면데칼정리

[현행폐기계약](CH1_GROUND_DECAL_RETIREMENT_PASS40.md). 생체모듈및모듈버전변경없음.


MAP PRODUCTION REPORT — 40차

STAGE: CH1-1 지면데칼4종폐기.
MASTER: silhouette/regions/main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes변경없음.
LARGE: source assets 중소형지면4원화격리. composites/overlap/대형repeated silhouette변경없음.
MEDIUM: connections유지. remaining holes 신규발견없음,전수검수아님.
GROUND: 독립된밝은돌형지면8배치제거. 기존shadow/contamination/structure integration/피부막효과보존. 뼈아치우측밝은소품소멸확인.
PLAYABLE: main arenas/travel/breathing/threat space유지. 비충돌장식만제거,terrain/남북루트유지. combat readability유지.
LANDMARK: primary시체나무/secondary야영지·늪·고치보존. tertiary지면데칼정리.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL/OLD_TREE/OLD_PILLAR 총16시점+COMBAT. OLD_PILLAR원배율/전체보드직접검수. 흰부유돌제거후지면연결확인.
TECH QA: 46테스트PASS,보조game inline6구문PASS. route/collision geometry검사PASS. 실제retired objects/sprites/metadata/collisions모두0. JS pageerror0/HTTP오류0,외부차단6/총requestFailures15(인트로중단포함). 64청크ready,visibleIds모두drawnIds포함. seam전청크전수검수아님. 사망UI오류없음. WASD(4020,7220)→(4020,7222.70712),전경로종주아님. 카메라50ms체력보충/iframes60,전투전무적보충해제. COMBAT90RAF median16.7/p9550ms,headless1280×720녹화로전체성능PASS아님. 전체NW.js빌드미수행.
FILES: stage-owned test/mapAssetRetirement.test.js/archive4개+manifest/40차문서. concurrent touched game.html/game-easy-test.html/관련docs/CHANGELOG. 생체모듈변경없음. unrelated touched0. tmp/captures기존ignore.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸오류),push/deploy없음. 시작206→완료217개(동시작업포함). 타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 지면4원화제거확인. 전체맵재질통합/남은구형소품은추가검토.
NEXT PASS: 남은소형독액·고기·거미줄원화의실제사용과게임기능을분리해검토. 기존대형늪효과보존.

## 41차: 소형구형독액·육편정리

[현행계약](CH1_SMALL_ORGANIC_RETIREMENT_PASS41.md). 생체모듈변경없음.


MAP PRODUCTION REPORT — 41차

STAGE: CH1-1 소형독액·육편장식폐기,CH6동일사본등록정리.
MASTER: silhouette/regions/main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH/major holes변경없음.
LARGE: 소형source assets4종11파일격리. 기존composites/overlap/repeated silhouette대형구조유지.
MEDIUM: connections유지. CH2거미줄연결부는보류/보존,remaining holes전수검수아님.
GROUND: 소형독액스티커제거,기존shadow/contamination/structure integration과실제대형늪유지.
PLAYABLE: main arenas/travel/breathing/threat space 및combat readability유지. 제거대상비충돌장식으로독피해·경로·terrain변경없음.
LANDMARK: primary시체나무/secondary늪·고치·야영지보존. tertiary구형장식정리.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL/OLD_TREE/OLD_PILLAR 총16시점+COMBAT. AUTHORED_POOL원배율/전체보드직접검수. 큰늪보존,소형장식제거후지면연결확인.
TECH QA: 47테스트PASS,보조game inline6/editor1/tilemap1문법PASS. route/collision검사PASS. 실제retired objects/sprites/metadata/collisions모두0. JS pageerror0/HTTP오류0,외부차단6/총requestFailures14(인트로중단포함). 청크64ready,visibleIds모두drawnIds포함. seam전체전수검수아님. 사망UI오류없음. WASD(4020,7220)→(4022.72428,7220),전경로종주아님. 카메라50ms체력보충/iframes60,전투전무적보충해제. COMBAT90RAF median33.3/p9550ms,headless1280×720녹화로전체성능PASS아님. CH6시각검수/NW.js전체빌드미수행.
FILES: stage-owned test/mapAssetRetirement.test.js/archive11개+manifest/41차문서. concurrent touched game.html/game-easy-test.html/editor.html/tilemap-editor.html/관련docs/CHANGELOG. 생체모듈변경없음. unrelated touched0. tmp/captures기존ignore.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸실행오류),push/deploy없음. 시작217→완료242개(동시작업포함),타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 구형장식제거확인. 전체맵재질통합과거미줄등공유구형원화는추가검토.
NEXT PASS: CH2거미줄연결부의실제사용·가림·경계기능검토. CH1정리목적으로CH2구조를무검수제거하지않음.

## 43차: 낙엽소품폐기

[현행계약](CH1_LEAF_RETIREMENT_PASS43.md),생체모듈변경없음.


MAP PRODUCTION REPORT — 43차

STAGE: CH1-1 낙엽소품폐기,공유뼈·시체원화검토.
MASTER: silhouette/regions/main route/side spaces유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH변경없음. major holes추가없음. LEAF_SITE상단의기존직선형재질경계는잔여결함으로기록.
LARGE: source asset leaf1개격리. 큰뼈아치/나무/composites/overlap/repeated silhouette보존.
MEDIUM: connections유지,remaining holes전수검수아님.
GROUND: 낙엽덩어리1배치제거,shadow/contamination/동맥·피부structure integration보존. 상단직선재질경계는이번소품제거로해결되지않음.
PLAYABLE: main arenas/travel/breathing/threat space유지,비충돌장식제거. combat readability유지.
LANDMARK: primary시체나무/secondary늪·야영지·고치/tertiary큰뼈구조보존.
CAMERA QA: START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT 및SWAMP_DETAIL/TISSUE_DETAIL/CAMP_DETAIL/CAMP_REAR/POOL_DETAIL/AUTHORED_POOL/OLD_TREE/OLD_PILLAR/LEAF_SITE(132,111),총17시점+COMBAT. LEAF_SITE원배율및전체보드직접검수.
TECH QA: 49검사PASS,보조game inline6구문PASS. route/collision검사PASS. retired objects/sprites/metadata/collisions모두0. JS pageerror0/HTTP오류0,외부차단6/총requestFailures15(인트로중단포함). 청크64ready,visibleIds모두drawnIds포함. seam전청크전수검수아님. 사망UI오류없음. WASD(4020,7220)→(4022.71726,7220),전경로종주아님. 카메라50ms체력보충/iframes60,전투전무적보충해제. COMBAT90RAF median33.3/p9550ms,headless1280×720녹화로전체성능PASS아님. 전체NW.js빌드미수행.
FILES: stage-owned test/mapAssetRetirement.test.js/archive원화1+manifest/43차문서. concurrent touched game.html/game-easy-test.html/관련docs/CHANGELOG. 생체모듈·편집기변경없음. unrelated touched0.
GIT: staged공유index보존. commit미완료(.git쓰기제한/기존셸오류),push/deploy없음. 시작258→완료264개(동시작업포함). 타작업숨김·삭제·강제커밋없음. 코드+docs동반커밋필요.
VISUAL VERDICT: RETOUCH — 낙엽소품제거확인. LEAF_SITE상단직선재질경계/전체지면통합잔여.
NEXT PASS: LEAF_SITE상단직선형재질경계의소스레이어확인. 작은장식추가로덮지말고해당경계의원인부터검토. 공유뼈·시체는다른챕터영향확인전유지.


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.
