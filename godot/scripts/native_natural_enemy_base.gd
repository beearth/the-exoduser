extends Node
## Sole natural constructor/admission/clock bridge; no HP/hurtP/parry writer.
const Factory=preload("res://scripts/enemy_factory.gd")
const Holes=preload("res://scripts/native_spawn_hole_system.gd")
const G_NATURAL_TYPES:=[3,7,13,14,16,17,20,21,47,29] # PC-ENEMY-ACTORS: 29 = 일반 소환굴 29(문지기 생성자 아님)
var main: Node
var holes: Node
var adapter: RefCounted
var projectiles: Node
var factory:=Factory.new()
var context_reader: Callable
var shared_random: RefCounted
var _prepared: Dictionary={}
var _live: Dictionary={}
var _used: Dictionary={}
var _legacy_death: Dictionary={}
var _components: Dictionary={}
var scheduler_enabled:=true
var profile_enabled:=false
var scheduler_max_us:=0
var _busy:=false
var _cached_frame:=-1.0
var _packet: Dictionary={}
var _serial:=0
var _late_frame:=-1.0
var _projectile_frame:=-1.0
var counts: Dictionary={"attempts":0,"registered":0,"rejected":0,"origin_kills":0,"late_ticks":0}
var last_receipt: Dictionary={}
class SharedRandom extends RefCounted:
	var world: Node
	func randf() -> float:return world.sample_native_random_unit()
	func randi_range(low: int,high: int) -> int:return low+int(floor(randf()*(high-low+1)))
func configure(owner_main: Node,reader: Callable,enable_scheduler: bool=true) -> Dictionary:
	if main!=null or not reader.is_valid() or get_parent()!=owner_main.world:return _no("invalid_base_owner")
	var candidate: Variant=owner_main.native_stage_spawn_adapter
	if candidate==null or not candidate.is_current():return _no("MAP11_provider_required")
	var c: Variant=reader.call()
	if not _context_valid(c):return _no("projectile_source_readers_required")
	main=owner_main;holes=main.world.get_node("NativeSpawnHoleSystem");adapter=candidate
	projectiles=main.native_demo_boss_projectiles
	if not is_instance_valid(projectiles):return _no("DEMO11_35_registry_required")
	context_reader=reader;scheduler_enabled=enable_scheduler
	shared_random=SharedRandom.new();shared_random.world=main.world
	if main.world._native_natural_enemy_base!=null or projectiles._natural_source!=null:return _no("single_owner_already_bound")
	if not main.world.bind_native_natural_enemy_base(self) or not projectiles.bind_natural_source(self):return _no("single_owner_already_bound")
	holes.natural_owner=self
	process_physics_priority=4
	process_mode=Node.PROCESS_MODE_PAUSABLE
	return {"ready":true,"registered_etypes":Factory.NATURAL_REGISTRATIONS.keys()}
func _context_valid(c: Variant) -> bool:
	if not c is Dictionary:return false
	for key in ["lesson_active","qa_storage_active","aggro_active"]:
		if not c.get(key) is bool:return false
	return not c.aggro_active or (c.get("aggro_target") is Dictionary and is_instance_valid(c.get("aggro_target_node")))
func _no(reason: String) -> Dictionary:return {"ready":false,"registered":false,"reason":reason}
func frame_ready(frame: float) -> bool:
	if main==null or not is_instance_valid(main) or not adapter.is_current() or get_tree().paused:return false
	if frame!=main.world.get_native_frame():return false
	if frame==_cached_frame:return not _packet.is_empty()
	_cached_frame=frame;_packet={}
	var g: Dictionary=main.source_state.read_current_g()
	if not g.get("on",false) or g.get("stage")!=0:return false
	if scheduler_enabled and (g.get("paused",false) or holes._lesson_active()):return false
	var c: Variant=context_reader.call()
	if not _context_valid(c) or c.lesson_active:return false
	_serial=int(main.world._native_clock_updates)
	_packet={"ready":true,"serial":_serial,"sp":main.world._native_last_ticks,"context":c.duplicate()}
	return true
func _physics_process(_delta: float) -> void:
	if not profile_enabled:advance_scheduler(main.world.get_native_frame());return
	var started:=Time.get_ticks_usec()
	advance_scheduler(main.world.get_native_frame())
	scheduler_max_us=maxi(scheduler_max_us,Time.get_ticks_usec()-started)
func advance_scheduler(frame: float) -> bool:
	if not scheduler_enabled or not frame_ready(frame) or frame<=_late_frame:return false
	_late_frame=frame;counts.late_ticks+=1
	holes.advance_native(float(_packet.sp))
	return true
func advance_projectiles(frame: float) -> bool:
	if not frame_ready(frame) or frame<=_projectile_frame:return false
	_projectile_frame=frame
	return projectiles.advance_natural_frame(self,_packet)
func emit_projectile(actor: Node,props: Dictionary) -> Dictionary:
	if not is_instance_valid(actor):return _no("natural_projectile_owner_not_current")
	var component: Node=projectile_component(actor)
	if component!=null and not component.allows_projectile(actor):return _no("profile_projectile_not_ready")
	if not owns_actor(actor) or not frame_ready(main.world.get_native_frame()):return _no("natural_projectile_owner_not_current")
	return projectiles.admit_natural_projectile(self,actor,props,_packet)
func owns_actor(actor: Node) -> bool:
	return is_instance_valid(actor) and _live.has(actor.get_instance_id()) and _live[actor.get_instance_id()].get_ref()==actor and actor.get_parent()==main.world and main.world.get_enemies().has(actor)
func authorizes_prepared(actor: Node) -> bool:
	return is_instance_valid(actor) and _prepared.get(actor.get_instance_id())==actor and actor.get_script() in [Factory.NATURAL_REGISTRATIONS[actor.etype].actor,Factory.NATURAL_REGISTRATIONS[actor.etype].get("selected_actor")]
func spawn_selected(source_owner: Node,group: String,source: Dictionary) -> Dictionary:
	if _busy or source_owner!=holes or not adapter.is_current() or not frame_ready(main.world.get_native_frame()):return _no("natural_source_owner_not_ready")
	if not source.get("etype") is int:return _no("invalid_etype")
	var entry:=factory.natural_registration(source.etype)
	if entry.is_empty():return _no("natural_etype_not_registered:"+str(source.etype))
	# PC-ENEMY-ACTORS: G 계열 9종 자연 공급(선택 etype 인계만, 재추첨·대체 0).
	if source.etype in G_NATURAL_TYPES:return main.request_native_etype_g_spawn(source_owner,group,source)
	if source.etype!=0:return _no("natural_profile_scheduler_HOLD:"+str(source.etype))
	if (not source.get("elite") is int or source.elite!=0) or source.get("mods")!=[]:return _no("elite_modifier_owner_not_ready")
	for key in ["el","element","element_id"]:
		if source.has(key):return _no("undefined_source_element_required")
	for key in ["speed_u","radius_u"]:
		if not _unit_valid(source.get(key)):return _no("invalid_uniform:"+key)
	if not source.get("spawn_n") is int or source.spawn_n<1:return _no("invalid_spawn_index")
	var literal: Variant=source.get("literal")
	if not literal is Dictionary:return _no("missing_source_literal")
	for draw in Holes.MKEN_LITERAL_DRAWS:
		if draw[1].is_empty():
			var v: Variant=literal.get(draw[0])
			if not (v is int or v is float) or not is_finite(float(v)) or v<draw[2] or v>=draw[2]+draw[3]:return _no("invalid_source_literal:"+str(draw[0]))
	var h: Dictionary={}
	for i in holes.holes.size():
		if holes.holes[i].get("spawn_group_id")==group:h=holes.holes[i].duplicate(true);h._index=i;break
	if h.is_empty() or source.spawn_n>Holes.spawn_hole_count(h.size,0):return _no("unknown_group_or_index")
	var token:=group+"/"+str(source.spawn_n)
	if _used.has(token):return _no("source_prefix_already_consumed")
	_busy=true
	var radius: float=(float(entry.radius_base)+source.radius_u*2.0)*2.0
	var site: Dictionary=adapter.request_spawn(group,{"etype":source.etype,"radius":radius,"source_position_uniforms":source.get("position_uniforms",[])})
	if not site.get("ready",false):_busy=false;return site
	_used[token]=true
	var built:=factory.prepare_natural(holes,h,site,source,self)
	if not built.ready:_busy=false;return built
	return _admit_prepared(built.actor,group,site)
func _admit_prepared(actor: Node,group: String,site: Dictionary) -> Dictionary:
	_prepared[actor.get_instance_id()]=actor
	var admitted: Dictionary=main.world.register_native_natural_enemy(self,actor)
	_prepared.erase(actor.get_instance_id())
	if not admitted.get("valid",false):actor.free();_busy=false;return _no("World_natural_admission_refused")
	_live[actor.get_instance_id()]=weakref(actor)
	var origin: Dictionary=adapter.register_actor_origin(actor,group)
	actor.telemetry_event.connect(_actor_event.bind(weakref(actor)))
	counts.registered+=1
	_busy=false
	return {"ready":origin.get("ready",false),"registered":true,"actor":actor,"site":site,"origin":origin,"source_prefix_consumed":true,"reason":"" if origin.get("ready",false) else "origin_rejected_after_registration"}
func _actor_event(kind: String,payload: Dictionary,reference: WeakRef) -> void:
	var actor: Node=reference.get_ref()
	if not is_instance_valid(actor):return
	# Only the legacy public receive_damage emits raw_amount immediately before
	# its own death event. Full PC hurtE owns its later _regKill prefix itself.
	if kind=="enemy_damage" and payload.has("raw_amount") and actor.hp<=0 and actor.alive:
		_legacy_death[actor.get_instance_id()]=true
	if kind=="enemy_death" and _legacy_death.has(actor.get_instance_id()):
		_legacy_death.erase(actor.get_instance_id())
		# Existing legacy PC actor damage interface emits this after actual death.
		var receipt: Dictionary=adapter.record_actor_kill(actor)
		if receipt.get("applied",false):counts.origin_kills+=1
func spawn_hole(h: Dictionary) -> bool:
	counts.attempts+=1
	var draws: Array=[]
	# Preserve two position uniforms; MAP11 provider alone interprets geometry.
	var position_uniforms: Array=[holes._unit("pos_angle",draws),holes._unit("pos_radius",draws)]
	var ranged: float=holes._unit("rollEtype_ranged",draws)
	var roll: float=holes._unit("rollEtype_roll",draws)
	var etype: int=Holes.roll_etype_from(ranged,roll)
	var elite_roll: float=holes._unit("rollElite",draws)
	var elite:=0
	if elite_roll<Holes.ELITE_PROB_HELL0[2]:elite=3
	elif elite_roll<Holes.ELITE_PROB_HELL0[2]+Holes.ELITE_PROB_HELL0[1]:elite=2
	elif elite_roll<Holes.ELITE_PROB_HELL0[2]+Holes.ELITE_PROB_HELL0[1]+Holes.ELITE_PROB_HELL0[0]:elite=1
	var mods: Array=[]
	if elite>0:
		var pick: float=holes._unit("rollMods_attack",draws)
		mods.append(Holes.HELL0_ATTACK_MODS[int(pick*Holes.HELL0_ATTACK_MODS.size())])
	var source: Dictionary={"etype":etype,"elite":elite,"mods":mods,"spawn_n":int(h.get("_spawned",0))+1,
		"speed_u":holes._unit("spd",draws),"radius_u":holes._unit("r",draws),"literal":{},"position_uniforms":position_uniforms}
	for row in Holes.MKEN_LITERAL_DRAWS:
		if row[1].is_empty() or row[1].has(etype):source.literal[row[0]]=float(row[2])+holes._unit(row[0],draws)*float(row[3])
	# DEMO11-47j: dispatch the already-selected A profile; preserve all source draws.
	if etype in [1,4,5,6]:
		last_receipt=main.request_native_etype_a_spawn(holes,h.spawn_group_id,source)
	elif etype==15:
		last_receipt=main.request_native_etype15_spawn(holes,h.spawn_group_id,source)
	else:
		last_receipt=spawn_selected(holes,h.spawn_group_id,source)
	if last_receipt.get("registered",false):
		holes._metrics.actors_registered+=1
		holes._metrics.spawned+=1
	else:
		counts.rejected+=1
		if str(last_receipt.get("reason","")).begins_with("natural_etype_not_registered:"):holes._metrics.unported_spawns+=1
	holes.spawn_journal.append({"frame":holes._game_frame,"etype":etype,"draws":draws,"registered":last_receipt.get("registered",false),"reason":last_receipt.get("reason","")})
	# Unsupported type consumes its source attempt, never rerolls/substitutes.
	return last_receipt.get("ready",false) or str(last_receipt.get("reason","")).begins_with("natural_etype_not_registered:") or str(last_receipt.get("reason","")).begins_with("natural_profile_scheduler_HOLD:") or last_receipt.get("reason")=="elite_modifier_owner_not_ready"

func _unit_valid(v: Variant) -> bool:return (v is int or v is float) and is_finite(float(v)) and v>=0 and v<1

func spawn_profile_record(component: Node,group: String,record: Dictionary,site: Dictionary) -> Dictionary:
	if _busy or not is_instance_valid(component) or component.get_parent()!=main.world or not component.current() or not frame_ready(main.world.get_native_frame()):return _no("natural_profile_component_not_current")
	if not site.get("ready",false) or site.get("spawn_group_id")!=group:return _no("natural_profile_site_receipt_required")
	var token:=group+"/profile/"+str(record.get("id",""))
	if _used.has(token):return _no("source_prefix_already_consumed")
	_busy=true;_used[token]=true
	var built:=factory.prepare_natural_profile(record,main.world,component)
	if not built.get("ready",false):_busy=false;return built
	var actor: Node=built.actor
	_components[actor.get_instance_id()]=weakref(component)
	var key: int=actor.get_instance_id()
	var result:=_admit_prepared(actor,group,site)
	if not result.get("registered",false):_components.erase(key)
	return result
func projectile_component(actor: Node) -> Node:
	var reference: Variant=_components.get(actor.get_instance_id())
	return reference.get_ref() if reference is WeakRef else null

func admit_source_record(component: RefCounted,group: String,record: Dictionary,site: Dictionary,source: Dictionary) -> Dictionary:
	if _busy or component not in [main._native_etype_a_spawn,main._native_etype_b_spawn,main._native_etype_f_spawn,main._native_etype15_spawn] or not adapter.is_current() or get_tree().paused:return _no("actual_source_profile_required")
	if not site.get("ready",false) or site.get("spawn_group_id")!=group:return _no("source_profile_site_receipt_required")
	var token:=group+"/"+str(source.spawn_n)
	if _used.has(token):return _no("source_prefix_already_consumed")
	_busy=true;_used[token]=true
	var built:=factory.prepare_natural_profile(record,main.world,component)
	if not built.get("ready",false):_busy=false;return built
	return _admit_prepared(built.actor,group,site)
func emit_profile_projectile(actor: Node,origin: Vector2,profile: Dictionary) -> Node2D:
	if not owns_actor(actor) or not actor.alive or not frame_ready(main.world.get_native_frame()):return null
	return projectiles.admit_profile_projectile(self,actor,origin,profile,_packet)

func permits_profile_element(actor: Node,props: Dictionary) -> bool:
	var component: Node=projectile_component(actor)
	if component!=null and component.get_script().resource_path=="res://scripts/native_demo11_etype_g_spawn.gd":return component.authorizes_props(actor,props) # PC-ENEMY-ACTORS: 원문 eProjAt 명시 원소(29 EL.I 등)
	return component!=null and actor.etype==29 and component.get_script().resource_path=="res://scripts/native_demo11_etype_e_spawn.gd" and component.authorizes_props(actor,props)

func admit_split_record(component: RefCounted,record: Dictionary,site: Dictionary) -> Dictionary:
	if _busy or component!=main._native_etype15_spawn or not adapter.is_current() or not site.get("ready",false) or not owns_actor(site.get("split_parent")):return _no("split_actual_parent_required")
	_busy=true
	var built: Dictionary=factory.prepare_natural_profile(record,main.world,component)
	if not built.get("ready",false):_busy=false;return built
	return _admit_prepared(built.actor,site.spawn_group_id,site)
