extends SceneTree
var main: Node
var output: String
var tag: String="after"
var metrics: Dictionary={}
func _initialize() -> void:call_deferred("run")
func settle(point: Vector2) -> void:
 main.player.global_position=point;main.player.reset_physics_interpolation()
 main.camera.global_position=point;main.camera.reset_smoothing();main.camera.reset_physics_interpolation()
 for i in range(35):await physics_frame
func capture(id: String,prop: Node2D) -> Image:
 for i in range(8):await process_frame
 await RenderingServer.frame_post_draw
 var image: Image=root.get_texture().get_image()
 image.save_png(output.path_join(tag+"_"+id+".png"))
 var point: Vector2=prop.get_global_transform_with_canvas().origin
 var rect:=Rect2i(Vector2i(point)-Vector2i(160,210),Vector2i(320,270)).intersection(Rect2i(0,0,1600,900))
 if id in ["field","west","east"]:
  var before: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(output.path_join("before_verification.json")))
  var r: Array=before[id].crop;rect=Rect2i(int(r[0]),int(r[1]),int(r[2]),int(r[3]))
 if rect.size.x<=0 or rect.size.y<=0:push_error("Empty capture crop: "+id);quit(6);return image
 image.get_region(rect).save_png(output.path_join(tag+"_"+id+"_1x.png"))
 metrics[id]={"crop":[rect.position.x,rect.position.y,rect.size.x,rect.size.y],"foot":str(point)}
 return image
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-21b-Isolated-20261021":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
  if arg.begins_with("--tag="):tag=arg.trim_prefix("--tag=")
 if output.is_empty():quit(3);return
 root.size=Vector2i(1600,900);root.content_scale_size=Vector2i(1600,900)
 DisplayServer.window_set_size(Vector2i(1600,900));DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 if not is_instance_valid(main.source_intro_sequence):quit(5);return
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 var detail: Node=scene.get_node("MAP11Detail")
 var prop: Node2D=detail.hell_props[0]
 for site in preload("res://scripts/maps/map11/tour_layout.gd").SCENES:
  var target: Node2D
  for i in range(detail.hell_props.size()):
   if preload("res://scripts/maps/map11/tour_layout.gd").ROWS[i][5]==preload("res://scripts/maps/map11/tour_layout.gd").SCENES.find(site):
    target=detail.hell_props[i];break
  await settle(site.camera);await capture(site.id,target)
 for index in [4,11]:
  var target: Node2D=detail.hell_props[index]
  await settle(target.global_position+Vector2(0,210));await capture("foot_%02d"%index,target)
 var file:=FileAccess.open(output.path_join(tag+"_verification.json"),FileAccess.WRITE);file.store_string(JSON.stringify(metrics,"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit()
