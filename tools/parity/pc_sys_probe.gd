extends SceneTree
## PC-SYS 잔여 6건 관측 도구(2026-10-23). 제품 코드 수정 없음. 캡처는 엔진 내부 viewport만.
## 실행: godot --path godot --script res://../tools/parity/pc_sys_probe.gd -- --out=<dir> --mode=<clock|death|stats|potion|keycap|forge> [--source-root=<repo>]
const ALLOWED := ["EXODUSER-demo11-pc-sys-leftovers-Isolated-20261023"]
var out := ""
var src := ""
var mode := "clock"
var logrows: Array = []
var main: Node

func _initialize() -> void: call_deferred("_run")
func L(k: String, v: Variant = null) -> void:
	logrows.append({"k": k, "v": v, "ms": Time.get_ticks_msec()}); print("PCSYS ", k, " ", JSON.stringify(v))
func secs(s: float) -> void:
	await create_timer(s, true, false, true).timeout
func shot(name: String) -> void:
	if DisplayServer.get_name() == "headless": return
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
	if not ALLOWED.has(ud) or out.is_empty():
		L("refuse", {"ud": ud}); quit(2); return
	if DisplayServer.get_name() != "headless":
		var wp := DisplayServer.window_get_position()
		L("window_rect", {"pos": str(wp), "size": str(DisplayServer.window_get_size())})
		DisplayServer.window_set_mouse_passthrough(PackedVector2Array([Vector2(0, 0), Vector2(1, 0), Vector2(1, 1), Vector2(0, 1)]))
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920, 1080); root.content_scale_size = Vector2i(1920, 1080)
	wipe_store()
	match mode:
		"clock": await run_clock()
		"death": await run_death()
		"stats": await run_stats()
		"potion": await run_potion()
		"keycap": await run_keycap()
		"forge": await run_forge()
		_: L("unknown_mode", mode)
	var f := FileAccess.open(out.path_join("pcsys_log_%s.json" % mode), FileAccess.WRITE)
	f.store_string(JSON.stringify(logrows, "\t")); f.close()
	paused = false
	if is_instance_valid(current_scene): current_scene.queue_free()
	await secs(0.3)
	quit(0)

func wait_main() -> Node:
	for i in 900:
		await process_frame
		if is_instance_valid(current_scene) and current_scene.has_method("request_native_lobby_entry"): return current_scene
		var lob = current_scene
		if is_instance_valid(lob) and lob.get("_movie") != null and is_instance_valid(lob._movie):
			lob._movie.finish()
	return null

func wipe_store() -> void:
	var dir := OS.get_user_data_dir().path_join("demo_local_storage")
	var d := DirAccess.open(dir)
	if d == null: return
	var n := 0
	for f in d.get_files():
		if d.remove(f) == OK: n += 1
	L("wiped_store_files", n)

func g() -> Dictionary: return main.source_state.read_current_g()
func p() -> Dictionary: return main.source_state.read_current_p()

func clock_state() -> Dictionary:
	var sv: Variant = main.get("source_initialization_services")
	var last: Variant = sv.get("_source_update_last_result") if is_instance_valid(sv) else null
	var seq: Node = main.get("source_intro_sequence")
	var lf: Variant = seq.lesson_flow if is_instance_valid(seq) else null
	return {"stageTime": g().get("stageTime"), "playTime": g().get("playTime"), "on": g().get("on"), "paused": g().get("paused"),
		"_intro": g().get("_intro"), "tree_paused": paused,
		"lesson": {"active": lf.active, "seen": lf.seen, "phase": lf.phase} if is_instance_valid(lf) else null,
		"update_status": last.get("status") if last is Dictionary else null,
		"update_last": (last.get("last") as Dictionary).duplicate() if last is Dictionary and last.get("last") is Dictionary else null,
		"next_phase": (last.get("update_state") as Dictionary).get("next_phase") if last is Dictionary and last.get("update_state") is Dictionary else null}

## 로비 생성→본편 진입→스토리·가이드(사용자 경로와 같은 진입). stop_at_lesson이면 레슨 활성까지.
func enter_play(stop_at_lesson: bool = false) -> bool:
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
	L("lesson_ready", clock_state())
	if stop_at_lesson: return true
	if is_instance_valid(seq) and is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: seq.lesson_flow.skip_all()
	L("lesson_skipped", clock_state())
	await secs(1.5)
	return true

func run_clock() -> void:
	if not await enter_play(): return
	for i in 4:
		await secs(1.0)
		L("clock_t%d" % (i + 1), clock_state())
	var hud: Node = main.get("hud")
	if is_instance_valid(hud):
		var lbl: Variant = hud.get("_stage_timer_label")
		L("hud_timer", lbl.text if lbl is Label else "?")
	await shot("clock_after_skip_t5s")

func run_death() -> void:
	if not await enter_play(): return
	var life: Node = main.get("native_demo_life")
	var pl: Node = main.player
	var t0 := 0
	for k in 12:
		pl.iframes = 0.0
		pl.receive_damage(999999)
		await physics_frame
		if pl.hp <= 0: t0 = Time.get_ticks_msec(); break
	L("death_hp", {"hp": pl.hp, "bracelet": main.source_state.read_current_inv().get("equipped", {}).get("bracelet", {}) if main.source_state.has_method("read_current_inv") else "?"})
	var seen_fallen := -1
	var seen_dead := -1
	var last_sec := -1
	var shot_1s := false
	while Time.get_ticks_msec() - t0 < 15000:
		await physics_frame
		if not shot_1s and Time.get_ticks_msec() - t0 >= 1000:
			shot_1s = true; await shot("fallen_t1s")
		var ph: String = str(main.read_native_player_life_phase().get("phase"))
		if ph == "fallen" and seen_fallen < 0: seen_fallen = Time.get_ticks_msec() - t0
		if is_instance_valid(life) and life.get("_fallen_second") != last_sec:
			last_sec = life.get("_fallen_second"); L("fallen_sec", {"sec": last_sec, "ms": Time.get_ticks_msec() - t0, "power": life._fallen_power.text})
		if ph == "dead" and seen_dead < 0:
			seen_dead = Time.get_ticks_msec() - t0
			break
	L("death_timing", {"fallen_ms": seen_fallen, "dead_ms": seen_dead, "roll": life.roll if is_instance_valid(life) else null})
	await secs(3.0); await shot("dead_t3s_after")

func run_stats() -> void:
	if not await enter_play(): return
	L("sStats_start", g().get("_sStats"))
	var x0: Vector2 = main.player.global_position
	key(KEY_D, true); await secs(2.0); key(KEY_D, false); await secs(0.3)
	L("sStats_walk2s", {"ss": g().get("_sStats"), "moved": main.player.global_position.distance_to(x0)})
	main.player.iframes = 0.0
	main.player.receive_damage(40)
	await physics_frame
	L("sStats_hit40", {"ss": g().get("_sStats"), "hp": main.player.hp})
	# 가장 가까운 적에게 실제 근접 공격(좌클릭) 몇 번
	var target: Node2D = null
	var best := 1e9
	for e in main.world.get_enemies():
		if is_instance_valid(e) and e.alive and e.global_position.distance_to(main.player.global_position) < best:
			best = e.global_position.distance_to(main.player.global_position); target = e
	if is_instance_valid(target):
		main.player.global_position = target.global_position + Vector2(-40, 0)
		await secs(0.3)
		for i in 6:
			var m := InputEventMouseButton.new(); m.button_index = MOUSE_BUTTON_LEFT; m.pressed = true; m.position = Vector2(1000, 540)
			Input.parse_input_event(m); await secs(0.12)
			var u := InputEventMouseButton.new(); u.button_index = MOUSE_BUTTON_LEFT; u.pressed = false; u.position = Vector2(1000, 540)
			Input.parse_input_event(u); await secs(0.35)
	L("sStats_attack", {"ss": g().get("_sStats"), "target": str(target)})

func run_potion() -> void:
	if not await enter_play(): return
	L("potions", {"POT": p().get("potions"), "qslots": g().get("QSLOTS")})
	await shot("potion_hud")

func run_keycap() -> void:
	if not await enter_play(): return
	await shot("keycap_kb")

func run_forge() -> void:
	if not await enter_play(): return
	await tap(KEY_G); await secs(1.5)
	var forge: Node = main.get("source_forge")
	var w: Dictionary = main.source_state.read_current_inventory().equipped.weapon
	# 웹 관측과 같은 고정 조건: 악의 1000(새 게임 기본 — 격리 폴더 공유 악의가 남아 있을 수 있음), 무기 +0
	g().mats = 1000; w.enh = 0
	forge._ai_slot = "weapon"; forge._ai_target = -1; forge._refresh(); await secs(0.6)
	L("ai_before", {"mats": g().mats, "enh": w.get("enh", 0), "target": forge._ai_target, "rarity": w.get("rarity")})
	await shot("forge_ai_before")
	var txt0: int = int(main.world.get_native_text_snapshot().get("emitted", 0)) if main.world.get_native_text_snapshot() is Dictionary else 0
	L("ai_press_1", forge._do_ai_enhance())
	L("ai_after_1", {"mats": g().mats, "enh": w.get("enh", 0), "target": forge._ai_target, "text": main.world.get_native_text_snapshot()})
	await secs(0.3); await shot("forge_ai_after")
	g().mats = 200000; forge._ai_target = 3; forge._refresh(); await secs(0.3)
	L("ai_press_rich", forge._do_ai_enhance())
	L("ai_after_rich", {"mats": g().mats, "enh": w.get("enh", 0), "target": forge._ai_target, "shake": g().get("shake"), "text": main.world.get_native_text_snapshot()})
	await secs(0.3); await shot("forge_ai_rich_after")
