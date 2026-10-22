extends Node2D
## Snapshot53758-53861, read-only shield/type decorations for admitted natural actors.
## One startup node + fixed fan buffer. Parent redraw drives redraw; no process/RNG owner.
var actor: Node2D
var _g: Dictionary
var _fan:=PackedVector2Array()
const STUN_QUAD=[0,1,2,9]
var _star:=PackedVector2Array()
var _rings: Array[Sprite2D]=[]
var _ring_index:=0
var _stun_ring: Sprite2D
var visual_clock_ms: float=-1
var _revive: Node2D
var _flash: Array[Sprite2D]=[]
var _sources: Array[Sprite2D]=[]
const SOURCE_HIT_ONE="shader_type canvas_item; render_mode blend_add; void fragment(){ vec4 c=texture(TEXTURE,UV); COLOR=vec4(c.rgb,1.0); }"

func configure(owner_actor: Node2D) -> void:
 actor=owner_actor
 var source: Node=actor.world.get_parent().get("source_state")
 if is_instance_valid(source):_g=source.read_current_g()
 _revive=preload("res://scripts/native_source_revive_view.gd").new();add_child(_revive);_revive.configure(actor.world.get_parent())
 var shader:=Shader.new();shader.code=SOURCE_HIT_ONE
 var add:=ShaderMaterial.new();add.shader=shader
 if is_instance_valid(actor._body):_sources.append(actor._body)
 var walk: Variant=actor.get("_walk")
 if walk is Sprite2D:_sources.append(walk)
 for source_sprite in _sources:
  var sprite:=Sprite2D.new();sprite.material=add;sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
  actor.add_child(sprite);actor.move_child(sprite,get_index());_flash.append(sprite)
 if actor.has_method("_draw_native_source_hit_flash"):
  var flash_canvas:=Node2D.new();flash_canvas.material=add;actor.add_child(flash_canvas);actor.move_child(flash_canvas,get_index())
  flash_canvas.draw.connect(actor._draw_native_source_hit_flash.bind(flash_canvas));actor.draw.connect(flash_canvas.queue_redraw)
 var gradient:=Gradient.new();gradient.colors=PackedColorArray([Color.WHITE,Color.WHITE])
 var pixel:=GradientTexture2D.new();pixel.gradient=gradient;pixel.width=2;pixel.height=2
 var ring_shader:=Shader.new();ring_shader.code=preload("res://scripts/boss11_source_ground.gd").FX_SHADER
 for i in 5:
  var ring:=Sprite2D.new();ring.texture=pixel
  var mat:=ShaderMaterial.new();mat.shader=ring_shader;ring.material=mat;ring.hide()
  if i==0:
   actor.add_child(ring);actor.move_child(ring,0);ring.show_behind_parent=true;_stun_ring=ring
  else:add_child(ring);_rings.append(ring)
 var back_stars:=Node2D.new();actor.add_child(back_stars);actor.move_child(back_stars,0);back_stars.show_behind_parent=true
 back_stars.draw.connect(_draw_stars.bind(back_stars));actor.draw.connect(back_stars.queue_redraw)
 _star.resize(4)
 _fan.resize(3)
 actor.draw.connect(queue_redraw)
func _ink(hex: String,alpha: float=1.0) -> Color:
 return Color(Color(hex),clampf(alpha,0,1))
func disk(r: float,hex: String,alpha: float) -> void:
 draw_circle(Vector2.ZERO,r,_ink(hex,alpha))
func arc(r: float,start: float,end: float,hex: String,alpha: float,width: float) -> void:
 if absf(end-start)>=PI*1.99:
  if _ring_index>=_rings.size():return
  var ring: Sprite2D=_rings[_ring_index];_ring_index+=1
  _set_ring(ring,r,_ink(hex,alpha),width);return
 var count: int=maxi(8,int(absf(end-start)*maxf(1,r)/5))
 for i in count:
  draw_line(Vector2.from_angle(start+(end-start)*i/count)*r,Vector2.from_angle(start+(end-start)*(i+1)/count)*r,_ink(hex,alpha),width,false)
func _draw() -> void:
 if not is_instance_valid(actor):return
 _ring_index=0
 for ring in _rings:ring.hide()
 _stun_ring.hide()
 _revive.visual_clock_ms=visual_clock_ms;_revive.observe(actor.data.native_final,maxi(0,actor.source_order))
 _sync_flash()
 if not actor.alive:return
 if actor._stun_ticks>0:
  var time_: float=visual_clock_ms if visual_clock_ms>=0 else float(Time.get_ticks_msec())
  _set_ring(_stun_ring,actor.radius+8,_ink("ffaa00",.4+sin(time_/60)*.3),3)
  _draw_stars(self)
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
  var count: int=maxi(6,int(2*span*maxf(1,radius_)/6))
  for i in count:
   _fan[1]=Vector2.from_angle(angle-span+2*span*i/count)*radius_
   _fan[2]=Vector2.from_angle(angle-span+2*span*(i+1)/count)*radius_
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

func _sync_flash() -> void:
 var value: float=clampf(float(actor._hit_flash)/6,0,1)
 for i in _flash.size():
  var source: Sprite2D=_sources[i];var sprite: Sprite2D=_flash[i]
  sprite.visible=actor.alive and value>0 and source.visible
  if not sprite.visible:continue
  sprite.texture=source.texture;sprite.region_enabled=source.region_enabled;sprite.region_rect=source.region_rect
  sprite.hframes=source.hframes;sprite.vframes=source.vframes;sprite.frame=source.frame
  sprite.centered=source.centered;sprite.offset=source.offset;sprite.transform=source.transform
  preload("res://scripts/native_enemy_source_art.gd").snap_sprite(actor,sprite,float(actor.data.animation.draw_height)*(1+.05*value))
  sprite.flip_h=source.flip_h;sprite.flip_v=source.flip_v
  sprite.modulate=Color(1,1,1,source.modulate.a*value*.8)

func _set_ring(ring: Sprite2D,radius_: float,color_: Color,width_: float) -> void:
 preload("res://scripts/native_enemy_source_art.gd").snap_sprite(actor,ring,(radius_+width_)*2,2)
 ring.show()
 ring.material.set_shader_parameter("tint",color_)
 ring.material.set_shader_parameter("inner",.5-width_/(2*radius_+width_))

# Proxy fill(6072-6078) submits first three and final path vertex, even for a 10-point star.
# Source draws it both before and after the body; reproduce those two passes.
func _draw_stars(canvas: Node2D) -> void:
 if not is_instance_valid(actor) or not actor.alive or actor._stun_ticks<=0:return
 var now_: float=visual_clock_ms if visual_clock_ms>=0 else float(Time.get_ticks_msec())
 for i in 2:
  var angle_: float=now_/300+i*PI
  var center_:=Vector2(cos(angle_)*(actor.radius+4),-actor.radius-6+sin(angle_)*4)
  for j in 4:
   var source_vertex: int=STUN_QUAD[j]
   _star[j]=center_+Vector2.from_angle(angle_+source_vertex*PI/5-PI/2)*(3.5 if source_vertex%2==0 else 1.5)
  canvas.draw_colored_polygon(_star,_ink("ffdd44",.7))
