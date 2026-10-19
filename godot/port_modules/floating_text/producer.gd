extends Node2D
## Standalone floating-text sink: port of the original `addTxt` / `G.txts` ring pool.
##
## Source authority (canonical game.html):
##   L44444  let TXTS_MAX=40;                       (testbed L64626 reassigns TXTS_MAX=120)
##   L44451  let _txtNext=0;
##   L44452-44456 function addTxt(x,y,t,c,l,sz,numStr)
##           pool fill to TXTS_MAX (+ _txtNext=0) when G.txts.length<TXTS_MAX,
##           p.t=_T(t); p.c=c; p.life=l||35; p.ml=l||35; p.sz=sz||0; p._numStr=numStr||null;
##           _txtNext=(_txtNext+1)%TXTS_MAX
##   L36311  native update: if(t.life>0){t.y-=.6*sp;t.life-=sp}
##   L30805/L31421/L63894  G.txts=[] (room/stage reset; _txtNext is NOT reset there)
##   L55288-55328 draw(): _FLOAT_TEXT_ENABLED gate, slot order 0..len-1, life<=0 skip,
##           cull by draw-local _vl/_vr/_vt/_vb (L53172-53173: cam±VW/2,VH/2 ± (_hiFPS?120:200)),
##           whitelist when !window._btActive, alpha/bounce/shake, numStr atlas branch (sz>=28),
##           general branch: 900 weight Noto Sans KR, 8 black offset fills + white fill.
##
## Clock: native_tick(sp) is the source update line and must only be called by the central
## guarded native60 clock (after the source update-return guards, i.e. not while paused).
## _process never advances native time; it only requests a redraw.
## Pause / owner death: texts hold no owner reference; nothing here cancels them.

const LABEL_FONT_PATH := "res://assets/fonts/NotoSansKR.ttf"   # '900 Npx "Noto Sans KR"'
const LABEL_FONT_WEIGHT := 900

# ── source constants ─────────────────────────────────────────────────────────
const SRC_TXTS_MAX := 40              # L44444
const SRC_TXTS_MAX_TESTBED := 120     # L64626
const SRC_DEFAULT_LIFE := 35          # l||35
const SRC_DEFAULT_SZ := 0             # sz||0
const SRC_RISE_PER_SP := 0.6          # t.y-=.6*sp
const SRC_DRAW_BASE_SZ := 22          # _bSz=t.sz||22
const SRC_FADE_FRAC := 0.2            # _rawTa>0.2?1:_rawTa*5
const SRC_FADE_MUL := 5.0
const SRC_POP_MUL := 5.0              # _pt=min(1,_age*5)
const SRC_SHAKE_MIN_SZ := 36          # _bSz>=36&&_age<0.3
const SRC_SHAKE_AGE := 0.3
const SRC_NUM_BRANCH_MIN_SZ := 28     # t.sz>=28&&t._numStr
const SRC_OUTLINE_FRAC := 0.06        # _ow=max(1,~~(_fSz*.06))
const SRC_CULL_PAD := 200             # _eVpad=_hiFPS?120:200
const SRC_CULL_PAD_HIFPS := 120
const SRC_WHITELIST := ["시전", "그로기", "무적", "CRIT", "사망", "탈출", "✟", "🌋"]   # L55296
const SRC_OUTLINE_OFFSETS := [Vector2(-1, 0), Vector2(1, 0), Vector2(0, -1), Vector2(0, 1),
	Vector2(-1, -1), Vector2(1, -1), Vector2(-1, 1), Vector2(1, 1)]                  # L55323-55324 order
const SRC_NUM_W := 48                 # _NUM_W (L44459)
const SRC_NUM_H := 56                 # _NUM_H
const SRC_NUM_GAP_SUB := 30           # gap=~~((_NUM_W-30)*sc)
const SRC_NUM_ATLAS_SIZE := Vector2i(480, 168)   # _numAtlas.width=_NUM_W*10; height=_NUM_H*3 (L44461)

const RENDER_CONTEXT_KEYS := ["float_text_enabled", "bt_active", "cam_x", "cam_y", "vw", "vh", "hi_fps"]

# ── source state ─────────────────────────────────────────────────────────────
## G.txts slots: {x, y, t, c, life, ml, sz, _numStr}. Length is 0 or txts_max-or-more (ring pool).
var txts: Array[Dictionary] = []
var txt_next: int = 0                 # _txtNext
var txts_max: int = SRC_TXTS_MAX      # TXTS_MAX (mutable `let` in source)

# ── injected production interfaces (constructor) ─────────────────────────────
var _localize := Callable()           # _T(s) -> Variant
var _render_context := Callable()     # () -> Dictionary with RENDER_CONTEXT_KEYS

## Caller-supplied read-only number atlas (source _numAtlas). Never generated, modified or saved here.
var _num_atlas: Texture2D = null
var num_atlas_status := "absent"

var font_status := "unloaded"
var bold_mode := "none"
var _font: Font = null

var _counters := {"admitted": 0, "rejected_no_localizer": 0, "native_ticks": 0, "draw_dispatch": 0,
	"draw_general": 0, "num_atlas_gap_skipped": 0, "num_atlas_drawn": 0, "num_atlas_digit_blits": 0,
	"num_atlas_rejected": 0, "render_context_errors": 0}
var _last_trace: Array[Dictionary] = []
var _last_render_error := ""


func _init(localize: Callable = Callable(), render_context: Callable = Callable(),
		max_slots: int = SRC_TXTS_MAX, num_atlas: Texture2D = null) -> void:
	_localize = localize
	_render_context = render_context
	txts_max = max_slots
	if num_atlas != null:
		set_number_atlas(num_atlas)


## Supply the source number atlas (480x168: 10 digit columns x 3 colour rows of 48x56 cells).
## Read-only consumer: the texture is only sampled by draw_texture_rect_region. A null or
## wrongly sized texture is rejected and the previous atlas state is kept.
func set_number_atlas(tex: Texture2D) -> bool:
	if tex == null:
		num_atlas_status = "rejected:null" if _num_atlas == null else num_atlas_status
		_counters["num_atlas_rejected"] += 1
		return false
	var sz := Vector2i(tex.get_width(), tex.get_height())
	if sz != SRC_NUM_ATLAS_SIZE:
		_counters["num_atlas_rejected"] += 1
		if _num_atlas == null:
			num_atlas_status = "rejected:size_%dx%d" % [sz.x, sz.y]
		return false
	_num_atlas = tex
	num_atlas_status = "supplied"
	queue_redraw()
	return true


## Back to the explicit gap (numStr branch skipped, nothing drawn).
func clear_number_atlas() -> void:
	_num_atlas = null
	num_atlas_status = "absent"
	queue_redraw()


func has_number_atlas() -> bool:
	return _num_atlas != null


## Testbed L64626 reassigns the `let`; the pool grows on the next addTxt only.
func set_txts_max(n: int) -> void:
	txts_max = n


# ── addTxt (L44452) ──────────────────────────────────────────────────────────
func add_txt(x: float, y: float, t: Variant, c: Variant, l: Variant = null, sz: Variant = null,
		num_str: Variant = null) -> bool:
	if not _localize.is_valid():
		_counters["rejected_no_localizer"] += 1
		return false
	if txts.size() < txts_max:
		for _i in range(txts.size(), txts_max):
			txts.append({"x": 0.0, "y": 0.0, "t": "", "c": "#fff", "life": 0.0, "ml": 0.0, "sz": 0.0,
				"_numStr": null})
		txt_next = 0
	var p: Dictionary = txts[txt_next]
	p["x"] = x
	p["y"] = y
	p["t"] = _localize.call(t)
	p["c"] = c
	var life: float = float(l) if js_truthy(l) else float(SRC_DEFAULT_LIFE)
	p["life"] = life
	p["ml"] = life
	p["sz"] = float(sz) if js_truthy(sz) else float(SRC_DEFAULT_SZ)
	p["_numStr"] = num_str if js_truthy(num_str) else null
	txt_next = (txt_next + 1) % txts_max
	_counters["admitted"] += 1
	queue_redraw()
	return true


# ── native update (L36311) ───────────────────────────────────────────────────
func native_tick(sp: float) -> void:
	for i in range(txts.size()):
		var t: Dictionary = txts[i]
		if float(t["life"]) > 0.0:
			t["y"] = float(t["y"]) - SRC_RISE_PER_SP * sp
			t["life"] = float(t["life"]) - sp
	_counters["native_ticks"] += 1
	queue_redraw()


## G.txts=[] at room/stage reset (L30805/L31421/L63894). _txtNext is left as-is (source).
func reset_source_txts() -> void:
	txts = []
	queue_redraw()


func get_counters() -> Dictionary:
	return _counters.duplicate()


func get_last_trace() -> Array:
	return _last_trace.duplicate(true)


func get_last_render_error() -> String:
	return _last_render_error


# ── draw plan (L55288-55328) ─────────────────────────────────────────────────
## Pure per-frame plan in slot order. Each entry: slot, branch ("general"|"num_atlas"),
## text, alpha, bn, sk; general: x, y (anchor incl. shake), fsz, ow; num_atlas: ci, sc, num_layout.
func build_draw_plan(ctx: Dictionary) -> Array[Dictionary]:
	var plan: Array[Dictionary] = []
	if not bool(ctx["float_text_enabled"]):
		return plan
	var pad: float = float(SRC_CULL_PAD_HIFPS if bool(ctx["hi_fps"]) else SRC_CULL_PAD)
	var vl: float = float(ctx["cam_x"]) - float(ctx["vw"]) / 2.0 - pad
	var vr: float = float(ctx["cam_x"]) + float(ctx["vw"]) / 2.0 + pad
	var vt: float = float(ctx["cam_y"]) - float(ctx["vh"]) / 2.0 - pad
	var vb: float = float(ctx["cam_y"]) + float(ctx["vh"]) / 2.0 + pad
	var bt_active: bool = bool(ctx["bt_active"])
	for ti in range(txts.size()):
		var t: Dictionary = txts[ti]
		var life: float = float(t["life"])
		if life <= 0.0:
			continue
		var tx: float = float(t["x"])
		var ty: float = float(t["y"])
		if tx < vl or tx > vr or ty < vt or ty > vb:
			continue
		var text: String = str(t["t"])
		if not bt_active and not js_truthy(t["_numStr"]):
			var allow := false
			for w in SRC_WHITELIST:
				if text.find(str(w)) != -1:
					allow = true
					break
			if not allow:
				continue
		var raw_ta: float = life / float(t["ml"])
		var age: float = 1.0 - raw_ta
		var sz: float = float(t["sz"])
		var b_sz: float = sz if js_truthy(sz) else float(SRC_DRAW_BASE_SZ)
		var ta: float = 1.0 if raw_ta > SRC_FADE_FRAC else raw_ta * SRC_FADE_MUL
		var pt: float = minf(1.0, age * SRC_POP_MUL)
		var bn: float = (1.0 + 0.5 * (1.0 - pt) * (1.0 - pt) * cos(pt * PI * 2.0)) if pt < 1.0 else 1.0
		var sk: float = (sin(age * 80.0) * (1.0 - age * 3.3) * 3.0) if (b_sz >= SRC_SHAKE_MIN_SZ and age < SRC_SHAKE_AGE) else 0.0
		var e := {"slot": ti, "text": text, "c": t["c"], "alpha": ta, "bn": bn, "sk": sk, "life": life,
			"ml": float(t["ml"])}
		if sz >= SRC_NUM_BRANCH_MIN_SZ and js_truthy(t["_numStr"]):
			var sc: float = (b_sz / 48.0) * bn
			e["branch"] = "num_atlas"
			e["sc"] = sc
			e["ci"] = num_color_index(str(t["c"]))
			e["num_layout"] = num_str_layout(t["_numStr"], tx + sk, ty - SRC_NUM_H * sc / 2.0, sc)
		else:
			var fsz: int = int(b_sz * bn)          # ~~ truncation
			e["branch"] = "general"
			e["x"] = tx + sk
			e["y"] = ty
			e["fsz"] = fsz
			e["ow"] = maxi(1, int(fsz * SRC_OUTLINE_FRAC))
		plan.append(e)
	return plan


## drawNumStr colour row: '#66ddff'→2, '#dd2200'|'#cc0000'|'#ff0000'→1, else 0 (L55309).
static func num_color_index(c: String) -> int:
	if c == "#66ddff":
		return 2
	if c == "#dd2200" or c == "#cc0000" or c == "#ff0000":
		return 1
	return 0


## drawNumStr geometry (L44510-44521): dest rects only; the atlas pixels are a known gap.
static func num_str_layout(num: Variant, x: float, y: float, sc: float) -> Array[Dictionary]:
	var s: String = str(int(num)) if (typeof(num) == TYPE_INT or typeof(num) == TYPE_FLOAT) else str(num)
	var dw: int = int(SRC_NUM_W * sc)
	var dh: int = int(SRC_NUM_H * sc)
	var gap: int = int((SRC_NUM_W - SRC_NUM_GAP_SUB) * sc)
	var ox: float = x - float(s.length() * gap) / 2.0
	var out: Array[Dictionary] = []
	for i in range(s.length()):
		var d: int = s.unicode_at(i) - 48
		if d < 0 or d > 9:
			continue
		out.append({"digit": d, "dx": int(ox + i * gap), "dy": int(y), "dw": dw, "dh": dh})
	return out


# ── renderer ─────────────────────────────────────────────────────────────────
func _process(_delta: float) -> void:
	queue_redraw()   # camera/context may change; never advances native time


func _draw() -> void:
	_counters["draw_dispatch"] += 1
	_last_trace = []
	_last_render_error = ""
	var ctx := _read_render_context()
	if ctx.is_empty():
		return
	_ensure_font()
	var plan := build_draw_plan(ctx)
	for e in plan:
		if str(e["branch"]) == "num_atlas":
			if _num_atlas == null:
				# Source drawNumStr samples a prebuilt gradient/glow/outline atlas ("Pirata One" stack,
				# shadowBlur 12). None supplied: nothing is drawn, nothing faked.
				_counters["num_atlas_gap_skipped"] += 1
				e["op"] = "skipped_num_atlas_gap"
				_last_trace.append(e)
				continue
			# X.save(); X.globalAlpha=_ta; drawNumStr(...) → drawImage(atlas, d*48, ci*56, 48, 56, dx, dy, dw, dh)
			var mod := Color(1, 1, 1, float(e["alpha"]))
			var ci: int = int(e["ci"])
			var blits: Array[Dictionary] = []
			for r in (e["num_layout"] as Array):
				var rd: Dictionary = r
				var src := Rect2(float(int(rd["digit"]) * SRC_NUM_W), float(ci * SRC_NUM_H), float(SRC_NUM_W),
					float(SRC_NUM_H))
				var dst := Rect2(float(rd["dx"]), float(rd["dy"]), float(rd["dw"]), float(rd["dh"]))
				draw_texture_rect_region(_num_atlas, dst, src, mod)
				blits.append({"digit": int(rd["digit"]), "src": src, "dst": dst})
				_counters["num_atlas_digit_blits"] += 1
			_counters["num_atlas_drawn"] += 1
			e["op"] = "num_atlas_drawn"
			e["blits"] = blits
			_last_trace.append(e)
			continue
		if _font == null:
			e["op"] = "skipped_font_" + font_status
			_last_trace.append(e)
			continue
		var fsz: int = int(e["fsz"])
		if fsz <= 0:
			e["op"] = "skipped_nonpositive_font_size"
			_last_trace.append(e)
			continue
		var text: String = str(e["text"])
		var w: float = _font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz).x
		# textAlign center + textBaseline middle: baseline = y + (ascent - descent) / 2
		var base := Vector2(float(e["x"]) - w / 2.0,
			float(e["y"]) + (_font.get_ascent(fsz) - _font.get_descent(fsz)) / 2.0)
		var ow: float = float(e["ow"])
		var a: float = float(e["alpha"])
		var black := Color(0, 0, 0, a)
		for off in SRC_OUTLINE_OFFSETS:
			draw_string(_font, base + (off as Vector2) * ow, text, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz, black)
		draw_string(_font, base, text, HORIZONTAL_ALIGNMENT_LEFT, -1, fsz, Color(1, 1, 1, a))
		_counters["draw_general"] += 1
		e["op"] = "general_9_fills"
		e["rect"] = Rect2(float(e["x"]) - w / 2.0 - ow, float(e["y"]) - fsz / 2.0 - ow, w + 2.0 * ow,
			fsz + 2.0 * ow)
		_last_trace.append(e)


func _read_render_context() -> Dictionary:
	if not _render_context.is_valid():
		_last_render_error = "render_context_missing"
		_counters["render_context_errors"] += 1
		return {}
	var v: Variant = _render_context.call()
	if not (v is Dictionary):
		_last_render_error = "render_context_not_dictionary"
		_counters["render_context_errors"] += 1
		return {}
	var d: Dictionary = v
	for k in RENDER_CONTEXT_KEYS:
		if not d.has(k):
			_last_render_error = "render_context_missing_key:" + str(k)
			_counters["render_context_errors"] += 1
			return {}
	return d


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
		bold_mode = "wght_axis_900"
	else:
		# source requests weight 900; without a wght axis Godot can only embolden synthetically.
		fv.variation_embolden = 0.9
		bold_mode = "synthetic_embolden_0.9_no_wght_axis"
	_font = fv
	font_status = "loaded:" + LABEL_FONT_PATH


## JS truthiness for `x||default`: null, false, 0, NaN and "" are falsy.
static func js_truthy(v: Variant) -> bool:
	match typeof(v):
		TYPE_NIL:
			return false
		TYPE_BOOL:
			return v
		TYPE_INT:
			return v != 0
		TYPE_FLOAT:
			return v != 0.0 and not is_nan(v)
		TYPE_STRING, TYPE_STRING_NAME:
			return str(v) != ""
	return true
