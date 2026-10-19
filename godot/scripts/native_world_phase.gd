extends Node
## Runs the managed native owner phase after ordinary Player/actor priority0,
## and before the priority1 projectile children appended later to the world.
## The world owns the clock; this node cannot set or invent a frame.

var _world: Node2D

func configure(owner_world: Node2D) -> void:
	_world = owner_world
	process_physics_priority = 1

func _physics_process(_delta: float) -> void:
	if is_instance_valid(_world):
		_world.advance_native_owner_phase()
