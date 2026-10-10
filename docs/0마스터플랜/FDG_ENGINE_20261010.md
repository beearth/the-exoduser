# FDG Engine 독립 기반 — 2026-10-10

최신 사용자 직접 지시 **“fdg엔진을 따로 만들어라고”**에 따른 `ROOT-FDG-ENGINE-FOUNDATION-20261010` 정본이다. 기존 ROOT+engine_runtime/engine_animation/engine_editor 팀을 재사용해 별도 `fdg-engine/` 패키지와 Scene Studio를 구현했다. EXODUSER `game.html`에 엔진을 붙이거나 전체 게임을 이식한 단위가 아니다.

## 구조와 담당

| 파일/담당 | 실제 구현 |
|---|---|
| `fdg-engine/src/core.js` / engine_runtime | Node, SceneTree, ResourceStore |
| `fdg-engine/src/animation.js` / engine_animation | SpriteFrames, Animator, SpriteNode |
| `fdg-engine/src/editor.js` / engine_editor | 씬 트리·속성·재생/정지/스텝·JSON 입출력 |
| `fdg-engine/src/renderer.js` / ROOT | Canvas Renderer25D, 카메라·깊이 정렬·선택·부모 affine |
| `fdg-engine/index.html`, `src/demo.js` / ROOT | 별도 Scene Studio, 실제 엔진 이동/아틀라스/에디터 연결 샘플 |
| `fdg-engine/package.json`, `src/index.cjs` / ROOT | version0.1.0/private/commonjs 독립 경계, 단일 모듈 export |
| `fdg-engine/tests/integration.cjs` / ROOT | 실제 5스크립트 데모·에디터·Canvas 연결 통제 검수 |

브라우저는 classic script `core→animation→renderer→editor→demo` 순서다. 런타임 외부 패키지/Three.js/서버/빌드가 필요하지 않도록 작성했다. 실제 `file://` 브라우저 실행은 미인수다. CommonJS `require('./fdg-engine')`는 동일 FDG 객체에 네 모듈을 제공하고 demo는 자동 실행하지 않는다. 기존 상위 저장소 `type:module`과 독립되도록 하위 `type:commonjs`를 명시했다.

Godot의 [씬 트리](https://docs.godotengine.org/en/stable/tutorials/scripting/scene_tree.html)와 [고정 처리/프레임 처리 분리](https://docs.godotengine.org/en/stable/tutorials/scripting/idle_and_physics_processing.html)를 구조 참고로 사용했다. 소스는 독립 구현이며 Godot 전체 기능이나 `.tscn` 호환을 제공하지 않는다.

## 코어/시간/장면 계약

| ID/API | 현행 값·동작 |
|---|---|
| `Node` | id/name/type, position{x,y,z}, rotation rad, scale{x,y}, visible, metadata/properties plain JSON; child/parent/tree는 코어가 관리 |
| 자동 ID | canonical `fdg-node-N` 명시 ID를 복원할 때 safeinteger N을 nextId에 예약해 새 프로세스의 자동 ID 충돌 방지. 자동 counter safeinteger 소진 시 RangeError, 별도 씬의 같은 명시 ID는 허용 |
| `addChild/removeChild` | 순환·중복 ID·미분리 다중 부모 차단; 직접 children 배열 수정 불가 |
| `worldTransform` | 부모 2D affine `{a,b,c,d,tx,ty}` 합성·z 합산; scale은 finite 음수/0 허용 |
| lifecycle | 진입 ready는 자식→부모, 이탈 exit도 자식→부모; 활성 트리 노드만 physics/process 처리 |
| `SceneTree` 기본 | fixedStep=1/60초, maxFrameDelta=.25초, maxSteps=8 |
| `advance(dtSeconds)` | finite≥0; 고정 physics 틱 뒤 process(제한된 입력 dt); 초과 따라잡기 시간은 droppedDelta/droppedSteps와 누적 droppedTime에 보고 |
| pause | advance가 physics/process/누적시간을 전진시키지 않음; 재개 시 paused 입력시간을 따라잡지 않음 |
| `stepOnce()` | paused 여부를 바꾸지 않고 physics/process를 각각 fixedStep 한 번 실행; accumulator 그대로 유지 |
| 시간 | simulationTime=총 physics steps×fixedStep; 화면 프레임 수와 분리. 모든 큰 dt를 처리한다는 보장 없음 |
| scene JSON | format=`fdg-scene`, version=1, settings{fixedStep,maxFrameDelta,maxSteps,paused}, root 노드 계층 |
| 복원 | custom factories[type]+properties hooks; unknown type은 일반 Node로 데이터 보존; simulation clock/accumulator는 새0에서 시작 |
| JSON 안전 | plain JSON·finite값·연속 배열만, prototype/accessor/숨은 속성/순환/unsafe key와 중복 ID 차단 |
| ResourceStore | URL당 공유 promise/Image, ready 캐시, 실패 캐시/자동 재시도0, 명시 registerImage 가능; unload/eviction/cancel 미구현 |

## 애니메이션/표시/에디터 계약

| API | 현행 규격·계약 |
|---|---|
| `SpriteFrames` | imageUrl/frameWidth/frameHeight/columns/rows/frames/fps/loop; positive safeinteger grid·count≤capacity, fps finite>0; 임의 24/256장 상한 없음 |
| sample/frameRect | seconds→loop modulo 또는 nonloop 마지막 셀 고정; row-major 한 셀 사각; 실제 Image capacity는 bindImage로 검증 |
| `Animator` | clip 전환/play/stop/pause/resume, 초 단위 elapsed/frame/finished; Kahan 누산으로 30×1/60 경계의 .5초를 보존 |
| `SpriteNode` | fixed physics dt로 animator 전진·draw에서 전진0, width/height/pivot/blend 및 현재 clip·playback seconds·사용자 properties 직렬화; 다른 미선택 clip 목록은 직렬화하지 않음 |
| `Renderer25D` | Canvas 2D, isometric 또는 topdown, visible 상속·floor depth 정렬·billboard·atlas 한 셀·부모 affine·hit-test·보수적 culling·save/finally restore |
| 카메라 | 기본 x0/y0/zoom1/isometric. isometric px=(x−y)×√3/2, py=(x+y)/2−z; topdown px=x, py=y−z; projected 좌표에서 camera x/y 차감 후 zoom |
| 화면 중심 | canvas width/2, height×.58. screenToWorld는 알려진 z 평면의 역변환; 실제 3D mesh가 아님 |
| blend | source-over/lighter/multiply/screen 허용, 그외 source-over. opacity finite이면0..1 clamp, 기본1 |
| 에디터 선택/속성 | editor.selected Node|null, 현재 트리만 선택. name1..200자, 위치·높이·회전·scale finite, visible bool; 유효 수정은 pause |
| 재생/한 스텝 | 에디터 자체 RAF0, SceneTree pause/stepOnce 이용; 한 스텝 버튼은 pause 유지 |
| 씬 JSON 입출력 | text1..1,000,000자, 파일≤1,000,000바이트; 검증 후 교체·성공 import pause, 잘못된 입력은 기존 scene/pause/selection 보존 |
| DOM | 기존 host 자식 보존·자체 shell 추가; 리프 text만 수정, destroy는 자체 shell/리스너 제거 |

## 실행 샘플

별도 `fdg-engine/index.html`에서 7노드(루트·이동 actor·변환 group·자식3·effect)를 사용한다. 도형은 엔진 기능용 placeholder이며 새 게임 캐릭터/맵 제작이 아니다. actor는 WASD/방향키로 speed120 worldunit/초, 대각선 정규화다. 확대 .25..3, 휠 계수.001, 가운데 버튼 pan, 카메라 reset, 투영 전환, 클릭 선택을 연결했다. 화면 숨김·focus 이탈은 이동 키를 정리한다. actor 기본42×86, 자식28², effect180²다. Canvas 논리 크기960×600·CSS비율8/5를 유지해 반응형 화면의 비균일 늘어짐을 피한다(실브라우저 미인수).

효과는 기존 승인 `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 3840×2560/640셀/6×4/24장·16FPS·nonloop1.5초를 새 엔진에서 재사용한다. `../assets/` URL을 유지하며 새 원화·PNG/JSON 변경0이다. 효과 재생 버튼은 현재 씬의 effect를 찾아 clip을 재시작하고 pause를 해제한다. JSON 교체 후에도 demo/renderer/editor는 같은 새 tree를 사용한다. 장면 JSON 자체는 PNG를 포함하지 않는다.

## 검수와 남은 실제 작업

| 검수 epoch | 결과/실제 범위 |
|---|---|
| core 최초 | Node1/7그룹31조건 PASS; 실제 코어 트리·transform·60/120 cadence·pause/step·drop·JSON·fakeImage. realImage/native/GPU0 |
| core 새 ID finding | ROOT 통합 후 다른 프로세스 저장복원 경로에서 before1 FAIL_REPRODUCED, 생성자 한 hunk396B 수정 뒤 독립 fresh context8/한정7조건 PASS. 첫 source 뒤 수정1, 기존31조건/ROOT18/PNG 재실행0 |
| animation 첫 로딩 | 상위 ESM 경계 FAIL1, 의미 검수 미도달; 보존 |
| animation 한정 delta | CommonJS 경계+Kahan 수정 뒤 8그룹 PASS; 첫 boundary witness .49999999999999994/frame7→.5/frame8. 기존 PASS 재실행0 |
| editor 첫 로딩 | 동일 모듈 경계 FAIL1 보존; core namespace1 통과는 CommonJS 검수로 세지 않음 |
| editor 한정 delta | namespace setup3·숫자/실scene JSON 2그룹27조건 PASS; DOM/native0 |
| ROOT 신규 통합 최초 | 18검사 PASS, 실제 core/animation/renderer/editor/demo 연결. minimal DOM+native Canvas, 원화 decode1/공유캐시. WASD·시간·독립 literal cell pixel oracle·context 복원·투영 역변환·affine 선택·pause/step·속성/JSON/실패보존·새scene replay·destroy |

서로 다른 epoch/담당의 조건을 합산해 한 검수로 표시하지 않는다. 외부 `E/fdg-engine-foundation-20261010/`의 각 first/end/integration witness를 보존한다. Canvas viewport proof는 **신규 FDG 엔진 독립 렌더**이며 EXODUSER 인게임 캡처/브라우저 UI 녹화가 아니다. ROOT 직접 판독에서 노드·선택·불꽃 표시를 확인했으나 **VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED**다. 실제 browser UI/file 다운로드·GPU/동시효과 성능·EXODUSER 이식·전체 보스전·청취/save/AAA 인수는 미완료다.

후속은 FDG 장면/자원 계약을 사용한 실제 보스전 격리 이식과 성능 측정이다. 충돌/내비게이션·오디오 믹서·자원 해제·실제 skinned3D는 별도 구현이 필요하다. 전체 게임 엔진 전환 완료나 Godot 전체 구현으로 보고하지 않는다. 본 단위는 기존 game/settings/save/원PNG/보호 설계·타인 WIP를 변경하지 않는다.
