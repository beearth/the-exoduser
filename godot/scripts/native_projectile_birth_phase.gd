extends Node
## Existing priority1 projectiles advance before newly appended projectiles.
## Hit effects then advance at priority3. The World remains the only clock.

var _world: Node2D

func configure(owner_world: Node2D) -> void:
	_world = owner_world
	process_physics_priority = 2

func _physics_process(_delta: float) -> void:
	if is_instance_valid(_world):
		_world.advance_native_birth_phase()
