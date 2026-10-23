# INTEG-17c 쉴드·저장 하니스 통합

| 항목 | 계약 / 근거 |
|---|---|
| 기준 | 67726f74e4b2561c61770a1bd1ff0d42016e455c |
| PC merge | 9e0d218d27293f2180faaf819bd18a5f46aef09d (부모 c8767624); 충돌 없음 |
| 쉴드 | hurtP 모든 감산 뒤 shield 우선 흡수, overflow만 HP. 화상 DOT 포함; shieldRegenT=180; 넉백은 쉴드 처리 뒤 값. PC 구현·테스트 보존 |
| save_handoff | bossroom_gate Retry가 Main/State를 교체하므로 과거 growth p를 비교하면 stale 상태. main.source_state.read_current_p()의 현재 lv를 저장된 player.lv와 비교 |
| 원본 | source_snapshot/game.html G62131–62159, 특히 G62135 현재 P 조회. SHA256 dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209 |
| 제외 | REGRESS-17b 조준 후보·새 조준 테스트 미인수. level_up/stat NOT_READY 조준 문제는 범위 밖 |
| 실행 격리 | 고정 USERDIR 테스트 상수는 실행 중 고유 namespace로만 치환 후 원byte 복원. override.cfg 실행 후 원복. 제품 사용자 폴더 미사용 |
| 브랜치 | 요청한 로컬 branch는 보존 대상 REGRESS-17b에 이미 연결. 새 WT detached merge 후 지정 원격 branch에 정상 push |

검증 결과는 이번 단위 DONE.txt 및 후속 표를 따른다. PC 실기동 확인을 뜻하지 않는다.

| 추가 하니스 | 원인·검사 보존 |
|---|---|
| starter_state public_actor_sync | 부팅 shield=mshield(≥100)이므로 HP−100 검사의 사전조건으로 현재 P.shield=0 설정. HP 감소·ST/MP·identity 단정은 그대로 유지. PC m29/boss 동일 원인과 같은 방식이며 제품 초기화 변경 없음 |

## 검증 결과

import 첫1회 exit0 / ERROR0. 캐시 복사0. 단위 테스트 각1회, 재실행0. E2E 최종1회 13 PASS / 5 NOT_READY / FAIL0, ERROR0.

| 테스트 | 검사 | 실패 | ERROR | 실행 |
|---|---|---|---|---|
| pc_player_shield | 166 | 0 | 0 | 첫1회 exit0 |
| pc_m29_parry | 101 | 0 | 0 | 첫1회 exit0 |
| pc_boss_parity | 44 | 0 | 0 | 첫1회 exit0 |
| pc_combat_kill | 47 | 0 | 0 | 첫1회 exit0 |
| pc_move_skills | 271 | 0 | 0 | 첫1회 exit0 |
| pcia_wire_life | 13 | 0 | 0 | 첫1회 exit0 |
| native_main_source_starter_state | 148 | 0 | 0 | 첫1회 exit0 |
| parity_hud_01 | 17 | 0 | 0 | 첫1회 exit0 |
| demo11_07_lobby_entry | 56 | 0 | 0 | 첫1회 exit0 |

| # | E2E 단계 | 결과 | 사유 |
|---|---|---|---|
| 1 | isolation | PASS |  |
| 2 | new_game | PASS |  |
| 3 | character_create | PASS |  |
| 4 | intro_skip | PASS |  |
| 5 | field_MAP11 | PASS |  |
| 6 | enemy_kill | PASS |  |
| 7 | item_pickup | PASS |  |
| 8 | equip | PASS |  |
| 9 | auto_potion | PASS |  |
| 10 | level_up | PASS |  |
| 11 | stat_passive_invest | PASS |  |
| 12 | revival_interface | PASS |  |
| 13 | bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| 14 | boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| 15 | clear | NOT_READY | clear consumer did not accept contract |
| 16 | demo_end | NOT_READY | next/end route not admitted |
| 17 | save_handoff | PASS |  |
| 18 | lobby_return | NOT_READY | actual lobby navigation not completed |

level_up/stat 이번 자연 실행 PASS. 조준 후보 미인수이며 기존 조준 문제의 근본 해결로 선언하지 않는다. 보스방/처치/클리어/종료/로비는 미도달. 테스트는 명시 fixture를 포함하나 E2E 상태 주입0.

07 종료 ObjectDB leak warning51은 남아 있으며 ERROR0과 구분한다. 자기 Godot 종료·override 제거 후 원격 SHA 대조 및 WT 제거 결과는 DONE.txt에 기록한다.
