extends SceneTree
## P2-005d 시각 검수 — 얼음보주(Ctrl) 보주 형성(≈28f 위상)·자동 파쇄 직후 캡처 + 짧은 영상 프레임.
## (headless 금지·격리 userdir. 판정은 PNG/mp4를 눈으로.)
const USERDIR = "EXODUSER-P2005D-Isolated-20261020"
const OUT = "G:/exoduser-wt/_out/p2-005d/godot"
const FRAMES_OUT = "G:/exoduser-wt/_out/p2-005d/frames"
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
	DirAccess.make_dir_recursive_absolute(FRAMES_OUT)
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
	adapter.cast_ice_orb()
	print("VISUAL_CAST ", JSON.stringify(adapter.get_native_skill_slots_snapshot().get("cast_log")))
	# 웹 ORB 캡처가 _ioT=28이었으므로 같은 위상에서 정지컷. 녹화는 같은 루프에서 20fps 수집.
	var t0: int = Time.get_ticks_msec()
	var next_frame := 0.0
	var orb_shot := false
	var shatter_shot := false
	var shatter_wait := 0
	while Time.get_ticks_msec() - t0 < 5000:
		if (Time.get_ticks_msec() - t0) / 1000.0 >= next_frame:
			next_frame += 1.0 / FPS
			await RenderingServer.frame_post_draw
			var img: Image = root.get_viewport().get_texture().get_image()
			if not orb_shot and float(adapter.get("_io_t")) >= 28.0 and adapter.get("_io_active") == true:
				img.save_png("%s/g_iceorb_orb.png" % OUT)
				print("VISUAL_SHOT g_iceorb_orb io_t=", adapter.get("_io_t"))
				orb_shot = true
			if not shatter_shot and adapter.get("_io_active") == false and float(adapter.get("io_cd")) > 0.0:
				shatter_wait += 1
				if shatter_wait >= 3: # 파쇄 수 프레임 후 (칼날·VFX 가시 구간)
					img.save_png("%s/g_iceorb_shatter.png" % OUT)
					print("VISUAL_SHOT g_iceorb_shatter")
					shatter_shot = true
			img.resize(1280, 720, Image.INTERPOLATE_BILINEAR)
			_buffered.append(img)
		else:
			await process_frame
	for i in range(_buffered.size()):
		_buffered[i].save_png("%s/f%05d.png" % [FRAMES_OUT, i])
	print("VISUAL_DONE frames=", _buffered.size(), " snap=", JSON.stringify({
		"io_cd": adapter.get("io_cd"), "blades": adapter.get("_blades").size()}))
	active_main.get_parent().remove_child(active_main)
	active_main.free()
	quit(0)

