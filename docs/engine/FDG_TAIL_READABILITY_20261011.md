# 지옥기형 꼬리치기 가독성 r5 — 2026-10-11

현재 상태: 보이는 원화 범위의 꼬리치기 동작 보정과 실제 장면 검수 완료. 이번 가독성은 VISUAL VERDICT PASS, 전체 모델은 RETOUCH다. r2/r3/r4의 인수된 구현·fixture·검사·증거는 보존한다.

## 바뀐 동작과 범위

기존 tail9의 world 회전 상쇄 때문에 distal curl가 준비와 타격에서 거의 같은 C형으로 남았다. 위치 bake와 다리 경계는 유지하고 tail9의 world 회전 목표, tail10..15의 상대 굽힘·시차, 흉곽→머리→팔의 키 타이밍을 저작했다. 준비의 역방향 감기 뒤0.780..0.900초에 빠르게 풀리며,0.980초 관성과 회복의 작은 반동을 거쳐1.800초에 bind로 돌아온다.0.900초는 기존 데모 임팩트 발동 기준이다.

| 항목 | r5 현행 계약 |
|---|---|
| 권한 / 모델 | ENGINE_AUTHORING / 승인 PNG의 보이는 표면만 있는2.5D texture mesh |
| source | assets/sprites/boss/stage1_codex_hell_aberrant.png / 832×1248 / 편집·새 image 생성·이번 source 재분석0 |
| mesh / skeleton / weights | 기존3864vertices / 4850triangles / 32bones / UV·layer·weights·bind·27cap pins 변경0 |
| rig ID | hell-aberrant-tail-swipe-readability-r5 |
| scene ID | hell-aberrant-tail-readability-scene-r5 |
| sequence ID | hell-aberrant-tail-readability-impact-r5 |
| 배송 rig / scene | tools/fdg-studio/fixtures/hell-aberrant-tail-readability.rig.json / hell-aberrant-tail-readability.fdg.json |
| raw compact bytes | rig713092 / scene820009 / 기존 rig2MiB·project4MiB 상한 유지 |
| builder | tools/fdg-studio/build-hell-aberrant-readability.mjs / 기존 r4 JSON만 읽어 clone / 원본 PNG read0 |
| standalone / inline | 전체 rig JSON deepEqualtrue |
| clips | tail-swipe-loop=true / tail-swipe-once=false / 모두3seconds·24FPS·20tracks |
| 변경 트랙 | body4 + tail9..15 7 =11tracks / 각17keys |
| 보존 트랙 | tail0..8 9tracks / 기존9keys [0,.35,.65,.9,1.08,1.4,1.8,2.4,3] |
| 17 key times seconds | [0, 0.2, 0.45, 0.6, 0.65, 0.72, 0.78, 0.84, 0.9, 0.98, 1.08, 1.25, 1.4, 1.6, 1.8, 2.4, 3] |
| 프레임 구분 | clip24FPS는 저작 기준. 새로운 raster24장·본편24FPS 성능 인증으로 승격0 |
| legs / pivot | pelvis·leg tracks 없음 / tail9 source[342,980] 위치 bake / key 사이 기존 보간, 연속 constraint 추가0 |
| native 보호 | attack window0.15..0.85progress / cooldown110gameframes / phase2 projectile life200gameframes / recover30gameframes / rec50gameframes / 변환0 |
| 일반 장면 | 기존 owner60Hz·pool1024·image cache·drawImage 소비 / 새 schema·timer·RAF·기능·CPU 공사0 |
| 배치 / camera / map | node[4150,7360,0] scale80 / camera[4150,7220] followfalse yaw0 pitch0 / 200×200 T40·geometry/collision/nav 변경0 |

## 정확한 저작 수치

아래 Z축 회전은 XY평면의 radians이며 translation은 model units다. body4와 tail10..15 translation XYZ는 모든 키에서[0,0,0]이고 X/Y회전은0이다.0.2초에서 흉곽/머리는 움직이고 forearm은0으로 남아 시작을 늦춘다.

| body boneId | 위17시간 순서의 Z radians |
|---|---|
| spine | [0, 0.025, 0.08, 0.1, 0.1, 0.075, 0.015, -0.12, -0.1, -0.07, -0.04, 0.025, 0.03, 0.01, 0, 0, 0] |
| head | [0, -0.015, -0.045, -0.06, -0.055, -0.025, 0.015, 0.05, 0.04, 0.025, 0.015, -0.01, -0.005, 0, 0, 0, 0] |
| leftArm | [0, 0.005, 0.045, 0.09, 0.11, 0.11, 0.075, -0.025, -0.08, -0.065, -0.025, 0.025, 0.015, 0, 0, 0, 0] |
| leftForearm | [0, 0, 0.035, 0.09, 0.115, 0.12, 0.12, 0.025, -0.06, -0.07, -0.02, 0.035, 0.015, 0, 0, 0, 0] |

tail9 parent=tail8의 현재 world XY와 Z각 θ를 기존 evaluator로 계산한다. bindPivotWorld=[−158/300,160/300]model units, bindLocalT는 승인 skeleton값이다. localT=R(−θ)×(bindPivotWorldXY−parentWorldXY)−bindLocalT, localZ=authoredWorldZ−θ다. 기존 위치 보상과 새 world 회전 목표를 ordinary keys로 저장한다.

| seconds | tail9 baked translation XYZ model units | local Z radians | target world Z radians |
|---|---|---|---|
| 0 | [0, 0, 0] | 0 | 0 |
| 0.2 | [-0.029743296320701662, 0.13466429321349413, 0] | -0.08612784408295796 | 0.035 |
| 0.45 | [-0.04173444267473292, 0.2948414663282993, 0] | -0.059078328082777465 | 0.2 |
| 0.6 | [-0.03849808795334658, 0.3786887194084886, 0] | -0.009736438245662782 | 0.32 |
| 0.65 | [-0.03597939085298557, 0.40679913907372245, 0] | 0.006711163053916003 | 0.36 |
| 0.72 | [-0.025218276604152434, 0.12357204313615888, 0] | 0.24732332188707168 | 0.36 |
| 0.78 | [0.04014672861611179, -0.10096763276438392, 0] | 0.3935642900668189 | 0.3 |
| 0.84 | [0.15150247132069594, -0.29817692710381755, 0] | 0.19980510197856796 | -0.1 |
| 0.9 | [0.3013974768140971, -0.4596127448477259, 0] | 0.006043882591847405 | -0.5 |
| 0.98 | [0.19826371150291816, -0.3581026485531364, 0] | -0.2089005321692401 | -0.58 |
| 1.08 | [0.0910294814112648, -0.20814284513223436, 0] | -0.17758244696326098 | -0.38 |
| 1.25 | [0.02716611156855553, -0.07571105616662392, 0] | 0.25048402878589054 | 0.18 |
| 1.4 | [-0.013328287665675564, 0.05025456890184091, 0] | 0.05407245119700909 | 0.1 |
| 1.6 | [-0.006972153154011895, 0.024994236474593146, 0] | -0.057963774401495444 | -0.035 |
| 1.8 | [0, 0, 0] | 0 | 0 |
| 2.4 | [0, 0, 0] | 0 | 0 |
| 3 | [0, 0, 0] | 0 | 0 |

| distal 저작 항목 | 정확한 공식 / 단위 |
|---|---|
| bone | i=10..15 / 기존6본·부모 유지 |
| delay d | (i−10)×0.014seconds |
| prepare p | 0.075+(i−10)×0.006radians |
| release r | −0.10−(i−10)×0.009radians |
| wave(time,Z) | [0,0], [.2,0], [.45+d,.45p], [.65+d,p], [.78+d,p], [.9+d,r], [1.08+d,.5r], [1.25+d,.7p], [1.48+d,−.2p], [1.8,0], [2.4,0], [3,0] |
| sampling | wave의 time 사이 선형 값 → 위17시간에 재표본 → 기존 quaternion shortest-slerp 소비 |
| 최소시각 | 재표본 후 tail10 최소.900 / tail15 최소.980seconds. 각 본 최소시각이 정확히.014씩 증가한다고 주장하지 않음 |
| 보존 | 원본 mesh·UV·weights·leg cut-cap·발·drawOrder−2·hidden surface 없음 |

## FX 가림 보정과 공개 소비

처음 r5의 기존 scale0.25/offset[-72,-84]는1.300초에서 왼팔·도끼를 가렸다. 공개 inspector의 기존 지원 설정 두 필드만 보정했다. 움직임을 확인하는 기존 ENGINE_FIXTURE이며 native tailSwipe 전용 art·피해·충돌로 승격하지 않는다.

| FX 항목 | 최종 값 |
|---|---|
| source / cell / grid | assets/vfx/fieldboss/boss_fire_impact_24_20261010.png / 640×640 / 6×4 |
| frames / FPS / life | 24 / 16 / 24÷16=1.500seconds / non-loop |
| event | 같은 ownerclock demo0.900seconds / activation당1회 / native 변환0 |
| scale / destination | 0.16 / 102.4×102.4px |
| offset / world center | [-145,-84] / [4005,7276]world px |
| anchor | [.5,.5] |
| body-only QA | 같은 일반 장면의 own clone에서 optional sequence만 제거; 별도 hidden runtime mutation0 |
| public preset | 기존 UI option ID hell-aberrant-tail-swipe-impact-r4 유지 / 새 r5 scene를 fetch |
| entry / fetch query | studio.js?v=tail-readability-r5-complete / hell-aberrant-tail-readability.fdg.json?v=tail-readability-r5-fixture-final |
| runtime / schema / panel | tail-sequence-r4-final / tail-sequence-r4-final / tail-sequence-r4-complete 그대로 |
| public URL | http://127.0.0.1:3333/tools/fdg-studio/index.html?v=tail-readability-r5-complete |
| 독립 rig lab | 기존 r3 프리셋 유지 / 새 standalone r5rig는 own import 산출물 |

## 새 검증과 실제 증거

E=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/

| 검증 / 증거 | 이번 결과 |
|---|---|
| 의미 있는 새 검사 | test/fdgTailReadability.test.mjs 최초4/4 PASS,fail0/skip0 / E/first-tests-tail-readability.log |
| 실제 tip .650→.900 | UV[304,1120]/[317.9961,1120]의 두 실제 LBS 정점; tail9-relative chord161.034/162.386source px =42.942/43.303scene px |
| 방향 / 굽힘 | signed angle−1.096913/−1.126989rad; bone bend delta prepare+.265927/impact−.222050/recover+.066341rad; mesh bend delta+.116186/−.057098/+.039545rad |
| 새 검사 gate | 두 tip chord≥150source px(40scene px), signedangle≤−1rad; bonebend≥+.20/≤−.15, meshbend≥+.08/≤−.04rad. 시각 PASS의 대체가 아님 |
| 발·다리·cap | 이번26sample에서 foot/legvertex/27cap XY closure0 / 누락0 / 허용오차1e−7model |
| pivot | authored17key drift≤4.71e−14source px; 중간sample 최대2.712373source px / gate≤4source px / 연속고정 주장0 |
| 회복 / 복귀 |1.400tip bind잔차17.569/18.295source px vs impact108.776/110.695, impact의25% 이하;1.800vertices≤3.47e−18model/bones0,3.000모두0 |
| 계약 보존 | 허용한 tracks·ID/name·명시metadata·previewonce·FXscale/offsetX 외 전체 JSON deepEqual / standalone==inline |
| 문법 | 바뀐studio.js/newbuilder만 최초2/2 PASS / E/syntax-checks.json |
| 본체 대표 화면 | prepare-body-only-actual.png(.650) / impact-body-only-actual.png(.900) / recover-body-only-actual.png(1.400) |
| body-only 실제 재생 | 공개 Play / FX0 / 실제 CDP JPEG82장 / capture wall5141ms / GIF960×540·4210ms·12186853B |
| FX 연결 실제 재생 | 공개 Play / 실제 CDP JPEG65장 / capture wall4752ms / GIF960×540·3860ms·10890311B / 본체3.000hold,event1,FX0만료 |
| 캡처 처리 | 실제 JPEG의 resize/palette/timestamp 간격만 적용 / 합성FX0·가상본체frames0 / GIF뷰어 반복은 runtime 자동반복이 아님 |
| own 저장·재열기 | 새 전체 round1회 / 공개Save·Export→새URL재열기→Export / 전체 JSON deepEqualtrue |
| 저장 보존 | rig·clips·scale.16/offset[-145,-84]·map·camera 그대로 / savednode3.000pose 표시 / pretty 전후2973269bytes |
| 실행 초기화 | 공개 재열기 ownerclock0 / ready / activation0 / event0 / FX0 / transient 실행 필드 직렬화0 |
| export 이벤트 | IAB download event를 받지 못했지만 공개 export로 생성된 own 파일명만 읽어 보존 / 다른 Downloads 파일 접근0 |
| browser | 최종 ownedtab13의 capture/reopen 범위 warn/error0 / 본편 전수 인증0 |
| 동결 인수 | r4전체8/r3전체4/r2전체14·옛save-round·옛PNG/Git 전수 재검사0 / 합산0 |
| docs / Git | 관련docs 전체 rg+literalgrep 현행동기화 / 코드-test-fixture6 + docs16 =22owned파일 로컬 checkpoint / push0·deploy0 / 최종 E/checkpoint-receipt.json |

[불꽃 없는 실제 재생](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/actual-tail-readability-body-only.gif), [불꽃 연결 실제 재생](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/actual-tail-readability-with-impact.gif), [동작을 가리지 않는 실제 프레임](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/impact-visible-with-fx-actual.jpg), [재열기 화면](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/reopened-actual.png)을 이번 시각 증거로 사용한다. 테스트 숫자만으로 제작 완료를 인정하지 않는다.

최종 rig SHA256=9d86cda846192512f32149a0ffa6a8c4ece1805b70fdb1873932caf7c67b39d3, scene SHA256=3037c97333c9b0c2e6c8406ad7d363838289fc6edb58bfd2f2202b5d9c2a1530이다. r3 motion.rig와 r4 tail-sequence.fdg는 덮어쓰지 않았다.

## MAP PRODUCTION REPORT

| §23 항목 | 이번 엔진 저작 동작 범위 |
|---|---|
| STAGE | ENGINE_AUTHORING 같은 일반 장면 / tail readability r5 |
| MASTER — silhouette / regions / main route / side spaces | 맵 제작·수정0 / 현재 map 보존 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 모두 제작·수정0 |
| LARGE — source assets / composites / overlap / repeated silhouette | 승인 PNG·기존 FX 시트 재사용 / 새 환경·합성·배치0 / FX 가림만 기존offset/scale로 보정 |
| MEDIUM — connections / remaining holes | 맵 연결 제작0 / 기존 rig cap/pins 보존 / 숨은면 SOURCE_GAP1 유지 |
| GROUND — shadow / contamination / structure integration | 모두 제작·수정0 |
| PLAYABLE — main arenas / travel space / breathing space / threat space | 맵·native 전투 제작·수정0 |
| PLAYABLE — combat readability | 현재80px/model 화면크기의 FX-disabled 준비·타격·회복 확인; 실제 꼬리끝 상대 arc와 시차, 최종FX가림 보정 |
| LANDMARK — primary / secondary / tertiary | 모두 제작·수정0 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | stage 이동 QA0 / 기존 고정camera1280×720에서 같은clip3phase·일반속도·FX연결만 확인 |
| TECH QA — route / collision | 변경0·이전 stage 인수검사 재실행0 |
| TECH QA — pageerror / 404 | 실제 PNG/atlas 소비·공개 import/preset/reopen 확인; 최종tab13 warn/error0 / 본편 전수0 |
| TECH QA — seam | 새26sample foot/leg27cap0 + 실제 현재크기의 왼 cap·distal 연결 관찰 / 옛mesh검사 재실행0 |
| TECH QA — loading | 승인 원본 texture·atlas 실제 소비 / 새이미지 생성0 |
| TECH QA — performance | 기존 renderer/owner/pool/cache 유지 / 새 CPU공사·전체GPU/게임 예산 인수0 |
| FILES — stage-owned | E/checkpoint-owned-paths.json의6code/test/fixture +16docs =22파일 |
| FILES — concurrent touched | root데이터/공개QA·기존data검사담당·기존docs담당 지정소유 내 분담 |
| FILES — unrelated touched | 이번수정0 / 다른담당 WIP 보존 |
| GIT — staged / commit | 지정22파일만 로컬 checkpoint / 최종 hash·범위 E/checkpoint-receipt.json |
| GIT — push / deploy | 0 / 0 |
| VISUAL VERDICT | **PASS — 이번 보이는 꼬리치기 가독성·강약과 FX가림 보정. 전체 모델 RETOUCH** |
| NEXT PASS | **정확 잔여1: 단일 승인 정면 원화에 없는 숨겨진 면 SOURCE_GAP.** 진짜 옆·뒷면 볼륨은 이번 track보정으로 완성됐다고 선언하지 않는다 |
