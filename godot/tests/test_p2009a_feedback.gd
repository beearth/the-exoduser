extends SceneTree

const USERDIR = "EXODUSER-P2009A-Isolated-20261020"
var checks := 0
var failures := 0
var main: Node

func _initialize() -> void:
	call_deferred("_run")

func check(value: bool, label: String) -> void:
	checks += 1
	if not value:
		failures += 1
		print("P2009A_FAIL ", label)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		quit(2)
		return
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "external")
	root.add_child(main)
	for frame in range(12):
		await physics_frame
	var feedback: Node = main.get_node_or_null("NativeFeedback")
	check(is_instance_valid(feedback), "real Main installs presentation consumer")
	if is_instance_valid(feedback):
		await _contracts(feedback)
	root.remove_child(main)
	main.free()
	await process_frame
	print("P2009A_RESULT ", JSON.stringify({"assertions": checks, "failures": failures}))
	quit(1 if failures else 0)

func _contracts(feedback: Node) -> void:
	var state: Node = main.get("source_state")
	var player: Node = main.get("player")
	var slots: Node = main.get("world").get_node("NativeSkillSlots")
	var p: Dictionary = state.read_current_p()
	var g: Dictionary = state.read_current_g()
	g["on"] = true
	check(feedback.snapshot().ready, "live owners ready")
	var before: Dictionary = p.duplicate(true)
	var reward: Dictionary = state.apply_native_add_exp(main, int(p.maxExp))
	check(reward.applied and reward.levels == 1, "real reward owner levels once")
	var snap: Dictionary = feedback.snapshot()
	check(snap.notice.text == "LEVEL UP!" and snap.notice.duration_ms == 2500, "43162 exact text and duration")
	check(snap.notice.color == "#ffdd00", "43161 human color")
	check(snap.vfx.active and snap.vfx.label == "Lv. %d" % int(p.lv), "original level label")
	check(snap.audio.last.key == "levelup" and snap.audio.last.layers == 17, "12764 source synthesis layers")
	check(p.sp == before.sp + 3 and reward.texts[0].text == "SP +3 AP +1", "existing SP AP text not duplicated")
	check(not reward.unported.has("SFX.levelup"), "wired reward no stale unported flag")
	var no_level: Dictionary = state.apply_native_add_exp(main, 0)
	check(no_level.levels == 0 and feedback.snapshot().level_events == 1, "no false level presentation")
	var pickup: Dictionary = state.apply_native_add_potion(main, "hp", 1)
	check(pickup.accepted and feedback.snapshot().audio.last.key == "pickup", "28255 real accepted pickup sound")
	var pickup_events: int = feedback.snapshot().pickup_events
	state.apply_native_add_potion(main, "mp", 1)
	check(feedback.snapshot().pickup_events == pickup_events, "discarded potion silent")
	player.set("stamina", 0.0)
	g["mats"] = 0
	slots.cast_giant_slam()
	check(feedback.snapshot().notice.text == "ST 부족!", "ST rejection precedence")
	check(float(player.get("stamina")) == 0.0 and g.mats == 0 and slots.gsl_cd == 0.0, "rejection no cost or cooldown change")
	player.set("stamina", 100.0)
	slots.cast_giant_slam()
	check(feedback.snapshot().notice.text == "악의 부족! (10)", "giant slam exact notice")
	slots.cast_spike_trap()
	check(feedback.snapshot().notice.text == "악의 부족! (5)", "spike exact notice")
	main.get("source_resources").commit_native_skill_mana_spend(main, float(p.mp))
	slots.cast_ice_orb()
	check(feedback.snapshot().notice.text == "MP 부족!" and feedback.snapshot().notice.color == "#4488ff", "ice MP source notice")
	check(p.mp == 0.0 and slots.io_cd == 0.0, "MP gate unchanged")
	g["mats"] = 100
	slots.gsl_cd = 20.0
	var notices: int = feedback.snapshot().notice_serial
	slots.cast_giant_slam()
	check(feedback.snapshot().notice_serial == notices, "cooldown-only silent in original dispatcher")
	slots.set("_io_active", true)
	slots.cast_spike_trap()
	check(feedback.snapshot().notice.text == "얼음보주 안에선 사용 불가!" and feedback.snapshot().notice.color == "#88ddff", "original orb lock notice")
	slots.set("_io_active", false)
	feedback.show_ph("ST 부족!", "#ff4444", 50)
	await create_timer(0.025).timeout
	feedback.show_ph("MP 부족!", "#4488ff", 1000)
	await create_timer(0.05).timeout
	check(feedback.snapshot().notice.visible and feedback.snapshot().notice.text == "MP 부족!", "replace clears old timeout")
	await create_timer(1.16).timeout
	check(not feedback.snapshot().notice.visible, "notice timeout plus original 0.1s fade")
	var vfx: Node = feedback.get("vfx")
	vfx.trigger(3, false)
	vfx.age = 0.1
	vfx.trigger(2, true)
	check(is_equal_approx(vfx.age, 0.1) and is_equal_approx(vfx.strength, 1.03), "source merge under .24 and strength")
	vfx.age = 0.25
	vfx.trigger(20, false)
	check(vfx.age == 0.0 and is_equal_approx(vfx.strength, 1.12), "source restart and strength cap")
	vfx.age = 3.1
	check(vfx.build_plan(false, false).is_empty(), "VFX stops at 3 seconds")
	player.set("state", "dead")
	vfx.advance(0.01)
	check(not vfx.active, "dead owner cancels visual")
	check(feedback.snapshot().pickup_owner == "P2-006a_native_world_drops", "equipment drop path owned externally no duplicate audio")
