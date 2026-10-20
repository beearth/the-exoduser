extends SceneTree
## META-06 pure gates; clocks are explicitly injected local civil days.
const POLICY = preload("res://scripts/native_meta_exp_gate_policy.gd")
const CURVE = preload("res://scripts/native_source_meta_exp_curve.gd")
const USERDIR := "EXODUSER-meta-06-Isolated-20261020"
const TODAY := "2026-10-20"
const TOMORROW := "2026-10-21"
var assertions := 0
var failures := 0
var rows: Array = []
func _initialize() -> void: call_deferred("_run")
func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("META06_FAIL ", label)
func equal(a: Variant, b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):
		return (is_nan(float(a)) and is_nan(float(b))) or float(a) == float(b)
	if typeof(a) != typeof(b): return false
	if a is Dictionary:
		if a.size() != b.size(): return false
		for key in a:
			if not b.has(key) or not equal(a[key], b[key]): return false
		return true
	if a is Array:
		if a.size() != b.size(): return false
		for i in range(a.size()):
			if not equal(a[i], b[i]): return false
		return true
	return a == b
func encode(value: Variant) -> Variant:
	if value is float and not is_finite(value):
		return {"$number": "NaN" if is_nan(value) else ("Infinity" if value > 0 else "-Infinity")}
	if value is Array:
		var result: Array = []
		for entry in value: result.append(encode(entry))
		return result
	if value is Dictionary:
		var result := {}
		for key in value: result[key] = encode(value[key])
		return result
	return value
func state(level: int = 1000) -> Dictionary:
	return {"lv":level,"exp":0,"maxExp":CURVE.required_exp(level),"sp":7,"ap":2,
		"_transLvDate":TODAY,"_transLvCount":0,"marker":"untouched"}
func probe(method: String, args: Array) -> Variant:
	var before := args.duplicate(true)
	var actual: Variant
	match method:
		"date_key": actual = POLICY.date_key(args[0],args[1],args[2])
		"transcendence_gate": actual = POLICY.transcendence_gate(args[0],args[1])
		"entry_gate": actual = POLICY.entry_gate(args[0],args[1],args[2])
		"loop_gate": actual = POLICY.loop_gate(args[0],args[1],args[2])
		"after_level_up": actual = POLICY.after_level_up(args[0])
		"fixture_grant": actual = fixture_grant(args[0],args[1],args[2],args[3])
	check(equal(args,before), "inputs untouched: " + method)
	rows.append({"method":method,"args":encode(args),"actual":encode(actual)})
	return actual
func clock_day(s: Dictionary, demo: bool, days: Array, cursor: Dictionary) -> String:
	if s.lv >= 1000 and not (demo and s.lv >= 100):
		var day: String = days[mini(cursor.calls,days.size()-1)]
		cursor.calls += 1
		return day
	return TODAY # ignored by the gate; no clock read at this source branch.
func fixture_grant(s: Dictionary, demo: bool, value: float, days: Array) -> Dictionary:
	# Test-only composition of gate stages+META-01 curve and source SP/AP lines.
	# trans=true fixed XP isolates gates. No State, queue/heal/UI/save caller.
	var cursor := {"calls":0}
	var entry: Dictionary = probe("entry_gate",[s,demo,clock_day(s,demo,days,cursor)])
	var next: Dictionary = entry.state
	var levels := 0; var ap_gain := 0
	if entry.allowed:
		next.exp += value
		while next.exp >= next.maxExp:
			var gate: Dictionary = probe("loop_gate",[next,demo,clock_day(next,demo,days,cursor)])
			next = gate.state
			if not gate.allowed: break
			next.lv += 1; levels += 1; next.exp -= next.maxExp
			next.maxExp = CURVE.required_exp(next.lv)
			next.sp += 3
			if int(next.lv) % 2 == 0:
				next.ap += 1; ap_gain += 1
			next = probe("after_level_up",[next])
	return {"state":next,"levels":levels,"ap_gain":ap_gain,"clock_reads":cursor.calls}
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		push_error("META06 isolated override required")
		quit(2)
		return
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated user path")
	for row in [[2026,1,9,"2026-01-09"],[2026,10,20,TODAY],[2026,10,21,TOMORROW],[2024,2,29,"2024-02-29"],[7,1,2,"7-01-02"],[2026,12,31,"2026-12-31"],[2027,1,1,"2027-01-01"]]:
		check(probe("date_key",[row[0],row[1],row[2]]) == row[3], "local civil date formatting")
	var s := state(); var result: Dictionary
	for old_day in [null,"","2026-10-19",TOMORROW,0,false]:
		s = state(); s._transLvDate = old_day; s._transLvCount = 99
		result = probe("transcendence_gate",[s,TODAY])
		check(result.allowed and result.state._transLvDate == TODAY and result.state._transLvCount == 0, "changed/falsy/non-string date resets before comparison")
	s = state(); s._transLvCount = 1
	result = probe("transcendence_gate",[s,TODAY])
	check(not result.allowed and result.state._transLvCount == 1, "same day second level blocked")
	s = state(); s.erase("_transLvDate"); s.erase("_transLvCount")
	result = probe("transcendence_gate",[s,TODAY])
	check(result.allowed and result.state._transLvCount == 0, "new character absent date/count initialized at first check")
	s = state(); s.erase("_transLvCount")
	result = probe("transcendence_gate",[s,TODAY])
	check(not result.allowed and not result.state.has("_transLvCount"), "current date missing count stays undefined; no invented zero")
	s = state(); s._transLvCount = NAN
	check(not probe("transcendence_gate",[s,TODAY]).allowed, "NaN count fails source comparison")
	for level in [100,1000]:
		s = state(level); s.exp = 0; s._transLvDate = "2026-10-19"; s._transLvCount = 9
		result = probe("entry_gate",[s,true,TODAY])
		check(not result.allowed and result.reason == "demo" and result.state.exp == 0 and result.state._transLvDate == "2026-10-19" and result.state._transLvCount == 9, "demo precedes daily and entry min never increases XP")
		s.exp = s.maxExp + 17
		result = probe("entry_gate",[s,true,TODAY])
		check(result.state.exp == s.maxExp-1, "demo entry excess clamped")
		result = probe("loop_gate",[s,true,TODAY])
		check(not result.allowed and result.state.exp == s.maxExp-1, "demo loop directly clamps")
	s = state(); s._transLvCount = 1; s.exp = 5
	result = probe("entry_gate",[s,false,TODAY])
	check(not result.allowed and result.reason == "daily" and result.state.exp == 5, "daily entry preserves XP below cap")
	# Direct branch probe exposes source assignment vs min. Real loop callers
	# invoke only when exp>=maxExp; this is not an extra product XP award path.
	result = probe("loop_gate",[s,false,TODAY])
	check(result.state.exp == s.maxExp-1, "loop branch assignment differs from entry min")
	s = state(999); s._transLvDate = "2026-10-19"; s._transLvCount = 7
	result = probe("entry_gate",[s,false,TODAY])
	check(result.allowed and equal(result.state,s), "sub1000 gate does not read/reset date")
	s.lv = 1000
	check(equal(probe("after_level_up",[s]),s), "arrival1000 consumes no daily count, even legacy count7 unchanged")
	s.lv = 1001
	result = probe("after_level_up",[s])
	check(result._transLvCount == 8 and result._transLvDate == "2026-10-19", "arrival>1000 increments only count, no date reset or new clamp")
	s = state(1001); s.erase("_transLvCount")
	check(probe("after_level_up",[s])._transLvCount == 1, "post-increment absent count uses source ||0")
	s._transLvCount = NAN
	check(probe("after_level_up",[s])._transLvCount == 1, "post-increment NaN fallback0")
	s = state(999); s._transLvDate = "2026-10-19"
	result = probe("fixture_grant",[s,false,s.maxExp,[TODAY]])
	check(result.levels == 1 and result.state.lv == 1000 and result.state.maxExp == 5010000 and result.state.exp == 0 and result.state._transLvCount == 0 and result.state._transLvDate == "2026-10-19" and result.clock_reads == 0, "999->1000 no count or date check after loop exhausted")
	s = state(1000)
	result = probe("fixture_grant",[s,false,s.maxExp,[TODAY]])
	check(result.levels == 1 and result.state.lv == 1001 and result.state.maxExp == 5040000 and result.state._transLvCount == 1 and result.clock_reads == 2, "1000->1001 consumes1; entry and loop reread day")
	var second: Dictionary = probe("fixture_grant",[result.state,false,99999999,[TODAY]])
	check(second.levels == 0 and second.state.exp == 0 and second.state.sp == result.state.sp and second.clock_reads == 1, "same-day next XP grant rejected before addition")
	second = probe("fixture_grant",[result.state,false,5040000,[TOMORROW]])
	check(second.levels == 1 and second.state.lv == 1002 and second.state._transLvCount == 1 and second.state._transLvDate == TOMORROW, "local midnight reopens one level")
	s = state(999)
	result = probe("fixture_grant",[s,false,20000000,[TODAY]])
	check(result.levels == 2 and result.state.lv == 1001 and result.state.exp == 5039999 and result.state._transLvCount == 1 and result.clock_reads == 2, "multi-level999 grants1000 plus one transcend then clamps excess")
	s = state(1000)
	result = probe("fixture_grant",[s,false,20000000,[TODAY,TODAY,TOMORROW,TOMORROW]])
	check(result.levels == 2 and result.state.lv == 1002 and result.state.exp == 5089999 and result.state._transLvDate == TOMORROW and result.state._transLvCount == 1 and result.clock_reads == 4, "mid-grant local midnight uses fresh day every daily gate")
	s = state(99)
	result = probe("fixture_grant",[s,true,20000000,[TODAY]])
	check(result.levels == 1 and result.state.lv == 100 and result.state.exp == 844 and result.clock_reads == 0 and result.state.ap == 3, "demo99->100 stops inside while and grants even-level AP once")
	second = probe("fixture_grant",[result.state,true,20000000,[TOMORROW]])
	check(second.levels == 0 and second.state.exp == 844 and second.clock_reads == 0, "demo100 stops at entry without reading day")
	# Independent actual-output census across threshold/order/wallet boundaries.
	for level in [99,100,999,1000,1001]:
		for date in [null,TODAY,"2026-10-19"]:
			for count in [-1,0,0.5,1,2]:
				for offset in [-1,0,1]:
					for demo in [false,true]:
						s = state(level); s._transLvDate = date; s._transLvCount = count; s.exp = s.maxExp + offset
						probe("entry_gate",[s,demo,TODAY]); probe("loop_gate",[s,demo,TODAY])
	for level in [999,1000,1001,1002,1462]:
		for count in [-1,0,0.5,1,2,NAN]:
			s = state(level); s._transLvCount = count
			probe("after_level_up",[s])
	print("META06_ACTUALS ", JSON.stringify(rows))
	print("META06_RESULT ", JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_cases":rows.size(),"source_oracle_required":true,"main_booted":false,"product_writer_connected":false,"real_clock_read":false,"save_io":false,"userdir":OS.get_user_data_dir()}))
	quit(1 if failures else 0)
