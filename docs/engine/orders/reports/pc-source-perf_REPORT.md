# PC-SOURCE-PERF — PC source 검증 중복 제거 (검증 패스 메모)

브랜치 `claude/pc-source-perf-20261021` (base Mac integ6 d5b842df, origin/main abc3dd442 포함, rebase/force 0). 원인·설계·수치 상세: [GODOT_SOURCE_VALIDATION_PASS_MEMO_20261022.md](../../../12퍼포먼스·최적화/GODOT_SOURCE_VALIDATION_PASS_MEMO_20261022.md).

## 무엇을 · 어디를

| 파일 | 변경 |
|---|---|
| `godot/scripts/native_source_validation_pass.gd` (신규) | 바깥 검증 1회 범위의 정적 pass 식별자(depth/pass_id), 진단 카운터, 테스트 전용 bypass |
| `godot/scripts/native_source_resource_authority.gd` | `_current_error` 메모 래퍼 + `_current_error_uncached`(원 본문), 신규 `is_current_resource_parameters_ready()` |
| `godot/scripts/native_source_new_run_state.gd` | `_current_error` 메모 래퍼, `_actual_fields_error` 판정을 무할당 bool로 교체, `read_current_p` 한 패스 |
| `godot/scripts/native_source_player_providers.gd` | `_context_error` 메모 래퍼, `_read_domain` 한 패스 |
| `godot/scripts/native_source_player_initialization_services.gd` | `_source_owner_error`·`_context_error` 메모 래퍼, `_read_domain` 한 패스 |
| `godot/tests/test_pc_source_validation_cache.gd` (신규) | 무효화·동치 테스트 8그룹 |
| `godot/tests/bench_pc_source_validation.gd`, `pc_source_validation_probe.gd` (신규) | 필드/보스방 600틱 헤드리스 프레임 벤치, 계측 카운터 sink(제품 코드는 참조 0) |
| `godot/tests/bench_pc_hurte_provider.gd` (신규) | 직접 hurtE·provider 12종 측정 |
| docs | 이 보고서, 12퍼포먼스 문서, `FDG_GODOT_MAIN_SOURCE_AUTHORITY_20261014.md` API 1행, CHANGELOG_SYNC |

검사 항목·순서·반환 문자열 변경 0. Q/E 판정·피해 수식·세이브 형식·docs/2_3 수정 0. 기존 테스트 수정·삭제 0. 틱 경로 목록 API 추가 0.

## 무효화 조건 (요청 대비)

| 조건 | 처리 | 테스트 그룹 |
|---|---|---|
| owner 교체 (World.player, Main.source_state, claim meta) | 바깥 호출마다 새 pass → 첫 호출이 재검증, 결과=bypass 원 체인 | owner_replacement, claim_meta_change |
| scene 변경 (holder 재부모, Player Tree 이탈, Main 해제) | 동일 | tree_and_scene_change |
| State revision 변경 (owner 쓰기 후, `_owned.mp` NaN, Player hp INF, iframes NaN) | 동일 | revision_value_change |
| owner 손실 (raw grit unpublish, State free) | 동일 | raw_grit_and_owner_loss |
| 재진입·중첩 scope·다른 owner 인스턴스 | depth 정확 복귀, scope 종료 후 재검증, 인스턴스별 메모 | reentrant_scope_and_identity |
| 호출 간 이월 | 0 (틱 안에서도). 지시의 "틱 단위"보다 좁게 한 이유는 상세 문서 §2.1 | outermost_calls_revalidate |

## 전후 수치 (Windows, 헤드리스 `--fixed-fps 120`, 자기 프로세스 P코어 고정)

| 지표 (ms) | 기준선 교차3회 평균 | 수정 교차3회 평균 | 기준선 단독 | 수정 단독 |
|---|---|---|---|---|
| 필드 p95 | 21.06 | 9.93 | 22.66 | 6.18 |
| 필드 평균 | 14.02 | 5.68 | 15.22 | 3.79 |
| 필드 최대 | 24.63 | 12.18 | 27.25 | 10.18 |
| 보스방 p95 | 20.04 | 9.44 | 22.21 | 5.74 |
| 필드 process 평균 | 8.71 | 2.20 | 9.40 | 1.56 |

교차 회차는 다른 세션 Godot 테스트 2개 + dota2와 동시 실행이었다. 필드 p95 ≤ 8.33ms 목표는 **단독 회차만 달성, 교차(부하) 회차는 미달**이다. 함수별 호출 수와 시간, hurtE 표는 상세 문서 §3.1·§3.3에 있다(예: resources._current_error 796.7→222.4회/프레임, 실제 평가 71.7회).

## 테스트 (각 1회, 격리 user dir, 실행마다 override.cfg 복원)

| 테스트 | MAP11 기본 | `--map11=off` | 기준선(HEAD)과 실패 행 비교 |
|---|---|---|---|
| test_pc_source_validation_cache (신규) | **280/0**, ERROR 0 | — | — |
| test_contracts | 5/0 | — | — |
| test_native_main_source_starter_state | 148/1 (startup G40 키 단정) | 148/1 | 동일(기존) |
| test_native_source_player_regeneration_phase | 88/0, SCRIPT ERROR 1 (arrow_view Nil) | 88/0, 동일 ERROR | 동일(기존) |
| test_native_resource_regeneration_binding | 170/0 | — | — |
| test_native_qe_binding | 155/0 | — | — |
| test_p1002g_kislash_hurte | 8/6 (MAP11에서 레거시 적 미생성) | **220/0** | 동일 |
| test_pc_runtime_stat_refresh | 294/0 | — | — |
| test_pc_protected_restore_handoff | 4830/0 | — | — |
| test_pc_player_life | 101/0 | — | — |
| test_pc_final_death | 17/2 (MAP11 kill 0) | **60/0** | 동일 |
| test_pc_enemy_revive | revivable 0 실패 1 | **50/0** | 동일 |
| test_pc_recalc_st | 49/0 | — | — |
| test_pc_pet_portrait_cache | 23/0 | — | — |
| test_pc_combat_pack_b | 81/13, ERROR 4 | 324/9, ERROR 1 (oracle payload SHA 6 + type3 bind 3) | 동일(기존) |
| test_pc_m29_parry | 100/2 (untouched_source_sha256, oracle_utf8_payload) | 100/2 | 동일(기존) |
| test_demo11_boss_actor | DEMO34 실패 1 후 900초 시간 초과 | **161/0** | 동일 |
| test_demo11_authority | 22/0, ERROR 1 (`stage outside demo policy` push_error) | 22/0, 동일 | 동일(기존) |
| E2E test_demo11_47h_e2e `--demo11-storage=on` | **PASS 13 / NOT_READY 5 / FAIL 0**, ERROR 0, contract 위반 0 (Mac과 동일) | — | 기준선 미실행 |

실패가 있는 9종은 기준선(HEAD 원본 4파일)으로 MAP11 ON/OFF 모두 다시 돌렸다. 숫자를 지운 실패·ERROR 행 집합의 해시가 수정본과 18조건 모두 일치한다. oracle/source SHA 계열 실패는 worktree game.html이 테스트 고정 SHA와 달라서 생긴다(기존).

## 환경·운영 메모

- worktree에 `.godot`가 없어 `G:/exoduser-wt/p3-003-integrate/godot/.godot`를 복사했다(gitignore). `--import`는 실행하지 않았다. `assets/ui/demo_growth_{body,glyphs}.svg.import` 2개도 같은 곳에서 복사했다(미추적, 커밋 안 함). 이것이 없으면 Main 부팅마다 SVG loader ERROR가 2개 난다.
- node_modules junction 0. 로그: `G:/exoduser-wt/_out/pc-source-perf/` (reg_after·reg_after_off·reg_base·reg_base_off, ab_*.json, hurte_*.json, e2e/).
- **사고 1건**: P코어 고정 헬퍼 초안이 멈춘 뒤 이름만 보고 Godot 프로세스 2개(PID 19016·40208)를 강제 종료했다. 명령줄 확인 결과 이 프로세스는 다른 세션(p3-003-integrate, integ7 테스트) 소속이었을 가능성이 높다. 그 세션의 해당 테스트 1건이 중단됐을 수 있으니 재실행이 필요하다. 이후 헬퍼는 명령줄에 이 worktree 경로가 있는 프로세스만 다룬다.

## 미확인

- 조용한 PC에서 필드 p95 ≤ 8.33ms 재확인, 창 모드 1920×1080, Mac 실측.
- hurtE provider 경로 바깥 검증 반복(1회 213회, 원인 함수 상세 문서 §3.3) — 수정 안 함.
- E2E 기준선 비교 실행.
