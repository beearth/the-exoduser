extends SceneTree
## META-04: source goldens, immutable inputs, plan gates and exported JS oracle cases.
const POLICY = preload("res://scripts/native_meta_point_policy.gd")
const USERDIR := "EXODUSER-meta-04-Isolated-20261020"
const CAPS := {"str": 500, "dex": 500, "int": 500, "vit": 500, "lck": 500}
const KEYS := ["pAtk","pCharge","pParry","pMagic","pBow","pGuard","pRegen","pCrit","pDrop","pPierce","pMRegen","pXbow","pMelee","pCombo","pAbund","pPred","pDot","pVital","pStamina","pMalice","pFortify","pArmor","pHunter","pHuman","pDemon","pRage"]
const GOLDENS := [
	["rank_cost", [0], 1], ["rank_cost", [3], 2], ["rank_cost", [6], 3], ["rank_cost", [9], 5],
	["rank_cost", [10], 5], ["rank_cost", [-1], 5], ["rank_cost", [0.5], 5], ["rank_cost", [NAN], 5],
	["stat_change", [490,500,10,10], {"value":500,"points":0}],
	["stat_change", [495,500,10,10], null], ["stat_change", [0,500,8,10], null],
	["stat_change", [0,500,8,-1], null], ["stat_change", [1,500,10,0], null],
	["stat_change", [1,500,10,0.5], null], ["stat_change", [1,500,10,true], null],
	["stat_change", [1,500,10,"1"], null], ["stat_change", [1,500,10,NAN], null],
	["stat_change", [900,INF,10,10], {"value":910,"points":0}],
	["stat_change", [910,INF,0,-10], {"value":900,"points":10}],
	["stat_change", [600,500,0,-1], null], ["stat_change", [600,500,0,-100], {"value":500,"points":100}],
	["stat_change", [10,500,-1,-2], {"value":8,"points":1}],
	["passive_change", [3,10,1,1], null], ["passive_change", [3,10,2,1], {"value":4,"points":0}],
	["passive_change", [1,10,0,-1], {"value":0,"points":1}],
	["passive_change", [10,20,5,1], {"value":11,"points":0}],
	["passive_change", [10,10,100,1], null], ["passive_change", [0,10,0,-1], null],
	["passive_change", [1,10,10,2], null], ["passive_change", [1,10,10,true], null],
	["passive_change", [0.5,10,5,1], {"value":1.5,"points":0}],
	["refund_totals", [{"str":20,"dex":10,"int":0,"lck":0,"vit":4},{"pAtk":10,"pMagic":4,"pGuard":0},7], {"sp":41,"ap":28}],
	["refund_totals", [{"str":-2,"vit":0.5},{"pAtk":10.1},1], {"sp":-0.5,"ap":28}],
	["refund_totals", [{"str":0},{"pAtk":-1},0], {"sp":0,"ap":0}],
	["grit_cost", [], 1], ["grit_batch_cost", [-1], 0], ["grit_batch_cost", [0.5], 0.5], ["grit_batch_cost", [1000000], 1000000],
]
var assertions := 0
var failures := 0
var rows: Array = []
func _initialize() -> void: call_deferred("_run")
func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("META04_FAIL ", label)
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
func probe(method: String, args: Array) -> Variant:
	var before := args.duplicate(true)
	var actual: Variant
	match method:
		"rank_cost": actual = POLICY.rank_cost(args[0])
		"stat_change": actual = POLICY.stat_change(args[0], args[1], args[2], args[3])
		"passive_change": actual = POLICY.passive_change(args[0], args[1], args[2], args[3])
		"refund_totals": actual = POLICY.refund_totals(args[0], args[1], args[2])
		"grit_cost": actual = POLICY.grit_cost()
		"grit_batch_cost": actual = POLICY.grit_batch_cost(args[0])
		"create_plan": actual = POLICY.create_plan(args[0])
		"evaluate_plan": actual = POLICY.evaluate_plan(args[0], args[1], args[2], args[3])
		_:
			check(false, "unknown policy method")
			return null
	check(equal(args, before), "inputs untouched: " + method)
	rows.append({"method": method, "args": encode(args), "actual": encode(actual)})
	return actual
func state() -> Dictionary:
	var passives := {}
	for key in KEYS: passives[key] = 0
	return {"stats":{"str":0,"dex":0,"int":0,"vit":0,"lck":0},"passives":passives,"grit":0,"sp":10,"ap":23,"hp":350}
func definitions() -> Array:
	var defs: Array = []
	for key in KEYS: defs.append({"key":key,"max":10})
	return defs
func evaluate(plan: Variant, live: Dictionary) -> Variant:
	return probe("evaluate_plan", [plan, live, CAPS.duplicate(), definitions()])
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		push_error("META04 isolated override required")
		quit(2)
		return
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated user path")
	for row in GOLDENS: check(equal(probe(row[0], row[1].duplicate(true)), row[2]), "source golden " + str(row[0]))
	var live := state()
	var plan: Dictionary = probe("create_plan", [live])
	plan.stats.str = 10
	check(plan.base.stats.str == 0 and live.stats.str == 0, "createPlan independent allocation snapshots")
	var next: Variant = evaluate(plan, live)
	check(next.sp == 0 and next.changes == 1 and next.spentSP == 10 and next.hp == 350, "exact full balance purchase")
	check(evaluate(plan, next) == null, "changed allocations reject same plan replay")
	next.stats.str = 99
	check(plan.stats.str == 10 and live.stats.str == 0, "result allocations do not alias plan/live")
	var noop: Dictionary = evaluate(probe("create_plan", [live]), live)
	check(noop.changes == 0 and noop.spentSP == 0 and noop.spentAP == 0, "source returns no-change result; writer decides no-op")
	check(evaluate(null, live) == null, "null plan refused")
	# SP/AP balances are not snapshotted in base: reread live balances.
	plan = probe("create_plan", [live]); plan.stats.str = 1
	live.sp = 1
	check(evaluate(plan, live).sp == 0, "wallet-only change does not stale the plan")
	live.sp = 0
	check(evaluate(plan, live) == null, "insufficient live SP refused")
	live = state(); live.stats.vit = 4; live.grit = 7; live.passives.pAtk = 10
	plan = probe("create_plan", [live]); plan.stats.vit = 0; plan.grit = 0; plan.passives.pAtk = 0
	next = evaluate(plan, live)
	check(next.sp == 21 and next.ap == 46 and next.spentSP == -11 and next.spentAP == -23 and next.changes == 3, "legacy VIT/grit and 23AP refund")
	for kind in ["stats","passives","grit"]:
		live = state(); plan = probe("create_plan", [live])
		if kind == "stats": live.stats.str = 1
		elif kind == "passives": live.passives.pAtk = 1
		else: live.grit = 1
		check(evaluate(plan, live) == null, "stale base " + kind)
	for target in [500,501,599,600,601]:
		live = state(); live.stats.str = 600
		plan = probe("create_plan", [live]); plan.stats.str = target
		next = evaluate(plan, live)
		check((next != null) == (target <= 600), "legacy overcap plan permits keep/decrease only")
	for target in [9,10,14,15,16]:
		live = state(); live.passives.pAtk = 15
		plan = probe("create_plan", [live]); plan.passives.pAtk = target
		next = evaluate(plan, live)
		check((next != null) == (target <= 15), "legacy passive overcap permits keep/decrease")
	for value in [-1,0.5,true,"1",NAN,INF,9007199254740992]:
		for field in ["stat","passive","grit","sp","ap"]:
			live = state(); plan = probe("create_plan", [live])
			if field == "stat": plan.stats.str = value
			elif field == "passive": plan.passives.pAtk = value
			elif field == "grit": plan.grit = value
			else: live[field] = value
			check(evaluate(plan, live) == null, "safe-count gate " + field)
	for kind in ["missing_stat","extra_stat","missing_passive","extra_passive","missing_cap"]:
		live = state(); plan = probe("create_plan", [live])
		if kind == "missing_stat": plan.stats.erase("vit")
		elif kind == "extra_stat": plan.stats.unknown = 0
		elif kind == "missing_passive": plan.passives.erase("pAtk")
		elif kind == "extra_passive": plan.passives.unknown = 0
		else:
			live.stats.unknown = 0; plan = probe("create_plan", [live])
		check(evaluate(plan, live) == null, "key/cap gate " + kind)
	live = state(); live.passives.legacy = 3
	plan = probe("create_plan", [live]); plan.passives.legacy = 2
	check(evaluate(plan, live) != null, "unknown legacy passive can decrease")
	plan.passives.legacy = 4
	check(evaluate(plan, live) == null, "unknown legacy passive cannot grow")
	live = state(); live.sp = 9007199254740991
	plan = probe("create_plan", [live]); plan.grit = 9007199254740991
	next = evaluate(plan, live)
	check(next != null and next.sp == 0, "uncapped grit up to safe-integer balance")
	for balance in ["sp", "ap"]:
		live = state(); live[balance] = 9007199254740991
		if balance == "sp": live.stats.str = 1
		else: live.passives.pAtk = 1
		plan = probe("create_plan", [live])
		if balance == "sp": plan.stats.str = 0
		else: plan.passives.pAtk = 0
		check(evaluate(plan, live) == null, "unsafe final refund balance " + balance)
	live = state(); live.stats.vit = 0.5
	plan = probe("create_plan", [live]); plan.stats.vit = 0
	check(evaluate(plan, live) == null, "fractional legacy refund fails final safe-integer gate")
	# Broad actual-output census, independently evaluated with the original JS body.
	for value in [0,1,490,495,500,600]:
		for points in [0,1,8,10]:
			for amount in [-10,-1,0,1,10,0.5,true,"1",NAN,INF]: probe("stat_change", [value,500,points,amount])
	for rank in range(13):
		for points in [0,1,2,3,5,23]:
			for amount in [-1,1,0,2,true,"1",NAN]: probe("passive_change", [rank,10,points,amount])
	for rank in range(16): probe("refund_totals", [{"str":20,"vit":4},{"pAtk":rank},7])
	print("META04_ACTUALS ", JSON.stringify(rows))
	print("META04_RESULT ", JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_cases":rows.size(),"source_oracle_required":true,"main_booted":false,"product_writer_connected":false,"save_io":false,"userdir":OS.get_user_data_dir()}))
	quit(1 if failures else 0)
