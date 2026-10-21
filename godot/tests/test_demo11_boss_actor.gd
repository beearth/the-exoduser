extends SceneTree
## Assembler fixtures prove ordering/protocol only, never protected gameplay.
## Legacy map contract: run with --map11=off; MAP11 product/gate has separate tests.
const MAIN = preload("res://scripts/main.gd")
const ACTOR = preload("res://scripts/native_demo11_boss_actor.gd")
const USERDIR := "EXODUSER-demo11-34-Isolated-20261021"
var assertions := 0
var failures := 0
var main: Node
var actor: Node
var fixture := {}
var commands: Array = []
var sequence: Array = []
var external_rng := 0
var serial := 0
func check(ok: bool,label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("DEMO34_FAIL ",label)
func _initialize() -> void: call_deferred("_run")
func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	main = MAIN.new()
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	actor = main.native_demo_boss_actor
	actor.owner_request.connect(_record)
	check(is_instance_valid(actor) and actor.get_parent() == main.world and main.read_native_demo_boss().status == "DORMANT","actual_Main_installs_one_dormant_actor")
	check(main.spawn_native_demo_boss({"si":1}).status == "REJECTED","authority_rejects_stage1")
	var req := {"si":0,"room":0,"x":4020.0,"y":7200.0,"difficulty_index":5,"stage_diff_offset":0,"player_level":999}
	var spawned: Dictionary = main.spawn_native_demo_boss(req)
	check(spawned.status == "READY" and spawned.enemy.lv == 1 and spawned.enemy.hp == 21017 and spawned.enemy.r == 44,"actual_spawn_uses_current_level_and_BC02")
	check(main.spawn_native_demo_boss(req).status == "REJECTED","no_duplicate_spawn")
	await physics_frame
	await physics_frame
	check(actor.snapshot().last_serial == -1 and actor.snapshot().ticks_completed == 0 and not actor.snapshot().clock_reason.is_empty(),"unpublished_source_clock_never_falls_back_to_delta")
	var copy: Dictionary = actor.snapshot()
	copy.enemy.hp = -1
	check(actor.snapshot().enemy.hp == 21017,"snapshot_copy_cannot_damage_actor")
	var frame := _frame()
	check(actor.begin_tick(frame),"valid_source_frame_admitted")
	var pending: Dictionary = actor.snapshot().pending
	check(pending.command == "source_updateE_prefix","prefix_first_no_fabricated_ack")
	var rng_before: int = actor.snapshot().rng_draws
	check(not actor.begin_tick(_frame()) and not actor.acknowledge(pending.request_id+1,{"ack":true},self),"inflight_and_out_of_order_rejected")
	check(not actor.acknowledge(pending.request_id,{"ack":true},self) and actor.snapshot().rng_draws == rng_before,"unbound_owner_cannot_ack_or_consume_rng")
	check(actor.bind_owner("source_updateE_prefix",Callable(self,"_async")),"bind_exact_async_owner")
	check(not actor.acknowledge(pending.request_id,{"ack":true},root),"wrong_owner_rejected")
	check(not actor.acknowledge(pending.request_id,{"ack":true},self),"incomplete_prefix_readback_rejected")
	fixture = {"s":"recover","st2":0.0}
	check(actor.acknowledge(pending.request_id,_response(pending),self),"complete_prefix_readback_acknowledged")
	_finish_pending()
	check(actor.snapshot().ticks_completed == 1 and actor.snapshot().enemy.s == "idle","recovery_returns_idle_one_completed_AI_tick")
	check(not actor.begin_tick(frame),"same_source_serial_cannot_tick_twice")
	check(not actor.acknowledge(pending.request_id,_response(pending),self),"stale_ack_rejected")
	# Source-order goldens cross idle movement, idle projectiles, selector/start,
	# feint and the resulting state switch in the SAME original cached frame.
	for scenario in [
		{"s":"idle","st2":20.0,"bossPatT":100.0,"_idleRBT":0.0},
		{"s":"idle","st2":20.0,"bossPatT":0.0,"_idleRBT":0.0},
		{"s":"bossChargeWind","st2":10.0},
		{"s":"bossJumpWind","st2":10.0},
		{"s":"bossSlashWind","st2":10.0},
		{"s":"bossSlamWind","st2":10.0},
		{"s":"bossSweepWind","st2":10.0,"_isTail":false},
		{"s":"bossBurstWind","st2":10.0},
		{"s":"bossFanWind","st2":10.0},
		{"s":"bossGrabWind","st2":10.0},
		{"s":"bossDruidUnder","st2":10.0,"_diveTx":4020.0,"_diveTy":7200.0,"_teleOx":4020.0,"_teleOy":7200.0},
		{"s":"bossRec","st2":0.0}]:
		_fresh()
		fixture = scenario
		var draws_before: int = main.world.get("_native_random_draw_count")
		check(actor.begin_tick(_frame()),"admit:" + scenario.s)
		_finish_pending()
		var result: Dictionary = actor.snapshot()
		check(result.reason == "" and result.ticks_completed == 1,"assembler_case:" + scenario.s + ":" + result.reason)
		check(result.enemy.hp == 21017 and result.enemy.poise == 21017,"no_local_HP_or_poise_writer:" + scenario.s)
		check(main.world.get("_native_random_draw_count")-draws_before == result.rng_draws-6+external_rng,"one_shared_World_RNG:" + scenario.s)
		check(commands[0] == "source_updateE_prefix" and commands[-1] == "source_updateE_suffix","prefix_suffix_order:" + scenario.s)
		if scenario.s == "idle":
			check(commands.find("_ffDir") > 0 and commands.find("canMv") > commands.find("_ffDir"),"idle_flow_before_collision")
	# Transition scalar proposal belongs to PC, and all phase effects then finish
	# before idle/AI/recovery. Fixture readback is not HP/parry adoption evidence.
	_fresh()
	fixture = {"hp":16000.0,"s":"idle","st2":20.0}
	check(actor.begin_tick(_frame()),"phase_frame")
	_finish_pending()
	check(commands.find("phase_transition_commit") == 1 and actor.snapshot().enemy._bossPhase == 1,"phase_commit_before_effects")
	check(actor.snapshot().reason == "" and actor.snapshot().ticks_completed == 1,"phase_effect_continuation_finishes")
	check(external_rng > 0,"external_effect_owner_consumes_same_RNG_between_commands")
	var duplicate: Node = ACTOR.new()
	main.world.add_child(duplicate)
	check(not duplicate.configure(main,main.world),"no_second_actor_claim")
	duplicate.free()
	main.free()
	print("DEMO34_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"protected_fixtures_only":true,"damage_parry_verified":false,"full_combat_ready":false}))
	quit(1 if failures else 0)
func _fresh() -> void:
	actor.free()
	actor = ACTOR.install_native_boot(main)
	main.native_demo_boss_actor = actor
	actor.owner_request.connect(_record)
	var spawned: Dictionary = main.spawn_native_demo_boss({"si":0,"room":0,"x":4020.0,"y":7200.0,"difficulty_index":5,"stage_diff_offset":0})
	check(spawned.status == "READY","fresh_fixture_actor")
	commands = []
	sequence = []
	external_rng = 0
func _frame() -> Dictionary:
	serial += 1
	return {"ready":true,"serial":serial,"sp":1.0,"player":{"x":4020.0,"y":7420.0,"r":20.0,"facing":0.0,"s":"idle","iframes":0.0,"kb":{"x":0.0,"y":0.0}},"context":{"frame":1.0,"druid_finale":false,"vfx_available":false,"thorn_first":true,"drop_counter":0,"etype_range":700.0,"element_color":"#bbbbbb","shake":100.0},"globals":{},"player_stats":null}
func _record(request: Dictionary) -> void: commands.append(request.command)
func _async(_request: Dictionary) -> Variant: return null
func _finish_pending() -> void:
	for i in range(500):
		var status: Dictionary = actor.snapshot()
		if status.pending.is_empty(): break
		var request: Dictionary = status.pending
		check(not sequence.has(request.request_id),"one_request_ordinal_once")
		sequence.append(request.request_id)
		if not actor.bind_owner(request.command,Callable(self,"_handler")):
			check(actor.acknowledge(request.request_id,_response(request),self),"existing_owner_ack:"+str(request.command))
	check(actor.snapshot().pending.is_empty(),"no_fixture_protocol_deadlock")
func _handler(request: Dictionary) -> Dictionary: return _response(request)
func _response(request: Dictionary) -> Dictionary:
	var e: Dictionary = request.enemy.duplicate(true)
	var p: Dictionary = request.player.duplicate(true)
	match request.command:
		"source_updateE_prefix":
			for key in fixture: e[key] = fixture[key]
			return {"ack":true,"enemy_after":e,"player_after":p,"context_after":request.frame.context.duplicate(true),"globals_after":{},"through_source_line":40443,"cached_distance":220.0,"sp_after":1.0,"return_update":false}
		"phase_transition_commit":
			return {"ack":true,"enemy_after":request.proposal.enemy.duplicate(true),"player_after":p}
		"source_updateE_suffix": return {"ack":true,"enemy_after":e,"player_after":p}
		"source_global_write": return {"ack":true,"globals_after":{request.event.field:request.event.value}}
		"canMv": return {"ack":true,"value":main.world.can_move(Vector2(request.args[0],request.args[1]),request.args[2])}
		"safePt": return {"ack":true,"value":main.world.native_safe_point(request.args[0],request.args[1],request.args[2])}
		"_ffDir": return {"ack":true,"value":null}
		"_T": return {"ack":true,"value":str(request.args[0])}
		"revive_vfx": return {"ack":true,"slow_mo_after":1.0,"hit_stop_scale":1.0}
		"boss_sfx": return {"ack":true,"value":null}
		"addParts","poolPart":
			main.world.sample_native_random_unit()
			external_rng += 1
	# These responses exercise typed protocol only; no protected writer executes.
	return {"ack":true,"enemy_after":e,"player_after":p,"value":null,"slow_mo_after":1.0,"hit_stop_scale":1.0}
