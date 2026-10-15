extends SceneTree
## New actual Main consumer episode. No old test/proof imports or execution.

const NativeMainScript = preload("res://scripts/main.gd")
const RESULT_MARKER := "NATIVE_MAIN_SPRITE_READINESS_FIRST"

var _checks: Array[Dictionary] = []
var _groups: Array[Dictionary] = []
var _group_name: String = ""
var _group_first: int = 0

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	# This same cold Main becomes the only actual Main constructor episode.
	var main: Node = NativeMainScript.new()
	var reader := Callable(main, "get_native_player_sprite_readiness")
	_begin_group("cold_actual_main")
	_check(reader.is_valid(), "public_reader_is_callable")
	_check(not main.is_inside_tree(), "cold_main_has_not_entered_tree")
	var cold: Dictionary = reader.call() if reader.is_valid() else {}
	_check(cold.get("status") == "NOT_READY" and not str(cold.get("reason", "")).is_empty(), "cold_main_is_explicit_not_ready")
	_check(cold.get("readiness_scope") == "native_loaded_resources", "cold_scope_is_native_resources")
	_check(cold.get("full_main_ready") == false and cold.get("public_play_proven") == false, "cold_report_does_not_claim_full_play")
	var cold_startup: Dictionary = main.call("get_native_player_sprite_startup_snapshot") if main.has_method("get_native_player_sprite_startup_snapshot") else {}
	_check(cold_startup.get("startup_readonly_calls") == 0 and cold_startup.get("report", {}).is_empty(), "cold_main_has_no_startup_read")
	_end_group()

	root.add_child(main)
	if not main.is_node_ready():
		await main.ready
	# Return outside ready propagation. Only normal native engine time advances.
	await process_frame
	_begin_group("actual_main_existing_player_resources")
	var player: Variant = main.get("player")
	var world: Variant = main.get("world")
	var player_valid: bool = typeof(player) == TYPE_OBJECT and is_instance_valid(player) and player is Node
	_check(main.is_node_ready() and main.is_inside_tree(), "actual_main_ready_in_tree")
	_check(player_valid and player.get_parent() == main and player.is_node_ready(), "player_is_actual_main_child")
	var warrior: Node = player.get_node_or_null("Warrior") if player_valid else null
	_check(warrior is AnimatedSprite2D and warrior.get_parent() == player, "existing_warrior_is_actual_player_child")
	var ready: Dictionary = reader.call() if reader.is_valid() else {}
	_check(ready.get("status") == "READY" and ready.get("errors", []).is_empty(), "current_native_resources_ready_without_errors")
	_check(ready.get("targets_inspected") == 1 and ready.get("animations_inspected") == 32 and ready.get("frames_inspected") == 216, "source_defined_body_32_animations_216_frames")
	_check(_loaded_textures_match(ready.get("textures", [])), "nine_existing_compressed_textures_have_positive_dimensions")
	_check(_error_count(ready, "atlas_region_out_of_bounds") == 0 and _error_count(ready, "expected_region_out_of_bounds") == 0, "no_atlas_boundary_errors")
	var quality: Dictionary = ready.get("quality_target", {})
	_check(quality.get("unique_frames") == 24 and is_equal_approx(float(quality.get("fps", 0.0)), 24.0), "quality_target_is_24_unique_frames_and_24_fps")
	_check(quality.get("animations_total") == 32 and quality.get("animations_meeting") == 0 and quality.get("met") == false and quality.get("readiness_gate") == false, "current_resources_do_not_meet_character_quality_target")
	_check(_source_and_gpu_unproven(ready), "native_ready_does_not_publish_source_wait_stage_or_gpu")
	_check(ready.get("full_main_ready") == false and ready.get("public_play_proven") == false and ready.get("automatic_source_regeneration_bound") == false, "native_ready_does_not_claim_full_main_or_regeneration")
	var startup: Dictionary = main.call("get_native_player_sprite_startup_snapshot") if main.has_method("get_native_player_sprite_startup_snapshot") else {}
	_check(startup.get("startup_readonly_calls") == 1 and startup.get("report", {}).get("status") == "READY", "actual_ready_consumed_existing_resources_once")
	_check(startup.get("full_main_ready") == false and startup.get("public_play_proven") == false, "startup_snapshot_retains_narrow_scope")
	_end_group()
	if not player_valid or not (warrior is AnimatedSprite2D) or ready.get("status") != "READY":
		main.free()
		_finish()
		return

	_begin_group("synchronous_readonly_live_getter")
	var before: Dictionary = _actual_state(main, player, world, warrior)
	var repeated: Dictionary = reader.call()
	var after: Dictionary = _actual_state(main, player, world, warrior)
	_check(before == after, "public_getter_preserves_nodes_actor_transform_velocity_and_animation")
	_check(repeated == ready, "unchanged_current_resources_return_same_report")
	_check(repeated.get("state_unchanged") == true, "inspector_synchronous_fingerprint_unchanged")
	_check(_effects_are_zero(repeated.get("inspector_effects", {})), "inspector_load_image_texture_node_draw_wait_effects_zero")
	var repeated_startup: Dictionary = main.call("get_native_player_sprite_startup_snapshot")
	_check(repeated_startup.get("startup_readonly_calls") == 1 and repeated_startup.get("report") == startup.get("report"), "diagnostic_reads_do_not_repeat_startup_consumption")
	_end_group()

	_begin_group("actual_player_and_main_lifecycle")
	# A genuine public lifecycle loss; no invented HP, resource or clock state.
	player.queue_free()
	var lost: Dictionary = reader.call()
	_check(lost.get("status") == "NOT_READY" and lost.get("reason") == "player_queued_for_deletion", "queued_actual_player_revokes_live_readiness")
	_check(lost.get("frames_inspected") == 0 and lost.get("targets_inspected") == 0, "lost_player_is_not_replaced_by_cached_ready")
	_check(lost.get("full_main_ready") == false and lost.get("public_play_proven") == false, "lifecycle_loss_does_not_promote_scope")
	main.free()
	_check(not is_instance_valid(main), "actual_main_freed_after_episode")
	_check(not reader.is_valid(), "freed_main_public_callable_invalid_without_calling_it")
	_end_group()
	_finish()

func _loaded_textures_match(textures: Variant) -> bool:
	if not (textures is Array) or textures.size() != 9:
		return false
	var paths: Dictionary = {}
	for texture in textures:
		if not (texture is Dictionary) or texture.get("class") != "CompressedTexture2D" \
				or int(texture.get("width", 0)) <= 0 or int(texture.get("height", 0)) <= 0:
			return false
		paths[texture.get("resource_path")] = true
	return paths.size() == 9 and paths.has("res://assets/player/attack-bat-v1.png")

func _error_count(report: Dictionary, code: String) -> int:
	var count: int = 0
	for error in report.get("errors", []):
		if error.get("code") == code:
			count += 1
	return count

func _source_and_gpu_unproven(report: Dictionary) -> bool:
	return report.get("readiness_scope") == "native_loaded_resources" \
		and report.get("source_wait_complete") == "NOT_PROVEN" \
		and report.get("gpu_upload") == "NOT_PROVEN" and report.get("gpu_render") == "NOT_PROVEN" \
		and report.get("js_source_sprite_wait_published") == false \
		and report.get("stage_complete_published") == false \
		and report.get("source_wait_publisher") == "UNCONNECTED"

func _effects_are_zero(effects: Dictionary) -> bool:
	for field in ["resource_loads", "image_reads", "texture_allocations", "nodes_added", "draw_calls", "waits"]:
		if not effects.has(field) or effects[field] != 0:
			return false
	return true

func _child_ids(node: Node) -> Array:
	var ids: Array = []
	for child in node.get_children():
		ids.append(child.get_instance_id())
	return ids

func _actual_state(main: Node, player: CharacterBody2D, world: Node, warrior: AnimatedSprite2D) -> Dictionary:
	return {"main_children": _child_ids(main), "world_children": _child_ids(world),
		"player_children": _child_ids(player), "player_parent": player.get_parent().get_instance_id(),
		"player_transform": player.transform, "player_velocity": player.velocity,
		"warrior_parent": warrior.get_parent().get_instance_id(), "warrior_children": _child_ids(warrior),
		"warrior_transform": warrior.transform, "sprite_frames_id": warrior.sprite_frames.get_instance_id(),
		"animation": warrior.animation, "frame": warrior.frame, "frame_progress": warrior.frame_progress,
		"playing": warrior.is_playing(), "speed_scale": warrior.speed_scale}

func _begin_group(name: String) -> void:
	_group_name = name
	_group_first = _checks.size()

func _check(ok: bool, name: String) -> void:
	_checks.append({"group": _group_name, "name": name, "pass": ok})

func _end_group() -> void:
	var failed: int = 0
	for index in range(_group_first, _checks.size()):
		if not _checks[index]["pass"]:
			failed += 1
	_groups.append({"name": _group_name, "checks": _checks.size() - _group_first,
		"failed": failed, "status": "PASS" if failed == 0 else "FAIL"})

func _finish() -> void:
	var failed: Array = []
	for check in _checks:
		if not check["pass"]:
			failed.append(check)
	print(RESULT_MARKER + " " + JSON.stringify({"status": "PASS" if failed.is_empty() else "FAIL",
		"checks": _checks.size(), "failed": failed, "groups": _groups, "actual_main_constructors": 1,
		"source_origin": "actual_current_native_Main_existing_Player_Warrior",
		"readiness_scope": "native_loaded_resources", "full_main_ready": false,
		"public_play_proven": false, "source_wait_complete": "NOT_PROVEN", "gpu_render": "NOT_PROVEN"}))
	quit(0 if failed.is_empty() else 1)
