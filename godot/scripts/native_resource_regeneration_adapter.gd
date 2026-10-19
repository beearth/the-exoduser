class_name ExoduserNativeResourceRegenerationAdapter
extends RefCounted
## Strict source-rate integration only. The actual resource authority owns the
## synchronous atomic ST -> MP commit. No default MP, direct actor writes,
## legacy aggregate, extra holy multiplier, automatic input or physics driver.

const NATURAL = preload("res://port_modules/resource_regeneration_source/producer.gd")
const RATES = preload("res://port_modules/regeneration_stat_source/producer.gd")
const DOME = preload("res://port_modules/holy_dome_presence_source/producer.gd")
const CONTEXT_SCHEMA = "exoduser.godot.native-projectile-fx-context.v1"
const SOURCE_PHASE = "after_holy_dome_flat_and_hp_before_demon_rev_cd"
const STATE_FIELDS = ["s", "st", "mst", "mp", "mmp", "stR", "mpR"]

# The source producer retains method Callable owners. Retaining this bridge
# with only a weak adapter reference avoids adapter -> producer -> adapter.
class CommitBridge extends RefCounted:
	var adapter: WeakRef
	func _init(owner: RefCounted) -> void:
		adapter = weakref(owner)
	func read_state() -> Variant:
		var owner = adapter.get_ref()
		return owner._read_tick_state() if is_instance_valid(owner) else null
	func commit(packet: Variant) -> bool:
		var owner = adapter.get_ref()
		return owner._commit_packet(packet) if is_instance_valid(owner) else false

var _player: Node2D
var _world: Node
var _authority: Object
var _rates: Object
var _dome: Object
var _lesson: Callable
var _phase_ready: Callable
var _callback_owners: Array[Object] = []
var _natural: RefCounted
var _bridge: CommitBridge
var _world_identity: Array
var _configured = false
var _busy = false
var _authority_contract_broken = false
var _last_source_plan_ready = false
var _last_error = "unconfigured"
var _last_frame = -1.0
var _last_epoch = -1
var _clock_calls = 0
var _clock_rejections = 0
var _commit_attempts = 0
var _commit_successes = 0
var _packet_rejections = 0
var _tick_frame = -1.0
var _tick_epoch = -1
var _tick_ticks = 0.0
var _tick_state: Dictionary = {}
var _tick_guard: Dictionary = {}
var _dispatch_entered = false
var _last_result: Dictionary = {}
var _last_packet: Dictionary = {}

func configure(player: Node2D, world: Node, authority: Object, rates: Object,
		dome: Object, lesson: Callable, phase_ready: Callable) -> bool:
	if _configured or _busy:
		return _fail("already_configured_or_reentrant")
	_busy = true
	var error = _binding_error(player, world, authority, rates, dome, lesson, phase_ready)
	if not error.is_empty():
		return _finish_failure(error)
	var initial: Variant = authority.read_native_regen_state()
	error = _state_error(initial, player)
	var guard: Variant = lesson.call()
	if error.is_empty():
		error = _lesson_error(guard)
	if not error.is_empty():
		return _finish_failure(error)
	# This local source plan validates actual rate/dome output shapes without
	# calling advance_native or the resource sink. A zero-sp cap plan is not a
	# commit; source Math.min downclamps above-cap current values are preserved.
	var preflight = NATURAL.new()
	preflight.configure_source_rates(Callable(authority, "read_native_regen_state"),
		Callable(rates, "read_source_rates"), Callable(dome, "in_holy_dome_value"),
		Callable(authority, "commit_native_regen_resources"))
	var plan: Dictionary = preflight.plan_native(0.0, guard)
	if not _strict_plan_ready(plan):
		return _finish_failure("strict_source_preflight:" + str(plan.get("reason", "invalid_plan")))
	var current: Variant = authority.read_native_regen_state()
	error = _state_error(current, player)
	if error.is_empty() and not _states_equal(initial, current):
		error = "authority_changed_during_preflight"
	if error.is_empty():
		error = _binding_error(player, world, authority, rates, dome, lesson, phase_ready)
	if not error.is_empty():
		return _finish_failure(error)
	# Binding changes only adapter-owned references after every preflight gate.
	_player = player
	_world = world
	_authority = authority
	_rates = rates
	_dome = dome
	_lesson = lesson
	_phase_ready = phase_ready
	_callback_owners = [lesson.get_object(), phase_ready.get_object()]
	_bridge = CommitBridge.new(self)
	_natural = NATURAL.new()
	var readiness: Dictionary = _natural.configure_source_rates(
		Callable(_bridge, "read_state"), Callable(_rates, "read_source_rates"),
		Callable(_dome, "in_holy_dome_value"), Callable(_bridge, "commit"))
	if not readiness.get("ready") is bool or not readiness["ready"]:
		# The validated local Callables cannot ordinarily fail, but no actual
		# actor/resource mutation has occurred even if source readiness rejects.
		_clear_candidate_binding()
		return _finish_failure("strict_callable_binding_rejected")
	_world_identity = world.get_native_world_identity()
	_last_frame = float(world.get_native_frame())
	_last_epoch = int(world.get_native_projectile_fx_context()["frame_reset_epoch"])
	_configured = true
	_last_source_plan_ready = true
	_busy = false
	_last_error = ""
	return true

func get_native_regen_player() -> Node2D:
	return _player if is_instance_valid(_player) else null

func get_native_regen_world() -> Node:
	return _world if is_instance_valid(_world) else null

func is_native_regen_ready() -> bool:
	if not _configured or _authority_contract_broken or not _last_source_plan_ready:
		return false
	# A freed Node/Object cannot be passed to a typed helper even when that
	# helper starts with a validity check. Check stored Variants at the caller.
	if not _stored_bindings_live():
		return false
	var error = _binding_error(_player, _world, _authority, _rates, _dome,
		_lesson, _phase_ready)
	if not error.is_empty() or not _stored_bindings_live() \
			or not is_same(_world_identity, _world.get_native_world_identity()):
		return false
	# Never read actual rates/holy presence here: the strict producer must query
	# each once inside its actual native plan. This is binding/current P ready.
	var current: Variant = _authority.read_native_regen_state()
	return _live(_player) and _state_error(current, _player).is_empty() \
		and _lesson_error(_lesson.call()).is_empty()

func advance_native(ticks: float, frame: float, ens: Variant) -> bool:
	if _busy or not _configured or _authority_contract_broken:
		return _reject_tick("not_ready_or_reentrant")
	_busy = true
	# Invalid clock inputs inspect only the actual World. No authority/rate/dome,
	# lesson or phase publisher callback may run before these admission guards.
	if not _live(_world) or not _provider_live(_world, _world) or not _world.is_inside_tree() \
			or _world.get_tree().paused or not is_finite(ticks) or ticks <= 0.0 or not is_finite(frame):
		return _finish_tick_failure("invalid_or_paused_native_tick")
	for method in ["get_native_frame", "get_native_world_identity", "get_native_projectile_fx_context"]:
		if not _world.has_method(method):
			return _finish_tick_failure("missing_actual_world_clock_method:" + method)
	var context: Dictionary = _world.get_native_projectile_fx_context()
	if not _context_valid(context) or not _number(_world.get_native_frame()):
		return _finish_tick_failure("invalid_actual_world_clock_context")
	var epoch = int(context["frame_reset_epoch"])
	if not is_same(_world_identity, _world.get_native_world_identity()) \
			or not is_same(ens, _world_identity) \
			or frame != float(_world.get_native_frame()) \
			or ticks != float(context["dt_sp"]) \
			or frame <= _last_frame or epoch <= _last_epoch:
		return _finish_tick_failure("stale_duplicate_or_mismatched_native_tick")
	if not _stored_bindings_live():
		return _finish_tick_failure("lost_live_regeneration_binding")
	var error = _binding_error(_player, _world, _authority, _rates, _dome,
		_lesson, _phase_ready)
	if not error.is_empty():
		return _finish_tick_failure(error)
	if not _stored_bindings_live():
		return _finish_tick_failure("binding_lost_during_phase_preflight")
	var guard: Variant = _lesson.call()
	error = _lesson_error(guard)
	if not error.is_empty():
		return _finish_tick_failure(error)
	_tick_frame = frame
	_tick_epoch = epoch
	_tick_ticks = ticks
	_tick_state = {}
	_tick_guard = guard.duplicate(true)
	_dispatch_entered = false
	_last_error = ""
	# Reserve this actual phase even on missing source data or an opaque sink
	# rejection: retrying the same World frame must not run the source twice.
	_last_frame = frame
	_last_epoch = epoch
	_clock_calls += 1
	var result: Dictionary = _natural.advance_native(ticks, guard)
	_last_source_plan_ready = _strict_plan_ready(result)
	_last_result = result.duplicate(true)
	_busy = false
	if not _strict_plan_ready(result):
		return _fail("strict_source_tick:" + str(result.get("reason", "invalid_plan")))
	if result.get("command") == NATURAL.COMMAND_GUARD_SKIP:
		return true
	if not result.get("applied") is bool or not result["applied"]:
		if _last_error.is_empty():
			_last_error = "resource_sink_rejected"
		return false
	_last_error = ""
	return true

func _read_tick_state() -> Variant:
	if not _busy or not _configured or not _stored_bindings_live() \
			or not _provider_live(_authority, _world):
		return null
	var state: Variant = _authority.read_native_regen_state()
	if not _live(_player):
		_last_error = "player_lost_during_resource_read"
		return null
	var error = _state_error(state, _player)
	if not error.is_empty():
		_last_error = error
		return null
	_tick_state = state.duplicate(true)
	return state

func _commit_packet(packet: Variant) -> bool:
	if not _busy or not _configured or _dispatch_entered or _authority_contract_broken:
		return _reject_packet("unexpected_or_duplicate_resource_dispatch")
	_dispatch_entered = true
	if not _stored_bindings_live():
		return _reject_packet("lost_live_regeneration_binding")
	var error = _binding_error(_player, _world, _authority, _rates, _dome,
		_lesson, _phase_ready)
	if not error.is_empty():
		return _reject_packet(error)
	if not _stored_bindings_live():
		return _reject_packet("binding_lost_during_commit_preflight")
	var context: Dictionary = _world.get_native_projectile_fx_context()
	if _world.get_tree().paused or not is_same(_world_identity, _world.get_native_world_identity()) \
			or float(_world.get_native_frame()) != _tick_frame \
			or int(context["frame_reset_epoch"]) != _tick_epoch \
			or float(context["dt_sp"]) != _tick_ticks:
		return _reject_packet("world_phase_changed_before_commit")
	var current: Variant = _authority.read_native_regen_state()
	if not _live(_player):
		return _reject_packet("player_lost_before_resource_commit")
	error = _state_error(current, _player)
	if error.is_empty() and not _states_equal(_tick_state, current):
		error = "authority_changed_before_commit"
	if error.is_empty():
		error = _packet_error(packet, current)
	if not error.is_empty():
		return _reject_packet(error)
	_last_packet = packet.duplicate(true)
	_commit_attempts += 1
	# The only external resource mutation. Authority must compare both befores
	# and current caps, then apply ordered ST -> MP atomically, or return false
	# without changing either value. Adapter cannot rollback an opaque provider.
	var accepted: Variant = _authority.commit_native_regen_resources(packet.duplicate(true))
	if not _stored_bindings_live():
		_authority_contract_broken = true
		return _reject_packet("authority_commit_lifecycle_changed")
	var after: Variant = _authority.read_native_regen_state() if _provider_live(_authority, _world) else null
	if not _live(_player):
		_authority_contract_broken = true
		return _reject_packet("player_lost_during_commit_readback")
	if not accepted is bool:
		_authority_contract_broken = true
		return _reject_packet("authority_commit_return_not_bool")
	if not accepted:
		if not _state_error(after, _player).is_empty() or not _states_equal(current, after):
			_authority_contract_broken = true
			return _reject_packet("authority_false_mutated_resources")
		return _reject_packet("authority_commit_rejected")
	if not _state_error(after, _player).is_empty() \
			or not _after_matches(packet, current, after):
		_authority_contract_broken = true
		return _reject_packet("authority_true_commit_mismatch")
	_commit_successes += 1
	return true

static func _binding_error(player: Node2D, world: Node, authority: Object,
		rates: Object, dome: Object, lesson: Callable, phase_ready: Callable) -> String:
	if not _provider_live(player, world) or not _provider_live(world, world) \
			or not player.is_inside_tree() or not world.is_inside_tree():
		return "missing_live_same_tree_player_world"
	if not _method_accepts(player, "get_combat_world", 0) \
			or player.get_combat_world() != world or world.get("player") != player:
		return "actual_player_world_mismatch"
	for method in ["get_native_frame", "get_native_world_identity", "get_native_projectile_fx_context"]:
		if not _method_accepts(world, method, 0):
			return "missing_world_method:" + method
	if not _number(world.get_native_frame()) or float(world.get_native_frame()) < 0.0 \
			or not world.get_native_world_identity() is Array \
			or not _context_valid(world.get_native_projectile_fx_context()):
		return "invalid_actual_world_context"
	if not _provider_live(authority, world):
		return "missing_live_regen_authority"
	var methods = {"get_native_regen_player": 0, "read_native_regen_state": 0,
		"commit_native_regen_resources": 1}
	for method in methods:
		if not _method_accepts(authority, method, int(methods[method])):
			return "missing_authority_method:" + method
	if authority.get_native_regen_player() != player:
		return "resource_authority_player_mismatch"
	if not _provider_live(rates, world) or rates.get_script() != RATES \
			or not _method_accepts(rates, "read_source_rates", 0):
		return "missing_original_source_rate_supplier"
	if not _provider_live(dome, world) or dome.get_script() != DOME \
			or not _method_accepts(dome, "in_holy_dome_value", 0):
		return "missing_original_holy_dome_supplier"
	for provider in [rates, dome]:
		var ready: Variant = provider.readiness()
		if not ready is Dictionary or not ready.get("ready") is bool or not ready["ready"]:
			return "source_supplier_not_bound"
	if not _callable_live(lesson, world) or not _callable_live(phase_ready, world):
		return "missing_live_lesson_or_phase_reader"
	var phase: Variant = phase_ready.call()
	if not phase is bool or not phase:
		return "strict_source_phase_not_ready"
	return ""

static func _state_error(state: Variant, player: Node2D) -> String:
	if not state is Dictionary:
		return "missing_current_regen_state"
	for key in STATE_FIELDS:
		if not state.has(key):
			return "missing_current_resource:" + key
	if not state["s"] is String and not state["s"] is StringName:
		return "invalid_current_resource:s"
	for key in ["st", "mst", "mp", "mmp", "stR", "mpR"]:
		if not _number(state[key]):
			return "nonfinite_current_resource:" + key
	if not _live(player) or not player.get("state") is String \
			or not _number(player.get("stamina")) or not _number(player.get("max_stamina")):
		return "missing_actual_player_resource_fields"
	if String(state["s"]) != String(player.state) \
			or float(state["st"]) != float(player.stamina) \
			or float(state["mst"]) != float(player.max_stamina):
		return "authority_actual_player_state_st_mst_mismatch"
	return ""

static func _lesson_error(guard: Variant) -> String:
	if not guard is Dictionary or not guard.get("parry_lesson_active") is bool:
		return "missing_actual_lesson_guard"
	if guard["parry_lesson_active"] and not guard.get("parry_lesson_chapter") is int:
		return "missing_actual_lesson_chapter"
	return ""

static func _packet_error(packet: Variant, current: Dictionary) -> String:
	if not packet is Dictionary or packet.size() != 3 \
			or packet.get("kind") != "natural_regen" \
			or packet.get("source") != "game.html:33359-33364" \
			or not packet.get("writes") is Array or packet["writes"].size() != 2:
		return "invalid_source_resource_packet"
	var fields = ["st", "mp"]
	var caps = ["mst", "mmp"]
	for index in range(2):
		var write: Variant = packet["writes"][index]
		if not write is Dictionary or write.size() != 4 \
				or write.get("field") != fields[index] or write.get("cap_field") != caps[index] \
				or not _number(write.get("before")) or not _number(write.get("value")):
			return "invalid_ordered_resource_write:" + str(index)
		if float(write["before"]) != float(current[fields[index]]) \
				or float(write["value"]) > float(current[caps[index]]):
			return "stale_before_or_cap_mismatch:" + fields[index]
	return ""

static func _states_equal(first: Dictionary, second: Dictionary) -> bool:
	if first.is_empty() or String(first["s"]) != String(second["s"]):
		return false
	for key in ["st", "mst", "mp", "mmp", "stR", "mpR"]:
		if float(first[key]) != float(second[key]):
			return false
	return true

static func _after_matches(packet: Dictionary, before: Dictionary, after: Dictionary) -> bool:
	if String(after["s"]) != String(before["s"]):
		return false
	for key in ["mst", "mmp", "stR", "mpR"]:
		if float(before[key]) != float(after[key]):
			return false
	return float(after["st"]) == float(packet["writes"][0]["value"]) \
		and float(after["mp"]) == float(packet["writes"][1]["value"])

static func _strict_plan_ready(plan: Dictionary) -> bool:
	return plan.get("ready") is bool and plan["ready"] \
		and plan.get("status") == NATURAL.STATUS_READY \
		and plan.get("mode") == NATURAL.MODE_STRICT_SOURCE_RATES \
		and plan.get("command") in [NATURAL.COMMAND_APPLY, NATURAL.COMMAND_GUARD_SKIP]

static func _context_valid(context: Variant) -> bool:
	return context is Dictionary and context.get("schema") == CONTEXT_SCHEMA \
		and context.get("clock_mode") == "godot_delta_native60" \
		and _number(context.get("dt_sp")) and float(context["dt_sp"]) > 0.0 \
		and _integer(context.get("frame_reset_epoch")) and int(context["frame_reset_epoch"]) >= 0

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())

func _stored_bindings_live() -> bool:
	return _live(_world) and _live(_player) and _live(_authority) \
		and _live(_rates) and _live(_dome)

static func _provider_live(value: Variant, world: Node) -> bool:
	return _live(value) and _live(world) and (not value is Node \
		or (value.is_inside_tree() and world.is_inside_tree() and value.get_tree() == world.get_tree()))

static func _callable_live(value: Callable, world: Node) -> bool:
	return value.is_valid() and value.get_argument_count() == 0 \
		and _provider_live(value.get_object(), world)

static func _method_accepts(value: Object, method_name: String, count: int) -> bool:
	if not value.has_method(method_name):
		return false
	for method in value.get_method_list():
		if String(method["name"]) == method_name:
			var maximum = method["args"].size()
			return count >= maximum - method["default_args"].size() and count <= maximum
	return false

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _integer(value: Variant) -> bool:
	return _number(value) and float(value) == floor(float(value))

func _clear_candidate_binding() -> void:
	_player = null
	_world = null
	_authority = null
	_rates = null
	_dome = null
	_lesson = Callable()
	_phase_ready = Callable()
	_callback_owners.clear()
	_natural = null
	_bridge = null

func _fail(error: String) -> bool:
	_last_error = error
	return false

func _finish_failure(error: String) -> bool:
	_busy = false
	return _fail(error)

func _reject_tick(error: String) -> bool:
	_clock_rejections += 1
	return _fail(error)

func _finish_tick_failure(error: String) -> bool:
	_busy = false
	return _reject_tick(error)

func _reject_packet(error: String) -> bool:
	_packet_rejections += 1
	return _fail(error)

func get_snapshot() -> Dictionary:
	var phase: Variant = _phase_ready.call() if _configured and _live(_world) \
		and _callable_live(_phase_ready, _world) else null
	return {"configured": _configured, "ready": is_native_regen_ready(),
		"error": _last_error, "last_result": _last_result.duplicate(true),
		"last_packet": _last_packet.duplicate(true), "commit_attempts": _commit_attempts,
		"commit_successes": _commit_successes, "packet_rejections": _packet_rejections,
		"clock_calls": _clock_calls, "clock_rejections": _clock_rejections,
		"last_native_frame": _last_frame, "last_native_epoch": _last_epoch,
		"producer_dispatch_count": _natural.dispatch_count() if is_instance_valid(_natural) else 0,
		"authority_contract_broken": _authority_contract_broken,
		"last_source_plan_ready": _last_source_plan_ready,
		"strict_source_rates": _configured, "source_phase": SOURCE_PHASE,
		"phase_witness_ready": phase is bool and phase,
		"automatic_physics": false, "automatic_input": false,
		"resource_defaults_authoritative": false, "current_main_authority_proven": false,
		"phase_scope": "caller witness; Main earlier phases not manufactured",
		"readiness_scope": "last actual source plan plus binding/current P; no extra rate/dome query",
		"atomic_scope": "opaque authority contract plus readback; no rollback"}
