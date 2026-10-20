extends SceneTree
## Real GUI capture + one 600-physics-tick wall-clock sample over 8 primary views.
const USERDIR = "EXODUSER-map11-10-Isolated-20261021"
const IDS = ["start","early","main","west","east","landmark","late","gate","overview","occlusion"]
var field: Node2D
var output: String = ""
var benchmark: bool = true
var proof_main: bool = false
var verify_seams: bool = false
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
		if arg == "--proof-main": proof_main = true
		if arg == "--verify-seams": verify_seams = true
	_hist.resize(10001)
	call_deferred("_run")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR or not OS.get_user_data_dir().contains(USERDIR) or output.is_empty() or DisplayServer.get_name()=="headless":
		quit(2)
		return
	print("ISOLATION ",OS.get_user_data_dir())
	root.size = Vector2i(1920,1080)
	root.content_scale_size = Vector2i(1920,1080)
	Engine.max_fps = 0
	DisplayServer.window_set_vsync_mode(DisplayServer.VSYNC_DISABLED)
	DirAccess.make_dir_recursive_absolute(output)
	field = load("res://scenes/maps/map11/field_seam_preview.tscn").instantiate()
	root.add_child(field)
	if field.adapter == null or not field.adapter.runtime_ready():
		quit(3)
		return
	for index in range(IDS.size()):
		var id: String = IDS[index]
		if proof_main and id!="main": continue
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
		# G2 1x focuses outer RGBA joins; the main clearing retains the player crop.
		if id=="main": crop=Rect2i(0,400,640,640)
		elif id=="start": crop=Rect2i(0,400,640,640)
		elif id=="early": crop=Rect2i(0,340,640,640)
		elif id=="west": crop=Rect2i(0,240,640,640)
		elif id=="east": crop=Rect2i(1280,220,640,640)
		elif id=="landmark": crop=Rect2i(0,160,640,640)
		elif id=="late": crop=Rect2i(1280,0,640,640)
		elif id=="gate": crop=Rect2i(0,320,640,640)
		image.get_region(crop).save_png(output.path_join(name_+"_1x.png"))
		var f := FileAccess.open(output.path_join(name_+".json"),FileAccess.WRITE)
		f.store_string(JSON.stringify({"id":id,"size":[1920,1080],"crop_xywh":[crop.position.x,crop.position.y,crop.size.x,crop.size.y],"crop_scale":1,"camera":field.camera.position,"zoom":field.camera.zoom.x,"primary_scene":index<8,"product_connected":false}))
		print("FIELD_CAPTURE ",name_)
	var receipt := FileAccess.open(output.path_join("design-receipt.json"),FileAccess.WRITE)
	receipt.store_string(JSON.stringify(field.receipt()))
	if not benchmark:
		if verify_seams and not await _surface_probe():
			field.free(); quit(5); return
		field.free()
		quit(0)
		return
	if not await _surface_probe():
		field.free(); quit(5); return
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
	var result: Dictionary = {"physics_ticks":_n,"physics_hz":Engine.physics_ticks_per_second,"warmup_ticks":120,"wall_seconds":elapsed,"render_frames":_frames,"mean_render_fps":_frames/elapsed,"frame_p95_ms_upper_bin":percentile(.95),"frame_p99_ms_upper_bin":percentile(.99),"mean_draw_calls":float(_draw_sum)/maxi(1,_frames),"adapter":RenderingServer.get_video_adapter_name(),"renderer":RenderingServer.get_current_rendering_method(),"viewport":[1920,1080],"target_fps":120,"floor_fps":60,"map_cpu_budget_ms":1.25,"environment_gpu_budget_ms":3,"gpu_timer_available":false,"primary_views":8,"scope":"G3/G4 RGBA field seam preview + independent body, not product AI/combat/GPU timer","tick_path_list_api":false}
	var f := FileAccess.open(output.path_join("../benchmark.json").simplify_path(),FileAccess.WRITE)
	f.store_string(JSON.stringify(result))
	print("FIELD_BENCH ",JSON.stringify(result))
	field.free()
	quit(0)

func _surface_probe() -> bool:
	# Isolated actual-render comparison: continuous master -> overlapping
	# world-coordinate polygons -> lossless cropped/bleeding tile reassembly.
	var dir_: String=output.path_join("../seam_probe").simplify_path()
	DirAccess.make_dir_recursive_absolute(dir_)
	var viewport:=SubViewport.new(); viewport.size=Vector2i(576,576); viewport.world_2d=World2D.new(); viewport.transparent_bg=true; viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS; root.add_child(viewport)
	var container:=Node2D.new(); viewport.add_child(container)
	var cam:=Camera2D.new(); cam.process_callback=Camera2D.CAMERA2D_PROCESS_PHYSICS; cam.position=Vector2(0,1024); cam.zoom=Vector2.ONE*.5; viewport.add_child(cam); cam.make_current()
	_probe_quad(container,Rect2(-576,448,1152,1152))
	for i in range(4): await process_frame
	await RenderingServer.frame_post_draw
	var master: Image=viewport.get_texture().get_image()
	if master.get_pixel(288,288).a<.99: viewport.free(); return false
	master.save_png(dir_.path_join("master.png"))
	for node in container.get_children(): node.free()
	_probe_quad(container,Rect2(-576,448,640,1152)); _probe_quad(container,Rect2(-64,448,640,1152))
	for i in range(4): await process_frame
	await RenderingServer.frame_post_draw
	var split: Image=viewport.get_texture().get_image(); split.save_png(dir_.path_join("world_split.png"))
	var split_error: float=_image_error(master,split)
	for node in container.get_children(): node.free()
	var left: Image=master.get_region(Rect2i(0,0,320,576)); var right: Image=master.get_region(Rect2i(256,0,320,576))
	left.save_png(dir_.path_join("tile_left_bleed32.png")); right.save_png(dir_.path_join("tile_right_bleed32.png"))
	for i in range(2):
		var sprite:=Sprite2D.new(); sprite.texture=ImageTexture.create_from_image(left if i==0 else right); sprite.position=Vector2(-256 if i==0 else 256,1024); sprite.scale=Vector2.ONE*2; container.add_child(sprite)
	for i in range(4): await process_frame
	await RenderingServer.frame_post_draw
	var joined: Image=viewport.get_texture().get_image(); joined.save_png(dir_.path_join("tile_reassembled.png"))
	var tile_error: float=_image_error(master,joined)
	var result: Dictionary={"probe_only":true,"sample_stride_pixels":8,"sample_points":5184,"size":[576,576],"world_bounds":[-576,448,1152,1152],"world_units_per_pixel":2,"core_world_width":512,"bleed_world":64,"bleed_pixels":32,"left_crop":[0,0,320,576],"right_crop":[256,0,320,576],"max_channel_delta_world_split":split_error,"max_channel_delta_baked_tiles":tile_error,"threshold":2.0/255,"production_world_streamer_installed":false}
	var f:=FileAccess.open(dir_.path_join("manifest.json"),FileAccess.WRITE); f.store_string(JSON.stringify(result))
	print("SEAM_RENDER_RESULT ",JSON.stringify(result)); viewport.free()
	return split_error<=2.0/255 and tile_error<=2.0/255
func _probe_quad(parent: Node2D, rect: Rect2) -> void:
	var polygon:=Polygon2D.new(); polygon.position=rect.position
	polygon.polygon=PackedVector2Array([Vector2.ZERO,Vector2(rect.size.x,0),rect.size,Vector2(0,rect.size.y)])
	var material_: ShaderMaterial=field._surface.material.duplicate(); material_.set_shader_parameter("surface_origin",rect.position); polygon.material=material_; parent.add_child(polygon)
func _image_error(a: Image,b: Image) -> float:
	var maximum: float=0
	for y in range(0,576,8):
		for x in range(0,576,8):
			var d: Color=a.get_pixel(x,y)-b.get_pixel(x,y)
			maximum=maxf(maximum,maxf(absf(d.r),maxf(absf(d.g),absf(d.b))))
	return maximum
