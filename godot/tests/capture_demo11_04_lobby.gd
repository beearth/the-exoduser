extends SceneTree
## Real render capture only; persisted explicit test fixtures, no gameplay restore.
const USERDIR = "EXODUSER-demo11-04-Isolated-20261021"
func _initialize() -> void: call_deferred("_run")
func _run() -> void:
	if OS.get_user_data_dir().get_file()!=USERDIR: quit(2); return
	var output := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--capture-out="): output=arg.trim_prefix("--capture-out=")
	if output.is_empty() or DisplayServer.get_name()=="headless": quit(2); return
	root.size=Vector2i(1920,1080)
	root.content_scale_size=Vector2i(1920,1080)
	var screen=load("res://scenes/demo_lobby.tscn").instantiate()
	if screen.get_script()==null: screen.free(); quit(3); return
	root.add_child(screen)
	for i in 4: await process_frame
	if not screen.menu.ready or screen.menu.rows[0].kind!="saved": quit(3); return
	screen.cards[0].pressed.emit()
	await RenderingServer.frame_post_draw
	var image := root.get_texture().get_image()
	if image.get_size()!=Vector2i(1920,1080): quit(4); return
	if image.save_png(output.path_join("01-list-1920x1080.png"))!=OK: quit(5); return
	image.get_region(Rect2i(175,120,660,470)).save_png(output.path_join("03-title-art-crop-1x.png"))
	image.get_region(Rect2i(990,225,800,230)).save_png(output.path_join("01-list-crop-1x.png"))
	screen.erase.grab_focus(); screen.erase.pressed.emit()
	await process_frame
	await RenderingServer.frame_post_draw
	image=root.get_texture().get_image()
	if image.save_png(output.path_join("02-delete-confirm-1920x1080.png"))!=OK: quit(5); return
	image.get_region(Rect2i(530,320,860,430)).save_png(output.path_join("02-delete-crop-1x.png"))
	print("DEMO11_04_CAPTURE_RESULT ",JSON.stringify({"viewport":[1920,1080],"actual_io":true,"fixture_saves":true,"restore":false,"list":true,"delete_modal":screen.modal.visible,"output":output}))
	screen.cancel.pressed.emit()
	root.remove_child(screen); screen.free()
	await process_frame
	quit(0)
