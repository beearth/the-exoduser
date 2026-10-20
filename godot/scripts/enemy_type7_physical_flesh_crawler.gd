class_name ExoduserType7PhysicalFleshCrawler
extends ExoduserFleshCrawler

# Reuse only the physical hurt/shield/poise, collider and original col6 body
# consumers. Neither the type0 AI nor its autonomous physics is invoked.
# World supplies the actual source global AI phase and warning phase.
const EliteOrder = preload("res://port_modules/elite_owner_attack_order/producer.gd")

var native_state: Dictionary = {}
var modifier_state: Dictionary = {}
var _elite_owner_context: Dictionary = {}
var _teleport_helper: Node
var _m30_helper: Node
var _summon_completion: Callable
var _common_shot_emitter: Callable
var _random_u: Callable
var _parts_emitter: Callable
var _channel_particle_emitter: Callable
var _physical_element_color = ""
var _effects_bound = false
var _configured = false
var _configuration_error = "not_configured"
var _dependencies_bound = false
var _source_fsm_ready = false
var _configured_global_spawn = Vector2.ZERO
var _native_phase_calls = 0
var _warning_phase_calls = 0
var _last_phase: Dictionary = {}
var _last_summon: Dictionary = {}
var _native_dependency_fault = ""
var _last_flow_direction = Vector2.ZERO
var _stuck_ticks = 0.0

func configure(value: Dictionary, owner_world: Node2D) -> void:
	if str(value.get("id", "")) != "ch1_initial_004" or value.get("order", -1) != 3 or value.get("etype", -1) != 7:
		_configuration_error = "unsupported_type7_record_identity"
		return
	if str(value.get("element", "")) != "physical" or value.get("elite", -1) != 1 or value.get("mods") != ["M30"]:
		_configuration_error = "unsupported_type7_element_elite_or_mods"
		return
	var source: Dictionary = value.get("native_final", {})
	for key in ["teleportT", "teleportCd", "summonT", "summonCd", "_tpWarnT", "_tpWarnMax", "_tpWarnX", "_tpWarnY"]:
		if not source.has(key) or not (source[key] is int or source[key] is float) or not is_finite(float(source[key])):
			_configuration_error = "missing_finite_type7_source_" + key
			return
	if not source.get("modT") is Dictionary or not source.has("_tpWarnCol"):
		_configuration_error = "missing_source_modifier_or_warning_state"
		return
	super.configure(value, owner_world)
	_configured_global_spawn = spawn_position
	native_state = {}
	for key in ["teleportT", "teleportCd", "summonT", "summonCd", "_tpWarnT", "_tpWarnMax", "_tpWarnX", "_tpWarnY", "_tpWarnCol"]:
		native_state[key] = source[key]
	modifier_state = source["modT"].duplicate(true)
	native_state["modT"] = modifier_state
	_elite_owner_context = {"mods":mods,"modT":modifier_state}
	native_state["_frozen"] = float(source.get("_frozen", 0.0))
	for key in ["_maxStunned", "_stunImmune", "_pImmune", "_frozenImmune", "_freezeGauge", "_webSlow", "_iceResDown", "_iceShardRes", "_weakT", "_shockDRT", "_projChargeT"]:
		native_state[key] = float(source.get(key, 0.0))
	for key in ["_projChargeCol", "_projChargeBean", "_projChargeParryClass"]:
		native_state[key] = source.get(key)
	native_state["_lastFdx"] = float(source.get("_lastFdx", 0.0))
	native_state["_lastFdy"] = float(source.get("_lastFdy", 0.0))
	_last_flow_direction = Vector2(native_state["_lastFdx"], native_state["_lastFdy"])
	_stuck_ticks = float(source.get("_stuckT", 0.0))
	_configuration_error = ""
	_configured = true

func _ready() -> void:
	set_physics_process(false)
	if not _configured:
		return
	global_position = _configured_global_spawn
	super._ready()
	set_physics_process(false)

func _physics_process(_delta: float) -> void:
	# Deliberately no super call. Only the real world phase consumes this AI.
	pass

func _process(_delta: float) -> void:
	# M30 exposes a caller-driven read-only warning render phase. TP already
	# owns its world-sibling render process, so never age TP here a second time.
	if _dependencies_bound and is_instance_valid(_m30_helper):
		_m30_helper.render_native(float(Time.get_ticks_msec()))

func bind_native_dependencies(teleport_helper: Node, m30_helper: Node, summon_completion: Callable, common_shot_emitter: Callable) -> bool:
	if not _configured or not is_instance_valid(teleport_helper) or not is_instance_valid(m30_helper):
		return false
	if not teleport_helper.has_method("advance_idle") or not teleport_helper.has_method("advance_shot_warnings") or not m30_helper.has_method("advance_native") or not m30_helper.has_method("render_native") or not m30_helper.has_method("advance_owner_managed") or not m30_helper.has_method("is_owner_ready") or not m30_helper.has_method("owns_modifier_state"):
		return false
	for helper in [teleport_helper, m30_helper]:
		if not helper.has_method("get_snapshot"):
			return false
		var readiness: Variant = helper.get_snapshot()
		if not readiness is Dictionary or readiness.get("configured", false) != true:
			return false
	if not summon_completion.is_valid() or not common_shot_emitter.is_valid():
		return false
	_teleport_helper = teleport_helper
	_m30_helper = m30_helper
	_summon_completion = summon_completion
	_common_shot_emitter = common_shot_emitter
	for helper in [teleport_helper, m30_helper]:
		if helper.has_signal("telemetry_event") and not helper.is_connected("telemetry_event", _forward_event):
			helper.connect("telemetry_event", _forward_event)
	_dependencies_bound = true
	_source_fsm_ready = _configured and _dependencies_bound and _effects_bound
	return true

func bind_native_effects(random_u: Callable, parts_emitter: Callable, channel_particle_emitter: Callable, physical_element_color: String) -> bool:
	if not _configured or not random_u.is_valid() or not parts_emitter.is_valid() or not channel_particle_emitter.is_valid() or physical_element_color != "#bbbbbb":
		return false
	_random_u = random_u
	_parts_emitter = parts_emitter
	_channel_particle_emitter = channel_particle_emitter
	_physical_element_color = physical_element_color
	_effects_bound = true
	_source_fsm_ready = _configured and _dependencies_bound and _effects_bound
	return true

func advance_native(ticks: float, global_frame: float, world_token: Variant) -> Dictionary:
	if not _source_fsm_ready or not _dependencies_bound or not _effects_bound:
		return {"consumed": false, "boundary": "missing_actual_type7_dependencies_or_source_FX_services"}
	if not is_finite(ticks) or ticks <= 0.0 or not is_finite(global_frame) or global_frame < 0.0 or world_token == null:
		return {"consumed": false, "boundary": "missing_actual_native_phase_context"}
	if not _native_dependency_fault.is_empty():
		return {"consumed": false, "boundary": _native_dependency_fault}
	if not alive:
		return {"consumed": false, "boundary": "owner_dead"}
	if not is_instance_valid(player) or not is_instance_valid(world):
		return {"consumed": false, "boundary": "missing_actual_player_or_world"}
	_native_phase_calls += 1
	native_frame = global_frame
	var before = global_position
	_outer_native_timers(ticks)
	if _knockback.length_squared() > 0.02:
		_move_type7_direct(_knockback, ticks, 1.0 / float(data["speed_pixels_per_tick"]))
		_knockback *= pow(0.85, ticks)
	# Source guards occur after the outer loop has decreased hit/stun timers.
	if _hit_stun > 0.0:
		return _finish_native_phase(before, ticks, "hit_stun")
	if _stun_ticks > 0.0:
		_cancel_common_charge("stunned")
		_stun_ticks = minf(_stun_ticks, 180.0)
		native_state["_maxStunned"] = maxf(float(native_state["_maxStunned"]), _stun_ticks)
		return _finish_native_phase(before, ticks, "stunned")
	if float(native_state["_frozen"]) > 0.0:
		_cancel_common_charge("frozen")
		native_state["_frozen"] = float(native_state["_frozen"]) - ticks
		if float(native_state["_frozen"]) <= 0.0:
			native_state["_frozen"] = 0.0
			native_state["_freezeGauge"] = 0.0
			native_state["_frozenImmune"] = 120.0
		return _finish_native_phase(before, ticks, "frozen")
	_ordinary_native_timers(ticks)
	var distance = global_position.distance_to(player.global_position)
	if state in ["idle", "recover"] and distance < 800.0 and world.has_line_of_sight(global_position, player.global_position):
		if not alerted:
			telemetry_event.emit("enemy_aggro", {"id": data["id"], "distance": distance})
		alerted = true
	if alerted and distance < 800.0:
		facing = (player.global_position - global_position).angle()
	if alerted and state in ["idle", "recover"]:
		if distance > 680.0:
			_move_type7_flow(ticks)
		elif distance < 520.0 and distance > 30.0:
			# This source range retreat uses center-point isW, not canMv(r).
			var retreat = global_position - Vector2.from_angle(facing) * float(data["speed_pixels_per_tick"]) * ticks * 0.5
			if not world.is_world_blocked(retreat):
				global_position = retreat
		distance = global_position.distance_to(player.global_position)
	# EL-01: same admitted owner lock path as type3, M30 helper never ticks twice.
	_elite_owner_context["mods"] = mods
	var elite_phase: Dictionary = EliteOrder.advance(_elite_owner_context,ticks,distance,{},null,_m30_helper)
	if elite_phase.status != "READY":
		_native_dependency_fault = "elite_owner_NOT_READY:" + str(elite_phase.get("reason"))
		return _finish_native_phase(before, ticks, "elite_dependency_fault")
	_tick_common_charge(ticks)
	if not _native_dependency_fault.is_empty():
		return _finish_native_phase(before, ticks, "common_packet_dependency_fault")
	if not alerted and distance > 400.0:
		return _finish_native_phase(before, ticks, "far_unalerted")
	# Global st2 consumption precedes TP/summon. New eSummon40 remains40.
	_contact_ticks -= ticks
	var flow: Vector2 = world.get_path_direction(global_position)
	native_state["_moveAng"] = flow.angle() if not flow.is_zero_approx() else (player.global_position - global_position).angle()
	var idle_result: Dictionary = {}
	if state == "idle":
		idle_result = _advance_type7_idle_owned(ticks, distance, global_frame, world_token)
	# Dispatch uses the live state: a summon started above enters this case now.
	if state == "idle":
		if distance < 80.0:
			_move_type7_direct(-Vector2.from_angle(facing), ticks, 0.6)
		elif distance > 200.0:
			_move_type7_direct(Vector2.from_angle(facing), ticks, 1.2)
		_apply_separation(ticks)
		_arm_common_charge(ticks, distance)
	elif state == "eSummon":
		_emit_channel_particle()
		if _native_dependency_fault.is_empty() and _contact_ticks <= 0.0:
			_complete_native_summon()
	elif state == "recover" and _contact_ticks <= 0.0:
		var recovery_sample = _sample_u()
		if _native_dependency_fault.is_empty():
			state = "idle"
			_contact_ticks = 15.0 + recovery_sample * 15.0
	var result = _finish_native_phase(before, ticks, "dispatched")
	result["idle_result"] = idle_result.duplicate(true)
	_last_phase = result.duplicate(true)
	return result

func _outer_native_timers(ticks: float) -> void:
	if _spawn_ticks > 0.0:
		_spawn_ticks -= 1.0
	if _stun_ticks > 0.0:
		_stun_ticks -= ticks
	if _hit_stun > 0.0:
		_hit_stun -= ticks
	_hit_flash = maxf(0.0, _hit_flash - ticks)
	for key in ["_stunImmune", "_pImmune"]:
		if float(native_state[key]) > 0.0:
			native_state[key] = float(native_state[key]) - ticks
	if _stun_ticks <= 0.0 and float(native_state["_maxStunned"]) > 0.0:
		# Source ordinary enemies do not get the boss-only poise reset here.
		native_state["_maxStunned"] = 0.0

func _ordinary_native_timers(ticks: float) -> void:
	for key in ["_webSlow", "_frozenImmune", "_iceResDown"]:
		if float(native_state[key]) > 0.0:
			native_state[key] = float(native_state[key]) - ticks
	if float(native_state["_iceShardRes"]) > 0.0:
		native_state["_iceShardRes"] = maxf(0.0, float(native_state["_iceShardRes"]) - 0.002 * ticks)
	if float(native_state["_weakT"]) > 0.0:
		native_state["_weakT"] = float(native_state["_weakT"]) - ticks
		if float(native_state["_weakT"]) <= 0.0:
			for key in ["_weakPhys", "_weakMag", "_weakPj"]:
				native_state[key] = 0.0
	if float(native_state["_shockDRT"]) > 0.0:
		native_state["_shockDRT"] = float(native_state["_shockDRT"]) - ticks
		if float(native_state["_shockDRT"]) <= 0.0:
			native_state["_shockDR"] = 0.0
	native_state["_freezeGauge"] = maxf(0.0, float(native_state["_freezeGauge"]) - ticks * 0.3)
	if poise < max_poise:
		_poise_regen += ticks
		if _poise_regen >= 200.0:
			poise = minf(max_poise, poise + floorf(max_poise * 0.15))
			_poise_regen = 0.0

func _sample_u() -> float:
	var sample: Variant = _random_u.call()
	if not (sample is int or sample is float) or not is_finite(float(sample)) or float(sample) < 0.0 or float(sample) >= 1.0:
		_native_dependency_fault = "invalid_actual_shared_U_sample"
		return NAN
	return float(sample)

func _emit_channel_particle() -> void:
	if _sample_u() <= 0.5 or not _native_dependency_fault.is_empty():
		return
	var raw = {"x": global_position.x + (_sample_u() - 0.5) * 20.0, "y": global_position.y + (_sample_u() - 0.5) * 20.0, "vx": 0.0, "vy": -1.5, "col": "#8833cc", "sz": 2.0 + _sample_u() * 2.0, "life": 12.0}
	if not _native_dependency_fault.is_empty():
		return
	if _channel_particle_emitter.call(raw) != true:
		_native_dependency_fault = "actual_channel_poolPart_consumer_rejected"

func _tick_common_charge(ticks: float) -> void:
	if float(native_state["_projChargeT"]) <= 0.0:
		return
	native_state["_projChargeT"] = float(native_state["_projChargeT"]) - ticks
	if float(native_state["_projChargeT"]) > 0.0:
		return
	facing = (player.global_position - global_position).angle()
	var direction = Vector2.from_angle(facing)
	# Raw spawnProj normal branch only. Actual shared normalization supplies
	# redBean/homing/size/r/damage/speed; no flags or scaling are invented here.
	var packet = {"x": global_position.x, "y": global_position.y, "vx": direction.x * 3.0, "vy": direction.y * 3.0, "dmg": int(attack * 0.8), "el": 0, "friendly": false, "life": 240.0, "ml": 240.0, "col": _physical_element_color, "sz": 1.5, "_commit": true}
	if _common_shot_emitter.call(self, packet) != true:
		_native_dependency_fault = "actual_common_packet_consumer_rejected"
		return
	_parts_emitter.call(global_position, str(data["native_final"]["col"]), 2)
	telemetry_event.emit("type7_common_packet_requested", packet.duplicate(true))
	_cancel_common_charge("fired")

func _cancel_common_charge(reason: String) -> void:
	var had_charge = float(native_state["_projChargeT"]) > 0.0
	native_state["_projChargeT"] = 0.0
	for key in ["_projChargeCol", "_projChargeBean", "_projChargeParryClass"]:
		native_state[key] = null
	if had_charge:
		telemetry_event.emit("enemy_charge_cancel", {"id": data["id"], "reason": reason})

func _arm_common_charge(ticks: float, cached_distance: float) -> void:
	if float(data["projectile_cooldown_ticks"]) >= 9000.0 or float(native_state["_projChargeT"]) > 0.0:
		return
	_projectile_ticks -= ticks
	if _projectile_ticks <= 0.0 and cached_distance < 800.0:
		_projectile_ticks = float(data["projectile_cooldown_ticks"])
		native_state["_projChargeBean"] = "normal"
		native_state["_projChargeCol"] = _physical_element_color
		native_state["_projChargeParryClass"] = "physical"
		native_state["_projChargeT"] = 60.0
		telemetry_event.emit("enemy_charge", {"id": data["id"], "ticks": 60.0, "position": [global_position.x, global_position.y], "bean": "normal", "parry_class": "physical"})

func _finish_native_phase(before: Vector2, ticks: float, phase: String) -> Dictionary:
	_finish_motion(before, ticks)
	native_state["s"] = state
	native_state["st2"] = _contact_ticks
	native_state["projT"] = _projectile_ticks
	native_state["poiseR"] = _poise_regen
	var result = {"consumed": true, "phase": phase, "global_frame": native_frame, "state": state, "st2": _contact_ticks, "native_dependency_fault": _native_dependency_fault}
	_last_phase = result.duplicate(true)
	return result

func advance_projectile_warnings(ticks: float, global_frame: float, world_token: Variant) -> void:
	if _dependencies_bound and is_instance_valid(_teleport_helper):
		_warning_phase_calls += 1
		_teleport_helper.advance_shot_warnings(ticks, global_frame, world_token)

func _advance_type7_idle_owned(ticks: float, distance_to_player: float, global_frame: float, world_token: Variant) -> Dictionary:
	# This exact source block runs after the owner's guards/range movement.
	# The already-bound TP consumer shares this owner's actual source state.
	var result: Dictionary = _teleport_helper.advance_idle(ticks, distance_to_player, global_frame, world_token)
	if bool(result.get("teleported", false)):
		reset_physics_interpolation()
	if bool(result.get("summon_due", false)):
		var nearby = 0
		for other in world.get_enemies():
			# Original inner count does not introduce an alive filter.
			if other != self and is_instance_valid(other) and global_position.distance_to(other.global_position) < 200.0:
				nearby += 1
		result["nearby_count"] = nearby
		if nearby < 4:
			state = "eSummon"
			_contact_ticks = 40.0
			telemetry_event.emit("type7_summon_started", {"id": data["id"], "nearby_count": nearby, "channel_ticks": 40.0})
		else:
			native_state["summonT"] = 60.0
	return result

func _move_type7_flow(ticks: float, speed_multiplier: float = 1.0) -> void:
	var direction: Vector2 = world.get_path_direction(global_position)
	if not direction.is_zero_approx():
		_last_flow_direction = direction
	else:
		direction = _last_flow_direction
		if direction.is_zero_approx():
			direction = Vector2.from_angle((player.global_position - global_position).angle())
	var speed = float(data["speed_pixels_per_tick"]) * ticks * speed_multiplier
	var displacement = direction * speed
	var destination = global_position + displacement
	if world.can_move(destination, radius):
		global_position = destination
		_stuck_ticks = 0.0
	elif world.can_move(global_position + Vector2(displacement.x, 0.0), radius):
		global_position.x += displacement.x
		_last_flow_direction = Vector2(direction.x, 0.0)
		_stuck_ticks = 0.0
	elif world.can_move(global_position + Vector2(0.0, displacement.y), radius):
		global_position.y += displacement.y
		_last_flow_direction = Vector2(0.0, direction.y)
		_stuck_ticks = 0.0
	else:
		_stuck_ticks += ticks
	native_state["_lastFdx"] = _last_flow_direction.x
	native_state["_lastFdy"] = _last_flow_direction.y
	native_state["_stuckT"] = _stuck_ticks

func _complete_native_summon() -> bool:
	# Called after the original channel's own particles and timer dispatch.
	# This is the actual parent's recipe/consumer callback, not a test hook.
	var result: Variant = _summon_completion.call(self)
	if not result is Dictionary:
		_native_dependency_fault = "invalid_type3_completion_result"
		return false
	var requested: Variant = result.get("requested_count")
	var consumed: Variant = result.get("consumed_count")
	var recipes: Variant = result.get("recipes")
	var counts_valid = (requested is int or requested is float) and (consumed is int or consumed is float)
	if counts_valid:
		counts_valid = is_finite(float(requested)) and is_finite(float(consumed)) and floorf(float(requested)) == float(requested) and float(requested) >= 1.0 and float(requested) <= 2.0 and float(consumed) == float(requested)
	var recipes_valid = recipes is Array and counts_valid and recipes.size() == int(requested)
	_last_summon = {"valid": result.get("valid", false), "error": result.get("error", ""), "requested_count": requested, "consumed_count": consumed, "recipe_count": recipes.size() if recipes is Array else 0, "parent_recovery_ticks": result.get("parent_recovery_ticks"), "full_type7_actor_registered": false}
	if result.get("valid", false) != true or not recipes_valid or result.get("parent_recovery_ticks") != 50:
		_native_dependency_fault = str(result.get("error", "invalid_type3_completion_contract"))
		if _native_dependency_fault.is_empty():
			_native_dependency_fault = "invalid_type3_completion_contract"
		telemetry_event.emit("type7_native_dependency_fault", _last_summon.duplicate(true))
		return false
	native_state["summonT"] = float(native_state["summonCd"])
	state = "recover"
	_contact_ticks = 50.0
	telemetry_event.emit("type7_summon_completed", _last_summon.duplicate(true))
	return true

func _move_type7_direct(direction: Vector2, ticks: float, multiplier: float) -> void:
	var destination = global_position + direction * float(data["speed_pixels_per_tick"]) * ticks * multiplier
	if world.can_move(destination, radius):
		global_position = destination

func get_snapshot() -> Dictionary:
	if not _configured:
		return {"configured": false, "configuration_error": _configuration_error, "source_owner_dispatch_ready": false, "autonomous_AI_physics": false, "type0_AI_called": false}
	var snapshot = super.get_snapshot()
	snapshot["configured"] = _configured
	snapshot["configuration_error"] = _configuration_error
	snapshot["native_dependencies_bound"] = _dependencies_bound
	snapshot["native_effects_bound"] = _effects_bound
	snapshot["source_owner_dispatch_ready"] = _source_fsm_ready
	snapshot["native_state"] = native_state.duplicate(true)
	snapshot["modifier_state"] = modifier_state.duplicate(true)
	snapshot["frozen_ticks"] = float(native_state.get("_frozen", 0.0))
	snapshot["charge_ticks"] = float(native_state.get("_projChargeT", 0.0))
	snapshot["position"] = [global_position.x, global_position.y]
	snapshot["local_position"] = [position.x, position.y]
	snapshot["native_phase_calls"] = _native_phase_calls
	snapshot["warning_phase_calls"] = _warning_phase_calls
	snapshot["last_phase"] = _last_phase.duplicate(true)
	snapshot["last_summon"] = _last_summon.duplicate(true)
	snapshot["native_dependency_fault"] = _native_dependency_fault
	snapshot["autonomous_AI_physics"] = false
	snapshot["type0_AI_called"] = false
	snapshot["natural_contact_attack"] = false
	snapshot["normal_revive_fullpipeline_ported"] = false
	snapshot["full_native_enemy_system"] = false
	snapshot["source_flow_8direction_escape_ported"] = false
	snapshot["M30_render_now_provider"] = "Godot Time.get_ticks_msec; source packet fixes literal now formulas but does not establish its actual caller domain"
	snapshot["M30_source_now_domain_equivalence_proven"] = false
	return snapshot

func get_common_charge_snapshot() -> Dictionary:
	# The parent's original common-charge cue reads this detached leaf instead
	# of copying all owner/source metadata every rendered frame.
	return {"ticks": float(native_state.get("_projChargeT", 0.0)), "duration_ticks": 60.0, "color": native_state.get("_projChargeCol"), "bean": native_state.get("_projChargeBean"), "parry_class": native_state.get("_projChargeParryClass"), "position": [global_position.x, global_position.y], "radius": radius, "alive": alive, "source_Q_E_parry_ported": false}
