extends Node2D
## Read-only source renderer: game.html 10763–10774,10905–10976.
const SHEETS={"base8":preload("res://assets/maps/map11/boss_dark_druid_8dir_v3.png"),"attack":preload("res://assets/boss_parity/attack.png"),"walk":preload("res://assets/boss_parity/walk.png"),"beast":preload("res://assets/boss_parity/beast.png"),"transform":preload("res://assets/boss_parity/transform.png"),"dive":preload("res://assets/boss_parity/dive.png"),"emerge":preload("res://assets/boss_parity/emerge.png")}
const DIVE_STATES=["bossDruidDive","bossDruidErupt"]
const BURROW_STATES=["bossTelePrep","bossTeleWarn"]
const EXTRA_ATTACK=["eWindup","bossDruidVolley"]
const WALK_STATES=["eWalk","eChase","eApproach","bossRec"]
const WIDE_SHEETS=["beast","dive","transform"]
var actor: Node
var body: Sprite2D
var _light1: Sprite2D
var _light2: Sprite2D
func configure(reader: Node,_shared: ShaderMaterial=null) -> void:
 actor=reader
 body=Sprite2D.new();body.name="BossSceneBody";body.region_enabled=true;body.centered=false
 add_child(body)
 var add:=CanvasItemMaterial.new();add.blend_mode=CanvasItemMaterial.BLEND_MODE_ADD
 _light1=Sprite2D.new();_light1.material=add;_light1.region_enabled=true;_light1.centered=false;body.add_child(_light1)
 _light2=Sprite2D.new();_light2.material=add;_light2.region_enabled=true;_light2.centered=false;body.add_child(_light2)
 texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;hide()
func _process(_delta: float) -> void:
 render_at(float(Time.get_ticks_msec()))
func render_at(now: float) -> void:
 if not is_instance_valid(actor):hide();return
 var e: Dictionary=actor.get("_enemy")
 if e.is_empty() or not e.get("alive",false) or e.get("s")=="bossDruidUnder":hide();return
 show();global_position=Vector2(e.get("x",0),e.get("y",0));z_as_relative=false;z_index=clampi(int(global_position.y/4),-4096,4095)
 var s: String=e.get("s","");var rem: float=e.get("st2",0)
 var dir: int=posmod(roundi(float(e.get("facing",0))/(PI/4))+6,8)
 var sheet: String="base8";var cols:=4;var rows:=2;var frame: int=dir;var directional:=false
 var wind: bool=s.contains("Wind") and (s.contains("Charge") or s.contains("Jump") or s.contains("Dash"))
 if s in DIVE_STATES:
  sheet="dive";frame=mini(7,int(clampf(1-rem/float(e.get("_diveMax",50)),0,1)*8)) if s=="bossDruidDive" else maxi(0,7-int(clampf(1-rem/float(e.get("_eruptMax",40)),0,1)*8))
 elif s in BURROW_STATES:
  sheet="emerge";var p: float=clampf(1-rem/float(e.get("_telePrepMax",40) if s=="bossTelePrep" else 60),0,1)
  frame=mini(7,int(p*8)) if s=="bossTelePrep" else maxi(0,7-int(p*8))
 elif wind:sheet="transform";cols=8;rows=1;frame=mini(7,int(clampf(1-rem/45,0,1)*8))
 elif s=="bossJump" or s.contains("Charge") or s.contains("charge") or s.contains("Dash") or s.contains("multiDash"):sheet="beast"
 elif (float(e.get("stunned",0))<=0 and (s.contains("Slam") or s.contains("Slash") or s.contains("Sweep") or s.contains("Spin") or s.contains("Wind") or s.contains("Aim") or s.contains("Hold") or s in EXTRA_ATTACK)):
  sheet="attack";rows=8;frame=int(now/150)%4;directional=true
 elif s in WALK_STATES:sheet="walk";rows=8;frame=int(now/150)%4;directional=true
 var tex: Texture2D=SHEETS[sheet];var cell: Vector2=tex.get_size()/Vector2(cols,rows)
 var fc: int=frame if directional else frame%cols;var fr: int=dir if directional else frame/cols
 var region:=Rect2(Vector2(roundf(fc*cell.x),roundf(fr*cell.y)),Vector2(roundf((fc+1)*cell.x)-roundf(fc*cell.x),roundf((fr+1)*cell.y)-roundf(fr*cell.y)))
 var h: float=float(e.get("r",44))*14.1;var w: float=float(e.get("r",44))*9.3
 if sheet=="base8":w=h*region.size.x/region.size.y
 elif sheet in WIDE_SHEETS:w=h*region.size.x/region.size.y*1.12
 body.texture=tex;body.region_rect=region;body.scale=Vector2(w,h)/region.size;body.offset=Vector2(-region.size.x/2,-region.size.y*.86)
 body.position.y=float(e.get("_teleDropY",0))-6+(sin(now*.003)*2 if sheet=="base8" else 0)
 var alpha: float=(.2+sin(now/40)*.5) if e.get("reviveIframes",0)>0 else (.6 if e.get("stunned",0)>0 else 1.0)
 body.modulate.a=maxf(0,alpha)
 _sync_light(_light1,tex,region,sheet!="base8");_sync_light(_light2,tex,region,sheet!="base8")
func _sync_light(light: Sprite2D,tex: Texture2D,region: Rect2,on: bool) -> void:
 light.texture=tex;light.region_rect=region;light.offset=body.offset;light.modulate.a=.42;light.visible=on
