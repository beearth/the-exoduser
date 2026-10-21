# INTEG-5b 검수 마무리 — 2026-10-21

기준 `deefdd7057bebb40b80584e3b333c82dec890aa8`, 동일 `codex/demo11-integ5-20261021` 후속. 전체 시연 인수 PASS가 아니다. 상세 명령·로그·최종 원격 SHA는 `~/exoduser-wt/_out/INTEG-5b/DONE.txt` 및 인접 파일에 보존한다.

## BGM 보완 검수

| 하니스 (각 1회) | 필수 인수·격리 | assertions | failures | 결과 |
|---|---|---:|---:|---|
| test_demo11_field_bgm_override | --source-root=INTEG-5b 절대경로, 하니스 USERDIR | 14 | 0 | PASS, Dummy |
| test_demo11_41_music_lifecycle | --source-root=INTEG-5b 절대경로, 하니스 USERDIR | 51 | 0 | PASS, Dummy skip13 |

공통 CLI에 기존 --node-bin, --source-game, --demo11-storage=on도 전달했다. Dummy13은 실제 재생·청음 미관측이며 Windows 실행 결과가 아닌 Mac headless 관측이다. PC 기준 14/0·51/0과 수치 일치.

## item_pickup / equip 원인과 최소 수정

| 비교 | 관측·해석 |
|---|---|
| 86864efc 기준, 동일 하니스·인수 1회 | 12 PASS / 6 NOT_READY / 0 FAIL. item_pickup·equip PASS. 자연 드랍 레코드가 없어 원래의 source rollDrop fixture checkpoint 사용 |
| 기존 INTEG-5 | 자연 아이템 레코드가 있어 fixture 분기를 타지 않음. bag10→10, item_not_in_actual_bag. 처치 뒤 home으로 복귀하고 화면 내 아이템만 줍는 R을 사용 |
| merge별 blob 대조 | 하니스·native_world_drops·drop_item_source·native_normal_enemy_hurte·native_source_new_run_state·native_demo_lobby_entry 6개가 86864efc/d176ead7/7f9f1d9b/0dcc85fd/deefdd70 전 구간 동일. regression-blob-comparison.json |
| 원인 | 특정 lobby/BGM/snapshot merge의 픽업 코드 회귀로 특정할 증거 없음. 기존 하니스의 조기 home 복귀가 자연 드랍을 화면 밖에 남기는 잠재 순서 결함. 자연 드랍이 없는 실행은 기존 fixture가 현재 위치에 생겨 문제를 가렸음. 단일 기준 실행으로 RNG 빈도나 모든 분기를 입증하지 않음 |
| 수정 | test_demo11_47h_e2e.gd에서 처치 직후 home 좌표 복귀 1개 제거. 기존 auto_potion 시작의 home 복귀는 유지. 처치 위치에서 실제 R 입력→실제 INV 반입→실제 equip/refresh. 위치·카메라·후속 레코드 읽기 증거 추가 |
| 수정 후 1회 | 자연 드랍 경로로 item_pickup·equip PASS, bag10→11, 동일 item identity. rollDrop fixture checkpoint 없음. player(-436.742,2549.987), camera(-437.542,2369.989), home(3800,-99.63744): 조기 복귀 시 줍기 화면 밖임을 확인 |

제품 코드·전투·드랍 RNG·HP·신호·완료 상태 변경/추가 주입0. 기존 하니스의 다른 checkpoint와 배치 동작은 그대로이며 continuous_E2E=false를 유지한다. `records` 증거는 R 이후의 live 레코드 배열을 읽으므로 성공적으로 제거된 드랍은 빈 배열로 관측된다. 판정은 실제 bag 증가와 동일 identity 및 equip refresh로 검증한다.

## E2E 표

동일 `--demo11-storage=on`, 명시 --source-root/--node-bin/--source-game/--results-path. baseline은 Git archive 86864efc의 godot를 별도 외부 디렉터리에서 import 후 실행했고 테스트 파일 blob은 INTEG-5와 동일하다. 공통 source-game은 고정 스냅샷 바이트. 양쪽 실제 userdir은 하니스의 `EXODUSER-demo11-47h-Isolated-20261021`, 실제 First 저장소 접근0. 각 실행이 기존 하니스 소유 저장 키를 초기화한다.

| 단계 | 기준 86864efc | 수정 후 INTEG-5b | blocked_by |
|---|---|---|---|
| isolation | PASS | PASS | — |
| new_game | PASS | PASS | — |
| character_create | PASS | PASS | — |
| intro_skip | PASS | PASS | — |
| field_MAP11 | PASS | PASS | — |
| enemy_kill | PASS | PASS | — |
| revival_interface | NOT_READY | NOT_READY | PCI-01 |
| item_pickup | PASS | PASS | — |
| equip | PASS | PASS | — |
| auto_potion | PASS | PASS | — |
| level_up | PASS | PASS | — |
| stat_passive_invest | PASS | PASS | — |
| bossroom_gate | NOT_READY | NOT_READY | PC_fieldboss_HP_final_readback |
| boss_defeat_signal | NOT_READY | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| clear | NOT_READY | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| demo_end | NOT_READY | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| save_handoff | PASS | PASS | — |
| lobby_return | NOT_READY | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |

전체 12 PASS / 6 NOT_READY / 0 FAIL, engine ERROR0. PCI-01 / PC_fieldboss_HP_final_readback / boss_source_updateE_prefix / PCI-11 대기 계약은 완화하지 않았다. 실제 창·GPU·청음 검수 아님.

## 범위·보존

코드 변경 후 docs 전체에서 E2E/픽업/47h/rollDrop 검색을 수행하고 외부 docs-search-all.txt에 기록했다. 기존 INTEG5_VALIDATION_20261021.md는 당시 관측을 보존하며 본 보완 결과를 연결한다. 수치·게임 공식·런타임 계약 변경 없음. live game.html·player.gd byte 동일, 번역 전체 목록 byte 동일(CRLF9503/bareLF0), 보호 문서·맵 비주얼 변경0. tick 경로 IO/목록 API/ResourceLoader 추가0, 게임 UI 문구 변경0. Godot는 기존 PID81277을 보존하며 pgrep으로 동시2개 이하를 확인하고 빈 슬롯에서 순차 실행했다. R의 tracked INDEX/WORK·HEAD/branch는 보존하며 PC 실행/동기화는 미확인.

## map11_product 선재 FAIL 대조

최초 호출은 실행기의 custom userdir 오기로 guard에서 조기 종료(exit1), 제품 검증으로 세지 않는다. 해당 로그는 test_map11_product-guard.log로 보존했다. 하니스 USERDIR `EXODUSER-map11-prod-Isolated-20261021`로 바로잡은 실행에서 INTEG-5와 동일한 4개 실패 및 Dictionary `_bossArena` 오류가 재현됐다.

| 기존·현재 공통 실패 | 판정 |
|---|---|
| legacy region/hole installation excluded | 동일 선재 FAIL |
| Main actual gate transport | 동일 선재 FAIL |
| actual Player at arena Entry Marker | 동일 선재 FAIL |
| actual camera follows transition | 동일 선재 FAIL |
| test_map11_product.gd:48 `_bossArena` key | 동일 SCRIPT ERROR, PASS 아님 |

맵·게이트·제품 코드를 수정해 우회하지 않았다. quit-after600의 프로세스 종료값으로 기능 PASS를 판단하지 않는다. 시각 검수는 수행하지 않았다.
