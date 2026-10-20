extends SceneTree
const USERDIR := "EXODUSER-maplook-shadow-Isolated-20261020"
const SHADOW = preload("res://scripts/maplook/actor_contact_shadows.gd")
var assertions := 0
var failed: Array = []

class PerspectiveOwner extends Node2D:
	func get_native_perspective_view_snapshot() -> Dictionary:
		return {"ready": true}

func _initialize() -> void:
	call_deferred("_run")

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok: failed.append(label); print("SHADOW_FAIL ", label)

func _render_state(node: Node) -> Array:
	var rows: Array = []
	if node is CanvasItem:
		rows.append([node.get_instance_id(), node.visible, node.z_index, node.material, node.modulate])
		if node is Sprite2D: rows[-1].append(node.texture)
	for child in node.get_children(): rows.append_array(_render_state(child))
	return rows

func _dispose(node: Node) -> void:
	node.get_parent().remove_child(node)
	node.free()

func _boot(mode: String) -> Node:
	var main: Node = (load("res://scenes/main.tscn") as PackedScene).instantiate()
	if mode != "": main.set_meta("native_map_look", mode)
	root.add_child(main)
	main.process_mode = Node.PROCESS_MODE_DISABLED
	return main

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		quit(2); return
	var main: Node = _boot("")
	check(main.world.get_node_or_null("NativeMapLook") == null, "harness default off")
	check(main.world.get_node_or_null("MaplookActorContactShadows") == null, "off installs zero shadows")
	var state_before: Array = _render_state(main)
	var data_before: String = JSON.stringify(main.world.map_data)
	var g_before: String = JSON.stringify(main.source_state.read_current_g())
	seed(87001)
	var expected_random := randf()
	seed(87001)
	var overlay: Node2D = SHADOW.install(main.world, main.world.map_data, main.player)
	check(randf() == expected_random, "no shared RNG consumed")
	check(SHADOW.install(main.world, {}, main.player) == overlay, "install idempotent")
	check(SHADOW.install(null, {}, main.player) == null, "missing world rejected")
	check(SHADOW.install(main.world, {}, null) == null, "missing player rejected")
	var snap: Dictionary = overlay.get_snapshot()
	check(snap.tracked > 1, "player and actual enemy shadows tracked")
	var player_row: Dictionary = snap.rows.filter(func(r): return r.player)[0]
	var foot: Vector2 = main.player.get_native_projection_metadata().world_foot
	check(Vector2(player_row.foot[0], player_row.foot[1]).is_equal_approx(foot), "player existing anchor used")
	for row in snap.rows:
		check(row.z > -2005 and row.z < -2000, "decal below shadow below actor: " + row.actor)
	check(snap.cast_direction[0] > 0 and snap.cast_direction[1] > 0, "NW world light casts SE")
	main.world.remove_child(overlay)
	check(_render_state(main) == state_before, "existing texture material visibility z modulate unchanged")
	check(JSON.stringify(main.world.map_data) == data_before, "gameplay map bytes unchanged")
	check(JSON.stringify(main.source_state.read_current_g()) == g_before, "entire current G unchanged")
	main.world.add_child(overlay)
	var pixels := Image.create(32,64,false,Image.FORMAT_RGBA8)
	pixels.fill(Color.TRANSPARENT)
	pixels.fill_rect(Rect2i(8,36,8,12),Color.WHITE)
	var padded := Sprite2D.new()
	padded.texture = ImageTexture.create_from_image(pixels)
	main.world.add_child(padded)
	check(overlay._enemy_foot(padded).is_equal_approx(padded.to_global(Vector2(-4,15.5))), "opaque foot excludes transparent frame padding")
	padded.flip_h = true
	check(overlay._enemy_foot(padded).is_equal_approx(padded.to_global(Vector2(4,15.5))), "flipped opaque foot follows visible pixels")
	padded.flip_v = true
	check(overlay._enemy_foot(padded).is_equal_approx(padded.to_global(Vector2(4,-15.5))), "vertical flip preserves ground anchor mapping")
	padded.free()
	var original := Node2D.new()
	original.name = "ExistingContactShadow"
	main.player.add_child(original)
	overlay._process(0.0)
	check(overlay.get_snapshot().rows.filter(func(r): return r.player)[0].reason == "existing_shadow_or_perspective", "existing visible shadow suppresses duplicate")
	original.visible = false
	overlay._process(0.0)
	check(overlay.get_snapshot().rows.filter(func(r): return r.player)[0].visible, "hidden existing shadow does not suppress")
	original.free()
	var enemy: Node2D = get_nodes_in_group("enemies")[0]
	var old_position: Vector2 = enemy.position
	enemy.position += Vector2(100, 40)
	overlay._process(0.0)
	var record: Dictionary = overlay._records[enemy.get_instance_id()]
	var before_foot: Vector2 = record.foot
	enemy.position += Vector2(37, -21)
	overlay._process(0.0)
	check((record.foot - before_foot).is_equal_approx(Vector2(37, -21)), "enemy moving foot follows transform")
	var alive: bool = enemy.alive
	enemy.alive = false
	overlay._process(0.0)
	check(not record.node.visible, "death hides own shadow immediately")
	enemy.alive = alive
	enemy.visible = false
	overlay._process(0.0)
	check(not record.node.visible, "hidden enemy no orphan shadow")
	enemy.visible = true
	enemy.position = old_position
	# Dynamic arrival, foreign-world filtering, removal, and temporary reparent.
	var extra := Sprite2D.new()
	extra.texture = GradientTexture2D.new()
	var actor := Node2D.new()
	actor.add_child(extra); main.world.add_child(actor); actor.add_to_group("enemies")
	overlay._process(0.21)
	check(overlay._records.has(actor.get_instance_id()), "new enemy discovered")
	main.world.remove_child(actor); main.add_child(actor)
	overlay._process(0.0)
	check(not overlay._records.has(actor.get_instance_id()), "foreign/reparented enemy retired")
	actor.free()
	_dispose(main)
	var perspective := PerspectiveOwner.new()
	var world := Node2D.new()
	var player := Node2D.new()
	perspective.add_child(world); perspective.add_child(player); root.add_child(perspective)
	var duplicate: Node2D = SHADOW.install(world, {}, player)
	check(duplicate.get_snapshot().perspective_skipped and duplicate.get_snapshot().visible == 0, "3D presentation suppresses own 2D shadows")
	_dispose(perspective)
	# The official loader discovers this module without common-code changes.
	main = _boot("on")
	var look: Node = main.world.get_node_or_null("NativeMapLook")
	check(look != null and look.get_native_map_look_snapshot().active, "real map look on")
	overlay = main.world.get_node_or_null("MaplookActorContactShadows")
	check(overlay != null and look.get_native_map_look_snapshot().modules.has("actor_contact_shadows"), "MODULES automatically installs own path")
	var out := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--capture="): out = arg.trim_prefix("--capture=")
	if not out.is_empty(): await _capture(main, overlay, out)
	_dispose(main)
	print("MAPLOOK_SHADOW_RESULT ", JSON.stringify({"assertions": assertions, "failures": failed.size(), "failed": failed}))
	quit(0 if failed.is_empty() else 1)

func _capture(main: Node, overlay: Node2D, out: String) -> void:
	check(DisplayServer.get_name() != "headless", "capture requires real GUI")
	if DisplayServer.get_name() == "headless": return
	root.size = Vector2i(1920, 1080)
	root.gui_disable_input = true
	DirAccess.make_dir_recursive_absolute(out)
	main.hud.set_native_debug_overlay_visible(false)
	main.player.global_position = Vector2(4020, 7360)
	main.camera.global_position = main.player.global_position
	main.camera.reset_smoothing()
	main.world._update_visible_chunks(main.player.global_position, true)
	var enemies: Array = get_nodes_in_group("enemies")
	# Actual imported actors, staged for display-only comparison, not a natural encounter.
	for i in enemies.size():
		var actor: Node2D = enemies[i]
		actor.global_position = main.player.global_position + Vector2(-310 + (i % 5) * 155, -170 + (i / 5) * 330)
		actor.process_mode = Node.PROCESS_MODE_DISABLED
		if "_spawn_ticks" in actor:
			actor.set("_spawn_ticks", 0.0)
			actor.call("_update_animation")
	var look: Node = main.world.get_node("NativeMapLook")
	look._process(0.0)
	overlay._process(0.21)
	for i in range(12): await process_frame
	await RenderingServer.frame_post_draw
	var image: Image = root.get_texture().get_image()
	check(image.get_size() == Vector2i(1920,1080), "real 1920x1080 viewport")
	var crop_rects: Array = []
	var transform: Transform2D = main.world.get_global_transform_with_canvas()
	var rows: Array = overlay.get_snapshot().rows
	var selected: Array = rows.filter(func(r): return r.player)
	var enemy_rows: Array = rows.filter(func(r): return not r.player)
	selected.append(enemy_rows[0])
	selected.append(enemy_rows[mini(7,enemy_rows.size()-1)])
	for row in selected:
		var center: Vector2 = transform * main.world.to_local(Vector2(row.foot[0], row.foot[1]))
		crop_rects.append(Rect2i(Vector2i(center) - Vector2i(128,180), Vector2i(256,256)))
	var images: Array[Image] = []
	for enabled in [false, true]:
		overlay.visible = enabled
		await RenderingServer.frame_post_draw
		image = root.get_texture().get_image()
		images.append(image)
		var label := "after" if enabled else "before"
		image.save_png(out.path_join("full_"+label+".png"))
		for i in crop_rects.size(): image.get_region(crop_rects[i]).save_png(out.path_join("crop%d_%s_1x.png" % [i+1,label]))
	var comparison := Image.create(3840,1080,false,Image.FORMAT_RGBA8)
	comparison.blit_rect(images[0],Rect2i(0,0,1920,1080),Vector2i.ZERO)
	comparison.blit_rect(images[1],Rect2i(0,0,1920,1080),Vector2i(1920,0))
	comparison.save_png(out.path_join("comparison_full_left_before_right_after.png"))
	for i in crop_rects.size():
		comparison = Image.create(512,256,false,Image.FORMAT_RGBA8)
		comparison.blit_rect(images[0],crop_rects[i],Vector2i.ZERO)
		comparison.blit_rect(images[1],crop_rects[i],Vector2i(256,0))
		comparison.save_png(out.path_join("comparison_crop%d_1x_left_before_right_after.png" % (i+1)))
	var pixel_deltas: Array = []
	for rect in crop_rects:
		var changed := 0
		var maximum := 0.0
		for y in range(rect.position.y,rect.end.y):
			for x in range(rect.position.x,rect.end.x):
				var a := images[0].get_pixel(x,y)
				var b := images[1].get_pixel(x,y)
				var difference := maxf(absf(a.r-b.r),maxf(absf(a.g-b.g),absf(a.b-b.b)))
				if difference > 0.002: changed += 1
				maximum = maxf(maximum,difference)
		pixel_deltas.append({"changed_pixels":changed,"max_channel_difference":maximum})
	# Main includes animated grain/pets. Pixel deltas are evidence, not proof that
	# each changed pixel belongs to our shadow. Test the exact material separately.
	var audit := SubViewport.new()
	audit.size = Vector2i(256,128)
	audit.render_target_update_mode = SubViewport.UPDATE_ALWAYS
	root.add_child(audit)
	var ground := Polygon2D.new()
	ground.polygon = PackedVector2Array([Vector2.ZERO,Vector2(256,0),Vector2(256,128),Vector2(0,128)])
	ground.color = Color(0.5,0.5,0.5)
	audit.add_child(ground)
	var stamp := MeshInstance2D.new()
	stamp.mesh = overlay._mesh; stamp.material = overlay._material; stamp.position = Vector2(128,64)
	audit.add_child(stamp)
	stamp.visible = false
	await RenderingServer.frame_post_draw
	var control: Image = audit.get_texture().get_image()
	stamp.visible = true
	await RenderingServer.frame_post_draw
	var shadowed: Image = audit.get_texture().get_image()
	shadowed.save_png(out.path_join("gpu_material_audit.png"))
	print("SHADOW_GPU_SAMPLES ",JSON.stringify({"center":shadowed.get_pixel(128,64).r,"SE":shadowed.get_pixel(156,82).r,"NW":shadowed.get_pixel(100,46).r,"NE":shadowed.get_pixel(156,46).r,"SW":shadowed.get_pixel(100,82).r}))
	check(shadowed.get_pixel(128,64).r < control.get_pixel(128,64).r - 0.1, "GPU material darkens contact on flat ground")
	check(shadowed.get_pixel(156,82).r < shadowed.get_pixel(100,46).r - 0.005, "GPU material SE cast exceeds symmetric NW sample")
	check(absf(shadowed.get_pixel(50,30).r-control.get_pixel(50,30).r) < 0.005, "GPU stamp has transparent outside")
	check(shadowed.get_pixel(145,64).r > shadowed.get_pixel(128,64).r, "GPU contact edge fades softly")
	audit.free()
	var evidence: Dictionary = {"viewport":[1920,1080], "map_look":"on", "comparison":"only own overlay off/on; other map look stays on", "staged_actual_actors":true, "snapshot":overlay.get_snapshot(), "crops":[]}
	evidence["crop_pixel_deltas"] = pixel_deltas
	for i in crop_rects.size(): evidence.crops.append({"actor":selected[i].actor,"rect":[crop_rects[i].position.x,crop_rects[i].position.y,256,256],"scale":1})
	var file := FileAccess.open(out.path_join("capture.json"),FileAccess.WRITE)
	file.store_string(JSON.stringify(evidence,"\t")); file.close()
	print("MAPLOOK_SHADOW_CAPTURE ",JSON.stringify(evidence))
