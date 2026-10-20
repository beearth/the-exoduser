extends SceneTree
## QA-004 lifecycle regression: actual lesson script, explicit owned Node fixtures.
## No Main, lesson tick, input/allows/QE or save operation in these fixtures.
const FLOW = preload("res://scripts/native_parry_lesson_flow.gd")
const ISOLATED_DIRECTORY = "EXODUSER-qa-004-Isolated-20261020"
var checks: int = 0
var failures: int = 0
var group: String
var groups: Array = []

func _initialize() -> void:
	if OS.get_user_data_dir().get_file() != ISOLATED_DIRECTORY:
		push_error("QA004_INVALID_ISOLATION " + OS.get_user_data_dir())
		quit(2)
		return
	call_deferred("_run")

func _run() -> void:
	for name in ["exit_tree_cascade", "direct_free_cascade", "pre_tree_free", "queued_free", "mixed_ownership"]:
		group = name
		var before: int = checks
		var failed_before: int = failures
		await call("_test_" + name)
		var row = {"group": name, "checks": checks - before, "failures": failures - failed_before}
		groups.append(row)
		print("QA004_GROUP_RESULT ", JSON.stringify(row))
	print("QA004_SUITE_RESULT ", JSON.stringify({"groups": groups, "checks": checks, "failures": failures,
		"userdir": OS.get_user_data_dir(), "actual_lesson_script": true, "node_fixtures": true,
		"actual_Main": false, "input_or_qe": false}))
	quit(0 if failures == 0 else 1)

func _check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		push_error("QA004_FAIL " + group + " " + label)

func _cohort(count: int = 5) -> Dictionary:
	var enemies: Array = []
	var children: Array = []
	for i in range(count):
		var enemy := CharacterBody2D.new()
		enemy.name = "SavedEnemy" + str(i)
		var collision := CollisionShape2D.new()
		var circle := CircleShape2D.new()
		circle.radius = 1.0 # Explicit lifetime fixture, not a gameplay parameter.
		collision.shape = circle
		enemy.add_child(collision)
		enemies.append(enemy)
		children.append(collision)
		for _sprite_index in range(2):
			var sprite := Sprite2D.new()
			enemy.add_child(sprite)
			children.append(sprite)
	return {"enemies": enemies, "children": children}

func _freed(cohort: Dictionary) -> void:
	for enemy in cohort["enemies"]:
		_check(not is_instance_valid(enemy), "saved enemy released")
	for child in cohort["children"]:
		_check(not is_instance_valid(child), "owned child released with enemy")

func _cleanup_failed_fixture(cohort: Dictionary) -> void:
	# Baseline failures are asserted BEFORE this test-owned cleanup. It prevents
	# the intentionally red old product from polluting later test groups.
	for enemy in cohort["enemies"]:
		if is_instance_valid(enemy):
			enemy.free()

func _test_exit_tree_cascade() -> void:
	var cohort: Dictionary = _cohort()
	var flow := FLOW.new()
	flow.set("_saved_enemies", cohort["enemies"].duplicate())
	flow.set("active", true)
	flow.set("phase", "practice")
	flow.set("step", -2)
	var saved_bonfire := {"t": 123.0, "active": false}
	flow.set("_saved_bonfire", saved_bonfire)
	root.add_child(flow)
	root.remove_child(flow)
	_freed(cohort)
	_check(flow.get("_saved_enemies").is_empty(), "exit_tree clears owned references")
	_check(flow.get("active") == true and flow.get("phase") == "practice" and flow.get("step") == -2,
		"teardown does not execute lesson finish/progression")
	_check(is_same(flow.get("_saved_bonfire"), saved_bonfire) and saved_bonfire == {"t": 123.0, "active": false},
		"unrelated restore snapshots are untouched")
	flow.free() # PREDELETE after EXIT_TREE must be safe and idempotent.
	_cleanup_failed_fixture(cohort)

func _test_direct_free_cascade() -> void:
	var cohort: Dictionary = _cohort()
	var flow := FLOW.new()
	flow.set("_saved_enemies", cohort["enemies"].duplicate())
	root.add_child(flow)
	flow.free()
	_freed(cohort)
	_cleanup_failed_fixture(cohort)

func _test_pre_tree_free() -> void:
	var cohort: Dictionary = _cohort()
	var flow := FLOW.new()
	flow.set("_saved_enemies", cohort["enemies"].duplicate())
	flow.free() # No _exit_tree has run: PREDELETE is the fallback.
	_freed(cohort)
	_cleanup_failed_fixture(cohort)

func _test_queued_free() -> void:
	var cohort: Dictionary = _cohort()
	var flow := FLOW.new()
	flow.set("_saved_enemies", cohort["enemies"].duplicate())
	root.add_child(flow)
	flow.queue_free()
	await process_frame
	await process_frame
	_check(not is_instance_valid(flow), "queued owner released")
	_freed(cohort)
	_cleanup_failed_fixture(cohort)

func _test_mixed_ownership() -> void:
	var detached: Dictionary = _cohort(1)
	var restored: Dictionary = _cohort(1)
	var host := Node.new()
	root.add_child(host)
	host.add_child(restored["enemies"][0])
	var stale := Node.new()
	stale.free()
	var flow := FLOW.new()
	flow.set("_saved_enemies", [detached["enemies"][0], detached["enemies"][0], stale, null, restored["enemies"][0]])
	root.add_child(flow)
	root.remove_child(flow)
	_freed(detached)
	_check(flow.get("_saved_enemies").is_empty(), "duplicate/stale/null entries cleared")
	_check(is_instance_valid(restored["enemies"][0]) and restored["enemies"][0].get_parent() == host,
		"already restored/reparented enemy stays with its current owner")
	for child in restored["children"]:
		_check(is_instance_valid(child), "reparented child's lifetime is preserved")
	flow.free()
	_check(is_instance_valid(restored["enemies"][0]), "second teardown does not free another owner's enemy")
	host.free()
	_freed(restored)
	_cleanup_failed_fixture(detached)
