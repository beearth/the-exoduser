# PCIA-WIRE-c — E2E 생존 단계 우선 순서

기준 origin/codex/demo11-pcia-wire-20261021 c32f21afc3b7b8c44bc3f6a2ff22a6e7133212af. 제품 코드·PC 계약·전투 코어·맵 비주얼 변경 없음.

| 하네스 변경 | 내용 |
|---|---|
| revival_interface | 7번째에서 12번째로 이동. item_pickup/equip/auto_potion/level_up/stat_passive_invest 이후, bossroom_gate 이전 |
| 순서 검증 | GDScript ORDER 및 tools/godot-tools 진단 계약 ORDER 동일 변경 |
| 제거 | 부활 관측 전후 픽업 위치 저장·복귀 제거. 이제 픽업은 처치 위치에서 먼저 수행 |
| 보호 | 기존 자연 AI 피격·fallen·countdown·resolve 관측 유지. 부활 단계 HP/iframe/RNG/생명 신호 주입0, 강제 회복·재시작0 |

import 1회 exit0/ERROR0. E2E 1회 --demo11-storage=on exit0/ERROR0/contract validation0. Python 계약 테스트 5건 PASS.
격리 userdir /Users/fordeargamers/Library/Application Support/EXODUSER-demo11-47h-Isolated-20261021. 실제 First 저장소 접근0. headless 관측이며 시각·음향 검수는 아님.
PASS13 / NOT_READY5 / FAIL0, continuous_E2E=false. 나머지는 bossroom_gate와 PC boss final-death 이후 의존 경로만 NOT_READY.

자연 피격 HP 550.108500000001 → 0.0, HP0 8827ms, 총 13815ms. countdown 10 samples. fallen_enter/final_death APPLIED. 자연 RNG 결과는 최종사망이며 revive 성공 분기는 미관측. RNG 재추첨·재시도 없음. 전체 영수증과 자연 관측은 외부 stages.json 보존.

| # | 단계 | 결과 | 사유 |
|---|---|---|---|
| 1 | isolation | PASS | actual owner readback |
| 2 | new_game | PASS | actual owner readback |
| 3 | character_create | PASS | actual owner readback |
| 4 | intro_skip | PASS | actual owner readback |
| 5 | field_MAP11 | PASS | actual owner readback |
| 6 | enemy_kill | PASS | actual owner readback |
| 7 | item_pickup | PASS | actual owner readback |
| 8 | equip | PASS | actual owner readback |
| 9 | auto_potion | PASS | actual owner readback |
| 10 | level_up | PASS | actual owner readback |
| 11 | stat_passive_invest | PASS | actual owner readback |
| 12 | revival_interface | PASS | actual owner readback |
| 13 | bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| 14 | boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| 15 | clear | NOT_READY | clear consumer did not accept contract |
| 16 | demo_end | NOT_READY | next/end route not admitted |
| 17 | save_handoff | PASS | actual owner readback |
| 18 | lobby_return | NOT_READY | actual lobby navigation not completed |


실행 gate는 import 시작 count1, E2E 시작 count1에서 진입했으며 타 작업 count2 동안 대기했다. import 도중 다른 작업이 추가 실행되어 Godot3개가 일시 관측됨. 당시 자체 import는 정상 종료했고 이후 E2E는 count2 동안 대기 후 진입. PID81277 및 타 작업 PID 조작0. 동시2개 이하를 전 구간 지켰다고 주장하지 않는다.

R은 승인된 fetch/worktree Git metadata 이외 파일 변경0. 검사 생성물·정규화 alias는 외부 archive 보존 후 worktree에서 정리. 원본 override bytes 복원. hook 비활성/force/reset/rebase/main push0. PC 실행·동기화 미확인.
