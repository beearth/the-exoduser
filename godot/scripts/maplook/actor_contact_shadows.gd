extends Node2D
## MAPLOOK-SHADOW: own ground nodes only. No actor/property/material/RNG writes.
const SHADER = preload("res://assets/vfx/maplook_actor_shadow.gdshader")
const GROUND_Z := -2004 # Above floor decals (-2005), below actors (minimum -2000).
const SCAN_SECONDS := 0.2
var _world: Node2D
var _player: Node2D
var _records: Dictionary = {}
var _feet_cache: Dictionary = {}
var _scan_left := 0.0
var _material: ShaderMaterial
var _mesh: QuadMesh
var _duplicates := 0
var _perspective := false

static func install(world: Node2D, _map_data: Dictionary, player: Node2D) -> Node2D:
	if not is_instance_valid(world) or not is_instance_valid(player): return null
	for child in world.get_children():
		if child.get_script() == load("res://scripts/maplook/actor_contact_shadows.gd"):
			return child
	var node: Node2D = load("res://scripts/maplook/actor_contact_shadows.gd").new()
	node.name = "MaplookActorContactShadows"
	node._world = world
	node._player = player
	node._material = ShaderMaterial.new()
	node._material.shader = SHADER
	node._mesh = QuadMesh.new()
	node._mesh.size = Vector2(144, 88)
	node.process_priority = 60
	world.add_child(node)
	node._process(0.0)
	return node

func _has_shadow(node: Node) -> bool:
	for child in node.get_children():
		if child is CanvasItem and child.is_visible_in_tree():
			var script: Script = child.get_script()
			if str(child.name).to_lower().contains("shadow") or (script != null and script.resource_path.ends_with("/player_shadow.gd")):
				return true
		if _has_shadow(child): return true
	return false

func _body(actor: Node2D) -> Sprite2D:
	var named := actor.get_node_or_null("Body") as Sprite2D
	if named != null and named.texture != null and named.is_visible_in_tree(): return named
	for child in actor.get_children():
		if child is Sprite2D and child.texture != null and child.is_visible_in_tree(): return child
	return null

func _enemy_foot(body: Sprite2D) -> Vector2:
	var texture: Texture2D = body.texture
	var area: Rect2 = body.region_rect if body.region_enabled else Rect2(Vector2.ZERO, texture.get_size())
	if not body.region_enabled:
		area.size /= Vector2(body.hframes, body.vframes)
		area.position = area.size * Vector2(body.frame_coords)
	var key := "%s:%s" % [texture.get_instance_id(), area]
	if not _feet_cache.has(key):
		var image := texture.get_image()
		var foot := Vector2(0.5, 1.0)
		if image != null and not image.is_empty():
			for y in range(int(area.end.y) - 1, int(area.position.y) - 1, -1):
				var count := 0
				var sum_x := 0.0
				for x in range(int(area.position.x), int(area.end.x)):
					if x >= 0 and y >= 0 and x < image.get_width() and y < image.get_height() and image.get_pixel(x, y).a > 0.18:
						count += 1
						sum_x += x + 0.5
				if count >= maxi(3, int(area.size.x * 0.025)):
					foot = Vector2((sum_x / count - area.position.x) / area.size.x, (y + 0.5 - area.position.y) / area.size.y)
					break
		_feet_cache[key] = foot
	var uv: Vector2 = _feet_cache[key]
	if body.flip_h: uv.x = 1.0 - uv.x
	if body.flip_v: uv.y = 1.0 - uv.y
	var rect := body.get_rect()
	return body.to_global(rect.position + rect.size * uv)

func _scan() -> void:
	var actors: Array = [_player]
	actors.append_array(get_tree().get_nodes_in_group("enemies"))
	for actor in actors:
		if not actor is Node2D or not is_instance_valid(actor) or not actor.is_inside_tree(): continue
		if actor != _player and not _world.is_ancestor_of(actor): continue
		var id: int = actor.get_instance_id()
		if _records.has(id): continue
		var surface := MeshInstance2D.new()
		surface.name = "ActorGroundShadow"
		surface.mesh = _mesh
		surface.material = _material
		surface.z_as_relative = false
		surface.z_index = GROUND_Z
		add_child(surface)
		_records[id] = {"actor": weakref(actor), "node": surface, "foot": Vector2.ZERO, "reason": "pending"}

func _process(delta: float) -> void:
	if not is_instance_valid(_world) or not is_instance_valid(_player):
		queue_free()
		return
	var main := _world.get_parent()
	_perspective = main != null and main.has_method("get_native_perspective_view_snapshot") and main.get_native_perspective_view_snapshot().get("ready") == true
	_scan_left -= delta
	if _scan_left <= 0.0:
		_scan_left = SCAN_SECONDS
		_scan()
	_duplicates = 0
	for id in _records.keys():
		var record: Dictionary = _records[id]
		var actor: Node2D = record.actor.get_ref()
		var surface: MeshInstance2D = record.node
		if not is_instance_valid(actor) or actor.is_queued_for_deletion() or not actor.is_inside_tree() or (actor != _player and (not _world.is_ancestor_of(actor) or not actor.is_in_group("enemies"))):
			surface.queue_free()
			_records.erase(id)
			continue
		surface.visible = false
		if _perspective or _has_shadow(actor):
			record.reason = "existing_shadow_or_perspective"
			_duplicates += 1
			continue
		if not actor.is_visible_in_tree() or ("alive" in actor and actor.get("alive") == false) or ("hp" in actor and float(actor.get("hp")) <= 0.0):
			record.reason = "hidden_or_dead"
			continue
		var foot: Vector2
		var opacity := 1.0
		if actor == _player:
			var meta: Dictionary = actor.get_native_projection_metadata() if actor.has_method("get_native_projection_metadata") else {}
			if meta.get("ready") != true or not meta.get("world_foot") is Vector2:
				record.reason = "player_anchor_unavailable"
				continue
			foot = meta.world_foot
			opacity = (meta.source as CanvasItem).modulate.a
		else:
			var body := _body(actor)
			if body == null:
				record.reason = "enemy_body_unavailable"
				continue
			foot = _enemy_foot(body)
			opacity = body.modulate.a
		if not foot.is_finite(): continue
		var radius: float = float(actor.get("radius")) if "radius" in actor else 20.0
		var size := clampf(radius / 22.0, 0.75, 2.1)
		surface.global_position = foot + Vector2(0, -2)
		surface.global_scale = Vector2.ONE * size
		surface.global_rotation = 0.0
		surface.self_modulate.a = clampf(opacity * actor.modulate.a, 0.0, 1.0)
		surface.visible = surface.self_modulate.a > 0.0
		record.foot = foot
		record.reason = "drawn"

func get_snapshot() -> Dictionary:
	var rows: Array = []
	var visible_count := 0
	for record in _records.values():
		var actor: Node2D = record.actor.get_ref()
		var node: MeshInstance2D = record.node
		if not is_instance_valid(actor): continue
		if node.visible: visible_count += 1
		rows.append({"actor": str(actor.name), "player": actor == _player, "visible": node.visible,
			"foot": [record.foot.x, record.foot.y], "z": node.z_index, "reason": record.reason})
	return {"tracked": rows.size(), "visible": visible_count, "duplicate_skipped": _duplicates,
		"perspective_skipped": _perspective, "ground_z": GROUND_Z, "cast_direction": [13, 9],
		"rng_calls": 0, "actor_writes": 0, "rows": rows}
