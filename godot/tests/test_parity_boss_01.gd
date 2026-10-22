extends SceneTree
const USERDIR="EXODUSER-demo11-parity-boss02-Isolated-20261022"
var checks:=0
var failures:=0
class Feed extends Node2D:
 var _enemy: Dictionary={}
func check(ok: bool,id: String) -> void:
 checks+=1
 if not ok:failures+=1;print("PARITY_BOSS_FAIL ",id)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 check((OS.get_user_data_dir().get_file()==USERDIR or OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-BOSS-03-Isolated-")),"isolated_userdir")
 var provider=preload("res://scripts/maps/map11/field_runtime.gd").new();root.add_child(provider)
 check(provider.runtime_ready(),"provider_compiles_square_and_field")
 check(provider.get_node_or_null("Markers/Entry") is Marker2D,"PC_entry_marker_contract")
 check(provider.get_node_or_null("Markers/Boss") is Marker2D,"PC_boss_marker_contract")
 check(provider.get_node_or_null("Markers/Exit") is Marker2D,"PC_exit_marker_contract")
 var sites: Dictionary=provider.transition_sites()
 check(sites.get("status")=="OK","transition_sites_ready")
 if sites.get("status")=="OK":
  check(sites.arena_entry.global_position==provider.ARENA_OFFSET+Vector2(0,1960),"source_south_entry1960")
  check(sites.boss.global_position==provider.ARENA_OFFSET,"source_center")
 check(provider.can_move(provider.ARENA_OFFSET+Vector2(2000,1700),44,"arena"),"square_corner_walkable")
 check(not provider.can_move(provider.ARENA_OFFSET+Vector2(2500,0),44,"arena"),"square_wall_blocks")
 check(provider.arena.sweep_fraction(Vector2.ZERO,Vector2(3000,0),44)<1,"wall_swept_collision")
 var totals: Array=[0,0,0,0]
 var holes: Array=provider.anchors("hole")
 for h in holes:totals[h.region_id]+=provider.Holes.spawn_hole_count(h.size,0)
 check(holes.size()==14,"HS_M4_holes14")
 check(totals==[23,60,53,32],"HS_M4_region_totals")
 check(provider.region_at(Vector2(4020,7420))==3,"HS_M4_start_southeast32")
 var feed:=Feed.new();root.add_child(feed)
 var view=preload("res://scripts/boss11_scene_actor.gd").new();root.add_child(view);view.configure(feed)
 for state in ["bossSlamWind","bossSpinWind","bossShockWind","bossGrabWind","bossChargeWind","bossCharge","bossDruidDive","bossTelePrep","bossRec","idle"]:
  feed._enemy={"alive":true,"x":0,"y":0,"r":44,"facing":0,"s":state,"st2":20,"hp":200,"mhp":200}
  var before: String=JSON.stringify(feed._enemy);view._process(0)
  check(view.visible,"visible_"+state);check(JSON.stringify(feed._enemy)==before,"read_only_"+state)
  if state in ["bossSlamWind","bossSpinWind","bossShockWind","bossGrabWind"]:check(view.body.texture==view.SHEETS.attack,"source_attack_sheet_"+state)
  if state=="bossChargeWind":check(view.body.texture==view.SHEETS.transform,"source_transform_sheet")
  if state=="bossCharge":check(view.body.texture==view.SHEETS.beast,"source_beast_sheet")
 feed._enemy.alive=false;view._process(0);check(not view.visible,"final_death_body_hidden")
 var locales: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_boss_01_locale.json"))
 check(locales.size()==29,"locale29")
 for lang in locales:
  check(locales[lang].size()==6,"six_keys_"+lang)
  for key in locales.ko:
   for placeholder in ["{s}","{p}","{n}","{mark}"]:
    if key.contains(placeholder):check(locales[lang][key].contains(placeholder),"placeholder_"+lang+placeholder)
 var source: String=FileAccess.get_file_as_string("res://source_snapshot/game.html")
 check(FileAccess.get_sha256("res://source_snapshot/game.html")=="dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209","source_immutable")
 check(source.contains("if(BH.shF)_hset(BH.shF,'width','0%')"),"source_shield_zero_not_invented")
 var ground=preload("res://scripts/boss11_source_ground.gd").new();root.add_child(ground)
 for state in ["bossGrabWind","bossGrab","bossChargeWind","bossCharge"]:
  var enemy: Dictionary={"alive":true,"x":20,"y":30,"r":44,"facing":PI/2,"s":state,"st2":20,"_grabWindMax":40,"_grabAng":PI/2,"echDx":0,"echDy":1,"col":"#bbbbbb"}
  var before: String=JSON.stringify(enemy)
  ground.observe_enemy(enemy);ground.refresh({"stage":0},true)
  await process_frame
  check(JSON.stringify(enemy)==before,"BOSS03_readonly_fx_"+state)
 var arena=preload("res://scripts/maps/map11/web_arena_view.gd").new();root.add_child(arena)
 arena.render_at(150)
 check(arena._portal.texture==preload("res://assets/map/web_parity/portal.png"),"BOSS03_exit_source_asset_not_gate_tint")
 check(is_equal_approx(arena._portal.rotation,150.0/2000),"BOSS03_portal_main_clock")
 check(is_equal_approx(arena._portal_core.rotation,150.0/2000-150.0/800),"BOSS03_portal_cumulative_counter_rotation")
 check(is_equal_approx(arena._portal_core.scale.x/arena._portal.scale.x,.55),"BOSS03_portal_core_ratio")
 check(is_equal_approx(arena._portal.scale.x*arena._portal.texture.get_width(),120+sin(150.0/400)*120*.12),"BOSS03_portal_source_size_pulse")
 arena.queue_free();ground.queue_free()
 print("PARITY_BOSS_RESULT ",JSON.stringify({"checks":checks,"failures":failures}));quit(0 if failures==0 else 1)
