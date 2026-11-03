## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

# FDG Godot Port — player_defense_speed_parameters_source FIRST (2026-10-13)

TASK `GODOT-PORT-PLAYER-DEFENSE-SPEED-PARAMETERS-SOURCE-FIRST-20261013`
Status: **The DEF/speed producer is written, split into the three original source-position phases. It uses the real public APIs of the HP and resource producers. The first valid isolated run passed 8 groups / 62 checks, with no FAIL/INVALID/repair/repetition.** Main installation and the central orchestrator are not done, and no Main readiness is claimed.

Pre-test correction (2026-10-14, before any run): the duplicated `_gritTotal` five-term assembly is removed and replaced by one `read_source_grit_total()` call. The single whole packet is split into early/crystal/armor phases. The HP 400 constant stub is replaced by the real `player_health_parameters_source` PHASE_INITIAL `after_write_0` gap. The resource plan is now a once-per-pass supplied result.

## 1. Owned files (these 3 only)

| File | Role |
|---|---|
| `godot/port_modules/player_defense_speed_parameters_source/producer.gd` | DEF/speed source phases (pure plan + per-phase ordered sink), `HpInitialGapSeam`, readonly getters |
| `godot/port_modules/player_defense_speed_parameters_source/test_first.gd` | Isolated first test (SceneTree, `--only` group) |
| `docs/engine/FDG_GODOT_PORT_PLAYER_DEFENSE_SPEED_PARAMETERS_SOURCE_FIRST_20261013.md` | This doc |

No other files were edited: the HP/resource producers, shared code, Player/World/Main, common docs, Git, PNG, save, and settings were left alone.

## 2. Original quantities and source phase schedule (canonical `game.html`, read-only)

| Line | Original | Owner / phase |
|---|---|---|
| 29657 | `mkP` `baseDef:2, speed:2.6` | `source_boot_parameters()` only (SOURCE_BOOT, current/derived=false). Not used as a fallback |
| 4004/4009 | restore `pd.baseDef\|\|2`, `pd.speed\|\|2.6` | save_adapter. Here only `read_current_parameters()` reads it |
| 28569 | `s.dex` | resource (`values.s_dex` from the supplied plan) |
| 28582 | `P.mhp=…` | HP `apply_stats_health_initial` write 0 |
| **28583** | `P.baseDef=2` | **PHASE_EARLY** (inside the HP initial gap `after_write_0`, 28583-28591) |
| **28589** | `P.speed=(2.6+s.dex*.005)*(1+(P._altSpd\|\|0)+_eqAffix('movSpeed')+_eqAffix('movSpeedCombat')+_eqImplicit('_iMovSpd')*.01+pPredSpd()+(P._okSpdBuff>0?P._okSpdMul\|\|0:0)+(_eqAffix('injuredSpeed')>0&&P.hp<=P.mhp*.5?_eqAffix('injuredSpeed'):0))` | **PHASE_EARLY** |
| **28590** | `P._oocSpeed=_eqAffix('movSpeedOOC')` | **PHASE_EARLY** |
| 28592 | `P.hpR` | HP initial write 1 |
| 28596-28600 | `_cr` / `P._crystalStats` | resource (`values._crystalStats` from the supplied plan) |
| 28601 | `P.mhp=…;P.hp=Math.min` | HP `apply_stats_health_crystal_mhp` |
| **28603** | `P.baseDef+=~~_cr.def+_eqAffix('defFlat')+~~(_gritTotal()*.5)` | **PHASE_CRYSTAL** (HP crystal_mhp gap `end`, 28602-28604) |
| **28604** | `P.speed*=(1+_cr.spd*0.01)` | **PHASE_CRYSTAL** |
| 28605 / 28616-28617 | hpR / pFortify | HP |
| **28619-28620** | `_aLv=PASSIVES.pArmor\|\|0; if(_aLv>0){P.baseDef+=_aLv*20}` | **PHASE_ARMOR** (HP fortify gap `end`, 28618-28624). When `_aLv<=0` the action is `no_write` |
| 28712 | `pPredSpd(){return P.hp<=P.mhp*.3?(PASSIVES.pPred\|\|0)*.05:0}` | getter (`pred_spd_term`, `p_pred_spd`). No stored field |
| 28680 | `pDefAdd(){return (P._altDef\|\|0)*30}` | getter (`p_def_add`). No stored field |
| 28559 | `_gritTotal()` | **Public seam** `player_resource_parameters_source.read_source_grit_total()`, called once at the 28603 read point. Not reassembled here |

`SOURCE_SCHEDULE` / `source_schedule()` records each phase's host gap and its after/before lines.

**Phases are not all assigned before 28601.** EARLY's writes must be applied inside HP initial's `after_write_0` gap; CRYSTAL and ARMOR must run at their own original positions. The central orchestrator (ENGINE) calls `run_phase` at each `SOURCE_SCHEDULE` position. This module has no timer, global driver, or self-invocation.

Real interleaved order, verified by the test's `source_order` group:
`mhp@28582 → baseDef@28583 → speed@28589 → _oocSpeed@28590 → hpR@28592 → mhp@28601 → hp@28601 → baseDef@28603 → speed@28604 → hpR@28605 → mhp@28617 → hp@28617 → baseDef@28620`

## 3. Public API (`extends RefCounted`)

| API | Description |
|---|---|
| `PHASE_EARLY` / `PHASE_CRYSTAL` / `PHASE_ARMOR`, `PHASES` | `apply_stats_def_speed_early/crystal/armor` |
| `static source_boot_parameters()`, `static source_schedule()` | boot provenance and source positions |
| `configure(providers, sink)`, `clear()`, `readiness()` | Per-phase readiness (`phases`) + `conditional_unbound`. Strongly retains RefCounted owners |
| `plan_phase(phase)` / `plan_early()` / `plan_crystal()` / `plan_armor()` | Pure plans. Packet `{kind, pass_id, source, writes:[{field,value,source,expr}]}` + `values` + `inputs` (provenance current/derived/not_required) |
| `run_phase(phase)` | Plan, then one sink call when it has writes. EARLY opens a new pass. CRYSTAL requires EARLY done, ARMOR requires CRYSTAL done, and the current `P.baseDef/P.speed` must equal this pass's acked values. Statuses: `READY`/`NOT_READY`/`SOURCE_NON_FINITE`/`SINK_REJECTED`; action `dispatch`/`no_write` |
| `stage_state()`, `dispatch_count()`, `hp_call_count()`, `grit_call_count()`, `last_result()` | diagnostics |
| `pred_spd_term`, `p_pred_spd()`, `p_def_add()` | readonly getters (current P). Missing → NOT_READY |
| `read_current_parameters()` | Raw current P `baseDef,speed,_oocSpeed`. Missing or non-finite → NOT_READY |
| inner `HpInitialGapSeam` (`open(applied_mhp, pass_id)`, `close()`, `is_open()`, `read()`) | Marks the HP initial `after_write_0` gap. The central HP sink opens it right after applying write 0 (mhp@28582) and closes it before write 1. It never generates values |

## 4. Providers / dependencies

| Key | Phase | Production API |
|---|---|---|
| `player` | all | current P (ENGINE authority missing) |
| `passives` | EARLY, ARMOR | `player_passives_source.read_current_passives` (wrapped) |
| `eq_affix` | EARLY, CRYSTAL | `equipment_affix_reader.eq_affix` |
| `eq_implicit` | EARLY | `combat_stat_formula.eq_implicit` |
| `grit_total` | CRYSTAL | `Callable(resource,"read_source_grit_total")`. Only READY with a finite value (true 0 included) is used. NOT_READY or SOURCE_NON_FINITE (value null) → NOT_READY, with no 0 filled in |
| `resource_plan` | EARLY, CRYSTAL | Returns **the result already computed once in the same pass** by `resource.plan_apply_stats()`. This producer never calls plan_apply_stats itself. Only READY or SOURCE_NON_FINITE `values` (`s_dex`, `_crystalStats.def/spd`) are consumed |
| `hp_mhp_28582` | EARLY (conditional) | `Callable(seam,"read")`. Requires: seam open (status READY), phase `game.html:28582`, finite value, **and value == current P.mhp**. Then the current P.mhp is used. Closed gap → `hp_28582_gap_closed`; mismatch → `current_P_mhp_not_28582_applied`. The stale previous P.mhp, the final mhp after 28601/28617, and the boot value are never used |
| sink | all | `Callable(packet)->bool` (ENGINE) |

Removed own bindings: `eq_stat`, `lv_b`, `grit` (the resource provider owns these through its own bindings).

**STR/VIT independence:**
- DEF does not use STR/VIT/HP at all.
- speed does not compute effective STR/VIT. It reads the current P.mhp that HP applied at @28582 (an HP-owned calculation), and only in these two cases:
  1. `(PASSIVES.pPred||0)*.05 != 0` (NaN included).
  2. `_eqAffix('injuredSpeed')>0`.
- In every other case both branches give 0, so the result is exactly independent. The seam is never called, and inputs are recorded as `not_required`.
- `P.hp` is the current value before the 28601 clamp (unclamped). Missing → strictly NOT_READY.

## 5. JS semantics

- `~~` = ToInt32.
- `(x||0)` used in `*`/comparison = ToNumber. In `+`, a truthy string/object is string concatenation, so it gives NOT_READY `unsupported_js_plus_operand`.
- `P._okSpdBuff>0` uses ToNumber, so undefined is false.
- Left-to-right association and call order are preserved (`defFlat` → `_gritTotal` at 28603).

## 6. First test (8 groups / 62 checks PASS)

`godot --headless --path godot --script res://port_modules/player_defense_speed_parameters_source/test_first.gd -- [--only=<group>]`
Exit codes: 0 PASS / 1 FAIL / 2 INVALID. Any SCRIPT ERROR on stderr makes the run INVALID.

Real instances:
- affix, cref, formula(eq_implicit), grit, crystal, resource (`plan_apply_stats` called once in the builder; `read_source_grit_total`), HP (`run_phase` for all 4 phases, with `grit_hp_flat_provider(res)`).
- The HP `crystal_stats` provider is the `_crystalStats` from the same once-computed plan. The crystal call_count is checked to prove no regeneration.
- `SourceRoot` is a **test-only stand-in for the central sink**, not ENGINE's product orchestrator. It reads the HP packet's `gaps`; at `after_write_0` it opens the seam, runs DSP EARLY, and closes the seam.

| group | What it checks |
|---|---|
| boot | SOURCE_BOOT 2/2.6, schedule of 3, unconfigured NOT_READY, current reader does not fill a missing value |
| not_ready | eq_implicit missing; EARLY outside the gap → gap_closed with sink 0 and P unchanged; seam value ≠ current P.mhp; seam unbound → HP packet rejected by SourceRoot; CRYSTAL before EARLY; supplied resource plan NOT_READY; grit seam NOT_READY → no 28603 write; baseDef diverged from ack |
| hp_independence | pPred 0 with no injuredSpeed → READY with the seam never called and `not_required`; ARMOR no_write; grit seam called once; 5 writes in order. injuredSpeed alone → seam required |
| source_order | Real HP+DSP 13-write interleaved order; EARLY ran once inside the HP gap; speed used the HP @28582 applied mhp (the fixture is built so that the final 834 or stale 1000 mhp would flip pPredSpd); public grit total is positive (_grit 3 + lvB 3 + Grit 2 + gritFlatN 1) and used once at 28603; exact baseDef/speed; no crystal regeneration |
| unclamped_hp | At 28589 the current P.hp is 600 (unclamped); HP clamps it later at 28601 |
| getters | pPredSpd/pDefAdd current getters; no stored field |
| non_finite | s.dex NaN → SOURCE_NON_FINITE with dispatch 0; `_altSpd` string → NOT_READY; pArmor `"2"` → 42 |
| keepalive | Providers survive the builder scope; clear() → NOT_READY |

Expected values are taken from the real producer outputs (HP `values.mhp`, the resource plan's `s_dex`/`_crystalStats`, `read_source_grit_total().value`). The HP formula, s.dex, crystals, and grit are not recomputed. Previous success suites (resource/HP/etc.) are not re-run. Clock, auto physics/process/render, public play, and GPU/240 are out of scope.

## 7. Missing Main phase contract (ENGINE)

- Central `applyStats` orchestrator: once per pass, generate the resource plan and share it with HP/DEF/shield. The HP sink opens and closes `HpInitialGapSeam` at the initial `after_write_0` gap and runs `run_phase(PHASE_EARLY)` there. It calls `PHASE_CRYSTAL` after HP crystal_mhp (inside 28602-28604) and `PHASE_ARMOR` after HP fortify (28618-28624). EARLY failure is non-atomic: HP write 0 may already be applied. ENGINE must preserve that source prefix and stop unperformed later phases; this module does not roll back HP or any source state.
- Actual same-pass current P/PASSIVES/INV/STATS/grit reader and sink installation, with the complete source projection. Main binding was not inspected or executed by this scope; existing construction authority is distinct from complete applyStats derived readiness.
- No Main ready promotion. ENGINE owns the common docs sync and checkpoint. Not modified here: native60/QE (blackBean magic Q-only / E forbidden), poise, independent bullets, LOCK nav START/EXIT, human-paused, protected shipping files.


## 8. 최초 실행·실제 API 인계 (executor)

**첫 실행: 8그룹 / 62검사 PASS**, Godot exit 0, 0.363914917초. stderr 빈 값 / SCRIPT ERROR 0 / FAIL 0 / INVALID 0 / 제품·fixture 수리 0 / 성공 재실행 0이다. 순수 `.gd` 9개(신규 2 + readonly production 7)만 별도 fixture에 복사했다. 원 PNG copy/hash/import 0, 기존 success suite 실행 0이다.

| 최초 유효 group | checks |
|---|---:|
| boot | 6 |
| not_ready | 11 |
| hp_independence | 10 |
| source_order | 17 |
| unclamped_hp | 4 |
| getters | 6 |
| non_finite | 4 |
| keepalive | 4 |
| 합계 | **62** |

실제 HP producer의 `run_phase(PHASE_INITIAL/CRYSTAL_MHP/CRYSTAL_HPR/FORTIFY)`와 이 producer의 EARLY/CRYSTAL/ARMOR를 두 개의 새로운 완전 통합 fixture에서 소비했다. 각 완전 pass는 원 13개 writes 순서를 검증하며, 공급한 실제 Resource plan을 pass당 한 번 계산하고 crystal 재생성 0을 확인했다. 이 새 소비가 기존 HP87/resource 성공군의 재실행은 아니다. 추가 strict 거부·독립·getter 검사는 위 고유 group에만 포함된다.

HP packet의 정확 계약은 `{kind,pass_id,source,writes,gaps}`이다. **packet에는 phase 키가 없고 `kind==HealthSource.PHASE_INITIAL`로 분기한다**(HP run out에는 phase가 있다). test-only `SourceRoot`는 이미 이 정확 kind를 사용했고, write 0을 적용한 뒤 `after_write_0`에서 seam을 열어 현재 P.mhp를 읽었다. plan.values만으로 적용을 위장하지 않는다. 최종 834 / stale 1000을 초기 값으로 alias하면 pPredSpd가 뒤집히는 fixture와, 28589에서 clamp 전 hp600을 읽고 뒤의 28601에서 hp534로 clamp하는 fixture를 구분해 검증했다. 양수 grit9는 새 공개 `read_source_grit_total()` 실제 값이며, 본 모듈의 중복 5항 조립/private source `_fail` 접근은 0이다.

모듈 자체 native tick/physics/process/render/global RNG driver 0, SceneTree frame await 0이다. 명시적인 plan/run/getter/ordered sink 기술 검수이며 실제 Main/Tree/Actor caller, 공개 input/play/pixels/GPU/연속FPS/Steam최저사양 1080p240 증거가 아니다. source prefix mhp가 적용된 뒤 EARLY가 거부된 경우와 전체 무효과는 다르다. 기존 인간 paused 화면·userdata·server·배송artifact·shared source/Git 변경 0이다.

실제 Claude CLI 기본모델 `claude-opus-5-5`, session **e16349b9-d017-4c5d-b870-9777ffb880ca**. 초기 PID **27574** / 475083ms, 새 공개API를 반영한 동일 세션 pre-test correction PID **30128** / 433468ms이다. 두 실행 restricted/dontAsk + 정확 신규3path Write/Edit만, 권한 거부 0 / model override·Bash/MCP/Agent/settings·권한우회 0이다. 원 source/test/doc 작성과 pre-test 수리는 실제 Claude, 첫 실행 및 이 결과·handoff 기록은 Codex executor다. pre-test 수정은 실행 0회 시점에서만 이뤄졌으며 실패suite 수리로 계산하지 않는다. 수정 전 신규3파일 working bytes를 외부 backup에 저장했다.

신규3path 초기 working/HEAD 부재와 real parent는 외부 `prewrite.json`에 기록했다. 관련 docs keyword 검색은 첫 범위부터 `--glob '!**/INGAME_CAPTURE_STUDIO_20261009.md'`를 적용해 정확 목록을 외부 `keyword-doc-matches.json`으로 인계한다. 2_3 immutable / 공통 docs 편집 0이다. ENGINE가 Main fresh-plan supplier·gap/interleave·full current bindings를 설치하고 관련 docs를 current sync한 뒤 normal code+docs checkpoint를 맡는다.

proof: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/player_defense_speed_parameters_source/`의 `test-ledger.json`, `test-attempt1.json`, stdout/stderr와 `handoff.json`. 이 첫 PASS 뒤 code/test 및 최종 doc 자료는 동결한다.
