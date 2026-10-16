extends Node
## Actual normal auto-crossbow owner, mounted by Main under the current World.
## Source: T toggle -> update auto loop -> normal _autoFireBowSkill -> _fireXbow.
## Arrow artwork must be bound explicitly. No replacement/fallback renderer.
const Parameters = preload("res://port_modules/normal_auto_crossbow/producer.gd")
const Bolt = preload("res://scripts/native_crossbow_bolt.gd")
var _main: WeakRef
var _world: WeakRef
var _parameters: RefCounted
var _arrow_factory: Callable
var _enabled := true
var _timer := 0.0
var _target: WeakRef
var _last_frame := -1.0
var _bolts: Array = []
var _shots := 0
var _last_reason := "not_configured"

func configure(main: Node) -> bool:
	if _main != null or not is_instance_valid(main) or main.get_script()==null or main.get_script().resource_path!="res://scripts/main.gd":return false
	var world: Variant=main.get("world")
	var player: Variant=main.get("player")
	var providers: Variant=main.get("source_providers")
	if not is_instance_valid(world) or not is_instance_valid(player) or world.get("player")!=player or not is_instance_valid(providers) or not providers.is_native_source_providers_ready():return false
	var parameters=Parameters.new()
	if not parameters.configure(providers.get_provider_bundle()):return false
	var services: Variant=main.get("source_initialization_services")
	var options: Variant=services.read_current_options() if is_instance_valid(services) else null
	if not options is Dictionary:return false
	# Original declaration true; restored OPT only overrides when boolean.
	if options.get("xbowAuto") is bool:_enabled=options.xbowAuto
	_main=weakref(main)
	_world=weakref(world)
	_parameters=parameters
	process_mode=Node.PROCESS_MODE_PAUSABLE
	# World owns the clock; run this consumer after the ordinary Player phase.
	process_physics_priority=1
	_last_reason="original_arrow_visual_unbound"
	return true

func bind_original_arrow_visual(factory: Callable) -> bool:
	if _arrow_factory.is_valid() or not factory.is_valid() or factory.get_argument_count()!=1:return false
	_arrow_factory=factory
	return true

func toggle() -> bool:
	if not _context_ready():return false
	_enabled=not _enabled
	_timer=0.0
	_target=null
	# Native local session only. No browser settings/save authority is invented.
	return true

func _physics_process(_delta: float) -> void:
	if not _context_ready():return
	var world: Node=_world.get_ref()
	var frame: float=world.get_native_frame()
	if frame==_last_frame:return
	var ticks: float=world.get_native_projectile_fx_context().dt_sp
	if not is_finite(frame) or not is_finite(ticks) or ticks<=0.0:return
	_last_frame=frame
	_advance_emitter(ticks)
	# Existing projectiles continue when T is off, bow removed or player is dead.
	var survivors: Array=[]
	for bolt in _bolts:
		if is_instance_valid(bolt) and bolt.advance_native(ticks):
			survivors.append(bolt)
	_bolts=survivors

func _advance_emitter(ticks: float) -> void:
	var main: Node=_main.get_ref()
	var player: Node2D=main.get("player")
	if not _enabled or player.hp<=0.0:return
	var parameters: Dictionary=_parameters.read_parameters()
	if parameters.get("ready")!=true:
		_last_reason=parameters.get("reason","current_bow_parameters_not_ready")
		return
	_timer+=ticks
	_target=null
	var origin: Vector2=player.global_position
	var nearest: float=parameters.range
	var world: Node=_world.get_ref()
	for enemy in world.query_native_enemies(origin.x,origin.y,parameters.range):
		if not is_instance_valid(enemy) or not enemy is Node2D or enemy.get("alive")!=true:continue
		var distance: float=origin.distance_to(enemy.global_position)
		if distance<nearest:
			nearest=distance
			_target=weakref(enemy)
	if _timer<float(parameters.interval) or _target==null or player.stamina<=player.max_stamina*0.2:return
	if not _arrow_factory.is_valid():
		_last_reason="original_arrow_visual_unbound"
		return
	var target: Node2D=_target.get_ref()
	if not is_instance_valid(target):return
	var direction: Vector2=(target.global_position-origin).normalized()
	var packet: Dictionary=parameters.duplicate()
	packet["position"]=origin+direction*float(parameters.spawn_offset)
	packet["velocity"]=direction*float(parameters.speed)
	var before: float=player.stamina
	var visual: Variant=_arrow_factory.call(packet.duplicate())
	if not visual is Node2D or visual.get_parent()!=null:
		_last_reason="original_arrow_visual_not_ready"
		return
	var bolt=Bolt.new()
	if not bolt.configure(packet,world,visual):
		visual.free()
		bolt.free()
		_last_reason="normal_bolt_configuration_rejected"
		return
	world.add_child(bolt)
	_bolts.append(bolt)
	_timer=0.0
	_shots+=1
	# Original normal branch spends AFTER the successful fire call, no full-cost gate.
	var cost: Dictionary=main.source_resources.commit_native_auto_crossbow_cost(main,before,float(parameters.cost))
	_last_reason="" if cost.get("accepted")==true else "emitted_but_cost_commit_rejected"

func _context_ready() -> bool:
	if _main==null or _world==null or not is_inside_tree() or get_tree().paused:return false
	var main: Variant=_main.get_ref()
	var world: Variant=_world.get_ref()
	if not is_instance_valid(main) or not is_instance_valid(world) or main.is_queued_for_deletion() or world.is_queued_for_deletion():return false
	var player: Variant=main.get("player")
	var resources: Variant=main.get("source_resources")
	if main.get("world")!=world or get_parent()!=world or not is_instance_valid(player) or world.get("player")!=player or not is_instance_valid(resources) or not resources.is_native_source_resources_ready():return false
	return player.get_native_character_profile_snapshot().get("ready")==true

func get_snapshot() -> Dictionary:
	return {"configured":_parameters!=null,"enabled":_enabled,"timer":_timer,"shots":_shots,
		"live_bolts":_bolts.size(),"arrow_visual_bound":_arrow_factory.is_valid(),
		"reason":_last_reason,"scope":"NORMAL_AUTO_CROSSBOW_PARTIAL",
		"full_hurtE":false,"settings_persistence":false,"full_skill_complete":false}
