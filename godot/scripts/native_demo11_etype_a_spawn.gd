extends RefCounted
## DEMO11-A: selected-etype handoff only. The source scheduler retains all29
## weights/RNG/order; this class never re-rolls or substitutes an unported type.
const HOLES=preload("res://scripts/native_spawn_hole_system.gd")
const TYPES=[0,1,4,5,6]
var _main: WeakRef
var _busy:=false
var _used: Dictionary={}
func configure(main: Node) -> void:_main=weakref(main)
func support(etype: int) -> Dictionary:
	if etype not in TYPES:return {"ready":false,"reason":"outside_group_a"}
	if etype==0:return {"ready":true,"scope":"existing_P3_etype0_undefined_element_elite0_only","full_hurtE_ready":false}
	return {"ready":false,"reason":"natural_constructor_and_world_admission_required" if etype in [1,4] else "native_actor_AI_and_PC_registration_required"}
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
		if draw[1].is_empty() and (literal[draw[0]]<draw[2] or literal[draw[0]]>=draw[2]+draw[3]):return {"ready":false,"reason":"source_literal_range:"+str(draw[0])}
	if not source.get("spawn_n") is int or source.spawn_n<1:return {"ready":false,"reason":"source_spawn_index_required"}
	var g: Variant=main.source_state.read_current_g()
	if not g is Dictionary or g.get("stage")!=0 or not g.get("on",false) or g.get("_bossArena",false):return {"ready":false,"reason":"source_stage_not_running"}
	var hole: Dictionary={};var index:=-1
	for i in range(g.spawnHoles.size()):
		if g.spawnHoles[i].get("spawn_group_id")==group_id:hole=g.spawnHoles[i];index=i;break
	if hole.is_empty() or source.spawn_n>HOLES.spawn_hole_count(hole.size,0):return {"ready":false,"reason":"group_or_spawn_index_invalid"}
	var token:=group_id+"/"+str(source.spawn_n)
	if _used.has(token):return {"ready":false,"reason":"source_spawn_already_consumed"}
	# Reuse existing P3 constructor, including current lv and source stats/skin.
	# Only its required radius is read before MAP11 geometry arbitration.
	var radius: float=(HOLES.ETYPE0_R+source.radius_u*2.0)*2.0*HOLES.ELITE_SCALE_MUL[0]
	_busy=true
	var site: Dictionary=adapter.request_spawn(group_id,{"etype":etype,"radius":radius})
	if not site.get("ready",false):_busy=false;return site
	var h:=hole.duplicate(true);h["_index"]=index
	var journal: Dictionary={"spawn_n":source.spawn_n,"requested":[site.position.x,site.position.y]}
	_used[token]=true # A committed constructor prefix must never be retried.
	var actor: Node=holes._make_etype0_actor(h,site.position,0,[],source.speed_u,source.radius_u,literal,journal)
	if not is_instance_valid(actor):_busy=false;return {"ready":false,"reason":"actual_P3_constructor_rejected","source_prefix_consumed":true}
	# Registration is real; AI stays inert until the existing source scheduler
	# owns this actor phase. Do not start an unapproved private delta clock.
	actor.set_physics_process(false)
	var origin: Dictionary=adapter.register_actor_origin(actor,group_id)
	_busy=false
	if not origin.get("ready",false):return {"ready":false,"reason":"origin_rejected_after_actual_registration","registered":true,"actor":actor,"source_prefix_consumed":true}
	return {"ready":true,"registered":true,"actor":actor,"site":site,"source_prefix_consumed":true,"scheduler":"HOLD_source_tick_integration","full_combat_ready":false}
func _number(v: Variant) -> bool:return (v is int or v is float) and is_finite(float(v))
func _unit(v: Variant) -> bool:return _number(v) and v>=0 and v<1
