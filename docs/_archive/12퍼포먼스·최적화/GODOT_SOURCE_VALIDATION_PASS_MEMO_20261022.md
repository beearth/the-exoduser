# Godot 포트 — PC source 검증 중복 제거 (검증 패스 메모) (2026-10-22, PC Claude, PC-SOURCE-PERF)

> 계기: Mac MAP11-32c 측정에서 필드·보스방 p95 9.1~9.3ms(120fps 예산 8.33ms 초과). 맵 층 ON/OFF 차이 ±0.4ms, 주원인은 PC source 검증 경로.
> 브랜치 `claude/pc-source-perf-20261021` (base Mac integ6 d5b842df, origin/main abc3dd442 포함).

## 1. 원인

Services → Providers → State → Resources 네 owner의 검증 함수가 공개 읽기 창구(`is_*_ready`, `get_native_source_*`, `get_provider_bundle`, 도메인 Readers, `read_current_resource_parameters`)를 통해 서로를 다시 부르며, 바깥 검증 1회가 안쪽 검증을 기하급수적으로 반복했다.

| 바깥 1회 | 안쪽 반복(수정 전, 실측) |
|---|---|
| `Services._context_error()` | Providers `_context_error` 약 11회, State `_current_error` 약 20회, Resources `_current_error` 약 88회 (bypass 기준 평가 73회) |
| `Providers._context_error()` | `_ownership_error` → `State.is_native_new_run_state_ready` → `State._current_error` → `Resources` ×3~4, 이어서 `Resources.is_native_source_resources_ready` |
| `State._current_error()` | `_actual_fields_error`가 판정만 하려고 `Resources.read_current_resource_parameters()`(Dictionary 3개 생성 + `_current_error` 2회)를 호출 |

Windows 재현(헤드리스, `--fixed-fps 120`, P코어 고정, 필드 600틱 보행, 계측 빌드, 렌더 프레임당 평균):

| 함수 | 호출/프레임 | 포함 시간 ms/프레임 |
|---|---|---|
| main.gd::_process | 1.0 | 8.10 |
| main._advance_native_source_clock_input | 1.0 | 6.30 |
| services.capture_native_source_render_input | 1.0 | 6.28 |
| services._context_error | 9.0 | 8.96 |
| providers._context_error | 101.2 | 7.81 |
| providers._ownership_error | 101.2 | 6.90 |
| providers._read_domain | 51.5 | 6.41 |
| state._current_error | 183.4 | 7.37 |
| state.is_native_new_run_state_ready | 103.2 | 5.13 |
| resources._current_error | 796.7 | 4.50 |
| resources.is_native_source_resources_ready | 395.6 | 2.82 |
| resources.read_current_resource_parameters | 199.6 | 3.71 |

Mac 수치(State 153회, Resources 664회)와 같은 구조다. 포함 시간은 중첩이라 합산하지 않는다. 계측 래퍼 자체 비용이 포함되어 있다.

## 2. 수정 — 검증 패스 메모 (`godot/scripts/native_source_validation_pass.gd`)

| 위치 | 변경 |
|---|---|
| `native_source_validation_pass.gd`(신규) | 정적 `depth`·`pass_id`. 메모 검증 함수 진입 시 depth 0이면 새 pass_id. `reusable(stored)` = `depth>0 and stored==pass_id and not bypass`. 진단 카운터 `evaluations`/`hits`, 테스트 전용 `bypass` |
| `Resources._current_error` | 래퍼 + `_current_error_uncached`(원 본문 그대로) |
| `Resources.is_current_resource_parameters_ready()`(신규) | `_parameters_valid(read_current_resource_parameters())`와 같은 판정을 packet 없이 반환(= `_current_error().is_empty()`) |
| `State._current_error` | 래퍼 + `_current_error_uncached` |
| `State._actual_fields_error` | `read_current_resource_parameters()` 판정 → `is_current_resource_parameters_ready()` |
| `State.read_current_p` | 본문 전체를 한 패스로 실행(`_read_current_p_in_pass`) |
| `Providers._context_error` | 래퍼 + `_context_error_uncached` |
| `Providers._read_domain` | 한 패스(`_read_domain_in_pass`) |
| `Services._source_owner_error` / `_context_error` | 래퍼 + `*_uncached` |
| `Services._read_domain` | 한 패스(`_read_domain_in_pass`) |

검사 항목·순서·반환 문자열은 하나도 바꾸지 않았다(`*_uncached`는 원 본문 그대로). 메서드 목록 API(`get_method_list`/`get_property_list`/`get_signal_list`)는 추가하지 않았다.

### 2.1 왜 "틱 단위"가 아니라 "바깥 검증 1회 단위"인가

지시는 틱 단위 결과 캐시(owner identity + revision)였다. 그러나 틱 단위로 이월하면 같은 틱 안의 원시 변경을 다음 호출이 놓친다. 기존 회귀가 바로 이 경우를 검사한다.

- `test_native_main_source_starter_state` `_test_lifecycle_and_grit_loss`: `raw_grit.unpublish()` 직후 같은 프레임의 `grit_total.call()`이 NOT_READY여야 한다. `source_state.free()` 직후 reader는 즉시 null이어야 한다.
- 메타 `set_meta`, `world.player` 대입, 재부모, `hp`=NaN은 엔진 알림이 없어 revision으로 다 잡을 수 없다.

그래서 재사용 범위를 **바깥 검증 1회가 실행되는 동안**으로 좁혔다. 바깥 호출이 끝나면 depth가 0으로 돌아가고, 다음 바깥 호출은 새 pass_id로 전부 다시 검증한다. 틱 안에서도 호출 사이 이월은 0이다. 요청된 무효화 조건과의 대응:

| 무효화 조건 | 처리 |
|---|---|
| owner 교체(World.player, Main.source_state, claim meta) | 다음 바깥 호출이 새 패스 → 재검증. 테스트로 확인 |
| scene 변경(Main 해제, Player Tree 이탈, holder 재부모) | 동일. 테스트로 확인 |
| State revision 변경(owner 쓰기, `_owned.mp`, Player hp/iframes 값) | 동일. 테스트로 확인 |
| 재진입 | 같은 owner가 자기 본문 실행 중 재진입하면 메모가 아직 저장 전이라 다시 평가(원래 동작과 같음). 중첩 scope는 depth로 정확히 풀림. 다른 owner 인스턴스는 메모를 공유하지 않음 |

### 2.2 정확성 근거(패스 안 무변이)

패스 안에서 실행되는 코드는 모두 검증 입력을 쓰지 않는다.

- 검증 본문 자체: `is_instance_valid`·`get_parent`·`get_meta`·`get()`·`has_method`·`get_combat_world`·Tree 비교·숫자 유한성만 읽는다.
- `State.read_current_p`: 소유 `_p` dict 동기화만 쓴다. `_p`는 어느 검증의 입력도 아니다. `player.read_native_source_initialization_fields()`는 순수 읽기다.
- Providers Readers / Services Readers: 위 읽기만 호출한다.
- `_options.read_current_options()`: Services 소유 OPT는 주입 reader가 없다.
- `raw_grit.current_container()`: 순수 읽기.

`enter()`/`leave()`는 원 본문을 감싼 짧은 래퍼에서만 호출한다. 본문에서 GDScript 런타임 오류가 나도 그 본문만 중단되므로 depth가 올라간 채 남지 않는다. 스레드에서 검증을 부르는 경로는 없다(정적 변수 공유 전제).

`is_current_resource_parameters_ready` 동치: `read_current_resource_parameters()`는 `_current_error()`가 비어 있을 때만 READY다. 값 6개 중 st/mst는 `float(Player.stamina/max_stamina)`이고, 같은 `_current_error`가 `_number(stamina/max_stamina)`를 이미 확인한다. mp/mmp/stR/mpR은 `OWN_FIELDS` 유한성을 확인한다. `_source_boot["source"]`는 초기화 검증 때문에 항상 존재한다. 그래서 두 판정은 모든 상태에서 같고, 테스트가 매 시나리오에서 대조한다.

## 3. 결과

### 3.1 함수별(계측 빌드, 필드, 렌더 프레임당; 전 → 후)

| 함수 | 호출 전 | 시간 전 | 호출 후 | 시간 후 | 실제 평가(후, `*_uncached`) |
|---|---|---|---|---|---|
| main.gd::_process | 1.0 | 8.10 | 1.0 | 1.90 | — |
| capture_native_source_render_input | 1.0 | 6.28 | 1.0 | 1.20 | — |
| services._context_error | 9.0 | 8.96 | 9.0 | 1.42 | 9.0 |
| services._source_owner_error | 9.0 | 2.38 | 9.0 | 0.74 | 9.0 |
| providers._context_error | 101.2 | 7.81 | 101.2 | 1.57 | 29.2 |
| providers._ownership_error | 101.2 | 6.90 | 29.2 | 1.20 | — |
| providers._read_domain | 51.5 | 6.41 | 51.5 | 0.78 | — |
| state._current_error | 183.4 | 7.37 | 111.4 | 1.43 | 59.9 |
| state.is_native_new_run_state_ready | 103.2 | 5.13 | 31.2 | 0.88 | — |
| resources._current_error | 796.7 | 4.50 | 222.4 | 0.67 | 71.7 |
| resources.is_native_source_resources_ready | 395.6 | 2.82 | 128.1 | 0.79 | — |
| resources.read_current_resource_parameters | 199.6 | 3.71 | 16.1 | 0.15 | — |

### 3.2 프레임 벤치(계측 없음, `tests/bench_pc_source_validation.gd`)

조건: 헤드리스, `--fixed-fps 120`(렌더 1프레임=1/120초, 2프레임마다 60Hz 물리 1틱, 실시간 대기 없음), 자기 Godot 프로세스만 P코어(0xFFFF)·High 우선순위, 필드·보스방 각 600틱 보행. 프레임 = process_frame 간격(그 프레임의 전체 CPU).

| 회차 | 필드 p95 | 필드 평균 | 필드 최대 | 보스방 p95 | 보스방 평균 | 보스방 최대 | process 평균 | physics 평균 |
|---|---|---|---|---|---|---|---|---|
| 기준선 A(단독) | 22.66 | 15.22 | 27.25 | 22.21 | 14.79 | 25.77 | 9.40 | 8.80 |
| 기준선 교차1 | 18.42 | 12.29 | 22.21 | 17.73 | 12.06 | 21.18 | 7.62 | 7.06 |
| 기준선 교차2 | 22.38 | 14.97 | 25.95 | 21.64 | 14.49 | 24.57 | 9.31 | 8.58 |
| 기준선 교차3 | 22.38 | 14.80 | 25.73 | 20.75 | 13.70 | 23.60 | 9.20 | 8.47 |
| 수정 후 단독 | 6.18 | 3.79 | 10.18 | 5.74 | 3.60 | 6.58 | 1.56 | 3.57 |
| 수정 후 교차1 | 10.52 | 5.96 | 12.80 | 9.86 | 5.63 | 11.36 | 2.27 | 5.89 |
| 수정 후 교차2 | 10.35 | 5.93 | 12.20 | 9.78 | 5.63 | 11.01 | 2.28 | 5.81 |
| 수정 후 교차3 | 8.91 | 5.14 | 11.53 | 8.69 | 5.02 | 10.80 | 2.04 | 4.93 |

(단위 ms. process/physics 평균은 필드 회차 값.) 교차 회차(기준선/수정 번갈아 3회) 동안 다른 세션의 Godot 테스트 2개(integ8-verify, pc-tests-integ9)와 사용자 dota2가 동시에 돌고 있었다. 그래서 절대값은 단독 회차보다 높고, 전후 비교는 교차 회차끼리 한다.

- 교차 3회 평균: 필드 p95 21.1 → 9.9ms(−53%), 평균 14.0 → 5.7ms(−59%), process 8.7 → 2.2ms(−75%).
- **목표 판정: 필드 p95 ≤ 8.33ms는 단독 회차(6.18ms)에서만 달성했다. 부하가 겹친 교차 회차(8.91~10.52ms)에서는 미달이다. 조용한 PC에서 다시 재야 확정할 수 있다.**
- 창 모드 측정은 하지 않았다(사용자 PC 화면 점유를 피함). Mac 실측은 하지 않았다.

### 3.3 hurtE 경로(코디네이터 보충 요청, `tests/bench_pc_hurte_provider.gd`, `--map11=off` 레거시 적 9마리)

| 항목 | 기준선 | 수정 후 1 | 수정 후 2 | 수정 후 바깥 검증/호출 |
|---|---|---|---|---|
| hurtE 비치명(dmg1, 60회) 평균 | 9.92 | 4.31 | 4.06 | 213 |
| hurtE 비치명 최대 | 12.33 | 5.65 | 5.24 | |
| hurtE 치명(3회) 평균 | 32.94 | 16.70 | 17.53 | 619~629 |
| provider melee_ref 1회 | 1.131 | 0.478 | 0.526 | 25 |
| provider p_dot_pool | 0.730 | 0.270 | 0.287 | 17 |
| provider p_atk_mul | 0.598 | 0.223 | 0.277 | 13 |
| provider stat_str | 0.539 | 0.216 | 0.237 | 14 |
| provider player_view | 0.511 | 0.173 | 0.170 | 10 |
| provider parry_lesson_active | 0.505 | 0.141 | 0.160 | 8 |
| provider u_eq | 0.432 | 0.188 | 0.172 | 10 |
| provider eq_affix | 0.375 | 0.152 | 0.146 | 10 |
| provider el_mul / rand / l_eq / play_time | 0.25 / 0.10 / 0.08 / 0.04 | 0.20 / 0.13 / 0.09 / 0.04 | 0.24 / 0.09 / 0.08 / 0.05 | 0 |

(ms) 적용은 **부분적**이다. 한 provider 호출 안의 중첩 반복은 제거됐지만, 한 hurtE가 서로 다른 바깥 검증을 여전히 200회 넘게 연다. 남은 원인 함수(수정하지 않음):

- `native_source_player_initialization_services.gd` `read_normal_enemy_*` / `_read_normal_enemy_provider`: 앞뒤 `_normal_enemy_provider_error()`와 `get_provider_bundle()`(앞·뒤 2회)이 각각 별도 바깥 검증이다.
- 원본 producer `combat_reference_source.melee_ref`, `combat_stat_formula.p_atk_mul/stat_str/p_dot_pool/u_eq`, `equipment_affix_reader.eq_affix`: 계산 중 Providers `Readers.p/stats/inventory/passives`를 여러 번 부르고, 매번 `Providers._read_domain` 바깥 검증(Providers+State+Resources 3회 평가)이 일어난다(melee_ref 1회 = 25회).
- `native_normal_enemy_hurte.gd` `execute`: 접촉 1회에 위 provider 콜백을 여러 번 호출한다. 치명타는 death prefix 경로에서 더 많이 호출한다.

## 4. 회귀·검증

결과는 [보고서](../engine/orders/reports/pc-source-perf_REPORT.md) 표를 참조한다. 기준선(HEAD 원본 4파일)과 수정본으로 같은 18종을 MAP11 ON/OFF 두 조건에서 돌렸고, 실패·ERROR 행 집합이 4조건 모두 완전히 같다. 기존 실패는 이 변경과 무관하다.

## 5. 규칙 / 교훈

- 상호 호출하는 owner 검증은 결과를 **바깥 검증 1회 범위**에서만 공유한다. 호출 사이(틱 포함) 이월은 같은 틱 원시 변경 검출을 약화시키므로 하지 않는다.
- 판정만 필요한 곳에서 packet 생성 API(`read_current_resource_parameters`)를 부르지 않는다. 동치가 증명된 bool API를 쓴다.
- 벤치는 `--fixed-fps 120` 헤드리스로 렌더 1프레임 CPU를 직접 잰다. 같은 PC에서 기준선과 수정본을 **교차**로 돌려 부하 변동을 상쇄한다.
- 남은 큰 비용은 hurtE provider 경로다(3.3). 이 경로는 바깥 호출 자체가 많아서, 고치려면 hurtE 1회를 하나의 읽기 패스로 묶는 설계 검토가 필요하다(쓰기 단계와 섞여 있어 별도 검증 필요, 미착수).
