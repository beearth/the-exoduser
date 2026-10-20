extends "res://tests/test_p2009a_feedback.gd"

func _contracts(feedback: Node) -> void:
	var state: Node = main.get("source_state")
	var player: Node = main.get("player")
	var slots: Node = main.get("world").get_node("NativeSkillSlots")
	var p: Dictionary = state.read_current_p()
	var g: Dictionary = state.read_current_g()
	g["on"] = true
	var drain: Dictionary = main.get("source_resources").commit_native_skill_mana_spend(main, float(p.mp))
	check(drain.accepted and drain.after == 0.0, "fixture drains MP through actual authority")
	slots.cast_ice_orb()
	check(feedback.snapshot().notice.get("text") == "MP 부족!" and feedback.snapshot().notice.get("color") == "#4488ff", "recheck ice MP source notice with actual resource owner")
	check(float(state.read_current_p().mp) == 0.0 and slots.io_cd == 0.0, "recheck MP gate unchanged")
	player.set("stamina", 100.0)
	g["mats"] = 100
	slots.gsl_cd = 20.0
	var serial: int = feedback.snapshot().notice_serial
	slots.cast_giant_slam()
	check(feedback.snapshot().notice_serial == serial, "recheck cooldown-only silent without unintended active orb")
	feedback.show_ph("ST 부족!", "#ff4444", 50)
	feedback.show_ph("MP 부족!", "#4488ff", 1000)
	await create_timer(0.2).timeout
	check(feedback.snapshot().notice.visible and feedback.snapshot().notice.text == "MP 부족!", "recheck replacement survives old timeout plus fade")
