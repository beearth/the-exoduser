extends Node2D
## Common projectile charge / queued-shot warning — ACTUAL Node2D renderer producer.
##
## Ports exactly two branches of the original `_drawEnemyShotWarnings()` pass:
##   1. common enemy charge  : `e._projChargeT>0 && e._projChargeCol`  (per alive enemy)
##   2. common queued shots  : `G._shotWarnings` entries with `w.world===ens`
## Both call the original `_drawShootCharge` ring and, for physical only, `_drawProjectileChargeLabel`.
## NOT ported here (other owners / other paths of the same function): `eShootWind`, `G._spiralBullets`,
## `G._phantomSwords`, M29 eliteCharge telegraph (vfx_m29), TP warnings, hit-FX.
##
## Source authority (read-only R = exoduser-migration-20261001/game.html):
##   _drawEnemyShotWarnings       L20547-20569 (caller pass, after enemy bodies, before projectile passes L54503)
##   _drawProjectileChargeLabel   L24590-24603
##   _drawShootCharge             L24604-24617
##   _projectileParryClass        L17308-17318
##   common charge start fields   L41115-41118 (_projChargeBean/_projChargeCol/_projChargeParryClass/_projChargeT=60)
##   queued warning fields        L20526 (owner/world/frame/t:60/dead/x/y/r:(e.r||12)+lane*8/el/blackBean/parryClass/col)
##   countdown (NOT done here)    _tickProjCharge L20604, _tickEnemyShotWarnings L20531
##   _gameFrame++                 L32793 (update tick, frozen while paused)
##
## CLOCK vs RENDER:
##   - native60 countdown (`_projChargeT`, `w.t`) is owned by the caller's update; this node only reads it.
##   - the only animated colour is BlackBean rainbow `_BEAN_RAINBOW[(_gameFrame>>2)%7]`, keyed to the source
##     update-tick `_gameFrame` supplied by the caller. There is NO real-time/render-clock pulse in this path,
##     so `_process(delta)` never accumulates time and never changes a colour or progress on its own.
## READ-ONLY: providers are only read (Dictionary.get / Object.get). Nothing is ever written back.
## Renderer-local writable state: normalized entries, font handle, trace and dispatch counters.

# ── source raw constants ─────────────────────────────────────────────────────
const NATIVE_CHARGE_FRAMES := 60.0          # 1-_projChargeT/60, 1-w.t/60
const RING_PAD := 10.0                      # R=r+10
const TRACK_COLOR := "#080808"
const TRACK_ALPHA := 0.28                   # sa*.28
const TRACK_WIDTH := 5.0
const PHYSICAL_STROKE := "#ffffff"          # physical ? '#ffffff' (passed col ignored)
const PHYSICAL_WIDTH := 6.0
const MAGIC_WIDTH := 3.5
const MAGIC_ALPHA_BASE := 0.8               # sa*(.8+prog*.2)
const MAGIC_ALPHA_PROG := 0.2
const MAGIC_FALLBACK := "#ff6644"           # col||'#ff6644'
const ARC_START := -PI / 2.0                # arc(x,y,R,-π/2,-π/2+2π*prog)
const PHYSICAL_PASSED_COL := "#f4f4f4"      # _pcCol / w.col for physical
const FIRE_BEAN_COL := "#ff2e22"
const BEAN_RAINBOW := ["#ff2244", "#ff8800", "#ffee00", "#00ff66", "#00ccff", "#8855ff", "#ff44cc"]
const EL_P := 0                             # EL.P
const LABEL_KO := "물리탄 차징 · E로 패링"
const LABEL_EN := "PHYSICAL SHOT CHARGING · PARRY WITH E"
const LABEL_FONT_PATH := "res://assets/fonts/NotoSansKR.ttf"  # bold 13px "Noto Sans KR"
const LABEL_FONT_SIZE := 13
const LABEL_FONT_WEIGHT := 700
const LABEL_OFFSET_Y := 25.0                # cy=y-r-25
const LABEL_PAD_W := 14.0                   # bw=tw+14
const LABEL_H := 20.0                       # bh=20
const LABEL_BG := Color(5.0 / 255.0, 8.0 / 255.0, 13.0 / 255.0, 0.92)  # rgba(5,8,13,.92)
const LABEL_STROKE := "#f4f4f4"
const LABEL_STROKE_W := 1.5
const LABEL_TEXT := "#ffffff"

# ── port tessellation (not source values) ────────────────────────────────────
const ARC_SEGMENTS_FULL := 96
const CAP_SEGMENTS := 12

var auto_refresh := true

var _snapshot_provider := Callable()
var _frame_provider := Callable()
var _fixed_snapshot: Dictionary = {}
var _has_fixed := false

var _font: Font = null
var font_status := "unloaded"
var bold_mode := "none"

var _entries: Array = []
var _skips: Dictionary = {}
var _last_trace: Array = []

var api_call_count := 0        # explicit public API calls (configure/refresh/build_draw_list)
var refresh_count := 0         # internal snapshot pulls (API or _process)
var draw_dispatch_count := 0   # actual CanvasItem _draw dispatches
var process_count := 0         # _process signals
var physics_count := 0         # _physics_process signals (must stay 0)


func _ready() -> void:
	set_physics_process(false)
	_ensure_font()


func _process(_delta: float) -> void:
	process_count += 1
	if auto_refresh and (_has_fixed or _snapshot_provider.is_valid()):
		_refresh_internal()


func _physics_process(_delta: float) -> void:
	physics_count += 1


# ── public API ───────────────────────────────────────────────────────────────
## snapshot_provider() -> Dictionary  (source-native snapshot, see doc "field closure")
## frame_provider() -> Dictionary     optional {game_frame, lang, physical_label}
func configure(snapshot_provider: Callable, frame_provider: Callable = Callable()) -> void:
	api_call_count += 1
	_snapshot_provider = snapshot_provider
	_frame_provider = frame_provider
	_has_fixed = false
	_fixed_snapshot = {}


## Fixed constructor fixture (deep-copied once; the caller's dictionary is never touched again).
func configure_fixed_snapshot(snapshot: Dictionary, frame_provider: Callable = Callable()) -> void:
	api_call_count += 1
	_fixed_snapshot = snapshot.duplicate(true)
	_has_fixed = true
	_snapshot_provider = Callable()
	_frame_provider = frame_provider


## Caller-supplied original font (e.g. the shared game font). Renderer-local resource only.
func set_label_font(font: Font, status: String = "caller") -> void:
	api_call_count += 1
	_font = font
	font_status = "caller:" + status if font != null else "missing:caller_null"
	bold_mode = "caller_supplied"


func refresh() -> int:
	api_call_count += 1
	return _refresh_internal()


func build_draw_list(snapshot: Dictionary, frame_ctx: Dictionary = {}) -> Array:
	api_call_count += 1
	_ensure_font()
	var skips := {}
	return _build(snapshot, frame_ctx, skips)


func get_entries() -> Array:
	return _entries.duplicate(true)


func get_skip_counts() -> Dictionary:
	return _skips.duplicate(true)


func get_last_draw_trace() -> Array:
	return _last_trace.duplicate(true)


func get_label_font() -> Font:
	_ensure_font()
	return _font


func get_counters() -> Dictionary:
	return {
		"api_call": api_call_count,
		"refresh": refresh_count,
		"draw_dispatch": draw_dispatch_count,
		"process": process_count,
		"physics": physics_count,
	}


# ── source predicates / equations (static, pure) ─────────────────────────────
## _projectileParryClass({el, parryClass}) restricted to the two fields the common charge branch passes.
static func source_parry_class(el, parry_class) -> String:
	if _truthy(parry_class):
		return str(parry_class)
	var e = EL_P if el == null else el
	return "physical" if _num_eq(e, EL_P) else "magic"


static func charge_progress(t_remaining: float) -> float:
	return 1.0 - t_remaining / NATIVE_CHARGE_FRAMES


static func clamp_progress(prog: float) -> float:
	if is_nan(prog):
		return prog
	return 0.0 if prog < 0.0 else (1.0 if prog > 1.0 else prog)


static func rainbow_col(game_frame: int) -> String:
	var idx := (game_frame >> 2) % 7
	return BEAN_RAINBOW[idx] if idx >= 0 else ""


## Angular half-extent of a round cap of half width hw on a ring of radius R.
static func cap_angle(radius: float, width: float) -> float:
	return asin(minf(1.0, width * 0.5 / radius))


## "none" (prog<=0), "dot" (zero-length arc => round-cap disc), "capsule" (single simple polygon),
## "piecewise" (caps would overlap the opposite end), "full" (prog==1 closed ring).
static func progress_mode(radius: float, width: float, prog: float) -> String:
	if not (prog > 0.0):
		return "none"
	if prog >= 1.0:
		return "full"
	var span := TAU * prog
	if span * radius < 0.05:
		return "dot"
	if span + 2.0 * cap_angle(radius, width) < TAU - 1e-4:
		return "capsule"
	return "piecewise"


static func sector_polygon(c: Vector2, radius: float, a0: float, a1: float, width: float) -> PackedVector2Array:
	var hw := width * 0.5
	var span := a1 - a0
	var n := maxi(2, int(ceil(ARC_SEGMENTS_FULL * absf(span) / TAU)))
	var pts := PackedVector2Array()
	for i in n + 1:
		var a := a0 + span * float(i) / float(n)
		pts.append(c + Vector2(cos(a), sin(a)) * (radius + hw))
	for i in range(n, -1, -1):
		var a := a0 + span * float(i) / float(n)
		pts.append(c + Vector2(cos(a), sin(a)) * (radius - hw))
	return pts


## Round-capped arc (canvas lineCap='round') as ONE simple polygon => no alpha double-blend.
static func capsule_polygon(c: Vector2, radius: float, a0: float, a1: float, width: float) -> PackedVector2Array:
	var hw := width * 0.5
	var span := a1 - a0
	var n := maxi(2, int(ceil(ARC_SEGMENTS_FULL * span / TAU)))
	var pts := PackedVector2Array()
	for i in n + 1:
		var a := a0 + span * float(i) / float(n)
		pts.append(c + Vector2(cos(a), sin(a)) * (radius + hw))
	var ue := Vector2(cos(a1), sin(a1))
	var te := Vector2(-sin(a1), cos(a1))
	var pe := c + ue * radius
	for k in range(1, CAP_SEGMENTS):
		var phi := PI * float(k) / float(CAP_SEGMENTS)
		pts.append(pe + (ue * cos(phi) + te * sin(phi)) * hw)
	for i in range(n, -1, -1):
		var a := a0 + span * float(i) / float(n)
		pts.append(c + Vector2(cos(a), sin(a)) * (radius - hw))
	var us := Vector2(cos(a0), sin(a0))
	var ts := Vector2(-sin(a0), cos(a0))
	var ps := c + us * radius
	for k in range(1, CAP_SEGMENTS):
		var phi := PI * float(k) / float(CAP_SEGMENTS)
		pts.append(ps + (-us * cos(phi) - ts * sin(phi)) * hw)
	return pts


## Semicircle cap beyond an arc end. forward=true => beyond a1, false => before a0.
static func half_disc_polygon(c: Vector2, radius: float, a: float, width: float, forward: bool) -> PackedVector2Array:
	var hw := width * 0.5
	var u := Vector2(cos(a), sin(a))
	var t := Vector2(-sin(a), cos(a)) * (1.0 if forward else -1.0)
	var p := c + u * radius
	var pts := PackedVector2Array()
	for k in CAP_SEGMENTS + 1:
		var phi := PI * float(k) / float(CAP_SEGMENTS)
		pts.append(p + (u * cos(phi) + t * sin(phi)) * hw)
	return pts


# ── snapshot → entries ───────────────────────────────────────────────────────
func _refresh_internal() -> int:
	refresh_count += 1
	_ensure_font()
	var snap: Dictionary = {}
	if _has_fixed:
		snap = _fixed_snapshot
	elif _snapshot_provider.is_valid():
		var got = _snapshot_provider.call()
		if got is Dictionary:
			snap = got
	var ctx: Dictionary = {}
	if _frame_provider.is_valid():
		var fc = _frame_provider.call()
		if fc is Dictionary:
			ctx = fc
	_skips = {}
	_entries = _build(snap, ctx, _skips)
	queue_redraw()
	return _entries.size()


func _build(snap: Dictionary, ctx: Dictionary, skips: Dictionary) -> Array:
	var out: Array = []
	var gf := int(ctx.get("game_frame", snap.get("game_frame", 0)))
	var lang := str(ctx.get("lang", snap.get("lang", "ko")))
	var label := _physical_label(lang, ctx)
	var enemies = snap.get("enemies", [])
	var warnings = snap.get("shot_warnings", [])
	var by_id := {}
	if enemies is Array:
		for e in enemies:
			if e != null and _rd(e, "id") != null:
				by_id[_rd(e, "id")] = e
		# branch 1: common enemy charge (L20551-20556)
		for e in enemies:
			if e == null or not _truthy(_rd(e, "alive")):
				_skip(skips, "enemy_not_alive")
				continue
			var t = _rd(e, "_projChargeT")
			if not (_is_num(t) and float(t) > 0.0):
				_skip(skips, "charge_t_not_positive")
				continue
			if not _truthy(_rd(e, "_projChargeCol")):
				_skip(skips, "charge_col_falsy")
				continue
			var r = _rd(e, "r")
			if not _is_num(r):
				_skip(skips, "invalid_r")
				continue
			var physical := source_parry_class(_rd(e, "el"), _rd(e, "_projChargeParryClass")) == "physical"
			var bean = _rd(e, "_projChargeBean")
			var col := ""
			if physical:
				col = PHYSICAL_PASSED_COL
			elif bean == "black":
				col = rainbow_col(gf)
			elif bean == "fire":
				col = FIRE_BEAN_COL
			else:
				col = str(_rd(e, "_projChargeCol"))
			out.append(_make_entry("proj_charge", _rd(e, "id"), float(_rd(e, "x", 0.0)), float(_rd(e, "y", 0.0)),
				float(r), charge_progress(float(t)), col, physical, label, float(t)))
	# branch 2: common queued shot warnings (L20561-20568)
	if warnings is Array:
		var world = snap.get("world")
		for w in warnings:
			if w == null:
				_skip(skips, "null_warning")
				continue
			if world == null or _rd(w, "world") != world:
				_skip(skips, "world_mismatch")
				continue
			var dead := _truthy(_rd(w, "dead"))
			var px := 0.0
			var py := 0.0
			if dead:
				px = float(_rd(w, "x", 0.0))
				py = float(_rd(w, "y", 0.0))
			else:
				var owner = _rd(w, "owner")
				if owner == null and by_id.has(_rd(w, "owner_id")):
					owner = by_id[_rd(w, "owner_id")]
				if owner == null:
					_skip(skips, "owner_unresolved")
					continue
				px = float(_rd(owner, "x", 0.0))
				py = float(_rd(owner, "y", 0.0))
			var wt = _rd(w, "t")
			var wr = _rd(w, "r")
			if not _is_num(wt) or not _is_num(wr):
				_skip(skips, "invalid_warning_t_or_r")
				continue
			var physical := str(_rd(w, "parryClass", "")) == "physical"
			var col := ""
			if physical:
				col = PHYSICAL_PASSED_COL
			elif _truthy(_rd(w, "blackBean")):
				col = rainbow_col(gf)
			else:
				var wc = _rd(w, "col")
				col = "" if wc == null else str(wc)
			out.append(_make_entry("shot_warning", _rd(w, "owner_id", null), px, py, float(wr),
				charge_progress(float(wt)), col, physical, label, float(wt)))
	return out


func _make_entry(path: String, src_id, x: float, y: float, r: float, prog_raw: float, col: String,
		physical: bool, label: String, t_remaining: float) -> Dictionary:
	var sa := 1.0
	var prog := clamp_progress(prog_raw)
	var radius := r + RING_PAD
	var stroke_src := PHYSICAL_STROKE if physical else (col if col != "" else MAGIC_FALLBACK)
	var parsed := _css_color(stroke_src)
	var color_status := "ok"
	var stroke: Color = parsed
	if parsed.a < 0.0:
		# canvas ignores an invalid strokeStyle assignment => the track '#080808' stays current.
		stroke = Color(TRACK_COLOR)
		color_status = "invalid_css_kept_track"
	var width := PHYSICAL_WIDTH if physical else MAGIC_WIDTH
	var prog_for_alpha := 0.0 if is_nan(prog) else prog
	var alpha := sa if physical else sa * (MAGIC_ALPHA_BASE + prog_for_alpha * MAGIC_ALPHA_PROG)
	var entry := {
		"path": path, "source_id": src_id, "x": x, "y": y, "r": r, "R": radius,
		"t_remaining": t_remaining, "prog_raw": prog_raw, "prog": prog,
		"physical": physical, "passed_col": col, "stroke_src": stroke_src, "stroke": stroke,
		"color_status": color_status, "width": width, "alpha": alpha,
		"track_alpha": sa * TRACK_ALPHA, "arc_start": ARC_START,
		"arc_end": ARC_START + TAU * (0.0 if is_nan(prog) else prog),
		"mode": progress_mode(radius, width, prog), "label": "",
	}
	if physical:
		entry["label"] = label
		var cy := y - r - LABEL_OFFSET_Y
		entry["label_cy"] = cy
		if _font != null:
			var tw := _font.get_string_size(label, HORIZONTAL_ALIGNMENT_LEFT, -1, LABEL_FONT_SIZE).x
			var bw := tw + LABEL_PAD_W
			entry["label_tw"] = tw
			entry["label_box"] = Rect2(x - bw / 2.0, cy - LABEL_H / 2.0, bw, LABEL_H)
			entry["label_baseline"] = cy + (_font.get_ascent(LABEL_FONT_SIZE) - _font.get_descent(LABEL_FONT_SIZE)) / 2.0
		else:
			entry["label_missing"] = font_status
	return entry


func _physical_label(lang: String, ctx: Dictionary) -> String:
	# _L(ko,en): ko when OPT.lang==='ko', else _T(ko) translation if any, else en.
	if lang == "ko":
		return LABEL_KO
	var translated = ctx.get("physical_label", null)
	if translated is String and translated != "" and translated != LABEL_KO:
		return translated
	return LABEL_EN


# ── actual draw ──────────────────────────────────────────────────────────────
func _draw() -> void:
	draw_dispatch_count += 1
	_last_trace = []
	for i in _entries.size():
		_draw_entry(i, _entries[i])


func _draw_entry(i: int, en: Dictionary) -> void:
	var c := Vector2(en["x"], en["y"])
	var radius: float = en["R"]
	var track := Color(TRACK_COLOR)
	track.a = en["track_alpha"]
	# full dark track: two half-ring sectors (no seam overlap at alpha .28)
	draw_colored_polygon(sector_polygon(c, radius, 0.0, PI, TRACK_WIDTH), track)
	draw_colored_polygon(sector_polygon(c, radius, PI, TAU, TRACK_WIDTH), track)
	_last_trace.append({"entry": i, "op": "track_ring", "R": radius, "width": TRACK_WIDTH, "color": track})
	var stroke: Color = en["stroke"]
	stroke.a = en["alpha"]
	var w: float = en["width"]
	var a0: float = en["arc_start"]
	var a1: float = en["arc_end"]
	match str(en["mode"]):
		"capsule":
			draw_colored_polygon(capsule_polygon(c, radius, a0, a1, w), stroke)
		"piecewise":
			draw_colored_polygon(sector_polygon(c, radius, a0, a1, w), stroke)
			draw_colored_polygon(half_disc_polygon(c, radius, a0, w, false), stroke)
			draw_colored_polygon(half_disc_polygon(c, radius, a1, w, true), stroke)
		"full":
			draw_colored_polygon(sector_polygon(c, radius, a0, a0 + PI, w), stroke)
			draw_colored_polygon(sector_polygon(c, radius, a0 + PI, a0 + TAU, w), stroke)
		"dot":
			draw_circle(c + Vector2(cos(a0), sin(a0)) * radius, w * 0.5, stroke)
	if str(en["mode"]) != "none":
		_last_trace.append({"entry": i, "op": "progress_" + str(en["mode"]), "R": radius, "width": w,
			"color": stroke, "a0": a0, "a1": a1})
	if not en["physical"]:
		return
	if not en.has("label_box") or _font == null:
		_last_trace.append({"entry": i, "op": "label_skipped_font_missing", "status": font_status})
		return
	var box: Rect2 = en["label_box"]
	draw_rect(box, LABEL_BG, true)
	var sw := LABEL_STROKE_W
	var hw := sw * 0.5
	var sc := Color(LABEL_STROKE)
	# strokeRect centred on the edge, mitred corners, as four non-overlapping strips
	draw_rect(Rect2(box.position.x - hw, box.position.y - hw, box.size.x + sw, sw), sc, true)
	draw_rect(Rect2(box.position.x - hw, box.end.y - hw, box.size.x + sw, sw), sc, true)
	draw_rect(Rect2(box.position.x - hw, box.position.y + hw, sw, box.size.y - sw), sc, true)
	draw_rect(Rect2(box.end.x - hw, box.position.y + hw, sw, box.size.y - sw), sc, true)
	_last_trace.append({"entry": i, "op": "label_box", "box": box, "fill": LABEL_BG, "stroke": sc, "stroke_w": sw})
	var tw: float = en["label_tw"]
	var pos := Vector2(float(en["x"]) - tw / 2.0, float(en["label_baseline"]))
	draw_string(_font, pos, str(en["label"]), HORIZONTAL_ALIGNMENT_LEFT, -1, LABEL_FONT_SIZE, Color(LABEL_TEXT))
	_last_trace.append({"entry": i, "op": "label_text", "text": en["label"], "pos": pos, "size": LABEL_FONT_SIZE})


# ── helpers ──────────────────────────────────────────────────────────────────
func _ensure_font() -> void:
	if _font != null or font_status.begins_with("missing") or font_status.begins_with("invalid"):
		return
	if not ResourceLoader.exists(LABEL_FONT_PATH):
		font_status = "missing:" + LABEL_FONT_PATH
		return
	var base = load(LABEL_FONT_PATH)
	if not (base is Font):
		font_status = "invalid:" + LABEL_FONT_PATH
		return
	var fv := FontVariation.new()
	fv.base_font = base
	var wght := TextServerManager.get_primary_interface().name_to_tag("wght")
	var sup: Dictionary = (base as Font).get_supported_variation_list()
	if sup.has(wght):
		fv.variation_opentype = {wght: LABEL_FONT_WEIGHT}
		bold_mode = "wght_axis_700"
	else:
		# source loads a real 700 face; without a wght axis Godot can only embolden synthetically.
		fv.variation_embolden = 0.6
		bold_mode = "synthetic_embolden_0.6_no_wght_axis"
	_font = fv
	font_status = "loaded:" + LABEL_FONT_PATH


static func _css_color(s: String) -> Color:
	if Color.html_is_valid(s):
		return Color.html(s)
	var sentinel := Color(0, 0, 0, -1)
	return Color.from_string(s, sentinel)


static func _rd(src, key: String, def = null):
	if src is Dictionary:
		return src.get(key, def)
	if src is Object and is_instance_valid(src):
		var v = src.get(key)
		return def if v == null else v
	return def


static func _truthy(v) -> bool:
	if v == null:
		return false
	match typeof(v):
		TYPE_BOOL:
			return v
		TYPE_INT:
			return v != 0
		TYPE_FLOAT:
			return v != 0.0 and not is_nan(v)
		TYPE_STRING, TYPE_STRING_NAME:
			return str(v) != ""
	return true


static func _is_num(v) -> bool:
	return (typeof(v) == TYPE_INT) or (typeof(v) == TYPE_FLOAT and not is_nan(v))


static func _num_eq(v, n: int) -> bool:
	return _is_num(v) and float(v) == float(n)


static func _skip(skips: Dictionary, reason: String) -> void:
	skips[reason] = int(skips.get(reason, 0)) + 1
