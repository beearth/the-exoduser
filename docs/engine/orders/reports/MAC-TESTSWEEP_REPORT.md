# MAC-TESTSWEEP — Mac Godot 헤드리스 전수 실행 보고

- 작업ID: `mac-testsweep` / 브랜치: `codex/mac-testsweep-20261020`
- 작성 시각: 2026-10-20T18:25:22.916360+09:00
- 상태: 실행 완료·검수 대기. 정규 테스트 32종 중 29종 통과, 3종 비정상 종료. 실패 원로그를 보존했으며 제품·테스트 코드는 수정하지 않았다.
- 고정 실행 기준: `origin/main` **`7c4a2442bfc46f5d25c1bd9bf287a9324d8d5e5a`**. 시작 시 R에서 `git fetch origin` 후 이 SHA로 전용 worktree를 생성했다. 이후 다른 담당의 main 갱신은 실행 중인 스냅샷에 섞지 않았다.
- 실행 source: `/Users/fordeargamers/exoduser-wt/mac-testsweep/godot`; R=`/Users/fordeargamers/Projects/exoduser-migration-20261001`에서는 worktree 추가와 Git 조회만 했다.
- 환경: macOS 26.6.2 (25G83), arm64. Godot 원앱 `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, `4.7.2.stable.official.ed1daf0bf`.

## 범위와 안전 조치

기준 SHA의 `godot/tests/`에는 `.gd` 62개가 있다. `test_*.gd` 53개 중 MAC-VERIFY 작업 2의 17개와 추가 지정 4개(중복된 p1002e는 한 번만 계산)를 제외한 **32개를 각각 기본 전체 그룹으로 한 번씩** 실행했다. 별도 `visual_*.gd` 9개는 화면 캡처 보조 스크립트로, 아래에 미실행 이유를 모두 기록했다. 62개 전부를 헤드리스 실행했다고 주장하지 않는다.

사전 백업: `~/exoduser-wt/_backup/godot-appsupport-20261020-mac-testsweep/`. 최초 `ditto` 복사 뒤, 본 작업 import 이전에 전역 `editor_settings-4.7.tres`가 달라진 것을 확인해 원백업을 보존하고 `pre-import/`에 당시 Godot 폴더 전체 68파일을 추가 복사했다. `backup-pre-import-manifest.json`에서 사본과 source SHA-256 일치를 확인한 뒤 import했다. 전역 설정·실제 저장 폴더를 수동 수정·복원하지 않았다.

모든 import/테스트 호출은 자기 worktree의 `godot/override.cfg`에 격리 이름을 설정하고, 각 프로세스 종료 후 0바이트로 비웠다. 테스트의 `USERDIR`/`ISOLATED_DIRECTORY`를 우선하고 상수가 없으면 `EXODUSER-MacSweep-<테스트명>-20261020`을 사용했다. 실제 저장 폴더 `EXODUSER-Godot-Native-First`, 기존 게임 창, 다른 Codex worktree·로그·app_userdata를 실행 대상으로 사용하거나 정리하지 않았다. 본 작업의 Godot는 한 프로세스씩 순차 실행했다. 이 실행 시간은 성능 벤치마크가 아니다.

import 1회: `--headless --path . --import`, **exit 0 / stderr ERROR 0 / 16.001초**. 재import·통과 테스트 반복·코드 수정은 하지 않았다. 실행 제한은 테스트당 240초, import 600초이며 권한 오류 발견 시 중지하도록 로컬 실행기에 기록했다.

## 명령과 원로그

```sh
cd /Users/fordeargamers/exoduser-wt/mac-testsweep/godot
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --headless --path . --script res://tests/<테스트명>.gd > ~/exoduser-wt/_out/mac-testsweep/<테스트명>.out 2> ~/exoduser-wt/_out/mac-testsweep/<테스트명>.err
```

호출 직전 `override.cfg`:

```ini
[application]

config/use_custom_user_dir=true
config/custom_user_dir_name="<아래 격리 이름>"
```

원로그 루트는 **`~/exoduser-wt/_out/mac-testsweep/`**다. 각 `<테스트명>.out`·`.err`·`.meta.json`에 원문 stdout/stderr, 실제 argv·cwd·PID·격리 이름·시작/종료 시각·exit code·시간·로그 SHA-256을 보존했다. `results.json`은 종료 순서 원장, `summary.json`은 최종 요약 JSON과 원문 요약 줄, `inventory.json`은 대상·제외·테스트 source 해시, `pc-baselines.json`은 비교 근거다. 실행기 `run_sweep.py`, 집계기 `summarize.py`, 보고서 생성기 `build_report.py`도 이 로컬 로그 폴더에만 두었다. 로그·백업·override는 커밋 대상이 아니다.

## 결과표

`—`는 마지막 요약에 assertions/checks 총수가 노출되지 않음을 뜻한다. `passed`/`passing_groups`는 그룹 수로 분리했고 검사 수로 환산하지 않았다. `ERROR`는 stderr에서 단어 `ERROR`가 있는 줄 수(한 줄에 한 번)이며 실패 카운터와 별개다. 실제 `RESULT` 줄이 없는 테스트는 `대체:` 마커의 최종 JSON을 사용했다. timeout 보조 테스트는 실패 배열을 출력하지 않아 `status=PASS`와 단일 checks=1 및 exit0을 함께 기록했다.

| 테스트 | 마지막 RESULT / 대체 요약 마커 | assertions·checks | failures | 통과 그룹 | exit | stderr ERROR 줄 | 소요 초 | 알려진 PC 기준 | 비교 |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
| `test_encounter_factory` | `GODOT_ENCOUNTER_FACTORY_RESULT` | — | 0 | 3 | 0 | 0 | 3.295 | 3 passed groups / 0 failures (QA ledger) (수정 전 3 failures) | 0실패 일치 |
| `test_enemy_mod_m29` | `대체: M29_TEST_LEDGER` | 143 | 0 | 14 | 0 | 0 | 0.257 | 미확인 | 비교 불가 |
| `test_etype0_physical_flesh_crawler` | `GODOT_ETYPE0_RESULT` | — | 0 | 3 | 0 | 0 | 4.576 | 3 passed groups / 0 failures (QA ledger) (수정 전 1 failure) | 0실패 일치 |
| `test_etype1_lightning_hive_bloater` | `RESULT` | — | 0 | 4 | 0 | 0 | 7.109 | PASS / 0 failures (검사 수 미기록) | 0실패 일치 |
| `test_etype4_ice_soul_flame` | `GODOT_ICE_RESULT` | — | 0 | 4 | 0 | 0 | 5.855 | 4 passed groups / 0 failures (QA ledger) (수정 전 3 failures) | 0실패 일치 |
| `test_etype4_physical_spine_beast` | `GODOT_SPINE_RESULT` | — | 0 | 4 | 0 | 0 | 8.896 | 4 passed groups / 0 failures (QA ledger) (수정 전 1 failure) | 0실패 일치 |
| `test_m30_epicenter` | `M30_RESULT` | — | 0 | 4 | 0 | 1 | 0.759 | 미확인 | 비교 불가 |
| `test_native_element_projectiles` | `GODOT_NATIVE_ELEMENT_RESULT` | — | 0 | 4 | 0 | 0 | 11.430 | 미확인 | 비교 불가 |
| `test_native_floating_text_binding` | `대체: NATIVE_FLOATING_TEXT_BINDING_RECEIPT` | — | 0 | 4 | 0 | 0 | 10.667 | 미확인 | 비교 불가 |
| `test_native_ground_surface_binding` | `대체: NATIVE_GROUND_SURFACE_BINDING_RECEIPT` | — | 0 | 3 | 0 | 0 | 8.641 | 미확인 | 비교 불가 |
| `test_native_main_intro_curtain` | `대체: NATIVE_MAIN_INTRO_CURTAIN_FIRST` | 15 | 0 | — | 0 | 0 | 10.653 | PASS / 0 failures (검사 수 미기록) | 0실패 일치 |
| `test_native_main_intro_curtain_timeout_failed_only` | `대체: NATIVE_MAIN_INTRO_CURTAIN_TIMEOUT_FAILED_ONLY` | 1 | 0 (status PASS) | — | 0 | 0 | 9.660 | PASS / 0 failures (검사 수 미기록) | 0실패 일치 |
| `test_native_main_source_authority` | `MAIN_AUTHORITY_SUITE_RESULT` | 71 | 0 | — | 0 | 0 | 38.774 | 71 checks / 0 failures (QA ledger) (수정 전 71/6) | 0실패 일치 |
| `test_native_main_source_player_initialization` | `INITIALIZATION_FIRST_RESULT` | 117 | 0 | — | 0 | 0 | 37.563 | 117 checks / 0 failures (QA ledger) (수정 전 117/2) | 0실패 일치 |
| `test_native_main_source_starter_state` | `MAIN_STARTER_SUITE_RESULT` | 148 | 1 | — | 1 | 1 | 41.614 | 148 checks / 0 failures (QA ledger) (수정 전 145/2) | 차이·전제 확인 필요 |
| `test_native_main_sprite_readiness` | `대체: NATIVE_MAIN_SPRITE_READINESS_FIRST` | 29 | 0 | 4 | 0 | 0 | 7.612 | 미확인 | 비교 불가 |
| `test_native_main_sprite_startup_loss` | `대체: NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST` | 12 | 0 | — | 0 | 1 | 2.295 | 미확인 | 비교 불가 |
| `test_native_qe_binding` | `QE_SUITE_RESULT` | 155 | 0 | — | 0 | 0 | 21.326 | PASS / 0 failures (검사 수 미기록) | 0실패 일치 |
| `test_native_resource_regeneration_binding` | `REGEN_SUITE_RESULT` | 170 | 0 | — | 0 | 0 | 12.455 | 미확인 | 비교 불가 |
| `test_native_source_player_regeneration_phase` | `SOURCE_PHASE_SUITE_RESULT` | 88 | 0 | — | 0 | 0 | 59.551 | 88/0 | 0실패 일치 |
| `test_native_type7_runtime` | `GODOT_NATIVE_TYPE7_RUNTIME_RESULT` | — | 0 | 2 | 0 | 0 | 3.815 | 미확인 | 비교 불가 |
| `test_native_world_phases` | `대체: NATIVE_WORLD_PHASE_RECEIPT` | — | 0 | 2 | 0 | 0 | 2.037 | PASS / 0 failures (검사 수 미기록) | 0실패 일치 |
| `test_p2001e_natural_lmb` | `P2001E_RESULT` | 18 | 0 | — | 0 | 0 | 9.673 | 18/0 | 0실패 일치 |
| `test_p2005d_ice_orb` | `P2005DIO_RESULT` | 20 | 0 | — | 0 | 0 | 13.252 | 22/0 | 0실패 동일; 20 vs 22 (조건부 검사 2개 미실행) |
| `test_p2005d_regen_wiring` | `P2005D_RESULT` | 10 | 0 | — | 0 | 0 | 10.682 | 10/0 | 0실패 일치 |
| `test_p3003_regions` | `P3003_RESULT` | 43 | 0 | — | 0 | 0 | 7.637 | 43/0 | 0실패 일치 |
| `test_type3_native_binding` | `대체: TYPE3_BINDING_RECEIPT` | — | 0 | 4 | 0 | 0 | 0.510 | 미확인 | 비교 불가 |
| `test_type3_spawn_recipe` | `RESULT 없음` | — | 미노출 | — | 2 | 1 | 0.256 | 미확인 | 비교 불가 |
| `test_type3_summoned_actor` | `대체: TYPE3_ACTOR_LEDGER` | 118 | 0 | — | 0 | 0 | 0.254 | 미확인 | 비교 불가 |
| `test_type7_teleport` | `대체: TYPE7_TEST_RECEIPT` | — | 0 | 4 | 0 | 0 | 1.783 | 미확인 | 비교 불가 |
| `test_web_delivery` | `GODOT_WEB_DELIVERY_RESULT` | — | 0 | 2 | 0 | 0 | 0.257 | 미확인 | 비교 불가 |
| `test_windows_native_package` | `GODOT_WINDOWS_PACKAGE_RESULT` | — | 1 | 3 | 1 | 1 | 2.559 | 미확인 | 비교 불가 |

실행한 32종의 소요 시간 합계는 **355.703초**, stderr ERROR는 **5줄**이다. 위 표는 실제 프로세스 exit·요약·stderr를 함께 확인한 결과다. 검사 수가 없는 테스트를 포함한 전체 assertion 분모는 새로 추산하지 않았다.

## PC 비교의 출처와 한계

MAC_ORDERS 작업 1 표의 117/2·145/2·71/6 등은 QA-001 수정 전 기준이다. 현재 실행 SHA에는 QA-001이 이미 병합되어 있어 과거 실패가 재현되지 않는 것만으로 플랫폼 차이라 판정할 수 없다. `QA-001_REPORT.md:104–114`의 수정 후 수치는 기존 PASS + 영향 그룹 재검을 결합한 ledger이며, 단일 full-suite PC 실행으로 바꿔 부르지 않았다. 별도로 `FDG_GAME_DEVELOPMENT_PLAN.md:79`는 총괄의 7종 독립 재실행 0실패를 기록한다. 이번 Mac은 해당 7종 모두 전체 그룹 1회 실행했으며, starter의 신규 실패는 아래에 별도로 기록한다.

| 테스트 | PC 근거 문서·행 |
|---|---|
| `test_native_main_source_player_initialization` | `docs/engine/orders/reports/QA-001_REPORT.md:104` |
| `test_native_main_source_starter_state` | `docs/engine/orders/reports/QA-001_REPORT.md:105` |
| `test_encounter_factory` | `docs/engine/orders/reports/QA-001_REPORT.md:106` |
| `test_etype0_physical_flesh_crawler` | `docs/engine/orders/reports/QA-001_REPORT.md:107` |
| `test_etype4_physical_spine_beast` | `docs/engine/orders/reports/QA-001_REPORT.md:108` |
| `test_etype4_ice_soul_flame` | `docs/engine/orders/reports/QA-001_REPORT.md:109` |
| `test_native_main_source_authority` | `docs/engine/orders/reports/QA-001_REPORT.md:110` |
| `test_native_source_player_regeneration_phase` | `docs/engine/FDG_P2_005D_REGEN_ICEORB_20261020.md:16` |
| `test_p2001e_natural_lmb` | `docs/engine/FDG_P2_001E_FIRSTFIGHT_CORRECTNESS_20261020.md:50` |
| `test_p2005d_regen_wiring` | `docs/engine/FDG_P2_005D_REGEN_ICEORB_20261020.md:23` |
| `test_p2005d_ice_orb` | `docs/engine/FDG_P2_005D_REGEN_ICEORB_20261020.md:63` |
| `test_p3003_regions` | `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md:78` |
| `test_etype1_lightning_hive_bloater` | `docs/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md:427` |
| `test_native_world_phases` | `docs/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md:427` |
| `test_native_qe_binding` | `docs/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md:427` |
| `test_native_main_intro_curtain` | `docs/engine/FDG_P2_001H_INTRO_CURTAIN_SEQUENCE_20261020.md:63-78` |
| `test_native_main_intro_curtain_timeout_failed_only` | `docs/engine/FDG_P2_001H_INTRO_CURTAIN_SEQUENCE_20261020.md:63-78` |

PC 비교 가능한 17종 중 검사수·실패수가 모두 같은 것은 6종, starter는 검사수는 같고 실패수 차이 1개, ice orb는 실패수는 같고 조건부 검사수 차이 2개다. 나머지는 그룹수·실패수 일치 4종과 PC 검사수 미기록으로 실패수만 비교 가능한 5종이다.

PC 접근·PC 새 실행은 하지 않았다. 문서에 검사 수가 없는 PASS를 소스 단정 개수로 메우지 않았으며, Mac에서 시행한 과거 검수를 PC 수치로 사용하지 않았다.

## 실패 및 stderr 진단

최종 원로그를 기준으로 이 절을 검토한다. 제품·테스트 코드의 실패 수정은 이번 작업 범위에 포함하지 않는다.

| 항목 | 관측·원인 추정·근거 | 조치 |
|---|---|---|
| `test_native_main_source_starter_state` | 148 checks 중 `startup_state_and_items: actual G40/STATS5/PAS26 source constructors` 1실패다. `test_native_main_source_starter_state.gd:67–73`은 Main 준비 뒤 current G의 크기를 40으로 고정한다. 반면 `main.gd:263–268`이 새 지역 owner를 configure하고 `native_regions.gd:81–85`는 동일 G에 지역 필드 7개를 쓴다. boot G40 자체는 `port_modules/native_new_run_bootstrap_source/producer.gd:124–132`에 보존된다. 따라서 통합 후 current G와 boot G40을 혼동한 낡은 하니스 기대가 유력하다. 실제 g.size는 원로그에 없으므로 정확한 관측값이나 제품 결함 확정으로 쓰지 않는다. | PC QA ledger 148/0 대비 Mac 148/1 차이를 보존. P3-003 이후 동일 SHA PC 비교는 미확인. 코드·단정 변경 없음. |
| `test_native_main_sprite_startup_loss` | `test_native_main_sprite_startup_loss.gd:21–32`가 Warrior lifecycle fault를 주고 거부를 검사한다. 최종 JSON에 `expected_push_error_count=1`, `expected_script_error_count=0`, checks12/failed[]가 있다. stderr의 `Native source player startup rejected: native_player_sprite_not_ready:target_queued_for_deletion` 1줄과 대응한다. | 의도된 startup 거부 ERROR1·exit0를 보존. |
| `test_m30_epicenter` | `test_m30_epicenter.gd:329–335`가 의도적으로 `__missing_required_M30_original__.png`를 전달하고 configure 거부를 검사한다. 최종 요약의 `expected_missing_resource_rejections=1`, failures=0, exit0과 stderr ERROR 1줄이 대응한다. | 예상된 거부 로그를 그대로 보존. 무시·삭제하거나 제품 결함으로 집계하지 않음. |
| `test_p2005d_ice_orb` | PC 문서 22/0에 비해 Mac 20/0이다. 원로그는 그룹별 6+9+5=20, `skipped=[]`, `shatter.log.base_dmg=327`, `blade_dmg=98`을 기록했다. 테스트 :152의 `floor(base_dmg×0.3)`가 98이므로 :176의 `target alive && expected_piece>=100` 조건이 false가 되어 :178–184의 프리즌/게이지·얼음파편저항 단정 2개가 실행되지 않았다. 직접 프리즌 그룹 5검사는 수행됐다. PC 원로그 없이 PC의 실제 난수값·분기를 확정하지 않는다. | 0실패는 같지만 검사 수 동등 PASS가 아님. 그룹 skip이 아닌 내부 조건부 단정 미실행을 표시. 재실행·수정 없음. |
| `test_type3_spawn_recipe` | `test_type3_spawn_recipe.gd:49–59`는 기본 `res://native-type3-oracle.json`을 읽고 Dictionary/cases가 아니면 RESULT 전에 exit2한다. 기준 Git tree에는 이 oracle이 없다. 기본 실행 실패는 외부 oracle fixture 전제 누락으로 추정하며 생성자 검증을 통과한 것이 아니다. | `.out`·`.err`와 exit2 보존. 외부 담당 파일을 가져오거나 fixture를 임의 생성하지 않음. |
| `test_windows_native_package` | `test_windows_native_package.gd:169–190`은 Windows release export 산출물 `res://icudt_godot.dat`를 요구한다. source 프로젝트 Git에는 해당 파일이 없어 `packed ICU support data exists for the release template` 단정이 실패한다. Mac source 실행만으로 Windows 패키지·Mac 게임 제품 결함을 확정할 수 없다. stderr ERROR 1줄은 ICU 단정 실패와 별개의 의도적 missing-water 리소스 거부(:111–124, `expected_missing_loader_errors=1`)다. | 실패 단정과 예상 리소스 ERROR를 구분해 원로그 보존. export·에셋 추가·코드 수리 없음. |

`test_type3_spawn_recipe`는 RESULT·assertion 카운터에 도달하지 않아 failures를 0으로 쓰지 않았다. `test_windows_native_package`의 실제 실패 수와 ERROR 수는 위 결과표·원문 요약을 따른다. 하니스 전제를 갖춘 후의 재실행과 Windows export 인수는 후속 검수 범위다.

## 격리 이름 전수표

상수가 없는 fixture 테스트에도 override를 적용했다. 두 P2005D 테스트는 소스 상수의 같은 이름을 순차 사용했으며 폴더를 수동 삭제·초기화하지 않았다.

| 테스트 | 적용 격리 이름 |
|---|---|
| `test_encounter_factory` | `EXODUSER-MacSweep-test_encounter_factory-20261020` |
| `test_enemy_mod_m29` | `EXODUSER-MacSweep-test_enemy_mod_m29-20261020` |
| `test_etype0_physical_flesh_crawler` | `EXODUSER-MacSweep-test_etype0_physical_flesh_crawler-20261020` |
| `test_etype1_lightning_hive_bloater` | `EXODUSER-MacSweep-test_etype1_lightning_hive_bloater-20261020` |
| `test_etype4_ice_soul_flame` | `EXODUSER-MacSweep-test_etype4_ice_soul_flame-20261020` |
| `test_etype4_physical_spine_beast` | `EXODUSER-MacSweep-test_etype4_physical_spine_beast-20261020` |
| `test_m30_epicenter` | `EXODUSER-MacSweep-test_m30_epicenter-20261020` |
| `test_native_element_projectiles` | `EXODUSER-MacSweep-test_native_element_projectiles-20261020` |
| `test_native_floating_text_binding` | `EXODUSER-MacSweep-test_native_floating_text_binding-20261020` |
| `test_native_ground_surface_binding` | `EXODUSER-MacSweep-test_native_ground_surface_binding-20261020` |
| `test_native_main_intro_curtain` | `EXODUSER-MacSweep-test_native_main_intro_curtain-20261020` |
| `test_native_main_intro_curtain_timeout_failed_only` | `EXODUSER-MacSweep-test_native_main_intro_curtain_timeout_failed_only-20261020` |
| `test_native_main_source_authority` | `EXODUSER-MainSourceAuthority-Isolated-20261014` |
| `test_native_main_source_player_initialization` | `EXODUSER-MainSourceInitialization-Isolated-20261014` |
| `test_native_main_source_starter_state` | `EXODUSER-MainSourceStarter-Isolated-20261014` |
| `test_native_main_sprite_readiness` | `EXODUSER-MacSweep-test_native_main_sprite_readiness-20261020` |
| `test_native_main_sprite_startup_loss` | `EXODUSER-MacSweep-test_native_main_sprite_startup_loss-20261020` |
| `test_native_qe_binding` | `EXODUSER-MacSweep-test_native_qe_binding-20261020` |
| `test_native_resource_regeneration_binding` | `EXODUSER-MacSweep-test_native_resource_regeneration_binding-20261020` |
| `test_native_source_player_regeneration_phase` | `EXODUSER-SourceRegenPhase-Isolated-20261014` |
| `test_native_type7_runtime` | `EXODUSER-MacSweep-test_native_type7_runtime-20261020` |
| `test_native_world_phases` | `EXODUSER-MacSweep-test_native_world_phases-20261020` |
| `test_p2001e_natural_lmb` | `EXODUSER-P2001E-Isolated-20261020` |
| `test_p2005d_ice_orb` | `EXODUSER-P2005D-Isolated-20261020` |
| `test_p2005d_regen_wiring` | `EXODUSER-P2005D-Isolated-20261020` |
| `test_p3003_regions` | `EXODUSER-P3003-Isolated-20261020` |
| `test_type3_native_binding` | `EXODUSER-MacSweep-test_type3_native_binding-20261020` |
| `test_type3_spawn_recipe` | `EXODUSER-MacSweep-test_type3_spawn_recipe-20261020` |
| `test_type3_summoned_actor` | `EXODUSER-MacSweep-test_type3_summoned_actor-20261020` |
| `test_type7_teleport` | `EXODUSER-MacSweep-test_type7_teleport-20261020` |
| `test_web_delivery` | `EXODUSER-MacSweep-test_web_delivery-20261020` |
| `test_windows_native_package` | `EXODUSER-MacSweep-test_windows_native_package-20261020` |

## 사용자 지정 제외 21종

다음은 MAC-VERIFY 담당이므로 실행하지 않았다. MAC_ORDERS 작업 2의 p1002e와 추가 지시의 p1002e는 중복 제외했다.

- `test_contracts`
- `test_etype0_physical_burn`
- `test_native_main_source_lesson`
- `test_native_source_update_clock_play_time`
- `test_p1002e_melee_hurte`
- `test_p1002f_dedicated_hurte`
- `test_p1002g_kislash_hurte`
- `test_p2001a_hit_feedback`
- `test_p2001b_death_fx`
- `test_p2001c_kill_rewards`
- `test_p2001h_curtain_spawn`
- `test_p2001i_boot_intro`
- `test_p2001j_lesson_clock`
- `test_p2001k_lesson_practice`
- `test_p2002a_hud`
- `test_p2002b_minimap_corner`
- `test_p2003a_lighting`
- `test_p2004a_pets`
- `test_p2005a_start_skills`
- `test_p2005b_giant_slam`
- `test_p2005c_spike_holy`

## 화면 캡처 보조 스크립트 9종 — 미실행

이 파일들은 `test_*.gd`가 아닌 `visual_*.gd`이며 assertions 전수 테스트와 구분한다. 전부 `RenderingServer.frame_post_draw`를 기다리는 렌더러 의존 캡처이고 Windows `C:/`·`G:/` 출력 경로가 하드코딩되어 있다. 일부는 headless 사용 금지 주석도 있다. 다수 USERDIR는 MAC-VERIFY 담당과 겹친다. 지정된 headless·코드 무수정·다른 담당 app_userdata 보호 조건에서 캡처 실행을 강행하지 않았다. 화면·영상 인수 결과가 아니다.

| 파일 | 상태 |
|---|---|
| `visual_p2001f_capture.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |
| `visual_p2001g_capture.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |
| `visual_p2001h_capture.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |
| `visual_p2001i_video.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |
| `visual_p2001j_video.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |
| `visual_p2001k_capture.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |
| `visual_p2005c_capture.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |
| `visual_p2005c_video.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |
| `visual_p2005d_capture.gd` | 미실행 — HEADLESS_UNSUPPORTED / Windows 캡처 경로·공유 USERDIR 조건 |

## 변경 파일·제출

| 경로 | 변경 |
|---|---|
| `docs/engine/orders/reports/MAC-TESTSWEEP_REPORT.md` | 이번 실행 결과·PC 비교·실패 전제·원로그 위치·제외 범위 |
| `docs/engine/orders/WORK_BOARD.md` | MAC-TESTSWEEP 자기 작업 행 추가·검수 대기 상태만 |

종료 시 R의 HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`·브랜치 `codex/mac-live-play-time-main-20261017`과 tracked INDEX/WORK 청결 상태가 시작 시와 같음을 readonly Git으로 확인했다(`R-final-readonly.json`). 제출 준비 중 원격 main은 `d3b672fea878ff99a9f110f4a6d8adf86b1e6898`로 전진한 것을 조회했다. 이번 실행 근거는 시작 시 고정한 `7c4a2442…`이며 새 main 전체 검수로 확대하지 않는다.

게임·테스트·에셋·공용 스크립트 변경 0. `godot/override.cfg`는 종료 후 0바이트·미스테이징이며 커밋하지 않는다. 경로 지정 add만 사용하고 `git add -A`, main push·병합, force push, reset·checkout, 서버 재시작, 기존 게임 종료를 하지 않는다.

결과 커밋 SHA: **제출 메타데이터 기록 시 기입**. 이 본문 자체를 포함하는 최종 제출 HEAD와 원격 ref 대조 결과는 `~/exoduser-wt/_out/mac-testsweep/DONE.txt` 및 `submission.json`에 기록한다. 로컬 커밋만으로 원격 제출 완료를 선언하지 않는다.

남은 검수: 누락 oracle을 정식 전제로 제공한 type3 생성자 검사, Windows export ICU 패키지 검사, 렌더러를 사용하는 실창·시각 검수. 이번 보고서는 Mac 헤드리스 결과이며 PC/Mac 전체 동기화·전체 Godot 이식 완료·시각 품질 PASS를 주장하지 않는다.
