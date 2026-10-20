extends SceneTree
## P2-001h 시각 검수 — 실창 렌더로 커튼 닫힘→오픈→5마리 링·화톳불 결계를 캡처.
## (headless 금지. 격리 userdir 필수. 판정은 산출 PNG를 눈으로 — 웹 cmp1 구도 대조.)
const SequenceScript = preload("res://scripts/native_intro_curtain_sequence.gd")
const USERDIR = "EXODUSER-P2001H-Isolated-20261020"
const OUT = "G:/exoduser-wt/_out/p2-001h/godotboot"

var active_main: Node

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	if not isolated:
		print("VISUAL_ABORT not_isolated")
		quit(2)
		return
	DirAccess.make_dir_recursive_absolute(OUT)
	var packed: PackedScene = load("res://scenes/main.tscn")
	active_main = packed.instantiate()
	root.add_child(active_main)
	for i in range(8):
		await physics_frame
	if active_main.get("world").get("ready_for_player") != true:
		print("VISUAL_ABORT world_not_ready")
		quit(3)
		return
	var world: Node2D = active_main.get("world")
	var player: Node2D = active_main.get("player")
	var sequence: Node2D = SequenceScript.new()
	sequence.name = "NativeIntroCurtainSequence"
	if not sequence.configure(world, player, active_main.get_native_intro_curtain_view(), active_main.get("source_state")):
		print("VISUAL_ABORT sequence_configure")
		quit(4)
		return
	world.add_child(sequence)
	for i in range(30):
		await physics_frame
	print("VISUAL_BEGIN ", JSON.stringify(sequence.begin_native_intro()))
	await _shot("h0_curtain_closed")
	var finished: Dictionary = sequence.finish_native_guide()
	print("VISUAL_FINISH ", JSON.stringify({"spawned": finished.get("spawned"), "purge": finished.get("purge_candidates")}))
	var t0: int = Time.get_ticks_msec()
	for pair in [[120, "h1_opening_120ms"], [850, "h2_opened_850ms"], [2000, "h3_ring_2000ms"], [4800, "h4_ring_4800ms"]]:
		while Time.get_ticks_msec() - t0 < int(pair[0]):
			await process_frame
		await _shot(str(pair[1]))
		var camera: Camera2D = active_main.get("camera")
		var center: Vector2 = camera.get_screen_center_position()
		var ring: Array = []
		for enemy in world.get_enemies():
			if str(enemy.get("data")["id"]).begins_with("ch1_curtain_ring_"):
				var screen: Vector2 = enemy.global_position - center + Vector2(960, 540)
				ring.append([str(enemy.get("data")["id"]), int(screen.x), int(screen.y)])
		print("VISUAL_SNAP ", pair[1], " bonfire_t=", int(sequence.get_snapshot()["bonfire"]["t"]), " ring=", JSON.stringify(ring))
	print("VISUAL_DONE fps=", Engine.get_frames_per_second(), " snapshot=", JSON.stringify(sequence.get_snapshot()["metrics"]))
	if active_main.get_parent() != null:
		active_main.get_parent().remove_child(active_main)
	active_main.free()
	quit(0)

func _shot(name_tag: String) -> void:
	await RenderingServer.frame_post_draw
	var img: Image = root.get_viewport().get_texture().get_image()
	img.save_png("%s/%s.png" % [OUT, name_tag])
