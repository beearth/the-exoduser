extends "res://scripts/maps/map11/stage_provider.gd"
## Source 30697–30746 room bounds 124x104; user's PARITY-BOSS-01 square layout.
const BOUNDS=Rect2(-2500,-2100,4960,4160)
func _contains_circle(p: Vector2,r: float) -> bool:
 return p.is_finite() and p.x-r>=BOUNDS.position.x and p.y-r>=BOUNDS.position.y and p.x+r<BOUNDS.end.x and p.y+r<BOUNDS.end.y
func _boundary_fraction(a: Vector2,b: Vector2,r: float) -> float:
 var best:=1.0;var d:=b-a
 if d.x>0:best=minf(best,(BOUNDS.end.x-r-a.x)/d.x)
 elif d.x<0:best=minf(best,(BOUNDS.position.x+r-a.x)/d.x)
 if d.y>0:best=minf(best,(BOUNDS.end.y-r-a.y)/d.y)
 elif d.y<0:best=minf(best,(BOUNDS.position.y+r-a.y)/d.y)
 return clampf(best,0,1)
func _boundary_normal(p: Vector2,r: float) -> Vector2:
 var dist:=Vector4(absf(p.x-BOUNDS.position.x-r),absf(p.x-BOUNDS.end.x+r),absf(p.y-BOUNDS.position.y-r),absf(p.y-BOUNDS.end.y+r))
 var least: float=minf(minf(dist.x,dist.y),minf(dist.z,dist.w))
 if least==dist.x:return Vector2.RIGHT
 if least==dist.y:return Vector2.LEFT
 return Vector2.DOWN if least==dist.z else Vector2.UP
func _geometry_fingerprint() -> Variant:return BOUNDS
func region_at(p: Vector2) -> int:
 return 0 if _contains_circle(p,0) else -1
