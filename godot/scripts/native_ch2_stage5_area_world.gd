extends "res://scripts/native_ch2_area_world.gd"
## CH2-04 standalone si5 consumer. CH1 fixture/query/physics and CH2 props reused.
const Stage5Resources=preload("res://scripts/native_ch2_stage5_area_resources.gd")
const STAGE5_USERDIR := "EXODUSER-ch2-04-Isolated-20261020"
var source_glows: Array[Node2D]=[]

class SourceGlow extends Node2D:
 var anchor_x: float
 func _process(_delta: float) -> void:
  queue_redraw()
 func _draw() -> void:
  # game.html52453: .3 fill alpha times (.15 + sin(now/800+x)*.05).
  var alpha:=.3*(.15+sin(Time.get_ticks_msec()/800.0+anchor_x)*.05)
  draw_circle(Vector2.ZERO,80,Color(1,180.0/255.0,80.0/255.0,alpha))

func _install_props() -> void:
 super._install_props()
 var index:=0
 for p in bundle.props:
  if p.get("view")=="collision_only":continue
  var sprite: Sprite2D=sprites[index]
  index+=1
  if not p.metadata.get("light",false):continue
  var glow:=SourceGlow.new()
  glow.name="SourceGlow"
  glow.anchor_x=p.x
  # Keep the native 80 world-pixel circle independent of sprite image scale.
  glow.scale=Vector2.ONE/sprite.scale
  sprite.add_child(glow)
  source_glows.append(glow)

func _ready() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=STAGE5_USERDIR \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  resource_errors=["isolated_userdir_required"]
  return
 var reader:=Stage5Resources.new()
 var result: Dictionary=reader.read_resources(raw,bundle) if _configured else reader.read_resources()
 resource_errors=result.errors
 if not result.ready:return
 raw=result.raw;bundle=result.bundle;textures=result.textures
 _install_ground()
 _install_walls()
 _install_props()
 actor=Node2D.new()
 actor.name="FixtureActor"
 actor.position=Vector2(raw.start_world[0],raw.start_world[1])
 var marker:=Polygon2D.new()
 marker.polygon=PackedVector2Array([Vector2(0,-16),Vector2(11,0),Vector2(0,16),Vector2(-11,0)])
 marker.color=Color("e0cda9")
 actor.add_child(marker)
 get_node("PropLayer0").add_child(actor)
 camera=Camera2D.new()
 camera.position_smoothing_enabled=false
 camera.enabled=preview_active
 actor.add_child(camera)
 ready_for_fixture=true
 set_process(preview_active)

func _install_ground() -> void:
 # si5 has no authored path. Do not copy si4's path or invent gameplay geometry.
 var floor_view:=Polygon2D.new()
 floor_view.name="CH2Stage5Ground"
 floor_view.polygon=PackedVector2Array([Vector2.ZERO,Vector2(8000,0),Vector2(8000,8000),Vector2(0,8000)])
 floor_view.uv=floor_view.polygon
 floor_view.texture=textures[bundle.floor.texture]
 floor_view.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED
 floor_view.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
 floor_view.modulate=Color(.82,.82,.82,1)
 floor_view.z_index=-5
 add_child(floor_view)
 # Destinations only: no gate/stage progress writes or transition hooks.
 for e in raw.exits:
  var destination:=Polygon2D.new()
  destination.polygon=PackedVector2Array([Vector2(-19,-19),Vector2(19,-19),Vector2(19,19),Vector2(-19,19)])
  destination.position=Vector2((e.x+.5)*40,(e.y+.5)*40)
  destination.color=Color(.55,.31,.12,.65)
  destination.z_index=-1
  add_child(destination)
