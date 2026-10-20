extends Node2D
# Exact pre-optimization separation body; pure movement recorder fixture.
var radius=20.0
var _separation_ticks=0.0
var world: Node
var recorded:=Vector2.ZERO
func _move_native(push: Vector2,_ticks: float) -> void:recorded=push

func _apply_separation(ticks: float) -> void:
	if _separation_ticks > 0.0:
		_separation_ticks -= ticks
		return
	var push = Vector2.ZERO
	for other in world.get_enemies():
		if other == self or not is_instance_valid(other) or not bool(other.get("alive")):
			continue
		var difference = global_position - other.global_position
		var distance_squared = difference.length_squared()
		if distance_squared > pow(radius * 4.4, 2.0):
			continue
		var minimum = radius + float(other.get("radius")) + 4.0
		if distance_squared > 0.01 and distance_squared < minimum * minimum:
			var distance = sqrt(distance_squared)
			push += difference / distance * ((minimum - distance) / minimum) * 1.5
	_move_native(push, ticks)
	_separation_ticks = 3.0
