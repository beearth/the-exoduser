## 2026-09-29 — CH1-1 공통 피부 바닥87차

사용자 최신 지시: 바닥의 구역별 얼룩·색 차이를 줄이고, 사용자 스크린샷 `2026-09-29 093252`의 촘촘한 피부 결·얕은 주름을 공통 기준으로 유지한다. 현행 배경 cache/bakeVersion **20260929-floor-87**, living module **20260929-87**, retouch **22레이어**다. 기존53점 경계·8구역·8192² master/8000² world·64청크(core1024/bleed1/1026²)는 유지한다. 보행 바닥31826023px/47청크 변경, 비보행 외곽 변경0, 보호한 뿌리 중심681744px 변경0. 구역별 정적 피부막5종은 공통 palette #353032/#3d3535/#353032와 frame alpha .30; 큰 얼룩12개/alpha .06 또는 .04, 미세입자9500개·얕은 주름23개 유지. 추가 runtime draw·상주 canvas0/geometry·충돌 변경0.

[87차 현재 수치·출처·MAP PRODUCTION REPORT](CH1_FLOOR_UNIFICATION_PASS87_20260929.md). 아래86차 이하의 모듈 버전·배경 버전·구역 팔레트·얼룩28개·합성 .82/.76/.60 등은 해당 제작 당시 이력이다. 기존 동맥·늪·버블·사목 움직임과86차 유휴 캐시 준비 계약은 유지한다. **바닥 재질 VISUAL VERDICT: PASS / 전체 맵 RETOUCH**.

## 2026-09-29 — CH1-1 피부–사목 접합85차 적용

현행 cache/bakeVersion은 **20260929-outer-85**, 빌드 레이어는 **21개**다. 서측 하단의 피부 바닥–사목 어깨를 낮은 부패 수피·괴사막으로 연결했다. 비보행101764px만 변경/보행0/고목 핵심 보호3579735px 변경0, 변경chunk1_6 1개·동일63개. 새로고침한 본편8기본 카메라+접합·전투2위치, 이벤트 기반 S/W 이동·24적 공격/Q, 게임error·contextloss0/64청크 응답실패0. 기존 회귀55PASS,21레이어 전체 마스터 재현·224경계 동일. 새 모션0/geometry·충돌 변경0. 전체 **VISUAL VERDICT: RETOUCH**.

[85차 수치·출처·MAP PRODUCTION REPORT SSOT](CH1_OUTER_CONNECTION_PASS85_20260929.md). 아래84차 이하의 '현행'은 당시 제작 이력이다.84차의 미완료 문구는 저장된 최종 검수로 보정했다.

> 2026-09-28 현재 72차: 남측 시작 오른쪽 비보행 외곽에 낮은 부패 목질·수피판·검은 공동을 부분 반영했습니다. 중심 tile[129,181], master/3청크(cache `20260928-outer-72`), 433,965픽셀 변화·보행 픽셀 변경0. 후보 전후7·일반 본편35카메라·오류0·회귀8 PASS, 64청크/224경계 strip 및 skin65→outer66→outer67→outer68→outer69→outer70→outer71→outer72 helper 전체 재현. 늪 버블·가스·동맥 유지. 전체 VISUAL VERDICT RETOUCH; 아래 이전 현행 표기는 당시 이력이며 production SSOT의72차 MAP PRODUCTION REPORT가 우선합니다.

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

> **2026-09-17 리터치 이력:** bake/cache `20260917-depth-2`. 신규 숲 원화 4종, 고정 외곽 42배치와 낮은 뿌리 9배치. CH1-1 hand `m_c1tree`만 화면 크기 0.72 / pivotY 0.72; 원본 metadata 1450 및 충돌은 유지. geometry/START/EXIT/진행 계약 유지. 최신 시각 판정 **RETOUCH**. [실제 화면·영상·검증 한계](CH1_1_DEPTH_RETOUCH_20260917.md). 아래 ground-2와 이전 PASS는 당시 이력이다.

> **48차 현행(2026-09-27):** 정상부/ramp surface 합성에 alpha 실루엣 기반 그림자 rgba(10,9,12,.32), blur20, offset(0,18) 추가. 정적 언덕 캐시에만 적용. [적용 범위·검증](CH1_HILL_DEPTH_PASS48.md).


> **47차 현행(2026-09-27):** 제단 정상부·ramp floor 반복 크기 round(_gtTileSz(floor)×1.4), texture에만 saturate(.7)/contrast(.92)/brightness(.92) 적용. 공통 월드 원점·46차 윤곽·44차 feather 유지. [현행 수치·검증](CH1_HILL_MATERIAL_PASS47.md).


> **46차 현행(2026-09-27):** 정상부의 정확한 타원을 96점 비대칭 폐곡선으로 교체. 사면 명암은 organicSkirt 전체에 적용. 44차 feather·45차 색상/월드 정렬·높이·충돌 유지. [윤곽 공식·검증](CH1_HILL_CONTOUR_PASS46.md).


> **45차 현행(2026-09-27):** 제단 사면의 갈색 radial wash를 저채도 방향광으로 교체하고, ramp 바닥을 정상부와 같은 월드 좌표에 정렬. 44차 48px alpha·높이·충돌 유지. [현행 색상·검증](CH1_HILL_SHADING_PASS45.md).


> **44차 렌더 보강(2026-09-27):** smoothing 언덕의 정상부·오르막 접합과 전체 외곽에 48px L1거리/smoothstep 알파 감쇠 적용. 캐시 1900×960 유지. 높이·충돌·서쪽ramp·원본PNG·배경청크불변. [현행공식·검증](CH1_HILL_EDGE_BLEND_PASS44.md).

> **2026-09-16 CH1-1 PRODUCTION 적용 계약 — 이전 CH1-1 배경/경계 설명보다 우선:** 사용자 최신 지시에 따라 실제 `STAGES[0]`(표시 1-1)에 고정 수작업 전체맵을 적용했다. 현행 경계는 `assets/map/ch1/production_finish/layout.js`의 53점 polygon/8구역이며, 기본 배경은 `assets/map/ch1/production_finish`다. 8192² master의 1024px core를 **월드 1000px**로 그려 200×200타일(`T=40`, 8000²) 충돌 좌표와 일치시킨다. `smoothing`은 호환 phase 이름이며 과거 smoothing 폴더를 기본 로드한다는 뜻이 아니다. `outer` query는 과거 아트 비교용으로, 현행 경계와 시각 정합을 보증하지 않는다. authored62/runtime63, hand collision21/total22, 자동 scatter0. `_CH1S1`/stage1은 별도 맵이다. START `(100.5,185.5)`, 시체나무 `(102.5,90.5)`, 북쪽 gate y5/exit y7과 진행 조건은 유지한다. 아래의 이전 outer/smoothing 수치·좌표는 **해당 날짜의 이력**이며 현행값은 [전체 제작·수치·검증 보고서](CH1_1_PRODUCTION_FINISH_20260916.md)를 따른다. 기술 PASS와 시각 판정은 보고서에서 별도로 기록한다.

# CH1-1 BLOCKOUT MASTER — 실 blockout 규격표 (Section F)

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.


> **2026-09-08 데모 피날레 예외:** `?demo`/`?bic`의 마지막 보스(si3)는 [다크드루이드 피날레 v0.2](../8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md) §0을 따른다. 전용 3막·5종 패턴, 동작별 Q독탄(48f 전조/막별1·2·3웨이브/간격30f/수명90f), 돌진·잠행 뒤96f 회복, 잠행 표적 고정, 제자리 HP페이즈 전환, 반투명 독늪을 적용했다. 이 조건의 독립 ORB·상시 리듬탄·idle 자동탄은 생성하지 않는다. 일반 si0/si3와 다른 보스의 수치·부활·Q/E 규칙은 기존 계약 유지. 아래 이전 드루이드 설명은 해당 예외를 제외한 기존 계약/이력이다.

> **2026-09-06 현행 보스 배정 우선:** 1-1(si0)은 **다크드루이드**다. 이 문서의 흑요염 파괴자 si0 배정·화염 전용 지정·`_isLargeBoss=true`는 이전 구현 기록이며 현행 배정에서 제외한다. 드루이드의 si3 전용 기술/VFX는 이제 **si0·si3 공통**이다. 원본 흑요염 에셋/음성 카탈로그는 삭제하지 않는다. 정확한 현행 계약은 `docs/4.1맵디자인+설정/CH1_1_DRUID_BOSS_ASSIGNMENT.md`를 따른다.

> **역할**: CH1-1(si0, 썩은 숲 입구)을 START→EXIT 단일 좌표/규격표로 완성. 현행은 `_MAP_COMPOSE[0].forestBoundary=1`, `handProps` 63개이며 좌표·경계는 `CH1_1_COMPOSE_초안.md` CURRENT SSOT가 우선한다.

> **2026-08-29 고지대 보충**: 우중 제단 앵커와 hill 수학은 유지한다. 이후 forest boundary에서 structural module 59개와 dead prop 1개를 제거했으므로 현행 `handProps`는 63개다.
> 아래 LOWER/CENTRAL/UPPER 번호표는 2026-08-24 gameplay blockout archive이며 현행 시각 랜드마크/프롭 배치를 뜻하지 않는다.
> **상태**: 2026-08-30. stage0 default smoothing + canonical forest tile boundary 적용. authored63/runtime64, structural0, collision23 total/22 hand.
> **맵**: 200×200 타일, T=40 → 8000×8000px. 좌표=타일(별도표기 시 px/정규화).

---

## 1. 마스터 좌표표 (START → EXIT)

| # | 요소 | 종류 | 중심(tile) | 크기 | 연결 | 근거 |
|---|---|---|---|---|---|---|
| 0 | player_start | SPAWN | 100,185 | — | →#1 | FIXED_MAPS[0] objs, spawn(100,185) |
| 1 | START 원 | START ZONE | 100,185 | empty r480px(12t) / box 86–114,170–194 | ↑#2 | _MAP_COMPOSE[0] (.50,.88) |
| 2 | s→r1 통로 | CORRIDOR | x100 | w10 | #1↔#3 | maps_data corridor |
| 3 | LOWER 분지 | COMBAT A | ~88,150 (empty .46,.75) | r880px(22t) / box 54–136,124–176 | #2,#4,#8(WEST) | r1 combat(100,155), 서쪽치우침 |
| 4 | r1→f 통로 | CORRIDOR | x100 | w9 | #3↔#5 | corridor |
| 5 | CENTRAL 분지 | COMBAT B | ~118,105 (empty .54,.51) | r1080px(27t) / box 46–158,62–146 (가로김) | #4,#6,#8,#9 | forge f(100,120) 게임플레이 중심 |
| 6 | f→r2→r3 통로 | CORRIDOR | 서88→동118→서92 | w10 | #5↔#7 | 지그재그 LOCK |
| 7 | UPPER 분지 | COMBAT C | ~92,52 (empty .48,.26) | r820px(20t) / box 56–140,22–82 | #6,#9,#10 | r2(80,85)/r3(120,50) |
| 8 | WEST POCKET | SIDE(2입구) | ~38,116 (empty .19,.58) | r520px / box 18–58,90–142 | CENTRAL(x46–58 w12)+LOWER(x48–58 w10) | 초안 LOCK 비대칭 |
| 9 | EAST POCKET | SIDE(2입구) | ~166,90 (empty .83,.45) | r500px / box 142–188,58–122 | CENTRAL(x142–158 w16)+UPPER(x142–152 w10) | 초안 LOCK |
| 10 | EXIT 접근 | GATE APPROACH | x88..112,y2..35 | 폭 25타일 funnel | #7↔#11 | `_applyCh1StartNorthGate` 보존 영역 |
| 11 | boss 게이트/exit | GATE | bossCx100, gateY5 / exits 99..101,y7 | exit 3타일 | #10→[아레나] | forest RLE 뒤 재적용 |
| L | m_c1tree | MAIN HERO | 102,90 | meta sz1450 / scale1 | 중앙 | 현행 reference focal point 1개, 1700×1500 crisp smoothing basin |
| S1 | m_c1camp | SECONDARY | 45,100 | scale1.55 | 서쪽 | 좌표·collision 불변 |
| S2 | m_c1altar | SECONDARY | 147,97 | scale1.45 | 우중 hill | hill 중심147,98·rx18/ry9·west ramp125→135 불변 |
| T1~3 | cocoon / pool / poison pit | TERTIARY | 47,50 / 167,43 / 162,139 | 1.55 / 1.55 / 1 | side | pool은 forest-mask authored exact 위치 |

현행 `_MAP_COMPOSE[0].mega`는 빈 배열이다. 과거 dragon/mega 5개 표는 `CH1_1_COMPOSE_초안.md`의 **LEGACY BLOCKOUT ARCHIVE**에만 남기며 현재 runtime 좌표로 사용하지 않는다.

**CURRENT MAIN ROUTE**: START(100.5,185.5) → 남쪽 개활지 → 중앙 시체나무 우회 → north approach x88..112 → y23.43. 실제 WASD 전 segment PASS, exits는 y7.

---

## 2. START / EXIT 오프셋 LOCK (재확인)

- START spawn(100,185) vs empty중심(100,176) = empty가 spawn보다 **북쪽 9타일**(첫 걸음 커버, 남쪽 rim 아님).
- 과거 EXIT 문(100,18)/empty중심(100,28)은 archive다. 현행은 bossCx100/gateY5, exits y7, approach x88..112/y2..35다.
- 스폰 x=100 축 유지. 분지 x오프셋(서88/동118)은 경로 굴곡, 스폰 오프셋 아님.

---

## 3. RIM (경계, 8섹터)

| 섹터 | 위치 | 내용(초안) |
|---|---|---|
| 남/남서/남동 | START 아래 | 독늪 rim, puddle |
| 서/동 | 포켓 바깥 | 절벽·뿌리 |
| 북서/북/북동 | EXIT 위 | 열린 황폐지, EXIT x100 축. mega 없음 |
- 대형 오브젝트 간격 ≥20타일. **RESERVED SWAMP** 4모서리(SW/SE/NW/NE) depth 6–12t, puddle+pit_poison 각 max1.

현행 RIM의 큰 충돌 경계는 `_buildCh1StartForestRLE(200,200)` tile wall이다. structural prop row는 0이며 visual baked mass와 map geometry를 분리한다.

---

## 4. OUTER (외곽, footprint 0)

- **OUTER-A**: RIM 너머 독늪 심연/썩은 뿌리 하단(하층 없음 — 최하층이므로 "지옥 바닥" 암시).
- **OUTER-B**: 진행 방향(북) 원경에 **벌레굴 입구 실루엣**(다음 층 목표) + 먼 거대 나무.
- **OUTER-C**: 지옥 하늘/독안개 대기.
- 전역 패럴랙스는 비활성이다. smoothing master는 build-time에 locked outer+overlay로 완성되며 runtime은 smoothing/outer 중 한 chunk set을 선택한다. canonical forest tile wall은 두 phase에 공통이다.

---

## 5. BOSS PRESENCE (사다리)

| 단계 | CH1-1 배치 |
|---|---|
| LADDER-1 실루엣 | OUTER-B에 원경(선택, 필드보스는 근접형이라 약함) |
| LADDER-2 환경반응 | 필드보스 심연의 앵글러 **맵 4마리 4각 색교체**. SW(58,158) 물 / SE(148,150) 화 / NW(52,42) 암 / NE(148,42) 뇌. HP=`(1800+lv×350)×7.5`. 홈 1000px 접근 시 개체별 꿈틀 상승 54틱. 본체 즉시 표시 없음. 지옥문 개방은 4마리 전멸+처치 80% |
| LADDER-5 아레나 | GATE(#11) 통과 → 흑요염 파괴자 아레나(`_enterBossArena` 25217) |
- **주의**: CH1-1은 **이중보스** — 필드 로밍(심연의 앵글러) + 게이트 아레나(흑요염 파괴자). `BOSS_CANONICAL_MAPPING.md §3`.

---

## 6. BOSS ARENA (별도 맵)

- `genBossArena(si=0)`: hell0 = **원형**(`_BOSS_ARENA_TYPE[0]=0`), 128×108, 중심(64,54).
- 보스 흑요염 파괴자, `_isLargeBoss=true`, HP×8/ATK×3, 5페이즈. 3D `_b3` Vinebound Sentinel(scaleMul 0.4).

---

## 7. GATE / 진행

- GATE(#11) 개방: 처치 80%(`checkRooms`, +10% 가드) **AND** CH1-1은 앵글러 4마리 전멸(`G._fbDone`). 출구타일 밟기 → `_bossLoadPhase` → 아레나. 앵글러 남으면 "심연의 앵글러를 모두 처치하라". 80% 미만이면 기존 봉인 메시지.
- 스테이지 클리어 = 아레나 보스 처치 후 아레나 출구 도달(35626). 타임어택 90%.

---

## 8. 필요 자산 / 미구현 (구현 시)

- 바닥 `assets/map/ch1/ground_dark_soil.png` 1024². `_CH_DECO[0]` 메타는 재사용하지만 자동 살포하지 않고 `_MAP_COMPOSE[0].handProps` 63개를 고정 배치한다. `lm:[]`, `mega:[]`, uni/large/scatter/floor carpet와 outer-enabled procedural wall-edge/pillar fallback은 0개다.
- **현행 CH1-1**: stage0 기본 smoothing은 locked outer 8192² 위에 별도 8192²/64-chunk overlay를 합성한다. `ch1StartPhase=outer`는 outer-only 비교, `ch1StartOuter=0`은 전체 OFF 비교다. 전역 패럴랙스·늪 전이타일(auto-tile)·전경 occluder는 여전히 미구현이다.
- 참조 이미지: `compose_ch1/blueprint_1-1.png`, `minimap_1-1.png`, keyart `1-1_forest_gate.jpg`.

## 9. 개활도
- PLAY∪포켓 65~72%, RIM+swamp 28~33%. ASCII blockout 전문 = `CH1_1_COMPOSE_초안.md §ASCII`.

## 10. START COMBAT — 다안 육괴 (2026-09-04)

START의 negative space·collision·landmark를 바꾸지 않고, 초반 전투 읽기만 추가한다. `stage 0`에서 플레이어 실제 시작 타일을 원점으로 삼아 `(-13,-18)`과 `(+13,-21)`에 중형 다안 육괴를 각각 1마리씩 생성한다. 두 위치는 `T=40`에서 시작 안전반경 500px보다 각각 약 888px/988px 멀다. 따라서 200×200 canonical 좌표에서는 `(87.5,167.5)`와 `(113.5,164.5)`가 되며, 런타임 map variant에도 안전하게 따라간다. 시작 카메라에서는 숫자 없는 `4×8` Eye Slime 시트를 세로 `240~252px`로 표시한다. 예시 첫 행은 제외하고, 매 프레임 플레이어 쪽 8방향 행과 상태 frame 열을 선택하며, 본체는 실제 상하 경계 기준으로 중앙 정렬돼 숫자·배경·행 경계·이웃 셀 잔여 조각은 보이지 않는다. 전체 몬스터·렌더링 계약은 `docs/8.0몬스터디자인/CH1_1_START_다안육괴_중형몬스터.md`를 따른다.

## 11. CODE CHANGE
`MAP_ALL_FLOOR=false`와 `forestBoundary:1`로 stage0 geometry가 변경됐다. baked master/landmark 좌표는 유지하며 경계·수량은 `CH1_1_COMPOSE_초안.md`, 시각 runtime은 outer/smoothing SSOT를 따른다.
