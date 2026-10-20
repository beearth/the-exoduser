extends SceneTree
const USERDIR="EXODUSER-demo11-etype-a-Isolated-20261021"
const FIXTURE=preload("res://tests/demo11_etype_a_fixture.gd")
var assertions:=0
var failures:=0
class Counter extends Node:
	signal finished
	var actors: Array
	var count:=0
	var target:=240
	var previous:=0
	var samples: Array=[]
	var ended:=0
	func _ready() -> void:process_physics_priority=2;process_mode=Node.PROCESS_MODE_ALWAYS
	func _physics_process(_delta: float) -> void:
		if count>=target:return
		var total:=0
		for a in actors:total+=a.a_cpu_usec
		samples.append(total-previous);previous=total;count+=1
		if count==target:
			ended=Time.get_ticks_usec();get_tree().paused=true;finished.emit()
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok:failures+=1;print("ATYPE_BUDGET_FAIL ",label)
func run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	var f:=FIXTURE.new();check(f.setup(self),"five_actual_spawns")
	if f.actors.size()!=5:f.close();await process_frame;quit(1);return
	for a in f.actors:
		a.alerted=true;a.a_measure=true;a.a_cpu_usec=0;a.a_phase_calls=0
		if a.etype in [0,1,4]:a._projectile_ticks=0
		if a.etype==5:a.state="windup";a.st2=1
	var old_rate:=Engine.physics_ticks_per_second;Engine.physics_ticks_per_second=120
	var counter:=Counter.new();counter.actors=f.actors
	var start:=Time.get_ticks_usec();root.add_child(counter)
	await counter.finished
	var wall: int=counter.ended-start
	var samples: Array=counter.samples.duplicate();samples.sort()
	var sum:=0
	for v in samples:sum+=int(v)
	var mean: float=float(sum)/samples.size();var p95: int=samples[int(samples.size()*.95)-1];var worst: int=samples.back()
	check(counter.count==240 and f.actors.all(func(a):return a.a_phase_calls==240),"exact240_physics_ticks_all5")
	check(f.actors.all(func(a):return a.alive),"five_survive_measurement")
	check(p95<1000000.0/120,"five_owner_CPU_p95_120fps_budget")
	var result: Dictionary={"physical_ticks":240,"physics_hz":120,"actors":[0,1,4,5,6],"wall_usec":wall,"actor_cpu_mean_usec":mean,"actor_cpu_p95_usec":p95,"actor_cpu_max_usec":worst,"budget_usec":1000000.0/120,"scope":"actual Main/World dispatch + five registered actors; actor kernel CPU, renderer/PC full-frame excluded"}
	print("ATYPE_BENCH ",JSON.stringify(result))
	paused=false;Engine.physics_ticks_per_second=old_rate;counter.queue_free();f.close();await process_frame;await process_frame
	print("ATYPE_BUDGET_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skip":0,"benchmark":result}))
	quit(0 if failures==0 else 1)
