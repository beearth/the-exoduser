extends SceneTree
## First tests + native pixel proof for the floating-text sink (addTxt L44452, update L36311, draw L55288).
##
## Headless tests (executor):
##   godot --headless --path <proj> -s res://port_modules/floating_text/test_first.gd -- \
##     [--only=g1,g2] [--json-out=/abs/out.json]
## Native pixel proof (executor, non-headless, auto-exits):
##   godot --path <proj> -s res://port_modules/floating_text/test_first.gd -- --render-proof=/abs/out.png
##
## Exit codes: 0 ok, 1 failures, 2 invalid arguments/selection, 3 render-proof needs a native display.
## Fixtures are fixed constructor providers. Native time only moves through explicit native_tick calls.

const PRODUCER_PATH := "res://port_modules/floating_text/producer.gd"   # literal path metadata
const SUITE := "floating_text_first"
const GROUPS: Array[String] = ["source_constants", "admission", "localization", "ring_overwrite", "order",
	"native_advance", "pause", "expiry", "whitelist_cull", "draw_formula", "num_branch_gap", "callers",
	"glyph_draw", "render_context_errors", "num_atlas_consumer", "num_atlas_draw"]
const EVIDENCE := {
	"source_constants": "semantic", "admission": "semantic", "localization": "semantic",
	"ring_overwrite": "semantic", "order": "semantic", "native_advance": "semantic", "pause": "semantic",
	"expiry": "semantic", "whitelist_cull": "semantic", "draw_formula": "semantic",
	"num_branch_gap": "semantic", "callers": "semantic", "glyph_draw": "draw_trace",
	"render_context_errors": "draw_trace",
	"num_atlas_consumer": "semantic (fixture-only diagnostic texture)",
	"num_atlas_draw": "draw_trace (fixture-only diagnostic texture; NOT original glyphs)",
}

# ── render proof (QA capture only; not game art) ─────────────────────────────
const PROOF_SIZE := Vector2i(640, 360)
const BACKDROP := Color(0.25, 0.28, 0.32, 1.0)   # opaque mid-grey QA backdrop so black outline is measurable


## Fixed source-shaped _T: ko → identity; else table hit or identity (L8876-8884 minus equipment composition).
class FixedLocale extends RefCounted:
	var lang: String = "ko"
	var table: Dictionary = {}

	func _init(p_lang: String, p_table: Dictionary) -> void:
		lang = p_lang
		table = p_table

	func t(s: Variant) -> Variant:
		if lang == "ko":
			return s
		if table.has(s):
			return table[s]
		return s


## Fixed render context (constructor only).
class FixedView extends RefCounted:
	var d: Dictionary = {}

	func _init(p: Dictionary) -> void:
		d = p

	func get_ctx() -> Dictionary:
		return d


var _producer_script: Script = null
var _results: Dictionary = {}
var _cur: String = ""


func _initialize() -> void:
	_main()


func _main() -> void:
	var args: Dictionary = _parse_args(OS.get_cmdline_user_args())
	_producer_script = load(PRODUCER_PATH) as Script
	if _producer_script == null:
		print(JSON.stringify({"suite": SUITE, "error": "producer_load_failed", "path": PRODUCER_PATH}))
		quit(2)
		return
	if args.has("--render-proof"):
		await _render_proof(str(args["--render-proof"]))
		return
	var selected: Array[String] = []
	if args.has("--only"):
		for g in str(args["--only"]).split(",", false):
			var name: String = str(g).strip_edges()
			if not GROUPS.has(name):
				_fail_args("invalid_selection: unknown group '%s'" % name)
				return
			if not selected.has(name):
				selected.append(name)
		if selected.is_empty():
			_fail_args("invalid_selection: empty --only")
			return
	else:
		selected.assign(GROUPS)
	for name in selected:
		_cur = name
		_results[name] = {"pass": 0, "fail": 0, "completed": false, "evidence_class": EVIDENCE[name],
			"checks": []}
		await call("g_" + name)
		if not bool(_results[name]["completed"]):
			_results[name]["fail"] = int(_results[name]["fail"]) + 1
			(_results[name]["checks"] as Array).append({"name": "group_completed", "ok": false,
				"detail": "group aborted before completion (runtime error)"})
	var failed: Array[String] = []
	var errored: Array[String] = []
	var tp: int = 0
	var tf: int = 0
	for name in selected:
		tp += int(_results[name]["pass"])
		tf += int(_results[name]["fail"])
		if int(_results[name]["fail"]) > 0:
			failed.append(name)
		if not bool(_results[name]["completed"]):
			errored.append(name)
	var out: Dictionary = {
		"suite": SUITE,
		"producer_path": PRODUCER_PATH,
		"executed_by": "executor_runtime (not Claude)",
		"display_server": DisplayServer.get_name(),
		"selected_groups": selected,
		"failed_groups": failed,
		"errored_groups": errored,
		"total_pass": tp,
		"total_fail": tf,
		"groups": _results,
	}
	var text: String = JSON.stringify(out, "  ")
	print(text)
	if args.has("--json-out"):
		var p: String = str(args["--json-out"])
		if p.is_absolute_path():
			var f: FileAccess = FileAccess.open(p, FileAccess.WRITE)
			if f != null:
				f.store_string(text)
				f.close()
			else:
				print("json-out open failed: " + p)
				tf += 1
		else:
			print("json-out must be absolute: " + p)
			tf += 1
	quit(0 if tf == 0 else 1)


# ── harness ──────────────────────────────────────────────────────────────────
func _parse_args(raw: PackedStringArray) -> Dictionary:
	var d: Dictionary = {}
	for a in raw:
		if a.begins_with("--"):
			var eq: int = a.find("=")
			if eq > 0:
				d[a.substr(0, eq)] = a.substr(eq + 1)
			else:
				d[a] = ""
	return d


func _fail_args(msg: String) -> void:
	print(JSON.stringify({"suite": SUITE, "error": msg, "valid_groups": GROUPS}))
	quit(2)


func _ck(name: String, cond: bool, detail: Variant = "") -> void:
	var g: Dictionary = _results[_cur]
	(g["checks"] as Array).append({"name": name, "ok": cond, "detail": str(detail)})
	if cond:
		g["pass"] = int(g["pass"]) + 1
	else:
		g["fail"] = int(g["fail"]) + 1


func _done() -> void:
	_results[_cur]["completed"] = true


func _frames(n: int) -> void:
	for _i in range(n):
		await process_frame


func _near(a: float, b: float, eps: float = 1e-6) -> bool:
	return absf(a - b) <= eps


func _view(over: Dictionary = {}) -> Dictionary:
	var d: Dictionary = {"float_text_enabled": true, "bt_active": true, "cam_x": 320.0, "cam_y": 180.0,
		"vw": 640.0, "vh": 360.0, "hi_fps": false}
	for k in over:
		d[k] = over[k]
	return d


## Untyped on purpose: producer methods are script methods, not Node2D natives.
func _mk(lang: String = "ko", view: Dictionary = {}, max_slots: int = 40):
	var loc := FixedLocale.new(lang, {"경직!": "Stagger!", "콤보 종료: ": "Combo End: "})
	var fv := FixedView.new(_view(view))
	var p = _producer_script.new(Callable(loc, "t"), Callable(fv, "get_ctx"), max_slots)
	_hold_fixture(p, [loc, fv])
	return p


## Callable does not keep its RefCounted target alive. Keep the fixed constructor providers
## strongly referenced for the producer's whole lifetime: a fixture-holder meta on the producer
## node plus a suite-level owners array. Read-only; providers are never written per frame.
var _fixture_owners: Array[RefCounted] = []


func _hold_fixture(p, owners: Array) -> void:
	var held: Array[RefCounted] = []
	for o in owners:
		held.append(o as RefCounted)
		_fixture_owners.append(o as RefCounted)
	(p as Node).set_meta("fixture_owners", held)


func _slot(p, i: int) -> Dictionary:
	var arr: Array = p.txts
	return arr[i]


# ── groups ───────────────────────────────────────────────────────────────────
func g_source_constants() -> void:
	var s: Script = _producer_script
	var c: Dictionary = s.get_script_constant_map()
	_ck("TXTS_MAX 40", int(c["SRC_TXTS_MAX"]) == 40)
	_ck("testbed TXTS_MAX 120", int(c["SRC_TXTS_MAX_TESTBED"]) == 120)
	_ck("default life 35", int(c["SRC_DEFAULT_LIFE"]) == 35)
	_ck("default sz 0", int(c["SRC_DEFAULT_SZ"]) == 0)
	_ck("rise .6", _near(float(c["SRC_RISE_PER_SP"]), 0.6))
	_ck("draw base sz 22", int(c["SRC_DRAW_BASE_SZ"]) == 22)
	_ck("num branch sz>=28", int(c["SRC_NUM_BRANCH_MIN_SZ"]) == 28)
	_ck("cull pads 200/120", int(c["SRC_CULL_PAD"]) == 200 and int(c["SRC_CULL_PAD_HIFPS"]) == 120)
	_ck("whitelist 8 entries", (c["SRC_WHITELIST"] as Array).size() == 8)
	_ck("outline offsets 8", (c["SRC_OUTLINE_OFFSETS"] as Array).size() == 8)
	_ck("num atlas cell 48x56", int(c["SRC_NUM_W"]) == 48 and int(c["SRC_NUM_H"]) == 56)
	_ck("num atlas 480x168", (c["SRC_NUM_ATLAS_SIZE"] as Vector2i) == Vector2i(480, 168))
	var p = _mk()
	_ck("constructor txts empty, next 0", (p.txts as Array).is_empty() and int(p.txt_next) == 0)
	p.free()
	_done()


func g_admission() -> void:
	var p = _mk()
	var ok: bool = p.add_txt(10.0, 20.0, "경직!", "#8888ff", 30)
	var s: Dictionary = _slot(p, 0)
	_ck("accepted", ok)
	_ck("pool filled to 40", (p.txts as Array).size() == 40)
	_ck("x/y caller", _near(float(s["x"]), 10.0) and _near(float(s["y"]), 20.0))
	_ck("t/c caller", str(s["t"]) == "경직!" and str(s["c"]) == "#8888ff")
	_ck("life=ml=30", _near(float(s["life"]), 30.0) and _near(float(s["ml"]), 30.0))
	_ck("sz||0", _near(float(s["sz"]), 0.0))
	_ck("_numStr||null", s["_numStr"] == null)
	_ck("next 1", int(p.txt_next) == 1)
	var fresh: Dictionary = _slot(p, 1)
	_ck("unused slot shape", str(fresh["t"]) == "" and str(fresh["c"]) == "#fff" and _near(float(fresh["life"]), 0.0))
	p.add_txt(0.0, 0.0, "a", "#fff")
	_ck("l undefined → 35", _near(float(_slot(p, 1)["life"]), 35.0) and _near(float(_slot(p, 1)["ml"]), 35.0))
	p.add_txt(0.0, 0.0, "b", "#fff", 0)
	_ck("l 0 → 35", _near(float(_slot(p, 2)["life"]), 35.0))
	p.add_txt(0.0, 0.0, "c", "#fff", NAN)
	_ck("l NaN → 35", _near(float(_slot(p, 3)["life"]), 35.0))
	p.add_txt(0.0, 0.0, "d", "#fff", -5)
	_ck("l -5 kept (truthy)", _near(float(_slot(p, 4)["life"]), -5.0))
	p.add_txt(0.0, 0.0, "e", "#fff", 45, 48, "123")
	var s5: Dictionary = _slot(p, 5)
	_ck("sz 48 + numStr kept", _near(float(s5["sz"]), 48.0) and str(s5["_numStr"]) == "123")
	p.add_txt(0.0, 0.0, "f", "#fff", 45, 0, "")
	_ck("numStr '' → null", _slot(p, 6)["_numStr"] == null)
	_ck("admitted counter 7", int(p.get_counters()["admitted"]) == 7)
	p.free()
	var q = _producer_script.new(Callable(), Callable(), 40)
	var rej: bool = q.add_txt(1.0, 2.0, "x", "#fff", 10)
	_ck("no localizer → rejected, no pool", not rej and (q.txts as Array).is_empty())
	_ck("rejected counter", int(q.get_counters()["rejected_no_localizer"]) == 1)
	q.free()
	_done()


func g_localization() -> void:
	var p = _mk("en")
	p.add_txt(0.0, 0.0, "경직!", "#8888ff", 30)
	_ck("en _T at admission", str(_slot(p, 0)["t"]) == "Stagger!")
	p.add_txt(0.0, 0.0, "미번역", "#fff", 30)
	_ck("table miss → identity", str(_slot(p, 1)["t"]) == "미번역")
	p.add_txt(0.0, 0.0, "Stagger!", "#fff", 30)
	_ck("already-localised caller (_T(_T(s))) → identity", str(_slot(p, 2)["t"]) == "Stagger!")
	p.free()
	var k = _mk("ko")
	k.add_txt(0.0, 0.0, "경직!", "#8888ff", 30)
	_ck("ko identity", str(_slot(k, 0)["t"]) == "경직!")
	k.free()
	_done()


func g_ring_overwrite() -> void:
	var p = _mk()
	for i in range(40):
		p.add_txt(float(i), 0.0, "t%d" % i, "#fff", 30)
	_ck("next wraps to 0 after 40", int(p.txt_next) == 0)
	p.add_txt(999.0, 0.0, "new", "#fff", 30)
	_ck("41st overwrites slot 0", str(_slot(p, 0)["t"]) == "new" and _near(float(_slot(p, 0)["x"]), 999.0))
	_ck("slot 39 kept", str(_slot(p, 39)["t"]) == "t39")
	_ck("pool size stays 40", (p.txts as Array).size() == 40)
	_ck("next 1", int(p.txt_next) == 1)
	p.set_txts_max(120)
	p.add_txt(5.0, 0.0, "grow", "#fff", 30)
	_ck("testbed grow to 120", (p.txts as Array).size() == 120)
	_ck("grow resets next → wrote slot 0", str(_slot(p, 0)["t"]) == "grow" and int(p.txt_next) == 1)
	_ck("old slot 39 still present after grow", str(_slot(p, 39)["t"]) == "t39")
	p.add_txt(0.0, 0.0, "a", "#fff", 30)
	p.add_txt(0.0, 0.0, "b", "#fff", 30)
	_ck("next 3 before reset", int(p.txt_next) == 3)
	p.reset_source_txts()
	_ck("reset G.txts=[]", (p.txts as Array).is_empty())
	_ck("reset leaves _txtNext", int(p.txt_next) == 3)
	p.add_txt(0.0, 0.0, "after", "#fff", 30)
	_ck("refill after reset writes slot 0", str(_slot(p, 0)["t"]) == "after" and int(p.txt_next) == 1)
	p.free()
	_done()


func g_order() -> void:
	var p = _mk()
	for i in range(40):
		p.add_txt(100.0, 100.0, "old%d" % i, "#fff", 30)
	p.add_txt(100.0, 100.0, "newest", "#fff", 30)
	var plan: Array = p.build_draw_plan(_view())
	_ck("40 drawable", plan.size() == 40)
	_ck("slot order: newest (slot0) drawn first", str((plan[0] as Dictionary)["text"]) == "newest")
	_ck("slot 39 drawn last", str((plan[39] as Dictionary)["text"]) == "old39")
	var mono := true
	for i in range(plan.size()):
		if int((plan[i] as Dictionary)["slot"]) != i:
			mono = false
	_ck("plan slots ascending", mono)
	p.free()
	_done()


func g_native_advance() -> void:
	var p = _mk()
	p.add_txt(0.0, 100.0, "a", "#fff", 30)
	p.add_txt(0.0, 100.0, "b", "#fff", -2)
	p.native_tick(1.0)
	_ck("y -= .6", _near(float(_slot(p, 0)["y"]), 99.4))
	_ck("life -= 1", _near(float(_slot(p, 0)["life"]), 29.0))
	_ck("ml unchanged", _near(float(_slot(p, 0)["ml"]), 30.0))
	_ck("life<=0 slot frozen", _near(float(_slot(p, 1)["y"]), 100.0) and _near(float(_slot(p, 1)["life"]), -2.0))
	_ck("unused slot not moved", _near(float(_slot(p, 2)["y"]), 0.0))
	p.native_tick(0.5)
	_ck("fractional sp y", _near(float(_slot(p, 0)["y"]), 99.1, 1e-5))
	_ck("fractional sp life", _near(float(_slot(p, 0)["life"]), 28.5))
	_ck("x untouched (no velocity/jump)", _near(float(_slot(p, 0)["x"]), 0.0))
	_ck("native_ticks counter 2", int(p.get_counters()["native_ticks"]) == 2)
	p.free()
	_done()


func g_pause() -> void:
	var p = _mk()
	root.add_child(p)
	p.add_txt(320.0, 180.0, "무적", "#fff", 30)
	await _frames(6)
	_ck("_process/_draw frames add no native ticks", int(p.get_counters()["native_ticks"]) == 0)
	_ck("paused (no native_tick) → y unchanged", _near(float(_slot(p, 0)["y"]), 180.0))
	_ck("paused → life unchanged", _near(float(_slot(p, 0)["life"]), 30.0))
	var plan: Array = p.build_draw_plan(_view())
	_ck("still drawn while paused", plan.size() == 1)
	# Owner death independence: no owner reference exists; ticking continues independent of any actor.
	p.native_tick(1.0)
	_ck("resumes on next native tick", _near(float(_slot(p, 0)["life"]), 29.0))
	_ck("slot holds no owner field", not _slot(p, 0).has("owner") and _slot(p, 0).size() == 8)
	p.queue_free()
	await _frames(1)
	_done()


func g_expiry() -> void:
	var p = _mk()
	p.add_txt(100.0, 100.0, "콤보 종료: 12", "#ff6644", 60)
	for _i in range(59):
		p.native_tick(1.0)
	_ck("life 1 at tick 59", _near(float(_slot(p, 0)["life"]), 1.0))
	_ck("drawn at life 1", (p.build_draw_plan(_view()) as Array).size() == 1)
	p.native_tick(1.0)
	_ck("life 0 at tick 60", _near(float(_slot(p, 0)["life"]), 0.0))
	_ck("expired → not drawn", (p.build_draw_plan(_view()) as Array).is_empty())
	_ck("expired slot stays in pool", str(_slot(p, 0)["t"]) == "콤보 종료: 12")
	p.native_tick(1.0)
	_ck("no further movement after expiry", _near(float(_slot(p, 0)["life"]), 0.0) and _near(float(_slot(p, 0)["y"]), 64.0, 1e-4))
	var q = _mk()
	q.add_txt(0.0, 0.0, "x", "#fff", 2)
	q.native_tick(1.5)
	q.native_tick(1.5)
	_ck("overshoot negative life preserved", _near(float(_slot(q, 0)["life"]), -1.0))
	p.free()
	q.free()
	_done()


func g_whitelist_cull() -> void:
	var p = _mk()
	p.add_txt(320.0, 180.0, "경직!", "#8888ff", 30)
	p.add_txt(320.0, 180.0, "무적 3초", "#fff", 30)
	p.add_txt(320.0, 180.0, "777", "#fff", 30, 22, "777")
	var off: Array = p.build_draw_plan(_view({"bt_active": false}))
	var texts: Array = []
	for e in off:
		texts.append(str((e as Dictionary)["text"]))
	_ck("!_btActive: '경직!' filtered (not whitelisted)", not texts.has("경직!"))
	_ck("!_btActive: whitelisted substring drawn", texts.has("무적 3초"))
	_ck("!_btActive: numStr text drawn", texts.has("777"))
	_ck("_btActive: all drawn", (p.build_draw_plan(_view()) as Array).size() == 3)
	_ck("_FLOAT_TEXT_ENABLED false → none", (p.build_draw_plan(_view({"float_text_enabled": false})) as Array).is_empty())
	p.free()
	var c = _mk()
	c.add_txt(-200.0, 180.0, "edge", "#fff", 30)       # vl = 320-320-200 = -200 (inclusive)
	c.add_txt(-201.0, 180.0, "out", "#fff", 30)
	c.add_txt(320.0, 560.0, "bottom", "#fff", 30)      # vb = 180+180+200 = 560
	c.add_txt(-121.0, 180.0, "hifps_out", "#fff", 30)
	var n0: Array = c.build_draw_plan(_view())
	var names: Array = []
	for e in n0:
		names.append(str((e as Dictionary)["text"]))
	_ck("cull edge inclusive", names.has("edge") and names.has("bottom"))
	_ck("cull beyond pad", not names.has("out"))
	_ck("pad 200 keeps x=-121", names.has("hifps_out"))
	var n1: Array = c.build_draw_plan(_view({"hi_fps": true}))
	var names1: Array = []
	for e in n1:
		names1.append(str((e as Dictionary)["text"]))
	_ck("_hiFPS pad 120 culls x=-121", not names1.has("hifps_out") and not names1.has("edge"))
	_ck("cull leaves pool untouched", (c.txts as Array).size() == 40 and _near(float(_slot(c, 1)["life"]), 30.0))
	c.free()
	_done()


func g_draw_formula() -> void:
	var p = _mk()
	p.add_txt(100.0, 100.0, "a", "#fff", 30)
	var e0: Dictionary = (p.build_draw_plan(_view()) as Array)[0]
	_ck("age0 alpha 1", _near(float(e0["alpha"]), 1.0))
	_ck("age0 bn 1.5", _near(float(e0["bn"]), 1.5))
	_ck("age0 fsz ~~(22*1.5)=33", int(e0["fsz"]) == 33)
	_ck("age0 ow max(1,~~(33*.06))=1", int(e0["ow"]) == 1)
	_ck("sz<36 no shake", _near(float(e0["sk"]), 0.0))
	_ck("general colour ignored (white fill)", str(e0["branch"]) == "general")
	for _i in range(3):
		p.native_tick(1.0)
	var e1: Dictionary = (p.build_draw_plan(_view()) as Array)[0]
	var age: float = 0.1
	var pt: float = 0.5
	var bn: float = 1.0 + 0.5 * (1.0 - pt) * (1.0 - pt) * cos(pt * PI * 2.0)
	_ck("age .1 bn", _near(float(e1["bn"]), bn, 1e-6))
	_ck("age .1 fsz", int(e1["fsz"]) == int(22.0 * bn))
	_ck("age .1 y moved", _near(float(e1["y"]), 100.0 - 1.8, 1e-5))
	for _i in range(21):
		p.native_tick(1.0)
	var e2: Dictionary = (p.build_draw_plan(_view()) as Array)[0]
	_ck("raw .2 (not > .2) → .2*5 = 1", _near(float(e2["alpha"]), 1.0, 1e-9))
	p.native_tick(1.0)
	var e3: Dictionary = (p.build_draw_plan(_view()) as Array)[0]
	_ck("raw 5/30 → alpha 5/6", _near(float(e3["alpha"]), (5.0 / 30.0) * 5.0, 1e-6))
	_ck("late bn 1", _near(float(e3["bn"]), 1.0) and int(e3["fsz"]) == 22)
	var s = _mk()
	s.add_txt(50.0, 50.0, "big", "#fff", 100, 40)
	s.native_tick(10.0)
	var es: Dictionary = (s.build_draw_plan(_view()) as Array)[0]
	var want_sk: float = sin(0.1 * 80.0) * (1.0 - 0.1 * 3.3) * 3.0
	_ck("sz40 age .1 shake", _near(float(es["sk"]), want_sk, 1e-6))
	_ck("shake applied to x only", _near(float(es["x"]), 50.0 + want_sk, 1e-6) and _near(float(es["y"]), 44.0, 1e-5))
	_ck("sz40 ow ~~(fsz*.06)", int(es["ow"]) == maxi(1, int(int(es["fsz"]) * 0.06)))
	s.native_tick(25.0)
	_ck("age .35 no shake", _near(float((s.build_draw_plan(_view()) as Array)[0]["sk"]), 0.0))
	p.free()
	s.free()
	_done()


func g_num_branch_gap() -> void:
	var p = _mk()
	p.add_txt(200.0, 100.0, "123", "#ff0000", 45, 48, "123")
	p.add_txt(200.0, 100.0, "45", "#fff", 45, 27, "45")
	p.add_txt(200.0, 100.0, "88", "#66ddff", 45, 48, "88")
	var plan: Array = p.build_draw_plan(_view())
	var a: Dictionary = plan[0]
	_ck("sz48+numStr → num_atlas branch", str(a["branch"]) == "num_atlas")
	_ck("sc = (bSz/48)*bn", _near(float(a["sc"]), 1.5))
	_ck("crit colour row 1", int(a["ci"]) == 1)
	_ck("shield colour row 2", int((plan[2] as Dictionary)["ci"]) == 2)
	_ck("sz27+numStr → general branch", str((plan[1] as Dictionary)["branch"]) == "general")
	var lay: Array = a["num_layout"]
	var sc: float = 1.0 * 1.5
	var gap: int = int(18.0 * sc)
	_ck("3 digit rects", lay.size() == 3)
	_ck("dw/dh ~~(48*sc)/~~(56*sc)", int((lay[0] as Dictionary)["dw"]) == int(48.0 * sc) and int((lay[0] as Dictionary)["dh"]) == int(56.0 * sc))
	_ck("dx origin x - len*gap/2", int((lay[0] as Dictionary)["dx"]) == int(200.0 - 3.0 * gap / 2.0))
	_ck("dy y - NUM_H*sc/2", int((lay[0] as Dictionary)["dy"]) == int(100.0 - 56.0 * sc / 2.0))
	var lay2: Array = p.num_str_layout("1a2", 0.0, 0.0, 1.0)
	_ck("non-digit skipped but advances", lay2.size() == 2 and int((lay2[1] as Dictionary)["dx"]) == int(-27.0 + 2 * 18))
	_ck("colour index default 0", int(p.num_color_index("#ffffff")) == 0 and int(p.num_color_index("#cc0000")) == 1)
	p.free()
	_done()


func g_callers() -> void:
	var p = _mk()
	# shield_bash_reaction: _add_txt.call(px, py+TEXT_DY, TEXT_KEY, TEXT_COLOR, TEXT_LIFE)
	var cb: Callable = Callable(p, "add_txt")
	cb.call(300.0, 200.0 - 20.0, "경직!", "#8888ff", 30)
	var s0: Dictionary = _slot(p, 0)
	_ck("bash caller y-20/color/life", _near(float(s0["y"]), 180.0) and str(s0["c"]) == "#8888ff" and _near(float(s0["life"]), 30.0))
	# detonate_blast: _call("add_txt", [x, y, text, color, life]) (callv)
	cb.callv([10.0, 20.0, "💫 기절!", "#ffcc00", 32])
	_ck("callv array caller", str(_slot(p, 1)["t"]) == "💫 기절!" and _near(float(_slot(p, 1)["life"]), 32.0))
	# combo_expiry: addTxt(P.x,P.y-50,_T('콤보 종료: ')+G.combo,'#ff6644',60)
	cb.call(0.0, -50.0, "콤보 종료: " + str(12), "#ff6644", 60)
	_ck("combo caller", str(_slot(p, 2)["t"]) == "콤보 종료: 12" and _near(float(_slot(p, 2)["ml"]), 60.0))
	p.free()
	_done()


func g_glyph_draw() -> void:
	var p = _mk()
	root.add_child(p)
	p.add_txt(320.0, 180.0, "경직!", "#8888ff", 30)
	p.add_txt(320.0, 120.0, "999", "#ff0000", 45, 48, "999")
	await _frames(3)
	var c: Dictionary = p.get_counters()
	_ck("_draw dispatched", int(c["draw_dispatch"]) > 0, c)
	_ck("font loaded", str(p.font_status) == "loaded:res://assets/fonts/NotoSansKR.ttf", p.font_status)
	var tr: Array = p.get_last_trace()
	var ops: Array = []
	for e in tr:
		ops.append(str((e as Dictionary)["op"]))
	_ck("general glyph drawn with 9 fills", ops.has("general_9_fills"), ops)
	_ck("num atlas gap reported, not faked", ops.has("skipped_num_atlas_gap"), ops)
	_ck("draw_general counter", int(c["draw_general"]) > 0, c)
	_ck("draw added no native ticks", int(c["native_ticks"]) == 0)
	p.queue_free()
	await _frames(1)
	_done()


func g_render_context_errors() -> void:
	var p = _producer_script.new(Callable(FixedLocale.new("ko", {}), "t"), Callable(), 40)
	root.add_child(p)
	p.add_txt(320.0, 180.0, "무적", "#fff", 30)
	await _frames(2)
	_ck("missing render context → error, nothing drawn", str(p.get_last_render_error()) == "render_context_missing"
		and (p.get_last_trace() as Array).is_empty())
	p.queue_free()
	var bad := FixedView.new({"cam_x": 0.0})
	var q = _producer_script.new(Callable(FixedLocale.new("ko", {}), "t"), Callable(bad, "get_ctx"), 40)
	root.add_child(q)
	q.add_txt(0.0, 0.0, "무적", "#fff", 30)
	await _frames(2)
	_ck("missing key → error", str(q.get_last_render_error()).begins_with("render_context_missing_key:"),
		q.get_last_render_error())
	q.queue_free()
	await _frames(1)
	_done()


## FIXTURE-ONLY diagnostic texture: solid colour per 48x56 cell, built in memory, never saved.
## It is not the source atlas and carries no glyph/gradient/glow/Pirata pixels.
func _diag_atlas(w: int = 480, h: int = 168) -> ImageTexture:
	var img: Image = Image.create(w, h, false, Image.FORMAT_RGBA8)
	for row in range(int(ceil(h / 56.0))):
		for col in range(int(ceil(w / 48.0))):
			var cell := Rect2i(col * 48, row * 56, 48, 56).intersection(Rect2i(0, 0, w, h))
			img.fill_rect(cell, Color(float(col) / 9.0, float(row) / 2.0, 1.0, 1.0))
	return ImageTexture.create_from_image(img)


func g_num_atlas_consumer() -> void:
	var p = _mk()
	_ck("default: no atlas, status absent", not bool(p.has_number_atlas()) and str(p.num_atlas_status) == "absent")
	_ck("null rejected", not bool(p.set_number_atlas(null)) and not bool(p.has_number_atlas()))
	var wrong: ImageTexture = _diag_atlas(48, 56)
	_ck("48x56 rejected (source atlas is 480x168)", not bool(p.set_number_atlas(wrong)))
	_ck("rejected status names size", str(p.num_atlas_status) == "rejected:size_48x56", p.num_atlas_status)
	var tex: ImageTexture = _diag_atlas()
	_ck("480x168 accepted", bool(p.set_number_atlas(tex)) and str(p.num_atlas_status) == "supplied")
	_ck("wrong size after valid keeps valid atlas", not bool(p.set_number_atlas(wrong))
		and bool(p.has_number_atlas()) and str(p.num_atlas_status) == "supplied")
	_ck("rejected counter 3", int(p.get_counters()["num_atlas_rejected"]) == 3)
	p.add_txt(200.0, 100.0, "123", "#ff0000", 45, 48, "123")
	_ck("plan branch independent of atlas", str(((p.build_draw_plan(_view()) as Array)[0] as Dictionary)["branch"]) == "num_atlas")
	_ck("atlas does not touch pool state", _near(float(_slot(p, 0)["life"]), 45.0) and int(p.txt_next) == 1)
	p.clear_number_atlas()
	_ck("clear → absent", not bool(p.has_number_atlas()) and str(p.num_atlas_status) == "absent")
	p.free()
	var loc := FixedLocale.new("ko", {})
	var fv := FixedView.new(_view())
	var q = _producer_script.new(Callable(loc, "t"), Callable(fv, "get_ctx"), 40, _diag_atlas())
	_hold_fixture(q, [loc, fv])
	_ck("constructor atlas supplied", bool(q.has_number_atlas()))
	q.free()
	_done()


func g_num_atlas_draw() -> void:
	var p = _mk()
	p.set_number_atlas(_diag_atlas())
	root.add_child(p)
	p.add_txt(320.0, 180.0, "123", "#ff0000", 45, 48, "123")   # crit row 1
	p.add_txt(320.0, 260.0, "9a0", "#66ddff", 10, 28, "9a0")   # shield row 2; 'a' skipped
	p.add_txt(320.0, 120.0, "무적", "#fff", 45)                # general after numbers
	for _i in range(9):
		p.native_tick(1.0)
	await _frames(3)
	var plan: Array = p.build_draw_plan(_view())
	var tr: Array = p.get_last_trace()
	_ck("trace order = slot order (3 entries)", tr.size() == 3 and int((tr[0] as Dictionary)["slot"]) == 0
		and int((tr[1] as Dictionary)["slot"]) == 1 and int((tr[2] as Dictionary)["slot"]) == 2, tr.size())
	if tr.size() == 3:
		var a: Dictionary = tr[0]
		var b: Dictionary = tr[1]
		_ck("123 drawn via atlas", str(a["op"]) == "num_atlas_drawn", a.get("op", ""))
		_ck("9a0 drawn via atlas", str(b["op"]) == "num_atlas_drawn", b.get("op", ""))
		_ck("general glyph still drawn", str((tr[2] as Dictionary)["op"]) == "general_9_fills")
		var ab: Array = a["blits"]
		_ck("123: 3 blits", ab.size() == 3)
		var src_ok := ab.size() == 3
		var want_digits: Array[int] = [1, 2, 3]
		for i in range(mini(3, ab.size())):
			var bl: Dictionary = ab[i]
			src_ok = src_ok and (bl["src"] as Rect2) == Rect2(float(want_digits[i] * 48), 56.0, 48.0, 56.0)
		_ck("123 src = (d*48, ci1*56, 48, 56)", src_ok)
		var lay: Array = (plan[0] as Dictionary)["num_layout"]
		var dst_ok := lay.size() == ab.size()
		for i in range(mini(lay.size(), ab.size())):
			var l: Dictionary = lay[i]
			dst_ok = dst_ok and (((ab[i] as Dictionary)["dst"]) as Rect2) == Rect2(float(l["dx"]), float(l["dy"]), float(l["dw"]), float(l["dh"]))
		_ck("123 dst = drawNumStr layout", dst_ok)
		_ck("123 alpha 1 (raw .8)", _near(float(a["alpha"]), 1.0))
		var bb: Array = b["blits"]
		_ck("9a0: non-digit skipped → 2 blits", bb.size() == 2)
		if bb.size() == 2:
			_ck("9a0 src row 2 digits 9,0", ((bb[0] as Dictionary)["src"] as Rect2) == Rect2(432.0, 112.0, 48.0, 56.0)
				and ((bb[1] as Dictionary)["src"] as Rect2) == Rect2(0.0, 112.0, 48.0, 56.0))
		_ck("9a0 alpha raw .1*5 = .5", _near(float(b["alpha"]), 0.5, 1e-6))
		_ck("9a0 ci 2", int(b["ci"]) == 2)
	var c: Dictionary = p.get_counters()
	_ck("blit counter multiple of 5 per frame", int(c["num_atlas_digit_blits"]) > 0 and int(c["num_atlas_digit_blits"]) % 5 == 0, c)
	_ck("no gap skips while supplied", int(c["num_atlas_gap_skipped"]) == 0)
	_ck("draw added no native ticks", int(c["native_ticks"]) == 9)
	p.clear_number_atlas()
	await _frames(2)
	var tr2: Array = p.get_last_trace()
	_ck("cleared → explicit gap again", tr2.size() == 3 and str((tr2[0] as Dictionary)["op"]) == "skipped_num_atlas_gap")
	p.queue_free()
	await _frames(1)
	_done()


# ── native viewport pixel proof ──────────────────────────────────────────────
func _render_proof(out_path: String) -> void:
	var res: Dictionary = {"mode": "render_proof", "suite": SUITE, "producer_path": PRODUCER_PATH,
		"out": out_path, "evidence_class": "pixels", "executed_by": "executor_runtime (not Claude)"}
	if not out_path.is_absolute_path() or not out_path.to_lower().ends_with(".png"):
		res["error"] = "render-proof path must be an absolute .png path"
		print(JSON.stringify(res))
		quit(2)
		return
	if DisplayServer.get_name() == "headless":
		res["error"] = "render-proof needs a native display runtime (not --headless)"
		print(JSON.stringify(res))
		quit(3)
		return
	var vp := SubViewport.new()
	vp.size = PROOF_SIZE
	vp.transparent_bg = false
	vp.disable_3d = true
	vp.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(vp)
	var bg := ColorRect.new()
	bg.color = BACKDROP
	bg.size = Vector2(PROOF_SIZE)
	vp.add_child(bg)
	# Same producer; fixed constructor providers. Canvas origin = world origin (cam centre 320,180).
	var n = _mk("ko", {"bt_active": true})
	vp.add_child(n)
	n.add_txt(450.0, 190.0, "무적", "#ffcc00", 20, 40)        # B: will fade to raw .1 → alpha .5
	n.add_txt(320.0, 300.0, "expired", "#ffffff", 5)          # D: expires before capture
	for _i in range(8):
		n.native_tick(1.0)
	n.add_txt(200.0, 192.0, "경직!", "#8888ff", 30)           # A: real bash caller
	n.add_txt(320.0, 80.0, "123", "#ff0000", 45, 48, "123")   # E: num atlas gap
	for _i in range(10):
		n.native_tick(1.0)
	await _frames(4)
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	var img: Image = vp.get_texture().get_image()
	var samples: Array = []
	var ok: bool = img != null and not img.is_empty()
	var by_text: Dictionary = {}
	for e in n.get_last_trace():
		by_text[str((e as Dictionary)["text"])] = e
	if ok:
		var a: Dictionary = by_text.get("경직!", {})
		if a.has("rect"):
			var st: Dictionary = _region_stats(img, a["rect"] as Rect2)
			samples.append({"name": "A 경직! white fill pixels", "ok": int(st["white"]) > 15, "got": st["white"], "want": "> 15"})
			samples.append({"name": "A 경직! black outline pixels", "ok": int(st["black"]) > 15, "got": st["black"], "want": "> 15"})
			samples.append({"name": "A caller colour #8888ff not used by general branch", "ok": int(st["blueish"]) == 0,
				"got": st["blueish"], "want": "0"})
			samples.append({"name": "A trace alpha 1 / fsz 22 / y 186", "ok": _near(float(a["alpha"]), 1.0)
				and int(a["fsz"]) == 22 and _near(float(a["y"]), 186.0, 1e-4), "got": [a["alpha"], a["fsz"], a["y"]]})
		else:
			samples.append({"name": "A drawn", "ok": false, "got": str(by_text.keys()), "want": "general_9_fills"})
		var b: Dictionary = by_text.get("무적", {})
		if b.has("rect"):
			var sb: Dictionary = _region_stats(img, b["rect"] as Rect2)
			var mx: float = float(sb["max_lum"])
			samples.append({"name": "B faded alpha .5: max lum between backdrop and white", "ok": mx > 0.4 and mx < 0.8,
				"got": mx, "want": "(0.4, 0.8)"})
			samples.append({"name": "B no full-white pixels", "ok": int(sb["white"]) == 0, "got": sb["white"], "want": "0"})
			samples.append({"name": "B trace alpha .5", "ok": _near(float(b["alpha"]), 0.5, 1e-5), "got": b["alpha"]})
		else:
			samples.append({"name": "B drawn", "ok": false, "got": str(by_text.keys()), "want": "general_9_fills"})
		var sd: Dictionary = _region_stats(img, Rect2(280.0, 270.0, 80.0, 40.0))
		samples.append({"name": "D expired region = backdrop only", "ok": int(sd["non_backdrop"]) == 0,
			"got": sd["non_backdrop"], "want": "0"})
		var e: Dictionary = by_text.get("123", {})
		samples.append({"name": "E numStr branch reported as atlas gap (not drawn)",
			"ok": str(e.get("op", "")) == "skipped_num_atlas_gap", "got": str(e.get("op", "<absent>"))})
		var se: Dictionary = _region_stats(img, Rect2(270.0, 30.0, 100.0, 90.0))
		samples.append({"name": "E region = backdrop only (gap, nothing faked)", "ok": int(se["non_backdrop"]) == 0,
			"got": se["non_backdrop"], "want": "0"})
		for s in samples:
			ok = ok and bool((s as Dictionary)["ok"])
	var err: int = ERR_INVALID_DATA
	if img != null and not img.is_empty():
		err = img.save_png(out_path)
	res["png_written"] = err == OK
	res["proof_ok"] = ok and err == OK
	res["samples"] = samples
	res["viewport_size"] = [PROOF_SIZE.x, PROOF_SIZE.y]
	res["native_ticks_explicit"] = 18
	res["display_server"] = DisplayServer.get_name()
	res["rendering_method"] = RenderingServer.get_current_rendering_method()
	res["rendering_driver"] = RenderingServer.get_current_rendering_driver_name()
	res["msaa_2d_requested"] = "disabled (gl_compatibility/GLES3 has no effective 2D MSAA; none claimed)"
	res["counters"] = n.get_counters()
	res["font_status"] = str(n.font_status)
	res["bold_mode"] = str(n.bold_mode)
	res["backdrop"] = "opaque mid-grey QA backdrop (not game art)"
	res["visual_verdict"] = "RETOUCH (no source-canvas comparison; textBaseline middle approximated; num atlas gap)"
	print(JSON.stringify(res, "  "))
	quit(0 if res["proof_ok"] else 1)


func _region_stats(img: Image, r: Rect2) -> Dictionary:
	var white: int = 0
	var black: int = 0
	var blueish: int = 0
	var non_bg: int = 0
	var max_lum: float = 0.0
	var x0: int = maxi(0, int(floor(r.position.x)))
	var y0: int = maxi(0, int(floor(r.position.y)))
	var x1: int = mini(img.get_width(), int(ceil(r.end.x)))
	var y1: int = mini(img.get_height(), int(ceil(r.end.y)))
	for yy in range(y0, y1):
		for xx in range(x0, x1):
			var c: Color = img.get_pixel(xx, yy)
			var lum: float = c.get_luminance()
			max_lum = maxf(max_lum, lum)
			if c.r > 0.9 and c.g > 0.9 and c.b > 0.9:
				white += 1
			if lum < 0.08:
				black += 1
			if c.b - c.r > 0.15 and c.b - c.g > 0.15:
				blueish += 1
			if absf(c.r - BACKDROP.r) > 0.02 or absf(c.g - BACKDROP.g) > 0.02 or absf(c.b - BACKDROP.b) > 0.02:
				non_bg += 1
	return {"white": white, "black": black, "blueish": blueish, "non_backdrop": non_bg, "max_lum": max_lum}
