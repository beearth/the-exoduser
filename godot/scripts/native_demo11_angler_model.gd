extends RefCounted
const SHARED=preload("res://scripts/native_fieldboss_common.gd")
## G60973–61141. Source-order field AI; damage/displacement is a PC callback.
const ELEMENTS := [2,1,3,4]
static func i32(value: float) -> int:
 return SHARED.i32(value)
static func make(at: Vector2, level: float, element: int) -> Dictionary:
 var hp: int=i32((1800+(level if level!=0 else 1.0)*350)*7.5)
 return {"x":at.x,"y":at.y,"homeX":at.x,"homeY":at.y,"r":120,"hp":hp,"mhp":hp,"alive":true,"t":0,"frame":0,"atk":i32((20+level*3)*1.2),"hitCd":0,"shotCd":120,"tpCd":0,"tpT":0,"tpMax":54,"tpX":at.x,"tpY":at.y,"hid":1,"burst":0,"burstGap":0,"spawnIn":1,"asleep":1,"enChg":0,"el":element}
static func face(f: Dictionary,p: Dictionary) -> int:
 var row: int=(int(f.t)>>5)&1
 if p.x>=f.x:return 7 if row else 3
 var dy: float=p.y-f.y;var dx: float=absf(p.x-f.x)
 return (2 if dy>dx*0.4 else (1 if dy< -dx*0.4 else 0))+row*4
static func tick(f: Dictionary,p: Dictionary,can_shoot: bool,rng: Callable,interaction: Callable=Callable()) -> Dictionary:
 var events: Array=[]
 var d: float=Vector2(f.x,f.y).distance_to(Vector2(p.x,p.y))
 # Fail before the prefix if a required protected interaction has no PC owner.
 if not interaction.is_valid() and ((not f.hid and d<f.r+p.r+8) or (f.tpT==1 and not f.spawnIn and Vector2(f.tpX,f.tpY).distance_to(Vector2(p.x,p.y))<f.r+110 and p.iframes<=0 and p.s!="charge")):
  return {"ready":false,"reason":"PC_body_or_slam_owner_required","events":events}
 if f.asleep:
  if d>1000:return {"ready":true,"events":events}
  f.asleep=0;f.tpT=54;f.tpMax=54;f.hid=1;f.spawnIn=1;f.tpX=f.x;f.tpY=f.y
  for i in 10:rng.call()
  events.append({"kind":"wake"})
  return {"ready":true,"events":events}
 f.t+=1
 if f.hitCd>0:f.hitCd-=1
 if f.shotCd>0:f.shotCd-=1
 f.frame=face(f,p)
 if not f.hid and d<f.r+p.r+8:
  var receipt: Variant=interaction.call({"kind":"body","enemy":f.duplicate(true),"player":p.duplicate(true),"source_line":61082})
  if not receipt is Dictionary or receipt.get("ack")!=true or not receipt.get("player") is Dictionary:return {"ready":false,"reason":"PC_body_readback_required","events":events}
  p=receipt.player;d=Vector2(f.x,f.y).distance_to(Vector2(p.x,p.y))
 if not can_shoot:f.enChg=0;f.burst=0;f.burstGap=0
 if can_shoot and f.shotCd<=0 and not f.hid and not f.tpT>0 and not f.enChg>0:f.shotCd=180;f.enChg=180
 if f.enChg>0 and not f.hid and not f.tpT>0:
  f.enChg-=1
  if (int(f.t)&1)==0:
   for i in 4:rng.call()
  if f.enChg==0:
   var a: float=atan2(p.y-f.y,p.x-f.x)
   var fr: int=int(f.frame)&7
   var u: float=0.87 if fr==3 or fr==7 else 0.13
   var v: float=0.14 if fr==1 else 0.22
   events.append({"kind":"energy","props":{"x":f.x+(u-0.5)*300,"y":f.y+v*300-150,"vx":cos(a)*10,"vy":sin(a)*10,"dmg":i32(f.atk*2.8),"el":2,"friendly":false,"life":320,"ml":320,"col":"#3388ff","sz":48,"r":20,"elemBall":true,"_typed":true,"_commit":true,"fbEnergy":true}})
   f.burst=3;f.burstGap=18
   if not f.tpCd>0:f.tpCd=600
 if f.burst>0 and not f.hid and not f.tpT>0 and not f.enChg>0:
  if f.burstGap>0:f.burstGap-=1
  else:
   var a: float=atan2(p.y-f.y,p.x-f.x)
   events.append({"kind":"warning","props":{"x":f.x+cos(a)*f.r*0.7,"y":f.y+sin(a)*f.r*0.7,"vx":cos(a)*9,"vy":sin(a)*9,"dmg":i32(f.atk*1.6),"el":1,"friendly":false,"life":260,"ml":260,"col":"#ff2233","sz":6.4,"r":12,"titanEye":true,"_typed":true}})
   f.burst-=1;f.burstGap=24
 if f.tpT>0:
  f.tpT-=1
  if f.tpT==0:
   var spawn: bool=bool(f.spawnIn)
   f.x=f.tpX;f.y=f.tpY;f.hid=0;f.spawnIn=0
   if not spawn and Vector2(f.x,f.y).distance_to(Vector2(p.x,p.y))<f.r+110 and p.iframes<=0 and p.s!="charge":
    var receipt: Variant=interaction.call({"kind":"slam","enemy":f.duplicate(true),"player":p.duplicate(true),"source_line":61121})
    if not receipt is Dictionary or receipt.get("ack")!=true:return {"ready":false,"reason":"PC_slam_readback_required","events":events}
   events.append({"kind":"appear","spawn":spawn})
 elif f.tpCd>0:
  f.tpCd-=1
  if f.tpCd==0:
   if d<2200:
    f.tpX=p.x;f.tpY=p.y;f.tpMax=54;f.tpT=54;f.hid=1
    for i in 10:rng.call()
    events.append({"kind":"vanish"})
   else:f.tpCd=600
 return {"ready":true,"events":events}
