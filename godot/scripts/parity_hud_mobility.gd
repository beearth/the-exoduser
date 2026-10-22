extends Control
## Display-only G679-680 / G43609 / G60295-60314. Owner retains all calculations.
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
const FONTS = preload("res://scripts/native_ui_fonts.gd")
var hud: Node
var owner_node: Node
var gauge: Dictionary = {}
var bar: ColorRect
var bar_from:=0.
var bar_target:=0.
var bar_age:=1.
var toast: Control
var remaining := 0.0
var target_alpha := 0.0
var refresh := 0.0
var fill_from := Vector3.ZERO
var fill_to := Vector3.ZERO
var fill_now := Vector3.ZERO
var fill_age := Vector3.ONE
var hp_frame: TextureRect
var mp_frame: TextureRect
func _ready() -> void:
 name="WebMobilityHUD"
 mouse_filter=Control.MOUSE_FILTER_IGNORE
 set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var slot: Control=hud._root.get_node("NativeSkillBar/NativeSlot_skSlot0")
 bar=ColorRect.new();bar.name="WebHarpGaugeBar";bar.mouse_filter=Control.MOUSE_FILTER_IGNORE
 var bar_material := ShaderMaterial.new();bar_material.shader=preload("res://shaders/parity_slot_gauge.gdshader");bar.material=bar_material
 slot.add_child(bar);bar.position=Vector2(0,slot.size.y-2.7);bar.size=Vector2(slot.size.x,2.7);bar.z_index=5
 toast=preload("res://scripts/parity_hud_toast.gd").new();toast.name="WebShowPH"
 add_child(toast);toast.modulate.a=0
 hp_frame=hud._root.get_node("NativeHPGlobe/ui_globe_hp")
 mp_frame=hud._root.get_node("NativeSPGlobe/ui_globe_mp")
func show_ph(text: String, color: Color, duration_ms: int=500) -> void:
 toast.text=UI.text(text);toast.ink=color
 remaining=float(duration_ms)/1000.;target_alpha=1.
# CSS cubic-bezier(.2,.8,.3,1), monotonic x inversion; UI interpolation only.
func eased(t: float, x1: float=.2, y1: float=.8, x2: float=.3) -> float:
 var lo:=0.;var hi:=1.
 for i in range(10):
  var m: float=(lo+hi)*.5
  var x: float=3.*(1.-m)*(1.-m)*m*x1+3.*(1.-m)*m*m*x2+m*m*m
  if x<t:lo=m
  else:hi=m
 var u: float=(lo+hi)*.5
 return 3.*(1.-u)*(1.-u)*u*y1+3.*(1.-u)*u*u+u*u*u
func _process(dt: float) -> void:
 if not is_instance_valid(owner_node) and is_instance_valid(hud._player):
  owner_node=hud._player.get_parent().get("native_move_skills")
  if is_instance_valid(owner_node):owner_node.native_show_ph.connect(show_ph)
 bar_age=minf(1.,bar_age+dt/.1)
 bar.size.x=lerpf(bar_from,bar_target,eased(bar_age,.25,.1,.25))
 bar.material.set_shader_parameter("width_px",bar.size.x)
 remaining=maxf(0,remaining-dt)
 if remaining<=0:target_alpha=0
 toast.modulate.a=move_toward(toast.modulate.a,target_alpha,dt/.1)
 toast.size=Vector2(size.x,42);toast.position=Vector2(0,size.y-180-42)
 refresh+=dt
 if refresh<.05:return
 refresh=0
 if is_instance_valid(owner_node):gauge=owner_node.read_native_move_gauge()
 var pct: float=float(gauge.get("pct",0))
 var target: float=bar.get_parent().size.x*pct
 if target!=bar_target:bar_from=bar.size.x;bar_target=target;bar_age=0
 bar.color=Color("44ffaa") if pct>=1 else (Color("88ccff") if pct>=.5 else Color("ff8844"))
 var p: Variant=hud._source_state.read_current_p() if is_instance_valid(hud._source_state) else null
 if not p is Dictionary:return
 var next_fill := Vector3(.9-.87*(1.-clampf(float(int(p.get("hp",0)))/maxf(1,float(int(p.get("mhp",0)))),0,1)),clampf(float(int(p.get("mp",0)))/maxf(1,float(int(p.get("mmp",0)))),0,1),clampf(float(p.get("st",0))/maxf(1,float(p.get("mst",0))),0,1))
 for i in range(3):
  if next_fill[i]!=fill_to[i]:fill_from[i]=fill_now[i];fill_to[i]=next_fill[i];fill_age[i]=0
  fill_age[i]=minf(1.,fill_age[i]+.05/(.6 if i==0 else .5))
  fill_now[i]=lerpf(fill_from[i],fill_to[i],eased(fill_age[i]))
 hud._hp_fill.set_shader_parameter("fill_ratio",fill_now.x)
 hud._stamina_fill.set_shader_parameter("mp_ratio",fill_now.y)
 hud._stamina_fill.set_shader_parameter("fill_ratio",fill_now.z)
 var sh: float=clampf(float(p.get("shield",0))/maxf(1,float(p.get("mshield",0))),0,1)
 var alpha: float=maxf(.1,sh)
 hp_frame.material.set_shader_parameter("glow_color",Color(50./255,150./255,1,.5*alpha if sh>0 else 0.))
 hp_frame.material.set_shader_parameter("blur_px",(4.+alpha*8.)*.9)
 var poise: bool=float(p.get("maxPoise",0))>0 and float(p.get("poise",0))/float(p.maxPoise)>=.99 and p.get("s")!="pStun"
 mp_frame.material.set_shader_parameter("glow_color",Color(1,204./255,68./255,.7 if poise else 0.))
 mp_frame.material.set_shader_parameter("blur_px",9.)
