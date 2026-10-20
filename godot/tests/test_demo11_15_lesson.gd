extends "res://tests/test_p2001l_lesson_steps.gd"
## 신규 포트의 fixture 성공은 PC 실제 전투 성공으로 집계하지 않는다.
const NEW_USERDIR := "EXODUSER-demo11-15-Isolated-20261021"
const Steps := preload("res://scripts/native_demo11_lesson_steps.gd")
class ContractFixture:
	extends "res://scripts/native_demo11_lesson_step_consumer.gd"
	var begun: Array = []
	var restored: Array = []
	var next: Dictionary = {"ready": true}
	var accepted := true
	var retry_ok := true
	var retries := 0
	func supports_lesson_step(_step: int) -> bool: return true
	func begin_lesson_step(number: int, _context: Dictionary) -> Dictionary:
		begun.append(number)
		return {"ready": accepted, "reason": "fixture_rejected" if not accepted else ""}
	func advance_lesson_step(_step: int) -> Dictionary: return next.duplicate(true)
	func retry_lesson_step(_step: int) -> bool:
		retries += 1
		return retry_ok
	func restore_lesson_step(number: int, reason: String) -> void: restored.append([number, reason])

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != NEW_USERDIR \
		or not ProjectSettings.get_setting("application/config/use_custom_user_dir", false):
		print("DEMO11_15_FAIL isolation")
		quit(2)
		return
	current_group = "real_main_per_step_not_ready"
	if await _boot():
		await _independent_steps()
		_contract_lifetime()
		await _skip_restore()
	if is_instance_valid(active_main):
		active_main.free()
	active_main = null
	# 기존 QA-004 하니스와 동일: 비동기 AudioServer 종료 정리 기회.
	for frame in range(12):
		await process_frame
	var exit_after := Time.get_ticks_msec() + 200
	while Time.get_ticks_msec() < exit_after:
		await process_frame
	print("DEMO11_15_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"actual_pc_step_completions": 0, "not_ready_steps": [1,2,3,4,5,6,7],
		"fixture_completion_is_combat_acceptance": false}))
	quit(1 if failures > 0 else 0)

func _independent_steps() -> void:
	flow.begin_practice()
	var q: Dictionary = player.get_native_q_control_snapshot()
	var e: Dictionary = player.get_native_e_control_snapshot()
	_check(q.get("reflection_carrier_ready") == false, "actual Q owner declares carrier incomplete")
	_check(e.get("projectile_parry_adopted") == false, "actual E owner declares projectile reflection absent")
	print("DEMO11_15_PC_INTERFACE ", JSON.stringify({"q_carrier":q.get("reflection_carrier_ready"),"e_projectile":e.get("projectile_parry_adopted")}))
	var saved_checks: Array = flow.checks.duplicate()
	# 실제 Main player 입력 퍼널의 allows 소비는 기존 suite에서도 별도 확인.
	for number in range(1,8):
		flow.step = number
		flow.phase = "practice"
		flow.pending = ""
		flow._enter_additional_step()
		var result: Dictionary = flow.get_snapshot().additional_steps.results[number]
		_check(result.status == "NOT_READY", "Main PC step %d missing only itself" % number)
		_check(not flow.allows("weapon"), "step %d blocks weapon" % number)
		_check(flow.allows("left"), "step %d keeps direction" % number)
		for tick in range(90): flow._tick_additional_step()
		_check(flow.pending == "deferred", "step %d continues without success" % number)
		_check(flow.checks == saved_checks, "step %d no fake credit" % number)
		flow.pending = ""
		flow.phase = "deferred"
		flow.transition_ticks = 1
		flow.native_lesson_tick()
		if number < 7:
			_check(flow.step == number+1, "step %d next independent consumer" % number)
		else:
			_check(not flow.active, "last deferred finishes without COMPLETE")
	_check(flow.checks == saved_checks, "all deferred retains every original check")

func _contract_lifetime() -> void:
	current_group = "fixture_contract_only"
	var machine := Steps.new()
	machine.configure(active_main)
	var outside := ContractFixture.new()
	_check(not machine.bind_consumer(1, outside), "reject owner outside world")
	outside.free()
	var owner := ContractFixture.new()
	active_main.add_child(owner)
	_check(not machine.bind_consumer(0, owner), "step0 cannot bind")
	_check(not machine.bind_consumer(8, owner), "step8 cannot bind")
	for number in range(1,8):
		_check(machine.bind_consumer(number, owner), "bind step independently %d" % number)
		machine.enter(number, {})
		_check(machine.results[number].status == "PRACTICE", "fixture admitted %d" % number)
		_check(not machine.bind_consumer(number, owner), "no active replacement %d" % number)
		owner.next = {"ready": true} # ack alone cannot complete.
		var ack_completed := false
		for tick in range(151):
			ack_completed = machine.tick() == "complete" or ack_completed
		_check(not ack_completed, "ready/ack has no credit %d" % number)
		owner.next = {"ready": true, "failed": true}
		machine.tick()
		_check(machine.retry_ticks == 60, "source failure delay %d" % number)
		owner.next = {"ready": true}
		var retries: int = owner.retries
		for tick in range(60): machine.tick()
		_check(owner.retries == retries+1, "PC retry/pose owner called %d" % number)
		owner.next = {"ready": true, "completed": true}
		_check(machine.tick() == "complete", "fixture completion contract %d" % number)
		var restores: int = owner.restored.size()
		machine.leave("skip")
		machine.leave("exit")
		_check(owner.restored.size() == restores, "restore idempotent %d" % number)
	owner.accepted = false
	machine.enter(1,{})
	_check(owner.restored.back()[1] == "begin_rejected", "rejected partial begin restored")
	owner.accepted = true
	owner.next = {"ready": true, "failed": true}
	machine.enter(2,{})
	machine.tick()
	owner.retry_ok = false
	for tick in range(60): machine.tick()
	_check(machine.results[2].reason == "pc_restore_rejected", "failed restore becomes only-step NOT_READY")
	machine.enter(3,{})
	active_main.remove_child(owner)
	machine.tick()
	_check(machine.results[3].reason == "pc_consumer_lost", "detached live owner revoked")
	_check(owner.restored.back()[1] == "owner_lost", "detached owner still cleans lease")
	owner.free()

func _skip_restore() -> void:
	current_group = "main_mixed_fixture_handoff"
	flow._start()
	flow.begin_practice()
	var next_owner := ContractFixture.new()
	flow.world.add_child(next_owner)
	_check(flow.bind_native_lesson_step(2, next_owner), "later step fixture binds independently")
	flow.step = 1
	flow._enter_additional_step()
	for tick in range(181): flow.native_lesson_tick()
	_check(flow.step == 2 and flow.phase == "practice", "missing step1 advances into bound step2")
	_check(next_owner.begun == [2], "only next step actual consumer begin invoked")
	_check(flow.step_consumers.results[2].status == "PRACTICE" and not flow.checks[2], "bound ready alone is not completion")
	flow.skip_all()
	_check(next_owner.restored.size() == 1, "mixed handoff skip restores lease")
	_check(flow.step_consumers.results[2].status == "SKIPPED", "explicit skip never remains PRACTICE/COMPLETE")
	next_owner.free()
	current_group = "real_main_skip_restore"
	flow._start()
	flow.begin_practice()
	var owner := ContractFixture.new()
	flow.world.add_child(owner)
	_check(flow.bind_native_lesson_step(7, owner), "actual world accepts typed PC contract fixture")
	flow.step = 7
	flow._enter_additional_step()
	_check(not flow.allows("bow"), "rage focus blocks cast")
	_check(flow.allows("left"), "rage focus keeps directions")
	flow.step_consumers.focus_ticks = 0
	player._native_input_held["move_left"] = true
	_check(not flow.allows("bow"), "direction held blocks rage per original 683")
	player._native_input_held["move_left"] = false
	_check(flow.allows("bow"), "direction released permits rage after focus")
	var before: Dictionary = flow._saved_player.duplicate(true)
	flow.player.global_position += Vector2(99,99)
	flow.skip_all()
	_check(owner.restored.size() == 1, "skip restores leased consumer")
	_check(not flow.active and flow._saved_enemies.is_empty(), "skip restores world session")
	_check(flow.player.global_position == Vector2(before.x, before.y), "skip restores exact origin")
	flow.skip_all()
	_check(owner.restored.size() == 1, "second skip no duplicate consumer restore")
	owner.queue_free()
	await process_frame
