extends SceneTree
## P2-001k 시각 검수 — 레슨 패널(intro / -3 이동 / -2 기검참) 실창 캡처.
## 웹 같은 단계 샷(_out/p2-001k/web/w_lesson_*.png)과 1x 크롭 대조용.
const USERDIR = "EXODUSER-P2001K-Isolated-20261020"
const OUT = "G:/exoduser-wt/_out/p2-001k/godot"

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		print("VISUAL_ABORT not_isolated")
		quit(2)
		return
	DirAccess.make_dir_recursive_absolute(OUT)
	var main: Node = (load("res://scenes/main.tscn") as PackedScene).instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	for i in range(8):
		await physics_frame
	var sequence: Node2D = main.get("source_intro_sequence")
	var flow: Node = sequence.get("lesson_flow")
	sequence.finish_native_guide()
	var deadline: int = Time.get_ticks_msec() + 5000
	while Time.get_ticks_msec() < deadline and flow.get("active") != true:
		await process_frame
	await _shot("g_lesson_intro")
	flow.begin_practice()
	await _wall(500)
	await _shot("g_lesson_move")
	var player: Node2D = main.get("player")
	for i in range(90):
		player.set("velocity", Vector2(150, 0))
		player.global_position += Vector2(1.8, 0)
		await process_frame
	deadline = Time.get_ticks_msec() + 6000
	while Time.get_ticks_msec() < deadline and int(flow.get("step")) != -2:
		await process_frame
	await _wall(400)
	await _shot("g_lesson_attack")
	print("VISUAL_STATE ", JSON.stringify({"step": flow.get("step"), "enemies": flow.call("_alive_attack_enemies")}))
	print("VISUAL_DONE fps=", Engine.get_frames_per_second())
	main.get_parent().remove_child(main)
	main.free()
	quit(0)

func _wall(ms: int) -> void:
	var t0: int = Time.get_ticks_msec()
	while Time.get_ticks_msec() - t0 < ms:
		await process_frame

func _shot(name_tag: String) -> void:
	await RenderingServer.frame_post_draw
	var img: Image = root.get_viewport().get_texture().get_image()
	img.save_png("%s/%s.png" % [OUT, name_tag])
