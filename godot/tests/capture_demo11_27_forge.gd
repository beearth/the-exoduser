extends SceneTree
const USERDIR = "EXODUSER-demo11-27-Isolated-20261021"
var main: Node
func _initialize() -> void:call_deferred("_run")
func _run() -> void:
	TranslationServer.set_locale("ko")
	root.size=Vector2i(1920,1080)
	DisplayServer.window_set_size(Vector2i(1920,1080))
	var out=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--capture-dir="):out=arg.trim_prefix("--capture-dir=")
	if out.is_empty() or OS.get_user_data_dir().get_file()!=USERDIR:
		printerr("CAPTURE_FAIL arguments/isolation");quit(2);return
	DirAccess.make_dir_recursive_absolute(out)
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in range(8):await physics_frame
	var panel:CanvasLayer=main.source_forge
	# Explicit capture-only funding fixture; the actual State/item/RNG/UI are used.
	main.source_state.read_current_g().mats=50000
	panel.select_slot("weapon");panel.open_panel()
	var result:Dictionary=panel.attempt_selected()
	await process_frame
	await process_frame
	await RenderingServer.frame_post_draw
	var image:Image=root.get_texture().get_image()
	var rect:Rect2=panel._screen.get_child(1).get_global_rect()
	var failures:int=0
	if image.get_width()!=1920 or image.get_height()!=1080:failures+=1
	if rect.end.x>1920 or rect.end.y>1080:failures+=1
	var full=out.path_join("forge-1920x1080.png")
	var crop=out.path_join("forge-panel-1x.png")
	if image.save_png(full)!=OK:failures+=1
	if image.get_region(Rect2i(rect)).save_png(crop)!=OK:failures+=1
	var evidence={"assertions":4,"failures":failures,"capture_fixture_mats":50000,"paid_result":result,"panel_rect":[rect.position.x,rect.position.y,rect.size.x,rect.size.y],"full":full,"crop":crop,"scale":1,"viewport":[image.get_width(),image.get_height()]}
	var f=FileAccess.open(out.path_join("capture.json"),FileAccess.WRITE);f.store_string(JSON.stringify(evidence,"  "));f.close()
	panel.close_panel()
	main.queue_free();main=null
	await process_frame
	await create_timer(.15).timeout
	print("DEMO11_27_CAPTURE_RESULT ",JSON.stringify(evidence))
	quit(0 if failures==0 else 1)
