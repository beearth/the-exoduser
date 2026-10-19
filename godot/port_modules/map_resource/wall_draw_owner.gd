extends Node2D
## Isolated CH1-1 WALL DRAW owner (MAP port, R17).
## Ports ONLY the DISPLAY body of the approved current-floor wall tiles: it consumes a
## read-only floor-packet wall list (source/LOCK/SSOT placement = {id, tile, scale, rot,
## meta}) and drives the EXISTING renderer resolvers onto owned CanvasItems. It does
## NOT re-implement the map-object renderer (already ported) — it REUSES:
##   R9  prop_nav_adapter.tile_to_world  -> coord (tile+0.5)*40 (no new geometry)
##   R10 prop_pivot_resolver.resolve     -> size/pivot/offset/bounds (meta.sourceSize)
##   R16 prop_source_transform.apply     -> original coded/atlas command (srcRect crop
##                                          AtlasTexture + rot/flip)
##   R7  landmark_visibility.camera_visible_rect -> existing public viewport culling
## A wall whose texture the caller does not supply draws nothing (exact gap; no mint,
## no source-less wall/picture invented). The owner owns ONLY its wall CanvasItems.
## No floor/nav/collider/height/mesh/world/camera/START/EXIT change; colParts/collision
## are out of scope (collider, untouched). Root full-source-init / generated
## SourceRuntime unchanged. zone-mask/blend/SVG/zone_weights DENIED — branches needing
## their result are HELD; only the independent existing wall display is ported.
## PRODUCTION (CH1-1 perspective, same TASK): perspective_draw_packet() exposes the public
## DRAW-PACKET contract the ENGINE NativePerspectiveView (checkpoint 637d) consumes to render
## each built wall as a real 3D plane (front/top) + contact shadow under the actual World
## subtree. It creates NO new nodes and NO custom Canvas _draw (those would NOT appear in the
## 3D view): the existing front-face Sprite2D is already lifted to Sprite3D by ENGINE; this
## packet supplies the EXTRA source-backed data ENGINE needs — height (GodotY), plane corners
## (worldXY=GodotXZ), UV, Texture2D — plus a caller contact-shadow spec. ENGINE owns the
## Camera3D world_to_screen; MAP never projects or forges a Camera2D cull as a 3D plane. Nothing
## invented: a wall with no caller/SSOT height or no texture reports that seam NOT_READY.
## Geometry/nav/collider/coord/LOCK/START/EXIT stay unchanged.

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-wall-draw-owner-r17-20261014"

const NavAdapter := preload("res://port_modules/map_resource/prop_nav_adapter.gd")      # R9  coord
const PivotResolver := preload("res://port_modules/map_resource/prop_pivot_resolver.gd") # R10 size/pivot
const Transform := preload("res://port_modules/map_resource/prop_source_transform.gd")   # R16 atlas/rot/flip
const Visibility := preload("res://port_modules/map_resource/landmark_visibility.gd")    # R7  culling

## CH1-1 SSOT tile size (T=40), per world.get_native_map_surface_context() (diagnostic only;
## the ground footprint comes from the ACTUAL map_data.collision_rects, not a synthesized cell).
const TILE_SIZE := 40.0
## AUTHORED_NATIVE_VIEW_ONLY per-wall-ID visual heights (GodotY units). MAP-authored & MAP-OWNED:
## the source carries NO wall height, so these are declared view-only (NEVER promoted to physical
## height / collision) and are NOT called source height. Finite positive, keyed by the approved
## wall-type IDs (m_c3wall_*). An unlisted ID gets the finite-positive default (still view-only).
const AUTHORED_VIEW_HEIGHT := {
	"m_c3wall_i": 80.0,      # 2.0 * T — straight outer wall mass (view-only)
	"m_c3wall_l": 80.0,      # 2.0 * T — corner
	"m_c3wall_end": 80.0,    # 2.0 * T — end cap
	"m_c3wall_gate": 60.0,   # 1.5 * T — gate reads lower
}
const AUTHORED_VIEW_HEIGHT_DEFAULT := 80.0   # 2.0 * T — view-only default for an unlisted wall ID
## MAP AUTHORED_NATIVE_VIEW_ONLY material binding table (view-only selection; keyed by source_kind
## or wall ID). m_c1bw (bound_w.png) is the verified current-pipeline reference chosen by MAP for
## the canonical collision rects — it is NOT a source assignment and NOT a pixel-parity proof.
const AUTHORED_NATIVE_VIEW_MATERIAL := {
	"CANONICAL_NATIVE_COLLISION_RECT": {
		"source_key": "m_c1bw",
		"source_path_ref": "assets/map/ch1/collision/bound_w.png",
		"basis": "MAP_AUTHORED_NATIVE_VIEW_SELECTION",
		"original_source_assigned": false,
		"note": "MAP view-only selection of the verified current-pipeline reference m_c1bw; NOT source-assigned, NOT pixel-parity-proven",
	},
}

var _nav
var _pivot
var _tf
var _vis
var _built := false
var _records: Array = []

func _ensure() -> void:
	if _nav == null: _nav = NavAdapter.new()
	if _pivot == null: _pivot = PivotResolver.new()
	if _tf == null: _tf = Transform.new()
	if _vis == null: _vis = Visibility.new()

## Body 1 — resolve the packet entry's world coord READ-ONLY. Explicit world wins;
## otherwise the existing R9 (tile+0.5)*40 rule (no new geometry created).
func _entry_world(entry: Dictionary) -> Vector2:
	if entry.has("world"):
		var w: Array = entry["world"]
		return Vector2(float(w[0]), float(w[1]))
	var tile: Array = entry.get("tile", [0, 0])
	return _nav.tile_to_world(int(tile[0]), int(tile[1]))

## Body 1+2+3 — build an owned Sprite2D per wall packet entry using the EXISTING
## resolvers. `packet` is the read-only floor-packet wall list; `textures` is the
## caller-supplied {id -> Texture2D}; `camera` (optional) reuses R7 for culling.
func build(packet: Array, textures: Dictionary = {}, camera: Dictionary = {}) -> Dictionary:
	_ensure()
	terminate()
	var has_cam := not camera.is_empty()
	var cam_rect: Rect2 = _vis.camera_visible_rect(camera) if has_cam else Rect2()
	var i := 0
	for entry in packet:
		var id := String(entry.get("id", ""))
		var meta: Dictionary = entry.get("meta", {})
		var inst_scale := float(entry.get("scale", 1.0))
		var rot = entry.get("rot", 0)
		var world := _entry_world(entry)
		var tex: Texture2D = textures.get(id, null)

		var s := Sprite2D.new()
		s.name = "wall_%d_%s" % [i, id]
		s.centered = false
		s.position = world
		s.z_as_relative = false

		# geometry (size/pivot/bounds) via R10 — ready from meta.sourceSize even w/o texture
		var geom: Dictionary = _pivot.resolve(meta, tex, world, inst_scale)
		var geom_ready := bool(geom["ready"])
		if geom_ready:
			s.scale = geom["sprite_scale"]
			s.offset = geom["sprite_offset"]

		# original coded / atlas command + transform via R16 (srcRect AtlasTexture, rot/flip)
		var tf: Dictionary = _tf.resolve_transform(meta, {"rot": rot})
		var tex_ready := tex != null
		if tex_ready and not bool(tf["has_crop"]):
			s.texture = tex                                  # plain wall: full texture
		_tf.apply_to_view(s, meta, {"rot": rot}, tex)        # rotation/flip (+ atlas crop if tex)

		# viewport culling via the existing R7 public helper
		var visible := true
		if has_cam:
			if geom_ready:
				visible = (geom["world_bounds"] as Rect2).intersects(cam_rect)
			else:
				visible = cam_rect.has_point(world)
		s.visible = visible
		add_child(s)

		# packet-source fields (CH1-1 perspective): the actual world footprint rect (R10
		# geometry, worldXY), the atlas UV region (R16 crop), and the caller/SSOT-backed
		# height + contact-shadow meta. All source-backed; absent -> that seam NOT_READY.
		var wbounds: Rect2 = geom["world_bounds"] if geom_ready else Rect2()
		var uv_region := Rect2()
		if bool(tf["has_crop"]) and tf.has("crop") and tf["crop"] is Dictionary and (tf["crop"] as Dictionary).has("region"):
			uv_region = (tf["crop"] as Dictionary)["region"]
		var rec := {
			"id": id, "world": world, "rot": rot,
			"node": s.name,                       # the Sprite2D ENGINE lifts to Sprite3D (front face)
			"world_bounds": wbounds,              # billboard quad extent (front-face plane_corners), NOT the footprint
			"uv_region": uv_region,               # atlas region (px); normalized in the packet
			"source_height": entry.get("height", meta.get("height", null)),   # real source wall height (CH1: null)
			"footprint_override": entry.get("footprint", null),               # explicit footprint if a reader supplies one
			"shadow_meta": meta.get("shadow", null),                   # caller/SSOT contact spec
			"geom_ready": geom_ready, "tex_ready": tex_ready,
			"has_crop": bool(tf["has_crop"]), "flip_h": bool(tf["flip_h"]),
			"rotation_rad": float(tf["rotation_rad"]),
			"visible": visible, "has_texture": s.texture != null,
		}
		if not tex_ready:
			rec["gap"] = {"facet": "wall texture", "status": "no caller texture for '" + id + "' -> wall drawn empty (NOT minted)"}
		if not geom_ready:
			rec["gap_geom"] = geom.get("gap", {"facet": "geometry", "status": "no sourceSize/texture dims"})
		_records.append(rec)
		i += 1
	_built = true
	var drawn := 0
	for r in _records:
		if r["tex_ready"] and r["geom_ready"]:
			drawn += 1
	return {
		"count": _records.size(),
		"drawn_ready": drawn,
		"wall_nodes": get_child_count(),
		"entries": _records.duplicate(true),
	}

## AUTHORED_NATIVE_VIEW_ONLY view height for a wall ID (GodotY). MAP-owned & finite positive;
## never source height, never promoted to physical. Unlisted ID -> the view-only default.
func _authored_view_height(id: String) -> float:
	return float(AUTHORED_VIEW_HEIGHT.get(id, AUTHORED_VIEW_HEIGHT_DEFAULT))

func _finite_num(n) -> bool:
	return (n is float or n is int) and is_finite(float(n))

func _finite_v2(v: Vector2) -> bool:
	return is_finite(v.x) and is_finite(v.y)

## Public getter: a COPY of the MAP AUTHORED_NATIVE_VIEW_ONLY material binding table. Central
## consumes this getter only (never a private field / guessed const).
func get_authored_native_view_material_selection() -> Dictionary:
	return AUTHORED_NATIVE_VIEW_MATERIAL.duplicate(true)

## Resolve a MAP-authored source_key for a native ID from the selection (by id first, then
## source_kind). Value may be a String source_key or a Dict carrying "source_key". "" -> none.
func _resolve_source_key(selection: Dictionary, id: String, source_kind: String) -> String:
	var v = null
	if selection.has(id):
		v = selection[id]
	elif selection.has(source_kind):
		v = selection[source_kind]
	if v is String:
		return v
	if v is Dictionary and (v as Dictionary).has("source_key"):
		return String((v as Dictionary)["source_key"])
	return ""

## MAP-authored view-only material resolution (never source-assigned). Consumes the published
## current_texture_reader(source_key) under an explicit MAP selection and VALIDATES the return:
## rd.ready + echoed source_key match + an actual Texture2D with W,H>0. Any miss -> NR + status.
## No pixel-identity/original-latest promotion; no shadow/alpha/layer completion.
func _authored_material(id: String, ent: Dictionary, selection: Dictionary, texture_reader) -> Dictionary:
	var source_kind := String(ent.get("source_kind", ""))
	var source_key := _resolve_source_key(selection, id, source_kind)
	if source_key == "":
		return {"ready": false, "status": "NR_NO_AUTHORED_ASSIGNMENT", "note": "no MAP-authored material selection for this native ID (source assignment NOT forged)"}
	if not (texture_reader is Callable) or not (texture_reader as Callable).is_valid():
		return {"ready": false, "status": "NR_NO_TEXTURE_READER", "source_key": source_key}
	var r = (texture_reader as Callable).call(source_key)
	if not (r is Dictionary):
		return {"ready": false, "status": "NR_READER_BAD_RETURN", "source_key": source_key}
	var rd: Dictionary = r
	if not bool(rd.get("ready", false)):
		return {"ready": false, "status": String(rd.get("status", "NR_TEXTURE_NOT_AVAILABLE")), "source_key": source_key}
	if String(rd.get("source_key", "")) != source_key:
		return {"ready": false, "status": "NR_SOURCE_KEY_MISMATCH", "source_key": source_key, "returned": rd.get("source_key", null)}
	var tex = rd.get("texture", null)
	if not (tex is Texture2D):
		return {"ready": false, "status": "NR_TEXTURE_NOT_TEXTURE2D", "source_key": source_key}
	var tsz: Vector2 = (tex as Texture2D).get_size()
	if tsz.x <= 0.0 or tsz.y <= 0.0:
		return {"ready": false, "status": "NR_TEXTURE_ZERO_SIZE", "source_key": source_key}
	return {
		"ready": true,
		"status": "MAP_AUTHORED_NATIVE_VIEW_MATERIAL",
		"source_key": source_key,
		"source_path": rd.get("source_path", null),
		"texture": tex,
		"texture_size": [tsz.x, tsz.y],
		"authored_by": "MAP",
		"original_source_assigned": false,                              # NEVER forged
		"original_pixel_identity_proven": bool(rd.get("original_pixel_identity_proven", false)),
		"processing_pixel_parity_verified": bool(rd.get("processing_pixel_parity_verified", false)),
		"basis": "MAP_AUTHORED_NATIVE_VIEW_SELECTION (reference pipeline; not source-assigned, not original-latest)",
	}

## PRODUCTION (CH1-1 native-view) — consume the ACTUAL published floor_reader entries (each a
## CANONICAL_NATIVE_COLLISION_RECT with id native_wall_rect_%04d, source_index, ground_footprint
## = 4 typed Vector2 TL/TR/BR/BL, source_rect [x,y,w,h], height null, authored_prop_id false,
## geometry_edited false). The ENGINE fields are PRESERVED verbatim (coords unchanged, no clamp,
## no bbox-as-footprint); MAP only ADDS a view-only AUTHORED_NATIVE_VIEW_ONLY height (source_height
## stays null) + an explicit MAP-authored material selection. Every entry is validated: id/
## source_index present, ground_footprint = 4 finite Vector2, source_rect finite + positive +
## non-degenerate. A string/NaN/zero/degenerate/missing entry is routed to `invalid` and NEVER
## counted ready. Readiness of the provider is decided by the caller (floor_view_source), not by
## a bare empty Array. Legacy m_c3wall/gate authored props are NOT conflated with these.
func native_view_walls(entries: Array, ctx: Dictionary = {}) -> Dictionary:
	var texture_reader = ctx.get("current_texture_reader", null)       # Callable(source_key)->Dict or null
	var material_selection: Dictionary = ctx.get("material_selection", {})   # MAP-authored id/source_kind -> source_key
	var masses: Array = []
	var invalid: Array = []
	for e in entries:
		if not (e is Dictionary):
			invalid.append({"reason": "entry not a Dictionary"})
			continue
		var ent: Dictionary = e
		# source_index: int, nonnegative (no ent.index/null fallback)
		var si_raw = ent.get("source_index", null)
		if not (si_raw is int) or int(si_raw) < 0:
			invalid.append({"reason": "source_index missing/not int>=0", "entry_id": ent.get("id", null)})
			continue
		var source_index := int(si_raw)
		# id must equal the canonical name for the index
		var id := String(ent.get("id", ""))
		if id != "native_wall_rect_%04d" % source_index:
			invalid.append({"source_index": source_index, "reason": "id != native_wall_rect_%04d (got '" + id + "')"})
			continue
		# source_kind literal (no default/fallback)
		if String(ent.get("source_kind", "")) != "CANONICAL_NATIVE_COLLISION_RECT":
			invalid.append({"id": id, "reason": "source_kind != CANONICAL_NATIVE_COLLISION_RECT"})
			continue
		if bool(ent.get("authored_prop_id", false)):
			invalid.append({"id": id, "reason": "authored_prop_id true (not a canonical collision rect)"})
			continue
		if bool(ent.get("geometry_edited", false)):
			invalid.append({"id": id, "reason": "geometry_edited true"})
			continue
		# source_rect: exactly Array4, finite, width/height > 0
		var sr = ent.get("source_rect", null)
		if not (sr is Array) or (sr as Array).size() != 4:
			invalid.append({"id": id, "reason": "source_rect not Array4"})
			continue
		var srA: Array = sr
		var sr_finite := true
		for n in srA:
			if not _finite_num(n):
				sr_finite = false
				break
		if not sr_finite:
			invalid.append({"id": id, "reason": "source_rect non-finite"})
			continue
		var rx := float(srA[0])
		var ry := float(srA[1])
		var rw := float(srA[2])
		var rh := float(srA[3])
		if rw <= 0.0 or rh <= 0.0:
			invalid.append({"id": id, "reason": "source_rect degenerate (w/h <= 0)"})
			continue
		# ground_footprint: exactly 4 finite Vector2, == source_rect TL/TR/BR/BL, non-degenerate cross
		var fp = ent.get("ground_footprint", null)
		if not (fp is Array) or (fp as Array).size() != 4:
			invalid.append({"id": id, "reason": "ground_footprint not a 4-corner Array"})
			continue
		var corners: Array = []
		var fp_ok := true
		for c in (fp as Array):
			if not (c is Vector2) or not _finite_v2(c):
				fp_ok = false
				break
			corners.append(c)
		if not fp_ok:
			invalid.append({"id": id, "reason": "ground_footprint corner not a finite Vector2"})
			continue
		var tl := Vector2(rx, ry)
		var tr := Vector2(rx + rw, ry)
		var br := Vector2(rx + rw, ry + rh)
		var bl := Vector2(rx, ry + rh)
		if not (corners[0].is_equal_approx(tl) and corners[1].is_equal_approx(tr) and corners[2].is_equal_approx(br) and corners[3].is_equal_approx(bl)):
			invalid.append({"id": id, "reason": "ground_footprint != source_rect corners TL/TR/BR/BL"})
			continue
		if absf((tr - tl).cross(bl - tl)) < 0.0000001:
			invalid.append({"id": id, "reason": "degenerate footprint (zero cross area)"})
			continue
		masses.append({
			"id": id,                                                  # preserved native_wall_rect_%04d (== index)
			"source_index": source_index,                             # preserved int
			"source_kind": "CANONICAL_NATIVE_COLLISION_RECT",         # validated literal
			"authored_prop_id": false,
			"geometry_edited": false,
			"ground_footprint": corners,                               # preserved Vector2 TL/TR/BR/BL
			"source_rect": srA.duplicate(),                            # preserved [x,y,w,h]
			"world": ent.get("world", null),
			"rot": ent.get("rot", 0), "scale": ent.get("scale", 1),
			"source_height": ent.get("height", null),                  # null preserved (no source height)
			"view_height": _authored_view_height(id),                  # AUTHORED_NATIVE_VIEW_ONLY (finite+)
			"height_basis": "AUTHORED_NATIVE_VIEW_ONLY",
			"height_authority": "MAP",
			"material": _authored_material(id, ent, material_selection, texture_reader),
		})
	return {
		"schema": "exoduser.godot.ch1-native-first.native-view-mass.v1",
		"source": "floor_reader entries (CANONICAL_NATIVE_COLLISION_RECT; ENGINE fields preserved + validated, inputs unchanged)",
		"view_height_authority": "MAP AUTHORED_NATIVE_VIEW_ONLY (view-only, not physical)",
		"count": masses.size(),
		"masses": masses,
		"invalid": invalid,                                            # validation failures — NOT counted ready
	}

## PRODUCTION (CH1-1 perspective) — the public DRAW-PACKET the ENGINE NativePerspectiveView
## consumes to render each built wall as a real 3D plane (front/top) + contact shadow. No new
## nodes, no _draw, no projection call (ENGINE owns Camera3D world_to_screen). Per wall it
## exposes the source-backed Texture2D, plane corners (worldXY=GodotXZ, from R10 world_bounds),
## atlas UV (normalized by the real texture size), the view_height (GodotY — real source_height
## when present, else the AUTHORED_NATIVE_VIEW_ONLY MAP-owned height; the two are reported
## separately), and the caller contact-shadow spec. Nothing is faked: no texture -> texture
## NOT_READY; no billboard geometry -> corners NOT_READY; ground_footprint is set ONLY from an
## explicit reader footprint (collision_rects footprints come from floor-level native_view_walls).
## ctx.shadow_textures supplies optional contact-shadow textures (absent -> shadow NOT_READY).
## Live: regenerated from the current wall nodes; empty after terminate().
func perspective_draw_packet(ctx: Dictionary = {}) -> Dictionary:
	var shadow_textures: Dictionary = ctx.get("shadow_textures", {})
	var walls: Array = []
	for rec in _records:
		var id := String(rec.get("id", ""))
		var node := get_node_or_null(String(rec.get("node", ""))) as Sprite2D
		var tex: Texture2D = node.texture if node != null else null
		var bounds: Rect2 = rec.get("world_bounds", Rect2())
		var corners_ready := bool(rec.get("geom_ready", false))
		var corners := [
			bounds.position,                                   # worldXY -> GodotXZ
			Vector2(bounds.end.x, bounds.position.y),
			bounds.end,
			Vector2(bounds.position.x, bounds.end.y),
		]
		var src_h = rec.get("source_height", null)             # real source wall height (CH1: null)
		var view_height: float = float(src_h) if src_h != null else _authored_view_height(id)
		var h_basis := "source" if src_h != null else "AUTHORED_NATIVE_VIEW_ONLY"
		var fo = rec.get("footprint_override", null)
		var footprint = fo if (fo is Array and (fo as Array).size() >= 4) else null
		var footprint_basis := "reader_explicit_footprint" if footprint != null else "NR: no explicit footprint (collision_rects path is floor-level native_view_walls)"
		var uv = null
		if tex != null:
			var ts := tex.get_size()
			if ts.x > 0.0 and ts.y > 0.0 and bool(rec.get("has_crop", false)):
				var reg: Rect2 = rec.get("uv_region", Rect2())
				uv = [reg.position.x / ts.x, reg.position.y / ts.y, reg.end.x / ts.x, reg.end.y / ts.y]
			else:
				uv = [0.0, 0.0, 1.0, 1.0]
		var sh = rec.get("shadow_meta", null)
		var shadow = null
		var shadow_ready := false
		if sh is Dictionary:
			var stex: Texture2D = shadow_textures.get(id, null)
			shadow_ready = stex != null
			shadow = {
				"alpha": float((sh as Dictionary).get("alpha", 0.22)),
				"render_layer": int((sh as Dictionary).get("render_layer", -11)),
				"texture": stex,
				"ready": shadow_ready,
			}
		var not_ready: Array = []
		if tex == null: not_ready.append("texture")
		if not corners_ready: not_ready.append("corners")
		walls.append({
			"id": id,
			"node": String(rec.get("node", "")),
			"texture": tex,
			"plane_corners": corners,
			"uv": uv,
			"source_height": src_h,                        # null for CH1 (no source wall height; declared, not a gap)
			"view_height": view_height,                    # the height ENGINE uses for the view plane
			"height_basis": h_basis,                       # AUTHORED_NATIVE_VIEW_ONLY (view-only, not physical)
			"ground_footprint": footprint,                 # explicit reader footprint only; NOT the billboard bbox
			"footprint_basis": footprint_basis,
			"contact_shadow": shadow,
			"ready": {"texture": tex != null, "view_height": true, "source_height": src_h != null, "corners": corners_ready, "contact_shadow": shadow_ready},
			"not_ready": not_ready,
		})
	return {
		"schema": "exoduser.godot.ch1-native-first.wall-draw-packet.v1",
		"space": {"plane": "worldXY=GodotXZ", "height": "GodotY", "origin": "same Main Camera3D/World subtree"},
		"view_height_authority": "MAP AUTHORED_NATIVE_VIEW_ONLY (view-only, not physical; source_height separate)",
		"count": walls.size(),
		"walls": walls,
	}

## Body 3 — owner update: rebuild with (possibly new) packet/textures/camera.
func update(packet: Array, textures: Dictionary = {}, camera: Dictionary = {}) -> Dictionary:
	return build(packet, textures, camera)

## Body 3 — free ONLY the owner's own wall CanvasItems.
func terminate() -> void:
	for c in get_children():
		remove_child(c)
		c.queue_free()
	_records.clear()
	_built = false

func dispose() -> void:
	terminate()
	_nav = null; _pivot = null; _tf = null; _vis = null

func snapshot() -> Dictionary:
	return {"built": _built, "wall_nodes": get_child_count()}
