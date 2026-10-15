extends Node
## Explicit source file-init/current-state holder for one newly constructed Player.
## SOURCE_BOOT inputs stay unchanged. No bootstrap run, external ack, formula,
## actor writes, grit reset, stage publication, save IO or automatic clock.

const BOOTSTRAP = preload("res://port_modules/native_new_run_bootstrap_source/producer.gd")
const STARTER_FACTORY = preload("res://port_modules/starter_item_factory_source/producer.gd")
const SOURCE_RESOURCES = preload("res://scripts/native_source_resource_authority.gd")
const CLAIM_META = "native_source_new_run_state_owner"
const INITIALIZED_META = "native_source_new_run_state_initialized"
const RESOURCE_FIELDS = ["st", "mst", "stR", "mp", "mmp", "mpR"]
const LINEAGE = "new_run/source_file_init_owned_state"
const MISSING_MAIN_STEPS = ["actual_starter_15_equipment_and_10_bag",
	"resource_parameters_apply_stats_and_recalc_st", "hp_parameters_and_hpR",
	"full_bootstrap_external_steps_and_stage_publication"]
const INITIALIZATION_PACKET_SOURCES = {
	"apply_stats_effective_stats": "game.html:28566-28570",
	"apply_stats_base_attack_early": "game.html:28587-28588",
	"apply_stats_base_attack_crystal": "game.html:28602",
	"apply_stats_health_initial": "game.html:28567-28592",
	"apply_stats_health_crystal_mhp": "game.html:28601",
	"apply_stats_health_crystal_hpR": "game.html:28605",
	"apply_stats_health_fortify": "game.html:28616-28617",
	"apply_stats_def_speed_early": "game.html:28583-28590",
	"apply_stats_def_speed_crystal": "game.html:28603-28604",
	"apply_stats_def_speed_armor": "game.html:28619-28620",
	"apply_stats_poise_init": "game.html:28584-28586",
	"apply_stats_shield": "game.html:28622-28623",
	"apply_stats_resource_parameters": "game.html:28564-28614",
	"recalc_st_resource_parameters": "game.html:16933-16940"}
const INITIALIZATION_WRITE_SOURCES = {
	"apply_stats_effective_stats": {"_effStats": ["game.html:28570"]},
	"apply_stats_base_attack_early": {"baseAtk": ["game.html:28588"]},
	"apply_stats_base_attack_crystal": {"baseAtk": ["game.html:28602"]},
	"apply_stats_health_initial": {"mhp": ["game.html:28582"], "hpR": ["game.html:28592"]},
	"apply_stats_health_crystal_mhp": {"mhp": ["game.html:28601"], "hp": ["game.html:28601"]},
	"apply_stats_health_crystal_hpR": {"hpR": ["game.html:28605"]},
	"apply_stats_health_fortify": {"mhp": ["game.html:28617"], "hp": ["game.html:28617"]},
	"apply_stats_def_speed_early": {"baseDef": ["game.html:28583"], "speed": ["game.html:28589"], "_oocSpeed": ["game.html:28590"]},
	"apply_stats_def_speed_crystal": {"baseDef": ["game.html:28603"], "speed": ["game.html:28604"]},
	"apply_stats_def_speed_armor": {"baseDef": ["game.html:28620"]},
	"apply_stats_poise_init": {"maxPoise": ["game.html:28584"], "poise": ["game.html:28585"], "poiseR": ["game.html:28586"]},
	"apply_stats_shield": {"mshield": ["game.html:28622"], "shield": ["game.html:28623"]},
	"apply_stats_resource_parameters": {"stR": ["game.html:28591", "game.html:28607", "game.html:28614"],
		"mmp": ["game.html:28593", "game.html:28608", "game.html:28611"],
		"mpR": ["game.html:28594", "game.html:28606", "game.html:28611"],
		"mp": ["game.html:28608", "game.html:28611"], "_crystalStats": ["game.html:28600"]},
	"recalc_st_resource_parameters": {"mst": ["game.html:16939"], "st": ["game.html:16939"]}}
const INITIALIZATION_ACTOR_FIELDS = ["hp", "mhp", "baseDef", "speed", "maxPoise", "poise", "poiseR"]
const INITIALIZATION_PASS_KINDS = ["apply_stats_health_initial", "apply_stats_health_crystal_mhp",
	"apply_stats_health_crystal_hpR", "apply_stats_health_fortify", "apply_stats_def_speed_early",
	"apply_stats_def_speed_crystal", "apply_stats_def_speed_armor"]
const INITIALIZATION_HEALTH_KINDS = ["apply_stats_health_initial", "apply_stats_health_crystal_mhp",
	"apply_stats_health_crystal_hpR", "apply_stats_health_fortify"]

var _player: Node2D
var _world: Node
var _resources: Node
var _g: Dictionary = {}
var _stats: Dictionary = {}
var _passives: Dictionary = {}
var _inventory: Dictionary = {}
var _p: Dictionary = {}
var _source_packets: Dictionary = {}
var _initialized = false
var _initializing = false
var _last_error = "not_initialized"
var _initial_starter_attempted = false
var _initial_starter_running = false
var _initial_starter_completed = false
var _initial_starter_result: Dictionary = {}
var _initial_starter_ledger: Dictionary = {}
var _initial_starter_equipped_count = 0
var _initial_starter_bag_count = 0
var _source_initializer: WeakRef
var _source_initializer_world_parent: WeakRef
var _source_initializer_world_had_parent = false
var _source_initializer_state_parent: WeakRef
var _source_initializer_state_had_parent = false
var _source_initializer_bound = false
var _source_initializer_binding = false
var _source_initializer_committing = false
var _source_initializer_seen: Array = []
var _source_initializer_writes: Array[Dictionary] = []
var _source_initializer_rejections = 0

func _init() -> void:
	set_process(false)
	set_physics_process(false)

static func source_boot_p() -> Dictionary:
	# Original mkP literal, game.html:29655-29669. hpR is absent before applyStats.
	# This packet describes the constructor; it never claims current/derived.
	return {"status": "SOURCE_BOOT", "source": "game.html:29655-29669 mkP()",
		"phase": "pre_applyStats", "current": false, "derived": false,
		"values": {
			"x": 0, "y": 0, "r": 15, "hp": 350, "mhp": 350,
			"st": 200, "mst": 200, "stR": 0.28, "mp": 160, "mmp": 160, "mpR": 0,
			"lv": 1, "exp": 0, "maxExp": 15, "sp": 0, "ap": 0,
			"baseAtk": 8, "baseDef": 2, "speed": 2.6, "facing": 0,
			"s": "idle", "st2": 0, "atkArc": 0, "swProg": 0,
			"iframes": 0, "combo": 0, "comboT": 0, "blockFlash": 0, "blockPushT": 0,
			"chargeDx": 0, "chargeDy": 0, "chargeSpd": 0, "chargeHits": null,
			"chargeKills": 0, "chargeCd": 0, "chargeStocks": 1, "maxChargeStocks": 1,
			"kb": {"x": 0, "y": 0}, "shield": 0, "mshield": 0,
			"shieldRegenT": 0, "wwAng": 0, "rage": 0,
			"activeChargeSk": "charge", "activeBowSk": "normal",
			"activeTechSk": "giantSlam", "activeMagicSk": "fireball",
			"activeLMBSk": "kiSlash", "activeRMBSk": "maliceSwipe",
			"activeQSk": "parry", "activeCtSk": "ghostWalk",
			"skills": {"kiSlash": 1, "fireball": 1, "bladeDash": 1,
				"maliceSwipe": 1, "shieldThrow": 1},
			"_fused": {"shieldFuse": true}, "maskOn": true}}

func initialize_new_run(player: Node2D, world: Node, source_resources: Node) -> bool:
	if _initialized or _initializing:
		return _fail("already_initialized_or_reentrant")
	_initializing = true
	var error = _constructor_error(player, world, source_resources)
	if not error.is_empty():
		_initializing = false
		return _fail(error)
	# Use original producers; do not mutate their SOURCE_BOOT/current=false packets.
	var packets = {
		"g_file_init": BOOTSTRAP.source_boot_g(),
		"stats_file_init": BOOTSTRAP.source_boot_stats(),
		"passives_file_init": BOOTSTRAP.source_boot_passives(),
		"inventory_fresh_reset": BOOTSTRAP.source_fresh_reset_inv(),
		"stats_fresh_reset": BOOTSTRAP.source_fresh_reset_stats(),
		"p_constructor": source_boot_p()}
	for key in packets:
		var packet: Dictionary = packets[key]
		if packet.get("status") != "SOURCE_BOOT" or packet.get("current") != false \
				or packet.get("derived") != false or not packet.get("values") is Dictionary:
			_initializing = false
			return _fail("invalid_original_constructor_packet:" + key)
	# The constructors above have no callbacks. Validate again before installation.
	error = _constructor_error(player, world, source_resources)
	if not error.is_empty():
		_initializing = false
		return _fail(error)
	_player = player
	_world = world
	_resources = source_resources
	_source_packets = packets.duplicate(true)
	_g = packets["g_file_init"]["values"].duplicate(true)
	_stats = packets["stats_fresh_reset"]["values"].duplicate(true)
	_passives = packets["passives_file_init"]["values"].duplicate(true)
	_inventory = packets["inventory_fresh_reset"]["values"].duplicate(true)
	_p = packets["p_constructor"]["values"].duplicate(true)
	_player.set_meta(CLAIM_META, weakref(self))
	# Persistent even if this holder is later freed. No silent second initializer.
	_player.set_meta(INITIALIZED_META, true)
	_initialized = true
	_initializing = false
	_last_error = ""
	return true

func get_native_new_run_player() -> Node2D:
	return _player if _live(_player) else null

func get_native_new_run_world() -> Node:
	return _world if _live(_world) else null

func is_native_new_run_state_ready() -> bool:
	return _current_error().is_empty() and is_inside_tree() \
		and _player.is_inside_tree() and _world.is_inside_tree() \
		and get_parent() == _world and get_tree() == _world.get_tree() \
		and _player.get_tree() == _world.get_tree() and _world.get("player") == _player \
		and _resources.is_native_source_resources_ready()

func read_current_g() -> Variant:
	return _g if _current_error().is_empty() else null

func read_current_stats() -> Variant:
	return _stats if _current_error().is_empty() else null

func read_current_passives() -> Variant:
	return _passives if _current_error().is_empty() else null

func read_current_inventory() -> Variant:
	return _inventory if _current_error().is_empty() else null

func commit_native_q_fields(owner: Node, fields: Dictionary) -> bool:
	if not _current_error().is_empty() or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_state")!=self or owner.get("world")!=_world or get_tree().paused:
		return false
	for field in fields:
		if field=="_qDetonateFired":
			if not fields[field] is bool:return false
		elif field not in ["_sbCd","_sbHoldT","_sbReleaseR","_sbParryT","parryT","st2","parryBank","_sdHold","_kgChg","_kgTier","_sBashChgMul","_atkBon","_stWingT","_stCd"] or not (fields[field] is int or fields[field] is float) or not is_finite(float(fields[field])):
			return false
	for field in fields:_p[field]=fields[field]
	return true

func commit_native_e_wave_state(owner: Node, waves: Array, counter: int) -> bool:
	if not _current_error().is_empty() or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_state")!=self or owner.get("world")!=_world or get_tree().paused or counter<0 or counter>20:return false
	_g["_stProjs"]=waves
	_g["_gcT"]=counter
	return true

func read_current_p() -> Variant:
	if not _current_error().is_empty():
		return null
	var parameters: Dictionary = _resources.read_current_resource_parameters()
	if not _parameters_valid(parameters):
		return null
	# Sync actual fields into the same owned P reference. Never refill a resource
	# or write Player fields; remaining source fields retain the installed literal.
	_p["hp"] = _player.hp
	_p["mhp"] = _player.max_hp
	_p["r"] = _player.radius
	_p["s"] = _player.state
	_p["x"] = _player.global_position.x
	_p["y"] = _player.global_position.y
	_p["iframes"] = _player.iframes
	_p["facing"] = (_player.facing as Vector2).angle()
	for field in RESOURCE_FIELDS:
		_p[field] = parameters["values"][field]
	# Preserve raw mkP key absence until its original approved initialization write.
	if _player.has_method("read_native_source_initialization_fields"):
		var actual: Variant = _player.read_native_source_initialization_fields()
		if actual is Dictionary:
			for field in INITIALIZATION_ACTOR_FIELDS:
				if _p.has(field) and actual.has(field):
					_p[field] = actual[field]
	return _p

func bind_native_source_initialization(owner: Object) -> bool:
	if _source_initializer_bound or _source_initializer_binding or _source_initializer_committing:
		return _fail("source_initializer_already_bound_or_reentrant")
	_source_initializer_binding = true
	var error = _source_initialization_lifecycle_error()
	if error.is_empty() and not _live(owner):
		error = "source_initializer_owner_missing"
	if error.is_empty():
		for method in ["get_native_source_initialization_player", "get_native_source_initialization_world",
				"get_native_source_initialization_write_tag", "is_native_source_initialization_active"]:
			if not owner.has_method(method):
				error = "source_initializer_contract_missing:" + method
				break
	if error.is_empty() and (owner.get_native_source_initialization_player() != _player \
			or owner.get_native_source_initialization_world() != _world):
		error = "source_initializer_actor_world_mismatch"
	if not error.is_empty():
		_source_initializer_binding = false
		return _fail(error)
	_source_initializer = weakref(owner)
	_source_initializer_world_had_parent = _world.get_parent() != null
	_source_initializer_world_parent = weakref(_world.get_parent()) if _source_initializer_world_had_parent else null
	_source_initializer_state_had_parent = get_parent() != null
	_source_initializer_state_parent = weakref(get_parent()) if _source_initializer_state_had_parent else null
	_source_initializer_bound = true
	_source_initializer_binding = false
	return true

func commit_native_source_initialization_write(packet: Dictionary, write_index: int) -> bool:
	if _source_initializer_binding or _source_initializer_committing:
		return _reject_initialization_write("source_initializer_reentrant")
	_source_initializer_committing = true
	var error = _source_initialization_write_error(packet, write_index)
	if not error.is_empty():
		_source_initializer_committing = false
		return _reject_initialization_write(error)
	var write: Dictionary = packet["writes"][write_index]
	var field: String = write["field"]
	var value: Variant = write["value"]
	var accepted = false
	if INITIALIZATION_ACTOR_FIELDS.has(field):
		accepted = _player.has_method("commit_native_source_initialization_field") \
			and _player.commit_native_source_initialization_field(field, value)
		if accepted:
			var actual: Variant = _player.read_native_source_initialization_fields()
			accepted = actual is Dictionary and actual.has(field) and actual[field] == value
			if accepted:
				_p[field] = actual[field]
	elif RESOURCE_FIELDS.has(field):
		accepted = _resources.commit_native_source_initialization_write(packet, write_index)
		if accepted:
			var parameters: Dictionary = _resources.read_current_resource_parameters()
			accepted = _parameters_valid(parameters) and parameters["values"][field] == value
			if accepted:
				_p[field] = parameters["values"][field]
	else:
		# Dictionary fields are fresh owned source values, not fallback defaults.
		_p[field] = value.duplicate(true) if value is Dictionary else value
		accepted = _p[field] == value
	if not accepted:
		_source_initializer_committing = false
		return _reject_initialization_write("source_initializer_destination_rejected:" + field)
	var tag = _initialization_tag(packet, write)
	_source_initializer_seen.append(tag.duplicate())
	_source_initializer_writes.append({"kind": tag["kind"], "pass_id": tag["pass_id"],
		"field": field, "source": write["source"], "write_index": write_index,
		"value": value.duplicate(true) if value is Dictionary else value})
	_source_initializer_committing = false
	_last_error = ""
	return true

func _source_initialization_lifecycle_error() -> String:
	var error = _current_error()
	if not error.is_empty():
		return error
	if _initializing or _initial_starter_running or _player.is_inside_tree() \
			or _player.is_node_ready() or _player.get_parent() != null:
		return "source_initializer_requires_new_unparented_pre_tree_player"
	if _world.is_inside_tree() and _world.get_tree().paused:
		return "source_initializer_world_paused"
	if _source_initializer_bound:
		if _source_initializer_world_had_parent:
			if not _live(_source_initializer_world_parent) \
					or not _live(_source_initializer_world_parent.get_ref()) \
					or _world.get_parent() != _source_initializer_world_parent.get_ref():
				return "source_initializer_world_reparented"
		elif _world.get_parent() != null:
			return "source_initializer_world_reparented"
		if _source_initializer_state_had_parent:
			if not _live(_source_initializer_state_parent) \
					or not _live(_source_initializer_state_parent.get_ref()) \
					or get_parent() != _source_initializer_state_parent.get_ref():
				return "source_initializer_holder_reparented"
		elif get_parent() != null:
			return "source_initializer_holder_reparented"
	return ""

func _source_initialization_write_error(packet: Dictionary, write_index: int) -> String:
	var error = _source_initialization_lifecycle_error()
	if not error.is_empty():
		return error
	if not _source_initializer_bound or not _live(_source_initializer):
		return "source_initializer_unbound"
	var owner: Variant = _source_initializer.get_ref()
	if not _live(owner) or owner.get_native_source_initialization_player() != _player \
			or owner.get_native_source_initialization_world() != _world:
		return "source_initializer_owner_lost_or_mismatched"
	var active: Variant = owner.is_native_source_initialization_active()
	if not active is bool or not active:
		return "source_initializer_not_in_synchronous_write_phase"
	var kind: Variant = packet.get("kind")
	if not kind is String or not INITIALIZATION_PACKET_SOURCES.has(kind) \
			or packet.get("source") != INITIALIZATION_PACKET_SOURCES[kind]:
		return "source_initializer_packet_kind_or_source_denied"
	if INITIALIZATION_PASS_KINDS.has(kind) \
			and (not packet.get("pass_id") is int or packet["pass_id"] < 1):
		return "source_initializer_original_pass_id_missing"
	if not INITIALIZATION_PASS_KINDS.has(kind) and packet.has("pass_id"):
		return "source_initializer_no_pass_packet_was_modified"
	if not packet.get("writes") is Array or write_index < 0 or write_index >= packet["writes"].size():
		return "source_initializer_write_index_invalid"
	var write: Variant = packet["writes"][write_index]
	if not write is Dictionary or not write.get("field") is String \
			or not write.get("source") is String or not write.has("value"):
		return "source_initializer_original_write_missing"
	var field: String = write["field"]
	var whitelist: Dictionary = INITIALIZATION_WRITE_SOURCES[kind]
	if not whitelist.has(field) or not whitelist[field].has(write["source"]):
		return "source_initializer_field_or_anchor_denied"
	if field == "_effStats":
		if not _initialization_numeric_object(write["value"], ["str", "dex", "int", "vit", "lck"]):
			return "source_initializer_effective_stats_invalid"
	elif field == "_crystalStats":
		if not _initialization_numeric_object(write["value"], SOURCE_RESOURCES.PARAMETERS.CR_INIT_KEYS):
			return "source_initializer_crystal_stats_invalid"
	elif not _number(write["value"]):
		return "source_initializer_numeric_value_invalid"
	var tag = _initialization_tag(packet, write)
	var actual_tag: Variant = owner.get_native_source_initialization_write_tag()
	if not actual_tag is Dictionary or actual_tag.size() != tag.size():
		return "source_initializer_tag_invalid"
	for key in tag:
		if not actual_tag.has(key) or actual_tag[key] != tag[key]:
			return "source_initializer_tag_mismatch:" + key
	if _source_initializer_seen.has(tag):
		return "source_initializer_duplicate_write"
	if INITIALIZATION_HEALTH_KINDS.has(kind) or kind == "apply_stats_effective_stats":
		if not write.get("before_present") is bool \
				or write["before_present"] != _p.has(field) or not write.has("before"):
			return "source_initializer_before_presence_mismatch"
		var current: Variant = read_current_p()
		if not current is Dictionary:
			return "source_initializer_current_player_lost"
		if write["before_present"] and current[field] != write["before"]:
			return "source_initializer_before_value_mismatch"
	if not _live(owner):
		return "source_initializer_owner_lost_during_validation"
	return _source_initialization_lifecycle_error()

static func _initialization_tag(packet: Dictionary, write: Dictionary) -> Dictionary:
	return {"field": write["field"], "source": write["source"], "kind": packet["kind"],
		"pass_id": packet["pass_id"] if packet.has("pass_id") else 1}

static func _initialization_numeric_object(value: Variant, keys: Array) -> bool:
	if not value is Dictionary or value.keys() != keys:
		return false
	for key in keys:
		if not _number(value[key]):
			return false
	return true

func _reject_initialization_write(error: String) -> bool:
	_source_initializer_rejections += 1
	return _fail(error)

func run_native_initial_starter_items(random_unit: Callable, now_ms: Callable) -> Dictionary:
	if _initial_starter_attempted:
		return {"status": "ALREADY_ATTEMPTED", "reason": "initial_starter_once_claim",
			"result": _initial_starter_result.duplicate(true)}
	# Any first attempt is sticky, including invalid bindings or partial failure.
	# No source RNG/clock has been called at this point.
	_initial_starter_attempted = true
	var error = _starter_context_error()
	if error.is_empty() and (not random_unit.is_valid() or not now_ms.is_valid()):
		error = "initial_starter_provider_missing"
	if error.is_empty():
		error = _starter_inventory_error(true)
	if not error.is_empty():
		return _finish_starter_error(error)
	var factory = STARTER_FACTORY.new({"random_unit": random_unit, "now_ms": now_ms,
		"player_level": Callable(self, "_read_owned_player_level"),
		"equip_slot": Callable(self, "_equip_initial_starter_slot"),
		"append_bag": Callable(self, "_append_initial_starter_bag")})
	_initial_starter_running = true
	# Original order: mkItem x15, equip x15, then (mkItem -> bag) x10.
	# The original producer owns RNG/Date.now/UID and item formulas unchanged.
	var result: Dictionary = factory.run_new_game_starter_items()
	_initial_starter_running = false
	_initial_starter_ledger = factory.get_ledger()
	_initial_starter_result = result
	_initial_starter_completed = result.get("status") == STARTER_FACTORY.READY \
		and _initial_starter_equipped_count == 15 and _initial_starter_bag_count == 10 \
		and _starter_context_error().is_empty()
	if not _initial_starter_completed and result.get("status") == STARTER_FACTORY.READY:
		_initial_starter_result = {"status": STARTER_FACTORY.NOT_READY,
			"reason": "initial_starter_completion_or_lifecycle_mismatch",
			"equipped": result.get("equipped", []), "bag": result.get("bag", []),
			"factory_result": result}
	_last_error = "" if _initial_starter_completed else String(_initial_starter_result.get("reason", ""))
	# Preserve factory item references in the initial result as well as INV.
	# get_snapshot/repeated-attempt reporting provide isolated history copies.
	return _initial_starter_result

func _read_owned_player_level() -> Variant:
	if not _initial_starter_running or not _starter_context_error().is_empty():
		# null means original P.lv undefined and could synthesize a level fallback.
		# A lost actual holder must instead fail the producer's provider shape gate.
		return {"status": "NOT_READY", "reason": "initial_starter_current_player_lost"}
	return _p["lv"]

func _equip_initial_starter_slot(slot: String, item: Dictionary) -> bool:
	if not _initial_starter_running or not _starter_context_error().is_empty() \
			or not _starter_inventory_error(false).is_empty():
		return false
	var equipped: Dictionary = _inventory["equipped"]
	if not equipped.has(slot) or item.get("slot") != slot:
		return false
	equipped[slot] = item
	if not is_same(equipped[slot], item):
		return false
	_initial_starter_equipped_count += 1
	return true

func _append_initial_starter_bag(item: Dictionary) -> bool:
	if not _initial_starter_running or not _starter_context_error().is_empty() \
			or not _starter_inventory_error(false).is_empty():
		return false
	var bag: Array = _inventory["bag"]
	bag.append(item)
	if not is_same(bag.back(), item):
		return false
	_initial_starter_bag_count += 1
	return true

func _starter_context_error() -> String:
	var error = _current_error()
	if not error.is_empty():
		return error
	if _player.is_inside_tree() or _player.is_node_ready():
		return "initial_starter_player_already_entered_tree"
	if not _number(_p.get("lv")):
		return "initial_starter_current_player_level_missing"
	return ""

func _starter_inventory_error(require_reset: bool) -> String:
	if not _inventory.get("equipped") is Dictionary or not _inventory.get("bag") is Array:
		return "initial_starter_actual_inventory_missing"
	var equipped: Dictionary = _inventory["equipped"]
	if equipped.size() != BOOTSTRAP.EQUIPPED_SLOTS.size():
		return "initial_starter_actual_17_slots_missing"
	for slot in BOOTSTRAP.EQUIPPED_SLOTS:
		if not equipped.has(slot):
			return "initial_starter_actual_slot_missing:" + slot
		if require_reset and equipped[slot] != null:
			return "initial_starter_inventory_already_equipped"
	if require_reset and not _inventory["bag"].is_empty():
		return "initial_starter_inventory_bag_not_reset"
	return ""

func _finish_starter_error(error: String) -> Dictionary:
	_last_error = error
	_initial_starter_result = {"status": STARTER_FACTORY.NOT_READY,
		"reason": error, "equipped": [], "bag": []}
	return _initial_starter_result

func _missing_main_steps() -> Array:
	var missing = MISSING_MAIN_STEPS.duplicate()
	if _initial_starter_completed:
		missing.erase("actual_starter_15_equipment_and_10_bag")
	return missing

func get_snapshot() -> Dictionary:
	var error = _current_error()
	return {"initialized": _initialized, "ready": is_native_new_run_state_ready(),
		"error": error if not error.is_empty() else _last_error,
		"lineage": LINEAGE, "current_installed": error.is_empty(),
		"phase": "source_initialization_partial" if not _source_initializer_writes.is_empty() else "pre_applyStats",
		"main_initialization_ready": false,
		"main_full_ready": false, "derived_parameters_ready": false,
		"missing_main_steps": _missing_main_steps(),
		"source_boot_inputs": _source_packets.duplicate(true),
		"current_g": _copy_current(read_current_g()),
		"current_stats": _copy_current(read_current_stats()),
		"current_passives": _copy_current(read_current_passives()),
		"current_inventory": _copy_current(read_current_inventory()),
		"current_p": _copy_current(read_current_p()),
		"hpR_present": _p.has("hpR"), "fire_zones_present": _g.has("_fireZones"),
		"initial_starter_attempted": _initial_starter_attempted,
		"initial_starter_running": _initial_starter_running,
		"initial_starter_completed": _initial_starter_completed,
		"initial_starter_result": _initial_starter_result.duplicate(true),
		"initial_starter_ledger": _initial_starter_ledger.duplicate(true),
		"initial_starter_equipped_count": _initial_starter_equipped_count,
		"initial_starter_bag_count": _initial_starter_bag_count,
		"source_initializer_bound": _source_initializer_bound,
		"source_initializer_committing": _source_initializer_committing,
		"source_initializer_writes": _source_initializer_writes.duplicate(true),
		"source_initializer_rejections": _source_initializer_rejections,
		"source_initializer_remaining_source_scope": ["original prefix single loop/lvB1", "full G/stage/FRESH bootstrap"],
		"raw_grit_owned": false, "bootstrap_run": false,
		"external_steps_accepted": 0, "stage_published": false,
		"automatic_physics": false, "automatic_input": false,
		"restore_fallback": false, "missing_upstream_manufactured": false}

func _constructor_error(player: Node2D, world: Node, resources: Node) -> String:
	if not _live(self) or not _live(player) or not _live(world) or not _live(resources):
		return "missing_live_new_run_nodes"
	if player.is_inside_tree() or player.is_node_ready():
		return "player_already_entered_tree"
	if player.has_meta(CLAIM_META) or player.has_meta(INITIALIZED_META):
		return "player_already_has_new_run_state"
	if get_parent() != null and get_parent() != world:
		return "holder_has_foreign_parent"
	if not player.has_method("get_combat_world") or player.get_combat_world() != world:
		return "new_run_player_world_mismatch"
	if world.get("player") != null and world.get("player") != player:
		return "world_has_other_player"
	return _actual_fields_error(player, world, resources)

func _current_error() -> String:
	if not _initialized or not _live(self) or not _live(_player) \
			or not _live(_world) or not _live(_resources):
		return "missing_initialized_new_run_state"
	if get_parent() != null and get_parent() != _world:
		return "holder_reparented"
	var initialized_claim: Variant = _player.get_meta(INITIALIZED_META, null)
	if not initialized_claim is bool or not initialized_claim:
		return "new_run_initialized_claim_missing"
	var claim: Variant = _player.get_meta(CLAIM_META, null)
	if not _live(claim) or not claim is WeakRef or claim.get_ref() != self:
		return "new_run_actor_claim_mismatch"
	if not _player.has_method("get_combat_world") or _player.get_combat_world() != _world:
		return "current_player_world_mismatch"
	if _world.get("player") != null and _world.get("player") != _player:
		return "world_has_other_player"
	# Once the actual actor enters the Tree, every read requires live same-Tree
	# placement. The pre-Tree constructor read seam does not become a fallback.
	if _player.is_inside_tree():
		if not is_inside_tree() or not _world.is_inside_tree() \
				or get_parent() != _world or get_tree() != _world.get_tree() \
				or _player.get_tree() != _world.get_tree() or _world.get("player") != _player \
				or not _resources.is_native_source_resources_ready():
			return "current_tree_ownership_mismatch"
	elif _player.is_node_ready():
		return "player_removed_from_tree"
	return _actual_fields_error(_player, _world, _resources)

static func _actual_fields_error(player: Node2D, world: Node, resources: Node) -> String:
	if resources.get_script() != SOURCE_RESOURCES \
			or resources.get_native_regen_player() != player or resources.get_native_regen_world() != world:
		return "actual_resource_authority_mismatch"
	if resources.get_parent() != null and resources.get_parent() != world:
		return "resource_authority_reparented"
	if not player.get("state") is String or not player.global_position.is_finite() \
			or not player.get("facing") is Vector2 or not player.facing.is_finite():
		return "missing_current_actual_player_state"
	for field in ["hp", "max_hp", "radius", "iframes"]:
		if not _number(player.get(field)):
			return "missing_current_actual_player_field:" + field
	if not _parameters_valid(resources.read_current_resource_parameters()):
		return "current_source_resources_not_ready"
	return ""

static func _parameters_valid(packet: Dictionary) -> bool:
	if packet.get("status") != "READY" or packet.get("current") != true \
			or not packet.get("values") is Dictionary:
		return false
	for field in RESOURCE_FIELDS:
		if not _number(packet["values"].get(field)):
			return false
	return true

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _copy_current(value: Variant) -> Variant:
	return value.duplicate(true) if value is Dictionary else null

func _fail(error: String) -> bool:
	_last_error = error
	return false
