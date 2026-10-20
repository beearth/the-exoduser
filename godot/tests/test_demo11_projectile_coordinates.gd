extends "res://tests/test_demo11_boss_projectiles.gd"
func _run() -> void:
	setup()
	world.position=Vector2(300,-200)
	var birth: Variant=born({"x":25.0,"y":40.0,"vx":2.0,"vy":0.0,"dmg":1,"el":0,"life":100.0,"ml":100.0,"_commit":true,"_druidStraight":true,"col":"#bbbbbb"},1)
	check(birth is Dictionary and birth.ack,"actual_birth")
	var entry: Dictionary=service._entries.values()[0]
	check(entry.node.global_position.distance_to(Vector2(25,40))<0.0001,"source_global_origin_converted_to_existing_world_local")
	var vx: float=birth.projectile_result.vx
	service.advance_source_frame(frame(1))
	check(entry.node.global_position.distance_to(Vector2(25+vx,40))<0.0001,"existing_kernel_motion_stays_in_source_global_space")
	check(abs(entry.raw.x-entry.node.global_position.x)<0.0001 and target.forbidden_calls==0,"registry_readback_no_protected_call")
	scope.free()
	await process_frame
	print("DEMO35_COORD_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"map_content_changed":false}))
	quit(1 if failures else 0)
