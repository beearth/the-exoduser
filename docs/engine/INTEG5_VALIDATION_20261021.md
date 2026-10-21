# INTEG-5 통합·검증 — 2026-10-21

통합 후보이며 전체 인수 PASS가 아니다. 요청한 각 검사는 1회씩 실행했다. BGM override/41은 실행 인수 누락으로 미검증이고 map11 product는 기존 게이트 계약 오류가 재현됐다. E2E는 NOT_READY를 보존했다.

| 통합 | SHA/결과 |
|---|---|
| 기준 | 86864efc8a4a2487877820e7c37dddce50aae25f |
| lobby-01 입력 | b977c5fffc564b99cafc398685aa6361d51b600e |
| lobby merge | d176ead79cfe7d3bd83251b3df77795f305d745d |
| field BGM 입력 | db6539b7ee78a5e5e80ea52fbb0ab3cbd834a9c4 |
| field BGM merge | 7f9f1d9bdb5696d629da9a2bdccb67ad06722b30 |
| snapshot 별도 commit | 0dcc85fd01c28b2fcd0e4e84129b2262eb346148 |
| 충돌 | 양 merge 모두 없음. 두 부모 의도 그대로 포함 |
| 금지 조상 | 22342eb7 / b66e84d7 / 2aa6e220: 기준·양 입력·최종 모두 ancestor 아님 |
| 기존 전환 파일 수 | 76 = 테스트54 (fixture7 포함) + 제품12 + port_modules7 + tools3. 신규 source_snapshot 파일은 별도 |
| 바이트 보호 | live game.html 기준과 동일 SHA 189899b47b2efa464cd0d99dc75480b27232e89a94c868c87fa514fd13f86c7e. player.gd/docs/2_3/맵 비주얼 수정0 |
| 번역 목록 | lobby 입력과 byte 동일; CRLF 9503 / bare LF 0 |
| 제품 동등성 | 12파일 각각 SHA 문자열만 동일 값 const로 치환된 것 자동 비교 PASS. 새 tick IO/API/ResourceLoader0 |

[고정 원본·갱신 절차](INTEG5_SOURCE_SNAPSHOT_20261021.md). 원본 스냅샷의 과거 trailing whitespace는 SHA 보존을 위해 유지하며 diff-check는 그 파일만 제외해 PASS했다. manifest/GD pin/원 Git blob/실제 bytes 일치, 변경 Node 문법 검증 PASS.

## 검사 표

| 검사 (각1회) | exit | ERROR | assertions/checks | failures | 판정 |
|---|---:|---:|---:|---:|---|
| import | 0 | 0 | — | — | PASS |
| test_sound_source_catalog | 0 | 0 | 687 | 0 | PASS |
| test_sound_source_bgm_selection | 0 | 0 | 1308 | 0 | PASS |
| test_sound_source_bgm_lifecycle | 0 | 0 | 2400 | 0 | PASS |
| test_demo11_field_bgm_override | 1 | 0 | 2 | 1 | 미검증: 필수 --source-root 누락 |
| test_demo11_41_music_lifecycle | 1 | 0 | 2 | 1 | 미검증: 필수 --source-root 누락 |
| test_audio_01_mix | 0 | 0 | 30 | 0 | PASS |
| test_demo11_04_lobby | 0 | 0 | 60 | 0 | PASS |
| test_boss_ch1_bc01_catalog | 0 | 0 | 681 | 0 | PASS |
| test_boss_ch1_bc02_spawn | 0 | 0 | 5257 | 0 | PASS |
| test_boss_ch1_bc03_utility | 0 | 0 | 31976 | 0 | PASS |
| test_boss_ch1_bc04_selector | 0 | 0 | 21899 | 0 | PASS |
| test_boss_ch1_bc05_phase | 0 | 0 | 18424 | 0 | PASS |
| test_boss_ch1_bc06_start | 0 | 0 | 14099 | 0 | PASS |
| test_boss_ch1_bc07_melee | 0 | 0 | 14531 | 0 | PASS |
| test_boss_ch1_bc08_movement | 0 | 0 | 24788 | 0 | PASS |
| test_boss_ch1_bc09_projectiles | 0 | 0 | 56664 | 0 | PASS |
| test_boss_ch1_bc10_control | 0 | 0 | 165774 | 0 | PASS |
| test_map11_field | 0 | 0 | 41 | 0 | PASS |
| test_map11_field_runtime | 0 | 0 | 49 | 0 | PASS |
| test_map11_field_walk | 0 | 0 | 49 | 0 | PASS |
| test_map11_stage_provider | 0 | 0 | 54 | 0 | PASS |
| test_map11_seam | 0 | 0 | 18 | 0 | PASS |
| test_map11_outer | 0 | 0 | 26 | 0 | PASS |
| test_map11_arena_preview | 0 | 0 | 35 | 0 | PASS |
| test_map11_chest | 0 | 0 | 26 | 0 | PASS |
| test_map11_product | 0 | 1 | — | — | FAIL |
| test_demo11_47h_e2e | 0 | 0 | — | 0 | NOT_READY (전체 PASS 아님) |

- BGM 두 검사는 작성한 하니스의 필수 `--source-root` 누락으로 각 2 assertions/1 failure에서 조기 종료했다. 제품 결함 증거로 해석하지 않는다. 각1회 제한으로 재실행0. 41의 실제 창/청음 QA도 미검증이다. E2E 실행 전 인수를 수정했고 E2E에는 명시 source-root를 전달했다.
- map11 product: `legacy region/hole installation excluded`, gate transport, arena Entry Marker, camera transition 4실패 뒤 `_bossArena` Dictionary key 오류. quit-after600으로 exit0이어도 PASS가 아니다. 이전 `_out/INTEG-4/test_map11_product.log`와 같은 실패 라벨·오류를 확인했다. 보호 전투/맵 수정으로 우회하지 않았다.
- Godot import1회, 각suite1회, E2E1회. 모든 실행 전 pgrep으로 PID81277 존재와 총Godot<2를 확인하고 추가 실행1개만 허용했다. MAP11 타 작업이 점유할 때 대기했다. 기존 PID 종료/조작0. 프로젝트 override는 각 검사 후 원 byte 복원했다.
- R은 파일·인덱스·HEAD/branch를 변경하지 않았다. Git 공통 ref 갱신은 사용자 지정 fetch/새 branch/worktree/push만이다. PC 실행·동기화 검증0.

## E2E 표

`--demo11-storage=on` 포함. 실제 userdir `/Users/fordeargamers/Library/Application Support/EXODUSER-demo11-47h-Isolated-20261021`. 전체 `NOT_READY`, continuous_E2E=false, failures=0, engine ERROR0. 소요/성능 값은 headless CPU 관측이며 실창/GPU/청음 검증이 아니다.

| 단계 | 판정 | blocked_by |
|---|---|---|
| isolation | PASS | — |
| new_game | PASS | — |
| character_create | PASS | — |
| intro_skip | PASS | — |
| field_MAP11 | PASS | — |
| enemy_kill | PASS | — |
| revival_interface | NOT_READY | PCI-01 |
| item_pickup | NOT_READY | — |
| equip | NOT_READY | — |
| auto_potion | PASS | — |
| level_up | PASS | — |
| stat_passive_invest | PASS | — |
| bossroom_gate | NOT_READY | PC_fieldboss_HP_final_readback |
| boss_defeat_signal | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| clear | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| demo_end | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |
| save_handoff | PASS | — |
| lobby_return | NOT_READY | bossroom_gate, PC_fieldboss_HP_final_readback, boss_source_updateE_prefix, PCI-11 |

PC 대기 계약 PCI-01 / PC_fieldboss_HP_final_readback / boss_source_updateE_prefix / PCI-11 및 상위 bossroom_gate 의존 유지. 신호/HP/완료 플래그 주입0. item_pickup/equip의 NOT_READY도 완화하지 않았다.

최종 제출 SHA와 원격 대조, 로그/원본 결과 JSON, worktree 제거 내역은 `~/exoduser-wt/_out/INTEG-5/DONE.txt`에 기록한다.

## INTEG-5b 보완

BGM 필수 인수 보완, 기준 E2E 비교 및 픽업 하니스 순서 수정 결과는 [INTEG5B_VALIDATION_20261021.md](INTEG5B_VALIDATION_20261021.md)를 따른다. 본 문서의 INTEG-5 최초 관측은 이력으로 보존한다.
