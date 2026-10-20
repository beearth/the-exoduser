extends SceneTree
## Focused Mac owner integration; deliberately not the 18-stage E2E.
const USERDIR="EXODUSER-demo11-47l-Mac-Isolated-20261021"
var tick_start:=0
var tick_max:=0
var worst: Dictionary={}
var callback_costs: Dictionary={}
class Stamp extends Node:
 var action: Callable
 func _physics_process(_delta: float) -> void:action.call()
func start_tick() -> void:tick_start=Time.get_ticks_usec()
func end_tick() -> void:
 var elapsed:=Time.get_ticks_usec()-tick_start
 if elapsed>tick_max:
  tick_max=elapsed
  worst={"elapsed":elapsed,"time":Time.get_ticks_msec(),"spawn":main.native_natural_enemies.counts.duplicate() if is_instance_valid(main) and is_instance_valid(main.native_natural_enemies) else {}}

func install_probes(node: Node) -> void:
 for child in node.get_children():install_probes(child)
 if not node.is_physics_processing() or node.get_parent()==null:return
 var row: Dictionary={"start":0,"max_us":0,"calls":0}
 callback_costs[str(node.get_path())]=row
 var before:=Stamp.new();var after:=Stamp.new()
 before.process_physics_priority=node.process_physics_priority;after.process_physics_priority=node.process_physics_priority
 before.action=func():row.start=Time.get_ticks_usec()
 after.action=func():row.max_us=maxi(row.max_us,Time.get_ticks_usec()-row.start);row.calls+=1
 var parent:=node.get_parent();parent.add_child(before);parent.move_child(before,node.get_index());parent.add_child(after);parent.move_child(after,node.get_index()+1)
var main: Node
var failures:=0
var checks:=0
var evidence: Dictionary={}
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1
 evidence[label]=ok
func settle(n: int) -> void:
 for i in n:await physics_frame
 await process_frame
func run() -> void:
 if OS.get_user_data_dir().get_file()!=USERDIR:quit(1);return
 root.show()
 var first:=Stamp.new();first.process_physics_priority=-1000000;first.action=start_tick;root.add_child(first)
 var last:=Stamp.new();last.process_physics_priority=1000000;last.action=end_tick;root.add_child(last)
 root.set_meta("demo47i_stage","47l_mac_focused")
 main=load("res://scenes/main.tscn").instantiate()
 main.set_meta("native_intro_boot","intro")
 root.add_child(main);current_scene=main
 main.native_demo_anglers.profile_enabled=true
 main.native_natural_enemies.profile_enabled=true
 await settle(12)
 main.source_intro_sequence.finish_native_guide()
 var until:=Time.get_ticks_msec()+10000
 var flow: Node=main.source_intro_sequence.lesson_flow
 while not flow.active and Time.get_ticks_msec()<until:await process_frame
 check(flow.active,"actual_lesson_started")
 flow.skip_all()
 await settle(4)
 check(flow.seen and not flow.active,"actual_lesson_finished")
 tick_max=0
 install_probes(main)
 var clock: Dictionary=main.get_native_source_clock_input_snapshot()
 check(clock.get("update_clock_result",{}).get("status")=="CONTINUE","actual_update_prefix_continue")
 check(main.native_stage_spawn_adapter!=null and main.native_stage_spawn_adapter.is_current(),"MAP11_spawn_bound")
 check(main.native_demo_encounter.snapshot().provider_bound,"MAP11_gate_bound")
 var g: Dictionary=main.source_state.read_current_g()
 until=Time.get_ticks_msec()+15000
 while main.player.iframes>0 and Time.get_ticks_msec()<until:await physics_frame
 # Existing HP-pickup conversion supplies currency; never assign HP or potion state.
 if g.mats<=0:main.source_state.apply_native_add_potion(main,"hp",1)
 var uses: int=main.source_potion.get_snapshot().uses
 var mats: float=g.mats
 var hp_before: float=main.player.hp
 for i in 12:
  if main.source_potion.get_snapshot().uses>uses or main.player.hp<=1:break
  if main.player.iframes>0:await settle(8);continue
  main.player.receive_damage(maxi(1,int(main.player.hp*.25)),"phys")
  await settle(8)
 check(main.source_potion.get_snapshot().uses>uses,"actual_damage_auto_potion")
 check(g.mats<mats and main.source_state.read_native_potion_runtime().cd>0,"actual_potion_cost_cd")
 evidence.potion={"before_hp":hp_before,"after_hp":main.player.hp,"runtime":main.source_potion.get_snapshot(),"clock":main.get_native_source_clock_input_snapshot().get("update_clock_result",{})}
 var anchors: Array=main.native_map11.provider().anchors("hole")
 main.player.global_position=anchors[0].marker.global_position
 var target: Node
 until=Time.get_ticks_msec()+35000
 while Time.get_ticks_msec()<until:
  for actor in main.world.get_enemies():
   if is_instance_valid(actor) and actor.alive and actor.etype in [1,4] and main.native_natural_enemies.owns_actor(actor):target=actor;break
  if is_instance_valid(target):break
  # Visit actual provider sites; do not alter RNG or source spawn counters.
  var visit: int=int((35000-(until-Time.get_ticks_msec()))/7000)%anchors.size()
  main.player.global_position=anchors[visit].marker.global_position
  await physics_frame
 check(is_instance_valid(target),"actual_natural_spawn")
 var before: int=main.get_node("NativeRegions").snapshot().kill_calls
 var events: Array=[]
 main.player.telemetry_event.connect(func(kind,packet):
  if kind in ["native_hurte","native_hurte_halt"] and events.size()<8:events.append({"kind":kind,"packet":packet}))
 if is_instance_valid(target):
  until=Time.get_ticks_msec()+20000
  while target.alive and main.player.hp>0 and Time.get_ticks_msec()<until:
   main.player.global_position=target.global_position-Vector2(55,0);main.player.facing=Vector2.RIGHT
   if main.player.state=="idle":main.player.request_attack();main.player.release_attack()
   await settle(30)
   if events.any(func(e):return e.packet.get("enemy_id")==target.get_instance_id() and (e.kind=="native_hurte_halt" or e.packet.get("ok")==false)):break
 evidence.combat={"last_spawn":main.native_natural_enemies.last_receipt,"journal":main.native_natural_enemies.holes.spawn_journal,"counts":main.native_natural_enemies.counts,"events":events,"target_etype":target.etype if is_instance_valid(target) else null,"target_hp":target.hp if is_instance_valid(target) else null,"target_alive":target.alive if is_instance_valid(target) else null,"region_before":before,"region_after":main.get_node("NativeRegions").snapshot().kill_calls}
 check(is_instance_valid(target) and not target.alive and main.get_node("NativeRegions").snapshot().kill_calls>before,"actual_kill_region_count")
 evidence.encounter=main.native_demo_encounter.snapshot()
 evidence.boss=main.native_demo_boss_actor.snapshot()
 evidence.physics_max_us=tick_max
 evidence.worst=worst
 evidence.callback_costs=callback_costs
 evidence.scheduler_max_us=main.native_natural_enemies.scheduler_max_us
 evidence.family=main.native_demo_anglers.snapshot()
 evidence.perf=root.get_meta("demo47i_perf",{})
 var path: String=""
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--results-path="):path=arg.trim_prefix("--results-path=")
 var f=FileAccess.open(path,FileAccess.WRITE)
 f.store_string(JSON.stringify({"checks":checks,"failures":failures,"evidence":evidence},"\t"));f.close()
 print("DEMO11_47L_MAC_RESULT ",JSON.stringify({"checks":checks,"failures":failures}))
 for audio in main.find_children("*","AudioStreamPlayer",true,false):audio.stop()
 main.queue_free();await process_frame;await create_timer(.25).timeout
 quit(1 if failures else 0)
