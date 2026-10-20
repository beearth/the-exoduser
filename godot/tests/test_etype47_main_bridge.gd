extends SceneTree

const USERDIR = "EXODUSER-P2008B-Main-Isolated-20261020"
const HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
var checks := 0
var failures := 0

func _check(value: bool, label: String) -> void:
	checks += 1
	if not value:
		failures += 1
		print("SHADOW_MAIN_FAIL ", label)

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
	var matches: Array = world.get_enemies().filter(func(enemy: Node) -> bool: return enemy.get("source_order") == 11)
	_check(matches.size() == 1, "actual Main installed order11")
	var actor: Node2D = matches[0]
	var context: Dictionary = world.read_native_initial_encounter_spawn_context()
	_check(context.get("stage") == 0 and context.get("difficulty") == 5 and context.get("player_level") == 1, "actual owned source G/P/OPT context")
	actor.global_position = main.player.global_position + Vector2(180, 0)
	actor.shadow_state._stCloneT = 0
	actor._physics_process(1.0 / 60.0)
	_check(actor.shadow_error.is_empty() and actor.clone_attempts == 1 and actor.last_discarded_clone.valid, "actual Main clone constructor executes")
	_check(world.get_enemies().size() == 10, "actual clone not ens.push appended")
	var before: float = actor.eShield
	var resolver := HURTE.new()
	var outcome: Dictionary = resolver.execute(main, world, actor, 100, 0.0, 0, {"_lessonAttack": "weapon", "poiseHit": false})
	_check(outcome.get("ok") == true and actor.eShield < before and actor.hp == 875, "actual native hurtE uses dedicated shadow owner")
	main.queue_free()
	await process_frame
	await process_frame
	print("SHADOW_MAIN_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "public_input": false}))
	quit(1 if failures else 0)
