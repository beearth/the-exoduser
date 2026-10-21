extends SceneTree
## Offline deterministic bake of the accepted 22e floor, not new artwork.
const SIZE=4096
const SPAN=4960.0
func _initialize() -> void:call_deferred("_run")
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-PERF2-Isolated":quit(2);return
 var output: String=""
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 var source: String=FileAccess.get_file_as_string("res://scripts/maps/map11/arena_shoulder.gdshader")
 source=source.replace("shader_type canvas_item;","shader_type canvas_item;\nrender_mode blend_disabled, unshaded;")
 for mode in ["base","pulse"]:
  var viewport:=SubViewport.new();viewport.size=Vector2i(SIZE,SIZE);viewport.transparent_bg=true
  viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS;root.add_child(viewport)
  var floor_:=Polygon2D.new();var points:=PackedVector2Array()
  for i in range(192):points.append(Vector2.from_angle(TAU*float(i)/192.0)*2480.0)
  floor_.polygon=points;floor_.uv=points;floor_.texture=preload("res://assets/map/ch1_si1/ground_dark_soil.png")
  floor_.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED;floor_.texture_scale=Vector2.ONE*1.2
  floor_.scale=Vector2.ONE*(SIZE/SPAN);floor_.position=Vector2.ONE*(SIZE*.5)
  var shader_:=Shader.new()
  if mode=="base":
   shader_.code=source.replace("skin.r*=1.0+vessel*pulse*pulse_strength;","// pulse applied from the offline coefficient map")
  else:
   shader_.code=source.replace("COLOR=vec4(skin,s.a*(1.0-fade));","COLOR=vec4(vessel*smoothstep(.55,.90,sin(angle*3.0+.8)),0.0,0.0,1.0);")
  var mat:=ShaderMaterial.new();mat.shader=shader_;floor_.material=mat;viewport.add_child(floor_)
  for i in range(8):await process_frame
  await RenderingServer.frame_post_draw
  var image:=viewport.get_texture().get_image()
  if mode=="pulse":image.convert(Image.FORMAT_R8)
  if image.save_png(output.path_join("arena_floor_"+mode+".png"))!=OK:quit(4);return
  viewport.queue_free()
  for i in range(2):await process_frame
 quit()
