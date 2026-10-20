extends SceneTree

const USERDIR := "EXODUSER-MAPLOOK-HOLE-PC-Isolated-20261020"
const MODULE := "res://scripts/maplook/spawn_hole_fx.gd"
var checks := 0
var failures := 0

func _initialize() -> void:
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		print("HOLE_FAIL ", label)

func _run() -> void:
	_check(ProjectSettings.get_setting("application/config/custom_user_dir_name") == USERDIR, "isolated userdir")
	_check(FileAccess.file_exists(MODULE), "independent overlay module exists")
	if failures > 0:
		_finish()
		return
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(8):
		await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	var world: Node2D = main.get("world")
	var player: Node2D = main.get("player")
	var state: Node = main.get("source_state")
	var source: Node = world.get_node("NativeSpawnHoleSystem")
	var current: Dictionary = state.read_current_g()
	var holes: Array = current["spawnHoles"]
	var original: Dictionary = current.duplicate(true)
	var original_map: Dictionary = world.get("map_data").duplicate(true)
	var existing := _canvas_properties(world)
	var child_count := world.get_child_count()
	seed(20261020)
	var expected_random := randi()
	seed(20261020)
	var module_script: Script = load(MODULE)
	var overlay: Node2D = module_script.install(world, world.get("map_data"), player)
	overlay.set_process(false)
	_check(randi() == expected_random, "install consumes no shared RNG")
	_check(overlay.get_parent() == world and world.get_child_count() == child_count + 1, "single world child")
	_check(overlay.get_snapshot()["holes"].size() == 14, "actual 14 G holes consumed")
	var idle: Dictionary = overlay.get_snapshot()
	for index in range(holes.size()):
		var view: Dictionary = idle["holes"][index]
		_check(view["position"] == [holes[index]["x"], holes[index]["y"]], "actual G position %d" % index)
		_check(is_equal_approx(view["diameter"], 150.0 + holes[index]["size"] * 150.0), "source diameter %d" % index)
		_check(view["triggered"] == false and view["opacity"] == 1.0, "idle %d" % index)
	_check(idle["holes"][0]["phase"] != idle["holes"][1]["phase"], "independent phases")
	var second: Node2D = module_script.install(world, world.get("map_data"), player)
	second.set_process(false)
	_check(second.get_snapshot() == idle, "fixed-seed install deterministic")
	second.free()
	_check(current == original, "install does not write G")
	_check(world.get("map_data") == original_map, "map unchanged")
	_check(_canvas_properties(world, overlay) == existing, "existing canvas properties unchanged")
	_check(_count_lights(overlay) == 0, "no additional light")
	var selected: Dictionary = holes[9]
	selected["_triggered"] = true
	var fixture: Dictionary = current.duplicate(true)
	seed(700)
	expected_random = randi()
	seed(700)
	overlay.call("_process", 0.5)
	_check(randi() == expected_random, "update consumes no shared RNG")
	var active: Dictionary = overlay.get_snapshot()["holes"][9]
	_check(active["triggered"] and active["activity"] > 0.9, "live trigger detected")
	_check(active["pulse_hz"] > idle["holes"][9]["pulse_hz"], "trigger pulse faster")
	_check(active["rim_gain"] > idle["holes"][9]["rim_gain"], "trigger rim brighter")
	_check(current == fixture, "animation does not write G")
	var phase_before: float = active["phase"]
	holes.remove_at(9)
	overlay.call("_process", 0.3)
	var fading: Dictionary = overlay.get_snapshot()["holes"][9]
	_check(fading["retiring"] and fading["opacity"] > 0.0 and fading["opacity"] < 1.0, "removed G record fades")
	_check(fading["position"] == [3780.0, 6220.0] and fading["phase"] == phase_before, "fade retains geometry and identity")
	_check(overlay.get_snapshot()["holes"][10]["position"] == idle["holes"][10]["position"], "array splice does not transfer identity")
	overlay.call("_process", 1.0)
	_check(overlay.get_snapshot()["holes"].size() == 13, "fade nodes released")
	holes.insert(9, selected)
	selected.erase("_triggered")
	overlay.call("_process", 0.0)
	_check(overlay.get_snapshot()["holes"].size() == 14, "record reintroduced")
	_check(overlay.get_snapshot()["holes"][-1]["phase"] == phase_before, "reintroduced deterministic identity")
	_check(source.get("holes") == holes and current == original, "source owner and full G preserved after fixture cleanup")
	var detached: Dictionary = overlay.get_snapshot()
	detached["holes"].clear()
	_check(overlay.get_snapshot()["holes"].size() == 14, "snapshot detached")
	overlay.free()
	_check(_canvas_properties(world) == existing, "uninstall existing canvas unchanged")
	root.remove_child(main)
	main.free()
	_finish()

func _canvas_properties(parent: Node, excluded: Node = null) -> Dictionary:
	var result := {}
	for child in parent.get_children():
		if child == excluded:
			continue
		if child is CanvasItem:
			result[child.get_instance_id()] = [child.visible, child.z_index, child.material, child.modulate, child.light_mask]
		result.merge(_canvas_properties(child, excluded))
	return result

func _count_lights(parent: Node) -> int:
	var total := 1 if parent is Light2D else 0
	for child in parent.get_children():
		total += _count_lights(child)
	return total

func _finish() -> void:
	print("HOLE_RESULT ", JSON.stringify({"checks": checks, "failures": failures}))
	quit(1 if failures > 0 else 0)
