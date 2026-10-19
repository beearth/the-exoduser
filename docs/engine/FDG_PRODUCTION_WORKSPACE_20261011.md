# EXODUSER 제작 작업창 · v0.18

> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

2026-10-11. 사용자의 전용 엔진 제작 지시에 따라 기존 FDG 자료와 owner 런타임을 연결한다. 목적은 **선택 → 속성 편집 → 같은 장면 실행 → 정지/한틱 검수 → 실행 조합 저장 → 재열기**다. 신규 모델이나 본편 이식 완료를 뜻하지 않는다.

| 제품 흐름 / id | 현재 계약 |
|---|---|
| 맵 기본 보기 / mapView | 일반 맵 최초 `scene`. 정지해도 실제 에셋·캐릭터·카메라의 runtime canvas 유지. `map-view-scene/edit`가 장면/충돌 편집을 전환. view 상태는 프로젝트·undo에 저장하지 않음 |
| 일반 맵 범위 | sourcePreview/sourceScene/terrainScene/rigScene 없는 map만. 기존 specialized/World 입력·저장·SSOT 분리 유지 |
| map-move-west/north/south/east | paused에서는 `walkMap(direction,{distance:10})`, running에서는 기존 `setMoveInput(direction|null)`. 같은 방향 재클릭·해제·focus가 이동 영역/캔버스 밖으로 나감·blur/hidden/pause/교체/dispose에서 해제 |
| map-input-state / map-player-position | 현재 연속 방향·정지10px와 실제 발 X/Y, 소수1자리. DOM leaf만 갱신. v0.19 stats 콜백은 running에서200ms 제한/paused는 즉시, 사용자 입력 시에도 갱신 |
| 장면1틱 | 일반 장면 paused에서 기존 `step(1/60)`·renderOnce. 캐릭터 그림24FPS와 owner60Hz를 구분; 이동 입력은 pause에서 해제됨 |
| 같은 맵의 스킬/VFX | 기존 triggerSkill/triggerVfx 소비. paused 장면에서는 배치+renderOnce만, 시간을 자동 시작하지 않음. 테스트 실행 또는1틱으로 진행. 적 피해/본편 Q/E/SFX 추가0 |
| project-copy / 작업 사본 | paused 일반 FDG 프로젝트에 새fdg_UUID ID·EXODUSER 제작 작업 사본 이름·provenance.authoringSourceProjectId를1Undo작업으로 부여. 원 import 파일/PNG/nav 변경0; running/World에서 비활성 |
| 실행 조합 표시 | 현재 선택한 characterId/skillId/vfxId의 이름. 선택 자체는 이력0 |
| preview-combination-save | 명시 클릭만 `ProjectStore.change`로 previewChoice를 project.preview에 저장. 현재 조합과 동일/running/World에서는 비활성. 기존 저장/JSON/Undo/Redo 소비. 일반 map actor/camera 현재 위치 저장은 미지원이며 재열기 때 START 복원 |
| productionReview | version1/projectId/preview/counts/checks/productionApproved:false. 순수 자료 helper, 파일·네트워크·원자료 변형0 |
| 제작 검수 / production-open | dialog에서 구조·실제 에셋 로드·게임용 클립24장/24FPS·모델 품질·스킬→VFX·성능·본편 인수7항목. ready/review/blocked/pending을 기술 준비/보완/오류/미확인으로 표시 |
| 품질 판정 | 게임용 characters.animations의 frames===24/fps===24 선언값만 비교. 고유24그림/모델/손·무기·발/8방향·시각 승인 자동PASS0. 기존 참고 모션은 게임용 본체 목표에 합산하지 않음 |
| 검사 연결 | 기존 validation.errors/route, 이미지 오류, 현재 선택 조합, optimization.measurement. 각 작업 열기는 기존 리소스 선택/최적화 패널에 연결 |
| 검수 내보내기 | fdg-production-review.json. 현재 기술 자료이며 productionApproved 항상false. 일반 맵 주행/시각을 자동 승인하지 않음 |
| World / 종료 | World에서는 제작 strip 숨김. 새 panel 리스너4개는 pagehide dispose에서 해제, 자체RAF/timer0. 부모 DOM textContent/innerHTML 교체0 |
| 캐시 | 현행 v0.19 entry/runtime/sprite-preview/CSS query v0.19.0, production-panel·review v0.18.1. specialized 모듈 version 유지. v0.18 당시 캐시는 완료 이력 |

v0.19의 캐릭터 전체 fit·VFX 관측·paused 즉시 갱신은 [별도 정본](FDG_SPRITE_PREVIEW_20261011.md)을 따른다. 아래 v0.18 실제 종주·성능·source 검수는 동결 이력이며 재실행하지 않는다.

Godot의 책임이 작은 장면 구성과 선택 대상의 속성을 바로 편집하는 Inspector를 참고한다. FDG에서는 중앙 작업창과 기존 리소스/owner를 연결하는 설계로 적용했다. [Godot 장면 구성](https://docs.godotengine.org/en/stable/tutorials/best_practices/scene_organization.html), [Inspector](https://docs.godotengine.org/en/stable/tutorials/editor/inspector_dock.html).

| 단계 | 제작물 · 인수 기준 | 현행 |
|---|---|---|
| 1 · 실제 제작 루프 | 실제 에셋 장면에서 편집/입력/정지/한틱/조합 저장·재열기 | 이번 단위 구현·실화면 확인 중 |
| 2 · 캐릭터 본체 | 승인 에셋의 모델·손/무기·발 리그, 실제 고유24장·24FPS, 방향별 게임 크기 검수 | 신규3종 참고 자료만; 본체 미완료 |
| 3 · 본편 소비 | 기존 caller에서 준비/타격/회복·SFX/VFX·적 피해를 같은 리소스로 소비, Q/E·save·LOCK 유지 | 미구현; 독립 preview와 구분 |
| 4 · 생산 인수 | 실제 구간·다수 적·동시 스킬 조건에서 GPU/CPU·메모리·기기 실측, visual 승인 | 미확인; Canvas 미리보기 FPS로 승격하지 않음 |

백업은 tmp/fdg-production-workspace-20261011/backup/과 runtime 담당 백업에 보존한다. 신규 runtime 검사5/5 PASS, 기존 suite·완료 source-v17 검사 재실행0. 공개 UI/저장/§23 최종 결과는 아래 검수 기록과 FDG_QA에 동기화한다.


## v0.18 공개 UI 최종 인수 · 2026-10-11

| 새 실제 검수 | 관측·범위 |
|---|---|
| 일반 map 정지/한틱 | START4020,7740→north10px→4020,7730. walk clock0 유지, step1/60 후 UI0.017초, 실제 canvas 유지 |
| Play 방향/해제/pause | 공개 북쪽 연속 입력→4020,7297.3에서 벽 정지, 해제/pause9.300초·화면 유지. synthetic speed156/radius12와 실제 R10 speed320/radius15 구분 |
| R10 실제 종주 | START4020,7740→restQA4660,6700→동측6060,5220→EXIT4020,1740. retained 공개10px 입력955/실패0. 최초109개는 tool timeout으로 개별 trace 미보존·public 중간4380,7010과 계획 index로 추론만; retained 성공 수에 합산0. 현재 위치에서 adaptive 경로 계획 후 공개 입력만 소비, teleport/forceXY0. paused clock0 |
| 원본/사본 | 원본 public R10 save/reopen/export 전체 JSON 동일. 별도 fdg_0559d478-f842-468c-89d7-cfc7e37f806f·authoringSourceProjectId 원 R10 유지 |
| 실행 조합 복원 | VFX 제작 사본 draft_3a954a82-61ed-4d27-89b2-b04ab5315668 선택→명시 조합 저장→save/export/reload/export, 전체 JSON·preview.vfxId 동일. live actor 위치는 재열기 때 START 복원 |
| 신규 캐릭터 자료 | 기존 참고3종 연결/save/reload, 모델/발/8방향 미확인 표시. 게임용 idle2/1FPS·walk8/12FPS의 24장/24FPS 미달2/2를 표시. 참고 모션을 본체 완성으로 승격0 |
| 같은 맵 스킬/VFX | paused 배치 전/후 clock0.000초, 한틱 후0.017초·actor4020,7740·canvas visible. triggerSkill/triggerVfx 독립 미리보기이며 적 피해/본편 Q/E/SFX 연동0 |
| 검수 작업 연결 | 7항목·267셀 기술 경로와 실주행 구분, 캐릭터 작업 열기/최적화 측정 열기/public JSON 출력. productionApproved:false 유지 |
| 동시 효과 측정 | 6초·동시4회·최종600 sample 표시. P50/P95/P99=8.30/9.70/10.20ms·CPU P95 0.30ms·평균120.02FPS·입자max96·Canvas 호출max251·누락틱0. 현재 host Canvas 제작 미리보기이며 GPU/native/실전 FPS/실제 VRAM 인수 아님 |
| 검증 | 새 runtime 최초5/5 PASS. root 자료 보존/오승인 방지와 route.path 표시의 한정 확인2개·JS syntax PASS. 기존 suite/source-v17/기존 PNG·hash 증거 재검사0 |
| 시각/경계 | START/restQA/east/EXIT foot·지면 실제 표시. 2D plate 계단은 물리 높이 소비의 증거가 아님. 확대 blur·남단20px 미피복 RETOUCH, fullproduction FAIL/UNADOPTED. 전체 camera/전투/seam/GPU 검수 아님 |
| 증거 | tmp/fdg-production-workspace-20261011 실제 화면·public exports·조합 proof·trace·측정·engine-review.md(§23). 외부 engine-preview-r10-first에는 새 v018-증거만 인수 |
