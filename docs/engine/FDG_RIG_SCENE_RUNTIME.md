# FDG v0.5 일반 장면의 리그 소비자 계약

> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

r7 선택 면 노트: 아래 기존 material/UV·textureDraws·plain shade 표는 mesh.faceColors가 미설정/null인 면의 기본 계약이다. 명시 RGB6hex 면은 새 authoring flat fill1·authoringDraws를 적용하며 현재 r7 표와 정본을 따른다. 기존 r6 이하 수치·검수 행을 새 결과로 합산하지 않는다.

기준일: **2026-10-11, Asia/Seoul**. `engine/fdg/rig-scene-runtime.js`는 일반 `schemaVersion:1` FDG 미리보기의 선택 사항 `rigScene`을 소비한다. `engine/fdg/runtime.js`가 기존 카메라·60Hz 업데이트·Canvas·입력·수명 관리를 유지하며 실제 XYZ 리그를 월드 좌표에 표시한다. 순수 수학 정본 [FDG_RIG_RUNTIME.md](FDG_RIG_RUNTIME.md)의 `evaluateRig`와 [UV 텍스처 정본](FDG_RIG_TEXTURE_RUNTIME_20261011.md)의 CPU 삼각형 renderer를 호출한다. 기존 독립 `rigVersion:1` 제작 문서와 그 저장소는 계속 별개이며, 일반 장면에는 그 문서를 리소스로 포함한다.

선행 문서: [맵 제작 가이드 v0.9](../4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) 전체, [맵 SSOT 읽기 순서](../4.1맵디자인+설정/_MAP_SSOT_INDEX.md), [기존 FDG 런타임](FDG_RUNTIME.md), [리그 수학](FDG_RIG_RUNTIME.md). geometry·collision·production 배치·신규 모델/맵/PNG는 제작하거나 변경하지 않았다. `game.html`, 제품 R, 보호된 `2_3` 문서, 기존 완료 suite는 이 작업 범위 밖이다.

r6 조건 노트: 본문의 보편 clip/time/sequence/API 표는 node.returnTo·sequence.autoStart·entryTransitionSeconds를 미설정한 기존 기본 계약을 유지한다. 아래 r6의 명시 설정은 opt-in 확장으로 적용한다. returnTo 노드의 전환 중 setRigClip/replay는 false, sequence elapsed는 마지막 공격 시각으로 고정하고 현재 idle node time을 별도 표시하며, autoStart:false 일반 start/step은 자동 공격 회차를 만들지 않는다. 기존 표 행·r5 수치·과거 검수 이력을 변경하여 새 결과로 합산하지 않는다.

## 데이터·한계

아래 `nodes[]` 행은 기존 기본 필드를 나열한다. r6의 전체 노드 형태는 `{id,name,resourceId,position,scale,visible,materialId,clipId,time,transition?,returnTo?}`이며 새 선택 필드의 검증·실행 계약은 아래 r6 현재 표를 따른다.

구조 검증은 `engine/fdg/rig-scene-project.js`의 `validateRigScene(scene) → {ok,errors}`가 소유한다. 소비자는 이 검증 후 독립 복사로 리소스·노드 상태를 구성한다. 사용자의 authored 프로젝트는 시간 진행·clip/material 변경·capture 때문에 변하지 않는다. Inspector의 문서 편집은 소유 Studio가 `setProject`로 전달한다.

| 필드 / 상수 | 값 / 의미 |
|---|---|
| `project.rigScene` | 선택 `{version:1,resources,nodes,camera,sequence?}`. 미지정 시 기존 sprite/오브젝트/VFX 경로 유지 |
| `resources[]` | `{id,name,project:RigProject}`. `0..8`, 기존 `rigVersion:1` 문서 그대로. 노드의 수동 pose는 `resource.project.preview.pose` |
| `nodes[]` | `{id,name,resourceId,position,scale,visible,materialId,clipId,time,transition?}`. `0..32`, 같은 리소스를 여러 독립 시각 노드로 소비 가능 |
| `position` | `[worldX,worldY,heightZ]`, X/Y `0..8000`px, height `−8000..8000`px. map.objects의 TILE 좌표와 구분 |
| `scale` / `visible` | `1..128` CSS px/model unit / boolean |
| `materialId` / `clipId` | 리소스 내부의 호환 재질 / 기존 clip ID 또는 null(bind+수동 pose) |
| `time` | 유한 비음수 초. clip FPS를 강제로24로 바꾸지 않음 |
| `transition` | 미지정/null 또는 `{fromClipId,fromTime,duration,elapsed}`. source ID는 해당 리소스의 clip/null, source time≥0, duration `(0,10]`초, elapsed `[0,duration]` |
| `camera` | `{x,y,follow,yaw,pitch}`. X/Y `0..8000`px, follow boolean. yaw `−π..π`, pitch `−π/3..π/3` radians |
| `RIG_SCENE_TRANSITION_SECONDS` | `0.25`초, 기본 clip 전환 기간 |
| `RIG_SCENE_TRANSITION_EPSILON` | `1e-9`초, 종료 경계 오차 처리 |
| 설정/배열 기본 생성 | 소비자가 리소스·노드·맵을 생성하지 않음. `rigScene`은 검증된 명시 데이터 |

리소스의 본·정점·삼각형·가중치·키 수 및 quaternion/행렬 규약은 [리그 프로젝트 스키마](FDG_RIG_PROJECT.md)와 순수 수학 정본을 따른다. 이 consumer가 새 스켈레톤·메시·가중치·clock를 복제하지 않는다. unknown JSON metadata는 scene/resource/node/camera와 포함된 rig 문서 모두에서 capture 시 유지한다.

## FDGRuntime 공개 API

| API / 반환 | 정확한 동작 |
|---|---|
| `getRigNodeSnapshot(id)` → node/null | 존재하는 노드를 같은 평가 경로에서 계산하여 독립 복사. unknown/deleted/disposed ID는 null |
| `getRigSceneSnapshot()` → scene snapshot | 아래 형태. 미지정 scene은 빈 배열·resourceCount0, disposed 값은 runtime 상태 반영 |
| `captureRigScene()` → scene/undefined | 원본 구조·metadata의 새 복사에 현재 각 노드 time/clip/material/transition 및 카메라 상태 반영. 미지정/disposed scene은 undefined |
| `setRigClip(nodeId,clipId,transitionSeconds=.25)` → boolean | 기존 clip/null, 유한 기간 `0..10`초만 수용. target time0, source clip/current time에서 전환. 기간0이면 즉시 교체 |
| `setRigMaterial(nodeId,materialId)` → boolean | 같은 리소스의 호환 색/선택 texture 재질 선택. time·clip·transition·skinned geometry 유지 |
| `seekRig(nodeId,time)` → boolean | 유한 비음수 시각을 loop wrap/non-loop clamp하여 설정, 진행 중 crossfade 해제. owner UI가 먼저 pause하면 정지 상태로 scrub |
| `setRigView(yaw,pitch)` → boolean | 유한 yaw±π/pitch±π/3 radians. 장면의 모든 노드 투영각 변경 |
| 위 변경 API 성공 | 화면만 갱신. owner state·rAF·입력·게임 시뮬레이션 시간을 바꾸지 않음 |
| 위 변경 API 실패 | 없는 노드/clip/material·잘못된 숫자·disposed는 false, 기존 상태 보존 |
| `setProject(project)` / scene 삭제 | 기존 consumer dispose 후 새 consumer 구성. 새 scene의 serialized 시간·전환·카메라 적용, 삭제된 노드/리소스 참조 해제 |
| `dispose()` | 기존 runtime 정리에 consumer dispose 포함. 이후 업데이트·control API는 상태를 진행시키지 않음 |

| node snapshot 필드 | 형태 / 단위 |
|---|---|
| `id,resourceId,materialId,clipId` | 현재 ID, clipId는 null 가능 |
| `position,scale,visible,time,transition` | 독립 복사, 위 데이터 단위·transient 실행 상태 |
| `vertices` | `[[x,y,z]]`, evaluateRig의 실제 skinned model-space 좌표 |
| `uvs,drawOrder,texture` | 평가 결과에 있을 때만 각각 정점별UV·삼각형별layer·선택 재질의 texture 선언을 독립 복사 |
| `textureDraws` | 해당 노드의 마지막 `drawNode`에서 성공한 texture triangle `drawImage` 수. 전체 장면/GPU draw call 계수가 아님 |
| `bonePositions` | `[{id,parent,position:[x,y,z]}]`, posed rig world 좌표. FDG placement/scale를 아직 적용하지 않은 수학 결과 |
| `screenVertices` | viewCamera 미설정은 `[{x,y,z}]`, X/Y는 CSS 화면 픽셀, Z는 모델 내부 삼각형 정렬용 투영 depth×scale |
| `anchor` | viewCamera 미설정은 `{x,y}=runtime.worldToScreen(position[0],position[1])`. **발 위치**, height 차감 전 |
| `depth` | viewCamera 미설정은 `position[1]`, 다른 오브젝트/플레이어와 정렬하는 월드 발 Y |

scene snapshot은 `{nodes:[nodeSnapshot],activeNodes,resourceCount,ownedRaf:0,ownedListeners:0,disposed}`다. activeNodes는 `visible:true`인 노드 수이며 viewport 컬링 후 실제 렌더 수를 뜻하지 않는다. invisible 노드도 owner update에서 시간을 진행하고 snapshot 평가를 제공한다. snapshot의 배열/좌표/transition을 수정해도 다음 평가·저장·원본 문서에 전파되지 않는다.

## 소비자 내부 공개 클래스

명시 viewCamera 경로의 node snapshot은 `projection:'shared-world-camera'`, 독립 `worldVertices`/`cameraVertices`, `anchorVisible`, `depthSource`를 추가한다. depthSource는 발이 유효하면 `anchor`, 발이 near 뒤여도 실제 near-clipped face bbox가 live CSS viewport와 겹치면 `clipped-visible-geometry`(해당 정점 중 최대 projected depth), 남은 면이 없으면 `hidden`/depth0이다. anchor.x/y는 invisible foot의0값을 그대로 기록하며 화면 접지점으로 쓰지 않는다. 이 파생 값은 capture JSON에 저장하지 않는다. 노드 단위 painter 보정이며 교차 면의 픽셀 Z-buffer나 전역 triangle 혼합이 아니다.

| export / 메서드 | 인수 / 반환 / 책임 |
|---|---|
| `new RigSceneRuntime(scene,{worldToScreen,getImage,getProjection,getViewport}={})` | 검증된 scene의 독립 복사. 기본 worldToScreen은 identity `{x,y}`, 나머지 callback은null반환. 실제 runtime은 자신의 변환·이미지·공통 camera와 CSS viewport `{width,height}`를 전달. 네 callback 모두 function이어야 함. getViewport 미지정은 viewport 미제한의 보수적 near clip |
| `requiredSources()` | 모든 resource material의 texture.src와 선택 sequence.atlas.src를 중복 제거한 배열. disposed는[]; 색만 있는 기존 scene도[] |
| `validateReady(images)` | owner의 `Map<src,{image}>`에서 모든 texture와 선택 sequence atlas의 naturalWidth/Height 정확 일치 검사→`{ok,errors}`. 중복 오류 제거, disposed는okfalse |
| `RigSceneValidationError` | TypeError 하위, name 동일, `.errors`는 독립 문자열 배열. 구조 검증 실패 시 throw |
| `update(dt)` | 유한 비음수 초, 양수이면 시간/전환만 진행하고 true. 0/잘못된 숫자/disposed는 false. 자체 dt clamp/fixed accumulator 없음 |
| `evaluate()` | 현재 clip/material/time/transition으로 `evaluateRig`, placement/view로 screenVertices 계산. `this` 반환, 시간 미진행 |
| `getDrawEntries()` | visible 노드의 `[{id,depth}]`, 시간/수학 미진행 |
| `drawNode(context,id,viewport?)` | evaluate된 visible 노드의 CPU 삼각형 표시. `{width,height}` 밖 projected bounds는 생략. texture는 owner getImage와 pure helper로 실제drawImage 수를 반환; 색은기존fill/stroke 연산계수 반환 |
| `setClip/setMaterial/seek/setView` | 위 FDGRuntime API의 순수 상태 변경. 자체 render/rAF/pause 없음 |
| `getNodeSnapshot(id)` / `snapshot()` | evaluate와 동일 경로·독립 결과. 위 반환 형태 |
| `capture(camera={})` | 원본 metadata 복사에 transient 상태·주어진 camera X/Y/follow 및 view yaw/pitch 적용 |
| `dispose()` | 반복 안전. 노드/리소스 map clear, 원본 scene/owner transform/getImage callback 참조 해제. 이미지를consumer가별도소유하지않음 |

소비자가 소유하는 RAF·리스너·타이머·이미지 로드·GPU context/texture/lease는 모두 **0**이다. 장면 구성 여부와 관계없이 FDGRuntime의 기존 RAF 하나·입력 이벤트·ResizeObserver 하나를 재사용한다. textured rig의 source는 owner `_collectSources()`에 등록하고 기존 `assets/_loadAsset`의 로드·decode·오류·교체·정리를 사용한다. `load()`가 현재 version에서 `validateReady(this.assets)`를 검사하여 `rig-texture-images` 오류를 기존 onError/stats에 전달한다. 소비자는 owner가 주입한 `getImage`로만 이미지를 읽는다.

## 시간·투영·그리기 공식

| 항목 | 공식 / 정확한 실행 위치 |
|---|---|
| clock 소유 | FDGRuntime `_update(FIXED_STEP)`에서 consumer `update(dt)` 한 번. FIXED_STEP=`1/60`초, clamp `.25`초, 최대6substeps를 기존 owner 그대로 사용 |
| 시간 진행 | `node.time + dt` 후 loop `%duration`, non-loop `min(time,duration)`. bind(null)은 비음수 초 계속 진행. finite 합 overflow는 Number.MAX_VALUE에 제한 |
| crossfade source | source time도 같은 dt로 진행하고 해당 clip의 wrap/clamp 적용 |
| crossfade amount | `min(1,elapsed/duration)`을 evaluateRig의 blend로 전달. T 선형, rotation quaternion 최단 slerp는 수학 모듈만 계산 |
| crossfade 종료 | `elapsed + 1e-9 >= duration`, 기본 `.25`초는 **15 owner 틱**. 이후 transition=null, target 단독 평가 |
| 수동 pose | `resource.project.preview.pose`를 evaluateRig가 clip/blend 뒤 한 번 적용 |
| pause/render/seek | pause와 render는 dt0; seek는 명시한 시각만 변경. 수동 owner `step(1/60)`은 리그에도 정확히1틱. clip FPS가 owner60Hz를 변경하지 않음 |
| raw1초 hitch | 기존 owner는6틱/.1초만 실행하고54틱/.9초 버림. 리그도 `.1`초만 진행; 독립 catch-up 없음 |
| serialized camera | 프로젝트 `_spawn` 뒤 rigScene의 X/Y/follow 적용 후 기존 viewport/map clamp. follow=true이면 다음 owner 업데이트가 플레이어를 추적 |
| 발 screen anchor | `(worldX-camera.x+width/2,worldY-camera.y+height/2)` |
| yaw 회전 | `rx=cos(yaw)×x+sin(yaw)×z`, `rz=−sin(yaw)×x+cos(yaw)×z` |
| screen projection | `screenX=anchor.x+rx×scale`; `screenY=anchor.y−heightZ−(cos(pitch)×y−sin(pitch)×rz)×scale` |
| 내부 depth / layer | `(sin(pitch)×y+cos(pitch)×rz)×scale`. authored `drawOrder` 오름차순→삼각형3정점 평균depth 오름차순→원triangleindex 오름차순. layer생략은0 |
| 장면 순서 | 배경 fill 뒤 tiles fill/grid→BACK objects→기존 START/EXIT→world objects/rig/player를 발Y 오름차순→VFX→FRONT objects→errors. 같은 발Y는 **object→rig→player**, 같은 종류는 문서 순서 유지 |
| 기존 표식 합성 | `_drawMap()`은 타일·격자만, `_drawMapMarkers()`는 BACK 직후·world/rig/player 전에 호출. `map.start`/`map.exit` 중심 `(tile+0.5)×tileSize`, START `#76c3b0`/EXIT `#dfbb79`, 크기 tileSize×0.6·stroke2px, label10px·Y−tileSize×0.4, 화면 경계 ±1타일 컬링, 보이는 표식당 owner drawCalls2. 표시 옵션·새 field 없음 |
| overview/runtime 분리 | grid/route checkbox는 Studio overview `mapCanvas` 전용. runtime BFS path/rest marker draw·회색 타일 전체 재덮기·새 표식·NPC 추가 없음. 아래 QA 수치와 판정은 기존 검증 시점의 기록이며 새 합성의 browser/visual PASS를 뜻하지 않음 |
| 리그 instance culling | projected vertices의 bounds 전체가 viewport 한쪽 밖이면 draw0. 별도 collision/interaction/전투 entity 없음 |
| 색 material의 flat shade | 모델 삼각형 cross-product normal. `shade=.35+.65×max(0,dot([−.4,.8,.6],n)/(|n|×sqrt(1.16)))`, normal0의 분모는1 |
| 색 material의 face edge | `#17232ba0`, `.8`px, fill 색은 material RGB×shade 반올림 |
| texture material | source pixel `[u×width,v×height]`를 skinned screen triangle에 affine 매핑. clip→현재 DPR에transform합성→원본drawImage, tint/shade/edge추가없음. unavailable/치수불일치/퇴화삼각형은0 |
| drawCalls 합산 | 색 삼각형당fill+stroke=**2**, 성공 texture삼각형당drawImage=**1**, owner기존drawCalls에더함. GPUdrawcall/VRAM/완성성능PASS수치아님 |

재질은 같은 메시·본대에 호환되는 색/선택texture를 소비한다. PBR·스킨 파츠 교환·겹치는 면의 depth buffer·GPU 스키닝은 구현하지 않았다. authored layer는 리그 내부 면의 순서만 바꾸고 노드 전체의 월드 발Y 순서를 바꾸지 않는다. 같은layer에서 평균depth 정렬의 한계와 기존preview의 측정범위는 유지한다. snapshot API에서도 evaluateRig를 호출하므로 해당호출비용은 renderMs구간 바깥일 수 있다. 원본에서 보이는 표면2.5D fixture를 완전3D 복원·본편nativecombat 적용으로 보고하지 않는다.

## 수치 oracle·2026-10-10 동결 검증

기본 기존 3본/16정점/28삼각형 rig, clip=null, node `[420,500,10]`, scale40, camera `[420,500]`, CSS viewport320×240, yaw/pitch0일 때:

| 항목 | 기대 값 |
|---|---|
| 발 anchor / 장면 depth | `{x:160,y:120}` / `500` |
| vertex0 model / screen | `[−.5,0,−.4]` / `{x:140,y:110,z:−16}` |
| vertex12 model / screen | `[−.35,3,−.3]` / `{x:146,y:−10,z:−12}` |
| spine 수동 Tx.5, vertex5 | 원본 X보다`.3` 증가, weight`.6` |
| 기본 visible 삼각형 렌더 | 28 fill + 28 stroke = **56** 연산. invisible/offscreen은0 |

2026-10-10 검증 명령은 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --test test/fdgRigSceneRuntime.test.mjs`다. **통합13개 PASS의동결이력**이며 이번texture추가에서 해당suite·기존runtime/sprite/optimizer/rig47 및 기타완료suite는재실행하지않았다. 2026-10-11 신규 `test/fdgRigTexture.test.mjs` **8/8 PASS**는 [별도검증표](FDG_RIG_TEXTURE_RUNTIME_20261011.md)에서 owner이미지/정확치수/실제draw수/시간불변/교체정리 범위를 보고하며13에합산하지않는다.

| 새 검증 | 확인된 결과 |
|---|---|
| actual XYZ·view·height | evaluateRig 결과 그대로, 발 anchor와 높이 차감·yaw/pitch 공식 일치 |
| paused pose 편집 | resource 수동 offset의 실제 LBS·Z 변형, 새 project 전달 후 즉시 평가 |
| owner clock | 30/60/120 rAF 모두1초/60업데이트. 추가 RAF0, owner pending1 |
| pause/step/hitch | pause/render 시간 고정, 수동1틱, resume 첫 delta0,1초 raw hitch 후 리그.1초 |
| crossfade | source/target 각 시간·amount oracle, `.25`초15틱 종료, instant/bind 선택 |
| material | 시간·clip·transition·vertices 유지, Canvas 색 변경 |
| capture/reopen | pause 중 전환·동일 visible pose·clamped camera·unknown metadata 보존, 복사 격리 |
| layer/depth | object→rig→player 동률, back/world/VFX/front 유지, heightZ가 발 depth를 바꾸지 않음 |
| projected culling/count | 삼각형 fill/stroke 실제 계수, offscreen0, activeNodes 의미 분리 |
| replacement/delete/dispose | 이전 consumer 참조 clear, 삭제 node null, listener/observer/RAF 추가 없음 및 최종0 |
| snapshot/invisible | 독립 값, invisible 시간 진행·draw0 |
| controls/limits | seek wrap/clamp/fade 해제, 잘못된 control의 원자적 거부, disposed inert |
| collision 분리 | 같은 발 위치의 리그가 기존 플레이어 이동을 막지 않음 |

## MAP PRODUCTION REPORT — 2026-10-10 장면 소비 동결 이력

| §23 항목 | 이번 범위 |
|---|---|
| STAGE / MASTER | 기존 FDG reference 장면의 소비자, production stage/실루엣/region/route/side space 제작 없음 |
| OUTER MASS / LARGE / MEDIUM / GROUND | 신규 환경·composite·겹침·연결·ground 그림 제작 없음 |
| PLAYABLE | geometry/collision 그대로, 리그 무충돌. 실제 전투 가독성은 root의 신규 통합 화면 QA 대상 |
| LANDMARK | 노드의 직교투영을 소비할 뿐 신규 landmark 제작 없음 |
| CAMERA QA | 화면 변환·발Y 정렬·height·경계 clamp 기술 검증. START/EARLY/ARENA/SIDE/LANDMARK/LATE/EXIT 완성 아트 승인 없음 |
| TECH QA | 새 한정13개 PASS. 브라우저 pageerror/404·실기 성능·지도 seam은 별도 인수 |
| FILES | 이 worker 소유 runtime.js의 consumer 연결·rig-scene-runtime.js·새 test/doc. root와 schema worker의 파일은 수정하지 않음 |
| GIT | 이 worker commit/push/deploy 없음. root가 코드+docs 함께 통합 |
| VISUAL VERDICT | **FAIL — production environment 완성 기준**. 기술 consumer이므로 자동 단위 PASS를 완성 맵/게임 캐릭터 아트 승인으로 대체하지 않음 |
| NEXT PASS | 기존 scene에서 신규 브라우저 통합·카메라/깊이·저장 재열기 확인. 본편 적용은 승인된 production adapter·맵/전투 QA 후 별도 진행 |

변경 뒤 docs 전체를 `rg` 및 `grep -r -n -I -E 'rigScene|RigSceneRuntime|리그.*장면|리깅.*통합|CPU.*Canvas|world.*플레이어|world.*VFX' docs/`로 검색했다. 중앙 engine/interface/changelog 및 Studio 인수 상태 동기화는 root가 소유하며 이 consumer의 모든 새 값/API/순서는 위 표를 정본으로 한다.

## 2026-10-11 r4 같은 owner clock 시퀀스 (선택 r6 필드 생략 시 기본 계약)

[데이터 정본](FDG_RIG_SCENE_PROJECT.md)의 optional sequence 하나를 소비한다. 아래는 `autoStart` 생략(true)·`entryTransitionSeconds` 생략(0)·node `returnTo` 생략 시의 기본 동작이다. r6의 명시 선택값은 아래 현재 표로 확장한다. 별도 clock·RAF·timer·Image·pool은 만들지 않으며 FX는 기존 FDGRuntime ParticleSystem·animationFrame·drawImage·assets 캐시가 소유한다. 실재 fixture·공개 검수·시각 인수는 [r4 정본](FDG_TAIL_SEQUENCE_20261011.md)을 따른다.

| FDGRuntime API | 반환 / 정확한 동작 |
|---|---|
| `replayRigSequence()` | boolean. 일반 FDG rig scene·실제 atlas 준비 완료에서 bound node를 설정 clip/time0/transitionnull로 재시작하고 activationId를1 증가. owner clock·다른 node·이미 발동한 FX는 보존. 실패하면 false |
| `stopRigSequence()` | boolean. bound node를 hold하고 새 이벤트를 disarm. owner running/clock과 기존 FX는 유지. 시퀀스 미지정/disposed/별도 sourcePreview·sourceScene·terrainScene 소비에서는 false |
| `getRigSequenceSnapshot()` | 아래 실행 snapshot. 관측은 시간/이벤트 발동·설정 변경을 하지 않음 |
| 최초 ready start / 첫 owner step | 실제 atlas가 준비되면 activation1을 시작하고 bound node의 설정 clip을0초로 맞춤. ready 상태에서 이미지 실패/미준비이면 start는 거부, step은0틱 |
| stopped/completed 후 owner start | 자동 새 activation 없음. 명시 replay가 필요하며 Studio의 사용자 Play/Replay 동작이 이를 호출할 수 있음 |
| bound node의 성공 clip/seek 변경 | 시퀀스 disarm, hold 해제. 기존 FX는 자기 life까지 유지. 다른 node 조작·material/view 변경은 armed 상태 유지 |
| pause / resume / step | pause는 전체 owner 시간·node·FX age 고정, resume은 같은 activation. 수동 owner step은1/60초 |

| snapshot 필드 | 값 / 단위 |
|---|---|
| `id,status` | 설정 ID 또는 null; ready/active/stopped/completed/unavailable |
| `activationId,eventCount,emittedCount` | 현재 회차, 현재 activation의 crossing 수0/1, 실제 ParticleSystem 방출 반환 수0/1. pool 방출 실패를 이벤트 재시도로 바꾸지 않음 |
| `elapsed,eventTime,atlasLife` | demo 초. ready의 elapsed0, eventTime=startTime, atlasLife=frames/fps. unavailable은 elapsed0/eventTimenull/atlasLifenull |
| `assetReady` | 실제 자연치수의 정확 일치 준비 여부 |
| `atlasActive,atlasAge,atlasFrame` | 같은 sequence ID의 기존 활성 sheet 중 현재 activation 우선·없으면 active-list 마지막 sheet를 관측. frame은0-based, 활성 sheet가 없으면 age/frame null |
| `activeFx` | 기존 VFX playback 레코드의 독립 배열 + 선택 sequenceId/activationId. 이전 activation의 아직 살아 있는 FX도 포함 |

| 소비자 내부 메서드 | 책임 |
|---|---|
| `sequenceImageReady(images)` | owner Map의 atlas 자연치수 `columns*frameWidth × rows*frameHeight` 정확 일치 검사 |
| `replaySequence()` | bound node의 hold/transition 제거·설정 clip0초·회차 증가·새 event/emitted count0, pending event 제거. owner가 준비/소비 guard를 먼저 검사 |
| `stopSequence()` | bound node hold·status stopped·pending event 제거. owner clock/FX는 소비자가 소유하지 않음 |
| `takeSequenceEvent()` | pending event를 정확1회 반환하고 null로 비움. sequenceId/activationId/definition/position 제공 |
| `recordSequenceEmission(count)` | 기존 ParticleSystem의 실제 방출 수 기록 |
| `getSequenceSnapshot()` | 순수 실행 상태·elapsed/eventTime/atlasLife. owner가 이미지와 activeFx 관측을 추가 |
| `dispose()` 추가 정리 | held node set·sequence 설정/definition/pending event 참조 제거, unavailable/회차0/이벤트0/방출0. owner의 기존 입자 clear도 수행 |

| 실행 경계 / 공식 | 현재 계약 |
|---|---|
| 단1 activation의 이벤트 | `eventCount===0 && previousNodeTime<startTime && node.time+1e-9>=startTime`에서 eventCount1. native single-hit·damage·attack ticket 계약이 아님 |
| owner update 순서 | rig update → 기존 skill update → 기존 particle update → pending event 소비/새 sheet emit. trigger 틱의 새 FX는 age0/frame0 |
| 시트 정의 | burst/count1/speed0/size1/spread0, life=`frames/fps`, non-loop. 중심=node.positionXY+offset; height나 본 투영점에 임의 연결하지 않음 |
| FX alpha / 셀 / 만료 | `max(0,1-age/life)`, `floor(age*fps+1e-9)`의 기존 non-loop 셀, `age+1e-9>=life`에서 자기 만료 |
| clip 끝 / stop / replay / manual clip / seek | 이미 발동한 FX를 중간에 clear하지 않음. replay로 이전 activation FX와 겹칠 수 있으며 같은 pool을 재사용 |
| 이미지 실패 | atlas 자연치수 실패는 validateReady 오류, ready 활성화/start/step 거부. sequence sheet draw 실패 때 primitive 대체 표시0 |
| load / 교체 / dispose | 저장된 node pose/clip/time/transition과 sequence 설정 유지. 새 load는 owner0/FX0/ready·activation0/event0으로 보관 pose를 먼저 표시하여 즉시 오발하지 않음. 교체/dispose는 기존 owner 입자·consumer·assets 정리 |

기존 owner FIXED_STEP1/60초·max delta0.25초·max substeps6·epsilon1e-9·pool1024, native 수치110/200/30/50/.15..85의 원래 시간·phase 단위와 변환0을 유지한다. 새 backend 전용 `test/fdgRigSequence.test.mjs` 최초 실행8/8 PASS(fail0/skip0)는 r4 정본에 별도 증거로 연결하며 기존 완료 suite·PNG를 재검수하지 않았다.

## r4 공개 증거·당시 캐시 (동결 이력)

[시퀀스 정본](FDG_TAIL_SEQUENCE_20261011.md)이 r4 당시 구현·자체 검수의 정본이다. 아래 수치·검사·저장·공개 자료는 동결 이력이며 r5 검증에 합산하지 않는다. backend 신규8개 최초 PASS, 처음 JS8개 구문 PASS 및 필요한 선택값 보정 뒤 panel/studio2개 구문 PASS를 별도 기록한다. 기존4/14/r3·전체 저장 suite·PNG 검수를 재실행하거나 합산하지 않았다.

| 새 결과 | 정확한 범위 |
|---|---|
| 공개 crossing / 자기 만료 | 53틱0.883초 event0/FX0,54틱0.900초 event1/FX1 age0/frame0(표시1/24). Stop 뒤 bound body0.900초 hold·4틱 FX0.067/셀2, 총87틱 age1.450/셀24, 총90틱1.5초 FX0. clip 변경·replay는 이미 발동한 FX를 제거하지 않음 |
| 실제 재생 | 73JPEG/7.781461초 CDP elapsed, GIF960×540/7930ms. runtime/pose/clock/frame 강제 변경·합성0, 본체3.000초 hold/FX0/자동 loop0 |
| 새 설정 저장·재열기1회 | before body1.3000000000000003초/FX age0.400/event1 →reopen visible pose1.300·ready/activation0/event0/FX0/clock0. export 전체 JSON deepEqual, resources/sequence/map/camera는 최종 fixture와 깊은 일치. transient fields 직렬화0; 보정 후 두 번째 저장 검수0 |
| 최종 cache | index 공개 URL·studio entry·rig-scene-panel=`tail-sequence-r4-complete`, runtime/schema chain=`tail-sequence-r4-final`, fixture fetch=`tail-sequence-r4-fixture-final`. cache key는 schema/engine 버전 승격이 아님 |
| 직접 관측·시각 경계 | 공개 두 수집 범위 warn/error0. 같은 승인 body+실제 atlas sequence VISUAL PASS / 전체 모델 RETOUCH, 단1개 hidden source surface SOURCE_GAP. native 시간/전투·attack ticket·full3D·Windows/GPU 인수0 |
| 증거 | `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/`의 `sequence-fixture-receipt.json`, `save-reopen-receipt.json`, `syntax-checks.json`, `public-sequence-observations.json`, `public-browser-warn-error-log.json`, `gif-receipt.json`, `actual-tail-swipe-impact-once.gif` |

## 2026-10-11 꼬리치기 가독성 r5 (동결 이력)

r5의 배송·수식·검사·실제 공개 GIF·저장·시각 결과는 아래 당시 이력으로 보존한다. r6 결과와 합산하거나 이전 자료를 재실행·덮어쓰지 않는다.

[r5 가독성 정본](FDG_TAIL_READABILITY_20261011.md)을 따른다. 승인 r4 scene을 읽는 새 `tools/fdg-studio/build-hell-aberrant-readability.mjs`가 기존 키 보간으로 준비·휩쓸기·회복의 강약을 저작한다. r2/r3/r4 보고·proof·검사·저장 수치는 동결 이력으로 보존하며 재실행·새 인수 합산·이전 fixture 덮어쓰기0이다.

| 항목 | r5 당시 데이터 / 경계 |
|---|---|
| 새 shipping | `fixtures/hell-aberrant-tail-readability.fdg.json`=`hell-aberrant-tail-readability-scene-r5`, compact UTF-8 820009bytes. 별도 `.rig.json`=`hell-aberrant-tail-swipe-readability-r5`, compact713092bytes. 기존 r3 `hell-aberrant-motion.rig.json`·r4 `hell-aberrant-tail-sequence.fdg.json` 보존 |
| 메시·권위 | 3864정점/4850삼각형/32본 및 mesh/weights/skeleton/material/source PNG 보존. ENGINE_AUTHORING·nativeCombatApplied:false, 새 runtime/schema·본편 전투·맵 변경0 |
| clip key 저작 | `tail-swipe-loop`/`tail-swipe-once` 2종은 각각3초/24FPS/20tracks. spine/head/leftArm/leftForearm·tail9..15의11tracks는17keys `[0,0.2,0.45,0.6,0.65,0.72,0.78,0.84,0.9,0.98,1.08,1.25,1.4,1.6,1.8,2.4,3]`를 공유. tail0..8의9tracks는 기존9keys 유지, pelvis/다리/발 bind 유지 |
| 동작 구조 | spine→head→leftArm→leftForearm→tail9→tail10..15의 순차 저작. tail9의 key별 world pivot XY 위치 bake는 유지하고 world Z 준비·방출 회전을 보정. distal10..15 지연은 `(i-10)*0.014`초이며 기존 translation lerp/quaternion slerp 소비, 연속 runtime constraint 추가0 |
| FX 저작 / 기존 시간 계약 | sequence ID=`hell-aberrant-tail-readability-impact-r5`, node=`hell-body-node`, clip=`tail-swipe-once`, startTime0.900초. 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 640px셀/6×4/24frames/16FPS/life1.5초·최종 scale0.16·anchor[0.5,0.5]·offset[-145,-84], bound node[4150,7360] 기준 FX world center[4005,7276]·640×0.16=102.4px 사각 표시. 첫 r5 후보의 scale0.25·offset[-72,-84]는1.300초에 왼팔/도끼를 가려 기존 public inspector로 보정했다. native cooldown110/projectile life200/recoverLive30/recovery metadata50의 원래 game-frame 단위·attackWindow[0.15,0.85] phase 단위와 비환산 유지 |
| 현행 URL / cache | `index.html?v=tail-readability-r5-complete`·`studio.js` entry query=`tail-readability-r5-complete`, 새 scene fetch query=`tail-readability-r5-fixture-final`. runtime/schema=`tail-sequence-r4-final`, panel=`tail-sequence-r4-complete` 유지. 독립 `rig.html`의 기본 r3 preset은 유지하며 r5 `.rig.json`은 별도 새 저작 자료 |
| FX-disabled 실제 body | 후보1의 공개0.650/0.900/1.400초 pose와 실제 Play82JPEG/FX0를 확인한 뒤 별도 r5 fixture로 promote. GIF960×540/4210ms/12186853bytes, capture wall5141ms·합성frame0·효과합성0. sequence를 생략한 own 검수 scene이며 shipping sequence 삭제 아님 |
| 최종 FX 실제 재생 | public Play65JPEG/capture wall4752ms→GIF960×540/3860ms/10890311bytes(`actual-tail-readability-with-impact.gif`). 최종 scale0.16/offset[-145,-84]로 본체3.000초 hold/event1/FX0 자기 만료 확인. 속도·clock/frame 강제 변경·효과 합성0 |
| 신규 데이터 검사 | 새 `test/fdgTailReadability.test.mjs` 최초4/4 PASS, fail0/skip0/cancel0. 범위는 standalone↔inline 및 승인 변경만·실제 tip release/굽힘/순차 타이밍·발/27cap/key pivot/중간 drift·회복/1.8초와3초 복귀. 26개 새 r5 sample, 기존4/8/14 suite·PNG·native·기존 저장 재실행/합산0. `first-tests-tail-readability.log`·`targeted-tail-readability-receipt.json`·`targeted-tail-readability-metrics.json` 별도 증거 |
| 신규 구문 검사 | `tools/fdg-studio/studio.js`·`tools/fdg-studio/build-hell-aberrant-readability.mjs` 두 파일 최초2/2 PASS, `syntax-checks.json` 별도 증거. semantic4개와 합산하지 않고 다른 runtime/schema·기존 구문/검사 재실행0 |
| 새 자기 저장 / 재열기 | 새로운 save→export→reopen→export 전체 왕복 정확1회. before/after public pretty UTF-8 2973269bytes·전체 JSON deepEqual true. 새 rig/clips/FX scale0.16·offset[-145,-84]/map/camera 보존, transient fields0. 재열기 저장 node3.000초 pose 표시·owner clock0·ready/activation0/event0/FX0. 이전 저장 suite 재수행0 |
| 시각·증거 경계 | 이번 보이는 동작 가독성+FX 가림 보정 범위의 VISUAL VERDICT: PASS, 전체 모델은 hidden rear body 및 leg/right-hand 뒤 꼬리의 독립 source surface SOURCE_GAP 정확히1건으로 RETOUCH 유지. 새 final tab13 warn/error0. 숨은 면 생성·full3D·native 전투·Windows/GPU 성능 승인0. 새 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/`, r4와 분리한 새 구현·자체 검수의 완료 기록이며 제품/native production 인수는 별도 |

기존 r4 replay/stop/pause·activation당1회 crossing·기존 FX 자기 만료·clip/seek 중 FX 보존·장면 교체/dispose clear·capture/load transient 분리와 owner60Hz/.25초/6substeps/pool1024를 그대로 소비한다. 준비·휩쓸기·회복 차이는 authored clip 값이며 새로운 시퀀스 clock이나 본체/FX 실행 분기를 만들지 않는다.


새 증거 정본은 위 r5 문서와 이 증거 폴더의 `save-reopen-receipt.json`·`reopened-runtime.json`·`reopened-actual.png`·`public-browser-warn-error-log.json`·`body-gif-receipt.json`·`fx-playback-frames/capture.json`이다. `actual-tail-readability-body-only.gif`와 `actual-tail-readability-with-impact.gif`는 public Play의 실제 JPEG 재생 기록이며 합성·가상 frame0이다.

## 2026-10-11 현행 · 실제 idle와 꼬리치기 전환 r6

[r6 idle·전환 정본](FDG_TAIL_IDLE_TRANSITION_20261011.md)을 따른다. 승인 r5 scene을 복사하는 `tools/fdg-studio/build-hell-aberrant-idle.mjs`의 `buildTailIdleScene(baseline)`이 실제 작은 호흡·상체 무게 이동을 별도 clip으로 저작하고 같은 owner clock의 기존 clip 전환 경로로 idle→한 번 공격→idle을 연결한다. 기존 r2/r3/r4/r5 보고·배송·검사·proof 수치는 동결 이력이며 재실행·새 인수 합산0이다.

| 항목 | 현재 r6 계약 / 새 증거 |
|---|---|
| 배송 | `fixtures/hell-aberrant-tail-idle.fdg.json`=`hell-aberrant-tail-idle-scene-r6`, compact824373bytes. 별도 `.rig.json`=`hell-aberrant-tail-idle-transition-r6`, compact717356bytes. r5 원본과 기존 배송 fixture 덮어쓰기0 |
| 실제 idle / 모델 | 새 `hell-idle-breath`=`대기 · 호흡과 상체 무게 이동`, 2초/24FPS/loop true/상체6tracks/각9keys. 총3clips이며 r5 공격2종(각3초/24FPS/20tracks)은 전체 deepEqual. 3864정점/4850삼각형/32본/1재질·mesh/weights/UV/drawOrder/source PNG·발/다리/27cap 보존. ENGINE_AUTHORING·보이는 표면2.5D·nativeCombatApplied:false |
| 복귀 / 진입 설정 | node.returnTo=`{clipId:'hell-idle-breath',transitionSeconds:0.35}`, sequence.autoStart=false, entryTransitionSeconds=0.25. non-loop 끝 `time+1e-9>=duration`에서 기존 crossfade로 idle time0에1회 복귀. 진입15owner틱/0.25초·복귀21틱/0.35초, loop에서는 재복귀0 |
| 실행 / 거부 guard | 최초 ready·재열기 일반 Play/step은 현재 idle·저장 clip을 진행하며 activation0. completed/stopped 후 일반 Play도 새 회차를 만들지 않고 기존 완료 회차를 보존하며, ‘공격 1회’ Replay만 현재 clip/time에서 공격0초 진입 blend를 생성하고 같은 호출에서 즉시 arm. returnTo 노드에 transition이 있으면 setClip/replay false·pose/state 불변·UI clip/공격 비활성. 자동 복귀는 sequence disarm0·completed/회차/event/emitted/pending 보존, elapsed는 마지막 공격2.9999999999999942≈3초로 고정하여 idle node time과 구분 |
| FX / native | sequence ID=`hell-aberrant-tail-idle-impact-r6`, node=`hell-body-node`, clip=`tail-swipe-once`, startTime0.900초. 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 640²셀/6×4/24frames/16FPS/life1.5초·scale0.16·anchor[0.5,0.5]·offset[-145,-84]·102.4×102.4px 표시 유지. attack54틱 crossing1회·trigger age0/frame0. native cooldown110/projectile life200/recover30/rec50 game-frame·attackWindow[0.15,0.85] progress 및 비환산 유지 |
| 새 데이터 / 구문 검사 | `test/fdgTailIdleTransition.test.mjs` 최초4/4 PASS, fail/skip/cancel0,2865ms. 기존 suite/PNG/native 검사 재실행0. 변경 scene runtime/schema·owner runtime/project·panel/studio·새 builder JS 최초7/7 구문 PASS를 별도 기록하고 test4에 합산하지 않음 |
| 실제 body-only 공개 | sequence만 생략한 자체 scene의 공개 Import→Play→once 선택2회→idle 자동 복귀2회. `actual-idle-tail-idle-body-only.gif`:133실제 CDP JPEG/960×540/8940ms/20335209bytes. runtime 속도 변경·합성 pose·가상 frame0 |
| 실제 shipping 공개 | 일반 Play idle 회차0→‘공격 1회’→0.900초 event1/실제 FX→idle 복귀 completed/event1/FX0. `actual-idle-tail-idle-with-impact.gif`:61실제 JPEG/960×540/4890ms/9709098bytes. 공개 Pause는 복귀 blend 뒤 idle0.8166666666666675/transitionnull에서 적용됐다. paused clip 선택의 새 entry 뒤 공개1틱으로 node/clock/transition.elapsed가1/60초 증가한 결과를 기록 |
| 새 저장·재열기 | 전체 public save→export→reopen→export 정확1회, 양 export2996047bytes·full JSON deepEqual·실제3864vertices/32bones pose deepEqual. saved once time1/60과 transition{fromClipId:'hell-idle-breath',fromTime:0.8333333333333343,duration:0.25,elapsed:1/60}·returnTo0.35·resources/sequence/map/camera/preview 보존. reload owner0·ready/activation0/event0/emitted0/FX0. 이후 일반 Play owner4.39999999999999/idle1.4166666666666665/transitionnull·ready0/event0/FX0, 오발0 |
| 시각 / cache / 증거 | 이번 보이는 idle·진입·공격·idle복귀·FX 가독성 VISUAL VERDICT: PASS / 전체 모델 RETOUCH, 정확1건 SOURCE_GAP=단일 정면 PNG에 없는 숨은 표면. 공개 수집 warn/error0. native게임/전체3D/Windows/GPU 인수0. URL `index.html?v=tail-idle-r6-final`, Studio/owner/project/scene schema/consumer/panel graph `tail-idle-r6`, fixture `tail-idle-r6-fixture`; pure math/texture r4 cache 및 독립 lab r3 기본 preset 유지 |

새 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-idle-transition-r6/`의 `first-tests-tail-idle-transition.log`, `targeted-tail-idle-transition-receipt.json`·`targeted-tail-idle-transition-metrics.json`·`syntax-checks.json`, 실제 GIF 두 개, `save-reopen-receipt.json`·`reopened-runtime.json`·`before-reopen-pose.json`·`reopened-pose.json`·`post-reopen-idle-runtime.json`·`public-browser-warn-error-log.json`이다. 구현·자체 검수 완료 범위이며 기존 native 전투·맵·source/PNG·타인 WIP의 인수를 바꾸지 않는다.

| r6 소비 경로 | 정확한 동작 / 기본값 |
|---|---|
| `_changeClip(node,clipId,duration)` | hold 해제, duration>0이면 `{fromClipId:currentClip,fromTime:currentTime,duration,elapsed:0}`, 아니면 transitionnull. target clip/time0 설정 |
| `setClip` / `replaySequence` guard | returnTo node에 이미 transition이 있으면 false·원래 pose/state 유지. seek/material/view에 새 guard를 확대하지 않음 |
| ready 자동 시작 | autoStart 미지정/true만 기존 ready auto activation. false에서는 owner Play/step으로 현재 clip·저장 transition을 진행하고 sequence ready/activation0/event0 유지; 기존 owner 실제 atlas 준비 gate는 유지 |
| explicit Replay | entryTransitionSeconds(기본0)의 기존 crossfade 상태를 구성한 같은 호출에서 activation+1·active·event/emitted0·pendingnull·sequenceElapsed0. 다른 노드/ownerclock/기존 FX 유지 |
| update 순서 | node/기존 transition 진행 → active sequence crossing 및 sequenceElapsed=node.time·완료 latch → non-loop returnTo 경계에서 기존 `_changeClip`로 idle 복귀. pending 이벤트와 completed 상태를 수동 disarm으로 지우지 않음 |
| 완료 후 elapsed | returnTo node는 마지막 active attack 시간을 sequenceElapsed로 유지; ready는0. node의 idle loop time/transition은 별도로 snapshot 표시 |
| FX 살아 있음 검증 | 실제 살아 있는 동일particleIndex0/pool reference/count1/emitted1을 수동 setRigClip→idle0.35초에서 보존, 이후90틱/life1.5초에 만료. 정상 attack 자동 복귀3초 시점은 FX의 명목 만료2.4초 이후이므로 이 수동 검증과 구분 |
| 저장 / 재열기 | 중간 clip transition은 capture와 재열기 실제 geometry가 동일. owner0/FX0/sequence ready0, autoStart:false의 일반 Play는 saved once pose→idle로만 진행하여 stale event0 |

## 2026-10-11 현행 r7 opt-in · 흉곽·골반 깊이 계약

아래는 r7 제작에 확정된 선택 계약이다. 승인 r6 배송·클립 전환·FX 및 기존 보고·검사·proof 수치는 그대로 보존한다. r7 geometry·최종 배송·새 공개 시각/저장 결과는 아래에 기록한다. 새 전용 데이터/consumer 검사도 최초 결과만 아래에 기록하며 기존 인수 수치에 합산하지 않는다. 현재 제작·검수 정본은 [흉곽·골반 깊이 r7](FDG_TORSO_DEPTH_20261011.md)이다.

| 항목 | r7 선택 계약 / 적용 범위 |
|---|---|
| `mesh.faceColors` | optional 배열. 있으면 정확히 `mesh.triangles.length`개이며 각 값은 `null` 또는 RGB6자리 hex `#rrggbb`. 생략/null인 면은 기존 선택 material/UV 소비 경로를 유지 |
| 명시 색 면의 권위 | 색이 지정된 면만 원화 없는 짧은 sidewall의 ENGINE_AUTHORING plain flat face로 표시. 기존 앞면 UV·source PNG에 tint를 덧붙이지 않으며 숨은 표면을 원본에서 복원한 것으로 표시하지 않음 |
| 평가·소비 | `evaluateRig`는 선택 faceColors를 독립 복사. Scene와 RigPreview는 원본 texture와 명시 authoring flat face를 구분해 같은 CPU Canvas 경로로 소비 |
| 카운터 | `textureDraws`는 실제 성공 `drawImage` 수, 신규 `authoringDraws`는 성공 flat `fill` 수. Scene `drawNode()`의 textured 혼합 경로 반환은 두 수의 합이며 RigPreview는 snapshot에 두 카운터를 제공. plain material에서는 명시 색 fill1과 기존 면 fill+stroke2를 합산. GPU draw call이나 성능 인증 수치가 아님 |
| `drawRigAuthoringTriangle(ctx,{color,triangle,projected})` | RGB6자리 hex 색(대소문자 허용)·유효 index의 finite projected XY point를 검사. signed2배 면적의 절댓값이 epsilon=`1e-9` 이하이면 생략. `save→path→fill→restore`, 성공 fill 수 **1**, 무효/생략/throw는 **0**. 이미지·새 clock·GPU resource를 소유하지 않음 |
| 기존 면 경로 | `null`/미설정 면의 선택 material/UV와 기존 texture affine·layer/depth 정렬 계약을 유지. texture 없는 기존 색 material의 normal shade 및 fill+stroke 경로를 명시 authoring flat face와 구분 |
| 데이터 대응 | `mesh.faceColors[triangleIndex]`가 해당 면의 `null` 또는 RGB6 hex 문자열을 지정. 개수는 정점 수가 아니라 삼각형 수에 대응하며 선택 material의 필수 color/texture/UV 검증을 대체하지 않음 |
| 준비·정리 | RigPreview의 textured loading/error는 기존 texture 준비 gate로 두 카운터 모두0; Scene는 owner image 준비 계약을 유지. node/preview snapshot에 `authoringDraws` 추가. Preview는 render/dispose에 카운터0 정리, Scene는 dispose에 기존 노드 map 해제. 새 Image/RAF/clock/texture source 추가0 |
| 새 제작 경로 | builder `tools/fdg-studio/build-hell-aberrant-torso.mjs`, 별도 `fixtures/hell-aberrant-torso-depth.rig.json`·`fixtures/hell-aberrant-torso-depth.fdg.json`. geometry·최종 파일 수치·cache·공개 검수 값은 아래 확정 표에 기록 |
| 범위 | 같은 r6 계열의 실제 흉곽·골반 앞면 곡률/단면/짧은 sidewall 깊이 저작. 기존 r6 원본·32본·발/다리/tail·idle→attack→idle·FX 보존 계약. 새 source art/texture·PBR·GPU backend·native 전투·맵 변경0, canonical3D 복원 인수0 |

r7 문서 백업과 신규 동기화 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-depth-r7/`에서 관리한다. 기존 r2/r3/r4/r5/r6 자료는 동결하며 새 검수 결과로 덮어쓰거나 재실행·합산하지 않는다.

### r7 geometry 확정값

| 항목 | 현재 빌더·fixture에서 확인한 값 |
|---|---|
| 저작 데이터 | `buildTorsoDepthScene(baseline)`이 승인 r6 scene을 독립 복사. rig ID=`hell-aberrant-torso-depth-r7`, scene ID=`hell-aberrant-torso-depth-scene-r7`, 이름=`지옥기형 · 흉곽과 골반 저작 두께`. 별도 `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.{rig.json,fdg.json}` |
| 메시 증분 | **3895정점/4894삼각형** = 기존3864정점/4850삼각형 + rear31정점/명시 색44면. atomic side segment22개=chest13/pelvis9; 원 front 삼각형4850·원 XY/UV/weights/layer 보존, 새 side face layer0 |
| 앞면 깊이 | torso 앞면57정점만 양의Z 저작(chest40: sourceY<632px, pelvis17). 실제 최대Z=`0.2787834444444444` model units. 원화에서 복원한 해부학 수치가 아님 |
| side·분리 | rearZ chest=`−0.18`, pelvis=`−0.12` model units. 색 chest=`#756871`, pelvis=`#665b65`; `mesh.faceColors[0..4849]`는 null, 뒤44개는 명시 색. 새 rear 정점은 대응 front XY/UV 및 weights 복사 |
| 접합·원화 | shared non-torso front Z=0. T-junction 중간점 Z를 끝점의 선형 보간으로 맞추는40개 constraint·12passes; metadata max error=`1.3877787807814457e−17` model units, source collinearity tolerance=`0.0001`px. source832×1248·300 source px/model unit·origin[500,1140] 유지 |
| 유지·권위 | 같은32본/3clips/기존1 texture material·발/다리/tail·idle→attack→idle·r6 sequence/FX/native/map 보존. `depthAuthoring.authority:'ENGINE_AUTHORING'`, `revision:'r7'`, `sourceRecovered:false`, `fullBackAuthored:false`, `sourceTextureChanged:false`, `limbsChanged:false`, `nativeCombatApplied:false`. 짧은 sidewall이며 전체 뒷면·canonical3D 완료 선언0 |
| 새 인수 상태 | geometry·최종 배송·공개 재생/카메라·자기 저장·시각 결과는 아래 새 증거로 기록. 새 syntax12/12와 최초 targeted6/6을 구분. r6·old 검사와 proof 재실행/합산0 |

ROI·단면 ring·22개 명시 side segment와 Z 수식의 정확한 표는 [리그 데이터의 r7 geometry 정의](FDG_RIG_PROJECT.md)를 따른다.

### r7 현재 배송·공개 검수 · 새 전용 검사 완료

위 r6의 ‘현행/현재’ 표기는 당시 승인 기록이며 그 데이터·수치·proof 행을 보존한다. 현재 배송은 r7의 독립 torso-depth fixture다. r7의 선택 faceColors·깊이 geometry가 있는 리그에 아래 확장을 적용하며, 필드가 없는 기존 리그는 원래 material/UV·plain shade 계약을 유지한다.

| 항목 | r7 현재 값 / 새 실제 증거 |
|---|---|
| scene 배송 | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.fdg.json`, compact **859941bytes**, SHA256=`98ea7bf3399e90f4e34f3b244ec7dfa76d9bcc81ba6e5bd1598d0ba759a8a3c9` |
| rig 배송 | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.rig.json`, compact **752920bytes**, SHA256=`744a087e7e71b142846c7eee614d7c07d2dd1514bbf09cb3a55c0027ec7a6385` |
| 정면 실제 재생 | yaw0/pitch0, 공개 Play→공격1회→자동 idle. `front-playback.json`·`front-idle-attack-idle.gif`: 실제 CDP JPEG **61장**, GIF **5790ms / 960×540 / 9757923bytes**. textureDraws4850 / authoringDraws0; side의 projected area가0이므로 flat fill0. 완료 activation1/event1/emitted1/FX0 |
| 작은 오른쪽 실제 재생 | yaw+22°=`0.3839724354387525`rad, pitch6°=`0.10471975511965977`rad. `right-playback.json`·`right-depth-idle-attack-idle.gif`: 실제 JPEG **59장**, GIF **5620ms / 960×540 / 9349266bytes**. textureDraws4850 / authoringDraws44; 공개 Play→공격1회→자동 idle, 완료 activation1/event1/emitted1/FX0 |
| 좌우 화면·카메라 | `left-yaw-minus22-pitch6.png`·`right-yaw22-pitch6.png`는 실제 native UI로 yaw±22°/pitch6°를 저장 모델에 반영한 화면. DOM fill/Tab만으로 값 표시를 바꾸면 store는 변경0이므로 실제 native Up으로 commit한 값이 기준. 이전 candidate side 실험 파일은 최종 proof로 사용하지 않음 |
| 자기 저장·재열기 | public save1/reload1/export2. 두 export **3130350bytes**씩, fullJSON·mesh/weights/materials/clips·3895 posed vertices/32 bone positions 전후 equal. saved idle time=`1.649999999999999`초와 실제 camera+22°/6° 보존. reload owner clock0·ready/activation0/event0/FX0. `save-reopen-receipt.json`·`saved-reopened.png` |
| 새 구문 검사 | `new-syntax.json`: 변경된12modules의 신규 구문 검사 **12/12 PASS**. 전용6개 데이터/consumer 검사와 별도 기록, old suite/proof 재실행0 |
| 새 전용 검사 | `test/fdgTorsoDepth.test.mjs` 최초 **6/6 PASS**, **1300.32ms**, fail/cancel/skip0, 재실행0. 보존된 front prefix·실제 curvature/side/T-junction·strict faceColors17무효 구성·평가 독립 복사·Scene/Preview 혼합 Canvas·9motion/owner FX/return/capture를 검증. `first-tests-torso-depth.log`·`new-tests.json`·`targeted-torso-depth-receipt.json`·`targeted-torso-depth-metrics.json` |
| 새 CPU 수치 | chest40의 Z=`0.026402068371157716..0.2787834444444444`, pelvis17=`0.046791111111111276..0.1995` model units; same-Y 최대 sagitta 각각0.2787834444444444/0.1995model. bind side 면적=`0.0003999999999999959..0.005531726674375732`model². welded/shared seam error0,9samples의 limb/worldbone/foot/27capXY/front-rearXY drift0. 검사 epsilon=`1e−7`model은 렌더 projected area epsilon1e−9와 별도 |
| synthetic와 actual 구분 | mock Scene/Preview 혼합1texture+1flat fill/Preview Image1·extraRAF0. 배송 데이터의 CPU renderer yaw0.5/pitch0.25rad는 texture4850+authoring44(chest26/pelvis18)=4894Canvasops. 위 실제 공개±22°/pitch6° 증거와 별도 좌표·검수 |
| owner 데이터 검사 | 같은 owner .9초 crossing에서 새FX age0/frame0,90틱1.5초만료,3초completed 후21틱/.35초idle복귀. faceColors4894 capture 보존; setProject 후 mock owner 기존 Image21개 수 불변·clock0/readyactivation0/FX0, dispose RAF/listener/observer 정리. 새 Image21개를 추가했다는 뜻이 아님 |
| 시각 판정 | root가 실제 새 정면·작은 좌우·공격 frame으로 이번 흉곽/골반 깊이·동작/FX 가독성 범위를 확인한 **VISUAL VERDICT: PASS**. 전체 모델 **RETOUCH**, 정확1건 **SOURCE_GAP**=원화 없는 전체 뒷면·숨은 side 표면. authoring 추정 side는 새 canonical 원화/전체3D 복원 인수가 아님 |
| cache·기본 preset | index→studio 및 rig.html→rig-studio와 현재 rig 데이터/수학/texture/Scene/Preview graph query=`torso-depth-r7`. Studio 배송 fetch=`hell-aberrant-torso-depth.fdg.json?v=torso-depth-r7-fixture`. 독립 rig lab 기본 fetch는 r3 `hell-aberrant-motion.rig.json?v=tail-continuity-r3-final` 유지. scene schema의 isLocalAsset import는 기존 `project.js?v=tail-sequence-r4-final` 유지 |
| 보호 범위 | 이번 source PNG 읽기/수정0·r6 원본 fixture 덮어쓰기0·main/native전투/main-save/LOCK/맵/타인WIP 변경0. 기존 suite·PNG·기존 proof 재검수0, Windows/GPU/본편 성능 인수0. local checkpoint는 root가 별도 기록 |
## 2026-10-11 현행 r8 · 몸통 단면 연결과 피부 톤

기존 r7·r6 데이터·검사·proof 행은 당시 동결 기록으로 보존한다. root의 r7 최종 해석은 기술 한정 인수/시각 RETOUCH다. 겨드랑이·흉곽 아래의 밝은 grey flat 패널과 약한 둥근 볼륨을 후속 저작으로 보정하며, 이전 한정 시각 PASS 기록을 새 모델 전체 인수로 읽지 않는다. 현재 제작·새 검수 정본은 root 소유 [몸통 단면 연결·톤 마감 r8](FDG_TORSO_SIDE_FINISH_20261011.md)이다.

| 현재 변경 / 정의 | r8 계약과 근거 |
|---|---|
| 저작 범위 | `tools/fdg-studio/build-hell-aberrant-torso-side-finish.mjs`의 `buildTorsoSideFinishScene(baseline)`이 동결 r7을 독립 복사. 기존 rear31정점에 sourceY별 연속 piecewise-linear factor를 적용하여 Z24개만 변경·7개 plateau 동일. 기존44side face 전부 유지하고 같은 faceColors 소비로 더 어두운 warm charcoal 10종 facewise 톤을 지정 |
| 보존 | 원3864정점 XYZ·앞면 UV/원 texture/weights/topology/layer 보존. 총3895정점/4894면·32본/3clips·발/다리/27cap/tail·idle→attack→idle·기존 sequence/FX/native/map 동일. 기존 plain renderer/consumer/backend 사용, 새 source/texture/PBR/GPU/schema 추가0 |
| 깊이·톤 | rear 실제Z chest=`−0.18..−0.12240000000000001`, pelvis=`−0.12..−0.0816` model units. source Y ring 보간 factor로 `Zr8=Zr7×factor(part,sourceY)`; 각 side face 색은 해당 front endpoint 평균 sourceY의 `toneFactor=.9+.1×factor`로 지정 base RGB를 곱하고 성분별 round. 원 source 앞면 tint가 아님 |
| 현재값의 권위 | 복사된 `provenance.depthAuthoring.rearDepthModel/sideColors`는 동결된 r7 저작 이력이며 현재 r8 값이 아니다. 실제 runtime 값은 `mesh.vertices`·`mesh.faceColors`, r8 저작 정의/배송 record는 `provenance.sideFinish`가 정본 |
| 현재 배송 | 별도 `tools/fdg-studio/fixtures/hell-aberrant-torso-side-finish.fdg.json`=`hell-aberrant-torso-side-finish-scene-r8`, compact867875bytes; `.rig.json`=`hell-aberrant-torso-side-finish-r8`, compact760840bytes. r7/r6 원본 덮어쓰기0 |
| 현재 cache | 변경은 index의 `studio.js?v=torso-side-finish-r8`와 Studio의 `hell-aberrant-torso-side-finish.fdg.json?v=torso-side-finish-r8-fixture` fetch 두 key. 기존 r7 rig/Scene/Preview 소비 graph·rig.html과 독립 lab r3 기본 preset 유지 |
| 새 실제 재생·시각 | `playback.json`·`side-finish-idle-attack-idle.gif`: 실제60JPEGframes / 5540ms / 960×540 / 9416644bytes. 공개 Play→공격1회→자동 idle, activation1/event1/emitted1/종료FX0, texture4850+authoring44·side 숨김0. root가 새 `front.png`·`left-minus22-pitch6.png`·`right22-pitch6.png`의 정면/작은 좌우±22°/pitch6°와 오른쪽 실제 재생 body+FX로 밝은 패널 감소·겨드랑이/흉곽/골반 연결을 확인한 한정 VISUAL PASS. 전체 모델 RETOUCH/숨은 표면 SOURCE_GAP1 유지 |
| 새 저장·재열기 | `save-reopen-receipt.json`: public save1 / actual reload1 / export2. fullProject/fullExportJSON·mesh/weights/materials/clips·3895 posed vertices/32 bone positions equal. 저장 idle=`1.5499999999999994`초/yaw22°/pitch6° 보존; after owner clock0·ready/activation0/event0/FX0, 두 export3151574bytes. 실제 r8 module 재열기는 `reopened-module.json`으로 확인; 앞 dirty candidate의 페이지 교체 실패 reload/goto는 채택 증거가 아님 |
| 새 구문·관측 | `new-syntax.json`: 실제 변경 `tools/fdg-studio/studio.js`·`build-hell-aberrant-torso-side-finish.mjs`의 **2/2 PASS**. index HTML entry 변경1개를 JS 구문 검사로 합산하지 않음. 새 공개 관측 pageErrors0, 구 proof 재조회0 |
| 새 전용 검사 | `test/fdgTorsoSideFinish.test.mjs` 최초 **4/4 PASS / 2175.09ms**, fail/cancel/skip0·재실행0. front-prefix/geometry보존·11개 독립 knot/7plateau·44톤·9motion/실제CPU소비·in-memory capture/JSON reload를 확인. `new-tests.json`·`targeted-torso-side-finish-metrics.json`·`first-tests-torso-side-finish.log`; 기존 r7의6개 및 old suite와 합산0 |
| 새 CPU 관측 | 9phase의 원3864prefix LBS/worldbones/foot/27capXY/front-rear **hierarchy-world model XY** drift0. 전체 side 면적 min=`0.00037996251032275445`/max=`0.004940618460543637`model², 최소Zspan=`0.0816`model=`24.48`source-equivalent px(투영 화면 폭 아님). ±22°yaw/+6°pitch CPU에서 texture4850+plain44=4894Canvasops, 현44색 정확 소비 |
| 색 비교의 의미 | encoded8bit RGB 가중합 `0.2126R+0.7152G+0.0722B`의 각face r8/r7 최대비=`0.33042556994644995`(<0.4), 각segment front role 톤>rear role 톤. 동결된 r7의44side 색과의 저작 수치 비교이며 원PNG/source색·physical photometry 비교가 아님 |
| 새 인수 상태 | geometry/색/배송·새 실제 재생·자기 저장/재열기·semantic4/syntax2·한정 시각 검수 완료. old suite/source PNG/proof 재검수·새 합산0. 현재 공개 데모 ID·r8배송fetch 확인은 `public-preset-ready.json`·`public-preset-ready.png`. 전체 모델 RETOUCH/단1개 SOURCE_GAP 유지, 이번 추정 단면은 원화 없는 숨은 표면을 복원한 canonical3D가 아님 |

ring·palette·색 생성·메타데이터의 정확한 정의는 [리그 프로젝트 r8 계약](FDG_RIG_PROJECT.md)에 기록한다. 새 증거와 수정 전17문서 백업은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-side-finish-r8`에서 관리하며 이전 자료를 덮어쓰지 않는다.

## 2026-10-11 다크드루이드 NORMAL · 보이는 본체 저작 r1

기존 Hell r2..r8의 ‘현재/현행 배송’·수치·proof는 해당 보스의 동결 이력이다. 아래는 별도 다크드루이드 NORMAL authoring query의 새 첫 사본이다. 기본 Hell preset·standalone riglab 기본값·본편 NORMAL/데모 피날레·마케팅/트레일러 계약은 바꾸지 않는다. 기존 보편 API와 schema 한계는 유지하며 이 사본의 명시 clip/returnTo 설정만 적용한다.

| 항목 | 현재 다크드루이드 저작 계약 |
|---|---|
| 승인 source / 실제 사본 | 기존 `boss_dark_druid_f0.png`, 355×541 RGBA / 479258B. `ENGINE_AUTHORING` visible-surface-2.5D, 3289정점/4644삼각형/19본/1재질/2clips. 원화1장을 UV texture로 소비하며 새24장 방향별 sprite로 계산하지 않음 |
| 실제 동작 / 시간 | `dark-druid-idle` 2초/24FPS/loop/10tracks×9keys → `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×9keys → idle. 공개 clip 선택 entry0.25초=15owner틱; `returnTo.transitionSeconds=0.35`=21owner틱. 같은60Hz owner 사용 |
| 같은 owner 소비 | CPU XYZ LBS·연속초 clip·layer→projectedZ→index sort·Canvas texture/flatface 기존 경로 사용. fixed1/60초/max6/clamp0.25초·API clock/RAF 추가0 |
| 공개 clip 동작 | setRigClip(dark-druid-body-node,dark-druid-staff-strike) entry기본0.25초, attack2.4초 종료 후returnTo idle0.35초. 진행중transition guard 유지; idle loop에서 autoreturn 재발동0 |
| FX/회차 | `rigScene.sequence` 없음 / FX0 / `nativeCombatApplied:false`. sequence snapshot은 idnull/statusunavailable/activation0/event0/emitted0/activeFx[]. 지팡이 타격은 저작 clip이며 native 피해·독탄·Q/E·SFX·충돌·맵·본편 save에 배선하지 않음 |
| 현재 actual render | 실제 공개 정면yaw0/pitch0 textureDraws4622/authoringDraws0; yaw±22°/pitch6° textureDraws4622/authoringDraws22. 단면은 기존 flat fill, 원화앞면 tint/stroke0·새texture/renderer/GPU/PBR0 |
| capture/reload | public save1/reload1/export2, parsed full JSON·posed3289vertices/19bonePositions·clip/time/transition/camera exact. 저장 idle1.183333333333334초 보존, ownerclock4.466666666666656→0, sequence unavailable/activation0/event0/emitted0/FX0. 실제 export pair 각2766448B |
| 제품 범위 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 현재 clip 소비 | spine·head·leftUpperArm T 및12track Z키를같은XYZ LBS/초보간·quaternion slerp로소비. 새clock/runtime/backend/weights0 |
| transition/FX | 기본entry0.25/returnToidle0.35 guard그대로. FX[]·sequenceunavailable/activation0/event0/emitted0 |
| 자체capture | mockattack0.09999999999999999초/entryelapsed동일저장→JSONreloadpose/bones/transitionexact, clock0/Image20→20; 남은138틱→2.4초끝→21틱return. returnt0error2.220446049250313e-16model |
| 실제public왕복 | publicsave1/reload1/export2, 저장attack1.1초/transitionnull·project/node/mesh/bones/UV/weights/material/clips/posedvertices/camera exact; ownerclock5.966666666666651→0, FX0·sequenceunavailable. 실제export pair 각2771920B, byte exact |
| 현재 품질 | 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.
