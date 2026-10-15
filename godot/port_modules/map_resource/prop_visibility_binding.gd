extends RefCounted
## Isolated CH1-1 PROP VISIBILITY BINDING (MAP port, R15).
## The MINIMAL real consumer connection between the R13 map_view_owner (actual
## ground+prop owner) and the R14 prop_visibility_owner (source alpha/renderLayer/
## shadow). It adds NO new display logic — it only wires existing owners:
##
## (1) resolve R13's actual-created prop view (its public "PropViewAssembly" child =
##     the live R11 Sprite2D CanvasItems) and feed it + the READ-ONLY source context
##     into R14's public API. No formula/coord duplication.
## (2) The live prop's original alpha/renderLayer -> final CanvasItem path ALREADY
##     exists inside R14.apply_to_assembly (it sets modulate.a / z_index on the live
##     sprites), so NO duplicate wrapper / reimplementation is made here. The ONE
##     genuinely-missing contact point is the ground-shadow facet: R14 parents its
##     shadow nodes to itself, so this binding attaches the R14 owner INTO R13's owned
##     subtree, so any source-shaped shadow lands in the live prop node tree. For CH1
##     there is no source shadow + (usually) no caller texture -> exact gap, nothing minted.
## (3) update re-runs the single apply; terminate reclaims ONLY this binding's own edge
##     (detaches the R14 owner it attached) and triggers R14 to reclaim its own nodes;
##     it frees neither the R13/R11 nodes nor the R14 owner. A texture-absent shadow
##     facet -> exact gap.
## Approved original prop source display only. No new geometry/nav/collision/camera/
## world/PNG/import. zones_mask/mask/blend/SVG/zone_weights DENIED (no access/bypass).

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-prop-visibility-binding-r15-20261014"

var _bound := false
var _r13                     # map_view_owner (R13) — caller-owned
var _vis                     # prop_visibility_owner (R14) — caller-owned
var _attached := false       # did THIS binding attach _vis under _r13? (our own edge)

## R13 exposes its actual-created prop view as the child named "PropViewAssembly".
func _resolve_prop_view(r13):
	if r13 == null:
		return null
	return r13.get_node_or_null("PropViewAssembly")

## Body 1+2 — the minimal connection. Reuses R14.apply_to_assembly (existing alpha/
## renderLayer CanvasItem path, no wrapper) and binds the missing shadow facet into
## R13's owned subtree. props/ctx/shadow_textures are central/caller-supplied read-only.
func bind(r13, vis, props: Array, ctx: Dictionary = {}, shadow_textures: Dictionary = {}) -> Dictionary:
	unbind()
	_r13 = r13
	_vis = vis
	var prop_view = _resolve_prop_view(r13)
	if prop_view == null:
		_bound = true
		return {
			"bound": true, "prop_view_found": false,
			"gaps": [{"facet": "R13 prop view", "status": "map_view_owner has no PropViewAssembly child (not mounted) -> nothing to bind"}],
		}
	if vis == null:
		_bound = true
		return {
			"bound": true, "prop_view_found": true,
			"gaps": [{"facet": "R14 visibility owner", "status": "no prop_visibility_owner supplied -> alpha/renderLayer/shadow not connected"}],
		}

	# bind the ground-shadow facet into the LIVE owned tree: attach the R14 owner under
	# R13 so R14's shadow children land inside R13's subtree. Only if we can own the edge.
	if vis.get_parent() == null:
		r13.add_child(vis)
		_attached = true

	# reuse the EXISTING alpha/renderLayer -> CanvasItem path (no duplicate wrapper)
	var r14: Dictionary = vis.apply_to_assembly(prop_view, props, ctx, shadow_textures)
	_bound = true

	var shadow_gaps: Array = []
	for e in (r14.get("entries", []) as Array):
		if e.has("gap_shadow"):
			shadow_gaps.append({"id": e.get("id", ""), "gap": e["gap_shadow"]})
	var gaps: Array = (r14.get("gaps", []) as Array).duplicate()
	for sg in shadow_gaps:
		gaps.append(sg)

	return {
		"bound": true,
		"prop_view_found": true,
		"alpha_renderlayer_path": "reused R14.apply_to_assembly (existing CanvasItem modulate.a/z_index path; no duplicate wrapper)",
		"applied_count": r14.get("count", 0),
		"applied_nodes": r14.get("applied_nodes", 0),
		"shadow_facet": {
			"connected_into_owned_tree": _vis.get_parent() == _r13,
			"attached_by_binding": _attached,
			"shadow_nodes": r14.get("shadow_nodes", 0),
			"c1_ground_shadow_in_source": r14.get("c1_ground_shadow_in_source", false),
			"gaps": shadow_gaps,          # texture-absent shadow facets (nothing minted)
		},
		"gaps": gaps,
	}

## Body 3 — owner update: re-run the single apply on the SAME resolved prop view.
func update(props: Array, ctx: Dictionary = {}, shadow_textures: Dictionary = {}) -> Dictionary:
	if not _bound or _r13 == null or _vis == null:
		return {"bound": false, "gaps": [{"facet": "binding", "status": "not bound -> call bind() first"}]}
	var prop_view = _resolve_prop_view(_r13)
	if prop_view == null:
		return {"bound": true, "prop_view_found": false, "gaps": [{"facet": "R13 prop view", "status": "prop view gone (R13 re-mounted/terminated) -> rebind"}]}
	var r14: Dictionary = _vis.apply_to_assembly(prop_view, props, ctx, shadow_textures)
	var shadow_gaps: Array = []
	for e in (r14.get("entries", []) as Array):
		if e.has("gap_shadow"):
			shadow_gaps.append({"id": e.get("id", ""), "gap": e["gap_shadow"]})
	return {
		"bound": true, "prop_view_found": true,
		"applied_count": r14.get("count", 0),
		"shadow_nodes": r14.get("shadow_nodes", 0),
		"gaps": (r14.get("gaps", []) as Array) + shadow_gaps,
	}

## Body 3 — reclaim ONLY this binding's own edge: detach the R14 owner IF this binding
## attached it, and let R14 reclaim its own nodes (R14 owns its shadows + restores the
## alpha/z it set). Never frees the R13/R11 nodes or the R14 owner itself.
func unbind() -> void:
	if _vis != null:
		if _vis.has_method("terminate"):
			_vis.terminate()                       # R14 reclaims its own nodes + restores
		if _attached and _vis.get_parent() == _r13:
			_r13.remove_child(_vis)                # undo only the edge we created
	_attached = false
	_bound = false
	_r13 = null
	_vis = null

func dispose() -> void:
	unbind()

func snapshot() -> Dictionary:
	return {
		"bound": _bound,
		"attached_edge": _attached,
		"has_r13": _r13 != null,
		"has_vis": _vis != null,
	}
