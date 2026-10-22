extends "res://scripts/maps/map11/field_provider.gd"
## Web game.html 30042-30050, 31682-31712. Exact exported tile/ellipse predicates.
var data: Dictionary
func compile(_recipe: Resource) -> bool:
 data=JSON.parse_string(FileAccess.get_file_as_string("res://data/map.json"))
 instance_id="map11.field";revision=1;content_hash=FileAccess.get_sha256("res://data/map.json")
 content_valid=data.get("tiles",[]).size()==40000
 _bounds=Rect2(0,0,8000,8000)
 return content_valid
func _hill_ramp_at(tile: Vector2) -> float:
 var h: Dictionary=data.hill
 if tile.x<h.rampX0 or tile.x>h.rampX1:return -1
 var t: float=(tile.x-h.rampX0)/(h.rampX1-h.rampX0)
 return t if absf(tile.y-h.rampY)<=lerpf(h.rampHalf0,h.rampHalf1,t) else -1
func blocked(pos: Vector2) -> bool:
 if not pos.is_finite() or pos.x<0 or pos.y<0 or pos.x>=8000 or pos.y>=8000:return true
 # Source 18416,29543: system gate object, radius (250*.4)=100 at (4020,160).
 if pos.distance_squared_to(Vector2(4020,160))<10000:return true
 var cell:=Vector2i(floori(pos.x/40),floori(pos.y/40))
 if int(data.tiles[cell.y*200+cell.x])==1:return true
 var h: Dictionary=data.hill
 var tile:=pos/40
 if _hill_ramp_at(tile)<0:
  var q: Vector2=(tile-Vector2(h.cx,h.cy))/Vector2(h.rx,h.ry)
  if q.length()>=h.inner and q.length()<=h.outer:return true
 for prop in data.prop_colliders:
  var q: Vector2=(pos-Vector2(prop.position[0],prop.position[1]))/Vector2(prop.radii[0],prop.radii[1])
  if q.length_squared()<1:return true
 return false
func can_move(p: Vector2,r: float) -> bool:
 return content_valid and not _retired and r>=0 and not blocked(p+Vector2(-r,-r)) and not blocked(p+Vector2(r,-r)) and not blocked(p+Vector2(-r,r)) and not blocked(p+Vector2(r,r))
func region_at(p: Vector2) -> int:
 return (0 if p.y<4000 else 2)+(0 if p.x<4000 else 1)
func line_of_sight(a: Vector2,b: Vector2) -> bool:
 var steps:=maxi(1,int(a.distance_to(b)/16))
 for i in range(1,steps):
  if blocked(a.lerp(b,float(i)/steps)):return false
 return true
func sweep_fraction(a: Vector2,b: Vector2,r: float,_los: bool=false) -> float:
 var steps:=maxi(1,int(ceil(a.distance_to(b)/4)))
 for i in range(steps+1):
  if not can_move(a.lerp(b,float(i)/steps),r):return maxf(0,float(i-1)/steps)
 return 1
func describe() -> Dictionary:
 var result: Dictionary=super.describe()
 result.geometry="source_tile_occupancy + hill_band + source_prop_ellipses"
 result.capabilities.polygon_boundary=false;result.capabilities.tile_boundary=true
 return result
