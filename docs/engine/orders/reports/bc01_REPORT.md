# bc01 — 1장 보스 정적 catalog 구현 보고서

## 결과와 인수 범위

BC01은 1장 네 보스 슬롯의 **원본 등록 데이터만** 제공하는 독립 RefCounted 모듈이다. Main·actor·AI·HP 계산·전투·HUD·저장 연결은 없다. 새 파일 두 개와 허용된 이 보고서·CHANGELOG_SYNC만 변경한다. 테스트 완료 결과는 아래 로그 확인 후 기록한다.

| 항목 | 근거 |
|---|---|
| 작업 / 브랜치 | `bc01` / `codex/bc01-20261020` |
| 기준 main | fetch 후 `c3cf8ce6b0cc1a5c381240260e03dff71c68af8d` |
| worktree | `/Users/fordeargamers/exoduser-wt/bc01` |
| 지시서 | trace-boss-ch1 제출 `ebfebae6f829b8a51662aa3fc46cda97a2ed863c`의 `FDG_SOURCE_TRACE_BOSS_CH1_20261020.md` §BC01. 기준 main에는 아직 해당 추적 문서가 없어 제출본을 git show로 읽었으며 복사·병합하지 않음 |
| 원본 SHA256 | game.html=`4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; 추적 때와 동일 byte |
| 실행 도구 | `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`, `4.7.2.stable.official.ed1daf0bf` |
| 원로그 | `/Users/fordeargamers/exoduser-wt/_out/bc01/`; 각 실행 `.out/.err/.json`, 필요시 `.engine.log` |
| R | branch=`codex/mac-live-play-time-main-20261017`, HEAD=`dd49171c5b88e211575a41f185395d6c0a14b184`; 시작 tracked INDEX/WORK 각각 clean. R 브랜치 전환·파일 수정·커밋 없음 |

## 시작 소유 확인

fetch 직후 WORK_BOARD의 보스 관련 행을 읽고 `work-board-start.md`로 보존했다. 다른 담당의 BC01/보스 catalog 구현 행과 신규 파일 소유는 없었다. `TRACE-BOSS-CH1`의 진행 중 표기는 이 창에서 직전 제출한 문서 작업이며 최신 사용자의 BC01 후속 지시로 이어졌다. 다른 담당의 일반 몹/P2-008a·P2-008b·지역·소환굴·사운드 파일은 변경하지 않는다. 공용 작업판은 이 작업의 ‘신규 코드·테스트와 지정 docs’ 범위에 포함하지 않아 수정하지 않고 본 보고서로 전달한다.

## 파일·원본 계약

| 파일 | 변경 |
|---|---|
| `godot/scripts/native_ch1_boss_catalog.gd` | 신규. static API 6개·정적 literal·깊은 복사 반환. 실행 의존/IO/RNG 없음 |
| `godot/tests/test_boss_ch1_bc01_catalog.gd` | 신규. 원본에서 독립 추출한 literal oracle, 7그룹·copy/error 경계. Main/actor 생성0 |
| `docs/engine/orders/reports/bc01_REPORT.md` | 신규 구현·검수 보고서 |
| `docs/CHANGELOG_SYNC.md` | pre-commit 요구대로 맨 위 기존 표 형식 절 추가. 이전 내용 보존 |

Godot가 실제 생성한 자기 신규 `.uid`가 있을 경우 그 두 파일만 함께 포함한다. 기존 6개 공용 파일·기존 테스트·project.godot·원본 HTML·보호 설계 docs 수정은 0이다. 별도 시스템 설계 문서를 고쳐 수치/구현 완료 범위를 확대하지 않는다.

| 원본 game.html 행 | 계약 / 유지 값 |
|---|---|
| 9820–9880 | BOSS_MOVES 59개 manifest의 id/idx/ordinal/line; 1장 union 24개는 원필드11개와 source_ordinal/source_line 모두 전사 |
| 9881–9950 | BOSS_COMBOS 전체68 중 1장 Set에 seq 전체가 포함되는 union27개의 seq/phase/원ordinal/line |
| 9951–9957 | BOSS_PHASES 5개·각8필드 원값/문자. phase/HP 계산이나 강화 실행은 이번 단위에 없음 |
| 9960–9967 / 10009–10010 | si3 cageTrap 제거 후 si0=si3 복사. 최종 Set크기 `[23,21,10,23]`, 삽입 순서 보존. 초기 si0의 teleStrike 사용0 |
| 16688–16695 | 이름 `[다크드루이드,독버섯 거인,지옥기형,다크드루이드]`; hell0/EL.P=0/ib true/etype0 식별 metadata |
| 37699 | 얼굴집합은 관련 근거일 뿐 새 score·Q/E 분류 API로 구현하지 않음 |

| API | 결과 |
|---|---|
| source_receipt | 기준 main·HTML 해시·59/68/24/maxidx60·원본 행·전체59 manifest의 독립 복사 |
| boss_for_stage(si) | si0..3의 metadata/최종 Set 삽입 순서. 범위 밖은 supported=false/unsupported_chapter_stage |
| moves_for_stage(si) | Set 허용 기술을 원본 BOSS_MOVES ordinal 순으로 반환. 범위 밖 [] |
| move_by_id(id) | 1장24개만 제공, 원필드+metadata. 미등록/타장/cageTrap/teleStrike는 {} |
| phase_by_index(phase) | 0..4의 원본8필드, 범위 밖 {} |
| combos_for_stage(si,phase) | 원ordinal 순서·seq 전체 Set 포함·원 phase 필터. 범위 밖 [] |

명시 idx30/59의 공백과 idx60을 보존한다. 24기술을 0..23으로 재번호 부여하지 않는다. 기술의 combo metadata와 BOSS_COMBOS.seq를 합치지 않는다. rec는 실행 recover 시간으로 재해석하지 않는다. 네 슬롯의 phase별 후보수는 si0/3=`[14,23,25,25,25]`, si1=`[14,22,24,24,24]`, si2=`[9,13,14,14,14]`; phase 미필터 전체수 25/24/14/25다.

## 검증과 실제 로그

새 BC01은 자기 `_out/bc01/catalog-project`의 최소 프로젝트에서 두 신규 파일을 동일 byte로 복사해 실행한다. 설정의 custom_user_dir_name과 OS 실제 폴더 이름을 모두 검사하며 사용자 지정 `EXODUSER-bc01-Isolated-20261020`만 허용한다. Main을 부팅하지 않으므로 override.cfg를 만들지 않는다. 이 검사는 제품 경로 연결이나 보스 전투 인수가 아니다.

첫 `bc01-01`은 Godot exit0이었지만 parse ERROR2줄/RESULT 없음으로 **실패**다. 테스트의 `var isolated :=` 타입 추론을 명시 `bool`로 고친 후 같은 신규 검사만 재실행했다. 최초 로그는 덮어쓰지 않았다.

| 검사 | 결과 | exit | stderr ERROR 줄 | 초 | 원로그 basename |
|---|---|---:|---:|---:|---|
| 신규 최초 | 실패: parse ERROR/RESULT 없음 | 0 | 2 | 0.257 | `bc01-01` |
| 신규 수정 후 | 681단정/0실패/skip0 | 0 | 0 | 0.465 | `bc01-02` |
| cold import | 완료 | 0 | 0 | 99.372 | `import-01` |
| test_contracts | 5/5 case·failed_assertions0 | 0 | 0 | 6.322 | `contracts-01` |
| test_p3003_regions | 43단정/0실패 | 0 | 0 | 19.926 | `regions-01` |
| test_p3002_spawn_holes | 298단정/0실패/skip0 | 0 | 0 | 21.542 | `spawn-holes-01` |
| test_encounter_factory | 3/3 case·failed_assertions0 | 0 | 0 | 8.753 | `factory-01` |
| test_p1002g_kislash_hurte | 220단정/1실패(알려진 선재) | 1 | 0 | 44.081 | `kislash-01` |

각 basename의 `.out/.err`는 원문, `.json`은 정확한 argv/cwd/격리 이름·시작시각·exit·ERROR·RESULT다. cold import는 Main을 실행하지 않아 override를 만들지 않았으며 엔진 로그를 자기 `_out`에 지정했다. 새 검사와 회귀를 모두 통과했다고 묶어 표시하지 않는다.

### 알려진 p1002g 선재 실패 원문

사용자가 지정한 P2-008a etype20 결함으로 별도 기록한다. 수리·기대값 변경·재실행으로 지우지 않았다. 아래는 해당 stdout의 FAIL/GROUP/RESULT 원문이며 전체 stdout·stderr도 보존했다.

```text
P1002G_GROUP {"assertions":20,"failures":0,"group":"setup"}
P1002G_GROUP {"assertions":167,"failures":0,"group":"combat"}
P1002G_FAIL per_enemy_coverage no native_hurte_halt emitted across combat
P1002G_GROUP {"assertions":33,"failures":1,"group":"per_enemy_coverage"}
P1002G_RESULT {"assertions":220,"failures":1,"fallback_paths_used":false,"forced_actor_fields":20,"groups":[{"assertions":20,"failures":0,"group":"setup"},{"assertions":167,"failures":0,"group":"combat"},{"assertions":33,"failures":1,"group":"per_enemy_coverage"}],"observations":{"aim_basis":{"facing_write_survives_frame":false,"pointer_provider_bound":false},"cast_damages":[{"damage":1352,"step":1,"tier":0},{"damage":1352,"step":2,"tier":0},{"damage":10819,"step":3,"tier":3},{"damage":1352,"step":1,"tier":0},{"damage":1352,"step":2,"tier":0},{"damage":1352,"step":3,"tier":0},{"damage":1352,"step":1,"tier":0}],"expected_stat_crit":0.0,"expected_stat_crit_dmg":1.5,"halt_count":6,"hits_eye_mass_01":2,"hits_eye_mass_02":1,"hits_flesh_crawler":2,"hits_hive_bloater":2,"hits_ice_soul_flame":2,"hits_spine_beast":2,"kill_rng_eye_mass_01":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:stat_bonus_st","drop:boots_charge_charge","drop:armor_stat_count_r1","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_eye_mass_02":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_edef","drop:bracelet_type","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:crystal_id","drop:crystal_star","drop:crystal_quality","drop:stone_gate"],"kill_rng_flesh_crawler":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:drop_rarity","drop:drop_slot","drop:drop_element","drop:atk_skew","drop:base_weapon_antirevive","drop:base_shield_hp","drop:base_shield_st","drop:base_shield_antirevive","drop:base_boots_st","drop:base_boots_hp","drop:base_armor_st","drop:base_armor_hp","drop:base_bow_antirevive","drop:base_gloves_hp","drop:base_gloves_st","drop:base_pants_st","drop:base_pants_hp","drop:base_cape_hp","drop:base_cape_st","drop:base_belt_shield","drop:base_belt_mp","drop:base_necklace_shield","drop:base_necklace_mp","drop:base_ring1_shield","drop:base_ring1_mp","drop:base_ring2_shield","drop:base_ring2_mp","drop:base_bracelet_shield","drop:base_bracelet_mp","drop:base_headband_shield","drop:base_headband_mp","drop:base_ossuary_mp","drop:item_id","drop:stat_def","drop:stat_bonus_st","drop:stat_charge","drop:stat_charge_w","drop:armor_bonus_range","drop:armor_bonus_charge","drop:armor_stat_count_r1","drop:affix_weight","drop:affix_value","drop:affix_weight","drop:affix_value","drop:implicit_value","drop:drop_jitter_x","drop:drop_jitter_y","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_hive_bloater":["crit","normal_revive","revive_as_ghoul","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_ice_soul_flame":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","death_zone","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate"],"kill_rng_spine_beast":["crit","normal_revive","gore_common_or_rare","gore_piece_index","gore_large_extra","potion_gate","potion_type","drop:drop_gate","drop:bone_gate","drop:crystal_gate","drop:stone_gate","drop:stone_tier","drop:stone_quality"],"melee_ref":23.0,"swing_log":[{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"swing","stamina":228.0,"t":"eye_mass_01"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"swing","stamina":218.3,"t":"eye_mass_01"},{"accepted":true,"dist":120.0,"halts":0,"outcomes":1,"p_state":"windup","stamina":208.6,"t":"eye_mass_02","windup_hold":130},{"accepted":true,"dist":120.0,"halts":0,"outcomes":2,"p_state":"swing","stamina":199.3,"t":"ice_soul_flame"},{"accepted":true,"dist":120.0,"halts":2,"outcomes":4,"p_state":"swing","stamina":189.6,"t":"ice_soul_flame"},{"accepted":true,"dist":120.0,"halts":2,"outcomes":5,"p_state":"windup","stamina":179.9,"t":"hive_bloater","windup_hold":1},{"accepted":true,"dist":120.0,"halts":2,"outcomes":3,"p_state":"swing","stamina":170.2,"t":"flesh_crawler"}],"total_casts":7},"public_attack_api_used":true,"public_play_evidence":false,"skipped":[]}
```

Main 부팅 회귀는 기존 테스트의 USERDIR 상수를 그대로 사용하고, 매 실행의 finally에서 자기 worktree override.cfg를 비운다. USERDIR 상수가 없는 test_contracts/encounter_factory는 자기 `_out`의 별도 프로젝트에서 실행했다. project.godot은 원본과 custom_user_dir_name만 다르고 나머지 코드·테스트·assets·cache 경로는 이 작업의 자기 worktree로만 연결한다. 격리 이름은 EXODUSER-bc01-Contracts-Isolated-20261020 / EXODUSER-bc01-Factory-Isolated-20261020이며 override.cfg 생성0. 원본 프로젝트 파일·테스트 수정0. encounter_factory의 MainScript.new는 씬 트리에 부팅하지 않는 metadata 검사다. 기존 테스트 본문·기대값·제품 코드는 수정하지 않는다. 알려진 p1002g/P2-008a 선재 실패는 원문 기록만 하며 수리하지 않는다.

## 보호·한계·소스 보존

`docs/2_3`, Q/E·입력·패링 분류, 세이브 형식은 **보호**이며 변경0. 원본 game.html의 HP/무브/공식과 수치는 변경하지 않는다. 공용 `main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd` 및 실행한 기존 테스트는 preflight SHA256과 다시 대조한다. 새 catalog는 자동 등록/호출되지 않으며 보스 실제 이식 진행률·실플레이·성능·시각 PASS를 주장하지 않는다. PC 실행은 미확인이다.

관련 docs 전체 검색은 `docs-keyword-scan.txt`에 보존했다. 새 구현 상태와 정확한 등록 수치는 이 보고서와 CHANGELOG_SYNC에 반영한다. 기존 설계 수치와 미이식 AI/전투 상태는 그대로다. pre-commit의 docs-sync-check를 사용하며 우회 환경 변수·no-verify는 쓰지 않는다.

| 마감 확인 | 실제 결과 |
|---|---|
| 변경 소유 | 신규 제품 .gd/.uid, 신규 테스트 .gd/.uid, 신규 보고서, 허용된 CHANGELOG_SYNC 맨 위 절: 총6경로만 스테이징 |
| 코드·원본 보존 | 공용6파일·원본HTML2·기존테스트5·project.godot preflight SHA256 모두 동일 |
| 격리 종료 | Main 회귀 override.cfg 없음. 실제 사용자 프로젝트 설정/슬롯/입력 파일 수정0 |
| 전역 보존 | editor_settings-4.7.tres는 import/회귀 전 사본과 동일 SHA256 |
| 스테이징 | .gitignore:5의 광범위 test_*가 요청한 신규 test .gd/.uid를 제외하므로 그 두 경로만 git add -f -- 로 명시 등록. ignore 규칙·다른 파일 변경 없음. 브랜치 이력 강제 변경·force push 없음 |
| 훅 | 기존 .githooks/pre-commit의 docs-sync-check를 정상 실행. 보고서와 CHANGELOG 포함, 우회 환경 변수 없음 |
| 제출 판정 | BC01 데이터 계약 검수 완료·검수 대기. 회귀4종 실패0, p1002g 선재1실패 원문 보존. 보스 실제 전투 인수 아님 |
