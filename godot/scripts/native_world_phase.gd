extends Node
## Runs the managed native owner phase after ordinary Player/actor priority0,
## and before the priority1 projectile children appended later to the world.
## The world owns the clock; this node cannot set or invent a frame.

var _world: Node2D

func configure(owner_world: Node2D) -> void:
	_world = owner_world
	process_physics_priority = 1

func _demo47i_physics_body(_delta: float) -> void:
	if is_instance_valid(_world):
		_world.advance_native_owner_phase()

func _physics_process(_delta: float) -> void:
	var tree_root: Window=get_tree().root
	if not tree_root.has_meta("demo47i_stage"):
		_demo47i_physics_body(_delta);return
	var started: int=Time.get_ticks_usec()
	_demo47i_physics_body(_delta)
	var elapsed: int=Time.get_ticks_usec()-started
	var perf: Dictionary=tree_root.get_meta("demo47i_perf",{})
	var key: String=str(tree_root.get_meta("demo47i_stage"))+"|native_world_phase.gd::_physics_process"
	var row: Dictionary=perf.get(key,{"max_us":0,"calls":0,"total_us":0})
	row.max_us=maxi(row.max_us,elapsed);row.calls+=1;row.total_us+=elapsed
	perf[key]=row;tree_root.set_meta("demo47i_perf",perf)
