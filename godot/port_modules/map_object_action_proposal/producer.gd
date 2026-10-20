extends RefCounted
## NW-03: ordered MAP action commands only; no actual state/economy/RNG dispatch.
const QUERY = preload("res://port_modules/world_interaction_query/producer.gd")
const SOURCE := "game.html:32829–32853"
const SOURCE_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const FRAGMENT_SHA256 := "9eea8397b33211a9a7b4ba18372d4fb60a5ab6cffa497687254d47b66d6c265f"
var _query = QUERY.new()


func propose(player: Variant, objects: Variant, pressed: Variant, portal_used: Variant, dependencies: Variant = null) -> Dictionary:
	var candidate: Dictionary = _query.query_map_object(player, objects, pressed, portal_used)
	if not candidate.ready:
		return _nr("query:" + candidate.reason)
	if not candidate.matched:
		return _result(candidate, [])
	var mo: Dictionary = objects[candidate.source_index]
	var commands: Array = []
	var random_count := 0
	match candidate.type:
		"lore": commands = _lore(player, mo)
		"breakable":
			if not _number(mo.get("hp")):
				return _nr("hp_not_finite")
			var hp := float(mo.hp) - 1.0
			commands = [_write("mo.hp", hp), _parts(mo, "#aa8844", 4), _pickup()]
			if hp <= 0.0:
				commands.append(_write("mo.alive", false))
				var loot: Variant = mo.get("loot")
				if typeof(loot) == TYPE_STRING and loot == "mat":
					if not _random_ready(dependencies):
						return _nr("random_sample_not_ready")
					if not _number(dependencies.get("mats")):
						return _nr("mats_not_finite")
					var sample := float(dependencies.random_sample)
					var mats := float(dependencies.mats) + (1.0 + float(int(sample * 3.0)))
					if not is_finite(mats):
						return _nr("result_not_finite")
					random_count = 1
					commands.append_array([_random(sample), _write("G.mats", mats)])
				elif typeof(loot) == TYPE_STRING and loot == "potion":
					if not dependencies is Dictionary or typeof(dependencies.get("add_potion_return")) != TYPE_BOOL:
						return _nr("add_potion_return_not_ready")
					commands.append({"op": "addPotion", "args": ["hp", 1], "expected_return": dependencies.add_potion_return})
					if dependencies.add_potion_return:
						commands.append(_text(mo.x, float(mo.y) - 15.0, {"key": "HP물약!"}, "#33ff33", 40))
				commands.append(_parts(mo, "#886633", 8))
		"altar":
			if not _random_ready(dependencies):
				return _nr("random_sample_not_ready")
			var sample := float(dependencies.random_sample)
			var pick: Array = [["피의 축복", "_altAtk", 0.15], ["뼈의 방벽", "_altDef", 0.20], ["광기의 속도", "_altSpd", 0.15]][int(sample * 3.0)]
			var previous: Variant = player.get(pick[1])
			if previous != null and not (typeof(previous) == TYPE_BOOL and previous == false) and not _number(previous):
				return _nr("selected_buff_not_finite")
			var value: float = (float(previous) if _number(previous) else 0.0) + float(pick[2])
			if not is_finite(value):
				return _nr("result_not_finite")
			random_count = 1
			commands = [_write("mo.used", true), _write("_mmDirty", 1), _random(sample), _write("P." + pick[1], value),
				_text(mo.x, float(mo.y) - 20.0, pick[0] + "!", "#ffaa44", 90), _parts(mo, "#ffaa44", 12), _pickup()]
		"bonfire":
			for key in ["mhp", "mst", "mmp", "mshield"]:
				if not _number(player.get(key)):
					return _nr("maxima_not_finite")
			commands = _bonfire(player, mo)
	return _result(candidate, commands, random_count)


func provenance() -> Dictionary:
	return {"file": "game.html", "start_line": 32828, "end_line": 32853, "source_sha256": SOURCE_SHA256,
		"fragment_sha256": FRAGMENT_SHA256, "connected": false, "add_potion_body_included": false}


func _lore(p: Dictionary, mo: Dictionary) -> Array:
	return [_write("mo.read", true), _text(p.x, float(p.y) - 40.0, {"key": "비문 발견..."}, "#8888ff", 90),
		_parts(mo, "#8888ff", 6), _pickup()]


func _bonfire(p: Dictionary, mo: Dictionary) -> Array:
	return [_write("P.hp", float(p.mhp)), _write("P.st", float(p.mst)), _write("P.mp", float(p.mmp)), _write("P.shield", float(p.mshield)),
		_write("mo.lit", true), _write("_mmDirty", 1), _text(mo.x, float(mo.y) - 20.0, {"key": "HP/MP/ST 회복!"}, "#44ff44", 60),
		_parts(mo, "#ffcc44", 12), _pickup()]


func _number(value: Variant) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))


func _random_ready(dependencies: Variant) -> bool:
	return dependencies is Dictionary and _number(dependencies.get("random_sample")) and float(dependencies.random_sample) >= 0.0 and float(dependencies.random_sample) < 1.0


func _random(sample: float) -> Dictionary:
	return {"op": "random", "sample": sample}


func _write(path: String, value: Variant) -> Dictionary:
	return {"op": "set", "path": path, "value": value}


func _parts(mo: Dictionary, color: String, count: int) -> Dictionary:
	return {"op": "addParts", "args": [float(mo.x), float(mo.y), color, count]}


func _text(x: Variant, y: float, message: Variant, color: String, duration: int) -> Dictionary:
	return {"op": "addTxt", "args": [float(x), y, message, color, duration]}


func _pickup() -> Dictionary:
	return {"op": "SFX.pickup", "args": []}


func _result(candidate: Dictionary, commands: Array, random_count: int = 0) -> Dictionary:
	return {"ready": true, "matched": candidate.matched, "source_index": candidate.source_index, "type": candidate.type,
		"reason": null, "commands": commands, "rng_consumed": random_count, "source": SOURCE, "break_scope": "map_objs" if candidate.matched else null}


func _nr(reason: String) -> Dictionary:
	return {"ready": false, "matched": false, "source_index": null, "type": null, "reason": reason,
		"commands": [], "rng_consumed": 0, "source": SOURCE, "break_scope": null}
