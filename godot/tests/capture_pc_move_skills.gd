extends SceneTree
## PC-MOVE-SKILLS (2026-10-22) — 웹과 나란히 비교할 Godot 이동 스킬 캡처(창 모드 1920×1080, 제품 코드 수정 0).
## 실행: Godot(창) --audio-driver Dummy --resolution 1920x1080 --position 0,0 --script res://tests/capture_pc_move_skills.gd -- --out=<dir>
## 웹 캡처(_out/pc-move-skills-v2/scripts/web_move_capture.cjs)와 같은 순서·같은 프레임 번호:
##   웹은 테스트베드 프레임 정지(_btFramePause/_btFrameStep)로 1틱씩, 여기는 SceneTree.paused를 물리 프레임 경계에서
##   1틱만 풀어 같은 틱 수를 진행한다. 캡처 전용 개입: 열린 바닥 배치·적 치우기·게이지/자원 충전·조준 포인터 결합·
##   플레이어 물리 보간 끔(정지 프레임에서 보간 중간 위치가 찍히지 않게).
const USERDIR := "EXODUSER-pc-move-skills-Isolated-20261022"
var main: Node
var player: Node2D
var ms: Node
var out := ""
var rows: Array = []
var aim := Vector2.ZERO
var origin := Vector2.ZERO

func _initialize() -> void:
	create_timer(600).timeout.connect(func(): print("PMSCAP_WATCHDOG"); quit(2))
	call_deferred("_run")

func L(k: String, v: Variant = null) -> void:
	rows.append({"k": k, "v": v})
	print("PMSCAP ", k, " ", JSON.stringify(v))

func secs(s: float) -> void:
	await create_timer(s, true, false, true).timeout

func shot(name: String) -> void:
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(out.path_join(name + ".png"))
	var cam: Camera2D = root.get_camera_2d()
	var scr: Vector2 = player.get_global_transform_with_canvas().origin
	L("shot", {"name": name, "screen": [scr.x, scr.y], "zoom": cam.zoom.x if cam != null else 1.0})

func _pointer() -> Dictionary:
	return {"ready": true, "world": aim}

func key(code: int, pressed: bool) -> void:
	var e := InputEventKey.new(); e.physical_keycode = code; e.keycode = code; e.pressed = pressed
	if code == KEY_SHIFT: e.location = KEY_LOCATION_LEFT
	var was: bool = paused
	paused = false
	player.handle_native_input_event(e)
	paused = was

## 정확히 1 물리 틱 진행 후 다음 틱 시작에서 정지
func step(n := 1) -> void:
	# world 원본 시계(_native_frame)가 정확히 n 증가한 뒤의 틱 시작에서 정지
	var target: float = main.world.get_native_frame() + float(n)
	paused = false
	while true:
		await physics_frame
		if main.world.get_native_frame() >= target:
			paused = true
			break
	# 정지 중에는 _process가 돌지 않으므로 웹의 정지 프레임 rAF draw 1회와 같은 렌더 갱신을 한 번 직접 수행
	player._update_display()
	ms.sync_render()

func state(tag: String) -> Dictionary:
	var s: Dictionary = ms.get_snapshot()
	var r := {"tag": tag, "x": player.global_position.x - origin.x, "y": player.global_position.y - origin.y, "s": str(player.state),
		"ifr": float(player.iframes), "g": s.gauge, "hold": s.dash_hold, "holdF": s.dash_hold_f, "tier": s.dash_tier, "harp": s.harp_active,
		"dash": s.dash_active, "hd": s.harp_dist, "hm": s.harp_max_dist, "dl": s.dash_left, "bd": s.bd_move_t, "ph": s.dash_phase,
		"land": s.harp_land_t, "frame": main.world.get_native_frame()}
	return r

func place() -> void:
	main.source_state.apply_native_stage_entry_refill(main)
	player.state = "idle"
	player.iframes = 0.0
	player.global_position = origin
	player.velocity = Vector2.ZERO
	ms.harp_gauge = ms.harp_gauge_max
	for e in main.world.get_enemies():
		if is_instance_valid(e) and e is Node2D and (e as Node2D).global_position.distance_to(origin) < 1600.0:
			(e as Node2D).global_position = origin + Vector2(5000, 5000)

func _open(c: Vector2, radius: float) -> bool:
	if not main.world.can_move(c, 15.0): return false
	for k in range(24):
		var dir := Vector2.from_angle(TAU * k / 24.0)
		var d := 16.0
		while d <= radius:
			if not main.world.can_move(c + dir * d, 15.0): return false
			d += 32.0
	return true

func _run() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="): out = a.trim_prefix("--out=")
	if not OS.get_user_data_dir().ends_with(USERDIR) or out.is_empty() or DisplayServer.get_name() == "headless":
		print("PMSCAP refuse"); quit(3); return
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920, 1080)
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	for i in 10: await process_frame
	player = main.player
	ms = main.get("native_move_skills")
	var seq: Node = main.get("source_intro_sequence")
	if is_instance_valid(seq): seq.finish_native_guide()
	for i in 300:
		await physics_frame
		if is_instance_valid(seq) and is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active:
			seq.lesson_flow.skip_all(); break
	await secs(1.0)
	L("ground_pointer_bound_by_product", player.get("_native_ground_pointer_bound"))
	if player.get("_native_ground_pointer_bound") != true:
		player.bind_native_ground_pointer(Callable(self, "_pointer"))
	player.physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_OFF
	# 웹과 같은 상대 위치: 스폰에서 북쪽 800px(웹 4020,6620 = 스폰+0,−800)이 열려 있으면 그곳, 아니면 가장 가까운 열린 바닥
	var spawn: Vector2 = player.global_position
	origin = spawn + Vector2(0, -800)
	if not _open(origin, 820.0):
		var found := false
		for ring in range(0, 30):
			for k in range(12):
				var cand: Vector2 = spawn + Vector2.from_angle(TAU * k / 12.0) * (ring * 160.0)
				if _open(cand, 820.0): origin = cand; found = true; break
			if found: break
	L("spawn_origin", {"spawn": [spawn.x, spawn.y], "origin": [origin.x, origin.y], "spawn_plus_0_-800_open": origin == spawn + Vector2(0, -800)})
	place(); await secs(1.2); place(); await secs(0.6)
	aim = origin + Vector2(400, 0)
	# ── A. Shift 1단 ──
	paused = true
	await process_frame
	var A: Array = []
	A.append(state("A_before")); await shot("A00_before")
	key(KEY_SHIFT, true)
	await step(); A.append(state("A_hold1")); await shot("A01_hold_tier1")
	await step(); A.append(state("A_hold2"))
	key(KEY_SHIFT, false); A.append(state("A_release"))
	for f in 16:
		await step(); A.append(state("A_f%d" % f))
		if f == 1: await shot("A02_flight")
		if f == 5: await shot("A03_stick_pull_start")
		if f == 7: await shot("A04_pull_mid")
		if f == 10: await shot("A05_landing")
		if f == 13: await shot("A06_after_landing")
	L("A", A)
	# ── B. 2단 홀드 UI ──
	paused = false
	place(); await secs(0.8); place(); paused = true; await process_frame
	var B: Array = []
	key(KEY_SHIFT, true)
	for f in 8:
		await step(); B.append(state("B_hold%d" % f))
		if f == 7: await shot("B01_hold_tier2_ui")
	key(KEY_SHIFT, false)
	for f in 22:
		await step(); B.append(state("B_f%d" % f))
		if f == 4: await shot("B02_tier2_flight")
	L("B", B)
	# ── C. 방향(A)+Space 전격이동 ──
	paused = false
	place(); await secs(0.8); place(); paused = true; await process_frame
	var C: Array = []
	C.append(state("C_before")); await shot("C00_before")
	key(KEY_A, true); key(KEY_SPACE, true)
	C.append(state("C_keys"))
	await step(); C.append(state("C_f0")); await shot("C01_dash_start")
	key(KEY_SPACE, false); key(KEY_A, false)
	for f in range(1, 14):
		await step(); C.append(state("C_f%d" % f))
		if f == 2: await shot("C02_dash_mid")
		if f == 5: await shot("C03_dash_land")
		if f == 9: await shot("C04_after")
	L("C", C)
	paused = false
	var fh := FileAccess.open(out.path_join("godot_capture_log.json"), FileAccess.WRITE)
	fh.store_string(JSON.stringify(rows, "\t")); fh.close()
	if is_instance_valid(main):
		main.get_parent().remove_child(main)
		main.free()
	await process_frame
	quit(0)
