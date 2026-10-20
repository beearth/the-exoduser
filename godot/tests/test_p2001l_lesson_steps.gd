extends SceneTree
## P2-001l — 연습 step 0 실구현 + 1~7 정직 정지 + allows 입력 게이트 (실제 Main 부팅).
## step 0: spawnParryEnemy(182~196)/tickParryEnemy(204~229) — 8각 280px·차징 60틱·암흑탄,
## 판정은 기존 Q 패링 시스템 실이벤트 구독만(q_projectile_reflected, 반사 블루빈 실처치).
## 1~7: 해당 탄/행동 미이식 → STEP_HALTS 사유로 정직 정지(가짜 진행 금지).
## allows(32): player.handle_native_input_event 입력 퍼널에 단계 허용 외 차단.
## step 8(가시덫): main 0779085bd 병합으로 실구현 — 실제 키1 시전·DOT 처치·탈출로 전진.
const USERDIR = "EXODUSER-P2001L-Isolated-20261020"
const GROUPS = ["allows_input_gate", "step0_parry_kill", "halted_steps_and_restore"]

var active_main: Node
var sequence: Node2D
var flow: Node
var player: Node2D
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
			print("P2001L_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001L_GROUP ", JSON.stringify(row))
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	print("P2001L_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001L_FAIL ", current_group, " ", label)

func _action_event(action: String, pressed: bool) -> InputEventAction:
	var event := InputEventAction.new()
	event.action = action
	event.pressed = pressed
	return event

func _press_parry() -> void:
	Input.parse_input_event(_action_event("parry", true))

func _release_parry() -> void:
	Input.parse_input_event(_action_event("parry", false))

func _boot() -> bool:
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return false
	active_main = packed.instantiate()
	active_main.set_meta("native_intro_boot", "intro")
	root.add_child(active_main)
	for i in range(8):
		await physics_frame
	sequence = active_main.get("source_intro_sequence")
	flow = sequence.get("lesson_flow") if is_instance_valid(sequence) else null
	player = active_main.get("player")
	_check(is_instance_valid(flow), "lesson flow installed")
	if not is_instance_valid(flow):
		return false
	sequence.finish_native_guide()
	var deadline: int = Time.get_ticks_msec() + 4000
	while Time.get_ticks_msec() < deadline and flow.get("active") != true:
		await process_frame
	_check(flow.get("active") == true and flow.get("phase") == "intro", "lesson auto-starts to intro")
	return flow.get("active") == true

func _test_allows_input_gate() -> void:
	if not await _boot():
		return
	# intro: 방향 외 전부 차단(32 allows — intro는 방향도 차단이나 allowKey가 beginPractice 처리)
	var blocked: Dictionary = player.handle_native_input_event(_action_event("weapon", true))
	_check(blocked.get("handled") == true and str(blocked.get("reason")) == "parry_lesson_input_locked",
		"intro blocks weapon via funnel gate (32 allows)")
	var intro_move: Dictionary = player.handle_native_input_event(_action_event("move_left", true))
	_check(str(intro_move.get("reason")) == "parry_lesson_input_locked",
		"intro blocks direction too (phase=='intro' — 32)")
	flow.begin_practice()
	_check(int(flow.get("step")) == -3, "beginPractice -> step -3")
	# practice step -3: actions()=[] — 방향만 통과, weapon/parry 차단
	var move_ok: Dictionary = player.handle_native_input_event(_action_event("move_right", true))
	_check(move_ok.get("handled") == true and move_ok.get("accepted") == true,
		"practice allows direction (isDirection pass)")
	player.handle_native_input_event(_action_event("move_right", false))
	var weapon_blocked: Dictionary = player.handle_native_input_event(_action_event("weapon", true))
	_check(str(weapon_blocked.get("reason")) == "parry_lesson_input_locked"
		and player.get("_native_input_held").get("weapon", false) == false,
		"step -3 blocks weapon + held cleared (stuck-key 방지)")
	var parry_blocked: Dictionary = player.handle_native_input_event(_action_event("parry", true))
	_check(str(parry_blocked.get("reason")) == "parry_lesson_input_locked", "step -3 blocks parry")
	# step -2: actions()=['weapon'] — weapon 통과, parry 차단
	flow.set("step", -2)
	var weapon_ok: Dictionary = player.handle_native_input_event(_action_event("weapon", true))
	_check(weapon_ok.get("handled") == true and str(weapon_ok.get("reason")) != "parry_lesson_input_locked",
		"step -2 allows weapon")
	player.handle_native_input_event(_action_event("weapon", false))
	_check(str(player.handle_native_input_event(_action_event("parry", true)).get("reason")) == "parry_lesson_input_locked",
		"step -2 still blocks parry")
	# step 0: actions()=['parry','shield'] — parry 통과, weapon 차단
	flow.set("step", 0)
	var parry_ok: Dictionary = player.handle_native_input_event(_action_event("parry", true))
	_check(parry_ok.get("handled") == true and str(parry_ok.get("reason")) != "parry_lesson_input_locked",
		"step 0 allows parry (port action parry -> web parry)")
	player.handle_native_input_event(_action_event("parry", false))
	var shield_ok: Dictionary = player.handle_native_input_event(_action_event("shield_bash", true))
	_check(str(shield_ok.get("reason")) != "parry_lesson_input_locked",
		"step 0 allows shield_bash (port shield_bash -> web shield)")
	player.handle_native_input_event(_action_event("shield_bash", false))
	_check(str(player.handle_native_input_event(_action_event("weapon", true)).get("reason")) == "parry_lesson_input_locked",
		"step 0 blocks weapon")
	_check(str(player.handle_native_input_event(_action_event("native_magic", true)).get("reason")) == "parry_lesson_input_locked",
		"step 0 blocks native_magic (web beam)")
	flow.set("step", -3)
	# allowKey(40): 스킬 캐스트 키는 step 8 외 차단 — 실제 시전이 안 일어나는지 관측
	var slots: Node = active_main.get("world").get_node_or_null("NativeSkillSlots")
	var cast_log_before: int = (slots.get("_cast_log") as Array).size() if is_instance_valid(slots) else -1
	Input.parse_input_event(_action_event("skill_slot_1", true))
	Input.parse_input_event(_action_event("skill_slot_1", false))
	for i in range(3):
		await process_frame
	var cast_log_after: int = (slots.get("_cast_log") as Array).size() if is_instance_valid(slots) else -1
	_check(cast_log_before == cast_log_after, "skill_slot_1 blocked outside step 8 (allowKey 40)")
	observations["gate_checked_actions"] = ["weapon", "parry", "shield_bash", "native_magic", "move_left", "move_right", "skill_slot_1"]

func _test_step0_parry_kill() -> void:
	if not is_instance_valid(flow) or flow.get("active") != true:
		return
	# 기본 3스텝 실크레딧 고속 통과(-3 이동, -2/-1은 42111 위임 경로 — K 테스트가 상세 검증)
	var player_node: Node2D = player
	for i in range(80):
		player_node.set("velocity", Vector2(150, 0))
		player_node.global_position += Vector2(2.0, 0)
		await process_frame
		if int(flow.get("step")) != -3 or flow.get("pending") != "":
			break
	var deadline: int = Time.get_ticks_msec() + 5000
	while Time.get_ticks_msec() < deadline and int(flow.get("step")) == -3:
		await process_frame
	for target_step in [-2, -1]:
		var guard := 0
		while int(flow.get("step")) == target_step and guard < 60:
			guard += 1
			var enemy: Node2D = _lesson_enemy()
			if enemy == null:
				await process_frame
				continue
			if target_step == -2:
				var full: bool = int(flow.get("left_kills")) == 9 and not flow.get("left_full_charge_kill")
				flow.native_lesson_hurt_enemy(enemy, 50, 0.0,
					{"_lessonAttack": "kiSlash", "_lessonFullCharge": full, "_kiFull": full})
			else:
				flow.native_lesson_hurt_enemy(enemy, 50, 0.0, {"magic": true, "fireball": true})
			await process_frame
		deadline = Time.get_ticks_msec() + 5000
		while Time.get_ticks_msec() < deadline and int(flow.get("step")) == target_step:
			await process_frame
	_check(int(flow.get("step")) == 8, "basics done, at step 8 (501 order -1 -> 8)")
	_check(str(flow.get("practice_halted")) == "", "step 8 trap practice starts (261~266)")
	var ui8: Dictionary = flow.get("_ui")
	_check((ui8["keycap"] as Label).text == "1 + W A S D", "step 8 keycap (298)")
	# 267~280 스폰: 10마리·hp>1·eShield=hp·반경 300 이내·추격
	deadline = Time.get_ticks_msec() + 8000
	while Time.get_ticks_msec() < deadline and (flow.get("trap_enemies") as Array).size() < 10:
		await process_frame
	var trap_list: Array = flow.get("trap_enemies")
	_check(trap_list.size() == 10, "10 trap enemies spawned (269)")
	var spawn_ok := true
	for trap_enemy in trap_list:
		if not is_instance_valid(trap_enemy):
			spawn_ok = false
			continue
		if float(trap_enemy.get("hp")) <= 1.0 or float(trap_enemy.get("eShield")) <= 0.0:
			spawn_ok = false
		if trap_enemy.global_position.distance_to(player_node.global_position) > 320.0:
			spawn_ok = false
	_check(spawn_ok, "trap enemies hp staggered + eShield + within 300 (273~276)")
	# 실제 키1 시전(스킬 소유자 native_skill_slots, 구독만) → 존 생성
	Input.parse_input_event(_action_event("skill_slot_1", true))
	Input.parse_input_event(_action_event("skill_slot_1", false))
	deadline = Time.get_ticks_msec() + 5000
	while Time.get_ticks_msec() < deadline and flow.get("trap_zone") == null:
		await process_frame
	_check(flow.get("trap_zone") != null, "spike trap zone cast + observed (286)")
	# 287 탈출: 방향키 hold + 실제 120px 이탈
	Input.parse_input_event(_action_event("move_left", true))
	for i in range(120):
		player_node.global_position += Vector2(-2.0, 0)
		await process_frame
		if flow.get("trap_escaped") == true:
			break
	Input.parse_input_event(_action_event("move_left", false))
	_check(flow.get("trap_escaped") == true, "escape detected (287 held+120px)")
	# DOT 실처치(42111 위임 trap 분기) → 10킬 + 탈출 → completeStep → 0
	deadline = Time.get_ticks_msec() + 60000
	while Time.get_ticks_msec() < deadline and int(flow.get("step")) == 8:
		if flow.get("trap_zone") == null or (flow.get("trap_zone") is Dictionary 				and float((flow.get("trap_zone") as Dictionary).get("t", 0)) >= float((flow.get("trap_zone") as Dictionary).get("maxT", 1))):
			Input.parse_input_event(_action_event("skill_slot_1", true)) # 재시전(288 쿨 0 유지)
			Input.parse_input_event(_action_event("skill_slot_1", false))
		await process_frame
	_check(int(flow.get("trap_kills")) >= 10, "10 trap kills via real DOT (683)")
	_check(flow.get("spike_trap_done") == true, "spikeTrapDone set (428)")
	observations["trap_kills"] = flow.get("trap_kills")
	_check(int(flow.get("step")) == 0 and flow.get("phase") == "practice",
		"advance 8 -> 0 via real 501 advance")
	_check(str(flow.get("practice_halted")) == "", "step 0 not halted (실구현)")
	# 패널: updateParryPractice(181~186) 텍스트
	var ui: Dictionary = flow.get("_ui")
	_check((ui["title"] as Label).text == "마법탄을 패링해 몬스터를 처치하세요", "step 0 title (182)")
	_check((ui["keycap"] as Label).text == "Q", "step 0 keycap Q (118 key())")
	_check((ui["hint"] as Label).text.contains("패링으로 탄을 되돌려"), "step 0 hint pre-parry line (186)")
	# spawnParryEnemy: 반경 280(160~450 수용)·hp1·spd0
	deadline = Time.get_ticks_msec() + 4000
	while Time.get_ticks_msec() < deadline and not is_instance_valid(flow.get("parryEnemy")):
		await process_frame
	var parry_enemy: Node2D = flow.get("parryEnemy")
	_check(is_instance_valid(parry_enemy), "parry enemy spawned (182~)")
	if not is_instance_valid(parry_enemy):
		return
	var distance: float = parry_enemy.global_position.distance_to(player_node.global_position)
	_check(distance >= 160.0 and distance <= 450.0, "spawn distance in 160~450 (188 reject band)")
	_check(int(parry_enemy.get("hp")) == 1 and parry_enemy.get("alive") == true, "parry enemy hp1 (196)")
	# 쿨다운 45 → 차징 60 → 발사(228/221~226): 실프레임 대기
	deadline = Time.get_ticks_msec() + 8000
	while Time.get_ticks_msec() < deadline and not is_instance_valid(flow.get("parry_shot")):
		await process_frame
	var shot: Node2D = flow.get("parry_shot")
	_check(is_instance_valid(shot), "lesson dark shot fired after cooldown+charge (221~226)")
	if not is_instance_valid(shot):
		return
	var raw: Dictionary = shot.get("_raw")
	_check(raw.get("gbBean") == true and raw.get("_lessonShot") == true and int(shot.get("damage")) == 0,
		"shot carrier gbBean + _lessonShot + dmg0 (226)")
	observations["shot_speed"] = float(shot.get("speed"))
	# 실 Q 패링: 탄 근접 시 parry 액션 실입력 — 반사·처치는 기존 시스템이 수행(구독만).
	# 반사 블루가 빗나가면 레슨이 재장전(211~213 cooldown 60)하므로 step 0이 끝날 때까지
	# 새 적탄마다 재패링한다(원본도 성공까지 반복하는 연습 설계).
	var parry_attempts := 0
	var reflected_observed := false
	deadline = Time.get_ticks_msec() + 90000
	while Time.get_ticks_msec() < deadline and int(flow.get("step")) == 0:
		reflected_observed = reflected_observed or flow.get("shot_reflected") == true
		var current_shot: Variant = flow.get("parry_shot")
		if is_instance_valid(current_shot) and flow.get("shot_reflected") != true:
			var shot_distance: float = (current_shot as Node2D).global_position.distance_to(player_node.global_position)
			if shot_distance < 90.0:
				parry_attempts += 1
				_press_parry()
				for i in range(6):
					await process_frame
				_release_parry()
				for i in range(3):
					await process_frame
				continue
		await process_frame
	reflected_observed = reflected_observed or flow.get("shot_reflected") == true
	observations["parry_attempts"] = parry_attempts
	_check(reflected_observed, "real Q parry observed (q_projectile_reflected 구독)")
	var checks: Array = flow.get("checks")
	_check(checks[0] == true, "step 0 check marked (432)")
	_check(int(flow.get("step")) == 1, "reflected kill completes step 0 -> 1 (682/501)")
	observations["step0_metrics"] = flow.get_snapshot().get("metrics")

func _test_halted_steps_and_restore() -> void:
	if not is_instance_valid(flow) or flow.get("active") != true:
		return
	# step 1 도달 직후: 물리탄 반사 캐리어 미이식 → 정직 정지
	_check(str(flow.get("practice_halted")) == "physical_projectile_reflect_unported",
		"step 1 halts (E 반사는 gbBean 한정 — enemy_projectile.gd 134)")
	var step_before: int = int(flow.get("step"))
	for i in range(40):
		await process_frame
	_check(int(flow.get("step")) == step_before and flow.get("parryEnemy") == null,
		"no fake progression / no spawn while halted")
	# 2~7 정지 사유·패널 콘텐츠 표(미이식 단계 — 하니스 주입 전진, 501 실코드 경유)
	var expected_halts := {2: "volley_mixed_magic_projectiles_unported", 3: "volley_physical_projectiles_unported",
		4: "chain_movement_unported", 5: "lightning_dash_unported", 6: "rage_gauge_unported", 7: "rage_burst_unported"}
	var expected_keys := {2: "Q", 3: "E", 4: "SHIFT", 5: "↔ + SPACE", 6: "Q", 7: "SPACE"}
	var ui: Dictionary = flow.get("_ui")
	for next_step in [2, 3, 4, 5, 6, 7]:
		flow.set("pending", "success")
		var deadline: int = Time.get_ticks_msec() + 6000
		while Time.get_ticks_msec() < deadline and int(flow.get("step")) != next_step:
			await process_frame
		_check(int(flow.get("step")) == next_step, "advance to step %d" % next_step)
		_check(str(flow.get("practice_halted")) == str(expected_halts[next_step]),
			"step %d halt reason" % next_step)
		_check((ui["keycap"] as Label).text == str(expected_keys[next_step]),
			"step %d keycap (118)" % next_step)
		_check((ui["title"] as Label).text != "" and (ui["hint"] as Label).text != "",
			"step %d title/tips rendered (139~143)" % next_step)
	observations["step7_subtitle"] = (ui["subtitle"] as Label).text
	# 게이트: 레슨 종료 후 입력 전부 통과
	flow.skip_all()
	for i in range(4):
		await process_frame
	_check(flow.get("active") == false and flow.get("seen") == true, "skip finishes lesson")
	var after: Dictionary = player.handle_native_input_event(_action_event("weapon", true))
	_check(str(after.get("reason")) != "parry_lesson_input_locked", "gate inactive after finish")
	player.handle_native_input_event(_action_event("weapon", false))
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
	observations["final_metrics"] = flow.get_snapshot().get("metrics")

func _lesson_enemy() -> Node2D:
	for enemy in flow.get("attack_enemies"):
		if is_instance_valid(enemy) and enemy.get("alive") == true:
			return enemy
	return null
