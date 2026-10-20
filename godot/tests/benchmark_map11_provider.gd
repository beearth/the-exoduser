extends SceneTree
const USERDIR = "EXODUSER-map11-02-Isolated-20261021"
const Provider = preload("res://scripts/maps/map11/stage_provider.gd")
const Adapter = preload("res://scripts/maps/map11/stage_revision_adapter.gd")
class Owner extends Node:
	func current(id: String, rev: int) -> bool: return id == "map11.arena" and rev == 1
func _initialize() -> void: call_deferred("_run")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		quit(2)
		return
	var p = Provider.new()
	var owner = Owner.new()
	root.add_child(owner)
	var a = Adapter.new()
	if not p.compile(load("res://scripts/maps/map11/arena_recipe.tres")) or not a.bind_context(p,owner,"map11.arena",1,owner.current):
		owner.free()
		quit(3)
		return
	var out: Dictionary = {}
	var successes: int = 0
	# One fixed-size synchronous wall-clock query sample; no list construction.
	var start: int = Time.get_ticks_usec()
	for i in range(10000):
		if a.can_move(Vector2(500,500),15): successes += 1
		if a.line_of_sight(Vector2(-1000,200),Vector2(1000,200)): successes += 1
		if a.sweep_circle(Vector2.ZERO,Vector2(2000,0),15,out) and out.hit: successes += 1
	var elapsed: int = Time.get_ticks_usec()-start
	var mean_us: float = float(elapsed)/10000.0
	print("MAP11_QUERY_BENCH ",JSON.stringify({"batches":10000,"queries":30000,"successful_results":successes,"wall_us":elapsed,"mean_three_query_us":mean_us,"frame_budget_ms":8.333333,"map_cpu_budget_ms":1.25,"conservative_140_mixed_query_ms":mean_us*140.0/3.0/1000.0,"scope":"bound adapter + default obstacle-free arena; synthetic CPU queries, not frame/GPU proof"}))
	owner.free()
	quit(0 if successes == 30000 else 4)
