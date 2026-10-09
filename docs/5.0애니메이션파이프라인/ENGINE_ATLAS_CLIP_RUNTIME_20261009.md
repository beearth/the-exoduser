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
