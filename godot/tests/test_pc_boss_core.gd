extends SceneTree
## PC-BOSS-CORE (2026-10-22) — 1-1 보스 전투 owner 실제 Main 부팅 회귀.
## 아레나 입장은 실제 공개 spawn API(main.spawn_native_demo_boss)만 쓴다(ZOOM-01b와 같은 fixture).
## 보스 상태·시계·패턴·피해·사망을 주입하지 않는다. 플레이어 입력은 handle_native_input_event 실제 경로.
const USERDIR := "EXODUSER-pc-boss-core-Isolated-20261022"
var assertions := 0
var failures := 0
var main: Node
var log_rows: Array = []

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("PCBOSS_FAIL ", label)

func _initialize() -> void:
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	var ticks: int = int(_arg("ticks", "900"))
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	main.source_intro_sequence.finish_native_guide()
	main.source_state.read_current_g().on = true
	for i in range(65): await physics_frame
	main.source_intro_sequence.lesson_flow.skip_all()
	var core: Node = main.get("native_demo_boss_core")
	check(is_instance_valid(core), "core_installed")
	check(core.snapshot().adopted == false, "core_dormant_before_spawn")
	var scene: Node = main.world.get_node_or_null("Map11ProductScene")
	check(scene != null, "map11_scene")
	main.world.activate_map11_space("arena")
	var center: Vector2 = scene.arena_view.global_position
	main.player.global_position = center + Vector2(0, 700)
	main.player.reset_physics_interpolation()
	var spawned: Dictionary = main.spawn_native_demo_boss({"si": 0, "x": center.x, "y": center.y, "room": 0, "difficulty_index": 5, "stage_diff_offset": 0})
	print("PCBOSS_SPAWN ", JSON.stringify({"status": spawned.get("status"), "core": spawned.get("pc_boss_core")}))
	check(spawned.get("status") == "READY", "spawn_ready")
	check(spawned.get("pc_boss_core", {}).get("adopted") == true, "core_adopted")
	main.source_state.read_current_g()["_bossArena"] = true
	main.source_state.read_current_g()["bossAlive"] = true
	var actor: Node = main.native_demo_boss_actor
	var start_pos: Vector2 = Vector2(actor.snapshot().enemy.x, actor.snapshot().enemy.y)
	var states: Dictionary = {}
	var max_move := 0.0
	var hp0: float = main.player.hp
	for t in range(ticks):
		await physics_frame
		var snap: Dictionary = actor.snapshot()
		var s: String = str(snap.enemy.get("s", ""))
		states[s] = int(states.get(s, 0)) + 1
		max_move = maxf(max_move, Vector2(snap.enemy.x, snap.enemy.y).distance_to(start_pos))
		if t % 150 == 0:
			print("PCBOSS_LIVE ", t, " ", JSON.stringify({"s": s, "ticks": snap.ticks_completed, "reason": snap.reason, "clock": snap.clock_reason,
				"core_err": core.snapshot().error, "prefix": core.snapshot().prefix_reason, "php": main.player.hp}))
	var snap: Dictionary = actor.snapshot()
	var cs: Dictionary = core.snapshot()
	print("PCBOSS_STATES ", JSON.stringify(states))
	print("PCBOSS_CORE ", JSON.stringify(cs))
	check(snap.ticks_completed > 0, "boss_ticks_completed_positive")
	check(snap.reason == "", "actor_no_error:" + str(snap.reason))
	check(max_move > 1.0, "boss_moved")
	check(states.size() > 1, "boss_changed_state")
	print("PCBOSS_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "ticks": snap.ticks_completed,
		"player_hp_before": hp0, "player_hp_after": main.player.hp, "max_move": max_move}))
	main.queue_free()
	await process_frame
	quit(1 if failures else 0)
