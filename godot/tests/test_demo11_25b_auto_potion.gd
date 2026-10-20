extends SceneTree
const USERDIR = "EXODUSER-demo11-25b-Isolated-20261021"
const Phase = preload("res://port_modules/potion_recovery_source/auto_phase.gd")
const Potion = preload("res://port_modules/potion_recovery_source/producer.gd")
var assertions = 0
var failures = 0
var oracle_cases = 0
var main: Node

class Fixture extends RefCounted:
	var data: Dictionary
	var reads: Array = []
	var writes: Array = []
	var heals = 0
	var math = Potion.new()
	var reject = ""
	var change_heal = false
	func _init(d: Dictionary) -> void: data = d.duplicate(true)
	func read(key: String) -> Dictionary:
		var value: Variant
		match key:
			"cd": value = data.cd
			"heal":
				reads.append("level")
				var level: Variant = data.level if heals == 0 else data.level2
				reads.append("affix")
				var power: Variant = data.power if heals == 0 else data.power2
				heals += 1
				return math.enhanced_heal(level,power)
			"lesson": value = data.lesson
			"p": value = {"hp":data.hp,"mhp":data.mhp}
			"g": value = {"mats":data.mats}
			"system_before": value = {"hp":data.hp,"mats":data.mats} if data.get("system",false) else null
			"gloves", "belt":
				reads.append(key)
				var item: Dictionary = data.gl if key=="gloves" else data.belt
				value = {"raw":item.get("potCd"),"present":item.has("potCd")}
			"regen":
				reads.append(key)
				value = {"raw":data.regen,"present":true}
		return {"status":"READY","value":value}
	func write(key: String, value: Variant) -> Dictionary:
		if key == reject: return {"accepted":false}
		writes.append(key)
		match key:
			"cd", "mats": data[key] = value
			"hp": data.hp = minf(data.mhp,data.hp+float(value))
			"stats":
				data.hC = data.get("hC",2)+1
				data.potions = data.get("potions",3)+1
		return {"accepted":true}
	func services() -> Dictionary: return {"read":Callable(self,"read"),"write":Callable(self,"write")}

func _initialize() -> void: call_deferred("_run")
func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("DEMO11_25B_FAIL ",label)
func _run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"effective isolated userdir")
	if failures == 0:
		_test_oracle()
		_test_order_and_rejections()
		await _test_actual_main()
	if is_instance_valid(main):
		for child in main.find_children("*","AudioStreamPlayer",true,false): child.stop()
		main.queue_free()
		main = null
		await process_frame
		await create_timer(0.15).timeout # let AudioServer release intro MP3 playback before process exit
	print("DEMO11_25B_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases}))
	quit(0 if failures==0 else 1)

func _test_oracle() -> void:
	var node_bin = ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="): node_bin = arg.trim_prefix("--node-bin=")
	check(not node_bin.is_empty(),"explicit --node-bin")
	if node_bin.is_empty(): return
	var file = OS.get_user_data_dir().path_join("auto-hp-source.json")
	var output: Array = []
	var code = OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/build_demo11_25b_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--output="+file]),output,true)
	check(code==0,"original JS UTF8 file oracle: "+"".join(output))
	if code!=0: return
	var packet: Variant = JSON.parse_string(FileAccess.get_file_as_string(file))
	check(packet is Dictionary and packet.get("rows") is Array,"oracle JSON complete")
	if not packet is Dictionary: return
	for row in packet.rows:
		oracle_cases += 1
		var f = Fixture.new(row.input)
		var phase = Phase.new()
		var result = phase.advance(float(row.input.sp),f.services())
		var label = "G35893-35910 case "+str(oracle_cases)
		check(result.status=="READY",label+" phase")
		for field in ["hp","mats","cd"]: check(float(f.data[field])==float(row.expected[field]),label+" "+field)
		check(f.reads==row.expected.reads,label+" live read order")
		check(f.data.get("hC",2)==row.expected.hC and f.data.get("potions",3)==row.expected.potions,label+" conditional stats")

func _input() -> Dictionary:
	return {"cd":0.5,"hp":250.0,"mhp":350.0,"mats":1.0,"lesson":false,"level":0,"level2":1,"power":0,"power2":0,"sp":1,"gl":{},"belt":{},"regen":0}
func _test_order_and_rejections() -> void:
	var f = Fixture.new(_input())
	f.data.system = true
	var result = Phase.new().advance(1.0,f.services())
	check(result.applied and f.data.hp==350 and f.data.cd==420,"second heal requery/max clamp")
	check(f.writes==["cd","mats","cd","hp","recovered","sound","belt_effect","text","stats"],"G35893..35910 exact side-effect order")
	for rejected in ["mats","cd","hp"]:
		f = Fixture.new(_input())
		f.data.cd = 0
		f.reject = rejected
		result = Phase.new().advance(1.0,f.services())
		check(result.status=="NOT_READY","rejected writer "+rejected)
		check(not f.writes.has("hp"),"no HP after rejected prefix "+rejected)
		check(f.data.mats==(1 if rejected=="mats" else 0),"no refund/retry "+rejected)
	f = Fixture.new(_input())
	f.data.hp=251
	result = Phase.new().advance(1.0,f.services())
	check(not result.applied and f.data.cd==-0.5,"positive CD subtraction not zero-clamped")
	check(f.reads==["level","affix"],"missed trigger does not read gear/passives or heal twice")
	check(Phase.new().advance(-1.0,f.services()).status=="NOT_READY","invalid tick rejected")

func _test_actual_main() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot","intro") # exercise production clock/lesson owner, not dormant harness boot
	root.add_child(main)
	for i in range(12): await physics_frame
	main.source_intro_sequence.finish_native_guide()
	await create_timer(1.9).timeout
	var flow: Node = main.source_intro_sequence.lesson_flow
	check(is_instance_valid(flow) and flow.active,"production lesson starts after curtain")
	if not is_instance_valid(flow): return
	flow.skip_all() # existing UI action; no holder/clock fabrication
	for i in range(3): await process_frame
	check(is_instance_valid(main.player) and main.source_state.is_native_new_run_state_ready(),"actual Main boot")
	if not is_instance_valid(main.player): return
	var state: Node = main.source_state
	var g: Dictionary = state.read_current_g()
	check(state.read_native_potion_runtime()=={"cd":0.0,"level":0},"G63950/63952 fresh runtime")
	g.on = true
	g.paused = false
	g.mats = 2
	g._pStats={"_hC":2}
	g._sStats={"potions":3}
	main.player.hp = main.player.max_hp-110.0 # test-only damage fixture; no product hurtP changes
	var before: float = main.player.hp
	var st: float = main.player.stamina
	var mp: float = main.source_resources.read_current_resource_parameters().values.mp
	var uses: int = main.source_potion.get_snapshot().uses
	for i in range(8): await process_frame
	var snap: Dictionary = main.source_potion.get_snapshot()
	if snap.uses!=uses+1:
		var clock: Dictionary = main.get_native_source_clock_input_snapshot()
		print("DEMO11_25B_DIAG ", JSON.stringify({"potion":snap,"update":clock.get("update_clock_result"),"on":g.on,"paused":g.paused,"lesson":main.read_native_normal_enemy_lesson_status()}))
	check(snap.uses==uses+1,"natural Main process invokes one potion")
	check(g.mats==1,"actual G.mats decremented once")
	check(g._pStats._hC==3 and g._sStats.potions==4,"State conditional statistics writer")
	check(snap.last_use.status=="PARTIAL" and snap.last_use.unported.has("SFX.potion not connected"),"unconnected SFX explicitly remains partial")
	check(main.player.hp>=before+100.0,"actual HP recovered through State")
	check(state.read_current_p().hp==main.player.hp,"actual Player/P readback agree")
	check(state.read_native_potion_runtime().cd>0,"actual cooldown persisted/ticks")
	check(snap.last.get("reason","")=="","runtime not rejected")
	var cadence_ticks: int = main.source_potion.get_snapshot().ticks
	var cadence_cd: float = state.read_native_potion_runtime().cd
	for i in range(5): await physics_frame
	await process_frame
	var advanced: int = main.source_potion.get_snapshot().ticks-cadence_ticks
	check(advanced>=4 and advanced<=6,"natural policy follows physics cadence, not render count")
	check(state.read_native_potion_runtime().cd==cadence_cd-float(advanced),"60Hz cooldown consumes exactly one sp per physics tick")
	# Pause actor physics for precise hp-only sink verification, without changing combat code.
	main.player.set_physics_process(false)
	var frozen_st: float = main.player.stamina
	var frozen_mp: float = main.source_resources.read_current_resource_parameters().values.mp
	var hp: float = main.player.hp
	check(state.commit_native_auto_potion(main,"hp",5).accepted,"State HP sink accepts actual owner")
	check(main.player.hp==minf(main.player.max_hp,hp+5),"State sink applies clamp")
	check(main.player.stamina==frozen_st and main.source_resources.read_current_resource_parameters().values.mp==frozen_mp,"HP-only writer preserves ST/MP")
	var impostor = Node.new()
	check(not state.commit_native_auto_potion(impostor,"hp",5).accepted,"foreign writer rejected")
	impostor.free()
	main.source_potion.advance_native(main)
	var ticks: int = main.source_potion.get_snapshot().ticks
	main.source_potion.advance_native(main)
	check(main.source_potion.get_snapshot().ticks==ticks,"same physics serial cannot replay")
	g.paused=true
	var cd: float = state.read_native_potion_runtime().cd
	for i in range(3): await process_frame
	check(state.read_native_potion_runtime().cd==cd,"source paused gate stops timer and reads")
	g.paused=false
	g.on=false
	for i in range(3): await process_frame
	check(state.read_native_potion_runtime().cd==cd,"source on=false gate stops timer")
	g.on=true
	paused=true
	check(main.source_potion.advance_native(main).get("reason")=="tree_paused","tree pause gate")
	check(not state.commit_native_auto_potion(main,"hp",5).accepted,"paused State write refused")
	paused=false
