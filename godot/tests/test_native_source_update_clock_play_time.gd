extends SceneTree
## P1-002.D — source update() prefix stage/play time (game.html:32742) regression.
## Three scopes, reported separately and never merged into one claim:
##   1) producer contract: fixture witnesses/receipts owned by this test exercise the
##      phase machine to phase_stage_play_time (contract evidence, NOT product runtime).
##   2) actual Main State write sink: apply_native_source_update_clock_writes gate,
##      atomic batch rejection, and read_normal_enemy_play_time NOT_READY->READY flip.
##   3) actual Main frame callback: the product driver runs each frame and currently
##      halts honestly at system_lesson (no _systemLesson holder) — playTime stays
##      NOT_READY. This group documents the real halt; it is not a playTime PASS.
## Main-booting groups require an isolated custom user dir (never the live one).

const CLOCK = preload("res://port_modules/source_update_clock_prefix/producer.gd")
const USERDIR = "EXODUSER-UpdateClockPlayTime-Isolated-20261019"
const GROUPS = ["producer_stage_play_time_contract",
	"actual_main_write_sink_and_ready", "actual_main_frame_callback_halt"]
const MAIN_GROUPS = ["actual_main_write_sink_and_ready", "actual_main_frame_callback_halt"]
const RECEIPT = {"completed": true, "returned": false}

var selected: Array = GROUPS.duplicate()
var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="): selected = Array(arg.trim_prefix("--only=").split(",", false))
	for group in selected:
		if group not in GROUPS:
			print("UPDATE_CLOCK_PLAY_TIME_INVALID unknown group ", group)
			quit(2)
			return
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in selected:
		_cleanup_owned()
		current_group = group
		if group in MAIN_GROUPS and not isolated:
			skipped.append(group)
			print("UPDATE_CLOCK_PLAY_TIME_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		_cleanup_owned()
		await process_frame
		var row = {"group": group, "assertions": assertions - before_checks,
			"failures": failures - before_failures}
		rows.append(row)
		print("UPDATE_CLOCK_PLAY_TIME_GROUP ", JSON.stringify(row))
	print("UPDATE_CLOCK_PLAY_TIME_RESULT ", JSON.stringify({"groups": rows,
		"assertions": assertions, "failures": failures, "skipped_main_groups": skipped,
		"observations": observations,
		"producer_fixture_inputs_are_test_owned": true,
		"product_play_time_ready": false, "public_play_evidence": false}))
	quit(1 if (failures > 0 or assertions == 0) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("UPDATE_CLOCK_PLAY_TIME_FAIL ", current_group, " ", label)

func _cleanup_owned() -> void:
	if is_instance_valid(active_main):
		if active_main.get_parent() != null: active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	paused = false

func _actual_main() -> Node:
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return null
	active_main = packed.instantiate()
	root.add_child(active_main)
	if not is_instance_valid(active_main.get("source_state")) \
			or not is_instance_valid(active_main.get("source_initialization_services")):
		_check(false, "actual Main boots State + Services")
		return null
	return active_main

func _apply_fixture_writes(g: Dictionary, result: Dictionary) -> void:
	# test-owned fixture sink for producer-contract scope only
	for write in result.get("owner_writes", []):
		g[String(write["target"]).substr(2)] = write["value"]

func _drive_prefix_to_sp(clock: RefCounted, g: Dictionary) -> bool:
	# fixture witnesses/receipts: this test is the declared owner of the fixture world
	var ok := true
	ok = ok and clock.begin_update(g).get("status") == "OK"
	ok = ok and clock.phase_system_lesson({"presence": "absent"}).get("status") == "CONTINUE"
	var g_on: Dictionary = clock.phase_g_on(g)
	if g_on.get("status") != "CONTINUE":
		return false
	ok = ok and clock.phase_parry_lesson({"presence": "falsy"}).get("status") == "CONTINUE"
	ok = ok and clock.phase_editor({"editor_mode": false}).get("status") == "CONTINUE"
	ok = ok and clock.phase_panel_inputs(RECEIPT).get("status") == "CONTINUE"
	var paused_r: Dictionary = clock.phase_paused(g)
	if paused_r.get("status") != "CONTINUE":
		return false
	ok = ok and clock.phase_body_gap_to_hitstop(RECEIPT).get("status") == "CONTINUE"
	var hs: Dictionary = clock.phase_hitstop(g)
	ok = ok and hs.get("status") == "CONTINUE"
	_apply_fixture_writes(g, hs)
	ok = ok and clock.phase_gap_hitstop_to_sp(RECEIPT).get("status") == "CONTINUE"
	var sp: Dictionary = clock.phase_sp(g)
	ok = ok and sp.get("status") == "CONTINUE" and sp.get("sp") == 1.0
	_apply_fixture_writes(g, sp)
	ok = ok and clock.phase_gap_sp_to_stage_time(RECEIPT).get("status") == "CONTINUE"
	return ok

func _test_producer_stage_play_time_contract() -> void:
	var clock: RefCounted = CLOCK.new()
	_check(clock.declare_dt_sp().get("status") == "OK", "dt_sp declaration accepted once")
	var g: Dictionary = {"on": true, "paused": false}
	for frame in range(3):
		_check(_drive_prefix_to_sp(clock, g), "fixture prefix reaches stage_play_time slot (frame %d)" % frame)
		var spt: Dictionary = clock.phase_stage_play_time(g)
		_check(spt.get("status") == "CONTINUE", "stage_play_time continues (frame %d)" % frame)
		var writes: Variant = spt.get("owner_writes")
		_check(writes is Array and writes.size() == 2
			and writes[0] == {"target": "G.stageTime", "value": float(frame + 1)}
			and writes[1] == {"target": "G.playTime", "value": float(frame + 1)},
			"(G.x||0)+sp accumulation writes (frame %d)" % frame)
		_apply_fixture_writes(g, spt)
		clock.end_update()
	_check(g.get("stageTime") == 3.0 and g.get("playTime") == 3.0, "3 updates accumulate 3.0/3.0")
	# paused source update returns before stage/play time — no accumulation
	g["paused"] = true
	_check(clock.begin_update(g).get("status") == "OK", "paused-frame update opens")
	clock.phase_system_lesson({"presence": "absent"})
	clock.phase_g_on(g)
	clock.phase_parry_lesson({"presence": "falsy"})
	clock.phase_editor({"editor_mode": false})
	clock.phase_panel_inputs(RECEIPT)
	var paused_r: Dictionary = clock.phase_paused(g)
	_check(paused_r.get("status") == "RETURNED", "G.paused truthy returns the update")
	var after_return: Dictionary = clock.phase_stage_play_time(g)
	_check(after_return.get("status") == "NOT_READY", "stage_play_time rejected after early return")
	clock.end_update()
	_check(g.get("playTime") == 3.0, "paused frame does not accumulate")
	g["paused"] = false
	# truthy non-number current has no ToNumber owner -> halt, stageTime prefix write kept
	g["playTime"] = "corrupt"
	_check(_drive_prefix_to_sp(clock, g), "fixture prefix reaches stage_play_time slot (corrupt)")
	var corrupt: Dictionary = clock.phase_stage_play_time(g)
	_check(corrupt.get("status") == "PARTIAL_NOT_READY"
		and corrupt.get("reason") == "stage_play_time_current_not_number_playTime"
		and corrupt.get("owner_writes", []) == [{"target": "G.stageTime", "value": 4.0}],
		"non-number playTime halts with applied stageTime prefix write")
	clock.end_update()
	observations["producer_contract_g"] = g.duplicate(true)

func _test_actual_main_write_sink_and_ready() -> void:
	var main: Node = _actual_main()
	if main == null: return
	await process_frame
	var state: Node = main.source_state
	var services: RefCounted = main.source_initialization_services
	var g: Variant = state.read_current_g()
	_check(g is Dictionary and not g.has("playTime"), "boot G has no playTime key")
	var play_before: Dictionary = services.read_normal_enemy_play_time()
	_check(play_before.get("status") == "NOT_READY", "play_time NOT_READY before any owner write")
	# foreign caller rejected, nothing written
	var foreign: Dictionary = state.apply_native_source_update_clock_writes(
		main, RefCounted.new(), [{"target": "G.playTime", "value": 1.0}], g)
	_check(foreign.get("status") == "NOT_READY" and not g.has("playTime"),
		"foreign services rejected without write")
	# malformed batch rejected atomically (valid first entry must not land)
	var malformed: Dictionary = state.apply_native_source_update_clock_writes(
		main, services, [{"target": "G.playTime", "value": 1.0}, {"target": "G.play.Time", "value": 2.0}], g)
	_check(malformed.get("status") == "NOT_READY" and not g.has("playTime"),
		"malformed batch rejected atomically")
	var nonfinite: Dictionary = state.apply_native_source_update_clock_writes(
		main, services, [{"target": "G.playTime", "value": NAN}], g)
	_check(nonfinite.get("status") == "NOT_READY" and not g.has("playTime"),
		"non-finite value rejected")
	# accepted write lands in the same owned G reference and flips the reader
	var accepted: Dictionary = state.apply_native_source_update_clock_writes(
		main, services, [{"target": "G.stageTime", "value": 0.5}, {"target": "G.playTime", "value": 0.5}], g)
	_check(accepted.get("status") == "READY" and accepted.get("writes") == 2,
		"owner write batch accepted")
	_check(g.get("playTime") == 0.5 and g.get("stageTime") == 0.5
		and is_same(state.read_current_g(), g), "writes land in the same owned G reference")
	var play_after: Dictionary = services.read_normal_enemy_play_time()
	_check(play_after.get("status") == "READY" and play_after.get("value") == 0.5,
		"read_normal_enemy_play_time READY after owner write")
	observations["write_sink_receipt"] = accepted

func _test_actual_main_frame_callback_halt() -> void:
	var main: Node = _actual_main()
	if main == null: return
	# New-run bootstrap already owns G.stageTime=0 (source new-run G init); playTime is absent.
	var g_before: Variant = main.source_state.read_current_g()
	var had_play_before: bool = g_before is Dictionary and g_before.has("playTime")
	var had_stage_before: bool = g_before is Dictionary and g_before.has("stageTime")
	var stage_before: Variant = g_before.get("stageTime") if g_before is Dictionary else null
	for _frame in range(6):
		await process_frame
	var snapshot: Dictionary = main.get_native_source_clock_input_snapshot()
	_check(snapshot.has("update_clock_result"), "snapshot exposes update_clock_result")
	var result: Variant = snapshot.get("update_clock_result")
	_check(result is Dictionary and result.get("status") != null
		and result.get("reason", "") != "source_native_update_not_entered",
		"update clock driver actually ran in the native frame callback")
	var update_state: Variant = result.get("update_state", {}) if result is Dictionary else {}
	# P2-001j 갱신: system_lesson 관측(absent — 원본 32107은 반환 무시라 흐름 동등)·
	# editor 증인·gap 영수증이 소유되면서, pre-stage(G.on=false) 부팅의 정직한 현재
	# 게이트는 원본 첫 실게이트 32108 `if(!G.on)return` = g_on RETURNED다.
	_check(update_state is Dictionary
		and update_state.get("returned_at") == "g_on"
		and str(update_state.get("not_ready_at", "")) == "",
		"honest current gate: RETURNED at g_on pre-stage (32108 if(!G.on)return)")
	var play: Dictionary = main.source_initialization_services.read_normal_enemy_play_time()
	_check(play.get("status") == "NOT_READY", "play_time stays NOT_READY (no fabricated writes)")
	var g: Variant = main.source_state.read_current_g()
	_check(g is Dictionary and not had_play_before and not g.has("playTime")
		and g.has("stageTime") == had_stage_before
		and typeof(g.get("stageTime")) == typeof(stage_before) and g.get("stageTime") == stage_before,
		"driver never invented stage/play time writes (bootstrap stageTime unchanged, playTime absent)")
	observations["frame_callback_update_clock_result"] = result
