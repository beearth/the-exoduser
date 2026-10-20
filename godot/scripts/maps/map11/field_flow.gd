extends RefCounted
## Explicit preparation only. Grid/edges/integration lists never built in query.
const CELL: float = 200.0
var _provider: RefCounted
var _radius: float
var _origin: Vector2
var _width: int
var _height: int
var _cells: Dictionary = {}
var _points := PackedVector2Array()
var _edges: Array[PackedInt32Array] = []
var _cost := PackedFloat64Array()
var _next := PackedInt32Array()
var _target: Vector2
var _ready := false
func prepare(provider: RefCounted, target: Vector2, radius: float) -> bool:
	_provider=provider; _radius=radius; _target=target; _ready=false
	if not provider.can_move(target,radius): return false
	var bounds: Rect2=provider.describe().bounds
	_origin=bounds.position; _width=int(ceil(bounds.size.x/CELL))+1; _height=int(ceil(bounds.size.y/CELL))+1
	for y in range(_height):
		for x in range(_width):
			var p: Vector2=_origin+Vector2(x,y)*CELL
			if provider.can_move(p,radius):
				_cells[Vector2i(x,y)]=_points.size(); _points.append(p)
	for cell in _cells:
		var links := PackedInt32Array()
		for dy in range(-1,2):
			for dx in range(-1,2):
				if dx==0 and dy==0: continue
				var other: Vector2i=cell+Vector2i(dx,dy)
				if _cells.has(other) and provider.sweep_fraction(_points[_cells[cell]],_points[_cells[other]],radius)==1:
					links.append(_cells[other])
		_edges.append(links)
	_cost.resize(_points.size()); _cost.fill(INF)
	_next.resize(_points.size()); _next.fill(-1)
	var done := PackedByteArray(); done.resize(_points.size())
	# Seed all directly visible grid points; this is setup, not a tick operation.
	for i in range(_points.size()):
		if provider.sweep_fraction(_points[i],target,radius)==1:
			_cost[i]=_points[i].distance_to(target); _next[i]=-2
	for _iteration in range(_points.size()):
		var best: int=-1; var value: float=INF
		for i in range(_points.size()):
			if done[i]==0 and _cost[i]<value: best=i; value=_cost[i]
		if best<0: break
		done[best]=1
		for neighbor in _edges[best]:
			var candidate: float=value+_points[best].distance_to(_points[neighbor])
			if candidate<_cost[neighbor]: _cost[neighbor]=candidate; _next[neighbor]=best
	_ready=true
	return true
func query(point: Vector2, out: Dictionary) -> bool:
	out.clear()
	if not _ready or not _provider.content_valid or not _provider.is_current(_provider.instance_id,_provider.revision):
		out.status="NOT_READY"; return false
	if not _provider.can_move(point,_radius): out.status="INVALID_QUERY"; return false
	var waypoint: Vector2=_target
	if _provider.sweep_fraction(point,_target,_radius)!=1:
		var cell := Vector2i(roundi((point.x-_origin.x)/CELL),roundi((point.y-_origin.y)/CELL))
		var best: float=INF; var found: bool=false
		for dy in range(-1,2):
			for dx in range(-1,2):
				var key: Vector2i=cell+Vector2i(dx,dy)
				if not _cells.has(key): continue
				var i: int=_cells[key]
				if not is_finite(_cost[i]): continue
				var next_point: Vector2=_target if _next[i]==-2 else _points[_next[i]]
				var score: float=point.distance_to(next_point)+(0.0 if _next[i]==-2 else _cost[_next[i]])
				if score<best and _provider.sweep_fraction(point,next_point,_radius)==1:
					best=score; waypoint=next_point; found=true
		if not found: out.status="UNREACHABLE"; return false
	out.status="OK"; out.waypoint=waypoint; out.direction=point.direction_to(waypoint)
	out.arrived=point.distance_squared_to(_target)<1; return true
func node_count() -> int: return _points.size()
