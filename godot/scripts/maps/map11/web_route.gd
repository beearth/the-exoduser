extends RefCounted
const Flow=preload("res://scripts/maps/map11/web_flow.gd")
var field: RefCounted
var flow: RefCounted
var target: Vector2
var radius: float
func prepare(provider: RefCounted,point: Vector2,r: float) -> bool:
 if not provider.can_move(point,r):return false
 field=provider;target=point;radius=r;flow=Flow.new();flow.configure(provider.data);flow.prepare(point);return true
func query(point: Vector2,out: Dictionary) -> bool:
 out.clear()
 if field==null or not field.content_valid:out.status="NOT_READY";return false
 if not field.can_move(point,radius):out.status="INVALID_QUERY";return false
 var direction: Vector2=flow.direction(point)
 out.status="OK" if direction!=Vector2.ZERO or point.distance_squared_to(target)<1 else "UNREACHABLE"
 out.direction=direction;out.waypoint=point+direction*40;out.arrived=point.distance_squared_to(target)<1
 return out.status=="OK"
func node_count() -> int:return 40000
