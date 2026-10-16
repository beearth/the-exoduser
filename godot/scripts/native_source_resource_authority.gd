class_name ExoduserNativeSourceResourceAuthority
extends Node
## Explicit new-run constructor authority, never a current/restore fallback.
## ST/state remain on the one actual Player; MP and base rates live here.
## No automatic clock, formula duplication, applyStats/recalcSt or save writes.

const PARAMETERS = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const CLAIM_META = "native_source_resource_authority_owner"
const INITIALIZED_META = "native_source_resource_authority_initialized"
const SOURCE_FIELDS = ["st", "mst", "stR", "mp", "mmp", "mpR"]
const OWN_FIELDS = ["mp", "mmp", "stR", "mpR"]
const LINEAGE = "new_run/source_boot_initialization"
const INITIALIZATION_SOURCES = {"apply_stats_resource_parameters": "game.html:28564-28614",
	"recalc_st_resource_parameters": "game.html:16933-16940"}
const INITIALIZATION_FIELDS = {
	"apply_stats_resource_parameters": {"stR": ["game.html:28591", "game.html:28607", "game.html:28614"],
		"mmp": ["game.html:28593", "game.html:28608", "game.html:28611"],
		"mpR": ["game.html:28594", "game.html:28606", "game.html:28611"],
		"mp": ["game.html:28608", "game.html:28611"]},
	"recalc_st_resource_parameters": {"mst": ["game.html:16939"], "st": ["game.html:16939"]}}

var _player: Node2D
var _world: Node
var _owned: Dictionary = {}
var _source_boot: Dictionary = {}
var _initialized = false
var _initializing = false
var _committing = false
var _q_mana_commits := 0
var _q_mana_spent := 0.0
var _e_stamina_commits := 0
var _e_stamina_spent := 0.0
var _last_error = "not_initialized"
var _commit_count = 0
var _commit_rejections = 0
var _last_packet: Dictionary = {}
var _source_phase: WeakRef
var _source_phase_bound = false
var _hp_commits = 0
var _flat_resource_commits = 0
var _last_source_write: Dictionary = {}
var _source_initializer: WeakRef
var _source_initializer_world_parent: WeakRef
var _source_initializer_world_had_parent = false
var _source_initializer_authority_parent: WeakRef
var _source_initializer_authority_had_parent = false
var _source_initializer_bound = false
var _source_initializer_binding = false
var _source_initializer_committing = false
var _source_initializer_seen: Array = []
var _source_initializer_writes: Array[Dictionary] = []
var _source_initializer_rejections = 0

func _init() -> void:
	set_process(false)
	set_physics_process(false)

func initialize_new_run(player: Node2D, world: Node, boot: Dictionary) -> bool:
	if _initialized or _initializing or _committing:
		return _fail("already_initialized_or_reentrant")
	_initializing = true
	var error = _constructor_error(player, world, boot)
	if not error.is_empty():
		_initializing = false
		return _fail(error)
	var values: Dictionary = boot["values"]
	# No callback/event occurs between these writes. All validation, including
	# the original literal/provenance contract, precedes the constructor commit.
	_player = player
	_world = world
	_owned = {"mp": values["mp"], "mmp": values["mmp"],
		"stR": values["stR"], "mpR": values["mpR"]}
	_source_boot = boot.duplicate(true)
	_player.stamina = float(values["st"])
	_player.max_stamina = float(values["mst"])
	_player.set_meta(CLAIM_META, weakref(self))
	_player.set_meta(INITIALIZED_META, true)
	_initialized = true
	_initializing = false
	_last_error = ""
	return true

func get_native_regen_player() -> Node2D:
	return _player if _live(_player) else null

func get_native_regen_world() -> Node:
	return _world if _live(_world) else null

func is_native_source_resources_ready() -> bool:
	return _current_error().is_empty() and is_inside_tree() \
		and _player.is_inside_tree() and _world.is_inside_tree() \
		and get_parent() == _world and get_tree() == _world.get_tree() \
		and _player.get_tree() == _world.get_tree() and _world.get("player") == _player

func read_native_regen_state() -> Dictionary:
	# Constructed current values are available before Tree entry as well as
	# after it. This does not permit a pre-Tree natural-regeneration commit.
	if not _current_error().is_empty():
		return {}
	return {"s": String(_player.state), "st": float(_player.stamina),
		"mst": float(_player.max_stamina), "mp": _owned["mp"],
		"mmp": _owned["mmp"], "stR": _owned["stR"], "mpR": _owned["mpR"],
		"x": _player.global_position.x, "y": _player.global_position.y}

func commit_native_q_mana_cost(owner: Node, amount: float) -> Dictionary:
	if not is_native_source_resources_ready() or _committing or get_tree().paused or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_resources")!=self or owner.get("world")!=_world or not is_finite(amount) or amount<0.0:
		return {"accepted":false,"reason":"actual_q_mana_owner_or_amount_not_ready"}
	var before: float = float(_owned["mp"])
	_committing=true
	_owned["mp"]=maxf(0.0,before-amount)
	_q_mana_commits+=1
	_q_mana_spent+=before-float(_owned["mp"])
	_last_source_write={"field":"mp","before":before,"value":_owned["mp"],"phase":"native_actual_q_control_cost"}
	_committing=false
	return {"accepted":true,"before":before,"after":_owned["mp"],"spent":before-float(_owned["mp"])}

func get_native_q_mana_commit_snapshot() -> Dictionary:
	return {"commits":_q_mana_commits,"spent":_q_mana_spent}

func commit_native_e_stamina_cost(owner: Node, amount: float) -> Dictionary:
	if not is_native_source_resources_ready() or _committing or get_tree().paused or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_resources")!=self or owner.get("world")!=_world or not is_finite(amount) or amount<=0.0 or _player.hp<=0.0 or _player.stamina<amount:
		return {"accepted":false,"reason":"actual_e_cost_gate"}
	var before: float = _player.stamina
	_committing=true
	_player.stamina-=amount
	_e_stamina_commits+=1
	_e_stamina_spent+=amount
	_last_source_write={"field":"st","phase":"native_actual_e_cost","before":before,"value":_player.stamina}
	_committing=false
	return {"accepted":true,"before":before,"after":_player.stamina,"spent":amount}

func commit_native_e_wave_protection(owner: Node) -> bool:
	if not is_native_source_resources_ready() or _committing or get_tree().paused or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_resources")!=self or owner.get("world")!=_world:return false
	_player.iframes=maxf(_player.iframes,40.0)
	return true

func get_native_e_stamina_commit_snapshot() -> Dictionary:
	return {"commits":_e_stamina_commits,"spent":_e_stamina_spent}

## R28729: normal auto bow captures ST, fires, then writes max(0,before-cost).
## Separate from Q/E. No full-cost/sufficiency gate, cap, refund or save write.
func commit_native_auto_crossbow_cost(owner: Node, before: float, amount: float) -> Dictionary:
	if not is_native_source_resources_ready() or _committing or get_tree().paused or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_resources")!=self or owner.get("world")!=_world or not is_finite(before) or not is_finite(amount) or _player.stamina!=before:
		return {"accepted":false,"reason":"actual_auto_crossbow_cost_owner_or_capture_not_ready"}
	_committing=true
	_player.stamina=maxf(0.0,before-amount)
	_last_source_write={"field":"st","phase":"native_normal_auto_crossbow_cost","before":before,"value":_player.stamina}
	_committing=false
	return {"accepted":true,"before":before,"after":_player.stamina,"spent":before-_player.stamina}

func commit_native_q_parry_reward(owner: Node, amount: float) -> Dictionary:
	if not is_native_source_resources_ready() or _committing or get_tree().paused or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_resources")!=self or owner.get("world")!=_world or not is_finite(amount) or amount<0.0:
		return {"accepted":false,"reason":"actual_parry_reward_owner_not_ready"}
	_committing=true
	_player.hp=minf(_player.max_hp,_player.hp+amount)
	_player.stamina=minf(_player.max_stamina,_player.stamina+amount)
	_owned.mp=minf(float(_owned.mmp),float(_owned.mp)+amount)
	_player.iframes=25.0
	_player.poise=minf(_player.max_poise,_player.poise+1.0)
	_last_source_write={"field":"hp/st/mp/iframes/poise","phase":"native_q_parry_reward","amount":amount}
	_committing=false
	return {"accepted":true,"hp":_player.hp,"st":_player.stamina,"mp":_owned.mp,"iframes":_player.iframes,"poise":_player.poise}

func read_current_resource_parameters() -> Dictionary:
	var error = _current_error()
	if not error.is_empty():
		return {"status": PARAMETERS.NOT_READY, "reason": error,
			"origin": LINEAGE, "current": false, "derived": false,
			"values": {}, "missing": [error],
			"phase": "source_initialization_partial" if not _source_initializer_writes.is_empty() else "constructed_before_apply_stats",
			"derived_ready": false, "main_full_ready": false}
	var state = read_native_regen_state()
	var values: Dictionary = {}
	for field in SOURCE_FIELDS:
		values[field] = state[field]
	return {"status": PARAMETERS.READY, "reason": "", "origin": LINEAGE,
		"current": true, "derived": false, "values": values, "missing": [],
		"phase": "source_initialization_partial" if not _source_initializer_writes.is_empty() else "constructed_before_apply_stats",
		"derived_ready": false, "main_full_ready": false,
		"lineage": {"kind": "new_run", "construction": "source_boot_initialization",
			"input_status": PARAMETERS.SOURCE_BOOT, "input_current": false,
			"input_derived": false, "source": _source_boot["source"]}}

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
	_source_initializer_authority_had_parent = get_parent() != null
	_source_initializer_authority_parent = weakref(get_parent()) if _source_initializer_authority_had_parent else null
	_source_initializer_bound = true
	_source_initializer_binding = false
	return true

func commit_native_source_initialization_write(packet: Dictionary, write_index: int) -> bool:
	if _source_initializer_binding or _source_initializer_committing or _committing or _initializing:
		return _reject_initialization_write("source_initializer_reentrant")
	_source_initializer_committing = true
	var error = _source_initialization_write_error(packet, write_index)
	if not error.is_empty():
		_source_initializer_committing = false
		return _reject_initialization_write(error)
	var write: Dictionary = packet["writes"][write_index]
	var field: String = write["field"]
	var value: Variant = write["value"]
	# One approved scalar write. No Math.min, cap repair, callback or signal.
	if field == "st":
		_player.stamina = value
	elif field == "mst":
		_player.max_stamina = value
	else:
		_owned[field] = value
	var tag = _source_initialization_tag(packet, write)
	_source_initializer_seen.append(tag.duplicate())
	_source_initializer_writes.append({"kind": tag["kind"], "pass_id": tag["pass_id"],
		"field": field, "source": write["source"], "write_index": write_index, "value": value})
	_source_initializer_committing = false
	_last_error = ""
	return true

func _source_initialization_lifecycle_error() -> String:
	var error = _current_error()
	if not error.is_empty():
		return error
	if _player.is_inside_tree() or _player.is_node_ready() or _player.get_parent() != null:
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
		if _source_initializer_authority_had_parent:
			if not _live(_source_initializer_authority_parent) \
					or not _live(_source_initializer_authority_parent.get_ref()) \
				or get_parent() != _source_initializer_authority_parent.get_ref():
				return "source_initializer_authority_reparented"
		elif get_parent() != null:
			return "source_initializer_authority_reparented"
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
	if not kind is String or not INITIALIZATION_SOURCES.has(kind) \
			or packet.get("source") != INITIALIZATION_SOURCES[kind] or packet.has("pass_id"):
		return "source_initializer_packet_kind_source_or_pass_denied"
	if not packet.get("writes") is Array or write_index < 0 or write_index >= packet["writes"].size():
		return "source_initializer_write_index_invalid"
	var write: Variant = packet["writes"][write_index]
	if not write is Dictionary or not write.get("field") is String \
			or not write.get("source") is String or not _number(write.get("value")):
		return "source_initializer_numeric_write_invalid"
	var whitelist: Dictionary = INITIALIZATION_FIELDS[kind]
	if not whitelist.has(write["field"]) or not whitelist[write["field"]].has(write["source"]):
		return "source_initializer_field_or_anchor_denied"
	var tag = _source_initialization_tag(packet, write)
	var actual_tag: Variant = owner.get_native_source_initialization_write_tag()
	if not actual_tag is Dictionary or actual_tag.size() != tag.size():
		return "source_initializer_tag_invalid"
	for key in tag:
		if not actual_tag.has(key) or actual_tag[key] != tag[key]:
			return "source_initializer_tag_mismatch:" + key
	if _source_initializer_seen.has(tag):
		return "source_initializer_duplicate_write"
	if not _live(owner):
		return "source_initializer_owner_lost_during_validation"
	return _source_initialization_lifecycle_error()

static func _source_initialization_tag(packet: Dictionary, write: Dictionary) -> Dictionary:
	return {"field": write["field"], "source": write["source"], "kind": packet["kind"], "pass_id": 1}

func _reject_initialization_write(error: String) -> bool:
	_source_initializer_rejections += 1
	return _fail(error)

func bind_native_source_regeneration_phase(phase: Object) -> bool:
	if _source_phase_bound or not is_native_source_resources_ready() or not _live(phase):
		return _fail("source_phase_missing_or_already_bound")
	for method in ["get_native_regen_player", "get_native_regen_world", "get_native_source_commit_phase"]:
		if not phase.has_method(method):
			return _fail("source_phase_contract_missing:" + method)
	if phase.get_native_regen_player() != _player or phase.get_native_regen_world() != _world:
		return _fail("source_phase_actor_world_mismatch")
	_source_phase = weakref(phase)
	_source_phase_bound = true
	return true

func commit_native_source_hp(new_hp: float) -> bool:
	# Original producers call one scalar sink. Only the bound dispatcher's
	# admitted, synchronous HP subphase may write the actual actor.
	if not _source_write_allowed(["holy_flat_hp", "hp_natural"]) \
			or not _number(new_hp) or new_hp > _player.max_hp:
		return _reject_commit("source_hp_sink_not_admitted_or_invalid")
	var source_phase: String = _source_phase.get_ref().get_native_source_commit_phase()
	_committing = true
	var before: float = _player.hp
	_player.hp = new_hp
	_hp_commits += 1
	_last_source_write = {"field": "hp", "before": before, "value": new_hp,
		"phase": source_phase}
	_committing = false
	_last_error = ""
	return true

func commit_native_holy_flat_resources(flat_result: Dictionary) -> bool:
	if not _source_write_allowed(["holy_flat_mpst"]):
		return _reject_commit("source_flat_resources_not_admitted")
	if flat_result.get("status") != "READY" or flat_result.get("outcome") != "heal" \
			or flat_result.get("source") != "game.html:33348-33352,45027-45032,45088" \
			or flat_result.get("shared_guard_active") != true or flat_result.get("applied") != true \
			or not flat_result.get("hp_packet") is Dictionary:
		return _reject_commit("invalid_holy_flat_result")
	var hp_packet: Dictionary = flat_result["hp_packet"]
	if not _number(hp_packet.get("new_hp")) or not _number(hp_packet.get("mhp")) \
			or float(hp_packet["new_hp"]) != _player.hp or float(hp_packet["mhp"]) != _player.max_hp:
		return _reject_commit("stale_holy_flat_hp_result")
	var amount: Variant = flat_result.get("mpst_flat_amount")
	# Computed +Inf is supported: the original Math.min caps it. NaN/-Inf
	# cannot come from an accepted finite-output HP flat producer result.
	if not (amount is int or amount is float) or is_nan(float(amount)) or float(amount) == -INF:
		return _reject_commit("invalid_holy_flat_amount")
	var mp_before: float = float(_owned["mp"])
	var st_before: float = _player.stamina
	var mp_after: float = minf(float(_owned["mmp"]), mp_before + float(amount))
	var st_after: float = minf(_player.max_stamina, st_before + float(amount))
	if not _number(mp_after) or not _number(st_after):
		return _reject_commit("nonfinite_holy_flat_resource_output")
	_committing = true
	# Source 33352 order is HP (already committed), then MP, then ST.
	_owned["mp"] = mp_after
	_player.stamina = st_after
	_flat_resource_commits += 1
	_last_source_write = {"phase": "holy_flat_mpst", "amount": amount,
		"writes": [{"field": "mp", "before": mp_before, "value": mp_after},
			{"field": "st", "before": st_before, "value": st_after}]}
	_committing = false
	_last_error = ""
	return true

func _source_write_allowed(phases: Array) -> bool:
	if _initializing or _committing or not is_native_source_resources_ready() or get_tree().paused:
		return false
	if not _source_phase_bound or not _live(_source_phase):
		return false
	var phase: Variant = _source_phase.get_ref()
	return _live(phase) and phases.has(phase.get_native_source_commit_phase())

func commit_native_regen_resources(packet: Dictionary) -> bool:
	if _initializing or _committing or not is_native_source_resources_ready():
		return _reject_commit("resource_authority_not_live_or_reentrant")
	if get_tree().paused:
		return _reject_commit("paused_resource_commit")
	var current = read_native_regen_state()
	var error = _packet_error(packet, current)
	if not error.is_empty():
		return _reject_commit(error)
	# Single synchronous transaction. No signal, callback, provider, await or
	# event can observe only one of the two writes or reenter this operation.
	_committing = true
	_player.stamina = float(packet["writes"][0]["value"])
	_owned["mp"] = packet["writes"][1]["value"]
	_last_packet = packet.duplicate(true)
	_commit_count += 1
	_committing = false
	_last_error = ""
	return true

func _constructor_error(player: Node2D, world: Node, boot: Dictionary) -> String:
	if not _live(self) or not _live(player) or not _live(world):
		return "missing_live_new_run_player_world"
	if player.is_inside_tree() or player.is_node_ready():
		return "player_already_entered_tree"
	if player.has_meta(CLAIM_META) or player.has_meta(INITIALIZED_META):
		return "player_already_has_resource_authority"
	if get_parent() != null and get_parent() != world:
		return "authority_has_foreign_parent"
	if not player.has_method("get_combat_world") or player.get_combat_world() != world:
		return "new_run_player_world_mismatch"
	var world_player: Variant = world.get("player")
	if world_player != null and world_player != player:
		return "world_has_other_player"
	if not player.get("state") is String \
			or not _number(player.get("stamina")) or not _number(player.get("max_stamina")):
		return "missing_actual_native_player_fields"
	var expected: Dictionary = PARAMETERS.source_boot_parameters()
	if boot.size() != expected.size() or boot.get("status") != expected["status"] \
			or boot.get("source") != expected["source"] \
			or not boot.get("derived") is bool or boot["derived"] \
			or not boot.get("current") is bool or boot["current"] \
			or not boot.get("values") is Dictionary or boot["values"].size() != SOURCE_FIELDS.size():
		return "invalid_source_boot_provenance"
	for field in SOURCE_FIELDS:
		if not _number(boot["values"].get(field)) \
				or float(boot["values"][field]) != float(expected["values"][field]):
			return "invalid_source_boot_value:" + field
	return ""

func _current_error() -> String:
	# is_instance_valid precedes every type test and every stored typed call.
	if not _initialized or not _live(self) or not _live(_player) or not _live(_world):
		return "missing_initialized_resource_authority"
	if get_parent() != null and get_parent() != _world:
		return "authority_reparented"
	if not _player.has_method("get_combat_world") or _player.get_combat_world() != _world:
		return "current_player_world_mismatch"
	var initialized_claim: Variant = _player.get_meta(INITIALIZED_META, null)
	if not initialized_claim is bool or not initialized_claim:
		return "resource_initialized_claim_missing"
	var claim: Variant = _player.get_meta(CLAIM_META, null)
	if not _live(claim) or not claim is WeakRef or claim.get_ref() != self:
		return "resource_actor_claim_mismatch"
	var world_player: Variant = _world.get("player")
	if world_player != null and world_player != _player:
		return "world_has_other_player"
	if not _player.get("state") is String \
			or not _number(_player.get("stamina")) or not _number(_player.get("max_stamina")) \
			or not _number(_player.get("hp")) or not _number(_player.get("max_hp")) \
			or not _player.global_position.is_finite():
		return "missing_current_actual_player_fields"
	for field in OWN_FIELDS:
		if not _number(_owned.get(field)):
			return "missing_current_owned_resource:" + field
	return ""

static func _packet_error(packet: Dictionary, current: Dictionary) -> String:
	if current.is_empty() or packet.size() != 3 \
			or packet.get("kind") != "natural_regen" \
			or packet.get("source") != "game.html:33359-33364" \
			or not packet.get("writes") is Array or packet["writes"].size() != 2:
		return "invalid_source_regeneration_packet"
	var fields = ["st", "mp"]
	var caps = ["mst", "mmp"]
	for index in range(2):
		var write: Variant = packet["writes"][index]
		if not write is Dictionary or write.size() != 4 \
				or write.get("field") != fields[index] or write.get("cap_field") != caps[index] \
				or not _number(write.get("before")) or not _number(write.get("value")):
			return "invalid_source_regeneration_write:" + str(index)
		if float(write["before"]) != float(current[fields[index]]) \
				or float(write["value"]) > float(current[caps[index]]):
			return "stale_before_or_cap_mismatch:" + fields[index]
	return ""

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

func _fail(error: String) -> bool:
	_last_error = error
	return false

func _reject_commit(error: String) -> bool:
	_commit_rejections += 1
	return _fail(error)

func get_snapshot() -> Dictionary:
	return {"initialized": _initialized, "ready": is_native_source_resources_ready(),
		"error": _last_error, "current_parameters": read_current_resource_parameters(),
		"source_boot_input": _source_boot.duplicate(true), "lineage": LINEAGE,
		"commit_count": _commit_count, "commit_rejections": _commit_rejections,
		"last_packet": _last_packet.duplicate(true), "automatic_physics": false,
		"source_phase_bound": _source_phase_bound, "hp_commits": _hp_commits,
		"source_initializer_bound": _source_initializer_bound,
		"source_initializer_committing": _source_initializer_committing,
		"source_initializer_writes": _source_initializer_writes.duplicate(true),
		"source_initializer_rejections": _source_initializer_rejections,
		"flat_resource_commits": _flat_resource_commits, "last_source_write": _last_source_write.duplicate(true),
		"automatic_input": false, "derived_parameters_ready": false,
		"restore_fallback": false, "missing_upstream_manufactured": false}
