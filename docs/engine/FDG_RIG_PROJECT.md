# FDG 3D 리그·스킨 제작 프로젝트 계약

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

기준일: **2026-10-11 / Asia·Seoul**. `engine/fdg/rig-project.js`는 독립 리그 제작 데이터·검증·Undo 이력을 정의한다. 기본 시험체는 깊이가 있는 직사각 링 메시와3개 계층 본, 정점별 수동 지정 가중치로 이루어진 **일반 엔진 검증 모델**이다. 같은 `rigVersion:1`에 선택 UV·원본 이미지 텍스처·삼각형 layer를 추가하여 실제 LBS 변형을 텍스처로 표시한다. 기본 시험체나 텍스처 소비를 Druid·신규3종의 게임용 모델 완료로 표시하지 않는다. 본편 `game.html`, 기존 PNG, 기존 FDG sprite 프로젝트, 제품 R과 기존 완료 suite를 변경·재검증하지 않는다.

기존 신규 캐릭터의 원화·영상과 미완료 범위는 [참고 자료 계약](FDG_CHARACTER_ASSETS.md)·[캐릭터 제작 Gate](FDG_CHARACTER_STUDIO_20261010.md)를 따른다. 해당 `modelAvailable:false`·reference-motion·RETOUCH 경계는 이 시험체로 승격하지 않는다. 계층 회전·키 보간·실제3D 선형 스키닝의 수학 구현은 [rig runtime](FDG_RIG_RUNTIME.md)이 소유한다.

## API

| export | 반환 / 동작 |
|---|---|
| `RIG_VERSION` | **1** |
| `RIG_LIMITS` | frozen 아래 한계 객체 |
| `createDefaultRigProject()` | 매 호출마다 모든 중첩 데이터가 새로 만들어진 기본 프로젝트 |
| `validateRigProject(project)` | `{ok:boolean,errors:string[]}`. 일반 malformed/비JSON/순환 입력은 error 반환; 입력 변경0 |
| `new RigProjectStore(project)` | 유효 프로젝트의 깊은 복사로 독립 이력 시작; 무효 입력은 TypeError |

이 모듈에는 DOM·Canvas·파일·네트워크·외부 생성 API 접근과 자동 가중치 알고리즘이 없다. 클립 평가·재생 clock·렌더링·localStorage는 호출자 책임이다.

## 데이터 구조

```js
{
  rigVersion: 1, id, name,
  skeleton: {
    id,
    bones: [{ id, name, parent: null | boneId,
      translation: [x,y,z], rotation: [x,y,z] }],
  },
  mesh: {
    id, skeletonId,
    vertices: [[x,y,z]], triangles: [[a,b,c]],
    weights: [[{ boneId, weight }]],
    uvs: [[u,v]],             // optional; vertex마다1개
    drawOrder: [integerLayer], // optional; triangle마다1개
    faceColors: [null | "#rrggbb"], // optional r7; triangle마다1개
  },
  materials: [{ id, name, meshId, skeletonId, color: '#rrggbb',
    texture: { src, width, height }, // optional; color는계속필수
  }],
  clips: [{ id, name, duration, fps, loop,
    tracks: [{ boneId,
      keys: [{ time, translation: [x,y,z], rotation: [x,y,z] }],
    }],
  }],
  preview: {
    materialId, clipId: string | null, time, playing: false, pose: {
      [boneId]: { translation: [x,y,z], rotation: [x,y,z] },
    },
    camera: { yaw: -.65, pitch: .32, zoom: 1 }, // optional
  },
}
```

`skeleton`과 `mesh`는 각각 **단일 객체**다. materials/clips는 그 한 메시·스켈레톤의 호환 변형이다. clip에 별도 skeletonId가 없으며 모든 track이 프로젝트 skeleton의 boneId를 참조한다. 구조가 유효해도 캐릭터 정체성·옷·모델 완성도를 자동 판정하지 않는다.

## 좌표·회전·스키닝 계약

| 항목 | 정확한 계약 |
|---|---|
| 공간 | 오른손 좌표, +X오른쪽 / +Y위 / +Z앞. 모델 단위이며 본편40px 타일·스프라이트 px와 자동 변환하지 않음 |
| 배열 | translation/vertex `[x,y,z]`, rotation Euler radians `[x,y,z]` |
| Euler | intrinsic XYZ, `R=Rx×Ry×Rz`, quaternion `[x,y,z,w]` |
| 행렬 | column-major16, column vector. translation은index12/13/14 |
| 바인드 본 | 부모 로컬의 `T(bind.translation)×R(qbind)` |
| posed translation | `bind.translation + clip.translation + manual.translation` |
| posed rotation | `normalize(qbind×qclip×qmanual)`; Euler성분 단순 덧셈이 아님 |
| offset 의미 | clip/preview.pose는 bind-relative. translation은 parent-local, rotation은 bind 회전 뒤·클립 뒤 순서로 곱함 |
| 정점 원본 | 바인드 **모델 공간** 좌표. 본 로컬 정점으로 저장하지 않음 |
| 가중 본 변환 | `posedWorld×inverseBindWorld` |
| 실제 LBS | `v'=Σ(weight/sum)×posedWorld×inverseBindWorld×[v,1]`; math 모듈에서 계산, 이 validator는 입력만 검증 |
| 저장 가중치 | 수동 데이터 원값 보존. 합의 허용 반올림은 수학 평가에서만 정규화 |
| 카메라 | yaw/pitch radians, zoom배율. mesh/bone 바인드 좌표를 변경하지 않음 |

키 translation은 선형, 키 rotation은 Euler→quaternion 최단 slerp로 보간한다. 수동 pose는 클립 평가/클립 간 전환 뒤 한 번 적용한다. 정확한 평가·전환 API와 경계값은 [FDG_RIG_RUNTIME.md](FDG_RIG_RUNTIME.md)를 따른다.

## 수치·참조 검증

| 필드 / limit | 허용 값 / 검사 |
|---|---|
| ID/이름 | 각각1~120자, 공백만·제어문자 불가. ID는 dictionary 예약 `__proto__`, `prototype`, `constructor` 거부 |
| ID 고유성 | bones/materials/clips 각각 그룹 내 고유. 다른 그룹의 ID namespace는 분리 |
| `skeleton.bones` / `bones` | **1~64**개; parent는null 또는 기존 본 ID |
| 본 구조 | 자기 부모·부모 참조 누락·cycle 거부. out-of-order 배열과 여러 root의 acyclic forest 허용 |
| `mesh.vertices` / `vertices` | **1~4096**개, 각3성분 |
| `mesh.triangles` / `triangles` | **1~8192**개; 각3개의 서로 다른 정수 index, `0≤index<vertices.length` |
| `mesh.uvs` | optional. 있으면 vertices와 정확히 같은 개수, 각2성분 `[u,v]`가 finite **0..1**. 원 이미지 좌상단0/0, 오른쪽+U·아래+V |
| `mesh.drawOrder` | optional. 있으면 triangles와 정확히 같은 개수, 각 값은 **−8192..8192** 정수. 생략하면모든layer0 |
| `mesh.faceColors` | optional r7. 있으면 triangles와 정확히 같은 개수. 각 항목은 null 또는 대소문자 허용 RGB6hex `#rrggbb`; null은 기존 material/UV, 명시 색은 ENGINE_AUTHORING flat face. sparse slot·무효 색/길이 거부 |
| `mesh.weights` | vertices와 정확히 같은 개수. 각 vertex에 별도 influence 배열 |
| `influences` | vertex당 **1~4**개; 기존 boneId·bone중복 없음·finite `0<weight≤1` |
| `weightTolerance` | **1e-6**, `abs(sum−1)≤1e-6` |
| `mesh.skeletonId` | 단일 skeleton.id와 일치 |
| `materials` | **1~64**개; material.meshId/skeletonId는 해당 mesh/skeleton과 정확히 일치 |
| `material.color` | RGB6자리 hex `#rrggbb`, 대소문자 허용; texture가 있어도 **필수**. 색 필드의 알파·PBR 지원 없음 |
| `material.texture` | optional `{src,width,height}` 객체. 있으면 `mesh.uvs` 필수; 같은 프로젝트에서 동일src의 선언치수 일치 |
| `texture.src` | **1..2048자** 로컬 상대/루트 상대 HTTP 경로. 실제 공백·ASCII control/DEL·역슬래시·protocol·`//` prefix 거부. query/fragment를 제외한 경로의1회percent decode 뒤 `.`/`..` segment·역슬래시 거부. malformed escape 거부 |
| `texture.width/height` / `textureDimension` | 각 정수 **1..4096px**, `RIG_LIMITS.textureDimension=4096`. 로드 뒤 실제 natural치수 정확일치는 renderer/owner의 별도 검사 |
| `clips` | **1~32**개, 각duration은finite `>0`(별도 상한 없음) |
| clip FPS | finite **1~120**, 소수 허용. 실제 key 개수·셀24장을 강제하지 않음 |
| clip loop | boolean |
| `tracks` | clip당 **1~64**개; 기존 boneId, 같은 clip 내 bone track중복 금지 |
| `keys` | track당 **2~256**개; key translation/rotation 모두 필수 |
| key time | finite `0≤time≤duration`, 엄격히 증가, 첫 key는정확히0 |
| loop 끝 | loop=true의 마지막 key time은정확히duration. 끝/처음 회전·이동의 같음이나 미술적 자연스러움은 자동 강제하지 않음 |
| nonloop 끝 | 마지막 key가duration보다 이르면 그 마지막 포즈를 유지할 수 있음 |
| `coordinate` | bind/key/manual translation 및 vertex 각각finite **±10000** |
| `rotation` | bind/key/manual Euler각 각각finite **±100π radians** |
| preview material | 기존 호환 materialId 필수, 자동 다른 material 선택 없음 |
| preview clip | 기존 clipId 또는**null**(애니메이션 offset0인 bindpose); 수동pose는계속 적용 |
| preview time/playing | finite time≥0; playing은boolean, 기본false. 저장/재생 UI는별도 |
| preview pose | boneId별 객체, 기존 본만. 각 값에translation/rotation3성분 모두필수. 빈`{}` 허용 |
| preview camera | optional; 있으면 yaw±π, pitch±π/3, zoom**.5~2** 전부finite·필수 |
| `fileBytes` | **2,097,152 bytes=2MiB**, compact UTF-8 JSON 직렬화 기준. import UI는 실제 입력 파일 byte도별도 확인 |
| JSON 저장 | 일반 JSON 객체/배열/값. 함수·undefined·Symbol·BigInt·비finite 수치·Date/Map 등 클래스·cycle은 거부. 직렬화 전 descriptor 검사로 `toJSON` 함수 실행도 거부 |

이 검증은 삼각형 index와 기본 시험체 topology의 기술 구조를 다룬다. 모든 사용자가 편집한 메시의 watertight·자기교차·기하 면적·인체 비율·미술 완성도를 검사하는 알고리즘은 아니다. 큰 배열은 group 한계를 넘으면 해당 배열의 세부 검증을 건너뛰고 오류를 반환한다.

스프라이트 신규 캐릭터 콘텐츠의 사용자 목표 **24장·24FPS**는 그대로다. 일반3D 엔진 clip의 키 개수·보간 FPS가 다르게 저장될 수 있다는 계약을 해당 신규 캐릭터의 완료나 기존24셀 요구 완화로 표시하지 않는다.

## 기본 시험체·프리셋

| 항목 | ID / 실제 데이터 |
|---|---|
| 프로젝트 | `fdg-rig-probe` / FDG · 3D 리그·스킨 시험체 |
| skeleton/mesh | `probe_skeleton` / `probe_mesh` |
| root | parent null, translation `[0,0,0]`, rotation0 |
| spine | parent root, translation `[0,1,0]`, rotation0 |
| head | parent spine, translation `[0,1,0]`, rotation0 |
| 링4개 | y=`[0,1,2,3]`; X반폭=`[.5,.55,.45,.35]`; Z반폭=`[.4,.4,.35,.3]` |
| 정점 | 각링 `[-w,y,-d]`,`[w,y,-d]`,`[w,y,d]`,`[-w,y,d]`, 총**16**개 |
| 면 | 링간12quads→24triangles + 바닥2 + 윗면2 = **28triangles**, 외부 winding의 닫힌 입체 |
| ring0 가중치 |4정점 각각 root1 |
| ring1 가중치 |4정점 각각 root.4 / spine.6 |
| ring2 가중치 |4정점 각각 spine.6 / head.4 |
| ring3 가중치 |4정점 각각 head1 |
| material iron | 철빛, `#91abbf`, 같은 mesh/skeleton |
| material ember | 잿불빛, `#cb6646`, 같은 mesh/skeleton |
| clip sway | 좌우 흔들림, duration**2초**, **24FPS**, loop=true; spineZ `−.35,+.35,−.35` at`0,1,2초` |
| clip bow | 숙이기, duration**1.5초**, **30FPS**, loop=false; spineX `0,.55,0`, headX `0,.2,0` at`0,.75,1.5초` |
| clip translations | 모든 기본 key `[0,0,0]` offset |
| preview | iron/sway/time0/playingfalse/pose`{}`; camera yaw−.65/pitch.32/zoom1 |

가중치는 링별로 **명시적으로 지정한 수동 프리셋**이며 거리에 따른 자동 skin-weight 생성·자동 리깅의 결과가 아니다. 철빛/잿불빛은 동일 메시의 단색 material variant이며 별도 옷·갑옷 모델이나 다른 topology의 교체가 아니다.

## 편집 이력·저장 인수

| `RigProjectStore` API | 계약 |
|---|---|
| `.project` | 중첩 snapshot 깊은 복사, 외부 변경은 내부 프로젝트에 전달하지 않음 |
| `.canUndo`, `.canRedo` | 이력 여부boolean |
| `.change(label,mutate)` | 복사한 next를 mutate→검증→replace; 변경 적용true/no-opfalse |
| `.replace(project,label?)` | 유효 데이터만 적용, 기본 label은리그 프로젝트 불러오기; 동일JSON은false |
| 무효 입력 / mutate throw | 기존 project·past·future·changed event 보존; 오류 throw |
| 이력 상한 / `history` | 최근**80작업**. 성공한 편집/불러오기만 기록 |
| `.undo()`, `.redo()` | 성공true, 이력없음false; snapshot변경 이벤트1개 |
| branch | Undo뒤 새 유효 변경은오래된redo 제거. no-op/실패는redo 보존 |
| `.signals.on('changed',callback)` | `{project,label}` snapshot 전달, unsubscribe함수 반환. 기존Signals API 공유 |
| `.dispose()` | 해당 store listener 제거; renderer/clock/DOM 수명 정리는호출자 |

bone 이름·부모·bind fields, 정점·가중치·선택UV/drawOrder, material색·선택texture 선언, clip·key·수동pose·camera는 이 JSON에 저장된다. 선택·실행 중 transient clock과 clip transition·뼈 표시 `showBones`는 제작 UI가 관리한다. `showBones`는 새 저장 필드가 아니다. 세이브 슬롯·기존 FDG sprite 파일과 별도이며 이 모듈은 저장키나 외부 파일을 직접 읽지 않는다.

## 검증과 미구현

2026-10-10 `node --test test/fdgRigProject.test.mjs`: **36/36 PASS**, 실패0/skip0의 동결 이력이다. 이번 UV·texture 추가에서 기존 suite를 재실행·합산하지 않았다. 새 한정 `test/fdgRigTexture.test.mjs` **8/8 PASS**는 [텍스처 계약의 별도 검증표](FDG_RIG_TEXTURE_RUNTIME_20261011.md)를 따르며 UV/texture 경계·LBS·renderer·소유자 수명을 검증한다. 실제 승인 이미지·모션 브라우저 판정은 root의 별도 제작 증거다.

| 검증 | 범위 |
|---|---|
| 실제기본입체 |16정점·28면·양의signedvolume·모든edge2faces, 링별 수동weights·본계층·2material·2clip수치 |
| 구조/참조 |malformed·ID중복/예약키·forest/out-of-order·cycle·좌표bound·mesh/material호환·index/weight한계 |
| 클립/preview |variableFPS·키0/증가/duration·loop끝·nonloophold·256key/64tracks·nullbindpose·수동offset·camera |
| 데이터/이력 |factory/snapshot/event 깊은 복사·UTF-8 2MiB·비JSON/cycle/toJSON함수 실행0·invalidtransaction·staleversion·no-op·redo분기·history80·unsubscribe/dispose·JSON저장재열기 |

| 항목 | 상태 / 범위 |
|---|---|
| 일반 시험체 데이터·검증·Undo | 구현·위36개 검증 완료 |
| 계층 회전·continuous key 평가·clip 전환·LBS | math 작업자가 별도 구현/검증, [정본](FDG_RIG_RUNTIME.md) |
| 제작 UI·3D→2.5D 투영·저장·재열기 | root소유. 실제 브라우저 판정과제한은해당 제작 보고서에 기록 |
| 자동 본/가중치 알고리즘, 모델 import | **미구현** |
| 선택 UV·texture·drawOrder | **구현**. 위 스키마와 CPU Canvas 삼각형 소비, 기존 색문서 호환. [정본](FDG_RIG_TEXTURE_RUNTIME_20261011.md) |
| PBR·cloth·갑옷 topology교체 | **미구현** |
| 신규3종 character 모델·rig·8방향전투 | **미완료**, 기존 reference-motion/RETOUCH 유지 |
| 본편 adapter·GPU skinning·실제기기 성능 인증 | 이번 계약의완료 범위에 포함하지 않음 |

코드 변경 뒤 docs전체를 `rg`와 규칙의 `grep -r -l -E '리그|리깅|스킨|skeleton|skin.weights|rigVersion|바인드|가중치' docs/`로 검색했다. 새 데이터/API/계획은 이 문서에 기록하고 root가 관련 기존 엔진·제작 문서의 구현상태를 동기화한다. 보호 패링 문서와 제품 R은 수정하지 않았고 commit하지 않는다.

2026-10-11 동기화에서는 docs전체를 `rg`와 literal `grep -r`로 `uvs|drawOrder|UV|texture|showBones|requiredSources|validateReady` 검색했다. 수정 전6문서 백업은 `tmp/fdg-rig-texture-20261011/backup/`에 보존한다. HellAberrant의 원본 PNG를 쓰는 저작 fixture는 **ENGINE_AUTHORING·보이는 표면2.5D**이며 가려진 면 복원·본편 전투 적용·완전3D 모델 승인 자료가 아니다. fixture와 새 실제 모션 증거는 root의 별도 인수 문서에서 기록한다.

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


### r7 ROI·단면·side segment의 정확한 정의

`TORSO_POLYGONS`는 source pixel XY 영역이며 `TORSO_RINGS`의 각 행은 `[sourceYpx,centerXpx,radiusXpx,depthModel]`이다. y<432 또는 y>736이거나 두 ROI 밖이면 Z=0. 나머지는 양옆 ring의 center/radius/depth를 y에 따라 선형 보간하고 `Z=depth(y)×max(0,1−((sourceX−centerX(y))/radiusX(y))²)`를 적용한다. 실제 mesh의 최댓값과 ring의 최고 목표0.30model을 구분한다. 이후 shared seam 고정 및 T-junction 선형 보간 제약을 적용한다.

| `TORSO_POLYGONS` 영역 | source XY px 좌표의 정확한 순서 |
|---|---|
| chest ROI | `[[355,415],[400,386],[448,373],[508,363],[553,393],[585,438],[594,493],[584,551],[568,592],[542,631],[495,660],[454,655],[423,623],[388,598],[357,566],[334,523],[319,479],[322,451]]` |
| pelvis ROI | `[[431,633],[530,650],[548,690],[519,721],[445,725],[405,699]]` |

| source Y px | center X px | radius X px | depth model |
|---:|---:|---:|---:|
| 432 | 470 | 145 | 0.06 |
| 464 | 470 | 150 | 0.26 |
| 528 | 480 | 150 | 0.3 |
| 592 | 480 | 110 | 0.2 |
| 632 | 480 | 75 | 0.12 |
| 664 | 480 | 70 | 0.18 |
| 704 | 477 | 60 | 0.2 |
| 736 | 470 | 50 | 0 |

동일 UV pixel을 `round(component×10000)` key로 묶는 것은 분석 단계이며 원 front topology·weights를 다시 용접하거나 분할하지 않는다. source 선분 위 collinearity는 tolerance0.0001px, 내부점 판정은 `1e−8<t<1−1e−8`. 공유 limb 중간점이 고정이면 해당 coarse edge 끝점도 Z=0으로 고정한다. 고정되지 않은 middle만 `Zmiddle=Za×(1−t)+Zb×t`를12passes로 맞춘다. 양의 깊이가 `>1e−10`인 torso 원 정점57개를 변경한다.

| part / 순번 | 원 front vertex pair | 새 rear vertex pair | 새 face indices | 색 / rear Z model |
|---|---|---|---|---|
| chest/1 | `[1509,1512]` | `[3864,3865]` | `[4850,4851]` | `#756871` / -0.18 |
| chest/2 | `[1209,1210]` | `[3866,3867]` | `[4852,4853]` | `#756871` / -0.18 |
| chest/3 | `[1210,1265]` | `[3867,3868]` | `[4854,4855]` | `#756871` / -0.18 |
| chest/4 | `[1265,1270]` | `[3868,3869]` | `[4856,4857]` | `#756871` / -0.18 |
| chest/5 | `[1270,1276]` | `[3869,3870]` | `[4858,4859]` | `#756871` / -0.18 |
| chest/6 | `[1276,1280]` | `[3870,3871]` | `[4860,4861]` | `#756871` / -0.18 |
| chest/7 | `[1280,1391]` | `[3871,3872]` | `[4862,4863]` | `#756871` / -0.18 |
| chest/8 | `[1391,1395]` | `[3872,3873]` | `[4864,4865]` | `#756871` / -0.18 |
| chest/9 | `[1395,1400]` | `[3873,3874]` | `[4866,4867]` | `#756871` / -0.18 |
| chest/10 | `[1400,1404]` | `[3874,3875]` | `[4868,4869]` | `#756871` / -0.18 |
| chest/11 | `[1404,1524]` | `[3875,3876]` | `[4870,4871]` | `#756871` / -0.18 |
| chest/12 | `[1524,1528]` | `[3876,3877]` | `[4872,4873]` | `#756871` / -0.18 |
| chest/13 | `[1528,1532]` | `[3877,3878]` | `[4874,4875]` | `#756871` / -0.18 |
| pelvis/1 | `[1644,1645]` | `[3879,3880]` | `[4876,4877]` | `#665b65` / -0.12 |
| pelvis/2 | `[1646,1654]` | `[3881,3882]` | `[4878,4879]` | `#665b65` / -0.12 |
| pelvis/3 | `[1654,1656]` | `[3882,3883]` | `[4880,4881]` | `#665b65` / -0.12 |
| pelvis/4 | `[1656,1657]` | `[3883,3884]` | `[4882,4883]` | `#665b65` / -0.12 |
| pelvis/5 | `[1655,1681]` | `[3885,3886]` | `[4884,4885]` | `#665b65` / -0.12 |
| pelvis/6 | `[1682,1694]` | `[3887,3888]` | `[4886,4887]` | `#665b65` / -0.12 |
| pelvis/7 | `[1693,1932]` | `[3889,3890]` | `[4888,4889]` | `#665b65` / -0.12 |
| pelvis/8 | `[1698,1700]` | `[3891,3892]` | `[4890,4891]` | `#665b65` / -0.12 |
| pelvis/9 | `[1699,1936]` | `[3893,3894]` | `[4892,4893]` | `#665b65` / -0.12 |

위22개 atomic boundary만 명시 압출한다. 각 segment `[ai,bi]`의 rear `[ar,br]`로 `[ai,br,bi]`·`[ai,ar,br]` 두 면을 추가한다. 임의 region 경계 전체를 압출하거나 전체 뒷면을 닫지 않는다. rear UV는 선언의 정점별 길이를 유지하기 위한 원 front UV 복사이며 새 면은 `faceColors`의 flat fill을 소비하므로 숨은 원본 texture를 복원하지 않는다.

`provenance.depthAuthoring`은 원 개수·frontVertexIndices·sharedSeamsZ·ringsSourcePx·roiSourcePx·sourceTolerancePx·continuityPasses·continuityConstraintCount·maxContinuityError·sideColors·rearDepthModel·sideSegments와 위 권위 boolean을 기록한다. 기존 저장 JSON/unknown metadata 보존 경로를 사용하며 새 native 전투·맵 스키마 권위가 아니다.

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
### r8 rear taper와 facewise 톤의 정확한 정의

`SIDE_FINISH_RINGS`의 행은 `[sourceYpx,factor]`다. sourceY는 `1140−modelY×300`이며 첫 ring 이하·마지막 ring 이상은 해당 끝 factor로 clamp, ring 사이는 `fa+(fb−fa)×(sourceY−ya)/(yb−ya)`로 선형 보간한다. 모든31rear 정점을 평가하되 실제 값24개만 바뀌고 factor1인7개는 r7과 같다. 원앞면3864정점의 XYZ는 변경하지 않는다.

| part | sourceY px | factor |
|---|---:|---:|
| chest | 432 | 0.68 |
| chest | 464 | 0.88 |
| chest | 512 | 1 |
| chest | 560 | 1 |
| chest | 592 | 0.9 |
| chest | 624 | 0.72 |
| pelvis | 640 | 0.72 |
| pelvis | 656 | 0.92 |
| pelvis | 688 | 1 |
| pelvis | 704 | 0.9 |
| pelvis | 720 | 0.68 |

| `SIDE_FINISH_TONES` part / role | base RGB | 정확한 적용 |
|---|---|---|
| chest / front | `[40,34,37]` | 기존 segment.faces의 첫 side triangle |
| chest / rear | `[29,26,29]` | 기존 segment.faces의 둘째 side triangle |
| pelvis / front | `[34,30,33]` | 기존 segment.faces의 첫 side triangle |
| pelvis / rear | `[25,23,26]` | 기존 segment.faces의 둘째 side triangle |

여기서 front/rear는44개 저작 side 면의 역할이며 원 PNG 앞면의 재질을 바꾸는 뜻이 아니다. segment.front의 두 sourceY 평균으로 factor를 구한 뒤 각 RGB 성분 `round(base×(.9+.1×factor))`를2자리 hex로 변환한다. 현재44면의 실제 색10종은 `#181619, #181719, #19171a, #1c191c, #1d1a1d, #211d20, #221e21, #272124, #272224, #282225`다. 정상 음영이나 source light를 복원한 값이 아니라 plain fill 저작 추정값이다.

| 배송 / 메타데이터 | 정확한 값·보존 근거 |
|---|---|
| scene SHA256 | `49ee20af6ea78db697440c8bedcd5fa760f5df898d0aeda2ec9b98890c1ace03` |
| rig SHA256 | `b6be4301ae9ebccf363b175325714dd0b2ac95c194cc024881dc373e5eb34b8c` |
| 입력 검증 | depthAuthoring.revision=r7·sideSegments22 필요. 같은 rear index의 part가 충돌하면 throw. 원 sideSegments/front/rear/face index는 r7 그대로 |
| `provenance.sideFinish` 권위 | authority=`ENGINE_AUTHORING`, revision=`r8`, inputRevision=`r7`, sourceRecovered=false. ringsSourceY/paletteRGB/toneFactorFormula 기록 |
| rear records | `rearVertices`31개 `{index,part,sourceY,originalZ,factor,z}`. 배송 manifest에 실제 index/값 저장; 원 rear XY/UV/weights 보존 |
| face records | `faceTones`44개 `{index,part,role,sourceY,toneFactor,color}`. index는 기존 side face, source face4850개의 null 보존 |
| 변경 경계 | frontSurfaceChanged=false, sideFacesRemoved=0, textureChanged=false, rendererChanged=false, nativeCombatApplied=false. 기존 depthAuthoring은 r7 설계 이력으로 보존하고 현재 rearZ/색은 sideFinish를 따른다 |
| CLI | 입력은 동결 `hell-aberrant-torso-depth.fdg.json`. 기본 출력 `tmp/hell-aberrant-torso-side-finish-r8`, `FDG_SIDE_FINISH_OUTPUT`으로 변경 가능. source PNG 읽기0/수정0, 별도 두 fixture 출력 |

## 2026-10-11 다크드루이드 NORMAL · 보이는 본체 저작 r1

기존 Hell r2..r8의 ‘현재/현행 배송’·수치·proof는 해당 보스의 동결 이력이다. 아래는 별도 다크드루이드 NORMAL authoring query의 새 첫 사본이다. 기본 Hell preset·standalone riglab 기본값·본편 NORMAL/데모 피날레·마케팅/트레일러 계약은 바꾸지 않는다. 기존 보편 API와 schema 한계는 유지하며 이 사본의 명시 clip/returnTo 설정만 적용한다.

| 항목 | 현재 다크드루이드 저작 계약 |
|---|---|
| 승인 source / 실제 사본 | 기존 `boss_dark_druid_f0.png`, 355×541 RGBA / 479258B. `ENGINE_AUTHORING` visible-surface-2.5D, 3289정점/4644삼각형/19본/1재질/2clips. 원화1장을 UV texture로 소비하며 새24장 방향별 sprite로 계산하지 않음 |
| 실제 동작 / 시간 | `dark-druid-idle` 2초/24FPS/loop/10tracks×9keys → `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×9keys → idle. 공개 clip 선택 entry0.25초=15owner틱; `returnTo.transitionSeconds=0.35`=21owner틱. 같은60Hz owner 사용 |
| 현재 IDs | rig `dark-druid-normal-body-r1` / skeleton `dark-druid-visible-skeleton` / mesh `dark-druid-visible-mesh` / material `approved-dark-druid` |
| geometry counts | front3276정점/4622삼각형 + rear13정점/11segments×2flatfaces =3289정점/4644면. source355×541 RGBA,alpha≥32 mask127418px; sourceImageModified:false/fullBackAuthored:false |
| 좌표 / 깊이 | 150sourcepx/model unit,origin[221,526]; model=[(x−221)/150,(526−y)/150,z]. staff/leftHand Z0.035,bootsZ0; 나머지 Gaussian Z와 rear−0.055는 ENGINE_AUTHORING 추정 |
| 현재 소비/한계 | 기존rigVersion1·2MiB/scene4MiB·bones≤64/vertices≤4096/triangles≤8192·UV0..1·color필수·faceColorsnull/RGB6 unchanged. 정점weights 최대3·합1; CPU XYZ LBS |
| 실제 판정 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [이 문서의 아래 저작 데이터 표](#source배송경계-정의)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

### source·배송·경계 정의

| 항목 | 현재 다크드루이드 저작 계약 |
|---|---|
| source path | `assets/sprites/boss/boss_dark_druid_f0.png`; 승인 migration 원본은 read-only, 기존 engine checkout 동일파일을 HTTP소비 |
| source bytes/SHA256 | 479258B / `74060fc68eb5f6dd76771272e973b2c5038e2939286c411cb2bc9a5bbcf0fa68` |
| scene bytes/SHA256 | 807893B / `edc822f14c223e7841595273e5a829fc21907e91618c355a07b343f3f0baaaea` |
| standalone rig bytes/SHA256 | 701679B / `51efdf004ec43d3f0a2554fbe0bf9acf7fa3c3cd5fb75f267f982671098a6ade` |
| 실제 export pair bytes/SHA256 | 각2766448B / `e7cc1a34c32963126dfd4be584faa6c1706d26d2693d17ffcf3a645c3ecb7034` |
| alpha / 정합 | alpha≥32, visiblePixels127418; macroCell16/leafCell8/thinLeaf4/edgeIterations12/sourcePrecisionPx0.0001; refinedTriangles131/insertedEdgePoints166/conformingEdgeTolerancePx0.00005; 기존UV정점 공유·새정합UV정점추가0 |
| 샘플링 분기 | 빈cell 제외; filled===total & ring모두mask면직접fan; size>8 또는 size>4 & center/ring mask없음이면half4분할; 남은cell은 center+ring의4triangle을alpha경계clip. 위치소수4자리round; emit abs2Dcross<0.001px² 면 제외 |
| source inverse / area | max8.788928253162695e-14px; frontUVarea127719.06008673979px²/mask127418=1.0023627751710102. 면적비는 원화 미술 인수값이 아님 |
| Z 공식 | `z=0.11*exp(-((x-225)/65)^2-((y-224)/95)^2)+0.035*exp(-((x-134)/35)^2-((y-226)/50)^2)`; sourcepx x/y, modelunit z. staff/leftHand는0.035,boots0; 모든나머지part에Gaussian적용. bonebindmodelZ0 |
| material | `approved-dark-druid`, `color:#b1a28f`, texture source355×541. 앞면4622 faceColorsnull, 뒤22 RGB6. 원화에 tint/newtexture0 |
| layer / 분류 | layer는triangle sourcecentroid의part로선택. part 우선순위 leftHand→staffCrown|staffShaft→leftBoot→rightBoot→leftSleeve→rightArm→y<154 head→coatFront→coatLeft→coatRight→y>292 coatBack→body |
| drawOrder | `{coatBack:-2,coatLeft:-1,coatRight:-1,body:0,leftBoot:1,rightBoot:1,coatFront:2,head:3,leftSleeve:4,rightArm:4,leftHand:5,staff:6}`; side4 |

### source ROI 10개

| ID | sourcepx polygon, 배열 순서 그대로 |
|---|---|
| `staffCrown` | `[[52,24],[73,43],[91,59],[103,89],[103,133],[87,160],[73,185],[49,177],[27,154],[9,121],[6,81],[25,55],[39,42]]` |
| `staffShaft` | `[[51,168],[66,162],[77,201],[87,250],[93,309],[104,377],[116,448],[130,531],[120,538],[109,458],[95,388],[84,320],[70,265],[62,215],[47,184]]` |
| `leftHand` | `[[65,216],[82,219],[91,231],[88,249],[96,267],[80,277],[65,260],[61,240]]` |
| `leftSleeve` | `[[156,179],[171,207],[150,250],[127,285],[100,304],[85,281],[88,256],[111,234],[134,205]]` |
| `rightArm` | `[[288,189],[315,193],[327,221],[340,259],[348,290],[354,315],[353,348],[338,362],[326,350],[326,316],[315,287],[304,265],[295,234]]` |
| `coatFront` | `[[208,267],[238,267],[251,310],[243,380],[234,451],[222,494],[207,458],[198,386],[197,321]]` |
| `coatLeft` | `[[190,266],[210,302],[195,363],[167,428],[146,475],[113,514],[67,519],[14,495],[0,468],[59,422],[89,352],[125,291]]` |
| `coatRight` | `[[246,273],[283,287],[314,339],[354,418],[354,511],[304,515],[276,480],[259,429],[247,369],[237,313]]` |
| `leftBoot` | `[[143,476],[166,468],[178,487],[164,518],[141,533],[118,528],[122,511]]` |
| `rightBoot` | `[[270,474],[288,476],[302,501],[315,523],[305,535],[278,533],[263,511]]` |

### 맞춤 bone 19개

sourcepx 좌표에서 model좌표로 변환한 절대bind를 부모절대bind에서 빼 localtranslation을 만든다. 모든 bindrotation[0,0,0], bindZ0이다. `staff`는 leftHand와동일pivot이므로 localtranslation0이고 cliptrack이 없다.

| ID | 한글명 | parent | sourcepx bind |
|---|---|---|---|
| `root` | 발 기준 | `null` | `[221,526]` |
| `pelvis` | 허리·외투 중심 | `root` | `[222,291]` |
| `spine` | 몸통 | `pelvis` | `[221,221]` |
| `chest` | 녹색 흉곽 | `spine` | `[224,176]` |
| `neck` | 목 | `chest` | `[224,135]` |
| `head` | 해골·비대칭 가지뿔 | `neck` | `[223,112]` |
| `leftUpperArm` | 지팡이 위팔 | `chest` | `[158,187]` |
| `leftForearm` | 지팡이 아래팔 | `leftUpperArm` | `[122,233]` |
| `leftHand` | 지팡이를 잡은 손 | `leftForearm` | `[77,242]` |
| `staff` | 지팡이·뼈 장식 | `leftHand` | `[77,242]` |
| `rightUpperArm` | 오른 위팔 | `chest` | `[291,191]` |
| `rightForearm` | 오른 아래팔 | `rightUpperArm` | `[320,249]` |
| `rightHand` | 오른손 | `rightForearm` | `[341,317]` |
| `coatLeft` | 왼쪽 외투 자락 | `pelvis` | `[184,304]` |
| `coatRight` | 오른쪽 외투 자락 | `pelvis` | `[259,307]` |
| `coatFront` | 중앙 외투 장식판 | `pelvis` | `[222,294]` |
| `coatBack` | 바깥 외투 층 | `pelvis` | `[220,310]` |
| `leftBoot` | 왼쪽 장화 | `root` | `[160,490]` |
| `rightBoot` | 오른쪽 장화 | `root` | `[281,488]` |

### 명시 가중치

`clamp(v)=max(0,min(1,v))`. x/y는 sourcepx이고 1e-10 이하 weights는 저장하지 않는다. 각 정점은 공유source XY의 part 한 번으로 정하며 최대3influences/합1이다.

| 항목 | 현재 다크드루이드 저작 계약 |
|---|---|
| staff / leftHand | 해당본1; staffparentleftHand·coincidentbind·stafftrack0으로 shared skin matrix 유지 |
| leftBoot / rightBoot | 해당본1; root자식·애니track0 |
| head | t=clamp((y−132)/38); head1−t / neckt |
| leftSleeve | w=clamp((128−x)/44),s=clamp((x−145)/26); chests / leftUpperArm(1−s)(1−w) / leftForearm(1−s)w |
| rightArm | e=clamp((y−220)/75),h=clamp((y−293)/35); rightUpperArm1−e / rightForearme(1−h) / rightHandeh |
| coat* | t=0.75clamp((y−286)/110); pelvis1−t / 해당coatt |
| 나머지 upperbody | n=clamp((184−y)/42); n>0이면 neckn / chest1−n |
| 나머지 body | h=clamp((y−226)/72); spine1−h / pelvish |

### 오른팔 short side 11구간

front는 실제 silhouette edge(count1)만 허용한다. rear는 같은frontXY/UV/weights를복사하고 Z−0.055model, 면은 [a,br,b]와[a,ar,br], 순서대로 #28221f/#1b1715·layer4다. sourceRecoveredfalse/fullBackAuthoredfalse이다.

| front indices | rear indices | face indices |
|---|---|---|
| `[1636,1637]` | `[3276,3277]` | `[4622,4623]` |
| `[1637,1638]` | `[3277,3278]` | `[4624,4625]` |
| `[1638,1707]` | `[3278,3279]` | `[4626,4627]` |
| `[1707,1708]` | `[3279,3280]` | `[4628,4629]` |
| `[1708,1713]` | `[3280,3281]` | `[4630,4631]` |
| `[1713,1712]` | `[3281,3282]` | `[4632,4633]` |
| `[2037,2038]` | `[3283,3284]` | `[4634,4635]` |
| `[2043,2037]` | `[3285,3283]` | `[4636,4637]` |
| `[2042,2043]` | `[3286,3285]` | `[4638,4639]` |
| `[2045,2042]` | `[3287,3286]` | `[4640,4641]` |
| `[2046,2045]` | `[3288,3287]` | `[4642,4643]` |

### idle·strike 실제 keys

idle keyTimes=[0,0.25,0.5,0.75,1,1.25,1.5,1.75,2]초. 각 본 Z축회전(XY평면)은 amplitude×sin(πt) radians이고 X/Y회전0이다. chest만 translation[0,0.004sin(πt),0] modelunits이며 나머지 translation0이다.

| idle bone | Z amplitude radians |
|---|---|
| `spine` | `0.006` |
| `chest` | `0.009` |
| `head` | `-0.008` |
| `leftUpperArm` | `0.012` |
| `leftForearm` | `-0.01` |
| `rightUpperArm` | `-0.008` |
| `coatLeft` | `0.009` |
| `coatRight` | `-0.007` |
| `coatFront` | `0.004` |
| `coatBack` | `0.005` |

strike keyTimes=[0,0.25,0.65,0.9,1.1,1.25,1.65,2,2.4]초. 아래 배열은 같은순서의 Z회전 radians이며 X/Y0; leftUpperArm만 Ytranslation=[0,0.004,0.012,0.016,−0.035,−0.018,0.004,0,0] modelunits, 나머지translation0이다. 보간은 기존quaternion최단slerp/translation선형이고 배열의 Euler성분을 별도선형보간하지 않는다.

| strike bone | Z key array radians |
|---|---|
| `spine` | `[0,0.008,0.025,0.028,-0.018,-0.015,0.012,0.004,0]` |
| `chest` | `[0,0.006,0.02,0.024,-0.014,-0.008,0.008,0.002,0]` |
| `head` | `[0,-0.008,-0.03,-0.035,0.024,0.02,-0.01,-0.003,0]` |
| `leftUpperArm` | `[0,0.025,0.09,0.1,-0.09,-0.075,0.04,0.01,0]` |
| `leftForearm` | `[0,0.035,0.1,0.12,-0.14,-0.11,0.05,0.014,0]` |
| `leftHand` | `[0,0.008,0.02,0.025,-0.02,-0.01,0.01,0,0]` |
| `rightUpperArm` | `[0,-0.016,-0.035,-0.04,0.018,0.01,-0.008,-0.003,0]` |
| `rightForearm` | `[0,0.01,0.025,0.03,-0.016,-0.009,0.006,0.002,0]` |
| `coatLeft` | `[0,0.004,0.008,0.011,-0.008,-0.013,0.009,0.003,0]` |
| `coatRight` | `[0,-0.003,-0.006,-0.009,0.007,0.011,-0.007,-0.002,0]` |
| `coatFront` | `[0,0.002,0.004,0.006,-0.004,-0.005,0.004,0.001,0]` |
| `coatBack` | `[0,0.003,0.005,0.007,-0.005,-0.008,0.005,0.001,0]` |

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 현재수정대상 | buildDarkDruidStaffStrikeClip(): 기존공격12track의T/R배열과keyTimes10개만수정; 19본/3289정점/4644삼각형·topology/UV/weights/material·승인355×541 PNG·idle2초/24FPS/10tracks×9keys는 r1과 동일. 이번은 기존attack의T/R키만 수정; schema/runtime/renderer/backend/native/map/FX 변경0 |
| currentmetadata | provenance.staffReadability={revision:r2,authority:ENGINE_AUTHORING,tipProbeSourcePx:[75,82],screenForward:+X,screenDown:+Y,driveTime:1.04,overtravelTime:1.1,settleTime:1.25,geometryChanged:false,weightsChanged:false,staffIndependentTrack:false,forceTransfer:spine-chest-arms,headStaffSkinMatchedAtKeys:true}; scene.bodyAuthoring.staffReadabilityRevision=r2 |
| 현재 trajectory | source-equivalent probe[75,82]: 준비0.9초[66.54301388253896,77.21874976139787]→peak1.1초[103.94808931697101,108.38274919430683]; Δ[37.40507543443205,31.163999432908952]sourcepx, scale80에서는[19.949373565030424,16.62079969755144]scenepx. +X전방/+Y하강이며 native공격거리/피해로 환산0 |
| force/연결 | 공통 spine→chest→arms 힘 전달; peak chest inheriteddrive[0.13949758129408563,−0.19533373811731902,0]model, staffworldrotation−0.05000000000000001rad. headlocalT 보정 + headlocalZ=leftUpperArm+leftForearm+leftHand의Z로 10key에서 head/staff skin 일치; staff독립track0·childhand T/R0·weights수정0; 17phase boot115정점 drift0·hand/staff skin/weld0. head/staff10key maxerror2.220446049250313e-16; triangle177/351의6개 edgefactor0.9999999999999997..1.0000000000000306. key일치이며 전체연속시간skin동일constraint로 확대0 |
| 왕복/권위 | publicsave1/reload1/export2, 저장attack1.1초/transitionnull·project/node/mesh/bones/UV/weights/material/clips/posedvertices/camera exact; ownerclock5.966666666666651→0, FX0·sequenceunavailable. 실제export pair 각2771920B, byte exact; 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.

### r2 attack 키 배열

keyTimes=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 아래는 같은순서의 Z축회전(XY평면) radians이며 X/Yrotation0이다. 기존quaternion최단slerp·translation선형보간을사용한다.

| bone id | localZ key array radians |
|---|---|
| `spine` | `[0,0.003,0.006,0.008,-0.012,-0.015,-0.012,0.005,0.002,0]` |
| `chest` | `[0,0.002,0.004,0.006,-0.011,-0.015,-0.012,0.003,0.001,0]` |
| `head` | `[0,0.006,0.015,0.023,-0.016,-0.02,-0.018,0.008,0.003,0]` |
| `leftUpperArm` | `[0,0.003,0.006,0.009,-0.01,-0.012,-0.011,0.004,0.001,0]` |
| `leftForearm` | `[0,0.003,0.007,0.012,-0.006,-0.008,-0.007,0.004,0.002,0]` |
| `leftHand` | `[0,0,0.002,0.002,0,0,0,0,0,0]` |
| `rightUpperArm` | `[0,-0.008,-0.016,-0.02,0.026,0.035,0.022,-0.006,-0.002,0]` |
| `rightForearm` | `[0,0.005,0.012,0.015,-0.016,-0.022,-0.012,0.004,0.001,0]` |
| `coatLeft` | `[0,0.002,0.004,0.005,-0.008,-0.014,-0.023,0.009,0.002,0]` |
| `coatRight` | `[0,-0.002,-0.003,-0.004,0.007,0.013,0.021,-0.008,-0.001,0]` |
| `coatFront` | `[0,0.001,0.002,0.003,-0.004,-0.007,-0.012,0.004,0.001,0]` |
| `coatBack` | `[0,0.001,0.003,0.004,-0.005,-0.01,-0.017,0.006,0.001,0]` |

translation은modelunits, parentlocal의bindrelativeoffset이다. 아래3tracks만 T가0이아니며나머지9tracks T=[0,0,0]이다. 양끝T/R0.

| bone id | local T key triples |
|---|---|
| `spine` | `[[0,0,0],[-0.003,0.009,0],[-0.012,0.033,0],[-0.025,0.055,0],[0.115,-0.165,0],[0.135,-0.195,0],[0.13,-0.22,0],[0.015,-0.03,0],[0.003,-0.008,0],[0,0,0]]` |
| `head` | `[[0,0,0],[-0.003931012304501683,0.0033068368825681753,0],[-0.01045937383213985,0.009172662735365178,0],[-0.016093273606415083,0.013721611362594194,0],[0.023765315505426748,-0.02046083160185281,0],[0.03033496373345614,-0.02872508624693237,0],[0.02605139342656476,-0.02959152209570428,0],[-0.0012462276567512887,0.002403251903470841,0],[-0.002116239752183652,0.001776520346043947,0],[0,0,0]]` |
| `leftUpperArm` | `[[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0.014,-0.012,0],[0.018,-0.018,0],[0.015,-0.02,0],[0.004,-0.002,0],[0,0,0],[0,0,0]]` |

head Z는 각key에서 leftUpperArm+leftForearm+leftHand localZ의합이다. spine/chest를공통상속하며 necktrack0이다. headlocalT의저작정의는 `headT_new=headT_old+transpose(neck.worldRotation)*(staff.skinTranslation−head.skinTranslation)`; 위정확한triples를저장해key에서head/staffskinmatrix를맞춘다. 보간중연속일치solver는추가하지않았으며단독stafftrack/weights/geometry변경0이다.

| 현재 배송/증거 | bytes / SHA256 |
|---|---|
| `tools/fdg-studio/fixtures/dark-druid-normal-body.fdg.json` | 809359B / `b394754856e1f349986f175fde1c547093ebe04d1e17f743a8905f4c59e83243` |
| `tools/fdg-studio/fixtures/dark-druid-normal-body.rig.json` | 703113B / `7fd0f72400035b65cf1c3a90f02a3755725548e5a2cb28be2a8cc727b3be3784` |
| `dark-druid-staff-readability-public-playback.gif` | 8120063B / `0664df8dc5809eb58816038bba5c331b7a2ec3d661959ef38ce40292fbf1fd81` |
| `export-before.fdg.json` / `export-after.fdg.json` | 각각2771920B / `d1a4217f8fc2530e9e0740efd9abf0de36be231672df19d51aa1e508a17d0efc` |

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
