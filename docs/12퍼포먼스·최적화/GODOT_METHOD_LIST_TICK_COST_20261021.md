# Godot 포트 — 물리 틱 검증 비용 18ms → 0 (2026-10-21, PC Claude)

> 계기: 사용자 "프레임이 좀 이상한데"(PC 실창 측정 창이 끊겨 보임). PC Windows, Godot 4.7.2 공식 빌드.

## 1. 증상

| 측정(최신 main 010515993, Main 부팅·물리 300틱 고정 벤치, 헤드리스) | 값 |
|---|---|
| 물리 1틱 실제 시간 | 18.4~19.6ms — 60Hz 예산 16.7ms 초과 → 시뮬레이션이 실시간을 못 따라감 |
| 렌더 프레임당 물리 틱 | 약 8 (300틱에 렌더 38회) |
| 렌더 1프레임 | 141~155ms(약 7fps) |

빈 장면은 물리 1틱 0.08ms. 맵 룩 ON/OFF 차이 없음, 19a713578(10-20 오전) 커밋도 동일 → 최근 병합 회귀 아님.

## 2. 원인 추적

| 단계 | 결과 |
|---|---|
| 노드별 처리 끄기(일반+물리) | world −4.5ms, player −4.4ms/틱 |
| player `_physics_process` 구간 계측 | 자연 회복 단계 `_native_resource_regeneration.advance_native` **16.5ms/틱** |
| `native_source_player_regeneration_phase.gd` 단계 계측 | `_binding_error()` **약 18ms/호출**, 실제 회복 계산(dome·holy_flat·rates·hp·natural)은 합계 ~1.6ms+ |
| `_binding_error` 내부 | `_method_accepts()`가 검사마다 `value.get_method_list()`로 대상 객체의 메서드 목록 전체(스크립트+CharacterBody2D/Node 기본 메서드 수백 개, 각 항목 Dictionary)를 새로 만들어 선형 탐색 — 틱마다 15회 이상 |

같은 `get_method_list()` 패턴: `native_combat_qe_adapter.gd`, `native_resource_regeneration_adapter.gd`, `native_source_player_regeneration_phase.gd` 3곳(전수 grep).

## 3. 수정

`_method_accepts()`에 정적 캐시 `_METHOD_ARITY_CACHE`를 둔다. 키 = (스크립트 인스턴스 id 또는 엔진 클래스명) + 메서드명, 값 = [최소 인자 수, 최대 인자 수] (없으면 빈 배열). `has_method()` 확인은 매번 그대로 하고, 인자 범위만 최초 1회 `get_method_list()`로 계산한다. 스크립트는 실행 중 바뀌지 않으므로 판정 결과는 이전과 동일 — 검증 생략·약화 없음.

## 4. 결과

| 측정 | 수정 전 | 수정 후 |
|---|---|---|
| 물리 1틱(헤드리스) | 18.5ms | **16.67ms = 60Hz 실시간 정확 유지** |
| 렌더 1프레임(헤드리스) | 141~155ms | **7.4~7.9ms** |
| 렌더 1프레임(실창 1920×1080, 렌더링 포함) | — | **6.1~6.7ms (약 150~160fps)** |

회귀(PC): test_native_qe_binding·test_native_resource_regeneration_binding·test_native_source_player_regeneration_phase·p2001j/k/l·p2005d_ice_orb·p2005d_regen_wiring·contracts·p1002g·starter_state 11종 0실패.

## 5. 교훈 / 규칙

- 틱 경로에서 `get_method_list()`·`get_property_list()`·`get_signal_list()` 같은 **목록 생성 API를 호출하지 않는다**. 계약 검증이 필요하면 최초 1회 계산해 캐시한다.
- 성능 측정은 Godot `Performance` 지표만 믿지 말고 **고정 틱 벽시계 벤치**(물리 N틱 동안 실제 시간·렌더 프레임 수)로 확인한다. 이번 건에서 `TIME_PHYSICS_PROCESS`는 원인 노드를 꺼도 줄지 않아 오판을 유도했다.
- PC에서 창을 화면 밖에 두고 재면 Windows가 백그라운드로 느리게 돌려 수치가 무효다(2026-10-20 맵 룩 측정 기록). 벤치는 헤드리스 또는 화면 안 창으로.
