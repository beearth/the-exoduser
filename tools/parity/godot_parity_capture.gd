extends SceneTree
## 웹↔Godot 동일성 검수용 렌더 캡처 (임시, 2026-10-22). 제품 코드 수정 없음.
## --mode=lobby : demo_lobby → 새 게임 → 캐릭터 → 스토리 인트로 → 가이드 → 필드 → UI → 전투 → 이동 → 필드보스 → 보스방 → 클리어 → 로비 복귀
## --mode=direct: main.tscn 직접(사용자 실행 경로와 같음) → 가이드 → 필드 → 사망
const ALLOWED := ["EXODUSER-parity-capture-Isolated-20261022", "EXODUSER-demo11-parity-capture-Isolated-20261022"]
var out := ""
var src := ""
var mode := "lobby"
var logrows: Array = []
var main: Node

func _initialize() -> void: call_deferred("_run")
func L(k: String, v: Variant = null) -> void:
	logrows.append({"k": k, "v": v}); print("PARITY ", k, " ", JSON.stringify(v))
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
func pos() -> Vector2:
	return main.player.global_position if is_instance_valid(main) and is_instance_valid(main.player) else Vector2.ZERO
func god() -> void:
	if is_instance_valid(main) and is_instance_valid(main.player):
		main.player.iframes = 9999.0

func _run() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="): out = a.trim_prefix("--out=")
		elif a.begins_with("--source-root="): src = a.trim_prefix("--source-root=")
		elif a.begins_with("--mode="): mode = a.trim_prefix("--mode=")
	var ud := OS.get_user_data_dir().get_file()
	L("userdir", OS.get_user_data_dir())
	if not ALLOWED.has(ud) or out.is_empty() or DisplayServer.get_name() == "headless":
		L("refuse", {"ud": ud, "ds": DisplayServer.get_name()}); quit(2); return
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920, 1080); root.content_scale_size = Vector2i(1920, 1080)
	if mode == "lobby": await run_lobby()
	elif mode == "boss": await run_boss()
	else: await run_direct()
	var f := FileAccess.open(out.path_join("godot_log_%s.json" % mode), FileAccess.WRITE)
	f.store_string(JSON.stringify(logrows, "\t")); f.close()
	paused = false
	if is_instance_valid(current_scene): current_scene.queue_free()
	await secs(0.3)
	quit(0)

func wait_main() -> Node:
	for i in 400:
		await process_frame
		if is_instance_valid(current_scene) and current_scene.has_method("request_native_lobby_entry"): return current_scene
	return null

func run_lobby() -> void:
	var screen = load("res://scenes/demo_lobby.tscn").instantiate()
	screen.set_meta("native_lobby_entry_enabled", true)
	screen.set_meta("native_audio_source_root", src); screen.set_meta("native_story_source_root", src)
	root.add_child(screen); current_scene = screen
	await secs(2.0); await shot("01_lobby_first")
	L("lobby_status", str(screen.status.text) if "status" in screen and is_instance_valid(screen.status) else "")
	screen.cards[0].pressed.emit(); await secs(1.0); await shot("02a_charselect_form")
	screen.character_buttons[0].pressed.emit(); screen.name_input.text = "패리티"; await secs(0.6); await shot("02b_charselect_named")
	screen._create()
	main = await wait_main()
	if not is_instance_valid(main):
		L("lobby_entry_failed", "no Main; fallback main.tscn + native_story_boot")
		await shot("02c_lobby_entry_failed")
		main = load("res://scenes/main.tscn").instantiate()
		main.set_meta("native_story_boot", true); main.set_meta("native_story_source_root", src); main.set_meta("native_audio_source_root", src)
		root.add_child(main); current_scene = main
	root.mode = Window.MODE_WINDOWED
	for i in 6: await process_frame
	await story_capture()
	await guide_capture()
	await field_capture()
	await ui_capture()
	await combat_capture()
	await movement_capture()
	await fieldboss_capture()
	await boss_capture()
	await clear_capture()

func story_capture() -> void:
	var story: Node = main.get("native_story_intro")
	if not is_instance_valid(story) or story.phase != "playing":
		L("story", "absent"); return
	story.set_process(false)
	var last_asset := "#"
	var n := 0
	for s in story.segments.size():
		if story.phase != "playing": break
		var cues: Array = story.segments[s].cues
		for i in cues.size():
			if story.segment != s: break
			var cue: Dictionary = cues[i]
			var target: float = float(cue.t) + min(float(cue.dur) * 0.5, 1200.0)
			var delta: float = target - story.elapsed_ms
			if delta > 0: story.advance(delta)
			if story.segment != s or story.phase != "playing": break
			var asset: String = str(cue.get("asset", ""))
			if asset != last_asset or i == 0:
				last_asset = asset
				await shot("03c_s%d_c%02d_%s" % [s, i, asset.get_file().get_basename() if asset != "" else "noimg"])
				n += 1
				# 전환 직전/직후 1쌍 (컷 전환 방식 확인용, 첫 세그먼트 2번째 컷)
				if s == 0 and i == 1:
					var nxt: float = float(cues[i + 1].t) - story.elapsed_ms
					story.advance(nxt - 20); await shot("03c_s0_trans_before")
					story.advance(40); await shot("03c_s0_trans_after")
		if story.phase == "playing" and story.segment == s:
			story.advance(float(story.segments[s].duration) - story.elapsed_ms + 1)
	L("story_shots", n)
	if story.phase == "playing": story.finish("skip")

func guide_capture() -> void:
	await secs(0.2)
	var seq: Node = main.get("source_intro_sequence")
	if not is_instance_valid(seq): L("guide", "absent"); return
	await secs(0.9); await shot("03d_guide_0")
	for k in 3:
		var r: Dictionary = seq.advance_native_guide(); await secs(0.7); await shot("03d_guide_%d" % (k + 1)); L("guide_adv", r)
	seq.finish_native_guide()
	await secs(0.35); await shot("03e_curtain_mid")
	await secs(1.2); await shot("03e_curtain_after")

func field_capture() -> void:
	var seq: Node = main.get("source_intro_sequence")
	var deadline := Time.get_ticks_msec() + 7000
	while is_instance_valid(seq) and Time.get_ticks_msec() < deadline:
		if is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: break
		await process_frame
	await secs(1.5); await shot("04a_field_first_with_lesson")
	if is_instance_valid(seq) and is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: seq.lesson_flow.skip_all()
	await secs(1.5); god(); await shot("04c_field_clean")
	var cam: Camera2D = root.get_camera_2d()
	L("field_state", {"player": str(pos()), "cam_zoom": str(cam.zoom) if cam else "none", "cam_offset": str(cam.offset) if cam else "", "player_scale": str(main.player.scale), "map11": is_instance_valid(main.get("native_map11")), "enemies": main.world.get_enemies().size()})
	key(KEY_W, true); await secs(1.8); key(KEY_W, false)
	await secs(0.6); await shot("04d_field_walk_north")
	L("after_walk", str(pos()))

func ui_capture() -> void:
	await tap(KEY_TAB); await secs(1.0); await shot("06a_inventory_tab_key")
	var inv: Node = main.get("source_inventory_ui")
	L("inventory_ui", is_instance_valid(inv))
	if is_instance_valid(inv):
		if not inv.visible: inv.open_panel(); await secs(0.8); await shot("06a_inventory")
		inv.close_panel(); await secs(0.4)
	await tap(KEY_K); await secs(1.0); await shot("06b_skill_K")
	main._toggle_pause(); await secs(0.6); await shot("06c_pause_menu")
	var menu: Node = main.get("native_demo_pause_menu")
	if is_instance_valid(menu):
		menu.buttons.settings.pressed.emit(); await secs(0.8); await shot("06c_settings")
	for i in 3:
		if paused: main._toggle_pause(); await secs(0.3)
	var gp: Node = main.get_node_or_null("NativeGrowthPanel")
	if is_instance_valid(gp): gp.open_panel(); await secs(0.8); await shot("06d_growth"); gp.close_panel(); await secs(0.3)
	L("paused_after_ui", paused)

func nearest_enemy() -> Node:
	var best: Node = null; var bd := 1e12
	for e in main.world.get_enemies():
		if is_instance_valid(e) and e.get("alive") == true:
			var d: float = e.global_position.distance_to(pos())
			if d < bd: bd = d; best = e
	return best

func combat_capture() -> void:
	god()
	await shot("07a_enemies_ring")
	var e := nearest_enemy()
	L("combat_target", {"has": is_instance_valid(e), "count": main.world.get_enemies().size()})
	if is_instance_valid(e):
		main.player.global_position = e.global_position + Vector2(-110, 0); main.player.facing = Vector2.RIGHT
	await secs(0.3)
	for k in 3:
		main.player.request_attack(); await secs(0.12); main.player.release_attack(); await secs(0.15)
	await shot("07b_lmb_combo")
	await secs(0.2); await shot("07c_lmb_after_dmgnum")
	var mb := InputEventMouseButton.new(); mb.button_index = MOUSE_BUTTON_RIGHT; mb.position = Vector2(1260, 540); mb.pressed = true
	Input.parse_input_event(mb); await secs(0.12); mb = mb.duplicate(); mb.pressed = false; Input.parse_input_event(mb)
	await secs(0.3); await shot("07d_rmb_fireball")
	for pair in [["1", "07e_skill1_spiketrap"], ["Space", "07f_space_giantslam"], ["F", "07h_F_holydome"], ["Ctrl", "07i_ctrl_iceorb"]]:
		god()
		var r: Dictionary = main.dispatch_native_skill_slot(pair[0])
		L("skill_" + pair[0], r)
		await secs(0.4); await shot(pair[1])
	await secs(1.2); await shot("07j_after_combat")

func movement_capture() -> void:
	god()
	var p0 := pos()
	key(KEY_SHIFT, true); await secs(0.7); await shot("08a_shift_hold_aim"); key(KEY_SHIFT, false)
	await secs(0.15); await shot("08b_shift_chain_mid"); await secs(0.6); await shot("08c_shift_after")
	var p1 := pos()
	key(KEY_A, true); await secs(0.06); await tap(KEY_SPACE, 0.08); await secs(0.1); await shot("08d_dirspace_bladedash_mid")
	key(KEY_A, false); await secs(0.5); await shot("08e_bladedash_after")
	var p2 := pos()
	L("movement", {"shift_dx": p1.x - p0.x, "shift_dy": p1.y - p0.y, "dirspace_dx": p2.x - p1.x, "dirspace_dy": p2.y - p1.y, "note": "A held 0.06+0.08+0.1s walking included"})

func fieldboss_capture() -> void:
	var ang: Node = main.get("native_demo_anglers")
	L("diag_owners", {"regions": is_instance_valid(main.get_node_or_null("NativeRegions")), "spawn_adapter": main.get("native_stage_spawn_adapter") != null, "angler_markers": ang._markers.size() if is_instance_valid(ang) else -1, "angler_snapshot": ang.snapshot() if is_instance_valid(ang) else {}, "encounter": main.native_demo_encounter.snapshot() if is_instance_valid(main.get("native_demo_encounter")) else {}})
	if is_instance_valid(ang) and ang._markers.size() == 0 and main.world.get("map11_provider") != null:
		var prov: Node2D = main.world.map11_provider
		var sb: Dictionary = main.bind_native_spawn_stage_provider(prov)
		var ab: bool = main.bind_native_demo_anglers(prov, prov.fieldboss_markers())
		L("harness_forced_bind_anglers", {"spawn": sb, "anglers": ab})
	if is_instance_valid(ang) and ang._markers.size() > 0:
		main.player.global_position = ang._markers[0].global_position + Vector2(520, -80)
		god(); await secs(3.5); await shot("09a_fieldboss_angler"); await secs(2.5); await shot("09b_fieldboss_angler_t6s")
		L("anglers", ang.snapshot())
	else:
		L("anglers", "absent")
	var product: Node = main.get("native_map11")
	if is_instance_valid(product) and product.provider() != null:
		var holes: Array = product.provider().anchors("hole")
		if holes.size() > 0:
			main.player.global_position = holes[0].marker.global_position
			god(); await secs(6.0); await shot("09c_field_hole_enemies")
	var types := {}
	for e in main.world.get_enemies():
		if is_instance_valid(e): types[str(e.get("etype"))] = true
	L("enemy_types", types.keys())

func boss_capture() -> void:
	var g: Dictionary = main.source_state.read_current_g()
	g["_bossUnlocked"] = true; g["_fbDone"] = true
	var enc: Node = main.get("native_demo_encounter")
	var r0: Dictionary = enc.enter(main.read_native_map11_provider(), {}) if is_instance_valid(enc) else {"status": "absent"}
	L("boss_enter_natural", r0)
	if r0.get("status") != "READY" and is_instance_valid(enc):
		L("harness_forced_bind_arena", main.bind_native_demo_arena_provider(main.read_native_map11_provider()))
		enc._gate_changed()
		L("encounter_after_bind", enc.snapshot())
	var r: Dictionary = enc.enter(main.read_native_map11_provider(), {}) if is_instance_valid(enc) else {"status": "absent"}
	L("boss_enter", r)
	if r.get("status") != "READY" and is_instance_valid(enc):
		r = enc.enter(main.read_native_map11_provider(), {"difficulty_index": 0})
		L("harness_boss_enter_with_difficulty_index0", r)
	if r.get("status") != "READY":
		var ps: Node = main.world.get_node_or_null("Map11ProductScene")
		if is_instance_valid(ps) and ps.has_method("activate_space"): ps.activate_space("arena"); L("harness_static_arena", true)
	for k in 6: god(); await secs(0.7); await shot("10a_boss_entry_%d" % k)
	await secs(2.0); await shot("10b_boss_arena_t6s")
	var b: Dictionary = main.read_native_demo_boss()
	L("boss_snapshot", b)
	var actor: Node = main.get("native_demo_boss_actor")
	var bnode: Node = null
	if is_instance_valid(actor):
		for c in actor.find_children("*", "Node2D", true, false):
			bnode = c; break
	if bnode == null and is_instance_valid(actor) and actor is Node2D: bnode = actor
	if bnode != null and bnode is Node2D:
		main.player.global_position = (bnode as Node2D).global_position + Vector2(0, 380)
	await secs(1.0); await shot("10d_boss_close")
	for k in 6: god(); await secs(0.8); await shot("10e_boss_close_pattern_%d" % k)
	L("boss_snapshot_after", main.read_native_demo_boss())

func clear_capture() -> void:
	paused = false
	main.native_demo_boss_defeated.emit(0)
	await secs(1.0); await shot("11d_stage_clear_0"); await secs(2.0); await shot("11d_stage_clear_1")
	var flow: Node = main.get("native_demo_end_flow")
	L("end_flow", flow.get_snapshot() if is_instance_valid(flow) else "absent")
	if is_instance_valid(flow) and flow.get_snapshot().phase == "clear":
		flow._view.buttons.next.pressed.emit(); await secs(1.0); await shot("11d_demo_end")
		flow._view.buttons.lobby.pressed.emit()
		for i in 240:
			await process_frame
			if is_instance_valid(current_scene) and current_scene != main and current_scene.get_script() != null and str(current_scene.get_script().resource_path).ends_with("native_demo_lobby.gd"): break
		await secs(1.5); await shot("11e_lobby_return")
		L("lobby_return_scene", current_scene.scene_file_path if is_instance_valid(current_scene) else "")

func run_direct() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	main.set_meta("native_audio_source_root", src)
	root.add_child(main); current_scene = main
	for i in 10: await process_frame
	await guide_capture()
	await field_capture()
	# 사망
	var pl: Node = main.player
	pl.iframes = 0.0
	for k in 12:
		pl.iframes = 0.0
		pl.receive_damage(999999)
		await physics_frame
		if pl.hp <= 0: break
	L("death_hp", pl.hp)
	await secs(1.0); await shot("11a_death_fallen_t1s")
	await secs(3.0); await shot("11a_death_fallen_t4s")
	await secs(3.5); await shot("11b_death_screen")
	await secs(2.0); await shot("11b_death_screen_t9s")
	L("life", main.native_demo_life.snapshot() if is_instance_valid(main.get("native_demo_life")) else "absent")

func run_boss() -> void:
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	main.set_meta("native_audio_source_root", src)
	root.add_child(main); current_scene = main
	for i in 10: await process_frame
	var seq: Node = main.get("source_intro_sequence")
	if is_instance_valid(seq): seq.finish_native_guide()
	await secs(1.5)
	seq = main.get("source_intro_sequence")
	var deadline := Time.get_ticks_msec() + 7000
	while is_instance_valid(seq) and Time.get_ticks_msec() < deadline:
		if is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active: seq.lesson_flow.skip_all(); break
		await process_frame
	await secs(1.0)
	await boss_capture()
