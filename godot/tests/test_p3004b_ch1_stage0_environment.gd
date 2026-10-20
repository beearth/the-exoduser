extends SceneTree
## CH1-02 actual World static asset consumption. No Main/save/player simulation.
const USERDIR := "EXODUSER-ch1-02-Isolated-20261020"
const TREE_IDS := ["m_ctree17","m_ctree18","m_ctree19","m_ctree20"]
const TREE_FILES := ["rotforest_tree_05.png","rotforest_tree_11.png","rotforest_tree_06.png","rotforest_tree_07.png"]
var checks := 0
var failed: Array = []
var world: Node2D
var map: Dictionary
var mapping_observations: Array = []
var shots: Array = []
var output := ""
var baseline_dir := ""

func check(ok: bool, label: String) -> void:
 checks += 1
 if not ok:
  failed.append(label)
  printerr("CH1_02_FAIL ",label)

func _initialize() -> void:
 call_deferred("run")

func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  printerr("CH1_02_ABORT isolation required")
  quit(2)
  return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--capture="):output=arg.trim_prefix("--capture=")
  if arg.begins_with("--baseline="):baseline_dir=arg.trim_prefix("--baseline=")
 paused=true
 seed(20261020)
 map=JSON.parse_string(FileAccess.get_file_as_string("res://data/map.json"))
 world=load("res://scripts/world.gd").new()
 world.process_mode=Node.PROCESS_MODE_PAUSABLE
 root.add_child(world)
 check(world.ready_for_player,"actual_World_ready")
 check(world.map_data==map,"World_consumes_product_map")
 check(map.collision_rects.size()==292 and map.prop_colliders.size()==19 and map.props.size()==36 and map.chunks.size()==64,"preserved_counts")
 var registry: Dictionary=world.get_native_resource_load_snapshot()
 check(registry.loaded==36 and registry.failed==0,"all_actual_prop_textures_loaded")
 for i in TREE_IDS.size():
  var id: String=TREE_IDS[i]
  var data: Dictionary=map.props.filter(func(p):return p.id==id)[0]
  var sprite: Sprite2D=world.get_node_or_null(NodePath(id))
  check(is_instance_valid(sprite),"actual_sprite_"+id)
  if not is_instance_valid(sprite):continue
  check(sprite.texture.resource_path=="res://assets/map/props/"+TREE_FILES[i],"actual_texture_"+id)
  check(data.metadata.file==TREE_FILES[i],"source_file_"+id)
  var draw_size:=Vector2(data.draw_size[0],data.draw_size[1])
  var pivot:=Vector2(data.pivot[0],data.pivot[1])
  check((sprite.scale*sprite.texture.get_size()).is_equal_approx(draw_size),"draw_scale_preserved_"+id)
  check(sprite.offset.is_equal_approx(-sprite.texture.get_size()*pivot),"pivot_preserved_"+id)
  check(sprite.position.is_equal_approx(Vector2(data.position[0],data.position[1])),"anchor_preserved_"+id)
  mapping_observations.append(world.get_native_source_object_entry(id))
 for chunk in map.chunks:
  var texture: Texture2D=load(chunk.texture)
  check(texture!=null and texture.get_size()==Vector2(1026,1026),"chunk_texture_"+str(chunk.x)+"_"+str(chunk.y))
  check(chunk.source_rect==[1.0,1.0,1024.0,1024.0] and chunk.world_rect[2]==1000 and chunk.world_rect[3]==1000,"chunk_crop_world_"+str(chunk.x)+"_"+str(chunk.y))
 world.call("_update_visible_chunks",Vector2(4020,7420),true)
 var publication: Dictionary=world.get_native_baked_environment_publication()
 check(not publication.ready and publication.reason=="actual_baked_owner_missing","standalone_does_not_impersonate_Main_publication")
 var admitted: Dictionary=world.get("_chunks")
 check(not admitted.is_empty(),"actual_World_chunk_nodes_exist")
 for key in admitted:
  var sprite: Sprite2D=admitted[key]
  var data: Dictionary=map.chunks.filter(func(c):return str(c.x)+","+str(c.y)==str(key))[0]
  check(sprite.texture.resource_path==data.texture and sprite.region_enabled and sprite.region_rect==Rect2(1,1,1024,1024),"actual_chunk_crop_"+str(key))
  check((sprite.scale*Vector2(1024,1024)).is_equal_approx(Vector2(1000,1000)),"actual_chunk_world_scale_"+str(key))
 check(registry.source_mapping_complete==false and registry.full_stage_ready==false,"no_full_source_or_stage_claim")
 if not output.is_empty():
  if DisplayServer.get_name()=="headless" or baseline_dir.is_empty():
   check(false,"GPU_and_explicit_baseline_required_for_capture")
  else:
   await capture_board()
 world.free()
 for i in 4:await process_frame
 print("CH1_02_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed,
  "scope":"static_environment_only","main_boots":0,"simulation_ticks":0,"user_save_io":0,
  "mapping_observations":mapping_observations,"full_source_mapping_ready":false,
  "camera_shots":shots,"visual_verified":false,"renderer":RenderingServer.get_current_rendering_method(),
  "driver":RenderingServer.get_current_rendering_driver_name(),"adapter":RenderingServer.get_video_adapter_name(),"userdir":OS.get_user_data_dir()}))
 quit(0 if failed.is_empty() else 1)

func capture_board() -> void:
 root.size=Vector2i(1920,1080)
 root.gui_disable_input=true
 DirAccess.make_dir_recursive_absolute(output)
 var camera:=Camera2D.new()
 camera.process_mode=Node.PROCESS_MODE_ALWAYS
 camera.zoom=Vector2.ONE
 camera.position_smoothing_enabled=false
 root.add_child(camera)
 camera.make_current()
 # Frozen actual World. No player injection, AI tick or combat verdict.
 for enemy in world.get_enemies():enemy.visible=false
 var baseline: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(baseline_dir.path_join("map.before.json")))
 var views := [
  ["START",map.regions[0].anchor],["EARLY",map.regions[1].anchor],["ARENA",map.regions[2].anchor],
  ["SIDE_L",map.regions[3].anchor],["SIDE_R",[176,96]],["LANDMARK",map.regions[4].anchor],
  ["LATE",map.regions[6].anchor],["EXIT",map.regions[7].anchor]]
 for view in views:
  var center:=Vector2((view[1][0]+0.5)*40,(view[1][1]+0.5)*40)
  camera.position=center
  camera.reset_smoothing()
  camera.force_update_scroll()
  world.call("_update_visible_chunks",center,true)
  var changed: Array=[]
  # Only this isolated World's render textures are temporarily replaced for BEFORE.
  # Product files, map state, colliders and source-owner declarations are untouched.
  for sprite in world.get_children():
   if not sprite is Sprite2D or sprite.texture==null:continue
   var resource: String=sprite.texture.resource_path
   if not resource.begins_with("res://assets/map/"):continue
   var relative:=resource.trim_prefix("res://")
   var before_path:=baseline_dir.path_join("before/godot/"+relative)
   if TREE_IDS.has(str(sprite.name)):
    var old: Dictionary=baseline.props.filter(func(p):return p.id==str(sprite.name))[0]
    before_path=ProjectSettings.globalize_path(old.texture)
   if not FileAccess.file_exists(before_path):continue
   var image:=Image.load_from_file(before_path)
   check(image!=null,"baseline_byte_image_"+str(sprite.name))
   if image==null:continue
   changed.append({"sprite":sprite,"texture":sprite.texture,"scale":sprite.scale,"offset":sprite.offset})
   var size: Vector2=sprite.texture.get_size()
   sprite.texture=ImageTexture.create_from_image(image)
   sprite.scale*=size/sprite.texture.get_size()
   sprite.offset*=sprite.texture.get_size()/size
  var before_file:=await shot(str(view[0])+"_before")
  for state in changed:
   state.sprite.texture=state.texture
   state.sprite.scale=state.scale
   state.sprite.offset=state.offset
  var after_file:=await shot(str(view[0])+"_after")
  shots.append({"camera":view[0],"center":[center.x,center.y],"zoom":1,"before":before_file,"after":after_file})
 camera.free()

func shot(label: String) -> String:
 for i in 3:await process_frame
 await RenderingServer.frame_post_draw
 var image:=root.get_texture().get_image()
 check(image!=null and image.get_size()==Vector2i(1920,1080),"real_capture_"+label)
 if image==null:return ""
 var target:=output.path_join(label+".png")
 check(image.save_png(target)==OK,"save_capture_"+label)
 return target
