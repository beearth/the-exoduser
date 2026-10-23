extends SceneTree
## PC-PLAYER-SHIELD 관측 도구(2026-10-23) — 플레이어 에너지쉴드 흡수·격파·리젠. 제품 코드 수정 없음. 캡처는 엔진 내부 viewport만.
## 실행: godot --path godot --script res://../tools/parity/pc_player_shield_probe.gd -- --out=<dir> --mode=shield [--source-root=<repo>]
const ALLOWED := ["EXODUSER-demo11-pc-player-shield-Isolated-20261023"]
var out := ""
var src := ""
var mode := "shield"
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
		"shield": await run_shield()
		_: L("unknown_mode", mode)
	var f := FileAccess.open(out.path_join("pcsh_log_%s.json" % mode), FileAccess.WRITE)
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

func S() -> Dictionary:
	var cur: Dictionary = p()
	return {"hp": main.player.hp, "mhp": main.player.max_hp, "shield": cur.get("shield"), "mshield": cur.get("mshield"),
		"shieldRegenT": cur.get("shieldRegenT"), "s": main.player.state, "int": main.source_state.read_current_stats().get("int"),
		"lv": cur.get("lv"), "pMRegen": main.source_state.read_current_passives().get("pMRegen"), "baseDef": main.player.base_def,
		"stageTime": g().get("stageTime")}

func shield_texts() -> Array:
	var out_t: Array = []
	var snap: Dictionary = main.world.get_node("NativeFloatingText").get_snapshot()
	for slot in snap.pool:
		if float(slot.life) > 0.0 and str(slot.c) == "#4488ff": out_t.append({"t": slot.t, "c": slot.c, "ml": slot.ml})
	return out_t

func hit(d: int) -> Dictionary:
	var pl: Node = main.player
	pl.iframes = 0.0
	if pl.state in ["stagger", "pStun"]: pl.state = "idle"
	pl.receive_damage(d)
	var cur: Dictionary = p()
	return {"hp": pl.hp, "shield": cur.get("shield"), "shieldRegenT": cur.get("shieldRegenT"), "txt": shield_texts()}

## 벽시계가 아닌 원본 tick(G.stageTime) 기준: N tick 뒤 SceneTree.paused로 멈추고 엔진 내부 캡처 후 재개.
func freeze_after(n: float, name: String) -> void:
	var t0: float = float(g().get("stageTime", 0))
	var deadline := Time.get_ticks_msec() + 20000
	while float(g().get("stageTime", 0)) < t0 + n and Time.get_ticks_msec() < deadline: await process_frame
	paused = true
	var cur: Dictionary = p()
	L(name + "_frozen", {"stageTime": g().get("stageTime"), "hp": main.player.hp, "shield": cur.get("shield"), "shieldRegenT": cur.get("shieldRegenT")})
	await secs(0.15); await shot(name); paused = false

func freeze_when_ratio(r: float, name: String) -> void:
	var deadline := Time.get_ticks_msec() + 30000
	while float(p().get("shield", 0)) / maxf(1.0, float(p().get("mshield", 1))) < r and Time.get_ticks_msec() < deadline: await process_frame
	paused = true
	var cur: Dictionary = p()
	L(name + "_frozen", {"stageTime": g().get("stageTime"), "hp": main.player.hp, "shield": cur.get("shield"), "mshield": cur.get("mshield"), "shieldRegenT": cur.get("shieldRegenT")})
	await secs(0.15); await shot(name); paused = false

func run_shield() -> void:
	if not await enter_play(): return
	await secs(1.5)
	var n := 0
	for e in main.world.get_enemies():
		if is_instance_valid(e) and e is Node2D and (not "alive" in e or e.alive):
			e.global_position += Vector2(4000, 4000); n += 1
	L("park_enemies", n)
	await secs(0.5)
	await freeze_after(1, "s0_full")
	L("hit1_60", hit(60))
	L("hit2_60", hit(60))
	await freeze_after(30, "s2_partial_t30")
	p()["shield"] = 20; L("set_shield_20", p().get("shield"))
	L("hit3_break_60", hit(60))
	await freeze_after(3, "s3_break_t3")
	await freeze_after(5, "s3_break_t8")
	await freeze_after(60, "s4_break_t68")
	await freeze_when_ratio(0.25, "s5_regen_25pct")
	L("s5", S())
