extends Node2D
const COMMON=preload("res://scripts/native_fieldboss_common.gd")
## FD-only state machine; shared provider/contact/registry facade lives in COMMON.
const TICK = preload("res://scripts/native_demo11_fire_devil_tick.gd")
const MARKERS := ["FireDevil1","FireDevil2","FireDevil3","FireDevil4"]
signal presentation_requested(index: int, event: Dictionary)
signal protected_contact_requested(index: int, request: Dictionary)
signal final_death(index: int)
var _main: Node
var _provider: Node2D
var _markers: Array = []
var _nodes: Array = []
var _records: Array = []
var _g: Dictionary
var _kernel: RefCounted
var _index := 0
var _serial := -1
var _frame: Dictionary = {}
var _source_tick: Callable
var _pc_contact: Callable
var _hit_owner: Node
var _reason := "map_provider_unbound"
var _busy := false
var _ticks := 0
var _born := 0
static func install_native_boot(main: Node) -> Node2D:
	var family:=new()
	family.name="Demo11FireDevils"
	main.world.add_child(family)
	family._main=main
	family.process_physics_priority=3
	return family
func _live() -> bool:
	return COMMON.fire_live(_main,self)
func _provider_live() -> bool:
	return _live() and COMMON.named_provider_current(_main.world,_provider,_markers,MARKERS)
func bind_map_provider(provider: Node2D) -> bool:
	if not _live() or is_instance_valid(_provider) or not is_instance_valid(provider) or not _main.world.is_ancestor_of(provider):return false
	var markers: Array=COMMON.named_markers(provider,MARKERS)
	if markers.size()!=4:return false
	var state: Variant=_main.source_state.read_current_g()
	var p: Variant=_main.source_state.read_current_p()
	if not state is Dictionary or not p is Dictionary or state.get("stage")!=0 or state.get("_bossArena",false) or state.get("_fdSpawned",false) or not _number(p.get("lv")):return false
	_records=[]
	for marker in markers:_records.append(TICK.initial(marker.global_position,p.lv))
	if not _main.source_state.claim_native_fire_devil_records(self,_records):_records=[];return false
	_g=state;_provider=provider;_markers=markers
	for i in range(4):
		var member:=Node2D.new();member.name=MARKERS[i];add_child(member);member.global_position=markers[i].global_position;_nodes.append(member)
	_reason="source_clock_not_published"
	return true
func bind_source_tick(handler: Callable) -> bool:
	if _source_tick.is_valid() or not handler.is_valid():return false
	_source_tick=handler;return true
func bind_protected_contact(handler: Callable) -> bool:
	if _pc_contact.is_valid() or not handler.is_valid():return false
	_pc_contact=handler;return true
func bind_hit_owner(owner: Node) -> bool:
	if not _live() or is_instance_valid(_hit_owner) or not is_instance_valid(owner) or not _main.is_ancestor_of(owner):return false
	_hit_owner=owner;return true
func _physics_process(_delta: float) -> void:
	if not _provider_live():return
	var frame: Variant=_source_tick.call() if _source_tick.is_valid() else _main.world.read_native_source_player_projectile_context()
	if frame is Dictionary:advance_source_frame(frame)
func advance_source_frame(frame: Dictionary) -> bool:
	if _busy or not _provider_live() or get_tree().paused:return false
	# Source _fdTick global gate precedes actor work, even a pending command.
	if not frame.get("context") is Dictionary:return false
	var c: Dictionary=frame.context
	for key in ["lesson_active","qa_storage_active","first_forest_active"]:
		if not c.get(key) is bool:_reason="source_gate_missing:"+key;return false
	if not _g.get("on",false) or c.lesson_active or c.first_forest_active:return false
	if _g.get("stage")!=0 or _g.get("_bossArena",false) or c.qa_storage_active:
		clear_family();return false
	if frame.get("ready")!=true or not frame.get("serial") is int or not COMMON.fresh_serial(frame.serial,_serial) or not _number(frame.get("sp")) or frame.sp<0 or not TICK.valid_player(frame.get("player")) or not c.get("camera") is Vector2 or not c.camera.is_finite() or not c.get("viewport") is Vector2 or not c.viewport.is_finite() or c.viewport.x<=0 or c.viewport.y<=0:return false
	if not c.get("aggro_active") is bool or (c.aggro_active and not is_instance_valid(c.get("aggro_target_node"))):_reason="aggro_target_unbound";return false
	if is_instance_valid(_kernel) and not _kernel.done:_reason="owner_pending";return false
	_busy=true;_frame=frame.duplicate(true);_serial=frame.serial;_index=0;_reason=""
	_drain();_busy=false
	return _kernel==null
func resume_pending() -> bool:
	if _busy or not _provider_live() or get_tree().paused or not _g.get("on",false) or _g.get("stage")!=0 or _g.get("_bossArena",false) or _frame.get("context",{}).get("lesson_active",true) or _frame.get("context",{}).get("qa_storage_active",true) or _frame.get("context",{}).get("first_forest_active",true):return false
	if _kernel==null:return false
	_busy=true;_drain();_busy=false
	return _kernel==null
func _drain() -> void:
	while _index<4:
		var record: Variant=_records[_index]
		if record==null or record.hp<=0:_index+=1;continue
		if _kernel==null:
			_kernel=TICK.new()
			_kernel.begin(record,_frame.player,_frame.context.duplicate(),{"is_wall":_wall,"rng":_rng,"protected_contact":_contact,"spawn_projectile":_spawn})
		else:_kernel.pump()
		_nodes[_index].global_position=Vector2(record.x,record.y)
		if not _kernel.done:_reason="owner_pending:"+str(_kernel.pending.get("command",""));return
		# Keep actual PC player readback across slots; never write Player here.
		_frame.player=_kernel.p.duplicate(true)
		for event in _kernel.events:
			if event.kind=="wake" and not _g.get("_fdAnnounced",false):_g["_fdAnnounced"]=true;presentation_requested.emit(_index,{"kind":"announce"})
			presentation_requested.emit(_index,event)
		_kernel=null;_index+=1
	_ticks+=1;_reason=""
func _wall(at: Vector2) -> bool:return _main.world.is_world_blocked(at)
func _rng() -> float:return _main.world.sample_native_random_unit()
func _contact(request: Dictionary) -> Dictionary:
	protected_contact_requested.emit(_index,request.duplicate(true))
	if not _pc_contact.is_valid():return {"ack":false,"reason":"PC_field_contact_unbound"}
	var response: Variant=_pc_contact.call(request)
	return response if response is Dictionary else {"ack":false}
func _spawn(props: Dictionary) -> Dictionary:
	var registry: Node=_main.native_demo_boss_projectiles
	if not is_instance_valid(registry):return {"ack":false,"reason":"registry_unbound"}
	# Reuse35's actual birth, class/drop RNG and actual carrier append. Its
	# specialized elemBall rejection remains visible; no generic impersonation.
	var response: Variant=COMMON.birth_fire(registry,props,_frame)
	if response is Dictionary and response.get("ack")==true:_born+=1;return response
	return {"ack":false,"reason":"registry_specialized_owner_required"}
func apply_hit(owner: Node,index: int,damage: float) -> Dictionary:
	if not COMMON.hit_owner_admitted(_main,owner,_hit_owner,_busy,_provider_live(),_g,true) or index<0 or index>=4 or not is_finite(damage):return {"accepted":false}
	var m: Variant=_records[index]
	if m==null or m.hp<=0 or (m.hid and m.emT<=0) or m.hitCd>0:return {"accepted":false}
	COMMON.hit_cd8(m,damage,true)
	presentation_requested.emit(index,{"kind":"hit","hp":m.hp})
	if m.hp<=0:
		_records[index]=null;_nodes[index].queue_free()
		if _index==index:_kernel=null
		final_death.emit(index)
	return {"accepted":true,"dead":m.hp<=0,"hp":m.hp,"rewards_written":false}
func clear_family() -> void:
	_records.clear();_kernel=null
	if not _g.is_empty():_g["_fireDevils"]=null
	COMMON.free_views(_nodes,false)
	_nodes=[];_provider=null;_markers=[];_reason="family_cleared"
func snapshot() -> Dictionary:
	return {"status":"DORMANT" if not _provider_live() else ("READY" if _reason.is_empty() else "WAITING_OWNER"),"reason":_reason,"records":_records.duplicate(true),"ticks":_ticks,"serial":_serial,"projectile_requests_admitted":_born,"pending":_kernel.pending.duplicate(true) if _kernel!=null else {},"PC_contact_bound":_pc_contact.is_valid(),"hit_owner_bound":is_instance_valid(_hit_owner),"placement":"MAP11_Markers_only","full_combat_ready":false}
func _exit_tree() -> void:
	if not _g.is_empty() and is_same(_g.get("_fireDevils"),_records):_g["_fireDevils"]=null
	_kernel=null
func _number(v: Variant) -> bool:return COMMON.number(v)
