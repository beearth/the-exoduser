extends SceneTree
## Read-only product integration driver. Checkpoints never make the whole route PASS.
const USERDIR="EXODUSER-demo11-47h-Isolated-20261021"
const Store=preload("res://port_modules/save_adapter/demo_local_storage.gd")
const Shared=preload("res://port_modules/save_adapter/demo_shared_local_storage.gd")
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
const EXP_CURVE=preload("res://scripts/native_source_meta_exp_curve.gd")
const ORDER=["isolation","new_game","character_create","intro_skip","field_MAP11","enemy_kill","revival_interface","item_pickup","equip","auto_potion","level_up","stat_passive_invest","bossroom_gate","boss_defeat_signal","clear","demo_end","save_handoff","lobby_return"]
var rows: Array=[]
var active: Dictionary={}
var main: Node
var screen: Control
var store: RefCounted
var item: Dictionary={}
var event_rows: Array=[]
var checkpoint:=false
var physics_start:=0
var process_last:=0
var serial:=0
var sample_nodes: Array=[]
var initial_level:=1
var kills_before:=0
var action_start:=0
var boss_signal_count:=0
class Stamp extends Node:
 var physics: Callable
 var process: Callable
 func _physics_process(_delta: float) -> void:
  if physics.is_valid():physics.call()
 func _process(_delta: float) -> void:
  if process.is_valid():process.call()
func _initialize() -> void:call_deferred("run")
func arg(key: String,fallback: String="") -> String:
 for a in OS.get_cmdline_user_args():
  if a.begins_with(key+"="):return a.substr(key.length()+1)
 return fallback
func begin(id: String) -> void:
 root.set_meta("demo47i_stage",id)
 active={"id":id,"start_us":Time.get_ticks_usec(),"physics_samples":[],"frame_samples":[],"evidence":{},"checkpoint":checkpoint};process_last=0;action_start=Time.get_ticks_usec()
func action_end() -> void:active.action_us=Time.get_ticks_usec()-action_start
func mark_checkpoint(reason: String) -> void:
 checkpoint=true;active.checkpoint=true;active.evidence["checkpoint_input"]=reason
func stats(samples: Array) -> Dictionary:
 if samples.is_empty():return {"samples":0,"p95_ms":null,"max_ms":null,"budget":"UNMEASURED"}
 var ordered:=samples.duplicate();ordered.sort();var worst: float=ordered[-1]/1000.0
 return {"samples":ordered.size(),"p95_ms":ordered[maxi(0,int(ceil(ordered.size()*.95))-1)]/1000.0,"max_ms":worst,"budget":"WITHIN" if worst<=1000.0/120 else "EXCEEDED"}
func settle(n: int=30) -> void:
 for i in n:await physics_frame
 await process_frame
func done(status: String,reason: String="",evidence: Dictionary={}) -> void:
 if not active.has("action_us"):action_end()
 active.evidence.merge(evidence,true)
 await settle()
 var row: Dictionary={"id":active.id,"status":status,"reason":reason,"checkpoint":active.checkpoint,"command_span_ms":active.action_us/1000.0,"wall_ms":(Time.get_ticks_usec()-active.start_us)/1000.0,"physics_callback":stats(active.physics_samples),"process_frame_interval":stats(active.frame_samples),"evidence":active.evidence}
 rows.append(row);active={};print("E2E_STAGE ",JSON.stringify(row))
func before_physics() -> void:physics_start=Time.get_ticks_usec()
func after_physics() -> void:
 if not active.is_empty() and physics_start>0:active.physics_samples.append(Time.get_ticks_usec()-physics_start)
func process_sample() -> void:
 if active.is_empty():return
 var now:=Time.get_ticks_usec()
 if process_last>0:active.frame_samples.append(now-process_last)
 process_last=now
func key(code: Key,pressed: bool) -> void:
 var event:=InputEventKey.new();event.keycode=code;event.physical_keycode=code;event.pressed=pressed;Input.parse_input_event(event)
func wait_wall(ms: int) -> void:
 var until:=Time.get_ticks_msec()+ms
 while Time.get_ticks_msec()<until:await process_frame
func on_event(kind: String,packet: Dictionary) -> void:
 if kind in ["native_hurte","native_hurte_halt","player_died","enemy_killed","attack_parameters_rejected","active_lmb_rejected"] and event_rows.size()<256:
  event_rows.append({"kind":kind,"reason":packet.get("reason",""),"ok":packet.get("ok"),"id":packet.get("id")})
func refresh_readback(receipt: Dictionary) -> bool:
 if receipt.get("status")!="READY" or receipt.get("committed")!=true:return false
 var fields: Variant=receipt.get("committed_fields")
 var after: Variant=receipt.get("after")
 if not fields is Dictionary or not after is Dictionary:return false
 var p: Dictionary=main.source_state.read_current_p()
 for owner in ["actor","resources","state"]:
  if not fields.get(owner) is Array or fields[owner].is_empty():return false
  for field in fields[owner]:
   if not after.has(field) or p.get(field)!=after[field]:return false
 return true
func clear_own_store(io: RefCounted,keys: Array) -> bool:
 if not io.open_store().get("ready",false):return false
 for k in keys:
  serial+=1;var id: String="47h-clear-"+str(serial)
  if not io.begin_remove(id,k).get("ready",false):return false
  var result: Dictionary=io.run_request(id);io.release_receipt(id)
  if not result.get("ok",false):return false
 return true
func verdict(claimed_success: bool,verified: bool) -> String:
 return "PASS" if verified else ("FAIL" if claimed_success else "NOT_READY")
func fail_remaining(reason: String) -> void:
 for id in ORDER:
  if rows.any(func(r):return r.id==id):continue
  begin(id);await done("NOT_READY",reason)
func run() -> void:
 Engine.physics_ticks_per_second=120;Engine.max_fps=240
 root.show() # Logical document visibility for headless input; no display window is rendered.
 var first:=Stamp.new();first.process_mode=Node.PROCESS_MODE_ALWAYS;first.process_physics_priority=-1000000;first.physics=before_physics;root.add_child(first);sample_nodes.append(first)
 var last:=Stamp.new();last.process_mode=Node.PROCESS_MODE_ALWAYS;last.process_physics_priority=1000000;last.physics=after_physics;last.process=process_sample;root.add_child(last);sample_nodes.append(last)
 begin("isolation")
 var isolated: bool=DisplayServer.get_name()=="headless" and ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and OS.get_user_data_dir().get_file()==USERDIR
 if not isolated:
  await done("FAIL","headless/custom-userdir guard refused; no stores opened");await fail_remaining("isolation_guard");finish();return
 store=Store.new();var shared:=Shared.new()
 var clean: bool=clear_own_store(store,Array(Store.KEYS)) and clear_own_store(shared,shared._allowed_keys())
 await done("PASS" if clean else "FAIL","",{"userdir":OS.get_user_data_dir(),"headless":true,"own_store_reset":clean})
 if not clean:await fail_remaining("isolated_store_unavailable");finish();return
 begin("new_game")
 screen=load("res://scenes/demo_lobby.tscn").instantiate();screen.set_meta("native_lobby_entry_enabled",true)
 screen.set_meta("native_audio_source_root",arg("--source-root"));screen.set_meta("native_story_source_root",arg("--source-root"));root.add_child(screen);current_scene=screen
 screen.cards[0].pressed.emit()
 await done("PASS" if screen._form.visible and screen.menu.selected==0 else "FAIL","",{"input":"actual slot0 Button.pressed"})
 begin("character_create")
 screen.character_buttons[0].pressed.emit();screen.name_input.text="자동 순례자";screen._create();action_end()
 for i in 300:
  await process_frame
  if is_instance_valid(current_scene) and current_scene.has_method("request_native_lobby_entry"):main=current_scene;break
 if not is_instance_valid(main):
  await done("FAIL","character metadata did not hand off to Main");await fail_remaining("Main_missing");finish();return
 root.mode=Window.MODE_WINDOWED;root.show() # Main video setup can minimize the logical headless root.
 main.player.telemetry_event.connect(on_event)
 main.native_demo_boss_defeated.connect(func(stage_index: int):
  if stage_index==0:boss_signal_count+=1)
 var created: Dictionary=store.read_json("hellsave_demo_0")
 var char_ok: bool=created.get("ready",false) and created.get("found",false) and created.value.get("charIdx")==0 and main.player.get_native_character_profile_snapshot().get("index")==0
 await done("PASS" if char_ok else "FAIL","",{"actual_Metadata_IO":created.get("found",false),"active_slot":store.get_item("hellsave_demo_active").get("raw"),"character_index":main.player.get_native_character_profile_snapshot().get("index"),"input":"char0 Button + name + actual create callback"})
 begin("intro_skip")
 var story: Node=main.get("native_story_intro");var intro_ok:=true;var media_phase:="absent"
 if is_instance_valid(story) and story.phase in ["playing","error"]:
  media_phase=story.phase;key(KEY_SPACE,true);await wait_wall(2150);key(KEY_SPACE,false);await settle(2)
  if story.phase!="done":
   mark_checkpoint("headless held-key routing unavailable; existing story skip action endpoint")
   story.finish("skip")
  intro_ok=story.phase=="done" and story.handoff_count==1
 var guide: Node=main.get("source_intro_sequence")
 if is_instance_valid(guide) and guide.phase=="guide":
  key(KEY_SPACE,true);await wait_wall(2150);key(KEY_SPACE,false)
  if guide.phase=="guide":
   mark_checkpoint("headless guide input fallback: actual skip_requested UI endpoint")
   guide.guide_panel.skip_requested.emit()
 if is_instance_valid(guide):
  var deadline:=Time.get_ticks_msec()+7000
  while Time.get_ticks_msec()<deadline:
   if is_instance_valid(guide.lesson_flow) and guide.lesson_flow.active:guide.lesson_flow.skip_all();break
   # Guide completion precedes lesson startup; never stop waiting at guide.done.
   if is_instance_valid(guide.lesson_flow) and guide.lesson_flow.seen and not guide.lesson_flow.active:break
   await process_frame
 else:intro_ok=false
 await settle(10)
 var g: Dictionary=main.source_state.read_current_g()
 intro_ok=intro_ok and g.get("_cutsceneDone",false) and g.get("on",false)
 await done("PASS" if intro_ok else "NOT_READY","" if intro_ok else "intro/lesson handoff not running",{"story_media_phase":media_phase,"logical_window_visible":root.visible,"logical_window_mode":root.mode,"document_hidden":main.read_native_document_hidden(),"story_skip":"real SPACE hold >=2s","guide_phase":guide.phase if is_instance_valid(guide) else "absent","lesson_skip":"existing skip_all UI endpoint"})
 initial_level=int(main.source_state.read_current_p().lv);kills_before=int(g.get("kills",0))
 begin("field_MAP11")
 var adapter: RefCounted=main.get("native_stage_spawn_adapter")
 if adapter==null:
  for child in main.world.find_children("*","Node2D",true,false):
   if child is Node2D and child.has_method("describe") and child.has_method("spawn_budget_manifest"):
    var description: Variant=child.describe()
    if description is Dictionary and description.get("runtime_ready")==true:
     main.bind_native_spawn_stage_provider(child);adapter=main.get("native_stage_spawn_adapter");break
 var product: Node=main.get("native_map11")
 var field_ready: bool=is_instance_valid(product) and product.current() and product.snapshot().space=="field" and main.world.ready_for_player
 if not field_ready:mark_checkpoint("MAP11 production provider absent; remaining actual subsystems run as conditional checkpoints")
 await done("PASS" if field_ready else "NOT_READY","" if field_ready else "MAP11_provider_absent",{"stage":g.get("stage"),"World_ready":main.world.ready_for_player,"actual_provider":field_ready,"spawn_adapter_bound":adapter!=null,"fixture_provider_created":false})
 begin("enemy_kill")
 var target: Node
 var spawn_deadline:=Time.get_ticks_msec()+25000
 # Placement at a provider hole only; scheduler owns RNG/timers/etype/admission.
 if adapter!=null and adapter.is_current():
  var hole_anchors: Array=product.provider().anchors("hole")
  if not hole_anchors.is_empty():main.player.global_position=hole_anchors[0].marker.global_position
 while Time.get_ticks_msec()<spawn_deadline:
  for e in main.world.get_enemies():
   if is_instance_valid(e) and e.get("alive")==true and e.get("etype") in [1,4] and e.has_method("receive_damage") and is_instance_valid(main.native_natural_enemies) and main.native_natural_enemies.owns_actor(e):target=e;break
  if is_instance_valid(target):break
  await physics_frame
 var regions: Node=main.get_node_or_null("NativeRegions")
 var region_before: int=regions.snapshot().kill_calls if is_instance_valid(regions) else 0
 var origin_before: int=main.native_natural_enemies.counts.origin_kills if is_instance_valid(main.native_natural_enemies) else 0
 var home: Vector2=main.player.global_position;var attacks:=0;var accepted:=0;var event_start:=event_rows.size()
 if is_instance_valid(target):
  mark_checkpoint("test-owned Player placement/facing only; actual request_attack -> swing -> hurtE, no HP/alive/damage/RNG writes")
  var deadline:=Time.get_ticks_msec()+45000
  while target.alive and attacks<200 and Time.get_ticks_msec()<deadline and main.player.hp>main.player.max_hp*.2:
   if main.player.state!="idle":await physics_frame;continue
   main.player.global_position=target.global_position+Vector2(-(47+float(target.radius)-8),0);main.player.facing=Vector2.RIGHT
   attacks+=1
   if main.player.request_attack():accepted+=1
   main.player.release_attack()
   await settle(36)
   if event_rows.slice(event_start).any(func(e):return e.kind=="native_hurte_halt" or (e.kind=="native_hurte" and e.ok==false)):break
  main.player.release_attack();main.player.global_position=home
 var region_after: int=regions.snapshot().kill_calls if is_instance_valid(regions) else 0
 var killed: bool=is_instance_valid(target) and not target.alive and region_after>region_before
 await done("PASS" if killed else "NOT_READY","" if killed else ("MAP11_or_initial_combat_target_absent" if not is_instance_valid(target) else "actual combat kill not completed; preserve PC halt/owner boundary"),{"natural_origin_before":origin_before,"natural_origin_after":region_after,"region_before":region_before,"spawn_counts":main.native_natural_enemies.counts if is_instance_valid(main.native_natural_enemies) else {},"attacks":attacks,"accepted":accepted,"killed":killed,"events":event_rows.slice(event_start),"target_id":target.data.get("id") if is_instance_valid(target) else "absent","HP_or_damage_fabricated":false})
 begin("revival_interface")
 var life_api: bool=main.has_method("request_native_player_life_transition")
 await done("NOT_READY","PC_life_transition_not_exercised" if life_api else "PC_life_transition_API_absent",{"interface_present":life_api,"lethal_damage_forced":false})
 begin("item_pickup")
 var inv: Dictionary=main.source_state.read_current_inventory();var before_size: int=inv.bag.size();var records: Array=main.source_state.read_native_drop_records()
 if records.is_empty():
  mark_checkpoint("source rollDrop RNG fixture at journal boundary; kill->loot linkage remains NOT_READY")
  var dropper=Drop.new(func(tag: String)->float:
   if tag in ["drop_gate","drop_rarity","drop_slot","drop_element"]:return 0.0
   return .99 if tag.ends_with("_gate") else .5)
  var rolled: Variant=dropper.roll_drop({"ib":false,"etype":0,"elite":0,"drop_tier":0,"x":main.player.global_position.x,"y":main.player.global_position.y},{"stage":0,"drop_bonus":1.0,"min_pick_rar":0,"min_pick_lv_thr":-1,"plv":int(main.source_state.read_current_p().lv),"crystal_bag_len":0,"crystal_bag_max":9999,"stone_bag_len":0,"stone_bag_max":9999})
  if rolled is Dictionary and rolled.get("world_items") is Array:main.source_state.append_native_drop_records(main,rolled.world_items)
 records=main.source_state.read_native_drop_records()
 if not records.is_empty() and records[0].get("item") is Dictionary:item=records[0].item
 await settle(3);key(KEY_R,true);await process_frame;key(KEY_R,false);await settle(3)
 var picked: bool=not item.is_empty() and inv.bag.any(func(v):return is_same(v,item)) and inv.bag.size()>before_size
 await done("PASS" if picked else "NOT_READY","" if picked else "actual R pickup did not admit item",{"synthetic_R_via_Input":true,"bag_before":before_size,"bag_after":inv.bag.size(),"same_item_identity":picked,"handwritten_item":false})
 begin("equip")
 var equip: Dictionary={"reason":"item_or_interface_absent"}
 if not item.is_empty() and main.has_method("request_native_equip_item"):equip=main.request_native_equip_item(item)
 var equipped: bool=equip.get("applied",false) and inv.equipped.values().any(func(v):return v is Dictionary and is_same(v,item)) and refresh_readback(equip.get("refresh",{}))
 await done(verdict(equip.get("applied",false),equipped),"" if equipped else str(equip.get("reason","equipment_refresh_not_ready")),{"applied":equip.get("applied",false),"same_item_equipped":equipped,"refresh_readback":refresh_readback(equip.get("refresh",{})),"refresh":equip.get("refresh",{})})
 begin("auto_potion")
 var potion: RefCounted=main.get("source_potion");var used_before: int=potion.get_snapshot().uses if is_instance_valid(potion) else 0;var mats_before: float=float(g.get("mats",0));var requests:=0
 if is_instance_valid(potion):
  var until:=Time.get_ticks_msec()+7500
  while Time.get_ticks_msec()<until and potion.get_snapshot().uses==used_before and main.player.hp>1:
   if main.player.iframes<=0:
    main.player.receive_damage(maxi(1,int(minf(main.player.max_hp*.6,main.player.hp*.4))),"phys");requests+=1
   await settle(8)
 var used: bool=is_instance_valid(potion) and potion.get_snapshot().uses>used_before
 var pot_ok: bool=used and float(g.get("mats",0))<mats_before and main.source_state.read_native_potion_runtime().cd>0
 await done(verdict(used,pot_ok),"" if pot_ok else "real hurtP/iframe/threshold/clock did not produce auto-potion",{"uses_before":used_before,"uses_after":potion.get_snapshot().uses if is_instance_valid(potion) else 0,"update_clock":main.get_native_source_clock_input_snapshot().get("update_clock_result",{}),"HP_before_or_after":main.player.hp,"damage_requests_through_PC":requests,"HP_written_directly":false,"mats_before":mats_before,"mats_after":g.get("mats"),"document_hidden":main.read_native_document_hidden(),"player_iframes":main.player.iframes,"potion_reason":potion.get_snapshot().get("last",{}).get("reason","") if is_instance_valid(potion) else "absent","last_use":potion.get_snapshot().last_use if is_instance_valid(potion) else {}})
 begin("level_up")
 var p: Dictionary=main.source_state.read_current_p();var lv_before: int=int(p.lv)
 mark_checkpoint("XP reward input through actual State.addExp; no level/point setters or new formula")
 var xp: Dictionary=main.source_state.apply_native_add_exp(main,EXP_CURVE.required_exp(lv_before)*4)
 var level_ok: bool=xp.get("applied",false) and int(p.lv)>lv_before and int(p.lv)<=100
 await done(verdict(xp.get("applied",false),level_ok),"" if level_ok else str(xp.get("reason","XP_owner_not_ready")),{"before":lv_before,"after":p.lv,"SP":p.sp,"AP":p.ap,"source_curve_reused":true})
 begin("stat_passive_invest")
 var growth_before: Dictionary=main.read_native_growth().duplicate(true)
 var growth: Dictionary={};var queue: Dictionary={};var commit: Dictionary={}
 if main.has_method("request_native_growth"):
  growth=main.request_native_growth({"action":"stat","key":"str","amount":1})
  queue=main.request_native_growth({"action":"queue_add","key":"pVital","amount":1})
  commit=main.request_native_growth({"action":"process_queue"})
 var growth_after: Dictionary=main.read_native_growth()
 var growth_ok: bool=growth.get("applied",false) and queue.get("applied",false) and commit.get("applied",false) and growth_after.stats.str==growth_before.stats.str+1 and growth_after.passives.pVital==growth_before.passives.pVital+1 and growth_after.queue.is_empty() and refresh_readback(commit.get("refresh",{}))
 await done(verdict(growth.get("applied",false) and queue.get("applied",false) and commit.get("applied",false),growth_ok),"" if growth_ok else "growth/applyStats/queue owner not ready",{"verified_growth_readback":growth_ok,"before":growth_before,"stat_applied":growth.get("applied"),"queue_added":queue.get("applied"),"queue_committed":commit.get("applied"),"refresh":commit.get("refresh",{}),"readback":main.read_native_growth() if main.has_method("read_native_growth") else {}})
 begin("bossroom_gate")
 var encounter: Node=main.get("native_demo_encounter");var encounter_snapshot: Dictionary=encounter.snapshot() if is_instance_valid(encounter) else {}
 var gate_ok: bool=encounter_snapshot.get("provider_bound",false) and encounter_snapshot.get("phase") in ["arena","exit","clear"]
 await done("PASS" if gate_ok else "NOT_READY","" if gate_ok else "actual MAP11 gate/arena prerequisites not satisfied",{"encounter":encounter_snapshot,"gate_flags_written":false})
 begin("boss_defeat_signal")
 var flow: Node=main.get("native_demo_end_flow")
 var boss: Node=main.native_demo_boss_actor
 var boss_snapshot: Dictionary=boss.snapshot()
 var final_bound: bool=encounter.snapshot().pc_final_source_bound if is_instance_valid(encounter) else false
 # No contract signal injection: only the PC final-death owner can close this route.
 var defeated: bool=final_bound and boss_signal_count>0 and encounter.snapshot().phase=="clear"
 await done("PASS" if defeated else "NOT_READY","" if defeated else "PCI-11_missing_actual_boss_damage_and_final_death_owner",{"encounter":encounter.snapshot() if is_instance_valid(encounter) else {},"boss":boss_snapshot,"actual_final_signal_count":boss_signal_count,"contract_signal_injected":false,"HP_or_boss_state_written":false})
 begin("clear")
 var clear_ok: bool=is_instance_valid(flow) and flow.get_snapshot().phase=="clear" and flow.get_snapshot().clear_count==1
 await done(verdict(defeated,clear_ok),"" if clear_ok else "clear consumer did not accept contract",{"snapshot":flow.get_snapshot() if is_instance_valid(flow) else {},"stage":g.stage,"actual_final_signal_count":boss_signal_count})
 begin("demo_end")
 if clear_ok:flow._view.buttons.next.pressed.emit()
 var end_ok: bool=is_instance_valid(flow) and flow.get_snapshot().phase=="end" and g.stage==0
 await done(verdict(clear_ok,end_ok),"" if end_ok else "next/end route not admitted",{"snapshot":flow.get_snapshot() if is_instance_valid(flow) else {},"stage1_generated":g.stage!=0})
 begin("save_handoff")
 var save: Dictionary=main.save_native_demo11_current() if main.has_method("save_native_demo11_current") else {"status":"OFF"}
 var disk: Dictionary=store.read_json("hellsave_demo")
 var save_ok: bool=save.get("committed",false) and disk.get("ready",false) and disk.get("found",false) and disk.value.get("player") is Dictionary and int(disk.value.player.lv)==int(p.lv)
 await done(verdict(save.get("committed",false),save_ok),"" if save_ok else str(save.get("reason","save_session_not_admitted")),{"receipt":save,"live_level":p.lv,"disk_payload_found":disk.get("found",false),"slot0_metadata_preserved":store.read_json("hellsave_demo_0").get("found",false)})
 begin("lobby_return")
 var main_ref: WeakRef=weakref(main)
 if end_ok:flow._view.buttons.lobby.pressed.emit()
 var arrived:=false
 for i in 180:
  await process_frame
  if is_instance_valid(current_scene) and current_scene.get_script().resource_path=="res://scripts/native_demo_lobby.gd":arrived=true;break
 await done("PASS" if arrived and not is_instance_valid(main_ref.get_ref()) else "NOT_READY","" if arrived else "actual lobby navigation not completed",{"actual_return_scene":current_scene.scene_file_path if is_instance_valid(current_scene) else "","main_released":not is_instance_valid(main_ref.get_ref()),"return_lobby_is_five_slot_screen":false})
 finish()
func finish() -> void:
 var counts: Dictionary={"PASS":0,"NOT_READY":0,"FAIL":0}
 for row in rows:counts[row.status]+=1
 var overall: String="FAIL" if counts.FAIL>0 else ("NOT_READY" if counts.NOT_READY>0 or checkpoint else "PASS")
 var result: Dictionary={"overall":overall,"counts":counts,"failures":counts.FAIL,"stages":rows,"stage_order_complete":rows.size()==ORDER.size(),"continuous_E2E":overall=="PASS" and not checkpoint,"headless":DisplayServer.get_name()=="headless","userdir":OS.get_user_data_dir(),"profile_calls":root.get_meta("demo47i_perf",{}),"physics_hz":Engine.physics_ticks_per_second,"budget_ms":1000.0/120,"performance_scope":"headless callback CPU span and process_frame wall intervals; GPU excluded; command_span_ms includes asynchronous waits; not a CPU timer","visual_audio_QA":false}
 if not arg("--results-path").is_empty():
  var file:=FileAccess.open(arg("--results-path"),FileAccess.WRITE)
  if file!=null:file.store_string(JSON.stringify(result,"\t"));file.close()
 print("DEMO11_47H_RESULT ",JSON.stringify(result))
 for code in [KEY_SPACE,KEY_R]:key(code,false)
 if is_instance_valid(current_scene):
  for audio in current_scene.find_children("*","AudioStreamPlayer",true,false):audio.stop()
  current_scene.queue_free()
 if is_instance_valid(main) and main!=current_scene:main.queue_free()
 paused=false;await process_frame;await create_timer(.25,true,false,true).timeout;await process_frame
 quit(1 if overall=="FAIL" else (2 if overall!="PASS" and OS.get_cmdline_user_args().has("--require-ready") else 0))
