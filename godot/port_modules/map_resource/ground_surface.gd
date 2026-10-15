extends Node2D
## Isolated CH1-1 ground SURFACE draw consumer (MAP port, R4).
## Binds the already-approved soil producer + litter overlay materials to real
## CanvasItems and draws them in the original pass order (soil base -> litter
## overlay) across the world. No zone mask / SVG / zone_weights here (that unit is
## on HOLD). Textures are caller-provided (no load/import/mint). No geometry /
## collision / nav / camera / START / EXIT / main / world change.
##
## Raw pass contract (preserved 1:1 from the HTML ground compose):
##   pass 0  soil base  — tile 1024, brightness 0.85, saturation 0.48  (producer.gd)
##   pass 1  litter over — tile 512,  brightness 0.76, saturation 0.55, alpha 0.7 (litter.gd)
##   world 8000 x 8000 ; tile size 40 px. litter composites over soil (z_index 0 -> 1).

const Soil := preload("res://port_modules/map_resource/producer.gd")
const Litter := preload("res://port_modules/map_resource/litter.gd")

const WORLD_SIZE := 8000.0

var _soil_producer := Soil.new()
var _litter_producer := Litter.new()
var _soil_rect: ColorRect = null
var _litter_rect: ColorRect = null
var _bound := false

## Pure description of the two draw passes + their raw specs (no textures needed).
func build() -> Dictionary:
	return {
		"id": "ch1_1_ground_surface",
		"world_size": WORLD_SIZE,
		"passes": [
			{"index": 0, "layer": "ch1_1_floor_soil", "z_index": 0, "spec": _soil_producer.build_soil_spec()},
			{"index": 1, "layer": "ch1_1_floor_litter", "z_index": 1, "spec": _litter_producer.build_litter_spec()},
		],
		"pass_order": ["ch1_1_floor_soil", "ch1_1_floor_litter"],
		"read_only_source": true,
		"raw_preserved": true,
	}

func _make_rect(world: float) -> ColorRect:
	var r := ColorRect.new()
	r.size = Vector2(world, world)
	r.position = Vector2.ZERO
	r.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return r

## Build the two CanvasItem passes and bind materials. Textures are caller-provided
## (null allowed for headless structural construction; no load/import here).
func bind_textures(soil_tex: Texture2D = null, litter_tex: Texture2D = null) -> void:
	terminate()
	_soil_rect = _make_rect(WORLD_SIZE)
	_soil_rect.name = "SoilBase"
	_soil_rect.z_index = 0
	_soil_rect.material = _soil_producer.build_floor_material(soil_tex)
	add_child(_soil_rect)

	_litter_rect = _make_rect(WORLD_SIZE)
	_litter_rect.name = "LitterOverlay"
	_litter_rect.z_index = 1
	_litter_rect.material = _litter_producer.build_overlay_material(litter_tex)
	add_child(_litter_rect)

	_bound = true

## Re-assign textures without rebuilding the nodes (idempotent refresh).
func update_surface(soil_tex: Texture2D = null, litter_tex: Texture2D = null) -> void:
	if not _bound:
		bind_textures(soil_tex, litter_tex)
		return
	if soil_tex != null and _soil_rect != null and _soil_rect.material is ShaderMaterial:
		(_soil_rect.material as ShaderMaterial).set_shader_parameter("soil_tex", soil_tex)
	if litter_tex != null and _litter_rect != null and _litter_rect.material is ShaderMaterial:
		(_litter_rect.material as ShaderMaterial).set_shader_parameter("litter_tex", litter_tex)

## Free the pass nodes and clear state. Safe to call repeatedly.
func terminate() -> void:
	if _litter_rect != null:
		if _litter_rect.get_parent() == self:
			remove_child(_litter_rect)
		_litter_rect.queue_free()
		_litter_rect = null
	if _soil_rect != null:
		if _soil_rect.get_parent() == self:
			remove_child(_soil_rect)
		_soil_rect.queue_free()
		_soil_rect = null
	_bound = false

## Structural snapshot for tests.
func snapshot() -> Dictionary:
	return {
		"bound": _bound,
		"child_count": get_child_count(),
		"soil_z": _soil_rect.z_index if _soil_rect != null else -1,
		"litter_z": _litter_rect.z_index if _litter_rect != null else -1,
		"soil_is_shader": _soil_rect != null and _soil_rect.material is ShaderMaterial,
		"litter_is_shader": _litter_rect != null and _litter_rect.material is ShaderMaterial,
	}
