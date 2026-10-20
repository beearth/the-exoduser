extends SceneTree
## P2-001j — 커튼 직후 패링 레슨 흐름 + 업데이트 시계 개통 회귀 (실제 Main 부팅).
## 원본: update() 32107 systemLesson.tick(반환 무시) → 32108 if(!G.on)return →
## 32111 if(_parryLesson.tick())return → ... → 32742 stageTime/playTime.
## 레슨 트리거(parry-lesson.js 468~474: 커튼 정리(G._intro=null) 후 자동 start) →
## intro 패널 → 스킵(skipAll) → finish 복원 → 이후 시계가 stage_play_time까지 도달해
## G.stageTime이 늘고 HUD 타이머(60336 mm:ss)가 움직인다.
const USERDIR = "EXODUSER-P2001J-Isolated-20261020"
const GROUPS = ["lesson_auto_start_after_curtain", "lesson_skip_restores", "clock_reaches_stage_time"]

var active_main: Node
var sequence: Node2D
var flow: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2001J_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001J_GROUP ", JSON.stringify(row))
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	# QA-004: Main 해제 후 AudioServer mix/main-thread 종료 정리 기회(QA-003 방식).
	for _frame in range(12):
		await process_frame
	var _qa004_exit_after_ms: int = Time.get_ticks_msec() + 200
	while Time.get_ticks_msec() < _qa004_exit_after_ms:
		await process_frame
	print("P2001J_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001J_FAIL ", current_group, " ", label)

func _clock_last() -> Dictionary:
	return active_main.get_native_source_clock_input_snapshot().get("update_clock_result", {}).get("last", {})

func _test_lesson_auto_start_after_curtain() -> void:
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return
	active_main = packed.instantiate()
	active_main.set_meta("native_intro_boot", "intro")
	root.add_child(active_main)
	for i in range(8):
		await physics_frame
	sequence = active_main.get("source_intro_sequence")
	_check(is_instance_valid(sequence), "intro sequence installed at boot")
	if not is_instance_valid(sequence):
		return
	flow = sequence.get("lesson_flow")
	_check(is_instance_valid(flow), "lesson flow owner installed on intro boot path (32111)")
	if not is_instance_valid(flow):
		return
	# 커튼 오픈: 가이드 스킵 (63342)
	sequence.finish_native_guide()
	for i in range(6):
		await process_frame
	_check(flow.get("active") == false, "lesson blocked while G._intro truthy (471 gate, dispose 전)")
	var ring_before: int = active_main.get("world").get_enemies().size()
	_check(ring_before == 5, "five ring enemies present before lesson")
	observations["lmb_before_lesson"] = active_main.get("source_state").read_current_p().get("activeLMBSk")
	# dispose(+900ms, 63436~63440) 후 레슨 자동 시작 대기 (최대 4초 벽시계)
	var deadline: int = Time.get_ticks_msec() + 4000
	while Time.get_ticks_msec() < deadline and flow.get("active") != true:
		await process_frame
	_check(flow.get("active") == true and flow.get("phase") == "intro",
		"lesson auto-starts after curtain dispose (468~474 -> start 386)")
	_check(active_main.get("world").get_enemies().is_empty(),
		"lesson start saves+clears live enemies (398~400 saved.ens/ens=[])")
	_check(sequence.get("bonfire")["active"] == false, "lesson nulls bonfire while active (400~401)")
	var p: Variant = active_main.get("source_state").read_current_p()
	_check(p is Dictionary and p.get("activeLMBSk") == "kiSlash", "lesson forces P.activeLMBSk='kiSlash' (396)")
	_check(flow.has_node("NativeParryLessonPanel"), "lesson intro panel shown (원본 텍스트)")
	# 레슨 중: 클록은 parry_lesson에서 RETURNED(32111의 return) → stageTime 동결.
	# (커튼 오픈~레슨 시작 사이 구간은 원본도 stageTime이 진행 — 동결은 레슨 활성 중만.)
	for i in range(5):
		await process_frame
	var stage_time_frozen: float = float(active_main.get("source_state").read_current_g().get("stageTime", 0))
	for i in range(30):
		await process_frame
	var last: Dictionary = _clock_last()
	_check(last.get("phase") == "parry_lesson" and last.get("status") == "RETURNED",
		"update clock RETURNED at parry_lesson while active (32111)")
	var g2: Variant = active_main.get("source_state").read_current_g()
	_check(float(g2.get("stageTime", 0)) == stage_time_frozen,
		"G.stageTime frozen during lesson (32742 unreachable)")
	observations["clock_during_lesson"] = last

func _test_lesson_skip_restores() -> void:
	if not is_instance_valid(flow) or flow.get("active") != true:
		return
	flow.skip_all() # 105 '연습 건너뛰기' → finish 685~700
	for i in range(4):
		await process_frame
	_check(flow.get("active") == false and flow.get("seen") == true,
		"skip finishes lesson; seen blocks restart (393/468~470)")
	var enemies: Array = active_main.get("world").get_enemies()
	var ring := 0
	for enemy in enemies:
		if str(enemy.get("data")["id"]).begins_with("ch1_curtain_ring_"):
			ring += 1
	_check(enemies.size() == 5 and ring == 5, "finish restores the saved five ring enemies (689)")
	_check(sequence.get("bonfire")["active"] == true, "finish restores bonfire fields (691)")
	var p: Variant = active_main.get("source_state").read_current_p()
	_check(p is Dictionary and p.get("activeLMBSk") == observations.get("lmb_before_lesson"),
		"finish restores activeLMBSk snapshot (697, 레슨 전 값으로)")
	_check(not flow.has_node("NativeParryLessonPanel"), "lesson panel removed on finish")
	for i in range(10):
		await process_frame
	_check(flow.native_lesson_tick() == false, "tick stays false after seen (469)")

func _test_clock_reaches_stage_time() -> void:
	if not is_instance_valid(active_main):
		return
	var state: Node = active_main.get("source_state")
	var t0: float = float(state.read_current_g().get("stageTime", 0))
	for i in range(90):
		await process_frame
	var last: Dictionary = _clock_last()
	_check(last.get("phase") == "stage_play_time" and last.get("status") == "CONTINUE",
		"pipeline reaches phase_stage_play_time (32742) after lesson")
	var g: Variant = state.read_current_g()
	var t1: float = float(g.get("stageTime", 0))
	_check(t1 > t0, "G.stageTime advances (32742, +sp per update)")
	_check(float(g.get("playTime", 0)) > 0.0, "G.playTime advances (32742)")
	observations["stage_time_delta"] = t1 - t0
	# HUD 타이머(60336 mm:ss = ~~(stageTime/60)) — 라벨이 00:00에서 움직일 때까지
	var hud: Node = active_main.get("hud")
	var deadline: int = Time.get_ticks_msec() + 6000
	var label_text := "00:00"
	while Time.get_ticks_msec() < deadline:
		await process_frame
		var label: Variant = hud.get("_stage_timer_label")
		if label is Label:
			label_text = str(label.text)
			if not label_text.begins_with("00:00"):
				break
	_check(not label_text.begins_with("00:00"), "HUD stage timer ticks past 00:00 (60336)")
	observations["hud_timer"] = label_text
	observations["clock_after_lesson"] = last
