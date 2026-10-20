extends "res://tests/test_demo11_etype_b_runtime.gd"
const N=120
const WARMUP=10
var samples: Array=[]
var tick_count:=0
var wall_begin:=0
var b_driver: Node
class Driver extends Node:
 var step: Callable
 func _physics_process(_dt: float) -> void: step.call()
func run() -> void:
 await boot_b()
 Engine.physics_ticks_per_second=120
 b_driver=Driver.new();b_driver.step=bench_step;root.add_child(b_driver)
func bench_step() -> void:
 tick_count+=1
 var before:=Time.get_ticks_usec()
 for actor in b_actors: actor.advance_native_phase(0.5,float(tick_count)*0.5,b_main.world.get_enemies())
 var after:=Time.get_ticks_usec()
 if tick_count<=WARMUP:return
 if samples.is_empty():wall_begin=before
 samples.append(after-before)
 if samples.size()<N:return
 b_driver.set_physics_process(false)
 check(b_actors.size()==5 and b_actors.all(func(a):return a.b_ticks==N+WARMUP and a.b_fault.is_empty() and a.is_inside_tree()),"five actual actors tick throughout measured workload")
 samples.sort()
 var total:=0
 for sample in samples:total+=sample
 check(b_spawn_us<=1000000.0/120,"five-spawn creation burst under 120fps budget")
 check(samples[-1]<=1000000.0/120,"five-owner maximum under 120fps CPU budget")
 print("ETYPE_B_BENCH_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"actors":b_actors.size(),"physics_hz":120,"ticks":N,"warmup":WARMUP,"native_sp":0.5,"five_spawn_burst_ms":b_spawn_us/1000.0,"mean_ms":float(total)/N/1000,"p99_ms":samples[int(N*0.99)-1]/1000.0,"max_ms":samples[-1]/1000.0,"wall_span_ms":(after-wall_begin)/1000.0,"scope":"five actual B actor source phases; no projectile/death/revive completion; not full game FPS"}))
 b_main.free();b_driver.queue_free()
 quit(0 if failures==0 else 1)
