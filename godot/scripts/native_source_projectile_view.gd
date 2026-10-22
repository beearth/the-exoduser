extends RefCounted
## Display-only snapshot23956/24047/24307/54052-54298. No packet/class/motion writes.
const MOUTH=preload("res://assets/enemy/proj_phys_mouth.png")
const WATER=preload("res://assets/vfx/water_blue_projectile_sheet.png")
const COMET=preload("res://assets/vfx/proj_bolt_comet.png")
const TINTS=[COMET,preload("res://assets/boss_parity/comet_tints/1.res"),preload("res://assets/boss_parity/comet_tints/2.res"),preload("res://assets/boss_parity/comet_tints/3.res"),preload("res://assets/boss_parity/comet_tints/4.res"),preload("res://assets/boss_parity/comet_tints/5.res"),preload("res://assets/boss_parity/comet_tints/6.res")]
const COLORS=[Color("bbbbbb"),Color("ff5522"),Color("3388ff"),Color("9933cc"),Color("ffee00"),Color("ff88cc"),Color("88aa44")]
const RAINBOW=[Color("ff2244"),Color("ff8800"),Color("ffee00"),Color("00ff66"),Color("00ccff"),Color("8855ff"),Color("ff44cc")]
static func physical(p: Dictionary) -> bool:
 if p.has("parryClass"):return p.parryClass=="physical"
 if p.get("blackBean",false) or p.get("blueBean",false) or p.get("gbBean",false) or p.get("waterBean",false) or p.get("fireMagic",false) or p.get("fbEnergy",false) or p.get("fdEnergy",false):return false
 if p.get("friendly",false) or p.get("noParry",false) or p.get("bomb",false) or p.get("mine",false) or p.get("trap",false) or p.get("web",false) or p.get("poisonZone",false) or p.get("iceZone",false) or p.get("blizzard",false) or p.get("dimRift",false) or p.get("elemBall",false):return false
 return p.get("titanEye",false) or p.get("bwBean",false) or int(p.get("el",0))==0
static func disk(c: Node2D,at: Vector2,r: float,col: Color,alpha: float) -> void:
 c.draw_circle(at,r,Color(col,clampf(alpha,0,1)),true,-1,true)
static func render(c: Node2D,p: Dictionary,now: float,frame: int,phase: Vector2) -> void:
 var phys: bool=physical(p)
 var multi: float=2.0 if phys and not p.get("friendly",false) else 1.0
 var sz: float=float(p.get("sz",1))
 var sc: float=clampf((sz if sz!=0 else 1)*1.5,1.2,4)*.7*multi
 var el: int=clampi(int(p.get("el",0)),0,6)
 var v:=Vector2(float(p.get("vx",0)),float(p.get("vy",0)))
 var fa: float=minf(1,float(p.get("life",0))/maxf(1,float(p.get("ml",60)))) if p.get("mine",false) or p.get("bomb",false) else 1.0
 var col: Color=COLORS[el]
 var special: bool=p.get("redBean",false) or p.get("blackBean",false) or p.get("blueBean",false) or p.get("bwBean",false) or p.get("gbBean",false) or p.get("waterBean",false)
 if not p.get("_eyeSkin",false) and not p.get("_druidPoison",false) and not p.get("waterBean",false) and not p.get("fbEnergy",false) and not p.get("fdEnergy",false) and not p.get("elemBall",false):
  var glow: Color=Color("dce7f0") if p.get("redBean",false) and phys else (Color("ff00ff") if p.get("blackBean",false) else (Color("00ccff") if p.get("blueBean",false) else (Color("ff2200") if p.get("redBean",false) else col)))
  var pulse: float=.7+sin(now/200+phase.x)*.3
  disk(c,Vector2.ZERO,12 if special else 6,glow,(.35 if special else .08)*pulse)
  if special:disk(c,Vector2.ZERO,30,glow,.12*pulse)
 if p.get("blackBean",false) or p.get("blueBean",false):
  rainbow(c,p,now,phase,fa,sc);return
 if p.get("gbBean",false):
  var r: float=4.2*sc;var pulse: float=.82+sin(now*.012+phase.x*.07)*.18
  disk(c,Vector2.ZERO,r*4.2,Color("4b167d"),fa*.13*pulse);disk(c,Vector2.ZERO,r*2.35,Color("8f36d8"),fa*.28*pulse)
  disk(c,Vector2.ZERO,r,Color("6d21ad"),fa*.72);disk(c,Vector2(-r*.22,-r*.28),r*.34,Color("c990ff"),fa*.92)
  c.draw_line(-v.normalized()*r*.2,-v*5,Color(Color("a84fff"),fa*.34),maxf(1,r*.55),true);return
 if p.get("waterBean",false):
  var cell: Vector2=WATER.get_size()/Vector2(4,2)
  var f: int=int(fposmod(now*.012+phase.x*.04+phase.y*.025,8))
  var row: int=0 if f<4 else 1
  var crop_h: float=minf(cell.y-1,cell.y*.255)
  var y: float=minf(row*cell.y+cell.y*(.10 if row else .675),row*cell.y+cell.y-crop_h)
  var w: float=30*sc;var h: float=16*sc
  c.draw_set_transform(Vector2.ZERO,v.angle())
  c.draw_texture_rect_region(WATER,Rect2(-w*.54,-h*.5,w,h),Rect2((f%4)*cell.x,y,cell.x,crop_h),Color(1,1,1,fa))
  c.draw_set_transform(Vector2.ZERO);return
 if p.get("bomb",false):
  var pulse: float=.7+sin(now*.02+phase.x)*.3
  disk(c,Vector2.ZERO,5,col,fa*.9*pulse);disk(c,Vector2.ZERO,2,Color.WHITE,fa*.5)
  c.draw_arc(Vector2.ZERO,8+pulse*3,0,TAU,48,Color(col,fa*.15),1,true);return
 var angle: float=v.angle()
 if phys or (el==0 and not special):
  var h: float=(22.05*.55 if phys else 20*1.19)*sc
  var cell: Vector2=Vector2(768,384)
  var f: int=posmod((frame>>2)+int(phase.x*.03),8)
  c.draw_set_transform(Vector2.ZERO,angle)
  c.draw_texture_rect_region(MOUTH,Rect2(-h,-h*.5,h*2,h),Rect2(f*cell.x,0,cell.x,cell.y),Color(1,1,1,fa))
  c.draw_set_transform(Vector2.ZERO);return
 var tex: Texture2D=TINTS[el]
 var length_: float=(18 if p.get("fast",false) else 20)*clampf(sz*1.5,1.2,4)*.7*2.2*(.65 if el==1 else 1.0)
 var cell: Vector2=Vector2(tex.get_width()/8.0,tex.get_height())
 var f: int=posmod(int(p.get("_sprFr",0)),8)
 var h: float=length_*cell.y/cell.x
 c.draw_set_transform(Vector2.ZERO,angle)
 c.draw_texture_rect_region(tex,Rect2(-length_*.62,-h*.5,length_,h),Rect2(f*cell.x,0,cell.x,cell.y),Color(1,1,1,fa))
 c.draw_set_transform(Vector2.ZERO)
static func rainbow(c: Node2D,p: Dictionary,now: float,phase: Vector2,fa: float,sc: float) -> void:
 var r: float=3.5*sc
 var pulse: float=.8+sin(now/50+phase.x*.3)*.2
 var flicker: float=1.0 if sin(now/35+phase.y*.2)>.1 else .6
 var index: int=posmod(int((now*.3+phase.x*.5+phase.y*.3)/60),7)
 disk(c,Vector2.ZERO,r*3.5,RAINBOW[index],fa*.12*pulse)
 disk(c,Vector2.ZERO,r*2.2,RAINBOW[(index+1)%7],fa*.2*flicker)
 disk(c,Vector2.ZERO,r,RAINBOW[(index+2)%7],fa*.85*flicker)
 disk(c,Vector2.ZERO,r*.6,RAINBOW[(index+3)%7],fa*.9)
 disk(c,Vector2(-r*.15,-r*.2),r*.3,Color.WHITE,fa*.7*flicker)
 var v:=Vector2(float(p.get("vx",0)),float(p.get("vy",0)))
 c.draw_line(Vector2.ZERO,-v*7,Color(RAINBOW[index],fa*.15),r*1.8,true)
 c.draw_line(Vector2.ZERO,-v*5,Color(RAINBOW[(index+1)%7],fa*.25*flicker),r*1.1,true)
 c.draw_line(Vector2.ZERO,-v*3,Color(RAINBOW[(index+2)%7],fa*.35),r*.5,true)
 for i in 4:
  var angle: float=now/25+i*PI/2+phase.x*.2
  var radius_: float=r*1.5+sin(now/30+i*3)*r*.5
  c.draw_rect(Rect2(Vector2.from_angle(angle)*radius_-Vector2.ONE,Vector2(2,2)),Color(RAINBOW[(index+i)%7],fa*(.2+sin(now/40+i)*.1)))
