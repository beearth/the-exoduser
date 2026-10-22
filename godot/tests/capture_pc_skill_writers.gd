extends SceneTree
## PC-SKILL-WRITERS (2026-10-22) — 웹과 나란히 비교할 SkillForge '추천 자동'/'일괄 레벨업' 전후 캡처.
## 실행: Godot(창) --audio-driver Dummy --resolution 1920x1080 --position 0,0 --script res://tests/capture_pc_skill_writers.gd -- --out=<dir> --demo11-storage=off
## Mac UI-04에서 두 버튼은 아직 비활성(HOLD)이다. 캡처 전용 임시 훅: 버튼이 부를 같은 경로
## forge.manage("recommend"/"batch","")를 직접 호출한다(버튼 자체를 누른 것이 아님). 제품 코드 수정 0.
## 상태 준비는 실제 XP(apply_native_add_exp)만 사용하고, 같은 before 원장을 JSON으로 남겨 웹에 그대로 적용한다.
const USERDIR := "EXODUSER-pc-skill-writers-Isolated-20261022"
var main: Node
var forge: Control
var out := ""

func _initialize() -> void:
	create_timer(600).timeout.connect(func(): print("PSWCAP_WATCHDOG"); quit(2))
	call_deferred("_run")
func L(k: String, v: Variant = null) -> void:print("PSWCAP ", k, " ", JSON.stringify(v))
func secs(s: float) -> void:await create_timer(s, true, false, true).timeout
func shot(name: String) -> void:
	await RenderingServer.frame_post_draw
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(out.path_join(name + ".png"))
	L("shot", name)
func dump(name: String, value: Variant) -> void:
	var f := FileAccess.open(out.path_join(name + ".json"), FileAccess.WRITE); f.store_string(JSON.stringify(value, "\t")); f.close()
func xp_to(level: int) -> void:
	var state: Node = main.source_state
	while int(state.read_current_p().lv) < level:
		var p: Dictionary = state.read_current_p()
		var xp: Dictionary = state.apply_native_add_exp(main, int(p.maxExp))
		if not xp.get("applied", false): L("xp_stop", xp); return
func scene(tag: String, action: String, level: int) -> void:
	paused = false
	xp_to(level)
	var before: Dictionary = main.read_native_skill_management()
	dump(tag + "_before_state", before)
	forge.open_panel(); await secs(0.8)
	await shot(tag + "_before")
	forge.manage(action, "")
	await secs(0.8)
	await shot(tag + "_after")
	var receipt: Dictionary = forge.last.duplicate(true)
	receipt.erase("before"); receipt.erase("current")
	dump(tag + "_after_state", main.read_native_skill_management())
	dump(tag + "_receipt", receipt)
	L(tag, {"committed": receipt.get("committed"), "reason": receipt.get("reason", ""), "counts": receipt.get("counts", {})})
	forge.close_panel(); await secs(0.4)

func _run() -> void:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--out="): out = a.trim_prefix("--out=")
	if not OS.get_user_data_dir().ends_with(USERDIR) or out.is_empty() or DisplayServer.get_name() == "headless" \
		or not OS.get_cmdline_user_args().has("--demo11-storage=off"):
		print("PSWCAP refuse"); quit(3); return
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920, 1080)
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	for i in 10: await process_frame
	var seq: Node = main.get("source_intro_sequence")
	if is_instance_valid(seq): seq.finish_native_guide()
	for i in 300:
		await physics_frame
		if is_instance_valid(seq) and is_instance_valid(seq.lesson_flow) and seq.lesson_flow.active:
			seq.lesson_flow.skip_all(); break
	await secs(1.0)
	forge = main.source_inventory_ui.skill_forge
	await scene("rec", "recommend", 49)
	await scene("batch", "batch", 52)
	paused = false
	main.queue_free(); await secs(0.3)
	quit(0)
