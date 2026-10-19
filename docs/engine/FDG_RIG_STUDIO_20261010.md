# FDG 실제3D 리깅·스킨 제작 시험실 v0.4

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

r7 선택 면 노트: 아래 기존 material/UV·textureDraws·plain shade 표는 mesh.faceColors가 미설정/null인 면의 기본 계약이다. 명시 RGB6hex 면은 새 authoring flat fill1·authoringDraws를 적용하며 현재 r7 표와 정본을 따른다. 기존 r6 이하 수치·검수 행을 새 결과로 합산하지 않는다.

기준일: **2026-10-11, Asia/Seoul**. 사용자 지시의 자체 엔진·모델링 품질·계속 제작 범위에서 메시의 뼈·정점 가중치·호환 색/텍스처 재질·클립을 편집하는 독립 저작 단위를 제공한다. 현행 진입은 `http://localhost:3333/tools/fdg-studio/rig.html`이며 기존 스튜디오 하단의 `3D 뼈대 · 스킨 제작` 링크로 이동한다. 서버는 API 포함 `server.cjs`, 포트3333이다. 2026-10-11 선택UV·원본 텍스처·삼각형layer·이미지상태·뼈표시를 추가했으며 데이터 버전은 `rigVersion:1`을 유지한다. URL query는 모듈 cache 구분 키이며 스키마/엔진 버전이 아니다.

기본 시험체는 코드로 정의한 **실제 XYZ 입체 메시**이며3본·16정점·28삼각형의 generic 엔진 검수물이다. 추가 HellAberrant 자료는 승인 PNG에서 보이는 표면의 **ENGINE_AUTHORING·2.5D 텍스처 메시**에 실제XYZ본·수동weights·LBS를 적용한다. 완전3D 몸체나 가려진 뒤쪽/꼬리 표면을 복원한 자료가 아니다. 변성술사·헬 헌터·아케인 랜서 및 Druid의 게임 모델 제작·채택·품질 승인을 뜻하지 않는다. 기존 원화/영상/PNG·제품 R 체크아웃·본편 전투를 변경하지 않았다.

## 파일·데이터 정본

| 파일 | 책임 / 정본 |
|---|---|
| `engine/fdg/rig-project.js` | `rigVersion:1`, 검증·기본 입체 메시·이력. [스키마와 모든 수치](FDG_RIG_PROJECT.md) |
| `engine/fdg/rig.js` | 본 계층·bind/inverse bind·XYZ quaternion·실제 LBS·클립 보간. [계산 공식/API/좌표](FDG_RIG_RUNTIME.md) |
| `engine/fdg/rig-texture.js` | UV pixel→skinned screen triangle affine·layer/depth 정렬·원본 이미지 clip draw. [텍스처 정본](FDG_RIG_TEXTURE_RUNTIME_20261011.md) |
| `tools/fdg-studio/rig.html`·`rig.css` | 뼈 목록·인스펙터·2.5D 카메라·재생·저장·진단 |
| `tools/fdg-studio/rig-studio.js` | 검증된 편집→Undo/Redo→렌더 갱신, 독립 저장·JSON 입출력·수명 이벤트 |
| `tools/fdg-studio/rig-preview.js` | `RigPreview`, CPU 정점 평가·투영·색/texture삼각형 표시·Image/decode상태·재생·정리 |
| `test/fdgRigProject.test.mjs`·`test/fdgRigRuntime.test.mjs` | 2026-10-10 스키마36개·math11개 검증의동결이력 |
| `tools/fdg-rig-smoke.mjs` | 2026-10-10 리깅 페이지의 실제Chrome12개 동결검증 |
| `test/fdgRigTexture.test.mjs` | 2026-10-11 신규8개한정검증, fakeImage/Canvas 기반. 기존suite재실행없음 |

| 문서/저장 항목 | 정확한 계약 |
|---|---|
| 리그 문서 | `{rigVersion:1,id,name,skeleton,mesh,materials,clips,preview}`. 기존 `{schemaVersion:1,map,characters,…}` 및 제품 `{format:'fdg-scene',version:1,…}`와 별개 |
| localStorage | `fdg.studio.rig.v1`만 사용. 기존 제작 키 `fdg.studio.project.v1`·사용자 게임 save와 분리 |
| 파일 상한 | UTF-8 JSON2MiB =2,097,152bytes. 로컬 복원 Blob 크기·파일 가져오기 size·스키마 직렬화 모두 검사 |
| 저장 | 현재 재생 위치를 캡처하고 pause, `preview.playing:false`로 저장. 재열기는 항상 정지 상태 |
| 보존 | 메시XYZ/삼각형/가중치·선택UV/drawOrder, 본ID/부모/bindpose, 재질ID/색/호환참조·선택texture선언, 모든clip/key/FPS·선택clip/material·수동pose·시각/카메라. Image와showBones는저장하지않음 |
| 이력 | 최대80개, 유효 편집/불러오기만 기록. 동일 문서 교체는 no-op. 실패 후보는 기존 문서/이력을 유지 |
| 내보내기 | `fdg-rig-project.json`, 현재 재생 위치 포함. pretty UTF-8이2MiB를 넘으면 유효한 compact JSON으로 출력하여 raw import 한계 보존. Blob URL은1초 후 revoke |
| 가져오기 | 위 FDG 리그 JSON만. 일반 glTF/FBX/외부 엔진 모델 import 아님. 검증 성공 후 교체·pause·이전 전환 제거 |
| 복원 실패 | 오류를 상태줄에 표시하고 기본 시험체로 시작. 기존 저장 키를 자동 삭제/덮어쓰기하지 않음 |
| DOM | `textContent`는 자식 없는 특정 리프만. 목록/폼은 새 DOM 노드와 명시적 `replaceChildren` 사용 |

## 편집 계약

| ID / 조작 | 저장 필드 / 값 | 적용·검증 |
|---|---|---|
| `rig-bones`, `rig-add-bone` | 선택 bone ID, 새 `bone_${crypto.randomUUID()}` | 선택 본의 자식 추가, name=`새 관절`, T[0,.5,0]/R[0,0,0]. 계층 깊이를 들여쓰기·부모 연결로 표시 |
| `rig-bone-name`, `rig-bone-parent` | `bones[].name,parent` | 이름1..120자, parent=null/기존 ID. 자기 부모/순환 거부 |
| `rig-bind-position-{0,1,2}` | `bones[].translation` | parent-local XYZ, 성분±10000. 변경 후 inverse bind 재계산 |
| `rig-bind-rotation-{0,1,2}` | `bones[].rotation` | UI degrees→저장 radians, 성분±100π. Euler intrinsic XYZ |
| `rig-pose-position/rotation-{0,1,2}` | `preview.pose[boneId]` | clip 뒤에 수동 offset 적용. 저장된 own key만 읽으며 `toString` 같은 허용 ID도 안전하게 편집 |
| `rig-vertex`, `rig-vertex-position-{0,1,2}` | `mesh.vertices[index]` | bind model-space XYZ 편집. 초기 index=`min(8,vertices.length−1)`, 가져오기/이력 변경 때도 clamp |
| `rig-weight-bone`, `rig-weight` | `mesh.weights[index]` | 선택 본0..1, 0은 제거. 다른 본 최대3개 비율을 `(1−선택값)×기존값/다른값합`으로 재분배, 총 최대4본·합1±1e-6 |
| 가중치 fallback | 선택 본 외 기존 첫 본 | 값<1인데 다른 가중본이 없을 때 수동 잔여값 대상. 본이 하나면 가중치1만 가능. geometry로 자동 가중치를 추론하는 기능 아님 |
| `rig-material` | `preview.materialId` | 기본iron철빛#91abbf / ember잿불빛#cb6646. 가져온리그의동일mesh/skeleton 호환색/texture도선택. 시간·clip·정점변형유지 |
| `rig-show-bones` | transient `preview.showBones` | 기본true. 변경후즉시render; false면본연결·점·이름루프생략. JSON/Undo에새저장필드추가없음 |
| `rig-hell-aberrant` | 기존승인PNG를참조하는fixture JSON | 검증·2MiB검사후pause/전환해제·store교체, texture준비. UI에서기본뼈표시false. geometry/phase/모션시각증거는root의새제작인수범위 |
| `rig-clip` | `preview.clipId` | null=바인드/수동 pose, `sway`=2초·24FPS·loop, `bow`=1.5초·30FPS·non-loop. 선택 시 target time0 |
| `rig-clip-fps` | `clips[].fps` | 1..120, 가변 값. 입력 step1이며 스키마는 유한한 FPS를 허용. 24는 기본 sway 값, 전체 리그의 하드 제약 아님 |
| `rig-clip-duration` | `clips[].duration`, 모든 key.time | `key.time / oldDuration × newDuration`으로 비율 보존. loop 마지막 키는 정확히newDuration. HTML min.05/max120 힌트, 구조 검증은 finite>0 |
| `rig-key`, `rig-key-translation/rotation-{0,1,2}` | 선택 track.key T/R | 키시간 사이 T선형·quaternion 최단 slerp. 키 수/키시간 추가 편집 UI는 미구현 |
| `rig-add-track` | 선택 clip.tracks | 선택 본의 채널이 없을 때 time0/duration의 offset0 키 두 개 추가 |
| `rig-time` | `preview.time` | scrub은 pause 후 편집, UI step.001초. 범위0..선택duration, bind모드는0..2초 |
| `rig-yaw/pitch/zoom` | `preview.camera` | yaw±180°/pitch±60°/zoom.5..2. radians 저장, 기본[−.65,.32,1] |
| `rig-undo/redo`, save/import/export | 독립 `RigProjectStore` / 위 저장 | Undo/Redo는 먼저 pause. 재생 위치를 편집 문서에 캡처하되 실제 시간은 미리보기 소유 |

기본 가중치는 ring0=root1, ring1=root.4/spine.6, ring2=spine.6/head.4, ring3=head1인 **명시적으로 작성한 프리셋**이다. 본 위치 변경만으로 새 관절에 자동 가중치를 생성하지 않는다. bind 편집은 메시의 bind-world 좌표를 이동시키지 않으므로 clip/manual offset0에서 원본 정점을 유지한다.

## 실행·렌더·진단

| 항목 / API | 정확한 동작 |
|---|---|
| `new RigPreview(canvas,project,onStats)` | Canvas2D·프로젝트복제·초기정지렌더·부모ResizeObserver1개. 프로젝트의모든texture source를src별Image cache로준비 |
| `setProject(project)` | authored시간/clip/재질/카메라복사후평가. 기존전환source가null(bind)또는여전히존재하면보존. source/선언치수교체·제거·오류재시도동기화, showBones transient선택유지 |
| `setSelection({boneId,vertexIndex})` | 선택 뼈/정점의 렌더 강조. geometry 정의를 변경하지 않음 |
| `play/pause` | rAF 재생/취소. pause/재개는 lastTimestamp·accumulator 초기화하여 벽시계 누적 방지 |
| fixed update |1/60초, 최대6substeps, 한 raw 프레임 최대.25초. 초과 accumulator 및 raw clamp 시간의 정수 step을 누락 틱에 합산 |
| `step()` | pause 후 정확히1/선택clipFPS초. bind모드24FPS fallback. 캐릭터 스프라이트의24셀 계약과 별도 |
| loop/non-loop | 시간 modulo duration / duration 끝 hold. 끝 hold에서도 재생 상태는 running, 자동pause는 하지 않음 |
| `transitionFrom(clipId,time,duration=.25)` | 실행 중 clip 변경 시 .25초 source→target 포즈 전환. source/target시간 함께 진행, T선형·rotation quaternion slerp. 종료 비교에1e-9초 허용 오차, 기본60Hz15틱 후 종료 |
| 실제 변형 | `posedWorld×inverseBindWorld`의 정점별 가중합. 결과 정점에 X/Y/Z 모두 존재하며 X회전 때 실제Z가 변함 |
| 투영 | yaw 회전 후 pitch의 직교2.5D 투영. scale=`min(viewportWidth/7,viewportHeight/4.5)×zoom`, 중앙X/높이.84 기준 |
| 화면 | authoreddrawOrder→평균projectedZ→원triangleindex 정렬. 색은normal음영/edge, texture는원본이미지affine/clip표시. −3..3바닥격자·X/Z축·선택정점·showBones일때본연결/이름. depthbuffer/GPU없음 |
| Canvas 픽셀 | CSS viewport 크기×`min(2,devicePixelRatio)`; 실제 모델 좌표와 픽셀 좌표 분리 |
| CPU ms | `performance.now()`로 evaluate→투영→Canvas 명령의 CPU 구간만. onStats/snapshot 복사 비용·GPU 완료시간 제외 |
| JSON bytes | `TextEncoder(JSON.stringify(project)).length`의 정확한 compact UTF-8 파일 크기. 실제 VRAM/JS heap 측정 아님 |
| UI 진단 주기 | running일때100ms미만콜백생략, paused는즉시표시. 시간/state/CPU/누락틱/전환/texture상태·실제texture삼각형수를표시. play/step강제갱신 |
| `snapshot()` | 기존새복사필드에 `showBones`, `textures:[{src,width,height,status,error}]`, `textureDraws` 추가. status는loading/ready/error, error는null/문자열; Image객체없음 |
| QA handle | `window.FDGRig`: `project` getter=현재시간 캡처복사, `snapshot` getter=실행복사, `preview`, `storageKey` |
| blur/hidden | pause. beforeunload는 미저장 변경 때 브라우저 경고. 일반pagehide는preview/store dispose; persisted pagehide는BFCache복귀를 위해pause, persisted pageshow는정지 렌더 갱신 |
| `dispose()` | rAF취소·observerdisconnect·미완료Imagecallback분리/src해제·texturecacheclear·image참조해제·project/result/context/transition제거. state=disposed, 후속동작·늦은decode완료무동작, frame/time고정·vertices=[]·textures=[]·textureDraws0 |

독립 RigPreview는 textured material의 Image 로드·decode·cache를 소유한다. 상대src는`/`prefix로로컬서버에서읽고, root상대src는그대로사용한다. onload뒤decode완료와선언natural치수정확일치를확인한다. loading/error일때색메시로대체하지않고Canvas에TEXTURE LOADING/ERROR를표시하며texture draw는0이다. 같은src/치수의ready/loading은재사용하고error는명시setProject때만재시도한다. callback은record identity와disposed상태를확인하여교체중늦은완료를무시한다.

GPU context/texture·별도lease는만들지않는다. 과거CPU시험체처리시간을실측했지만이번texture/모션의GPU·제품성능·고밀도본편전투인수로확대하지않는다. 상한4096정점/8192삼각형·texture축4096px은허용데이터크기이며성능보장수치가아니다. 렌더마다구조검증·행렬재계산을수행한다. PBR·외부import·자동weights·의상교체는미구현이다.

## 2026-10-10 v0.4 동결 검증·시각 근거

아래47개Node·12개Chrome·PNG와 구문 검사는 당시 단위의 동결 기록이다. 이번 UV/texture 변경에서 기존 suite·기존 PNG를 재실행/재검수하지 않고 새 결과와 합산하지 않는다.

| 검증 / 명령 | 이번 실제 결과 |
|---|---|
| `npm run engine:rig:check` | **47/47 PASS**: rig schema36 + rig math11. 기존 완료187개 suite를 다시 실행하거나 합산하지 않음 |
| `npm run engine:rig:qa` | **12/12 PASS**, Chrome1600×1050 fresh context, pageerror0. 실제XYZ/가중치 변형·계층편집/순환거부·재질 픽셀차이·전환/48FPS step·저장복원·파일왕복·duration endpoint·작은메시/toString ID·2MiB근접왕복·persisted페이지전환·dispose |
| QA 환경 | Node24.15.0/darwin arm64, APIserver3333, 제공 Playwright module+설치된 Chrome headless. 서비스/패키지 설치 없음 |
| 새 소스 검증 | 새JS5개+test2개 구문7PASS, rig.html 고유ID27개·상대CSS/JS/link4개 확인. 기존전체 source72 재실행 아님 |
| 입력값 경계 | sway duration2→.05→.11의 loop 마지막키 정확히.11, Undo.05/Redo.11; 저장된3정점 메시 복원 index2 및 허용boneId toString의 own pose 편집 |
| 가중치 증거 | spine Tx.5 때 vertex5의ΔX=.3(.6 weight), 수동weight1 뒤ΔX=.5. root vertex0 유지. spine Rx30° 때 vertex12 실제Z 변화>.2 |
| 호환 스킨 증거 | 동일clip/time/변형좌표를 유지한iron→ember Canvas RGBA SHA 차이 |
| 저장 증거 | 뼈·XYZ·가중치·재질·클립키·48FPS·수동pose·yaw44°/pitch25°·time 복원 후 동일한 skinnedvertices |
| 자원 정리 증거 | disposal 이후rafPendingfalse/observers0/vertices빈배열; frame/time 고정 |
| 파일 한계 증거 | compact2MiB−10bytes 후보는pretty가2MiB초과. 실제다운로드compact≤2MiB→재import동일 |
| BFCache 이벤트 경로 | Chrome에서persisted pagehide/pageshow를명시적으로발행, pause/observer유지·편집/step재사용 확인. 실제 브라우저cache채택 여부를 인증한 결과는아님 |
| 로컬 산출물 | `tmp/fdg-rig-20261010/qa/report.json`, `deformation.png`, `saved-rig.png`, `fdg-rig-project.json`, `near-limit-rig.json`. tmp는Git제외, 재현 자료 |

두 PNG를 직접 확인했다. 입체 면·깊이·뼈와 가중치에 따른 굽힘·호환 색 변경·저장된 포즈가 표시되고 인스펙터/진단이 보인다. **기술 시험체의 입체 변형 시각 확인 PASS**이며 게임 캐릭터 미술/모델링 품질 승인은 아직 없다. 저다각형 관절 시험물이므로 신규 캐릭터의 얼굴·손/무기 grip·발 접지·의상·8방향 품질 Gate를 통과했다고 보고하지 않는다.

`FDG_PLAYWRIGHT_MODULE`로 제공 번들 경로를 지정할 수 있다. `FDG_RIG_URL`은리그 URL, `FDG_RIG_QA_OUTPUT`은산출물 경로를 바꾼다. 기존 스튜디오 QA runner의 Chrome fallback 옵션을 이 별도 runner가 지원한다고 간주하지 않는다.

## 구현 상태·다음 인수

| 범위 | 현행 상태 / 후속 작업 |
|---|---|
| 실제3D skeleton/weights/clip | generic 시험체에서 구현·새Node/Chrome 검증 완료 |
| 스킨/재질 | 같은메시·본대의색재질호환유지. 선택UV/texture/drawOrder·CPU원본texture표시는구현. PBR·옷/몸파츠교체는미구현 |
| 자동 가중치 | 미구현. 명시한 프리셋 및 사용자가 편집한 가중치만 사용 |
| 외부 모델 가져오기 | 미구현. 자체rigJSON 입출력만 완료 |
| GPU 스키닝·VRAM | 미구현/미측정. 현재CPU LBS+Canvas projection |
| 신규 게임 캐릭터 | 원화/24장·24FPS 참고만. `modelAvailable:false`, `gameplayApplied:false`, 모델·리그·투명분리·8방향·전투 미확보 상태 유지 |
| 24장·24FPS | 게임용 sprite 제작 목표 유지. 리그 clip은 시간 보간과 가변FPS를 지원하며24로 강제하지 않음 |
| 제품 통합 | SceneTree/Renderer25D/resource lease·production scene/collision·스킬/SFX voice adapter·실제 전투/GPU/NW.js 검수 미완료 |

전체 엔진의 최초 인수 완료 선언은 하지 않는다. 다음 모델 소비 단계는 승인된 게임용 mesh/skeleton/clip을 연결하고 실제 카메라·전투 가독성·성능·소리를 새 검수해야 한다. 이번 체크포인트는 현재 저작 경로의 edit→play→pause/step→save→reopen을 완성한 독립 리깅 단위다.


## v0.5 일반 장면 consumer 연결

| 항목 | 후속 현행 상태 |
|---|---|
| 일반 FDG 소비 | 구현·새Node42/Chrome8PASS. 기존RigProject를 schemaVersion1 optional rigScene 리소스로 포함해 같은FDGRuntime에 시각노드 배치 |
| 저작 흐름 | mainStudio3D장면 탭→기존시험/저장리그→배치·공유pose/재질/clip→play/pause/장면1틱→일반scene저장/reopen/교체 |
| 시간 | v0.4독립시험실 step1/clipFPS 유지; v0.5일반scene step1/60초, owner60Hz만소비. 중간전환 상태도 저장 |
| 저장 | 시험실 fdg.studio.rig.v1은 유지·장면에서읽기만, 일반scene는기존fdg.studio.project.v1/전체4MiB/inline리그2MiB |
| 경계 | 기존genericprobe를소비, 신규3종모델승격0. productionR/game/SFX/GPU·외부모델import·자동가중치/PBR/의상·8방향전투 미완료 유지 |
| 정본 | [일반장면제작/QA/맵보고](FDG_RIG_SCENE_STUDIO_20261010.md)·[데이터](FDG_RIG_SCENE_PROJECT.md)·[소비API](FDG_RIG_SCENE_RUNTIME.md) |

v0.4의 검증수와 독립 저장·수학 규약은 당시 단위의 기록이다. 일반장면의 소비 완료를 전체 엔진 최초 인수 완료나 게임캐릭터 미술 승인으로 확대하지 않는다.

## 2026-10-11 r2 UV·texture 추가 인수 경계 (동결 이력)

새 `test/fdgRigTexture.test.mjs` **8/8 PASS**는 [텍스처 단위 정본](FDG_RIG_TEXTURE_RUNTIME_20261011.md)의 별도 증거다. synthetic UV/texture metadata·fake Image/Canvas로 affine·실제 Canvas 명령/DPR·layer·스키마·XYZ LBS·scene owner·preview 교체/오류/정리·runtime 캐시 접점을 검증했다. 승인 PNG의 실제 decode·공개 UI 모션·저장 재열기·시각 판정은 [r2 모션 동결 기록](FDG_HELL_ABERRANT_MOTION_20261011.md)을 따른다. r3 검수나 shipping 수치로 합산하지 않는다. 위 v0.4/v0.5 PASS로 새 fixture가 통과했다고 표시하지 않는다.

HellAberrant 저작 fixture는 원본 `assets/sprites/boss/stage1_codex_hell_aberrant.png`를 texture로 참조한다. **ENGINE_AUTHORING·보이는 표면2.5D·`gameplayApplied:false`**이며 뒤쪽 몸통/다리에 가린 꼬리 표면은 추가 자료가 필요하다. 승인3D 모델·native 본편 스킬/피해/AI/phase/충돌/Q/E 연결 완료와 구분한다. 큰 수정 전6문서 백업은 `tmp/fdg-rig-texture-20261011/backup/`이다.

## 2026-10-11 r3 꼬리 연결부 보정 (동결 이력)

[꼬리 연결부 r3 정본](FDG_TAIL_CONTINUITY_20261011.md)이 r3 mesh·가중치와 당시 연결부 검수의 정본이다. 위 r2 모션 보고와 기존14개 검사·저장 전체 증거는 동결 이력이며 r3에서 재실행하지 않았다. 아래 r3 수치·4개 검사·공개 재생·저장 증거도 완료 이력으로 동결하며 r4 결과와 합산하지 않는다.

| 항목 | r3 당시 결과 / 정확 범위 |
|---|---|
| shipping 데이터 | `hell-aberrant-tail-swipe-continuity-r3`, 3864정점 / 4850삼각형 / 32본 / compact UTF-8 701016bytes, 꼬리888정점. ENGINE_AUTHORING / gameplayApplied:false / sourceImageModified:false |
| 국소 저작 보정 | 실제 source pixel의 부위 분류를 교정하고 static leg cut-cap left[330,940,470,1064] / right[560,984,680,1064] 안의 앵커27개로 꼬리134정점에32px smoothstep을 적용했다. 정확 경계의 pinned27개, generic axe/torso/arm 앵커0; 자유 curl의 원래 꼬리 가중치 유지. 기존 tail9 pivot[342,980]의9개 key에 parent inverse local T/R을 bake했다. 수식·키 값·동작 지표는 정본을 따르며 일반 보간 runtime은 변경하지 않았다 |
| 보호 계약 / cache | 승인 PNG832×1248·32본·3초/24FPS clip2종·발 고정·native 전투 수치 유지. 바뀐 query는 `rig.html→rig-studio.js?v=tail-continuity-r3-final`과 `fixtures/hell-aberrant-motion.rig.json?v=tail-continuity-r3-final` 두 개다. runtime dependency 및 main entry의 `texture-motion-r2-final` 유지 |
| 이번 검수 | 새 연결부 targeted4개를 최초 실행하여4/4 PASS. 공개0.650/0.900/1.400초 pose와 실제 재생108JPEG / 7.053698초, GIF7140ms / 960×540 확인. 수정 rig를0.900초에 자기 저장·재열기 정확1회: export 전체 deepEqual true, mesh/skeleton/materials/clips/provenance도 shipping과 깊은 일치. 기존14개 검사·저장 전체 재수행0 |
| 시각 / 증거 | 이번 보이는 꼬리 island 연결성 VISUAL PASS / 제품 전체 VISUAL VERDICT: RETOUCH. 단1개 잔여는 hidden rear body와 leg/right-hand 뒤 꼬리의 독립 source surface 미확보다. full3D·본편 전투·Windows 성능 인수로 승격하지 않는다. 초기 spike 실패와 candidate2/3 RETOUCH를 포함한 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-continuity-r3/`, 정확 동작 지표는 `r3-posed-metrics.json` |

## 2026-10-11 같은 장면의 꼬리·임팩트 시퀀스 r4 (동결 이력)

[시퀀스 r4 정본](FDG_TAIL_SEQUENCE_20261011.md)을 따른다. r3 mesh·weights는 재사용하고 r3의4개 검사·자료 및 r2의14개 검사·전체 저장 증거는 동결 이력으로 보존했다. 이번 단위는 같은 FDG scene owner clock의 명시 저작 연출이며 native 전투 적용이 아니다.

| 항목 | r4 당시 계약 / 증거 |
|---|---|
| authored 입력 | `fdg-hell-aberrant-tail-sequence-r4`, compact807933bytes. r3 body inline701016bytes·3864정점/4850삼각형/32본은 그대로이며 sequence ID=`hell-aberrant-tail-swipe-impact-r4`, nodeId=`hell-body-node` |
| 본체 / atlas | ENGINE_AUTHORING의 `tail-swipe-once` 3초/24FPS + 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png`, 640px셀/6×4/24frames/16FPS/1.5초 non-loop. 자연치수3840×2560, scale0.25/anchor[0.5,0.5]/offset[-72,-84] world px. body·map·camera·source PNG는 그대로이며 초기 offsetY0의 하단 잘림 증거를 보존 |
| 단일 owner clock | 1/60초·max delta0.25초·max substeps6·pool1024 유지. startTime0.900초의 crossing에서 activation당1회 sheet 발동, trigger 틱 age0/frame0. pause는 전체 clock 고정, Stop은 bound node만 hold. replay/clip/seek가 이미 발동한 FX를 자르지 않으며 `age+1e-9>=frames/fps` 자기 만료. native single-hit/attack ticket·시간 환산·전투 적용0 |
| 실제 공개 관측 | 53틱0.883초/event0/FX0 →54틱0.900초/event1/FX1/age0/셀 표시1/24. 실제 재생73JPEG/7.781461초 CDP elapsed, GIF960×540/7930ms; 캡처 중 runtime/pose/clock/frame 강제 변경·합성0. 본체3.000초 끝 pose 유지·FX0·자동 loop0. 이전 FX를 보존하는 replay/clip 변경·Stop 뒤87틱 셀24/90틱 FX0은 정본의 별도 공개 기록 |
| 새 자기 저장 / 검사 | 1.3000000000000003초 본체·FX age0.400/event1에서 새 자기 저장·재열기 정확1회. before/after export 전체 JSON deepEqual true, resources/sequence/map/camera는 최종 fixture와 동일. 재열기 pose1.300/ready·activation0/event0/FX0/clock0, transient JSON field0. backend 첫8/8 PASS·첫 JS구문8/8 PASS, 선택값 보정 후 필요한 panel/studio만2/2 구문 확인; 기존4/14/전체 저장 재수행·합산0. 공개 두 수집 범위 warn/error0 |
| 최종 cache / UI | 공개 `index.html?v=tail-sequence-r4-complete`, `studio.js`·`rig-scene-panel.js` query=`tail-sequence-r4-complete`; runtime/schema chain=`tail-sequence-r4-final`; fixture fetch=`tail-sequence-r4-fixture-final`. bind→Replay 선택값은 실제 tail-swipe-once와 seek max3초를 표시, authored rewrite0. 새 저장 왕복 반복0 |
| 시각 / 정본 | 이번 승인 body+실제 atlas의 제한된 같은 장면 sequence VISUAL PASS / 전체 모델 VISUAL VERDICT: RETOUCH. 단1개 잔여는 hidden rear/leg·right-hand 뒤 꼬리의 독립 source surface SOURCE_GAP. full3D·본편 전투·Windows/GPU 성능으로 승격하지 않는다. 정확 API·crossing·clear·저장·시각 증거는 r4 정본과 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/` |

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
| 별도 authored rig | `tools/fdg-studio/fixtures/dark-druid-normal-body.rig.json`, rig `dark-druid-normal-body-r1`/skeleton `dark-druid-visible-skeleton`/mesh `dark-druid-visible-mesh`. 기존 standalone riglab 기본 Hell r3 preset은 동결 |
| 실제 weights/연결 | 19개Druid 맞춤본·UV alpha silhouette, 정점 최대3influences/합1. leftHand와 staff sourcepivot[77,242]·staff parentleftHand/translation0/rotation0/track0; boot본 root자식·animatedfalse |
| 기존 엔진 범위 | XYZ CPU LBS/UV texture/faceColors와 clip 보간/전환을 사용; auto weights/외부import/PBR/GPU/전체 숨은3D/본편 적용 미완료 유지 |
| 실제 소비 검수 | 실제 공개 정면yaw0/pitch0 textureDraws4622/authoringDraws0; yaw±22°/pitch6° textureDraws4622/authoringDraws22. 단면은 기존 flat fill, 원화앞면 tint/stroke0·새texture/renderer/GPU/PBR0; 신규5범위 최종 PASS: 최초3 PASS/2 harness FAIL(−0/0 JSON canonical 비교·Canvas stub ellipse 누락), 실패2만 수리 후2 PASS. 최초성공3 재실행0·기존 suite0·production fault0. 새 구문3대상(builder/studio/panel) PASS |
| 현재 판정 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 실제 clip 데이터 | 19본/3289정점/4644삼각형·topology/UV/weights/material·승인355×541 PNG·idle2초/24FPS/10tracks×9keys는 r1과 동일. 이번은 기존attack의T/R키만 수정; schema/runtime/renderer/backend/native/map/FX 변경0; 공통 spine→chest→arms 힘 전달; peak chest inheriteddrive[0.13949758129408563,−0.19533373811731902,0]model, staffworldrotation−0.05000000000000001rad. headlocalT 보정 + headlocalZ=leftUpperArm+leftForearm+leftHand의Z로 10key에서 head/staff skin 일치; staff독립track0·childhand T/R0·weights수정0 |
| 현재 geometry권위 | 원화uv·손/지팡이공유행렬·root자식장화·19맞춤본보존. hard/softweight후보는최종반영0; GPU/외부import/자동weights/PBR/새source0 |
| 독립 lab | standalone Hell기본preset 동결; 수정Druidstandalone rig703113B는같은sceneinline rig의r2배송사본 |
| 인수 | 신규 test/fdgDarkDruidStaffReadability.test.mjs 최초2/2PASS(948.8295ms), fail/cancel/skip0·재실행0. r1/Hell/old suite0·기존geometry/Canvas audit0; 새syntax studio/builder 각1회PASS(2대상). technicaltest를visualPASS로승격0; 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.
