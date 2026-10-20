
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

# FDG v0.17 · CH1-1 원본 미리보기·명시 높이 지형 노출

> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

> 현행 검수(2026-10-11): v0.17은 명시 ENGINE_AUTHORING terrainCutaway로 실제 투영된 높이 지형 안쪽의 전경만 노출한다. 별도 QA 입구→경사→정상420px, Z0→34.398→64, 저장/reload를 확인했다. 수정 후 경계16px 이상 바깥30,358픽셀은 RGBA 차이0이다. 이번 높이 지형 노출 범위 VISUAL PASS / 전체 production FAIL·UNADOPTED. 마지막 v0.17 표가 현행이며 이전1057/Play8/R1/R2/v0.16.2 검수는 동결·재실행0이다.

2026-10-11. 독립 UNADOPTED_VISUAL_PREVIEW에서 원본props9/85배치/soil1·정확 normalized 높이·ENGINE_AUTHORING64/0·가림 보정을 유지하며 native 수동14/PARTIAL을 소비한다. v0.16.1 공개 연속 방향 UI는 기존60Hz Play clock에서 실제 이동·해제·나무 차단/우회·경사Z64/카메라·v7 pit_poison 차단/우회·저장/reload/reimport를 확인했다. 이전 DESIGN START→EXIT1057회 paused 제작 종주는 동결 이력이다. full object assembly·본편/보스 관문/1-2 연결 인수와 native anchor/crop/origin/physical Z·visual↔collider identity는 미확정이며 캐릭터 대비·지형 가독성 보정이 남아 preview RETOUCH / production FAIL이다. 이 문단은 v0.16.1 완료 이력이며 현행 전체 계약은 마지막 v0.17 표를 따른다.

## 파일·API·적용 위치

| 파일 / API | 정확 계약 |
|---|---|
| server.cjs | `/fdg-source/ch1-1/<basename>.png` props9 및 `/fdg-source/ch1-1/ground/ground_dark_soil.png` soil1, 총10개만 GET/HEAD. 기존 server.cjs/3333를 재사용하며 새 서버·폴더 전체 proxy·원본 복제 없음 |
| map-source-adapter.js · createMapSourcePreview | `(inspection,{previewProject,observations,engineAuthored})` → `{ok,errors,pending,candidateProject,sourcePreview,project:null,world:null,adoption:'UNADOPTED'}`. 기존 승인 캐릭터/스킬/VFX만 소비. engineAuthored.groundLayout이 있으면 soil binding과 attachSourcePreviewGround를 소비 |
| source-preview.js · buildSourcePreview | `(inspection,observations,authoring)` → `{ok,errors,pending,sourcePreview}`. 원본85/승인9/실제관측9/명시작성 설정 필수 |
| attachSourcePreviewGround | `(existingScene,{groundLayout,resourceBindings,groundObservations})` → `{ok,errors,pending,sourcePreview}`. no-ground 기존schema 호환. exact soil1/명시작성/원53corner 필수·관측없는 recipe RUNTIME_PENDING, 첫runtime 관측1 후 READY/fullcrop |
| attachSourcePreviewHeight | `(existingScene,{sourceExecutionData:fullV4Envelope,heightMapping,movement})` → `{ok,errors,pending,sourcePreview}`. 원v4 전체 snapshot·별도 ENGINE_AUTHORING 저장, 원85/soil/nav/현재actorXY/camera 유지. native physical Z 인수0 |
| sampleSourcePreviewHeight | `(scene,worldX,worldY,{validated:false})` → `{ok,logicalHeight,engineFootZ,slope,ramp,bandBlocks,slopeKind,slopeDifferencePx,surfaceId,sourcePhysicalZClaim:false}`. owner가 검증한 장면의 `validated:true`는 vertex/query마다 전체4MiB 검사0. no-height/invalid는 ok:false·null 값 |
| validateSourcePreview | `(scene)` → `{ok,errors}`. 순수 안전JSON/schema/원본·생성 provenance/치수·색·배치/XY·미확정 상태 검사 |
| canMoveSourcePreview | `(scene,fromXY,toXY,radius,{validated:false})` → `{ok,reason}` 및 선택 heightPreview sample 필드. 반경1..19px, 원 polygon nav·bounds·원형 발/절벽 및 이동 분할≤min(10,radius), 최대16384분할. no-height는 기존 polygon-only 결과 |
| source-preview-height.js | imports0 순수 `createSourcePreviewHeight/validateSourcePreviewHeight/evaluateSourcePreviewHeight/sourcePreviewCliffBlocks`. 엄격한 원문3개+nativeParams11개를 고정 수치 코드에 연결하며 eval/Function/문자열 실행0 |
| source-preview-height-ground.js | owner-local `SourcePreviewHeightGround` Canvas2D texture cache. source geometry/nav 수정0·원본 PNG 생성0; 상세 상한·수명은 마지막 v0.17 표 |
| project.js | sourcePreview optional, schemaVersion1·전체 compact UTF-8 4194304bytes. map/grid/nav/raw START 동일 및 실제 캐릭터 발 반경 검사. sourceScene/rigScene/terrainScene 동시사용 거부 |
| SourcePreviewRuntime | constructor(scene,map,{canvasFactory}), requiredSources(), validateReady(assets), move(player,x,y), capture(player,camera), snapshot(player,camera), draw(ctx,owner,{drawActor,actorFrame}), dispose(). heightPreview에서 internal player.z만 파생 갱신, 저장 actor는XY2 |
| FDGRuntime | prepareSourcePreview(project) → `{ok,sources,release}`; sourcePreviewReady; getSourcePreviewSnapshot(); captureSourcePreview(); moveSourcePreview(dx,dy)의 paused norm≤10px. setMoveInput(direction)/moveInputDirection·setProject pause 계약은 동결 v0.16.1 표대로 유지하며 최신renderer는 마지막 v0.16.2 표 |
| Studio / SourceScenePanel | 기존 공개 입력5개·검토/연결 버튼 사용. 물리 실행 후보가 없고 명시9bindings/previewLayout이 있으면 「제작 미리보기 연결 · UNADOPTED」 활성. observe9→후보검증→prepare→설치, 오류/race이면 기존 장면 유지 |

## 원본 경로·서버·첫 디코드 관측

원본 canonical root는 `/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/map/ch1`이며 아래 상대경로와 서버 basename을 정확 매칭한다. 관측값은 원본 PNG를 runtime이 처음 디코드한 치수이고 native anchor/crop 권위가 아니다. 원본 PNG 수정·새 에셋 생성 없음.

| 승인 상대경로 | `/fdg-source/ch1-1/` 뒤 경로 | intrinsicWidth × intrinsicHeight | native 배치 수 |
|---|---|---|---|
| floor_objects/prop_g_battle.png | prop_g_battle.png | 982 × 1000 | 11 |
| floor_objects/prop_g_edge.png | prop_g_edge.png | 1100 × 529 | 11 |
| floor_objects/prop_g_root.png | prop_g_root.png | 1000 × 998 | 9 |
| floor_objects/prop_g_corpse.png | prop_g_corpse.png | 1000 × 996 | 1 |
| floor_objects/prop_g_toxic.png | prop_g_toxic.png | 881 × 900 | 2 |
| production_finish/depth/broken_thicket.png | broken_thicket.png | 1536 × 1024 | 14 |
| production_finish/depth/forest_stand.png | forest_stand.png | 1024 × 1536 | 18 |
| production_finish/depth/root_bank.png | root_bank.png | 1536 × 1024 | 10 |
| production_finish/depth/root_fan.png | root_fan.png | 1536 × 1024 | 9 |

| 경로 / 응답 | 정확 동작 |
|---|---|
| exact allowlist | raw req.url과 normalized pathname이 같아야 함. query/encoding/정규화 우회·다른 파일·다른 경로404, GET/HEAD 외405 및 Allow: GET, HEAD |
| 파일 열기 | canonical realpath 동일 확인 및 O_RDONLY\|O_NOFOLLOW. symlink403, 일반파일만. EACCES/EPERM403·ENOENT404·그 외500, 대체 이미지 없음 |
| 응답 | image/png, Content-Length, Cache-Control:no-store, X-Content-Type-Options:nosniff, Cross-Origin-Resource-Policy:same-origin. HEAD는 body 없음, GET stream. client close는 stream.destroy로 handle 정리 |
| runtime binding | canonicalAbsolutePath → `fdg-source/ch1-1/<approved basename>.png` 정확 상대 src. 다른 `/assets` URL을 원본 동일이라고 지정하지 않음 |
| 관측 | 정확9개 status:ready, observedBy:runtime-image-decode, 치수 정수1..32768. prepare에서 실제 decoded natural dimensions와 full crop 치수 정확 일치 검사 |

## sourcePreview 기본 schema·엔진 작성 공식 · 이후 선택 확장은 현행 표

| 필드 / 수치 | 정확 값·공식·권위 |
|---|---|
| schemaVersion/stage/mode | 1 / 0 / UNADOPTED_VISUAL_PREVIEW |
| grid/nav | width200,height200,tileSize40, world8000×8000. 원 polygon-only nav40000개0/1·walkable19438, boundary53점 유지. 선택 heightPreview는 별도 원 절벽 predicate/엔진 발 gate를 합성하며 nav 바이트 재작성0 |
| previewLayout | `{anchorConvention:'bottom-center',pixelsPerSourcePixel:1,authoredBy:비공백}`. 명시 ENGINE_AUTHORING이며 native anchor UNKNOWN |
| 원본 placement | `{file,x,y,scale,opacity,brightness,saturation,...unknown}` 원형 보존. scale finite>0, opacity0..1, brightness/saturation finite≥0. brightness1.08을1로 clamp하지 않음 |
| 엔진 foot / size | footX=(native.x+.5)×40, footY=(native.y+.5)×40. W=intrinsicWidth×native.scale, H=intrinsicHeight×native.scale |
| sourceRect/worldRect | full sourceRect=[0,0,intrinsicWidth,intrinsicHeight]; engine worldRect=[footX−W/2,footY−H,W,H] |
| image layer | 정확85개, 승인9경로 모두 등장. layer=world/depthY=footY, source native color/opacity 유지 |
| 그림 한계 | 좌표/끝점 ±131072, W/H>0 및≤131072. 그림 안전 상한이며 playable bounds 확장 없음. native y207→footY8300도 보존·화면 cull/clip |
| START | sourceStart raw[100,185]/center[100.5,185.5]/world[4020,7420]. 승인 설계 시작 권위 FDG_AUTHORED_CH1_1_START, native runtime symbol UNKNOWN |
| actor | 현재 position=[X,Y]만. actor Z/height/logicalHeight 또는 세 번째 좌표 및 top-level height/colliders 거부. 선택 필드는 heightPreview. 최초[4020,7420], 저장위치는 별도, internal player.z=engineFootZ는 파생값 |
| camera | 현재 x/y0..8000, follow boolean. heightPreview follow는 x=worldX/y=worldY−engineFootZ 후 기존viewport clamp. capture에 현재 clamp된 scalar 저장 |
| status/provenance | adoption UNADOPTED·collision SOURCE_PENDING·actualObjectColliderCount:null·productionAdopted/sourcePhysicalLayoutClaim:false. heightPreview 있으면 logicalHeight/cliff SOURCE_CONSUMED·sourcePhysicalZClaim:false, 없으면 기존 SOURCE_PENDING |
| unknown / 출처 | nativeRuntimeStartSymbol/nativeCrop/nativeOrigin/nativeAnchor UNKNOWN; source/manifest/선택revision snapshots 및 원 engineAuthoredInputSnapshot 원형 보존 |
| 생성 증거 | nativeVisualPlacements85와 각 layer.native 동일; generatedEngineImageLayers85는 실제 imageLayers와 구조 동일. runtime imageObservations9와 approvedSourceAssets9 별도 보존 |
| 높이 작성 | no-height는 기존 작성 메타를 opaque 보존. v0.14 heightPreview는 별도 heightMapping{kind:engine-authored-linear,scalePx64,offsetPx0,authoredBy}·movement{maxStep16,maxSlope.75,cliffFootPolicy,authoredBy}를 명시 소비. 원 game physical Z 주장0 |
| 불변성/JSON | builder의 provenance·imageLayers/native deep-freeze, store/capture는 독립 clone. scene/project 각각4194304 UTF-8bytes, depth64/visits1000000·plain dense finite JSON, accessor/cycle/reserved key 등 거부 |

## v0.14 실행·저장·수명 동결 이력 · 현행은 마지막 표

| 동작 | 현재 구현 |
|---|---|
| owner | 기존 FDGRuntime의60Hz input/clock/camera/Canvas/asset Map 사용. 새 consumer 자체RAF/listener/timer/image/GPU0 |
| 그리기 | no-height는 기존 worldY 순서. heightPreview는 soil cache와 props/actor의 projectedY=worldY−engineFootZ를 사용하고 props projected depth 사이 native actor1회 삽입. 원 sourceRect/worldRect/color 메타는 유지, source full crop9args drawImage·viewport cull/clip·finally 복원 |
| 준비/실패 | 모든 필수 source·캐릭터 이미지 decode 전 start/step 차단. ground JSON import는 store.replace 전에 prepareSourcePreview로 실제soil decode/치수 및 race를 확인. prepare 실패 시 이전 project/actor/camera/errors 보존, 새 임시 asset records 정리. generation/loadVersion/dispose race 거부·release는 활성 assets 유지 |
| 입력 | paused 공개4방향 버튼10px, running WASD/방향키는 owner60Hz 분할 이동. 원 polygon 발 support와 선택 원 절벽/엔진 mapped step/slope gate를 소비 |
| 미확정 물리 | sourceSceneReady=false, snapshot height:null·position XY2. heightPreview는 별도 logicalHeight/engineFootZ/ramp/bandBlocks를 반환하나 실제 object collision/원 physical Z는 pending. World 진입·스킬/Space/pointer/VFX 소비 차단 |
| 저장 | `fdg.studio.project.v1`에 현재 actorXY/camera·선택 provenance.heightRuntimeObservation을 저장. validator가 현재XY/원식/엔진 mapping을 재평가. sourceStart/nav/85/soil/미확정 권위 유지·reopen clock0. v0.14 별도QA summit5420/3940/Z64·cliff6640/3940/Z0 실제save/reload복원 확인 |
| UI/계측 | toolbar UNADOPTED·현재XY·이미지/85·원 soil/작성 UV·선택 원 normalized→엔진 발 Z·실object 충돌 SOURCE_PENDING. heightPreview의 scale/offset 편집은 명시 ENGINE_AUTHORING으로 저장·물리Z 승격0. no-height 입력은 빈값/disabled. 기존6초 측정 비활성·GPU/VRAM/실전FPS 인증 없음 |
| cache | HTML entry `studio.js?v=0.14.1`(import전환 finiteheightReady guard수정). studio 내부source-panel/adapter/project/source-preview/runtime/preview-runtime 및 새 height/height-ground `?v=0.14.0`. 기존 physical sourceScene consumer `?v=0.10.0`, height-program `?v=0.11.0`, CSS `?v=0.10.0` 유지 |

## v0.12 완료 검증·실제 결과 · 역사 동결

| 검사 | 실제 결과 / 한계 |
|---|---|
| 신규 의미 검사 | 순수 schema/adapter/project 최초5/5 PASS + runtime 최초8/8 PASS =13고유PASS. synthetic UNIT 이미지이며 이전15/23/16/완료 suite 재실행0 |
| 서버 새 경계 검사 | 첫5/5 PASS: unknown404, POST exact405, query404, encoded404, 기존Studio HEAD200. 이5개는 원본 PNG를 읽는 검사가 아님 |
| 실제 연결 | 공개 입력→원본9 첫 decode→85 layer 후보→prepare/install 성공. START[4020,7420]에서 현재 viewport 실제4개 원본 이미지와 승인 캐릭터 표시. 85개가 한 viewport에서 모두 보였다는 뜻이 아님 |
| 지원 입력·시간 | 북쪽 버튼10px→[4020,7410], 1프레임→0.017초, play60Hz/stop 실행. 실제 순간 W/ArrowUp tap은 이동 변화 관측0; held key CDP 미지원, browser keyboard 보행 인수로 세지 않음. 60Hz 키 입력은 신규 synthetic 검사만PASS |
| 저장/재열기 | 실제 공개 저장·다운로드된 FDG JSON: actor[4020,7410], camera{4020,7410,follow:true},85 layers/native85/관측9·미확정 상태 보존. reload 후 원본 탭/같은XY/실제4이미지 복구, 높이 빈값·clock0 |
| UI 오류 | 현재 탭 captured error 로그0. 별도pageerror/network404 이벤트/FPS/GPU/Windows 측정 없음 |
| 시각 | 원본 이미지는 실제로 표시됐으나 v0.12 당시 바닥 재질 미연결·native anchor/crop 미확정. preview **VISUAL VERDICT: RETOUCH**, production **VISUAL VERDICT: FAIL**. 당시 source ground/collision/height 인수 차단 |
| 증거 | 외부 `engine-stage0-visual-preview`의 actual-preview-export.fdg.json·actual-preview-proof.json·ui-preview-first-install.json·ui-preview-reopen.json·actual-preview.png·§23 engine-review.md·first test/own projection |

본편 game/nav/geometry/LOCK/START/EXIT/확정 전투/save·원 PNG는 변경하지 않았다. 24장/24FPS는 해당 제작 클립의 기본 목표이며 기존 모든 클립/리그를 일괄 변환하지 않는다. 다음 인수는 MAP의 실제 `_OBJ_META`+stage0 instances와 exact `_CH1_HILL` evaluator, native draw anchor/crop·ground 계약이 제출되는 변경분을 소비하여 같은 화면에서 접지·충돌·바닥을 검수하는 것이다.

## v0.13 승인 흙 바닥 · 완료 구현·역사 동결

| 원본 재질 key | canonical root 기준 상대경로 / 보존 값 | 현재 소비 |
|---|---|---|
| soil | ground_dark_soil.png; brightness0.85/saturation0.48 | exact src fdg-source/ch1-1/ground/ground_dark_soil.png·첫실decode1024×1024·fullcrop[0,0,1024,1024] |
| mask | production_finish/ground-zones.svg; values.raw=ground-zones.svg | PENDING/used:false. SVG 해석·mask 합성·파일 decode 없음 |
| litter | production_finish/materials/forest_moss_litter.png; tileSize512/brightness.76/saturation.55 | PENDING/used:false. 반복·배치·decode 없음 |
| commonSkin | production_finish/floor87_sources/skin_material_generated.png; mask floor87_sources/floor87_mask.png/retouch floor87/rgbScale[.58,.62,.67]/opacity.94/periodPixels1792/overlapPixels256/navFeatherPixels34 | PENDING/used:false. mask의 별도승인 근거 없음·RGB/feather/합성/decode 없음 |
| collisionChanges | values.raw=false; file/canonicalAbsolutePath/exists null | 이미지 파일/실제collider0로 해석하지 않음 |

위4 source refs는 설치된 원본 manifest의 exists:true/canonicalAbsolutePath/RESOLVED를 보존한 첫 소비다. soil만 실제파일을 읽는다. groundTile1024² 메타를 픽셀치수/UV 권위로 대입하지 않았으며, 실제1024²는 runtime decode 후 별도관측으로 기록했다.

| 새 필드 / API / 상수 | 정확값·공식·실패 동작 |
|---|---|
| groundLayout | kind engine-authored-repeat / materialKey soil / origin[0,0] / tileWorldSize[1024,1024] / opacity1 / authoredBy 비공백 / clipConvention source-tile-corners. 명시 ENGINE_AUTHORING, native UV UNKNOWN |
| resourceBindings | canonical absolute soil path → fdg-source/ch1-1/ground/ground_dark_soil.png exact 상대src. URL alias·추측 경로 거부 |
| groundLayers | 선택1개 id native-soil-repeat / materialKey soil / render repeat / layer ground / sourceRectMode decoded-full / role engine-authored-ground-repeat / nativeUV UNKNOWN. native brightness.85/saturation.48 유지 |
| 치수/준비 | RUNTIME_PENDING에는 sourceRect 없음·groundImageObservations[]. READY는 관측정확1개, status ready/observedBy runtime-image-decode·intrinsic정수1..32768·full sourceRect[0,0,W,H]. saved READY와 실제 decoded natural dimensions가 다르면 실패 |
| groundClip | convention source-tile-corners / tileSize40 / polygon 원 sourceSnapshot.boundaryPolygon.data53점 그대로. source units tile index·정수0..200, clip world point=[tileX×40,tileY×40], center .5 추가 없음 |
| provenance | groundEngineAuthoredInputSnapshot{groundLayout,resourceBindings}/groundImageObservations/groundImageObservationRole runtime-decoded-intrinsic/generatedGroundLayers 별도clone/groundRuntimeStatus/groundNativeUV UNKNOWN/unusedGroundMaterials3. source/manifest·85·nav·actor/camera·물리pending 원형 보존 |
| 안전JSON | 기존4194304bytes/plain dense finite JSON·getter 실행0 검증, groundClip/groundLayers/provenance freeze. sourceRect/clip/colors/used/adoption 조작 거부 |
| requiredSources/validateReady | 기존props9에 soil1추가. owner asset Map에서 decode 성공 후 attach로 실제관측/fullcrop 봉인. 실패시 scene/현재XY/원자료 유지, prepare 임시records release |
| 순서/clip | viewport clip → nested 원53point ground clip → soil repeat → depth 순서의 기존85props/actor1회. props/actor는 ground polygon clip 밖에서도 기존그리기 계약 유지. ground paint를 physical collision으로승격하지 않음 |
| viewport cull | left=camera.x−width/2, top=camera.y−height/2. 각축 min=max(0,floor((viewportMin−origin)/1024)), max=min(7,floor((viewportMax−origin)/1024)); 범위의tile만 9args drawImage·최대8×8=64 groundDrawCalls. world전체타일0..7·bounds8000은 원형유지 |
| Canvas state | ground alpha=callerAlpha×1/filter brightness(.85) saturate(.48). nested/outer finally restore와 alpha/filter 원값 복구, throw에서도 동일. 새RAF/listener/timer/image/GPU0 |
| snapshot/capture | groundLayers0/1·groundRuntimeStatus UNCONNECTED/RUNTIME_PENDING/READY·groundDrawCalls0..64 추가. capture에 실제관측/fullcrop·현재actorXY/camera만 저장. height:null·SOURCE_PENDING collision/cliff/logicalHeight·actualObjectColliderCount:null 유지 |
| 공개 import | ground 포함FDG JSON은 prepare→running/project 동일성 확인→store.replace→refreshRuntime. 실패/race는 이전project/actor/camera 유지. release/finally file input 초기화. 새패널/입력/리스너 없음 |

## v0.13 새 의미 검증·실제 저장·시각 인수

| 검사 / 증거 | 실제 결과 / 한계 |
|---|---|
| 신규contract | fdgSourceGroundContract.test.mjs4개. 첫 helper SOURCE_PREVIEW_GROUND_URL import누락으로0PASS/4FAIL(제품코드 실행전), import보충후 해당4개4PASS/0FAIL. 첫실패와수정로그 보존. 기존완료파일import0 |
| 신규runtime | fdgSourceGroundRuntime.test.mjs 첫4PASS/0FAIL. soildecode 실패/저장치수변경, ground→props/actor+원53corner clip, polygon외soil없음, 최대64/오프월드0draw/context throw복원, capture/reopen/consumer dispose를 synthetic UNIT 검사 |
| 서버/경로 | 기존server3333 한번재시작 후 soil exact URL에서 최초원본 decode1024² 성공. 이전13/5 및15/23/16 등의완료suite·old9 이미지/Git봉인 재실행0. 새로운negative서버suite 없음 |
| 실제 화면 | 기존4020,7410에서 원85/nav/actor 유지하며 soil 실제표시. blackground→원흙. 현재viewport 원본4/85와캐릭터 표시, 한 화면에85개 전체가보였다는뜻이 아님 |
| 이동/save/reopen | 공개북쪽 한걸음10px→actor[4020,7400]/camera{x:4020,y:7400,follow:true}. 공개저장·JSON다운로드의 ground READY/실제1024²fullcrop/작성UVUNKNOWN/other3PENDING 확인. reload 후같은soil/XY/원본탭·clock0·height 빈값복원 |
| 오류/성능 | 현재탭 captured error0. 별도pageerror/network404/GPU/VRAM/FPS/Windows 인증 없음. paused profiler 수치와 source drawCalls를실전최적화완료로세지않음 |
| 시각판정 | 실제soil 바닥 설치·START 근처 저장복원 확인. native anchor/UV·나머지재질·실접지/충돌/높이 미인수. preview VISUAL VERDICT: RETOUCH, production VISUAL VERDICT: FAIL |
| 증거 | 외부 engine-stage0-ground-preview/actual-ground-preview.png·actual-ground-export.fdg.json·actual-ground-proof.json·ui-ground-first-install/move-save/reopen.txt·newtest/patch/checkpoint·§23 engine-review.md |

v0.13 당시 단위는 supported soil1의 미리보기 소비다. 당시 후속 collider/evaluator 검수 계획과 위 증거는 동결한다. 정확 v4 evaluator·절벽 소비는 아래 v0.14에 추가하며, 나머지3재질과 실제 object collider 인수는 대기다.

## v0.14 정확 logical-height·절벽 소비 · 동결 이력

| source-v4 / 단위 | 정확 값·원식 |
|---|---|
| 입력 / 원본 보존 | MAP/ch1-1.execution-data.source-v4.json의 full envelope를 heightPreview.sourceExecutionSnapshot에 보존. 원 source game.html:32353-32369; baseRef 문자열 자동로드0·원본/geometry/nav/PNG 변경0 |
| 연속좌표 | tx=worldX/40, ty=worldY/40. samples.tile은 셀인덱스·samples.px=(tile+.5)×40. px/T40에 .5를 다시 더하지 않음 |
| nativeParams11 | cx147/cy98/rx18/ry9/inner.84/outer1.04/rampX0125/rampX1135/rampY98/rampHalf01.8/rampHalf13. 길이·좌표는tile, d는무차원 |
| exactEvaluator.rampAt | tx<125 또는 tx>135 →−1; t=(tx−125)/10; half=1.8+(3−1.8)t; abs(ty−98)<=half이면t, 아니면−1 |
| exactEvaluator.heightAt | ramp>=0 →ramp²(3−2ramp); 아니면 d=sqrt(((tx−147)/18)²+((ty−98)/9)²), d<.84일 때1/그 밖0. 정확 불연속 유지·bilinear grid 대체0 |
| exactEvaluator.bandBlocks | ramp>=0이면false, 아니면 .84<=d<=1.04. hillCliffBand.rule `_ch1HillBandBlocks: 0.84<=d<=1.04 && ramp<0 -> isW(stage0)` |
| semantic binding | source 문자열3개+11값을 strict 비교하여 고정 수치 함수에 연결. eval/Function/AST 추정 확장0. 미지원 문자열은 ENGINE_IMPLEMENTATION pending·후보없음 |
| 최초 원자료 대조 | 제공6 sample 모두 일치. ramp entry px5020/3940→tx125.5/ty98.5/r.05/h.007250000000000001, mid5220/3940→r.55/h.5747500000000001, exit5420/3940→r−1/h1. 셀센터 summit340/band166 일치. 최초1회만 분석·후속 count/sample QA 반복0 |
| 실제 object collider | v4 extraction blocked/objectColliderCount UNKNOWN 보존. visual85를 collider85/0으로 승격하지 않음·원 collider 인스턴스 발명0 |

| nativeParams key | value | unit / 의미 |
|---|---:|---|
| cx | 147 | tile · hill 중심 X |
| cy | 98 | tile · hill 중심 Y |
| rx | 18 | tile · ellipse 반경 X |
| ry | 9 | tile · ellipse 반경 Y |
| inner | 0.84 | 무차원 · inner normalized radius |
| outer | 1.04 | 무차원 · outer normalized radius |
| rampX0 | 125 | tile · ramp 시작 X |
| rampX1 | 135 | tile · ramp 종료 X |
| rampY | 98 | tile · ramp 중심 Y |
| rampHalf0 | 1.8 | tile · ramp 시작 반폭 |
| rampHalf1 | 3 | tile · ramp 종료 반폭 |

| 엔진 작성 / 저장 | 정확 값·공식·상한 |
|---|---|
| heightPreview | version1 / kind exact-native-hill-preview / full sourceExecutionSnapshot / 별도 heightMapping·movement / sourcePhysicalZClaim:false / engineDerived |
| ENGINE_AUTHORING | engineFootZ=offsetPx+logicalHeight×scalePx. 현재명시64/0, kind engine-authored-linear·authoredBy 필수. 지원scale>0/offset>=0/sum<=1024px·기본값생성0 |
| slope | 원 source수치 없음. 엔진 mapped-height finite difference±1world px/경계0..8000 clamp, slope=hypot(dx,dy). engineDerived slopeKind engine-mapped-finite-difference / slopeDifferencePx1 / slopeCoordinates world-px-central-clamped / sourceSlopeClaim:false |
| 발 원형·sweep | radius1..19px·source ellipse annulus와 원 겹침을 확인. inner ellipse 안/outer 밖 또는 원 전체가 원 ramp 사다리꼴에 포함되면 통과, ramp 일부만포함이면 보수차단. 명시 cliffFootPolicy conservative-ellipse-band-contained-ramp; exact native point bandBlocks와 구별 |
| authored gate | 현재 maxStep16px/maxSlope.75, 지원maxStep1..64/maxSlope0..1/authoredBy 필수. sweep spacing<=min(10,radius), cap16384, ellipse bisection48·엔진EPS1e−7. 원 polygon nav바이트 유지 |
| 저장 observation | provenance.heightRuntimeObservation={worldPx:현재actorXY,logicalHeight,engineFootZ,ramp,bandBlocks,observedBy:fdg-source-preview-height-v1,sourcePhysicalZClaim:false}. validator 정확 재평가, actor.position은XY2·sourceSTART 정적 유지 |
| source/authoring provenance | sourceExecutionSnapshot 전체unknown 보존, heightEngineAuthoredInputSnapshot{heightMapping,movement} 별도. native physical Z UNKNOWN/PENDING·productionAdopted:false·actualObjectColliderCount:null |

| 그리기·cache·수명 | 정확 현행 값 |
|---|---|
| owner projection | floor/props/actor projectedY=worldY−engineFootZ. native actor1회·props의 projected depth 순서. follow cameraY=worldY−Z 후 기존 clamp. 원85 sourceRect/worldRect/밝기1.08/foot8300·soil 원형 보존 |
| local ground cache | 원soil texture의 owner-local Canvas1개. 원logical vertex sample+엔진 texture tessellation이며 native geometry export가 아님. local world bounds x4960/y3480/width1720/depth880, approved64/0에서 cache1720×944 |
| tessellation | source40px 간격과1024 repeat UV 경계 cuts로 최초2024삼각형 affine texture draw. source shape/nav 수정0·회색fixture/새PNG0 |
| 예산 / draw | 각축<=2048·총<=4194304pixels(2048²). 현재1623680pixels·nominalRGBA6494720bytes. 동일이미지 localcache1회 build·visible frame1draw/오프스크린0. flat repeat<=64+cache<=1→groundDrawCalls<=65 |
| snapshot / dispose | groundHeightCacheBuilds·groundHeightTriangles·ownedHeightCanvases·groundHeightCacheBytes. dispose canvas width/height0·pixels/bytes0·이미지/sample/factory참조해제. 자체RAF/listener/timer/image/GPU0 |
| 검증 / rendering 경계 | cached vertex sample은 validated:true, 전체4MiB schema 검사반복0. Canvas CPU/호출수·nominal 메모리는 GPU/VRAM/FPS/Windows 인증이 아님 |

## v0.14 신규 의미 검사·실제 QA 인수

| 검사 / 인수 | 현재 결과 / 한계 |
|---|---|
| 순수 계약 | fdgSourceHeightContract.test.mjs 최초4/4 PASS·fail0. 추가 synthetic 좌표·연속식/작성값분리·cliff 원형/sweep·step/slope·XY 저장/관측 재검증·validated:true fastpath 검증 |
| 신규 runtime | 신규4개 첫2PASS/2FAIL(합성fixture API 오류)·오류수정후 affected2/2PASS. 최종4고유PASS. 첫실패 이력 보존, 앞2PASS·이전완료suite 재실행0 |
| 합계 | 이번 pure4+runtime4=8고유PASS. 이전v0.12의13/5server·v0.13의8·15/23/16 등 완료검사/source9 PNG/Git봉인 반복0 |
| 실제 ramp QA | 원START와 별도QA 배치[4990,3940]에서 공개동쪽10px×23→[5220,3940], logicalHeight=0.5747500000000001→engineFootZ=36.784000000000006. offset1명시 적용→동일논리/Z37.784000000000006, offset0복원 후동쪽20걸음→[5420,3940], logical1/Z64. 총43걸음 |
| UI 반올림 | logicalHeight toFixed(4) / engineFootZ toFixed(2): mid 0.5748 / 36.78, offset1 37.78. 원식의 Float64 값과 구별하며 summit 저장값은 logical1/Z64 |
| 작성/저장/reload | 높이편집은 heightMapping과provenance.heightEngineAuthoredInputSnapshot을함께갱신. summit actorXY[5420,3940]·camera{5420,3876,follow:true}·observation logical1/Z64/ramp−1/bandfalse를공개저장/다운로드/reload 복원 |
| 실제 cliff QA | 별도[6670,3940]→공개서쪽10px×3=[6640,3940]/Z0. 4번째[6630,3940]시도 source-cliff-band 발gate로차단·XY/Z보존. [6640,3940]·logical0/Z0·camerafollowtrue 저장/export/reload복원 |
| 실제화면/범위 | root가mid/summit/reopen/cliff 화면을inspect. mid/summit/cliff 현재viewport원본3/85 표시. QA 배치는sourceSTART4020,7420부터도달한증거가아님·STARTreachability검수0. v0.13 soil/원props9/완료suite 재검사0 |
| 실제 import 오류 / 수정 | 첫import 실패시도2회: 새project height와이전runtime 전환 중 toFixed guard오류1회 + 같은URL JS3600s cache의구guard 재호출1회. finiteheightReady guard수정+entry studio.js?v=0.14.1 후공개import/heightedit/ramp43/cliff4/save/export2/reload2 PASS·repairedEntryErrors[]/capturederror0. 최초실패이력보존·별도pageerror/network404/FPS/GPU인증없음 |
| 시각 / production | preview VISUAL VERDICT: RETOUCH. 절벽props가캐릭터를가리는문제·흙의높이가독성 약함. production VISUAL VERDICT: FAIL·실object collider/원 physical Z·완성환경 미인수 |
| 증거 | engine-stage0-height-preview/actual-height-proof.json·actual-height-ramp-mid.png·actual-height-ramp-reopen.png·actual-height-cliff-blocked.png·actual-height-ramp-export.fdg.json·actual-height-cliff-export.fdg.json 및 height-contract-first-test.txt·source-v4-first-formula-analysis.json·height-api.md·height-own.patch/inverse·height-patch-projection.json |


## v0.15 완료 이력(동결) · 같은 renderer의 캐릭터 가림·높이 가독성 보정

높이 소비 v0.14의 완료 자료·검사·원본 봉인은 이력으로 동결한다. 이번 단위는 원본 장식의 앵커나 충돌 영역을 추정하지 않고 기존 투영·앞뒤 순서 안에서 가림과 높이 면을 보정한다. 별도 QA 배치이며 START 도달·production 인수를 뜻하지 않는다.

| 파일 / API | 현행 계약 |
|---|---|
| source-preview-appearance.js | validateSourcePreviewAppearance(contract,{jsonValidated:false}), createSourcePreviewAppearance(appearancePreview), sourcePreviewActorCutaway(contract,layerBounds,actorBounds,{validated:false}), sampleSourcePreviewDirectionalBrightness(sample,x,y,contract,{validated:false}), createSourcePreviewFrontWallProfiles(params,sample,contract,{validated:false}) |
| source-preview.js | attachSourcePreviewAppearance(existingScene,{appearancePreview})→{ok,errors,pending,sourcePreview}. 기존 heightPreview가 명시된 scene만 허용. 선택 appearancePreview를 복제·검증·동결하고 provenance.appearanceEngineAuthoredInputSnapshot에 전체 입력을 별도로 저장. unknown JSON 보존·기본 appearance 생성0 |
| source-preview-runtime.js | draw(ctx,owner,{drawActor,actorFrame}); actorFrame은 실제 선택 sprite의 frameWidth×scale/frameHeight×scale/anchorX/anchorY. 가림이 없거나 appearance가 없으면 기존 renderer 소비. frame 양축>0/<=40960, anchor0..1·Canvas ellipse/moveTo 필수 |
| runtime.js | 실제 캐릭터 frame을 소비자에 전달. 캐릭터1회 draw는 기존 projected depth 위치에 유지. actor를 맨 마지막에 덧그리는 방식0 |
| source-preview-height-ground.js | 기존 owner-local cache에 경사 명암·남쪽 높이 면을 원본 soil texture로 그린다. native geometry/nav/PNG 변경0·새 asset/canvas/GPU 생성0(기존 cache1개 재사용) |
| cache query | entry/studio/runtime/project/adapter/source panel/preview consumer/height-ground/appearance v0.15.0. 정확 height pure는v0.14.0, physical source consumer/CSS v0.10.0, AST height programv0.11.0, World 기존0.8.x 유지 |

| 저장 필드 / 분류 | 이번 명시값 | 검증 범위·적용 위치 |
|---|---|---|
| appearancePreview.version/kind | 1 / engine-authored-readability | ENGINE_AUTHORING. 선택 입력이며 원native lighting/anchor/collider claim 아님 |
| authoredBy / sourcePhysicalZClaim | FDG explicit preview readability correction; native anchors/colliders UNKNOWN / false | 비공백 작성자·false 필수. native physical Z UNKNOWN 보존 |
| actorCutaway.kind | projected-ellipse | 현재 projected sprite AABB와 앞쪽 layer projected AABB의 strict 교차에만 적용; PNG alpha/원본 opaque 영역을 추정하지 않음 |
| actorCutaway.innerOpacity | 0.24 | 0..1, inner<=outer. 캐릭터 frame ellipse 내부의 앞장식 opacity 배율 |
| actorCutaway.outerOpacity | 0.62 | 0..1. 내부와 확장 ellipse 사이 band |
| actorCutaway.featherPx | 8 | >0..64 world/screen CSS px(현재 zoom1). ellipse 양반경에 추가하는 band 폭; 연속 gradient 아닌3영역 clip |
| terrainLighting.kind | engine-authored-directional | ENGINE_RENDER 명암, sourceLightingClaim:false |
| lightDirection | [-0.45,-0.65,0.75] | 각축−1..1·Z>0, L=direction/hypot(direction) |
| ambient / contrast | 0.45 / 0.65 | 각0..2. positive flat baseline 필수 |
| minBrightness / maxBrightness | 0.55 / 1.2 | min>0..1, max1..2; 범위는1포함 |
| frontWalls.kind | source-height-derived-south | 원height-derived 렌더면; sourceGeometryClaim:false |
| hillSegments / rampSegments | 128 / 32 | 고정값. inner ellipse south 반원64 후보+ramp south32→최대96 profiles |
| frontWalls.opacity / brightness | 1 / 0.55 | opacity0..1, brightness>0..2. 원soil texture south face에만 적용 |
| frontWalls.probePx | 0.5 | >0..1 world px; ENGINE_RENDER boundary tolerance. native geometry/collider 폭 아님 |
| 안전 JSON | compact UTF-8<=4194304bytes / depth<=64 / visits<=1000000 | plain finite dense JSON, cycle/symbol/accessor/non-enumerable/reserved key 거부. 전체 sourcePreview도 같은4MiB validator 계약 유지 |

| 투영 / 가림 수식 | 구현 값·경계 |
|---|---|
| actor frame bounds | left=cameraX−viewportWidth/2, top=cameraY−viewportHeight/2. x=actorX−left−frameW×anchorX; y=actorY−top−engineFootZ−frameH×anchorY. 현재 전사 authored frame48×48/scale2→96×96·anchor(.5,.85). 원21장/재생24FPS 보존; 새24장 완료 claim0 |
| props depth | 기존 authored depthY에서 mappedZ를 뺀 값으로 정렬, actorDepth=actorY−Z. 뒤장식은 먼저1회, actor1회, 앞장식은 뒤에 유지 |
| local cutaway | foreground && layerRect∩actorFrameRect strict AABB일 때만3 clipped source draw. 외곽opacity1, band.62, 내부.24. callerAlpha×nativeLayerOpacity×각배율. ellipse마다 moveTo로 독립 subpath를 만들고 evenodd clip; 이미지 전체 opacity fade0 |
| 현 절벽 원인 | separate QA6640/3940/Z0의 body world rect[6592,3858.4,96,96]를 authored bottom-center/fullcrop의 native-visual-045 broken_thicket(depth4540)·072 root_bank(depth4820)가 뒤에서 덮음. 원native pivot/opaque mask 미제출을 원source 오류로 확정하지 않음 |
| 결과 범위 | 같은 두 앞장식의 캐릭터 주변만 옅어져 actor가 표시된다. 앞장식은 actor 뒤에 계속 draw하고 ellipse 밖은 원opacity. back/overlap없음은 기존1회. front2개 inner배율.24일 때 actor 기여율(1−.24)²=.5776(불투명층 가정일 때만); native opaque claim0 |
| counts / 복원 | foregroundCutawayObjects:교차 앞장식 수, cutawayDrawCalls:그3회 수, visibleObjects:장식당1. props draw<=255(85×3), ground<=65, source consumer 합<=320(캐릭터/배경 별도). 성공/throw 모두 save/restore와alpha/filter finally 복원 |

| 원height→명암·면 | 구현 수식 / 상한 |
|---|---|
| normal | 기존 mapped height를 world좌표±1px 중앙차분(0..8000 clamp)하여 dx/dy; N=(-dx,-dy,1)/hypot(dx,dy,1). 엔진 렌더 파생이며 native physical normal 아님 |
| flat1 조정 | raw=.45+.65×max(0,dot(N,L)); baseline=.45+.65×Lz; brightness=clamp(raw/baseline,.55,1.2). 평지N=(0,0,1)→정확1로 cache 밖 평지와 직사각형 명암 seam 방지 |
| floor shading | 기존 floor2024 triangles 유지. 각triangle3 vertex brightness 평균→원soil에 Canvas filter brightness 적용. soil 본래.85/.48 filter는 기존대로 소비 |
| hill front | 원inner ellipse rx=18×.84×40/ry=9×.84×40, cx147×40/cy98×40. θ0..π를128기준64 segment; boundary normal 방향±.5px exactheight probe→top/bottom XYZ. ramp>=0 endpoint가 하나라도 있으면hill face skip |
| ramp front | source ramp south y=(98+1.8+(3−1.8)t)×40, x=(125+10t)×40; normal=(-.12,1)/hypot(.12,1). t를32 segment. 높이 차가<=1e−7 또는 top<bottom이면profile 제외 |
| profile 의미 | id/edge hill-inner-south 또는 ramp-south/top2×XYZ/bottom2×XYZ/normalXYZ/depthY=평균(worldY−bottomZ)/depthRole projected-bottom-midpoint/role engine-source-height-derived-render-wall/sourcePhysicalZClaim:false |
| raster 처리 | south profile x폭<=1e−7 또는height<=.25px는 그리지 않음(ENGINE_RENDER subpixel threshold). 원physical boundary·보행 계약을 변경하지 않음 |
| wall UV | 원soil1024 repeat에서worldX와topWorldY origin, faceheight를v길이로 소비. u/v의1024 wrap을분할하여원fullcrop내9args draw. profile당 최대2×2 UV cell×2triangle=8→wall<=768·floor2024와합<=2792 triangles |
| 이번 exact params/64 환산 | 최초 신규 UNIT cache receipt: wall profile80, walltriangle184, total2208, shadedtriangle329, cache1720×944·nominal6494720bytes. 이것은 신규 synthetic height 소비 수치이며 본편 FPS/VRAM 측정 아님 |
| 수명 / snapshot | groundHeightWallProfiles/groundHeightWallTriangles/groundHeightShadedTriangles 추가. 기존 groundHeightCacheBuilds/groundHeightTriangles/ownedHeightCanvases/groundHeightCacheBytes 유지. 동일이미지1build, visibleframe1draw·offscreen0; disposepixels0 |

| 신규 검수 / 증거 | 이번 결과 |
|---|---|
| 순수 / runtime | fdgSourceReadabilityContract.test.mjs 최초4/4 PASS·fail0 + fdgSourceReadabilityRuntime.test.mjs 최초4/4 PASS·fail0 =8신규고유PASS. front/back/actor1/분리 clip/실패복원/flat1/UV한도/cache1/원데이터·authoring저장/owner실frame 검증. oldheight8/soil8/13·5/15·23·16/원PNG/sourcecount/Git봉인 재실행0 |
| actual cliff | v0.15 공개 input6640,3940/Z0에서actor 표시 확인. 공개북쪽10px 시도는 source-cliff-band 차단→XY/Z 유지. save/export/reload도actor 가림보정·같은6640/3940/Z0 유지. blockedReason은저장안하고reload에초기화 |
| actual ramp | v0.15 별도QA5420,3940에서공개서쪽10px×20→5220,3940/원h.5747500000000001/engineZ36.784000000000006(UI.5748/36.78). camera5220/3903.216/followtrue. 새명암/높이면/actor표시 상태를save/export/reload확인 |
| 보존 | 신규입력→실제export에서appearance/작성provenance·heightPreview·nav·imageLayers85·ground/clip·provenance.sourceSnapshot/manifest/sourceRevision/manifestRevision/nativePlacement/원작성metadata 동형. nativeCrop/nativeOrigin/nativeAnchor UNKNOWN·actualObjectColliderCount:null·sourcePhysicalZClaim:false 보존 |
| 첫 artifact 수집 오류 | Downloads 필터 endsWith .fdg.json이번호붙은 .fdg (4)/(5).json을제외하여oldbase선택, 첫appearanceassertFAIL. 신규두파일stat/appearance확인후수집만수정. browser추가export/코드변경/기존suite재검사0. 중첩provenance.sourceSnapshot 경로도명시검사로교정; 오류기록보존 |
| 오류 / 성능 | 신규publicimport/step/save/reload captured error/warn[]; 별도pageerror/network404/실전FPS/GPU/VRAM/Windows 인증 없음. paused render .2~.4ms 및reload16.2/16.8ms는관측표시이며성능합격기준아님 |
| 시각 | actor 완전가림은partial cutaway로해소. 경사 명암/남쪽높이면이같은soil로표시되지만큰장식이경계를덮고64px 높이의가독성은아직약함. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL; 기술PASS를시각PASS로승격0 |
| source missing / 다음 | per-original-prop의검증된native source crop/source origin/draw pivot·depth anchor 및render opaque영역, 실제 _OBJ_META+stage0 collider geometry/instances. 현provenance.nativeCrop/nativeOrigin/nativeAnchor UNKNOWN과 heightPreview.sourceExecutionSnapshot.executionData.objectColliders extraction block를유지. 이source입력없이는본편과같은접지/가림/실충돌PASS불가. 정확evaluator/원자료count/원PNG 재조사0 |
| 증거 | E/engine-stage0-readability-preview: actual-readability-cliff-first/reopen.png·actual-readability-ramp-mid/reopen.png, 실제ramp/cliffexports, actual-readability-ui-proof.json·actual-readability-export-proof.json·actual-export-file-selection-correction.json, 신규first-test2개·API·root/workerpatch와projection·§23 engine-review.md |


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
| 새 깊이 receipt | 772×370 fakeCanvas mid: visiblewalls39·depth3994.25..4190.029676289736·wall90draw; summit37·depth3994.25..4175.406771212186·wall86draw. 두곳 visibleprops3 projecteddepth3980/4260/4820;4260/4820 props는모든visiblewall뒤에그려지므로여전히윤곽을덮을수있다. fakeCanvas는시각PASS/PNGalpha/실가림양증거가아님 |
| 신규 검증 | pure contract 최초4/4 PASS + runtime/adapter/owner 최초4/4 PASS = 신규 고유8/8 PASS·fail0. actual circle3297→3307,7380 east10허용/다음east10차단/north10허용→3307,7370; ellipse1586.5→1596.5,4020 허용/다음east10차단/north10허용→1596.5,4010. 각각 save/export/reload·camera followtrue/Z0 보존. native rotation0만 실제 입력, 회전 ellipse/expanded box는 synthetic UNIT만 |
| 시각·잔여 | preview VISUAL VERDICT RETOUCH / production FAIL. 큰 장식의 native pivot/opaque/depth identity 미확정, 캐릭터 대비 약함. 수동13 전체 추출·렌더85와 연결을 같다고 주장하지 않음. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending을 원 snapshot에 그대로 보존 |
| 상세 SSOT·증거 | [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.16 계약·13수치·새 QA표; E/engine-stage0-collision-preview/engine-review.md(§23), 신규 first-test2개·actual-collision-ui-proof.json·actual-collision-export-proof.json·실제 캡처/exports. 별도 pageerror/404/실전 FPS/GPU/Windows 인증 claim 없음 |


### v0.16 API·저장 계약 상세

| 파일 / API | 입력·출력·제한 |
|---|---|
| source-scene.js validateSourceColliders | (primitives,{jsonValidated:false})→{ok,errors}; 기존 private primitive validator 재사용, 원 물리 함수 body 변경0. 배열0..512·top-level id unique. id1..120/no reserved/control; center XY0..8000; radius/radii/box size 각각0.000001..8000(양 끝 포함); box size는 전체 width/depth, ellipse radii는 반경; yaw−π..π radians 필수(원은 yaw 무관) |
| source-scene.js querySourceColliderCircle | (primitives,x,y,radius,{validated:false})→{ok,blocked,colliderId,reason}. query radius0..19(0은 scene actor 중심검증; 실제 이동1..19). clear reason:null, hit collider:<id>; invalid geometry/query는 ok:false/blocked:true/id:null로 fail-closed. circle·band exception circle의 추가 yaw metadata는 query-local copy에서0으로 무시하고 원 데이터 변경0 |
| source-preview-collision.js createSourcePreviewCollision | ({sourceExecutionData,scope})→{ok,errors,pending,collisionPreview}; nonempty completionId/control 및 executionData.objectColliders 실제 canonical 배열/objectColliderCount 정수0..512==length. baseRef fetch/eval0. raw producer schema 직접 소비0; 정규화 adapter를 먼저 사용 |
| validateSourcePreviewCollision | (contract,{jsonValidated:false})→{ok,errors,pending}; sourceExecutionSnapshot 전체·colliders 배열 exact 동형, source count 및 engineDerived exact 검사. version1/kind native-object-collision-subset/fullObjectColliderCount:null/sourcePhysicalZClaim:false 필수 |
| querySourcePreviewCollision | (contract,x,y,radius,{validated:false}); source world XY 질의. projected Y/worldY−Z·screen XY로 collider 중심을 옮기지 않음. validated fast path는 이미 검증된 owner scene만 사용 |
| source-preview.js attachSourcePreviewCollision | (existingScene,{sourceExecutionData,scope})→{ok,errors,pending,sourcePreview}; 정확 heightPreview 명시 필수. 기존 85 visuals/nav/ground/clip/height/appearance를 유지하고 collisionPreview/provenance만 별도 clone·검증·동결. actor 중심이 subset 내부이면 거부 |
| normalizeMapSourceHandColliders | safe inspectMapSourceJSON(4MiB)을 먼저 거쳐 actual source object/count 및 v6 transform/units literal을 검증. rawTile 양축 정수0..199/scale>0, onFloor:true/effective center 일치 필수. 원 row에 이미 반영된 scale은 nativeScale metadata에만 보존. source circle/ellipse만 변환; canonical helper 제한도 검증한 뒤 ok. id=native-hand-<array index>-<type>는 engine namespace이며 visual85 id 관계를 만들지 않음 |
| normalized envelope | kind engine-normalized-native-hand-colliders; producer completionId/control 보존; nativeExecutionSnapshot에 v6 전체 원문 JSON·metaExtraction/transform/colliderTransform/pending/unknown 기록 보존. normalizationBinding=MAP_HAND_COLLIDER_BINDING version1/native-isW-radii. executionData.objectColliders는 engine 변환 결과이며 raw producer 제출 자체가 canonical이었다고 주장하지 않음 |
| MAP_HAND_COLLIDER_BINDING | source game.html _rebuildColObjs/isW, tileSizePx40, onFloor center=(rawTile+.5)×40; colSz=radius/colW,H=radii(÷2 없음); centerY=effectiveY+colOy(offset scale 없음); handProps rotation0/native isW ellipse rot미소비. nativePointPolicy strict < point query와 previewFootPolicy 전체 발 원/EPS 접촉/sweep를 별도 저장 |
| snapshot / 수명 | collisionCoverage PARTIAL, supportedSourceObjectColliderCount, collisionScope clone, fullObjectColliderCount:null, sourcePending=[collision-assembly]. replacement/dispose는 scene/collision refs와 기존 owner cache를 해제; 새 collision consumer 자체 ownedRaf/listeners/timers/images/Gpu 모두0 |
| ellipse-band | 0<=innerRatio<outerRatio<=2/outer>=.000001, exceptions<=32(circle/box/ellipse); nested band 불가. full foot가 exception에 전부 들어가야 통과. canonical expanded rotated parts/ellipse-band는 new UNIT 지원, 실제 v6에는11circle+2ellipse이며 rotated part/band 제출 없음 |
| 안전·누락 | compact UTF-8<=4194304bytes/depth64/visits1000000; finite/plain/dense JSON만, accessor/nonenumerable/symbol/cycle/reserved/nonfinite/sparse 거부. unknown/BLOCKED/count누락→SOURCE_INPUT pending·candidate null; unsupported raw/canonical geometry→ENGINE_IMPLEMENTATION pending; off-floor snap과 전체 generated MAP_OBJS는 UNKNOWN 유지. explicit0+[]만 허용하며 UNKNOWN→0/[] 변환0 |

### v6 원본 수동 collider 13개와 정규화 수치

모두 producer onFloor:true, effectiveWorld=(rawTile+.5)×40, rotation0이다. 다음 반경은 v6에서 scale이 적용된 world px이며 엔진에서 재배율하거나 절반으로 바꾸지 않는다. producer handProps36과 visual85를 이 표의13과 합치지 않는다.

| index / id suffix | 원본 type / 이름 | rawTile | world center XY | source scale | canonical kind | radius / radii XY | colOy / yaw |
|---|---|---|---|---|---|---|---|
| 0-m_ctree13 | m_ctree13 / 원본 저주나무13 | 84,184 | 3380,7380 | .85 | circle | 51 | — / 원 yaw무관 |
| 1-m_ctree14 | m_ctree14 / 원본 저주나무14 | 80,150 | 3220,6020 | 1.1 | circle | 66 | — / 원 yaw무관 |
| 2-m_ctree15 | m_ctree15 / 원본 저주나무15 | 30,96 | 1220,3860 | .95 | circle | 57 | — / 원 yaw무관 |
| 3-m_ctree16 | m_ctree16 / 원본 저주나무16 | 80,36 | 3220,1460 | 1.15 | circle | 69 | — / 원 yaw무관 |
| 4-m_ctree17 | m_ctree17 / 원본 저주나무17 | 124,31 | 4980,1260 | .9 | circle | 54 | — / 원 yaw무관 |
| 5-m_ctree18 | m_ctree18 / 원본 저주나무18 | 176,96 | 7060,3860 | 1.12 | circle | 67.2 | — / 원 yaw무관 |
| 6-m_ctree19 | m_ctree19 / 원본 저주나무19 | 124,149 | 4980,5980 | .88 | circle | 140.8 | — / 원 yaw무관 |
| 7-m_ctree20 | m_ctree20 / 원본 저주나무20 | 124,179 | 4980,7180 | 1.08 | circle | 172.8 | — / 원 yaw무관 |
| 8-m_c1tree | m_c1tree / 시체나무 | 102,90 | 4100,3620 | 1 | ellipse | 380,230 | 0 / 0rad |
| 9-m_c1cocoon | m_c1cocoon / 고치 | 47,50 | 1900,2020 | 1.55 | circle | 124 | — / 원 yaw무관 |
| 10-m_c1camp | m_c1camp / 야영지 | 45,100 | 1820,4020 | 1.55 | ellipse | 201.5,124 | 0 / 0rad |
| 11-m_c1altar | m_c1altar / 제단 | 147,97 | 5900,3900 | 1.45 | circle | 137.75 | — / 원 yaw무관 |
| 12-m_c1pool | m_c1pool / 웅덩이 | 167,43 | 6700,1740 | 1.55 | circle | 131.75 | — / 원 yaw무관 |

### 이번 actual QA와 미인수 범위

| 구분 | 이번 결과·증거 |
|---|---|
| raw v6 최초 의미 판정 | 첫 제출 row는 canonical id/kind/center/radius가 없어 consumer ENGINE_IMPLEMENTATION pending이었다. 새 read-only _rebuildColObjs/isW 코드 의미 확인으로 radius/offset binding을 확보한 뒤 root adapter가 변환. 원 producer 파일 수정/실행0·native numeric 임의 보충0 |
| 최초 preparation 오류 | QA actor 위치를 바꾸고 기존 runtime heightObservation을 남겨 validate FAIL. input파일0개 상태에서 별도 QA scene의 오래된 runtime observation만 제거; owner가 새 위치를 resample. 실패기록 actual-preparation-first-failure.json 유지; source/height/START/nav 변경0 |
| circle 실제 | 별도 ENGINE_AUTHORED QA3297,7380에서 공개east10→3307,7380 허용; 다음east10은 collider:native-hand-0-m_ctree13 차단/XY·Z0유지. 공개north10→3307,7370 허용. save/export/reload에 camera3307,7370/followtrue·subset13/PARTIAL 유지 |
| ellipse 실제 | 별도 QA1586.5,4020에서 공개east10→1596.5,4020 허용; 다음east10은 collider:native-hand-10-m_c1camp 차단/XY·Z0유지. 공개north10→1596.5,4010 허용. save/export/reload에 camera1596.5,4010/followtrue·subset13/PARTIAL 유지. scaled native radii201.5/124를 사용 |
| source/asset 보존 | 신규 input→actual exports에서 collisionPreview/source envelope/raw v6·scope/heightPreview/appearance/nav/image85/ground/clip/sourceSnapshot/manifest/revisions/nativePlacements 동형. actualObjectColliderCount:null/nativeAnchor,Crop,Origin UNKNOWN/physicalZfalse/productionAdoptedfalse 유지. native hand↔visual85 identity mapping UNKNOWN |
| 회전·scale 범위 | native v6 회전0만 제출. raw row scale .85..1.55 및 해당 scaled radii를 정상 소비. rotated ellipse/box 및 nonzero colOy·scale 재곱셈 방지는 새 synthetic UNIT 검증에 한정; 실제 회전 prop/combat/START 테스트라고 보고하지 않음 |
| console·성능 | 이번 UI captured warn/error[]; independent pageerror/network404 probe 미실행. paused render 표시 .2~.5ms는 성능 인증 아님. GPU·새 asset·실전FPS·Windows 인증0 |
| 실제 시각 | 실제 두 캡처에서 캐릭터 표시·partial scope 안내 확인. 원 hand collider와85visual의 native pivot/depth/identity가 미확정이라 접촉한 위치와 art 실루엣의 정확 일치 미인수; 나무·장식에 비해 캐릭터 대비 약함. preview RETOUCH / production FAIL |
| START / full scope | source START·exit 및 main game/save/LOCK/nav/geometry 수정0. sourceStart/engine startAuthority 그대로. 이번 두 좌표는 별도 QA이며 START 실제 보행·35areas/full stage0 object assembly·production 연결 PASS 아님 |
| 신규8 PASS | contractfirst4 PASS·runtime/adapter/ownerfirst4 PASS. 완료 v15/height/soil/source/PNG/Git proof 재실행0. 캡처 actual-collision-circle-blocked/reopen.png 및 actual-collision-ellipse-blocked/reopen.png, actual UI/export proof·실제 .fdg.json2개·normalization/native input receipts·root/worker isolated patch·§23 engine-review.md |

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

### 실제 버튼 입력의 연속 경로

| 구간 | 실제 위치 / 누적 버튼 입력 / 높이 |
|---|---|
| 정상 시작 | 4020,7420 / 0 / logical0·Z0 |
| 남쪽→경사로 접근 | 북348회→4020,3940 / 348 / Z0 |
| 경사로 진입 | 동97회→4990,3940 / 445 / Z0 |
| 경사로 중간 | 동23회→5220,3940 / 468 / logical0.5748·Z36.78 |
| 경사로 정상 | 동20회→5420,3940 / 488 / logical1·Z64 |
| 본선 복귀 | 서140회→4020,3940 / 628 / Z0 |
| 중앙 나무 차단 | 북8회→4020,3860 / 636; 다음 북1회 목표4020,3850 차단 / 637 / native-hand-8-m_c1tree·Z0 |
| 실제 서쪽 우회 | 서16/북4/서8/북4/서4/북4/서4/북60/동4/북40/동4/북16/동4/북56/동16/북48/동4/북124(각10px), 시작4020,3860→4020,300. 주요3700,3740(681)→3980,2020(881)→4020,1540(933)→4020,300(1057) |
| 종주 총량 | 시도1057·허용1056·차단1·실이동10560px·START→EXIT 중심 직선거리7120px. 경사로 왕복/나무 우회 포함 |
| 저장 관측 | exported provenance.heightRuntimeObservation.worldPx=[4020,300]/logicalHeight0/engineFootZ0/ramp−1/bandBlocksfalse/sourcePhysicalZClaim:false·camera4020,300/followtrue |
| 파일 수집 | 새 Downloads/fdg-stage0-unadopted-preview.fdg (8).json,1145142bytes. actual-route-exit-export.fdg.json에 복사. 입력 대비 actorXY/camera/새 runtime 높이 관측을 제외한45개 source/provenance 필드 동형 |
| 증거 집계 보정 | 실제1057행 trace가 정본이다. UI milestone 부가 buttons 필드에 남은200을 trace의 해당 위치 순서로 보정했으며 원문 actual-route-ui-proof.before-counter-correction.json을 보존했다. 실제 입력·좌표·스크린샷 변경0 |
| lifecycle 한계 | tools/fdg-studio/studio.js refreshRuntime→setProject, pagehide nonpersisted→runtime.dispose; engine/fdg/runtime.js _applyProject→previous _sourcePreview.dispose. 공개 실제 export 재입력/페이지reload 후 scene위치·scope·clock0 확인. private disposed counter/누수 직접 관측이나1-2 장면 전환 PASS 아님 |
| 실제 시각 | 새 START/ramp/EXIT 캡처를 직접 확인했다. 캐릭터는 보이지만 어두운 바닥에서 대비 약함, 큰 나무/장식·지형 경계와 원충돌 실루엣의 native identity 미인수. preview RETOUCH / production FAIL. 버튼 제작 보행 PASS를 전투·모델 품질·full collision PASS로 합산하지 않는다 |

## v0.16.1 완료 이력(동결) · 실제 Play 입력과 v7 추가 충돌 (2026-10-11)

같은 승인 CH1-1 원본 제작 미리보기에 공개 연속 방향 입력과 MAP v7 변경분만 연결했다. 이전 v0.16 AUTHORING START→EXIT1057회·collision 최초8검사·v0.12~v0.15 증거는 동결하여 재실행·재집계0이다. 이번 연속 보행 증거는 paused10px 제작 이동과 별개다.

| id / 적용 위치 | 코드 계약 / 실제 관측 / 인수 범위 |
|---|---|
| FDGRuntime.setMoveInput / moveInputDirection | setMoveInput(direction)는 문자열 west/north/south/east 또는 null만 소비. null은 clearInput, 방향은 inputEnabled+running에서만 허용하고 keyboard Set을 비운다. getter moveInputDirection은 현재 방향 또는 null. 실제 actor 위치를 즉시 바꾸지 않고 기존 owner _update(dt)의60Hz tick에서 속도156px/s로 이동. 별도 입력 timer/RAF0. 기존 keyboard WASD/방향키와 대각 정규화 유지 |
| 입력 해제 / 수명 | 같은 방향 다시 클릭·이동 해제·유효 keyboard 이동keydown·canvas/window blur·document hidden·입력disable·pause/stop/dispose는 held UI 방향을 해제한다. UI 방향keydown 전환에서는 keyboard가 이어받는다. focusin이 이동 제어영역/캔버스 밖으로 나가면 clearInput. setProject는 _applyProject 뒤 pause하여 기존RAF 취소·입력/accumulator 해제 후 asset load; 교체 후 clock0/paused. step은 해제된 입력 상태의1/60초 |
| 공개 UI / DOM | source-play-controls role group 내 source-play-west/north/south/east는 aria-pressed native button, source-input-stop은 이동 해제. running 준비된 sourcePreview에서만 방향 활성. source-input-state leaf role=status에 현재 방향/해제/일시정지 표시. source-delta-import+source-delta-file은 공개 파일선택. 4방향click+해제click+document focusin+delta open+filechange=신규 UI handler8개; 부모 컨테이너 textContent 교체0 |
| v7 추가 자료 / API | map-source-adapter.js applyMapSourceHandColliderDelta(previewProject,{delta,scope}) → ok/errors/pending/candidateProject/sourcePreview/project:null/world:null/adoption:UNADOPTED/inspection. 실행 중·4MiB 초과파일·프로젝트 변경race·중복delta·비canonical baseline·invalid data/scope는 설치 거부. 새 후보만 store.replace하며 현재 actor/camera를 capture해서 유지. 상세 계약은 FDG_HAND_COLLIDER_DELTA_V7.md |
| v6 원본 / v7 / 작성권위 | collision sourceExecutionSnapshot.nativeExecutionSnapshot은 기존 raw v6, nativeDeltaSnapshot은 전체 raw v7, baseSourceExecutionSnapshot은 기존 normalized13을 각각 보존. ENGINE_AUTHORING scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32를 별도 보존. 원본 raw13 prefix 불변; corpse2 metadata collision:false로 제외·pit_poison1만 추가. 현재metaMissing0, v6 raw의 과거missing3 기록은 유지 |
| pit_poison / 충돌 수 | **P3-001 현행 계약(2026-10-20):** 원본 game.html:18166 배치·18407 metadata의 `colW80/colH58/colOy7` → native-hand-13-pit_poison ellipse, tile[162,139]/baseWorld[6500,5580], collider center[6500,5587]/radii[80,58]px/yaw0. 기존13(11circle+2ellipse)+새1ellipse=수동14(11circle+3ellipse), scale 재곱0·반경÷2 변환0. supportedSourceObjectColliderCount14/collisionCoverage PARTIAL, actualObjectColliderCount:null/fullObjectColliderCount:null·visual85 identity UNKNOWN은 유지. 이 절의 2026-10-11 Play·원형 충돌·PASS 기록은 당시 이력이며 새 타원 검증으로 재집계하지 않는다. 최신 재추출·Godot/화면 검수의 실제 상태는 [P3-001 보고서](orders/reports/P3-001_REPORT.md)를 따른다 |
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


### v0.17 schema와 합성 API 정본

| 이름 / 적용 위치 | 구현 계약 |
|---|---|
| SOURCE_PREVIEW_TERRAIN_CUTAWAY_DEFAULTS | source-preview-appearance.js의 frozen 명시 initializer. kind projected-height-region / authority ENGINE_AUTHORING / foregroundOpacity0.1 / featherPx24 / depthPolicy after-region-max-projected-depth / sourcePhysicalZClaim false. authoredBy는 초기값 없음, 작성자가 명시 |
| validateSourcePreviewAppearance | terrainCutaway own-property가 있는 경우 plain object 및 모든 위 필수값을 검사. opacity≥0≤1, feather>0≤64 finite, authoredBy trim 비공백, false claim strict. createSourcePreviewAppearance는 기존 strict clone만 수행 |
| SourcePreviewHeightGround._buildTerrainMask(owner) | 기존 floor sample / frontWall profile / projected source polygon만 사용. coverage union을 white hard scratch에 clip/fill하고 image-free getImageData1회. mask에 blur draw→destination-in hard draw2회. 원PNG readback·새PNG 저장0 |
| _terrainClipRects / _terrainClipPath / _terrainOutsidePaths | alpha>0 hard raster row-run의 비중첩 사각형 union. 인접 동일span 세로병합. browser Path2D1 및 앞prop별 complement Path2D를 캐시; 다른 환경 beginPath+rect fallback. outline은 렌더 pixel clip이며 원native geometry/nav/collider로 저장하지 않음 |
| _clipTerrainLayer(context,entry,outside) | local cache origin 좌표. outside complement는 image AABB를2px 확장해 원본 edge의 재clip을 피함; unionrect와 evenodd. inside union nonzero. hard alpha 경계는 기존 Canvas AA와 동일 의미이며 화면 pixel QA는 경계16px를 제외 |
| prepareExposedLayer(entry,image,owner) | strict projected-depth guard와 projected-image-vs-height-bounds 빠른 제외. scratch source PNG9args/color1회→destination-out cached mask, alpha1−opacity. finally alpha/filter/composite/transform/clip 복원. 필드 absent/opacity1/뒤쪽/동일깊이/cull은 false |
| drawExposedLayer(context,owner,entry,image,left,top) | 원본 direct exterior draw + scratch interior draw=2. 두 save/translate/clip/finally restore. 기존 layer.alpha/actorCutaway.alpha는 main context에서 동일 적용·scratch 색2중 filter 없음 |
| 실제 입력 보존 | 기존 ENGINE_AUTHORING soil binding opacity0.85/brightness0.48, actorCutaway0.14/0.46/feather14, terrainLighting[-0.45,-0.65,0.75]/0.45/0.82/0.50/1.2, frontWalls128/32/opacity1/brightness0.55/probe0.5. 새 terrainCutaway0.1/24만 명시 추가·heightMapping64/0 및 원본 source authority 유지 |
| scene snapshot / project validation | attachSourcePreviewAppearance가 동일 full authored input을 provenance.appearanceEngineAuthoredInputSnapshot에 보관·동결. new field를project strict validation/save/reopen에서도 소비. sourceExecutionSnapshot/unknownmetadata/native count/geometry 해석 변경0 |
| operation-level fake receipt | 별도772×370 mid/summit에서 qualifying native-visual-025(depth4260), native-visual-072(depth4820)2개, terrain main12/scratch4/actor ellipseobjects2/actor1. fake는 시각 판정하지 않음 |
| 실제 screenshot readback | source mask 캐시의 한 번 CPU readback은 hard color mask이며 source PNG sample/opaque identity를 추정하지 않음. outside screenshot RGBA 비교는새 CUAPNG2만, native sourcePNG 파일·oldR2receipt·기존 suite 소비0 |
| 최종 한계 | 이 노출 규칙은 ENGINE_AUTHORING 시각 도구. 지형 이동은 기존 exact normalized evaluator→engine64/0. native 물리 height/pivot/UV 주장은 false/UNKNOWN. mask 생성과 CPU readback을 포함한 first-frame cold UI39.90ms는1회 관측이며 FPS/성능PASS로 해석하지 않음 |


| 신규 회귀 재현 | explicit Node22.23.2 --test test/fdg-terrain-exposure.test.mjs. FDG_TERRAIN_EXPOSURE_QA는 명시 own QA JSON 경로(없으면skip), FDG_TERRAIN_TEST_CANVAS_MODULE은 설치된 @napi-rs/canvas 경로(없으면procedural1 skip). 이번 실제 실행 skip0. 원assetPNG 파일 읽기0 |
| 신규 procedural 결과 | DPR2 /8px checker / 경계16CSSpx 바깥121,622 pixels changed0/maxRGBA0, inside933,707 changed, native test backend cliprect553. assert 허용delta≤2이나 이번 관측0. browser측정·native opaque alpha·시각PASS로 승격하지 않음 |
