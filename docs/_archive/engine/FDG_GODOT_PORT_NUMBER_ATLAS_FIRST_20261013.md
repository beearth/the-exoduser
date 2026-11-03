## 현재 ENGINE 연결 — 2026-10-14 숫자 atlas startup

기존 실제 World floating text adapter에 원 supplier를 장수명 child로 연결했다. 원 font preflight 후 deferred startup에서 `await bake_native()`를 한 번 실행하고 유효480×168 Texture2D만 기존 `supply_to(floating_text)`로 한 번 전달한다. texture는 adapter·baker·consumer가 유지하며 별도 text/native physics driver와 매frame bake는 0이다.

| 실제 경로 / 필드 | 결과 |
|---|---|
| 새 native startup | actual World→adapter→baker1/bake1/supply1→기존 numeric consumer. 새 고유1 FIRST PASS / 3.094918416초 / exit0·assert0·ERROR0·SCRIPT ERROR0 |
| headless startup | actual World→baker1/bake1/supply0·`unavailable_headless`·viewport0·gap true. 별도 새 고유1 FIRST PASS / 1.483481초. 이 결과를 native 렌더 성공으로 합치지 않음 |
| runtime texture | atlas480×168 / cell48×56 / rows3·digits10, constructor native fixture 요청640×360·actual root1280×720. 실제 World admission `123` crit row1→digit region48/96/144×56, 각각48×56 draw dispatch. native aging0·새 screenshot0 |
| lifecycle / snapshot | before/after await 실제 World/adapter/producer/baker parent·Tree·queued guard. `number_atlas_startup_status/bake_calls/supply_calls/supplier_live/runtime_texture_size/build_report/clock_owner` 추가. late completion은 교체된 backend에 전달하지 않음 |
| 경계 | 실제 native supply가 연결되었으므로 supplier 부재 gap과 구분한다. headless gap·원 Pirata font/baseline/crop/browser raster fidelity·본편 자연 피해숫자 caller·공개 pixels/최저240는 미완. 원 source6/미10·frozen shipping5/미11, 기존 numeric pool40/post3 clock 보존 |

두 실행의 각각 Camera interpolation warning1건은 실제 ledger에 별도로 보존했다. 정상 코드 검사에서 error는 없으며 기존 atlas9/105·8probe, Ctxt4·Cground3 등 기인수 성공 재실행0/원 PNG hash·copy·import0이다. startup 공급자의 새 UID는 actual Godot ResourceUID metadata1회로 생성했으며 코드 검사/asset import가 아니다. [정확한 새 SSOT](FDG_GODOT_NUMBER_ATLAS_BINDING_20261014.md)의 **VISUAL VERDICT: RETOUCH**를 유지한다.

---

# FDG Godot port — damage-number atlas supplier (`_buildNumAtlas` / `_numAtlas`) FIRST — 2026-10-13

Status: **FIRST validation complete; code, tests, successful checks and the corrected PNG are FROZEN.** 9 unique groups / **105 valid checks PASS**. Native isolation proof: **8/8 probes PASS**, shell exit 0, errors 0.
Visual verdict: **RETOUCH.** A real runtime 480×168 `Texture2D` is baked and supplied to the existing floating_text consumer through the corrected isolated-mask path. Not claimed: font fidelity with the source (Pirata One), baseline, browser raster/blur identity, live binding, public play, minimum-240.
Authorship: Claude wrote `producer.gd`, `test_first.gd` and this doc. All tests, native captures and PNG inspections were run by the Codex executor. Records are in the executor proofdir `…/godot-native-first/team-port/number_atlas/`: `check-ledger.json`, `headless-attempt01.json`, `headless-attempt02.json`, `headless-isolation-first.json`, `native-first-proof.json`(+`.png`), `native-isolation-first-proof.json`(+`.png`), `native-isolation-executor-observation.json`.

## Authorship sessions (executor records)

Same configured model `claude-opus-5-5`, model override 0, the same restricted permissions throughout (Read/Glob/Grep plus Write/Edit on the 3 owned paths only). Permission denials 0, writes outside the owned paths 0.

| PID | Claude work |
|---|---|
| 72996 | Design turn, **interrupted before any file was written** (about 41k thinking tokens; interrupted for human speed). In this turn Claude read the planning docs, the source lines, the floating_text production API, and **two reads of an existing test** (`detonate_blast/tests/test_first.gd`, harness-style reference only: not run or hashed, and not adopted as evidence) |
| 73623 | Concrete resume: production `producer.gd`, `test_first.gd`, this doc. No further old-test/scaffold reads after the resume |
| 74564 | Fixture-only repair of the `highlight` group (producer unchanged) |
| 77645 | Production native glyph-mask isolation repair (`producer.gd`), the new group `isolated_mask_border`, and the `--render-isolation-proof` scaffold |
| final | Doc-only update with the executor's final records (this edit) |

## Attempt history (`check-ledger.json`)

| Attempt | By | Result |
|---|---|---|
| headless01 (all 8 groups, shell exit 1, errors 0, runtime-incomplete 0) | Codex executor | **First valid PASS, 7 groups / 74 checks:** geometry 11, palette 8, gradient 22, outline 10, fallback 7, compositor 11, headless_guard 5. **FAIL:** `highlight`, where only `last_row_pure_gradient_r1` failed. The raw 85 assertions were **not** a full PASS |
| cause | analysis | **Fixture error.** The 3-row synthetic fixture ignored the legitimate source-over glow from the later row: row 2's shield glow lies 13 px below row 1's last body row, inside the 18 px reach. The source has no cell clip |
| repair (Claude, test only) | `_g_highlight` | The last-row assertion uses an isolated one-cell-per-row mask. A new assertion checks the real spill on the full fixture with the exact source-over value at the same tolerance. Producer changes 0 |
| headless02 (`--only=highlight`, shell exit 0) | Codex executor | **highlight 12 PASS** |
| native_first (`--render-proof`, once, shell exit 0) | Codex executor | **Technical probes ok** (real 480×168 texture plus numeric consumer render). **Inspection on first viewing found a production defect:** the whole 480×168 glyph mask was sliced into 48×56 cells, so glyph tails were reassigned to the neighbouring row's colours. Nominal-cell `border_ink 758.4196`, fields 20 computed / 10 reused. The technical probes did not catch it. Source no-cell-clip was **not** complete. PNG `native-first-proof.png` inspected once; frozen |
| production repair (Claude) | `producer.gd` | Native glyph masks captured independently with 21 px padding (below). `compose_atlas` and its helpers unchanged. Production visual repairs: 1 |
| headless_isolation_first (`--only=isolated_mask_border`, shell exit 0) | Codex executor | **isolated_mask_border 19 PASS** on first run. The 8 earlier groups were not repeated. These are synthetic padded masks, **not** native glyph proof |
| native_isolation_first (`--render-isolation-proof`, once, explicitly authorised for this task, shell exit 0) | Codex executor | **8/8 probes PASS** (see below). The old `--render-proof` mode and its probe list were **not** re-run. PNG `native-isolation-first-proof.png` inspected once |
| combined | ledger | **9 unique groups / 105 valid checks** (74 + highlight 12 + isolated_mask_border 19). Successful-group repeats 0. Old floating_text suite (16 groups / 148) and old floating native proof (10 probes) replays: 0. Old number-atlas native-mode reruns: 0. Source-canvas pixel-equality tests: 0 |

## Native isolation proof (`native-isolation-first-proof.json`, `native-isolation-executor-observation.json`)

| Field | Value |
|---|---|
| probes (8/8) | `texture_480x168`, `mask_path_isolated`, `slots_30_inked`, `slot_edge_ink_zero`, `overhang_keeps_owner_style`, `supply_to_consumer`, `add_txt_numeric`, `consumer_drawn_no_ticks` — all true. `ok=true`, `shot_png_written=true` |
| build report | `status baked`, `mask_path isolated_slots_90x98_on_900x294_workspace`, `texture_size (480,168)`, `fields_computed 10 / reused 20`, `font_status loaded:res://assets/fonts/NotoSansKR.ttf`, `bold_mode wght_axis_900`, `baseline_mode top_as_ascent`, `blur_backend gaussian_sigma6_radius18_normalised_cpu`, `cell_clip none (canvas bounds only, as source)`, `saved_files 0` |
| mask | 30 slots, `empty_cells 0`, `slot_edge_ink_total 0.0` (each of the 30 slots 0.0), nominal `border_ink 473.847`, **`outside_nominal_ink 828.882`**, `ink_extent_rel_cell` x **10..35**, y **24..58**. Per-cell ink is identical across the 3 rows |
| owner style | **192** fully covered overhang body pixels; all keep their own row's style |
| consumer | real `supply_to` → existing frozen floating_text `set_number_atlas`; **one** crit numeric `add_txt`; text native ticks 0; gameplay native ticks 0; numbers actually drawn |
| bake wall sample | `mask_capture_us 77479`, `compose_us 237351`. This is an **isolated start-up CPU/wall sample, NOT FPS**, GPU completion or minimum-240 |
| display | macOS, OpenGL 4.1 (Metal 90.5), Compatibility renderer, Apple M5 Pro. MSAA requested 0 / effective 0 |
| PNG inspection (once) | White/red/blue 0..9 runtime glyph atlas at 1:1. **The old stripes of other-row colour at the boundaries are gone.** The real crit numeric consumer is rendered. White pieces from the preceding row can still appear inside the 56-px crit crop, because the fallback glyph ink extends to rel y 24..58. No cell clip preserves the correct source owner style; baseline/crop fidelity needs comparison with the original canvas font |
| native QA captures | 2 in total: the first technical capture and the authorised isolation-repair capture. Not a replay of a successful mode |
| verdict | **RETOUCH**. Live binding false. Source-canvas byte identity false |

## Owned files (new)

| Path | State |
|---|---|
| `godot/port_modules/number_atlas/producer.gd` | FIRST validated; frozen |
| `godot/port_modules/number_atlas/test_first.gd` | FIRST validated; frozen |
| this doc | final |

Not touched: `floating_text/producer.gd` (immutable consumer; only its public API is used), World/Player/shared docs/Git, fonts/assets. Shader/helper files created 0. Image/PNG assets created 0 (only the executor's QA screenshots). Font files 0. Original asset copy/hash/import 0. The executor provided 3 read-only font leaves.

## Source authority (canonical `exoduser-migration-20261001/game.html`)

| Line | Fact |
|---|---|
| L44459 | `_NUM_W=48, _NUM_H=56` |
| L44461 | canvas `480×168` (`_NUM_W*10 × _NUM_H*3`) |
| L44464-44471 | styles: row 0 white `#ffffff/#cccccc/#888888`, outline `#000000`, glow `rgba(200,200,200,.5)`; row 1 crit `#dd2200/#aa0000/#440000`, outline `#000000`, glow `rgba(180,0,0,.7)`; row 2 shield `#a9f5ff/#55caff/#2365b8`, outline `#07182e`, glow `rgba(60,180,255,.7)` |
| L44472 | `900 44px "Pirata One","Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",serif` |
| L44473 | `textBaseline='top'`, `textAlign='center'` |
| L44479 | `_cx=d*48+24`, glyph y `row*56+6` |
| L44482-44485 | glow: `shadowColor=glow`, `shadowBlur=12`, `fillStyle=mid`, fill at y+6 |
| L44487-44491 | outline: integer `ox,oy ∈ [-3,3]`, `ox²+oy² ≤ 9` → 29 fills, source-over, ox outer loop |
| L44493-44496 | gradient `(cx,row*56+4) → (cx,row*56+48)`, stops `0 top / .4 mid / 1 bot`, fill at y+6 |
| L44498-44502 | highlight: rows ≠ 1, `globalAlpha .15`, `#ffffff`, fill at y+5 |
| L44506-44509 | built once, rebuilt after `document.fonts.ready` (or 2 s fallback) |
| L44510-44521 | `drawNumStr` consumer (already ported in `floating_text`) |
| L118-119 | the fonts are web fonts (Google Fonts `@import`, including `Pirata+One` and `Noto+Sans+KR` 900). There is no local font file in the source |

Source has **no per-cell clip**: glow, outline and glyph ink can spill into neighbour cells, keeping their own style. Only the canvas bounds clip. Draw order is row-major, digit 0..9, and each digit is finished (glow → outline → gradient → highlight) before the next one starts.

## Pipeline (`producer.gd`, `extends Node`) — corrected isolated path

1. **GPU isolated glyph masks.** A temporary transparent **900×294 workspace** `SubViewport` (`PORT_MASK_VIEW` = 10×3 slots of **90×98** = 48+2·21 × 56+2·21) holds an inner `GlyphMaskNode` that draws each of the 30 source glyphs **alone in its own slot**. The font is the existing read-only `res://assets/fonts/NotoSansKR.ttf` through a `FontVariation` with wght axis 900, 44 px, white. Slot anchor: x = `d*90 + 21 + 24`, top = `row*98 + 21 + 6`, baseline = top + ascent(44). That is the source anchor `(d*48+24, row*56+6)` moved into the slot. After two `frame_post_draw`, `get_image()` reads the coverage, and `isolated_masks_from_image` copies each slot independently, with no borrowing from neighbours. The viewport is then freed. **The workspace and padding are backend scratch space, not source atlas values or frames.**
2. **CPU compositor** (`compose_isolated_glyph_masks`). For each digit in source order, the slot is placed on an unclipped 132×140 grid (slot + 21 reach). The compositor builds `m`, `glow` (separable Gaussian) and `ring` (29-offset union `1-Π(1-m_shifted)`), limited to the ink bounding box plus reach (skipped terms are exact zeros). It paints onto the **source 480×168 canvas** at `(d*48, row*56)`, per pixel in premultiplied sRGB floats: glow shadow `glow.a·blur(m)` → mid `m` → outline `ring` → gradient `m` (the glyph's **own** row world-y gradient) → highlight `.15·m(x,y+1)` (rows 0 and 2). **Canvas bounds are the only clip.** Ink outside the nominal cell keeps its own style; a later glyph lies over it by source-over. Workspace truncation would be reported (`slot_edge_ink` > 0 plus a `warning`); the native value is 0.
3. **Texture.** The result is unpremultiplied to an RGBA8 `Image` and turned into an `ImageTexture` with `create_from_image`. The producer keeps both alive after the mask viewport is freed. Nothing is saved.

The classic `compose_atlas` (whole mask → 48×56 slices) is kept **unchanged** for the frozen synthetic groups. It is not the bake path. For glyphs inside their cells it gives a byte-identical result (asserted in `isolated_mask_border`); for overhanging glyphs it produces the relabelling defect (also asserted).

Headless: `bake_native()` returns `null` with status `unavailable_headless`, creates no viewport, and never calls `get_image`.

## Public API (handoff)

| Member | Contract |
|---|---|
| `bake_native() -> Texture2D` (coroutine, `await`) | The node must be in the tree on a non-headless display. Returns the 480×168 `ImageTexture`, or `null` with status `unavailable_headless` / `unavailable_not_in_tree` / `unavailable_font:*` / `busy` / `failed_mask_capture` / `failed_compose:*`. Calling it again rebakes explicitly. **No automatic driver and no native aging** |
| `get_texture()`, `has_texture()`, `clear()` | Baked texture / query / drop |
| `supply_to(consumer) -> bool` | Calls the existing frozen floating_text `set_number_atlas(texture)` |
| `get_atlas_image() -> Image` | CPU copy of the baked pixels (QA) |
| `get_build_report() -> Dictionary` | `status`, `mask_path`, `texture_size`, `mask_capture_us`, `compose_us`, `fields_computed/reused`, `mask{mask_path, slots, cell_ink, empty_cells, border_ink, outside_nominal_ink, slot_edge_ink, slot_edge_ink_total, ink_extent_rel_cell}`, `slot_edge_ink_total`, optional `warning`, `font_status`, `bold_mode`, `baseline_mode`, `blur_backend`, `cell_clip`, `saved_files=0` |
| `get_mask_trace() -> Array` | 30 entries `{row,digit,cx,top,baseline,advance,slot_cx,slot_top,slot_baseline}`. `cx/top/baseline` are atlas coordinates; `slot_*` are workspace coordinates |
| `get_isolated_masks() -> Array[PackedFloat32Array]` | The 30 isolated 90×98 slot masks (index `row*10+d`) |
| static `isolated_masks_from_image`, `isolated_mask_stats`, `compose_isolated_glyph_masks` | Isolated path. Wrong workspace size → empty array; wrong count/size → `{"error"}` |
| static `source_geometry`, `source_palette`, `glyph_anchor`, `outline_offsets`, `gaussian_kernel`, `gradient_at_t`, `gradient_color`, `expected_body_color`, `mask_from_image`, `mask_stats`, `compose_atlas` | Source helpers and the classic compositor (unchanged) |
| `load_source_font()`, `font_fallback_report()` | Read-only Noto wght-900 load and fallback facts |
| constants | Source `SRC_*` (48, 56, 10, 3, 480×168, 44, 900, y+6, y+5, .15, row 1 skipped, grad 4/48, stops 0/.4/1, blur 12, r² 9). Backend `PORT_BLUR_SIGMA 6.0`, `PORT_BLUR_RADIUS 18`, `PORT_CELL_MARGIN 21`, `PORT_SLOT_W 90`, `PORT_SLOT_H 98`, `PORT_MASK_VIEW 900×294` |

**Central binding contract (ENGINE):** at an explicit start-up point after the font is ready, instantiate one baker and attach it under a long-lived node. `await bake_native()` on a native display, then call `supply_to(floating_text)` **once** (or `set_number_atlas`). Keep the baker node or the texture referenced. The baker owns no clock and no native-aging driver, and must not be called per frame. Under headless the numeric branch stays the consumer's explicit `skipped_num_atlas_gap`.

## Port differences / remaining gaps (RETOUCH, not hidden)

| Item | Detail |
|---|---|
| Font | `"Pirata One"` (source first choice, a web font) is absent from Godot assets. The source's second stack entry `"Noto Sans KR"` is used (existing read-only TTF, wght axis 900). Glyph shapes and ink extent differ from a browser with Pirata One. Nothing fetched, installed, copied or imported |
| Baseline | The [WHATWG HTML Standard](https://html.spec.whatwg.org/multipage/canvas.html) defines `textBaseline='top'` as the top of the em box (verified by the executor). The port uses baseline = top + Godot `get_ascent(44)`. The measured fallback ink extent is rel y **24..58**, which exceeds the 56-px cell. So the 56-high crit crop can show white tails from row 0. That is correct source owner style for these metrics, but **baseline/crop fidelity needs comparison with the original canvas font** |
| Blur | The [WHATWG HTML Standard, shadows](https://html.spec.whatwg.org/multipage/canvas.html#shadows) defines σ = `shadowBlur`/2, so **σ6 is verified against the spec**. The radius-18 truncation, the CPU kernel and differences from browser blur implementations remain port approximations |
| Rasterisation | Godot glyph AA/subpixel ≠ browser canvas. One mask per glyph is shifted for the outline/highlight passes; the browser rasterises each `fillText` separately |
| Mask isolation | **Repaired and native-verified** (isolated slots, outer-edge ink 0, 192 overhang pixels keep their owner style). The first defect capture remains frozen as the record |
| Identity / performance | No source-canvas byte identity. No FPS, 24 fps, GPU-240 or minimum-240 claim. Bake timings are a start-up wall sample only |
| Live world | Not bound (world binding 0, new global driver 0, double TXT emit 0). Human input 0, shipping 0, source enemy-count promotion 0 |

## Tests (`test_first.gd`) — FIRST complete, 9 groups / 105 valid checks

Args: `--only=g1,g2` (unknown/empty → exit 2), `--json-out=/abs/out.json`, `--render-proof=/abs/out.png` and `--render-isolation-proof=/abs/out.png` (native only, exit 3 under headless, auto-exit). JSON separates `failed_groups` from `errored_groups` (`completed=false`) and gives each group an `evidence_class`. Suite metadata is a literal path. Fixed RefCounted locale/view providers are strongly held (`_fixture_owners` and consumer metadata `fixture_owners`).

| Group | Checks | Evidence class | Content |
|---|---|---|---|
| geometry | 11 | semantic | 48×56×10×3, 480×168, font css literal, top/center, y+6/y+5, grad 4/48, blur 12, r² 9, σ6/r18, 30 anchors, consumer gap 18 |
| palette | 8 | semantic | 3 rows exact hex, glow rgba, consumer colour-row map |
| gradient | 22 | semantic + synthetic mask | stops, y anchors, clamping, row-1 body = pure gradient |
| outline | 10 | synthetic mask | 29 offsets in source order, circle vs square, 3 px yes / 4 px no, diagonal, row-2 outline colour |
| highlight | 12 | synthetic mask | edge highlight rows 0/2 only, body, isolated last row = pure gradient, the later row's glow spill (exact value), crit has no highlight |
| fallback | 7 | font metadata | Noto read-only, wght 900, fallback report, metrics, backend declared |
| compositor | 11 | synthetic mask (NOT glyph pixels) | 480×168 RGBA8, field reuse, 30 body colours, kernel, glow value, neighbour spill, radius cutoff, per-digit interleave, rejection, consumer accepts |
| headless_guard | 5 | headless | null texture, `unavailable_headless`, no viewport/pixels, nothing supplied |
| isolated_mask_border | 19 | synthetic isolated slot masks (NOT glyph pixels) | overhang down/up keeps owner style, canvas-only clip for negatives, classic slicer relabels (defect pinned), adjacent rows with exact later-glow value, extraction without borrowing, stats, outer-edge ink reported, in-cell byte equivalence to classic, rejection |

Native modes: `--render-proof` (first, classic path, frozen defect record) and `--render-isolation-proof` (corrected path, 8/8). Neither should be re-run.

## Related docs — central sync required (not edited here; not owned)

Keyword search `drawNumStr|_NUM_W|_numAtlas|number atlas|numberAtlas|숫자 아틀라스|데미지 숫자`. Excluded: `docs/13출시·마케팅/INGAME_CAPTURE_STUDIO_20261009.md` and immutable2_3.

| Path | Mismatch for ENGINE to sync |
|---|---|
| `docs/engine/FDG_GODOT_PORT_FLOATING_TEXT_FIRST_20261013.md` | It says the number-atlas resource is "missing" and suggests a future baker at `floating_text/num_atlas.gd`. **Now:** the real runtime atlas supplier exists at `number_atlas/producer.gd` (corrected path validated; Noto fallback, RETOUCH). Live binding is still pending |
| `docs/engine/FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md` L101 | "원 number atlas gap 유지" is still true for the live binding until ENGINE wires `bake_native()` → `supply_to`. The supplier itself is no longer missing |
| `docs/12퍼포먼스·최적화/MAC_TEXT_ATLAS_FPS_20260910.md` L14 | "아틀라스 2048×512px" is a different (text) atlas, not `_numAtlas` 480×168. No conflict |
| `docs/13출시·마케팅/SKILL_TRAILER_V24/V25_DAMAGE_TEXT_20260910.md`, `GAMEPLAY_TRAILER_V2_20260909.md` | Marketing, paths only; contents not read |
| `docs/12퍼포먼스·최적화/COMBAT_PRESENTATION_20260909.md` | No atlas keyword. L26 (numeric values, styles and 40-slot ring unchanged) is respected |

Shared-doc statements about the source font fallback (the Pirata One web font versus the local Noto fallback) also need central sync.

## Remaining central (ENGINE) work

1. Bind as in the contract above: explicit start-up, after the font is ready, one baker, `await bake_native()`, `supply_to` once, keep it referenced.
2. Headless/server: the numeric branch stays the explicit gap.
3. Not done, not claimed: source-canvas comparison (baseline/crop/Pirata), a Pirata One decision (font licensing/import needs separate approval), live world, public play, minimum-240.

Unchanged: floating_text producer/tests/proofs, World/Player/native60/QE/blackBean/poise/owner bullets/map, fonts/assets, shared docs, Git.
