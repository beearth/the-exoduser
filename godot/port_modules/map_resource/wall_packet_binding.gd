extends RefCounted
## Isolated CH1-1 WALL PACKET BINDING (MAP port, R18).
## The MINIMAL real consumer connection between the EXISTING actual-floor packet (source/
## LOCK/SSOT current wall + CH1-boundary list, exposed through a caller-supplied public
## reader callback) and the already-approved R17 wall_draw_owner. It adds NO new display
## logic — it only wires the existing reader to the existing owner:
##
## (1) read the current packet's wall / CH1-boundary list through the ACTUAL public reader
##     callback (read-only; the real SSOT packet is ENGINE/source-owned) and forward the
##     source coords/scale/rot straight to R17.build AS-IS. No coord/nav math here — the
##     (tile+0.5)*40 rule lives in R9 inside R17. This binding owns ONE wall owner and
##     attaches ONLY that owner under the existing R13 map_view_owner parent (the missing
##     contact point: a bare R17 owner is unparented and never reaches the live tree).
## (2) a same-floor new-packet update re-reads the reader and forwards to R17.update, re-
##     using the EXISTING renderer/culling/transform/lifecycle — NO duplication of the
##     cull / transform / alpha body (all of that stays inside R17/R16/R10/R7).
## (3) source / texture / parent absence -> the exact gap, nothing minted; readiness is
##     whatever R17 reports and is NEVER promoted. No stage-completion READY is invented.
## update/terminate reclaim ONLY this binding's own edge + own owner node; they never free
## the R13 parent or any prior source/WIP module.
## No MainWorld/nav/collider/height/new-geometry/camera/START-EXIT change; no bootstrap
## private _command / 26-replay / full-main-init / Rift / save-owner. zones_mask / mask /
## blend / SVG / zone_weights DENIED — purpose/dependency not accessed/reproduced/bypassed.

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-wall-packet-binding-r18-20261014"

const WallOwner := preload("res://port_modules/map_resource/wall_draw_owner.gd")  # R17

var _bound := false
var _r13                   # map_view_owner (R13) — caller-owned parent
var _owner                 # wall_draw_owner (R17) — OWNED by this binding (own node)
var _attached := false     # did THIS binding attach _owner under _r13? (our own edge)
var _reader: Callable      # actual public floor-packet wall reader (source/SSOT), read-only

## Read the current floor packet's wall/boundary list through the actual public reader.
## Nothing is invented: an invalid reader or non-Array result -> empty list (exact gap).
func _read_packet() -> Array:
	if not _reader.is_valid():
		return []
	var raw = _reader.call()
	return raw if raw is Array else []

## Body 1 — the minimal connection. Reads the SSOT wall packet through the public reader,
## owns ONE R17 wall owner, attaches it under the existing R13 parent, and forwards the
## source coords/scale/rot AS-IS to R17.build. textures/camera are caller-supplied read-only.
func bind(r13, reader: Callable, textures: Dictionary = {}, camera: Dictionary = {}) -> Dictionary:
	unbind()
	_r13 = r13
	_reader = reader
	_owner = WallOwner.new()
	_owner.name = "WallDrawOwner"

	# attach ONLY our own wall owner under the existing R13 parent (the missing contact
	# point). Parent absent -> leave the owner unparented and report the exact gap.
	var parent_ok := false
	if r13 != null:
		r13.add_child(_owner)
		_attached = true
		parent_ok = true

	var reader_ok := _reader.is_valid()
	var packet := _read_packet()                               # read-only SSOT consume
	var built: Dictionary = _owner.build(packet, textures, camera)  # forward AS-IS to R17
	_bound = true

	var gaps: Array = []
	if not reader_ok:
		gaps.append({"facet": "floor packet reader", "status": "no valid public reader callback -> empty wall list (NOT invented)"})
	if not parent_ok:
		gaps.append({"facet": "R13 parent", "status": "no map_view_owner parent -> wall owner unattached (outside the live tree)"})

	return {
		"bound": true,
		"reader_ok": reader_ok,
		"attached_under_r13": _attached,
		"wall_count": built.get("count", 0),
		"drawn_ready": built.get("drawn_ready", 0),   # R17's readiness, never promoted
		"wall_nodes": built.get("wall_nodes", 0),
		"forwarded": "source coords/scale/rot passed AS-IS to R17 (no coord/transform/cull/alpha duplication)",
		"texture_gaps": _collect_texture_gaps(built),
		"gaps": gaps,
		# NO stage-completion READY flag invented (readiness stays R17's per-facet report).
	}

## Body 2 — same-floor update: re-read the reader and forward to R17.update, re-using the
## EXISTING renderer/culling/lifecycle (no cull/transform/alpha body duplicated here).
func update(textures: Dictionary = {}, camera: Dictionary = {}) -> Dictionary:
	if not _bound or _owner == null:
		return {"bound": false, "gaps": [{"facet": "binding", "status": "not bound -> call bind() first"}]}
	var packet := _read_packet()
	var built: Dictionary = _owner.update(packet, textures, camera)
	return {
		"bound": true,
		"reader_ok": _reader.is_valid(),
		"wall_count": built.get("count", 0),
		"drawn_ready": built.get("drawn_ready", 0),
		"wall_nodes": built.get("wall_nodes", 0),
		"texture_gaps": _collect_texture_gaps(built),
	}

## Forward R17's own per-entry texture gaps AS-IS (no new gap text invented).
func _collect_texture_gaps(built: Dictionary) -> Array:
	var out: Array = []
	for e in (built.get("entries", []) as Array):
		if e.has("gap"):
			out.append({"id": e.get("id", ""), "gap": e["gap"]})
	return out

## Body 3 — reclaim ONLY this binding's own edge + own owner node: detach the R17 owner
## IF this binding attached it, let R17 reclaim its own wall nodes, then free the owner WE
## created. Never frees the R13 parent or any prior source/WIP module.
func unbind() -> void:
	if _owner != null:
		if _owner.has_method("dispose"):
			_owner.dispose()                       # R17 frees its own wall nodes + resolvers
		if _attached and _r13 != null and _owner.get_parent() == _r13:
			_r13.remove_child(_owner)              # undo only the edge we created
		_owner.queue_free()                        # free the owner node WE created
		_owner = null
	_attached = false
	_bound = false
	_r13 = null
	_reader = Callable()

func dispose() -> void:
	unbind()

func snapshot() -> Dictionary:
	return {
		"bound": _bound,
		"attached_edge": _attached,
		"has_r13": _r13 != null,
		"has_owner": _owner != null,
		"reader_valid": _reader.is_valid(),
	}
