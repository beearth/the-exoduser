extends Node
## Presentation only: no gate/clear/actor state writes.
const ARENA_ZOOM=0.8
const TRANSITION_SECONDS=1.0
const ARENA_CENTER_WEIGHT=0.5
var camera: Camera2D
var _empty_enemy: Dictionary={}
var boss: Node
var player: Node2D
var center:=Vector2.ZERO
var original_zoom:=Vector2.ONE
var blend:=0.0
var _from:=0.0
var _target:=0.0
var _elapsed:=1.0
func configure(view: Camera2D,actor: Node2D,arena_center: Vector2,boss_reader: Node=null) -> void:
 camera=view;player=actor;center=arena_center;boss=boss_reader
 original_zoom=camera.zoom
 process_physics_priority=100
func set_arena(enabled: bool) -> void:
 var next:=1.0 if enabled else 0.0
 if next==_target:return
 _from=blend;_target=next;_elapsed=0
func _physics_process(delta: float) -> void:
 if not is_instance_valid(camera) or not is_instance_valid(player):return
 _elapsed=minf(TRANSITION_SECONDS,_elapsed+delta)
 var t:=_elapsed/TRANSITION_SECONDS
 blend=lerpf(_from,_target,t*t*(3.0-2.0*t))
 # Same source-space framing as game.html _druidFinaleFrame (1920x1080).
 # Read cached boss state only; never scale actors, collision or telegraphs.
 var at: Vector2=center
 var radius:=44.0
 var enemy: Dictionary=_empty_enemy
 if is_instance_valid(boss):
  enemy=boss.get("_enemy")
  if not enemy.is_empty():
   at=Vector2(enemy.get("x",center.x),enemy.get("y",center.y));radius=enemy.get("r",44.0)
 var zoom:=ARENA_ZOOM
 var target: Vector2=player.global_position.lerp(center,ARENA_CENTER_WEIGHT)
 if player.global_position.distance_to(at)<=1100.0:
  var size_: Vector2=camera.get_viewport_rect().size
  var height:=radius*14.1
  var half_width:=maxf(radius*9.3*.5,height*.56)
  var base:=at.y-6.0
  var left:=minf(at.x-half_width,player.global_position.x-100.0)
  var right:=maxf(at.x+half_width,player.global_position.x+100.0)
  var top:=minf(base-height*.86-24.0,player.global_position.y-100.0)
  var bottom:=maxf(maxf(base+height*.14,at.y+radius+120.0),player.global_position.y+100.0)
  if enemy.get("_druidTargetLocked",false) and (enemy.get("s","")=="bossDruidUnder" or enemy.get("s","")=="bossDruidErupt"):
   var dive_radius:=radius+140.0
   left=minf(left,float(enemy.get("_diveTx",at.x))-dive_radius)
   right=maxf(right,float(enemy.get("_diveTx",at.x))+dive_radius)
   top=minf(top,float(enemy.get("_diveTy",at.y))-dive_radius)
   bottom=maxf(bottom,float(enemy.get("_diveTy",at.y))+dive_radius)
  var pad_top:=minf(100.0,size_.y*.14)
  var pad_bottom:=minf(155.0,size_.y*.22)
  var pad_x:=minf(100.0,size_.x*.08)
  zoom=maxf(.3,minf(ARENA_ZOOM,minf((size_.x-pad_x*2.0)/(right-left),(size_.y-pad_top-pad_bottom)/(bottom-top))))
  target=Vector2((left+right)*.5,(top+bottom)*.5+(pad_bottom-pad_top)/(2.0*zoom))-camera.offset
 camera.zoom=original_zoom.lerp(Vector2.ONE*zoom,blend)
 camera.global_position=player.global_position.lerp(target,blend)
