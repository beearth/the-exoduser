extends SceneTree
const R=preload("res://scripts/native_regions.gd")
const USERDIR="EXODUSER-P3003-Isolated-20261020"
var checks:=0
var failed: Array=[]
var observations: Dictionary={}
func check(ok: bool,name: String) -> void:
 checks+=1
 if not ok:failed.append(name)
func _initialize() -> void:call_deferred("_run")
func fixture(stage: int=0) -> Dictionary:
 return {"stage":stage,"on":true,"spawnHoles":[{"x":40,"y":40,"size":0.3},{"x":6000,"y":40,"size":0.5},{"x":40,"y":6000,"size":0.8},{"x":6000,"y":6000,"size":1.0}],"_fbDone":false,"_fbSpawned":false}
func _run() -> void:
 var args:=OS.get_cmdline_user_args()
 if not args.has("--only-actual") and not args.has("--only-display") and not args.has("--only-quantization"):_core()
 if args.has("--only-quantization"):_quantization()
 elif args.has("--only-display"):_display()
 elif not args.has("--only-core"):
  if not args.has("--only-actual"):_display()
  await _actual()
 print("P3003_RESULT "+JSON.stringify({"assertions":checks,"failures":failed.size(),"failed":failed,"observations":observations,"fixture_not_full_game":true,"C_kill_hook_bound":false,"P3_002_holes_finalization_bound":false}))
 quit(0 if failed.is_empty() else 1)
func _core() -> void:
 var g:=fixture()
 check(R.init_regions(g,Vector2(4020,7420),200,200,true).ready,"init")
 check(g._regions.size()==4 and g._regCurIdx==3,"quadrants_current")
 check(g._regions[0].nameKo=="북서 · 어둠" and g._regions[2].nameEn=="Southwest · Water","names")
 check(g._regions.map(func(r):return r.total)==[8,15,15,15],"original_hole_denominators")
 check(g._regions.map(func(r):return r.fbIdx)==[2,3,0,1],"fb_assignment")
 check(R.index_at(g,3999,3999)==0 and R.index_at(g,4000,4000)==3,"midline_strict")
 var e={"x":7000,"y":7000,"_homeX":20,"_homeY":20,"ib":false}
 R.record_kill(g,e);check(g._regions[0].kills==1 and g._regions[3].kills==0,"spawn_not_death_position")
 e.ib=true;R.record_kill(g,e);check(g._regions[0].kills==1,"boss_excluded")
 R.record_kill(g,{"x":6000,"y":40});check(g._regions[1].kills==1,"absent_home_uses_actual_position")
 g._regions[0].kills=8;check(R.tick_regions(g,Vector2(4020,7420),15).is_empty() and not g._regions[0].cleared,"unspawned_fb_blocks_clear")
 g._fbSpawned=true;g._fieldBosses=[{"hp":1},{"hp":1},{"hp":0},{"hp":1}]
 var events:=R.tick_regions(g,Vector2(4020,7420),30)
 check(g._regions[0].cleared and events.size()==1 and events[0].purge,"dead_assigned_fb_allows_clear")
 g._fieldBosses[2].hp=100;check(g._regions[0].cleared,"clear_latches")
 var h:=fixture(1);R.init_regions(h,Vector2(1000,1000),200,200,true)
 h._regions[0].total=100;h._regions[0].kills=70;h._gateGuardKilled=true;h._regGateIdx=0
 check(absf(R.ratio(h,h._regions[0],0)-0.8)<1e-9,"gate_bonus_single_region")
 R.tick_regions(h,Vector2(1000,1000),15);check(h._regions[0].cleared and not h._regions[1].cleared,"epsilon_threshold")
 var q:=fixture();R.init_regions(q,Vector2(1000,1000),200,200,true)
 check(R.tick_regions(q,Vector2(6000,6000),14).is_empty() and q._regCurIdx==0,"15_frame_throttle")
 R.tick_regions(q,Vector2(4010,6000),15);check(q._regCurIdx==0,"1_5_tile_deadzone")
 events=R.tick_regions(q,Vector2(6000,6000),30);check(events.size()==1 and not events[0].purge and q._regCurIdx==3 and q._regBannerCd==300,"enter_and_300_cd")
 R.tick_regions(q,Vector2(1000,6000),45);check(q._regCurIdx==2 and q._regBannerCd==285,"cd_updates_current_without_banner")
 q.on=false;R.tick_regions(q,Vector2(1000,1000),60);check(q._regBannerCd==285 and q._regCurIdx==2,"on_gate")
 q.on=true;q._bossArena=true;R.tick_regions(q,Vector2(1000,1000),75);check(q._regCurIdx==2,"arena_gate")
 var small:=fixture();check(R.init_regions(small,Vector2.ZERO,179,200,true).ready and small._regions==null,"small_map_excluded")
 var empty:=fixture(1);empty.spawnHoles=[];R.init_regions(empty,Vector2.ZERO,200,200,true);check(R.cleared_count(empty)==4,"empty_nonch1_quiet_clear")
 var sites:=R.minimap_sites(fixture_ready(),Vector2(4,4),0.61)
 check(sites.size()==4 and sites[0].pos.is_equal_approx(Vector2(4,4)+Vector2(58.5,158.5)*0.61) and sites[0].color==Color("3388ff"),"four_sites_real_colors_centers")
 var m:=fixture_ready();m._fieldBosses=[];check(R.minimap_sites(m,Vector2.ZERO,0.61).is_empty(),"declared_empty_fb_array_no_site_fallback")
 m._fieldBosses=[{"hp":0,"x":40,"y":40,"el":1},{"hp":1,"x":80,"y":80,"el":4}];check(R.minimap_sites(m,Vector2.ZERO,1).size()==1,"dead_fb_marker_removed")
 check(R.area_title(0)=={"ko":"제1구역 · 썩은 숲 1구역","en":"THE ROTTEN FOREST"},"source_area_title")
 check(R.area_title(26).en=="THE APOSTLE LAIR" and R.area_title(21).ko=="제22구역 · 지옥 군단 1구역","source_stage_names")
 observations.core_groups="source static contracts/owned fixtures only"
func fixture_ready() -> Dictionary:
 var g:=fixture();R.init_regions(g,Vector2.ZERO,200,200,true);return g
func _actual() -> void:
 check(ProjectSettings.get_setting("application/config/custom_user_dir_name")==USERDIR,"unique_userdir")
 if not failed.is_empty():return
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in range(4):await process_frame
 var node: Node=main.get_node_or_null("NativeRegions")
 check(is_instance_valid(node),"Main_ready_installs_region_owner")
 if is_instance_valid(node):
  var snap: Dictionary=node.snapshot();observations.actual=snap
  check(snap.ready and snap.regions is Array and snap.regions.size()==4,"actual_live_G_regions")
  check(is_same(main.source_state.read_current_g()._regions,snap.regions),"same_G_array_not_copy")
  check(snap.sites.size()==4,"actual_unspawned_sites4")
  check(main.hud.get_native_minimap_corner_snapshot().minimap_cache_ready,"actual_minimap_cache_ready")
  check(snap.regions.all(func(r):return not r.cleared),"unspawned_fieldboss_not_fake_cleared")
  check(snap.kill_calls==0,"no_fake_kill_trigger")
  var old: int=node._kill_count
  var living: Node=main.world.get_enemies()[0]
  check(node.record_actor_kill(living).applied==false and node._kill_count==old,"live_actor_cannot_generate_kill")
 main.free()
 for i in range(2):await process_frame

func _display() -> void:
 var g:=fixture_ready();g._regMidX=2;g._regMidY=2;g._regions[0].cleared=true
 var image:=Image.create(4,4,false,Image.FORMAT_RGBA8);image.fill(Color.WHITE);image.set_pixel(1,1,Color.TRANSPARENT)
 var layers: Dictionary=R.minimap_layers(image,g,1.0)
 check(layers.boundary.get_pixel(1,1).a==0 and layers.tint.get_pixel(1,1).a==0,"wall_alpha_excludes_boundary_and_tint")
 check(layers.tint.get_pixel(0,0).is_equal_approx(Color(30.0/255,60.0/255,30.0/255,114.0/255)),"cleared_floor_source_tint_quantized_RGBA8")
 check(layers.tint.get_pixel(3,3).a==0,"uncleared_floor_not_tinted")
 check(layers.boundary.get_pixel(2,0).a>0 and layers.boundary.get_pixel(0,0).a==0,"midline_boundary_only")
 check(R.region_tone("#9933cc").is_equal_approx(Color(153.0/255,88.0/255,174.0/255)),"source_desaturation_rounding")
 check(R.region_tone("invalid").is_equal_approx(Color(154.0/255,143.0/255,128.0/255)),"source_bone_fallback")
 check(R.ELC[R.ELEMENTS[0]]=="#3388ff" and R.ELC[R.ELEMENTS[1]]=="#ff5522" and R.ELC[R.ELEMENTS[2]]=="#9933cc" and R.ELC[R.ELEMENTS[3]]=="#ffee00","site4_source_palette")
 observations.display="in-memory generated minimap mask pixels; no PNG originals; no actual screen verdict"

func _quantization() -> void:
 var g:=fixture_ready();g._regMidX=2;g._regMidY=2;g._regions[0].cleared=true
 var image:=Image.create(4,4,false,Image.FORMAT_RGBA8);image.fill(Color.WHITE)
 var actual: Color=R.minimap_layers(image,g,1.0).tint.get_pixel(0,0)
 observations.rgba8_tint=actual
 check(actual.is_equal_approx(Color(30.0/255,60.0/255,30.0/255,114.0/255)),"native_RGBA8_truncation_of_source_alpha_0_45")
