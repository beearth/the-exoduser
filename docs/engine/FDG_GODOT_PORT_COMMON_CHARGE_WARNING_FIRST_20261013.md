<!-- fdg-godot-native-owner-element-integration-20261013:begin -->
## Godot 소환·6원소 실행 연결 / 현재 이식 경계 · 2026-10-13

| 항목 | 현재 코드·검증 / 미완 범위 |
|---|---|
| 정본 | `docs/engine/FDG_GODOT_TYPE7_INTEGRATION_20261013.md` 및 `FDG_GODOT_TYPE3_BINDING_20261013.md`. 이번 새 production은 실제 World 시계·registry, type3 binding, 원 6속성 packet→투사체→피격FX, type7 조립 API이다. 원337/supportfalse/runtimeNULL·기존 텔레포트/M30/6source/배송5 증거는 보존한다. |
| 시계·생성 순서 | World priority−1 `ticks=min(delta×60,3)`/actual frame·ens Array identity→관리 owner1→원 particle pool update→warning1→기존탄 priority1→새탄 birth2→hitFX post3. getter setter0/AI 이중 자동실행0/SceneTree pause 상속. 초기 report와 동적 child registry를 구분한다. |
| source packet | `_commit`도 dmg×2/sz×2/r4×1.3=5.2. P redBean .5를 후적용해 raw피해 유지/300pxs; magic500..600. P/L/H size3·margin13, F/I/D size3.2·margin13.6. type3 life60/type7common240/TPqueued300, decay.667·homing.00655/life>30. D caller-life60/240 pair만 지원/범용D120 alias0·추가poison0. |
| 실제 피해·FX | type3 F/H는 magic·headingKB2, D는 정규화피해×1.3 magic·기본hurtP KB보존. M29 body는 모든원소 phys이며 elMul 선배율→기본hurtP→독립KB100. current armor미착용 native 배율1. 실제 hitFX 새원bitmap4 합779557B(512²/4×4/cell128²) 최초import4/3.545726167초/ERROR0·oldtexture reimport0. |
| source 상태·입장 | raw source와 별도 actor ctor payload에 facing/eShield/eShieldMax/eRes/native_flags/bodyrect/direction/ai_profile만 투영한다. absent nativeflag는 absent 유지(null/false 발명0). M29 Q/E·warning·impact·SOUND 4cap 및 실제6원소·summon_context가 준비되지 않으면 type7 configure/prepare/install 원자거부. sourceRecord와 pendingJSON은 수정하지 않는다. |
| 현재 기술 인수 | 새고유12PASS=type3 binding4+실World phase2+6원소/FX4+type7 assembly2. assembly는 첫missingM29 1PASS/actual1FAIL→실패actual1만추가FAIL→같은실패1만1.948709167초/exit0/assert0/ERROR0 PASS 이력. source map Dictionary8/absentflag 투영을수리했으며원337/TP본문불변, 모든성공재실행0. actualWorld16frames/owner32·particle/warning/birth/post 각16·pause4, actualFHD Player피해/KB·FX pool12·65생존/66만료·invalid8 부분출력0. |
| Main·배송·시각 | 이번조립 API는 Main/factory 자동등록0. current Main source지원6/미10, 동결Web·Windows배송5/미11. constructor readiness fixture를실제공개Q/E·자연소환/교전·publicpixels/GPU·최저1080p240·24고유프레임/24FPS로승격하지않는다. **VISUAL VERDICT: RETOUCH**. |
| 다음 실제 연결 | 새type7 actualassembly기술단위를 정상 code+관련docs checkpoint→같은SKILL actualNativePlayer 명령/패링 leaf 및 ANIM M29 owner-event소비→본편 자연소환/텔레포트/교전·시각검수. source수치·원MAP/geometry/nav/STARTEXIT·보호paused화면/서버/save/타WIP 유지. |

<!-- fdg-godot-native-owner-element-integration-20261013:end -->

# FDG Godot Port — Common Charge / Queued-Shot Warning Renderer (first) — 2026-10-13

Status: **producer + tests + render-proof mode written; NOT executed by the author.** No test results, pixels, or visual240 are claimed here. The Codex executor runs the isolated tests and captures the native-render QA PNG.

## Owned files (new)

| Path | Role |
|---|---|
| `godot/port_modules/common_charge_warning/producer.gd` | actual `Node2D` renderer (`_draw` primitives), read-only providers |
| `godot/port_modules/common_charge_warning/test_first.gd` | `SceneTree` test runner: groups G01–G12, rerun, report, `--render-proof` |
| `docs/engine/FDG_GODOT_PORT_COMMON_CHARGE_WARNING_FIRST_20261013.md` | this doc |

No helper, shader, PNG, or new asset. The before-edit manifest was recorded by the executor (`.../team-port/common_charge_warning/before-edit/manifest.json`, all three paths absent from the working tree and from HEAD).

## Scope

Only two branches of the original `_drawEnemyShotWarnings()` (game.html L20547-20569) are in scope:

1. **Common enemy charge**: `e.alive && e._projChargeT>0 && e._projChargeCol` (L20551-20556).
2. **Common queued-shot warnings**: `G._shotWarnings`, filtered by `w.world===ens` (L20561-20568).

These are out of scope and are not replaced or combined here: `eShootWind` (L20557), `G._spiralBullets` (L20559), `G._phantomSwords` (L20560), the M29 eliteCharge telegraph (vfx_m29), TP warnings, hit-FX, and type7/type3/M30/6-element shots.

## Source equations (game.html, read narrowly)

| Item | Source | Port |
|---|---|---|
| ring radius | `R=r+10` (L24607) | `R` |
| progress clamp | `prog<0?0:prog>1?1:prog` (L24606) | `clamp_progress` (NaN passes through, so no arc is drawn) |
| track | `#080808`, alpha `sa*.28`, width 5, full arc 0..2π, round cap (L24610-24611) | two half-ring polygons (no seam double-blend) |
| progress arc | drawn only when `prog>0`; `-π/2 → -π/2+2π·prog`, round cap (L24612-24614) | `capsule_polygon` (one simple polygon) |
| physical stroke | `#ffffff`, width 6, alpha `sa`. The passed `#f4f4f4` is ignored (L24613) | `stroke_src="#ffffff"` |
| magic stroke | `col||'#ff6644'`, width 3.5, alpha `sa*(.8+prog*.2)` | same; an invalid CSS colour keeps `#080808` (canvas ignores bad `strokeStyle`) |
| charge progress | `1-e._projChargeT/60` (L20554) | `charge_progress` |
| queue progress | `1-w.t/60` (L20566) | same |
| charge physical | `_projectileParryClass({el:e.el,parryClass:e._projChargeParryClass})==='physical'`, i.e. explicit parryClass, else `(el??EL.P)===EL.P` (L17308-17317) | `source_parry_class` |
| charge colour | physical `#f4f4f4`; bean `black` → `_BEAN_RAINBOW[(_gameFrame>>2)%7]`; bean `fire` → `#ff2e22`; otherwise `_projChargeCol` (L20553) | `_build` |
| queue physical | `w.parryClass==='physical'` (L20565) | strict string compare |
| queue colour | physical `#f4f4f4`; `w.blackBean` → rainbow; otherwise `w.col` (L20566) | `_build` |
| queue position | `w.dead ? (w.x,w.y) : (owner.x, owner.y)`, radius `w.r` (lane `(e.r||12)+lane*8` is set upstream, L20526) | `_build` |
| label | physical only. Text `_L('물리탄 차징 · E로 패링','PHYSICAL SHOT CHARGING · PARRY WITH E')`, `cy=y-r-25`, `bold 13px "Noto Sans KR"`, center/middle, `bw=measureText+14`, `bh=20`, fill `rgba(5,8,13,.92)`, stroke `#f4f4f4` width 1.5, text `#ffffff`, `source-over`, alpha 1 (L24590-24603) | `_make_entry` + `_draw_entry`; stroke drawn as 4 non-overlapping centred strips (mitred corners) |
| draw order | enemy loop before queue loop; per entry, ring then label (L20549 → L20562) | entries order + trace |
| layer | after enemy bodies, before enemy projectile passes (L54503), world space under the camera transform | caller places the node (see gap) |
| cull | none. The warning pass ignores body early-continue, decoration distance and stealth alpha. Only projectiles are culled, later at L54508 | no cull |

### Clock

- **native60 countdown**: `_projChargeT` / `w.t` are decremented only by `_tickProjCharge` (L20604) and `_tickEnemyShotWarnings` (L20531), both in update. The renderer reads them and never counts down.
- The only animated value is the BlackBean rainbow. It is keyed to `_gameFrame`, the update tick (L32793, after the pause return), and not to `performance.now`. This path has no real-time or render-clock pulse, so `_process(delta)` never changes colour or progress. The caller must supply the source `_gameFrame` (pause-frozen).
- BlackBean stays magic (Q-only). Upstream `_projectileParryClass` returns `magic` for `blackBean` and `w.parryClass` stores that result. A rainbow ring never has an E label. The E label appears only on physical entries, using the literal source text.
- Source quirk, kept as-is: the charge branch passes only `{el, parryClass}`. In theory, an `el=P` enemy with `_projChargeBean='black'` and a null parryClass would be physical/white. The common start code (L41115-41117) never produces bean `black` and always sets the parryClass.

## Producer API (`producer.gd`, `extends Node2D`)

| API | Meaning |
|---|---|
| `configure(snapshot_provider: Callable, frame_provider := Callable())` | live read-only providers, polled in `_process` when `auto_refresh` |
| `configure_fixed_snapshot(snapshot: Dictionary, frame_provider := Callable())` | constructor fixture (deep copy) |
| `set_label_font(font: Font, status := "caller")` | caller-supplied original font |
| `refresh() -> int` | pull + build + `queue_redraw()`; returns entry count |
| `build_draw_list(snapshot, frame_ctx := {}) -> Array` | pure evaluation (does not touch live entries/skips) |
| `get_entries()`, `get_last_draw_trace()`, `get_skip_counts()`, `get_counters()`, `get_label_font()` | read-out |
| static `source_parry_class`, `charge_progress`, `clamp_progress`, `rainbow_col`, `progress_mode`, `capsule_polygon`, `sector_polygon`, `half_disc_polygon` | equations |
| `auto_refresh` | renderer-local |

Writable state (renderer-local only): entries, skips, trace, font handle, counters (`api_call_count`, `refresh_count`, `draw_dispatch_count`, `process_count`, `physics_count`). Physics processing is disabled in `_ready`. There are no setters for clock, HP, coordinates, AI, observer, or victory state. Providers are only read, via `Dictionary.get` or `Object.get`.

### Field closure (snapshot, source-native keys)

```
{ game_frame:int (_gameFrame), lang:"ko"|..., world:<identity of ens>,
  enemies:[{id, alive, x, y, r, el, _projChargeT, _projChargeCol, _projChargeBean, _projChargeParryClass}],
  shot_warnings:[{owner (actor) | owner_id, world, dead, x, y, r, t, parryClass, blackBean, col}] }
frame_provider() -> {game_frame?, lang?, physical_label? (= _T(ko) translation for non-ko)}
```

Enemies and warnings may be Dictionaries or Objects. The unused source fields are `w.el`, `w.frame`, `w.shots`, `_projChargeBean` values other than `black`/`fire`, and `e.el` beyond the class check. Skip reasons are counted: `enemy_not_alive`, `charge_t_not_positive`, `charge_col_falsy`, `invalid_r`, `world_mismatch`, `owner_unresolved`, `invalid_warning_t_or_r`, `null_warning`.

### Port tessellation and fidelity notes (not source values)

- Arcs use 96 segments per full circle and caps use 12. Polygons are not antialiased by themselves. Canvas-like AA comes from viewport `msaa_2d`, which the render fixture sets to 4x; the live caller viewport setting is central-owned.
- `progress_mode`:
  - `none`: prog≤0.
  - `dot`: arc length < 0.05px, drawn as a round-cap disc.
  - `capsule`: one simple polygon.
  - `piecewise`: used when `2π·prog + 2·asin(w/2R) ≥ 2π`; draws a sector plus two half-disc caps. The overlap only happens at magic alpha ≥ ~0.994, so the difference is ≤ ~2/255.
  - `full`: prog=1.
- Text baseline uses `cy + (ascent − descent)/2` to approximate the canvas `textBaseline='middle'` (expected within ~1px).

## Font / resource dependency

- Uses the existing `res://assets/fonts/NotoSansKR.ttf` (already imported). No new font. If it is absent, `font_status="missing:res://assets/fonts/NotoSansKR.ttf"` is reported and labels are skipped (`label_skipped_font_missing`). No replacement font is substituted.
- Weight: the source loads Google `Noto Sans KR` wght 700 (game.html L118). If the TTF exposes a `wght` axis, the producer sets 700 (`bold_mode=wght_axis_700`). Otherwise it applies synthetic `variation_embolden=0.6` and reports `bold_mode=synthetic_embolden_0.6_no_wght_axis`, which is an approximation. G01 and the render JSON report which mode was used.

## Tests (`test_first.gd`)

Run from `godot/`: `godot --headless --path . -s res://port_modules/common_charge_warning/test_first.gd -- [--only=G01,G05] [--rerun-failed=/abs/prev.json] [--report=/abs/out.json]`.

| ID | Checks (expected values hand-derived from source literals) |
|---|---|
| G01 | label/rainbow/track/stroke/box literals; font loaded (INVALID if missing); bold mode note |
| G02 | T=60→prog0/no arc; 59, 45, 30; 60.5 clamps to 0; T≤0 or null → not drawn; queue t=30 → .5; magic alpha .85 at .25 |
| G03 | parry class rules; ko/en label exact; physical stroke `#ffffff`/6/1 vs passed `#f4f4f4`; BlackBean queued → magic, no E label; `_T` override |
| G04 | rainbow at gf 0/3/4/12/15/16/27/28; fire override; dark col; `'#ff6644'` fallback; invalid CSS keeps track colour |
| G05 | (100,200) r14 T45 → R24, arc −π/2..0, cy161, by151, bh20, bw=tw+14, centred; alive owner uses owner coords; `w.dead` uses stored coords; lane r → R; y-down orientation |
| G06 | no cull (100000,−50000); dead enemy / falsy col skipped; queue has no alive check; world mismatch / unresolved owner skipped; missing world → nothing |
| G07 | in tree: render frames do not animate; gf 12→`#00ff66`, gf 16→`#00ccff` via frame provider only; progress fixed at snapshot T; physics 0 |
| G08 | Dictionary snapshot unchanged (`var_to_str`); Object actors with write-counting `_set` → 0 writes; no state-writing method names |
| G09 | actual `_draw` dispatch in SceneTree; trace primitives; API calls = 2; no redraw without refresh; process counted, physics 0 |
| G10 | mode thresholds (magic R22 w3.5 → .97466; physical R24 w6 → .96011); capsule/sector polygons triangulate |
| G11 | charge pass before queue pass; per entry track → progress → label_box → label_text |
| G12 | actual viewport pixel probes; **SKIP_DUMMY** under `--headless` (not PASS) |

Each group line prints `native_method`, `renderer_dispatch`, `process`, and `physics` counts separately; the same counts go into the JSON report. Exit codes: 0 pass, 1 FAIL, 2 INVALID/args, 3 dummy-renderer render proof. `SUMMARY ... ACTUAL_PIXELS=true|false` states explicitly whether real pixels were verified.

**Headless vs actual pixels:** under `--headless` (dummy renderer), `_draw` is still dispatched and the trace is real. No pixels exist, so G01–G11 prove logic and dispatch only, not visual completion.

## Isolated render proof

`godot --path . -s res://port_modules/common_charge_warning/test_first.gd -- --render-proof=/abs/out.png [--lang=en]` (non-headless, fresh process; no existing scene, input, server, or human view is involved)

- A 1280×720 `SubViewport` (MSAA 4x, `UPDATE_ALWAYS`) with a QA backdrop `#3a4150` (not game art). The production `producer.gd` is configured with a fixed fixture provider. The test waits 4 process frames and 3 `frame_post_draw` signals, then `get_texture().get_image()` → `save_png`, writes `<png>.json` (renderer, adapter, font/bold mode, counters, entries, probes, fixture-unchanged flag), and auto-exits.
- Fixture (`render_fixture_snapshot`, `game_frame=12`):
  - Row A (y170), common charge:
    - physical T45 (.25)
    - fire T30 (.5)
    - physical r16 T6 (.9)
    - dark T15 (.75)
    - water T0.5 (piecewise)
  - Row B (y420), queue:
    - B1: physical lane0 r12 and magic `#ffaa00` lane1 r20 on the same owner. Source behaviour kept: the lane1 ring overlaps the bottom of lane0's label.
    - B2: BlackBean t20 → `#00ff66`.
    - B3: `w.dead` at stored (880,420), owner at (5,5).
    - B4: world mismatch → absent.
  - Row C (y620): dead enemy (absent) and physical T60 (track only plus label).
- Probes: expected colours are computed in the test from source hex values and alphas composited over the backdrop (tolerance 0.035). They cover white/magic/rainbow arcs, track, absent negatives, label fill, border, and text-pixel count.

## Verification history

| # | Run (by Codex executor) | Result | Repair |
|---|---|---|---|
| 1 | headless, `--only` G01..G11 | **INVALID**: the whole script failed to parse before any group ran. `Parse Error: Cannot find member "resource_path" in base "res://port_modules/common_charge_warning/producer.gd"` at `test_first.gd:644` (`PRODUCER.resource_path` was resolved as a class static member). Shell exit 0, but tests, native methods and render dispatch were all 0, so it is not a PASS. | Render-fixture metadata only: `(PRODUCER as Script).resource_path`. Producer formulas, test expectations and game state unchanged. |

Environment of run 1 (reported by the executor): the original Noto font, its `.import`, and its existing cached `.fontdata` are linked read-only into the isolated project (3 symlink leaves, no bytecopy, no import). No PNGs are linked, copied or imported.

| 2 | headless, G01..G11 (first valid run) | **PASS** for all 11 groups: 177 checks. API calls 35, actual `_draw` dispatches 33, process 32, physics 0. `ACTUAL_PIXELS=false` (dummy renderer, as expected). No successful group was rerun. | none (producer code repairs: 0) |
| 3 | fresh isolated native process, `--render-proof` (no human views or inputs, auto-exit) | **exit 0**. Saved `native-first-proof.png` (1280×720) and the raw sidecar `.json`. Backend: macOS, OpenGL 4.1 Metal, `gl_compatibility`, Apple M5 Pro. All 14 pixel probes PASS on first attempt. Font: original Noto Sans KR loaded with `bold_mode=wght_axis_700`. `fixture_unchanged=true`. Producer counters: API 1, draw_dispatch 7, process 6, physics 0, refresh 6, trace ops 29. | none |

### Final first-attempt evidence (frozen; repeat 0)

- **Pixels:** real viewport pixels from the same production `_draw`. They are not dummy output or getter readings, and they are not a public gameplay capture or an FPS benchmark.
- **Visible in the PNG:**
  - The white physical 6px ring with its E label.
  - Magic 3.5px rings in the source colours and alphas.
  - The queued lanes, and the dead warning drawn at its stored position.
  - Absence of the world-mismatch warning and of the dead enemy's ring.
- **MSAA, requested vs effective:** the driver emitted exactly one warning: `2D MSAA is not yet supported for GLES3`. The sidecar's `msaa_2d: "4x ..."` records only what was **requested**; MSAA was **not applied**. The executor's separate observation JSON records this correction and leaves the raw first evidence untouched.
- **Accepted and frozen:** the headless 11-group result and the native first proof are frozen after acceptance, and neither will be repeated.
- **Assets:** no PNG art was authored; the PNG is only a new native QA capture. The font comes in through 3 read-only symlink leaves, with no copy, no new hash and no import.

### Current limits

- **VISUAL VERDICT: RETOUCH.**
  - Polygon edges are visibly aliased on the current backend, because 2D MSAA is unsupported in GLES3/gl_compatibility here.
  - Live-world and public integration are unverified.
- No other driver rerun is requested.
- Live caller, world/layer placement, queue/charge clock, shared-doc sync and the normal commit are owned by central.
- **Unchanged by this unit:** source enemy support, type7 admission, currentWeb/delivered build, public UI, gameplay, and save state.

## Remaining actual caller gap (central-owned, not done here)

1. Live integration: add the node to the world layer after enemy bodies and before enemy projectile draw. Provide the `ens` identity, the live `_gameFrame` (pause-frozen), lang/`_T`, and an actor/warning provider over the real enemy list and `G._shotWarnings` equivalent.
2. Source state producers do not exist in Godot from this module: the `_projChargeT` start/`_tickProjCharge`/`_fireChargedProj` and `_emitEnemyShot`/`_tickEnemyShotWarnings` queue are central/type owners.
3. Remaining sibling branches of the same pass (`eShootWind`, spiral, phantom swords) must be drawn between the charge pass and the queue pass to keep exact order. This node draws both of its passes in one `_draw`; a caller needing interleaving can use two instances (one fed only enemies, one only warnings).
4. Live viewport `msaa_2d` (canvas-like AA) is a shared project/view decision.
5. No source enemy support, type7 admission, currentWeb delivery, or gameplay/UI change is claimed.

## Shared-doc handoff (central edits; not touched here)

| Path:line | Note |
|---|---|
| `docs/8.0몬스터디자인/탄막시스템_총정리.md:778` | says "92%↑ 흰 외곽 1겹"; the current source `_drawShootCharge` L24604-24617 has no such outer ring. The line ref `~20773` is stale (now L24604). |
| `docs/8.0몬스터디자인/탄막시스템_총정리.md:15`, `docs/8.0몬스터디자인/몬스터_공격시스템.md:15,469-475,775-776`, `docs/5.1임펙트디자인/VFX_구현가이드.md:17,818-819`, `docs/9적ai패턴디자인/9_적AI패턴디자인.md:386-387`, `docs/engine/FDG_INTEGRATION_INTERFACE.md:20` | could reference this Godot producer as the common-path renderer (logic written; pixels pending executor) |
| `docs/engine/FDG_GODOT_TYPE7_TELEPORT_20261013.md:82`, `docs/engine/FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md:16` | same label/ring contract; type7-owned, no change requested |
| `docs/CHANGELOG_SYNC.md` | central checkpoint entry |
