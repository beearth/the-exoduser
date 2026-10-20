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
 image.get_region(rect).save_png(output.path_join(tag+"_"+id+"_1x.png"))
 metrics[id]={"crop":[rect.position.x,rect.position.y,rect.size.x,rect.size.y],"foot":str(point)}
 return image
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-25Db-Isolated-20261021":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
  if arg.begins_with("--tag="):tag=arg.trim_prefix("--tag=")
 if output.is_empty():quit(3);return
 root.size=Vector2i(1600,900);root.content_scale_size=Vector2i(1600,900)
 DisplayServer.window_set_size(Vector2i(1600,900));DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 var detail: Node=scene.get_node("MAP11Detail")
 var prop: Node2D=detail.hell_props[0]
 await settle(Vector2(-850,-2400));await capture("field",prop)
 await settle(Vector2(-3150,-1050));await capture("west",detail.hell_props[1])
 await settle(Vector2(1570,-1680));await capture("east",detail.hell_props[2])
 if tag=="after":
  var sprite: Sprite2D=prop.get_child(0)
  metrics.canvas_texture=sprite.texture is CanvasTexture
  metrics.normal_present=sprite.texture.normal_texture!=null if sprite.texture is CanvasTexture else false
  metrics.depth=prop.z_index==int(prop.position.y/4.0) and not prop.z_as_relative
  metrics.foot_bounds=str(sprite.get_meta("opaque_ground_bounds"))
  # Existing PlayerKey light only; identical camera, player and object transforms.
  await settle(Vector2(-850,-2400))
  scene.lighting_look.set_process(false)
  var light: PointLight2D=scene.lighting_look._player_light
  light.global_position=prop.global_position+Vector2(-85,-120)
  await capture("light_near",prop)
  var saved_normal: Texture2D=sprite.texture.normal_texture
  sprite.texture.normal_texture=null
  await capture("light_near_flat_control",prop)
  sprite.texture.normal_texture=saved_normal
  light.global_position=prop.global_position+Vector2(-700,100)
  await capture("light_far",prop)
  sprite.texture.normal_texture=null
  await capture("light_far_flat_control",prop)
  sprite.texture.normal_texture=saved_normal
 var file:=FileAccess.open(output.path_join(tag+"_verification.json"),FileAccess.WRITE);file.store_string(JSON.stringify(metrics,"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit()
