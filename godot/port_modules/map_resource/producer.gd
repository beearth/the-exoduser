extends RefCounted
## Isolated CH1-1 floor/environment resource producer (MAP port, first slice).
## Builds a Godot draw/material consumer for ONE approved ground material — the
## CH1-1 base soil floor — reproducing its raw HTML values exactly. It never
## opens/loads/writes the original PNG (caller supplies the Texture2D), never
## touches geometry/initial-16/placement/collision/nav/camera/START/EXIT, and
## minting/import/hash of any new canonical asset is out of scope.
##
## Raw source (read-only, R repo):
##   R/assets/map/ch1/production_finish/composition.json#/groundMaterials/soil
##     = {"file":"ground_dark_soil.png","brightness":0.85,"saturation":0.48}
##   R/assets/map/ch1/production_finish/composition.json#/groundTile = [1024,1024]
##   R/.../composition.json#/worldSize = [8000,8000] ; layout.js tileSize = 40
##   canonical PNG path (R): assets/map/ch1/ground_dark_soil.png
##
## HTML semantics preserved 1:1:
##   brightness 0.85  -> RGB *= 0.85            (darken to 85%)
##   saturation 0.48  -> mix(luma, rgb, 0.48)   (desaturate toward 48% of original)
##   groundTile 1024  -> texture repeats every 1024 world px across the 8000 world.

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource"
const SOURCE_POINTER := "R/assets/map/ch1/production_finish/composition.json#/groundMaterials/soil"

# --- raw constants mirrored verbatim from the HTML source (do not retune) ---
const SOIL_FILE := "ground_dark_soil.png"
const SOIL_CANONICAL_R := "assets/map/ch1/ground_dark_soil.png"
const SOIL_BRIGHTNESS := 0.85
const SOIL_SATURATION := 0.48
const GROUND_TILE_WORLD := 1024.0   # groundTile[0]==groundTile[1]
const WORLD_SIZE := 8000.0          # worldSize[0]==worldSize[1]
const TILE_SIZE_PX := 40.0          # layout.js CH1_1_PRODUCTION.tileSize

## Returns the frozen soil floor spec (raw values + source pointers). Pure data.
func build_soil_spec() -> Dictionary:
	return {
		"id": "ch1_1_floor_soil",
		"source_pointer": SOURCE_POINTER,
		"canonical_png_r": SOIL_CANONICAL_R,
		"file": SOIL_FILE,
		"brightness": SOIL_BRIGHTNESS,
		"saturation": SOIL_SATURATION,
		"tile_world_size": GROUND_TILE_WORLD,
		"world_size": WORLD_SIZE,
		"tile_size_px": TILE_SIZE_PX,
		"repeat": true,
		"blend_space": "srgb",
		"raw_preserved": true,
	}

## The canvas_item shader source for the soil floor. UV is expected in 0..1 across
## the world; the shader maps it to world px and repeats the texture every tile.
func soil_shader_code() -> String:
	return """shader_type canvas_item;
uniform sampler2D soil_tex : repeat_enable, filter_linear;
uniform float brightness = 0.85;
uniform float saturation = 0.48;
uniform float world_size = 8000.0;
uniform float tile_world = 1024.0;
void fragment() {
	vec2 world_uv = UV * world_size;
	vec2 tiled = world_uv / tile_world;
	vec4 c = texture(soil_tex, tiled);
	float luma = dot(c.rgb, vec3(0.299, 0.587, 0.114));
	c.rgb = mix(vec3(luma), c.rgb, saturation);
	c.rgb *= brightness;
	COLOR = c;
}
"""

## Builds the floor ShaderMaterial. `texture` is caller-provided (no load/import
## here); null is allowed so the material/shader can be constructed headlessly.
## Returns a ShaderMaterial whose uniforms carry the raw values verbatim.
func build_floor_material(texture: Texture2D = null) -> ShaderMaterial:
	var shader := Shader.new()
	shader.code = soil_shader_code()
	var mat := ShaderMaterial.new()
	mat.shader = shader
	mat.set_shader_parameter("brightness", SOIL_BRIGHTNESS)
	mat.set_shader_parameter("saturation", SOIL_SATURATION)
	mat.set_shader_parameter("world_size", WORLD_SIZE)
	mat.set_shader_parameter("tile_world", GROUND_TILE_WORLD)
	if texture != null:
		mat.set_shader_parameter("soil_tex", texture)
	return mat

## Convenience: the exact uniform values the material should carry, for tests.
func expected_uniforms() -> Dictionary:
	return {
		"brightness": SOIL_BRIGHTNESS,
		"saturation": SOIL_SATURATION,
		"world_size": WORLD_SIZE,
		"tile_world": GROUND_TILE_WORLD,
	}
