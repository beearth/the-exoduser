extends "res://tests/test_demo11_boss_projectiles.gd"
func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	setup()
	for color in ["","invalid_source_color"]:
		var birth: Variant=born({"x":0.0,"y":0.0,"vx":2.0,"vy":0.0,"dmg":1,"el":0,"life":100.0,"ml":100.0,"_commit":true,"col":color},1)
		check(birth is Dictionary and birth.ack and birth.projectile_result.col==color,"raw_color_preserved")
	for i in range(4): await process_frame
	for entry in service._entries.values():
		check(entry.node.draw_calls>0,"actual_draw_executed_with_safe_fallback")
	check(service.snapshot().live==2 and target.forbidden_calls==0,"actual_nodes_live_no_protected_calls")
	scope.free()
	await process_frame
	print("DEMO35_DRAW_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"actual_draw":true,"timing_benchmark":false}))
	quit(1 if failures else 0)
