extends Node2D
## MAP11-11 independent provider. No Main/State installation or gameplay writer.
const FieldRecipe=preload("res://scripts/maps/map11/field_recipe.gd")
const FieldProvider=preload("res://scripts/maps/map11/field_provider.gd")
const ArenaProvider=preload("res://scripts/maps/map11/stage_provider.gd")
const Holes=preload("res://scripts/native_spawn_hole_system.gd")
const Flow=preload("res://scripts/maps/map11/field_flow.gd")
const ARENA_OFFSET := Vector2(0,-8000)
const REVISION := "map11.field+arena.v1"
const HOLE_ANCHORS := ["west","east","early","east_lower"]
var field: RefCounted
var arena: RefCounted
var _markers: Dictionary={}
var _marker_positions: Dictionary={}
var _holes: Array=[]
var _anchor_rows: Array=[]
var _flows: Dictionary={}
var _gate_owner: WeakRef
var _gate_enter: Callable
var _gate_leave: Callable
var _revision: String=REVISION
var _valid: bool=false
var _bound_transform: Transform2D
var _collision_owner: Node2D
func _ready() -> void:
	_bound_transform=global_transform
	# Translation only: source attack extents and circle radii never scale.
	if global_transform.x!=Vector2.RIGHT or global_transform.y!=Vector2.DOWN: return
	var recipe=FieldRecipe.new()
	field=FieldProvider.new(); arena=ArenaProvider.new()
	if not field.compile(recipe) or not arena.compile(load("res://scripts/maps/map11/arena_recipe.tres")): return
	_collision_owner=Node2D.new(); _collision_owner.name="StaticGeometry"; add_child(_collision_owner)
	var body:=StaticBody2D.new(); _collision_owner.add_child(body)
	var polygon:=CollisionPolygon2D.new(); polygon.build_mode=CollisionPolygon2D.BUILD_SEGMENTS; polygon.polygon=recipe.outer; body.add_child(polygon)
	for row in recipe.solids:
		if not row.blocks_move: continue
		var solid:=StaticBody2D.new(); solid.position=row.center; _collision_owner.add_child(solid)
		var shape:=CircleShape2D.new(); shape.radius=row.radius
		var collision:=CollisionShape2D.new(); collision.shape=shape; solid.add_child(collision)
	var arena_body:=StaticBody2D.new(); arena_body.position=ARENA_OFFSET; _collision_owner.add_child(arena_body)
	# Analytic circle queries use exact R1700. Physics wall is an outer tangent
	# polygon: never shrinks approved arena; max radial discrepancy <0.52px.
	var rim:=PackedVector2Array()
	for i in range(128): rim.append(Vector2.from_angle(TAU*(i+.5)/128)*1700.0/cos(PI/128))
	var arena_wall:=CollisionPolygon2D.new(); arena_wall.build_mode=CollisionPolygon2D.BUILD_SEGMENTS; arena_wall.polygon=rim; arena_body.add_child(arena_wall)
	var group:=Node2D.new(); group.name="FieldMarkers"; add_child(group)
	for row in recipe.anchors:
		var marker: Marker2D=_make_marker(group,row.marker,row.position,row.id)
		_anchor_rows.append({"id":row.id,"marker":marker,"role":row.role,"region_id":row.region_id,"space":"field"})
	var boss_group:=Node2D.new(); boss_group.name="Markers"; add_child(boss_group)
	for id in ["entry","boss","exit","return"]:
		var a: Dictionary={}
		# Base anchor requires role; use the immutable recipe role below.
		for row in load("res://scripts/maps/map11/arena_recipe.tres").anchors:
			if row.id=="map11.arena."+id: a=row
		var marker: Marker2D=_make_marker(boss_group,a.marker,a.position+ARENA_OFFSET,a.id)
		_anchor_rows.append({"id":a.id,"marker":marker,"role":a.role,"region_id":0,"space":"arena"})
	var holes:=Node2D.new(); holes.name="HoleMarkers"; add_child(holes)
	for suffix in HOLE_ANCHORS:
		var source: Marker2D=_markers["map11.field."+suffix]
		var id: String="map11.field.hole."+suffix
		var marker: Marker2D=_make_marker(holes,suffix,source.position,id)
		_holes.append({"id":id,"marker":marker,"region_id":field.region_at(source.position),"size":0.3,"room":0})
		_anchor_rows.append({"id":id,"marker":marker,"role":"hole","region_id":field.region_at(source.position),"space":"field"})
	_valid=true
func _make_marker(parent: Node2D, label: String, point: Vector2, id: String) -> Marker2D:
	var marker:=Marker2D.new(); marker.name=label; marker.position=point; parent.add_child(marker); _markers[id]=marker; _marker_positions[id]=point; return marker
func runtime_ready() -> bool:
	if not _valid or is_queued_for_deletion() or not is_inside_tree() or global_transform!=_bound_transform or not field.is_current("map11.field",1) or not arena.is_current("map11.arena",1) or not is_instance_valid(_collision_owner): return false
	for id in _markers:
		var marker: Variant=_markers[id]
		if not is_instance_valid(marker) or marker.is_queued_for_deletion() or not marker.is_inside_tree() or not is_ancestor_of(marker) or marker.global_position!=_bound_transform*_marker_positions[id]: return false
	return true
func describe() -> Dictionary:
	return {"content_valid":_valid,"runtime_ready":runtime_ready(),"stage_id":"map11","stage_index":0,"map_instance_id":"map11.field+arena","revision":_revision,"field_hash":field.content_hash if field!=null else "","capabilities":{"flow":true,"los":true,"static_collider":true}}
func anchors(role: String) -> Array:
	if not runtime_ready(): return []
	if role=="hole": return _holes.duplicate(true)
	var result: Array=[]
	for row in _anchor_rows:
		if role=="*" or role==row.role: result.append(row.duplicate())
	return result
func region_sites() -> Dictionary:
	var rows: Array=[]
	for i in range(4): rows.append({"id":i,"fb_index":i,"name_ko":"","name_en":""})
	# Consumer labels use existing region names, not new display copy.
	rows[0].name_ko="마른 심재 고리"; rows[0].name_en="Dry heartwood loop"
	rows[1].name_ko="습윤 고리"; rows[1].name_en="Wet loop"
	rows[2].name_ko="기상터"; rows[2].name_en="Awakening ground"
	rows[3].name_ko="중앙 전투면"; rows[3].name_en="Central combat ground"
	return {"regions":rows,"gate_region_id":0,"revision":_revision}
func spawn_budget_manifest() -> Dictionary:
	var rows: Array=[]
	for h in _holes:
		# G31029–31030: reuse the existing source count API, not actor count.
		rows.append({"spawn_group_id":h.id+".group","hole_id":h.id,"region_id":h.region_id,"total":Holes.spawn_hole_count(h.size,0)})
	return {"revision":_revision,"groups":rows}
func region_at(point: Vector2) -> int:
	return field.region_at(to_local(point)) if runtime_ready() else -1
func spawn_sites(role: String, request: Dictionary) -> Dictionary:
	if not runtime_ready() or role!="hole" or request.get("revision")!=_revision: return {"ready":false,"reason":"NOT_READY"}
	var r: Variant=request.get("radius")
	if not (r is float or r is int) or not is_finite(float(r)) or r<=0: return {"ready":false,"reason":"INVALID_RADIUS"}
	for h in _holes:
		if h.id!=request.get("hole_id") or h.id+".group"!=request.get("spawn_group_id") or h.region_id!=request.get("region_id"): continue
		var marker: Marker2D=h.marker
		if not is_instance_valid(marker) or marker.is_queued_for_deletion() or not marker.is_inside_tree() or not is_ancestor_of(marker) or not field.can_move(to_local(marker.global_position),r) or region_at(marker.global_position)!=h.region_id: return {"ready":false,"reason":"ILLEGAL_SITE"}
		return {"ready":true,"revision":_revision,"site_id":h.id,"region_id":h.region_id,"position":marker.global_position}
	return {"ready":false,"reason":"UNKNOWN_SITE"}
func can_move(point: Vector2, radius_: float, space: String="field") -> bool:
	if not runtime_ready(): return false
	var p: Vector2=to_local(point)
	return field.can_move(p,radius_) if space=="field" else (arena.can_move(p-ARENA_OFFSET,radius_) if space=="arena" else false)
func line_of_sight(a: Vector2,b: Vector2,space: String="field") -> bool:
	if not runtime_ready(): return false
	if space=="field": return field.line_of_sight(to_local(a),to_local(b))
	return space=="arena" and arena.line_of_sight(to_local(a)-ARENA_OFFSET,to_local(b)-ARENA_OFFSET)
func sweep_fraction(a: Vector2,b: Vector2,r: float,space: String="field") -> float:
	if not runtime_ready(): return -1
	if space=="field": return field.sweep_fraction(to_local(a),to_local(b),r)
	return arena.sweep_fraction(to_local(a)-ARENA_OFFSET,to_local(b)-ARENA_OFFSET,r) if space=="arena" else -1
func prepare_flow(target_id: String, radius_: float) -> String:
	if not runtime_ready() or not is_finite(radius_) or radius_<=0 or radius_>96: return ""
	var marker: Variant=_markers.get(target_id)
	if not marker is Marker2D or not target_id.begins_with("map11.field."): return ""
	var key: String=_revision+":"+target_id+":"+str(radius_)
	if _flows.has(key): return key
	if _flows.size()>=8: return ""
	var flow=Flow.new()
	if not flow.prepare(field,to_local(marker.global_position),radius_): return ""
	_flows[key]=flow; return key
func flow_query(key: String,point: Vector2,out: Dictionary) -> bool:
	out.clear()
	if not runtime_ready() or not _flows.has(key): out.status="NOT_READY"; return false
	if not _flows[key].query(to_local(point),out): return false
	out.waypoint=to_global(out.waypoint); return true
func transition_sites() -> Dictionary:
	if not runtime_ready(): return {"status":"NOT_READY"}
	return {"status":"OK","revision":_revision,"field_gate":_markers["map11.field.gate"],"arena_entry":_markers["map11.arena.entry"],"boss":_markers["map11.arena.boss"],"arena_exit":_markers["map11.arena.exit"],"field_return":_markers["map11.field.return"],"arena_return":_markers["map11.arena.return"]}
func gate_contact(point: Vector2,route: String,radius_: float=15) -> bool:
	if not runtime_ready() or not point.is_finite() or not is_finite(radius_) or radius_<0 or radius_>96: return false
	var id: String="map11.field.gate" if route=="enter" else ("map11.arena.exit" if route=="leave" else "")
	if id.is_empty(): return false
	return point.distance_to(_markers[id].global_position)<=96+radius_
func legacy_boss_metrics(out: Dictionary) -> bool:
	out.clear()
	if not runtime_ready(): return false
	var m: Vector3i=arena.boss_extent(); out.merge({"mw":m.x,"mh":m.y,"T":m.z}); return true
func retire() -> void:
	_valid=false
	if field!=null: field.retire()
	if arena!=null: arena.retire()
	_flows.clear()

# Installation is explicit and opt-in; the existing encounter remains the writer.
func bind_gate_consumer(consumer: Node) -> bool:
	if not runtime_ready() or _gate_owner!=null or not is_instance_valid(consumer): return false
	for method in ["bind_provider","enter","leave"]:
		if not consumer.has_method(method): return false
	if consumer.call("bind_provider",self)!=true: return false
	_gate_owner=weakref(consumer); _gate_enter=Callable(consumer,"enter"); _gate_leave=Callable(consumer,"leave")
	return true
func request_gate_enter(point: Vector2, spawn_options: Dictionary) -> Dictionary:
	if not gate_contact(point,"enter") or _gate_owner==null or not is_instance_valid(_gate_owner.get_ref()) or not _gate_enter.is_valid(): return {"status":"NOT_READY"}
	return _gate_enter.call(self,spawn_options)
func request_gate_leave(point: Vector2) -> bool:
	return gate_contact(point,"leave") and _gate_owner!=null and is_instance_valid(_gate_owner.get_ref()) and _gate_leave.is_valid() and _gate_leave.call(self)==true
