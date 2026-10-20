extends "res://scripts/native_ch2_area_world.gd"
## CH3-02: independent fixture view. Shared Main/World/P/G/real Player untouched.
## Reuse CH1 tile Physics, swept fixture, BFS and CH2 alpha handling only.
const CH3Resources=preload("res://scripts/native_ch3_area_resources.gd")
const CH3_USERDIR := "EXODUSER-ch3-02-Isolated-20261020"
const LIT=preload("res://assets/vfx/map_look_lit.gdshader")
const SHADOW=preload("res://assets/vfx/map_look_silhouette.gdshader")
var analytic_colliders: Array=[]
var collision_buckets: Dictionary={}
var altar_markers:=0
var point_lights: Array[PointLight2D]=[]
var display_shadows: Array[Sprite2D]=[]
var ambient: CanvasModulate
var fixture_light: PointLight2D
@export var look_active := true

func _ready() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=CH3_USERDIR \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  resource_errors=["isolated_userdir_required"]
  return
 var reader:=CH3Resources.new()
 var result: Dictionary=reader.read_resources(raw,bundle) if _configured else reader.read_resources()
 resource_errors=result.errors
 if not result.ready:return
 raw=result.raw;bundle=result.bundle;textures=result.textures
 for c in bundle.colliders:
  var decoded: Dictionary=c.duplicate()
  var bits:=Marshalls.base64_to_raw(c.f64)
  var keys: Array=["x","y","rx","ry","oy","rotation","cos","sin"]
  for i in keys.size():decoded[keys[i]]=bits.decode_double(i*8)
  analytic_colliders.append(decoded)
 _index_colliders()
 _install_ground()
 _install_walls()
 _install_props()
 actor=Node2D.new();actor.name="FixtureActor"
 actor.position=Vector2(raw.start_world[0],raw.start_world[1])
 var marker:=Polygon2D.new()
 marker.polygon=PackedVector2Array([Vector2(0,-16),Vector2(11,0),Vector2(0,16),Vector2(-11,0)])
 marker.color=Color("e0cda9");actor.add_child(marker)
 get_node("PropLayer0").add_child(actor)
 camera=Camera2D.new();camera.position_smoothing_enabled=false;camera.enabled=preview_active
 actor.add_child(camera)
 _install_look()
 ready_for_fixture=true
 set_process(preview_active)

func _install_ground() -> void:
 var ground:=Polygon2D.new();ground.name="CH3BasinGround"
 ground.polygon=PackedVector2Array([Vector2.ZERO,Vector2(8000,0),Vector2(8000,8000),Vector2(0,8000)])
 var uv:=PackedVector2Array()
 for point in ground.polygon:uv.append(point/2.0)
 ground.uv=uv
 ground.texture=textures[bundle.floor.texture]
 ground.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED
 ground.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
 var shader:=Shader.new()
 shader.code="""shader_type canvas_item;
varying vec2 world_xy;
void vertex(){world_xy=VERTEX;}
void fragment(){
 vec2 p=(world_xy-vec2(4020.0,4020.0))/vec2(3600.0,3520.0);
 float bowl=1.0-smoothstep(0.98,1.06,length(p));
 float gate=(1.0-smoothstep(470.0,530.0,abs(world_xy.x-4020.0)))*(1.0-step(4020.0,world_xy.y));
 float inside=max(bowl,gate);
 vec4 base=texture(TEXTURE,UV);
 COLOR=vec4(base.rgb*mix(0.12,0.95,inside),1.0);
 vec2 px=TEXTURE_PIXEL_SIZE*1.5;
 float l=dot(texture(TEXTURE,UV-vec2(px.x,0)).rgb,vec3(.299,.587,.114));
 float r=dot(texture(TEXTURE,UV+vec2(px.x,0)).rgb,vec3(.299,.587,.114));
 float u=dot(texture(TEXTURE,UV-vec2(0,px.y)).rgb,vec3(.299,.587,.114));
 float d=dot(texture(TEXTURE,UV+vec2(0,px.y)).rgb,vec3(.299,.587,.114));
 NORMAL=normalize(vec3((l-r)*2.8,(u-d)*2.8,1.0));
}
"""
 var material:=ShaderMaterial.new();material.shader=shader;ground.material=material
 ground.z_index=-20;add_child(ground)

func _install_props() -> void:
 var layers: Dictionary={}
 for p in bundle.props:
  var layer: int=int(p.get("metadata",{}).get("_renderLayer") if p.get("metadata",{}).get("_renderLayer")!=null else 0)
  if not layers.has(layer):
   var group:=Node2D.new();group.name="PropLayer"+str(layer);group.y_sort_enabled=true;group.z_index=layer
   add_child(group);layers[layer]=group
  if p.get("view")=="collision_only":continue
  if p.get("view") in ["native_lore_marker","native_altar_marker"]:
   var lore:=Polygon2D.new();lore.name="AltarMarker" if p.type=="altar" else "LoreMarker";lore.position=Vector2(p.x,p.y)
   lore.polygon=PackedVector2Array([Vector2(-10,8),Vector2(-10,-17),Vector2(8,-21),Vector2(12,8)])
   lore.color=Color("756959");layers[layer].add_child(lore)
   if p.type=="altar":altar_markers+=1
   else:lore_markers+=1
   continue
  var sprite:=Sprite2D.new();sprite.name=p.type+"_"+str(sprites.size())
  sprite.texture=_display_texture(p.texture,p.image_keying)
  sprite.set_meta("source_texture_path",p.texture)
  sprite.centered=false;sprite.position=Vector2(p.x,p.y)
  sprite.region_enabled=true
  sprite.region_rect=Rect2(p.source_rect[0],p.source_rect[1],p.source_rect[2],p.source_rect[3])
  sprite.region_filter_clip_enabled=true
  var ss: Array=p.source_size
  var anchor_y: float=1.0 if p.metadata.get("anchorBottom",false) else float(p.pivot[1])
  sprite.offset=Vector2(-ss[0]*p.pivot[0]+p.trim_offset[0],-ss[1]*anchor_y+p.trim_offset[1])
  sprite.scale=Vector2(p.draw_size[0]/ss[0],p.draw_size[1]/ss[1])
  sprite.rotation=deg_to_rad(float(p.rotation));sprite.flip_h=p.flip_h;sprite.modulate.a=p.alpha
  var material:=ShaderMaterial.new();material.shader=LIT;material.set_shader_parameter("bump_strength",2.2)
  sprite.material=material
  # Source CSS/edge erase are not claimed as native pixel parity. Godot display only.
  if p.source_filter_declared.contains("sepia"):
   sprite.modulate=Color(.45,.13,.1,p.alpha)
  elif p.source_filter_declared.contains("brightness(.26)"):
   sprite.modulate=Color(.23,.24,.26,p.alpha)
  layers[layer].add_child(sprite);sprites.append(sprite)
  if look_active and p.metadata.get("col",0) and not p.metadata.get("colParts"):
   var shadow:=sprite.duplicate() as Sprite2D
   shadow.name="ContactShadow"+str(display_shadows.size())
   shadow.position+=Vector2(p.draw_size[0]*.055,p.draw_size[1]*.045)
   var sm:=ShaderMaterial.new();sm.shader=SHADOW;sm.set_shader_parameter("tint",Color(0,0,0,.3));sm.set_shader_parameter("blur_px",7.0)
   shadow.material=sm;shadow.z_index=-1;layers[layer].add_child(shadow);display_shadows.append(shadow)

func _install_look() -> void:
 if not look_active:return
 ambient=CanvasModulate.new();ambient.name="CH3Ambient";ambient.color=Color(.42,.44,.49);add_child(ambient)
 var gradient:=Gradient.new()
 gradient.offsets=PackedFloat32Array([0.0,.35,.7,1.0])
 gradient.colors=PackedColorArray([Color.WHITE,Color(1,1,1,.65),Color(1,1,1,.18),Color.TRANSPARENT])
 var radial:=GradientTexture2D.new();radial.gradient=gradient;radial.width=256;radial.height=256
 radial.fill=GradientTexture2D.FILL_RADIAL;radial.fill_from=Vector2(.5,.5);radial.fill_to=Vector2(1,.5)
 fixture_light=_add_light(radial,actor.position,620,Color(.83,.72,.61),1.0)
 for p in bundle.props:
  if p.type in ["m_c3hellritual","m_c3hellexecution","m_c3hellprison","m_c3hellcarcass","m_c3helldormant"]:
   _add_light(radial,Vector2(p.x,p.y-30),1050 if p.type=="m_c3hellritual" else 800,Color(.58,.18,.12),.75)

func _add_light(texture: Texture2D,position_xy: Vector2,radius: float,color: Color,energy: float) -> PointLight2D:
 var light:=PointLight2D.new();light.texture=texture;light.position=position_xy
 light.texture_scale=radius*2.0/256.0;light.color=color;light.energy=energy;light.height=radius*.45
 light.range_z_min=-4096;light.range_z_max=4096;add_child(light);point_lights.append(light);return light

func _index_colliders() -> void:
 # Conservative private preview broadphase. Exact source comparisons below keep
 # original order and float64 values; a 1px margin includes numerical edges.
 for c in analytic_colliders:
  var ex: float=float(c.rx)
  var ey: float=float(c.ry)
  var cy: float=float(c.y)+float(c.oy)
  if c.shape=="rect":
   ex=absf(float(c.rx)*float(c.cos))+absf(float(c.ry)*float(c.sin))
   ey=absf(float(c.rx)*float(c.sin))+absf(float(c.ry)*float(c.cos))
  for y in range(floori((cy-ey-1.0)/256.0),floori((cy+ey+1.0)/256.0)+1):
   for x in range(floori((float(c.x)-ex-1.0)/256.0),floori((float(c.x)+ex+1.0)/256.0)+1):
    var key:=Vector2i(x,y)
    if not collision_buckets.has(key):collision_buckets[key]=[]
    collision_buckets[key].append(c)

func is_wall_xy(px: float,py: float) -> bool:
 var tx:=int(px/40.0);var ty:=int(py/40.0)
 if tx<0 or ty<0 or tx>=200 or ty>=200:return true
 if int(raw.tiles[ty*200+tx])==1:return true
 var key:=Vector2i(floori(px/256.0),floori(py/256.0))
 for c in collision_buckets.get(key,[]):
  var dx: float=px-float(c.x);var dy: float=py-float(c.y)
  if c.shape=="rect":
   var lx: float=dx*float(c.cos)+dy*float(c.sin)
   var ly: float=-dx*float(c.sin)+dy*float(c.cos)
   if absf(lx)<float(c.rx) and absf(ly)<float(c.ry):return true
  elif c.shape=="circle":
   if dx*dx+dy*dy<float(c.rx)*float(c.rx):return true
  else:
   var oy: float=dy-float(c.oy)
   if dx*dx/(float(c.rx)*float(c.rx))+oy*oy/(float(c.ry)*float(c.ry))<1.0:return true
 return false

func set_preview_look(enabled: bool) -> void:
 # Display-only A/B. No map, placement, collision or source authority writes.
 look_active=enabled
 if is_instance_valid(ambient):ambient.visible=enabled
 for light in point_lights:light.visible=enabled
 for shadow in display_shadows:shadow.visible=enabled

func _process(delta: float) -> void:
 super._process(delta)
 if is_instance_valid(fixture_light) and is_instance_valid(actor):fixture_light.position=actor.position+Vector2(0,-20)
