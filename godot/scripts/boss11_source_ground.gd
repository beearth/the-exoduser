extends Node2D
## Snapshot 10879–10889,57480–57500,57529–57532,57994–57999.
## Source green roots, no custom warning UI/material or combat state writes.
const RING=preload("res://assets/boss_parity/corruption_ring.svg")
const ORB=preload("res://assets/boss_parity/orb.png")
const POOL=preload("res://assets/boss_parity/pool.png")
var state: Dictionary={}
var live:=false
var enemy: Dictionary={}
func observe_enemy(e: Dictionary) -> void:
 enemy=e
func refresh(g: Dictionary,alive: bool) -> void:
 state=g;live=alive;queue_redraw()
func ring(at: Vector2,r: float,alpha: float,angle: float) -> void:
 if r<=0 or alpha<=0:return
 draw_set_transform(at,angle)
 draw_texture_rect(RING,Rect2(-r,-r,r*2,r*2),false,Color(1,1,1,clampf(alpha,0,1)))
func _draw() -> void:
 if not live:return
 var now: float=Time.get_ticks_msec()
 source_tells()
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
