extends SceneTree
## Test-only camera boards; product code and combat owners remain untouched.
var main: Node
var scene: Node
var output="/Users/fordeargamers/exoduser-wt/_out/ZOOM-01b/captures"
var selection="all"
var rows: Array=[]
var paused_nodes: Array=[]
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-ZOOM-01b-Isolated":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--zoom-preview="):selection=arg.trim_prefix("--zoom-preview=")
 if selection not in ["all","1.0","2.0","2.5","3.0"]:quit(3);return
 root.size=Vector2i(1920,1080);root.content_scale_size=root.size
 DisplayServer.window_set_size(root.size)
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all()
 main.world.get_node("NativePets")._subtitle_root.hide()
 scene=main.world.get_node("Map11ProductScene")
 scene.activate_space("field")
 main.player.global_position=Vector2(0,3700);main.player.reset_physics_interpolation()
 for i in range(30):await physics_frame
 var enemies: Array=main.world.get_enemies()
 var positions: Array=[Vector2(-150,-80),Vector2(120,-160),Vector2(230,40)]
 for i in range(enemies.size()):
  if i>=3:enemies[i].hide()
  if i<3:
   enemies[i].global_position=main.player.global_position+positions[i];enemies[i].reset_physics_interpolation()
 await boards("field_start",.70,null)
 # Stage the entry via the real spawn API. No boss state/clock/pattern injection.
 main.world.activate_map11_space("arena")
 var center: Vector2=scene.arena_view.global_position
 main.player.global_position=center+Vector2(0,800);main.player.reset_physics_interpolation()
 var spawned: Dictionary=main.spawn_native_demo_boss({"si":0,"x":center.x,"y":center.y,"room":0,"difficulty_index":5,"stage_diff_offset":0})
 print("ZOOM_SPAWN ",JSON.stringify(spawned))
 if spawned.get("status")!="READY":quit(5);return
 main.source_state.read_current_g()["_bossArena"]=true
 var boss: Node2D=scene.get_node("Boss11SceneActor")
 for i in range(20):await physics_frame
 await boards("boss_entry",.56370014,boss)
 var start: Vector2=main.player.global_position
 var event:=InputEventAction.new();event.action="move_up";event.pressed=true
 var accepted:=false
 var captured:=false
 for tick in range(600):
  var e: Dictionary=main.native_demo_boss_actor.get("_enemy")
  var distance: float=main.player.global_position.distance_to(Vector2(e.get("x",0),e.get("y",0)))
  event.pressed=distance>210
  accepted=main.player.handle_native_input_event(event).get("accepted",false) or accepted
  await physics_frame
  if tick%120==0:print("ZOOM_LIVE ",tick," ",main.player.global_position," ",JSON.stringify(main.read_native_demo_boss()))
  var state: String=e.get("s","")
  if distance<420 and (state.ends_with("Wind") or state in ["bossSlam","bossSlash","bossSweep","bossSpin"]):
   event.pressed=false;main.player.handle_native_input_event(event)
   print("ZOOM_LIVE_CAPTURE state=",state," distance=",distance," input=",accepted," walked=",main.player.global_position.distance_to(start))
   await boards("boss_melee",.8,boss);captured=true;break
 event.pressed=false;main.player.handle_native_input_event(event)
 if not captured:await boards("boss_melee_attempt_IDLE_NOT_COMBAT",.8,boss)
 var f:=FileAccess.open(output.path_join("measurements.json"),FileAccess.WRITE)
 f.store_string(JSON.stringify({"rows":rows,"live_melee":captured,"input_accepted":accepted,"walk_distance":main.player.global_position.distance_to(start),"boss":main.read_native_demo_boss(),"user_dir":OS.get_user_data_dir()},"  "))
 main.free();await process_frame;quit(0 if captured else 6)
func sprite_bounds(sprite: Node2D,texture: Texture2D,offset: Vector2) -> Rect2:
 var used:=Rect2(texture.get_image().get_used_rect())
 var transform: Transform2D=sprite.global_transform
 return transform*Rect2(used.position+offset,used.size)
func player_bounds() -> Rect2:
 var sprite: AnimatedSprite2D=main.player._sprite
 var tex: Texture2D=sprite.sprite_frames.get_frame_texture(sprite.animation,sprite.frame)
 return sprite_bounds(sprite,tex,sprite.offset-tex.get_size()*.5 if sprite.centered else sprite.offset)
func boss_bounds(boss: Node2D) -> Rect2:
 var image: Image=boss.body.texture.get_image().get_region(Rect2i(boss.body.region_rect))
 return boss.body.global_transform*Rect2(Vector2(image.get_used_rect().position)+boss.body.offset,Vector2(image.get_used_rect().size))
func boards(id: String,base: float,boss: Node2D) -> void:
 # Pause only after a real published frame, retaining its actual telegraph.
 pause_nodes(main)
 main.source_intro_sequence._barrier.hide()
 main.player.show();main.player.modulate=Color.WHITE
 main.player._sprite.show();main.player._sprite.modulate=Color.WHITE
 main.camera.enabled=false
 if scene._fade_tween!=null:scene._fade_tween.kill()
 if is_instance_valid(scene._fade):scene._fade.color.a=0
 var multipliers: Array=[1.0,2.0,2.5,3.0] if selection=="all" else [float(selection)]
 for m in multipliers:
  if boss!=null:boss.scale=Vector2.ONE/m
  var zoom: float=base*m
  var p:=player_bounds()
  var union: Rect2=p
  if boss!=null:union=union.merge(boss_bounds(boss))
  var center: Vector2=main.player.global_position-Vector2(0,110)/zoom
  if boss!=null:
   center=union.get_center()+Vector2(0,32.5)/zoom
   # Keep the player visible even when the complete union cannot fit.
   var bottom: float=(p.end.y-center.y)*zoom+540
   if bottom>900:center.y+=(bottom-900)/zoom
  root.canvas_transform=Transform2D(Vector2(zoom,0),Vector2(0,zoom),Vector2(960,540)-center*zoom)
  for i in range(12):await process_frame
  await RenderingServer.frame_post_draw
  var path: String=output.path_join(id+"_x"+str(m)+".png")
  root.get_texture().get_image().save_png(path)
  var screen_p: Rect2=root.canvas_transform*p
  var screen_b:=Rect2()
  if boss!=null:screen_b=root.canvas_transform*boss_bounds(boss)
  var safe:=Rect2(700,115,520,785)
  rows.append({"scene":id,"multiplier":m,"player_px":screen_p.size.y,"boss_px":screen_b.size.y,"player_rect":str(screen_p),"boss_rect":str(screen_b),"both_fit":safe.encloses(screen_p) and (boss==null or safe.encloses(screen_b)),"world_width":1920.0/zoom,"path":path,"base_zoom":base})
 if boss!=null:boss.scale=Vector2.ONE
 main.camera.enabled=true
 for row in paused_nodes:
  if is_instance_valid(row[0]):
   row[0].set_process(row[1]);row[0].set_physics_process(row[2])
 paused_nodes.clear()

func pause_nodes(node: Node) -> void:
 paused_nodes.append([node,node.is_processing(),node.is_physics_processing()])
 node.set_process(false);node.set_physics_process(false)
 for child in node.get_children():pause_nodes(child)
