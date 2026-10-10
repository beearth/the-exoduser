# FDG 드루이드 뿌리48 외부 진행 소비 — 2026-10-10

`ROOT-FDG-DRUID-ROOTS-CONSUMER-20261010`은 기존 EXODUSER 보스 효과 요청·진행값을 별도 FDG 장면에서 소비하는 첫 전용 adapter다. ROOT+기존 engine_runtime/engine_animation/engine_editor를 재사용했다. 본편 `game.html`과 전투·Q/E·RNG·save·원PNG/JSON은 변경하지 않았다. 별도 Scene Studio의 재생 샘플이며 전체 보스전 이식이 아니다.

## 실제 요청과 엔진 경계

| 항목/API | 현행 계약 |
|---|---|
| 원 caller | `game.html`의 `case 'bossDruidErupt'`, `!_eruptHit && st2<=(_eruptMax-8)`에서 한 번 `playVFXAng('druid_roots',_erX,_erY,_erR*2/256,7,0,false)`; `_erR=e.r+120` |
| 요청 위치 | 일반 e.x/e.y, finale _diveTx/_diveTy. FDG sample 좌표와 실제 보스 좌표를 구분하며 producer 수정0 |
| 원 진행 | maxFrames10/frameTime7, 명목70 render 진행. born clock 분기/_vfMix·일반 t/frameTime은 본편 owner가 처리; FDG node가 대체하지 않음 |
| `FDG.DruidRootsNode` | type=`DruidRoots`, constructor `{id?,name?}`. 실제 요청7인자와 외부 snapshot을 받아 표시. 자체 `_physicsProcess/_process` 진행0 |
| `request(id,x,y,scale,frameTime,angle,isSkill)` | id=druid_roots/frameTime7/isSkillfalse 고정; x/y/angle finite, scale>0·256×scale finite. 위치 x/y/z0·rotation=angle·width=height=256×scale, pivot(.5,.5), lighter. 처음 snapshot frame0/fraction0/alpha1/alivetrue/drawAllowedfalse |
| `syncLegacy(snapshot)` | request가 먼저 필요. frame safeinteger0..10/maxFrames10, fraction[0,1)·frame10에서는0, effectiveAlpha[0,1], alive/drawAllowed bool. 검증 후 atomic 적용, 잘못된 입력은 이전 상태 유지 |
| 외부 진행·종료 | `(frame+fraction)/10`을0..1로 제한하여 clip reference seconds에 매핑. 생존/종료·cull/budget는 외부 owner snapshot이며 node는 스스로 만료하지 않음. phase1 sample은 마지막 셀47 |
| atlas | 기존 `assets/vfx/boss/druid_roots_48_20261010.png`를 `../assets/` URL로 공유. 3584×2688/448셀/8×6/48장/fps288÷7/nonloop/reference7÷6초. 새 PNG/JSON/job0·동적 clip JSON fetch0 |
| 한 셀 표시 | row-major 현재셀 source inset1→446×446; 중심(.5,.5)/원256×scale 표시. phase 변경은 Image/clip 복제0 |
| 표시 gate·URL | request/snapshot/alive인 node는 drawAllowedfalse여도 URL 유지. renderer `_sprite`가 drawAllowed===false를 image acquire/draw 전에 skip. 첫 gated node eager acquire0·기존 acquired lease 유지 |
| 끝·미요청 | alivefalse 또는 미요청은 imageUrl:''/rect:null로 URL retire, geometry 객체와 node/snapshot은 유지. 다음 render가 자기 lease 반납. manual pin/외부 Image 참조/실RAM·GPU 해제는 별도 계약 |
| 직렬화/factory | frozen legacyRequest7배열+legacySnapshot+사용자properties. `FDG.ExoduserFactories.DruidRoots`로 복원; core가 복원한 공통 position/rotation/scale/visible을 덮어쓰지 않고 같은 phase 유지 |

본편 ready48/원10폴백은 기존 main 계약이다. 이 FDG node는 승인된48 atlas를 지정하며 이미지 pending/실패는 기존 FDG renderer의 표시 대기/오류 계약을 사용한다. 본편의 원10 fallback 또는 GL queue를 FDG에 이식했다고 주장하지 않는다. FDG는 Canvas renderer이며 main의 GLadditive 제출은 이번 범위가 아니다.

## Scene Studio 소비

| 항목 | 실제 구현 |
|---|---|
| 로드 | classic `core→animation→exoduser→druid-roots-preview→renderer→editor→demo`; CommonJS index는 앞의6모듈만 export하고 demo 자동실행0 |
| 새 버튼 | `fdg-druid-roots` / 드루이드 뿌리48장. 현재 scene의 첫 DruidRootsNode를 재사용하거나 생성하고 같은 child driver를 재bind하여 반복 재생시 누적0 |
| sample 요청 | previewRadius80, x0/y−170/z0/angle0, scale(80+120)×2÷256=1.5625→400², isSkillfalse. 실제 보스 반경/좌표를 바꾼 값이 아니라 독립 샘플 기준 |
| `DruidRootsPreviewDriver` | type 동일명, target의 child·같은 tree만 bind. fixedStep=1/60만 허용, 1 physics step→legacy tick1, frame=floor(tick/7), fraction=(tick%7)/7, alpha1 |
| 샘플 끝 | tick70에서 frame10/fraction0/alivefalse/drawAllowedfalse, driver.stop. 참고70÷60=7/6초; slow frame의 maxSteps/drop 정책으로 벽시계 7/6초 또는 모든48 자연 노출은 보장하지 않음 |
| pause/step | SceneTree pause에서 driver 전진0, stepOnce는 paused 상태 그대로 tick1. node 자체 시간은 언제나 외부 입력만 진행 |
| JSON import | node 요청·phase·공통 transform·visible 복원, driver target binding은 저장하지 않아 imported snapshot은 재생 버튼 전 진행0. 성공 import는 기존 editor대로 pause |
| 재생/삭제/종료 | 버튼은 요청·driver reset 후 pause 해제. 실제 tree 교체 전 옛driver.stop, child/효과 삭제 _exitTree stop, demo.dispose stop+기존 RAF/입력/editor/renderer 종료. stale callback은 기존 terminal guard로 무진행 |
| 다른 fixedStep | 1/60이 아닌 imported scene은 새뿌리 재생을 거절·리프 상태 안내. scene clock을 임의 수정하거나 이미 저장된 snapshot을 지우지 않음 |
| 상태 UI | 현재 node.width/height·현재 원화셀+1/48 표시. 반경80은 새버튼 도움말의 샘플 기준, 다른 크기 imported node를400²로 오표시하지 않음 |
| 초기 장면 | 기존7노드 유지. 첫 버튼은 뿌리/driver2노드를 더해9노드; 기존불꽃24 버튼과 actor 유지 |
| 새 검수 명령 | `node fdg-engine/tests/druid-roots-consumer.cjs`, package `test:roots`; FDG_TEST_OUTPUT으로 외부 witness 위치 선택 |

## 소유와 최초 검수

| 소유/epoch | 이번 결과 |
|---|---|
| runtime | 신규 src/exoduser.js·tests/druid-roots-consumer.cjs. 최초 source Node1/7그룹16조건 PASS/FAIL0/PNG0. 준비 Python IndentationError1은 제품쓰기·실행 전 별도 이력 |
| ROOT renderer | `_sprite`에 drawAllowedfalse skip 단1hunk; active URL과 일시 표시 gate를 분리해 acquire churn 방지. 첫 실행 전 refinement이며 기존 lifecycle suite 재실행0 |
| editor | demo/indexHTML/indexCJS/package/신규 preview driver. 최초 actual7scripts·minimalDOM/통제Image/noopCanvas 소비 Node1/9그룹28조건 PASS/FAIL0, setup3 별도/PNGdecode0 |
| animation | 기존 승인PNG를 새 adapter+actual renderer에서 최초 decode1/registerImage1, Node1/159조건 PASS/FAIL0. 48 midpoint·literal-grid/inset1 black/gray pixel oracle exact, r80→400/r22→284·부모affine/angle/alpha/contextrestore·gate/끝/삭제 lease검수 |
| cache 검수 경계 | native Image를 manual pin으로 등록해 oracle와 renderer 공유. active lease1→end/삭제 refCount0에서도 pin 유지, explicit clearUnused로 missing. 실RAM/GC/GPU 감소량 검수 아님 |
| 정적 finding | ROOT gate churn 보강 및 import크기 UI 오표시1 모두 첫 해당 실행 전에 교정. 실행후 제품수정0·완료suite/옛PNG packing·원화 측정 재실행0 |

서로 다른 epoch의 조건을 합산하지 않는다. 원문/witness/owned backup/inverseexact는 `E/fdg-druid-roots-consumer-20261010/`에 보존한다. 관련 docs keyword검색1회 후 현재 FDG 계약만 동기화하고, 회사명 FDG/옛팀 dispatch·무관한 서사 매칭은 후속read/hash/채택/쓰기0으로 분류했다. 첫 넓은 검색 stdout의 무관 snippet 포함은 외부 영수증에 보존했으며 같은 query 재실행0이다.

## 시각 판정과 남은 작업

ROOT와 animation 담당자가 새 FDG 실제 CPU Canvas48 contact를 직접 판독했다. 황록색 핵·분기·소산과 요청 크기400/284의 표시를 확인했으며 새 adapter 셀/픽셀 mismatch0이다. 원화의40→41잔가지 재증가·후기 원점 추정은 그대로 남아 있다. **VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED**. 독립 engine 표시 proof이며 EXODUSER 인게임 캡처·실브라우저·본편 보스전 검수가 아니다.

전체 EXODUSER 엔진 전환·전체 보스전/collision/navigation·오디오 mixer·실skinned3D·GPU renderer·native UI/정상줌·동시효과 성능·실청취/save·AAA 인수는 미완료다. 후속은 같은 완료 테스트를 반복하는 감사가 아니라 구체적인 새 FDG 보스 소비 또는 실제 필요한 물리/오디오 범위 한 단위다.
