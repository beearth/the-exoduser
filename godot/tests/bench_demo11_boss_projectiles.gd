extends "res://tests/test_demo11_boss_projectiles.gd"
const COUNT := 256
const WARMUP := 30
const N := 240
var costs: Array[int]=[]
var total_ticks:=0
var started:=0
var finished:=0
var driver: Node
class Driver extends Node:
	var advance: Callable
	func _physics_process(_delta: float) -> void: advance.call()
func _run() -> void:
	setup()
	Engine.physics_ticks_per_second=120
	for i in range(COUNT):
		var props: Dictionary={"x":float(i%16)*3.0,"y":float(i/16)*3.0,"vx":2.0,"vy":0.0,"dmg":7,"el":0,"life":10000.0,"ml":10000.0,"_commit":true,"blackBean":i%2==0,"redBean":i%2!=0}
		var actual: Variant=born(props,1)
		check(actual is Dictionary and actual.ack,"actual_bench_birth")
	check(service.snapshot().live==COUNT,"real_registry_workload_256")
	driver=Driver.new()
	driver.advance=_bench_tick
	root.add_child(driver)
func _bench_tick() -> void:
	total_ticks+=1
	var input:=frame(total_ticks)
	input.sp=0.5
	var begin:=Time.get_ticks_usec()
	var ok: bool=service.advance_source_frame(input)
	var end:=Time.get_ticks_usec()
	if total_ticks<=WARMUP: return
	if costs.is_empty(): started=begin
	costs.append(end-begin)
	if not ok: failures+=1
	if costs.size()<N: return
	finished=end
	driver.set_physics_process(false)
	var snapshot: Dictionary=service.snapshot()
	check(snapshot.live==COUNT and snapshot.motion_ticks==COUNT*(WARMUP+N),"fixed_real_workload_every_physics_tick")
	check(target.forbidden_calls==0,"benchmark_no_damage_parry")
	costs.sort()
	var elapsed:=0
	for cost in costs: elapsed+=cost
	var p95:=costs[int(N*0.95)-1]
	var maximum:=costs[-1]
	var budget_us:=1000000.0/120.0
	check(maximum<=budget_us,"projectile_service_max_within_120fps_8_33ms_budget")
	print("DEMO35_BENCH_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"physical_ticks":N,"warmup_ticks":WARMUP,"target_hz":120,"projectiles":COUNT,"native_sp":0.5,"wall_span_ms":(finished-started)/1000.0,"service_total_wall_ms":elapsed/1000.0,"service_mean_ms":float(elapsed)/N/1000.0,"service_p95_ms":p95/1000.0,"service_max_ms":maximum/1000.0,"budget_ms":1000.0/120.0,"measurement":"fixed_N_actual_physics_callbacks_monotonic_wall_clock","headless":true,"full_game_fps_verified":false}))
	scope.free()
	driver.queue_free()
	quit(1 if failures else 0)
