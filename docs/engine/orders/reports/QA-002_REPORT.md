# QA-002 — 테스트 결정성·종료 오디오 정리·조명 하니스 (2026-10-20)

**최신 main 통합 재검증:** 기준 main `9528ea35b429498fcf42fe3723008219ed0ed7e1`, 실행 merge `e6f414b69d390b2613b1e273ceb8156ba97860f2`. G48·지역23/60/53/32·시작 HUD0/32 확인. 최신 테스트29회 중27회 통과, 검기2회는220/1로 실패했다. 별도 진단에서 새 etype20 포이즈 소유자 연결의 `source_field_call_unavailable`/42490을 확인했다. 제품 수정 없이 원로그·수정안만 보고한다. 얼음보주5회22/0·조명10/0 및12/0·B/C 종료 정리는 통과했다. 상세는 §9.

최신 보고서 체크포인트 SHA: `013648ab3afc2eb6f311543ff2245a224a58e43b`. 실행 소스는 위 merge HEAD이며 이후 문서 영수증 커밋과 구분한다.

아래 §1–8·이전 보충·기존 부록은 c7 단계의 역사 기록이다. 최신 결과와 합산하지 않는다.

기준 소스 `c7b21c63b25f7a8e25b9e0ec29e4fc7f21e8d91d`에서 별도 worktree `/Users/fordeargamers/exoduser-wt/qa-002` / 브랜치 `codex/qa-002-20261020`로 수행했다. 수정은 테스트 10개와 이 보고서·작업판·동기화 일지에 한정한다. 제품 코드·제품 RNG 경로·원본 RNG 호출 순서는 변경하지 않았다.

고정 후 33회 중 exit 0·assertion 실패 0·skip 없음은 **33/33**, stderr ERROR 합계는 **0**다. 시드를 넣은 9종의 그룹별 검사 수·총수·실패 수 반복 일치는 **9/9**다. p2005b/c 종료 정리는 **이번 6회 모두 ERROR 0·ObjectDB 경고 0; 각 테스트 verbose 1회(총2회)에서 Leaked instance 0·Resource still in use 0**이다. ObjectDB 경고가 남은 고정 실행은 **7/33**이며 별도 표에 모두 공개했다.

이 결과는 시작 장비 입력과 이번 반복에서의 검사 수 재현성을 다룬다. 전체 게임·전체 난수·시간·UID·모든 관측값의 bit 단위 결정성이나 제품 오디오 결함의 전면 수리를 뜻하지 않는다. PC 최신 동일 시드 재실행은 이 작업에서 수행하지 않았다.

## 1. 실행·보존 범위

| 항목 | 확인 근거 |
| --- | --- |
| 작업ID / 브랜치 | `qa-002` / `codex/qa-002-20261020` |
| 기준 소스 | fetch 후 `origin/main=c7b21c63b25f7a8e25b9e0ec29e4fc7f21e8d91d`. 실행 메타데이터 HEAD도 동일. 그 뒤 다른 main 변경은 자동 인수하지 않음 |
| R 시작 상태 | `codex/mac-live-play-time-main-20261017` / `dd49171c5b88e211575a41f185395d6c0a14b184`; INDEX='', WORK=''. 종료 대조도 동일; `final-evidence.json`에 보존. 원격 SHA는 별도 최종 영수증 |
| Godot 원본 | `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot` / `4.7.2.stable.official.ed1daf0bf`. 앱 복사·다른 실행 파일 사용 없음 |
| import 전 백업 | `/Users/fordeargamers/exoduser-wt/_backup/godot-appsupport-20261020-qa-002`; `/Users/fordeargamers/Library/Application Support/Godot`의 68파일 SHA-256 일치. 전체 manifest는 `/Users/fordeargamers/exoduser-wt/_out/qa-002/preflight.json` |
| import | 1회, exit=0, ERROR=0; `/Users/fordeargamers/exoduser-wt/_out/qa-002/import/import.json` |
| 수정 전 테스트 보존 | 10파일 byte 백업 `/Users/fordeargamers/exoduser-wt/_out/qa-002/before-tests` / 해시 `/Users/fordeargamers/exoduser-wt/_out/qa-002/before-test-hashes.json` |
| 격리 저장 | 모든 Main 실행은 테스트 USERDIR 상수에 맞춘 `godot/override.cfg` 사용. 실행별 JSON에 이름·override_removed=true 기록. 실제 `EXODUSER-Godot-Native-First` 사용 금지 준수 |
| 로그·재실행 수 | 신규 fixed 33회(9종 31회+조명 headless/GUI 각 1회), baseline ice-orb 3회, import 1회. 원로그 `/Users/fordeargamers/exoduser-wt/_out/qa-002/` 보존 |
| 별도 기존 창 / 타 작업 | 기존 열린 게임 재시작·다른 worktree/app_userdata 변경 없음. 조명 전용 새 창 1회만 실행 |

## 2. 원본 근거·대상 조사

| 범위 | 현재 기준 소스의 행 근거 | 판정 |
| --- | --- | --- |
| 새 게임 시작 장비 | `game.html:63987–63993` defaultItems 15개+bag 10개; `:15922–15926` _atkMax·_atkFloor·Math.random()² 공격력 및 슬롯 RNG | 원본에 무작위 롤이 있으며 테스트에서만 입력 스트림을 고정 |
| 실제 Godot 경로 | `godot/scripts/main.gd:142–145` shared native RNG/clock 전달 → `world.gd:3428–3434` randi()/4294967296 → `port_modules/starter_item_factory_source/producer.gd:613–615,622–623,634` 난수 공격력/시계/무기 배율 | 제품의 함수·호출 순서·시계·RNG consumer 수정 0 |
| E 검사 수 변동 | `godot/tests/test_p1002e_melee_hurte.gd:232` / `godot/tests/test_p1002e_melee_hurte.gd:283`; 처치 RNG 조건부 단정 :325–345 | 피해·타수뿐 아니라 처치 조건부 경로도 총 검사 수에 반영됨 |
| 얼음보주 검사 수 변동 | `godot/tests/test_p2005d_ice_orb.gd:156,180–188` expected_piece=base×0.3 및 alive/≥100 분기 | 기존 조건부 단정은 삭제·완화하지 않음; 한 seed가 다른 모든 분기를 보장하지 않음 |
| 원본 스킬·오디오 | `game.html:46490–46527` 강타 / `45506–45520,37467` 가시덫 / `46706–46730` 돔 / `46756–46819` 얼음보주 | 제품 수치 변경 0, 테스트만 변경 |
| 조명 원본 | `game.html:55199,4693,4505,55352–55388,55389–55419`; 테스트 머리말 원본 행 유지 | 픽셀3 단정·임계값과 구조9 단정 유지 |

| 테스트 | 포함 사유 | 시드 위치 / 반복 수 |
| --- | --- | --- |
| test_p1002e_melee_hurte | 시작 무기 공격력→쉴드·처치 타수→반복 단정 수 | `godot/tests/test_p1002e_melee_hurte.gd:30` / 5회 |
| test_p1002f_dedicated_hurte | 적별 공개 공격·쉴드·처치 반복 | `godot/tests/test_p1002f_dedicated_hurte.gd:51` / 3회 |
| test_p1002g_kislash_hurte | 시작 장비를 읽는 검기 피해·적별 반복 | `godot/tests/test_p1002g_kislash_hurte.gd:52` / 3회 |
| test_p2001b_death_fx | 장비 공격력에 따른 실제 처치까지의 공격·FX 관측 | `godot/tests/test_p2001b_death_fx.gd:24` / 3회 |
| test_p2001c_kill_rewards | 실제 처치·드롭 경로와 장비 의존 입력 | `godot/tests/test_p2001c_kill_rewards.gd:26` / 3회 |
| test_p2001e_natural_lmb | 자연 새 게임 장비와 LMB 평타·검기 피해 | `godot/tests/test_p2001e_natural_lmb.gd:32` / 3회 |
| test_p2005b_giant_slam | 시작 장비 기반 피해식·스킬 오디오 | `godot/tests/test_p2005b_giant_slam.gd:24` / 3회 |
| test_p2005c_spike_holy | 시작 장비 기반 가시덫 피해·돔·오디오 | `godot/tests/test_p2005c_spike_holy.gd:26` / 3회 |
| test_p2005d_ice_orb | 시작 장비 기반 base×30%와 프리즌 조건부 단정 | `godot/tests/test_p2005d_ice_orb.gd:27` / 5회 |

9종 모두 `const QA002_TEST_SEED=20261020`, `_initialize()`의 `seed(QA002_TEST_SEED)` **프로세스당 1회**만 추가했다. Main 재부팅 때마다 다시 seed하지 않아 동일 프로세스 안의 공유 스트림 진행을 보존했다. `observations.qa002_test_seed`로 실제 하니스 입력을 결과에 남겼다. 기존 `_check`·assertion 식·임계값·group·skip 조건 삭제·완화·추가 skip은 0이다.

| 수정 제외 대상 | 읽기 조사 판정 |
| --- | --- |
| p2001a_hit_feedback | :182–217 루프 내부 단정 없음, owner 실제값 대조 |
| p2002a_hud / p2002b_minimap_corner | owner값 재계산·UI 구조/배치의 고정 분모 |
| p2004a_pets | 공격횟수가 변해도 카운터 발생 여부 단정은 고정, 별도 local RNG |
| p2001h_curtain_spawn | 별도 spawn RNG 계약 대상 |
| lesson·clock·intro·시작스킬·지역·authority·초기화·리젠 | owner 고정 구조 검사, 이번 장비 RNG 타깃 밖 |
| test_native_main_source_starter_state | 현재 STARTER-REGIONS 담당 codex/starter-regions-fix-20261020 소유. 이전 QA-001 소유와 구분, 이 작업 수정 제외 |

전체 테스트에 일괄 seed를 넣지 않았다. 이들 제외 테스트의 재검증·전체 분모 동등성도 이번 결과로 주장하지 않는다.

전역 seed 외 제품의 독립 RNG 인스턴스·시계·UID·실시간 프레임·오디오 해제시점은 고정하지 않았다. `native_skill_slots.gd`의 `_blade_rng`/`_visual_rng`는 별도 인스턴스이며 이번 테스트가 seed를 주입하지 않았다. 이 두 인스턴스에 명시 randomize가 있다고 단정하지 않는다. pets의 local/dialogue RNG에는 명시 randomize 경로가 있으므로 관측 JSON 전체가 같아야 한다는 기대를 두지 않았다.

## 3. MAC-VERIFY 출발 증거와 재사용 범위

이전 d3b672fea 실행 및 후속 진단 원로그는 `/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify`에 byte 그대로 복사했다. 복사본 전체의 원위치·SHA-256은 `/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-evidence-manifest.json`에 보존했다. 다음 7파일만 `mac-verify-source-reuse.json`으로 d3b672fea와 c7b21c63b의 byte 동일성을 확인했다.

| 파일 | 과거/현재 공통 SHA-256 |
| --- | --- |
| godot/scripts/native_skill_slots.gd | 2dcc412842dd7635e3c7e1f97be58a0dae58e1426948cbb2d043c8c87516844f |
| godot/scripts/native_normal_enemy_hurte.gd | e166bfada85913ae3dde8cf28fac6ea6cc06ad0926ebac21504cb6bbaddef46c |
| godot/scripts/main.gd | 795701c741e90bece36174a9d252869d1a64aec25f11cd5a55684fd4ceb3f81c |
| godot/tests/test_p1002e_melee_hurte.gd | e06fbd397d0c87be2576d64856aebfa3576b2903bcc4799759f2695d5f2cc145 |
| godot/tests/test_p2005b_giant_slam.gd | b0a737c049495cf89385a032b44735c4899681a7a5a9267af7654f62725677c7 |
| godot/tests/test_p2005c_spike_holy.gd | e78488576936caa20c08025815388bf555d950cbed2a14aa787df277d2628940 |
| godot/tests/test_p2003a_lighting.gd | 400c7b2610befe930761117ed7f681e9d5ca39295f78fbfb9044d572ca45f005 |

동일한 것은 제품3파일(main·normal_enemy_hurte·skill_slots)과 테스트4파일(E·B·C·조명)의 byte다. c7에는 펫 데이터 등 다른 제품 변경이 있으므로 전체 c7 baseline과 d3 baseline이 동일하다고 주장하지 않는다. 따라서 과거 결과는 진단 출발점이고, 고정 후 반복 증거는 이번 c7 실행만으로 판정한다.

### 시작 장비 비고정 관측

| 기존 관측 실행 | 총 검사/실패 | providers_ready | shield_absorb_hits | overflow_and_kill_pipeline | 무기 atk | 첫 근접 피해 |
| --- | --- | --- | --- | --- | --- | --- |
| melee-observed-01 | 93/0 | 15 | 54 | 24 | 5.0 | 154.0 |
| melee-observed-02 | 91/0 | 15 | 54 | 22 | 9.0 | 170.0 |
| melee-observed-03 | 82/0 | 15 | 45 | 22 | 12.0 | 183.0 |
| melee-observed-04 | 102/0 | 15 | 63 | 24 | 2.0 | 141.0 |
| melee-observed-05 | 91/0 | 15 | 54 | 22 | 9.0 | 170.0 |

위 debugger 관측은 모든 테스트 그룹이 끝난 뒤 저장된 값을 읽은 별도 보완 실행이다. 앞선 순수 5회(`melee-repeat-01..05`)와 각 행을 같은 실행처럼 합치지 않는다. 순수 반복·보완 관측의 실행별 수치는 아래 전체 표에 각각 남겼다.

### 이번 c7 무수정 ice-orb baseline 3회

| 실행 | 그룹별 검사/실패 | 총수/실패 | base_dmg / blade_dmg | ERROR |
| --- | --- | --- | --- | --- |
| ice-orb-01 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 22/0 | 341 / 102 | 0 |
| ice-orb-02 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 22/0 | 833 / 249 | 0 |
| ice-orb-03 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 22/0 | 663 / 198 | 0 |

## 4. 고정 후 검사 수·그룹 분포

| 대상 | 횟수 | 총 검사 분포 | 실패 분포 | 그룹별 검사/실패 분포 | exit / ERROR / ObjectDB 경고 실행 수 | 반복 동일성 |
| --- | --- | --- | --- | --- | --- | --- |
| melee | 5 | 93×5 | 0×5 | providers_ready: 15×5 / 실패 0×5<br>shield_absorb_hits: 54×5 / 실패 0×5<br>overflow_and_kill_pipeline: 24×5 / 실패 0×5 | 0×5 / 0 / 4 | 일치 |
| dedicated | 3 | 357×3 | 0×3 | setup: 31×3 / 실패 0×3<br>combat: 305×3 / 실패 0×3<br>per_enemy_coverage: 21×3 / 실패 0×3 | 0×3 / 0 / 1 | 일치 |
| kislash | 3 | 214×3 | 0×3 | setup: 20×3 / 실패 0×3<br>combat: 161×3 / 실패 0×3<br>per_enemy_coverage: 33×3 / 실패 0×3 | 0×3 / 0 / 2 | 일치 |
| death-fx | 3 | 43×3 | 0×3 | assets_and_adapter: 5×3 / 실패 0×3<br>weapon_hit_and_kill_fx: 29×3 / 실패 0×3<br>lifetimes_and_kislash_noimpact: 9×3 / 실패 0×3 | 0×3 / 0 / 0 | 일치 |
| kill-rewards | 3 | 45×3 | 0×3 | drop_module_pure: 16×3 / 실패 0×3<br>reward_owner_units: 8×3 / 실패 0×3<br>live_kill_rewards: 21×3 / 실패 0×3 | 0×3 / 0 / 0 | 일치 |
| natural-lmb | 3 | 18×3 | 0×3 | new_run_init_refill_and_mats: 10×3 / 실패 0×3<br>natural_lmb_dual_hit_values: 8×3 / 실패 0×3 | 0×3 / 0 / 0 | 일치 |
| giant-slam | 3 | 12×3 | 0×3 | cast_costs_and_damage: 9×3 / 실패 0×3<br>cooldown_gate_and_hud_sweep: 3×3 / 실패 0×3 | 0×3 / 0 / 0 | 일치 |
| spike-holy | 3 | 20×3 | 0×3 | spike_trap_cast_zone_and_dot: 12×3 / 실패 0×3<br>holy_dome_cast_regen_and_cd_boost: 8×3 / 실패 0×3 | 0×3 / 0 / 0 | 일치 |
| ice-orb | 5 | 22×5 | 0×5 | cast_state_invuln_and_block: 6×5 / 실패 0×5<br>auto_shatter_blades_and_freeze: 11×5 / 실패 0×5<br>freeze_trigger_direct: 5×5 / 실패 0×5 | 0×5 / 0 / 0 | 일치 |

반복 동일성은 RESULT의 그룹명·그룹별 assertions/failures·총 assertions/failures만 비교했다. 장비·crit·리바이브·드롭·프레임 타이밍 등 전체 observations의 동일성을 주장하지 않는다. 실패 수 0과 stderr ERROR 0, ObjectDB 경고 0은 각각 다른 지표다.

현재 p2001c는 drop 품질별로 단정하는 루프가 아니다. pure16+owner8=24 고정 fixture, 실제 live hurtE outcome당1검사(:237), 처치7검사(:255/257/262/263/270/275/279), 종료2검사이므로 정상 총수=33+검증 hit outcome 수 H다(시드 추가 후 행). kill/drop_rng 꼬리가 달라도 H가 같으면 분모가 같다. 과거 문서 39~263은 실행 시점의 수치 범위이며 현재 drop 품질이 직접 검사 수를 늘렸다는 인과로 쓰지 않는다.

### p2005d PC 보충 — 조건부 단정 2개 실행 확인

`test_p2005d_ice_orb`는 위 시드 9종에 이미 포함돼 있다. 테스트 `:10,27–28`에서 seed `20261020`을 프로세스당 1회 고정했고 제품 RNG 경로·호출 순서 코드는 수정하지 않았다. 시드·관측값 추가 4줄을 제외한 원본 테스트는 byte 그대로다(`static-proof.json`).

PC 총괄이 제공한 반례 `base_dmg=327 → expected_piece=98`은 `expected_piece>=100`을 만족하지 않아 조건부 단정 2개를 건너뛴다. 이는 PC 제공 반례이며 이번 Mac에서 327을 재현했다고 주장하지 않는다. 기존 조건은 수정 전 `:176`, 현재 시드 4줄 추가 후 `:180`이다. 해당 조건과 내부 단정은 그대로 유지했다.

아래 기존 고정 실행 5회는 모두 `base_dmg=408 → expected_piece=122>=100`이다. `auto_shatter_blades_and_freeze`의 정상 경로는 바깥 단정 9개와 조건 내부 단정 2개(쉴드 상태 if/else 중 1개 + 얼음파편 저항 단정 1개, 현재 `:182–189`)로 구성된다. 매회 해당 그룹이 **11/0**이므로 유효·생존 target 조건까지 통과해 두 단정이 실제 실행됐음을 확인한다. 검사 수를 상수로 덮거나 단정을 삭제·완화·추가 skip하지 않았다.

| 보존 원로그 basename | seed | base_dmg | expected_piece | >=100 | 그룹별 검사/실패 | 총 검사/실패 | exit | ERROR |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `fixed/ice-orb-01` | 20261020 | 408 | 122 | true | 6/0 · 11/0 · 5/0 | 22/0 | 0 | 0 |
| `fixed/ice-orb-02` | 20261020 | 408 | 122 | true | 6/0 · 11/0 · 5/0 | 22/0 | 0 | 0 |
| `fixed/ice-orb-03` | 20261020 | 408 | 122 | true | 6/0 · 11/0 · 5/0 | 22/0 | 0 | 0 |
| `fixed/ice-orb-04` | 20261020 | 408 | 122 | true | 6/0 · 11/0 · 5/0 | 22/0 | 0 | 0 |
| `fixed/ice-orb-05` | 20261020 | 408 | 122 | true | 6/0 · 11/0 · 5/0 | 22/0 | 0 | 0 |

PC 문서의 **22/0과 검사 수가 5/5 일치**한다. 같은 시드를 적용한 최신 PC 실행은 별도 수행하지 않았다. 기존 `.out/.err/.json` 15파일의 해시·실행 당시/현재 테스트 해시·행 근거를 `ice-orb-supplement-20261020.json`에 대조 보존했다. 본 보충은 기존 반복 증거를 구체화한 문서 변경이며 추가 테스트 실행 0·추가 코드 변경 0이다. 신규 fixed 실행 수는 위의 33회로 유지된다.

## 5. p2005b/c 종료 리소스·ObjectDB 진단

이전 --verbose 원문에 강타 AudioStreamMP3/AudioStreamPlaybackMP3 각1(총2), 가시/홀리에 각4(총8)가 남았다. NativeSkillSlots의 실제 소유 코드와 대조하면 아래 경로가 일치한다.

| 잔존 경로 / 객체 | 소유 코드 근거 | 판정 |
| --- | --- | --- |
| heavy_hit.mp3 / AudioStreamMP3·AudioStreamPlaybackMP3 | `native_skill_slots.gd:113–117` SlamAudio 자식에 stream 보유; `:294–297` play | 제품 오디오가 자식으로 실제 소유됨 |
| spike_trap.mp3 | `native_skill_slots.gd:335–338` → `:498–507` one_shot load/play | 제품 one-shot, finished→queue_free 연결 존재 |
| melee_hit1.mp3 | `native_skill_slots.gd:477–478` DOT 확률 재생 → `_play_sample` | 제품 one-shot, 재생 시점에 따라 잔존 가능 |
| voice_holyDome2.mp3(이전 실행 선택) | `native_skill_slots.gd:365–367` 음성 선택 → `_play_sample` | 제품 one-shot, 선택은 공유 RNG 소비 |
| 테스트 종료 | 원 B/C `_cleanup()`는 remove_child 후 free를 실제 호출; 기존에는 그 직후 RESULT/quit | engine Hint의 일반적인 free 누락 설명을 이번 원인으로 확정하지 않음 |

추가 소유 확인: `godot/scripts`·`port_modules`·`scenes`에서 대상 MP3 4경로의 소비 소스는 `native_skill_slots.gd`만이다. `main.gd:244–247`이 World/NativeSkillSlots 1개를 생성한다. `main.gd:1898–1929`의 기본 공격·사망 오디오는 `assets/sfx/attack_source/*`·`death/*`로 대상 경로와 다르고, `:1973–1981`의 bytes→AudioStreamMP3.new 경로는 별도 path 없는 재생이다. `HUD:430–436` load는 TextureRect용이다. 따라서 경로·유일한 소비 소스·실제 cast로 오디오 소유 경로를 확인했다. 개별 ObjectID를 특정 NodeID에 직접 연결하는 계측은 하지 않았다.

엔진 소스 `ed1daf0bf`와 맞춘 동작순서는 PREDELETE에서 stop 요청 → AudioServer가 FADE_OUT_TO_DELETION 표시 → PREDELETE의 로컬 playback 참조 정리 → 이후 mix에서 제거·main-thread destructor/cleanup 처리다. [audio_stream_player_internal.cpp PREDELETE](https://github.com/godotengine/godot/blob/ed1daf0bf/scene/audio/audio_stream_player_internal.cpp#L104), [audio_server.cpp stop](https://github.com/godotengine/godot/blob/ed1daf0bf/servers/audio/audio_server.cpp#L1196), [mix 제거](https://github.com/godotengine/godot/blob/ed1daf0bf/servers/audio/audio_server.cpp#L489), [main-thread delete](https://github.com/godotengine/godot/blob/ed1daf0bf/servers/audio/audio_server.cpp#L673), [update / cleanup](https://github.com/godotengine/godot/blob/ed1daf0bf/servers/audio/audio_server.cpp#L1505)를 근거로 한다.

수정은 B/C 테스트의 마지막 `_cleanup()` 뒤 `for _frame in range(12): await process_frame`만 추가했다(시드 추가와 별개). 제품 오디오 stop·stream null·signal·free 경로는 조작하지 않았다. 12 process_frame은 AudioServer mix와 main-thread 정리 기회를 주기 위한 하니스 종결 대기다. max_fps=240 기준 약50ms 예상치는 실측 최소 지연 보장이 아니며, 모든 장치·부하에서 12프레임이면 충분하다고 일반화하지 않는다.

| 실행 | 검사/실패 | ERROR | ObjectDB WARNING | verbose Leaked instance | Resource still in use |
| --- | --- | --- | --- | --- | --- |
| reused-mac-verify/giant-slam-verbose.json | 12/0 | 1 | 1 | 2 | 1 |
| reused-mac-verify/spike-holy-verbose.json | 20/0 | 1 | 1 | 8 | 4 |
| fixed/giant-slam-01.json | 12/0 | 0 | 0 | 0 | 0 |
| fixed/giant-slam-02.json | 12/0 | 0 | 0 | 미수집(비verbose) | 미수집(비verbose) |
| fixed/giant-slam-03.json | 12/0 | 0 | 0 | 미수집(비verbose) | 미수집(비verbose) |
| fixed/spike-holy-01.json | 20/0 | 0 | 0 | 0 | 0 |
| fixed/spike-holy-02.json | 20/0 | 0 | 0 | 미수집(비verbose) | 미수집(비verbose) |
| fixed/spike-holy-03.json | 20/0 | 0 | 0 | 미수집(비verbose) | 미수집(비verbose) |

B/C fixed01만 --verbose이고 fixed02/03은 비verbose다. ERROR·ObjectDB WARNING은 6회 모두 수집했으나, 개별 Leaked instance·Resource still in use 원문은 각 테스트의 verbose 1회씩(총2회)만 수집했다. 비verbose에서 이 원문이 없다는 사실을 개별 잔존 리소스 0의 직접 계측으로 계산하지 않았다.

이번 B/C 6회의 ERROR·ObjectDB 경고가 0이고 verbose 2회에서 개별 잔존 객체·리소스도 0으로 확인되어, cleanup 후 12 process_frame 대기로 관측된 하니스 즉시 종료 문제를 개선한 것으로 분류한다. 이것만으로 제품의 장시간 오디오 수명 결함이 없다고 확정하지 않는다. 이번 범위에서 제품 수정안은 추가하지 않았고 PC 소유 `native_skill_slots.gd`는 읽기만 했다. 남은 E 등의 ObjectDB 경고는 별도 현상으로 보존했으며 이 결과로 해결 선언하지 않는다.

### 이전 B/C --verbose 종료 원문

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/giant-slam-verbose.out` / `/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/giant-slam-verbose.err`

```text
Leaked instance: AudioStreamMP3:9223372193033883276 - Reference count: 1
Leaked instance: AudioStreamPlaybackMP3:9223372267675718656 - Reference count: 1
Hint: Leaked instances typically happen when nodes are removed from the scene tree (with `remove_child()`) but not freed (with `free()` or `queue_free()`).
Resource still in use: res://assets/sfx/skill/heavy_hit.mp3 (AudioStreamMP3)
Orphan StringName: Master (static: 0, total: 2)
StringName: 1 unclaimed string names at exit.
     at: _update_process_callback (scene/2d/camera_2d.cpp:88)
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
   at: cleanup (core/object/object.cpp:2536)
ERROR: 1 resources still in use at exit.
   at: clear (core/io/resource.cpp:817)
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/spike-holy-verbose.out` / `/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/spike-holy-verbose.err`

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
     at: _update_process_callback (scene/2d/camera_2d.cpp:88)
WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).
   at: cleanup (core/object/object.cpp:2536)
ERROR: 4 resources still in use at exit.
   at: clear (core/io/resource.cpp:817)
```

## 6. p2003a 조명 하니스 호출 순서

이전 `_corner_brightness()`는 `root.get_texture().get_image()`를 먼저 호출하고 반환 image의 null/empty를 검사했다. headless dummy renderer가 텍스처를 제공하지 않으므로 이 null 검사 전에 `ERROR: Parameter "t" is null`이 발생했다. GUI의 image 부재까지 기존 headless 성공 토글로 흘러갈 수 있어 이 경계도 명시했다.

| 변경 지점 | 최종 동작 |
| --- | --- |
| `test_p2003a_lighting.gd:106–113` | DisplayServer headless를 먼저 판별. 기존 가시성 토글1+구조9 검사와 observations 문자열 유지; 화면 readback 호출 없음 |
| `:114–125` | GUI 조명 ON/OFF 이미지가 null이면 각각 `_check(false, ...)` 후 return. 픽셀 검사 없이 GUI 성공 fallback 금지 |
| `:138–145` | headless 확인 → ViewportTexture null 확인 → get_image → image null/empty 확인 |
| `:128,129,132` | 기존 픽셀3 검사 원문·기준 동일: edge ON<OFF×0.8, center ON<OFF, edge/center 비율 감소 |

| 실행 | 구조 그룹 | 밝기 그룹 | 총 검사/실패 | exit | ERROR | 픽셀3 수행 |
| --- | --- | --- | --- | --- | --- | --- |
| reused-mac-verify/test_p2003a_lighting.json | 9/0 | 1/0 | 10/0 | 0 | 1 | 아니오(기존 headless 구조검사) |
| reused-mac-verify/lighting-window.json | 9/0 | 3/0 | 12/0 | 0 | 0 | 예 |
| fixed/lighting-headless.json | 9/0 | 1/0 | 10/0 | 0 | 0 | 아니오(기존 headless 구조검사) |
| fixed/lighting-window.json | 9/0 | 3/0 | 12/0 | 0 | 0 | 예 |

수정 전 headless stderr 원문:

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

## 7. 실행별 수치·원로그 경로

다음 표의 로그 열은 `/Users/fordeargamers/exoduser-wt/_out/qa-002/` 아래 basename이다. 각 행은 그 basename에 `.out`(stdout), `.err`(stderr), `.json`(명령·시간·격리·source/test hash·LAST RESULT)을 붙인 세 원파일을 보존한다. 기존 MAC-VERIFY JSON 안의 stdout/stderr는 원래 위치도 그대로 남아 있으며 이 작업에서는 복사본만 읽는다.

| 로그 basename (.out/.err/.json) | 총 검사/실패 | 그룹별 검사/실패 | exit | ERROR | ObjectDB 경고 수 | 초 |
| --- | --- | --- | --- | --- | --- | --- |
| import/import | —/— | import | 0 | 0 | 0 | 16.799 |
| baseline/ice-orb-01 | 22/0 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 0 | 0 | 0 | 13.226 |
| baseline/ice-orb-02 | 22/0 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 0 | 0 | 0 | 12.976 |
| baseline/ice-orb-03 | 22/0 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 0 | 0 | 0 | 13.022 |
| fixed/death-fx-01 | 43/0 | assets_and_adapter=5/0; weapon_hit_and_kill_fx=29/0; lifetimes_and_kislash_noimpact=9/0 | 0 | 0 | 0 | 31.088 |
| fixed/death-fx-02 | 43/0 | assets_and_adapter=5/0; weapon_hit_and_kill_fx=29/0; lifetimes_and_kislash_noimpact=9/0 | 0 | 0 | 0 | 30.032 |
| fixed/death-fx-03 | 43/0 | assets_and_adapter=5/0; weapon_hit_and_kill_fx=29/0; lifetimes_and_kislash_noimpact=9/0 | 0 | 0 | 0 | 31.333 |
| fixed/dedicated-01 | 357/0 | setup=31/0; combat=305/0; per_enemy_coverage=21/0 | 0 | 0 | 0 | 53.249 |
| fixed/dedicated-02 | 357/0 | setup=31/0; combat=305/0; per_enemy_coverage=21/0 | 0 | 0 | 1 | 53.306 |
| fixed/dedicated-03 | 357/0 | setup=31/0; combat=305/0; per_enemy_coverage=21/0 | 0 | 0 | 0 | 64.854 |
| fixed/giant-slam-01 | 12/0 | cast_costs_and_damage=9/0; cooldown_gate_and_hud_sweep=3/0 | 0 | 0 | 0 | 8.296 |
| fixed/giant-slam-02 | 12/0 | cast_costs_and_damage=9/0; cooldown_gate_and_hud_sweep=3/0 | 0 | 0 | 0 | 14.161 |
| fixed/giant-slam-03 | 12/0 | cast_costs_and_damage=9/0; cooldown_gate_and_hud_sweep=3/0 | 0 | 0 | 0 | 23.821 |
| fixed/ice-orb-01 | 22/0 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 0 | 0 | 0 | 13.589 |
| fixed/ice-orb-02 | 22/0 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 0 | 0 | 0 | 17.293 |
| fixed/ice-orb-03 | 22/0 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 0 | 0 | 0 | 19.366 |
| fixed/ice-orb-04 | 22/0 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 0 | 0 | 0 | 20.459 |
| fixed/ice-orb-05 | 22/0 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 0 | 0 | 0 | 18.555 |
| fixed/kill-rewards-01 | 45/0 | drop_module_pure=16/0; reward_owner_units=8/0; live_kill_rewards=21/0 | 0 | 0 | 0 | 29.496 |
| fixed/kill-rewards-02 | 45/0 | drop_module_pure=16/0; reward_owner_units=8/0; live_kill_rewards=21/0 | 0 | 0 | 0 | 31.588 |
| fixed/kill-rewards-03 | 45/0 | drop_module_pure=16/0; reward_owner_units=8/0; live_kill_rewards=21/0 | 0 | 0 | 0 | 62.673 |
| fixed/kislash-01 | 214/0 | setup=20/0; combat=161/0; per_enemy_coverage=33/0 | 0 | 0 | 1 | 18.338 |
| fixed/kislash-02 | 214/0 | setup=20/0; combat=161/0; per_enemy_coverage=33/0 | 0 | 0 | 1 | 18.095 |
| fixed/kislash-03 | 214/0 | setup=20/0; combat=161/0; per_enemy_coverage=33/0 | 0 | 0 | 0 | 18.558 |
| fixed/lighting-headless | 10/0 | overlay_structure_and_params=9/0; overlay_darkens_screen=1/0 | 0 | 0 | 0 | 7.941 |
| fixed/lighting-window | 12/0 | overlay_structure_and_params=9/0; overlay_darkens_screen=3/0 | 0 | 0 | 0 | 9.577 |
| fixed/melee-01 | 93/0 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=24/0 | 0 | 0 | 1 | 18.503 |
| fixed/melee-02 | 93/0 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=24/0 | 0 | 0 | 1 | 18.523 |
| fixed/melee-03 | 93/0 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=24/0 | 0 | 0 | 1 | 18.425 |
| fixed/melee-04 | 93/0 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=24/0 | 0 | 0 | 1 | 18.474 |
| fixed/melee-05 | 93/0 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=24/0 | 0 | 0 | 0 | 18.511 |
| fixed/natural-lmb-01 | 18/0 | new_run_init_refill_and_mats=10/0; natural_lmb_dual_hit_values=8/0 | 0 | 0 | 0 | 20.993 |
| fixed/natural-lmb-02 | 18/0 | new_run_init_refill_and_mats=10/0; natural_lmb_dual_hit_values=8/0 | 0 | 0 | 0 | 18.279 |
| fixed/natural-lmb-03 | 18/0 | new_run_init_refill_and_mats=10/0; natural_lmb_dual_hit_values=8/0 | 0 | 0 | 0 | 15.413 |
| fixed/spike-holy-01 | 20/0 | spike_trap_cast_zone_and_dot=12/0; holy_dome_cast_regen_and_cd_boost=8/0 | 0 | 0 | 0 | 8.557 |
| fixed/spike-holy-02 | 20/0 | spike_trap_cast_zone_and_dot=12/0; holy_dome_cast_regen_and_cd_boost=8/0 | 0 | 0 | 0 | 17.711 |
| fixed/spike-holy-03 | 20/0 | spike_trap_cast_zone_and_dot=12/0; holy_dome_cast_regen_and_cd_boost=8/0 | 0 | 0 | 0 | 12.469 |
| reused-mac-verify/giant-slam-verbose | 12/0 | cast_costs_and_damage=9/0; cooldown_gate_and_hud_sweep=3/0 | 0 | 1 | 1 | 8.547 |
| reused-mac-verify/lighting-window | 12/0 | overlay_structure_and_params=9/0; overlay_darkens_screen=3/0 | 0 | 0 | 0 | 10.22 |
| reused-mac-verify/melee-observed-01 | 93/0 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=24/0 | 0 | 0 | 1 | 21.069 |
| reused-mac-verify/melee-observed-02 | 91/0 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=22/0 | 0 | 0 | 0 | 22.459 |
| reused-mac-verify/melee-observed-03 | 82/0 | providers_ready=15/0; shield_absorb_hits=45/0; overflow_and_kill_pipeline=22/0 | 0 | 0 | 1 | 15.214 |
| reused-mac-verify/melee-observed-04 | 102/0 | providers_ready=15/0; shield_absorb_hits=63/0; overflow_and_kill_pipeline=24/0 | 0 | 0 | 1 | 17.169 |
| reused-mac-verify/melee-observed-05 | 91/0 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=22/0 | 0 | 0 | 1 | 19.408 |
| reused-mac-verify/melee-repeat-01 | 60/0 | providers_ready=15/0; shield_absorb_hits=27/0; overflow_and_kill_pipeline=18/0 | 0 | 0 | 0 | 11.599 |
| reused-mac-verify/melee-repeat-02 | 102/0 | providers_ready=15/0; shield_absorb_hits=63/0; overflow_and_kill_pipeline=24/0 | 0 | 0 | 1 | 19.751 |
| reused-mac-verify/melee-repeat-03 | 69/0 | providers_ready=15/0; shield_absorb_hits=36/0; overflow_and_kill_pipeline=18/0 | 0 | 0 | 1 | 11.833 |
| reused-mac-verify/melee-repeat-04 | 69/0 | providers_ready=15/0; shield_absorb_hits=36/0; overflow_and_kill_pipeline=18/0 | 0 | 0 | 0 | 11.698 |
| reused-mac-verify/melee-repeat-05 | 71/0 | providers_ready=15/0; shield_absorb_hits=36/0; overflow_and_kill_pipeline=20/0 | 0 | 0 | 1 | 12.807 |
| reused-mac-verify/spike-holy-verbose | 20/0 | spike_trap_cast_zone_and_dot=12/0; holy_dome_cast_regen_and_cd_boost=8/0 | 0 | 1 | 1 | 9.047 |
| reused-mac-verify/test_p2003a_lighting | 10/0 | overlay_structure_and_params=9/0; overlay_darkens_screen=1/0 | 0 | 1 | 0 | 8.0 |

### ObjectDB WARNING 전부

stderr ERROR 수와 별도로 ObjectDB 경고를 아래에 실행별 원문으로 공개한다. Camera2D 물리 보간 경고 등 일반 WARNING도 원로그에 보존했다. ObjectDB 경고 0을 전체 경고 0으로 바꿔 읽지 않는다.

`/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/dedicated-02.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/kislash-01.err`

```text
WARNING: 4 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/kislash-02.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/melee-01.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/melee-02.err`

```text
WARNING: 4 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/melee-03.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/melee-04.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/giant-slam-verbose.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/melee-observed-01.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/melee-observed-03.err`

```text
WARNING: 4 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/melee-observed-04.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/melee-observed-05.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/melee-repeat-02.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/melee-repeat-03.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/melee-repeat-05.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/reused-mac-verify/spike-holy-verbose.err`

```text
WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

## 8. 변경 파일·docs 동기화·인수 한계

| 파일 | 변경 내용 | 수정 전 SHA-256 → 수정 후 SHA-256 |
| --- | --- | --- |
| godot/tests/test_p1002e_melee_hurte.gd | 테스트 seed20261020 1회+observations | e06fbd397d0c87be2576d64856aebfa3576b2903bcc4799759f2695d5f2cc145 → b5e0207c3fcab901e4241789fc17d02ae896a177526388a424c097ab47aff799 |
| godot/tests/test_p1002f_dedicated_hurte.gd | 테스트 seed20261020 1회+observations | e6b6d81a3a60246f717a6fe8f6950b6af335f08db24780ca4c52ade81d0bec7d → 2b0de71eee2647487d08d96875f22c19338c3493bc100613b1225e80230d5bda |
| godot/tests/test_p1002g_kislash_hurte.gd | 테스트 seed20261020 1회+observations | cec9d252d35dcc62ae0ab6af7620fc075ed66c20bd4f1c0366bd3bd38f2eaaec → 8ef10d408b028acc9bb44747169eff4e6f35822acb25ec43f052875a4e1fa1da |
| godot/tests/test_p2001b_death_fx.gd | 테스트 seed20261020 1회+observations | 4111be0d95e6bbc74506afe908f5a4dfdc9babf5b9224367a229c09cdf3e4e47 → 5511065cfe8f37b7b3e7dae711eea39b6914f0bf4977db6b9071a3d452c46ca5 |
| godot/tests/test_p2001c_kill_rewards.gd | 테스트 seed20261020 1회+observations | dbae1b77eb6d3142e0a59160567c4458849b8535537d72c2b2f2cea52107b2f7 → e92c588f7d67e915e5da0c04c0c00759b732b7891299662d775238b9c86a8a6f |
| godot/tests/test_p2005b_giant_slam.gd | 테스트 seed20261020 1회+observations; cleanup 뒤 process_frame 12회 | b0a737c049495cf89385a032b44735c4899681a7a5a9267af7654f62725677c7 → a385a6e35e64440ac944fe4cfd129bc7a1bca9aafccffd7ffba99e94ee1d2cca |
| godot/tests/test_p2005c_spike_holy.gd | 테스트 seed20261020 1회+observations; cleanup 뒤 process_frame 12회 | e78488576936caa20c08025815388bf555d950cbed2a14aa787df277d2628940 → a80cfa5b8b238dae2717a3f02b961f43126e59bed7c3aa09aa43b2562302952f |
| godot/tests/test_p2005d_ice_orb.gd | 테스트 seed20261020 1회+observations | 19048f2142f41eda709929bdd77a52fce68c65a2c67cbe01b00c6d7daa14ad49 → 7f9c27b1f60af4b6d8f2c093a05943e7af8be121f5946d482e8c23f9938cd892 |
| godot/tests/test_p2001e_natural_lmb.gd | 테스트 seed20261020 1회+observations | 38cee8ff133efe4c99576f83986c646d2a32a13fc791ea4546fff48d61aefab6 → 2a2f3017f156db1a1146696f18286b48d7be8bab2a7f720d08683e214335805e |
| godot/tests/test_p2003a_lighting.gd | headless/null 확인 순서·GUI 실패 명시 | 400c7b2610befe930761117ed7f681e9d5ca39295f78fbfb9044d572ca45f005 → 6ecd3018aa6cb3910f1378942ca0e17b88e096748ff7d65608af6f19b9add2a7 |

| 문서 | 변경 내용 |
| --- | --- |
| `docs/engine/orders/reports/QA-002_REPORT.md` | 원본 행·대상 목록·전후 반복 수치·누수 원문·남은 한계 |
| `docs/engine/orders/WORK_BOARD.md` | QA-002 자기 행만 검수 대기·검증 수치로 갱신 |
| `docs/CHANGELOG_SYNC.md` | 커밋 훅이 요구하는 이번 테스트 변경 기록 추가; 기존 기록 byte 보존 |

코드 변경 뒤 docs/ 전체 관련 키워드 검색 결과는 `/Users/fordeargamers/exoduser-wt/_out/qa-002/docs-matching-lines.txt` 및 `/Users/fordeargamers/exoduser-wt/_out/qa-002/docs-matching-paths.txt`에 보존했다. 관련 문서의 과거 PC/Mac 결과는 각 실행 시점의 기록으로 유지하고, 현재 테스트 입력과 전후 수치는 이 보고서에 추가했다. `FDG_P2_003A_LIGHTING_20261020.md:33–34`의 headless10/0·별도 GUI 픽셀 증거 구분은 계속 유효하다. 원본 게임 수치·이름·공식 변경은 0이므로 설계 수치를 바꾸지 않는다.

`static-proof.json`은 시드·대기 추가만 제거하면 9개 원본 테스트 코드가 그대로 복원되며, 조명의 기존 픽셀3·headless 토글 단정이 유지됨을 기록한다. 새 실행 원파일 111개의 크기·SHA-256은 `new-run-manifest.json`, R·제품 파일·override 보존 대조는 `final-evidence.json`에 남겼다.

최초 커밋 시도는 저장소 docs-sync 훅이 CHANGELOG_SYNC 기록 누락으로 거부했다. 해당 기록을 추가해 요구사항을 충족했으며 훅·검사 우회 설정은 사용하지 않았다.

제품 파일 변경0, 기존 단정 삭제0·완화0·새 skip0이다. 제품 RNG와 원본 RNG 소비 순서·저장 호환·PC 담당 파일은 보존했다. 보고서·WORK_BOARD 및 저장소 커밋 훅이 요구한 CHANGELOG_SYNC는 관련 문서이며 테스트는 경로 지정 `git add -f -- godot/tests/<파일>.gd`, docs는 경로 지정 `git add -- <경로>`로만 stage한다. `git add -A`·main push·병합·force·reset은 수행하지 않는다.

남은 한계: 고정 스트림의 특정 샘플이므로 모든 장비·모든 조건부 분기 커버리지를 보장하지 않는다. 반복 검사 수가 일치해도 timing/독립 RNG/전체 observations는 다를 수 있다. 남은 ObjectDB 경고는 보존만 했으며 제품 결함 수리로 승격하지 않는다. PC 동일 seed 재검증·전체 회귀·실플레이·시각 품질 인수는 이번 범위 밖이다.

### 커밋·원격 영수증

브랜치: `codex/qa-002-20261020`. **테스트·보고서 체크포인트 SHA: `edad09b072be7b20eca144723cdc6ffebdce7ab3`.** 뒤따르는 문서 영수증 커밋은 이 체크포인트를 기록한다. 최종 tip·원격 ref 대조·한 줄 요약은 `/Users/fordeargamers/exoduser-wt/_out/qa-002/DONE.txt`에 보존한다.

## 9. 최신 main 통합 후 재검증

최신 기준 `origin/main=9528ea35b429498fcf42fe3723008219ed0ed7e1`을 통합한 merge HEAD `e6f414b69d390b2613b1e273ceb8156ba97860f2`에서 새로 실행했다. main에는 사용자 변경 `19a713578`과 P3-002 `43aa97ffe`가 포함된다. 이 절의 로그는 `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/`의 **30 metadata / 90 원파일**만 사용한다. 위 역사 기록의 c7 고정33회·baseline3회·기존 MAC-VERIFY와 합산하거나 동일 분모로 취급하지 않는다.

최신 실행은 **테스트29회+import1회=총30회**다. 검증 판정: **FAIL** (346/350 증거 검증 조건). exit0·실패0·skip 없음 **28/30**(import1회 포함), stderr ERROR 합계 **0**, ObjectDB 경고 발생 실행 **4/30**. 시드9종 반복 검사 수 일치는 **9/9**다. 하드코딩한 PASS가 아니라 완료된 원로그·현재 소스·아래 관측값을 대조한 판정이다.

### 9.1 기준·백업·제품 보존

| 항목 | 근거 |
| --- | --- |
| 기준 main / merge HEAD | `9528ea35b429498fcf42fe3723008219ed0ed7e1` / `e6f414b69d390b2613b1e273ceb8156ba97860f2` |
| import 전 백업 | `/Users/fordeargamers/exoduser-wt/_backup/godot-appsupport-20261020-qa-002/p3002-9528ea35` / 68파일 / manifest `/Users/fordeargamers/exoduser-wt/_out/qa-002/p3002-backup.json`; byte 재대조 일치 |
| 엔진 | `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot` / `4.7.2.stable.official.ed1daf0bf` |
| 격리·override | 각 JSON에 격리 이름·override_removed 기록. 실제 저장 폴더 사용 없음. 생성시 override 존재=False |
| upstream 통합 | 이전 QA 체크포인트 `3edabeb5edff25e2ff0682b7a70254334e87abb4`→merge 사이 75경로 변경은 승인된 upstream 병합분. 이를 QA-002의 제품 직접 작성으로 계산하지 않음 |
| 제품 추가 작성 | 실행 기준 고정 main 9528ea35b429498fcf42fe3723008219ed0ed7e1 대비 제품 diff 0경로. Godot/tests 제외 Godot 제품 전체·웹 진입 파일을 읽기 대조 |
| 공유 remote ref와 실행 기준 구분 | 생성시 origin/main=f84e26ee0bbc929fb595b4c0af292b423588f325은 관측만 기록. 병렬 fetch로 이동할 수 있으므로 판정은 merge 부모에 보존된 고정 SHA를 사용. 현재 tip의 문서 후속 커밋도 실행 당시 source HEAD와 구분 |
| 코드·문서 | 이번 최신 검증에서 레포 제품/테스트 코드 추가 작성 0. 앞선 QA-002 테스트10파일 변경은 유지. upstream 제품 변경은 정상 통합했으며 변경 전제와 새 분모를 이 절에 구분 |
| 원로그 | `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/<slug>.out`, `.err`, `.json` 각30개. old fixed/ 경로는 아래 명시한 과거 비교 열만 사용 |

제품 파일을 직접 고친 작업은 없고 upstream 제품·테스트를 정상 통합한 뒤 검증했다. 신규 제품/테스트 코드 변경이 없는 이 실행 단계에서는 docs 전체 키워드 검색을 재실행하지 않았다. 기존 코드 변경 후 docs 검색 근거는 위 역사 절에 보존한다. 커밋·push·R 종료 대조·DONE 최종 tip은 최종 completion/DONE 영수증을 따른다.

### 9.2 최신 Main 관측값과 시작 G 계약

| 관측 원문 JSON 위치 | 실제 값 | 독립 확인 기준 | 결과 |
| --- | --- | --- | --- |
| regions: observations.actual.regions[*].total | [23, 60, 53, 32] | [23,60,53,32] | 일치 |
| regions: observations.actual.current | 3 | 3 | 일치 |
| spawn-holes: observations.kill_text_boot | '0 / 32' | '0 / 32' | 일치 |
| hud: observations.initial.kill_text | '0 / 32' | '0 / 32' | 일치 |
| starter: exact key 계약 검사 실행 | G40+region7+spawnHole1=48 | preserved boot40 / current40+7+1 exact | 성공 |

위 지역 totals·current·HUD 문자는 RESULT에 실린 **실제 Main 관측값**을 이 증거 프로그램이 독립 대조한 것이다. 기존 지역 테스트가 해당 실제 totals 배열을 literal로 단정했다고 주장하지 않는다. `test_p3003_regions.gd:28`의 fixture totals `[8,15,15,15]`는 별도 소유 fixture이며 그대로 유지했다. 이를 실제 맵의 `[23,60,53,32]`로 바꾸지 않았다.

starter는 `BOOT_G_KEYS`40·`REGION_INIT_G_KEYS`7·`SPAWN_HOLE_INIT_G_KEYS`1의 정확 키 집합 계약을 **테스트에서** 실행한다. `test_native_main_source_starter_state.gd:77–86`은 size·중복·각 키 존재를 검사하고 `:98–103`은 preserved boot40과 실제 current G48을 나누어 단정한다. 이 RESULT에는 실제 G 키 전체 목록을 별도 관측 필드로 출력하지 않으므로 표는 테스트의 정확 집합 단정 통과 근거이며 별도 키덤프 계측으로 포장하지 않는다.

### 9.3 핵심 6종 재검증

| 테스트 | 검사 수 또는 case 수 | 실패 | 그룹별 수치 | exit | ERROR | ObjectDB |
| --- | --- | --- | --- | --- | --- | --- |
| test_p3002_spawn_holes | 298검사 | 0 | placement_and_g=42/0; dormant_gate=3/0; schedule_and_rng=211/0; alive_cap_wait=5/0; full_run_and_completion=22/0; etype0_actor_hurte=15/0 | 0 | 0 | 0 |
| test_p2002a_hud | 36검사 | 0 | hud_initial_values_and_overlay=29/0; hud_updates_on_kill_and_levelup=7/0 | 0 | 0 | 0 |
| test_p2002b_minimap_corner | 16검사 | 0 | minimap_cache_and_corner_initial=13/0; corner_updates_via_owner=3/0 | 0 | 0 | 0 |
| test_native_main_source_starter_state | 148검사 | 0 | startup_state_and_items=95/0; public_actor_sync=8/0; original_provider_consumers=15/0; once_and_tree_gates=11/0; lifecycle_and_grit_loss=19/0 | 0 | 0 | 0 |
| test_p3003_regions | 43검사 | 0 | 개별 그룹 수 미출력 | 0 | 0 | 0 |
| test_encounter_factory | 3case 통과(총 assertion 수 미출력) | 0 | 개별 그룹 수 미출력 | 0 | 0 | 0 |

starter의 수치는 `checks`이고 encounter는 `passed` case 수·`failed_assertions` 실패 수다. encounter의 3case를 assertion3개라고 바꾸지 않았다. 지역 테스트의 fixture/actual 경계·full game 미완 표기도 RESULT 원문대로 유지한다.

### 9.4 시작 장비 seed9종 반복과 새 분모

| 대상 | 반복 | 최신 총 검사 분포 | 그룹별 검사/실패 | 반복 일치 | 과거 c7 fixed/ 총수(역사 비교) |
| --- | --- | --- | --- | --- | --- |
| melee | 2 | 93×2 | providers_ready=15/0; shield_absorb_hits=54/0; overflow_and_kill_pipeline=24/0 | 일치 | 93×5 |
| dedicated | 2 | 357×2 | setup=31/0; combat=305/0; per_enemy_coverage=21/0 | 일치 | 357×3 |
| kislash | 2 | 220×2 | setup=20/0; combat=167/0; per_enemy_coverage=33/1 | 일치 | 214×3 |
| death-fx | 2 | 43×2 | assets_and_adapter=5/0; weapon_hit_and_kill_fx=29/0; lifetimes_and_kislash_noimpact=9/0 | 일치 | 43×3 |
| kill-rewards | 2 | 45×2 | drop_module_pure=16/0; reward_owner_units=8/0; live_kill_rewards=21/0 | 일치 | 45×3 |
| natural-lmb | 2 | 18×2 | new_run_init_refill_and_mats=10/0; natural_lmb_dual_hit_values=8/0 | 일치 | 18×3 |
| giant-slam | 2 | 12×2 | cast_costs_and_damage=9/0; cooldown_gate_and_hud_sweep=3/0 | 일치 | 12×3 |
| spike-holy | 2 | 20×2 | spike_trap_cast_zone_and_dot=12/0; holy_dome_cast_regen_and_cd_boost=8/0 | 일치 | 20×3 |
| ice-orb | 5 | 22×5 | cast_state_invuln_and_block=6/0; auto_shatter_blades_and_freeze=11/0; freeze_trigger_direct=5/0 | 일치 | 22×5 |

E 최신 분모는 93×2, D(ice-orb)는 22×5다. P3-002·새 admitted 적·upstream 데이터/타이밍이 포함된 최신 소스의 분모이며 c7의 93×5 / 22×5와 동일해야 한다는 전제를 두지 않는다. 각 기준 소스 안의 반복에서 그룹·총수·실패 수가 같은지를 판정한다.

테스트 seed는 여전히20261020·프로세스 초기화1회다. 제품 RNG 경로·원본 소비 순서·독립 RNG 인스턴스·실시간 clock/UID는 바꾸지 않았다. 반복 분모 일치를 전체 observations·모든 seed·다른 머신의 bit 단위 결정성으로 확대하지 않는다. 조건부 단정은 기존대로 유지했다.

#### 얼음보주5회 조건부2검사 관측

| 최신 실행 | base_dmg | blade_dmg | piece>=100 | 그룹 검사 수(6/11/5) | 총 검사/실패 |
| --- | --- | --- | --- | --- | --- |
| ice-orb-01 | 408 | 122 | True | 6/11/5 | 22/0 |
| ice-orb-02 | 408 | 122 | True | 6/11/5 | 22/0 |
| ice-orb-03 | 408 | 122 | True | 6/11/5 | 22/0 |
| ice-orb-04 | 408 | 122 | True | 6/11/5 | 22/0 |
| ice-orb-05 | 408 | 122 | True | 6/11/5 | 22/0 |

중간 auto_shatter_blades_and_freeze 그룹의11개는 기본9개와 기존 조건부2개로 구성된다. `expected_piece=base_dmg×0.3`의 정수값이100 이상이고 타깃이 유효·생존한 조건에서 쉴드/프리즌 상태와 얼음파편저항 단정2개가 수행된다. 최신 각 실행의22/0·그룹6/11/5·piece>=100을 별도 증거 검증 조건으로 대조했다. 이 표는 새 seed·제품 변경을 넣은 결과가 아니라 기존 고정 seed20261020을 새 main에서 실행한 관측이다.

PC가 제공한 반례 `base_dmg327→blade_dmg98`은100 미만이라 해당 조건부2개가 수행되지 않아20개가 될 수 있음을 설명하는 **PC 제공 증거**다. 이 절에서 새로 실행한 Mac 관측으로 기록하지 않았으며 위 최신5회와 혼합하지 않는다.

### 9.5 강타·가시/홀리 종료 진단과 조명

| 실행 | 검사/실패 | ERROR | ObjectDB | verbose 객체 | verbose 리소스 |
| --- | --- | --- | --- | --- | --- |
| giant-slam-01 | 12/0 | 0 | 0 | 0 | 0 |
| giant-slam-02 | 12/0 | 0 | 0 | 미수집(비verbose) | 미수집(비verbose) |
| spike-holy-01 | 20/0 | 0 | 0 | 0 | 0 |
| spike-holy-02 | 20/0 | 0 | 0 | 미수집(비verbose) | 미수집(비verbose) |

B/C 각2회 총4회에서 ERROR·ObjectDB 경고를 수집했고, 각 첫 실행만 --verbose(총2회)로 개별 Leaked instance·Resource still in use를 수집했다. 비verbose의 개별 리소스 미출력을 0계측으로 간주하지 않았다. 이전 하니스 cleanup 뒤12 process_frame 대기와 제품 읽기전용 조건을 유지했다. 이 관측을 제품 장시간 오디오 수명 전체 수리로 선언하지 않는다.

| 조명 모드 | 구조/밝기 그룹 | 총 검사/실패 | ERROR | 밝기 관측 |
| --- | --- | --- | --- | --- |
| lighting-headless | overlay_structure_and_params=9/0; overlay_darkens_screen=1/0 | 10/0 | 0 | "headless_dummy_renderer_probe_covers" |
| lighting-window | overlay_structure_and_params=9/0; overlay_darkens_screen=3/0 | 12/0 | 0 | {"off_center": 44.0007026741864, "off_edge": 38.6287331085814, "on_center": 40.0699004620794, "on_edge": 29.9017034882507} |

헤드리스10개는 기존 구조9+토글1이고 GUI12개는 구조9+실제 픽셀3이다. headless/null 확인 뒤 get_image 호출 순서와 GUI 이미지 부재의 명시 실패를 유지했다. 이미 열린 게임을 재시작하지 않고 전용 격리 창으로 실행했다.

### 9.6 최신30회 전체 실행 수치

각 행의 `post-main-9528ea35/<slug>`에 대해 `/Users/fordeargamers/exoduser-wt/_out/qa-002/` 아래 같은 basename의 `.out`·`.err`·`.json` 3파일을 보존했다.

| 로그 basename | 검사/case | 실패 | exit | ERROR | ObjectDB | 초 |
| --- | --- | --- | --- | --- | --- | --- |
| post-main-9528ea35/import | —(import) | 0 | 0 | 0 | 0 | 5.048 |
| post-main-9528ea35/spawn-holes | 298검사 | 0 | 0 | 0 | 0 | 12.583 |
| post-main-9528ea35/hud | 36검사 | 0 | 0 | 0 | 0 | 15.327 |
| post-main-9528ea35/minimap | 16검사 | 0 | 0 | 0 | 0 | 13.373 |
| post-main-9528ea35/starter | 148검사 | 0 | 0 | 0 | 0 | 71.957 |
| post-main-9528ea35/regions | 43검사 | 0 | 0 | 0 | 0 | 27.228 |
| post-main-9528ea35/encounter | 3case 통과(총 assertion 수 미출력) | 0 | 0 | 0 | 0 | 5.829 |
| post-main-9528ea35/melee-01 | 93검사 | 0 | 0 | 0 | 1 | 28.309 |
| post-main-9528ea35/melee-02 | 93검사 | 0 | 0 | 0 | 0 | 26.61 |
| post-main-9528ea35/dedicated-01 | 357검사 | 0 | 0 | 0 | 0 | 70.834 |
| post-main-9528ea35/dedicated-02 | 357검사 | 0 | 0 | 0 | 1 | 61.945 |
| post-main-9528ea35/kislash-01 | 220검사 | 1 | 1 | 0 | 0 | 38.842 |
| post-main-9528ea35/kislash-02 | 220검사 | 1 | 1 | 0 | 0 | 30.465 |
| post-main-9528ea35/death-fx-01 | 43검사 | 0 | 0 | 0 | 1 | 61.374 |
| post-main-9528ea35/death-fx-02 | 43검사 | 0 | 0 | 0 | 1 | 39.587 |
| post-main-9528ea35/kill-rewards-01 | 45검사 | 0 | 0 | 0 | 0 | 28.072 |
| post-main-9528ea35/kill-rewards-02 | 45검사 | 0 | 0 | 0 | 0 | 27.32 |
| post-main-9528ea35/natural-lmb-01 | 18검사 | 0 | 0 | 0 | 0 | 16.395 |
| post-main-9528ea35/natural-lmb-02 | 18검사 | 0 | 0 | 0 | 0 | 17.008 |
| post-main-9528ea35/giant-slam-01 | 12검사 | 0 | 0 | 0 | 0 | 15.862 |
| post-main-9528ea35/giant-slam-02 | 12검사 | 0 | 0 | 0 | 0 | 15.672 |
| post-main-9528ea35/spike-holy-01 | 20검사 | 0 | 0 | 0 | 0 | 16.0 |
| post-main-9528ea35/spike-holy-02 | 20검사 | 0 | 0 | 0 | 0 | 16.243 |
| post-main-9528ea35/ice-orb-01 | 22검사 | 0 | 0 | 0 | 0 | 22.989 |
| post-main-9528ea35/ice-orb-02 | 22검사 | 0 | 0 | 0 | 0 | 21.093 |
| post-main-9528ea35/ice-orb-03 | 22검사 | 0 | 0 | 0 | 0 | 19.369 |
| post-main-9528ea35/ice-orb-04 | 22검사 | 0 | 0 | 0 | 0 | 21.831 |
| post-main-9528ea35/ice-orb-05 | 22검사 | 0 | 0 | 0 | 0 | 20.045 |
| post-main-9528ea35/lighting-headless | 10검사 | 0 | 0 | 0 | 0 | 18.468 |
| post-main-9528ea35/lighting-window | 12검사 | 0 | 0 | 0 | 0 | 16.288 |

### 9.7 검증 불일치·남은 경고

| 검증 조건 | FAIL 근거 |
| --- | --- |
| kislash-01: exit/permission/timeout | exit=1, permission_blocked=False, timeout=False |
| kislash-01: failures/skip | failures=1, skipped=[] |
| kislash-02: exit/permission/timeout | exit=1, permission_blocked=False, timeout=False |
| kislash-02: failures/skip | failures=1, skipped=[] |

`/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/melee-01.err`

```text
WARNING: 4 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/dedicated-02.err`

```text
WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/death-fx-01.err`

```text
WARNING: 5 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/death-fx-02.err`

```text
WARNING: 5 ObjectDB instances were leaked at exit (run with `--verbose` for details).
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/kislash-01` 진단 원문(stderr ERROR·stdout 단정 실패·verbose 잔존 객체/리소스)

```text
P1002G_FAIL per_enemy_coverage no native_hurte_halt emitted across combat
```

`/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/kislash-02` 진단 원문(stderr ERROR·stdout 단정 실패·verbose 잔존 객체/리소스)

```text
P1002G_FAIL per_enemy_coverage no native_hurte_halt emitted across combat
```

실제 첫 전투 영상·전체 기능 이식·fieldboss 전투·모든 플랫폼 품질 인수는 이 테스트 결과로 승격하지 않는다. 앞선 c7 역사 수치와 현재 main 수치를 분리 보존하며 남은 제품 구현 범위는 원본 RESULT의 fixture/미연결 플래그를 따른다.

### 9.7.1 새 제품 회귀 — etype20 포이즈 소유자 연결

최신 main의 원본 검기 테스트 2회는 각각 **220검사/1실패**, exit1·ERROR0이다. 두 실행 모두 setup20/0·combat167/0·per_enemy_coverage33/1, `halt_count=6`으로 일치한다. 검사 수 결정성과 기능 통과를 구분한다. 과거 c7의 214/0을 최신 결과로 승격하지 않는다.

```text
P1002G_FAIL per_enemy_coverage no native_hurte_halt emitted across combat
```

원본 테스트의 TARGETS6은 검사할 적의 선택이며 extra actor 제거·충돌 제외가 아니다(`test_p1002g_kislash_hurte.gd:197–209,345–347`). 실제 검기는 월드 전체 적을 검사하고(`crescent.gd:131–158`), halt 수집과 마지막 무halt 단정은 전체 전투를 대상으로 한다(`test_p1002g_kislash_hurte.gd:111–115,497–498`). 따라서 새 etype20을 제외하거나 halt 단정을 완화하지 않았다.

원래 2회 로그에는 halt count만 있어 적/사유 원문을 별도 수집했다. 레포 밖 `kislash_halt_probe.gd`가 원본 테스트를 상속하고 `_on_player_event`에서 읽기 출력한 뒤 원본 super를 호출한다. seed·단정·fixture·공격·종료와 레포 테스트 파일은 변경하지 않았다. 이 **추가 진단 1회**는 위 29회 테스트와 별도이며 같은 220/1·exit1·ERROR0, 6건의 원문 payload를 보존했다. 아래 actor ID 귀속은 이 진단 1회에서 실제 확인한 것이며 원래 2회에 동일 instance ID가 있었다고 주장하지 않는다.

| 진단 순서 | 실제 actor ID | 원본 record ID | order | etype | reason | halted_at | v3 구성 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 131600485169 | ch1_initial_005 | 4 | 20 | `source_field_call_unavailable` | 42490 | false |
| 2 | 131885697847 | ch1_initial_013 | 12 | 20 | `source_field_call_unavailable` | 42490 | false |
| 3 | 131600485169 | ch1_initial_005 | 4 | 20 | `source_field_call_unavailable` | 42490 | false |
| 4 | 131885697847 | ch1_initial_013 | 12 | 20 | `source_field_call_unavailable` | 42490 | false |
| 5 | 131600485169 | ch1_initial_005 | 4 | 20 | `source_field_call_unavailable` | 42490 | false |
| 6 | 131801811765 | ch1_initial_011 | 10 | 20 | `source_field_call_unavailable` | 42490 | false |

6건 모두 `res://scripts/enemy_melee_ch1_ice_warrior.gd`이며 `has_v3_poise=true`, `has_normal_poise_core=true`, `v3_configured=false`다. 원문 전체는 `post-main-9528ea35-diagnostic/native-hurte-halt.out/.json`에 보존했다. 첫 outcome의 원문 JSON 값은 다음과 같다(전체 actor record·나머지 payload는 원로그).

```json
{"base_damage":1176,"enemy_id":131600485169,"fallback_used":false,"halted_at":42490,"journal":[{"data":{"atk_el":0,"dmg":1176,"enemy_el":0,"mult":1.0},"line":37614,"op":"elMul"},{"data":{},"line":42117,"op":"unported_skip:_petOnAtk"},{"data":{"raw_amount":1176},"line":42191,"op":"hit_sfx_requested"},{"data":{"dmg":1176,"value":1.0},"line":42207,"op":"statStr"},{"data":{"bonus":0.0,"dmg":1176,"is_crit":false,"roll":0.595349445473403,"stat_crit":0.0},"line":42316,"op":"crit"},{"data":{"value":0.0},"line":42347,"op":"enemy_field:eShield"},{"data":{"absorbed":875.0,"dmg":301,"shield_left":0.0},"line":42345,"op":"eShield_absorb"},{"data":{"value":true},"line":42380,"op":"enemy_field:alerted"},{"data":{"value":5.0},"line":42382,"op":"enemy_field:contact_clamp"},{"data":{"hp":1886.0},"line":42383,"op":"hp_write"},{"data":{"value":6.0},"line":42412,"op":"enemy_field:hit_flash"},{"data":{"value":4.0},"line":42414,"op":"enemy_field:hit_stun"},{"data":{"over_budget":false,"shake":3.2},"line":42416,"op":"hit_feel"},{"data":{"dmg":301},"line":42399,"op":"hit_blood"},{"data":{"amount":7.5},"line":42476,"op":"knockback"},{"data":{"reason":"source_field_call_unavailable"},"line":42490,"op":"HALT"}],"ok":false,"reason":"source_field_call_unavailable","rng_draws":[{"line":42316,"purpose":"crit","value":0.595349445473403}],"step":2}
```

| 정적 소유 경로 | 근거·판정 |
| --- | --- |
| 새 etype20 | `enemy_melee_ch1_ice_warrior.gd:1`이 flesh crawler 상속, `:96–101`에 정상 포이즈 core 구현 보유 |
| 잘못 우선되는 경로 | `native_normal_enemy_hurte.gd:875–877`이 상속된 `apply_native_source_poise_hit`의 존재만 보고 etype0 전용 v3 경로 우선; 정상 core보다 먼저 return |
| exact owner 거부 | `enemy_melee_flesh_crawler.gd:121,409`의 정확 etype0/script/id 소유 조건이 etype20을 거부 |
| 실제 HALT 연결 | `world.gd:3417–3423`의 field call 생성 실패 → `native_normal_enemy_hurte.gd:888–891`의 `source_field_call_unavailable` / 42490 → `crescent.gd:157–158`의 native_hurte_halt. 진단 payload와 일치 |
| 기존 검수 공백 | `test_etype20_ch1_hurte_bridge.gd:35–40`은 poiseHit=false·base100·shield875라 쉴드 초과 후 포이즈 진입을 검증하지 않음 |
| 부분 적용 | 피해 실행자의 HP 쓰기(:411)가 포이즈(:496)보다 앞선다. 첫 진단 journal도 shield875 흡수→잔여301→HP1886 쓰기 후 HALT를 기록. 무피해 정지라고 해석하지 않음 |

진단 journal의 actor별 HP 쓰기는 `ch1_initial_005: 1886→710→-466`, `ch1_initial_013: 574→-602`, `ch1_initial_011: 574`다. HP≤0 쓰기 2건도 포이즈 HALT 이후 `native_normal_enemy_hurte.gd:497`의 조기 return으로 해당 호출의 완료 telemetry(:516)·처치 파이프라인(:521–523)에 도달하지 못한다. 종료 시 실제 alive·충돌·보상·지역 최종값은 별도 계측하지 않았으므로 영구 불사나 보상 손실 발생까지 확정하지 않는다. 후속 게임 상태 불일치 가능성이 있는 제품 회귀로 전달한다.

**제품 결함으로 보고한다.** 소유 범위는 P2-008a 새 actor와 공용 hurtE 포이즈 연결이다. PC 담당 제품 파일은 읽기만 했다. 수정안은 etype0 exact v3 계약을 보존하면서 명시적 소유자/능력 경로로 etype20의 정상 포이즈 core를 연결하는 것이다. 실패 후 폴백으로 전환하거나 extra actor/halt 검사를 제외하는 방식은 사용하지 않는다. PC 수정 후 쉴드 초과·포이즈 파괴·처치와 이 검기 회귀를 다시 검증해야 한다.

추가 진단은 1회·원로그 3파일이며 전체 최신 실행은 **기본30회(29테스트+import1)+진단1회=31회**다. 기본30회와 추가 진단의 stderr ERROR는 모두0이다. 재검증의 FAIL은 위 제품 회귀 때문이며 권한 차단이나 실행 우회는 없었다.

### 9.8 최신 실행 LAST RESULT 원문

아래는 시드9종 각각의 마지막 반복1개·핵심6종·조명2모드의 대표 LAST RESULT 원문17개다(import는 RESULT 미출력). 전체29회 테스트의 수치·로그 경로는9.6표에 남겼으며 나머지 반복의 LAST RESULT 원문도 같은 basename의 보존 `.json`/`.out`에서 확인할 수 있다. 선택한 JSON은 축약하거나 새 수치로 치환하지 않았다. 명령·격리 이름·시간·HEAD·실행 당시 test_sha256도 같은 JSON을 따른다.

#### spawn-holes

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/spawn-holes.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/spawn-holes.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/spawn-holes.json`

```text
P3002_RESULT {"assertions":298,"failures":0,"fallback_paths_used":false,"groups":[{"assertions":42,"failures":0,"group":"placement_and_g"},{"assertions":3,"failures":0,"group":"dormant_gate"},{"assertions":211,"failures":0,"group":"schedule_and_rng"},{"assertions":5,"failures":0,"group":"alive_cap_wait"},{"assertions":22,"failures":0,"group":"full_run_and_completion"},{"assertions":15,"failures":0,"group":"etype0_actor_hurte"}],"observations":{"etypes_seen_near4":[12,6,26,11,1,0,21,8,27,16,17,23,47,7,4,13],"full_run_ticks":3374,"g_on_at_boot":false,"hurte_target":"ch1_spawn_hole_01_02","kill_text_boot":"0 / 32","metrics":{"actors_registered":10,"advance_calls":4507,"alive_waits":5,"center_forced":0,"completed":14,"consumer_rejected":0,"mken_null":0,"revive_decays":150,"rng_calls":2454,"spawn_attempts":168,"spawned":168,"spiral_fallbacks":0,"triggered":14,"unported_spawns":158},"near4_spawns":39},"skipped":[]}
```

#### hud

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/hud.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/hud.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/hud.json`

```text
P2002A_RESULT {"assertions":36,"failures":0,"fallback_paths_used":false,"forced_actor_fields":4,"groups":[{"assertions":29,"failures":0,"group":"hud_initial_values_and_overlay"},{"assertions":7,"failures":0,"group":"hud_updates_on_kill_and_levelup"}],"observations":{"after_kill":{"debug_overlay_visible":false,"exp_fill_px":60.0,"exp_text":"6 / 20","kill_text":"0 / 32","lv_text":"2","malice_text":"1,004","ready":true,"serif_font_loaded":true,"slot_icon_files":{"qs0":"spikeTrap","qs1":"","qs2":"","qs3":"","qs5":"holyDome","qsE":"fireball","qsQ":"peaceShield","skSlot0":"chargeBoost","skSlot1":"giantSlam","skSlotCT":"iceOrb","skSlotLMB":"kiSlash","skSlotRMB":"shieldThrow","ultSlot":""},"timer_text":"00:00","unported":["미니맵(mmWrap)","hudCorner 화폐(✦ SP/◇ CP)","지역(_regCur) 분모·진행바 4지역","쿨다운 sweep(쿨다운 소유자 미이식)","Cinzel·Nanum Myeongjo 폰트(Noto Serif KR 폴백)","숫자/F/Z 슬롯 스킬(시작 스킬 지급 EXTERNAL 미이식)","타이머 전진(G.on 점등 미이식 — 초기화·커튼 계약이 pre-stage on=false 유지 명시: 타이머 UI는 G.stageTime 소비만)"]},"initial":{"debug_overlay_visible":false,"exp_fill_px":0.0,"exp_text":"0 / 15","kill_text":"0 / 32","lv_text":"1","malice_text":"1,000","ready":true,"serif_font_loaded":true,"slot_icon_files":{"qs0":"spikeTrap","qs1":"","qs2":"","qs3":"","qs5":"holyDome","qsE":"fireball","qsQ":"peaceShield","skSlot0":"chargeBoost","skSlot1":"giantSlam","skSlotCT":"iceOrb","skSlotLMB":"kiSlash","skSlotRMB":"shieldThrow","ultSlot":""},"timer_text":"00:00","unported":["미니맵(mmWrap)","hudCorner 화폐(✦ SP/◇ CP)","지역(_regCur) 분모·진행바 4지역","쿨다운 sweep(쿨다운 소유자 미이식)","Cinzel·Nanum Myeongjo 폰트(Noto Serif KR 폴백)","숫자/F/Z 슬롯 스킬(시작 스킬 지급 EXTERNAL 미이식)","타이머 전진(G.on 점등 미이식 — 초기화·커튼 계약이 pre-stage on=false 유지 명시: 타이머 UI는 G.stageTime 소비만)"]}},"skipped":[]}
```

#### minimap

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/minimap.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/minimap.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/minimap.json`

```text
P2002B_RESULT {"assertions":16,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":13,"failures":0,"group":"minimap_cache_and_corner_initial"},{"assertions":3,"failures":0,"group":"corner_updates_via_owner"}],"observations":{"after_levelup":{"cp_text":"◇ 1,754","minimap_cache_ready":true,"minimap_enemy_points":9,"minimap_origin":[4.0,4.0],"minimap_portrait_loaded":true,"minimap_sc":0.61,"sp_text":"✦ 3 +1","unported":["필드보스 전투·게이트 연출·정화 SFX 미연결(P3-003 잔여)","출구 ▲(!bossAlive 조건 — 신규 true)","분산 빌드(_mmTickBuild — 고정 맵 1회 빌드 근사)","맵 오브젝트 마커(bonfire/trap/altar — 1장 데이터에 없음)","frame drop-shadow·brightness 필터(953)","hudCorner box-shadow·inset 하이라이트 근사 생략","Cinzel 폰트(Noto Serif KR 폴백)","spCnt 클릭(J 능력치 패널 미이식)","나눔명조 1순위(웹폰트 — 사용자 승인 대기 목록)","적 점 색 데이터 차(규칙 ELC[e.el] 동일 — 웹 el0 회백 vs 포트 encounter element_id 3 보라: 데이터 소유 wt-p2g)"]},"initial":{"cp_text":"◇ 1,744","minimap_cache_ready":true,"minimap_enemy_points":9,"minimap_origin":[4.0,4.0],"minimap_portrait_loaded":true,"minimap_sc":0.61,"sp_text":"✦ 0","unported":["필드보스 전투·게이트 연출·정화 SFX 미연결(P3-003 잔여)","출구 ▲(!bossAlive 조건 — 신규 true)","분산 빌드(_mmTickBuild — 고정 맵 1회 빌드 근사)","맵 오브젝트 마커(bonfire/trap/altar — 1장 데이터에 없음)","frame drop-shadow·brightness 필터(953)","hudCorner box-shadow·inset 하이라이트 근사 생략","Cinzel 폰트(Noto Serif KR 폴백)","spCnt 클릭(J 능력치 패널 미이식)","나눔명조 1순위(웹폰트 — 사용자 승인 대기 목록)","적 점 색 데이터 차(규칙 ELC[e.el] 동일 — 웹 el0 회백 vs 포트 encounter element_id 3 보라: 데이터 소유 wt-p2g)"]}},"skipped":[]}
```

#### starter

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/starter.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/starter.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/starter.json`

```text
MAIN_STARTER_SUITE_RESULT {"actual_Main":true,"checks":148,"failures":0,"full_automatic_source_pipeline_proven":false,"full_bootstrap_completed":false,"full_derived_parameters_proven":false,"groups":5,"input_fixtures":false,"old_suites":0,"results":[{"checks":95,"elapsed_ms":10529,"failures":0,"group":"startup_state_and_items","observation":{"bag":10,"equipped":15,"mk_item_entries":26,"rng_draws":911,"source_boot_current":false,"time_calls":25,"uid_window_ms":[1792490694780.0,1792490699948.0]}},{"checks":8,"elapsed_ms":10717,"failures":0,"group":"public_actor_sync","observation":{"hp":548.03125,"manual_actor_setters":false,"mp":268.0,"s":"idle","st":272.03125}},{"checks":15,"elapsed_ms":10779,"failures":0,"group":"original_provider_consumers","observation":{"binding_ready":true,"fusion_holyDome":0,"grit_total":{"ready":true,"reason":"","source":"game.html:28559 _gritTotal()","status":"READY","value":0.0},"parameters":{"conditional_unbound":[],"missing":[],"missing_upstream":{"crystal_effects":"conditional: 실제 player_crystal_resource_source.crystalEffects provider (@15951)","current_INV":"현재 INV authority (equipped) — ITEM/ENGINE","current_P":"현재 P getter 필수: 실제 actor/resources와 owned source fields — ENGINE","current_STATS":"현재 STATS authority — BUILD","grit":"현재 _grit 전역 (@28556) authority — BUILD","install_sink":"packet 적용 + KIND_INVALIDATE 를 affix/eqStat 캐시 소유자에서 실행하는 sink 설치 — ENGINE"},"ready":true,"status":"READY"}}},{"checks":11,"elapsed_ms":10153,"failures":0,"group":"once_and_tree_gates","observation":{"retry":"ALREADY_ATTEMPTED","rng_after":912,"rng_before":912}},{"checks":19,"elapsed_ms":27955,"failures":0,"group":"lifecycle_and_grit_loss","observation":{"actual_actor_resource_refill":false,"grit_after":{"ready":false,"reason":"grit_not_number:Nil","source":"game.html:28559 _gritTotal()","status":"NOT_READY","value":null},"grit_before":{"ready":true,"reason":"","source":"game.html:28559 _gritTotal()","status":"READY","value":0.0},"lost_state_provider_ready":false}}],"userdir":"/Users/fordeargamers/Library/Application Support/EXODUSER-MainSourceStarter-Isolated-20261014"}
```

#### regions

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/regions.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/regions.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/regions.json`

```text
P3003_RESULT {"C_kill_hook_bound":false,"P3_002_holes_finalization_bound":false,"assertions":43,"failed":[],"failures":0,"fixture_not_full_game":true,"observations":{"actual":{"cleared":0,"current":3,"full_fieldboss_combat":false,"init_count":1,"kill_calls":0,"pending_effects":[],"ready":true,"regions":[{"cleared":false,"fbIdx":2,"id":0,"kills":0,"nameEn":"Northwest · Dark","nameKo":"북서 · 어둠","total":23,"x0":0.0,"x1":100.0,"y0":0.0,"y1":100.0},{"cleared":false,"fbIdx":3,"id":1,"kills":0,"nameEn":"Northeast · Lightning","nameKo":"북동 · 번개","total":60,"x0":100.0,"x1":200.0,"y0":0.0,"y1":100.0},{"cleared":false,"fbIdx":0,"id":2,"kills":0,"nameEn":"Southwest · Water","nameKo":"남서 · 물","total":53,"x0":0.0,"x1":100.0,"y0":100.0,"y1":200.0},{"cleared":false,"fbIdx":1,"id":3,"kills":0,"nameEn":"Southeast · Fire","nameKo":"남동 · 불","total":32,"x0":100.0,"x1":200.0,"y0":100.0,"y1":200.0}],"sites":[{"color":"(0.2, 0.5333, 1.0, 1.0)","pos":"(35.685, 96.68501)","radius":3.0},{"color":"(1.0, 0.3333, 0.1333, 1.0)","pos":"(90.585, 91.805)","radius":3.0},{"color":"(0.6, 0.2, 0.8, 1.0)","pos":"(32.025, 25.925)","radius":3.0},{"color":"(1.0, 0.9333, 0.0, 1.0)","pos":"(90.585, 25.925)","radius":3.0}]},"core_groups":"source static contracts/owned fixtures only","display":"in-memory generated minimap mask pixels; no PNG originals; no actual screen verdict"}}
```

#### encounter

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/encounter.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/encounter.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/encounter.json`

```text
GODOT_ENCOUNTER_FACTORY_RESULT {"failed_assertions":0,"only":[],"passed":3,"performance_evidence":false,"public_play_evidence":false,"simulation_ticks":0}
```

#### melee-02

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/melee-02.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/melee-02.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/melee-02.json`

```text
P1002E_RESULT {"assertions":93,"failures":0,"fallback_paths_used":false,"forced_actor_fields":25,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":54,"failures":0,"group":"shield_absorb_hits"},{"assertions":24,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1005,"rifts":0},"kill_hits_total":6,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"qa002_test_seed":20261020,"shield_phase_hits":6},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### dedicated-02

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/dedicated-02.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/dedicated-02.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/dedicated-02.json`

```text
P1002F_RESULT {"assertions":357,"failures":0,"fallback_paths_used":false,"forced_actor_fields":135,"groups":[{"assertions":31,"failures":0,"group":"setup"},{"assertions":305,"failures":0,"group":"combat"},{"assertions":21,"failures":0,"group":"per_enemy_coverage"}],"observations":{"aim_basis":{"facing_write_survives_frame":false,"mouse_world":[3060.0,6460.0],"player_pos":[4020.0,7420.0],"pointer_provider_bound":false},"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"halt_count":0,"hits_flesh_crawler":12,"hits_hive_bloater":12,"hits_ice_soul_flame":12,"hits_spine_beast":12,"kill_rng_flesh_crawler":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_hive_bloater":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_ice_soul_flame":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_edef","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_spine_beast":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"qa002_test_seed":20261020,"swing_log":[{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":277.0,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":272.1,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":267.2,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":6,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":262.4,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":3,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":258.1,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":253.3,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":248.3,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":243.5,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":233.6,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":11,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":228.7,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":224.6,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":219.7,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":214.8,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":205.0,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":200.1,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":195.2,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":190.3,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":185.4,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":12,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":180.6,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":176.4,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":3,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":171.5,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":166.6,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":161.7,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":156.8,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":151.9,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":147.1,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":142.2,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":137.3,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":132.4,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":127.5,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":122.6,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":117.8,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":112.9,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":107.9,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":103.0,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":98.2,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":93.3,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":4,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":88.4,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":83.5,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":3,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":78.7,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":73.8,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":68.9,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":64.0,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":59.1,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":54.3,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":49.4,"t":"hive_bloater"}],"total_swings":46},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### kislash-02

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/kislash-02.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/kislash-02.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/kislash-02.json`

```text
P1002G_RESULT {"assertions":220,"failures":1,"fallback_paths_used":false,"forced_actor_fields":20,"groups":[{"assertions":20,"failures":0,"group":"setup"},{"assertions":167,"failures":0,"group":"combat"},{"assertions":33,"failures":1,"group":"per_enemy_coverage"}],"observations":{"aim_basis":{"facing_write_survives_frame":false,"pointer_provider_bound":false},"cast_damages":[{"damage":1176,"step":1,"tier":0},{"damage":1176,"step":2,"tier":0},{"damage":9408,"step":3,"tier":3},{"damage":1176,"step":1,"tier":0},{"damage":1176,"step":2,"tier":0},{"damage":1176,"step":3,"tier":0},{"damage":1176,"step":1,"tier":0}],"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"halt_count":6,"hits_eye_mass_01":2,"hits_eye_mass_02":1,"hits_flesh_crawler":2,"hits_hive_bloater":2,"hits_ice_soul_flame":2,"hits_spine_beast":2,"kill_rng_eye_mass_01":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_eye_mass_02":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:stat_bonus_st","drop:stat_charge","drop:stat_charge_w","drop:armor_bonus_range","drop:armor_bonus_charge","drop:armor_stat_count_r1","drop:armor_stat_pick","drop:armor_stat_value","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_flesh_crawler":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:stat_bonus_st","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_hive_bloater":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_ice_soul_flame":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_spine_beast":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:stat_bonus_st","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"melee_ref":20.0,"qa002_test_seed":20261020,"swing_log":[{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"swing","stamina":272.0,"t":"eye_mass_01"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"swing","stamina":262.3,"t":"eye_mass_01"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"windup","stamina":252.6,"t":"eye_mass_02","windup_hold":130},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"swing","stamina":243.3,"t":"ice_soul_flame"},{"accepted":true,"dist":120.0,"halts":2,"outcomes":4,"p_state":"swing","stamina":233.6,"t":"ice_soul_flame"},{"accepted":true,"dist":120.0,"halts":2,"outcomes":5,"p_state":"windup","stamina":224.0,"t":"hive_bloater","windup_hold":1},{"accepted":true,"dist":120.0,"halts":2,"outcomes":3,"p_state":"swing","stamina":214.3,"t":"flesh_crawler"}],"total_casts":7},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

#### death-fx-02

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/death-fx-02.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/death-fx-02.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/death-fx-02.json`

```text
P2001B_RESULT {"assertions":43,"failures":0,"fallback_paths_used":false,"forced_actor_fields":34,"groups":[{"assertions":5,"failures":0,"group":"assets_and_adapter"},{"assertions":29,"failures":0,"group":"weapon_hit_and_kill_fx"},{"assertions":9,"failures":0,"group":"lifetimes_and_kislash_noimpact"}],"observations":{"final_metrics":{"blood_anims":1,"corpses":1,"death_fx":1,"death_impacts":1,"death_sound_skipped_missing_assets":0,"death_sounds_dispatched":1,"gore_pieces":2,"impacts":7,"rng_calls":304,"stains":1},"kill_metrics":{"blood_anims":1,"corpses":1,"death_fx":1,"death_impacts":1,"death_sound_skipped_missing_assets":0,"death_sounds_dispatched":1,"gore_pieces":2,"impacts":7,"rng_calls":304,"stains":1},"pool_limits":{"corpses":120,"di":12,"gore":120,"impacts":12,"stains":30},"qa002_test_seed":20261020},"skipped":[]}
```

#### kill-rewards-02

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/kill-rewards-02.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/kill-rewards-02.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/kill-rewards-02.json`

```text
P2001C_RESULT {"assertions":45,"failures":0,"fallback_paths_used":false,"forced_actor_fields":33,"groups":[{"assertions":16,"failures":0,"group":"drop_module_pure"},{"assertions":8,"failures":0,"group":"reward_owner_units"},{"assertions":21,"failures":0,"group":"live_kill_rewards"}],"observations":{"death_sound_dispatches":1,"exp_unit":{"exp":5,"lv":2,"maxExp":20,"unported":["SFX.levelup","showPH_LEVEL_UP","_levelUpVfx","dbSaveForce(세이브_금지)","passive_queue(큐_시스템_부재)"]},"kill_journal":{"add_exp":{"combo_bonus":1.0,"exp":6,"levels":0,"lv":2,"raw":5,"unported":["SFX.levelup","showPH_LEVEL_UP","_levelUpVfx","dbSaveForce(세이브_금지)","passive_queue(큐_시스템_부재)"],"value":1},"potion":{"accepted":true,"gate":0.652739715995267,"type":"hp"},"roll_drop":{"crystal":false,"items":0,"stone":false,"unported":["floor_item_render_pickup","playItemDropSfx","_crAutoProcess(기본 OFF)"]}},"pure_draw_tags_b":["drop_gate","drop_rarity","drop_slot","drop_element","atk_skew","base_weapon_antirevive","base_shield_hp","base_shield_st","base_shield_antirevive","base_boots_st","base_boots_hp","base_armor_st"],"qa002_test_seed":20261020},"skipped":[]}
```

#### natural-lmb-02

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/natural-lmb-02.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/natural-lmb-02.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/natural-lmb-02.json`

```text
P2001E_RESULT {"assertions":18,"failures":0,"fallback_paths_used":false,"forced_actor_fields":2,"groups":[{"assertions":10,"failures":0,"group":"new_run_init_refill_and_mats"},{"assertions":8,"failures":0,"group":"natural_lmb_dual_hit_values"}],"observations":{"expected":{"ki":1176,"weapon":162,"wp_atk":5.0},"init":{"activeLMBSk":"kiSlash","mats":1000,"mhp":676.0,"mshield":325.0},"measured":{"attempt":0,"ki":1176,"weapon":162},"qa002_test_seed":20261020},"skipped":[]}
```

#### giant-slam-02

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/giant-slam-02.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/giant-slam-02.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/giant-slam-02.json`

```text
P2005B_RESULT {"assertions":12,"failures":0,"fallback_paths_used":false,"forced_actor_fields":1,"groups":[{"assertions":9,"failures":0,"group":"cast_costs_and_damage"},{"assertions":3,"failures":0,"group":"cooldown_gate_and_hud_sweep"}],"observations":{"cast":[{"cd":1800.0,"dmg":280,"hits":1,"lv":1,"radius":500.0}],"cooldown":{"skSlot1":{"pct":0.996666666666667,"text":"29.9s"}},"qa002_test_seed":20261020},"skipped":[]}
```

#### spike-holy-02

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/spike-holy-02.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/spike-holy-02.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/spike-holy-02.json`

```text
P2005C_RESULT {"assertions":20,"failures":0,"fallback_paths_used":false,"forced_actor_fields":2,"groups":[{"assertions":12,"failures":0,"group":"spike_trap_cast_zone_and_dot"},{"assertions":8,"failures":0,"group":"holy_dome_cast_regen_and_cd_boost"}],"observations":{"dome":{"presence":true,"zone":{"lv":1,"maxT":750.0,"r":520.0,"t":10.0,"type":"holyDome","x":3418.65649414062,"y":6699.56201171875}},"qa002_test_seed":20261020,"spike":{"cast_log":[{"cd":600.0,"dmg":405,"lv":1,"skill":"spikeTrap"},{"rejected":true,"skill":"spikeTrap"}],"hits":1,"zone":[{"_tickTimer":24.0,"dmg":405,"el":0,"lv":1,"maxT":600.0,"r":300.0,"t":49.0,"type":"spikeTrap","x":3420.0,"y":6700.0},{"lv":1,"maxT":750.0,"r":520.0,"t":10.0,"type":"holyDome","x":3418.65649414062,"y":6699.56201171875}]}},"skipped":[]}
```

#### ice-orb-05

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/ice-orb-05.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/ice-orb-05.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/ice-orb-05.json`

```text
P2005DIO_RESULT {"assertions":22,"failures":0,"fallback_paths_used":false,"forced_actor_fields":1,"groups":[{"assertions":6,"failures":0,"group":"cast_state_invuln_and_block"},{"assertions":11,"failures":0,"group":"auto_shatter_blades_and_freeze"},{"assertions":5,"failures":0,"group":"freeze_trigger_direct"}],"observations":{"cast":{"expected_cost":50,"mp_spent":50.0},"freeze":{"immune":120.0,"outcome_ok":true},"qa002_test_seed":20261020,"shatter":{"aoe":1,"blades":3,"frozen":0.0,"log":{"base_dmg":408,"blade_dmg":122,"blades":8,"cd":1200.0,"lv":1,"shatter_dmg":122,"skill":"iceShatter"}}},"skipped":[]}
```

#### lighting-headless

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/lighting-headless.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/lighting-headless.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/lighting-headless.json`

```text
P2003A_RESULT {"assertions":10,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":9,"failures":0,"group":"overlay_structure_and_params"},{"assertions":1,"failures":0,"group":"overlay_darkens_screen"}],"observations":{"brightness":"headless_dummy_renderer_probe_covers","params":{"light_a":0.847233870729381}},"skipped":[]}
```

#### lighting-window

원로그: `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/lighting-window.out` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/lighting-window.err` · `/Users/fordeargamers/exoduser-wt/_out/qa-002/post-main-9528ea35/lighting-window.json`

```text
P2003A_RESULT {"assertions":12,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":9,"failures":0,"group":"overlay_structure_and_params"},{"assertions":3,"failures":0,"group":"overlay_darkens_screen"}],"observations":{"brightness":{"off_center":44.0007026741864,"off_edge":38.6287331085814,"on_center":40.0699004620794,"on_edge":29.9017034882507},"params":{"light_a":0.833451723773859}},"skipped":[]}
```

## 부록. c7b21c63 단계 마지막 RESULT 원문

각 고정 대상의 마지막 반복 1개와 조명 두 모드의 마지막 RESULT를 축약 없이 싣는다. 나머지 반복의 마지막 RESULT도 실행별 JSON 및 stdout에 원문으로 보존했다. 그룹 분포·전체 표는 모든 반복을 사용한다.

### fixed/melee-05.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/melee-05.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P1002E_RESULT {"assertions":93,"failures":0,"fallback_paths_used":false,"forced_actor_fields":25,"groups":[{"assertions":15,"failures":0,"group":"providers_ready"},{"assertions":54,"failures":0,"group":"shield_absorb_hits"},{"assertions":24,"failures":0,"group":"overflow_and_kill_pipeline"}],"observations":{"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"final_g":{"_chainCnt":1,"combo":1,"kills":1,"mats":1004,"rifts":0},"kill_hits_total":6,"kill_rng_draws":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"play_time_not_read_on_path":"NOT_READY","provider_statuses":{"el_mul":"READY","eq_affix":"READY","l_eq":"READY","melee_ref":"READY","p_atk_mul":"READY","p_dot_pool":"READY","parry_lesson_active":"READY","play_time":"NOT_READY","player_view":"READY","rand":"READY","stat_str":"READY","u_eq":"READY"},"qa002_test_seed":20261020,"shield_phase_hits":6},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

### fixed/dedicated-03.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/dedicated-03.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P1002F_RESULT {"assertions":357,"failures":0,"fallback_paths_used":false,"forced_actor_fields":201,"groups":[{"assertions":31,"failures":0,"group":"setup"},{"assertions":305,"failures":0,"group":"combat"},{"assertions":21,"failures":0,"group":"per_enemy_coverage"}],"observations":{"aim_basis":{"facing_write_survives_frame":false,"mouse_world":[3060.0,6460.0],"player_pos":[4020.0,7420.0],"pointer_provider_bound":false},"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"halt_count":0,"hits_flesh_crawler":12,"hits_hive_bloater":12,"hits_ice_soul_flame":12,"hits_spine_beast":12,"kill_rng_flesh_crawler":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_hive_bloater":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_ice_soul_flame":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_spine_beast":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"qa002_test_seed":20261020,"swing_log":[{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":277.0,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":272.1,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":16,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":267.2,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":3,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":258.2,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":248.4,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":18,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":243.5,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":239.3,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":234.4,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":229.5,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":224.6,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":219.7,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":214.8,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":18,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":209.9,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":205.7,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":200.8,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":195.9,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":17,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":190.9,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":20,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":181.8,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":167.8,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":163.0,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":158.1,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":153.2,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":148.3,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":2,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":143.4,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":61.1,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":138.6,"t":"flesh_crawler"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":10,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":133.7,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":129.5,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":124.7,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":119.8,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":114.8,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.4,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":109.9,"t":"spine_beast"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":105.1,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":73.9,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":100.2,"t":"ice_soul_flame"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":1,"halts":0,"outcomes":2,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":95.3,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":90.4,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":85.5,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":80.7,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":75.8,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":70.9,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":66.0,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":61.2,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":56.3,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":1,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":51.4,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":47.2,"t":"hive_bloater"},{"accepted":true,"aim_err_deg":0.0,"dist":35.6,"dmg_during":0,"halts":0,"outcomes":1,"p_hp":676.0,"p_state":"swing","p_state_end":"idle","stamina":42.3,"t":"hive_bloater"}],"total_swings":45},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

### fixed/kislash-03.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/kislash-03.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P1002G_RESULT {"assertions":214,"failures":0,"fallback_paths_used":false,"forced_actor_fields":20,"groups":[{"assertions":20,"failures":0,"group":"setup"},{"assertions":161,"failures":0,"group":"combat"},{"assertions":33,"failures":0,"group":"per_enemy_coverage"}],"observations":{"aim_basis":{"facing_write_survives_frame":false,"pointer_provider_bound":false},"cast_damages":[{"damage":1176,"step":1,"tier":0},{"damage":1176,"step":2,"tier":0},{"damage":9408,"step":3,"tier":3},{"damage":1176,"step":1,"tier":0},{"damage":1176,"step":2,"tier":0},{"damage":1176,"step":3,"tier":0},{"damage":1176,"step":1,"tier":0}],"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"halt_count":0,"hits_eye_mass_01":2,"hits_eye_mass_02":1,"hits_flesh_crawler":2,"hits_hive_bloater":2,"hits_ice_soul_flame":2,"hits_spine_beast":2,"kill_rng_eye_mass_01":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_eye_mass_02":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:crystal_id","drop:crystal_star","drop:crystal_quality","drop:stone_gate"],"kill_rng_flesh_crawler":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_hive_bloater":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_edef","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_ice_soul_flame":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:helmet_extra_el","drop:helmet_extra_dmg","drop:helmet_splash_r","drop:helmet_splash_mul","drop:helmet_bonus_range","drop:affix_weight","drop:affix_tierW","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_spine_beast":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"melee_ref":20.0,"qa002_test_seed":20261020,"swing_log":[{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"swing","stamina":272.0,"t":"eye_mass_01"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"swing","stamina":262.3,"t":"eye_mass_01"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"windup","stamina":252.6,"t":"eye_mass_02","windup_hold":130},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"swing","stamina":243.3,"t":"ice_soul_flame"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"swing","stamina":233.6,"t":"ice_soul_flame"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"windup","stamina":224.0,"t":"flesh_crawler","windup_hold":1},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"swing","stamina":214.3,"t":"flesh_crawler"}],"total_casts":7},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

### fixed/death-fx-03.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/death-fx-03.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P2001B_RESULT {"assertions":43,"failures":0,"fallback_paths_used":false,"forced_actor_fields":34,"groups":[{"assertions":5,"failures":0,"group":"assets_and_adapter"},{"assertions":29,"failures":0,"group":"weapon_hit_and_kill_fx"},{"assertions":9,"failures":0,"group":"lifetimes_and_kislash_noimpact"}],"observations":{"final_metrics":{"blood_anims":1,"corpses":1,"death_fx":1,"death_impacts":1,"death_sound_skipped_missing_assets":0,"death_sounds_dispatched":1,"gore_pieces":2,"impacts":7,"rng_calls":296,"stains":1},"kill_metrics":{"blood_anims":1,"corpses":1,"death_fx":1,"death_impacts":1,"death_sound_skipped_missing_assets":0,"death_sounds_dispatched":1,"gore_pieces":2,"impacts":7,"rng_calls":296,"stains":1},"pool_limits":{"corpses":120,"di":12,"gore":120,"impacts":12,"stains":30},"qa002_test_seed":20261020},"skipped":[]}
```

### fixed/kill-rewards-03.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/kill-rewards-03.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P2001C_RESULT {"assertions":45,"failures":0,"fallback_paths_used":false,"forced_actor_fields":33,"groups":[{"assertions":16,"failures":0,"group":"drop_module_pure"},{"assertions":8,"failures":0,"group":"reward_owner_units"},{"assertions":21,"failures":0,"group":"live_kill_rewards"}],"observations":{"death_sound_dispatches":1,"exp_unit":{"exp":5,"lv":2,"maxExp":20,"unported":["SFX.levelup","showPH_LEVEL_UP","_levelUpVfx","dbSaveForce(세이브_금지)","passive_queue(큐_시스템_부재)"]},"kill_journal":{"add_exp":{"combo_bonus":1.0,"exp":6,"levels":0,"lv":2,"raw":5,"unported":["SFX.levelup","showPH_LEVEL_UP","_levelUpVfx","dbSaveForce(세이브_금지)","passive_queue(큐_시스템_부재)"],"value":1},"potion":{"accepted":true,"gate":0.652739715995267,"type":"hp"},"roll_drop":{"crystal":false,"items":0,"stone":false,"unported":["floor_item_render_pickup","playItemDropSfx","_crAutoProcess(기본 OFF)"]}},"pure_draw_tags_b":["drop_gate","drop_rarity","drop_slot","drop_element","atk_skew","base_weapon_antirevive","base_shield_hp","base_shield_st","base_shield_antirevive","base_boots_st","base_boots_hp","base_armor_st"],"qa002_test_seed":20261020},"skipped":[]}
```

### fixed/natural-lmb-03.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/natural-lmb-03.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P2001E_RESULT {"assertions":18,"failures":0,"fallback_paths_used":false,"forced_actor_fields":2,"groups":[{"assertions":10,"failures":0,"group":"new_run_init_refill_and_mats"},{"assertions":8,"failures":0,"group":"natural_lmb_dual_hit_values"}],"observations":{"expected":{"ki":1176,"weapon":162,"wp_atk":5.0},"init":{"activeLMBSk":"kiSlash","mats":1000,"mhp":676.0,"mshield":325.0},"measured":{"attempt":0,"ki":1176,"weapon":162},"qa002_test_seed":20261020},"skipped":[]}
```

### fixed/giant-slam-03.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/giant-slam-03.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P2005B_RESULT {"assertions":12,"failures":0,"fallback_paths_used":false,"forced_actor_fields":1,"groups":[{"assertions":9,"failures":0,"group":"cast_costs_and_damage"},{"assertions":3,"failures":0,"group":"cooldown_gate_and_hud_sweep"}],"observations":{"cast":[{"cd":1800.0,"dmg":280,"hits":1,"lv":1,"radius":500.0}],"cooldown":{"skSlot1":{"pct":0.996666666666667,"text":"29.9s"}},"qa002_test_seed":20261020},"skipped":[]}
```

### fixed/spike-holy-03.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/spike-holy-03.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P2005C_RESULT {"assertions":20,"failures":0,"fallback_paths_used":false,"forced_actor_fields":2,"groups":[{"assertions":12,"failures":0,"group":"spike_trap_cast_zone_and_dot"},{"assertions":8,"failures":0,"group":"holy_dome_cast_regen_and_cd_boost"}],"observations":{"dome":{"presence":true,"zone":{"lv":1,"maxT":750.0,"r":520.0,"t":10.0,"type":"holyDome","x":3418.6611328125,"y":6699.5595703125}},"qa002_test_seed":20261020,"spike":{"cast_log":[{"cd":600.0,"dmg":405,"lv":1,"skill":"spikeTrap"},{"rejected":true,"skill":"spikeTrap"}],"hits":1,"zone":[{"_tickTimer":24.0,"dmg":405,"el":0,"lv":1,"maxT":600.0,"r":300.0,"t":49.0,"type":"spikeTrap","x":3420.0,"y":6700.0},{"lv":1,"maxT":750.0,"r":520.0,"t":10.0,"type":"holyDome","x":3418.6611328125,"y":6699.5595703125}]}},"skipped":[]}
```

### fixed/ice-orb-05.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/ice-orb-05.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P2005DIO_RESULT {"assertions":22,"failures":0,"fallback_paths_used":false,"forced_actor_fields":1,"groups":[{"assertions":6,"failures":0,"group":"cast_state_invuln_and_block"},{"assertions":11,"failures":0,"group":"auto_shatter_blades_and_freeze"},{"assertions":5,"failures":0,"group":"freeze_trigger_direct"}],"observations":{"cast":{"expected_cost":50,"mp_spent":50.0},"freeze":{"immune":120.0,"outcome_ok":true},"qa002_test_seed":20261020,"shatter":{"aoe":1,"blades":3,"frozen":0.0,"log":{"base_dmg":408,"blade_dmg":122,"blades":8,"cd":1200.0,"lv":1,"shatter_dmg":122,"skill":"iceShatter"}}},"skipped":[]}
```

### fixed/lighting-headless.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/lighting-headless.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P2003A_RESULT {"assertions":10,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":9,"failures":0,"group":"overlay_structure_and_params"},{"assertions":1,"failures":0,"group":"overlay_darkens_screen"}],"observations":{"brightness":"headless_dummy_renderer_probe_covers","params":{"light_a":0.885896280999466}},"skipped":[]}
```

### fixed/lighting-window.json

메타데이터: `/Users/fordeargamers/exoduser-wt/_out/qa-002/fixed/lighting-window.json`. stdout/err는 같은 basename의 `.out`/`.err`.

```text
P2003A_RESULT {"assertions":12,"failures":0,"fallback_paths_used":false,"forced_actor_fields":0,"groups":[{"assertions":9,"failures":0,"group":"overlay_structure_and_params"},{"assertions":3,"failures":0,"group":"overlay_darkens_screen"}],"observations":{"brightness":{"off_center":43.1759918681283,"off_edge":39.1508571249579,"on_center":39.1212996587522,"on_edge":30.1906061697855},"params":{"light_a":0.840481245888045}},"skipped":[]}
```
