extends RefCounted
## NW-04 game.html:32855–32911. Pure proposal; no live owner/RNG/factory calls.
## Ordered dependency receipts preserve mkItem/playItemDropSfx internal RNG
## boundaries. Missing/invalid receipts: NR without partial commands or writes.
const ADMISSION = preload("res://port_modules/world_reward_proposal/admission.gd")
const CATALOG = preload("res://port_modules/item_armor_element/source_item_catalog.gd")
const SOURCE := "game.html:32855-32911;16721"
const SOURCE_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
var _commands: Array = []
var _tape: Array = []
var _cursor := 0
var _random_count := 0
var _error := ""

func provenance() -> Dictionary:
	return {"source": SOURCE, "source_sha256": SOURCE_SHA256, "connected": false,
		"factory": "kill_reward/drop_item_source.gd:mk_item (external dependency)",
		"next_unit": "NW-05 actual consumer BLOCKED; shared owner approval required"}

func propose(player: Variant, records: Variant, pressed: Variant, portal_used: Variant, dependencies: Variant = null) -> Dictionary:
	return get_script().new()._build(player, records, pressed, portal_used, dependencies)

func _base() -> Dictionary:
	return {"ready": true, "matched": false, "source_index": null, "type": null,
		"reason": null, "commands": [], "rng_consumed": 0, "receipts_consumed": 0,
		"world_items_after": null, "mats_after": null, "pet_tut_after": null, "source": SOURCE}

func _nr(reason: String) -> Dictionary:
	var out := _base()
	out.ready = false
	out.reason = reason
	return out

func _call(name: String, args: Array = []) -> void:
	_commands.append({"op": "call", "name": name, "args": args.duplicate(true)})

func _write(path: String, value: Variant) -> void:
	_commands.append({"op": "set", "path": path, "value": value})

static func _same_args(actual: Variant, expected: Array) -> bool:
	if not actual is Array or actual.size() != expected.size(): return false
	for i in expected.size():
		if ADMISSION.finite(expected[i]):
			if not ADMISSION.finite(actual[i]) or float(actual[i]) != float(expected[i]): return false
		elif typeof(actual[i]) != typeof(expected[i]) or actual[i] != expected[i]:
			return false
	return true

func _take(name: String, args: Array) -> Variant:
	if not _error.is_empty(): return null
	if _cursor >= _tape.size():
		_error = "receipt_missing:" + name
		return null
	var entry: Variant = _tape[_cursor]
	if not entry is Dictionary or entry.get("name") != name or not _same_args(entry.get("args"), args) or not entry.has("value") or not entry.get("internal_rng") is Array:
		_error = "receipt_mismatch:" + name
		return null
	for sample in entry.internal_rng:
		if not ADMISSION.finite(sample) or sample < 0 or sample >= 1:
			_error = "internal_rng_unsupported:" + name
			return null
	_cursor += 1
	_commands.append({"op": "dependency", "receipt": entry.duplicate(true)})
	return entry.value

func _random() -> float:
	var value: Variant = _take("Math.random", [])
	if not ADMISSION.finite(value) or value < 0 or value >= 1:
		if _error.is_empty(): _error = "random_not_ready"
		return 0
	_random_count += 1
	return float(value)

static func _i32(value: float) -> int:
	var wrapped := fmod(value - fmod(value, 1.0), 4294967296.0)
	if wrapped < 0: wrapped += 4294967296.0
	return int(wrapped - 4294967296.0 if wrapped >= 2147483648.0 else wrapped)

func _build(player: Variant, records: Variant, pressed: Variant, portal: Variant, deps: Variant) -> Dictionary:
	if typeof(pressed) != TYPE_BOOL or typeof(portal) != TYPE_BOOL: return _nr("gate_type")
	if not pressed or portal: return _base()
	if not records is Array: return _nr("records_not_array")
	if not player is Dictionary or not ADMISSION.finite(player.get("x")) or not ADMISSION.finite(player.get("y")): return _nr("player_xy_not_finite")
	var selected := -1
	# Source's two loops: every eligible chest precedes every debris. MAP_OBJS
	# break does not skip them. Debris reads picked before its type comparison.
	for kind in ["chest", "debris"]:
		for i in records.size():
			var candidate: Variant = records[i]
			if not candidate is Dictionary or not candidate.get("type") is String: return _nr("entry_type_not_string")
			if kind == "chest" and candidate.type != kind: continue
			if not ADMISSION.flag(candidate.get("picked")): return _nr("picked_unsupported")
			if candidate.get("picked") == true or candidate.type != kind: continue
			if kind == "chest":
				if not ADMISSION.flag(candidate.get("opened")): return _nr("opened_unsupported")
				if candidate.get("opened") == true: continue
			if not ADMISSION.finite(candidate.get("x")) or not ADMISSION.finite(candidate.get("y")): return _nr("entry_xy_not_finite")
			var dx: float = float(candidate.x) - float(player.x)
			var dy: float = float(candidate.y) - float(player.y)
			if sqrt(dx * dx + dy * dy) < (60 if kind == "chest" else 50):
				selected = i
				break
		if selected >= 0: break
	if selected < 0: return _base()
	if not deps is Dictionary or not deps.get("tape") is Array: return _nr("tape_not_ready")
	for key in ["stage", "mats", "shake"]:
		if not ADMISSION.finite(deps.get(key)): return _nr(key + "_not_finite")
	if not is_finite(float(deps.stage) * 2) or not is_finite(float(deps.shake) * 8): return _nr("arithmetic_not_finite")
	if typeof(deps.get("chest3d")) != TYPE_BOOL or not deps.get("pet_tut") is Dictionary: return _nr("effects_not_ready")
	var items: Array = records.duplicate(true)
	var it: Dictionary = items[selected] # retained even if cap trim evicts its slot
	var kind: String = it.type
	var pet: Dictionary = deps.pet_tut.duplicate(true)
	var pet_key := "firstChest" if kind == "chest" else "firstDebris"
	if not ADMISSION.flag(pet.get(pet_key)): return _nr("pet_flag_unsupported")
	var tier := 0
	if kind == "debris":
		var raw: Variant = it.get("debTier")
		if raw != null and not (typeof(raw) == TYPE_BOOL and raw == false):
			if not ADMISSION.finite(raw) or raw < 0 or raw > 2 or raw != floor(float(raw)): return _nr("debris_tier_unsupported")
			tier = int(raw)
	_tape = deps.tape
	var mats: float = float(deps.mats)
	var count: int
	if kind == "chest":
		it.opened = true
		_write("it.opened", true)
		if deps.chest3d: _call("_chest3d.open")
		_call("SFX.victory")
		_write("G.shake", 8 * float(deps.shake) / 100)
		_call("addTxt", [it.x, float(it.y) - 20, "보물상자 개봉!", "#ffcc00", 60])
		_call("addParts", [it.x, it.y, "#ffcc00", 16])
		_call("addParts", [it.x, it.y, "#ffaa00", 10])
		count = 3 + int(_random() * 3)
	else:
		it.picked = true
		_write("it.picked", true)
		var color: String = ["#aa8844", "#cc9944", "#eebb44"][tier]
		_call("addTxt", [it.x, float(it.y) - 15, ["소형 잔해", "중형 잔해", "대형 잔해"][tier] + " 개봉!", color, 50])
		_call("addParts", [it.x, it.y, color, 8 + tier * 4])
		_call("SFX.pickup")
		var bonus: int = [3, 8, 15][tier] + _i32(float(deps.stage) * [0.5, 1, 2][tier])
		mats += bonus
		_write("G.mats", mats)
		_call("addTxt", [it.x, float(it.y) - 30, "악의 +" + str(bonus), "#cc66ff", 30])
		_pet(pet, pet_key)
		count = [0, 1, 2][tier]
		if tier >= 1 and _random() < 0.5: count += 1
	for ci in count:
		var slot: String = CATALOG.SLOT_NAMES[int(_random() * CATALOG.SLOT_NAMES.size())]
		var element := int(_random() * 6)
		var rr := _random()
		var rarity: int
		if kind == "chest":
			var stg_b := minf(float(deps.stage) * 0.015, 0.30)
			var leg := minf(0.15 + stg_b * 0.5, 0.40)
			var hero := minf(0.25 + stg_b * 0.4, 0.35)
			rarity = 4 if rr < leg else (3 if rr < leg + hero else (2 if rr < leg + hero + 0.30 else 1))
		else:
			rarity = (4 if rr < 0.2 else (3 if rr < 0.5 else 2)) if tier >= 2 else ((3 if rr < 0.1 else (2 if rr < 0.4 else 1)) if tier >= 1 else (2 if rr < 0.15 else 1))
		var item: Variant = _take("mkItem", [slot, 0, element, rarity])
		if not item is Dictionary:
			if _error.is_empty(): _error = "mk_item_not_ready"
			break
		var spread := 50 if kind == "chest" else 40
		var x: float = float(it.x) + (_random() - 0.5) * spread
		var y: float = float(it.y) + (_random() - 0.5) * spread
		var record := {"x": x, "y": y, "type": "item", "item": item.duplicate(true), "picked": false}
		_commands.append({"op": "admit", "record": record.duplicate(true)})
		var admission: Dictionary = ADMISSION.new().propose(items, record)
		if not admission.ready:
			_error = "admission:" + admission.reason
			break
		for command in admission.commands:
			if command.op == "call": _take(command.name, command.args)
		# Replay only on private copies, preserving retained selected reference.
		items.append(record)
		for command in admission.commands:
			if command.op == "swap_tail": items[command.index] = items[command.tail_index]
			elif command.op == "resize": items.resize(command.length)
		if not _error.is_empty(): break
	if kind == "chest":
		mats += 5 + _i32(float(deps.stage) * 2)
		_write("G.mats", mats)
		if _potion(2): _call("addTxt", [float(it.x) + 20, float(it.y) + 10, "HP물약 +2", "#33ff33", 30])
		_pet(pet, pet_key)
	elif tier >= 1 and _random() < 0.4:
		if _potion(1): _call("addTxt", [float(it.x) + 15, float(it.y) + 5, "HP물약 +1", "#33ff33", 25])
	if not _error.is_empty(): return _nr(_error)
	if _cursor != _tape.size(): return _nr("receipt_surplus")
	var out := _base()
	out.merge({"matched": true, "source_index": selected, "type": kind, "commands": _commands,
		"rng_consumed": _random_count, "receipts_consumed": _cursor, "world_items_after": items,
		"mats_after": mats, "pet_tut_after": pet}, true)
	return out

func _potion(count: int) -> bool:
	var value: Variant = _take("addPotion", ["hp", count])
	if typeof(value) != TYPE_BOOL:
		if _error.is_empty(): _error = "potion_return_not_ready"
		return false
	return value

func _pet(pet: Dictionary, key: String) -> void:
	if pet.get(key) == true: return
	pet[key] = true
	_write("_petTut." + key, true)
	var args: Array = ["tut_chest", "crow", "보물상자를 열었군. 보스급 장비가 쏟아진다.", 5, 9999, "cat", "상자 대박! 좋은 거 잔뜩 나와! 보이면 꼭 열어!", 5] if key == "firstChest" else ["tut_debris", "crow", "잔해도 부숴서 열어. 악의와 장비가 숨어있다.", 5, 9999, "cat", "잔해에서 악의가 나온다! 보이면 다 주워!", 5]
	_call("_petSayCD", args)
