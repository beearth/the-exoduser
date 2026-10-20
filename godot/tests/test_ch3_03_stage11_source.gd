extends SceneTree
## Source-only admission. No Main, World, asset load, actor or save owner.
const C=preload("res://port_modules/ch3_map_source/stage11_contract.gd")
const Stage10=preload("res://port_modules/ch3_map_source/stage10_contract.gd")
const Stage4=preload("res://port_modules/ch2_map_source/stage4_contract.gd")
const USERDIR="EXODUSER-ch3-03-Isolated-20261020"
var checks:=0
var failed: Array=[]
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:
  failed.append(label)
  printerr("CH3_03_FAIL ",label)
func reject(raw: Variant,label: String) -> void:
 var before:=JSON.stringify(raw)
 var result: Dictionary=C.read_area(raw)
 check(result.status=="NOT_READY" and not result.has("value") and is_same(result.raw,raw) and JSON.stringify(raw)==before,label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false) or not OS.get_user_data_dir().ends_with(USERDIR):
  printerr("CH3_03_ABORT isolated USERDIR required")
  quit(2)
  return
 var raw: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch3_map_source/si11.json"))
 var before:=JSON.stringify(raw)
 seed(20261020);var expected_next:=randi();seed(20261020)
 var result: Dictionary=C.read_area(raw)
 check(result.status=="READY","source_ready:"+str(result.get("reason","")))
 if result.status!="READY":
  print("CH3_03_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed}))
  quit(1)
  return
 check(randi()==expected_next,"pure_contract_does_not_advance_global_RNG")
 check(is_same(result.value,raw) and is_same(result.value.hand_props_raw,raw.hand_props_raw),"same_source_references")
 check(result.source_only_stage==11 and result.scope=="source_snapshot_only" and not result.runtime_bound and not result.visual_verified and not result.full_stage_ready,"source_only_no_runtime_or_visual_claim")
 check(C.validate_area(raw).status=="READY","validate_api")
 var counts: Array=[0,0,0,0,0]
 for v in raw.tiles:counts[int(v)]+=1
 check(counts==[38986,36,3,0,975],"all40000_native_tiles")
 check(raw.hand_props_raw.size()==18 and raw.ch3_deco_raw.size()==61 and raw.cross_deco_raw.is_empty() and raw.initial_obj_meta.size()==77,"raw18_catalog61_base77_no_cross")
 check(raw.hand_props_raw.filter(func(h):return not h.has("scale")).size()==9 and raw.hand_props_raw.all(func(h):return not h.has("rot")),"source_absent_scale_and_rotation_not_filled")
 check(raw.source_floor.editor_tile_rle==[1.0,40000.0] and not raw.has("source_basin") and not raw.has("source_path"),"default_floor_not_si10_basin_or_CH2_path")
 check(not raw.selector_evidence.dungeon_spec.ready and not raw.selector_evidence.is_dungeon and not raw.selector_evidence.is_face and raw.selector_evidence.selected_size==[200.0,200.0],"unready_dungeon_default200_field")
 check(raw.stage_descriptor.bn=="서리의 기사" and raw.stage_descriptor.hell==2 and raw.stage_descriptor.hellFloor==1 and not raw.stage_descriptor.isHellBoss,"original_stage_descriptor_not_actor")
 check(raw.guard_evidence.actual_tile==4 and not raw.guard_evidence.predicate_met and raw.guard_evidence.required_tile==0,"guard_candidate_tile4_not_spawned_actor")
 check(raw.start_world==[4020.0,7420.0] and raw.exit_center_tile==[100.0,7.0],"native_START_exit")
 for x in [99,100,101]:check(raw.tiles[5*200+x]==0 and raw.tiles[7*200+x]==2,"metadata_gate_without_code3_"+str(x))
 check(raw.spawn_holes_final.size()==13 and raw.total_spawned==1050 and raw.region_totals==[350.0,300.0,250.0,150.0],"native_holes_budget_and_quadrants")
 check(raw.region_details.all(func(r):return not r.cleared and r.fbIdx==-1),"no_empty_region_or_CH1_fieldboss_invented")
 check(raw.generation.random_draws==13 and raw.generation.random_final_state==2962398007,"13_native_timer_draws")
 var files: Dictionary={}
 for a in raw.asset_refs:files[a.file]=true
 check(raw.asset_refs.size()==61 and files.size()==35 and raw.source.files.size()==38,"source_image_byte_references_only")
 for i in 3:check(C.read_area(raw).status=="READY","repeat_"+str(i))
 check(JSON.stringify(raw)==before and root.get_child_count()==0,"positive_read_immutable_no_nodes")
 for value in [null,[],true,1,"snapshot"]:reject(value,"type_"+str(typeof(value)))
 for key in raw.keys():
  var missing:=raw.duplicate(true);missing.erase(key);reject(missing,"missing_"+key)
 var bad: Dictionary
 for stage in [0,1,4,10,12,13,true,"11",11.1]:
  bad=raw.duplicate(true);bad.stage=stage;reject(bad,"wrong_stage_"+str(stage))
 bad=raw.duplicate(true);bad.tiles.pop_back();reject(bad,"tiles39999")
 for v in [true,1.5,-1,5]:
  bad=raw.duplicate(true);bad.tiles[0]=v;reject(bad,"tile_type_or_range_"+str(v))
 bad=raw.duplicate(true)
 var fi: int=bad.tiles.find(0.0);var wi: int=bad.tiles.find(1.0)
 bad.tiles[fi]=1;bad.tiles[wi]=0;reject(bad,"same_counts_different_grid")
 bad=raw.duplicate(true);bad.runtime_tile_sha256="0".repeat(64);reject(bad,"false_tile_hash")
 for i in 18:
  bad=raw.duplicate(true);bad.hand_props_raw[i].x+=1;reject(bad,"every_hand_"+str(i))
 bad=raw.duplicate(true);bad.hand_props_raw.reverse();reject(bad,"hand_order")
 bad=raw.duplicate(true);bad.hand_props_raw[3].scale=1;reject(bad,"absent_scale_not_one")
 bad=raw.duplicate(true);bad.hand_props_raw[0].rot=0;reject(bad,"absent_rot_not_zero")
 for i in 61:
  bad=raw.duplicate(true);bad.ch3_deco_raw[i].file="wrong.png";reject(bad,"every_catalog_file_"+str(i))
  bad=raw.duplicate(true);bad.asset_refs[i].sha256="0".repeat(64);reject(bad,"every_asset_pin_"+str(i))
 for key in raw.source.symbols:
  bad=raw.duplicate(true);bad.source.symbols[key].sha256="0".repeat(64);reject(bad,"every_source_symbol_"+key)
 for key in raw.source.files:
  bad=raw.duplicate(true);bad.source.files[key]="0".repeat(64);reject(bad,"every_source_file_"+key)
 for field in ["main_sha","game_sha256","extraction_head"]:
  bad=raw.duplicate(true);bad.source[field]="wrong";reject(bad,"source_provenance_"+field)
 for i in 13:
  bad=raw.duplicate(true);bad.spawn_holes_final[i].timer+=1;reject(bad,"each_timer_"+str(i))
  bad=raw.duplicate(true);bad.spawn_holes_final[i].x+=40;reject(bad,"each_hole_"+str(i))
 bad=raw.duplicate(true);bad.spawn_holes_final.reverse();reject(bad,"hole_order")
 bad=raw.duplicate(true);bad.spawn_holes_final[0].alive=1;reject(bad,"alive_not_initial_zero")
 bad=raw.duplicate(true);bad.total_spawned=650;reject(bad,"not_si10_budget")
 bad=raw.duplicate(true);bad.region_totals=[300,350,250,150];reject(bad,"same_sum_wrong_region")
 bad=raw.duplicate(true);bad.region_details[2].cleared=true;reject(bad,"SW_not_si10_empty")
 bad=raw.duplicate(true);bad.region_details[0].fbIdx=0;reject(bad,"no_CH1_angler")
 bad=raw.duplicate(true);bad.source_floor.editor_tile_rle[1]=39999;reject(bad,"source_floor_corrupt")
 bad=raw.duplicate(true);bad.selector_evidence.dungeon_spec.ready=true;reject(bad,"dungeon_not_ready")
 bad=raw.duplicate(true);bad.selector_evidence.selected_size=[300,300];reject(bad,"not_docs300")
 bad=raw.duplicate(true);bad.guard_evidence.predicate_met=true;reject(bad,"false_guard_admission")
 bad=raw.duplicate(true);bad.stage_descriptor.bn="unknown";reject(bad,"source_boss_name")
 bad=raw.duplicate(true);bad.stage_descriptor.isHellBoss=true;reject(bad,"not_chapter_last")
 bad=raw.duplicate(true);bad.compose_raw.handProps.pop_back();reject(bad,"compose_preserves18")
 bad=raw.duplicate(true);bad.cross_deco_raw=[{}];reject(bad,"no_cross_from_si10")
 bad=raw.duplicate(true);bad.ground_asset.bytes=1;reject(bad,"ground_bytes")
 bad=raw.duplicate(true);bad.source_basin={};reject(bad,"foreign_basin")
 bad=raw.duplicate(true);bad.undefined_paths=["/hand_props_raw"];reject(bad,"not_missing_hands")
 bad=raw.duplicate(true);bad.generation.random_final_state=0;reject(bad,"seed_final_state")
 bad=raw.duplicate(true);bad.generation.random_draws=7;reject(bad,"not_si10_timer_draws")
 for v in [-1,4294967296,true,1.5]:
  bad=raw.duplicate(true);bad.generation.seed=v;reject(bad,"bad_seed_"+str(v))
 for key in ["runtime_bound","visual_verified"]:
  bad=raw.duplicate(true);bad.scope[key]=true;reject(bad,"unsupported_claim_"+key)
 bad=raw.duplicate(true);bad.scope.prop_colliders=[];reject(bad,"not_observed_is_not_empty")
 # Alternate seed evidence must be explicitly provided by the UTF-8 Node harness.
 var alternate_path:=""
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--alternate="):alternate_path=arg.trim_prefix("--alternate=")
 check(not alternate_path.is_empty() and FileAccess.file_exists(alternate_path),"explicit_alternate_seed_evidence")
 if not alternate_path.is_empty() and FileAccess.file_exists(alternate_path):
  var alternate: Variant=JSON.parse_string(FileAccess.get_file_as_string(alternate_path))
  check(alternate is Array and alternate.size()==2,"two_actual_alternate_seed_snapshots")
  if alternate is Array:
   for item in alternate:check(C.read_area(item).status=="READY","alternate_uint32_seed_"+str(item.generation.seed))
 check(Stage10.read_area(raw).status=="NOT_READY" and Stage4.read_area(raw).status=="NOT_READY","other_contracts_reject_si11")
 check(JSON.stringify(raw)==before and root.get_child_count()==0,"final_source_immutable_no_nodes")
 print("CH3_03_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed,"stage":11,"holes":13,"total":1050,
  "scope":"source_snapshot_only","main_boots":0,"world_boots":0,"runtime_bound":false,"visual_verified":false,"user_save_io":0}))
 quit(0 if failed.is_empty() else 1)
