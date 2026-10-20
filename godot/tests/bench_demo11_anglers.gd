extends "res://tests/test_demo11_anglers.gd"
const COUNT:=256
const N:=240
const WARMUP:=30
var costs: Array[int]=[]
var ticks:=0
var begin_wall:=0
var driver: Node
class Driver extends Node:
 var step: Callable
 func _physics_process(_delta: float) -> void:step.call()
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"benchmark isolation")
 setup_registry();native_frame(1,0.5)
 var props: Dictionary=energy();props.life=10000;props.ml=10000
 for i in COUNT:
  var receipt: Variant=service.birth_field_projectile(family,props,family.read_projectile_frame())
  check(receipt is Dictionary and receipt.ack,"actual energy registry birth")
 check(service.snapshot().live==COUNT,"fixed live registry256")
 Engine.physics_ticks_per_second=120
 driver=Driver.new();driver.step=_bench_tick;root.add_child(driver)
func _bench_tick() -> void:
 ticks+=1
 var before: int=Time.get_ticks_usec()
 native_frame(ticks+1,0.5)
 var advanced: bool=service.advance_source_frame(family.read_projectile_frame())
 var after: int=Time.get_ticks_usec()
 if ticks<=WARMUP:return
 if costs.is_empty():begin_wall=before
 costs.append(after-before)
 if not advanced:failures+=1
 if costs.size()<N:return
 driver.set_physics_process(false)
 var snapshot: Dictionary=service.snapshot()
 check(snapshot.live==COUNT and snapshot.motion_ticks==COUNT*(WARMUP+N),"fixed real physical workload and no duplicate frames")
 check(scope.source_state.g._fieldBosses.size()==4 and family.snapshot().serial==ticks+1,"actual four family AI ticks share registry frame")
 check(scope.player.forbidden_calls==0,"no player damage/parry claims")
 var total:=0
 for value in costs:total+=value
 costs.sort()
 check(costs[-1]<1000000.0/120.0,"combined AI/energy service max within8.33ms")
 print("DEMO31_BENCH_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"physical_ticks":N,"warmup_ticks":WARMUP,"target_hz":120,"field_actors":4,"projectiles":COUNT,"motion_calls":snapshot.motion_ticks,"service_mean_ms":float(total)/N/1000.0,"service_p95_ms":costs[int(N*0.95)-1]/1000.0,"service_max_ms":costs[-1]/1000.0,"wall_span_ms":(after-begin_wall)/1000.0,"budget_ms":1000.0/120.0,"measurement":"fixed_N_physics_callbacks_monotonic_wall_clock","fixture_state":true,"full_game_fps_verified":false}))
 scope.free();driver.queue_free();quit(1 if failures else 0)
