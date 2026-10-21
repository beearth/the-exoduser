extends SceneTree
## Test-only frozen presentation comparison. No combat/core/scale product writes.
var main: Node
var output="/Users/fordeargamers/exoduser-wt/_out/ZOOM-01/captures"
var multiplier:=1.0
var rows: Array=[]
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-ZOOM-01-Isolated":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--zoom-preview="):multiplier=float(arg.trim_prefix("--zoom-preview="))
 if multiplier not in [1.0,2.0,2.5,3.0]:quit(3);return
 root.size=Vector2i(1920,1080);root.content_scale_size=root.size
 DisplayServer.window_set_size(root.size)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all()
 main.world.get_node("NativePets")._subtitle_root.hide()
 var scene: Node=main.world.get_node("Map11ProductScene")
 main.source_intro_sequence._barrier.hide()
 freeze(main)
 main.player.show();main.player.modulate=Color.WHITE;main.player._sprite.show();main.player._sprite.modulate=Color.WHITE
 main.process_mode=Node.PROCESS_MODE_DISABLED
 main.camera.position_smoothing_enabled=false
 main.camera.enabled=false
 var start: Vector2=scene.start_marker.global_position
 main.player.global_position=start;main.player.reset_physics_interpolation()
 # Reposition three actual registered product enemies for the comparison fixture.
 var enemies: Array=main.world.get_enemies()
 var positions: Array=[Vector2(-150,-80),Vector2(120,-160),Vector2(230,40)]
 if enemies.size()<3:push_error("three actual enemies required");quit(4);return
 for i in range(enemies.size()):
  enemies[i].hide()
  if i<3:
   enemies[i].show();enemies[i].global_position=start+positions[i];enemies[i].reset_physics_interpolation()
 await board("field_start",start+Vector2(0,-180),.70,null)
 for enemy in enemies:enemy.hide()
 scene.activate_space("arena")
 if scene._fade_tween!=null:scene._fade_tween.kill()
 if is_instance_valid(scene._fade):scene._fade.color.a=0
 var arena: Node2D=scene.arena_view
 var boss: Node2D=scene.get_node("Boss11SceneActor")
 boss.set_process(false);boss.show();boss.global_position=arena.global_position
 boss.scale=Vector2.ONE/multiplier
 for pair in [["boss_entry",Vector2(0,800)],["boss_melee",Vector2(100,110)]]:
  main.player.global_position=arena.global_position+pair[1];main.player.reset_physics_interpolation()
  scene.boss_camera.blend=1.0;scene.boss_camera._from=1.0;scene.boss_camera._target=1.0
  scene.boss_camera._physics_process(1.0)
  await board(pair[0],main.camera.global_position+main.camera.offset,main.camera.zoom.x,boss)
 var f:=FileAccess.open(output.path_join("measurements_x"+str(multiplier)+".json"),FileAccess.WRITE)
 f.store_string(JSON.stringify(rows,"  "))
 main.free();await process_frame;quit()
func opaque_height(sprite: Node2D, texture: Texture2D) -> float:
 var bounds: Rect2i=texture.get_image().get_used_rect()
 return bounds.size.y*absf(sprite.get_global_transform_with_canvas().y.length())
func board(id: String,center: Vector2,base_zoom: float,boss: Node2D) -> void:
 var zoom:=base_zoom*multiplier
 root.canvas_transform=Transform2D(Vector2(zoom,0),Vector2(0,zoom),Vector2(960,540)-center*zoom)
 for i in range(12):await process_frame
 await RenderingServer.frame_post_draw
 var im:=root.get_texture().get_image()
 var path:=output.path_join(id+"_x"+str(multiplier)+".png")
 im.save_png(path)
 var player_sprite: AnimatedSprite2D=main.player._sprite
 var tex: Texture2D=player_sprite.sprite_frames.get_frame_texture(player_sprite.animation,player_sprite.frame)
 var boss_px:=0.0
 if boss!=null:
  var image: Image=boss.body.texture.get_image().get_region(Rect2i(boss.body.region_rect))
  boss_px=image.get_used_rect().size.y*boss.body.get_global_transform_with_canvas().y.length()
 rows.append({"scene":id,"multiplier":multiplier,"base_zoom":base_zoom,"player_px":opaque_height(player_sprite,tex),"boss_px":boss_px,"world_width":1920.0/zoom,"path":path,"scope":"frozen presentation; boss idle fixture; not live combat"})

func freeze(node: Node) -> void:
 node.set_process(false);node.set_physics_process(false)
 for child in node.get_children():freeze(child)
