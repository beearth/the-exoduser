# FDG Engine 0.1

EXODUSER와 분리된 장면 기반 엔진과 Scene Studio입니다. 엔진 소스는 `src/`에 있으며 게임의 `game.html`을 로드하거나 수정하지 않습니다. 브라우저 실행에 Three.js·외부 패키지·서버·빌드가 필요하지 않습니다.

`index.html`을 브라우저로 열면 2.5D/탑다운 뷰포트와 씬 에디터가 나옵니다. 화면에 초점을 두고 WASD/방향키로 테스트 노드를 움직이고, 노드를 클릭해 선택합니다. 휠은 확대, 가운데 버튼은 카메라 이동입니다. 기존 불꽃 아틀라스는 `../assets/`에서 읽으므로 지금 폴더 구조를 유지하세요. 다른 프로젝트에서 엔진 소스만 사용하는 것은 가능합니다.

에디터에서 재생·정지·한 스텝, 노드 추가/삭제, 이름·위치·높이·회전·크기·표시 여부 수정, 씬 JSON 파일 저장/불러오기를 지원합니다. 잘못된 JSON은 현재 장면을 교체하지 않습니다. 브라우저 다운로드 기능이 없으면 JSON 텍스트를 복사해 저장합니다.

저장된 자동 ID는 새 프로세스에서 불러올 때 예약하여 새 노드의 ID 충돌을 막습니다. 씬 복원은 새 시뮬레이션 시간을 0에서 시작하며 스프라이트의 현재 클립·재생 시간은 유지합니다.

## 엔진 사용

브라우저 Scene Studio는 `core.js → animation.js → exoduser.js → druid-roots-preview.js → renderer.js → editor.js → demo.js` 순서로 classic script를 로드합니다. CommonJS에서는 `require('./fdg-engine')`가 같은 `FDG` 객체의 앞6모듈을 제공합니다. `demo.js`는 샘플 앱이며 재사용 코어에 포함되지 않습니다.

```js
const tree = new FDG.SceneTree({ fixedStep: 1 / 60 });
const actor = new FDG.Node({ name: 'Actor' });
actor._physicsProcess = dt => { actor.position.x += 120 * dt; };
tree.root.addChild(actor);

const renderer = new FDG.Renderer25D(canvas, { tree });
// 자신의 RAF 루프에서 초 단위 dt를 전달합니다.
tree.advance(dt);
renderer.render();
```

| 모듈 | 구현된 계약 |
|---|---|
| `core.js` | Node 계층/순환·중복 ID 차단, affine 변환+높이, ready/exit/physics/process hooks, SceneTree 고정 시간·정지·한 스텝, 안전한 JSON, 공유 Image lease·manual cache·명시 eviction |
| `animation.js` | SpriteFrames grid·실이미지 용량 검증, 임의 장수 clip, 초 단위 Animator, loop/one-shot, SpriteNode 직렬화 |
| `renderer.js` | Canvas 2.5D/탑다운 카메라, 깊이 정렬, billboard atlas 한 셀 표시, 부모 affine 변환, 선택 hit-test, 보수적 화면 culling, context 복원, 장면 URL 소유·해제·dispose |
| `editor.js` | 씬 트리/속성, 재생·정지·한 스텝, 노드 추가/삭제, 검증 후 JSON 교체, 자체 DOM/리스너 정리 |
| `exoduser.js` | DruidRootsNode: 원7인자 요청+외부10frame/fraction 진행을 기존48장에 매핑, 자체 clock0, gate/끝·scene JSON factory |
| `druid-roots-preview.js` | Scene Studio의 독립60틱/초 참고 재생,70step끝/pause·step·import snapshot·삭제/종료 |

기본 시뮬레이션은 60Hz입니다. 한 화면 갱신의 입력 dt는 최대 .25초로 제한하며 최대 8틱을 처리하고 초과 시간을 보고합니다. 이는 느린 기기에서 무한 따라잡기를 피하는 정책이며 모든 경과 시간을 시뮬레이션한다는 뜻은 아닙니다. 표시 FPS와 애니메이션 장수/FPS는 별개입니다. 샘플 효과는 기존 24장 불꽃을 16FPS, 1.5초 one-shot으로 재사용합니다.

Godot의 [SceneTree](https://docs.godotengine.org/en/stable/tutorials/scripting/scene_tree.html)와 [고정 처리/프레임 처리 분리](https://docs.godotengine.org/en/stable/tutorials/scripting/idle_and_physics_processing.html)를 설계 참고로 사용했습니다. FDG 소스와 JSON은 독립 구현이며 Godot 포맷 호환을 제공하지 않습니다.

## 자원 소유와 종료

렌더러는 표시한 URL당 managed lease 한 개를 소유합니다. 같은 이미지를 다른 렌더러도 쓰면 공유하고, 장면 교체·노드 삭제·clip URL 변경으로 참조가 사라지면 자기 lease만 반납합니다. 같은 URL의 장면 교체는 이미지 세대를 유지합니다. 이미 로드된 숨김/화면밖 노드는 scene에 남아 있으면 유지하며 새로운 숨김 URL을 미리 로드하지 않습니다.

직접 `resources.acquireImage(url)`를 호출한 쪽은 `lease.promise` 결과/오류를 소비하고 사용 종료 시 `lease.release()`를 호출하세요. 마지막 managed lease는 자동 퇴출되지만 기존 `loadImage/registerImage`의 manual pin은 `evictImage(url)` 또는 `clearUnused()`로 명시 정리합니다. 활성 lease가 있는 entry는 강제로 퇴출하지 않습니다. pending 해제는 AbortError/code FDG_RESOURCE_RELEASED이며 네트워크 취소나 실제 GPU/메모리 감소를 보장하지 않습니다. 외부가 이미 받은 Image/Promise/lease를 계속 보관하면 객체가 남을 수 있습니다.

앱 소유자가 `renderer.dispose()`를 호출하면 자기 이미지·선택·hit/clip 참조를 정리하고 해당 렌더러는 종료됩니다. `editor.destroy()`는 외부 렌더러를 임의 종료하지 않습니다. 샘플은 `FDGDemo.dispose()`로 RAF·입력·에디터·렌더러를 함께 종료하고, pagehide의 persisted=false에서 자동 호출합니다(BFCache persisted=true는 유지).

새 수명 관리 소비 검수는 원화 디코딩/Canvas 패키지 없이 실행합니다.

```sh
FDG_TEST_OUTPUT=/absolute/path/to/resource-review \
node fdg-engine/tests/resource-lifecycle.cjs
```

## 검수와 다음 단계

각 담당자의 최초 코어·애니메이션·JSON 검수와 `tests/integration.cjs`의 실제 데모/에디터/Canvas 연결 검수를 구분합니다. 통합 검수에는 Node와 `@napi-rs/canvas`가 필요하며 기존 설치본을 사용할 수 있습니다.

```sh
FDG_CANVAS_MODULE=/absolute/path/to/node_modules/@napi-rs/canvas \
FDG_TEST_OUTPUT=/absolute/path/to/review-output \
node fdg-engine/tests/integration.cjs
```

이 버전은 별도 엔진 기반과 실행 샘플입니다. EXODUSER 전체 이식, 물리 충돌/내비게이션, 오디오 믹서, 실제 skinned 3D 렌더링, 그래픽 에셋 제작 도구는 아직 구현되지 않았습니다. 브라우저 조작·실게임 이식·GPU·동시효과 성능은 별도 인수가 필요합니다. 다음은 엔진 장면 계약을 사용한 실제 EXODUSER 보스전의 격리 이식과 성능 측정입니다. 현재 원화·전투·저장 데이터는 유지합니다.

상세 수치·소유권·검수 정본: [FDG_ENGINE_20261010.md](../docs/0마스터플랜/FDG_ENGINE_20261010.md).

## EXODUSER 보스 효과 소비

드루이드 뿌리48장 버튼이 실제7인자 표시 요청을 받아 기존 원화를400×400 샘플로 재생합니다. DruidRootsNode는 외부 진행값으로만 표시하며 본편 clock을 바꾸지 않습니다. 임시 표시 gate는 이미지를 유지하고 효과 끝은 URL을 반납합니다. 저장/불러오기는 같은 phase를 유지하며 다시 재생할 때만 독립 driver가 연결됩니다. 최초 새 source16조건·pixel159조건·Scene Studio28조건/setup3은 각각 별도epoch PASS이며 실브라우저/GPU/성능·전체보스전은 미인수입니다.

상세 API·시간·소유·시각RETOUCH: [FDG 드루이드 roots 소비](../docs/5.1임펙트디자인/FDG_DRUID_ROOTS_CONSUMER_20261010.md). 새 검수: `node fdg-engine/tests/druid-roots-consumer.cjs` (`test:roots`).
