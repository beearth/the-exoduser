extends SceneTree
## Pure source inspection: zero Main/World/scene nodes or save IO.
const C=preload("res://port_modules/ch3_map_source/stage10_contract.gd")
const Stage0=preload("res://port_modules/ch1_map_source/producer.gd")
const Stage1=preload("res://port_modules/ch1_map_source/stage1_contract.gd")
const Stage4=preload("res://port_modules/ch2_map_source/stage4_contract.gd")
const USERDIR := "EXODUSER-ch3-01-Isolated-20261020"
var checks:=0
var failed: Array=[]
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:
  failed.append(label)
  printerr("CH3_01_FAIL ",label)
func reject(raw: Variant,label: String) -> void:
 var before:=JSON.stringify(raw)
 var result: Dictionary=C.read_area(raw)
 check(result.status=="NOT_READY" and not result.has("value") and is_same(result.raw,raw) and JSON.stringify(raw)==before,label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR \
   or not ProjectSettings.get_setting("application/config/use_custom_user_dir",false) or not OS.get_user_data_dir().ends_with(USERDIR):
  printerr("CH3_01_ABORT isolated USERDIR required")
  quit(2)
  return
 var raw: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/ch3_map_source/si10.json"))
 var before:=JSON.stringify(raw)
 var result: Dictionary=C.read_area(raw)
 check(result.status=="READY","source_ready:"+str(result.get("reason","")))
 if result.status!="READY":
  print("CH3_01_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed}))
  quit(1)
  return
 check(is_same(result.value,raw) and is_same(result.value.hand_props_raw,raw.hand_props_raw),"same_references")
 check(result.scope=="source_snapshot_only" and result.source_only_stage==10 and not result.runtime_bound and not result.full_stage_ready and not result.visual_verified,"source_only_not_runtime")
 check(C.validate_area(raw).status=="READY","validate_api")
 var counts: Array=[0,0,0,0,0]
 for v in raw.tiles:counts[int(v)]+=1
 check(counts==[25364,14329,3,3,301],"entire_native_grid_counts")
 check(raw.start_world==[4020.0,7420.0] and raw.start_tile==[100.0,185.0],"source_start")
 check(raw.hand_props_raw.size()==346 and raw.ch3_deco_raw.size()==61 and raw.cross_deco_raw.size()==5 and raw.initial_obj_meta.size()==77,"authored_catalogs")
 check(raw.source_basin.spec=={"cx":100.0,"cy":100.0,"rx":90.0,"ry":88.0,"gateX":100.0,"gateY":5.0,"gateW":12.0},"basin_not_ch1_polygon")
 var coverage:=0
 for i in range(1,raw.source_basin.editor_tile_rle.size(),2):coverage+=int(raw.source_basin.editor_tile_rle[i])
 check(raw.source_basin.editor_tile_rle.size()==738 and coverage==40000,"initial_editor_rle")
 check(raw.spawn_holes_final.size()==7 and raw.total_spawned==650 and raw.region_totals==[100.0,300.0,0.0,250.0],"native_budget_no_stage0_discount")
 check(raw.region_details[2].cleared and raw.region_details[2].total==0 and raw.region_details.all(func(r):return r.fbIdx==-1),"empty_southwest_clears_without_ch1_angler")
 check(raw.boss_gate.map(func(e):return [e.x,e.y])==[[99.0,5.0],[100.0,5.0],[101.0,5.0]],"north_gate_metadata")
 for x in [99,100,101]:check(raw.tiles[5*200+x]==3 and raw.tiles[7*200+x]==2,"source_gate_and_exit_tiles_"+str(x))
 check(raw.generation.random_draws==7 and raw.generation.random_final_state==1183075769,"source_timer_evidence")
 var files: Dictionary={}
 for a in raw.asset_refs:files[a.file]=true
 check(raw.asset_refs.size()==66 and files.size()==40 and raw.source.files.size()==43 and raw.ground_asset.bytes==3562028,"byte_references_not_media_load")
 check(not raw.has("ch1_deco_raw") and not raw.has("ch2_deco_raw") and not raw.has("source_geometry") and raw.environment_refs.size()==1,"no_foreign_stage_environment_claim")
 for i in 2:check(C.read_area(raw).status=="READY","repeat_"+str(i))
 check(JSON.stringify(raw)==before,"positive_reads_immutable")
 for value in [null,[],true,1,"snapshot"]:reject(value,"type_"+str(typeof(value)))
 for field in raw.keys():
  var missing:=raw.duplicate(true);missing.erase(field);reject(missing,"missing_"+field)
 var bad: Dictionary
 for stage in [0,1,4,11,12,13,true,"10",10.1]:
  bad=raw.duplicate(true);bad.stage=stage;reject(bad,"wrong_stage_"+str(stage))
 bad=raw.duplicate(true);bad.tiles.pop_back();reject(bad,"tiles39999")
 for v in [true,1.5,-1,5]:
  bad=raw.duplicate(true);bad.tiles[0]=v;reject(bad,"tile_type_or_range_"+str(v))
 bad=raw.duplicate(true)
 var fi: int=bad.tiles.find(0.0);var wi: int=bad.tiles.find(1.0)
 bad.tiles[fi]=1;bad.tiles[wi]=0;reject(bad,"same_counts_different_grid_hash")
 bad=raw.duplicate(true);bad.tiles[5*200+100]=0;reject(bad,"physical_gate_not_metadata_only")
 bad=raw.duplicate(true);bad.runtime_tile_sha256="0".repeat(64);reject(bad,"false_hash_declaration")
 for i in 346:
  bad=raw.duplicate(true);bad.hand_props_raw[i].x+=1;reject(bad,"every_authored_position_"+str(i))
 bad=raw.duplicate(true);bad.hand_props_raw.reverse();reject(bad,"hand_order")
 bad=raw.duplicate(true);bad.hand_props_raw[1].scale=1;reject(bad,"absent_scale_not_explicit_one")
 bad=raw.duplicate(true);bad.hand_props_raw[1].rot=null;reject(bad,"rot0_not_null")
 for i in 61:
  bad=raw.duplicate(true);bad.ch3_deco_raw[i].file="wrong.png";reject(bad,"every_registered_file_"+str(i))
 for i in 66:
  bad=raw.duplicate(true);bad.asset_refs[i].sha256="0".repeat(64);reject(bad,"every_asset_sha_"+str(i))
 for i in 5:
  bad=raw.duplicate(true);bad.cross_deco_raw[i].col=0;reject(bad,"cross_col_inheritance_"+str(i))
 bad=raw.duplicate(true);bad.initial_obj_meta.m_hang_cage.erase("col");reject(bad,"inherited_initial_collision")
 var gate_index: int=-1
 for i in raw.ch3_deco_raw.size():
  if raw.ch3_deco_raw[i].id=="m_c3wall_gate":gate_index=i
 check(gate_index>=0,"wall_gate_meta_found")
 bad=raw.duplicate(true);bad.ch3_deco_raw[gate_index].colParts[0].x=0;reject(bad,"gate_central_opening_not_filled")
 bad=raw.duplicate(true);bad.ch3_deco_raw[gate_index].pivotY=0;reject(bad,"source_gate_pivot")
 bad=raw.duplicate(true);bad.source_basin.spec.rx=91;reject(bad,"source_basin_radius")
 bad=raw.duplicate(true);bad.source_basin.editor_tile_rle[1]+=1;reject(bad,"initial_rle_corrupt")
 bad=raw.duplicate(true);bad.region_details[2].cleared=false;reject(bad,"empty_region_not_forced_uncleared")
 bad=raw.duplicate(true);bad.region_details[0].fbIdx=0;reject(bad,"no_ch1_angler_added")
 bad=raw.duplicate(true);bad.region_totals=[100,300,1,249];reject(bad,"same_sum_wrong_quadrants")
 bad=raw.duplicate(true);bad.total_spawned=168;reject(bad,"stage0_budget")
 bad=raw.duplicate(true);bad.spawn_holes_final.reverse();reject(bad,"ordered_holes")
 for i in 7:
  bad=raw.duplicate(true);bad.spawn_holes_final[i].timer+=1;reject(bad,"each_timer_evidence_"+str(i))
 bad=raw.duplicate(true);bad.spawn_holes_final[0].alive=1;reject(bad,"initial_hole_alive")
 bad=raw.duplicate(true);bad.generation.random_final_state=0;reject(bad,"seed_final_state")
 for v in [-1,4294967296,true]:
  bad=raw.duplicate(true);bad.generation.seed=v;reject(bad,"bad_seed_"+str(v))
 bad=raw.duplicate(true);bad.scope.runtime_bound=true;reject(bad,"runtime_claim")
 bad=raw.duplicate(true);bad.scope.prop_colliders=[];reject(bad,"unobserved_not_empty")
 bad=raw.duplicate(true);bad.ground_asset.bytes=1;reject(bad,"ground_byte_pin")
 bad=raw.duplicate(true);bad.ch1_deco_raw=[];reject(bad,"foreign_stage_field")
 bad=raw.duplicate(true);bad.source.main_sha="0".repeat(40);reject(bad,"wrong_main_pin")
 for field in raw.source.symbols:
  bad=raw.duplicate(true);bad.source.symbols[field].sha256="0".repeat(64);reject(bad,"each_source_record_"+field)
 check(Stage0.read_area(raw).status=="NOT_READY" and Stage1.read_area(raw).status=="NOT_READY" and Stage4.read_area(raw).status=="NOT_READY","other_contracts_cannot_claim_si10")
 check(root.get_child_count()==0 and JSON.stringify(raw)==before,"no_nodes_or_input_writes")
 print("CH3_01_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed,"stage":10,
  "scope":"source_snapshot_only","main_boots":0,"world_boots":0,"runtime_bound":false,"user_save_io":0,"holes":7,"total":650,"visual_verified":false}))
 quit(0 if failed.is_empty() else 1)
