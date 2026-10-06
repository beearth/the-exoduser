## 2026-10-05 — 실제 이미지 씬 에디터 첫 버전

[MAP_SCENE_EDITOR_20261005.md](MAP_SCENE_EDITOR_20261005.md): editor.html 기본 작업 영역, 원본 해상도와 world 크기 분리·pivot/레이어/보행/PNG·JSON 왕복. 기존 타일 편집은 ?workspace=tiles. core27/실제 Chrome UI15 PASS, 본편 맵·세이브 무변. 틈과 CH1 참조 스케치의 VISUAL RETOUCH/게임6단계 미인수는 유지한다.

## 2026-10-04 — 사용자 입체감 요청: 제단 도랑 내벽 코드 보강

내벽32px·기존 목질 재사용·캐시합성에 적용, 충돌/다리/프레임 draw 유지. 29회귀PASS, 실제 게임 화면/성능 인수 미실시. **VISUAL VERDICT RETOUCH / 전체 맵 완성 아님**. 원총괄 직접 한 슬라이스이며 전문팀 중복송신·새 게임·빌드0. [정확 수치·검증·잔여](CH1_ALTAR_MOAT_20261001.md#6-2026-10-04--게임-렌더러의-수직-내벽-보강). 아래는 각 시점의 이력이다.

## 2026-10-01 — MAP-020 뿌리3종 변주

기존앵커305·충돌·줌잘림수정을유지하며내부목질2crop추가. 동일1/.62카메라에서반복감부분개선,전체RETOUCH·M5전체경로미확인. [현행§8](CH1_BOUNDARY_EDGE_MAP020_20261001.md#8-뿌리3종-변주와-후속-실제-검수--2026-10-01). 아래는각시점이력.

## 2026-10-01 — MAP-020 줌 잘림 수정 완료

실제 `_tzoom`으로 경계 shade/root 월드 범위를 계산한다. 남쪽1/.62의 0/A/B 재검수에서 사각 절단 해소, 1배 경계 픽셀 동일, 관련37검사 PASS. 이번 결함 PASS이며 전체 MAP-020은 반복감·M5 경로 미확인으로 RETOUCH다. [현행 §7](CH1_BOUNDARY_EDGE_MAP020_20261001.md#7-실제-줌-drawcull-수정--2026-10-01). 아래 내용은 각 시점 이력이다.

## 2026-10-01 — MAP-020 Mac 원거리·보행 재검수

기본B·어둠.38·맵/충돌 보존. 실제 줌1/.62의 남쪽0/A/B6장과 입력110표본 확인. **RETOUCH / 원거리 shade 사각 절단 FAIL**, 뿌리 반복 잔여. M5문서7000,6900은 현재벽이며 주머니 보행 승인보류. [재검수 §6](CH1_BOUNDARY_EDGE_MAP020_20261001.md#6-mac-실화면-재검수--2026-10-01). 아래1차PASS는 당시판정.

> 진행 프로젝트: [MAP_IMPROVEMENT_PROJECT.md](MAP_IMPROVEMENT_PROJECT.md) · 2.5D 깊이 기준: [DEPTH_2_5D_BENCHMARK_20260930.md](DEPTH_2_5D_BENCHMARK_20260930.md)

## 2026-10-01 — CH1-1 경계 가독성 MAP-020

신규 `ch1-boundary-edge.js`(기본 ON, 끄기 `?edgeShade=0`): `G.map` 경계 전체에 접지 그림자(바닥 AO .30·숲 recess .70)와 `prop_pool.png` 테두리 뿌리 둑. 충돌·베이크 불변, 새 그림 0. [CH1_BOUNDARY_EDGE_MAP020_20261001.md](CH1_BOUNDARY_EDGE_MAP020_20261001.md)

## 2026-10-01 — CH1-1 제단 독액 도랑

제단 둘레의 막힌 타원 띠(`_CH1_HILL` inner .84~outer 1.04)를 `ch1-altar-moat.js`가 뿌리 둑이 있는 독액 도랑으로 그린다. 서쪽 경사로는 땅 다리. 시각 전용·충돌 불변·새 이미지 0(`prop_pool.png` 재사용)·녹색 광원 10개·기포 20개. 기본값으로 켜져 있는 깊이 슬라이스 1차(`?depthSlice=0`으로 끔)와 함께 현행. [CH1_ALTAR_MOAT_20261001.md](CH1_ALTAR_MOAT_20261001.md)

## 2026-10-01 — 깊이 슬라이스 2차 RETOUCH v2 (경계 띠 170px)

시각 RETOUCH 반영: 덧그림을 경계 안쪽 170px smoothstep 띠로 제한(밖=1), 인스턴스별 굽기+bbox 크롭을 3ms 유휴 슬라이스로, 가림 .5+고스트 .75(2차 전용)·적 규칙 추가. 보행 커버리지 2.72%(목표≤3%)·텍스처 59.18MB(≤64MB)·FPS 차 ≤0.3%. 기본 OFF. [SSOT §0](DEPTH_SLICE2_20261001.md).

## 2026-10-01 — CH1-1 2.5D 깊이 슬라이스 2차 (경계 전경 오버행, 기본 OFF)

신규 `ch1-border-foreground.js`: 청크 재굽기 없이 경계 나무 9(T3 T4 T5 T13 T16 T18 T19 T20 T24)+군락 M5를 엔티티 위 전경으로, 군락 M1 M2 M3를 밑동 기준 앞뒤 분할로 같은 원본·같은 밝기(×.9/×.70, 오프스크린 사전 굽기)·같은 좌표(bake×1000/1024)에 덧그린다 — tree_fade로 잘린 수관이 오버행으로 복원(MAP-003+MAP-004). 가림=수관 영역만 .62 페이드+고스트(1차 공유, 프레임 1회). 착수 확인으로 인너 나무 T1 T10 T31~T35는 베이크 완전 소거+무충돌로 보류. 2차 스위치 ?borderFg=0/1(기본 OFF, DEFAULT_ON 한 줄), ?depthSlice=0=전체 OFF. 테스트 8/8(+회귀 84/84), FPS 차 ≤0.4%, 텍스처 +45.1MB. [SSOT](DEPTH_SLICE2_20261001.md).

## 2026-10-01 — CH1-1 2.5D 깊이 슬라이스 1차 (플래그 OFF 기본)

`?depthSlice=1`/`G._depthSlice` 뒤에서 손배치 나무 8그루+시체나무 밑동 피벗 y정렬 교차(MAP-001), 캐노피 가림 페이드 .62+플레이어 엑스레이 고스트 α.55(MAP-002), 접지 그림자 강화 α.38/.30(MAP-005 일부), 적 인스턴싱 y정렬 버킷 내(MAP-013 부분)를 구현했다. **월드 키라이트 SSOT = 북서(NW)·그림자 남동(SE) 결정(MAP-012)**. 시체나무는 몸통 기준선(-.058)으로 뿌리 위 보행 시 가리지 않고, 아치(m_ctree15/18)는 고리 안 예외. 베이크·충돌·타 스테이지 무변, OFF 경로 보존 테스트 잠금, 테스트 70/70, FPS 차 ≤0.3%. [수치·검증·게이트·잔여 SSOT](DEPTH_SLICE1_20261001.md) · draw order 변경=[MAP_RUNTIME_ARCHITECTURE.md](MAP_RUNTIME_ARCHITECTURE.md) 상단.

## 2026-10-01 — CH1-1 생체나무 얼굴 애니메이션 97차 현행

베이크 무변(bake `20260930-rotforest-96`/cache `20260930-rotforest-97`). 신규 `ch1-face-life.js`가 face-anchors.json 163앵커(eye68·mouth25·tumor70, 가림·퇴색·비가시 88개 필터)에 비동기 눈꺼풀 블링크·턱 호흡·종양 박동을 런타임 오버레이로 그린다(패치=청크 픽셀 파생, 유휴 빌드·LRU40·draw 평균 ≤0.02ms·할당 0, sway displacement 공식 테스트 잠금). 테스트 10/10·pageerror 0. 체감: 플레이어 광원 내 명확, 광원 밖 미묘. [수치·검증·MAP PRODUCTION REPORT](CH1_ROTTEN_FOREST_FACE_LIFE_PASS97_20260930.md). 96차 베이크 가독성은 맵 리드 재검에서 플레이 화면 비지각으로 **RETOUCH 확정, 베이크 튜닝 종료** — 근본 해결은 2.5D 깊이 패스로 이관.

## 2026-09-30 — CH1-1 외곽 군락 가독성 96차 현행

현행 생산 배경은 bakeVersion `20260930-rotforest-96`, 청크 cache key `20260930-rotforest-97`, 23 retouch 레이어·64청크다. 95차 RETOUCH의 "외곽 군락 뭉침"을 대기 안개 헤일로·엠버 림라이트·3단 깊이 헤이즈·눈 글린트·나무 밝기 변주로 해소했다(배치·geometry·충돌·보호 바닥 불변, 신규 생성 0크레딧). 얼굴 앵커 SSOT `outer90_sources/features.json`(43앵커)이 이번에 신설되어 97차 애니메이션과 공유된다. [현행 수치·검수·MAP PRODUCTION REPORT](CH1_ROTTEN_FOREST_MASS_READ_PASS96_20260930.md). **VISUAL VERDICT: RETOUCH(맵 리드 재검 — 플레이 화면 비지각, 베이크 가독성 튜닝 종료).**

## 2026-09-30 — CH1-1 썩은 숲 재질 경계 95차 이력

95차 생산 배경은 bakeVersion `20260930-rotforest-95`, 청크 cache key `20260930-rotforest-96`, 23 retouch 레이어·64청크다. 36개 나무+큰 군락 6개+뿌리 bridge 1개를 비충돌 외곽에 굽고, `floor_transition93.png`의 18px 유기적 시각 전이로 길과 숲의 직선 절단면을 없앴다. 89차 ±5px 움직임은 청크 가장자리 4 mask 샘플에서 감쇠한다. 53점 경계·충돌·피부 바닥 중심·남북 통로는 유지한다. [현행 원인·수치·검수·MAP PRODUCTION REPORT](CH1_ROTTEN_FOREST_BOUNDARY_PASS95_20260930.md). 아래 90차의 현행 표기는 당시 제작 이력이다. **VISUAL VERDICT: RETOUCH.**

## 2026-09-30 — [REGION] 4분면 지역 클리어 + 지역 기반 지옥문 개방

오픈필드 맵을 타일 중점 4분면(북서/북동/남서/남동, CH1-1은 앵글러 속성 테마명)으로 나누고, 지옥문 개방 조건을 구 "전역 처치 80%+`_fbDone`"에서 **4지역 전부 클리어**(지역별 처치 80% + 게이트 지역 문지기 보너스 10% + CH1-1 담당 앵글러 사망)로 교체했다. 지역 입장 배너·클리어 배너·미니맵 십자선/딤/자물쇠/앵글러 마커·화면 가장자리 방향 화살표·HUD 현재지역 카운터 포함. 소형 맵(한 변 180타일 미만 — 던전·소환굴·보스아레나)은 구 규칙 폴백. `game.html`+`game-easy-test.html` 동일 반영, `test/regionClearGate.test.js` 7건 PASS. [SSOT](REGION_CLEAR_GATE_20260930.md). 갱신된 문서: MAP_RUNTIME_ARCHITECTURE §8/§9, LEVEL_DESIGN_RULES_SSOT §9, MAP_IMPLEMENTATION_ROADMAP PHASE 5/6, MAP_QA_GATES §2, CH1_VERTICAL_SLICE, CH1_1_BLOCKOUT_MASTER, BOSS_CANONICAL_MAPPING, GIANT_BOSS_PRESENCE_LADDER, STAGE_SPATIAL_GRAMMAR, WORLD_STRUCTURE_SSOT, 맵구성_1장, 맵디자인_벤치마크, 맵유형_확장기획, 2게임디자인레벨디자인, 3.1 HUD, 2_4 펫 대사, 16번역 No.3073~3087.

## 2026-09-30 — CH1-1 살아 움직이는 썩은숲 90차 현행

사용자 참조 스크린샷 `2026-09-30 105738`의 피부 바닥·썩은 목질·동맥 연결을 기준으로 외곽을 재제작했다. MagicLight GPT Image 2.5 Sunburst 생체나무 4종(눈·입·종양·부종)을 8개 손 배치에 교체하고, 비충돌 외곽 배경에 36개(큰 실루엣 6개)를 합성했다. 배경 bakeVersion은 `20260930-rotforest-90`, 청크 cache key는 `20260930-rotforest-91`, retouch 23레이어, 64청크다. 89차 ±5월드픽셀 숲 흔들림과 87차 피부 바닥, 53점 경계·8구역·충돌은 유지한다. [현행 생성·수치·검수·MAP PRODUCTION REPORT](CH1_ROTTEN_FOREST_PASS90_20260930.md). 아래 89/88/87차의 '현행' 표현은 각각 제작 당시 이력이다. **VISUAL VERDICT: RETOUCH**.

## 2026-09-30 — CH1-1 외곽 숲 배경 흔들림 89차

정적 production 숲 청크의 보행 경계 뒤 1~9타일만 최대 ±5월드픽셀로 천천히 흔들리는 `Ch1ForestSway` 레이어를 본편에 연결했다. 피부 바닥·충돌·64청크 원본·88차 나무 배치는 그대로다. [구현 수치·검수·MAP PRODUCTION REPORT](CH1_FOREST_SWAY_PASS89_20260930.md). 전체 맵 **VISUAL VERDICT: RETOUCH**.

## 2026-09-30 — CH1-1 Sunburst 부패 생체나무 88차

1-1 손 배치 나무 8개는 `m_ctree13~20`/Sunburst RGBA 4종으로 교체했다. 기존 위치·scale·충돌, 87차 피부 바닥·경계·배경·living module은 유지한다. [현재 나무 ID·원화·좌표·검수·MAP PRODUCTION REPORT](CH1_SUNBURST_TREE_PASS88_20260930.md). 전체 맵 **VISUAL VERDICT: RETOUCH**.

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

## 2026-09-29 — CH1-1 검정 빈 공간 감소 83차

사용자 최신 지시: **검정색 빈 공간을 최대한 없앤다.** 기존 외곽 나무 사이의 비보행 검정 공동을 부패 목질·괴사 조직 재질로 채웠다. 현재 본편 배경은 83차이며, 아래 82차 이하의 수치와 검수는 제작 이력이다. [현행 출처·검수 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer83).

| id | 현행 계약 |
|---|---|
| OUTER83_RUNTIME | cache/bakeVersion 20260929-outer-83; master8192²/world8000²/tile40; 64청크/core1024/bleed1/1026²; 변경54개/동일10개. geometry·충돌·진행 변경0 |
| OUTER83_MASK | 원본 maxRGB로 t=clamp((48−maxRGB)/28,0,1), alpha=t²(3−2t), uint8 양자화. authored nav1=보행은 alpha0; maxRGB≥48/zero-mask 픽셀 유지 |
| OUTER83_MATERIAL | GPT2048² 원본을 256px 중첩·4방향 smoothstep 가중 합성,1792px 주기로 연결. 반전0. paint=clip(tileRGB×.65+[12,8,12],24,255); RGB=uint8(base×(1−alpha)+paint×alpha), 기존 alpha 유지 |
| OUTER83_PIXELS | 변경23643680px/보행0. 전체 maxRGB≤12:6062519→405110(93.318% 감소); 비보행5657409→0. ≤18:9586314→1266275/비보행8320039→0; ≤22:12597285→2325674/비보행10271611→0. 남은 어두운 픽셀은 보호된 보행 바닥·그림자이며 모든 검정 픽셀 제거를 뜻하지 않음 |
| OUTER83_LAYERS | skin65→outer66~83 총19레이어; outer83 x0/y0/8192² preblended RGB+binary alpha0/255. 이전18레이어 파일 유지; 이전 패치의 어두운 비보행 픽셀 일부는 최신 지시에 따라 이번 레이어가 덮음 |
| OUTER83_QA | 최종 후보22/본편18카메라; G.map동일/pageerror·HTTP·crash0; 실제 S/W 이동 108.53worldpx, 24적·30초 공격/Q. 회귀9PASS/19레이어 전체픽셀 동일/64청크·224strip동일 |
| OUTER83_LIVING | 기존61차 동맥·늪 버블/가스 유지. 신규 생체 모션0/추가 runtime draw·atlas0; 신규 재질은 정적 배경 |
| OUTER83_STATE | VISUAL VERDICT RETOUCH. 검정 공동 감소는 확인; 다른 식생·반복·밀집VFX 중첩은 잔여. 실제 Radeon GPU2813×1262에서 context loss→restore 뒤 흰 화면1회; 자체 이전QA탭 종료·동일83차 새로고침 후4시점 정상. 원인·해결 미확정 |

## 2026-09-29 — CH1-1 서측 고목 밑 접합82차 기록(83차 이전)

82차 당시 본편 배경이다. 아래81차 이하의 원화·수치·검수는 제작 이력이다. 상세 출처·보호 계약·검수는 [82차 SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#ch1-1-outer82)를 따른다.

| id | 현행 계약 |
|---|---|
| OUTER82_RUNTIME | cache/bakeVersion `20260929-outer-82`; master8192²,world8000²/tile40;64청크/core1024/bleed1/1026²·224strip일치;변경 `chunk_1_5.png`1개/나머지63개유지 |
| OUTER82_LAYER | skin65→outer66~82 총18레이어;`outer82_sources/outer82_patch.png`,x1024/y5120/2048²,preblended RGB+binary alpha0/255 |
| OUTER82_MASK | ellipse[740,438,350,320]/feather.30/opacity.92;73mask>12·74~81mask>0 보호2260730px.고목·공동6사각형981440px;전체합3195820px/MaxFilter25/blur18/core alpha0 |
| OUTER82_PIXELS | 총40513/보행0/비보행40513px.보호·타원밖·zero-mask·crop밖 변경0;geometry/충돌/진행·늪/가스/동맥유지,새모션0 |
| OUTER82_REFERENCE | 업로드 장애 후 기확인 master80 crop[1024,5120,3072,7168]/media b27be7cc-c007-40e6-b4f3-94f786f857dc 재사용.현재 master81의 비보호 합성 픽셀과 참조의 픽셀일치 assert통과.81차패치 보호 |
| OUTER82_QA | 전후9시점 및정밀후보9시점/G.map동일/pageerror·HTTP오류0;회귀9PASS.본편 이동·전투·실제Chrome 최종 검수는 아래완료기록 참조 |
| OUTER82_VERDICT | VISUAL VERDICT RETOUCH;주변식생·반복·밀집VFX/숫자 중첩잔여.기존renderer문제 원인미확정.후속안정성 진단은 본편검수와 별도 기록 |

## 2026-09-29 — CH1-1 서측 피부막 위쪽 접합81차 기록(82차 이전)

80차 피부 면 위쪽 tile[46,144]의 잎무늬 접합을 실제80차 원화 참조로 편집했다. 낮은 괴사막과 섬유로 기존 피부층을 연결하고, 고목과73~80차 패치·넓은 전투공터를 보호했다. 아래80차는 제작 이력이며 현재 배경 계약은81차다.

| id | 현행 계약 | 값 |
|---|---|---|
| OUTER81_SOURCE | 입력·생성 | master80 crop[1024,5120,3072,7168],2048²;Higgsfield GPT gpt_image_2_5/job34551eaf-ba11-466e-8403-c951d280d035;1:1/2k/high/opaque/count1,2.75credits |
| OUTER81_MASK | 선택·합성 | ellipse[840,840,340,460];q=((x−840)/340)²+((y−840)/460)²;t=clamp((1−q)/.30);region=t²(3−2t).alpha=region×(1−protect)×.92×sourceAlpha;floor(alpha×255)/255;RGB=uint8(base80×(1−alpha)+edited81×alpha),원본alpha유지.경계band없음 |
| OUTER81_KEEP | 보호 |73mask>12·74~80mask>0;이전합집합2100642픽셀.고목사각형[500,1502,1410,2048]/[760,70,1020,550]/[160,0,590,600],합879660픽셀.전체합2963916/MaxFilter25/GaussianBlur18/core강제alpha0.보호·타원밖·zero-mask·crop밖변경0 |
| OUTER81_PIXELS | 변화 |총157436/보행123509/비보행33927;geometry·충돌·진행·늪버블·가스·동맥유지,새모션0 |
| OUTER81_RUNTIME | 본편 |master·chunk_1_5.png/chunk_2_5.png·preview·composition·retouchLayers·game cache20260929-outer-81;64청크/core1024/bleed1/1026²·224strip동일;나머지62청크유지 |
| OUTER81_REBAKE | 재현 |skin65→outer66~81,17레이어;outer81 x1024/y5120/2048²,preblended RGB+binary alpha0/255;helper전체8192²픽셀동일.검수Sharp concurrency1/cache false.초기동시검증vips메모리오류별도보존;전체builder재실행미실시 |
| OUTER81_FILES | 소스·보존 |outer81_sources/outer81_patch.png·outer81_mask.png 2파일.76~81차오프라인출처는outer76_81-provenance.zip으로묶음:각pass/input-base.png·edited_connection.png·outerN_crop.png·generation.json·prep.json 총30엔트리+manifest.json=31,모두SHA대조.기존76~80개별ZIP5개는tmp/ch1-source-consolidation81에원본보존.런타임PNG12개변경/삭제0.73~75기존staged출처유지 |
| OUTER81_QA | 실제 검수 |전후9·본편18카메라를3×6독립세션,이동/전투별도1세션으로확인;최종pageerror/HTTP오류0·본편route교체0·42캡처정상.회귀9PASS;[46.5,144.5] S/W약113.86worldpx·시작점근처복귀(약2.78px오차)/G.map동일,임시24적/적탄6샘플0/9/12/12/16/14·공격/Q.체력50ms/무적63f보정·전체API쓰기차단.후반3세션은종료된로딩화면이미지src만QA컨텍스트에서해제,맵청크교체0/본편소스수정없음 |
| OUTER81_STABILITY | 검수 한계 |최초before캡처대기1회,연속본편renderer종료2회,동일코드+80차이미지비교에서도JOIN_TOP흰화면1회.분리group1도스크린샷Python MemoryError1회·시작흰화면1회.실패로그/이미지보존.Windows진단snapshot commit72.556GiB/limit79.761GiB/peak79.761GiB,물리여유39.252GiB;동시메모리압박관찰·종료원인단정없음.자체검수잔여descendant0/사용자앱종료0.실행중limit변동.분리검수의정상캡처는장시간안정성통과가아니며원인·해결미확정 |
| OUTER81_STATE | 판정·Git |VISUAL VERDICT RETOUCH;다른식생·반복·밀집VFX/숫자중첩잔여.81차미커밋:승인된git add도exec provider가WindowsApps pwsh시작전OS317로실패;Git쓰기0/기존staged보존.출처정리후98파일이었으나타작업추가로생성전검사102·통합검수후검사107파일(각시점100제한초과);강제정리없음.저사양/NW.js/장시간성능·무보정종주·클리어미검증 |

[81차 MAP PRODUCTION REPORT](../../captures/ch1_outer81/REPORT.md) · [전후·본편 갤러리](../../captures/ch1_outer81/index.html).

## 2026-09-28 — CH1-1 서측 피부막 왼쪽 접합80차 기록(81차 이전)

79차 피부 면 왼쪽 tile[36,153]의 잎무늬를 실제79차 원화 참조로 편집했다. 기존 고목과73~79차 패치를 보호하고 낮은 괴사 피부층·섬유로 연결했다. 아래79차 이전 기록은 제작 이력이며 당시 배경 계약은80차다(81차 이전 이력).

| id | 80차 당시 계약 | 값 |
|---|---|---|
| OUTER80_SOURCE | 실제 입력·생성 | master79 crop[1024,5632,3072,7680],2048²;Higgsfield GPT gpt_image_2_5/job2b87a734-083f-48ec-b222-e20407f7ae44,1:1/2k/high/opaque/count1 |
| OUTER80_MASK | 선택·합성 | ellipse[480,620,320,550],q=((x−480)/320)²+((y−620)/550)²;t=clamp((1−q)/.30);region=t²(3−2t).alpha=region×(1−protect)×.92×sourceAlpha;floor(alpha×255)/255;RGB=uint8(base79×(1−alpha)+edited80×alpha),원본alpha 유지. 경계band없음 |
| OUTER80_KEEP | 보호 |73mask>12·74~79mask>0;이전합집합1617083픽셀.고목사각형[500,990,1410,2048]/962780픽셀;전체합집합2563137/MaxFilter25/GaussianBlur18/core강제alpha0.보호·타원밖·zero-mask·crop밖 변화0 |
| OUTER80_PIXELS | 변화 |총338768/보행240292/비보행98476;geometry·기존충돌·진행·늪버블·가스·동맥 유지,새모션0 |
| OUTER80_RUNTIME | 본편 |master·chunk_1_5.png/chunk_1_6.png·preview·composition·retouchLayers·game cache20260928-outer-80.64청크/core1024/bleed1/1026²·224strip동일;나머지62청크유지 |
| OUTER80_REBAKE | 재현 |skin65→outer66~80,총16레이어;outer80 x1024/y5632/2048²,preblended RGB+binary alpha0/255;helper 전체8192²픽셀동일 |
| OUTER80_FILES | 소스·보존 |outer80_sources/outer80_patch.png·outer80_mask.png·source-provenance.zip 3파일. ZIP의input-base.png/edited_connection.png/outer80_crop.png/generation.json/prep.json 5엔트리 원본SHA대조.76~79차도patch/mask/출처ZIP 3파일로정리;각ZIP5엔트리·76/77 RAW 및76~79 prep은tmp/ch1-source-consolidation80에별도보존.런타임패치/마스크삭제0 |
| OUTER80_QA | 실제 검수 |전후9·일반본편18카메라,최종각pageerror/HTTP오류0·본편route교체0;지형5+레이어/버전3+HTML구문1=9PASS.수정부[38.5,153.5] S/W104.79worldpx·복귀/G.map동일,임시24적/적탄6샘플0/5/8/11/12/8·공격/Q.초기기존본편의흰캡처2건은별도진단/제외;원인미확정·해결선언없음 |
| OUTER80_STATE | 판정·Git |VISUAL VERDICT RETOUCH;전체식생·다른영역반복·밀집VFX/숫자중첩잔여.80차미커밋:일반git add index.lock권한거부/승인된상승재시도provider시작전OS317;Git쓰기0/기존staged보존.저사양/NW.js/장시간성능·무보정종주·클리어미검증 |

[80차 MAP PRODUCTION REPORT](../../captures/ch1_outer80/REPORT.md) · [전후·본편 갤러리](../../captures/ch1_outer80/index.html).

> 2026-09-28 79차 기록(80차 이전): 서측78차피부왼쪽 tile[47,159]의잎무늬를 실제78차crop참조 Higgsfield GPT 원화로낮은괴사피부에연결. 타원[860,730,430,360]·feather.30/.92·band없음;총341970/보행339996/비보행1974,73~78mask1270046·고목사각형[500,990,1410,2048]/962780·보호합집합2216100픽셀/변경0·타원밖/zero-mask/crop밖0. master/3청크[1,5]/[1,6]/[2,6]/cache20260928-outer-79,15레이어전체재현·64청크/224strip동일. 후보9/본편18시점·최종서버오류0·회귀9PASS(첫루프백장비4048건은별도이력),canMv[47.5,153.5] S/W110.79px. geometry/충돌/늪버블·가스·동맥유지. VISUAL VERDICT RETOUCH;production79 MAP PRODUCTION REPORT우선. source4파일/출처ZIP4엔트리;staged62보존·79미커밋/소유checkpoint.

> 2026-09-28 78차 기록(79차 이전): 서측77차뿌리아래 tile[62,150]의잎무늬를 실제77차crop참조 Higgsfield GPT 원화로낮은괴사피부에연결. 타원[1000,1010,520,500]·feather.30/.92·band없음;총/보행715350/비보행0,73~77mask1219930픽셀보호·타원밖/zero-mask/crop밖0. master/4청크1/2×5/6/cache20260928-outer-78,14레이어전체재현·64청크/224strip동일. 후보9/본편18시점·오류0·회귀9PASS,canMv[67.5,149.5] S/W110.26px. geometry/충돌/늪버블·가스·동맥유지. VISUAL VERDICT RETOUCH;production78 MAP PRODUCTION REPORT우선. source4파일/출처ZIP4엔트리;staged62보존·78미커밋/소유checkpoint.

> 2026-09-28 77차 기록(78차 이전): 서측 tile[61,128]의 회색fan 접합을 실제76차 crop 참조의 새Higgsfield GPT 원화로 낮은 수피판·괴사조직으로 보강. 타원[925,620,470,450]·feather.30/.92·band없음. 총573129/보행368405/비보행204724픽셀변화.73~76차 mask509153+두고목165100=674253픽셀보호·타원밖/zero-mask/crop밖0. master/4청크/cache20260928-outer-77,13레이어전체재현·64청크/224strip동일. 후보전후9/본편18시점·오류0·회귀9PASS,canMv확인[67.5,128.5] S/W112.06px이동. geometry/충돌/늪버블·가스·동맥유지. VISUAL VERDICT RETOUCH;production77차 MAP PRODUCTION REPORT우선. 기존staged62보존·77차미커밋/소유checkpoint.

> 2026-09-28 76차 기록(77차 이전): 남서 위쪽 baked 회색 fan root를 실제75차 crop 참조의 새 Higgsfield GPT 원화로 낮은 부패 목질·피부 바닥으로 편집. 선택 타원[1230,1150,430,425]·feather.30/opacity.92; 이번에는 경계 band 없음. 선택 보행554432픽셀 변화,73~75차 보호301195픽셀·타원밖·zero-mask·crop밖 변경0. master/4청크/cache20260928-outer-76,12레이어 전체 재현·64청크/224strip 동일. 후보전후9/본편18카메라·오류0·회귀9PASS. canMv 확인한[87.5,151.5] S/W 109.00px 이동·복귀. geometry/기존 나무 충돌/늪 버블·가스·동맥 유지. VISUAL VERDICT RETOUCH; production76차 MAP PRODUCTION REPORT 우선. 기존 staged62파일 보존·76차 미커밋,소유 checkpoint 보존.

> 2026-09-28 75차 기록(76차 이전): 남서 고목 위쪽 회색fan root·잎무늬를 실제74차 master crop참조의 새Higgsfield GPT 원화로부분보강했습니다. 선택타원[1220,950,400,480]·Chebyshev8타일band(축별320월드px)·.92/blur20·고목core572420픽셀보호. 총384431/선택보행368590픽셀변화; band밖보행·고목core·crop밖0. master/4청크/cache20260928-outer-75, 11레이어전체재현·64청크/224strip동일. 후보전후9/일반본편18시점·오류0·회귀9PASS. 실제S/W이동107.87px·G.map동일. 충돌·늪버블/가스/동맥유지. VISUAL VERDICT RETOUCH; 아래이전pass는이력이며production75차MAP PRODUCTION REPORT가우선합니다.

> 2026-09-28 74차 기록(75차 이전): 실제 73차 마스터 crop을 Higgsfield GPT 편집 입력으로 사용해 남서 고목의 잔뿌리·수풀 접합 일부를 낮은 부패 목질·괴사 조직으로 연결했습니다. 선택 타원 [1200,1310,470,600]과 경계 Chebyshev 2타일 band(축별80월드px)만 합성(.92/blur20). 총183,663픽셀 변화, 경계 보행 재질121,007픽셀 변화; 안쪽 전투면·고목 보호572,420픽셀·crop 밖은 변경0. master/4청크, cache `20260928-outer-74`. 후보 전후8·본편16시점·오류0·회귀9 PASS, 64청크/224경계 strip·10레이어 전체 재현. geometry/collision·늪 버블/가스/동맥 유지. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 이력이며 production SSOT의74차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 73차 기록(74차 이전): 남서 시작 왼쪽 비보행 외곽에 꺾인 고목 단면·넓은 부패 뿌리판·검은 공동을 부분 반영했습니다. 중심 tile[73,180], master/3청크(cache `20260928-outer-73`), 580,534픽셀 변화·보행 픽셀 변경0. 후보 전후7·본편39시점(첫27+재검수12)·런타임 오류0·회귀9 PASS, 64청크/224경계 strip 및 skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72→outer73 helper 전체 재현. 늪 버블·가스·동맥 유지. 두 metadata와 로더 cache의 버전 불일치 원인을 고치고 일치 회귀검사를 추가했습니다. 초기 후반 흰 캡처는 제외·재촬영했으며 장시간 원인 검증은 남아 있습니다. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 이력이며 production SSOT의73차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 72차 기록(73차 이전): 남측 시작 오른쪽 비보행 외곽에 낮은 부패 목질·수피판·검은 공동을 부분 반영했습니다. 중심 tile[129,181], master/3청크(cache `20260928-outer-72`), 433,965픽셀 변화·보행 픽셀 변경0. 후보 전후7·일반 본편35카메라·오류0·회귀8 PASS, 64청크/224경계 strip 및 skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72 helper 전체 재현. 늪 버블·가스·동맥 유지. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 당시 이력이며 production SSOT의72차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 71차 기록(72차 이전): 남동 부패 뿌리 한 개를 tile[184,158]→[178,150]으로 재배치해 보행 경계의 목질 공동·접합 가독성을 개선(master/4청크 x6..7/y5..6). production cache `20260928-outer-71`; 1,103,760픽셀 변화·보행 픽셀 변경0, 본편30카메라·오류0·회귀8 PASS. 기존70자리 복원543,276픽셀과 새 위치를 보정patch로 기록, skin65→outer66→outer67→outer68→outer69→outer70→outer71 보존. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 당시 이력이며 production 문서71차 보고가 우선합니다.

> 2026-09-28 70차 기록(71차 이전): 남동 비보행 외곽에 낮게 무너진 부패 뿌리·수피판·목질 공동을 부분 반영(master/3청크 x7/y5, x6..7/y6). production cache `20260928-outer-70`; 686,730픽셀 변화·보행 픽셀 변경0, 본편29카메라·오류0·회귀8 PASS. skin65→outer66→outer67→outer68→outer69→outer70 보존, 전체 VISUAL VERDICT RETOUCH. 아래 이전 현행 표기는 당시 이력이며 production 문서 70차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 69차 기록(70차 이전): 동쪽 비보행 외곽에 기울어진 속빈 고목과 낮은 부채꼴 뿌리를 부분 반영(master/3청크 x7/y3, x6..7/y4). production cache `20260928-outer-69`; 801,475픽셀 변화·보행 픽셀 변경 0, 본편25카메라·오류0·회귀8 PASS. skin65→outer66→outer67→outer68→outer69 보존, 전체 VISUAL VERDICT RETOUCH. 아래 이전 pass의 현행 표기는 당시 기록이며 상세 계약은 production 문서 69차 MAP PRODUCTION REPORT가 우선합니다.

> 2026-09-28 68차 기록(69차 이전): 북쪽 비보행 외곽에 쓰러진 속빈 고목을 부분 반영(master/6청크 x1..3/y0..1). production cache `20260928-outer-68`; 보행 픽셀 변경 0, 본편 21카메라·오류 0·회귀 8 PASS. 67차 실제 원화 1024²/scale1.5로 정정했으며, master/64청크 불일치 기록은 검사기 좌표 오류였다. 전체 VISUAL VERDICT RETOUCH. 상세는 CH1_1_PRODUCTION_FINISH_20260916.md의 68차 MAP PRODUCTION REPORT.

> 2026-09-28 67차 기록(68차 이전): 북서쪽 비보행 외곽의 건강한 수풀 띠를 죽은 속빈 목질·내부 숲 질량으로 부분반영(master/4청크 x0..1/y1..2). production cache `20260928-outer-67`; 보행pixels 변경0, 65차 피부·66차 서쪽 고목·생체모듈61차 보존. 생성본의 체크무늬 배경은 폐기하고 background-remover cutout만 사용. 전체 VISUAL VERDICT RETOUCH.

> 2026-09-28 현재 66차: 서쪽비보행외곽에썩은고목·통나무·뿌리질량을부분반영(master/4청크x0..1/y3..4).production cache `20260928-outer-66`;65차피부/생체모듈61차보존.보행pixels변경0.재베이크는skin65→outer66패치순서,전체8192²픽셀재현확인.아래이전버전은이력;전체VISUAL VERDICT RETOUCH.

## 2026-09-28 — 65차 피부 바닥 본편 반영

첫공터→root_bend→나무앞→서쪽의63/64/65차 저대비피부재질을기존production master와30청크에부분반영했다.배경cache는`20260928-skin-65`,Ch1LivingDetail생체모듈은61차그대로다.아래62~64차의production61차유지문구와9월17일버전은당시이력이다.기존outer비교cache20260917-depth-2/diablo20260924-blockout-2는유지한다.

| id | 본편 계약 | 값 |
|---|---|---|
| SKIN65_AREA | 원본·레이어 | 8192²master crop[2007,2867,5447,7249],3440×4382.63차Higgsfield gpt_image_2_5재질1024²재사용;추가생성없음 |
| SKIN65_BLEND | 재질 | anchor[2498,4587],RGB×.53;sample1024/step512/Hanning floor.001/rotation90×((ix+2iy)%4).기존63/64mask·pixels보존 |
| SKIN65_WEST | 추가영역 | tile타원[69,100,12,25],[73,123,12,15],alpha.60/feather.35/smoothstep.64mask와max union |
| SKIN65_PROTECT | 보존 | 타원[105,95,20,15],[108,79,18,10];protect=smoothstep(clamp((1.18-r)/.18));mask0 8,247,686pixels변경0/새서쪽밖64pixels변경0 |
| SKIN65_CHUNKS | production | x1..5/y2..7 30청크.전체64×1026²(core1024/bleed1);단일master에서crop검증.월드끝bleed는끝pixel복제.나머지34청크보존 |
| SKIN65_SOURCE | 복구·생성기록 | assets/map/ch1/production_finish/skin65_sources의재질/crop/layer/mask/prep/generation 6파일.원본master+30청크backup은tmp/ch1-production-pre65 |
| SKIN65_QA | 비교 검수 | 14카메라before64/after65,임시24적·탄·공격/Q;G.map동일;관찰pageerror/HTTP오류0;224stripPASS.본편경로검수결과는제작보고에후속기록 |
| SKIN65_STATE | 판정 | VISUAL VERDICT: RETOUCH.낮은바닥재질만부분반영.전체외곽·건강한식생·중앙캐릭터중첩·성능검수잔여.새피부맥동미구현;기존늪가스/버블/동맥유지 |

[65차제작보고](../../captures/ch1_ground_skin65/REPORT.md) · [실제화면비교](../../captures/ch1_ground_skin65/index.html).현행복구가능수치·좌표는[production SSOT](CH1_1_PRODUCTION_FINISH_20260916.md#skin65)에도보존한다.

> **2026-09-28 61차 현행:** 큰늪 원화 groundSprite는 가장자리의 밝은 돌 반사만 낮춘다. glare=clamp((L−105)/110)×max(0,1−d/64)×.38, RGB×(1−glare). d≥64인 내부 독액은 이 보정 없음. 60차 비대칭 접지와 캐시·draw 수는 유지. [검수·보고](CH1_SWAMP_SEEP_PASS60.md#61차-밝은-돌-가장자리-완화).

> **2026-09-28 60차 늪 접지 현행:** 큰늪 swampApron 외측폭은 고정28에서 좌하단 중심의 가변18~30캐시px,alpha계수 .48→.58이다. 512²캐시/1MiB 및 swamp최대20draw 유지. [현행 공식·검수](CH1_SWAMP_SEEP_PASS60.md). 아래31차 고정폭 수치는 이력이다.

> **2026-09-28 59차 현행:** 동측 region1 합성은 .76, palette #343034/#49443c/#303829,서쪽 lobe [155,282,146,140] 추가. 중앙과 회갈색을 공유하고 늪쪽 녹갈색 유지. region0 .82/region1·2 .76/region3·4 .6,지역5캐시7.5MiB/추가draw0. [현행 수치·검수](CH1_EAST_TISSUE_PASS59.md). 아래 이전 수치는 당시 이력이다.

> **2026-09-17 리터치 이력:** bake/cache `20260917-depth-2`. 신규 숲 원화 4종, 고정 외곽 42배치와 낮은 뿌리 9배치. CH1-1 hand `m_c1tree`만 화면 크기 0.72 / pivotY 0.72; 원본 metadata 1450 및 충돌은 유지. geometry/START/EXIT/진행 계약 유지. 최신 시각 판정 **RETOUCH**. [실제 화면·영상·검증 한계](CH1_1_DEPTH_RETOUCH_20260917.md). 아래 ground-2와 이전 PASS는 당시 이력이다.

> **42차 현행(2026-09-27):** 구형 spider_web 원화·동일사본4개와CH2 seamWeb4배치폐기. CH2 authored105/시스템포함107,충돌51+비충돌54,seam6,wall-belt27. 구형거미줄유지였던41차기록은검토이력. 큰거미줄뼈기둥보존. [현행SSOT](CH2_WEB_RETIREMENT_PASS42.md).

> **2026-09-16 후속 실제 수정:** 사용자 추가 지시에 따라 bake/cache가 `20260916-ground-2`로 변경됐다. 흙길/공터와 이끼·낙엽을 구분하며 geometry/START/EXIT/배치/진행은 유지한다. [현재 지면 구성·전후 증거](CH1_1_GROUND_STRUCTURE_20260916.md). 아래 finish-3 및 ec7bf70d8 동일성 판정은 수정 전 검수 이력이다.

> **2026-09-16 후속 결과 검수:** 맵 ec7bf70d8 보존. 최신 시각 판정은 **RETOUCH**. [원본 화면/일반 플레이/남은 결함](CH1_1_FINAL_REVIEW_20260916.md). 기존 제작 보고의 PASS를 정정하며 기술 이력과 구분한다.

> **2026-09-16 CH1-1 PRODUCTION 적용 계약 — 이전 CH1-1 배경/경계 설명보다 우선:** 사용자 최신 지시에 따라 실제 `STAGES[0]`(표시 1-1)에 고정 수작업 전체맵을 적용했다. 현행 경계는 `assets/map/ch1/production_finish/layout.js`의 53점 polygon/8구역이며, 기본 배경은 `assets/map/ch1/production_finish`다. 8192² master의 1024px core를 **월드 1000px**로 그려 200×200타일(`T=40`, 8000²) 충돌 좌표와 일치시킨다. `smoothing`은 호환 phase 이름이며 과거 smoothing 폴더를 기본 로드한다는 뜻이 아니다. `outer` query는 과거 아트 비교용으로, 현행 경계와 시각 정합을 보증하지 않는다. authored62/runtime63, hand collision21/total22, 자동 scatter0. `_CH1S1`/stage1은 별도 맵이다. START `(100.5,185.5)`, 시체나무 `(102.5,90.5)`, 북쪽 gate y5/exit y7과 진행 조건은 유지한다. 아래의 이전 outer/smoothing 수치·좌표는 **해당 날짜의 이력**이며 현행값은 [전체 제작·수치·검증 보고서](CH1_1_PRODUCTION_FINISH_20260916.md)를 따른다. 기술 PASS와 시각 판정은 보고서에서 별도로 기록한다.

> **2026-09-12 최신 변경:** 사용자 요청으로 CH1-1 시작 철창문 `m_cage_gate(103,188,scale1.2)` 배치를 제거했다. 해당 문 렌더·충돌 모두 제거, authored62/runtime63, hand collision21/total22. 아래의 START 성문·63/64·22/23 수치는 제거 이전 기록이다. 북쪽 보스 게이트와 다른 스테이지 문은 유지한다.

# MAP SSOT INDEX — 세미 오픈월드 맵 기획 문서 세트

> **CH1-1 최우선 콘셉트 (2026-09-25): [맵디테일.md](맵디테일.md) 필독.** 넓은 전투공간·피부 바닥·꿈틀거리는 동맥·부패 생체나무의 음침한 지옥. 이전 자연숲 원화들은 현행 승인안이 아니다. 공통 제작 가이드 다음에 읽고 이전 제작 이력보다 이 최신 콘셉트를 적용한다.

> **오늘 작업 재개·최신 목표 (2026-09-24):** [Rootworld 모델 이미지 일치 검수](ROOTWORLD_REFERENCE_FIDELITY_20260924.md). 기준 원화와 동일 구현이 목표. candidate-v1 시각 FAIL, 신규 API 생성은 잔액 부족으로 출력 없음. 오늘 QA 작업을 위 9월 17일 본편 리터치 이력과 혼동하지 않는다.

> **진행 중인 제출 목표 (2026-09-24):** [스마일게이트 제출용 CH1-1 완성 목표](SMILEGATE_CH1_SUBMISSION_GOAL_20260924.md). 추석 이후 제출용 맵 한 개를 목표로 승인 원화와 비교하며 **전체 구도부터** 완성한다. 현재는 전체 구도 재검토이며, 작은 디테일은 그 뒤에 진행한다. 기존 본편 LOCK과 외부 제출 권한은 이 목표만으로 변경되지 않는다.

> 2026-08-30 갱신. 지옥의 길(EXODUSER) 수직 상승 세미 오픈월드 맵/레벨/보스/외곽 기획의 진실 공급원(SSOT) 묶음.
> 설계 문서와 현재 런타임·QA 구현을 함께 동기화한다. 실제 맵 구현은 승인된 PHASE만.

---

## 읽는 순서 (P-1 → P0 → P0.5)

### P-1 — 모든 맵 제작 에이전트 필수 제작 가이드

0. `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` — 전체맵 MASTER PLAN부터 OUTER MASS FIRST, LARGE→MEDIUM→SMALL, GROUND 연결, CAMERA/COMBAT/TECH QA, 8개 제작 GATE, 표준 `MAP PRODUCTION REPORT`까지 규정하는 공통 작업 순서

맵 설계·geometry·collision·outer/baked composition·오브젝트 배치·랜드마크·카메라/전투 QA 작업은 종류와 stage에 관계없이 이 문서를 먼저 완독한다. 이 가이드는 **제작 프로세스 SSOT**이며, 확정 수치·좌표·runtime 계약은 사용자 최신 지시와 아래 stage별 LOCK/SSOT가 우선한다. `v0.9 FIELD TEST`이므로 CH1/CH2 검증 결과를 반영하되 임의로 `v1.0 PRODUCTION LOCK`으로 승격하지 않는다.

실제 CH1-1(`si0/stage0`)의 GATE 2~4 locked outer는 `CH1_1_START_OUTER_MASS.md`, default smoothing 완성 master는 `CH1_1_SMOOTHING_PASS.md`, 현행 `forestBoundary:1` tile geometry와 authored63/runtime64 계약은 `CH1_1_COMPOSE_초안.md`에 기록한다. runtime은 smoothing/outer 중 선택한 chunk set 하나만 그리며 canonical tile wall은 둘 모두에 공통이다. 기존 CH1-2 opt-in 실험 기록과 혼용하지 않는다.

### CH1-1 현행 적용 SSOT

- `CH1_1_PRODUCTION_FINISH_20260916.md` — 사용자 전체 제작 지시에 따른 고정 geometry, production 배경, 접합 리터치, 5개 handProp 좌표 및 남서 스폰 보정, 런타임 증거와 검증 한계. 2026-09-04 smoothing/outer 문서는 이전 제작 이력이다.

### P0 — 마스터 SSOT 6종
1. `WORLD_STRUCTURE_SSOT.md` — 세계 구조: 7지옥/35에리어/200×200/수직상승 S자/로딩경계/UD 해소 기록
2. `LEVEL_DESIGN_RULES_SSOT.md` — 설계 규칙: PLAY/RIM/OUTER, 길·전투장 비율, 금지 패턴
3. `MAP_RUNTIME_ARCHITECTURE.md` — 런타임 감사: G.map/isW/스폰/전환/미니맵/스트리밍 (실측 라인번호)
4. `CH1_VERTICAL_SLICE.md` — CH1 첫 완성형 슬라이스 스펙 (기존 LOCK 보존)
5. `MAP_IMPLEMENTATION_ROADMAP.md` — PHASE 0~12 + 독립 Task 규격
6. `MAP_QA_GATES.md` — 검증 게이트 (Geometry/Combat/Navigation/Minimap/Transition/Performance)

### P0.5 — 설계 완결·QA 9종
7. `BOSS_CANONICAL_MAPPING.md` — 보스 Lore↔Runtime 분리 매핑 (35 si, UD-MAP-02 해소)
8. `STAGE_SPATIAL_GRAMMAR.md` — (A) 공간 문법·권장 수치 (T40/이속2.6/뷰포트48×27t 근거)
9. `MAP_GRAMMAR_VARIANTS.md` — (B) 8 topology archetype + 챕터 배정
10. `VERTICAL_ASCENT_LANGUAGE.md` — (C) 탑뷰 수직 상승 연출 언어
11. `GIANT_BOSS_PRESENCE_LADDER.md` — (D) 거대보스 존재감 5단계 사다리
12. `OUTER_DEPTH_MODEL.md` — (E) OUTER-A/B/C 심도 모델 (구현수단 미LOCK)
13. `CH1_1_BLOCKOUT_MASTER.md` — (F) CH1-1 START→EXIT 단일 좌표 규격표
14. `MAP_DESIGN_CLOSURE.md` — (G) 반복감사 + (H) 착수게이트 + 최종감사 + READINESS 판정
15. `MAP_TEST_SERVER.md` — 35개 본편 맵 QA 서버/허브/URL/포트/검증 계약; 2026-09-24 일반 게임과 동일한 창/resScale 및 backing1x, 허브 logical viewport는 현재 창 크기
16. `CH3_1_HELL_WINTER_IMPLEMENTATION.md` — CH3-1 핏빛 황폐지 200×200 지옥 동토 전장·source authored 346/runtime 343·21 object source(+base ground 1)·crop 13종/87 instance·Final Macro 4-family silhouette + central floor detail 6·카메라/전투/이동 QA
17. `CH1_1_START_OUTER_MASS.md` — 실제 CH1-1 8192²/64-chunk outer mass와 대응 canonical forest tile boundary, BACK14/LARGE20/MEDIUM16/GROUND1/SMALL0
18. `CH1_1_SMOOTHING_PASS.md` — 실제 CH1-1 기본 smoothing 완성 master, EDGE8/CORNER4/TREE4/SIDE10/OPEN5/SMALL0, structural module instance0, authored63/runtime64/collision23, 2026-09-04 crisp 재베이크 현행
19. `CH1_1_CRISP_SMOOTHING_REMODEL_2026-09-04.md` — `fit:fill`/raster·SVG blur로 생긴 흐릿한 보라 띠 제거, `fit:contain`, blur0, 최대 확대1.3×, 64청크 재베이크와 카메라 QA

---

## 외부 게임 구조 연구 (참고 자료 / 구현 계약 아님)

- [DIMRAETH_MAP_RESEARCH_20260916.md](DIMRAETH_MAP_RESEARCH_20260916.md) — 설치 파일의 환경 씬 5개 분석, 재사용 방 바닥·분리 지형 레이어·PLAY/vista 계층 근거와 EXODUSER 빌드 시 구역 조합 제안. **조사 완료 / production 미적용**이며 stage LOCK을 변경하지 않는다.

## 확정 결정 (LOCKED)

| ID | 결정 | 근거 |
|---|---|---|
| MAP SIZE | 200×200 field LOCK (runtime 크기, 세계 크기 아님; PLAY/RIM/OUTER로 대세계 연출) | UD-MAP-01 (유저) |
| BOSS | Lore(design)↔Runtime(HELL_BOSSES) 분리 매핑, 양쪽 보존 | UD-MAP-02 (유저) |
| 수직 상승 | 썩은숲(최하)→지옥성(최상)→탈출, 기존 선형순서 재해석 | 유저 |
| 로딩 경계 | 스테이지/층 전환만, 내부 무로딩 | 벤치마크 D4 정합 |
| CH1-1 blockout | 초안 DESIGN LOCK 좌표 보존 | 기존 |
| CH3-1 HELL WINTER | 중앙 64×64 open arena, corpsefield 54, `CH3_HELLWINTER_V1` 성벽 `I36/L2/END4/GATE2`, BACK18/MID21/tower16/gate1/FRONT14/GROUND16 + 4-family crest16 + central floor detail6, 6개 비대칭 POI, source 346/runtime authored 343 | 2026-08-30 Central Detail: **WALL/GAMEPLAY/SILHOUETTE/REPETITION/DENSITY/LIGHTING/COLOR/CANONICAL COMPARISON/CENTRAL DETAIL PASS, CH3-1 VISUAL FINAL PASS**. source image 21(+base ground 1), crop 13종/87 instance, rot 81, mirror 30, filtered 40, edge-erased 4종/5 instance, composite 8, 신규 원화 0 |

## IMPLEMENTATION_READINESS = PASS (PHASE 1 한정)
- CH1 si0 **MAP-P1-PLAYABLE-BOUNDARY 적용**: `forestBoundary:1`, `MAP_ALL_FLOOR=false`, wall16495, exits y7. 다음 전역 P1/P2는 다른 stage로 확대하지 않고 별도 승인한다.
- **현재 상태: BLOCKED_BY_CONCURRENT_WIP** — game.html이 동시 세션에서 DIRTY. clean HEAD 확보 시 착수.

## 잔여 UD (P1 비차단)
- si2 명칭 통일(지옥기형↔숲의 사냥꾼) · 전역 OUTER 렌더수단 선택(P2) · runtime-only 15보스 로어 부여. 실제 CH1-1 stage0은 locked outer+default smoothing의 64-chunk local 예외, CH1-2 stage1은 별도 opt-in 예외다.

## CH2-1 몬스터 QA 계약 — 2026-08-30

- production si4는 소환굴 **11개(S4/M5/L2), 총 스폰 예산 900**과 etype 39 출구 문지기/동반 웨이브를 유지한다. 맵 허브는 si4에서 `combatqa=1`을 기본 사용해 `몬스터 ON`으로 열리며 버튼으로 무전투 관람과 전환한다. 이 옵션은 QA 전용이고 geometry·collision·route·authored/MAP_OBJS·production 밸런스를 바꾸지 않는다.

## 미완 (P1 이후)
- CH2-1(si4)은 `_CH2S4` **109-entry** mega-first 벌레굴(locked base 78 + wall-belt BACK/MID 9 + filler 12 + seam 10; backfill 9/boundary 50/landmark 18/detail 6/mask 4/filler 12/seam 10, authored runtime 109/109, skip 0; system 포함 `MAP_OBJS` 111)로 구현했다. collision/non-collision은 **51/58**이다. `w:30,authoredWidth:1` 22-point 경로가 START→알집→동측 dead end→점액→굽은 굴→깊은 굴→EXIT를 잇는 실제 S자 tile silhouette를 만든다. CH2 전용 RGBA MEGA 10종/실배치 17개와 giant carapace·giant hive·deep hive·organic EXIT frame은 고정했다. visual-only BACK/MID 9개는 사용자 제공 1254² RGBA wall skin 6종, 기존 ridge L/R 2개, 중앙 오른쪽 collision recess를 막힌 깊이로 읽히게 하는 `m_c2backHive (112,70,8°,overlap .16)` 1개이며 잠금 MEGA 뒤에 먼저 렌더한다. connector 5종/12개와 web/chitin/egg seam 3종/10개가 top 7/central bridge 8/central recess 1/east pocket 7/lower 8개 외벽 shoulder를 마감한다. backfill/filler/seam collision은 각각 0이다. legacy `m_c2edge*` authored 사용은 0, 반복 중형 세로 구조물은 runtime-visible 57→42개(-26.32%), off-path 자동 배치·random wall eye·accidental floor patch는 0을 유지한다. floor cleanup은 CH2 ground 연속 dark void base + 가변 반경 `(w+4)` render mask + render-only stain 10/vein 6/soft halo + 양쪽 3층 quadratic chitin rim(shadow `6.4T`/body `4.5T`/highlight `.34T`)으로 collision tile을 수정하지 않으면서 긴 대각 color cutoff를 벽 shoulder로 판독시킨다. reported recess runtime `(111.5,70.5)`, prop collision false, map hash `fefe09a0`, pageerror/CH2 broken sprite/asset 404 0이며 최신 비교는 `captures/ch2_reported_gap_20260830/after_recess_fix/`다. 사용자 visual 승인 전 FINAL은 미확정이다. 잔여 CH2-2~CH7 에리어 blockout · 위험타일 런타임 · 늪 전이타일/전경occluder/OUTER렌더 · hell1~6 per-boss 문서 · 미니맵 보스/게이트 마커.

## 저품질 에셋 재사용 금지

맵 에셋 선택 전 [2026-09-27 폐기 SSOT](LOW_QUALITY_ASSET_RETIREMENT_20260927.md)를 확인한다. 구형 묘비·흑백 노출 뿌리와 동일 사본은 현행 승인 에셋이 아니다.

38차 [구형무기더미 폐기 및20종검수](CH1_LOW_QUALITY_AUDIT_20260927_PASS38.md): 기존폐기목록에추가,현재금지id총8개. sword_pile과혼동금지.

39차 [구형나무·덩굴기둥 폐기](CH1_LOW_QUALITY_RETIREMENT_PASS39.md): 추가7id,전체15id사용금지. 원화와충돌동반제거,내부dry아틀라스동작보존.

40차 [지면소품4종폐기](CH1_GROUND_DECAL_RETIREMENT_PASS40.md): 전체19id사용금지. 전투VFX ground_crack_sheet와혼동금지.

41차 [소형독액·육편장식폐기](CH1_SMALL_ORGANIC_RETIREMENT_PASS41.md): 전체29id사용금지. 거미줄/실제독구덩이와혼동금지.

42차 [구형거미줄폐기](CH2_WEB_RETIREMENT_PASS42.md): 전체33id사용금지. CH2 seam4개제거,큰벽·통행·충돌보존.

43차 [낙엽소품폐기](CH1_LEAF_RETIREMENT_PASS43.md): 전체34id사용금지. 공유뼈·시체는타챕터검토대상으로유지.

44차 [제단고지대외곽알파연결](CH1_HILL_EDGE_BLEND_PASS44.md): smoothing 정상부·오르막 접합 및 전체 외곽 48px 감쇠, 높이·충돌 불변.

45차 [제단 사면 재질·방향광](CH1_HILL_SHADING_PASS45.md): 갈색 띠 완화 및 ramp 월드 텍스처 정렬. 44차 alpha 감쇠 유지.

46차 [제단 정상부 윤곽](CH1_HILL_CONTOUR_PASS46.md): 96점 비대칭 정상부와 organicSkirt 명암, 높이·충돌 유지.

47차 [제단 바닥 반복 완화](CH1_HILL_MATERIAL_PASS47.md): 정상부/ramp 무늬1.4배·저채도 대비, 공통 월드 정렬·윤곽·충돌 유지.

48차 [제단 사면 깊이 보강](CH1_HILL_DEPTH_PASS48.md): 정상부/ramp alpha 실루엣 그림자, 높이·충돌 불변.

49차 [북동 독구덩이 접지](CH1_POOL_CONTACT_PASS49.md): m_c1pool(6700,1740),512²RGBA/1MiB, 가시 대상1draw. 모듈20260927-49.

50차 [북동 독구덩이 버블 파열](CH1_POOL_BURST_PASS50.md):3vent/6400ms,64프레임 공유버블+16프레임가스,1MiB추가.모듈20260927-50.

51차 [북동pool 젖은 지면 번짐](CH1_POOL_SEEP_PASS51.md): 비대칭18~44캐시px,512²재사용/추가draw0.모듈20260927-51.

52차 [북동pool 남쪽 지면 전이](CH1_POOL_APPROACH_PASS52.md): variant4/world(6700,1900),900×680,1.5MiB추가/지역총7.5MiB,가시1draw.모듈20260927-52.

53차 [서쪽뼈아치접지](CH1_ARCH_CONTACT_PASS53.md):CH1(1420,6020)한곳,256²/.25MiB,가시1draw추가.타챕터/충돌유지.모듈20260927-53.


### CH1_HIDDEN_UNDERLAY_20260929 — 현행 바닥 렌더 계약

완성 production_finish 화면이 전체 뷰포트를 불투명 ready청크로 덮으면 _ch1StartOuterCoversView가 가려진 _fillVoidWithFloor·20개 _oriFireflies·기존 맵캐시 분기3그룹을 렌더에서 제외한다. 매 프레임 줌/흔들림/가장자리·1026² ready를 검사하며, 로딩·오류·맵 밖 노출·다른stage/보스아레나/outer·Rootworld·초기폴백은 원래 바닥을 유지한다. ?ch1LegacyUnderlay=1은 비교용. visible 생체/언덕/소품/ATMO·19빌드레이어/이미지·충돌 삭제0. 캐시 메모리 전체해제나FPS개선율을 주장하지 않는다.

현행 공식·수치·검수는 [가려진 레이어 정리 SSOT](CH1_HIDDEN_UNDERLAY_20260929.md)를 따른다. 앞선 날짜별 회귀·FPS·아트 수치는 당시 검수 이력이다.


## 2026-09-29 세로 리사이즈 하단 필터 경계

환경광 `G._envLightCvs`·동적 비네트 `G._dvgCvs`·저체력 틴트 `G._redTintCvs`가 화면 너비만 확인하던 조건에 각 캐시의 `height!==C.height`를 추가했다. 본편/쉬운 테스트 공통, 높이 변경 직후 재작성·정지 시 캐시 재사용·색과 alpha 유지·신규 캔버스0. 두 파일 12건 RED→신규18+기존17=35 PASS, 본편2805×1206→1256→1006→1256에서 env/dvg 높이1206 고정→현재 main 높이 일치. 이전 Mac 이동/성능 문제의 해결 선언이 아니다. [정확한 계약·MAP PRODUCTION REPORT](../12퍼포먼스·최적화/POSTFX_HEIGHT_COVERAGE_20260929.md).


---

## 2026-10-02 — 보스 사망 후 필드 진행 보존 (현행 재도전 계약)

| 항목 | 현행 정본/우선 경계 |
|---|---|
| CH1-1 보스 사망 후 진행 보존 | [CH1-1 보스 사망 진행 보존 정본](CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md) — 일반 arena field backup 복원 + 해금 완료 CH1-1 현재 필드 사망 예외의 현행 계약 |
| 기존 재시작 문장의 범위 | REGION_CLEAR_GATE/맵오브젝트/몬스터/시간 정본의 “retry initStage·재생성”은 본 날짜 부록의 분기 예외를 우선 적용. 해금 전 CH1-1·다른 일반 필드/시연 si=3는 기존 계약 |
| 맵 SSOT 우선순위 | 공통 제작 가이드→현행 CH1-1 콘셉트/production finish→P0/P0.5 순서 유지. 이 정본은 원화·지형·배치·보스 수치·Gate 임계치 정본을 대체하지 않음 |
| 검수 | 30/30 source PASS +5/5 인접 자원 회귀 +inline12/importmap2구문 PASS. 실게임·카메라·시각·오디오·성능 미인수 |
| 전체맵 판정 | 기존 MAP-020 RETOUCH 역사 판정 유지, 이번 수정 새 visual PASS 0 |
| 영수증 | `tmp/mac-migration-runtime/continued-review-20261002/boss-respawn-backup/receipt.json`; 46개 field key/양판 SHA/대역·미검증 경계는 전용 정본 |

기존 이력·타 팀 산출·보호 설계 원문은 유지하고 append-only로 계약을 보강했다.


## 2026-10-05 — 지옥의 틈 독립 맵 후보 (미채택)

[지옥의 틈 두 규모 후보](HELL_RIFT_MAP_CANDIDATE_20261005.md): 모든 장 사이와 스테이지 사이의 반복 거점 범위는 사용자 확정. 장간 큰 거점·스테이지간 작은 쉼터 구분은 제안. 독립 HTML 보행·이미지·충돌 후보이며 본편 genFromTemplate/stage/NPC/세이브 미연결. VISUAL VERDICT RETOUCH. 기존 P0/P0.5·35필드·stage LOCK·생산 후보의 우선순위를 대체하지 않는 참고 문서다.

최신 외형 정정: 지옥의 틈은 건물 마을이 아니라 사람들이 머무는 기묘한 이공간이다. 최초 천막 후보는 미채택 이력으로 보존하며 회화적인 빛·지형 깊이·재질을 새 원화 기준으로 삼는다. 자동 실행과 제작팀 배정은 재개하지 않는다.

최신 interspace 원화·기본 미리보기: 1920² 회화적 이공간, 남쪽 진입과 서로 다른 두 경로·북쪽 상승로. MagicLight Toolbox UI 생성으로 직접 API 호출은 없음. 원본과 보수적 2D 보행 마스크를 보존하며 NPC·높이·생산 stage에는 미연결. [정확한 파일·수치·생성 프롬프트·MAP PRODUCTION REPORT](HELL_RIFT_MAP_CANDIDATE_20261005.md), VISUAL VERDICT RETOUCH.


## 2026-10-05 — 지옥의 틈 부분 깊이 후보

승인 원화 무변. 독립 미리보기에 새 심연 후경/카메라 시차, 기존 전사 보행/접지, 발 기준 부분 전경 가림과 투명화, 중앙 심연 안개를 연결했다. 본편 GPU/높이 물리/전환/세이브 미연결, 전체 환경 투명 분리 잔여. **VISUAL VERDICT RETOUCH.** 정확한 정본은 [지옥의 틈 보고서 최신 레이어 절](HELL_RIFT_MAP_CANDIDATE_20261005.md), 기획은 [콘텐츠 계획§20](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md). 이전 후보 보고는 시점별 이력이다.


## 2026-10-05 — 사용자 최신 맵 에디터 우선순위

지옥의 틈 실제 제작에 앞서 현재 원화/심연/지면/전경/안개 레이어와 보행·충돌/진입·출구/가림을 편집하고 전사로 시험할 독립 맵 에디터를 우선한다. 기존 MAP팀 수동 한 건이며 자동화·다른팀 전체 재개는 없다. [콘텐츠 계획 §21](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md), [총괄 최신 수동 재개](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md), [지옥의 틈 보고서 후속](HELL_RIFT_MAP_CANDIDATE_20261005.md)을 따른다. 기존 LOCK/35필드/생산 계약은 유지하며 에디터는 아직 미완료다.


최신 품질 요구 보충: [콘텐츠 계획 §22](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)의 Unity 수준 씬 편집 기능을 같은 MAP 한 건에 추가했다. 기존 높이/오브젝트/프로젝트 계약 재사용, 계층·변형·빛·가림·보행 미리보기·저장 왕복·게임 출력이 목표다. 지옥의 틈은 첫 검수 씬이며 에디터/본편 완료는 아직 아니다.


외부자산 후속: [콘텐츠 계획 §23](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)의 Unity용 맵 에셋 임포트·카탈로그·배치·보존 계약을 같은 MAP 에디터 한 건에 추가. 이미지 지원과 모델/프리팹 변환 지원을 구분하며 현재 생산 3D호환을 선언하지 않는다.


최신 협업 범위: [콘텐츠 계획 §24](../0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)의 기존 전문15팀 전원 수동 제작을 적용한다. 오더는 Codex7/Claude8 각각 유일 담당, raw 소유 분리와 연결 v1/단계별 Gate 준수. MAP 단독이던 직전 범위는 이력이며 자동화·새세션·생산 정본 전환은 아직 없음.


## 2026-10-05 최신 — CH1-1 A급 제작 목표

[CH1_1_A_GRADE_PRODUCTION_20261005.md](CH1_1_A_GRADE_PRODUCTION_20261005.md)는 최신 사용자 요청의 1-1 우선 품질·15전문+root통합16역할·정확핀/가동실패·8-camera/6단계·청취 GATE 정본이다. 기존 stage LOCK/geometry/진행SSOT를 덮어쓰지 않는다. 지옥의 틈·에디터 요구/WIP는 보존. root 비대칭외곽 PNG1점 미채택보존, 생산교체0 / **VISUAL RETOUCH**. Codex7 승인필요/never 송신거절·Claude8 기존등록소실/현재새등록 공식역할 미확인으로 실제 새전달/착수0이며 자동화중지 유지.


## 2026-10-06 — 씬 에디터 제작 결과

[지옥의 틈 · 잔류자의 계곡](HELL_RIFT_EDITOR_RESULT_20261006.md): 6레이어/10객체 씬 JSON. 원화6 crop·전경3·심연1, 고정mask 내부feather120/source시차.965·기존8방향 전사. 자동카메라 경계 clamp. [씬 SSOT](MAP_SCENE_EDITOR_20261005.md)에 안전 query·정확 계약 기록. 본편채택·NPC/진행/native 인수는 후속, VISUAL RETOUCH.


### 2026-10-06 결과 씬 보행 정합 보정

저장된 잔류자의 계곡 scene JSON은 초기 허공 통과를 수정해 동측 그림 바닥·계단에 맞춘 34점/반폭2.75tile corridor로 변경했다. 현행 walkable1192 / radius12 BFS1185 / navSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. 원본 PNG/layout와 기본 프리셋 nav4107은 그대로다. 실제 키종주267tiles/158turns/36.445초·오류0, 편집 결과는 본편 미채택. 정확 좌표·시각 한계·검수는 HELL_RIFT_EDITOR_RESULT_20261006.md를 따른다.


### 2026-10-06 KST 최신 — Claude8 실제 재개 / 완료 후보7 보존

유일 Claude 오더담당의 01:01:43Z 기존8 역할 정상 전달·peer8/Read8/source8 및 최초 완료7의 end_turn/정확 파일 핀을 확인했다. 앞의 송신0/EPERM은 조치 전 이력이며 현재 Claude8 재개를 덮어쓰지 않는다. [완료 raw7·정확핀/endID·검수 경계 정본 §12](CH1_1_A_GRADE_PRODUCTION_20261005.md#12-claude8-실제-재개완료-후보7-원자료-보존--2026-10-06-kst)에 따른다. ART/SKILL/QA/ANIMVFX/BOSS/STORY/MAP의 독립 후보7을 생산 미채택으로 보존하고 JSON3 parse/MJS4 문법 검사 PASS를 기록한다. ENEMY 최초 turn·다른 WIP/live STATE/LOG/세이브·기존23 제외. root는 raw7+관련 docs8만 checkpoint하며 실제80부터 상세검수 대기 없이 완료소유를 보존한다.

완료7팀 후속은 유일 오더담당의 독립 메모리 조사 각1회·새 파일0/raw수정0. 자동화 중지·새팀/세션/권한/인증 변경0, 관리3/전문15=전체18 유지. Codex7 새 제작착수는 미확인. 공유 editor/core/actor/틈 결과/nav1192·본편 무변. NPC 대사/보상·분위기 consumer·장 전환/본편6단계·실청취 연결은 미완료이며 **VISUAL RETOUCH** 유지. 후보 제출/문법 PASS/Git 보존을 게임 완성이나 A급 인수로 계산하지 않는다.


### 2026-10-06 최신 — 틈 editor 분위기 consumer

최초 Claude8 원자료8/8는 정확 원격 `15f5e64b9221b7bfbf8d5ca41d5328fcc9afe4a0`에 보존됐다. root 완료ID **ROOT-RIFT-AMBIENCE-INTEGRATION-20261006**에서 ANIMVFX 원문을 보존한 world/nav/mask adapter로 저장된 틈의 안개·잔불을 에디터에 연결했다. 직전 consumer0/완료7은 당시 이력이다. [정확 계약/수치/검사 정본 §9](MAP_SCENE_EDITOR_20261005.md#9-2026-10-06--저장된-틈의-안개잔불-consumer), [최신 §23 제작 보고](HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--안개잔불의-실제-에디터-연결), [CH1 §14](CH1_1_A_GRADE_PRODUCTION_20261005.md#14-root-틈-분위기-consumer-완료--2026-10-06-kst)를 따른다. 실제 보행·장식·토글/PNG/reduced-motion 검사 및8카메라 시각확인 완료, scene/nav1192/본편 무변. NPC/대화/보상·장 gate·본편6단계/청취/A급 인수는 미완료·**VISUAL RETOUCH**. 자동화중지/유일오더·관리3/전문15=18·새팀/세션/권한변경0, 다른 WIP·live STATE/LOG·세이브·기존23 보존.


## 2026-10-06 최신 — 틈 대화 consumer / 오늘19시 보고

공식 완료ID **ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006**. 이전 NPC/대화consumer0와 모든자동화PAUSED는 당시 이력이다. 현재 에디터에 하란·베린·네사·도릭의 F근접대화/선택/시험기록/재방문을 연결했다. 실제선물·퀘스트등록/완료·가방실패·장gate·본편·native6단계·청취/A급인수는0, **VISUAL RETOUCH**. source/raw/scene/nav1192·core/actor/game/index 불변; source STORY SHA be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc. 대화15/실제Chrome12그룹·4보행/원본UI15/core29/안개10 PASS.

오늘 사용자 “작업을해서 저녁까지 보고해”를 따라2026-10-06 KST19:00에 실제완료·미완료/화면·검수·Git을한번보고한다. 기존4자동화PAUSED유지, 오늘만exoduser-2가1시간간격으로승인작업을계속하고 변화없으면알림0/19시보고뒤PAUSED. 기존1분루프·아침email/음성발송·Windows재개0. Codex7/Claude8 유일오더·관리3/전문15=18/새팀·새세션0, 전문TASK중복0, production/docs/Git root소유 유지. 현재slot4의재사용worker/read-only검수를전체16팀가동으로보고하지않는다. liveSTATE/LOG/WIP·보호2_3/Q-only·어택티켓금지·세이브·기존23 보존. 이번완료code6+관련docs11만exactcheckpoint/remoteSHA영수증, 80부터완료소유보존/100전신규산출중단.

[씬SSOT§10](MAP_SCENE_EDITOR_20261005.md#10-2026-10-06--지옥의-틈-망자-대화-시험)→[최신 결과§23](HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--네-망자에게-실제-접근하는-대화-시험)→[CH1§15](CH1_1_A_GRADE_PRODUCTION_20261005.md#15-root-틈-대화-시험-완료--오늘-저녁-보고--2026-10-06-kst) 순서로현재구현경계를읽는다. stageLOCK/기존P0/P0.5·35필드/본편geometry를대체0.

### 2026-10-06 — 맵 에디터 발 기준 찍기 현행

공식 완료ID **ROOT-EDITOR-FOOT-PIVOT-INTEGRATION-20261006**. 공유 이미지 씬 에디터의 선택된 이미지에 `발 기준 찍기`와 `MapSceneCore.reanchor`를 구현했다. 그림의 화면 위치·source/crop/mask·길을 유지한 채 기존 v1의 `x/y/pivotX/pivotY`만 하나의 Undo/Redo 거래로 바꾼다. 회전·좌우반전도 보정하며 잠긴/숨긴 레이어와 보행 중에는 차단한다. 모바일≤760px에서 찍기 시작 시 속성창을 접고 성공 클릭 또는 Esc 후 복원한다. 기존 기준점 숫자 입력의 동작은 변경하지 않았다.

정확 API·수식·범위·UI·저장·검수 계약은 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §11, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 발 기준 pass를 따른다. core33/33, 실제 포인터/휴대폰13그룹, 최종 기존 UI15그룹 PASS. PNG byte 동일·source/nav·사용자 세이브 불변. 코드4+관련 docs12만 checkpoint하고 원격 exact SHA는 외부 `pivot-integration-20261006/receipt.json`에 보존한다.

**VISUAL VERDICT: RETOUCH**. 발 기준 편집 구현을 주민 크기 통일·clean plate·독립 NPC body·본편/native/청취·A급 맵 인수로 계산하지 않는다. 원본 그림·STORY·결과 씬은 불변이다. 기존 paused 자동화/아침메일 재개0. 오늘 19시 결과보고 조건은 유지한다.


## 2026-10-06 독립 주민 레이어 후보 반영 — ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006

현재 root 소비자는 승인 원화 유래 인물 없는 배경과 투명 주민4명을 별도 에디터 후보에서 렌더·크기 편집·현재 foot 기반 대화에 연결했다. 이전 절의 원본 baked/clean plate·독립body 후속 표기는 해당 시점과 원본 결과 씬의 이력이다. 원본을 교체하거나 본편 FIELD NPC 구현 상태를 바꾼 것이 아니다.

| 항목 | 현재 계약·근거 |
|---|---|
| 후보 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`, SHA256 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, `ISOLATED_EDITOR_RESULT_NOT_ADOPTED` |
| 그림 | built-in imagegen, clean plate/atlas1254². 원본1920²의 정확 픽셀 추출이 아니며 세부 지형/재질이 바뀐 별도 후보. 두 생성 PNG를 byte 그대로 사용 |
| 주민 | 하란/네사/도릭 최초 본체80world px, 앉은 베린 `80*352/578`. pivot(.5,1), alpha crop>8. 유효 aspect/foot을 유지한 사용자 크기 편집 허용; 편집 후80 고정 강제0 |
| 하란 v2 | foot(4660,6660), 접근(4660,6700). body와 south-root bbox 사이35.77854671280277world px, 접근 전사 폭80 기준20px. 이전 v1(4780,6460)의 발 가림은 미채택 이력으로 보존 |
| 씬 | 원본10개 지형 객체의 world/mask·nav1192·BFS1185·r12·시작(4020,7740)/출구(4020,1740) 유지. 6layers/14assets/14objects, foot=기존3+주민4 |
| 대화 | `residentDialogueAnchors(scene)`는 현재 body x/y/height. 편집 확정 시 controller/ambience 무효화, 보행 시작 전 재생성. F범위140, 최대240·접근step20/r12·64전이·22nodes/37options는 기존 session-only 계약 |
| PNG | 2048² export, CPU readback context `willReadFrequently:true`, `imageSmoothingQuality='high'`. 보행 전후 각각 멈춘 상태에서 export한 PNG byte 동일 SHA `f7e03969aa26b4eeaf227c513e0b6e5dfd28df992aabb74f0c7e309f5d34ed84` |
| 검증 | builder 의미19/19, 기본 UI15/15, 실제4주민 보행·분기10그룹 완료 뒤 PNG 차이 FAIL을 보존. 샘플링 수정 후 targeted8/8 PASS(실제3보행, 이전 위치 F닫힘/이동 위치 F열림·Undo·JSON/PNG). pageerror/HTTP누락0 |
| 기획/운영 | §16의 전문15+root통합1=제작16 유지. Claude8 raw8 공식완료는 미채택 보존, Codex7 새7착수0(송신 자동승인 검토 거절: 승인 필요/never). 기존 paused 자동화/아침메일 재개0; 오늘19시 한 번 실제결과 보고 |

정확 구현 표는 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §12, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 독립주민 후보 절. 저장/실제지급·부탁/장 gate·높이물리·주민애니메이션·Unity package/Prefab/FBX/PSD 임포트·본편/native6단계·실청취는 미인수. 확대 grain/전사와 주민의 재질·접지 그림자·전체 절벽 실루엣 분리는 추가 개선 대상. **VISUAL VERDICT: RETOUCH.**

완료소유 코드10+관련docs12만 checkpoint한다. 원본 scene/PNG/STORY, game.html/index.html, live supervisor STATE/LOG·타인WIP·보호2_3/Q-only·어택티켓 금지·사용자세이브·기존23 유지. 원격 exact SHA와 최초 실패/최종 화면·영상은 외부 receipt에 보존한다.


### 2026-10-06 주민 접지 그림자 소비자 — ROOT-RIFT-RESIDENT-GROUNDING-20261006

현재 구현은 독립주민 v2의 정적 발접지 그림자다. 이전 독립주민 절의 접지그림자 미구현·builder19·PNG f7e03969…는 그 시점 이력이며, 현재는 아래 계약을 따른다. 원화/atlas/scene/nav 수치와 본편 구현 상태를 바꾸지 않는다.

| 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 대상 | scene SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, strict `residentPaintingProfile(scene)`의 독립4body. generic CH1/원본 baked 씬은 비활성 |
| API | `createResidentGrounding(scene,canWalk)` → 유효 factory 또는 null. `snapshot()`는 매번 현재 scene/body를 검증, 실패[]; `draw(ctx)`는 그린 shadow 수. 읽기 전용 editor 진단 `EXODUSER_SCENE_EDITOR.grounding()` |
| 판정 | 현재 foot에서 `canWalk(scene,x,y,12)===true`. Promise/throw/false/다른 truthy는 해당body 제외. ellipse를 겹치는 tile 중심의 `canWalk(scene,cx,cy,0)===true`인 셀에 clip; 현재tile40 |
| 수식 | `rx=clamp(body.width*.42,2,32)`, `ry=clamp(body.height*.08,1,8)` world px. tileSize 양수유한·cols/rows 정수필수. clipping cell `{x,y,width,height}`는 world rect, 임의 심연/벽 보행 추가0 |
| 페인트 | ellipse 정규화 반경1 radial gradient: stop0 `rgba(8,9,6,.34)`, stop.55 `rgba(8,9,6,.15)`, stop1 `rgba(8,9,6,0)`. clip→translate foot→scale rx/ry→fillRect(-1,-1,2,2), ctx finally restore |
| 기본 하란 | foot(4660,6660), rx20.346020761245676 / ry6.4 |
| 기본 베린 | foot(6020,5580), rx21.10173010380623 / ry3.8975778546712805 |
| 기본 네사 | foot(6300,5020), rx16.09360146252285 / ry6.4 |
| 기본 도릭 | foot(5220,2500), rx17.341935483870966 / ry6.4 |
| 렌더·편집 | 바닥 뒤 foot층의 기존뿌리/전사/주민 y-sort 전에 shadow 1회. changed() 시 scene cache 무효화, 열린 drag 중에도 live body 재검증. 숨김/등록변형/잘못된profile은0. 유효resize에 그림자도 비례, 하란height120일 때 ry8 cap |
| 로드 | residents import/factory는 STORY fetch/parse와 별도 try. STORY HTTP503 주입 시 대화null·grounding4 유지. 캐릭터·원화·보행 경계·inventory/save변경0 |
| PNG | overlay=false에도 grounding 포함. 멈춘 보행 전후/숨김Undo복구 2048² PNG 7018879B SHA `24230e778be6a955108e83a16a0086c510e6f82781324c837fb6fd7ef9f06ed4` byte 동일. 실행중 player는 렌더될 수 있음 |
| 의미·화면 | 기존19+접지 negative8=unit27 PASS(동일검사 반복0). browser10 PASS/실제4WASD접근·하란F/드래그·높이·숨김Undo·JSON정확·STORY503/기본씬비활성. 정상 pageerror/HTTP/console0. 새 동영상0 |
| 픽셀 | 기존 무그림자 export와 비교해 발ellipse 근방72픽셀만 달라짐, 외부0. 원본/derived PNG·scene/nav·STORY source hash불변. 전체화면 A급 품질이나 실제광원/높이물리 인수로 승격0 |

검수 시4접근 화면 및 resize 화면을 육안 확인했다. 작은 발 그림자는 구현됐지만 확대grain/재질의 차이·정적인물·전체절벽 alpha/height·실제지급/진행save·장gate·본편/native6단계·실청취는 미인수. **VISUAL VERDICT: RETOUCH.** 본편 code patch0. 외부 backup/최초실패/현재검수/PNG/원격exact SHA: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-grounding-integration-20261006/receipt.json`. code3+관련docs12만 checkpoint, 보호2_3/Q-only/어택티켓금지/타인WIP·liveSTATE/LOG·사용자세이브·기존23 유지. Claude8 원0324 raw8는 후보 미채택 보존 완료(c9b873cb…+7d12ede3…); 현재 memory후속은 쓰기0이며 본편채택으로 계산0. Codex7 새7은 정상송신 자동승인 검토 거절(승인 필요/정책never) hold. 기존paused/메일 재개0, 오늘19시 실제결과 한 번 보고.


### 2026-10-06 — 독립 주민 대화 차단 분리·마스크 출력 안정화

공식 완료ID `ROOT-RIFT-RESIDENT-DIALOGUE-ISOLATION-20261006`. 현행 독립 주민 후보 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`의 editor consumer만 수정한다. 원본 baked 씬·그림·STORY·nav·body 값은 불변이며 이전 PASS/PNG 핀은 당시 이력으로 남긴다.

| 항목 | 현재 구현·검수 경계 |
|---|---|
| 독립 주민 보행 | strict profile/원문/중복 없는 정확4 anchor 구조 유지. 각 발 `canWalk(scene,x,y,12)===true`; 최소1명이 유효하면 controller 유지하고 막힌 주민만 근접/대화에서 제외. 전원 무효면 초기 null/열린 세션 inactive-scene |
| 원본 baked·무효 profile | 원본 그림의4 logical 발은 모두 strict true여야 생성·유지. 잘못된 source/body/profile은 전체 비활성. 검증 안 된 씬에는 이전 baked 진단 anchor를 표시하지 않음 |
| 접근·수락 | 직선 경로 간격≤20world px의 모든 검사 strict true 필수; Promise/1/throw는 실패. 대화 중 발이 막히면 선택 처리 전에 out-of-range로 닫고 새 선물/부탁 기록0. trial은 editor-session-only/actualGrant=false |
| 마스크 합성 | maskedPicture의 mask/sample/image 2D context `willReadFrequently:true`, image 합성 `imageSmoothingQuality='high'`. 캐시≤8·최대 변1024px·feather sample 최대 변256px·mask/source/world/직렬화 규격 불변. FPS 개선 주장0 |
| 실제 검수 | 의미19/19(1회). 최초 실제 XY/F/WASD 3확인·3보행 후 PNG 불일치 FAIL 보존. 합성 수정 후 Undo/무효 profile/JSON/새로고침/일반·baked/error불변6/6 PASS, 보행 재실행0. pageerror/HTTP/console0 |
| 현재 PNG | 멈춘2048² export7018386B SHA `21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a`; 편집→Undo·fresh reload/cache rebuild byte 동일. 직전24230e77…/7018879B는 수정 전 이력이며 현재 핀으로 사용0 |
| 제작·보존 | root완료 code3+관련docs12 한정checkpoint. 실제72+15=87부터 완료소유를 보존해72로 복귀; live owner STATE/LOG·타인WIP/기존23/세이브·보호2_3/Q전용·어택티켓 금지 유지. 원문8후속 메모는 미채택·idle, 중복TASK/새팀0 |
| 품질·잔여 | VISUAL VERDICT: RETOUCH. 정적 주민의 확대 grain/재질·전사와 원근/절벽 alpha·높이·실제 지급/quest/save/상승·본편/native6단계/청취 미인수. 계획이나 fixture를 게임완료로 계산0 |

정본 계약은 `MAP_SCENE_EDITOR_20261005.md` §14, 맵 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 해당 완료ID를 따른다. 외부 근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-dialogue-isolation-20261006/`의 receipt.json·first-browser-failure.json/log·browser-qa/browser-final-verification.json·실제 베린/네사 대화 PNG. 정상 code+docs commit/push와 remote exact SHA는 영수증에 기록; 새 build/server/game/게시0. 오늘19시 한 번 보고·기존paused/메일 재개0.
