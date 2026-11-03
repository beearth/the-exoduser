# 11-03 장판 공중 부유 P0 — Mac 실게임 판정 대기

사용자 최신 impact-brief 13:40 절·AGENT_OPERATIONS_MANUAL §2 적용. 자기 `G:/exoduser-wt/codex-impact`를 직접 수정한다. 기준 `origin/unity/main 5062b5701`. PC는 배치 컴파일1회만 하며 정식 빌드/Player/M1/시각 판정은 Mac으로 넘긴다. 사용자 실행본 미반영이며 시각 PASS를 선언하지 않는다.

## G0/G1: 원인과 제작법

사용자의 P0 지적을 결함 기준으로 삼는다. 현상 비교용 참조는 `I:/EXODUSER-Storage/demo-art/impact/ground-aoe-current/reference-floating-aoe.png`(기존894481 패키지의 실제 다리 위 가시덫)다. 최신 P0 브랜치의 재현·개선 판정은 Mac에서 한다. 최신 소스의 receiver-depth 투영에서 아래 우회/누락을 확인했으며, 고정높이 평면을 추가하지 않고 기존 GPU 지면 투영을 보완한다.

| 원인 | 수정 계약 |
|---|---|
| 투영 장애 시 원래 직립 스프라이트 복원 | 3D에서는 등록된 원본 sprite/ring을 숨긴 상태로 유지하고 투영 실패를 기록. 2D 전환/풀 재사용에서는 이전 forceRenderingOff를 정확히 복원. 누락/오류는 Mac gate FAIL이며 무시하고 반영하지 않음 |
| scene/receiver 깊이의 절대차2cm 및 scene깊이로 좌표 복원 | 수신면 깊이로 실제 XYZ 복원. opaque 물체가 수신면보다2cm 초과 앞이면 차폐. 수신면 앞에 opaque가 없는 투명 수면은 허용. 카메라의 reversed-Z/정사영 계산 유지 |
| 늪 수면 미등록 및 장판 뒤에 수면이 덮이는 순서 | 실제 A2 수면 MeshFilter를 등록. opaque 깊이 이후 수면→장판→transparent 배우/탄 순서. 수면 shader는 전용 LightMode로 이 패스에서1회만 그림. 기존 깊이 기반 거품·반사·색 수식 유지; 물 높이/지형/보행 변경0 |
| 캐릭터·소품 수신 구분 | proxy/volume 렌더링 bit30만 전용패스가 소비. 수면 color bit31은 기존 bit를 보존해 추가. 원본 배우·소품은 변경하지 않음. 수신면 법선의 위쪽 성분0.2 이상만 허용해 난간 측면/기둥 면 제외 |
| 원형·부채·선형의 vertex-colour 예고 | 기존 NativeDruidTelegraphView under 삼각형을 수직16m 볼륨으로만 압출. 원삼각형 XZ 내부와 실제수신면 깊이에서 색을 출력. 양면 원본의 중복삼각형을 제거. 공중 over 섬광/눈빛은 기존 경로. 2D에서는 원메시·재질·마스크 복원 |

투영 깊이는 기존 sprite/ring의16m를 유지한다. vertex 예고는 실제 경고중심의 지면 높이를 한 번 읽고 ±8m만 투영한다. 정점별 지형 보간/레이캐스트/적응면은 만들지 않는다. Core 판정 위치·반경·각도·시간·색/alpha의 원식·피해·RNG·세이브 변경0.

Unity 기본 decal은 투명 수신면을 지원하지 않으므로 기존의 전용 수신깊이 방식으로 늪까지 처리한다. 근거: [Unity decal 제한](https://docs.unity.com/en-us/engine/6000.0/manual/visual-effects/decals/renderer-feature-decal/decal), [렌더링 레이어 필터](https://docs.unity3d.com/ja/current/ScriptReference/Rendering.FilteringSettings-renderingLayerMask.html). 깊이/수면 순서의 수정 판단은 설치된 소스 조사에 근거한 것이며 Mac GPU 결과는 아직 없다.

## 실제 연결 범위·소유 파일

| 표시 | 경로 |
|---|---|
| 가시덫·성역 원화와 원형 링 | 기존 NativeSkillView의 Mark/SetRing → NativeGroundSkillSurface → 수신깊이 투영 |
| 독/용암 장판·필드 상태영역·지뢰·균열 선·조수 원형/예고 원 | 기존 NativeBossView ground=true 경로 → 같은 투영. 날아가는 독/물리/어둠 탄은 ground로 재분류하지 않음 |
| 리모델 드루이드 원형·부채·선형·안전영역 제외 메시 | NativeDruidTelegraphView under → NativeGroundWarningProjection. 기존 native XY 아레나는2D 복원 경로 유지. 진짜3D 지형 아레나 완성으로 보고하지 않음 |
| 접점 그을림 | 기존 ImpactGroundPatch는3D에서 URP DecalProjector를 사용하며 공중 FloorQuad는2D 전용. 이번 P0에서 Core/접점 크기 변경0 |

소유: NativeGroundSkillProjection/Surface, NativeGroundWarningProjection(+meta), NativeDruidTelegraphView, NativeGame.A2Field의 수면 등록1곳, GroundSkillProjection/ReceiverDepth/A2ToxicRiver shader, Editor/GroundAoeCompileCheck(+meta), 이 문서·관련SSOT/CHANGELOG_SYNC/작업판 자기 행. 외부 tools/guard.baseline.json WORK는 스테이징하지 않는다.

## G2~G5: Mac 검수 요청

PC compile-only 결과는 REPORT_1103.md와 고정 `ground-aoe-current/compile.json`에 기록한다. 커밋·push 후 REPORT 맨 위의 최종 SHA를 Mac이 받는다. 빌드·캡처는 `build-current`/`captures-current`에 덮어쓰고 다음 시도 전에 이전 것을 삭제한다. 검수된 빌드는 보관하지 않고 SHA와 최종 스크린샷·핵심 로그만 남긴다.

| Mac 실제 Player 장면 | 판정 |
|---|---|
| 평지·경사·다리 위·늪 가장자리 각각1920×1080 | 가시덫/성역·독 장판/원형·부채·선형·예고가 수신면에 붙음. 경사/상판/수면의 연결 틈·공중 카드0. 각 장면3배 크롭 |
| 다리의 적탄+장판 중첩, 2560×1080 및3840×1080 | 같은 Core 위치/반경, 배우·소품에 투영0, 적탄/캐릭터 가림0, UI 안전영역 유지. 화면 패딩/늘이기/블러 추가0 |
| 지면효과0 상태와2D 복귀 | 수면 정상 표시·중복수면0·거품/반사 회귀없음. 원화/예고 복원과풀재사용/종료 오류0 |
| 같은 패키지 M1·10초 무음 비교 | 정식 빌드·Shader/RenderGraph 오류0, 실제 GPU/1x 판정 후에만 공통 병합·사용자 실행본 갱신 |

현재 G2/G4/G5는 Mac 검수 대기. `VISUAL VERDICT: 미검증`. 이전 탄막/드루이드 작업은 개인 원격 d58f7663a7에 보존하고 이 P0 뒤로 둔다.
