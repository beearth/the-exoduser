# 공통 아틀라스 클립 런타임 — 2026-10-09

`tools/2_5d/atlas-clip-runtime.mjs`는 에디터와 본편이 같은 원화 시트·클립·프레임 계산을 소비하기 위한 ES module이다. RAF, wallclock, RNG, 이미지 로딩, 그림 그리기, 프레임 복제는 수행하지 않는다. 호출자가 기존 게임/편집 시간(초)을 전달한다. 24프레임이나 256프레임을 상한으로 고정하지 않는다.

## 공개 계약

| API / 필드 | 정확 계약 | 적용 위치 |
|---|---|---|
| `createAtlasClip({columns,rows,frameCount,fps,loop})` | `Object.freeze`한 클립 반환. 같은 module instance의 factory가 만든 클립만 sampler/rect에 전달 | 시트 메타데이터를 로드/편집한 시점 |
| `columns`, `rows`, `frameCount` | 각각 양수 safe integer. `columns*rows`도 safe integer. `frameCount<=columns*rows` | 아틀라스 셀 용량, 실제 재생 프레임 수 |
| `fps` | finite Number, `>0`; 프레임당 시간=`1/fps`초 | 독립 원화 프레임 재생 속도 |
| `loop` | boolean, 생략시 `false` | 반복 여부 |
| `durationSeconds` | `frameCount/fps`; 극히 작은 유효 fps로 계산값이 Infinity이면 finite 시간으로 종료하지 않음 | 클립 길이 |
| `sampleAtlasClip(clip,elapsedSeconds)` | `{frame,nextFrame,mix,ended}` 반환. `elapsedSeconds`는 finite Number이며 `>=0` | 기존 장판/에디터 누적 시간만 전달 |
| `frame` | 0기준 row-major; 왼쪽→오른쪽, 위→아래. 남는 grid 셀은 재생하지 않음 | 현재 원화 셀 |
| `nextFrame` / `mix` | 현재→다음 셀 / 셀 사이 위치 `[0,1)`; 현재 caller가 보간·crossfade 여부를 결정 | sampler는 이미지를 합성하지 않음 |
| once 종료 | `t>=durationSeconds`이면 `frame=nextFrame=frameCount-1`, `mix=0`, `ended=true`. 마지막 셀 재생 중에도 `nextFrame`은 마지막 셀 | 한 번 재생 |
| loop | 시간을 `durationSeconds`로 modulo한 뒤 프레임 위치를 계산. 마지막 셀의 다음은 0, `ended=false` 항상. 정확한 끝은 0번 셀 | 반복 재생 |
| `getAtlasFrameRect(image,clip,frame,inset=1)` | `{sx,sy,sw,sh}` 반환. frame은 `[0,frameCount)`의 safe integer | Canvas/WebGL source crop |
| 원본 dimensions | `naturalWidth` 또는 `naturalHeight` 필드가 있으면 두 intrinsic 필드만 사용. 둘 다 양수 safe integer; 0일 때 CSS width/height로 대체하지 않음. natural 필드 없는 canvas/bitmap은 `width/height` 사용 | 디코드되지 않은 이미지 거부 |
| 실제 이미지 용량 | `width%columns===0`, `height%rows===0`; cell 크기=`width/columns`,`height/rows` | 메타데이터만 올린 가짜 프레임 용량 거부 |
| `inset` | 기본 1px; finite Number, `>=0`, `inset<cellWidth/2`, `inset<cellHeight/2`. 0·분수도 유효 | 이웃 셀 샘플링 경계 여백 |
| crop 공식 | `sx=(frame%columns)*cellWidth+inset`, `sy=floor(frame/columns)*cellHeight+inset`, `sw=cellWidth-2*inset`, `sh=cellHeight-2*inset` | 원본 셀 바깥을 읽지 않음 |
| 오류 | factory 출신 클립/이미지 object/loop 타입 오류는 TypeError. 수치·용량·시간·frame·inset 오류는 RangeError | 유효하지 않은 입력은 fallback caller가 처리 |

JS Number 연산의 기존 부동소수점 정밀도를 사용한다. 별도 epsilon snapping으로 원화 시간을 바꾸지 않는다. 모듈은 원화 셀의 독립 그림 여부를 판독하지 않는다. **24개 이상 실제 원화·에디터/본편 연결·시각 품질 인수는 asset/consumer 담당의 별도 검수 항목**이다.

## 드루이드 독액장판 기존 시간·소비 지점

아래 값은 이 런타임 작업 시작시 확인한 기존 구현 계약이다. 이 모듈 자체는 보스 공격·경고·피해·수명·범위를 수정하지 않는다.

| 지점 / 변수 | 기존 구현 | 공통 런타임 연결 입력 |
|---|---|---|
| `G._lavaPools` / `lp.t` | update에서 `lp.t+=sp`; 게임 물리 60Hz 프레임 단위. 피날레 3개, `r=150`, `maxT=300`, 전조 `warnT=55/73/91` | `lp.t/60`초 |
| `G._poisonPools` / `pp.t` | update에서 `pp.t+=sp`; poisonTrail `r=175`, `maxT=240` | `pp.t/60`초 |
| 일반 lava/poison render | si0/si3의 `_drawDruidGroundRing` SVG가 aoe 시트 fallback보다 먼저 선택됨 | 새 유효 clip 소비를 정적 SVG 앞에서 연결해야 함 |
| `_drawDruidFinalePool` | SVG 우선, 실패시 기존 aoe 4열×2행/8프레임 fallback. `min(7,floor(t/maxT*8))` | 새 clip 소비를 별도 root consumer 작업으로 연결 |
| 기존 fade·alpha·판정 | 기존 caller 소유 | 런타임에서 새 fade/범위/피해를 추가하지 않음 |

기존 피날레 정본은 [다크드루이드 데모 피날레](../8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md)의 해당 최신 계약을 따른다. 기존 8셀은 이력·fallback이며 실제 24원화의 완료 증거가 아니다.

## 작업·검증 범위

| 항목 | 상태 |
|---|---|
| 소유 변경 | 신규 runtime 1개와 이 정본 1개. 본편·에디터·asset 파일 수정 없음 |
| 사전 보존 | 신규 파일 2개의 working/HEAD 부재, realparent/symlink 검사를 외부 E의 `runtime/prechange.json`에 기록. 기존 바이트가 있으면 작업을 중단하므로 기존 파일 덮어쓰기 없음 |
| 의미있는 첫 Node 검증 | 최초 1회 실행, 7그룹/193 assertions PASS, FAIL 0, exit 0. 24셀 경계·once 종료·loop wrap·불규칙 dt·512프레임 허용·입력 오류·통제 image dimensions/grid/crop 경계를 외부 E의 `runtime/runtime.test.mjs`와 `runtime/test-result.json`에 기록 |
| 기존 검사 재실행 | 0. 이 신규 모듈에 대한 첫 suite만 실행 |
| 생산 인수 경계 | 통제 Node 수치/API 검증. 실제 이미지 디코드, 본편 native/정상줌·성능·청취·save·A급 검수는 미인수 |

외부 E는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/engine-poison-puddle24-20261009`이다. 소유 patch·inverse exact·owned projection을 E의 runtime 작업 영수증으로 남긴다. 다른 작업자의 변경을 되돌리지 않는다.


## 2026-10-09 — 엔진팀 · 독액장판24 공통 리소스

`ROOT-ENGINE-POISON-PUDDLE24-20261009`: 사용자 직접 승인으로 엔진 런타임·애니메이션·에디터3담당과 ROOT 통합을 실제 진행했다. 실제24기포 원화·768px 6×4/fps24/looptrue 공통JSON을 에디터와 main si0/si3/피날레 장판이 소비하며 Godot SpriteFrames/AtlasTexture loader를 작성했다. [현행 수치·시간·crop·Godot·검수 계약](../5.1임펙트디자인/DRUID_POISON_PUDDLE24_ENGINE_20261009.md). 기존 SVG/aoe8셀은 실패 폴백, chaseAoe/groundFissure·전투/save/원PNG는 유지. 다른보스/캐릭터 전체24/새3D/전체Godot이식 완료는 아니다. controlled actualPNG Canvas 검수와 본편 정상줌/성능/청취/save/A급은 구분하며 **VISUAL VERDICT: RETOUCH**. 같은완료검수 반복0. 최종 보존은 외부 `engine-poison-puddle24-20261009/completion.json`.

위 “기존 시간·소비 지점” 표는 작업 시작시 이력이다. 현행 본편은 새clip 우선이며 기존SVG/8셀은 실패 폴백이다. API3개는 동일하다.


## 2026-10-09 — 독립 ORB24 공통 엔진 연결

`ROOT-ENGINE-DRUID-ORB24-20261009`: 실제 `G._druidOrbs`만 새6×4/24셀/640px, fps300/7·loop .56초로 표시한다. `o.t/60`과 기존R=r×2.4·접촉/피해/반사불가를 유지하며 원본4×2/8셀·벽시간70ms는 실패 폴백이다. [현재 원화·리소스·시간·검수 계약](../5.1임펙트디자인/DRUID_ORB24_ENGINE_20261009.md). 기존 장판24·blackBean Q전용·SFX/save 불변. 마지막→첫 연결/실보스전·GPU·정상줌·청취/save/A급은 RETOUCH/미인수.


## 2026-10-09 — 독탄 접촉24 공통 엔진 소비

`ROOT-ENGINE-DRUID-POISON-HIT24-20261009`: 새6×4/24셀 one-shot을 fps60·age/60으로 첫24틱(.4게임초)에 소비한다. 새셀1회, 미준비·실패는 기존8셀 보간 폴백이며 전체72틱 잔향·r120·작은 핵·최대6파편·첫5틱 섬광·전투/Q/RNG/SFX/save는 유지한다. [현행 리소스·수치·폴백·검수 정본](../5.1임펙트디자인/DRUID_POISON_HIT24_ENGINE_20261009.md). 원화24장 검수와 실제 첫 화면에서 전24셀 표시 인수는 구분한다(첫age1 가능). 이번 native/실보스전/GPU/성능/청취/save/A급은 미인수, **VISUAL VERDICT: RETOUCH**. 기존8셀/native 기록은 당시 구현 이력이며 현재 새24검수로 합산하지 않는다. 외부 `engine-druid-poison-hit24-20261009/completion.json` 최종.


## 2026-10-10 — Druid 뿌리 분출48 본편 표시 소비

기존 `bossDruidErupt`의 `druid_roots` 표시만 새48셀 아틀라스로 연결했다. 원본10셀·frameTime7·종료/렌더 진행·budget5·cull·GL·Canvas 폴백과 전투 계약은 유지한다. 새 resource `8×6 / frameCount48 / fps288/7 / loop=false`의 시간은 기존 `(frame+fraction)/maxFrames`로 매핑한다. 명목70 렌더 진행 단위이며 안정된 게임 초·48FPS·자연 재생 중 모든 셀 노출을 뜻하지 않는다. 공통3API는 변경0. durationSeconds=7/6은 리소스의 표현 단위이며 기존 효과 phase에 재매핑된다. 실제 normal zoom/전체 전투/동시 효과 성능·GPU·청취·save는 미인수, 독립 Canvas 검토만 별도 기록한다. 보스전 밖의 효과도 필요한 장수를 사용하되 실제 성능 확인 전 전체 교체·렉 없음·AAA급 완료로 표시하지 않는다. [정본](../5.1임펙트디자인/DRUID_ROOTS48_ENGINE_20261010.md).


## 2026-10-10 — Druid 중앙 임팩트24 본편 표시 소비

actual main druid_hit의4caller(드루이드 추적장판 폭발·균열 종착·ORB 폭발·bossDruidErupt 중앙 분출)가 새24셀을 소비한다. 기존 frame/maxFrames8/t/frameTime normalized phase, scale/angle/alpha·GLadditive/Canvaslighter·cull/budget5/종료·전투/RNG/save는 불변이다. 리소스6×4/24/fps180/7/loopfalse를 기존 진행에 재매핑하며 speed3은명목24, speed7은명목56render진행 단위이다. 안정게임초·24FPS·모든셀 자연노출 보장은0. 원본362×543/8셀은pending/실패 폴백으로 유지한다. 독립Canvas proof는본편정상줌·전체전투·GPU·동시성능·청취·실save·AAA인수와 구분하며 RETOUCH다. 다른임팩트도 필요한장수를 사용하되 성능검수전 렉없음·전체교체완료 주장은0. [정본](../5.1임펙트디자인/DRUID_HIT24_ENGINE_20261010.md).


## 2026-10-10 — Druid 땅굴 진입·이탈 링24 본편 표시 소비

actual main burrowStrike의 땅굴 진입·이탈 druid_dust 2caller가 새24셀 링을 소비한다. 원등록256×256/8셀8열·frameTime7·명목56render진행·기본 표시 진입2e.r/이탈2.6e.r·새링 draw×1.2(2.4e.r/3.12e.r)·원8폴백×1·원본중앙여백 정체성(후기 입자 미인수)·angle0·alpha/GLadditive/Canvaslighter·종료/cull/budget5/압축은 보존한다. 리소스6×4/24/fps180/7/loopfalse는 기존normalized phase로 매핑하며 새clock0/24FPS·안정게임초·모든셀 자연노출 보장0이다. 원8셀 pending/실패폴백·전투/RNG/save/SFX/원PNG 유지. 독립 actualmain helper Canvas proof는 본편 정상줌/전체전투/GPU/동시성능/청취/실save/AAA 인수와 구분한다. 다른임팩트도 필요한장수를 사용하되 성능검수전 렉없음·전체교체완료 주장은0. [정본](../5.1임펙트디자인/DRUID_DUST24_ENGINE_20261010.md).


## 2026-10-10 — Druid 뿌리 충격링24 공통 본편 표시 소비

actual main druid_shockring 공통ID는 새24실변화 원화를 소비하며 원512²×8열8장은 pending/실패 폴백이다. 네 실제 caller: _reviveDruidFinale 및 _bossPhaseCheck의막전환 scale=e.r*3/256/frameTime5/표시6e.r/명목40진행, _finishDruidFinale 승리 scale=max(.5,e.r*4/256)/frameTime6/표시max(256,8e.r)/명목48진행, updateE bossShockWind 종료(stage0/3) scale=e.r*2.5/256/frameTime7/표시5e.r/명목56진행. resource6×4/24/fps180/7/loopfalse를 caller별 normalizedphase로 매핑하므로 모든caller56/24FPS/안정game초 보장0이다. 기존guard·worldcenter/angle0/isSkillfalse·alpha·GLadditive/Canvaslighter·종료/cull/budget5/압축·producer·전투/RNG/SFX/save/원PNG 유지. 독립 actualmain helper Canvas proof는 actualnormalmain/정상줌/전체전투/GPU/동시성능/청취/실save/AAA 인수와 구분한다. 현재시각판정과 원화규격·실제검수는정본참조. 과거검수/전투수치 이력은유지한다. [정본](../5.1임펙트디자인/DRUID_SHOCKRING24_ENGINE_20261010.md).


## 2026-10-10 — 보스 유성 착탄24 본편 표시

bossMeteor의 기존 동작·전투값을 유지하며 착탄 표시 boss_meteor_hit(24장)을 새로 연결했다. [실제 producer·리소스·폴백·검수 정본](../5.1임펙트디자인/BOSS_METEOR_IMPACT24_ENGINE_20261010.md). 실제 전체 보스전·동시 성능 미인수, VISUAL RETOUCH.


## 2026-10-10 — 보스 내려찍기 착지24 리소스 재사용

실제 bossSlam 착지 중심150²에 기존 boss_meteor_hit24를 재사용한다. 원shock/피해·26파티클/RNG66·recover40/복귀receipt·공통cap20을 유지하며 새그림·이미지·등록·runtime변경0. 이전 복귀 단위의 FX불변은 당시 변경 이력이다. [현재 소비·시간·검수 정본](../5.1임펙트디자인/BOSS_SLAM_IMPACT24_ENGINE_20261010.md). 이번 실제150px/전투·동시성능은 미검수, RETOUCH/UI_NOT_ASSESSED.


### 2026-10-10 보스 점프 착지의 선택 임팩트24

bossJump 착지의 기본 피16만 이미지 ready 시 기존 중성 지면24로 단일 교체한다(겹침0·미준비16 폴백). 중앙150²/speed2/angle0/defaultalpha1이며 원 `_partCnt<=300`·angle RNG·흰 링/flash·음향·경고/판정300·후속 충격파를 보존한다. [현재 정본](../5.1임펙트디자인/BOSS_JUMP_IMPACT24_ENGINE_20261010.md). 실제150px/정상줌 전투·동시성능은 미검수, VISUAL RETOUCH/UI_NOT_ASSESSED.


### 2026-10-10 보스 돌진 벽충돌의 중성 지면24

nonfinal `bossCharge`의 세 `canMv` 시도 모두 막힌 분기에 기존 `boss_meteor_hit`24/중앙150²/speed2/angle0/defaultalpha1 요청1회만 연결했다. 원 shockMax800/bossShock20·카메라25·SFX 및 이동·피해·RNG/save를 보존하며 Finale·단축 미끄러짐은 제외한다. 새원화 제작이나 원8장 교체가 아니다. [현재 정본](../5.1임펙트디자인/BOSS_CHARGE_WALL_IMPACT24_ENGINE_20261010.md). 실제 전투·동시성능 미검수, VISUAL RETOUCH/UI_NOT_ASSESSED.


### 2026-10-10 보스 사망 혈흔24

actual isBoss=true blood만 새640셀24원화로 표시하고 원16 alias·128×scale geometry/speed6·명목96진행/RNG/basealpha1.5·사망/음향/save를 보존한다. ready 지면override가우선/false몹16/새clip실패원16generic폴백. 새ready는Canvas source-over한셀(유효alpha clamp), 원GLadditive폴백은불변. [현재 정본](../5.1임펙트디자인/BOSS_DEATH_BLOOD24_ENGINE_20261010.md). clip15FPS/1.6초는reference이며 실제게임시간 보장0; 새RGBA37.5MiB·원1MiB는정적환산/peak미검수. 실제보스전·성능/AAA미인수, VISUAL RETOUCH.


### 2026-10-10 보스 화염비 용암24

실제main fireRain착탄만 boss_lava_erupt24/640셀/6×4/32FPSreference.75초로표시하고 원9alias/768geometry/speed5·명목45진행/지면(.5,.75)/alpha.85·전투/RNG/save를유지한다. fireRain시작prefetch/초기자동로드0/sharedImage1·실패자동retry0. 새readyCanvaslighter한셀/원9generic폴백; elite·DarkPillar원9·easy-test미반영. [현재 정본](../5.1임펙트디자인/BOSS_LAVA_ERUPT24_ENGINE_20261010.md). 새RGBA37.5MiB/원20.25MiB는정적환산/실peak·동시성능미검수. actualmain/정상줌/전체보스전/AAA미인수, VISUAL RETOUCH.


## 2026-10-10 — 화마귀 fdEnergy 비행 용암구24

실제 fdEnergy 비행만 새6×4/24 원화를 lazy 공유Image1로 소비한다. 원 성공render counter+.22/16주기·240²/중심/lighter·원16폴백과 Druid 파생재료·전투/Q/save를 유지한다. resource19.8FPS는60render/s 가정 참고값이며 안정게임초·24FPS 보장0. 원life320은 화면근처 life1 연장이 있어 고정종료수명이 아니다. 독립source/Canvas 검수와 actualmain·동시성능 인수를 구분하고 현재 RETOUCH다. [정본](../5.1임펙트디자인/FIREDEVIL_ORB24_ENGINE_20261010.md).


## 2026-10-10 — 크라켄 fbEnergy 비행 물구체24

실제 fbEnergy 비행을 새6×4/24/640² 물구체 원화와 lazy 공유Image1로 연결했다. 원16폴백/240²/중심/lighter/alpha1·pass2가시counter+.12÷16주기(helper증가0)·전투/Q회수5·접촉/SFX/save를 유지한다. resource10.8FPS는60가시render호출/s 가정의참고값으로24FPS·안정게임초 보장0. 원life320은화면근처1연장이있어고정종료아님. actualwhole source와독립Canvas의24셀·문맥복원검수는통과, 약6%반경·포말인접점프/루프자연연결·actualmain·동시성능은RETOUCH/미인수다. [정본](../5.1임펙트디자인/KRAKEN_WATER_ORB24_ENGINE_20261010.md).


## 2026-10-10 — 보스 물 에너지탄 접촉·Q 물보라24

크라켄 fbEnergy+EL.I 접촉(r220/90·최대660²)과 waterEnergy Q(r96/72·최대288²)만 bossWaterImpact 새24원화로 연결했다. 원공용 waterImpact16/물반사탄적중·waterBean·원전투/RNG/SFX/save는유지한다. 기존 t/mt·성장/alpha·부모합성상속/lazy Image1/원16폴백, resource16FPS는참고값이다. actualwhole source·독립Canvas·editor의 검수범위와 시각RETOUCH는정본을따른다. actualmain/정상줌/동시성능/청취/save未인수. [정본](../5.1임펙트디자인/BOSS_WATER_IMPACT24_ENGINE_20261010.md).


## 2026-10-10 — 화마귀 불탄 접촉 임팩트24

actual _fbEnergyBoom의 fdEnergy&&EL.F 접촉만 bossFireImpact 새24/640²로 연결했다(r220/90·최대660²). 일반fire16/Q/기존비행24·물보스24와전투/RNG/SFX/save는유지한다. t/mt·3r성장/alpha·부모blend상속/lazyImage1/원16폴백, resource16FPS는참고값이다. actualwhole source·독립Canvas·editor 검수와시각RETOUCH의세부범위는정본을따르며 actualmain/정상줌/동시성능/청취/save未인수다. [정본](../5.1임펙트디자인/BOSS_FIRE_IMPACT24_ENGINE_20261010.md).


## 2026-10-10 — 화마귀 Q 불탄 임팩트24 연결

fdEnergy&&EL.F의 전용 Q 표시를 bossFireQImpact로 연결했다. 기존 승인 fire24·공유Image1을 재사용하며 새그림·리소스등록·JSON은 추가하지 않는다. 원Dark02의 r80/72·최대240²·Q반사5/자원×10/44armRNG·공통효과를 유지하고, 새ready는24 한셀·미준비/실패는원Q Dark16이다. 정상줌·실전시각·동시성능未인수/UI_NOT_ASSESSED RETOUCH. [정본](../5.1임펙트디자인/BOSS_FIRE_Q_IMPACT24_ENGINE_20261010.md).
