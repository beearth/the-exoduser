extends SceneTree
var out: String
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-30b-Isolated":quit(2);return
 for a in OS.get_cmdline_user_args():
  if a.begins_with("--output="):out=a.trim_prefix("--output=")
 OS.low_processor_usage_mode=false
 root.size=Vector2i(1920,1080);root.content_scale_size=root.size
 DisplayServer.window_set_size(root.size);DisplayServer.window_move_to_foreground()
 var arena=preload("res://scripts/maps/map11/product_arena_view.gd").new()
 arena.z_index=-2500;root.add_child(arena)
 root.canvas_transform=Transform2D(Vector2(.36,0),Vector2(0,.36),Vector2(960,497.2))
 for row in arena._target_rows:
  print(row.sprite.name," pod=",row.sprite.material.get_shader_parameter("pod_region")," mouth=",row.sprite.material.get_shader_parameter("mouth_region")," box=",row.sprite.material.get_shader_parameter("source_box"))
 for i in range(120):await process_frame
 await take("motion_0s")
 await create_timer(2.0).timeout
 await take("motion_2s")
 quit()
func take(id: String) -> void:
 RenderingServer.force_draw()
 root.get_texture().get_image().save_png(out.path_join(id+".png"))
