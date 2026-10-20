extends SceneTree

const USERDIR = "EXODUSER-P2006B-Drops-Isolated-20261020"
const OUTPUT = "G:/exoduser-wt/_out/P2-006b-pc/visual-drops-final/"
var main: Node
var outcomes: Array = []
var observations: Array = []
var interventions := 0

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		quit(2)
		return
	root.title = "EXODUSER P2-006b isolated post-effect drops"
	root.size = Vector2i(1920, 1080)
	root.content_scale_size = Vector2i(1920, 1080)
	DirAccess.make_dir_recursive_absolute(OUTPUT)
	main = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12):
		await physics_frame
	var player: Node2D = main.get("player")
	var world: Node2D = main.get("world")
	var source: Node = main.get("source_state")
	var parameters: Dictionary = source.read_current_p()
	var original_skill: Variant = parameters.get("activeLMBSk")
	player.telemetry_event.connect(_on_telemetry)
	parameters["activeLMBSk"] = "weapon"
	interventions += 1
	var swings := 0
	for enemy in world.get_enemies():
		if not is_instance_valid(enemy) or enemy.get("alive") != true:
			continue
		for attempt in range(25):
			if not is_instance_valid(enemy) or enemy.get("alive") != true:
				break
			for frame in range(600):
				if player.get("state") == "idle" and float(player.get("stamina")) >= 20.0:
					break
				await physics_frame
			player.global_position = enemy.global_position + Vector2(-(47.0 + float(enemy.get("radius")) - 8.0), 0)
			player.set("facing", (enemy.global_position - player.global_position).normalized())
			interventions += 2
			var previous := outcomes.size()
			if not player.request_attack():
				player.release_attack()
				continue
			swings += 1
			for frame in range(300):
				await physics_frame
				if outcomes.size() > previous:
					break
			player.release_attack()
			if not source.read_native_drop_records().is_empty():
				break
		if not source.read_native_drop_records().is_empty():
			break
	parameters["activeLMBSk"] = original_skill
	interventions += 1
	if source.read_native_drop_records().is_empty():
		print("P2006B_DROPS_ABORT no natural drop")
		_finish()
		return
	var death_fx: Node = world.get("_native_death_fx")
	for frame in range(121):
		await physics_frame
		if frame == 0:
			await _capture("native-natural-immediate", false)
	var rendered_wait := 0
	for frame in range(180):
		var counts: Dictionary = death_fx.get_snapshot()["counts"]
		if int(counts["blood_anims"]) == 0 and int(counts["di"]) == 0 \
				and int(counts["impacts"]) == 0 and int(counts["hit_vfx"]) == 0:
			break
		await process_frame
		rendered_wait += 1
	var expired: Dictionary = death_fx.get_snapshot()
	await _capture("native-natural-afterfx", false)
	var natural_records: Array = source.read_native_drop_records().duplicate(true)
	var preview: Array = []
	for rarity in range(6):
		var item: Dictionary = natural_records[0]["item"].duplicate(true)
		item["rarity"] = rarity
		item.erase("layerLv")
		preview.append({"type": "item", "picked": false, "_dropPreview": true,
			"x": player.global_position.x - 360.0 + float(rarity) * 144.0,
			"y": player.global_position.y + 260.0, "item": item})
	source.append_native_drop_records(main, preview)
	for frame in range(3):
		await physics_frame
	paused = true
	for sample in range(3):
		main.get("world").get_node("NativeWorldDrops").queue_redraw()
		main.get("world").get_node("NativeWorldDrops").get("_beam_layer").queue_redraw()
		await _capture("native-rarities-%d" % sample, true)
		await create_timer(0.22, true, false, true).timeout
	var result := {"swings": swings, "test_actor_interventions": interventions,
		"forced_damage": false, "forced_drop_rng": false, "preview_records": 6,
		"post_kill_wait_physics_frames": 121, "death_fx_after_wait": expired,
		"additional_render_frames": rendered_wait,
		"observations": observations}
	var file := FileAccess.open(OUTPUT + "observations.json", FileAccess.WRITE)
	file.store_string(JSON.stringify(result, "\t"))
	file.close()
	print("P2006B_DROPS_RESULT ", JSON.stringify(result))
	_finish()

func _capture(label: String, preview: bool) -> void:
	var source: Node = main.get("source_state")
	var world: Node2D = main.get("world")
	main.get("hud").call("_refresh_native_first_fight_hud")
	var before := Time.get_ticks_msec()
	await RenderingServer.frame_post_draw
	root.get_texture().get_image().save_png(OUTPUT + label + ".png")
	var coordinates: Array = []
	for record in source.read_native_drop_records():
		var screen: Vector2 = world.get_canvas_transform() * Vector2(record["x"], record["y"])
		coordinates.append({"serial": record.get("_wiSerial"), "screen": [screen.x, screen.y], "record": record.duplicate(true)})
	var transform: Transform2D = world.get_canvas_transform()
	observations.append({"label": label, "preview": preview, "now_before": before,
		"now_after": Time.get_ticks_msec(), "coordinates": coordinates,
		"canvas_origin": [transform.origin.x, transform.origin.y],
		"player_position": [main.get("player").global_position.x, main.get("player").global_position.y],
		"lmb_icon": main.get("hud").get_native_first_fight_hud_snapshot()["slot_icon_files"]["skSlotLMB"]})

func _on_telemetry(kind: String, data: Dictionary) -> void:
	if kind == "native_hurte":
		outcomes.append(data.duplicate(true))

func _finish() -> void:
	paused = false
	main.get_parent().remove_child(main)
	main.free()
	quit()
