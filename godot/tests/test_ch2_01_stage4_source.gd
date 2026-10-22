extends SceneTree
## Pure source contract, never a Main/World or stage consumer.
const C=preload("res://port_modules/ch2_map_source/stage4_contract.gd")
const Stage0=preload("res://port_modules/ch1_map_source/producer.gd")
const Stage1=preload("res://port_modules/ch1_map_source/stage1_contract.gd")
const USERDIR := "EXODUSER-ch2-01-Isolated-20261020"
var checks:=0
var failed: Array=[]
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:
  failed.append(label)
  printerr("CH2_01_FAIL ",label)
func reject(raw: Variant,label: String) -> void:
 var result: Dictionary=C.read_area(raw)
 check(result.status=="NOT_READY" and not result.has("value") and is_same(result.raw,raw),label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false) \
   or not OS.get_user_data_dir().ends_with(USERDIR):
  printerr("CH2_01_ABORT isolated USERDIR required")
  quit(2)
  return
 var raw: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch2_map_source/si4.json"))
 var before:=JSON.stringify(raw)
 var result: Dictionary=C.read_area(raw)
 check(result.status=="READY","native_snapshot_ready:"+str(result.get("reason","")))
 if result.status!="READY":
  print("CH2_01_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed}))
  quit(1)
  return
 check(is_same(result.value,raw),"same_snapshot_reference")
 check(result.scope=="source_snapshot_only" and not result.runtime_bound and not result.full_stage_ready and not result.visual_verified,"source_only_not_full_stage")
 check(C.validate_area(raw).status=="READY","validate_api")
 check(raw.grid=={"width":200.0,"height":200.0,"tile_size":40.0},"grid200_T40")
 check(raw.tiles.size()==40000 and raw.runtime_tile_sha256==C.TILE_SHA,"complete_final_tile_grid")
 var counts: Array=[0,0,0,0,0]
 for v in raw.tiles:counts[int(v)]+=1
 check(counts==[10722,28395,3,0,880],"native_counts_no_type3_gate_tiles")
 check(raw.start_world==[4020.0,7420.0] and raw.start_tile==[100.0,185.0],"exact_native_start")
 check(raw.boss_gate.map(func(e):return [e.x,e.y])==[[99.0,31.0],[100.0,31.0],[101.0,31.0]],"gate_metadata_not_painted")
 check(raw.exits.map(func(e):return [e.x,e.y])==[[99.0,33.0],[100.0,33.0],[101.0,33.0]],"exits_y33")
 check(raw.rooms.size()==6 and raw.initial_obj_meta.size()==77 and raw.ch2_deco_raw.size()==47,"source_rooms_and_catalogs")
 check(raw.hand_props_raw.size()==105 and is_same(result.value.hand_props_raw,raw.hand_props_raw),"all_raw_hands_reference")
 var roles: Dictionary={};var zones: Dictionary={};var absent_rot:=0;var overlap:=0
 for h in raw.hand_props_raw:
  roles[h.role]=int(roles.get(h.role,0))+1;zones[h.zone]=true
  if not h.has("rot"):absent_rot+=1
  if h.has("overlap"):overlap+=1
 check(roles=={"backfill":9,"boundary":50,"landmark":18,"detail":6,"mask":4,"filler":12,"seam":6},"source_role_counts_not_runtime_objects")
 check(zones.size()==13 and absent_rot==78 and overlap==9,"zones_and_absent_optional_keys")
 check(raw.source_path.spec.pts.size()==22 and raw.source_path.spec.pts[7]==raw.source_path.spec.pts[9],"dead_end_repeated_point_preserved")
 check(raw.source_path.spec.w==30 and raw.source_path.spec.authoredWidth==1 and raw.source_path.editor_tile_rle.size()==798,"authored_path_width_and_initial_rle")
 var coverage:=0
 for i in range(1,798,2):coverage+=int(raw.source_path.editor_tile_rle[i])
 check(coverage==40000,"initial_editor_rle_coverage")
 check(raw.spawn_holes_final.size()==11 and raw.total_spawned==900 and raw.region_totals==[250.0,200.0,300.0,150.0],"native_ch2_budget_no_stage0_discount")
 check(raw.generation.random_draws==11 and raw.generation.random_final_state==998000637,"native_seed_draw_evidence")
 var files: Dictionary={}
 for a in raw.asset_refs:files[a.file]=true
 check(raw.asset_refs.size()==47 and files.size()==29 and raw.source.files.size()==31,"byte_references_only_no_image_load")
 check(raw.environment_refs.size()==1 and not raw.source.symbols.has("environment.baked_manifest") and not raw.has("source_geometry") and not raw.has("ch1_deco_raw"),"no_ch1_environment_claim")
 check(raw.source.symbols._CH2S4.line==17993 and raw.source.symbols["_MAP_COMPOSE.4"].line==18199,"latest_native_ast_lines")
 for i in 2:check(C.read_area(raw).status=="READY","repeated_read_"+str(i))
 check(JSON.stringify(raw)==before,"positive_reads_do_not_mutate")
 for value in [null,[],true,1,"snapshot"]:reject(value,"unsupported_type_"+str(typeof(value)))
 for field in raw.keys():
  var missing:=raw.duplicate(true);missing.erase(field);reject(missing,"missing_"+field)
 var bad: Dictionary
 for stage in [0,1,2,3,5,6,7,8,9]:
  bad=raw.duplicate(true);bad.stage=stage;reject(bad,"unsupported_stage_"+str(stage))
 bad=raw.duplicate(true);bad.tiles.pop_back();reject(bad,"tiles39999")
 bad=raw.duplicate(true);bad.tiles[0]=true;reject(bad,"boolean_tile_not_number")
 bad=raw.duplicate(true);bad.tiles[0]=1.5;reject(bad,"fractional_tile")
 bad=raw.duplicate(true)
 var floor_index: int=bad.tiles.find(0.0);var wall_index: int=bad.tiles.find(1.0)
 bad.tiles[floor_index]=1.0;bad.tiles[wall_index]=0.0;reject(bad,"equal_counts_wrong_tile_hash")
 bad=raw.duplicate(true);bad.runtime_tile_sha256="0".repeat(64);reject(bad,"declared_tile_hash_not_sufficient")
 bad=raw.duplicate(true);bad.total_spawned=168;reject(bad,"stage0_budget_rejected")
 bad=raw.duplicate(true);bad.region_totals=[250,300,250,200];reject(bad,"stage1_quadrants_rejected")
 bad=raw.duplicate(true);bad.spawn_holes_final.reverse();reject(bad,"hole_order")
 bad=raw.duplicate(true);bad.spawn_holes_final[0]=bad.spawn_holes_final[1];reject(bad,"duplicate_hole")
 bad=raw.duplicate(true);bad.spawn_holes_final[0].count=50;reject(bad,"hole_count")
 bad=raw.duplicate(true);bad.spawn_holes_final[0].alive=1;reject(bad,"source_hole_initial_alive")
 bad=raw.duplicate(true);bad.spawn_holes_final[0].timer=bad.spawn_holes_final[1].timer;reject(bad,"timer_draw_order")
 bad=raw.duplicate(true);bad.generation.random_final_state=0;reject(bad,"seed_final_state")
 bad=raw.duplicate(true);bad.generation.seed=-1;reject(bad,"negative_seed")
 bad=raw.duplicate(true);bad.generation.seed=4294967296;reject(bad,"seed_overflow")
 bad=raw.duplicate(true);bad.generation.random_draws=14;reject(bad,"stage1_draw_count")
 for i in 105:
  bad=raw.duplicate(true);bad.hand_props_raw[i].x+=1;reject(bad,"every_hand_coordinate_"+str(i))
 bad=raw.duplicate(true);bad.hand_props_raw.reverse();reject(bad,"hand_order")
 bad=raw.duplicate(true);bad.hand_props_raw[9].rot=null;reject(bad,"absent_is_not_null")
 bad=raw.duplicate(true);bad.hand_props_raw[0].overlap=0.17;reject(bad,"overlap_input")
 bad=raw.duplicate(true);bad.hand_props_raw[0].zone="changed";reject(bad,"zone_input")
 bad=raw.duplicate(true);bad.hand_props_raw[0].role="landmark";reject(bad,"role_input")
 for i in 47:
  bad=raw.duplicate(true);bad.ch2_deco_raw[i].file="wrong.png";reject(bad,"every_deco_file_"+str(i))
  bad=raw.duplicate(true);bad.asset_refs[i].sha256="0".repeat(64);reject(bad,"every_asset_sha_"+str(i))
 bad=raw.duplicate(true);bad.initial_obj_meta.pit_poison.colW=1;reject(bad,"base_catalog_pin")
 bad=raw.duplicate(true);bad.asset_refs[0].bytes=1;reject(bad,"asset_byte_count")
 bad=raw.duplicate(true);bad.source_path.spec.pts.remove_at(9);reject(bad,"repeated_path_point_not_deduplicated")
 bad=raw.duplicate(true);bad.source_path.spec.w=70;reject(bad,"legacy_min_width_not_applied")
 bad=raw.duplicate(true);bad.source_path.editor_tile_rle[1]+=1;reject(bad,"path_rle_not_repaired")
 bad=raw.duplicate(true);bad.source_path.empty[0].r=481;reject(bad,"source_empty_input")
 bad=raw.duplicate(true);bad.scope.runtime_bound=true;reject(bad,"runtime_binding_claim")
 bad=raw.duplicate(true);bad.scope.prop_colliders=[];reject(bad,"unobserved_not_empty")
 bad=raw.duplicate(true);bad.scope.save_access=true;reject(bad,"boolean_scope_number")
 bad=raw.duplicate(true);bad.undefined_paths=["/hand_props_raw/0/rot"];reject(bad,"undefined_mask_not_fabricated")
 bad=raw.duplicate(true);bad.ch1_deco_raw=[];reject(bad,"foreign_ch1_catalog")
 for field in ["schema","runtime_tile_sha256"]:
  bad=raw.duplicate(true);bad[field]=[];reject(bad,"wrong_scalar_type_"+field)
 for field in ["game_sha256","selection","files","symbols"]:
  bad=raw.duplicate(true);bad.source[field]=[];reject(bad,"source_shape_"+field)
 for field in raw.source.symbols:
  bad=raw.duplicate(true);bad.source.symbols[field].sha256="0".repeat(64);reject(bad,"every_native_symbol_"+field)
 check(Stage0.read_area(raw).status=="NOT_READY" and Stage1.read_area(raw).status=="NOT_READY","existing_contracts_do_not_claim_stage4")
 check(root.get_child_count()==0 and JSON.stringify(raw)==before,"no_nodes_or_input_writes")
 print("CH2_01_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed,
  "stage":4,"scope":"source_snapshot_only","main_boots":0,"world_boots":0,"runtime_bound":false,
  "user_save_io":0,"holes":11,"total":900,"region_totals":raw.region_totals,"visual_verified":false}))
 quit(0 if failed.is_empty() else 1)
