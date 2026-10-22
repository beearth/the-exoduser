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
var _revive: Node2D
var render_max_us:=0
var _shield_fan:=PackedVector2Array([Vector2.ZERO,Vector2.ZERO,Vector2.ZERO])
var _visual_now:=0.0
func configure(reader: Node,_shared: ShaderMaterial=null) -> void:
 actor=reader
 body=Sprite2D.new();body.name="BossSceneBody";body.region_enabled=true;body.centered=false
 add_child(body)
  # Source 6028: shared WebGPU/WebGL X proxy ignores globalCompositeOperation.
 # The two .42 redraws in 10970-10971 therefore use source-over, not ADD.
 var add:=CanvasItemMaterial.new();add.blend_mode=CanvasItemMaterial.BLEND_MODE_MIX
 _light1=Sprite2D.new();_light1.material=add;_light1.region_enabled=true;_light1.centered=false;body.add_child(_light1)
 _light2=Sprite2D.new();_light2.material=add;_light2.region_enabled=true;_light2.centered=false;body.add_child(_light2)
 _revive=preload("res://scripts/native_source_revive_view.gd").new();add_child(_revive);_revive.configure(reader.get_parent().get_parent())
 texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;hide()
 _warm_resources()
func _process(_delta: float) -> void:
 var started:=Time.get_ticks_usec()
 render_at(float(Time.get_ticks_msec()))
 render_max_us=maxi(render_max_us,Time.get_ticks_usec()-started)
func render_at(now: float) -> void:
 _visual_now=now;queue_redraw()
 if not is_instance_valid(actor):hide();return
 var e: Dictionary=actor.get("_enemy")
 _revive.visual_clock_ms=now;_revive.observe(e)
 if e.is_empty():hide();return
 if not e.get("alive",false):
  visible=float(e.get("_reviveTimer",0))>0;body.hide();return
 if e.get("s")=="bossDruidUnder":hide();return
 body.show()
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
 body.position=Vector2(0,float(e.get("_teleDropY",0))-6+(sin(now*.003)*2 if sheet=="base8" else 0))
 var display: Rect2=preload("res://scripts/native_source_canvas_labels.gd").snap(self,Rect2(body.position+body.offset*body.scale,Vector2(w,h)))
 body.scale=display.size/region.size;body.position=display.position-body.offset*body.scale
 var alpha: float=(.2+sin(now/40)*.5) if e.get("reviveIframes",0)>0 else (.6 if e.get("stunned",0)>0 else 1.0)
 body.modulate.a=maxf(0,alpha)
 _sync_light(_light1,tex,region,sheet!="base8");_sync_light(_light2,tex,region,sheet!="base8")
func _sync_light(light: Sprite2D,tex: Texture2D,region: Rect2,on: bool) -> void:
 light.texture=tex;light.region_rect=region;light.offset=body.offset;light.modulate.a=.42;light.visible=on

# Upload every pattern sheet/material before the arena's first live pattern.
# A real offscreen draw is required: transparent/hidden sprites are culled.
func _warm_resources() -> void:
 var view:=SubViewport.new();view.name="BossResourceWarmup";view.size=Vector2i(32,32)
 view.disable_3d=true;view.transparent_bg=true;view.render_target_update_mode=SubViewport.UPDATE_ONCE
 add_child(view)
 var x:=0.0
 for tex in SHEETS.values():
  var sprite:=Sprite2D.new();sprite.texture=tex;sprite.centered=false
  sprite.scale=Vector2(4,4)/tex.get_size();sprite.position=Vector2(x,0);view.add_child(sprite);x+=4
 for tex in [preload("res://assets/boss_parity/corruption_ring.svg"),preload("res://assets/boss_parity/orb.png"),preload("res://assets/boss_parity/pool.png")]:
  var sprite:=Sprite2D.new();sprite.texture=tex;sprite.centered=false
  sprite.scale=Vector2(4,4)/tex.get_size();sprite.position=Vector2(x-28,8);view.add_child(sprite);x+=4
 await RenderingServer.frame_post_draw
 await RenderingServer.frame_post_draw
 view.queue_free()

# Source53765–53785 shield paint is independent of PC shield damage/state writers.
func _draw() -> void:
 if not is_instance_valid(actor):return
 var e: Dictionary=actor.get("_enemy")
 if not e.get("alive",false) or float(e.get("eShieldMax",0))<=0 or e.get("s")=="bossDruidUnder":return
 var r: float=float(e.get("r",44));var now: float=_visual_now
 var sh: bool=float(e.get("eShield",0))>0
 var angle: float=float(e.get("shieldAng",0));var radius_: float=r+(5 if sh else 4);var span: float=1.0 if sh else .8
 var alpha: float=(.4+float(e.eShield)/float(e.eShieldMax)*.4)*(.5+sin(now/150)*.15) if sh else 1.0
 var color_: Color=Color("44ccff" if sh else "445577");color_.a=alpha
 draw_arc(Vector2.ZERO,radius_,angle-span,angle+span,maxi(8,int(2*span*radius_/5))+1,color_,5 if sh else 3,false)
 color_=Color("44c8ff" if sh else "3c506e");color_.a=alpha*.25
 var count: int=maxi(6,int(2*span*maxf(1,radius_)/6))
 for i in count:
  _shield_fan[1]=Vector2.from_angle(angle-span+2*span*i/count)*radius_
  _shield_fan[2]=Vector2.from_angle(angle-span+2*span*(i+1)/count)*radius_
  draw_colored_polygon(_shield_fan,color_)
