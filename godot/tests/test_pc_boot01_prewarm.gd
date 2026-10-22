extends SceneTree
## BOOT-01 (PC, 2026-10-22) — 진입 예열 결과가 진입 중 동기 계산과 바이트 단위로 같은지 확인한다.
## A. World onload 작업표(native_boot_prewarm_jobs) 전 항목: 예열 커널 결과 == 기존 순서(duplicate→RGBA8→get_data→처리)
## B. 드랍 빔 마스크: 예열 커널 == configure 순서(RGBA8 변환 → _mask_black)
## C. 인트로 컷 이미지 작업표 경로 == story begin 경로 규칙, 로딩 화면 이미지 경로 규칙
## 입력 이미지는 res:// 원본 PNG를 Image.load_from_file로 읽는다(헤드리스 텍스처는 get_image가 비어 있음).
const USERDIR := "EXODUSER-pc-boot01-Isolated-20261022"
var checks := 0
var failures := 0

func check(ok: bool, name: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCBOOT01_FAIL ", name)

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		print("PCBOOT01_FAIL isolation ", OS.get_user_data_dir())
		quit(2)
		return
	var World: Script = load("res://scripts/world.gd")
	var jobs: Array = World.native_boot_prewarm_jobs({})
	check(jobs.size() > 0, "world_jobs_present")
	var compared := 0
	for job in jobs:
		var img := Image.load_from_file(ProjectSettings.globalize_path(job.path))
		if img == null or img.is_empty():
			check(false, "world_job_image:" + job.path)
			continue
		# 기존 동기 경로
		var pixels := img.duplicate() as Image
		pixels.convert(Image.FORMAT_RGBA8)
		var expected: PackedByteArray = World.native_source_onload_rgba(job.kind, pixels.get_data(), pixels.get_width(), pixels.get_height(), job.amount)
		# 예열 커널(워커 스레드에서 도는 함수)
		var got: Dictionary = World.native_boot_prewarm_kernel(img.duplicate(), job)
		check(got.w == pixels.get_width() and got.h == pixels.get_height(), "world_dims:" + job.key)
		check(got.rgba == expected, "world_bytes:" + job.key)
		compared += 1
	# 처리 함수가 실제로 바꾸는지(빈 처리 방지): hard_alpha 바이트 예
	var probe := PackedByteArray([10, 20, 30, 254, 10, 20, 30, 255])
	check(World.native_source_onload_rgba("hard_alpha", probe, 2, 1, 0.0) == PackedByteArray([10, 20, 30, 0, 10, 20, 30, 255]), "hard_alpha_rule")
	var white := PackedByteArray([250, 250, 250, 255, 100, 100, 100, 255])
	check(World.native_source_onload_rgba("white_bg", white, 2, 1, 0.0) == PackedByteArray([250, 250, 250, 0, 100, 100, 100, 255]), "white_bg_rule")
	var Drops: Script = load("res://scripts/native_world_drops.gd")
	var drop_jobs: Array = Drops.native_boot_prewarm_jobs({})
	check(drop_jobs.size() == 2, "drop_jobs_two_frames")
	for job in drop_jobs:
		var src := Image.load_from_file(ProjectSettings.globalize_path(job.path))
		var expected_img := src.duplicate() as Image
		expected_img.convert(Image.FORMAT_RGBA8)
		Drops._mask_black(expected_img)
		var got_img: Image = Drops.native_boot_prewarm_kernel(src.duplicate(), job)
		check(got_img.get_data() == expected_img.get_data(), "drops_bytes:" + job.path)
	var Story: Script = load("res://scripts/native_story_intro.gd")
	var root := "C:/fake/root"
	var story_jobs: Array = Story.native_boot_prewarm_jobs({"story_source_root": root})
	check(story_jobs.size() == 21, "story_jobs_21_images")
	var ok_paths := true
	for job in story_jobs:
		ok_paths = ok_paths and job.path.begins_with(root.path_join("assets/cutscene/images/")) and job.key == Story.BOOT_PREWARM_KEY + job.path and job.output == "texture"
	check(ok_paths, "story_paths_match_begin_rule")
	var Loading: Script = load("res://scripts/native_boot_loading_screen.gd")
	var lp: String = Loading.image_path(root)
	check(lp.begins_with(root.path_join("img/lording/")) and lp.ends_with(".png") and Loading.image_path(root) == lp, "loading_image_session_pick")
	var idx := int(lp.get_file().get_basename())
	check(idx >= 1 and idx <= 19, "loading_image_index_1_19")
	print("PCBOOT01_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "world_jobs": jobs.size(), "world_compared": compared}))
	quit(0 if failures == 0 else 1)
