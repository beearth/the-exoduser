extends Node2D
## Snapshot 10879–10889,57480–57500,57529–57532,57994–57999.
## Source green roots, no custom warning UI/material or combat state writes.
const RING=preload("res://assets/boss_parity/corruption_ring.svg")
const ORB=preload("res://assets/boss_parity/orb.png")
const POOL=preload("res://assets/boss_parity/pool.png")
var state: Dictionary={}
var visual_clock_ms: float=-1
var player_radius:=14.0
var _quad:=PackedVector2Array([Vector2.ZERO,Vector2.ZERO,Vector2.ZERO,Vector2.ZERO])
var _triangle:=PackedVector2Array([Vector2.ZERO,Vector2.ZERO,Vector2.ZERO])
var live:=false
var enemy: Dictionary={}
var _last_fx_color: String=""
var _fx_color:=Color.WHITE
func observe_enemy(e: Dictionary) -> void:
 enemy=e
 var color_key: String=e.get("col","#bbbbbb")
 if color_key!=_last_fx_color:
  _last_fx_color=color_key;_fx_color=Color(color_key)
func refresh(g: Dictionary,alive: bool) -> void:
 state=g;live=alive;queue_redraw()
func ring(at: Vector2,r: float,alpha: float,angle: float) -> void:
 if r<=0 or alpha<=0:return
 draw_set_transform(at,angle)
 draw_texture_rect(RING,Rect2(-r,-r,r*2,r*2),false,Color(1,1,1,clampf(alpha,0,1)))
# Source WebGPU proxy 5569–5570 / 6081–6083. Thin large rings have soft
# normalized-UV edges; a native hard arc would be much brighter than the web.
const FX_SHADER="""
shader_type canvas_item;
uniform vec4 tint : source_color;
uniform float inner=-1.0;
void fragment(){
 float d=length(UV-vec2(.5));
 if(d>.5||(inner>=0.0&&d<inner))discard;
 float a=smoothstep(.5,.47,d);
 if(inner>=0.0)a*=smoothstep(inner,inner+.02,d);
 COLOR=vec4(tint.rgb,tint.a*a);
}
"""
var _fx_circles: Array[Sprite2D]=[]
var _fx_used:=0
func _ready() -> void:
 var gradient:=Gradient.new();gradient.colors=PackedColorArray([Color.WHITE,Color.WHITE])
 var white:=GradientTexture2D.new();white.gradient=gradient;white.width=2;white.height=2
 var shader_:=Shader.new();shader_.code=FX_SHADER
 for i in 8:
  var sprite:=Sprite2D.new();sprite.texture=white;sprite.physics_interpolation_mode=Node.PHYSICS_INTERPOLATION_MODE_OFF
  var mat:=ShaderMaterial.new();mat.shader=shader_;sprite.material=mat
  add_child(sprite);sprite.hide();_fx_circles.append(sprite)
func fx_circle(at: Vector2,r: float,tint: Color,width: float=0) -> void:
 if _fx_used>=_fx_circles.size():return
 var sprite: Sprite2D=_fx_circles[_fx_used];_fx_used+=1
 sprite.position=at;sprite.scale=Vector2.ONE*(r+width);sprite.show()
 sprite.material.set_shader_parameter("tint",tint)
 sprite.material.set_shader_parameter("inner",.5-width/(r*2+width) if width>0 else -1.0)
var draw_max_us:=0
func _draw() -> void:
 var started:=Time.get_ticks_usec()
 _fx_used=0
 _draw_source()
 for i in range(_fx_used,_fx_circles.size()):_fx_circles[i].hide()
 draw_max_us=maxi(draw_max_us,Time.get_ticks_usec()-started)
func _draw_source() -> void:
 if not live:return
 var now: float=visual_clock_ms if visual_clock_ms>=0 else float(Time.get_ticks_msec())
 source_tells()
 source_grab_charge(now)
 draw_set_transform(Vector2.ZERO)
 for o in state.get("_druidOrbs",[]):
  var frame: int=int(float(o.t)/60*42.857142857142854)%24
  var cell: Vector2=ORB.get_size()/Vector2(6,4)
  var r: float=o.r*2.4
  draw_texture_rect_region(ORB,Rect2(o.x-r,o.y-r,r*2,r*2),Rect2(Vector2(frame%6,frame/6)*cell,cell))
 if state.get("_chaseAoes") is Array:
  for chase in state._chaseAoes:
   if not chase.get("zones") is Array:continue
   var zi:=0
   for z in chase.zones:
    if z.get("druid",false):
     if z.get("hit",false):
      var p: float=float(z.get("explT",0))/maxf(1,z.get("explMax",1))
      ring(Vector2(z.x,z.y),z.r*(1+p*.25),(1-p)*.68,zi*.67)
     else:
      var p: float=minf(1,float(z.t)/maxf(1,z.delay));var pulse: float=.78+sin(now*.018+zi)*.22
      ring(Vector2(z.x,z.y),z.r,p*(.55+.12*pulse),zi*.67)
    zi+=1
 # Source registered 6x4/24fps loop, pool.t/60, R=r*1.12.
 if state.get("_poisonPools") is Array:
  var i:=0
  for p in state._poisonPools:
   var fade: float=(1-(float(p.t)-p.maxT*.8)/maxf(1,p.maxT*.2)) if p.t>p.maxT*.8 else minf(1,float(p.t)*5/maxf(1,p.maxT))
   pool(p,fade*.68);i+=1
 if state.get("_lavaPools") is Array:
  var i:=0
  for p in state._lavaPools:
   var t: float=p.t;var warn: float=p.warnT;var end: float=p.maxT
   var alpha: float=t/maxf(1,warn)*.42 if t<warn else ((1-(t-end*.8)/maxf(1,end*.2))*.65 if t>end*.8 else .65)
   pool(p,alpha)
   i+=1

func pool(p: Dictionary,alpha: float) -> void:
 var frame: int=int(float(p.t)/60*24)%24;var cell: Vector2=POOL.get_size()/Vector2(6,4);var r: float=p.r*1.12
 draw_set_transform(Vector2(p.x,p.y))
 draw_texture_rect_region(POOL,Rect2(-r,-r,r*2,r*2),Rect2(Vector2(frame%6,frame/6)*cell,cell),Color(1,1,1,alpha))
 draw_arc(Vector2.ZERO,p.r,0,TAU,96,Color(.663,.843,.416,alpha*.55),1.2,true)

# Exact denominators are authored source constants, never latched observed durations.
func source_tells() -> void:
 if not enemy.get("alive",false):return
 var s: String=enemy.get("s","")
 var t: float=enemy.get("st2",0)
 var stage: float=state.get("stage",0)
 var at:=Vector2(enemy.get("x",0),enemy.get("y",0))
 var r:=0.0;var p:=0.0;var tint:=Color.WHITE
 match s:
  "bossSlamWind":r=1000+stage*30+float(enemy.get("_bossPhase",0))*80;p=1-t/30;tint=Color("ff4400")
  "bossSpinWind":r=500+stage*15;p=1-t/25;tint=Color("ff6644")
  "bossShockWind":r=1000+stage*50;p=1-t/30;tint=Color("44ccff")
 if r<=0:return
 draw_set_transform(at)
 if p>0:
  var fill:=tint;fill.a=p*(.1 if s=="bossShockWind" else .12)
  draw_circle(Vector2.ZERO,r*p,fill)
  var stroke:=tint;stroke.a=p*.4
  # Source dash [8,6], width3; bound by authored circumference.
  var d:=0.0
  while d<TAU*r:
   draw_arc(Vector2.ZERO,r,d/r,minf(d+8,TAU*r)/r,3,stroke,3,true)
   d+=14

# Snapshot 52966–52984,53119–53140,53223–53247. Read-only Canvas2D paths.
func source_grab_charge(now: float) -> void:
 if not enemy.get("alive",false):return
 var s: String=enemy.get("s","")
 var r: float=enemy.get("r",44)
 var at:=Vector2(enemy.get("x",0),enemy.get("y",0))
 var facing: float=enemy.get("facing",0)
 var t: float=enemy.get("st2",0)
 draw_set_transform(at)
 if s=="bossGrabWind":
  var p:=clampf(1-t/maxf(1,enemy.get("_grabWindMax",40)),0,1)
  var gr:=r+player_radius+200
  var ga: float=enemy.get("_grabAng",facing)
  fx_circle(at,gr,Color("bf37dc")*Color(1,1,1,.08+p*.1))
  fx_circle(at,gr,Color("ffa3ef")*Color(1,1,1,.7+p*.3),4+p*2)
  fx_circle(at,gr*.82,Color("76319a")*Color(1,1,1,.18+p*.28),1.5)
  for side in range(-1,2,2):
   var a:=ga+side*.72
   var center:=Vector2.from_angle(a)*(r+28)
   var start:=a-side*1.35;var end:=a+side*.2
   draw_arc(center,18+p*12,minf(start,end),maxf(start,end),32,Color("ff8be8")*Color(1,1,1,.45+p*.45),3+p*2,true)
 elif s=="bossGrab":
  fx_circle(at,r+20,Color("ff0044")*Color(1,1,1,.3+sin(now/30)*.2))
 elif s=="bossChargeWind":
  var p:=1-t/55
  var direction:=Vector2.from_angle(facing)
  var perp:=Vector2.from_angle(facing+PI/2)
  var length_: float=maxf(get_viewport_rect().size.x,get_viewport_rect().size.y)*1.5
  var width:=50+p*40
  _quad[0]=perp*width;_quad[1]=direction*length_+perp*width
  _quad[2]=direction*length_-perp*width;_quad[3]=-perp*width
  draw_colored_polygon(_quad,Color("ffaa00")*Color(1,1,1,clampf(p*.15,0,1)))
  # Proxy 6148 stores the dash but 6095–6104 draws uninterrupted line quads.
  draw_line(Vector2.ZERO,direction*length_,Color("ffaa00")*Color(1,1,1,clampf(p*.5,0,1)),3,true)
  # The source warning glyph is an existing symbol, drawn from the bundled UI font.
  draw_string(ThemeDB.fallback_font,Vector2(-11,-r-20),"⚠",HORIZONTAL_ALIGNMENT_LEFT,-1,22,Color("ffaa00")*Color(1,1,1,clampf(p*(.6+sin(now*.02)*.3),0,1)))
  fx_circle(at,r+4+p*8,Color(1,1,1,clampf(.3+absf(sin(now/60))*(.4+p*.3),0,1)))
  fx_circle(at,r+12+p*25,Color("ff2200")*Color(1,1,1,clampf(p*.7,0,1)),2+p*4)
  var dl:=40+p*60
  var arrow:=Color("ff4400")*Color(1,1,1,clampf(p*.8,0,1))
  draw_line(direction*r,direction*dl,arrow,3+p*3,true)
  _triangle[0]=direction*(dl+10);_triangle[1]=direction*dl+Vector2.from_angle(facing+2.5)*12;_triangle[2]=direction*dl+Vector2.from_angle(facing-2.5)*12
  draw_colored_polygon(_triangle,arrow)
  if sin(now/80)>0:
   _triangle[0]=Vector2(0,-r-26);_triangle[1]=Vector2(-6,-r-16);_triangle[2]=Vector2(6,-r-16)
   draw_colored_polygon(_triangle,Color("ffcc00")*Color(1,1,1,clampf(.6+p*.4,0,1)))
 elif s=="bossCharge":
  var direction:=Vector2(enemy.get("echDx",0),enemy.get("echDy",0))
  var tint:=_fx_color
  for i in range(1,4):
   tint.a=.15/i
   fx_circle(at-direction*8*i,r,tint)
