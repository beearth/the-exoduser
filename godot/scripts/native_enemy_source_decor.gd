extends Node2D
## Snapshot53758-53861, read-only shield/type decorations for admitted natural actors.
## One startup node + fixed fan buffer. Parent redraw drives redraw; no process/RNG owner.
var actor: Node2D
var _g: Dictionary
var _fan:=PackedVector2Array()
var visual_clock_ms: float=-1
var _revive: Node2D
func configure(owner_actor: Node2D) -> void:
 actor=owner_actor
 var source: Node=actor.world.get_parent().get("source_state")
 if is_instance_valid(source):_g=source.read_current_g()
 _revive=preload("res://scripts/native_source_revive_view.gd").new();add_child(_revive);_revive.configure(actor.world.get_parent())
 _fan.resize(34)
 actor.draw.connect(queue_redraw)
func _ink(hex: String,alpha: float=1.0) -> Color:
 return Color(Color(hex),clampf(alpha,0,1))
func disk(r: float,hex: String,alpha: float) -> void:
 draw_circle(Vector2.ZERO,r,_ink(hex,alpha))
func arc(r: float,start: float,end: float,hex: String,alpha: float,width: float) -> void:
 draw_arc(Vector2.ZERO,r,start,end,48,_ink(hex,alpha),width,true)
func _draw() -> void:
 if not is_instance_valid(actor):return
 _revive.visual_clock_ms=visual_clock_ms;_revive.observe(actor.data.native_final,maxi(0,actor.source_order))
 if not actor.alive:return
 if float(_g.get("hitStop",0))>0 or not is_instance_valid(actor.player) or actor.global_position.distance_squared_to(actor.player.global_position)>=360000:return
 var e: Dictionary=actor.data.native_final
 var r: float=actor.radius
 var now: float=visual_clock_ms if visual_clock_ms>=0 else float(Time.get_ticks_msec())
 var sa: float=1.0
 if e.get("_cloaked",false):sa=.08+sin(now/300)*.05
 elif float(e.get("reviveIframes",0))>0:sa=maxf(0,.2+sin(now/40)*.5)
 elif actor._stun_ticks>0:sa=.6
 if actor.eShieldMax>0:
  var sh: bool=actor.eShield>0
  var angle: float=float(e.get("shieldAng",0))
  var radius_: float=r+(5 if sh else 4)
  var span: float=1.0 if sh else .8
  var alpha: float=(.4+actor.eShield/actor.eShieldMax*.4)*(.5+sin(now/150)*.15) if sh else 1.0
  arc(radius_,angle-span,angle+span,"44ccff" if sh else "445577",alpha,5 if sh else 3)
  _fan[0]=Vector2.ZERO
  for i in range(33):_fan[i+1]=Vector2.from_angle(angle-span+2*span*i/32)*radius_
  draw_colored_polygon(_fan,_ink("44c8ff" if sh else "3c506e",alpha*.25))
 match actor.etype:
  5:
   if actor.state!="eSelfDestruct":disk(r+6,"ff4400",.3+sin(now/200)*.2)
  8:
   disk(r+5,"ff8800",.15+sin(now/250)*.1);disk(3,"ffcc00",sa)
  9:
   disk(r+7,"aa44cc",.15+sin(now/250)*.12)
   draw_arc(Vector2(0,-1),3,0,TAU,24,_ink("cc66ff",sa*.7),1.5,true)
   draw_line(Vector2(0,2),Vector2(0,5),_ink("cc66ff",sa*.7),1.5,true)
  10:disk(r+(4 if e.get("_cloaked",false) else 3),"111111" if e.get("_cloaked",false) else "222222",.12+sin(now/150)*.06 if e.get("_cloaked",false) else .2)
  11:disk(r+6,"8b3a3a",.2+sin(now/300)*.1)
  12:disk(r+(5 if e.get("_enraged",false) else 4),"ff0000" if e.get("_enraged",false) else "5a5a5a",.3+sin(now/100)*.2 if e.get("_enraged",false) else .15)
  15:
   draw_line(Vector2(-r*.5,-r*.3),Vector2(r*.2,r*.5),_ink("7b5b3b",.4),1,true)
   draw_line(Vector2(r*.4,-r*.4),Vector2(-r*.1,r*.3),_ink("7b5b3b",.4),1,true)
  18:
   disk(r+5,"660022",.2+sin(now/200)*.1);arc(r+3,now/300,now/300+PI*1.2,"ff2266",sa*.6,1.5)
  19:
   disk(r+10,"4a1a1a",.15);arc(r+5,0,TAU,"776655",sa*.5,3)
 if actor.etype>=20 and actor.etype<=29:
  disk(r+5,"88ccff",.15+sin(now/250)*.08)
  for i in 2:
   var angle: float=now/200+i*3.14+actor.etype
   var radius_: float=r+6+sin(now/150+i)*3
   draw_rect(Rect2(Vector2.from_angle(angle)*radius_-Vector2.ONE,Vector2(2,2)),_ink("cceeff",.4))
 if actor.etype==25:disk(r+8,"77ddff",.12)
 if actor.etype==28:arc(r+12,now/300,now/300+PI*1.5,"6699bb",.2+sin(now/200)*.1,3)
 if actor.etype==29:
  arc(r+15,now/200,now/200+PI*1.6,"4455aa",.25+sin(now/150)*.12,3)
  arc(r+10,-now/250,-now/250+PI*1.2,"88ccff",.25+sin(now/150)*.12,2)
