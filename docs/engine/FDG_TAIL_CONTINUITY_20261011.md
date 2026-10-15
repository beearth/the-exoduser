# 지옥기형 꼬리 연결부 보정 r3 — 2026-10-11

휩쓸기0.900초에서 도끼 아래 꼬리끝이 떨어진 조각처럼 보이던 부위와 오른 다리 뒤 cut cap을 보정했다. 보이는 source surface의 부위 분류·국소 skin weights·기존 tail9 클립 key를 수정했다. 새 공개0.650/0.900/1.400초 자세와 실제 반복재생에서 연결감을 확인했고 수정 리그 자기 저장·재열기1회를 마쳤다.

**이번 보이는 꼬리 연결부 VISUAL PASS / 2.5D 제품 VISUAL VERDICT: RETOUCH.** 정확한 잔여1건은 몸통 뒤쪽과 다리/오른손에 가린 꼬리의 독립 source surface 미확보다. [r2 기록](FDG_HELL_ABERRANT_MOTION_20261011.md)의14검사·저장 왕복·영상은 동결 이력이며 새 검사에 합산하지 않는다.

## 현행 데이터

| 항목 | 정확 값 / 권위 |
|---|---|
| rig ID / version | hell-aberrant-tail-swipe-continuity-r3 / rigVersion1 |
| geometry / skin | 3864vertices /4850triangles /32bones /1material /2clips |
| shipping compact JSON | 701016UTF-8 bytes; strict2MiB /4096vertices /8192triangles 한도 유지 |
| source | assets/sprites/boss/stage1_codex_hell_aberrant.png /832×1248px; 원본 수정0 |
| 저작 권위 | ENGINE_AUTHORING /visible-source-2.5D-texture-mesh /gameplayApplied:false /sourceImageModified:false |
| 유지 데이터 | source origin[500,1140]px /300px:modelUnit /UV[x/832,y/1248] /Z=layer×.002. skeleton32/feet source[354,1076],[621,1120]·foreground mask·extraction 수치는 r2와 동일 |
| native 보호 | cooldown110gameframes /독립 projectile life200gameframes /window .15..85 /recover live30gameframes /metadata50gameframes. demo3seconds와 변환0 |
| 공개 cache | rig.html→rig-studio.js?v=tail-continuity-r3-final; preset→fixtures/hell-aberrant-motion.rig.json?v=tail-continuity-r3-final. 변경 query2개, main/runtime 의존 texture-motion-r2-final 유지 |

현행 전체 authored 데이터는 [shipping rig JSON](../../tools/fdg-studio/fixtures/hell-aberrant-motion.rig.json)이다. 새 출력 mesh.json/skeleton.json/clips.json은 같은 리그의 분리본이다. r2 증거 경로에 재출력하지 않는다.

| region | vertices | triangles | drawOrder |
|---|---|---|---|
| head | 1183 | 1552 | 1 |
| torso | 326 | 357 | 0 |
| rightArm | 283 | 364 | 4 |
| leftArm | 155 | 201 | 4 |
| leftLeg | 380 | 463 | 2 |
| rightLeg | 323 | 404 | 3 |
| tail | 888 | 1090 | -2 |
| axe | 326 | 419 | 5 |

## 부위·가중치

| 규칙 | 정확 값 / 공식 |
|---|---|
| 판정 순서 | 기존 leftLeg/rightLeg polygon 먼저, 이후 lower curl OR polygon OR 가까운 tail path. 원 mask의 보이는 source pixel만 사용 |
| lower curl | (y>1000 && x<300) OR (y>1108 && x<430). axe/torso로 잘못 나뉜 꼬리끝을 tail로 분류 |
| visible curl polygon | [[141, 1054], [159, 1011], [203, 974], [257, 945], [329, 943], [391, 960], [423, 987], [402, 1019], [345, 1011], [286, 1001], [235, 1018], [214, 1057], [227, 1088], [270, 1094], [396, 1120], [421, 1159], [140, 1159], [140, 1089]] sourcepx |
| tail spines | y>696 && pathDistance<interpolatedHalfWidth+margin; y>820이면 margin32px, 나머지12px. foreground mask 확대0 |
| anchor 조건 | 동일 source UV tail/leg 경계, left bbox[330,940,470,1064],right[560,984,680,1064]px 포함. priority leftLeg→rightLeg→vertex index. axe/torso/arm anchor0 |
| count | anchors27(left12/right15),influenced tail vertices134,pinned27. 기존 non-tail weights 변경0 |
| 거리 / taper | 최근접 anchor source Euclidean distance d<32px. t=clamp(d/32,0,1),tailAmount=t²(3−2t). (1−tailAmount)×originalLegWeights+tailAmount×originalTailWeights |
| 정규화 | weight≤1e−10 제거 후 남은 합으로 나눔. d<.0001px를 pinned 집계. source group 좌표 .0001px 반올림 |
| free curl | lower curl 조건이면 taper 제외, 기존 tail-chain weights 유지. source[304,1120],[317.9961,1120]는 tail-only |
| 고정 / 가림 | pelvis/leg tracks0. tail drawOrder−2는 legs2/3,arms4,axe5보다 뒤. 새 texture/bridge/연결선0 |

## 기존 tail9 key 보정

다리 뒤 source[342,980]px의 기존 tail9 pivot을 유지하고 tail0..8에서 물려받은 밀림을 기존 clip 데이터에 구웠다. key마다 parent=tail8의 worldXY/누적Z를 계산한다. bindPivotWorld=[−158/300,160/300]model units. localT=R(−parentWorldZ)×(bindPivotWorldXY−parentWorldXY)−bindLocalT, localZ=originalTail9LocalZ−parentWorldZ.

tail0..8/tail10..15의 기존 local 회전은 유지한다. tail9 고유 bend는 고정 pivot world frame에서 유지한다. 두 clip은 동일 tracks이며 loop만 다르다. 준비=.065exp(−i/7)rad,sweep=−.10exp(−i/6)rad; 기존 keys=[0,prepare×.6,prepare,sweep,sweep×.4,prepare×.13,0,0,0]에서 tail9만 위 보상 적용. body tracks·3seconds·24FPS·준비0–0.65/휩쓸기0.65–1.08/회복1.08–1.8/대기1.8–3초 유지.

| time seconds | tail9 baked local translation XYZ model units | rotation Z radians |
|---|---|---|
| 0 | [-1.1102230246251565e-16, 0, 0] | 0 |
| 0.35 | [-0.040331420179834376, 0.2395166078337868, 0] | -0.20119163334909732 |
| 0.65 | [-0.03597939085298563, 0.40679913907372245, 0] | -0.3353193889151622 |
| 0.9 | [0.3013974768140969, -0.459612744847726, 0] | 0.4837308665770044 |
| 1.08 | [0.09102948141126482, -0.2081428451322341, 0] | 0.19349234663080178 |
| 1.4 | [-0.013328287665675786, 0.0502545689018411, 0] | -0.043591520558971086 |
| 1.8 | [-1.1102230246251565e-16, 0, 0] | 0 |
| 2.4 | [-1.1102230246251565e-16, 0, 0] | 0 |
| 3 | [-1.1102230246251565e-16, 0, 0] | 0 |

기존 translation lerp/quaternion slerp를 소비한다. pivot은 authored key에서 정확하며 매틱 고정하는 연속 constraint가 아니다. 신규 runtime API/schema/CPU 최적화/본편 combat 확장0. clip24FPS는 저작 기준이며 raster24장 atlas나 본편24FPS 성능 인증이 아니다.

## 새 검사·공개 증거

| 검수 | 실제 결과 |
|---|---|
| 새 targeted | test/fdgTailContinuity.test.mjs 첫4/4PASS,fail0/skip0. lowercurl tip분류/leg cutcap·leg고정/free-tip skin/상대bend·회복/pivot키/strict한도·24FPS3s·armweight·layer. r2 full14 재실행0 |
| boundary probes | right[568,1057.998],[576,1052.9961],[576,1040],[672,1040];left[352,982.9961],[352,976],[368,976],[432,1040]. .65/.9/1.4에서8probe XYgap0source-equivalentpx,모든legvertex motion0 |
| 상대 bend | distal 실제3점 내부각 delta .65=+0.02993265714086757rad / .9=−0.034411920486932424rad /1.4=+0.0038915759222521995rad. 전체그림이동·회전으로 대체할 수 없는 변형 |
| proximal motion | 같은3phase source-equivalent XY15.9961/24.4273/2.0812px. tail9 pivot key drift≤9.43e−14px(부동소수점 오차) |
| 실제 재생 | public Play/Pause+actual CDP JPEG108frames /7.0536980628967285seconds. 준비·휩쓸기·회복·대기2loop와 다음준비 확인. GIF960×540/7140ms는 실제 timestamp 간격10ms 반올림,last65ms의 UI증거 |
| 저장 왕복 | 최종 수정 리그 .900초 자기 저장·재열기 정확1회. 공개 export before/after 전체 JSON deepEqualtrue,shipping mesh/skeleton/materials/clips/provenance 깊은일치 |
| 첫 후보 실패 | generic anchor가 sweep에서 긴 삼각형으로 늘어나 RETOUCH. 최초 prepare/sweep/recover-pose.png와 후보2/3 보존. pivot 보정 뒤 prepare/sweep/recover-pivot-pose.png에서 분리 조각·긴spike 해소 |
| 검수 경계 | 공개리그 고정시점. 본편전투/모든카메라/Windows/GPU/실전성능 검수로 확대0. 일반 scene의 r2 전체저장·교체 round 반복0 |

E=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-continuity-r3

최종 proof: actual-tail-continuity-playback.gif,actual-playback-capture.json,gif-receipt.json,prepare/sweep/recover-pivot-pose.png,rig-reopened-final.png,public-rig-before/after-reopen.json,save-reopen-proof.json,targeted-tail-continuity-first.log,r3-posed-metrics.json,r3-continuity-receipt.json. baseline-sweep.png/후보 실패 이미지는 최종 PASS 증거로 표시하지 않는다.

## 재생성

~~~sh
FDG_PNG_MODULE=/Users/fordeargamers/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs/lib/png.js \
FDG_MOTION_OUTPUT=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-continuity-r3 \
/Users/fordeargamers/.local/node-runtime/node-v22.23.2-darwin-arm64/bin/node tools/fdg-studio/build-hell-aberrant-motion.mjs
~~~

원본 raster를 쓰지 않으며 기존 server.cjs/3333을 사용한다. 변경 JavaScript3개 구문 검사3/3 PASS. 관련 docs 전체 rg와 literal grep -r 검색 뒤 소유 code+docs checkpoint에 포함한다.

## MAP PRODUCTION REPORT — §23 한정 리그 보정

| 항목 | 이번 범위 |
|---|---|
| STAGE / MASTER | 기존 CH1-1 저작 rig 후속. 환경MASTER/LOCK 변경0 |
| OUTER MASS | outer/majorholes/environment 제작0 |
| LARGE / MEDIUM | 기존 source-visible tail island 분류·weights·clip 접합. 신규환경/숨은surface0 |
| GROUND | source feet support 고정. native physicalground/IK 승인0 |
| PLAYABLE | map/START/EXIT/nav/collision/Q/E/save/combat 변경0 |
| LANDMARK | 환경랜드마크 변경0 |
| CAMERA QA | 공개리그 .650/.900/1.400 pose와 실제재생. 전체8camera 환경검수0 |
| TECH QA | 새 targeted4PASS 및 수정rig save/reopen1회. 이전14검사/전체저장 round 반복0 |
| FILES | builder/fixture/newtest,rig entry/presetcache2keys 및 관련docs. sourcePNG/R/main/game/foreignWIP 변경0 |
| GIT | 소유 code+docs만 로컬 checkpoint,push/deploy0,sharedrollback0 |
| VISUAL VERDICT | 보이는 꼬리 연결부 PASS;2.5D 제품 RETOUCH. 기술PASS를 전체모델/맵 승인으로 승격0 |
| NEXT PASS | 단1잔여: hiddenrearbody와 leg/right-hand-occluded tail 독립source surface 미확보 |
