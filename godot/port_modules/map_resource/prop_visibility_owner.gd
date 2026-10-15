extends Node2D
## Isolated CH1-1 PROP VISIBILITY / OCCLUSION-CONTACT display owner (MAP port, R14).
## Ports the REAL original prop display body (game.html source, read-only) onto the
## EXISTING R11 prop_view_assembly public view — source-confirmed bodies ONLY:
##
## (1) Display alpha (game.html:48089):
##       _moAlpha = (_meta.alpha ?? 1) * _ch1StartOuterPropAlpha(mo)
##     _ch1StartOuterPropAlpha (game.html:10504) is a CAMERA/position-relative fade,
##     gated on outer_enabled ∧ mo._hand ∧ type =~ /^m_c1(?:b|c[nsew])/ (boulders +
##     compass structures). Outside tile bounds -> .7 (smoothing) / .42; inside ->
##     _ch1StartInteriorStructuralAlpha quadrant/segment tables. m_c1tree/altar/cocoon
##     do NOT match -> stay 1.0. NO "fade-when-player-behind" exists in the core 2D
##     renderer (the occluder billboard is _fdgNativePerspective-only), so none is
##     invented. Draw order = per-meta renderLayer (catalog props carry none).
## (2) Ground-contact shadow (game.html:15625 m_c3hellground_shadow): a SEPARATE placed
##     prop (alpha .22, renderLayer -11, own texture) — source-confirmed for c3 ONLY.
##     NO c1 ground-contact shadow exists in source, so none is minted for CH1; the
##     ported body applies ONLY when a caller supplies a source-shaped shadow meta +
##     texture/geometry (no rule/number/asset invented).
## (3) player/camera/readiness/expiry consumed READ-ONLY; an unprovided facet -> exact
##     gap; this owner reclaims ONLY its own-created shadow nodes (and restores the
##     alpha/z it set) — the R11 assembly + its sprites stay R11-owned.
## No shared World/collision/nav/map-coord/camera change. zones_mask/zone-mask/zoneblend
## /SVG/zone_weights remain DENIED (no implement/access/bypass).

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-prop-visibility-owner-r14-20261014"

## Source-confirmed reference for the c3 ground-contact shadow (read-only; NOT applied
## to CH1 — recorded so the ported body's shape is auditable, never minted here).
const C3_SHADOW_REFERENCE := {
	"id": "m_c3hellground_shadow", "file": "prop_ice_gdark.png",
	"sz": 760, "alpha": 0.22, "render_layer": -11,
	"filter": "grayscale(1) brightness(.26) contrast(1.25)",
	"note": "구조물 발밑 접지 mass (c3 only; no c1 equivalent in source)",
}

## Source bounds/tables ported VERBATIM from _ch1StartOuterPropAlpha / Interior (10504+).
const OUTER_TILE_MIN_X := 45
const OUTER_TILE_MAX_X := 155
const OUTER_TILE_MIN_Y := 35
const OUTER_TILE_MAX_Y := 165
const EXTERIOR_SMOOTHING := 0.7
const EXTERIOR_DEFAULT := 0.42
const INTERIOR_Q0 := [0.6, 0.68, 0.76]
const INTERIOR_Q2 := [0.68, 0.76, 0.84]
const INTERIOR_Q1 := [0.72, 0.8, 0.88]
const INTERIOR_Q3 := [0.64, 0.72, 0.8]

var _shadow_nodes: Array = []     # own-created shadow Sprite2D (the only nodes we free)
var _applied: Array = []          # {node, orig_a, orig_z} for restore on terminate

## Ports `/^m_c1(?:b|c[nsew])/` without a RegEx dependency (same match set).
func _outer_match(type: String) -> bool:
	if not type.begins_with("m_c1") or type.length() < 5:
		return false
	var c: String = type[4]
	if c == "b":
		return true
	if c == "c" and type.length() >= 6:
		var d: String = type[5]
		return d == "n" or d == "s" or d == "e" or d == "w"
	return false

## Ports _ch1StartInteriorStructuralAlpha (game.html:10511). phase!="smoothing" -> 1.0.
func _interior_alpha(type: String, tx: float, ty: float, phase: String) -> float:
	if phase != "smoothing":
		return 1.0
	var quadrant := (0 if ty < 100.0 else 2) + (0 if tx < 100.0 else 1)
	var last := type.unicode_at(type.length() - 1)
	var seg := (int(floor(tx / 9.0)) + int(floor(ty / 11.0)) + last) % 3
	if quadrant == 0:
		return INTERIOR_Q0[seg]
	if quadrant == 2:
		return INTERIOR_Q2[seg]
	if quadrant == 1:
		return INTERIOR_Q1[seg]
	return INTERIOR_Q3[seg]

## Ports _ch1StartOuterPropAlpha. ctx is the READ-ONLY central context
## {outer_enabled:bool, hand:bool, phase:String}; absent -> treated as not-enabled
## (alpha 1.0, outer_applied=false) and the caller is told via the facet gap.
func outer_prop_alpha(type: String, tx: float, ty: float, ctx: Dictionary) -> Dictionary:
	var enabled := bool(ctx.get("outer_enabled", false))
	var hand := bool(ctx.get("hand", false))
	if not enabled or not hand or not _outer_match(type):
		return {"alpha": 1.0, "outer_applied": false, "region": "none"}
	var phase := String(ctx.get("phase", ""))
	if tx < OUTER_TILE_MIN_X or tx > OUTER_TILE_MAX_X or ty < OUTER_TILE_MIN_Y or ty > OUTER_TILE_MAX_Y:
		return {"alpha": (EXTERIOR_SMOOTHING if phase == "smoothing" else EXTERIOR_DEFAULT), "outer_applied": true, "region": "exterior"}
	return {"alpha": _interior_alpha(type, tx, ty, phase), "outer_applied": true, "region": "interior"}

## Body 1 — the full display alpha: (meta.alpha ?? 1) * outer. prop: {type, tile:[tx,ty],
## alpha?(meta)}. ctx read-only; when ctx is empty the outer fade can't be computed
## (gap) but the static meta alpha still applies (default 1 -> no invented dimming).
func display_alpha(prop: Dictionary, ctx: Dictionary) -> Dictionary:
	var meta_a := float(prop["alpha"]) if prop.has("alpha") else 1.0
	var type := String(prop.get("type", prop.get("id", "")))
	var tile: Array = prop.get("tile", [0, 0])
	var o := outer_prop_alpha(type, float(tile[0]), float(tile[1]), ctx)
	var out := {
		"alpha": meta_a * float(o["alpha"]),
		"meta_alpha": meta_a,
		"outer_alpha": o["alpha"],
		"outer_applied": o["outer_applied"],
		"region": o["region"],
	}
	if ctx.is_empty():
		out["gap"] = {"facet": "camera/player outer-fade context", "required": "central ctx {outer_enabled, hand, phase} (read-only) — static meta alpha applied, fade NOT invented"}
	return out

## Body 1 — draw order from the per-meta renderLayer (source). Absent -> unchanged.
func draw_order_z(prop: Dictionary) -> Dictionary:
	if prop.has("render_layer"):
		return {"z": int(prop["render_layer"]), "source": "meta.renderLayer"}
	return {"z": null, "source": "none (catalog props carry no renderLayer -> unchanged)"}

## Body 2 — shadow descriptor. Present ONLY when a source-shaped shadow meta is
## supplied (CH1 catalog props have none -> absent; nothing minted).
func shadow_spec(prop: Dictionary) -> Dictionary:
	if prop.has("shadow") and prop["shadow"] is Dictionary:
		var s: Dictionary = prop["shadow"]
		return {"present": true, "alpha": float(s.get("alpha", 0.22)), "render_layer": int(s.get("render_layer", -11))}
	return {"present": false}

## Body 2+3 — apply the ported bodies onto the EXISTING R11 assembly public view.
## props: Array of {id, type, tile, alpha?, render_layer?, shadow?}; ctx read-only;
## shadow_textures: caller-supplied {id -> Texture2D} (no load/mint). Creates owned
## shadow nodes only where a shadow meta + a caller texture are both present.
func apply_to_assembly(assembly, props: Array, ctx: Dictionary = {}, shadow_textures: Dictionary = {}) -> Dictionary:
	terminate()
	var entries: Array = []
	var gaps: Array = []
	if ctx.is_empty():
		gaps.append({"facet": "camera/player context", "required": "central ctx {outer_enabled, hand, phase} (read-only)"})
	for p in props:
		var id := String(p.get("id", p.get("type", "")))
		var node: Sprite2D = assembly.get_node_or_null("prop_" + id) as Sprite2D if assembly != null else null
		var da := display_alpha(p, ctx)
		var dz := draw_order_z(p)
		var rec := {
			"id": id, "alpha": da["alpha"], "outer_applied": da["outer_applied"],
			"region": da["region"], "z": dz["z"], "node_found": node != null,
			"shadow_created": false,
		}
		if node != null:
			_applied.append({"node": node, "orig_a": node.modulate.a, "orig_z": node.z_index})
			var m := node.modulate
			m.a = float(da["alpha"])
			node.modulate = m
			if dz["z"] != null:
				node.z_index = int(dz["z"])
		else:
			rec["gap"] = {"facet": "view node", "status": "prop_" + id + " not assembled (R11 unready) -> alpha/z not applied"}
		# shadow body — source-shaped meta + caller texture required (no invention)
		var sh := shadow_spec(p)
		if sh["present"]:
			var stex: Texture2D = shadow_textures.get(id, null)
			if stex != null:
				var sn := Sprite2D.new()
				sn.name = "shadow_" + id
				sn.centered = true
				sn.texture = stex
				var sm := sn.modulate
				sm.a = float(sh["alpha"])
				sn.modulate = sm
				sn.z_as_relative = false
				sn.z_index = int(sh["render_layer"])
				if node != null:
					sn.position = node.position
				add_child(sn)
				_shadow_nodes.append(sn)
				rec["shadow_created"] = true
			else:
				rec["gap_shadow"] = {"facet": "shadow texture", "status": "shadow meta present but no caller texture -> shadow NOT minted"}
		entries.append(rec)
	return {
		"count": entries.size(),
		"applied_nodes": _applied.size(),
		"shadow_nodes": _shadow_nodes.size(),
		"entries": entries,
		"gaps": gaps,
		"c1_ground_shadow_in_source": false,   # confirmed absent (only c3 has one)
	}

## Body 3 — reclaim ONLY own-created shadow nodes + restore the alpha/z we set on the
## R11 sprites (R11 keeps ownership of its own sprites).
func terminate() -> void:
	for r in _applied:
		var n = r["node"]
		if n != null and is_instance_valid(n):
			var m = n.modulate
			m.a = r["orig_a"]
			n.modulate = m
			n.z_index = r["orig_z"]
	_applied.clear()
	for s in _shadow_nodes:
		if s != null and is_instance_valid(s):
			if s.get_parent() == self:
				remove_child(s)
			s.queue_free()
	_shadow_nodes.clear()

func dispose() -> void:
	terminate()

func snapshot() -> Dictionary:
	return {
		"shadow_nodes": _shadow_nodes.size(),
		"applied_nodes": _applied.size(),
		"child_count": get_child_count(),
	}
