extends SceneTree
const USERDIR := "EXODUSER-ch1-05-Isolated-20261020"
const Composition = preload("res://port_modules/ch1_map_source/stage2_composition.gd")
const Reader = preload("res://scripts/native_ch1_area_resources.gd")
var assertions := 0
var failures: Array=[]
var world: Node2D
var oracle_path := ""
var capture_path := ""
var captures: Array=[]
var traversal_steps := 0

func check(ok: bool,label: String) -> void:
 assertions+=1
 if not ok:
  failures.append(label)
  printerr("CH1_05_FAIL ",label)

func _initialize() -> void:
 call_deferred("run")

func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  printerr("CH1_05_ABORT isolation required")
  quit(2)
  return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--oracle="):oracle_path=arg.trim_prefix("--oracle=")
  if arg.begins_with("--capture="):capture_path=arg.trim_prefix("--capture=")
 if oracle_path.is_empty() or not FileAccess.file_exists(oracle_path):
  printerr("CH1_05_ABORT explicit original VM oracle required")
  quit(2)
  return
 var oracle: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(oracle_path))
 var raw: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch1_map_source/si2.json"))
 var bundle: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch1_map_source/si2_resources.json"))
 var before: Dictionary=bundle.duplicate(true)
 var result: Dictionary=Composition.assemble(raw,bundle)
 check(result.status=="READY","pure_composition_READY")
 if result.status!="READY":
  printerr("CH1_05_COMPOSITION_REJECT ",result.reason)
  quit(1)
  return
 check(bundle==before,"pure_composition_does_not_mutate_input")
 check(is_same(result.props,bundle.props) and is_same(result.raw,raw),"pure_raw_and_props_references")
 check(result.objects==bundle.raw_objects and result.objects.size()==292,"292_final_source_order")
 check(result.passes.size()==8,"eight_source_passes")
 for pass_data in result.passes:
  check(pass_data.objects.size()==int(Composition.PHASES[pass_data.id]),"source_pass_"+pass_data.id)
 check(Composition.is_retired("m_flesh") and not Composition.is_retired("m_flesh_ball"),"retired_exact_ID_not_prefix")
 check(bundle.retired_types.size()==34 and result.full_stage_ready==false and result.main_bound==false,"retired_set34_unbound")
 for key in ["stage","schema","tile","compose","hand","RLE_flag","initial_object","budget","hole","object_payload","phase","retired","props","asset_count","collider","scope"]:
  var r: Dictionary=raw.duplicate(true)
  var b: Dictionary=bundle.duplicate(true)
  match key:
   "stage":r.stage=3
   "schema":r.schema=[]
   "tile":r.tiles[0]=1
   "compose":r.composition_raw.groves[0].r=901
   "hand":r.hand_props_raw=[]
   "RLE_flag":r.source_state.is_tile_rle=false
   "initial_object":r.source_state.initial_map_objects=[]
   "budget":r.total_spawned=999
   "hole":r.spawn_holes_final[0].x+=40
   "object_payload":b.object_payload+=" "
   "phase":b.phase_pushes[0].phase="mega"
   "retired":b.retired_types.erase("m_flesh")
   "props":b.props[1].x+=40
   "asset_count":b.assets.pop_back()
   "collider":b.colliders[0].f64="bad"
   "scope":b.scope.spawn_holes_bound=true
  var reject: Dictionary=Composition.assemble(r,b)
  check(reject.status=="NOT_READY" and not reject.has("value"),"reject_"+key)
 var unsupported: Node2D=load("res://scripts/native_ch1_area_world.gd").new()
 unsupported.area_stage=5
 unsupported.preview_active=false
 root.add_child(unsupported)
 check(not unsupported.ready_for_fixture and unsupported.resource_errors==["unsupported_area_stage"],"unsupported_area_stage_never_falls_back_to_si1")
 unsupported.free()
 var scene: PackedScene=load("res://scenes/ch1_stage2_preview.tscn")
 world=scene.instantiate()
 world.preview_active=false
 root.add_child(world)
 await physics_frame
 await process_frame
 check(world.ready_for_fixture,"actual_stage2_preview_scene_ready")
 if not world.ready_for_fixture:
  printerr(world.resource_errors)
  world.free()
  quit(1)
  return
 check(world.area_stage==2 and world.raw.stage==2,"explicit_stage2_selection")
 check(world.resource_errors.is_empty() and world.textures.size()==51,"actual51_textures_loaded_error0")
 check(world.composition_passes.size()==8,"actual_consumer_uses_composition")
 check(root.get_node_or_null("Main")==null and root.get_node_or_null("World")==null,"no_product_Main_World")
 check(world.raw.total_spawned==1000 and world.raw.region_totals==[250.0,300.0,250.0,200.0],"P3_readonly_denominators")
 check(world.get_node_or_null("Vista")==null and world.bundle.scope.stage0_baked_chunks==0 and world.bundle.scope.stage0_hill==false,"no_si1_vista_stage0_chunks_hill")
 check(world.sprites.size()==291 and world.walls.get_child_count()==4,"actual_sprite291_tile_shapes4")
 var index:=0
 var eye_count:=0
 var alpha_count:=0
 var anchor_count:=0
 var rotation_count:=0
 var flip_count:=0
 for p in world.bundle.props:
  if p.view!="sprite":continue
  var sprite: Sprite2D=world.sprites[index]
  index+=1
  check(int(sprite.get_meta("source_index"))==int(p.source_index) and sprite.position==Vector2(p.x,p.y),"source_anchor_index_"+str(index))
  var current: Texture2D=sprite.texture
  if p.has("atlas"):
   eye_count+=1
   check(current is AtlasTexture and current.atlas.resource_path==p.texture and current.region.size==Vector2(40,40),"actual_eye_atlas_"+str(index))
  else:check(current.resource_path==p.texture,"current_texture_"+str(index))
  check((sprite.scale*current.get_size()).is_equal_approx(Vector2(p.draw_size[0],p.draw_size[1])),"actual_draw_branch_"+str(index))
  var expected_offset:=Vector2(-current.get_size().x*.5,-current.get_size().y if p.anchor_bottom else -current.get_size().y*.5)
  check(sprite.offset.is_equal_approx(expected_offset) and is_equal_approx(sprite.rotation,deg_to_rad(float(p.rotation))) and sprite.flip_h==p.flip_h,"actual_pivot_rotation_flip_"+str(index))
  if p.hard_alpha or p.magenta_key:
   alpha_count+=1
   check(sprite.material is ShaderMaterial,"actual_runtime_alpha_key_"+str(index))
  if p.anchor_bottom:anchor_count+=1
  if p.rotation!=0:rotation_count+=1
  if p.flip_h:flip_count+=1
 check(eye_count==13 and alpha_count==26 and anchor_count==15 and rotation_count==7 and flip_count==68,"current_renderer_branch_totals")
 check(world._analytic_colliders.size()==47,"47_exact_analytic_colliders")
 var coverage:=PackedInt32Array()
 coverage.resize(40000)
 coverage.fill(0)
 for r in world.bundle.wall_rects:
  for y in range(int(r[1]),int(r[1]+r[3])):
   for x in range(int(r[0]),int(r[0]+r[2])):coverage[y*200+x]+=1
 var union_mismatch:=0
 var physics_mismatch:=0
 var query:=PhysicsPointQueryParameters2D.new()
 query.collision_mask=1
 query.collide_with_areas=false
 var space: PhysicsDirectSpaceState2D=world.get_world_2d().direct_space_state
 for i in 40000:
  var expected:=1 if int(world.raw.tiles[i])==1 else 0
  if coverage[i]!=expected:union_mismatch+=1
  query.position=Vector2((i%200+.5)*40,(int(i/200)+.5)*40)
  if (not space.intersect_point(query,1).is_empty())!=(expected==1):physics_mismatch+=1
 check(union_mismatch==0 and physics_mismatch==0,"40000cells_actual_physics_exact36_tile1_union")
 check(oracle.stage==2 and oracle.queries.size()==8262 and oracle.los.size()==400 and oracle.object_sha256==Composition.OBJECT_SHA,"complete_source_oracle")
 var wall_mismatch:=0
 var move_mismatch:=0
 var los_mismatch:=0
 for q in oracle.queries:
  var bits:=Marshalls.base64_to_raw(q.f64)
  var x:=bits.decode_double(0)
  var y:=bits.decode_double(8)
  var radius:=bits.decode_double(16)
  if world.is_wall_xy(x,y)!=q.wall:wall_mismatch+=1
  if world.can_move_xy(x,y,radius)!=q.move:move_mismatch+=1
 for q in oracle.los:
  var bits:=Marshalls.base64_to_raw(q.f64)
  if world.has_los_xy(bits.decode_double(0),bits.decode_double(8),bits.decode_double(16),bits.decode_double(24))!=q.clear:los_mismatch+=1
 check(wall_mismatch==0,"8262_original_isW_mismatch_"+str(wall_mismatch))
 check(move_mismatch==0,"8262_original_canMv_mismatch_"+str(move_mismatch))
 check(los_mismatch==0,"400_original_LOS_mismatch_"+str(los_mismatch))
 var route: Array[Vector2]=world.route_to_exit()
 check(route.size()>175,"source_START_EXIT_BFS_radius12")
 check(not world.move_fixture_to(Vector2(4020,160)),"source_generator_boss_gate_collider_blocks")
 if not route.is_empty():
  for p in route:
   if not world.move_fixture_to(p):break
   traversal_steps+=1
  check(traversal_steps==route.size() and world.actor.position==Vector2(4020,300),"actual_fixture_START_EXIT_no_transition")
 check(world.get_node_or_null("Enemies")==null and world.get_node_or_null("SpawnHoles")==null,"P3_factory_unbound")
 var bad: Dictionary=bundle.duplicate(true)
 bad.assets[0].texture="res://assets/map/ch1_si1/ground_dark_soil.png"
 check(not Reader.new().read_resources(raw,bad).ready,"resource_owner_scope_reject")
 bad=bundle.duplicate(true)
 bad.assets[0].sha256="wrong"
 check(not Reader.new().read_resources(raw,bad).ready,"resource_byte_corruption_reject")
 if not capture_path.is_empty():
  if DisplayServer.get_name()=="headless":check(false,"GPU_capture_requires_real_driver")
  else:
   await check_alpha_materials()
   await capture_views(route)
 var summary: Dictionary={"assertions":assertions,"failures":failures.size(),"failed":failures,"scope":"si2_standalone_observed_composition","objects":292,"live_sprites":291,"phases":bundle.phase_counts,"object_sha256":Composition.OBJECT_SHA,"main_boots":0,"product_world_boots":0,"preview_boots":1,"real_player_boots":0,"user_save_io":0,"source_queries":[8262,8262,400],"mismatches":[wall_mismatch,move_mismatch,los_mismatch],"union_mismatch":union_mismatch,"physics_center_mismatch":physics_mismatch,"route_steps":traversal_steps,"textures_loaded":world.textures.size(),"resource_errors":world.resource_errors,"camera_shots":captures,"renderer":RenderingServer.get_current_rendering_method(),"adapter":RenderingServer.get_video_adapter_name(),"full_stage_ready":false,"P3_owner_bound":false,"transition_bound":false}
 world.free()
 await process_frame
 print("CH1_05_RESULT "+JSON.stringify(summary))
 quit(0 if failures.is_empty() else 1)

func capture_views(route: Array[Vector2]) -> void:
 root.size=Vector2i(1920,1080)
 root.gui_disable_input=true
 DirAccess.make_dir_recursive_absolute(capture_path)
 world.camera.enabled=true
 world.camera.make_current()
 var views: Array=[["START",[100,185]],["EARLY",[100,158]],["ARENA",[100,124]],["SIDE_L",[56,70]],["SIDE_R",[144,76]],["LANDMARK",[148,84]],["LATE",[100,45]],["EXIT",[100,7]]]
 for view in views:
  world.camera.global_position=Vector2((view[1][0]+.5)*40,(view[1][1]+.5)*40)
  world.camera.force_update_scroll()
  for i in 3:await process_frame
  await RenderingServer.frame_post_draw
  var image:=root.get_texture().get_image()
  var file: String=capture_path.path_join(view[0]+".png")
  check(image.save_png(file)==OK,"GPU_capture_"+view[0])
  captures.append({"name":view[0],"center":[world.camera.global_position.x,world.camera.global_position.y],"file":file,"size":[image.get_width(),image.get_height()]})
 var frames:=0
 var begin:=Time.get_ticks_usec()
 for direction in [route.duplicate(),route.duplicate()]:
  if frames>0:direction.reverse()
  world.actor.position=direction[0]
  world.camera.position=Vector2.ZERO
  for index in direction.size():
   check(world.move_fixture_to(direction[index]),"GPU_sweep_move_"+str(frames)+"_"+str(index))
   if index%4!=0:continue
   world.camera.force_update_scroll()
   await process_frame
   frames+=1
 captures.append({"traversal_frames":frames,"elapsed_ms":float(Time.get_ticks_usec()-begin)/1000.0,"performance_scope":"fixture sweep; caller argv FPS cap; not combat benchmark","seam_model":"one world-space floor mesh; no chunks"})

func check_alpha_materials() -> void:
 # Actual view materials, synthetic in-memory 2x1 fixtures only; original PNG bytes stay untouched.
 for kind in ["hard_alpha","magenta_key"]:
  var source_sprite: Sprite2D=null
  for sprite in world.sprites:
   var p: Dictionary=world.bundle.props[int(sprite.get_meta("source_index"))]
   if p.get(kind,false):
    source_sprite=sprite
    break
  if source_sprite==null:
   check(false,"alpha_material_missing_"+kind)
   continue
  var fixture:=Image.create(2,1,false,Image.FORMAT_RGBA8)
  fixture.set_pixel(0,0,Color(1,0,0,1))
  fixture.set_pixel(1,0,Color(0,1,0,254.0/255.0) if kind=="hard_alpha" else Color(1,0,1,1))
  var viewport:=SubViewport.new()
  viewport.size=Vector2i(64,16)
  viewport.transparent_bg=true
  viewport.disable_3d=true
  viewport.world_2d=World2D.new()
  viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS
  var view:=Sprite2D.new()
  view.texture=ImageTexture.create_from_image(fixture)
  view.material=source_sprite.material
  view.centered=false
  view.scale=Vector2(32,16)
  viewport.add_child(view)
  root.add_child(viewport)
  for i in 3:await process_frame
  await RenderingServer.frame_post_draw
  var rendered:=viewport.get_texture().get_image()
  var middle:=rendered.get_pixel(31,8)
  check(middle.a>.45 and middle.a<.60 and middle.r>.45 and middle.g<.02 and middle.b<.02,"source_key_before_native_linear_filter_"+kind)
  captures.append({"shader_pixel_probe":kind,"rgba":[middle.r,middle.g,middle.b,middle.a],"fixture":"memory2x1; not game screenshot"})
  viewport.free()
