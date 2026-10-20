extends SceneTree
## P2-005c 시각 검수 영상 — 가시덫(1) 설치→틱(감속·DOT), 회복의 영역(F) 시전→입자,
## 지옥강타(Space) 돔 안 쿨 가속 장면 순서 캡처. (headless 금지·격리 userdir.
## 프레임 PNG는 ffmpeg로 720p 인코딩해 판정.)
const USERDIR = "EXODUSER-P2005C-Isolated-20261020"
const OUT = "G:/exoduser-wt/_out/p2-005c/frames"
const FPS = 20.0

var active_main: Node
var _buffered: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true \
			or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
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
	adapter.cast_spike_trap()
	print("VISUAL_SPIKE cast")
	await _record(1.6) # 설치 + 첫 틱(25f) + 감속·가시 입자
	adapter.cast_holy_dome()
	print("VISUAL_DOME cast")
	await _record(1.6) # 돔 입자 + 🛡 텍스트
	adapter.cast_giant_slam()
	print("VISUAL_SLAM cast (돔 안 — _gslCd 2배속)")
	await _record(1.8)
	print("VISUAL_SNAP ", JSON.stringify({"gsl_cd": adapter.get("gsl_cd"), "gc_cd": adapter.get("gc_cd"),
		"hd_cd": adapter.get("hd_cd"), "cast_log": adapter.get_native_skill_slots_snapshot().get("cast_log")}))
	for i in range(_buffered.size()):
		_buffered[i].save_png("%s/f%05d.png" % [OUT, i])
	print("VISUAL_DONE frames=", _buffered.size())
	active_main.get_parent().remove_child(active_main)
	active_main.free()
	quit(0)

func _record(seconds: float) -> void:
	var t0: int = Time.get_ticks_msec()
	var next_shot: float = 0.0
	while Time.get_ticks_msec() - t0 < int(seconds * 1000.0):
		if (Time.get_ticks_msec() - t0) / 1000.0 >= next_shot:
			next_shot += 1.0 / FPS
			await RenderingServer.frame_post_draw
			var img: Image = root.get_viewport().get_texture().get_image()
			img.resize(1280, 720, Image.INTERPOLATE_BILINEAR)
			_buffered.append(img)
		else:
			await process_frame
