extends SceneTree
## PC-BOSS-CORE — 보스방 600틱 벽시계 벤치(헤드리스). --mode=on(PC 보스 코어) / --mode=off(코어 제거 = 기존 idle 보스).
## 실제 gate 입장 후 60틱 예열, 600 물리 프레임의 프레임 간 벽시계(usec)와 _physics 구간 합을 기록한다.
const USERDIR := "EXODUSER-pc-boss-core-Isolated-20261022"
var main: Node

func _initialize() -> void:
	create_timer(300.0).timeout.connect(func(): print("PCBOSS_BENCH_WATCHDOG"); quit(2))
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _run() -> void:
	if not OS.get_user_data_dir().ends_with(USERDIR): quit(3); return
	var mode: String = _arg("mode", "on")
	Engine.physics_ticks_per_second = 120 # bench_pc_followups_field600 과 같은 작업량 측정 조건
	Engine.max_fps = 0
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	main.source_intro_sequence.finish_native_guide()
	main.source_state.read_current_g().on = true
	for i in range(65): await physics_frame
	main.source_intro_sequence.lesson_flow.skip_all()
	if mode == "off" and is_instance_valid(main.native_demo_boss_core):
		var c: Node = main.native_demo_boss_core
		main.native_demo_boss_core = null
		c.free()
	var provider: Node2D = main.read_native_map11_provider()
	var g: Dictionary = main.source_state.read_current_g()
	g.on = true; g._fbDone = true; g.bossAlive = true
	for region in g._regions: region.cleared = true
	var regions: Node = main.get_node("NativeRegions")
	regions.set("_last_frame", -1.0); regions._physics_process(0)
	var entered: Dictionary = main.enter_native_demo_arena(provider, {"room": 0, "difficulty_index": 5, "stage_diff_offset": 0})
	for i in range(60):
		main.player.iframes = maxf(main.player.iframes, 5.0)
		await physics_frame
	var samples: Array = []
	var last := Time.get_ticks_usec()
	for i in range(600):
		main.player.iframes = maxf(main.player.iframes, 5.0) # 플레이어 생존 fixture(측정 구간 동일 조건)
		await physics_frame
		var now := Time.get_ticks_usec()
		samples.append((now - last) / 1000.0)
		last = now
	samples.sort()
	var total := 0.0
	for v in samples: total += v
	var snap: Dictionary = main.read_native_demo_boss()
	print("PCBOSS_BENCH ", JSON.stringify({"mode": mode, "entered": entered.get("status"), "frames": samples.size(),
		"mean_ms": total / samples.size(), "p50_ms": samples[300], "p95_ms": samples[int(samples.size() * 0.95)], "max_ms": samples[-1],
		"boss_ticks": snap.get("ticks_completed"), "boss_state": snap.get("enemy", {}).get("s"),
		"core": main.native_demo_boss_core.snapshot().counters if is_instance_valid(main.native_demo_boss_core) else null}))
	main.free()
	quit(0)
