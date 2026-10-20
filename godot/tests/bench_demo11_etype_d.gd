extends "res://tests/test_demo11_etype_d_runtime.gd"
const WARMUP:=30
const N:=240
var measured: Array[int]=[]
var ticks:=0
var begin_usec:=0
var start_wall:=0
var before_node: Node
var after_node: Node
class Stamp extends Node:
 var action: Callable
 func _physics_process(_delta: float) -> void:action.call()
func run() -> void:
 check(OS.get_user_data_dir().ends_with(USERDIR),"benchmark isolation")
 await setup()
 if typed.size()!=5:print("D_BENCH_ABORT_NO_FIVE_ACTORS");main.free();quit(1);return
 Engine.physics_ticks_per_second=120
 before_node=Stamp.new();before_node.process_physics_priority=-1000;before_node.action=stamp;root.add_child(before_node)
 after_node=Stamp.new();after_node.process_physics_priority=1000;after_node.action=finish_tick;root.add_child(after_node)
func stamp() -> void:begin_usec=Time.get_ticks_usec()
func finish_tick() -> void:
 ticks+=1
 var elapsed: int=Time.get_ticks_usec()-begin_usec
 if ticks<=WARMUP:return
 if measured.is_empty():start_wall=begin_usec
 measured.append(elapsed)
 if measured.size()<N:return
 before_node.set_physics_process(false);after_node.set_physics_process(false)
 check(main.native_stage_spawn_adapter.snapshot().origins==5,"five real factory/World/origin actors")
 var counters: Array=[]
 for a in typed:
  counters.append({"etype":a.etype,"ticks":a.native_ticks,"not_ready":a.not_ready,"alive":a.alive})
  check(a.native_ticks>=WARMUP+N and a.not_ready=="" and a.alive,"actual live AI ticks type"+str(a.etype))
 var sum_usec:=0
 for v in measured:sum_usec+=v
 measured.sort()
 check(measured[-1]<1000000.0/120.0,"fixedN full physics callback max8.33ms")
 print("D_BENCH_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skipped":[],"target_hz":120,"physical_ticks":N,"warmup_ticks":WARMUP,"actual_D_actors":5,"actor_ticks":counters,"mean_ms":float(sum_usec)/N/1000,"p95_ms":measured[int(N*0.95)-1]/1000.0,"max_ms":measured[-1]/1000.0,"wall_ms":(Time.get_ticks_usec()-start_wall)/1000.0,"budget_ms":1000.0/120,"scope":"Main/World/actors/native projectile physics callback span; MAP provider fixture","render_fps_verified":false,"type25_death_verified":false}))
 main.free();before_node.queue_free();after_node.queue_free();quit(1 if failures else 0)
