extends "res://tests/test_p2009a_feedback.gd"

func _contracts(feedback: Node) -> void:
	var state: Node = main.get("source_state")
	var passives: Dictionary = state.read_current_passives()
	passives["pDemon"] = 1
	passives["pHuman"] = 0
	var p: Dictionary = state.read_current_p()
	var reward: Dictionary = state.apply_native_add_exp(main, int(p.maxExp))
	check(reward.levels == 1 and reward.texts[0].color == "#d38aff", "43159-43165 real PASSIVES drives SP color")
	check(feedback.snapshot().notice.color == "#d38aff" and feedback.snapshot().vfx.demonic, "demonic notice and VFX agree")
	check(feedback.snapshot().notice.blur_radius == 25.0, "679 original CSS glow radius")
	feedback.show_ph("ST 부족!", "#ff4444")
	check(feedback.snapshot().notice.source_translation_id == "0339", "existing translation number not invented")
	feedback.show_ph("악의 부족! (5)", "#ff4444")
	check(feedback.snapshot().notice.source_translation_id == "1523+5", "dynamic original prefix number")
	var audio: Node = feedback.get("audio")
	var count: int = audio.get("_voices").size()
	audio.play_resource_voice()
	var voices: Array = audio.get("_voices")
	check(voices.size() == count + 1, "byte-exact silvertail resource sample dispatched")
	var voice: AudioStreamPlayer = voices.back()
	check(voice.pitch_scale >= 0.92 and voice.pitch_scale <= 1.08, "12366 voice downstream pitch jitter")
	var settings: Dictionary = main.read_native_attack_audio_settings()
	check(is_equal_approx(db_to_linear(voice.volume_db), pow(float(settings.sfx_gain), 2.0)), "12272 plus 12452 sample gain applied twice")
	audio.play_resource_voice()
	check(audio.get("_voices").size() == voices.size(), "12337 resource voice 10-second repeat block")
	var vfx: Node = feedback.get("vfx")
	state.read_current_g()["stage"] = 1
	vfx.advance(0.01)
	check(not vfx.active, "source VFX cancels on stage transition")
	var producer: Node2D = load("res://port_modules/floating_text/producer.gd").new(func(value: Variant) -> Variant: return value, Callable())
	producer.add_txt(0.0, -40.0, "SP +3 AP +1", "#ffdd00", 60)
	producer.add_txt(0.0, -20.0, "+1", "#cc66ff", 25)
	var context := {"float_text_enabled": true, "bt_active": false, "cam_x": 0.0, "cam_y": 0.0, "vw": 1920.0, "vh": 1080.0, "hi_fps": true}
	check(producer.build_draw_plan(context).is_empty(), "54833-54839 source normal-mode whitelist hides SP and +1")
	context.bt_active = true
	var plan: Array = producer.build_draw_plan(context)
	check(plan.size() == 2 and plan[0].text == "SP +3 AP +1" and plan[1].text == "+1", "existing text consumer preserves source entries without new glyphs")
	producer.free()
