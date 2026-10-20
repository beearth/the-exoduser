extends SceneTree

const HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const USERDIR := "EXODUSER-P2008A-HurtE-Isolated-20261020"
var checks := 0
var failures := 0

func _initialize() -> void:
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		print("P2008A_HURTE_FAIL ", label)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		push_error("P2008A actual Main fixture requires isolated userdir")
		quit(2)
		return
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12):
		await physics_frame
	var world: Node2D = main.get("world")
	_check(world.get_encounter_report().get("supported_count") == 9, "actual Main installs source nine actors")
	var tested := 0
	for enemy in world.get_enemies():
		if enemy.get("etype") != 20:
			continue
		tested += 1
		var before_hp: float = enemy.hp
		var before_shield: float = enemy.eShield
		var resolver = HURTE.new()
		var outcome: Dictionary = resolver.execute(main, world, enemy, 100, 0.0, 0,
			{"_lessonAttack": "weapon", "poiseHit": false})
		_check(outcome.get("ok") == true, "actual hurtE source pipeline accepts order%d: %s" % [enemy.source_order, str(outcome.get("reason", ""))])
		_check(enemy.hp == before_hp and enemy.eShield < before_shield,
			"source shield absorbs fixture base100 without HP write order%d" % enemy.source_order)
		resolver = null
	_check(tested == 3, "three original etype20 profiles tested")
	main.queue_free()
	await process_frame
	await process_frame
	print("P2008A_HURTE_RESULT ", JSON.stringify({"checks": checks, "failures": failures,
		"fixture_base_damage": 100, "public_player_input": false, "save_format_changed": false}))
	quit(1 if failures > 0 else 0)
