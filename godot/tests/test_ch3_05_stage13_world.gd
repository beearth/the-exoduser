extends SceneTree
const USERDIR := "EXODUSER-ch3-05-Isolated-20261020"
const Reader=preload("res://scripts/native_ch3_stage13_area_resources.gd")
var assertions:=0
var failures: Array=[]
var world: Node2D
var oracle_path:=""
var capture_path:=""
var captures: Array=[]
var traversal_steps:=0
func check(ok: bool,label: String) -> void:
 assertions+=1
 if not ok:
  failures.append(label)
  printerr("CH3_05_FAIL ",label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false) or not OS.get_user_data_dir().ends_with(USERDIR):
  printerr("CH3_05_ABORT actual isolated userdir required");quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--oracle="):oracle_path=arg.trim_prefix("--oracle=")
  if arg.begins_with("--capture="):capture_path=arg.trim_prefix("--capture=")
 if oracle_path.is_empty() or not FileAccess.file_exists(oracle_path):
  printerr("CH3_05_ABORT explicit UTF-8 source oracle required");quit(2);return
 var source_oracle: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(oracle_path))
 check(source_oracle.schema=="exoduser.ch3-area-oracle.v1" and source_oracle.queries.size()==6870 and source_oracle.los.size()==400,"full_original_source_oracle")
 world=load("res://scenes/ch3_stage13_area_preview.tscn").instantiate()
 world.preview_active=false;root.add_child(world)
 await physics_frame
 await process_frame
 check(world.ready_for_fixture,"standalone_scene_ready")
 if not world.ready_for_fixture:
  printerr(world.resource_errors);world.free();quit(1);return
 check(world.resource_errors.is_empty() and world.textures.size()==12,"12_original_byte_textures_loaded")
 check(root.get_node_or_null("Main")==null and root.get_node_or_null("World")==null,"no_Main_or_product_World")
 check(world.get_script().resource_path=="res://scripts/native_ch3_stage13_area_world.gd","independent_si13_consumer")
 check(world.raw.stage==13 and world.raw.tiles.size()==40000 and world.raw.start_world==[4020.0,7420.0] and world.raw.exit_center_tile==[100.0,7.0],"source_grid_start_exit")
 check(world.raw.total_spawned==950 and world.raw.region_totals==[150.0,300.0,350.0,150.0] and not world.raw.region_details[2].cleared,"P3_si13_denominators_preserved_unbound")
 check(world.bundle.scope.main_bound==false and world.bundle.scope.real_player_bound==false and world.bundle.scope.spawn_holes_bound==false and world.bundle.scope.region_progress_bound==false and world.bundle.scope.transition_bound==false,"all_product_owners_unbound")
 check(world.bundle.scope.stage0_hill==false and world.bundle.scope.stage0_baked_chunks==0 and world.bundle.scope.physical_prop_shapes==false,"no_CH1_hill_or_chunks_or_prop_physics_claim")
 var skipped: Array=[];var moved:=0;var placed:=0
 for a in world.bundle.hand_adjustments:
  if not a.placed:
   skipped.append(a.index);continue
  placed+=1
  if a.moved:moved+=1
  var p: Dictionary=world.bundle.props[int(a.prop_index)]
  check(p.type==a.id and p.x==a.world[0] and p.y==a.world[1],"source_effective_anchor_"+str(a.index))
 check(placed==20 and moved==0 and skipped.is_empty(),"native20_placed0_moved0_skipped")
 check(world.sprites.size()==20 and world.altar_markers==0 and world.lore_markers==0 and world.bundle.props.size()==21,"sprites20_plus_hidden_gate_no_altar")
 var index:=0;var crop_count:=0
 for p in world.bundle.props:
  if not p.get("_hand",0):continue
  var sprite: Sprite2D=world.sprites[index];index+=1
  check(sprite.get_meta("source_texture_path")==p.texture and sprite.position==Vector2(p.x,p.y),"texture_anchor_"+str(index))
  check(sprite.region_rect==Rect2(p.source_rect[0],p.source_rect[1],p.source_rect[2],p.source_rect[3]),"source_atlas_crop_"+str(index))
  check(sprite.scale.is_equal_approx(Vector2(p.draw_size[0]/p.source_size[0],p.draw_size[1]/p.source_size[1])),"source_draw_scale_"+str(index))
  var py: float=1.0 if p.metadata.get("anchorBottom",false) else float(p.pivot[1])
  check(sprite.offset.is_equal_approx(Vector2(-p.source_size[0]*p.pivot[0]+p.trim_offset[0],-p.source_size[1]*py+p.trim_offset[1])),"source_trim_pivot_"+str(index))
  check(is_equal_approx(sprite.rotation,deg_to_rad(float(p.rotation))) and sprite.flip_h==p.flip_h and is_equal_approx(sprite.modulate.a,float(p.alpha)),"source_rotation_flip_alpha_"+str(index))
  var layer: int=int(p.metadata.get("_renderLayer") if p.metadata.get("_renderLayer")!=null else 0)
  check(sprite.get_parent().y_sort_enabled and sprite.get_parent().z_index==layer,"source_y_sort_layer_"+str(index))
  if p.metadata.get("srcRect")!=null:crop_count+=1
 check(crop_count==0,"source0_crop_instances")
 check(world.bundle.colliders.size()==9 and world.bundle.colliders.filter(func(c):return c.shape=="rect").size()==0 and world.bundle.colliders.filter(func(c):return c.shape=="ellipse").size()==0,"9_shapes_9circles0ellipse")
 check(world.point_lights.size()==4 and world.display_shadows.size()==8 and is_instance_valid(world.ambient),"Godot_MAP_LOOK_display_layers_present")
 check(not world.bundle.scope.source_filter_pixel_parity and not world.bundle.scope.source_edge_erase_pixel_parity,"no_CSS_or_edge_pixel_parity_claim")
 var coverage:=PackedInt32Array();coverage.resize(40000);coverage.fill(0)
 check(world.walls.get_child_count()==4,"actual4_tile_Physics2D_rectangles")
 for r in world.bundle.wall_rects:
  for y in range(int(r[1]),int(r[1]+r[3])):
   for x in range(int(r[0]),int(r[0]+r[2])):coverage[y*200+x]+=1
 var union_mismatch:=0;var physics_mismatch:=0
 var query:=PhysicsPointQueryParameters2D.new();query.collision_mask=1;query.collide_with_areas=false
 var space: PhysicsDirectSpaceState2D=world.get_world_2d().direct_space_state
 for i in 40000:
  var expected: int=1 if int(world.raw.tiles[i])==1 else 0
  if coverage[i]!=expected:union_mismatch+=1
  query.position=Vector2((i%200+.5)*40,(int(i/200)+.5)*40)
  if (not space.intersect_point(query,1).is_empty())!=(expected==1):physics_mismatch+=1
 check(union_mismatch==0 and physics_mismatch==0,"40000cell_exact_tile_union_and_actual_Physics2D")
 var wall_mismatch:=0;var move_mismatch:=0;var los_mismatch:=0;var numeric_carrier_changes:=0
 for q in source_oracle.queries:
  var bits:=Marshalls.base64_to_raw(q.f64);var x:=bits.decode_double(0);var y:=bits.decode_double(8);var r:=bits.decode_double(16)
  if x!=q.x or y!=q.y:numeric_carrier_changes+=1
  if world.is_wall_xy(x,y)!=q.wall:wall_mismatch+=1
  if world.can_move_xy(x,y,r)!=q.move:move_mismatch+=1
 for q in source_oracle.los:
  var bits:=Marshalls.base64_to_raw(q.f64)
  if world.has_los_xy(bits.decode_double(0),bits.decode_double(8),bits.decode_double(16),bits.decode_double(24))!=q.clear:los_mismatch+=1
 check(wall_mismatch==0,"source6870_isW_difference_"+str(wall_mismatch))
 check(move_mismatch==0,"source6870_canMv_difference_"+str(move_mismatch))
 check(los_mismatch==0,"source400_LOS_difference_"+str(los_mismatch))
 var immutable_before:=JSON.stringify(world.raw)+JSON.stringify(world.bundle)
 world.set_preview_look(false)
 for q in source_oracle.queries.slice(0,256):
  var bits:=Marshalls.base64_to_raw(q.f64)
  check(world.is_wall_xy(bits.decode_double(0),bits.decode_double(8))==q.wall and world.can_move_xy(bits.decode_double(0),bits.decode_double(8),bits.decode_double(16))==q.move,"look_OFF_preserves_native_query")
 check(JSON.stringify(world.raw)+JSON.stringify(world.bundle)==immutable_before,"look_A_B_preserves_all_source_inputs")
 world.set_preview_look(true)
 var route: Array[Vector2]=world.route_to_exit()
 check(route.size()>170,"START_EXIT_route_with_radius12_and_rotated_props")
 var blocking_tile: Array=world.bundle.wall_rects[0]
 check(not world.move_fixture_to(Vector2((blocking_tile[0]+.5)*40,(blocking_tile[1]+.5)*40)),"swept_fixture_cannot_teleport_across_native_wall")
 for p in route:
  if not world.move_fixture_to(p):check(false,"source_route_swept_fixture_blocked");break
  traversal_steps+=1
 check(not route.is_empty() and traversal_steps==route.size() and world.actor.position==Vector2(4020,300),"fixture_reaches_exit_without_product_transition")
 check(world.get_node_or_null("SpawnHoles")==null and world.get_node_or_null("Enemies")==null,"no_enemy_hole_owners")
 for key in ["stage","source","assets","props","colliders","wall_rects","hand_adjustments","scope"]:
  var bad: Dictionary=world.bundle.duplicate(true);bad[key]=null
  check(not Reader.new().read_resources(world.raw,bad).ready,"reader_rejects_corrupt_"+key)
 check(not Reader.new().read_resources(world.raw,[]).ready,"reader_rejects_array_without_script_error")
 for a in world.bundle.assets:check(FileAccess.get_sha256(a.texture)==a.sha256,"original_bytes_after_scene_"+a.texture)
 if not capture_path.is_empty():
  if DisplayServer.get_name()=="headless":check(false,"GPU_capture_required")
  else:await capture_views(route)
 var result: Dictionary={"assertions":assertions,"failures":failures.size(),"failed":failures,"main_boots":0,"world_boots":1,"real_player_boots":0,"user_save_io":0,"source_queries":[6870,6870,400],"differential_mismatch":[wall_mismatch,move_mismatch,los_mismatch],"json_numeric_carrier_changes":numeric_carrier_changes,"tile_union_mismatch":union_mismatch,"physics_center_mismatch":physics_mismatch,"route_steps":traversal_steps,"textures_loaded":world.textures.size(),"source_pixel_parity":false,"product_transition_bound":false,"full_stage_ready":false,"camera_shots":captures,"renderer":RenderingServer.get_current_rendering_method(),"driver":RenderingServer.get_current_rendering_driver_name(),"adapter":RenderingServer.get_video_adapter_name()}
 world.free();await process_frame
 print("CH3_05_RESULT "+JSON.stringify(result));quit(0 if failures.is_empty() else 1)

func capture_views(route: Array[Vector2]) -> void:
 root.size=Vector2i(1920,1080);root.gui_disable_input=true
 DirAccess.make_dir_recursive_absolute(capture_path)
 world.camera.enabled=true;world.camera.make_current()
 var views: Array=[["START",[100,185]],["EARLY",[114,156]],["ARENA",[100,100]],["SIDE_L",[81,90]],["SIDE_R",[118,164]],["LANDMARK",[86,100]],["LATE",[108,46]],["EXIT",[100,7]]]
 for view in views:
  world.camera.global_position=Vector2((view[1][0]+.5)*40,(view[1][1]+.5)*40);world.camera.force_update_scroll()
  for i in 3:await process_frame
  await RenderingServer.frame_post_draw
  var image:=root.get_texture().get_image();var file: String=capture_path.path_join(view[0]+".png")
  check(image.save_png(file)==OK,"GPU_capture_"+view[0]);captures.append({"name":view[0],"file":file,"size":[image.get_width(),image.get_height()]})
 world.camera.global_position=Vector2(4020,4020);world.camera.force_update_scroll()
 world.set_preview_look(false)
 for i in 3:await process_frame
 await RenderingServer.frame_post_draw
 var off_image:=root.get_texture().get_image();var off_file: String=capture_path.path_join("ARENA_LOOK_OFF.png")
 check(off_image.save_png(off_file)==OK,"GPU_capture_ARENA_LOOK_OFF")
 captures.append({"name":"ARENA_LOOK_OFF","file":off_file,"size":[off_image.get_width(),off_image.get_height()]})
 world.set_preview_look(true)
 # Brief fixture sweep, never reported as combat FPS.
 var frame_count:=0;var begin:=Time.get_ticks_usec()
 for direction in [route.duplicate(),route.duplicate()]:
  if frame_count>0:direction.reverse()
  world.actor.position=direction[0];world.camera.position=Vector2.ZERO
  for i in direction.size():
   check(world.move_fixture_to(direction[i]),"rendered_swept_route_"+str(frame_count)+"_"+str(i))
   if i%4!=0:continue
   world.camera.force_update_scroll();await process_frame;frame_count+=1
 captures.append({"rendered_fixture_frames":frame_count,"elapsed_ms":float(Time.get_ticks_usec()-begin)/1000.0,"scope":"short fixture sweep; no combat FPS claim"})
