extends RefCounted
## Isolated CH1-1 hand-prop NAV-SNAP adapter (MAP port, R9).
## Three sub-units bridging R8's authored catalog position to the real [HAND_DECO]
## placement: (1) port the `_nearFloor` snap boundary (anchor tile in, original
## ring order/unit); (2) consume a READ-ONLY central nav/walkability provider
## (owner-injected Callable); (3) hand the source-confirmed snapped world position
## to the EXISTING view caller. It creates no new geometry/nav/collision/coord-canon/
## RootWorld placement, invents NO nearest grid when the provider is absent (then
## ready=false + an exact-API gap), and overwrites NO canon. The R6/docs 0.72 vs
## runtime handProps-1/no-pivot scale·pivot split is POSITION-out-of-scope here: this
## adapter touches position only and keeps per-consumer data distinct (R8 record
## untouched). zones_mask/zoneblend/SVG/zone_weights remain HELD (no access).
##
## Source (read-only, confirmed — not invented):
##   game.html:22899  _nearFloor(tx,ty){ if(_floorAt(tx,ty)) return {x:tx,y:ty};
##     for(r=1;r<10;r++) for(dy=-r..r) for(dx=-r..r) if(_floorAt(tx+dx,ty+dy)) return {...};
##     return null }
##   game.html:23185-23187  _hNear=_nearFloor(H.x|0,H.y|0); world=(_hNear.x+.5)*T,(_hNear.y+.5)*T; T=40

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-prop-nav-adapter-r9-20261014"
const TILE_SIZE_PX := 40.0
const MAX_RING := 10   # original: r < 10 (Chebyshev radius up to 9)

## Read-only provider call: floor_provider(tx:int, ty:int) -> bool. No mutation.
func _floor_at(floor_provider: Callable, tx: int, ty: int) -> bool:
	return bool(floor_provider.call(tx, ty))

## Sub-unit 1+2 — port _nearFloor with the exact original order/unit, consuming the
## owner's read-only walkability provider. provider absent -> ready=false + gap (no
## invented nearest grid). provider present but no floor within r<10 -> found=false
## (original returns null -> the real consumer skips that prop).
func near_floor(tx_in, ty_in, floor_provider: Callable) -> Dictionary:
	var tx := int(tx_in)   # original truncates (H.x|0)
	var ty := int(ty_in)
	if floor_provider.is_null():
		return {
			"ready": false, "found": false, "tile": null, "ring": -1,
			"gap": nav_provider_gap(),
		}
	if _floor_at(floor_provider, tx, ty):
		return {"ready": true, "found": true, "tile": [tx, ty], "ring": 0}
	for r in range(1, MAX_RING):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if _floor_at(floor_provider, tx + dx, ty + dy):
					return {"ready": true, "found": true, "tile": [tx + dx, ty + dy], "ring": r}
	# provider answered, no floor within radius 9 (original -> null -> prop skipped)
	return {"ready": true, "found": false, "tile": null, "ring": -1}

## tile -> world foot, matching the consumer: (tile+0.5)*T.
func tile_to_world(tx: int, ty: int) -> Vector2:
	return Vector2((float(tx) + 0.5) * TILE_SIZE_PX, (float(ty) + 0.5) * TILE_SIZE_PX)

## Sub-unit 3 — resolve one catalog entry: authored vs snapped are kept DISTINCT.
## entry needs "tile":[x,y]; "authored_world" optional (else derived from tile).
func resolve(entry: Dictionary, floor_provider: Callable) -> Dictionary:
	var tx := int(entry["tile"][0])
	var ty := int(entry["tile"][1])
	var authored := Vector2(float(tx) + 0.5, float(ty) + 0.5) * TILE_SIZE_PX
	if entry.has("authored_world"):
		authored = Vector2(float(entry["authored_world"][0]), float(entry["authored_world"][1]))
	var nf := near_floor(tx, ty, floor_provider)
	var out := {
		"id": entry.get("id", ""),
		"authored_tile": [tx, ty],
		"authored_world": authored,
		"ready": nf["ready"],
		"found": nf["found"],
	}
	if not nf["ready"]:
		out["world_source"] = "authored-only (no nav provider)"
		out["snapped_world"] = null
		out["gap"] = nf["gap"]
		return out
	if not nf["found"]:
		out["world_source"] = "unplaced (no floor within r<10; original returns null)"
		out["snapped_world"] = null
		return out
	var st = nf["tile"]
	out["snap_tile"] = st
	out["snapped_world"] = tile_to_world(int(st[0]), int(st[1]))
	out["ring"] = nf["ring"]
	out["moved"] = (int(st[0]) != tx or int(st[1]) != ty)
	out["world_source"] = "nav-snapped"
	return out

## Hand the source-confirmed snapped world to the EXISTING view caller (no duplicate
## of the catalog/view module). Prefers caller.set_prop_world(id, world); else a
## Node child named "prop_<id>" gets its position set. Position-only; nothing minted.
func apply_to_view(view_caller: Object, entry: Dictionary, floor_provider: Callable) -> Dictionary:
	var r := resolve(entry, floor_provider)
	r["applied"] = false
	if not r["ready"] or not r["found"]:
		return r   # authored-only or unplaced -> nothing to re-seat
	var world: Vector2 = r["snapped_world"]
	if view_caller != null and view_caller.has_method("set_prop_world"):
		view_caller.call("set_prop_world", String(entry.get("id", "")), world)
		r["applied"] = true
	elif view_caller is Node:
		var child: Node = (view_caller as Node).get_node_or_null("prop_" + String(entry.get("id", "")))
		if child is Node2D:
			(child as Node2D).position = world
			r["applied"] = true
	return r

## Exact-API gap when the central nav/walkability provider is not supplied.
func nav_provider_gap() -> Dictionary:
	return {
		"kind": "nav_walkability_provider",
		"status": "absent -> ready=false (no nearest-grid invented)",
		"required_api": "Callable floor_provider(tx:int, ty:int) -> bool (central read-only walkable check; source _floorAt). ENGINE owns the real nav/floor data.",
	}

## Scope note: this adapter is POSITION-only. scale/pivot per-consumer split from R8
## is NOT reconciled or overwritten here.
func scope() -> Dictionary:
	return {
		"handles": "nav-snap world position only (ports _nearFloor)",
		"excludes": "scale/pivot (R6/docs 0.72 vs handProps-1/no-pivot stay per-consumer; no canon overwritten)",
		"ring_order": "self; then r=1..9, dy:-r..r outer, dx:-r..r inner; first walkable wins; else null",
	}
