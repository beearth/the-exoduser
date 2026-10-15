
## 2026-10-16 Git main 통합 범위

최신 웹 본편과 네이티브 부분 이식을 보존 통합한다. source pin9a4534b4의 native 계약은 최신 웹 전체의 동등성을 뜻하지 않는다. 실제 반영·실행 상태, 모듈 이송·런처·캐시 한계는 [PC·Mac·Git 통합](FDG_PC_MAC_GIT_SYNC_20261016.md)을 따른다. latest_full_game=false를 유지한다.

## 2026-10-14 원본 OBJ metadata 현재owner 반영

| 현재 범위 | 코드·최초 검증 |
|---|---|
| originalsameWorld metadata | 원초기77→CHDECO250in-place merges/기존31sameDict/현재296key. RHS28원JSfalsy·optionalfield조건보존/knownundefined4226은present키+null+declaredUndefinedmask/untouchedabsent와분리. |
| 원current후처리쓰기 | 실제edge4현재Canvas교체뒤samecurrentMeta _edgeErasednumeric1작성/원Metaamount유지/metadatawritegap4해소. CSS5실처리미완 _filterBakedwrite0/strictfullOBJ·WaitStageNR/sourceG.onfalse. |
| API·수명 | get_source_object_meta_publication()0arg / get_native_source_object_meta(key,field="")2arg(currentref/present/mask) / signal native_source_object_meta_changed(key,meta,phase). INITIALIZED77+MERGED250+CALLBACK_WRITE4=331events/epoch·ref·lifetime/신호재진입취소guard/namespacewithdraw. |
| 새검수 | actualMain1 FIRST13/13 PASS7.985673초/ERROR0/CameraWarning1/product수리0. 기존OBJ14/extra23+2/원성공군·PNG자료재검수재연0/신규helper·testleaf·assetcopyhashimport0. |

정확API·28필드·296/4226값·원JSmerge/필터미완·nullmask외부쓰기한계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ metadata 실제 현재 소유·후처리 쓰기」를 따른다. 이전meta원writer4미연결은당시이력이다. MAP PRODUCTION REPORT: currentmetadata+flagwriteronly,geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.**

> **2026-10-14 실제 Main 자원 실패 시작 중단:** 현재 Main은 sprite 검사 NOT_READY에서 새Player/source holders/World를 정리하고 physics/input off 후 camera/HUD/capture 생성 전 종료한다. 새 실제Main negative episode1/원Warrior public lifecycle fault1/첫12검증 PASS(1.851974083초), 예상push_error1·예상밖ERROR0/SCRIPT0/WARNING0/수리재연0. 이전99f6의29검증은 동결. 캐릭터24장·24FPS/model/치마 품질·source startup/GPU 미완은 유지한다. [실패 경로 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST_20261014.md).

> **2026-10-14 실제 Main 캐릭터 자원 검사 연결:** 기존 Player/Warrior에 source-backed 기대 정의와 읽기 전용 Inspector를 연결했다. 새 실제 Main 첫4그룹/29검증 PASS(2.2916115초), native_loaded_resources READY. 현재 방향8×모드4=32 animations/216frames/9텍스처, 방향별2/8/8/9장·1.25/7.5FPS; 목표24고유장·24FPS 충족0/32. region bounds 오류0은 원화·치마/모델 품질 해결 증거가 아니다. source wait/GPU/전체 startup·공개 플레이는 NOT_PROVEN/미인수; 성공 suite 재실행0. [Main 연결 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md).

# FDG 원본 장면 실행 계약 · physical v0.11 / preview v0.17

> 현행 검수(2026-10-11): v0.17은 명시 ENGINE_AUTHORING terrainCutaway로 실제 투영된 높이 지형 안쪽의 전경만 노출한다. 별도 QA 입구→경사→정상420px, Z0→34.398→64, 저장/reload를 확인했다. 수정 후 경계16px 이상 바깥30,358픽셀은 RGBA 차이0이다. 이번 높이 지형 노출 범위 VISUAL PASS / 전체 production FAIL·UNADOPTED. 마지막 v0.17 표가 현행이며 이전1057/Play8/R1/R2/v0.16.2 검수는 동결·재실행0이다.

2026-10-11. 독립 FDGProject의 stage0 원본 이미지 장면을 실행기에 연결하는 엔진 구현이다. 현재 source-v4 exact normalized 높이/절벽과 ENGINE_AUTHORING64/0, native 수동14/PARTIAL을 UNADOPTED sourcePreview가 소비한다. 기존 paused START→EXIT1057회 검수는 동결 이력이다. v0.16.1 공개 연속방향 UI를 기존60Hz Play clock에 연결하여 실제 이동/해제·rampZ64/카메라·나무/신규pit 차단과우회·save/reload/reimport를 확인했다. sourceScene 본편물리·원physicalZ·fullassembly·World/보스관문/1-2는 미인수, fullcount:null 및 native crop/origin/anchor UNKNOWN 보존. [preview 정본](FDG_SOURCE_VISUAL_PREVIEW.md)을 따른다.

## 파일과 적용 위치

| 파일 / 책임 | 적용 계약 |
|---|---|
| engine/fdg/source-scene.js | 순수 scene schema·논리높이 샘플·반경 충돌·swept 이동. DOM/이미지/clock 없음 |
| engine/fdg/source-scene-runtime.js | ground/move/capture/snapshot/draw/dispose. owner clock/input/camera/decoded assets 사용 |
| engine/fdg/map-source-adapter.js | frozen base + native revision 검토, SOURCE_INPUT / ENGINE_AUTHORING / ENGINE_IMPLEMENTATION 분류, 명시 실행 입력의 candidate 검증 |
| engine/fdg/project.js | sourceScene optional 검증·map/nav 동일·원본 map.start raw tile·캐릭터 실제 반경 접지·리그/primitive 지형 동시 사용 거부·프로젝트 전체4MiB |
| engine/fdg/runtime.js | prepareSourceScene gate·asset loader·spawn·moveSource·60Hz input update·render·scene capture/replacement/dispose |
| tools/fdg-studio/studio.js | 원본 장면 탭·paused 한걸음·명시 환산 편집·Play/정지/1프레임·전용 FDG 저장/import/reopen |
| tools/fdg-studio/source-scene-panel.js | base 두 JSON + 선택 native revision 두 JSON + 별도 엔진 설정 공개 입력. 필수자료가 모두 있는 후보만 실제 연결 버튼 활성 |

## 원본과 엔진 제작 설정

| 분류 / id | 입력 / 수치 / 공식 | 원본 수정 여부 |
|---|---|---|
| START 권위 | 제출된 executionData.startAuthority 우선. 없으면 engineAuthored.startAuthority의 승인 설계 START 사용: raw100,185 / center100.5,185.5 / world4020,7420 / T40 | native runtime symbol UNKNOWN 보존. FDG_AUTHORED_CH1_1_START는 독립 엔진 심볼 |
| SOURCE_INPUT · nav | 200×200/T40, row-major 40000개0/1. 원본 polygon nav를 그대로 map.tiles에 대응 | 원본 배열 의미·boundary 불변 |
| SOURCE_INPUT · height | executionData.logicalHeight.source + samples40000개0..1 또는 evaluator 중 하나 | 원본 물리Z 요구0. 정확 식으로 engine-derived grid 생성 가능; 설명문에서 수식 추측0 |
| SOURCE_INPUT · collision | 실제 world-px object primitives와 별도 altar/boundary primitives·exceptions. native-v2는 executionData.objectColliderCount 실제확정개수0..512 필요 | 장식85개는 VISUAL이고 collider 수가 아님 |
| image 배치 권위 | executionData.imageLayers 우선. 없으면 engineAuthored.imageLayers1..128의 승인 sourceAssets 경로·crop/worldRect/opacity/layer/depthY/authoredBy 모두 명시 | 엔진 작성 배치는 native crop/origin/anchor UNKNOWN 보존; sourcePhysicalLayoutClaim=false. groundMaterials fallback 불가 |
| ENGINE_AUTHORING · heightMapping | kind=engine-authored-linear, scalePx>0, offsetPx≥0, scalePx+offsetPx≤1024, authoredBy 비공백. 엔진Z=offsetPx+logicalHeight×scalePx | 환산값은 엔진 제작 설정으로 별도 기록 |
| ENGINE_AUTHORING · camera | x/y0..8000, follow boolean | 명시 설정 |
| ENGINE_AUTHORING · settings | maxStep1..64px, maxSlope0..1 | 원본 충돌 geometry와 별도 보행 허용치 |
| ENGINE_AUTHORING · resourceBindings | canonicalAbsolutePath → 기존 same-origin 상대 src 사전. 빈{} 또는 source layers미제출이면 연결pending, 실제layer별경로검증은제출후 | 원본 복제/새 proxy/server0. v0.13 기존3333 exact props9 `/fdg-source/ch1-1/` 및soil1 `/fdg-source/ch1-1/ground/ground_dark_soil.png` 읽기 경로; preview는 정확매칭만 |
| ENGINE_AUTHORING · executionContract | id=fdg-source-scene-v1/version1/stage0/sourceSymbol=CH1_1_PRODUCTION/sourceVersion=20260916-finish-1/loadDraw=same-origin-source-image-layers/authoredBy | load/draw 방식은 엔진 구현 소유 |
| ENGINE_IMPLEMENTATION | renderer/input/lifecycle/decode readiness/capture | source provenance를 구현 코드라고 부르지 않음 |

## sourceScene schema와 제한

| 필드 / id | 정확 값·범위·슬롯 / 적용 위치 |
|---|---|
| schemaVersion/stage/grid | 숫자1 / 숫자0 / width200,height200,tileSize40. world8000×8000 |
| nav.scope / tiles | polygon-plus-source-colliders / 40000개0또는1. collider는 배열을 덮어쓰지 않고 별도 소비 |
| height.interpolation | bilinear-cell-centers. gx=x/40−.5, gy=y/40−.5를0..199로 clamp한4셀 보간 |
| height slope | 보간의 X/Y 차분÷40 후 hypot(dx,dy)×scalePx. 논리높이와 엔진Z를 snapshot에 분리 |
| actor | position=[X,Y,Z], startAuthority={symbol,source}, sourceStart={rawTile,centerTile,worldPx}. 저장된 이동 위치는 sourceStart와 별도 |
| actor support | X/Y0..8000, Z0..1024. 현재 sampled ground와 Z 차이≤1e−7. preview character.radius1..19 실제 발 원으로 검사 |
| colliders | 0..512, 고유 id1..120자. center X/Y0..8000. kind circle/box/ellipse/ellipse-band |
| circle | radius0.000001..8000px |
| box / ellipse | size[W,D] 또는 radii[rx,ry] 각0.000001..8000, yaw±π radians |
| ellipse-band | 0≤innerRatio<outerRatio≤2. optional exceptions0..32 circle/box/ellipse, 중첩 band 불가. 전체 발 원이 예외 안에 있어야 통과 |
| 충돌 계산 | 접촉 epsilon1e−7. ellipse 거리 solver48회. 이동 분할거리≤min(10,radius)로 endpoint 사이 충돌도 검사 |
| 이동 결과 | ok/reason/height/logicalHeight/surfaceId/slope. 차단 시 actor XY/Z 불변 |
| 경로 표시 | validateProject의 findRoute는 polygon nav 기준. sourceScene 경고를 표시하며 object/절벽/단차 포함 실제 보행 QA를 PASS로 주장하지 않음 |
| imageLayers | 0..128, 고유 id. sourceRect[x,y,w,h] x/y≥0,w/h>0. worldRect 동일 tuple 우/하≤8192. 이 padding 상한은 world8000을 변경하지 않음 |
| image order | opacity0..1, layer ground/world/front, depthY0..8192. scene에는 모두 명시. adapter 생략 layer=world/depthY=worldRect bottom은 engineDrawDefaults로 기록 |
| src | 상대 png/jpg/jpeg/webp. URL/leading slash/빈 경로조각/.. /query/fragment/encoding/backslash 금지 |
| JSON | compact UTF-8 scene 및 전체FDGProject 각각4194304bytes. depth64/visits1000000, plain JSON·finite만. unknown metadata 보존, accessor/cycle/reserved key 등 거부 |

## 실행·렌더·저장 수명

| API / 제어 | 결과와 실제 동작 |
|---|---|
| adapter 결과 | errors와분류별pending·sourceRequired·engineAuthoredFields·pendingCounts. project/world는null. candidateProject만 검증 완료 시 생성; ok는 후보 준비이고 설치 성공 의미가 아님 |
| prepareSourceScene | scene/project 검사→필수 원본 layers 및 프로젝트 character/VFX의 sprite.src·directions 이미지 preload→decoded status/natural size/crop/atlas장수 gate. 준비 실패 시 기존 project/actor/camera 유지, 새 임시 records 정리, 기존 errors/onError 오염0 |
| decode race | disposed/loadVersion 변경 또는 dialog generation 변경이면 설치 취소. prepared.release는 현재 활성 source가 사용하는 record는 유지 |
| spawn/load/start | source actor.position을 정확 사용, 반경/접지 검사. source START 대체/nearest-floor fallback0. 필수 image ready 이전 start 거부 |
| moveSource(dx,dy) | paused UI 한걸음10px. 공개 API norm≤tileSize/4=10px, 준비된 장면만. owner WASD/방향키는 기존60Hz·이동 분할+source collision consumer |
| 그리기 | ground→world depthY 순서와 native actor의 worldY1회 삽입→front. 이미지/actor painted XY 유지, mapped Z를 painted 그림에서 빼지 않음 |
| source 이미지 draw | decoded source crop 9args drawImage, CSS viewport/camera, cull/clip/alpha finally 복원. source 소비가 준비되지 않으면 로딩 화면; production 장면에 primitive/box actor 대체0 |
| metrics | image draw 반환값을 native actor callback 실행 후 합산. actor/shadow/image 각 실제 호출로 계측, imageMissing/visibleObjects 별도 |
| captureSourceScene | 전체 unknown JSON clone, 현재 actor.position와 camera x/y/follow만 갱신. 원 sourceStart/nav/provenance 보존 |
| 환산 편집 | paused 입력 scale/offset 명시 검사→captured scene mapping 편집→동일XY ground Z 재계산→store history. 원 logical samples/충돌/nav는 바꾸지 않음 |
| 저장/reopen | FDG 전용 저장 키에 runtime capture를 저장. 부팅/import가 sourceScene이면 원본 장면 탭 선택. World·본편 game save와 별도 |
| 교체/종료 | consumer scene/arrays/pathSet 참조 정리. 자체RAF/listener/timer/image/GPU0. owner 기존 RAF/input/imageMap cleanup. panel 정적listener12개 제거, 입력5개·callback 정리 |
| 최적화 패널 | sourceScene의 기존 이미지/입자6초 측정 canStart=false. 이 경로를 본편 성능·GPU/VRAM 측정으로 주장하지 않음 |
| cache | v0.13 당시 entry/studio/runtime/source panel/adapter/project/preview 및 runtime 내부project/preview consumer query 모두 v0.13.0; height program v0.11.0, CSS/sourceScene consumer v0.10.0 유지. WorldPanel/map-view v0.8.3 및 World core 기존 계약 유지 |

## native revision-v2 최초 소비

| 원본 / SHA256 | 판정 |
|---|---|
| scene.native-revision-v2.json ·17034bytes ·5bd280a1f82fea4dec3e2b03d0eccf38ab54dec63a8c941dbe16796fd1fd1250 | baseRef+changes overlay, 완성 장면이 아님. placementsExpanded.byFile 9파일 합85개 VISUAL. x/y=tile index, y207/brightness1.08도 원값 보존 |
| resources.native-revision-v2.json ·2563bytes ·79389e575dfb54c1a493ee23c32ed59a93d2685998e52d6dd9471bb975bbae69 | sourceAssets9개 사용 횟수 제공, 이미지 native size/crop/worldRect/anchor pending. groundMaterials 경로4/4와 collisionChanges=false 메타 분리 |
| altar band | center147,98/radiusTiles18,9/.84≤d≤1.04. 원값 보존, 예외/함수 입력 없이 임의 collider 병합0 |
| START | 설계SSOT와regionanchor 제공, runtimeStartSymbol PENDING_SOURCE_EXPORT 유지 |
| base 보존 | source13,059/manifest7,461bytes 이전 첫 소비 봉인 유지. 새 리비전 적용을 위해 재존재검사/원파일재읽기/PNG재hash0 |
| revision API | options.sourceRevision/manifestRevision. raw base 문자열의 byte/SHA와 revision.baseRef 확인. baseRef autoload0, base snapshot 불변. sourceRevisionSnapshot/manifestRevisionSnapshot/engineAuthoredSnapshot와unknown metadata 별도 보존, visualPlacements 배열·visualPlacementMetadata 원형 분리 |
| 범위 | stage0 단일 실행. stage1/1-2 edge/waypoint/boss·game/nav/LOCK/START/EXIT/전투/save 변경0 |

## 검증과 남은 인수

schema/height/movement/adapter-native-v2 신규 단독 최초10/10 PASS, SourceSceneRuntime 신규 단독 최초8/8 PASS와 runtime 통합 신규 최초5/5 PASS. 모두 synthetic 숫자 fixture와 FakeImage/Canvas이며 실제 CH1 환경 인수로 바꾸지 않는다. 통합은 preload 실패 보존, 성공install/release,10px 이동과mapped Z32.4→32.416,JSON재개 camera/unknown metadata, native actor1회+이미지4+clear/shadow 총drawCalls7, replacement/dispose를 검사했다. 이전 완료 suite 재실행0.

실제 원본의 missing source를 목록에서 지우거나 샘플 이미지를 production으로 채우지 않는다. 실제 최초 소비에서 canonical START·발 충돌·camera·승인 원본 image draw·play/pause/step·전용save/reopen/cleanup까지 이어져야 scene 인수이며, §23 MAP PRODUCTION REPORT의 production **VISUAL VERDICT: FAIL(필수 원본 미제출)**을 유지한다. 새 단위 증거는 외부 E=engine-stage0-execution에 저장한다.

## v0.10 native-v2 공개 UI 최초 소비 결과 · 과거 봉인

| 검사 | 결과 / 정확 경계 |
|---|---|
| 공개 입력 | frozen base2 + 새native-v2 revision2 + 별도engineAuthoring1 모두 원문문자열동일. base raw byte/SHA binding 검사오류0 |
| authored 값 | scale64/offset0, camera4020,7420/followtrue, maxStep16/maxSlope.75, executionContract 명시. 이것은 원 game physical값이 아닌 엔진 제작 설정 |
| 원본자료 | SOURCE_INPUT5: runtimeSTART / logical samples+source / real objectcolliders / boundary exceptions / image native crop-world-anchor |
| 엔진자료 | ENGINE_AUTHORING1: source image layer와same-origin resourceBindings 연결. 빈{}를 완료로세지 않음 |
| 화면 | 「필수 입력6건대기」·visual배치85개·polygon53/nav40000/바닥19438·원본/엔진설정 분리. 실제연결/Play/step disabled |
| 설치 / 원본보호 | 후보없음·실CH1 project/world/install/image draw/이동/save-reopen0. 미제출 source의그림이나collider를발명0 |
| 증거 | 외부 E/native-v2-ui-first.json·native-v2-review-desktop.png·source-contract-first-test.txt·source-scene-runtime/source-scene-runtime-tests-node.log·runtime-integration/runtime-integration-first-node.log |

신규화면검수는 입력검토도구에한정한다. **VISUAL VERDICT: FAIL(실production장면미연결)**. 원자료가 갖춰진 정확 다음 revision의 최초실행이 실제장면 인수 Gate다.

## v0.11 작성 계약과 당시 입력 · 과거 봉인

| 슬롯 / 적용 위치 | 정확 값·계약 |
|---|---|
| engineAuthored.startAuthority | kind=design-start/stage0/centerTile[100.5,185.5]/worldPx[4020,7420]/tileSizePx40/source=CH1_WORLD_MAP_ORDER / 맵구성_1장.md:3/approvedBy=ROOT/runtimeSymbol=UNKNOWN. 원 sourceStart raw 불변, +.5 중복0 |
| 높이 프로그램 API | source-height-program.js의 compileSourceHeightProgram(evaluator), resampleSourceHeightProgram(evaluator). 실패 samples/provenance=null; eval/Function·기본수식 없음 |
| evaluator | version1, coordinates=tile-center-space, expression AST. unknown 안전JSON 원형 보존. 입력65536UTF-8bytes/depth64/visits8192; 식depth32/nodes256 |
| AST 연산 | constant(value), x, y; add/sub/mul/div/min/max/hypot args2; abs/sqrt args1; clamp[value,min,max] args3; smoothstep[edge0,edge1,value] args3, t=clamp((value-edge0)/(edge1-edge0),0,1), t²(3−2t) |
| 거부 / pending | div0, sqrt음수, clamp min>max, smoothstep edge0≥edge1, nonfinite, 최종0..1밖 거부. unsupported op/version/coordinates는 ENGINE_IMPLEMENTATION pending |
| 리샘플 | x+.5/y+.5 tile center, 200×200 row-major40000. evaluate 좌표0..200. 연산상한256×40000=10240000. kind=engine-derived-logical-grid, sourceEvaluator 보존, sourcePhysicalZClaim=false; runtime 기존 bilinear-cell-centers 유지 |
| authored image 제한 | sourceAssets9 승인경로만. 배열1..128, source/worldRect x/y≥0,w/h>0, world우/하≤8192, opacity0..1, depthY0..8192, layer ground/world/front·authoredBy 명시. native원본배치로 주장0 |
| observeSourceImages(bindings,approvedCanonicalPaths) | runtime 공개 async API. 승인Array/Set1..128·plain own-data binding1..128·정확POSIX canonical whitelist subset·isLocalAsset 상대src. 모든 decode성공 시 observations{canonicalAbsolutePath,src,status:ready,intrinsicWidth,intrinsicHeight,observedBy:runtime-image-decode}+release |
| observation 수명 | 치수 positive safe integer. 실패batch throw·새임시record정리·기존project/actor/camera/errors/onError 불변; loadVersion/dispose race 거부. release는 활성asset 유지. native anchor/crop/worldRect 추정0. 추가 UI버튼/listener/RAF0 |
| 공개 UI | 입력5개와panel listener12개 유지. 현 authored64/0·maxStep16/slope.75·설계START 입력은 검증오류0, pending5=SOURCE_INPUT3+ENGINE_AUTHORING2. 실제연결/Play/한걸음 비활성 |
| 실제 source missing | /executionData/logicalHeight/source + samples 또는 evaluator; /executionData/objectColliderCount + confirmed 실제 /executionData/objectColliders; /executionData/boundaryColliders의 cliff/서쪽 ramp 예외. v3 설명문은 정확 인스턴스/함수 미제출 |
| 실제 authoring missing | /engineAuthored/imageLayers; /engineAuthored/resourceBindings/<canonical>. 기존3333 서버는 현재checkout root이며 승인 migration 원본9개로 직접가는 검증된URL 계약 없음. 일반 /assets 경로를 원본동일이라고 지정0 |
| v3 첫 소비 | collider-height4427B SHA2564bbeae2114db17cfe95f9064927fb34cf8560f296e18a61904f5b8b41b905f16; image-bindings5868B SHA2564d445ae5ec8fcd51445949700412982d47108289c7c7820c0a99e851d35bac9d. evaluatorFormula/stage0Instances PENDING_SOURCE_EXPORT, native image항목 UNKNOWN, brightness raw1.08 유지 |
| 새 깊이 receipt | 772×370 fakeCanvas mid: visiblewalls39·depth3994.25..4190.029676289736·wall90draw; summit37·depth3994.25..4175.406771212186·wall86draw. 두곳 visibleprops3 projecteddepth3980/4260/4820;4260/4820 props는모든visiblewall뒤에그려지므로여전히윤곽을덮을수있다. fakeCanvas는시각PASS/PNGalpha/실가림양증거가아님 |
| 신규 검증 | authoring7고유조건: 첫7=5PASS/2FAIL fixture단위문구, fixture수정후 관련4만4PASS. 수식3반복0. image observation 최초8/8PASS. 새 UI 설계START delta1회 검토. 기존23/16검사 반복0 |
| 실제 인수 | 실제 CH1 install/image draw/보행/발충돌/save-reopen0. production VISUAL VERDICT: FAIL. API 지원이나 synthetic PASS를 제작 완료로 세지 않음 |

새 증거는 외부 engine-stage0-authoring-delta에 저장한다. 게임 전용 제작 순서·인수 기준은 [제작 계획](FDG_GAME_DEVELOPMENT_PLAN.md)을 따른다.

## v0.13 실제 이미지·흙 바닥 제작 미리보기 · 동결 이력

[FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)는 sourcePreview schema1/stage0/UNADOPTED_VISUAL_PREVIEW 정본이다. sourceScene XYZ·논리높이·collider schema는 preview에 이식하지 않는다. exact props9+soil1 read-only URL, 실제soil1024² fullcrop과 ENGINE_AUTHORING origin0/repeat1024²/opacity1/.85/.48·원53 tile-corner×40 clip을 소비한다. v0.13 당시 ground→기존depth props85/actor, 최대64 ground draw·screen cull·context finally복원이다. 원본85/XY/nav 유지 및 공개 import decode preflight·실제4020,7400/camera followtrue/바닥 save/export/reload 완료. native ground UV UNKNOWN·다른3재질 미소비·v0.13 당시 actual collider/cliff/height SOURCE_PENDING·height:null·production FAIL이었다. 현재 v0.14는 logical/cliff SOURCE_CONSUMED·actual collider pending·height:null이며 아래 현행 표를 따른다. 새ground contract 수정후4+runtime 첫4=8고유PASS; 최초helper import누락0/4와수정로그 보존. 완료13/5·15/23/16 및source봉인·Git증거 재검사0. 새증거는 E/engine-stage0-ground-preview에 기록한다.


## CH1-1 정확 높이·경사로·절벽 제작 미리보기 · v0.14 동결 이력

| 구현 / 상태 | 계약 / 실제 인수 |
|---|---|
| 정본 / 입력 | [미리보기 정본](FDG_SOURCE_VISUAL_PREVIEW.md); optional sourcePreview.heightPreview에 실제 source-v4 full envelope·nativeParams11·exactEvaluator3개를 소비. tx=worldX/40, ty=worldY/40 연속좌표; sample tile은 셀인덱스, px는 셀센터. source 논리0..1은 원본 물리Z가 아님 |
| 작성 환산 / 이동 | ENGINE_AUTHORING scale64/offset0, engineFootZ=offset+logical×scale; maxStep16/maxSlope.75. 원 polygon nav + 정확 point band + 엔진 보수적 원형발 gate, 서쪽 ramp 원 전체 포함 시 통과. actor 저장XY2·height:null 유지, 내부Z만 파생. follow cameraY=actorY−engineFootZ |
| 바닥 / 부하 | 기존 승인soil1·props9/배치85 유지. owner-local 원soil 높이 cache1720×944·2024삼각형 최초 build1회, visible frame1draw/offscreen0. 각축2048/총4194304pixels 상한, flat repeat64+cache1→groundDrawCalls65 상한; 현재 nominalRGBA6494720bytes, disposepixels0. 원53/nav/PNG 재작성0 |
| 실제 경사로 QA | 별도 QA actor4990,3940→공개동쪽10px×23=5220,3940·원식 logical0.5747500000000001/Z36.784000000000006(실제UI0.5748/36.78). offset1 편집→원논리 동일/Z37.784000000000006(실제UI37.78),0복원+20회=5420,3940·logical1/Z64·camera5420,3876/followtrue. 저장/다운로드JSON/reload 복원. START4020,7420으로부터 도달 검수0 |
| 실제 절벽 QA | 별도 동쪽6670,3940→서쪽3회6640,3940/Z0; 4번째6630 시도 source-cliff-band 차단/XY·Z 유지. 저장/JSON/reload XY6640,3940/Z0. blockedReason은 현재 이동 결과로 저장하지 않음 |
| UI / 첫 실패 | heightReady=선택heightPreview+런타임 logicalHeight/engineFootZ finite. 새project/이전runtime 설치 전환의 toFixed 오류를 수정. entry studio.js?v=0.14.1, 높이 모듈·관련 import0.14.0. 환산 편집 시 heightEngineAuthoredInputSnapshot/heightRuntimeObservation/camera도 동기화. 수정 후 해당 entry captured error0 |
| 신규 검사 | height contract 첫4/4PASS + runtime 첫2/4PASS(검사용 긴sweep·잘못된loadAssets 호출2FAIL), fixture/public load 수정 후 affected2/2PASS = 신규8고유PASS. 기존 preview13/server5/soil8/15·23·16·원9PNG/source/Git 동결 검증 재실행0 |
| 경계 / 시각 | logicalHeight/cliff SOURCE_CONSUMED, 실제 object collision SOURCE_PENDING·actualObjectColliderCount:null/UNKNOWN. sourcePhysicalZClaim:false·native UV/anchor/crop·다른ground3 PENDING. World/스킬/VFX/본편 물리/production 미인수. 절벽 장식이 캐릭터를 가림·높이 시각 가독성 보정 필요: preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL |
| 새 증거 | 외부 engine-stage0-height-preview/actual-height-proof.json·actual-height-ramp-mid.png·actual-height-ramp-reopen.png·actual-height-cliff-blocked.png·실제 export2개·신규검사/ownedpatch/checkpoint/§23 engine-review.md. 60FPS/VRAM/Windows 성능 미측정 |


## v0.15 완료 이력(동결) · 원본 미리보기 가림·높이 가독성 보정

앞의 v0.14 높이·soil·원본/검사 증거는 당시 이력으로 동결한다. 현재 수치·API 전체 정본은 [원본 제작 미리보기](FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.15 표를 따른다.

| 항목 | 현행 결과·범위 |
|---|---|
| 저장 / 분류 | optional appearancePreview version1/engine-authored-readability; provenance.appearanceEngineAuthoredInputSnapshot에 전체명시작성입력. native anchor/crop/origin·실collider UNKNOWN, sourcePhysicalZClaim:false 유지 |
| actor / depth | 현재sprite frame과기존projected depth 순서. actor1회, 교차한앞장식 body ellipse 내부.24/band.62/feather8px·밖원opacity. foregroundCutawayObjects/cutawayDrawCalls 추가. actor를맨위에덧그림0 |
| terrain / cache | 원soil·원height만소비. directional light[-.45,-.65,.75], ambient.45/contrast.65·flat1normalize·brightness.55..1.2. south profiles128/32기준max96·probe.5px/rasterheight>.25px·faceopacity1/brightness.55. 신규receipt profile80/wall184/total2208/shaded329; 기존cache1·1720×944/6494720bytes·ground<=65 유지 |
| 부하 / query | props<=255draw·ground<=65, source consumer<=320(actor/배경별도). entry/관련modulev0.15.0·pureheightv0.14.0·physical/CSSv0.10.0/ASTv0.11.0 유지; GPU/native성능 claim0 |
| actual QA | 별도cliff6640/3940/Z0 actor표시→공개북쪽10px차단/좌표유지/save/export/reload. ramp5420/3940→서쪽10px×20→5220/3940/Z36.784000000000006·camera5220/3903.216/followtrue/save/export/reload. STARTreachability검수0 |
| 신규 검사 / 오류 | pure4첫PASS+runtime4첫PASS=8신규고유PASS·fail0; oldheight8/soil8·완료suite/원PNG/count/봉인반복0. 새publicUI captured error/warn[]; 처음artifact필터가번호download제외하여wrongbase선택한실패는수집만교정·기록보존 |
| 시각 / 대기 | actor 완전가림해소, 큰장식이원height경계를가려terrain가독성약함. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. native per-prop source crop/origin/pivot/depth·실제 _OBJ_META+stage0 collider인스턴스입력대기 |
| 증거 / 범위 | 외부E/engine-stage0-readability-preview의newpictures/exports/firsttests/API/patch/projection/§23보고. game/nav/sourcegeometry/LOCK/START/EXIT/본편save/PNG변경0·새reviewUI/기능/팀확장0·push/deploy0 |


## v0.16 수동 충돌 소비 완료 이력(동결) · 2026-10-11

v0.15 가림·명암과 앞선 height/soil/원본 검수는 완료 이력으로 동결한다. 이번 변경은 별도 QA 위치에서 실제 v6 수동 배치 충돌을 소비하며 전체 맵 또는 START 보행 인수가 아니다.

| 항목 | 현재 코드·수치·상태 |
|---|---|
| 원본 입력 | MAP/ch1-1.hand-colliders.execution-v6.json; handProps36 / metadata type28 / collisionEnabled13 / collider entry13. visual85와 서로 다른 집합. 전체 native collider count UNKNOWN |
| native 의미 | game.html _rebuildColObjs/isW: colSz는 원반경, colW/colH는 타원 X/Y반경. v6 row 수치는 scale 적용 완료 → 재곱셈0·/2변환0. ellipse centerY=effectiveWorldY+colOy; offset에는 scale을 곱하지 않음 |
| adapter | normalizeMapSourceHandColliders(input)→{ok,errors,pending,sourceExecutionData}; 전체 raw nativeExecutionSnapshot·unknown metadata와 MAP_HAND_COLLIDER_BINDING version1을 별도 보존. exact onFloor tile-center=(rawTile+.5)×40만 변환; off-floor snap UNKNOWN→SOURCE_INPUT, raw colParts 미전개→ENGINE_IMPLEMENTATION pending. attachMapSourcePreviewCollision(existingProject,{sourceExecutionData,scope})는 candidateProject만 반환; project/world:null, adoption UNADOPTED |
| subset contract | collisionPreview version1/native-object-collision-subset; exact canonical array/count·full source envelope·scope 보존. scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32 필수. fullObjectColliderCount:null/sourcePhysicalZClaim:false. geometry claim은 제출된 2D subset에만 한정 |
| 선택 설치 | sourcePreview.status.collision=SOURCE_SUBSET_CONSUMED; provenance.supportedSourceObjectColliderCount=13 / collisionSourceRole=native-object-world-px-subset / collisionEngineAuthoredInputSnapshot={scope}; provenance.actualObjectColliderCount:null·productionAdopted:false·nativeAnchor/Crop/Origin UNKNOWN 유지 |
| 이동·저장 | source world XY에서 기존 polygon → subset 전체 발 원 충돌 → exact cliff/height 순서. 발 radius1..19, EPS1e-7 접촉 차단, ellipse 거리48회, sweep 간격<=min(10,radius)·최대16384. 막히면 XY/Z·카메라 유지; 허용 이동은 카메라 worldY−engineZ 추적. runtime capture/JSON/reopen에 PARTIAL과 unresolved 저장; blockedReason은 재열기 시 초기화 |
| runtime/UI | navScope polygon+exact-native-hill-band+source-object-subset; sourcePending=[collision-assembly]; collisionCoverage PARTIAL/supportedSourceObjectColliderCount13/fullObjectColliderCount:null. 화면에 수동 배치 충돌 13영역 · 전체 연결 대기 · 별도 QA 배치 / production 미인수 표시 |
| cache | entry/studio/runtime/project/map-adapter/source-panel/source-preview/source-preview-runtime 및 new collision/source-scene exports v0.16.0. appearance/height-ground v0.15.0, exact height v0.14.0, 기존 physical consumer/CSS v0.10.0·AST v0.11.0·World0.8.x 유지 |
| 신규 검증 | pure contract 최초4/4 PASS + runtime/adapter/owner 최초4/4 PASS = 신규 고유8/8 PASS·fail0. actual circle3297→3307,7380 east10허용/다음east10차단/north10허용→3307,7370; ellipse1586.5→1596.5,4020 허용/다음east10차단/north10허용→1596.5,4010. 각각 save/export/reload·camera followtrue/Z0 보존. native rotation0만 실제 입력, 회전 ellipse/expanded box는 synthetic UNIT만 |
| 시각·잔여 | preview VISUAL VERDICT RETOUCH / production FAIL. 큰 장식의 native pivot/opaque/depth identity 미확정, 캐릭터 대비 약함. 수동13 전체 추출·렌더85와 연결을 같다고 주장하지 않음. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending을 원 snapshot에 그대로 보존 |
| 상세 SSOT·증거 | [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.16 계약·13수치·새 QA표; E/engine-stage0-collision-preview/engine-review.md(§23), 신규 first-test2개·actual-collision-ui-proof.json·actual-collision-export-proof.json·실제 캡처/exports. 별도 pageerror/404/실전 FPS/GPU/Windows 인증 claim 없음 |

## v0.16 동결 AUTHORING 이력 · DESIGN START → EXIT 실제 제작 종주 (2026-10-11)

같은 실제 CH1-1 sourcePreview에서 정상 시작 초기화 후 공개 입력으로 제작 종주를 마쳤다. 앞선 v0.16 충돌 최초8검사·별도 위치 QA 및 v0.12~v0.15 증거는 동결 이력이며 재실행·재집계하지 않았다. 이번 변경은 코드0·상태 문서만이다.

| 항목 | 실제 관측 / 인수 범위 |
|---|---|
| 시작·원본 | 기존 DESIGN START4020,7420으로 정상 초기화1회. 원 soil·visual85·height64/0·native 수동 subset13·nav·START/EXIT·배치·source snapshot 보존. 도중 위치 강제설정/teleport0 |
| 실제 입력 | Play clock0.283초 → 공개 ArrowUp 단일 press 후0.367초/변위0 → 정지0.400초. 이후 paused AUTHORING의 공개10px 이동 버튼1057회: 허용1056회/차단1회/실이동10560px. 연속 키보드 Play 보행 PASS 주장0 |
| 경사로·충돌 | START→4020,3940→4990,3940/Z0→5220,3940/원0.5748·Z36.78→5420,3940/원1·Z64→4020,3940/Z0. 직진 북쪽 입력637은4020,3860에서 native-hand-8-m_c1tree 차단/변위0. 공개 서쪽 우회 후 원 EXIT근처4020,300 도달 |
| 저장·수명 | EXIT save/JSON export/reload 후4020,300·camera4020,300/followtrue·logical0/Z0·subset13/PARTIAL 보존. actual export를 공개 import해 같은 장면 교체 경계도 확인·clock0.000초. 기존 setProject의 previous consumer dispose 및 pagehide의 owner dispose 경로를 사용; private disposed counter·listener/VRAM 누수 계측은 미실행 |
| 잔여·시각 | fullObjectColliderCount:null/actualObjectColliderCount:null·productionAdopted:false. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending 그대로. native collider↔visual85 identity/crop/origin/pivot/depth·본편 전투/스킬/VFX/보스 관문/1-2 연결 미인수. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL |
| 신규 증거 | E= /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-route-preview. actual-route-step-trace.json(1057행)·actual-route-ui-proof.json·actual-route-export-proof.json·actual-route-lifecycle-proof.json·actual-route-exit-export.fdg.json·실제 캡처·engine-review.md(§23). 신규 자동 suite0·완료 proof 재실행0·push/deploy0 |

## v0.16.1 완료 이력(동결) · 실제 Play 입력과 v7 추가 충돌 (2026-10-11)

같은 승인 CH1-1 원본 제작 미리보기에 공개 연속 방향 입력과 MAP v7 변경분만 연결했다. 이전 v0.16 AUTHORING START→EXIT1057회·collision 최초8검사·v0.12~v0.15 증거는 동결하여 재실행·재집계0이다. 이번 연속 보행 증거는 paused10px 제작 이동과 별개다.

| id / 적용 위치 | 코드 계약 / 실제 관측 / 인수 범위 |
|---|---|
| FDGRuntime.setMoveInput / moveInputDirection | setMoveInput(direction)는 문자열 west/north/south/east 또는 null만 소비. null은 clearInput, 방향은 inputEnabled+running에서만 허용하고 keyboard Set을 비운다. getter moveInputDirection은 현재 방향 또는 null. 실제 actor 위치를 즉시 바꾸지 않고 기존 owner _update(dt)의60Hz tick에서 속도156px/s로 이동. 별도 입력 timer/RAF0. 기존 keyboard WASD/방향키와 대각 정규화 유지 |
| 입력 해제 / 수명 | 같은 방향 다시 클릭·이동 해제·유효 keyboard 이동keydown·canvas/window blur·document hidden·입력disable·pause/stop/dispose는 held UI 방향을 해제한다. UI 방향keydown 전환에서는 keyboard가 이어받는다. focusin이 이동 제어영역/캔버스 밖으로 나가면 clearInput. setProject는 _applyProject 뒤 pause하여 기존RAF 취소·입력/accumulator 해제 후 asset load; 교체 후 clock0/paused. step은 해제된 입력 상태의1/60초 |
| 공개 UI / DOM | source-play-controls role group 내 source-play-west/north/south/east는 aria-pressed native button, source-input-stop은 이동 해제. running 준비된 sourcePreview에서만 방향 활성. source-input-state leaf role=status에 현재 방향/해제/일시정지 표시. source-delta-import+source-delta-file은 공개 파일선택. 4방향click+해제click+document focusin+delta open+filechange=신규 UI handler8개; 부모 컨테이너 textContent 교체0 |
| v7 추가 자료 / API | map-source-adapter.js applyMapSourceHandColliderDelta(previewProject,{delta,scope}) → ok/errors/pending/candidateProject/sourcePreview/project:null/world:null/adoption:UNADOPTED/inspection. 실행 중·4MiB 초과파일·프로젝트 변경race·중복delta·비canonical baseline·invalid data/scope는 설치 거부. 새 후보만 store.replace하며 현재 actor/camera를 capture해서 유지. 상세 계약은 FDG_HAND_COLLIDER_DELTA_V7.md |
| v6 원본 / v7 / 작성권위 | collision sourceExecutionSnapshot.nativeExecutionSnapshot은 기존 raw v6, nativeDeltaSnapshot은 전체 raw v7, baseSourceExecutionSnapshot은 기존 normalized13을 각각 보존. ENGINE_AUTHORING scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32를 별도 보존. 원본 raw13 prefix 불변; corpse2 metadata collision:false로 제외·pit_poison1만 추가. 현재metaMissing0, v6 raw의 과거missing3 기록은 유지 |
| pit_poison / 충돌 수 | native-hand-13-pit_poison circle center[6500,5580]/radius80px. 원 기존13(11circle+2ellipse)+새1circle=수동14(12circle+2ellipse). sourcePreview.status.collision SOURCE_SUBSET_CONSUMED, supportedSourceObjectColliderCount14/collisionCoverage PARTIAL, actualObjectColliderCount:null/fullObjectColliderCount:null, navScope polygon+exact-native-hill-band+source-object-subset/sourcePending=[collision-assembly]. 화면 수동 배치 충돌14영역·전체 연결 대기; 전체 count/visual85와 identity UNKNOWN |
| 실제 Play 시작 / 해제 | 이전 저장 EXIT4020,300을 정상 현재 입력으로 소비하고 v7 설치 후 Play 시작. 공개남쪽 held에서 clock0.500/4020,336.4→4.733/4020,996.8, 해제5.017/4020,1002.0→30.483에도 같은XY(Play clock 계속). pause30.517·paused ArrowDown 단일press 변위0/clock동일·step30.533·resume30.767에도 방향해제/같은XY. 자동화도구 held keyboard 기능이 없어 공개 연속방향 UI로 검수했으며 연속keyboard 실보행 PASS 주장은0 |
| 실제 나무 / 경사 / 카메라 | 정상 Play 남쪽 이동4020,3381에서 native-hand-8-m_c1tree 차단·clock61.783→88.600에도 같은XY. 서쪽3682 우회 후 실제3986.8경사선 접근. [5216,3986.8] 원0.5599/Z35.83 → [5405.8,3986.8] 원1/Z64, 카메라 실제export[5405.80000000018,3922.7999999999033]/followtrue. summit save/export/reimport 같은포즈·clock0/방향null·Z64; 다시 Play 서쪽[4989.8,3986.8]/Z0으로 내려왔다 |
| 실제 신규pit 차단 / 우회 | 실제 Play [4989.8,5601.4]에서 동쪽 이동→[6409.4,5601.4] native-hand-13-pit_poison 차단. clock168.367→174.367에도 같은XY. 접촉점 북쪽도 [6409.4,5596.2]에서 원 안쪽 진입 차단. 실제 서쪽[6219.6,5596.2]→북쪽[6219.6,5338.8]→동쪽[6492.6,5338.8]/[6763,5338.8]→남쪽[6763,5596.2]로 우회·Z0. actor강제위치/teleport/합성키/BFS이동0 |
| 최종 저장 / reload / 교체 | public pause/save/export 후 actor[6763,5596.2]·Z0·수동14/PARTIAL 유지. browser reload 및 동일actual export 공개import 뒤 같은pose·camera follow·clock0.000/paused/heldnull. v6 raw+v7 raw+scope/원 nav/START/EXIT/85/soil/height/appearance/기존캐릭터 clips 보존. 실제pose/camera의 unrounded 수치는 actual-play-final-export-proof.json 참조. World·본편 save·combat 연동을 인수한 것은 아님 |
| 신규 검사 / 관측 실패 | 신규 input4/4+delta4/4=고유8/8 PASS·fail0. delta 안전보충 affected1/1은 고유검사 합계에 추가하지 않는다. old suite/proof/PNG/source/Git seal 재실행0. Play UI 첫 긴Y대기 tool timeout은 실제입력으로 북쪽복귀, 이후 짧은clock대기+finally해제로 수집; final export는 완료 후 download wait10초기한초과/reset, AX저장/내보내기 확인하고 기존Downloads(11)만 회수·반복export0. 두 관측실패receipt 보존 |
| 버전 / 캐릭터 / 범위 | Studio/CSS entry v0.16.1·studio의 runtime/adapter imports v0.16.1; project/source-panel/source-preview/source-preview-runtime/source-collision은 v0.16.0, appearance/height-ground0.15.0·exactheight0.14.0·physical0.10/AST0.11·World0.8 유지. 해당 제작클립 기본목표 실제24장+24FPS, 이번 기존클립 frames/FPS/interpolation 일괄변경0·상한24 강제0·신규캐릭터/모델/리그 생성0 |
| 시각 / 미인수 | 실제actor 이동·가림·ramp 높이·camera와 신규pit 충돌/우회 확인. soil/뿌리와 actor 대비, 경사/충돌 윤곽 가독성 약함: preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. full MAP_OBJS/_nearFloor/colParts/visual↔collider identity/native crop/origin/pivot/depth/UV/원physicalZ·본편 스킬/VFX/보스관문/1-2 미인수. captured console warn/error[]는 수집범위이며 별도pageerror/network404/VRAM/GPU/실전FPS/Windows 성능인증0 |
| 증거 / 파일 소유 | E=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-play-input. actual-play-ui-proof.json·ramp/final export와proof·새pit/ramp/reopen 캡처·first-tests-runtime.json·worker-delta 최초검사/patch·관측실패receipt·engine-review.md(§23). 변경소유 code5+신규test2+docs16=23파일, 코드전disk/HEAD/absence/실parent/non-symlink backup·소유 정/역byte patch·normal checkpoint 포함. 본편/원본PNG/확정문서 변경0·push/deploy0 |

다음 인수는 새 제작 UI 증가보다 동일 장면의 시각 가독성 보정과 실제 full assembly 입력 소비다. 게임 전용 스킬·VFX·성능 연결은 그 뒤 실제 화면/저장 흐름에서 검수한다.


## v0.16.2 완료 이력(동결) · 높이 옆면의 깊이 순서 수정 (2026-10-11)

| 항목 / 적용 위치 | 정확 계약·검수 범위 |
|---|---|
| 확인 원인 | source-preview-height-ground.js는 floor와 frontWalls를 동일 cache에 먼저 그렸고 source-preview-runtime.js는 그 뒤85개props와 actor를 그렸다. 이미 존재한 profile.depthY(projected-bottom-midpoint)는 painter에 쓰이지 않아 옆면의 깊이 순서가 누락됐다 |
| 변경 / API | SourcePreviewHeightGround._build는 원본soil floor만 cache1에 그림. 동일profile/UV/삼각형의 정적 commands를 _walls에 저장, depth 오름차순. visibleWalls(owner,left,top)은 localBounds viewport cull; drawWall(ctx,entry,image,left,top,{alpha,brightness,saturation})는 원본soil commands만 실행하고 finally복원·draw수 반환 |
| painter | 원 polygon clip의 projected53점은 draw마다1회계산·재사용; flat ground→projected floor cache→props와wall 두 depth배열 merge. 동depth이면 prop→wall, projected actorDepth=worldY−engineFootZ 이하를 그린 뒤 actor1회, 나머지 앞props/wall. actor/cutaway를 항상 최전면으로 강제하지 않음 |
| 색 / 투영 | floor의 기존40px+1024UV경계·높이투영·1px법선광원 그대로. wallalpha=ownerAlpha×ground.opacity×frontWalls.opacity; wallbrightness=ground.brightness×frontWalls.brightness, saturation=ground.saturation. 원본 PNG/원props native opacity/color/worldRect/sourceRect·source height/nav/evaluator 수정0 |
| 카운터 / 자원 | groundWallDrawCalls=현재viewport의실제wall drawImage수, visibleGroundWalls=현재그린wall profile수. groundDrawCalls/drawCalls에 wall포함. groundHeightTriangles는 floor+wall 정적triangle 총수, groundHeightWallTriangles는 wall정적명령 수(매프레임 수가 아님). cache1·1720×944·1623680pixels·명목RGBA6494720bytes, 신규Canvas/image/RAF/listener/timer/GPU0, dispose는 cache0×0과commands참조해제 |
| 상한 / 비용 | profiles<=96, profile당UV분할<=4cell×2triangle=8, wallcommands<=768; floor<=2024, 정적총<=2792. viewport ground<=flat64+floorcache1+wall768=833draw, props<=255, source consumer<=1088draw(actor/배경별도). v0.15의320draw는동결이력이다. 새wall은viewport에매프레임원PNG draw하며 GPU/VRAM/FPS성능인증0 |
| 현재 설정 / 권위 | R2 actorCutaway inner.14/outer.46/feather14px, terrainLighting direction[-.45,-.65,.75]/ambient.45/contrast.82/min.50/max1.2, frontWalls128/32·opacity1/brightness.55/probe.5. mapping64/0·source85·수동14/PARTIAL 그대로, full collision/physical Z/native anchor/crop/origin/UV 권위추가0 |
| 공개 QA / 이동 | 새 별도QA mid[5216,3986.8] normalized.559872→Z35.831808, 동쪽10px[5226,3986.8]→normalized.59695075/Z38.204848(공개UI38.20). summit[5405.8,3986.8] normalized1/Z64, 동쪽10px[5415.8,3986.8] normalized1/Z64·ramp−1·bandfalse. 새START종주0, Play/키보드홀드재검증0 |
| 새 저장 / 재열기 | 정상 새QAendpoint[5415.8,3986.8]·camera[5415.8,3922.8]/followtrue·clock0/input해제 공개저장/reload/JSONexport. 현재QA입력 대비 /actor/position,/camera,/provenance/heightRuntimeObservation만변경, map/native85/ground/nav/height14PARTIAL/appearance는동일. 이전R2 저장proof재실행0 |
| 신규 검증 | test/fdg-height-wall-depth.test.mjs 신규4/4 PASS·fail0/skip0. depth merge/actor1회·equal-depth prop→wall·원soil UV/scene불변·cache1/cull/dispose·throw/finally복원. 변경JS4 syntax PASS. 이전전체suite/1057/Play8/실패R1/성공R2 seals재검수0 |
| 버전 | index badge0.16.2, 최종cache key entry studio.js/runtime/source-preview-runtime0.16.2-final→height-ground0.16.2. CSS/studio adapter0.16.1·source schema/collision0.16.0·appearance0.15.0·exactheight0.14.0 유지. schema/validator/main game/server변경0 |
| 실제 시각 / 다음 접점 | 새 mid·summit·재열기·최종code PNG4 직접검수: actor존재와Z변화는확인, 이동면·경사·정상옆면은큰root props에계속묻힘. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. 현행 actorCutaway는actorFrame주변만대상, terrain projected coverage를대상으로하는전경가림소비필드가없음. 다음필요접점은 terrain coverage의가림규칙이며 임의새schema/수치/PNG생성으로완료를주장하지않음 |
| 증거 | engine-stage0-height-readability-final/ actual-height-ramp-mid.png, actual-height-ramp-summit.png, actual-height-qa-reopened.png, actual-height-qa-final.png, public-ui-trace.json, actual-height-qa-reopened-export.fdg.json, new-endpoint-consumption.json, wall-depth-test-first.log, visibility-depth-receipt.json, engine-review.md. captured warn/error[]는 수집범위, pageerror/404/seam/실전combat/Windows성능은미검수 |

## v0.17 현행 · 명시 높이 지형 노출 (2026-10-11)

이번 인수 범위는 별도 QA 위치의 높이 지형 노출 소비다. 전체 맵·본편 엔진·충돌 assembly·native physical Z 인수로 확대하지 않는다. 상세 schema/API/합성 수명은 [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)의 마지막 v0.17 표를 따른다. 앞선 버전의 검수·미구현 표현은 해당 버전 완료 이력이다.

| ID / 항목 | 현행 코드·수치·상태 |
|---|---|
| FDG-TEX-CONTRACT | appearancePreview.terrainCutaway는 optional 명시 ENGINE_AUTHORING. kind=projected-height-region, authority=ENGINE_AUTHORING, depthPolicy=after-region-max-projected-depth, sourcePhysicalZClaim=false, authoredBy 비공백 필수. foregroundOpacity 0..1 / featherPx >0..64 world/CSS px(zoom1). 작성 initializer SOURCE_PREVIEW_TERRAIN_CUTAWAY_DEFAULTS=opacity0.1/feather24; 자동 채움0 |
| FDG-TEX-STRICT | 필수 기존 appearance 검증·4MiB/깊이64/방문1,000,000 JSON 한계·unknown 안전 JSON 보존을 유지. attachSourcePreviewAppearance의 전체 작성 입력 snapshot이 별도 provenance에 깊은 일치해야 함. 누락·권위/단위/범위/claim 오류·snapshot 불일치 거부. 필드 absent 또는 opacity1이면 기존 렌더와 추가 exposure Canvas0 |
| FDG-TEX-REGION | 기존40px+1024UV cuts의 실제 engine height-projected raised floor triangle + south wall quad 합집합, 원53corner polygon의 같은 height 투영과 교집합. 대상 prop은 region의 최대 projectedY보다 strict 앞(entry.depth > max)일 때만. 같은 깊이·뒤쪽 제외. 이번 입력 coverage1032 / max projected depth4240 world px |
| FDG-TEX-BLEND | 원PNG의 해당 projected 영역 내부만 native opacity×(1−(1−foregroundOpacity)×maskAlpha). maskAlpha=blur(featherPx)×hard coverage; 외부 mask alpha0. hard alpha>0 row-run을 한 번 readback·같은 span 연속 row 세로병합 → disjoint union clip; inside nonzero / outside complement evenodd. floor/wall 중첩 XOR0 |
| FDG-TEX-OUTSIDE | 원PNG direct outside / source color를1회 적용한 scratch inside의2 draw. 원worldRect/sourceRect·depth/native opacity/brightness/saturation·actor1회·기존 actor ellipse3영역·wall painter 순서 보존. 브라우저 cached Path2D 및 정적 outside path, Path2D 없는 환경 rect fallback. 바깥 bbox 전체를 scratch로 대체하는 첫 구현은 폐기 |
| FDG-TEX-CACHE | owner-local floor1+mask1+scratch1=Canvas3, 새 raf/listener/timer/image/GPU 소유0. 동일 soil decode당 build1/maskbuild1/hard readback1. dispose에서3 Canvas0×0, refs/coverage/clip rect/Path2D/outside map 해제. 이번1720×944: floor6,494,720 + exposure12,989,440 =19,484,160 nominal RGBA bytes. GPU/실VRAM 인증 아님 |
| FDG-TEX-BOUND | 기존 cache≤2048 each dimension/4,194,304 pixels·floor static triangles≤2024·wall profiles≤96/commands≤768·static total≤2792 유지. source draw 최대≤1513/frame=ground≤64+floor1+wall768+85props×3actor passes×2main+85×2scratch. actor/background·build2024+mask2 draw 제외. viewport cull 먼저·mask readback/build 시만 |
| FDG-TEX-COUNTERS | snapshot: terrainCutawayMaskBuilds/terrainCutawayMaskReadbacks/terrainCutawayClipRects/terrainCutawayCoveragePolygons/terrainCutawayProjectedDepth/ownedTerrainCutawayCanvases/terrainCutawayCacheBytes. draw: terrainCutawayObjects/terrainCutawayDrawCalls/terrainCutawayScratchDrawCalls. 기존 ownedHeightCanvases는floor1·groundHeightCacheBytes는floor만; drawCalls는scratch2도 포함 |
| FDG-TEX-TEST | test/fdg-terrain-exposure.test.mjs 기존 새5개를 수정 영향으로 확인 PASS5; 신규 procedural RGBA 보존1개 PASS1. first procedural teardown은 native test backend의0크기 정규화로 assertion 실패→consumer null refs 해제 확인으로 fixture만 수정·그1개만 재실행. renderer 수정0·과거 suite/oldproof0. 수정 후JS7 syntax PASS |
| FDG-TEX-ACTUAL | 새 own project fdg-stage0-terrain-exposure-v17. paused AUTHORING/public동쪽10px×42=420px; [4980,3986.8]Z0→[5000,3986.8]Z0→[5210,3986.8]normalized0.53746875/Z34.398→[5400,3986.8]normalized1/Z64/ramp1/bandfalse. clock0/input해제·camera5400,3922.8 followtrue. DESIGN START/EXIT 종주·Play/본편 검수 아님 |
| FDG-TEX-PIXELS | 새770×371 CUA canvas enabled/disabled 동일 pose 비교. 첫 bbox 합성은 outside≥16px 30,358 중5,732픽셀 delta>2/max15로 FAIL→mask union clipping 수정. 수정 후 같은 밖30,358픽셀 changed0/maxRGBA0; inside241,329 중226,738 changed/max168. 경계8/16px 따로 분리·native opaque alpha/physical Z 증명 아님 |
| FDG-TEX-SAVE | 새 own project만 public 저장/reload/JSONexport. 최종 공개 export 전체는 before-save export와 깊은 일치, appearance↔별도 snapshot 일치. 최초 새 own QA input과 map/height/nav/visual85/metadata/hand14PARTIAL 동일(행동 position/camera/heightRuntimeObservation만 갱신). 원R2파일 쓰기0 |
| FDG-TEX-ENTRY | index badge v0.17 / studio.js 및 이번변경8개파일의 관련 dependency query0.17.1. CSS0.16.1·다른 collision/adapter/height/physical/AST/World entry들은 기존값 유지. 독립 SourcePreviewRuntime 소비만 추가, game.html/본편save/combat/START/nav/geometry/sourcePNG 권위 변경0 |
| FDG-TEX-ACCEPTANCE | 실제 revised entry/mid/summit/reopened 화면에서 위쪽soil·경사·어두운south옆면·발 높이와 외부 전경 보존 확인. **이번 높이 지형 노출 VISUAL PASS / 전체 production FAIL·UNADOPTED.** full assembly/native anchor/crop/origin/UV/물리Z·다른3재질·본편/관문/1-2·Windows/FPS/GPU는 미인수 |
| FDG-TEX-EVIDENCE | 외부 E=engine-stage0-terrain-exposure-final. actual-terrain-*.revised.png / revised.qa.png, public-ui-trace.json, actual-terrain-reopened.revised-export.fdg.json, new-save-reopen-revised-contract-proof.json, terrain-exposure revised test receipts, pixel-preservation-revised-qa.json, engine-review.md. 첫 실패 증거 보존. own8code+1test+15docs=24 checkpoint, 공유Git rollback0/oldseal 재검사0 |
