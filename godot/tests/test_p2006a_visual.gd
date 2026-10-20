extends SceneTree

const USERDIR := "EXODUSER-P2006A-Visual-Isolated-20261020"
const OUTPUT := "G:/exoduser-wt/_out/P2-006a-pc/visual/"
var main: Node
var outcomes: Array = []
var stage := "boot"
var forced_actor_fields := 0
var bag_before := 0

class VisualInput extends Node:
	var receiver: Callable
	func _input(event: InputEvent) -> void:
		receiver.call(event)

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		push_error("Visual fixture isolation required")
		quit(2)
		return
	root.title = "EXODUSER P2-006a PC visual fixture"
	root.size = Vector2i(1920, 1080)
	root.position = Vector2i(0, 0)
	root.content_scale_size = Vector2i(1920, 1080)
	var controls := VisualInput.new()
	controls.process_mode = Node.PROCESS_MODE_ALWAYS
	controls.receiver = _input
	root.add_child(controls)
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12):
		await physics_frame
	var player: Node2D = main.get("player")
	var world: Node2D = main.get("world")
	var source: Node = main.get("source_state")
	player.telemetry_event.connect(_on_telemetry)
	var parameters: Dictionary = source.read_current_p()
	parameters["activeLMBSk"] = "weapon"
	forced_actor_fields += 1
	stage = "combat"
	var swings := 0
	var kills := 0
	for enemy in world.get_enemies():
		if not is_instance_valid(enemy) or enemy.get("alive") != true:
			continue
		var enemy_id: int = enemy.get_instance_id()
		var killed := false
		for attempt in range(25):
			if not is_instance_valid(enemy) or enemy.get("alive") != true:
				break
			for frame in range(600):
				if player.get("state") == "idle" and float(player.get("stamina")) >= 20.0:
					break
				await physics_frame
			if player.get("state") == "dead" or player.get("state") == "fallen":
				break
			player.global_position = enemy.global_position + Vector2(-(47.0 + float(enemy.get("radius")) - 8.0), 0)
			player.set("facing", (enemy.global_position - player.global_position).normalized())
			forced_actor_fields += 2
			var before := outcomes.size()
			if not player.request_attack():
				player.release_attack()
				continue
			swings += 1
			for frame in range(300):
				await physics_frame
				if outcomes.size() > before:
					break
			player.release_attack()
			for outcome in outcomes.slice(before):
				if int(outcome.get("enemy_id", -1)) == enemy_id and outcome.get("killed") == true:
					killed = true
			if killed:
				kills += 1
				break
		if not source.read_native_drop_records().is_empty():
			break
	print("P2006A_VISUAL_COMBAT ", JSON.stringify({"swings": swings, "kills": kills,
		"forced_actor_fields": forced_actor_fields, "forced_damage": false, "forced_drop_rng": false,
		"records": source.read_native_drop_records()}))
	if source.read_native_drop_records().is_empty():
		push_error("No natural drop obtained; visual pickup not proven")
		main.queue_free()
		await process_frame
		await process_frame
		quit(1)
		return
	for frame in range(4):
		await process_frame
	var coordinates: Array = []
	for record in source.read_native_drop_records():
		coordinates.append({"serial": record.get("_wiSerial"),
			"world": [record["x"], record["y"]],
			"screen": world.get_canvas_transform() * Vector2(record["x"], record["y"])})
	DirAccess.make_dir_recursive_absolute(OUTPUT)
	bag_before = source.read_current_inventory()["bag"].size()
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(OUTPUT + "drop-viewport-1920x1080.png")
	print("P2006A_VISUAL_READY ", JSON.stringify({"coordinates": coordinates, "bag_before": bag_before,
		"viewport": root.get_visible_rect().size, "controls": "F8 resumes frozen frame; R picks up; F9 exits fixture"}))
	get_tree_paused(true)
	stage = "drop_frozen"

func get_tree_paused(value: bool) -> void:
	paused = value

func _input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo:
		return
	if event.physical_keycode == KEY_F8 and stage == "drop_frozen":
		paused = false
		stage = "pickup"
	if event.physical_keycode == KEY_F9:
		_finish.call_deferred()
	if event.physical_keycode == KEY_R and stage == "pickup":
		_capture_pickup.call_deferred()

func _capture_pickup() -> void:
	for frame in range(4):
		await process_frame
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(OUTPUT + "pickup-viewport-1920x1080.png")
	var source: Node = main.get("source_state")
	print("P2006A_VISUAL_PICKUP ", JSON.stringify({"bag_before": bag_before,
		"bag_after": source.read_current_inventory()["bag"].size(),
		"adapter": main.get("world").get_node("NativeWorldDrops").get_native_world_drops_snapshot()}))
	paused = true
	stage = "pickup_frozen"

func _on_telemetry(kind: String, data: Dictionary) -> void:
	if kind == "native_hurte":
		outcomes.append(data.duplicate(true))

func _finish() -> void:
	paused = false
	if is_instance_valid(main):
		main.queue_free()
	await process_frame
	await process_frame
	quit()
