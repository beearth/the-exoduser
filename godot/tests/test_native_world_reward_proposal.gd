extends SceneTree
const USERDIR := "EXODUSER-nw-04-Isolated-20261020"
const PRODUCER = preload("res://port_modules/world_reward_proposal/producer.gd")
const ADMISSION = preload("res://port_modules/world_reward_proposal/admission.gd")
const FACTORY = preload("res://port_modules/kill_reward/drop_item_source.gd")
const HASHES := {"loop": "b46c1c77660f87eb2407bd55f97c4650a9f2cfca5e233e3e8437793a50545cb5",
	"push": "a82b9b0dbd9c17f256bfe455f6b6e8f1a361001fae5ec272243f1228994ffc37",
	"slots": "72c647f1cf345052d72ece51609e9ffd37720ac6b5d80bd51c151b0ead38e065",
	"hpBody": "163701ec055cecad688167bbc16b0619e8c78f4479cb4749b2b7b077bd13215a"}
var _producer = PRODUCER.new()
var _admission = ADMISSION.new()
var _checks := 0
var _failures := 0
var _contracts := 0
var _source_cases := 0
var _admission_cases := 0
var _diagnostics := 0

func _initialize() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		printerr("NW04 wrong userdir ", OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	_checks += 1
	if not ok:
		_failures += 1
		printerr("ASSERT_FAIL ", label)

func _base_expected() -> Dictionary:
	return {"ready": true, "matched": false, "source_index": null, "type": null, "reason": null,
		"commands": [], "rng_consumed": 0, "receipts_consumed": 0, "world_items_after": null,
		"mats_after": null, "pet_tut_after": null, "source": "game.html:32855-32911;16721"}

func _unwire(value: Variant) -> Variant:
	if value is Array:
		var out: Array = []
		for entry in value: out.append(_unwire(entry))
		return out
	if value is Dictionary:
		if value.size() == 1 and value.has("_f64"):
			return value._f64.hex_decode().decode_double(0)
		var out: Dictionary = {}
		for key in value: out[key] = _unwire(value[key])
		return out
	return value

func _same(a: Variant, b: Variant) -> bool:
	if ADMISSION.finite(a) and ADMISSION.finite(b): return float(a) == float(b)
	if typeof(a) != typeof(b): return false
	if a is Dictionary:
		if a.size() != b.size(): return false
		for key in a:
			if not b.has(key) or not _same(a[key], b[key]): return false
		return true
	if a is Array:
		if a.size() != b.size(): return false
		for i in a.size():
			if not _same(a[i], b[i]): return false
		return true
	return a == b

func _exercise(c: Dictionary) -> void:
	var before := var_to_bytes([c.player, c.objects, c.dependencies])
	var refs: Array = c.objects.duplicate() if c.objects is Array else []
	var children := root.get_child_count()
	seed(20261020)
	var expected_random := randi()
	seed(20261020)
	var result: Dictionary = _producer.propose(c.player, c.objects, c.pressed, c.portal, c.dependencies)
	_check(randi() == expected_random, c.name + " global RNG unchanged")
	_check(root.get_child_count() == children, c.name + " scene untouched")
	if not _same(result, c.expected) and _diagnostics < 3:
		_diagnostics += 1
		print("DIAGNOSTIC ", JSON.stringify({"name": c.name, "actual": result, "expected": c.expected}))
	_check(_same(result, c.expected), c.name + " entire ordered source result")
	_check(result.size() == 12 and typeof(result.ready) == TYPE_BOOL and typeof(result.matched) == TYPE_BOOL, c.name + " exact native envelope")
	_check(typeof(result.rng_consumed) == TYPE_INT and typeof(result.receipts_consumed) == TYPE_INT, c.name + " native integer counts")
	_check(typeof(result.source_index) == TYPE_INT if result.matched else result.source_index == null, c.name + " native integer index/null")
	_check(result.commands.is_empty() and result.world_items_after == null and result.mats_after == null and result.pet_tut_after == null if not result.ready else result.reason == null, c.name + " NR atomic/no invented state")
	_check(var_to_bytes([c.player, c.objects, c.dependencies]) == before, c.name + " deep input preservation")
	var same := true
	for i in refs.size():
		if not is_same(refs[i], c.objects[i]): same = false
	_check(same, c.name + " original references/order")
	_check(_same(_producer.propose(c.player, c.objects, c.pressed, c.portal, c.dependencies), result), c.name + " repeat stable/private worker")
	result.commands.append({"op": "test"})
	if result.world_items_after is Array and not result.world_items_after.is_empty():
		result.world_items_after[0].test_mutation = true
	_check(var_to_bytes([c.player, c.objects, c.dependencies]) == before and _same(_producer.propose(c.player, c.objects, c.pressed, c.portal, c.dependencies), c.expected), c.name + " nested result ownership")

func _nr(c: Dictionary, reason: String) -> void:
	_contracts += 1
	var copy := c.duplicate(true)
	copy.name = "native NR " + str(_contracts) + " " + reason
	copy.expected = _base_expected()
	copy.expected.ready = false
	copy.expected.reason = reason
	_exercise(copy)

func _admit(c: Dictionary) -> void:
	var before := var_to_bytes([c.records, c.incoming])
	var out: Dictionary = _admission.propose(c.records, c.incoming)
	_check(_same(out, c.expected), c.name + " source push/sound/swap/resize result")
	_check(out.size() == 4 and typeof(out.ready) == TYPE_BOOL, c.name + " admission envelope")
	_check(var_to_bytes([c.records, c.incoming]) == before, c.name + " admission input unchanged")
	_check(_admission.propose(c.records, c.incoming) == out, c.name + " admission repeat")
	out.commands.append({"op": "test"})
	if not out.world_items_after.is_empty(): out.world_items_after[0].test_mutation = true
	_check(var_to_bytes([c.records, c.incoming]) == before and _same(_admission.propose(c.records, c.incoming), c.expected), c.name + " admission nested ownership")

func _run() -> void:
	var source := ProjectSettings.globalize_path("res://../game.html")
	var oracle := ProjectSettings.globalize_path("res://../tools/nw04_world_reward_oracle.cjs")
	var node_binary := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="): node_binary = arg.trim_prefix("--node-bin=")
	_check(not node_binary.is_empty() and node_binary.is_absolute_path() and FileAccess.file_exists(node_binary), "explicit absolute Node executable required")
	_check(FileAccess.get_sha256(source) == PRODUCER.SOURCE_SHA256, "latest-main source pinned")
	_check(FileAccess.file_exists(oracle), "tracked unchanged-source oracle exists")
	if node_binary.is_empty() or not FileAccess.file_exists(node_binary):
		_finish()
		return
	var output: Array = []
	var code := OS.execute(node_binary, PackedStringArray([oracle, source]), output, true)
	_check(code == 0, "oracle exit0 " + str(output).left(300))
	# OS.execute returns chunks, not lines. Never take output[0].
	var data: Variant = _unwire(JSON.parse_string("".join(output))) if code == 0 else null
	_check(data is Dictionary and data.get("cases") is Array and data.get("admissions") is Array, "required oracle JSON/no skip")
	if not data is Dictionary or not data.get("cases") is Array or not data.get("admissions") is Array:
		_finish()
		return
	_check(data.source_sha256 == PRODUCER.SOURCE_SHA256 and data.fragment_hashes == HASHES, "whole and exact excerpt hashes")
	for key in HASHES:
		_check(data.fragments[key].sha256_text() == HASHES[key], "unchanged excerpt " + key)
	_check(not data.real_game_booted and not data.real_factory_called and not data.real_storage_io, "fixture boundary explicit")
	_check(_same(data.hp, [{"count": 1, "value": true, "mats_delta": 1}, {"count": 2, "value": true, "mats_delta": 2}]), "actual HP dependency mats conversion evidence")
	_source_cases = data.cases.size()
	_admission_cases = data.admissions.size()
	_check(data.cases.size() == 317 and data.admissions.size() == 51, "source denominator 317 reward +51 admission")
	for c in data.cases:
		_exercise(c)
		if c.name == "large-native-integer-mats":
			var native_case: Dictionary = c.duplicate(true)
			native_case.dependencies.mats = 9007199254740992
			native_case.name += " native int carrier"
			_exercise(native_case)
	for c in data.admissions: _admit(c)
	var chest: Dictionary = data.cases.filter(func(c): return c.name == "chest-before-earlier-debris")[0]
	for bad in [null, 0, "true", {}, []]:
		var c := chest.duplicate(true)
		c.pressed = bad
		_nr(c, "gate_type")
	for bad in [null, 0, {}, "array"]:
		var c := chest.duplicate(true)
		c.objects = bad
		_nr(c, "records_not_array")
	for bad in [null, {}, {"x": NAN, "y": 0}, {"x": 0, "y": INF}]:
		var c := chest.duplicate(true)
		c.player = bad
		_nr(c, "player_xy_not_finite")
	for key in ["stage", "mats", "shake"]:
		for bad in [null, true, "1", [], {}, NAN, INF, -INF]:
			var c := chest.duplicate(true)
			c.dependencies[key] = bad
			_nr(c, key + "_not_finite")
	for bad in [null, {}, [], true]:
		var c := chest.duplicate(true)
		c.dependencies = bad
		_nr(c, "tape_not_ready")
	for bad in [null, true, -1, 3, .5, "1", NAN, INF]:
		if bad == null: continue # source defaults missing/null tier to0
		var c := chest.duplicate(true)
		c.objects = [{"type": "debris", "x": 0, "y": 0, "debTier": bad}]
		_nr(c, "debris_tier_unsupported")
	for entry in [null, {}, {"type": 3}]:
		var c := chest.duplicate(true)
		c.objects = [entry]
		_nr(c, "entry_type_not_string")
	for flag_name in ["picked", "opened"]:
		for bad in [0, 1, "false", [], {}]:
			var c := chest.duplicate(true)
			c.objects = [{"type": "chest", "x": 0, "y": 0, flag_name: bad}]
			_nr(c, flag_name + "_unsupported")
	for n in chest.dependencies.tape.size():
		var c := chest.duplicate(true)
		var name: String = c.dependencies.tape[n].name
		c.dependencies.tape.resize(n)
		_nr(c, "receipt_missing:" + name)
		c = chest.duplicate(true)
		c.dependencies.tape[n].args = ["wrong"]
		_nr(c, "receipt_mismatch:" + name)
	var surplus := chest.duplicate(true)
	surplus.dependencies.tape.append(surplus.dependencies.tape[0])
	_nr(surplus, "receipt_surplus")
	for bad in [null, true, -0.01, 1.0, NAN, INF]:
		var c := chest.duplicate(true)
		c.dependencies.tape[0].value = bad
		_nr(c, "random_not_ready")
	var bad_inner := chest.duplicate(true)
	bad_inner.dependencies.tape[0].internal_rng = [1]
	_nr(bad_inner, "internal_rng_unsupported:Math.random")
	# Gate short-circuit must ignore all malformed input/dependency payloads.
	for portal in [true, false]:
		var c := {"name": "inactive gate ignores payload", "player": null, "objects": null, "dependencies": null, "pressed": false, "portal": portal, "expected": _base_expected()}
		_exercise(c)
	for bad in [null, [], true]:
		var c := chest.duplicate(true)
		c.dependencies.pet_tut = bad
		_nr(c, "effects_not_ready")
	for key in ["firstChest", "firstDebris"]:
		var c := chest.duplicate(true)
		c.objects = [{"type": "chest" if key == "firstChest" else "debris", "x": 0, "y": 0}]
		c.dependencies.pet_tut[key] = 1
		_nr(c, "pet_flag_unsupported")
	for bad in [null, true, "item", []]:
		var c := chest.duplicate(true)
		for receipt in c.dependencies.tape:
			if receipt.name == "mkItem":
				receipt.value = bad
				break
		_nr(c, "mk_item_not_ready")
	var bad_potion := chest.duplicate(true)
	for receipt in bad_potion.dependencies.tape:
		if receipt.name == "addPotion": receipt.value = 1
	_nr(bad_potion, "potion_return_not_ready")
	# Admission validates rank fields only when cap trimming evaluates them.
	for bad in [null, true, "array", {}]:
		var out: Dictionary = _admission.propose(bad, {})
		_check(not out.ready and out.reason == "array_or_record_unsupported" and out.commands.is_empty() and out.world_items_after.is_empty(), "admission NR array/record")
	for record in [{}, {"type": 1}, {"type": "item", "item": true}, {"type": "item", "item": {"rarity": NAN}, "x": 0, "y": 0}, {"type": "item", "item": {}, "x": INF, "y": 0}]:
		var out: Dictionary = _admission.propose([], record)
		_check(not out.ready and out.commands.is_empty() and out.world_items_after.is_empty(), "admission NR sound fields atomic")
	var overflow: Array = []
	for i in 20: overflow.append({"type": "chest", "picked": 1})
	var rejected: Dictionary = _admission.propose(overflow, {"type": "hp"})
	_check(not rejected.ready and rejected.reason == "picked_unsupported" and rejected.commands.is_empty() and rejected.world_items_after.is_empty(), "admission no partial append on invalid overflow rank")
	var lazy: Dictionary = _admission.propose([null], {"type": "chest", "picked": 1})
	_check(lazy.ready and lazy.world_items_after.size() == 2, "admission unneeded rank fields remain unread below cap")
	# Existing generator is reusable as the receipt producer, never copied here.
	var factory_draws: Array = []
	var factory = FACTORY.new(func(tag): factory_draws.append(tag); return 0.25)
	var generated: Variant = factory.mk_item("shield", 0, 2, 3, null, 1)
	_check(generated is Dictionary and not factory.aborted and not factory_draws.is_empty(), "actual existing mk_item dependency works with private injected RNG")
	_check(generated.get("rarity") == 3 and generated.get("slot") == "shield", "factory receipt retains actual item, not fixture schema")
	# Substitute actual generator outputs into the same recorded call slots;
	# source mkItem request args remain checked by the planner, item internals
	# remain owned by the existing generator.
	var real_case := chest.duplicate(true)
	var actual_items: Array = []
	for receipt in real_case.dependencies.tape:
		if receipt.name == "mkItem":
			var a: Array = receipt.args
			var draw_start := factory_draws.size()
			receipt.value = factory.mk_item(a[0], int(a[1]), int(a[2]), int(a[3]), null, 1)
			receipt.internal_rng = []
			for draw in factory_draws.size() - draw_start: receipt.internal_rng.append(0.25)
			actual_items.append(receipt.value.duplicate(true))
	var actual_plan: Dictionary = _producer.propose(real_case.player, real_case.objects, true, false, real_case.dependencies)
	_check(actual_plan.ready and actual_plan.matched and not factory.aborted, "existing factory receipts admitted without a replacement generator")
	var actual_admitted: Array = []
	for command in actual_plan.commands:
		if command.op == "admit": actual_admitted.append(command.record.item)
	_check(_same(actual_admitted, actual_items) and actual_items.size() == 4, "actual factory payload preserved at every admission")
	_check(_producer.provenance().connected == false and _producer.provenance().source == PRODUCER.SOURCE, "no actual consumer")
	_finish()

func _finish() -> void:
	print("NW04_RESULT ", JSON.stringify({"checks": _checks, "failures": _failures, "source_reward_cases": _source_cases, "source_admission_cases": _admission_cases, "native_contract_cases": _contracts, "live_owner_connected": false, "skipped": []}))
	quit(0 if _failures == 0 else 1)
