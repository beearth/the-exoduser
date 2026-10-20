extends SceneTree

const USERDIR = "EXODUSER-P2008B-DarkMain-Isolated-20261020"
const HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
var checks := 0
var failures := 0

func _check(value: bool, label: String) -> void:
	checks += 1
	if not value:
		failures += 1
		print("DARK_MAIN_FAIL ", label)

func _initialize() -> void: call_deferred("_run")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		quit(2)
		return
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12): await physics_frame
	paused = true
	var world: Node2D = main.world
	var matches: Array = world.get_enemies().filter(func(enemy: Node) -> bool: return enemy.get("source_order") == 9)
	_check(matches.size() == 1 and world.get_enemies().size() == 11, "actual Main order9 and eleven initial actors")
	var actor: Node2D = matches[0]
	_check(world.supports_native_projectile_hit_fx("dark", true), "actual world dark FX ready")
	actor._fire_projectile()
	var shots := get_nodes_in_group("dark_enemy_projectiles")
	_check(actor.dark_error.is_empty() and shots.size() == 1, "actual dark kernel birth, no dummy emitter")
	if not shots.is_empty():
		_check(shots[0].damage == 62 and shots[0].life_ticks == 240 and shots[0].get_parent() == world and shots[0].player == main.player, "actual source damage/life/world/player identity")
	var before: float = actor.eShield
	var resolver := HURTE.new()
	var outcome: Dictionary = resolver.execute(main, world, actor, 100, 0.0, 0, {"_lessonAttack": "weapon", "poiseHit": false})
	_check(outcome.get("ok") == true and actor.eShield < before and actor.hp == 875, "actual native hurtE dedicated dark owner")
	main.queue_free()
	await process_frame
	await process_frame
	print("DARK_MAIN_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "public_input": false}))
	quit(1 if failures else 0)
