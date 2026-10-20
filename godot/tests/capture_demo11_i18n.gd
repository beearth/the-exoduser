extends SceneTree
const USERDIR="EXODUSER-demo11-i18n-Isolated-20261021"
var output: String
var evidence: Array=[]
var failures:=0
func _initialize() -> void:call_deferred("_run")
func capture(id: String,rect: Rect2i) -> void:
	var image: Image=root.get_texture().get_image()
	if image.get_size()!=Vector2i(1920,1080):failures+=1
	var full: String=output.path_join(id+"-1920x1080.png")
	var crop: String=output.path_join(id+"-crop-1x.png")
	if image.save_png(full)!=OK or image.get_region(rect).save_png(crop)!=OK:failures+=1
	evidence.append({"id":id,"full":full,"crop":crop,"crop_rect":[rect.position.x,rect.position.y,rect.size.x,rect.size.y],"scale":1})
func _run() -> void:
	if OS.get_user_data_dir().get_file()!=USERDIR or DisplayServer.get_name()=="headless":quit(2);return
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--capture-dir="):output=arg.trim_prefix("--capture-dir=")
	if output.is_empty():quit(2);return
	DirAccess.make_dir_recursive_absolute(output)
	root.size=Vector2i(1920,1080);root.content_scale_size=Vector2i(1920,1080);DisplayServer.window_set_size(Vector2i(1920,1080))
	TranslationServer.set_locale("en")
	var lobby=load("res://scenes/demo_lobby.tscn").instantiate();root.add_child(lobby)
	await process_frame;await process_frame;await RenderingServer.frame_post_draw
	capture("lobby-en",Rect2i(968,76,842,964))
	lobby.queue_free();await process_frame
	var main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	if not main.is_node_ready():await main.ready
	main.source_forge.open_panel()
	await process_frame;await process_frame;await RenderingServer.frame_post_draw
	capture("forge-en-extra",Rect2i(main.source_forge._screen.get_child(1).get_global_rect()))
	main.source_forge.close_panel()
	var overlay:=CanvasLayer.new();overlay.layer=100;root.add_child(overlay)
	var guide=load("res://scripts/native_intro_key_guide_panel.gd").new();guide.bind(overlay);guide.show_step(1)
	await create_timer(.5).timeout;await RenderingServer.frame_post_draw
	var snap: Dictionary=guide.get_snapshot()
	if not snap.visible or float(snap.alpha)<.99 or not guide.is_visible_in_tree():failures+=1
	var rect: Rect2i=Rect2i(guide._nodes.panel.get_global_rect())
	if rect.position.x<0 or rect.position.y<0 or rect.end.x>1920 or rect.end.y>1080:failures+=1
	capture("intro-en-extra",rect)
	overlay.free()
	for child in main.find_children("*","AudioStreamPlayer",true,false):child.stop()
	main.queue_free();await process_frame;await create_timer(.15).timeout
	var file=FileAccess.open(output.path_join("capture.json"),FileAccess.WRITE)
	file.store_string(JSON.stringify({"captures":evidence,"unavailable_requested_screens":["inventory (23b unmerged)","demo end (38 unmerged)"],"extra_screens_are_not_substitutes":true,"failures":failures},"  "));file.close()
	print("CAPTURE_I18N_RESULT ",JSON.stringify({"assertions":8,"failures":failures,"captures":evidence,"requested_captures_completed":1,"requested_captures_not_ready":2}))
	quit(1 if failures else 0)
