extends RefCounted
## G61203–61328. WM only; no Player damage/movement/parry writer.
const COMMON=preload("res://scripts/native_demo11_angler_model.gd")
static func initial(at: Vector2,level: float,asleep: bool=true) -> Dictionary:
 var hp: int=COMMON.i32(150+level*45)
 return {"x":at.x,"y":at.y,"homeX":at.x,"homeY":at.y,"r":56,"hp":hp,"mhp":hp,"frame":0,"ft":0,"shotF":-1,"atk":COMMON.i32((16+level*2.5)*1.2),"hitCd":0,"face":0,"phase":"hide","shots":0,"hideT":0 if asleep else 54,"popHit":0,"tpX":at.x,"tpY":at.y,"asleep":1 if asleep else 0}
static func push_bonfire(w: Dictionary,bf: Variant) -> void:
 if not bf is Dictionary or float(bf.get("t",0))<=0:return
 var minimum: float=maxf(0,float(bf.get("r",0)))+75
 var dx: float=w.x-bf.x;var dy: float=w.y-bf.y
 var d2: float=dx*dx+dy*dy
 if d2>=minimum*minimum:return
 var angle: float=atan2(dy,dx) if d2>0 else float(w.get("facing",0))
 w.x=bf.x+cos(angle)*minimum;w.y=bf.y+sin(angle)*minimum
static func lock_destination(w: Dictionary,p: Dictionary,rng: Callable,wall: Callable,bf: Variant) -> void:
 var nx: float=p.x;var ny: float=p.y
 var found:=false
 for i in 28:
  var a: float=rng.call()*TAU
  var radius: float=48+rng.call()*40
  nx=p.x+cos(a)*radius;ny=p.y+sin(a)*radius
  if not wall.call(Vector2(nx,ny)) and distance(nx,ny,p.x,p.y)>36:found=true;break
 if not found:nx=p.x;ny=p.y
 w.x=nx;w.y=ny;push_bonfire(w,bf);w.tpX=w.x;w.tpY=w.y
static func appear(w: Dictionary,p: Dictionary,bf: Variant) -> void:
 w.x=w.get("tpX",w.x);w.y=w.get("tpY",w.y);push_bonfire(w,bf);w.tpX=w.x;w.tpY=w.y
 w.face=1 if p.x<w.x else 0;w.phase="emerge";w.frame=2;w.ft=0;w.shots=0;w.shotF=-1;w.popHit=0
static func fire(w: Dictionary,p: Dictionary) -> Dictionary:
 var a: float=atan2(p.y-w.y,p.x-w.x)
 return {"x":w.x+cos(a)*w.r*0.6,"y":w.y+sin(a)*w.r*0.6,"vx":cos(a)*8,"vy":sin(a)*8,"dmg":COMMON.i32(w.atk*1.5),"el":1,"friendly":false,"life":240,"ml":240,"col":"#ff2233","sz":6.4,"r":12,"titanEye":true,"_typed":true}
static func contact(w: Dictionary,p: Dictionary,c: Dictionary,scale: float,callback: Callable) -> Dictionary:
 if float(w.get("contactCd",0))>0 or p.iframes>0 or p.s=="charge":return {"ready":true}
 # PC owns the remaining guard, hurtP, swept4px displacement and KB28.
 if not callback.is_valid():return {"ready":false,"reason":"PC_contact_owner_required"}
 var result: Variant=callback.call({"kind":"worm_bite","enemy":w.duplicate(true),"player":p.duplicate(true),"scale":scale,"damage":maxi(1,COMMON.i32(w.atk*scale)),"context":c,"source_lines":[61244,61259]})
 if not result is Dictionary or result.get("ack")!=true or not result.get("committed") is bool:return {"ready":false,"reason":"PC_contact_receipt_invalid"}
 if result.committed:w.contactCd=60
 if result.get("player_after") is Dictionary:p.merge(result.player_after,true)
 return {"ready":true}
static func advance(w: Dictionary,p: Dictionary,c: Dictionary,rng: Callable,wall: Callable,callback: Callable=Callable()) -> Dictionary:
 var events: Array=[]
 var bf: Variant=c.get("bonfire")
 push_bonfire(w,bf)
 if w.asleep:
  var hx: float=w.homeX if w.homeX else w.x;var hy: float=w.homeY if w.homeY else w.y
  if distance(p.x,p.y,hx,hy)>1000:return {"ready":true,"events":events}
  w.asleep=0;appear(w,p,bf);events.append({"kind":"appear"});return {"ready":true,"events":events}
 if w.hitCd>0:w.hitCd-=1
 if float(w.get("contactCd",0))>0:w.contactCd-=1
 if not w.get("phase"):w.phase="emerge"
 if p.x<w.x-16:w.face=1
 elif p.x>w.x+16:w.face=0
 if w.phase=="hide":
  if w.hideT>0:w.hideT-=1
  if w.hideT==54:lock_destination(w,p,rng,wall,bf);w.x=w.tpX;w.y=w.tpY
  if w.hideT>54:return {"ready":true,"events":events}
  if w.get("tpX")==null:lock_destination(w,p,rng,wall,bf);w.x=w.tpX;w.y=w.tpY
  w.frame=0 if w.hideT>27 else 1
  if w.hideT<=0:appear(w,p,bf);events.append({"kind":"appear"})
  return {"ready":true,"events":events}
 w.ft+=1
 var step: int=36 if w.phase=="shoot" else 7
 if w.ft>=step:
  w.ft=0
  if w.phase=="emerge":
   w.frame+=1
   if w.frame>=5:w.phase="shoot";w.frame=5;w.shots=0;w.shotF=-1
  elif w.phase=="shoot":
   if w.shots>=2 and w.frame==7:w.phase="retreat";w.frame=8
   else:
    w.frame+=1
    if w.frame>7:w.frame=4
  elif w.phase=="retreat":
   w.frame+=1
   if w.frame>11:
    lock_destination(w,p,rng,wall,bf);w.x=w.tpX;w.y=w.tpY;w.phase="hide";w.hideT=108;w.frame=0;w.ft=0;w.shots=0;w.shotF=-1;w.popHit=0;events.append({"kind":"vanish"})
 var out: bool=w.phase=="shoot" or (w.phase=="emerge" and w.frame>=4) or (w.phase=="retreat" and w.frame<=8)
 var d: float=distance(w.x,w.y,p.x,p.y)
 if w.phase=="emerge" and w.frame>=4 and not w.popHit:
  w.popHit=1
  if d<w.r+p.r+28 and p.iframes<=0 and p.s!="charge":
   var receipt: Dictionary=contact(w,p,c,0.45,callback)
   if not receipt.ready:return receipt
   events.append({"kind":"pop_impact"})
 if w.phase=="shoot" and w.frame==5 and w.shotF!=5:
  w.shotF=5
  if can_fire(w,c):events.append({"kind":"shot","props":fire(w,p)})
  w.shots+=1
 if w.frame!=5:w.shotF=-1
 if out and d<w.r+18 and p.iframes<=0 and p.s!="charge":
  var receipt: Dictionary=contact(w,p,c,0.5,callback)
  if not receipt.ready:return receipt
 return {"ready":true,"events":events}
static func can_hit(w: Dictionary) -> bool:return w.hp>0 and not (w.phase=="hide" and float(w.get("hideT",0))>54)
static func apply_hit(w: Dictionary,damage: float) -> bool:
 if float(w.get("hitCd",0))>0:return false
 w.hp-=maxi(1,COMMON.i32(damage));w.hitCd=8
 return true

static func can_fire(w: Dictionary,c: Dictionary) -> bool:
 if not c.get("camera") is Vector2:return bool(c.get("can_shoot",false))
 return absf(w.x-c.camera.x)<=maxf(0,c.viewport.x/2-64) and absf(w.y-c.camera.y)<=maxf(0,c.viewport.y/2-64)

static func distance(ax: float,ay: float,bx: float,by: float) -> float:
 return sqrt((ax-bx)*(ax-bx)+(ay-by)*(ay-by))
