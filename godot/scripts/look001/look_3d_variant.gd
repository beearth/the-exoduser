extends Node
## LOOK-001 C/D presentation only. Mount explicitly after the unchanged
## NativePerspectiveView; this script is never loaded by the default game.
## Original resources, camera tracking and simulation owners stay untouched.

const SCHEMA := "exoduser.look-001.3d-variant.v1"
const FLOOR_NAMES := ["SoilBase", "LitterOverlay"]
const KEY_SOURCE := Vector3(-900.0, 1500.0, -1100.0)
const FILL_SOURCE := Vector3(700.0, 950.0, 1100.0)
const KEY_COLOR := Color(0.86, 0.80, 0.69)
const KEY_ENERGY := 1.05
const FILL_COLOR := Color(0.40, 0.44, 0.48)
const FILL_ENERGY := 0.48
const AMBIENT_COLOR := Color(0.45, 0.43, 0.40)
const AMBIENT_ENERGY := 0.68
const FOG_COLOR := Color(0.10, 0.115, 0.12)
const FOG_DENSITY := 0.00006
const VOLUMETRIC_DENSITY := 0.00008
const VOLUMETRIC_LENGTH := 5000.0
const SHADOW_DISTANCE := 5000.0
const SHADOW_OPACITY := 0.60
const SHADOW_BLUR := 1.5
const KEY_ANGULAR_SIZE := 0.12
const FLOOR_ROUGHNESS := 0.94
const MASS_ROUGHNESS := 0.91

var _main: Node
var _perspective: Node
var _viewport: SubViewport
var _scene: Node3D
var _camera: Camera3D
var _original_camera_environment: Environment
var _owned_root: Node3D
var _environment: Environment
var _key: DirectionalLight3D
var _fill: DirectionalLight3D
var _mode := ""
var _ready := false
var _reason := "not_configured"
var _material_states: Dictionary = {}
var _sprite_states: Dictionary = {}
var _unchanged_effect_ids: Dictionary = {}

func configure(main: Node, perspective: Node, mode: String) -> Dictionary:
	if _ready:
		return {"ready": false, "reason": "already_configured"}
	if mode not in ["C", "D"]:
		return _reject("mode_must_be_C_or_D")
	if not is_instance_valid(main) or not is_instance_valid(perspective) \
			or not main.is_inside_tree() or perspective.get_parent() != main:
		return _reject("actual_mounted_perspective_required")
	var candidate_viewport := perspective.get_node_or_null("PerspectiveViewport") as SubViewport
	if candidate_viewport == null:
		return _reject("perspective_viewport_missing")
	var candidate_camera := candidate_viewport.get_camera_3d()
	if candidate_camera == null or not candidate_camera.get_parent() is Node3D:
		return _reject("perspective_camera_missing")
	var expected_method := "forward_plus" if mode == "C" else "gl_compatibility"
	if RenderingServer.get_current_rendering_method() != expected_method:
		return _reject("renderer_mismatch_expected_" + expected_method)
	if mode == "C" and RenderingServer.get_current_rendering_driver_name() != "metal":
		return _reject("C_requires_actual_metal_driver")
	_main = main
	_perspective = perspective
	_viewport = candidate_viewport
	_camera = candidate_camera
	_scene = _camera.get_parent() as Node3D
	_mode = mode
	_original_camera_environment = _camera.environment
	_owned_root = Node3D.new()
	_owned_root.name = "Look0013DPresentation"
	_scene.add_child(_owned_root)
	_environment = _make_environment(mode == "C")
	var world_environment := WorldEnvironment.new()
	world_environment.name = "Look001WorldEnvironment"
	world_environment.environment = _environment
	_owned_root.add_child(world_environment)
	# The source view assigns a camera-local background-only Environment.
	# Remove that override while this owned WorldEnvironment is active.
	_camera.environment = null
	_key = _make_light("NorthWestBoneKey", KEY_SOURCE, KEY_COLOR, KEY_ENERGY, true)
	_fill = _make_light("SoftIronFill", FILL_SOURCE, FILL_COLOR, FILL_ENERGY, false)
	_ready = true
	_reason = ""
	# Run after the source's frame synchronization. New mirrors/masses get their
	# own reversible presentation setting once, without touching source sprites.
	process_priority = 100
	_refresh_presentation()
	set_process(true)
	return get_snapshot()

func _make_environment(forward_plus: bool) -> Environment:
	var environment := Environment.new()
	environment.background_mode = Environment.BG_COLOR
	environment.background_color = Color(0.025, 0.028, 0.029)
	environment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	environment.ambient_light_color = AMBIENT_COLOR
	environment.ambient_light_energy = AMBIENT_ENERGY
	environment.ambient_light_sky_contribution = 0.0
	environment.reflected_light_source = Environment.REFLECTION_SOURCE_DISABLED
	# Common fog and grading use supported C/D properties. The extra C volume
	# is deliberately absent in D, rather than silently emulated.
	environment.fog_enabled = true
	environment.fog_density = FOG_DENSITY
	environment.fog_light_color = FOG_COLOR
	environment.fog_light_energy = 0.75
	environment.fog_sky_affect = 0.0
	environment.volumetric_fog_enabled = forward_plus
	if forward_plus:
		environment.volumetric_fog_density = VOLUMETRIC_DENSITY
		environment.volumetric_fog_length = VOLUMETRIC_LENGTH
		environment.volumetric_fog_albedo = Color(0.38, 0.40, 0.37)
		environment.volumetric_fog_anisotropy = 0.35
		environment.volumetric_fog_ambient_inject = 0.18
		environment.volumetric_fog_gi_inject = 0.0
		environment.volumetric_fog_sky_affect = 0.0
	environment.ssao_enabled = forward_plus
	environment.ssil_enabled = false
	environment.ssr_enabled = false
	environment.sdfgi_enabled = false
	if forward_plus:
		environment.ssao_radius = 44.0
		environment.ssao_intensity = 1.10
		environment.ssao_power = 1.25
		environment.ssao_detail = 0.4
		environment.ssao_light_affect = 0.35
	# Godot 4.7 Compatibility supports a simpler SCREEN glow implementation.
	# These shared controls work in both; levels/strength/blend-mode are unused.
	environment.glow_enabled = true
	environment.glow_intensity = 0.20
	environment.glow_bloom = 0.025
	environment.glow_hdr_threshold = 0.82
	environment.adjustment_enabled = true
	environment.adjustment_brightness = 1.02
	environment.adjustment_contrast = 1.06
	environment.adjustment_saturation = 0.86
	return environment

func _make_light(node_name: String, source: Vector3, tint: Color, energy: float, shadows: bool) -> DirectionalLight3D:
	var light := DirectionalLight3D.new()
	light.name = node_name
	light.light_color = tint
	light.light_energy = energy
	light.light_specular = 0.18
	light.light_volumetric_fog_energy = 0.65 if shadows else 0.12
	light.shadow_enabled = shadows
	light.shadow_opacity = SHADOW_OPACITY
	light.shadow_blur = SHADOW_BLUR
	# Directional PCSS uses angular size, not the local-light size parameter.
	# Compatibility cannot render PCSS; retain its supported filtered shadow.
	light.light_angular_distance = KEY_ANGULAR_SIZE if shadows and _mode == "C" else 0.0
	light.shadow_bias = 0.045
	light.shadow_normal_bias = 0.65
	light.directional_shadow_max_distance = SHADOW_DISTANCE
	light.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_4_SPLITS
	light.directional_shadow_blend_splits = true
	_owned_root.add_child(light)
	light.look_at_from_position(source, Vector3.ZERO, Vector3.UP)
	return light

func _process(_delta: float) -> void:
	if not _is_live():
		release()
		return
	_refresh_presentation()

func _refresh_presentation() -> void:
	for child in _scene.get_children():
		if child is Sprite3D:
			_light_sprite(child)
		elif child is MeshInstance3D:
			_light_mesh(child)
	_prune_dead_states(_sprite_states)
	_prune_dead_states(_material_states)
	for id in _unchanged_effect_ids.keys():
		if not is_instance_id_valid(id):
			_unchanged_effect_ids.erase(id)

func _light_sprite(sprite: Sprite3D) -> void:
	var id := sprite.get_instance_id()
	if _sprite_states.has(id) or _unchanged_effect_ids.has(id):
		return
	# Radiant/ink/Q materials are intentional source VFX. Their additive/ink
	# semantics stay unchanged; only ordinary source art receives 3D lighting.
	if sprite.material_override != null:
		_unchanged_effect_ids[id] = true
		return
	var ground := absf(sprite.rotation.x) > 1.0
	_sprite_states[id] = {"node": weakref(sprite), "shaded": sprite.shaded,
		"cast_shadow": sprite.cast_shadow, "ground": ground}
	sprite.shaded = true
	sprite.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF if ground \
		else GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

func _light_mesh(mesh: MeshInstance3D) -> void:
	var id := mesh.get_instance_id()
	if _material_states.has(id):
		return
	var original := mesh.material_override
	var replacement: Material
	var kind := ""
	if str(mesh.name) in FLOOR_NAMES and original is ShaderMaterial and original.shader != null:
		var code: String = original.shader.code
		var unlit_declaration := "render_mode unshaded, cull_disabled;"
		if not code.contains(unlit_declaration):
			return
		# Clone the source recipe and uniforms, keeping its exact texture/UV
		# sampling. Only this owned clone's light response changes.
		var floor_material := original.duplicate() as ShaderMaterial
		var lit_shader := Shader.new()
		code = code.replace(unlit_declaration, "render_mode cull_disabled, diffuse_burley, specular_schlick_ggx;")
		code = code.replace("ALBEDO = c.rgb; ALPHA = c.a;", "ALBEDO = c.rgb; ALPHA = c.a; ROUGHNESS = 0.94; SPECULAR = 0.10;")
		lit_shader.code = code
		floor_material.shader = lit_shader
		replacement = floor_material
		kind = "floor"
	elif original is StandardMaterial3D and original.shading_mode == BaseMaterial3D.SHADING_MODE_UNSHADED:
		var mass_material := original.duplicate() as StandardMaterial3D
		mass_material.shading_mode = BaseMaterial3D.SHADING_MODE_PER_PIXEL
		mass_material.roughness = MASS_ROUGHNESS
		mass_material.metallic = 0.0
		mass_material.metallic_specular = 0.14
		replacement = mass_material
		kind = "mass"
	if replacement == null:
		return
	_material_states[id] = {"node": weakref(mesh), "material": original,
		"replacement": replacement, "cast_shadow": mesh.cast_shadow, "kind": kind}
	mesh.material_override = replacement
	mesh.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF if kind == "floor" \
		else GeometryInstance3D.SHADOW_CASTING_SETTING_DOUBLE_SIDED

func _prune_dead_states(states: Dictionary) -> void:
	for id in states.keys():
		if not is_instance_valid(states[id].node.get_ref()):
			states.erase(id)

func _is_live() -> bool:
	return _ready and is_instance_valid(_main) and is_instance_valid(_perspective) \
		and is_instance_valid(_viewport) and is_instance_valid(_scene) \
		and is_instance_valid(_camera) and is_instance_valid(_owned_root) \
		and _perspective.get_parent() == _main and _viewport.get_camera_3d() == _camera \
		and _camera.get_parent() == _scene and _owned_root.get_parent() == _scene

func get_snapshot() -> Dictionary:
	var sprites_lit := 0
	var ground_sprites_lit := 0
	var upright_shadow_casters := 0
	var floor_materials_lit := 0
	var mass_materials_lit := 0
	var visible_mass_shadow_casters := 0
	for state in _sprite_states.values():
		var sprite := state.node.get_ref() as Sprite3D
		if not is_instance_valid(sprite):
			continue
		if sprite.shaded:
			sprites_lit += 1
			if state.ground:
				ground_sprites_lit += 1
		if sprite.visible and sprite.cast_shadow != GeometryInstance3D.SHADOW_CASTING_SETTING_OFF:
			upright_shadow_casters += 1
	for state in _material_states.values():
		var mesh := state.node.get_ref() as MeshInstance3D
		if not is_instance_valid(mesh) or mesh.material_override != state.replacement:
			continue
		if state.kind == "floor":
			floor_materials_lit += 1
		else:
			mass_materials_lit += 1
			if mesh.visible and mesh.cast_shadow != GeometryInstance3D.SHADOW_CASTING_SETTING_OFF:
				visible_mass_shadow_casters += 1
	return {"schema": SCHEMA, "ready": _is_live(), "reason": _reason, "mode": _mode,
		"rendering_method": RenderingServer.get_current_rendering_method(),
		"rendering_driver": RenderingServer.get_current_rendering_driver_name(),
		"camera_transform_owned_by_original_view": true,
		"camera_transform": _camera.global_transform if is_instance_valid(_camera) else Transform3D.IDENTITY,
		"camera_fov": _camera.fov if is_instance_valid(_camera) else 0.0,
		"original_assets_modified": false, "simulation_modified": false,
		"floor_materials_lit": floor_materials_lit, "mass_materials_lit": mass_materials_lit,
		"sprites_lit": sprites_lit, "ground_sprites_lit": ground_sprites_lit,
		"visible_upright_shadow_casters": upright_shadow_casters,
		"visible_mass_shadow_casters": visible_mass_shadow_casters,
		"source_effect_materials_unchanged": _unchanged_effect_ids.size(),
		"directional_shadow_enabled": _key.shadow_enabled if is_instance_valid(_key) else false,
		"key_source": KEY_SOURCE, "key_color": KEY_COLOR, "key_energy": KEY_ENERGY,
		"fill_source": FILL_SOURCE, "fill_color": FILL_COLOR, "fill_energy": FILL_ENERGY,
		"ambient_color": AMBIENT_COLOR, "ambient_energy": AMBIENT_ENERGY,
		"shadow_distance": SHADOW_DISTANCE, "floor_roughness": FLOOR_ROUGHNESS,
		"shadow_opacity": SHADOW_OPACITY, "shadow_blur": SHADOW_BLUR,
		"directional_angular_size_degrees": _key.light_angular_distance if is_instance_valid(_key) else 0.0,
		"directional_pcss_supported": _mode == "C",
		"source_baked_and_new_projected_shadow_overlap_possible": true,
		"mass_roughness": MASS_ROUGHNESS,
		"regular_fog": _environment.fog_enabled if _environment != null else false,
		"regular_fog_density": FOG_DENSITY,
		"volumetric_fog": _environment.volumetric_fog_enabled if _environment != null else false,
		"volumetric_fog_density": VOLUMETRIC_DENSITY if _mode == "C" else 0.0,
		"volumetric_fog_length": VOLUMETRIC_LENGTH if _mode == "C" else 0.0,
		"ssao": _environment.ssao_enabled if _environment != null else false,
		"glow": _environment.glow_enabled if _environment != null else false,
		"compatibility_glow_implementation": "simplified_screen" if _mode == "D" else "not_applicable",
		"unsupported_features_explicitly_disabled": ["volumetric_fog", "ssao", "ssil", "ssr", "sdfgi"] if _mode == "D" else [],
		"visual_approval": "USER_COMPARISON_PENDING"}

func release() -> void:
	set_process(false)
	for state in _sprite_states.values():
		var sprite := state.node.get_ref() as Sprite3D
		if is_instance_valid(sprite):
			sprite.shaded = state.shaded
			sprite.cast_shadow = state.cast_shadow
	for state in _material_states.values():
		var mesh := state.node.get_ref() as MeshInstance3D
		if is_instance_valid(mesh):
			mesh.material_override = state.material
			mesh.cast_shadow = state.cast_shadow
	if is_instance_valid(_camera):
		_camera.environment = _original_camera_environment
	if is_instance_valid(_owned_root):
		_owned_root.free()
	_material_states.clear()
	_sprite_states.clear()
	_unchanged_effect_ids.clear()
	_owned_root = null
	_environment = null
	_key = null
	_fill = null
	_original_camera_environment = null
	_main = null
	_perspective = null
	_viewport = null
	_scene = null
	_camera = null
	_ready = false
	_reason = "released"

func _exit_tree() -> void:
	release()

func _reject(reason: String) -> Dictionary:
	_reason = reason
	return {"schema": SCHEMA, "ready": false, "reason": reason}
