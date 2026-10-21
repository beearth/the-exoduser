# PCIA-WIRE — Mac lifecycle consumers (2026-10-21)

실제 기준: origin/codex/demo11-integ5-20261021 `deefdd705` (통보된 6833f71f 후속) + origin/main `0edeec658` merge. R 파일 변경0. PC core/계약 writer는 원격 merge 내용 그대로이며 직접 수정0. PC 실행/동기화 검증0.

| 대상 | 호출/구독 위치 | 현재 범위 |
|---|---|---|
| DEMO11-39 | native_demo11_life.gd `_request`, `_phase` | PCI-01 6 op 소비자. HP0 deferred 인수(PC reentry 차단 준수), reviveOnce 우선, death roll 1회, 300 native source-sp countdown, pause0, 성공 shield 불충전, 재점화 NOT_READY 보존 |
| DEMO11-37 | native_demo11_encounter.gd `bind_pcia`, `_pcia_death`, `_pcia_phase` | PCI-11 3 event 구독. token/actor/provider 보존, cancel 폐기, alive 시 main/world/stage/open token 확인 후 1회 재개. dead/respawning/lobby 폐기. State clear admission도 clear_blocked 차단 |
| B9 | native_demo11_etype_b_actor.gd `advance_native_phase` | PCI-10 request_id·revive_cd 전달, accepted에서만 next_timer 쓰기. 일반/전용/type7 writer 구현은 PC 소유 |
| DEMO11-29 | native_workshop_transaction.gd `execute` | 재련/빈 슬롯 제작 PCI-12 recalc_st → apply_stats. 소켓 등 기존 apply_stats 경로 유지. UI의 임시 거래 차단 제거 |
| E2E | test_demo11_47h_e2e.gd revival_interface | 실제 Mac 소비자의 APPLIED 영수증만 관측. HP/iframe/roll/신호 주입0. 자연 HP0 미관측은 NOT_READY |

## 영수증의 Mac 원본 행 처리

| 원본 | 처리 / 남은 범위 |
|---|---|
| G43727 | revive_once 우선 요청, PC가 자원·state·iframe 집행. 음성/부활 floating text 표현은 후속 |
| G43729–43751 | fallen_enter 후 300 countdown. 장비/implicit/첫 weakRev/passive/인간성 공식·cooldown·단일 roll 저장. G43736 sample 선택·pitch RNG 후 G43751 roll RNG를 분리. 기존 native clock epoch의 dt_sp 단회 소비(완전 웹 slowMo clock 동등성 주장0). slowMo/shake G 후속. beamStop/turret/부스는 기존 미이식 |
| G43849–43865 | 저장 roll 그대로 PC resolve. _uDemonRekindle>0 NOT_READY 우회0. 부활 FX/펫 대사·voicing 전체 이식 완료 주장0 |
| G43868–43873 | death stats·G.on=false·탄/장판 G 배열 정리·사망 BGM·EXP 손실 UI. UI는 Hell Gothic/기존 crest. 전체 피해 로그·death dual 대사는 후속 |
| G63472–63530 | retry API는 stage reconstruction callback admission → exp_loss → stage restore → reset → save 순서. **실제 initStage 재호출 owner가 없어 callback 미연결, EXP 차감 전 NOT_READY**. 재시작 완료 아님. PC reset을 임의 skip하거나 새 Main을 동일 캐릭터 재시작이라고 주장하지 않음 |
| G63678–63681 | lobby_prepare → 실제 save owner committed 확인 → 로비 이동. save OFF/실패에는 이동0. 실패 후 저장 재시도 지원 |
| G38949–38952 | B9 실제 PCI-10 호출. 부활 VFX/텍스트 후속 |
| G50836/G51176 | 재련/자동장착 제작에서 recalcSt 후 applyStats, 가격/RNG admission은 Mac 거래 owner |

## 명시적 미완료

- 보스 HP writer/최종 부활 판정(DEMO11-36/49) 없음: 보스 final/실제 clear/끝까지 연속 E2E는 NOT_READY 유지.
- retry stage reconstruction owner 없음: 재시작 동작 미완료. initStage 단회 초기화 writer를 재사용하거나 보호 코어 수정으로 우회하지 않음.
- 300 countdown은 기존 native source tick을 소비한다. 웹의 slowMo/hitstop 전체 시간축 이식 완료 주장은 하지 않는다.
- 화면 구현과 실제 시각 검수는 구분. headless 검사는 시각 PASS가 아니다.
- workshop의 기존 rollback journal은 INV/재료/지갑/cache에 한정된다. recalcSt 성공 뒤 applyStats가 실패하는 복합 자원 rollback은 이번 테스트에서 검증하지 않았다. 별도 보호 자원 writer를 만들지 않았다.

검증 원로그와 최종 SHA/연결표/18단계 표: `~/exoduser-wt/_out/PCIA-WIRE/DONE.txt`.

## 이번 검증 (격리 user dir, PC 원로그 재사용0)

| 항목 | 실제 결과 |
|---|---|
| Godot import | PASS, ERROR 0 |
| DEMO11-39 (`test_pcia_wire_life`) | 12 checks / 실패0. 실제 hurtP HP0→fallen, pause0, native300 countdown→final_death, clear writer 차단, 후속 death 통계1, resolve 중복0. 첫 기본 검사7/0 후 countdown/창 캡처 추가 검증 |
| DEMO11-37 | 134 assertions / 실패0, PASS_WITH_SKIPS. legacy marker fixture의 arena_geometry NOT_READY에서 후속 보상/clear 검사는 생략. 보스 자연 처치 검증 아님 |
| DEMO11-29 | 97 assertions / 실패0, 원본 oracle17사례41checks. 초기 acorn 미연결2실패는 원로그 보존, R/node_modules 읽기 전용 symlink 연결 뒤 재검증 |
| PC player_life | 101 / 실패0, oracle41필드 |
| PC final_death | 60 / 실패0, 실제 hurtE4처치. Mac 자동구독자1을 기대값에 반영(기존 lazy0 가정에서 달라짐) |
| PC enemy_revive | 50 / 실패0, oracle14필드 |
| PC recalc_st | 49 / 실패0, oracle16필드 |
| PC pet_portrait_cache | 23 / 실패0 |
| 1920×1080 fallen/dead | 실제 window 캡처2장 확인. 문구/crest/버튼 가독성 확인, 잘림0. retry는 stage owner 미연결로 disabled. AAA 최종 판정 아님 |

DEMO11-37 첫 실행은 기존 runner의 --map11=off를 누락해 provider 충돌, 두 번째는 legacy marker fixture에서 arena geometry를 제공하지 못해 HP read 오류가 났다. 해당 실행은 자기 PID만 종료했다. 테스트를 NOT_READY 경계에서 명시 종료/skip하게 수정했다. 다른 Godot PID(81277 포함) 변경0.

## E2E 18단계 (`--demo11-storage=on`, 실제 1회)

PASS12 / NOT_READY6 / FAIL0. 엔진 ERROR0, result contract validation 오류0. 테스트 입력 checkpoint가 포함되어 continuous_E2E=false다. 기존 runner parent가 child launch 직후 종료되어 OS exit code는 회수하지 못했지만, 엔진은 18단계 결과 JSON과 종료 결과행을 모두 기록했다. 재실행으로 숫자를 덮어쓰지 않았다. 실제 저장 폴더 접근0, 격리 userdir만 사용.

| 단계 | 결과 | 근거/보류 |
|---|---|---|
| isolation | PASS | 실제 owner readback |
| new_game | PASS | 실제 owner readback |
| character_create | PASS | 실제 owner readback |
| intro_skip | PASS | 실제 owner readback |
| field_MAP11 | PASS | 실제 owner readback |
| enemy_kill | PASS | 실제 owner readback |
| revival_interface | NOT_READY | natural HP0 not observed; PCI-01 product consumer connected |
| item_pickup | PASS | 실제 owner readback |
| equip | PASS | 실제 owner readback |
| auto_potion | PASS | 실제 owner readback |
| level_up | PASS | 실제 owner readback |
| stat_passive_invest | PASS | 실제 owner readback |
| bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| clear | NOT_READY | clear consumer did not accept contract |
| demo_end | NOT_READY | next/end route not admitted |
| save_handoff | PASS | 실제 owner readback |
| lobby_return | NOT_READY | actual lobby navigation not completed |

이번 변경은 부활/사망 호출부 연결이며 1-1 전체 데모 완료가 아니다. 보스 final은 PC 계약대로 NOT_READY다. retry stage 재구성은 별도 미연결이며 EXP 차감 전에 차단한다.
