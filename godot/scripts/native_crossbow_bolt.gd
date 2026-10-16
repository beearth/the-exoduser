extends Node2D
## Independent normal bolt transport. A real original arrow visual is mandatory.
## Existing raw native receive_damage is not full source hurtE/crit/shield/affix parity.
const Formula=preload("res://port_modules/combat_stat_formula/producer.gd")
const WEAK_PAIRS := [[1,2],[2,1],[3,4],[4,3],[3,5],[5,3],[6,4],[4,6]]
var _world: WeakRef
var _packet: Dictionary
var _velocity:=Vector2.ZERO
var _distance:=0.0
var _bounces:=0
var _hits: Dictionary={}
var _configured:=false

func configure(packet: Dictionary,world: Node,visual: Node2D) -> bool:
	if _configured or not is_instance_valid(world) or not is_instance_valid(visual) or visual.get_parent()!=null:return false
	for key in ["position","velocity"]:
		if not packet.get(key) is Vector2 or not packet[key].is_finite():return false
	if not packet.get("damage") is int or not packet.get("element") is int or not packet.get("range") is float:return false
	_packet=packet.duplicate()
	_world=weakref(world)
	position=world.to_local(packet.position)
	_velocity=packet.velocity
	add_child(visual)
	visual.rotation=_velocity.angle()
	_configured=true
	process_mode=Node.PROCESS_MODE_PAUSABLE
	physics_interpolation_mode=Node.PHYSICS_INTERPOLATION_MODE_ON
	set_physics_process(false)
	return true

func advance_native(ticks: float) -> bool:
	var world: Variant=_world.get_ref() if _world!=null else null
	if not _configured or not is_instance_valid(world) or not is_finite(ticks) or ticks<=0.0:return _expire()
	position+=_velocity*ticks
	_distance+=_velocity.length()*ticks
	# Source normal arrows expire on strict > distance, before walls/contact.
	if _distance>float(_packet.range):return _expire()
	if world.is_world_blocked(global_position):
		if _distance<float(_packet.range)*0.5 and _bounces<2:
			position-=_velocity*ticks
			for escape in range(5):
				if not world.is_world_blocked(global_position):break
				position-=_velocity*ticks
			var horizontal: bool=world.is_world_blocked(global_position+Vector2(_velocity.x*ticks,0))
			var vertical: bool=world.is_world_blocked(global_position+Vector2(0,_velocity.y*ticks))
			if horizontal:_velocity.x=-_velocity.x
			if vertical:_velocity.y=-_velocity.y
			if not horizontal and not vertical:_velocity=-_velocity
			_bounces+=1
			get_child(0).rotation=_velocity.angle()
		else:return _expire()
	for enemy in world.query_native_enemies(global_position.x,global_position.y,23.0):
		if not is_instance_valid(enemy) or not enemy is Node2D or enemy.get("alive")!=true or _hits.has(enemy.get_instance_id()):continue
		if not enemy.has_method("receive_damage") or not enemy.get("data") is Dictionary:continue
		var radius: Variant=enemy.get("radius")
		var element: Variant=enemy.data.get("element_id")
		if not (radius is int or radius is float) or not (element is int or element is float):continue
		if not is_finite(float(element)) or element<0 or element>6 or float(element)!=floor(float(element)):continue
		if global_position.distance_to(enemy.global_position)>=float(radius)+3.0:continue
		var amount: int=Formula.js_to_int32(float(_packet.damage)*_element_multiplier(_packet.element,int(element)))
		var direction: Vector2=(enemy.global_position-global_position).normalized()
		enemy.receive_damage(amount,direction,"normalBow")
		# Original kill-pierce: a kill continues without inventing pierce probability.
		if enemy.get("alive")!=true:
			_hits[enemy.get_instance_id()]=true
			continue
		return _expire()
	z_as_relative=false
	z_index=clampi(int(global_position.y/4.0)+1,-4096,4095)
	return true

static func _element_multiplier(attacker: int,defender: int) -> float:
	if attacker==defender and attacker!=0:return 0.5
	for pair in WEAK_PAIRS:
		if pair[0]==attacker and pair[1]==defender:return 2.0
	return 1.0

func _expire() -> bool:
	if is_inside_tree():queue_free()
	return false
