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
| §14 검수 당시 PNG (현행은 아래 주민 환경광 절) | 멈춘2048² export7018386B SHA `21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a`; 편집→Undo·fresh reload/cache rebuild byte 동일. 직전24230e77…/7018879B는 수정 전 이력이며 현재 핀으로 사용0 |
| 제작·보존 | root완료 code3+관련docs12 한정checkpoint. 실제72+15=87부터 완료소유를 보존해72로 복귀; live owner STATE/LOG·타인WIP/기존23/세이브·보호2_3/Q전용·어택티켓 금지 유지. 원문8후속 메모는 미채택·idle, 중복TASK/새팀0 |
| 품질·잔여 | VISUAL VERDICT: RETOUCH. 정적 주민의 확대 grain/재질·전사와 원근/절벽 alpha·높이·실제 지급/quest/save/상승·본편/native6단계/청취 미인수. 계획이나 fixture를 게임완료로 계산0 |

정본 계약은 `MAP_SCENE_EDITOR_20261005.md` §14, 맵 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 해당 완료ID를 따른다. 외부 근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-dialogue-isolation-20261006/`의 receipt.json·first-browser-failure.json/log·browser-qa/browser-final-verification.json·실제 베린/네사 대화 PNG. 정상 code+docs commit/push와 remote exact SHA는 영수증에 기록; 새 build/server/game/게시0. 오늘19시 한 번 보고·기존paused/메일 재개0.
### 2026-10-06 — Unity 단일 Sprite 이미지 규격 consumer

완료ID `ROOT-EDITOR-UNITY-SINGLE-SPRITE-IMPORT-20261006`. 실제 checkout의 격리 editor3387에서 PNG와 동명 .png.meta2파일을 함께 읽고 단일Sprite(TextureImporter textureType8/spriteMode1)의 PPU·alignment·피벗을 기본 배치에 적용했다. 원본 full crop/data URI, 반복 배치·Undo/Redo·JSON v1 왕복 유지. ordinary PNG/JPEG/WebP의 alpha crop/400world px·pivot(.5,1)은 그대로다.

| 항목 | 현재 사실 |
|---|---|
| 단위·규격 | PPU=spritePixelsToUnits .001~1,000,000, worldPixelsPerUnit 기본40·1~32,000, width/height=원본px÷PPU×단위 각1~32,000. Custom editor pivot=(x,1−y), fixed alignment0~8별enum. 범위밖 clamp0 |
| 파일·consumer | PNG≤10,000,000B + meta fatalUTF8≤256,000B·정확2동명파일. `MapSceneUnity.parseMeta` + `MapSceneCore.unityPlacement` + assets[].unitySprite(kind='unity-single-sprite-v1'). 중복/부적합모드·메타/부분crop·PPU/피벗오류는 현재씬/history 유지 |
| 실물 출처 | 기존 UI/button.png122×69/8956B SHA9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec + meta2082B SHA3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c → PPU100/단위40/center48.8×27.6world px. QA임시배치이며 틈v2채택0 |
| 의미검수 | 새Unity suite16/16PASS·실제총4회. 1차UMD로더14실패/2차cameras fixture2실패를 외부조건기록으로 보존, 3차15PASS 뒤 plain userData apostropheP2 제품수정·회귀추가 후4차16PASS. 다른 기존suite 재실행0 |
| 화면·입력 | 실제 브라우저23고유그룹PASS·실행5회(최초16+plain문자1+남은4+실제viewport1+버튼줄바꿈1), 성공한 다른검사 반복0. 390px/scale1/viewport내 속성toggle·실제tap/파일선택/배치, 단위44px·버튼55px/2줄문구확인. pageerror/404/외부서버요청0 |
| 소유·보존 | code5(editor.html/map-scene-editor.js/map-scene-core.js/map-scene-unity.js/test-map-scene-unity.cjs)+관련docs12=17만 정상commit/push. 완료소유 checkpoint 실제89→72, 원격exactSHA는 외부receipt 기록 |
| 남은 GATE | Multiple/9slice/.unitypackage/Prefab/FBX/PSD·Unity shader/script·3Dheight/runtime bridge 미구현. 틈4NPC/nav/STORY/source/game·사용자save 불변. 전체맵RETOUCH·실제grant/quest/save/상승·본편/native6단계/청취 미인수 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §15, §23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 같은완료ID. 근거는 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/unity-sprite-import-20261006/`의 receipt·first-unit-failure.json·browser-qa. 전팀가동/A급/Unity전체호환/음성·메일발송 선언0. 두오더담당 유일송신·전문팀 중복TASK/새팀·세션0, 기존paused/아침메일 재개0·오늘19시한번보고 조건 유지.

### 2026-10-06 — 독립 주민 접근 검사 inspector

완료ID `ROOT-RIFT-RESIDENT-ACCESS-INSPECTOR-20261006`. 현재 격리 editor3387에서 네 주민의 발과 시작점 연결·대화 접근 위치를 수동 검사하는 읽기 전용 편집 도구를 구현했다. 원자료·고정 approach를 생산 씬에 새로 저장하지 않으며, 기존 controller의 현재 발 대상·trial-only 대화 계약은 유지한다.

| 항목 | 현재 구현 경계 |
|---|---|
| 대상·API | `tools/map-scene-resident-access.mjs`의 `inspectResidentAccess(scene,canWalk)`. strict 독립 profile만 `mode=independent`/4rows, review가 있지만 불일치=`invalid-profile`, 원본 baked·generic=`unsupported`, 함수 누락=`invalid-query`; 실패 rows[]·추정 fallback0 |
| 판정·단위 | radius12/range140/line step20/minApproachDistance40world px/maxCells40000. nav0/1과 world를 검증하고 시작→자기 cell중심/4방향 BFS edge/중심→foot 및 추천점→foot 모두 양끝 포함≤20 간격 stricttrue. Promise/throw/1 통과0 |
| 현재 위치·접근점 | body 현재 x/y와 objectId/npcId 사용, 고정 anchor.approach 무시. 연결된 tile중심 중 거리40…140 후보를 distance→y→x로 정렬하여 유효직선 최초1 선택. foot-blocked/start-blocked/no-route/no-approach/ready 구분, 다른 주민 차단 전파0 |
| 편집 화면 | inspector 주민 접근 검사 버튼,4카드의 이름/발/새 접근점/거리/상태, 발 위치 보기=선택과 camera만 변경. 모바일 보기 뒤 inspector닫힘; teleport/배치/nav/자동저장·History 변경0 |
| 갱신·export | 검사 버튼당 새 query1회, RAF/BFS자동재실행0. position/size input·드래그/첫brush/changed·Undo·import(save=false포함) 즉시 이전결과 무효화. 표시 토글/원형범위140·십자6screenpx·접근점5screenpx·실선1.5screenpx; 편집 overlay만, 보행/drag/pending/PNG에 표시0 |
| 의미검수 | 신규 suite12/12 PASS·실제1회·실패0. 실제4ready/이동·독립차단/고립섬/start seed/foot중심/중간구간/r12/invalid/failclosed/비변이. 기존 성공suite 반복0 |
| 화면검수 | 신규 Chrome12/12그룹PASS·실제launch1·실패/pageerror/404/외부서버요청0. overlay on/off의PNG7018386B SHA21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a 정확동일·JSON c508e70d…불변. 390px/scale1 touch에뮬레이션·버튼180×44px·가로넘침0·camera보기PASS. 보호14핀 before/after불변+승인원화a3d95a…확인. 원본4주민WASD재실행0;F대화가드1은하란만시작근처로옮긴외부fixture시험이며실플레이인수0 |
| 보존·인수 | source v2 c508e70d…/STORY be14b141…/game4f4eba25…/주민모듈·core 불변. 검수완료 root소유 code4+관련docs12=16만 정상checkpoint 범위이며 변경88개에서 타인72개와 분리; exactSHA·보존후실제수는 외부receipt 기록; live STATE/LOG·타인72WIP·기존23/save/2_3/Q-only/어택티켓 금지 보존 |
| 잔여 | VISUAL VERDICT: RETOUCH. 후보 원화 재질/정적 주민/높이/실제grant·quest·save·상승/본편native6단계·실청취 미인수. 시작연결 PASS는 실제 게임 이동·전투·보상 인수가 아님 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §16, §23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부 백업·의미검수·화면·Git영수증=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-access-inspector-20261006/`. 두오더담당 유일송신/전문팀 중복TASK·새팀·실행세션0, 기존paused/아침메일 재개0·오늘19시 실제결과 한 번 보고 조건 유지.

### 2026-10-06 — 이미지별 다음 배치 크기·발 기준 규격

완료ID `ROOT-EDITOR-WORLD-PLACEMENT-PRESETS-20261006`. 일반 이미지를 편집한 크기·기준점으로 반복 배치하려면 매번 숫자를 다시 입력해야 했다. 선택 객체의 width/height/pivotX/pivotY 네 값만 자산별 기본 규격으로 보존하는 editor3387 consumer를 구현했다. 현재 객체를 일괄 확대하거나 본편 자산을 교체하지 않는다.

| 항목 | 현행 계약과 인수 경계 |
|---|---|
| JSON v1 | assets[].placementPreset 선택 `{kind:'world-placement-v1',width,height,pivotX,pivotY}`. world 크기 각 Number 유한1…32000, 피벗 각0…1. 잘못된 kind/null/array/문자수치/비유한/범위밖은 validate와import/History에서거절 |
| API·우선순위 | `MapSceneCore.placementDefaults(asset)`는 기존 unityPlacement를 먼저 검증한 뒤 preset이 있으면 fresh4값, 없으면 Unity기본 또는null. 다음 pointer배치=preset > UnityPPU·피벗 > 기존library너비/일반400·crop비율·pivot(.5,1). 저장된height도명시적으로적용 |
| 규격 저장 | `capturePlacement(asset,object)`는 Unity유효성과일치assetId+현재4값을검증해 freshkind+4값 반환, 입력쓰기0. UI는선택한assetId의optional메타만 History1트랜잭션에저장. 회전/반전/opacity/mask/좌표/레이어복사0 |
| 복원·왕복 | 기본규격복원은asset의placementPreset만제거, Unity메타/기존객체불변. 다음배치는Unity또는기존library/400으로복귀. 프로젝트JSON/로컬씬복구/Undo/Redo에서규격왕복; 게임세이브를사용하지않음 |
| 화면·가드 | scene-placement-save/reset/status(리프role=status·aria-live=polite), 버튼전체너비·min-height44px·문구줄바꿈. 선택없음/internal자산/마스크객체/잠금/숨김/busy/보행/대화중 저장·복원차단. 현재선택또는팔레트자산의다음규격만표시 |
| 주민 안내 | 접근검사의40…140world px타일중심조건을실제안내문에명시. controller거리0대화허용/최소거리/고정approach/계산규격변경0 |
| 새 의미검수 | 신규suite14/14PASS·실제1회·실패0. 일반·Unityoverride/restore·strict거절·detached/원본불변·JSONv1·History/invalidimport원자성·실제v2등록/body/nav보존검수. 기존성공검사반복0 |
| 새 화면검수 | 신규 Chrome14/14그룹PASS·실제launch1·실패0. 실제PNG/pointer/Unity·규격저장·반복배치·JSON왕복/Undo/복원·가드·390px touch 에뮬레이션은외부QA기록을따른다. 기존성공suite/원본4주민종주반복0, 휴대폰/native 인수0 |
| 소유·보존 | code4(editor.html/map-scene-editor.js/map-scene-core.js/test-map-scene-placement-presets.cjs)+관련docs12=16완료범위. 실제NUL88의완료소유만정상checkpoint·원격exactSHA/후속72대조는외부receipt. 타인72/기존23·liveSTATELOG/보호2_3/Q전용·어택티켓금지·사용자세이브보존 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 정적주민·확대원화흐림/높이·본편 실제grant/quest/save/상승·같은후보native6단계·실청취미인수. 규격도구PASS를맵A급·Unity전체호환·실플레이완료로계산0 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §17, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부백업·핀·의미/화면·Git근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/placement-presets-20261006/receipt.json`. 새팀/전문팀중복TASK/빌드·서버·게임/Windows0. 기존paused/아침메일재개0·오늘19시실제결과한번보고조건유지.

### 2026-10-06 — 활성 레이어 객체 목록·직접 선택

완료ID `ROOT-EDITOR-LAYER-OBJECT-LIST-20261006`. 격리 editor3387에서 전경 뒤에 가린 NPC·소품도 이름으로 찾아 직접 선택한다. 이미지를 추가하거나 주민·길을 움직이는 대신 선택과 카메라를 제어하는 제작 도구다.

| 항목 | 현행 계약·인수 경계 |
|---|---|
| 목록 API | `inspectLayerObjects(scene,layerId,query='',page=0)`, 현재 층만 조회, 한 페이지 50행. 검색은 이름/id/assetId에 trim·소문자 includes, 최대160자. page 정수0…1000000, 범위초과는 마지막 페이지; 0매칭은 page0/pages0. fresh rows만 반환 |
| 앞뒤 순서 | flat은 배치 배열 역순, foot은 y 오름차순 안정 정렬 후 역순. 같은 y에서도 나중 배치한 그림이 앞이다. canvas hit도 이 역순으로 수정했으며 alpha threshold8/mask/좌표 변환은 유지 |
| 선택·보기 | fresh layer/object ID 재조회. 선택은 selected/layer/tool/palette/held key 상태만, 발 보기는 시차를 반영한 camera 중심+기존900×600 zoom/clamp만 변경. scene/nav/source/History/autosave/대화 데이터 쓰기0 |
| 가드·화면 | busy·playing·dialogue 및 숨김·잠금 층은 선택/보기 차단. parallax0은 직접 선택만 허용하고 발 보기 차단. 검색/선택/보기/이전/다음 min-height44px, 지정 목록 replaceChildren·리프 text만. Enter/Space는 새 버튼의 기본 활성 동작을 유지 |
| 의미·화면 | 새 의미검사14/14 PASS·실제1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS, 실제 launch 1. 최초 실패와 후속이 있으면 외부 기록을 그대로 보존한다. 기존 성공 suite·네 주민 종주·대화 분기 반복 0. 모바일은 390px/scale1 touch 에뮬레이션이며 물리 휴대폰 인수가 아니다. |
| 보존·Git | code5(editor.html/map-scene-editor.js/css/map-scene-object-list.mjs/test-map-scene-object-list.cjs)+관련docs12 정확17 완료 범위만 정상 checkpoint. 실제 NUL89→72 및 HEAD=remote exact SHA, 타인72/보호8 핀 대조는 외부 receipt. live STATE/LOG·기존23·save·2_3·Q전용·어택티켓금지 유지 |
| 남은 GATE | 도구 선택/입력 검수와 전체 맵을 구분한다. VISUAL VERDICT: RETOUCH. 원화 확대 재질/높이·정적 주민·실제 grant/quest/save/상승·본편 native6단계·실청취 인수는 남아 있다 |

정확 API/UI 계약은 `MAP_SCENE_EDITOR_20261005.md` §18, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은 완료ID. 백업·의미/화면·검색·Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/layer-object-list-20261006/receipt.json`. 새 전문팀/세션/중복 TASK/빌드·게임·서버/Windows/게시0, 기존 paused 자동화와 아침메일 재개0. 오늘19시 단일 보고 조건 유지.

### 2026-10-06 — 여러 그림의 상대 간격을 유지하는 동시 이동

완료ID `ROOT-EDITOR-BATCH-TRANSLATE-20261006`. 격리 editor3387에서 현재 층의 NPC·소품·구조물을 체크해서 함께 이동한다. 같은 이동 거리만 적용하므로 서로의 간격·각 그림 크기와 발 기준은 유지된다.

| 항목 | 정확 현행 계약·인수 경계 |
|---|---|
| 읽기 전용 계산 | `MapSceneCore.translateObjects(objects,dx,dy)` → fresh `[{objectId,x,y}]`. 배열1…2000, ID≤160·중복거절, 입력/결과좌표−40000…40000, 공통dx/dy−80000…80000 유한 Number. 한 개라도 잘못되면 전원 거절; 입력쓰기/개별snap·clamp0 |
| 선택·수명 | 활성층 하나의 UI Set만. 체크/검색/페이지 유지, 현재층 모두선택은 검색과 무관하게 전부. 층 변경/import/UndoRedo/보행 시작/팔레트 선택/단일 목록 선택·보기/다른객체hit/빈곳hit/Esc에 해제. JSON v1에 그룹/선택id 필드 추가0 |
| 소비자 | 수치dxdy와 묶음drag 모두 공통delta에만 tileSize snap1회(OFF면 소수 유지). 한 History로 x/y만 적용, Undo1회 복원. 수치0delta는 History/autosave0. drag 범위 초과는 전원 gesture 시작좌표 복귀; 다음 유효 입력부터 재개 |
| 가드·입력 | busy/playing/dialogue/잠금/숨김/fresh ID 검사. 다중 선택 중 단일 크기·발 기준·회전·mask/규격/복제/삭제/층이동 차단. workspace focusin INPUT/SELECT/TEXTAREA는 held 이동/Space 해제, 씬·대화 상태 쓰기0. 그룹 선택 checkboxlabel와 수치·버튼 min-height44px |
| 실제 검증 | 신규 의미13/13 PASS·최초1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS / 실제 launch 2. 최초 실패·필요 후속이 있으면 browser-qa 원본에 보존하며 성공 suite·네 주민 종주·F 분기 반복0. 390px touch 에뮬레이션이며 실물폰 인수0. |
| 보존·체크포인트 | code5+docs12 정확17 완료 범위만 정상commit/push. actualNUL89→72·원격exactSHA/보호8·타인72 대조는 외부 receipt. 두 담당 STATE/LOG는 본인 소유로 동시 갱신 가능, root덮어쓰기0. 기존23/save/2_3/Q-only/어택티켓금지 보존 |
| 팀 실행 근거 | ROOT-RESTART-FOLLOWUP-20261006-0644. Claude 기존8 실제peer8, 06:48 첫 수집 source6·QA선행1·BOSS대기1은 이력. 06:51:12 수집은 source8·end+idle3(SKILL/BOSS/STORY)·busy5·WriteEdit0·오류0. 완료3은 메모리 diff 미채택; SKILL composer 전체에 BOSS reward HOLD 포함, BOSS count/pet/time-attack 의미 변경 및 STORY save잠금 전 stage·중복confirm 불일치는 추가 검수 대상. Codex7 전문팀 송신은 자동승인심사 거절(approval required, policy never), 새 전달/착수0. 16팀 전원 실행·완료를 선언하지 않음 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 도구 UI/그룹이동 PASS와 환경 재질·높이·정적주민·본편grant/quest/save/상승/native6단계·실청취 미인수 분리. 발 정렬/그룹 크기 변형은 미구현 |

정확 계약=`MAP_SCENE_EDITOR_20261005.md` §19. 가이드§23 MAP PRODUCTION REPORT=`HELL_RIFT_EDITOR_RESULT_20261006.md` 같은ID. 백업·핀·신규검사·화면·docs검색·정상Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/batch-translate-20261006/receipt.json`. 새 전문팀/채팅/실행세션·중복TASK0, 기존paused자동화·아침메일재개0. 오늘19시 단일실제결과보고 조건 유지.


### 2026-10-06 — 주민 재질의 정적 환경광 · 현재 PNG와 소비자 범위

완료ID `ROOT-RIFT-RESIDENT-LIGHTING-20261006`. 현재 독립 주민 렌더 계약은 `MAP_SCENE_EDITOR_20261005.md` §20을 따른다. 앞선 §14의 “현재 PNG”21b26512…·7018386B와 접지/재질 미개선 표기는 해당 시점 이력이다. 현재 PNG는 아래 표이며 원본 atlas·scene·world 크기/발 위치와 본편은 동일하다.

| 항목 | 현행 정확 계약·실제 인수 |
|---|---|
| 소비자 | 독립editor3387의 strict residentPaintingProfile(scene)+exact4body/asset/crop만 정적grade. prefix/다른src/crop/transform/duplicateID/참조불일치는 원래이미지로폴백. 기존원화/atlas/scene/nav/STORY/game/feet/height쓰기0 |
| 페인트 | 원본crop1:1canvas에 세로gradient stop0 rgba(116,126,130,0.14), .55 rgba(116,126,130,0), 1 rgba(206,120,92,0.16)를 source-atop 합성. warmRGB상수로 전구간 계산0; 투명중간stop도실제색보간에 관여. 지면반사광/추가그림자/동적광원0 |
| 캐시·가드 | 최대4슬롯, imageidentity/src/resolvedURL/crop x/y/w/h+object/asset참조검사. 실패null캐시와 원래draw폴백; publicclear는통계도0. prepare render1회,128assets/24layers/2000objects 상한, live profile편집·import/scene교체시무효화 |
| 축소·그리기 | exactsame destinationrect/foot y-sort. actualtargettransform×body크기가 sourcecrop보다작은축이있을때만 해당주민 smoothinghigh. DPR/zoom포함, 일반pixelart·upscale의quality강제0. target와cropcontext finallyrestore. staticPNG에포함, ambient/reducedmotion과독립 |
| 현재 PNG | 2048² / 7018384B SHA `c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21`. 조명OFF동일코드대조는7018386B/21b26512…와exactsame, import/reload 후새PNG동일. 신규변화657pixels=하란222/베린116/네사162/도릭157, 네body rect밖0·최대채널차34 |
| 의미·화면 | 신규unit14/14 actual1/실패0. Chrome고유12 실행항목PASS, actuallaunch3/context4. 최초11PASS+표본harnessFAIL1→2차색보간가정harnessFAIL1→3차미완료group2만PASS. 제품수정0/성공11그룹·이전suite반복0. 오류/404/외부요청0 |
| 픽셀 검증의 범위 | 충분한alpha≥128 RGB표본486/319/348/264개,4251채널·최대오차1.9412/동일per-alpha경계3…4 위반0. source해상도crop alphaMismatch/outsideAlpha/outsideRGB=0의 명시영수증은 하란1명만; 최초중단으로다른3의값은저장되지않아 네명전체alpha정밀인수로계산0. 최종PNG4body영역외0·RGB4명검수는별도실측근거 |
| 시각·GATE | 네원본crop전후board+실제editor300%4명상세·전체맵확인. 주민조명 VISUAL PASS / 전체맵 VISUAL VERDICT RETOUCH. 확대바닥해상도/전체환경재질·높이·정적주민·본편grant/quest/save/상승/native6·실청취·실물폰/A급 미인수 |
| 팀원자료·채택 | ROOT-RESTART-FOLLOWUP-20261006-0644: Claude8기존8 memory전부완료/end8/idle8/write0(06:59:28 이력). ART좁은downsample·ANIM정적bodygrade 제안만 rooteditorconsumer채택; 무제한cache/prefix판정/groundbounce/기타6 wholeDiff·본편채택0. Codex7송신거절(approval required/policy never) 새전달0·재시도/우회0. 전16팀제작완료 선언0 |
| 보존·운영 | code3+docs12 정확15 완료소유만 정상commit/push·원격exactSHA. 실제NUL87→72/타인72status·68bytepin·owner4본인갱신/root쓰기0·검수18sourcepin은외부receipt. 보호2_3/Q-only/어택티켓금지/기존23·세이브보존. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0, 오늘19시 단일실제결과보고 조건유지 |

근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-lighting-20261006/receipt.json`. 최초실패2·마지막미완료후속·핀/PNG/화면·docs검색은외부보존. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의동일완료ID 및외부보고서다.


### 2026-10-06 — 선택 이미지의 전사 기준 크기·원본 대비 화면 배율

완료ID `ROOT-EDITOR-SCALE-COMPARISON-20261006`. 현행 독립 에디터의 읽기 전용 비교 계약은 `MAP_SCENE_EDITOR_20261005.md` §21이다. 앞선 크기 편집·발접지·조명 계약은 그대로이며 새 카드가 현재 크기와 확대 상태를 설명한다.

| 항목 | 현행 정확 구현·증거 |
|---|---|
| 소비자 | editor3387 single selected object. 높이/전사 기준80, 실제비율72px 막대, world/crop/CSS 크기, X/Y source 배율. refresh/dirtytick 갱신; 다중/선택없음/모듈실패 숨김 |
| 수치 | heightRatio=H/80; bars=72*(80 또는 H)/max(80,H). CSS=W/H*zoom; source배율=CSS*(canvas.width/size.w)/crop.w/h. 최대축 >1 확대경고, ===1 native, <1 축소. 별도DPR cap·min-height·원본 자동보정0 |
| 예외·표기 | mask배열 배율null·선명도판정제외, 높이비교유지. ko-KR 최대소수3/0<값<.001 '< 0.001'. 회전전표시영역·투명여백/포즈의체감차이 명시. 리프DOM만 갱신 |
| 검증 | 신규unit14/14·actual1/실패0. 신규Chrome14/14 고유그룹·actual launch 3/contexts 8, 실패 이력은 외부 원본summary. 이전suite/주민종주/F분기/native6 반복0. QA중제품변경1: 일반마스크도1024buffer를쓰는듯한안내문구만정정, 계산/renderer수정0. 390touch에뮬레이션·실물폰0 |
| 추가 근거의 경계 | 최초11PASS+harness3FAIL→실패05/06/13부분만후속3PASS, 마스크안내문구만별도1증분PASS; actual18 check executions/Chrome3/context8. 최초390px tap/44px/넘침 assertions와화면은보존됐으나callback중단으로수치값은미반환. PNG exact측정은run1/문구정정전이며정정후재export0; 문구는PNG그리기에참여하지않음 |
| 보존 | 원본·feet·geometry·nav·scene/game/source·JSON/history/view-only storage 쓰기0. 현재PNG2048²/7018384B/c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21와 exact동일. 정상code5+docs12 한정checkpoint·actualNUL89→72/원격SHA·타인72status/68pin/owner4본인기록은외부receipt |
| 인수 | 도구 크기비교 UI의 화면/의미 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥확대해상도·실높이·정적주민·본편grant/quest/save/상승/native6·실청취·A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일결과보고 조건유지 |

백업·현재정확핀·화면·실패이력·docs전체검색과disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/scale-comparison-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일 완료ID다. Claude/Codex 전문팀 작업전원완료를 뜻하지 않으며, 이 개선은 root지원 구현을 독립 consumer에 채택한 것이다.


### 2026-10-06 — 주민 접근점에서 임시 보행 시험

완료ID `ROOT-RIFT-RESIDENT-PREVIEW-ENTRY-20261006`. 현행 정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §22이며, 이전 접근 진단의 읽기 전용 계약은 유지한다. 새 보행 시험 버튼만 transient player/view를 변경하고, 기존 scene.start와 일반 보행 시작은 유지한다.

| 항목 | 현재 구현·인수 경계 |
|---|---|
| 독립 consumer | 접근검사4카드의 이름별 시험 버튼. fresh 시작연결 검사와 nearest 정확대상 확인 후 현재 접근점에서 시작. 자동대화0, F 명시대화·ESC닫기→ESC원편집상태복귀 |
| 조건·수치 | 정확4 NPC/object ID, ready/footWalkable/startConnected/유한좌표. 기존 r12/거리40…140/step20/40000cells 재사용, scene.start 및 nav/feet 불변. 시험zoom=min(stageW/900,stageH/600); 카메라clamp 유지, 카드 min-height44px |
| 조작·수명 | busy/playing/dialogue/drag/pending/multi>1 차단. Enter/Space native 버튼, heldkeysrelease. 성공import/changed/UndoRedo/tool/일반보행은 origin폐기, 실패import 이전상태유지. 모듈실패 새disabled/기존에디터유지 |
| 의미·화면 | 신규unit12/12 actual1 실패0. 신규Chrome 고유12그룹PASS, 실제launch1/contexts3; 원본raw/실패이력은 외부summary. 이전full4walk/분기/scale/old suites 반복0. 직접DOM guard와 actualpointer/390tap 별도기록 |
| 보존·Git | source scene/start/feet/nav/story/game·renderer코드/원본PNG 파일 불변, preview의JSON/history/autosave/user-save쓰기0. 시험중 새PNG에는 현재전사가 포함되는 기존동작 유지·이번export미검수. code3+docs12 정확15 한정checkpoint·actual NUL87→72·원격exactSHA는 receipt. 타인72status/68pins·owner4본인기록 보존/rootwrites0 |
| 시각·남은 것 | 도구 접근점 진입 UI 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥해상도/주민실높이/애니메이션/본편진행·실지급/save/native6/청취/A급/실물폰 인수0. 새팀·실행세션·중복TASK0; paused자동화/아침메일재개0, 19시단일결과보고 조건유지 |

정확코드핀·수정전백업·검색전체/disposition·검사·화면·Git: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-entry-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다. 이 기록은 root지원 구현의 독립 consumer 채택이며 전문팀 전원 제작완료를 의미하지 않는다.


### 2026-10-06 — 보행 시험 버튼의 현재 비활성 상태 표시

완료ID `ROOT-RIFT-PREVIEW-STATE-UI-20261006`. 정확현행계약은 `MAP_SCENE_EDITOR_20261005.md` §23. §22의 pending/drag/busy enabled외형잔존 관찰은 당시이력이며, 이번변경으로 현재표시가 guard와동기화된다.

| 항목 | 현재 구현·검수 |
|---|---|
| 표시 consumer | 현재4카드 button/ready 캐시. report무효화·카드재생성시캐시/상태키 초기화. 기존RAF에서 blockedboolean전이일때만 disabled=blocked||!ready 갱신 |
| 성능·동작 | 동일상태 DOM조회/disabled쓰기/카드재생성/BFS0, 기존tick O(1)비교만. 새타이머0/진입handler·source/player/view/nav/history/storage/renderer·대화 규칙 변경0 |
| 종료 정책 | propertyblur/성공import는 기존report/card무효화 후재검사로fresh활성. pan종료는현재캐시활성복귀, 객체·브러시편집drag종료는기존changed가보고서무효화후재검사. busy workspace.inert 유지. 비ready행은blocked해제후에도disabled |
| 의미·화면 | node --check actual1 PASS; 새unit0. 신규Chrome상태3그룹PASS actuallaunch2/contexts2, 실제propertyfocus·middlepointer·asyncbusy→종료/fresh검사와안정상태leaf쓰기0확인. 별도비활성시각근거1을추가했고 성공3그룹/72·30RAF측정 재실행0. 이전unit12/entry12/분기/종주/native6/PNG재검사0 |
| 보존·Git | code1+docs12 정확13 한정checkpoint·actualNUL85→72/원격exactSHA 외부receipt. 보호24·타인72status/68핀·owner4본인기록 유지, root타인쓰기0 |
| 인수 경계 | 표시 UI PASS, 전체맵 VISUAL VERDICT RETOUCH. 실제높이/바닥해상도·주민애니메이션·본편grant/quest/save/상승/native6·실청취/실물폰/A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일보고 조건유지 |

코드핀·수정전백업·실제화면/원본검사·docs전체검색/disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-state-ui-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID.


### 2026-10-06 — 선택 주민 배치 규격 진단

완료ID `ROOT-RIFT-REGISTRATION-DIAGNOSTICS-20261006`. 정본은 `MAP_SCENE_EDITOR_20261005.md` §24. 앞선 크기비교/접근검사/접근점보행/현재비활성표시 계약은 유지된다.

| 항목 | 현재 구현·인수 |
|---|---|
| 신규consumer | 선택한4주민의 배치규격일치/첫실패 대상·field·현재값·필요값 카드. propertyinput에서 다음dirtytick반영, 다른 주민·배경이원인이면 그대상명시. 자동보정/새JSON필드0 |
| 의미·수치 | 공유strictvalidator의 기존허용조건 보존. near1e-6/좌표0≤값<8000/height1…32000/1254²등록/foot sort·parallax1/pivot(.5,1) 유지. 크기80 자동강제0. 읽기전용·BFS0·안정결과leaf쓰기0 |
| 실제검사 | unit 신규14최종PASS actual2(초기테스트기대값1ULP실패1보존→실패1만수정재검사), old/new540동등 actual1PASS; module syntax1/rootJS2 PASS. Chrome 신규6그룹PASS·실제launch1/contexts3, 실패이력은 raw/summary. 기존성공검사/전체보행/분기/PNG/native6반복0 |
| 채택·Git | 독립editor3387에 code4+docs12 정확16한정정상checkpoint; actualNUL88→72/원격exactSHA 외부receipt. source22핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 그림·scene/start/feet/nav/story/main/save변경0 |
| 인수·남은문제 | 진단UI와전체맵분리, VISUAL VERDICT RETOUCH. 바닥해상도/실높이/정적주민/애니메이션/본편grant·quest·save·상승/native6/청취/실물폰/A급미인수. 전팀생산완료주장0·새팀/실행세션/중복TASK0·paused자동화/아침메일재개0. 19시단일보고조건유지 |

수정전백업·코드핀·docs전체검색/disposition·원본실패/후속·실제화면·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-registration-diagnostics-20261006/receipt.json`. helper unit의 `ROOT-RIFT-RESIDENT-REGISTRATION-DIAGNOSTICS-20261006` raw표기는 이root완료ID에 연결된 지원검사alias이며 별도생산완료가 아니다. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일root완료ID를 따른다.


### 2026-10-06 — 독립주민 발 고정 미세 호흡 소비자 채택

완료ID `ROOT-RIFT-RESIDENT-IDLE-20261006`. 현행 정본 `MAP_SCENE_EDITOR_20261005.md` §25. 앞선 정적주민·애니메이션 미인수 표기는 당시 이력이다. 이번에 editor의4주민 미세호흡만 구현하며, 골격/걷기/본편 주민 애니메이션은 미인수다.

| 항목 | 정확 현재 구현·검수 |
|---|---|
| 원자료→consumer | Claude ANIMVFX 공식ID `0f9a4f78-e7c5-4509-bb98-9d7a4cdb9857`/09:18:50.110Z/raw SHA `9e3480641c6a516f1074fb5a6908d8c81919c7ff69326b4fe327ec443f050f17`. 원문·기존pin preserved. root는 최신 strict profile와 exact4 첫 객체/발기준/설정·편집·export gate를 추가하고 phase를 index*.137로 확정 |
| 수치·범위 | period2600ms/amplitude.014, scaleY=1+.014*sin(2PI*((t/2600+index*.137)%1)); index H/B/N/D=0/1/2/3. 최대±1.4%·H80=1.12worldpx·B48.72=.68208. 좌표/원화/JSON/기존등록·lighting·nav값변경0 |
| 동작·보존 | on-screen+overlays에만 prepare/targetctx에만 verticalscale. ambientOFF/reducedON/busy/drag/pending off; selected+batch 해당주민scale1. PNG/offscreen 정적·onscreen Map 보존. module실패 editor유지, 읽기전용 detached snapshot. 기존30Hz만/새RAF·timer0 |
| 실제검수 | 새unit10/10 actual1·syntax각1 PASS. 신규 Chrome 고유8기능그룹 PASS·실제launch2/context시도5·ready성공4·pages시도6/성공4·QA중제품수정0; 최초harness4FAIL 보존→raw01/07정확f32분석·미완료02/08만후속, 영상인코더부재/미제작. 새 renderer 영향으로 정적PNG1회 비교·원본결과 raw보존. 기존성공suite/540/종주/F분기/native6 반복0. 영상 인코더 미존재로 영상미제작. 현재시각2스크린/raw256body+640generic/발screen anchor변화0은 browser-qa raw에명시. Canvas scale입력은f32/DOMMatrix곱double; 저장raw 모델오차0·임의tolerance확대0. PNG는이전baseline byte exact, 개별 offscreen matrix는첫1개만검사/4명전부matrix인수로과장0 |
| 실제채택·Git | code3+docs12 정확15경로 정상checkpoint, 실제NUL87→72·원격exactSHA 외부receipt. 수정전백업·보호25핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 본편/game/scene/source원화·세이브 변경0 |
| 팀·실플레이경계 | Claude8는 새공식원자료8개 제출/각1회인계·그중이번ANIM소비자만별도채택. 다른7개는 의존성과 의미검수전 미채택. Codex7 전문팀송신은 자동승인검토거부·actual0이며 담당본인 소스조사만 완료. 전문전원제작/본편완료주장0·새팀/실행세션/중복TASK0 |
| 인수·남은문제 | 전체맵 VISUAL VERDICT RETOUCH. 바닥확대해상도·실높이·골격/걷기·본편grant/quest/원자저장·상승/native6·실청취/실물폰/A급 미인수. paused자동화·아침메일 재개0/19시단일결과보고조건유지 |

백업·코드pin·공식원자료/raw·docs전체keyword검색/disposition·새unit/화면/PNG/영상 존재·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-idle-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다.


## 2026-10-06 남쪽 진입 해상도 상세 후보 v1 — 시각 실패 보존

기존 v2/clean plate1254²/world8000²를 보존한 별도 후보다. generated arrival-detail-v1.png1024×1536을 centre 기존층에 추가한 scene와 [정확 제작·실패 보고](HELL_RIFT_RESOLUTION_DETAIL_20261006.md)를 보존한다. 네 주민 발·nav1192·start/exit·원본 source는 불변이다. native 그림 밀도는 기존 crop 대비 약2.44배지만120%DPR1에서도 약3.13배 확대되어 전체 흐림 해결 완료로 계산하지 않는다. 신규 의미검수10/10 및3387 동일카메라 브라우저2그룹PASS와 별개로 사각 이음새·지형 이동·south-root 전경의 흐린 삼각 조각 때문에 **이 후보 VISUAL VERDICT: FAIL / 본편 미채택**이다. 기존 전체 맵 판정은 RETOUCH를 유지한다. 원본·실패v1 핀과 전후화면은 외부 resolution-detail-20261006에 보존한다. 완료소유 asset2+신규docs1+관련docs6만 정상checkpoint/push하며 root의 현재 후속/타인WIP·ownerSTATELOG·세이브·2_3/Q전용·어택티켓 금지는 보존한다.


## 2026-10-06 바닥 재질 상세 consumer — 최신 상태

완료ID ROOT-RIFT-GROUND-MATERIAL-20261006. 지옥의 틈 주민 v2의 원형 지형을 유지한 editor 전용 바닥 재질 consumer를 구현했다. 전체 landscape 재원화 후보 v1의 VISUAL FAIL/미채택은 그대로다. 원본1254² 배경의 픽셀밀도를 복원한 것이 아니며 **전체맵 및 근접 재질 VISUAL VERDICT: RETOUCH**다.

| 항목 | 현행 값 / 실제 근거 |
|---|---|
| 코드 | tools/map-scene-editor.js + tools/map-scene-rift-ground-detail.mjs + tools/test-map-scene-rift-ground-detail.cjs |
| 원자료 / 소비 | assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png 1024×1536 / crop{x:320,y:1120,w:240,h:240}만 소비. 원자료 전체 맵 채택0 |
| 표현 | 4방향mirror480² pattern, worldSpan160/period320, alpha.4/soft-light. world고정·200² nav mask·비보행alpha0. foot 전경/주민/전사 전 합성. 기본enabled=true, groundDetailEnabled(boolean)은 저장하지 않는 view-only 진단 |
| 등록 / 보존 | strict 주민 v2+분위기 등록+abyss.visible===true. world200²/tile40/8000², nav1192, start(4020,7740)/exit(4020,1740), 기존 주민4 발·높이·원화·atlas·JSON/History 계약 유지. module등록 상세는 MAP_SCENE_EDITOR_20261005.md §26 |
| 새 검수 | unit12/12 PASS 실제1회 + 구문2파일 각각1회. browser Chrome1/context1/page1 기능11PASS·하네스FAIL1(픽셀 QA getImageData 성능 경고3). 재실행0/제품 pageerror·HTTP오류·예기치 않은request실패·API/외부요청0; 원문 및 파생 경고 감사 별도 보존 |
| 실제 화면 | Haran120% 및207.36% 전후, pan 고정, 심연 중앙 변화0표본, 네 주민 접근점→첫F대화→ESC복귀. 선택0/branch0/보상·questcommit0. 정적2048² PNG export1회 |
| 미완료 | 큰돌·절벽·뿌리·불 원본 흐림, 남쪽 뿌리 삼각형 접합, 근접 반복감. 본편 소비/grant·save·상승·실제높이·native6·실청취·실물폰·A급 미인수 |
| docs 검색 | 최초 Markdown302행22문서 검색 원문 경로 충돌 사실 유지; 원문보존 module검색142행28paths, 후속 전체확장자457행23문서 검색→파생 Markdown302행22문서, 현행동기화12/이력보존10/오더STATE보존1/추가consumer충돌0. 원문 재검색·복구 위장0; 보호2_3 매치/수정0 |
| Git / 운영 | 소유code3+docs12만 보존. exact commit/push/remoteSHA·foreign/protected핀은 외부 receipt.json. 19:00 단일보고 완료/exoduser-2 실제PAUSED. 이 변경은 이후 직접 요청 처리이며 기존자동화·아침메일 재개0/새팀·전문팀중복지시0 |

근거: /Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/ground-detail-20261006/receipt.json, browser-qa/run1/raw-result.json, browser-qa/root-warning-audit.json, root-visual-review.json, docs-audit-summary.json. 성공검사와 원본이력의 수치/핀은 해당 시점 근거로 보존하며 이번 표현 추가로 과거 결과를 새 PASS로 바꾸지 않는다.

## 2026-10-06 독립 정사영 캐릭터·맵 consumer 포인터

완료ID `ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006`. 이번 독립 `http://127.0.0.1:3387/tools/2_5d-world-lab.html`은 주민v2 scene/cleanplate/기존nav1192를 읽기전용 소비하는 **동측 대표구간**이다. 기존이미지씬에디터의API·저장·Unity package/Prefab/FBX/PSD import 상태·주민/대화consumer를 변경하지 않았다. fullmap/본편교체가 아니다.

| 항목 | 현행범위 |
|---|---|
| 지형 | clipx4300…6560/y3200…4600,50°정사영/scale400,저장원본start4020/7740·exit4020/1740 불변 |
| 높이 | physicalheight UNKNOWN; authoreddepth240/inset90%는 시험 geometry. 실제heightmap/editorheight roundtrip 미구현 |
| 표시 | 전사/실버테일/드루이드12본plane·대표start5480/3740/terrain시험spawn5900/3820; 같은nav질의radius12/clipmargin12 |
| 전경 (최초 이력; 2026-10-07 최신절로대체) | 동측뿔mask11점/footY4320,actor20/40-foreground30 동일transparentpass,겹침시선택페이드opacity.32 |
| 결과 | 실제bone변형/8방향/1회공격/nav밖제한/효과/가림/정지중교체·reset관측. 원화1254²흐림·skirt hardseam **VISUALRETOUCH**,본편native6/청취/NPC실지급·save/상승/완전3D/A급미인수 |

정확맵source/UV/수식/수치/§23 MAP PRODUCTION REPORT는 `HELL_RIFT_2_5D_SLICE_20261006.md`, 캐릭터/공격/효과/UI/실검수는 `../4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`를따른다. 현재 MAP v2원자료는editor실행이없는projection검증후보이며실제editorroundtrip 채택으로계산하지않는다. 이전시점의CODE CHANGE NONE은당시조사범위이고이번구현은위별도코드다.


## 2.5D 현행 소비 계약·제작 목표 동기화 — 2026-10-06T13:37:48.744345+00:00

이 기록은 앞선 시점의 source/채택 대기 이력을 갱신하는 현재 독립 3387 결과다. 공통 목표는 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`(전사·실버테일·다크드루이드의 같은 지옥의 틈 2.5D 화면에서8방향·대기/보행/달리기/공격·깊이/가림). 관리3/전문15의 기존 역할별 코드 산출 목표를 유지하고 새 팀·관리 채팅·실행 세션은 추가하지 않는다.

| 항목 | 현재 상태 / 코드와 같은 계약 |
|---|---|
| 실제 팀 원자료 | 최초7+v2 4+v3 4+STORY v4 1=완료 소유 raw16 보존. source 도구·공식 end·bytes/fullSHA를 확인했다. 원자료 보존은 consumer/native 인수와 구분 |
| public 소비 | SKILL visual-pose-consumer·ANIMVFX actor-effect-lifetime·MAP scene-registration·QA slice-acceptance 4역할의 파생본을 실제 root lab에서 소비. BOSS/ENEMY/STORY 일반 본편 소비0 |
| 실제 맵 검사 | 실제 로딩 terrain.sourceSceneSnapshot()=K.clone(source)를90767 B canonical HTTP raw의 SHA256·보호 payload와 대조. world XY 투영 왕복 VERIFIED/1192타일. editorProvider 없음=PENDING; 실제 editor 저장·불러오기 인수0 |
| 표시 검사 | 실제 getWorldPosition→sceneToWorld의 actor 원점 world px를 제자리12 렌더 프레임 관측. drift 허용4 px/clip inset12·nav radius12. raw scene units·anchorY/h 비율을 접지 증거로 계산0 |
| source 규격 | 선언 frames×8방향을 순회, finite 양수 referenceHeight/asset width,height/rect, cell 내부 anchor. Infinity/NaN/숫자문자열/0 거부. 정상 crop별 anchor 변화 허용 |
| 검사 무효화 | 이동 키/blur/캐릭터/모션/reset/정지와 자동 attack→idle 시 이전PASS/FAIL=PENDING·samples0. paused 요청은PENDING, 완료 관측으로 계산0. snapshot 결과는 structuredClone |
| renderer/perf | 기존renderer1/RAF최대1/추가mixer0 유지, diagnostic job은12 samples 뒤 폐기. 새로운 save/scene/nav 쓰기·게임/빌드/서버 실행0. 실물폰·장시간FPS 미인수 |
| 실제 검증 | root Mac Chrome/3387 새21검사+자동모션해제5검사 PASS/새runtime0,3id×4mode에서144 프레임 앵커/nav 관측. 이전502/9+8+13+3 검사는 반복하지 않음. 실제 화면3장과 결과json 보존 |
| 시각 판정 | 맵1254² 확대 흐림·hard wedge·절벽 skirt seam이 남아 VISUAL VERDICT: RETOUCH. 새 높이는 authoredDepth240/inset.9 시험값/physicalHeight UNKNOWN. 본편 전투/NPCgrant·save·상승/native6/청취/IK 발픽셀/A급 인수0 |

정확 원화/셀/geometry/순서·수치·API·provenance는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`의 최신 실제 MAP·QA v3 public 소비 절 및 §23 MAP PRODUCTION REPORT을 따른다. 기존 역사 문서·본편2D 계약·다른stage LOCK는 독립lab 값으로 덮어쓰지 않는다. raw의 공식 완료ID/end/정확핀은 CH1_2_5D_TEAM_CANDIDATES_20261006.md에 보존한다. 외부 증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json21·mode-release-result.json5·final-diagnostics.png를 구분한다.

STORY v4는 요청2결함을 해결했지만 method provider의 this=ports를 분리 호출로 잃는 P2가 남아 일반 consumer 채택0이다. Claude8 담당에게만 `CH1-2_5D-STORY-METHOD-CONTEXT-20261006`으로 신규 v5 1파일/rs.call(ports)·cc.call(ports) 복원을 인계했으며, 이 기록 시점의 송신 인계와 이후 실제 peer/source/end 검수는 구분한다. 동일 TASK 재송신·다른 역할 중복지시0. Codex7 UIUX 첫 송신은 자동승인검토에서 도구승인필요/currentpolicynever로 거절되어 수신0/다른6미송신, ART 기존 선택 대기도 별도다. 전원 가동을 선언하지 않는다.

원격 exact `75ce5819ef6e1bbccb5a2acdf5a2db7142b6054e`(v3raw4) 및 `ac96c952b4f3a36e53cd210f745551dd13b8e146`(root code5+STORYv4raw1+상세docs3)의 보존을 확인했다. 후자는 actual80 checkpoint 시도에서 진행로그 hook 누락을 잡아 우회 없이 보완한 actual81 정상 commit이다. 전체 docs 관련 키워드 검색 후 관련15문서를 현재 계약/역할 상태로 동기화하며, 기존 bytes prefix와 백업을 보존한다. 현 관리 docs도 실제80부터 완료 소유 범위만 즉시 정상checkpoint한다. foreign68/owner STATELOG4/보호10/게임·scene/nav·sourcePNG·save/2_3·Q전용·어택티켓 금지·이전23 유지. paused 자동화·메일/권한/설치/Windows/게시/새팀 재개0.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

역사 표기: 아래 표의 열린 대화 cue size .12/lift .42와 public 14063 B/1fe07971… 및 당시 GUI23은 해당 시점 이력이다. 2026-10-07 ROOT-OPEN-CUE-READABILITY-20261007 이후 현재 cue 계약은 openSize .045/openLift .70, public 14064 B/a04a9133…이며 신규 절을 따른다. 원 ANIMVFX raw9287/140748cf…와 당시 검수 결과는 변경하지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.


## 2026-10-07 현행 전경3·보행 바닥 가림 수정

완료ID `ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007`. 독립3387 world-lab에서 원본 전경1→3을 연결했다. 이전 east-only/actor20·40 기록은 당시 이력이며 현행 계약은 아래와 같다. 기존 에디터 scene의 3조각·geometry·mask·PNG·nav1192는 불변이다.

| 적용 위치 | 현행 정확 계약 |
|---|---|
| terrain/lab 전경 | obj-east-horn footY4320/order30/mask11/triangle9; obj-west-root footY5360/order31.3/mask12/triangle10; obj-south-root footY6920/order33.25/mask10/triangle8 |
| 공통 앞뒤 순서 | actor·resident·전경 모두 `30+(footY-4320)/8000*10`; transparent=true/depthTest=false/depthWrite=false. 전경pivot(0,1)/rotationX−angle/alphaTest.01/원maskFeather0. 겹침 선택fade.32(OFF1) |
| 바닥 가림 차단 | 공용nav200²/40000B RedFormat/UnsignedByte·Nearest/no mipmaps. `(199-y)*200+x`에 walkable255/나머지0, `riftForegroundUV=(worldX/8000,1-worldY/8000)`. map_fragment 뒤 alpha×`1-step(.5,nav.r)`/후속 alphatest. 원nav 쓰기0 |
| API/snapshot | occluderFootY4320 호환값 유지; foreground 배열의 objectId/footY/renderOrder/opacity/maskPoints/triangles/sourceCrop/feather/nonWalkableOnly=true 추가. geometry/material 각3+공용navtexture1 terrain 소유·Set dispose1회/borrowedplate 중복dispose0 |
| 실제 관측 | 전경 등록/순서/원본 보존/선택fade 11유효성공 후 정지중disabled talk 클릭harness30초 timeout FAIL 보존. 남쪽 실제몸가림 발견 후 nav-alpha 수정. 수정후 신규4항목(바닥차단/실Haran대화/실KeyS이동/실shader·page·consoleerror0) PASS. 이전27을 이번검사 수에 재사용0 |
| 시각 인수 | 실제before east/south/north 캡처를 보존하고 수정후 south/east 열람. 남쪽몸가림 수정 확인; 서측 전경 전체/실전투·출구·8카메라 인수 UNKNOWN. 원판1254² 확대흐림 남음. VISUAL VERDICT: RETOUCH |
| 경계 | 독립lab≠본편/native6·청취·실보상save·물리높이·해부학적foot/IK·A급완성. 원자료45 미채택 보존과 public 별도구현을 구분 |

정확XY/crop/shader·실패/수정화면·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` 최신절. 근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/foreground-{before,after,mask}-*`. docs 전체 관련keyword 검색247매칭32파일을 현행/역사/타시스템으로 분류했다. ownerSTATELOG·잠금/보호문서·역사영수증은 수정0.


## 2026-10-07 ROOT-RIFT-NPC-WOLF-CONSUMER-20261007 실제 public 연결

이 부록은 현재 독립3387 public 소비자의 구현 상태다. 앞선 raw/fixture 완료 이력은 보존하며 본편/native·청취·보상save 완료로 승격하지 않는다.

| 현재 적용 | 값·상태 |
|---|---|
| NPC consumer | observation+pose 실제controller 연결 / 3actor 대화idle·공격취소 / 유품·부탁 각1 session-only / committedfalse |
| 늑대 consumer | 기존 JSON2+PNG16 실제decode / 8dir idle·walk0..2 / 빈3→같은dir idle / displayHeight.36 / preview6fps≠UNKNOWN metadataFPS |
| 자원·정렬 | 256²textures32/8,388,608B/atlas16close/추가RAF0 / `30+(footY-4320)/8000*10` |
| 검수·남음 | 이번 새25유효실WebGL 검수 / errors0 / RETOUCH; 큰맵흐림·실발·본편native6·청취·보상save 미인수 |
| 다음 | 기존 MAP owner의 선택NPC→2.5D entry adapter 제작; root editorbutton/labport 다음 최소연결 |

정확 API/범위/5code핀/새근거/§23 전체 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 같은 완료ID 부록을 따른다. raw52 checkpoint48fa4a43f95541ec3a1c9cc55c650aefdba2185a와 root public 파생 채택을 구분한다. MAP·ANIM LINK 선행guide위반은 보존했고 실제fullRead복구2/end2를 확인했으며 소급PASS0.


## 2026-10-07 ROOT-RIFT-EDITOR-ENTRY-CONSUMER-20261007 실제 에디터 왕복

이 절은 현행 에디터 연결을 갱신한다. 앞선 선택NPC→2.5D PENDING 기록은 당시 이력이다. 실제 editor3387의 선택 주민 버튼과 동일 origin iframe을 연결했고 네 주민의 진입·복귀를 관측했다. 본편/native6·청취·실제 보상/save·A급 인수는 여전히 미완료다.

| 현재 항목 | 정확 구현·근거 |
|---|---|
| 진입 | `editor.html`의 `scene-preview-25d` → `createEditorPreviewHost` → public `createEditorPreviewEntry` → 실제 `__rift25Lab.enterPreview`. 실제 `EXODUSER_SCENE_EDITOR.snapshot()/selection()/player()`와 workspace.inert 소비 |
| 선택·검증 | 매 클릭 fresh scene/선택; canonical 90767B의 actual registration await/동일성 확인; 정본읽기·검사 중 선택/scene 변경, 보행시험, 미지원 객체는 거절. 원 scene/nav1192/geometry/pixels/에디터History/save 쓰기0 |
| 접근점 | Haran4700,6660 / Berin6020,5540 / Nessa6300,4980 / Dorik5220,2460. NPC/object ID 일치·실worldbounds·nav radius12·nearestNpc.npcId 확인, 자동 대화0 |
| 화면·입력 | 모달 부모 keydown/keyup capture 전파차단(preventDefault0), nativeTab/Enter/Space/Escape 유지; iframe 내부키는 별도window. 성공 currentepoch 후 world-canvas focus, WASD와 R 실제관측 |
| 수명 | 새token/사용자이동/actor교체/reset 뒤 oldrestore 거절; 유효한 복귀는 원발5480,3740로1회복원. 닫기/visibility/pagehide는 취소·대기해제·iframe about:blank. 독립 RAF 추가0 |
| 새 검수 | public adapter stdin10 PASS 실제1회 / lab port 메모리9 PASS 실제1회 / 이번 실제Chrome18유효항목 PASS(기존25 재집계0), page/console/HTTP error0. host 최초테스트0였으나 root 실제화면 연결을 검수 |
| 실패 이력 | 최초GUI의 nearestResident 가정 때문에 Haran 판단FAIL. 실제필드는 nearestNpc.npcId이며 코드변경없이 실패항목과 미실행항목만 후속17PASS. 초기 지원주민없음 PASS1은 재검사0. 모달 shortcut P1/focus P2는 구현 전 정적검토에서 발견·수정 |
| 원자료 보존 | MAP 완료 `CH1-RIFT-EDITOR-ENTRY-20261007-MAP-CANDIDATE`, officialend26736e4c-a55a-4193-91b1-22805e870bf5. raw누적52→53, raw 직접import0/후보미채택보존과 root 파생소비를 구분 |
| 시각·다음 | 전체그림1254² 확대 흐림, 절벽/전경 접합·실발/물리높이·전체8카메라/전투 인수 잔여. VISUAL VERDICT: RETOUCH. 다음은 원자료 증식보다 현행맵 실제재질·seam·본편최소연결 Gate |

근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-entry-*`: browser-result/followup-result/summary, modal/haran-canvas/return PNG, public-pins 및 preservation 영수증. 직전root59721dec0fcdfd7f054f8bbc9cfe63b1d2e86d6c 원격정확보존 이후 본 단위만 code+docs 정상commit/push하고 새정확HEAD는 외부영수증에서 확인한다. foreign68·ownerSTATELOG4 보존/새팀·세션·전문직접중복송신0/다른paused자동화·아침메일재개0. 24시간 연속제작·일별19시요약1회·제작중지0은 그대로다.


## 2026-10-07 ROOT-RIFT-CONTACT-VISUAL-GATE-20261007

| id / 적용 위치 | 정확 현행 계약 |
|---|---|
| 공개 모듈 / 핀 | tools/2_5d/rift-contact-underlay.mjs / 13198 bytes / SHA256 d6194d518e4e4a6100ea312ed14de1e3f4968dab56563a2247501c5d8b00aae2 |
| API | await createRiftContactUnderlay({THREE,terrain,enabled=false}) → object3d / setEnabled(boolean) / snapshot() / dispose(). 단일 async factory, prepare/reload 없음; source-nav hash 대기 후 terrain 수명 재검사. |
| 상태 / 채택 | ROOT-PUBLIC-EXPERIMENT. raw54 직접 import0; 결함 보정 derivative를 독립lab 비교 도구로 보존. VISUAL FAIL이므로 기본enabled=false; HTML cliff-contact는 unchecked. 본편 채택0. |
| UI consumer / 핀 | tools/2_5d-world-lab.html 11943 bytes SHA256 c55c498c01a84ac63a932ebfcd8296277bc6eb8e22264673a7083d5163e0465d; 경계 음영 비교 체크박스 cliff-contact. tools/2_5d-world-lab.mjs 32861 bytes SHA256 5a8bcfe054fa597822e0b44b3e3fd4725282bc710a62739385eaabcc5c392b1d. |
| canonical | grid200²/tile40/world8000/nav1192, source-nav40000 bytes 0/1/fullSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. sceneSHA c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a. 원본PNG·scene·nav·terrain geometry/3전경은 쓰기0. |
| 수직 UV / hard mask | source rowY 배열 / 글로벌 geometryUV(x/8000,1-y/8000), shaderSampleUV=(u,1-v). 원본 sourceNavByteEncoding=0/1; 별도 hardMaskByteEncoding=0/255, UnsignedByteType normalize→hardMaskNormalizedEncoding=0/1. Nearest Red40000 bytes, step(.5,sample.r) gate. 비보행38808칸 gate0, 보행1192칸 gate1. |
| band / 공식 | contactTiles1.5=60world, strength.42, distance=max(0,nearest nonwalk center tile distance-.5), alpha=distance<1.5?.42*(1-distance/1.5):0. Linear RGBA160000 bytes × Nearest hard gate. band574칸; actual centermax .28 / 8bit max71/255=.2784313725490196. 명목상한 .42를 실제max라고 계산하지 않는다. |
| 표시 순서 / 소유 | color0x05080a(329738), blend normal-dark, quad order6/lift1.25, depthTest=false/depthWrite=false/transparent=true/DoubleSide/toneMapped=false. owned texture2=200000 bytes+geometry1+material1=4; borrowed0; partial constructor/Hash-late/dispose/double-dispose 검사. ownRAF/timer0, source/scene/nav/savewrite0. |
| GPU 검수 | lab foregroundShaderPrograms canonical1 및 contactShaderPrograms 양면2, renderer.compile 후 실제 gl.LINK_STATUS=true를 별도 검사. cacheKey rift-contact-underlay-linear-band-nearest-nav1192-v2. snapshot.shaderRegistered/Calls는 shader injection만 뜻하며 GPU link PASS를 대신하지 않는다. 초기 root가 양면 프로그램2를1로 가정한 acceptance 오류로 GUI0 FAIL; 실제2linktrue 진단 후 cardinality2로 수정, 실패영수증 보존. |
| 신규 CPU 검수 | 실제 Three r160 stdin18 PASS에는 0/1 GPU normalized byte blind spot이 있었다. 이후 수정된 별도 제한stdin5 PASS에서 actual DataTexture byte/255와 gate, UV, sourceSHA를 확인. 이전18 PASS를 실제 alpha 표시 증거로 승격하지 않는다. |
| 신규 실제 화면 검수 | contact actual WebGL·OFF/ON 동일 남/동/북 카메라·정본/무오류 6 PASS + default OFF와 실제2link 1 PASS. 별도 canonical 복원 GPU1 PASS. 과거 editor18/NPCwolf25 재실행·합산0. pageerror0/4040. |
| 시각 결과 | OFF/ON 남119106·동104434·북106164 pixels가 바뀌나 nav 경계를 계단형 얼룩으로 노출하므로 접촉 음영 VISUAL VERDICT: FAIL. 실제 clip이 그림 속 절벽 발과 일치하는 접지 음영 인수는 실패했다. 기본OFF로 기존 화면 보존. 전체 맵 VISUAL VERDICT: RETOUCH, 원본1254² 확대흐림/입체높이/본편 인수 미해결. |
| 외부 근거 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/contact-* PNG/result/pixel-comparison, before-contact-* 백업, restored-foreground-gpu-result.json. fixture/raw/lab≠본편/native6/청취/실보상save/A급. |
| 다음 승인 단위 | 기존 Claude8→MAP CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP(신규 rift-main-entry-gate.candidate.mjs1). peer6bdd0087-edf9-4829-beea-ff423c367f94 18:31:09.267Z, source Bash toolu_01Ad1gM3uQNFL53Wi9FoXC1i→d2a7f2ee-ddae-47a3-b2f1-bf0b9d862b07 18:31:44.029Z. 정식 end/pin 대기이며 수신·검색만으로 전체 선행Read/완료/본편연결을 계산하지 않는다. |

MAP PRODUCTION REPORT
- STAGE: 지옥의 틈 보행 경계 contact-shade 비교 / 기본OFF.
- MASTER: 기존 비대칭 실루엣/남→북 main route/주민 side spaces·regions 유지.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH와 major holes 원화 불변.
- LARGE: source assets·3전경 composites/crop·overlap·repeated silhouette 변경0.
- MEDIUM: connections/remaining holes 변경0.
- GROUND: shadow 비교는 계단 nav 얼룩으로 FAIL; contamination/structure integration 기본OFF로 기존 보존.
- PLAYABLE: nav1192 travel/breathing space 유지; main arenas/threat/combat readability 본편 인수 PENDING.
- LANDMARK: primary 상승문·secondary 균열·tertiary 주민 그대로.
- CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 같은 카메라 OFF/ON. START/초반/ARENA/SIDE L/LATE/EXIT 전체 본편 인수 PENDING.
- TECH QA: route/collision 불변; pageerror0/4040; loading7실관측 PASS; seam 시각 FAIL; performance 정량 인수 PENDING.
- FILES: root public module1 + labhtml/mjs2, concurrent/unrelated touched0.
- GIT: completed-owned code3+동기화docs 정상commit/push 및 remote exact SHA는 외부영수증에서 확인; deploy0.
- VISUAL VERDICT: FAIL(음영 ON), RETOUCH(전체 맵 / 기본 OFF).
- NEXT PASS: nav 셀을 실제 그림 속 절벽 발로 취급하지 말고 authored foreground 접합 위치/부드러운 실제 경계 검수; 별도 본편 entry gate→실제 NPC 왕복→보상/save atomicACK 단위.


## ROOT-RIFT-PUBLIC-BOUNDARY-RESOLUTION-20261007 — 현재 정본·lab/main·해상도 경계

현재 public host/gate와 신규 interop의 정본 위치를 추가한다. 앞선 작성 중·end 대기 절은 당시 이력이며, 현재 상태는 아래의 최종 핀과 독립 범위로 읽는다.

### 현재 정본과 읽기 연결

| 정본/책임 | 현재 링크·핀 | 현재 적용 범위 |
|---|---|---|
| 선행 기준 | [EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md](EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md), stage LOCK 및 이 인덱스의 기존 읽기 순서 | 기존 순서/QA gate 유지. 이번 문서로 geometry·높이·nav·배치 기준을 재정의하지 않음 |
| 독립 slice / 결과 | [HELL_RIFT_2_5D_SLICE_20261006.md](HELL_RIFT_2_5D_SLICE_20261006.md), [HELL_RIFT_EDITOR_RESULT_20261006.md](HELL_RIFT_EDITOR_RESULT_20261006.md) | source/nav/XY 등록과 host UI·전체맵 판정을 분리하여 읽음 |
| editor / runtime | [MAP_SCENE_EDITOR_20261005.md](MAP_SCENE_EDITOR_20261005.md), [THREE_LOCAL_SINGLE_RUNTIME_20260929.md](../12퍼포먼스·최적화/THREE_LOCAL_SINGLE_RUNTIME_20260929.md) | 기존 selected-NPC editor host와 main-context host는 별개. parent는 own DOM/timeout, child는 renderer/RAF 소유 |
| 해상도 원인 | [HELL_RIFT_RESOLUTION_DETAIL_20261006.md](HELL_RIFT_RESOLUTION_DETAIL_20261006.md) | 기존 arrival-detail 전체지형 후보 FAIL·별도 재질 crop 소비와 현재 source 확대 한계를 구분 |
| 완료 public host | [main-rift-host.mjs](../../tools/2_5d/main-rift-host.mjs), 17683B, SHA `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38`; 코드 ID ROOT-RIFT-MAIN-IFRAME-HOST-20261007 | public 구현 완료. 독립 iframe 표시/복귀 수명이며 actual main 채택0 |
| 완료 public gate | [rift-main-entry-gate.mjs](../../tools/2_5d/rift-main-entry-gate.mjs), 16280B, SHA `f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd`; ID ROOT-RIFT-MAIN-ENTRY-GATE-20261007 | public derivative 구현 완료. one-shot commit permission이며 nextStage/save/reward/DOM 호출0 |
| gate provenance | immutable raw V2 11268B/SHA `646bf810623bfe7ce687c1bd4d560f40fc751b9586cd46326c0d7764635e72be`, 공식 end `be7786a7-6b57-4b97-a55e-e1e7cada25e1` | direct raw import0. raw 후보 완료·public 보정·main 채택은 다른 상태 |
| 저장/대화 계약 | [15 세이브+데이터구조.md](../15%20세이브+데이터구조/15%20세이브+데이터구조.md), [RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md](../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md) | checkpoint true는 durable dbSave/grant ACK가 아니며 대화는 독립 session-only. 실제 quest/reward/save 인수0 |

앞선 정식 end 대기/public 작성 중/interop PENDING 절은 당시 이력으로 보존한다. 현재는 위 최종 public host/gate 핀과 아래 신규 interop 근거를 읽는다. 코드 구현 완료가 본편 연결·선명도·A급 완료를 뜻하지 않는다.

### 독립 lab과 main의 실행 경계

| 항목 | 정확 현재 계약 | 미인수·소유 경계 |
|---|---|---|
| host API·대기 | `createMainRiftHost({document,window,readContext,timeoutMs=30000,pollMs=100})` → enterRift/cancel/dispose/snapshot. timeout finite100..60000ms, poll finite20..1000ms | own iframe 최대1·timer 최대1·host RAF0; http/https 동일 origin3387·정확 tools/2_5d-world-lab.html |
| host admission | 동기 plain own-data player non-null object(배열 제외)/character 길이>0 string/stage integer≥0/context opaque identity/onfalse/stageClearedtrue. status dead/fallen/reviving/lastStand 거절 | 실제 lexical caller가 공급해야 함; player/context 참조 엄격 비교·child character 전송0. 부모 plain과 child native realm snapshot을 구분 |
| host 반환/종료 | enterRift Promise는 own restore()/dispose() handle 또는 null로 resolve; user Escape/돌아가기/onExit는 gate job 취소 | return≠continue job. 부모 blur 취소0; 실제 hidden 전환은 앞선 검수 SKIPPED |
| gate API·ports | `createRiftMainEntryGate({ports})` → enter/continue/cancel/dispose/snapshot; own-data readState/checkpoint/enterRift/resumeStage 함수 캡처 | same-realm native Promise만 해당 async port에 허용; 일반 thenable/foreign Promise/custom prototype/accessor 거절 |
| gate readState | own-data stage/stageCleared/status/difficultyOff/contextId. stage safe integer≥0, stageCleared boolean, difficultyOff finite Number, contextId non-null string/finiteNumber/bigint/symbol/boolean | enum clear-continue/dead/final/demo/unknown; 실제 admission은 stageClearedtrue+clear-continue만. gate primitive contextId와 host opaque context는 별도 입력 |
| checkpoint/host 재검사 | checkpoint 정확 true 또는 same-realm native Promise<true>; host handle은 own restore 함수와 optional own dispose 함수 | checkpoint 전후/host await 뒤 fresh 동일 admission+epoch 확인. checkpoint는 영구 저장 확인이 아님 |
| continue/commit | continue는 schedule만. commit은 scheduled/current epoch/fresh admission/cleanup 전후 재검사 후 최대1회 permission 발급 | caller가 commit과 root job 일치를 확인하여 실제 nextStage를 결정. gate nextStage 호출0·actualStageAcknowledgedfalse |
| stale·실패 | cancel/dispose/new job은 stale await·저장된 callback permission 거절; late handle은 자기 restore→dispose 정리 | 실패 fallthroughfalse. hostCancelRequired와 root job을 함께 확인해야 새 host를 닫지 않음; retained error dialog cleanup은 caller 소유 |
| main 잔여 접점 | DEMO1-1 nextBtn의 일반 접점 우회, 이미 held된 keys/gamepad polling/update, 5000ms 전환 callback/900ms curtain job guard | host/gate만으로 현재1-1→틈 main 완료0. game.html/P/G/user save/보스retry/SP10clear 변경0 |
| 인수 flags | host/gate mainAcceptedfalse/nativeAcceptedfalse; gate actualStageAcknowledgedfalse/fallthroughfalse/timers0/raf0/saveWritesfalse/rewardWritesfalse | 실제 nextStage/combat·durable reward ACK/save/native6/audio/실캐릭터 child 연동/A급 인수0 |

### 신규 interop 최종 근거와 검수 묶음

| 자료/관측 | 정확 결과 | 범위 |
|---|---|---|
| interop 영수증 | main-gate-host-interop/interop-result.json, 26382B/SHA `f4b1d75af1997e69327d1cb81cb1e38944b1843b10fefc18b6ccf894fac0a5c4`; NEW_INTEROP4_ONLY **4/4 PASS** | 시작/종료 gate16280/f9db…·host17683/008a… 핀 동일. 실제3387 iframe+모의 P/G context, actualMainGamefalse |
| interop1 | 실제 ready iframe, explicit continue는 schedule만, 저장된 지연 callback commit 최초true·재호출false | delayedAdvanceIsMocktrue; permission1은 실제 stage ACK 아님. actual nextStage 호출0·stageAcknowledgedfalse |
| interop2 | 실제 Escape로 gate job/owned iframe 정리, permission·모의 advance0 | 복귀를 자동 stage 진행으로 처리0 |
| interop3 | 예약 뒤 contextId/host context 교체 → 저장 callback 거절·모의 advance0 | 오래된 job/handle로 새 context 진행0 |
| interop4 | 실제 HTTP503 주입/null host → denial/fallthrough0·wrapper retained dialog cleanup | expectedLoadFailureInjections1; 미예상 page/HTTP/console0·foreign/nonGET0 |
| UI 화면 보고 | interop-screen-review.json: 별도 지원 담당이 interop-entry/interop-scheduled-return PNG 확인, owned modal·복귀 UI PASS | 문서 worker 신규 GUI/화면 관찰0. 전체맵 RETOUCH |
| 묶음 분리 | 최초 host realm FAIL0체크 / 이전6cd… GUI14 / 최종008a… formatter negative2+normalGUI2 / gate 순수24그룹222조건 / 이번 interop4 | 이전 검사 재실행·합산0. negative2는 음성 검사 아님 |
| 미인수 flags | actualMainGamefalse/native6Acceptedfalse/saveAcceptedfalse/audioAcceptedfalse/stageAcknowledgedfalse | fixture/lab/permission/own UI PASS를 native6·청취·저장·보상·A급 인수로 대체0 |

외부 근거 루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/`이다. host의 실제 context admission과 gate의 지연 permission API는 완료됐지만 main 게임의 전환 caller/input/update/DEMO 경로는 아직 연결·인수되지 않았다.

### 해상도 원인별 현행 source 관측

| 경로/source | 현재 규격·계산 | 상태·안전 경계 |
|---|---|---|
| 원화 밀도 | clean-plate-v1.png 1254×1254, 2417849B/SHA `aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673` → world8000×8000 | 8000/1254=6.379585326953748 worldpx/sourcepx. host/gate는 source 세부·픽셀·geometry를 바꾸지 않아 확대 한계 유지 |
| 현행 canonical | hell-rift-residents-v2.scene.json 90767B/SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`; grid200²/tile40/nav1192; navSHA `a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179` | source/nav/start/exit/feet/world/XY 등록 변경0. 실제 authored physical height는 원자료 UNKNOWN |
| Three texture | rift-terrain.mjs:30–35 SHA/1254 크기 확인 후 SRGBColorSpace·mag LinearFilter/min LinearMipmapLinearFilter | 확대 보간/축소용 mipmap이 원픽셀 세부를 만드는 것은 아님. 필터 자체의 신규 A/B 선명도 PASS0 |
| Three mask/UV | terrain ground/foreground는 source Texture·crop/global UV로 등록하며 Canvas2D maskedPicture의1024 버퍼를 사용하지 않음 | Three의1254→8000 확대 한계와2D 중간 buffer 문제는 별도 |
| 2D maskedPicture | map-scene-editor.js:37–67, mask 있는 object만 ratio=1024/max(object.width,object.height), 장축1024 buffer, cache 최대8 | crop 장축>1024이면 추가 축소, 작은 crop은 확대. 1254 sheet 전체가 항상1024로 축소된다는 표현 금지 |
| 현재 masked source | obj-rift-depth는1920² full crop→1024². 세 foot crop 장축: west112.85999999999999/east156.75/south100.32 | foot3의 native crop은1024보다 작아 source 확대 경로. 원본을 고해상도로 교체했다고 계산0 |
| feather alpha | maskFeather가 있을 때 장축256 alpha sample→1024 buffer, abyss 현재 feather120world | RGB source 해상도와 alpha edge sample 구분; physical 절벽 높이/접지 인수 아님 |
| 2D 배율 | editor zoom1.2의 CSS/source=8000/1254×1.2=7.655502392344498; 실제 raster는 canvas.width/CSSwidth 추가 적용 | editor 계산에만 적용. Three camera zoom1.2를 같은 world→CSS 배율로 대입하지 않고 실제 projected 크기를 읽음 |
| lab DPR 초기화 | 2_5d-world-lab.mjs:273–274 antialiastrue/powerPreference low-power, 초기 setPixelRatio는 devicePixelRatio가 falsy면1로 대체한 뒤 cap2; outputSRGB | cap2는 최대 raster 배율. DPR>2 장치의 낮은 raster 밀도 가능성을 source 확대흐림과 구분 |
| lab resize DPR | 2_5d-world-lab.mjs:45–52 resize는 setSize·정사영 높이3.5·zoom update만, setPixelRatio 재호출0 | 초기화 뒤 monitor/browser DPR 변화 재평가 미구현이라는 source 관측. 새 DPR 전환 GUI/A-B0·수정 완료0 |
| editor resize DPR | map-scene-editor.js:361 resize 함수는 devicePixelRatio를 다시 읽고 cap2로 canvas dimensions 설정 | lab과 다른 계약. 모든 renderer가 DPR 재평가0이라고 일반화하지 않음; 실제 DPR 전환 이벤트 수명 인수는 이번 범위 아님 |
| MAP raw62 | CH1-RIFT-EDITOR-MASK-RESOLUTION-20261007-MAP-CANDIDATE; rift-editor-mask-resolution.candidate.mjs 7258B/SHA `603b8a6b8e792747f51e93b9e230a4dd868d99a8a7d724bf22b4a289d572cdb9`; 공식 end `093ac892-bf81-460a-a7be-c8848884270e` | 이번 TASK guide/SSOT 선행 Read prerequisite FAIL, 소급 PASS0·public editor 미채택. 존재/보존을 buffer 개선 적용·시각 PASS로 승격0 |
| 실패 이력·잔여 | arrival-detail 전체지형 등록 FAIL·contact ON 실화면 FAIL/defaultOFF, 원plate1254² 확대흐림·절벽 접합/physical height 미해결 | host/gate·interop4 성공으로 해상도/접합 해결 선언0. 원source/nav/UV/foot 등록 보존 |

다음 해상도 A/B는 같은 source pin·camera XY/angle/zoom·CSS viewport·실제 raster dimensions·devicePixelRatio·contact OFF·actor pose를 고정한 별도 승인 단위다. DPR 갱신/2D buffer 후보의 코드·fixture PASS만으로 source 세부 개선을 선언하지 않는다. 실제 세부가 개선되고 경계·가림·발 등록과 오류/메모리 수명이 보존되어야 하며, 픽셀 밀도만 증가하거나 원화/길/주민 foot가 달라지면 RETOUCH/FAIL로 남긴다. 이번 문서 작업에서 새 A/B/GPU/browser/원PNG 편집0이다.

### MAP PRODUCTION REPORT — §23

| 필수 항목 | 이번 범위·판정 | 새 실행/변경 |
|---|---|---|
| STAGE | public host/gate 정본 링크·독립 lab/main 경계·해상도 source 원인 동기화 | 기존 docs2 append |
| MASTER | 기존 silhouette/regions/main route/side spaces 유지 | 새 계획/geometry0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major opening 원본 유지 | 변경0 |
| LARGE | source1254 plate/composite/crop/overlap/repeated silhouette 유지 | 변경0 |
| MEDIUM | connections/remaining holes·절벽 접합 유지 | 변경0 |
| GROUND | nav1192·접지/오염/structure integration 유지; contact FAIL/defaultOFF | source 확대흐림 미해결 |
| PLAYABLE | 독립 iframe+모의 P/G interop4; main arena/travel/breathing/threat/combat 인수 PENDING | 실제 nextStage/save/native6 인수0 |
| LANDMARK | primary 상승문/secondary 균열/tertiary 주민 배치·feet 유지 | 변경0 |
| CAMERA QA | 기존 interop entry/return 화면 보고만 참조 | worker 신규 START/EARLY/ARENA/SIDE_L/SIDE_R/LANDMARK/LATE/EXIT·A/B0 |
| TECH QA | 최종 host/gate pin·신규interop4 영수증 읽기 대조; editor1024/lab DPR 미구현 source 관측 | route/collision/seam/loading/performance 신규 실행0·해결 완료0 |
| FILES | owned 기존 docs2, 원문 전체bytes prefix100%+추가LF만 | concurrent/unrelated/code/asset/PNG/game/editor/STATE/LOG 변경0 |
| GIT | worker stage/commit/push/deploy0, root가 완료docs2 checkpoint | 이 절만으로 원격SHA/push 성공 주장0 |
| VISUAL VERDICT | **RETOUCH** — modal/복귀 UI PASS, 전체맵 확대흐림·접합·본편 미인수 | contact ON의 이전 FAIL/defaultOFF 유지 |
| NEXT PASS | guide/SSOT 선행을 갖춘2D buffer/DPR source 보정·동일화면 A/B와 main lexical/DEMO/heldgamepad/update/realstage/save/reward/native6/audio | 별도 승인·실검수 |

## ROOT-RIFT-PARENT-INPUT-LEASE-20261007 — public 부모 입력 lease 완료 / 본편 훅 미연결

이 절은 앞선 public lease WIP·caller 격리 미구현 문구의 최신 상태를 구분한다. 완료된 것은 `tools/2_5d/rift-parent-input-lease.mjs`의 순수 정책 소비자이며, 실제 game.html 입력·simulation을 정지시키는 main 훅은 아직 연결되지 않았다. raw63/64 원자료는 직접 import하지 않고 provenance로 보존한다. host 닫힘/disposed만으로 예약 중인 root job을 해제하지 않는다.

| id / 적용 위치 | 정확 현행 계약 | 구현·인수 경계 |
|---|---|---|
| source / 완료 ID | ROOT-RIFT-PARENT-INPUT-LEASE-20261007; 최종12294B; SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | native rejection observer 최소 보정 뒤 확정된 public derivative 1파일. raw 직접 import0 / game.html main 훅0 |
| factory / ports | `createRiftParentInputLease({ports:{readOwned,clearHeld}})` | options/ports는 own-data plain object, prototype는 같은 realm Object.prototype 또는 null. own/inherited then descriptor 거절; getter 실행으로 검증하지 않음. 함수와 원 ports receiver 캡처 |
| readOwned / 권한 | 동기 own-data plain `{owned:boolean,epoch:safe integer}`; epoch 최솟값0·최댓값9007199254740991 | root-local job의 비감소 epoch가 authoritative. host token/G.revision을 추측하지 않음. host는 닫혔어도 delayed root job이 남으면 owned:true |
| 통과 / 차단 | 현재 유효한 명시적 owned:false만 status inactive·block:false. owned/unknown/stale/disposed는 block:true | UNKNOWN·reflection/proxy throw·동기 재진입·옛 epoch·release된 epoch 재사용은 부모 실행 허가가 아님. Proxy trap 호출0 보장은 아님 |
| clearHeld | 각 새 owned epoch 첫 관측에 시도1회. 동기 undefined 또는 true만 성공; false/객체/thenable/Promise/throw는 실패 | clear 전에 epoch 기록, 외부 호출 후 fresh readOwned 재검사. 실패는 그 epoch에 고정되어 반복 해제0; 더 새 epoch는 별도 준비. clearHeld의 실제 _clearHeldInput→_gpClearAll 연결은 root caller 소유 |
| suppressUpdate | fresh readPolicy().block boolean | 실제 update 첫 실행문·lesson/KeyP/held shortcut 이전 호출은 main 후속 |
| suppressGamepadPoll | fresh block boolean | _pollGamepad 시작 전에 실제 caller 소비 필요; G.onfalse/paused만으로 폴링·UI 클릭이 막히지 않음 |
| suppressGamepadKeyInject | fresh block boolean | 직접 K/MB 주입 이전 소비 필요; poll의 직접 WASD 쓰기와 별개 |
| suppressFacingMutation | fresh block boolean | update 밖 mouse/gamepad facing 변경 이전 소비 필요; 방향 계산·BINDS·보호 패링 변경0 |
| suppressAutoNextStage | fresh block boolean | scheduled root job도 소유 차단 유지. commit 허가/실제 nextStage ACK를 이 boolean 자체로 대신하지 않음 |
| readPolicy / 반환 | frozen null-prototype: status/reason/owned/epoch/block/allowParent/blockParentInput/blockParentSim/blockGamepad/heldClearEpoch/heldClearSucceeded/heldClearAttempts/disposed/parentStateWrites/actualMainHooksAccepted | 각 suppressor는 fresh ownership 읽기. caller가 프레임당1회 정책을 읽는 경우 모든 실제 hotpath에서 block을 소비해야 함 |
| captureFreshOwnership | 안정된 owned:true 및 clear 성공 때 frozen detached `{owned:true,epoch}`, 그 외 null | 진단 캡처이며 persistent permission·restore/release handle이 아님. 이후 root job 변화는 caller가 재검사 |
| dispose | 최초 true / 이후 false. 폐기 뒤 항상 차단 | 내부 수명만 종료. 원 G/P 상태·root job·host·held 입력을 자동 복원하지 않음 |
| 순수 경계 / 수치 | module timer0 / RAF0 / DOM writes0 / parent state writes0 / save0 / reward0 / nextStage0 / automaticTalk0 | 모듈 추가 자체가 실제 freeze가 아님. 실제 gameplay·native input·save/grant/quest 인수0 |
| 초기 핀 의미 검수 이력 | 12058B / SHA256 `01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676`; 초기 stdin1회 / 16그룹 / 288조건 / PASS16 / FAIL0 / 미도달0 / exit0 | `parent-input-lease/new-module-raw-result.json`의 초기 핀 검사. 최종12294 핀에서 이 전체 검사 재실행0. 기존 raw63/64의 7 negative failure, gate24/222·hostGUI14·최종host4·interop4와 합산0; 문서 worker 새 실행0 |
| 최종 핀 제한 검수 | 새 제한 stdin 실제1회: 최초FAIL1 / unhandled rejection1 → 외부 byteexact 백업 → 제품 최소 보정1회 → 후속6그룹 / 33조건 / PASS6 / FAIL0 / 미도달0 / newUnhandled0 / overall exit0 | `parent-input-lease/rejected-read-owned-limited-result.json`, final-receipt.json. 최초 실패는 숨기지 않고 보존; 초기16/288 재실행0. 프로세스 전체 exit0와 최초 실패 이력은 별도 |
| 비동기 소유 반환 거부 | 같은 realm native Promise는 캡처된 intrinsic then으로 rejection만 관찰; owned / 성공 승격0, 상태 UNKNOWN / block=true | native prototype 동일, own constructor 없음, native constructor/species 계약 보존일 때만 관찰. value.then getter0. foreign Promise / plain thenable은 getter0 UNKNOWN; 검사 foreign는 fulfilled 값이며 적대 foreign/constructor-accessor rejection 관찰 인수 주장0 |
| 원자료 불변 | SKILL raw63 18140B/SHA `f37496ba97808f0f831c507d90c18b35666295e79bf648de884fcfe4bc7547b6`, end ff7cfaf0-984b-4257-b7ea-c626705f50a9; ENEMY raw64 10122B/SHA `880f204f1a1a7ae7bb5b5ec7587585544c6ebfad20520ef5e82d494730020e03`, end 45bd281e-7659-412d-afc7-2156b118b904 | 신규 검수 시작/종료 pin exact, 문서 작업에서도 fullSHA 재확인. 원자료 수정0 / public 직접 import0 |

`classifyProjectedEvent(projected)`는 advisory만 반환하며 실제 DOM event dispatch/주입·preventDefault·focus를 수행하지 않는다. active일 때 caller가 native event에서 own primitive data를 투영해야 한다. 명시적 inactive에서는 event/type/getter/prototype를 읽지 않고 parent 통과한다. active에서 type·선택 code/key/repeat/isComposing/button own-data 계약과 fresh epoch를 재확인하며 UNKNOWN이면 none으로 차단한다.

| iframe 권고 키 / 이벤트 | 정확 의미 | 실제 소비 경계 |
|---|---|---|
| KeyW/A/S/D·ArrowUp/Down/Left/Right | walk; labWalkSpeed260 | 기존 child lab 기준값. 정책 모듈이 새 이동·주입을 실행하지 않음 |
| ShiftLeft/Right | run; labRunSpeed470 | 기존 child 동작 권고이며 parent charge 입력 변경0 |
| KeyJ / KeyR / Space | attack / dialogue / pause | R은 parent pickup이 아니며 Space는 gate.continue가 아님 |
| Escape / Tab / Enter / NumpadEnter | close-dialogue / modal-native / modal-native / modal-native | child 권고와 parent host 명시적 Return/Escape 취소를 구분 |
| keyup/mouseup/pointerup/pointercancel/touchend/touchcancel/blur/focusout/compositionend | none·parent-release-only·clearHeld:true 권고 | classifier가 release hook을 추가 실행하는 것이 아님. 종료 held/gamepad 재동기화는 root caller 소유 |
| active pointer·wheel/click/contextmenu / composition | pointer는 none; composition은 iframe 권고 | parent mutation 차단 / 전달·포커스·네이티브 Tab/Enter 기본 동작은 실제 host/caller 책임 |

최소 본편 접점의 읽기 전용 계획은 외부 `main-seam/read-only-plan.json` 26436B / SHA256 `c195b898cac382c24680941fee1cd6de393cd3091cf9ab90d19b955e7cc9af72`에 별도 보존한다. 실제 update 첫문·poll·inject/facing·held 해제·root job/epoch 연결, 5000ms callback의 일회 허가와 900ms shared curtain 소유 보호는 미구현이다. 현재 `_DEMO_MODE=true`/`_DEMO_LAST_STAGE=0`에서 nextBtn이 _proceedNextStage를 우회하는 정책, 명시적 Continue UI, public host의 HTTP 동일 origin3387 범위 및 child P/char 실제 연결은 해결되지 않았다. signedDifficulty -5..+5와 stage level offset -100/-50/0/+50/+100을 혼용하지 않는다. 모듈 import나 mock advance로 첫1-1 본편 진입 완료를 선언하지 않는다.

원본문 bytes prefix100%와 타인 WIP를 보존한 LF append만 수행한다. 외부 백업·docs 전체 keyword search·모든 매칭 파일 disposition·6문서 최종핀은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/parent-input-lease/docs-sync/rig-motion-prefix/`에 있다. 운영 정본의 최신 관리 상태는 PROJECT_MANAGEMENT_MASTER의 같은 완료 ID를 따른다. 다른 담당 DPR 문서/코드는 본 작업에서 수치·완료 판정을 추가하지 않는다. 사용자save·보스 retry/_preArenaBackup·SP10 clear 보상·원PNG/scene/nav·보호2_3/Q 전용 magic 패링/E 불가/어택티켓 금지 변경0.

### 맵 SSOT 읽기·상태 구분

맵 guide/LOCK/stage SSOT/canonical scene·nav의 기존 읽기 순서와 우선순위는 바꾸지 않는다. 본 부록은 public main input lease의 코드/API·완료 pin 및 미연결 consumer를 기록하는 참조다. 키바인딩 정본의 같은 완료 ID에 입력 계약, 세이브 정본에 저장 미인수, RIFT_DIALOGUE_PUBLIC_CONSUMER에 session-only 권한 경계를 함께 기록한다. 이 순수 policy를 map generator/nav/camera 완료로 승격하지 않는다.

### MAP PRODUCTION REPORT — §23 / 문서 동기화 범위

| 필수 항목 | 실제 범위·판정 |
|---|---|
| STAGE | ROOT-RIFT-PARENT-INPUT-LEASE-20261007 public 정책 소비자 완료 계약 동기화. 실제 main hook 미연결 |
| MASTER | 기존 최하층→상승·장/스테이지 사이 지옥의 틈 목표 유지; 새 맵 계획0 |
| OUTER MASS / LARGE | 기존 silhouette·opening·원PNG·composite/crop 등록 변경0 |
| MEDIUM / GROUND | 연결부·절벽 접합·ground·geometry·nav1192·source feet 변경0 |
| PLAYABLE / COMBAT | pure lease 정책만. actual input/main route/실보스 전투/native6 인수0 |
| LANDMARK / SMALL DETAIL | 상승문·균열·주민 배치·에셋·세부 변경0 |
| CAMERA QA | 문서 worker 새 화면·8카메라·DPR A/B·브라우저 실행0 |
| TECH QA | 초기12058 핀 stdin1/16그룹/288조건 PASS 이력; 최종12294 핀 별도 제한 stdin1 최초FAIL1/unhandled1→후속6그룹33조건/PASS6/FAIL0/newUnhandled0/overall exit0. 초기16 재실행0, 문서 worker 새 검사0, 원raw63/64 불변 |
| FILES | 지정 기존 docs6만 원본문 prefix100% + LF append. 코드/game/editor/raw/STATE/타인 WIP 수정0 |
| GIT | 문서 worker stage/commit/push/deploy0. root가 완료 code+docs 한정 checkpoint/push 담당; 여기서 remote SHA 성공 추정0 |
| VISUAL VERDICT | **RETOUCH** — 기존 전체맵 판정 유지, 본 작업 새 실화면 NOT ASSESSED. pure PASS를 visual PASS로 대체0 |
| NEXT PASS | 실제 main update/poll/inject/facing/autoNext + root job/epoch 및 clear/exit release 연결; ContinueUI·DEMO·3387 scope·child P/char·5000ms/900ms·save/reward/native/audio 별도 인수 |

## ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 — 격리 main 소스 훅 연결 / 실제 게임 인수 대기

이 절이 신규 소스 연결 상태의 정본이다. 앞선 public host/gate/lease 절의 “main 훅0·미연결”은 해당 당시 핀의 이력이며, 현재 `game.html` 일반 `_proceedNextStage` 경로에는 lexical root job과 public runtime 소비자가 연결되었다. 적용 origin은 정확히 `http://127.0.0.1:3387`이다. 기본 데모 종료 분기, 실제 본편 플레이·다음 stage ACK·native6·음향·지속 save ACK·child 실제 P/캐릭터 전달은 별도 미인수다. 모듈 구현·fixture PASS를 이 인수로 승격하지 않는다.

### 동결 소스와 적용 범위

| id / 소스 | 현재 값 / 핀 | 적용·제외 |
| --- | --- | --- |
| game.html | 4050426 B / SHA256 `ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230` | root block + 정확15접점. 원본 본체·타인 WIP·보호2_3 수정0 |
| tools/2_5d/main-rift-runtime.mjs | 7519 B / SHA256 `b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69` | 새 public orchestration consumer. raw 직접 import0 |
| public foundation host | 17683 B / SHA256 `008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38` | 기존 public import / 동일 origin iframe host |
| public foundation gate | 16280 B / SHA256 `f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd` | 기존 one-shot permission/context 계약 유지 |
| public foundation lease | 12294 B / SHA256 `d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1` | 기존 strict ownership 계약 유지 |
| origin / 활성 | `location.origin === http://127.0.0.1:3387` | 3333·3340·file: 활성0. 새 서버/게임 실행0 |
| 데모 현재 기본값 | `_DEMO_MODE=true`, `_DEMO_LAST_STAGE=0` | nextBtn의 기존 terminal demo 분기는 직접 nextStage 호출 유지. 기본1-1→틈 허브 PENDING |
| foundation 진단 상수 | 기존 public module의 `actualMainHooksAccepted:false` 유지 | foundation 자체 인수 flag와 현재 caller 소스 연결을 구분. 새 runtime은 `mainSeamConnected:true` |
| source 등록/해상도 | canonical nav1192·원PNG/scene/주민 feet·1254² plate→8000² world 그대로 | 맵 확대 흐림·절벽 접합 RETOUCH 미해결. 이 연결은 해상도 개선이 아님 |

### runtime API와 실제 lexical ports

`createMainRiftRuntime({window,document,ports})`는 window/document.body·정확 origin3387 및 아래7개 함수 ports를 요구한다. 이 factory는 외부 임의 context를 본편으로 인증하는 validator가 아니며, game 내부의 실제 lexical 참조를 제공하는 caller와 public foundation guards가 함께 계약을 수행한다.

| ports id | 정확 반환 / 소비 | 수명·저장 경계 |
| --- | --- | --- |
| readOwned() | 동기 `{owned:!!_rootRiftJob&&!job.closed, epoch:_rootRiftEpoch}` | host token이나 G.revision 추정0; root-local epoch authoritative |
| clearHeld() | `_rootRiftClearOnce` → 동기 true/false | 새 job 최초 시도1회. `_clearHeldInput()`로 Shift 무장 해제 후 `_gpClearAll()`; _gpSynced=false·axes0·_gpAiming=false |
| isCurrent(captured) | `_rootRiftCurrent(job)` exact identity boolean | 같은 job/P/G/stage/char/difficulty/save/status·clear/boss/HP·G.onfalse 재검사 |
| readHostContext() | 현재 actual `{player:P,character,stage:G.stage,context:G,on:G.on,stageCleared:G.stageCleared,status:P.s}` | stale이면 throw; parent P 참조 읽기가 child P 전달을 뜻하지 않음 |
| readGateState(captured) | 현재 `{stage,stageCleared,status:clear-continue,difficultyOff,contextId:job.epoch}` 또는 null | 실제 stage offset 사용. 임의 G 필드 추가0 |
| schedule(commit,captured) | 현재 job 확인 후 controlled showStageTransition 설치 / undefined | 5000ms 대기 중 lease 유지; callback은 current→commit→current→기존 nextStage |
| release(captured,why) | `_rootRiftRelease` matching job만 true / 그 외 false | 옛 job이 새 job·curtain을 해제0; 안전한 같은 context에서만 이전 G.on 복원 |

| runtime API | 정확 동작 / 반환 | 상태·실패 경계 |
| --- | --- | --- |
| enter(captured) | async; 성공 frozen null-prototype `{entered:true,fallthrough:false,rootEpoch}` | 중복/disposed/stale는 entered:false. gate await 뒤 fresh ownership과 Continue DOM 설치 확인 |
| continue() | phase=rift·현재 소유 때만 gate.continue; scheduled===true면 true | 명시 Continue만 예약. 자동 advance/failure fallthrough0; 반복 scheduled 클릭 false |
| parentEvent(event) | 처리했으면 true; host native modal 제어에는 false | own Continue click 또는 비반복 Enter/NumpadEnter/Space만 명시 진행. 나머지 parent 이벤트 차단 |
| block(channel) | update/poll/inject/facing/auto → 대응 lease suppressor boolean | 알 수 없는 channel은 true 차단. game caller는 import/기존 save 대기 중에도 먼저 차단 |
| cancel(why=cancelled) | 현재 record close, 성공 true / 없거나 이미 닫혔으면 false | own Continue 제거→gate.dispose→host.cancel→matching release |
| finished(captured) | 현재 captured identity만 close(advanced,false) | root caller finally가 release. 성공 다음 stage에서 이전 G.on 복원0 |
| dispose() | 최초 cancel(page-disposed)·host.dispose·lease.dispose 후 true / 반복 false | 소유 UI/모듈 수명만 종료. parent game save/reward 소유0 |
| snapshot() | frozen null-prototype detached primitive fields + foundation snapshots | disposed/phase/reason/rootEpoch/entered/scheduled/continueButton/host/lease/gate; mainSeamConnected=true |
| snapshot 미인수/소유값 | actualStageAdvanceAccepted=false, childCharacterLinked=false, saveAckAccepted=false | saveWrites0 / rewardWrites0 / automaticTalk=false / raf0 / timers0. game curtain 기존 RAF/timer는 별도 |
| phase / reason | phase idle→entering→rift→scheduled→idle; reason idle/preparing/ready/explicit-continue 등 | 실패 reason stale-or-duplicate/gate-entry-failed/stale-entry/entry-or-continue-ui-failed/continue-failed/continue-refused; 취소 why·advanced 별도 |

### job 캡처·held 입력·epoch·취소·전환

| id / 접점 | 정확 규칙 / 수치 | 인수 경계 |
| --- | --- | --- |
| 진입 admission | stageCleared===true / bossAlive===false / stage safe integer≥0 / finite HP>0 / G.on boolean / finite difficulty / charIdx 유효 정수 | P.s dead/fallen/reviving/lastStand 거부. 현재 job·dead page·default demo terminal·epoch≥9007199254740990 거부 |
| captured job | epoch, P/G 참조, stage, charId, charIdx, character, difficultyOff, difficultyIndex, dbSave 함수 참조, _dbReady, P.s, previousOn | charId null도 identity로 허용. character는 charIdx===1이면 silvertail, 그 외 warrior; child 전송0 |
| job flags | heldCleared/closed/cancelling/advancing 최초 false; begin에서 ++epoch | root job 등록·G.on=false·held 해제는 기존 save await보다 먼저 |
| fresh identity | 현재 job/epoch/P/G/stage/charId/charIdx/(G._stageDiffOff??0)/(OPT.diff??5)/dbSave/_dbReady/P.s 일치 | finite HP>0·cleartrue·bossfalse도 확인. current는 !closed·!cancelling·G.on===false 추가 |
| 기존 난이도 | NEXT_DIFF_OPTS off = -100/-50/0/+50/+100; OPT.diff 기본5 | stage level offset와 difficulty index 분리; signed -5..+5로 임의 역변환0. 기존 선택·수식 무변경 |
| 기존 저장 | job.saveReady일 때 `_proceedNextStage` 기존 dbSave 최대1회 await | 이미 앞선 clear-save는 별도. void/skip/catch resolve는 준비 완료일 뿐 durable ACK가 아님 |
| await 경계 | save 뒤 context-after-save; lazy import 뒤 context-after-import fresh 검사 | matching job에만 invalidate. 실패 rift-entry-failed에서 자동 nextStage0 |
| 입력 해제/복원 | clearOnce 최초1회·release에서 다시 held/axes/aim 해제 | 옛 held 키/축 복원0. 같은 identity·G.onfalse의 안전한 취소에만 previousOn 복원 |
| 부모 hard block | import/준비 중 job이 있으면 차단; stale/lease throw는 invalidate 후 해당 hotpath 차단 | scheduled에서 iframe 닫혀도 root owned 유지. 명시 inactive에서 기존 부모 실행 통과 |
| 자동 stage / 명시 commit | 일반 nextStage는 auto 차단; 현재 job.advancing만 예외 | `_rootRiftAdvance`: current→함수 commit의 truthy 결과→current→기존 nextStage1회; final finally release restore=false |
| curtain 기본 수치 | 기존 RAF bar45% → owned wait5000ms → bar100% → owned hide900ms | 새 runtime RAF/timer0; 기존 game curtain 각 핸들만 소유/취소 |
| curtain 이중 소유 | curtainOwner===_rootRiftCurtainEpoch 및 bootOwner===_bootLoadEpoch | callback 전 current job도 검사. 성공 뒤900ms hide는 옛 stage identity가 아닌 curtain+boot 소유 검사 |
| matching cancel 최소 보정 | `why!==advanced`인 같은 job release가 own curtain.cancel 즉시 호출 | scheduled Escape가5000ms 대기를 즉시 제거. successful advanced의900ms fade는 유지 |
| curtain cancel() | 최초 true / 반복 false; own RAF/wait/hide만 clear; current curtain이면 opacity0/pointerEventsnone | 옛 cancel/hide가 새 curtain·boot cover를 덮지 않음. callback false/throw controlled 경로는 refuse/onCancel |
| context 무효화 | retry/character-change/init-stage/boot-loading/lobby/pagehide/parent-hidden/changed lexical context | advancing 중 authorized init-stage/boot-loading invalidate 제외. active job 중복진입은 거절; 새 job 전에 남은 curtain만 cancel. boot-loading은 새 curtain/boot token 사용 |
| 취소 UX | safe 취소일 때 기존 nextBtn disabled=false·opacity1, leaf status 귀환 안내 | host Return은 job 취소/부모 복귀이며 continue 예약이 아님. parent blur 취소 추가0 |
| 정확 원본 보존 | 15 replacement 역변환 결과 = 최초 원본4039085 B / SHA256 `4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd` | 구조 byte 대조 근거; git reset/checkout0·old suite 재실행0. clear 보상SP10/retry EXP30%/부활/save 기존 동작 보존 |

### 키·DOM·본편15접점

| id / key 또는 DOM | 현행 소비 | 변경하지 않는 경계 |
| --- | --- | --- |
| 명시 Continue | button id root-rift-continue-${captured.epoch}; 문구 “위로 올라가기 · 다음 구역”; aria “지옥의 틈을 떠나 다음 구역으로 이동” | host current token safe integer≥1·open dialog[data-main-rift-host]·첫 HEADER에만 append |
| Continue 입력 | own button target에서 click / 비반복 keydown Enter·NumpadEnter·Space | 전역 Space/Enter가 gate.continue를 뜻하지 않음; host의 native Tab/Return/Escape controls 유지 |
| Continue 스타일 | padding9px16px / border1px #c7b580 / radius7px / bg#544328 / fg#fff0c9 / font600 14px system-ui | 소유 button만 remove; 부모 textContent/innerHTML 교체0 |
| 상태 leaf | root-rift-main-status / role=status / display:block / min-height21px / margin9px0 / #d9bd86 / font13px/1.6 system-ui | nextBtn 앞 own span 삽입. children.length===0에서만 textContent 교체 |
| parent capture18종 | keydown/keyup/pointerdown/pointerup/pointermove/pointercancel/mousedown/mouseup/mousemove/click/dblclick/auxclick/contextmenu/touchstart/touchmove/touchend/touchcancel/wheel | window capture:true/passive:false. 현 job 때 parent mutation 차단; modal 내부는 host control에 양도 |
| Escape/visibility/pagehide | nonrepeat Escape matching cancel; document.hidden이면 parent-hidden; pagehide dead flag·invalidate·runtime.dispose | parent blur 취소0. 오래된 job 취소는 새 job 불변 |
| child 기본 키 | WASD/방향키 walk260; Shift run470; J attack; R dialogue; Space pause | 기존 lab 속도/동작 유지. 자동 dialogue0; child R을 parent pickup으로 해석0 |
| 원래 parent 설정 | BINDS/BINDS2·마우스 aim·패드 twin-stick·Q 전용 magic blackBean 패링 유지 | E magic 패링 추가0 / 어택티켓 제한 신규 구현0 / 보호2_3 변경0 |

아래 줄번호는 동결 `game.html` ece8 핀 기준이며 접점은 root block1 + 기존 함수/이벤트 소비14 = 15개다.

| 접점 id | source line / 함수 | 새 소비 |
| --- | --- | --- |
| root job / orchestration | 3438–3557 root block | job/epoch/capture/quarantine/readonly snapshot |
| character change | 10283 _loadCharAtlas | character-change invalidate |
| mouse facing | 12567 _setMouseFacing | facing lease guard |
| gamepad auto aim | 13132 _gpAutoAim | facing guard |
| gamepad key inject | 13163 _gpInjectKey | inject guard; release는 기존 held clear만 |
| gamepad poll | 13489 _pollGamepad | poll 시작 guard |
| gamepad direct WASD | 13758 직접 K/KH 쓰기 | inject guard로 poll 외 실제 직접 주입 보호 |
| init stage | 30478 initStage | init-stage invalidate / authorized advancing 예외 |
| simulation update | 31041 update | lesson/KeyP/held shortcut보다 먼저 update guard |
| auto next stage | 42610 nextStage | auto guard / authorized advancing만 기존 본체 허용 |
| retry | 61667 기존 retry callback | retry invalidate |
| stage transition | 61739 showStageTransition | optional rootControl + owned RAF/5000/900 lifecycle |
| boot loading | 61791 showBootLoading | boot-loading invalidate 및 curtain token 증분 |
| normal proceed | 61859 _proceedNextStage | capture→기존 save→fresh→runtime import→fresh→enter |
| lobby | 61890 goToLobby | lobby invalidate 후 기존 저장/로비 이동 |

`window.__riftMainIntegration.snapshot()`은 frozen readonly 진단이며 enabled/epoch/owned/reason/phase/guardedAdvanceCalls와 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false를 반환한다. mutable P/G/job·release 함수·save handle을 노출하지 않는다. 정상 demo nextBtn의61880 terminal branch는 `_proceedNextStage`를 우회해 기존 nextStage를 직접 호출하므로, 이 진단의 존재만으로1-1 허브를 인수하지 않는다.

### 핀별 검수·미인수

| 검수 / source pin | 새 실행 / 정확 결과 | 범위 / 승격 금지 |
| --- | --- | --- |
| 과거 source-seam VM | game4050167 B / SHA256 `f3a084bc1a136186ccca3157b9a9a1f5f41133b72eebfb10aa2641fe2a017cf3`; runtime b93c 동일; 실제1회9그룹/133조건 PASS9 FAIL0 exit0 | lexical source+runtime 실제 함수 및 host/gate/lease 인터페이스 double. 본편·HTTP·GPU·save writes·native0 |
| 최종 matching Escape 보정 | game4050426/ece8 + runtime7519/b93c; 제한 신규1회2그룹/20조건 PASS2 FAIL0 exit0 | final release/transition/runtime 경계만. 앞9/133 재실행0·두 핀 결과 합산0 |
| syntax 이력 | 완료 corrected syntax1회 PASS는 과거 f3a inline1 + runtime; 기존 importmap JSON 오분류 checker 실패1회 별도 | 최초 parser 실패는 변경제품 도달 전 tooling 실패. final 제한2/20에서 변경 lexical parse/실행; 옛 syntax 결과 재승격0 |
| 신규 runtime DOMQA | actual Chrome1/context1/QA parent1/child3 직렬; 신규3그룹/15 subchecks PASS3 FAIL0 exit0 | detached stage1 P/G fixture. actual game/5000ms900ms/nextStage/held gamepad/update 검수0; 기존 검수 합산/재실행0 |
| 실제 main 인수 | actualGameExecuted=false / actualStageAdvance=false / nativeSix=false / audio=false / saveAck=false / actualGPU=false | mock nextStage count는 실제 advance가 아님. childUsesActualPCharacter=false / defaultDemoCH1_1HubRoute=false |
| 미래 인수 조건 | DEMO terminal route 정책 별도 확정→actual current parent→host Continue→actual nextStage ACK→game native6·음향·지속 저장 | 현재 source 접점 구현과 실사용/실게임 인수를 분리. NPC grant/quest·영구 보상 후속 PENDING |

근거: 외부 `main-seam-integration/rig-motion-implementation/final-receipt.json`·handoff.md·동결 소스 actual diff/runtime. 문서 worker의 새 테스트·브라우저·게임·Git 실행0. docs 전체 keyword 검색은65파일/520매칭 줄, raw887635 B; 모든 매칭 파일의 수정/보존/타인 소유 disposition과6문서 byteexact 백업은 외부 `main-seam-integration/docs-related-sync/`에 보존한다. 기존 원문 bytes prefix100%·기존 완료 이력·타인 WIP를 유지한 LF append만 적용한다.

### 정본 우선순위·연결 상태

| id | 현재 적용 | 미구현·보호 경계 |
| --- | --- | --- |
| 현행 main source contract | 완료 ID ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 / gameece8·runtimeb93c | 이 절이 과거 main hook0의 신규 source 상태를 갱신. 실제 인수 flag는 별도 false |
| 세부 참조 | 3.3 키바인딩 정본 /15 세이브 정본 /RIFT_DIALOGUE_PUBLIC_CONSUMER /MAP_SCENE_EDITOR /HELL_RIFT_EDITOR_RESULT | 운영 checkpoint·원격 exact SHA는 PROJECT_MANAGEMENT_MASTER 및 root 전용 운영docs 정본 |
| 보호 우선순위 | 사용자 최신 지시→해당 stage LOCK/SSOT→맵 가이드 순서 | 맵 geometry·nav·원화·발·2_3/Q 전용/어택티켓 금지·사용자save 불변 |
| 인수 상태 | source normal proceed 연결 완료; default DEMO1-1 hub PENDING; 실제game/native6/audio/saveACK0 | 문서별 이력핀 유지, 새 source2/20·old9/133·기존 DOM/GPU 검수 합산0 |


### ROOT-RIFT-RUNTIME-CONSUMER-BROWSER-20261007 — 신규 실제 DOM 결과 / fixture 경계

문서 작성 중 도착한 helper 결과를 현행으로 반영한다. actual public runtime/host/gate/lease와 실제 child lab을 격리3387에서 사용했다. 부모는 detached own plain P/G/job의 stage1·clear-continue·difficultyOff0·contextId=epoch fixture이며 actual game.html은 실행하지 않았다.

| 관측 id | 정확 신규 결과 | 미인수 경계 |
|---|---|---|
| 실행 / 결과 | actual harness1 / Chrome launch1 / context1 / QA parent1 / child3 직렬 / screenshot3; 신규3그룹·15 observed subchecks PASS3 FAIL0·failedSubchecks0·exit0 | 제품 수정0. source9/133·final2/20·interop4·기존 hostGUI14 재실행/합산0 |
| native Continue click·Enter | 각 trusted own button 입력→scheduled; rootOwned=true/leaseBlock=true/leaseOwned=true; clearHeldCalls1/scheduleCalls1 | host owned dialog0/iframe0/poll timers0. 예약 직후 mockAdvance0·permission false |
| 지연 gate callback | click/Enter 각 최초 permission true1·중복false1·모의advance1·release advanced1 | QA 메모리에 보류한 실제 gate callback 수동 호출. actual nextStage0 /5000ms·900ms timer 검수0 |
| 예약 중 W / Escape | 각 경로 trusted W downstream0. Escape에서 release(parent-escape)1→old callback2 false·mockadvance0 | actual main held/gamepad/update 검수0. matching curtain source2/20과 별도 |
| child readiness | 직렬3 child 각각 ready=true/error=null/frames6/backing canvas1036×714 | 동시 중복 실행0; 기존 지도 route/collision/GPU lifecycle 검사 반복0 |
| 오류 / 외부 영향 | pageerror0/consoleError0/httpErrors0/foreignRequests0/mutationRequests0/downloads0; isolatedStorageUnchanged=true | repoWrites0/gitWrites0·사용자save/보상/schema 쓰기0 |
| 핀 보존 | public code5 + 보호원본6 =11개 전후exact; game4050426/ece8 읽기 핀 전후일치 | lab36039 B / SHA256 `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`; game 실행0 |
| 시각 판정 | helper tested desktop own Continue/host 제거/부모 귀환 UI PASS; 전체맵 VISUAL RETOUCH | 원1254 plate 확대 흐림·작은 raster 캐릭터·전체맵 A급未인수. mobile NOT_TESTED. 문서 worker 새 화면관찰0 |
| 본편 미인수 | actualMainGame=false/native6Accepted=false/audioAccepted=false/saveAccepted=false/rewardAccepted=false/actualNextStageCalled0/stageAcknowledged=false | child P/캐릭터 전달0·DEMO1-1 hub PENDING·actual5000/900/gamepad/update0 |
| 실제 증거 | runtime-consumer-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt | runtime-owned-continue-ready.png /runtime-click-scheduled.png /runtime-escape-cancelled.png; 스크린3과 원시결과 별도 보존 |

### MAP PRODUCTION REPORT — §23 / source consumer 문서 동기화

```text
STAGE: ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007; source consumer 구현 계약 docs6 동기화. 실제 game 인수 대기.
MASTER
- silhouette / regions / main route / side spaces: 원형 맵 계획 그대로; 변경0.
OUTER MASS
- LEFT / RIGHT / TOP / SOUTH / major holes: 원형 지형/마스크/높이 등록 변경0.
LARGE
- source assets / composites / overlap / repeated silhouette: 원PNG/1254 plate/atlas 변경0; 반복 원화 해소 선언0.
MEDIUM
- connections / remaining holes: 원형 접합 유지; 절벽 접합 RETOUCH.
GROUND
- shadow / contamination / structure integration: 기존 접지·재질 소비 유지; 이번 변경0.
PLAYABLE
- main arenas / travel space / breathing space / threat space / combat readability: 일반 caller seam source 구현; 실제 게임(native6) 새 검수0.
LANDMARK
- primary / secondary / tertiary: 원화/배치 변경0.
CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 이번 새 화면검수0; 전체맵 기존 RETOUCH 유지.
TECH QA
- route / collision: nav1192·feet·원본 scene 보존; 실제 본편 종주/전투 완료0.
- pageerror / 404 / loading / performance: 신규 runtime fixture DOMQA3/15 PASS; pageerror/console/HTTP/foreign/mutation/download 각각0. 실제 game5000/900·gamepad/update 검수0.
- seam: oldf3a9/133과 finalece8 제한2/20은 다른 핀/범위이며 합산0.
FILES
- stage-owned: 지정된 관련6문서 LF append; 원문 전체 bytes prefix100% 보존.
- concurrent touched / unrelated touched: rootops6·완료worlddocs3·게임/코드/STATE/타인 WIP 변경0.
GIT
- staged / commit / push: worker0; 완료소유 code+docs checkpoint와 remote exactSHA는 root 담당.
- deploy: 0.
VISUAL VERDICT: RETOUCH. 전체맵 원본1254² 확대 흐림·절벽 접합 미해결; source tests의 visual 승격0.
NEXT PASS: DEMO1-1 허브 정책과 실제 현재 parent→명시 Continue→nextStage ACK, native6·audio·durable save Gate 별도 인수.
```

### ROOT-ACTOR-OWNED-DISPOSE-20261007 신규 Chrome 관측·실패 이력 / 후속 접점

public `actor-effect-lifetime.mjs` dispose-only 최소 구현은 code1+docs9로 `5856578bf6cc211315fb9303ab01418e36984ca8` normal commit/push·remote exact에 보존했다. 현재 public actor는 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`, worldlab는 36039B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`이다. 기존 producer API/defaults/provenance·dispose 밖 전체 원문과 현재 mesh/material/shared cleanup의 number/오류 계약은 이전 구현 영수증대로 유지한다. raw69 full producer 미채택과 root inline cleanup 채택은 서로 다르다.

| 새 관측 / 분류 | 정확한 결과 |
|---|---|
| 최초 준비 실행 | Chrome1/context1/parent1/child2, 준비0PASS·2FAIL·exit1; 기존 idle frame0과 dust110ms 조건 때문에 예상 pool3 미도달 / disposal 인수조건0. 해당 시점 제품판정 불가, 원실패 이력 유지 |
| 승인 후속 실행 | public onActorChange로 edge reset 후 실제 dust2+attack1 / mesh3 / geometry2; Chrome1/context1/parent1/child2. 각6조건 관측 PASS, 총12조건 PASS; 마지막 GPU후검사2FAIL·exit1 유지 |
| 전체 그룹 판정 | followup raw0PASS·2FAIL; 전체 제품/GUI PASS 선언0. 관측12조건을 원 그룹 판정과 합산·교체0 |
| actual native 소비자 | QA detached parent의 실제 mainhost → 기존 실제 worldlab iframe. trusted pagehide 후 actual public producer dispose를 호출; game.html/native6/에디터 사용자흐름 검수0 |
| remove-throw | remove 시도3/성공2; 실패 owned mesh1은 attached·hidden으로 잔류. material actual dispose event3/3, shared geometry2/2. 잔류를 성공 해제로 표시0 |
| material-throw | remove3/3; material 각 시도1이나 첫 actual dispose event0, 나머지2 event각1; geometry2/2. 실패 material 해제 성공 주장0 |
| 진단 / 반복 | 각 case controlled Error(`actor effects 소유 자원 해제 실패: 1`) 및 actual lab cleanupFailures1. 반복 dispose0 / 부작용 재시도0. 내부N과 lab resource실패1을 혼동0 |
| borrowed 경계 | producer dispose 전후 camera/terrain/비소유scene children/current textures 불변; borrowed texture dispose event0. 이후 lab 자기소유 terrain/texture cleanup과 분리 |
| 실제 GL 렌더 | 두 case render 시 LINK_STATUS true / getError0 / native bufferData·draw 관측. 신규 effect buffer upload8 각 case |
| 실제 native 삭제 호출 | remove/material 순서 deleteBuffer46/46, deleteProgram13/11, deleteTexture13/13. material 실패의 program차이 및 failed event0 유지 |
| GPU후검사 실패 | iframe unload 뒤 isContextLost=true / getError37442(CONTEXT_LOST_WEBGL). 그 시점 error===0와 비교한 원 후검사2FAIL 유지. 이전 render GL0와 시점 분리; 추가 Chrome0 / 물리 GPU 메모리 해제 UNKNOWN |
| 전체 새 실행수 | Chrome2/context2/parent2/child4; 최초2FAIL와 후속12PASS·2FAIL 분리. 기존 child6/21·runtime3/15·CPU7/47·owner14/11·DPR 재실행·합산0 |
| 소스 / 오류 | protected source11핀 전후 exact; pageerror/consoleerror/404/foreign/mutation0; repo source·docs·Git·save 변경0(검수 worker). actor12162/a808 exact 유지 |
| 원자료 pins | 최초raw `c262a83ba794208d9c5abd363b4c882cb74aeaf164dc4637ed22d9f763fae417`; 후속raw `03a6e795276bae83d36f436c93db5622b56a982c5ee6b28d3a8afdcc76c9a5bc`; 최종receipt `3dd7fd3caa8034c3a74e06f7d41bce3371cb427c707868a9cffc9ef10d3f12c4`; summary `ba2da122d960e2604fcca7ce2f2e448bd1cfee1169b04bf03fae0f1f890debd1` |
| 실제 화면 | external `actor-owned-dispose-browser/followup/actual-owned-ring-pool.png` / `668e4bfb95c29edf545f6fe48868d9ffaa9a1f96a2f5ea84ee157312447fd35d`; 화면 개선/A급 증거로 승격0 |
| owner 새 memory | `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY-RESULT`, 공식 end `519bf6c5-b01d-4943-a74c-5f59fcfb4419`@2026-10-06T20:24:59.163Z / endrawSHA `7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e`; source-derived 모델11PASS는 owner이력 / root재실행0 / public 적용0 |
| root 다음 접점 | read-only plan20069B / `c0863b26cc3b24eeb158d24959fe4898b968f792917eb60cd9c3423ded846443`: effects 슬롯 INERT 선행→releaseResource→외부callback 뒤 disposed/epoch/generation/identity 재검사, 중첩phase guard→기존 RAF의 latest pending, 초기local create→takeInitialized→publish. 아직 계획/구현0 |
| 남은 producer 경계 | geometry ctor 부분할당 및 acquire의 scene.add→all.push 재진입은 initializationScene add guard만으로 입증0. 기존 owner의 새 actorReentrantPublish memory TASK sent/peer/Read/source1·end0 관측을 이어감; 같은TASK 재송신0 |
| NPC 수 정정 | 이전 '5NPC'는 root→owner 요청범위였으며 실제 current dialogue controller/RIFT_DIALOGUE 정본 조회는 Haran/Berin/Nessa/Dorik 4주민. 미확인 fifth를 기존 NPC로 확정0. item/quantity/quest identity 좁은 조회 진행, 새 보상 ID 임의확정0 |
| 지속 생산 / 거절 경계 | 기존 owner만 전문송신, 한 단위보존 뒤 다음 승인미완료. STORY 이전 큐 미소비/send0 유지. WOLF V3 auto approval Write 거절(dangerous/구체 사유 미제공) 뒤 동일산출 사고 purpose HOLD / 실행·채택·원격 raw보존·우회0 / 피해UNKNOWN |
| 인수 한계 | CH1-1 defaultdemo→hub·childP/char·NPC inventory+ledger durableACK/readback·실제본편native6·청취·실보상save·A급 미인수. 검수/계획/fixture/파일보존을 실제플레이완료로 계산0 |

MAP PRODUCTION REPORT (§23): 범위=public actor cleanup의 actual Chrome 관측/오류 이력 보존; geometry·outermass·ground·landmark·camera 배치 변경0, 기존 guide/SSOT/LOCK 유지. TECH=신규 CPU7/47 PASS는 이전 code checkpoint의 별도 검수; 이번 Chrome raw 두 followup 그룹 FAIL 유지/제한 actor 조건12관측 PASS. remove 잔류1·material actual dispose미도달1·native 삭제호출과 physical GPU UNKNOWN을 기록했다. 실제 게임·모바일·native6·청취·save0. **VISUAL VERDICT: RETOUCH**.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-browser/`의 final-receipt/acceptance-summary/map-production-report/원·후속 raw와 실제화면을 사용한다. 전체docs actor 관련 검색은53파일1181줄(raw2524094B/`29a74c5d66613e938339359107cc2b1790263c1cb8bc00f56895f447198b9a59`) 및 소스좁은검색22파일336줄의 경로별 disposition을 따른다. rootops6·소비자 actor3·directional·map editor·SSOT의 현재핀/인수상태를 정확 동기화하고 과거 원문fullprefix와 EOF LF1을 보존한다.
### ROOT-ACTOR-REBUILD-CONSUMER-GUARD-20261007 완료 소비자 / NPC canonical 경계

| 항목 | 현재 코드·검수·계획의 정확한 상태 |
|---|---|
| 완료 source | `tools/2_5d-world-lab.mjs` 39715B / `050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8`; 이전 36039B/8388efcf 버전은 역사 핀. 원문9접점 역변환 전체 exact |
| 효과 재생성 소비자 | retiring 전 슬롯을 frozen `INERT_EFFECT`로 비활성화하고 기존 `releaseResource`로 오류·중복 cleanup을 집계. epoch/request identity/job owner/slot identity를 callback 뒤 재확인; stale handle는 자기소유만 해제·게시0. generation은 MAX_SAFE_INTEGER에서 포화하지만 새 frozen request identity로 최신요청을 구분 |
| 중첩 요청 | 동기 callback의 재진입을 허용하되 최신 pending 요청1만 기존 frame 시작에서 처리. finally 즉시 재귀0; dispose 시 pending/request 무효화. 초기 생성도 local create→takeInitialized→publish 순서. `createEffects`는 initializationScene을 사용 |
| 진단 계약 | `__rift25Lifecycle.snapshot().effectRebuild` 및 기존 lab snapshot의 frozen `{generation,phase,pending,failures,cueFailures,reasons}`. phase는 idle/cue/retiring/creating/publishing. INERT reason은 rebuild-unavailable; slot reason은 rebuild-pending/factory-failed/slot-replaced. 실패 시 효과 비활성 상태를 리프 UI에 표시 |
| 새 source 검수 | 신규 단일 source VM1 / 11그룹104조건 PASS / FAIL0 / exit0. actual Three와 public producer 사용, lifecycle/RAF/UI ports는 mock. 이번 소스검수로 GUI/GPU/main/native6/save/audio 승격0. source limited-result19801B/`add91a250b887fcd26ba8a85885bc34abf52d3ee71b3ee75f94cf18ea4f5b893` |
| 완료 영수증 | 외부 `actor-rebuild-consumer-guard/final-receipt.json` 8754B / `e2ccde8c49fd9f2f8f23e0f5bb78541b088a473043785965ae3484a15deac2e0`; worker code1+docs3 frozen, root 완료소유 checkpoint 대상. 새 브라우저3범위는 별도 진행중이며 완료0 |
| 불변 producer / 본편 | actor12162B/`a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`; game4050426B/ece8c398 및 mainruntime7519B/b93cb86f 유지. actor cleanup은5856578b, 이전 실제 Chrome 준비2FAIL와 GPU후검사2FAIL 및 제한12조건 관측은4b487cde 역사에 보존. old suite 재실행·합산0 |
| owner memory | reentrant 공식 end `b7c855c2-b213-4860-af41-9a433e5aef9a`@2026-10-06T20:37:33.547Z / endraw `d07d61da3a399bd0c03fef32478dcecf892052e2336093acd80328e44b98c001`. reported9 중 유효7 / 무조건 assert(true)2 제외; root 재실행0. 소스구현 신규104조건과 합산0 |
| 미해결 생성 경계 | producer geometry constructor 부분할당 및 `scene.add→all.push` 소유 등록 전 callback 재진입은 이번 소비자 수정으로 해결 증명0. 기존 owner의 독립조사 수집을 이어감 / 전문TASK 중복송신0 |
| 실제 주민 | Haran/Berin/Nessa/Dorik 4명. 이전 요청의 fifth는 UNCONFIRMED_REQUEST_SCOPE / 기존 NPC5확정0. 읽기영수증 `npc-canonical-identity-lookup/read-only-result.json`30058B/`5385815a9ee00a1426fa0261b23b4dece300407a8565ff31c7a9a19de4415c3d` |
| 베린 유품 | offer/o_take→gift.accept / story.berin.keepsake는 기존 대화 참조. canonical 지급 item definition/quantity/durable ledger는 UNDEFINED. grantOnce:true를 quantity1로 추론0; game mkItem의 Date.now+Math.random은 생성 인스턴스ID이며 contentID가 아님. 사용자 유품 종류 질문 pending / 실제 지급 consumer 미구현 |
| 네사 부탁 / 다른 주민 | story/o_accept→quest.accept / story.nessa.findLin·벌레굴 참조는 기존. 등록 questID/Lin entity/구출조건/보상 UNDEFINED. Haran/Dorik 대화·session met flags는 기존, main durable flags 미등록. 보스/여신/다른 플래그 임의전용0 |
| 다음 승인 미완료 | 기존 owner를 통해 producer부분할당·등록 조사 종료수집, 새 실제 Chrome 재생성 검수, 명시 NPC choice→Continuebusy→동일slot inventory+ledger ACK/readback 소비자 진행. canonical 유품 질문에 의존하는 지급 바인딩은 답 전 보류, 독립 제작 지속 |
| 범위·인수 | 맵 geometry/outermass/ground/landmark/DPR/색/opacity/default motion/원PNG·scene·nav 변경0. 전체맵 VISUAL RETOUCH; defaultdemo CH1-1→hub, childP/char, 본편native6·청취·실보상save·A급 미인수. fixture/raw/lab/소스접점을 실제플레이완료로 계산0 |

전체 docs 검색은 `effectRebuild|updateReducedMotion|createEffects|INERT_EFFECT|actor-effect-lifetime|reduced.motion|재생성|cleanupFailures`로164경로853줄 / raw1164941B/`10b2bcd91dac12f1339837cd715a951b8f90b41984306b83b752af1eb9869f7f`, precise19경로223줄과 경로별 disposition을 기록했다. 관련 현재핀·구현상태는 worker3+rootops6+directional/editor/SSOT/dialogue에 동기화하고 과거 원prefix와 EOF LF1을 보존한다. 보호2_3·타인WIP·ownerSTATELOG는 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=기존 지옥의 틈 2.5D 소비자의 효과 수명 보정; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL=지형·원화·배치 변경0, 기존 SSOT/LOCK/guide 유지. CAMERA QA=신규 화면검수 별도 진행중/이번 source 완료판정에는 포함0. TECH QA=신규 source VM11/104 PASS와9접점 역변환 exact; geometry 부분할당은 미해결. ACTUAL PLAY/NATIVE/AUDIO/SAVE=미인수. **VISUAL VERDICT: RETOUCH**.
### ROOT-ACTOR-REBUILD-CONSUMER-BROWSER-20261007 후속 실제 관측 / 실패 이력 보존

코드1+docs14 완료 guard는 `bd0d89e10f0fab7ce843184dab44a951a296346a` normal commit/push·remote exact에 보존했다. world39715B/050f627b…와 actor12162B/a8089888…는 이번 화면 검수 전후 불변이다. 소스 VM11/104와 아래 실제 Chrome 조건은 별도 검수이며 합산하지 않는다.

| 새 실제 관측 | 정확한 인수·제한 |
|---|---|
| 최초 원실행 | Chrome1/context1/parent1/child3, 준비7PASS / raw0PASS·3waittimeoutFAIL·exit1. matches false→true였으나 change event0 / generation0 / old3 / dispose0, consumer 조건0도달. 제품 결함 판정UNKNOWN / 최초 실패·PNG 보존 |
| 승인 후속 | Chrome1/context1/parent1/child3, 신규3scope/15조건 PASS·FAIL0·exit0. 후속 필수setup10관측은 새로운 PASS 수에 포함0. 처음3FAIL을 교체·합산0 |
| native trigger | 실제 updateReducedMotion 리스너 readytrue 등록 확인. same-origin iframe는 parent CDP target 공유; 별도Frame session 미지원 오류 원문 보존. 실제 parent CDP Emulation 설정1회+500ms 순수대기/비폴링으로 browser-generated MQL isTrustedtrue 각child3 관측, synthetic-init fallback0 / OS사용자설정 변경0 |
| 최초 원인 경계 | matches getter polling 제거와 CDP설정 경로를 동시에 바꿨으므로 최초 실패의 단일원인 확정0. 실패를 소비자 결함 또는 특정 관측간섭으로 단정0 |
| retirement 오류 | old warrior dispose 호출 전에 슬롯INERT, actual public producer material throw 뒤 controlledError1/cleanupFailures1. old3 각dispose1, reducedMotion=true 새current3 실소비; generation1/idle/pendingfalse/factoryFailure0/cueFailure0/reasons빈값. 다른 actor 처리 계속 |
| 중첩 반환 | 실제 새 factory 반환 직전 synthetic MQL(isTrustedfalse)1: generation1 creating을 revoke→generation2 pendingtrue. 생성완료 stale handle1은 dispose1/update0, 기존RAF 시작의 pendingflush 정확1회→latest current3 소비. factory recursiondepth1/pendingRAF1. 이 합성 callback을 자연MQL/OS동작으로 승격0 |
| 종료 반환 | 같은factory 반환 직전 synthetic pagehide(isTrustedfalse)1: old3 및 unpublished new 각dispose1 / lateResourceRejected1 / INERT 유지. readyfalse/disposedtrue/epoch1/RAFfalse/pendingfalse, 이후 RAF요청·DOM변경·lateconsume/publish0. native navigation/pagehide 인수로 승격0 |
| actual render | 새 active consumer 상태에서 current program LINKtrue/getError0와 실제 existingRAF/render를 관측. post-unload GL0 조건을 쓰지 않음 / context loss 및 물리GPU메모리 해제 UNKNOWN·미인수 |
| 전체 새 실행수 | 이번 task만 Chrome2/context2/parent2/child6. 과거 child6/runtime3/actor2/CPU7/owner모델11·9/기존DPR 재실행·합산0 |
| 보호 / 오류 | source11핀 전후 exact, pageerror/consoleerror/HTTP404/foreign/mutation/download0, source scene clone 및 격리storage 불변. worker의 repo/docs/Git/save 쓰기0, 게임/서버 실행0 |
| 실제 화면 | `actor-rebuild-consumer-browser/followup/native-retirement-new-current.png`1096541B/`6bb5336279c87451b0812325b23b17706d6ef3afa0250ec6856b9ea013878670`; root가1600×1050 정지화면 직접확인. 다크드루이드 표시·retirement뒤렌더 관측, 배경 확대 흐림은 남음 / 모션영상·전체카메라·A급 인수0 |
| 정확 증거핀 | 최초raw72068B/`9be85d317ff8f5aee14697f61b38853d0765f72b34d58fba65744c63ccb5c1bd`; 후속raw506135B/`cdf3b38de667d402ba2d7b6403e2722cca77420fbbfeeb44b20d2ca759adbeb6`; summary23027B/`bd964b35919458ff01ac74fd0a3b38112359388bcdaba7564ed326b3f3046f2d` |
| 종료 영수증 / §23 | final-receipt6925B/`463398d6a8f55d5059bf612820febafec3f7c102c1b3201246270182c3afb1d7`; map-production-report4518B/`31cb0012ea6a76d9604a1dbfbf7e1dc8e47e406bba0ce7a37efffa61617b000c`, 외부 실제3387 독립fixture / 본편native6·save·audio 미인수 |
| 새 producer memory | 공식end `44504058-6e75-4e38-8bed-a4215bcfcfe1`@2026-10-06T20:45:49.855Z / raw7087B/`c80e2bb464ef4ee531d11ae70766fd8f14b969e780c53ed68d2c2f4edfb0cd9d`. reported7assertions는 실제producer source+fakeTHREE/scene, FIXED 일부모델; root실험0·GPU0·실dispose콜백재진입 증명0 |
| 다음 source 의존성 | read-only-plan21958B/`64bd2d583d9862064567d98e3d9de99d4bcad3aba2f630cf1224827191aca4ea`: geometry 부분할당, material/Mesh/add 실패의 private pending ledger+공통persistent dedup, 성공committed만 all.length/meshes집계가 필요한 미구현 계획. add attach후throw의 remove 실패를 숨기지 않음. update throw가 RAF를 멈추는 별도consumer 오류정책도 미해결 |
| 실제 후속 owner | 2026-10-06T21:01:27.103921Z 관측 CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY sent/peer/Read/source1·end0 / 메모리·파일0. Mesh 생성 실패·실dispose콜백 두 새단위만 기존owner 송신. 같은TASK/7assertions 재송신·재실행0. STORY기존큐 미소비, 실제4NPC·유품종류 질문pending / dependent지급만답대기·독립제작지속 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK=기존 silhouette·route·asset·배치·nav·ground 구조 변경0, guide/SSOT/LOCK 유지. PLAYABLE=3387 독립 실제worldlab iframe의 효과교체 소비자3범위만 관측; combat·실게임·보상·장전환·save/native6·audio0. CAMERA QA=새1600×1050 endpoint정지화면 확인 / START→EXIT 전체재생·영상검수0. TECH QA=최초3timeout 이력과후속3scope15조건 PASS를 분리, source11 exact·물리GPU UNKNOWN. FILES=worker 외부 증거만/root 관련docs 동기화, 타인WIP·원PNG/scene/nav·보호2_3·user save 불변. **VISUAL VERDICT: RETOUCH**.

관련 docs disposition은 신규 소스 완료단위의 whole164경로853줄/precise19경로223줄, `npc-canonical-identity-lookup/root-rebuild-docs-disposition.json`23701B/`d197783b7fd4c33868e274f7c502b747fc4f8756748e3ca5d59d8b8a599cb541`와 추가 current worldlab 참조 HELL_RIFT_EDITOR_RESULT를 따른다. 이번14문서의 과거 원prefix를 유지하고 EOF LF1로 새 사실만 동기화한다. 본편 defaultdemo→hub·childP/char·NPC durableACK/readback·실청취/native6/실save·A급 완료 선언0. WOLF 거절 목적 HOLD와 피해UNKNOWN은 기존기록대로 유지한다.
### ROOT-ACTOR-GEOMETRY-CONSTRUCTOR-UNWIND-20261007 완료 접점 / 새 후속 근거

| 항목 | 현재 구현·검수·남은 범위 |
|---|---|
| 현재 public actor | `tools/2_5d/actor-effect-lifetime.mjs`12639B/`6870a20883dd9e858895d0fdb951f5ab34bf3f33043ff63a88c9a381e3b982eb`; 이전12162B/a8089888은 dispose 및 Chrome 검수 당시 역사 핀. source1접점 역변환 전체12162B exact / 외부백업 선행 |
| 생성 실패 회수 | 두 geometry constructor를 local refs dustGeo/attackGeo(null초기값)로 감싸고 throw 시 `unwindGeometryConstruction`으로 반환받은 owned ref만 Set identity중복 없이 각각 dispose 시도. cleanup 실패여도 다음 owned ref 시도·원 thrown value 그대로 전달. cleanup 실패를 성공 회수로 표시0 / 추가오류API·disposed통계 변경0 |
| 불변 생성 arguments | dust RingGeometry(0.55,1,28,1), attack RingGeometry(0.62,1,24,1,-0.9,1.8), 생성 순서 및 normal path 동일. constructor 외 publicAPI/default/depth/spawn/acquire/material/Mesh/place/update/dispose·number성공계약 불변 |
| 새 제한검수 | 단일stdin1 / source6그룹 유의미24조건 PASS / FAIL0 / exit0. normal actualThree·실제geometry dispose event + constructor실패 fake port·actualprivatehelper CPU. 원raw25PASS 중 미연결 disposeCalls assertion1 제외; 첫constructor exact nullthrow·첫constructor1회호출은 유효관측, 미보유ref dispose0를 실제측정으로 주장0. 전체재실행0 |
| 남은 경계 | constructor 내부에서 throw해 반환ref가 없는 allocation은 UNKNOWN. cleanup throw의 실제회수 실패도 해결완료0. material/Mesh/add 실패·acquire재진입·privatependingledger·persistentdedup·frame/update 오류정책은 이번 접점 밖 미해결; public fullproducer 교체완료0 |
| 최종 source 영수증 | `actor-geometry-constructor-unwind/final-receipt.json`11730B/`3d166986f5632c51c8884afce83f01f33bb271533d288db2de1e8165e2acac8c`, workercode1+docs2 frozen / 정상소유checkpoint 대상. newGUI/GPU/main/native6/audio/save 인수0 |
| world / 이전 실제 Chrome | world39715B/`050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8` 불변. sourceguard code1+docs14는bd0d89e1, 실제Chrome 후속3/15 PASS와최초3timeout이력은5fffc2e6에보존; 그때actor12162핀 검수였으며 새12639 GUI·GPU검수로승격0. nativeMQL trusted3와callback synthetic2 provenance 유지·old실행/CPU47/104 재실행·합산0 |
| 새 owner memory | CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY-RESULT 공식end `13ccc735-8e0b-4cdb-a218-0a17e82fbb1b`@2026-10-06T21:03:18.621Z/raw7642B/`e5f631661eb8f339cae217937a46d460b2d5279a91a1da59bc1c2f98b2cc8d96`. 첫stdin은 미존재snapshot.disposed 검사로exit1, 다음은actualproducer+fakeTHREE/scene 실dispose콜백 결함재현11PASS/exit0. 두실행·FIXED모델·root미채택을 구분, 실제브라우저/GPU·수정완료로세지않음 |
| 다음 승인 단위 | 기존owner가 새 terrain변환콜백 중 종료와 effect.update throw→RAF중단 정책2접점을 조사 중. 새공식end/정확핀만 이어수집하고 동일TASK/7·11모델 재송신·재실행0. root 허용 최소실구현은 성공committed수와pending소유를분리하고 disposed후live재게시·rollback중복해제·attach후remove실패를 숨기지 않는 producer/consumer 순서 |
| 콘텐츠 의존성 | 실제Haran/Berin/Nessa/Dorik4/NPC유품종류질문pending은 그대로. dependent지급item·quantity·Lin퀘스트정의/동일slot inventory+ledger ACK/readback 미구현만답대기, 독립수명·맵·에디터제작지속 / STORY큐중복송신0 |

코드 변경 뒤 whole docs 관련keyword검색49경로662줄/raw1406762B/`2889835670b2ae50daed3f019f28d4e9558be304b023a2238d9be24ed408021b`, precise20경로313줄 disposition을 기록했다. 처음 overescaped scene.add 항목은 누락구성요소만1회검색·union dedup했고 최초검색파일을보존했다. worker현재source/docs2와 root 관련현재참조16문서에 새핀·계약·인수상태를 동기화하고 과거fullprefix/EOF LF1을 보존한다. ownerSTATELOG·보호2_3·타인WIP·원PNG/scene/nav·user save 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=actor constructor owned resource unwind; OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/SMALL DETAIL=기존맵geometry·배치·원화·nav·대화/보상 변경0, guide/SSOT/LOCK 유지. CAMERA QA=이번 새화면/영상0, 이전endpoint화면에서배경확대흐림미해결. TECH QA=source1접점역변환exact/새6그룹 유의미24조건 PASS와raw25의제외1분리; constructor실패CPU/fakeport이고GPU/실게임아님. ACTUAL MAIN/NATIVE6/AUDIO/SAVE=A급 포함 미인수. **VISUAL VERDICT: RETOUCH / 이번 시각 NOT ASSESSED**. WOLF 거절목적 HOLD·피해UNKNOWN과이전모든실패이력은 그대로보존한다.

## 2026-10-07 지형 콜백 종료와 효과 오류 격리의 현행 정본

ROOT-ACTOR-TERRAIN-CALLBACK-CLOSURE-20261007 및 ROOT-ACTOR-UPDATE-FAILURE-CONSUMER-GUARD-20261007의 완료 사실이다. 앞선 12639/39715 source·CPU24/104·Chrome15의 '현재' 설명은 해당 시점 이력이며 아래 핀이 현행이다. 맵 원화·geometry·nav·본편/P/G/세이브·보상·키바인딩·보호2_3/Q전용 magic blackBean·어택티켓 계약은 변경하지 않았다.

| 항목 | 현행 값·구현·검수 경계 |
|---|---|
| public producer | tools/2_5d/actor-effect-lifetime.mjs 12844B / SHA256 660f09d604f4a5f4bcc9ae5e3e1774d2bd52e42744585704706337845c0b0afb. borrowed terrain.worldToScene 직후 disposed이면 p/mesh 접근 전에 place=false, spawn은 visible/live/spawned 재게시0. dust/attack 생성 및 기존 live 순회는 즉시 inactive stats 복사 반환. 원 terrain thrown value·기존 cleanup 오류 의미 보존 |
| public consumer | tools/2_5d-world-lab.mjs 41575B / SHA256 df1760cbf0c1862dc01e591011212aa5a65dcd8d807a49da0441778c5780994e. actor ID/handle/rig/epoch 캡처·snapshot 오류와 update catch 분리, 실패한 동일 slot만 INERT-before-release. 해제 callback 뒤 새 slot/선택/rebuild를 다시 쓰지 않음 |
| 재진입·프레임 | updateOwner가 있으면 살아 있는 정상 pose에서 장식 update만 skip(true), camera/dialogue의 나머지 pose는 유지. dispose가 먼저 owner/epoch를 무효화. pose/render/sample/UI 이후 lifecycle 확인 및 이미 예약된 RAF/document.hidden 확인으로 단일 기존 RAF 유지·종료 뒤 draw/UI/예약0 |
| readonly 진단 | __rift25Lifecycle.snapshot().effectUpdate 및 __rift25Lab.snapshot().effectUpdate = frozen {failures,phase,reasons:frozen copy}. failures는0 시작·caught effect update마다+1·Number.MAX_SAFE_INTEGER 포화. phase=idle/snapshot/updating/retiring, 실패한 현행 slot reason=update-failed, 새 rebuild publish는 해당 reason을 빈문자열로 갱신. 고정 status 리프에 '효과 재생 오류 N' 표시 |
| 소유·미해결 | 아직 다른 slot이 같은 handle을 보유하면 실패 slot에서 release를 보류하고 최종 teardown에 맡김. alias 완전 인수0. material/Mesh/scene.add private pending ledger, 참조 미반환 constructor 내부 할당, rig.snapshot 원오류→readytrue/RAF0 복구는 별도 미해결. Error.message/getter 조회0 |
| 정상 상수 | maxLive24, dust520ms/attack240ms/간격110ms, footBand4320·bands19/39, groundLift0.003, public dust0.14/attack0.17, RGB0x1a140f/0xc8623a·opacity0.5/0.8·reducedMotion=false·depthTest=true 불변. lab 플레이어dust0.022/attack0.08·드루이드dust0.042/attack0.145·depthTest=false 불변 |
| 새 producer source 검수 | 단일 Node 실행9그룹37조건 PASS/FAIL0/exit0. 실제 Three/public producer + 주입 borrowed terrain callback/event의 범위. old24/104/전문13 재실행·합산0 |
| 새 consumer source 검수 | 단일 Node 실행13그룹105조건 PASS/FAIL0/미도달0/exit0. 변경 source18함수/readonly hook·정상 actual Three/public producer. DOM/RAF/renderer/pagehide는 VM fixture이며 Chrome/GPU/native 인수 아님 |
| 새 실제 브라우저 원결과 | 기존3387 격리 parent의 Chrome1/context1/parent1/child5, 원4scope PASS/1scope FAIL·19조건 PASS/1조건 FAIL·exit1 보존. selection scope의 reason==='disposed' 기대실패이며 종료 후 onActorChange가 reason만 바꾸는 실제 source를 관측. activefalse/live0/pool0·해제 event·postwrite0와 같은 뜻으로 취급0 |
| 새 저장자료 제한 평가 | 추가 Chrome/context/child0, 기존 성공19 재평가0. 원 failed 공통1 설명과 미도달4만 after/failureObservation JSON pointer로 좁게 평가하여5지원/UNKNOWN0/exit0. 원 browserFAIL·exit1을 대체하거나5 clean browserPASS로 합산0 |
| 새 실제 화면 | 실제 다크드루이드 이동 y3740→3709.684 및 walk 대표 PNG를 root가 직접 확인. 새 active GL LINKtrue/getError0와 선택변경 뒤 정상 silvertail updates1→2·frames20→21/old16고정 관측. 합성 선택/pagehide는 isTrustedfalse, 실제 물리 GPU 회수·전체카메라·영상·본편native6·청취·보상save 인수0 |
| 공식 memory 입력 | end bb77d9f1-d84b-4851-9e04-cd477b7594c1@2026-10-06T21:10:48.664Z / raw6260B e12cbb9e0c3b4aaee0b28126c654f5ae3ae602cfe6e5f5a9c459c5dded0ad698. reported13은 실제producer7+frame모델6; root source105/37과 합산·실험 반복0 |
| 다음 작업·운영 | 기존 owner의 UPDATE-RETIRE-CALLBACKS 메모리 TASK 송신1은 새 전문 중복지시 없이 공식 end/첫source만 수집. root 소유 producer ledger·rig fatal 진단/회복·선명도·본편 최소 연결은 미완료. 실제4NPC·베린 유품 품목 질문은 해당 지급만대기, STORY 미소비 큐 재송신0. 24시간 제작·주간 사용률 약15 percentage points/day 목표 유지·이 채팅 일일 정확 token 보장0 |

전체 docs 관련 검색은 after-review 27경로538줄/899461B/SHA256 ab9c872435dd23e436143bc6ee613e6689fc13b67a33205ba1d34a8fa87ae4d2이며 모든 경로 disposition을 보존한다. 최초 draft 검색27경로608줄/1059412B/96ada057a39adb91ea8640e3443ca1b50dfb7b072e68790921b67e1d9cc4ac18도 이력 보존. 소유 문서는 원 fullprefix100%·EOF LF1을 보존하며 code2+관련 docs의 정상 commit/push·원격 exact 확인으로 이어진다. 타인 foreign68·owner STATE/LOG4·held WOLF raw 및 이전 승인 거절 목적은 변경하지 않는다.

MAP PRODUCTION REPORT (§23): MASTER=지옥의 틈의 actor cosmetic 수명·프레임 오류 격리. LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL=원화·대지·배치·nav·전투 변경0/기존 guide·SSOT·LOCK 유지. CAMERA QA=새 독립3387의 이동·walk endpoint PNG1 직접 확인/전체 여정·영상 미인수. TECH QA=producer9/37, consumer13/105, 원 Chrome19PASS1FAIL/exit1 및 저장자료 좁은5지원 평가를 분리. 실제 물리 GPU·본편native6·audio·durable save 미인수. **VISUAL VERDICT: RETOUCH**. 배경 확대 흐림이 남아 있으며 A급·실플레이 완료로 계산하지 않는다.

외부 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-callback-closure/final-receipt.json (9184B/c054acf05392da5e7228751beb6a7078e99cb0de1ca26ca1425682cf47beec18), actor-update-failure-consumer-guard/final-source-receipt.json (9352B/2c9cf0d08802276b243e7a9c31b16ef27d802a61bd9785c881ccaa1a69f2da2e), actor-terrain-frame-browser/ 원실패·제한평가·PNG 및 actor-update-failure-formal-end.json (6871B/7bb543948989cc2f3c6ca3b1d2c65556bde7cdf58daa3762d518fe8036e09ebd). 최초 소비자 draft41558/a811 검토의 paused pose 회귀는 검수 실행 전에41575/df1760으로 보정·백업 보존했고, rig snapshot 원오류 미해결은 숨기지 않는다.

브라우저 exact evidence / final receipt6200B: 88e918fa55e90ac33b26e113d7d1a7d4d1a29a8ee9f43686fc86e104a947a735; summary25866B/dbf709bf5f9d1fb370c5030c9f75e280e6db5a9a787785b43dacfd5c705d7091; §23 report4251B/1160af0c152b54c9b2c15076fbd3cc1137d0f247915dfaed9855299a1a95e532. 실제PNG1093251B/68c096c355ec2c065d5ac9d67f68eb9b71e0a91182bd546b0b484c047d1f1250, 경로 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-frame-browser/actual-motion-after-isolated-update-error.png.

### 2026-10-07 ROOT-ACTOR-PENDING-ALLOCATION-LEDGER-20261007 · 현 소비 계약

| 항목 | 현재 구현 / 인수 범위 |
|---|---|
| public source | `tools/2_5d/actor-effect-lifetime.mjs` 14758 B / SHA256 `95b16f5daaf3b64661f59076b0d4fff041ef3d4ca1f760c1df63f98cc78d6e44` |
| 획득 소유권 | material·Mesh 반환 참조는 private pending으로 기록. 성공적으로 등록된 항목만 기존 `all`·`meshes`·최초 `dispose()` 반환 수에 포함한다. pending 개수 공개 0 |
| 종료·부분 실패 | ctor 반환·Mesh setter·scene.add 종료 뒤 disposed guard. 추가 게시·후속 root setter/add 차단; add 진행 중 detach는 반환 뒤 처리하여 dispose 뒤 attach를 누락하지 않음 |
| 회수 중복 | rollback/dispose는 같은 controller의 persistent identity dedup을 공유. borrowed scene/terrain 회수 0. remove 및 owned release 실패를 성공 해제로 계산하지 않으며 재시도 0 |
| 새 snapshot 필드 | frozen `allocationCleanup={detachFailures,releaseFailures}`. 각 primitive 안전정수 0 시작, 해당 실제 예외에 1 증가, `Number.MAX_SAFE_INTEGER`에서 포화 |
| 원 오류·수치 | constructor/add의 원 thrown value(null 포함) 유지. 정상 API·풀/수명/밴드/초기 committed 숫자와 기존 update/terrain guard 보존 |
| 최초 source 검수 | 14628 B / `eff18b04cc80c47ee41f62602b782a44ac213e074fe3e936c2d333eaf3f2dfb3`에서 실제 source·Three와 주입 ctor/borrowed scene 콜백의 단일 Node 16그룹·162조건 PASS. 기존 검사 재실행 0 |
| 읽기 반례와 제한 보정 | root 읽기검토의 Mesh setter→dispose→late scene.add 가능성은 native 실제 관측이 아니다. 해당 경계만 새 source에서 신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0; 최초162와 합산·핀 이동·원 실패 교체 0 |
| 한계 | 참조 미반환 ctor 내부 할당 UNKNOWN. 임의 ctor identity alias·dependency 자체 외부 late write 일반 보장 0. 실패 remove의 실제 attached 상태·release event 0은 회수 성공이 아니다. GUI·GPU·본편/native6·청취·실save 새 인수 0 |

원 source12844/660f와 종료 소비자41575/df1760는 각각 보존 이력이다. 이번 변경은 효과 자원 획득·회수 계약이며 맵 PNG/scene/nav·geometry 배치·카메라·전투·Q 전용·보호2_3 변경 0. §23: 작업=효과 allocation consumer, MASTER/지형/플레이/랜드마크/세부/카메라 새 제작=0, TECH=신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0 및 이전16/162를 별도 기록, 신규 VISUAL NOT ASSESSED / 기존 전체 RETOUCH. 같은 검사·TASK·이력 재실행 0.

다음 미완료: 맵 흐림·절벽 접합 시각 품질, rig.snapshot/render fatal frame 복구, NPC 유품·부탁의 본편 durable 소비자, 실제 native6·청취·보상 save. 최신 운영 근거는 PROJECT_MANAGEMENT_MASTER와 연속 dispatch 정본을 따른다.

### 2026-10-07 ROOT-RIFT-PLATE-SHARPNESS-AB-20261007 · 현재 비교 consumer와 실화면 인수

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| ground source | `tools/2_5d/rift-ground-detail.mjs` 21249 B / `830eef30ee9bc9e74219d12fa954300796a5b2ee53ce961bc3544affdfb8837e` |
| terrain source | `tools/2_5d/rift-terrain.mjs` 16816 B / `c7079fdbc32f4d19cc9ee89e6dc67ae81d6cb92d7d28e7169d29829ed45d44a0` |
| lab source | `tools/2_5d-world-lab.mjs` 42125 B / `4c5cdb71a0bd4330c3afb6d75440b41f6f33f42989360af31a517999ec1be101`; HTML 12266 B / `e2f0f1692df08f67bc2e6dc42f8e692a53ca060e33833813c8f58492adb8089c` |
| 비교 UI / API | `plate-sharpness` select 0 / 0.5 / 1, 기본0/OFF. leaf `plate-sharpness-status`. 새 factory옵션 `plateSharpness=0, renderer=null`(borrowed), ground/terrain `setPlateSharpness(number)`; 유한 number0..1 검사. `__rift25Lab.snapshot().terrain.groundDetail.plateSharpness`의 requestedStrength/effectiveStrength 구분 |
| 처리 범위 | 등록된1254×1254 원 plate의 ground RGB 확대만 Catmull-Rom 16 taps와 중앙2×2 채널별 min/max clamp. UV texel-centre clamp. 기존sample의alpha·multiply 보존. gamma 변환 추가0·원PNG/scene/nav/geometry/camera/rig/save 변경0 |
| 활성 조건 / fallback | 실제같은borrowed renderer·pinned Three160 map chunk·등록plate·WebGL2 또는 엄격WebGL1 OES_standard_derivatives. 양축 derivative footprint >0 및 ≤1 조건에서만 확대RGB 재구성. unknown/mismatch/minifying는 원plate. ground-detail OFF 또는 dispose 뒤 effective0. compiled는hook 계약이며 LINK 인수와 별개 |
| 샘플 비용 | 활성확대 plate 원1+추가RGB16=17 fetch(기존대비+16). 기존ground nominal4→20, 조건별분기·GPU실측아님. 읽기계획의+15는 미채택 제안 이력. 추가 texture/geometry/renderer/RAF/timer0 |
| source Gate | 동결code4의 신규 Node1회 11그룹153조건 PASS / FAIL0·미도달0·exit0. actualThree160/actualfactory·shaderhook와 GLSL CPU계산; image decode/canvas/renderer capabilities는fixture·GPU0. 이전suite 재실행·합산0 |
| 실Chrome Gate | 같은4source핀 신규 Chrome1/context1/labpage1/child0. 6그룹13조건 PASS / FAIL0·미도달0·exit0, 재실행0. paused160%/DPR1/전사(5480,3740)/detailON 동일조건에서 실제select handler→uniform 0→0.5→1→0. source4+보호8 exact·scene/storage 불변. selectOption change는isTrustedfalse |
| 실제 픽셀 | 0.5 RGB600148px / 1 RGB745063px 변화, 합성최종framebuffer alpha차이 각각0. OFF복귀 RGBA 및PNG exact. 이 alpha는 중간 원plate 투명shader alpha의 독립 검증이 아니다 |
| 실제 LINK / 비용 관측 | 13program LINK true·GL0·404/오류/foreign0. 각조건 warmup8+renderer.render wall60표본 median 0/0.5/1/복귀 = 0.5/0.6/0.5/0.6ms, calls11/triangles2456 동일. GPU시간·17fetch 비용실측·실물성능 보장이 아니다 |
| 시각 판정 / 적용 | root와GUI담당이 원본/강함PNG 직접 관찰. 바닥 결·윤곽 소폭 강화, 절벽·뿌리 저해상도 흐림은 여전히 큼. 전체 VISUAL VERDICT: RETOUCH. 비교기능만 적용, 기본0/OFF 유지·새디테일복원/A급완성/맵선명도완성PASS0 |
| 정확 근거 | implementation/final-receipt16070B/c2bdd2f21f4315a4eb5398e300095f8ebca4fb594167fa2e19d8b72435bdcc8a. browser/final-receipt9199B/b800f617a39c8f800a0a4c280a760213c943ea5374e02c5323de186f35962a31. source153과GUI13 합산0. readonlyreview7443B/c3f39c3320b37c7e50097383219b1193df552519dc97f09420a6d8ec0404ac4e는같은4핀초안읽기, 테스트아님 |

§23 MAP PRODUCTION REPORT: 작업=등록지면RGB 확대비교; 선행=fullguide·SSOT_INDEX·stageLOCK와exact읽기계획37853/a6df. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은 기존등록공간보존/새geometry·배치0. CAMERA QA=동일paused160%/DPR1 새Chrome A/B·복귀·전사동작재개. TECH QA=source11/153와GUI6/13 별도핀·source12 exact·LINK13/GL0. VISUAL VERDICT: RETOUCH. PNG4와controls1은 외부 `plate-sharpness-ab-browser/`에 보존. 본편/native6·청취·실보상save·GPU물리메모리·실물모니터·독립platealpha 미인수.

현재shader 비교기능의기본OFF와전경/절벽흐림 RETOUCH를유지한다. 다음작업은실editor mask1024중간축소·feather/cache 및fatalframe 소비접점, NPCdurablebinding·본편native6/청취/save이며 정본PROJECT_MANAGEMENT_MASTER의 최신운영근거를따른다.
### 2026-10-07 ROOT-EDITOR-MASK-SOURCE-NATIVE-AB-20261007 · 선택 원본 마스크 비교와 실제 Canvas 검수

| 항목 | 현재 구현 / 정확한 인수 경계 |
|---|---|
| source | `tools/map-scene-editor.js` 82229 B / `4c037c1cd732ecb6001365ef46352abe47dbfaa2bd8fec4458024fe0adc633fd` |
| 기본 / 적용 대상 | `scene-mask-resolution` select legacy/native, 기본legacy. 선택한 feather 또는 sourceParallax composed-mask 객체1개만 native opt-in. leaf `scene-mask-resolution-status`; `EXODUSER_SCENE_EDITOR.maskResolution()` read-only 관측 |
| 버퍼 / 경계 | legacy는 기존 최대축1024 중간 버퍼(작은crop는 확대될 수 있음), native는 기존8192 image-admission 범위 안의 원본 crop `ceil(w/h)`. crop/월드aspect/월드feather·256 feather샘플/CTM/opacity 보존. 새8192 cap 정책 추가0 |
| 실제 대상 | 등록 심연 `obj-rift-depth` source1920×1920 / fullcrop / world8000×8000 / feather120 / sourceParallax0.965: legacy1024²→native1920². roots/horn3은 직접clip 경로여서 이 composed-mask 비교 적용·개선 주장0 |
| 선택 / 캐시 | 기존 최대8 insertion-order 캐시 유지, 옵션·선택 전환 시 이전native만 해제하여 retained native≤1. 원본PNG/scene/nav/배치 변경0. native retainedRGBA 계산값과 실제물리메모리·GC·GPU회수 구분 |
| 내보내기 / 저장 | unselected·직접clip·PNG export는 기존legacy 처리. 원화1920 이상 새로운 세부 생성0. 실제동일scene/localStorage 불변; 본편 save·보상 저장 인수0 |
| source CPU 이력 | 최초82218 B / bd89e5da3bdbdcca2d835607b1e885fed1cbb9224d10e6e3edffd395fd1f3ac6에서 신규Node1회10그룹129조건 PASS / FAIL0·미도달0·exit0. DOM/Image/Canvas ports fixture, 실제Canvas RGB/GPU0. 최종82229는 옵션문구1개 정정뿐이며 전체inverse exact; CPU129 재실행·최종핀 이동0 |
| 첫 실제 Chrome | 최종82229/4c037 실제JS response exact. Chrome1/context1/editorpage1. 그룹1·2 PASS, 그룹3의복귀RGBA FAIL(도달5조건중4PASS/1FAIL), 그룹3잔여·4~6 미도달·exit1. RGB912418px/max11 차이, alpha차0. legacy mask/image alpha histogram·feather256 hash·crop/destination/CTM/opacity exact. 최초실패 보존·원인확정0 |
| 한정 후속 | 실패3·미도달4~6만 새Chrome1/context1/page1, 4그룹6조건 PASS / FAIL0·미도달0·exit0. 비교 전4회 main readback+실제UI redraw warmup은준비관측/PASS집계0. sentinel 최초→2번째 변경, 2~4번째 exact. Chromium backend 전환은 가설/미관측 |
| 후속 실제 픽셀 | 안정화된 같은view4100/4100/zoom0.864/selection에서 legacy→native→legacy RGBA와PNG exact복귀. native RGB678172px/max13 변화·합성최종alpha차0. 최초미안정복귀FAIL을 지우거나 전체6cleanPASS로 합산0 |
| 실제 cache 관측 | native선택1/retainedRGBA29491200 B → plainhorn선택native0/abysslegacy1024/8388608 B → abyss재선택native1. 실제1객체 관측, 설정8 eviction/2 composed객체/GPU메모리 인수0 |
| 보호 / 시각 | source14정확핀·scene/storage{} exact, 오류·404·foreign0. root/GUI담당 원본·native PNG 직접관찰: 심연 미세세부차이 약함, 확대된 절벽·전경의 전체흐림 지속. VISUAL VERDICT: RETOUCH, 기본legacy 유지·A급/본편/native6/청취/실보상save 인수0 |
| 영수증 | worker final34835 B / 92b8d3f1949f982df007104cd17dcb57747e66926e1caa985b45bc3bc0d808dc. 첫 실패분석4034 B / b54582d8aa3653db3b7cdb38d572639c1e26ee9b593a615a951050abd4883e54. GUI final 7806 B / e8b9454e0c6f1f361654e3592ac1e7e8a6041f723beef78c61c43dc2772a8adb; 첫검사와한정후속 별도핀/합산0. |

§23 MAP PRODUCTION REPORT: 작업=기존선택composed-mask의legacy/native 중간해상도 비교; fullguide·SSOT_INDEX·stageLOCK 선행정확근거를재사용. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은등록원화·geometry·nav·배치를보존/새제작0. CAMERA QA=같은view/zoom/selection Canvas A/B와첫복귀FAIL·관측안정화후한정복귀인수분리. TECH QA=sourceCPU10/129 이력핀·최종문구inverse, 실제첫FAIL 및한정후속4/6, 실제native선택해제·legacy export·source14정확. VISUAL VERDICT: RETOUCH. 첫/후속PNG와원자료는외부 `editor-mask-source-native-browser/`에보존. 전체맵선명도완성·main/native6·청취·GPU물리회수·실save 미인수.

선택된composed-mask의기본legacy와실제첫복귀FAIL/관측안정화한정후속을분리하여유지한다. 원화·전경·절벽확대흐림은전체RETOUCH이며본편/native6·청취/save미인수. 다음fatalframe 소비접점과최신운영근거는PROJECT_MANAGEMENT_MASTER를따른다.

### 2026-10-07 ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007 · 필수 snapshot/render 실패의 현재 owner 중단

| 항목 | 현재 consumer / 정확한 검수 범위 |
|---|---|
| source | `tools/2_5d-world-lab.mjs` 45509 B / `3c5faddc2c0dc32b3e0feef3cce9550ec4a4aeb3b99be8bf61a044d69b8ac8ad` |
| 최소 접점 | 공통 `readRigSnapshot(id,rig,owner=null)`: effect update·paused updateUi·select의 실제 rig.snapshot 호출. 공통 render의 실제renderer.render. init/provider 전체예외·game.html 본편의일괄예외처리 변경0 |
| current fence | snapshot 전 id/rig/lifecycleEpoch·선택슬롯·optional effectUpdateOwner 참조, render 전 renderer/scene/camera/lifecycleEpoch 참조를캡처. 호출전후 current재확인. disposed/contextLost/epoch·identity/선택변경이 먼저이면 stale primitive관측만하고현재자원·UI·ready를덮지않음. 실제같은id re-init기능 추가/확인0 |
| 중단 / 우선순위 | 현재 실패만 최초private thrown reference+presence를기록(undefined/null도보존); ready=false/error고정/raf0/lastTime=null/heldclear·attackQueued=false·previewMode=null·anchorJob=null·rebuildrequest/pending/owner·updateowner해제를plainstate로먼저commit. previewentry무효화. 기존resume/rebuild/current guard로재시작0 |
| 고정 오류 | `FRAME_FATAL_ERROR='캐릭터 또는 화면 표시 오류로 시험을 중단했습니다. 페이지를 다시 열어 주세요.'`. raw `error.message`/String/getter/coercion 읽기0, 외부throw를기존fail(error) formatter에전달0. DOM leaf만보고·부모내용교체0, control.disabled/기존loading표시 |
| 진단 | `__rift25Lifecycle.snapshot().frameFatal` frozen primitive: failed/hasCause/phase(`rig-snapshot` 또는 `render`)/actorId/epoch/staleFailures/reportFailures/heldKeyCount/attackQueued/previewMode/anchorPending/rebuildPending/rebuildOwnerActive/updateOwnerActive. stale/report count는기존Number.MAX_SAFE_INTEGER까지saturate. rawcause/rig/renderer/ownerhandle 공개0 |
| 보고 재진입 | DOM/cancelRAF 보고 전후disposed·epoch·고정error current경계를확인하고개별보고실패는reportFailures로보존. 원thrown identity/phase와failclosed 상태를덮지않음. render성공/현재일때만frames++ |
| 자원 수명 / 미도입 | fatal은sticky STOPPED 상태이며즉시resource release정책0. 기존pagehide/dispose가단일full teardown owner, WeakSet attempt-before-release·독립정리실패계수계약유지. 재시도3/한프레임bridge/lastSnapshot cache/새필드schema검증/새RAF·timer·factory0 |
| source Gate | 최종45509/3c5f의신규Node1회 actual-source VM8그룹41조건 PASS / FAIL0·미도달0·준비오류0·exit0. 실제sourcefunction/span과actualThree/publicproducer정상경로, DOM/RAF/rig/renderer는통제ports. fullbrowser/WebGL GPU검사아님. oldmemory7/9·effect37/105·oldChrome 재실행·합산0 |
| source 경계 | active snapshot·pausedUI/select·frame/directrender·pagehide승리·selected/slot변경·undefined/null/hostileformatter·후속독립dispose/report실패·safe진단/restart 차단을호출한 CPU근거. 모든provider/driver예외를처리했다고확대0. 공개 `__rift25Lab.snapshot` 원형불변: 실패후안전검수는Lifecycle진단사용 |
| 실제 Chrome | 실제 최종world HTTP source45509/3c5f exact, originalrig/Three query provider를호출한후통제된snapshot/render fixture throw(자발적provider/GPU driver오류가아님). 최초Chrome1/context1/parentQAfixture1/순차actuallabchild3: frame rig.snapshot·frame renderer.render 2그룹12조건PASS, paused-select그룹TIMEOUT FAIL/exit1·6조건미도달. actualfixedleafUI/RAF0·입력/jobs해제·rawformatter getters0·trusted nativepagehide·rig3/renderer1 및riggeometry3/material3 dispose호출관측, 물리GPU해제보장아님. 세번째는trustedpause click/ArrowDown에도change0/fixtureThrows0/전사·readytrue/정상pausedRAF여서제품실패경계未도달. 세번째준비만새Chrome1/context1/parent1/child1 한정후속 ArrowDown+Enter: 다시native-selectcommit TIMEOUT/exit1,0PASS/1FAIL·조건0도달·6미도달,fixtureThrows0/readytrue·전사유지. 추가Chrome0·선택consumer GUI UNKNOWN, pausedRAF updateUi GUI UNKNOWN(CPUactualsource근거별도). 총Chrome/context/parent2씩·child4, 원첫2PASS/1FAIL과후속0PASS/1FAIL을합산·성공12/CPU41재실행0. actualsource12정확/원scene/storage·pageerror/404/foreign0. 최초raw341391B/8f71a4438b002d119e2b3287cac4196449ecdac5d6c86347cfc94d754d29df4f, 후속raw74934B/fccc3a0d5d28b6c16ed4345a8520d8612186ee9bb16345995c030f5ebc1c9769 동결 |
| 정확 근거 | worker final21520 B / 826615d9ca926e3725aec10b390369f7b43ea6e2a436c7bc0fe20255afea4bf3; readonly계획13398 B / 849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69는실행0 이력. 새actualChrome final9747 B / 9c8f87a7b94b228073c0a98d8bafc44ed580b4b40131bd3ad193d70909735dfa; summary24217/dcbaf2bdf44bdf6c276692bd37cf46b5881491e853a596e7fb37cab28402bd13; §23 report3886/cebec413b296fce7c5b10d38ab580b48c10d4cf4cbb27a60b969c797fd0d3edb |

§23 MAP PRODUCTION REPORT: 작업=기존world의필수snapshot/render TECH QA 실패consumer; fullguide/SSOT_INDEX/stageLOCK의기존정확읽기근거재사용. MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은원PNG/scene/nav/geometry/발접지/배치/카메라보존·새맵제작0. CAMERA QA=새오류UI에대한실제lab실패주입범위분리. TECH QA=최종source8/41 및새Chrome별도핀; stickySTOPPED→nativepagehide teardown 관측, 물리GPU해제아님. VISUAL VERDICT: RETOUCH(기존전체맵), 오류UI검수는맵선명도/A급완성의인수가아님. 본편/native6·청취·실보상save·allproviderfault 미인수.

#### 원총괄 현재 운영·새 전문 메모리 원자료 (후보 미채택)

| 단위 | 정확 공식 완료·검수 범위 |
|---|---|
| root 현재 보존 | ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007의 완료 code1+관련정본docs21만 정상 checkpoint 대상. 직전 HEAD/remote exact c6f295858c656cf729fb77f1417ad039ed280dee. 타인68·owner STATE/LOG4·WOLF HOLD1은 별도 유지/index 포함0. 현재 code45509/3c5f, worker21520/8266와 GUI9747/9c8f의 신규 근거만 동기화. 실제 push 및 원격 SHA는 해당 단위 외부 remote-preservation-receipt.json으로 사후 확인하며 이 문서의 과거 HEAD를 현재 HEAD로 치환하지 않음 |
| 전체 docs 검색·분류 | 신규코드후 rg docs 전체40경로358행. 현재 source 계약 관련 정본21개 동기화; 나머지19개는 owner 로그의 과거 결과, 변경하지 않은 게임/안개/영상/다른 rig-lab 오류 처리·키바인딩·맵geometry·오디오 계약을 원형 유지. 전체 경로별 disposition/백업/prefix/EOF/GFM은 root-current-docs-sync-receipt.json. 보호2_3/타인 WIP 변경0 |
| MAP project preview | CH1-RIFT-EDITOR-PROJECT-PREVIEW-ISOLATION-20261007-MAP-MEMORY 공식end32bf873e-4619-4c7d-b1fb-145c1d260569@2026-10-06T22:23:15.264Z, raw6838/9b40293abd8b46d29bec6646003a451dd91a7114e33603fb7072a1039ccec9bd; 외부 보존11565/29ad9712a5cd9745fefe9dc1504208c6c48973adb21e4d4dbea36e6d30b7de42. 현재 editor 표시 flags의 project 유출은 확인되지 않음; 임의필드 clone passthrough 가정과 실제 저장 배선은 별개. guide의 이전 선행 순서 FAIL은 소급 PASS0 |
| ANIM material 원자료 | CH1-RIFT-CHARACTER-MATERIAL-VFX-READABILITY-20261007-ANIMVFX-MEMORY 공식endc03dbdfe-a638-4b6c-b9a9-2f2c9d7fb15d@2026-10-06T22:21:43.874Z, raw7179/ab117eba5e7198db0ec8f7b1c29c48af93b729a9fa500bbee1211c8ff4b29c45; 보존18360/c2d5050df822989fa3b3ff01096077ff416ca3699e574c75492b2f33cd64a9da. 최초 산술stdin은 assert1PASS 뒤 잘못된 예상34.675/실제34.275로 FAIL·후속미도달/exit1, 수정 재실행0. 실제 픽셀/실루엣 인수0 |
| root 재질 실제 context 읽기 | read-only-result10580/42c5e21a02de576b8414e9a192a02f6c6d4ca191ceaf1557230f05a4f5676153, 실행·GUI0. Three r160의 opaque→transmissive→transparent 및 리스트 내부 renderOrder 계약은 맞음. 그러나 실제 world consumer는 rig.material.transparent=true/depthTest=false/depthWrite=false로 덮고 effect도transparent=true이므로 base rig factory의 opaque 계약만으로 world를 판정하면 안 됨. 실제 world에서는 동일groupOrder의 effect19/39와actor25.6–34.6 비교가 투명 리스트 내부 source 계약에 해당. 실제 GPU 가림/선명도/새 alphaTest·filter·depth 정책 채택0 |
| MAP restore token 새 원자료 | CH1-RIFT-PREVIEW-RESTORE-ACTUAL-TOKEN-UNWIND-20261007-MAP-MEMORY 공식end97d3c06d-f4a8-404c-bfd6-e0c5e30ce5e7@2026-10-06T22:38:43.522Z, raw5403/8bc123de504a09b58491178968dc1899e1b8b9647e4c4edd8af3160249bcb22d; 보존6429/5da44fcac1d66140268ffed47eda55167f5786fa9b68f6efed9ad989a53b0b54. 실제 entry 함수+fake 기록 port를 구동해 old handle restore/dispose·new handle 미호출, restore throw 후 dispose/Promise rejection observer/once를 관측했다는 메모리결과. 이것은 실제 iframe pose의 cross-token 격리 인수가 아님. release가 호출하는 handle 자체와 port가 구현하는 실제 token 격리를 구분. 실제 editor import cancel 배선/iframe pose/async side effect UNKNOWN, 새 cleanup e.message 제안·async 정책 미채택 |
| ANIM pass-depth 새 원자료 | CH1-RIFT-VFX-RENDER-PASS-DEPTH-CONTRACT-20261007-ANIMVFX-MEMORY 공식end33d949d7-96fa-4f91-bf7e-212e25089842@2026-10-06T22:38:02.931Z, raw6485/f58fed970783bc7d4a22a4341714be88852662f5dea5663bb8060dfa613fe8f7; 보존7499/451ae2be85d8da8de1a81d14bc77e2a297bd39f09658d3d0467bca5ccd56d7eb. 새로운 Three source Read/실행0. base opaque만 적용해 actualworld도opaque라고 한 결론은 root 관측된 world override와 충돌하므로 채택0. LinearFilter와 opaque alphaTest만으로 반투명 blend fringe를 단정하지 않음; actualworld의 transparent override는 별도. depthTest:true 옵션은 consumer의 depthWrite=false·렌더순서까지 포함한 새 실제 검수 없이 채택0 |
| 기존 owner 후속 | Claude8 최신 turn134: ANIM 모션 위상/UV 신규TASK1·peer1·실제source1/end0, MAP 후속은 전문 완료문의 인간승인 질문으로 보류. root는 기존 사용자 직접 팀운영 승인에 비춰 이 보류만 복구 피드백1회; 실제 외부manifest 도구거절/삭제·피해UNKNOWN/cleanup0 경계는 그대로. 전문 중복·새팀·새실행세션0. 실제 계속 여부는 새 owner 송신/peer/source/end 근거로만 확인 |
| 다음 독립 root 접점 | 본편 root P/character와 child 최초 actor 선택의 연결을 별도 exact-source 읽기 중. 기존 epoch/save/Continue 검사는 재실행0. P/HP/inventory 전체전달·본편 native 인수를 이 계획으로 선언0. NPC 유품 실제 contentID/수량·부탁 questID/구조대상은 기존 미확정 유지 |
| 운영/인수 경계 | 연속 제작 유지/다른paused자동화·아침메일재개0. 사용률 목표 약15 account weekly percentage points/day, 공유 관측·일별token 미제공이므로 이 채팅의 정확 하루소비 보장0/토큰태우기0. 본편native6·청취·실save·A급완성0. 원화1254→8000확대 흐림/legacy1024mask는 미해결·VISUAL RETOUCH. WOLF 거절 뒤 같은 산출물 corrected-path write 이력·피해UNKNOWN 유지, 해당 후보 추가읽기·실행·검수·채택·Git0 |

### 2026-10-07 ROOT-RIFT-MAIN-CHARACTER-SEED-20261007 · 부모 선택과 최초 2.5D 표시 연결

이 절은 초기 캐릭터 표시 연결의 최신 source 계약이다. 이전 핀의 child 캐릭터 전달0/host17683·world45509는 당시 이력으로 보존한다. 본편 root 진단의 미인수 상수와 public host의 초기 표시 ACK는 서로 다른 범위다.

| 항목 | 현재 구현·정확한 범위 |
|---|---|
| host source | tools/2_5d/main-rift-host.mjs 18931 B / a242f619d0a6f1bf3e8809a8f059e0979606b4356addd6f9b1e12c73cbc4f967 |
| child source | tools/2_5d-world-lab.mjs 46833 B / fbab9b30265a0b211220e0e03775249bee8385fdae26c5c30bfe691409bcb5cb |
| 실제 누락 접점 | 기존 game의 _charIdx0/1→warrior/silvertail 및 runtime readHostContext→host는 존재. 이전 host 고정 iframe URL·child 초기 select(warrior) 때문에 silvertail도 전사로 표시. 실제 현재 사용자의 live class 관측을 이 source 반례로 대신하지 않음 |
| 호스트 허용값 | contextSnapshot.character는 정확 primitive 문자열 warrior 또는 silvertail. MAIN_RIFT_HOST.characterSeedKey='main-character', characterLinkScope='initial-display-only', fullPlayerLinked=false. unknown/empty/main dark-druid는 admission 실패 |
| per-entry URL | 캡처한 context.character만 새 URL.searchParams.set('main-character',character)로 넣고 expectedCharacter/entryURL/characterAck=false를 해당 record에 보관. onLoad와poll이 동일origin·lab pathname·정확 record.entryURL href를 검사. parent P/UUID/HP/inventory/flags/좌표/facing의 query·payload 직렬화0 |
| child 초기 준비 | readInitialCharacterSeed(window.location.search)→main-character 없음이면 standalone/editor 기본warrior. present는 getAll 결과 정확1개+허용두ID만 통과, empty/duplicate/unsupported는 고정 내부오류로중단. renderer 생성 전에검사. prepareInitialCharacterDisplay가 state.selected·dropdown.value·rig visible·helper hidden·CHARACTER_RIG_CATALOG 한글명을 first ready/reset/render 전에동기화 |
| 초기 ACK | initialCharacter는 private 초기ID, initialCharacterReady는 reset/select 이후 ready·error없음·disposed아님·선택일치에따른boolean. __rift25Lab.snapshot의 own-data primitive initialCharacter/initialCharacterReady/selected를 host가 loading때읽고 ready=true일때 expectedCharacter와정확일치해야characterAck=true/active/handle을resolve. child snapshot accessor/proxy/throw는 고정 'UNKNOWN · 지옥의 틈 초기 표시 ACK 읽기 실패'로 치환·외부message/String 읽기0 |
| 재진입·변경 경계 | ACK read 이후 current record·sameContext 재확인; stale/cancelled entry가 새 entry를active로 만들지 않음. active 이후 새manual비교를강제원복0; standalone dark-druid 수동비교는기존경로. 초기ACK는계속 player 상태를동기화한다는뜻이아님 |
| 진단 범위 구분 | host.snapshot().childCharacterLinked는 current.characterAck===true만. MAIN_RIFT_HOST.fullPlayerLinked=false 유지. window.__riftMainIntegration.snapshot()의 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false 등 game 자체미인수진단은실제game코드불변이므로그대로이며 host 초기표시true로대체0 |
| 그대로인 소비자 | game.html4050426/ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230와 main-rift-runtime.mjs7519/b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69 byte불변. Continue/epoch/save/lease/guardedAdvance·기존5000ms/900ms·host30000ms/100ms 정책변경·재검사0. spawn5480/3740·geometry/nav/PNG/카메라·렌더기본값·발접지변경0 |
| source 최초 Gate | actual importedhost+actual child unchangedfunction/startup/API span을 VM에서호출, actualThree/catalog+통제DOM/RAF/rig/renderer/iframe/P/G ports. 최초8그룹 중4완료·29조건도달(28PASS/1FAIL)·4그룹잔여미도달/exit1. fixture의 INTERACTION_CUE_PROVENANCE/SLICE_ACCEPTANCE_PROVENANCE/SCENE_REGISTRATION_PROVENANCE 3누락→actualsnapshot참조예외→host실패/정상timer1기대FAIL. 제품결함확인0·원FAIL동결 |
| source 한정후속 | root승인으로외부fixture의실제누락imports3만공급. 이미PASS한조건재단언0/제품2코드핀변경0. 미도달 ACK·hostactive·P identity 두class각3조건+standalone/manual3+정상timer1만 새4그룹10조건PASS/FAIL0·미도달0·준비오류0/exit0. 원FAIL과합산/전체clean suite PASS선언0·old검사0 |
| source 정확근거 | worker final21003/686b31461510bf0c6cbc0f191ded0d9c32fe6118f433acd1f5376ce3449b79f8; 최초raw7624/6acc16e83e9a876f334de74077a909d873ddf105b5e183edc5ee8a6125783379; 판정1083/6107533374c9675ec4aae266fe7842a8686c7bd23813dccbde968fef7f95daa8; 한정raw3512/a62bee6ed7148a8908b8dbf7c2680362c37c8e6f4ebeda0f76b990e20bcdf9d9. source2 역변환 exact·소유doc원prefix159478·EOF1/GFM3표 |
| 새 actual Chrome | 신규 actualChrome1/context1/parent1에서 host child2를전사→실버테일순차실행(max동시1). 새2그룹12조건PASS/FAIL0/미도달0/exit0, 추가실행0. 첫원본render ordinal1과ACK전전사6draw·실버테일7draw 모두해당rig/이름/dropdown일치. host own-data ACK3/childCharacterLinked=true(initial-display-only), runtime top-level false는그대로. 각GL13program LINKtrue/getError0/contextLostfalse/canvas1036×714; source-owned timer1→close0/finaldispose0, 전체native timerqueueUNKNOWN. source17exact/P·G detachedfixture·storage{}불변/오류·404·외부·변경요청0. root·helper PNG2직접확인: 초기표시UI PASS/전체맵RETOUCH. final9034/3fa1faad6b5dda2c3ec8609f6e2d3397bbda76d908676717fe9d67bf8525546c; summary22474/41fd6c7a8d284404bff1f51fa24611d3fbd96871b1a1108df2ca9fc901ee739a; raw388349/58988832f471a8c4f5567054fc3d0b4f1428312cf59ff0892517d5daf8b743ac; 전사PNG859610/41cd4c7bdca71d80b5681de872d71933404b992745a1986c26b228fc485e16cb·실버테일PNG861337/d87d4917a92cbfc7a977798d1beeb902d6c59a386179e81c27a5201682acd995. actualgame.html/native6/fullplayer/save/audio/physicalscanout인수0·oldGUI/CPU합산0 |
| 추가 새 실제 rig 소비자 검수 | 실제character-rigs factory3(전사2독립/실버테일1)→update72호출→private setFrame/nativeThree UV matrix/geometry attributes·weightChecks 소비를신규Node1에서검수: 새7그룹93조건PASS/FAIL0/미도달0/exit0. attack frame8/phase1뒤idle·독립소유자·dispose각1, nativeTexture35의disposeevent35 확인. PNG26/metadata2exact. Image는PNG IHDR크기기반MOCK이며실RGBAdecode·GPUupload·world실행·actualGUI·본편native6·청취·save인수0. 새visual NOT ASSESSED/전체RETOUCH. 준비단계Path.write_text newline API오류1은제품도달0/Node0, root승인외부파일쓰기API만보정뒤최초제품Node1; 제품실패재시도0. final5888/39d2e931065fc9df34ab3f6f36e4687cb3ca4f85699952b8cc2ea43a5532ed04, unit16128/1258909d0e4a6686c9433e37040ae743199f7292c6bf6abedc6706a3e5454da7, raw771/2cd6bfc0430edd2a3b59ed1a6b18eabc0559e9077e0eaacae48f7f05a3be8aec. source수정권고0 |
| docs·정상보존 | 신규code후 전체rg28경로370행/raw433377/f1d85f951cb7068549f12a946c996b6db9ebfee86f65257a16eb564aecd278bc. root 관련정본24개를현재계약/범위로동기화·모든path disposition. ownerLOG와다른출시후보/맵geometry 이력4경로는원값유지. fullbyte백업→fullprefix/EOF1/GFM→정확소유code2+docs24 정상commit/push·remoteexact은 외부 main-character-seed-consumer/remote-preservation-receipt.json에서확인. foreign68·ownerSTATELOG4·heldWOLF1 소유외/stage0 |

§23 MAP PRODUCTION REPORT: MASTER=기존본편두class의지옥의틈초기표시연결. fullguide607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b/SSOT_INDEX·stageLOCK의기존정확full읽기근거적용. LARGE OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은기존PNG/scene/nav/geometry/카메라/랜드마크/기존23보존·새배치0. CAMERA QA=새actualhost/child초기render표시범위만. TECH QA=최초sourceFAIL29도달/한정4x10과actualChrome별도영수증. VISUAL VERDICT: RETOUCH(전체맵), 새class 표시검수는전체맵선명도·해부학모션·본편native6·청취·실보상save·A급완성의인수가아님. 원화1254→8000확대/기본legacy1024mask흐림미해결.

| 새 전문 원자료·독립 후속 | 원총괄 보존·채택 경계 |
|---|---|
| ANIM motion UV 공식 raw | endda8430aa-df06-47d5-b729-ad0394de1d2e@2026-10-06T22:44:15.704Z, raw6359/a887281013d8afc85125ae4730bc5d4bb7d02fb5a826b3355b2e327b9a992972; 외부7081/4694e403a03d0e17b772e997bf10a6b08b4988cf6bf3a7b955eff4345580d2d5. 전문보고stdin8PASS는actualcharacterRigFrame+복사공식만·actualupdate/setFrame/GPU未호출. root readonly12195/8f2d1d396abab42518a3847e612025df6185b5e60a2237bcab724eb8f8b6a838에서신규source결함확정0, 실버테일walk가변crop/anchor→geometry실소비를새검수범위로분리 |
| MAP host/modal 원자료 | end70832dd3-592c-47c1-98d8-0f199c955fa5, raw4935/9f220fec67181b840ade1c00f92a470f39ebb013ba4bc13f6ef1624949f13898; 보존5665/c4a05aa52540a0201ee6a1e8751f9819aa5d0eadaf7242b9905275436ba525a6. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| ANIM dialogue owner 원자료 | end53b09739-bd8c-479f-b0a4-6838041a4aec, raw6240/9b9ad0f617ddca16b5f459d4158d23de3a89b2553cca5dd83f19e845f67cfaa9; 보존6895/7f55fb6f0a265ec35d7a7b550ca629fc3a8f048d5bcaf82e433df6bfe05e1cf7. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| 새 owner 업무 | Claude8 기존owner가 MAP CH1-RIFT-SCENE-OBJECT-ASSET-INTEGRITY-20261007-MAP-MEMORY와 QA CH1-LOBBY-CHARACTER-VISIBLE-BOUNDS-20261007-QA-MEMORY를각sent1/peer1/firstsource1/end0·busy로기록. ANIM CH1-RIFT-VFX-ARBITRATED-ATTACK-EMISSION-20261007-ANIMVFX-MEMORY도sent1/peer1/Read1/firstsource1/end0·busy. 수신/첫source를완료로계산0·전원가동과장0. MAP추가권한질문은이미승인된기존팀독립작업에대한전문자가질문이며실제autoapproval거절로오인0, 기존승인범위업무계속. 새raw의의미검토·후속은기존owner에게만1회인계 |
| 계속운영/보호 | 기존Claude8/Codex7만전문송신소유·root직접/중복송신0·새팀/세션0. 거절된Codex송신/ART선택/WOLF쓰기목적재시도·도구/경로/호스트/권한우회0, MAP/STORY외부쓰기·삭제피해UNKNOWN유지. WOLF거절뒤같은산출물correctedpathwrite 이력보존·추가접근/검수/실행/채택/Git0. 타인WIP/사용자save/보호2_3·Q전용magicblackBean(E불가)·어택티켓금지보존. 실제NUL80부터완료소유checkpoint/100전새산출중단. 계정주간사용률약15pp/day 목표는공유관측이며이채팅정확일별token보장·토큰태우기0. 기존단일root연속heartbeat/다른paused자동화·아침메일재개0 |

> **소스·검수 시점 이력:** 아래 lab10557·lab10712의 핀과 2px/1.3018px 관측은 당시 결과로 보존한다. 현행 lab16215의 CSS 최소12 표시 계약은 ROOT-EDITOR-PROBE-CSS-SIZE-20261007 절을 따른다. base sphere radius.04/segments12·8 및 보행240worldpx/s·충돌r12worldpx·dt상한.05s·벽 접촉 규칙은 이번 변경으로 바뀌지 않는다.

### 2026-10-07 편집 snapshot·가져온 이미지·보행점 현재 정본 동기화

| 항목 | 현재값·인수 경계 |
|---|---|
| 최초 source 보존 이력 | 당시 factory18576/lab10540의 정상 commit/push remote exact 000e6d3c04e7a8e004c6ed3c36f166e81f9846bf, code5/docs4. NUL81→73/index0/foreign68 exact. 최초 commit hook의 CHANGELOG_SYNC 누락 exit1은 진행log 보충 후 정상통과; bypass0 |
| 실제 연결 | 별도 “편집 씬 · 2.5D” 버튼 → current EXODUSER_SCENE_EDITOR detached snapshot → 실제 core.validate/UTF8<=32000000 → fresh owned iframe → actual child.loadScene(...,{entryId:'editor-scene-N'}) → same current/URL/window/API 및 ready/loading/disposed/entryId/error ACK. timeout30000ms/poll100ms. 기존 canonical 주민 선택 미리보기와 분리 |
| source 정확핀 | editor.html258409/b9e3a61dd9c6a11eff220b7f39a6dc9db76e375be2615422b586d12d5186b41e; host14648/39490d20c548a6eb8536439cb962c833ff3ef6e8cdc488ba9a196532121c1a3d; terrain18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf; lab HTML2997/6b988ed8e352276ca8a67b9e4a06a7e0f6a713feb2d061c227dbccd0d31e7653; lab MJS10557/1c5cdf0c8d37e4ecfc8d8a5dfec0e1e436c3d7fce62ccf4a0ed96590c5ccf07d |
| 실제 소비 계약 | 현재 assets crop/원본크기·layer순서/visible/foot정렬/parallax·object transform/pivot/rotation/flipX/opacity·polygon mask/feather/sourceParallax·walkable/start를 소비. 원 PNG/scene/nav 수정0. Three r160 angle50°/scale400 X/Z image-plane, mask alpha longedge256/geometryHeight0/physicalHeightUNKNOWN. layerOrderStride2001. 상세공식·상수·resource ownership은 HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/HELL_RIFT_2_5D_SLICE 최신절 |
| 화면·입력 | 별도 금빛 보행 probe(캐릭터아님), WASD/방향키 world240px/s/radius12/dt<=.05·대각선정규화, orthographic 기본/perspective45°/near.01/far10000/zoom.5..3/.1/DPRfinitepositive기본1/cap2. readonly sceneSnapshot clone·pagehide/abort/close/stale cleanup. host/child가 editor history/selection/save에쓰기0 |
| source 검수 | 이전 factory18576/nativeThree 통제Image8그룹40PASS(final14929/027545958decf3ccfc16a28cb19503097eee9829ddea6ef88e482126752bb9f5). 초기host숫자draft12/51PASS는문자열child미검수이력, finalstring strict2/11PASS별도(final9468/323361fe7a824422ba6a2fc37404b12cf4c0bdc6ecc5dd499e82261322c04fe5). oldsuite재실행·합산0 |
| 다른 실제 입력 검사 | 기존world source불변. nativeJ attack/ring/render 관측은최초capturemicrotask조건FAIL1/12미도달과분리. 외부windowbubble후heldrepeat/fresh/idle4PASS·대화동기render DOM조건FAIL1/3미도달/exit1, 이후render/PNG하란패널보였으나neutral240ms/J닫기후공격未인수. E/live-input-fx-consumer-browser/final-receipt.json13800/2ed847c0ce3fa2de3d4ca0abee6bb9880b738ebeb327cdb0608099e196feaa86;전체clean13PASS0/추가FX실행0 |
| 미연결·제한 | Unity PNG+.meta/FileReader dataURI import 출력의 이미지 소비 연결만 추가. Unity 프로젝트/Prefab/FBX/임의 shader 호환 인수0. 본편캐릭터P/UUID/HP/inv/flags/유품·부탁durable save·실native6·청취·A급미인수. 원화1254→8000확대/legacy1024mask흐림 미해결·전체맵RETOUCH |
| 보호·운영 | 사용자save·원PNG/scene/nav·기존23·보호2_3·Q전용magicblackBean(E불가)·어택티켓금지/foreign68/ownerSTATELOG WIP/heldWOLF1 보존. root전문직접중복송신/새팀/세션0, 기존owner후속만. 실제NUL80완료소유checkpoint/100전새산출중단, 기존단일heartbeat/다른paused자동화·아침메일유지 |

| 이번 최소 코드 보정 | 정확 계약·검증 경계 |
|---|---|
| ROOT-EDITOR-PROBE-VISIBILITY-20261007 | lab:103 markerMaterial에 transparent:true 한 flag만 추가. 기존SphereGeometry radius.04/widthSegments12/heightSegments8/color0xf1c67b/depthTestfalse/depthWritefalse/renderOrder100000 불변. 기존 opaque pass 뒤 transparent 지형이 표식을 덮는 실제PNG 실패를 수정. OLD10540/6e298397…→NEW10557/1c5cdf0c… inverse exact |
| ROOT-EDITOR-IMPORTED-IMAGE-CONSUMER-20261007 | factory:223 source guard1곳만 추가. 기존 assets/·img/ PNG/JPEG/WebP 경로와 core동일 case-sensitive data:image/(png\|jpeg\|webp);base64,[A-Za-z0-9+/=]+ 허용. core src최대14000000문자/hostUTF8최대32000000B 유지. alias jpg·SVG/GIF/잘못된alphabet/빈URI/HTTP/blob/protocolrelative 거부. native decoder의 format sniffing과 MIME/content 일치 정책은 구분 |
| 수명·크기 | default native Image.decode/naturalWidth·naturalHeight exact·source별Texture 공유·명시release 소유/abort/stale/latecleanup 계약 불변. nativeImage.decode가 허용 alphabet의 손상padding·비이미지 데이터도 거부하는지는 별도 실제GUI 근거. borrowed loader에 release없으면 외부image에 임의cleanup0 |
| 신규 source 검사 | actual factory+Three resource/통제 Image.decode 포트 1회6그룹32조건PASS/FAIL0/미도달0/exit0. source18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf. final-source-receipt.json27161B/bbce82d435dd3e98d2b485660ff912635832fcbfbc042d51bb9eb3de81e2d29a. old40 재실행0, 이 source 검사를 native decode/GPU로 승격0 |

| 실제 편집 scene 검수·새 화면 보정 | 관측 결과와 미도달 경계 |
|---|---|
| 이전 edited scene source epoch | factory18576/2d304d02d268cdc83dfd1f0b702134b7c91a53a12f8b936b30c39e6373dfcb41·lab10540/6e298397b1c8e5fdc2d28ac010e2e9081329f901b557adbcff821aa3487ffc70. 처음 numeric grid=false fixture는 import 선행FAIL1/0PASS/13미도달, 외부 grid0 보정 후 새GUI6PASS/하네스 geometry summary 누락FAIL1/7미도달. 오류 원자료 2건을 보존하며 clean14PASS로 계산하지 않음 |
| 저장된 실제 geometry 한정 판독 | 새Chrome0. 실제 원래 렌더 관측의 geometry/UV1조건과 hidden/order1조건만2PASS. 27vertices/81positionchannels/54UV 각 두관측 maxerror0; hidden west2 제외·visible12 및 실제 renderOrder 일치. archival-geometry-result.json7494/521325442e658d69aae703e60a0589cb6b80a44d302c1fda89daa319e339d8a6 |
| 이전 epoch 남은 새 native 보행·종료 | 새Chrome1/editor1/child1, G4/G5만6PASS/FAIL0/미도달0/exit0. start4020,7740→S4020,7756.008→W4020,7732.032; blocked0→1·current canWalk true/장애중심 false. actual pagehide trusted·RAF false·dispose attempt1/renderer.dispose return1·geometry13/material13/maptexture3 총29이벤트 각1·hosttimer0·storage{} 및 부모memory보존. private feather·physicalGPU해제 UNKNOWN |
| 이전 epoch 최종 보존 | 전체 물리Chrome3/context3/editor3/child2이며 live6+archival2+remaining6을 별도 기록. completion-receipt.json11894/5ce0c4a0f5cb69a99d780b0b2ebcaf85af506beeb2bb7380d3a86dfca2aca8cc. 당시 gold probe PNG 안보임/markerPixelAcceptedfalse/전체RETOUCH, 현재 source와 혼동0 |
| 새 source epoch 실제 보행점 픽셀 | ROOT-EDITOR-PROBE-VISIBILITY-20261007. Chrome1/context1/editor1/child1 종료·source8+protected9 exact. 자동P1/P2 2PASS/FAIL0/미도달0/exit0 및 PNG직접판독P3 1PASS 별도. canvas1084×716/projectedcentre543.6273,662.3/radius1.3018px, gold2pixels(543,662),(543,661) RGBA[241,198,123,255]/채널오차0. nativeGL LINK5/error0/contextnotlost. OLD_RGBA UNKNOWN·동일장면 AB숫자비교0 |
| 새 probe 근거와 가독성 | final-receipt.json8254/ede3a1645df3f42965d3e5fc61a477af61e1966679a31f0617552006d3abfcbb; actual-probe-visible.png659535/e59e9a503ccfb03531b4d0eaeb70ada802c16edc30d294944bd4c95bb167a96f. root PNG직접확인. 금빛점 표시만인수·여전히작음/맵흐림 RETOUCH. 선택적PNG좌표분석1회는PIL부재exit1/미도달로별도보존·설치/우회/재실행0 |
| 가져온 이미지 새 native 소비자 | ROOT-EDITOR-IMPORTED-IMAGE-CONSUMER-20261007-NATIVE-DECODE-GUI. 원editor importProject(false)→원host→원factory/lab. Chrome1/context1/parent1/child1/maxlive1, intrinsic HTMLImageElement.decode 위임·원Promise반환/mock0. PNG122×69/JPEG1280×720/WebP1200×256 native decode3조건 및 actualGL1조건으로4PASS(2그룹). visibleObjects3/frames5/LINK3true/draw35/GLerror0/contextnotlost. root 성공PNG 직접판독. Unity 파일chooser/PNGmeta 전체workflow·본편인수0 |
| native 첫 실패·미도달 | N3-padding(data:image/png;base64,A===)는 실제 editor import 선행예외로 첫FAIL1·child 생성0/해당factory native decode未도달. N4비이미지/N5크기불일치2미도달, exit1/재시도0. native decode negative3 모두未인수이며 통제Image CPU32와 구분. 원자료에 console net::ERR_INVALID_URL1·pageerror0/외부요청0/쓰기0/다운로드0 보존. 제품factory 결함확정0/clean7PASS0 |

| native 최종 영수증·첫 실패 판정 | final-native-receipt.json9203/7e1cf4fa9b5d7cb044fdcb1d4fce21b72fa3b3db25d7a7da07d50f186edaa6be; native-first-failure-adjudication.json4929/d1e2764db4cc11d8e27928f827b782a92ed7d03288babf81772c1255f466e35d. editor.js623 importProject→31 picture()의 onerror 선행구간을 source로 확인. raw의 정확throw stack은 formatter가 객체presence/phase만 남겨 UNKNOWN이며 재구성0. native 손상padding/nonimage/metadata mismatch factory3조건은 모두 NOT_REACHED |

| 전문팀 공식 완료 원자료 | root 의미검토·채택 경계 |
|---|---|
| 실제 착수 | MAP·SKILL·QA·BOSS·ENEMY·ANIMVFX의 현재 TASK별 successful source와 공식 end 6건. 송신/peer/ACK만으로 착수·완료 계산하지 않음. 기존 owner가 후속을 담당하며 root 직접 전문팀 송신0 |
| 원문 보존 | ROOT-SIX-EDITOR-CONSUMER-RAW-PRESERVATION-20261007, 외부 six-editor-consumer-raw-preservation/manifest.json 3777B/db80a57ad7485d87982b70cd90f44d2d5cd0caec8ed7f9e56fc1da4515cb7064. 여섯 raw의 공식 end ID/시각/원문 bytes/fullSHA, 후보 미채택 |
| MAP | 실제 groundDetail 모듈+통제 loader에서 reject/wrong-size가 prepare:false로 흡수됨. 기존 partial-commit 결함 제안 철회. GUI/이미지 decode 인수0 |
| SKILL | source 의미검토: 현재 host hidden/close/dispose 경로 keys/RAF 해제. standalone listener 정리는 선택적 제안, 새 코드 채택0 |
| QA | admission/ACK/stale 차단 source 확인. ACK 뒤 child 렌더 실패가 외부 host active 상태에 반영되지 않는 경계는 source 관찰·실 GPU 미재현 UNKNOWN; 후속 별도 |
| BOSS | crop 검증과 UV 범위 source 확인. 고정 far10000의 극단 scene 경계는 일반 8000px scene과 구분; 현 맵 실제 결함으로 승격0 |
| ENEMY | 첫 stdin export-shape 오류 exit1 보존, 런타임 PASS0. tileSize16/radius12의 5점 collision gap은 손계산 후보, 현재 tileSize40 맵 영향0/미채택. 맵 guide 전체 선행 미수행 사실 유지 |
| ANIMVFX | source+전사 산술 모델 exit0; GPU/픽셀 관측0. atlas crop half-texel bleed·sourceParallax 극단 경계는 필요성 UNKNOWN/미채택. 이전 외부 Write2+Edit1 범위 위반과 피해 UNKNOWN 유지, 해당 3대상 추가 접근·실행·삭제0 |
| owner 보존 | CLAUDE8-SIX-CONSUMER-20261007-2338 완료소유 STATE/LOG2 정상 commit/push remote exact d4c6800385c08ffc88612d800f040e0ad20cac80. NUL73→71/index0/foreign68 exact, 그 뒤 owner 새 기록은 별도 WIP |

| docs 전체 검색·보존 | 정확 범위 |
|---|---|
| 관련 검색 | 최초77경로2044물리행(2038 path-line+장문생략표시6), probe후27경로353행, source guard후34경로415행. 최초 검색의 끝부분 일부 장문 출력은 생략되었고 77문서를 전수 읽었다고 선언하지 않음. 현재18정본+기존팀registry경계절1=19에 동기화, historical/owner WIP/다른모드/보호2_3 보존 |
| disposition 정확핀 | 최초 disposition.json91474/c5301efbe0c5d844755b3306e69b1dc4bedb199f79995f3cea4123237a207b23; finaldelta47882/6091b18084cf714ea65546c76bd620db148b63b04ee2148abbb2097acb8754c3. sourceguard wholeJSONL1618915/28084ad421d86aef4cc0a357c85d982847e05731857e2db2adfbc5be954413c0 |
| append 소유 | code2+currentdocs19만 정상commit/push하며 실제 완료와 remote exactSHA는 외부 editor-scene-combined-preservation/remote-preservation-receipt.json에서 확인한다. priorcode000e 및 ownerd4c680은 이력이며 이번 code2의 commitSHA로 오인하지 않음. docs19 fullbyte백업/fullprefix/EOF1·sourceexact·foreign68exact/index확인 선행 |
| 후속 | 다음 root 승인단위는 작은 probe가독성·흐림/접합/재질 보정, 가져오기 전체workflow/negative 미도달 원인 분리, 최소본편player/NPCdurable consumer·native6이다. 기존owner는 이미 여섯 전문팀에후속배정했고 ANIM·SKILL 성공source확인/나머지4당시도구시작대기. 이 관측을전원가동·완료로승격0. root검수중독립팀보류0·같은TASK재송신0 |

§23 MAP PRODUCTION REPORT — ROOT-EDITOR-EDITED-SCENE-CONSUMER-20261007 / PROBE-VISIBILITY / IMPORTED-IMAGE-CONSUMER
- MASTER PLAN: guide 전수읽기18392B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b와 _MAP_SSOT_INDEX·stageLOCK의 기존 근거를 적용했다. 이번 단위는 현재 편집 snapshot의 별도 2.5D 소비와 화면·입력 검수다.
- LARGE OUTER MASS → MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE/COMBAT → LANDMARK/CENTER → SMALL DETAIL: 기존 원PNG/scene/nav/배치/기존23를 보존했다. 앞 단계 신규제작 완료0·physical geometryHeight0/실제 높이충돌 UNKNOWN.
- PLAYABLE/COMBAT: authored walkable/start·radius12/240px/s probe의 실제 이동/장애차단을 이전 epoch 새조건6 중에서 확인했다. 현재 probe는 캐릭터가 아니며 전투/NPC대화/유품·부탁/보상/save는 이 editor viewer에 미연결이다.
- LAYERS/CAMERA: transform/pivot/rotation/flipX/crop/UV/hidden/order 및 mask/feather/sourceParallax 계약. orthographic기본/perspective45°/near.01/far10000/zoom.5..3/.1/DPRcap2. 원 PNG의 실제 깊이/해부학모션 인수0.
- TECH QA: old factory CPU8그룹40/host draft12그룹51조건와 finalstring2그룹11조건은 이력. 새guard actualfactory+Three/통제Image6그룹32PASS; 새probe 실제GL자동2PASS·PNG판독1PASS; 새native3format decode+GL4PASS/첫import예외FAIL1/미도달2를 분리했다. 전체합산 cleanPASS0·기존suite반복0.
- VISUAL VERDICT: RETOUCH. 금빛 probe 표시와 PNG/JPEG/WebP 이미지 소비는 실제 화면에서 확인했으나 probe가 작고 원화1254→8000 확대/legacy1024mask 흐림·절벽전경접합·재질이 남아 있다. 독립preview/fixture/raw보존은 본편native6·청취·실보상save·A급완성의 인수가 아니다.

> **소스·검수 시점 이력:** 아래 lab10557·lab10712의 핀과 2px/1.3018px 관측은 당시 결과로 보존한다. 현행 lab16215의 CSS 최소12 표시 계약은 ROOT-EDITOR-PROBE-CSS-SIZE-20261007 절을 따른다. base sphere radius.04/segments12·8 및 보행240worldpx/s·충돌r12worldpx·dt상한.05s·벽 접촉 규칙은 이번 변경으로 바뀌지 않는다.

### ROOT-EDITOR-DIAGONAL-WALL-SLIDE-20261007 — 편집 씬 벽 접촉 보행 현재 계약

이 절은 current lab10712 소스 epoch의 구현·신규 검수 정본이다. 직전 lab10557과 그 시점의 성공·실패·미도달 기록은 당시 이력으로 보존한다.

| 항목 | 현재 구현·인수 범위 |
|---|---|
| 소유 코드 | tools/editor-scene-preview-lab.mjs 10712B / SHA256 698e48c83bb96d89117ba8f9d5d3f0ace321c6fd8493e3f309bfc9d80674a6f3. move 한 구역만 보정. |
| 입력·요청 이동 | WASD/화살표 dx,dy hypot 정규화, 240world px/s, 호출자 tick dt0…0.05초, 최대 요청 이동12world px. |
| 기존 성공 경로 | combined endpoint canWalk(x,y,12)가 통과하면 기존 x,y 동시 이동을 유지한다. |
| 새 실패 경로 | combined 실패 후 blocked를1 증가. dx&&dy&&step>0에서만 X를 검사·적용하고 그 결과 player.x에서 Y를 검사·적용한다. 각 검사 radius12. 막힌 축은 유지. |
| 카운터·속도 | blocked는 combined 실패당1이다. 양축 실패당2가 아니다. 살아남은 축 재정규화0; 대각 한 축 속도240/√2. dt0에서는 fallback을 생략하며 이미 invalid한 발 위치의 combined 실패 카운터는 기존처럼1이다. |
| 검증 한계 | endpoint 검사다. swept collision/실제 신체·높이/모든 tile 크기의 관통0 인수는 아니다. 금빛 점은 보행 표식이며 실캐릭터가 아니다. |
| 원자료와 채택 | ENEMY 공식end3c1224f6-5a08-4a53-ae7e-dc5d6d1a3fa8@2026-10-07T00:04:16.896Z의 raw7099B/827504f177358db7c8fe1964b4f74d481e94896a3b39b799a59183ec8385ab16를 의미 검토했다. raw 무조건 축 이동 제안은 실행하지 않고 root가 combined-first/실패당1/positive-step으로 최소 변형했다. SKILL focus·QA retry 후보는 이번 미채택. |
| 신규 CPU | 실제 private move(dt) 추출 함수+기존 actual core.canWalk, Node1회, 8그룹/8복합조건 PASS, FAIL0/미도달0/unhandled0/exit0. r12 경계·X/Y slide·양축 차단·정규화 최대12·dt0 포함. dt상한은 호출자 계약이며 닫힌 dt0 위치는 합성 fixture. |
| 신규 실제 화면·입력 | 실제 Chrome1/context1/editor1/child1, trusted D+W. 3그룹/3조건 PASS, FAIL0/미도달0/exit0. 원래 에디터→host→child/Three 경로이며 제품 mock0·synthetic input0. |
| 실측 | 시작4020,7740→4025.651197395243,7672.13471956884; 관측8위치 actual core r12 통과. 모서리4025.651197395243,7652.330072841369에서3연속80ms 정지·frames/blocked 증가·held2. 전수 경로/연속 충돌 증명으로 확대하지 않는다. |
| QA 원본 보존 | canonical clone의 메모리 walkable3셀(열100/행191…193), start4020,7740/exit4020,7660만 importProject(false)했다. 원본 scene/nav/PNG·에디터 부모 fixture·local/session storage·save 불변. source8/protected9 전후 exact, pageerror0/4040/변경요청0/download0. |
| 의미·검색 | docs전체 신규 행동/소스핀 검색25경로·중복제거972행: current19/history2/ownerWIP3/다른mode1. 전수문서 fullread로 계산0. helper heading 추출 StopIteration은 준비 읽기 실패이며 제품 미도달로 별도 보존. |
| 시각·본편 경계 | 직접 PNG 판독: 하단 금빛 표식이 작고 원화 구도/레이어 표시 유지. VISUAL VERDICT: RETOUCH. 원화1254→8000 및 legacy1024 mask 흐림·절벽 전경 재질은 미해결. 실캐릭터/NPC durable/main/native6/청취/실보상save/A급완성 인수0. |
| 영수증 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-wall-slide-20261007/validation-receipt.json 3874B/c66885a2cb7bed74c3c91166aabc0be2e10360db15aba87988f47deb09ab7a11. CPU/native/PNG/의미 검토·검색 정확핀은 해당 영수증 참조. |
| MAP PRODUCTION REPORT §23 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-wall-slide-20261007/map-production-report.txt 2498B/6a21ee7a154adac271c92d056e3c2226c08b7c32d7500aec26604b17f61506ea. MASTER/OUTER/LARGE/MEDIUM/GROUND/LANDMARK은 기존 유지, 새 PLAYABLE은 한정 통로 검수, CAMERA는 새 PNG 한 장이며 전수8구역 인수0. |
| 후속 | NPC 대화 선택 후 포커스/Escape/canvas 복귀의 새 정적 후보를 실제 소스 확인 뒤 최소 구현한다. Codex 감독의 읽기 결과만 있으며 아직 구현·GUI 인수0. Claude 감독은 기존 배정6팀의 새 완료/후속을 계속 수집한다. |
| 보존 | source-change fullbyte 백업 선행. foreign68/ownerSTATELOG4 WIP/heldWOLF1/기존23/user save/원PNG·scene·nav/LOCK/보호2_3/Q전용magicblackBean(E불가)/어택티켓금지 유지. denied 목적 재시도·도구/경로/권한 우회0. 기존 WOLF 사후동일출력쓰기/damageUNKNOWN 이력 유지·추가 접근0. |

## 현재 소비자 갱신 — NPC 키보드 초점 (ROOT-NPC-DIALOGUE-KEYBOARD-FOCUS-20261007)

이 절은 기존 에디터의 선택 주민 → 2.5D 대화 UI에 적용된 최신 계약이다. 앞선 ‘NPC 초점 미구현’ 및 이전 소스·검사 핀은 당시 이력으로 보존한다. 편집 씬 보행 probe, 부모 game 입력 lease와 본편 대화·보상 저장은 별도 범위다.

| 항목 | 현재 코드·관측값 | 적용·인수 경계 |
|---|---|---|
| 변경 소스 | tools/2_5d-world-lab.mjs · 48,309 B · SHA256 7761cb34eabd17a9f7f296e605042eb4120d7f999d6014d62d0bb1c1bb2e11b8 | HTML·대화 controller·공격/저장 경로 변경 0 |
| 열기·노드 전환 | 성공한 talk/open 또는 choose 결과 isOpen에서 현재 첫 enabled 선택지에 focus; 선택지 없으면 dialogue-close | 기존 선택지 교체 후 현재 노드로 초점 연결 |
| 오래된 선택지 | ready/paused, button.isConnected, list.contains(button), actor, lifecycleEpoch, dialogueSignature 검사 | 제거된 버튼·다른 actor/epoch·이전 signature 차단 |
| focusDialogueInput | ready, !paused, !error, !disposed, !contextLost, !document.hidden, document.hasFocus(), actor/epoch 일치, 현재 open 상태 검사 | 열린 패널은 hidden이면 초점 이동 0 |
| 일반 닫기 | 열린 대화의 manual/escape 닫기, 선택 결과 closeReason=dialogue.close 후 world-canvas로 복귀 | window blur·reset·actor 변경·dispose 닫기에서 강제 회수 0 |
| 선택지 키 | Tab 이동 · Enter 선택 · 비반복 Escape 닫기 | panel Escape는 preventDefault/stopPropagation; native Tab/Enter 유지 |
| 게임 입력 범위 | R/J/WASD는 기존 world-canvas 전용 | 선택지 초점 중 R/J/WASD를 canvas로 재전송하지 않음; J/FX 재검수 0 |
| 화면 안내 | 대화 시험 · 선택은 게임에 저장되지 않습니다 · Tab으로 이동 · Enter로 선택 · Escape로 닫기 | 열린 dialogue-notice 리프만 갱신; controller view.notice/API 불변 |
| 신규 실제 검수 | Chrome/context/parent/child 각 1 · 새 5그룹/5조건 PASS5/FAIL0/미도달0/exit0 | R 첫 선택지, Enter about→meet, Escape+W, 종료 선택·닫기 버튼, 실제 부모 초점 이동 |
| 이동·blur 관측 | W y6660→6655.658, keyup 후 실제 lifecycle heldKeyCount0; Shift+Tab3으로 부모 return, trusted child windowblur, 이후 2 render frames 부모 초점 유지 | host 접근점4700,6660은 준비 위치 이동; 전체 경로 보행 인수 0 |
| 보존 | source10/protected9·부모 scene·local/session storage exact; pageerror/404/mutation/download 0 | 원본 PNG/scene/nav·user save·외부 WIP 보존 |
| 화면 판정 | 실제 PNG2 root 직접 판독: 첫 선택지 금색 초점선·한국어 안내 가독, 일반 닫기 후 패널 숨김 | 전체 VISUAL VERDICT: RETOUCH. 확대 배경 흐림·캐릭터 부근 주황 삼각형 겹침(원인 UNKNOWN)·좁은 접근 간격 남음 |
| 미인수 | 본편/native6·청취·유품/부탁 durable consumer·실보상 save·A급 지도 완성 0 | 기존 Haran met session flag만 관측; 미확정 Berin/Nessa 보상 ID 추정 0 |

구현·정적 검토·신규 native 검수는 각각 구분해 보존한다. 실제 하네스 실행 전 없는 snapshot.heldKeys 진단을 __rift25Lifecycle.snapshot().frameFatal.heldKeyCount로 보정했다(제품 실패 0). 구현 영수증 작성의 첫 Python quoting SyntaxError는 준비 실패/write0/product0으로 별도 기록했다. 기존 J/FX·클래스 표시·옛 GUI suite를 반복하거나 과거 실패를 새 PASS에 합산하지 않았다.

정확 근거 디렉터리: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/npc-keyboard-focus-20261007
- validation-receipt.json · 3,919 B / 1c761dec1e064be22c870249bcc0f31617421ace4246c9e407ca8c5f22e6491d
- native-result.json · 133,586 B / 852f843873c89b21d309d00a6420e0990523cfedf62be769d9b87d9b26e2ffad
- map-production-report.txt · 2,432 B / 8173c39d1eb5569bfcca5135878a758e3f28af9823b66eaa64238baed2ed029c
- native-open-choice-focus.png · 820,497 B / 7ad599df0b6184fbb15c2a9bb19ae956c66c11c92e76adc3c670e40ae8212680
- native-closed-canvas-return.png · 892,101 B / 836425b244d7be135dff1af068250e3c748d11ffc7b4f5020803623ba2bb863c

문서 보존 준비에서 절대경로를 Git HEAD 경로로 사용한 첫 명령은 exit128/문서 쓰기0으로 실패했고, 이어진 보존 준비는 영수증 부재로 exit1/Git stage0이었다. 저장소 상대경로로 준비를 바로잡은 뒤 정상 보존한다. 제품·native 검수 실패와 구분한다.

code+docs 정상 commit/push 및 원격 exact SHA는 같은 디렉터리 remote-preservation-receipt.json에 기록한다. 이 절의 신규 UI 검수만으로 전체 게임 완료를 선언하지 않는다.

> **당시 소스·검수 이력:** 아래 a04a9133 공개 핀과 sceneY+.70 소비 위치, 이전 원인 분리2·headgap2/GUI23은 해당 시점의 기록이다. 공용 openSize=.045와 미주입 openLift=.70 fallback은 현행에도 유지한다. 현행 world의 열린 주민 cue 위치는 ROOT-NPC-CUE-TOP-ANCHOR-20261007의 NPC별 cameraUp·billboard 상단 기준을 따른다. 원 raw 핀과 과거 검수 결과를 바꾸거나 이번 결과와 합산하지 않는다.

## 열린 대화 표시 가독성 현재 계약 — ROOT-OPEN-CUE-READABILITY-20261007

| 항목 | 현재 계약 / 관측 경계 |
|---|---|
| 완료 단위 | ROOT-OPEN-CUE-READABILITY-20261007; public interaction-cue-lifetime.mjs 14,064 B / SHA256 a04a913308ab87aa39616a848225193df8adb4ede39f4df8dc1bed1060af93aa |
| 변경2개 | INTERACTION_CUE_DEFAULTS.openSize .12→.045; openLift .42→.70. 이 두 상수 역변환만으로 이전14,063 B/1fe07971b3943d4a72ee618d467faf5bfea41175525e19f8f6478740be09aab7 전체bytes 복원(구현영수증). |
| 크기/위치 단위 | 열린 mesh scale의 x/y/z=.045 고정(scene units), worldToScene(anchor.x,anchor.y)의 결과 sceneY에 .70 추가. NPC foot XY·player/displayApproach·보행/물리 높이는 변경하지 않는다. |
| 열린 도형/재질 | RingGeometry(0,1,3,1), RGB0xc8623a, base opacity.8, camera world quaternion 복사, transparenttrue/depthTestfalse/depthWritefalse/DoubleSide/toneMappedfalse 유지. |
| 접근 cue 불변 | 접근ring size.16, RGB0xcdbb86/base opacity.55, RingGeometry(.5,1,32,1), groundLift.003. 열린size=.045 고정; 접근size=.16p. |
| pulse/순서 불변 | p=1+.22sin(clock/1000×1.6×2π), normal opacity=clamp(base×(.75+.25p),0,1); reduced-motion p1·base opacity·clock0. orderFor 주입 root NPC순서+.5, 미주입 default31. |
| 수명/입력 불변 | mesh2 pool, caller 기존RAF, 독자RAF/timer0. maxAnchors4/world8000, API/provider읽기·failclosed·종료해제·option범위 그대로. 대화/입력/neutral240ms/저장/아이템/퀘스트/카메라/원PNG/nav/원발 변경0. |
| 이전 public/원 raw | public14,063 B/1fe07971… 및 GUI23/초기 source검수는 당시 이력. 원 ANIMVFX raw9,287 B / SHA256 140748cf0ed50961e18b26750c66e240fb0c40abd8ace2baac8e1c54aa0ae567·공식완료ID 불변. 새 root2상수 변경을 raw 수정/후보새인수로 표시하지 않는다. |
| 원인 분리 관측 | root actual Chrome1·새2조건 PASS/FAIL0, 같은 pose3렌더+추가2렌더. prior open mesh 숨김 전후 실제 PNG RGBA diff777px, bbox476,275…511,316; 복원diff0·PNGbytesexact. 이 setup의 주황삼각형 원인은 public rift-interaction-open mesh로 확정. |
| 관측 범위 | 기존 selected-NPC editor host의 setup4700/6660, source11/protected9 exact. 원인 분리 관측은 이전 .12/.42 소스에서 수행되어 새 .045/.70의 위치/가독 인수로 계산하지 않는다. |
| 새 위치 Gate | 첫 실제 Chrome/context/parent 각1·순차child2/maxlive1, 신규2그룹·2조건 PASS2/FAIL0/미도달0/exit0. 추가 GPU렌더0·old suite 반복0. 원인분리 oldsource2조건과 합산하지 않는다. |
| 판정/미인수 | 원화 확대흐림 미해결·전체맵 VISUAL VERDICT: RETOUCH. Haran oversized 몸/머리 덮음 해소; Berin 몸미가림·주황cue는 보이나 앉은NPC보다 높이 떠 플레이어머리 근처여서 대상식별 미감 RETOUCH. alpha/anatomical head·인접tall druid·전체route/A급/main/native6/audio/영구보상·save 인수0. 기존 NPC-focus5/oldJFX/GUI23과 합산·재실행0. |
| Haran 실제 CSS 관측 | marker width13.49267294713161 × height15.559228631481488, NPCPlaneGapCSS10.176916437173531. 실제PNG에서 작은cue 가독 및 몸/머리덮음해소(root 판독). |
| Berin 실제 CSS 관측 | marker width13.492672947131666 × height15.559228631481403, NPCPlaneGapCSS38.276382209682936. 실제PNG에서 몸미가림/주황cue 가독, 고정lift로 앉은NPC와 떨어져 뜬 대상식별 미감 RETOUCH(root 판독). |
| 새 보호/오류 관측 | source11/protected9/추가 billboard·Three2 exact(독립 집계·중복가능), 부모scene/storage exact. GET-only, GL/errors/mutations/downloads0, Chrome종료. 이 helper 제품 CPU/Chrome 실행0. |
| 계획/실행 근거 | 계획6,046 B / 0c91c06980083198f576b9414c59ad4b25a4a0013fa7e17568c5525562636c66; runner17,617 B / 52bd8590afcd439bc7f1c53b99b5ae4cd4ea1c32b9c80379700d45acf313ab2f. 상속limit는 실행 전2/2로 정정; 실제 실행결과만 인수한다. |
| 최종 영수증 | validation-receipt.json4,586 B / 68744e5bca766ab537524cc064dcb9722682ae0cdff510842471f1a17525613c; native-result.json110,529 B / a8b570fa9aee9a5eacd73477a9def1eb3eb502f9dce38f33152a72cb1b7c9ff9. |

### MAP PRODUCTION REPORT (§23)

| 항목 | 범위 / 판정 |
|---|---|
| STAGE | ROOT-OPEN-CUE-READABILITY-20261007 docs disposition |
| MASTER | region/mainroute/sides unchanged |
| OUTER MASS | all outer mass/holes unchanged |
| LARGE | source art/atlas/large geometry unchanged |
| MEDIUM | connections unchanged |
| GROUND | source nav1192/feet/ground unchanged |
| PLAYABLE | cue decoration only; setupapproach not fullroute acceptance |
| LANDMARK | unchanged |
| CAMERA QA | root 실제 동일camera Haran/Berin2 setups, 카메라/geometry 수정0. actual PNG2 root 판독: Haran몸/머리덮음해소·Berin몸미가림; Berin 높이/대상식별 RETOUCH. alphahead/tall druid 미관측; helperGUI0. |
| TECH QA | 새 실제 Chrome1/context1/parent1/순차child2/maxlive1,2그룹2조건PASS/FAIL0/미도달0/exit0; source11/protected9/additional2 독립exact·GL/errors/mutations/downloads0·Chromeclosed. 이 helper product 실행0. |
| FILES | root code1 + approveddocs23; helper externaldocs-disposition only; owner/foreign/held preserved |
| GIT | 원총괄 소유 code1+docs23 정상 commit/push 및 remote exactSHA는 외부 remote-preservation-receipt.json에 기록; 이 문서 작성 시 보존 전 단계. |
| VISUAL VERDICT | RETOUCH (whole map and target-identification aesthetics); limited numeric/readability Gate2PASS |
| mainNative6 | False |
| audio | False |
| save | False |
| newLimitedNative | {'groups': 2, 'conditions': 2, 'pass': 2, 'fail': 0, 'unreached': 0, 'exit': 0} |
| unaccepted | ['fullMapSharpness', 'alpha/anatomical head', 'adjacent tall dark druid overlap', 'whole route', 'main/native6', 'audio', 'durable reward/save', 'Agrade'] |

정확 근거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/open-cue-readability-20261007/validation-receipt.json (4586 B / SHA256 68744e5bca766ab537524cc064dcb9722682ae0cdff510842471f1a17525613c). 전체맵 RETOUCH; 본편/native6·청취·실보상save·A급 완료로 계산하지 않는다.

### ROOT-EDITOR-PROBE-CSS-SIZE-20261007 — 편집 씬 보행점 CSS 표시 규격

이 절은 독립 편집 씬 lab의 보행점 표시 계약이다. lab10557/10712 당시의 금빛2픽셀·투영반지름1.3018px 관측과 검수 핀은 이력으로 보존하며, 새 CSS 하한12와 합산하지 않는다. sphere는 이동 위치를 보여 주는 표식으로 실제 캐릭터가 아니다.

| 항목 | 현행 계약 | 적용·한계 |
|---|---|---|
| 소스 | tools/editor-scene-preview-lab.mjs 16215B / SHA256 2794ecd9ef243d57a061b2f165ec7e6b37cafcc7834616a454c110e6d3bdd751 | 직전10712/698e48c8… 검수 이력 보존 |
| base mesh·재질 | SphereGeometry radius.04, widthSegments12, heightSegments8; 0xf1c67b, transparent:true, depthTest:false, depthWrite:false, renderOrder100000 | 기존 geometry·재질 유지; .04를 CSS12나 충돌r12로 치환하지 않음 |
| CSS 표시 하한 | PROBE_MIN_DIAMETER_CSS=12 | CSS 화면 지름 하한; 유효한 projection/depth에서만 표시. 물리 크기·캐릭터 규격 아님 |
| geometry 실제 반경 | 생성 직후1회 indexed triangle의 face-plane 원점거리 최솟값 innerRadius 측정; finite/index/퇴화 검사 | 실제 Three CPU 측정 .03794303237259694; source 상수로 박아 둔 값 아님 |
| 정사영 배율 | k=min(cssWidth×abs(P[0]),cssHeight×abs(P[5]))/2 | CSS getBoundingClientRect 크기 사용 |
| 원근 배율 | depth=-cameraSpaceCentre.z, k=정사영식/depth | 유효 near<depth<far 필수 |
| 절대 scale | max(1,12/(2×innerRadius×k)); marker.scale.setScalar(scale) | 누적0·DPR 재곱0; cached Vector3 1개 |
| 깊이 여유 | .04×scale<min(depth−near,far−depth) | 불충족은 minimum-unmet로 probe 숨김; scene render/ready 전체 실패 아님 |
| 투영/수명 가드 | render 전 camera/marker world matrix 갱신; current record·renderer·scene·camera·marker identity 재확인 | stale/closed/disposed 소유자에게 scale/진단/render 쓰기0; 추가 RAF/timer0 |
| 진단 API | snapshot().probe는 fresh frozen {minDiameterCss,scale,reason} | 초기 scale1/not-ready; release scale:null/unavailable. invalid에서 유한 기존 scale 또는null, visible:false |
| reason8 | visible, invalid-projection, behind-camera, outside-depth, unsupported-camera, minimum-unmet, unavailable, not-ready | 표시 상태이며 native/품질 인수 아님 |
| 보행·저장 불변 | 속도240worldpx/s, 충돌r12worldpx, dt상한.05s, combined 성공 우선·실패 시 X→Y/blocked1 규칙 유지 | source PNG/scene/nav/start/history/본편P/save 변경0 |
| 신규 CPU | 실제 전체 lab source에서 static import2개만 제외한 VM + 실제 Three r160 + 통제 DOM/renderer; 6그룹26조건PASS/FAIL0/미도달0/exit0 | GPU0/Chrome0. 최초 Node 준비오류 exit1·제품도달0은 별도 보존 후 metadata키만 제한 보정 |
| CPU 투영 관측 | 실제 mesh projection width≈12.6505437034556 CSSpx, height≥12.6024 CSSpx | CPU fixture만; 실제 PNG 픽셀/실물 모니터 관측 아님 |
| 첫 신규 native | Chrome1/context1/parent1/child1. 정사영 zoom.5/1/3 조건3PASS; P4 원근 전환 snapshot 대기 Timeout1/후속2미도달/exit1 | 원근 geometry 관측 전 setup 실패. 종료 후 scene/storage 검증도 미도달; 처음부터6PASS로 바꾸지 않음 |
| 새 제한 원근 native | 추가 Chrome1/context1/parent1/child1. 원근 zoom.5/1/3 새조건3PASS/FAIL0/미도달0/exit0; 통과한 정사영3 재실행0 | 물리 Chrome 총2. 실제 DOM selectOption input/change trustedfalse; Home/End zoom·Fit click trustedtrue |
| 신규 CSS 실제 투영 | 정사영3: width≈12.6625735341/height≈12.6024044322. 원근 .5:12.6625735341×12.490511188, 1:12.6625735341×12.9093851627, 3:12.6625735341×18.3360597271 CSSpx | indexed geometry 투영 수치. 정사영/원근 zoom3는 XY 화면 밖이라 가시성 인수0; alpha 픽셀 지름은 미측정 |
| root PNG 직접판독 | 정사영.5/1·원근.5/1 PNG4에서 남쪽 진입 금색 원형 보행점 식별 PASS 한정 | 실제 캐릭터 아님; 전체 맵 확대 흐림/접합/미감은 RETOUCH. helper의 별도 Chrome/PNG 재검수0 |
| 새 제한 종료·보존 | source8/protected9·부모scene/storage exact. trusted pagehide→disposed:true/ready:false/RAF:false, host ownedTimer0/iframe0 | 실제 논리 종료 관측; physical GPU free UNKNOWN. 첫 실행의 미도달 보존검사를 후속 결과로 소급하지 않음 |
| 최종 영수증 | validation-receipt.json 14181B / SHA256 3f57198f016a7db8d8b1ef85828a90167868b6acdb5f28c9c802ad823f29257a | 첫 CPU metadata 준비오류/실CPU26PASS/첫native실패/원근제한3PASS 별도 보존 |
| 인수 경계 | 전체 맵 VISUAL VERDICT: RETOUCH; 신규 표시 식별은 root판독4뷰만 PASS | 배경 확대 흐림·접합 개선 주장이 아님. 본편native6/audio/save/A급 인수0 |

검색은 구현worker broad1회(130경로2707행)와 helper targeted1회(22경로2372행)의 서로 다른2쿼리이다. 경로 교집합21/합집합131이며 현재 동기화 정본19·보존112로 처분했다. 다른 시점의 ownerSTATE/LOG 행을 고유 의미 행수로 합산하지 않는다.

#### MAP PRODUCTION REPORT (§23)

| 항목 | 이번 단위 실제 결과 |
|---|---|
| MASTER PLAN / LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION | 원본 지형·외곽·연결·바닥 변경0. 가이드 전체·SSOT 선행 순서 유지 |
| PLAYABLE / COMBAT / LANDMARK / SMALL DETAIL | 이동·충돌·랜드마크 변경0. 이동 검사용 금색 probe의 CSS 표시만 개선; 실캐릭터 아님 |
| CAMERA QA | 남쪽 진입 정사영.5/1·원근.5/1 PNG4 직접판독, 위치 표시 식별 PASS 한정. zoom3는 양 모드 화면 밖이라 가시성 인수0. 전경·중앙·출구 전체 route 미검수 |
| TECH QA | 실제source+Three CPU6그룹26PASS; 첫 native 정사영3PASS/원근입력setupFAIL1/미도달2와 새제한원근3PASS는 별도. 새제한 scene/storage/source8/protected9 exact·trusted pagehide 논리종료, GPU물리해제UNKNOWN |
| FILES / GIT | root 소유 lab1+관련docs19만 정상 commit/push. 외부 원문백업·검수·원격exactSHA는 editor-probe-css-size-20261007/remote-preservation-receipt.json에 보존 |
| VISUAL VERDICT | RETOUCH — 전체 맵 확대 흐림·절벽/전경 접합 미해결. 새 금색 위치 표시 식별만4뷰 PASS |
| NEXT PASS | 실제 캐릭터·NPC consumer와 본편 연결, 맵 해상도·레이어 접합 개선. 기존 완료 검사 반복0; 본편native6/청취/save/A급 완료 아님 |

## NPC별 열린 대화 표식의 현행 계약 — ROOT-NPC-CUE-TOP-ANCHOR-20261007

이 절은 이전 source epoch의 전역 sceneY+.70 배치 조항을 대체하는 현행 world consumer 계약이다. 과거 원문·수치·실패·미도달·검수 핀은 당시 이력으로 보존한다. public 기본값 openSize=.045/openLift=.70은 유지하며, resolver 미지정 호출만 기존 .70 fallback을 쓴다. editor CSS12 금색 probe 계약은 별도 소비자로 유지한다.

| 항목 | 현재 코드·범위 |
|---|---|
| 완료 소유 source | tools/2_5d-world-lab.mjs 54,541 B / SHA256 3463744d4371cc57ce7d50b86161430605d87f46c3be4e27989156d7b754218b; tools/2_5d/interaction-cue-lifetime.mjs 15,046 B / SHA256 37de3f41c96aa59db2ba0777d8928f16f60f6018de6b07bd0e22ad8f52d03e6a |
| public 옵션 | openPointFor=null 또는 함수. 호출 인수는 npcId와 매 호출 fresh frozen {x,y} world foot. resolver 반환값 own-data finite {x,y,z}는 scene XYZ로 그대로 소비하고 openLift를 다시 더하지 않는다. world foot은 ground ring·정렬의 권위값이다. |
| public 실패 격리 | null/throw/accessor/nonfinite 결과는 open 표식만 숨김; approach pool·terrain renderer 유지. snapshot.openPointUnknown=true/reason=open-point-unknown. resolver 없음은 기존 .70 fallback. lifetimeToken은 retire/reset/dispose에서 교체하여 재진입 후 stale publish를 막는다. |
| world resolver | residentCueOwn/residentCueIdentity/residentCueBodyAligned/createResidentOpenPointResolver. 현재 resident 4개 중 unique npcId·visible·동일 world foot·source/display·실제 foot/body 소유관계 확인. 실제 camera quaternion의 up을 사용한다. |
| 배치 공식 | openCenter = footScene + cameraUp × (sceneHeight × pivotY + .015 + INTERACTION_CUE_DEFAULTS.openSize). .015는 보수적 여백 항이며 .045는 기존 삼각형 circumradius; 실제 mesh 하단과의 간격은 투영 geometry로 별도 확인한다. 해부학적 머리나 alpha 상단 인수 아님. |
| NPC별 현재 값 | Haran/Nessa/Dorik sceneHeight=.36, pivotY=1, foot→center=.42 scene. Berin sceneHeight=.21923875432525952, pivotY=1, foot→center=.2792387543252595 scene. source rotation=0만 지원. |
| transform 가드 | scene parent=null 및 scene/resident root identity; foot parent=root/scaleXYZ=1/position=worldToScene 결과. body parent=foot/positionXYZ=0/scaleYZ=1, scaleX는 boolean source.flipX의 ±1과 일치; body quaternion identity. foot quaternion은 camera quaternion q 또는 -q와 최대 성분차 ≤32×Number.EPSILON(7.105427357601002e-15). 지원하지 않는 변형/accessor/nonfinite는 null. 마지막 외부 호출 뒤 transform 재확인. |
| 소유·입력 수명 | resident/terrain/camera/scene/dialogue/lifecycleEpoch/selected actor/rig identity가 현재여야 한다. residentCueGeneration fresh identity를 clearIntent와 열린 closeDialogue에서 교체하여 actor 왕복/닫힘 중 stale resolver를 차단한다. callback 뒤 current 재검사. 추가 RAF/timer=0; Quaternion/Vector3는 resolver별 재사용. |
| 유지 범위 | openSize=.045/openLift=.70, 색0xc8623a 및 기존 pulse/material/order/geometry, 접근 ring, 원PNG/scene/nav/foot-Y정렬/충돌/대화 controller/본편/save 보존. 공개 기본값 일괄 재조정0. |

### 새 의미·실화면 검수의 정확 범위

| 검수 | 관측·판정 |
|---|---|
| 최초 CPU epoch | world52,918 B/39b05f57f16f103c28106532e951fd337bcb04c4120406c2e2d066dc5192f016 + 위 public15,046 B. actual Three+실제 helper/공개 consumer, 5그룹20조건 PASS 뒤 top-four 첫 Float32 1e-8 비교 FAIL1/후속6그룹 미도달/exit1/unhandled0. 최초 delta 원자료 미보존은 UNKNOWN 유지. |
| 제한 CPU 후속 | 같은 중간 source에서 실패·미도달 범위만 7그룹22조건 PASS/FAIL0/미도달0/exit0. 새 관측 Haran 상단차 약1.430511e-8을 독립 Float32 cast 모델로 설명, 최대 잔차1.72e-15. 이전20조건 재실행0. 최초 FAIL을 clean PASS로 교체0. |
| 최종 guard CPU | 현재 world54,541 B/3463744d…의 추가 transform/own-data/최종 callback 가드만 5그룹20조건 PASS/FAIL0/미도달0/exit0. 이전20/22조건 재실행0. 세 결과를 clean 전체 suite로 합산0. |
| 신규 native | 최종source로 actual Chrome1/context1/parent1/순차child2/maxlive1. trusted R 입력 후 실제 render 관측, Haran/Berin 신규2조건 PASS/FAIL0/미도달0/exit0. 기존 identity A/B·focus·size·J/FX suite 재실행0, 추가GPU render0. |
| 실 geometry 간격 | Haran cue하단↔body상단 .021028843224048188 scene / 4.197882828600825 CSSpx; Berin .021028853767265154 scene / 4.1978849332901405 CSSpx. 두 centerResidual=0, 각 실제 GL 프로그램15개 LINK=true/GL error0. canvas CSS1014×698.6875/backing1016×701/DPR1. |
| 보존·종료 | source12/protected9 exact, parent scene/storage exact, mutation/API write/download/pageerror/404=0. trusted pagehide2 뒤 disposed=true/ready=false/RAF=false, 관측된 자원 release attempt 각각1(복수 자원 kind는 개별 수). physical GPU free는 UNKNOWN. |
| root PNG 직접판독 | haran-canvas.png 1,200,071 B/765e79890d5222b8c43768805b072b59a77d294acebaccb63df8603f4b1d5bfb: 현재 pose의 표식 식별·몸 가림 해소 PASS 한정. berin-canvas.png 1,206,276 B/8ec76f2622b3344ce663e4352cd1847bec9bd05486f59818e9eb1809b182b14b: 인접 player와 cue 부근의 시각적 겹침/식별 미감 RETOUCH, mesh 원인분리0. geometry2 PASS를 미감 전체 PASS로 승격0. |
| 원자료 위치 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/npc-cue-top-anchor-20261007/. implementation-receipt.json56,565 B/b15396bbc5ed026eef8cf0748647bb05c41dc3b2324caa736001627939bc3098; validation-receipt.json20,154 B/6e5b220b12dd85b387d901a09ea35452adb4cac0e744d2ee09b79839f51ee30f; native-result.json35,210 B/bf5d135337b5c22f85760fa2225979bb729189cb91a006fbdc6ea39ccc33beb0. |
| docs 검색 | 중간 source의 broad250행/26path, 최종 guard targeted2행/2path, 최종 source의 필수252행/26path는 서로 다른 query/epoch 원자료로 구분. 현행 cue23문서 동기화, ownerSTATE/LOG2와 다른 editor 참조1은 보존. 26문서 전체 정독·단일검색으로 과장0. |
| 미인수 | 원화1254→8000확대 흐림/legacy1024 mask 흐림, 전체맵/A급, 실제지형높이, fullPlayerLinked, 같은후보 본편native6, 청취, 실제유품/부탁 durable save 모두 미인수. fixture/독립lab/원자료보존은 본편완료가 아님. |

### MAP PRODUCTION REPORT (§23)

| 구분 | 이번 작업 보고 |
|---|---|
| STAGE | ROOT-NPC-CUE-TOP-ANCHOR-20261007 / 지옥의 틈 기존 world의 NPC 열린 표식 consumer |
| MASTER | silhouette/regions/main route/side spaces 기존 유지. guide full18,392 B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b 및 SSOT_INDEX/stageLOCK 선행 읽기 근거 적용. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 기존 유지·새 geometry/배치0. |
| LARGE | source assets/composites/overlap/repeated silhouette 원PNG/승인원자료 보존·새 원화0. |
| MEDIUM | connections/remaining holes 기존 유지·경로 수정0. |
| GROUND | shadow/contamination/structure integration 기존 유지·색재질 수정0. |
| PLAYABLE | main arenas/travel/breathing/threat/combat readability 기존 유지. NPC 표식 수직 기준만 수정, 전투·충돌·foot 이동 수정0. |
| LANDMARK | primary/secondary/tertiary 기존 유지. |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전수 인수0. 새 실제 Haran/Berin 대화 pose2만 관측, geometry 간격2 PASS; Haran 식별 PASS 한정/Berin 식별 RETOUCH. |
| TECH QA | route/collision 변경0·전체경로 검수0; 실제 pageerror0/4040; seam=NPC별 cameraUp 상단 배치; loading=두 순차 child 실제ready/render; 성능 정량 benchmark0·추가RAF/timer0. CPU3 epoch/최초FAIL/제한후속/native2를 별도 보존. |
| FILES | stage-owned code2+현재docs23, concurrent touched0/unrelated touched0. heldWOLF/STORY 추가접근0, 타인WIP·원PNG/scene/nav/save·보호2_3·Q전용/어택티켓금지 보존. |
| GIT | 이 완료소유 code2+docs23만 정상 stage/commit/push 대상으로 한다. 실제 최종 HEAD/remote exact/NUL/index/foreign68는 같은 외부 폴더 remote-preservation-receipt.json의 검증 결과를 따른다. deploy0. |
| VISUAL VERDICT | RETOUCH. Haran 한정 가독성 개선, Berin 인접 player 겹침 및 전체 확대흐림 남음. |
| NEXT PASS | 현재 개선을 보존한 뒤 Berin 표식과 player의 겹침을 새 소유·수명 계약 내에서 검토. 전역lift 재변경/옛A-B검사 반복0. 맵 선명도는 승인된 원자료·전경/절벽 sampling 소비 경계부터 별도 후속. |

## 베린 표식 회피 후보 미채택·실화면 FAIL 보존 — ROOT-BERIN-CUE-AVOIDANCE-20261007

이 단위는 실제 베린 접근 장면의 겹침을 해소하지 못했다. 후보를 공개 소비자로 채택하지 않고 root 소유 수정 전 fullbyte 백업으로 공개 파일을 정확히 복원했다. 기존 `ROOT-NPC-CUE-TOP-ANCHOR-20261007` 현행 본문·수치·역사 라벨은 그대로 유효하다. Git reset/checkout·삭제·타인 WIP 복구는 수행하지 않았다.

| 구분 | 정확한 상태·핀 |
|---|---|
| 현행 공개 world | `tools/2_5d-world-lab.mjs` 54541B / SHA256 `3463744d4371cc57ce7d50b86161430605d87f46c3be4e27989156d7b754218b`. 소유 사전 백업과 fullbyte exact. 공개 회피 로직 추가0 |
| 현행 공개 cue | `tools/2_5d/interaction-cue-lifetime.mjs` 15046B / `37de3f41c96aa59db2ba0777d8928f16f60f6018de6b07bd0e22ad8f52d03e6a`, 변경0. `openSize=.045`, `openLift=.70`, 색 `0xc8623a`·material/geometry/order/pulse/foot-ring 유지 |
| 미채택 후보 | 외부 `berin-cue-avoidance-20261007/world-unadopted-62789.mjs` 62789B / `6211f0bc0f2539cb422cf22a549918ffdf0a3f8b7cc21bfa7643a737542d3f93`. 후보 존재·CPU 통과는 공개 채택/겹침 수정 완료가 아님 |
| 후보의 기준 A | NPC footScene + cameraUp × (`sceneHeight*pivotY + .015 + .045`). 베린 높이 `.21923875432525952`, pivotY=1, center lift `.2792387543252595`. 다른3NPC의 A 유지. 이 공식의 현행 공개 의미는 이전 top-anchor 절과 같음 |
| 후보의 제한 이동 | 베린·정사영·현재 보이는 canonical SkinnedMesh609/index3360/12bones만. A 기준 right/up 양축 겹침일 때 δL=`minRight-.045-.015`, δR=`maxRight+.045+.015`; cap=`sceneWidth/2+.045+.015` 이내 최소 abs(δ), 동률 왼쪽. 허용 후보 없으면 A. 원형 반경의 보수적 사각형 기준이며 alpha 윤곽/삼각형의 최단 이동이 아님 |
| 후보의 수명·비용 | fresh pose identity/owner/actor/rig/epoch/generation 및 자원 참조·버전을 정점 호출 뒤 확인. 12×16 bone/mesh 행렬값 전수는 최종 측정·게시 직전, malformed/throw 조기 종료 때 확인. stale는 null로 숨김, current unsupported는 A. 중간 변경 후 완전 원복은 미관측. 추가 RAF/timer/rig.update0. 이 후보의 매프레임 비용은 공개 코드에 남기지 않음 |

| 검수 epoch | 실제 근거·판정 |
|---|---|
| 초기 후보 CPU | 62749B / `b2d9ec49f13669fb22b2f2b710b6afbba4cb16e8419d42f9c876d5ef17826c48`의 실제 private helper + Three r160, 8그룹28조건 PASS/FAIL0/미도달0/unhandled0/exit0. 현재 공개 소스의 새 검사로 계산0 |
| 독립 소스 검토 | Codex7 공식 turn `01a1142a-27e1-7d00-a626-20df4e40ad9c`: 행렬값 변경 후 throw/잘못된 반환/nonfinite의 조기 fallback에 full 검증 누락 P2. provider 원문2703B / `5895cb2a2665789450cdc6e5912d39ec82958ad11dbfdc2b646c149c4c36e86f`. 정적 반례, Codex 실행0 |
| 최종 후보 한정 CPU | 조기 종료3곳의 full 검증 최소 보정 뒤 62789/6211f0에서 신규3조건 PASS/FAIL0/미도달0/message getter0/unhandled0/exit0. 구28 재실행0, clean31 PASS 합산0. CPU 물리 실행2회 |
| 최초 실제 native | 물리 Chrome1/context1/parent1/child1/maxlive1, trusted R 뒤 실제 onAfterRender 한 프레임의 현재 warrior609 변형 정점·cue/NPC geometry 관측. 새1조건 0 PASS/1 FAIL/미도달0/exit1: `New avoidance pose did not shift`. 동일 native 추가 실행0 |
| 실제 상한 실패 | 베린 sceneWidth `.2260899653979239` → cap `.17304498269896196`. skin right 범위 `[-.24756335542587582,.29254377373434926]`, up `[-.2017611808480261,.3385331182595573]`. δL `-.3075633554258758`, δR `.35254377373434925` 모두 cap 초과 → δ0/A 유지. 전체 geometry가 투명 여백을 포함한다는 한계이며 정확 alpha 윤곽 측정은 아님 |
| 실제 화면·GPU | 수직 gap `4.1978849332901405` CSS px 유지; 수평 gap `-.29256335542587575` scene / `-58.48091364558178` CSS px. GL program15 LINK=true/error0/contextLost=false. 원 callback·prototype descriptor 복원 exact. source13/protected9 전후 exact. 페이지 오류/HTTP404/mutation/download0 |
| 실패 뒤 경계 | Chrome/context 닫힘 확인. 성공 후 parentScene/storage 비교·trusted pagehide/lifecycle 후검수는 미도달. failure 시 liveChild counter1은 finally 브라우저 종료와 별개 기록. 물리 GPU 회수 UNKNOWN. private pose token은 native observer에서 미노출/미관측 |
| 실패 화면 | `berin-canvas.png` 1206124B / `93ad1cb0b0e95386b525f566e488bf93025a682a8a2aecc702e186ca7d4b105a`. root 직접 판독: 표식/전사 몸 겹침 미해결. 실제 rig frameIndex/crop은 최초 observer에 미보존 UNKNOWN |

모든 외부 근거의 루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/berin-cue-avoidance-20261007/`이다. `implementation-receipt.json` 10479B/`efb83bb98d31b7eada4a02ea68648748e64dfc9cc11b4ace1acfb5e0b33c00cf`, `native-result.json`, `unadopted-restoration-receipt.json`으로 후보·실패·공개 복원을 구분한다. owner 0201/0207/0212 새 provider 단일 text14건은 `owner-new-formal-raw/manifest.json` 23592B/`46c9fe53e456e055e5961b5b65c7f537e043e8d622ebc95f1c9bd69bd614993d`에 정확 UUID/시각/bytes/fullSHA로 미채택 보존했다. 전문14 raw 의미 실행/채택0이며 제작14건 완료를 뜻하지 않는다.

후보 최종 소스 시점 docs 검색은 1079행/31경로(`implementation-docs-keywords.txt`1293347B/`52c385ba9e7512b855a3b36c6876da3f165f1b97762c8ba5baecc4d3923dda6d`), 공개 복원 뒤 다른 query/epoch의 필수 검색은1221행/54경로(`docs-post-restoration-keywords.txt`2467655B/`06ef4a36042ece3961cf5d4d4b63aefcbc29f557cf28d31443bc7686341d5b8e`)다. 교집합31/합집합54이며 전체54문서 전수 읽기를 뜻하지 않는다. 관련 현재23에는 미채택·복원 근거만 append하고 다른 mode/과거/owner WIP31은 보존한다. 기존 현재 top-anchor 본문 변경0. 이번 정상 Git 보존은 docs 한정이며 미채택 후보·foreign·owner STATE/LOG·held 후보 stage0; 최종 원격 exact SHA는 외부 `remote-preservation-receipt.json`으로 확인한다.

다음 미완료는 기존 decoded 이미지의 alpha 점유와 실제 UV/index 셀을 이용한 보수적 bounds의 새 소비 계약이다. 현재 source 읽기/원자료 feasibility 단계이며 구현·채택·새 native 인수0이다. 원본 이미지 변경·재생성·매프레임 픽셀 스캔·상한 임의 확대를 완료 방안으로 간주하지 않는다. 원화1254→8000 확대·legacy1024 mask 흐림, 본편 native6/청취/실보상save·A급 완성은 계속 미인수다.

새 source 계약은 Codex7 turn `01a1142f-cc5c-7dd2-ac7f-e46332f1a6e8`의 provider 원문3681B/`b98dcb9125002ab29778dd2bb88ee2747255922e919d620c47517aa9331906c9`에 보존했다. 읽기 시작 world62789→종료54541의 root 의도 복원을 핀 변경으로 기록했고 종료 world 재검토0이다. 안정 rig11211B/`d3ec77150627c6cf9ff4c9d4ed97a0015f78df9e5590b3fca595f5374587fa14`·catalog9338B/`990e9c6cb81e0c573a8bc3dd6223ee21184e4692af47576078495fabd685f66a`에서 기존 `texture.source.data`의 decoded Image와 실제 UV/texture matrix를 활용할 접점만 확인했다. alpha 공개 API·새 코드·실행0이다. rotation0/flipY=true/inset.5의 제안 매핑은 pixelX=`frame.x+.5+u*(frame.w-1)`, pixelY=`frame.y+.5+(1-v)*(frame.h-1)`이며 geometry/frame/filter/owner/pose의 새 소비 검수가 필요하다.

대표 원자료 feasibility는 native 실패 frame과 별개인 canonical warrior/idle/south frame0, `img/exoduser_warrior/south.png`1008×48/32485B/`d04c5a3e7831b4a349908a5f31361c39f9993e5fdccc5f792585bce8e601d467`, crop(0,0,48,48)만 측정했다. 첫 준비는 복원 world 핀 전달 누락으로 FAIL(exit1), PNG decode0/수치 미도달; 조건을 한정 정정한 후 실제 첫 PNG decode1은 exit0이다. RGBA8/color6/noninterlaced/CRC3 확인, alpha≥21 픽셀398개·alpha>0=516개·alpha255=179개, bbox x[11,33)/y[14,46). source-local20×28 직접 coverage130셀/활성 corner164개, 한 grid-cell 여유196셀/활성 corner230/609개(cols3..15/rows7..28)다. 실제 UV·skinning·현재 frame·cap 분리 인수가 아니며 대표 raw와 현 native를 동일 frame으로 추정0. `opaque-feasibility/feasibility-receipt.json`5581B/`6743895089c55a37b871918116c81de05ba63a9654843c1603203d469e788539`, `alpha-grid-followup-result.json`19139B/`dcb0cc3d8f13eba77476a985b57df2898f182492ccea922f4f46fc6a8496bbaa`에 준비 실패와 최초 실제 측정을 별도 보존했다. 제품·이미지 변경/Chrome/추가 PNG 측정0.

```text
MAP PRODUCTION REPORT
STAGE: ROOT-BERIN-CUE-AVOIDANCE-20261007 미채택 후보의 실제 FAIL 및 공개 복원
MASTER PLAN: full guide18392B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b·SSOT_INDEX/stageLOCK 선행 적용; 기존 silhouette/지역/main route/side space 보존
LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION: 원 PNG·scene·nav·geometry·발 위치 변경0, 새 인수0
PLAYABLE / COMBAT: 기존 host 접근 setup와 trusted R만; 원본 route·전투·획득·save 인수0
LANDMARK / CENTER / SMALL DETAIL: 기존 배치 유지; 베린 cue 회피 후보는 미채택·공개 사전 백업 exact 복원
CAMERA QA: 실제609 geometry의 cap 초과로 수평 겹침 미해결, 첫1조건 FAIL 동결
TECH QA: 초기CPU28/최종신규3/native0PASS1FAIL 별도; source13/protected9 exact; 후검수 미도달 보존
FILES / GIT: 외부 exact 후보·실패·복원 영수증 + 관련 docs만 정상 보존; 공개 code delta0/미채택 코드 stage0
VISUAL VERDICT: RETOUCH — 전체맵 및 베린 겹침 미해결. 회피 geometry Gate FAIL
NEXT PASS: alpha-aware 보수적 셀 점유 source/API 계약·원자료 수치부터 새 단위 검토; 기존 검사 자동 재실행0
```

추가 cap source/수학 검토 `CODEX7-BERIN-OPAQUE-CAP-FEASIBILITY-20261007`(공식 turn `01a11435-5732-7c21-83d8-6bdf85811169`)의 provider 단일 원문은 `codex-opaque-cap-official-end.txt` 3303B/`f45694b428a15585a3676f77e86364d3636d1c95c11f130ad98737f9c8011d88`에 미채택 보존했다. A 기준 수평 bounds [L,R], NPC 반폭 h, r=.045/m=.015/cap=h+r+m인 기존 보수적 사각형 모델에서 겹침 시 왼쪽 가능 조건은 L≥−h, 오른쪽은 R≤h다. L<−h 및 R>h이면 양방향 cap 초과이며, 중심 q=(L+R)/2·반폭 b=(R−L)/2의 가능 조건은 b−|q|≤h다. 최초 실패 전체 geometry 값으로 계산한 한쪽 edge의 필요 축소는 약 .134518/.179499 scene이며 alpha 적용 결과가 아니다. 실제 direction/frame/elapsed/pose/발/A를 고정한 새 alpha 투영 가능성 Gate를 통과한 후보만 새 화면 검수 대상으로 삼는다. 실제 실패 frame UNKNOWN·대표 raw 동일 pose 추정0·cap 새 값 확정0·새 코드/CPU/GPU/Chrome/전문송신0이다. 기존 정책 유지·별도 유한 outreach·유효 위치 없을 때 open 숨김의 대안은 모두 미확정 제안이다.

### ROOT-RIG-POSE-PUBLICATION-20261007 — rig 내부 pose 갱신 완료 조회 API

| 항목 | 현행 소스 계약 | 한계 |
|---|---|---|
| source | tools/2_5d/character-rigs.mjs · 12,284 B · SHA256 b89c2c29e4755b99b25d6bb26e84d4ad3aa754472cd71abf6e0dd2302d29a4a0 | 기존 모션·프레임 UV·bones·crop·지형·world·저장 API 변경 0 |
| snapshot.posePublication | null 또는 frozen record 자체 identity token. 필드 normalizedPhase/mode/direction/frame/elapsed/source | snapshot 반복은 같은 record 참조; 같은 frame/elapsed라도 새 정상 update는 새 identity |
| 진입·게시 | update 진입 updateDepth++ → options getter 전 null. 실제 mesh.updateMatrixWorld(true)·skeleton.update 성공 및 samejob/notdisposed, depth===1일 때만 게시 | inner update는 계산·반환만; update 안 callback의 publication은 null |
| 실패·종료 | catch null 후 원 thrown identity 재throw. finally depth--, stale outer null, 정상 job만 null. dispose 첫 publication/job null | dispose는 진행 중 stack depth를 reset하지 않음. 기존 cleanup throw 이후 모든 자원 정리 완료를 증명하지 않음 |
| phase·source | 기존 finite phase clamp 0..1 / 자동 elapsed%duration/duration, frame min(frames−1,floor(phase×frames)); source는 기존 frozen frameInfo | 새 모션·프레임/PNG/UV 생성 0 |
| 첫 반환 | factory 내부 idle update(0) 성공 뒤 publication 포함 | 최초 항상 null인 API 아님 |
| 의미 | rig 내부 mesh/skeleton matrix 갱신 완료 조회 | 이후 caller world/parent transform·texture/geometry 제자리 변경·alpha/opaque 소비·GPU freshness UNKNOWN |
| 신규 검수 | 실제 factory/catalog/vendored Three 첫 CPU 1회, 14그룹·90조건 PASS; FAIL/미도달/unhandled 0, exit0, source/fixture PNG exact | Image는 PNG IHDR controlled port. 실제 decode·GPU·Chrome·native·alpha 소비 0. 이전93 등 검수 합산·반복 0 |
| shared checkout 경계 | root의 game 쓰기/stage 0, 현재 game은 별도 writer UNKNOWN WIP 보존·완료 Git 범위 제외 | checkout 전체 game bytes 불변 주장 0; 보호 나머지8 exact와 별도 |
| 인수 상태 | API source/CPU 검수 완료; 신규 시각 NOT ASSESSED, 전체 VISUAL RETOUCH | 본편 native6·audio·save·A급 인수 0; Berin 미채택 후보/복원 world 현행 이력 유지 |

MAP PRODUCTION REPORT (§23): STAGE=CH1-1 2.5D 캐릭터 기반 API; MASTER/OUTER/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/CAMERA 배치 변경0. TECH=신규 실제 rig CPU14그룹90조건 PASS, GPU/화면/청취/본편 플레이0. FILES=rig1+관련docs14; 타인 game/ownerWIP·원 PNG/scene/nav 보존. GIT=이 완료소유만 정상 보존, 배포0. VISUAL VERDICT: RETOUCH. NEXT PASS=실제 1-1 권위 map/P/카메라를 소비하는 2.5D 맵·캐릭터 연결.

### ROOT-CH1-1-THREE-TERRAIN-CONSUMER-20261007 — 현재 상태

| 항목 | 현재 값·범위 |
|---|---|
| 완료 | 실제 `game.html`의 `G.map/P/G.cam`을 읽어 Three 지면을 main의 기존 X world transform에 연결. `3387/ch1Three=1` 한정, stage0/smoothing/비boss. 기본OFF. 별도lab완료가 아니다. |
| 보존·미완 | mw=mh200/T40/world8000²/원PNG·scene·nav·기존actor/DS/Border/paint96/cache97 보존. height0/3Dactor0. 실제 절벽·rig/발접지·NPCdurableconsumer·전투/보스/native6·청취/save/A급 미완. |
| 검수 | 최종module7699/26d66ae4 source CPU8그룹43조건PASS. guard 전module7559/d4856에서 Chrome1/3조건PASS·실W이동7420→7302.446200000009/map exact/GL0. 최종guard 추가Chrome0·별도epoch합산0. |
| 경계 | shader callback실패 게시차단. parent X upload exception·부분생성/해제예외·물리GPUfree UNKNOWN. headlessdraw45.4→20.4ms는 성능인수 아님. 차단POST1/실서버쓰기0. |
| 정본 | `MAP_RUNTIME_ARCHITECTURE.md`와 `CH1_1_PRODUCTION_FINISH_20260916.md`의 본ID절·§23 표. source/module·checkout/부분Git pin 및 검수범위를 거기에 정확기록. 앞선 날짜별source/미구현기록은 당시 이력으로 보존. |
| 근거·판정 | 외부 `ch1-1-2_5d-production-20261007/validation-receipt.json`3572B/ce099bce7b4312690d31e78004b7b267fa9034e556866352527ed3d534faddee. rootPNG2직접판독, **VISUAL VERDICT: RETOUCH**. |
| 후속 | Claude8 기존6팀 actual1-1 통합과 Codex7 높이/권한 seam 읽기를 연결. 원총괄은 완료후 최소consumer→화면→docs→소유code+docs보존. 새팀/중복송신0. |


### ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007 — 본편 전사 표시 부분 연결

이 절은 과거 main rig0 기록을 해당 epoch 이력으로 보존하며 현재 전사 본체 부분 채택의 canonical 링크를 추가한다.

정확한 scope/방향/phase/active-tick clock/발 anchor/폴백/생명주기는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

clock 전 native5조건 부분 PASS와 최종 clock CPU 검수는 별도 epoch다. 전체 main rig/foot/native6/A급 완료0, 현재 VISUAL VERDICT: RETOUCH.

### ROOT-CH1-1-WARRIOR-STRIKE-RIG-20261007 — 본편 전사 LMB 베기 표시 부분 연결

본편 전사 공격 부분 채택의 현재 정본은 DIRECTIONAL_CHARACTER_RIGS의 동일 completion 절이다. 이전 idle-only 채택 기록과 새 공격 검수 epoch를 분리한다.

정확한 origin·atlas gate·셀·phase·anchor·미채택 상태는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 sparse guard의 새 한정 CPU는 6조건 PASS/FAIL0/미도달0/exit0이며 최초 공격 CPU100PASS·1FAIL은 별도 보존한다. root가 인계한 동일2a052 소스의 새 main native는 Chrome/context/page 각1, 실제 LMB east/index2의4조건 PASS/FAIL0/미도달0/exit0이다. 실제 atk2 f2/phase2.5÷9/609vertices/canvas85×85/alpha>16픽셀581/GL0, 현재 owned LMB-origin1을 관측했고 wRecover에서 bodyCurrent=false, idle 복귀 owner=null을 관측했다. pageerror/httpfailure0 및 POSTmats1 차단/서버도달0이다. W setup1300ms 입력 중 xy4020,7420이 변하지 않아 이동 성공을 주장하지 않는다. root PNG 직접 판독은 main 시작 금빛FX가 몸·발을 가리고 격리 공격 그림은 보이는 상태다. VISUAL VERDICT: RETOUCH. 실제 발·native8방향·회수 rig·DS ghost·native6·audio·save는 미인수다. 이전 idle/W native5 및 clock5 CPU와 합산하지 않는다.

최초 공격 CPU는 2a052 epoch에서9그룹 도달/8그룹 완료/100조건 PASS·1FAIL/exit1이었다. native.every가 sparse hole(index8)을 건너뛰어 잘못된 배열을 허용한 반례를 원 result.json에 동결했다. 최종8a4e 소스는 i0…8 직접 for-loop와 Object.hasOwn(native,i)로 각 셀의 실재 own index를 요구한다. 최초100PASS를 재실행하지 않은 sparse 한정 후속은 6조건 PASS/FAIL0/미도달0/exit0이다. hole8·hole0·hole4·inherited-only4·own undefined8은 렌더0으로 차단했고 dense 대표 n/f4는 phase.5/anchor(0,18)/단회 렌더를 유지했다. 앞선 native4PASS는 2a052 소스의 결과이며 최종 own-index guard의 native 검수는 미실행/추가Chrome0이다. clean 전체 PASS로 합산하지 않는다.

검수 원문은 외부 ch1-main-warrior-attack-20261007/validation-receipt.json에 epoch별로 보존한다. 최종 game SHA는 8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2, sparse 한정 원문은 9440B/637d3d33c0c3d861c3902f3da808ca07d5ffa1e8c588beefde14c4b9dcdc9f7a이다. docs 전체 무제외 관련 검색45경로 중 현재정본13을 동기화하고 역사·타모드·owner WIP·보호2_3의32경로는 그대로 보존했다.

### ROOT-CH1-NATURAL-SPAWN-VISIBILITY-20261007 — 최종 소스의 새 실화면 관측

앞선 2a052 공격4조건/금빛FX 가림과 별개로, 최종 game4058588B/8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2에서 새1Chrome/context/page·3조건 PASS/FAIL0/미도달0/exit0을 관측했다. 기존 공격4조건·CPU100PASS1FAIL·sparse 한정6PASS를 재실행하거나 합산하지 않았다.

실제 LMB 후 W 입력 동안 document focus=true/BODY, BINDS.up=KeyW, trusted keydown/up, K/KH=true→false, frame57→137을 기록했고 P.y7420→7200.653340000013으로 이동했다. 이번 관측은 정상 이동의 한 사례이며 이전 W 무이동 원인은 여전히 UNKNOWN이다. G._bonfire.t243→0/frame57→300의 자연 종료를 기다렸으며 FX·시간·위치 강제 변경0이다. 최종 own-index guard의 정상 dense 공격 한 장면도 본편에서 도달했다. sparse/inherited 음수 경계는 CPU6조건 범위다.

root가 자연 종료 후 idle/strike PNG2를 직접 판독했다. 전사의 몸과 하단 다리·발 주변은 해당 pose에서 식별되나 평면 baked 지면·공격FX/인접 적 가림은 남는다. VISUAL VERDICT: RETOUCH. 전체 동작의 해부학적 접지·8방향·회수 rig·DS ghost·실높이·같은후보 native6·청취·실보상save·A급 인수는 미완료다. 원 source/PNG/scene/nav/세이브는 보존했고 POSTmats1은 서버 도달 전에 차단했다.

외부 원문: ch1-main-warrior-attack-20261007/natural-visibility/result.json36127B/287d70769f01f02651e9aec4a4b2911a03f6898c1125fa05649376b29acd3f53. 이 별도 관측은 기존 코드 완료18cc60d5806c8e82c0295e1bdbbb50ba89d00278에 대한 추가 증거이며 새 제품 코드 변경0이다.
