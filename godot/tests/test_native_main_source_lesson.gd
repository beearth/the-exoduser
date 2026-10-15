extends SceneTree
## NEW actual Main lesson publisher consumer; no controller/UI/full source claim.
## public publish_current below is a named fixture replacement, not native progression.

const USERDIR = "EXODUSER-MainSourceLesson-Isolated-20261014"
const GROUPS = ["file_init_actual_main", "live_callable_replacement_and_revoke", "main_loss_physical_gate"]
var selected: Array = GROUPS.duplicate()
var active_main: Node
var cold_lesson: Callable
var assertions = 0
var failures = 0
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var cleanup_ids: Array = []

func _initialize() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		print("MAIN_LESSON_FIRST_INVALID isolated userdir guard")
		quit(2)
		return
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--only="): selected = Array(arg.trim_prefix("--only=").split(",", false))
	for group in selected:
		if group not in GROUPS:
			print("MAIN_LESSON_FIRST_INVALID unknown group ", group)
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
		_cleanup_owned()
		await process_frame
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("MAIN_LESSON_FIRST_GROUP ", JSON.stringify(row))
	print("MAIN_LESSON_FIRST_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions, "failures": failures, "observations": observations, "owned_main_cleanup_ids": cleanup_ids, "fixture_current_replacements": "chapter2/chapter3 only via actual holder public publisher", "old_successful_replays": 0, "full_lesson_controller": false, "automatic_lesson_progress": false, "public_pixel_qa": false}))
	quit(1 if failures else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("MAIN_LESSON_FIRST_FAIL ", current_group, " ", label)

func _cleanup_owned() -> void:
	if is_instance_valid(active_main):
		cleanup_ids.append(active_main.get_instance_id())
		if active_main.get_parent() != null: active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	paused = false

func _actual_main() -> Node:
	_check(not is_instance_valid(active_main), "one actual owned Main at a time")
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return null
	active_main = packed.instantiate()
	if not active_main.has_method("get_native_source_lesson_callable") or not active_main.has_method("get_native_source_lesson_snapshot"):
		_check(false, "actual Main public lesson API exists")
		return null
	cold_lesson = active_main.get_native_source_lesson_callable()
	_check(cold_lesson.is_valid() and cold_lesson.get_object() == active_main and cold_lesson.call() == null, "actual Main cold wrapper exists with no manufactured false")
	root.add_child(active_main)
	await process_frame
	if not is_instance_valid(active_main.get("source_lesson")) or not is_instance_valid(active_main.get("player")):
		_check(false, "actual Main startup owns lesson and Player")
		return null
	return active_main

func file_init_actual_main() -> void:
	var main: Node = await _actual_main()
	if main == null: return
	var holder: RefCounted = main.source_lesson
	var raw: Variant = holder.get_current_lesson_reference()
	var detail: Dictionary = holder.read_guard_detail()
	var snapshot: Dictionary = main.get_native_source_lesson_snapshot()
	_check(raw is Dictionary and raw.get("active") == false and not raw.has("chapter"), "actual file-init current is inactive and chapter is absent")
	_check(detail["status"] == "READY" and detail["value"] == {"parry_lesson_active": false}, "actual file-init guard preserves source short circuit")
	_check(holder.get_snapshot()["source_phase"] == "source_file_init" and holder.get_snapshot()["origin"] == "native_main_binding", "actual Main invokes original file-init publisher")
	_check(holder.get_counts()["publish"] == 1, "actual Main publishes once, no automatic chapter advancement")
	_check(is_same(raw, holder.get_current_lesson_reference()), "actual current holder reference stays owned, no getter clone")
	_check(cold_lesson.call() == detail["value"] and main.get_native_source_lesson_callable().call() == detail["value"], "already obtained Main live callable reads actual file-init")
	_check(snapshot["status"] == "READY" and snapshot["guard_ready"] == true and snapshot["holder_retained_by_actual_Main"] == true and snapshot["native_main_instance_id"] == main.get_instance_id(), "actual Main ownership readiness is separate from original holder self-claims")
	_check(snapshot["file_init_attempted"] == true and snapshot["file_init_publish_calls"] == 1 and snapshot["file_init_error"] == "" and snapshot["publish_result"]["status"] == "READY", "actual Main file-init publisher succeeds once")
	_check(snapshot["source_boot_input"]["status"] == "SOURCE_BOOT" and snapshot["source_boot_input"]["current"] == false and snapshot["source_boot_input"]["chapter_present"] == false, "original constructor packet stays input metadata, not current authority")
	_check(snapshot["raw_current_reference_is_not_guard_authority"] == true and snapshot["lesson_controller_bound"] == false and snapshot["automatic_source_regeneration_bound"] == false and snapshot["full_main_ready"] == false and snapshot["public_play_proven"] == false, "guard connection does not promote raw references or full lesson/gameplay readiness")
	_check(snapshot["holder"]["main_binding_proven"] == false and snapshot["holder"]["full_main_ready"] == false, "original isolated holder self-claims are not rewritten by actual Main consumer")
	observations[current_group] = {"main_id": main.get_instance_id(), "holder_id": holder.get_instance_id(), "raw_file_init": raw.duplicate(true), "guard_detail": detail, "main_snapshot": snapshot, "cold_callback_owner_main": cold_lesson.get_object() == main}

func live_callable_replacement_and_revoke() -> void:
	var main: Node = await _actual_main()
	if main == null: return
	var holder: RefCounted = main.source_lesson
	var live: Callable = main.get_native_source_lesson_callable()
	var epoch: int = holder.get_epoch()
	var chapter2 = {"active": true, "chapter": 2}
	var result2: Dictionary = holder.publish_current(chapter2, "own_constructor_fixture", {"scope": "explicit actual-holder test replacement chapter2"}, main)
	_check(result2["status"] == "READY", "fixture chapter2 is explicitly published through actual holder")
	_check(is_same(chapter2, holder.get_current_lesson_reference()), "published fixture current preserves actual holder identity")
	_check(live.call() == {"parry_lesson_active": true, "parry_lesson_chapter": 2}, "already obtained Main callback reads chapter2")
	var chapter3 = {"active": true, "chapter": 3}
	var result3: Dictionary = holder.publish_current(chapter3, "own_constructor_fixture", {"scope": "explicit actual-holder test replacement chapter3"}, main)
	_check(result3["status"] == "READY" and not is_same(chapter2, holder.get_current_lesson_reference()) and is_same(chapter3, holder.get_current_lesson_reference()), "chapter3 replaces current object without pinned first identity")
	_check(live.call() == {"parry_lesson_active": true, "parry_lesson_chapter": 3}, "same already obtained live callback reads latest chapter3")
	holder.revoke("explicit_fixture_controller_loss")
	_check(live.call() == null and main.get_native_source_lesson_callable().call() == null, "revoked current returns null, never inactive false fallback")
	_check(holder.get_epoch() == epoch + 3 and holder.get_authority() == "MISSING", "two fixture publishes and revocation remain explicit epoch changes")
	var revoked_snapshot: Dictionary = main.get_native_source_lesson_snapshot()
	_check(revoked_snapshot["guard_ready"] == false and revoked_snapshot["status"] == "NOT_READY" and revoked_snapshot["holder_retained_by_actual_Main"] == true, "actual Main still owns retained holder while current guard authority is revoked")
	observations[current_group] = {"fixture_origin": "own_constructor_fixture", "replacement2": result2, "replacement3": result3, "after_revocation_main_snapshot": main.get_native_source_lesson_snapshot(), "full_controller_or_natural_phase_claim": false}

func main_loss_physical_gate() -> void:
	var main: Node = await _actual_main()
	if main == null: return
	var holder: RefCounted = main.source_lesson
	var weak_main: WeakRef = weakref(main)
	var main_live: Callable = main.get_native_source_lesson_callable()
	var holder_live: Callable = holder.get_dispatcher_lesson_callable()
	var holder_authority: String = holder.get_authority()
	_check(main_live.get_object() == main and main_live.is_valid(), "Main service callback is an actual Node wrapper")
	_check(holder_live.call() == {"parry_lesson_active": false}, "strongly retained file-init holder has independent current authority")
	_cleanup_owned()
	await process_frame
	_check(weak_main.get_ref() == null and not main_live.is_valid(), "actual Main free invalidates Node callback; invalid callback is not invoked")
	_check(is_instance_valid(holder) and holder.get_authority() == holder_authority, "retained RefCounted authority is separate from Main lifetime")
	_check(holder_live.is_valid() and holder_live.call() == {"parry_lesson_active": false}, "retained original holder can remain readable without pretending live Main binding")
	observations[current_group] = {"main_freed": weak_main.get_ref() == null, "main_callable_valid": main_live.is_valid(), "retained_holder_snapshot": holder.get_snapshot(), "retained_guard": holder.read_guard_detail(), "automatic_main_loss_revoke_assumed": false, "get_snapshot_on_freed_main": "NOT_CALLED"}
