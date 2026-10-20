extends SceneTree
const USERDIR = "EXODUSER-map11-07-Isolated-20261021"
const TOUR = ["Start","Early","MainArena","WestLower","West","WestUpper","Landmark","LandmarkEast","Late","Return","Late","Gate","Late","LandmarkEast","Landmark","EastUpper","East","EastLower","MainArena","Early","Start"]
var checks: int = 0
var failures: int = 0
func check(ok: bool,label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FIELD_WALK_FAIL ",label)
func _initialize() -> void: call_deferred("_run")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		quit(2)
		return
	var field = load("res://scenes/maps/map11/field_preview.tscn").instantiate()
	root.add_child(field)
	await physics_frame
	await physics_frame
	field.set_physics_process(false)
	check(field.adapter.runtime_ready(),"real preview owner binds provider")
	check(field.provider.can_move(Vector2(0,1300),1600),"final notched outline preserves main diameter3200")
	var out: Dictionary = {}
	check(not field.adapter.legacy_boss_metrics(out) and out.is_empty(),"field never substitutes arena attack extent")
	var total: float = 0
	var steps: int = 0
	var visited: Dictionary = {}
	field.player.position = field.get_node("Markers/Start").position
	for name_ in TOUR:
		var target: Vector2 = field.get_node("Markers/"+name_).position
		var start: Vector2 = field.player.position
		var leg: float = start.distance_to(target)
		total += leg
		var step: float = 156.0/60.0
		var blocked: bool = false
		while field.player.position.distance_to(target)>.01:
			var delta: Vector2 = target-field.player.position
			var motion: Vector2 = delta.normalized()*minf(step,delta.length())
			var hit = field.player.move_and_collide(motion)
			steps += 1
			if hit != null:
				blocked = true
				break
			if steps>50000:
				blocked = true
				break
		check(not blocked and field.player.position.distance_to(target)<.1,"actual basic motion leg "+name_)
		check(field.adapter.can_move(field.player.position,15),"physics/provider position agreement "+name_)
		visited[field.adapter.region_at(field.player.position)] = true
	check(visited.size()==4 and not visited.has(-1),"native body visited all four regions")
	field.player.position = Vector2(-250,-3000)
	check(field.adapter.can_move(field.player.position,15),"occlusion probe is physically legal")
	field.update_occlusion(1)
	var tree: Node2D = field.get_node("D01SplitCorpseTree")
	check(tree.z_index>field.player.z_index and is_equal_approx(tree.modulate.a,.15),"foot sorted foreground actually fades")
	field.player.position = Vector2(-250,-2100)
	field.update_occlusion(1)
	check(tree.z_index<field.player.z_index and is_equal_approx(tree.modulate.a,1),"behind player mass restores full opacity")
	var f := FileAccess.open("user://field_walk_result.json",FileAccess.WRITE)
	var result: Dictionary = {"checks":checks,"failures":failures,"native_motion_steps":steps,"step_world_units":2.6,"tour_world_units":total,"simulated_game_seconds":total/156.0,"regions_visited":visited.keys(),"scope":"actual CharacterBody move_and_collide step replay in test, not wall-clock travel recording"}
	f.store_string(JSON.stringify(result))
	print("FIELD_WALK_RESULT ",JSON.stringify(result))
	field.free()
	quit(0 if failures==0 else 1)
