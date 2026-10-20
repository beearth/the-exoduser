# MAC-VERIFY 헤드리스 검증 보고서 — 2026-10-20

상태: **검수 대기**. 91565d492 5종 중 5/5종, 최신 main 17종 중 14/17종이 exit 0·stderr ERROR 0·검사 실행·0실패 조건을 충족했다. 검사 수와 PC 비교는 아래 표를 따른다.

2026-10-20 맥북총괄의 최신 범위 조정에 따라 이 창은 헤드리스 테스트만 수행했다. 실창 부팅·인트로·커튼·첫 전투 30초 녹화는 **MAC-LIVE 담당 범위**이며 이 보고서의 인수 증거에 포함하지 않는다. 코드 수정·실패 수리·통과 테스트 반복 실행은 하지 않았다.

## 대상·실행 환경

| 항목 | 실제 확인 |
|---|---|
| 1차 대상 | `91565d492a380ffe7f8d5199e8faec0a4e4ad122`; detached `/Users/fordeargamers/exoduser-wt/mac-verify-91565d4` |
| 2차 대상 | 1차 종료 후 fetch한 `origin/main=d3b672fea878ff99a9f110f4a6d8adf86b1e6898`; `/Users/fordeargamers/exoduser-wt/mac-verify` |
| 제출 브랜치 | `codex/mac-verify-20261020` |
| Godot | `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot` 원본; `4.7.2.stable.official.ed1daf0bf` |
| 기준 체크아웃 R | 시작 branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`; tracked INDEX/WORK clean. R 브랜치 전환·코드 수정·커밋 없음 |
| 첫 백업 | `~/exoduser-wt/_backup/godot-appsupport-20261020-mac-verify/`; import 전 68파일 SHA-256 동일 확인 (`preflight.json`) |
| 최신 import 전 추가 보존 | 첫 백업을 덮어쓰지 않고 그 하위 `before-latest-import/`에 다시 복사; 68파일 SHA-256 동일 (`before-latest-import.json`) |
| 로그 루트 | `/Users/fordeargamers/exoduser-wt/_out/mac-verify/` |
| 원본 근거 | 해당 SHA의 `MAC_ORDERS_20261020.md` 작업 2, `WORK_BOARD.md`의 MAC-VERIFY/MAC-LIVE 분담, 아래 원본 근거 표·테스트 파일. PC 비교값은 사용자 지정 1차 기준과 2차 docs 기록 |

최초 제한 세션에서는 worktree·테스트를 시작하지 않고 BLOCKED로 종료했다. Full Access 전환 후 fetch와 지시서/작업판 읽기를 다시 수행하여 재개했다. 검증 대상은 위 두 SHA로 고정했으며 계속 움직이는 main의 이후 커밋까지 검수한 것으로 해석하지 않는다.

## 명령·격리·로그 규칙

각 실행의 정확한 argv, cwd, 대상 SHA, 격리 이름, 시작/종료 UTC, exit code, timeout 여부는 같은 basename의 `.json`에 보존했다. `.out`과 `.err`는 실행 시점의 원문이며 재실행으로 덮어쓰지 않았다.

```sh
cd <해당-worktree>/godot
"/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot" --headless --path . --import
"/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot" --headless --path . --script res://tests/<테스트>.gd > <로그>.out 2> <로그>.err
```

매 import/테스트 직전에 `godot/override.cfg`에 `[application]`의 `config/use_custom_user_dir=true`와 아래 격리 이름을 기록했다. 매 실행의 `finally`에서 파일을 삭제했다. `override.cfg`는 커밋하지 않는다. 실제 저장 폴더 `EXODUSER-Godot-Native-First`는 사용하지 않았고, 다른 Codex의 worktree·로그·app_userdata는 수정하지 않았다. 기존 게임 창의 조작·재시작도 하지 않았다.

| 범위 | 격리 이름 |
|---|---|
| 두 worktree import | `EXODUSER-MacVerify-Import-Isolated-20261020` |
| 91565d492 clock | `EXODUSER-UpdateClockPlayTime-Isolated-20261019` |
| 근접 hurtE (두 SHA) | `EXODUSER-P1002E-Isolated-20261019` |
| 91565d492 Main lesson | `EXODUSER-MainSourceLesson-Isolated-20261014` |
| 91565d492 contracts / burn | `EXODUSER-Supervisor-Regress-20261019` |
| 최신 나머지 16종 | 각 테스트 `USERDIR` 상수의 `EXODUSER-<ID>-Isolated-20261020` (각 `.json`에 전문 기록) |

## import 결과

| 대상 | exit | stderr ERROR 줄 수 | 소요 초 | 원로그 |
|---|---:|---:|---:|---|
| baseline-91565d492 | 0 | 0 | 22.542 | `baseline-91565d492/import.out`, `.err`, `.json` |
| latest-d3b672fea | 0 | 0 | 12.737 | `latest-d3b672fea/import.out`, `.err`, `.json` |

## 1차: 91565d492 지정 5종

`검사/실패` 표기다. contracts와 burn의 PC `5/5`, `4/4`는 각각 통과 case 수/전체 case 수이며 실패 수를 뜻하지 않는다. ERROR는 stderr에서 대문자 `ERROR`를 포함하는 줄 수다. 아래 RESULT 링크는 해당 stdout의 **마지막 RESULT 줄 전체를 무편집으로 발췌**한 부록으로 이동한다.

| 테스트 | Mac 결과 | PC 지정 기준 | exit | ERROR | PC 일치 | 마지막 RESULT 원문 |
|---|---|---|---:|---:|---|---|
| `test_native_source_update_clock_play_time` | 30/0 | 30/0 | 0 | 0 | 일치 | [`UPDATE_CLOCK_PLAY_TIME_RESULT` 원문](#result-1) |
| `test_p1002e_melee_hurte` | 69/0 | 102/0, fallback_paths_used=false | 0 | 0 | 검사 수 불일치(69 vs 102); 0실패·ERROR0·fallback=false 일치 | [`P1002E_RESULT` 원문](#result-2) |
| `test_native_main_source_lesson` | 30/0 | 30/0 | 0 | 0 | 일치 | [`MAIN_LESSON_FIRST_RESULT` 원문](#result-3) |
| `test_contracts` | 5/5 통과; failed_assertions=0 | 5/5 통과, failed_assertions=0 | 0 | 0 | 일치 | [`GODOT_CONTRACT_RESULT` 원문](#result-4) |
| `test_etype0_physical_burn` | 4/4 통과; failed_assertions=0 | 4/4 통과, failed_assertions=0 | 0 | 0 | 일치 | [`GODOT_BURN_RESULT` 원문](#result-5) |

### 근접 hurtE 69/0 대 PC 102/0 차이

Mac 결과의 `skipped=[]`, `fallback_paths_used=false`, `public_attack_api_used=true`를 원문으로 확인했다. 검사 누락이나 격리 불일치로 수를 줄인 실행이 아니다. 실제 그룹별 수는 providers_ready=15, shield_absorb_hits=36, overflow_and_kill_pipeline=18로 합계 69다. 원문 관측은 `shield_phase_hits=4`, `kill_hits_total=3`, `expected_stat_crit=0.0`이다.

**원인 추정:** 시작 장비 RNG → 실제 무기 공격력 → 쉴드/처치 타수 → 반복 assertion 수의 차이. 테스트의 `_check()`는 호출당 1을 더하고(`godot/tests/test_p1002e_melee_hurte.gd:53–54`), 쉴드 while(`:228`, 검사 `:237–265`)와 처치 while(`:279`, 검사 `:288–329`)는 실제 타수만큼 반복된다. Mac 쉴드 그룹은 3×9+마지막8+종료1=36, 처치 그룹은 3×2+처치12=18이다. 시작 장비는 `main.gd:138–141`에서 공유 RNG를 전달하고, `world.gd:3355–3357`의 `randi()` 및 `port_modules/starter_item_factory_source/producer.gd:613–615,634`의 난수 공격력을 사용한다(모두 **91565d492 기준 행**). seed 고정 호출은 해당 테스트에 없다.

PC102의 그룹별 수·타수·장비값 원로그가 제공되지 않아 정확한 원인은 미확정이다. 재실행으로 PC 수치를 맞추거나 제품/테스트 코드를 바꾸지 않았다.

## 2차: 최신 main 작업 2 목록 17종

PC 칸은 해당 source의 docs에 보존된 Windows 검수 요약이다. 17종을 같은 시점·같은 SHA에서 실행한 PC 원로그는 없으며, PC의 exit code·stderr ERROR 수는 이 자료에서 확인되지 않는다. 이를 임의로 0으로 채우지 않았다. 가변 검사는 PC의 과거 실행 수와 Mac 수를 각각 보존하고 **0실패 일치와 정확한 검사 수 일치를 구분**한다. exit 0만으로 통과시키지 않고 assertions>0, failures=0, skipped=[], stderr ERROR 0을 함께 확인했다.

| 테스트 | Mac 검사/실패 | PC 문서 결과 | exit | ERROR | PC 비교 | 마지막 RESULT 원문 |
|---|---:|---|---:|---:|---|---|
| `test_p1002e_melee_hurte` | 93/0 | 102/0; 기록 69~102/0 | 0 | 0 | 0실패 일치; 검사 수 가변 | [`P1002E_RESULT` 원문](#result-6) |
| `test_p1002f_dedicated_hurte` | 249/0 | 225~357/0 | 0 | 0 | 0실패 일치; 검사 수 가변 | [`P1002F_RESULT` 원문](#result-7) |
| `test_p1002g_kislash_hurte` | 214/0 | 168/0·214/0·220/0 | 0 | 0 | 0실패 일치; 검사 수 가변 | [`P1002G_RESULT` 원문](#result-8) |
| `test_p2001a_hit_feedback` | 31/0 | 31/0 | 0 | 0 | 수치 일치 | [`P2001A_RESULT` 원문](#result-9) |
| `test_p2001b_death_fx` | 42/0 | 37~44/0 | 0 | 0 | 0실패 일치; 검사 수 가변 | [`P2001B_RESULT` 원문](#result-10) |
| `test_p2001c_kill_rewards` | 46/0 | 39~263/0; 지역 통합 후 41/0 | 0 | 0 | 0실패 일치; 검사 수 가변 | [`P2001C_RESULT` 원문](#result-11) |
| `test_p2001h_curtain_spawn` | 124/0 | 124/0 (최초 122/0) | 0 | 0 | 수치 일치 | [`P2001H_RESULT` 원문](#result-12) |
| `test_p2001i_boot_intro` | 18/0 | 18/0 | 0 | 0 | 수치 일치 | [`P2001I_RESULT` 원문](#result-13) |
| `test_p2001j_lesson_clock` | 21/0 | 21/0 | 0 | 0 | 수치 일치 | [`P2001J_RESULT` 원문](#result-14) |
| `test_p2001k_lesson_practice` | 32/0 | 32/0 | 0 | 0 | 수치 일치 | [`P2001K_RESULT` 원문](#result-15) |
| `test_p2002a_hud` | 36/0 | 36/0 (이전 38/0·39/0) | 0 | 0 | 수치 일치 | [`P2002A_RESULT` 원문](#result-16) |
| `test_p2002b_minimap_corner` | 16/0 | 16/0 (최초 15/0) | 0 | 0 | 수치 일치 | [`P2002B_RESULT` 원문](#result-17) |
| `test_p2003a_lighting` | 10/0 | 10/0 | 0 | 1 | assertion 수치 일치; stderr ERROR 1 | [`P2003A_RESULT` 원문](#result-18) |
| `test_p2004a_pets` | 17/0 | 17/0 | 0 | 0 | 수치 일치 | [`P2004A_RESULT` 원문](#result-19) |
| `test_p2005a_start_skills` | 27/0 | 27/0 | 0 | 0 | 수치 일치 | [`P2005A_RESULT` 원문](#result-20) |
| `test_p2005b_giant_slam` | 12/0 | 12/0 | 0 | 1 | assertion 수치 일치; stderr ERROR 1 | [`P2005B_RESULT` 원문](#result-21) |
| `test_p2005c_spike_holy` | 20/0 | 20/0 | 0 | 1 | assertion 수치 일치; stderr ERROR 1 | [`P2005C_RESULT` 원문](#result-22) |

### PC 비교값의 문서 근거

경로는 `docs/engine/` 기준이며 위 최신 대상 SHA에서 읽었다. 초기·후속 수치를 서로 다른 실행 이력으로 보존했다.

| 테스트 | PC 근거 파일:행 |
|---|---|
| `test_p1002e_melee_hurte` | `FDG_GAME_DEVELOPMENT_PLAN.md:54,78; orders/reports/QA-001_REPORT.md:112 (83/0)` |
| `test_p1002f_dedicated_hurte` | `FDG_GAME_DEVELOPMENT_PLAN.md:55; FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md:293,401; FDG_P2_001J_LESSON_FLOW_AND_CLOCK_20261020.md:61` |
| `test_p1002g_kislash_hurte` | `FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md:395; FDG_GAME_DEVELOPMENT_PLAN.md:76` |
| `test_p2001a_hit_feedback` | `FDG_P2_001A_HIT_FEEDBACK_20261020.md:61` |
| `test_p2001b_death_fx` | `FDG_P2_001B_DEATH_IMPACT_FX_20261020.md:53; FDG_GAME_DEVELOPMENT_PLAN.md:64,65` |
| `test_p2001c_kill_rewards` | `FDG_GAME_DEVELOPMENT_PLAN.md:61,78; FDG_P2_001C_KILL_REWARDS_20261020.md:66,73` |
| `test_p2001h_curtain_spawn` | `FDG_P2_001I_BOOT_INTRO_WIRING_20261020.md:50` |
| `test_p2001i_boot_intro` | `FDG_P2_001I_BOOT_INTRO_WIRING_20261020.md:46` |
| `test_p2001j_lesson_clock` | `FDG_P2_001J_LESSON_FLOW_AND_CLOCK_20261020.md:56` |
| `test_p2001k_lesson_practice` | `FDG_P2_001K_LESSON_PANEL_PRACTICE_20261020.md:47` |
| `test_p2002a_hud` | `FDG_GAME_DEVELOPMENT_PLAN.md:75,78` |
| `test_p2002b_minimap_corner` | `FDG_P2_002B_MINIMAP_CORNER_20261020.md:45` |
| `test_p2003a_lighting` | `FDG_P2_003A_LIGHTING_20261020.md:33` |
| `test_p2004a_pets` | `FDG_P2_004A_PETS_20261020.md:27` |
| `test_p2005a_start_skills` | `FDG_P2_005A_START_SKILLS_20261020.md:28` |
| `test_p2005b_giant_slam` | `FDG_P2_005B_GIANT_SLAM_20261020.md:28` |
| `test_p2005c_spike_holy` | `FDG_P2_005C_SPIKE_HOLY_20261020.md:78` |

## 원본 근거·수행 범위

| 대상 | 테스트에 기록된 원본 근거·계약 |
|---|---|
| clock/playTime | `test_native_source_update_clock_play_time.gd:2–10`: 원본 game.html:32742 update prefix. producer fixture, actual Main write sink, actual frame halt를 분리 |
| 근접 hurtE | `test_p1002e_melee_hurte.gd:2–9`: 원본 game.html:37608–43116 공식; 공개 공격 API와 테스트 소유 위치/장비 개입 구분 |
| Main lesson | 원본 parry-lesson.js:2–6, game.html:33360의 holder/guard 계약은 마지막 RESULT의 source/provenance 원문 보존 |
| 최신 boot/clock | `test_p2001i_boot_intro.gd:3–6`: 64484→63277→63357→63342; `test_p2001j_lesson_clock.gd:3`: update32107→32108 계약 |
| 최신 HUD/minimap | `test_p2002a_hud.gd:3–7`: 원본 HUD/CSS; `:174–182`: 지역 처치60321–60322; `test_p2002b_minimap_corner.gd:69`: calcCP49487–49509 |

이번 작업은 기존 테스트의 Mac 실행 확인이다. 원본 전체 기능 동일성·픽셀 시각 품질·실플레이·FPS·전체 게임 이식 완료를 판정하지 않는다. 1차 clock의 `product_play_time_ready=false`, Main lesson의 `full_lesson_controller=false` 등 나머지 한계 항목은 부록의 RESULT 원문 그대로 남겼다.

## 실패·오류 원문과 남은 것

### test_p2003a_lighting (d3b672fea)

```text
WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.
     at: _update_process_callback (scene/2d/camera_2d.cpp:88)
     GDScript backtrace (most recent call first):
         [0] _ready (res://scripts/main.gd:212)
         [1] _boot_main (res://tests/test_p2003a_lighting.gd:65)
         [2] _test_overlay_structure_and_params (res://tests/test_p2003a_lighting.gd:71)
         [3] _run (res://tests/test_p2003a_lighting.gd:33)
ERROR: Parameter "t" is null.
   at: texture_2d_get (./servers/rendering/dummy/storage/texture_storage.h:110)
   GDScript backtrace (most recent call first):
       [0] _corner_brightness (res://tests/test_p2003a_lighting.gd:132)
```

**판정:** PC assertion 수치와는 10/0으로 일치하나 이번 Mac 실행의 stderr ERROR 0 조건은 미충족이다. PC stderr 원로그가 없어 PC의 ERROR 수와 직접 비교하는 판정은 하지 않는다. 제품 조명 결함으로 확정할 근거는 없다.

**원인 추정:** 테스트 `_corner_brightness()`의 `root.get_texture().get_image()`(`godot/tests/test_p2003a_lighting.gd:132`)가 headless dummy renderer의 제공되지 않은 화면 텍스처를 읽으며 ERROR를 출력했다. null/empty 검사는 그 호출 뒤 `:133–134`에서 수행된다. 이미지가 없어서 `:106–114`의 헤드리스 분기로 들어갔고 실제 밝기·비율의 픽셀 검사 3개(`:122–126`)는 수행하지 않았다. 이번 10개는 구조/파라미터9+가시성 토글1이다. `observations.brightness="headless_dummy_renderer_probe_covers"` 원문과 일치한다. `fallback_paths_used=false`는 `:40`의 고정 출력이므로 픽셀 검증 완료를 뜻하지 않는다.

PC 조명 문서 `FDG_P2_003A_LIGHTING_20261020.md:33–34`도 10/0과 headless 텍스처 미제공 및 별도 비헤드리스 픽셀 검증을 기록했다. 이번 Mac 실제 픽셀 검증은 미완이며 MAC-LIVE의 화면 확인과 별도다. renderer 변경·재실행·하니스/제품 수정은 하지 않았다.

### test_p2005b_giant_slam (d3b672fea)

```text
WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.
     at: _update_process_callback (scene/2d/camera_2d.cpp:88)
     GDScript backtrace (most recent call first):
         [0] _ready (res://scripts/main.gd:212)
         [1] _boot_main (res://tests/test_p2005b_giant_slam.gd:66)
         [2] _test_cast_costs_and_damage (res://tests/test_p2005b_giant_slam.gd:79)
         [3] _run (res://tests/test_p2005b_giant_slam.gd:35)
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
   at: cleanup (core/object/object.cpp:2536)
ERROR: 1 resources still in use at exit (run with --verbose for details).
   at: clear (core/io/resource.cpp:822)
```

**판정:** 기능 assertion은 0실패·exit 0이나 종료 resource ERROR 1줄로 clean ERROR 0을 충족하지 못했다. 남은 ObjectDB/resource 수는 위 stderr 원문을 따른다.

**원인 추정:** 하니스·스킬 오디오 종료 수명 경계. B 테스트 `:39–43,51–56`, C 테스트 `:41–45,53–58`은 Main의 remove_child/free 후 추가 프레임 없이 RESULT와 quit을 실행한다. B는 시전 후 총12 physics frame, C는 마지막 지옥강타 후10 physics frame만 기다린다. `native_skill_slots.gd:294–297`의 지옥강타는 재사용 `_audio`를 재생한다. `:335–338,365–367,477–478`의 가시덫·돔·피격음 one_shot은 `:498–507`의 finished→queue_free로 정리된다. 어댑터에는 별도 `_exit_tree()`가 없다. 어댑터는 `main.gd:244–249`의 World 자식이다.

부모 free는 자식도 해제하므로 위 구조만으로 하니스 결함·특정 오디오 누수로 확정할 수 없다. 비verbose 원로그에는 남은 객체/리소스 이름이 없어 정확한 소유자는 미확정이다. 활성 웨이브/존도 누수 원인으로 단정하지 않는다. --verbose 추가 실행·제품/테스트 수정은 하지 않았다.

### test_p2005c_spike_holy (d3b672fea)

```text
WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.
     at: _update_process_callback (scene/2d/camera_2d.cpp:88)
     GDScript backtrace (most recent call first):
         [0] _ready (res://scripts/main.gd:212)
         [1] _boot_main (res://tests/test_p2005c_spike_holy.gd:68)
         [2] _test_spike_trap_cast_zone_and_dot (res://tests/test_p2005c_spike_holy.gd:96)
         [3] _run (res://tests/test_p2005c_spike_holy.gd:37)
WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).
   at: cleanup (core/object/object.cpp:2536)
ERROR: 4 resources still in use at exit (run with --verbose for details).
   at: clear (core/io/resource.cpp:822)
```

**판정:** 기능 assertion은 0실패·exit 0이나 종료 resource ERROR 1줄로 clean ERROR 0을 충족하지 못했다. 남은 ObjectDB/resource 수는 위 stderr 원문을 따른다.

**원인 추정:** 하니스·스킬 오디오 종료 수명 경계. B 테스트 `:39–43,51–56`, C 테스트 `:41–45,53–58`은 Main의 remove_child/free 후 추가 프레임 없이 RESULT와 quit을 실행한다. B는 시전 후 총12 physics frame, C는 마지막 지옥강타 후10 physics frame만 기다린다. `native_skill_slots.gd:294–297`의 지옥강타는 재사용 `_audio`를 재생한다. `:335–338,365–367,477–478`의 가시덫·돔·피격음 one_shot은 `:498–507`의 finished→queue_free로 정리된다. 어댑터에는 별도 `_exit_tree()`가 없다. 어댑터는 `main.gd:244–249`의 World 자식이다.

부모 free는 자식도 해제하므로 위 구조만으로 하니스 결함·특정 오디오 누수로 확정할 수 없다. 비verbose 원로그에는 남은 객체/리소스 이름이 없어 정확한 소유자는 미확정이다. 활성 웨이브/존도 누수 원인으로 단정하지 않는다. --verbose 추가 실행·제품/테스트 수정은 하지 않았다.

실창·녹화·시각 인수는 MAC-LIVE 결과를 별도로 확인해야 한다. PC1·3·4·5·6 구현/수정, main 병합·push, force·reset은 수행 범위에 없다.

### 종료 환경 보존 확인

`post-tests-state.json`에서 R의 branch/HEAD·tracked INDEX/WORK는 시작과 동일하고 두 검증 worktree의 제품·테스트 tracked diff는 없었다. 두 `override.cfg`는 모두 존재하지 않는다. `raw-logs-sha256.json`은 24실행(22테스트+2import)의 `.out/.err/.json` 72파일 SHA-256을 보존한다.

검증 구간 후 `editor_settings-4.7.tres`의 SHA-256은 사전 백업과 달랐고 `projects.cfg`는 같았다. 전후 editor 설정 파일은 사전 원본과 `post-tests-editor_settings-4.7.tres`로 별도 보존했다. 직렬화 항목 비교는 삭제167·추가0·공통 키 값 변경0이었다. 상세 변경 키는 `editor-settings-change.json`에만 기록하고 사용자 전역 설정 내용을 Git에 넣지 않는다. 다른 Godot 작업이 함께 있어 이번 import만의 변경이라고 확정하지 않으며, 전역 설정을 임의 복원하거나 타 작업의 설정을 덮어쓰지 않았다.

## 변경·제출·복구

| 파일/산출물 | 변경 내용 |
|---|---|
| `docs/engine/orders/reports/mac-verify_REPORT.md` | 이 보고서와 마지막 RESULT 원문 발췌 |
| `docs/engine/orders/WORK_BOARD.md` | MAC-VERIFY 행만 헤드리스 결과·검수 대기로 갱신 |
| 제품·테스트 코드 | 변경 0. import 파생 캐시·override·로컬 로그는 커밋하지 않음 |
| 로컬 실행 산출물 | 위 OUT의 원로그·실행 json·실행 기록기·PC 근거·manifest, 별도 Application Support 백업 |
| 검증 source SHA | 위 1차/2차 두 전체 SHA |
| 보고서 체크포인트 SHA | `52b4a0c5f6cd1c8ab817b5b48f8de70708ba1e06` (아래 결과·원문을 처음 보존한 소유 커밋; 최종 제출 tip은 DONE/submission으로 대조) |
| 최종 원격 제출 SHA | `codex/mac-verify-20261020`의 최종 tip 및 OUT `DONE.txt`/`submission.json`에서 확인; 보고서 자신의 SHA를 본문에 자기 참조하지 않음 |

스테이징은 위 두 문서의 경로를 지정한다. 자기 브랜치만 비강제 push하며 원격 ref SHA를 읽어 대조한 뒤 `DONE.txt`에 최종 브랜치·SHA·요약을 기록한다.

## 마지막 RESULT 원문 발췌

아래 각 코드블록의 한 줄은 해당 `.out`에서 마지막으로 나타난 RESULT 줄을 그대로 복사했다. assertions 외 관측·주입·fixture·fallback·공개 플레이/성능 한계도 편집하지 않았다. 각 `.err`는 별도 원문 보존하며 ERROR 집계와 전체 stderr 줄 수를 함께 기록했다.

<a id="result-1"></a>

### 1. test_native_source_update_clock_play_time — 91565d492

격리: `EXODUSER-UpdateClockPlayTime-Isolated-20261019`. exit=0, ERROR=0, stderr 전체 줄=7, 초=14.473.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_native_source_update_clock_play_time.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_native_source_update_clock_play_time.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
UPDATE_CLOCK_PLAY_TIME_RESULT {"assertions":30,"failures":0,"groups":[{"assertions":17,"failures":0,"group":"producer_stage_play_time_contract"},{"assertions":8,"failures":0,"group":"actual_main_write_sink_and_ready"},{"assertions":5,"failures":0,"group":"actual_main_frame_callback_halt"}],"observations":{"frame_callback_update_clock_result":{"last":{"applied_phases":[],"phase":"system_lesson","reason":"system_lesson_presence_unknown","status":"NOT_READY"},"status":"NOT_READY","update_state":{"applied_phases":[],"dt_sp":1.0,"dt_sp_writer":"declaration_60463","hitstop_dt_restore":"NR (restore of _hsDtOrig not in packet)","hs_active":null,"hs_dt_orig":null,"in_update":true,"next_phase":"system_lesson","not_ready_at":"system_lesson","returned_at":"","sp_published":false}},"producer_contract_g":{"hitStop":0,"on":true,"paused":false,"playTime":"corrupt","slowMo":0,"stageTime":3.0},"write_sink_receipt":{"applied":[{"key":"stageTime","value":0.5},{"key":"playTime","value":0.5}],"reason":"","source":"native.State._g.source_update_clock_writes","status":"READY","writes":2}},"producer_fixture_inputs_are_test_owned":true,"product_play_time_ready":false,"public_play_evidence":false,"skipped_main_groups":[]}
```

<a id="result-2"></a>

### 2. test_p1002e_melee_hurte — 91565d492

격리: `EXODUSER-P1002E-Isolated-20261019`. exit=0, ERROR=0, stderr 전체 줄=7, 초=11.239.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_p1002e_melee_hurte.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_p1002e_melee_hurte.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P1002E_RESULT {"assertions":69,"failures":0,"fallback_paths_used":false,"forced_actor_fields":15,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":36,"failures":0,"group":"shield_absorb_hits"},{"assertions":18,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":4,"rifts":0},"kill_hits_total":3,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":4},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

<a id="result-3"></a>

### 3. test_native_main_source_lesson — 91565d492

격리: `EXODUSER-MainSourceLesson-Isolated-20261014`. exit=0, ERROR=0, stderr 전체 줄=7, 초=18.609.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_native_main_source_lesson.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_native_main_source_lesson.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
MAIN_LESSON_FIRST_RESULT {"assertions":30,"automatic_lesson_progress":false,"failures":0,"fixture_current_replacements":"chapter2/chapter3 only via actual holder public publisher","full_lesson_controller":false,"groups":[{"assertions":13,"failures":0,"group":"file_init_actual_main"},{"assertions":10,"failures":0,"group":"live_callable_replacement_and_revoke"},{"assertions":7,"failures":0,"group":"main_loss_physical_gate"}],"observations":{"file_init_actual_main":{"cold_callback_owner_main":true,"guard_detail":{"authority":"CURRENT_LESSON","epoch":1,"origin":"native_main_binding","ready":true,"reason":"active_falsy","source":"R game.html:33360","source_phase":"source_file_init","status":"READY","value":{"parry_lesson_active":false}},"holder_id":-9223371974141540907,"main_id":62662903241,"main_snapshot":{"automatic_source_regeneration_bound":false,"file_init_attempted":true,"file_init_error":"","file_init_publish_calls":1,"full_main_ready":false,"guard_detail":{"authority":"CURRENT_LESSON","epoch":1,"origin":"native_main_binding","ready":true,"reason":"active_falsy","source":"R game.html:33360","source_phase":"source_file_init","status":"READY","value":{"parry_lesson_active":false}},"guard_ready":true,"holder":{"authority":"CURRENT_LESSON","automatic_clock":false,"counts":{"epoch_rejected":0,"finish_projection":0,"publish":1,"publish_rejected":0,"read_guard":2,"read_guard_not_ready":0,"reset_for_new_character":0,"resource_start_projection":0,"revoke":0,"start_projection":0},"current_kind":"dictionary","current_present":true,"epoch":1,"full_main_ready":false,"last_projection":"","main_binding_proven":false,"missing_reason":"","origin":"native_main_binding","owner_declared":false,"provenance":{"authority":"CURRENT_LESSON","automatic_source_regeneration_bound":false,"caller":"Main._ready/file_init","epoch":1,"main_binding_proven":false,"main_resource_path":"res://scripts/main.gd","native_main_instance_id":62662903241,"native_phase":"before_World_Player_source_construction","origin":"native_main_binding","source":"R parry-lesson.js:2-6","source_file_init":"R parry-lesson.js:2-6","source_phase":"source_file_init"},"schema":"exoduser.godot.parry-lesson-source-holder.v1","source_phase":"source_file_init","unported":["lesson UI/input/update/render","skipKey URL/char/slot source (external callback)","localStorage persistence (external command)","start/finish external restoration","NativeMain publication/lifecycle (ENGINE)"],"witness_raw":null},"holder_retained_by_actual_Main":true,"lesson_controller_bound":false,"native_main_instance_id":62662903241,"public_play_proven":false,"publish_result":{"authority":"CURRENT_LESSON","epoch":1,"ready":true,"reason":"","status":"READY"},"raw_current_reference_is_not_guard_authority":true,"source_boot_input":{"chapter_present":false,"current":false,"excluded":["t()","get labels()","skipKey()","resetForNewCharacter()","dismissed()","<methods/UI>"],"fields":[["active",false],["seen",false],["phase","intro"],["step",0],["checks",[false,false,false,false,false,false,false,false]],["shot",null],["heldDirections",{}]],"held_directions_repr":"Dictionary-as-Set (keys)","packet_kind":"parry_lesson_source_constructor_packet","source":"R parry-lesson.js:2-6","status":"SOURCE_BOOT"},"status":"READY"},"raw_file_init":{"active":false,"checks":[false,false,false,false,false,false,false,false],"heldDirections":{},"phase":"intro","seen":false,"shot":null,"step":0}},"live_callable_replacement_and_revoke":{"after_revocation_main_snapshot":{"automatic_source_regeneration_bound":false,"file_init_attempted":true,"file_init_error":"","file_init_publish_calls":1,"full_main_ready":false,"guard_detail":{"authority":"MISSING","epoch":4,"origin":"","ready":false,"reason":"authority_missing:explicit_fixture_controller_loss","source":"R game.html:33360","source_phase":"","status":"NOT_READY","value":null},"guard_ready":false,"holder":{"authority":"MISSING","automatic_clock":false,"counts":{"epoch_rejected":0,"finish_projection":0,"publish":3,"publish_rejected":0,"read_guard":6,"read_guard_not_ready":4,"reset_for_new_character":0,"resource_start_projection":0,"revoke":1,"start_projection":0},"current_kind":"none","current_present":false,"epoch":4,"full_main_ready":false,"last_projection":"","main_binding_proven":false,"missing_reason":"explicit_fixture_controller_loss","origin":"","owner_declared":false,"provenance":{},"schema":"exoduser.godot.parry-lesson-source-holder.v1","source_phase":"","unported":["lesson UI/input/update/render","skipKey URL/char/slot source (external callback)","localStorage persistence (external command)","start/finish external restoration","NativeMain publication/lifecycle (ENGINE)"],"witness_raw":null},"holder_retained_by_actual_Main":true,"lesson_controller_bound":false,"native_main_instance_id":179633656063,"public_play_proven":false,"publish_result":{"authority":"CURRENT_LESSON","epoch":1,"ready":true,"reason":"","status":"READY"},"raw_current_reference_is_not_guard_authority":true,"source_boot_input":{"chapter_present":false,"current":false,"excluded":["t()","get labels()","skipKey()","resetForNewCharacter()","dismissed()","<methods/UI>"],"fields":[["active",false],["seen",false],["phase","intro"],["step",0],["checks",[false,false,false,false,false,false,false,false]],["shot",null],["heldDirections",{}]],"held_directions_repr":"Dictionary-as-Set (keys)","packet_kind":"parry_lesson_source_constructor_packet","source":"R parry-lesson.js:2-6","status":"SOURCE_BOOT"},"status":"NOT_READY"},"fixture_origin":"own_constructor_fixture","full_controller_or_natural_phase_claim":false,"replacement2":{"authority":"CURRENT_LESSON","epoch":2,"ready":true,"reason":"","status":"READY"},"replacement3":{"authority":"CURRENT_LESSON","epoch":3,"ready":true,"reason":"","status":"READY"}},"main_loss_physical_gate":{"automatic_main_loss_revoke_assumed":false,"get_snapshot_on_freed_main":"NOT_CALLED","main_callable_valid":false,"main_freed":true,"retained_guard":{"authority":"CURRENT_LESSON","epoch":1,"origin":"native_main_binding","ready":true,"reason":"active_falsy","source":"R game.html:33360","source_phase":"source_file_init","status":"READY","value":{"parry_lesson_active":false}},"retained_holder_snapshot":{"authority":"CURRENT_LESSON","automatic_clock":false,"counts":{"epoch_rejected":0,"finish_projection":0,"publish":1,"publish_rejected":0,"read_guard":2,"read_guard_not_ready":0,"reset_for_new_character":0,"resource_start_projection":0,"revoke":0,"start_projection":0},"current_kind":"dictionary","current_present":true,"epoch":1,"full_main_ready":false,"last_projection":"","main_binding_proven":false,"missing_reason":"","origin":"native_main_binding","owner_declared":false,"provenance":{"authority":"CURRENT_LESSON","automatic_source_regeneration_bound":false,"caller":"Main._ready/file_init","epoch":1,"main_binding_proven":false,"main_resource_path":"res://scripts/main.gd","native_main_instance_id":296319192742,"native_phase":"before_World_Player_source_construction","origin":"native_main_binding","source":"R parry-lesson.js:2-6","source_file_init":"R parry-lesson.js:2-6","source_phase":"source_file_init"},"schema":"exoduser.godot.parry-lesson-source-holder.v1","source_phase":"source_file_init","unported":["lesson UI/input/update/render","skipKey URL/char/slot source (external callback)","localStorage persistence (external command)","start/finish external restoration","NativeMain publication/lifecycle (ENGINE)"],"witness_raw":null}}},"old_successful_replays":0,"owned_main_cleanup_ids":[62662903241,179633656063,296319192742],"public_pixel_qa":false}
```

<a id="result-4"></a>

### 4. test_contracts — 91565d492

격리: `EXODUSER-Supervisor-Regress-20261019`. exit=0, ERROR=0, stderr 전체 줄=0, 초=1.422.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_contracts.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_contracts.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
GODOT_CONTRACT_RESULT {"failed_assertions":0,"only":[],"passed":5,"performance_evidence":false,"public_play_evidence":false}
```

<a id="result-5"></a>

### 5. test_etype0_physical_burn — 91565d492

격리: `EXODUSER-Supervisor-Regress-20261019`. exit=0, ERROR=0, stderr 전체 줄=0, 초=0.551.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_etype0_physical_burn.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/baseline-91565d492/test_etype0_physical_burn.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
GODOT_BURN_RESULT {"automatic_fixture_physics_ticks":17.0,"explicit_native_method_calls":1597,"failed_assertions":0,"forced_actor_fields":0,"live_app_inputs":0,"only":[],"passed":4,"performance_evidence":false,"public_play_evidence":false,"source_factory_executions":0}
```

<a id="result-6"></a>

### 6. test_p1002e_melee_hurte — d3b672fea

격리: `EXODUSER-P1002E-Isolated-20261019`. exit=0, ERROR=0, stderr 전체 줄=9, 초=18.719.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p1002e_melee_hurte.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p1002e_melee_hurte.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P1002E_RESULT {"assertions":93,"failures":0,"fallback_paths_used":false,"forced_actor_fields":25,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":54,"failures":0,"group":"shield_absorb_hits"},{"assertions":24,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1004,"rifts":0},"kill_hits_total":6,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":6},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

<a id="result-7"></a>

### 7. test_p1002f_dedicated_hurte — d3b672fea

격리: `EXODUSER-P1002F-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=9, 초=40.804.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p1002f_dedicated_hurte.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p1002f_dedicated_hurte.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P1002F_RESULT {"assertions":249,"failures":0,"fallback_paths_used":false,"forced_actor_fields":111,"groups":[{"assertions":31,"failures":0,"group":"setup"},{"assertions":197,"failures":0,"group":"combat"},{"assertions":21,"failures":0,"group":"per_enemy_coverage"}],"observations":{"aim_basis":{"facing_write_survives_frame":false,"mouse_world":[3060.0,6460.0],"player_pos":[4020.0,7420.0],"pointer_provider_bound":false},"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"halt_count":0,"hits_flesh_crawler":7,"hits_hive_bloater":7,"hits_ice_soul_flame":7,"hits_spine_beast":7,"kill_rng_flesh_crawler":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_edef","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:crystal_id","drop:crystal_star","drop:crystal_quality","drop:stone_gate"],"kill_rng_hive_bloater":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_ice_soul_flame":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_spine_beast":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:bow_type","drop:bow_range","drop:bow_bonus_range","drop:bow_pierce","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"swing_log":[{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":281.0,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":276.1,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":16,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":271.2,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":2,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":262.2,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":252.4,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":247.5,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":242.6,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":17,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":237.7,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":228.6,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":223.7,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":2,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":218.7,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":17,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":213.9,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":209.7,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":2,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":204.9,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":200.0,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":11,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":195.1,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":190.9,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":186.0,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":181.1,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":176.3,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":1,"halts":0,"outcomes":2,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":171.4,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":161.5,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":156.6,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":151.7,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":146.9,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":142.0,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":590.0,"p_state":"swing","p_state_end":"idle","stamina":137.1,"t":"hive_bloater"}],"total_swings":27},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

<a id="result-8"></a>

### 8. test_p1002g_kislash_hurte — d3b672fea

격리: `EXODUSER-P1002G-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=9, 초=18.427.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p1002g_kislash_hurte.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p1002g_kislash_hurte.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P1002G_RESULT {"assertions":214,"failures":0,"fallback_paths_used":false,"forced_actor_fields":20,"groups":[{"assertions":20,"failures":0,"group":"setup"},{"assertions":161,"failures":0,"group":"combat"},{"assertions":33,"failures":0,"group":"per_enemy_coverage"}],"observations":{"aim_basis":{"facing_write_survives_frame":false,"pointer_provider_bound":false},"cast_damages":[{"damage":940,"step":1,"tier":0},{"damage":940,"step":2,"tier":0},{"damage":7526,"step":3,"tier":3},{"damage":940,"step":1,"tier":0},{"damage":940,"step":2,"tier":0},{"damage":940,"step":3,"tier":0},{"damage":940,"step":1,"tier":0}],"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"halt_count":0,"hits_eye_mass_01":2,"hits_eye_mass_02":1,"hits_flesh_crawler":2,"hits_hive_bloater":2,"hits_ice_soul_flame":2,"hits_spine_beast":2,"kill_rng_eye_mass_01":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:helmet_bonus_range","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_eye_mass_02":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_flesh_crawler":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:stat_bonus_st","drop:gloves_pot_cd","drop:gloves_atk_spd","drop:armor_stat_count_r2","drop:armor_stat_pick","drop:armor_stat_pick","drop:armor_stat_value","drop:armor_stat_value","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_hive_bloater":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_edef","drop:neck_affix1","drop:neck_affix2","drop:acc_lck","drop:acc_grit","drop:acc_stat_pick","drop:acc_stat_value","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_tierW","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:implicit_value","drop:legendary_special","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_ice_soul_flame":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:weapon_type","drop:weapon_range","drop:weapon_bonus_range","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate","drop:stone_tier","drop:stone_quality"],"kill_rng_spine_beast":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"melee_ref":16.0,"swing_log":[{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"swing","stamina":252.0,"t":"eye_mass_01"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"swing","stamina":242.3,"t":"eye_mass_01"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"windup","stamina":232.6,"t":"eye_mass_02","windup_hold":130},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"swing","stamina":223.3,"t":"ice_soul_flame"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"swing","stamina":213.6,"t":"ice_soul_flame"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"windup","stamina":204.0,"t":"flesh_crawler","windup_hold":1},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"swing","stamina":194.3,"t":"flesh_crawler"}],"total_casts":7},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

<a id="result-9"></a>

### 9. test_p2001a_hit_feedback — d3b672fea

격리: `EXODUSER-P2001A-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=7, 초=12.121.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001a_hit_feedback.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001a_hit_feedback.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2001A_RESULT {"assertions":31,"failures":0,"fallback_paths_used":false,"forced_actor_fields":11,"groups":[{"assertions":10,"failures":0,"group":"bar_layout_pure"},{"assertions":9,"failures":0,"group":"pump_rules_owner"},{"assertions":12,"failures":0,"group":"live_combat_feedback"}],"observations":{"found_slot":{"c":"#ffcc33","ml":50.0,"sz":56.0},"overflow_outcome":{"crit":false,"dmg":125},"pump_unit":{"crit":{"color":"#dd2200","life":70,"num_str":"999","size":72,"text":"💀999","x":5.0,"y":-34.0},"normal":{"color":"#ffcc33","life":50,"num_str":"123","size":56,"text":"⚔123","x":100.0,"y":160.0}}},"skipped":[]}
```

<a id="result-10"></a>

### 10. test_p2001b_death_fx — d3b672fea

격리: `EXODUSER-P2001B-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=9, 초=28.317.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001b_death_fx.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001b_death_fx.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2001B_RESULT {"assertions":42,"failures":0,"fallback_paths_used":false,"forced_actor_fields":32,"groups":[{"assertions":5,"failures":0,"group":"assets_and_adapter"},{"assertions":28,"failures":0,"group":"weapon_hit_and_kill_fx"},{"assertions":9,"failures":0,"group":"lifetimes_and_kislash_noimpact"}],"observations":{"final_metrics":{"blood_anims":1,"corpses":1,"death_fx":1,"death_impacts":1,"death_sound_skipped_missing_assets":0,"death_sounds_dispatched":1,"gore_pieces":2,"impacts":6,"rng_calls":270,"stains":1},"kill_metrics":{"blood_anims":1,"corpses":1,"death_fx":1,"death_impacts":1,"death_sound_skipped_missing_assets":0,"death_sounds_dispatched":1,"gore_pieces":2,"impacts":6,"rng_calls":270,"stains":1},"pool_limits":{"corpses":120,"di":12,"gore":120,"impacts":12,"stains":30}},"skipped":[]}
```

<a id="result-11"></a>

### 11. test_p2001c_kill_rewards — d3b672fea

격리: `EXODUSER-P2001C-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=9, 초=19.788.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001c_kill_rewards.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001c_kill_rewards.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2001C_RESULT {"assertions":46,"failures":0,"fallback_paths_used":false,"forced_actor_fields":35,"groups":[{"assertions":16,"failures":0,"group":"drop_module_pure"},{"assertions":8,"failures":0,"group":"reward_owner_units"},{"assertions":22,"failures":0,"group":"live_kill_rewards"}],"observations":{"death_sound_dispatches":1,"exp_unit":{"exp":5,"lv":2,"maxExp":20,"unported":["SFX.levelup","showPH_LEVEL_UP","_levelUpVfx","dbSaveForce(세이브_금지)","passive_queue(큐_시스템_부재)"]},"kill_journal":{"add_exp":{"combo_bonus":1.0,"exp":6,"levels":0,"lv":2,"raw":5,"unported":["SFX.levelup","showPH_LEVEL_UP","_levelUpVfx","dbSaveForce(세이브_금지)","passive_queue(큐_시스템_부재)"],"value":1},"potion":{"accepted":false,"gate":0.639396961545572,"type":"mp"},"roll_drop":{"crystal":false,"items":1,"stone":false,"unported":["floor_item_render_pickup","playItemDropSfx","_crAutoProcess(기본 OFF)"]}},"pure_draw_tags_b":["drop_gate","drop_rarity","drop_slot","drop_element","atk_skew","base_weapon_antirevive","base_shield_hp","base_shield_st","base_shield_antirevive","base_boots_st","base_boots_hp","base_armor_st"]},"skipped":[]}
```

<a id="result-12"></a>

### 12. test_p2001h_curtain_spawn — d3b672fea

격리: `EXODUSER-P2001H-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=7, 초=10.325.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001h_curtain_spawn.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001h_curtain_spawn.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2001H_RESULT {"assertions":124,"failures":0,"fallback_paths_used":false,"groups":[{"assertions":110,"failures":0,"group":"begin_and_finish_spawn"},{"assertions":10,"failures":0,"group":"bonfire_and_curtain_lifecycle"},{"assertions":4,"failures":0,"group":"hurte_path_on_spawned"}],"observations":{"bonfire_pushes":135,"magic_elites":0,"rng_calls":35},"skipped":[]}
```

<a id="result-13"></a>

### 13. test_p2001i_boot_intro — d3b672fea

격리: `EXODUSER-P2001I-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=6, 초=8.951.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001i_boot_intro.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001i_boot_intro.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2001I_RESULT {"assertions":18,"failures":0,"fallback_paths_used":false,"groups":[{"assertions":8,"failures":0,"group":"boot_auto_intro"},{"assertions":5,"failures":0,"group":"guide_key_input_and_open"},{"assertions":5,"failures":0,"group":"post_open_game_state"}],"observations":{"live_update_clock":{"owner_writes":[{"target":"G.stageTime","value":33.0},{"target":"G.playTime","value":33.0}],"phase":"stage_play_time","sp":1.0,"status":"CONTINUE","write_receipt":{"applied":[{"key":"stageTime","value":33.0},{"key":"playTime","value":33.0}],"reason":"","source":"native.State._g.source_update_clock_writes","status":"READY","writes":2}},"metrics":{"bonfire_pushes":0,"intro_enemies_cleared":6,"magic_elites":0,"purge_candidates":0,"purge_removed":0,"rng_calls":35,"safe_point_moves":1,"spawned":5},"ring_count":5},"skipped":[]}
```

<a id="result-14"></a>

### 14. test_p2001j_lesson_clock — d3b672fea

격리: `EXODUSER-P2001J-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=6, 초=10.025.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001j_lesson_clock.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001j_lesson_clock.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2001J_RESULT {"assertions":21,"failures":0,"fallback_paths_used":false,"groups":[{"assertions":11,"failures":0,"group":"lesson_auto_start_after_curtain"},{"assertions":6,"failures":0,"group":"lesson_skip_restores"},{"assertions":4,"failures":0,"group":"clock_reaches_stage_time"}],"observations":{"clock_after_lesson":{"owner_writes":[{"target":"G.stageTime","value":234.0},{"target":"G.playTime","value":234.0}],"phase":"stage_play_time","sp":1.0,"status":"CONTINUE","write_receipt":{"applied":[{"key":"stageTime","value":234.0},{"key":"playTime","value":234.0}],"reason":"","source":"native.State._g.source_update_clock_writes","status":"READY","writes":2}},"clock_during_lesson":{"phase":"parry_lesson","status":"RETURNED"},"hud_timer":"00:03","lmb_before_lesson":"kiSlash","stage_time_delta":90.0},"skipped":[]}
```

<a id="result-15"></a>

### 15. test_p2001k_lesson_practice — d3b672fea

격리: `EXODUSER-P2001K-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=6, 초=11.806.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001k_lesson_practice.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2001k_lesson_practice.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2001K_RESULT {"assertions":32,"failures":0,"fallback_paths_used":false,"groups":[{"assertions":13,"failures":0,"group":"panel_design_contract"},{"assertions":13,"failures":0,"group":"practice_basic_steps"},{"assertions":6,"failures":0,"group":"halt_and_skip_restore"}],"observations":{"final_metrics":{"delegated_hits":72,"enemies_restored":5,"enemies_saved":5,"lesson_enemy_spawns":17,"lesson_kills":15,"practice_clicks_unported":0,"rng_calls":233,"skips":1,"starts":1,"tick_calls":518},"holder_status":{"active":true,"authority":"CURRENT_LESSON","ready":true,"reason":"current_active"},"hurte_outcome":{"halted_at":null,"keys":["ok","journal","rng_draws","fallback_used","applied","returned_at","lesson_delegated","lesson_result"],"ok":true,"reason":null,"returned_at":42111},"metrics_after_basics":{"delegated_hits":72,"enemies_restored":0,"enemies_saved":5,"lesson_enemy_spawns":17,"lesson_kills":15,"practice_clicks_unported":0,"rng_calls":233,"skips":0,"starts":1,"tick_calls":474},"panel_children":5,"provider_status":{"active":true,"authority":"CURRENT_LESSON","epoch":2,"known_absent":false,"lesson_reference":"<Freed Object>","origin":"native_main_binding","ready":true,"reason":"current_active","source":"parry_lesson_source.read_active_status","source_phase":"external_current_publisher","status":"READY"}},"skipped":[]}
```

<a id="result-16"></a>

### 16. test_p2002a_hud — d3b672fea

격리: `EXODUSER-P2002A-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=9, 초=11.056.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2002a_hud.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2002a_hud.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2002A_RESULT {"assertions":36,"failures":0,"fallback_paths_used":false,"forced_actor_fields":4,"groups":[{"assertions":29,"failures":0,"group":"hud_initial_values_and_overlay"},{"assertions":7,"failures":0,"group":"hud_updates_on_kill_and_levelup"}],"observations":{"after_kill":{"debug_overlay_visible":false,"exp_fill_px":60.0,"exp_text":"6 / 20","kill_text":"0 / 0","lv_text":"2","malice_text":"1,005","ready":true,"serif_font_loaded":true,"slot_icon_files":{"qs0":"spikeTrap","qs1":"","qs2":"","qs3":"","qs5":"holyDome","qsE":"fireball","qsQ":"peaceShield","skSlot0":"chargeBoost","skSlot1":"giantSlam","skSlotCT":"iceOrb","skSlotLMB":"kiSlash","skSlotRMB":"shieldThrow","ultSlot":""},"timer_text":"00:00","unported":["미니맵(mmWrap)","hudCorner 화폐(✦ SP/◇ CP)","지역(_regCur) 분모·진행바 4지역","G._totalSpawned 기록(스포너=world 소유 — wt-p2g 경합)","쿨다운 sweep(쿨다운 소유자 미이식)","Cinzel·Nanum Myeongjo 폰트(Noto Serif KR 폴백)","숫자/F/Z 슬롯 스킬(시작 스킬 지급 EXTERNAL 미이식)","타이머 전진(G.on 점등 미이식 — 초기화·커튼 계약이 pre-stage on=false 유지 명시: 타이머 UI는 G.stageTime 소비만)"]},"initial":{"debug_overlay_visible":false,"exp_fill_px":0.0,"exp_text":"0 / 15","kill_text":"0 / 0","lv_text":"1","malice_text":"1,000","ready":true,"serif_font_loaded":true,"slot_icon_files":{"qs0":"spikeTrap","qs1":"","qs2":"","qs3":"","qs5":"holyDome","qsE":"fireball","qsQ":"peaceShield","skSlot0":"chargeBoost","skSlot1":"giantSlam","skSlotCT":"iceOrb","skSlotLMB":"kiSlash","skSlotRMB":"shieldThrow","ultSlot":""},"timer_text":"00:00","unported":["미니맵(mmWrap)","hudCorner 화폐(✦ SP/◇ CP)","지역(_regCur) 분모·진행바 4지역","G._totalSpawned 기록(스포너=world 소유 — wt-p2g 경합)","쿨다운 sweep(쿨다운 소유자 미이식)","Cinzel·Nanum Myeongjo 폰트(Noto Serif KR 폴백)","숫자/F/Z 슬롯 스킬(시작 스킬 지급 EXTERNAL 미이식)","타이머 전진(G.on 점등 미이식 — 초기화·커튼 계약이 pre-stage on=false 유지 명시: 타이머 UI는 G.stageTime 소비만)"]}},"skipped":[]}
```

<a id="result-17"></a>

### 17. test_p2002b_minimap_corner — d3b672fea

격리: `EXODUSER-P2002B-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=7, 초=8.018.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2002b_minimap_corner.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2002b_minimap_corner.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2002B_RESULT {"assertions":16,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":13,"failures":0,"group":"minimap_cache_and_corner_initial"},{"assertions":3,"failures":0,"group":"corner_updates_via_owner"}],"observations":{"after_levelup":{"cp_text":"◇ 1,666","minimap_cache_ready":true,"minimap_enemy_points":6,"minimap_origin":[4.0,4.0],"minimap_portrait_loaded":true,"minimap_sc":0.61,"sp_text":"✦ 3 +1","unported":["지역 처치 C후크·소환굴확정분모·필드보스전투 미연결(P3-003)","소환굴 점 데이터(G.spawnHoles — 웹 14건 실측·포트 스포너가 G에 미기록: world 소유)","출구 ▲(!bossAlive 조건 — 신규 true)","분산 빌드(_mmTickBuild — 고정 맵 1회 빌드 근사)","맵 오브젝트 마커(bonfire/trap/altar — 1장 데이터에 없음)","frame drop-shadow·brightness 필터(953)","hudCorner box-shadow·inset 하이라이트 근사 생략","Cinzel 폰트(Noto Serif KR 폴백)","spCnt 클릭(J 능력치 패널 미이식)","나눔명조 1순위(웹폰트 — 사용자 승인 대기 목록)","적 점 색 데이터 차(규칙 ELC[e.el] 동일 — 웹 el0 회백 vs 포트 encounter element_id 3 보라: 데이터 소유 wt-p2g)"]},"initial":{"cp_text":"◇ 1,656","minimap_cache_ready":true,"minimap_enemy_points":6,"minimap_origin":[4.0,4.0],"minimap_portrait_loaded":true,"minimap_sc":0.61,"sp_text":"✦ 0","unported":["지역 처치 C후크·소환굴확정분모·필드보스전투 미연결(P3-003)","소환굴 점 데이터(G.spawnHoles — 웹 14건 실측·포트 스포너가 G에 미기록: world 소유)","출구 ▲(!bossAlive 조건 — 신규 true)","분산 빌드(_mmTickBuild — 고정 맵 1회 빌드 근사)","맵 오브젝트 마커(bonfire/trap/altar — 1장 데이터에 없음)","frame drop-shadow·brightness 필터(953)","hudCorner box-shadow·inset 하이라이트 근사 생략","Cinzel 폰트(Noto Serif KR 폴백)","spCnt 클릭(J 능력치 패널 미이식)","나눔명조 1순위(웹폰트 — 사용자 승인 대기 목록)","적 점 색 데이터 차(규칙 ELC[e.el] 동일 — 웹 el0 회백 vs 포트 encounter element_id 3 보라: 데이터 소유 wt-p2g)"]}},"skipped":[]}
```

<a id="result-18"></a>

### 18. test_p2003a_lighting — d3b672fea

격리: `EXODUSER-P2003A-Isolated-20261020`. exit=0, ERROR=1, stderr 전체 줄=11, 초=8.0.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2003a_lighting.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2003a_lighting.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2003A_RESULT {"assertions":10,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":9,"failures":0,"group":"overlay_structure_and_params"},{"assertions":1,"failures":0,"group":"overlay_darkens_screen"}],"observations":{"brightness":"headless_dummy_renderer_probe_covers","params":{"light_a":0.875721330250618}},"skipped":[]}
```

<a id="result-19"></a>

### 19. test_p2004a_pets — d3b672fea

격리: `EXODUSER-P2004A-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=9, 초=13.906.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2004a_pets.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2004a_pets.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2004A_RESULT {"assertions":17,"failures":0,"fallback_paths_used":false,"forced_actor_fields":2,"groups":[{"assertions":11,"failures":0,"group":"pets_spawn_and_tut_start"},{"assertions":6,"failures":0,"group":"combat_counters_and_iris"}],"observations":{"boot":{"bubble":{"alpha":0.540404319763184,"pair":false,"t":252.0,"txt":"…아직 살아있네. 좌클릭으로 저것들 쳐봐.","who":"cat"},"configured":true,"counters":{"atk":0,"hit":0,"kill":0,"parry":0},"iris_target_alive":false,"pets":{"cat":[4034.96755226938,7453.96936639108],"crow":[3990.9305620189,7394.558149973],"iris":[4019.27394899109,7474.58428052658],"xbow":[4003.92571135305,7393.22420617533]},"say_log":[{"id":"tut_start","who":"crow"}],"tut":{"start":true},"unported":["펫 공격 없음(원본 41496~41541 — P2-001d '이리스 피해' 추정 오귀속 정정)","대사 [2]키안내·[4]보스·[5]~[29] 카테고리(튜토리얼 15종 중 11종+긴급 2종만)","펫 음성(_petSfx)·패드 키 치환(_padifyHint)·언어 전환(_refreshPetBubbleLanguage — ko 원문 고정)","R 수거 연계·G.pets G-소유 이관(어댑터 보유 — G 40키 부트 계약 보존)","crow _fly 애니(원본 미등록 dead)·cat t 난수=world 공유 샘플러(원본 Math.random)","tut_charge 후속(firstCharge — 사슬기동 미이식)·parry 카운터(패링 콜백 미배선)","이리스 LIT 색층(ci0 색 글로우 — P2-003a 색층 전체 미이식과 동일 경계)"]},"combat":{"counters":{"atk":1,"hit":1,"kill":1,"parry":0},"say_log":[{"id":"tut_start","who":"crow"}]}},"skipped":[]}
```

<a id="result-20"></a>

### 20. test_p2005a_start_skills — d3b672fea

격리: `EXODUSER-P2005A-Isolated-20261020`. exit=0, ERROR=0, stderr 전체 줄=7, 초=7.633.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2005a_start_skills.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2005a_start_skills.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2005A_RESULT {"assertions":27,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":14,"failures":0,"group":"starting_skills_grant"},{"assertions":13,"failures":0,"group":"hud_slot_icons_match_web"}],"observations":{"icons":{"qs0":"spikeTrap","qs1":"","qs2":"","qs3":"","qs5":"holyDome","qsE":"fireball","qsQ":"peaceShield","skSlot0":"chargeBoost","skSlot1":"giantSlam","skSlotCT":"iceOrb","skSlotLMB":"kiSlash","skSlotRMB":"shieldThrow","ultSlot":""},"skills":{"activeCt":"iceOrb","slots":["spikeTrap",null,null,null,"giantSlam","holyDome"]}},"skipped":[]}
```

<a id="result-21"></a>

### 21. test_p2005b_giant_slam — d3b672fea

격리: `EXODUSER-P2005B-Isolated-20261020`. exit=0, ERROR=1, stderr 전체 줄=11, 초=8.028.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2005b_giant_slam.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2005b_giant_slam.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2005B_RESULT {"assertions":12,"failures":0,"fallback_paths_used":false,"forced_actor_fields":1,"groups":[{"assertions":9,"failures":0,"group":"cast_costs_and_damage"},{"assertions":3,"failures":0,"group":"cooldown_gate_and_hud_sweep"}],"observations":{"cast":[{"cd":1800.0,"dmg":364,"hits":1,"lv":1,"radius":500.0}],"cooldown":{"skSlot1":{"pct":0.996666666666667,"text":"29.9s"}}},"skipped":[]}
```

<a id="result-22"></a>

### 22. test_p2005c_spike_holy — d3b672fea

격리: `EXODUSER-P2005C-Isolated-20261020`. exit=0, ERROR=1, stderr 전체 줄=11, 초=9.767.

원로그: `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2005c_spike_holy.out`, `/Users/fordeargamers/exoduser-wt/_out/mac-verify/latest-d3b672fea/test_p2005c_spike_holy.err`. 실행 메타데이터: 같은 basename의 `.json`.

```text
P2005C_RESULT {"assertions":20,"failures":0,"fallback_paths_used":false,"forced_actor_fields":2,"groups":[{"assertions":12,"failures":0,"group":"spike_trap_cast_zone_and_dot"},{"assertions":8,"failures":0,"group":"holy_dome_cast_regen_and_cd_boost"}],"observations":{"dome":{"presence":true,"zone":{"lv":1,"maxT":750.0,"r":520.0,"t":10.0,"type":"holyDome","x":3420.28466796875,"y":6698.6240234375}},"spike":{"cast_log":[{"cd":600.0,"dmg":563,"lv":1,"skill":"spikeTrap"},{"rejected":true,"skill":"spikeTrap"}],"hits":1,"zone":[{"_tickTimer":24.0,"dmg":563,"el":0,"lv":1,"maxT":600.0,"r":300.0,"t":49.0,"type":"spikeTrap","x":3420.0,"y":6700.0},{"lv":1,"maxT":750.0,"r":520.0,"t":10.0,"type":"holyDome","x":3420.28466796875,"y":6698.6240234375}]}},"skipped":[]}
```

## 후속 진단 — 2026-10-20

**후속 실행 진단 완료·검수 대기.** verbose 누수 2종에서 실제 MP3 자원 경로와 stream/playback 클래스·ObjectID를 확보했다. 근접 검사 수는 동일 실행 조건 안에서 달라졌고, 별도 완료한 공격력 관측 5회에서도 무기 atk·첫 피해·그룹별 검사 수가 달라졌다. 조명 실창 1회에서는 헤드리스의 토글 대체 경로 대신 픽셀 검사 3개가 수행되어 12/0·exit0·ERROR0이었다. 종료 오디오 잔존을 수정한 결과는 아니다.

대상은 같은 브랜치 `codex/mac-verify-20261020`, worktree `/Users/fordeargamers/exoduser-wt/mac-verify`, 후속 착수 HEAD `394c013886259c1a387b498b0087afd91c6060d0`다. 이는 제품 코드가 기존 `d3b672fea878ff99a9f110f4a6d8adf86b1e6898`에서 바뀌지 않은 문서 제출 HEAD다. main 병합·rebase·브랜치 전환 없이 그대로 실행했다. Godot 원본 경로와 버전은 위와 같고 4.7.2를 다시 확인했다. 기존 import 캐시를 사용했으며 이번 추가 import는 0회다.

로그는 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/`에만 추가했다. 기존 원로그·첫 보고서·이전 DONE을 덮어쓰지 않았다(`previous-report.md`, `previous-DONE.txt`). 각 실행의 정확한 argv·격리 이름·exit·시간·SHA-256은 같은 basename의 `.json`과 아래 manifest에 보존했다. override는 각 실행 전 해당 테스트 USERDIR 상수로 작성하고 매번 삭제했다. 실제 저장 폴더는 사용하지 않았고, R은 읽기로 보존 상태만 확인했다. 기존 게임 창과 다른 Codex의 자료는 수정·조작하지 않았다. 코드·테스트 및 PC 소유 `native_skill_slots.gd`는 읽기만 수행했다.

### 1. verbose: 종료 누수 실물 식별

기존 headless 명령에 `--verbose`만 추가했다. 격리 이름은 각각 `EXODUSER-P2005B-Isolated-20261020`, `EXODUSER-P2005C-Isolated-20261020`이다. 아래 ObjectID는 이 실행의 값이며 다음 실행에서 유지되는 고정 ID가 아니다.

| 테스트 | 검사/실패 | exit | stderr ERROR 줄 | 누수 객체 클래스 | 남은 자원 |
|---|---:|---:|---:|---|---|
| `test_p2005b_giant_slam` | 12/0 | 0 | 1 | AudioStreamMP3 1 + AudioStreamPlaybackMP3 1, 각각 ref1 | `res://assets/sfx/skill/heavy_hit.mp3` |
| `test_p2005c_spike_holy` | 20/0 | 0 | 1 | AudioStreamMP3 4 + AudioStreamPlaybackMP3 4, 각각 ref1 | `heavy_hit.mp3`, `spike_trap.mp3`, `melee_hit1.mp3`, `voice_holyDome2.mp3` (전부 `res://assets/sfx/skill/`) |

#### giant-slam-verbose 원문

stdout 종료 진단 발췌:

```text
Leaked instance: AudioStreamMP3:9223372193033883276 - Reference count: 1
Leaked instance: AudioStreamPlaybackMP3:9223372267675718656 - Reference count: 1
Hint: Leaked instances typically happen when nodes are removed from the scene tree (with `remove_child()`) but not freed (with `free()` or `queue_free()`).
Resource still in use: res://assets/sfx/skill/heavy_hit.mp3 (AudioStreamMP3)
Orphan StringName: Master (static: 0, total: 2)
StringName: 1 unclaimed string names at exit.
```

stderr 종료 진단 발췌:

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
   at: cleanup (core/object/object.cpp:2536)
ERROR: 1 resources still in use at exit.
   at: clear (core/io/resource.cpp:817)
```

#### spike-holy-verbose 원문

stdout 종료 진단 발췌:

```text
Leaked instance: AudioStreamMP3:9223372193268764300 - Reference count: 1
Leaked instance: AudioStreamMP3:9223372268095149049 - Reference count: 1
Leaked instance: AudioStreamPlaybackMP3:9223372268145480705 - Reference count: 1
Leaked instance: AudioStreamPlaybackMP3:9223372268934009858 - Reference count: 1
Leaked instance: AudioStreamMP3:9223372268883678213 - Reference count: 1
Leaked instance: AudioStreamPlaybackMP3:9223372269571544077 - Reference count: 1
Leaked instance: AudioStreamPlaybackMP3:9223372269605098510 - Reference count: 1
Leaked instance: AudioStreamMP3:9223372269521212431 - Reference count: 1
Hint: Leaked instances typically happen when nodes are removed from the scene tree (with `remove_child()`) but not freed (with `free()` or `queue_free()`).
Resource still in use: res://assets/sfx/skill/heavy_hit.mp3 (AudioStreamMP3)
Resource still in use: res://assets/sfx/skill/spike_trap.mp3 (AudioStreamMP3)
Resource still in use: res://assets/sfx/skill/melee_hit1.mp3 (AudioStreamMP3)
Resource still in use: res://assets/sfx/skill/voice_holyDome2.mp3 (AudioStreamMP3)
Orphan StringName: Master (static: 0, total: 8)
StringName: 1 unclaimed string names at exit.
```

stderr 종료 진단 발췌:

```text
WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).
   at: cleanup (core/object/object.cpp:2536)
ERROR: 4 resources still in use at exit.
   at: clear (core/io/resource.cpp:817)
```

#### 소유자 행 근거와 판정

아래 행은 이번 실행의 제품 코드 기준이며 파일은 수정하지 않았다.

| 실제 남은 경로 | 읽기로 확인한 소유·재생 경로 (`godot/scripts/native_skill_slots.gd`) |
|---|---|
| heavy_hit.mp3 | `:96,113–117`의 재사용 `_audio` 생성·load, `:294–297`에서 play |
| spike_trap.mp3 | `:335–338`에서 `_play_sample()` 호출 |
| melee_hit1.mp3 | `:477–478`의 확률적 DOT 피격음 `_play_sample()` 호출 |
| voice_holyDome2.mp3 | `:365–367`에서 두 음성 중 선택 후 `_play_sample()` 호출 |
| one_shot 공통 | `:498–507`: 자식 AudioStreamPlayer2D 생성·stream load·play, finished→queue_free |

**관측으로 확인된 것:** 종료 시 잔존한 자원은 위 스킬 MP3와 MP3 playback이다. 이전 보고서의 “스킬 오디오 수명 경계 추정” 중 자원 종류·파일 경로가 실제 로그로 확인되었다.

**원인 추정:** 테스트 B `:39–43,51–56`, C `:41–45,53–58`의 Main remove_child/free 직후 quit과 오디오 정리 수명 경계가 유력하다. 테스트는 실제 free를 호출하므로 verbose의 일반적인 Hint만으로 free 누락이라고 판단하지 않는다. 개별 Playback ObjectID와 파일의 1:1 대응, 엔진 오디오 종료 문제인지 사용자 teardown 문제인지는 로그만으로 확정할 수 없다. 누수 노드의 별도 사용자 이름·생성 stack도 이 출력에는 없다. 제품/하니스 수정·오디오 설정 변경·누수 해결 선언은 하지 않았다.

### 2. 근접 hurtE 반복: 분모와 장비 공격력 분포

격리는 모두 `EXODUSER-P1002E-Isolated-20261019`, 동일 소스·Godot·USERDIR·기본 그룹·headless·seed 비고정 조건이다. 격리 폴더를 reset/삭제하거나 특정 결과가 나올 때까지 반복하지 않았다. 총 실행 수를 숨기지 않고 아래 두 5회 집합으로 나눈다.

#### 최초 동일 조건 5회 — 검사 수 확인, 공격력은 미관측

처음 사용한 breakpoint 인수는 `res://tests/test_p1002e_melee_hurte.gd::45`였다. 5회 모두 debugger break가 0회여서 stdin의 읽기 명령은 실행되지 않았다. 테스트 RESULT는 정상 종료했지만 장비 공격력 칸은 **미관측**이며 추정값으로 채우지 않았다. 검사 수 비결정성은 이 5회만으로도 관측됐다.

| 회차·로그 basename | providers_ready | shield_absorb_hits | overflow_and_kill_pipeline | 총 검사/실패 | 무기 atk | exit / ERROR |
|---|---:|---:|---:|---:|---|---|
| `melee-repeat-01` | 15 | 27 | 18 | 60/0 | 미관측 | 0 / 0 |
| `melee-repeat-02` | 15 | 63 | 24 | 102/0 | 미관측 | 0 / 0 |
| `melee-repeat-03` | 15 | 36 | 18 | 69/0 | 미관측 | 0 / 0 |
| `melee-repeat-04` | 15 | 36 | 18 | 69/0 | 미관측 | 0 / 0 |
| `melee-repeat-05` | 15 | 36 | 20 | 71/0 | 미관측 | 0 / 0 |

총 검사 수 분포(검사 수:빈도): **60: 1회, 69: 2회, 71: 1회, 102: 1회**. 범위는 60–102다.

#### 공격력 관측을 보완한 동일 조건 5회

breakpoint 인수 구분자를 `res://tests/test_p1002e_melee_hurte.gd:45`로 정정한 뒤 별도 5회를 같은 명령·stdin으로 실행했다. 전투 중 중단점을 두지 않고 모든 그룹의 검사가 끝난 **cleanup 직전 45행**에서 정확히 1회 멈췄다. 코드/테스트를 수정하지 않고 아래 두 값만 읽은 뒤 debugger 중단점을 지우고 continue했다. 읽기 시점은 cleanup 직전이며 테스트 전반의 시간에 영향이 전혀 없었다고 주장하지 않는다.

```text
p active_main.source_state._inventory.equipped.weapon.atk
p melee_resolved[0]["damage"]
delete
continue
```

이 두 p 출력의 순서는 **실제 장착 무기의 atk**, **해당 실행 첫 melee_contact_resolved.damage**다. 전체 raw stdout과 `.stdin`, `.json`의 debugger_numeric_outputs에 그대로 남겼다. 읽기 표현식에 상태 대입이나 공격/장비 변경 호출은 없다. local debugger의 print/continue와 breakpoint 처리 방식은 [공식 local debugger 구현](https://github.com/godotengine/godot/blob/master/core/debugger/local_debugger.cpp#L140), [공식 breakpoint parser](https://github.com/godotengine/godot/blob/master/core/debugger/engine_debugger.cpp#L147)를 참고했고, 실제 4.7.2에서의 중단·값·재개는 아래 원로그로 확인했다.

| 회차·로그 basename | providers_ready | shield_absorb_hits | overflow_and_kill_pipeline | 총 검사/실패 | weapon.atk 관측 | 첫 melee damage 관측 | shield / kill 타수 | exit / ERROR |
|---|---:|---:|---:|---:|---:|---:|---|---|
| `melee-observed-01` | 15 | 54 | 24 | 93/0 | 5 | 154 | 6 / 6 | 0 / 0 |
| `melee-observed-02` | 15 | 54 | 22 | 91/0 | 9 | 170 | 6 / 5 | 0 / 0 |
| `melee-observed-03` | 15 | 45 | 22 | 82/0 | 12 | 183 | 5 / 5 | 0 / 0 |
| `melee-observed-04` | 15 | 63 | 24 | 102/0 | 2 | 141 | 7 / 6 | 0 / 0 |
| `melee-observed-05` | 15 | 54 | 22 | 91/0 | 9 | 170 | 6 / 5 | 0 / 0 |

| 관측 항목 | 5회 분포(값:빈도) |
|---|---|
| 총 검사 수 | 82: 1회, 91: 2회, 93: 1회, 102: 1회 |
| weapon.atk | 2: 1회, 5: 1회, 9: 2회, 12: 1회 |
| 첫 melee damage | 141: 1회, 154: 1회, 170: 2회, 183: 1회 |

**판정:** 검사 수는 동일 조건 집합 안에서 변하므로 고정 분모가 아니다. providers_ready는 15로 고정이고 shield/kill 반복 검사가 달라졌다. 장착 atk와 실제 첫 피해도 함께 변하는 것을 직접 관측했다. 시작 장비의 난수 경로와 실제 타수별 `_check()` 반복이라는 기존 코드 근거에 부합한다. 다만 5회 표본으로 모든 변동의 단일 원인·분포 확률이나 PC102의 정확한 장비값을 확정하지 않는다. 검사 수 차이만으로 플랫폼 결함이라고 판단하지 않는다.

최초5회와 관측 보완5회 모두 stderr ERROR는 0이나 일부 실행에 ObjectDB 누수 WARNING이 있었다. 아래에 10회 전부의 경고 유무를 보존한다. breakpoint가 실제로 발생하지 않은 최초 실행에서도 WARNING이 있으므로 debugger 중단/읽기 때문에 발생했다고 단정하지 않는다. 정확한 객체 이름은 이 비verbose E 원로그에 없으며 추가 verbose 반복·수정은 하지 않았다.

| 집합·회차 | ObjectDB WARNING 원문 |
|---|---|
| `melee-repeat-01` | 없음 |
| `melee-repeat-02` | `WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).` |
| `melee-repeat-03` | `WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).` |
| `melee-repeat-04` | 없음 |
| `melee-repeat-05` | `WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).` |
| `melee-observed-01` | `WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).` |
| `melee-observed-02` | 없음 |
| `melee-observed-03` | `WARNING: 4 ObjectDB instances were leaked at exit (run with `--verbose` for details).` |
| `melee-observed-04` | `WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).` |
| `melee-observed-05` | `WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).` |

### 3. 조명 실제 창 1회: 픽셀 검사 확인

기존 명령에서 `--headless`를 제거하고 다른 renderer/audio 강제 인수를 추가하지 않은 1회다. 격리는 테스트 USERDIR 상수 `EXODUSER-P2003A-Isolated-20261020`이다. 별도 테스트 프로세스가 창을 생성한 뒤 테스트의 quit으로 종료했으며 이미 열린 게임 창을 재시작/조작하지 않았다. 권한/창 생성 BLOCKED는 없었다.

stdout의 renderer 원문:

```text
OpenGL API 4.1 Metal - 90.5 - Compatibility - Using Device: Apple - Apple M5 Pro
```

| 항목 | 결과 |
|---|---|
| 전체 / 구조 / 픽셀 그룹 | 12/0 / 9/0 / 3/0 |
| exit / stderr ERROR | 0 / 0 |
| 원래 headless 경로와 차이 | observations.brightness가 `headless_dummy_renderer_probe_covers` 문자열이 아니라 실제 on/off 픽셀 수치 Dictionary |
| on_edge / off_edge | 30.2348581780355 / 39.1508571249579 |
| on_center / off_center | 40.2548873912572 / 44.983801925541 |
| 122행: on_edge < off_edge×0.8 | 30.2348581780355 < 31.320685699966322 → 통과 |
| 123행: on_center < off_center | 40.2548873912572 < 44.983801925541 → 통과 |
| 124–126행: on_edge/on_center < off_edge/off_center | 0.7510853994986479 < 0.8703323296186031 → 통과 |

group overlay_darkens_screen=3과 실제 brightness Dictionary로 `test_p2003a_lighting.gd:122–126`의 세 픽셀 검사가 수행된 것을 확인했다. 기존 headless ERROR를 없앤 코드 변경이 아니며, 이번 한 프레임 비교를 전체 조명/시각 품질 PASS나 실플레이 인수로 확대하지 않는다.

### 실행 수·보존·인수 경계

후속 실행은 실제 총 **13회**(verbose2 + 최초 근접5 + 공격력 관측 보완5 + 실창 조명1)다. 전부 exit0·assertion 실패0이며 stderr ERROR는 verbose 두 실행에 각1줄, 합계2줄이다. 원래 22종의 ERROR3 및 수치는 이전 기록 그대로 보존했다. B/C 종료 오디오 정리는 미해결이며 수정은 PC 소유 담당의 후속 판단 범위다.

`before.json`의 테스트4개·PC 소유 스킬 스크립트 SHA-256과 종료 시 파일을 대조한다. Git diff의 제품/테스트 변경은 0이어야 하며 R의 HEAD/branch·tracked INDEX/WORK 및 override 삭제는 `after.json`에 기록한다. 새 결과만 이 절에 append했고 기존 보고서 prefix byte는 그대로다. 원격은 같은 자기 브랜치에만 비강제 push하고 ref SHA를 읽어 대조한 뒤 DONE을 갱신한다.

후속 보고서 체크포인트 SHA: 제출 시 기록. 최종 제출 SHA는 `~/exoduser-wt/_out/mac-verify/DONE.txt` 및 `submission-followup.json`의 실제 원격 대조 결과를 따른다.

### 후속 RESULT·debugger 읽기 원문

13회 모두의 마지막 RESULT 줄은 원문 그대로 아래에 추가한다. 보완 5회의 숫자 앞 `debug>`는 실제 debugger stdout이며 삭제하지 않았다. 각 실행의 나머지 원문은 같은 slug의 `.out/.err/.stdin`에 보존했다.

#### giant-slam-verbose

격리 `EXODUSER-P2005B-Isolated-20261020`; exit 0; ERROR 1; 8.547초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/giant-slam-verbose.out`, `.err`, `.json`.

```text
P2005B_RESULT {"assertions":12,"failures":0,"fallback_paths_used":false,"forced_actor_fields":1,"groups":[{"assertions":9,"failures":0,"group":"cast_costs_and_damage"},{"assertions":3,"failures":0,"group":"cooldown_gate_and_hud_sweep"}],"observations":{"cast":[{"cd":1800.0,"dmg":294,"hits":1,"lv":1,"radius":500.0}],"cooldown":{"skSlot1":{"pct":0.996666666666667,"text":"29.9s"}}},"skipped":[]}
```

#### spike-holy-verbose

격리 `EXODUSER-P2005C-Isolated-20261020`; exit 0; ERROR 1; 9.047초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/spike-holy-verbose.out`, `.err`, `.json`.

```text
P2005C_RESULT {"assertions":20,"failures":0,"fallback_paths_used":false,"forced_actor_fields":2,"groups":[{"assertions":12,"failures":0,"group":"spike_trap_cast_zone_and_dot"},{"assertions":8,"failures":0,"group":"holy_dome_cast_regen_and_cd_boost"}],"observations":{"dome":{"presence":true,"zone":{"lv":1,"maxT":750.0,"r":520.0,"t":10.0,"type":"holyDome","x":3420.98461914062,"y":6699.58056640625}},"spike":{"cast_log":[{"cd":600.0,"dmg":280,"lv":1,"skill":"spikeTrap"},{"rejected":true,"skill":"spikeTrap"}],"hits":1,"zone":[{"_tickTimer":24.0,"dmg":280,"el":0,"lv":1,"maxT":600.0,"r":300.0,"t":49.0,"type":"spikeTrap","x":3420.0,"y":6700.0},{"lv":1,"maxT":750.0,"r":520.0,"t":10.0,"type":"holyDome","x":3420.98461914062,"y":6699.58056640625}]}},"skipped":[]}
```

#### melee-repeat-01

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 11.599초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-repeat-01.out`, `.err`, `.json`.

```text
P1002E_RESULT {"assertions":60,"failures":0,"fallback_paths_used":false,"forced_actor_fields":13,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":27,"failures":0,"group":"shield_absorb_hits"},{"assertions":18,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1005,"rifts":0},"kill_hits_total":3,"kill_rng_draws":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:weapon_type","drop:weapon_range","drop:weapon_bonus_range","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":3},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-repeat-02

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 19.751초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-repeat-02.out`, `.err`, `.json`.

```text
P1002E_RESULT {"assertions":102,"failures":0,"fallback_paths_used":false,"forced_actor_fields":27,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":63,"failures":0,"group":"shield_absorb_hits"},{"assertions":24,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1005,"rifts":0},"kill_hits_total":6,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":7},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-repeat-03

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 11.833초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-repeat-03.out`, `.err`, `.json`.

```text
P1002E_RESULT {"assertions":69,"failures":0,"fallback_paths_used":false,"forced_actor_fields":15,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":36,"failures":0,"group":"shield_absorb_hits"},{"assertions":18,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1005,"rifts":0},"kill_hits_total":3,"kill_rng_draws":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":4},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-repeat-04

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 11.698초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-repeat-04.out`, `.err`, `.json`.

```text
P1002E_RESULT {"assertions":69,"failures":0,"fallback_paths_used":false,"forced_actor_fields":15,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":36,"failures":0,"group":"shield_absorb_hits"},{"assertions":18,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1004,"rifts":0},"kill_hits_total":3,"kill_rng_draws":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:stat_bonus_st","drop:pants_bonus_hp","drop:armor_stat_count_r1","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":4},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-repeat-05

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 12.807초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-repeat-05.out`, `.err`, `.json`.

```text
P1002E_RESULT {"assertions":71,"failures":0,"fallback_paths_used":false,"forced_actor_fields":17,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":36,"failures":0,"group":"shield_absorb_hits"},{"assertions":20,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1004,"rifts":0},"kill_hits_total":4,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":4},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-observed-01

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 21.069초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-observed-01.out`, `.err`, `.json`.

```text
Debugger Break, Reason: 'Breakpoint'
*Frame 0 - res://tests/test_p1002e_melee_hurte.gd:45 in function '_run'
Enter "help" for assistance.
debug> 5
debug> 154
debug> debug> P1002E_RESULT {"assertions":93,"failures":0,"fallback_paths_used":false,"forced_actor_fields":27,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":54,"failures":0,"group":"shield_absorb_hits"},{"assertions":24,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1004,"rifts":0},"kill_hits_total":6,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":6},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-observed-02

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 22.459초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-observed-02.out`, `.err`, `.json`.

```text
Debugger Break, Reason: 'Breakpoint'
*Frame 0 - res://tests/test_p1002e_melee_hurte.gd:45 in function '_run'
Enter "help" for assistance.
debug> 9
debug> 170
debug> debug> P1002E_RESULT {"assertions":91,"failures":0,"fallback_paths_used":false,"forced_actor_fields":23,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":54,"failures":0,"group":"shield_absorb_hits"},{"assertions":22,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1005,"rifts":0},"kill_hits_total":5,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_edef","drop:ring_affix1","drop:ring_affix2","drop:acc_lck","drop:acc_grit","drop:acc_stat_pick","drop:acc_stat_value","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:crystal_id","drop:crystal_star","drop:crystal_quality","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":6},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-observed-03

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 15.214초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-observed-03.out`, `.err`, `.json`.

```text
Debugger Break, Reason: 'Breakpoint'
*Frame 0 - res://tests/test_p1002e_melee_hurte.gd:45 in function '_run'
Enter "help" for assistance.
debug> 12
debug> 183
debug> debug> P1002E_RESULT {"assertions":82,"failures":0,"fallback_paths_used":false,"forced_actor_fields":21,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":45,"failures":0,"group":"shield_absorb_hits"},{"assertions":22,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1004,"rifts":0},"kill_hits_total":5,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":5},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-observed-04

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 17.169초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-observed-04.out`, `.err`, `.json`.

```text
Debugger Break, Reason: 'Breakpoint'
*Frame 0 - res://tests/test_p1002e_melee_hurte.gd:45 in function '_run'
Enter "help" for assistance.
debug> 2
debug> 141
debug> debug> P1002E_RESULT {"assertions":102,"failures":0,"fallback_paths_used":false,"forced_actor_fields":27,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":63,"failures":0,"group":"shield_absorb_hits"},{"assertions":24,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1005,"rifts":0},"kill_hits_total":6,"kill_rng_draws":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":7},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### melee-observed-05

격리 `EXODUSER-P1002E-Isolated-20261019`; exit 0; ERROR 0; 19.408초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/melee-observed-05.out`, `.err`, `.json`.

```text
Debugger Break, Reason: 'Breakpoint'
*Frame 0 - res://tests/test_p1002e_melee_hurte.gd:45 in function '_run'
Enter "help" for assistance.
debug> 9
debug> 170
debug> debug> P1002E_RESULT {"assertions":91,"failures":0,"fallback_paths_used":false,"forced_actor_fields":23,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":54,"failures":0,"group":"shield_absorb_hits"},{"assertions":22,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1004,"rifts":0},"kill_hits_total":5,"kill_rng_draws":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_edef","drop:bracelet_type","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"shield_phase_hits":6},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### lighting-window

격리 `EXODUSER-P2003A-Isolated-20261020`; exit 0; ERROR 0; 10.22초. 원로그 `/Users/fordeargamers/exoduser-wt/_out/mac-verify/followup-20261020/lighting-window.out`, `.err`, `.json`.

```text
P2003A_RESULT {"assertions":12,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":9,"failures":0,"group":"overlay_structure_and_params"},{"assertions":3,"failures":0,"group":"overlay_darkens_screen"}],"observations":{"brightness":{"off_center":44.983801925541,"off_edge":39.1508571249579,"on_center":40.2548873912572,"on_edge":30.2348581780355},"params":{"light_a":0.83000751868256}},"skipped":[]}
```
