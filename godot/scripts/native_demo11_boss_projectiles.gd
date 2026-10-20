extends Node
const BIRTH = preload("res://scripts/native_ch1_boss_projectile_patterns.gd")
const CLASS_AUTHORITY = preload("res://port_modules/parry_blue_projectile/producer.gd")
const CARRIER = preload("res://scripts/native_demo11_boss_projectile.gd")
const SOURCE_PATH := "res://data/demo11_projectile_source.json"
const SPECIAL := ["mine","trap","web","poisonZone","iceZone","blizzard","dimRift","elemBall","_coralSpike","swordWave","beam"]
signal protected_contact_request(request: Dictionary)
signal projectile_retired(id: int, reason: String)
var _actor: Node
var _world: Node2D
var _player: Node2D
var _class_authority: Node
var _source: Dictionary
var _entries: Dictionary = {}
var _free: Array = []
var _next_id := 0
var _drop := 0
var _serial := -1
var _born := 0
var _dropped := 0
var _ended := 0
var _motion_ticks := 0
var _unbound_contact_scans := 0
var _pc_contact: Callable
var _error := ""
var _last_retired: Dictionary = {}
var _in_birth := false
var _advancing := false
var _tick_queue: Array = []
var _recycle_pending: Array = []
static func install_native_boot(main: Node) -> Node:
	var service := new()
	service.name = "Demo11BossProjectiles"
	main.world.add_child(service)
	if not service.configure(main.native_demo_boss_actor,main.world,main.player):
		service.free()
		return null
	return service
func configure(actor: Node,world: Node2D,player: Node2D) -> bool:
	if is_instance_valid(_actor) or not is_instance_valid(actor) or not is_instance_valid(world) or not is_instance_valid(player) or actor.get_parent()!=world or get_parent()!=world: return false
	_source = JSON.parse_string(FileAccess.get_file_as_string(SOURCE_PATH))
	if not _source.get("pool") is Dictionary: return false
	_class_authority = CLASS_AUTHORITY.new()
	_actor = actor
	_world = world
	_player = player
	process_physics_priority = 2
	if not actor.bind_owner("spawnProj_owner",_birth_request) or not actor.bind_owner("_spawnBossProjectile",_birth_request): return false
	return true
func bind_protected_contact(owner: Callable) -> bool:
	if _pc_contact.is_valid() or not owner.is_valid(): return false
	_pc_contact = owner
	return true
func _rng(_tag: String) -> float: return _world.sample_native_random_unit()
func _birth_request(request: Dictionary) -> Variant:
	if _in_birth or not _live(): return null
	if not request.get("args") is Array or request.args.is_empty() or not request.args[0] is Dictionary or not request.get("frame") is Dictionary: return null
	var frame: Dictionary = request.frame
	var context: Dictionary = frame.get("context",{}).duplicate(true)
	for name in ["lesson_active","qa_storage_active","aggro_active"]:
		if not context.get(name) is bool:
			_error = "birth_global_reader_missing:"+name
			return null
	if not frame.get("serial") is int or not _number(frame.get("sp")) or frame.sp<0:
		_error = "source_birth_frame_missing"
		return null
	var props: Dictionary = request.args[0].duplicate(true)
	if request.command == "_spawnBossProjectile":
		var wrapped := BIRTH.prepare_boss_props(0,request.enemy,props,context.get("thorn_first"))
		if wrapped.get("status")!="READY": _error=wrapped.get("reason",""); return null
		props = wrapped.props
	for flag in SPECIAL:
		if props.get(flag,false): _error="specialized_tick_owner_required:"+flag; return null
	if props.get("friendly",false): _error="hostile_carrier_required"; return null
	_in_birth = true
	var pool: Dictionary = _free.pop_back() if not _free.is_empty() else {}
	pool.merge(_source.pool.duplicate(true),true)
	context["pool_snapshot"] = pool
	context["drop_counter"] = _drop
	var before := _drop
	var result: Dictionary = BIRTH.begin_birth(props,context)
	while result.get("status")=="READY" and not result.get("done",false):
		var token: Dictionary = result.continuation
		var response: Variant = null
		if result.get("command") is Dictionary:
			# Read-only call to the pre-existing FULL source class authority.
			_class_authority.p = CLASS_AUTHORITY.POOL_DEFAULTS.duplicate(true)
			_class_authority.p.merge(result.command.args[0],true)
			response = {"ack":true,"value":_class_authority.call("_parry_class")}
		result = BIRTH.next_birth(token,response,_rng)
	if result.get("status")!="READY":
		_error = result.get("reason","birth_rejected")
		_free.append(pool)
		_in_birth=false
		return null
	_drop = result.drop_counter
	if result.projectile == null:
		_free.append(pool)
		_dropped += 1
		_in_birth=false
		return {"ack":true,"projectile_result":null,"drop_before":before,"drop_after":_drop}
	pool.clear()
	pool.merge(result.projectile,true)
	_next_id += 1
	var shot: Node2D = CARRIER.new()
	shot.configure_source(_next_id,pool,_profile(pool),_player,_world)
	shot.native_expiry_policy = _retain_expired
	shot.retired.connect(_retire)
	_world.add_child(shot)
	if not shot.is_inside_tree() or shot.is_queued_for_deletion():
		_error="actual_carrier_creation_rejected"
		_in_birth=false
		return null
	_entries[_next_id] = {"node":shot,"raw":pool,"born_serial":frame.serial,"birth_ticks":0,"calls":0}
	if _advancing: _tick_queue.append(_next_id)
	_born += 1
	_error=""
	_in_birth=false
	# This ack is issued only after the actual node/registry append, never a mock.
	return {"ack":true,"projectile_result":pool.duplicate(true),"drop_before":before,"drop_after":_drop}
func _profile(raw: Dictionary) -> Dictionary:
	var rates: Dictionary = _source.turn_rates
	var rate: float = rates.physical if raw.parryClass=="physical" else rates.magic
	if raw.get("phantomSword",false): rate=rates.phantom
	if raw.get("elemBall",false): rate=rates.elemBall
	if raw.get("fbEnergy",false) or raw.get("fdEnergy",false): rate=rates.energy
	if raw.get("blackBean",false): rate=rates.black
	if raw.get("_lessonShot",false): rate=rates.lesson
	var speed: float=Vector2(raw.vx,raw.vy).length()*60.0
	return {"contact_damage":raw.dmg,"life_ticks":raw.life,"speed_pixels_per_second":[speed,speed],"life_decay_per_tick":0.667,"homing_until_life":30,"homing_radians_per_tick":rate}
func _live() -> bool:
	return is_instance_valid(_actor) and is_instance_valid(_world) and is_instance_valid(_player) and is_inside_tree() and get_parent()==_world and _actor.get_parent()==_world
func _camera() -> Vector2:
	var camera := get_viewport().get_camera_2d()
	return camera.global_position if is_instance_valid(camera) else _player.global_position
func _retain_expired(shot: Node) -> bool:
	return shot.life_ticks > -900 and not shot.raw.get("redBean",false) and shot.global_position.distance_squared_to(_camera())<=6250000.0
func _physics_process(_delta: float) -> void:
	if _natural_source!=null and is_instance_valid(_natural_source.get_ref()):return
	if not _live() or _entries.is_empty() or not _actor.is_source_frame_completed(): return
	advance_source_frame(_actor.read_source_frame())
func advance_source_frame(frame: Dictionary) -> bool:
	if not _live() or frame.get("ready")!=true or not frame.get("serial") is int or frame.serial<=_serial or not _number(frame.get("sp")) or frame.sp<0: return false
	# Validate the whole tick before advancing any carrier. Aggro needs its real
	# runtime target node; no invented target/clock or fallback protected outcome.
	var context: Dictionary = frame.get("context",{})
	if context.get("aggro_active",false) and not is_instance_valid(context.get("aggro_target_node")):
		_error="actual_aggro_target_node_missing"
		return false
	_serial=frame.serial
	_advancing = true
	_tick_queue = _entries.keys()
	var cursor := 0
	while cursor < _tick_queue.size():
		var id: int = _tick_queue[cursor]
		cursor+=1
		if not _entries.has(id): continue
		var entry: Dictionary = _entries[id]
		var shot: Node = entry.node
		if not is_instance_valid(shot) or shot.is_queued_for_deletion(): _retire(id,"owner_lost"); continue
		if shot.global_position.distance_squared_to(_camera())>6250000.0: shot._end("camera_distance"); continue
		shot.player = _player if shot.raw.get("blackBean",false) or not context.get("aggro_active",false) else context.aggro_target_node
		var before: Vector2=shot.global_position
		entry.calls+=1
		if entry.calls==1: entry.birth_ticks+=1
		_motion_ticks+=1
		if not shot.advance_source_motion(frame.sp): continue
		if _pc_contact.is_valid():
			var request := {"id":id,"node":shot,"projectile":shot.raw.duplicate(true),"before":before,"after":shot.global_position,"frame":frame}
			protected_contact_request.emit(request)
			var response: Variant=_pc_contact.call(request)
			if response is Dictionary and response.get("ack")==true and response.get("action")=="retire": shot._end("protected_owner")
		else: _unbound_contact_scans+=1
	_advancing = false
	_free.append_array(_recycle_pending)
	_recycle_pending.clear()
	return true
func _retire(id: int,reason: String) -> void:
	if not _entries.has(id): return
	var entry: Dictionary = _entries[id]
	_entries.erase(id)
	_ended+=1
	if is_instance_valid(entry.node):
		entry.raw.x=entry.node.global_position.x
		entry.raw.y=entry.node.global_position.y
		entry.raw.life=entry.node.life_ticks
		entry.raw.dist=entry.node.distance_travelled
	_last_retired={"id":id,"reason":reason,"raw":entry.raw.duplicate(true)}
	if _advancing: _recycle_pending.append(entry.raw)
	else: _free.append(entry.raw)
	projectile_retired.emit(id,reason)
func read_drop_counter() -> int: return _drop

func snapshot() -> Dictionary:
	var shots: Array=[]
	for id in _entries:
		var e: Dictionary=_entries[id]
		shots.append({"id":id,"raw":e.raw.duplicate(true),"in_tree":is_instance_valid(e.node) and e.node.is_inside_tree(),"birth_ticks":e.birth_ticks,"calls":e.calls})
	return {"status":"READY" if _live() and _error.is_empty() else "NOT_READY","reason":_error,"live":_entries.size(),"born":_born,"dropped":_dropped,"retired":_ended,"drop_counter":_drop,"serial":_serial,"motion_ticks":_motion_ticks,"unbound_contact_scans":_unbound_contact_scans,"protected_contact_bound":_pc_contact.is_valid(),"shots":shots,"last_retired":_last_retired.duplicate(true)}
func _exit_tree() -> void:
	for entry in _entries.values():
		if is_instance_valid(entry.node): entry.node.queue_free()
	_entries.clear()
	if is_instance_valid(_class_authority): _class_authority.free()
func _number(value: Variant) -> bool: return (value is int or value is float) and is_finite(float(value))

# Natural ordinary shots enter the same BC09/pool/Carrier registry, never a copy.
var _natural_source: WeakRef
func bind_natural_source(owner: Node) -> bool:
	if _natural_source!=null or not _live() or owner.get_parent()!=_world:return false
	_natural_source=weakref(owner)
	return true
func admit_natural_projectile(owner: Node,actor: Node,props: Dictionary,frame: Dictionary) -> Dictionary:
	if _natural_source==null or _natural_source.get_ref()!=owner or not owner.owns_actor(actor):return {"ready":false,"reason":"natural_projectile_identity_required"}
	if props.get("el")!=actor.el:return {"ready":false,"reason":"natural_projectile_element_mismatch"}
	var result: Variant=_birth_request({"command":"spawnProj_owner","args":[props],"frame":frame})
	return {"ready":result is Dictionary and result.get("ack",false),"reason":_error,"receipt":result}
func advance_natural_frame(owner: Node,frame: Dictionary) -> bool:
	if _natural_source==null or _natural_source.get_ref()!=owner:return false
	return advance_source_frame(frame)
