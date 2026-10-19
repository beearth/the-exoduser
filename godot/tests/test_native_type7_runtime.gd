extends SceneTree
## NEW runtime assembly only. Actual World/Player/emitter/type7/TP/M30.
## M29 constructor-request services are explicitly NOT actual public Q/E,
## warning/impact/audio providers. No natural summon or combat is proved.
## No old successful test script is loaded/replayed; no private live setters.

const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")
const EmitterScript = preload("res://scripts/native_element_projectile_emitter.gd")
const RuntimeScript = preload("res://scripts/native_type7_runtime.gd")
const GROUPS = ["m29_unavailable_atomicity", "exact_source_actual_assembly"]
const CAPABILITIES = ["combat_qe", "warning_fx", "impact_fx", "detonate_sound"]
const DIRECTIONS = ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"]
const NATIVE_FLAGS = ["_ch1StartMedium", "_firstShot", "_mob8dir", "_mobCh", "_mob8Col", "_mob8Row", "ib", "_iceOnHit", "_iceFreeze", "_lavaBurn"]

class ConstructorServices extends RefCounted:
	var unavailable: String
	var requests: Array = []

	func _init(missing: String = "") -> void:
		unavailable = missing

	func m29_readiness() -> Dictionary:
		var value = {"combat_qe": true, "warning_fx": true, "impact_fx": true, "detonate_sound": true, "constructor_request_services_only": true, "public_Q_E_evidence": false, "actual_sound_evidence": false}
		if not unavailable.is_empty(): value[unavailable] = false
		return value

	func summon_context() -> Dictionary:
		# Constructor context, no actual child is spawned in these far fixtures.
		return {"stage": 0, "room": 0, "player_level": 1, "difficulty": 5, "stage_difficulty_offset": 0, "constructor_context_only": true}

	func player_context(target: Node2D) -> Dictionary:
		var snapshot: Dictionary = target.get_snapshot()
		return {"x": target.global_position.x, "y": target.global_position.y, "r": target.get("radius"), "hp": snapshot["hp"], "iframes": snapshot["iframes"], "state": snapshot["state"], "parry_window": false, "constructor_request_context_only": true}

	func handle_m29_parry(_actor: Node2D, _target: Node2D, event: Dictionary) -> bool:
		requests.append({"kind": "parry_request", "event": event.duplicate(true), "public_Q_E_evidence": false})
		return false

	func emit_m29_event(_actor: Node2D, event: Dictionary) -> void:
		requests.append({"kind": "M29_request", "event": event.duplicate(true), "actual_public_FX_audio_evidence": false})

class PhaseStopper extends Node:
	var condition: Callable
	var updates = 0
	var limit: int
	var stopped = false
	var timed_out = false

	func _init(predicate: Callable, maximum: int) -> void:
		condition = predicate
		limit = maximum
		process_mode = Node.PROCESS_MODE_PAUSABLE
		process_physics_priority = 100

	func _physics_process(_delta: float) -> void:
		updates += 1
		if condition.call() == true:
			stopped = true
			get_tree().paused = true
		elif updates >= limit:
			timed_out = true
			get_tree().paused = true

var _record: Dictionary
var _original_record: Dictionary
var _only: Array = []
var _ledger_path = ""
var _group = ""
var _failures = 0
var _executed: Array = []
var _passing: Array = []
var _observations: Dictionary = {}
var _automatic_updates = 0

func _initialize() -> void:
	paused = true
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon", "cancel_charge"]:
		if not InputMap.has_action(action): InputMap.add_action(action)
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="): _only = Array(argument.trim_prefix("--only=").split(","))
		elif argument.begins_with("--ledger="): _ledger_path = argument.trim_prefix("--ledger=")
	call_deferred("_run")

func _run() -> void:
	var source: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))
	if not _expect(source is Dictionary and source.get("records") is Array and source["records"].size() == 16, "actual source has its16 original records"):
		_finish()
		return
	_record = source["records"][3]
	_original_record = _record.duplicate(true)
	for selected in _only: _expect(GROUPS.has(selected), "unknown --only group must fail: " + str(selected))
	for name in GROUPS:
		if not _only.is_empty() and not _only.has(name): continue
		_group = name
		_executed.append(name)
		var before = _failures
		match name:
			"m29_unavailable_atomicity": _m29_unavailable_atomicity()
			"exact_source_actual_assembly": await _exact_source_actual_assembly()
		if before == _failures:
			_passing.append(name)
			print("PASS ", name)
		else:
			print("FAIL ", name)
	_expect(_record == _original_record, "test's original source record is still unchanged")
	_finish()

func _finish() -> void:
	var result = {"executed_groups": _executed, "passing_groups": _passing, "failed_assertions": _failures, "only": _only, "automatic_fixture_physics_updates": _automatic_updates, "explicit_product_physics_calls": 0, "live_app_inputs": 0, "live_private_HP_position_state_clock_writes": 0, "old_successful_group_replay": 0, "source_PNG_hash_copy_extract": 0, "Main_factory_source_admission_promoted": false, "public_Q_E_evidence": false, "public_play_or_pixel_evidence": false, "natural_summon_or_combat_evidence": false, "performance_evidence": false, "observations": _observations}
	if not _ledger_path.is_empty():
		var output = FileAccess.open(_ledger_path, FileAccess.WRITE)
		if output == null:
			_failures += 1
			result["failed_assertions"] = _failures
			printerr("ASSERT_FAIL ledger destination could not be opened: ", _ledger_path)
		else:
			output.store_string(JSON.stringify(_plain(result), "\t") + "\n")
			output.close()
	var summary = result.duplicate()
	summary.erase("observations")
	summary["observation_groups"] = _observations.keys()
	summary["ledger_path"] = _ledger_path
	print("GODOT_NATIVE_TYPE7_RUNTIME_RESULT ", JSON.stringify(_plain(summary)))
	quit(0 if _failures == 0 else 1)

func _expect(value: bool, label: String) -> bool:
	if not value:
		_failures += 1
		printerr("ASSERT_FAIL [%s] %s" % [_group, label])
	return value

func _near(actual: float, expected: float, label: String) -> void:
	_expect(absf(actual - expected) < 0.0001, "%s actual=%s expected=%s" % [label, actual, expected])

func _numeric_equal(actual: Variant, expected: Variant) -> bool:
	if (actual is int or actual is float) and (expected is int or expected is float):
		return is_finite(float(actual)) and is_finite(float(expected)) and absf(float(actual) - float(expected)) < 0.000001
	if actual is Array and expected is Array:
		if actual.size() != expected.size(): return false
		for index in range(actual.size()):
			if not _numeric_equal(actual[index], expected[index]): return false
		return true
	if actual is Dictionary and expected is Dictionary:
		if actual.size() != expected.size(): return false
		for key in actual:
			if not expected.has(key) or not _numeric_equal(actual[key], expected[key]): return false
		return true
	return actual == expected

func _plain(value: Variant) -> Variant:
	if value is Vector2: return [value.x, value.y]
	if value is Color: return value.to_html(true)
	if value is Dictionary:
		var output: Dictionary = {}
		for key in value: output[str(key)] = _plain(value[key])
		return output
	if value is Array:
		var output: Array = []
		for entry in value: output.append(_plain(entry))
		return output
	if value is Object: return "actual_object_reference_observed_not_serialized"
	return value

func _fixture() -> Dictionary:
	paused = true
	var world = WorldScript.new()
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	root.add_child(world)
	_expect(world.ready_for_player, "actual World ready path completed")
	var player = PlayerScript.new()
	player.position = world.get_start_position() # source start, before tree
	player.set_world(world)
	world.add_child(player)
	world.set_player(player)
	var camera = Camera2D.new()
	camera.position = world.get_start_position()
	world.add_child(camera)
	camera.make_current()
	var emitter = EmitterScript.new()
	_expect(emitter.configure(world, player), "actual six-element emitter is ready")
	world.add_child(emitter)
	_expect(world.bind_native_projectile_emitter(emitter), "actual World binds its actual emitter child")
	var events: Array = []
	world.telemetry_event.connect(func(kind: String, value: Dictionary): events.append({"kind": kind, "data": value.duplicate(true)}))
	return {"world": world, "player": player, "emitter": emitter, "events": events, "identity": world.get_native_world_identity()}

func _services(f: Dictionary, provider: ConstructorServices) -> Dictionary:
	return {"projectile_emitter": f["emitter"], "summon_context": provider.summon_context, "type3_interfaces": {"render_body": true, "native_random": Callable(f["world"], "sample_native_random_unit"), "emit_charged_projectile": Callable(f["emitter"], "emit"), "player_context": provider.player_context, "element_multiplier": Callable(f["player"], "get_native_element_multiplier"), "is_tile_wall": Callable(f["world"], "is_world_blocked"), "handle_m29_parry": provider.handle_m29_parry, "emit_m29_event": provider.emit_m29_event, "m29_readiness": provider.m29_readiness}}

func _registry_orders(world: Node2D) -> Array:
	var result: Array = []
	for actor in world.get_enemies():
		var data: Variant = actor.get("data")
		if data is Dictionary and data.has("order"):
			result.append(int(data["order"]))
		else:
			_expect(false, "actual initial actor exposes original runtime source order")
	return result

func _helpers(world: Node2D) -> Dictionary:
	var tp: Array = []
	var m30: Array = []
	for child in world.get_children():
		if child.has_method("advance_idle") and child.has_method("advance_shot_warnings"): tp.append(child)
		elif child.has_method("advance_native") and child.has_method("render_native"): m30.append(child)
	return {"teleport": tp, "M30": m30}

func _dispose(f: Dictionary) -> void:
	paused = true
	f["world"].free()

func _m29_unavailable_atomicity() -> void:
	var f = _fixture()
	var report_before: Dictionary = f["world"].get_encounter_report()
	var registry_before: Array = f["world"].get_enemies().duplicate()
	var clock_before: Dictionary = f["world"].get_native_runtime_snapshot()
	var player_before: Dictionary = f["player"].get_snapshot()
	var child_count: int = f["world"].get_child_count()
	var observed: Array = []
	for capability in CAPABILITIES:
		var provider = ConstructorServices.new(capability)
		var services = _services(f, provider)
		var runtime = RuntimeScript.new()
		_expect(not runtime.configure(f["world"], f["player"], services), "missing M29 capability rejects actual configure: " + capability)
		var configured: Dictionary = runtime.get_snapshot()
		_expect(not configured["configured"] and configured["error"] == "unavailable_actual_M29_" + capability, "precise missing actual readiness reason is preserved")
		var prepared: Dictionary = runtime.prepare_actor(_record)
		var installed: Dictionary = runtime.install_actor(_record)
		_expect(prepared["valid"] == false and prepared["actor"] == null and installed["valid"] == false and installed["actor"] == null, "prepare/install reject before creating actual actor/helper")
		var after: Dictionary = runtime.get_snapshot()
		_expect(after["prepared"] == 0 and after["installed"] == 0 and after["metrics"]["prepared"] == 0, "no partially prepared or installed bundle survives")
		_expect(f["world"].get_child_count() == child_count and f["world"].get_enemies() == registry_before, "unavailable services add no World helper/registry/owner")
		_expect(f["world"].get_encounter_report() == report_before and f["world"].get_native_runtime_snapshot() == clock_before, "readiness rejection changes no report/clock/phase/RNG")
		_expect(f["player"].get_snapshot() == player_before and f["events"].is_empty(), "readiness rejection changes no actual player or World telemetry")
		_expect(services["type3_interfaces"]["m29_readiness"].call()[capability] == false, "composer never overwrites caller's unavailable readiness")
		_expect(provider.requests.is_empty(), "no fake M29 attack/parry/FX request is used to pass assembly")
		observed.append({"missing_capability": capability, "configure": configured, "prepare": prepared, "install": installed, "after": after, "public_Q_E_evidence": false})
		runtime.free()
	_expect(_record == _original_record and _record["native_final"].size() == 337, "actual original337-field record is intact after failed service binding")
	_observations[_group] = {"cases": observed, "registry_orders": _registry_orders(f["world"]), "actual_scene_updates": 0, "source_support": _record["support"], "source_runtime": _record["runtime"]}
	_dispose(f)

func _exact_source_actual_assembly() -> void:
	var f = _fixture()
	var provider = ConstructorServices.new()
	var runtime = RuntimeScript.new()
	_expect(runtime.configure(f["world"], f["player"], _services(f, provider)), "actual runtime accepts explicit allready constructor-request services")
	f["world"].add_child(runtime)
	var report_before: Dictionary = f["world"].get_encounter_report()
	var original_orders = _registry_orders(f["world"])
	_expect(report_before["source_count"] == 16 and report_before["supported_count"] == 6 and report_before["unsupported_count"] == 10, "fresh actual source default remains6/10 before explicit fixture installation")
	_expect(_record["id"] == "ch1_initial_004" and _record["order"] == 3 and _record["etype"] == 7 and _record["native_final"].size() == 337, "exact original record3/etype7/full337 is used")
	_expect(_record["support"]["runtime_supported"] == false and _record["runtime"] == null, "original source unsupported/runtimeNULL remains authoritative")
	var payload: Dictionary = RuntimeScript.project_actor_payload(_record)
	if not _expect(not payload.is_empty(), "valid JSON numeric geometry is projected into constructor payload"):
		_dispose(f)
		return
	for key in ["facing", "eShield", "eShieldMax", "eRes"]:
		_expect(_numeric_equal(payload[key], _record["native_final"][key]), "native constructor leaf uses actual raw source: " + key)
	for key in NATIVE_FLAGS:
		var source_has_flag: bool = _record["native_final"].has(key)
		_expect(payload["native_flags"].has(key) == source_has_flag, "native flag presence matches the actual source: " + key)
		if source_has_flag:
			_expect(payload["native_flags"][key] == _record["native_final"][key], "existing native flag value is preserved: " + key)
	_expect(payload["native_final"] == _record["native_final"] and payload["support"] == _record["support"] and payload["runtime"] == null, "projection does not rewrite raw337/support/runtime")
	_expect(_numeric_equal(payload["animation"]["base_rect"], [1536, 0, 256, 256]), "actual flesh_crawler base col6/row0 is projected")
	_expect(_numeric_equal(payload["animation"]["walk_frame_rects"], [[6144, 0, 256, 256], [6400, 0, 256, 256], [6656, 0, 256, 256], [6912, 0, 256, 256]]), "actual source walk columns24..27 are projected")
	_expect(payload["animation"]["direction_angle_sectors"] == DIRECTIONS, "source east-first direction order is preserved")
	_expect(_record == _original_record, "projection is a detached constructor payload")
	var baseline_children: int = f["world"].get_child_count()
	var prepared: Dictionary = runtime.prepare_actor(_record)
	if not _expect(prepared["valid"] == true and is_instance_valid(prepared["actor"]), "actual type7/TP/M30 bundle prepares"):
		_dispose(f)
		return
	var prepared_actor: Node2D = prepared["actor"]
	_expect(prepared_actor.get_parent() == null and prepared_actor.get_snapshot()["source_owner_dispatch_ready"], "actual prepared actor is ready but not prematurely installed")
	_expect(f["world"].get_child_count() == baseline_children and f["world"].get_encounter_report() == report_before, "prepare creates no actual World helper/registry/report entry")
	_expect(runtime.dispose_prepared_actor(prepared_actor), "public dispose cleans the actual unparented actor/helper bundle")
	_expect(not is_instance_valid(prepared_actor) and runtime.get_snapshot()["prepared"] == 0, "disposed prepared actor is actually released")
	var installed: Dictionary = runtime.install_actor(_record)
	if not _expect(installed["valid"] == true and is_instance_valid(installed["actor"]), "actual World installs the complete runtime bundle"):
		_dispose(f)
		return
	var actor: Node2D = installed["actor"]
	var helpers = _helpers(f["world"])
	_expect(helpers["teleport"].size() == 1 and helpers["M30"].size() == 1, "one actual TP and one actual M30 helper are World siblings")
	for kind in ["teleport", "M30"]:
		for helper in helpers[kind]: _expect(helper.get_snapshot()["configured"] and helper.is_node_ready(), "installed actual helper is configured and ready: " + kind)
	for helper in helpers["M30"]:
		_expect(not helper.is_processing() and actor.is_processing(), "actual type7 actor is the sole M30 render driver")
	var orders = original_orders.duplicate()
	orders.append(3)
	orders.sort()
	_expect(_registry_orders(f["world"]) == orders and f["world"].get_enemies().has(actor), "actual registry inserts the source order3 among original consumers")
	_expect(is_same(f["identity"], f["world"].get_native_world_identity()), "source registry insertion preserves actual Array generation identity")
	_expect(installed["registry_result"]["source_order"] == 3 and installed["registry_result"]["registry_index"] == orders.find(3), "World returns actual inserted order/index")
	var report: Dictionary = f["world"].get_encounter_report()
	_expect(report["supported_count"] == 7 and report["unsupported_count"] == 9 and report["source_count"] == 16, "private fixture's explicit consumer overlay changes6/10 to7/9")
	var row: Dictionary = report["records"][3]
	_expect(row["record"] == _original_record and row["source_support"] == _record["support"] and row["record"]["runtime"] == null, "installed row preserves the original complete record and source supportfalse/runtimeNULL")
	_expect(row["status"] == "supported" and row["consumer_config"] == "res://scripts/native_type7_runtime.gd", "only the separate actual consumer overlay is supported")
	_expect(f["world"].get_native_runtime_snapshot()["initial_install_revision"] == 1, "actual World records one explicit initial consumer installation")
	var before_phase: Dictionary = actor.get_snapshot()
	_expect(before_phase["hp"] == 4377 and before_phase["eShield"] == 1751 and before_phase["poise"] == 1751, "source escort HP does not replace its original shield/poise")
	_expect(actor.global_position.distance_to(Vector2(4075.0, 340.0)) < 0.0001, "actual original type7 source position is used")
	_expect(f["player"].global_position.distance_to(f["world"].get_start_position()) < 0.0001, "actual Player remains at source start")
	_expect(not actor.is_physics_processing() and before_phase["autonomous_AI_physics"] == false and before_phase["type0_AI_called"] == false, "World is the sole AI driver without type0 alias")
	var body = actor.get_node_or_null("Body") as Sprite2D
	var walk = actor.get_node_or_null("WalkOverlay") as Sprite2D
	_expect(body != null and walk != null, "actual original body and walk sprite consumers exist")
	if body != null and walk != null:
		_expect(body.region_rect == Rect2(1536, 0, 256, 256) and walk.region_rect == Rect2(6144, 0, 256, 256), "actual source body/walk crop uses the projected geometry")
		var direction = int(floor((float(_record["native_final"]["facing"]) + TAU + PI / 8.0) / (PI / 4.0))) % 8
		_expect(body.texture != null and body.texture.resource_path == payload["animation"]["base_textures"][DIRECTIONS[direction]], "actual direction selects the original source base texture")
		_expect(walk.texture != null and walk.texture.resource_path == payload["animation"]["walk_textures"][DIRECTIONS[direction]], "actual direction selects the original source walk texture")
		_near(body.scale.y * 256.0, float(payload["animation"]["draw_height"]), "actual source draw height remains original")
	var report_installed = report.duplicate(true)
	var children_installed: int = f["world"].get_child_count()
	var clock_installed: Dictionary = f["world"].get_native_runtime_snapshot()
	var duplicate: Dictionary = runtime.install_actor(_record)
	_expect(duplicate["valid"] == false and duplicate["actor"] == null and duplicate.get("registry_result", {}).get("errors", []).has("initial_consumer_already_installed"), "duplicate source consumer is explicitly refused")
	var mismatched = _record.duplicate(true)
	mismatched["constructor_rejection_probe"] = true # detached invalid input
	var rejected: Dictionary = runtime.install_actor(mismatched)
	_expect(rejected["valid"] == false and rejected["actor"] == null and rejected.get("registry_result", {}).get("errors", []).has("initial_consumer_source_record_mismatch"), "complete prepared input with a mismatched source record is refused by actual World")
	_expect(f["world"].get_child_count() == children_installed and f["world"].get_encounter_report() == report_installed and f["world"].get_native_runtime_snapshot() == clock_installed, "both rejected installs clean helpers/registry/phase entries atomically")
	_expect(runtime.get_snapshot()["prepared"] == 0 and runtime.get_snapshot()["installed"] == 1 and runtime.get_snapshot()["runtime_fault"].is_empty(), "runtime has no orphan prepared bundle or false atomicity fault")
	var stopper = PhaseStopper.new(func(): return actor.get_snapshot()["native_phase_calls"] >= 1, 5)
	f["world"].add_child(stopper)
	paused = false
	var deadline = Time.get_ticks_msec() + 5000
	while not stopper.stopped and not stopper.timed_out and Time.get_ticks_msec() < deadline: await process_frame
	paused = true
	_automatic_updates += stopper.updates
	_expect(stopper.stopped and not stopper.timed_out, "actual automatic World owner phase completes once")
	stopper.free()
	var after_phase: Dictionary = actor.get_snapshot()
	_expect(after_phase["native_phase_calls"] == 1 and after_phase["warning_phase_calls"] == 1 and after_phase["last_phase"]["phase"] == "far_unalerted", "first actual owner and queue dispatch is one far-unalerted update")
	_near(float(after_phase["native_frame"]), f["world"].get_native_frame(), "actual owner receives actual global frame")
	_near(float(after_phase["contact_ticks"]), float(before_phase["contact_ticks"]), "far guard does not advance source st2")
	for timer in ["teleportT", "summonT"]:
		_near(float(after_phase["native_state"][timer]), float(before_phase["native_state"][timer]), "far guard does not consume natural episode timer: " + timer)
	_expect(runtime.get_snapshot()["metrics"]["summon_calls"] == 0 and runtime.get_snapshot()["metrics"]["child_registered"] == 0 and f["emitter"].get_snapshot()["metrics"]["accepted"] == 0, "no natural summon/combat/packet success is manufactured")
	var paused_frame: float = f["world"].get_native_frame()
	for index in range(3): await process_frame
	_near(f["world"].get_native_frame(), paused_frame, "actual SceneTree pause freezes the World clock")
	_expect(actor.get_snapshot() == after_phase, "actual pause freezes owner phase and source timers")
	_expect(_record == _original_record and actor.get("data")["native_final"] == _original_record["native_final"], "actual actor and report still retain original raw337")
	_expect(provider.requests.is_empty() and runtime.get_snapshot()["full_type7_admission_claimed"] == false, "constructor readiness is not promoted to actual M29/QE or Main admission")
	_observations[_group] = {"projection_native5": {"facing": payload["facing"], "eShield": payload["eShield"], "eShieldMax": payload["eShieldMax"], "eRes": payload["eRes"], "native_flags": payload["native_flags"]}, "animation": payload["animation"], "registry_orders_before": original_orders, "registry_orders_after": _registry_orders(f["world"]), "registry_result": installed["registry_result"], "private_fixture_supported_count": report["supported_count"], "private_fixture_unported_count": report["unsupported_count"], "source_record_fields": _record["native_final"].size(), "source_support": _record["support"], "source_runtime": _record["runtime"], "actor_before": before_phase, "actor_after_one_automatic_phase": after_phase, "duplicate": duplicate, "source_mismatch": rejected, "runtime": runtime.get_snapshot(), "world": f["world"].get_native_runtime_snapshot(), "constructor_services": provider.m29_readiness(), "public_Q_E_evidence": false, "natural_summon_combat_evidence": false, "pixel_quality_verified": false}
	_dispose(f)
