extends SceneTree
## Read-only product integration driver. Checkpoints never make the whole route PASS.
const USERDIR="EXODUSER-demo11-47h-Isolated-20261021"
const VIDEO=preload("res://scripts/parity_video_intro.gd")
const Store=preload("res://port_modules/save_adapter/demo_local_storage.gd")
const Shared=preload("res://port_modules/save_adapter/demo_shared_local_storage.gd")
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
const EXP_CURVE=preload("res://scripts/native_source_meta_exp_curve.gd")
const ORDER=["isolation","new_game","character_create","intro_skip","field_MAP11","enemy_kill","item_pickup","equip","auto_potion","level_up","stat_passive_invest","revival_interface","bossroom_gate","boss_defeat_signal","clear","demo_end","save_handoff","lobby_return"]
var rows: Array=[]
var active: Dictionary={}
var main: Node
var screen: Control
var store: RefCounted
var item: Dictionary={}
var event_rows: Array=[]
var checkpoint:=false
var callback_costs: Dictionary={}
var profile_stage: String=""
func profile_node(node: Node) -> void:
 if not is_instance_valid(node) or node is Stamp or node.get_parent()==null or node.has_meta("demo47m_profiled"):return
 if node.is_physics_processing():
  node.set_meta("demo47m_profiled",true)
  var script: Script=node.get_script()
  var key: String=str(node.get_path())+" | "+(script.resource_path if script!=null else "native")
  var row: Dictionary={"start":0,"frame":-1,"end":0,"last_us":0,"max_us":0,"total_us":0,"calls":0,"over_budget":0,"stage":"","by_stage":{}}
  if callback_costs.has(key):row=callback_costs[key]
  else:callback_costs[key]=row
  var before:=Stamp.new();var after:=Stamp.new()
  before.process_physics_priority=node.process_physics_priority;after.process_physics_priority=node.process_physics_priority
  var reference: WeakRef=weakref(node)
  before.physics=func():
   var target: Node=reference.get_ref()
   row.frame=Engine.get_physics_frames()
   row.start=Time.get_ticks_usec() if is_instance_valid(target) and target.is_physics_processing() and target.can_process() else 0
  after.physics=func():
   if row.start==0 or row.frame!=Engine.get_physics_frames():return
   var us: int=Time.get_ticks_usec()-row.start
   row.end=Time.get_ticks_usec()
   row.last_us=us
   row.calls+=1;row.total_us+=us
   if not row.by_stage.has(profile_stage):row.by_stage[profile_stage]={"calls":0,"max_us":0,"total_us":0,"over_budget":0}
   var phase: Dictionary=row.by_stage[profile_stage]
   phase.calls+=1;phase.total_us+=us;phase.max_us=maxi(phase.max_us,us)
   if us>8333:phase.over_budget+=1
   if us>8333:row.over_budget+=1
   if us>row.max_us:row.max_us=us;row.stage=profile_stage
  var parent: Node=node.get_parent()
  parent.add_child(before);parent.move_child(before,node.get_index());node.add_child(after);node.move_child(after,0)
  node.tree_exiting.connect(before.queue_free,CONNECT_ONE_SHOT)
 for child in node.get_children():
  if not child is Stamp:profile_node(child)
func profile_added(node: Node) -> void:
 if not node is Stamp:profile_node.call_deferred(node)
var worst_tick: Dictionary={}
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
func _initialize() -> void:
 preload("res://tests/mac_harness_safety.gd").arm(self, 420.0)
 call_deferred("run")
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
 if is_instance_valid(main) and is_instance_valid(main.player):active.evidence["player_boundary"]={"hp":main.player.hp,"max_hp":main.player.max_hp,"iframes":main.player.iframes,"state":main.player.state,"can_process":main.player.can_process(),"tree_paused":paused}
 await settle()
 var blocked: Array=[]
 if status=="NOT_READY":
  if active.id=="revival_interface":blocked=["natural_HP0_observation"]
  elif active.id=="bossroom_gate":blocked=["PC_fieldboss_HP_final_readback"]
  elif active.id in ["boss_defeat_signal","clear","demo_end","lobby_return"]:blocked=["bossroom_gate","PC_fieldboss_HP_final_readback","boss_source_updateE_prefix","PCI-11"]
 var row: Dictionary={"blocked_by":blocked,"id":active.id,"status":status,"reason":reason,"checkpoint":active.checkpoint,"command_span_ms":active.action_us/1000.0,"wall_ms":(Time.get_ticks_usec()-active.start_us)/1000.0,"physics_callback":stats(active.physics_samples),"process_frame_interval":stats(active.frame_samples),"evidence":active.evidence}
 rows.append(row);active={};print("E2E_STAGE ",JSON.stringify(row))
func before_physics() -> void:
 profile_stage=str(active.get("id","loading"))
 physics_start=Time.get_ticks_usec()
func after_physics() -> void:
 if not active.is_empty() and physics_start>0:
  var us: int=Time.get_ticks_usec()-physics_start
  active.physics_samples.append(us)
  if us>int(worst_tick.get("us",0)):
   worst_tick={"us":us,"stage":profile_stage,"frame":Engine.get_physics_frames(),"callbacks":{}}
   for key in callback_costs:
    var row: Dictionary=callback_costs[key]
    if row.frame==Engine.get_physics_frames() and row.start>0:worst_tick.callbacks[key]={"us":row.last_us,"start":row.start-physics_start,"end":row.end-physics_start}
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
  event_rows.append({"kind":kind,"reason":packet.get("reason",""),"ok":packet.get("ok"),"id":packet.get("enemy_id",packet.get("id"))})
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
# Test placement only: prefer a currently ready natural contact attacker rather
# than pinning to the first registry actor while its attack is cooling down.
func place_in_natural_contact() -> Dictionary:
 var best: Node
 var score: float=-INF
 var best_cooldown: float=0.0
 for enemy in main.world.get_enemies():
  if not is_instance_valid(enemy) or enemy.get("alive")!=true or not is_instance_valid(main.native_natural_enemies):continue
  # Hive bloater (etype1) has ranged stages only, no natural melee contact.
  if enemy.get("etype") not in [0,4,6,18,19]:continue
  var point: Vector2=enemy.global_position+Vector2(24,0)
  if not main.world.can_move(point,main.player.radius):continue
  var raw_cooldown: Variant=enemy.get("st2" if enemy.etype in [0,6] else "_contact_ticks")
  # Placement ranking only; absent timer is zero, never a product timer write.
  var cooldown: float=float(raw_cooldown) if raw_cooldown is float or raw_cooldown is int else 0.0
  var raw_attack: Variant=enemy.get("attack")
  if not (raw_attack is float or raw_attack is int):continue
  var value: float=float(raw_attack)/(1.0+maxf(0.0,cooldown))
  if enemy.get("state")!="idle":value*=.01
  if value>score:best=enemy;score=value;best_cooldown=cooldown
 if not is_instance_valid(best):return {"placed":false}
 navigate_input(best.global_position+Vector2(24,0))
 return {"placed":true,"actor":best.get_instance_id(),"etype":best.etype,"distance":main.player.global_position.distance_to(best.global_position),"state":best.state,"cooldown":best_cooldown}
func steer_input(at: Vector2) -> void:
 var delta: Vector2=at-main.player.global_position
 var direction: Vector2=delta.normalized() if delta.length()>25 else Vector2.ZERO
 boss_input("move_up",direction.y<-.25);boss_input("move_down",direction.y>.25);boss_input("move_left",direction.x<-.25);boss_input("move_right",direction.x>.25)
# Harness navigation cache only. Uses the actual web tile graph; never writes actors.
var navigation: RefCounted
var navigation_cell:=Vector2i(-999,-999)
func navigate_input(at: Vector2) -> void:
 var provider: Node=main.native_map11.provider()
 if navigation==null:
  navigation=preload("res://scripts/maps/map11/web_flow.gd").new()
  navigation.configure(provider.field.data)
 var cell:=Vector2i(int(at.x/40),int(at.y/40))
 if cell!=navigation_cell:
  navigation.prepare(at);navigation_cell=cell
 var direction: Vector2=navigation.direction(main.player.global_position)
 if main.player.global_position.distance_to(at)<55:direction=(at-main.player.global_position).normalized() if main.player.global_position.distance_to(at)>12 else Vector2.ZERO
 # Validate each movement axis against the real radius/prop collision owner.
 var step: Vector2=direction*12
 if not main.world.can_move(main.player.global_position+step,main.player.radius):
  if main.world.can_move(main.player.global_position+Vector2(step.x,0),main.player.radius):direction.y=0
  elif main.world.can_move(main.player.global_position+Vector2(0,step.y),main.player.radius):direction.x=0
  else:direction=Vector2.ZERO
 boss_input("move_up",direction.y<-.25);boss_input("move_down",direction.y>.25);boss_input("move_left",direction.x<-.25);boss_input("move_right",direction.x>.25)
func nearest_natural_enemy() -> Node:
 var best: Node;var distance:=INF
 for enemy in main.world.get_enemies():
  if not is_instance_valid(enemy) or enemy.get("alive")!=true or not enemy.has_method("receive_damage"):continue
  var d: float=enemy.global_position.distance_squared_to(main.player.global_position)
  if d<distance:distance=d;best=enemy
 return best
func fight_natural(target: Node,deadline_ms: int) -> Dictionary:
 var attacks:=0;var accepted:=0;var start: Vector2=main.player.global_position
 var observed: Array=[target]
 var killed_ids: Array=[]
 var deadline: int=Time.get_ticks_msec()+deadline_ms
 while is_instance_valid(target) and target.alive and main.player.hp>0 and Time.get_ticks_msec()<deadline:
  var closest: Node=nearest_natural_enemy()
  if is_instance_valid(closest) and closest!=target and closest.global_position.distance_to(main.player.global_position)+20<target.global_position.distance_to(main.player.global_position):
   target=closest;observed.append(target)
  var distance: float=main.player.global_position.distance_to(target.global_position)
  navigate_input(target.global_position)
  boss_aim(target.global_position)
  if distance<47+float(target.radius)-4:
   boss_release();boss_aim(target.global_position)
   if main.player.state=="idle":
    var admission: Dictionary=boss_input("weapon",true);attacks+=1
    if admission.get("accepted",false):accepted+=1
    await physics_frame
    boss_input("weapon",false)
  await physics_frame
 boss_release()
 for actor in observed:
  if is_instance_valid(actor) and not actor.alive and not killed_ids.has(actor.get_instance_id()):killed_ids.append(actor.get_instance_id())
 return {"killed_actor_ids":killed_ids,"attacks":attacks,"input_presses":accepted,"start":str(start),"end":str(main.player.global_position),"target_alive":target.alive if is_instance_valid(target) else null,"input_only":true}
func boss_input(action: String,pressed: bool) -> Dictionary:
 var event:=InputEventAction.new();event.action=action;event.pressed=pressed
 return main.player.handle_native_input_event(event)
func boss_release() -> void:
 boss_input("move_up",false);boss_input("move_down",false);boss_input("move_left",false);boss_input("move_right",false);boss_input("weapon",false)
func boss_aim(at: Vector2) -> void:
 var event:=InputEventMouseMotion.new();event.position=root.get_visible_rect().size*.5+(at-main.camera.get_screen_center_position())*main.camera.zoom
 main.player.handle_native_input_event(event)
func play_bossroom_route(provider: Node,max_ms: int) -> Dictionary:
 var trace: Array=[];var deadline: int=Time.get_ticks_msec()+max_ms;var attacks:=0;var moves:=0
 if not is_instance_valid(provider):return {"reason":"provider_absent","input_only":true}
 if main.player.hp<=0:return {"reason":"player_not_alive_after_revival_stage","input_only":true,"hp":main.player.hp}
 var g: Dictionary=main.source_state.read_current_g();var targets: Array=[]
 # Actual provider waypoints, no replacement map/provider and no teleports.
 for i in range(4):targets.append("map11.field.angler."+str(i))
 for hole in provider.anchors("hole"):targets.append(hole.id)
 targets.append("map11.field.gate")
 var leg:=0;var frame:=0;var query: Dictionary={};var last_progress:=Time.get_ticks_msec();var last_pos: Vector2=main.player.global_position
 var flow: String=""
 while Time.get_ticks_msec()<deadline and main.player.hp>0:
  if g.get("_bossLoadPhase",0)>0:
   boss_release()
   # Full 50+130+50+100 loading sequence, not a single frame.
   while g.get("_bossLoadPhase",0)>0 and Time.get_ticks_msec()<deadline:await physics_frame
   return {"reason":"load_complete" if g.get("_bossLoadPhase",0)==0 else "load_deadline","input_only":true,"attacks":attacks,"moves":moves,"trace":trace,"phase":g.get("_bossLoadPhase",0),"fbDone":g.get("_fbDone",false),"unlocked":g.get("_bossUnlocked",false)}
  if leg>=targets.size():leg=0
  var target_id: String=targets[leg]
  if flow.is_empty():flow=provider.prepare_flow(target_id,main.player.radius)
  var nearest: Node;var distance:=280.0
  for enemy in main.world.get_enemies():
   if is_instance_valid(enemy) and enemy.get("alive")==true:
    var d: float=enemy.global_position.distance_to(main.player.global_position)
    if d<distance:distance=d;nearest=enemy
  var aim: Vector2=main.player.global_position;var close:=false
  if is_instance_valid(nearest):aim=nearest.global_position;close=distance<100
  var fb_index: int=leg if leg<4 else -1
  if fb_index>=0 and g.get("_fieldBosses") is Array and fb_index<g._fieldBosses.size() and g._fieldBosses[fb_index] is Dictionary:
   var fb: Dictionary=g._fieldBosses[fb_index];var at:=Vector2(fb.x,fb.y)
   if at.distance_to(main.player.global_position)<360:aim=at;close=at.distance_to(main.player.global_position)<155
  var direction:=Vector2.ZERO
  if close:
   boss_aim(aim)
   if frame%12==0:boss_input("weapon",true);attacks+=1
   elif frame%12==4:boss_input("weapon",false)
  else:
   boss_input("weapon",false)
   if not flow.is_empty() and provider.flow_query(flow,main.player.global_position,query):direction=query.get("direction",Vector2.ZERO)
   if aim!=main.player.global_position and aim.distance_to(main.player.global_position)<280:direction=(aim-main.player.global_position).normalized()
  boss_input("move_up",direction.y<-.25);boss_input("move_down",direction.y>.25);boss_input("move_left",direction.x<-.25);boss_input("move_right",direction.x>.25)
  if direction!=Vector2.ZERO:moves+=1
  if main.player.global_position.distance_to(last_pos)>30:last_progress=Time.get_ticks_msec();last_pos=main.player.global_position
  if (query.get("arrived",false) and not close) or Time.get_ticks_msec()-last_progress>8000 or (fb_index>=0 and g.get("_fieldBosses") is Array and not g._fieldBosses[fb_index] is Dictionary):
   if trace.size()<64:trace.append({"target":target_id,"hp":main.player.hp,"fbDone":g.get("_fbDone",false),"unlocked":g.get("_bossUnlocked",false),"flow":flow,"position":str(main.player.global_position)})
   if not flow.is_empty():provider._flows.erase(flow) # harness releases its completed navigation cache only
   leg+=1;flow="";last_progress=Time.get_ticks_msec();query.clear()
  frame+=1;await physics_frame
 boss_release()
 return {"reason":"player_died" if main.player.hp<=0 else "route_deadline","input_only":true,"attacks":attacks,"moves":moves,"trace":trace,"fbDone":g.get("_fbDone",false),"unlocked":g.get("_bossUnlocked",false)}
func run() -> void:
 Engine.physics_ticks_per_second=120;Engine.max_fps=240
 node_added.connect(profile_added)
 root.show() # Logical document visibility for headless input; no display window is rendered.
 var first:=Stamp.new();first.process_mode=Node.PROCESS_MODE_ALWAYS;first.process_physics_priority=-1000000;first.physics=before_physics;root.add_child(first);sample_nodes.append(first)
 var last:=Stamp.new();last.process_mode=Node.PROCESS_MODE_ALWAYS;last.process_physics_priority=1000000;last.physics=after_physics;last.process=process_sample;root.add_child(last);sample_nodes.append(last)
 begin("isolation")
 var expected_userdir: String=arg("--isolated-userdir",USERDIR)
 var isolated: bool=expected_userdir.begins_with("EXODUSER-demo11-") and expected_userdir.contains("Isolated") and DisplayServer.get_name()=="headless" and ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and OS.get_user_data_dir().get_file()==expected_userdir
 if not isolated:
  await done("FAIL","headless/custom-userdir guard refused; no stores opened");await fail_remaining("isolation_guard");finish();return
 store=Store.new();var shared:=Shared.new()
 var clean: bool=clear_own_store(store,Array(Store.KEYS)) and clear_own_store(shared,shared._allowed_keys())
 await done("PASS" if clean else "FAIL","",{"userdir":OS.get_user_data_dir(),"headless":true,"own_store_reset":clean})
 if not clean:await fail_remaining("isolated_store_unavailable");finish();return
 begin("new_game")
 screen=load("res://scenes/demo_lobby.tscn").instantiate();screen.set_meta("native_lobby_entry_enabled",true)
 screen.set_meta("native_audio_source_root",arg("--source-root"));screen.set_meta("native_story_source_root",arg("--source-root"));root.add_child(screen);current_scene=screen
 # The lobby also starts gate/world movie on its first deferred frame.
 # Buttons must never be invoked beneath it: warrior would inherit paused=true.
 await process_frame;await process_frame
 key(KEY_ESCAPE,true);await wait_wall(5150);key(KEY_ESCAPE,false)
 if paused:
  await done("FAIL","lobby cinematic did not release pause after real ESC hold");await fail_remaining("lobby_cinematic");finish();return
 screen.cards[0].pressed.emit()
 await done("PASS" if screen._form.visible and screen.menu.selected==0 else "FAIL","",{"input":"actual slot0 Button.pressed"})
 begin("character_create")
 # Observe this startup allocation once; no per-frame child-list polling.
 var character_movie: Dictionary={"node":null}
 screen.child_entered_tree.connect(func(child: Node):
  if child.get_script()==VIDEO:character_movie.node=child)
 screen.character_buttons[0].pressed.emit();screen.name_input.text="자동 순례자";screen._create()
 # character-story-player.js:4,51-63: real held Space, 1200ms (96.4s movie).
 root.mode=Window.MODE_WINDOWED;root.show()
 var movie_deadline:=Time.get_ticks_msec()+5000
 while Time.get_ticks_msec()<movie_deadline and not is_instance_valid(character_movie.node):await process_frame
 var movie: Node=character_movie.node
 if not is_instance_valid(movie) or movie.phase!="playing" or movie.group!="warrior":
  await done("FAIL","character story owner missing");await fail_remaining("character_story_missing");finish();return
 var story_started:=Time.get_ticks_msec()
 key(KEY_SPACE,true);await wait_wall(1350);key(KEY_SPACE,false)
 var character_story_ms: int=Time.get_ticks_msec()-story_started
 action_end()
 for i in 300:
  await process_frame
  if is_instance_valid(current_scene) and current_scene.has_method("request_native_lobby_entry"):main=current_scene;break
 if not is_instance_valid(main):
  await done("FAIL","character metadata did not hand off to Main");await fail_remaining("Main_missing");finish();return
 root.mode=Window.MODE_WINDOWED;root.show() # Main video setup can minimize the logical headless root.
 main.player.telemetry_event.connect(on_event)
 main.native_demo_anglers.profile_enabled=true
 if is_instance_valid(main.native_natural_enemies):main.native_natural_enemies.profile_enabled=true
 main.native_demo_boss_defeated.connect(func(stage_index: int):
  if stage_index==0:boss_signal_count+=1)
 var created: Dictionary=store.read_json("hellsave_demo_0")
 var char_ok: bool=created.get("ready",false) and created.get("found",false) and created.value.get("charIdx")==0 and main.player.get_native_character_profile_snapshot().get("index")==0
 await done("PASS" if char_ok else "FAIL","",{"character_story_hold_ms":character_story_ms,"character_story_input":"real Space press/release; no finish endpoint","actual_Metadata_IO":created.get("found",false),"active_slot":store.get_item("hellsave_demo_active").get("raw"),"character_index":main.player.get_native_character_profile_snapshot().get("index"),"input":"char0 Button + name + actual create callback"})
 begin("intro_skip")
 var story: Node=main.get("native_story_intro");var intro_ok:=true;var media_phase:="absent"
 if is_instance_valid(story) and story.phase in ["playing","error"]:
  media_phase=story.phase;key(KEY_SPACE,true);await wait_wall(2150);key(KEY_SPACE,false);await settle(2)
  intro_ok=story.phase=="done" and story.handoff_count==1
 var guide: Node=main.get("source_intro_sequence")
 if is_instance_valid(guide) and guide.phase=="guide":
  key(KEY_SPACE,true);await wait_wall(2150);key(KEY_SPACE,false)
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
 var target: Node=nearest_natural_enemy()
 var spawn_started:=Time.get_ticks_msec()
 var spawn_deadline:=spawn_started+35000
 var hole_anchors: Array=product.provider().anchors("hole") if adapter!=null and adapter.is_current() else []
 hole_anchors.sort_custom(func(a,b):return a.marker.global_position.distance_squared_to(main.player.global_position)<b.marker.global_position.distance_squared_to(main.player.global_position))
 while not is_instance_valid(target) and Time.get_ticks_msec()<spawn_deadline and main.player.hp>0:
  if not hole_anchors.is_empty():navigate_input(hole_anchors[0].marker.global_position)
  await physics_frame
  target=nearest_natural_enemy()
 var regions: Node=main.get_node_or_null("NativeRegions")
 var region_before: int=regions.snapshot().kill_calls if is_instance_valid(regions) else 0
 var origin_before: int=main.native_natural_enemies.counts.origin_kills if is_instance_valid(main.native_natural_enemies) else 0
 var home: Vector2=main.player.global_position;var attacks:=0;var accepted:=0;var event_start:=event_rows.size()
 var crossbow_observation: Dictionary={}
 if is_instance_valid(target):
  var bow_before: Dictionary=main.native_auto_crossbow.snapshot().duplicate(true)
  var fight: Dictionary=await fight_natural(target,45000)
  attacks=fight.attacks;accepted=fight.input_presses
  crossbow_observation=main.native_auto_crossbow.snapshot().duplicate(true)
  crossbow_observation["fired_delta"]=int(crossbow_observation.fired)-int(bow_before.fired)
  crossbow_observation["hits_delta"]=int(crossbow_observation.hits)-int(bow_before.hits)
  crossbow_observation["navigation"]=fight
 var region_after: int=regions.snapshot().kill_calls if is_instance_valid(regions) else 0
 var observed_deaths: Array=crossbow_observation.get("navigation",{}).get("killed_actor_ids",[])
 var killed: bool=not observed_deaths.is_empty() and region_after>region_before
 await done("PASS" if killed else "NOT_READY","" if killed else ("MAP11_or_initial_combat_target_absent" if not is_instance_valid(target) else "actual combat kill not completed; preserve PC halt/owner boundary"),{"automatic_crossbow":crossbow_observation,"kill_path":"melee" if attacks>0 else "automatic_crossbow","natural_origin_before":origin_before,"natural_origin_after":region_after,"region_before":region_before,"spawn_counts":main.native_natural_enemies.counts if is_instance_valid(main.native_natural_enemies) else {},"attacks":attacks,"accepted":accepted,"killed":killed,"events":event_rows.slice(event_start),"target_id":target.data.get("id") if is_instance_valid(target) else "absent","HP_or_damage_fabricated":false})
 begin("item_pickup")
 var inv: Dictionary=main.source_state.read_current_inventory();var before_size: int=inv.bag.size();var records: Array=main.source_state.read_native_drop_records()
 # Continue real combat until a natural equipment drop exists; no RNG/XP fixture.
 var loot_deadline:=Time.get_ticks_msec()+60000
 while records.is_empty() and main.player.hp>0 and Time.get_ticks_msec()<loot_deadline:
  var next: Node=nearest_natural_enemy()
  if is_instance_valid(next):await fight_natural(next,8000)
  elif not hole_anchors.is_empty():navigate_input(hole_anchors[0].marker.global_position);await settle(12)
  else:break
  records=main.source_state.read_native_drop_records()
 if not records.is_empty() and records[0].get("item") is Dictionary:
  item=records[0].item
  var drop: Dictionary=records[0]
  var point:=Vector2(float(drop.get("x",main.player.global_position.x)),float(drop.get("y",main.player.global_position.y)))
  var pickup_deadline:=Time.get_ticks_msec()+15000
  while main.player.hp>0 and main.player.global_position.distance_to(point)>45 and Time.get_ticks_msec()<pickup_deadline:
   navigate_input(point);await physics_frame
 boss_release()
 await settle(3);key(KEY_R,true);await process_frame;key(KEY_R,false);await settle(3)
 var picked: bool=not item.is_empty() and inv.bag.any(func(v):return is_same(v,item)) and inv.bag.size()>before_size
 await done("PASS" if picked else "NOT_READY","" if picked else "actual R pickup did not admit item",{"synthetic_R_via_Input":true,"bag_before":before_size,"bag_after":inv.bag.size(),"same_item_identity":picked,"handwritten_item":false})
 begin("equip")
 var equip: Dictionary={"reason":"item_or_interface_absent"}
 if not item.is_empty() and main.has_method("request_native_equip_item"):equip=main.request_native_equip_item(item)
 var equipped: bool=equip.get("applied",false) and inv.equipped.values().any(func(v):return v is Dictionary and is_same(v,item)) and refresh_readback(equip.get("refresh",{}))
 await done(verdict(equip.get("applied",false),equipped),"" if equipped else str(equip.get("reason","equipment_refresh_not_ready")),{"applied":equip.get("applied",false),"same_item_equipped":equipped,"refresh_readback":refresh_readback(equip.get("refresh",{})),"refresh":equip.get("refresh",{})})
 begin("auto_potion")
 # Count from stage entry, including a real natural heal during cooldown wait.
 # Stop waiting on use so its actual material/cooldown receipt remains observable.
 steer_input(home)
 var potion: RefCounted=main.get("source_potion")
 var potion_entry: Dictionary={"hp":main.player.hp,"iframes":main.player.iframes,"runtime":main.source_state.read_native_potion_runtime().duplicate(true),"uses":potion.get_snapshot().uses if is_instance_valid(potion) else -1}
 var used_before: int=int(potion_entry.uses)
 var mats_before: float=float(g.get("mats",0))
 var wait_start:=Time.get_ticks_msec()
 var cooldown_deadline:=wait_start+20000
 while (main.player.iframes>0 or main.source_state.read_native_potion_runtime().cd>0) and Time.get_ticks_msec()<cooldown_deadline and (not is_instance_valid(potion) or potion.get_snapshot().uses==used_before):
  # Placement only: step out of contact while the real potion cooldown advances.
  var away:=Vector2.ZERO
  for enemy in main.world.get_enemies():
   if is_instance_valid(enemy) and enemy.get("alive")==true and main.player.global_position.distance_to(enemy.global_position)<400:
    away+=(main.player.global_position-enemy.global_position).normalized()
  if away.length_squared()>0:
   var point: Vector2=main.player.global_position+away.normalized()*12
   if main.world.can_move(point,main.player.radius):steer_input(point)
  await physics_frame
 var potion_after_wait: Dictionary={"uses":potion.get_snapshot().uses if is_instance_valid(potion) else -1,"hp":main.player.hp,"iframes":main.player.iframes,"runtime":main.source_state.read_native_potion_runtime().duplicate(true),"wait_ms":Time.get_ticks_msec()-wait_start,"timed_out":Time.get_ticks_msec()>=cooldown_deadline}
 var damage_path: Array=[]
 var requests:=0 # No harness damage request; only natural AI invokes hurtP.
 if is_instance_valid(potion):
  var until:=Time.get_ticks_msec()+30000
  while Time.get_ticks_msec()<until and potion.get_snapshot().uses==used_before and main.player.hp>0:
   var placement: Dictionary=place_in_natural_contact()
   if damage_path.size()<32 and placement.get("placed",false):damage_path.append(placement)
   await physics_frame
 var used: bool=is_instance_valid(potion) and potion.get_snapshot().uses>used_before
 var pot_ok: bool=used and float(g.get("mats",0))<mats_before and main.source_state.read_native_potion_runtime().cd>0
 await done(verdict(used,pot_ok),"" if pot_ok else "real hurtP/iframe/threshold/clock did not produce auto-potion",{"entry":potion_entry,"after_wait":potion_after_wait,"damage_path":damage_path,"request_loop_exit":"used" if used else ("hp_le_1" if main.player.hp<=1 else "deadline_or_owner_unavailable"),"uses_before":used_before,"uses_after":potion.get_snapshot().uses if is_instance_valid(potion) else 0,"damage_requests_through_PC":requests,"HP_written_directly":false,"mats_before":mats_before,"mats_after":g.get("mats"),"runtime":main.source_state.read_native_potion_runtime()})
 begin("level_up")
 var p: Dictionary=main.source_state.read_current_p();var lv_before: int=int(p.lv)
 # Earn the original curve through actual inputs and natural kill rewards.
 var growth_deadline:=Time.get_ticks_msec()+60000
 while int(p.lv)<=initial_level and main.player.hp>0 and Time.get_ticks_msec()<growth_deadline:
  var next: Node=nearest_natural_enemy()
  if not is_instance_valid(next):break
  await fight_natural(next,8000)
 var level_ok: bool=int(p.lv)>initial_level and int(p.lv)<=100
 await done("PASS" if level_ok else "NOT_READY","" if level_ok else "natural combat XP did not level up",{"before":initial_level,"after":p.lv,"SP":p.sp,"AP":p.ap,"XP_injected":false})
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
 # Observe potentially terminal life resolution only after all living-player checks.
 begin("revival_interface")
 var life_api: bool=main.has_method("request_native_player_life_transition") and is_instance_valid(main.native_demo_life)
 var life: Dictionary=main.native_demo_life.snapshot() if life_api else {}
 var natural_trace: Array=[]
 var hp_before: float=main.player.hp
 var prior_fallen: bool=life.get("receipts",[]).any(func(r):return r.get("op")=="fallen_enter" and r.get("status")=="APPLIED")
 var min_hp: float=hp_before
 var contact_frames:=0
 var started:=Time.get_ticks_msec()
 var deadline:=started+120000
 # Only test-owned placement. Actual scheduler/AI/attack/hurtP/life owners run.
 # Do not call damage, mutate HP/iframes/RNG, or emit any life signal.
 while life_api and Time.get_ticks_msec()<deadline:
  life=main.native_demo_life.snapshot()
  var phase: String=str(life.get("phase",{}).get("phase",""))
  if phase in ["hp0","fallen","dead"] or (prior_fallen and main.player.hp>0):break
  var placement: Dictionary=place_in_natural_contact()
  if placement.get("placed",false):contact_frames+=1
  await physics_frame
  if main.player.hp<min_hp:
   min_hp=main.player.hp
   natural_trace.append({"ms":Time.get_ticks_msec()-started,"hp":min_hp,"phase":main.read_native_player_life_phase().duplicate(true)})
 var countdown: Array=[]
 var resolve_deadline:=Time.get_ticks_msec()+15000
 while life_api and Time.get_ticks_msec()<resolve_deadline:
  life=main.native_demo_life.snapshot()
  var phase: String=str(life.get("phase",{}).get("phase",""))
  if phase=="dead" or (phase=="alive" and main.player.hp>0):break
  if phase not in ["hp0","fallen"]:break
  if countdown.is_empty() or float(countdown[-1].remaining)-float(life.remaining)>=30:
   countdown.append({"phase":phase,"remaining":life.remaining,"ms":Time.get_ticks_msec()-started})
  await physics_frame
 life=main.native_demo_life.snapshot() if life_api else {}
 var entered: bool=life.get("receipts",[]).any(func(r):return r.get("op")=="fallen_enter" and r.get("status")=="APPLIED")
 var resolved: bool=life.get("receipts",[]).any(func(r):return r.get("op") in ["revive_resolve","final_death"] and r.get("status")=="APPLIED")
 var observed: bool=entered and (prior_fallen or min_hp<=0)
 await done("PASS" if observed else "NOT_READY","" if observed else ("natural HP0 not observed within 120s of natural AI contact" if min_hp>0 else "natural HP0 observed; fallen/countdown/resolve incomplete"),{"interface_present":life_api,"consumer_snapshot":life,"lethal_damage_forced":false,"transition_injected":false,"transferred_prior_fallen_receipt":prior_fallen,"observation_scope":"actual natural fallen receipt; resolution reported separately","hp_before":hp_before,"min_hp":min_hp,"contact_frames":contact_frames,"max_observation_ms":120000,"auto_potion_unchanged":true,"damage_requests_from_harness":0,"natural_damage_trace":natural_trace,"countdown_trace":countdown,"fallen_applied":entered,"resolve_applied":resolved,"elapsed_ms":Time.get_ticks_msec()-started})
 begin("bossroom_gate")
 var retry_trace: Dictionary={"needed":main.player.hp<=0,"input":"actual Retry Button.pressed","HP_written":false}
 if main.player.hp<=0 and main.native_demo_life.snapshot().get("retry_stage_ready",false):
  var old_main: Node=main
  var life_view: Node=main.native_demo_life
  life_view._retry.pressed.emit()
  retry_trace["receipt"]=life_view.snapshot().last.duplicate(true)
  var retry_deadline:=Time.get_ticks_msec()+20000
  while Time.get_ticks_msec()<retry_deadline:
   await process_frame
   if is_instance_valid(current_scene) and current_scene!=old_main and current_scene.get("player")!=null:
    main=current_scene
    main.native_demo_boss_defeated.connect(func(stage_index: int):
     if stage_index==0:boss_signal_count+=1)
    break
  retry_trace["scene_reloaded"]=is_instance_valid(main) and main!=old_main
  if is_instance_valid(main):
   g=main.source_state.read_current_g()
   retry_trace["hp_after"]=main.player.hp
 var encounter: Node=main.get("native_demo_encounter");var encounter_snapshot: Dictionary=encounter.snapshot() if is_instance_valid(encounter) else {}
 var gate_receipt: Dictionary={}
 var provider: Node=main.read_native_map11_provider()
 var route: Dictionary=await play_bossroom_route(provider,180000)
 if is_instance_valid(encounter):encounter_snapshot=encounter.snapshot()
 route["retry"]=retry_trace
 gate_receipt=route
 var gate_ok: bool=encounter_snapshot.get("provider_bound",false) and encounter_snapshot.get("phase") in ["arena","exit","clear"]
 await done("PASS" if gate_ok else "NOT_READY","" if gate_ok else "actual MAP11 gate/arena prerequisites not satisfied",{"encounter":encounter_snapshot,"gate_flags_written":false,"HP_damage_or_state_injected":false,"entry_receipt":gate_receipt,"fieldboss":main.native_demo_anglers.snapshot(),"regions":main.get_node("NativeRegions").snapshot(),"boss":main.read_native_demo_boss()})
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
 # Retry replaces Main/State; read the current P, as source G62135 does.
 var saved_player: Dictionary=main.source_state.read_current_p()
 var save_ok: bool=save.get("committed",false) and disk.get("ready",false) and disk.get("found",false) and disk.value.get("player") is Dictionary and int(disk.value.player.lv)==int(saved_player.lv)
 await done(verdict(save.get("committed",false),save_ok),"" if save_ok else str(save.get("reason","save_session_not_admitted")),{"receipt":save,"live_level":saved_player.lv,"disk_payload_found":disk.get("found",false),"slot0_metadata_preserved":store.read_json("hellsave_demo_0").get("found",false)})
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
 var result: Dictionary={"overall":overall,"counts":counts,"failures":counts.FAIL,"stages":rows,"stage_order_complete":rows.size()==ORDER.size(),"continuous_E2E":overall=="PASS" and not checkpoint,"headless":DisplayServer.get_name()=="headless","userdir":OS.get_user_data_dir(),"scheduler_max_us":main.native_natural_enemies.scheduler_max_us if is_instance_valid(main) and is_instance_valid(main.native_natural_enemies) else 0,"angler_profile":main.native_demo_anglers.snapshot() if is_instance_valid(main) else {},"worst_tick":worst_tick,"callback_costs":callback_costs,"profile_calls":root.get_meta("demo47i_perf",{}),"physics_hz":Engine.physics_ticks_per_second,"budget_ms":1000.0/120,"performance_scope":"headless callback CPU span and process_frame wall intervals; GPU excluded; command_span_ms includes asynchronous waits; not a CPU timer","visual_audio_QA":false}
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
