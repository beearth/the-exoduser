extends "res://scripts/native_demo11_boss_projectile.gd"
## G17286–17302/34671/34745/34819–34824. No player contact/HP/parry logic.
func advance_source_motion(sp: float) -> bool:
 if _ended:return false
 motion_calls+=1
 native_frame+=sp
 life_ticks-=sp*0.667
 if life_ticks<=0:
  if life_ticks<=-900:_end("lifetime");return false
  life_ticks=1.0
 var before: Vector2=global_position
 var after: Vector2=before+Vector2(raw.vx,raw.vy)*sp
 distance_travelled+=before.distance_to(after)
 var radius: float=maxf(float(raw.get("r",16)),float(raw.get("sz",48)))
 var step: float=maxf(4,minf(12,radius*0.25))
 var steps: int=maxi(1,int(ceil(before.distance_to(after)/step)))
 var last: Vector2=before
 for i in range(steps+1):
  var point: Vector2=before.lerp(after,float(i)/steps)
  var blocked: bool=world.is_world_blocked(point)
  for k in 8:
   if blocked:break
   blocked=world.is_world_blocked(point+Vector2.from_angle(TAU*k/8.0)*radius)
  if blocked:
   global_position=last;_readback();_end("field_energy_wall");return false
  last=point
 global_position=after;_readback()
 return true
func _readback() -> void:
 raw.x=global_position.x;raw.y=global_position.y;raw.life=life_ticks;raw.dist=distance_travelled
