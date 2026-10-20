extends SceneTree
## P3-002 시각 검수 — 실창 렌더(headless 금지)로 소환굴 월드 렌더(void_black 시트·라벨·트리거 글로)와
## 좌상 미니맵 #aa4444 점을 캡처. 격리 userdir 필수. 판정은 산출 PNG를 눈으로.
## 출력: 환경변수 P3002_OUT (기본 user://p3002_visual).
const USERDIR = "EXODUSER-P3002-Isolated-20261020"
const HOLE := Vector2(3780, 6220)   # #9 S — 시작점 최근접
const STAND := Vector2(3780, 6560)

var active_main: Node
var out_dir := ""

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	if not isolated:
		print("VISUAL_ABORT not_isolated")
		quit(2)
		return
	out_dir = OS.get_environment("P3002_OUT")
	if out_dir.is_empty():
		out_dir = ProjectSettings.globalize_path("user://p3002_visual")
	DirAccess.make_dir_recursive_absolute(out_dir)
	var packed: PackedScene = load("res://scenes/main.tscn")
	active_main = packed.instantiate()
	root.add_child(active_main)
	for i in range(8):
		await physics_frame
	var world: Node2D = active_main.get("world")
	var player: Node2D = active_main.get("player")
	var system: Node2D = world.get_node_or_null("NativeSpawnHoleSystem")
	if system == null:
		print("VISUAL_ABORT no_spawn_hole_system")
		quit(3)
		return
	player.global_position = STAND
	for i in range(40):
		await physics_frame
	# 렌더 게이트(52617 _gameFrame>120)만 연다 — 트리거 전 정지 상태.
	system.set("_game_frame", GAME_FRAME_OPEN)
	system.call("_redraw")
	await _shot("p3_0_hole_idle")
	# 트리거 + 연출 60틱(글로 확대)
	for i in range(61):
		player.global_position = STAND
		system.advance_native(1.0)
	await _shot("p3_1_hole_triggered_glow")
	# 첫 소환 이후
	for i in range(260):
		player.global_position = STAND
		system.advance_native(1.0)
	for i in range(10):
		await physics_frame
	await _shot("p3_2_hole_spawning")
	print("VISUAL_DONE ", JSON.stringify({"metrics": system.get_snapshot()["metrics"],
		"holes_left": system.get("holes").size(), "out": out_dir}))
	if active_main.get_parent() != null:
		active_main.get_parent().remove_child(active_main)
	active_main.free()
	quit(0)

const GAME_FRAME_OPEN := 121

func _shot(name_tag: String) -> void:
	for i in range(3):
		await process_frame
	await RenderingServer.frame_post_draw
	var img: Image = root.get_viewport().get_texture().get_image()
	img.save_png("%s/%s.png" % [out_dir, name_tag])
	print("VISUAL_SHOT ", name_tag)
