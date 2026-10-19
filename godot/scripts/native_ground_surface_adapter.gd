class_name ExoduserNativeGroundSurfaceAdapter
extends Node2D
## Actual CH1 ground underlay only. The unchanged MAP_RESOURCE producers own
## soil/litter shader recipes; no zone mask, geometry or simulation is added.

const PROVIDER = preload("res://port_modules/map_resource/ground_provider.gd")
const SURFACE = preload("res://port_modules/map_resource/ground_surface.gd")
const SOIL = preload("res://port_modules/map_resource/producer.gd")
const LITTER = preload("res://port_modules/map_resource/litter.gd")
const MAP_SCHEMA = "exoduser.godot.ch1-native-first.v1"
const BASE_Z = -3002
const WORLD_SIZE = Vector2(8000, 8000)
const SOIL_UNIFORMS = {"brightness":SOIL.SOIL_BRIGHTNESS, "saturation":SOIL.SOIL_SATURATION,
	"world_size":SOIL.WORLD_SIZE, "tile_world":SOIL.GROUND_TILE_WORLD}
const LITTER_UNIFORMS = {"brightness":LITTER.LITTER_BRIGHTNESS, "saturation":LITTER.LITTER_SATURATION,
	"world_size":LITTER.WORLD_SIZE, "tile_world":LITTER.LITTER_TILE_WORLD,
	"overlay_alpha":LITTER.LITTER_OVERLAY_ALPHA}

var _world: Node2D
var _provider: RefCounted
var _surface: Node2D
var _soil_texture: Texture2D
var _litter_texture: Texture2D
var _configured = false
var _disposed = false
var _configuration_error = ""

func configure(owner_world: Node2D) -> bool:
	if _configured or _disposed:
		return false
	if not is_instance_valid(owner_world) or not owner_world.is_inside_tree() \
			or owner_world.is_queued_for_deletion() \
			or not owner_world.has_method("get_native_map_surface_context"):
		return _reject("missing_live_world_map_context")
	var context: Variant = owner_world.get_native_map_surface_context()
	if not _map_supported(context):
		return _reject("unsupported_native_map_surface_context")
	var provider: RefCounted = PROVIDER.new()
	var soil: Texture2D = provider.load_soil()
	var litter: Texture2D = provider.load_litter()
	if not _texture_valid(soil, PROVIDER.TARGETS["soil"]["res_target"]):
		return _reject("missing_original_soil_texture")
	if not _texture_valid(litter, PROVIDER.TARGETS["litter"]["res_target"]):
		return _reject("missing_original_litter_texture")
	# Validate the real loaded textures in the exact original ShaderMaterials
	# before creating any CanvasItem child. Null-bound structural flags are not
	# readiness, even though the standalone Surface accepts null for its tests.
	var soil_recipe: RefCounted = SOIL.new()
	var litter_recipe: RefCounted = LITTER.new()
	var soil_material: ShaderMaterial = soil_recipe.build_floor_material(soil)
	var litter_material: ShaderMaterial = litter_recipe.build_overlay_material(litter)
	if not _material_valid(soil_material, "soil_tex", soil, soil_recipe.expected_uniforms()) \
			or not _material_valid(litter_material, "litter_tex", litter, litter_recipe.expected_uniforms()):
		return _reject("original_ground_material_binding_failed")
	var surface: Node2D = SURFACE.new()
	surface.name = "OriginalSoilLitterSurface"
	surface.z_as_relative = false
	surface.z_index = BASE_Z
	surface.bind_textures(soil, litter)
	if not _surface_materials_valid(surface, soil, litter):
		surface.free()
		return _reject("ground_surface_actual_pass_binding_failed")
	_world = owner_world
	_provider = provider
	_soil_texture = soil
	_litter_texture = litter
	_surface = surface
	transform = Transform2D.IDENTITY
	z_as_relative = false
	z_index = BASE_Z
	set_process(false)
	set_physics_process(false)
	add_child(_surface)
	_configured = true
	_configuration_error = ""
	return true

func is_native_surface_ready() -> bool:
	return _configured and not _disposed and not is_queued_for_deletion() \
		and is_inside_tree() and is_instance_valid(_world) \
		and get_parent() == _world and _world.is_inside_tree() \
		and not _world.is_queued_for_deletion() \
		and _map_supported(_world.get_native_map_surface_context()) \
		and transform == Transform2D.IDENTITY \
		and is_instance_valid(_surface) and _surface.get_parent() == self \
		and _surface.is_inside_tree() and not _surface.is_queued_for_deletion() \
		and _surface.transform == Transform2D.IDENTITY \
		and not _surface.z_as_relative and _surface.z_index == BASE_Z \
		and _surface_materials_valid(_surface, _soil_texture, _litter_texture)

## Only this adapter's owned Surface is destroyed, including detached or
## reparented instances. World chunks, props, collision and resources are never
## freed or changed. The empty adapter may remain parented; cleanup is idempotent.
func dispose() -> bool:
	if is_instance_valid(_surface):
		_surface.free()
	_surface = null
	_soil_texture = null
	_litter_texture = null
	_provider = null
	_configured = false
	_disposed = true
	_configuration_error = "disposed"
	return true

func get_snapshot() -> Dictionary:
	var context: Variant = _world.get_native_map_surface_context() if is_instance_valid(_world) else null
	var ready: bool = is_native_surface_ready()
	var passes: Array = []
	if is_instance_valid(_surface):
		for pass_name in ["SoilBase", "LitterOverlay"]:
			var item: ColorRect = _surface.get_node_or_null(pass_name) as ColorRect
			if not is_instance_valid(item):
				continue
			var material: ShaderMaterial = item.material as ShaderMaterial
			var sampler = "soil_tex" if pass_name == "SoilBase" else "litter_tex"
			var texture: Texture2D = material.get_shader_parameter(sampler) as Texture2D if material != null else null
			passes.append({"name":pass_name, "position":item.position, "size":item.size,
				"z_relative":item.z_as_relative, "local_z":item.z_index,
				"effective_z":_surface.z_index + item.z_index,
				"texture":_texture_snapshot(texture), "sampler":sampler,
				"inside_tree":item.is_inside_tree(), "queued_deletion":item.is_queued_for_deletion(),
				"actual_shader_material":material != null and material.shader != null})
	return {"configured":_configured, "ready":ready,
		"disposed":_disposed, "configuration_error":_configuration_error,
		"soil":_texture_snapshot(_soil_texture), "litter":_texture_snapshot(_litter_texture),
		"passes":passes, "pass_count":passes.size(),
		"surface_parent_is_adapter":is_instance_valid(_surface) and _surface.get_parent() == self,
		"surface_z":_surface.z_index if is_instance_valid(_surface) else BASE_Z,
		"local_origin":Vector2.ZERO, "world_size":WORLD_SIZE,
		"map_context":context.duplicate(true) if context is Dictionary else {},
		"automatic_native_clock":false, "caller_scope":"CH1_stage0_soil_litter_underlay_only",
		"zones_mask_or_blend_ported":false, "geometry_collision_nav_changed":false,
		"resource_binding_ready":ready}

static func _surface_materials_valid(surface: Node2D, soil: Texture2D, litter: Texture2D) -> bool:
	if not is_instance_valid(surface) or surface.get_child_count() != 2 \
			or not _texture_valid(soil, PROVIDER.TARGETS["soil"]["res_target"]) \
			or not _texture_valid(litter, PROVIDER.TARGETS["litter"]["res_target"]):
		return false
	var soil_rect: ColorRect = surface.get_node_or_null("SoilBase") as ColorRect
	var litter_rect: ColorRect = surface.get_node_or_null("LitterOverlay") as ColorRect
	if not is_instance_valid(soil_rect) or not is_instance_valid(litter_rect):
		return false
	for item in [soil_rect, litter_rect]:
		if item.is_queued_for_deletion() or item.position != Vector2.ZERO or item.size != WORLD_SIZE \
				or item.rotation != 0.0 or item.scale != Vector2.ONE or not item.z_as_relative:
			return false
	return soil_rect.z_index == 0 and litter_rect.z_index == 1 \
		and _material_valid(soil_rect.material, "soil_tex", soil, SOIL_UNIFORMS) \
		and _material_valid(litter_rect.material, "litter_tex", litter, LITTER_UNIFORMS)

static func _material_valid(material: Variant, sampler: String, texture: Texture2D, uniforms: Dictionary) -> bool:
	if not material is ShaderMaterial or material.shader == null \
			or not is_same(material.get_shader_parameter(sampler), texture):
		return false
	for key in uniforms:
		var actual: Variant = material.get_shader_parameter(key)
		if not _number(actual) or not is_equal_approx(float(actual), float(uniforms[key])):
			return false
	return true

static func _texture_valid(texture: Texture2D, path: String) -> bool:
	return is_instance_valid(texture) and texture.resource_path == path \
		and texture.get_width() > 0 and texture.get_height() > 0

static func _texture_snapshot(texture: Texture2D) -> Dictionary:
	return {"path":texture.resource_path, "dimensions":Vector2i(texture.get_width(), texture.get_height()),
		"bound":true} if is_instance_valid(texture) else {"path":"", "dimensions":Vector2i.ZERO, "bound":false}

static func _map_supported(context: Variant) -> bool:
	if not context is Dictionary or context.get("schema") != MAP_SCHEMA:
		return false
	for key in ["stage", "width", "height", "tile_size"]:
		if not _number(context.get(key)):
			return false
	return float(context["stage"]) == 0.0 and float(context["width"]) == 200.0 \
		and float(context["height"]) == 200.0 and float(context["tile_size"]) == 40.0

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

func _reject(reason: String) -> bool:
	_configuration_error = reason
	return false
