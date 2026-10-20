extends SceneTree
## P2-005c 시각 검수 하니스 — (b) 지옥강타 인페르노 분출을 같은 웨이브 위상(t=14, p≈0.31)에서 캡처
## + 가시덫 설치/틱, 회복의 영역 시전 장면 캡처. (headless 금지·격리 userdir 필수. 판정은 PNG를 눈으로.)
const USERDIR = "EXODUSER-P2005C-Isolated-20261020"
const OUT = "G:/exoduser-wt/_out/p2-005c/godot"

var active_main: Node

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	if not isolated:
		print("VISUAL_ABORT not_isolated")
		quit(2)
		return
	DirAccess.make_dir_recursive_absolute(OUT)
	var packed: PackedScene = load("res://scenes/main.tscn")
	active_main = packed.instantiate()
	root.add_child(active_main)
	for i in range(12):
		await physics_frame
	if active_main.get("world").get("ready_for_player") != true:
		print("VISUAL_ABORT world_not_ready")
		quit(3)
		return
	var player: Node2D = active_main.get("player")
	var enemy: Node2D = null
	var best := 1e18
	for c in active_main.get("world").get_enemies():
		if is_instance_valid(c) and c.get("alive") == true:
			var d: float = c.global_position.distance_to(player.global_position)
			if d < best:
				best = d
				enemy = c
	player.global_position = enemy.global_position + Vector2(-80, 0)
	for i in range(20):
		await physics_frame
	var adapter: Node = active_main.get("world").get_node("NativeSkillSlots")
	# ── (b) 지옥강타 — 같은 위상 t=14 (웹과 동일 좌표계: p=t/45) ──
	adapter.cast_giant_slam()
	for i in range(300):
		await physics_frame
		var waves: Array = adapter.get("_waves")
		if waves.is_empty():
			break
		var t: float = float(waves[0]["t"])
		if t >= 14.0:
			print("VISUAL_SLAM_T ", t, " maxR=", waves[0]["maxR"])
			await _shot("g_slam_t14")
			break
	for i in range(90):
		await physics_frame
	# ── 가시덫 — 설치 직후 + 첫 틱 직후 ──
	adapter.cast_spike_trap()
	await _shot("g_spike_cast")
	for i in range(28):
		await physics_frame
	await _shot("g_spike_tick")
	# ── 회복의 영역 — 시전 직후 ──
	adapter.cast_holy_dome()
	for i in range(3):
		await physics_frame
	await _shot("g_dome_cast")
	var snap: Dictionary = adapter.get_native_skill_slots_snapshot()
	print("VISUAL_SNAP ", JSON.stringify({"zones": snap.get("zones"), "cast_log": snap.get("cast_log"),
		"cam": str(active_main.get("camera").global_position), "player": str(player.global_position)}))
	quit(0)

func _shot(name_tag: String) -> void:
	await RenderingServer.frame_post_draw
	var img: Image = root.get_viewport().get_texture().get_image()
	img.save_png("%s/%s.png" % [OUT, name_tag])
	print("VISUAL_SHOT ", name_tag, " ", img.get_width(), "x", img.get_height())
