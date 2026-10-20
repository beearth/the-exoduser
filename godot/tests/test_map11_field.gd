extends SceneTree
const USERDIR = "EXODUSER-map11-07-Isolated-20261021"
const Recipe = preload("res://scripts/maps/map11/field_recipe.gd")
const Provider = preload("res://scripts/maps/map11/field_provider.gd")
const Adapter = preload("res://scripts/maps/map11/stage_revision_adapter.gd")
var checks: int = 0
var failures: int = 0
func _initialize() -> void: call_deferred("_run")
func check(ok: bool,label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("FIELD_FAIL ",label)
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		quit(2)
		return
	var recipe = Recipe.new()
	var p = Provider.new()
	check(p.compile(recipe),"real field recipe compile: "+str(p.errors))
	if not p.content_valid:
		print("FIELD_RESULT ",JSON.stringify({"checks":checks,"failures":failures}))
		quit(1)
		return
	check(recipe.routes.size()-recipe.anchors.size()+1 == 2,"two independent circulation cycles")
	for row in recipe.anchors:
		check(p.can_move(row.position,96),"swept fixture clearance "+row.id)
		check(p.region_at(row.position)==row.region_id,"unique region "+row.id)
	check(p.region_at(Vector2.ZERO)==0,"shared center boundary chooses smallest id")
	check(p.region_at(Vector2(10000,0))==-1,"outside no region")
	check(not p.can_move(Vector2(-1800,-550),15),"dry mass physical")
	check(not p.line_of_sight(Vector2(-2800,-550),Vector2(-800,-550)),"LOS uses authored mass")
	check(p.sweep_fraction(Vector2(-2800,-550),Vector2(-800,-550),15)<1,"continuous sweep catches between legal endpoints")
	check(p.can_move(Vector2(0,1300),1600),"main arena unobstructed diameter3200")
	var n: int = 0
	for point in [Vector2(-4000,-400),Vector2(4500,600),Vector2(-700,3800)]:
		var t: float = p.sweep_fraction(Vector2.ZERO,point,15)
		if t < 1: n += 1
	check(n>0,"polygon/solid sweep reports contacts")
	var broken = Recipe.new()
	broken.anchors[0].position = Vector2(9000,9000)
	check(not Provider.new().compile(broken),"outside content rejected")
	broken = Recipe.new()
	broken.regions[1].polygon = broken.regions[0].polygon
	check(not Provider.new().compile(broken),"region overlap/gap rejected")
	broken = Recipe.new()
	broken.routes.remove_at(0)
	check(not Provider.new().compile(broken),"unreachable authored start rejected")
	broken = Recipe.new()
	broken.anchors.append(broken.anchors[0].duplicate(true))
	check(not Provider.new().compile(broken),"duplicate id rejected")
	print("FIELD_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"bounds":p.describe().bounds,"regions":4,"cycles":2}))
	quit(0 if failures==0 else 1)
