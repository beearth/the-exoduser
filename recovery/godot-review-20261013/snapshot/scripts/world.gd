class_name ExoduserWorld
extends Node2D

signal telemetry_event(kind: String, data: Dictionary)

const ENEMY_FACTORY = preload("res://scripts/enemy_factory.gd")
const MAP_FILE = "res://data/map.json"
const ENCOUNTERS_FILE = "res://data/encounters.json"
const ELLIPSE_SEGMENTS = 128

var map_data: Dictionary = {}
var player: Node2D
var _enemies: Array = []
var _chunks: Dictionary = {}
var _chunk_specs: Array = []
var _flow: PackedInt32Array
var _flow_target = Vector2i(-1, -1)
var _flow_clock = 0.0
var _tile_size = 40.0
var collision_count = 0
var ready_for_player = false
var _encounter_factory = ENEMY_FACTORY.new()
var _encounter_report: Dictionary = {}

func _ready() -> void:
	var encounters: Variant = JSON.parse_string(FileAccess.get_file_as_string(ENCOUNTERS_FILE))
	# Validate before creating world children. An invalid encounter source cannot
	# leave a partially installed enemy registry or emit spawn/ready events.
	if not _encounter_factory.validate_source(encounters)["valid"]:
		return
	map_data = JSON.parse_string(FileAccess.get_file_as_string(MAP_FILE))
	_tile_size = float(map_data["tile_size"])
	_build_collision()
	_build_props()
	_chunk_specs = map_data["chunks"]
	_update_visible_chunks(get_start_position(), true)
	install_native_encounters(encounters)
	ready_for_player = true
	telemetry_event.emit("world_ready", {"stage": 0, "tiles": 40000, "collision_shapes": collision_count, "source_tile_sha": map_data["source"]["native_tile_sha256"]})

func get_start_position() -> Vector2:
	var p: Array = map_data.get("start_position", [4020, 7420])
	return Vector2(float(p[0]), float(p[1]))

func get_exit_position() -> Vector2:
	var p: Array = map_data.get("exit_position", [4020, 300])
	return Vector2(float(p[0]), float(p[1]))

func get_enemies() -> Array:
	return _enemies

func install_native_encounters(source: Variant) -> Dictionary:
	var validation: Dictionary = _encounter_factory.validate_source(source)
	if not validation["valid"]:
		return validation
	if not _encounter_report.is_empty() or not _enemies.is_empty():
		return {"valid": false, "errors": ["already_installed"], "installed": false}
	var prepared: Dictionary = _encounter_factory.consume_atomic(source, self)
	if not prepared["valid"]:
		return prepared
	var instances: Array = prepared["instances"]
	prepared.erase("instances")
	prepared["installed"] = true
	_encounter_report = prepared
	_enemies = instances
	for enemy in _enemies:
		if is_instance_valid(player):
			enemy.set_player(player)
		enemy.telemetry_event.connect(_forward_event)
		add_child(enemy)
	telemetry_event.emit("native_encounters_installed", {"source_count": prepared["source_count"], "supported_count": prepared["supported_count"], "unsupported_count": prepared["unsupported_count"]})
	return get_encounter_report()

func get_encounter_report() -> Dictionary:
	return _encounter_report.duplicate(true)

func set_player(value: Node2D) -> void:
	player = value
	for enemy in _enemies:
		enemy.set_player(value)
	_build_flow()

func _forward_event(kind: String, data: Dictionary) -> void:
	telemetry_event.emit(kind, data)

func _process(delta: float) -> void:
	if not is_instance_valid(player):
		return
	_update_visible_chunks(player.global_position, false)
	_flow_clock += delta
	if _flow_clock >= 0.25:
		_flow_clock = fmod(_flow_clock, 0.25)
		_build_flow()

func _update_visible_chunks(center: Vector2, synchronous: bool) -> void:
	# Full native world data is retained. Only the original nearby 1000px plates are admitted.
	var half_view = get_viewport_rect().size * 0.5 + Vector2(1050, 1050)
	var cam := get_viewport().get_camera_2d()
	if cam:
		half_view = get_viewport_rect().size / cam.zoom * 0.5 + Vector2(1050, 1050)
	var visible_rect = Rect2(center - half_view, half_view * 2.0)
	for spec in _chunk_specs:
		var key = str(spec["x"]) + "," + str(spec["y"])
		var wr: Array = spec["world_rect"]
		var rect = Rect2(float(wr[0]), float(wr[1]), float(wr[2]), float(wr[3]))
		var wanted = rect.intersects(visible_rect)
		if _chunks.has(key):
			_chunks[key].visible = wanted
			continue
		if not wanted:
			continue
		var texture_path: String = spec["texture"]
		var texture: Texture2D
		if synchronous:
			texture = load(texture_path)
		else:
			var status = ResourceLoader.load_threaded_get_status(texture_path)
			if status == ResourceLoader.THREAD_LOAD_INVALID_RESOURCE:
				ResourceLoader.load_threaded_request(texture_path)
				continue
			if status != ResourceLoader.THREAD_LOAD_LOADED:
				continue
			texture = ResourceLoader.load_threaded_get(texture_path)
		var sprite = Sprite2D.new()
		sprite.texture = texture
		sprite.region_enabled = true
		sprite.region_rect = Rect2(1, 1, 1024, 1024)
		sprite.region_filter_clip_enabled = true
		sprite.position = rect.get_center()
		sprite.scale = Vector2.ONE * (1000.0 / 1024.0)
		sprite.z_index = -3000
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		add_child(sprite)
		_chunks[key] = sprite

func _build_collision() -> void:
	var body = StaticBody2D.new()
	body.name = "NativeMapCollision"
	body.collision_layer = 1
	body.collision_mask = 0
	add_child(body)
	for rect in map_data["collision_rects"]:
		var size = Vector2(float(rect[2]), float(rect[3]))
		var shape = RectangleShape2D.new()
		shape.size = size
		_add_shape(body, shape, Vector2(float(rect[0]), float(rect[1])) + size * 0.5)
	# Native isW treats positions outside the complete 8000px world as walls.
	for rect in [Rect2(-400, -400, 8800, 400), Rect2(-400, 8000, 8800, 400), Rect2(-400, 0, 400, 8000), Rect2(8000, 0, 400, 8000)]:
		var edge = RectangleShape2D.new()
		edge.size = rect.size
		_add_shape(body, edge, rect.get_center())
	for data in map_data["prop_colliders"]:
		var origin = Vector2(float(data["position"][0]), float(data["position"][1]))
		var radii = Vector2(float(data["radii"][0]), float(data["radii"][1]))
		if data["kind"] == "circle":
			var circle = CircleShape2D.new()
			circle.radius = radii.x
			_add_shape(body, circle, origin)
		else:
			# Original numeric ellipse remains in map_data/is_world_blocked.
			# Godot's physical ellipse is a 128-segment inscribed polygon, not changed source geometry.
			var points = PackedVector2Array()
			for i in ELLIPSE_SEGMENTS:
				var angle = TAU * float(i) / ELLIPSE_SEGMENTS
				points.append(Vector2(cos(angle) * radii.x, sin(angle) * radii.y))
			var polygon = ConvexPolygonShape2D.new()
			polygon.points = points
			_add_shape(body, polygon, origin)
	_build_hill_collision(body)

func _add_shape(body: StaticBody2D, shape: Shape2D, origin: Vector2) -> void:
	var node = CollisionShape2D.new()
	node.shape = shape
	node.position = origin
	body.add_child(node)
	collision_count += 1

func _build_hill_collision(body: StaticBody2D) -> void:
	var hill: Dictionary = map_data["hill"]
	var center = Vector2(float(hill["cx"]), float(hill["cy"])) * _tile_size
	var radii = Vector2(float(hill["rx"]), float(hill["ry"])) * _tile_size
	for i in ELLIPSE_SEGMENTS:
		var a = TAU * float(i) / ELLIPSE_SEGMENTS
		var b = TAU * float(i + 1) / ELLIPSE_SEGMENTS
		var mid = center + Vector2(cos((a + b) * 0.5) * radii.x, sin((a + b) * 0.5) * radii.y) * float(hill["inner"])
		if _hill_ramp_at(mid / _tile_size) >= 0.0:
			continue
		var points = PackedVector2Array()
		for sample in [[a, hill["inner"]], [a, hill["outer"]], [b, hill["outer"]], [b, hill["inner"]]]:
			points.append(Vector2(cos(float(sample[0])) * radii.x, sin(float(sample[0])) * radii.y) * float(sample[1]))
		var shape = ConvexPolygonShape2D.new()
		shape.points = points
		_add_shape(body, shape, center)

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

func has_line_of_sight(from: Vector2, to: Vector2) -> bool:
	var steps = maxi(1, int(from.distance_to(to) / 16.0))
	for i in range(1, steps):
		if is_world_blocked(from.lerp(to, float(i) / steps)):
			return false
	return true

func can_move(pos: Vector2, radius: float) -> bool:
	# Same four point samples as native canMv; hill and prop ellipses remain analytic.
	for corner in [Vector2(-radius, -radius), Vector2(radius, -radius), Vector2(-radius, radius), Vector2(radius, radius)]:
		if is_world_blocked(pos + corner):
			return false
	return true

func _build_props() -> void:
	for data in map_data["props"]:
		var sprite = Sprite2D.new()
		sprite.name = str(data["id"])
		sprite.texture = load(data["texture"])
		var size = Vector2(float(data["draw_size"][0]), float(data["draw_size"][1]))
		var pivot = Vector2(float(data["pivot"][0]), float(data["pivot"][1]))
		sprite.centered = false
		sprite.scale = size / sprite.texture.get_size()
		sprite.offset = -sprite.texture.get_size() * pivot
		sprite.position = Vector2(float(data["position"][0]), float(data["position"][1]))
		sprite.rotation_degrees = float(data["rotation_degrees"])
		sprite.flip_h = bool(data["flip_h"])
		sprite.modulate.a = float(data["alpha"])
		sprite.z_as_relative = false
		sprite.z_index = -2500 if data["ground"] else int(sprite.position.y / 4.0)
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		add_child(sprite)

func _build_flow() -> void:
	if not is_instance_valid(player):
		return
	var target = Vector2i(floori(player.global_position.x / 40.0), floori(player.global_position.y / 40.0))
	if target == _flow_target and not _flow.is_empty():
		return
	_flow_target = target
	_flow.resize(40000)
	_flow.fill(-1)
	if target.x < 0 or target.y < 0 or target.x >= 200 or target.y >= 200:
		return
	var queue = PackedInt32Array()
	queue.resize(40000)
	var head = 0
	var tail = 1
	var first = target.y * 200 + target.x
	queue[0] = first
	_flow[first] = 0
	while head < tail:
		var index = queue[head]
		head += 1
		var x = index % 200
		var y = int(index / 200)
		for offset in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1), Vector2i(1, 1), Vector2i(-1, 1), Vector2i(1, -1), Vector2i(-1, -1)]:
			var xx = x + offset.x
			var yy = y + offset.y
			if xx < 0 or yy < 0 or xx >= 200 or yy >= 200:
				continue
			var ni = yy * 200 + xx
			if _flow[ni] >= 0 or int(map_data["tiles"][ni]) == 1:
				continue
			if offset.x and offset.y and (int(map_data["tiles"][y * 200 + xx]) == 1 or int(map_data["tiles"][yy * 200 + x]) == 1):
				continue
			_flow[ni] = _flow[index] + 1
			queue[tail] = ni
			tail += 1

func get_path_direction(pos: Vector2) -> Vector2:
	if not is_instance_valid(player):
		return Vector2.ZERO
	if _flow.is_empty():
		_build_flow()
	var at = Vector2i(floori(pos.x / 40.0), floori(pos.y / 40.0))
	if at.x < 0 or at.y < 0 or at.x >= 200 or at.y >= 200:
		return (player.global_position - pos).normalized()
	var best = _flow[at.y * 200 + at.x]
	var chosen = at
	for dy in range(-1, 2):
		for dx in range(-1, 2):
			var n = at + Vector2i(dx, dy)
			if n.x < 0 or n.y < 0 or n.x >= 200 or n.y >= 200:
				continue
			var value = _flow[n.y * 200 + n.x]
			if dx and dy and (int(map_data["tiles"][at.y * 200 + n.x]) == 1 or int(map_data["tiles"][n.y * 200 + at.x]) == 1):
				continue
			if value >= 0 and (best < 0 or value < best):
				best = value
				chosen = n
	return (player.global_position - pos).normalized() if chosen == at else (Vector2(chosen) * 40.0 + Vector2(20, 20) - pos).normalized()
