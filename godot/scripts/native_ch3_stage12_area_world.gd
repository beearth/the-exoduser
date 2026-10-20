extends "res://scripts/native_ch3_area_world.gd"
## CH3-04 standalone fixture consumer. Product World/Main/State remain unbound.
const Stage12Resources=preload("res://scripts/native_ch3_stage12_area_resources.gd")
const STAGE12_USERDIR="EXODUSER-ch3-04-Isolated-20261020"

func _ready() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=STAGE12_USERDIR \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  resource_errors=["isolated_userdir_required"]
  return
 var reader:=Stage12Resources.new()
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
 # Actual stage12 has default full editor floor, never the si10 basin mask.
 var ground:=Polygon2D.new();ground.name="CH3Stage12Ground"
 ground.polygon=PackedVector2Array([Vector2.ZERO,Vector2(8000,0),Vector2(8000,8000),Vector2(0,8000)])
 ground.uv=ground.polygon
 ground.texture=textures[bundle.floor.texture]
 ground.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED
 ground.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
 var material:=ShaderMaterial.new();material.shader=LIT;material.set_shader_parameter("bump_strength",2.8)
 ground.material=material;ground.z_index=-20;add_child(ground)
 for e in raw.exits:
  var marker:=Polygon2D.new();marker.name="ExitFixture"
  marker.position=Vector2((e.x+.5)*40,(e.y+.5)*40)
  marker.polygon=PackedVector2Array([Vector2(-19,-19),Vector2(19,-19),Vector2(19,19),Vector2(-19,19)])
  marker.color=Color(.4,.31,.22,.5);marker.z_index=-1;add_child(marker)

func _install_look() -> void:
 if not look_active:return
 ambient=CanvasModulate.new();ambient.name="Stage12Ambient";ambient.color=Color(.48,.5,.54);add_child(ambient)
 var gradient:=Gradient.new()
 gradient.offsets=PackedFloat32Array([0.0,.35,.7,1.0])
 gradient.colors=PackedColorArray([Color.WHITE,Color(1,1,1,.65),Color(1,1,1,.18),Color.TRANSPARENT])
 var radial:=GradientTexture2D.new();radial.gradient=gradient;radial.width=256;radial.height=256
 radial.fill=GradientTexture2D.FILL_RADIAL;radial.fill_from=Vector2(.5,.5);radial.fill_to=Vector2(1,.5)
 fixture_light=_add_light(radial,actor.position,640,Color(.83,.76,.68),1.0)
 for p in bundle.props:
  if p.type in ["m_c3tree","m_c3rampart","m_c3stalag"]:
   _add_light(radial,Vector2(p.x,p.y-30),800,Color(.48,.57,.68),.7)
