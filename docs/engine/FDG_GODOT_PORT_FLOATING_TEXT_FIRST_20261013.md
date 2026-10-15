<!-- fdg-godot-floating-text-binding-20261013:begin -->
## Godot 실제 World 텍스트 연결 · 2026-10-13

| 항목 | 현재 구현·검증 / 남은 범위 |
|---|---|
| 정본·공개 API | `FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md`. 실제 World `emit_native_text(x,y,text,color,life=null,size=null,num_str=null)`, `get_native_text_snapshot`, ko identity `localize_native_text`, 기존 NotoSansKR `get_native_text_font`을 공급한다. |
| 단일 풀·시계 | 실제 World 아래 adapter/producer 한 개·ring40·z4002. dark 요청 `(x,y−20,"💜다크볼!","#cc44ff",30,22,null)`은 admission1/legacy Label0. HitFX 기존 priority3 끝에서 실제 context.dt_sp/frame/ens를 한 번 공급해 y−=.6ticks→life−=ticks. pause/중복/복사token/오류dt 거부. |
| 첫 신규 검사 | binding3 FIRST PASS /5.653511290999999초/exit0/assert0/ERROR0. 실제 dark16ticks/post16, generic44admission/40ring/실Camera zoom2→view960×540, guard9frames/37거부/pause4. 읽기검수에서 발견된 ready 타입/실제 backend상태/detach·reparent·queued삭제 guard를 수리해 신규 lifecycle1 FIRST PASS /5.107139167초/exit0/assert0/ERROR0, 전체고유4. 첫3성공 반복0; 이전 성공suite/import/Main/GUI 재실행0. |
| 현재 경계 | 실제World sink와 dark caller만 연결; detonate/shield-bash/combo 등 개별caller·full locale/reset/testbed120·원480×168 숫자atlas·공개pixel/canvas비교·최저1080p240은 미완. current Main source6/16·동결배송5/16 유지. **VISUAL VERDICT: RETOUCH**. |

<!-- fdg-godot-floating-text-binding-20261013:end -->

# FDG Godot port — floating text (`addTxt` / `G.txts`) FIRST — 2026-10-13

Status: **FIRST validation complete.** 16 unique groups / **148 valid checks PASS** (headless01: 2 groups / 15 checks; headless02: 14 groups / 133 checks). One native 640×360 QA capture: **10/10 pixel probes PASS**.
Visual verdict: **RETOUCH**. General glyph and atlas consumers are complete. ENGINE now installs the real World adapter/public text sink and one priority3 post clock (new binding4 unique PASS: first3 + new lifecycle1). Original number glyphs, all gameplay callers, complete locale/settings, source-canvas comparison and public-play quality remain incomplete. See [actual binding SSOT](FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md).
Claude wrote the code, the tests and this doc, and had no Bash. All execution was done by the Codex executor. Records: `check-ledger.json`, `native-first-proof.json`, `native-first-executor-observation.json`, `native-first-proof.png` in the floating_text proofdir.

## Authorship sessions (executor records)

All in the same session `ef47fe9f-e571-46ae-b1a1-9d96185c1ca1`, configured model `claude-opus-5-5`, override 0.

| PID | Claude work |
|---|---|
| 68564 | production `producer.gd` (addTxt/pool/native update/general glyph draw), `test_first.gd`, this doc |
| 69470 | number-atlas read-only Texture2D API plus the real `_draw` consumer, written **before any test ran**. This was not a repair after a failed test |
| 69881 | test-fixture provider-lifetime repair only (`test_first.gd`); producer unchanged |
| final (executor-recorded) | doc-only update with the FIRST results (this edit) |

## Attempt history

| Attempt | By | Result |
|---|---|---|
| headless01 (16 groups requested, shell exit 1) | Codex executor | **Valid PASS (2 groups / 15 checks):** `source_constants` (13), `render_context_errors` (2). **Not valid:** 11 groups ended runtime-incomplete (INVALID): `admission, localization, ring_overwrite, order, native_advance, pause, expiry, draw_formula, num_branch_gap, callers, num_atlas_consumer`. 3 completed with FAIL: `whitelist_cull, glyph_draw, num_atlas_draw`. 18 SCRIPT ERRORs. The raw total of 32 pass / 27 fail is **not** a full-suite PASS |
| attempt01 cause | analysis | A **test fixture lifetime error**, not a producer defect. `_mk` built local RefCounted `FixedLocale`/`FixedView` objects and passed only `Callable(obj, method)` to the producer. A Callable does not keep its RefCounted target alive, so both providers were freed when `_mk` returned. That led to `rejected_no_localizer`, `render_context_missing`, an empty pool, and out-of-bounds `_slot` reads |
| repair (Claude, PID 69881) | test only | `test_first.gd`: new `_hold_fixture(p, owners)` keeps the providers strongly referenced through `set_meta("fixture_owners", Array[RefCounted])` on the producer and a suite-level `_fixture_owners: Array[RefCounted]`. `_mk` and the `num_atlas_consumer` constructor-atlas fixture call it. The render proof uses `_mk`, so it gets the same stable providers, with no per-frame provider writes. **Producer changes: 0.** Bodies of the 2 passing groups: unchanged |
| headless02 (only the 14 failed/incomplete groups, shell exit 0) | Codex executor | **14 groups / 133 checks PASS, fail 0, unexpected errors 0.** admission 18, localization 4, ring_overwrite 12, order 4, native_advance 9, pause 6, expiry 7, whitelist_cull 10, draw_formula 16, num_branch_gap 11, callers 3, glyph_draw 6 (draw_trace), num_atlas_consumer 11 (semantic, fixture-only texture), num_atlas_draw 16 (draw_trace, fixture-only texture, NOT original glyphs). The 2 passing groups were not repeated |
| combined | ledger | 16 unique groups / 148 valid checks. Repeats of successful groups or old suites: 0. Product repairs during checks: 0. Fixture provider-lifetime repairs: 1 |
| native_first (one capture, shell exit 0) | Codex executor | 640×360 isolated SubViewport, macOS display, `gl_compatibility` / `opengl3`, M5 Pro. `proof_ok=true`, `png_written=true`. **10/10 probes PASS** (see "FIRST native capture") |

## Ownership and authorship

| Item | Author | State |
|---|---|---|
| `godot/port_modules/floating_text/producer.gd` (new) | Claude | FIRST validated; frozen |
| `godot/port_modules/floating_text/test_first.gd` (new) | Claude | FIRST validated; frozen |
| this doc (new) | Claude | updated with the FIRST results |
| headless01/02 runs, native capture, PNG inspection | Codex executor | done (once) |

## FIRST native capture (executor; `native-first-proof.json` / `native-first-executor-observation.json`)

| Field | Value |
|---|---|
| probes | A `경직!` white 334 (>15) ✓; A black outline 227 (>15) ✓; A `#8888ff`-like pixels 0 ✓; A trace alpha 1 / fsz 22 / y 186 ✓; B max lum 0.5207 in (0.4, 0.8) ✓; B full-white pixels 0 ✓; B trace alpha .5 ✓; D expired region non-backdrop 0 ✓; E op `skipped_num_atlas_gap` ✓; E region non-backdrop 0 ✓ |
| counters | admitted 4, draw_dispatch 6, draw_general 12, native_ticks 18, num_atlas_gap_skipped 6, num_atlas_drawn 0, num_atlas_digit_blits 0, num_atlas_rejected 0, rejected_no_localizer 0, render_context_errors 0 |
| font | original `res://assets/fonts/NotoSansKR.ttf`, loaded read-only, `bold_mode=wght_axis_900`. 3 read-only symlink leaves. Font copy/hash/import 0 |
| clock | the 18 native ticks are explicit fixture `native_tick` calls. Automatic native clock 0: no physics driver, and `_process` only redraws |
| PNG inspected once | full-alpha white `경직!` with black outline; caller colour `#8888ff` stored but not used (source general branch); half-alpha `무적`; expired and number-gap regions absent |
| scope | `bt_active=true` is a fixed constructor fixture so the original `경직!` text is drawn. It is **not** a bypass of the normal-play whitelist and involves no live input. The source whitelist strings and localisation at admission are unchanged |
| not done | MSAA requested 0 / effective 0. Public play 0. Source-canvas comparison 0. Original number-atlas glyph proof 0. Minimum-240 performance not measured |
| verdict | **RETOUCH**: `middle` baseline approximation, no source-canvas comparison, original number atlas missing, live world not integrated |

No other file was edited. Shared world/camera/locale/global driver/gameplay callers/common docs/Git belong to central ENGINE.

## Source authority (canonical `exoduser-migration-20261001/game.html`)

| Line | Fact |
|---|---|
| L44444 | `let TXTS_MAX=40;` |
| L64626 | testbed: `TXTS_MAX=120` |
| L44447-44451 | `_FLOAT_TEXT_ENABLED=true`; `_FLOAT_TEXT_BLACKLIST` is declared but **never read** (only L44450). `let _txtNext=0` |
| L44452-44456 | `addTxt(x,y,t,c,l,sz,numStr)`: if `G.txts.length<TXTS_MAX`, push blank slots `{x:0,y:0,t:'',c:'#fff',life:0,ml:0,sz:0,_numStr:null}` up to TXTS_MAX and set `_txtNext=0`. Then write slot `_txtNext`: `t=_T(t)`, `c`, `life=ml=l\|\|35`, `sz=sz\|\|0`, `_numStr=numStr\|\|null`. Then `_txtNext=(_txtNext+1)%TXTS_MAX` |
| L36311 | native update: `if(t.life>0){t.y-=.6*sp;t.life-=sp}` |
| L30805, L31421, L63894 | `G.txts=[]` on room/stage reset. `_txtNext` is not reset |
| L35014 | ring pool, no compaction |
| L53172-53173 | draw-local cull: `_eVpad=_hiFPS?120:200`; `_vl=cam.x-VW/2-pad`, `_vr=cam.x+VW/2+pad`, `_vt/_vb` the same on y |
| L55288-55328 | draw (see the formula table) |
| L44459-44521 | number atlas: 48×56 cells, 3 colour rows, `"Pirata One"` font stack, shadowBlur 12, gradient, 3 px circular outline, highlight. `drawNumStr` geometry |
| L8876-8884 | `_T`: `ko` returns the input unchanged; otherwise table lookup, then prefix/base equipment composition, otherwise identity |

## API (`producer.gd`, `extends Node2D`)

| Member | Contract |
|---|---|
| `_init(localize: Callable, render_context: Callable, max_slots: int = 40, num_atlas: Texture2D = null)` | Constructor injection. `localize` is the source `_T`. `render_context()` returns a Dictionary. If `num_atlas` is given, it is routed through `set_number_atlas` |
| `set_number_atlas(tex: Texture2D) -> bool` | Read-only caller-supplied source `_numAtlas`. Must be exactly 480×168 (`_NUM_W*10 × _NUM_H*3`). A null or wrong-size texture is rejected (`num_atlas_rejected`+1) and the previous atlas is kept. `num_atlas_status`: `absent` / `supplied` / `rejected:null` / `rejected:size_WxH` |
| `clear_number_atlas()` / `has_number_atlas()` | Back to the explicit gap / query |
| `add_txt(x, y, t, c, l=null, sz=null, num_str=null) -> bool` | Source `addTxt`, using JS falsy rules (`null/false/0/NaN/""`). Returns false and makes **no state change** only if there is no localizer |
| `native_tick(sp: float)` | Source L36311. **Only the central guarded native60 clock may call this**, after the source update-return guards |
| `reset_source_txts()` | `G.txts=[]`. Keeps `txt_next` |
| `set_txts_max(n)` | Testbed `TXTS_MAX` reassignment. The pool grows on the next `add_txt` |
| `build_draw_plan(ctx) -> Array[Dictionary]` | Pure draw plan in slot order |
| `num_str_layout(num,x,y,sc)` / `num_color_index(c)` (static) | `drawNumStr` geometry and colour row |
| `_process` | Only calls `queue_redraw()`. Never advances time |
| `_draw` | Real glyphs via `draw_string` (general branch) |
| `get_counters()`, `get_last_trace()`, `get_last_render_error()`, `font_status`, `bold_mode` | Observability |
| state | `txts: Array[Dictionary]` (8 fields per slot), `txt_next`, `txts_max` |

Required `render_context` keys: `float_text_enabled` (`_FLOAT_TEXT_ENABLED`), `bt_active` (`window._btActive`), `cam_x`, `cam_y` (`G.cam`), `vw`, `vh` (`VW/VH`), `hi_fps` (`_hiFPS`). If the provider or a key is missing, nothing is drawn and `render_context_missing[_key:<k>]` is set.

## Draw formula (L55288-55328), ported exactly

| Step | Source |
|---|---|
| gate | `_FLOAT_TEXT_ENABLED` false → nothing drawn |
| order | slot index 0..len-1. This is ring slot order, **not** admission order: after a wrap, the newest text in slot 0 is drawn first (under older ones) |
| skip | `life<=0`. Cull is inclusive: x<_vl, x>_vr, y<_vt, y>_vb → skip |
| whitelist | if `!bt_active` and no `_numStr`: draw only if `t` contains one of `시전, 그로기, 무적, CRIT, 사망, 탈출, ✟, 🌋` |
| alpha | `raw=life/ml`; `ta = raw>0.2 ? 1 : raw*5` |
| pop | `age=1-raw`; `pt=min(1,age*5)`; `bn = pt<1 ? 1+.5(1-pt)²cos(2πpt) : 1` |
| shake | `bSz=sz\|\|22`; `sk = bSz>=36 && age<.3 ? sin(age*80)(1-age*3.3)*3 : 0`. Applied to x only |
| number branch | `sz>=28 && _numStr` → plan branch `num_atlas`: colour row `ci` (`#66ddff`→2; `#dd2200/#cc0000/#ff0000`→1; else 0), `sc=(bSz/48)*bn`, `drawNumStr(x+sk, y-56*sc/2)`: `dw=~~(48sc)`, `dh=~~(56sc)`, `gap=~~(18sc)`, `ox=x-len*gap/2`, each char `d=code-48`; non-digits are skipped but still advance `i` |
| number blit | Atlas supplied: under `globalAlpha=_ta`, one `draw_texture_rect_region(atlas, dst=(~~(ox+i*gap), ~~y, dw, dh), src=(d*48, ci*56, 48, 56), modulate a=_ta)` per digit, in string order. Trace op `num_atlas_drawn` with `blits[{digit,src,dst}]`, `ci`, `sc`, `alpha`. No atlas: op `skipped_num_atlas_gap`, nothing drawn |
| general branch | `fSz=~~(bSz*bn)`, font `900 fSz "Noto Sans KR"`, alpha `ta`, `ow=max(1,~~(fSz*.06))`, 8 black fills in the source offset order, then a white fill. **The caller colour `c` is not used** |

## State/execution classes

| Class | Content |
|---|---|
| source-native state | `txts`, `txt_next`, `txts_max`. Changed only by `add_txt`, `native_tick`, `reset_source_txts`, `set_txts_max` |
| native clock | `native_tick(sp)` from central. Pause = central does not call it (source update returns before L36311). Text stays drawn and frozen while paused |
| renderer | `_process`→`queue_redraw`; `_draw` reads the injected context. No time, no state writes except the trace/counters |
| owner independence | Slots hold no owner. Owner death/cancellation does not touch texts (source) |
| not invented | no throttling, distance cull beyond source, jump, velocity, owner cancel, or blacklist use |

## Known gaps / RETOUCH

| Gap | State |
|---|---|
| **Number atlas resource** (`sz>=28 && _numStr`) | **Consumer complete, resource missing.** The texture consumer (`set_number_atlas` + `draw_texture_rect_region` with source regions/dests/alpha/order) is real production code. The **original atlas pixels do not exist in Godot**: the source bakes them at runtime with a gradient fill, shadowBlur 12 glow, a 3 px circular outline, a highlight and a `"Pirata One"` face, and only `NotoSansKR.ttf` exists in Godot assets. Until central supplies a real 480×168 atlas, the branch stays an explicit gap (`skipped_num_atlas_gap`, `num_atlas_gap_skipped`). Supplying the atlas, its gradient/glow/Pirata fidelity, and comparison with the public build are **central dependencies**. No font/PNG was generated, copied, hashed or imported. A possible future baker path (`godot/port_modules/floating_text/num_atlas.gd`) has not been created |
| Test atlas fixture | `_diag_atlas()` in `test_first.gd` is an **in-memory, fixture-only** ImageTexture: solid colour per cell, never saved. It proves the regions and order the consumer samples. It is **not** the original glyph art and does not complete damage-number rendering |
| `textBaseline='middle'` | Approximated as baseline = y + (ascent − descent)/2 (Chromium em-middle). Not compared to source canvas |
| weight 900 | wght axis 900 if present, otherwise synthetic embolden 0.9 (`bold_mode` reports which) |
| emoji/✟/🌋 glyphs | Depend on Godot system font fallback. Not verified |
| `_T` prefix/base equipment composition | Belongs to the central injected localizer. The test fixture implements only ko identity + table + identity fallback |
| `fSz<=0` | Skipped (`skipped_nonpositive_font_size`). In a browser, an invalid font string keeps the previous font. Edge case only |
| AA / source-canvas comparison / live world | RETOUCH. gl_compatibility/GLES3 has no effective 2D MSAA; none requested or claimed |
| Live behaviour of `경직!` and `콤보 종료` | Admitted, ticked and expired normally. With `bt_active=false` (normal play) the source whitelist **does not draw them**. They draw only under testbed `_btActive`. This is source truth, not a port defect |

## Current central binding and remaining adapters

1. **Implemented:** `World` installs one `native_floating_text_adapter.gd` and one producer below its canvas. Actual World ko identity and adapter view callbacks have long-lived Node owners. World inputs and actual Camera centre are each transformed into producer local space once; actual viewport size is divided by Camera zoom.
2. **Implemented in the current native slice:** existing HitFX priority3 post calls `advance_native_text(context.dt_sp, actual World frame, actual ens reference)` once; that guard calls source L36311 `native_tick`. Full original rifts/camera update ordering is not claimed.
3. Call `reset_source_txts()` at the three `G.txts=[]` resets.
4. Wire `Callable(producer, "add_txt")` into `shield_bash_reaction.configure(..., add_txt)`, the `detonate_blast` `add_txt` sink, and the combo-expiry text checkpoint (`addTxt(P.x,P.y-50,_T('콤보 종료: ')+combo,'#ff6644',60)`). Callers that already pass `_T(x)` get `_T` applied twice, which matches the source.
5. Draw layer placement relative to other world passes (source: after the Shift gauge, before `drawAtmosphere`).
6. Testbed: `set_txts_max(120)`.
7. Number atlas: supply the real source-equivalent 480×168 `_numAtlas` Texture2D through `set_number_atlas`. Central owns its gradient/glow/outline/highlight/Pirata fidelity and the comparison with the public build. Until then, damage numbers are an explicit gap.
8. **Provider lifetime (required).** A `Callable` does not keep its RefCounted target alive. The objects behind the real `_T` Callable and the view/render-context Callable must stay alive for the producer's whole lifetime. Existing live-world callbacks on long-lived nodes or autoloads are accepted as they are. If central wraps them in a RefCounted adapter, it must keep that adapter strongly referenced. The FIRST tests keep their fixed RefCounted providers in producer metadata `fixture_owners`, and that is **test-only**. If a provider is freed, the producer fails safe (`rejected_no_localizer` / `render_context_missing`) and does not crash.

### Central binding facts (ENGINE/root, latest; recorded here only, no code change)

| Fact | State |
|---|---|
| hit-FX owner | Actual `World.emit_native_text(x,y,text,color,life=null,size=null,num_str=null)` delegates to one general ring40. `_add_dark_text` delegates once with life30/size22 to that ring; actual World legacy `_texts`/Label allocation is0. Unbound standalone helpers retain their prior fallback and are outside this new binding proof. |
| existing text aging | Actual World-bound texts are advanced once at existing HitFX priority3 post using actual context.dt_sp/frame/ens. The producer applies **y−=.6×ticks then life−=ticks** for life>0, including the expiry update. No delegated private Label aging or render clock. `advance_particle_pre_projectile` remains particle pre-phase only. |
| this module | preserves the source L36311 order itself: `if(life>0){y-=.6*sp; life-=sp}` |
| central live APIs | `emit_native_text`, `get_native_text_snapshot`, `localize_native_text` (ko identity), `get_native_text_font` (original NotoSansKR Resource), `get_native_frame()`, `get_native_world_identity` (actual Array ref), `get_native_projectile_fx_context`. Context schema `exoduser.godot.native-projectile-fx-context.v1`: `clock_mode=godot_delta_native60`, `budget_scope=new_native_hit_fx_only`, `dt_sp`, `frame_reset_epoch`, `text_pool_limit=40`, `float_text_enabled=true`, `battle_test_active=false`, `hi_fps`, and others |
| scope limit | the `new_native_hit_fx_only` budget scope is **not** promoted to global full parity |

**Seam handoff to ENGINE (this module adds no code or API).**

1. **Clock.** ENGINE's post-phase calls this producer's `native_tick(sp)` **once per native frame**, using the same source `dt_sp`. The producer's `_process` only redraws and reads the camera; it never adds to the life clock. This module does not write a new automatic global driver.
2. **One event → one pool implemented:** the actual World public sink and dark-event delegation use one ring. The new actual binding FIRST proves dark admission1/private entries0/Label0.
3. **Private dark text redirected:** actual World binds the sink before ready. Persistent bound state prevents legacy Label fallback if the backend is later freed. Delegated entries have no parallel private render/aging. The producer never reads or mutates helper `_texts` / `_text_next`.
4. **Render-context projection** (central provider):

| producer key | central source |
|---|---|
| `float_text_enabled` | context `float_text_enabled` |
| `bt_active` | context `battle_test_active` |
| `hi_fps` | context `hi_fps` |
| `cam_x`, `cam_y` | real live camera centre (`G.cam` equivalent) |
| `vw`, `vh` | real logical view size (`VW/VH` equivalent) |

5. **Localizer.** The real `_T` provider's owner must stay alive for the producer's lifetime (step 8).
6. **Number atlas (optional).** Pass a real 480×168 atlas via the constructor or `set_number_atlas`. With no atlas, the branch stays the explicit gap.
7. `text_pool_limit=40` matches `SRC_TXTS_MAX`; the testbed value 120 is set via `set_txts_max`.

Current boundary: original number atlas is missing; real World public sink, camera/view projection, ko identity and single post3 clock are connected. Other gameplay callers/full locale/public visual remain incomplete; verdict RETOUCH. Original FIRST producer authorship: Claude; original execution: Codex executor. The subsequent ENGINE-owned shared binding and normal checkpoint are recorded in the actual binding SSOT.

### Integration contract summary (handoff)

| Item | Contract |
|---|---|
| construct | `producer.gd.new(localize: Callable, render_context: Callable, max_slots := 40, num_atlas: Texture2D = null)`. The atlas is optional and read-only, exactly 480×168 |
| admit | `add_txt(x, y, t, c, l=null, sz=null, num_str=null) -> bool` (source `addTxt`, `_T` at admission) |
| clock | Actual binding calls source L36311 `native_tick(sp)` once via guarded World HitFX priority3 post. The renderer adds no ticks; complete original rifts/camera ordering is not claimed. |
| reset / testbed | `reset_source_txts()` at the three `G.txts=[]` sites; `set_txts_max(120)` for the testbed |
| number atlas | `set_number_atlas(tex)` / `clear_number_atlas()` / `has_number_atlas()`. With no atlas: explicit `skipped_num_atlas_gap` |
| render context keys | `float_text_enabled, bt_active, cam_x, cam_y, vw, vh, hi_fps` |
| draw order | source only: Shift gauge → floating texts → `drawAtmosphere`. Slot order inside the text pass |

Not claimed: original number glyphs, complete locale/settings and all gameplay callers, public-play comparison, minimum-240 performance, source-support promotion or shipping advancement. Real World/camera/ko identity/post3 binding is proven only by the separate new4 unique tests: first3 + new lifecycle1.

## Source-complete vs consumer-complete

| Part | State |
|---|---|
| addTxt / ring pool / native update / reset | source-complete port. FIRST semantic PASS |
| general text glyph draw | source-complete port with Noto Sans KR glyphs (weight-axis 900). FIRST draw-trace + native pixels PASS. RETOUCH: baseline/AA/canvas comparison |
| number branch geometry + texture consumer | consumer-complete. FIRST PASS with a **fixture-only** diagnostic texture (not original glyphs) |
| number atlas pixels (original glyph art) | **missing**. Central dependency, not claimed. The native capture shows only the gap |
| live world | **Partially integrated:** actual World public sink + camera/view + ko identity + guarded post3 clock and dark-event delegation; new4 unique PASS: first3 + new lifecycle1. Other callers, complete locale/settings, source pass-order comparison, reset/testbed120 and public quality remain central gaps. |

## Tests (`test_first.gd`) — FIRST complete: 16 groups / 148 valid checks PASS (see Attempt history)

`--only=<g1,g2>` (unknown/empty → exit 2), `--json-out=/abs`, `--render-proof=/abs/out.png` (non-headless only, exit 3 under headless; `get_image` is never called headless). The JSON separates `failed_groups` from `errored_groups` (`completed=false`) and gives each group an `evidence_class`.

| Group | Class | Checks |
|---|---|---|
| source_constants | semantic | constants above |
| admission | semantic | pool fill 40, caller fields, `l\|\|35` (undefined/0/NaN), −5 kept, `sz\|\|0`, `numStr\|\|null`, no-localizer reject |
| localization | semantic | `_T` at admission, miss → identity, double `_T` |
| ring_overwrite | semantic | 41st → slot 0, size fixed, 120 grow resets next, reset keeps next |
| order | semantic | slot order after wrap |
| native_advance | semantic | y −.6·sp, life −sp, frozen ≤0, fractional sp, x untouched |
| pause | semantic | frames add no ticks; drawn while paused; no owner field |
| expiry | semantic | l60 → life0 at tick 60 → not drawn, stays in pool, overshoot −1 |
| whitelist_cull | semantic | `경직!` filtered when `!bt_active`, whitelist substring/numStr pass, inclusive bounds, pad 200/120 |
| draw_formula | semantic | alpha/bn/fSz/ow/shake at given ages |
| num_branch_gap | semantic | branch select, colour rows, `drawNumStr` geometry |
| callers | semantic | bash `.call` 5 args, detonate `callv`, combo text |
| glyph_draw | draw_trace | `_draw` dispatched in tree, font loaded, `general_9_fills`, atlas gap reported, 0 ticks |
| render_context_errors | draw_trace | missing provider/key → error, nothing drawn |
| num_atlas_consumer | semantic (fixture-only texture) | default absent, null/48×56 rejected, 480×168 accepted, wrong size after valid keeps the valid atlas, reject counter 3, pool untouched, clear → absent, constructor atlas |
| num_atlas_draw | draw_trace (fixture-only texture, NOT original glyphs) | in tree: slot-order trace; `123` crit → src `(48/96/144, 56, 48, 56)`, dst equal to the `drawNumStr` layout, alpha 1; `9a0` shield → `a` skipped, src `(432,112)`/`(0,112)`, alpha .5; the general glyph still drawn; no gap skips; no extra ticks; clear → `skipped_num_atlas_gap` |

Render proof (`pixels`): fresh isolated 640×360 SubViewport with a mid-grey QA backdrop (not game art), the same producer, fixed constructor providers, 18 explicit native ticks. Probes:

- A `경직!` (real bash caller, l30, after 10 ticks): white and black pixels present, no `#8888ff`-like pixels.
- B `무적` (sz40, raw .1 → alpha .5): max luminance in (0.4, 0.8) and no full white.
- D expired region: backdrop only.
- E numStr: trace `skipped_num_atlas_gap`, region backdrop only. This is a reported gap, not a success. The proof supplies **no** atlas, so the diagnostic fixture texture never appears in the screenshot.

Verdict field: RETOUCH.

## Related existing docs (keyword search `addTxt|G.txts|TXTS_MAX|_txtNext|플로팅 텍스트|floating text|부유 텍스트`, paths only, for central)

Excluded: `docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md` and immutable2_3. Marketing contents were not read.

- docs/engine/FDG_GODOT_PORT_DETONATE_BLAST_FIRST_20261013.md
- docs/engine/FDG_GODOT_PORT_NATIVE40_FACTORY_FIRST_20261013.md
- docs/engine/FDG_GODOT_PORT_COMBO_EXPIRY_FIRST_20261013.md
- docs/engine/FDG_GODOT_ETYPE47_FIRST_20261013.md
- docs/engine/FDG_GODOT_PORT_SHIELD_BASH_REACTION_FIRST_20261013.md
- docs/engine/FDG_GODOT_ETYPE6_FIRST_20261013.md
- docs/CHANGELOG_SYNC.md
- docs/engine/FDG_ENGINE.md
- docs/engine/FDG_GODOT_M30_EPICENTER_20261013.md
- docs/engine/FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md
- docs/engine/FDG_RUNTIME.md
- docs/engine/FDG_DARK_DRUID_COMBAT_READABILITY_20261011.md
- docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md
- docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md
- docs/3.1 ui hud 디자인/exoduser-hud-redesign.md
- docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md
- docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md
- docs/7아이템디자인/exoduser-item-system-full.md
- docs/16영문화(i18n)/영문화_진행현황.md
- docs/16번역·로컬라이제이션/번역대상_전체목록.md
- docs/8.1보스디자인바이블/BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md
- docs/4.1맵디자인+설정/map-objects-placeholder-prompt (2).md
- docs/2_9 결정슬롯시스템/2_9 결정슬롯시스템.md
- docs/13출시·마케팅/SKILL_TRAILER_V24_DAMAGE_TEXT_20260910.md (path only)
- docs/13출시·마케팅/GAMEPLAY_TRAILER_V22_20260909.md (path only)
- docs/12퍼포먼스·최적화/COMBAT_PRESENTATION_20260909.md

Unchanged: public stats, QE, blackBean, source, independent bullets, assets (no copy, hash or import), Main, Player, factory, other modules and docs, Git.
