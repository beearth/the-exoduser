extends SceneTree

# FIRST actual World/Player integration; all resource/lesson/phase authorities
# below are constructor fixtures, never Main suppliers. No manual physics.
const PLAYER = preload("res://scripts/player.gd")
const WORLD = preload("res://scripts/world.gd")
const ADAPTER = preload("res://scripts/native_resource_regeneration_adapter.gd")
const RATES = preload("res://port_modules/regeneration_stat_source/producer.gd")
const DOME = preload("res://port_modules/holy_dome_presence_source/producer.gd")
const GROUPS = ["atomic_preflight", "attack_paired_once", "natural_modes_dome",
	"lesson_skip", "actual_clock_guard", "provider_loss_no_legacy", "packet_and_opaque_rejection"]
var checks = 0
var failures = 0
var current_group = ""

class ResourceLedger extends RefCounted:
	var mp: float
	var mmp: float
	var reads = {"p": 0, "g": 0, "inv": 0, "pas": 0, "lesson": 0, "phase": 0}
	var attempts = 0
	var commits: Array[Dictionary] = []
	var write_order: Array[String] = []
	func _init(initial_mp: float, maximum_mp: float) -> void:
		mp = initial_mp
		mmp = maximum_mp

class FixtureAuthority extends Node:
	var player: Node2D
	var ledger: ResourceLedger
	var options: Dictionary
	var current_g: Variant
	func _init(actor: Node2D, options_value: Dictionary = {}) -> void:
		player = actor
		options = options_value.duplicate(true)
		ledger = ResourceLedger.new(float(options.get("mp", 20.0)), float(options.get("mmp", 1000.0)))
		current_g = options.get("G", {})
		if options.get("dome", false):
			current_g = {"_fireZones": [{"type": "holyDome", "x": player.global_position.x,
				"y": player.global_position.y, "r": 1000.0}]}
	func get_native_regen_player() -> Node2D:
		return player
	func read_native_regen_state() -> Dictionary:
		ledger.reads["p"] += 1
		var state = {"s": player.state, "st": player.stamina, "mst": player.max_stamina,
			"mp": ledger.mp, "mmp": ledger.mmp, "stR": 8.0, "mpR": 16.0,
			"x": player.global_position.x, "y": player.global_position.y}
		for key in options.get("state_overrides", {}):
			state[key] = options["state_overrides"][key]
		if options.get("missing_mp", false): state.erase("mp")
		return state
	func read_g() -> Variant:
		ledger.reads["g"] += 1
		return current_g
	func read_inventory() -> Variant:
		ledger.reads["inv"] += 1
		return options.get("INV", {"equipped": {}})
	func read_passives() -> Variant:
		ledger.reads["pas"] += 1
		return options.get("PASSIVES", {"pRegen": 0, "pMRegen": 0})
	func read_lesson() -> Variant:
		ledger.reads["lesson"] += 1
		return options.get("lesson", {"parry_lesson_active": false})
	func read_phase() -> Variant:
		ledger.reads["phase"] += 1
		return options.get("phase", true)
	func lose_g_authority() -> void:
		# Fixture provider lifecycle, not a write to actual World/P/G.
		current_g = null
	func commit_native_regen_resources(packet: Dictionary) -> bool:
		ledger.attempts += 1
		var before = read_native_regen_state()
		if not ADAPTER._packet_error(packet, before).is_empty() or options.get("reject_commit", false):
			return false
		# The declared atomic resource callback. Validate BOTH before leaves first;
		# mutation is exclusively the actual source packet ST -> fixture MP commit.
		player.stamina = float(packet["writes"][0]["value"])
		ledger.write_order.append("st")
		ledger.mp = float(packet["writes"][1]["value"])
		ledger.write_order.append("mp")
		ledger.commits.append({"packet": packet.duplicate(true), "state": String(before["s"]),
			"frame": player.get_combat_world().get_native_frame(),
			"ticks": player.get_combat_world().get_native_projectile_fx_context()["dt_sp"], "st_after": player.stamina,
			"mp_after": ledger.mp})
		return true

class BadClockProbe extends Node:
	var armed = false
	var done = false
	var world: Node
	var adapter: Object
	var authority: FixtureAuthority
	var result: Dictionary = {}
	func _physics_process(_delta: float) -> void:
		if not armed or done: return
		# Engine-driven priority0 before Player, after World's priority-1 clock.
		var before: Dictionary = adapter.get_snapshot()
		var reads = authority.ledger.reads.duplicate(true)
		var attempts = authority.ledger.attempts
		var frame: float = world.get_native_frame()
		var dt: float = world.get_native_projectile_fx_context()["dt_sp"]
		var ens: Array = world.get_native_world_identity()
		var rejected = [not adapter.advance_native(dt, frame, ens.duplicate()),
			not adapter.advance_native(dt, frame - 1.0, ens),
			not adapter.advance_native(dt + 0.125, frame, ens),
			not adapter.advance_native(dt, frame + 1e-7, ens),
			not adapter.advance_native(dt + 1e-7, frame, ens)]
		var queries_unchanged = reads == authority.ledger.reads
		var sink_unchanged = attempts == authority.ledger.attempts
		var after: Dictionary = adapter.get_snapshot()
		result = {"rejected": rejected, "queries_unchanged": queries_unchanged,
			"sink_unchanged": sink_unchanged, "calls_before": before["clock_calls"],
			"calls_after_bad": after["clock_calls"], "frame": frame}
		done = true

func _initialize() -> void:
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon"]:
		if not InputMap.has_action(action): InputMap.add_action(action)
	call_deferred("_run")

func _run() -> void:
	var selected: Array = GROUPS.duplicate()
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="): selected = Array(arg.trim_prefix("--only=").split(",", false))
	var results: Array = []
	for id in selected:
		if not GROUPS.has(id): quit(2); return
		current_group = id
		var start_checks = checks
		var start_failures = failures
		var start_time = Time.get_ticks_msec()
		var observation: Dictionary = await call("_test_" + id)
		var record = {"group": id, "checks": checks - start_checks,
			"failures": failures - start_failures, "elapsed_ms": Time.get_ticks_msec() - start_time,
			"observation": observation}
		results.append(record)
		print("REGEN_GROUP_RESULT " + JSON.stringify(record))
	print("REGEN_SUITE_RESULT " + JSON.stringify({"groups": selected.size(), "checks": checks,
		"failures": failures, "results": results, "actual_main_authority": false,
		"manual_physics": false, "live_hp_state_position_clock_setters": false}))
	quit(0 if failures == 0 else 1)

func check(ok: bool, label: String) -> bool:
	checks += 1
	if not ok:
		failures += 1
		push_error("REGEN_ASSERT_FAIL " + current_group + ": " + label)
	return ok

func make_scene(bind: bool = true, options: Dictionary = {}) -> Dictionary:
	paused = true
	var holder = Node2D.new()
	holder.process_mode = Node.PROCESS_MODE_PAUSABLE
	var camera = Camera2D.new()
	camera.enabled = true
	holder.add_child(camera)
	root.add_child(holder)
	var world = WORLD.new()
	holder.add_child(world)
	var probe = BadClockProbe.new()
	probe.process_physics_priority = 0
	holder.add_child(probe)
	var player = PLAYER.new()
	player.position = world.get_start_position() # authored constructor position
	player.set_world(world)
	camera.reparent(player, false)
	holder.add_child(player)
	world.set_player(player)
	var authority = FixtureAuthority.new(player, options)
	holder.add_child(authority)
	var rates = RATES.new()
	rates.configure(Callable(authority, "read_passives"), Callable(authority, "read_native_regen_state"), Callable(authority, "read_inventory"))
	var dome = DOME.new()
	dome.configure(Callable(authority, "read_g"), Callable(authority, "read_native_regen_state"))
	var adapter = ADAPTER.new()
	paused = false
	var deadline = Time.get_ticks_msec() + 6000
	while world.get_native_frame() <= 0.0 and Time.get_ticks_msec() < deadline: await process_frame
	check(world.ready_for_player and world.get_native_frame() > 0.0, "actual World ready and naturally published clock")
	check(world.player == player and player.get_combat_world() == world, "same actual actor identity")
	var s = {"holder": holder, "world": world, "player": player, "probe": probe,
		"authority": authority, "ledger": authority.ledger, "rates": rates, "dome": dome, "adapter": adapter}
	if bind:
		check(configure_adapter(s), "fixture-backed strict source adapter configures")
		check(world.bind_native_player_resource_regeneration(adapter), "actual World public bind")
		check(player.get_native_resource_regeneration_snapshot().get("bound") == true, "actual Player persistent bound flag")
	return s

func configure_adapter(s: Dictionary) -> bool:
	return s.adapter.configure(s.player, s.world, s.authority, s.rates, s.dome,
		Callable(s.authority, "read_lesson"), Callable(s.authority, "read_phase"))

func destroy_scene(s: Dictionary) -> void:
	s.holder.queue_free()
	await process_frame

func wait_commits(s: Dictionary, number: int) -> void:
	var deadline = Time.get_ticks_msec() + 4000
	while s.ledger.commits.size() < number and Time.get_ticks_msec() < deadline: await process_frame
	check(s.ledger.commits.size() >= number, "actual natural frames produce paired commits")

func wait_ticks(s: Dictionary, amount: float) -> void:
	var end: float = s.world.get_native_frame() + amount
	var deadline = Time.get_ticks_msec() + 4000
	while s.world.get_native_frame() < end and Time.get_ticks_msec() < deadline: await process_frame
	check(s.world.get_native_frame() >= end, "actual World ticks advance")

func _test_atomic_preflight() -> Dictionary:
	var variants = [{"missing_mp": true}, {"state_overrides": {"mp": true}},
		{"state_overrides": {"mpR": NAN}}, {"G": null}, {"G": []},
		{"phase": null}, {"phase": 1}, {"INV": null}, {"PASSIVES": null}]
	var s = await make_scene(false)
	for options in variants:
		var a = FixtureAuthority.new(s.player, options)
		s.holder.add_child(a)
		var rates = RATES.new()
		rates.configure(Callable(a, "read_passives"), Callable(a, "read_native_regen_state"), Callable(a, "read_inventory"))
		var dome = DOME.new()
		dome.configure(Callable(a, "read_g"), Callable(a, "read_native_regen_state"))
		var adapter = ADAPTER.new()
		var before: Dictionary = s.player.get_snapshot()
		check(not adapter.configure(s.player, s.world, a, rates, dome, Callable(a, "read_lesson"), Callable(a, "read_phase")), "missing/malformed constructor authority rejects")
		check(s.player.get_snapshot() == before and a.ledger.attempts == 0 and a.ledger.mp == 20.0, "failed preflight leaves actual actor and fixture MP unchanged")
		check(not s.world.bind_native_player_resource_regeneration(adapter), "failed config has no partial binding")
		a.free()
	await destroy_scene(s)
	return {"constructor_invalid_variants": variants.size(), "actual_main_providers": false}

func _test_attack_paired_once() -> Dictionary:
	var s = await make_scene()
	check(s.player.request_attack(), "public actual attack consumes ST")
	var after_attack: float = s.player.stamina
	check(after_attack < 200.0, "ST drained without live resource setter")
	await wait_commits(s, 4)
	for c in s.ledger.commits:
		var packet: Dictionary = c["packet"]
		check(packet["writes"][0]["field"] == "st" and packet["writes"][1]["field"] == "mp", "actual source packet is paired ST then MP")
	check(s.player.stamina == s.ledger.commits[-1]["st_after"] and s.ledger.mp == s.ledger.commits[-1]["mp_after"], "no legacy .28 write after source commit")
	check(s.ledger.write_order.size() == s.ledger.commits.size() * 2, "one ST and one MP write per commit")
	var snapshot: Dictionary = s.player.get_native_resource_regeneration_snapshot()
	check(snapshot["clock_calls"] == snapshot["commit_successes"], "actual once-per-frame source sink")
	var out = {"st_after_public_attack": after_attack, "st_now": s.player.stamina, "mp_now": s.ledger.mp, "commits": s.ledger.commits.size()}
	await destroy_scene(s)
	return out

func _test_natural_modes_dome() -> Dictionary:
	var s = await make_scene(true, {"dome": true})
	check(s.player.request_attack(), "public attack enters actual non-idle state")
	s.player.release_attack()
	await wait_commits(s, 65)
	var idle = false
	var other = false
	for c in s.ledger.commits:
		var w: Array = c["packet"]["writes"]
		var is_idle = c["state"] == "idle"
		idle = idle or is_idle
		other = other or not is_idle
		# Simple fixture integration values, not a reimplementation of rate folding.
		var mp_delta: float = float(w[1]["value"]) - float(w[1]["before"])
		check(is_equal_approx(mp_delta, (4.0 if is_idle else 2.0) * float(c["ticks"])), "actual dome supplier doubles native idle/active MP increment")
	check(idle and other, "actual state machine naturally supplies idle and other source states")
	var out = {"observed_idle": idle, "observed_other": other, "beam": "NOT_EXERCISED: no public native beam state producer", "fixture_dome": true}
	await destroy_scene(s)
	return out

func _test_lesson_skip() -> Dictionary:
	var s = await make_scene(true, {"lesson": {"parry_lesson_active": true, "parry_lesson_chapter": 2}})
	check(s.player.request_attack(), "actual attack prepares observable ST deficit")
	var st: float = s.player.stamina
	var mp: float = s.ledger.mp
	await wait_ticks(s, 5.0)
	var snap: Dictionary = s.adapter.get_snapshot()
	check(s.player.stamina == st and s.ledger.mp == mp and s.ledger.attempts == 0, "chapter2 lesson skips paired sink and both resources")
	check(snap["clock_calls"] > 0 and snap["commit_successes"] == 0, "actual clock proceeds once while source lesson blocks dispatch")
	var out = {"st": st, "mp": mp, "clock_calls": snap["clock_calls"], "commit_attempts": s.ledger.attempts}
	await destroy_scene(s)
	return out

func _test_actual_clock_guard() -> Dictionary:
	var s = await make_scene()
	s.probe.world = s.world
	s.probe.adapter = s.adapter
	s.probe.authority = s.authority
	s.probe.armed = true
	var deadline = Time.get_ticks_msec() + 4000
	while not s.probe.done and Time.get_ticks_msec() < deadline: await process_frame
	check(s.probe.done, "engine runs bad-clock probe before Player consumer")
	var result: Dictionary = s.probe.result
	check(not result["rejected"].has(false), "copy stale wrongdt and both epsilon inputs rejected")
	check(result["queries_unchanged"] and result["sink_unchanged"], "invalid inputs call no authority/rate/dome/phase/lesson/sink")
	var same_frame_commits = 0
	for commit in s.ledger.commits:
		if commit["frame"] == result["frame"]: same_frame_commits += 1
	result["actual_same_frame_commits"] = same_frame_commits
	check(result["calls_before"] == result["calls_after_bad"] and same_frame_commits == 1, "bad input leaves phase available for exactly one actual Player commit in probe frame")
	var before: Dictionary = s.adapter.get_snapshot()
	var reads: Dictionary = s.ledger.reads.duplicate(true)
	var frame: float = s.world.get_native_frame()
	var dt: float = s.world.get_native_projectile_fx_context()["dt_sp"]
	check(not s.adapter.advance_native(dt, frame, s.world.get_native_world_identity()), "already-consumed actual frame duplicate rejected")
	check(reads == s.ledger.reads, "duplicate invokes no source query")
	paused = true
	await process_frame
	reads = s.ledger.reads.duplicate(true)
	check(not s.adapter.advance_native(dt, frame, s.world.get_native_world_identity()), "paused real tree public advance rejected")
	check(reads == s.ledger.reads and s.world.get_native_frame() == frame, "pause stops source query and actual world clock")
	paused = false
	var out = {"probe": result, "valid_calls_before_pause": before["clock_calls"], "manual_physics": false}
	await destroy_scene(s)
	return out

func _test_provider_loss_no_legacy() -> Dictionary:
	var observed: Array = []
	for detach in [false, true]:
		var s = await make_scene()
		check(s.player.request_attack(), "public attack makes ST deficit before authority loss")
		var st: float = s.player.stamina
		var mp: float = s.ledger.mp
		if detach: s.authority.free()
		else: s.authority.lose_g_authority()
		await wait_ticks(s, 5.0)
		var snapshot: Dictionary = s.player.get_native_resource_regeneration_snapshot()
		check(snapshot["bound"] == true and snapshot["ready"] == false, "persistent adopted flag survives lost source authority")
		check(s.player.stamina == st and s.ledger.mp == mp and s.ledger.attempts == 0, "loss causes no source commit and no legacy .28 fallback")
		observed.append({"detach": detach, "bound": snapshot["bound"], "ready": snapshot["ready"], "st": st, "mp": mp})
		await destroy_scene(s)
	return {"lifecycle_cases": observed}

func _test_packet_and_opaque_rejection() -> Dictionary:
	var s = await make_scene(true, {"reject_commit": true})
	check(s.player.request_attack(), "public attack provides actual ST deficit")
	var st: float = s.player.stamina
	var mp: float = s.ledger.mp
	await wait_ticks(s, 4.0)
	check(s.ledger.attempts > 0 and s.ledger.commits.is_empty() and s.player.stamina == st and s.ledger.mp == mp, "actual opaque false commit leaves ST/MP unchanged")
	var current: Dictionary = s.authority.read_native_regen_state()
	var packet = {"kind": "natural_regen", "source": "game.html:33359-33364", "writes": [
		{"field": "st", "before": current["st"], "value": current["st"], "cap_field": "mst"},
		{"field": "mp", "before": current["mp"], "value": current["mp"], "cap_field": "mmp"}]}
	check(ADAPTER._packet_error(packet, current).is_empty(), "pure production validator accepts exact packet")
	for kind in ["before", "cap", "field"]:
		var malformed: Dictionary = packet.duplicate(true)
		match kind:
			"before": malformed["writes"][0]["before"] = float(current["st"]) + 1.0
			"cap": malformed["writes"][1]["value"] = float(current["mmp"]) + 1.0
			"field": malformed["writes"][0]["field"] = "hp"
		check(not ADAPTER._packet_error(malformed, current).is_empty(), "pure production packet validator rejects " + kind)
	check(s.player.stamina == st and s.ledger.mp == mp, "pure validation never commits actual resources")
	var out = {"actual_opaque_commit_attempts": s.ledger.attempts, "successful_commits": 0, "malformed_packet_scope": "pure production _packet_error only; not actual phase dispatch"}
	await destroy_scene(s)
	return out
