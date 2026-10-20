extends SceneTree
## Real GUI capture + one 600-physics-tick wall-clock sample over 8 primary views.
const USERDIR = "EXODUSER-map11-07-Isolated-20261021"
const IDS = ["start","early","main","west","east","landmark","late","gate","overview","occlusion"]
var field: Node2D
var output: String = ""
var benchmark: bool = true
var _active: bool = false
var _n: int = 0
var _start: int = 0
var _last: int = 0
var _frames: int = 0
var _hist := PackedInt64Array()
var _draw_sum: int = 0
var _board: int = -1
var _positions := PackedVector2Array()
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--capture-dir="): output = arg.trim_prefix("--capture-dir=")
		if arg == "--no-benchmark": benchmark = false
	_hist.resize(10001)
	call_deferred("_run")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR or output.is_empty() or DisplayServer.get_name()=="headless":
		quit(2)
		return
	root.size = Vector2i(1920,1080)
	root.content_scale_size = Vector2i(1920,1080)
	Engine.max_fps = 0
	DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
	DirAccess.make_dir_recursive_absolute(output)
	field = load("res://scenes/maps/map11/field_preview.tscn").instantiate()
	root.add_child(field)
	if field.adapter == null or not field.adapter.runtime_ready():
		quit(3)
		return
	for index in range(IDS.size()):
		var id: String = IDS[index]
		field.select_board(id)
		for i in range(20): await process_frame
		await create_timer(.25).timeout
		await RenderingServer.frame_post_draw
		var image: Image = root.get_texture().get_image()
		if image.get_size() != Vector2i(1920,1080):
			quit(4)
			return
		var name_: String = "%02d_%s"%[index+1,id]
		image.save_png(output.path_join(name_+".png"))
		var screen: Vector2 = (field.player.position-field.camera.position)*field.camera.zoom+Vector2(960,540)
		var crop := Rect2i(clampi(int(screen.x)-320,0,1280),clampi(int(screen.y)-400,0,440),640,640)
		if id=="landmark": crop = Rect2i(620,80,680,920)
		if id=="overview": crop = Rect2i(420,120,1080,840)
		image.get_region(crop).save_png(output.path_join(name_+"_1x.png"))
		var f := FileAccess.open(output.path_join(name_+".json"),FileAccess.WRITE)
		f.store_string(JSON.stringify({"id":id,"size":[1920,1080],"crop_xywh":[crop.position.x,crop.position.y,crop.size.x,crop.size.y],"crop_scale":1,"camera":field.camera.position,"zoom":field.camera.zoom.x,"primary_scene":index<8,"product_connected":false}))
		print("FIELD_CAPTURE ",name_)
	var receipt := FileAccess.open(output.path_join("design-receipt.json"),FileAccess.WRITE)
	receipt.store_string(JSON.stringify(field.receipt()))
	if not benchmark:
		field.free()
		quit(0)
		return
	for i in range(8):
		field.select_board(IDS[i])
		_positions.append(field.player.position)
	field.select_board("start")
	for i in range(120): await physics_frame
	_start = Time.get_ticks_usec()
	_last = _start
	_active = true
func _process(_delta: float) -> bool:
	if _active:
		var now: int = Time.get_ticks_usec()
		_hist[mini(10000,int((now-_last)/10))] += 1
		_last = now
		_frames += 1
		_draw_sum += RenderingServer.get_rendering_info(RenderingServer.RENDERING_INFO_TOTAL_DRAW_CALLS_IN_FRAME)
	return false
func _physics_process(_delta: float) -> bool:
	if not _active: return false
	_n += 1
	var next: int = mini(7,int((_n-1)/75))
	if next != _board:
		_board = next
		field.select_board(IDS[_board])
	var a: float = TAU*float(_n%75)/75.0
	field.player.position = _positions[_board]+Vector2(cos(a)*50,sin(a)*50)
	if _n==600:
		_active = false
		call_deferred("_finish")
	return false
func percentile(fraction: float) -> float:
	var threshold: int = int(ceil(_frames*fraction))
	var sum_: int = 0
	for i in range(_hist.size()):
		sum_ += _hist[i]
		if sum_>=threshold: return (i+1)*.01
	return 100.01
func _finish() -> void:
	var elapsed: float = float(Time.get_ticks_usec()-_start)/1000000.0
	var result: Dictionary = {"physics_ticks":_n,"physics_hz":Engine.physics_ticks_per_second,"warmup_ticks":120,"wall_seconds":elapsed,"render_frames":_frames,"mean_render_fps":_frames/elapsed,"frame_p95_ms_upper_bin":percentile(.95),"frame_p99_ms_upper_bin":percentile(.99),"mean_draw_calls":float(_draw_sum)/maxi(1,_frames),"adapter":RenderingServer.get_video_adapter_name(),"renderer":RenderingServer.get_current_rendering_method(),"viewport":[1920,1080],"target_fps":120,"floor_fps":60,"map_cpu_budget_ms":1.25,"environment_gpu_budget_ms":3,"gpu_timer_available":false,"primary_views":8,"scope":"gray field preview + independent body, not product AI/combat/GPU timer","tick_path_list_api":false}
	var f := FileAccess.open(output.path_join("../benchmark.json").simplify_path(),FileAccess.WRITE)
	f.store_string(JSON.stringify(result))
	print("FIELD_BENCH ",JSON.stringify(result))
	field.free()
	quit(0)
