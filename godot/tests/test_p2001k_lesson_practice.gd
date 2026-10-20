extends SceneTree
## P2-001k — 레슨 패널 디자인 계약 + 연습 본문(-3/-2/-1) 회귀 (실제 Main 부팅).
## 패널: UI_FOUNDATION parryLesson 계약 + 웹 실측(lesson_styles.json) 스팟 체크.
## 연습: beginPractice(177) → -3 이동 120(512~515) → -2 기검참 10+풀차지(651/671,
## hurtE 42111 위임 포함) → -1 마법 5(652/672) → step 8(501 순서) 실제 가시덫 대기
## (시전·처치·탈출 전 자동 성공 금지) → 스킵 복원.
const USERDIR = "EXODUSER-P2001K-Isolated-20261020"
const HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const GROUPS = ["panel_design_contract", "practice_basic_steps", "halt_and_skip_restore"]

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
			print("P2001K_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001K_GROUP ", JSON.stringify(row))
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	print("P2001K_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001K_FAIL ", current_group, " ", label)

func _panel_root() -> Control:
	if not is_instance_valid(flow) or not flow.has_node("NativeParryLessonPanel"):
		return null
	return flow.get_node("NativeParryLessonPanel").get_node_or_null("LessonRoot")

func _lesson_enemy() -> Node2D:
	for enemy in flow.get("attack_enemies"):
		if is_instance_valid(enemy) and enemy.get("alive") == true:
			return enemy
	return null

func _test_panel_design_contract() -> void:
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
	flow = sequence.get("lesson_flow") if is_instance_valid(sequence) else null
	_check(is_instance_valid(flow), "lesson flow installed")
	if not is_instance_valid(flow):
		return
	sequence.finish_native_guide()
	var deadline: int = Time.get_ticks_msec() + 4000
	while Time.get_ticks_msec() < deadline and flow.get("active") != true:
		await process_frame
	_check(flow.get("active") == true and flow.get("phase") == "intro", "lesson auto-starts to intro")
	var lesson_root: Control = _panel_root()
	_check(lesson_root != null, "panel root present")
	if lesson_root == null:
		return
	# 실측: 우측 400px(우여백 56), 패딩 68/24/20 — anchors/offsets
	_check(lesson_root.anchor_left == 1.0 and lesson_root.offset_left == -456.0
		and lesson_root.offset_right == -56.0 and lesson_root.offset_top == 16.0,
		"panel geometry matches web rect (x1464 w400 top16)")
	var has_frame := false
	var has_crest := false
	var has_bg := false
	for child in lesson_root.get_children():
		if child is NinePatchRect and (child as NinePatchRect).patch_margin_left == 18:
			has_frame = true
		if child is TextureRect and child.get("texture") is Texture2D \
				and absf((child as TextureRect).offset_right - (child as TextureRect).offset_left - 174.0) < 0.5:
			has_crest = true
		if child is ColorRect and (child as ColorRect).color.is_equal_approx(Color(16.0 / 255.0, 13.0 / 255.0, 14.0 / 255.0, 0.96)):
			has_bg = true
	_check(has_frame, "frame.png 9-slice border 18px (실측 ::before border-image)")
	_check(has_crest, "crest 174x58 top6 (UI_FOUNDATION)")
	_check(has_bg, "inner bg rgba(16,13,14,.96) (실측 ::before)")
	var backdrop_found := false
	for child in flow.get_node("NativeParryLessonPanel").get_children():
		if child is ColorRect and is_equal_approx((child as ColorRect).color.a, 0.5):
			backdrop_found = true
	_check(backdrop_found, "backdrop opacity .5 (UI_FOUNDATION)")
	var ui: Dictionary = flow.get("_ui")
	_check((ui["title"] as Label).get_theme_font_size("font_size") == 29
		and (ui["title"] as Label).get_theme_color("font_color").is_equal_approx(Color(0xf4 / 255.0, 0xe6 / 255.0, 0xd2 / 255.0)),
		"title 29px #f4e6d2 (실측)")
	_check((ui["keycap"] as Label).get_theme_font_size("font_size") == 28, "keycap 28px (실측 Cinzel 28)")
	_check((ui["rows"] as Array).size() == 12, "checklist 12 rows (basic 4 + labels 8)")
	_check((ui["button"] as Button).text == "W / A / S / D 또는 클릭하여 시작"
		and (ui["button"] as Button).custom_minimum_size.y == 44.0, "start button text/min44 (146~147)")
	_check(flow.get("_font") != null, "serif font loaded (NotoSerifKR — 나눔명조 대체 기록)")
	observations["panel_children"] = lesson_root.get_child_count()

func _test_practice_basic_steps() -> void:
	if not is_instance_valid(flow) or flow.get("active") != true:
		return
	flow.begin_practice()
	_check(flow.get("phase") == "practice" and int(flow.get("step")) == -3, "beginPractice -> step -3 (177)")
	var player: Node2D = active_main.get("player")
	# -3: 이동 120px (512~515) — 이동 증인(velocity)과 위치 증분
	for i in range(80):
		player.set("velocity", Vector2(150, 0))
		player.global_position += Vector2(2.0, 0)
		await process_frame
		if int(flow.get("step")) != -3 or flow.get("pending") != "":
			break
	var deadline: int = Time.get_ticks_msec() + 5000
	while Time.get_ticks_msec() < deadline and int(flow.get("step")) == -3:
		await process_frame
	_check(flow.get("movement_done") == true, "move distance 120 completes step -3 (514)")
	_check(int(flow.get("step")) == -2, "advance -3 -> -2 (501)")
	_check(int(flow.call("_alive_attack_enemies")) == 3, "three lesson enemies spawned (237 cap 3)")
	# 스폰 journal: mkEn draw 순서(커튼과 동일 미러)
	var journal: Array = flow.get("spawn_journal")
	_check(journal.size() >= 3, "lesson spawn journal filled")
	if journal.size() > 0:
		var purposes: Array = []
		for d in journal[0]["draws"]:
			purposes.append(d["purpose"])
		_check(purposes[0] == "rollElite" and purposes.slice(purposes.size() - 6) == ["spd", "r", "st2", "facing", "projT", "bossPatT"],
			"mkEn draw order mirrored for lesson spawns (31120~)")
	# 42111 위임: 실제 hurtE 경로 1회 — outcome.lesson_delegated
	var target: Node2D = _lesson_enemy()
	_check(target != null, "lesson enemy available")
	if target != null:
		var holder_status: Dictionary = active_main.get("source_lesson").read_active_status()
		observations["holder_status"] = {"authority": holder_status.get("authority"), "active": holder_status.get("active"), "ready": holder_status.get("ready"), "reason": holder_status.get("reason")}
		observations["provider_status"] = active_main.get("source_initialization_services").read_normal_enemy_parry_lesson_active()
		var outcome: Dictionary = HURTE.new().execute(active_main, active_main.get("world"), target, 50,
			0.0, 0, {"poiseHit": true, "kbMult": 0.5, "noImpact": true, "_lessonAttack": "kiSlash",
				"_lessonFullCharge": false, "_kiFull": false})
		observations["hurte_outcome"] = {"keys": outcome.keys(), "reason": outcome.get("reason"), "returned_at": outcome.get("returned_at"), "halted_at": outcome.get("halted_at"), "ok": outcome.get("ok")}
		_check(outcome.get("lesson_delegated") == true and int(outcome.get("returned_at", 0)) == 42111,
			"hurtE delegates to lesson at 42111 while active")
		_check(target.get("alive") == false, "lesson kill applied by lesson owner (664 e.hp=0)")
	# 나머지 좌클릭 처치(풀차지 1 포함) — 651/671
	var guard := 0
	while int(flow.get("step")) == -2 and guard < 40:
		guard += 1
		var enemy: Node2D = _lesson_enemy()
		if enemy == null:
			await process_frame
			continue
		var full: bool = int(flow.get("left_kills")) == 9 and not flow.get("left_full_charge_kill")
		flow.native_lesson_hurt_enemy(enemy, 50, 0.0,
			{"_lessonAttack": "kiSlash", "_lessonFullCharge": full, "_kiFull": full})
		await process_frame
	var step_deadline: int = Time.get_ticks_msec() + 5000
	while Time.get_ticks_msec() < step_deadline and int(flow.get("step")) == -2:
		await process_frame
	_check(flow.get("left_click_done") == true and flow.get("left_full_charge_kill") == true,
		"10 kiSlash kills + full-charge kill complete step -2 (671)")
	_check(int(flow.get("step")) == -1, "advance -2 -> -1 (501)")
	# -1: 마법 5 (652/672) — magic+fireball opts만 인정
	var rejected: Dictionary = flow.native_lesson_hurt_enemy(_lesson_enemy(), 50, 0.0, {"_lessonAttack": "weapon"})
	_check(rejected.get("handled") != true, "step -1 rejects non-magic credit (652 gate)")
	guard = 0
	while int(flow.get("step")) == -1 and guard < 30:
		guard += 1
		var enemy: Node2D = _lesson_enemy()
		if enemy == null:
			await process_frame
			continue
		flow.native_lesson_hurt_enemy(enemy, 50, 0.0, {"magic": true, "fireball": true})
		await process_frame
	step_deadline = Time.get_ticks_msec() + 5000
	while Time.get_ticks_msec() < step_deadline and int(flow.get("step")) == -1:
		await process_frame
	_check(flow.get("right_click_done") == true and int(flow.get("right_kills")) >= 5,
		"5 magic kills complete step -1 (672~676)")
	observations["metrics_after_basics"] = flow.get_snapshot()["metrics"]

func _test_halt_and_skip_restore() -> void:
	if not is_instance_valid(flow):
		return
	_check(int(flow.get("step")) == 8, "order -1 -> 8 spike trap next (501)")
	_check(str(flow.get("practice_halted")) == "" and (flow.get("trap_enemies") as Array).size() == 10,
		"step 8 starts real trap practice with 10 enemies (261~280)")
	var ui: Dictionary = flow.get("_ui")
	_check((ui["keycap"] as Label).text == "1 + W A S D" and (ui["subtitle"] as Label).text.begins_with("4 / 12"),
		"step 8 panel content (298 keycap, 4/12)")
	var step_before: int = int(flow.get("step"))
	for i in range(40):
		await process_frame
	_check(int(flow.get("step")) == step_before and flow.get("active") == true,
		"no automatic completion without trap kills and escape (296)")
	flow.skip_all()
	for i in range(4):
		await process_frame
	_check(flow.get("active") == false and flow.get("seen") == true, "skip finishes lesson")
	var enemies: Array = active_main.get("world").get_enemies()
	var ring := 0
	var lesson_left := 0
	for enemy in enemies:
		var id := str(enemy.get("data")["id"])
		if id.begins_with("ch1_curtain_ring_"):
			ring += 1
		if id.begins_with("lesson_attack_") and enemy.get("alive") == true:
			lesson_left += 1
	_check(ring == 5 and lesson_left == 0, "finish restores 5 ring, lesson enemies cleared (689)")
	observations["final_metrics"] = flow.get_snapshot()["metrics"]
