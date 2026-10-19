# FDG v0.5 일반 장면의 3D 리그 제작·소비

> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

v0.20 인스펙터는 `장면 중심 · 월드 좌표`의 camera X/Y와 `모델 회전 · 월드 카메라와 별도`의 모델 수평 회전°/기울기°를 구분한다. 기존 rigScene.camera.yaw/pitch는 모델 회전이며 world-camera toolbar의 project.viewCamera.yaw/pitch와 다른 저장 값이다. 구형 UI의 `SCENE CAMERA · world-Y depth` 표기는 교체했다.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

기준일 **2026-10-11, Asia/Seoul**. 진입은 `http://localhost:3333/tools/fdg-studio/index.html?v=tail-idle-r6-final`의 **3D 장면** 탭이다. 리깅 시험실의 XYZ 리그·색/선택texture재질을 일반 FDG 장면의 리소스와 시각 노드로 소비한다. 같은 `FDGRuntime`의 Canvas·60Hz clock·월드 카메라·발 Y 정렬로 편집→실행→정지/1틱→저장→재열기→다른 장면 교체를 연결했다. UV·원본texture소비를추가했으며기존데이터버전·장면clock·전환한계는유지한다.

데이터와 모든 상한은 [장면 스키마](FDG_RIG_SCENE_PROJECT.md), 공개 API·투영 공식·깊이·시간·정리는 [장면 런타임](FDG_RIG_SCENE_RUNTIME.md), 기존 본·가중치·클립 저작은 [리깅 시험실 v0.4](FDG_RIG_STUDIO_20261010.md)를 정본으로 한다. 새 게임 캐릭터 메시나 본편 전투 판정을 만들지 않았다. 사용자 확정 sprite **24장·24FPS** 목표는 유지하며 리그 clip FPS는 가변이다.

## 소유 파일·리소스·저장

| 파일 / 범위 | 구현 계약 |
|---|---|
| `engine/fdg/project.js` | 기존 schemaVersion1의 선택 `rigScene` 검증. 장면이 있는 전체 compact UTF-8 JSON4MiB 검증 |
| `engine/fdg/rig-scene-project.js` | `version:1`, 리소스8개·노드32개 상한, 참조/좌표/시간/전환/JSON 확장값 검증 |
| `engine/fdg/rig-scene-runtime.js` | evaluateRig와순수UVhelper소비·CPU투영·색/texture삼각형표시, 자체RAF/listener/timer/Image/GPU소유0. owner getImage주입 |
| `engine/fdg/runtime.js` | 기존owner업데이트·카메라·그리기순서·수명에consumer연결. requiredSources의texture를기존assets캐시로load/정확치수검사/교체/정리 |
| `tools/fdg-studio/rig-scene-panel.js` | 장면 노드 추가/삭제·인스펙터·clip/material/seek·현재 상태 capture·패널 리스너 해제 |
| `tools/fdg-studio/index.html`, `studio.css`, `studio.js` | 기존 화면에 3D 장면 탭·toolbar·선택/이력·장면 저장·입출력·수명 연결 |
| `test/fdgRigSceneProject.test.mjs`, `fdgRigSceneRuntime.test.mjs` | 2026-10-10 장면데이터29개·소비자13개, 합계42개동결회귀 |
| `tools/fdg-rig-scene-smoke.mjs` | 2026-10-10 장면소비흐름의실제Chrome8개동결검사 |
| `test/fdgRigTexture.test.mjs` | 2026-10-11 새UV/texture단위8개별도검증, 기존suite재실행없음 |
| `package.json`, `tools/project-check.mjs` | 새 한정 명령2개, 새 모듈/패널/runner4개 구문 등록 |

| 저장 / 작업 | 값·동작 |
|---|---|
| 일반 프로젝트 | 기존 `schemaVersion:1`에 optional `rigScene:{version:1,resources,nodes,camera,sequence?}`. 중첩 노드 트리/Prefab 포맷은 아님 |
| inline 리소스 | `{id,name,project:RigProject}`, 각각기존compact2MiB상한. 원본메시·본·weights·키·pose·선택uvs/drawOrder/texture선언깊은복사. Image저장없음 |
| 노드 | `{id,name,resourceId,position,scale,visible,materialId,clipId,time,transition?}`. `position=[worldX,worldY,heightZ]`px |
| 장면 저장 키 | 기존 `fdg.studio.project.v1`. 사용자 게임 save와 연결하지 않음 |
| 저장 리그 읽기 | 기존 시험실의 `fdg.studio.rig.v1` 읽기만. raw UTF-8≤2MiB 및 validateRigProject 성공 후 장면에 복사 |
| 일반 저장 버튼 | 먼저 실행 pause, 현재 카메라·노드 시간/재질/clip/전환을 capture하여 기존 store에 반영하고 compact JSON 저장 |
| 장면 재열기 | 기존 일반 JSON 복원, 첫 리그 노드를 선택하여 3D 장면 탭으로 진입. 자동 실행하지 않음 |
| 내보내기 | 기존 FDG 프로젝트 파일명·다운로드. 현재 장면 capture 포함; pretty UTF-8이4MiB를 넘으면 compact fallback |
| 가져오기 / 교체 | 기존 일반 FDG 프로젝트 import 경로. 유효성 실패 시 기존 문서 보존, 성공 시 기존 consumer dispose 후 새 장면 소비 |
| 이력 | 기존 ProjectStore80작업. 노드 추가/편집/삭제·실시간 clip/material/seek는 각1개의 검증 transaction |
| 보존 | 기존 map tiles/objects/route·characters/skills/vfx/preview 및 unknown collision/combat JSON 메타데이터. 리그 노드에 새 판정 적용 없음 |

## UI 필드·수치·편집 순서

**3D 장면 → +시험 리그 또는 +저장 리그 → 인스펙터 → 동작/재질 → 테스트 실행/정지 → 장면1틱 → 저장** 순서다. +시험 리그는 v0.4에 이미 있는 3본·16정점·28삼각형 probe를 재사용한다. 게임용 캐릭터 생성이나 모델 import가 아니다. +저장 리그는 시험실에서 편집하고 저장한 기존 문서를 소비한다.

| ID / 필드 | 값·편집 결과 |
|---|---|
| `data-tab="rigScene"`, `rig-scene-toolbar` | 같은 기존 `runtime-canvas` 표시. 별도 scene renderer/Canvas/clock 생성 없음 |
| `rig-scene-add`, `rig-scene-saved` | 새 `rig_${crypto.randomUUID()}` 리소스, `rig_node_${crypto.randomUUID()}` 노드. 이름 `3D 리그 시험 노드`, resource.name=원본 이름 |
| 추가 위치 | `[min(8000,player.x+130),max(0,player.y−60),0]`, scale48/visibletrue, 원본 preview의 material/clip/time |
| 추가 카메라 | 새 노드 XY/followfalse; 기존 scene이면 yaw/pitch 보존, 처음에는 yaw−.65/pitch.32rad. 실제 owner clamp 적용 |
| `rig-scene-delete` | 선택 노드 삭제 후 어떤 노드도 참조하지 않는 리소스 제거. sequence가 해당 nodeId를 참조하면 함께 제거. Undo로 authored scene 복원 |
| `rig-scene-focus` | 기존 setCamera(node.X,node.Y) 후 clamp된 X/Y/followfalse 기록 |
| `rig-scene-clip` | 해당 리소스의 clip 또는 빈 값(bind pose). runtime.setRigClip 기본.25초 전환, target time0 |
| `rig-scene-material` | 해당리소스의호환색/texture material ID. 시간·clip·geometry유지 |
| `rig-scene-time` | 정지 중만 seek, 선택 clip duration 범위, bind fallback2초. HTML step.001초. seek는 전환 해제 |
| `rig-scene-summary` | 현재 초·실제 XYZ 정점 수·전환 여부·CPU LBS·장면60Hz. VRAM/게임 FPS 인증 아님 |
| `rig-scene-name` | node.name, 유효한1..120자 |
| `rig-scene-position-{0,1,2}` | world X/Y0..8000px, height Z±8000px. 발 depth는 Y이며 높이가 순서를 바꾸지 않음 |
| `rig-scene-scale`, `rig-scene-visible` | scale1..128px/model unit, boolean |
| `rig-scene-bone` | 기존 resource skeleton.bones의 ID. 기본 두 번째 본, 없으면 첫 번째 |
| `rig-scene-pose-translation-{0,1,2}` | 공유 resource.project.preview.pose[boneId].translation XYZ. 기존 RigProject 유한±10000 계약 |
| `rig-scene-pose-rotation-{0,1,2}` | UI degrees→저장 radians, 기존 RigProject 성분±100π 계약. own pose key만 읽고 편집 |
| pose 없는 본 | `{translation:[0,0,0],rotation:[0,0,0]}` offset을 실제 편집 때 생성. 같은 리소스를 참조한 노드에 공유 |
| `rig-scene-camera-x/y` | 장면 camera.X/Y0..8000px, 편집 시 followfalse. owner viewport/map clamp |
| `rig-scene-camera-yaw/pitch` | UI degrees→rad. yaw±180°, pitch±60°. 장면 전체 모델 직교투영 변경 |
| 숫자 입력 | 인스펙터 기본 step.01. 상한은 ProjectStore 검증으로 적용하며 실패 transaction은 이력/문서를 바꾸지 않음 |
| 실행 중 | 배치/pose/camera/add/delete/focus/seek/Undo/Redo 비활성. clip/material 선택은 같은 clock를 유지하며 가능 |
| 입력 | 3D 장면의 테스트 실행은 기존 런타임 start만 사용, player follow나 WASD/스킬 입력 활성화 없음 |

실시간 clip/material/seek 변경은 runtime 성공 후 현재 scene을 capture하고 store에 기록한다. 이때 setProject를 다시 호출하여 scene clock를 초기화하지 않는다. 정지된 배치/pose/camera 편집은 현재 실행 상태 capture→문서 transaction→기존 setProject→같은 renderer 평가 흐름이다. UI가 본 변형 수학을 별도로 계산하지 않는다.

## clock·깊이·수명·측정 경계

| 동작 | 현행 계약 |
|---|---|
| owner 시간 | 기존 FDGRuntime fixed1/60초, maxFrameDelta.25초, maxSubsteps6 |
| 수동 버튼 | **장면1틱·60Hz**, 정확히1/60초. 독립 시험실의1/clipFPS step과 구분 |
| 리그 clock | owner `_update(dt)` 소비. 독립 rAF·catch-up·시간 누적 루프0 |
| 전환 저장 | target clip/time + source clip/fromTime/duration/elapsed를 저장. 중간 전환 재열기 시 동일 skinned/screen vertices |
| 기본 전환 | .25초,1e−9초 종료 허용오차로 정확히15 owner 틱. 사용자 API 기간0..10초 |
| 투영 | worldToScreen의 발 anchor + yaw/pitch XYZ 직교투영×scale, screenY에서 heightZ px 차감 |
| 장면 depth | 노드 world-Y 발 기준. 동률 object→rig→player 유지. 현재 합성은 타일 면·격자→BACK→기존 START/EXIT 진단표식→world/rig/player→VFX→FRONT→오류 문구이며, 표식 뒤의 기존 세계 레이어 순서는 유지 |
| CPU 표시 | 같은rig.js의LBS/clip보간·선택UV소비. drawOrder→평균projectedZ→원triangleindex정렬. 색은flatshade/edge, texture는원본이미지affine/clip표시. GPU/depthbuffer/PBR없음 |
| Canvas 통계 | 색face당fill+stroke2연산, 성공textureface당drawImage1연산을기존drawCalls에합산. GPUdrawcall지표아님 |
| texture 준비 | consumer requiredSources를owner기존assets캐시가load/decode. validateReady의natural치수정확일치실패는rig-texture-images로보고. consumer자체Image/clock추가0 |
| snapshot 추가 | node의선택uvs/drawOrder/texture복사와마지막성공textureDraws. rawImage/GPUresource저장없음 |
| snapshot 비용 | UI/QA snapshot에서도 평가 가능하여 renderMs만으로 전체 consumer CPU 비용을 판정하지 않음 |
| 정지 | owner pause·render는 시간 미진행. 별도 editor animation rAF는 기존 캐릭터 preview용이며 리그 시간 진행에 사용하지 않음 |
| pagehide persisted | owner pause·runningfalse·최적화 정지·editor rAF 취소, consumer 유지. pageshow에서 inspector/화면·editor rAF 복원, 실행은 정지 유지 |
| pagehide 일반 종료 | 패널 toolbar11리스너 및 동적 inspector change리스너 해제, 기존 owner RAF/input/ResizeObserver/assets/pending load·consumer 리소스 정리, store dispose |
| inspector 교체 | 이전 동적 field/bone change리스너 해제 후 DOM 자식 교체, 부모 textContent 변경 없음 |
| QA handle | window.FDGStudio.sceneProject=현재 capture 복사; rigScene=consumer snapshot; lifecycle={editorRaf,panelListeners} |

자동 추천/프레임 측정은 기존 [제작 최적화 v0.3](FDG_OPTIMIZATION_STUDIO_20261010.md)의 범위를 유지한다. 이번 단위는 리그 포함 장면의 편집/저장/소비 계약을 검증했으며 v0.3의 전후 FPS나 GPU/VRAM 측정을 다시 수행하지 않았다. 리그 JSON byte 상한·정점 수는 메모리/속도 실측이나 최적값의 증거가 아니다.

## 2026-10-10 v0.5 동결 검증·직접 화면 확인

아래 Node42/Chrome8·기존 PNG/구문 검사는2026-10-10의 동결 기록이다. UV/texture 추가 뒤 이번에 해당 suite·기존 화면을 재실행/재검수하지 않았다. 새 texture 단위8PASS와 합산하거나 새 실제 모션의 시각PASS로 사용하지 않는다.

| 명령 / 환경 | 이번 결과 |
|---|---|
| `npm run engine:rig-scene:check` | **42/42 PASS**, schema29+consumer13, 실패/skip0. 기존 rig/math/sprite/optimizer/제품 완료 suite 재실행0 |
| `npm run engine:rig-scene:qa` | **8/8 PASS**, 설치 Chrome headless, fresh1600×1100, pageerror0 |
| 소스 검사 | 변경/신규 JS10개 Node --check PASS, 새 toolbar/tab 고유ID·상대파일 존재·package 명령·checker등록 확인. 기존 전체 source72 재실행 아님 |
| 실행 환경 | Node24.15.0/macOS arm64, 이미 실행 중인 이 체크아웃 API server.cjs3333, 제공 Playwright. 설치/새 서버 생성 없음 |
| UI·기술 시각 | scene-editor.png/scene-reopened.png 직접 확인. 동일 viewport의 입체 변형·재질색·정지 pose·clip/인스펙터 동작 확인 |
| 전체 엔진 인수 | production R/game/SFX adapter·GPU/native·게임용 모델/8방향 전투·맵 완성 미술은 별도 미완료 |

| Chrome8 항목 | 확인 내용 |
|---|---|
| 일반 consumer | 같은 FDGRuntime/Canvas에 실제 XYZ 노드, 추가 RAF/listener0; 저장 리그 키로 두 번째 리소스 소비 후 삭제; 기존 map/skill/preview 유지 |
| 편집 일치 | 노드X/height/scale·공유 bone Tx/Rx·camera yaw/pitch, authored와runtime값·worldToScreen anchor 일치, paused vertices 고정 |
| 재질 | 호환 ember 선택 시 픽셀 변경, 시간/clip/geometry 고정 |
| clock/전환 | play→clip crossfade→pause→1/60 step, owner update1·node 시간1틱 |
| 저장 재열기 | 실제 저장/reload, 리소스·좌표·sharedpose·screen vertices·전환·unknown collision/combat QA 메타데이터 동일, paused |
| 입출력/교체 | 실제 다운로드/import와 empty 다른 장면 교체, 이전 nodes/resources 해제·기존 listener 수/metadata 유지 |
| 삭제/Undo | 참조 없는 리소스 제거 후 authored 장면 그대로 복원 |
| 페이지 수명 | persisted 보관 중 pose 정지·복원 후 편집 가능, 최종 RAF/listener/ResizeObserver/리소스/동적 패널리스너0·추가 시간 진행0 |

Chrome runner는 `FDG_PLAYWRIGHT_MODULE`로 제공 모듈 경로, `FDG_RIG_SCENE_URL`로 URL, `FDG_RIG_SCENE_QA_OUTPUT`으로 산출물 경로를 바꿀 수 있다. 기본 Chrome channel을 사용하며 기존 다른 runner의 Chrome fallback 설정을 이 runner 지원으로 간주하지 않는다. 증거는 Git 제외 로컬 `tmp/fdg-rig-scene-20261010/qa/report.json`, `scene-editor.png`, `scene-reopened.png`, 다운로드 `.fdg.json`이다. 수정 전 백업은 같은 tmp의 `backups/`, docs 전체 rg→grep 기록은 `docs-search-final.txt` 등이다.

## MAP PRODUCTION REPORT — 2026-10-10 §23 일반 장면 consumer 동결 이력

작업 시작 전에 [맵 제작 가이드 v0.9](../4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) 전체와 [_MAP_SSOT_INDEX](../4.1맵디자인+설정/_MAP_SSOT_INDEX.md)를 읽었다. MASTER→OUTER MASS→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL→CAMERA QA→TECH QA 순서와 기존 stage LOCK을 보존한다. 이번은 기존 reference scene에 시각 리그를 소비하는 단계이며 새 production 맵 제작이 아니다.

| §23 구분 | 항목 | 이번 결과 |
|---|---|---|
| STAGE | 대상 | 기존 CH1-1 reference scene의 시각 consumer. production stage 편집0 |
| MASTER | silhouette / regions | 기존 canonical tile 경계/region 유지, 제작0 |
| MASTER | main route / side spaces | 기존 map/route 동일값 보존, 신규 nav/우회 공간 제작0 |
| OUTER MASS | LEFT / RIGHT / TOP / SOUTH / major holes | painted/baked mass 새 소비/제작/환경 구멍 판정 없음. 기존 미연결 상태 유지 |
| LARGE | source assets | 이미 확보한 v0.4 probe/저장 리그·기존 scene 이미지. 새 캐릭터/PNG 생성0 |
| LARGE | composites / overlap / repeated silhouette | production composite·데코 배치 변경0, 반복 실루엣 미검수 |
| MEDIUM | connections / remaining holes | 기존 geometry 그대로, production 환경 연결 미검수 |
| GROUND | shadow / contamination / structure integration | 기존 바닥/그림자 유지, 새 baked/painted 접합 없음 |
| PLAYABLE | main arenas / travel space / breathing space | 기존 타일/이동/충돌 유지, 리그는 시각 전용. 새 공간/밀도 판정 없음 |
| PLAYABLE | threat space / combat readability | 적/피격/SFX 연결0, 본편 전투 가독성 미승인 |
| LANDMARK | primary / secondary / tertiary | 제작0, production landmark 미연결 상태 유지 |
| CAMERA QA | START | 기존 시작 공간에 probe 배치·worldToScreen·height·yaw/pitch·정지 재열기 직접 화면 확인 |
| CAMERA QA | EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 새 맵 아트 카메라 검수 미수행. 기술 depth/clamp는 새 Node 검증, 이전 완성 판정을 갱신하지 않음 |
| TECH QA | route / collision | 기존 값 보존·새 schema 계약/리그 무충돌 검증. 원본 게임 nav suite 재실행0 |
| TECH QA | pageerror / 404 | pageerror0. runner는 별도404 수집을 하지 않음; 새 로컬 script/CSS 참조 존재 확인만 보고 |
| TECH QA | seam / loading | production chunk seam 미검수. 일반 scene의 기존 load 완료 후 새 소비/교체/재열기 확인 |
| TECH QA | performance | 새 consumer owner1RAF·고정틱/정지/hitch·정리 검증. GPU/VRAM/native·본편 FPS 미검증 |
| FILES | stage-owned | 이번 새 scene schema/runtime/panel/test/runner와 기존 FDGproject/runtime/studio/package/checker, 관련 docs |
| FILES | concurrent touched | schema/consumer worker와 root가 명시한 소유 파일별 병행 작업, 상호 변경 보존 |
| FILES | unrelated touched | 기존 marketing/sound/백업/output WIP 보존·커밋 제외, R/game/기존 PNG 변경0 |
| GIT | staged / commit | 소유 code+docs+CHANGELOG만 로컬 checkpoint, docs staged gate 및 diff 형식 확인 |
| GIT | push / deploy | 없음 |
| VISUAL VERDICT | production environment | **FAIL 유지** — painted/baked outer mass/ground/landmark가 없는 기술 preview. consumer 화면 기술PASS를 완성 환경/캐릭터 승인으로 대체하지 않음 |
| NEXT PASS | 후속 | 승인된 게임용 리그·production adapter·전투/SFX·GPU/native 성능과 완성 환경 카메라 검수 |

2026-10-10 checkpoint는 일반 FDG 장면의 색 리그 소비와 저작 왕복에 대한 기록이다. 현행은 선택UV/texture/drawOrder를 CPU 삼각형 renderer로 소비한다. 중첩 노드 그래프/Prefab·외부glTF/FBX·자동 가중치·PBR/의상·GPU 스키닝·신규3종 게임용 모델/8방향/전투 연결·전체 엔진 최초 인수는 미완료다.

## 2026-10-11 texture consumer 추가

[새 텍스처 계약](FDG_RIG_TEXTURE_RUNTIME_20261011.md)의 `test/fdgRigTexture.test.mjs` **8/8 PASS**를 별도 증거로 기록한다. scene는 owner 이미지 주입·정확 치수 거부·실제 texture draw 계수·기존 fixed60Hz·교체 retire/dispose·capture 원저작 데이터 보존을 검증했다. 실제 HellAberrant PNG·저작 fixture의 r2/r3 모션 검수는 해당 동결 기록을 따르며 새 r4 시퀀스 공개 검수와 합산하지 않는다.

원본에서 보이는 표면2.5D 리그는 ENGINE_AUTHORING이며 nativecombat 미적용이다. UV 표시 기능의 구현을 가려진 몸통/다리/꼬리 복원·3D 캐릭터 품질·본편 충돌/AI/스킬/SFX/phase의 완료로 확대하지 않는다. 일반 scene의 리소스8/노드32·각리그2MiB/전체4MiB·.25초 전환·기존 월드 발Y 순서는 그대로다.

## 2026-10-11 r4/r5 장면 시퀀스 UI 계약 (동결 이력)

기존 **3D 장면** 탭과 `runtime-canvas`/FDGRuntime/owner clock에서 본체와 FX를 함께 소비한다. [r4 정본](FDG_TAIL_SEQUENCE_20261011.md)이 최초 시퀀스 구현·당시 검수의 동결 정본이다. 아래는 r4/r5 당시 UI·r5 fixture 연결 이력이다. 현재 r6의 Play/공격 버튼·진입/복귀 전환과 새 fetch는 아래 r6 표를 따른다.

| ID / 사용자 동작 | 정확한 동작 |
|---|---|
| `rig-sequence-preset` | 기존 selector 값 `hell-aberrant-tail-swipe-impact-r4`로 새 r5 가독성 데모를 선택. selector 값은 sequence JSON ID와 별개이며 실행 중·미준비·불러오는 중에는 선택/연결 비활성 |
| `rig-sequence-load` | `fixtures/hell-aberrant-tail-readability.fdg.json?v=tail-readability-r5-fixture-final` 전체 데모 장면을 연결. raw UTF-8≤4MiB·JSON·`validateProject(...,{geometry:false})` 성공, 요청 중 기존 project가 동일하고 정지 상태일 때만 기존 store.replace. 선택 node와 3D 장면 탭으로 이동, 실행은 정지·저장 pose 유지 |
| `rig-sequence-pause` | 기존 owner pause. 본체·clock·FX age를 함께 고정, resume은 같은 activation 유지 |
| `rig-sequence-stop` | active sequence의 bound node만 hold/disarm. owner가 실행 중이면 기존 FX는 계속 진행하여 자기 life에서 만료. 전체 pause나 FX clear를 호출하지 않음 |
| `rig-sequence-replay` | runtime.replayRigSequence 성공 후 owner start. 설정 clip0초·새 activation으로 시작하고 이전 FX는 자기 life 보존 |
| 상단 테스트 실행 | ready면 owner 최초 activation, active 일시정지 상태면 같은 회차 재개. stopped/completed에서 사용자가 실행하면 명시 replay API 뒤 start; owner의 자동 재발동이 아님 |
| 장면1틱 | 같은 owner1/60초. 최초 ready에서 준비된 atlas가 있어야 시작하며 별도24FPS clock을 만들지 않음 |
| `rig-sequence-status` | ready/active/stopped/completed·회차·node demo 초·eventCount/1·eventTime·active sheet 수·현재 셀·age/life. API frame0-based를 표시1-based `frame+1/frames`로 변환 |
| `rig-sequence-contract` | 본체 ENGINE_AUTHORING / FX ENGINE_FIXTURE·demo 이벤트 초·실제 장수/FPS·native 시간 비환산 표시 |
| 실행 후 clip/material 선택 | live runtime snapshot을 우선 표시하며 undefined일 때만 authored fallback. 명시 null bind는 유지하고 time.max도 같은 live clip의 duration을 사용. Replay/Stop 표시 보정으로 authored 값을 임의 변경하지 않음 |
| 리스너 / DOM | 기존 toolbar7개+새 load1개/pause·stop·replay3개=11개, inspector 리스너 별도. 부모 textContent 교체 없이 특정 leaf만 갱신. 종료 시 모두 해제; 별도 scene clock/Canvas/Image/RAF 추가0 |

편집 문서에는 sequence 설정과 기존 현재 node pose/clip/time/transition만 저장한다. 회차·이벤트·활성 FX·입자 age·owner clock을 JSON 필드로 추가하지 않는다. reload에서 저장 pose를 먼저 표시하되 ready/activation0/event0/FX0/clock0으로 시작하여 불러오기만으로 FX를 발동하지 않는다. 수치·crossing/만료/가림·실제 공개 증거는 [데이터](FDG_RIG_SCENE_PROJECT.md)·[런타임](FDG_RIG_SCENE_RUNTIME.md)·r4 정본을 따른다.

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

| 현재 공개 UI / field ID | r6 계약 |
|---|---|
| `rig-sequence-preset` / load | selector 기존 ID `hell-aberrant-tail-swipe-impact-r4`, 라벨 `지옥기형 · 대기 → 꼬리치기 → 대기`; `fixtures/hell-aberrant-tail-idle.fdg.json?v=tail-idle-r6-fixture` 전체 scene 연결. 기존 stop/race/4MiB 검증 경로 유지 |
| 상단 Play / 장면1틱 | autoStart:false는 현재 node idle·저장 clip/transition을 진행. stopped/completed를 자동 Replay하는 분기는 autoStart 생략/true에만 적용 |
| `rig-sequence-replay` | autoStart:false이면 라벨 `공격 1회`; 기존 runtime 명시 Replay+start 사용. returnTo node의 transition 동안 disabled |
| `rig-scene-clip` | live snapshot.clipId 선택값으로 자동 idle 복귀를 반영. returnTo node의 transition 동안 disabled |
| `rig-scene-time` / material | live node.time·같은 clip.duration의 max(없는 clip 기본2초)·live materialId를 동기화. 공격 sequence.elapsed≈3초와 idle node.time을 혼동하지 않음 |
| `rig-scene-return-clip` | 해당 resource의 loop clip 목록에서 authored returnTo.clipId 편집 |
| `rig-scene-return-seconds` | authored returnTo.transitionSeconds 편집, schema finite0..10초 |
| `rig-sequence-entry-seconds` | 선언된 entryTransitionSeconds 편집, schema finite0..10초 |
| pause/step 실제 결과 | 공개 Pause 적용 시점은 idle0.8166666666666675·transitionnull. 이후 paused once 선택으로 새 entry time0 생성, 한틱에서 time/elapsed/clock1/60초. 공개 return-transition 중 pause 성공으로 기록하지 않음 |
| DOM / 수명 | 기존 fixed toolbar11 listeners·inspector 별도, 명시 leaf/field만 갱신. 새 owner clock/Canvas/Image/RAF/timer0 |

## 2026-10-11 현행 r7 opt-in · 흉곽·골반 깊이 계약

아래는 r7 제작에 확정된 선택 계약이다. 승인 r6 배송·클립 전환·FX 및 기존 보고·검사·proof 수치는 그대로 보존한다. r7 geometry·최종 배송·새 공개 시각/저장 결과는 아래에 기록한다. 새 전용 데이터/consumer 검사도 최초 결과만 아래에 기록하며 기존 인수 수치에 합산하지 않는다. 현재 제작·검수 정본은 [흉곽·골반 깊이 r7](FDG_TORSO_DEPTH_20261011.md)이다.

| 항목 | r7 선택 계약 / 적용 범위 |
|---|---|
| `mesh.faceColors` | optional 배열. 있으면 정확히 `mesh.triangles.length`개이며 각 값은 `null` 또는 RGB6자리 hex `#rrggbb`. 생략/null인 면은 기존 선택 material/UV 소비 경로를 유지 |
| 명시 색 면의 권위 | 색이 지정된 면만 원화 없는 짧은 sidewall의 ENGINE_AUTHORING plain flat face로 표시. 기존 앞면 UV·source PNG에 tint를 덧붙이지 않으며 숨은 표면을 원본에서 복원한 것으로 표시하지 않음 |
| 평가·소비 | `evaluateRig`는 선택 faceColors를 독립 복사. Scene와 RigPreview는 원본 texture와 명시 authoring flat face를 구분해 같은 CPU Canvas 경로로 소비 |
| 카운터 | `textureDraws`는 실제 성공 `drawImage` 수, 신규 `authoringDraws`는 성공 flat `fill` 수. Scene `drawNode()`의 textured 혼합 경로 반환은 두 수의 합이며 RigPreview는 snapshot에 두 카운터를 제공. plain material에서는 명시 색 fill1과 기존 면 fill+stroke2를 합산. GPU draw call이나 성능 인증 수치가 아님 |
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
| 현재 다크드루이드 진입 | `http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-body-r1&v=dark-druid-body-r1`; preset `dark-druid-body-r1`=다크드루이드 NORMAL · 본체 제작 · FX 없음 |
| 공개 제작 순서 | 테스트 실행→동작 ‘준비 → 지팡이 타격 → 회복 · 단발’ 선택→2.4초 끝 idle0.35초 자동복귀→동일실행버튼 정지. 일시정지 장면1틱은1/60초. sequence ‘공격1회’ 경로 대신 일반 clip 선택 사용 |
| 저장 scope | 전용 query `authoring=dark-druid-body-r1`에서만 `fdg.studio.dark-druid.body.r1`; 기본 `fdg.studio.project.v1`·기존 Hell preset 보존. authored clip/time/transition/returnTo/pose/camera 저장, runtime clock·FX transient 미저장; public save1/reload1/export2, parsed full JSON·posed3289vertices/19bonePositions·clip/time/transition/camera exact. 저장 idle1.183333333333334초 보존, ownerclock4.466666666666656→0, sequence unavailable/activation0/event0/emitted0/FX0. 실제 export pair 각2766448B |
| 현재 cache | studio.js?v=dark-druid-body-r1 / rig-scene-panel.js?v=dark-druid-body-r1 / fixture dark-druid-normal-body.fdg.json?v=dark-druid-body-r1-fixture |
| 공개 proof | 실제 공개 정면yaw0/pitch0 textureDraws4622/authoringDraws0; yaw±22°/pitch6° textureDraws4622/authoringDraws22. 단면은 기존 flat fill, 원화앞면 tint/stroke0·새texture/renderer/GPU/PBR0; actualGIF40JPEG/4290ms/960×540 |
| 제품 판정 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 현재 module/preset | 외부 URL `http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-body-r1&v=dark-druid-body-r1`·저장키 `fdg.studio.dark-druid.body.r1` 보존. entry studio.js?v=staff-readability-r2-crown, Druidfixture dark-druid-normal-body.fdg.json?v=staff-readability-r2-crown-fixture; panel query dark-druid-body-r1 유지. 기존Hellpreset·기본fdg.studio.project.v1 동일 |
| 공개 동작 | 테스트 실행→공개동작 dark-druid-staff-strike 선택→prepare/forward-downstrike/recovery→idle자동복귀. sequence버튼/Fx추가0, pause/1틱·clipview기존consumer사용 |
| 같은 화면 검수 | actualpublic48CDP JPEG→GIF960×540/4210ms/8120063B, timestampinterval사용·합성poseframe0. 실제idle→Play→attack관측→idle복귀; prepare0.733/peak1.1/recovery1.65초 정지사진은 동일camera0/0·scale80, 실제front texture4622/authoring0 |
| 현재 저장 | publicsave1/reload1/export2, 저장attack1.1초/transitionnull·project/node/mesh/bones/UV/weights/material/clips/posedvertices/camera exact; ownerclock5.966666666666651→0, FX0·sequenceunavailable. 실제export pair 각2771920B, byte exact |
| scope | 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.
