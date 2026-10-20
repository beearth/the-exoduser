extends "res://tests/test_demo11_boss_projectiles.gd"
func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	setup()
	actor.spawn({"si":0,"room":0,"x":0.0,"y":0.0,"difficulty_index":5,"stage_diff_offset":0.0,"player_level":1.0})
	actor.bind_owner("source_updateE_prefix",prefix)
	actor.bind_owner("source_updateE_suffix",suffix)
	check(actor.begin_tick(frame(1)),"actual_actor_frame")
	check(service.snapshot().born==12 and not actor.snapshot().pending.is_empty(),"actual_birth_precedes_pending_presentation")
	service.set_physics_process(true)
	await physics_frame
	await physics_frame
	check(service.snapshot().motion_ticks==0,"source_projectile_phase_waits_for_AI_owner_ack")
	finish_actor()
	await physics_frame
	await physics_frame
	var after: Dictionary=service.snapshot()
	check(after.live==12 and after.motion_ticks==12,"automatic_real_physics_source_birth_phase")
	check(after.shots.all(func(s):return s.birth_ticks==1 and s.calls==1),"automatic_serial_deduplication")
	world.wall_x=-INF
	prefix_state="bossRec"
	check(actor.begin_tick(frame(2)),"actual_next_actor_frame")
	finish_actor()
	await physics_frame
	await physics_frame
	await process_frame
	check(service.snapshot().live==0 and service.snapshot().retired==12,"automatic_wall_retirement")
	check(get_nodes_in_group("demo11_boss_projectiles").is_empty(),"automatic_actual_nodes_freed")
	check(target.forbidden_calls==0,"no_mock_protected_success")
	scope.free()
	await process_frame
	print("DEMO35_AUTO_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"actual_physics_driver":true,"actual_actor_births":12,"mock_birth_acks":0,"full_game_source_clock":false}))
	quit(1 if failures else 0)
