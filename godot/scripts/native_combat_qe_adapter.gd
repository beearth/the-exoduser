class_name ExoduserNativeCombatQEAdapter
extends RefCounted
## Explicit ENGINE composition seam. No second Player, input hook or clock.
## Resource/stat reads and the readiness Callable must be read-only. The mana
## spender must atomically subtract its argument on true, change nothing on
## false, and preserve the bound Player/World throughout that synchronous call.

const PRODUCER = preload("res://port_modules/combat_qe/producer.gd")
const RUNTIME = preload("res://port_modules/combat_qe/combat_qe_runtime.gd")
const SERVICE_SCHEMA = "exoduser.godot.qe-services.v1"
const CONTEXT_SCHEMA = "exoduser.godot.native-projectile-fx-context.v1"
const REQUIRED_STATS = ["shield_cd_red", "block_base", "q_shield_mp_cost",
	"parry_bonus", "parry_dmg_mul", "leg_shield_parry", "parry_scale", "p_atk_mul"]
const REQUIRED_RESOURCES = ["mana", "max_mana", "active_q_skill", "detonate_lv",
	"shield_st_cost", "release_r"]
const SINK_METHODS = {"projectile_sink": {"spawn_burst": 1},
	"enemy_sink": {"apply_poise": 2, "apply_stun": 2},
	"impact_sink": {"on_burst_expire": 1, "on_parry_reflect": 2},
	"hit_sink": {"receive_native_projectile_contact": 5}}

var _player: Node2D
var _world: Node
var _stats_provider: Object
var _resource_provider: Object
var _sinks: Dictionary = {}
var _stats: Dictionary = {}
var _resources: Dictionary = {}
var _rt = RUNTIME.new()
var _active_burst: RUNTIME.BurstRing
var _configured = false
var _busy = false
var _mana_debit_committed = false
var _last_error = "unconfigured"
var _last_frame = -1.0
var _last_epoch = -1
var _world_identity: Array
var _clock_calls = 0
var _clock_rejections = 0
var _command_rejections = 0
var _contact_rejections = 0
var _last_contact_result: Dictionary = {}

# Runtime Object interface: shared fields always refer to the actual Player.
var state: String:
	get: return String(_player.state)
	set(value): _player.state = value
var poise: int:
	get: return int(_player.poise)
	set(value): _player.poise = value
var stamina: float:
	get: return float(_player.stamina)
	set(value): _player.stamina = value
var global_position: Vector2:
	get: return _player.global_position
	set(value): _player.global_position = value
var mana: float:
	get: return float(_resources["mana"])
	set(value):
		# request_q already committed this exact debit at the authoritative sink.
		# Runtime's -= expression updates only the mirror, never debits twice.
		if _mana_debit_committed:
			_resources["mana"] = value
var shield_cd_red: float:
	get: return float(_stats["shield_cd_red"])
var detonate_lv: int:
	get: return int(_resources["detonate_lv"])
var sb_parry_t = 0.0
var parry_t = 0.0
var shield_cd = 0.0
var sbash_st2 = 0.0
var parry_bank = 0
var sbash_chg_mul = 1.0
var _q_magic_mode = false
var _q_control_configured := false
var _q_control_owner: Node
var _q_control_draw: Node
var _q_owns_block := false
var q_movement_scale := 1.0

## Narrow source Q control. This does not declare the full QE/carrier services ready.
func configure_q_control(player: Node2D, world: Node, owner: Node, draw: Node) -> bool:
	if _configured or _q_control_configured or not is_instance_valid(owner) or not is_instance_valid(player) or not is_instance_valid(world) or not is_instance_valid(draw):return false
	if owner.get("player")!=player or owner.get("world")!=world or player.get_combat_world()!=world or world.get("player")!=player:return false
	_player=player
	_world=world
	_q_control_owner=owner
	_q_control_draw=draw
	_q_control_configured=true
	if not is_native_q_control_ready():
		_q_control_configured=false
		return false
	_last_frame=world.get_native_frame()
	_last_epoch=int(world.get_native_projectile_fx_context().frame_reset_epoch)
	return true

func is_native_q_control_ready() -> bool:
	if not _q_control_configured or not _live(_player) or not _live(_world) or not _live(_q_control_owner) or not _live(_q_control_draw):return false
	if not _player.is_inside_tree() or not _world.is_inside_tree() or not _q_control_owner.is_inside_tree() or _player.get_parent()!=_q_control_owner or _q_control_owner.get("player")!=_player or _q_control_owner.get("world")!=_world or _world.player!=_player:return false
	var current: Dictionary = _q_control_owner.read_native_q_control_resources()
	if current.get("ready")!=true:
		_last_error=str(current.get("reason","current_q_resources_missing"))
		return false
	_resources=current
	_stats={"block_base":current.block_base,"shield_cd_red":current.shield_cd_red}
	sb_parry_t=current.window
	shield_cd=current.cooldown
	parry_t=current.parry_t
	return true

func request_q_control() -> Dictionary:
	if not is_native_q_control_ready() or _world.get_tree().paused or state not in ["idle","sRecover"] or shield_cd>0.0 or mana<10.0:return {"accepted":false,"reason":"source_q_start_gate"}
	if not _q_control_owner.spend_native_qe_mana(10.0):return {"accepted":false,"reason":"actual_q_mana_commit_rejected"}
	_mana_debit_committed=true
	_q_owns_block=true
	_active_burst=_rt.enter_shield_block(self,PRODUCER.make_shield_block_intent(_player.radius,0),_q_control_draw)
	_mana_debit_committed=false
	if not _q_control_owner.commit_native_q_control_state({"_sbHoldT":0.0,"_sbReleaseR":0.0,"_sbParryT":sb_parry_t,"_sbCd":shield_cd,"parryT":0.0,"st2":999.0,"_qDetonateFired":false}):
		withdraw_q_control()
		return {"accepted":false,"reason":"actual_q_state_commit_rejected"}
	_player.emit_signal("telemetry_event","q_control_started",{"mana_cost":10.0,"full_qe_ready":false,"reflection_carrier_ready":false})
	return {"accepted":true,"scope":"Q_CONTROL_PARTIAL"}

func advance_q_control(ticks: float, frame: float, ens: Array) -> bool:
	if not is_native_q_control_ready():
		withdraw_q_control()
		return false
	var context: Dictionary = _world.get_native_projectile_fx_context()
	if _world.get_tree().paused or not is_finite(ticks) or ticks<=0.0 or not is_equal_approx(frame,_world.get_native_frame()) or frame<=_last_frame or not is_same(ens,_world.get_native_world_identity()) or not is_equal_approx(ticks,context.dt_sp) or int(context.frame_reset_epoch)<=_last_epoch:return false
	_last_frame=frame
	_last_epoch=int(context.frame_reset_epoch)
	_clock_calls+=1
	q_movement_scale=1.0
	var fields: Dictionary = {}
	if state=="sBlock":
		q_movement_scale=0.35
		fields["_sbHoldT"]=_resources.hold_ticks+ticks
		if sb_parry_t>0.0:fields["_sbParryT"]=sb_parry_t-ticks
		if not _q_control_owner.spend_native_qe_mana(float(_resources.max_mana)*0.000833*ticks) or not _q_control_owner.commit_native_q_control_state(fields):
			withdraw_q_control()
			return false
		if not is_native_q_control_ready():withdraw_q_control();return false
		if not _resources.parry_held or mana<=0.0:
			q_movement_scale=0.0
			_active_burst=_rt.release_shield(self,float(_resources.release_r),false,_q_control_draw)
			_q_control_owner.commit_native_q_control_state({"_sbReleaseR":_resources.release_r,"_sbHoldT":0.0,"_sbParryT":12.0})
			_q_owns_block=false
			_player.emit_signal("telemetry_event","q_control_released",{"radius":_resources.release_r,"mana":mana})
	else:
		if shield_cd>0.0:fields["_sbCd"]=shield_cd-ticks
		if state=="idle":
			if sb_parry_t>0.0:fields["_sbParryT"]=sb_parry_t-ticks
			elif _resources.release_saved!=0.0:fields["_sbReleaseR"]=0.0
		if not fields.is_empty():_q_control_owner.commit_native_q_control_state(fields)
	if _active_burst!=null and _active_burst.alive:_active_burst.advance(ticks)
	return true

func resolve_q_control_damage(raw_amount: int, is_dot: bool = false) -> Dictionary:
	if not is_native_q_control_ready() or state!="sBlock":return {"ready":false,"reason":"q_control_not_blocking"}
	# An unadopted reflection carrier must never become zero-damage immunity.
	if sb_parry_t>0.0 and not is_dot:return {"ready":false,"reason":"q_parry_carrier_not_adopted"}
	var reduced: Dictionary = _rt.shield_reduce_damage(self,raw_amount,float(_stats.block_base),sb_parry_t<=0.0 and not is_dot,is_dot)
	_player.emit_signal("telemetry_event","q_control_damage_resolved",{"raw_amount":raw_amount,"reduced":reduced,"reflection_carrier_ready":false})
	return {"ready":true,"reduced":reduced}

func resolve_q_control_projectile(projectile: Node, distance: float) -> Dictionary:
	if _busy or not is_native_q_control_ready() or _world.get_tree().paused or sb_parry_t<=0.0 or state in ["sBash","whirlwind","beam","elecRepent"]:
		return {"reflected":false,"reason":"q_source_window_inactive"}
	if not _live(projectile) or projectile.get_parent()!=_world or not is_finite(distance) or distance<0.0:
		return {"reflected":false,"reason":"actual_q_projectile_identity_not_ready"}
	_busy=true
	var result: Dictionary = _q_control_owner.reflect_native_q_source_projectile(projectile,distance)
	_busy=false
	return result

func withdraw_q_control() -> void:
	if _q_owns_block and _live(_player) and state=="sBlock":state="idle"
	_q_owns_block=false
	_q_control_configured=false
	q_movement_scale=1.0
	if _live(_q_control_draw):_q_control_draw.terminate()
	if _live(_q_control_owner):_q_control_owner.withdraw_native_q_visual()
	_active_burst=null

func get_q_control_snapshot() -> Dictionary:
	var ready: bool = is_native_q_control_ready()
	return {"ready":ready,"scope":"Q_CONTROL_PARTIAL","reason":"" if ready else _last_error,"state":state if _live(_player) else null,"mana":_resources.get("mana") if ready else null,"max_mana":_resources.get("max_mana") if ready else null,"hold_ticks":_resources.get("hold_ticks") if ready else null,"radius":_resources.get("release_r") if ready else null,"release_radius":_resources.get("release_saved") if ready else null,"burst_max_r":_active_burst.max_r if _active_burst!=null else null,"window":sb_parry_t,"cooldown":shield_cd,"movement_scale":q_movement_scale,"clock_calls":_clock_calls,"full_qe_ready":false,"reflection_carrier_ready":false,"e_ready":false}

func configure(player: Node2D, world: Node, stats_provider: Object,
		resource_provider: Object, sinks: Dictionary) -> bool:
	if _configured or _busy:
		return _fail("already_configured")
	# Complete candidate validation precedes binding, Player writes and children.
	var error = _binding_error(player, world, stats_provider, resource_provider, sinks)
	if not error.is_empty():
		return _fail(error)
	var stats_read: Variant = stats_provider.read_native_qe_stats(player)
	var resource_read: Variant = resource_provider.read_native_qe_resources()
	error = _stats_error(stats_read)
	if error.is_empty():
		error = _resources_error(resource_read)
	if not error.is_empty():
		return _fail(error)
	error = _binding_error(player, world, stats_provider, resource_provider, sinks)
	if not error.is_empty():
		return _fail("binding_changed_during_preflight:" + error)
	_player = player
	_world = world
	_stats_provider = stats_provider
	_resource_provider = resource_provider
	_sinks = sinks.duplicate()
	_stats = stats_read["provided"].duplicate(true)
	_resources = resource_read.duplicate(true)
	_last_frame = float(world.get_native_frame())
	_last_epoch = int(world.get_native_projectile_fx_context()["frame_reset_epoch"])
	_world_identity = world.get_native_world_identity()
	_configured = true
	_last_error = ""
	return true

func is_native_qe_ready() -> bool:
	return _configured and _binding_error(_player, _world, _stats_provider,
		_resource_provider, _sinks).is_empty() \
		and is_same(_world_identity, _world.get_native_world_identity()) and _refresh_inputs(false)

func get_native_qe_player() -> Node2D:
	return _player if is_instance_valid(_player) else null

func get_native_qe_world() -> Node:
	return _world if is_instance_valid(_world) else null

func allows_native_qe_iframe_reflection() -> bool:
	return is_native_qe_ready() and not _world.get_tree().paused \
		and _q_magic_mode and state != "sBash" \
		and PRODUCER.is_parry_window(state, sb_parry_t, sbash_st2)

func advance_native(ticks: float, frame: float, ens: Variant) -> bool:
	if _busy or not is_native_qe_ready() or _world.get_tree().paused \
			or not is_finite(ticks) or ticks <= 0.0 or not is_finite(frame):
		_clock_rejections += 1
		return _fail("invalid_or_paused_native_tick")
	var context: Dictionary = _world.get_native_projectile_fx_context()
	var actual_frame = float(_world.get_native_frame())
	var epoch = int(context["frame_reset_epoch"])
	if not is_same(ens, _world.get_native_world_identity()) \
			or not is_equal_approx(frame, actual_frame) \
			or not is_equal_approx(ticks, float(context["dt_sp"])) \
			or frame <= _last_frame or epoch <= _last_epoch:
		_clock_rejections += 1
		return _fail("stale_duplicate_or_mismatched_native_tick")
	_busy = true
	_rt.tick(self, _active_burst, ticks / 60.0, _sinks["impact_sink"])
	if _active_burst != null and not _active_burst.alive:
		_active_burst = null
	_last_frame = frame
	_last_epoch = epoch
	_clock_calls += 1
	_busy = false
	_last_error = ""
	return true

func request_q() -> Dictionary:
	if not _command_ready() or state != "idle":
		return _command_failure("q_requires_live_idle_player")
	# Its separate source cooldown/state body has not been adopted here.
	# Do not let the pure route's peace branch bypass the real MP/cooldown gate.
	if _resources["active_q_skill"] == "peaceShield":
		return _command_failure("peace_shield_full_runtime_not_adopted")
	var route = PRODUCER.route_q(String(_resources["active_q_skill"]),
		_resources["active_q_skill"] == "peaceShield", mana, shield_cd)
	if route == PRODUCER.QRoute.BLOCKED or route == PRODUCER.QRoute.ICE_ORB:
		return _command_failure("q_route_blocked")
	_busy = true
	if route == PRODUCER.QRoute.SHIELD_BLOCK:
		var spent: Variant = _resource_provider.spend_native_qe_mana(float(_stats["q_shield_mp_cost"]))
		if not spent is bool or not spent:
			_busy = false
			return _command_failure("mana_commit_rejected")
		_mana_debit_committed = true
		_q_magic_mode = true
		_active_burst = _rt.enter_shield_block(self,
			PRODUCER.make_shield_block_intent(get_player_r(), detonate_lv), _sinks["projectile_sink"])
		_mana_debit_committed = false
	else:
		_q_magic_mode = true
		_rt.enter_peace_shield(self, PRODUCER.make_peace_shield_intent())
	_busy = false
	_last_error = ""
	var result = _result(true, true)
	result["route"] = route
	result["state"] = state
	return result

func request_e(chg_mul: float = 1.0) -> Dictionary:
	if not _command_ready() or state != "idle" or not is_finite(chg_mul):
		return _command_failure("e_requires_live_idle_player")
	var cost = float(_resources["shield_st_cost"])
	if stamina < cost:
		return _command_failure("stamina_insufficient")
	_busy = true
	stamina = maxf(0.0, stamina - cost)
	_q_magic_mode = false
	state = "sBash"
	sbash_st2 = 20.0
	sbash_chg_mul = clampf(chg_mul, 1.0, 3.0)
	_busy = false
	_last_error = ""
	var result = _result(true, true)
	result["state"] = state
	result["sbash_st2"] = sbash_st2
	result["chg_mul"] = sbash_chg_mul
	result["e_movement_and_completion_ready"] = false
	return result

func release_shield() -> Dictionary:
	if not _command_ready() or state not in ["sBlock", "peaceShield"]:
		return _command_failure("no_active_shield")
	_busy = true
	var peace = state == "peaceShield"
	_q_magic_mode = true
	_active_burst = _rt.release_shield(self, float(_resources["release_r"]),
		peace, _sinks["projectile_sink"])
	_busy = false
	_last_error = ""
	return _result(true, true)

func resolve_native_contact(proj: Object, raw_damage: int, is_dot: bool = false) -> Dictionary:
	if _busy or not is_native_qe_ready() or _world.get_tree().paused:
		return _contact_failure("qe_binding_not_ready")
	if not _live(proj) or raw_damage < 0 or not _integer(proj.get("ptype")) \
			or int(proj.get("ptype")) not in [PRODUCER.ProjType.PHYSICAL,
			PRODUCER.ProjType.MAGIC, PRODUCER.ProjType.BLACKBEAN] \
			or not _number(proj.get("dmg")) or float(proj.get("dmg")) < 0.0:
		return _contact_failure("missing_or_invalid_source_contact_facade")
	var in_window = PRODUCER.is_parry_window(state, sb_parry_t, sbash_st2)
	var reaction = PRODUCER.Reaction.NONE
	if int(proj.ptype) == PRODUCER.ProjType.BLACKBEAN:
		reaction = PRODUCER.resolve_contact(PRODUCER.ProjType.BLACKBEAN, in_window, _q_magic_mode)
	elif in_window:
		reaction = PRODUCER.Reaction.PARRY_REFLECT_BLUE
	elif state in ["sBlock", "peaceShield"]:
		reaction = PRODUCER.Reaction.SHIELD_REDUCE
	var result = _result(true, true, reaction)
	if reaction == PRODUCER.Reaction.PARRY_REFLECT_BLUE:
		# Canonical black Q damage/bank ordering is being repaired by its owner.
		# The proposed spawn_reflected seam is not an adopted actual carrier.
		if int(proj.ptype) == PRODUCER.ProjType.BLACKBEAN:
			return _contact_failure("blackbean_source_carrier_not_adopted")
		var reflection_error = _reflection_error(proj)
		if not reflection_error.is_empty():
			return _contact_failure(reflection_error)
	_busy = true
	if reaction == PRODUCER.Reaction.PARRY_REFLECT_BLUE:
		if int(proj.ptype) == PRODUCER.ProjType.BLACKBEAN:
			result["parry"] = _rt.reflect_blackbean_q(self, proj,
				_sinks.get("homing_target"), _sinks["carrier_sink"])
		else:
			var reflected_damage = _rt._do_parry_native(self, proj,
				_sinks["enemy_sink"], _sinks["impact_sink"])
			result["parry"] = {"reflect_dmg": reflected_damage,
				"poise": PRODUCER.PARRY_POISE, "stun_frames": PRODUCER.PARRY_STUN_FRAMES}
	elif reaction == PRODUCER.Reaction.SHIELD_REDUCE:
		result["reduced"] = _rt.shield_reduce_damage(self, raw_damage,
			float(_stats["block_base"]), sb_parry_t <= 0.0 and not is_dot, is_dot)
	_busy = false
	_last_error = ""
	_last_contact_result = result.duplicate(true)
	return result

func get_player_r() -> float: return float(_player.radius)
func is_q_magic_parry() -> bool: return _q_magic_mode
func get_parry_scale() -> float: return float(_stats["parry_scale"])
func get_parry_dmg_mul() -> float: return float(_stats["parry_dmg_mul"])
func get_parry_bonus() -> float: return float(_stats["parry_bonus"])
func get_leg_shield_parry() -> float: return float(_stats["leg_shield_parry"])
func get_ki_floor() -> float: return float(_player.melee_ref) * 14.0 * float(_player.stat_str) * float(_stats["p_atk_mul"])

func tick_parry_window(frames: float) -> void:
	if sb_parry_t > 0.0 and state in ["sBlock", "peaceShield", "idle"]:
		sb_parry_t = maxf(0.0, sb_parry_t - frames)
	if state == "sBlock":
		parry_t += frames
	if state != "sBlock" and shield_cd > 0.0:
		shield_cd = maxf(0.0, shield_cd - frames)
	if state == "sBash" and sbash_st2 > 0.0:
		sbash_st2 = maxf(0.0, sbash_st2 - frames)

func _command_ready() -> bool:
	return not _busy and is_native_qe_ready() and not _world.get_tree().paused and float(_player.hp) > 0.0

func _refresh_inputs(commit: bool = true) -> bool:
	var supplied: Variant = _stats_provider.read_native_qe_stats(_player)
	var resources: Variant = _resource_provider.read_native_qe_resources()
	var error = _stats_error(supplied)
	if error.is_empty():
		error = _resources_error(resources)
	if not error.is_empty():
		return _fail(error)
	# Readiness also refreshes the authoritative snapshots used by a command.
	# No field on the Player/provider changes here.
	if commit or not _busy:
		_stats = supplied["provided"].duplicate(true)
		_resources = resources.duplicate(true)
	return true

static func _binding_error(player: Node2D, world: Node, stats_provider: Object,
		resource_provider: Object, sinks: Dictionary) -> String:
	if not _live(player) or not _live(world) or not player.is_inside_tree() \
			or not world.is_inside_tree() or player.get_tree() != world.get_tree():
		return "missing_live_same_tree_player_world"
	if not player.has_method("get_combat_world") or player.get_combat_world() != world \
			or world.get("player") != player:
		return "actual_player_world_mismatch"
	if not player.get("state") is String or not _integer(player.get("poise")) \
			or not _integer(player.get("hp")):
		return "missing_actual_player_state_poise_hp"
	for key in ["stamina", "radius", "melee_ref", "stat_str"]:
		if not _number(player.get(key)):
			return "missing_actual_player_field:" + key
	if float(player.radius) <= 0.0 or not player.global_position.is_finite():
		return "invalid_actual_player_geometry"
	for method in ["get_native_frame", "get_native_world_identity", "get_native_projectile_fx_context"]:
		if not world.has_method(method):
			return "missing_world_method:" + method
	if not _number(world.get_native_frame()) or float(world.get_native_frame()) < 0.0 \
			or not world.get_native_world_identity() is Array:
		return "invalid_actual_world_clock_identity"
	var context: Variant = world.get_native_projectile_fx_context()
	if not _context_valid(context):
		return "invalid_actual_world_context"
	if not _provider_live(stats_provider, world) or not _method_accepts(stats_provider, "read_native_qe_stats", 1):
		return "missing_qe_stats_provider"
	if not _provider_live(resource_provider, world):
		return "missing_qe_resource_provider"
	var resource_methods = {"get_native_qe_player": 0, "read_native_qe_resources": 0, "spend_native_qe_mana": 1}
	for method in resource_methods:
		if not _method_accepts(resource_provider, method, int(resource_methods[method])):
			return "missing_resource_method:" + method
	if resource_provider.get_native_qe_player() != player:
		return "resource_player_mismatch"
	if sinks.get("schema") != SERVICE_SCHEMA or not sinks.get("readiness") is Callable \
			or not sinks["readiness"].is_valid():
		return "missing_qe_services_readiness"
	for key in SINK_METHODS:
		var sink: Variant = sinks.get(key)
		if not _provider_live(sink, world):
			return "missing_live_sink:" + key
		for method in SINK_METHODS[key]:
			if not _method_accepts(sink, method, int(SINK_METHODS[key][method])):
				return "missing_sink_method:" + key + ":" + method
	if sinks["hit_sink"] != player:
		return "hit_sink_player_mismatch"
	if not _provider_live(sinks["readiness"].get_object(), world):
		return "missing_live_readiness_owner"
	var ready: Variant = sinks["readiness"].call()
	if not ready is bool or not ready:
		return "qe_sinks_not_ready"
	return ""

static func _stats_error(value: Variant) -> String:
	if not value is Dictionary or not value.get("provided") is Dictionary \
			or not value.get("missing") is Dictionary or not value["missing"].is_empty():
		return "missing_source_qe_stats"
	for key in REQUIRED_STATS:
		if not _number(value["provided"].get(key)):
			return "missing_or_nonfinite_stat:" + key
	if float(value["provided"]["q_shield_mp_cost"]) != PRODUCER.MP_COST_SHIELD:
		return "q_mp_cost_must_equal_source_10"
	return ""

static func _resources_error(value: Variant) -> String:
	if not value is Dictionary:
		return "missing_source_qe_resources"
	for key in REQUIRED_RESOURCES:
		if not value.has(key):
			return "missing_resource:" + key
	for key in ["mana", "max_mana", "shield_st_cost", "release_r"]:
		if not _number(value[key]) or float(value[key]) < 0.0:
			return "invalid_resource:" + key
	if float(value["mana"]) > float(value["max_mana"]) \
			or not value["active_q_skill"] is String or not _integer(value["detonate_lv"]) \
			or int(value["detonate_lv"]) < 0 or float(value["release_r"]) <= 0.0:
		return "invalid_qe_resource_values"
	return ""

func _reflection_error(proj: Object) -> String:
	for key in ["blue_bean", "parry_blue_bean", "homing", "magic", "friendly"]:
		if not proj.get(key) is bool:
			return "missing_reflection_carrier_field:" + key
	if not proj.get("col") is String:
		return "missing_reflection_carrier_color"
	if int(proj.ptype) != PRODUCER.ProjType.BLACKBEAN:
		return ""
	var carrier: Variant = _sinks.get("carrier_sink")
	if not _provider_live(carrier, _world) or not _method_accepts(carrier, "spawn_reflected", 2):
		return "missing_blackbean_carrier"
	for key in ["vx", "vy", "life", "ml", "aoe_r", "aoe_dmg"]:
		if not _number(proj.get(key)):
			return "missing_blackbean_carrier_field:" + key
	for key in ["black_bean", "from_rainbow"]:
		if not proj.get(key) is bool:
			return "missing_blackbean_carrier_field:" + key
	var target: Variant = _sinks.get("homing_target")
	if target != null and (not _live(target) or not _number(target.get("x")) or not _number(target.get("y"))):
		return "invalid_blackbean_homing_target"
	return ""

static func _context_valid(context: Variant) -> bool:
	return context is Dictionary and context.get("schema") == CONTEXT_SCHEMA \
		and context.get("clock_mode") == "godot_delta_native60" \
		and _number(context.get("dt_sp")) and float(context["dt_sp"]) > 0.0 \
		and _integer(context.get("frame_reset_epoch")) and int(context["frame_reset_epoch"]) >= 0

static func _live(value: Variant) -> bool:
	return typeof(value)==TYPE_OBJECT and is_instance_valid(value) \
		and (not value is Node or not value.is_queued_for_deletion())

static func _provider_live(value: Variant, world: Node) -> bool:
	return _live(value) and (not value is Node \
		or (value.is_inside_tree() and value.get_tree() == world.get_tree()))

static var _METHOD_ARITY_CACHE: Dictionary = {}
static func _method_accepts(value: Object, method_name: String, argument_count: int) -> bool:
	if not value.has_method(method_name):
		return false
	# PERF(2026-10-21): get_method_list()는 대상 스크립트+엔진 기본 메서드 수백 개를 매번 복사한다.
	# 틱마다 수십 번 불려 물리 1틱을 ~18ms 썼다(PC 실측). 인자 범위는 스크립트가 바뀌지 않는 한
	# 불변이므로 (스크립트|클래스, 메서드)별로 한 번만 계산해 재사용한다. 판정 결과는 동일.
	var arity_script: Variant = value.get_script()
	var arity_key: String = (str(arity_script.get_instance_id()) if arity_script != null else str(value.get_class())) + ":" + method_name
	var arity: Variant = _METHOD_ARITY_CACHE.get(arity_key)
	if arity == null:
		arity = []
		for method in value.get_method_list():
			if String(method["name"]) == method_name:
				arity = [method["args"].size() - method["default_args"].size(), method["args"].size()]
				break
		_METHOD_ARITY_CACHE[arity_key] = arity
	return arity.size() == 2 and argument_count >= arity[0] and argument_count <= arity[1]

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _integer(value: Variant) -> bool:
	return _number(value) and float(value) == floor(float(value))

func _fail(error: String) -> bool:
	_last_error = error
	return false

static func _result(ready: bool, accepted: bool, reaction: int = PRODUCER.Reaction.NONE) -> Dictionary:
	return {"ready": ready, "accepted": accepted, "reaction": reaction,
		"reduced": null, "parry": null, "missing": {}}

func _command_failure(error: String) -> Dictionary:
	_command_rejections += 1
	_last_error = error
	var result = _result(is_native_qe_ready(), false)
	result["error"] = error
	return result

func _contact_failure(error: String) -> Dictionary:
	_contact_rejections += 1
	_last_error = error
	var result = _result(false, false)
	result["error"] = error
	return result

func get_snapshot() -> Dictionary:
	var ring: Dictionary = {}
	if _active_burst != null:
		ring = {"x": _active_burst.x, "y": _active_burst.y, "r": _active_burst.r,
			"max_r": _active_burst.max_r, "spd": _active_burst.spd,
			"det": _active_burst.det, "peace": _active_burst.peace,
			"release": _active_burst.release, "alive": _active_burst.alive}
	return {"configured": _configured, "ready": is_native_qe_ready(),
		"error": _last_error, "sb_parry_t": sb_parry_t, "parry_t": parry_t,
		"shield_cd": shield_cd, "sbash_st2": sbash_st2, "parry_bank": parry_bank,
		"sbash_chg_mul": sbash_chg_mul, "q_magic_mode": _q_magic_mode,
		"burst": ring, "last_contact_result": _last_contact_result.duplicate(true),
		"last_native_frame": _last_frame, "last_native_epoch": _last_epoch,
		"clock_calls": _clock_calls, "clock_rejections": _clock_rejections,
		"command_rejections": _command_rejections, "contact_rejections": _contact_rejections,
		"automatic_input": false, "automatic_physics": false,
		"blackbean_reflection_ready": false,
		"peace_shield_ready": false,
		"e_movement_and_completion_ready": false, "source_stats_defaults_authoritative": false,
		"full_source_phase_order_ready": false,
		"hp_kb_stun_commit_owner": "ENGINE actual Player pipeline"}

# Narrow E state consumer; full QE services and projectile parries remain separate.
var _e_owned := false
var _e_press_frame := -999.0
var _e_last_frame := -1.0
var _e_finish_frame := -1.0
var _e_hit_pending := false
var _e_speed_scale := 1.0
var _e_fixed_move_speed := -1.0
var _e_lunge_velocity := Vector2.ZERO
var _e_clock_calls := 0
var _e_last_error := ""
var _e_last_hit: Dictionary = {}

var _e_ready_source: Dictionary = {}
func is_native_e_control_ready() -> bool:
	if not _q_control_configured or not _live(_player) or not _live(_world) or not _live(_q_control_owner) or _player.get_parent()!=_q_control_owner or _world.player!=_player:return false
	var source: Dictionary = _q_control_owner.read_native_e_control_source()
	_e_ready_source=source
	if source.get("ready")!=true:
		_e_last_error=str(source.get("reason"))
		return false
	return true

func queue_e_control_press() -> Dictionary:
	if not is_native_e_control_ready() or _world.get_tree().paused or _player.hp<=0.0:return {"accepted":false,"reason":_e_last_error if not _e_last_error.is_empty() else "actual_e_owner_not_ready"}
	_e_press_frame=_world.get_native_frame()
	return {"accepted":true,"scope":"E_CONTROL_PARTIAL","deferred_to_native_physics":true}

func _withdraw_e_control() -> void:
	_e_wave_pending=false
	if _e_owned and _live(_player) and state in ["sDraw","kiGather","sBash","sRecover"]:state="idle"
	_e_owned=false
	_e_press_frame=-999.0
	_e_hit_pending=false
	_e_speed_scale=1.0
	_e_fixed_move_speed=-1.0
	_e_lunge_velocity=Vector2.ZERO

var _e_wave_pending := false

func _start_native_e_bash(charged: bool, multiplier: float, source: Dictionary) -> bool:
	var fields: Dictionary = {"st2":20.0,"_sBashChgMul":clampf(multiplier,1.0,3.0),"_kgChg":0.0,"_kgTier":0.0}
	if not charged:
		var cost: Dictionary = _q_control_owner.spend_native_e_stamina(source.shield_cost)
		if cost.get("accepted")!=true:
			state="idle"
			_e_owned=false
			_e_last_error=str(cost.get("reason"))
			return false
		fields._atkBon=_q_control_owner.current_source_parry_int(float(cost.spent)*1.5)
	if not _q_control_owner.commit_native_q_control_state(fields):_withdraw_e_control();return false
	state="sBash"
	_e_owned=true
	if charged and source.character_index==1 and multiplier>1.0:_player.iframes=maxf(_player.iframes,8.0)
	_e_wave_pending=true
	_player.telemetry_event.emit("e_sbash_started",{"charged":charged,"multiplier":multiplier,"stamina":_player.stamina,"st2":20.0,"source_auto_wave_adopted":true,"projectile_parry_adopted":false})
	return true

func advance_e_control(ticks: float, frame: float, ens: Array) -> bool:
	if not is_native_e_control_ready():
		_withdraw_e_control()
		return false
	var ctx: Dictionary = _world.get_native_projectile_fx_context()
	if _world.get_tree().paused or not is_finite(ticks) or ticks<=0.0 or frame<=_e_last_frame or not is_equal_approx(frame,_world.get_native_frame()) or not is_equal_approx(ticks,ctx.dt_sp) or not is_same(ens,_world.get_native_world_identity()):return false
	_e_last_frame=frame
	_e_clock_calls+=1
	_e_speed_scale=1.0
	_e_fixed_move_speed=-1.0
	_e_lunge_velocity=Vector2.ZERO
	_e_hit_pending=false
	# PC-SPAWN-PARITY 저프레임: 바로 위 is_native_e_control_ready()가 같은 틱·같은 상태에서 읽은
	# 원천을 그대로 쓴다(사이에 쓰기 없음 — 같은 값을 두 번 계산하던 것만 줄임).
	var source: Dictionary = _e_ready_source
	var f: Dictionary = source.fields
	if _e_owned and state not in ["sDraw","kiGather","sBash","sRecover"]:_e_owned=false
	if state=="idle" and frame-_e_press_frame<=3.0 and not source.q_held:
		_e_press_frame=-999.0
		_e_owned=true
		state="sDraw"
		if not _q_control_owner.commit_native_q_control_state({"_sdHold":0.0}):_withdraw_e_control();return false
		_player.telemetry_event.emit("e_draw_started",{"frame":frame,"stamina":_player.stamina})
		return true
	if not _e_owned:return true
	if state=="sDraw":
		var hold: float = float(f._sdHold)+ticks
		if not _q_control_owner.commit_native_q_control_state({"_sdHold":hold}):_withdraw_e_control();return false
		if hold>10.0:
			_e_speed_scale=0.0
			var cost: Dictionary = _q_control_owner.spend_native_e_stamina(source.shield_cost)
			if cost.get("accepted")!=true:state="idle";_e_owned=false;return false
			state="kiGather"
			_q_control_owner.commit_native_q_control_state({"_kgChg":hold*2.0,"_kgTier":0.0})
			_player.telemetry_event.emit("e_charge_started",{"cost":cost.spent,"stamina":_player.stamina,"charge":hold*2.0})
		elif not source.held:
			_e_speed_scale=0.0
			_start_native_e_bash(false,1.0,source)
		else:_e_speed_scale=0.5
	elif state=="kiGather":
		_e_speed_scale=0.18
		var charge: float = float(f._kgChg)+ticks*2.0
		var tier: int = 3 if charge>=180.0 else (2 if charge>=120.0 else (1 if charge>=60.0 else 0))
		if not _q_control_owner.commit_native_q_control_state({"_kgChg":charge,"_kgTier":float(tier)}):_withdraw_e_control();return false
		if charge>=186.0:_start_native_e_bash(true,3.0,source)
		elif not source.held:
			if charge>=18.0:
				var seconds: float = minf(3.0,charge/60.0)
				_start_native_e_bash(true,minf(3.0,1.0+0.5*minf(seconds,2.0)+maxf(0.0,seconds-2.0)),source)
			else:state="idle";_e_owned=false;_q_control_owner.commit_native_q_control_state({"_kgChg":0.0,"_kgTier":0.0})
	elif state in ["sBash","sRecover"]:
		_e_fixed_move_speed=source.attack_move_speed
		var remaining: float = float(f.st2)-ticks
		if not _q_control_owner.commit_native_q_control_state({"st2":remaining}):_withdraw_e_control();return false
		if state=="sBash":
			var mult: float = clampf(float(f._sBashChgMul),1.0,3.0)
			if source.character_index==1 and mult>1.0:_e_lunge_velocity=_player.facing*((150.0+175.0*(mult-1.0))/20.0)*60.0
			_e_hit_pending=remaining<=12.0 and remaining+ticks>12.0
	return true

func get_native_e_movement(move_input: Vector2, base_speed: float) -> Dictionary:
	return {"owned":_e_owned,"velocity":move_input*(_e_fixed_move_speed if _e_fixed_move_speed>=0.0 else base_speed*_e_speed_scale)+_e_lunge_velocity,"scale":_e_speed_scale,"lunge_velocity":_e_lunge_velocity}

func finish_e_control(frame: float) -> void:
	# One actual World phase after movement, including idle/cooldown frames.
	if frame==_e_last_frame:
		_q_control_owner.advance_native_e_wave(frame,_e_wave_pending)
		_e_wave_pending=false
	if not _e_owned or frame!=_e_last_frame or frame<=_e_finish_frame:return
	_e_finish_frame=frame
	if not is_native_e_control_ready():_withdraw_e_control();return
	var source: Dictionary = _q_control_owner.read_native_e_control_source()
	var f: Dictionary = source.fields
	if state=="sBash":
		if _e_hit_pending:
			_e_hit_pending=false
			_e_last_hit=_q_control_owner.apply_native_e_slam()
		if float(f.st2)<=0.0:
			state="sRecover"
			_q_control_owner.commit_native_q_control_state({"st2":float(source.recovery)})
	elif state=="sRecover" and float(f.st2)<=0.0:
		_q_control_owner.commit_native_q_control_state({"_stWingT":0.0,"_sBashChgMul":1.0})
		state="sDraw" if source.held else "idle"
		if source.held:_q_control_owner.commit_native_q_control_state({"_sdHold":0.0})
		else:_e_owned=false
		_player.telemetry_event.emit("e_control_completed",{"state":state,"stamina":_player.stamina})

func get_e_control_snapshot() -> Dictionary:
	var ready: bool = is_native_e_control_ready()
	var source: Dictionary = _q_control_owner.read_native_e_control_source() if ready else {}
	return {"ready":ready,"scope":"E_CONTROL_PARTIAL","reason":"" if ready else _e_last_error,"owned":_e_owned,"state":state if _live(_player) else null,"fields":source.get("fields"),"cost":source.get("shield_cost"),"recovery":source.get("recovery"),"clock_calls":_e_clock_calls,"lunge_velocity":_e_lunge_velocity,"last_hit":_e_last_hit.duplicate(true),"full_e_parity":false,"projectile_parry_adopted":false,"auto_wave_adopted":true,"wave":_q_control_owner.get_native_e_wave_snapshot() if ready else {}}
