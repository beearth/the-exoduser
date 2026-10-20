extends SceneTree
const USERDIR := "EXODUSER-ch2-04-Isolated-20261020"
const Reader = preload("res://scripts/native_ch2_stage5_area_resources.gd")
var assertions := 0
var failures: Array = []
var world: Node2D
var oracle_path := ""
var capture_path := ""
var captures: Array = []
var traversal_steps := 0

func check(ok: bool,label: String) -> void:
 assertions += 1
 if not ok:
  failures.append(label)
  printerr("CH2_04_FAIL ",label)

func _initialize() -> void:
 call_deferred("run")

func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  printerr("CH2_04_ABORT isolated userdir required")
  quit(2)
  return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--oracle="):oracle_path=arg.trim_prefix("--oracle=")
  if arg.begins_with("--capture="):capture_path=arg.trim_prefix("--capture=")
 if oracle_path.is_empty() or not FileAccess.file_exists(oracle_path):
  printerr("CH2_04_ABORT explicit source VM oracle required; run export_ch2_area_resources.mjs")
  quit(2)
  return
 var source_oracle: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(oracle_path))
 check(source_oracle.queries.size()==10038 and source_oracle.los.size()==400,"oracle_full_count")
 var scene: PackedScene=load("res://scenes/ch2_stage5_area_preview.tscn")
 world=scene.instantiate()
 world.preview_active=false
 root.add_child(world)
 await physics_frame
 await process_frame
 check(world.ready_for_fixture,"standalone_scene_ready")
 if not world.ready_for_fixture:
  printerr(world.resource_errors)
  world.free()
  quit(1)
  return
 check(world.resource_errors.is_empty() and world.textures.size()==12,"all12_resources_loaded_no_missing")
 check(root.get_node_or_null("Main")==null and root.get_node_or_null("World")==null,"no_Main_or_product_World")
 check(world.get_script().resource_path=="res://scripts/native_ch2_stage5_area_world.gd","independent_consumer")
 check(world.raw.stage==5 and world.raw.tiles.size()==40000,"actual_si5_source")
 check(world.raw.start_world==[4020.0,7420.0] and world.raw.exit_center_tile==[100.0,7.0],"actual_start_exit7")
 check(world.raw.total_spawned==900 and world.raw.region_totals==[250.0,300.0,250.0,100.0],"P3_denominators_unchanged_unbound")
 check(world.raw.source_path.spec==null and world.raw.hand_props_raw==null,"absent_hand_path_not_invented")
 check(world.bundle.scope.stage0_hill==false and world.bundle.scope.stage0_baked_chunks==0,"no_stage0_hill_or64_chunks")
 check(world.bundle.scope.main_bound==false and world.bundle.scope.real_player_bound==false and world.bundle.scope.spawn_holes_bound==false and world.bundle.scope.region_progress_bound==false and world.bundle.scope.transition_bound==false,"owner_boundaries")
 check(world.bundle.hand_adjustments.is_empty(),"no_hand_adjustment_for_undefined_hand")
 check(world.sprites.size()==271 and world.lore_markers==0,"actual271_sprites_no_invented_system_objects")
 check(world.source_glows.size()==156,"source156_light_overlays_no_rng")
 for glow in world.source_glows:
  check(glow.global_scale.is_equal_approx(Vector2.ONE) and glow.position==Vector2.ZERO,"source_glow_world80_anchor")
 var sprite_index:=0
 var square_count:=0
 var ar_count:=0
 for p in world.bundle.props:
  if p.get("view")=="collision_only":continue
  var sprite: Sprite2D=world.sprites[sprite_index]
  sprite_index+=1
  if p.metadata.keepAR:ar_count+=1
  else:square_count+=1
  check(sprite.get_meta("source_texture_path")==p.texture,"original_texture_reference_"+str(sprite_index))
  check(sprite.position==Vector2(p.x,p.y),"actual_anchor_"+str(sprite_index))
  check((sprite.scale*sprite.texture.get_size()).is_equal_approx(Vector2(p.draw_size[0],p.draw_size[1])),"draw_size_"+str(sprite_index))
  check(sprite.offset.is_equal_approx(-sprite.texture.get_size()*Vector2(p.pivot[0],p.pivot[1])),"center_pivot_"+str(sprite_index))
  check(is_equal_approx(sprite.rotation,deg_to_rad(float(p.rotation))) and sprite.flip_h==p.flip_h,"rotation_flip_"+str(sprite_index))
  check(is_equal_approx(sprite.modulate.a,float(p.alpha)),"source_alpha_"+str(sprite_index))
  check(sprite.get_parent().y_sort_enabled and sprite.get_parent().z_index==0,"y_sort_layer0_"+str(sprite_index))
 check(square_count==234 and ar_count==37,"native234_square_37_keepAR")
 check(world.bundle.source.initial_objects==[{"type":"boss_gate_col","x":4020.0,"y":160.0}] and world.bundle.colliders.size()==42,"native_initial_gate_and42_analytic_circles")
 check(world.bundle.scope.physical_prop_shapes==false,"prop_physics_not_falsely_claimed")
 var keyed: Dictionary={}
 for p in world.bundle.props:
  if not p.get("_hand",0) or p.image_keying=="none":continue
  var key: String=p.texture+":"+p.image_keying
  if keyed.has(key):continue
  keyed[key]=true
  var original: Image=world.textures[p.texture].get_image().duplicate()
  original.convert(Image.FORMAT_RGBA8)
  var original_bytes:=original.get_data()
  var derived: Image=world.display_textures[key].get_image()
  derived.convert(Image.FORMAT_RGBA8)
  var derived_bytes:=derived.get_data()
  var rgb_mismatch:=0
  var alpha_increase:=0
  for i in range(0,original_bytes.size(),4):
   if original_bytes[i]!=derived_bytes[i] or original_bytes[i+1]!=derived_bytes[i+1] or original_bytes[i+2]!=derived_bytes[i+2]:rgb_mismatch+=1
   if derived_bytes[i+3]>original_bytes[i+3]:alpha_increase+=1
  check(original_bytes.size()==derived_bytes.size() and rgb_mismatch==0 and alpha_increase==0,"private_alpha_only_texture_"+key)
  check(FileAccess.get_sha256(p.texture)==world.bundle.assets.filter(func(a):return a.texture==p.texture)[0].sha256,"original_file_bytes_unchanged_"+key)
 var coverage := PackedInt32Array()
 coverage.resize(40000)
 coverage.fill(0)
 check(world.walls.get_child_count()==4,"actual4_static_shapes")
 for r in world.bundle.wall_rects:
  for y in range(int(r[1]),int(r[1]+r[3])):
   for x in range(int(r[0]),int(r[0]+r[2])):
    coverage[y*200+x]+=1
 var union_mismatch := 0
 var physics_mismatch := 0
 var query := PhysicsPointQueryParameters2D.new()
 query.collision_mask=1
 query.collide_with_areas=false
 var space: PhysicsDirectSpaceState2D=world.get_world_2d().direct_space_state
 for i in 40000:
  var expected: int=1 if int(world.raw.tiles[i])==1 else 0
  if coverage[i]!=expected:union_mismatch+=1
  query.position=Vector2((i%200+.5)*40,(int(i/200)+.5)*40)
  var collision: Array[Dictionary]=space.intersect_point(query,1)
  if (not collision.is_empty())!=(expected==1):physics_mismatch+=1
 check(union_mismatch==0,"40000cell_exact_nonoverlap_tile1_union")
 check(physics_mismatch==0,"40000cell_actual_physics_tile1_union")
 var wall_mismatch := 0
 var move_mismatch := 0
 var los_mismatch := 0
 var json_numeric_rounding := 0
 for q in source_oracle.queries:
  var bits := Marshalls.base64_to_raw(q.f64)
  var x := bits.decode_double(0)
  var y := bits.decode_double(8)
  var r := bits.decode_double(16)
  if x!=q.x or y!=q.y:json_numeric_rounding+=1
  if world.is_wall_xy(x,y)!=q.wall:wall_mismatch+=1
  if world.can_move_xy(x,y,r)!=q.move:move_mismatch+=1
 for q in source_oracle.los:
  var bits := Marshalls.base64_to_raw(q.f64)
  if world.has_los_xy(bits.decode_double(0),bits.decode_double(8),bits.decode_double(16),bits.decode_double(24))!=q.clear:los_mismatch+=1
 check(wall_mismatch==0,"10038_source_isW_differential_mismatch_"+str(wall_mismatch))
 check(move_mismatch==0,"10038_source_canMv_differential_mismatch_"+str(move_mismatch))
 check(los_mismatch==0,"400_source_LOS_differential_mismatch_"+str(los_mismatch))
 var route: Array[Vector2]=world.route_to_exit()
 check(route.size()>150,"START_EXIT_BFS_exists_with_radius12")
 check(not world.move_fixture_to(Vector2(-100,-100)),"fixture_rejects_swept_cross_wall_teleport")
 if not route.is_empty():
  for p in route:
   if not world.move_fixture_to(p):
    check(false,"actual_fixture_route_traversal_blocked")
    break
   traversal_steps+=1
  check(traversal_steps==route.size() and world.actor.position==Vector2(4020,300),"actual_fixture_traverse_to_exit_no_transition")
 check(world.get_node_or_null("SpawnHoles")==null and world.get_node_or_null("Enemies")==null,"no_holes_or_enemies_installed")
 var bad: Dictionary=world.bundle.duplicate(true)
 bad.stage=0
 check(not Reader.new().read_resources(world.raw,bad).ready,"reject_stage0_resources")
 bad=world.bundle.duplicate(true)
 bad.source.game_sha256="different"
 check(not Reader.new().read_resources(world.raw,bad).ready,"reject_wrong_source")
 bad=world.bundle.duplicate(true)
 bad.assets[0].texture="res://assets/map/props/prop_camp.png"
 check(not Reader.new().read_resources(world.raw,bad).ready,"reject_other_owner_texture")
 bad=world.bundle.duplicate(true)
 bad.props[1].x+=40
 check(not Reader.new().read_resources(world.raw,bad).ready,"reject_object_anchor_corruption")
 bad=world.bundle.duplicate(true);bad.colliders[0].rx+=1
 check(not Reader.new().read_resources(world.raw,bad).ready,"reject_collider_corruption")
 check(not Reader.new().read_resources(world.raw,[]).ready,"reject_array_bundle_without_script_error")
 if not capture_path.is_empty():
  if DisplayServer.get_name()=="headless":
   check(false,"capture_requires_GPU")
  else:
   await capture_views(route)
 var result: Dictionary={"assertions":assertions,"failures":failures.size(),"failed":failures,"world_boots":1,"main_boots":0,"real_player_boots":0,"user_save_io":0,"source_query_counts":[10038,10038,400],"differential_mismatch":[wall_mismatch,move_mismatch,los_mismatch],"oracle_numeric_carrier":"IEEE754 LE base64; native inputs unchanged","json_numeric_rounding":json_numeric_rounding,"tile_union_mismatch":union_mismatch,"physics_center_mismatch":physics_mismatch,"route_steps":traversal_steps,"textures_loaded":world.textures.size(),"resource_errors":world.resource_errors,"camera_shots":captures,"renderer":RenderingServer.get_current_rendering_method(),"driver":RenderingServer.get_current_rendering_driver_name(),"adapter":RenderingServer.get_video_adapter_name(),"product_transition_bound":false,"full_stage_ready":false}
 world.free()
 await process_frame
 print("CH2_04_RESULT "+JSON.stringify(result))
 quit(0 if failures.is_empty() else 1)

func capture_views(route: Array[Vector2]) -> void:
 root.size=Vector2i(1920,1080)
 root.gui_disable_input=true
 DirAccess.make_dir_recursive_absolute(capture_path)
 world.camera.enabled=true
 world.camera.make_current()
 var views := [["START",[100,185]],["EARLY",[95,155]],["ARENA",[100,120]],["SIDE_L",[56,85]],["SIDE_R",[146,74]],["LANDMARK",[100,100]],["LATE",[120,50]],["EXIT",[100,7]]]
 for view in views:
  world.camera.global_position=Vector2((view[1][0]+.5)*40,(view[1][1]+.5)*40)
  world.camera.force_update_scroll()
  for i in 3:await process_frame
  await RenderingServer.frame_post_draw
  var image:=root.get_texture().get_image()
  var file: String=capture_path.path_join(view[0]+".png")
  check(image.save_png(file)==OK,"GPU_capture_"+view[0])
  captures.append({"name":view[0],"center":[world.camera.global_position.x,world.camera.global_position.y],"file":file,"size":[image.get_width(),image.get_height()]})
 # A real frame-by-frame sweep crosses native floor UV tiles; two route directions exercise re-entry.
 var frame_count := 0
 var begin := Time.get_ticks_usec()
 for direction in [route.duplicate(),route.duplicate()]:
  if frame_count>0:direction.reverse()
  world.actor.position=direction[0]
  world.camera.position=Vector2.ZERO
  for index in direction.size():
   check(world.move_fixture_to(direction[index]),"rendered_fixture_route_"+str(frame_count)+"_"+str(index))
   if index%4!=0:continue
   world.camera.force_update_scroll()
   await process_frame
   frame_count+=1
 captures.append({"traversal_frames":frame_count,"elapsed_ms":float(Time.get_ticks_usec()-begin)/1000.0,"seam_model":"single world-space tiled floor mesh; no chunk swaps","performance_scope":"fixture sweep; FPS cap is caller argv; not combat FPS benchmark"})
