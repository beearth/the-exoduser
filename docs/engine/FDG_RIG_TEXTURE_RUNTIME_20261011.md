# FDG UV texture 메시·리그 소비 계약 — 2026-10-11

> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

선행 정본은 [리그 데이터](FDG_RIG_PROJECT.md), [3D LBS 수학](FDG_RIG_RUNTIME.md), [리그 장면 소비자](FDG_RIG_SCENE_RUNTIME.md), [독립 제작실](FDG_RIG_STUDIO_20261010.md)이다. `rigVersion:1`에 선택 UV/texture/삼각형 층을 추가하고 기존 본 계층·정점 가중치·XYZ LBS·클립 보간/전환 결과를 같은 CPU Canvas triangle renderer로 표시한다.

승인 HellAberrant 스틸은 `assets/sprites/boss/stage1_codex_hell_aberrant.png`, 선언 치수832×1248이다. source PNG를 편집·복제하거나 새 프레임으로 늘리지 않는다. root가 저작하는 silhouette UV mesh·본·weights·준비→꼬리 sweep→회복 클립을 소비하는 계약이며, 이 runtime 작업은 본편 전투·피해·보스 phase·Q/E·save 계약을 추가하지 않는다. 원본의 회색 배경 제외 범위와 body/tail 형상·가중치·depth·미술 품질은 저작 geometry와 공개 UI 검수가 소유한다.

## 추가 데이터와 강한 검증

```js
mesh: {
  // 기존 id/skeletonId/vertices/triangles/weights 필수 계약 유지
  uvs: [[u, v]],             // optional, vertex마다 정확히1개
  drawOrder: [integerLayer], // optional, triangle마다 정확히1개
  faceColors: [null | "#rrggbb"], // optional r7, triangle마다 정확히1개
},
materials: [{
  // 기존 id/name/meshId/skeletonId/color 필수 계약 유지
  color: '#rrggbb',
  texture: { src, width: 832, height: 1248 }, // optional
}],
```

| 필드 / 상수 | 정확한 값·단위·제약 |
|---|---|
| `mesh.uvs` | optional `vertices.length`개의 배열. 각 값은 정확히2성분 `[u,v]`, 모두 finite0..1 |
| UV 방향 | 원 이미지 좌상단 `[0,0]`, 오른쪽+U/아래+V. v=1은 이미지 아래 경계 |
| source pixel | `[u×texture.width,v×texture.height]`; 메시 단위·화면 픽셀·타일 좌표와 구분 |
| `mesh.drawOrder` | optional `triangles.length`개의 signed integer layer, 각각−8192..8192 |
| `mesh.faceColors` | optional r7 `triangles.length`개 null 또는 RGB6hex 배열. null은 기존 material/UV, 명시 색은 별도 ENGINE_AUTHORING flat fill; 원본 texture tint가 아님 |
| `material.texture` | optional 객체. `src/width/height` 필수; 있으면 mesh.uvs 필수 |
| `texture.src` |1..2048자 로컬 HTTP route 또는 루트 상대 경로. 실제 공백/제어문자/역슬래시·protocol·`//` prefix 거부. 경로 부분의1회 percent decode 뒤 `.`/`..` segment와 역슬래시 거부; query/fragment는 선언값 유지 |
| `texture.width/height` | 각각 정수1..4096 px. `RIG_LIMITS.textureDimension=4096` |
| 동일 source | 같은 프로젝트에서 같은 `src`를 쓰는 materials의 선언 width/height는 정확히 일치 |
| `material.color` | texture가 있어도 기존 RGB6자리 hex **필수**. 기존 색 material 검증을 완화하지 않음 |
| 실제 이미지 | `naturalWidth===texture.width && naturalHeight===texture.height` 정확 일치. 작은/큰 이미지 둘 다 오류 |
| 기존 구조·한계 | bones64/vertices4096/triangles8192/materials64/clips32/tracks64/keys256/influences4/weightTolerance1e-6/UTF-8 JSON2MiB 그대로 |

UV만 저작한 색 메시도 유효하다. texture 없는 기존 문서는 기존 색/normal 음영/edge로 그린다. texture가 선언됐지만 loading/error인 메시를 색 메시로 대체해 texture 성공처럼 표시하지 않는다. material 변경은 같은 mesh/weights/clip을 계속 사용하며 선택 texture 또는 색을 소비한다. texture 객체의 추가 JSON 메타는 기존 저장 검증·직렬화 조건을 그대로 따른다.

## 평가 및 순수 renderer API

| API / 반환 | 계약 |
|---|---|
| `evaluateRig(project,options)` | 기존 평가값에 선택 `uvs`, `drawOrder`, 선택 material의 `texture`를 **독립 복사**하여 반환. source vertex/weights/UV/texture를 변경하지 않음 |
| `rigTextureAffine(source,target)` | 각각3개의 `[x,y]` pixel point를 받아 Canvas `[a,b,c,d,e,f]` 반환. nonfinite/형식 오류/degenerate source 또는 destination은 null |
| `RIG_TEXTURE_AREA_EPSILON` | `1e-9`, source/destination의 signed2배 삼각형 면적 절댓값이 이 값 이하이면 생략 |
| `sortRigFaces(triangles,projected,drawOrder?)` | `{triangle,index,layer,depth}` 배열. layer 오름차순→평균 projectedZ 오름차순→원 triangle index 오름차순 |
| 층 미지정 | 모든 layer0으로 기존 projectedZ 정렬 유지 |
| `drawRigTextureTriangle(ctx,image,{texture,uvs,triangle,projected})` | 성공한 `drawImage` 수1 또는 생략/실패0. caller가 image를 전달하며 이미지 로드·clock·GPU 접근 없음 |

Affine은 `x=a×sourceX+c×sourceY+e`, `y=b×sourceX+d×sourceY+f`로 세 source UV pixel과 세 skinned screen vertex를 연결한다. 삼각형을 그릴 때 `save→screen triangle path→clip→transform→drawImage(original,0,0,width,height)→restore` 순서다. `transform()`은 owner의 현재 DPR 변환에 합성하며 `setTransform()`으로 덮지 않는다. 원본 텍스처에 tint·flat shade·edge를 덧그리지 않고 owner alpha를 보존한다. draw 실패에도 `restore`한다.

이 방법은 CPU Canvas의 piecewise affine texture 매핑이다. perspective-correct UV, GPU skinning/texture, depth buffer, 교차 면의 정확한 visibility, PBR, 원본 밖의 새 외형 생성은 구현하지 않는다. authored layer는 서로 다른 층의 겹침을 명시적으로 결정하고 같은 층에서는 기존 평균 projectedZ의 한계를 유지한다. 기술 검증만으로 silhouette/관절 품질을 승인하지 않는다.

## 독립 RigPreview의 image 수명

| 항목 | 구현 계약 |
|---|---|
| cache | `src`별 `Map`; 현재 프로젝트의 모든 textured material source를 준비 |
| 로드 경로 | root relative src는 그대로, 상대 src는 `/` prefix로 같은 로컬 HTTP 서버 요청. Canvas owner window의 Image 우선 |
| decode | onload 뒤 `image.decode()`가 있으면 await 후 실제 natural 치수 확인 |
| 상태 | `loading`→`ready` 또는 `error`; 오류 문자열·선언치수 함께 snapshot에 제공 |
| loading/error 표시 | Canvas 상단 `TEXTURE LOADING` / `TEXTURE ERROR`; texture triangle draw0 |
| 같은 source 교체 | 선언치수가 같은 ready/loading cache는 재사용. 제거된 src·치수 변경·error record는 retire; error는 **명시 setProject 때만** 새 Image로 다시 시도 |
| 교체 race | callback 시 cache record identity와 disposed 상태 확인. 이미 제거된 source의 decode 완료는 현재 project/render를 변경하지 않음 |
| `dispose()` | 기존 rAF 취소·ResizeObserver disconnect에 texture callback 분리/src 취소·cache clear·image 참조 해제 추가. 늦은 decode 완료 무동작 |
| 추가 clock/event | Image callback 외 별도 rAF/listener/timer 추가0. 기존 playback60Hz/6substeps/.25초 clamp·step1/clipFPS·transition 그대로 |
| `showBones` | 공개 transient property, 기본true. false면 본 연결·점·이름과 선택 정점의 노란5px 점을 모두 생략. root 공개 ‘뼈·정점 표시’ checkbox가 값 변경 후 `render()` 호출 |
| 뼈 표시 저장 | `showBones`는 rig JSON·preview 저장 필드가 아니며 setProject는 이 transient 선택을 덮지 않음 |

`RigPreview.snapshot()`의 기존 필드에 아래 진단을 추가한다. snapshot은 여전히 독립 복사다.

| 필드 | 형태 / 의미 |
|---|---|
| `showBones` | boolean, 현재 transient overlay 표시 |
| `textures` | `[{src,width,height,status,error}]`; width/height는 선언 px, status=`loading/ready/error`, error=null 또는 문자열 |
| `textureDraws` | 마지막 render의 실제 texture triangle `drawImage` 수. GPU draw call/프레임 수/본편 성능 보증 아님 |
| `authoringDraws` | r7 명시 faceColors의 마지막 render 성공 flat fill 수. loading/error의 textured Preview에서는0; 교체 후 render/dispose의 기존 정리 경로를 사용 |

## RigSceneRuntime와 기존 FDGRuntime owner

| API / 연결 | 계약 |
|---|---|
| `new RigSceneRuntime(scene,{worldToScreen,getImage})` | 기존 projection callback 유지; 선택 `getImage(src)` 기본은null 반환. 잘못된 callback은TypeError |
| `requiredSources()` | 모든 resource material의 texture.src 중복 제거 배열; disposed는[] |
| `validateReady(images)` | 기존 owner `Map<src,{image}>`의 정확 natural 치수 검사→`{ok,errors}`. disposed는okfalse |
| `drawNode()` | textured evaluation이면 getImage를 사용해 같은 pure helper로 그린다. unavailable/치수 불일치/degenerate triangle은draw0. 색 material은 기존 fill+stroke 각2연산 유지 |
| draw count | texture triangle당 `drawImage`1. owner `drawCalls`는 실제 Canvas draw 연산 합계이며 GPU 지표가 아님 |
| node snapshot 추가 | 선택 `uvs/drawOrder/texture` 독립 복사 및 `textureDraws`(마지막 drawNode의 성공 수) |
| image owner | FDGRuntime `_collectSources()`에 rig requiredSources 추가, 기존 assets/_loadAsset/loading/error/retire/dispose 관리 재사용 |
| owner ready 검사 | load 완료의 현재 version에서 validateReady 검사. 오류 source=`rig-texture-images`로 기존 onError/stats errors에 보고 |
| scene 자체 자원 | Image/rAF/listener/timer/GPU context 추가0; dispose 시 getImage callback 참조도 해제 |
| 시간·층 | 기존 owner60Hz, node clip/transition·월드 발Y 합성·projection·viewport culling 유지. 새 triangle layer는 리그 내부의 면 순서만 결정 |

## 새 전용 검증 및 파일 범위

명령: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --test test/fdgRigTexture.test.mjs`. **첫 실행8/8 PASS**, fail0/skip0. 기존 완료 suite·종주·PNG 재검수는 실행0이다. tests는 새 synthetic UV/texture metadata·fake Image/Canvas로 실제 계약을 검증하며 승인 PNG를 읽지 않는다.

| 새 검증 | 확인한 의미 |
|---|---|
| affine | skew/mirror의 세 point 일치, source/destination degenerate·NaN 거부 |
| Canvas 실제 명령 | clip→affine→원 image draw 순서, 현재 DPR2 합성, 성공/throw 후 상태 복원, 틀린 natural 치수 draw0 |
| 층 | authored layer 우선, 동일 층 projectedZ·원 triangle index 안정 정렬 |
| schema | UV 필수·길이/범위, drawOrder 길이/정수/8192 bound, local source, 치수/같은source 일치, texture에서도color필수, plain색 호환 |
| actual LBS | tail bone 회전에 실제 XYZ vertex 변형·body 유지·회복 bind 복귀. UV/원 source·중첩texture metadata 복사 격리 |
| scene | owner image/helper 소비, 치수fail, 실제 image draw 수, dt1초 진행·capture 원 저작데이터 보존·추가rAF/listener0 |
| preview 수명 | pending decode 중 교체·late 완료 차단, ready 재사용, 치수오류·명시재시도, showBones transient, pending dispose 정리 |
| runtime 접점 | source 기존 assets 등록, render 시간고정·step1/60, 제거된texture retire·ready actorcache 공유, dispose정리 |

| 파일 / 검색 | 경로·범위 |
|---|---|
| 소유 변경 | `engine/fdg/rig-project.js`, `rig.js`, `rig-scene-runtime.js`, 새 `rig-texture.js`, `tools/fdg-studio/rig-preview.js`; runtime.js는texture owner 등록·ready검사 접점만 |
| 새 검사/문서 | `test/fdgRigTexture.test.mjs`, 이 문서 |
| 수정 전 백업 | `tmp/fdg-rig-texture-20261011/*.before`(기존 소유 파일5개) |
| docs 전체 검색 | `rg -n -i 'RigPreview|RigSceneRuntime|rigVersion|evaluateRig|UV|texture|drawOrder|showBones|cpu.canvas' docs/` 및 literal `grep -r -n -I -E` |
| 검색 로그 | `tmp/fdg-rig-texture-20261011/docs-rg.log`, `docs-grep.log` |
| root 소유 | 실제 geometry factory/fixture·preset UI·checkbox·공개 시각/모션 증거·기존 docs 전체 상태 동기화·통합 commit |
| 접근/변경0 | source PNG 편집/복제/검수, 새 frame 생성, main/game/R checkout/전투/Q/E/save 변경, 기존 suites, Git 명령 |

## MAP PRODUCTION REPORT — 리그 texture 소비만

| §23 항목 | 이번 runtime 작업의 범위 |
|---|---|
| STAGE / MASTER | 일반 리그 소비. production 맵 silhouette/region/mainroute/side space 제작 없음 |
| OUTER MASS / LARGE / MEDIUM / GROUND | 신규 환경·composite·connection·ground texture 제작 없음 |
| PLAYABLE | 기존 map collision 그대로, 리그는 무충돌 시각 consumer. 전투 Gate 없음 |
| LANDMARK | 새 환경 landmark 없음 |
| CAMERA QA | 기존 projectedZ/직교투영과 DPR 합성 기술 검증. 공개 카메라/꼬리 모션은root 인수 |
| TECH QA | 새synthetic8/8 PASS. 승인 PNG decode·pageerror/404·실기 성능·전투 가독성은 root의 새 공개 UI 증거 |
| FILES | 위 소유파일만. root UI/geometry·기존 docs 변경을 되돌리지 않음 |
| GIT | 이 worker Git/commit/push/deploy0. root checkpoint에 코드+docs 통합 |
| VISUAL VERDICT | **RETOUCH — 이 worker는 실제 PNG/공개 UI를 검수하지 않음.** 기술 PASS를 최종 모델/모션/production 시각 PASS로 대체하지 않음 |
| NEXT PASS | root가 실제 silhouette·회색 배경 제외·꼬리/body layer·준비/sweep/회복과 공개 pause/step/저장재열기를 새 화면에서 판정 |

### 선택 정점 overlay 보정

공개 texture 모션 화면에서 `showBones:false`일 때 선택 정점의 노란 점이 남는 문제를 보정했다. 선택 정점도 같은 transient gate를 사용한다. 보강한 Preview 검사1개만 `node --test --test-name-pattern='RigPreview caches decoded exact-size textures' test/fdgRigTexture.test.mjs`로 실행하여 **1/1 PASS**했다. 숨긴 상태의 실제 Canvas arc 호출0, 표시 상태의 선택점5px 호출을 확인한다. 다른7개·기존suite·PNG 재검수는 실행하지 않았다.

수정 전 백업은 `tmp/fdg-rig-texture-20261011/rig-preview.selected-vertex.before`, docs 전체 `rg`/literal `grep -r` 검색 로그는 같은 폴더의 `docs-selected-vertex-rg.log`·`docs-selected-vertex-grep.log`다. root의 UI label·공개 화면 증거·다른 문서 변경을 되돌리지 않는다.

### 2026-10-11 texture-motion r2 최종 import 캐시 경로 (동결 이력)

아래11개 import와7개 구문 검사는 r2 당시의 동결 이력이다. 당시 `?v=texture-motion-r2-final`로 통일하여 같은 version URL의 `rig-project→project→rig-scene-project→rig-project` cycle을 소비했다. 이 기록을 현행 r4 runtime/schema chain의 query로 사용하지 않는다.

| r2 당시 importer | 당시 통일한 dependency |
|---|---|
| `engine/fdg/rig-project.js` | `project.js`(Signals/clone) |
| `engine/fdg/rig.js` | `rig-project.js` |
| `engine/fdg/rig-scene-project.js` | `rig-project.js` |
| `engine/fdg/rig-scene-runtime.js` | `rig.js`, `rig-scene-project.js`, `rig-texture.js` |
| `engine/fdg/project.js` | `rig-scene-project.js` |
| `engine/fdg/runtime.js` | `rig-scene-runtime.js`, `project.js` |
| `tools/fdg-studio/rig-preview.js` | `rig.js`, `rig-texture.js` |

r2 당시 root가 `rig-studio`, `rig.html` entry, main `studio`, `rig-scene-panel`의 해당 import/entry를 연결했다. 기존 inspector/저장/임포트 구조와 source/terrain 등 다른 module 계약은 보존했다.

수정 전7개 파일 백업 및 docs 전체 `rg`/literal `grep -r` 로그는 `tmp/fdg-rig-texture-20261011/import-cache-r2/`에 있다. 변경한7개 파일의 `node --check` **7/7 PASS**. import version 변경에 대해 신규8개 test/기존 suite/PNG 검수는 재실행하지 않았다. 승인 PNG source의 문서 표기는 정확히 `assets/sprites/boss/stage1_codex_hell_aberrant.png`로 정정했다.

r4 당시 장면 시퀀스의 runtime/schema chain·Studio entry·fixture fetch query는 [r4 시퀀스 정본](FDG_TAIL_SEQUENCE_20261011.md)의 동결 이력이다. 위 r2 import 표·7개 구문 검사·기존8개 texture 검사를 r4에서 재실행하거나 새 검증과 합산하지 않았다.

## 2026-10-11 꼬리치기 가독성 r5 (동결 이력)

r5의 배송·수식·검사·실제 공개 GIF·저장·시각 결과는 아래 당시 이력으로 보존한다. r6 결과와 합산하거나 이전 자료를 재실행·덮어쓰지 않는다.

[r5 정본](FDG_TAIL_READABILITY_20261011.md)의 새 리그·장면 fixture는 기존 UV/texture/drawOrder·메시·가중치·32본·PNG와 CPU Canvas 소비 계약을 유지하며 authored clip key만 보정한다. runtime/schema chain은 `tail-sequence-r4-final`, panel은 `tail-sequence-r4-complete`를 유지하고 main Studio entry는 `tail-readability-r5-complete`, 새 scene fetch는 `tail-readability-r5-fixture-final`로 구분한다. 기존 r2/r3/r4 보고·자료·검사는 동결 이력이며 재실행·새 인수 합산0이다.

## 2026-10-11 현행 · 실제 idle와 꼬리치기 전환 r6

[r6 정본](FDG_TAIL_IDLE_TRANSITION_20261011.md)은 같은 r5 UV/texture/drawOrder·3864정점/4850삼각형/32본·메시·가중치·원 PNG의 소비에 새 idle clip과 기존 crossfade 연결만 추가한다. 선택 node.returnTo/sequence.autoStart/entryTransitionSeconds는 장면 소비 계약이며 CPU affine renderer·pure rig math/texture의 `tail-sequence-r4-final` cache를 변경하지 않는다. 현재 main Studio/owner/project/scene schema/scene consumer/panel graph query=`tail-idle-r6`, 새 fixture fetch=`tail-idle-r6-fixture`, 공개 URL=`index.html?v=tail-idle-r6-final`이다. r2/r3/r4/r5 수치·검사·자료는 위 동결 이력으로 유지하고 새 전환 검증에 합산하지 않는다.

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
| 현재 local texture | material approved-dark-druid: mandatorycolor#b1a28f + texture{src:assets/sprites/boss/boss_dark_druid_f0.png,width:355,height:541}; 승인479258B/SHA 유지·실제decodeexact. 원RGB/alpha 쓰기0 |
| UV/face 분리 | front3276정점 UV=[sourceX/355,sourceY/541], front4622면 faceColorsnull. rear13정점은 대응front XY/UV/weights복사,Z−0.055; side22면#28221f/#1b1715,layer4. existingdrawImage/flatfill helper사용 |
| 실제 출력 | 실제 공개 정면yaw0/pitch0 textureDraws4622/authoringDraws0; yaw±22°/pitch6° textureDraws4622/authoringDraws22. 단면은 기존 flat fill, 원화앞면 tint/stroke0·새texture/renderer/GPU/PBR0 |
| 검사 해석 | UV inverse8.788928253162695e-14sourcepx. consumer test 이미지는 mock declared355×541, 승인PNGread-only builder 재현과 root actualbrowserdecode/proof는 별도 근거 |
| 권위 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 기존source소비 | 승인355×541RGBA/479258B/SHA74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68·UV/mesh/weights/재질/19본원형유지. 앞면source tint/stroke/newtexture0; 새Texture/Canvas backend0 |
| clipfringe보정 | 공통 spine→chest→arms 힘 전달; peak chest inheriteddrive[0.13949758129408563,−0.19533373811731902,0]model, staffworldrotation−0.05000000000000001rad. headlocalT 보정 + headlocalZ=leftUpperArm+leftForearm+leftHand의Z로 10key에서 head/staff skin 일치; staff독립track0·childhand T/R0·weights수정0; 17phase boot115정점 drift0·hand/staff skin/weld0. head/staff10key maxerror2.220446049250313e-16; triangle177/351의6개 edgefactor0.9999999999999997..1.0000000000000306. key일치이며 전체연속시간skin동일constraint로 확대0 |
| 실제 정면 | r2phase prepare0.733/peak1.1/recovery1.65에서는 texture4622/authoring0, camera0/0/scale80. r1±22°/6°표는당시동결proof이며이번반복Canvas audit0 |
| 품질 | 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.
