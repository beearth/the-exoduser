extends SceneTree
const Registry = preload("res://scripts/native_feature_registry.gd")
var events: Array = []
var failures := 0
var checks := 0
func check(value: bool, label: String) -> void:
	checks += 1
	if not value:
		failures += 1
		printerr("REGISTRY_FAIL ", label)
func record(main: Node, ticks: float, serial: int, id: String) -> void:
	events.append([id, main.get_instance_id(), ticks, serial])
func _initialize() -> void:
	call_deferred("run")
func run() -> void:
	check(OS.get_user_data_dir().get_file() == "EXODUSER-main-registry-Isolated-20261021", "isolated userdir")
	if failures:
		quit(1)
		return
	var owner := Node.new()
	root.add_child(owner)
	var registry = Registry.new()
	check(registry.register_physics_entry("later", 200, record.bind("later")), "register later")
	check(registry.register_physics_entry("earlier", 100, record.bind("earlier")), "register earlier")
	check(not registry.register_physics_entry("earlier", 300, record.bind("bad")), "duplicate id rejected")
	check(not registry.register_physics_entry("other", 100, record.bind("bad")), "duplicate order rejected")
	check(registry.seal(), "seal")
	check(not registry.register_physics_entry("late", 400, record.bind("bad")), "mutation rejected")
	record.bind("earlier").call_deferred(owner, 0.5, 42)
	record.bind("later").call_deferred(owner, 0.5, 42)
	events.append("tail")
	await process_frame
	var legacy := events.duplicate(true)
	events.clear()
	registry.queue_physics_entry(owner, 0.5, 42)
	check(events.is_empty(), "execution stays deferred")
	events.append("tail")
	await process_frame
	check(events == legacy, "legacy arguments/deferred boundary/order identical")
	# Instantiate actual Main without scene boot: verifies production discovery and potion owner.
	var main = load("res://scripts/main.gd").new()
	check(main.native_feature_registry.ready, "actual Main discovery sealed")
	check(main.source_potion != null, "existing feature created")
	var initial: Dictionary = main.source_potion.get_snapshot()
	# No boot/current owner: direct legacy call and migrated dispatch must reject identically.
	var direct: Dictionary = main.source_potion.advance_native(owner, 1.0, 43)
	main.native_feature_registry.queue_physics_entry(owner, 1.0, 43)
	await process_frame
	check(direct.reason == "state_owner_lost" or direct.reason == "source_update_gate_or_prefix_not_ready" or direct.reason == "main_owner_mismatch", "existing fail-closed gate")
	check(initial == main.source_potion.get_snapshot(), "rejected tick has no gameplay mutation")
	main.free()
	owner.free()
	print("MAIN_REGISTRY_RESULT checks=", checks, " failures=", failures)
	quit(0 if failures == 0 else 1)
