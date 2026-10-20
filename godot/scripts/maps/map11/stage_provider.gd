extends RefCounted
## Compile-once content snapshot. Scalar geometry queries allocate no lists.
## Circle solid schema intentionally small; unsupported geometry fails validation.
const Recipe = preload("res://scripts/maps/map11/stage_recipe.gd")
const REQUIRED = {"map11.arena.entry":["Entry","arena_entry"],"map11.arena.boss":["Boss","boss_center"],"map11.arena.exit":["Exit","arena_exit"],"map11.arena.return":["Return","arena_return"]}
var content_valid: bool = false
var errors: PackedStringArray = []
var instance_id: String = ""
var revision: int = 0
var radius: float = 0
var content_hash: String = ""
var _anchors: Dictionary = {}
var _regions: Array[Dictionary] = []
var _solids: Array[Dictionary] = []
var _metric := Vector3i.ZERO
var _graph: Dictionary = {}
var _retired: bool = false
var _compiling: bool = false

func compile(recipe: Resource) -> bool:
	# Recompilation invalidates old bindings even if author reused a revision.
	if revision != 0:
		errors.append("RECOMPILE_FORBIDDEN: use a new provider/revision")
		content_valid = false
		return false
	if not recipe is Recipe:
		errors.append("INVALID_SCHEMA")
		return false
	_compiling = true
	instance_id = recipe.map_instance_id
	revision = recipe.revision
	_configure_geometry(recipe)
	if recipe.schema_version != 1 or recipe.stage_id != 0 or instance_id.is_empty() or revision <= 0:
		errors.append("INVALID_HEADER")
	var ids: Dictionary = {}
	var global_ids: Dictionary = {}
	_compile_regions(recipe,ids,global_ids)
	ids.clear()
	for row in recipe.solids:
		if not _has(row,["id","center","radius","blocks_move","blocks_los"]) or not row.center is Vector2 or not _finite_point(row.center) or not _number(row.radius) or row.radius <= 0 or not row.blocks_move is bool or not row.blocks_los is bool:
			errors.append("INVALID_SOLID")
			continue
		if not row.id is String or str(row.id).is_empty():
			errors.append("INVALID_SOLID_ID")
			continue
		if global_ids.has(str(row.id)): errors.append("DUPLICATE_ID")
		global_ids[str(row.id)] = true
		if ids.has(row.id): errors.append("DUPLICATE_SOLID")
		ids[row.id] = true
		if not _contains_circle(row.center,row.radius): errors.append("OUTSIDE_SOLID")
		_solids.append(row.duplicate(true))
	ids.clear()
	for row in recipe.anchors:
		if not _has(row,["id","marker","role","position","facing","region_id","clearance"]) or not row.position is Vector2 or not _finite_point(row.position) or not _number(row.clearance) or row.clearance < 0 or not _number(row.facing):
			errors.append("INVALID_ANCHOR")
			continue
		if not row.id is String or not row.marker is String or not row.role is String or not row.region_id is int or str(row.id).is_empty():
			errors.append("INVALID_ANCHOR_ID")
			continue
		if global_ids.has(row.id): errors.append("DUPLICATE_ID")
		global_ids[row.id] = true
		if _anchors.has(row.id) or ids.has(row.marker): errors.append("DUPLICATE_ANCHOR")
		ids[row.marker] = true
		if not can_move(row.position,row.clearance): errors.append("OUTSIDE_OR_BLOCKED_ANCHOR:"+str(row.id))
		if region_at(row.position) != row.region_id: errors.append("ANCHOR_REGION:"+str(row.id))
		_anchors[row.id] = row.duplicate(true)
		_graph[row.id] = []
	for id in _required_anchors():
		if not _anchors.has(id) or _anchors[id].marker != _required_anchors()[id][0] or _anchors[id].role != _required_anchors()[id][1]: errors.append("MISSING_REQUIRED_ANCHOR:"+id)
	ids.clear()
	for row in recipe.routes:
		if not _has(row,["from","to","clearance"]) or not _number(row.clearance) or row.clearance < 44 or not _anchors.has(row.from) or not _anchors.has(row.to):
			errors.append("INVALID_ROUTE")
			continue
		var key: String = str(row.from)+">"+str(row.to)
		var reverse: String = str(row.to)+">"+str(row.from)
		if ids.has(key) or ids.has(reverse) or row.from == row.to: errors.append("DUPLICATE_ROUTE")
		ids[key] = true
		if sweep_fraction(_anchors[row.from].position,_anchors[row.to].position,row.clearance) < 1.0:
			errors.append("ROUTE_SWEEP_BLOCKED:"+key)
			continue
		_graph[row.from].append(row.to)
		_graph[row.to].append(row.from)
	# Compile-only traversal; no navigation/list build in runtime queries.
	var reached: Dictionary = {}
	var queue: Array = [_entry_id()] if _graph.has(_entry_id()) else []
	for id in queue: reached[id] = true
	var cursor: int = 0
	while cursor < queue.size():
		var id = queue[cursor]
		cursor += 1
		for next in _graph[id]:
			if not reached.has(next):
				reached[next] = true
				queue.append(next)
	for id in _anchors:
		if not reached.has(id): errors.append("UNREACHABLE_AUTHORED_ROUTE:"+str(id))
	content_hash = JSON.stringify([recipe.schema_version,recipe.stage_id,instance_id,revision,radius,_metric,_geometry_fingerprint(),recipe.anchors,recipe.regions,recipe.solids,recipe.routes]).sha256_text()
	_compiling = false
	content_valid = errors.is_empty()
	return content_valid

func _has(row: Dictionary, keys: Array) -> bool:
	for key in keys:
		if not row.has(key): return false
	return true
func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))
func _finite_point(p: Vector2) -> bool: return is_finite(p.x) and is_finite(p.y)
func is_current(id: String, rev: int) -> bool: return content_valid and not _retired and id == instance_id and rev == revision
func retire() -> void: _retired = true
func region_at(p: Vector2) -> int:
	if _retired or (not content_valid and not _compiling) or not _finite_point(p): return -1
	for row in _regions:
		if p.distance_squared_to(row.center) <= row.radius*row.radius: return int(row.id)
	return -1
func can_move(p: Vector2, r: float) -> bool:
	if _retired or (not content_valid and not _compiling) or not _finite_point(p) or not is_finite(r) or r < 0 or not _contains_circle(p,r): return false
	for row in _solids:
		if row.blocks_move and p.distance_squared_to(row.center) <= (r+row.radius)*(r+row.radius): return false
	return true
func _first_circle(a: Vector2, d: Vector2, center: Vector2, r: float) -> float:
	var offset := a-center
	var c: float = offset.length_squared()-r*r
	if c <= 0: return 0.0
	var aa: float = d.length_squared()
	if aa == 0: return 1.0
	var b: float = offset.dot(d)
	var disc: float = b*b-aa*c
	if disc < 0: return 1.0
	var t: float = (-b-sqrt(disc))/aa
	return t if t >= 0 and t <= 1 else 1.0
func sweep_fraction(a: Vector2, b: Vector2, r: float, los: bool = false) -> float:
	# 1=clear; [0,1)=earliest contact, -1=invalid input/start.
	if _retired or (not content_valid and not _compiling) or not _finite_point(a) or not _finite_point(b) or not is_finite(r) or r < 0 or not _contains_circle(a,r): return -1.0
	if not los and not can_move(a,r): return -1.0
	if not is_finite(a.length_squared()) or not is_finite(b.length_squared()): return -1.0
	var d := b-a
	var best: float = 1.0
	best = _boundary_fraction(a,b,r)
	for row in _solids:
		if (row.blocks_los if los else row.blocks_move): best = minf(best,_first_circle(a,d,row.center,r+row.radius))
	return best
func line_of_sight(a: Vector2, b: Vector2) -> bool:
	if not _finite_point(b) or not _contains_circle(b,0) or sweep_fraction(a,b,0,true) != 1.0: return false
	for row in _solids:
		if row.blocks_los and b.distance_squared_to(row.center) <= row.radius*row.radius: return false
	return true
func anchor(id: String, role: String) -> Dictionary:
	if not content_valid or _retired: return {"status":"NOT_READY"}
	if not _anchors.has(id) or _anchors[id].role != role: return {"status":"NOT_FOUND"}
	return {"status":"OK","anchor":_anchors[id].duplicate(true),"revision":revision,"map_instance_id":instance_id}
func boss_extent() -> Vector3i: return _metric
func describe() -> Dictionary:
	return {"content_valid":content_valid,"runtime_ready":false,"map_instance_id":instance_id,"revision":revision,"bounds":Rect2(Vector2(-radius,-radius),Vector2.ONE*radius*2),"radius":radius,"content_hash":content_hash,"region_namespace":"map11.arena","errors":errors.duplicate(),"capabilities":{"circle_solid":true,"sweep":true,"los":true,"authored_route_validation":true,"field_regions":false,"flow":false,"spawn_policy":false}}

func contact_normal(point: Vector2, r: float) -> Vector2:
	for row in _solids:
		if row.blocks_move and absf(point.distance_to(row.center)-r-row.radius) < 0.01: return (point-row.center).normalized()
	return _boundary_normal(point,r)

func _configure_geometry(recipe: Resource) -> void:
	radius = recipe.radius
	_metric = recipe.effect_extent
	if not is_finite(radius) or radius <= 44: errors.append("INVALID_RADIUS")
	if _metric != Vector3i(128,108,40): errors.append("EFFECT_METRIC_NOT_SOURCE")
func _required_anchors() -> Dictionary: return REQUIRED
func _entry_id() -> String: return "map11.arena.entry"
func _contains_circle(p: Vector2, r: float) -> bool: return p.length()+r <= radius
func _boundary_normal(point: Vector2, _r: float) -> Vector2: return -point.normalized()
func _boundary_fraction(a: Vector2, b: Vector2, r: float) -> float:
	var inner: float = radius-r
	if inner < 0: return -1.0
	if b.length_squared() <= inner*inner: return 1.0
	var d := b-a
	var aa: float = d.length_squared()
	if aa == 0: return -1.0
	var dot_: float = a.dot(d)
	return clampf((-dot_+sqrt(maxf(0,dot_*dot_-aa*(a.length_squared()-inner*inner))))/aa,0,1)
func _compile_regions(recipe: Resource, ids: Dictionary, global_ids: Dictionary) -> void:
	for row in recipe.regions:
		if not _has(row,["id","key","center","radius"]) or not row.center is Vector2 or not _finite_point(row.center) or not _number(row.radius) or row.radius <= 0:
			errors.append("INVALID_REGION")
			continue
		if not row.id is int or not row.key is String or row.key.is_empty():
			errors.append("INVALID_REGION_ID")
			continue
		if global_ids.has(str(row.key)): errors.append("DUPLICATE_ID")
		global_ids[str(row.key)] = true
		if ids.has(str(row.id)) or ids.has(str(row.key)): errors.append("DUPLICATE_REGION")
		ids[str(row.id)] = true
		ids[str(row.key)] = true
		_regions.append(row.duplicate(true))
	if _regions.size() != 1 or _regions[0].id != 0 or _regions[0].key != "map11.arena.region" or _regions[0].center != Vector2.ZERO or _regions[0].radius != radius:
		errors.append("ARENA_REGION_COVERAGE")

func _geometry_fingerprint() -> Variant: return radius
