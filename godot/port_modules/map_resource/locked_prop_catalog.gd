extends Node2D
## Isolated CH1-1 LOCKED hand-prop CATALOG + NodeView consumer (MAP port, R8).
## Three sub-units over the EXISTING authored handProps (read-only SSOT): (1) a
## source-descriptor index of the real id/tile→world/scale/collider/z for the 2-3
## currently-supported anchor props; (2) exact res:// texture lookup + cacheReady
## (absent asset -> null, ready=false); (3) owner-command create/bind/update/
## terminate of the catalog's Sprite2D views. It mints no map/coord/geometry/
## collision/nav/camera/START/EXIT/mainWorld placement, copies/imports no PNG, and
## NEVER overwrites a Root-source value — a conflict is reported as an exception gap.
## zones_mask/zoneblend/SVG/zone_weights remain HELD (no access). The R6 landmark
## view/culling and the ground suites are NOT re-run here.
##
## First-consumer path confirmed (read-only): game.html:23180-23199 [HAND_DECO]
##   world = (_nearFloor(H.x,H.y)+0.5)*T  (T=40)  -> runtime nearest-floor SNAP,
##     a nav dependency not resolvable offline; catalog stores the AUTHORED tile→world.
##   H.scale applied only when stage==0 (CH1-1) && H.scale && H.scale!=1.
##   z: generic MAP_OBJS y-sort by world y (no fixed z number); rot = H.rot||0.
##   pivot: this path passes NO per-prop pivot -> exact fraction is a missing field.
## Source rows (read-only, confirmed — not invented):
##   game.html:16035 handProps {id:'m_c1tree',x:102,y:90}
##   game.html:16050 handProps {id:'m_c1altar',x:147,y:97,scale:1.45}
##   game.html:16041 handProps {id:'m_c1cocoon',x:47,y:50,scale:1.55}
##   game.html:15490 _OBJ_META m_c1tree  file prop_corpsetree.png sz1450 colW380 colH230 keepAR
##   game.html:15506 _OBJ_META m_c1altar file prop_altar.png sz330 colSz95 keepAR
##   game.html:15508 _OBJ_META m_c1cocoon file prop_cocoon.png sz280 colSz80 keepAR

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-locked-prop-catalog-r8-20261013"
const TILE_SIZE_PX := 40.0

## Locked read-only catalog of the currently-supported CH1-1 anchor props.
## authored_world = (tile+0.5)*40 (pre-nav-snap). pivot_y is null (missing in the
## hand-prop consumer path); z_policy is y-sort (no fixed z). No value is invented.
const CATALOG := [
	{
		"id": "m_c1tree", "order": "primary", "region": "corpse_basin",
		"tile": [102, 90], "authored_world": [4100.0, 3620.0],
		"handprops_scale": 1.0,            # no H.scale in handProps -> 1.0 in stage-0 consumer
		"base_sz": 1450, "collider": {"colW": 380, "colH": 230}, "keep_ar": true,
		"rot": 0.0, "pivot_y": null, "z_policy": "y-sort by world y",
		"file": "prop_corpsetree.png", "res_target": "res://assets/map/ch1/objects/prop_corpsetree.png",
	},
	{
		"id": "m_c1altar", "order": "secondary", "region": "cursed_altar",
		"tile": [147, 97], "authored_world": [5900.0, 3900.0],
		"handprops_scale": 1.45,
		"base_sz": 330, "collider": {"colSz": 95}, "keep_ar": true,
		"rot": 0.0, "pivot_y": null, "z_policy": "y-sort by world y",
		"file": "prop_altar.png", "res_target": "res://assets/map/ch1/objects/prop_altar.png",
	},
	{
		"id": "m_c1cocoon", "order": "tertiary", "region": "rotten_cocoon_cluster",
		"tile": [47, 50], "authored_world": [1900.0, 2020.0],
		"handprops_scale": 1.55,
		"base_sz": 280, "collider": {"colSz": 80}, "keep_ar": true,
		"rot": 0.0, "pivot_y": null, "z_policy": "y-sort by world y",
		"file": "prop_cocoon.png", "res_target": "res://assets/map/ch1/objects/prop_cocoon.png",
	},
]

var _views: Dictionary = {}     # id -> Sprite2D
var _tex_cache: Dictionary = {} # id -> Texture2D (loaded, cached)
var _bound := false

## Sub-unit 1 — read-only descriptor index.
func catalog() -> Array:
	return CATALOG.duplicate(true)

func count() -> int:
	return CATALOG.size()

func entry(id: String) -> Dictionary:
	for e in CATALOG:
		if e["id"] == id:
			return (e as Dictionary).duplicate(true)
	return {}

## Sub-unit 2 — exact res:// lookup + cacheReady. Absent -> null, ready=false, no mint.
func res_target(id: String) -> String:
	var e := entry(id)
	return String(e["res_target"]) if not e.is_empty() else ""

func _load(id: String) -> Texture2D:
	if _tex_cache.has(id):
		return _tex_cache[id]
	var rt := res_target(id)
	if rt == "" or not ResourceLoader.exists(rt):
		return null
	var res: Resource = ResourceLoader.load(rt)
	var tex := res as Texture2D
	if tex != null:
		_tex_cache[id] = tex
	return tex

## product texture readiness (the real asset exists+loads) — distinct from snapshot "bound".
func texture_ready(id: String) -> bool:
	return _load(id) != null

## Exact source->target gaps for any catalog texture absent from the product (no mint).
func texture_gaps() -> Array:
	var out: Array = []
	for e in CATALOG:
		var rt := String(e["res_target"])
		if not ResourceLoader.exists(rt):
			out.append({
				"id": e["id"], "file": e["file"], "res_target": rt,
				"status": "canonical-missing (ENGINE import pending; NOT minted)",
			})
	return out

## Exception gaps / exact-missing fields — reported, never resolved by overwrite.
func conflicts() -> Array:
	return [
		{
			"id": "m_c1tree", "kind": "scale/pivot conflict",
			"detail": "R6/docs display_scale 0.72 & pivotY 0.72 (맵구성_1장.md:220) are a DISPLAY spec; the handProps first-consumer path carries no scale (->1.0) and no pivotY. Conflict reported; neither value overwritten (R6 descriptor untouched).",
		},
		{
			"kind": "pivot_y missing (all entries)",
			"detail": "The [HAND_DECO] consumer passes no per-prop pivotY; the exact foot-anchor fraction lives in the generic MAP_OBJS renderer (not inspected). Views use a labeled bottom-center foot default; exact fraction is a missing-API handoff to ENGINE.",
		},
		{
			"kind": "placement nav-snap dependency",
			"detail": "Real world pos = _nearFloor(tile) then (+0.5)*40 (game.html:23185-23187) — a runtime nav/floor dependency. Catalog stores AUTHORED tile→world; the snapped position is ENGINE-owned (no nav access here).",
		},
	]

## Sub-unit 3 — owner commands. Builds one Sprite2D view per catalog entry.
## tex_map: optional {id -> Texture2D} caller-provided; else product load (null allowed).
func build_views(tex_map: Dictionary = {}) -> int:
	terminate()
	for e in CATALOG:
		var id := String(e["id"])
		var s := Sprite2D.new()
		s.name = "prop_" + id
		s.centered = false
		s.position = Vector2(float(e["authored_world"][0]), float(e["authored_world"][1]))
		var sc := float(e["handprops_scale"])
		s.scale = Vector2(sc, sc)
		s.z_as_relative = false
		s.z_index = 0                              # depth = generic y-sort (no fixed z)
		var tex: Texture2D = tex_map.get(id, null)
		if tex == null:
			tex = _load(id)                        # product load; null if absent (not minted)
		if tex != null:
			s.texture = tex
			# labeled bottom-center foot default (pivot_y missing in source path)
			s.offset = Vector2(-tex.get_width() * 0.5, -tex.get_height())
		_views[id] = s
		add_child(s)
	_bound = true
	return _views.size()

func bind_texture(id: String, texture: Texture2D) -> bool:
	if not _views.has(id):
		return false
	var s: Sprite2D = _views[id]
	s.texture = texture
	if texture != null:
		s.offset = Vector2(-texture.get_width() * 0.5, -texture.get_height())
	return true

func update_views(tex_map: Dictionary = {}) -> int:
	if not _bound:
		return build_views(tex_map)
	for id in _views.keys():
		var tex: Texture2D = tex_map.get(id, null)
		if tex == null:
			tex = _load(id)
		if tex != null:
			bind_texture(id, tex)
	return _views.size()

func terminate() -> void:
	for id in _views.keys():
		var s: Sprite2D = _views[id]
		if s != null:
			if s.get_parent() == self:
				remove_child(s)
			s.queue_free()
	_views.clear()
	_bound = false

## Snapshot: "bound" = view nodes exist; per-entry has_texture reflects real readiness.
## (textureReady != snapshot bound: a view can be bound with a null texture.)
func snapshot() -> Dictionary:
	var per: Array = []
	for e in CATALOG:
		var id := String(e["id"])
		var s: Sprite2D = _views.get(id, null)
		per.append({
			"id": id,
			"pos": s.position if s != null else Vector2.ZERO,
			"scale_x": s.scale.x if s != null else 0.0,
			"has_texture": s != null and s.texture != null,
		})
	return {
		"bound": _bound,
		"child_count": get_child_count(),
		"catalog_size": CATALOG.size(),
		"entries": per,
	}
