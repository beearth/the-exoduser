extends Node2D
## DEMO11-34: source stage0 AI assembler. No damage/parry/HP/poise writer.
## Production entry requires an actual arena caller, source clock and prefix owner.
const SPAWN = preload("res://scripts/native_ch1_boss_spawn_contract.gd")
const PHASE = preload("res://scripts/native_ch1_boss_phase.gd")
const SELECTOR = preload("res://scripts/native_ch1_boss_selector.gd")
const START = preload("res://scripts/native_ch1_boss_pattern_start.gd")
const MELEE = preload("res://scripts/native_ch1_boss_melee_states.gd")
const MOVEMENT = preload("res://scripts/native_ch1_boss_movement_states.gd")
const PROJECTILES = preload("res://scripts/native_ch1_boss_projectile_patterns.gd")
const CONTROL = preload("res://scripts/native_ch1_boss_control_states.gd")
const MISC = preload("res://scripts/native_ch1_boss_misc_states.gd") # PC-BOSS-CORE 최소 훅: BC07~10 밖 1장 상태(shock/summon/spin/mine/poisonDash)
signal owner_request(request: Dictionary)
var _main: Node
const CLAIM := "demo11_boss_actor_owner"
var _world: Node
var _enemy: Dictionary = {}
var _frame: Dictionary = {}
var _owners: Dictionary = {}
var _pending: Dictionary = {}
var _ordinal := 0
var _serial := -1
var _tick_count := 0
var _rng_count := 0
var _stage := "dormant"
var _module := ""
var _token: Dictionary = {}
var _after_module := ""
var _packet_queue: Array = []
var _busy := false
var _pumping := false
var _error := ""
var _last_ack := 0
var _distance := 0.0
var _selection: Dictionary = {}
var _phase_packet: Dictionary = {}
var _last_clock_reason := "not_spawned"

static func install_native_boot(main: Node) -> Node2D:
	var world: Node = main.get("world")
	if not is_instance_valid(world): return null
	var actor := new()
	actor.name = "Demo11BossActor"
	world.add_child(actor)
	if not actor.configure(main,world):
		actor.free()
		return null
	return actor

func configure(main: Node, world: Node) -> bool:
	if is_instance_valid(_main) or not is_instance_valid(main) or not is_instance_valid(world) or world.get_parent() != main or get_parent() != world:
		return false
	if not main.has_method("read_native_demo_policy") or main.read_native_demo_policy().get("stage") != 0:
		return false
	var claim: Variant = world.get_meta(CLAIM) if world.has_meta(CLAIM) else null
	if claim is WeakRef and is_instance_valid(claim.get_ref()): return false
	world.set_meta(CLAIM,weakref(self))
	_main = main
	_world = world
	for command in ["canMv","safePt","_ffDir"]: _owners[command] = Callable(self,"_spatial_read")
	return true

func bind_owner(command: String, handler: Callable) -> bool:
	if command.is_empty() or not handler.is_valid() or _owners.has(command): return false
	_owners[command] = handler
	if not _busy and _pending.get("command") == command: _drain()
	return true

func spawn(request: Dictionary) -> Dictionary:
	if not _live() or not _enemy.is_empty(): return {"status":"REJECTED","reason":"actor_unavailable_or_already_spawned"}
	if request.get("si") != 0: return {"status":"REJECTED","reason":"demo_stage_required"}
	var result := SPAWN.build_spawn_packet(request, _rng, _can_move, Callable(_world,"native_safe_point"))
	if result.get("status") != "READY": return result
	_enemy = result.fields.duplicate(true)
	position = Vector2(_enemy.x,_enemy.y)
	_stage = "idle"
	_last_clock_reason = "source_clock_not_published"
	return {"status":"READY","enemy":_enemy.duplicate(true),"rng_ledger":result.rng_ledger}

func is_source_frame_completed() -> bool:
	return _stage=="idle" and _pending.is_empty() and _error.is_empty()

func read_source_frame() -> Dictionary:
	return _frame.duplicate(true)

func snapshot() -> Dictionary:
	return {"status":"NOT_READY" if not _error.is_empty() else ("WAITING_OWNER" if not _pending.is_empty() else ("DORMANT" if _enemy.is_empty() else "READY")),
		"reason":_error,"enemy":_enemy.duplicate(true),"pending":_pending.duplicate(true),"stage":_stage,
		"last_serial":_serial,"ticks_completed":_tick_count,"rng_draws":_rng_count,"last_ack":_last_ack,
		"clock_reason":_last_clock_reason,"source_prefix_required":true,"full_combat_ready":false,"damage_parry_verified":false}

func _live() -> bool:
	return is_instance_valid(_main) and is_instance_valid(_world) and is_inside_tree() and not is_queued_for_deletion() \
		and get_parent() == _world and _world.get_parent() == _main and _main.get("world") == _world

func _rng(_tag: String) -> Variant:
	if not _live(): return null
	_rng_count += 1
	return _world.sample_native_random_unit() # Same World RNG as every external owner.

func _can_move(x: float,y: float,r: float) -> bool:
	return _world.can_move(Vector2(x,y),r)

func _spatial_read(request: Dictionary) -> Dictionary:
	var args: Array = request.args
	match request.command:
		"canMv": return {"ack":true,"value":_world.can_move(Vector2(args[0],args[1]),args[2])}
		"safePt": return {"ack":true,"value":_world.native_safe_point(args[0],args[1],args[2])}
		"_ffDir":
			var direction: Vector2 = _world.get_path_direction(Vector2(args[0],args[1]))
			return {"ack":true,"value":null if direction == Vector2.ZERO else {"x":direction.x,"y":direction.y}}
	return {"ack":false}

func _physics_process(_delta: float) -> void:
	if not _live() or _enemy.is_empty() or _busy or not _pending.is_empty() or not _error.is_empty() or _stage != "idle": return
	var clock: Variant
	if _owners.has("source_tick") and _owners.source_tick.is_valid():
		clock = _owners.source_tick.call({"enemy":_enemy.duplicate(true)})
	else:
		clock = _world.read_native_source_player_projectile_context()
	if not clock is Dictionary or clock.get("ready") != true:
		_last_clock_reason = str(clock.get("reason","source_clock_not_published")) if clock is Dictionary else "source_clock_invalid"
		return
	begin_tick(clock)

## Input is the current source frame, not Godot delta. Prefix is acknowledged
## separately: ordinary updateE through 40443, INCLUDING one st2 decrement.
func begin_tick(frame: Dictionary) -> bool:
	if not _live() or _busy or not _pending.is_empty() or _stage != "idle" or _enemy.is_empty() or not _error.is_empty(): return false
	if frame.get("ready") != true or not frame.get("serial") is int or frame.serial <= _serial \
		or not _number(frame.get("sp")) or frame.sp < 0 or not _player(frame.get("player")) \
		or not frame.get("context") is Dictionary or not frame.get("globals") is Dictionary \
		or not frame.has("player_stats") or (frame.player_stats != null and not frame.player_stats is Dictionary): return false
	_frame = frame.duplicate(true)
	_serial = frame.serial
	_last_clock_reason = ""
	_stage = "prefix"
	_request({"command":"source_updateE_prefix","source_lines":[38584,40443]}, "prefix")
	return true

func _request(command: Dictionary, resume: String) -> void:
	_ordinal += 1
	_pending = command.duplicate(true)
	_pending.merge({"request_id":_ordinal,"resume":resume,"enemy":_enemy.duplicate(true),"player":_frame.get("player",{}).duplicate(true),"frame":_frame.duplicate(true)},true)
	owner_request.emit(_pending.duplicate(true))
	if not _busy: _drain()

func _serve_pending() -> void:
	if _pending.is_empty() or not _live(): return
	var name: String = _pending.command
	if not _owners.has(name) or not _owners[name].is_valid(): return
	var handler: Callable = _owners[name]
	var id: int = _pending.request_id
	_busy = true
	var response: Variant = handler.call(_pending.duplicate(true))
	_busy = false
	# null means asynchronous owner. No polling/replay of its side effect.
	if response is Dictionary: acknowledge(id,response,handler.get_object())

func acknowledge(id: int,response: Dictionary,owner: Object) -> bool:
	if not _live() or _busy or _pending.get("request_id") != id or response.get("ack") != true: return false
	var handler: Callable = _owners.get(_pending.command,Callable())
	if not handler.is_valid() or handler.get_object() != owner: return false
	var resume: String = _pending.resume
	if resume in ["prefix","phase_commit","finish"]:
		if not _complete_actor(response.get("enemy_after")) or not _player(response.get("player_after")): return false
		if resume == "prefix" and (response.get("through_source_line") != 40443 or not response.get("context_after") is Dictionary or not response.get("globals_after") is Dictionary or not _number(response.get("cached_distance")) or not _number(response.get("sp_after")) or not response.get("return_update") is bool): return false
	if _pending.command == "source_global_write" and not response.get("globals_after") is Dictionary: return false
	var packet: Dictionary = {}
	if resume == "module":
		_busy = true
		packet = _step_module(response)
		_busy = false
		if packet.get("status") != "READY":
			_error = "owner_readback_rejected:" + str(packet.get("reason"))
			return false
		# Phase effect packets carry player changes only inside their continuation;
		# preserve the actual PC readback for the following same-frame owner too.
		if response.get("player_after") is Dictionary: _frame.player = response.player_after.duplicate(true)
	if _pending.command == "source_global_write": _frame.globals = response.globals_after.duplicate(true)
	_pending = {}
	_last_ack = id
	match resume:
		"prefix":
			_enemy = response.enemy_after.duplicate(true)
			_frame.player = response.player_after.duplicate(true)
			_frame.context = response.context_after.duplicate(true)
			_frame.globals = response.globals_after.duplicate(true)
			_distance = response.cached_distance
			_frame.sp = response.sp_after
			_stage = "finish" if response.return_update else "phase"
		"phase_commit":
			_enemy = response.enemy_after.duplicate(true) # Readback, not an HP/poise commit.
			_frame.player = response.player_after.duplicate(true)
			_module = "phase_effects"
			_token_from(PHASE.begin_phase_effects(0,_enemy,_frame.player),"idle_move")
		"module": _accept_packet(packet)
		"event": _flush_packet_queue()
		"finish":
			_enemy = response.enemy_after.duplicate(true)
			_frame.player = response.player_after.duplicate(true)
			_stage = "finish"
	position = Vector2(_enemy.x,_enemy.y)
	_drain()
	return true

func _drain() -> void:
	if _pumping or _busy: return
	_pumping = true
	while _error.is_empty():
		if not _pending.is_empty():
			var id: int = _pending.request_id
			_serve_pending()
			if _pending.get("request_id") == id: break
		else:
			_advance()
			if _stage in ["idle","dormant"]: break
	_pumping = false

func _advance() -> void:
	if _busy or not _pending.is_empty() or not _error.is_empty(): return
	_busy = true
	while _pending.is_empty() and _error.is_empty():
		match _stage:
			"phase":
				_phase_packet = PHASE.clock_step(0,"dispatch_phase",_enemy,_frame.sp)
				if _phase_packet.get("status") != "READY": _fail(_phase_packet); break
				if _phase_packet.get("outcome") == "frozen_idle_return":
					_enemy = _phase_packet.enemy.duplicate(true)
					_stage = "finish"
				elif _phase_packet.get("outcome") == "phase_transition":
					_request({"command":"phase_transition_commit","proposal":_phase_packet.duplicate(true)},"phase_commit")
				else: _stage = "idle_move"
			"idle_move":
				if not _enemy.get("alive",false): _stage = "done"; continue
				if _enemy.s != "idle": _stage = "feint"; continue
				_module = "movement"
				_token_from(MOVEMENT.begin_tick(0,"idle_move",_enemy,_frame.sp,_frame.player,_context()),"idle_projectiles")
			"idle_projectiles":
				if _enemy.get("stunned",0) > 0: _stage = "selector"; continue
				_module = "projectiles"
				_token_from(PROJECTILES.begin_pattern(0,"idle",_enemy,_frame.player,_frame.sp,_context(),_frame.globals),"selector")
			"selector":
				_selection = SELECTOR.select_tick(0,_enemy,_frame.sp,_distance,_frame.player_stats,_rng)
				if _selection.get("status") != "READY": _fail(_selection); break
				_enemy = _selection.enemy.duplicate(true)
				_frame.player_stats = _selection.player_stats
				if _selection.start_pattern == null: _stage = "feint"; continue
				var start: Dictionary = _selection.start_pattern
				_module = "start"
				_token_from(START.begin_start(0,start.move_id,_enemy,_distance,int(start.phase),start.extra_delay,_context()),"feint")
			"feint":
				var packet := PHASE.clock_step(0,"after_ai_feint",_enemy,_frame.sp)
				_accept_scalar(packet,"switch")
			"switch": _dispatch_switch()
			"module": _accept_packet(_step_module(null))
			"done":
				_request({"command":"source_updateE_suffix","source_lines":[41405,41408],"player_stats":_frame.player_stats},"finish")
			"finish":
				_tick_count += 1
				_stage = "idle"
				break
			_: break
	_busy = false

func _context() -> Dictionary:
	var result: Dictionary = _frame.context.duplicate(true)
	result["distance"] = _distance # Original cached d, never recomputed after movement.
	result["player_x"] = _frame.player.x
	result["player_y"] = _frame.player.y
	return result

func _dispatch_switch() -> void:
	var state: String = _enemy.s
	if state == "idle":
		_module = "movement"
		_token_from(MOVEMENT.begin_tick(0,"idle_switch",_enemy,_frame.sp,_frame.player,_context()),"done")
	elif state in MELEE.STATES:
		_module = "melee"
		_token_from(MELEE.begin_tick(0,_enemy,_frame.sp,_frame.player,_context()),"done")
	elif state in MOVEMENT.STATES:
		_module = "movement"
		_token_from(MOVEMENT.begin_tick(0,"state",_enemy,_frame.sp,_frame.player,_context()),"done")
	elif state in PROJECTILES.STATES:
		_module = "projectiles"
		_token_from(PROJECTILES.begin_pattern(0,"state",_enemy,_frame.player,_frame.sp,_context(),_frame.globals),"done")
	elif state in CONTROL.STATES:
		_module = "control"
		_token_from(CONTROL.begin_tick(0,_enemy,_frame.sp,_frame.player,_context()),"done")
	elif state in MISC.STATES: # PC-BOSS-CORE 최소 훅(40749–40758/40798–40814/40869–40903/41327–41335)
		_module = "misc"
		_token_from(MISC.begin_tick(0,_enemy,_frame.sp,_frame.player,_context()),"done")
	elif state in ["recover","bossRec"]:
		_accept_scalar(PHASE.clock_step(0,"recovery_switch",_enemy,_frame.sp,{},_rng),"done")
	else:
		_error = "unsupported_boss_state:" + state

func _token_from(result: Dictionary,after: String) -> void:
	if result.get("status") != "READY": _fail(result); return
	_token = result.continuation
	_after_module = after
	_stage = "module"

func _step_module(response: Variant) -> Dictionary:
	match _module:
		"phase_effects": return PHASE.phase_effect_step(_token,response,_rng)
		"movement": return MOVEMENT.next_tick(_token,response,_rng)
		"melee": return MELEE.next_tick(_token,response,_rng)
		"projectiles": return PROJECTILES.next_pattern(_token,response,_rng)
		"control": return CONTROL.next_tick(_token,response,_rng)
		"start": return START.next_start(_token,response,_rng)
		"misc": return MISC.next_tick(_token,response,_rng) # PC-BOSS-CORE 최소 훅
	return {"status":"NOT_READY","reason":"unknown_module"}

func _accept_packet(packet: Dictionary) -> void:
	if packet.get("status") != "READY": _fail(packet); return
	var deferred_fields: Dictionary = {}
	for event in packet.get("events",[]):
		if event.get("kind") == "write": deferred_fields[event.field] = true
	for key in packet.enemy:
		if not deferred_fields.has(key): _enemy[key] = packet.enemy[key]
	if packet.get("player") is Dictionary: _frame.player = packet.player.duplicate(true)
	_token = packet.get("continuation",{}) if packet.get("continuation") != null else {}
	_stage = _after_module if packet.get("done") == true else "module"
	_packet_queue = []
	for event in packet.get("events",[]):
		if event.get("kind") == "write":
			_packet_queue.append({"internal_write":event.duplicate(true)})
		elif event.get("kind") == "global_write":
			_packet_queue.append({"command":"source_global_write","event":event.duplicate(true)})
	if packet.get("command") is Dictionary: _packet_queue.append(packet.command.duplicate(true))
	_flush_packet_queue()

func _accept_scalar(packet: Dictionary,after: String) -> void:
	if packet.get("status") != "READY": _fail(packet); return
	_enemy = packet.enemy.duplicate(true)
	_stage = after
	_packet_queue = packet.get("commands",[]).duplicate(true)
	_flush_packet_queue()

func _flush_packet_queue() -> void:
	while not _packet_queue.is_empty():
		var command: Dictionary = _packet_queue.pop_front()
		if command.has("internal_write"):
			var event: Dictionary = command.internal_write
			if event.field in ["hp","mhp","poise","maxPoise","poiseR","eShield","eShieldMax"]:
				_error = "protected_write_requires_PC_owner:" + str(event.field)
				return
			_enemy[event.field] = event.value
			position = Vector2(_enemy.x,_enemy.y)
		else:
			_request(command,"module" if _packet_queue.is_empty() and _stage == "module" else "event")
			return

func _fail(packet: Dictionary) -> void:
	_error = str(packet.get("reason","invalid_packet"))

func _complete_actor(value: Variant) -> bool:
	if not value is Dictionary: return false
	for key in _enemy:
		if not value.has(key): return false
	return value.get("ib") == true and value.get("etype") == 0 and value.get("s") is String \
		and _number(value.get("x")) and _number(value.get("y")) and _number(value.get("hp")) and _number(value.get("mhp"))

func _player(value: Variant) -> bool:
	if not value is Dictionary or not value.get("s") is String or not value.get("kb") is Dictionary: return false
	if not _number(value.kb.get("x")) or not _number(value.kb.get("y")): return false
	for key in ["x","y","r","iframes","facing"]:
		if not _number(value.get(key)): return false
	return true

func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))
