extends SceneTree
## P2-001j 시각 검수 — 커튼 오픈→레슨 자동 개입→스킵→타이머 진행 캡처.
## (headless 금지·격리 userdir. 프레임 PNG는 ffmpeg로 720p 영상 인코딩해 판정.)
const USERDIR = "EXODUSER-P2001J-Isolated-20261020"
const OUT = "G:/exoduser-wt/_out/p2-001j/frames"
const FPS = 20.0

var active_main: Node
var _frame_index := 0
var _buffered: Array = [] # [Image] — 저장은 종료 시(캡처 중 PNG IO로 fps 급락 방지)

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
	active_main.set_meta("native_intro_boot", "intro") # 하니스 부팅에서 인트로 경로 명시
	root.add_child(active_main)
	for i in range(8):
		await physics_frame
	var sequence: Node2D = active_main.get("source_intro_sequence")
	if not is_instance_valid(sequence) or sequence.get("phase") != "guide":
		print("VISUAL_ABORT no_sequence_or_not_guide phase=", sequence.get("phase") if is_instance_valid(sequence) else "none")
		quit(3)
		return
	print("VISUAL_GUIDE curtain closed, capturing")
	await _record(1.0) # 닫힌 커튼(가이드)
	sequence.finish_native_guide()  # Esc 스킵 → 커튼 오픈+5링+bonfire
	print("VISUAL_OPEN ", JSON.stringify(sequence.get_snapshot()["metrics"]))
	await _record(1.1) # 오픈~dispose(+900ms) — 레슨 자동 개입 직전까지
	var flow: Node = sequence.get("lesson_flow")
	var wait_deadline: int = Time.get_ticks_msec() + 3000
	while Time.get_ticks_msec() < wait_deadline and (not is_instance_valid(flow) or flow.get("active") != true):
		await process_frame
	print("VISUAL_LESSON active=", flow.get("active") if is_instance_valid(flow) else null)
	await _record(2.6) # 레슨 intro 패널 구간
	if is_instance_valid(flow) and flow.get("active") == true:
		flow.skip_all()   # '연습 건너뛰기'
	print("VISUAL_SKIP ", JSON.stringify(flow.get_snapshot()["metrics"] if is_instance_valid(flow) else {}))
	await _record(3.6) # 복원된 5링 + HUD 타이머 진행 구간
	for i in range(_buffered.size()):
		_buffered[i].save_png("%s/f%05d.png" % [OUT, i])
	print("VISUAL_DONE frames=", _buffered.size(), " fps_engine=", Engine.get_frames_per_second())
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
			_frame_index += 1
		else:
			await process_frame
