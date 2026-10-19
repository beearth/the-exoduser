extends Node2D
## Isolated CH1-1 MAP VIEW OWNER (MAP port, R13).
## The single public display-owner that composes the already-approved units into ONE
## real Node parent (no reimplementation):
##   R12 ground_source_binding -> binds central soil/litter textures into an owned R4
##                                ground_surface (sourceReady gate + effective z).
##   R11 prop_view_assembly    -> owned Node2D view of the locked props (nav/tex/pivot/cull).
## Three bodies:
##   (1) forward the ORIGINAL floor/camera/central texture inputs straight to the
##       existing APIs — NO duplication of the formula/coords/_nearFloor.
##   (2) keep ground and prop readiness INDEPENDENT; perform the actual Node parent
##       binding/update. A missing source PNG/import -> that facet's exact gap; a fake
##       texture NEVER promotes product-readiness.
##   (3) terminate/dispose reclaim ONLY this owner's own-created nodes; the prior
##       source / WIP modules are unchanged.
## No central world/floor/nav/collision/camera/coord/pivot/START/EXIT change.
## zones_mask / zone-mask / zoneblend / SVG / zone_weights remain HELD — their reject
## purpose and dependent results are not accessed / reproduced / implemented here.

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-map-view-owner-r13-20261014"

const Binding := preload("res://port_modules/map_resource/ground_source_binding.gd")   # R12
const Surface := preload("res://port_modules/map_resource/ground_surface.gd")          # R4
const PropAssembly := preload("res://port_modules/map_resource/prop_view_assembly.gd") # R11

var _binding                 # RefCounted (R12)
var _surface                 # Node2D  (R4)  — own-created child
var _props                   # Node2D  (R11) — own-created child
var _mounted := false
var _ground_report: Dictionary = {}
var _props_report: Dictionary = {}

## Body 1+2 — mount the owned view. The central inputs are forwarded AS-IS: ground
## soil/litter textures + z decision to R12.bind; floor_provider / camera / prop
## tex_map to R11.assemble. Nothing is re-derived here (no coord/nav/pivot math).
func mount(floor_provider: Callable = Callable(), camera: Dictionary = {}, ground_textures: Dictionary = {}, ground_z: Dictionary = {}, prop_tex_map: Dictionary = {}) -> Dictionary:
	terminate()

	# ground: own an R4 surface child, bind the central textures via R12 (sourceReady)
	_surface = Surface.new()
	_surface.name = "GroundSurface"
	add_child(_surface)
	_binding = Binding.new()
	var gr: Dictionary = _binding.bind(_surface, ground_z, ground_textures)

	# props: own the R11 assembly child; forward floor/camera/tex straight through
	_props = PropAssembly.new()
	_props.name = "PropViewAssembly"
	add_child(_props)
	var pr: Dictionary = _props.assemble(floor_provider, camera, prop_tex_map)

	_mounted = true
	_ground_report = gr
	_props_report = pr
	return _report(gr, pr)

## Body 2 — owner update: re-run both domains independently with (possibly new)
## central inputs, re-using the SAME owned children (no rebuild of the modules).
func update(floor_provider: Callable = Callable(), camera: Dictionary = {}, ground_textures: Dictionary = {}, ground_z: Dictionary = {}, prop_tex_map: Dictionary = {}) -> Dictionary:
	if not _mounted:
		return mount(floor_provider, camera, ground_textures, ground_z, prop_tex_map)
	var gr: Dictionary = _binding.update(_surface, ground_z, ground_textures)
	var pr: Dictionary = _props.update(floor_provider, camera, prop_tex_map)
	_ground_report = gr
	_props_report = pr
	return _report(gr, pr)

## Body 3 — terminate: free ONLY this owner's own-created nodes. The prior source /
## WIP modules (R1/R2/R4/R5/R7-R12 files) are never touched.
func terminate() -> void:
	if _binding != null and _surface != null:
		_binding.terminate(_surface)     # frees the surface's own passes (R12 delegate)
	if _props != null:
		_props.dispose()                 # frees the assembly's own sprites (R11)
	if _surface != null:
		if _surface.get_parent() == self:
			remove_child(_surface)
		_surface.queue_free()
		_surface = null
	if _props != null:
		if _props.get_parent() == self:
			remove_child(_props)
		_props.queue_free()
		_props = null
	_binding = null
	_mounted = false
	_ground_report = {}
	_props_report = {}

## Full teardown alias (owner-created nodes only).
func dispose() -> void:
	terminate()

## Independent readiness report. Ground and props each keep their own ready state;
## a fake texture NEVER promotes product-readiness (the underlying units enforce it).
func _report(gr: Dictionary, pr: Dictionary) -> Dictionary:
	var prop_not_ready: Array = []
	for e in (pr.get("entries", []) as Array):
		if not e.get("ready", false):
			prop_not_ready.append({
				"id": e.get("id", ""),
				"nav_ready": e.get("nav_ready", false),
				"tex_ready": e.get("tex_ready", false),
				"geom_ready": e.get("geom_ready", false),
			})
	return {
		"mounted": _mounted,
		"node_children": get_child_count(),
		"ground": {
			"ready": gr.get("all_source_ready", false),
			"soil_bound": gr.get("soil_bound", false),
			"litter_bound": gr.get("litter_bound", false),
			"z_applied": gr.get("z_applied", false),
			"soil_effective_z": gr.get("soil_effective_z", null),
			"litter_effective_z": gr.get("litter_effective_z", null),
			"gaps": gr.get("gaps", []),          # R12 exact source->import gaps, as-is
		},
		"props": {
			"ready": pr.get("all_ready", false),
			"count": pr.get("count", 0),
			"not_ready": prop_not_ready,         # per-facet, no fabricated readiness
		},
		"independent": true,                     # ground & props readiness are separate
		"overall_ready": gr.get("all_source_ready", false) and pr.get("all_ready", false),
	}

## PRODUCTION (CH1-1 perspective, same TASK) — public SURFACE packet for the ENGINE
## NativePerspectiveView: it points ENGINE at the LIVE ground ShaderMaterial surface (consumed
## as floorplanes) and the prop Sprite2D view (lifted to Sprite3D), carrying only the readiness
## already computed by the sub-owners. No new geometry/coords/numbers; no projection call
## (ENGINE owns Camera3D). Live: reflects the last mount/update; empty after terminate().
func surface_packet() -> Dictionary:
	return {
		"schema": "exoduser.godot.ch1-native-first.surface-packet.v1",
		"ground": {
			"node": "GroundSurface",
			"present": _surface != null,
			"ready": _ground_report.get("all_source_ready", false),   # R12 gate; fake tex never promotes
			"soil_z": _ground_report.get("soil_effective_z", null),
			"litter_z": _ground_report.get("litter_effective_z", null),
			"gaps": _ground_report.get("gaps", []),
		},
		"props": {
			"node": "PropViewAssembly",
			"present": _props != null,
			"count": _props_report.get("count", 0),
			"ready": _props_report.get("all_ready", false),
		},
	}

## Structural snapshot (owner + both domains). No readiness promotion.
func snapshot() -> Dictionary:
	var ground_snap: Dictionary = _surface.snapshot() if _surface != null else {}
	var props_snap: Dictionary = _props.snapshot() if _props != null else {}
	return {
		"mounted": _mounted,
		"child_count": get_child_count(),
		"has_ground": _surface != null,
		"has_props": _props != null,
		"ground": ground_snap,
		"props": props_snap,
	}
