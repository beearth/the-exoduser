extends SceneTree
const USERDIR = "EXODUSER-map11-02-Isolated-20261021"
const Recipe = preload("res://scripts/maps/map11/stage_recipe.gd")
const Provider = preload("res://scripts/maps/map11/stage_provider.gd")
func _initialize() -> void: call_deferred("_run")
func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		quit(2)
		return
	var failures: int = 0
	for fault in range(3):
		var recipe = Recipe.new()
		if fault == 0: recipe.regions[0].id = []
		elif fault == 1: recipe.regions[0].key = 123
		else: recipe.solids.append({"id":[],"center":Vector2(600,0),"radius":100,"blocks_move":true,"blocks_los":false})
		var provider = Provider.new()
		if provider.compile(recipe) or provider.errors.is_empty() or provider.can_move(Vector2.ZERO,15):
			failures += 1
			printerr("MAP11_SCHEMA_FAIL ",fault)
	print("MAP11_SCHEMA_RESULT ",JSON.stringify({"checks":3,"failures":failures}))
	quit(0 if failures == 0 else 1)
