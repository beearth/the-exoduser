`python3 tools/run_demo11_47h.py --godot-bin /Users/fordeargamers/.codex/tools/godot-4.7.2 --node-bin /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --source-root /Users/fordeargamers/Projects/exoduser-migration-20261001 --out /Users/fordeargamers/exoduser-wt/_out/demo11-47h`

# DEMO11-47h 자동 종주 하니스 — 조건부 단계 검증

판정: **NOT_READY**. 단계 12 PASS / 6 NOT_READY / 0 FAIL, engine ERROR 0. 연속 E2E PASS가 아니다. 누락 접점 뒤에는 공개된 기존 UI/API 경계에 입력하는 checkpoint로 계속 진행하며, 결과 JSON의 checkpoint와 continuous_E2E=false로 구분한다.

실행 위치는 이 통합 브랜치의 checkout 루트다. `--godot-bin`은 설치 디렉터리 또는 .app 경로를 권장한다(전체 실행파일 경로가 하니스 argv에 있으면 지정된 pgrep 패턴에 하니스 자신도 잡힐 수 있다). 기본 실행은 editor import 후 headless 종주를 수행한다. `--skip-import`는 이미 import된 checkout만 사용한다. `--require-ready`를 붙이면 NOT_READY도 종료코드 2, FAIL/엔진 ERROR/결과 계약 위반은 1이다. 기본 종료코드 0은 유효한 진단 출력이며 E2E 성공을 의미하지 않는다.

## 단계별 결과·120fps 측정

| 단계 | 판정 | 실제 검증/미확인 경계 | physics callback p95 / 최대 ms | process interval p95 / 최대 ms |
|---|---|---|---:|---:|
| isolation | PASS | headless·고유 userdir 확인 후 자체 namespace key만 초기화 | 0.002 / 0.003 | 8.941 / 10.004 |
| new_game | PASS | 실제 슬롯0 Button → 생성 폼 | 0.002 / 0.005 | 9.789 / 10.236 |
| character_create | PASS | char0·이름 → metadata IO → Main 전환 | 0.056 / 0.058 | 10.899 / 20.898 |
| intro_skip | PASS | held SPACE 후 기존 skip endpoint fallback; checkpoint | 3.138 / 18.854 | 10.228 / 392.294 |
| field_MAP11 | NOT_READY | 원격 map11-prod 없음; fixture provider 생성하지 않음 | 3.044 / 3.171 | 10.002 / 10.220 |
| enemy_kill | NOT_READY | 실제 대상 부재; 공격·처치 증명 없음 | 2.931 / 2.968 | 9.472 / 10.540 |
| revival_interface | NOT_READY | PC life transition 접점 없음; 강제 치명 피해 없음 | 3.072 / 3.128 | 9.685 / 9.918 |
| item_pickup | PASS | source rollDrop 사설 RNG → 실제 journal → R 줍기; 처치 연계 checkpoint | 3.178 / 3.989 | 10.800 / 14.803 |
| equip | PASS | 실제 장착·동일 item identity·PC refresh committed readback | 3.126 / 18.335 | 13.433 / 23.127 |
| auto_potion | NOT_READY | 실제 PC receive_damage 2회; hidden 시계 gate 차단 | 2.990 / 18.063 | 9.765 / 25.297 |
| level_up | PASS | 기존 XP curve·State.addExp; 보상 입력 checkpoint | 2.932 / 2.939 | 9.909 / 10.429 |
| stat_passive_invest | PASS | str+1·pVital+1·예약큐 소비·PC refresh 실제 readback | 2.905 / 2.933 | 12.921 / 16.667 |
| bossroom_gate | NOT_READY | MAP11 gate/arena 전제 없음; unlock 플래그 작성 0 | 2.970 / 3.069 | 9.684 / 9.933 |
| boss_defeat_signal | NOT_READY | Main native_demo_boss_defeated(0) 직접 신호 checkpoint; 실제 보스 처치 아님 | 0.091 / 0.172 | 9.496 / 9.632 |
| clear | PASS | 실제 consumer clear_count=1·중복 신호 재검사 | 0.065 / 0.069 | 9.623 / 9.861 |
| demo_end | PASS | 실제 다음 Button; stage0 유지, stage1 생성 0 | 0.074 / 0.100 | 9.380 / 9.628 |
| save_handoff | PASS | 명시적 실제 session save·디스크 player.lv readback; 자동 저장 연계 아님 | 0.061 / 0.106 | 9.972 / 10.051 |
| lobby_return | PASS | 실제 로비 Button → 최소 로비 scene; Main 해제 | 0.002 / 0.003 | 10.313 / 10.702 |

physics callback은 Main 밖 always-process 우선순위 전후 관찰 노드로 얻은 CPU 구간이며 PhysicsServer 전체·GPU를 포함하지 않는다. process interval은 프레임 간 벽시계(대기 포함), command_span_ms는 비동기 명령 전체 벽시계라 CPU 실행시간이 아니다. 물리 120Hz, 예산 8.333ms. 단계별 budget=EXCEEDED는 기능 PASS와 별개로 보존한다. 최종 physics callback 전체 최대는 18.854ms(intro_skip)로 8.333ms 목표 초과다. 실행 직전 pgrep/wc 원문 수는 godot-gate.jsonl에 기록하며 2 이상이면 30초 대기한다. 사용자 Godot 동시 실행 조건으로 단독 120fps 인증이 아니며 렌더·시각/음향 검수도 아니다.

## 통합 기준·merge 목록

fetch 후 origin/main은 `0138c5bb9188d27cee10cb1a901d075092ddb88f`. 아래 17 tip의 ancestry 포함을 확인했다. MAP11 prod 검색 결과는 remote-heads.txt·map11-prod-recheck.txt·map11-prod-final-recheck.txt에 남겼으며 일치하는 원격 브랜치가 없어 임의 제작/대체하지 않았다. 최신 base에는 etype A/B/D·43/20/19r·PC runtime stat refresh 의존도 포함된다.

| 단위 | tip SHA | 이번 통합 |
|---|---|---|
| demo11-06c | `93f118fb5b63` | merge/ancestry 포함 |
| demo11-07 | `5d07f978c6c9` | merge/ancestry 포함 |
| demo11-08 | `fa55755dbd69` | merge/ancestry 포함 |
| demo11-09 | `dc9f34ea4934` | merge/ancestry 포함 |
| demo11-19ui | `c6f9989ba12d` | merge/ancestry 포함 |
| demo11-21 | `72e602d16432` | main에 기포함 |
| demo11-22r | `d276e02ed3bc` | merge/ancestry 포함 |
| demo11-25b | `a03a0cbc65e7` | main에 기포함 |
| demo11-37 | `05f41cc7b8ad` | merge/ancestry 포함 |
| demo11-38 | `5ff66f327455` | merge/ancestry 포함 |
| demo11-39 | `aa23dd31e046` | merge/ancestry 포함 |
| demo11-43 | `9b763da9900c` | merge/ancestry 포함 |
| demo11-enemy-base | `264069693ff3` | merge/ancestry 포함 |
| demo11-perf-enemy | `aaf52dc0cb44` | merge/ancestry 포함 |
| demo11-31 | `76bcae8d216d` | merge/ancestry 포함 |
| demo11-34 | `e1f51f67eea7` | main에 기포함 |
| demo11-35 | `727f6a0225b6` | main에 기포함 |

통합 baseline은 `b22ab6a8a175429e7c514d2d2ff5668872270c0b`. Main/State EOF 독립 추가 블록은 보존했고, 06c loaded intro 분기와 07 선택기를 함께 유지, 37 endflow/encounter 설치는 기존 intro selector 앞에 유지했다. 08/38의 동일 API 재배치 중복은 한 정의로 유지했다. 31 registry는 기존 natural/D owner guard 다음 fieldboss owner guard를 보존했다. 충돌 해소 로그와 merge-plan.json은 외부 원로그에 보존했다. 이 통합 후 제품 파일 해시 감사 결과 변경 0이다. 이번 독립 변경은 하니스·결과 계약 테스트·문서뿐이며 피해/무적/RNG/스폰/제품 시계 경로를 수정하지 않았다.

## 필요한 제품/통합 인계

- MAP11: 운영 provider 원격 미확인. `native_demo11_encounter.gd:28`의 Marker 계약과 `main.gd` bind_native_spawn_stage_provider/enter_native_demo_arena를 실제 필드가 충족해야 한다. 현재 하니스는 실제 World provider만 검색하며 gate/arena가 준비되지 않으면 NOT_READY다. 미래 운영 gate contact 입력·최종 boss-death owner 어댑터는 그 실제 계약이 배포된 뒤 보강해야 한다.
- headless clock: `main.gd:706` read_native_document_hidden에서 logical window mode=MINIMIZED로 true. root.show/windowed 요청에도 같은 값이며 `native_potion_recovery.gd:30`에서 source_update_gate_or_prefix_not_ready. 자동 물약은 실제 PC receive_damage를 호출했지만 사용량/재료/CD 변화가 없어 NOT_READY. visibility/clock 성공값을 주입하지 않았다.
- 전투·부활: 실제 대상 ID가 없어 enemy kill을 주장하지 않으며 PC life-transition API 부재는 NOT_READY. 입력 드라이버는 실제 Player.request_attack/release_attack→swing→hurtE를 사용하고 halt 시 멈춘다. boss 최종 사망/Exit 접촉을 대신 완료했다고 주장하지 않는다. 직접 clear 신호는 하위 consumer 계약 검증용이다.
- 저장/로비: `native_demo_end_flow.gd:63`은 save_io=false. 하니스는 별도 실제 session save를 요청해 hellsave_demo level readback만 확인한다. 슬롯0 metadata는 존재하나 전체 진행 저장 동기화/continue 경로·내구성 flush는 미인증. `main.gd:3328`은 최소 demo11_lobby.tscn으로 돌아가므로 5슬롯 생성 로비 복귀와 같다고 주장하지 않는다.

## 재실행·검증 기록

- 최종 결과: `/Users/fordeargamers/exoduser-wt/_out/demo11-47h/run-20261021-042720-87000-stages.json`. stdout/stderr와 단계별 전체 JSON을 같은 디렉터리에 보존. latest-result.json은 최신 실행 포인터다.
- 결과 계약 결함 주입 5/0: 가짜 전체 PASS, 단계 누락/격리 이름 오염, 잘못된 장착 readback, checkpoint의 연속 E2E 주장 거부. 최종 종주는 실제 PC refresh committed_fields와 State 값까지 비교한다. 관련 범위 외 회귀는 실행하지 않았다.
- 초기 parse 오류(Curve 이름 충돌/RefCounted 타입), 첫 인트로 입력 정지, 준비 run 중단 기록을 삭제하지 않았다. 하니스 수정에 따른 재실행이며 최종 값을 소급해 초기 PASS로 쓰지 않았다.
- 격리 이름 EXODUSER-demo11-47h-Isolated-20261021을 Store 열기 전에 headless/ProjectSettings/실효 경로로 검증. override.cfg는 각 실행마다 설정 후 비움. 실제 사용자 저장 경로 접근 없음. 원본은 R의 에셋 바이트 참조만. 새 이미지/제품 에셋 없음.
- R의 HEAD/브랜치/추적 파일 변경 0. sparse worktree 생성, 자기 브랜치 일반 push·원격 SHA 확인 후 외부 DONE 작성·자기 worktree 제거. 재실행은 동일 브랜치 새 checkout에서 위 첫 명령으로 가능하다.
