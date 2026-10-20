extends SceneTree
const C=preload("res://port_modules/ch2_map_source/stage7_contract.gd")
const Stage4=preload("res://port_modules/ch2_map_source/stage4_contract.gd")
const Stage1=preload("res://port_modules/ch1_map_source/stage1_contract.gd")
const Stage0=preload("res://port_modules/ch1_map_source/producer.gd")
const USERDIR := "EXODUSER-ch2-05-Isolated-20261020"
var checks:=0
var failed: Array=[]

func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failed.append(label);printerr("CH2_05_SOURCE_FAIL ",label)

func reject(raw: Variant,label: String) -> void:
 var result: Dictionary=C.read_area(raw)
 check(result.status=="NOT_READY" and not result.has("value") and is_same(result.raw,raw),label)

func _initialize() -> void:call_deferred("run")

func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR \
  or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false) or not OS.get_user_data_dir().ends_with(USERDIR):
  printerr("CH2_05_SOURCE_ABORT isolation required");quit(2);return
 var raw: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch2_map_source/si7.json"))
 var before:=JSON.stringify(raw)
 var result: Dictionary=C.read_area(raw)
 check(result.status=="READY","native_snapshot_ready:"+str(result.get("reason","")))
 if result.status!="READY":finish(raw);return
 check(is_same(result.value,raw),"same_input_reference")
 check(result.scope=="source_snapshot_only" and result.source_only_stage==7 and not result.runtime_bound and not result.full_stage_ready and not result.visual_verified,"no_runtime_or_visual_claim")
 check(C.validate_area(raw).status=="READY","validate_api")
 check(raw.grid=={"width":200.0,"height":200.0,"tile_size":40.0} and raw.tiles.size()==40000,"grid200_T40")
 var counts: Array=[0,0,0,0,0]
 for tile in raw.tiles:counts[int(tile)]+=1
 check(counts==[38986,36,3,0,975],"native_tile_counts")
 check(raw.runtime_tile_sha256==C.TILE_SHA,"native_final_tile_hash")
 check(raw.hand_props_raw==null and raw.compose_raw==null and C.same(raw.undefined_paths,C.UNDEFINED_PATHS),"undefined_carriers_not_empty_arrays")
 check(raw.source_path.spec==null and raw.source_path.empty==null and raw.source_path.editor_tile_rle==[1.0,40000.0],"no_si4_authored_path")
 check(C.same(raw.stage_descriptor,C.DESCRIPTOR),"native_stage7_descriptor")
 check(raw.start_world==[4020.0,7420.0] and raw.exit_center_tile==[100.0,7.0],"start_and_exit")
 check(raw.boss_gate.map(func(e):return [e.x,e.y])==[[99.0,5.0],[100.0,5.0],[101.0,5.0]],"gate_metadata_y5_no_type3_tiles")
 check(raw.spawn_holes_final.size()==14 and raw.total_spawned==1100 and raw.region_totals==[250.0,300.0,350.0,200.0],"native_holes_population_quadrants")
 check(raw.generation.random_draws==14 and raw.generation.random_final_state==3323445034,"all14_draws_match14_final_holes")
 check(raw.initial_obj_meta.size()==77 and raw.ch2_deco_raw.size()==47 and raw.asset_refs.size()==47,"shared_catalog_byte_references")
 check(raw.source.symbols.has("_MAP_COMPOSE.absent.7") and not raw.source.symbols.has("_CH2S4"),"absence_record_pins_parent_ast")
 seed(61733)
 var next:=randf()
 seed(61733)
 for i in 2:check(C.read_area(raw).status=="READY","repeated_pure_read_"+str(i))
 check(randf()==next,"contract_does_not_advance_global_rng")
 check(JSON.stringify(raw)==before,"positive_read_input_unchanged")
 for value in [null,[],true,1,"snapshot"]:reject(value,"unsupported_type_"+str(typeof(value)))
 var bad: Dictionary
 for key in raw:
  bad=raw.duplicate(true);bad.erase(key);reject(bad,"missing_"+key)
 bad=raw.duplicate(true);bad.extra="invented";reject(bad,"unknown_top_level")
 for stage in [0,1,2,3,4,5,6,8,9]:
  bad=raw.duplicate(true);bad.stage=stage;reject(bad,"unsupported_stage_"+str(stage))
 for key in ["hand_props_raw","compose_raw"]:
  for value in [[],{},false]:
   bad=raw.duplicate(true);bad[key]=value;reject(bad,"undefined_not_"+str(value)+key)
 for key in ["spec","empty"]:
  bad=raw.duplicate(true);bad.source_path[key]=[];reject(bad,"path_absent_not_array_"+key)
 bad=raw.duplicate(true);bad.undefined_paths=[];reject(bad,"null_not_undefined")
 bad=raw.duplicate(true);bad.undefined_paths.reverse();reject(bad,"ordered_undefined_mask")
 bad=raw.duplicate(true);bad.source_path.editor_tile_rle=[1,39999];reject(bad,"floor_rle_not_repaired")
 bad=raw.duplicate(true);bad.source_path.editor_tile_rle_sha256="0".repeat(64);reject(bad,"floor_input_hash")
 bad=raw.duplicate(true);bad.stage_descriptor.bn="벌레 수호자";reject(bad,"si4_boss_not_si7")
 bad=raw.duplicate(true);bad.stage_descriptor.isHellBoss=true;reject(bad,"not_chapter_final_boss")
 bad=raw.duplicate(true);bad.tiles.pop_back();reject(bad,"incomplete_tiles")
 for value in [true,1.5,-1,5,"0"]:
  bad=raw.duplicate(true);bad.tiles[0]=value;reject(bad,"invalid_tile_"+str(value))
 bad=raw.duplicate(true)
 var floor_index: int=bad.tiles.find(0.0);var wall_index: int=bad.tiles.find(1.0)
 bad.tiles[floor_index]=1.0;bad.tiles[wall_index]=0.0;reject(bad,"same_counts_wrong_tile_hash")
 bad=raw.duplicate(true);bad.runtime_tile_sha256="0".repeat(64);reject(bad,"declared_hash_insufficient")
 bad=raw.duplicate(true);bad.total_spawned=168;reject(bad,"stage0_population_rejected")
 bad=raw.duplicate(true);bad.region_totals=[250,200,300,150];reject(bad,"si4_quadrants_rejected")
 bad=raw.duplicate(true);bad.exits[0].y=33;reject(bad,"si4_destination_rejected")
 bad=raw.duplicate(true);bad.spawn_holes_final.reverse();reject(bad,"hole_order")
 bad=raw.duplicate(true);bad.spawn_holes_final[0]=bad.spawn_holes_final[1];reject(bad,"duplicate_holes")
 for i in 14:
  for key in ["x","y","size","room","count","alive","timer"]:
   bad=raw.duplicate(true);bad.spawn_holes_final[i][key]+=1;reject(bad,"hole_"+str(i)+key)
 bad=raw.duplicate(true);bad.spawn_holes_final[7].timer=bad.spawn_holes_final[8].timer;reject(bad,"native_timer_order_not_reassigned")
 for key in ["seed","random_draws","random_final_state"]:
  bad=raw.duplicate(true);bad.generation[key]=-1;reject(bad,"bad_generation_"+key)
 bad=raw.duplicate(true);bad.generation.seed=4294967296;reject(bad,"seed_overflow")
 for i in 47:
  bad=raw.duplicate(true);bad.ch2_deco_raw[i].file="wrong.png";reject(bad,"catalog_"+str(i))
  bad=raw.duplicate(true);bad.asset_refs[i].sha256="0".repeat(64);reject(bad,"asset_hash_"+str(i))
 for key in raw.source.symbols:
  bad=raw.duplicate(true);bad.source.symbols[key].sha256="0".repeat(64);reject(bad,"source_symbol_"+key)
 for key in ["main_sha","extraction_head","game_sha256","files","symbols","selection"]:
  bad=raw.duplicate(true);bad.source[key]=[];reject(bad,"source_type_"+key)
 for key in raw.scope:
  bad=raw.duplicate(true);bad.scope[key]=[];reject(bad,"scope_"+key)
 check(Stage0.read_area(raw).status=="NOT_READY" and Stage1.read_area(raw).status=="NOT_READY" and Stage4.read_area(raw).status=="NOT_READY","prior_contracts_do_not_claim_si7")
 var old: Variant=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch2_map_source/si4.json"))
 reject(old,"si4_not_coerced_to_si7")
 check(root.get_child_count()==0 and JSON.stringify(raw)==before,"no_nodes_save_io_or_input_writes")
 finish(raw)

func finish(raw: Dictionary) -> void:
 print("CH2_05_SOURCE_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed,"stage":7,
  "holes":raw.spawn_holes_final.size(),"total":raw.total_spawned,"region_totals":raw.region_totals,
  "scope":"source_snapshot_only","runtime_bound":false,"world_boots":0,"main_boots":0,"user_save_io":0,"visual_verified":false}))
 quit(1 if failed.size()>0 else 0)
