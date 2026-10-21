extends Node2D
## game.html:23698 _drawProcArrow, 59492 normalBow fallback; same live pProjs.
var TIP=PackedVector2Array([Vector2(12.87,0),Vector2(3.465,-3.5),Vector2(3.465,3.5)])
var LIGHT=PackedVector2Array([Vector2(11.88,0),Vector2(4.455,-1.5),Vector2(4.455,0)])
var FIN_A=PackedVector2Array([Vector2(-6.93,0),Vector2(-11.385,-3),Vector2(-4.95,0)])
var FIN_B=PackedVector2Array([Vector2(-6.93,0),Vector2(-11.385,3),Vector2(-4.95,0)])
const COLORS=[Color("bbbbbb"),Color("ff6644"),Color("77ddff"),Color("aa77ee"),Color("ffdd55"),Color("eeeebb"),Color("88bb66")]
var main: Node
func _draw() -> void:
 if not is_instance_valid(main):return
 var packets: Array=main.world.read_native_player_projectiles(main)
 for packet in packets:
  var f: Dictionary=packet.fields
  if f.get("normalBow")!=true:continue
  var at:=Vector2(f.x,f.y)
  var velocity:=Vector2(f.vx,f.vy)
  var fade: float=minf(1,1-float(f.dist)/maxf(1,float(f.maxDist))*.3)
  var color: Color=COLORS[clampi(int(f.el),0,6)]
  color.a=fade*.15
  draw_line(at,at-velocity*3,color,1.5,true)
  draw_set_transform(at,velocity.angle())
  draw_rect(Rect2(-8.91,-1,15.84,2),Color(.5333,.4,.2667,fade*.7))
  color.a=fade*.9;draw_colored_polygon(TIP,color)
  draw_colored_polygon(LIGHT,Color(1,1,1,fade*.45))
  color.a=fade*.5;draw_colored_polygon(FIN_A,color);draw_colored_polygon(FIN_B,color)
  draw_set_transform(Vector2.ZERO)
