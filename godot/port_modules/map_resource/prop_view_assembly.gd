extends Node2D
## Isolated CH1-1 prop VIEW ASSEMBLY (MAP port, R11).
## Connects the EXISTING units into one owned Node2D view (no reimplementation):
##   R8 locked_prop_catalog  -> descriptor index + res lookup + texture_ready
##   R9 prop_nav_adapter      -> authored tile -> read-only nav-snap world
##   R10 prop_pivot_resolver  -> real texture/sz pivot geometry (scale/offset/bounds)
##   R7 landmark_visibility   -> camera_visible_rect (reused for culling intersection)
## Three bodies: (1) source coords + nav result; (2) real texture-ready + pivot
## geometry; (3) owner view update/terminate. No RootWorld placement/geometry/nav/
## camera canon change; an UNPROVIDED resource (no nav provider / no texture / no
## camera) yields ready=false for that facet (the node still assembles at the source
## position). zones_mask/SVG/zoneblend remain HELD (no access). No prior success
## suite / PNG is re-run; R6-R10 files are untouched.

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-prop-view-assembly-r11-20261014"

const Catalog := preload("res://port_modules/map_resource/locked_prop_catalog.gd")
const NavAdapter := preload("res://port_modules/map_resource/prop_nav_adapter.gd")
const PivotResolver := preload("res://port_modules/map_resource/prop_pivot_resolver.gd")
const Visibility := preload("res://port_modules/map_resource/landmark_visibility.gd")

var _catalog
var _nav
var _pivot
var _vis
var _built := false
var _last: Array = []   # per-entry assembly records

func _ensure_units() -> void:
	if _catalog == null: _catalog = Catalog.new()
	if _nav == null: _nav = NavAdapter.new()
	if _pivot == null: _pivot = PivotResolver.new()
	if _vis == null: _vis = Visibility.new()

func _resolve_texture(id: String, tex_map: Dictionary) -> Texture2D:
	var tex: Texture2D = tex_map.get(id, null)
	if tex != null:
		return tex
	var rt := String(_catalog.res_target(id))
	if rt != "" and ResourceLoader.exists(rt):
		return ResourceLoader.load(rt) as Texture2D   # product asset (absent -> not reached)
	return null

## Bodies 1+2+3 — assemble one owned child Sprite2D per catalog entry, wiring
## source coord -> nav snap -> texture-ready -> pivot geometry -> culling -> Node.
## floor_provider / camera / tex_map are owner-supplied (read-only); absent -> that
## facet's ready=false (no nav/size/texture invented).
func assemble(floor_provider: Callable = Callable(), camera: Dictionary = {}, tex_map: Dictionary = {}) -> Dictionary:
	_ensure_units()
	terminate()
	var has_cam := not camera.is_empty()
	var cam_rect: Rect2 = _vis.camera_visible_rect(camera) if has_cam else Rect2()
	for e in _catalog.catalog():
		var id := String(e["id"])
		var inst_scale := float(e["handprops_scale"])
		var meta := {"sz": int(e["base_sz"]), "keepAR": true}

		# body 1 — source coord + nav result
		var navr: Dictionary = _nav.resolve(e, floor_provider)
		var nav_ready := bool(navr["ready"]) and bool(navr["found"])
		var world: Vector2 = navr["snapped_world"] if nav_ready else Vector2(float(e["authored_world"][0]), float(e["authored_world"][1]))
		var world_source := String(navr.get("world_source", "authored"))

		# body 2 — texture-ready + pivot geometry
		var tex := _resolve_texture(id, tex_map)
		var tex_ready := tex != null
		var pivr: Dictionary = _pivot.resolve(meta, tex, world, inst_scale)
		var geom_ready := bool(pivr["ready"])

		# build the owned Node view
		var s := Sprite2D.new()
		s.name = "prop_" + id
		s.centered = false
		s.position = world
		s.z_as_relative = false
		s.z_index = 0
		if geom_ready and tex_ready:
			_pivot.apply_to_view(s, meta, tex, world, inst_scale)   # scale/offset/texture/pos

		# culling — reuse R7 camera_visible_rect; intersect with the real bounds
		var visible := true
		if has_cam:
			if geom_ready:
				visible = (pivr["world_bounds"] as Rect2).intersects(cam_rect)
			else:
				visible = cam_rect.has_point(world)   # no geometry yet -> test the anchor
		s.visible = visible
		add_child(s)

		var ready_all := nav_ready and tex_ready and geom_ready and (not has_cam or true)
		_last.append({
			"id": id,
			"world": world,
			"world_source": world_source,
			"nav_ready": nav_ready,
			"tex_ready": tex_ready,
			"geom_ready": geom_ready,
			"visible": visible,
			"ready": ready_all,
			"has_texture": s.texture != null,
		})
	_built = true
	var all_ready := true
	for r in _last:
		if not r["ready"]:
			all_ready = false
	return {"count": _last.size(), "all_ready": all_ready, "entries": _last.duplicate(true)}

## body 3 — owner update: re-run the assembly with (possibly new) provider/camera/tex.
func update(floor_provider: Callable = Callable(), camera: Dictionary = {}, tex_map: Dictionary = {}) -> Dictionary:
	return assemble(floor_provider, camera, tex_map)

func terminate() -> void:
	for c in get_children():
		remove_child(c)
		c.queue_free()
	_last.clear()
	_built = false

func _free_units() -> void:
	if _catalog != null and is_instance_valid(_catalog): _catalog.free()
	_catalog = null; _nav = null; _pivot = null; _vis = null

## Full owner teardown (views + helper unit instances).
func dispose() -> void:
	terminate()
	_free_units()

func snapshot() -> Dictionary:
	var per: Array = []
	for c in get_children():
		var s := c as Sprite2D
		per.append({
			"name": c.name,
			"pos": s.position if s != null else Vector2.ZERO,
			"visible": c.visible,
			"has_texture": s != null and s.texture != null,
		})
	return {"built": _built, "child_count": get_child_count(), "entries": per}
