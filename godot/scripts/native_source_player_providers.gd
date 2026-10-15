class_name ExoduserNativeSourcePlayerProviders
extends RefCounted
## Original provider assembly for one newly constructed actual Player.
## Configuration only: no applyStats/recalcSt, resource sink, clock or reset.

const STATE = preload("res://scripts/native_source_new_run_state.gd")
const RESOURCES = preload("res://scripts/native_source_resource_authority.gd")
const AFFIX = preload("res://port_modules/equipment_affix_reader/producer.gd")
const REFERENCE = preload("res://port_modules/combat_reference_source/producer.gd")
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const PASSIVES = preload("res://port_modules/player_passives_source/producer.gd")
const RATES = preload("res://port_modules/regeneration_stat_source/producer.gd")
const FUSION = preload("res://port_modules/fusion_star_source/producer.gd")
const CRYSTAL = preload("res://port_modules/player_crystal_resource_source/producer.gd")
const GRIT = preload("res://port_modules/player_grit_source/producer.gd")
const RAW_GRIT = preload("res://port_modules/save_adapter/raw_grit_restore.gd")
const PARAMETERS = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const CLAIM_META = "native_source_player_providers_owner"
const INITIALIZED_META = "native_source_player_providers_initialized"
const LINEAGE = "new_run/source_raw_grit_declaration"
const DOMAINS = {"g": "read_current_g", "p": "read_current_p",
	"stats": "read_current_stats", "passives": "read_current_passives",
	"inventory": "read_current_inventory"}

# Original modules retain some RefCounted Callable owners. A weak bridge
# avoids bundle -> Parameters/Passives/Rates -> bundle reference cycles.
class Readers extends RefCounted:
	var owner: WeakRef
	func _init(bundle: RefCounted) -> void:
		owner = weakref(bundle)
	func g() -> Variant:
		var bundle = owner.get_ref()
		return bundle._read_domain("g") if is_instance_valid(bundle) else null
	func p() -> Variant:
		var bundle = owner.get_ref()
		return bundle._read_domain("p") if is_instance_valid(bundle) else null
	func stats() -> Variant:
		var bundle = owner.get_ref()
		return bundle._read_domain("stats") if is_instance_valid(bundle) else null
	func passives() -> Variant:
		var bundle = owner.get_ref()
		return bundle._read_domain("passives") if is_instance_valid(bundle) else null
	func inventory() -> Variant:
		var bundle = owner.get_ref()
		return bundle._read_domain("inventory") if is_instance_valid(bundle) else null
	func raw_grit() -> Variant:
		var bundle = owner.get_ref()
		return bundle._read_raw_grit_container() if is_instance_valid(bundle) else null

var _player: Node2D
var _world: Node
var _state: Node
var _resources: Node
var _readers: Readers
var _providers: Dictionary = {}
var _parameter_providers: Dictionary = {}
var _grit_boot: Dictionary = {}
var _configured = false
var _configuring = false
var _last_error = "unconfigured"
var _bindings: Dictionary = {}

func configure(player: Node2D, world: Node, state: Node, resources: Node) -> bool:
	if _configured or _configuring:
		return _fail("already_configured_or_reentrant")
	_configuring = true
	var error = _constructor_error(player, world, state, resources)
	if not error.is_empty():
		return _finish(error)
	# Exact actual holder readers; never manufacture an empty current domain.
	for key in DOMAINS:
		var current: Variant = state.call(DOMAINS[key])
		if not current is Dictionary:
			return _finish("current_source_domain_not_ready:" + key)
	error = _constructor_error(player, world, state, resources)
	if not error.is_empty():
		return _finish(error)
	var boot: Dictionary = GRIT.source_boot_grit()
	if boot.get("status") != GRIT.SOURCE_BOOT or boot.get("current") != false \
			or boot.get("ready") != false or not _number(boot.get("raw")) \
			or float(boot["raw"]) != 0.0 or not _number(boot.get("value")) \
			or float(boot["value"]) != 0.0 or not boot.get("provenance") is Dictionary \
			or boot["provenance"].get("field") != "_grit":
		return _finish("invalid_original_grit_declaration")
	_player = player
	_world = world
	_state = state
	_resources = resources
	_readers = Readers.new(self)
	var affix = AFFIX.new()
	var reference = REFERENCE.new()
	var formula = FORMULA.new()
	var passives = PASSIVES.new()
	var rates = RATES.new()
	var fusion = FUSION.new()
	var crystal = CRYSTAL.new()
	var grit = GRIT.new()
	var raw_grit = RAW_GRIT.new()
	var parameters = PARAMETERS.new()
	_providers = {"affix": affix, "reference": reference, "formula": formula,
		"passives": passives, "rates": rates, "fusion": fusion,
		"crystal": crystal, "grit": grit, "raw_grit": raw_grit, "parameters": parameters}
	# Configuration callbacks are allowed to read the bound source State during
	# this candidate phase; the actor claim is installed only after all succeed.
	_bindings = {"affix": affix.configure_inventory_reader(Callable(_readers, "inventory")),
		"reference_inventory": reference.configure_inventory_reader(Callable(_readers, "inventory")),
		"reference_player": reference.configure_player_reader(Callable(_readers, "p")),
		"reference_stats": reference.configure_stats_reader(Callable(_readers, "stats")),
		"formula_player": formula.configure_player_reader(Callable(_readers, "p")),
		"formula_inventory": formula.configure_inventory_reader(Callable(_readers, "inventory")),
		"formula_affix": formula.configure_affix_reader(affix),
		"passives_current": passives.configure_current_passives_reader(Callable(_readers, "passives"))}
	for key in _bindings:
		if not _bindings[key] is bool or not _bindings[key]:
			return _discard("original_configuration_rejected:" + key)
	var refs: Dictionary = reference.bind_combat_stat_formula(formula)
	var passive_formula: Dictionary = passives.bind_combat_stat_formula(formula, PASSIVES.SOURCE_CURRENT)
	var rate_ready: Dictionary = rates.configure(Callable(_readers, "passives"),
		Callable(_readers, "p"), Callable(_readers, "inventory"))
	var fusion_ready: Dictionary = fusion.configure(Callable(_readers, "p"))
	var raw_ready: Dictionary = raw_grit.initialize({"_grit": boot["raw"]})
	var grit_ready: Dictionary = grit.configure(Callable(_readers, "raw_grit"), "_grit", LINEAGE)
	if refs.get("ok") != true or passive_formula.get("ok") != true \
			or rate_ready.get("ready") != true or fusion_ready.get("ready") != true \
			or raw_ready.get("ready") != true or grit_ready.get("ready") != true:
		return _discard("original_provider_binding_rejected")
	var parameter_providers = {PARAMETERS.PROVIDER_PLAYER: Callable(_readers, "p"),
		PARAMETERS.PROVIDER_STATS: Callable(_readers, "stats"),
		PARAMETERS.PROVIDER_PASSIVES: Callable(_readers, "passives"),
		PARAMETERS.PROVIDER_INVENTORY: Callable(_readers, "inventory"),
		PARAMETERS.PROVIDER_EQ_AFFIX: Callable(affix, "eq_affix"),
		PARAMETERS.PROVIDER_EQ_STAT: Callable(reference, "eq_stat"),
		PARAMETERS.PROVIDER_LV_B: Callable(reference, "lv_b")}
	var grit_attached: Dictionary = grit.with_grit_provider(parameter_providers)
	if grit_attached.get("ok") != true:
		return _discard("original_grit_provider_rejected")
	var crystal_attached: Dictionary = crystal.with_crystal_effects_provider(grit_attached["providers"])
	if crystal_attached.get("ok") != true:
		return _discard("original_conditional_crystal_provider_not_ready")
	_parameter_providers = crystal_attached["providers"]
	# Deliberately leave the actual ordered command sink unbound. Main owns
	# that next integration, including source intermediate writes/cache events.
	var parameter_ready: Dictionary = parameters.configure(_parameter_providers, Callable())
	if parameter_ready.get("ready") != false or parameter_ready.get("missing") != ["resource_sink"] \
			or parameter_ready.get("conditional_unbound") != []:
		return _discard("unexpected_source_parameters_configuration")
	error = _constructor_error(player, world, state, resources)
	if not error.is_empty():
		return _discard(error)
	_grit_boot = boot.duplicate(true)
	_bindings["reference_formula"] = refs
	_bindings["passives_formula"] = passive_formula
	_bindings["rates"] = rate_ready
	_bindings["fusion"] = fusion_ready
	_bindings["grit"] = grit_ready
	_bindings["parameters"] = parameter_ready
	player.set_meta(CLAIM_META, weakref(self))
	player.set_meta(INITIALIZED_META, true)
	_configured = true
	return _finish("")

func get_native_source_player() -> Node2D:
	return _player if _context_error().is_empty() else null

func get_native_source_world() -> Node:
	return _world if _context_error().is_empty() else null

func is_native_source_providers_ready() -> bool:
	return _configured and _context_error().is_empty()

func get_provider_bundle() -> Dictionary:
	if not is_native_source_providers_ready():
		return {}
	var bundle = _providers.duplicate()
	bundle["current_g"] = Callable(_readers, "g")
	bundle["current_p"] = Callable(_readers, "p")
	bundle["current_stats"] = Callable(_readers, "stats")
	bundle["current_passives"] = Callable(_readers, "passives")
	bundle["current_inventory"] = Callable(_readers, "inventory")
	bundle["fuse_star"] = Callable(_providers["fusion"], "fuse_star")
	bundle["grit_total"] = Callable(_providers["parameters"], "read_source_grit_total")
	bundle["parameter_providers"] = _parameter_providers.duplicate()
	return bundle

func get_provider(name: String) -> Object:
	return _providers.get(name) if is_native_source_providers_ready() else null

func _read_domain(key: String) -> Variant:
	if not _context_error().is_empty() or not DOMAINS.has(key):
		return null
	return _state.call(DOMAINS[key])

func _read_raw_grit_container() -> Variant:
	if not _context_error().is_empty() or not _live(_providers.get("raw_grit")):
		return null
	return _providers["raw_grit"].current_container()

static func _constructor_error(player: Variant, world: Variant, state: Variant, resources: Variant) -> String:
	if not _nodes_live(player, world, state, resources):
		return "missing_live_actual_source_nodes"
	if player.is_inside_tree() or player.is_node_ready():
		return "actual_player_already_entered_tree"
	if player.has_meta(CLAIM_META) or player.has_meta(INITIALIZED_META):
		return "actual_player_provider_binding_already_claimed"
	return _ownership_error(player, world, state, resources)

static func _ownership_error(player: Variant, world: Variant, state: Variant, resources: Variant) -> String:
	if not _nodes_live(player, world, state, resources):
		return "lost_actual_source_nodes"
	if state.get_script() != STATE or resources.get_script() != RESOURCES:
		return "source_state_or_resource_authority_script_mismatch"
	for method in ["get_native_new_run_player", "get_native_new_run_world"]:
		if not state.has_method(method):
			return "missing_actual_state_method:" + method
	for method in ["get_native_regen_player", "get_native_regen_world"]:
		if not resources.has_method(method):
			return "missing_actual_resource_method:" + method
	if not player.has_method("get_combat_world") or player.get_combat_world() != world \
			or state.get_native_new_run_player() != player or state.get_native_new_run_world() != world \
			or resources.get_native_regen_player() != player or resources.get_native_regen_world() != world:
		return "source_provider_actor_world_mismatch"
	# Canonical Main owns Player and World as siblings. Only the source
	# holders are World children; Player ownership uses its actual world ref,
	# World.player and same-Tree checks below, without forced reparenting.
	for node in [state, resources]:
		if node.get_parent() != null and node.get_parent() != world:
			return "source_provider_node_reparented"
	if world.get("player") != null and world.get("player") != player:
		return "actual_world_has_another_player"
	if player.is_inside_tree():
		if not world.is_inside_tree() or player.get_tree() != world.get_tree() \
				or not state.is_native_new_run_state_ready() or not resources.is_native_source_resources_ready():
			return "source_provider_live_tree_mismatch"
	elif player.is_node_ready():
		return "actual_player_removed_from_tree"
	return ""

func _context_error() -> String:
	if not _configured and not _configuring:
		return "unconfigured"
	var error = _ownership_error(_player, _world, _state, _resources)
	if not error.is_empty():
		return error
	if _configured:
		var initialized: Variant = _player.get_meta(INITIALIZED_META, null)
		var claim: Variant = _player.get_meta(CLAIM_META, null)
		if not initialized is bool or not initialized or not _live(claim) \
				or not claim is WeakRef or claim.get_ref() != self:
			return "actual_player_provider_claim_lost"
	for key in _providers:
		if not _live(_providers[key]):
			return "source_provider_freed:" + key
	if _configured:
		var raw: Variant = _providers["raw_grit"].current_container()
		if not raw is Dictionary or not _number(raw.get("_grit")):
			return "current_owned_raw_grit_not_ready"
	return ""

static func _nodes_live(player: Variant, world: Variant, state: Variant, resources: Variant) -> bool:
	return _live(player) and _live(world) and _live(state) and _live(resources)

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

func _fail(error: String) -> bool:
	_last_error = error
	return false

func _finish(error: String) -> bool:
	_configuring = false
	_last_error = error
	return error.is_empty()

func _discard(error: String) -> bool:
	_player = null
	_world = null
	_state = null
	_resources = null
	_providers.clear()
	_parameter_providers.clear()
	_readers = null
	_bindings.clear()
	return _finish(error)

func get_snapshot() -> Dictionary:
	var ready = is_native_source_providers_ready()
	var parameter_ready: Dictionary = _providers["parameters"].readiness() \
		if ready else {"ready": false, "status": "NOT_READY", "missing": ["actual_provider_lifecycle"]}
	return {"configured": _configured, "binding_ready": ready, "error": _last_error,
		"context_error": _context_error(), "bindings": _bindings.duplicate(true),
		"source_grit_boot_input": _grit_boot.duplicate(true), "raw_grit_lineage": LINEAGE,
		"raw_grit_current": _providers["raw_grit"].read_raw() if ready else null,
		"source_parameters": parameter_ready.duplicate(true),
		"source_parameter_provider_keys": _parameter_providers.keys(),
		"provider_names": _providers.keys(), "constructed_before_actor_tree": _configured,
		"resource_sink_installed_by_bundle": false, "apply_stats_calls": 0, "recalc_st_calls": 0,
		"automatic_rate_advance": false, "automatic_clock": false, "automatic_input": false,
		"source_formulas_reimplemented": false, "raw_grit_reset_restore_plan_called": false,
		"main_full_ready": false, "derived_parameter_application_proven": false,
		"hp_def_speed_shield_poise_configured": false, "public_play_proven": false}
