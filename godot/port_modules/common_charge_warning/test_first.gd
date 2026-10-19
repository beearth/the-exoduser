extends SceneTree
## Isolated tests + actual-pixel render proof for port_modules/common_charge_warning/producer.gd.
##
## Usage (run from the godot/ project dir; nothing here touches existing scenes, saves, or human views):
##   godot --headless --path . -s res://port_modules/common_charge_warning/test_first.gd -- [opts]
##     --only=G01,G05            run only these group IDs
##     --rerun-failed=/abs.json  run only groups whose status was FAIL or INVALID in a previous report
##     --report=/abs.json        write a JSON report (per-group status + separated counters)
##   godot --path . -s res://port_modules/common_charge_warning/test_first.gd -- --render-proof=/abs/out.png [--lang=en]
##     non-headless native process: draws the fixed fixture with the SAME production producer into a
##     SubViewport, waits frames, reads get_texture().get_image(), saves PNG + <png>.json probes, exits.
##
## Exit codes: 0 pass, 1 FAIL, 2 INVALID/args/infra, 3 render-proof on dummy renderer (no actual pixels).
## Statuses: PASS / FAIL / INVALID (prerequisite missing, e.g. font) / SKIP_DUMMY (headless => no pixels).
## Expected values below are hand-derived from game.html source literals, not read back from the producer.

const PRODUCER := preload("res://port_modules/common_charge_warning/producer.gd")
const GROUP_IDS := ["G01", "G02", "G03", "G04", "G05", "G06", "G07", "G08", "G09", "G10", "G11", "G12"]
const GROUP_NAMES := {
	"G01": "source_constants_and_font",
	"G02": "native60_progress_boundary",
	"G03": "physical_vs_magic_class_and_label",
	"G04": "color_selection_bean_rainbow_fire",
	"G05": "exact_geometry_ring_and_label_box",
	"G06": "cull_and_skip_rules",
	"G07": "clock_gameframe_vs_render_process",
	"G08": "readonly_providers",
	"G09": "actual_draw_dispatch_counters",
	"G10": "progress_polygon_modes_simple",
	"G11": "source_draw_order",
	"G12": "actual_viewport_pixels",
}
const WORLD := "ens-A"
const BG := "#3a4150"   # QA backdrop only (not game art)
const TOL := 0.035

var _producers: Array = []


class FakeActor extends RefCounted:
	## Object-backed actor: reads go through _get, any write is counted.
	var _data: Dictionary = {}
	var writes := 0
	func _init(d: Dictionary) -> void:
		_data = d
	func _get(property: StringName):
		return _data.get(String(property), null)
	func _set(property: StringName, _value) -> bool:
		writes += 1
		return true


func _initialize() -> void:
	_main.call_deferred()


func _main() -> void:
	var args := _parse_args(OS.get_cmdline_user_args())
	if args.has("__invalid"):
		printerr("[ccw] invalid args: ", args["__invalid"])
		quit(2)
		return
	if args.has("render-proof"):
		var code: int = await _render_proof(str(args["render-proof"]), str(args.get("lang", "ko")))
		quit(code)
		return
	var ids := _select_ids(args)
	if ids.is_empty():
		printerr("[ccw] no groups selected")
		quit(2)
		return
	var results: Array = []
	for id in ids:
		_producers = []
		var res: Dictionary = await _run_group(id)
		res["id"] = id
		res["name"] = GROUP_NAMES[id]
		res["counts"] = _sum_counts()
		for p in _producers:
			if is_instance_valid(p):
				p.queue_free()
		await process_frame
		results.append(res)
		print("[ccw] %s %-36s %-10s checks=%d native_method=%d renderer_dispatch=%d process=%d physics=%d %s" % [
			id, GROUP_NAMES[id], res["status"], res["checks"], res["counts"]["native_method"],
			res["counts"]["renderer_dispatch"], res["counts"]["process"], res["counts"]["physics"],
			"" if res["failures"].is_empty() else str(res["failures"])])
	var code := 0
	for r in results:
		if r["status"] == "FAIL":
			code = 1
	if code == 0:
		for r in results:
			if r["status"] == "INVALID":
				code = 2
	var actual_pixels := false
	for r in results:
		if r["id"] == "G12" and r["status"] == "PASS":
			actual_pixels = true
	print("[ccw] SUMMARY exit=%d ACTUAL_PIXELS=%s display=%s" % [code, str(actual_pixels), DisplayServer.get_name()])
	if args.has("report"):
		var f := FileAccess.open(str(args["report"]), FileAccess.WRITE)
		if f == null:
			printerr("[ccw] cannot write report ", args["report"])
			code = 2
		else:
			f.store_string(JSON.stringify({"exit": code, "actual_pixels": actual_pixels,
				"display": DisplayServer.get_name(), "results": _jsonable(results)}, "  "))
			f.close()
	quit(code)


func _run_group(id: String) -> Dictionary:
	match id:
		"G01": return _g01()
		"G02": return _g02()
		"G03": return _g03()
		"G04": return _g04()
		"G05": return _g05()
		"G06": return _g06()
		"G07": return await _g07()
		"G08": return await _g08()
		"G09": return await _g09()
		"G10": return _g10()
		"G11": return await _g11()
		"G12": return await _g12()
	return {"status": "INVALID", "checks": 0, "failures": ["unknown group"]}


# ── args / selection ─────────────────────────────────────────────────────────
func _parse_args(argv: PackedStringArray) -> Dictionary:
	var out := {}
	for a in argv:
		if not a.begins_with("--") or a.find("=") < 0:
			out["__invalid"] = a
			continue
		var k := a.substr(2, a.find("=") - 2)
		var v := a.substr(a.find("=") + 1)
		if not k in ["only", "rerun-failed", "report", "render-proof", "lang"]:
			out["__invalid"] = a
			continue
		if k in ["rerun-failed", "report", "render-proof"] and not v.is_absolute_path():
			out["__invalid"] = a + " (absolute path required)"
			continue
		out[k] = v
	return out


func _select_ids(args: Dictionary) -> Array:
	var ids: Array = GROUP_IDS.duplicate()
	if args.has("only"):
		ids = []
		for s in str(args["only"]).split(",", false):
			var u := s.strip_edges().to_upper()
			if u in GROUP_IDS and not u in ids:
				ids.append(u)
			elif not u in GROUP_IDS:
				printerr("[ccw] unknown group id ", u)
				return []
	if args.has("rerun-failed"):
		var txt := FileAccess.get_file_as_string(str(args["rerun-failed"]))
		var parsed = JSON.parse_string(txt)
		if not (parsed is Dictionary) or not (parsed.get("results") is Array):
			printerr("[ccw] unreadable rerun report ", args["rerun-failed"])
			return []
		var redo: Array = []
		for r in parsed["results"]:
			if r is Dictionary and str(r.get("status", "")) in ["FAIL", "INVALID"] and str(r.get("id", "")) in ids:
				redo.append(str(r["id"]))
		ids = redo
	return ids


# ── fixtures / helpers ───────────────────────────────────────────────────────
func _enemy(id: String, x: float, y: float, r, el, t, col, bean, pclass, alive := true) -> Dictionary:
	return {"id": id, "alive": alive, "x": x, "y": y, "r": r, "el": el, "_projChargeT": t,
		"_projChargeCol": col, "_projChargeBean": bean, "_projChargeParryClass": pclass}


func _warn(owner_id: String, x: float, y: float, r: float, t: float, pclass, black: bool, col, dead := false,
		world := WORLD) -> Dictionary:
	return {"owner_id": owner_id, "world": world, "dead": dead, "x": x, "y": y, "r": r, "t": t,
		"parryClass": pclass, "blackBean": black, "col": col}


func _snap(enemies: Array, warnings: Array = [], gf := 0, lang := "ko") -> Dictionary:
	return {"game_frame": gf, "lang": lang, "world": WORLD, "enemies": enemies, "shot_warnings": warnings}


func _mk(in_tree := true) -> PRODUCER:
	var p: PRODUCER = PRODUCER.new()
	_producers.append(p)
	if in_tree:
		root.add_child(p)
	return p


func _sum_counts() -> Dictionary:
	var c := {"native_method": 0, "renderer_dispatch": 0, "process": 0, "physics": 0}
	for p in _producers:
		if is_instance_valid(p):
			c["native_method"] += p.api_call_count
			c["renderer_dispatch"] += p.draw_dispatch_count
			c["process"] += p.process_count
			c["physics"] += p.physics_count
	return c


func _res() -> Dictionary:
	return {"status": "PASS", "checks": 0, "failures": []}


func _ck(res: Dictionary, cond: bool, msg: String) -> void:
	res["checks"] += 1
	if not cond:
		res["failures"].append(msg)
		res["status"] = "FAIL"


func _near(a: float, b: float, eps := 1e-6) -> bool:
	return absf(a - b) <= eps


func _col_near(a: Color, b: Color, eps := 1e-3) -> bool:
	return absf(a.r - b.r) <= eps and absf(a.g - b.g) <= eps and absf(a.b - b.b) <= eps and absf(a.a - b.a) <= eps


func _one(list: Array, path: String, sid) -> Dictionary:
	for e in list:
		if e["path"] == path and e["source_id"] == sid:
			return e
	return {}


func _jsonable(v):
	if v is Dictionary:
		var d := {}
		for k in v:
			d[str(k)] = _jsonable(v[k])
		return d
	if v is Array:
		var a := []
		for x in v:
			a.append(_jsonable(x))
		return a
	if v is Color or v is Vector2 or v is Rect2:
		return str(v)
	return v


# ── G01 source constants + font dependency ──────────────────────────────────
func _g01() -> Dictionary:
	var res := _res()
	_ck(res, PRODUCER.LABEL_KO == "물리탄 차징 · E로 패링", "ko label literal L20555")
	_ck(res, PRODUCER.LABEL_EN == "PHYSICAL SHOT CHARGING · PARRY WITH E", "en label literal L20555")
	_ck(res, PRODUCER.BEAN_RAINBOW == ["#ff2244", "#ff8800", "#ffee00", "#00ff66", "#00ccff", "#8855ff", "#ff44cc"], "_BEAN_RAINBOW L15070")
	_ck(res, PRODUCER.TRACK_COLOR == "#080808" and _near(PRODUCER.TRACK_ALPHA, 0.28) and _near(PRODUCER.TRACK_WIDTH, 5.0), "track L24610")
	_ck(res, PRODUCER.PHYSICAL_STROKE == "#ffffff" and _near(PRODUCER.PHYSICAL_WIDTH, 6.0) and _near(PRODUCER.MAGIC_WIDTH, 3.5), "progress stroke L24613")
	_ck(res, PRODUCER.LABEL_FONT_SIZE == 13 and _near(PRODUCER.LABEL_H, 20.0) and _near(PRODUCER.LABEL_PAD_W, 14.0) and _near(PRODUCER.LABEL_OFFSET_Y, 25.0), "label box L24591-24598")
	_ck(res, _col_near(PRODUCER.LABEL_BG, Color(5 / 255.0, 8 / 255.0, 13 / 255.0, 0.92)) and PRODUCER.LABEL_STROKE == "#f4f4f4" and _near(PRODUCER.LABEL_STROKE_W, 1.5), "label colours L24599")
	var p := _mk(false)
	var f: Font = p.get_label_font()
	if f == null:
		res["status"] = "INVALID"
		res["failures"].append("font dependency missing: " + p.font_status)
	else:
		_ck(res, p.font_status == "loaded:res://assets/fonts/NotoSansKR.ttf", "font status " + p.font_status)
		res["note"] = "bold_mode=" + p.bold_mode
	return res


# ── G02 native60 progress boundary ──────────────────────────────────────────
func _g02() -> Dictionary:
	var res := _res()
	var p := _mk(false)
	var cases := [[60.0, 0.0, "none"], [59.0, 1.0 / 60.0, "capsule"], [45.0, 0.25, "capsule"], [30.0, 0.5, "capsule"],
		[60.5, 0.0, "none"], [0.5, 1.0 - 0.5 / 60.0, "piecewise"]]
	for c in cases:
		var l: Array = p.build_draw_list(_snap([_enemy("e", 0, 0, 14, 1, c[0], "#ff5522", "fire", "magic")]))
		_ck(res, l.size() == 1, "T=%s should draw" % c[0])
		if l.size() == 1:
			_ck(res, _near(l[0]["prog"], c[1]), "T=%s prog %s != %s" % [c[0], l[0]["prog"], c[1]])
			_ck(res, l[0]["mode"] == c[2], "T=%s mode %s != %s" % [c[0], l[0]["mode"], c[2]])
	for t in [0.0, -1.0, null]:
		var l2: Array = p.build_draw_list(_snap([_enemy("e", 0, 0, 14, 1, t, "#ff5522", "fire", "magic")]))
		_ck(res, l2.is_empty(), "T=%s must not draw (e._projChargeT>0 false)" % str(t))
	var lw: Array = p.build_draw_list(_snap([_enemy("o", 5, 5, 12, 0, 0, null, null, null)],
		[_warn("o", 0, 0, 12, 30.0, "magic", false, "#ffaa00")]))
	_ck(res, lw.size() == 1 and _near(lw[0]["prog"], 0.5), "queued w.t=30 prog .5")
	# magic alpha sa*(.8+prog*.2)
	var la: Array = p.build_draw_list(_snap([_enemy("e", 0, 0, 14, 1, 45.0, "#ff5522", "normal", "magic")]))
	_ck(res, _near(la[0]["alpha"], 0.85), "magic alpha at prog .25 = .85")
	return res


# ── G03 physical vs magic class + label ─────────────────────────────────────
func _g03() -> Dictionary:
	var res := _res()
	var p := _mk(false)
	_ck(res, PRODUCER.source_parry_class(0, null) == "physical", "el P, no parryClass => physical")
	_ck(res, PRODUCER.source_parry_class(null, null) == "physical", "el undefined => ??EL.P => physical")
	_ck(res, PRODUCER.source_parry_class(0, "magic") == "magic", "explicit parryClass wins")
	_ck(res, PRODUCER.source_parry_class(1, null) == "magic", "el F => magic")
	_ck(res, PRODUCER.source_parry_class(2, "physical") == "physical", "explicit physical wins")
	var en := [_enemy("phys", 0, 0, 14, 0, 30.0, "#bbbbbb", "normal", "physical"),
		_enemy("mag", 100, 0, 14, 3, 30.0, "#a44cff", "dark", "magic")]
	var ws := [_warn("phys", 0, 0, 14, 30.0, null, true, "#00aa00"),      # BlackBean: parryClass magic upstream
		_warn("phys", 0, 0, 22, 30.0, "magic", true, "#00aa00"),
		_warn("phys", 0, 0, 30, 30.0, "physical", false, "#f4f4f4")]
	for lang in ["ko", "en"]:
		var l: Array = p.build_draw_list(_snap(en, ws, 12, lang))
		_ck(res, l.size() == 5, "5 entries " + lang)
		var want: String = "물리탄 차징 · E로 패링" if lang == "ko" else "PHYSICAL SHOT CHARGING · PARRY WITH E"
		for e in l:
			if e["physical"]:
				_ck(res, e["label"] == want, "physical label " + lang)
				_ck(res, e["stroke_src"] == "#ffffff" and _near(e["width"], 6.0) and _near(e["alpha"], 1.0), "physical stroke white/6/1")
				_ck(res, e["passed_col"] == "#f4f4f4", "physical passed col #f4f4f4")
			else:
				_ck(res, e["label"] == "", "magic/BlackBean: no E label")
				_ck(res, _near(e["width"], 3.5), "magic width 3.5")
		_ck(res, not l[2]["physical"] and not l[3]["physical"], "BlackBean queued = magic (Q), never E")
		_ck(res, l[4]["physical"], "queued parryClass physical => label")
	# translated label for other language (_T) is honoured, never the ko text in non-ko mode
	var lt: Array = p.build_draw_list(_snap(en, [], 0, "ja"), {"physical_label": "XX"})
	_ck(res, lt[0]["label"] == "XX", "_T translation honoured")
	return res


# ── G04 colours ─────────────────────────────────────────────────────────────
func _g04() -> Dictionary:
	var res := _res()
	var p := _mk(false)
	var expect := {0: "#ff2244", 3: "#ff2244", 4: "#ff8800", 12: "#00ff66", 15: "#00ff66", 16: "#00ccff", 27: "#ff44cc", 28: "#ff2244"}
	for gf in expect:
		_ck(res, PRODUCER.rainbow_col(gf) == expect[gf], "rainbow gf=%d" % gf)
		var l: Array = p.build_draw_list(_snap([_enemy("b", 0, 0, 12, 0, 30.0, "#00aa00", "black", "magic")], [], gf))
		_ck(res, l[0]["stroke_src"] == expect[gf], "charge black bean gf=%d" % gf)
	var lf: Array = p.build_draw_list(_snap([_enemy("f", 0, 0, 12, 1, 30.0, "#123456", "fire", "magic")]))
	_ck(res, lf[0]["stroke_src"] == "#ff2e22", "fire bean overrides _projChargeCol")
	var ld: Array = p.build_draw_list(_snap([_enemy("d", 0, 0, 12, 3, 30.0, "#a44cff", "dark", "magic")]))
	_ck(res, ld[0]["stroke_src"] == "#a44cff", "dark uses _projChargeCol")
	var lq: Array = p.build_draw_list(_snap([_enemy("o", 0, 0, 12, 0, 0, null, null, null)],
		[_warn("o", 0, 0, 12, 30.0, "magic", false, ""), _warn("o", 0, 0, 20, 30.0, "magic", false, "#ffaa00"),
		_warn("o", 0, 0, 28, 30.0, "magic", true, "#00aa00")], 20))
	_ck(res, lq[0]["stroke_src"] == "#ff6644", "empty col => '#ff6644' fallback")
	_ck(res, lq[1]["stroke_src"] == "#ffaa00", "queued magic w.col")
	_ck(res, lq[2]["stroke_src"] == "#8855ff", "queued BlackBean rainbow (20>>2)%7=5")
	var li: Array = p.build_draw_list(_snap([_enemy("x", 0, 0, 12, 2, 30.0, "not-a-colour", "water", "magic")]))
	_ck(res, li[0]["color_status"] == "invalid_css_kept_track" and _col_near(li[0]["stroke"], Color("#080808")),
		"invalid strokeStyle ignored => track colour stays")
	return res


# ── G05 exact geometry (hand-derived) ───────────────────────────────────────
func _g05() -> Dictionary:
	var res := _res()
	var p := _mk(false)
	var l: Array = p.build_draw_list(_snap([_enemy("a", 100, 200, 14, 0, 45.0, "#bbbbbb", "normal", "physical"),
		_enemy("o", 300, 200, 12, 0, 0, null, null, null)],
		[_warn("o", 10, 10, 20, 30.0, "physical", false, "#f4f4f4"),
		_warn("o", 50, 60, 12, 50.0, "physical", false, "#f4f4f4", true)]))
	var a: Dictionary = l[0]
	_ck(res, _near(a["R"], 24.0), "R=r+10")
	_ck(res, _near(a["arc_start"], -PI / 2.0) and _near(a["arc_end"], 0.0, 1e-9), "arc -π/2 .. -π/2+2π*.25")
	_ck(res, _near(a["label_cy"], 161.0), "cy=y-r-25")
	if a.has("label_box"):
		var b: Rect2 = a["label_box"]
		_ck(res, _near(b.size.y, 20.0) and _near(b.position.y, 151.0), "bh=20, by=cy-10")
		_ck(res, a["label_tw"] > 0.0 and _near(b.size.x - a["label_tw"], 14.0), "bw=tw+14")
		_ck(res, _near(b.position.x + b.size.x / 2.0, 100.0), "box centred on x")
	else:
		res["status"] = "INVALID"
		res["failures"].append("label box needs font: " + str(a.get("label_missing", "")))
	var q: Dictionary = l[1]
	_ck(res, _near(q["x"], 300.0) and _near(q["y"], 200.0), "alive owner => live owner coords, not w.x/w.y")
	_ck(res, _near(q["R"], 30.0) and _near(q["label_cy"], 155.0), "lane radius w.r passthrough")
	var d: Dictionary = l[2]
	_ck(res, _near(d["x"], 50.0) and _near(d["y"], 60.0), "w.dead => stored w.x/w.y")
	_ck(res, _near(d["prog"], 1.0 / 6.0), "w.t=50 => 1/6")
	# Godot y-down == canvas y-down: angle -π/2 is screen-up
	var pts: PackedVector2Array = PRODUCER.capsule_polygon(Vector2(100, 200), 24.0, -PI / 2.0, 0.0, 6.0)
	_ck(res, pts[0].distance_to(Vector2(100, 200 - 27)) < 1e-4, "outer start point is above centre")
	return res


# ── G06 cull / skip ─────────────────────────────────────────────────────────
func _g06() -> Dictionary:
	var res := _res()
	var p := _mk(false)
	var l: Array = p.build_draw_list(_snap([
		_enemy("far", 100000, -50000, 14, 0, 30.0, "#bbbbbb", "normal", "physical"),
		_enemy("dead", 0, 0, 14, 0, 30.0, "#bbbbbb", "normal", "physical", false),
		_enemy("nocol", 0, 0, 14, 0, 30.0, "", "normal", "physical"),
		_enemy("deadowner", 700, 700, 14, 0, 0, null, null, null, false)],
		[_warn("deadowner", 0, 0, 14, 30.0, "magic", false, "#ffaa00"),
		_warn("deadowner", 0, 0, 14, 30.0, "magic", false, "#ffaa00", false, "ens-OLD"),
		_warn("ghost", 0, 0, 14, 30.0, "magic", false, "#ffaa00")]))
	_ck(res, _one(l, "proj_charge", "far").size() > 0, "no viewport cull in warning pass")
	_ck(res, _one(l, "proj_charge", "dead").is_empty(), "!e.alive skipped")
	_ck(res, _one(l, "proj_charge", "nocol").is_empty(), "falsy _projChargeCol skipped")
	var q: Dictionary = _one(l, "shot_warning", "deadowner")
	_ck(res, q.size() > 0 and _near(q["x"], 700.0), "queue has no alive check: dead owner still read until tick cancels")
	_ck(res, l.size() == 2, "world mismatch + unresolved owner skipped (got %d)" % l.size())
	var sk: Dictionary = p.get_skip_counts()
	var l2: Array = p.build_draw_list({"game_frame": 0, "enemies": [], "shot_warnings": [_warn("x", 0, 0, 12, 30.0, "magic", false, "#fff")]})
	_ck(res, l2.is_empty(), "no world identity => nothing matches w.world===ens")
	_ck(res, sk.is_empty(), "build_draw_list does not overwrite live skip counters")
	return res


# ── G07 clock: _gameFrame vs render process ─────────────────────────────────
func _g07() -> Dictionary:
	var res := _res()
	var p := _mk()
	var frame := {"game_frame": 12, "lang": "ko"}
	p.configure_fixed_snapshot(_snap([_enemy("b", 0, 0, 12, 0, 30.0, "#00aa00", "black", "magic"),
		_enemy("n", 60, 0, 12, 1, 15.0, "#ff5522", "normal", "magic")]), func(): return frame)
	for i in 6:
		await process_frame
	var e1: Array = p.get_entries()
	_ck(res, p.process_count >= 5, "process signals counted")
	_ck(res, e1[0]["stroke_src"] == "#00ff66", "gf 12 => rainbow[3]")
	_ck(res, _near(e1[1]["prog"], 0.75), "progress stays at snapshot T (no local countdown)")
	var dispatch_before: int = p.draw_dispatch_count
	for i in 6:
		await process_frame
	var e2: Array = p.get_entries()
	_ck(res, e2[0]["stroke_src"] == "#00ff66" and _near(e2[1]["prog"], 0.75), "render frames do not animate colour/progress")
	_ck(res, p.draw_dispatch_count > dispatch_before, "redraw dispatched while refreshing")
	frame["game_frame"] = 16
	await process_frame
	await process_frame
	_ck(res, p.get_entries()[0]["stroke_src"] == "#00ccff", "gf 16 => rainbow[4] (source update tick only)")
	_ck(res, p.physics_count == 0, "no physics signal")
	return res


# ── G08 read-only providers ─────────────────────────────────────────────────
func _g08() -> Dictionary:
	var res := _res()
	var src := _snap([_enemy("a", 10, 20, 14, 0, 45.0, "#bbbbbb", "normal", "physical")],
		[_warn("a", 1, 2, 14, 30.0, "magic", true, "#00aa00")], 8)
	var before := var_to_str(src)
	var p := _mk()
	p.configure(func(): return src)
	for i in 4:
		await process_frame
	_ck(res, var_to_str(src) == before, "dictionary snapshot unchanged")
	_ck(res, p.refresh_count >= 3, "provider polled by refresh")
	var actor := FakeActor.new({"id": "oa", "alive": true, "x": 40.0, "y": 50.0, "r": 12, "el": 0,
		"_projChargeT": 20.0, "_projChargeCol": "#bbbbbb", "_projChargeBean": "normal", "_projChargeParryClass": "physical"})
	var wobj := FakeActor.new({"owner": actor, "world": WORLD, "dead": false, "x": 0.0, "y": 0.0, "r": 12.0, "t": 10.0,
		"parryClass": "physical", "blackBean": false, "col": "#f4f4f4"})
	var p2 := _mk()
	p2.configure(func(): return {"game_frame": 0, "world": WORLD, "enemies": [actor], "shot_warnings": [wobj]})
	for i in 4:
		await process_frame
	_ck(res, actor.writes == 0 and wobj.writes == 0, "Object actors never written (writes=%d/%d)" % [actor.writes, wobj.writes])
	var ents: Array = p2.get_entries()
	_ck(res, ents.size() == 2 and _near(ents[1]["x"], 40.0), "Object actor/owner read via get()")
	var forbidden := ["tick", "advance", "fire", "cancel", "set_hp", "set_target", "inject_clock", "set_game_frame"]
	for m in p.get_script().get_script_method_list():
		_ck(res, not str(m["name"]) in forbidden, "no state-writing API: " + str(m["name"]))
	return res


# ── G09 actual draw dispatch / separate counters ────────────────────────────
func _g09() -> Dictionary:
	var res := _res()
	var p := _mk()
	p.auto_refresh = false
	p.configure_fixed_snapshot(_snap([_enemy("a", 100, 100, 14, 0, 45.0, "#bbbbbb", "normal", "physical"),
		_enemy("b", 200, 100, 14, 1, 30.0, "#ff5522", "fire", "magic")]))
	var n: int = p.refresh()
	await process_frame
	await process_frame
	_ck(res, n == 2, "refresh returns entry count")
	_ck(res, p.api_call_count == 2, "native API calls = configure + refresh (got %d)" % p.api_call_count)
	_ck(res, p.draw_dispatch_count >= 1, "actual _draw dispatched")
	var ops: Array = []
	for t in p.get_last_draw_trace():
		ops.append(t["op"])
	_ck(res, ops.count("track_ring") == 2 and ops.count("progress_capsule") == 2, "ring primitives drawn: " + str(ops))
	if p.font_status.begins_with("loaded") or p.font_status.begins_with("caller"):
		_ck(res, ops.count("label_box") == 1 and ops.count("label_text") == 1, "one physical label drawn")
	else:
		res["status"] = "INVALID"
		res["failures"].append("font missing: " + p.font_status)
	var d0: int = p.draw_dispatch_count
	await process_frame
	await process_frame
	_ck(res, p.draw_dispatch_count == d0, "no redraw without refresh when auto_refresh=false")
	_ck(res, p.process_count >= 3 and p.physics_count == 0, "process counted, physics 0")
	res["note"] = "dummy renderer still dispatches _draw; pixels are only proven by G12/--render-proof"
	return res


# ── G10 polygon modes ───────────────────────────────────────────────────────
func _g10() -> Dictionary:
	var res := _res()
	# magic R=22,w=3.5: threshold 1-asin(1.75/22)/π = 0.97466 ; physical R=24,w=6: 1-asin(3/24)/π = 0.96011
	_ck(res, PRODUCER.progress_mode(22.0, 3.5, 0.97) == "capsule", "magic .97 capsule")
	_ck(res, PRODUCER.progress_mode(22.0, 3.5, 0.98) == "piecewise", "magic .98 piecewise")
	_ck(res, PRODUCER.progress_mode(24.0, 6.0, 0.955) == "capsule", "phys .955 capsule")
	_ck(res, PRODUCER.progress_mode(24.0, 6.0, 0.965) == "piecewise", "phys .965 piecewise")
	_ck(res, PRODUCER.progress_mode(24.0, 6.0, 1.0) == "full", "prog 1 full")
	_ck(res, PRODUCER.progress_mode(24.0, 6.0, 0.0) == "none", "prog 0 none")
	_ck(res, PRODUCER.progress_mode(24.0, 6.0, 1e-6) == "dot", "zero-length arc => round-cap dot")
	for prog in [0.01, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95]:
		var pts: PackedVector2Array = PRODUCER.capsule_polygon(Vector2.ZERO, 24.0, -PI / 2.0, -PI / 2.0 + TAU * prog, 6.0)
		_ck(res, Geometry2D.triangulate_polygon(pts).size() > 0, "capsule triangulates prog=%s" % prog)
	var sp: PackedVector2Array = PRODUCER.sector_polygon(Vector2.ZERO, 24.0, -PI / 2.0, -PI / 2.0 + TAU * 0.99, 6.0)
	_ck(res, Geometry2D.triangulate_polygon(sp).size() > 0, "piecewise sector triangulates")
	return res


# ── G11 source draw order ───────────────────────────────────────────────────
func _g11() -> Dictionary:
	var res := _res()
	var p := _mk()
	p.configure_fixed_snapshot(_snap([_enemy("o", 0, 0, 12, 0, 0, null, null, null),
		_enemy("a", 100, 100, 14, 0, 45.0, "#bbbbbb", "normal", "physical")],
		[_warn("o", 0, 0, 12, 30.0, "physical", false, "#f4f4f4")]))
	await process_frame
	await process_frame
	if p.get_label_font() == null:
		return {"status": "INVALID", "checks": 0, "failures": ["font missing: " + p.font_status]}
	var ents: Array = p.get_entries()
	_ck(res, ents.size() == 2 and ents[0]["path"] == "proj_charge" and ents[1]["path"] == "shot_warning",
		"enemy charge pass before queued pass (L20549 then L20562)")
	var seq: Array = []
	for t in p.get_last_draw_trace():
		seq.append("%d:%s" % [t["entry"], t["op"]])
	var want := ["0:track_ring", "0:progress_capsule", "0:label_box", "0:label_text",
		"1:track_ring", "1:progress_capsule", "1:label_box", "1:label_text"]
	_ck(res, seq == want, "ring then label per entry: " + str(seq))
	return res


# ── G12 actual viewport pixels ──────────────────────────────────────────────
func _g12() -> Dictionary:
	var res := _res()
	if _is_dummy():
		res["status"] = "SKIP_DUMMY"
		res["note"] = "display=%s: dummy renderer has no pixels; run --render-proof in a non-headless native process" % DisplayServer.get_name()
		return res
	var out: Dictionary = await _render_fixture("", "ko")
	if out.has("error"):
		res["status"] = "INVALID"
		res["failures"].append(out["error"])
		return res
	for pr in out["probes"]:
		_ck(res, pr["pass"], "probe %s got %s want %s" % [pr["name"], pr["got"], pr["want"]])
	return res


# ── render proof ────────────────────────────────────────────────────────────
func _is_dummy() -> bool:
	return DisplayServer.get_name() == "headless" or RenderingServer.get_video_adapter_name() == ""


func render_fixture_snapshot(lang: String) -> Dictionary:
	# Representative source phases. Row A: common _projChargeT. Row B: queued G._shotWarnings. Row C: negatives.
	return {"game_frame": 12, "lang": lang, "world": WORLD,
		"enemies": [
			_enemy("A1_phys_T45", 170, 170, 14, 0, 45.0, "#bbbbbb", "normal", "physical"),
			_enemy("A2_fire_T30", 420, 170, 14, 1, 30.0, "#ff2e22", "fire", "magic"),
			_enemy("A3_phys_T6", 670, 170, 16, 0, 6.0, "#bbbbbb", "normal", "physical"),
			_enemy("A4_dark_T15", 920, 170, 14, 3, 15.0, "#a44cff", "dark", "magic"),
			_enemy("A5_water_T0.5", 1140, 170, 14, 2, 0.5, "#317cec", "water", "magic"),
			_enemy("B1_owner", 200, 420, 12, 0, 0, null, null, null),
			_enemy("B2_owner", 560, 420, 14, 0, 0, null, null, null),
			_enemy("B3_owner_moved", 5, 5, 12, 0, 0, null, null, null, false),
			_enemy("B4_owner", 1100, 420, 12, 0, 0, null, null, null),
			_enemy("C1_dead_T30", 300, 620, 14, 0, 30.0, "#bbbbbb", "normal", "physical", false),
			_enemy("C2_phys_T60", 700, 620, 14, 0, 60.0, "#bbbbbb", "normal", "physical"),
		],
		"shot_warnings": [
			_warn("B1_owner", 200, 420, 12, 30.0, "physical", false, "#f4f4f4"),
			_warn("B1_owner", 200, 420, 20, 30.0, "magic", false, "#ffaa00"),
			_warn("B2_owner", 560, 420, 14, 20.0, "magic", true, "#00aa00"),
			_warn("B3_owner_moved", 880, 420, 12, 50.0, "physical", false, "#f4f4f4", true),
			_warn("B4_owner", 1100, 420, 12, 30.0, "magic", false, "#ffaa00", false, "ens-OLD"),
		]}


func _render_proof(path: String, lang: String) -> int:
	if _is_dummy():
		printerr("[ccw] render-proof: dummy renderer (display=%s) => no actual pixels; NOT a proof" % DisplayServer.get_name())
		return 3
	if not DirAccess.dir_exists_absolute(path.get_base_dir()):
		printerr("[ccw] render-proof: output dir missing ", path.get_base_dir())
		return 2
	var out: Dictionary = await _render_fixture(path, lang)
	if out.has("error"):
		printerr("[ccw] render-proof: ", out["error"])
		return 2
	var f := FileAccess.open(path + ".json", FileAccess.WRITE)
	if f != null:
		f.store_string(JSON.stringify(_jsonable(out), "  "))
		f.close()
	var ok := true
	for pr in out["probes"]:
		ok = ok and pr["pass"]
		print("[ccw] probe %-28s %s got=%s want=%s" % [pr["name"], "PASS" if pr["pass"] else "FAIL", pr["got"], pr["want"]])
	print("[ccw] render-proof saved %s (+.json) ACTUAL_PIXELS=true probes=%s" % [path, "PASS" if ok else "FAIL"])
	return 0 if ok else 1


func _render_fixture(save_path: String, lang: String) -> Dictionary:
	var svp := SubViewport.new()
	svp.size = Vector2i(1280, 720)
	svp.transparent_bg = false
	svp.msaa_2d = Viewport.MSAA_4X
	svp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	var bg := ColorRect.new()
	bg.color = Color(BG)
	bg.size = Vector2(1280, 720)
	svp.add_child(bg)
	var p: PRODUCER = PRODUCER.new()
	_producers.append(p)
	svp.add_child(p)
	root.add_child(svp)
	var fixture := render_fixture_snapshot(lang)
	var before := var_to_str(fixture)
	p.configure(func(): return fixture)
	for i in 4:
		await process_frame
	for i in 3:
		await RenderingServer.frame_post_draw
	var img: Image = svp.get_texture().get_image()
	if img == null or img.is_empty():
		svp.queue_free()
		return {"error": "viewport get_image() empty (dummy renderer?)"}
	if save_path != "":
		var err := img.save_png(save_path)
		if err != OK:
			svp.queue_free()
			return {"error": "save_png failed %d" % err}
	var ents: Array = p.get_entries()
	var probes := _probes(img, ents)
	var out := {
		"producer_script": (PRODUCER as Script).resource_path,
		"display": DisplayServer.get_name(),
		"rendering_method": RenderingServer.get_current_rendering_method(),
		"adapter": RenderingServer.get_video_adapter_name(),
		"msaa_2d": "4x (fixture viewport; canvas-like AA for polygons)",
		"font_status": p.font_status, "bold_mode": p.bold_mode, "lang": lang,
		"counters": p.get_counters(), "trace_ops": p.get_last_draw_trace().size(),
		"fixture_unchanged": var_to_str(fixture) == before,
		"image_size": [img.get_width(), img.get_height()],
		"entries": ents, "probes": probes,
		"claims": "QA render of the common charge/queued-shot warning only; no public UI/gameplay/currentWeb claim",
	}
	svp.queue_free()
	return out


func _over(dst: Color, src_hex: String, a: float) -> Color:
	var s := Color(src_hex)
	return Color(lerpf(dst.r, s.r, a), lerpf(dst.g, s.g, a), lerpf(dst.b, s.b, a), 1.0)


func _px(img: Image, p: Vector2) -> Color:
	return img.get_pixel(clampi(int(floor(p.x)), 0, img.get_width() - 1), clampi(int(floor(p.y)), 0, img.get_height() - 1))


func _on_ring(cx: float, cy: float, radius: float, ang: float) -> Vector2:
	return Vector2(cx + cos(ang) * radius, cy + sin(ang) * radius)


func _probe(name: String, got: Color, want: Color) -> Dictionary:
	var ok := absf(got.r - want.r) <= TOL and absf(got.g - want.g) <= TOL and absf(got.b - want.b) <= TOL
	return {"name": name, "got": got.to_html(false), "want": want.to_html(false), "pass": ok}


func _probes(img: Image, ents: Array) -> Array:
	var bg := Color(BG)
	var trk := _over(bg, "#080808", 0.28)
	var out: Array = []
	# A1 physical prog .25: white arc -π/2..0, dark track elsewhere
	out.append(_probe("A1_progress_white", _px(img, _on_ring(170, 170, 24, -PI / 4.0)), Color("#ffffff")))
	out.append(_probe("A1_track_bottom", _px(img, _on_ring(170, 170, 24, PI / 2.0)), trk))
	# A2 fire magic prog .5, alpha .9 over track
	out.append(_probe("A2_fire_right", _px(img, _on_ring(420, 170, 24, 0.0)), _over(trk, "#ff2e22", 0.9)))
	out.append(_probe("A2_track_left", _px(img, _on_ring(420, 170, 24, PI)), trk))
	# A4 dark prog .75 alpha .95: arc -π/2..π, probe lower-left (3π/4)
	out.append(_probe("A4_dark_lower_left", _px(img, _on_ring(920, 170, 24, 3.0 * PI / 4.0)), _over(trk, "#a44cff", 0.95)))
	# B1 lane1 magic #ffaa00 prog .5 at R=30
	out.append(_probe("B1_lane1_right", _px(img, _on_ring(200, 420, 30, 0.0)), _over(trk, "#ffaa00", 0.9)))
	# B2 BlackBean gf12 => #00ff66, prog 2/3 alpha .8+.2*2/3
	out.append(_probe("B2_rainbow_right", _px(img, _on_ring(560, 420, 24, 0.0)), _over(trk, "#00ff66", 0.8 + 0.2 * 2.0 / 3.0)))
	# B3 dead warning at stored w.x/w.y (880,420) prog 1/6: white near top-right
	out.append(_probe("B3_dead_stored_pos", _px(img, _on_ring(880, 420, 22, -PI / 2.0 + PI / 6.0)), Color("#ffffff")))
	# negatives: world mismatch / dead enemy => untouched backdrop
	out.append(_probe("B4_world_mismatch_absent", _px(img, _on_ring(1100, 420, 22, 0.0)), bg))
	out.append(_probe("C1_dead_enemy_absent", _px(img, _on_ring(300, 620, 24, 0.0)), bg))
	# C2 T=60 => prog 0 => track only even at top
	out.append(_probe("C2_prog0_track_only_top", _px(img, _on_ring(700, 620, 24, -PI / 2.0 + 0.3)), trk))
	# A1 label: box fill, border, text pixels
	var a1: Dictionary = {}
	for e in ents:
		if e["source_id"] == "A1_phys_T45":
			a1 = e
	if a1.has("label_box"):
		var b: Rect2 = a1["label_box"]
		var cy: float = a1["label_cy"]
		out.append(_probe("A1_label_fill", _px(img, Vector2(b.position.x + 3.5, cy)), _over(bg, "#05080d", 0.92)))
		var best := Color(0, 0, 0)
		for dx in [-1, 0, 1]:
			var c := _px(img, Vector2(b.position.x + dx, cy))
			if c.get_luminance() > best.get_luminance():
				best = c
		out.append(_probe("A1_label_border", best, Color("#f4f4f4")))
		var bright := 0
		for yy in range(int(b.position.y) + 3, int(b.end.y) - 2):
			for xx in range(int(b.position.x) + 6, int(b.end.x) - 6):
				if img.get_pixel(xx, yy).get_luminance() > 0.7:
					bright += 1
		out.append({"name": "A1_label_text_pixels", "got": bright, "want": ">=40", "pass": bright >= 40})
	else:
		out.append({"name": "A1_label_font", "got": str(a1.get("label_missing", "")), "want": "font loaded", "pass": false})
	return out
