## 2026-10-14 원본 OBJ metadata 현재owner 반영

| 현재 범위 | 코드·최초 검증 |
|---|---|
| originalsameWorld metadata | 원초기77→CHDECO250in-place merges/기존31sameDict/현재296key. RHS28원JSfalsy·optionalfield조건보존/knownundefined4226은present키+null+declaredUndefinedmask/untouchedabsent와분리. |
| 원current후처리쓰기 | 실제edge4현재Canvas교체뒤samecurrentMeta _edgeErasednumeric1작성/원Metaamount유지/metadatawritegap4해소. CSS5실처리미완 _filterBakedwrite0/strictfullOBJ·WaitStageNR/sourceG.onfalse. |
| API·수명 | get_source_object_meta_publication()0arg / get_native_source_object_meta(key,field="")2arg(currentref/present/mask) / signal native_source_object_meta_changed(key,meta,phase). INITIALIZED77+MERGED250+CALLBACK_WRITE4=331events/epoch·ref·lifetime/신호재진입취소guard/namespacewithdraw. |
| 새검수 | actualMain1 FIRST13/13 PASS7.985673초/ERROR0/CameraWarning1/product수리0. 기존OBJ14/extra23+2/원성공군·PNG자료재검수재연0/신규helper·testleaf·assetcopyhashimport0. |

정확API·28필드·296/4226값·원JSmerge/필터미완·nullmask외부쓰기한계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ metadata 실제 현재 소유·후처리 쓰기」를 따른다. 이전meta원writer4미연결은당시이력이다. MAP PRODUCTION REPORT: currentmetadata+flagwriteronly,geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.**

# CH1-1 source-scene · 원형 검사 / 실행 입력 계약

> 현행 검수(2026-10-11): v0.17은 명시 ENGINE_AUTHORING terrainCutaway로 실제 투영된 높이 지형 안쪽의 전경만 노출한다. 별도 QA 입구→경사→정상420px, Z0→34.398→64, 저장/reload를 확인했다. 수정 후 경계16px 이상 바깥30,358픽셀은 RGBA 차이0이다. 이번 높이 지형 노출 범위 VISUAL PASS / 전체 production FAIL·UNADOPTED. 마지막 v0.17 표가 현행이며 이전1057/Play8/R1/R2/v0.16.2 검수는 동결·재실행0이다.

2026-10-11. stage0의 실제 MAP source bundle을 읽어 polygon/nav/단위/리소스 출처를 Studio에서 검토한다. sourceScene 물리 실행과 실제 World 연결은 대기다. 독립 UNADOPTED sourcePreview는 원본props9+soil1/배치85/nav·source-v4 exact logical-height/절벽·ENGINE_AUTHORING64/0와 v0.16 native 수동 충돌 subset13/PARTIAL을 소비한다. 정상 DESIGN START4020,7420→경사로/Z64→native 나무 차단/우회→EXIT근처4020,300→저장/재열기/공개 장면 교체를10px 버튼1057회/실이동10560px로 확인했다. full object collider count:null, native UV/anchor/crop/physical Z·visual identity UNKNOWN·preview RETOUCH/production FAIL이다. 연속 Play 보행·보스 관문·1-2 연결은 미인수이며 앞선 검수는 동결 이력이다.

## 파일 / 수명 / 현재 지원

| 파일 / 입력 | 책임과 경계 |
|---|---|
| `engine/fdg/map-source-adapter.js` | `inspectMapSourceJSON(input,{label,maxBytes})`·`validateMapSourceOutput(project,world)`·`adaptMapSourceScene(source,manifest,{previewProject,engineAuthored,sourceRevision,manifestRevision})`: source JSON/header/native/bounds/nav RLE/START 수식/참조 검사·full unknown JSON 보존·mapping/inspection/pending. project/world:null, 필수 실행자료와 명시 engineAuthored가 모두 검증되면 candidateProject만 준비 |
| `engine/fdg/source-image-layers.js` | 정규화된 승인 이미지의 경로/crop/worldRect/opacity 검사·required decoded-ready gate·topdown CSS draw. v0.10 source-scene-runtime/FDGRuntime에 hook. 실제 source 이미지 계약 미제출은 별도 pending |
| `engine/fdg/source-preview.js`·`source-preview-height.js` | attachSourcePreviewHeight로 v4 full envelope와 명시 heightMapping/movement 분리저장. sampleSourcePreviewHeight는 exact worldPx/T40 논리값·별도engineFootZ·파생slope·native pointband 반환. canMove에 원 polygon 발 support+보수 원형cliff/sweep gate 추가 |
| `tools/fdg-studio/source-scene-panel.js` | 지역 전환 탭 「1-1 소스 검토」→source/manifest 각각 파일 또는 공개 JSON 입력→원본 검토. source nav 그림은 실행 Canvas와 별도이고 polygon-only 표시 |
| UI 수명 | 고정 DOM listener12, RAF/ResizeObserver/자체 timer0. 파일 비동기 generation/disposed 가드, 종료 시 listener·입력문자열·inspection·callback 정리. 검토는 owner.pause 후 시행 |
| 입력 크기 | source / manifest 각각 raw UTF-8 및 compact JSON 8,388,608bytes(8MiB). 미래 내장 FDG4,194,304bytes·World8,388,608bytes 한도 유지. validateMapSourceOutput은 canonical project/world validator와 World 내부 각 scene의4MiB 제한도 검사 |
| 실행 제어 | dialog 열 때 pause·Play/step/owner input 차단. 실행 중/World busy 때 열기 버튼 비활성. 닫으면 기존 UI 상태로 복귀 |
| cache URL | HTML entry studio.js?v=0.14.1. Studio 내부source panel/adapter/project/runtime/preview/preview-runtime 및 새height/height-ground `?v=0.14.0`. 별도height program `?v=0.11.0`, CSS/physical sourceScene consumer `?v=0.10.0` 유지. WorldPanel/map-view `?v=0.8.3`, World core `?v=0.8.2` 유지 |

source는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/MAP/ch1-1.source-scene.json`, resource manifest는 같은 폴더 `ch1-1.source-resources.manifest.json`이다. 실제 소비 snapshot은 E=`…/engine-stage0-scene`의 `consumed-` 두 JSON으로 봉인한다. 원 R JS/PNG·nav·LOCK·game/save는 수정/자동 열기/복제0. source native contract의 stage0만 검토하며 stage1 T40/arrival/보스/edge/WP 권한으로 확대하지 않는다.

## 원 source 필드 → 실제 FDG 입력

| source 필드 | 원값·단위 | FDG 대응 / 현재 판정 |
|---|---|---|
| nativeContract | CH1_1_PRODUCTION / 20260916-finish-1 / stage0 / size200×200 / tileSize40 | 정확 source 계약 검사. 제품 stageId를 FDG areaKey로 자동 승격0 |
| bounds | grid200×200·tileSizePx40·world8000×8000·chunk1024 | geometryHash는64자리hex 형식만 검사하며 원파일hash 재계산0. map 크기/T 계약 대응. 현 terrainScene primitive bounds≤1600에 8000을 그대로 넣거나 fixture를 생성0 |
| boundaryPolygon.data | tile index53점 | unknown/provenance 그대로 보존·검토 Canvas에 동일 XY 비율로 표시. 새 geometry 생성/원shape 변경0 |
| nav.data | row-major(value,count) RLE399쌍·40000셀·1=polygon 내부/0=외부·바닥19438 | 그대로 decode한 inspection.tiles에1=바닥 의미 유지. **polygon-only**이며 원 mergedRuntimeCollision을 대체하지 않음 |
| collision.objectColliders | 이전 count85는 native-v2에서 VISUAL placement85로 정정 | 실제 collider는 MAP_OBJS/_OBJ_META source export 대기. visual 개수를 collider에 강제하지 않음 |
| collision.altarCliffBand / v4 boundaryColliders.hillCliffBand | .84≤d≤1.04 && ramp<0 isW | v4 exact 타원/ramp point predicate를 선택 heightPreview에 소비. 원nav 병합/정적 collider배열 생성0. 엔진 보수 원형발 gate와 원pointband 구별 |
| start | raw100/185→center100.5/185.5→world4020/7420 | center=raw+.5, world=center×40 검토. native runtime START 심볼 UNKNOWN 보존. v0.11은 승인된 설계 START를 ENGINE_AUTHORING으로 받아 독립 FDG에 적용 가능 |
| gateExit | bossCx100·gateY5/value3·exitY7/value2·clear x88..112/y2..35/value0 | source metadata 보존. nav의0/1과 본편 tile0/2/3 의미를 섞거나 clear/gate/exit를 자동 floor로 바꾸지 않음 |
| logicalHeight / v4 executionData.logicalHeight | logical0..1·hill147/98·r18/9·west ramp125→135·strict exactEvaluator3/nativeParams11 | 원식을 tx=worldX/40,ty=worldY/40 연속값으로 정확 소비·source-v4 full snapshot 보존. sample tile label은셀인덱스/px는center. 엔진환산64/0·파생slope는 별도작성, 원physical Z 주장0 |
| areas.data | source anchor8구역 | local inspection/provenance만. 실행 지역8개 자동 등록0 |
| sourceAssets.items | 승인 absolute path9건 | 원본 출처 문자열 보존. native origin/anchor/crop UNKNOWN 보존. v0.13 exact props9 URL에서 첫runtime decode 치수관측·명시previewLayout→실제 preload/draw. sourcePhysicalLayoutClaim=false |
| groundMaterials.items | maskSVG·soil·litter·commonSkin 경로, collisionChanges=false 설정 | 존재 경로4를 보존. false인 collisionChanges는 이미지 파일로 취급하지 않음. soil1만 exact URL/실제1024² decode/명시 ENGINE_AUTHORING repeat/원53corner clip 소비; mask/litter/commonSkin3 PENDING·native UV UNKNOWN, mask/합성 추측0 |
| groundTile.value | 1024/1024 | source ground tile 메타. 원 PNG 크기/crop/worldRect와 같은 값이라고 단정0 |
| placements | native-v2 byFile 실제85개 x/y(tile index),scale,opacity,brightness,saturation | VISUAL 원값만 보존. native crop/worldRect/anchor UNKNOWN; v0.13 실제decode치수와 ENGINE_AUTHORING bottom-center로 generated85 별도기록. collider로승격0 |

## adapter 결과 / 보존

| 결과 필드 | 계약 |
|---|---|
| ok/errors/pending | errors:string[]·pending:{field,reason,classification}[]로 검사 오류와 권위 미확정을 분리. 누락/미지원 형식은 source-format-pending. 현재 유효 source도 필수 pending 때문에 ok:false·errors:[]·project/world:null |
| mapping | `{sourceField,fdgField,value,status}` scalar 요약. nav40000셀을 각 row에 중복복제하지 않음 |
| inspection | stage:0·gridSize/tileSize·boundary·tiles·start/gateExit·navScope:polygon-only·polygonWalkableTiles:19438·resources13개 `{role,path,exists,placementReady:false}`·sourceSnapshot/manifestSnapshot·선택 previewResources. 독립 clone 전체를 deep-freeze하며 unknown JSON 보존 |
| previewResources | 기존 승인 characters/skills/vfx/preview만. characters/skills/vfx 각1..128개·고유ID·preview 및 skill→VFX 참조 검사, 네 그룹 전체4MiB. 기존 map/rig/terrain을 새 source 장면에 자동 재사용0 |
| safe JSON | plain JSON만, reserved key(__proto__/prototype/constructor)·accessor/symbol·cycle·sparse·nonfinite·non-enumerable·undefined·함수·비평범 객체 거부. depth64·검사항목 상한1,000,000 |
| 설치 | 물리 sourceScene 검증candidate 또는 별도 명시9bindings/previewLayout의 sourcePreview 후보만 공개연결. observe9/prepare/decode 후 owner설치·실패기존보존. sourceRef자동로드0 |

## 준비 이미지 consumer: source와 구분한 내부 FDG 계약

| 필드 / API | 값·공식 / 적용 위치 |
|---|---|
| layers | 0..128. 각 `{id,src,sourceRect,worldRect,opacity}`. source bundle에 이런 값이 있다고 주장하지 않음 |
| id | 1..120자·제어문자/예약키 제외·배열 내 고유 |
| src | 기존 isLocalAsset. exact 서버 루트 상대 png/jpg/jpeg/webp, `..`·URL·query·fragment·encoding/backslash 금지. absolute R path 자동 변환0 |
| sourceRect | `[x,y,width,height]`, finite·x/y≥0·w/h>0. decoded natural dimensions 안에 crop 전체가 들어와야 함 |
| worldRect | 같은 tuple, finite·x/y≥0·w/h>0·우/하≤8192. 이8192는 승인 baked padding을 받을 수 있는 내부 상한이며 물리 world8000을 바꾸지 않음 |
| opacity | 필수 finite0..1. draw alpha=callerAlpha×opacity |
| collectSourceImagePaths | 승인된 경로 Set만 반환. loader/server/source data를 소유·수정하지 않음 |
| validateReadySourceImages | assetsMap record.status=ready·image naturalWidth/Height>0·crop inside 전부 검사. load Promise resolve를 decode 성공으로 세지 않음 |
| drawSourceImageLayers | owner.assets Map·camera x/y·CSSwidth/height. left=camX−W/2/top=camY−H/2, destination=worldRectXY−left/top. source crop 9args drawImage·viewport clip/cull, context/alpha finally 복원 |
| 반환 / hotpath | drawCalls/drawn/missing 숫자. viewport 밖/opacity0 skip, visible invalid image는missing. layersValidated:true일 때 전체 layer 검증 반복0 |
| 수명 | 자체 image 생성/RAF/listener/timer/lease/스트리밍0. 원 height/nav 해석과 primitive CPU raster 합성은 소유하지 않음 |
| 인수 한계 | 이전helper8PASS기록유지, v0.10sourceScene runtimehook구현. 실원본crop/worldRect·resource연결미제출로 실제CH1 decode/draw 인수0 |

## 최소 후속 source 입력

원 source owner의 실제 object collider/인스턴스·경계 예외 입력은 여전히 대기다. v4 exact normalized evaluator·hill cliff predicate/출처는 제출되어 선택 sourcePreview.heightPreview에서 소비한다. native START/crop/origin/anchor/ground UV UNKNOWN을 보존하고, 설계 START·이미지배치·heightMapping은 별도 ENGINE_AUTHORING으로 지정한다. 디코드한 이미지 치수는 runtime 관측이며 native 배치 권위가 아니다. scale/offset·파생slope/발정책·camera/settings는 엔진작성값이며 원 game physical값이라고 주장하지 않는다. 원본 복제·proxy/server 우회0. 물리sourceScene 계약은 [FDG_SOURCE_SCENE_EXECUTION](FDG_SOURCE_SCENE_EXECUTION.md), 현행 시각/높이 preview는 [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)을 따른다.

§23 MAP PRODUCTION REPORT와 새 실제 UI/원형 보존/own checkpoint 증거는 E/engine-review.md에 기록한다. nav 검토 그림 PASS를 실제 완성 환경 visual PASS로 바꾸지 않는다.

## v0.9 당시 단위 최초 검수와 실제 UI

| 검사 | 실제 결과 / 증거 |
|---|---|
| 신규 Node | adapter8/8 + image helper8/8 = **16/16 PASS**, 각각 최초1회. 기존 suite 재실행0 |
| 봉인 실물 | source13,059bytes·manifest7,461bytes, source-inputs.json에 SHA256 기록. errors0·필수pending7·ok:false·project/world:null; preview 미제공 preflight에만 별도pending1 추가 |
| 공개 UI 입력 | 봉인 두 JSON을 공개 textarea에서 검토, 원문 문자열 동일·경계53점/nav40000/바닥19438·경로13건·한국어필수대기7 확인 |
| 실패 / 상태 | malformed JSON 실패에서 결과/검토nav 삭제·sceneReady:false. 성공/실패 후 기존 region 선택·gate·인스펙터 표시값 동일; 저장/actor 변경0 |
| 실행 제어 | dialog 안 Play/step 비활성, 닫으면 활성 복원. 실CH1 play/접지/충돌/camera/승인이미지draw/save-reopen 인수0 |
| 좁은 창 | 685×677에서 dialog661×645(x12/y16), document/dialog 가로overflow0. 임시viewport해제 |
| 로그 / 한계 | 해당 탭 captured warn/error0. pageerror/404 별도이벤트·FPS/GPU/VRAM·production 환경visual QA는 미측정 |
| 증거 | E/ui-final-review.json·ui-malformed-json.json·ui-state-preservation.json·ui-compact-proof.json·source-review-desktop-final.png·source-review-compact.png |

검토 Canvas는 polygon-only 데이터 뷰이다. **VISUAL VERDICT: FAIL(실제 production 장면 미연결)**. 검토 도구 인수와 환경 완성 인수는 별개이며, 후속필수source 입력은 위 표를 따른다.

## v0.11 물리 실행·작성 계약 · 이전 기록

[원본 실행 정본](FDG_SOURCE_SCENE_EXECUTION.md): native-v2 visual85 봉인 유지·설계START/정규화함수/명시이미지배치 지원·candidate/decode/install gate·논리높이/반경충돌/원본이미지draw/capture/save/reopen/lifecycle를 구현한다. 실제CH1 source는 여전히미제출필수자료가있으며 설치·productiondraw0, VISUAL FAIL이다. 이전검사·source봉인·Git증거는재실행하지않는다.

## v0.13 원본 이미지·흙 바닥 소비 · 역사 동결

[미리보기 정본](FDG_SOURCE_VISUAL_PREVIEW.md): canonical props9와soil1을 기존3333 exact read-only 경로에 연결했다. 원85/현재XY/nav 유지, soil 실제1024×1024 fullcrop을 명시 ENGINE_AUTHORING origin[0,0]·repeat1024²·opacity1로 원53 tile corners/T40 polygon에 clip한다. ground→기존depth props/actor 순서이며 화면타일만 제출·최대64 draw다. native UV UNKNOWN·mask/litter/commonSkin PENDING이고 실제collider/cliff/height SOURCE_PENDING·height:null·production FAIL은 유지한다. 공개FDG JSON import prepare가 decode 실패하면 기존장면을 유지한다. 실제북쪽10px 4020,7410→4020,7400·camera followtrue·바닥 저장/export/reload 확인, preview RETOUCH. 새ground8고유PASS/첫helper import실패수정 기록, 완료13/5 포함 기존검사 재실행0.

## v0.14 source-v4 높이·절벽 소비 · 현행

| 입력 / 소비 경계 | 정확 현행 계약 |
|---|---|
| 새원본 | MAP/ch1-1.execution-data.source-v4.json, source game.html:32353-32369. full envelope→heightPreview.sourceExecutionSnapshot·unknown/baseRef 원형보존·자동load0 |
| exactEvaluator/nativeParams | strict 원문3개+cx147/cy98/rx18/ry9/inner.84/outer1.04/rampX0125/rampX1135/rampY98/rampHalf01.8/rampHalf13. tx=worldX/40,ty=worldY/40 연속값·문자열eval0 |
| 정확 원식 | ramp구간[125,135], t=(tx−125)/10, half=1.8+1.2t, abs(ty−98)<=half→t/아니면−1; ramp>=0이면h=r²(3−2r), 아니면d<.84→1/그밖0. band는ramp<0 && .84<=d<=1.04 |
| 처음 대조 | sample6·summit340/cliff166 일치. 예: tile125,98 label의px5020,3940→연속125.5,98.5/r.05/h.00725. 최초count/sample 분석1회만·완료검사 반복0 |
| 작성 환산 / gate | 별도ENGINE_AUTHORING scale64/offset0→engineFootZ; maxStep16/maxSlope.75/보수foot policy conservative-ellipse-band-contained-ramp. finite-difference±1px slope는엔진파생·sourceSlopeClaim:false |
| actor/camera/capture | actor.position XY2/정적START4020,7420·원nav/53boundary/props85/soil1 유지. runtime player.z만파생·projectedY=worldY−Z·followcameraY=worldY−Z clamp. provenance.heightRuntimeObservation은현재XY/원식/작성mapping 재검증 |
| 상태 | logicalHeight/cliff SOURCE_CONSUMED, actual object collision UNKNOWN/SOURCE_PENDING·actualObjectColliderCount:null·sourcePhysicalZClaim:false·UNADOPTED/productionAdopted:false. 지역/World 등록0 |
| ground cache | localworld4960/3480·1720×880, authored64/0 cache1720×944/2024삼각형. max2048²/4194304pixels·visible cache1draw/offscreen0/disposepixels0·flat64+cache1→grounddrawcap65. source geometry/PNG 생성0 |
| 새 검사 | pure 최초4/4PASS + runtime 첫2PASS/fixtureAPI2FAIL→affected2/2PASS = 최종8고유PASS. 첫실패 이력보존·이전13/5server/8/15/23/16/source9/Git봉인 반복0 |
| 실제 ramp/작성/저장 | 별도QA4990/3940→동쪽10px×23=5220/3940/logicalHeight=0.5747500000000001/Z36.784000000000006. offset1→동일논리/Z37.784000000000006,0복원후20걸음→5420/3940/logical1/Z64·camera5420/3876followtrue·save/export/reload복원 |
| 실제 cliff/저장 | 별도6670/3940→서쪽3걸음=6640/3940/Z0. 4번째6630시도 source-cliff-band 보수발gate차단·XY/Z보존. saved/reload XY6640/3940/Z0복원 |
| 실제 오류/시각 | 첫import 실패시도2: 새height project/이전runtime toFixed guard1회 + 같은URL JS3600s cache의구guard 재호출1회. finiteheightReady수정+entry0.14.1 후공개import/heightedit/ramp43/cliff4/save/export2/reload2 PASS·capturederror0. root mid/summit/reopen/cliff inspect 완료·props의캐릭터가림/흙높이가독성 약함→preview RETOUCH·production FAIL. STARTreachability검수0 |
| 실제증거/정본 | engine-stage0-height-preview/actual-height-proof.json·actual-height-ramp-export.fdg.json·actual-height-cliff-export.fdg.json·mid/reopen/cliff PNG. 상세원식/11개key-value-unit/API/수명/정확증거파일은 [미리보기 정본](FDG_SOURCE_VISUAL_PREVIEW.md) v0.14 표 |


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
| 새 깊이 receipt | 772×370 fakeCanvas mid: visiblewalls39·depth3994.25..4190.029676289736·wall90draw; summit37·depth3994.25..4175.406771212186·wall86draw. 두곳 visibleprops3 projecteddepth3980/4260/4820;4260/4820 props는모든visiblewall뒤에그려지므로여전히윤곽을덮을수있다. fakeCanvas는시각PASS/PNGalpha/실가림양증거가아님 |
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
