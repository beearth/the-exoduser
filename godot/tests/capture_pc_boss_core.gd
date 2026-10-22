extends SceneTree
## PC-BOSS-CORE — 창 모드 보스전 구도 캡처 1장(줌 미리보기 ×2.5, 테스트 전용). 제품 카메라/스케일 수정 0.
## 실제 gate 입장 → 실제 입력으로 접근 → 보스가 공격 상태이고 거리 < 520 일 때 촬영. 보스 상태 주입 0.
const USERDIR := "EXODUSER-pc-boss-core-Isolated-20261022"
var main: Node
var out_dir := "G:/exoduser-wt/_out/pc-boss-core"

func _initialize() -> void:
	create_timer(240.0).timeout.connect(func(): print("PCBOSS_CAPTURE_WATCHDOG"); quit(2))
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _press(action: String, pressed: bool) -> void:
	var ev := InputEventAction.new()
	ev.action = action
	ev.pressed = pressed
	main.player.handle_native_input_event(ev)

func _run() -> void:
	if not OS.get_user_data_dir().ends_with(USERDIR): print("PCBOSS_CAPTURE isolation_fail"); quit(3); return
	var mult: float = float(_arg("zoom-preview", "2.5"))
	root.size = Vector2i(1920, 1080)
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	main.source_intro_sequence.finish_native_guide()
	main.source_state.read_current_g().on = true
	for i in range(65): await physics_frame
	main.source_intro_sequence.lesson_flow.skip_all()
	var pets: Node = main.world.get_node_or_null("NativePets")
	if pets and pets.get("_subtitle_root"): pets._subtitle_root.hide()
	var provider: Node2D = main.read_native_map11_provider()
	var g: Dictionary = main.source_state.read_current_g()
	g.on = true; g._fbDone = true; g.bossAlive = true
	for region in g._regions: region.cleared = true
	var regions: Node = main.get_node("NativeRegions")
	regions.set("_last_frame", -1.0); regions._physics_process(0)
	var entered: Dictionary = main.enter_native_demo_arena(provider, {"room": 0, "difficulty_index": 5, "stage_diff_offset": 0})
	print("PCBOSS_CAPTURE_ENTER ", entered.get("status"))
	var core: Node = main.native_demo_boss_core
	var actor: Node = main.native_demo_boss_actor
	var held := {}
	var shot := false
	var info := {}
	for t in range(900):
		main.player.iframes = maxf(main.player.iframes, 5.0) # 촬영 fixture: 플레이어 생존만
		var bp: Vector2 = core.body.global_position
		var to: Vector2 = bp - main.player.global_position
		var want := {"move_right": to.x > 60, "move_left": to.x < -60, "move_down": to.y > 60, "move_up": to.y < -60}
		var close: bool = to.length() < 260.0
		for k in want:
			var on: bool = want[k] and not close
			if held.get(k, false) != on:
				_press(k, on); held[k] = on
		await physics_frame
		var s: String = str(actor.snapshot().enemy.get("s", ""))
		if t > 240 and to.length() < 520.0 and (s.ends_with("Wind") or s in ["bossSlam", "bossSlash", "bossSweep", "bossSpin", "bossCharge", "bossShock"]):
			info = {"tick": t, "state": s, "distance": to.length(), "boss": [bp.x, bp.y], "player": [main.player.global_position.x, main.player.global_position.y]}
			shot = true
			break
	for k in held: if held[k]: _press(k, false)
	if not shot: info = {"tick": -1, "state": str(actor.snapshot().enemy.get("s", "")), "note": "attack_frame_not_reached"}
	main.get_tree().paused = true
	var cam: Camera2D = main.camera
	var base_zoom: float = cam.zoom.x
	var zoom: float = base_zoom * mult
	var center: Vector2 = main.player.global_position - Vector2(0, 110) / zoom
	root.canvas_transform = Transform2D(Vector2(zoom, 0), Vector2(0, zoom), Vector2(960, 540) - center * zoom)
	for i in range(3): await process_frame
	var img: Image = root.get_texture().get_image()
	var path: String = out_dir.path_join("capture_zoom%s_boss.png" % str(mult).replace(".", "_"))
	img.save_png(path)
	var bscreen: Vector2 = (core.body.global_position - center) * zoom + Vector2(960, 540)
	info.merge({"path": path, "base_zoom": base_zoom, "zoom": zoom, "boss_screen": [bscreen.x, bscreen.y], "boss_r_world": core.body.radius,
		"boss_in_frame": bscreen.x >= 0 and bscreen.x <= 1920 and bscreen.y >= 0 and bscreen.y <= 1080, "effective_scale": core.effective_scale})
	print("PCBOSS_CAPTURE ", JSON.stringify(info))
	main.get_tree().paused = false
	main.free()
	quit(0)
