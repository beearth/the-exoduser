class_name ExoduserNativeSourcePlayerRegenerationPhase
extends RefCounted
## One admitted World phase: presence -> holy flat -> pre-holy rates -> HP
## -> strict ST/MP. Original producers own every recovery formula.

const DOME = preload("res://port_modules/holy_dome_presence_source/producer.gd")
const FLAT = preload("res://port_modules/holy_dome_flat_heal_source/producer.gd")
const HP = preload("res://port_modules/hp_regeneration_source/producer.gd")
const NATURAL = preload("res://port_modules/resource_regeneration_source/producer.gd")
const RATES = preload("res://port_modules/regeneration_stat_source/producer.gd")
const AFFIX = preload("res://port_modules/equipment_affix_reader/producer.gd")
const PASSIVES = preload("res://port_modules/player_passives_source/producer.gd")
const SERVICES_SCHEMA = "exoduser.godot.source-player-regeneration-services.v1"
const CONTEXT_SCHEMA = "exoduser.godot.native-projectile-fx-context.v1"
const CALLBACK_ARITY = {"current_g": 0, "current_p": 0, "fuse_star": 1,
	"hp_sink": 1, "flat_resource_sink": 1, "lesson": 0, "main_init_ready": 0}

# The source producers retain Callable owners. This bridge retains only a
# WeakRef to the dispatcher, so owning those producers creates no cycle.
class SourceBridge extends RefCounted:
	var owner: WeakRef
	func _init(dispatcher: RefCounted) -> void:
		owner = weakref(dispatcher)
	func read_g() -> Variant:
		var d = owner.get_ref()
		return d._read_current_g() if is_instance_valid(d) else null
	func read_p() -> Variant:
		var d = owner.get_ref()
		return d._read_current_p() if is_instance_valid(d) else null
	func presence() -> Variant:
		var d = owner.get_ref()
		return d._presence if is_instance_valid(d) and d._phase_live() else null
	func holy() -> Variant:
		var d = owner.get_ref()
		return d._presence.get("value") if is_instance_valid(d) and d._phase_live() else null
	func rates() -> Variant:
		var d = owner.get_ref()
		return d._source_rates if is_instance_valid(d) and d._phase_live() else null
	func fuse(skill: Variant) -> Variant:
		var d = owner.get_ref()
		return d._call_service("fuse_star", [skill]) if is_instance_valid(d) else null
	func boost(id: Variant) -> Variant:
		var d = owner.get_ref()
		return d._services["affix"].eq_affix(id) if is_instance_valid(d) and d._phase_live() else null
	func flat_hp(value: float) -> bool:
		var d = owner.get_ref()
		return d._commit_hp(value, "holy_flat_hp") if is_instance_valid(d) else false
	func natural_hp(value: float) -> bool:
		var d = owner.get_ref()
		return d._commit_hp(value, "hp_natural") if is_instance_valid(d) else false
	func read_resources() -> Variant:
		var d = owner.get_ref()
		return d._read_resources() if is_instance_valid(d) else null
	func commit_resources(packet: Variant) -> bool:
		var d = owner.get_ref()
		return d._commit_resources(packet) if is_instance_valid(d) else false

var _player: Node2D
var _world: Node
var _authority: Object
var _services: Dictionary = {}
var _owners: Array[Object] = []
var _bridge: SourceBridge
var _dome: RefCounted
var _flat: RefCounted
var _hp: RefCounted
var _natural: RefCounted
var _identity: Array
var _configured = false
var _busy = false
var _admitted = false
var _contract_broken = false
var _source_ready = false
var _error = "unconfigured"
var _last_frame = -1.0
var _last_epoch = -1
var _tick_frame = -1.0
var _tick_epoch = -1
var _tick_ticks = 0.0
var _commit_phase = ""
var _p_loaded = false
var _g_loaded = false
var _cached_p: Variant
var _cached_g: Variant
var _presence: Dictionary = {}
var _source_rates: Dictionary = {}
var _resource_before: Dictionary = {}
var _resource_dispatched = false
var _trace: Array[String] = []
var _results: Dictionary = {}
var _counts = {"dome": 0, "holy_flat": 0, "flat_resource_sink": 0,
	"rates_precompute": 0, "hp": 0, "lesson": 0, "natural": 0,
	"current_g": 0, "current_p": 0, "resource_state": 0,
	"hp_sinks": 0, "natural_resource_sink": 0, "clock_admitted": 0,
	"clock_rejected": 0}

func configure(player: Node2D, world: Node, authority: Object, services: Dictionary) -> bool:
	if _configured or _busy:
		return _fail("already_configured_or_reentrant")
	_busy = true
	var error = _binding_error(player, world, authority, services)
	if not error.is_empty():
		return _finish(error)
	if not _bindings_live(player, world, authority, services):
		return _finish("binding_lost_during_configure_preflight")
	# Read-only constructor preflight, not an extra source recovery plan.
	var initial_p: Variant = services["current_p"].call()
	var initial_g: Variant = services["current_g"].call()
	if not _bindings_live(player, world, authority, services):
		return _finish("binding_lost_during_configure")
	error = _current_p_error(initial_p, player)
	if error.is_empty() and not initial_g is Dictionary:
		error = "missing_actual_current_g"
	if error.is_empty():
		error = _resource_error(authority.read_native_regen_state(), player)
	if error.is_empty() and not _bindings_live(player, world, authority, services):
		error = "binding_lost_during_resource_preflight"
	if not error.is_empty():
		return _finish(error)
	_player = player
	_world = world
	_authority = authority
	_services = services.duplicate()
	for key in CALLBACK_ARITY:
		_owners.append(_services[key].get_object())
	_bridge = SourceBridge.new(self)
	_dome = DOME.new()
	_flat = FLAT.new()
	_hp = HP.new()
	_natural = NATURAL.new()
	var ready: Array = [
		_dome.configure(Callable(_bridge, "read_g"), Callable(_bridge, "read_p")),
		_flat.configure(Callable(_bridge, "presence"), Callable(_bridge, "read_g"),
			Callable(_bridge, "read_p"), Callable(_bridge, "fuse"),
			Callable(_bridge, "boost"), Callable(_bridge, "flat_hp")),
		_hp.configure(Callable(_bridge, "read_p"), HP.source_providers(
			_services["rates"], _services["affix"], _services["passives"],
			Callable(_bridge, "holy")), Callable(_bridge, "natural_hp")),
		_natural.configure_source_rates(Callable(_bridge, "read_resources"),
			Callable(_bridge, "rates"), Callable(_bridge, "holy"),
			Callable(_bridge, "commit_resources"))]
	for value in ready:
		if not value is Dictionary or not value.get("ready") is bool or not value["ready"]:
			_clear_binding()
			return _finish("source_callable_binding_rejected")
	_identity = world.get_native_world_identity()
	_last_frame = float(world.get_native_frame())
	_last_epoch = int(world.get_native_projectile_fx_context()["frame_reset_epoch"])
	_configured = true
	_source_ready = true
	_busy = false
	_error = ""
	return true

func get_native_regen_player() -> Node2D:
	return _player if _live(_player) else null

func get_native_regen_world() -> Node:
	return _world if _live(_world) else null

func is_native_regen_ready() -> bool:
	if not _configured or _contract_broken or not _source_ready or not _stored_live():
		return false
	return _binding_error(_player, _world, _authority, _services).is_empty() \
		and _stored_live() and is_same(_identity, _world.get_native_world_identity())

func advance_native(ticks: float, frame: float, ens: Variant) -> bool:
	if _busy or not _configured or _contract_broken:
		return _reject_clock("not_configured_or_reentrant")
	_busy = true
	# Clock guard is World-only: invalid calls make no source/provider query.
	if not _live(_world) or not _world.is_inside_tree() or _world.get_tree().paused \
			or not _number(ticks) or ticks <= 0.0 or not _number(frame):
		return _finish_clock("invalid_or_paused_native_tick")
	var context: Variant = _world.get_native_projectile_fx_context()
	if not _context_valid(context) or not _number(_world.get_native_frame()):
		return _finish_clock("invalid_actual_world_clock_context")
	var epoch = int(context["frame_reset_epoch"])
	if not is_same(_identity, _world.get_native_world_identity()) or not is_same(ens, _identity) \
			or frame != float(_world.get_native_frame()) or ticks != float(context["dt_sp"]) \
			or frame <= _last_frame or epoch <= _last_epoch:
		return _finish_clock("stale_duplicate_or_mismatched_native_tick")
	if not _stored_live():
		return _finish_clock("lost_live_phase_binding")
	var error = _binding_error(_player, _world, _authority, _services)
	if not error.is_empty() or not _stored_live():
		return _finish_clock(error if not error.is_empty() else "binding_lost_in_preflight")
	_tick_frame = frame
	_tick_epoch = epoch
	_tick_ticks = ticks
	_last_frame = frame
	_last_epoch = epoch
	_admitted = true
	_counts["clock_admitted"] += 1
	_trace.clear()
	_results.clear()
	_presence.clear()
	_source_rates.clear()
	_resource_before.clear()
	_resource_dispatched = false
	_p_loaded = false
	_g_loaded = false
	_cached_p = null
	_cached_g = null
	_error = ""

	_record("dome")
	_presence = _dome.presence_detail()
	_results["presence"] = _presence.duplicate(true)
	if _presence.get("status") != "READY" or not _presence.get("value") is bool:
		return _finish_source("presence_not_ready:" + str(_presence.get("reason", "invalid")))
	if not _phase_live():
		return _finish_source("phase_lost_after_presence")
	_record("holy_flat")
	var flat: Dictionary = _flat.advance_native(ticks)
	_results["holy_flat"] = flat.duplicate(true)
	if flat.get("status") != "READY":
		return _finish_source("holy_flat_not_ready:" + str(flat.get("reason", "invalid")))
	if flat.get("outcome") == FLAT.OUTCOME_HEAL:
		if flat.get("applied") != true or not _commit_flat_resources(flat):
			return _finish_source(_error if not _error.is_empty() else "holy_flat_sink_rejected")
	elif flat.get("outcome") not in [FLAT.OUTCOME_OUTSIDE, FLAT.OUTCOME_HP_GUARD_SKIP]:
		return _finish_source("invalid_holy_flat_outcome")
	if not _phase_live():
		return _finish_source("phase_lost_after_holy_flat")
	_record("rates_precompute")
	var raw_rates: Variant = _services["rates"].read_source_rates()
	error = _rates_error(raw_rates)
	_results["rates_precompute"] = raw_rates.duplicate(true) if raw_rates is Dictionary else {}
	if not error.is_empty():
		return _finish_source(error)
	_source_rates = raw_rates
	if not _phase_live():
		return _finish_source("phase_lost_after_source_rates")
	# HP sees actual P after holy-flat HP/MP/ST. No pre-HP Natural plan or
	# extra lesson/P read is used to validate arithmetic in the cached rates.
	_p_loaded = false
	_cached_p = null
	_record("hp")
	var hp_result: Dictionary = _hp.advance_native(ticks)
	_results["hp"] = hp_result.duplicate(true)
	if hp_result.get("status") != HP.READY or hp_result.get("ready") != true:
		return _finish_source("hp_not_ready:" + str(hp_result.get("reason", "invalid")))
	if hp_result.get("action") == HP.ACTION_WRITE and hp_result.get("applied") != true:
		return _finish_source(_error if not _error.is_empty() else "hp_sink_rejected")
	if hp_result.get("action") not in [HP.ACTION_WRITE, HP.ACTION_GUARD_SKIP]:
		return _finish_source("invalid_hp_action")
	if not _phase_live():
		return _finish_source("phase_lost_after_hp")
	_record("lesson")
	var lesson: Variant = _call_service("lesson", [])
	if not lesson is Dictionary or not lesson.get("parry_lesson_active") is bool \
			or (lesson["parry_lesson_active"] and not lesson.get("parry_lesson_chapter") is int):
		return _finish_source("invalid_current_lesson_guard")
	_record("natural")
	var natural: Dictionary = _natural.advance_native(ticks, lesson)
	_results["natural"] = natural.duplicate(true)
	if natural.get("status") != NATURAL.STATUS_READY or natural.get("ready") != true \
			or natural.get("mode") != NATURAL.MODE_STRICT_SOURCE_RATES:
		return _finish_source("natural_not_ready:" + str(natural.get("reason", "invalid")))
	if natural.get("command") == NATURAL.COMMAND_APPLY and natural.get("applied") != true:
		return _finish_source(_error if not _error.is_empty() else "natural_resource_sink_rejected")
	if natural.get("command") not in [NATURAL.COMMAND_APPLY, NATURAL.COMMAND_GUARD_SKIP]:
		return _finish_source("invalid_natural_command")
	_source_ready = true
	return _finish("")

func get_native_source_commit_phase() -> String:
	return _commit_phase if not _commit_phase.is_empty() and _phase_live() else ""

func _phase_live() -> bool:
	if not _busy or not _admitted or not _stored_live() or not _world.is_inside_tree() \
			or _world.get_tree().paused:
		return false
	var context: Variant = _world.get_native_projectile_fx_context()
	return _context_valid(context) and is_same(_identity, _world.get_native_world_identity()) \
		and _number(_world.get_native_frame()) and float(_world.get_native_frame()) == _tick_frame \
		and float(context["dt_sp"]) == _tick_ticks \
		and int(context["frame_reset_epoch"]) == _tick_epoch

func _read_current_g() -> Variant:
	if not _phase_live():
		return null
	if not _g_loaded:
		_counts["current_g"] += 1
		_cached_g = _call_service("current_g", [])
		_g_loaded = true
	return _cached_g

func _read_current_p() -> Variant:
	if not _phase_live():
		return null
	if not _p_loaded:
		_counts["current_p"] += 1
		_cached_p = _call_service("current_p", [])
		_p_loaded = true
		if not _live(_player) or not _current_p_error(_cached_p, _player).is_empty():
			_cached_p = null
	return _cached_p

func _call_service(key: String, args: Array) -> Variant:
	if not _phase_live() or not _callable_live(_services.get(key), _world, args.size()):
		return null
	return _services[key].callv(args)

func _commit_hp(value: float, phase: String) -> bool:
	if not _phase_live() or not _number(value) or value > _player.max_hp \
			or not _callable_live(_services["hp_sink"], _world, 1):
		return _fail("hp_commit_not_admitted_or_invalid")
	var before: float = _player.hp
	_trace.append(phase)
	_counts["hp_sinks"] += 1
	_commit_phase = phase
	var accepted: Variant = _services["hp_sink"].call(value)
	_commit_phase = ""
	if not _phase_live() or not accepted is bool \
			or (accepted and float(_player.hp) != value) \
			or (not accepted and float(_player.hp) != before):
		_contract_broken = true
		return _fail("hp_sink_contract_broken")
	return accepted

func _commit_flat_resources(flat: Dictionary) -> bool:
	if not _phase_live() or not _callable_live(_services["flat_resource_sink"], _world, 1):
		return _fail("flat_resource_commit_not_admitted")
	_trace.append("holy_flat_mpst")
	_counts["flat_resource_sink"] += 1
	_commit_phase = "holy_flat_mpst"
	var accepted: Variant = _services["flat_resource_sink"].call(flat.duplicate(true))
	_commit_phase = ""
	if not _phase_live() or not accepted is bool:
		_contract_broken = true
		return _fail("flat_resource_sink_contract_broken")
	return accepted

func _read_resources() -> Variant:
	if not _phase_live():
		return null
	_counts["resource_state"] += 1
	var current: Variant = _authority.read_native_regen_state()
	if not _live(_player) or not _resource_error(current, _player).is_empty():
		return null
	_resource_before = current.duplicate(true)
	return current

func _commit_resources(packet: Variant) -> bool:
	if not _phase_live() or _resource_dispatched:
		return _fail("unexpected_or_duplicate_natural_commit")
	_resource_dispatched = true
	var current: Variant = _authority.read_native_regen_state()
	if not _live(_player) or not _resource_error(current, _player).is_empty() \
			or not _resources_equal(_resource_before, current) \
			or not _packet_error(packet, current).is_empty():
		return _fail("invalid_or_stale_natural_resource_packet")
	_trace.append("natural_resources")
	_counts["natural_resource_sink"] += 1
	_commit_phase = "natural_resources"
	var accepted: Variant = _authority.commit_native_regen_resources(packet.duplicate(true))
	_commit_phase = ""
	if not _phase_live():
		_contract_broken = true
		return _fail("natural_commit_lifecycle_changed")
	var after: Variant = _authority.read_native_regen_state()
	if not _live(_player) or not accepted is bool or not _resource_error(after, _player).is_empty():
		_contract_broken = true
		return _fail("natural_sink_contract_broken")
	if not accepted:
		if not _resources_equal(current, after):
			_contract_broken = true
			return _fail("natural_false_mutated_resources")
		return _fail("natural_resource_sink_rejected")
	for key in ["s", "mst", "mmp", "stR", "mpR"]:
		if after[key] != current[key]:
			_contract_broken = true
			return _fail("natural_commit_changed_nonwrite_field")
	if float(after["st"]) != float(packet["writes"][0]["value"]) \
			or float(after["mp"]) != float(packet["writes"][1]["value"]):
		_contract_broken = true
		return _fail("natural_true_commit_mismatch")
	return true

static func _binding_error(player: Variant, world: Variant, authority: Variant, services: Dictionary) -> String:
	if not _provider_live(player, world) or not _provider_live(world, world) \
			or not player.is_inside_tree() or not world.is_inside_tree():
		return "missing_live_same_tree_player_world"
	if not _method_accepts(player, "get_combat_world", 0) \
			or player.get_combat_world() != world or world.get("player") != player:
		return "actual_player_world_mismatch"
	if not (player.get("state") is String or player.get("state") is StringName):
		return "missing_actual_player_state"
	for field in ["hp", "max_hp", "stamina", "max_stamina"]:
		if not _number(player.get(field)):
			return "missing_actual_player_field:" + field
	for method in ["get_native_frame", "get_native_world_identity", "get_native_projectile_fx_context"]:
		if not _method_accepts(world, method, 0):
			return "missing_world_clock_method:" + method
	if not _number(world.get_native_frame()) or not world.get_native_world_identity() is Array \
			or not _context_valid(world.get_native_projectile_fx_context()):
		return "invalid_actual_world_context"
	if services.get("schema") != SERVICES_SCHEMA:
		return "invalid_source_regeneration_services_schema"
	if not _provider_live(authority, world):
		return "missing_live_resource_authority"
	var authority_methods = {"get_native_regen_player": 0, "get_native_regen_world": 0,
		"read_native_regen_state": 0, "commit_native_regen_resources": 1,
		"is_native_source_resources_ready": 0, "commit_native_source_hp": 1,
		"commit_native_holy_flat_resources": 1, "bind_native_source_regeneration_phase": 1}
	for method in authority_methods:
		if not _method_accepts(authority, method, authority_methods[method]):
			return "missing_authority_method:" + method
	if authority.get_native_regen_player() != player or authority.get_native_regen_world() != world \
			or authority.is_native_source_resources_ready() != true:
		return "source_authority_not_current_same_actor_world"
	var scripts = {"rates": RATES, "affix": AFFIX, "passives": PASSIVES}
	var methods = {"rates": "read_source_rates", "affix": "eq_affix", "passives": "read_current_passives"}
	for key in scripts:
		var provider: Variant = services.get(key)
		if not _provider_live(provider, world) or provider.get_script() != scripts[key] \
				or not _method_accepts(provider, methods[key], 1 if key == "affix" else 0):
			return "missing_original_source_provider:" + key
	var rate_ready: Variant = services["rates"].readiness()
	if not rate_ready is Dictionary or rate_ready.get("ready") != true \
			or services["affix"].is_configured() != true:
		return "source_rate_or_affix_not_bound"
	for key in CALLBACK_ARITY:
		if not _callable_live(services.get(key), world, CALLBACK_ARITY[key]):
			return "missing_live_service_callback:" + key
	var sinks = {"hp_sink": "commit_native_source_hp",
		"flat_resource_sink": "commit_native_holy_flat_resources"}
	for key in sinks:
		if services[key].get_object() != authority or String(services[key].get_method()) != sinks[key]:
			return "sink_is_not_actual_authority_endpoint:" + key
	var ready: Variant = services["main_init_ready"].call()
	if not ready is bool or not ready:
		return "actual_main_initialization_not_ready"
	return ""

func _stored_live() -> bool:
	return _bindings_live(_player, _world, _authority, _services)

static func _bindings_live(player: Variant, world: Variant, authority: Variant, services: Dictionary) -> bool:
	if not _provider_live(world, world) or not _provider_live(player, world) \
			or not _provider_live(authority, world):
		return false
	for key in ["rates", "affix", "passives"]:
		if not _provider_live(services.get(key), world):
			return false
	for key in CALLBACK_ARITY:
		if not _callable_live(services.get(key), world, CALLBACK_ARITY[key]):
			return false
	return true

static func _current_p_error(p: Variant, player: Variant) -> String:
	if not p is Dictionary or not _live(player):
		return "missing_actual_current_p"
	if not (p.get("s") is String or p.get("s") is StringName) or String(p["s"]) != String(player.state):
		return "current_p_state_mismatch"
	for key in ["hp", "mhp", "hpR", "x", "y"]:
		if not _number(p.get(key)):
			return "current_p_missing_finite:" + key
	if float(p["hp"]) != float(player.hp) or float(p["mhp"]) != float(player.max_hp) \
			or float(p["x"]) != player.global_position.x or float(p["y"]) != player.global_position.y:
		return "current_p_actual_actor_mismatch"
	return ""

static func _resource_error(p: Variant, player: Variant) -> String:
	if not p is Dictionary or not _live(player):
		return "missing_current_resources"
	if not (p.get("s") is String or p.get("s") is StringName):
		return "missing_current_resource_state"
	for key in ["st", "mst", "mp", "mmp", "stR", "mpR"]:
		if not _number(p.get(key)):
			return "missing_current_resource:" + key
	if String(p["s"]) != String(player.state) or float(p["st"]) != float(player.stamina) \
			or float(p["mst"]) != float(player.max_stamina):
		return "authority_actual_player_mismatch"
	return ""

static func _rates_error(raw: Variant) -> String:
	# Structural/status check only. Actual base equality and holy-multiplied
	# arithmetic remain in the one original Natural call after HP.
	if not raw is Dictionary or raw.get("status") != "READY" or raw.get("ready") != true \
			or raw.get("holy_dome") != "external" or not raw.get("value") is Dictionary:
		return "source_rates_not_ready_or_invalid"
	if raw["value"].size() != 2:
		return "unexpected_source_rate_value_keys"
	var names = {"mp": "_mpr_pre_holy", "st": "_str_pre_holy"}
	for key in names:
		var value: Variant = raw["value"].get(names[key])
		var detail: Variant = raw.get(key)
		if not _number(value) or not detail is Dictionary or detail.get("status") != "READY" \
				or not _number(detail.get("value")) or not _number(detail.get("base")) \
				or float(detail["value"]) != float(value):
			return "source_rate_detail_invalid:" + key
	return ""

static func _packet_error(packet: Variant, current: Dictionary) -> String:
	if not packet is Dictionary or packet.size() != 3 or packet.get("kind") != "natural_regen" \
			or packet.get("source") != "game.html:33359-33364" \
			or not packet.get("writes") is Array or packet["writes"].size() != 2:
		return "invalid_natural_packet"
	var fields = ["st", "mp"]
	var caps = ["mst", "mmp"]
	for i in range(2):
		var w: Variant = packet["writes"][i]
		if not w is Dictionary or w.size() != 4 or w.get("field") != fields[i] \
				or w.get("cap_field") != caps[i] or not _number(w.get("before")) \
				or not _number(w.get("value")) or float(w["before"]) != float(current[fields[i]]) \
				or float(w["value"]) > float(current[caps[i]]):
			return "invalid_ordered_resource_write:" + str(i)
	return ""

static func _resources_equal(a: Dictionary, b: Dictionary) -> bool:
	if a.is_empty():
		return false
	for key in ["s", "st", "mst", "mp", "mmp", "stR", "mpR"]:
		if a[key] != b[key]:
			return false
	return true

static func _context_valid(context: Variant) -> bool:
	return context is Dictionary and context.get("schema") == CONTEXT_SCHEMA \
		and context.get("clock_mode") == "godot_delta_native60" \
		and _number(context.get("dt_sp")) and float(context["dt_sp"]) > 0.0 \
		and _number(context.get("frame_reset_epoch")) \
		and float(context["frame_reset_epoch"]) == floor(float(context["frame_reset_epoch"])) \
		and float(context["frame_reset_epoch"]) >= 0.0

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())

static func _provider_live(value: Variant, world: Variant) -> bool:
	return _live(world) and _live(value) and (not value is Node \
		or (value.is_inside_tree() and world.is_inside_tree() and value.get_tree() == world.get_tree()))

static func _callable_live(value: Variant, world: Variant, count: int) -> bool:
	return value is Callable and value.is_valid() and value.get_argument_count() == count \
		and _provider_live(value.get_object(), world)

static var _METHOD_ARITY_CACHE: Dictionary = {}
static func _method_accepts(value: Variant, name: String, count: int) -> bool:
	if not _live(value) or not value.has_method(name):
		return false
	# PERF(2026-10-21): get_method_list()는 대상 스크립트+엔진 기본 메서드 수백 개를 매번 복사한다.
	# 틱마다 수십 번 불려 물리 1틱을 ~18ms 썼다(PC 실측). 인자 범위는 스크립트가 바뀌지 않는 한
	# 불변이므로 (스크립트|클래스, 메서드)별로 한 번만 계산해 재사용한다. 판정 결과는 동일.
	var arity_script: Variant = value.get_script()
	var arity_key: String = (str(arity_script.get_instance_id()) if arity_script != null else str(value.get_class())) + ":" + name
	var arity: Variant = _METHOD_ARITY_CACHE.get(arity_key)
	if arity == null:
		arity = []
		for method in value.get_method_list():
			if String(method["name"]) == name:
				arity = [method["args"].size() - method["default_args"].size(), method["args"].size()]
				break
		_METHOD_ARITY_CACHE[arity_key] = arity
	return arity.size() == 2 and count >= arity[0] and count <= arity[1]

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

func _record(phase: String) -> void:
	_trace.append(phase)
	_counts[phase] += 1

func _fail(error: String) -> bool:
	_error = error
	return false

func _finish(error: String) -> bool:
	_commit_phase = ""
	_admitted = false
	_busy = false
	_error = error
	return error.is_empty()

func _finish_source(error: String) -> bool:
	_source_ready = false
	return _finish(error)

func _reject_clock(error: String) -> bool:
	_counts["clock_rejected"] += 1
	return _fail(error)

func _finish_clock(error: String) -> bool:
	_counts["clock_rejected"] += 1
	return _finish(error)

func _clear_binding() -> void:
	_player = null
	_world = null
	_authority = null
	_services.clear()
	_owners.clear()
	_bridge = null
	_dome = null
	_flat = null
	_hp = null
	_natural = null

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "ready": is_native_regen_ready(), "error": _error,
		"source_ready": _source_ready, "authority_contract_broken": _contract_broken,
		"last_native_frame": _last_frame, "last_native_epoch": _last_epoch,
		"trace": _trace.duplicate(), "counts": _counts.duplicate(true),
		"last_results": _results.duplicate(true), "commit_phase": get_native_source_commit_phase(),
		"services_schema": SERVICES_SCHEMA, "automatic_physics": false,
		"automatic_input": false, "source_formulas_reimplemented": false,
		"dome_evaluations_per_admitted_phase": 1, "natural_plans_before_hp": 0,
		"source_order": ["dome", "holy_flat", "rates_precompute", "hp", "lesson", "natural"],
		"readiness_scope": "binding/Main-init witness and last actual source result; no extra dome/rate query",
		"atomic_scope": "natural authority ordered atomic ST/MP contract plus readback; earlier phases not rolled back",
		"pre_hp_validation_scope": "cached source-rate structural/status only; base/arithmetic validated by Natural after HP",
		"full_main_source_authority_proven": false, "public_play_proven": false}
