extends SceneTree
## P2-007a 시각 검수 — 실제 Main 부팅(인트로 경로) 렌더 캡처. headless 금지(실 렌더 필요: Linux는 xvfb-run).
## 캡처: 키 가이드 1·2·3·4컷, Tab 포커스+Space 홀드, 커튼 오픈 후 HUD(폰트), 레슨 패널, 펫 자막,
## 기검참 1·3타(2D) + 원근 뷰 장착 후 기검참. 판정은 PNG를 1x로 눈으로(가짜 판정 금지).
## 실행: xvfb-run -s "-screen 0 1920x1080x24" godot --path . --script res://tests/visual_p2007a_capture.gd -- --out=<폴더>
const USERDIR = "EXODUSER-P2007A-Isolated-20261020"

var active_main: Node
var out_dir := "user://p2007a_capture"
var shots: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _shot(file_name: String) -> void:
	await RenderingServer.frame_post_draw
	var img: Image = root.get_viewport().get_texture().get_image()
	var path := "%s/%s.png" % [out_dir, file_name]
	img.save_png(path)
	shots.append({"name": file_name, "size": [img.get_width(), img.get_height()]})
	print("VISUAL_SHOT ", file_name, " ", img.get_width(), "x", img.get_height())

func _wait_ms(ms: int) -> void:
	var until := Time.get_ticks_msec() + ms
	while Time.get_ticks_msec() < until:
		await process_frame

func _press(keycode: Key, pressed: bool = true) -> void:
	var key := InputEventKey.new()
	key.keycode = keycode
	key.physical_keycode = keycode
	key.pressed = pressed
	Input.parse_input_event(key)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		print("VISUAL_ABORT not_isolated")
		quit(2)
		return
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="):
			out_dir = arg.substr(6)
	DirAccess.make_dir_recursive_absolute(out_dir)
	print("VISUAL_RENDERER ", RenderingServer.get_video_adapter_name(), " / ", RenderingServer.get_video_adapter_vendor(), " / ", DisplayServer.get_name())
	var packed: PackedScene = load("res://scenes/main.tscn")
	active_main = packed.instantiate()
	active_main.set_meta("native_intro_boot", "intro")
	root.add_child(active_main)
	for i in range(12):
		await physics_frame
	var sequence: Node = active_main.get("source_intro_sequence")
	await _wait_ms(700) # 페이드 .4s 완료 + 스로틀
	await _shot("guide_step1")
	for index in range(1, 4):
		await _wait_ms(300)
		sequence.advance_native_guide()
		await _wait_ms(450)
		await _shot("guide_step%d" % (index + 1))
	# Tab → 건너뛰기 포커스, Space 1초 홀드(진행 50%) — 4컷에서 Space는 진행(=시작)이므로 홀드 캡처는 Tab 포커스 상태에서
	_press(KEY_TAB)
	_press(KEY_TAB, false)
	await _wait_ms(120)
	await _shot("guide_step4_tab_skip_focus")
	var panel: Control = sequence.get("guide_panel")
	panel.set_skip_hold(0.5) # 63390 Space 1초(50%) 홀드 표시 — 실제 키 홀드 경로는 test_p2007a가 검증
	await _wait_ms(60)
	await _shot("guide_step4_space_hold_50")
	panel.set_skip_hold(-1.0)
	print("VISUAL_GUIDE ", JSON.stringify(sequence.get_snapshot().get("guide_panel", {}).get("layout", {})))
	print("VISUAL_GUIDE_FONTS ", JSON.stringify(sequence.get_snapshot().get("guide_panel", {}).get("fonts", {})))
	print("VISUAL_GUIDE_VOICE ", sequence.get_snapshot().get("guide_panel", {}).get("voice"))
	sequence.finish_native_guide()
	await _wait_ms(1300)
	await _shot("hud_after_open")
	# 레슨 패널 — 커튼 이후 자동 시작 대기(최대 6초)
	var flow: Node = sequence.get("lesson_flow")
	var waited := 0
	while waited < 6000 and is_instance_valid(flow) and not is_instance_valid(flow.get("_panel")):
		await _wait_ms(200)
		waited += 200
	var lesson_layer: CanvasLayer = flow.get("_panel") if is_instance_valid(flow) else null
	if is_instance_valid(lesson_layer):
		await _wait_ms(400)
		await _shot("lesson_panel")
	else:
		print("VISUAL_NOTE lesson_panel_not_started_in_6s")
	# 펫 자막(표시 전용 직접 호출 — 문구는 원본 대사 테이블 값). 레슨 배경막에 가리지 않게 레슨 층만 잠시 숨김.
	var pets: Node = active_main.get("world").get_node_or_null("NativePets")
	if pets != null and pets.has_method("_show_bubble"):
		if is_instance_valid(lesson_layer):
			lesson_layer.visible = false
		pets._show_bubble("crow", "…절반이다. 정신차려.") # native_pets 356 원본 대사
		await _wait_ms(100)
		await _shot("pet_subtitle_crow")
		pets._show_bubble("cat", "1번! 가시덫으로 적 묶어!")
		await _wait_ms(100)
		await _shot("pet_subtitle_cat")
		if is_instance_valid(lesson_layer):
			lesson_layer.visible = true
	# 기검참 — 실제 crescent_requested 신호 → main 디스패치(원본 경로)
	var player: Node2D = active_main.get("player")
	for spec in [[1, 0.0, "ki_slash_step1"], [3, 120.0, "ki_slash_step3_full"]]:
		player.emit_signal("crescent_requested", spec[0], spec[1], Vector2.RIGHT)
		for i in range(5):
			await physics_frame
		await _shot(spec[2])
		await _wait_ms(700)
	if active_main.has_method("mount_native_perspective_view"):
		var mounted: Dictionary = active_main.mount_native_perspective_view()
		print("VISUAL_PERSPECTIVE ", JSON.stringify(mounted.get("ready")))
		await _wait_ms(400)
		player.emit_signal("crescent_requested", 3, 120.0, Vector2.RIGHT)
		for i in range(5):
			await physics_frame
		await _shot("ki_slash_step3_perspective")
	print("VISUAL_DONE ", JSON.stringify(shots))
	quit(0)
