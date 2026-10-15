extends SceneTree
## New pure constructor/consumer-boundary checks only. No Main, actor clock,
## save, source16 extraction, old suite, renderer, texture import or UI input.
const RecipeScript = preload("res://scripts/type3_spawn_recipe.gd")
const NORMAL = {"stage": 0, "room": -1, "player_level": 1, "difficulty": 5, "stage_difficulty_offset": 0}

class Stream extends RefCounted:
	var values: Array
	var index = 0
	var moved_to: Variant = null
	var blocked = false
	var collision_calls: Array = []
	var consumed: Array = []
	var fx_calls: Array = []
	var reject_child = false
	func _init(initial_values: Array) -> void:
		values = initial_values.duplicate()
	func next_unit() -> float:
		assert(index < values.size(), "constructor fixture exhausted")
		var value: float = float(values[index])
		index += 1
		return value
	func can_move(x: float, y: float, radius: float) -> bool:
		collision_calls.append([x, y, radius])
		return not blocked
	func safe_point(_x: float, _y: float, _radius: float) -> Variant:
		return moved_to
	func accept_child(recipe: Dictionary) -> bool:
		if reject_child:
			return false
		consumed.append(recipe)
		return true
	func source_add_parts(x: float, y: float, color: String, requested_count: int) -> void:
		# Constructor fixture models canonical addParts(8) when the original
		# pool has capacity and hiFPS is false: floor(8*.6)=4, 4 draws each.
		# It is not a live renderer or a global-RNG/full-FX parity claim.
		fx_calls.append([x, y, color, requested_count, index])
		for _particle in range(int(requested_count * 0.6)):
			for _component in range(4):
				next_unit()

var _failures: Array = []
var _assertions = 0
var _constructor_calls = 0
var _summon_calls = 0

func _initialize() -> void:
	var only = ""
	var oracle_path = "res://native-type3-oracle.json"
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			only = argument.trim_prefix("--only=")
		if argument.begins_with("--oracle="):
			oracle_path = argument.trim_prefix("--oracle=")
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(oracle_path))
	if not oracle is Dictionary or not oracle.get("cases") is Array:
		printerr("invalid native constructor oracle fixture")
		quit(2)
		return
	var checks = {
		"canonical_constructor_parity": func(): _check_constructor_parity(oracle),
		"constructor_refusal_and_identity": _check_refusal,
		"summon_consumer_and_fx_order": _check_summon_order,
		"coordinate_skin_and_independent_defense": _check_skin_and_defense
	}
	var results: Array = []
	for check_name in checks:
		if not only.is_empty() and only != check_name:
			continue
		var before = _failures.size()
		checks[check_name].call()
		results.append({"name": check_name, "pass": _failures.size() == before})
	var result = {"checks": results, "assertions": _assertions, "failures": _failures,
		"explicit_constructor_calls": _constructor_calls, "explicit_summon_calls": _summon_calls,
		"automatic_physics_ticks": 0, "automatic_process_frames": 0, "texture_imports": 0,
		"public_play_verified": false, "type7_registered": false}
	print("TYPE3_SPAWN_RESULT " + JSON.stringify(result))
	quit(0 if _failures.is_empty() else 1)

func _generator(stream: Stream) -> RefCounted:
	var generator = RecipeScript.new()
	_expect(generator.configure(stream.next_unit, stream.can_move, stream.safe_point), "fixture configure")
	return generator

func _check_constructor_parity(oracle: Dictionary) -> void:
	for scenario in oracle["cases"]:
		var stream = Stream.new(scenario["draws"])
		if scenario["moveTo"] != null:
			stream.blocked = true
			stream.moved_to = scenario["moveTo"]
		var generator = _generator(stream)
		_constructor_calls += 1
		var built = generator.build_child(float(scenario["x"]), float(scenario["y"]), scenario["context"], int(scenario["el"]))
		_expect(built["valid"], "native " + scenario["name"] + " valid")
		if not built["valid"]:
			continue
		var recipe: Dictionary = built["recipe"]
		for key in scenario["result"]:
			_expect(_same(recipe.get(key), scenario["result"][key]), scenario["name"] + ":" + key)
		_expect(stream.index == int(scenario["rng_count"]), scenario["name"] + ": exact random calls")
		_expect(recipe["constructor_rng_draws"] == stream.index, scenario["name"] + ": receipt")
		_expect(stream.collision_calls[0][2] == 10.0, scenario["name"] + ": pre-radius collision")

func _check_refusal() -> void:
	var stream = Stream.new([])
	var generator = _generator(stream)
	for invalid_context in [{}, {"stage": 1, "room": -1, "player_level": 1, "difficulty": 5, "stage_difficulty_offset": 0}, {"stage": 0, "room": -1, "player_level": 1, "difficulty": 11, "stage_difficulty_offset": 0}]:
		_constructor_calls += 1
		_expect(not generator.build_child(10.0, 20.0, invalid_context, 0)["valid"], "invalid context rejected")
	_constructor_calls += 1
	_expect(not generator.build_child(10.0, 20.0, NORMAL, 6)["valid"], "energy element not forced to six")
	stream.blocked = true
	_constructor_calls += 1
	_expect(generator.build_child(10.0, 20.0, NORMAL, 0)["error"] == "source_safe_point_unavailable", "blocked source constructor explicit")
	_expect(stream.index == 0, "all preflight/collision refusals consume no RNG")
	_summon_calls += 1
	_expect(not generator.summon_type7(10.0, 20.0, NORMAL, Callable(), stream.source_add_parts)["valid"], "no invented missing child consumer")
	_expect(stream.index == 0, "missing consumer does not draw count")
	var rejected_stream = Stream.new([0.0, 0.0, 0.0, 0.0] + _normal_draws())
	rejected_stream.reject_child = true
	var rejected_generator = _generator(rejected_stream)
	_summon_calls += 1
	var rejected = rejected_generator.summon_type7(4075.0, 340.0, NORMAL, rejected_stream.accept_child, rejected_stream.source_add_parts)
	_expect(rejected["error"] == "child_consumer_rejected" and rejected["consumed_count"] == 0, "consumer rejection reported, no alias child")
	_expect(rejected_stream.fx_calls.is_empty() and rejected_stream.index == 13, "rejected child has no invented FX or later draw")

func _check_summon_order() -> void:
	var draws: Array = [0.9, 0.0, 0.5, 0.0] + _normal_draws()
	draws.append_array(_fx_draws())
	draws.append_array([0.25, 0.75, 0.9, 0.01, 0.75])
	draws.append_array(_eight_draws())
	draws.append_array(_fx_draws())
	var stream = Stream.new(draws)
	var generator = _generator(stream)
	_summon_calls += 1
	var result = generator.summon_type7(4075.0, 340.0, NORMAL, stream.accept_child, stream.source_add_parts)
	_expect(result["valid"] and result["consumed_count"] == 2, "two native children consumed")
	_expect(stream.index == 58, "count + first/second constructor + interleaved particle stream")
	_expect(stream.consumed[0]["el"] == 0 and stream.consumed[1]["el"] == 5, "independent physical and holy elements")
	_expect(stream.consumed[0]["elite"] == 0 and stream.consumed[1]["mods"] == ["M30"], "child re-roll keeps elite/mod branch")
	_expect(stream.fx_calls[0][4] == 13 and stream.fx_calls[1][4] == 42, "FX called after each consumed child")
	_expect(_same(stream.consumed[0]["x"], 4115.0) and _same(stream.consumed[0]["y"], 340.0), "first source polar placement")
	_expect(_same(stream.consumed[1]["x"], 4075.0 + cos(PI + 0.25) * 45.0), "second source polar placement after FX stream")
	_expect(result["parent_recovery_ticks"] == 50 and result["full_type7_actor_registered"] == false, "recovery recipe does not promote actor admission")
	var offset_stream = Stream.new([0.0, 0.0, 0.0, 0.0] + _normal_draws() + _fx_draws())
	offset_stream.blocked = true
	offset_stream.moved_to = {"x": 5000.0, "y": 1000.0}
	var offset_generator = _generator(offset_stream)
	_summon_calls += 1
	var offset = offset_generator.summon_type7(4075.0, 340.0, NORMAL, offset_stream.accept_child, offset_stream.source_add_parts)
	_expect(offset["valid"], "source-safe relocated child consumed")
	_expect(offset_stream.consumed[0]["x"] == 5000.0 and offset_stream.fx_calls[0][0] == 4105.0, "native FX stays at proposed sx while actor uses safe x")

func _check_skin_and_defense() -> void:
	for index in range(40):
		# These integer coordinates produce canonical seed%40 = index; recipe
		# maps every native cell without parent flesh_crawler substitution.
		var x: float = float((index - 21) * 31)
		var expected_index: int = ((21 + int(x * 31.0)) & 0x7fffffff) % 40
		var skin = RecipeScript.skin_from_spawn_x(x)
		_expect(skin["index"] == expected_index and skin["col"] == expected_index % 8 and skin["row"] == int(expected_index / 8), "coordinate atlas index " + str(index))
		_expect(skin["cell"] == 256 and not str(skin["skin"]).is_empty(), "original256 cell")
	var stream = Stream.new(_normal_draws() + [0.01, 0.25] + _eight_draws())
	var generator = _generator(stream)
	_constructor_calls += 2
	var normal: Dictionary = generator.build_child(4075.0, 340.0, NORMAL, 0)["recipe"]
	var magic: Dictionary = generator.build_child(4125.0, 340.0, NORMAL, 2)["recipe"]
	_expect(normal["hp"] == 437 and normal["poise"] == 875.0, "normal half HP preserves full poise")
	_expect(magic["hp"] == 875 and magic["poise"] == 1751.0 and magic["mods"] == ["M29"], "magic half HP preserves source M29/full poise")
	_expect(normal["eShield"] == 0 and magic["eShieldMax"] == 0, "source summon shield clear")
	normal["modT"]["eliteBusy"] = 54.0
	normal["kb"]["x"] = 10.0
	normal["eRes"][0] = 1.0
	_expect(magic["modT"]["eliteBusy"] == 0.0 and magic["kb"]["x"] == 0.0 and magic["eRes"][0] == 0, "new child dictionaries never alias owner/sibling")
	_expect(NORMAL["room"] == -1 and NORMAL["player_level"] == 1, "source context stays unchanged")

func _normal_draws() -> Array:
	return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]

func _eight_draws() -> Array:
	return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]

func _fx_draws() -> Array:
	return [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]

func _same(a: Variant, b: Variant) -> bool:
	if (a is float or a is int) and (b is float or b is int):
		return absf(float(a) - float(b)) <= maxf(0.000000001, absf(float(b)) * 0.000000000001)
	if a is Array and b is Array:
		if a.size() != b.size():
			return false
		for index in range(a.size()):
			if not _same(a[index], b[index]):
				return false
		return true
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size():
			return false
		for key in b:
			if not a.has(key) or not _same(a[key], b[key]):
				return false
		return true
	return a == b

func _expect(condition: bool, label: String) -> void:
	_assertions += 1
	if not condition:
		_failures.append(label)
