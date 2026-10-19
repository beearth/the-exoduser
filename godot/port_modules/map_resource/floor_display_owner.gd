extends Node2D
## Isolated CH1-1 FLOOR DISPLAY OWNER (MAP port, R19).
## The single MISSING top-level caller that assembles the EXISTING ground / prop / wall
## display owners of the current floor into ONE real parent, in ONE place — purely by
## calling their already-approved public APIs (no function/geometry/formula re-implemented):
##   R13 map_view_owner          -> ground (R12/R4) + props (R11) under one owned child
##   R16 prop_source_transform   -> rotate/flip/srcRect applied to the live R11 prop sprites
##                                  (the genuinely-missing prop-transform call point)
##   R15 prop_visibility_binding -> alpha/renderLayer/shadow (R14) into R13's prop view
##   R18 wall_packet_binding     -> the floor-packet wall list (R17) under the R13 parent
## One input bundle (actual public floor reader / metadata / textures / source context) is
## forwarded to each existing owner. A same-floor packet change calls update() which runs
## EACH existing owner exactly ONCE, keeping per-facet readiness and separating real
## geometry from texture absence. NOTHING here invents a stage/global READY — readiness is
## only ever whatever the sub-owners report. If an equivalent actual-floor owner already
## exists, no duplicate wrapper is added — only this missing floor-level call point.
## terminate reclaims ONLY this owner's own child (the R13 view) + its own bindings.
## No SourceMain / private _command / 26-replay / full init / SourceG/P / Rift-save /
## nav / collider / height / camera / coord / START-EXIT change; no existing WIP touched.
## mask/blend/SVG/zone_weights DENIED — purpose/dependency not accessed/reproduced/bypassed.
## PRODUCTION (CH1-1 perspective, same TASK): floor_draw_packet() aggregates the wall mass
## packet (R18 WallDrawOwner.perspective_draw_packet) + the ground/prop surface packet (R13
## map_view_owner.surface_packet) into the floor-level contract the ENGINE NativePerspectiveView
## consumes; it is attached to the assemble()/update() report and regenerated each call. No new
## nodes/geometry/coords; ENGINE owns the Camera3D projection; absent height/texture -> that
## seam NOT_READY (forwarded, never faked).

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-floor-display-owner-r19-20261014"

const MapViewOwner := preload("res://port_modules/map_resource/map_view_owner.gd")              # R13
const Transform := preload("res://port_modules/map_resource/prop_source_transform.gd")          # R16
const PropVisibilityOwner := preload("res://port_modules/map_resource/prop_visibility_owner.gd")# R14
const PropVisibilityBinding := preload("res://port_modules/map_resource/prop_visibility_binding.gd") # R15
const WallPacketBinding := preload("res://port_modules/map_resource/wall_packet_binding.gd")    # R18
const WallDrawOwnerScript := preload("res://port_modules/map_resource/wall_draw_owner.gd")       # R17 (authored material table)

var _view                    # R13 map_view_owner — our ONLY own child (ground + props)
var _tf                      # R16 prop_source_transform — applied to the live prop sprites
var _vis                     # R14 prop_visibility_owner — created here, attached under R13 by R15
var _prop_binding            # R15 prop_visibility_binding — owns the R14<->R13 edge
var _wall_binding            # R18 wall_packet_binding — owns the R17 wall owner under R13
var _mounted := false

## Body 1 — assemble: forward the single floor input bundle to each existing owner's API.
## floor keys (all optional, absent -> that facet's exact gap, never invented):
##   floor_reader:Callable  floor_provider:Callable  camera  ground_textures  ground_z
##   prop_tex_map  wall_textures  props(Array for R15)  prop_ctx  shadow_textures
##   prop_transforms:{id -> {meta, mo}}  (for R16; absent -> identity, nothing applied)
func assemble(floor: Dictionary) -> Dictionary:
	terminate()

	var fp: Callable = floor.get("floor_provider", Callable())
	var reader: Callable = floor.get("floor_reader", Callable())
	var camera: Dictionary = floor.get("camera", {})

	# (R13) ground + props under one owned child — straight through, no re-derivation
	_view = MapViewOwner.new()
	_view.name = "MapViewOwner"
	add_child(_view)
	var view_report: Dictionary = _view.mount(fp, camera, floor.get("ground_textures", {}), floor.get("ground_z", {}), floor.get("prop_tex_map", {}))

	# (R16) prop source transform applied onto the live R11 prop sprites (missing call point)
	var tf_report: Dictionary = _apply_transforms(floor.get("prop_transforms", {}))

	# (R15) prop visibility/renderLayer/shadow (R14) wired into R13's prop view
	_vis = PropVisibilityOwner.new()
	_prop_binding = PropVisibilityBinding.new()
	var vis_report: Dictionary = _prop_binding.bind(_view, _vis, floor.get("props", []), floor.get("prop_ctx", {}), floor.get("shadow_textures", {}))

	# (R18) floor-packet walls (R17) under the R13 parent
	_wall_binding = WallPacketBinding.new()
	var wall_report: Dictionary = _wall_binding.bind(_view, reader, floor.get("wall_textures", {}), camera)

	_mounted = true
	var rep: Dictionary = _report(view_report, tf_report, vis_report, wall_report)
	var _pctx := {"shadow_textures": floor.get("wall_shadow_textures", {}), "floor_view_source": floor.get("floor_view_source", {})}
	if floor.has("material_selection"):
		_pctx["material_selection"] = floor["material_selection"]   # explicit (incl. {} -> NR); absent -> authored table
	rep["draw_packet"] = floor_draw_packet(_pctx)
	return rep

## Body 2 — same-floor update: run EACH existing owner exactly once with the new bundle.
## R13.update rebuilds the prop sprites, so R16/R15 are re-applied onto the fresh nodes.
func update(floor: Dictionary) -> Dictionary:
	if not _mounted:
		return assemble(floor)
	var fp: Callable = floor.get("floor_provider", Callable())
	var reader: Callable = floor.get("floor_reader", Callable())
	var camera: Dictionary = floor.get("camera", {})

	var view_report: Dictionary = _view.update(fp, camera, floor.get("ground_textures", {}), floor.get("ground_z", {}), floor.get("prop_tex_map", {}))
	var tf_report: Dictionary = _apply_transforms(floor.get("prop_transforms", {}))
	var vis_report: Dictionary = _prop_binding.update(floor.get("props", []), floor.get("prop_ctx", {}), floor.get("shadow_textures", {}))
	var wall_report: Dictionary = _wall_binding.update(floor.get("wall_textures", {}), camera)
	var rep: Dictionary = _report(view_report, tf_report, vis_report, wall_report)
	var _pctx := {"shadow_textures": floor.get("wall_shadow_textures", {}), "floor_view_source": floor.get("floor_view_source", {})}
	if floor.has("material_selection"):
		_pctx["material_selection"] = floor["material_selection"]   # explicit (incl. {} -> NR); absent -> authored table
	rep["draw_packet"] = floor_draw_packet(_pctx)
	return rep

## Apply the R16 transform to the live prop sprites through R16's existing API only.
## Absent transform metas -> identity for the CH1 catalog (no rot/flip/srcRect in source):
## exact gap, nothing applied/invented. Re-applies cleanly (restore-then-apply) on update.
func _apply_transforms(prop_transforms: Dictionary) -> Dictionary:
	if _tf == null:
		_tf = Transform.new()
	else:
		_tf.terminate()                     # restore any prior transform (freed sprites guarded)
	var pv = _view.get_node_or_null("PropViewAssembly") if _view != null else null
	var entries: Array = []
	var gaps: Array = []
	if prop_transforms.is_empty():
		gaps.append({"facet": "prop source transform", "status": "no caller transform metas -> R16 identity (CH1 catalog props carry no rot/flip/srcRect); nothing applied"})
	var applied := 0
	for id in prop_transforms.keys():
		var t: Dictionary = prop_transforms[id]
		var meta: Dictionary = t.get("meta", {})
		var mo: Dictionary = t.get("mo", {})
		var sprite = pv.get_node_or_null("prop_" + String(id)) if pv != null else null
		if sprite == null:
			gaps.append({"facet": "transform view node", "status": "prop_" + String(id) + " not assembled -> transform not applied"})
			entries.append({"id": id, "applied": false})
			continue
		var rt: Dictionary = _tf.resolve_transform(meta, mo)
		_tf.apply_to_view(sprite, meta, mo, sprite.texture)   # sets ONLY rotation/flip (+crop if tex)
		applied += 1
		var ent := {"id": id, "applied": true, "has_crop": bool(rt["has_crop"]), "rotation_rad": float(rt["rotation_rad"]), "flip_h": bool(rt["flip_h"])}
		if bool(rt["has_crop"]) and sprite.texture == null:
			ent["gap"] = {"facet": "transform crop texture", "status": "srcRect present but no sprite texture -> crop not applied (nothing minted)"}
		entries.append(ent)
	return {"applied": applied, "entries": entries, "gaps": gaps}

## Per-facet report. Readiness is forwarded from each sub-owner; NO stage/global/floor READY
## is invented here (facet readiness + gaps only), and real geometry stays separate from
## texture absence (the sub-owners already carry that split).
func _report(view_report: Dictionary, tf_report: Dictionary, vis_report: Dictionary, wall_report: Dictionary) -> Dictionary:
	var gaps: Array = []
	for g in (view_report.get("ground", {}).get("gaps", []) as Array):
		gaps.append({"owner": "ground(R12)", "gap": g})
	for nr in (view_report.get("props", {}).get("not_ready", []) as Array):
		gaps.append({"owner": "props(R11)", "gap": nr})
	for g in (tf_report.get("gaps", []) as Array):
		gaps.append({"owner": "transform(R16)", "gap": g})
	for g in (vis_report.get("gaps", []) as Array):
		gaps.append({"owner": "visibility(R15/R14)", "gap": g})
	for g in (wall_report.get("gaps", []) as Array):
		gaps.append({"owner": "walls(R18/R17)", "gap": g})
	for tg in (wall_report.get("texture_gaps", []) as Array):
		gaps.append({"owner": "walls(R18/R17)", "gap": tg})
	return {
		"mounted": _mounted,
		"own_children": get_child_count(),          # the floor owner's OWN children: just the R13 view
		"view_children": _view.get_child_count() if _view != null else 0,
		"ground": view_report.get("ground", {}),    # forwarded R12/R4 readiness + import gaps
		"props": view_report.get("props", {}),      # forwarded R11 per-facet readiness
		"transform": tf_report,                     # R16 applied/entries/gaps
		"visibility": vis_report,                   # R15 applied_nodes/shadow/gaps
		"walls": wall_report,                       # R18 wall_count/drawn_ready/gaps
		"gaps": gaps,
		# NO stage/global/floor READY flag — Main play / central consumption remain incomplete.
	}

## Body 3 — terminate: reclaim ONLY this owner's own child (the R13 view) + own bindings.
## Each binding reclaims its own edge/nodes; the prior source / WIP modules are untouched.
func terminate() -> void:
	if _wall_binding != null:
		_wall_binding.unbind()                 # detaches + frees the R17 wall owner it created
		_wall_binding = null
	if _prop_binding != null:
		_prop_binding.unbind()                 # R14.terminate (restore alpha/z) + detach R14
		_prop_binding = null
	if _tf != null:
		_tf.terminate()                        # restore rotation/flip on the live prop sprites
		_tf = null
	if _vis != null:
		if is_instance_valid(_vis):
			_vis.free()                        # WE created the R14 owner -> WE free it
		_vis = null
	if _view != null:
		_view.dispose()                        # R13 frees its own ground + prop nodes
		if _view.get_parent() == self:
			remove_child(_view)
		_view.queue_free()                     # free our own child
		_view = null
	_mounted = false

func dispose() -> void:
	terminate()

## Public getter (passthrough): a COPY of the MAP AUTHORED_NATIVE_VIEW_ONLY material binding table.
## Central consumes this getter only (never a private field / guessed const).
func get_authored_native_view_material_selection() -> Dictionary:
	return WallDrawOwnerScript.AUTHORED_NATIVE_VIEW_MATERIAL.duplicate(true)

## Consume the NEW actual public floor provider (world.get_native_floor_view_source()). Readiness
## is the PROVIDER's (ready flag + a valid floor_reader), NEVER a bare empty Array. caller-missing,
## published-not-ready, bad-return and published-empty are kept DISTINCT. current_texture_reader is
## forwarded for MAP-authored material selection only. No fake provider / no private texture read.
func _consume_floor_view_source(fvs: Dictionary, wall_owner, ctx: Dictionary) -> Dictionary:
	if fvs.is_empty():
		return {"ready": false, "caller": "MISSING", "count": 0, "masses": [], "gap": {"facet": "floor_view_source", "status": "no public floor provider supplied via floor['floor_view_source'] (caller_missing, NOT published-empty)"}}
	if not bool(fvs.get("ready", false)):
		return {"ready": false, "caller": "PUBLISHED_NOT_READY", "count": 0, "masses": [], "gap": {"facet": "floor_view_source.ready", "status": "provider present, ready=false (full_source_floor_ready=" + str(fvs.get("full_source_floor_ready", false)) + ", height_supplied=" + str(fvs.get("height_supplied", false)) + ")"}}
	var reader = fvs.get("floor_reader", null)
	if not (reader is Callable) or not (reader as Callable).is_valid():
		return {"ready": false, "caller": "NO_FLOOR_READER", "count": 0, "masses": [], "gap": {"facet": "floor_reader", "status": "ready but floor_reader is not a valid Callable"}}
	var raw = (reader as Callable).call()
	if not (raw is Array):
		return {"ready": false, "caller": "READER_BAD_RETURN", "count": 0, "masses": [], "gap": {"facet": "floor_reader.call", "status": "did not return an Array"}}
	if wall_owner == null or not wall_owner.has_method("native_view_walls"):
		return {"ready": false, "caller": "NO_WALL_OWNER", "count": 0, "masses": [], "gap": {"facet": "WallDrawOwner", "status": "no wall owner to build native-view masses"}}
	var entries: Array = raw
	var out: Dictionary = wall_owner.native_view_walls(entries, {
		"current_texture_reader": fvs.get("current_texture_reader", null),
		"material_selection": ctx.get("material_selection", {}),
	})
	# descriptor wall_count (int, nonnegative) must equal entries.size before published_empty is
	# legitimate; a mismatch or any invalid entry -> ready=false / partial (NOT mesh readiness).
	var declared_wc = fvs.get("wall_count", null)
	var wc_ok := declared_wc is int and int(declared_wc) >= 0 and int(declared_wc) == entries.size()
	var invalid_count := (out.get("invalid", []) as Array).size()
	out["published_entry_count"] = entries.size()
	out["declared_wall_count"] = declared_wc
	out["wall_count_match"] = wc_ok
	out["invalid_count"] = invalid_count
	out["scope"] = fvs.get("scope", null)
	out["full_source_floor_ready"] = fvs.get("full_source_floor_ready", false)
	out["note"] = "provider-published readiness is DATA readiness, NOT mesh/visual readiness"
	out["published_empty"] = entries.is_empty() and wc_ok     # legitimate 0 only when the descriptor agrees
	if not wc_ok:
		out["ready"] = false
		out["caller"] = "WALL_COUNT_MISMATCH"
		out["gap"] = {"facet": "wall_count", "status": "descriptor wall_count (" + str(declared_wc) + ") != entries.size (" + str(entries.size()) + ")"}
	elif invalid_count > 0:
		out["ready"] = false
		out["caller"] = "PARTIAL_INVALID_ENTRIES"
		out["partial"] = true
		out["gap"] = {"facet": "entry validation", "status": str(invalid_count) + " invalid entries -> partial, not ready"}
	else:
		out["ready"] = true
		out["caller"] = "OK"
	return out

## PRODUCTION (CH1-1 perspective, same TASK) — the floor-level DRAW-PACKET the ENGINE
## NativePerspectiveView consumes: the authored-prop wall packet (WallDrawOwner.perspective_draw_packet)
## + the canonical native-view masses (from the public floor provider) + the ground/prop surface
## packet (map_view_owner.surface_packet). Generated from the LIVE owned nodes; regenerated on
## assemble/update and empty after terminate(). No new nodes/geometry/numbers, no projection call
## (ENGINE owns Camera3D); absent provider/height/texture -> that seam NOT_READY (forwarded, never
## faked). ENGINE's native manifest map.perspective_view records the chosen ready/gaps.
func floor_draw_packet(ctx: Dictionary = {}) -> Dictionary:
	var wall_packet: Dictionary = {"count": 0, "walls": [], "gap": {"facet": "wall packet", "status": "no WallDrawOwner under the view -> no wall packet"}}
	var wall_owner = _view.get_node_or_null("WallDrawOwner") if _view != null else null
	if wall_owner != null and wall_owner.has_method("perspective_draw_packet"):
		wall_packet = wall_owner.perspective_draw_packet(ctx)
	# NEW actual public floor provider (get_native_floor_view_source) -> canonical native-view
	# masses; caller-missing vs published-not-ready vs published-empty are kept distinct.
	# material selection: ABSENT key -> the MAP authored table (default); explicit {} -> unassigned NR.
	var selection: Dictionary = ctx["material_selection"] if ctx.has("material_selection") else get_authored_native_view_material_selection()
	var native_masses: Dictionary = _consume_floor_view_source(ctx.get("floor_view_source", {}), wall_owner, {"material_selection": selection})
	var surface: Dictionary = {}
	if _view != null and _view.has_method("surface_packet"):
		surface = _view.surface_packet()
	return {
		"schema": "exoduser.godot.ch1-native-first.floor-draw-packet.v1",
		"stage": "CH1-1", "si": 0,
		"view_height_authority": "MAP AUTHORED_NATIVE_VIEW_ONLY (view-only, not physical)",
		"wall": wall_packet,                     # reader-driven authored-prop walls (held: floor_reader absent)
		"native_view_masses": native_masses,     # collision_rects-derived view masses (actual supply path)
		"surface": surface,
		"caller_seams": {
			"floor_view_source": "public world.get_native_floor_view_source(); supplied via assemble()/update() floor['floor_view_source'] -> caller=" + String(native_masses.get("caller", "OK")),
			"material_selection": "optional MAP-authored id/source_kind -> source_key via floor['material_selection']; absent -> material NR per-ID (no source assignment forged)",
			"currentTexture": "published current_texture_reader(source_key) consumed only under a MAP-authored selection; unknown/queued/processing/load-incomplete -> NR/null (no private SpriteTexture read)",
		},
	}

func snapshot() -> Dictionary:
	return {
		"mounted": _mounted,
		"own_children": get_child_count(),
		"has_view": _view != null,
		"has_prop_binding": _prop_binding != null,
		"has_wall_binding": _wall_binding != null,
		"has_transform": _tf != null,
		"view": _view.snapshot() if _view != null else {},
	}
