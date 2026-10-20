extends RefCounted
## Existing physical carrier/PC protection path. Undefined el has physical class
## but is not strict EL.P: no forced elemental conversion or homing flag.
static func fire(actor: Node,origin: Vector2,profile: Dictionary) -> Node2D:
	if not actor.alive or not is_instance_valid(actor.player):return null
	var shot:=preload("res://scripts/enemy_projectile_physical.gd").new()
	shot.configure(origin,(actor.player.global_position-actor.global_position).normalized(),profile,actor.player,actor.world,actor.native_frame)
	shot.native_homing_enabled=false
	shot.telemetry_event.connect(actor._forward_event);actor.world.add_child(shot)
	actor.telemetry_event.emit("enemy_projectile_birth",{"id":actor.data.id,"parry_class":"physical","source_el_undefined":true,"node_id":shot.get_instance_id()})
	return shot
