## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

## ENGINE actual Main source resource construction - 2026-10-14

Main now constructs one SourcePlayerResources Node before its new Player enters the Tree. Original SOURCE_BOOT stays an unchanged input record (current=false/derived=false); the actual constructed actor ST/MST and owned MP/MMP/base rates are read through a distinct current getter. This is the pre-applyStats construction phase. Actual starter-item generation, STATS/PASSIVES/INV/grit/currentG and full source phases remain pending.

| Public API / data | Current contract |
|---|---|
| Main._ready | set_world -> initialize_new_run(original SourceParameters boot) before actor Tree entry -> World child holder -> Player Tree -> World.set_player -> actual source binding |
| Player.bind_native_source_resources | Same actual Player/World; single persistent bind; no existing actor reset |
| Player.get_native_source_resource_authority / get_native_source_resources_snapshot | Actual holder reference / independent snapshot plus persistent bound flag; provider loss returns NOT_READY without MP refill |
| World.bind_native_player_source_resources | Existing ready World player and its actual World child holder only |
| Boot versus current | Input SOURCE_BOOT current=false retained; actual constructed ST/MST200, MP/MMP160, stR.28/mpR0 are real owned values, lineage new_run/source_boot_initialization |
| Atomic sink | Both current before/caps validated first; source-shaped ST->MP single synchronous commit. Synthetic packet tests prove the actual sink contract, not a natural producer branch |
| FIRST new integration | Actual Main5 groups / 71 checks / FAIL0 / ERROR0 / exit0 / 5.919514916s; no prior7/170 or original producer suite replay |
| Derived/current/restore | Derived ST/MP base100 differs from boot200/160; original intermediate writes and restore provenance stay separate. New holder phase constructed_before_apply_stats, derived_ready=false/main_full_ready=false |
| Source Main scope | Supported6/unsupported10 preserved. Empty17slot reset is not final currentINV; original actual15 equipped +10 bag factory still needed. No fake currentG/PASSIVES/grit neutral readiness |
| Whole phase / visual | holy predicate -> holyflat -> MP/ST precompute -> HP -> ST/MP writes not yet installed. Public pixel/model/240 proof pending; VISUAL RETOUCH |

Exact API and first evidence: [Main source authority SSOT](FDG_GODOT_MAIN_SOURCE_AUTHORITY_20261014.md).

---

# FDG Godot Port — player_resource_parameters_source FIRST (2026-10-13)

TASK `GODOT-PORT-PLAYER-RESOURCE-PARAMETERS-SOURCE-FIRST-20261013`
Status: **독립 parameter 계산·ordered command·current projection 기술 마감 / 고유7그룹66검사 PASS 이력** · 실제 state authority/MAIN 설치 미완

## 1. Owned files (these 3 only)

| File | Role |
|---|---|
| `godot/port_modules/player_resource_parameters_source/producer.gd` | Derives the MP/ST resource parameters from the original applyStats/recalcSt (plan + single sink dispatch) |
| `godot/port_modules/player_resource_parameters_source/test_first.gd` | Isolated first test (SceneTree, `--only` group selection) |
| `docs/engine/FDG_GODOT_PORT_PLAYER_RESOURCE_PARAMETERS_SOURCE_FIRST_20261013.md` | This doc |

No shared files touched: Player/World/Git, other modules, common docs, and the CHANGELOG were not edited.

## 2. Original values and provenance (canonical `exoduser-migration-20261001/game.html`, read-only)

| Kind | Original | Line | Handling in this module |
|---|---|---|---|
| boot | `mkP(){… st:200,mst:200,stR:.28,mp:160,mmp:160,mpR:0 …}` | 29655 | Only `source_boot_parameters()` (status `SOURCE_BOOT`, derived/current=false). Never promoted to READY or used as a fallback |
| restore | `P.mpR=pd.mpR\|\|0; P.stR=pd.stR\|\|.28; P.mp=pd.mp\|\|P.mmp; P.mmp=pd.mmp\|\|80; P.st=pd.st\|\|P.mst; P.mst=pd.mst\|\|100` | 4005-4008 | Owned by save_adapter `restore_player_resources.gd`. Here only `read_current_parameters()` reads the current P |
| ST regen | `P.stR=.05+s.dex*.005` | 28591 | phase1 |
| MP cap | `P.mmp=~~(100+s.int*2+_totalBonusMp+_eqAffix('maxMPFlat')+_enhMp)` | 28593 | phase1 |
| MP regen | `P.mpR=.05+s.int*.005` | 28594 | phase1 |
| crystals | `_cr{hp..drop:0}`; SLOT_NAMES order `crystalEffects(c)` → `_cr[stat]+=value`; `P._crystalStats=_cr` | 28596-28600 | phase1 (external crystalEffects provider) |
| crystal regen | `P.mpR+=_cr.mpR/60` → `P.stR+=_cr.stR/60` | 28606-28607 | phase1 |
| MP cap 2 | `P.mmp=~~(P.mmp+~~_cr.mp)+(PASSIVES.pHuman\|\|0)*100+_gritMpFlat(); P.mp=Math.min(P.mp,P.mmp)` | 28608 | phase1 |
| pVital | `_vLv=PASSIVES.pVital\|\|0; if(_vLv>0){P.mmp+=_vLv*50;P.mp=Math.min(P.mp,P.mmp);P.mpR*=(1+_vLv*0.01)}` | 28610-28611 | phase1 |
| pStamina | `_sLv=PASSIVES.pStamina\|\|0; if(_sLv>0){P.stR*=(1+_sLv*0.01)}` | 28613-28614 | phase1 |
| recalcSt | `_eqAffixCache=null;_eqStatCache=null` | 16934 | `KIND_INVALIDATE` command (executed by the consumer) |
| ST cap | `base=100+STATS.dex*2` (raw STATS, not effective stats); `P.mst=~~(base+bonus+_eqAffix('maxSTFlat')+~~(P._crystalStats?P._crystalStats.st:0)+_enhSt2)+(PASSIVES.pHuman\|\|0)*100+(PASSIVES.pStamina\|\|0)*50+_gritStFlat(); P.st=Math.min(P.st,P.mst)` | 16935-16939 | phase2 |
| effective stats | `s.dex=STATS.dex+_eqDex+_lb+~~_eqAffix('dexFlat')`, `s.int=…intFlat` | 28566-28569 | phase1 internal |
| def slots | `_allDefSlots` 14 entries; MP enhance set `bracelet,necklace,headband,headband2,ossuary` (`enh*0.2`) | 28578-28581 | constants |
| ST enhance | `ring1,ring2,belt` (`enh*0.2`), `if(it.bonusSt)bonus+=(+it.bonusSt\|\|0)` | 16937-16938 | constants |
| helpers | `_lvB()=~~(P.lv*.5)` @29405, `_eqStat(k)` @28628, `_gritTotal()=(+_grit\|\|0)+_lvB()+_eqStat('Grit')+_eqAffix('gritFlatN')+_eqAffix('gritFlatR')` @28559, `SLOT_NAMES` @15843 | — | `_lvB`/`_eqStat` consume the `combat_reference_source` public results (no duplicate computation). `_gritTotal` assembly (call order and addition order) is done here |

### Doc ↔ source discrepancy (report only; common docs not edited)

- `docs/2_1 …/자원리젠+소모공식.md:33-34` says mst/mmp base **200**. `docs/14…/14밸런스+수치테이블.md:40-41` and the source (16935/28593) say **100**. **The source value 100 is used.**
- Both docs omit `pHuman*100`, `pStamina*50`, `pVital*50`, `_grit*`, and the crystal terms. The doc formula `0.05+s.dex×0.005` matches the source.

## 3. Public API (producer.gd, `extends RefCounted`)

| API | Kind | Description |
|---|---|---|
| `static source_boot_parameters()` | boot | mkP literal + provenance. `SOURCE_BOOT`, not READY |
| `configure(providers: Dictionary, resource_sink: Callable) -> Dictionary` | binding | Strongly retains the RefCounted owners of the Callables (weak-reference workaround). Returns readiness |
| `clear()` | binding | Unbinds everything → NOT_READY |
| `readiness()` | readiness | `{ready,status,missing,conditional_unbound,missing_upstream}`. Does not call providers |
| `plan_apply_stats()` | derived (pure) | Resource part of applyStats → packet `apply_stats_resource_parameters` (ordered writes) |
| `static invalidate_packet()` | command | `invalidate_eq_caches` (targets `_eqAffixCache`,`_eqStatCache`) |
| `plan_recalc_st()` | derived (pure) | recalcSt → packet `recalc_st_resource_parameters` (mst, st). **Call after invalidation** |
| `run_apply_stats()` | dispatch | applyStats → invalidate → (re-read current P/cache) → recalcSt, dispatched to the sink in this order |
| `run_recalc_st()` | dispatch | For standalone original recalcSt call sites: invalidate → plan → dispatch |
| `read_current_parameters()` | current read | Raw current P `mp,mmp,st,mst,stR,mpR` values. Missing or non-finite → NOT_READY. Never fills |
| `read_regen_state()` | adapter | `state_reader` for resource_regeneration_source (current P fields `s,st,mst,mp,mmp,stR,mpR` as-is) |
| `dispatch_count()`, `last_result()` | diagnostics | — |

Statuses: `READY` / `NOT_READY` (provider/shape missing; packet null) / `SOURCE_NON_FINITE` (original formula produced NaN/±Inf; dispatch 0; only `diagnostic_packet` returned) / `PARTIAL_AFTER_APPLY_STATS` (phase1 applied, phase2 failed. Same as the original throwing inside recalcSt) / `SINK_REJECTED` / `SOURCE_BOOT`.

Packet shape: `{kind, source, writes:[{field, value, source, expr}]}`. The sink must apply `writes` in order (intermediate values included, e.g. mmp 200→335→435).

## 4. Providers (pure Callables; all values read live)

| Key | Original | Required | Production provider status |
|---|---|---|---|
| `player` | current `P` | yes | 실제 Main에 `native_source_resource_authority`를 설치하여 ST/MST·소유MP/MMP/stR/mpR current getter를 제공. 이는 pre-applyStats constructor phase이며 `lv`/`_crystalStats`와 완전한 source P projection은 아직 없음. derived readiness를 만들지 않음 — ENGINE |
| `stats` | current `STATS` | yes | None (BUILD STATS) |
| `passives` | current `PASSIVES` | yes | Can reuse `player_passives_source.read_current_passives` (wrap as a Callable) |
| `inventory` | current `INV` | yes | None (ITEM/INV authority) |
| `eq_affix` | `_eqAffix(id)` + cache | yes | **Reused**: `Callable(equipment_affix_reader, "eq_affix")` ({status,value} contract) |
| `eq_stat` | `_eqStat(k)` + `_eqStatCache` | yes | **Reused**: `Callable(combat_reference_source, "eq_stat")` (lazy cache, `invalidate_eq_stat_cache`/capture/restore). Needs `configure_inventory_reader(current INV)` |
| `lv_b` | `_lvB()` | yes | **Reused**: `Callable(combat_reference_source, "lv_b")`. Needs `configure_player_reader(current P)` |
| `grit` | global `_grit` | yes | **No current authority** (BUILD) |
| `crystal_effects` | `crystalEffects(c)` (CRYSTAL_DEFS/CRYSTAL_STAR) | conditional (called only when crystals are equipped) | **Not ported** |
| sink | `Callable(packet)->bool` | yes for run_* | **Not installed** — ENGINE (writes P fields + on `invalidate_eq_caches` runs `equipment_affix_reader.invalidate_affix_cache()` → `combat_reference_source.invalidate_eq_stat_cache()` once each) |

`{status,value}` contract consumption (eq_affix/eq_stat/lv_b): only `status=="READY"` with an int/float value is used. `NOT_READY`, `SOURCE_THROW`, `READY_PARTIAL_AFTER_SOURCE_THROW`, null, and malformed results all go to NOT_READY, with reason `<key>_not_ready:<label>:<status>:<reason>`. They are never hidden as 0, and no packet is produced. A real `_eqStat` result of 0 (`absent_zero`, after the original `||0`) is a valid READY.

`_grit` provenance contract: 이 포트는 현재 numeric `_grit`를 지원하는 엄격한 provider subset이다(원 init `let _grit=0` @28556). 원 restore `d.grit||0` 자체는 모든 truthy malformed 입력을 숫자로 강제하지 않으므로 String/bool 등 비정상 raw 저장값까지 원 전체 coercion을 지원한다는 뜻이 아니다. 이 포트의 provider는 **current number** (int/float)를 반환해야 한다. `0` is a valid READY, and `(+_grit||0)` is applied as in the original. null, String, Dictionary, or any other value means there is no current authority, so the result is NOT_READY `grit_not_number:<type>`. No 0 is filled in. There is no separate source-record contract that accepts a raw null (the canonical source has no state where `_grit` is null). The grit formula, investment, and restore are not reimplemented.

Reused helpers: `equipment_affix_reader.js_to_number/js_truthy/SLOT_NAMES`, `combat_stat_formula.js_to_int32`, `combat_reference_source.eq_stat/lv_b`. Nothing was duplicated.

## 5. JS semantics preserved

- `~~` = ToInt32. `(+x||0)` = ToNumber then ||0 (NaN→0). `(x||0)*k` = ||0 then ToNumber (non-numeric string → NaN). `x>0` = relational ToNumber (`"5">0` true, `undefined>0` false).
- `STATS.dex+…`: undefined→NaN, null→0, bool→0/1. A string/array/object operand is JS string concatenation, so it returns **NOT_READY `unsupported_js_plus_operand`** (not reimplemented).
- `Math.min` propagates NaN (−0/+0 distinction is not reproduced).
- A valid empty item `{}` makes every property undefined, so it contributes 0. For truthy non-array `crystals` (number/bool/Dictionary without length), 0 iterations. String crystals → NOT_READY.
- `_cr[stat]` for a key outside the initial keys: undefined+value = NaN, as in the original.
- `_gritTotal` is re-read at each original call site (phase1 MP, phase2 ST).
- Left-to-right addition order and the `*=`/`+=` order are preserved exactly.

## 6. Original phase order (the sequence supplied to the consumer)

1. `apply_stats_resource_parameters`: stR → mmp → mpR → _crystalStats → mpR(+cr) → stR(+cr) → mmp(+cr,pHuman,grit) → mp(min) → [pVital: mmp → mp(min) → mpR] → [pStamina: stR]
2. `invalidate_eq_caches` (the consumer runs `equipment_affix_reader.invalidate_affix_cache()` then `combat_reference_source.invalidate_eq_stat_cache()`, once each, in the original order `_eqAffixCache=null;_eqStatCache=null`)
3. `recalc_st_resource_parameters`: mst → st(min). Reads `P._crystalStats`/`P.st` from the current P **after** the phase1 sink has applied.

The HP/def/speed/shield assignments inside applyStats are excluded (another owner). None of them change the inputs to the resource fields.

## 7. Actual authority still missing (not done here)

`MISSING_UPSTREAM` (producer constant) lists exactly these:
- `current_INV` — current INV authority (ITEM/ENGINE)
- `current_P` — 실제 Main의 새 source holder가 mp/mmp/st/mst/stR/mpR을 소유·현재 조회한다. lv/_crystalStats/full P와 applyStats/recalc sink는 아직 미연결. 기존 `.28` regen은 source natural phase 바인딩 전까지 기존 unbound branch에서 유지하며 새 holder 초기화가 회복 시계를 추가하지 않음
- `current_STATS` — current STATS authority (BUILD)
- `grit` — current `_grit` authority (BUILD)
- `crystal_effects` — conditional; crystalEffects is not ported
- `install_sink` — install the sink that applies packets and runs the two cache invalidations (ENGINE)

When any of these is missing → NOT_READY. No neutral substitute.
- Hooking up the original applyStats/recalcSt call sites (equip/unequip, levelup, restore, passive investment, etc.) — ENGINE/BUILD.
- Excluded: potion/levelup/QE costs, the regen clock (resource_regeneration_source), holyDome flat, HP/shield regen, effect clocks, render, save.

## 8. First isolated execution / 고유7그룹66검사

Codex executor는 외부 fixture-attempt1/2/3의 순수 .gd만 portable Godot4.7.2 --headless로 실행했다. 첫 fixture는 자기 신규2 + 필요한 readonly production4(affix/reference/formula/regen), 세 번째 새 restore projection 경계는 필요한 readonly restore scalar1을 추가했다. 이전 test 파일/copy·PNG/import 0. physics60/Compatibility/별도 custom userdir 이름 EXODUSER-PlayerResourceParametersSource-Isolated-20261013, user save/게임 QA 접근0. 실패 또는 새 그룹만 --only로 선택했다.
Verdict: exit 0 = PASS (checks>0 and 0 fails) / 1 = FAIL / 2 = INVALID (0 checks or an unknown group). **If `SCRIPT ERROR`/parse error appears on stderr, the whole run is INVALID regardless of the exit code.**

| group | Checks | Result |
|---|---|---|
| boot | mkP 160/200/.28/0 provenance; boot does not make derive READY | 아래 첫 실행 ledger |
| not_ready | Unconfigured → dispatch 0; crystals with no crystalEffects provider → NOT_READY, sink 0, P unchanged; `lv_b` key missing → readiness NOT_READY; real cref `lv_b` NOT_READY (P unbound) → `lv_b_not_ready`, sink 0; real cref `eq_stat` NOT_READY (INV unbound) → `eq_stat_not_ready`, sink 0; `_grit` null → `grit_not_number:Nil`, sink 0, P unchanged; current P missing mmp → NOT_READY, no fill | 아래 첫 실행 ledger |
| derive_pipeline | Pure plan; caches built, then ring1 maxSTFlat 4→9 and bGrit 1→5 mutated (no invalidation point, so they stay stale); sink order applyStats→invalidate→recalcSt; trace `apply_stats…, affix.invalidate_affix_cache, cref.invalidate_eq_stat_cache, recalc_st…` (each once); mmp 435 (stale grit 10)/mp 335/stR/mpR exact; mst 423 = ~~(120+20+9+7+3)+100+150+(4+3+5+2) (stale affix 418 / stale eqStat 419); st 423; cref Grit rebuilt to 5; write order | 아래 첫 실행 ledger |
| regen_consumer | Production `resource_regeneration_source` consumes `read_regen_state` → derived mpR/mmp; P.mp exact; st capped at 414 = ~~(120+20+4+7+3)+100+150+(4+3+1+2) (bGrit 1) | 아래 첫 실행 ledger |
| coercion | STATS.dex null, empty item `{}`, `_grit` 0 (valid) → READY (mmp/mst 300, stR/mpR .05); dex undefined → SOURCE_NON_FINITE, dispatch 0; dex "5" → NOT_READY | 아래 첫 실행 ledger |
| keepalive | Producer keeps the RefCounted fixture/affix/cref alive; clear() → NOT_READY | 아래 첫 실행 ledger |

Real production instances: `equipment_affix_reader` (eq_affix + cache), `combat_reference_source` (eq_stat lazy cache + lv_b; INV/P bound to the same fixture current getters), and `resource_regeneration_source` (consumer). Fixture inputs (**not product values**): P/STATS/PASSIVES/INV state (Grit is the original item field `bGrit`, aggregated by the real `_eqStat` cache), the `_grit` value, the `crystal_effects` table, and the regen multiplier/holyDome providers. There is no number-constant mock for eqStat/lvB. Real clock advance, automatic physics/process/render, public play, and perf are out of scope (각 regen_consumer 시도당 manual `advance_native(2.0)` 1회(최초 실패 assertion 시도+실패그룹 수리시도 총2회)). Earlier success suites (cref, affix, formula, regen) are not re-run.

## 9. Related docs keyword search (handoff)

Keywords: `P.mmp|P.mst|mpR|stR|recalcSt|maxMPFlat|maxSTFlat` (docs/, excluding `docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md` — not accessed). 67 files matched; many are noise (e.g. `stRegen`). Read directly: `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md`, `docs/14밸런스+수치테이블/14밸런스+수치테이블.md` (narrow grep only).

Related candidates (not read; for ENGINE sync reference):
- engine: `FDG_GODOT_PORT_RESOURCE_REGENERATION_SOURCE_FIRST_20261013.md`, `FDG_GODOT_PORT_REGENERATION_STAT_SOURCE_FIRST_20261013.md`, `FDG_GODOT_PORT_EQUIPMENT_AFFIX_READER_FIRST_20261013.md`, `FDG_GODOT_PORT_COMBAT_RESOURCE_SOURCE_FIRST_20261013.md`, `FDG_GODOT_PORT_SAVE_PLAYER_RESOURCES_RESTORE_FIRST_20261013.md`, `FDG_GODOT_PORT_HUD_MP_FIRST_20261013.md`, `FDG_GODOT_PORT_HUD_STATUS_FIRST_20261013.md`, `FDG_GODOT_PORT_HOLY_DOME_PRESENCE_SOURCE_FIRST_20261013.md`, `FDG_GODOT_PORT_COMBAT_QE_FIRST_20261013.md`, `FDG_GODOT_PORT_COMBAT_REFERENCE_SOURCE_FIRST_20261013.md`, `FDG_GODOT_PORT_SAVE_ADAPTER_FIRST_20261013.md`, `FDG_GODOT_PORT_SAVE_INVENTORY_RESTORE_FIRST_20261013.md`
- design: `docs/2_1 …/2_1 스킬관리+합체시스템.md`, `docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md`, `docs/14…/패시브효과표.md`, `docs/14…/자원소비량표.md`, `docs/2_5 부활+에너지쉴드시스템/RESPAWN_RESOURCE_RESET.md`, `docs/15 세이브+데이터구조/15 세이브+데이터구조.md`, `docs/3.1 ui hud 디자인/능력치_패시브_개편_20260909.md`, `docs/3.1 ui hud 디자인/PASSIVE_TREE_REDESIGN_20260909.md`, `docs/7아이템디자인/아이템_어픽스_시스템.md`, `docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md`

ENGINE owns the common current-value sync, normal code, and docs checkpoint.


## 10. 첫 실행 ledger / actual authored boundaries

| 시도 | 실행 범위 | 결과 | 수리/반복 |
|---|---|---|---|
| attempt1 | authored6그룹57검사 | exit1 / 0.613862792초 / 유효5그룹51검사 PASS + regen_consumer6검사 중1 FAIL | 실패 원인은 fixture 상한 expected419. 원 constructor 식은 ~~(120+20+4+7+3)+100+150+(4+3+1+2)=414이며 제품식은 그대로 올바름 |
| attempt2 | 실패 regen_consumer만6검사 | exit0 / 0.599853375초 / 6검사 PASS | Codex executor가 자기test expected1만419→414 수리. 제품/원 constructor 수치 변경0. 성공5그룹 재실행0 |
| attempt3 | 새 restored_current만9검사 | exit0 / 0.605937709초 / 9검사 첫PASS | 원요청의 restored-current provenance 경계를 Codex executor가 새 first group으로 추가. 앞선 성공6/oldrestore suite 재실행0 |

| 고유 그룹 | 검사의 수 | 최종 유효 이력 |
|---|---:|---|
| boot | 7 | 첫 PASS |
| not_ready | 14 | 첫 PASS |
| derive_pipeline | 18 | 첫 PASS |
| regen_consumer | 6 | 첫 FAIL1 후 해당6만 PASS |
| coercion | 8 | 첫 PASS |
| keepalive | 4 | 첫 PASS |
| restored_current | 9 | 첫 PASS |
| 고유 합계 | 66 | 7그룹 PASS 이력; 전체 최종7 동시 재실행0 |


세 시도 모두 stderr 빈 값 / SCRIPT ERROR0 / INVALID0. 검사 총 시도는57+6+9=72이나 고유검사는66이다. success repetition0/old source16·Cref10·affix9·formula8·regen10·dome9·restore 성공suite 재실행0. 원 source PNG copy/hash/import0.

명시 `run_apply_stats()` 실행11회 = 최초10 + 실패regen그룹 재검1. 4회는 ordered applyStats/invalidate/recalcSt3 packet을 적용(총12 parameter/cache packet); missing/unsupported/nonfinite7회는 parameter packet dispatch0. 실제 `resource_regeneration_source.advance_native(2.0,guard)`는 최초 및 해당실패 재검 각1회 총2회/native tick operand4, 실제 natural_regen sink2 packet. 이 수치는 fixture 실행 구간 이력이며 제품 clock/FPS/공개 자연플레이 근거가 아니다. 자체 source automaticdispatch/physics/process/render0, effect/global clock driver0, 실제 human input0.

새 restored_current는 기존 production `save_adapter/restore_player_resources.gd`를 고정 constructor Dictionary에2회 소비했다(실제 저장 파일/scene/livePlayer/atlas/later refill은 미실행). 첫 값 mp77/mmp90/st41/mst110/stR.125/mpR.375를 새 reader가 읽고 변형/parameter sink 호출0을 확인했다. 다음 saved mp/st0은 기존 restore의 실제 prior max90/110을 사용한 뒤 mmp99/mst123으로 바뀐다. 새 reader는 mp90/mmp99/st110/mst123/stR.28/mpR0을 그대로 읽으며 boot160/200을 새 missing fallback으로 사용하지 않는다. 이 current-read subset READY는 derived plan 준비와 구분된다: STATS/INV/grit 등을 연결하지 않은 producer의 readiness 및 plan_apply_stats는 NOT_READY다. 실제 source 재계산은 이 projection 전에 설치하지 않았고 fullrestore/scene/rate Main 준비라고 주장하지 않는다. 이 새 group의 serialized hp1은 existing restore prior guard에 필요한 기술 operand이며 live HP 주입/HP 통합을 뜻하지 않는다.

Actual Claude CLI 기본 모델 claude-opus-5-5, session bef01079-8b18-4df0-afe6-f4f3bc54f521: 최초 PID9221 / UTC2026-10-13T16:30:46.515147 / 677814ms, 실행 전 public-helper 보완 PID10329 / UTC2026-10-13T16:44:08.621023 / 203756ms. 두 세션 모두 defaultmodel override0, restricted/dontAsk/ReadGlobGrep+자기 신규3 정확 Write/Edit만, permission denial0/Bash·MCP·Agent·GUI0. 원 parameter producer/최초6그룹 및 existing Cref actualhelpers/cache 보완은 실제 Claude가 작성했다. 실패 fixture expectation1/새 restored_current9검사/실행·이 ledger는 Codex executor다. 첫 실행 후 제품 변경0.

수정 전 자기 working+HEAD 부재/realparent/symlink 확인 backup-before-write.json, 초기 authored3 외부byte backup pretest-helper-backup/, 실패 expectation 전 test-before-fixture-repair.gd, 새 projection group 전 test-before-new-restored-group.gd, receipt 전 doc-before-receipt.md를 외부 E/godot-native-first/team-port/player_resource_parameters_source/에 보관한다. shared/Git/main/save/서버/shippingartifact/원PNG/인간 paused 화면 조작0. 새 원본 pixels/public episode/minimum1080p240 미관측.

현재 관련 keyword 전체 filename 검색은 keyword-doc-matches.json의 정확 경로를 중앙에 인계한다(작성 시67파일 목록과 새 검색 snapshot 수는 다를 수 있으며 외부 JSON이 최신이다). exact marketing 미접근/2_3 immutable, 기존 공통docs 편집0. ENGINE이 sourceboot200/160과 derivedbaseline100을 구분해 관련 원 문서 drift 및 누락된pHuman/pVital/pStamina/grit/crystal 원항을 동기화하고, 실제 current P/STATS/INV/PASSIVES/grit/conditionalcrystal/sink 및 source applyStats/recalcSt call-site를 설치한 후 정상 code+docscheckpoint를 담당한다.

## 2026-10-17 악의구 actual-owner 통합 작업본

| 항목 | 현 상태 |
|---|---|
| 범위 | I 작업본, 아직 R/공식 main 미반영. 실제 게임 스킬 완료 아님 |
| 실제 소유 | Main→SourceState의 현재 P 동일참조→ResourceAuthority. 실제 MP/Player.state/st2/atkArc/_mpBon을 원 start 순서대로 적용 |
| finish | 보너스 산출 뒤 _mpBon0→World projectile→magic 숙련5→source sample→magicRecover/12. split P-field callback 실패·환불/일반rollback 없음 |
| caller | 실제 native RMB held/기존 Player 물리 phase 끝→World dt_sp/frame→v3 source. 같은 frame st2 중복 감소 거부 |
| 거부 | 실제 projectile/proficiency/sample 수신부 미연결이면 start부터 NOT_READY, 빈 시전 MP 소비 없음 |
| 미완 | 실제 projectile/원 시각·샘플, recovery Q/타 magic handler/GP. 실Actor 전체/GPU/저장/API/PC 및 최신 전체 완료 아님 |
| 상세 | docs/engine/FDG_NATIVE_FIREBALL_ACTUAL_OWNER_20261017.md |

새 actual-owner 검수:39 PASS 후 entered-case/중복 phase 경계의 수정 영향6 PASS(39 재연 없음). 첫39 종료 WARNING 한 줄에 ObjectDB3 instances leak, ERROR0/원인 미확정; phase6 종료 WARNING/ERROR0. 준비 regex 실패를 포함 firstWholeClean=false. 현재 main/R/실게임 반영·실시각 완료는 아니며 세부 계약과 실패 이력은 FDG_NATIVE_FIREBALL_ACTUAL_OWNER_20261017.md에 기록한다.
