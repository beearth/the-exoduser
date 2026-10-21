extends Node2D
## Screen-space presentation; cached marks/player only. No combat writes.
const WARM=Color(1.0,0.74,0.40,0.95)
const INK=Color(0.04,0.02,0.02,0.92)
var marks: Node2D
var player: Node2D
var foot_offset:=Vector2(0,4)
func _process(_delta: float) -> void:queue_redraw()
func arrow(at: Vector2,direction: Vector2) -> void:
 var back:=at-direction*11.0
 var side:=direction.orthogonal()*5.0
 draw_line(back+side,at,INK,6.0,true);draw_line(at,back-side,INK,6.0,true)
 draw_line(back+side,at,WARM,2.0,true);draw_line(at,back-side,WARM,2.0,true)
func _draw() -> void:
 if not is_instance_valid(marks) or not marks.is_visible_in_tree():return
 var size:=get_viewport_rect().size
 var transform:=marks.get_global_transform_with_canvas()
 for i in range(marks.used):
  var mark: Polygon2D=marks.marks[i]
  var at: Vector2=transform*mark.position
  # Conservative bound, also valid for rotated sectors/strips; never implies safety.
  var radius: float=maxf(mark.scale.x,mark.scale.y)*0.98*transform.x.length()
  var extent:=Vector2.ONE*radius
  if mark.color.r>0.9:
   var a:=mark.rotation
   extent=Vector2(absf(cos(a))*mark.scale.x+absf(sin(a))*mark.scale.y,absf(sin(a))*mark.scale.x+absf(cos(a))*mark.scale.y)*0.98*transform.x.length()
  if at.x-extent.x<0:arrow(Vector2(18,clampf(at.y,100,size.y-215)),Vector2.LEFT)
  if at.x+extent.x>size.x:arrow(Vector2(size.x-18,clampf(at.y,100,size.y-215)),Vector2.RIGHT)
  if at.y-extent.y<0:arrow(Vector2(clampf(at.x,48,size.x-48),125),Vector2.UP)
  if at.y+extent.y>size.y-110:arrow(Vector2(clampf(at.x,48,size.x-48),size.y-205),Vector2.DOWN)
 if not is_instance_valid(player) or marks.used==0:return
 var foot: Vector2=player.get_global_transform_with_canvas()*foot_offset
 # Contact ellipse remains above warning fill. Existing actor rim is untouched.
 draw_set_transform(foot,0,Vector2(1,0.42))
 draw_circle(Vector2.ZERO,9,Color(0.02,0.01,0.01,0.85))
 draw_arc(Vector2.ZERO,9,0,TAU,32,Color(1.0,0.89,0.64,0.90),1.8,true)
 draw_set_transform(Vector2.ZERO)
