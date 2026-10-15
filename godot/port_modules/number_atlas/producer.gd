extends Node
## Runtime damage-number atlas supplier: port of the original `_buildNumAtlas` (canonical game.html).
##
## Source authority:
##   L44459  var _NUM_W=48,_NUM_H=56;
##   L44461  _numAtlas.width=_NUM_W*10; _numAtlas.height=_NUM_H*3;   (480x168)
##   L44464-44471 three styles (0 white / 1 crimson crit / 2 energy-shield)
##   L44472  font '900 44px "Pirata One","Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",serif'
##   L44473  textBaseline='top'; textAlign='center'
##   L44479  _cx=_d*_NUM_W+_NUM_W/2; glyph y=_oy+6 (_oy=_sr*_NUM_H)
##   L44482-44485 glow: shadowColor=glow, shadowBlur=12, fillStyle=mid, fillText at y+6
##   L44487-44491 outline: integer offsets ox,oy in [-3,3] with ox²+oy²<=9 (29 fills, source-over)
##   L44493-44496 gradient (cx,_oy+4)->(cx,_oy+_NUM_H-8) stops 0 top / .4 mid / 1 bot, fillText at y+6
##   L44498-44502 highlight: rows other than 1, globalAlpha .15, '#ffffff', fillText at y+5
##   No per-cell clip in the source: glow/outline may spill into neighbour cells; only the canvas bounds clip.
##   Draw order: row-major, digit 0..9, each digit fully finished (glow, outline, gradient, highlight)
##   before the next one.
##
## Port pipeline (actual runtime pixels, nothing saved):
##   1. GPU: one transparent 480x168 SubViewport draws the 30 original glyphs (white) with the read-only
##      NotoSansKR.ttf (wght 900, 44 px). get_image() of that viewport = glyph coverage mask.
##   2. CPU: compose_atlas() rebuilds the source passes from the mask per digit, in source order,
##      source-over in sRGB with premultiplied floats.
##   3. ImageTexture.create_from_image() -> the Texture2D handed to floating_text.set_number_atlas().
## Headless never bakes pixels (explicit "unavailable_headless").
##
## Known port differences (RETOUCH, not hidden):
##   - "Pirata One" is not in Godot assets; the source's 2nd stack entry "Noto Sans KR" is used.
##   - textBaseline 'top' approximated as baseline = top + font ascent (44 px).
##   - shadowBlur 12 -> Gaussian sigma = 12/2 = 6 (HTML spec definition), truncated at radius 18,
##     weight-normalised. Browser (Skia) blur implementations approximate differently.
##   - Glyph rasterisation / AA / subpixel positioning differ from the browser canvas.
##   - Every pass is derived from one glyph mask per cell (shifted for outline/highlight), so the
##     glyph shapes are identical by construction; the browser rasterises each fillText separately.

const FONT_PATH := "res://assets/fonts/NotoSansKR.ttf"   # existing, loaded read-only

# ── source constants ─────────────────────────────────────────────────────────
const SRC_NUM_W := 48
const SRC_NUM_H := 56
const SRC_COLS := 10
const SRC_ROWS := 3
const SRC_ATLAS_SIZE := Vector2i(480, 168)
const SRC_FONT_CSS := "900 44px \"Pirata One\",\"Noto Sans KR\",\"Apple SD Gothic Neo\",\"Malgun Gothic\",serif"
const SRC_FONT_STACK := ["Pirata One", "Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "serif"]
const SRC_FONT_PX := 44
const SRC_FONT_WEIGHT := 900
const SRC_GLYPH_TOP := 6              # fillText(_ch,_cx,_oy+6)
const SRC_HIGHLIGHT_TOP := 5          # fillText(_ch,_cx,_oy+5)
const SRC_HIGHLIGHT_ALPHA := 0.15
const SRC_HIGHLIGHT_SKIP_ROW := 1     # if(_sr!==1)
const SRC_GRAD_Y0 := 4                # _oy+4
const SRC_GRAD_Y1 := SRC_NUM_H - 8    # _oy+_NUM_H-8 = _oy+48
const SRC_GRAD_STOPS := [0.0, 0.4, 1.0]
const SRC_SHADOW_BLUR := 12
const SRC_OUTLINE_R := 3
const SRC_OUTLINE_R2 := 9
const SRC_STYLES := [
	{"top": "#ffffff", "mid": "#cccccc", "bot": "#888888", "outline": "#000000", "glow": [200, 200, 200, 0.5]},
	{"top": "#dd2200", "mid": "#aa0000", "bot": "#440000", "outline": "#000000", "glow": [180, 0, 0, 0.7]},
	{"top": "#a9f5ff", "mid": "#55caff", "bot": "#2365b8", "outline": "#07182e", "glow": [60, 180, 255, 0.7]},
]

# ── port backend constants (assumptions, not source facts) ───────────────────
const PORT_BLUR_SIGMA := 6.0          # shadowBlur/2 per the HTML canvas spec
const PORT_BLUR_RADIUS := 18          # 3 sigma truncation (port choice)
const PORT_CELL_MARGIN := PORT_BLUR_RADIUS + SRC_OUTLINE_R   # 21: furthest reach of a cell's passes
# Isolated glyph-mask workspace (GPU backend only; not source atlas values). Each glyph is rasterised alone
# in a padded 90x98 slot (nominal 48x56 cell at (21,21)) so ink outside the nominal cell keeps its own
# glyph and style instead of being relabelled as a neighbour's.
const PORT_SLOT_W := SRC_NUM_W + 2 * PORT_CELL_MARGIN       # 90
const PORT_SLOT_H := SRC_NUM_H + 2 * PORT_CELL_MARGIN       # 98
const PORT_MASK_VIEW := Vector2i(PORT_SLOT_W * SRC_COLS, PORT_SLOT_H * SRC_ROWS)   # 900x294

var font_status := "unloaded"
var bold_mode := "none"
var _font: Font = null
var _texture: Texture2D = null
var _atlas_image: Image = null
var _mask_trace: Array[Dictionary] = []
var _iso_masks: Array[PackedFloat32Array] = []
var _baking := false
var _report: Dictionary = {}


func _init() -> void:
	_report = _base_report()


# ── public supply API ────────────────────────────────────────────────────────
## Bakes the atlas on the GPU+CPU and returns the runtime 480x168 Texture2D (coroutine: `await`).
## Returns null with an explicit status when baking is impossible (headless, not in tree, no font, busy).
## The texture is kept alive by this node after the mask viewport is freed.
func bake_native() -> Texture2D:
	if _baking:
		_report["status"] = "busy"
		return null
	_report = _base_report()
	if DisplayServer.get_name() == "headless":
		_report["status"] = "unavailable_headless"
		return null
	if not is_inside_tree():
		_report["status"] = "unavailable_not_in_tree"
		return null
	var font := load_source_font()
	if font == null:
		_report["status"] = "unavailable_font:" + font_status
		return null
	_baking = true
	var t0 := Time.get_ticks_usec()
	var vp := SubViewport.new()
	vp.size = PORT_MASK_VIEW
	vp.transparent_bg = true
	vp.disable_3d = true
	vp.render_target_clear_mode = SubViewport.CLEAR_MODE_ALWAYS
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	var gm := GlyphMaskNode.new()
	gm.font = font
	gm.font_px = SRC_FONT_PX
	gm.num_w = SRC_NUM_W
	gm.num_h = SRC_NUM_H
	gm.glyph_top = SRC_GLYPH_TOP
	gm.cols = SRC_COLS
	gm.rows = SRC_ROWS
	gm.pitch_x = PORT_SLOT_W
	gm.pitch_y = PORT_SLOT_H
	gm.pad = PORT_CELL_MARGIN
	vp.add_child(gm)
	add_child(vp)
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	var mask_img: Image = vp.get_texture().get_image()
	_mask_trace.assign(gm.trace)
	remove_child(vp)
	vp.queue_free()
	var t_mask := Time.get_ticks_usec()
	if mask_img == null or Vector2i(mask_img.get_width(), mask_img.get_height()) != PORT_MASK_VIEW:
		_baking = false
		_report["status"] = "failed_mask_capture"
		return null
	_iso_masks = isolated_masks_from_image(mask_img)
	var mstats := isolated_mask_stats(_iso_masks)
	var comp := compose_isolated_glyph_masks(_iso_masks)
	if comp.has("error"):
		_baking = false
		_report["status"] = "failed_compose:" + str(comp["error"])
		return null
	_atlas_image = comp["image"]
	_texture = ImageTexture.create_from_image(_atlas_image)
	_baking = false
	_report["status"] = "baked"
	_report["texture_size"] = Vector2i(_texture.get_width(), _texture.get_height())
	_report["mask_capture_us"] = t_mask - t0
	_report["compose_us"] = Time.get_ticks_usec() - t_mask
	_report["fields_computed"] = comp["fields_computed"]
	_report["fields_reused"] = comp["fields_reused"]
	_report["mask"] = mstats
	_report["slot_edge_ink_total"] = comp["slot_edge_ink_total"]
	if float(comp["slot_edge_ink_total"]) > 0.0:
		_report["warning"] = "slot_edge_ink_nonzero: glyph may exceed the 90x98 workspace slot (mask truncated)"
	_report["glyph_trace_count"] = _mask_trace.size()
	_report["font_status"] = font_status
	_report["bold_mode"] = bold_mode
	return _texture


func get_texture() -> Texture2D:
	return _texture


## CPU copy of the baked atlas pixels (for isolated QA probes). Null before a successful bake.
func get_atlas_image() -> Image:
	if _atlas_image == null:
		return null
	return _atlas_image.duplicate() as Image


func get_build_report() -> Dictionary:
	return _report.duplicate(true)


func get_mask_trace() -> Array:
	return _mask_trace.duplicate(true)


## The 30 isolated 90x98 slot masks of the last bake (index row*10+d). Empty before a bake.
func get_isolated_masks() -> Array[PackedFloat32Array]:
	var out: Array[PackedFloat32Array] = []
	for m in _iso_masks:
		out.append(m.duplicate())
	return out


func has_texture() -> bool:
	return _texture != null


## Drops the baked texture (an explicit later bake_native() rebuilds it).
func clear() -> void:
	_texture = null
	_atlas_image = null
	_mask_trace = []
	_iso_masks = []
	_report = _base_report()


## Hands the baked texture to a consumer's read-only `set_number_atlas(Texture2D) -> bool`.
func supply_to(consumer: Object) -> bool:
	if _texture == null or consumer == null or not consumer.has_method("set_number_atlas"):
		return false
	return bool(consumer.call("set_number_atlas", _texture))


# ── source geometry / palette helpers ────────────────────────────────────────
static func source_geometry() -> Dictionary:
	return {"num_w": SRC_NUM_W, "num_h": SRC_NUM_H, "cols": SRC_COLS, "rows": SRC_ROWS,
		"atlas": SRC_ATLAS_SIZE, "font_css": SRC_FONT_CSS, "font_px": SRC_FONT_PX,
		"font_weight": SRC_FONT_WEIGHT, "text_baseline": "top", "text_align": "center",
		"glyph_top": SRC_GLYPH_TOP, "highlight_top": SRC_HIGHLIGHT_TOP, "highlight_alpha": SRC_HIGHLIGHT_ALPHA,
		"highlight_skip_row": SRC_HIGHLIGHT_SKIP_ROW, "grad_y0": SRC_GRAD_Y0, "grad_y1": SRC_GRAD_Y1,
		"grad_stops": SRC_GRAD_STOPS.duplicate(), "shadow_blur": SRC_SHADOW_BLUR, "outline_r2": SRC_OUTLINE_R2,
		"port_blur_sigma": PORT_BLUR_SIGMA, "port_blur_radius": PORT_BLUR_RADIUS}


## Source fillText anchor (textAlign center, textBaseline top): (d*48+24, row*56+6).
static func glyph_anchor(row: int, d: int) -> Vector2:
	return Vector2(float(d * SRC_NUM_W) + SRC_NUM_W / 2.0, float(row * SRC_NUM_H + SRC_GLYPH_TOP))


static func source_palette() -> Array[Dictionary]:
	var out: Array[Dictionary] = []
	for s in SRC_STYLES:
		var sd: Dictionary = s
		var g: Array = sd["glow"]
		out.append({"top": Color(str(sd["top"])), "mid": Color(str(sd["mid"])), "bot": Color(str(sd["bot"])),
			"outline": Color(str(sd["outline"])),
			"glow": Color(float(g[0]) / 255.0, float(g[1]) / 255.0, float(g[2]) / 255.0, float(g[3]))})
	return out


## Source outline loop order: ox outer -3..3, oy inner -3..3, skip ox²+oy²>9. 29 offsets.
static func outline_offsets() -> Array[Vector2i]:
	var out: Array[Vector2i] = []
	for ox in range(-SRC_OUTLINE_R, SRC_OUTLINE_R + 1):
		for oy in range(-SRC_OUTLINE_R, SRC_OUTLINE_R + 1):
			if ox * ox + oy * oy > SRC_OUTLINE_R2:
				continue
			out.append(Vector2i(ox, oy))
	return out


## Port backend: normalised Gaussian, sigma 6, taps -18..18.
static func gaussian_kernel() -> PackedFloat32Array:
	var k := PackedFloat32Array()
	k.resize(PORT_BLUR_RADIUS * 2 + 1)
	var sum := 0.0
	for i in range(-PORT_BLUR_RADIUS, PORT_BLUR_RADIUS + 1):
		var w := exp(-float(i * i) / (2.0 * PORT_BLUR_SIGMA * PORT_BLUR_SIGMA))
		k[i + PORT_BLUR_RADIUS] = w
		sum += w
	for i in range(k.size()):
		k[i] = k[i] / sum
	return k


## Linear gradient colour at stop parameter t (clamped), stops 0 top / .4 mid / 1 bot, sRGB lerp.
static func gradient_at_t(style: Dictionary, t: float) -> Color:
	var tt := clampf(t, 0.0, 1.0)
	var s1: float = SRC_GRAD_STOPS[1]
	if tt <= s1:
		return (style["top"] as Color).lerp(style["mid"] as Color, tt / s1)
	return (style["mid"] as Color).lerp(style["bot"] as Color, (tt - s1) / (1.0 - s1))


## Gradient colour at canvas y (sample at pixel centre: py = y + 0.5) for a colour row.
static func gradient_color(row: int, py: float) -> Color:
	var y0 := float(row * SRC_NUM_H + SRC_GRAD_Y0)
	var y1 := float(row * SRC_NUM_H + SRC_GRAD_Y1)
	return gradient_at_t(source_palette()[row], (py - y0) / (y1 - y0))


## Colour of a fully covered glyph-body pixel whose upper neighbour is also covered:
## gradient, then (rows other than 1) white at alpha .15.
static func expected_body_color(row: int, y: int) -> Color:
	var c := gradient_color(row, float(y) + 0.5)
	if row != SRC_HIGHLIGHT_SKIP_ROW:
		c = c.lerp(Color(1, 1, 1), SRC_HIGHLIGHT_ALPHA)
	c.a = 1.0
	return c


# ── font (read-only existing asset) ──────────────────────────────────────────
func load_source_font() -> Font:
	if _font != null:
		return _font
	if not ResourceLoader.exists(FONT_PATH):
		font_status = "missing:" + FONT_PATH
		return null
	var base: Resource = load(FONT_PATH)
	if not (base is Font):
		font_status = "invalid:" + FONT_PATH
		return null
	var fv := FontVariation.new()
	fv.base_font = base as Font
	var wght := TextServerManager.get_primary_interface().name_to_tag("wght")
	var sup: Dictionary = (base as Font).get_supported_variation_list()
	if sup.has(wght):
		fv.variation_opentype = {wght: SRC_FONT_WEIGHT}
		bold_mode = "wght_axis_900"
	else:
		fv.variation_embolden = 0.9
		bold_mode = "synthetic_embolden_0.9_no_wght_axis"
	_font = fv
	font_status = "loaded:" + FONT_PATH
	return _font


func font_fallback_report() -> Dictionary:
	return {"source_stack": SRC_FONT_STACK.duplicate(), "source_first_choice": "Pirata One",
		"pirata_one": "absent_from_godot_assets", "chosen": "Noto Sans KR", "chosen_stack_index": 1,
		"path": FONT_PATH, "font_status": font_status, "bold_mode": bold_mode,
		"baseline_mode": "top_as_ascent", "font_px": SRC_FONT_PX}


# ── mask / compositor (pure CPU, static) ─────────────────────────────────────
## Glyph coverage = alpha of the transparent mask render.
static func mask_from_image(img: Image) -> PackedFloat32Array:
	var im := img.duplicate() as Image
	if im.get_format() != Image.FORMAT_RGBA8:
		im.convert(Image.FORMAT_RGBA8)
	var data := im.get_data()
	var n := im.get_width() * im.get_height()
	var m := PackedFloat32Array()
	m.resize(n)
	for i in range(n):
		m[i] = float(data[i * 4 + 3]) / 255.0
	return m


## Per-cell ink sums and ink on the cell border (non-zero border ink = glyph may exceed the cell).
static func mask_stats(mask: PackedFloat32Array) -> Dictionary:
	var aw := SRC_ATLAS_SIZE.x
	var ink: Array[float] = []
	var border := 0.0
	var empty_cells := 0
	for row in range(SRC_ROWS):
		for d in range(SRC_COLS):
			var s := 0.0
			for iy in range(SRC_NUM_H):
				for ix in range(SRC_NUM_W):
					var v: float = mask[(row * SRC_NUM_H + iy) * aw + d * SRC_NUM_W + ix]
					s += v
					if ix == 0 or ix == SRC_NUM_W - 1 or iy == 0 or iy == SRC_NUM_H - 1:
						border += v
			ink.append(s)
			if s <= 0.0:
				empty_cells += 1
	return {"cell_ink": ink, "empty_cells": empty_cells, "border_ink": border}


## Rebuilds the source passes from a 480x168 coverage mask. Returns {"image": Image RGBA8 480x168,
## "fields_computed", "fields_reused"} or {"error"}. Digit order and per-digit pass order follow the source.
static func compose_atlas(mask: PackedFloat32Array) -> Dictionary:
	var aw := SRC_ATLAS_SIZE.x
	var ah := SRC_ATLAS_SIZE.y
	if mask.size() != aw * ah:
		return {"error": "mask_size_%d" % mask.size()}
	var pal := source_palette()
	var offs := outline_offsets()
	var kern := gaussian_kernel()
	var canvas := PackedFloat32Array()
	canvas.resize(aw * ah * 4)
	canvas.fill(0.0)
	var cache: Dictionary = {}
	var reused := 0
	for row in range(SRC_ROWS):
		for d in range(SRC_COLS):
			var cx0 := d * SRC_NUM_W
			var cy0 := row * SRC_NUM_H
			var cell := _cell_slice(mask, cx0, cy0)
			var fields: Dictionary
			if cache.has(d) and (cache[d]["cell"] as PackedFloat32Array) == cell:
				fields = cache[d]
				reused += 1
			else:
				fields = _cell_fields(cell, offs, kern)
				cache[d] = fields
			canvas = _paint_cell(canvas, fields, row, cx0, cy0, pal[row])
	return {"image": _to_image(canvas), "fields_computed": SRC_ROWS * SRC_COLS - reused, "fields_reused": reused}


static func _cell_slice(mask: PackedFloat32Array, cx0: int, cy0: int) -> PackedFloat32Array:
	var aw := SRC_ATLAS_SIZE.x
	var out := PackedFloat32Array()
	out.resize(SRC_NUM_W * SRC_NUM_H)
	for iy in range(SRC_NUM_H):
		for ix in range(SRC_NUM_W):
			out[iy * SRC_NUM_W + ix] = mask[(cy0 + iy) * aw + cx0 + ix]
	return out


## Fields on an unclipped (48+2*21)x(56+2*21) grid around the cell: m (glyph coverage at y+6),
## glow (blurred m), ring (29-offset source-over union coverage 1-Π(1-m_shifted)).
static func _cell_fields(cell: PackedFloat32Array, offs: Array[Vector2i], kern: PackedFloat32Array) -> Dictionary:
	var mg := PORT_CELL_MARGIN
	var gw := SRC_NUM_W + 2 * mg
	var gh := SRC_NUM_H + 2 * mg
	var r := PORT_BLUR_RADIUS
	var m := PackedFloat32Array()
	m.resize(gw * gh)
	m.fill(0.0)
	for iy in range(SRC_NUM_H):
		for ix in range(SRC_NUM_W):
			m[(iy + mg) * gw + ix + mg] = cell[iy * SRC_NUM_W + ix]
	# separable Gaussian; the grid margin (21) exceeds the radius (18), so no truncation at grid edges
	var tmp := PackedFloat32Array()
	tmp.resize(gw * gh)
	tmp.fill(0.0)
	for ly in range(mg, mg + SRC_NUM_H):
		for lx in range(gw):
			var s := 0.0
			for k in range(-r, r + 1):
				var sx := lx + k
				if sx >= 0 and sx < gw:
					s += m[ly * gw + sx] * kern[k + r]
			tmp[ly * gw + lx] = s
	var glow := PackedFloat32Array()
	glow.resize(gw * gh)
	for ly in range(gh):
		for lx in range(gw):
			var s2 := 0.0
			for k in range(-r, r + 1):
				var sy := ly + k
				if sy >= 0 and sy < gh:
					s2 += tmp[sy * gw + lx] * kern[k + r]
			glow[ly * gw + lx] = s2
	var ring := PackedFloat32Array()
	ring.resize(gw * gh)
	ring.fill(0.0)
	var ro := SRC_OUTLINE_R
	for ly in range(mg - ro, mg + SRC_NUM_H + ro):
		for lx in range(mg - ro, mg + SRC_NUM_W + ro):
			var keep := 1.0
			for o in offs:
				var sx2 := lx - o.x
				var sy2 := ly - o.y
				if sx2 >= 0 and sx2 < gw and sy2 >= 0 and sy2 < gh:
					keep *= 1.0 - m[sy2 * gw + sx2]
			ring[ly * gw + lx] = 1.0 - keep
	return {"cell": cell, "m": m, "glow": glow, "ring": ring}


## One digit, source pass order: (glow shadow + mid fill), outline, gradient fill, highlight (row != 1).
## Pixels outside the canvas are dropped (canvas bounds clip); there is no cell clip.
## Returns the canvas (no reliance on packed-array argument aliasing).
static func _paint_cell(canvas: PackedFloat32Array, f: Dictionary, row: int, cx0: int, cy0: int,
		st: Dictionary) -> PackedFloat32Array:
	var aw := SRC_ATLAS_SIZE.x
	var ah := SRC_ATLAS_SIZE.y
	var mg := PORT_CELL_MARGIN
	var gw := SRC_NUM_W + 2 * mg
	var gh := SRC_NUM_H + 2 * mg
	var m: PackedFloat32Array = f["m"]
	var gl: PackedFloat32Array = f["glow"]
	var ring: PackedFloat32Array = f["ring"]
	var glow_c: Color = st["glow"]
	var mid_c: Color = st["mid"]
	var out_c: Color = st["outline"]
	var white := Color(1, 1, 1)
	var hl := row != SRC_HIGHLIGHT_SKIP_ROW
	for ly in range(gh):
		var py := cy0 - mg + ly
		if py < 0 or py >= ah:
			continue
		var grad_c := gradient_color(row, float(py) + 0.5)
		for lx in range(gw):
			var px := cx0 - mg + lx
			if px < 0 or px >= aw:
				continue
			var i := ly * gw + lx
			var gv: float = gl[i]
			var mv: float = m[i]
			var rv: float = ring[i]
			var hv: float = m[i + gw] if (hl and ly + 1 < gh) else 0.0   # highlight 1 px higher (y+5 vs y+6)
			if gv <= 0.0 and mv <= 0.0 and rv <= 0.0 and hv <= 0.0:
				continue
			var k := (py * aw + px) * 4
			var acc := Color(canvas[k], canvas[k + 1], canvas[k + 2], canvas[k + 3])
			acc = _over(acc, glow_c, glow_c.a * gv)                 # shadow of the mid fill
			acc = _over(acc, mid_c, mv)                             # mid fill
			acc = _over(acc, out_c, rv)                             # 29 outline fills
			acc = _over(acc, grad_c, mv)                            # gradient fill
			acc = _over(acc, white, SRC_HIGHLIGHT_ALPHA * hv)       # highlight (0 on row 1)
			canvas[k] = acc.r
			canvas[k + 1] = acc.g
			canvas[k + 2] = acc.b
			canvas[k + 3] = acc.a
	return canvas


## Source-over of colour c at coverage a onto a premultiplied accumulator.
static func _over(acc: Color, c: Color, a: float) -> Color:
	if a <= 0.0:
		return acc
	var ia := 1.0 - a
	return Color(c.r * a + acc.r * ia, c.g * a + acc.g * ia, c.b * a + acc.b * ia, a + acc.a * ia)


static func _to_image(canvas: PackedFloat32Array) -> Image:
	var aw := SRC_ATLAS_SIZE.x
	var ah := SRC_ATLAS_SIZE.y
	var bytes := PackedByteArray()
	bytes.resize(aw * ah * 4)
	for p in range(aw * ah):
		var k := p * 4
		var a: float = canvas[k + 3]
		if a <= 0.0:
			bytes[k] = 0
			bytes[k + 1] = 0
			bytes[k + 2] = 0
			bytes[k + 3] = 0
			continue
		bytes[k] = int(round(clampf(canvas[k] / a, 0.0, 1.0) * 255.0))
		bytes[k + 1] = int(round(clampf(canvas[k + 1] / a, 0.0, 1.0) * 255.0))
		bytes[k + 2] = int(round(clampf(canvas[k + 2] / a, 0.0, 1.0) * 255.0))
		bytes[k + 3] = int(round(clampf(a, 0.0, 1.0) * 255.0))
	return Image.create_from_data(aw, ah, false, Image.FORMAT_RGBA8, bytes)


# ── isolated glyph masks (production bake path) ──────────────────────────────
## Splits the 900x294 workspace render into 30 independent 90x98 slot masks (index row*10+d).
## Slot (row,d) starts at (d*90, row*98); its nominal 48x56 cell sits at slot (21,21). No slot reads another.
static func isolated_masks_from_image(img: Image) -> Array[PackedFloat32Array]:
	var out: Array[PackedFloat32Array] = []
	if img == null or Vector2i(img.get_width(), img.get_height()) != PORT_MASK_VIEW:
		return out
	var im := img.duplicate() as Image
	if im.get_format() != Image.FORMAT_RGBA8:
		im.convert(Image.FORMAT_RGBA8)
	var data := im.get_data()
	var vw := PORT_MASK_VIEW.x
	for row in range(SRC_ROWS):
		for d in range(SRC_COLS):
			var m := PackedFloat32Array()
			m.resize(PORT_SLOT_W * PORT_SLOT_H)
			var sx0 := d * PORT_SLOT_W
			var sy0 := row * PORT_SLOT_H
			for sy in range(PORT_SLOT_H):
				for sx in range(PORT_SLOT_W):
					m[sy * PORT_SLOT_W + sx] = float(data[((sy0 + sy) * vw + sx0 + sx) * 4 + 3]) / 255.0
			out.append(m)
	return out


## Per-slot facts: ink, ink on the nominal cell border, ink outside the nominal cell (overflow that the
## old whole-mask slicing relabelled), ink on the slot's outer 1 px ring (workspace truncation), ink extent
## relative to the nominal cell origin.
static func isolated_mask_stats(masks: Array[PackedFloat32Array]) -> Dictionary:
	var pad := PORT_CELL_MARGIN
	var cell_ink: Array[float] = []
	var edge: Array[float] = []
	var empty := 0
	var border := 0.0
	var outside := 0.0
	var edge_total := 0.0
	var ext := {"min_x": 9999, "min_y": 9999, "max_x": -9999, "max_y": -9999}
	for m in masks:
		var s := 0.0
		var e := 0.0
		for sy in range(PORT_SLOT_H):
			for sx in range(PORT_SLOT_W):
				var v: float = m[sy * PORT_SLOT_W + sx]
				if v <= 0.0:
					continue
				s += v
				var cx := sx - pad
				var cy := sy - pad
				var in_cell := cx >= 0 and cx < SRC_NUM_W and cy >= 0 and cy < SRC_NUM_H
				if not in_cell:
					outside += v
				elif cx == 0 or cx == SRC_NUM_W - 1 or cy == 0 or cy == SRC_NUM_H - 1:
					border += v
				if sx == 0 or sx == PORT_SLOT_W - 1 or sy == 0 or sy == PORT_SLOT_H - 1:
					e += v
				ext["min_x"] = mini(int(ext["min_x"]), cx)
				ext["min_y"] = mini(int(ext["min_y"]), cy)
				ext["max_x"] = maxi(int(ext["max_x"]), cx)
				ext["max_y"] = maxi(int(ext["max_y"]), cy)
		cell_ink.append(s)
		edge.append(e)
		edge_total += e
		if s <= 0.0:
			empty += 1
	return {"mask_path": "isolated_slots", "slots": masks.size(), "cell_ink": cell_ink, "empty_cells": empty,
		"border_ink": border, "outside_nominal_ink": outside, "slot_edge_ink": edge,
		"slot_edge_ink_total": edge_total, "ink_extent_rel_cell": ext}


## Composes the final 480x168 atlas from 30 isolated slot masks. Each glyph keeps its own row style for
## every pixel it covers, including ink outside its nominal cell. Row-major, per-digit source passes,
## source-over, canvas bounds are the only clip. Returns {"image","fields_computed","fields_reused",
## "slot_edge_ink","slot_edge_ink_total"} or {"error"}.
static func compose_isolated_glyph_masks(masks: Array) -> Dictionary:
	var aw := SRC_ATLAS_SIZE.x
	var ah := SRC_ATLAS_SIZE.y
	if masks.size() != SRC_ROWS * SRC_COLS:
		return {"error": "mask_count_%d" % masks.size()}
	for mv in masks:
		if not (mv is PackedFloat32Array) or (mv as PackedFloat32Array).size() != PORT_SLOT_W * PORT_SLOT_H:
			return {"error": "slot_mask_size"}
	var pal := source_palette()
	var offs := outline_offsets()
	var kern := gaussian_kernel()
	var mg := PORT_CELL_MARGIN
	var gw := PORT_SLOT_W + 2 * mg
	var gh := PORT_SLOT_H + 2 * mg
	var canvas := PackedFloat32Array()
	canvas.resize(aw * ah * 4)
	canvas.fill(0.0)
	var cache: Dictionary = {}
	var reused := 0
	var edge: Array[float] = []
	var edge_total := 0.0
	for row in range(SRC_ROWS):
		for d in range(SRC_COLS):
			var slot: PackedFloat32Array = masks[row * SRC_COLS + d]
			var e := 0.0
			for sy in range(PORT_SLOT_H):
				for sx in range(PORT_SLOT_W):
					if sx == 0 or sx == PORT_SLOT_W - 1 or sy == 0 or sy == PORT_SLOT_H - 1:
						e += slot[sy * PORT_SLOT_W + sx]
			edge.append(e)
			edge_total += e
			var fields: Dictionary
			if cache.has(d) and (cache[d]["slot"] as PackedFloat32Array) == slot:
				fields = cache[d]
				reused += 1
			else:
				fields = _isolated_cell_fields(slot, offs, kern)
				cache[d] = fields
			# grid (0,0) = slot origin - mg = nominal cell origin - 2*mg
			canvas = _paint_grid(canvas, fields, row, d * SRC_NUM_W - 2 * mg, row * SRC_NUM_H - 2 * mg, gw, gh, pal[row])
	return {"image": _to_image(canvas), "fields_computed": SRC_ROWS * SRC_COLS - reused, "fields_reused": reused,
		"slot_edge_ink": edge, "slot_edge_ink_total": edge_total}


## Fields of one slot on an unclipped (90+42)x(98+42) grid: the slot sits at (21,21), so ink anywhere in the
## slot (including its outer edge) still has the full 21 px reach for outline and glow.
static func _isolated_cell_fields(slot: PackedFloat32Array, offs: Array[Vector2i], kern: PackedFloat32Array) -> Dictionary:
	var mg := PORT_CELL_MARGIN
	var gw := PORT_SLOT_W + 2 * mg
	var gh := PORT_SLOT_H + 2 * mg
	var m := PackedFloat32Array()
	m.resize(gw * gh)
	m.fill(0.0)
	for sy in range(PORT_SLOT_H):
		for sx in range(PORT_SLOT_W):
			m[(sy + mg) * gw + sx + mg] = slot[sy * PORT_SLOT_W + sx]
	var f := _grid_fields(m, gw, gh, offs, kern)
	f["slot"] = slot
	return f


## m / glow (separable Gaussian) / ring (29-offset union) on a grid, limited to the ink bounding box plus
## reach. Skipped terms are exact zeros, so results equal the full-grid sums.
static func _grid_fields(m: PackedFloat32Array, gw: int, gh: int, offs: Array[Vector2i], kern: PackedFloat32Array) -> Dictionary:
	var r := PORT_BLUR_RADIUS
	var glow := PackedFloat32Array()
	glow.resize(gw * gh)
	glow.fill(0.0)
	var ring := PackedFloat32Array()
	ring.resize(gw * gh)
	ring.fill(0.0)
	var bx0 := gw
	var by0 := gh
	var bx1 := -1
	var by1 := -1
	for ly in range(gh):
		for lx in range(gw):
			if m[ly * gw + lx] > 0.0:
				bx0 = mini(bx0, lx)
				bx1 = maxi(bx1, lx)
				by0 = mini(by0, ly)
				by1 = maxi(by1, ly)
	if bx1 < 0:
		return {"m": m, "glow": glow, "ring": ring}
	var x0 := maxi(0, bx0 - r)
	var x1 := mini(gw - 1, bx1 + r)
	var tmp := PackedFloat32Array()
	tmp.resize(gw * gh)
	tmp.fill(0.0)
	for ly in range(by0, by1 + 1):
		for lx in range(x0, x1 + 1):
			var s := 0.0
			for k in range(maxi(-r, bx0 - lx), mini(r, bx1 - lx) + 1):
				s += m[ly * gw + lx + k] * kern[k + r]
			tmp[ly * gw + lx] = s
	for ly in range(maxi(0, by0 - r), mini(gh - 1, by1 + r) + 1):
		for lx in range(x0, x1 + 1):
			var s2 := 0.0
			for k in range(maxi(-r, by0 - ly), mini(r, by1 - ly) + 1):
				s2 += tmp[(ly + k) * gw + lx] * kern[k + r]
			glow[ly * gw + lx] = s2
	var ro := SRC_OUTLINE_R
	for ly in range(maxi(0, by0 - ro), mini(gh - 1, by1 + ro) + 1):
		for lx in range(maxi(0, bx0 - ro), mini(gw - 1, bx1 + ro) + 1):
			var keep := 1.0
			for o in offs:
				var sx2 := lx - o.x
				var sy2 := ly - o.y
				if sx2 >= 0 and sx2 < gw and sy2 >= 0 and sy2 < gh:
					keep *= 1.0 - m[sy2 * gw + sx2]
			ring[ly * gw + lx] = 1.0 - keep
	return {"m": m, "glow": glow, "ring": ring}


## Same per-pixel source passes as _paint_cell, for a grid of any size at canvas origin (gx0, gy0).
static func _paint_grid(canvas: PackedFloat32Array, f: Dictionary, row: int, gx0: int, gy0: int, gw: int,
		gh: int, st: Dictionary) -> PackedFloat32Array:
	var aw := SRC_ATLAS_SIZE.x
	var ah := SRC_ATLAS_SIZE.y
	var m: PackedFloat32Array = f["m"]
	var gl: PackedFloat32Array = f["glow"]
	var ring: PackedFloat32Array = f["ring"]
	var glow_c: Color = st["glow"]
	var mid_c: Color = st["mid"]
	var out_c: Color = st["outline"]
	var white := Color(1, 1, 1)
	var hl := row != SRC_HIGHLIGHT_SKIP_ROW
	for ly in range(gh):
		var py := gy0 + ly
		if py < 0 or py >= ah:
			continue
		var grad_c := gradient_color(row, float(py) + 0.5)
		for lx in range(gw):
			var px := gx0 + lx
			if px < 0 or px >= aw:
				continue
			var i := ly * gw + lx
			var gv: float = gl[i]
			var mv: float = m[i]
			var rv: float = ring[i]
			var hv: float = m[i + gw] if (hl and ly + 1 < gh) else 0.0
			if gv <= 0.0 and mv <= 0.0 and rv <= 0.0 and hv <= 0.0:
				continue
			var k := (py * aw + px) * 4
			var acc := Color(canvas[k], canvas[k + 1], canvas[k + 2], canvas[k + 3])
			acc = _over(acc, glow_c, glow_c.a * gv)
			acc = _over(acc, mid_c, mv)
			acc = _over(acc, out_c, rv)
			acc = _over(acc, grad_c, mv)
			acc = _over(acc, white, SRC_HIGHLIGHT_ALPHA * hv)
			canvas[k] = acc.r
			canvas[k + 1] = acc.g
			canvas[k + 2] = acc.b
			canvas[k + 3] = acc.a
	return canvas


func _base_report() -> Dictionary:
	return {"status": "not_baked", "source": "game.html L44459-44509 _buildNumAtlas",
		"mask_path": "isolated_slots_90x98_on_900x294_workspace",
		"atlas_size": SRC_ATLAS_SIZE, "font_css": SRC_FONT_CSS, "font_fallback": "Noto Sans KR (stack[1]); Pirata One absent",
		"baseline_mode": "top_as_ascent", "blur_backend": "gaussian_sigma6_radius18_normalised_cpu",
		"cell_clip": "none (canvas bounds only, as source)", "digit_order": "row-major, per-digit passes",
		"saved_files": 0}


## Draws the 30 source glyphs (white, coverage only) into the transparent mask viewport.
class GlyphMaskNode extends Node2D:
	var font: Font = null
	var font_px: int = 44
	var num_w: int = 48
	var num_h: int = 56
	var glyph_top: int = 6
	var cols: int = 10
	var rows: int = 3
	# workspace layout: slot pitch and padding (defaults = classic 480x168 layout)
	var pitch_x: int = 48
	var pitch_y: int = 56
	var pad: int = 0
	var trace: Array[Dictionary] = []

	func _draw() -> void:
		trace.clear()
		if font == null:
			return
		var asc: float = font.get_ascent(font_px)
		for row in range(rows):
			for d in range(cols):
				var ch := str(d)
				var w: float = font.get_string_size(ch, HORIZONTAL_ALIGNMENT_LEFT, -1, font_px).x
				# source anchor in the final atlas
				var cx: float = float(d * num_w) + num_w / 2.0
				var top: float = float(row * num_h + glyph_top)
				# same anchor inside this glyph's own workspace slot
				var scx: float = float(d * pitch_x + pad) + num_w / 2.0
				var stop: float = float(row * pitch_y + pad + glyph_top)
				var pos := Vector2(scx - w / 2.0, stop + asc)
				draw_string(font, pos, ch, HORIZONTAL_ALIGNMENT_LEFT, -1, font_px, Color(1, 1, 1, 1))
				trace.append({"row": row, "digit": d, "cx": cx, "top": top, "baseline": top + asc, "advance": w,
					"slot_cx": scx, "slot_top": stop, "slot_baseline": pos.y})
