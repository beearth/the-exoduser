class_name ExoduserNativeSourcePlayerInitializationServices
extends RefCounted
## Actual-current readers and original helper assembly for the ordered caller.
## No plans, source arithmetic, actor writes, bootstrap, restore or clock here.

const PROVIDERS = preload("res://scripts/native_source_player_providers.gd")
const STATE = preload("res://scripts/native_source_new_run_state.gd")
const RESOURCES = preload("res://scripts/native_source_resource_authority.gd")
const HEALTH = preload("res://port_modules/player_health_parameters_source/producer.gd")
const DEFENSE_SPEED = preload("res://port_modules/player_defense_speed_parameters_source/producer.gd")
const SHIELD_POISE = preload("res://port_modules/player_shield_poise_parameters_source/producer.gd")
const EFFECTIVE_STATS = preload("res://port_modules/player_effective_stats_source/producer.gd")
const PARAMETERS = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const BASE_ATTACK = preload("res://port_modules/player_base_attack_source/producer.gd")
const OPTIONS = preload("res://port_modules/npc_interaction/source_options_state.gd")
const SAMPLE_GLOBALS = preload("res://scripts/native_source_sample_globals.gd")
const SOURCE_CLOCK_PREFIX = preload("res://port_modules/source_update_clock_prefix/producer.gd")
const SOURCE_FRAME_ENTRY = preload("res://port_modules/source_frame_entry/producer.gd")
const SIGNED_DIFFICULTY = preload("res://port_modules/kill_reward/source_difficulty_signed.gd")
const SCHEMA = "exoduser.godot.source-player-initialization-services.v1"
const CACHE_APIS = ["read_captured_resource_plan", "read_captured_crystal_stats", "read_captured_cohort", "read_current_initialization_cohort_id", "read_hp_initial_gap"]

# Original helpers retain callable owners. Every bridge back to this assembly
# is weak, so keeping a helper cannot preserve a discarded Main/provider owner.
class Readers extends RefCounted:
	var owner: WeakRef
	func _init(assembly: RefCounted) -> void:
		owner = weakref(assembly)
	func _assembly() -> Variant:
		return owner.get_ref() if is_instance_valid(owner) else null
	func _domain(key: String) -> Variant:
		var assembly: Variant = _assembly()
		return assembly._read_domain(key) if is_instance_valid(assembly) else null
	func g() -> Variant: return _domain("current_g")
	func p() -> Variant: return _domain("current_p")
	func stats() -> Variant: return _domain("current_stats")
	func passives() -> Variant: return _domain("current_passives")
	func inventory() -> Variant: return _domain("current_inventory")
	func _call(helper: String, method: String, args: Array = []) -> Variant:
		var assembly: Variant = _assembly()
		return assembly._call_original(helper, method, args) if is_instance_valid(assembly) else null
	func eq_affix(id: String) -> Variant: return _call("affix", "eq_affix", [id])
	func eq_stat(id: String) -> Variant: return _call("reference", "eq_stat", [id])
	func eq_implicit(id: String) -> Variant: return _call("formula", "eq_implicit", [id])
	func lv_b() -> Variant: return _call("reference", "lv_b")
	func grit_total() -> Variant: return _call("parameters", "read_source_grit_total")
	func _parameter(key: String, args: Array = []) -> Variant:
		var assembly: Variant = _assembly()
		return assembly._read_parameter_provider(key, args) if is_instance_valid(assembly) else null
	func grit() -> Variant: return _parameter("grit")
	func crystal_effects(crystal: Variant) -> Variant: return _parameter("crystal_effects", [crystal])
	func options() -> Variant:
		var assembly: Variant = _assembly()
		return assembly.read_current_options() if is_instance_valid(assembly) else null
	func diff_signed() -> Variant:
		var assembly: Variant = _assembly()
		return assembly._read_signed_difficulty() if is_instance_valid(assembly) else null
	func _cache(method: String) -> Variant:
		var assembly: Variant = _assembly()
		return assembly._read_dispatcher_cache(method) if is_instance_valid(assembly) else null
	func resource_plan() -> Variant: return _cache("read_captured_resource_plan")
	func crystal_stats() -> Variant: return _cache("read_captured_crystal_stats")
	func cohort() -> Variant: return _cache("read_captured_cohort")
	func current_cohort() -> Variant: return _cache("read_current_initialization_cohort_id")
	func hp_gap() -> Variant: return _cache("read_hp_initial_gap")
	func source_ready() -> bool:
		var assembly: Variant = _assembly()
		return is_instance_valid(assembly) and assembly.is_source_context_ready()
	func cohort_context() -> Dictionary:
		var assembly: Variant = _assembly()
		return assembly._cohort_context() if is_instance_valid(assembly) else {}
	func write_sink(packet: Dictionary, index: int) -> bool:
		var assembly: Variant = _assembly()
		return is_instance_valid(assembly) and assembly._write_sink(packet, index)
	func invalidate_sink(packet: Dictionary) -> bool:
		var assembly: Variant = _assembly()
		return is_instance_valid(assembly) and assembly._invalidate_sink(packet)
	func attack_early_plan() -> Dictionary:
		var assembly: Variant = _assembly()
		return assembly._attack_plan("attack_early_plan") if is_instance_valid(assembly) else {"status": "NOT_READY", "ready": false, "packet": null, "reason": "services_owner_lost"}
	func attack_crystal_plan() -> Dictionary:
		var assembly: Variant = _assembly()
		return assembly._attack_plan("attack_crystal_plan") if is_instance_valid(assembly) else {"status": "NOT_READY", "ready": false, "packet": null, "reason": "services_owner_lost"}

var _player: WeakRef
var _world: WeakRef
var _state: WeakRef
var _resources: WeakRef
var _providers: WeakRef
var _dispatcher: WeakRef
var _main: WeakRef
var _readers: Readers
var _source_frame_entry: RefCounted
var _source_frame_declared_once := false
var _source_frame_declaration: Dictionary = {}
var _source_frame_callback_active := false
var _source_frame_callback_id := ""
var _source_frame_last_callback_id := ""
var _source_frame_last_result: Dictionary = {"status":"NOT_READY","reason":"source_native_callback_not_entered"}
var _source_update_clock: RefCounted
var _source_clock_declared_once := false
var _source_clock_input_serial := 0
var _source_clock_input_timestamp_ms: Variant = null
var _sample_globals: RefCounted
var _options: Object
var _options_identity: Variant = null
var _signed_difficulty: Object
var _base_attack: Object
var _helpers: Dictionary = {}
var _provider_maps: Dictionary = {}
var _attack_bridges: Dictionary = {}
var _cohort_id: String = ""
var _configured = false
var _configuring = false
var _last_error = "unconfigured"
var _invalidating = false
var _invalidations = 0
var _attack_plan_delegations = 0

func configure(player: Node2D, world: Node, state: Node, resources: Node,
		providers: Object, dispatcher: Object, bridges: Dictionary = {}) -> bool:
	if _configured or _configuring:
		return _fail("already_configured_or_reentrant")
	_configuring = true
	if not _live(player) or not _live(world) or not _live(state) or not _live(resources) \
			or not _live(providers) or not _live(dispatcher):
		return _discard("actual_source_context_missing")
	if player.is_inside_tree() or player.is_node_ready():
		return _discard("source_services_must_be_constructed_before_actor_tree")
	if state.get_script() != STATE or resources.get_script() != RESOURCES or providers.get_script() != PROVIDERS:
		return _discard("actual_source_owner_script_mismatch")
	for method in CACHE_APIS + ["is_native_source_initialization_active"]:
		if not dispatcher.has_method(method):
			return _discard("dispatcher_public_bridge_missing:" + method)
	var main: Variant = world.get_parent()
	if not _live(main) or main.get_script() == null or main.get_script().resource_path != "res://scripts/main.gd":
		return _discard("actual_main_world_parent_missing")
	_player = weakref(player)
	_world = weakref(world)
	_state = weakref(state)
	_resources = weakref(resources)
	_providers = weakref(providers)
	_dispatcher = weakref(dispatcher)
	_main = weakref(main)
	_readers = Readers.new(self)
	if not _initialize_source_sample_globals():
		return _discard("actual_source_sample_global_initialization_rejected")
	if not _initialize_source_update_clock():
		return _discard("actual_source_clock_declaration_rejected")
	if not _initialize_source_frame_entry():
		return _discard("actual_source_frame_declaration_rejected")
	_options = OPTIONS.new()
	_signed_difficulty = SIGNED_DIFFICULTY.new()
	if not _options.initialize_source_boot(false) or not _options.set_current_phase(OPTIONS.CURRENT_PRE_RESTORE):
		return _discard("actual_non_electron_source_OPT_initialization_rejected")
	_options_identity = _options.read_current_options()
	if not _options_identity is Dictionary \
			or not _signed_difficulty.configure_current_opt_reader(Callable(_readers, "options")):
		return _discard("actual_OPT_signed_reader_binding_rejected")
	for key in bridges:
		if key not in ["attack_early_plan", "attack_crystal_plan"] \
				or not bridges[key] is Callable or not bridges[key].is_valid():
			return _discard("invalid_actual_attack_bridge:" + str(key))
	_attack_bridges = bridges.duplicate()
	var error = _context_error()
	if not error.is_empty():
		return _discard(error)
	var bundle: Dictionary = providers.get_provider_bundle()
	for key in ["affix", "reference", "formula", "passives", "rates", "fusion", "crystal", "grit", "raw_grit", "parameters"]:
		if not _live(bundle.get(key)):
			return _discard("actual_original_provider_missing:" + key)
	if not bundle.get("parameter_providers") is Dictionary:
		return _discard("actual_parameter_provider_map_missing")
	_helpers = {"health": HEALTH.new(), "defense_speed": DEFENSE_SPEED.new(),
		"shield_poise": SHIELD_POISE.new(), "effective_stats": EFFECTIVE_STATS.new(),
		"resource_parameters": bundle["parameters"]}
	_base_attack = BASE_ATTACK.new()
	for method in ["configure_crystal_reader", "plan_early_packet", "plan_crystal"]:
		if not _base_attack.has_method(method):
			return _discard("original_base_attack_packet_API_missing:" + method)
	# Packet application belongs to the ordered dispatcher. The original plans
	# have actual current readers, but neither legacy nor packet run is invoked.
	_base_attack.configure(Callable(_readers, "g"), Callable(_readers, "p"), Callable())
	_base_attack.configure_crystal_reader(Callable(_readers, "crystal_stats"), Callable(_readers, "p"))
	_provider_maps = _make_provider_maps(bundle)
	_cohort_id = "source_player_initialization:%d:applyStats_prefix" % get_instance_id()
	_configured = true
	_configuring = false
	_last_error = ""
	return true

func get_services() -> Dictionary:
	if not is_source_context_ready():
		return {}
	return {"schema": SCHEMA, "health": _helpers["health"],
		"defense_speed": _helpers["defense_speed"], "shield_poise": _helpers["shield_poise"],
		"effective_stats": _helpers["effective_stats"], "resource_parameters": _helpers["resource_parameters"],
		"provider_maps": _provider_maps.duplicate(true),
		"cohort_context": Callable(_readers, "cohort_context"), "source_ready": Callable(_readers, "source_ready"),
		"write_sink": Callable(_readers, "write_sink"), "invalidate_sink": Callable(_readers, "invalidate_sink"),
		"attack_early_plan": Callable(_readers, "attack_early_plan"),
		"attack_crystal_plan": Callable(_readers, "attack_crystal_plan")}

func is_source_context_ready() -> bool:
	return _configured and _context_error().is_empty()

func _initialize_source_update_clock() -> bool:
	if _source_clock_declared_once or is_instance_valid(_source_update_clock):
		return false
	_source_update_clock = SOURCE_CLOCK_PREFIX.new()
	var declared: Dictionary = _source_update_clock.declare_dt_sp()
	if declared.get("status") != "OK":
		return false
	_source_clock_declared_once = true
	return true

func _initialize_source_frame_entry() -> bool:
	if _source_frame_declared_once or is_instance_valid(_source_frame_entry) or not is_instance_valid(_source_update_clock):
		return false
	_source_frame_entry = SOURCE_FRAME_ENTRY.new()
	var configured: Dictionary = _source_frame_entry.configure(_source_update_clock)
	if configured.get("status") != "OK":
		return false
	var declared: Dictionary = _source_frame_entry.declare()
	if declared.get("status") != "OK":
		return false
	_source_frame_declaration = declared.duplicate(true)
	_source_frame_declared_once = true
	return true

func _source_frame_context_error() -> String:
	var error: String = _source_clock_context_error()
	if not error.is_empty():
		return error
	if not is_instance_valid(_source_frame_entry) or _source_frame_entry.get_script() != SOURCE_FRAME_ENTRY or not _source_frame_entry.is_ready():
		return "actual_source_frame_owner_lost"
	if _source_frame_entry.get("_prefix") != _source_update_clock:
		return "actual_source_frame_prefix_identity_lost"
	return ""

func is_native_source_frame_callback_current(caller: Node, callback_id: Variant) -> bool:
	if not callback_id is String or not _source_frame_callback_active or callback_id != _source_frame_callback_id or not _same_object(caller, _ref(_main)):
		return false
	if not _source_frame_context_error().is_empty() or not caller.is_native_source_clock_input_phase(self, _source_clock_input_serial):
		return false
	var actual: Dictionary = caller.read_native_source_frame_input(caller)
	return actual.get("ready") == true and actual.get("render_serial") == _source_clock_input_serial and actual.get("timestamp_ms") == _source_clock_input_timestamp_ms

func _run_native_source_frame_callback(main: Node, actual: Dictionary) -> void:
	var error: String = _source_frame_context_error()
	if not error.is_empty() or not main.is_native_source_clock_input_phase(self, _source_clock_input_serial):
		_source_frame_last_result = {"status":"NOT_READY","reason":error if not error.is_empty() else "native_frame_callback_window_closed"}
		return
	_source_frame_callback_id = "native-main-process/%s/%s/%s" % [main.get_instance_id(), get_instance_id(), _source_clock_input_serial]
	_source_frame_last_callback_id = _source_frame_callback_id
	_source_frame_callback_active = true
	_source_frame_last_result = _advance_native_source_frame_callback(main, _source_frame_callback_id, actual)
	if is_instance_valid(_source_frame_entry) and _source_frame_entry.read_frame_state().get("in_frame") == true:
		_source_frame_entry.end_frame()
	# Discard active authority; the historical ID remains diagnostic only.
	_source_frame_callback_active = false
	_source_frame_callback_id = ""

func _advance_native_source_frame_callback(main: Node, callback_id: String, actual: Dictionary) -> Dictionary:
	if not is_native_source_frame_callback_current(main, callback_id):
		return {"status":"NOT_READY","reason":"native_frame_callback_not_current"}
	var result: Dictionary = _source_frame_entry.begin_frame(callback_id)
	if result.get("status") != "OK":
		return result
	# Separate verified native-port context. Never mutate the raw LAST packet.
	var context: Dictionary = {"scope":"SOURCE_NATIVE_RENDER_CALLBACK",
		"timestamp":actual.timestamp_ms,"callback_token":callback_id,
		"clock_domain":actual.clock_domain}
	if float(actual.timestamp_ms) == 0.0:
		var now: Variant = main.read_native_source_frame_monotonic_now(self, _source_clock_input_serial)
		if now != null:
			context["performance_now"] = now
	result = _source_frame_entry.phase_timestamp(context)
	if result.get("status") != "CONTINUE":
		return result
	if not is_native_source_frame_callback_current(main, callback_id):
		return {"status":"PARTIAL_NOT_READY","reason":"native_frame_callback_lifetime_lost"}
	result = _source_frame_entry.phase_fps_cap(read_current_options())
	if result.get("status") != "CONTINUE":
		return result
	# Source frame resets/gamepad/profiling have no actual owner yet.
	return _source_frame_entry.phase_gap_frame_callbacks(null)

func _source_clock_context_error() -> String:
	var error: String = _context_error()
	if not error.is_empty():
		return error
	var main: Variant = _ref(_main)
	if not _live(main) or main.get("source_initialization_services") != self:
		return "actual_source_clock_services_replaced"
	if not is_instance_valid(_source_update_clock) or _source_update_clock.get_script() != SOURCE_CLOCK_PREFIX:
		return "actual_source_clock_owner_lost"
	return ""

func capture_native_source_render_input(caller: Node, input: Dictionary) -> bool:
	var main: Variant = _ref(_main)
	var serial: Variant = input.get("render_serial")
	var timestamp: Variant = input.get("timestamp_ms")
	var scope: Variant = input.get("scope")
	if not _same_object(caller, main) or not serial is int or serial <= _source_clock_input_serial or not (timestamp is int or timestamp is float) or not scope is String:
		return false
	if not main.is_native_source_clock_input_phase(self, serial):
		return false
	if not _source_clock_context_error().is_empty():
		return false
	var actual: Dictionary = main.read_native_source_frame_input(main)
	var actual_timestamp: Variant = actual.get("timestamp_ms")
	if actual.get("ready") != true or not (actual_timestamp is int or actual_timestamp is float) or input.get("scope") != "LAST_NATIVE_PLATFORM_RENDER_INPUT_ONLY" or float(timestamp) != float(actual_timestamp) or serial != actual.get("render_serial"):
		return false
	_source_clock_input_serial = serial
	_source_clock_input_timestamp_ms = actual.timestamp_ms
	_run_native_source_frame_callback(main, actual)
	# Input admission is not render_front, a source update or a gap receipt.
	return true

func read_source_clock_input_snapshot(caller: Node) -> Dictionary:
	var error: String = _source_frame_context_error()
	if not _same_object(caller, _ref(_main)):
		error = "actual_source_clock_snapshot_caller_mismatch"
	if not error.is_empty():
		return {"ready":false,"reason":error,"source_clock_ready":false}
	return {"ready":false,"reason":_source_frame_last_result.get("reason","source_frame_flow_not_complete"),
		"scope":"SOURCE_NATIVE_FRAME_PREFIX_ONLY",
		"frame_entry_configured":_source_frame_entry.is_ready(),
		"frame_declaration":_source_frame_declaration.duplicate(true),
		"frame_state":_source_frame_entry.read_frame_state(),
		"last_native_callback_id":_source_frame_last_callback_id,
		"native_callback_active":_source_frame_callback_active,
		"active_native_callback_id":_source_frame_callback_id,
		"frame_result":_source_frame_last_result.duplicate(true),
		"source_clock_ready":false,"dt_sp_declaration":_source_update_clock.read_dt_sp(),
		"prefix_state":_source_update_clock.read_update_state(),
		"last_admitted_render_serial":_source_clock_input_serial,
		"last_admitted_timestamp_ms":_source_clock_input_timestamp_ms,
		"source_update_returned":false}

func read_current_source_projectile_context(caller: Node) -> Dictionary:
	if not _same_object(caller, _ref(_world)):
		return {"ready":false,"reason":"actual_source_clock_world_caller_mismatch"}
	var error: String = _source_frame_context_error()
	if not error.is_empty():
		return {"ready":false,"reason":error}
	return {"ready":false,"reason":_source_frame_last_result.get("reason","source_frame_flow_not_complete"),
		"first_unowned_phase":_source_frame_entry.read_frame_state().get("not_ready_at"),
		"source_frame_entry_configured":true,
		"sp_published":false,"source_update_returned":false}

func _initialize_source_sample_globals() -> bool:
	if is_instance_valid(_sample_globals):
		return false
	_sample_globals = SAMPLE_GLOBALS.new()
	return _sample_globals.initialize_source_boot()

func read_current_sample_context(caller: Node) -> Dictionary:
	var error: String = _context_error()
	if not error.is_empty():
		return {"ready":false,"reason":error}
	if not is_instance_valid(caller) or _ref(_main) != caller:
		return {"ready":false,"reason":"actual_sample_global_caller_mismatch"}
	if not is_instance_valid(_sample_globals):
		return {"ready":false,"reason":"actual_source_sample_global_owner_lost"}
	return _sample_globals.read_current_sample_context()

func read_current_options() -> Variant:
	if not _context_error().is_empty():
		return null
	return _options.read_current_options()

func get_source_options_state() -> Object:
	return _options if is_source_context_ready() else null

func _make_provider_maps(bundle: Dictionary) -> Dictionary:
	var player = Callable(_readers, "p")
	var stats = Callable(_readers, "stats")
	var passives = Callable(_readers, "passives")
	var inventory = Callable(_readers, "inventory")
	var affix = Callable(_readers, "eq_affix")
	var implicit = Callable(_readers, "eq_implicit")
	var lv_b = Callable(_readers, "lv_b")
	var resource_plan = Callable(_readers, "resource_plan")
	var parameters: Dictionary = {PARAMETERS.PROVIDER_PLAYER: player, PARAMETERS.PROVIDER_STATS: stats,
		PARAMETERS.PROVIDER_PASSIVES: passives, PARAMETERS.PROVIDER_INVENTORY: inventory,
		PARAMETERS.PROVIDER_EQ_AFFIX: affix, PARAMETERS.PROVIDER_EQ_STAT: Callable(_readers, "eq_stat"),
		PARAMETERS.PROVIDER_LV_B: lv_b}
	var original_map: Dictionary = bundle["parameter_providers"]
	if original_map.has(PARAMETERS.PROVIDER_GRIT):
		parameters[PARAMETERS.PROVIDER_GRIT] = Callable(_readers, "grit")
	if original_map.has(PARAMETERS.PROVIDER_CRYSTAL_EFFECTS):
		parameters[PARAMETERS.PROVIDER_CRYSTAL_EFFECTS] = Callable(_readers, "crystal_effects")
	return {"resource_parameters": parameters,
		"health": {HEALTH.PROVIDER_PLAYER: player, HEALTH.PROVIDER_STATS: stats,
			HEALTH.PROVIDER_PASSIVES: passives, HEALTH.PROVIDER_INVENTORY: inventory,
			HEALTH.PROVIDER_G: Callable(_readers, "g"), HEALTH.PROVIDER_DIFF_SIGNED: Callable(_readers, "diff_signed"),
			HEALTH.PROVIDER_EQ_AFFIX: affix, HEALTH.PROVIDER_EQ_IMPLICIT: implicit, HEALTH.PROVIDER_LV_B: lv_b,
			HEALTH.PROVIDER_CRYSTAL_STATS: Callable(_readers, "crystal_stats"),
			HEALTH.PROVIDER_GRIT_HP_FLAT: Callable(_readers, "grit_total")},
		"defense_speed": {DEFENSE_SPEED.PROVIDER_PLAYER: player, DEFENSE_SPEED.PROVIDER_PASSIVES: passives,
			DEFENSE_SPEED.PROVIDER_EQ_AFFIX: affix, DEFENSE_SPEED.PROVIDER_EQ_IMPLICIT: implicit,
			DEFENSE_SPEED.PROVIDER_GRIT_TOTAL: Callable(_readers, "grit_total"),
			DEFENSE_SPEED.PROVIDER_RESOURCE_PLAN: resource_plan,
			DEFENSE_SPEED.PROVIDER_HP_MHP_28582: Callable(_readers, "hp_gap")},
		"shield_poise": {SHIELD_POISE.PROVIDER_PLAYER: player, SHIELD_POISE.PROVIDER_INVENTORY: inventory,
			SHIELD_POISE.PROVIDER_EQ_AFFIX: affix, SHIELD_POISE.PROVIDER_RESOURCE_PLAN: resource_plan},
		"effective_stats": {EFFECTIVE_STATS.PROVIDER_PLAYER: player, EFFECTIVE_STATS.PROVIDER_STATS: stats,
			EFFECTIVE_STATS.PROVIDER_COHORT: Callable(_readers, "cohort"),
			EFFECTIVE_STATS.PROVIDER_CURRENT_COHORT: Callable(_readers, "current_cohort")}}

func _read_domain(key: String) -> Variant:
	if not is_source_context_ready(): return null
	var bundle: Dictionary = _providers.get_ref().get_provider_bundle()
	var reader: Variant = bundle.get(key)
	return reader.call() if reader is Callable and reader.is_valid() else null

func _call_original(helper: String, method: String, args: Array) -> Variant:
	if not is_source_context_ready(): return null
	var bundle: Dictionary = _providers.get_ref().get_provider_bundle()
	var actual: Variant = bundle.get(helper)
	return actual.callv(method, args) if _live(actual) and actual.has_method(method) else null

func _read_parameter_provider(key: String, args: Array) -> Variant:
	if not is_source_context_ready(): return null
	var bundle: Dictionary = _providers.get_ref().get_provider_bundle()
	var maps: Variant = bundle.get("parameter_providers")
	if not maps is Dictionary: return null
	var callback: Variant = maps.get(key)
	return callback.callv(args) if callback is Callable and callback.is_valid() else null

func _read_signed_difficulty() -> Variant:
	return _signed_difficulty.diff_signed() if is_source_context_ready() else null

func _read_dispatcher_cache(method: String) -> Variant:
	if not is_source_context_ready(): return null
	var dispatcher: Variant = _dispatcher.get_ref()
	return dispatcher.call(method) if dispatcher.has_method(method) else null

func _cohort_context() -> Dictionary:
	if not is_source_context_ready(): return {}
	return {"cohort_id": _cohort_id, "authority": "actual_Main/source_player_initialization", "current_main": true}

func _write_sink(packet: Dictionary, index: int) -> bool:
	if not _write_context_ready(): return false
	return _state.get_ref().commit_native_source_initialization_write(packet, index)

func _write_context_ready() -> bool:
	if not is_source_context_ready(): return false
	var player: Variant = _player.get_ref()
	var world: Variant = _world.get_ref()
	return not player.is_inside_tree() and not player.is_node_ready() \
		and player.get_parent() == null and (not world.is_inside_tree() or not world.get_tree().paused)

func _invalidate_sink(packet: Dictionary) -> bool:
	if _invalidating or not _write_context_ready() or packet.size() != 4 \
			or packet.get("kind") != PARAMETERS.KIND_INVALIDATE or packet.get("source") != "game.html:16934" \
			or packet.get("targets") != ["_eqAffixCache", "_eqStatCache"] \
			or not packet.get("writes") is Array or not packet["writes"].is_empty():
		return false
	var active: Variant = _dispatcher.get_ref().is_native_source_initialization_active()
	if not active is bool or not active: return false
	var bundle: Dictionary = _providers.get_ref().get_provider_bundle()
	var affix: Variant = bundle.get("affix")
	var reference: Variant = bundle.get("reference")
	if not _live(affix) or not _live(reference) or not affix.has_method("invalidate_affix_cache") \
			or not reference.has_method("invalidate_eq_stat_cache"):
		return false
	_invalidating = true
	affix.invalidate_affix_cache()
	reference.invalidate_eq_stat_cache()
	_invalidations += 1
	_invalidating = false
	return true

func _attack_plan(key: String) -> Dictionary:
	if not is_source_context_ready(): return _not_ready("actual_source_context_lost")
	var callback: Variant = _attack_bridges.get(key)
	var result: Variant
	if callback is Callable and callback.is_valid():
		result = callback.call()
	elif _attack_bridges.has(key):
		return _not_ready("actual_attack_callback_owner_lost:" + key)
	elif _live(_base_attack):
		result = _base_attack.plan_early_packet() if key == "attack_early_plan" else _base_attack.plan_crystal()
	else:
		return _not_ready("original_base_attack_packet_owner_lost")
	_attack_plan_delegations += 1
	if not result is Dictionary:
		return _not_ready("original_attack_packet_result_not_dictionary:" + key)
	# Port readiness only: source status, packet, value and provenance unchanged.
	var out: Dictionary = result.duplicate(true)
	out["ready"] = out.get("status") == "READY"
	return out

# Eight typed normal-hit callbacks. These callbacks retain this Services owner,
# while its actual Main/actor/provider links remain weak and checked per query.
func get_normal_enemy_damage_provider_callbacks(caller: Node) -> Dictionary:
	if caller != _ref(_main) or not _normal_enemy_provider_error().is_empty(): return {}
	return {
		"eq_affix": Callable(self, "read_normal_enemy_equipment_affix"),
		"u_eq": Callable(self, "read_normal_enemy_unique_equipment"),
		"p_atk_mul": Callable(self, "read_normal_enemy_attack_multiplier"),
		"melee_ref": Callable(self, "read_normal_enemy_melee_reference"),
		"parry_lesson_active": Callable(self, "read_normal_enemy_parry_lesson_active"),
		"player_view": Callable(self, "read_normal_enemy_player_view"),
		"stat_str": Callable(self, "read_normal_enemy_strength_multiplier"),
		"p_dot_pool": Callable(self, "read_normal_enemy_dot_pool_multiplier"),
		"l_eq": Callable(self, "read_normal_enemy_legendary_equipment"),
	}

func read_normal_enemy_equipment_affix(id: Variant) -> Dictionary:
	return _read_normal_enemy_provider("eq_affix", [id])

func read_normal_enemy_unique_equipment(stat: String) -> Dictionary:
	return _read_normal_enemy_provider("u_eq", [stat])

func read_normal_enemy_attack_multiplier() -> Dictionary:
	return _read_normal_enemy_provider("p_atk_mul", [])

func read_normal_enemy_melee_reference() -> Dictionary:
	return _read_normal_enemy_provider("melee_ref", [])

func read_normal_enemy_parry_lesson_active() -> Dictionary:
	var error: String = _normal_enemy_provider_error()
	if not error.is_empty():
		return {"status":"NOT_READY", "reason":error, "provider":"parry_lesson_active"}
	var result: Dictionary = _ref(_main).read_native_normal_enemy_lesson_status()
	# A reentrant active getter may replace the current Services/context.
	# Recheck only ownership; never eagerly read source domains or OPT.
	var post_error: String = _normal_enemy_provider_error()
	if not post_error.is_empty():
		return {"status":"NOT_READY", "ready":false,
			"reason":"actual_normal_enemy_lesson_context_lost", "context_reason":post_error,
			"provider":"parry_lesson_active", "read_result":result}
	return result

func read_normal_enemy_player_view() -> Variant:
	if not _normal_enemy_provider_error().is_empty(): return null
	var current_p: Variant = _ref(_state).read_current_p()
	# The owned P may already have been synchronized by its real reader.
	# Context loss rejects the view without undoing that existing sync.
	if not _normal_enemy_provider_error().is_empty(): return null
	return current_p

func read_normal_enemy_strength_multiplier() -> Dictionary:
	var error: String = _normal_enemy_provider_error()
	if not error.is_empty():
		return {"status":"NOT_READY", "reason":error, "provider":"stat_str"}
	var bundle: Dictionary = _ref(_providers).get_provider_bundle()
	var formula: Variant = bundle.get("formula")
	if not _live(formula) or not formula.has_method("stat_str") or formula.get_script() == null:
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_stat_str_formula_unbound", "provider":"stat_str"}
	var formula_script: Script = formula.get_script()
	var result: Dictionary = formula.stat_str()
	var post_error: String = _normal_enemy_provider_error()
	if not post_error.is_empty():
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_stat_str_context_lost",
			"context_reason":post_error, "provider":"stat_str", "read_result":result}
	var current_bundle: Dictionary = _ref(_providers).get_provider_bundle()
	if not _live(formula) or not is_same(current_bundle.get("formula"), formula) \
			or formula.get_script() != formula_script:
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_stat_str_formula_changed",
			"provider":"stat_str", "read_result":result}
	return result

func read_normal_enemy_dot_pool_multiplier() -> Dictionary:
	var error: String = _normal_enemy_provider_error()
	if not error.is_empty():
		return {"status":"NOT_READY", "reason":error, "provider":"p_dot_pool"}
	var bundle: Dictionary = _ref(_providers).get_provider_bundle()
	var formula: Variant = bundle.get("formula")
	var passives: Variant = bundle.get("passives")
	var current_reader: Variant = bundle.get("current_passives")
	if not _live(formula) or not _live(passives) or not current_reader is Callable \
			or not current_reader.is_valid() or not formula.has_method("p_dot_pool") \
			or not formula.has_method("is_passives_reader_bound_to") \
			or not passives.has_method("is_current_passives_reader_bound_to") \
			or not passives.has_method("read_current_passives") \
			or formula.get_script() == null or passives.get_script() == null:
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_p_dot_pool_owner_unbound", "provider":"p_dot_pool"}
	var reader_target: Variant = current_reader.get_object()
	if not _live(reader_target) or reader_target.get_script() == null:
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_p_dot_pool_owner_unbound", "provider":"p_dot_pool"}
	var passives_reader: Callable = Callable(passives, "read_current_passives")
	if not formula.is_passives_reader_bound_to(passives_reader) \
			or not passives.is_current_passives_reader_bound_to(current_reader):
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_p_dot_pool_binding_mismatch", "provider":"p_dot_pool"}
	var formula_script: Script = formula.get_script()
	var passives_script: Script = passives.get_script()
	var reader_script: Script = reader_target.get_script()
	var result: Dictionary = formula.p_dot_pool()
	var post_error: String = _normal_enemy_provider_error()
	if not post_error.is_empty():
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_p_dot_pool_context_lost",
			"context_reason":post_error, "provider":"p_dot_pool", "read_result":result}
	var current_bundle: Dictionary = _ref(_providers).get_provider_bundle()
	var latest_reader: Variant = current_bundle.get("current_passives")
	if not _live(formula) or not _live(passives) or not _live(reader_target) \
			or not is_same(current_bundle.get("formula"), formula) \
			or not is_same(current_bundle.get("passives"), passives) \
			or not latest_reader is Callable or not latest_reader.is_valid() \
			or latest_reader != current_reader \
			or formula.get_script() != formula_script or passives.get_script() != passives_script \
			or reader_target.get_script() != reader_script:
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_p_dot_pool_owner_changed",
			"provider":"p_dot_pool", "read_result":result}
	if not formula.is_passives_reader_bound_to(passives_reader) \
			or not passives.is_current_passives_reader_bound_to(current_reader):
		return {"status":"NOT_READY", "reason":"actual_normal_enemy_p_dot_pool_binding_changed",
			"provider":"p_dot_pool", "read_result":result}
	return result

func _normal_enemy_provider_error() -> String:
	if not _configured: return "unconfigured"
	var error: String = _source_owner_error()
	if not error.is_empty(): return error
	var main: Variant = _ref(_main)
	if main.get("source_initialization_services") != self:
		return "actual_normal_enemy_services_replaced"
	if not main._native_main_service_live(): return "actual_normal_enemy_Main_not_live"
	return ""

func _read_normal_enemy_provider(callback: String, args: Array) -> Dictionary:
	var error: String = _normal_enemy_provider_error()
	if not error.is_empty():
		return {"status": "NOT_READY", "reason": error, "provider": callback}
	# Reuse the existing Main affix API, including its original cache/throw policy.
	if callback == "eq_affix":
		return _ref(_main).read_native_source_equipment_affix(args[0])
	var bundle: Dictionary = _ref(_providers).get_provider_bundle()
	if bundle.is_empty():
		return {"status": "NOT_READY", "reason": "actual_normal_enemy_provider_bundle_lost", "provider": callback}
	match callback:
		"u_eq": return bundle.formula.u_eq(args[0])
		"p_atk_mul": return bundle.formula.p_atk_mul()
		"melee_ref": return bundle.reference.melee_ref()
	return {"status": "NOT_READY", "reason": "normal_enemy_provider_not_bound", "provider": callback}

func _source_owner_error() -> String:
	if not _configured and not _configuring: return "unconfigured"
	var player: Variant = _ref(_player)
	var world: Variant = _ref(_world)
	var state: Variant = _ref(_state)
	var resources: Variant = _ref(_resources)
	var providers: Variant = _ref(_providers)
	var main: Variant = _ref(_main)
	if not _live(player) or not _live(world) or not _live(state) or not _live(resources) \
			or not _live(providers) or not _live(main) or not _live(_ref(_dispatcher)):
		return "actual_source_owner_lost"
	if world.get_parent() != main or main.get_script() == null \
			or main.get_script().resource_path != "res://scripts/main.gd" \
			or not _same_object(main.get("world"), world) or not _same_object(main.get("player"), player) \
			or not _same_object(main.get("source_state"), state) or not _same_object(main.get("source_resources"), resources) \
			or not _same_object(main.get("source_providers"), providers) \
			or not _same_object(main.get("source_initialization"), _ref(_dispatcher)):
		return "actual_Main_source_identity_mismatch"
	var world_player: Variant = world.get("player")
	if typeof(world_player) != TYPE_NIL and not _same_object(world_player, player):
		return "actual_source_World_player_mismatch"
	if player.get_combat_world() != world or state.get_native_new_run_player() != player \
			or state.get_native_new_run_world() != world or resources.get_native_regen_player() != player \
			or resources.get_native_regen_world() != world or providers.get_native_source_player() != player \
			or providers.get_native_source_world() != world or not providers.is_native_source_providers_ready():
		return "actual_source_actor_world_mismatch"
	for node in [state, resources]:
		if node.get_parent() != null and node.get_parent() != world: return "actual_source_holder_reparented"
	if player.is_inside_tree():
		if not main.is_inside_tree() or not world.is_inside_tree() or player.get_tree() != world.get_tree() \
				or main.get_tree() != world.get_tree() or world.get("player") != player:
			return "actual_source_live_tree_mismatch"
	elif player.is_node_ready(): return "actual_source_actor_removed_from_tree"
	return ""

func _context_error() -> String:
	var owner_error: String = _source_owner_error()
	if not owner_error.is_empty(): return owner_error
	var providers: Variant = _ref(_providers)
	var bundle: Dictionary = providers.get_provider_bundle()
	for key in ["current_g", "current_p", "current_stats", "current_passives", "current_inventory"]:
		var reader: Variant = bundle.get(key)
		if not reader is Callable or not reader.is_valid() or not reader.call() is Dictionary:
			return "actual_current_source_domain_lost:" + key
	if not _live(_options) or not _live(_signed_difficulty): return "actual_source_OPT_owner_lost"
	var current: Variant = _options.read_current_options()
	if not current is Dictionary or not is_same(current, _options_identity): return "actual_current_OPT_identity_or_fields_lost"
	return ""

func get_snapshot() -> Dictionary:
	var error: String = _context_error()
	var g: Variant = _read_domain("current_g") if error.is_empty() else null
	return {"schema": SCHEMA, "configured": _configured, "source_context_ready": is_source_context_ready(),
		"current_main": error.is_empty(), "cohort_id": _cohort_id,
		"error": _last_error, "context_error": error, "original_helper_names": _helpers.keys(),
		"provider_map_keys": _provider_maps.keys(), "options_status": _options.get_last_status() if _live(_options) else {},
		"source_non_electron": true, "source_g_on": _diagnostic_json(g.get("on")) if g is Dictionary else null,
		"source_g_scope": "source_boot/pre_stage; full stage bootstrap not installed",
		"shared_cache_owner": "actual ordered dispatcher public bridges", "source_formulas_reimplemented": false,
		"automatic_clock": false, "source_plans_recomputed_by_services": 0,
		"attack_plan_delegations": _attack_plan_delegations, "cache_invalidations": _invalidations,
		"attack_packet_callbacks_bound": _attack_bridges.keys(),
		"default_original_base_attack_plans_bound": _live(_base_attack),
		"original_base_attack_readiness": _diagnostic_json(_base_attack.readiness()) if _live(_base_attack) else _not_ready("base_attack_owner_lost"),
		"original_base_attack_crystal_readiness": _diagnostic_json(_base_attack.crystal_readiness()) if _live(_base_attack) else _not_ready("base_attack_owner_lost"),
		"options_current": _diagnostic_json(_options.read_current_options()) if error.is_empty() else null,
		"signed_difficulty": _diagnostic_json(_read_signed_difficulty()) if error.is_empty() else _not_ready(error),
		"full_bootstrap_ready": false, "main_full_ready": false, "public_play_proven": false}

static func _diagnostic_json(value: Variant) -> Variant:
	if typeof(value) == TYPE_NIL or value is bool or value is String or value is int:
		return value
	if value is float:
		return value if is_finite(value) else "SOURCE_NON_FINITE_DIAGNOSTIC"
	if value is Dictionary:
		var copy: Dictionary = {}
		for key in value:
			copy[str(key)] = _diagnostic_json(value[key])
		return copy
	if value is Array:
		var copy: Array = []
		for item in value:
			copy.append(_diagnostic_json(item))
		return copy
	return "UNSERIALIZABLE_SOURCE_DIAGNOSTIC:" + type_string(typeof(value))

static func _ref(value: WeakRef) -> Variant:
	return value.get_ref() if is_instance_valid(value) else null

static func _same_object(actual: Variant, expected: Variant) -> bool:
	return _live(actual) and _live(expected) and actual == expected

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object and (not value is Node or not value.is_queued_for_deletion())

static func _not_ready(reason: String) -> Dictionary:
	return {"status": "NOT_READY", "ready": false, "packet": null, "reason": reason}

func _fail(error: String) -> bool:
	_last_error = error
	return false

func _discard(error: String) -> bool:
	_configuring = false
	_helpers.clear()
	_provider_maps.clear()
	_attack_bridges.clear()
	_source_frame_callback_active = false
	_source_frame_callback_id = ""
	_source_frame_entry = null
	_source_update_clock = null
	_sample_globals = null
	_options = null
	_options_identity = null
	_signed_difficulty = null
	_base_attack = null
	_readers = null
	return _fail(error)

# This route uses only current-owner metadata until the actual lazy cache miss.
func is_native_main_legendary_bridge_current(main: Node, state: Node, providers: RefCounted) -> bool:
	if not _configured or _ref(_main) != main or _ref(_state) != state or _ref(_providers) != providers:
		return false
	for object in [main, state, providers, _ref(_player), _ref(_world), _ref(_resources)]:
		if not is_instance_valid(object): return false
	if main.get("source_initialization_services") != self or main.get("player") != _ref(_player) \
			or main.get("world") != _ref(_world) or main.get("source_resources") != _ref(_resources):
		return false
	return true

func bind_main_source_legendary_cache(main: Node) -> bool:
	var state: Variant = _ref(_state)
	var providers: Variant = _ref(_providers)
	if not is_instance_valid(state) or not is_instance_valid(providers) \
			or not is_native_main_legendary_bridge_current(main, state, providers): return false
	var formula: Variant = providers.get_native_main_legendary_formula(main)
	if not is_instance_valid(formula): return false
	return formula.configure_main_legendary_source(main, self, state, providers)

func read_normal_enemy_legendary_equipment(stat: Variant) -> Dictionary:
	var main: Variant = _ref(_main)
	var state: Variant = _ref(_state)
	var providers: Variant = _ref(_providers)
	if not is_instance_valid(main) or not is_instance_valid(state) or not is_instance_valid(providers) \
			or not is_native_main_legendary_bridge_current(main, state, providers):
		return {"status":"NOT_READY","reason":"legendary_current_bridge_lost","provider":"l_eq"}
	var formula: Variant = providers.get_native_main_legendary_formula(main)
	if not is_instance_valid(formula):
		return {"status":"NOT_READY","reason":"legendary_current_formula_lost","provider":"l_eq"}
	var result: Dictionary = formula.l_eq(stat)
	if not main.can_bind_native_source_legendary_formula(formula, self, state, providers):
		return {"status":"NOT_READY","reason":"legendary_owner_changed_after_read","provider":"l_eq","read_result":result}
	return result

# The bridge checks existing weak/current ownership without reading a domain.
func is_native_main_random_bridge_current(main: Variant, expected_world: Variant) -> bool:
	if not _configured or not main is Node or not expected_world is Node \
			or not is_instance_valid(main) or not is_instance_valid(expected_world):
		return false
	var player: Variant = _ref(_player)
	var state: Variant = _ref(_state)
	var resources: Variant = _ref(_resources)
	var providers: Variant = _ref(_providers)
	var dispatcher: Variant = _ref(_dispatcher)
	for object in [main, expected_world, player, state, resources, providers, dispatcher]:
		if not is_instance_valid(object): return false
		if object is Node and object.is_queued_for_deletion(): return false
	if not is_native_main_legendary_bridge_current(main, state, providers) \
			or _ref(_world) != expected_world or main.get("source_initialization") != dispatcher:
		return false
	if expected_world.get_parent() != main or player.get_parent() != main \
			or state.get_parent() != expected_world or resources.get_parent() != expected_world \
			or expected_world.get("player") != player:
		return false
	for node in [main, expected_world, player, state, resources]:
		if not node.is_inside_tree() or node.get_tree() != main.get_tree(): return false
	for role in [[main,"res://scripts/main.gd"],[expected_world,"res://scripts/world.gd"],
			[state,"res://scripts/native_source_new_run_state.gd"],
			[resources,"res://scripts/native_source_resource_authority.gd"],
			[providers,"res://scripts/native_source_player_providers.gd"],
			[dispatcher,"res://scripts/native_source_player_initialization.gd"]]:
		var script: Variant = role[0].get_script()
		if script == null or script.resource_path != role[1]: return false
	return state.is_native_main_legendary_owner_current(main)

func read_normal_enemy_random_unit() -> Dictionary:
	var receipt: Dictionary = {}
	var main: Variant = _ref(_main)
	var actual_world: Variant = _ref(_world)
	if not is_instance_valid(main) or not is_instance_valid(actual_world) \
			or not main.is_native_source_rand_context_current(self, actual_world):
		return _native_rand_failed_read("rand_owner_unavailable", receipt, null, true)
	# One call only. This receipt belongs to Services even if World aborts.
	var result: Variant = actual_world.read_native_source_random_unit(main, self, receipt)
	if not is_instance_valid(main) or not is_instance_valid(actual_world) \
			or not main.is_native_source_rand_context_current(self, actual_world):
		return _native_rand_failed_read("rand_owner_changed_after_sample", receipt, result)
	if not result is Dictionary or not is_same(result.get("completion_receipt"), receipt):
		return _native_rand_failed_read("rand_typed_boundary_aborted_or_malformed", receipt, result)
	var status: Variant = result.get("status")
	if status not in ["READY", "NOT_READY", "UNSUPPORTED_OPERAND"]:
		return _native_rand_failed_read("rand_typed_boundary_unknown_status", receipt, result)
	if status == "READY":
		var sample: Variant = receipt.get("sample_result")
		if not sample is Dictionary or typeof(sample.get("completed")) != TYPE_BOOL \
				or sample.get("completed") != true or not sample.has("value") \
				or not is_same(result.get("raw_result"), sample) or not result.has("value") \
				or typeof(result["value"]) != TYPE_FLOAT or result["value"] != sample["value"]:
			return _native_rand_failed_read("rand_ready_without_observed_completion", receipt, result)
	return result

func _native_rand_failed_read(reason: String, receipt: Dictionary, read_result: Variant,
		explicit_pre_loss: bool = false) -> Dictionary:
	var sample: Variant = receipt.get("sample_result")
	var completed: bool = sample is Dictionary and typeof(sample.get("completed")) == TYPE_BOOL \
		and sample.get("completed") == true and sample.has("value")
	return {"status":"NOT_READY","provider":"rand","reason":reason,
		"source":"World.sample_native_random_unit/shared_operation",
		"sample_invoked":false if explicit_pre_loss else receipt.get("sample_invoked", "UNKNOWN"),
		"sample_completed":false if explicit_pre_loss else (true if completed else "UNKNOWN"),
		"consumption":"NONE" if explicit_pre_loss else ("COMPLETED" if completed else "UNKNOWN"),
		"completion_receipt":receipt,"raw_result":sample,"read_result":read_result}
