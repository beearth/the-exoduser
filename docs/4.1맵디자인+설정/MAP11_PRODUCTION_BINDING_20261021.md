> 2026-10-21 MAP11-16 제품 아트 현행: [승인 Seedream 바닥·외곽 나무 적용](MAP11_NEW_MAP_LOGIC_PLAN_20261021.md). 아래 MAP11-15 및 이전 텍스처/성능 수치는 당시 이력이며 독립 프리뷰는 유지한다.

> 2026-10-21 MAP11-15 제품 현행: [보스룸 경계·맵 렌더 비용 보고](MAP11_FINISH_PERFORMANCE_20261021.md). R1700 충돌/Marker는 유지하고 제품 전용 뿌리·후경 숲·바닥 감쇠, 화면 밖 cull, 정적 바닥 필터 베이크, 정적 FBM 안개 캐시을 적용했다. 아래 이전 차수 수치·프리뷰는 당시 이력이며, 최신 실창 걷기 측정과 시각 판정은 연결 문서를 따른다.

> 2026-10-21 MAP11-14 현행 보충: [랜드마크·관문·제품 접합 보고](MAP11_LANDMARK_GATE_20261021.md). Main 필드는 G3/G4 RGBA로 교체, 제품zoom.70/offset(0,-180), 실제player 가림/짧은fade 연결. arena의 곡선 이중선 균열은 불규칙RGBA15fragment로 대체했다. 아래 원 검수 수치/프리뷰 상태는 해당 차수 이력이며 전체 자연전투·시각 승인 주장이 아니다.

# MAP11 제품 Main 바인딩 — 2026-10-21

MAP11-02·11의 provider/Marker/region/recipe는 변경하지 않는다. Main은 DEMO11-01이 demo stage0일 때 기존 World에 `native_map11_product` 선택을 전달한다. 기본 on, `--map11=off`는 기존 웹 이식 경로다. World 자체 스크립트 identity는 그대로여서 PC 서비스의 owner 검증을 우회하지 않는다.

| 소비자 API / 실제 계약 | 사용·책임 |
|---|---|
| `main.read_native_map11_provider()` | 실제 World/Map11ProductScene/Map11Provider Node 또는 null. 매 owner 바인딩에서 runtime_ready와 describe의 map_instance_id=`map11.field+arena`, revision=`map11.field+arena.v1` 확인 |
| Marker·지역·굴·flow | 반환 provider의 anchors(role), transition_sites(), region_sites(), spawn_budget_manifest(), spawn_sites(), prepare_flow()/flow_query() 그대로. [FIELD_PROVIDER 첫 표](MAP11_FIELD_PROVIDER_20261021.md), [STAGE_PROVIDER](MAP11_STAGE_PROVIDER_20261021.md)의 ID·Marker·region 계약 유지. 준비/경로 생성은 setup/event, tick에서는 prepared query만 |
| `main.request_native_map11_transition("enter"/"leave")` | 실제 접촉에서만 수행. field Gate→arena Entry, arena Exit→field Return. PC 완료 전 leave는 NOT_READY. 임의 좌표 fallback0. transport는 HP/ST/MP·피해·부활·kill을 쓰지 않음. arena gameplay extent128×108/T40과 render circle R1700 구분 |
| `main.bind_native_map11_gate_owner(owner)` | 기존 provider.bind_gate_consumer에 1회 위임. 37/arena owner가 있으면 그 owner의 결과·실제 Player/State readback을 확인하고 운송을 중복 commit하지 않음. 없을 때 이 단위는 map transport만 제공하며 region/보스 combat admission을 완성했다고 주장하지 않음 |
| 공간·뷰 | 기존 World map entry와 can_move/LOS/물리만 provider로 라우팅. 기존 canonical map data는 source bootstrap/formula 참조로 보존하고 geometry authority로 사용하지 않음. legacy chunk/prop/encounter/굴·지역/미니맵은 MAP11에 혼합하지 않음. 맵 blockout와 기존 arena floor/props만 재사용, 프리뷰 actor/Camera/UI/입력0 |
| 43 / 필드보스 / 45 | 43(9b763da9)은 기준 main 미병합이므로 실제 Marker actor 생성은 다음 통합. 예정32를 actor32로 세지 않음. 31/32/33은 같은 provider를 받아 실제 Marker/region을 소비해야 한다. 45는 `main.native_map11_chest`에 실제 boss_center 바인딩, PC 최종 완료/부활 판정 API가 없으면 숨김/NOT_READY. 임의 HP0/없는 actor만으로 승인하지 않음 |

직접 Main 검증·원본 상자 근거·성능 범위·공용 변경 줄은 [MAP11-PROD 보고서](../engine/orders/reports/map11-prod_REPORT.md), 상자 한 종은 [DEMO11-45 보고서](../engine/orders/reports/demo11-45_REPORT.md). Source ground/기존 HUD와 새 맵을 섞어 성공으로 보이지 않는다. 새 viewport 캡처는 렌더 하니스 자료이며 UI 수동 검수·보스전·아트 승인과 구분한다.
