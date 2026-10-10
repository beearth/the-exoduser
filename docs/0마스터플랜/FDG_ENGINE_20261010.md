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
| ResourceStore | URL당 공유 promise/Image·실패 캐시/자동 재시도0. acquireImage lease refCount·마지막 managed lease 해제·manual pin·evictImage/clearUnused·pending 세대 격리 구현. 실제 네트워크 취소/GPU 강제 해제는 제공하지 않음 |

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

후속은 FDG 장면/자원 계약을 사용한 실제 보스전 격리 이식과 성능 측정이다. 충돌/내비게이션·오디오 믹서·실제 skinned3D는 별도 구현이 필요하다. 자원 참조 수명 관리는 아래 후속 단위에서 구현했으며 물리 메모리/성능 인수는 남아 있다. 전체 게임 엔진 전환 완료나 Godot 전체 구현으로 보고하지 않는다. 본 단위는 기존 game/settings/save/원PNG/보호 설계·타인 WIP를 변경하지 않는다.

## 2026-10-10 후속 — 장면 이미지 자원 수명 관리

`ROOT-FDG-RESOURCE-LIFECYCLE-20261010`은 같은 독립 FDG 0.1 패키지의 자원 소유·장면 교체·샘플 종료 연결이다. 기존 엔진3담당을 재사용했다. 원게임/설정/save/원PNG/애니메이션 clip·시간·에디터 source는 변경하지 않았다. legacy 직접 캐시 소비와 managed renderer 소유를 분리한다.

| API/경계 | 현행 계약 |
|---|---|
| acquireImage(url) | URL 원문 exact key; 동기 frozen lease `{url,generation,promise,release(),released}`. URL의 같은 현재 세대는 promise/Image 공유, acquire마다 독립 refCount+1. generation은 store마다1부터 증가하는 positive safeinteger, generation 소진/refCount 증가 초과는 RangeError. 자동 재시도0 |
| releaseImage(lease)/lease.release() | 같은 store의 유효 handle만 허용. 최초 true/refCount−1, 재해제 false, 위조·타store handle TypeError. 마지막 refCount0이며 pinned=false일 때 entry 제거 |
| legacy loadImage/registerImage | pinned=true manual cache 유지. renderer는 acquire만 사용해 manual pin을 만들지 않음. 명시 registerImage의 교체는 현재 image를 갱신하지만 이미 resolve된 외부 promise의 값은 바꾸지 않음 |
| evictImage(url) | refCount>0이면 false이며 pin 유지. lease0 entry만 제거, missing=false |
| clearUnused() | lease0인 ready/failed/loading/manual-pinned entry를 제거하고 count 반환; 활성 owner entry 보존 |
| query(url)/states() | frozen snapshot `{url,state,image,error,refCount,pinned,generation}`. state missing/loading/ready/failed; image는 ready만/error는 failed만, missing은 refCount0/pinnedfalse/null 세대 |
| pending 제거 | Image handlers·store image/entry 참조 정리, promise는 AbortError/code FDG_RESOURCE_RELEASED reject. 이전 세대의 저장된 load/error callback도 새 entry에 영향0 |
| 외부 참조/실메모리 | 해제는 엔진 참조 정리다. 외부가 Image/query snapshot/resolved promise/lease를 유지하면 객체가 남을 수 있음. src 변경·네트워크 취소·GPU 강제 disposal·GC/실RAM 감소 보장0 |
| renderer 소유 | 렌더러별 URL lease1. 실제 visible/cull 통과 최초 이미지 소비에서만 acquire; hidden/offscreen 신규 URL eager load0. 이미 acquired URL은 숨김/화면밖이어도 현재 scene 참조가 있으면 유지 |
| render 동기화 | 현재 tree 전체 sprite URL 집합에서 사라진 lease를 draw 전에 반납. 노드 삭제/clip URL 변경은 다음 render에 반영. 어떤 lease 반납에서도 clip→Image WeakMap 재생성 |
| setTree(next) | 새 URL 집합 수집·검증 후 교체; 공통 URL lease/현재 세대 유지, 사라진 URL 즉시 반납. 선택/hit 참조 정리. 수집 실패 시 이전 tree/lease 보존 |
| renderer.dispose() | 최초 true/이후 false, terminal. 모든 자기 lease/clip cache/hits/selection/tree 반납, shared store 전체 dispose 호출0. dispose 뒤 render/setTree는 Error |
| editor 연결 | 기존 importJSON→setTree, deleteSelected→render를 통해 새 자원 정책 소비. editor.destroy는 자기 DOM/리스너만 제거하며 외부 renderer를 임의 dispose하지 않음; editor.js 변경0 |
| 샘플 dispose | FDGDemo.dispose(): 최초 true/이후 false. queued RAF 취소·late callback 무진행/재예약0·입력 keys/pan 정리·editor/renderer 종료·자기 입력 리스너 제거/타인 리스너 및 host 자식 보존 |
| pagehide | persisted=false면 샘플 dispose; persisted=true(BFCache)는 live scene/lease 유지. 실제 브라우저 BFCache 동작은 미인수 |
| 신규 검수 명령 | `node fdg-engine/tests/resource-lifecycle.cjs` / package script test:resources. FDG_TEST_OUTPUT으로 외부 witness 경로 선택. fakeImage/no-op Canvas/minimal DOM 사용, PNG decode0 |

| 이번 최초 검수 epoch | 결과/범위 |
|---|---|
| core lifecycle | Node1/6그룹14조건 PASS/FAIL0. manual pin·공유 handle·마지막 참조·pending AbortError·옛 callback 직접 호출/새 세대 보존·active eviction/clearUnused. 통제 imageFactory14 |
| renderer lifecycle | Node1/7그룹 PASS/FAIL0. fakelease store로 URL 소유·hidden/cull·변경/삭제·setTree 공통 유지/수집 실패·dispose. actualcore/PNG0 |
| 실제 editor consumer | Node1/6그룹30조건 PASS/FAIL0, fixture setup3 별도. 실제 core/renderer/editor의 JSON 교체·공통 URL·불법 입력 보존·삭제·editor.destroy/renderer.dispose; controlled FakeImage3/PNG0 |
| 실제 sample consumer | Node1/13조건 PASS/FAIL0. 실제 5스크립트·공유 renderer·pagehide persisted 경계·RAF취소/late callback·리스너/host 보존·pending 종료. controlled Image2/PNG0 |

각 epoch는 합산하지 않고 기존 foundation suite/PNG/Canvas pixel 검수는 재실행하지 않았다. 이번 새 source 최초 실행 후 제품 수정0. 원문과 source pin·ownhunk inverseexact는 `E/fdg-resource-lifecycle-20261010/`에 보존한다. **UI_NOT_ASSESSED / VISUAL VERDICT: RETOUCH**. 새 원화나 표시 geometry 변경이 없으며 native browser/실네트워크/GC·GPU peak·동시성능/EXODUSER 전체 이식·보스전/청취·save/AAA 인수는 미완료다.
