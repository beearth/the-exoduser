extends SceneTree
## FIRST actual Main initialization consumer. No old helper suite or formula mirror.
## Public inputs/damage only; production owns every constructor write and clock.

const USERDIR = "EXODUSER-MainSourceInitialization-Isolated-20261014"
const GROUPS = ["source_anchor_order_same_owner", "shared_crystal_current_values", "movement_damage_preserves_source_speed", "options_context_lifecycle", "constructor_once_no_live_reset"]
var selected: Array = GROUPS.duplicate()
var current_group = ""
var assertions = 0
var failures = 0
var rows: Array = []
var active_main: Node
var owned_cleanup_ids: Array = []
var observations: Dictionary = {}

func _initialize() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		print("INITIALIZATION_FIRST_INVALID isolated userdir guard")
		quit(2)
		return
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="):
			selected = Array(arg.trim_prefix("--only=").split(",", false))
	for group in selected:
		if group not in GROUPS:
			print("INITIALIZATION_FIRST_INVALID unknown group ", group)
			quit(2)
			return
	call_deferred("_run")

func _run() -> void:
	for group in selected:
		_cleanup_owned()
		current_group = group
		var before_checks = assertions
		var before_failures = failures
		await call(group)
		# Caller owns cleanup even when an awaited group aborts on SCRIPT ERROR.
		_cleanup_owned()
		await process_frame
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("INITIALIZATION_FIRST_GROUP ", JSON.stringify(row))
	print("INITIALIZATION_FIRST_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions, "failures": failures, "observations": observations, "owned_main_cleanup_ids": owned_cleanup_ids, "manual_physics": 0, "live_actor_setters": 0, "old_successful_replays": 0, "full_main_ready": false, "public_pixel_qa": false}))
	quit(1 if failures else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("INITIALIZATION_FIRST_FAIL ", current_group, " ", label)

func _cleanup_owned() -> void:
	if InputMap.has_action("move_right"): Input.action_release("move_right")
	if is_instance_valid(active_main):
		owned_cleanup_ids.append(active_main.get_instance_id())
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	paused = false

func _actual_main() -> Node:
	_check(not is_instance_valid(active_main), "only one owned Main at a time")
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main packed scene loads")
		return null
	active_main = packed.instantiate()
	root.add_child(active_main)
	await process_frame
	if not is_instance_valid(active_main.get("player")) or not active_main.has_method("get_native_source_player_initialization_snapshot"):
		_check(false, "actual Main startup owns Player and initialization API")
		return null
	var snapshot: Dictionary = active_main.get_native_source_player_initialization_snapshot()
	_check(snapshot.get("result", {}).get("completed") == true, "actual initialization completed before Tree")
	if snapshot.get("result", {}).get("completed") != true:
		observations[current_group] = {"startup_failure": snapshot}
		return null
	return active_main

func source_anchor_order_same_owner() -> void:
	var main: Node = await _actual_main()
	if main == null: return
	var snapshot: Dictionary = main.get_native_source_player_initialization_snapshot()
	var dispatcher: Dictionary = snapshot["dispatcher"]
	var state: Dictionary = main.source_state.get_snapshot()
	var trace: Array = dispatcher["trace"]
	var writes: Array = state["source_initializer_writes"]
	var required = ["game.html:28570", "game.html:28582", "game.html:28583", "game.html:28584", "game.html:28585", "game.html:28586", "game.html:28588", "game.html:28589", "game.html:28590", "game.html:28591", "game.html:28592", "game.html:28593", "game.html:28594", "game.html:28600", "game.html:28601", "game.html:28602", "game.html:28603", "game.html:28604", "game.html:28605", "game.html:28606", "game.html:28607", "game.html:28608", "game.html:28622", "game.html:28623", "game.html:16934", "game.html:16939"]
	var cursor = 0
	var actual_write_trace: Array = []
	for entry in trace:
		if cursor < required.size() and entry.get("source") == required[cursor]: cursor += 1
		if entry.has("field"): actual_write_trace.append(entry)
	_check(cursor == required.size(), "source anchor subsequence includes HP/nonHP interleave and final invalidate/recalc")
	_check(actual_write_trace.size() == writes.size() and writes.size() == dispatcher["committed_writes"], "trace has one actual State acceptance per committed write")
	for index in range(mini(actual_write_trace.size(), writes.size())):
		var accepted = true
		for key in ["field", "source", "kind", "pass_id", "write_index"]:
			accepted = accepted and actual_write_trace[index].get(key) == writes[index].get(key)
		_check(accepted, "source State acceptance matches trace " + str(index))
	_check(main.source_initialization.get_native_source_initialization_player() == main.player and main.source_initialization.get_native_source_initialization_world() == main.world, "completed dispatcher has actual same actor/world")
	_check(dispatcher["completion"]["owner_identity_valid"] == true and dispatcher["completion"]["source_anchor_order_complete"] == true, "completion/current ownership separate from full Main readiness")
	_check(dispatcher["active"] == false and main.player.get_native_source_initialization_snapshot()["constructor_write_ready"] == false, "Tree installation closes constructor write window")
	_check(snapshot["main_full_ready"] == false and snapshot["automatic_regeneration_bound"] == false and dispatcher["full_source_query_order_proven"] == false, "full bootstrap, regeneration and complete source query order remain unclaimed")
	observations[current_group] = {"main_id": main.get_instance_id(), "player_id": main.player.get_instance_id(), "world_id": main.world.get_instance_id(), "trace": trace, "committed_writes": writes.size(), "completion": dispatcher["completion"]}

func shared_crystal_current_values() -> void:
	var main: Node = await _actual_main()
	if main == null: return
	var snapshot: Dictionary = main.get_native_source_player_initialization_snapshot()
	var dispatcher: Dictionary = snapshot["dispatcher"]
	var p: Dictionary = main.source_state.read_current_p()
	var cohort: Dictionary = dispatcher["cohort"]
	var plan: Dictionary = cohort["resource_plan"]["plan"]
	_check(dispatcher["health_capture_calls"] == 1 and dispatcher["resource_capture_calls"] == 1, "Health and Resource captured once, not replanned")
	_check(snapshot["services"]["source_plans_recomputed_by_services"] == 0 and snapshot["services"]["attack_plan_delegations"] == 2, "actual early/crystal attack delegation with no service plan recomputation")
	_check(is_same(p, main.source_state.read_current_p()), "current P reader returns the same owned dictionary")
	_check(p["_crystalStats"] == plan["values"]["_crystalStats"], "actual current crystal values match captured original plan; no scratch identity claim")
	_check(cohort["current_main"] == true and cohort["cohort_id"] == snapshot["services"]["cohort_id"], "captured current Main shares one actual cohort")
	_check(not is_same(p["_effStats"], main.source_state.read_current_stats()), "effective stats are a fresh owned value object")
	var last: Dictionary = {}
	for write in main.source_state.get_snapshot()["source_initializer_writes"]: last[write["field"]] = write["value"]
	# P2-001e: 원본 새 게임 순서 = applyStats(초기화 마지막 쓰기, game.html:64019) →
	# initStage(0)(64025) → 31567 풀충전(P.hp=P.mhp; P.st=P.mst; P.mp=P.mmp;
	# P.shield=P.mshield). 부팅 완료 시점 hp/mp/shield는 '마지막 소스 쓰기'가 아니라
	# 31567 충전값이 원본이다. 검증 의도(소유자 readback이 같은 ref·같은 값 경로 유지)는
	# 보존: 비충전 필드=마지막 쓰기 그대로, 충전 필드=같은 소유 경로의 cap과 일치
	# + 마지막 쓰기 ≤ cap(충전이 쓰기를 깎지 않음).
	var stage_refilled: Dictionary = {"hp": "mhp", "mp": "mmp", "shield": "mshield"}
	for field in last:
		if field == "st":
			continue
		if stage_refilled.has(field):
			var cap_field: String = stage_refilled[field]
			_check(p.has(field) and p[field] == p[cap_field] and float(last[field]) <= float(p[cap_field]),
				"current actual owner readback preserves 31567 stage-entry refill " + field)
		else:
			_check(p.has(field) and p[field] == last[field], "current actual owner readback preserves final source write " + field)
	var authority_st_writes: Array = main.source_resources.get_snapshot()["source_initializer_writes"].filter(func(write): return write["field"] == "st")
	_check(not authority_st_writes.is_empty() and authority_st_writes.back()["value"] == last["st"], "constructor State and actual Authority accepted the same source final ST")
	_check(p["st"] == main.player.stamina and p["st"] >= last["st"] and p["st"] <= p["mst"], "observed no-attack startup: current ST is actual actor within cap; legacy regen is distinct from constructor writes")
	_check(main.player.get_native_resource_regeneration_snapshot()["bound"] == false and snapshot["automatic_regeneration_bound"] == false, "automatic source regeneration remains unbound; old native ST recovery is a separate current phase")
	observations[current_group] = {"constructor_st": last["st"], "tree_current_st": p["st"], "owned_mst": p["mst"], "legacy_st_regeneration_possible": true, "source_automatic_regeneration_bound": false}
	var actor: Dictionary = main.player.read_native_source_initialization_fields()
	for field in actor:
		_check(p.has(field) and p[field] == actor[field], "P synchronizes actual scalar actor field " + field)
	var resource: Dictionary = main.source_resources.read_current_resource_parameters()
	for field in ["st", "mst", "stR", "mp", "mmp", "mpR"]:
		_check(p[field] == resource["values"][field], "actual owned resource readback " + field)
	_check(resource["derived"] == false and resource["derived_ready"] == false and resource["main_full_ready"] == false, "applied resource fields do not falsely mark full derived readiness")
	var helpers: Dictionary = main.source_initialization_services.get_services()
	var health: Dictionary = helpers["health"].stage_state()
	_check(health["complete"] == true and health["crystal_stage"] == "actual_source_28600:cohort:" + str(cohort["cohort_id"]), "actual Health public phase consumes current crystal with cohort provenance")
	var attack_crystal: Dictionary = dispatcher["results"]["attack_crystal_plan"]
	_check(attack_crystal["captured_cr"] == p["_crystalStats"] and attack_crystal["crystal_stage"] == health["crystal_stage"], "actual original BaseAtk consumes same current crystal values and cohort stage")
	var defense_crystal: Dictionary = dispatcher["results"]["defense_speed:run_phase:apply_stats_def_speed_crystal"]["plan"]["inputs"]["_crystalStats"]
	_check(defense_crystal["def"] == p["_crystalStats"]["def"] and defense_crystal["spd"] == p["_crystalStats"]["spd"], "actual original DEF/speed consumes same captured crystal fields without new crystal sum")
	_check(dispatcher["captured_resource_writes_consumed"] == plan["packet"]["writes"].size(), "all captured resource writes consumed exactly once")
	observations[current_group].merge({"current_fields": p.duplicate(true), "actor_fields": actor, "resources": resource, "health_stage": health, "capture_calls": [dispatcher["health_capture_calls"], dispatcher["resource_capture_calls"]]})

func movement_damage_preserves_source_speed() -> void:
	var main: Node = await _actual_main()
	if main == null: return
	var player = main.player
	var source_speed: float = player.read_native_source_initialization_fields()["speed"]
	var writes: int = player.get_native_source_initialization_snapshot()["committed_source_writes"]
	var frame: float = main.world.get_native_frame()
	var origin: Vector2 = player.global_position
	Input.action_press("move_right")
	var waits = 0
	while main.world.get_native_frame() < frame + 10.0 and waits < 120:
		await physics_frame
		waits += 1
	Input.action_release("move_right")
	_check(main.world.get_native_frame() >= frame + 10.0, "actual World clock advanced naturally for movement")
	_check(player.global_position.distance_to(origin) > 0.1, "public movement input moves actual actor")
	_check(is_equal_approx(player.velocity.length(), source_speed * 60.0), "actual idle movement consumes preserved source speed in px/sec")
	var hp_before: float = player.hp
	player.receive_damage(20, "magic", Vector2.LEFT, 0.0)
	_check(player.hp < hp_before, "public actual damage changes initialized HP")
	_check(main.source_state.read_current_p()["hp"] == player.hp, "actual current P synchronizes public damaged HP")
	_check(player.read_native_source_initialization_fields()["speed"] == source_speed, "public movement/damage do not overwrite source raw speed")
	_check(player.get_native_source_initialization_snapshot()["committed_source_writes"] == writes, "live gameplay has no constructor rewrite")
	_check(Engine.physics_ticks_per_second == 60 and Engine.max_fps == 240, "physics cadence and render cap are distinct configured settings, not measured FPS")
	observations[current_group] = {"source_speed_per_tick": source_speed, "observed_velocity": player.velocity, "movement_delta": player.global_position - origin, "actual_world_frame_delta": main.world.get_native_frame() - frame, "hp_before": hp_before, "hp_after": player.hp, "physics_hz": Engine.physics_ticks_per_second, "render_cap_only": Engine.max_fps, "render_fps_measured": false}

func options_context_lifecycle() -> void:
	var main: Node = await _actual_main()
	if main == null: return
	var services = main.source_initialization_services
	var before: Dictionary = services.get_snapshot()
	var options: Variant = services.read_current_options()
	_check(options is Dictionary and options.size() == 35, "actual owned original OPT35 exists")
	_check(is_same(options, services.read_current_options()), "OPT reader preserves actual same holder identity")
	_check(before["options_status"]["phase"] == "current_pre_restore" and before["options_status"]["origin"] == "owned_source_initializer", "actual non-electron boot uses explicit pre_restore phase")
	_check(before["signed_difficulty"]["status"] == "READY" and before["signed_difficulty"]["value"] == 0.0 and before["signed_difficulty"]["origin"] == "current_OPT_diff" and options["diff"] == 5, "signed difficulty is actual current diff5 minus5, not missing fallback")
	_check(before["source_g_on"] == false and main.source_state.read_current_g()["on"] == false, "actual G remains pre-stage on=false")
	var actor_before: Dictionary = main.player.read_native_source_initialization_fields()
	main.source_state.free()
	var lost: Dictionary = services.get_snapshot()
	_check(lost["source_context_ready"] == false and lost["options_current"] == null, "lost actual State closes service reads without manufactured OPT")
	_check(lost["signed_difficulty"]["status"] == "NOT_READY" and lost["signed_difficulty"].get("value") == null, "supplier loss does not manufacture signed zero")
	_check(main.source_initialization.get_native_source_initialization_completion()["owner_identity_valid"] == false, "completion receipt marks current owner loss")
	_check(main.player.read_native_source_initialization_fields() == actor_before, "supplier lifecycle loss does not refill/reset actual actor")
	observations[current_group] = {"before": before, "lost": lost, "actor_fields_after_loss": actor_before}

func constructor_once_no_live_reset() -> void:
	var main: Node = await _actual_main()
	if main == null: return
	var p_before: Dictionary = main.source_state.read_current_p().duplicate(true)
	var before: Dictionary = main.source_initialization.get_snapshot()
	var actor_before: Dictionary = main.player.get_native_source_initialization_snapshot()
	var resources_before: Dictionary = main.source_resources.get_snapshot()
	var repeated: Dictionary = main.source_initialization.initialize_new_run()
	_check(repeated["ready"] == false and repeated["reason"] == "not_configured_or_initialization_already_attempted", "completed owner's duplicate attempt explicitly rejected")
	_check(not main.player.commit_native_source_initialization_field("speed", 99.0), "Tree actor rejects live source speed write")
	var cohort: Dictionary = before["cohort"]
	_check(not main.source_state.commit_native_source_initialization_write(cohort["resource_plan"]["plan"]["packet"], 0), "State rejects old source write packet after constructor window")
	_check(not main.source_resources.commit_native_source_initialization_write(cohort["resource_plan"]["plan"]["packet"], 0), "Authority rejects old source resource packet after constructor window")
	_check(not main.player.bind_native_source_initialization(main.source_initialization), "actor initialization binding is persistent once")
	_check(main.source_state.read_current_p() == p_before, "duplicate/live write attempts leave same current source values")
	var after: Dictionary = main.source_initialization.get_snapshot()
	_check(after["committed_writes"] == before["committed_writes"] and after["trace"] == before["trace"] and after["health_capture_calls"] == 1 and after["resource_capture_calls"] == 1, "duplicate attempt performs no producer recapture or actual write")
	_check(main.player.get_native_source_initialization_snapshot()["fields"] == actor_before["fields"], "actual actor fields unchanged")
	_check(main.source_resources.get_snapshot()["current_parameters"] == resources_before["current_parameters"], "actual resource fields unchanged")
	_check(main.source_state.get_snapshot()["derived_parameters_ready"] == false, "completed anchor consumer does not promote full source bootstrap")
	observations[current_group] = {"duplicate_result": repeated, "actual_writes": after["committed_writes"], "live_actor_write_ready": main.player.get_native_source_initialization_snapshot()["constructor_write_ready"]}
