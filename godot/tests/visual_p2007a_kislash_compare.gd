extends SceneTree
## P2-007a — 기검참 렌더 단독 대조: 웹 _drawRadiantKiSlash(Canvas2D, 19205)를 같은 조건
## (800×800 #303030 배경, 중심(400,400), ang 0, ml 25, 진행도 p, trail 전부 같은 점)으로 그린 PNG와
## 픽셀 비교하기 위한 Godot 측 렌더. 실 렌더 필요(xvfb-run). 판정은 눈 + 픽셀 통계.
const CRESCENT := preload("res://scripts/crescent.gd")
const HIT := preload("res://scripts/hit_effect.gd")
var out_dir := "user://p2007a_kislash"

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="):
			out_dir = arg.substr(6)
	DirAccess.make_dir_recursive_absolute(out_dir)
	var bg := ColorRect.new()
	bg.color = Color8(0x30, 0x30, 0x30)
	bg.size = Vector2(800, 800)
	root.add_child(bg)
	for spec in [["step1_p30", 1, 1.0, 0.3], ["step3_full_p30", 3, 2.2, 0.3], ["step3_full_p70", 3, 2.2, 0.7]]:
		var shot: Node2D = CRESCENT.new()
		shot.global_position = Vector2(400, 400)
		root.add_child(shot)
		shot.set_physics_process(false)
		shot.set("step", spec[1])
		shot.set("charge_scale", spec[2])
		shot.set("_width", (252.0 if spec[1] == 3 else 192.0) * float(spec[2]))
		shot.set("initial_life_frames", 25.0)
		shot.set("life_frames", 25.0 * (1.0 - float(spec[3])))
		var trail: Array[Vector2] = [Vector2(400, 400), Vector2(400, 400), Vector2(400, 400), Vector2(400, 400), Vector2(400, 400)]
		shot.set("_trail", trail)
		shot.call("_update_visual")
		for i in range(3):
			await process_frame
		await RenderingServer.frame_post_draw
		var img: Image = root.get_viewport().get_texture().get_image().get_region(Rect2i(0, 0, 800, 800))
		img.save_png("%s/godot_%s.png" % [out_dir, spec[0]])
		print("KISLASH_SHOT ", spec[0])
		shot.free()
	# 명중광(_playKiSlashHit 19379~19384): 잉크 층(19370~) + VFX 풀 가산 프레임(54577~54620), ang 0.
	for spec in [["hit_step1_f0", 140.0, 0], ["hit_step3_full_f2", 184.0 * 2.2, 2]]:
		var hit: Node2D = HIT.new()
		root.add_child(hit)
		hit.configure(Vector2(400, 400), Vector2.RIGHT, float(spec[1]), 0, 3.0, true)
		hit.set("_age_frames", float(spec[2]) * 3.0 + 0.5)
		hit.call("_process", 0.0)
		hit.set_process(false)
		for i in range(3):
			await process_frame
		await RenderingServer.frame_post_draw
		var hit_img: Image = root.get_viewport().get_texture().get_image().get_region(Rect2i(0, 0, 800, 800))
		hit_img.save_png("%s/godot_%s.png" % [out_dir, spec[0]])
		print("KISLASH_SHOT ", spec[0])
		hit.free()
	quit(0)
