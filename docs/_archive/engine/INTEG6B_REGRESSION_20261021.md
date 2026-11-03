# INTEG-6b 회귀 수정·원인 분리 (2026-10-21)

기준 `c0b71595d1ef06ed1b5cb8911d5c5d3fdc23ef31`, 같은 `codex/demo11-integ6-20261021` 브랜치. R은 읽기만, 지정 INTEG-6b worktree에서만 import/검수/편집했다.

## 제품 실패 원인

| 기준 단독·각1회 | import 오류 | product 실패 | SCRIPT ERROR | 종료 |
|---|---:|---:|---:|---|
| PCIB-WIRE 660d6b43 | 0 | 4 | 1 | 35초 후 자기 프로세스 TERM,124 |
| MAP11-30c 0f0a2888 | 0 | 4 | 1 | 동일 |
| 통합 c0b71595 | 0 | 4 | 1 | 동일 |

| 실패 항목 | 분류·근거 | 처리 |
|---|---|---|
| legacy region/hole 설치 제외 | 구형 Mac 테스트 전제. 현행47j는 동일 이름 owner를 MAP11 provider/Marker 기반으로 설치한다. legacy template 배치와 다름. | 실제 owner 설치·provider 바인딩을 검증하도록 수정 |
| Main actual gate transport | 기존 기본 제품 차단. encounter phase=field, `_bossUnlocked=false`, `_fbDone=false`, anglers pc_bound=false, final owner=false. request는 gate_or_provider/NOT_READY. 두 부모와 통합 모두 같음. | PC 완료를 조작하지 않고 default gate 거절·Player/camera/State 보존 검증 |
| Player Entry / camera | 위 입장 거절의 후속 실패. 독립 transport 좌표 결함으로 재현되지 않음. | 테스트 전용 map-only transport를 분리해 실제 Main Player→Entry와 camera 이동·authoritative arena·128×108·HP 보존 검증 |
| `_bossArena` Dictionary 접근 | 거절로 아직 없는 키를 직접 읽는 Mac 하니스 오류. 코루틴 중단 뒤 종료하지 못함. | get/default 사용, 명시적 결과·종료. 수정 product43검사/0실패·exit0·ERROR0 |

merge 해결 실수로 새로 발생한 회귀 없음. 기본 게임에서 field→gate→arena의 자연 입장 성공은 **미완료**다. PC fieldboss HP/final owner와 region clear가 선행되어야 하며 PC 전투·계약 구현은 수정하지 않았다. map-only fixture 성공을 기본 게임/E2E 성공으로 대체하지 않는다. E2E에는 fixture를 설치하지 않는다.

## 하니스 변경

| 파일·항목 | 정확한 현행 규칙 |
|---|---|
| test_map11_product.gd | default gate NOT_READY·동일 상태 보존과 별도 map-only transport를 구분. 최종 production_gate=NOT_READY_PC_fieldboss를 출력 |
| map11_transport_fixture.gd | tests 전용. 기존 자동 transport만 정지하고 실제 Main에 unbound transport를 별도 설치. 실제 provider Gate 접촉·기존 State commit이 Player/State 이동을 수행. 기본 startup/E2E 연결0, PC gate/HP/사망 신호 조작0 |
| test_demo11_47h_e2e.gd | 자연 소유 actor0/1/4/6/18/19 중 기존 공격력·idle·쿨다운을 읽어 World can_move 통과 actor+(24,0)에 Player만 배치. etype0/6은 st2, 나머지는 _contact_ticks. 공격·AI/쿨다운/RNG/HP/iframes 쓰기0 |
| auto_potion | iframe/CD 최대20000ms 대기 뒤 자연 접촉 최대30000ms. 직접 receive_damage 호출 및 검사 중 물약 추가 제거. 기존 자동사용·정상 소비 유지 |
| revival_interface | 최대120000ms 자연접촉·HP0 관측,15000ms resolution. PASS 의미는 fallen_enter+실제 자연HP0/이전 receipt이며 부활 성공과 구분 |
| benchmark_integ6b_arena.gd | default gate 거절 기록 후 test-only transport로 authoritative arena에 진입.1920×1080 GUI·실제 Player 입력600틱 단1회·process/physics/draw/viewport monitor·3개 callback probe. 자연 보스전 아님 |

## 최종 E2E storage=on

최종 PASS13 / NOT_READY5 / FAIL0, exit0·ERROR0, validator `[]`. 초기 범위가 좁은 배치 후보를 보정하기 전1회도 PASS13/NR5였으나 접촉 배치 표본0이었다. 최종본을 검증한 추가1회에서는 실제 자연 접촉 배치1478프레임, 자연HP0·fallen_enter·final_death APPLIED를 확보했다. 총E2E2회, 성능1회. 피해·사망 주입0, 석궁 field_mob_owner_unported 거절 경계 유지. E2E 전체 클리어 완료는 아니다.

| # | 단계 | 결과 | 사유 |
|---|---|---|---|
| 1 | isolation | PASS | — |
| 2 | new_game | PASS | — |
| 3 | character_create | PASS | — |
| 4 | intro_skip | PASS | — |
| 5 | field_MAP11 | PASS | — |
| 6 | enemy_kill | PASS | — |
| 7 | item_pickup | PASS | — |
| 8 | equip | PASS | — |
| 9 | auto_potion | PASS | — |
| 10 | level_up | PASS | — |
| 11 | stat_passive_invest | PASS | — |
| 12 | revival_interface | PASS | — |
| 13 | bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| 14 | boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| 15 | clear | NOT_READY | clear consumer did not accept contract |
| 16 | demo_end | NOT_READY | next/end route not admitted |
| 17 | save_handoff | PASS | — |
| 18 | lobby_return | NOT_READY | actual lobby navigation not completed |

revival: HP651.098→0, 자연 접촉 배치1478프레임, 관측+resolution 18325ms. countdown300→0/final_death APPLIED, 부활 성공 주장0. auto_potion: uses0→1, mats1005→1004, 직접피해요청0.

13단계 actual entry_receipt=NOT_READY/gate_or_provider 유지. 관문 테스트 하니스 오류 수정으로 PC fieldboss 완료가 생기지 않으며 실제 full-game 입장은 여전히 차단된다.

## 보스방 성능 단1회

`product_space=arena`, focus_lost=0, valid=True, 실제 Player 입력 수락·보행 1609.162px/611physics ticks. p95 **9.261ms**, p99 10.989ms, 평균 152.348fps. 8.33ms 예산 미달. 30c 단독 기록7.738ms 대비 **+1.523ms**. INTEG-6의 field9.827ms 대비 -0.566ms이나 서로 다른 authoritative 공간이므로 동일조건 개선/회귀의 인과 비교는 아니다.

81277 외 Godot이 없는 시점에 시작,0.5초 간격43관측에 자기61694와81277만 존재. 자기61694 종료 확인. 다른 Godot이 있으면30초 간격 대기하는 실행 가드 사용. 창 전체표본 focus_lost0. 단회 후 재측정0.

| Godot 모니터 | 전체 관측 평균 / p95 | 앞25% 제외 보조 평균 / p95 |
|---|---|---|
| draw_calls | 102.811 / 109.000 | 101.428 / 102.000 |
| physics_ms | 3.968 / 7.330 | 3.360 / 3.341 |
| process_ms | 11.700 / 37.201 | 8.562 / 10.203 |
| viewport_cpu_ms | 0.445 / 0.511 | 0.414 / 0.498 |
| viewport_gpu_ms | 0.000 / 0.000 | 0.000 / 0.000 |

TIME_PROCESS/TIME_PHYSICS는 Godot의 저빈도 갱신 모니터다. 전체에는 초기/이전 프레임값37.201/7.330ms가 남는다. 앞25%를 제외한 보조 통계는 동일 단회 원자료1221관측이며 프레임 p95 교체·재시도 근거가 아니다. viewport CPU 단위ms, GPU0은 gl_compatibility에서 유효 GPU 시간을 확보하지 못했다는 뜻이다. 0ms GPU비용 주장0. draw_calls 단위회.

| 실제 callback (inclusive 측정경계) | 평균ms | p95ms | 최대ms |
|---|---:|---:|---:|
| main.gd::_physics_process | 0.028 | 0.040 | 0.059 |
| player.gd::_physics_process | 0.368 | 0.405 | 0.478 |
| world.gd::_physics_process | 0.002 | 0.003 | 0.008 |

각 callback646표본은 settle/warmup을 포함한다. world.gd::_physics_process는 clock callback이며 advance_native_owner_phase 등 별도 child phase 비용을 포함하지 않는다. TIME_PROCESS·PHYSICS·viewport·callback은 서로 다른 경계로 합산할 수 없다. renderer CPU는 정상구간 p95.498ms/draw102회, Player callback p95.405ms이므로 +1.523ms 전체를 Player/PC 전투 함수에 귀속할 근거는 없다. 나머지 physics child/phase와 전체 process의 귀속은 미확정. PC 함수·규칙 수정0. 30c의 authoritative 공간/동일 모니터 원자료가 없는 단회 간 비교에서 특정 PC 함수의 증가ms를 만들어내지 않는다.

## MAP PRODUCTION REPORT

STAGE: CH1-1 회귀 QA·arena 계측. MASTER silhouette/regions/main route/side spaces, OUTER MASS LEFT/RIGHT/TOP/SOUTH/holes, LARGE assets/composites/overlap/repetition, MEDIUM connections/holes, GROUND shadow/contamination/integration, LANDMARK primary/secondary/tertiary: 모두30c 인수 바이트 보존·새 제작0.

PLAYABLE: 기본 자연 gate 입장 PC 미완료. 별도 transport fixture actual Entry·camera·충돌 query/HP보존과 arena 실제 입력 보행 검증. 자연보스전/밀집전투 가독성 미검수. CAMERA QA: ARENA 단회 실제 화면 확인, 나머지 START/EARLY/SIDE L/R/LANDMARK/LATE/EXIT 새 시각 QA 미실시. TECH QA: product43/0, default gate 차단 유지, import ERROR0, 성능 위 단회; seam/loading 새 전체 검사0, pageerror/404는 브라우저 대상 아님. FILES: tests와관련docs만, runtime map/PC/UI/번역/타팀 변경0. GIT: 같은 브랜치 정상 commit/push, deploy0. VISUAL VERDICT: RETOUCH(기존30c 유지, 새 visual PASS 아님). NEXT PASS: PC fieldboss HP/final owner·region clear 연결 후 자연 gate/실전보스전과 동일조건 비용 귀속 검수.
