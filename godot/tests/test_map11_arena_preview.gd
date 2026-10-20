extends SceneTree
const USERDIR = "EXODUSER-map11-01c-Isolated-20261021"
var checks: int = 0
var failures: int = 0
func _initialize() -> void: call_deferred("_run")
func check(ok: bool,label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("MAP11_FAIL ",label)
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		quit(2)
		return
	var arena = load("res://scenes/maps/map11/arena_preview.tscn").instantiate()
	root.add_child(arena)
	await physics_frame
	await physics_frame
	check(FileAccess.get_sha256("res://assets/maps/map11/boss_dark_druid_8dir_v3.png") == "ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549","existing source boss RGBA byte-identical")
	var r: Dictionary = arena.get_design_receipt()
	check(r.radius == 1700 and r.interior_pillars == 0,"R1700 no interior pillars")
	for key in ["Entry","Boss","Exit","Return"]:
		var marker: Node = arena.get_node("Markers/"+key)
		check(marker is Marker2D,"persistent named Marker "+key)
		check(arena.is_inside_arena(marker.position,44),"anchor has source boss clearance "+key)
	check(arena.is_inside_arena(Vector2(0,0),1700),"exact boundary admitted by analytical envelope")
	check(not arena.is_inside_arena(Vector2(1,0),1700),"one unit outside blocked")
	check(r.center_slam_margin == 380,"original phase4 slam margin 380")
	check(r.center_tide_margin == -50,"original tide margin -50")
	check(r.fissure_length == 2304 and is_equal_approx(r.fissure_blast,691.2),"fissure source metric never scaled to room")
	check(r.fissure_length_outside == 604 and is_equal_approx(r.fissure_full_envelope_outside,1295.2),"original outside envelope explicitly flagged")
	check(not arena.is_inside_arena(Vector2(2304,0),691.2),"do not pretend full fissure fits")
	var ids: Array = []
	for move in r.allowed_moves: ids.append(move.id)
	check(ids.size() == 23 and ids.has("burrowStrike"),"BC01 actual final si0 set")
	for excluded in ["teleStrike","tailSwipe","cageTrap"]: check(not ids.has(excluded),"no historical/other stage move "+excluded)
	check(r.look_script == "res://scripts/native_map_look.gd","actual shared look script reused")
	check(r.shadow_count == 51 and r.occluders == 51 and r.lights == 4,"actual look factories populated")
	check(r.contact_shadows == 2 and r.floor_decals == 4 and r.local_light_pools == 3,"contact shadows/real RGBA patches/local pools installed")
	check(not r.live_combat and not r.clear_writer and not r.tick_path_list_api,"presentation-only no writers/path trace API")
	# Real physics contact, not only implementation-shaped metadata comparisons.
	var query := PhysicsShapeQueryParameters2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 15
	query.shape = shape
	query.exclude = [arena.player.get_rid()]
	query.transform = Transform2D(0,Vector2(1695,0))
	check(not arena.get_world_2d().direct_space_state.intersect_shape(query).is_empty(),"physical rim catches actual player-sized circle")
	query.transform = Transform2D(0,Vector2(1300,0))
	check(arena.get_world_2d().direct_space_state.intersect_shape(query).is_empty(),"evade annulus physically unobstructed")
	query.transform = Transform2D(0,Vector2.ZERO)
	check(arena.get_world_2d().direct_space_state.intersect_shape(query).is_empty(),"center physically pillar-free")
	for id in ["entry","close","wall","clear","body","bullets"]:
		arena.select_board(id)
		check(arena.is_inside_arena(arena.player.position,15),"board player fits "+id)
	check(ProjectSettings.get_setting("application/run/main_scene") == "res://scenes/main.tscn","product main path unchanged")
	arena.free()
	print("MAP11_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"live_combat":false,"d05":"circular smaller"}))
	quit(0 if failures == 0 else 1)
