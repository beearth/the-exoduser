## 중앙 소비 상태 — 2026-10-14

원 static fuse_mul을 holy flat producer와 새 실제 회복 dispatcher가 소비한다. 이 경로의 최초6그룹88검사는 detonate 폭발/원 detonate 테스트 재실행이나 실제 Main detonate 바인딩을 뜻하지 않는다. 기존 폭발 생산자의 원 수치·테스트 이력은 아래 보존한다.

# FDG Godot Port — detonateBlast first producer (2026-10-13)

Status: **first headless isolated run PASSED: 7 groups / 75 assertions, 0 failures. Code and tests are FROZEN.**
Nothing here is promoted to full source support or to any registry. This does not claim full QE, skill, type6 or type7 support, and does not raise any support count. Central integration is still pending.

| Field | Value |
|---|---|
| Author of these 3 files | Claude Code CLI, model `claude-opus-5-5` (default, no override), session `ffc4a520-8b94-449c-a65c-772324d14e13`; initial run PID 65056, source-order repair resume PID 66026 |
| Executor / reviewer | Codex (ran the fixture and reviewed; not the author of these 3 files) |
| Central docs keyword sync, normal code+docs Git commit | ENGINE (worker made 0 Git operations) |

## Files (new, owned by this slice)

| File | Role |
|---|---|
| `godot/port_modules/detonate_blast/producer.gd` | Callable production producer for `_detonateBlast` |
| `godot/port_modules/detonate_blast/tests/test_first.gd` | SceneTree headless test, `--only=<groups>` |
| `docs/engine/FDG_GODOT_PORT_DETONATE_BLAST_FIRST_20261013.md` | This doc |

No shared Player/skill/world/factory/emitter/sound/VFX file was touched.

## Canonical source

`/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html` (the checkout's game.html is different and was not used).

| Source | Lines | Port |
|---|---|---|
| `_detonateBlast(label, elSrc)` | 43824–43887 | `detonate_blast(label, el_src)`, the full function |
| `_poiseHit(e, amt, label)` | 20431–20450 | `_poise_hit` (private, producer-owned) |
| `elMul(a, d)` / `EL` | 15077 / 15066 | `el_mul`, `EL_*` |
| `_skMul('detonate')`, `_SK_MUL.detonate={b:8,g:6.4}` | 45087 / 45045 | `sk_mul_detonate` |
| `_fuseMul(skId)` | 45088 | `fuse_mul(star, skill_boost)`; `_fuseStar`/`_eqAffix` come from providers |
| `_r(v,s)` | 13168 | inline `1*(1+(rng-.5)*2*.1)` |
| `dst` | 32384 | inline |
| `shQuery` | 19025 | `query_targets` provider (spatial hash is central) |
| Forced callers `_detonateBlast('강제기폭!',EL.P)` | 41366 (enemy shieldBash), 31764/31772 (eModHitP M01/M18) | `forced_from_shield_bash`, `forced_from_emod_freeze_shock`, `forced_detonate` |
| Other callers | 33911/33918 (whirlDet auto/Q), 34371 (sBlock auto), 43965 (release parry) | call `detonate_blast(label, el)` directly; their caller-side post-processing (`P.parryT=0`, `_qDetonateFired`) is central |
| `_slamStormBlast(skipVfx)` | 43889– | **NOT ported; never aliased.** It is a separate gap |

## Source formulas preserved (JS `~~` = ToInt32 via `js_i32`, not floor)

- Call order (exact source order, 43825–43886): skill guard → `_wdFused` read → `_addSkProf` → numeric formula helpers → sound/wave → RNG voice → world feel → label TXT → optional light/VFX/particles → `_detEl` → `shQuery` → shallow copy → target loop → fresh Player tail.
- Guard: `if(!P.skills.detonate) return` happens before any effect, so there is no proficiency gain and no tail.
- `_addSkProf('detonate')` goes to the `add_sk_prof` sink before the formula providers (`meleeRef`, `statStr`, `pAtkMul`, `_fuseStar`, `_eqAffix`) are called. The P fields the formula needs come from the guard snapshot; `_addSkProf` only writes `_catProf/_skProf`, which the formula does not read.
- `bars = min(3, 1 + ~~((parryT||0)/60))`. For negative parryT this truncates toward zero (−30 → bars 1, where floor would give 0). The source quirk for −90 is kept: bars 0 → tier 19, radius 0.
- `tier = bars==3?48 : bars==2?32 : 19`
- `detBase = ~~(meleeRef*statStr*pAtkMul*_skMul('detonate')*tier)`, where `_skMul = 8 + (lv-1)*6.4*0.5`
- `detParry = ~~((parryBank||0)*bars*2.5)`
- `boom = ~~((detBase+detParry) * _fuseMul('detonate') * (stormBurst?1.5 : stormBeam?1.2 : 1))`, with `_fuseMul = (star>=2 ? 1+(star-1)*.2 : 1) * (1+_eqAffix('skillBoost'))`
- whirlDet radius: `grow = min(1,wwAng/63)+min(1,bank/500)`, `wwR = 100+(200+(wwLv-1)*15-100)*min(1,grow)`. The value is 0 if whirlDet is not fused. `_wwBaseRDet` (43837) is a local that only reads `wp().wRange/bonusRange` and `P.skills.whirlwind`. Nothing ever reads it and it writes nothing, so the port omits it, along with its read-only weapon getter.
- `boomR = max(wwR, (150+(detLv-1)*10)*bars)`
- Effects in source order:
  1. slamStorm fused: `SFX.shout`, `SFX.slam`, `G._gSlamWave.push({x,y,r:60,maxR:boomR,t:0,maxT:45})`. Otherwise: `SFX.slash`, `SFX.detonate`.
  2. `rng<.4` → `playSample('voice_explode',.8,_r(1,.1))`, which draws a second RNG value.
  3. `!(G._noHitStopT>0)` → `shake=(14+bars*4)*OPT.shake/100`; `slowMo=25+bars*5` only if `slowMo<=0`; `hitStop=max(hitStop,~~((10+bars*3)*OPT.hitStop/100))`.
  4. `addTxt(x,y-30,_T(label||'기폭팔')+' '+bars+'단계 ×'+tier+' '+boom,'#ff2200',70)`.
  5. If `label!=='지진기폭!'`: `_addBlastLight(x,y,boomR*1.2,18+bars*4,255,160,60)`, `playVFXAng('center_explode',x,y,boomR/200*(1+bars*.2),3,0,true)`, `playVFXAng('eq_impact',x,y,boomR/256,4+bars*2,0,true)`, then `12+bars*3` particles with 4 RNG draws each, in the order vx, vy, size, life.
- Targets: `shQuery(P.x,P.y,boomR)` is taken at its original point, after the label TXT and after any light/VFX/particles. The shallow `_ne_det` copy is then iterated in source order, so later reentrant changes to the returned array do not affect the loop. A target is skipped if `!alive || d>=boomR` (strict). Otherwise:
  - `falloff=max(0,1-d/boomR)`, `dmg=~~(boom*(.5+falloff*.5))`
  - `hurtE(e,dmg,ang,false,{kbMult:0,noPoise:true,detonate:true,explode:true},el)`
  - `e.kb += (cos,sin)(ang)*12*falloff`. This is applied even if hurtE killed the target.
  - `elMul(el,e.el)`
  - Boss: `_poiseHit(e,~~(maxPoise*0.20),'💥 기폭그로기!'|'💥 지진그로기!')`.
  - Normal: `stunned=max(stunned||0,~~((120+(sLv-1)*8)*elMul))`, `poise=0`, `addTxt('💫 기절!','#ffcc00',32)`. `sLv` is giantSlam's level when slamStorm is fused, otherwise detonate's level. There is no alive re-check, so a target killed by the blast is still stunned (source quirk kept).
- `_poiseHit`: returns false if dead or `amt<=0`. Returns false if `ib && _pImmune>0`. Otherwise `poise-=amt; poiseR=0`. On break: `poise=0`, `stunned/_maxStunned=max(.., ib?90:180)`, `ib→_pImmune=300`, `SFX.groggy`, `addTxt(label,'#ff8800',60)`, `slowMo=20` unless noHitStop, then 14 particles (1 RNG draw each).
- Tail: `P.iframes=max(P.iframes,30); parryBank=0; parryT=0`. Player is **re-read** after the loop because hurtE can change iframes. There is no damage-acceptance gate.

## Producer API

```
configure(ctx: Dictionary) -> {ok, missing}       # all REQUIRED_CONTEXT callables, else refuses
detonate_blast(label, el_src) -> receipt           # real effects through sinks/target commands
forced_detonate()                                  # _detonateBlast('강제기폭!', EL.P)
forced_from_shield_bash()                          # guard 41366 (needs parryBank>0)
forced_from_emod_freeze_shock()                    # guard 31764/31772 (no bank requirement)
static forced_guard(p, require_bank) -> "none"|"detonate"|"slam_storm_blast"
static quote_from(p, meleeRef, statStr, pAtkMul, fuseStar, skillBoost)
static js_i32, el_mul, sk_mul_detonate, fuse_mul, missing_dependencies
```

The forced guard for the slamStorm branch returns `error:"slam_storm_blast_not_ported"` and produces no effects.
The producer has no `_process` or tick.

### Constructor context (providers are read-only; sinks are commands)

| Key | Kind | Source equivalent |
|---|---|---|
| `player_snapshot` | provider | `P.{x,y,s,skills,_fused,parryT,parryBank,wwAng,iframes}` |
| `melee_ref`, `stat_str`, `p_atk_mul` | provider | `meleeRef()`, `statStr()`, `pAtkMul()` |
| `fuse_star`, `eq_affix` | provider | `_fuseStar(id)`, `_eqAffix(id)` |
| `world_snapshot` | provider | `G._noHitStopT, G.slowMo, G.hitStop, OPT.shake, OPT.hitStop` |
| `query_targets` | provider | `shQuery(x,y,r)` |
| `localize` | provider | `_T` |
| `rng` | provider | global `Math.random` kernel |
| `add_sk_prof` | sink | `_addSkProf` |
| `sfx`, `play_sample` | sink | `SFX.*`, `playSample` |
| `push_slam_wave` | sink | `G._gSlamWave.push` |
| `set_world_feel` | sink | writes `G.shake/slowMo/hitStop` |
| `add_txt`, `add_blast_light`, `play_vfx_ang`, `pool_part` | sink | same-name source functions |
| `set_player_tail` | sink | `P.iframes/parryBank/parryT` |

### Target adapter (enemy body, centrally owned)

| Method | Source |
|---|---|
| `detonate_snapshot() -> {alive,x,y,el,ib,max_poise,poise,stunned,_maxStunned,p_immune}` | e fields (read) |
| `receive_damage(amount, direction, "detonate", opts{ang,noSound:false,kbMult:0,noPoise,detonate,explode,atkEl})` | `hurtE` adapter |
| `add_detonate_kb(delta: Vector2)` | `e.kb +=` |
| `apply_poise_fields({poise?,poiseR?,stunned?,_maxStunned?,_pImmune?})` | stun/poise writes |

Preflight scope:
- Missing or invalid context Callables are rejected in `configure`, before any call.
- Target adapter methods can only be checked at the original query point (43862). If any copied candidate lacks a method, the producer returns `target_adapter_missing` (`effects_before_rejection: true`). **This is not atomic.** Proficiency, sound/wave, voice RNG, world feel, TXT and light/VFX/particles have already gone through their sinks. No target is hit, and the Player tail (iframes/parryBank/parryT) is not applied.
- This is a port integration error report, not a source branch. There is no added source guard and no damage-acceptance gate.

## Produced vs pending

| Item | State |
|---|---|
| Formula, tiers, truncation, fusion and storm multipliers, radius | Produced (pure, tested) |
| Target iteration, filter, order, falloff, hurtE call, KB, elMul, boss poise, normal stun | Produced (calls real target commands) |
| `_poiseHit` logic and effects | Produced (producer-owned port) |
| Forced/caller guards for 41366 and 31764/31772 | Produced; the slamStorm branch reports a gap |
| SFX/VFX/text/particles/light/hit-feel/tail sinks | Called with source arguments. **Real Godot implementations are pending central integration** |
| `hurtE` full pipeline (reviveIframes, shields, etype rules, `opts.detonate` whirlwind exclusions, `explode` gunpowder classification, kill pipeline) | **Gap**: the central enemy `receive_damage` must accept these opts. Existing `receive_damage(amount,direction,source,opts)` enemies do not yet expose `detonate_snapshot/add_detonate_kb/apply_poise_fields` |
| Global native RNG kernel | **Gap**: injected `rng` Callable. Producer draw order is exact (voice 1–2, particles 4×(12+3·bars), groggy 14 per break), but hurtE-internal draws in the global sequence depend on the central kernel |
| `_addSkProf`, `_fuseStar`, `meleeRef`, `pAtkMul`, `_T`, `shQuery` | Pending central providers/sinks |
| `_slamStormBlast` (43889, giantSlam path, own ×19 formula/tail) | **Separate gap, not aliased** |
| Caller post-processing (`parryT=0` at 33912/34371, `_qDetonateFired`, upstream shieldBash order KB10 → blast → stagger40 → TXT) | Central callers; unchanged |

## Tests (`tests/test_first.gd`) — first run 7/75 PASS (frozen)

Mode: headless, automatic, isolated. These are not render, public, GPU, FPS or manual checks.
Command: `godot --headless --path godot --script res://port_modules/detonate_blast/tests/test_first.gd [-- --only=g1,g2]`
Output line: `DETONATE_BLAST_FIRST {json}`. Exit code is 0 on pass, 1 on failure, 2 for an unknown group.

| Group | Assertions | Covers |
|---|---|---|
| `formula` | 13 | bars/tier, ToInt32 vs floor, lv6/parry, stormBeam/stormBurst/fuseStar/affix, bar0 quirk, whirlDet radius, run text |
| `forced_guard` | 8 | no-skill return, 41366 bank>0, eMod no bank, threshold/state, tail, slamStorm gap, forced label/EL.P |
| `commands` | 11 | real HP, hurtE opts, KB12 falloff, normal stun/poise0, boss 20% poise, break 90/immune 300, groggy effects, immune, killed-target quirks |
| `range_order` | 9 | strict d==R exclusion, falloff damage, just-inside, dead skip, source order, copy vs reentrant clear, query args, query after last particle/TXT and before first hurtE |
| `element` | 9 | elMul table, ×2/×0.5/neutral stun, max keep, atkEl passing, null elSrc, level scaling |
| `effects_rng` | 18 | full sink order incl. query, RNG draw counts 61/62/75, voice rate, world feel, text, VFX/light, particles, slamStorm SFX/wave/giantSlam lv/label, 지진기폭 skips VFX with query directly after TXT, tail max with fixed constructor iframes 10/45/50 |
| `invalid` | 7 | missing/invalid deps named, unconfigured refusal, target_adapter_missing reported at query point after source effects, with no HP/KB/tail change |
| **Total** | **75 in 7 groups** | |

### Execution history

Evidence is in `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/detonate_blast/`:
- `attempt-01.log`
- `check-ledger.json`

| Item | Value |
|---|---|
| Pre-run repair (not a test failure) | Before any test ran, the source-order review moved the shQuery to its original point, put `_addSkProf` before the formula calls, made the adapter rejection non-atomic, and removed the artificial fixture iframe setter |
| Attempt 1 | Godot 4.7.2.stable.official.ed1daf0bf, `--headless --path <proof>/fixture --script res://port_modules/detonate_blast/tests/test_first.gd` (detached fixture copy) |
| Result | Exit 0. SCRIPT ERROR 0, resource ERROR 0. PASS on all groups: formula 13, forced_guard 8, commands 11, range_order 9, element 9, effects_rng 18, invalid 7, for **75/75**. FAIL 0 |
| Repairs during tests | Product 0, test fixture 0 |
| Reruns of passed groups / old suites run | 0 / 0 |
| Assets copied, hashed or imported | 0 |
| Producer autonomous tick/process | 0 (none exists) |
| Explicit native clock calls, automatic fixture tick signal counts | UNMEASURED. No frame counts are inferred from wall time or loop counts |
| Public runtime, visual pixels, GPU, FPS 240 | Not verified (0) |

What the run shows: real HP, KB, poise, stun and Player-tail command effects were observed on constructor-only isolated targets, with production commands and sinks supplied by the fixture.

What it does not show, still central gaps:
- the full `hurtE` pipeline;
- the real Player and enemy adapters;
- the global native RNG;
- resource, render and sound sinks;
- the other caller integrations;
- `_slamStormBlast`, which is still a separate, required, unimplemented path.

The fixture logs a `query` journal entry. The iframe tail is tested only with fixed constructor Player values (the fixture never edits Player during hurtE). The producer still re-reads Player before the tail, as the source does.

## Matching existing docs (for ENGINE sync; not edited here)

- `docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md`: L222 (detonate formula), L241, L515 (whirlDet), L516 (slamStorm), L531/L704 (stormBurst ×1.5)
- `docs/14밸런스+수치테이블/스킬별_DPS_자원소비표.md`: L93. It says "범위 150→285", but source gives `(150+(Lv-1)*10)*bars` with the whirlDet minimum. Flagged for ENGINE; source wins.
- `docs/14밸런스+수치테이블/스킬_밸런스_리포트.md`
- `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md` (and its `__NFD_0628_2305_백업.md`)
- `docs/2_3 돌진+패링+방패시스템/2_3 돌진+패링+방패시스템.md` (read-only; never edited)
- `docs/8.0몬스터디자인/탄막시스템_총정리.md`, `docs/8.0몬스터디자인/몬스터_공격시스템.md`
- `docs/CHANGELOG_SYNC.md`, `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md`
- `docs/16번역·로컬라이제이션/번역대상_전체목록.md`, `docs/16번역·로컬라이제이션/UI_TRANSLATIONS_20260909.md`
- `docs/engine/FDG_GODOT_PORT_SHIELD_BASH_REACTION_FIRST_20261013.md` (frozen upstream; not read or modified)
- `docs/13출시·마케팅/GAMEPLAY_TRAILER_V22_20260909.md` (keyword match only)
