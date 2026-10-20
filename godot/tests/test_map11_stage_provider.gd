extends SceneTree
const USERDIR = "EXODUSER-map11-02-Isolated-20261021"
const Recipe = preload("res://scripts/maps/map11/stage_recipe.gd")
const Provider = preload("res://scripts/maps/map11/stage_provider.gd")
const Adapter = preload("res://scripts/maps/map11/stage_revision_adapter.gd")
var checks: int = 0
var failures: int = 0
class Owner extends Node:
	var live: bool = true
	func current(id: String, revision: int) -> bool: return live and id == "map11.arena" and revision == 1
func check(value: bool, label: String) -> void:
	checks += 1
	if not value:
		failures += 1
		printerr("MAP11_PROVIDER_FAIL ",label)
func compiled(recipe: Resource) -> RefCounted:
	var p = Provider.new()
	p.compile(recipe)
	return p
func _initialize() -> void: call_deferred("_run")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		quit(2)
		return
	var recipe = load("res://scripts/maps/map11/arena_recipe.tres").duplicate(true)
	var provider = compiled(recipe)
	check(provider.content_valid,"authored resource compiles")
	check(provider.errors.is_empty(),"no hidden validation errors")
	check(provider.describe().radius == 1700 and not provider.describe().runtime_ready,"real geometry independent of ready")
	# Inspect persistent Marker declarations without booting art/camera/Main.
	var scene_text: String = FileAccess.get_file_as_string("res://scenes/maps/map11/arena_preview.tscn")
	var node_pattern := RegEx.new()
	node_pattern.compile('\\[node name="(Entry|Boss|Exit|Return)"[^\\n]*\\]\\n([^\\[]*)')
	var marker_count: int = 0
	for found in node_pattern.search_all(scene_text):
		var marker: String = found.get_string(1)
		var position := Vector2.ZERO
		var prop_pattern := RegEx.new()
		prop_pattern.compile('position = Vector2\\(([-0-9.]+), ([-0-9.]+)\\)')
		var prop = prop_pattern.search(found.get_string(2))
		if prop != null: position = Vector2(float(prop.get_string(1)),float(prop.get_string(2)))
		for row in recipe.anchors:
			if row.marker == marker:
				marker_count += 1
				check(row.position == position,"actual preview Marker declaration "+marker)
	check(marker_count == 4,"all four persistent scene Markers accounted")
	var owner = Owner.new()
	root.add_child(owner)
	var adapter = Adapter.new()
	var out: Dictionary = {}
	check(not adapter.runtime_ready() and not adapter.can_move(Vector2.ZERO,15),"unbound fails closed")
	check(not adapter.sweep_circle(Vector2.ZERO,Vector2.ONE,15,out) and out.status == "NOT_READY","not ready query explicit")
	check(not adapter.bind_context(provider,owner,"map11.arena",2,owner.current),"wrong revision rejected")
	check(adapter.bind_context(provider,owner,"map11.arena",1,owner.current),"owner explicitly binds")
	for pair in [["entry","arena_entry","Entry",Vector2(0,800)],["boss","boss_center","Boss",Vector2.ZERO],["exit","arena_exit","Exit",Vector2(0,-1420)],["return","arena_return","Return",Vector2(0,1320)]]:
		var a: Dictionary = adapter.anchor("map11.arena."+pair[0],pair[1])
		check(a.status == "OK" and a.anchor.marker == pair[2] and a.anchor.position == pair[3] and a.anchor.region_id == 0,"stable marker "+pair[0])
	check(adapter.anchor("missing","arena_entry").status == "NOT_FOUND","missing never origin fallback")
	check(adapter.anchor("map11.arena.entry","boss_center").status == "NOT_FOUND","role mismatch rejected")
	check(adapter.can_move(Vector2(1685,0),15),"boundary contact allowed")
	check(not adapter.can_move(Vector2(1685.01,0),15),"outside extent blocked")
	check(not adapter.can_move(Vector2.ZERO,-1) and not adapter.can_move(Vector2(NAN,0),15),"invalid radius/nonfinite rejected")
	check(adapter.region_at(Vector2.ZERO) == 0 and adapter.region_at(Vector2(1701,0)) == -1,"arena namespace geometry")
	check(adapter.line_of_sight(Vector2(-1600,0),Vector2(1600,0)),"diameter LOS clear")
	check(not adapter.line_of_sight(Vector2.ZERO,Vector2(1701,0)),"outside LOS denied")
	check(adapter.sweep_circle(Vector2.ZERO,Vector2(2000,0),15,out) and out.hit and is_equal_approx(out.fraction,1685.0/2000.0),"analytic continuous boundary TOI")
	check(out.position.x < 1685 and out.normal.is_equal_approx(Vector2.LEFT),"safe contact/inward wall normal")
	check(adapter.sweep_circle(Vector2(100,50),Vector2(100,50),15,out) and not out.hit,"zero movement valid")
	check(not adapter.sweep_circle(Vector2(1800,0),Vector2.ZERO,15,out) and out.status == "INVALID_QUERY","invalid start not teleported")
	check(adapter.legacy_boss_metrics(out) and out.mw == 128 and out.mh == 108 and out.T == 40,"legacy metric mapping explicit")
	var max_len: int = int(maxi(out.mw,out.mh)*out.T*.45)
	check(max_len == 2304 and is_equal_approx(minf(750,max_len*.3),691.2),"original fissure formula not room-based")
	recipe.radius = 99
	recipe.anchors[0].position = Vector2(9999,9999)
	check(adapter.can_move(Vector2(1600,0),44) and adapter.anchor("map11.arena.entry","arena_entry").anchor.position == Vector2(0,800),"compiled snapshot isolated from author mutation")
	var a: Dictionary = adapter.anchor("map11.arena.entry","arena_entry")
	a.anchor.position = Vector2(8888,0)
	check(adapter.anchor("map11.arena.entry","arena_entry").anchor.position == Vector2(0,800),"returned metadata not mutable provider state")
	var block_recipe = Recipe.new()
	block_recipe.solids.assign([{"id":"obstacle","center":Vector2(600,0),"radius":100.0,"blocks_move":true,"blocks_los":true}])
	var blocked = compiled(block_recipe)
	check(blocked.content_valid,"off-route authored obstacle valid")
	check(blocked.can_move(Vector2(300,0),15) and blocked.can_move(Vector2(900,0),15),"both endpoints legal")
	var ba = Adapter.new()
	check(ba.bind_context(blocked,owner,"map11.arena",1,owner.current),"obstacle adapter binds")
	check(ba.sweep_circle(Vector2(300,0),Vector2(900,0),15,out) and out.hit and is_equal_approx(out.fraction,185.0/600.0),"no tunneling despite legal endpoints")
	check(out.normal.is_equal_approx(Vector2.LEFT) and blocked.can_move(out.position,15),"obstacle normal/safe position")
	check(not ba.line_of_sight(Vector2(300,0),Vector2(900,0)),"LOS blocked by exact circle")
	block_recipe.solids[0].blocks_move = false
	var los_only = compiled(block_recipe)
	check(los_only.can_move(Vector2(600,0),15) and not los_only.line_of_sight(Vector2(300,0),Vector2(900,0)),"LOS-only is not movement solid")
	check(not los_only.line_of_sight(Vector2(300,0),Vector2(500,0)),"LOS endpoint touch blocks")
	# Four core defect families: duplicate, outside, swept route obstruction, disconnection.
	var bad = Recipe.new()
	bad.anchors.append(bad.anchors[0].duplicate(true))
	check(not compiled(bad).content_valid,"duplicate anchor rejected")
	bad = Recipe.new()
	bad.anchors[2].position = Vector2(1690,0)
	var invalid = compiled(bad)
	check(not invalid.content_valid and not invalid.can_move(Vector2.ZERO,15),"anchor radius outside; invalid provider fails closed")
	bad = Recipe.new()
	bad.solids.assign([{"id":"route_blocker","center":Vector2(0,400),"radius":70.0,"blocks_move":true,"blocks_los":false}])
	invalid = compiled(bad)
	check(not invalid.content_valid and "ROUTE_SWEEP_BLOCKED:map11.arena.entry>map11.arena.boss" in invalid.errors,"route swept collision invalidates content")
	bad = Recipe.new()
	bad.routes.remove_at(1)
	invalid = compiled(bad)
	check(not invalid.content_valid and "UNREACHABLE_AUTHORED_ROUTE:map11.arena.exit" in invalid.errors,"unreachable exit rejected")
	bad = Recipe.new()
	bad.effect_extent = Vector3i(85,85,40)
	check(not compiled(bad).content_valid,"radius-derived legacy metric rejected")
	var pose := Transform2D(PI/2,Vector2(400,-200))
	check(adapter.bind_context(provider,owner,"map11.arena",1,owner.current,pose),"rigid world transform binds")
	check(adapter.anchor("map11.arena.entry","arena_entry").anchor.position.is_equal_approx(pose*Vector2(0,800)),"Marker local to world")
	check(adapter.can_move(pose*Vector2(1680,0),15),"world movement matches local geometry")
	check(not adapter.bind_context(provider,owner,"map11.arena",1,owner.current,Transform2D(Vector2(2,0),Vector2(0,2),Vector2.ZERO)),"scaled world rejected")
	check(not adapter.runtime_ready(),"failed rebind clears old context")
	check(adapter.bind_context(provider,owner,"map11.arena",1,owner.current),"rebind exact revision")
	owner.live = false
	check(not adapter.runtime_ready() and adapter.region_at(Vector2.ZERO) == -1,"replaced consumer context fails closed")
	owner.live = true
	provider.retire()
	check(not adapter.runtime_ready() and not adapter.legacy_boss_metrics(out) and out.is_empty(),"retired revision rejects stale consumer")
	owner.free()
	check(not ba.runtime_ready(),"freed owner invalidates weak binding")
	print("MAP11_PROVIDER_RESULT ",JSON.stringify({"checks":checks,"failures":failures}))
	quit(0 if failures == 0 else 1)
