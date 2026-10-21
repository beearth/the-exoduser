extends SceneTree
## PC-SOURCE-PERF — actual Main boot (MAP11 default ON), field + arena,
## 600 physics ticks each while the actual Player walks (4 x 150 ticks).
## Headless CPU: run with `--headless --fixed-fps 120` so every render frame
## advances 1/120 s (one 60 Hz physics tick every two frames) without real-time
## sleeping. Frame interval = whole CPU frame (process + physics when present).
const USERDIR := "EXODUSER-pc-source-perf-Isolated-20261021"
const PROBE := preload("res://tests/pc_source_validation_probe.gd")
var main: Node
var checks := 0
var failures := 0
var output := ""
var phys_begin := 0
var phys_samples: Array[int] = []
var proc_begin := 0
var proc_samples: Array[int] = []
var collecting := false

class Stamp extends Node:
	var on_physics: Callable
	var on_process: Callable
	func _physics_process(_dt: float) -> void:
		if on_physics.is_valid(): on_physics.call()
	func _process(_dt: float) -> void:
		if on_process.is_valid(): on_process.call()

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCSP_BENCH_FAIL ", label)

func arg(key: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with(key + "="): return a.substr(key.length() + 1)
	return fallback

func settle(point: Vector2) -> void:
	main.player.global_position = point; main.player.reset_physics_interpolation()
	main.camera.global_position = point; main.camera.reset_smoothing(); main.camera.reset_physics_interpolation()
	for i in range(35): await physics_frame

func stats(values: Array, scale: float) -> Dictionary:
	if values.is_empty(): return {}
	var ordered: Array = values.duplicate(); ordered.sort()
	var sum := 0.0
	for v in values: sum += float(v)
	return {"samples": values.size(), "mean_ms": sum / values.size() * scale,
		"p50_ms": float(ordered[int(values.size() * .50)]) * scale,
		"p95_ms": float(ordered[mini(values.size() - 1, int(values.size() * .95))]) * scale,
		"p99_ms": float(ordered[mini(values.size() - 1, int(values.size() * .99))]) * scale,
		"max_ms": float(ordered[-1]) * scale}

func measure(space: String, origin: Vector2) -> Dictionary:
	await settle(origin)
	for i in range(30): await process_frame
	var frames: Array = []
	phys_samples.clear(); proc_samples.clear()
	var last := [Time.get_ticks_usec()]
	var sampler := func():
		var now := Time.get_ticks_usec()
		frames.append(now - last[0]); last[0] = now
	PROBE.reset(); PROBE.enabled = true
	var start := Time.get_ticks_usec()
	var frame_start := Engine.get_process_frames()
	var tick_start := Engine.get_physics_frames()
	last[0] = start
	collecting = true
	process_frame.connect(sampler)
	var actions: Array[String] = ["move_left", "move_down", "move_right", "move_up"]
	var corners: Array[Vector2] = [main.player.global_position]
	var input_ok := true
	for action in actions:
		var event := InputEventAction.new(); event.action = action; event.pressed = true
		input_ok = input_ok and main.player.handle_native_input_event(event).get("accepted", false)
		for i in range(150):
			main.player.handle_native_input_event(event)
			await physics_frame
		event.pressed = false; main.player.handle_native_input_event(event)
		corners.append(main.player.global_position)
	process_frame.disconnect(sampler)
	collecting = false
	PROBE.enabled = false
	var elapsed := Time.get_ticks_usec() - start
	var ticks := Engine.get_physics_frames() - tick_start
	var render_frames := Engine.get_process_frames() - frame_start
	var walk := 0.0
	for i in range(1, corners.size()): walk += corners[i - 1].distance_to(corners[i])
	check(input_ok and walk > 200.0, space + " actual Player walking")
	return {"space": space, "product_space": main.native_map11.snapshot().space if is_instance_valid(main.native_map11) else "legacy",
		"ticks": ticks, "render_frames": render_frames, "wall_ms": elapsed / 1000.0,
		"wall_per_tick_ms": elapsed / 1000.0 / maxi(1, ticks),
		"frame": stats(frames, .001), "physics_cpu": stats(phys_samples, .001), "process_cpu": stats(proc_samples, .001),
		"walk_distance": walk, "probe": PROBE.snapshot(render_frames)}

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated userdir")
	if failures: quit(2); return
	output = arg("--output", "")
	Engine.max_fps = 0
	main = load("res://scenes/main.tscn").instantiate(); main.set_meta("native_intro_boot", "intro"); root.add_child(main)
	if not is_instance_valid(main.source_intro_sequence): quit(5); return
	main.source_intro_sequence.finish_native_guide(); main.source_state.read_current_g().on = true
	for i in range(65): await physics_frame
	main.source_intro_sequence.lesson_flow.skip_all(); main.world.get_node("NativePets")._subtitle_root.hide()
	# Bracket every physics/process callback of the tree (priority extremes).
	var first := Stamp.new(); first.process_physics_priority = -100000; first.process_priority = -100000
	first.on_physics = func(): phys_begin = Time.get_ticks_usec()
	first.on_process = func(): proc_begin = Time.get_ticks_usec()
	var last_stamp := Stamp.new(); last_stamp.process_physics_priority = 100000; last_stamp.process_priority = 100000
	last_stamp.on_physics = func(): if collecting: phys_samples.append(Time.get_ticks_usec() - phys_begin)
	last_stamp.on_process = func(): if collecting: proc_samples.append(Time.get_ticks_usec() - proc_begin)
	root.add_child(first); root.add_child(last_stamp)
	var results: Array = []
	var map11 := is_instance_valid(main.native_map11)
	if map11:
		var scene: Node = main.world.get_node("Map11ProductScene")
		scene.activate_space("field")
		results.append(await measure("field", Vector2(-850, -2400)))
		scene.activate_space("arena")
		results.append(await measure("arena", scene.arena_view.global_position + Vector2(1250, 80)))
	else:
		results.append(await measure("legacy", main.player.global_position))
	var summary := {"label": arg("--label", ""), "map11": map11, "fixed_fps": Engine.get_physics_ticks_per_second(),
		"display": DisplayServer.get_name(), "user_dir": OS.get_user_data_dir(), "results": results,
		"checks": checks, "failures": failures}
	print("PCSP_BENCH_RESULT ", JSON.stringify(summary))
	if not output.is_empty():
		var f := FileAccess.open(output, FileAccess.WRITE)
		if f: f.store_string(JSON.stringify(summary, "  "))
	main.queue_free()
	for i in range(8): await process_frame
	quit(0 if failures == 0 else 1)
