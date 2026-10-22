# INTEG-15b PC 전투·보행 통합과 Mac 요청 1~3

| 항목 | 계약·처리 |
|---|---|
| 기준 | origin/codex/demo11-integ15-20261022 `98ca5fc72fb5abdfd30872d1f3deb923e67b4f18` |
| merge 입력 | origin/claude/pc-combat-kill-20261022 `f8caec9552d7bebdca202b733a91a2b2f327dc91`; merge만 사용 |
| 충돌 | docs/CHANGELOG_SYNC.md 머리 두 절. INTEG-14 및 PC-COMBAT-KILL 양쪽 이력 보존. 코드 충돌0 |
| 소유 | PC 전투·보행 구현/테스트 인수, Mac UI·맵·HUD는 INTEG-15 그대로. 원본 snapshot dee094fd 그대로 |
| 요청1 | `_record_unoriginated_kill` 동작 그대로 인수. `record_actor_kill`이 `_origins` 보유 actor를 기존 경로로만 보내므로 소환굴 출신은 신규 훅 제외. boss `native_final.ib` 제외, 등록된 dead/hp<=0만, 성공 후 instance ID별 1회. `_homeX/_homeY`→requested_spawn_position→현재 위치로 provider.region_at 조회. 원본 현행 `_regKill` 60730–60733(PC 과거60728–60731 +2)과 스폰 귀속 대조. 신규 목록 API/ResourceLoader/틱 할당0 |
| 요청2 | native_natural_enemy_actor 주석: 포이즈는 공용 코어가 처리. exact v3 domain 불변 |
| 요청3 | enemy/enemy_melee_flesh_crawler/enemy_tank_physical_spine_beast/enemy_tank_ice_soul_flame/enemy_archer_lightning_hive_bloater의 생성 및 enemy 부활 `collision_mask=1`. native_dedicated_enemy_hurte_owner 공용 부활도 1. layer4 유지, 지형/소품 layer1 유지, 플레이어 layer2 제외. 탄의 mask1\|2는 피격 판정이므로 유지. 보스 body0·34349 밀어내기 불변 |
| 이동·접촉 | 기존 world.can_move 및 거리 `< radius+player.radius+contact_extra_radius`·cooldown/iframe 판정 유지. 몸체 충돌만 제거, 공격 거리/피해/포이즈/보상 수치 변경0 |
| 저장·실행 | 매 실행 UUID namespace, 실제 사용자 저장 폴더 금지. 단위 storage off, E2E on. PID81277 보존/상한3, R import0 |

단회 테스트·18단계 E2E·GUI·성능 결과는 완료 시 아래에 기록한다. PC Windows 재검수·사용자 직접 플레이는 후행이며 Mac 실행을 PC 완료로 환산하지 않는다.

## 실패·실행 이력 보존

| 구분 | 원인·소유·처리 |
|---|---|
| combat_kill 단회 | 33단정/1실패, SCRIPT ERROR2. curtain21/0·walk7/0·domain_negative4/0. Group-A 기존맵 fixture의 지역 provider 바인딩 거절: native_regions.install_stage_spawn_budget가 null인 read_native_map11_provider().get_script() 호출. PC fixture/맥 지역 adapter 계약 경계이며 실제 MAP11 처치 실패와 구분. 제품·테스트 단정 수정/재실행0 |
| 실행 사본 실수 | 초기 임시 파일명으로 실행한 pack_b는 자기 resource_path 검사가 달라져 legacy map 분기 미진입, pack_b_mac은 상속 base USERDIR 미변환으로 SKIP. 유효 검사로 세지 않으며 원로그 보존. m29는 첫1회 정상 PASS. final_death 실행 중 정상 하니스 finally 종료·override 복원 후 재개 |
| 교정 실행 | 원래 테스트 resource_path·상속 유지, 실행 중 namespace literal만 UUID로 바꿨다가 원바이트 finally 복원. pack_b378/0·pack_b_mac402/0. 초기 무효 시도가 있으므로 모든 실행 총1회라고 주장하지 않는다. 완료된 유효 combat_kill·m29는 반복0 |
| 원본 유지 | PC 코드/테스트는 지정 branch merge, Mac 변경은 요청1~3. PC 테스트·oracle 기대값·금지 dependency 목록·원본 snapshot 변경0 |


초기 공통 namespace 선택도 intro/HUD/map04의 개별 begins_with 접두사와 달라 격리 guard에서 중단됐다. 각각 기존 INTEG-15 하니스의 정확한 접두사를 사용해 교정 호출하며 첫 무효 로그는 tests/, 교정 호출은 tests-invocation-corrected/에 분리한다. 단정/기대값/제품 상태 대입으로 guard를 약화하지 않는다. 테스트 실제 실행 시도 총횟수와 유효 기능검사 1회를 구분한다.

## 단회 기능검사 최종 결과

import 포함 42항목: 하니스 PASS40 / non-PASS2(combat_kill 실제 FAIL, map04 결과 schema FAIL). HS-M7 19/19 PASS, nw01~03 7215/0. 초기 무효 호출과 교정 호출은 앞 절 및 test-attempts.json에 분리 보존했다. 각 유효 기능검사1회, E2E1회. import ERROR0.

| 테스트 | 검사 | 실패 | exit | ERROR | 판정 |
|---|---:|---:|---:|---:|---|
| import | — | — | 0 | 0 | PASS |
| test_boss_ch1_bc10_control | 165774 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_02_reuse | 44891 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_03_new_start | 25749 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_04_vortex | 41373 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_05_bean_rain | 35164 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_06_fan_wave | 46009 | 0 | 0 | 0 | PASS |
| test_boss_ch2_bc2_07_shield_bash | 30191 | 0 | 0 | 0 | PASS |
| test_boss_ch3_bc3_01_catalog | 43491 | 0 | 0 | 0 | PASS |
| test_ch2_01_stage4_source | 362 | 0 | 0 | 0 | PASS |
| test_demo11_08_story_intro | 12 | 0 | 0 | 0 | PASS |
| test_demo11_16_dispatch | 393 | 0 | 0 | 0 | PASS |
| test_native_map_object_action_proposal | 3060 | 0 | 0 | 0 | PASS |
| test_native_player_portal_proposal | 1851 | 0 | 0 | 0 | PASS |
| test_native_world_interaction_query | 2304 | 0 | 0 | 0 | PASS |
| test_p1002e_melee_hurte | 94 | 0 | 0 | 0 | PASS |
| test_p1002f_dedicated_hurte | 358 | 0 | 0 | 0 | PASS |
| test_p1002g_kislash_hurte | 221 | 0 | 0 | 0 | PASS |
| test_p3004a_ch1_area_source | 63 | 0 | 0 | 0 | PASS |
| test_p3004c_ch1_stage1_source | 75 | 0 | 0 | 0 | PASS |
| test_parity_boss_01 | 276 | 0 | 0 | 0 | PASS |
| test_parity_hud_01 | 17 | 0 | 0 | 0 | PASS |
| test_parity_map_04 | — | [] | 0 | 0 | FAIL |
| test_parity_ui_05 | 15 | 0 | 0 | 0 | PASS |
| test_pc_combat_kill | 33 | 1 | 1 | 2 | FAIL |
| test_pc_combat_pack_b | 378 | 0 | 0 | 0 | PASS |
| test_pc_combat_pack_b_mac | 422 | 0 | 0 | 0 | PASS |
| test_pc_enemy_revive | 51 | 0 | 0 | 0 | PASS |
| test_pc_final_death | 61 | 0 | 0 | 0 | PASS |
| test_pc_hud_stats | 199 | 0 | 0 | 0 | PASS |
| test_pc_m29_parry | 101 | 0 | 0 | 0 | PASS |
| test_pc_move_skills | 256 | 0 | 0 | 0 | PASS |
| test_pc_player_life | 101 | 0 | 0 | 0 | PASS |
| test_pc_skill_writers | 80 | 0 | 0 | 0 | PASS |
| test_pcib_mac_calls | 31 | 0 | 0 | 0 | PASS |
| test_sound_source_backend | 2004 | 0 | 0 | 0 | PASS |
| test_sound_source_bgm_lifecycle | 2400 | 0 | 0 | 0 | PASS |
| test_sound_source_bgm_selection | 1308 | 0 | 0 | 0 | PASS |
| test_sound_source_cue_recipes | 133 | 0 | 0 | 0 | PASS |
| test_sound_source_mix | 5728 | 0 | 0 | 0 | PASS |
| test_sound_source_queue | 606 | 0 | 0 | 0 | PASS |
| test_sound_source_voice_selector | 2435 | 0 | 0 | 0 | PASS |

map04 원문은 16 PASS·실패[]·exit0·ERROR0. mac_harness의 `failures != 0` 비교가 빈 배열을 FAIL로 분류한다. 하니스/원문 기대값 변경0. combat_kill의 두 SCRIPT ERROR는 기존맵 fixture에서 null MAP11 provider를 조회한 동일 지역 owner 경계다. PC Windows 원보고47/0을 이번 Mac33/1로 덮지 않으며 둘 다 해당 환경의 증거로 보존한다.

## E2E — storage on, 18단계 단1회

13 PASS / 5 NOT_READY / 0 FAIL, exit0, ERROR0, overall NOT_READY. 자연 근접 공격2회/승인2회로 처치, R 실제 줍기·장착·자동 물약·레벨업·스탯 투자·자연 사망/부활 인터페이스·저장 인계 통과. HP/피해/위치/처치/드랍/XP/지역 원장 주입0. 자동 석궁은 해당 처치 단계1발·1hit·0last-kill이며 근접 처치와 구분한다.

| 단계 | 결과 | 사유 |
|---|---|---|
| isolation | PASS |  |
| new_game | PASS |  |
| character_create | PASS |  |
| intro_skip | PASS |  |
| field_MAP11 | PASS |  |
| enemy_kill | PASS |  |
| item_pickup | PASS |  |
| equip | PASS |  |
| auto_potion | PASS |  |
| level_up | PASS |  |
| stat_passive_invest | PASS |  |
| revival_interface | PASS |  |
| bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| clear | NOT_READY | clear consumer did not accept contract |
| demo_end | NOT_READY | next/end route not admitted |
| save_handoff | PASS |  |
| lobby_return | NOT_READY | actual lobby navigation not completed |

## GUI 직접 플레이와 캡처

읽기 전용 외부 관측기와 CUA OS 입력으로 실제 로비→새 캐릭터→캐릭터 서사→Main INTRO→조작 안내·실습 skip→필드를 통과했다. 텍스트 입력은 Godot 한글 typeText가 빈 값이어서 실제 붙여넣기를 사용했다. 메타데이터는 로비 실제 진입과 source root 부팅용만, HP/공격력/피해/드랍/처치/위치/RNG/원장 변경0. 관측기의 read_current_* 반환 Dictionary는 읽기만 했다. 성능은 이 관측기와 별도 실행했다.

| 관측 | 실제 결과·한계 |
|---|---|
| 첫 OS W | 1799ms / 108 physics frames, (4020,7417.206)→(4018.420,7134.795), 282.415px. 적 접촉·피격/넉백이 섞여 있고 lateral1.58px. 무피격 속도 동등성으로 주장하지 않음 |
| 캡처 보완의 별도 새 실행 W | 1789ms / 107 physics frames, (4020,7417.273)→(4020,7125.479), 291.794px. 축 이탈0; 장비 롤에 따른 약2.727px/tick×107과 일치. PC294.3/웹298.4는 별도 실행 근거이며 같은 RNG/장비/time fixture가 아님 |
| 자연 근접·R 줍기 | g.kills1, 가방10→11. GUI 인벤토리11/300 직접 확인. 이후 자연 사망도 기록. native_combat_readback·gui-events/trace 보존 |
| 자동 석궁 | 첫 전투8발/12hit/0last-kill. 별도 회피 시도12발/15hit/0last-kill, HP0. GUI 석궁 마지막 일격 처치는 미확인, 성공으로 승격0 |
| 사망 후 재시작 | 첫 직접 플레이 사망 뒤 시간0·적이 보이지 않는 상태를 관측. 재시작/reconstruction·커튼 재스폰 재검수 필요. 별도 fresh run에서 근접·줍기 확인과 구분 |
| 신호11 | 이번 실행들의 부팅 signal11 발생0. 첫 전용 앱 복사본은 bundle ID 변경으로 서명 검증 실패, 엔진 출력 전 exit−9. 외부 사본만 ad-hoc 재서명 후 사용. 보호PID81277·원본 Godot앱 수정0 |
| 격리 guard 이력 | 첫 GUI namespace가 demo11 접두사 밖이어서 저장 거절. 종료/새 namespace로 복구, guard 약화0. 이어 정상 ready=true 진단, 실제 사용자 저장 경로 사용0 |

캡처는 `_out/INTEG-15b/captures/`의 character_compare_1x.png·field_walk_compare_1x.png·inventory_loot_compare_1x.png 세 장이다. 좌 웹/우 Godot, 각 원본1920×1080. native field는 CUA 실제 창1920×1144의 titlebar64px만 제거했다. 이미지 배경/게임 내용 변경0. 웹은 dee094fd snapshot을 Node server.cjs의 해당 URL에 그대로 제공하고 누락된 three-r186 build를 기존 로컬 vendor로 제공했다. 웹 상태 주입0; 브라우저 캐릭터 생성이 제품 자체 URL `test=1&slot=demo&demo=1`로 이동한 것이며 테스트 편의값을 대입하지 않았다.

첫 웹 캐릭터 저장은 배경 로딩 전, 첫 native field 저장은 사망 후였다. capture-timing-attempts/에 보존하고 화면 직접 확인 후 재촬영했다. 파일 준비만으로 캡처 성공을 선언하지 않았다. E2E·단위 기능검사 재실행0, GUI 캡처용 새 실행은 별도 새 namespace다. 웹 console error2건은 도구가 message Object로 반환해 상세 원인 미확정이며 web-errors.json에 보존한다. 웹 pageerror/404 전수0이라고 주장하지 않는다.

| 비교 | 직접 시각 판정 |
|---|---|
| 캐릭터 | 동일 원화·중앙 캐릭터/좌 설명/우 특성/하단5선택 구조. native 제목/본문 폰트·라벨/아이콘·잠김 표현·버튼 크기 차이. 웹 영상 재생 불가/정적 폴백 관측. RETOUCH |
| 필드 | 원본 맵/미니맵/HUD 구조 유지. independent runtime 웹00:02/native00:14, 펫·소환진·적/이펙트 위상·RNG 수치 상이. native 적 몸체 통과·거리 접촉 공격 실관측; 필드 밝기/효과·HUD 글꼴 차이 잔여. RETOUCH |
| 인벤토리 | 장비·중앙 가방·오른쪽 기록 구조 유지. 웹가방10/native11은 실제 줍기 차이. native 장착부위16/16 대 웹15/16(양쪽 belt빈칸) 표시 차이는 RNG만으로 설명하지 않으며 기존 HUD/UI 소유자 후행. 아이콘/수치·글꼴/간격 차이. RETOUCH |

## GUI 성능·메모리 — 단1회

1920×1080 실제 CH1-1 시작 필드, GUI10초, focus loss0, 1892frames, enemy_count13. p95=8.213ms / p99=8.933ms, render_draw_calls311. 엔진 RENDER_VIDEO_MEM_USED p95=3,096,957,581 bytes(약2.884GiB), texture=3,045,267,053 bytes. Mac 공유 메모리 엔진 monitor이며 PC 전용 VRAM/전체맵 상주량/밀집전투 결과가 아니다. p99는8.333ms 목표를 넘는다. 이 실행은 직접 Main 필드 부팅으로, 수동 로비 종주 증거와 별개다. 다른 자기 Godot suite/웹게임과 겹치지 않았다.

## MAP PRODUCTION REPORT

STAGE: CH1-1 통합 플레이/시각 검수, 신규 맵 제작0.
MASTER: silhouette/regions/main route/side spaces 전부 INTEG-15 유지.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH·major holes 변경0.
LARGE: source assets/composites/overlap/repeated silhouette 변경0.
MEDIUM: connections/remaining holes 변경0.
GROUND: shadow/contamination/structure integration 변경0.
PLAYABLE: main arenas/travel/breathing/threat 공간 변경0; 일반 적↔플레이어 몸체 충돌만 제거. combat readability 완성 승인0.
LANDMARK: primary/secondary/tertiary 변경0.
CAMERA QA: START 및 자연 W 이동/근접·줍기 확인. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체 카메라 종주 미검수.
TECH QA: map04 원문16PASS/schemaFAIL; 지형·소품 충돌 유지; pageerror/404/seam 새 전수검수0; importERROR0; performance 위 한정결과.
FILES: 맵 파일 변경0, Mac 일반 적 마스크/주석 및 spawn adapter 인수 주석. UI/맵/HUD 제품 변경0.
GIT: 정상hook/명시경로add/지정branch 비강제push, main push/force/reset/rebase/deploy0.
VISUAL VERDICT: RETOUCH.
NEXT PASS: PC Windows 재검수·사용자 직접 플레이, GUI 석궁 last-kill·사망 후 필드 reconstruction, 지역 fixture null provider·map04 하니스 schema·native 장착부위 표시 소유자 후행.
