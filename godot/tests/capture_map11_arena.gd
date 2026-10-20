extends SceneTree
## GUI-only GPU capture + ONE fixed-physics-N wall-clock benchmark.
## O(1) current-tick position; no API builds/returns tick-path lists.
const USERDIR = "EXODUSER-map11-01-Isolated-20261021"
const WARMUP_TICKS = 120
const BENCH_TICKS = 600
var arena: Node2D
var output_dir: String = ""
var bench_mode: bool = true
var _bench_active: bool = false
var _n: int = 0
var _start_us: int = 0
var _last_frame: int = 0
var _frames: int = 0
var _hist := PackedInt64Array()
var _cpu_us: int = 0
var _cpu_max: int = 0
var _draw_sum: int = 0
var _draw_samples: int = 0
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--capture-dir="): output_dir = arg.trim_prefix("--capture-dir=")
		if arg == "--no-benchmark": bench_mode = false
	_hist.resize(10001)
	call_deferred("_run")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR or output_dir.is_empty():
		quit(2)
		return
	if DisplayServer.get_name() == "headless":
		printerr("GPU CAPTURE REQUIRES REAL DISPLAY")
		quit(2)
		return
	root.size = Vector2i(1920,1080)
	root.content_scale_size = Vector2i(1920,1080)
	Engine.max_fps = 0
	DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
	DirAccess.make_dir_recursive_absolute(output_dir)
	arena = load("res://scenes/maps/map11/arena_preview.tscn").instantiate()
	root.add_child(arena)
	var index: int = 0
	for board in ["entry","close","wall","clear","body","bullets"]:
		index += 1
		arena.select_board(board)
		for i in range(20): await process_frame
		await create_timer(0.15).timeout
		await RenderingServer.frame_post_draw
		var image: Image = root.get_texture().get_image()
		if image.is_empty() or image.get_size() != Vector2i(1920,1080):
			printerr("INVALID GPU CAPTURE ",board)
			quit(3)
			return
		var name_: String = "%02d_%s"%[index,board]
		if image.save_png(output_dir.path_join(name_+".png")) != OK:
			quit(4)
			return
		# Literal pixel crop, no resize/color modification; records exact rect.
		var crop := Rect2i(640,250,640,480)
		if board == "entry": crop = Rect2i(730,10,640,480)
		elif board == "close": crop = Rect2i(650,70,640,960)
		elif board == "wall": crop = Rect2i(1080,180,640,640)
		elif board == "clear": crop = Rect2i(640,90,640,720)
		image.get_region(crop).save_png(output_dir.path_join(name_+"_1x.png"))
		var f := FileAccess.open(output_dir.path_join(name_+".json"),FileAccess.WRITE)
		f.store_string(JSON.stringify({"board":board,"size":[1920,1080],"crop_xywh":[crop.position.x,crop.position.y,crop.size.x,crop.size.y],"crop_scale":1,"camera":[arena.camera.position.x,arena.camera.position.y],"zoom":arena.camera.zoom.x,"preview_tick":arena.tick,"live_combat":false}))
		print("MAP11_CAPTURE ",name_)
	var receipt := FileAccess.open(output_dir.path_join("design-receipt.json"),FileAccess.WRITE)
	receipt.store_string(JSON.stringify(arena.get_design_receipt()))
	if not bench_mode:
		arena.free()
		quit(0)
		return
	arena.select_board("entry")
	for i in range(WARMUP_TICKS): await physics_frame
	_start_us = Time.get_ticks_usec()
	_last_frame = _start_us
	_bench_active = true
func _process(_delta: float) -> bool:
	if _bench_active:
		var now: int = Time.get_ticks_usec()
		var diff: int = now-_last_frame
		_hist[mini(10000,int(diff/10))] += 1
		_last_frame = now
		_frames += 1
		_draw_sum += RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME)
		_draw_samples += 1
	return false
func _physics_process(_delta: float) -> bool:
	if not _bench_active: return false
	var start: int = Time.get_ticks_usec()
	_n += 1
	# Scalar analytic movement of the preview body (not a product combat replay).
	var angle: float = TAU*float(_n)/BENCH_TICKS
	arena.player.position = Vector2(cos(angle)*1600,sin(angle)*1200)
	arena.camera.position = arena.player.position*.72
	var cost: int = Time.get_ticks_usec()-start
	_cpu_us += cost
	_cpu_max = maxi(_cpu_max,cost)
	if _n == BENCH_TICKS:
		_bench_active = false
		call_deferred("_finish")
	return false
func _percentile(fraction: float) -> float:
	var threshold: int = int(ceil(float(_frames)*fraction))
	var total: int = 0
	for i in range(_hist.size()):
		total += _hist[i]
		if total >= threshold: return float(i+1)*.01
	return 100.01
func _finish() -> void:
	var elapsed: float = float(Time.get_ticks_usec()-_start_us)/1000000.0
	var result: Dictionary = {"physics_ticks":_n,"physics_hz":Engine.physics_ticks_per_second,"warmup_ticks":WARMUP_TICKS,"wall_seconds":elapsed,"render_frames":_frames,"mean_render_fps":float(_frames)/elapsed,"frame_p95_ms_upper_bin":_percentile(.95),"frame_p99_ms_upper_bin":_percentile(.99),"histogram_resolution_ms":.01,"preview_driver_cpu_mean_us":float(_cpu_us)/BENCH_TICKS,"preview_driver_cpu_max_us":_cpu_max,"mean_draw_calls":float(_draw_sum)/maxi(1,_draw_samples),"renderer":RenderingServer.get_current_rendering_method(),"adapter":RenderingServer.get_video_adapter_name(),"display":DisplayServer.get_name(),"viewport":[1920,1080],"vsync":DisplayServer.window_get_vsync_mode(),"godot":Engine.get_version_info().string,"target_fps":120,"floor_fps":60,"target_frame_ms":8.33333333333333,"map_cpu_budget_ms":1.25,"environment_gpu_budget_ms":3,"gpu_timer_available":false,"live_combat":false,"tick_path_list_api":false,"scope":"preview render + physics body fixture, no AI/projectile/damage consumer"}
	var f := FileAccess.open(output_dir.path_join("../benchmark.json").simplify_path(),FileAccess.WRITE)
	f.store_string(JSON.stringify(result))
	print("MAP11_BENCH ",JSON.stringify(result))
	arena.free()
	quit(0)
