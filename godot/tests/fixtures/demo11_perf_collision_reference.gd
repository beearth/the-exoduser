extends Node2D
# Exact pre-optimization Mac geometry query bodies, baseline c09196b5.
var map_data: Dictionary
var _tile_size=40.0

func _hill_ramp_at(tile: Vector2) -> float:
	var h: Dictionary = map_data["hill"]
	if tile.x < float(h["rampX0"]) or tile.x > float(h["rampX1"]):
		return -1.0
	var t = (tile.x - float(h["rampX0"])) / (float(h["rampX1"]) - float(h["rampX0"]))
	var half_width = lerpf(float(h["rampHalf0"]), float(h["rampHalf1"]), t)
	return t if absf(tile.y - float(h["rampY"])) <= half_width else -1.0

func is_world_blocked(pos: Vector2) -> bool:
	if pos.x < 0 or pos.y < 0 or pos.x >= 8000 or pos.y >= 8000:
		return true
	var cell = Vector2i(floori(pos.x / _tile_size), floori(pos.y / _tile_size))
	if int(map_data["tiles"][cell.y * 200 + cell.x]) == 1:
		return true
	var h: Dictionary = map_data["hill"]
	var tile = pos / _tile_size
	if _hill_ramp_at(tile) < 0:
		var q = (tile - Vector2(float(h["cx"]), float(h["cy"]))) / Vector2(float(h["rx"]), float(h["ry"]))
		if q.length() >= float(h["inner"]) and q.length() <= float(h["outer"]):
			return true
	for prop in map_data["prop_colliders"]:
		var q = (pos - Vector2(float(prop["position"][0]), float(prop["position"][1]))) / Vector2(float(prop["radii"][0]), float(prop["radii"][1]))
		if q.length_squared() < 1.0:
			return true
	return false

func can_move(pos: Vector2, radius: float) -> bool:
	# Same four point samples as native canMv; hill and prop ellipses remain analytic.
	for corner in [Vector2(-radius, -radius), Vector2(radius, -radius), Vector2(-radius, radius), Vector2(radius, radius)]:
		if is_world_blocked(pos + corner):
			return false
	return true
