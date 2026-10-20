extends SceneTree
const USERDIR="EXODUSER-demo11-perf-enemy-Isolated-20261021"
const BASE_TEST=preload("res://tests/test_demo11_enemy_base.gd")
var main: Node
var provider: Node
var actors: Array=[]
var samples: Array[int]=[]
var frame_samples: Array[int]=[]
var population:=30
var ticks:=360
var warmup:=60
var mode:="cpu"
var count:=0
var started:=0
var wall_begin:=0
var frame_begin:=0
var frames:=0
var checks:=0
var failures:=0
var profile:=false
class Stamp extends Node:
 var action: Callable
 func _physics_process(_dt: float) -> void:action.call()
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("ENEMY_PERF_FAIL ",label)
func context() -> Dictionary:return {"lesson_active":false,"qa_storage_active":false,"aggro_active":false}
func arg(key: String,fallback: String) -> String:
 for a in OS.get_cmdline_user_args():
  if a.begins_with(key+"="):return a.substr(key.length()+1)
 return fallback
func step() -> void:
 main.world._physics_process(1.0/120)
 main.world.advance_native_owner_phase()
 main.world.advance_native_birth_phase()
 main.native_natural_enemies.advance_scheduler(main.world.get_native_frame())
func setup() -> void:
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 main.process_mode=Node.PROCESS_MODE_DISABLED
 for e in main.world.get_enemies():e.process_mode=Node.PROCESS_MODE_DISABLED
 provider=BASE_TEST.Provider.new();main.world.add_child(provider)
 for y in range(-10,11):
  for x in range(-10,11):
   var at: Vector2=main.player.global_position+Vector2(x*45,y*45)
   if at.distance_to(main.player.global_position)<100 or not main.world.can_move(at,24):continue
   var marker:=Marker2D.new();provider.add_child(marker);marker.global_position=at;provider.candidates.append(marker)
 check(provider.candidates.size()>=population,"enough_real_Marker_candidates")
 for i in 4:
  var marker:=Marker2D.new();provider.add_child(marker);marker.global_position=provider.candidates[i].global_position
  provider.rows.append({"id":"perf-site-"+str(i),"marker":marker,"region_id":i,"room":-1,"size":0.5})
  provider.groups.append({"hole_id":"perf-site-"+str(i),"spawn_group_id":"perf-group-"+str(i),"region_id":i,"total":15})
 var admission: Dictionary=main.bind_native_spawn_stage_provider(provider)
 check(admission.get("ready",false),"real_provider:"+str(admission))
 if not admission.get("ready",false):return
 var binding: Dictionary=main.bind_native_natural_enemy_base(context)
 check(binding.get("ready",false),"actual_common_owner:"+str(binding))
 if not binding.get("ready",false):return
 var g: Dictionary=main.source_state.read_current_g();g.on=true;g.paused=false
 main.world._physics_process(1.0/120)
 seed(20261021)
 for i in population:
  var recipe: Dictionary={"etype":0,"spawn_n":i%15+1,"elite":0,"mods":[],"speed_u":0.5,"radius_u":0.5,"literal":{"st2":30.0,"facing":0.0,"projT":240.0,"bossPatT":40.0,"_bossOrbitAng":1.0,"_erraticAng":1.0}}
  var made: Dictionary=main.native_natural_enemies.spawn_selected(main.world.get_node("NativeSpawnHoleSystem"),"perf-group-"+str(int(i/15)),recipe)
  check(made.get("ready",false),"actual_spawn_"+str(i)+str(made.get("reason","")))
  if made.get("ready",false):actors.append(made.actor)
 for a in actors:a.alerted=true;a._projectile_ticks=0.0
 for h in main.world.get_node("NativeSpawnHoleSystem").holes:
  h._spawnCD=1000000.0;h._triggered=true;h._spawnDelay=0.0;h._spawnTotal=15;h._spawnInterval=60
 main.player.iframes=1000000.0 # Isolated benchmark excludes protected incoming damage cost.
func run() -> void:
 population=int(arg("--population","30"));ticks=int(arg("--ticks","360"));mode=arg("--mode","cpu");profile=arg("--profile","off")=="on"
 check(OS.get_user_data_dir().ends_with(USERDIR),"isolated_namespace")
 setup()
 if failures or actors.size()!=population:finish();return
 if mode=="cpu":
  for i in warmup:step()
  if profile:EngineDebugger.profiler_enable("servers",true,[512,true])
  wall_begin=Time.get_ticks_usec()
  for i in ticks:
   var t:=Time.get_ticks_usec();step();samples.append(Time.get_ticks_usec()-t)
  if profile:EngineDebugger.profiler_enable("servers",false)
  finish();return
 Engine.physics_ticks_per_second=120
 Engine.max_fps=0
 if DisplayServer.get_name()!="headless":DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
 main.process_mode=Node.PROCESS_MODE_INHERIT
 var first:=Stamp.new();first.process_physics_priority=-1000;first.action=stamp;root.add_child(first)
 var last:=Stamp.new();last.process_physics_priority=1000;last.action=end_tick;root.add_child(last)
 process_frame.connect(process_stamp)
func stamp() -> void:started=Time.get_ticks_usec()
func process_stamp() -> void:
 if count<=warmup:return
 var now:=Time.get_ticks_usec()
 if frame_begin>0:frame_samples.append(now-frame_begin)
 frame_begin=now;frames+=1
func end_tick() -> void:
 count+=1
 if count==warmup and profile:EngineDebugger.profiler_enable("servers",true,[512,true])
 if count<=warmup:return
 if samples.is_empty():wall_begin=started
 samples.append(Time.get_ticks_usec()-started)
 if samples.size()==ticks:paused=true;call_deferred("finish")
func stats(values: Array[int]) -> Dictionary:
 if values.is_empty():return {}
 var ordered:=values.duplicate();ordered.sort();var sum:=0
 for v in values:sum+=v
 return {"mean_us":float(sum)/values.size(),"p99_us":ordered[maxi(0,int(ceil(values.size()*.99))-1)],"max_us":ordered[-1],"samples":values.size()}
func finish() -> void:
 if profile and mode!="cpu":EngineDebugger.profiler_enable("servers",false)
 var wall:=Time.get_ticks_usec()-wall_begin
 check(actors.size()==population and actors.all(func(a):return a.alive and a.is_inside_tree()),"fixed_live_cohort")
 var state_rows: Array=[]
 for a in actors:state_rows.append({"pos":[a.global_position.x,a.global_position.y],"hp":a.hp,"shield":a.eShield,"st2":a.st2,"charge":a.charge_ticks,"proj":a._projectile_ticks,"state":a.state,"native":a.native_frame,"revive":a.data.native_final.reviveIframes})
 var semantic: Dictionary={"actors":state_rows,"rng":main.world._native_random_draw_count,"counts":main.native_natural_enemies.counts,"projectiles":main.native_demo_boss_projectiles.snapshot().born}
 var summary: Dictionary={"state_digest":JSON.stringify(semantic).sha256_text(),"population":population,"mode":mode,"physics_hz":120,"native_sp":0.5,"ticks":ticks,"warmup":warmup,"profile":profile,"wall_us":wall,"tick_cpu":stats(samples),"render_frame_intervals":stats(frame_samples),"render_frames":frames,"registry_count":main.world.get_enemies().size(),"projectile_born":main.native_demo_boss_projectiles.snapshot().born,"rng_draws":main.world._native_random_draw_count,"checks":checks,"failures":failures,"cpu_scope":"World/native actor+particle/birth/scheduler; CPU mode excludes Player/process/render; automatic mode includes whole physics callback span","isolated_damage_cost_excluded":true}
 print("ENEMY_PERF_RESULT ",JSON.stringify(summary))
 main.queue_free();paused=false;await process_frame;await process_frame
 quit(1 if failures else 0)
