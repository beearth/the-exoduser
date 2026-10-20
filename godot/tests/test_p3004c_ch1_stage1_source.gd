extends SceneTree
## CH1-03 pure source contract test; no Main, World, stage consumer or user:// IO.
const C=preload("res://port_modules/ch1_map_source/stage1_contract.gd")
const Stage0=preload("res://port_modules/ch1_map_source/producer.gd")
const USERDIR := "EXODUSER-ch1-03-Isolated-20261020"
var checks:=0
var failed: Array=[]
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:
  failed.append(label)
  printerr("CH1_03_FAIL ",label)
func reject(raw: Variant,label: String) -> void:
 var result: Dictionary=C.read_area(raw)
 check(result.status=="NOT_READY" and not result.has("value") and is_same(result.raw,raw),label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false):
  printerr("CH1_03_ABORT isolated USERDIR required")
  quit(2)
  return
 var raw: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch1_map_source/si1.json"))
 var before:=JSON.stringify(raw)
 var result: Dictionary=C.read_area(raw)
 check(result.status=="READY" and is_same(result.value,raw),"native_snapshot_reference")
 check(result.scope=="source_snapshot_only" and not result.runtime_bound and not result.full_stage_ready and not result.visual_verified,"source_only_scope")
 check(C.validate_area(raw).status=="READY","validate_api")
 check(raw.stage==1 and raw.grid=={"width":200.0,"height":200.0,"tile_size":40.0},"stage1_grid")
 check(raw.tiles.size()==40000 and raw.runtime_tile_sha256=="c7994170661e29348e27bdad098020edcb761a11943e68bdea60f9d744236dc1","final_grid_hash")
 var counts: Array=[0,0,0,0,0]
 for v in raw.tiles:counts[int(v)]+=1
 check(counts==[13588,25590,3,0,819],"native_tile_counts_no_type3_tiles")
 check(raw.start_world==[4020.0,7420.0] and raw.start_tile==[100.0,185.0],"source_start")
 check(raw.boss_gate.map(func(e):return [e.x,e.y])==[[99.0,31.0],[100.0,31.0],[101.0,31.0]],"gate_metadata_y31")
 check(raw.exits.map(func(e):return [e.x,e.y])==[[99.0,33.0],[100.0,33.0],[101.0,33.0]],"exits_y33")
 check(raw.rooms.size()==6 and raw.hand_props_raw.size()==12,"raw_rooms_hands")
 check(raw.hand_props_raw.filter(func(h):return h.role=="LANDMARK").size()==5 and raw.hand_props_raw.filter(func(h):return h.role=="GAMEPLAY").size()==7,"roles5_7")
 var regions: Dictionary={}
 for h in raw.hand_props_raw:regions[h.region]=true
 check(regions.size()==7 and raw.source_geometry.regions.size()==7,"regions7_are_separate_from_four_quadrants")
 check(raw.source_geometry.mask.size()==40000 and raw.source_geometry.editor_tile_rle.size()==930,"native_mask_rle_separate")
 check(raw.source_geometry.spine.size()==15 and raw.source_geometry.widthSamples.size()==5 and raw.source_geometry.treeBlockRadius==9,"geometry_metadata")
 check(raw.spawn_holes_final.size()==13 and raw.total_spawned==1000 and raw.region_totals==[250.0,300.0,250.0,200.0],"read_only_stage1_hole_budget")
 check(raw.generation.random_draws==14 and raw.generation.random_final_state==3323445034,"candidate_timer_draws14_not_final_holes13")
 check(raw.source.symbols._CH1S1.line==17972 and raw.source.symbols["_MAP_COMPOSE.1"].line==18172,"actual_ast_line_evidence")
 check(raw.initial_obj_meta.size()==77 and raw.ch1_deco_raw.size()==110 and raw.undefined_paths.is_empty(),"shared_raw_catalog_not_runtime_merge")
 check(is_same(C.read_area(raw).value.hand_props_raw,raw.hand_props_raw),"nested_raw_array_reference")
 for i in 2:check(C.read_area(raw).status=="READY","repeat_read_"+str(i))
 check(JSON.stringify(raw)==before,"read_input_unchanged")
 for value in [null,[],true,1,"snapshot"]:reject(value,"unsupported_input_type_"+str(typeof(value)))
 for field in ["schema","stage","grid","source","tiles","rooms","hand_props_raw","source_geometry","spawn_holes_final","region_totals","scope","generation","environment_refs","undefined_paths","chapter_stages"]:
  var missing:=raw.duplicate(true);missing.erase(field);reject(missing,"missing_"+field)
 var bad:=raw.duplicate(true);bad.stage=0;reject(bad,"stage0_not_accepted")
 bad=raw.duplicate(true);bad.stage=2;reject(bad,"stage2_not_accepted")
 bad=raw.duplicate(true);bad.tiles.pop_back();reject(bad,"tiles39999")
 bad=raw.duplicate(true);bad.tiles[0]=true;reject(bad,"boolean_tile_not_number")
 bad=raw.duplicate(true)
 var floor_index: int=bad.tiles.find(0.0);var wall_index: int=bad.tiles.find(1.0)
 bad.tiles[floor_index]=1.0;bad.tiles[wall_index]=0.0;reject(bad,"same_counts_wrong_runtime_hash")
 bad=raw.duplicate(true);bad.total_spawned=999;reject(bad,"total999")
 bad=raw.duplicate(true);bad.region_totals[0]=249;reject(bad,"quadrant_total_mismatch")
 bad=raw.duplicate(true);bad.spawn_holes_final.reverse();reject(bad,"hole_order_not_repaired")
 bad=raw.duplicate(true);bad.hand_props_raw[0].x=84;reject(bad,"raw_hand_coordinates_not_nearFloor_repaired")
 bad=raw.duplicate(true);bad.hand_props_raw[0].role="GAMEPLAY";reject(bad,"landmark_role_mismatch")
 bad=raw.duplicate(true);bad.source.erase("game_sha256");reject(bad,"missing_source_sha")
 bad=raw.duplicate(true);bad.source.files.erase("assets/map/ch1/geometry/ch1_si1_geometry.js");reject(bad,"missing_geometry_provenance")
 bad=raw.duplicate(true);bad.source.symbols.erase("_CH1S1");reject(bad,"missing_authored_expression_provenance")
 bad=raw.duplicate(true);bad.source_geometry.mask[0]=1.0;reject(bad,"changed_source_mask")
 bad=raw.duplicate(true);bad.source_geometry.editor_tile_rle[1]-=1;reject(bad,"source_rle_coverage_change")
 bad=raw.duplicate(true);bad.source_geometry.regions.pop_back();reject(bad,"source_regions6")
 bad=raw.duplicate(true);bad.source_geometry.bypassPaths.left="unknown";reject(bad,"malformed_bypass_metadata")
 bad=raw.duplicate(true);bad.generation.random_draws=13;reject(bad,"final_hole_count_not_timer_draw_count")
 bad=raw.duplicate(true);bad.spawn_holes_final[8].timer=bad.spawn_holes_final[7].timer;reject(bad,"timer_rng_consumption_mismatch")
 bad=raw.duplicate(true);bad.scope.runtime_bound=true;reject(bad,"unimplemented_stage_consumer_claim")
 bad=raw.duplicate(true);bad.scope.prop_colliders=[];reject(bad,"unobserved_colliders_not_empty_array")
 bad=raw.duplicate(true);bad.undefined_paths.append("/hand_props_raw/0/scale");reject(bad,"undefined_carrier_not_fabricated_null")
 bad=raw.duplicate(true);bad.schema=[];reject(bad,"array_schema_rejected_without_script_error")
 bad=raw.duplicate(true);bad.source.game_sha256=[];reject(bad,"array_source_sha_rejected")
 bad=raw.duplicate(true);bad.source.selection=[];reject(bad,"array_selection_rejected")
 bad=raw.duplicate(true);bad.source.symbols._CH1S1.file=[];reject(bad,"array_symbol_file_rejected")
 bad=raw.duplicate(true);bad.generation.random_algorithm=[];reject(bad,"array_rng_evidence_rejected")
 bad=raw.duplicate(true);bad.source_geometry.regions[0].id=[];reject(bad,"array_region_name_rejected")
 bad=raw.duplicate(true);bad.source_geometry.mask_sha256=[];reject(bad,"array_mask_sha_rejected")
 bad=raw.duplicate(true);bad.runtime_tile_sha256=[];reject(bad,"array_runtime_sha_rejected")
 bad=raw.duplicate(true);bad.scope.runtime_bound=[];reject(bad,"array_scope_flag_rejected")
 check(Stage0.read_area(raw).status=="NOT_READY","existing_stage0_producer_still_rejects_stage1")
 check(JSON.stringify(raw)==before and root.get_child_count()==0,"no_input_mutation_Main_World_or_nodes")
 print("CH1_03_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed,
  "stage":1,"scope":"source_snapshot_only","main_boots":0,"world_boots":0,"runtime_bound":false,
  "user_save_io":0,"holes":13,"total":1000,"region_totals":raw.region_totals,"visual_verified":false}))
 quit(0 if failed.is_empty() else 1)
