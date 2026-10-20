extends SceneTree
## MAP-LOOK 화면 검수 캡처(실제 창 렌더 전용, 기본 게임은 이 스크립트를 쓰지 않음).
## 사용: Godot --path . --audio-driver Dummy --position 4000,4000 --resolution 1920x1080
##   --script res://tests/capture_map_look.gd -- --out=<절대경로> [--map-look=on|off] [--spots=start,camp,...]
## 각 지점으로 플레이어·카메라를 옮겨 1920×1080 내부 뷰포트를 PNG로 저장하고 프레임 시간을 잰다.
const USERDIR := "EXODUSER-MapLook-Isolated-20261020"
const SPOTS := {
	"start": Vector2(4020, 7420),
	"camp": Vector2(1900, 4180),
	"altar": Vector2(5900, 4120),
	"toxic_s": Vector2(6380, 5700),
	"toxic_n": Vector2(6600, 1900),
	"corpse_tree": Vector2(4100, 3900),
	"hole": Vector2(3780, 6420),
	"cocoon": Vector2(1800, 2200),
	"attack": Vector2(4020, 7420),
	"impact": Vector2(4020, 7420),
}
var main: Node
var out := ""
var spots: Array = []
var look_mode := "on"

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="): out = arg.trim_prefix("--out=")
		if arg.begins_with("--spots="): spots = Array(arg.trim_prefix("--spots=").split(","))
		if arg.begins_with("--map-look="): look_mode = arg.get_slice("=", 1)
	if spots.is_empty(): spots = SPOTS.keys()
	if out.is_empty() or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		print("MAPLOOK_CAPTURE_BLOCKED out/isolation")
		quit(2)
		return
	if DisplayServer.get_name() == "headless":
		print("MAPLOOK_CAPTURE_BLOCKED real window renderer required")
		quit(2)
		return
	DirAccess.make_dir_recursive_absolute(out)
	root.size = Vector2i(1920, 1080)
	root.gui_disable_input = true
	seed(20261020)
	var packed: PackedScene = load("res://scenes/main.tscn")
	main = packed.instantiate()
	main.set_meta("native_map_look", look_mode)
	root.add_child(main)
	if main.get("world") == null or main.world.ready_for_player != true:
		print("MAPLOOK_CAPTURE_BLOCKED main startup")
		quit(2)
		return
	_disable_input(main)
	main.hud.set_native_debug_overlay_visible(false)
	# 부팅 직후 자원 로딩·지역 초기화가 끝날 때까지 충분히 기다린 뒤 잰다(앞 지점만 느리게 재는 착시 방지).
	for enemy in main.world.get_enemies(): enemy.process_mode = Node.PROCESS_MODE_DISABLED
	for spot_warm in SPOTS.values():
		main.player.global_position = spot_warm
		main.camera.global_position = spot_warm
		main.camera.reset_smoothing()
		if main.world.has_method("_update_visible_chunks"):
			main.world._update_visible_chunks(spot_warm, true)
		for i in range(30): await process_frame
	var report: Dictionary = {"mode": look_mode, "spots": {}}
	for spot in spots:
		if not SPOTS.has(spot):
			continue
		var at: Vector2 = SPOTS[spot]
		main.player.global_position = at
		main.player.velocity = Vector2.ZERO
		main.camera.global_position = at
		main.camera.reset_smoothing()
		if main.world.has_method("_update_visible_chunks"):
			main.world._update_visible_chunks(at, true)
		# 캡처 중 적이 다가와 장면이 바뀌지 않게 적만 멈춘다(표시 검수용).
		for enemy in main.world.get_enemies(): enemy.process_mode = Node.PROCESS_MODE_DISABLED
		for i in range(45): await process_frame
		if spot == "impact":
			# 임팩트 검수: 가장 가까운 적을 플레이어 오른쪽 70px에 두고 기검참으로 맞힌 직후를 찍는다.
			var target: Node2D = null
			var best := INF
			for enemy in main.world.get_enemies():
				if enemy.get("alive") == true and enemy.global_position.distance_to(at) < best:
					best = enemy.global_position.distance_to(at)
					target = enemy
			if target != null:
				# 적은 제자리(그림 동기 유지), 플레이어·카메라를 적 왼쪽 70px로.
				var stand: Vector2 = target.global_position - Vector2(70, 0)
				main.player.global_position = stand
				main.camera.global_position = stand
				main.camera.reset_smoothing()
				if main.world.has_method("_update_visible_chunks"):
					main.world._update_visible_chunks(stand, true)
				main.player.set("facing", Vector2.RIGHT)
				for j in range(20): await process_frame
			print("IMPACT_TARGET ", target.name if target != null else "none", " enemies=", main.world.get_enemies().size(), " best=", best, " vis=", target.visible if target != null else false)
			main.player.set_physics_process(true)
			Engine.time_scale = 0.2  # 검수 캡처 전용: 짧은 효과를 여러 장으로 보기 위해 느리게
			main.player.request_attack()
			var hits := 0
			var look_impact: Node = main.world.get_node_or_null("ImpactLook")
			for i in range(40):
				await physics_frame
				if main.player.get("state") == "windup" and i > 4: main.player.release_attack()
				if look_impact != null and int(look_impact.get_snapshot().get("bursts", 0)) > hits:
					break
			if target != null:
				var body: Variant = target.get("_body")
				print("IMPACT_POS target=", target.global_position, " body_vis=", body.is_visible_in_tree() if body is CanvasItem else "?", " body_gpos=", body.global_position if body is Node2D else "?", " player=", main.player.global_position, " cam=", main.camera.get_screen_center_position(), " facing=", main.player.get("facing"))
			# 타격 직후 프레임들을 바로 저장(측정 루프 뒤 캡처는 효과가 이미 사라짐).
			for shot in range(6):
				await RenderingServer.frame_post_draw
				root.get_texture().get_image().save_png(out.path_join("impact_hit_%d.png" % shot))
				if look_impact != null and not look_impact._sparks.is_empty(): print("IMPACT_SPARK ", shot, " n=", look_impact._sparks.size(), " p0=", look_impact._sparks[0].p, " life=", look_impact._sparks[0].life, " layer_vis=", look_impact._add_layer.is_visible_in_tree(), " cam=", main.camera.get_screen_center_position())
				await process_frame
			Engine.time_scale = 1.0
			print("IMPACT_SNAPSHOT ", look_impact.get_snapshot() if look_impact != null else "no_look")
		if spot == "attack":
			# 어두운 환경광에서 전투 효과 가독성 확인: 기검참 휘두르는 중간 프레임.
			main.player.set_physics_process(true)
			main.player.request_attack()
			for i in range(9): await physics_frame
			if main.player.get("state") == "windup": main.player.release_attack()
			for i in range(7): await physics_frame
		var times: Array = []
		var last := Time.get_ticks_usec()
		for i in range(90):
			await RenderingServer.frame_post_draw
			var now := Time.get_ticks_usec()
			times.append(now - last)
			last = now
		var mon := {"process_ms": Performance.get_monitor(Performance.TIME_PROCESS) * 1000.0,
			"physics_ms": Performance.get_monitor(Performance.TIME_PHYSICS_PROCESS) * 1000.0,
			"draw_calls": Performance.get_monitor(Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME),
			"objects": Performance.get_monitor(Performance.RENDER_TOTAL_OBJECTS_IN_FRAME),
			"nodes": Performance.get_monitor(Performance.OBJECT_NODE_COUNT), "fps": Performance.get_monitor(Performance.TIME_FPS)}
		var image: Image = root.get_texture().get_image()
		var path := out.path_join("%s_%s.png" % [spot, look_mode])
		image.save_png(path)
		times.sort()
		var total := 0
		for t in times: total += t
		report.spots[spot] = {"png": path, "avg_ms": float(total) / times.size() / 1000.0,
			"p95_ms": float(times[int(times.size() * 0.95)]) / 1000.0, "max_ms": float(times[-1]) / 1000.0, "monitors": mon}
	var look: Node = main.world.get_node_or_null("NativeMapLook")
	report["map_look"] = look.get_native_map_look_snapshot() if look != null else null
	var file := FileAccess.open(out.path_join("report_%s.json" % look_mode), FileAccess.WRITE)
	file.store_string(JSON.stringify(report, "\t"))
	file.close()
	print("MAPLOOK_CAPTURE_DONE ", JSON.stringify(report))
	if main.get_parent() != null: main.get_parent().remove_child(main)
	main.free()
	quit(0)

func _disable_input(node: Node) -> void:
	node.set_process_input(false)
	node.set_process_unhandled_input(false)
	node.set_process_unhandled_key_input(false)
	for child in node.get_children(): _disable_input(child)
