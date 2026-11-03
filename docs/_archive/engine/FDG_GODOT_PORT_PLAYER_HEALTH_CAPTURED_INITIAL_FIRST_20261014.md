## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# FDG Godot Port — Player Health Captured Initial FIRST (2026-10-14)

TASK `GODOT-PORT-PLAYER-HEALTH-CAPTURED-INITIAL-FIRST-20261014`

| 항목 | 값 |
|---|---|
| 코드 (기존 producer 확장) | `godot/port_modules/player_health_parameters_source/producer.gd` |
| 신규 테스트 | `godot/port_modules/player_health_parameters_source/test_captured_initial_first.gd` |
| 실행 상태 | **FIRST PASS 7그룹 / 106 checks** — actual Claude CLI 초안+검사 전 provenance 정정 1회, Codex isolated executor attempt1 exit0 / stderr0 / SCRIPT_ERROR0. FAIL/INVALID·검사 후 수리·성공 재실행0. source/test FROZEN |
| main_ready | **false** — 본 scope는 Main/Player/current authority/중앙 sink dispatcher의 설치·실제 Main 실행을 수행하거나 검수하지 않음 (ENGINE 인계) |
| 공식/수치 | 변경 0. `packet.kind/source/pass_id/writes/gaps`, `values`, `run_phase` 수치 동작 보존 |

## 문제

effective5 (`P._effStats` @28570) 는 같은 prefix 의 HP `plan_initial()` + resource `plan_apply_stats()` 를 **각 1회** 캡처해 조립한다. 기존 `run_phase(INITIAL)` 은 다시 계획(source/affix/lv_b 재조회)하고, 캡처 packet 을 중앙 sink 에 직접 적용하면 Health pass/ACK 가 열리지 않아 이후 `CRYSTAL_MHP`/`FORTIFY` 가 `stage_order` 로 거부된다.

## 신규 공개 API / 메타데이터

| API | 동작 |
|---|---|
| `plan_initial()` 반환 최상위 `capture` (상수 `CAPTURE_KEY`) | **READY 결과에만** 추가: `{issuer:int (producer get_instance_id), config_epoch:int, serial:int (단조), pass_id:int (캡처 시 pass)}`. `packet`/`values` 는 불변 — 메타데이터 추가는 이 최상위 키 1개 |
| `run_captured_initial(plan: Dictionary) -> Dictionary` | envelope+기록 검증 → `run_phase` 와 같은 pass open → `health_sink(packet)` 1회 → ACK 시 `_acked{mhp,hpR}`/`_done=INITIAL`. 재계획 0 |
| `initial_capture_state() -> Dictionary` | `{config_epoch, pass_id, done, recorded, recorded_pass_id, recorded_serial, issuer, last_serial, last_consumed_serial}` 진단 |
| `CAPTURE_REJECTED` | malformed/foreign/epoch·serial·pass stale/중복/current-before 불일치. 바인딩·current authority 부재는 `NOT_READY` |

결과 `out`: `{phase, status, ready, reason, action, dispatched, plan, pass_id(새 pass), captured:true, captured_pass_id, captured_serial}`. dispatch 사본의 `packet.pass_id` 는 새로 연 pass — `run_phase(INITIAL)` packet 과 동일 (테스트 `run_phase_parity`). `run_phase(INITIAL)` 의 `out.plan` 에도 envelope 가 보인다 (값 아닌 메타데이터).

## 내부 변경 (기존 동작 보존)

| 변경 | 이유 |
|---|---|
| `run_phase` 의 sink/ACK 꼬리 → `_dispatch_planned()`, pass open → `_open_pass()` | 두 경로가 같은 dispatch/ACK/`_cr` open 로직 사용 |
| `plan_initial()` READY 시 `_capture_serial += 1`, envelope 부착, 기록 `_initial_capture = envelope + {done, packet, values 사본}`. 시작 시 이전 기록 폐기 | provenance 정확 대조 |
| `run_phase(INITIAL)` / `run_captured_initial` pass open 시 `_last_consumed_serial = serial` (sink NACK 포함) | 1회 사용 |
| `configure()`/`clear()` → `_config_epoch += 1` + 기록 폐기 | 이전 바인딩 plan 거부 |
| `MISSING_UPSTREAM`/`SCOPE`/`readiness()`/`stage_state()` | 변경 0 |

## 검증 순서 (`run_captured_initial`)

| # | 검사 | 실패 status / reason |
|---|---|---|
| 1 | configure + `player` provider 바인딩 | NOT_READY `not_ready:not_configured` / `not_ready:provider:player` |
| 2 | `health_sink` 유효 | NOT_READY `health_sink_missing` |
| 3 | `status==READY` | CAPTURE_REJECTED `captured_not_ready:*` |
| 4 | packet / kind / source | `captured_packet_missing` / `captured_wrong_kind:*` / `captured_wrong_source:*` |
| 5 | `packet.pass_id` int, `values` Dictionary | `captured_pass_id_missing` / `captured_values_missing` |
| 6 | envelope Dictionary, 4 필드 모두 `TYPE_INT` (float/String 거부) | `captured_envelope_missing` / `captured_envelope_field_not_int:<k>` |
| 7 | `issuer == get_instance_id()` | `captured_foreign_issuer` |
| 8 | `config_epoch == 현재` | `captured_config_epoch_stale:captured=… current=…` |
| 9 | `serial != last_consumed_serial` | `captured_initial_already_used:serial_<n>` |
| 10 | envelope.pass_id == packet.pass_id == 현재 pass | `captured_envelope_pass_mismatch:*` / `captured_stale_pass:*` |
| 11 | 기록 존재, `serial == 기록 serial` | `captured_initial_unrecorded` / `captured_superseded:serial=… current=…` |
| 12 | 캡처 후 `_done` 불변 | `captured_stage_progressed:*` |
| 13 | packet/values == 기록 사본 (변조) | `captured_not_from_this_producer` |
| 14 | 현재 P 읽기 (`player` provider **정확히 1회**) | NOT_READY `authority_null:player` / `unsupported_shape:player` |
| 15 | current-before: 현재 `P.mhp`/`P.hpR` 존재·타입·값 == `writes[].before` | CAPTURE_REJECTED `captured_current_before_diverged:P.<f>(…)` |

1–15 실패: sink 0, pass/ACK/기록 불변. 통과 후 sink NACK: `run_phase` 와 동일 (pass 열림, ACK 0, `SINK_REJECTED`), serial 은 이미 소비 → 새 `plan_initial` 필요.

출력이 완전히 같은 plan 도 (a) 다른 producer → issuer, (b) configure/clear 이전 → epoch, (c) 같은 prefix 재계획으로 대체 → serial 로 거부된다. `duplicate(true)` 사본 (effective5 cohort defensive copy 포함) 은 정수 필드가 보존되어 유효하다.

**성격:** source API provenance 검사이다. 전역 source mutex, 보안 token, 위조 방지 gate 가 아니다 (envelope 를 정확히 복제한 호출자는 막지 않음). `issuer` 는 Godot instance id 이며 프로세스 내에서만 의미가 있다 (저장/복원 대상 아님).

## Captured 전제 / current-before seam (정확)

| 항목 | 계약 |
|---|---|
| 캡처 | applyStats prefix (@28566-28569) — 같은 HP producer 인스턴스의 `plan_initial()` 1회 (최신 serial), resource `plan_apply_stats()` 1회 |
| 캡처~사용 사이 허용 | `P._effStats` write (@28570, effective5 sink) — 거부하지 않음 |
| 캡처~사용 사이 금지 | 이 producer 의 `plan_initial`/`run_phase(INITIAL)`/`configure`/`clear`/stage 진행, 다른 writer 의 `P.mhp`/`P.hpR` 변경 |
| 사용 시 현재 읽기 | `player` provider 1회 (mhp/hpR before 대조). stats/passives/inventory/g/diff/eq_affix/eq_implicit/lv_b/cache 호출 0 |
| **검증하지 않는 것** | 캡처 이후 STATS/INV/PASSIVES/G/OPT/affix·eqStat 캐시/`P.lv` 변경 — 전체 provider freshness 재검증 없음 (재조회 금지 범위). 같은 applyStats pass 내 불변은 ENGINE 책임 |
| 원 순서 | sink 는 `writes[0] mhp` → `gaps[after_write_0]` (28583-28591 nonHP; @28589 새 mhp 읽음) → `writes[1] hpR` 적용 후 bool ACK |
| 이후 | `run_phase(CRYSTAL_MHP)` → `CRYSTAL_HPR` → `FORTIFY` 기존 그대로 |

## 신규 테스트 group (첫 실행 고유 7/106 PASS)

```
godot --headless --path godot --script res://port_modules/player_health_parameters_source/test_captured_initial_first.gd \
  -- [--only=group1,group2] [--report=/abs/path.json]
exit 0 PASS / 1 FAIL / 2 INVALID (0 checks 또는 unknown group)
```

| group | 내용 |
|---|---|
| `captured_once_effective5` | HP/resource 각 1회 캡처 (tag 계수), envelope 정수·packet 키 불변 → 실 effective5 → **cohort deep copy** 로 captured initial ACK → crystal_mhp/hpR/fortify. 재계획 0 (hp.player +1 만), sink 순서 `_effStats→mhp→gap→hpR`, `stage_acked:pass_1` |
| `bypass_contrast` | 중앙 sink 직접 적용 → ACK 0 → crystal `stage_order`, 이후 seam current-before 거부 |
| `run_phase_parity` | captured 와 `run_phase(INITIAL)` packet/stage_state 동일, run_phase plan 재사용 `already_used:serial_1` |
| `captured_refusals` | kind/source/packet pass_id·타입/NOT_READY/값 변조/중복/stage 진행/재계획 실패 unrecorded/run_phase 후 stale/다른 writer current-before |
| `identical_output_provenance` | 출력 동일 foreign issuer / configure·clear 이전 epoch / 같은 prefix 대체 serial, envelope 결측·float·String·issuer·serial 위조, 정상 deep copy READY |
| `sink_nack` | NACK → P 불변, pass open, ACK 0, crystal 거부, serial 소비 (`already_used`), 새 캡처 READY |
| `authority_gaps` | 미구성/sink 부재/P null·Array/player provider 부재 = NOT_READY, 캡처 유지 후 복구 READY |

Fixture (constructor 고정, private — Main 값 아님): P `{lv6,hp300,mhp350,hpR.07,mp100}`, STATS `{str5,dex4,int3,lck2}`, PASSIVES `{pMelee1,pHuman1,pFortify2}`, G `{on,stage2}`, OPT `{diff5}`, gloves `{bStr2,bonusHp10,enh3, strFlat1/maxHPFlat20/lifeRegen6}`, armor `{bDex1,bInt2,bonusHp5,bonusMp4,_iMaxHP15, maxHPPct.1}`. 실 helper: `equipment_affix_reader`, `combat_reference_source`, `combat_stat_formula.eq_implicit`, `kill_reward/source_difficulty_signed`, HP `grit_hp_flat_provider(rp)`. `_cr` 는 캡처된 resource plan `_crystalStats` (재호출 0).

| 기대값 | 원 식 대입 |
|---|---|
| `_effStats` | str11 dex8 int8 vit0 lck5 |
| initial mhp / hpR | `~~(414*1.13)=467` / `.05+11*.002+6/60` |
| crystal mhp / hp | `~~(467+0)+100+3=570` / 300 |
| fortify mhp / hp | `570+600=1170` / 300 |

기존 HP `test_first.gd` 및 다른 old test 읽기·실행·복사0, 기존 HP6/87·effective66·DEF62/source 성공 suite 재실행0. 범위 편차: 초안 Claude의 첫 docs keyword Grep에 옛 HP doc basename이 files_with_matches 1회와 content 1회 반환됐다. 직접 Read0이나 해당 keyword 한 줄 반환을 본문 접근0으로 주장하지 않는다. 그 옛 문서 전체/옛 검사 출력은 재회수하지 않았고, 이후 모든 검색에서 해당 basename을 명시 제외했다. 마케팅 제외 basename의 결과/Read0.

### 첫 실행 ledger

| group | 유효 PASS checks |
|---|---|
| captured_once_effective5 | 28 |
| bypass_contrast | 4 |
| run_phase_parity | 6 |
| captured_refusals | 27 |
| identical_output_provenance | 27 |
| sink_nack | 7 |
| authority_gaps | 7 |
| 합계 | **106 (7그룹), FAIL0/INVALID0** |

attempt1: Godot 4.7.2 `--headless`·전용 `fixture-attempt1`, exit0 / 0.605913375초 / stderr0 / SCRIPT_ERROR0. 실행 GD closure8 = 소유 producer+신규 test2 및 기존 production6. 자원/이미지 copy·hash·import0, old test 복사·실행0. 모든 fixture 객체는 RefCounted이며 명시 함수 호출만 사용했다. 자동 clock/physics/process/render·GUI/public play·GPU/240FPS 검수0.

대표 새 실제 consumer episode: Health 초기 계획1회 + Resource 계획1회 캡처 → 기존 effective5 sink1 → 새 Health captured sink1 → 기존 후속 Health sink3(결정 MHP, HPregen, Fortify). 즉 해당 episode에서 effective1+Health4 ACK, resource sink0. `P._effStats` 5필드 → 초기 mhp467 → 원 after_write_0 gap에서 mhp467/hpR이전.07 → hpR.172 → 결정 mhp570/hp300 → Fortify mhp1170/hp300. current health getter가 `stage_acked:pass_1`를 읽었다. 이 수치는 격리 생성자 fixture이며 actual Main 값/전체 source query parity 증명이 아니다.

초안 PID38560/session `e7057dca-01ef-4ad7-bd71-f9dc67df83bc`, model `claude-opus-5-5`, duration727612ms. 검사 전 동일 session provenance 교정 PID39473, duration223796ms; permission denial0·restricted/dontAsk·정확 소유3경로 Write/Edit만. 구조적 packet/values 동등성만으로 foreign/old-config/superseded를 구분하지 못하는 초안을 executor가 첫 검사 전에 발견했고 actual Claude가 capture envelope로 교정했다. 그 교정 전 검사0. Codex는 fixture 실행과 최종 doc/ledger/handoff만 처리했고, 검사 후 code/test 수리0.

## 미이식 / 범위 밖

| 항목 | 상태 |
|---|---|
| Main/Player current P/STATS/INV/G/OPT authority | 본 scope 설치·실 Main 검수0 — ENGINE/BUILD |
| 중앙 applyStats dispatcher (HP/resource/nonHP interleave, gap 실행) | ENGINE |
| 실 공유 current `_cr` stage (crystalEffects) | 테스트는 캡처 resource 값 — ENGINE 이 같은 pass `_cr` 공급 |
| 캡처 이후 전체 provider freshness 재검증 | 미구현 (재조회 금지) |
| envelope 를 effective5 cohort_id 와 결합 | 미구현 (effective producer 범위 밖) |
| resource `plan_apply_stats` captured dispatch seam | 범위 밖 (resource owner) |
| Q/E, blackBean, poise, resource 식, effect clock, skill | 변경 0 |

## 중앙 통합 요구 (ENGINE — 이 문서는 Main 통합 주장 안 함)

1. applyStats prefix 에서 같은 HP producer 인스턴스의 `plan_initial()` 1회 + resource `plan_apply_stats()` 1회 캡처 → effective5 cohort (envelope 포함 plan 그대로).
2. `_effStats` sink 후, 그 사이 `plan_initial`/`run_phase(INITIAL)`/`configure`/`clear` 없이 `run_captured_initial(<그 plan 또는 deep copy>)`.
3. `health_sink`: `writes[0]` → `after_write_0` nonHP gap → `writes[1]` 적용 후 `true`. 실패는 `false`로 전달한다. 격리 NACK fixture는 적용0이지만 실제 중앙 sink의 이미 적용된 prefix를 이 API가 되돌리지 않는다(rollback0). 실제 sink 실패 처리/부분 대입은 ENGINE 소유다.
4. ACK 후 `_cr` stage (28593-28600) → `run_phase(CRYSTAL_MHP)`, 28602-28604 → `CRYSTAL_HPR`, 28606-28615 → `FORTIFY`.
5. `CAPTURE_REJECTED` → 그 applyStats pass 재캡처. `NOT_READY` → authority 복구 후 같은 캡처 재시도 가능.

## 관련 문서 (ENGINE 동기화 인계, 이 문서 외 편집 0)

읽음: `FDG_GODOT_PORT_PLAYER_EFFECTIVE_STATS_SOURCE_FIRST_20261013.md`, `FDG_GODOT_PORT_PLAYER_RESOURCE_PARAMETERS_SOURCE_FIRST_20261013.md`, `FDG_GODOT_PORT_SOURCE_DIFFICULTY_SIGNED_FIRST_20261014.md`. 최초 키워드 검색은 `**/INGAME_CAPTURE_STUDIO_20261009.md` 제외 (미접근). 정정 단계 추가 docs 검색 0.

동기화 후보 (미편집): 기존 HP parameters 문서 (직접 Read0·앞서 keyword content1 반환 편차 기록 — `run_captured_initial`/`CAPTURE_REJECTED`/`plan_initial` envelope 반영 필요), effective stats 문서 (한계 표 HP@28582 call-site), `FDG_GODOT_MAIN_SOURCE_AUTHORITY_20261014.md`, `FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md`, `FDG_INTEGRATION_INTERFACE.md`, `FDG_ENGINE.md`, `docs/CHANGELOG_SYNC.md`. `docs/2_3*` immutable.

Keywords: run_captured_initial, captured initial, capture envelope, issuer, config_epoch, serial, plan_initial, applyStats, 28582, 28592, effStats, CAPTURE_REJECTED, current-before, player_health_parameters_source

## 외부 백업 / own-hunk / 정상 checkpoint 인계

실행 전 executor가 기존 Health producer WORK35231B 전체를 외부 `producer-working-before.gd`로 백업하고 exact HEAD 경로 부재(exit128)를 `prewrite.json`에 기록했다. 원 파일·실 parent는 symlink가 아니며 실제경로는 workspace와 같았다. 신규 test/doc는 WORK/HEAD 부재 확인 후 생성했다. provenance 교정 전에도 소유3파일 bytes를 다시 외부 백업했다. 실제 HEAD bytes가 없는 상태를 백업 성공으로 주장하지 않는다.

소유 producer 변경은 capture provenance/private record와 기존 pass-open/dispatch/ACK 경로 재사용뿐이며 원 HP 수식·phase source·packet writes/gaps·current health 계산은 변경0. exact own-hunk는 외부 `producer-own-hunk.diff`, 최종 소유3개 manifest·첫 ledger·공통 docs 매칭 목록은 같은 proof 폴더에 인계한다. 기존 공통 HP 문서/효과5/통합 Main/provider docs의 현재 API 동기화와 정상 code+docs checkpoint는 ENGINE 소유. 우리 Git mutation0·공유 파일 edit0·인간 paused 화면/save/서버/shipping artifact 조작0.
