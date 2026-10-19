# Actual Main source Player initialization — 2026-10-14

실제 `res://scenes/main.tscn`의 새 Player에 원 초기화 대입을 Tree 진입 전에 연결하는 첫 통합 검수에서 **신규 고유5그룹117개 검사**를 통과했다. 생산자 공식의 재검사와 기존 성공군 재연은 하지 않았다. attempt01의 4그룹69개 clean PASS는 동결했고, FAIL1·fixture SCRIPT_ERROR1의 결정값 비교 그룹만 수리하여 attempt02에서48개를 통과했다. 첫 실패 이력은 영구 보존하며 첫 실행 전체를 clean PASS로 다시 쓰지 않는다.

| 항목 | 실제 범위 / 계약 |
|---|---|
| 신규 검사 | `godot/tests/test_native_main_source_player_initialization.gd` — actual Main scene만 생성, group 전후 소유 Main 해제. 실패한 await의 caller도 자신이 만든 Main을 제거하고 해제 |
| 생산 소유 | primary Main / SourceServices, dispatcher worker, Player·State·ResourceAuthority sink worker; 본 검수 worker는 생산 코드 변경0 |
| 실제 순서 | 원 `_effStats28570 → mhp28582 → baseDef28583 → poise28584..86 → baseAtk28588 → speed28589/_oocSpeed28590 → stR28591 → hpR28592 → mmp28593/mpR28594 → _crystalStats28600 → crystal HP28601/ATK28602/DEF28603/speed28604/hpR28605 → resource28606..14 → conditional fortify/armor → shield28622..23 → invalidate16934 → mst/st16939` |
| 원 plans | Health initial capture1 / Resource applyStats capture1. 같은 cohort의 원 계획 값과 실제 `State.currentP._crystalStats`의 공급·후속 phase provenance를 검사. 동기 sink의 deep copy가 있으므로 original scratch crystal object identity 증명0 |
| 동일 참조 | actual Main·Player·World·State·Resources ownership과 actual current P getter의 동일 owned Dictionary 참조. 캡처 JSON의 동일 객체 주장0 |
| 실제 대입 | State의 승인 write ledger와 dispatcher trace를 field/source/kind/pass/index별 대조. actual committed writes28을 관측. 최종 write 값은 actual actor/source resource/owned P readback에 연결. ST는 Tree 진입 후 기존 prototype .28 회복이 가능하므로 constructor ledger와 current 값을 구분; 자동 source 회복은 미바인딩 |
| source speed | raw px/native tick를 Player가 보유하고 actual movement에서는 ×60 px/sec 소비. Tree `_ready()`와 public movement/damage 후 동일 원값 유지. 한 runtime slice에서 actual raw2.70946→velocity162.5676px/sec·World10ticks 이동27.09473px·publicmagic20 HP350→330 관측 |
| 시계 | 실제 World 60Hz physics 자연 진행만. `Engine.max_fps=240`은 표시 상한 설정으로만 검사하며 달성 FPS 주장0. manual physics/private clock setter0 |
| 현재 OPT/G | 실제 owned non-electron OPT35 / `current_pre_restore` / current diff5→signed0. 실제 G.on=false인 pre-stage. 원 설정 복원·stage 발행·full bootstrap 주장0 |
| 완료 / 잔여 | dispatcher.completed 및 source_anchor_order_complete는 원 anchor 쓰기의 완료. Resources `derived/derived_ready=false`, State `derived_parameters_ready=false`, Main `main_full_ready=false`, automatic regeneration=false 유지 |
| 미증명 | 원 JS single17 loop/lvB1 및 전체 source query 순서, original scratch crystal identity, full gameplay 소비·자동 회복·source stage/bootstrap·public visuals·240FPS |
| once / live gate | 완료 owner의 재초기화·Tree actor/source resource write·재bind 거부, 실제 current 값/trace/capture 수 불변. prefix rollback0 |
| lifecycle | supplier/State loss에서 서비스 및 current difficulty는 NOT_READY/null. 초기값·signed0·자원 refill·source 재초기화 fallback0 |

| 신규 고유 group | 의미 있는 oracle | 실행 상태 |
|---|---|---|
| `source_anchor_order_same_owner` | 실제 원 anchor interleave / State ledger acceptance / same actor·World / completion과 full ready 분리 | FIRST CLEAN PASS36 |
| `shared_crystal_current_values` | capture 각1 / actual owned P identity / 계획-실제 current crystal 값과 cohort / actual fields·자원 readback / 원 Health phase provenance | attempt01 INVALID44 → failed-only attempt02 CLEAN PASS48 |
| `movement_damage_preserves_source_speed` | 공개 이동 입력→자연 World frames / actual displacement·velocity / public damage와 P sync / Tree후 speed 보존 | FIRST CLEAN PASS10 |
| `options_context_lifecycle` | actual OPT35/pre_restore/current signed0·G.on=false / 실제 State 해제→NR/null / actor 값 불변 | FIRST CLEAN PASS11 |
| `constructor_once_no_live_reset` | completed owner 중복시도와 public endpoint live writes 거부 / 새 capture·실제 write0 / current 값 불변 | FIRST CLEAN PASS12 |

| 실행 보호 / 이력 | 현재 사실 |
|---|---|
| 고립 stage | `dependency-source-player-initialization-first/stage/godot` — prior7432 code/cachemetadata만, 원 assets/data/imported readonly symlinks, 기존 테스트 복사0 |
| userdata | `EXODUSER-MainSourceInitialization-Isolated-20261014`를 runtime 시작 전에 exact guard. 기존 `user://qa/latest-session.json` 접근0 |
| 최초 백업 | 소유 신규 test/doc WORK 부재 marker 및 `tests/backup-before-draft/receipt.json` 보존 |
| runtime / metadata / 보호 영역 | 새 runtime2(첫5+실패1 only) / actual engine ResourceUID metadata1(신규3, 검사group0) / editor·assets import·GUI·서버·Git·기존 userQA0 |
| 수리 / 재연 규칙 | 첫 parse/runtime 원 stdout·stderr·exit·시간·그룹별 assert를 영구 보존. 실패/INVALID 영향 그룹만 수리 후 실행, clean 성공 재연0 |
| 자동 오류 판정 | exit0 또는 assertion 실패0만으로 clean PASS를 세지 않음. SCRIPT/Parse Error와 미완 coroutine은 INVALID로 기록 |
| 문서 동기화 | 신규 test 작성 뒤 docs 전체 관련 키워드 rg 및 literal grep 기록. 보호 `2_3` 및 마케팅 문서 본문 수정0 |

## 23. MAP PRODUCTION REPORT

| 단계 | 이번 검수 범위 |
|---|---|
| MASTER PLAN / LARGE OUTER MASS / MEDIUM / GROUND / LANDMARK / SMALL DETAIL | 기존 맵·geometry·collision·source PNG·배치 변경0; retained1047줄 맵 가이드 및 stage SSOT 적용 |
| PLAYABLE / COMBAT | actual Main startup와 공개 이동/피격을 검사할 예정. 원 Q/E·HP 수식·AI·판정 변경0 |
| CAMERA QA / TECH QA | actual Main CameraTree 고립 headless 신규5/117 통과. 첫4/69 동결+failed-only48. 공개/GUI/픽셀 검수0 |
| VISUAL VERDICT | **RETOUCH** — NO PUBLIC PIXEL QA. 초기화 통합 검사 결과를 모델·시각 품질·출시 준비 완료로 대체하지 않음 |

## 최초 실행 이력

| attempt | 선택 / 결과 | 원 증거 / 판정 |
|---|---|---|
| 01 | 새5그룹만 / 113assert / FAIL1 / SCRIPT_ERROR1 / Parse0 / exit1 / 6.540462292초 | `tests/attempt01-stdout.txt`, stderr, receipt, input byte snapshot 영구 보존. clean4/69 동결, shared44 INVALID |
| 02 | `--only=shared_crystal_current_values` / 48assert / FAIL0 / SCRIPT_ERROR0 / Parse0 / ERROR0 / exit0 / 2.292516833초 | `tests/attempt02-stdout.txt`, stderr, receipt, input test snapshot. repaired 실패 그룹만 첫 clean; 기존4 성공 재연0 / production 수리0 |
| 01 fixture 결함 | DSP result의 원 `plan.inputs`를 직접 `inputs`로 읽어 오류. ST constructor-final와 Tree-current exact 비교가 기존 prototype 회복 시점을 혼동 | production 변경0. 최초 ST 숫자쌍은 coroutine 중단 전에 저장되지 않아 NOT_OBSERVED; 첫 값을 새 실행으로 재구성하지 않음 |
| 수리 | 실패한 shared 그룹만 `plan.inputs`를 소비; constructor State/Authority ST acceptance 및 cap/current actor를 분리하고 두값을 즉시 저장 | `tests/before-shared-fixture-repair/`와 exact diff 보존. 같은 startup에서 공격하지 않고 HP source readback도 유지하는 관측 조건의 ST 비교이며 새 회복 정책이 아님 |
| cleanup | caller가 각 Main을 생성 직후 등록하고 group 종료 후 제거/free. 첫 오류 뒤에도 owned Main5 cleanup IDs 관측 | 동일 runtime 내 겹친 Main0; global/render 품질·화면 결과 증명0 |
| 실제 ST 관측 | attempt02 constructor State/Authority accepted ST200.0 / Tree-current actor ST200.14 / actual owned MST332.0 / automatic source regeneration bound=false | 이 숫자는 새 failed-only runtime의 실제 관측. attempt01 두값의 재구성 아님. 무공격 startup과 actual HP source readback 유지 조건에서 legacy ST 회복을 구분하며 새 회복 정책/원 source 전체동등 주장0 |

신규 UID3은 actual Godot `ResourceUID.create_id/id_to_text`로 고립 stage에 생성했다: Dispatcher `uid://f6xakaun6htf`, Services `uid://bc7u3epqq2lfa`, 신규 test `uid://cr6lwj40v12it`. metadata0.603577792초/exit0/ERROR0·group0이며 첫 통합 그룹 결과와 구분한다. 원 UID/PNG 재검사·복사·import0.
