extends SceneTree
## PC-FOLLOWUPS 필드 600틱 벽시계 벤치(전후 비교용). benchmark_map11_product.gd와 같은 부팅(120Hz·인트로→가이드→레슨 skip_all),
## 준비 120틱 → 플레이어를 hole 앵커[0]에 고정(배치만, 매 틱 재배치·HP 회복) → warmup 240틱 → 측정 600틱.
## 기록: 틱 간 벽시계(mean/p95/max), Mac 자동 석궁 snapshot(fired/hits/kills/max_tick_us/reason), PC 필드몹 owner 계수.
## 전(base)에서는 _fieldBosses 존재로 석궁 admission이 거절되어 탄이 날지 않으므로, 차이에는 실제 탄 비행·hurtE 비용이 포함된다.
const USERDIR := "EXODUSER-pc-followups-Isolated-20261021"

func _initialize() -> void: call_deferred("_run")

func _heal(main: Node) -> void:
	var p: Dictionary = main.source_state.read_current_p()
	if float(p.get("hp", 0)) < float(p.get("mhp", 0)):
		p["hp"] = p.get("mhp")
		main.player.set("hp", float(p.get("mhp")))

func _run() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR: quit(2); return
	Engine.physics_ticks_per_second = 120
	Engine.max_fps = 0
	var main: Node = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	current_scene = main
	for i in 12: await physics_frame
	main.source_intro_sequence.finish_native_guide()
	var lesson: Node = main.source_intro_sequence.lesson_flow
	var deadline: int = Time.get_ticks_msec() + 10000
	while not lesson.active and Time.get_ticks_msec() < deadline: await process_frame
	lesson.skip_all()
	for i in 120: await physics_frame
	if not is_instance_valid(main.read_native_map11_provider()): quit(3); return
	var anchors: Array = main.native_map11.provider().anchors("hole")
	if anchors.is_empty(): quit(4); return
	var spot: Vector2 = anchors[0].marker.global_position
	var player: Node = main.player
	for i in 240:
		player.global_position = spot
		_heal(main)
		await physics_frame
	var xb: RefCounted = main.native_auto_crossbow
	var x0: Dictionary = xb.snapshot().duplicate(true)
	xb.max_tick_us = 0
	var intervals: Array = []
	var start: int = Time.get_ticks_usec()
	var previous: int = start
	for i in 600:
		player.global_position = spot
		_heal(main)
		await physics_frame
		var now: int = Time.get_ticks_usec()
		intervals.append(now - previous)
		previous = now
	var elapsed: int = Time.get_ticks_usec() - start
	intervals.sort()
	var x1: Dictionary = xb.snapshot()
	var pack: Variant = main.get("native_combat_pack_b")
	var g: Dictionary = main.source_state.read_current_g()
	var row := {"ticks": 600, "wall_us": elapsed, "mean_ms": float(elapsed) / 600.0 / 1000.0,
		"p95_ms": float(intervals[569]) / 1000.0, "max_ms": float(intervals[599]) / 1000.0,
		"crossbow": {"fired": int(x1.fired) - int(x0.fired), "hits": int(x1.hits) - int(x0.hits), "kills": int(x1.kills) - int(x0.kills),
			"max_tick_us": x1.max_tick_us, "reason": x1.reason},
		"fieldBosses": (g.get("_fieldBosses") as Array).size() if g.get("_fieldBosses") is Array else null,
		"enemies": main.world.get_enemies().size(),
		"field_owner": pack.get_snapshot().get("field_mob_owner", "absent") if pack != null else "absent",
		"git_head_note": "see runner log"}
	print("PCFU_BENCH ", JSON.stringify(row))
	# 즉시 해제(test_pc_combat_pack_b._cleanup과 같음) — queue_free 뒤 남은 물리 틱에서 해체 중 서비스를 읽는 하니스 유발 오류 방지.
	root.remove_child(main)
	main.free()
	quit(0)
