extends "res://tests/test_demo11_15_lesson.gd"
## UI preview only: manually selects steps, never claims PC combat completion.
const OUT := "/Users/fordeargamers/exoduser-wt/_out/demo11-15"
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != NEW_USERDIR:
		quit(2)
		return
	if not await _boot():
		quit(1)
		return
	flow.begin_practice()
	# Freeze simulation after Main boot; capture stable authored UI at native scale.
	active_main.process_mode = Node.PROCESS_MODE_DISABLED
	for number in [2,7]:
		flow.step = number
		flow.phase = "practice"
		flow.pending = ""
		flow._enter_additional_step()
		flow._render()
		await process_frame
		await RenderingServer.frame_post_draw
		var image := root.get_texture().get_image()
		var code := image.save_png(OUT+"/lesson-step%d.png" % number)
		print("CAPTURE_RESULT ", number, " ", code, " ", image.get_size())
		if number == 2:
			var crop := image.get_region(Rect2i(image.get_width()-456,16,400,image.get_height()-32))
			crop.save_png(OUT+"/lesson-step2-crop-1x.png")
	flow.skip_all()
	active_main.free()
	active_main = null
	# 기존 QA-004 하니스와 동일: 비동기 AudioServer 종료 정리 기회.
	for frame in range(12):
		await process_frame
	var exit_after := Time.get_ticks_msec() + 200
	while Time.get_ticks_msec() < exit_after:
		await process_frame
	quit(0)
