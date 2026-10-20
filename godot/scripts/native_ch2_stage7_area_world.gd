extends "res://scripts/native_ch2_stage5_area_world.gd"
## CH2-05 si7: shared map fixture/rendering reuse; product Main is untouched.
const Stage7Resources=preload("res://scripts/native_ch2_stage7_area_resources.gd")
const STAGE7_USERDIR := "EXODUSER-ch2-05-Isolated-20261020"

func _ready() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=STAGE7_USERDIR \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  resource_errors=["isolated_userdir_required"]
  return
 var reader:=Stage7Resources.new()
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
