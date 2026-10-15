extends RefCounted
## Isolated texture PROVIDER for the CH1-1 ground surface (MAP port, R5).
## Loads + caches the approved soil/litter Texture2D from EXISTING Godot product
## resources (res://), and wires them into a ground_surface instance. It NEVER
## copies/hashes/imports the original R PNG and NEVER mints a placeholder: when a
## product resource is absent it returns null and reports an exact source->target
## gap for ENGINE to own the import. No map geometry/collision/nav/camera/main
## change. The zone-mask/SVG/zone_weights unit is HELD and not touched here.

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-map-ground-provider-r5-20261013"

## R source (read-only ref) -> proposed Godot res:// target. ENGINE owns the actual
## import; these targets are PROPOSALS, mirroring the R asset layout. Not minted.
const TARGETS := {
	"soil": {
		"r_source": "assets/map/ch1/ground_dark_soil.png",
		"res_target": "res://assets/map/ch1/ground_dark_soil.png",
	},
	"litter": {
		"r_source": "assets/map/ch1/production_finish/materials/forest_moss_litter.png",
		"res_target": "res://assets/map/ch1/materials/forest_moss_litter.png",
	},
}

var _cache := {}

## Exact R source -> proposed res:// target map (ENGINE import proposal). Pure data.
func source_to_target() -> Dictionary:
	return TARGETS.duplicate(true)

func _load(kind: String) -> Texture2D:
	if _cache.has(kind):
		return _cache[kind]
	if not TARGETS.has(kind):
		return null
	var path: String = TARGETS[kind]["res_target"]
	# Only consume an EXISTING product resource. No import/copy/mint.
	if ResourceLoader.exists(path):
		var res := ResourceLoader.load(path)
		if res is Texture2D:
			_cache[kind] = res
			return res
	return null

func load_soil() -> Texture2D:
	return _load("soil")

func load_litter() -> Texture2D:
	return _load("litter")

func is_available(kind: String) -> bool:
	return _load(kind) != null

## Exact source->target gaps for the resources that are NOT yet in the product.
func gap() -> Array:
	var g: Array = []
	for k in TARGETS.keys():
		if not is_available(k):
			g.append({
				"kind": k,
				"r_source": TARGETS[k]["r_source"],
				"res_target": TARGETS[k]["res_target"],
				"status": "canonical-missing (ENGINE import pending; NOT minted, NOT a placeholder)",
			})
	return g

## Owner-command body: bind the real provider textures into a ground_surface.
## Missing textures bind as null (the surface still builds its 2 passes).
func apply_to_surface(surface) -> Dictionary:
	var soil := load_soil()
	var litter := load_litter()
	surface.bind_textures(soil, litter)
	return {
		"soil_bound": soil != null,
		"litter_bound": litter != null,
		"real_load": soil != null and litter != null,
		"gap": gap(),
	}

## Owner-command body: refresh an already-bound surface with the provider textures.
func refresh_surface(surface) -> Dictionary:
	var soil := load_soil()
	var litter := load_litter()
	surface.update_surface(soil, litter)
	return {
		"soil_bound": soil != null,
		"litter_bound": litter != null,
		"real_load": soil != null and litter != null,
	}
