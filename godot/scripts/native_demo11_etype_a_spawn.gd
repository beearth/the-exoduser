extends RefCounted
## DEMO11-A: selected-etype handoff only. The source scheduler retains all29
## weights/RNG/order; this class never re-rolls or substitutes an unported type.
const HOLES=preload("res://scripts/native_spawn_hole_system.gd")
const TYPES=[0,1,4,5,6]
const FACTORY=preload("res://scripts/enemy_factory.gd")
const BUILD=preload("res://scripts/native_demo11_etype_a_constructor.gd")
var _templates: Dictionary={}
var _warning_phase: Node
var _next_order:=7000
var _main: WeakRef
var _busy:=false
var _used: Dictionary={}
func configure(main: Node) -> void:_main=weakref(main)
func support(etype: int) -> Dictionary:
	if etype not in TYPES:return {"ready":false,"reason":"outside_group_a"}
	return {"ready":FACTORY.DEMO11_ETYPE_A_REGISTRATIONS.has(etype),"scope":"source_stage0_normal_undefined_element","full_hurtE_ready":false}
func spawn_selected(owner: Node, group_id: String, source: Dictionary) -> Dictionary:
	var main: Node=_main.get_ref() if _main!=null else null
	if _busy or not is_instance_valid(main) or main.is_queued_for_deletion() or main.get_tree().paused:return {"ready":false,"reason":"owner_busy_or_lost"}
	var holes: Node=main.world.get_node_or_null("NativeSpawnHoleSystem")
	if owner!=holes or not is_instance_valid(holes) or holes.main!=main or holes.get_script()!=HOLES:return {"ready":false,"reason":"actual_source_scheduler_required"}
	var adapter: Variant=main.native_stage_spawn_adapter
	if adapter==null or not adapter.is_current():return {"ready":false,"reason":"stage_provider_not_current"}
	var etype: Variant=source.get("etype")
	if not etype is int:return {"ready":false,"reason":"etype_integer_required"}
	var allowed:=support(etype)
	if not allowed.ready:return allowed
	if not source.get("elite") is int or source.elite!=0 or source.get("mods")!=[]:return {"ready":false,"reason":"elite_modifier_owner_unported"}
	for key in ["el","element","element_id"]:
		if source.has(key):return {"ready":false,"reason":"natural_undefined_element_only"}
	for key in ["speed_u","radius_u"]:
		if not _unit(source.get(key)):return {"ready":false,"reason":"source_rng_draw_required:"+key}
	var literal: Variant=source.get("literal")
	if not literal is Dictionary:return {"ready":false,"reason":"source_literal_required"}
	for key in ["st2","facing","projT","bossPatT","_bossOrbitAng","_erraticAng"]:
		if not _number(literal.get(key)):return {"ready":false,"reason":"source_literal_required:"+key}
	for draw in HOLES.MKEN_LITERAL_DRAWS:
		if draw[1].is_empty() or etype in draw[1]:
			if not _number(literal.get(draw[0])) or literal[draw[0]]<draw[2] or literal[draw[0]]>=draw[2]+draw[3]:return {"ready":false,"reason":"source_literal_range:"+str(draw[0])}
	if not source.get("spawn_n") is int or source.spawn_n<1:return {"ready":false,"reason":"source_spawn_index_required"}
	var g: Variant=main.source_state.read_current_g()
	if not g is Dictionary or g.get("stage")!=0 or not g.get("on",false) or g.get("_bossArena",false):return {"ready":false,"reason":"source_stage_not_running"}
	var hole: Dictionary={};var index:=-1
	for i in range(g.spawnHoles.size()):
		if g.spawnHoles[i].get("spawn_group_id")==group_id:hole=g.spawnHoles[i];index=i;break
	if hole.is_empty() or source.spawn_n>HOLES.spawn_hole_count(hole.size,0):return {"ready":false,"reason":"group_or_spawn_index_invalid"}
	var token:=group_id+"/"+str(source.spawn_n)
	if _used.has(token):return {"ready":false,"reason":"source_spawn_already_consumed"}
	# Use the append-only factory registry and existing actor kernels.
	# Only its required radius is read before MAP11 geometry arbitration.
	var radius: float=BUILD.radius(etype,source.radius_u)
	_busy=true
	var site: Dictionary=adapter.request_spawn(group_id,{"etype":etype,"radius":radius})
	if not site.get("ready",false):_busy=false;return site
	var p: Variant=main.source_state.read_current_p()
	if not p is Dictionary or not _number(p.get("lv")):_busy=false;return {"ready":false,"reason":"current_level_unavailable"}
	var opt: Variant=main.source_initialization_services.read_current_options()
	if not opt is Dictionary or not _number(opt.get("diff")) or float(opt.diff)!=float(int(opt.diff)) or opt.diff<0 or opt.diff>10:_busy=false;return {"ready":false,"reason":"current_difficulty_unavailable"}
	var item: Dictionary=FACTORY.DEMO11_ETYPE_A_REGISTRATIONS[etype]
	if not _templates.has(etype):_templates[etype]=JSON.parse_string(FileAccess.get_file_as_string(item.template)).runtime
	if not _templates.has(0):_templates[0]=JSON.parse_string(FileAccess.get_file_as_string(FACTORY.DEMO11_ETYPE_A_REGISTRATIONS[0].template)).runtime
	var runtime: Dictionary=BUILD.build(_templates[etype],_templates[0].projectile,etype,site.position,p.lv,float(g.get("_stageDiffOff",0)),source,"demo11-a-"+token,_next_order,int(opt.diff))
	_next_order+=1
	_used[token]=true
	var actor: CharacterBody2D=item.actor.new()
	actor.configure(runtime,main.world)
	var registered: Dictionary=main.world.register_summoned_enemy(actor)
	if not registered.get("valid",false):
		actor.free();_busy=false;return {"ready":false,"reason":"actual_registry_rejected","errors":registered.get("errors"),"source_prefix_consumed":true}
	if etype==5:
		if not is_instance_valid(_warning_phase):
			_warning_phase=preload("res://scripts/native_demo11_etype_a_warning_phase.gd").new();_warning_phase.world=main.world;main.world.add_child(_warning_phase)
		_warning_phase.actors.append(weakref(actor))
	var origin: Dictionary=adapter.register_actor_origin(actor,group_id)
	_busy=false
	if not origin.get("ready",false):return {"ready":false,"reason":"origin_rejected_after_actual_registration","registered":true,"actor":actor,"source_prefix_consumed":true}
	return {"ready":true,"registered":true,"actor":actor,"site":site,"source_prefix_consumed":true,"scheduler":"existing_World_native_owner_phase","full_combat_ready":false}
func _number(v: Variant) -> bool:return (v is int or v is float) and is_finite(float(v))
func _unit(v: Variant) -> bool:return _number(v) and v>=0 and v<1
