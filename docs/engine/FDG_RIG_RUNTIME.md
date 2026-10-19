# FDG 실제3D 본 계층·선형 블렌드 스키닝 계산

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

기준일: **2026-10-11, Asia/Seoul**. 구현은 `engine/fdg/rig.js`, 2026-10-10 한정 회귀는 `test/fdgRigRuntime.test.mjs`다. 입력 정본은 [리그 프로젝트 스키마](FDG_RIG_PROJECT.md)의 `rigVersion:1`이다. 순수 math는 XYZ 정점·삼각형·실제 본 계층·정점별 본 가중치로 geometry를 변형하고 선택UV/drawOrder/texture를 renderer에 독립 복사해 전달한다. 실제 변형 정점에 원본 텍스처를 매핑하는 후속 CPU 구현은 [텍스처 정본](FDG_RIG_TEXTURE_RUNTIME_20261011.md)을 따른다.

이 math 모듈은 DOM·Canvas·rAF·타이머·네트워크·파일·이미지·서버·저장에 접근하지 않는다. 매 호출에 새 값/배열을 반환하고 입력을 변경하지 않는다. 이미지 수명은 독립 RigPreview 또는 일반 장면의 FDGRuntime owner가 관리한다. 본편 `game.html`, R 제품·기존 캐릭터/영상 에셋은 변경하지 않는다. 신규3종 `characterDrafts` 참고 자료가 게임용 모델·리그로 바뀌었다고 표시하지 않는다. generic 입체 시험체와 원본에서 보이는 표면2.5D 저작 메시 모두 같은 XYZ·LBS 평가 계약을 사용한다.

## 공개 API와 입력

| export / API | 인수 / 반환 | 계약 |
|---|---|---|
| `evaluateRig(project,options={})` | 검증된 프로젝트 / 아래 새 evaluation 객체 | 호출마다 `validateRigProject`로 구조·ID·계층·가중치·클립·저장 데이터 유효성 확인 후 평가 |
| `RigProjectValidationError` | errors 문자열 배열 / TypeError 하위 클래스 | name=`RigProjectValidationError`, `.errors`는 입력 배열의 복사. 프로젝트/옵션/수학 입력 오류에 사용 |
| `rigQuaternionFromEuler([x,y,z])` | finite radians3 / quaternion4 | intrinsic XYZ `Rx×Ry×Rz`, `[x,y,z,w]` 순서의 정규화 quaternion |
| `rigQuaternionSlerp(from,to,amount)` | finite quaternion4 두 개와0..1 / quaternion4 | 정규화 후 최단 경로 구면 보간. zero quaternion과 유효하지 않은 amount 거부 |
| `RIG_SLERP_LINEAR_THRESHOLD` | `0.9995` | 정규화 quaternion dot이 이 값보다 크면 정규화 선형 보간으로 작은 각도 분모 불안정 방지 |

| `options` 필드 | 기본 / 유효 값 | 의미 |
|---|---|---|
| `materialId` | `project.preview.materialId` / 기존 material ID | 단일 mesh/skeleton에 호환되는 material 선택. 필수color와 선택texture 선언을 반환하며 geometry/weights를 교체하거나 이미지를 로드하지 않음 |
| `clipId` | `project.preview.clipId` / 기존 clip ID 또는null | null은 애니메이션 offset0인 바인드 포즈; 수동 pose는 계속 적용 |
| `time` | `project.preview.time` / 유한 실수 초 | 연속 평가 시간. negative time은 loop에서 양수 주기로 wrap, non-loop에서0으로 clamp |
| `pose` | `project.preview.pose` / bone ID별 offset 객체 | 각 값에 `translation:[x,y,z]`, `rotation:[EulerXYZ]` 필수. 기존 본만 허용; clip 평가/전환 뒤 적용 |
| `blend` | null 또는 `{fromClipId,fromTime,amount}` | fromClipId는 기존 ID 또는null, fromTime은유한 초, amount는유한0..1. from→현재clip의 offset 포즈 전환 |
| 잘못된 options | null/배열·없는 material/clip/bone·NaN/Infinity·누락 pose triple 등 | `RigProjectValidationError`; 조용히 bind/다른 리소스로 대체하지 않음 |

`preview.playing`·`preview.camera`는 평가기가 소비하지 않는다. 재생 상태·실제 시간 진행·fixed60Hz/최대6step·pause/수동step·전환 기간0.25초·카메라 투영·Canvas depth sort·dispose는 root의 `RigPreview` 소유다. `RigPlayback` 클래스·독립 clock는 이 모듈에 만들지 않았다. 전환 amount 계산도 호출자가 한다.

## 좌표·회전·행렬 규약

| 항목 | 값 / 공식 | 의미 |
|---|---|---|
| 좌표 | 오른손, +X오른쪽 / +Y위 / +Z앞 | generic rig 월드 단위; 화면 픽셀 변환은 renderer 소유 |
| 벡터 / quaternion | `[x,y,z]` / `[x,y,z,w]` | rotation의 Euler 성분은 radians |
| 행렬 | column-major16, column vector | translation은index12/13/14; affine 마지막 행은0/0/0/1 |
| bind local | `T(bind.translation) × R(qbind)` | 부모 본 로컬 공간에서 정의 |
| EulerXYZ | `qEuler = qX×qY×qZ`, `R=Rx×Ry×Rz` | +90° Z는 +X를+Y로 보냄; +90° X는 +Y를+Z로 보냄 |
| posed local T | `bind.translation + clip.translation + manual.translation` | clip/manual 모두 parent-local의 bind-relative offset |
| posed local q | `normalize(qbind × qclip × qmanual)` | clip/manual rotation은offset 회전; bind절대값으로 덮지 않음 |
| world | root는local, child는`parentWorld × local` | 입력 bone 배열은 부모보다 자식이 먼저 있어도 평가 가능; forest 허용, cycle은validator 거부 |
| inverse bind | `[Rᵀ, −Rᵀt]` | rigid transform inverse. scale/shear를 입력으로 지원하지 않음 |
| skin matrix | `posedWorld × inverseBindWorld` | 매 평가에서 bind/world/inverse를 재계산; bind 편집 후 과거 inverse를 재사용하지 않음 |
| mesh 정점 | skeleton bind world 좌표 | 본 로컬 좌표가 아님. bindpose에서는 weighted skin행렬이identity이므로 원본 정점 유지 |
| 가중치 정규화 | `normalizedWeight = weight/sum(weights)` | validator가양수1..4개·합1±1e-6 확인 후 허용된 소수 반올림도 정확히normalize |
| 선형 블렌드 스키닝 | `v' = Σ normalizedWeightᵢ × (posedWorldᵢ × inverseBindWorldᵢ × [v,1])` | 각 정점에 실제 가중본 변환을 적용; skeleton 표시/평면 회전과 별개 |

프로젝트 수치 한계는 `rig-project.js`의 `RIG_LIMITS`를 가져온다. bones64, vertices4096, triangles8192, materials64, clips32, tracks64, keys256, influences4, coordinate성분±10000, Euler성분±100π, weightTolerance1e-6, UTF-8 프로젝트2MiB다. 수동 pose options도 동일 coordinate/rotation 한계로 제한하여 사용하지 않는 본에서도 overflow 행렬을 만들지 않는다. 기본 표시 데이터의 실제 장수/FPS와 이 숫자를 혼동하지 않는다.

## 클립 샘플·전환

| 항목 | 정확한 동작 |
|---|---|
| 시간 단위 | seconds, 키의 time 사이에서 연속 보간. clip.fps는1..120의 저장/수동step metadata이며 math에서24FPS로 강제하거나셀에 양자화하지 않음 |
| 누락 bone track | translation0·quaternion identity, 기존 bind 유지 |
| 키 translation | `a + (b−a)×fraction`; fraction=`(time−a.time)/(b.time−a.time)` |
| 키 rotation | Euler각 자체를선형 평균하지 않고 quaternion 최단slerp |
| dot<0 | to quaternion 부호반전. q/−q는동일회전이며170°→−170°는180°를거치는20° 최단호 사용 |
| dot>0.9995 | 정규화 선형 보간; 그 외theta=acos(dot), `sin((1−a)theta)/sin(theta)`·`sin(a×theta)/sin(theta)` 가중치 |
| loop | `remainder=time%duration`; remainder<0일때만duration 더함. 정확한duration에서0, 음수도wrap. 양수remainder에duration을무조건더하여finite 극값을overflow시키지 않음 |
| non-loop | time를0..duration에clamp; 마지막 key가duration보다일찍끝나면 마지막 key를hold |
| loop의 경계 | 첫key time0, 마지막key time=duration을validator가요구. 실제포즈의자연스러운연결/미술품질은math가승인하지 않음 |
| 전환 amount0/1 | from clip offset / 현재clip offset. fromClipId:null이면bind offset0 |
| 전환 중간 | source는fromTime, target은time에서각자평가. offset translation을선형 blend하고 offset quaternion을최단slerp |
| 수동 pose 적용 | clip끼리blend를끝낸후 manual.translation을더하고 manual.rotation을오른쪽곱. source/target 두번적용하지 않음 |
| pose 자체키만 소비 | `Object.hasOwn`으로직접저장된boneId만적용. 허용ID `toString` 등이Object prototype에서상속한함수를수동pose로해석하지않음 |

## evaluation 반환값

| 필드 | 형태 / 의미 |
|---|---|
| `materialId,meshId,skeletonId,clipId,color` | 선택된 ID·material색, clipId는null 가능 |
| `time` | 선택 clip의정규화시간. clipId:null일때원본유한 time 반환 |
| `vertices` | 새 `[[x,y,z]]` skinned geometry; 각성분finite 검사 |
| `triangles` | 원본 mesh의index triple을새배열로복사 |
| `uvs` | mesh에 있을 때만 새 `[[u,v]]`; 정점별 정규화0..1, LBS로UV값을 변형하지 않음 |
| `drawOrder` | mesh에 있을 때만 triangle별 정수layer의 새 배열 |
| `faceColors` | r7 mesh에 있을 때만 triangle별 null/RGB6hex의 독립 새 배열. absent-field 기존 반환 형태 보존 |
| `texture` | 선택 material에 있을 때만 `{src,width,height,…}`의 깊은 복사. 메타데이터이며 Image/GPU resource가 아님 |
| `bonePositions` | 입력본순서의 `[{id,parent,position:[x,y,z]}]`, posedworld 원점 |
| `boneMatrices` | 입력본순서의 `[{id,bindWorld,inverseBindWorld,world,skin}]`; 각행렬은독립새16성분배열 |
| `localPose` | 입력본순서의 `[{id,translation:[offsetXYZ],rotationQuaternion:[x,y,z,w]}]` |
| localPose의범위 | blend후clip+manual offset, bind자체는포함하지않음. translation은합, rotation은`qclip×qmanual` |

반환 vertices/triangles/uvs/drawOrder/texture/본좌표/각행렬/localPose를수정해도프로젝트나다음평가에전파되지않는다. persistent cache·입력참조를보관하지않으며inverse bind편집격리도이성질을따른다. 렌더러가필요한normal/lighting/triangle depth 및 원본 이미지 로드는호출자가소유한다.

## UV 삼각형 CPU renderer

`engine/fdg/rig-texture.js`는 평가기의 geometry와 선택UV를 받아 Canvas 명령을 작성한다. 이미지·시간·GPU 소유는없으며 실제 image는호출자가전달한다.

| export / 계약 | 정확한 값·동작 |
|---|---|
| `rigTextureAffine(source,target)` | source/target 각각3개의finite2성분 pixel좌표→Canvas `[a,b,c,d,e,f]`. 형식오류·비finite·source/target퇴화면 null |
| `RIG_TEXTURE_AREA_EPSILON` | **1e-9**, signed2배 삼각형 면적 절댓값이 이하인source/target 생략 |
| `sortRigFaces(triangles,projected,drawOrder?)` | authoredlayer오름차순→평균projectedZ오름차순→원triangleindex오름차순. layer생략은0 |
| `drawRigTextureTriangle(ctx,image,{texture,uvs,triangle,projected})` | 실제치수정확일치·유효UV·삼각형이면 `save→screen path→clip→transform→drawImage(original,0,0,width,height)→restore`. 성공drawImage **1**, 생략/throw **0** |
| `drawRigAuthoringTriangle(ctx,{color,triangle,projected})` | r7 유효 RGB6hex·finite projected XY·abs signed2배면적>1e−9인 명시 면을 save/path/fill/restore. 실제 fill1, 무효/생략/throw0; source tint·stroke0 |
| source pixel | `[u×texture.width,v×texture.height]`; `x=a×sourceX+c×sourceY+e`, `y=b×sourceX+d×sourceY+f`로skinned screen vertex와연결 |
| DPR / 원본색 | `transform()`은owner현재변환에합성. 원본texture에tint/flatshade/edge를추가하지않고owneralpha보존, throw에도restore |
| 한계 | piecewise affine·직교2.5D, perspective-correctUV·GPUskinning/texture·depthbuffer·교차면visibility·PBR·외부modelimport·자동weights·의상교체미구현 |

ENGINE_AUTHORING의 원본에서 보이는 표면2.5D 메시도 실제XYZ본·가중치수학을소비한다. 원본에서가려진몸/꼬리면을복원했다거나nativecombat에적용했다고표시하지않는다.

## 숫자 probe와 한정 검증

| probe | 입력 | 기대 XYZ |
|---|---|---|
| 부모 회전 | rootbind0, childbind[1,0,0], meshvertex[2,0,0]/childweight1, rootmanualRzπ/2 | childworld[0,1,0], vertex[0,2,0] |
| 두본 가중 | 위vertex root.25/child.75, childmanualT[4,0,0] | vertex[5,0,0] |
| 전환50% | rootvertex[1,0,0], fromoffsetidentity, toT[2,0,0]/Rzπ/2 | vertex[1.7071067811865475,.7071067811865475,0] |
| 수동depth추가 | 위전환 + manualT[0,0,2] | vertex[1.7071067811865475,.7071067811865475,2] |
| 최단회전 | rootvertex[1,0,0], Z키170°→−170°, 중간시각 | vertex[−1,0,0] |
| 변수FPS | rootvertex[1,0,0], T0→[4,0,0]/2초, time.253, clipfps7또는120 | 양쪽 vertex[1.506,0,0] |

`createDefaultRigProject()`의실제3본/16정점/28삼각형시험체에서는다음좌표가UI oracle다. 아래vertex0은모든표시에서[−.5,0,−.4]로유지된다.

| 기본시험체 선택 | vertex12 XYZ | head 본월드 XYZ |
|---|---|---|
| clipId:null, time0 | [−.35,3,−.3] | [0,2,0] |
| sway, time1 | [−1.0145760644074853,2.7587311930853495,−.3] | [−.3428978074554514,1.939372712847379,0] |
| bow, time.75 | [−.35,2.788705018940327,.984819328291847] | [0,1.8525245220595057,.5226872289306591] |

2026-10-10 명령: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --test test/fdgRigRuntime.test.mjs`. **리그math11개 PASS의동결이력**이다. 이번변경에서이전sprite/renderer/최적화/게임및해당math완료suite는재실행하지않았다. 2026-10-11 신규 `test/fdgRigTexture.test.mjs` **8/8 PASS**는 [별도텍스처검증표](FDG_RIG_TEXTURE_RUNTIME_20261011.md)에기록하며 기존수에합산하지않는다.

| 검증 | 확인된범위 |
|---|---|
| bind identity | 회전·이동·unordered계층·2본가중에서도원본정점유지 |
| 계층·XYZ | 부모이동/회전, 자식원점·실제Z성분변형 |
| 비율·반올림 | .25/.75 혼합변형, sum1±1e-6 정규화 |
| Euler/적용순서 | RxRyRz, bind→clip→manual quaternion합성 |
| slerp/FPS | 최단호·antipodal부호·7/120FPS에서도동일연속좌표 |
| 전환 | from/target 각시간,0/.5/1끝점·중간, bindsource·manual한번적용 |
| 시간 | loop정확duration/음수wrap, non-loop clamp·earlylastkeyhold |
| 격리·bind편집 | 반환배열/입력불변, 새bind의inverse재계산 |
| finite 극값 | duration/time가Number.MAX_VALUE근처에서도finite loop결과 |
| prototype 이름 ID | 유효boneId `toString`의상속함수무시, ownmanualpose만적용 |
| malformed | NaNproject·무효옵션/ID/pose/transition·zeroquat·poseoverflow거부 |

코드변경후 docs전체를 `grep -r -n -I -E 'evaluateRig|RigPlayback|RigProject|rigVersion|스키닝|3D skeleton|리깅|weights' docs/`로검색했다. 기존문서의신규3종미구현모델상태는유지하고, 독립엔진리그마일스톤과Studio완료상태동기화는root가소유한다. 이worker는신규3파일만수정하고commit/push/deploy하지않는다.

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
| 실제 XYZ/weights | 새19본bind T/R·inversebind/posedWorld로3289정점 실제LBS평가. 원화사각형전체회전/중복프레임/다른보스rig이름교체0; 앞면 GaussianZ/shortside rearZ가 데이터로 존재 |
| 독립 evaluation | mesh UV/drawOrder/faceColors/materialtexture 반환은 기존independentcopy 계약. source355×541 inversemax8.788928253162695e-14px; weights1..3·sum1 |
| pose/clip 결과 | 15phase boot115정점 drift0/handstaff sharedmatrix·weld0, min3Darea3.576760891484091e-8model²; idle0.5maxmotion0.04178318974275876model/loop2초closure0/attack2.4끝closure0 |
| 전환/저장 | entry15owner틱/return21틱, returnt0error6.280369834735101e-16model. mockcapture attack0.09999999999999999/transitionelapsed동일로 JSON재열기pose/bones drift0; 실제publicidle저장과별도근거 |
| 권위 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 평가계약 | 기존parentlocalbindrelativeT/R·posedWorld×inversebindWorld의XYZ LBS·quaternion보간을그대로소비. headlocalT은저작배열이며 runtimeconstraintsolver추가0 |
| head/staff키조건 | 공통 spine→chest→arms 힘 전달; peak chest inheriteddrive[0.13949758129408563,−0.19533373811731902,0]model, staffworldrotation−0.05000000000000001rad. headlocalT 보정 + headlocalZ=leftUpperArm+leftForearm+leftHand의Z로 10key에서 head/staff skin 일치; staff독립track0·childhand T/R0·weights수정0; 17phase boot115정점 drift0·hand/staff skin/weld0. head/staff10key maxerror2.220446049250313e-16; triangle177/351의6개 edgefactor0.9999999999999997..1.0000000000000306. key일치이며 전체연속시간skin동일constraint로 확대0 |
| 실제motion | source-equivalent probe[75,82]: 준비0.9초[66.54301388253896,77.21874976139787]→peak1.1초[103.94808931697101,108.38274919430683]; Δ[37.40507543443205,31.163999432908952]sourcepx, scale80에서는[19.949373565030424,16.62079969755144]scenepx. +X전방/+Y하강이며 native공격거리/피해로 환산0 |
| closure/capture | 17phase foot115/weld0·2.4초end0, returnt0error2.220446049250313e-16. mockentry0.1초저장과실제publicattack1.1초저장은별도근거 |
| 권위 | 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.

<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · smooth-motion 현재 계약

이전 본문/보고는 날짜가 있는 동결 이력이다. 이번 first+r5 표시 계산·전환·QA restart 범위만 추가한다.

| 항목 | 이번 정확 계약 / 관측 경계 |
|---|---|
| opt-in / query | first+r5 smoothMotion:true && idleClip 존재. bridge/rig import motion-continuity-20261012-final; default24FPS floor·다른 bridge/fallback 보존 |
| idle / 전환 | native G.stageTime/60 연속 idle. 마지막 표시 localPose를 source로 entry wind normalized progress0..0.25 smoothstep(0.25초가 아님), return native clock0.12초. wind 외 blend amount1 즉시·impact/FSM 지연0 |
| prepared 평가 | compileRigEvaluator(project) full project validate1회+독립 structuredClone, bind quaternion/world/inverse·hierarchy·influences·lookups·key quaternion prepare1회, frozen{evaluate(options={})}. 매 evaluate options 검증/sample/world/skinning·독립 결과 사본. 기존 evaluateRig 매-call project validation 유지 |
| pose / 표시 cache | localPose=[{id,translation:[x,y,z],rotationQuaternion:[x,y,z,w]}]는 bind transform에 합성할 offset. smooth rasterScale=ceil(clamp(desired,.25,2)×8)/8; 같은 bucket의 scale 원인 reraster 억제. facingDeadZone=.1 display hysteresis, native facing 미수정·8방향 완성0 |
| strict fromPose | 배열에 모든 bone id 정확1회, translation3 finite/abs≤10000, quaternion4 finite/norm1 오차≤RIG_POSE_QUATERNION_TOLERANCE=1e−6, amount finite0..1. fromClipId/fromTime 혼합 거부·RigProjectValidationError; captured source manual 재적용0·target manual1회 |
| 관측 API | getRenderSnapshot().motion={phase,nativeSeconds,transition,blendAmount,rasterScale,authoredFps}, getDisplayedPose(actor)는 localPose 새 사본·uninstall 후 null. authoredFps24와 실제 renderedFPS 구별 |
| 새 검사 | root 최초6/6 PASS954.97ms + 이후 facing 새1/1 PASS752.284ms + math 최초5/5 PASS987.274542ms =12 고유 증분 PASS. math의6legacy SHA/18compiled exact는 새 검사 내부 비교이며 old suite 재실행0·한 command12종 최초PASS 아님 |
| 최종 실제 관측 | visible slam 원본116 JPEG1280×720/2.2741949558258057초·running44observer: wind/strike/recover/idle·entry/null/return. camera44/44 fit.ok&&contained, root source frame17/22/41 전신·지팡이 안전 확인. public 실제 사망HP0→QA restart HP548/opacity0/pointer none/pet0·즉시 숨김PASS |
| 성능 / 파생 | slam rolling FPS63/median69/119, drawmedian12.427905746499118ms/update median0.2947923078451533ms; 짧은QA·pause baseline/녹화 overhead 포함으로 sustained60FPS 미인수. GIF640×360/25Hz57targets/2280ms는 preceding 실제 frame 재표본(동일 frame 반복 가능), 새 pose0/원116+timestamp 보존 |
| 최종 판정 / 중간 실패 | 연속동작 단위 구현 완료·전체VISUAL RETOUCH. 정확 잔여1 WHOLE_COMBAT_VISUAL_UNIFICATION(플레이어 tiny·기존걷기/다른패턴4frame·ambient edge crop·trueflip/8방향·true24이미지). overlay 전slam120·사망 전/잔존fade restart 자료는 INVALID 이력 보존; 최종증거 사용0 |
| 보호 / 미인수 | native actor시간/AI/판정/damage/Q-E/PNG/19본/mesh/UV/weights/fixture/맵/사용자save 유지. true24 실제 캐릭터 이미지·전체1280×72060FPS 미인수; 효과24cell/clip24FPS/단일98FPS를 목표PASS로 확대0 |

[2026-10-12 smooth-motion 정본](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 실제 최종 결과·§23은 이 정본의 새 관측 표를 따른다.
<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_END -->
