extends Node2D
## MAP-LOOK (2026-10-20) — 맵 표현 강화 레이어. 사용자 결정: 맵은 웹판 1:1 이식 대신
## PoE2·No Rest for the Wicked 수준의 입체감·생동감·부분 광원으로 Godot에서 직접 만든다
## (docs/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md §1·G8·MAP-023/024,
##  docs/engine/FDG_GODOT_CUSTOM_STRATEGY_20261020.md §8).
## 게임플레이 데이터(충돌·동선·스폰·지역)·시뮬레이션은 건드리지 않는다. 표시 전용.
## 구성: 어두운 환경광(CanvasModulate) + 오브젝트 색 광원(PointLight2D, 깜빡임/박동)
##       + 그림 명암 기반 실시간 요철(셰이더, 노멀맵 파일 없음) + 나무 흔들림
##       + 나무 밑동 그림자(LightOccluder2D) + 포자·불씨 입자.
## 켜짐: 일반 실행 기본. 테스트 하니스(SceneTree 스크립트) 부팅은 꺼짐 — main 메타
## "native_map_look"="on" 또는 실행 인자 --map-look=on/off로 강제.

const DATA_FILE := "res://data/map_look_ch1.json"
const LIT_SHADER := preload("res://assets/vfx/map_look_lit.gdshader")
const SILHOUETTE_SHADER := preload("res://assets/vfx/map_look_silhouette.gdshader")
const PROP_DIR := "res://assets/map/props/"
const CHUNK_DIR := "res://assets/map/production_finish/"
const SYNC_INTERVAL := 0.2
# PC Codex 독립 모듈(있으면 설치): install(world, map_data, player) 계약.
const MODULES := ["res://scripts/maplook/spawn_hole_fx.gd", "res://scripts/maplook/toxic_surface.gd",
	"res://scripts/maplook/actor_contact_shadows.gd", "res://scripts/maplook/ground_mist.gd"]
const HOLE_SYNC_INTERVAL := 0.5

var active := false
var _main: Node
var _world: Node2D
var _player: Node2D
var _state: Node
var _screen_lighting: Node
var _data: Dictionary = {}
var _ambient: CanvasModulate
var _light_texture: Texture2D
var _dot_texture: Texture2D
var _chunk_material: ShaderMaterial
var _flat_prop_material: ShaderMaterial
var _player_light: PointLight2D
var _lights: Array = []          # {node, base_energy, flicker:[amp,speed], pulse:[amp,speed], phase}
var _hole_lights: Dictionary = {} # "x,y" -> row
var _occluders: Array = []
var _spores: CPUParticles2D
var _embers: CPUParticles2D
var _styled_chunks: Dictionary = {}
var _styled_props := 0
var _prop_shadows := 0
var _foreground: Array = []   # {node, anchor, size}
var _boundary_polygon := PackedVector2Array()
var _sync_left := 0.0
var _hole_sync_left := 0.0
var _time := 0.0
var _reason := "not_configured"
var _region_ambient: Array = []   # 지역 idx 0~3 → Color
var _ambient_target := Color()
var _flash_left := 0.0
var _flash_next := 0.0
var _flash_rng := RandomNumberGenerator.new()
var _shafts: Array = []          # {node, base_alpha, phase}
var _modules: Dictionary = {}    # 경로 → 설치된 노드
var _fx_lit: Dictionary = {}     # instance_id → true (광원 붙인 효과)
var _fx_scan_left := 0.0
var _fx_light_count := 0


static func install_native_boot(owner_main: Node, screen_lighting: Node) -> Node2D:
	var mode := str(owner_main.get_meta("native_map_look", "auto"))
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--map-look="):
			mode = arg.get_slice("=", 1)
	var harness_boot: bool = owner_main.get_tree() != null and owner_main.get_tree().get_script() != null
	if mode == "off" or (mode == "auto" and harness_boot):
		return null
	var look: Node2D = load("res://scripts/native_map_look.gd").new()
	look.name = "NativeMapLook"
	var world: Node2D = owner_main.get("world")
	if not is_instance_valid(world):
		return null
	world.add_child(look)
	if not look.configure(owner_main, screen_lighting):
		push_warning("MAP-LOOK not configured: " + look._reason)
		look.queue_free()
		return null
	return look


func configure(owner_main: Node, screen_lighting: Node) -> bool:
	_main = owner_main
	_world = owner_main.get("world")
	_player = owner_main.get("player")
	_state = owner_main.get("source_state")
	_screen_lighting = screen_lighting
	if not is_instance_valid(_world) or not is_instance_valid(_player):
		_reason = "world_player_required"
		return false
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(DATA_FILE))
	if not parsed is Dictionary:
		_reason = "data_unreadable"
		return false
	_data = parsed
	_light_texture = _make_radial_texture(256, [0.0, 0.35, 0.7, 1.0], [1.0, 0.62, 0.2, 0.0])
	_dot_texture = _make_radial_texture(16, [0.0, 0.5, 1.0], [1.0, 0.45, 0.0])
	_chunk_material = ShaderMaterial.new()
	_chunk_material.shader = LIT_SHADER
	_chunk_material.set_shader_parameter("bump_strength", 2.8)
	_flat_prop_material = ShaderMaterial.new()
	_flat_prop_material.shader = LIT_SHADER
	_flat_prop_material.set_shader_parameter("bump_strength", 2.2)
	# 1) 어둠: 원본 화면 오버레이의 어둠 단계 대신 실제 광원 기반 환경광.
	_ambient = CanvasModulate.new()
	_ambient.name = "MapLookAmbient"
	_ambient.color = _color(_data.get("ambient", [0.3, 0.3, 0.32]))
	add_child(_ambient)
	if is_instance_valid(_screen_lighting) and _screen_lighting.has_method("set_native_lightmap_enabled"):
		_screen_lighting.set_native_lightmap_enabled(false)
	# 2) 플레이어 광원(따라다님) + 오브젝트 광원.
	var pl: Dictionary = _data.get("player_light", {})
	_player_light = _make_light("player_light", pl)
	_lights.append(_light_row(_player_light, pl))
	_mount_object_lights()
	# 3) 그림 요철·흔들림 재질, 4) 나무 밑동 그림자.
	_style_props()
	_mount_prop_shadows()
	_mount_occluders()
	_mount_foreground()
	# 5) 생동감 입자.
	_mount_particles()
	_mount_light_shafts()
	_install_modules()
	for c in _data.get("region_ambient", []): _region_ambient.append(_color(c))
	_ambient_target = _ambient.color
	_flash_rng.seed = 20261020
	_flash_next = _flash_rng.randf_range(6.0, 14.0)
	active = true
	_reason = ""
	process_priority = 50
	set_process(true)
	return true


# ── 광원 ──────────────────────────────────────────────────────────────
func _make_light(light_name: String, spec: Dictionary) -> PointLight2D:
	var light := PointLight2D.new()
	light.name = light_name
	light.texture = _light_texture
	light.color = _color(spec.get("color", [1, 1, 1]))
	light.energy = float(spec.get("energy", 1.0))
	var radius: float = float(spec.get("radius", 300.0))
	# 요철(노멀) 조명은 N·L을 쓰므로 광원이 바닥에 낮게 붙으면 빛이 거의 안 닿는다 — 높이는 반경에 비례.
	light.height = radius * float(spec.get("height_ratio", 0.45))
	light.texture_scale = radius * 2.0 / 256.0
	# 기본 z 범위(±1024)는 바닥 청크(z -3000)·액터(y/4 ≈ 2000)를 못 비춘다.
	light.range_z_min = RenderingServer.CANVAS_ITEM_Z_MIN
	light.range_z_max = RenderingServer.CANVAS_ITEM_Z_MAX
	light.blend_mode = Light2D.BLEND_MODE_ADD
	if bool(spec.get("shadow", false)):
		light.shadow_enabled = true
		light.shadow_filter = Light2D.SHADOW_FILTER_PCF5
		light.shadow_filter_smooth = 2.0
		light.shadow_color = Color(0, 0, 0, 0.72)
	add_child(light)
	return light


func _light_row(light: PointLight2D, spec: Dictionary) -> Dictionary:
	return {"node": light, "base_energy": light.energy,
		"flicker": spec.get("flicker", []), "pulse": spec.get("pulse", []),
		"phase": fposmod(light.global_position.x * 0.0137 + light.global_position.y * 0.0091, TAU)}


func _prop_positions(prop_id: String) -> Array:
	var out: Array = []
	var map: Dictionary = _world.get("map_data")
	for prop in map.get("props", []):
		if str(prop.get("id")) == prop_id:
			out.append(Vector2(float(prop["position"][0]), float(prop["position"][1])))
	return out


func _mount_object_lights() -> void:
	for spec in _data.get("lights", []):
		var anchors: Array = _prop_positions(str(spec.get("prop", ""))) if spec.has("prop") \
			else [Vector2(float(spec["position"][0]), float(spec["position"][1]))]
		var nth: int = int(spec.get("nth", -1))
		for index in range(anchors.size()):
			if nth >= 0 and index != nth:
				continue
			var light := _make_light(str(spec.get("id")) + "_" + str(index), spec)
			var offset: Array = spec.get("offset", [0, 0])
			light.global_position = anchors[index] + Vector2(float(offset[0]), float(offset[1]))
			_lights.append(_light_row(light, spec))
	var tree: Dictionary = _data.get("tree_glow", {})
	var textures: Array = tree.get("textures", [])
	var map: Dictionary = _world.get("map_data")
	for prop in map.get("props", []):
		if not str(prop.get("texture", "")).get_file() in textures:
			continue
		var spec := tree.duplicate(true)
		spec["radius"] = float(prop["draw_size"][0]) * float(tree.get("radius_scale", 0.5))
		var light := _make_light("tree_glow_" + str(prop.get("id")), spec)
		light.global_position = Vector2(float(prop["position"][0]), float(prop["position"][1]))
		_lights.append(_light_row(light, spec))


func _sync_spawn_hole_lights() -> void:
	if not is_instance_valid(_state) or not _state.has_method("read_current_g"):
		return
	var g: Variant = _state.read_current_g()
	if not g is Dictionary or not g.get("spawnHoles") is Array:
		return
	var spec: Dictionary = _data.get("spawn_hole_light", {})
	var seen: Dictionary = {}
	for hole in g["spawnHoles"]:
		if not hole is Dictionary:
			continue
		var key := "%d,%d" % [int(hole.get("x", 0)), int(hole.get("y", 0))]
		seen[key] = true
		if _hole_lights.has(key):
			continue
		var row_spec := spec.duplicate(true)
		row_spec["radius"] = float(spec.get("radius_base", 220)) + float(hole.get("size", 0.3)) * float(spec.get("radius_per_size", 160))
		var light := _make_light("spawn_hole_" + key, row_spec)
		light.global_position = Vector2(float(hole.get("x", 0)), float(hole.get("y", 0)))
		var row := _light_row(light, row_spec)
		_lights.append(row)
		_hole_lights[key] = row
	for key in _hole_lights.keys():
		if not seen.has(key):
			var row: Dictionary = _hole_lights[key]
			_lights.erase(row)
			if is_instance_valid(row["node"]):
				row["node"].queue_free()
			_hole_lights.erase(key)


# ── 재질(요철·흔들림) ─────────────────────────────────────────────────
func _style_props() -> void:
	var sway: Dictionary = _data.get("sway", {})
	var sway_textures: Array = sway.get("textures", [])
	var world_px: float = float(sway.get("world_px", 5.0))
	for child in _world.get_children():
		if not child is Sprite2D or child.material != null or child.texture == null:
			continue
		var path: String = child.texture.resource_path
		if not path.begins_with(PROP_DIR):
			continue
		if path.get_file() in sway_textures:
			var material := ShaderMaterial.new()
			material.shader = LIT_SHADER
			material.set_shader_parameter("bump_strength", 2.2)
			material.set_shader_parameter("sway_amp", world_px / maxf(absf(child.scale.x), 0.01))
			material.set_shader_parameter("sway_phase", fposmod(child.position.x * 0.013 + child.position.y * 0.007, TAU))
			material.set_shader_parameter("sway_speed", 0.45 + fposmod(child.position.x * 0.0031, 0.25))
			child.material = material
		else:
			child.material = _flat_prop_material
		_styled_props += 1


func _style_chunks() -> void:
	var chunks: Variant = _world.get("_chunks")
	if not chunks is Dictionary:
		return
	for key in chunks:
		var sprite: Variant = chunks[key]
		if _styled_chunks.has(key) or not is_instance_valid(sprite):
			continue
		if sprite.texture != null and str(sprite.texture.resource_path).begins_with(CHUNK_DIR):
			sprite.material = _chunk_material
			_styled_chunks[key] = true


# ── 입체감: 소품 투사 그림자(월드 광원 북서 → 그림자 남동, MAP-012) ───────────
func _silhouette_material(tint: Color, blur: float) -> ShaderMaterial:
	var material := ShaderMaterial.new()
	material.shader = SILHOUETTE_SHADER
	material.set_shader_parameter("tint", tint)
	material.set_shader_parameter("blur_px", blur)
	return material


func _mount_prop_shadows() -> void:
	var spec: Dictionary = _data.get("prop_shadow", {})
	var skip: Array = spec.get("skip_textures", [])
	var upright: Array = spec.get("upright_textures", [])
	var offset_k: Array = spec.get("offset", [0.07, 0.05])
	var tint := _color(spec.get("tint", [0.0, 0.0, 0.0, 0.5]))
	for child in _world.get_children():
		if not child is Sprite2D or child.texture == null or child.z_index <= -2500:
			continue
		var path: String = child.texture.resource_path
		if not path.begins_with(PROP_DIR) or path.get_file() in skip:
			continue
		var tex_size: Vector2 = child.texture.get_size()
		var draw_size: Vector2 = tex_size * child.scale.abs()
		var shadow := Sprite2D.new()
		shadow.name = "shadow_" + str(child.name)
		shadow.texture = child.texture
		shadow.centered = false
		shadow.flip_h = child.flip_h
		shadow.offset = child.offset
		shadow.rotation = child.rotation
		shadow.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		shadow.z_as_relative = false
		shadow.z_index = child.z_index - 1
		if path.get_file() in upright:
			# 옆에서 본 세로 소품: 밑동을 축으로 눕혀 남동쪽으로 늘인다.
			shadow.scale = Vector2(child.scale.x, -child.scale.y * 0.42)
			shadow.skew = deg_to_rad(-38.0)
			shadow.position = child.position + Vector2(draw_size.x * 0.05, draw_size.y * 0.5)
			shadow.material = _silhouette_material(Color(tint.r, tint.g, tint.b, tint.a * 0.85), 5.0)
		else:
			shadow.scale = child.scale * float(spec.get("scale", 1.0))
			shadow.position = child.position + Vector2(draw_size.x * float(offset_k[0]), draw_size.y * float(offset_k[1]))
			shadow.material = _silhouette_material(tint, float(spec.get("blur_px", 10.0)))
		add_child(shadow)
		_prop_shadows += 1


# ── 원근감: 맵 가장자리 전경 실루엣(카메라보다 빠르게 움직이는 흐린 근경) ──────
func _mount_foreground() -> void:
	var spec: Dictionary = _data.get("foreground", {})
	if not bool(spec.get("enabled", true)):
		return
	var map: Dictionary = _world.get("map_data")
	var tile: float = float(map.get("tile_size", 40))
	var boundary: Array = map.get("boundary", [])
	if boundary.size() < 3:
		return
	var centroid := Vector2.ZERO
	for point in boundary:
		centroid += Vector2(float(point[0]), float(point[1])) * tile
		_boundary_polygon.append(Vector2(float(point[0]), float(point[1])) * tile)
	centroid /= float(boundary.size())
	var textures: Array = spec.get("textures", [])
	var step: int = maxi(1, int(spec.get("every", 2)))
	var push: float = float(spec.get("push_out", 320.0))
	var size_range: Array = spec.get("size", [760, 1040])
	var rng := RandomNumberGenerator.new()
	rng.seed = 20261020
	var tint := _color(spec.get("tint", [0.02, 0.015, 0.02, 0.9]))
	for index in range(0, boundary.size(), step):
		var p := Vector2(float(boundary[index][0]), float(boundary[index][1])) * tile
		var out_dir: Vector2 = (p - centroid).normalized()
		var anchor: Vector2 = p + out_dir * push
		var texture: Texture2D = load(PROP_DIR + str(textures[index % textures.size()]))
		if texture == null:
			continue
		var size: float = rng.randf_range(float(size_range[0]), float(size_range[1]))
		var sprite := Sprite2D.new()
		sprite.name = "foreground_%d" % index
		sprite.texture = texture
		sprite.scale = Vector2.ONE * size / texture.get_size().x
		sprite.rotation = rng.randf_range(-PI, PI)
		sprite.flip_h = rng.randf() < 0.5
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		sprite.material = _silhouette_material(tint, float(spec.get("blur_px", 7.0)))
		sprite.z_as_relative = false
		sprite.z_index = 3995
		sprite.global_position = anchor
		add_child(sprite)
		_foreground.append({"node": sprite, "anchor": anchor, "size": size, "alpha": tint.a})


func _update_foreground(center: Vector2) -> void:
	var parallax: float = float(_data.get("foreground", {}).get("parallax", 0.14))
	for row in _foreground:
		var sprite: Sprite2D = row["node"]
		if not is_instance_valid(sprite):
			continue
		sprite.global_position = row["anchor"] + (row["anchor"] - center) * parallax
		# 근경이 걷는 바닥으로 들어오거나 플레이어를 덮으면 옅게(전경은 걷는 바닥을
		# 3% 넘게 덮지 않는다 — MAP 결정 2026-10-01, 가림 시 캐릭터 우선 MAP-002).
		var d: float = sprite.global_position.distance_to(_player.global_position)
		var near: float = float(row["size"]) * 0.5
		var k: float = clampf((d - near * 0.7) / (near * 0.6), 0.0, 1.0)
		if not _boundary_polygon.is_empty() and Geometry2D.is_point_in_polygon(sprite.global_position, _boundary_polygon):
			k *= 0.35
		(sprite.material as ShaderMaterial).set_shader_parameter("tint", Color(0.02, 0.015, 0.02, lerpf(0.28, float(row["alpha"]), k)))


# ── 그림자 ────────────────────────────────────────────────────────────
func _mount_occluders() -> void:
	var map: Dictionary = _world.get("map_data")
	var scale_k: float = float(_data.get("occluder_radius_scale", 0.7))
	for collider in map.get("prop_colliders", []):
		if str(collider.get("kind")) != "circle":
			continue
		var radii: Array = collider.get("radii", [0, 0])
		var rx: float = float(radii[0]) * scale_k
		var ry: float = float(radii[1]) * scale_k
		if rx < 8.0:
			continue
		var polygon := PackedVector2Array()
		for i in range(12):
			var a := TAU * float(i) / 12.0
			polygon.append(Vector2(cos(a) * rx, sin(a) * ry))
		var shape := OccluderPolygon2D.new()
		shape.polygon = polygon
		shape.closed = true
		shape.cull_mode = OccluderPolygon2D.CULL_DISABLED
		var occ := LightOccluder2D.new()
		occ.name = "occluder_" + str(collider.get("id"))
		occ.occluder = shape
		occ.global_position = Vector2(float(collider["position"][0]), float(collider["position"][1]))
		add_child(occ)
		_occluders.append(occ)


# ── 생동감 입자 ───────────────────────────────────────────────────────
func _particle_material() -> CanvasItemMaterial:
	var material := CanvasItemMaterial.new()
	material.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material.light_mode = CanvasItemMaterial.LIGHT_MODE_UNSHADED
	return material


func _mount_particles() -> void:
	var spores: Dictionary = _data.get("spores", {})
	_spores = CPUParticles2D.new()
	_spores.name = "MapLookSpores"
	_spores.texture = _dot_texture
	_spores.material = _particle_material()
	_spores.amount = int(spores.get("amount", 90))
	_spores.lifetime = float(spores.get("lifetime", 9.0))
	_spores.preprocess = _spores.lifetime
	_spores.local_coords = false
	_spores.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	_spores.emission_rect_extents = Vector2(1160, 680)
	_spores.direction = Vector2(0.3, -1.0)
	_spores.spread = 60.0
	_spores.gravity = Vector2(4.0, -5.0)
	_spores.initial_velocity_min = 4.0
	_spores.initial_velocity_max = 16.0
	var size: Array = spores.get("size", [1.6, 3.4])
	_spores.scale_amount_min = float(size[0]) / 16.0
	_spores.scale_amount_max = float(size[1]) / 16.0
	_spores.color = _color(spores.get("color", [0.8, 0.9, 0.6, 0.5]))
	_spores.color_ramp = _fade_ramp()
	_spores.z_as_relative = false
	_spores.z_index = 3990
	add_child(_spores)
	var embers: Dictionary = _data.get("embers", {})
	var at: Array = _prop_positions(str(embers.get("prop", "")))
	if not at.is_empty():
		_embers = CPUParticles2D.new()
		_embers.name = "MapLookEmbers"
		_embers.texture = _dot_texture
		_embers.material = _particle_material()
		_embers.amount = int(embers.get("amount", 34))
		_embers.lifetime = float(embers.get("lifetime", 2.6))
		_embers.preprocess = _embers.lifetime
		_embers.local_coords = false
		_embers.global_position = at[0] + Vector2(0, -16)
		_embers.emission_shape = CPUParticles2D.EMISSION_SHAPE_SPHERE
		_embers.emission_sphere_radius = 46.0
		_embers.direction = Vector2(0, -1)
		_embers.spread = 28.0
		_embers.gravity = Vector2(6.0, -28.0)
		_embers.initial_velocity_min = 18.0
		_embers.initial_velocity_max = 52.0
		_embers.scale_amount_min = 0.18
		_embers.scale_amount_max = 0.42
		_embers.color = _color(embers.get("color", [1.0, 0.55, 0.22, 0.9]))
		_embers.color_ramp = _fade_ramp()
		_embers.z_as_relative = false
		_embers.z_index = 3991
		add_child(_embers)


func _fade_ramp() -> Gradient:
	var ramp := Gradient.new()
	ramp.offsets = PackedFloat32Array([0.0, 0.2, 0.75, 1.0])
	ramp.colors = PackedColorArray([Color(1, 1, 1, 0), Color(1, 1, 1, 1), Color(1, 1, 1, 0.8), Color(1, 1, 1, 0)])
	return ramp


# ── 생동감·지역: 빛줄기, 지역별 환경광, 번개 지역 섬광 ─────────────────────────
func _mount_light_shafts() -> void:
	var spec: Dictionary = _data.get("light_shafts", {})
	var along := _make_shaft_texture()
	var material := CanvasItemMaterial.new()
	material.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	material.light_mode = CanvasItemMaterial.LIGHT_MODE_UNSHADED
	var tint := _color(spec.get("color", [0.85, 0.80, 0.70, 0.10]))
	var angle: float = deg_to_rad(float(spec.get("angle_deg", -32.0)))
	for index in range(spec.get("shafts", []).size()):
		var row: Array = spec["shafts"][index]
		var shaft := Sprite2D.new()
		shaft.name = "light_shaft_%d" % index
		shaft.texture = along
		shaft.material = material
		shaft.global_position = Vector2(float(row[0]), float(row[1]))
		shaft.rotation = angle
		# 폭은 텍스처 가로 64px → row[2], 길이 256px → row[3]
		shaft.scale = Vector2(float(row[2]) / 64.0, float(row[3]) / 256.0)
		shaft.modulate = tint
		shaft.z_as_relative = false
		shaft.z_index = 3985
		add_child(shaft)
		_shafts.append({"node": shaft, "base_alpha": tint.a, "phase": float(index) * 1.7})
		# 빛줄기가 바닥에 닿는 끝(텍스처 아래쪽 80%)에 옅은 광원 — 바닥을 실제로 비춤.
		var foot: Vector2 = shaft.global_position + Vector2(0.0, float(row[3]) * 0.4).rotated(angle)
		var pool := _make_light("shaft_pool_%d" % index, {"color": spec.get("pool_color", [0.80, 0.82, 0.86]),
			"radius": float(row[2]) * 1.1, "energy": float(spec.get("pool_energy", 0.45)), "height_ratio": 0.8})
		pool.global_position = foot
		_lights.append(_light_row(pool, {"pulse": [0.12, 0.25]}))
		# 빛줄기 안의 먼지
		var dust := CPUParticles2D.new()
		dust.name = "shaft_dust_%d" % index
		dust.texture = _dot_texture
		dust.material = _particle_material()
		dust.amount = int(spec.get("dust", 14))
		dust.lifetime = 7.0
		dust.preprocess = 7.0
		dust.local_coords = false
		dust.global_position = shaft.global_position
		dust.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
		dust.emission_rect_extents = Vector2(float(row[2]) * 0.35, float(row[3]) * 0.35)
		dust.rotation = angle
		dust.gravity = Vector2(2.0, 3.0)
		dust.initial_velocity_min = 2.0
		dust.initial_velocity_max = 8.0
		dust.spread = 180.0
		dust.scale_amount_min = 0.25
		dust.scale_amount_max = 0.5
		dust.color = Color(1.0, 0.95, 0.85, 0.35)
		dust.color_ramp = _fade_ramp()
		dust.z_as_relative = false
		dust.z_index = 3986
		add_child(dust)


## 빛줄기 텍스처: 길이 방향(위 → 아래) 서서히 생겨 바닥 끝에서 살짝 고였다 사라지고,
## 폭 방향은 가장자리로 부드럽게 사라진다(딱딱한 띠 방지). 절차 생성, 파일 없음.
static func _make_shaft_texture() -> Texture2D:
	var w := 64
	var h := 256
	var image := Image.create(w, h, false, Image.FORMAT_RGBA8)
	for y in range(h):
		var v := float(y) / float(h - 1)
		var along := smoothstep(0.0, 0.25, v) * (0.55 + 0.45 * smoothstep(0.55, 0.9, v)) * (1.0 - smoothstep(0.9, 1.0, v))
		for x in range(w):
			var u := absf(float(x) / float(w - 1) * 2.0 - 1.0)
			var across := pow(1.0 - smoothstep(0.0, 1.0, u), 1.6)
			image.set_pixel(x, y, Color(1, 1, 1, clampf(along * across, 0.0, 1.0)))
	return ImageTexture.create_from_image(image)


func _install_modules() -> void:
	for path in MODULES:
		if not ResourceLoader.exists(path):
			continue
		var script: Script = load(path)
		if script == null or not script.get_script_method_list().any(func(m): return m.name == "install"):
			continue
		var node: Variant = script.call("install", _world, _world.get("map_data"), _player)
		if node is Node:
			_modules[path.get_file().get_basename()] = node


# ── 생동감(전투): 날아가는 투사체·검기·피격 섬광이 주변을 비춘다(PoE2식 동적 광원) ──
static func _script_paths(node: Node) -> PackedStringArray:
	var out := PackedStringArray()
	var script: Script = node.get_script()
	while script != null:
		if not script.resource_path.is_empty():
			out.append(script.resource_path.get_file())
		script = script.get_base_script()
	return out


func _scan_fx_lights() -> void:
	var table: Dictionary = _data.get("fx_lights", {})
	if table.is_empty():
		return
	var limit: int = int(_data.get("fx_light_limit", 18))
	var alive := 0
	var fresh: Dictionary = {}
	for parent in [_main, _world]:
		if not is_instance_valid(parent):
			continue
		for node in parent.get_children():
			if not node is Node2D or node.is_queued_for_deletion():
				continue
			var id: int = node.get_instance_id()
			if _fx_lit.has(id):
				fresh[id] = true
				alive += 1
				continue
			var spec: Dictionary = {}
			for file in _script_paths(node):
				if table.has(file):
					spec = table[file]
					break
			if spec.is_empty() or alive >= limit:
				continue
			var light := PointLight2D.new()
			light.name = "MapLookFxLight"
			light.texture = _light_texture
			light.color = _color(spec.get("color", [1, 1, 1]))
			light.energy = float(spec.get("energy", 0.8))
			var radius: float = float(spec.get("radius", 200.0))
			light.texture_scale = radius * 2.0 / 256.0
			light.height = radius * 0.5
			light.range_z_min = RenderingServer.CANVAS_ITEM_Z_MIN
			light.range_z_max = RenderingServer.CANVAS_ITEM_Z_MAX
			node.add_child(light)
			fresh[id] = true
			alive += 1
	_fx_lit = fresh
	_fx_light_count = alive


func _update_region_ambient(delta: float) -> void:
	if _region_ambient.size() != 4 or not is_instance_valid(_state):
		return
	var g: Variant = _state.read_current_g()
	if not g is Dictionary or not g.get("_regions") is Array:
		return
	var tile: float = float(_world.get("map_data").get("tile_size", 40))
	var p: Vector2 = _player.global_position / tile
	var idx: int = (0 if p.y < float(g.get("_regMidY", 0)) else 2) + (0 if p.x < float(g.get("_regMidX", 0)) else 1)
	_ambient_target = _region_ambient[idx]
	var base: Color = _ambient.color.lerp(_ambient_target, clampf(delta * 0.6, 0.0, 1.0)) if _flash_left <= 0.0 else _ambient.color
	# 번개 지역(북동=1): 먼 번개 섬광 — 짧게 두 번 번쩍.
	var spec: Dictionary = _data.get("lightning", {})
	if idx == int(spec.get("region", 1)):
		_flash_next -= delta
		if _flash_next <= 0.0:
			_flash_left = float(spec.get("duration", 0.42))
			_flash_next = _flash_rng.randf_range(float(spec.get("every", [7.0, 16.0])[0]), float(spec.get("every", [7.0, 16.0])[1]))
	if _flash_left > 0.0:
		_flash_left -= delta
		var t: float = 1.0 - _flash_left / float(spec.get("duration", 0.42))
		var k: float = maxf(0.0, sin(t * PI * 2.0)) * (1.0 if t < 0.5 else 0.6)
		var flash := _color(spec.get("color", [0.55, 0.62, 0.85]))
		_ambient.color = _ambient_target.lerp(flash, k * float(spec.get("strength", 0.55)))
	else:
		_ambient.color = base


# ── 매 프레임 ─────────────────────────────────────────────────────────
func _process(delta: float) -> void:
	if not active or not is_instance_valid(_player):
		return
	_time += delta
	_player_light.global_position = _player.global_position + Vector2(0, -20)
	var camera: Camera2D = get_viewport().get_camera_2d()
	_update_foreground(camera.get_screen_center_position() if is_instance_valid(camera) else _player.global_position)
	if is_instance_valid(_spores):
		_spores.global_position = camera.get_screen_center_position() if is_instance_valid(camera) else _player.global_position
	for row in _lights:
		var light: PointLight2D = row["node"]
		if not is_instance_valid(light):
			continue
		var k := 1.0
		var flicker: Array = row["flicker"]
		if flicker.size() == 2:
			var s: float = float(flicker[1])
			k += float(flicker[0]) * (0.6 * sin(_time * s + row["phase"]) + 0.4 * sin(_time * s * 2.71 + row["phase"] * 3.1))
		var pulse: Array = row["pulse"]
		if pulse.size() == 2:
			k += float(pulse[0]) * sin(_time * float(pulse[1]) * TAU * 0.5 + row["phase"])
		light.energy = maxf(0.0, row["base_energy"] * k)
	_update_region_ambient(delta)
	for shaft_row in _shafts:
		var shaft: Sprite2D = shaft_row["node"]
		shaft.modulate.a = shaft_row["base_alpha"] * (0.75 + 0.25 * sin(_time * 0.37 + shaft_row["phase"]))
	_fx_scan_left -= delta
	if _fx_scan_left <= 0.0:
		_fx_scan_left = 0.1
		_scan_fx_lights()
	_sync_left -= delta
	if _sync_left <= 0.0:
		_sync_left = SYNC_INTERVAL
		_style_chunks()
	_hole_sync_left -= delta
	if _hole_sync_left <= 0.0:
		_hole_sync_left = HOLE_SYNC_INTERVAL
		_sync_spawn_hole_lights()


# ── 도구 ──────────────────────────────────────────────────────────────
static func _color(values: Array) -> Color:
	return Color(float(values[0]), float(values[1]), float(values[2]), float(values[3]) if values.size() > 3 else 1.0)


static func _make_radial_texture(size: int, offsets: Array, alphas: Array) -> Texture2D:
	var gradient := Gradient.new()
	gradient.offsets = PackedFloat32Array(offsets)
	var colors := PackedColorArray()
	for a in alphas:
		colors.append(Color(1, 1, 1, float(a)))
	gradient.colors = colors
	var texture := GradientTexture2D.new()
	texture.gradient = gradient
	texture.width = size
	texture.height = size
	texture.fill = GradientTexture2D.FILL_RADIAL
	texture.fill_from = Vector2(0.5, 0.5)
	texture.fill_to = Vector2(1.0, 0.5)
	return texture


func get_native_map_look_snapshot() -> Dictionary:
	return {"active": active, "reason": _reason, "lights": _lights.size(),
		"spawn_hole_lights": _hole_lights.size(), "occluders": _occluders.size(),
		"styled_props": _styled_props, "prop_shadows": _prop_shadows, "foreground": _foreground.size(), "styled_chunks": _styled_chunks.size(),
		"ambient": [_ambient.color.r, _ambient.color.g, _ambient.color.b] if is_instance_valid(_ambient) else [],
		"light_shafts": _shafts.size(), "modules": _modules.keys(), "fx_lights": _fx_light_count, "region_ambient": _region_ambient.size(), "spores": is_instance_valid(_spores), "embers": is_instance_valid(_embers),
		"lightmap_overlay_enabled": _screen_lighting.call("is_native_lightmap_enabled") \
			if is_instance_valid(_screen_lighting) and _screen_lighting.has_method("is_native_lightmap_enabled") else null}
