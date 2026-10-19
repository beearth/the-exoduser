# FDG 일반 장면의 리그 consumer 데이터 계약

> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

r7 선택 면 노트: 아래 기존 material/UV·textureDraws·plain shade 표는 mesh.faceColors가 미설정/null인 면의 기본 계약이다. 명시 RGB6hex 면은 새 authoring flat fill1·authoringDraws를 적용하며 현재 r7 표와 정본을 따른다. 기존 r6 이하 수치·검수 행을 새 결과로 합산하지 않는다.

기준일: **2026-10-11, Asia/Seoul · v0.5 데이터 버전 유지**. 구현은 `engine/fdg/rig-scene-project.js`와 `engine/fdg/project.js`의 선택 필드 검증이다. 독립 [RigProject](FDG_RIG_PROJECT.md)를 일반 FDG `schemaVersion:1` 프로젝트의 `rigScene` 리소스로 포함하여 소비한다. 리그 원본의 본 계층·메시·가중치·클립 및 선택UV/drawOrder/texture를 깊은 복사하며 새 메시를 생성하지 않는다. 선택텍스처의 추가 검증·이미지 수명은 [2026-10-11 정본](FDG_RIG_TEXTURE_RUNTIME_20261011.md)을 따른다.

이 문서는 데이터/API와 새 스키마 QA의 정본이다. 본편 `game.html`, 제품 R의 `fdg-engine/`, 기존 맵 geometry/collision, 게임 캐릭터 모델을 변경하지 않는다. CPU consumer의 화면·입력·프레임 동작 검수는 별도 런타임/Studio 보고를 따른다. 스키마 PASS를 완성 환경·게임 캐릭터·GPU 성능의 승인으로 바꾸지 않는다.

r6 조건 노트: 본문의 보편 clip/time/sequence/API 표는 node.returnTo·sequence.autoStart·entryTransitionSeconds를 미설정한 기존 기본 계약을 유지한다. 아래 r6의 명시 설정은 opt-in 확장으로 적용한다. returnTo 노드의 전환 중 setRigClip/replay는 false, sequence elapsed는 마지막 공격 시각으로 고정하고 현재 idle node time을 별도 표시하며, autoStart:false 일반 start/step은 자동 공격 회차를 만들지 않는다. 기존 표 행·r5 수치·과거 검수 이력을 변경하여 새 결과로 합산하지 않는다.

## 1. 공개 API와 구현 상태

| export / 구현 | 입력·출력 | 상태 |
|---|---|---|
| `RIG_SCENE_VERSION` | `1` | 구현 |
| `RIG_SCENE_LIMITS` | 아래 고정 상한 객체, `Object.freeze` | 구현 |
| `validateRigScene(scene)` | `{ok:boolean, errors:string[]}`; 잘못된 JSON/구조/참조를 오류로 반환 | 구현, 2026-10-10 Node29개 PASS의동결이력 |
| `createRigScene(rigProject, options?)` | 유효한 기존 RigProject를 복사한 장면 반환; 잘못된 리그/옵션이면 `TypeError` | 구현 |
| `validateProject(project)` | `rigScene`이 있을 때 추가 검증; 기존 `{ok,errors,warnings,route}` 반환 유지 | 구현 |
| 기존 `ProjectStore` | scene 포함 전체 snapshot/transaction/undo/redo/JSON 저장 왕복 | 신규 통합 회귀 PASS, 기존 API 유지 |
| 노드 소비·화면 검수 | 일반 FDG renderer의 리그 투영·재생·깊이 정렬·카메라 | 런타임/Studio 담당의 별도 구현·QA 보고 적용 |
| 충돌·전투·자동 캐릭터 이관 | 리그 노드에서 새 판정 생성 | 미구현·이번 범위 밖 |
| 선택UV/texture/drawOrder | embedded RigProject validator의강한검증·깊은복사재사용, consumer의CPU삼각형표시 | 구현, 새texture단위8개별도증거 |
| 외부 모델 import·GPU skinning·자동 가중치·PBR/의상 | 기존 RigProject와 같은 제한 | 미구현 |

모듈은 DOM·Canvas·네트워크·타이머·파일·저장에 접근하지 않는다. `validateRigScene`은 입력을 변경하지 않는다. factory 반환의 리그·좌표·클립 키·가중치·수동 pose는 입력과 공유하지 않는다. `validateRigProject`를 실제 호출하여 원본 리그 계약을 재사용한다.

## 2. 선택 필드와 버전

```js
{
  schemaVersion: 1,
  // 기존 id/name/map/characters/skills/vfx/preview와 확장 메타데이터 유지
  // v0.20 선택 viewCamera는 일반 프로젝트의 공통 월드 카메라 (정본 참조)
  rigScene: {
    version: 1,
    resources: [{ id, name, project: /* 검증된 RigProject */ }],
    nodes: [{
      id, name, resourceId,
      position: [worldX, worldY, heightZ],
      scale, visible, materialId, clipId, time,
      // 선택: 생략 또는 null 또는 아래 객체
      transition: { fromClipId, fromTime, duration, elapsed },
      // r6 선택: 생략 허용, null 거부
      returnTo: { clipId, transitionSeconds }
    }],
    camera: { x, y, follow, yaw, pitch },
    // 선택: 생략 가능, null은 거부
    sequence: { id, nodeId, clipId, startTime, atlas, offset,
      // r6 선택: 미지정이면 autoStart=true / entryTransitionSeconds=0
      autoStart, entryTransitionSeconds }
  }
}
```

| 항목 | 계약 |
|---|---|
| 일반 프로젝트 버전 | `schemaVersion:1` 유지, 자동 버전 승격 없음 |
| `rigScene` | 선택 필드. 생략된 기존 save/import를 허용; 값이 `null`이면 오류 |
| `rigScene.version` | 숫자 `1`만 허용, 문자열/구버전/미래 버전 거부 |
| 빈 장면 | `resources:[]`, `nodes:[]` 허용. 유효한 camera는 필요 |
| 사용하지 않는 리소스 | 유효하면 노드가 참조하지 않아도 저장 가능 |
| ID | 1~120자, 공백뿐인 문자열·ASCII control/DEL 제외; `__proto__`, `prototype`, `constructor` 제외 |
| 이름 | 1~120자, 공백뿐인 문자열·ASCII control/DEL 제외 |
| 중복 | resources 내부 ID와 nodes 내부 ID 각각 고유. 그룹 사이 같은 ID는 허용 |
| JSON 확장 자료 | 알 수 없는 일반 JSON 메타데이터를 삭제·재해석하지 않고 보존 |
| 비JSON 자료 | undefined, sparse array, 함수/toJSON 함수, accessor, symbol, bigint, 비유한 수, 클래스/Date, 숨김·비인덱스 배열 속성, cycle 거부 |

`toString` 같은 일반 문자열 ID는 허용하며 참조는 `Map`/직접 ID 비교로 찾는다. 데이터 검증이 확장 함수나 accessor를 실행하지 않는다. 여러 필드가 같은 JSON 객체를 참조하는 것은 허용하지만 순환 참조는 저장할 수 없다.

## 3. 리소스와 노드 필드

| 경로 | 값·상한 | 적용 위치 |
|---|---|---|
| `RIG_SCENE_LIMITS.resources` / `resources` | 0~**8**개 | 장면별 inline 리그 리소스 |
| `resources[].id` / `.name` | 위 ID/이름 계약 | 리소스 목록·참조 |
| `resources[].project` | 유효한 `rigVersion:1` RigProject | 본·메시·가중치·선택UV/drawOrder·색/선택texture재질·클립·수동pose |
| `RIG_SCENE_LIMITS.nodes` / `nodes` | 0~**32**개 | 장면별 consumer |
| `nodes[].id` / `.name` | 위 ID/이름 계약 | 노드 선택·저장 |
| `nodes[].resourceId` | 검증된 기존 `resources[].id` | 리그 선택 |
| `nodes[].position` | 정확히 3성분 배열 | `[worldX, worldY, heightZ]` |
| `position[0]`, `[1]` | 유한한 **0..8000px** | 월드 XY, 타일 좌표가 아님 |
| `position[2]` | 유한한 **−8000..8000px** | 월드 높이, 발 기준 투영 오프셋 |
| `RIG_SCENE_LIMITS.worldSize` | **8000** | 200×200 타일·40px의 기존 월드 크기 |
| `nodes[].scale` | 유한한 **1..128** | 모델 단위→월드 px |
| `RIG_SCENE_LIMITS.minScale` / `maxScale` | **1** / **128** | scale 검증 |
| `nodes[].visible` | boolean | consumer 표시 여부 |
| `nodes[].materialId` | 해당 리그의 기존 호환 material ID | 동일 meshId·skeletonId 재질만 |
| `nodes[].clipId` | `null` 또는 해당 리그의 기존 clip ID | null은 bind pose |
| `nodes[].time` | 유한한 **0 이상 초** | 현재 clip 평가 위치·정지 저장 위치 |

재질·클립은 해당 노드가 참조한 리소스 안에서 찾는다. 다른 리소스에 같은 이름/ID가 있다는 이유로 참조 오류를 통과시키지 않는다. 숨겨진 노드도 구조와 참조를 검증한다. 노드의 scale은 리그 preview zoom과 별개이고, 리그 클립 FPS는 기존 **1..120 가변** 계약을 유지한다. 게임 sprite의 **24장·24FPS** 목표를 리그 프레임 수 제약으로 도입하지 않는다.

| 포함된 리그의 선택 texture 데이터 | 검증·소비 경계 |
|---|---|
| `mesh.uvs` | vertex마다finite0..1의 `[u,v]` 정확1개. UV만있고색재질인문서도유효 |
| `mesh.drawOrder` | triangle마다−8192..8192의정수layer 정확1개. 노드월드depth와별개 |
| `materials[].texture` | 로컬경로src와정수width/height1..4096px. texture있으면UV필수·color계속필수. 같은embedded리그내동일src선언치수일치 |
| 깊은복사·저장 | factory/store/capture/JSON왕복에서위배열·texture선언과일반JSONmetadata보존. Image객체를프로젝트에저장하지않음 |
| 이미지준비 | 구조검증은PNG를읽지않음. owner `requiredSources→기존assetsload→validateReady`에서실제natural치수정확일치검사 |

texture가 없는 기존 문서는 단색 렌더를 유지한다. scene schema 버전·리소스8/노드32·리그2MiB/전체4MiB·가변clipFPS·owner60Hz·기본.25초 전환은 변하지 않는다. 저작 fixture의 ENGINE_AUTHORING·보이는 표면2.5D·nativecombat 미적용 경계를 새 collision/combat 권위로 해석하지 않는다.

`resource.project.preview.pose`를 공유 수동 pose로 소비한다. 노드마다 새로운 pose 객체나 독립 clock 포맷을 정의하지 않는다. `nodes[].time`과 선택 전환 자료는 기존 clip 평가의 저장 상태이다. 리그 원본 preview의 카메라/playing 값을 일반 장면의 카메라/실행 상태로 자동 승격하지 않는다. 알 수 없는 `collisionMetadata`, `combatMetadata` 같은 JSON 확장 필드는 그대로 보존하지만 새 consumer의 판정으로 적용하지 않는다.

## 4. 저장 중 전환

| `nodes[].transition` 경로 | 계약 |
|---|---|
| 필드 자체 | 생략 또는 `null` 또는 전환 객체 |
| `.fromClipId` | `null`(bind pose) 또는 해당 노드 리소스의 기존 clip ID |
| `.fromTime` | 유한한 **0 이상 초** |
| `.duration` | 유한한 **0 초과..10초 이하** |
| `RIG_SCENE_LIMITS.transitionDuration` | **10**초 |
| `.elapsed` | 유한한 **0..duration** 초, 양 끝 포함 |

목표 clip/time은 노드의 `clipId`/`time`, 전환 출발점은 `fromClipId`/`fromTime`으로 저장한다. 중간 전환과 정확히 끝난 전환을 JSON에 보존할 수 있다. 전환에서 null clip은 bind pose로 허용한다. 기본 factory는 `transition` 필드를 만들지 않는다. 실제 정지·재개·전환 capture는 런타임 소유이며 스키마는 저장 상태의 유효성만 확인한다.

## 5. 카메라·투영·맵 보존 경계

| 경로 / 동작 | 계약 |
|---|---|
| `camera.x`, `.y` | 유한한 **0..8000px** |
| `camera.follow` | boolean |
| `camera.yaw` | 유한한 **−π..π rad** |
| `camera.pitch` | 유한한 **−π/3..π/3 rad** |
| renderer의 카메라 저장 | 실제 월드 카메라 clamp 결과와 현재 viewer yaw/pitch capture |
| 모델 축 | **X=right, Y=up, Z=front** |
| 투영 기준 | 기존 `worldToScreen(worldX,worldY)` 발 anchor에 yaw/pitch 회전과 heightZ 투영 |
| 깊이 정렬 | 리그 전체 노드를 **world-Y 발 위치**로 기존 player/objects와 정렬; 높이·모델 중심·개별 삼각형 Y를 월드 depth로 사용하지 않음 |
| 충돌·전투 | 기존 시스템 보존; 리그 노드의 자동 충돌/공격 판정 추가 없음 |

작업 전 [맵 제작 가이드 v0.9](../4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md) 전체와 [맵 SSOT 읽기 순서](../4.1맵디자인+설정/_MAP_SSOT_INDEX.md)를 읽었다. 가이드의 master→outer mass→large/medium/ground→playable→landmark→detail→camera→tech 순서를 기존 맵 제작에 적용하며 이번 schema consumer는 새 production 환경을 제작하지 않는다. 기존 tiles·start/exit·장식·geometry·collision·outer mass·baked/painted 자료를 변경하지 않는다. 픽셀 노드 position을 타일 좌표나 새로운 route clearance로 해석하지 않는다. 기존 LOCK 좌표와 CH1/R의 완료 상태를 재검증하거나 복제하지 않는다.

## 6. factory 기본값과 사용

```js
import { createRigScene } from './engine/fdg/rig-scene-project.js';

// authoredRig는 이미 확보하고 검증한 기존 RigProject이다.
const next = structuredClone(fdgProject);
next.rigScene = createRigScene(authoredRig, {
  position: [4020, 7460, 0],
  resourceId: 'rig_probe',
  nodeId: 'rig_node_probe',
  name: '3D 시험 노드',
});
// UI는 기존 ProjectStore.replace/change 트랜잭션으로 적용한다.
```

| 입력 / 기본 출력 | 값 |
|---|---|
| 필수 입력 | 기존 검증된 `rigProject`; 신규 default mesh 생성 없음 |
| `options.position` | `[0,0,0]` |
| `options.resourceId` | `'rig_probe'` |
| `options.nodeId` | `'rig_node_probe'` |
| `options.name` / 노드 이름 | `'3D 시험 노드'` |
| 리소스 이름 | 전달한 `rigProject.name` |
| `nodes[0].scale` / visible | **48** / **true** |
| materialId / clipId / time | 전달한 `rigProject.preview`의 같은 값 |
| 카메라 x/y | 입력 position의 X/Y |
| follow / yaw / pitch | **false / −0.65 / 0.32** |

반환은 전체 FDG 프로젝트가 아닌 `rigScene` 객체이다. 리그 전용 JSON만으로 `schemaVersion:1` 프로젝트의 map/characters/skills/vfx를 대체하지 않는다. 리소스를 공유하는 추가 노드는 소비자 UI에서 기존 노드를 복사하고 새 고유 ID를 부여한 뒤 검증된 전체 프로젝트 트랜잭션으로 넣는다. 이 모듈은 추가 노드 생성 API를 정의하지 않는다.

## 7. 크기·저장·이력

| 범위 | 계약 |
|---|---|
| 각 리그 원본 | 기존 `RIG_LIMITS.fileBytes` = **2,097,152 bytes / 2MiB**, compact UTF-8 JSON |
| `rigScene`이 있는 일반 프로젝트 전체 | 기존 `LIMITS.fileBytes` = **4,194,304 bytes / 4MiB**, compact UTF-8 JSON |
| 전체 한도 포함 항목 | map/characters/skills/vfx/drafts/preview, 모든 inline 리그, unknown JSON 메타데이터 |
| 정확한 경계 | byte 상한과 같은 크기 허용, 1byte 초과 거부; 한글 UTF-8 byte도 포함 |
| 리그 없는 기존 프로젝트 | 기존 validation 경로 유지; 이번 additive 검사는 기존 import/file-size UI를 대체하지 않음 |
| 가져오기 UI | raw 파일 byte 한도도 별도 적용해야 함; compact schema budget과 pretty 파일 길이를 구분 |
| 내보내기 UI | pretty가 raw 한도를 넘는 경우 compact fallback 필요; 이번 모듈은 파일을 쓰지 않음 |
| `ProjectStore` | 기존 **80**단계 undo 한도/API 유지, scene 포함 전체 깊은 복사 |
| 실패한 edit/replace | 이전 project·undo/redo·changed event 수를 보존 |
| 저장 재열기 | 현재 노드 시간·전환·카메라·공유 manual pose·unknown metadata 보존 |

unknown collision/combat 데이터는 유효한 JSON인 한 삭제하지 않는다. 함수/toJSON·accessor·undefined를 통해 직렬화 시 누락시키는 값과 cycle은 거부한다. 프로젝트 snapshot과 event snapshot을 바꾸어도 저장된 리그 정점·가중치·노드 값은 바뀌지 않는다. 기존 `ProjectStore`의 change/replace/undo/redo 구현을 새 리그 store로 복제하거나 재작성하지 않았다.

## 8. 2026-10-10 동결 QA와 MAP PRODUCTION REPORT

2026-10-10 명령: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --test test/fdgRigSceneProject.test.mjs`. 결과 **29/29 PASS의동결이력**이다. 이번texture추가에서해당scene suite와기존project85/rigschema36/rigmath11 및이전게임/PNG/제품R완료suite를실행하지않았다. 신규 `test/fdgRigTexture.test.mjs` **8/8 PASS**는 [별도runtime검증문서](FDG_RIG_TEXTURE_RUNTIME_20261011.md)를따르며29에합산하지않는다.

| 새 회귀 범위 | 확인 내용 |
|---|---|
| factory/compatibility | 깊은 복사·원본 메시/수동 pose 보존·기본 ID/좌표/preview 연결·빈 장면·old save |
| 강한 참조 | 그룹 중복/reserved/control/길이·8/32 상한·실제 embedded rig cycle/재질 오류·리소스별 material/clip |
| 좌표·카메라 | XY/Z/scale/visible/time/yaw/pitch/follow의 유한 경계 |
| 전환 | 생략/null/bind/clip·출발 clip 참조·duration10·elapsed·정지 저장 왕복 |
| JSON/파일 | nonJSON/cycle/sparse/toJSON/accessor 실행0·리그2MiB·전체4MiB 정확경계·한글 UTF-8 |
| 일반 프로젝트 보존 | tiles/route/warnings/skill/VFX 불변·unknown collision/combat 유지·camera/pose 저장 재열기 |
| 트랜잭션 | 한 undo/redo·실패 상태/redo/event 보존·snapshot/event clone isolation |

| MAP PRODUCTION REPORT 항목 | 이번 schema worker 결과 |
|---|---|
| STAGE / MASTER | 독립 일반 FDG 장면의 render-only rig consumer 계약; 신규 stage 제작 없음 |
| OUTER MASS / LARGE / MEDIUM / GROUND / PLAYABLE / LANDMARK | 기존 geometry/collision/배치/전투 LOCK 보존, 편집 없음 |
| CAMERA QA: START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT | 이 worker는 화면 검수를 실행하지 않음; root의 별도 consumer QA 필요 |
| TECH QA | 새 스키마29 PASS; 기존 route 동일 확인. pageerror/404/seam/loading/performance는 브라우저 담당 보고 범위 |
| FILES | project.js의 additive validation, 새 rig-scene-project.js/test/doc만 소유. 대규모 변경 전 project.js를 `tmp/fdg-rig-scene-20261010/backups/project.js`로 백업 |
| GIT | 이 worker는 commit/push/deploy 없음; 중앙 문서/CHANGELOG/commit은 root 소유 |
| VISUAL VERDICT | **RETOUCH** — 데이터 QA만 완료, consumer 카메라/환경 시각 승인 대기. 기존 환경 판정을 덮어쓰지 않음 |
| NEXT PASS | consumer 화면·깊이 정렬·전환 재열기·입력/실행 상태·자원정리를 root가 별도 확인 |

코드 변경 후 docs전체를 `rg -l -i 'rigScene|RigProject|rigVersion|리그|리깅|스킨|4MiB|4 MiB' docs/`와 규칙의 `grep -r -l -I -E 'rigScene|RigProject|rigVersion|리그|리깅|스킨|4MiB|4 MiB' docs/`로 검색했다. 결과 목록은 `tmp/fdg-rig-scene-20261010/docs-rg-matches.txt`와 `docs-grep-matches.txt`에 기록했다. 일반 엔진·integration·benchmark·제작기 중앙 문서의 v0.4→v0.5 소비 경계 동기화는 root 소유이다. 보호 `2_3` 문서·제품 R·기존 PNG·game.html은 수정하지 않았다.

## 2026-10-11 r4 선택 시퀀스 데이터 계약

`rigScene.sequence`는 기존 버전1에 추가한 **선택 단일 객체**다. 설정을 authored JSON에 저장하며 실행 회차·이벤트 latch·활성 FX는 저장하지 않는다. 완전한 시퀀스 인수·실재 fixture와 새 공개 증거는 [r4 정본](FDG_TAIL_SEQUENCE_20261011.md)을 따른다.

| 경로 | 정확한 검증 / 단위 |
|---|---|
| `sequence` | 생략 허용. 명시하면 일반 JSON 객체이며 null/배열 거부. 별도 sequence 배열이나 자동 생성 없음 |
| `sequence.id` / `.nodeId` / `.clipId` | 기존1..120자 ID 규칙·reserved ID 거부. nodeId는 검증된 기존 노드, clipId는 그 노드의 현재 리소스 안에서 `loop:false`인 clip의 강한 참조 |
| `sequence.startTime` | 유한한 `0 < startTime <= clip.duration` demo 초. 본편 game-frame 환산 값이 아님 |
| `sequence.offset` | 정확2성분 `[worldDx,worldDy]`, 각 유한−8000..8000 world px. bound node XY에 더한 FX 중심 위치 |
| `sequence.atlas.src` | 기존 `isLocalAsset`의 로컬 이미지 경로 계약 |
| `.frameWidth` / `.frameHeight` | 정수1..4096 source px. 리그 material texture의 전체 이미지 치수 상한과 다른 셀 선언 |
| `.columns` / `.rows` | 정수1..256 |
| `.frames` | 정수1..4096이며 `frames <= columns*rows` |
| `.fps` | 유한1..120 frames/second |
| `.scale` | 유한0.1..10, source px→world px 배율 |
| `.anchorX` / `.anchorY` | 유한0..1 |
| `.loop` / `.directions` | loop는 생략 또는 false만, directions는 명시 금지. 단일 non-loop 이미지 시트 |
| 실제 decode | owner 이미지 캐시의 자연치수는 `columns*frameWidth × rows*frameHeight`와 정확히 일치해야 함. 스키마 수치 검증과 실제 decode 검사는 별도 |
| 확장 metadata | 기존 안전 JSON을 그대로 보존. fixture의 ENGINE_AUTHORING/ENGINE_FIXTURE·native 비환산 선언은 작성 metadata이며 스키마가 전투 판정으로 소비하지 않음 |

기존 resources8/nodes32·각 RigProject2MiB·전체 프로젝트4MiB·JSON 안전성·deep copy·unknown metadata 보존 규칙을 유지한다. factory가 임의 시퀀스를 만들지 않는다. load/capture/store는 설정과 현재 node pose/clip/time/transition을 보존하며 transient 실행 상태는 새 load에서 ready/activationId0/eventCount0/owner clock0/FX0으로 시작한다.

새 `test/fdgRigSequence.test.mjs`는 backend의 최초 한정 실행 **8/8 PASS**, fail0/skip0이다. 기존29/13/texture8/r3의4/r2의14개와 합산하지 않고 재실행하지 않았다. 실재 이미지·공개 UI·시각 판정은 r4 정본의 별도 결과로 기록한다.

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

`rigScene.version:1`·선택 단일 sequence 구조·resources8/nodes32·각 rig2MiB/전체 project4MiB·안전 JSON·unknown metadata 보존은 변경하지 않는다. 새로운 clip key도 기존 keys256/track와 강한 clip/node 참조 계약으로 소비하며 r5를 별도 schema 버전으로 해석하지 않는다.


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

| r6 추가 경로 | 정확한 검증 / 직렬화 계약 |
|---|---|
| `nodes[].returnTo` | 생략 허용, 명시값은 일반 객체; null/배열 거부. `{clipId,transitionSeconds}` 두 선언 필수 |
| `returnTo.clipId` | 같은 node 리소스의 기존 `loop:true` clip 강한 참조. null/bind·non-loop 대상 거부 |
| `returnTo.transitionSeconds` | finite0..10초. 0은 즉시 교체이므로 생성된 transition=null |
| `sequence.autoStart` | 선택 boolean, 생략 시 true. false는 일반 start/step의 최초 자동 activation만 비활성 |
| `sequence.entryTransitionSeconds` | 선택 finite0..10초, 생략0. 명시 Replay가 기존 clip 전환 기간으로 소비 |
| 원래 설정 / 크기 | version1/resources8/nodes32/각 rig2MiB/전체 project4MiB·JSON 안전성·unknown metadata·sequence non-loop 강한 참조·atlas 기존 검증 유지 |
| capture/load | 원 authored returnTo·sequence 설정과 현재 node clip/time/transition을 보존. transition의 fromClipId/fromTime/duration/elapsed도 실제 pose와 함께 저장. 실행 activation/elapsed/event/FX는 새 JSON 필드로 저장하지 않음 |
| snapshot | returnTo는 독립 복사이며 absent node의 snapshot 값null. null snapshot을 authored returnTo:null로 직렬화하여 schema를 완화하지 않음 |

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
| 현재 authoring shape | `rigScene={version:1,resources:[dark-druid-body],nodes:[dark-druid-body-node],camera}`; `sequence` 필드는 없음. inline rig3289/4644/19/1/2, schema/한계 변경0 |
| node 설정 | position[4150,7360,0]/scale80/visibletrue/materialapproved-dark-druid/clipdark-druid-idle/time0/transitionnull; returnTo={clipId:dark-druid-idle,transitionSeconds:0.35} |
| camera / metadata | camera{x:4150,y:7216,follow:false,yaw:0,pitch:0}; provenance.bodyAuthoring{authority:ENGINE_AUTHORING,subject:boss-dark-druid-NORMAL,fx:0,entryTransitionSeconds:0.25,nativeCombatApplied:false,isolatedStorageKey:fdg.studio.dark-druid.body.r1} |
| 선택 필드 해석 | entryTransitionSeconds0.25는 bodyAuthoring 저작 기록이며 sequence.entryTransitionSeconds를 선언한 장면이 아님. sequence.autoStart/atlas를 새Druid에 추정해서 추가하지 않음 |
| 저장/복원 | 전용 query `authoring=dark-druid-body-r1`에서만 `fdg.studio.dark-druid.body.r1`; 기본 `fdg.studio.project.v1`·기존 Hell preset 보존. authored clip/time/transition/returnTo/pose/camera 저장, runtime clock·FX transient 미저장; public save1/reload1/export2, parsed full JSON·posed3289vertices/19bonePositions·clip/time/transition/camera exact. 저장 idle1.183333333333334초 보존, ownerclock4.466666666666656→0, sequence unavailable/activation0/event0/emitted0/FX0. 실제 export pair 각2766448B |
| 제품 범위 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 새manifest metadata | provenance.staffReadability={revision:r2,authority:ENGINE_AUTHORING,tipProbeSourcePx:[75,82],screenForward:+X,screenDown:+Y,driveTime:1.04,overtravelTime:1.1,settleTime:1.25,geometryChanged:false,weightsChanged:false,staffIndependentTrack:false,forceTransfer:spine-chest-arms,headStaffSkinMatchedAtKeys:true}; scene.bodyAuthoring.staffReadabilityRevision=r2 |
| 현재 설정 보존 | 동일19본/3289v4644tri·2clips, idle/returnToidle0.35/node[4150,7360,0]/scale80/camera[4150,7216] 유지. sequence없음/FX0·schema추가0 |
| 현재 clip data | 공통 spine→chest→arms 힘 전달; peak chest inheriteddrive[0.13949758129408563,−0.19533373811731902,0]model, staffworldrotation−0.05000000000000001rad. headlocalT 보정 + headlocalZ=leftUpperArm+leftForearm+leftHand의Z로 10key에서 head/staff skin 일치; staff독립track0·childhand T/R0·weights수정0 |
| 직렬화 | publicsave1/reload1/export2, 저장attack1.1초/transitionnull·project/node/mesh/bones/UV/weights/material/clips/posedvertices/camera exact; ownerclock5.966666666666651→0, FX0·sequenceunavailable. 실제export pair 각2771920B, byte exact; runtimeclock/FX·회차transient저장0 |
| 권위 | 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.
