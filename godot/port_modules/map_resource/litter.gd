extends RefCounted
## Isolated CH1-1 floor OVERLAY resource producer (MAP port, litter unit R2).
## Builds a Godot draw/material consumer for ONE approved ground overlay — the
## forest moss litter layer drawn over the base soil floor — reproducing its raw
## HTML values exactly. It never opens/loads/writes the original PNG (caller
## supplies the Texture2D), never touches geometry/initial-16/placement/collision/
## nav/camera/START/EXIT, and mints/hashes/imports no new canonical asset.
##
## Raw source (read-only, R repo):
##   R/assets/map/ch1/production_finish/composition.json#/groundMaterials/litter
##     = {"file":"materials/forest_moss_litter.png","tileSize":512,"brightness":0.76,"saturation":0.55}
##   overlay alpha from #/alphaFeather/groundOpacityMultiplier = 0.7
##   #/worldSize = [8000,8000] ; layout.js tileSize = 40
##   canonical PNG (R): assets/map/ch1/production_finish/materials/forest_moss_litter.png
##
## HTML semantics preserved 1:1:
##   brightness 0.76  -> RGB *= 0.76
##   saturation 0.55  -> mix(luma, rgb, 0.55)
##   tileSize   512   -> texture repeats every 512 world px (NOTE: litter's own 512, not soil's 1024)
##   alpha      0.7   -> COLOR.a *= 0.7  (overlay opacity; drawn over the soil floor)

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-map-litter-r2-20261013"
const SOURCE_POINTER := "R/assets/map/ch1/production_finish/composition.json#/groundMaterials/litter"
const ALPHA_POINTER := "R/.../composition.json#/alphaFeather/groundOpacityMultiplier"

# --- raw constants mirrored verbatim from the HTML source (do not retune) ---
const LITTER_FILE := "materials/forest_moss_litter.png"
const LITTER_CANONICAL_R := "assets/map/ch1/production_finish/materials/forest_moss_litter.png"
const LITTER_BRIGHTNESS := 0.76
const LITTER_SATURATION := 0.55
const LITTER_TILE_WORLD := 512.0        # litter's own tileSize (world px per repeat)
const LITTER_OVERLAY_ALPHA := 0.7       # alphaFeather.groundOpacityMultiplier
const WORLD_SIZE := 8000.0
const TILE_SIZE_PX := 40.0

## Returns the frozen litter overlay spec (raw values + source pointers). Pure data.
func build_litter_spec() -> Dictionary:
	return {
		"id": "ch1_1_floor_litter",
		"kind": "overlay",
		"source_pointer": SOURCE_POINTER,
		"alpha_pointer": ALPHA_POINTER,
		"canonical_png_r": LITTER_CANONICAL_R,
		"file": LITTER_FILE,
		"brightness": LITTER_BRIGHTNESS,
		"saturation": LITTER_SATURATION,
		"tile_world_size": LITTER_TILE_WORLD,
		"overlay_alpha": LITTER_OVERLAY_ALPHA,
		"world_size": WORLD_SIZE,
		"tile_size_px": TILE_SIZE_PX,
		"repeat": true,
		"blend_space": "srgb",
		"draw_over": "ch1_1_floor_soil",
		"raw_preserved": true,
	}

## canvas_item shader: repeat-tiled litter, saturation mix, brightness multiply,
## and overlay alpha multiply so it composites over the soil floor.
func litter_shader_code() -> String:
	return """shader_type canvas_item;
uniform sampler2D litter_tex : repeat_enable, filter_linear;
uniform float brightness = 0.76;
uniform float saturation = 0.55;
uniform float world_size = 8000.0;
uniform float tile_world = 512.0;
uniform float overlay_alpha = 0.7;
void fragment() {
	vec2 world_uv = UV * world_size;
	vec2 tiled = world_uv / tile_world;
	vec4 c = texture(litter_tex, tiled);
	float luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
	c.rgb = mix(vec3(luma), c.rgb, saturation);
	c.rgb *= brightness;
	c.a *= overlay_alpha;
	COLOR = c;
}
"""

## Builds the overlay ShaderMaterial. `texture` is caller-provided (no load/import
## here); null is allowed for headless construction. Uniforms carry raw values.
func build_overlay_material(texture: Texture2D = null) -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = litter_shader_code()
	var mat := ShaderMaterial.new()
	mat.shader = shader
	mat.set_shader_parameter("brightness", LITTER_BRIGHTNESS)
	mat.set_shader_parameter("saturation", LITTER_SATURATION)
	mat.set_shader_parameter("world_size", WORLD_SIZE)
	mat.set_shader_parameter("tile_world", LITTER_TILE_WORLD)
	mat.set_shader_parameter("overlay_alpha", LITTER_OVERLAY_ALPHA)
	if texture != null:
		mat.set_shader_parameter("litter_tex", texture)
	return mat

func expected_uniforms() -> Dictionary:
	return {
		"brightness": LITTER_BRIGHTNESS,
		"saturation": LITTER_SATURATION,
		"world_size": WORLD_SIZE,
		"tile_world": LITTER_TILE_WORLD,
		"overlay_alpha": LITTER_OVERLAY_ALPHA,
	}
