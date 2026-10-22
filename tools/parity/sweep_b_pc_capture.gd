extends SceneTree
## SWEEP-B PC 나란히 캡처(2026-10-22). 엔진 내부 viewport 캡처만 쓴다. 제품 코드 수정 없음.
## 실행: godot --path godot --script res://../tools/parity/sweep_b_pc_capture.gd -- --out=<dir> --mode=<lobby|game|...>
const ALLOWED := ["EXODUSER-demo11-pc-sweep-b-Isolated-20261022"]
var out := ""
var src := ""
var mode := "lobby"
var logrows: Array = []
var main: Node

func _initialize() -> void: call_deferred("_run")
func L(k: String, v: Variant = null) -> void:
	logrows.append({"k": k, "v": v}); print("SWEEPB ", k, " ", JSON.stringify(v))
func secs(s: float) -> void:
	await create_timer(s, true, false, true).timeout
func shot(name: String) -> void:
	await RenderingServer.frame_post_draw
	var img: Image = root.get_texture().get_image()
	img.save_png(out.path_join(name + ".png"))
	L("shot", name)
func key(code: int, pressed: bool) -> void:
	var e := InputEventKey.new(); e.keycode = code; e.physical_keycode = code; e.pressed = pressed
	Input.parse_input_event(e)
func tap(code: int, hold: float = 0.12) -> void:
	key(code, true); await secs(hold); key(code, false)

func _run() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="): out = a.trim_prefix("--out=")
		elif a.begins_with("--source-root="): src = a.trim_prefix("--source-root=")
		elif a.begins_with("--mode="): mode = a.trim_prefix("--mode=")
	var ud := OS.get_user_data_dir().get_file()
	L("userdir", OS.get_user_data_dir())
	if not ALLOWED.has(ud) or out.is_empty() or DisplayServer.get_name() == "headless":
		L("refuse", {"ud": ud, "ds": DisplayServer.get_name()}); quit(2); return
	# 사용자 지시(2026-10-22): 창은 오른쪽 보조 모니터(5120,0)에만. 메인 모니터에 걸치면 옮긴다.
	# Godot 화면 좌표는 가장 왼쪽 모니터가 0이다(Windows 5120 = Godot 7040). 가장 오른쪽 화면에 둔다.
	var wp := DisplayServer.window_get_position()
	var right := 0
	for i in DisplayServer.get_screen_count():
		if DisplayServer.screen_get_position(i).x > DisplayServer.screen_get_position(right).x: right = i
	if wp.x < DisplayServer.screen_get_position(right).x: DisplayServer.window_set_position(DisplayServer.screen_get_position(right))
	L("window_rect", {"before": str(wp), "after": str(DisplayServer.window_get_position()), "size": str(DisplayServer.window_get_size())})
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920, 1080); root.content_scale_size = Vector2i(1920, 1080)
	wipe_store()
	match mode:
		"lobby": await run_lobby()
		"game": await run_game()
		"death": await run_death()
		"clear": await run_clear()
		"forge": await run_forge()
		"growth": await run_growth()
		_: L("unknown_mode", mode)
	var f := FileAccess.open(out.path_join("godot_log_%s.json" % mode), FileAccess.WRITE)
	f.store_string(JSON.stringify(logrows, "\t")); f.close()
	paused = false
	if is_instance_valid(current_scene): current_scene.queue_free()
	await secs(0.3)
	quit(0)

func _lobby() -> Node:
	set_meta("parity_lobby_cinematic_seen", true)
	var screen = load("res://scenes/demo_lobby.tscn").instantiate()
	screen.set_meta("native_lobby_entry_enabled", false)
	root.add_child(screen); current_scene = screen
	return screen

func run_lobby() -> void:
	var screen := _lobby()
	await secs(2.0); await shot("001_lobby")
	screen.language_select.select(1); screen.language_select.item_selected.emit(1); await secs(0.8); await shot("002_lobby_en")
	screen.language_select.select(0); screen.language_select.item_selected.emit(0); await secs(0.5)
	screen._show_quit(); await secs(0.6); await shot("003_quit")
	screen._close_modal(); await secs(0.3)
	screen._choose(0); await secs(1.0); await shot("010_character_t1s")
	await secs(2.5); await shot("011_character_t3_5s")
	screen._open_name(); await secs(0.8); await shot("020_name")
	screen._create(); await secs(0.6); await shot("021_name_empty")
	screen.name_input.text = "<>"; screen._create(); await secs(0.6); await shot("022_name_special")
	screen.name_input.text = "패리티"; screen._create.call_deferred() if false else null
	screen.creation_error.text = ""; screen._layout_name_error(); await secs(0.4); await shot("023_name_filled")
	screen._create(); await secs(0.5)
	# 웹과 같은 상태: 생성 후 다시 연 로비(선택 없음)
	screen.queue_free(); await secs(0.3)
	screen = _lobby(); await secs(2.0)
	await shot("004_lobby_saved")
	screen.cards[0].pressed.emit(); await secs(0.8); await shot("005_lobby_saved_selected")
	if screen.menu.ask_delete(0): screen._show_modal()
	await secs(0.6); await shot("006_delete_confirm")
	screen._close_modal(); await secs(0.3)
	L("lobby_snapshot", screen.get_snapshot())

func wait_main() -> Node:
	for i in 900:
		await process_frame
		if is_instance_valid(current_scene) and current_scene.has_method("request_native_lobby_entry"): return current_scene
		var lob = current_scene
		if is_instance_valid(lob) and lob.get("_movie") != null and is_instance_valid(lob._movie):
			lob._movie.finish()
	return null

func run_game() -> void:
	set_meta("parity_lobby_cinematic_seen", true)
	var screen = load("res://scenes/demo_lobby.tscn").instantiate()
	screen.set_meta("native_lobby_entry_enabled", true)
	screen.set_meta("native_audio_source_root", src); screen.set_meta("native_story_source_root", src)
	root.add_child(screen); current_scene = screen
	await secs(1.0)
	screen._choose(0); await secs(0.3); screen._open_name(); screen.name_input.text = "패리티"; screen._create()
	main = await wait_main()
	if not is_instance_valid(main): L("no_main", null); return
	for i in 6: await process_frame
	var story: Node = main.get("native_story_intro")
	await secs(1.5)
	if is_instance_valid(story) and story.phase == "playing":
		await shot("030_intro_first")
		story.finish("skip")
	await secs(0.2)
	var seq: Node = main.get("source_intro_sequence")
	if is_instance_valid(seq):
		await secs(1.3); await shot("0400_guide")
		for k in 3:
			var r: Dictionary = seq.advance_native_guide(); await secs(1.5); await shot("040%d_guide" % (k + 1)); L("guide_adv", r)
		seq.finish_native_guide()
	await secs(1.2); await shot("045_curtain_after")
	var deadline := Time.get_ticks_msec() + 9000
	while is_instance_valid(seq) and Time.get_ticks_msec() < deadline:
		if is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: break
		await process_frame
	await secs(1.5); await shot("0600_lesson")
	if is_instance_valid(seq) and is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: seq.lesson_flow.skip_all()
	await secs(3.0); await shot("050_hud")
	for pair in [[KEY_TAB, "070_inventory"], [KEY_K, "080_skill"], [KEY_J, "081_growth"], [KEY_G, "082_forge"], [KEY_ESCAPE, "090_settings"]]:
		await tap(pair[0]); await secs(1.5); await shot(pair[1])
		L("paused_" + pair[1], paused)
		await tap(pair[0] if pair[0] != KEY_ESCAPE else KEY_ESCAPE); await secs(0.8)
		if paused:
			await tap(KEY_ESCAPE); await secs(0.6)
		L("after_close_" + pair[1], paused)

## 격리 user dir(ALLOWED 확인 후)의 데모 저장소 파일만 비운다.
func wipe_store() -> void:
	var dir := OS.get_user_data_dir().path_join("demo_local_storage")
	var d := DirAccess.open(dir)
	if d == null: return
	var n := 0
	for f in d.get_files():
		if d.remove(f) == OK: n += 1
	L("wiped_store_files", n)

## 로비 생성→본편 진입→스토리·가이드·레슨 건너뛰기(사용자 경로와 같은 진입)
func enter_play() -> bool:
	set_meta("parity_lobby_cinematic_seen", true)
	var screen = load("res://scenes/demo_lobby.tscn").instantiate()
	screen.set_meta("native_lobby_entry_enabled", true)
	screen.set_meta("native_audio_source_root", src); screen.set_meta("native_story_source_root", src)
	root.add_child(screen); current_scene = screen
	await secs(1.0)
	screen._choose(0); await secs(0.3); screen._open_name(); screen.name_input.text = "패리티"; screen._create()
	main = await wait_main()
	if not is_instance_valid(main): L("no_main", null); return false
	await secs(1.0)
	var story: Node = main.get("native_story_intro")
	if is_instance_valid(story) and story.phase == "playing": story.finish("skip")
	await secs(0.5)
	var seq: Node = main.get("source_intro_sequence")
	if is_instance_valid(seq): seq.finish_native_guide()
	var deadline := Time.get_ticks_msec() + 9000
	while is_instance_valid(seq) and Time.get_ticks_msec() < deadline:
		if is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: break
		await process_frame
	await secs(0.5)
	if is_instance_valid(seq) and is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: seq.lesson_flow.skip_all()
	await secs(1.5)
	return true

func run_death() -> void:
	if not await enter_play(): return
	var pl: Node = main.player
	for k in 12:
		pl.iframes = 0.0
		pl.receive_damage(999999)
		await physics_frame
		if pl.hp <= 0: break
	L("death_hp", pl.hp)
	await secs(1.0); await shot("110_fallen_t1s")
	await secs(3.0); await shot("110_fallen_t4s")
	await secs(5.0); await shot("111_dead")
	await secs(4.0); await shot("111_dead_t13s")
	L("life", main.native_demo_life.snapshot() if is_instance_valid(main.get("native_demo_life")) else "absent")

func run_clear() -> void:
	if not await enter_play(): return
	paused = false
	main.native_demo_boss_defeated.emit(0)
	await secs(2.5); await shot("100_clear")
	var flow: Node = main.get("native_demo_end_flow")
	L("end_flow", flow.get_snapshot() if is_instance_valid(flow) else "absent")
	if is_instance_valid(flow) and flow.get_snapshot().phase == "clear":
		flow._view.buttons.next.pressed.emit(); await secs(1.5); await shot("101_demo_end")
		flow._view.buttons.lobby.pressed.emit()
		for i in 300:
			await process_frame
			if is_instance_valid(current_scene) and current_scene != main and current_scene.get_script() != null and str(current_scene.get_script().resource_path).ends_with("native_demo_lobby.gd"): break
		await secs(6.0); await shot("102_lobby_return")

func run_forge() -> void:
	if not await enter_play(): return
	await tap(KEY_G); await secs(1.5)
	var forge: Node = main.get("source_forge")
	L("forge_open", forge.get_snapshot() if is_instance_valid(forge) else "absent")
	for k in ["upgrade", "potion", "salvage", "reroll", "crystal", "craft"]:
		forge.choose_tab(k); await secs(0.9); await shot("083_forge_" + k)
	forge.choose_tab("upgrade"); await secs(0.3)
	await tap(KEY_G); await secs(0.5)
	L("forge_closed", {"paused": paused, "snap": forge.get_snapshot()})

func run_growth() -> void:
	if not await enter_play(): return
	await tap(KEY_J); await secs(1.5); await shot("081_growth")
	var gp: Node = main.get_node_or_null("NativeGrowthPanel")
	if is_instance_valid(gp):
		gp.select_node("pMagic"); await secs(0.8); await shot("081_growth_magic")
		gp.close_panel()
