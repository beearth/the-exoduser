extends Node
## Explicit native presentation candidate. Simulation owners and source assets
## remain unchanged. The full old custom-draw/VFX pipeline is not ported here.
const FLOOR_OWNER_PATH := "res://port_modules/map_resource/floor_display_owner.gd"
const FLOOR_PACKET_SCHEMA := "exoduser.godot.ch1-native-first.floor-draw-packet.v1"
const WALL_PACKET_SCHEMA := "exoduser.godot.ch1-native-first.wall-draw-packet.v1"
const SOURCE_PLAYER_SHADOW = preload("res://port_modules/character_clip/player_shadow.gd")
# Presentation depth bias only; this is not a supplied terrain elevation.
const PLAYER_SHADOW_RENDER_Y := -0.01
var _player_shadow: MeshInstance3D
var _player_shadow_status: Dictionary = {"ready":false,"reason":"not_synchronized"}
var _owned_floor: Node2D
var _sphere_views: Dictionary = {}
var _radiant_shader: Shader
var _ink_shader: Shader # P2-007a 기검참 잉크 층(일반 합성) 지면 미러
var _max_mass_height := 0.0
var _mass_rows: Dictionary = {}
var _mass_meshes: Dictionary = {}
var _mass_status: Dictionary = {"ready":false,"reason":"not_mounted"}
var _mass_texture_cache: Dictionary = {}
var _native_material_selection: Dictionary = {}
var _mass_camera_cell := Vector2i(-999999,-999999)
var _mass_refresh_size := Vector2i.ZERO
var _map_draw_owner: WeakRef
var _map_draw_owner_script: Script
const DEFAULTS := {"yaw":0.0, "pitch":0.85, "distance":1400.0, "zoom":1.0, "near":32.0}
var _main_script: Script
var _player_script: Script
var _world_script: Script
var _player: Node2D
var _world: Node2D
var _main: Node2D
var _viewport: SubViewport
var _scene: Node3D
var _camera: Camera3D
var _layer: CanvasLayer
var _display: TextureRect
var _mirrors: Dictionary = {}
var _baked_sources: Dictionary = {}
var _baked_candidate_ids: Dictionary = {}
var _baked_status: Dictionary = {"ready":false,"reason":"not_mounted"}
var _settings: Dictionary = {}
var _mounted := false
var _ground_bounds := Rect2()
var _ground_camera_clamp: Dictionary = {}
var _e_wave_mesh: MultiMeshInstance3D
var _e_wave_visible := 0

func mount(main: Node2D, settings: Dictionary = {}) -> Dictionary:
	if _mounted or not is_instance_valid(main) or get_parent() != main or not main.is_inside_tree() \
			or not is_instance_valid(main.get("player")) or not is_instance_valid(main.get("world")):
		return {"ready":false, "reason":"missing_actual_main_owners"}
	_settings = DEFAULTS.duplicate()
	for key in settings:
		if not _settings.has(key) or not (settings[key] is int or settings[key] is float) or not is_finite(float(settings[key])):
			return {"ready":false, "reason":"invalid_camera_setting"}
		_settings[key] = float(settings[key])
	if absf(_settings.yaw) > PI or _settings.pitch < 0.35 or _settings.pitch > 1.1 \
			or _settings.distance < 600 or _settings.distance > 6000 or _settings.zoom < 0.25 \
			or _settings.zoom > 2 or _settings.near < 8 or _settings.near > 128:
		return {"ready":false, "reason":"camera_setting_out_of_range"}
	_main = main
	_player = main.player
	_world = main.world
	_main_script = main.get_script()
	_player_script = _player.get_script()
	_world_script = _world.get_script()
	_viewport = SubViewport.new()
	_viewport.name = "PerspectiveViewport"
	_viewport.size = Vector2i(main.get_viewport_rect().size)
	_viewport.world_3d = World3D.new()
	_viewport.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	add_child(_viewport)
	_scene = Node3D.new()
	_viewport.add_child(_scene)
	_camera = Camera3D.new()
	_camera.name = "PerspectiveCamera"
	_camera.keep_aspect = Camera3D.KEEP_HEIGHT
	_scene.add_child(_camera)
	_camera.make_current()
	var env := Environment.new()
	env.background_mode = Environment.BG_COLOR
	env.background_color = Color(0.035, 0.04, 0.035)
	_camera.environment = env
	if not _mount_actual_floor_passes():
		dispose()
		return {"ready":false, "reason":"actual_ground_shader_binding_missing"}
	_layer = CanvasLayer.new()
	_layer.name = "PerspectivePresentation"
	_layer.layer = 0
	add_child(_layer)
	_display = TextureRect.new()
	_display.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_display.texture = _viewport.get_texture()
	_display.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_display.set_anchors_and_offsets_preset(Control.PRESET_TOP_LEFT)
	_layer.add_child(_display)
	_mounted = true
	_sync_camera()
	_sync_sprites()
	_sync_player_contact_shadow()
	var pointer := Callable(self, "read_ground_pointer")
	if not main.player.bind_native_ground_pointer(pointer):
		dispose()
		return {"ready":false, "reason":"actual_player_pointer_binding_rejected"}
	set_process(true)
	return get_snapshot()

func _mount_actual_floor_passes() -> bool:
	var adapter: Node = _main.world.get_node_or_null("NativeGroundSurface/OriginalSoilLitterSurface")
	if adapter == null or adapter.get_child_count() != 2:
		return false
	var index := 0
	for pass_node in adapter.get_children():
		var original: ShaderMaterial = pass_node.get("material") as ShaderMaterial
		if original == null or original.shader == null:
			return false
		var bounds := Rect2(pass_node.position, pass_node.size)
		if index == 0:
			_ground_bounds = bounds
		elif bounds != _ground_bounds:
			return false
		var code: String = original.shader.code.replace("shader_type canvas_item;", "shader_type spatial;\nrender_mode unshaded, cull_disabled;")
		code = code.replace("COLOR = c;", "ALBEDO = c.rgb; ALPHA = c.a;")
		var shader := Shader.new()
		shader.code = code
		var material := ShaderMaterial.new()
		material.shader = shader
		material.render_priority = -100 + index
		for uniform in original.shader.get_shader_uniform_list():
			material.set_shader_parameter(uniform.name, original.get_shader_parameter(uniform.name))
		var mesh := PlaneMesh.new()
		mesh.size = pass_node.size
		var plane := MeshInstance3D.new()
		plane.name = str(pass_node.name)
		plane.mesh = mesh
		plane.material_override = material
		plane.position = Vector3(pass_node.size.x * 0.5, -2.0 + index * 0.1, pass_node.size.y * 0.5)
		_scene.add_child(plane)
		index += 1
	return true

func _process(_delta: float) -> void:
	if not _live():
		if _mounted: dispose()
		return
	_sync_camera()
	_sync_sprites()
	_sync_player_contact_shadow()
	_sync_visible_masses()
	_sync_e_wave_particles()

func _sync_camera() -> void:
	var size := Vector2i(_main.get_viewport_rect().size)
	_viewport.size = size
	_display.size = Vector2(size)
	var distance: float = _settings.distance
	var pitch: float = _settings.pitch
	var yaw: float = _settings.yaw
	var center: Vector2 = _main.player.global_position
	var target := Vector3(center.x, 0.0, center.y)
	_camera.position = target + Vector3(sin(yaw) * cos(pitch), sin(pitch), cos(yaw) * cos(pitch)) * distance
	_camera.look_at(target, Vector3.UP)
	_camera.set_perspective(rad_to_deg(2.0 * atan(float(size.y) / (2.0 * distance * float(_settings.zoom)))), float(_settings.near), 16000.0)
	# R36376-36379 keeps the actual visible footprint inside the map. The
	# perspective ground footprint is asymmetric, so a 2D half-height is wrong.
	var before: Dictionary = _camera_ground_footprint()
	_ground_camera_clamp = {"ready":false,"reason":before.get("reason","ground_bounds_missing"),"map_bounds":_ground_bounds,"requested_center":center,"center":center,"applied":false,"source":"R36376-36379 CAM-CLAMP"}
	if before.get("ready") != true or not _ground_bounds.has_area(): return
	var footprint: Rect2 = before.bounds
	var low: Vector2 = _ground_bounds.position - (footprint.position-center)
	var high: Vector2 = _ground_bounds.end - (footprint.end-center)
	var admitted := Vector2(clampf(center.x,low.x,high.x) if low.x<=high.x else (_ground_bounds.get_center().x-(footprint.get_center().x-center.x)),clampf(center.y,low.y,high.y) if low.y<=high.y else (_ground_bounds.get_center().y-(footprint.get_center().y-center.y)))
	if not admitted.is_equal_approx(center):
		var shift := Vector3(admitted.x-center.x,0.0,admitted.y-center.y)
		_camera.position += shift
		_camera.look_at(target+shift,Vector3.UP)
	var after: Dictionary = _camera_ground_footprint()
	_ground_camera_clamp = {"ready":after.get("ready",false),"reason":"" if low.x<=high.x and low.y<=high.y else "view_larger_than_ground_source_center_rule","map_bounds":_ground_bounds,"requested_center":center,"center":admitted,"applied":not admitted.is_equal_approx(center),"unclamped_footprint":footprint,"footprint":after.get("bounds"),"fits_map":low.x<=high.x and low.y<=high.y,"source":"R36376-36379 CAM-CLAMP","simulation_coordinates_changed":false}

func _camera_ground_footprint() -> Dictionary:
	var extent := Vector2(_viewport.size)
	var minimum := Vector2(INF,INF)
	var maximum := Vector2(-INF,-INF)
	# The actual soil plane remains at -2.0, with its original UVs and extent.
	var ground := Plane(Vector3.UP,-2.0)
	# project_ray_* can use the previous interpolated camera transform. Derive
	# rays from the real projection and just-positioned transform for admission;
	# keep the camera's existing automatic interpolation policy for rendering.
	var inverse_projection: Projection = _camera.get_camera_projection().inverse()
	var actual_transform: Transform3D = _camera.global_transform
	for corner in [Vector2.ZERO,Vector2(extent.x,0.0),extent,Vector2(0.0,extent.y)]:
		var unprojected: Vector4 = inverse_projection * Vector4(corner.x/extent.x*2.0-1.0,1.0-corner.y/extent.y*2.0,-1.0,1.0)
		if is_zero_approx(unprojected.w):return {"ready":false,"reason":"ground_frustum_not_bounded"}
		var local_ray: Vector3 = Vector3(unprojected.x,unprojected.y,unprojected.z)/unprojected.w
		var point: Variant = ground.intersects_ray(actual_transform.origin,actual_transform.basis*local_ray.normalized())
		if not point is Vector3 or not point.is_finite():return {"ready":false,"reason":"ground_frustum_not_bounded"}
		minimum=minimum.min(Vector2(point.x,point.z))
		maximum=maximum.max(Vector2(point.x,point.z))
	return {"ready":true,"bounds":Rect2(minimum,maximum-minimum)}

func _sync_sprites() -> void:
	_baked_sources.clear()
	_baked_candidate_ids.clear()
	var publication: Dictionary = _world.get_native_baked_environment_publication() if _world.has_method("get_native_baked_environment_publication") else {}
	_baked_status = {"ready":publication.get("ready",false),"reason":publication.get("reason","source_publication_missing"),
		"source_root":publication.get("source_root"),"phase":publication.get("phase"),"declared":publication.get("declared",0),
		"current_chunks":0,"source_over":true,"terrain_height_supplied":false,"full_composition_ported":false}
	if publication.get("schema") == "fdg.native-baked-environment.v1":
		for candidate in publication.get("source_nodes",[]):
			if is_instance_valid(candidate) and candidate is Sprite2D and candidate.get_parent() == _world:
				_baked_candidate_ids[candidate.get_instance_id()]=true
	if publication.get("schema") == "fdg.native-baked-environment.v1" and publication.get("ready") == true:
		for row in publication.entries:
			if is_instance_valid(row.get("node")) and row.get("texture") is Texture2D:
				_baked_sources[row.node.get_instance_id()] = row
		_baked_status.current_chunks = _baked_sources.size()
	var live: Dictionary = {}
	_scan(_main, live)
	_sync_dark_spheres()
	for id in _mirrors.keys():
		if not live.has(id):
			_mirrors[id].free()
			_mirrors.erase(id)

func _scan(owner: Node, live: Dictionary) -> void:
	for node in owner.get_children():
		if node == self or node is SubViewport or node is CanvasLayer: continue
		if node is Sprite2D or node is AnimatedSprite2D:
			_sync_sprite(node, live)
		_scan(node, live)

func _sync_sprite(source: Node2D, live: Dictionary) -> void:
	if source.is_queued_for_deletion(): return
	var texture: Texture2D
	if source is AnimatedSprite2D:
		if source.sprite_frames == null or source.sprite_frames.get_frame_count(source.animation) == 0: return
		texture = source.sprite_frames.get_frame_texture(source.animation, source.frame)
	else:
		texture = source.texture
	if texture == null: return
	var id: int = source.get_instance_id()
	live[id] = true
	var view: Sprite3D = _mirrors.get(id)
	if view == null:
		view = Sprite3D.new()
		view.name = "NativeSprite_%s" % id
		view.pixel_size = 1.0
		view.shaded = false
		view.alpha_cut = SpriteBase3D.ALPHA_CUT_DISCARD
		view.alpha_scissor_threshold = 0.1
		view.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR
		_scene.add_child(view)
		_mirrors[id] = view
	var baked: Dictionary = _baked_sources.get(id,{})
	var source_chunk: bool = _baked_candidate_ids.has(id) or (source.get_parent() == _world and texture.resource_path.begins_with("res://assets/map/production_finish/"))
	if source_chunk and (baked.is_empty() or baked.get("node") != source or baked.get("texture") != texture):
		view.visible=false
		return
	view.alpha_cut = SpriteBase3D.ALPHA_CUT_DISABLED if not baked.is_empty() else SpriteBase3D.ALPHA_CUT_DISCARD
	view.texture = texture
	view.centered = source.centered
	view.offset = Vector2(source.offset.x, -source.offset.y)
	view.flip_h = source.flip_h
	view.flip_v = source.flip_v
	view.modulate = source.modulate
	view.scale = Vector3(source.global_scale.x, source.global_scale.y, 1)
	var radiant: bool = source.material is ShaderMaterial and source.material.shader != null and source.material.shader.resource_path == "res://assets/vfx/radiant.gdshader"
	var ink: bool = source.material is ShaderMaterial and source.material.shader != null and source.material.shader.resource_path == "res://assets/vfx/ki_slash_ink.gdshader"
	var ground: bool = source.z_index <= -2500 or radiant or ink
	var frame_size: Vector2 = texture.get_size()
	if source is Sprite2D:
		frame_size = (source.region_rect.size if source.region_enabled else frame_size) / Vector2(source.hframes, source.vframes)
	var projection: Dictionary = {}
	if not ground and source == _player.get_node_or_null("Warrior"):
		projection = _player.get_native_projection_metadata() if _player.has_method("get_native_projection_metadata") else {}
		if projection.get("ready") != true or projection.get("source") != source or projection.get("texture") != texture or projection.get("frame_size") != frame_size or not projection.get("world_foot") is Vector2 or not projection.get("display_anchor") is Vector2:
			view.visible = false
			return
	var foot_y: float = (frame_size.y * (0.5 if source.centered else 1.0) + source.offset.y) * source.global_scale.y
	# Source 2D origins are often body centers. Preserve their actual image-foot
	# XY anchor, then lift the whole quad above the ground; never bury half a robe.
	if not ground:
		view.offset.y = frame_size.y * 0.5 if source.centered else 0.0
	else:
		view.offset.y = -source.offset.y - (0.0 if source.centered else frame_size.y)
	view.position = Vector3(source.global_position.x, 0.6 if radiant or ink else (0.0 if not ground else 0.2), source.global_position.y + (0.0 if ground else foot_y))
	if not projection.is_empty():
		var anchor: Vector2 = projection.display_anchor
		view.offset = Vector2((frame_size.x*0.5 if source.centered else 0.0)-anchor.x,anchor.y-frame_size.y*(0.5 if source.centered else 1.0))
		view.position = Vector3(projection.world_foot.x,0.0,projection.world_foot.y)
	view.billboard = BaseMaterial3D.BILLBOARD_DISABLED if ground else (BaseMaterial3D.BILLBOARD_ENABLED if projection.get("camera_facing_artwork")==true else BaseMaterial3D.BILLBOARD_FIXED_Y)
	if projection.get("camera_facing_artwork")==true:
		view.texture_filter=BaseMaterial3D.TEXTURE_FILTER_NEAREST if projection.get("texture_filter")==CanvasItem.TEXTURE_FILTER_NEAREST else BaseMaterial3D.TEXTURE_FILTER_LINEAR
	view.rotation = Vector3(-PI * 0.5, 0, -source.global_rotation) if ground else Vector3.ZERO
	if source is Sprite2D:
		view.region_enabled = source.region_enabled
		view.region_rect = source.region_rect
		view.hframes = source.hframes
		view.vframes = source.vframes
		view.frame = source.frame
	if radiant:
		if _radiant_shader == null:
			_radiant_shader = Shader.new()
			var code: String = source.material.shader.code
			code = code.replace("shader_type canvas_item;", "shader_type spatial;\nuniform sampler2D source_tex : source_color, filter_linear;\nuniform vec4 native_tint : source_color = vec4(1.0);")
			code = code.replace("render_mode unshaded, blend_add;", "render_mode unshaded, blend_add, cull_disabled, depth_draw_never;")
			code = code.replace("varying vec4 vertex_tint;", "").replace("void vertex() { vertex_tint = COLOR; }", "")
			code = code.replace("texture(TEXTURE, UV)", "texture(source_tex, UV)")
			code = code.replace("COLOR = vec4(clamp(rgb, vec3(0.0), vec3(1.0)), pixel.a) * vertex_tint;", "ALBEDO = clamp(rgb, vec3(0.0), vec3(1.0)) * native_tint.rgb; ALPHA = pixel.a * native_tint.a;")
			_radiant_shader.code = code
		var material: ShaderMaterial = view.material_override as ShaderMaterial
		if material == null:
			material = ShaderMaterial.new()
			material.shader = _radiant_shader
			view.material_override = material
		material.set_shader_parameter("source_tex",texture.atlas if texture is AtlasTexture else texture)
		material.set_shader_parameter("native_tint",source.modulate)
		material.set_shader_parameter("hue_degrees",source.material.get_shader_parameter("hue_degrees"))
	elif ink:
		# 원본 19211~19215: 칼날(가산) 아래 일반 합성 — render_priority로 같은 높이의 칼날보다 먼저 그린다.
		if _ink_shader == null:
			_ink_shader = Shader.new()
			var ink_code: String = source.material.shader.code
			ink_code = ink_code.replace("shader_type canvas_item;", "shader_type spatial;\nuniform sampler2D source_tex : filter_linear;\nuniform vec4 native_tint : source_color = vec4(1.0);")
			ink_code = ink_code.replace("render_mode unshaded, blend_mix;", "render_mode unshaded, blend_mix, cull_disabled, depth_draw_never;")
			ink_code = ink_code.replace("varying vec4 vertex_tint;", "").replace("void vertex() { vertex_tint = COLOR; }", "")
			ink_code = ink_code.replace("TEXTURE", "source_tex")
			ink_code = ink_code.replace("COLOR = vec4(vec3(5.0, 4.0, 6.0) / 255.0, min(1.0, ink_l * 2.4)) * vertex_tint;", "ALBEDO = vec3(5.0, 4.0, 6.0) / 255.0 * native_tint.rgb; ALPHA = min(1.0, ink_l * 2.4) * native_tint.a;")
			_ink_shader.code = ink_code
		var ink_material: ShaderMaterial = view.material_override as ShaderMaterial
		if ink_material == null:
			ink_material = ShaderMaterial.new()
			ink_material.shader = _ink_shader
			ink_material.render_priority = -1
			view.material_override = ink_material
		ink_material.set_shader_parameter("source_tex",texture.atlas if texture is AtlasTexture else texture)
		ink_material.set_shader_parameter("native_tint",source.modulate)
		ink_material.set_shader_parameter("blur_px",source.material.get_shader_parameter("blur_px"))
	elif _main.has_method("is_native_q_control_visual") and _main.is_native_q_control_visual(source):
		var material: ShaderMaterial = view.material_override as ShaderMaterial
		if material==null:
			material=ShaderMaterial.new()
			var shader := Shader.new()
			shader.code="""shader_type spatial;
render_mode unshaded, blend_add, cull_disabled, depth_draw_never;
uniform sampler2D source_tex : source_color, filter_linear;
void fragment(){vec4 c=texture(source_tex,UV);ALBEDO=c.a>0.0001?c.rgb/c.a:vec3(0.0);ALPHA=c.a;}
"""
			material.shader=shader
			view.material_override=material
		material.set_shader_parameter("source_tex",texture)
	if not baked.is_empty():
		view.region_enabled = true
		view.region_rect = baked.source_rect
		view.position = Vector3(baked.world_rect.get_center().x,-1.5,baked.world_rect.get_center().y)
		view.modulate = baked.modulate
		view.render_priority = -90
	view.visible = source.is_visible_in_tree()

func _sync_dark_spheres() -> void:
	var live: Dictionary = {}
	for source in get_tree().get_nodes_in_group("enemy_projectiles"):
		if not is_instance_valid(source) or source.is_queued_for_deletion() or not _main.is_ancestor_of(source) or not source.has_method("get_native_projection_visual"): continue
		var data: Dictionary = source.get_native_projection_visual()
		if not data.get("ready",false) or data.get("kind") not in ["native_dark_sphere","native_parry_blue"]: continue
		var id: int = source.get_instance_id()
		live[id] = true
		var node: MeshInstance3D = _sphere_views.get(id)
		if node == null:
			node = MeshInstance3D.new()
			var plane := PlaneMesh.new()
			plane.size = Vector2.ONE * float(data.radius) * 8.4
			node.mesh = plane
			var shader := Shader.new()
			shader.code = """shader_type spatial;
render_mode unshaded, cull_disabled, depth_draw_never;
uniform float pulse = 1.0;
uniform bool reflected_blue = false;
void fragment() {
 vec2 p = (UV - vec2(0.5)) * 8.4;
 float r = length(p);
 vec4 c = vec4(0.294,0.086,0.49,0.13*pulse*step(r,4.2));
 vec4 b = vec4(0.56,0.21,0.847,0.28*pulse*step(r,2.35));
 c.rgb = mix(c.rgb,b.rgb,b.a); c.a = b.a+c.a*(1.0-b.a);
 b=vec4(0.427,0.129,0.678,0.72*step(r,1.0));
 c.rgb=mix(c.rgb,b.rgb,b.a); c.a=b.a+c.a*(1.0-b.a);
 b=vec4(0.788,0.565,1.0,0.92*step(length(p-vec2(-0.22,-0.28)),0.34));
 c.rgb=mix(c.rgb,b.rgb,b.a); c.a=b.a+c.a*(1.0-b.a);
 if (reflected_blue) {
  c.rgb=mix(vec3(0.0,0.8,1.0),vec3(0.9,1.0,1.0),1.0-smoothstep(0.0,1.0,r));
 }
 ALBEDO=c.rgb; ALPHA=c.a;
}
"""
			var material := ShaderMaterial.new()
			material.shader = shader
			node.material_override = material
			_scene.add_child(node)
			_sphere_views[id] = node
		node.position = Vector3(data.position.x,0.4,data.position.y)
		node.material_override.set_shader_parameter("pulse",data.pulse)
		node.material_override.set_shader_parameter("reflected_blue",data.kind=="native_parry_blue")
	for id in _sphere_views.keys():
		if not live.has(id):
			_sphere_views[id].free()
			_sphere_views.erase(id)

func world_to_screen(point: Vector2, height: float = 0.0) -> Dictionary:
	if not _live() or not point.is_finite() or not is_finite(height): return {"ready":false}
	var p := Vector3(point.x, height, point.y)
	var depth: float = -(_camera.global_transform.affine_inverse() * p).z
	if depth < _camera.near or depth > _camera.far: return {"ready":false}
	return {"ready":true, "screen":_camera.unproject_position(p), "depth":depth}

func screen_to_world(screen: Vector2, height: float = 0.0) -> Dictionary:
	if not _live() or not screen.is_finite() or not is_finite(height): return {"ready":false}
	var origin := _camera.project_ray_origin(screen)
	var direction := _camera.project_ray_normal(screen)
	var intersection: Variant = Plane(Vector3.UP, height).intersects_ray(origin, direction)
	if not intersection is Vector3: return {"ready":false}
	var depth: float = -(_camera.global_transform.affine_inverse() * intersection).z
	if depth < _camera.near or depth > _camera.far: return {"ready":false}
	return {"ready":true, "world":Vector2(intersection.x, intersection.z), "height":height}

func read_ground_pointer() -> Dictionary:
	return screen_to_world(_player._native_pointer_screen if _player._native_pointer_screen is Vector2 else _main.get_viewport().get_mouse_position()) if _live() else {"ready":false}

func mount_native_map_mass_scene() -> Dictionary:
	if not _live(): return {"ready":false,"reason":"perspective_not_live"}
	if is_instance_valid(_owned_floor): return {"ready":false,"reason":"mass_floor_already_owned"}
	var script: Script = load(FLOOR_OWNER_PATH) if ResourceLoader.exists(FLOOR_OWNER_PATH) else null
	if script == null: return {"ready":false,"reason":"map_floor_script_missing"}
	_owned_floor = script.new()
	_owned_floor.name = "NativeViewFloor"
	_world.add_child(_owned_floor)
	if not _owned_floor.has_method("get_authored_native_view_material_selection"):
		_owned_floor.free()
		_owned_floor = null
		return {"ready":false,"reason":"authored_material_selection_api_missing"}
	var selection: Variant = _owned_floor.get_authored_native_view_material_selection()
	if not selection is Dictionary or selection.is_empty():
		_owned_floor.free()
		_owned_floor = null
		return {"ready":false,"reason":"authored_material_selection_missing"}
	_native_material_selection = selection.duplicate(true)
	_owned_floor.assemble({"floor_view_source":_world.get_native_floor_view_source(),"material_selection":_native_material_selection})
	var binding: Dictionary = bind_native_map_draw_owner(_owned_floor)
	if not binding.get("bound",false): return binding
	return refresh_native_mass_geometry()

func get_native_mass_geometry_snapshot() -> Dictionary:
	if not _live() or not is_instance_valid(_owned_floor) or _owned_floor.is_queued_for_deletion() or _owned_floor.get_parent() != _world or _owned_floor.get_script() != _map_draw_owner_script:
		return {"ready":false,"reason":"mass_floor_owner_not_live"}
	return _mass_status.duplicate(true)

func _current_packet_texture(key: String) -> Dictionary:
	if not _live(): return {"ready":false,"texture":null}
	if not _mass_texture_cache.has(key):
		_mass_texture_cache[key] = _world.get_native_current_source_object_texture(key)
	return _mass_texture_cache[key].duplicate()

func refresh_native_mass_geometry() -> Dictionary:
	_mass_rows.clear()
	_max_mass_height = 0.0
	for node in _mass_meshes.values():
		if is_instance_valid(node): node.free()
	_mass_meshes.clear()
	_mass_camera_cell = Vector2i(-999999,-999999)
	_mass_status = {"ready":false,"reason":"mass_floor_not_live","validated":0,"rejected":[],"authored_height":true,"physics_changed":false,"contact_shadow_rendered":false}
	if not _live() or not is_instance_valid(_owned_floor) or _owned_floor.is_queued_for_deletion() or _owned_floor.get_parent() != _world:
		return _mass_status.duplicate(true)
	var source: Dictionary = _world.get_native_floor_view_source()
	if not source.get("ready",false): return _mass_status.duplicate(true)
	var expected: Array = source.floor_reader.call()
	var indexed: Dictionary = {}
	for row in expected: indexed[row.id] = row
	_mass_texture_cache.clear()
	var descriptor: Dictionary = source.duplicate()
	descriptor["current_texture_reader"] = Callable(self,"_current_packet_texture")
	var packet: Dictionary = _owned_floor.floor_draw_packet({"floor_view_source":descriptor,"material_selection":_native_material_selection})
	var native: Variant = packet.get("native_view_masses")
	if not native is Dictionary or native.get("schema") != "exoduser.godot.ch1-native-first.native-view-mass.v1" or not native.get("masses") is Array or native.get("published_entry_count") != expected.size():
		_mass_status["reason"] = "native_mass_packet_count_or_schema_invalid"
		return _mass_status.duplicate(true)
	for mass in native.masses:
		var id: String = str(mass.get("id","")) if mass is Dictionary else ""
		if not indexed.has(id) or _mass_rows.has(id):
			_mass_status.rejected.append({"id":id,"reason":"unknown_or_duplicate_native_id"})
			continue
		var reference: Dictionary = indexed[id]
		var height: Variant = mass.get("view_height")
		var valid: bool = mass.get("source_index") == reference.source_index and mass.get("source_kind") == reference.source_kind and mass.get("source_rect") == reference.source_rect and mass.get("ground_footprint") == reference.ground_footprint and mass.get("height_basis") == "AUTHORED_NATIVE_VIEW_ONLY" and mass.get("source_height") == null and mass.get("geometry_edited") == false
		valid = valid and (height is int or height is float) and is_finite(float(height)) and float(height) > 0.0
		var material: Variant = mass.get("material")
		var texture: Variant = material.get("texture") if material is Dictionary else null
		var selection_value: Variant = _native_material_selection.get(id,_native_material_selection.get(reference.source_kind))
		var selected_key: Variant = selection_value.get("source_key") if selection_value is Dictionary else selection_value
		valid = valid and material is Dictionary and material.get("ready") == true and material.get("source_key") == selected_key and material.get("original_source_assigned") == false and texture is Texture2D and texture.get_width() > 0 and texture.get_height() > 0
		if not valid:
			_mass_status.rejected.append({"id":id,"reason":"identity_footprint_height_or_material_invalid"})
			continue
		_mass_rows[id] = mass.duplicate()
		_max_mass_height = maxf(_max_mass_height,float(height))
	_mass_status["validated"] = _mass_rows.size()
	_mass_status["ready"] = _mass_rows.size() == expected.size() and expected.size() > 0 and _mass_status.rejected.is_empty()
	_mass_status["reason"] = "" if _mass_status.ready else "native_mass_validation_incomplete"
	_sync_visible_masses()
	return _mass_status.duplicate(true)

func _sync_visible_masses() -> void:
	if _mass_rows.is_empty() or not _live(): return
	if not is_instance_valid(_owned_floor) or _owned_floor.is_queued_for_deletion() or _owned_floor.get_parent() != _world:
		for node in _mass_meshes.values():
			if is_instance_valid(node): node.free()
		_mass_meshes.clear()
		_mass_rows.clear()
		if is_instance_valid(_owned_floor) and _owned_floor.has_method("dispose"): _owned_floor.dispose()
		_mass_status = {"ready":false,"reason":"mass_floor_owner_lost"}
		return
	var cell := Vector2i(floori(_player.global_position.x / 40.0),floori(_player.global_position.y / 40.0))
	if cell == _mass_camera_cell and _viewport.size == _mass_refresh_size: return
	_mass_camera_cell = cell
	_mass_refresh_size = _viewport.size
	var min_point := Vector2(INF,INF)
	var max_point := Vector2(-INF,-INF)
	for corner in [Vector2.ZERO,Vector2(_viewport.size.x,0),Vector2(_viewport.size),Vector2(0,_viewport.size.y)]:
		var hit: Dictionary = screen_to_world(corner)
		if not hit.get("ready",false): return
		min_point = min_point.min(hit.world)
		max_point = max_point.max(hit.world)
	var area := Rect2(min_point,max_point-min_point).grow(_max_mass_height / tan(float(_settings.pitch)) + 40.0)
	for id in _mass_rows:
		var mass: Dictionary = _mass_rows[id]
		var rect: Array = mass.source_rect
		var wanted: bool = Rect2(rect[0],rect[1],rect[2],rect[3]).intersects(area)
		if not wanted:
			if _mass_meshes.has(id): _mass_meshes[id].visible = false
			continue
		if not _mass_meshes.has(id):
			_mass_meshes[id] = _build_mass_mesh(mass)
		_mass_meshes[id].visible = true
	_mass_status["mesh_instances"] = _mass_meshes.size()

func _build_mass_mesh(mass: Dictionary) -> MeshInstance3D:
	var corners: Array = mass.ground_footprint
	var bottom: Array = []
	var top: Array = []
	for point in corners:
		bottom.append(Vector3(point.x,0.0,point.y))
		top.append(Vector3(point.x,float(mass.view_height),point.y))
	var vertices := PackedVector3Array()
	var normals := PackedVector3Array()
	var uv := PackedVector2Array()
	var quads: Array = [[top[0],top[1],top[2],top[3]]]
	for index in range(4): quads.append([bottom[index],bottom[(index+1)%4],top[(index+1)%4],top[index]])
	for quad in quads:
		var normal: Vector3 = (quad[1]-quad[0]).cross(quad[2]-quad[0]).normalized()
		var texture_size: Vector2 = mass.material.texture.get_size()
		for index in [0,1,2,0,2,3]:
			var point: Vector3 = quad[index]
			var tex_uv: Vector2
			if absf(normal.y) > 0.5:
				tex_uv = Vector2(point.x / texture_size.x,point.z / texture_size.y)
			elif absf(normal.x) > 0.5:
				tex_uv = Vector2(point.z / texture_size.x,-point.y / texture_size.y)
			else:
				tex_uv = Vector2(point.x / texture_size.x,-point.y / texture_size.y)
			vertices.append(point); normals.append(normal); uv.append(tex_uv)
	var arrays: Array = []
	arrays.resize(Mesh.ARRAY_MAX)
	arrays[Mesh.ARRAY_VERTEX] = vertices
	arrays[Mesh.ARRAY_NORMAL] = normals
	arrays[Mesh.ARRAY_TEX_UV] = uv
	var mesh := ArrayMesh.new()
	mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
	var material := StandardMaterial3D.new()
	material.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	material.cull_mode = BaseMaterial3D.CULL_DISABLED
	material.albedo_texture = mass.material.texture
	material.texture_filter = BaseMaterial3D.TEXTURE_FILTER_LINEAR
	material.texture_repeat = true
	material.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR
	material.alpha_scissor_threshold = 0.1
	var node := MeshInstance3D.new()
	node.name = mass.id
	node.mesh = mesh
	node.material_override = material
	_scene.add_child(node)
	return node

func bind_native_map_draw_owner(owner: Node) -> Dictionary:
	if not _live() or not is_instance_valid(owner) or owner.is_queued_for_deletion() \
			or not owner.is_inside_tree() or owner.get_tree() != get_tree() or not _world.is_ancestor_of(owner) \
			or owner.get_script() == null or owner.get_script().resource_path != FLOOR_OWNER_PATH \
			or not owner.has_method("floor_draw_packet"):
		return {"bound":false, "ready":false, "reason":"missing_same_world_floor_display_owner"}
	if _map_draw_owner != null and is_instance_valid(_map_draw_owner.get_ref()) and _map_draw_owner.get_ref() != owner:
		return {"bound":false, "ready":false, "reason":"different_floor_display_owner_already_bound"}
	_map_draw_owner = weakref(owner)
	_map_draw_owner_script = owner.get_script()
	return read_native_map_draw_publication()

func read_native_map_draw_publication() -> Dictionary:
	var report: Dictionary = {"schema":"fdg.native-map-draw-consumption.v1", "bound":false,
		"ready":false, "status":"NOT_READY", "wall_count":0, "walls":[], "gaps":[],
		"source_floor_map_bound":false, "mesh_front_top_rendered":false,
		"contact_shadow_rendered":false, "ground_footprint_verified":false,
		"source_canvas_z_is_terrain_height":false}
	var owner: Node = _map_draw_owner.get_ref() if _map_draw_owner != null else null
	if not _live() or not is_instance_valid(owner) or owner.is_queued_for_deletion() \
			or not owner.is_inside_tree() or owner.get_tree() != get_tree() or not _world.is_ancestor_of(owner) \
			or owner.get_script() != _map_draw_owner_script:
		report["reason"] = "floor_display_owner_not_live_or_unbound"
		return report
	report["bound"] = true
	report["owner"] = str(owner.get_path())
	var packet: Variant = owner.floor_draw_packet({})
	if not packet is Dictionary or packet.get("schema") != FLOOR_PACKET_SCHEMA or packet.get("stage") != "CH1-1" or packet.get("si") != 0:
		report["reason"] = "unsupported_floor_draw_packet"
		return report
	var wall: Variant = packet.get("wall")
	if not wall is Dictionary or wall.get("schema") != WALL_PACKET_SCHEMA or not wall.get("walls") is Array:
		report["reason"] = "wall_draw_packet_missing"
		return report
	var state: Node = _main.get("source_state")
	var g: Variant = null
	if is_instance_valid(state) and not state.is_queued_for_deletion() and state.is_inside_tree() \
			and state.get_parent() == _world and state.get_tree() == get_tree() and state.get_script() != null \
			and state.get_script().resource_path == "res://scripts/native_source_new_run_state.gd":
		g = state.read_current_g()
	report["source_floor_map_bound"] = g is Dictionary and g.has("map") and g.map != null
	if not report.source_floor_map_bound: report.gaps.append("source_floor_map_unbound")
	for row in wall.walls:
		if not row is Dictionary:
			report.gaps.append("invalid_wall_row")
			continue
		var height: Variant = row.get("height")
		var height_valid: bool = (height is float or height is int) and is_finite(float(height)) and float(height) > 0.0
		var texture: Variant = row.get("texture")
		var texture_valid: bool = texture is Texture2D and texture.get_width() > 0 and texture.get_height() > 0
		var corners: Variant = row.get("plane_corners")
		var corners_valid: bool = corners is Array and corners.size() == 4
		if corners_valid:
			for point in corners:
				corners_valid = corners_valid and point is Vector2 and point.is_finite()
		if corners_valid:
			corners_valid = absf((corners[1] - corners[0]).cross(corners[3] - corners[0])) > 0.0
		var node: Node = owner.get_node_or_null("MapViewOwner/WallDrawOwner/" + str(row.get("node", "")))
		var node_live: bool = is_instance_valid(node) and node is Sprite2D and not node.is_queued_for_deletion() and node.is_inside_tree() and owner.is_ancestor_of(node)
		var uv_verified := false
		# A cropped AtlasTexture's get_size is the crop size, not original atlas
		# dimensions. Do not accept the producer's normalized UV blindly.
		var uv: Variant = row.get("uv")
		if texture_valid and not texture is AtlasTexture and uv is Array and uv.size() == 4:
			uv_verified = uv == [0.0, 0.0, 1.0, 1.0]
		var gaps: Array = ["ground_footprint_contract_missing", "front_top_mesh_unimplemented"]
		if not height_valid: gaps.append("height_missing_or_not_positive_finite")
		if not texture_valid: gaps.append("texture_missing")
		if not corners_valid: gaps.append("invalid_plane_corners")
		if not node_live: gaps.append("wall_sprite_not_live")
		if not uv_verified: gaps.append("atlas_or_uv_unverified")
		if row.get("contact_shadow") != null:
			gaps.append("contact_shadow_source_values_and_texture_unverified")
		else:
			gaps.append("contact_shadow_missing")
		report.walls.append({"id":row.get("id"), "node":str(node.get_path()) if node_live else null,
			"height_valid":height_valid, "texture_valid":texture_valid, "corners_valid":corners_valid,
			"uv_verified":uv_verified, "sprite_live":node_live, "ready":false, "gaps":gaps})
	report["wall_count"] = report.walls.size()
	report["reason"] = "source_floor_map_unbound" if not report.source_floor_map_bound else "wall_height_footprint_and_mesh_authority_incomplete"
	return report

func _read_player_contact_shadow() -> Dictionary:
	if not _live() or not is_instance_valid(_main.source_state) or not is_instance_valid(_main.source_providers) \
			or not _main.source_providers.is_native_source_providers_ready():
		return {"ready":false,"reason":"actual_player_source_not_live"}
	var g: Variant = _main.source_state.read_current_g()
	var stage: Variant = g.get("stage") if g is Dictionary else null
	var world_stage: Variant = _world.map_data.get("stage")
	if not (stage is int or stage is float) or not is_finite(float(stage)) or stage != world_stage:
		return {"ready":false,"reason":"current_source_stage_not_supplied"}
	var bundle: Dictionary = _main.source_providers.get_provider_bundle()
	var on: bool = bundle.affix.js_truthy(g._depthSlice) if g.has("_depthSlice") else true
	if not on or stage != 0 or bundle.affix.js_truthy(g.get("_bossArena")):
		# Other stages use Canvas ellipse/globalAlpha. That draw owner is not
		# adopted here; never label a guessed replacement as the source pass.
		return {"ready":false,"reason":"source_flat_shadow_pass_not_adopted"}
	if not is_finite(_player.radius) or _player.radius <= 0 or not _player.global_position.is_finite():
		return {"ready":false,"reason":"current_player_geometry_invalid"}
	var geometry: Dictionary = SOURCE_PLAYER_SHADOW.geometry({"radius":_player.radius,"state":_player.state,
		"stage":stage,"boss_arena":false,"depth_slice":true})
	return {"ready":true,"mode":"blob","geometry":geometry,"player_position":_player.global_position,
		"radius":_player.radius,"state":_player.state,"stage":stage,
		"depth_slice_authority":"current_G" if g.has("_depthSlice") else "canonical_renderer_default_true",
		"url_override_restored":false,"terrain_height_supplied":false,"render_bias_y":PLAYER_SHADOW_RENDER_Y,
		"scope":"actual_player_first_stage_blob_only"}

func _sync_player_contact_shadow() -> void:
	_player_shadow_status = _read_player_contact_shadow()
	if _player_shadow_status.get("ready") != true:
		if is_instance_valid(_player_shadow): _player_shadow.visible=false
		return
	if not is_instance_valid(_player_shadow):
		_player_shadow=MeshInstance3D.new()
		_player_shadow.name="ActualSourcePlayerGroundShadow"
		var plane:=PlaneMesh.new()
		plane.size=Vector2.ONE
		var material:=StandardMaterial3D.new()
		material.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED
		material.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA
		material.cull_mode=BaseMaterial3D.CULL_DISABLED
		material.albedo_texture=SOURCE_PLAYER_SHADOW.blob_texture()
		material.albedo_color=Color(1,1,1,SOURCE_PLAYER_SHADOW.BLOB_ALPHA)
		material.texture_filter=BaseMaterial3D.TEXTURE_FILTER_LINEAR
		material.render_priority=-10
		plane.material=material
		_player_shadow.mesh=plane
		_player_shadow.cast_shadow=GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
		_scene.add_child(_player_shadow)
	var rect: Rect2 = _player_shadow_status.geometry.rect
	var center: Vector2 = _player_shadow_status.player_position+rect.get_center()
	_player_shadow.position=Vector3(center.x,PLAYER_SHADOW_RENDER_Y,center.y)
	_player_shadow.scale=Vector3(rect.size.x,1.0,rect.size.y)
	_player_shadow.visible=true

func get_native_player_contact_shadow_snapshot() -> Dictionary:
	var current: Dictionary = _read_player_contact_shadow()
	if current.get("ready") != true: return current
	if not is_instance_valid(_player_shadow) or _player_shadow.is_queued_for_deletion() \
			or _player_shadow.get_parent()!=_scene or not _player_shadow.visible or current!=_player_shadow_status:
		return {"ready":false,"reason":"current_player_shadow_not_synchronized"}
	current["rendered"]=true
	current["position"]=_player_shadow.position
	current["size"]=Vector2(_player_shadow.scale.x,_player_shadow.scale.z)
	return current

func get_snapshot() -> Dictionary:
	var baked_status: Dictionary = _baked_status.duplicate(true)
	var current_baked: Dictionary = _world.get_native_baked_environment_publication() if _live() and _world.has_method("get_native_baked_environment_publication") else {}
	if current_baked.get("ready") != true:
		baked_status.ready=false
		baked_status.reason=current_baked.get("reason","baked_owner_not_live")
		baked_status.current_chunks=0
	else:
		for row in current_baked.entries:
			var id: int = row.node.get_instance_id()
			if not _baked_sources.has(id) or _baked_sources[id].texture != row.texture or not _mirrors.has(id) or _mirrors[id].is_queued_for_deletion():
				baked_status.ready=false
				baked_status.reason="current_baked_mirrors_not_synchronized"
				break
	return {"schema":"fdg.native-perspective-view.v1", "ready":_live(), "scope":"actual_native_source_baked_and_sprite_presentation_first",
		"camera_path":str(_camera.get_path()) if is_instance_valid(_camera) else "", "projection":"perspective",
		"settings":_settings.duplicate(), "ground_camera_clamp":_ground_camera_clamp.duplicate(true), "sprite_consumers":_mirrors.size(), "ground_passes":2, "baked_environment":baked_status,
		"e_wave_particle_quads":_e_wave_visible, "custom_draw_vfx_ported":false, "height_terrain_ported":false, "latest_full_game":false,
		"player_contact_shadow":get_native_player_contact_shadow_snapshot(),
		"shadow_and_occlusion_polish_verified":false, "performance_verified":false, "canvas_material_parity_verified":false, "screen_space_labels_ported":false, "map_draw":read_native_map_draw_publication(), "native_mass_geometry":get_native_mass_geometry_snapshot()}

func _live() -> bool:
	return _mounted and is_inside_tree() and not is_queued_for_deletion() and is_instance_valid(_main) \
		and _main.is_inside_tree() and not _main.is_queued_for_deletion() and get_parent() == _main \
		and _main.get("native_perspective_view") == self and _main.get("player") == _player and _main.get("world") == _world \
		and _main.get_script() == _main_script and _main.get_tree() == get_tree() \
		and is_instance_valid(_player) and _player.get_script() == _player_script \
		and is_instance_valid(_world) and _world.get_script() == _world_script \
		and is_instance_valid(_main.player) and not _main.player.is_queued_for_deletion() \
		and _main.player.get_parent() == _main and is_instance_valid(_main.world) \
		and not _main.world.is_queued_for_deletion() and _main.world.get_parent() == _main \
		and is_instance_valid(_viewport) and not _viewport.is_queued_for_deletion() and _viewport.get_parent() == self \
		and is_instance_valid(_camera) and not _camera.is_queued_for_deletion() and _camera.get_viewport() == _viewport \
		and _viewport.get_camera_3d() == _camera and _camera.get_parent() == _scene \
		and is_instance_valid(_scene) and _scene.get_parent() == _viewport

func dispose() -> void:
	set_process(false)
	if is_instance_valid(_player) and _player.has_method("unbind_native_ground_pointer"):
		_player.unbind_native_ground_pointer(Callable(self, "read_ground_pointer"))
	_mounted = false
	_e_wave_mesh=null
	_player_shadow=null
	_player_shadow_status={"ready":false,"reason":"disposed"}
	_e_wave_visible=0
	if is_instance_valid(_layer): _layer.free()
	if is_instance_valid(_viewport): _viewport.free()
	_layer = null
	_viewport = null
	_camera = null
	_mirrors.clear()
	_sphere_views.clear()
	_mass_meshes.clear()
	_mass_rows.clear()
	_mass_texture_cache.clear()
	_baked_sources.clear()
	_baked_candidate_ids.clear()
	if is_instance_valid(_owned_floor):
		if _owned_floor.has_method("dispose"): _owned_floor.dispose()
		_owned_floor.free()
	_owned_floor = null
	_map_draw_owner = null
	_map_draw_owner_script = null

func _exit_tree() -> void:
	dispose()

func _sync_e_wave_particles() -> void:
	var rows: Array=_world.get_native_e_wave_draw_rows()
	if not is_instance_valid(_e_wave_mesh):
		_e_wave_mesh=MultiMeshInstance3D.new()
		_e_wave_mesh.name="ActualSourceEWaveParticles"
		var pool:=MultiMesh.new()
		pool.transform_format=MultiMesh.TRANSFORM_3D
		pool.use_colors=true
		var plane:=PlaneMesh.new()
		plane.size=Vector2.ONE
		var material:=StandardMaterial3D.new()
		material.shading_mode=BaseMaterial3D.SHADING_MODE_UNSHADED
		material.vertex_color_use_as_albedo=true
		material.transparency=BaseMaterial3D.TRANSPARENCY_ALPHA
		material.cull_mode=BaseMaterial3D.CULL_DISABLED
		material.render_priority=1
		plane.material=material
		pool.mesh=plane
		pool.instance_count=80
		_e_wave_mesh.multimesh=pool
		_scene.add_child(_e_wave_mesh)
	_e_wave_visible=mini(80,rows.size())
	_e_wave_mesh.multimesh.visible_instance_count=_e_wave_visible
	for index in range(_e_wave_visible):
		var row: Dictionary=rows[index]
		var size: float=row.size
		_e_wave_mesh.multimesh.set_instance_transform(index,Transform3D(Basis.IDENTITY.scaled(Vector3(size,1.0,size)),Vector3(row.position.x,0.4,row.position.y)))
		_e_wave_mesh.multimesh.set_instance_color(index,row.color)
