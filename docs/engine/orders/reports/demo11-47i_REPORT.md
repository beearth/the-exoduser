# DEMO11-47i — b07f5c56 1회 재실행

**미완료: 13 PASS / 5 NOT_READY / 0 FAIL, engine ERROR 0. 연속 E2E false.**

| 단계 | 판정 | 이유 |
|---|---|---|
| isolation | PASS |  |
| new_game | PASS |  |
| character_create | PASS |  |
| intro_skip | PASS |  |
| field_MAP11 | PASS |  |
| enemy_kill | NOT_READY | MAP11_or_initial_combat_target_absent |
| revival_interface | NOT_READY | PC_life_transition_API_absent |
| item_pickup | PASS |  |
| equip | PASS |  |
| auto_potion | NOT_READY | real hurtP/iframe/threshold/clock did not produce auto-potion |
| level_up | PASS |  |
| stat_passive_invest | PASS |  |
| bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| boss_defeat_signal | NOT_READY | PC_final_boss_death_not_automatically_proven |
| clear | PASS |  |
| demo_end | PASS |  |
| save_handoff | PASS |  |
| lobby_return | PASS |  |

## Perf 상위 3 (계측한 Mac callback / 단계별 최대)

| 단계·호출 | 최대 ms |
|---|---:|
| auto_potion|native_pets.gd::_physics_process | 14.633 |
| equip|native_pets.gd::_physics_process | 14.4 |
| intro_skip|native_pets.gd::_physics_process | 13.659 |

physics span 최대 17.439ms(auto_potion), equip 17.250ms, intro_skip 17.019ms. 예산 8.333ms 초과. callback 안의 wall CPU span이며 scheduler preemption 포함, 전체 스크립트 profiler 아님. 계측 8개 Mac callback 중 상위3이며 PC 코어·맵 비주얼은 계측/수정하지 않음. 펫 _physics_process → _check_pet_dialogue → _show_bubble의 ResourceLoader.exists/load(초상) 경로가 정적 후보다. 하위 함수별 계측 없이 I/O 원인 확정/수정 완료로 주장하지 않는다. 과거 18.854ms와 동일 호출이었다고 단정하지 않음.

## 적용·경계

- field_MAP11: 기존 spawn adapter 대신 실제 Main.native_map11.current/space/World 준비를 관측. spawn adapter 준비와 필드 진입을 분리.
- headless: actual logical Window.visible로 visibility 판정. headless에 없는 desktop minimized 상태를 simulation hidden으로 취급하지 않음. document_hidden=false 검증. desktop 정책 불변.
- auto_potion: 실제 PC receive_damage 1회, uses0/mats1000 유지. source_update_gate_or_prefix_not_ready 잔존. visibility 해소만으로 QS-01 PASS 아님.
- enemy_kill: MAP11 기본 boot가 기존 encounter/spawn/region owner를 설치하지 않아 대상0. fake enemy/HP/kill/지역 완료 주입 없음.
- bossroom_gate: MAP11 제품 transport와 37 지역 combat gate는 별개. NativeRegions 부재·37 미configure. 실제 gate 전투 완료 증거 없음. 운송만 PASS로 바꾸지 않음.
- boss_defeat_signal: PC 최종사망 owner bind 부재. 기존 contract-only 신호 checkpoint만 수행, 실제 처치 PASS 아님.
- revival_interface: PCI 묶음 A(PCI-01/11) 대기 유지. life API 부재. 보스 최종사망 PCI-11도 별도 필요.
- Mac 담당 5개 모두 해소 요구는 달성하지 못함. 더 큰 MAP11 spawn/region/encounter 배선은 이 제출에서 구현하지 않았으며 PC 대기로 일괄 전가하지 않음.
- userdir는 47h 격리 namespace 재사용. 실제 EXODUSER-Godot-Native-First 접근0. import1/E2E1, Godot 동시 실행 gate count0. 추가 게임 재실행0.
- R tracked INDEX/WORK·branch·HEAD 보존. 기준 b07f5c56 고정(원격 통합 tip 3183eeeb는 이번 범위 아님). 47h와 정본 status만 merge; 충돌은 b07 기준 내용 보존. 최초 merge commit은 hook 비활성 옵션 사용; 최종 제출 commit은 정상 hook 경로 사용. sparse에 hook 파일이 없어 아래 정상 검사 환경을 별도로 준비.
- 계측은 root demo47i_stage 메타가 있을 때만 활성. reflection list 호출 추가0, UI 개발 상태 노출0, 맵 비주얼/PC core/docs2_3 수정0.

재현: python3 godot/tools/run_demo11_47h.py --godot-bin /Users/fordeargamers/.codex/tools/godot-4.7.2 --node-bin /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --source-root /Users/fordeargamers/Projects/exoduser-migration-20261001 --out /Users/fordeargamers/exoduser-wt/_out/DEMO11-47i
