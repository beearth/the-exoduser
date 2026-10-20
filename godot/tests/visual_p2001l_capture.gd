extends SceneTree
## P2-001l 시각 검수 — step 8 가시덫(실시전) + step 0(패링 적·차징 링·암흑탄·반사) + step 1 정지.
## 웹 같은 단계 샷(_out/p2-001l/web/w_step0_*.png)과 1x 크롭 대조용.
const USERDIR = "EXODUSER-P2001L-Isolated-20261020"
const OUT = "G:/exoduser-wt/_out/p2-001l/godot"

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
	flow.begin_practice()
	var player: Node2D = main.get("player")
	# 기본 3스텝 고속 통과(실크레딧 경로)
	for i in range(90):
		player.set("velocity", Vector2(150, 0))
		player.global_position += Vector2(1.8, 0)
		await process_frame
		if int(flow.get("step")) != -3 or flow.get("pending") != "":
			break
	deadline = Time.get_ticks_msec() + 6000
	while Time.get_ticks_msec() < deadline and int(flow.get("step")) == -3:
		await process_frame
	for target_step in [-2, -1]:
		var guard := 0
		while int(flow.get("step")) == target_step and guard < 60:
			guard += 1
			var enemy: Node2D = _lesson_enemy(flow)
			if enemy == null:
				await process_frame
				continue
			if target_step == -2:
				var full: bool = int(flow.get("left_kills")) == 9 and not flow.get("left_full_charge_kill")
				flow.native_lesson_hurt_enemy(enemy, 50, 0.0, {"_lessonAttack": "kiSlash", "_lessonFullCharge": full, "_kiFull": full})
			else:
				flow.native_lesson_hurt_enemy(enemy, 50, 0.0, {"magic": true, "fireball": true})
			await process_frame
		deadline = Time.get_ticks_msec() + 6000
		while Time.get_ticks_msec() < deadline and int(flow.get("step")) == target_step:
			await process_frame
	# step 8 가시덫 — 실제 키1 시전·탈출·DOT 처치 (261~296)
	deadline = Time.get_ticks_msec() + 8000
	while Time.get_ticks_msec() < deadline and (flow.get("trap_enemies") as Array).size() < 10:
		await process_frame
	_send_action("skill_slot_1", true)
	_send_action("skill_slot_1", false)
	deadline = Time.get_ticks_msec() + 5000
	while Time.get_ticks_msec() < deadline and flow.get("trap_zone") == null:
		await process_frame
	await _wall(500)
	await _shot("g_step8_trap")
	_send_action("move_left", true)
	for i in range(120):
		player.global_position += Vector2(-2.0, 0)
		await process_frame
		if flow.get("trap_escaped") == true:
			break
	_send_action("move_left", false)
	deadline = Time.get_ticks_msec() + 60000
	while Time.get_ticks_msec() < deadline and int(flow.get("step")) == 8:
		if flow.get("trap_zone") == null:
			_send_action("skill_slot_1", true)
			_send_action("skill_slot_1", false)
		await process_frame
	# step 0: 차징 링 중간 지점 캡처
	deadline = Time.get_ticks_msec() + 10000
	while Time.get_ticks_msec() < deadline and not (float(flow.get("parry_charge")) > 10.0 and float(flow.get("parry_charge")) < 45.0):
		await process_frame
	await _shot("g_step0_charge")
	# 암흑탄 비행 캡처(발사 직후 수십 px 진행 시점)
	deadline = Time.get_ticks_msec() + 10000
	while Time.get_ticks_msec() < deadline and not is_instance_valid(flow.get("parry_shot")):
		await process_frame
	await _wall(350)
	await _shot("g_step0_shot")
	# 실패해도 재장전되므로 반사 캡처는 탄 근접 시 실 parry 입력 반복
	deadline = Time.get_ticks_msec() + 60000
	while Time.get_ticks_msec() < deadline and int(flow.get("step")) == 0:
		var current_shot: Variant = flow.get("parry_shot")
		if is_instance_valid(current_shot) and flow.get("shot_reflected") != true:
			if (current_shot as Node2D).global_position.distance_to(player.global_position) < 90.0:
				_send_parry(true)
				for i in range(2):
					await process_frame
				await _shot("g_step0_reflected_window")
				for i in range(4):
					await process_frame
				_send_parry(false)
				for i in range(3):
					await process_frame
				continue
		await process_frame
	await _wall(300)
	await _shot("g_step1_halt")
	print("VISUAL_STATE ", JSON.stringify({"step": flow.get("step"), "halted": flow.get("practice_halted"),
		"checks": flow.get("checks"), "trap_kills": flow.get("trap_kills"),
		"spike_trap_done": flow.get("spike_trap_done"), "reflected_seen": flow.get("shot_reflected")}))
	print("VISUAL_DONE fps=", Engine.get_frames_per_second())
	main.get_parent().remove_child(main)
	main.free()
	quit(0)

func _send_parry(pressed: bool) -> void:
	_send_action("parry", pressed)

func _send_action(action: String, pressed: bool) -> void:
	var event := InputEventAction.new()
	event.action = action
	event.pressed = pressed
	Input.parse_input_event(event)

func _lesson_enemy(flow: Node) -> Node2D:
	for enemy in flow.get("attack_enemies"):
		if is_instance_valid(enemy) and enemy.get("alive") == true:
			return enemy
	return null

func _wall(ms: int) -> void:
	var t0: int = Time.get_ticks_msec()
	while Time.get_ticks_msec() - t0 < ms:
		await process_frame

func _shot(name_tag: String) -> void:
	await RenderingServer.frame_post_draw
	var img: Image = root.get_viewport().get_texture().get_image()
	img.save_png("%s/%s.png" % [OUT, name_tag])
