extends SceneTree
## META-05: source boundary goldens, immutable snapshots, independent JS receipts.
const POLICY = preload("res://scripts/native_meta_passive_queue.gd")
const USERDIR := "EXODUSER-meta-05-Isolated-20261020"
const KEYS := ["pAtk","pCharge","pParry","pMagic","pBow","pGuard","pRegen","pCrit","pDrop","pPierce","pMRegen","pXbow","pMelee","pCombo","pAbund","pPred","pDot","pVital","pStamina","pMalice","pFortify","pArmor","pHunter","pHuman","pDemon","pRage"]
var assertions := 0
var failures := 0
var rows: Array = []
func _initialize() -> void: call_deferred("_run")
func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("META05_FAIL ", label)
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
		"items": actual = POLICY.items(args[0], args[1])
		"process": actual = POLICY.process(args[0], args[1], args[2], args[3])
		"enqueue": actual = POLICY.enqueue(args[0], args[1], args[2], args[3], args[4])
		"cancel": actual = POLICY.cancel(args[0], args[1], args[2])
	check(equal(args, before), "inputs untouched: " + method)
	rows.append({"method":method,"args":encode(args),"actual":encode(actual)})
	return actual
func passives() -> Dictionary:
	var ranks := {}
	for key in KEYS: ranks[key] = 0
	return ranks
func definitions() -> Array:
	var defs: Array = []
	for key in KEYS: defs.append({"key":key,"max":10})
	return defs
func process_queue(queue: Variant, ranks: Dictionary, ap: float, defs: Array = []) -> Dictionary:
	return probe("process", [queue,ranks,ap,definitions() if defs.is_empty() else defs])
func add(queue: Variant, ranks: Dictionary, key: Variant, amount: Variant, defs: Array = []) -> Variant:
	return probe("enqueue", [queue,ranks,definitions() if defs.is_empty() else defs,key,amount])
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		push_error("META05 isolated override required")
		quit(2)
		return
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated user path")
	var ranks := passives()
	check(KEYS.size() == 26 and definitions().size() == 26, "source registry26")
	for raw in [null,{},"pAtk",17,true,PackedStringArray(["pAtk"])]:
		# PackedStringArray is not a JS Array: no serialization/oracle coercion.
		if raw is PackedStringArray: check(POLICY.items(raw,ranks).is_empty(), "packed array excluded")
		else: check(equal(probe("items",[raw,ranks]),[]), "non-array source read")
	var dirty := [null,"bad",0,true,{},["pAtk"],"pAtk","pMagic","pAtk","toString","__proto__"]
	check(equal(probe("items",[dirty,ranks]),["pAtk","pMagic","pAtk"]), "string own keys only, duplicates FIFO")
	var legacy := ranks.duplicate(); legacy.legacy = 0; legacy.toString = 0
	check(equal(probe("items",[["legacy","toString"],legacy]),["legacy","toString"]), "own keys, not hardcoded registry membership")
	var long_queue: Array = []
	for i in range(270): long_queue.append("bad")
	for i in range(260): long_queue.append("pAtk")
	long_queue.append("pMagic")
	var view: Array = probe("items",[long_queue,ranks])
	check(view.size() == 260 and view.count("pAtk") == 260, "filter before cap260")
	view[0] = "pBow"
	check(long_queue[270] == "pAtk", "filtered array does not alias input")
	var next := process_queue(["pAtk","pMagic"],ranks,1)
	check(next.ap == 0 and next.invested == 1 and next.passives.pAtk == 1 and next.queue == ["pMagic"] and next.recalculation_required, "AP exact first purchase FIFO")
	next.passives.pAtk = 77; next.queue.append("pBow")
	check(ranks.pAtk == 0, "result rank snapshot independent")
	ranks.pAtk = 3
	next = process_queue(["pAtk","pMagic"],ranks,1)
	check(next.ap == 1 and next.invested == 0 and next.queue == ["pAtk","pMagic"] and next.passives.pMagic == 0 and not next.recalculation_required, "expensive head blocks affordable tail")
	ranks.pAtk = 10
	next = process_queue(["pAtk","pMagic"],ranks,0)
	check(next.queue == ["pMagic"] and next.invested == 0 and not next.recalculation_required, "max head shifted before AP test, no recalc")
	next = process_queue(["legacy","pMagic"],legacy,0)
	check(next.queue == ["pMagic"] and next.passives.legacy == 0 and next.invested == 0, "missing definition head discarded")
	ranks = passives()
	var repeated: Array = []
	for i in range(12): repeated.append("pAtk")
	next = process_queue(repeated,ranks,23)
	check(next.ap == 0 and next.passives.pAtk == 10 and next.invested == 10 and next.queue.is_empty(), "23AP gives10 ranks, max duplicates removed")
	next = process_queue(repeated,ranks,22)
	check(next.ap == 4 and next.passives.pAtk == 9 and next.invested == 9 and next.queue.size() == 3, "rank9 costs5; no premature head shift")
	next = process_queue(dirty,ranks,0)
	check(next.queue == ["pAtk","pMagic","pAtk"] and not next.recalculation_required, "no investment still returns sanitized queue")
	check(equal(add([],ranks,"pAtk",10),["pAtk","pAtk","pAtk","pAtk","pAtk","pAtk","pAtk","pAtk","pAtk","pAtk"]), "enqueue at rank max10")
	check(add([],ranks,"pAtk",11) == null, "enqueue above max rejected")
	ranks.pAtk = 8
	check(equal(add(["pAtk"],ranks,"pAtk",1),["pAtk","pAtk"]), "existing ranks plus pending counted")
	check(add(["pAtk"],ranks,"pAtk",2) == null, "pending plus ranks cap rejects")
	for amount in [-1,0,0.5,true,"1",null,NAN,INF,9007199254740992]:
		check(add(dirty,ranks,"pMagic",amount) == null, "unsafe/nonpositive amount refused")
	for key in ["unknown",null,0,true,"__proto__"]:
		check(add([],ranks,key,1) == null, "unknown definition refused")
	check(equal(probe("cancel",[dirty,ranks,1]),["pAtk","pAtk"]), "cancel index uses filtered view")
	check(equal(probe("cancel",[dirty,ranks,0]),["pMagic","pAtk"]), "cancel first duplicate")
	for index in [-1,3,0.5,true,"1",null,NAN,INF,9007199254740992]:
		check(probe("cancel",[dirty,ranks,index]) == null, "invalid cancel index refused")
	check(probe("cancel",[[],ranks,0]) == null, "cancel empty refused")
	# Original callbacks do not add an overall post-append clamp; numeric legacy
	# data/custom defs are explicit inputs, not a new product registry or writer.
	var custom := [{"key":"pAtk","max":1000}]
	ranks = passives()
	var appended: Variant = add(long_queue,ranks,"pAtk",1,custom)
	check(appended != null and appended.size() == 261, "source append has no invented second260 cap")
	check(equal(add([],{},"pAtk",1),["pAtk"]), "enqueue checks definition, not own rank key")
	check(equal(probe("items",[["pAtk"],{}]),[]), "next read filters key absent from owner")
	var safe := [{"key":"pAtk","max":9007199254740991}]
	ranks.pAtk = 9007199254740990
	check(equal(add([],ranks,"pAtk",1,safe),["pAtk"]), "safe maximum exact boundary without huge allocation")
	check(add([],ranks,"pAtk",9007199254740992,safe) == null, "unsafe amount rejected before append")
	next = probe("process", [["pAtk","pMagic"],passives(),23,[]])
	check(next.queue.is_empty() and next.invested == 0 and next.ap == 23 and not next.recalculation_required, "all missing definitions removed without investment")
	next = process_queue(["pAtk"],passives(),23,[{"key":"pAtk","max":0},{"key":"pAtk","max":10}])
	check(next.queue.is_empty() and next.invested == 0, "first matching definition, not last")
	check(equal(add([],passives(),"pAtk",1.0),["pAtk"]), "integer-valued float amount accepted")
	check(equal(probe("cancel",[["pAtk","pMagic"],passives(),1.0]),["pAtk"]), "integer-valued float index accepted")
	# Source cost curve/all ranks, wallet boundaries and repeated dynamic costs.
	for rank in [-1,0,1,2,3,5,6,8,9,10,11,0.5]:
		for ap in [-1,0,1,2,3,4,5,22,23,100]:
			ranks = passives(); ranks.pAtk = rank
			process_queue(["pAtk","pAtk","pMagic"],ranks,ap)
	for rank in range(11):
		for pending in range(12):
			var queue: Array = []
			for i in range(pending): queue.append("pAtk")
			for amount in [-1,0,1,2,10,0.5]:
				ranks = passives(); ranks.pAtk = rank
				add(queue,ranks,"pAtk",amount)
	# Full current registry260 and 26*23 AP, plus FIFO over several AP grants.
	ranks = passives(); var full: Array = []
	for key in KEYS:
		for i in range(10): full.append(key)
	next = process_queue(full,ranks,598)
	check(next.invested == 260 and next.ap == 0 and next.queue.is_empty(), "all26 passives max with598AP")
	for key in KEYS: check(next.passives[key] == 10, "full registry rank10 " + key)
	var queue: Variant = add([],passives(),"pAtk",10)
	queue = add(queue,passives(),"pMagic",10)
	var balance := 0.0; ranks = passives(); var spent := 0
	for grant in range(46):
		next = process_queue(queue,ranks,balance + 1)
		spent += next.invested
		balance = next.ap; ranks = next.passives; queue = next.queue
	check(spent == 20 and balance == 0 and ranks.pAtk == 10 and ranks.pMagic == 10 and queue.is_empty(), "46 individual grants preserve queue and live AP")
	print("META05_ACTUALS ", JSON.stringify(rows))
	print("META05_RESULT ", JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_cases":rows.size(),"source_oracle_required":true,"main_booted":false,"product_writer_connected":false,"save_io":false,"userdir":OS.get_user_data_dir()}))
	quit(1 if failures else 0)
