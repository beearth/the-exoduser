extends SceneTree

const FACTORY = preload("res://scripts/enemy_factory.gd")
const USERDIR = "EXODUSER-P2008B-Isolated-20261020"
var checks := 0
var failures := 0

class TechnicalWorld extends Node2D:
	var actors: Array = []
	var blocked := false
	var samples := 0
	var context := {"stage": 0, "room": null, "player_level": 1, "difficulty": 5, "stage_difficulty_offset": 0}
	func can_move(_point: Vector2, _radius: float) -> bool: return not blocked
	func is_world_blocked(_point: Vector2) -> bool: return blocked
	func native_safe_point(_x: float, _y: float, _radius: float) -> Variant: return null
	func has_line_of_sight(_from: Vector2, _to: Vector2) -> bool: return true
	func get_path_direction(_point: Vector2) -> Vector2: return Vector2.RIGHT
	func get_enemies() -> Array: return actors
	func get_native_world_identity() -> Array: return actors
	func get_native_frame() -> float: return 100.0
	func sample_native_random_unit() -> float:
		samples += 1
		return 0.5
	func read_native_initial_encounter_spawn_context() -> Dictionary: return context
	func emit_native_parts(_origin: Vector2, _color: String, _count: int) -> void: pass
	func emit_native_text(_x: float, _y: float, _text: Variant, _color: Variant, _life: Variant, _size: Variant = null, _number: Variant = null) -> bool: return true

class Target extends Node2D:
	var hp := 10000.0
	var radius := 15.0
	var iframes := 0.0
	var state := "idle"
	var requests: Array = []
	var impulse := Vector2.ZERO
	func get_native_element_multiplier(_element: int) -> float: return 1.0
	func receive_damage(amount: int, _type := "phys", _direction := Vector2.ZERO, _impulse := 0.0) -> bool:
		requests.append(amount)
		return true
	func apply_native_posthurt_knockback(value: Vector2) -> void: impulse += value
	func apply_native_burn(_pool: float) -> bool: return true

func _initialize() -> void:
	paused = true
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		print("P2008B_FAIL ", label)

func _run() -> void:
	var source: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))
	var factory = FACTORY.new()
	var record: Dictionary = source.records[11]
	_check(factory.unsupported_reason(record).is_empty(), "exact order11 admitted")
	if not factory.unsupported_reason(record).is_empty():
		_finish()
		return
	var world := TechnicalWorld.new()
	root.add_child(world)
	var before := JSON.stringify(source)
	var report: Dictionary = factory.consume_atomic(source, world)
	_check(report.supported_count == 11 and report.unsupported_count == 5, "11 supported / 5 honest stops")
	_check(before == JSON.stringify(source), "frozen export unchanged")
	world.actors = report.instances
	for actor in world.actors: world.add_child(actor)
	var matches: Array = world.actors.filter(func(actor: Node) -> bool: return actor.get("source_order") == 11)
	_check(matches.size() == 1, "single exact shadow twin")
	var actor: Node2D = matches[0]
	_check(actor.get_script().resource_path == "res://scripts/enemy_ch1_shadow_twin.gd", "dedicated script")
	_check(actor.hp == 875 and actor.attack == 31 and actor.el == 0 and actor.eShield == 875, "original stats")
	_check(actor.shadow_state._stCloneT == record.native_final._stCloneT and actor.shadow_state._stTpCd == record.native_final._stTpCd, "original timers")
	_check(actor.read_native_normal_enemy_hurte_fields(world).get("ready") == true, "actual hurtE owner")
	var target := Target.new()
	world.add_child(target)
	target.position = actor.position + Vector2(200, 0)
	actor.set_player(target)
	var origin := actor.position
	actor._physics_process(1.0 / 60.0)
	var expected := origin + Vector2.RIGHT * float(record.speed_pixels_per_tick)
	expected += Vector2.RIGHT * float(record.speed_pixels_per_tick) * 1.6
	_check(actor.position == expected, "source flow1 + idle1.6")
	actor.shadow_state._stCloneT = 0.0
	var count := world.actors.size()
	var draws := world.samples
	actor._physics_process(1.0 / 60.0)
	_check(world.actors.size() == count and actor.clone_attempts == 1, "mkEn clone discarded, no ens.push")
	_check(world.samples - draws == 13, "two offsets + eleven normal type40 constructor draws")
	_check(actor.last_discarded_clone.hp == 262 and actor.last_discarded_clone.atk == 15 and actor.last_discarded_clone.el == 3 and actor.last_discarded_clone.eShield == 0, "clone trunc .3/.5 and physical-falsy dark fallback")
	actor.shadow_state._stTpCd = 0.0
	actor._physics_process(1.0 / 60.0)
	_check(actor.shadow_state._tpWarnT == 120 and actor.shadow_state._tpWarnMax == 120, "warning does not decrement on creation")
	var destination := Vector2(actor.shadow_state._tpWarnX, actor.shadow_state._tpWarnY)
	_check(absf(destination.distance_to(target.position) - 80.0) < 0.001, "target radius60 + U40")
	actor.state = "recover"
	actor.st2 = 1000.0
	actor._physics_process(1.0 / 60.0)
	_check(actor.shadow_state._tpWarnT == 120, "recover pauses warning")
	actor.state = "idle"
	actor.shadow_state._tpWarnT = 1.0
	target.position = destination + Vector2(10, 0)
	actor._physics_process(1.0 / 60.0)
	_check(actor.shadow_state._tpWarnT == 0 and actor.shadow_state._stTpCd == 140, "completion clears warning and resets random cooldown")
	_check(target.requests == [325] and target.impulse.length() == 120.0, "landing trunc31x10.5 and additive KB120")
	actor.shadow_state._tpWarnT = 1.0
	world.blocked = true
	origin = actor.position
	actor._physics_process(1.0 / 60.0)
	_check(actor.position == origin and actor.shadow_state._tpWarnT == 0 and actor.shadow_state._stTpCd == 140, "blocked completion still resets, no force teleport")
	world.blocked = false
	actor._projectile_ticks = 0
	actor.shadow_state._stTpCd = 9999
	actor._physics_process(1.0 / 60.0)
	_check(actor.charge_ticks == 60, "common physical charge60")
	actor._physics_process(60.0 / 60.0)
	var shots := get_nodes_in_group("physical_enemy_projectiles")
	_check(shots.size() == 1 and shots[0].damage == 24 and shots[0].life_ticks == 120, "common shot uses original physical kernel, damage24 life120")
	var mutant: Dictionary = record.duplicate(true)
	mutant.hp += 1
	_check(not factory.unsupported_reason(mutant).is_empty(), "mutated profile never aliases")
	_check(actor.apply_native_normal_enemy_hp_write({"field": "hp", "value": 800}).get("applied") == true and actor.hp == 800, "actual HP write")
	world.free()
	await process_frame
	_finish()

func _finish() -> void:
	print("P2008B_RESULT ", JSON.stringify({"checks": checks, "failures": failures}))
	quit(1 if failures else 0)
