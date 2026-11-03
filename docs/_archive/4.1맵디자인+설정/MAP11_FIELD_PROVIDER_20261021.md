# MAP11-11 — 필드·아레나 static geometry/provider 계약

| 소비자·이름 계약 | 공급 값·책임 경계 |
|---|---|
| DEMO11-43 `9b763da9` `native_stage_spawn_adapter.gd:25–98` | 독립 `field_runtime.tscn` Node2D. `describe`: stage_id=`map11`, stage_index=0, instance=`map11.field+arena`, 문자열 revision=`map11.field+arena.v1`. `anchors("hole")`, `region_sites`, `spawn_budget_manifest`, `spawn_sites`, `region_at` 제공. 실제 Main 설치·적 선택·RNG·registry·kill writer 추가 없음 |
| 필드 기존 Marker | `FieldMarkers/{Start,Early,MainArena,WestLower,West,WestUpper,EastLower,East,EastUpper,Landmark,LandmarkEast,Late,Gate,Return}`. `map11.field.*` 14개 ID·위치·role·clearance96 그대로. `anchors("*")`는 필드14+아레나4+굴4=22 합본; `anchors("hole")` 굴4 필터 |
| DEMO11-37 `05f41cc7` `native_demo11_encounter.gd:9,28–35,49–85` | **`Markers/Entry·Boss·Exit·Return` 유지**, `map11.arena.entry/boss/exit/return`. 원형 R1700. 별도 공간 offset `(0,-8000)`은 독립 provider 조립 좌표이며 웹 좌표가 아님. `transition_sites`: FieldMarkers/Gate→Markers/Entry; arena Exit→field Return. arena Return과 field Return은 서로 다른 ID·공간 |
| gate 권위 | `bind_gate_consumer` 최초 reflection 단발, 기존 owner `bind_provider`에 위임. 실제 접촉만 `request_gate_enter/leave`→기존 encounter `enter/leave`. 잠금·보스 생성·player 위치·State·clear/DEMO11-38는 기존 writer. 이 단위는 연결 호출 API까지이며 제품 Main 자동 설치 없음. 소비자 본체가 현재 main에 없어 실제 제품 통합 실행은 미확인; 콜백 fixture 검증과 구별 |
| 4지역·굴 | ID0 NW,1 NE,2 SW,3 SE; fb_index 동일. gate_region_id=0. 공유 경계 작은 ID 우선. 기존 west/east/early/east_lower anchor에 `HoleMarkers/{west,east,early,east_lower}`, `map11.field.hole.{suffix}` / `{id}.group`; 크기.3·room0은 이번 최소 저작 배치. 지역 각각 1굴, 원본 S50→`ceil(ceil(50×.5)×.3)=8`, 예정 합32. 기존 NativeSpawnHoleSystem API 재사용. 이것은 생성 actor 수/원본 웹 굴 배치 복원이 아님 |
| boss extent | 기존 arena provider `mw128/mh108/T40` 그대로. 필드 bounds·arena R1700으로 공격식을 대체하지 않음. 근거 최신 main game.html G16631(T40), G30697–30700(mw/mh), G37938–37942(fissure), G37949–37958(tide). 예정 분모 근거 G31029–31030; kill 귀속 writer는 DEMO11-43 G60725–60732 계약 유지 |

## 구성·geometry·flow

기준 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`를 fetch 후 고정했다. MAP11-02 `6bcc483d282c44f46d328f5f683fe27df0a8dd14` merge `11a6a6f2`, MAP11-07 `3f9c87a49c117c0172f899c97b83dbabd2ecf0c4` merge `f4cc900a7970d6cf2f5602733fa6695283311eb4`. 소비자 두 SHA는 계약 읽기 전용이며 다른 담당 변경을 반입하지 않았다. 번역 merge 충돌은 main 기존 바이트를 보존하고 인수된 MAP11 검수 문구 절만 추가했다.

`field_runtime.gd`가 기존 FieldRecipe/FieldProvider와 ArenaProvider를 compile-once 재사용한다. 필드 polygon·4원형 solid·4지역·14anchor·15route는 `3f9c87a4`와 동일하다. 동일 recipe로 StaticBody2D/CollisionPolygon2D/CircleShape2D를 만들며, scalar can_move/LOS/continuous sweep는 기존 compiler를 쓴다. arena physics 외벽은 analytic R1700의 외접 128각형으로 내부 원을 줄이지 않는다(최대 방사 오차 <0.52px). 두 공간 사이 통로/LOS를 만들지 않고 gate 접촉으로 전환 요청한다.

content_valid는 컴파일 내용, runtime_ready는 tree 수명·동일 transform·양 provider revision·실제 Marker 생존/위치를 검사한다. root는 평행이동만 허용하여 반경/기술식을 스케일하지 않는다. 퇴역·Marker 이동/삭제·transform 변경·알 수 없는 space/target/cache는 fail-closed다. query가 State를 쓰거나 임의 직선 추종으로 보정하지 않는다. 실제 collider/Marker를 교체할 때는 새 runtime/revision을 설치해야 한다.

`field_flow.gd`는 명시적 `prepare_flow(target_id,radius)`에서만 200px grid, 8방향 swept edge, target visibility seed 및 Dijkstra integration을 생성한다. caller는 안정된 anchor target·agent radius별 key를 보관한다. identity/revision/target/radius로 cache를 분리하고 최대8개, radius `(0,96]`만 허용한다. setup은 tick 밖에서 호출해야 한다. `flow_query(key,world_point,reused_out)`는 캐시·9개 인접 후보를 scalar 순회하고 현재점→waypoint sweep도 확인한다. 목록/경로/메서드 목록 생성 API를 tick에서 호출하지 않는다. 비가시 waypoint/불법 시작은 INVALID_QUERY 또는 UNREACHABLE; 미준비/퇴역은 NOT_READY. 200px grid로 표현하지 못하는 좁은 통로는 성공을 가장하지 않고 UNREACHABLE가 될 수 있다. 현재 형상에서 mass를 실제 우회해 보스문에 도착하는 테스트를 둔다.

## 검증·성능

| 실행 | 결과·한계 |
|---|---|
| 신규 격리 | `EXODUSER-map11-11-Isolated-20261021`, headless OS.get_user_data_dir 실제 확인. 49/0, ERROR0/WARNING0. headless 실제 격리 경로 확인 |
| 직접 회귀 | field41/0 · actual walk49/0(12,003 motion call/4지역) · arena54/0 · malformed schema3/0, 각각1회. 합147/0, ERROR0/WARNING0 |
| 120fps 질의/flow 벤치 1회 | 2,000회/165.167ms, flow+LOS+sweep 묶음82.5835µs. 1,184node 준비152.132ms(틱 밖/loading). M5Pro headless CPU 벽시계1회, 120fps frame8.333ms의0.99%; map CPU1.25ms 기준15묶음(1.239ms). 더 많은 entity/복잡한 질의는 추가 예산 필요. 제품 render FPS 보장 아님 |
| 초기 실패 | class cache 미생성으로 native_spawn_hole_system 전역 클래스 compile ERROR6, exit−15(자기 실패 프로세스 종료). 원문 보존 후 editor import ERROR0/WARNING0. 통과로 집계하지 않음 |
| 변경 경계 | Main·State·World·카메라·전투·저장 0줄(main 기준). 아트·기존 field recipe/preview·arena preview는 MAP11-02/07 인수 의존 merge 기준 변경0줄; 의존 merge가 추가한 기존 아레나 에셋은 신규 제작으로 집계하지 않음. 새 독립 runtime/flow/scene/test 및 관련 문서. 실제 제품 소비자 설치는 각각 기존 owner 통합 작업 |

원로그·pgrep/30초 대기·실패 원문·벤치: `~/exoduser-wt/_out/map11-11/`. 실행마다 override.cfg 격리 설정 후 0byte로 비운다. 기존 회귀는 각 파일 USERDIR 상수 사용. 가짜 PASS/실제 사용자 저장 접근 없음. Node/OS.execute 하니스 사용 없음. 기존 compiler 회귀의 duplicate/outside/route sweep/도달 불가 거부 검사 유지.

## MAP PRODUCTION REPORT (§23)

작업 범위: MAP11-11 기술 provider. MASTER PLAN/OUTER MASS/MEDIUM CONNECTION/GROUND/PLAYABLE/LANDMARK/DETAIL/CAMERA QA는 인수된 MAP11-07 형상을 재사용하고 이번에 시각 수정하지 않았다. 승인 형상: 남쪽 기상→두 순환 고리→북중부 시체나무+심장제단→보스문, 9050×8250 field와 R1700 arena. 신규 아트/이미지 생성/캡처 없음. TECH QA는 위 실제 테스트/질의 벤치, VISUAL VERDICT: **RETOUCH (MAP11-07 G1 눈 검수 대기 상속)**. 기술 PASS를 눈 검수 PASS로 대체하지 않는다. 보스룸01c 방향 임시 승인/바닥 proof·외곽 occlusion 마감 대기는 기록만 하며 수정하지 않음. 다음 인수: DEMO11-37/43 owner가 이 독립 provider를 실제 World 아래 설치하고 기존 writer와 수명 계약을 통합 검수한다.

## 2026-10-21 MAP11-PROD 소비 연결

공급자/Marker/region 계약과 위 첫 표의 제공 값은 그대로다. Main 제품 경로에 기본 MAP11을 연결한 후속 소비 단위는 [제품 바인딩 계약](MAP11_PRODUCTION_BINDING_20261021.md). 실제 root 참조·gate 운송·legacy 플래그·미병합43/PC 완료 경계·검증은 해당 보고서에 분리하며 이 provider의 원 검증 수치를 다시 인용해 제품 통합 PASS로 바꾸지 않는다.
