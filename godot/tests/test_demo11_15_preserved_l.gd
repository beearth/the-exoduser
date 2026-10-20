extends "res://tests/test_p2001l_lesson_steps.gd"
## 기존 L의 1·2 그룹 함수 원문 실행. 구 halt-only 정책 3그룹은 새 사용자 정책으로 대체.
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR \
		or not ProjectSettings.get_setting("application/config/use_custom_user_dir", false):
		print("PRESERVED_L_FAIL isolation")
		quit(2)
		return
	current_group = "allows_input_gate"
	await _test_allows_input_gate()
	current_group = "step0_parry_kill"
	await _test_step0_parry_kill()
	if is_instance_valid(active_main): active_main.free()
	active_main = null
	# 기존 QA-004 하니스와 동일: 비동기 AudioServer 종료 정리 기회.
	for frame in range(12):
		await process_frame
	var exit_after := Time.get_ticks_msec() + 200
	while Time.get_ticks_msec() < exit_after:
		await process_frame
	print("PRESERVED_L_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"executed_original_groups": ["allows_input_gate", "step0_parry_kill"],
		"superseded_group": "halted_steps_and_restore: old indefinite halt replaced by independent defer"}))
	quit(1 if failures > 0 else 0)
