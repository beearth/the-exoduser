extends "res://scripts/maps/map11/stage_provider.gd"
## Field specialization reuses base compiler's anchors/routes/solids/lifecycle.
const FieldRecipe = preload("res://scripts/maps/map11/field_recipe.gd")
const FIELD_REQUIRED = {"map11.field.start":["Start","player_start"],"map11.field.gate":["Gate","gate"],"map11.field.return":["Return","gate_return"],"map11.field.landmark":["Landmark","landmark"]}
var _outer := PackedVector2Array()
var _bounds := Rect2()
var _orientation: float = 1
func _required_anchors() -> Dictionary: return FIELD_REQUIRED
func _entry_id() -> String: return "map11.field.start"
func _configure_geometry(recipe: Resource) -> void:
	_metric = Vector3i.ZERO
	if not recipe is FieldRecipe:
		errors.append("FIELD_SCHEMA_REQUIRED")
		return
	_outer = recipe.outer.duplicate()
	if _outer.size() < 3 or Geometry2D.triangulate_polygon(_outer).is_empty():
		errors.append("INVALID_OUTER_POLYGON")
		return
	_bounds = Rect2(_outer[0],Vector2.ZERO)
	for point in _outer:
		if not point.is_finite(): errors.append("NONFINITE_POLYGON")
		_bounds = _bounds.expand(point)
	_orientation = 1 if _area(_outer) > 0 else -1
func _area(polygon: PackedVector2Array) -> float:
	var area: float = 0
	for i in range(polygon.size()): area += polygon[i].cross(polygon[(i+1)%polygon.size()])
	return area*.5
func _compile_regions(recipe: Resource, ids: Dictionary, global_ids: Dictionary) -> void:
	var area: float = 0
	for row in recipe.regions:
		if not _has(row,["id","key","polygon"]) or not row.id is int or row.id < 0 or row.id > 3 or not row.key is String or not row.polygon is PackedVector2Array or row.polygon.size()<3:
			errors.append("INVALID_FIELD_REGION")
			continue
		if ids.has(row.id) or global_ids.has(row.key): errors.append("DUPLICATE_FIELD_REGION")
		ids[row.id] = true
		global_ids[row.key] = true
		for point in row.polygon:
			if not point.is_finite() or not _point_inside(point): errors.append("OUTSIDE_REGION")
		area += absf(_area(row.polygon))
		for other in _regions:
			for overlap in Geometry2D.intersect_polygons(row.polygon,other.polygon):
				if absf(_area(overlap)) > 1: errors.append("REGION_OVERLAP")
		_regions.append(row.duplicate(true))
	if _regions.size()!=4 or absf(area-absf(_area(_outer)))>10: errors.append("REGION_COVERAGE")
func _point_inside(p: Vector2) -> bool:
	if Geometry2D.is_point_in_polygon(p,_outer): return true
	for i in range(_outer.size()):
		if Geometry2D.get_closest_point_to_segment(p,_outer[i],_outer[(i+1)%_outer.size()]).distance_squared_to(p) < .001: return true
	return false
func _contains_circle(p: Vector2, r: float) -> bool:
	if _outer.size()<3 or not _point_inside(p): return false
	for i in range(_outer.size()):
		if Geometry2D.get_closest_point_to_segment(p,_outer[i],_outer[(i+1)%_outer.size()]).distance_squared_to(p) < r*r-.001: return false
	return true
func region_at(p: Vector2) -> int:
	if _retired or (not content_valid and not _compiling) or not p.is_finite(): return -1
	var chosen: int = -1
	for row in _regions:
		if Geometry2D.is_point_in_polygon(p,row.polygon):
			if chosen == -1 or row.id < chosen: chosen = row.id
	return chosen
func _boundary_fraction(a: Vector2, b: Vector2, r: float) -> float:
	var d := b-a
	var best: float = 1
	for i in range(_outer.size()):
		var p: Vector2 = _outer[i]
		var q: Vector2 = _outer[(i+1)%_outer.size()]
		var edge := q-p
		var length_: float = edge.length()
		if length_ == 0: continue
		var tangent := edge/length_
		var normal := Vector2(-tangent.y,tangent.x)*_orientation
		var speed: float = d.dot(normal)
		if speed < -0.000001:
			var t: float = (r-(a-p).dot(normal))/speed
			if t >= 0 and t < best:
				var along: float = (a+d*t-p).dot(tangent)
				if along >= 0 and along <= length_: best = t
		if r > 0:
			var endpoint: float = _first_circle(a,d,p,r)
			if endpoint == 0 and (a-p).dot(d) >= 0: continue
			best = minf(best,endpoint)
	return best
func _boundary_normal(point: Vector2, _r: float) -> Vector2:
	var best: float = INF
	var normal := Vector2.ZERO
	for i in range(_outer.size()):
		var p: Vector2 = _outer[i]
		var q: Vector2 = _outer[(i+1)%_outer.size()]
		var closest := Geometry2D.get_closest_point_to_segment(point,p,q)
		var distance: float = point.distance_squared_to(closest)
		if distance < best:
			best = distance
			normal = (point-closest).normalized() if distance > .000001 else Vector2(-(q-p).y,(q-p).x).normalized()*_orientation
	return normal
func describe() -> Dictionary:
	var result: Dictionary = super.describe()
	result.erase("radius")
	result.bounds = _bounds
	result.region_namespace = "map11.field"
	result.capabilities.field_regions = true
	result.capabilities.polygon_boundary = true
	result.geometry = "authored_polygon + explicit_circle_solids"
	return result

func _geometry_fingerprint() -> Variant: return _outer
