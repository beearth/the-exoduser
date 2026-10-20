extends SceneTree
const USERDIR="EXODUSER-demo11-32-Isolated-20261021"
const TICK=preload("res://scripts/native_demo11_fire_devil_tick.gd")
var assertions:=0
var failures:=0
var rng_count:=0
var shots: Array=[]
var hurts: Array=[]
var benchmark: Dictionary={}
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok:failures+=1;print("DEMO32_FAIL ",label)
func equal(a: Variant,b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):return float(a)==float(b) if a is int or b is int else absf(float(a)-float(b))<=0.000000001
	if a is Dictionary and b is Dictionary:
		if a.size()!=b.size():return false
		for k in a:
			if not b.has(k) or not equal(a[k],b[k]):return false
		return true
	if a is Array and b is Array:
		if a.size()!=b.size():return false
		for i in range(a.size()):
			if not equal(a[i],b[i]):return false
		return true
	return typeof(a)==typeof(b) and a==b
func rng() -> float:rng_count+=1;return .25
func wall(_at: Vector2) -> bool:return false
func birth(props: Dictionary) -> Dictionary:shots.append(props.duplicate(true));return {"ack":true}
func contact(request: Dictionary) -> Dictionary:
	var p: Dictionary=request.player.duplicate(true)
	if request.kind=="body_push":p.x=request.position.x;p.y=request.position.y
	else:hurts.append({"damage":request.damage,"dtype":request.dtype})
	return {"ack":true,"player_after":p}
func callbacks() -> Dictionary:return {"is_wall":wall,"rng":rng,"protected_contact":contact,"spawn_projectile":birth}
func frame(id: int,p: Dictionary) -> Dictionary:
	return {"ready":true,"serial":id,"sp":1.0,"player":p,"context":{"camera":Vector2.ZERO,"viewport":Vector2(1920,1080),"lesson_active":false,"qa_storage_active":false,"first_forest_active":false,"aggro_active":false}}
func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	# A single fixed-N wallclock benchmark of four active source kernels.
	# No claim about renderer, PC contact/energy terminal or complete120fps game.
	shots=[];hurts=[];rng_count=0
	var kernels: Array=[];var records: Array=[]
	for i in range(4):
		kernels.append(TICK.new());var r:=TICK.initial(Vector2(i*10,0),100);r.asleep=0;r.hid=0;records.append(r)
	var ticks:=2400;var start:=Time.get_ticks_usec();var worst:=0
	for n in range(ticks):
		var t:=Time.get_ticks_usec()
		for i in range(4):
			kernels[i].begin(records[i],{"x":float(500+(n%4)*5),"y":0.0,"r":20.0,"s":"idle","iframes":1.0},{"camera":Vector2.ZERO,"viewport":Vector2(1920,1080)},callbacks())
		worst=maxi(worst,Time.get_ticks_usec()-t)
	var elapsed:=Time.get_ticks_usec()-start
	benchmark={"fixed_source_ticks":ticks,"actors":4,"wall_usec":elapsed,"mean_usec_per_four":float(elapsed)/ticks,"worst_usec_per_four":worst,"budget120_usec":1000000.0/120,"scope":"FD kernels + isolated callback fixtures; excludes PC/registry/render"}
	check(float(elapsed)/ticks<1000000.0/120,"kernel_mean120fps_budget")
	print("DEMO32_BENCH ",JSON.stringify(benchmark))
	print("DEMO32_BUDGET_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skip":0,"benchmark":benchmark}))
	quit(0 if failures==0 else 1)
