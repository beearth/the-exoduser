class_name ExoduserNativeSourcePlayerInitialization
extends RefCounted
## Manual, single-attempt pre-Tree source applyStats composition. Each write
## is committed only through the actual State/Authority sink at its anchor.
## No source formula, automatic clock, rollback or default domain is supplied.

const HEALTH = preload("res://port_modules/player_health_parameters_source/producer.gd")
const DEFENSE = preload("res://port_modules/player_defense_speed_parameters_source/producer.gd")
const SHIELD = preload("res://port_modules/player_shield_poise_parameters_source/producer.gd")
const EFFECTIVE = preload("res://port_modules/player_effective_stats_source/producer.gd")
const RESOURCE = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const STATE = preload("res://scripts/native_source_new_run_state.gd")
const AUTHORITY = preload("res://scripts/native_source_resource_authority.gd")
const SERVICES_SCHEMA = "exoduser.godot.source-player-initialization-services.v1"
const CALLBACK_ARITY = {"cohort_context": 0, "source_ready": 0,
	"write_sink": 2, "invalidate_sink": 1, "attack_early_plan": 0,
	"attack_crystal_plan": 0}
const HELPER_SCRIPTS = {"health": HEALTH, "defense_speed": DEFENSE,
	"shield_poise": SHIELD, "effective_stats": EFFECTIVE, "resource_parameters": RESOURCE}
const ATTACK_PACKETS = {
	"attack_early_plan": {"kind": "apply_stats_base_attack_early", "source": "game.html:28587-28588", "write_source": "game.html:28588"},
	"attack_crystal_plan": {"kind": "apply_stats_base_attack_crystal", "source": "game.html:28602", "write_source": "game.html:28602"}}

class Bridge extends RefCounted:
	var owner: WeakRef
	func _init(dispatcher: RefCounted) -> void:
		owner = weakref(dispatcher)
	func hp_packet(packet: Dictionary) -> bool:
		var d = owner.get_ref()
		return d._consume_health(packet) if is_instance_valid(d) else false
	func def_packet(packet: Dictionary) -> bool:
		var d = owner.get_ref()
		return d._consume_defense(packet) if is_instance_valid(d) else false
	func shield_packet(packet: Dictionary) -> bool:
		var d = owner.get_ref()
		return d._consume_writes(packet) if is_instance_valid(d) else false
	func effective_packet(packet: Dictionary) -> bool:
		var d = owner.get_ref()
		return d._consume_writes(packet) if is_instance_valid(d) else false
	func resource_packet(packet: Dictionary) -> bool:
		var d = owner.get_ref()
		return d._consume_resource_command(packet) if is_instance_valid(d) else false
	func resource_plan() -> Variant:
		var d = owner.get_ref()
		return d._resource_plan if is_instance_valid(d) and d.is_native_source_initialization_active() else null
	func crystal_stats() -> Variant:
		var d = owner.get_ref()
		return d._read_applied_crystal() if is_instance_valid(d) else null
	func cohort() -> Variant:
		var d = owner.get_ref()
		return d._cohort if is_instance_valid(d) and d.is_native_source_initialization_active() else null
	func current_cohort() -> Variant:
		var d = owner.get_ref()
		return d._cohort.get("cohort_id") if is_instance_valid(d) and d.is_native_source_initialization_active() else null

var _player: Node2D
var _world: Node
var _state: Node
var _resources: Node
var _services: Dictionary = {}
var _provider_maps: Dictionary = {}
var _bridge: Bridge
var _gap: RefCounted
var _owners: Array[Object] = []
var _configured = false
var _busy = false
var _attempted = false
var _completed = false
var _write_busy = false
var _error = "unconfigured"
var _attempt_id = 0
var _write_tag: Dictionary = {}
var _health_plan: Dictionary = {}
var _resource_plan: Dictionary = {}
var _cohort: Dictionary = {}
var _results: Dictionary = {}
var _trace: Array = []
var _committed_writes = 0
var _health_capture_calls = 0
var _resource_capture_calls = 0
var _resource_indices: Dictionary = {}
var _invalidation_count = 0

func configure(player: Node2D, world: Node, state: Node, resources: Node, services: Dictionary) -> bool:
	if _configured or _busy:
		return _fail("already_configured_or_reentrant")
	_busy = true
	var error = _binding_error(player, world, state, resources, services)
	if not error.is_empty():
		_busy = false
		return _fail(error)
	if not _ownership_error(player, world, state, resources).is_empty():
		_busy = false
		return _fail("owner_lost_during_source_readiness")
	_player = player
	_world = world
	_state = state
	_resources = resources
	_services = services.duplicate()
	_provider_maps = services["provider_maps"].duplicate(true)
	if not _context_error().is_empty():
		_busy = false
		return _fail("binding_lost_during_source_readiness")
	_bridge = Bridge.new(self)
	_gap = DEFENSE.HpInitialGapSeam.new()
	# All common source values/maps are supplied explicitly by the Main owner.
	# Replace only same-pass capture providers with this weak bridge.
	_provider_maps["health"][HEALTH.PROVIDER_CRYSTAL_STATS] = Callable(_bridge, "crystal_stats")
	_provider_maps["defense_speed"][DEFENSE.PROVIDER_RESOURCE_PLAN] = Callable(_bridge, "resource_plan")
	_provider_maps["defense_speed"][DEFENSE.PROVIDER_HP_MHP_28582] = Callable(_gap, "read")
	_provider_maps["shield_poise"][SHIELD.PROVIDER_RESOURCE_PLAN] = Callable(_bridge, "resource_plan")
	_provider_maps["effective_stats"][EFFECTIVE.PROVIDER_COHORT] = Callable(_bridge, "cohort")
	_provider_maps["effective_stats"][EFFECTIVE.PROVIDER_CURRENT_COHORT] = Callable(_bridge, "current_cohort")
	for key in CALLBACK_ARITY:
		_owners.append(_services[key].get_object())
	var bindings: Array = [
		_services["health"].configure(_provider_maps["health"], Callable(_bridge, "hp_packet")),
		_services["defense_speed"].configure(_provider_maps["defense_speed"], Callable(_bridge, "def_packet")),
		_services["shield_poise"].configure(_provider_maps["shield_poise"], Callable(_bridge, "shield_packet")),
		_services["effective_stats"].configure(_provider_maps["effective_stats"], Callable(_bridge, "effective_packet")),
		_services["resource_parameters"].configure(_provider_maps["resource_parameters"], Callable(_bridge, "resource_packet"))]
	for binding in bindings:
		if not binding is Dictionary or binding.get("ready") != true:
			_busy = false
			return _fail("original_helper_provider_binding_not_ready")
	if not _context_error().is_empty():
		_busy = false
		return _fail("actual_owner_lost_during_configuration")
	_configured = true
	_busy = false
	_error = ""
	return true

func get_native_source_initialization_player() -> Node2D:
	return _player if _configured and _identity_error().is_empty() else null

func get_native_source_initialization_world() -> Node:
	return _world if _configured and _identity_error().is_empty() else null

func get_native_source_initialization_completion() -> Dictionary:
	var valid = _configured and _identity_error().is_empty()
	return {"completed": _completed and valid, "owner_identity_valid": valid,
		"attempt_id": _attempt_id, "committed_writes": _committed_writes,
		"source_anchor_order_complete": _completed, "main_full_ready": false}

func is_native_source_initialization_active() -> bool:
	return _configured and _busy and _attempted and not _completed and _context_error().is_empty()

func get_native_source_initialization_write_tag() -> Dictionary:
	return _write_tag.duplicate(true) if _write_busy and is_native_source_initialization_active() else {}

func read_captured_resource_plan() -> Variant:
	return _resource_plan.duplicate(true) if is_native_source_initialization_active() and not _resource_plan.is_empty() else null

func read_captured_crystal_stats() -> Variant:
	return _read_applied_crystal()

func read_captured_cohort() -> Variant:
	return _cohort.duplicate(true) if is_native_source_initialization_active() and not _cohort.is_empty() else null

func read_current_initialization_cohort_id() -> Variant:
	return _cohort.get("cohort_id") if is_native_source_initialization_active() else null

func read_hp_initial_gap() -> Dictionary:
	return _gap.read() if is_native_source_initialization_active() else {"status": "NOT_READY", "reason": "initialization_hp_gap_inactive", "value": null}

func initialize_new_run() -> Dictionary:
	if _busy or not _configured or _attempted:
		return _failure_result("not_configured_or_initialization_already_attempted")
	var error = _binding_error(_player, _world, _state, _resources, _services)
	if not error.is_empty():
		return _failure_result(error)
	_busy = true
	_attempted = true
	_attempt_id = 1
	_error = ""
	_results.clear()
	_trace.clear()
	_resource_indices.clear()
	# Both plans are captured once before any source field write. No producer
	# reruns either plan in order to construct effective stats or shared _cr.
	var context: Variant = _call_service("cohort_context", [])
	if not _cohort_context_valid(context):
		return _stop("actual_prefix_cohort_context_not_ready")
	var stats: Variant = _provider_maps["effective_stats"][EFFECTIVE.PROVIDER_STATS].call()
	if not stats is Dictionary:
		return _stop("actual_prefix_stats_not_ready")
	var prefix: Dictionary = {}
	for key in EFFECTIVE.STATS_PREFIX_KEYS:
		if not stats.has(key):
			return _stop("actual_prefix_stats_missing:" + key)
		prefix[key] = stats[key]
	_health_capture_calls += 1
	_health_plan = _services["health"].plan_initial()
	if not _plan_ready(_health_plan, HEALTH.PHASE_INITIAL):
		return _stop("health_initial_capture_not_ready:" + str(_health_plan.get("reason", "invalid")))
	_resource_capture_calls += 1
	_resource_plan = _services["resource_parameters"].plan_apply_stats()
	if not _plan_ready(_resource_plan, RESOURCE.KIND_APPLY_STATS):
		return _stop("resource_capture_not_ready:" + str(_resource_plan.get("reason", "invalid")))
	_cohort = {"status": "READY", "cohort_id": context["cohort_id"],
		"authority": context["authority"], "current_main": context["current_main"],
		"stats_at_prefix": prefix, "hp_initial": {"cohort_id": context["cohort_id"], "plan": _health_plan},
		"resource_plan": {"cohort_id": context["cohort_id"], "plan": _resource_plan}}
	if not _run("effective_stats", "run_effective_stats", []):
		return _stop(_error)
	# Public source seam opens/acks the real Health pass using this capture.
	# Missing seam is rejected by configure, never replaced by a second plan.
	if not _run("health", "run_captured_initial", [_health_plan]):
		return _stop(_error)
	if not _consume_resource_anchors(["game.html:28593", "game.html:28594", "game.html:28600"]):
		return _stop(_error)
	if not _run("health", "run_phase", [HEALTH.PHASE_CRYSTAL_MHP]):
		return _stop(_error)
	if not _run_attack("attack_crystal_plan", ["game.html:28602"]):
		return _stop(_error)
	if not _run("defense_speed", "run_phase", [DEFENSE.PHASE_CRYSTAL]):
		return _stop(_error)
	if not _run("health", "run_phase", [HEALTH.PHASE_CRYSTAL_HPR]):
		return _stop(_error)
	if not _consume_resource_anchors(["game.html:28606", "game.html:28607", "game.html:28608",
			"game.html:28611", "game.html:28614"]):
		return _stop(_error)
	if not _run("health", "run_phase", [HEALTH.PHASE_FORTIFY]):
		return _stop(_error)
	if not _run("defense_speed", "run_phase", [DEFENSE.PHASE_ARMOR]):
		return _stop(_error)
	if not _run("shield_poise", "run_shield_stage", []):
		return _stop(_error)
	if _resource_indices.size() != _resource_plan["packet"]["writes"].size():
		return _stop("unconsumed_source_resource_write")
	if not _run("resource_parameters", "run_recalc_st", []):
		return _stop(_error)
	_completed = true
	_busy = false
	_write_tag.clear()
	return {"status": "READY", "ready": true, "reason": "", "completed": true,
		"attempt_id": _attempt_id, "committed_writes": _committed_writes,
		"source_anchor_order_complete": true, "main_full_ready": false,
		"full_source_query_order_proven": false}

func _consume_health(packet: Dictionary) -> bool:
	if not is_native_source_initialization_active() or not _packet_shape_valid(packet):
		return _fail("health_packet_not_admitted")
	var writes: Array = packet["writes"]
	for index in range(writes.size()):
		if not _commit_write(packet, index):
			return false
		if packet["kind"] == HEALTH.PHASE_INITIAL and index == 0:
			if writes[index].get("source") != "game.html:28582":
				return _fail("health_initial_write0_wrong_source")
			_gap.open(float(writes[index]["value"]), int(packet["pass_id"]))
			var accepted = _run("defense_speed", "run_phase", [DEFENSE.PHASE_EARLY])
			_gap.close()
			if not accepted or not _consume_resource_anchors(["game.html:28591"]):
				return false
	return true

func _consume_defense(packet: Dictionary) -> bool:
	if not is_native_source_initialization_active() or not _packet_shape_valid(packet):
		return _fail("defense_packet_not_admitted")
	for index in range(packet["writes"].size()):
		if not _commit_write(packet, index):
			return false
		if packet["kind"] == DEFENSE.PHASE_EARLY and index == 0:
			if packet["writes"][index].get("source") != "game.html:28583":
				return _fail("defense_early_write0_wrong_source")
			if not _run("shield_poise", "run_poise_init_stage", []) \
					or not _run_attack("attack_early_plan", ["game.html:28587", "game.html:28588"]):
				return false
	return true

func _consume_writes(packet: Dictionary) -> bool:
	if not _packet_shape_valid(packet):
		return _fail("invalid_original_source_packet")
	for index in range(packet["writes"].size()):
		if not _commit_write(packet, index):
			return false
	return true

func _consume_resource_anchors(anchors: Array) -> bool:
	if not is_native_source_initialization_active() or not _plan_ready(_resource_plan, RESOURCE.KIND_APPLY_STATS):
		return _fail("captured_resource_plan_not_admitted")
	var packet: Dictionary = _resource_plan["packet"]
	for index in range(packet["writes"].size()):
		if packet["writes"][index].get("source") in anchors:
			if _resource_indices.has(index):
				return _fail("duplicate_captured_resource_write")
			if not _commit_write(packet, index):
				return false
			_resource_indices[index] = true
	return true

func _consume_resource_command(packet: Dictionary) -> bool:
	if not is_native_source_initialization_active():
		return _fail("resource_command_not_admitted")
	if packet.get("kind") == RESOURCE.KIND_INVALIDATE:
		if _invalidation_count != 0 or packet != RESOURCE.invalidate_packet():
			return _fail("invalid_or_duplicate_source_invalidation")
		_trace.append({"kind": packet["kind"], "source": packet["source"], "writes": 0})
		var accepted: Variant = _call_service("invalidate_sink", [packet.duplicate(true)])
		if not accepted is bool or not accepted:
			return _fail("source_invalidation_sink_rejected")
		_invalidation_count += 1
		return true
	if packet.get("kind") != RESOURCE.KIND_RECALC_ST or _invalidation_count != 1:
		return _fail("source_recalc_not_after_invalidation")
	return _consume_writes(packet)

func _run_attack(service: String, anchors: Array) -> bool:
	var plan: Variant = _call_service(service, [])
	if not plan is Dictionary or plan.get("status") != "READY" or plan.get("ready") != true \
			or not _packet_shape_valid(plan.get("packet")):
		return _fail("actual_attack_producer_not_ready:" + service)
	var packet: Dictionary = plan["packet"]
	var expected: Dictionary = ATTACK_PACKETS[service]
	if packet["kind"] != expected["kind"] or packet["source"] != expected["source"] \
			or packet["writes"].size() != 1:
		return _fail("attack_packet_wrong_original_kind_or_source")
	for write in packet["writes"]:
		if write.get("field") != "baseAtk" or write.get("source") not in anchors \
				or write.get("source") != expected["write_source"]:
			return _fail("attack_packet_wrong_source_anchor")
	if packet["writes"].is_empty():
		return _fail("actual_attack_write_missing")
	_results[service] = plan.duplicate(true)
	return _consume_writes(packet)

func _run(helper: String, method: String, args: Array) -> bool:
	if not is_native_source_initialization_active() or not _live(_services.get(helper)):
		return _fail("helper_lost_before_phase:" + helper)
	var result: Variant = _services[helper].callv(method, args)
	_results[helper + ":" + method + ":" + str(args[0] if not args.is_empty() and args[0] is String else "")] = result.duplicate(true) if result is Dictionary else {}
	if not result is Dictionary or result.get("status") != "READY" or result.get("ready") != true:
		return _fail(_error if not _error.is_empty() else helper + ":" + str(result.get("reason", "invalid_result") if result is Dictionary else "invalid_result"))
	return is_native_source_initialization_active()

func _commit_write(packet: Dictionary, index: int) -> bool:
	if _write_busy or not is_native_source_initialization_active() or not _packet_shape_valid(packet) \
			or index < 0 or index >= packet["writes"].size():
		return _fail("source_write_not_admitted")
	var write: Dictionary = packet["writes"][index]
	var pass_id: Variant = packet.get("pass_id", _attempt_id)
	_write_tag = {"field": write["field"], "source": write["source"], "kind": packet["kind"], "pass_id": pass_id}
	_write_busy = true
	var accepted: Variant = _services["write_sink"].call(packet.duplicate(true), index)
	_write_busy = false
	_write_tag.clear()
	if not accepted is bool or not accepted or not is_native_source_initialization_active():
		return _fail("actual_source_write_sink_rejected:" + str(write["field"]) + "@" + str(write["source"]))
	_committed_writes += 1
	_trace.append({"field": write["field"], "source": write["source"],
		"kind": packet["kind"], "pass_id": pass_id, "write_index": index})
	return true

func _read_applied_crystal() -> Variant:
	if not is_native_source_initialization_active() or not _resource_plan.get("values") is Dictionary:
		return null
	var p: Variant = _state.read_current_p()
	var cr: Variant = _resource_plan["values"].get("_crystalStats")
	if not p is Dictionary or not cr is Dictionary or not p.get("_crystalStats") is Dictionary \
			or p["_crystalStats"] != cr:
		return null
	return {"status": "READY", "value": p["_crystalStats"],
		"stage": "actual_source_28600:cohort:" + str(_cohort["cohort_id"])}

func _call_service(key: String, args: Array) -> Variant:
	if not is_native_source_initialization_active() or not _callable_live(_services.get(key), args.size()):
		return null
	return _services[key].callv(args)

static func _binding_error(player: Variant, world: Variant, state: Variant, resources: Variant, services: Dictionary) -> String:
	var error = _ownership_error(player, world, state, resources)
	if not error.is_empty():
		return error
	if services.get("schema") != SERVICES_SCHEMA or not services.get("provider_maps") is Dictionary:
		return "missing_initialization_service_schema_or_maps"
	for key in HELPER_SCRIPTS:
		var helper: Variant = services.get(key)
		if not _live(helper) or helper.get_script() != HELPER_SCRIPTS[key] \
				or not services["provider_maps"].get(key) is Dictionary:
			return "missing_original_source_helper_or_map:" + key
		for value in services["provider_maps"][key].values():
			if not value is Callable or not value.is_valid() or not _live(value.get_object()):
				return "missing_live_source_provider_callback:" + key
	if not services["health"].has_method("run_captured_initial"):
		return "missing_public_captured_health_initial_consumer"
	for key in CALLBACK_ARITY:
		if not _callable_live(services.get(key), CALLBACK_ARITY[key]):
			return "missing_actual_initialization_callback:" + key
	var ready: Variant = services["source_ready"].call()
	if not ready is bool or not ready:
		return "actual_initialization_source_dependencies_not_ready"
	return ""

static func _ownership_error(player: Variant, world: Variant, state: Variant, resources: Variant) -> String:
	if not _live(player) or not _live(world) or not _live(state) or not _live(resources):
		return "missing_live_initialization_owners"
	if player.is_inside_tree() or player.is_node_ready():
		return "source_initialization_requires_new_pre_tree_actor"
	if player.get_parent() != null:
		return "source_initialization_requires_unparented_new_actor"
	if state.get_script() != STATE or resources.get_script() != AUTHORITY:
		return "actual_initialization_holder_script_mismatch"
	if not player.has_method("get_combat_world") or player.get_combat_world() != world \
			or state.get_native_new_run_player() != player or state.get_native_new_run_world() != world \
			or resources.get_native_regen_player() != player or resources.get_native_regen_world() != world:
		return "actual_initialization_actor_world_mismatch"
	if world.get("player") != null and world.get("player") != player:
		return "initialization_world_has_another_actor"
	for node in [state, resources]:
		if node.get_parent() != null and node.get_parent() != world:
			return "initialization_holder_reparented"
	if world.is_inside_tree() and world.get_tree().paused:
		return "initialization_world_paused"
	return ""

func _context_error() -> String:
	var error = _ownership_error(_player, _world, _state, _resources)
	if not error.is_empty():
		return error
	for key in HELPER_SCRIPTS:
		if not _live(_services.get(key)):
			return "initialization_helper_freed:" + key
	for key in CALLBACK_ARITY:
		if not _callable_live(_services.get(key), CALLBACK_ARITY[key]):
			return "initialization_callback_freed:" + key
	return ""

func _identity_error() -> String:
	if not _completed or not _live(_player) or not _player.is_inside_tree():
		return _ownership_error(_player, _world, _state, _resources)
	# Completion is a historical source write receipt, not a renewed write
	# window. Identity reads survive canonical Main sibling Tree installation.
	if not _live(_world) or not _live(_state) or not _live(_resources):
		return "completed_initialization_owner_lost"
	if _state.get_script() != STATE or _resources.get_script() != AUTHORITY \
			or _player.get_combat_world() != _world or _world.get("player") != _player \
			or _state.get_native_new_run_player() != _player or _state.get_native_new_run_world() != _world \
			or _resources.get_native_regen_player() != _player or _resources.get_native_regen_world() != _world:
		return "completed_initialization_identity_mismatch"
	for node in [_state, _resources]:
		if node.get_parent() != _world or not node.is_inside_tree() or node.get_tree() != _player.get_tree():
			return "completed_initialization_holder_tree_mismatch"
	if not _world.is_inside_tree() or _world.get_tree() != _player.get_tree():
		return "completed_initialization_world_tree_mismatch"
	return ""

static func _packet_shape_valid(packet: Variant) -> bool:
	if not packet is Dictionary or not packet.get("kind") is String \
			or not packet.get("source") is String or not packet.get("writes") is Array:
		return false
	for write in packet["writes"]:
		if not write is Dictionary or not write.get("field") is String \
				or not write.get("source") is String or not write.has("value"):
			return false
	return true

static func _plan_ready(plan: Dictionary, kind: String) -> bool:
	return plan.get("status") == "READY" and plan.get("ready") == true \
		and _packet_shape_valid(plan.get("packet")) and plan["packet"]["kind"] == kind

static func _cohort_context_valid(context: Variant) -> bool:
	if not context is Dictionary or not context.get("authority") is String \
			or String(context["authority"]).is_empty() or not context.get("current_main") is bool:
		return false
	var id: Variant = context.get("cohort_id")
	return id is int or (id is String and not String(id).is_empty())

static func _callable_live(value: Variant, count: int) -> bool:
	return value is Callable and value.is_valid() and value.get_argument_count() == count \
		and _live(value.get_object())

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())

func _fail(error: String) -> bool:
	_error = error
	return false

func _failure_result(error: String) -> Dictionary:
	_error = error
	return {"status": "NOT_READY", "ready": false, "reason": error,
		"attempted": _attempted, "committed_writes": _committed_writes,
		"prefix_rolled_back": false, "main_full_ready": false}

func _stop(error: String) -> Dictionary:
	_gap.close()
	_write_busy = false
	_write_tag.clear()
	_busy = false
	return _failure_result(error)

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "attempted": _attempted, "completed": _completed,
		"completion": get_native_source_initialization_completion(),
		"active": is_native_source_initialization_active(), "error": _error,
		"attempt_id": _attempt_id, "committed_writes": _committed_writes,
		"write_tag": get_native_source_initialization_write_tag(), "trace": _trace.duplicate(true),
		"results": _results.duplicate(true), "cohort": _cohort.duplicate(true),
		"health_capture_calls": _health_capture_calls, "resource_capture_calls": _resource_capture_calls,
		"source_invalidation_count": _invalidation_count,
		"captured_resource_writes_consumed": _resource_indices.size(),
		"automatic_physics": false, "automatic_input": false, "source_formulas_reimplemented": false,
		"prefix_rolled_back": false, "run_health_subset_calls": 0, "run_apply_stats_calls": 0,
		"main_full_ready": false, "full_source_query_order_proven": false, "public_play_proven": false}
