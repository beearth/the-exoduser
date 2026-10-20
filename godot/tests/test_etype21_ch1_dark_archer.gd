extends SceneTree

const FACTORY = preload("res://scripts/enemy_factory.gd")
var checks := 0
var failures := 0

class TechnicalWorld extends Node2D:
	var actors: Array = []
	var samples := 0
	func can_move(_point: Vector2, _radius: float) -> bool: return true
	func is_world_blocked(_point: Vector2) -> bool: return false
	func has_line_of_sight(_from: Vector2, _to: Vector2) -> bool: return true
	func get_path_direction(_point: Vector2) -> Vector2: return Vector2.RIGHT
	func get_enemies() -> Array: return actors
	func get_native_world_identity() -> Array: return actors
	func get_native_frame() -> float: return 100.0
	func sample_native_random_unit() -> float:
		samples += 1
		return 0.5
	func supports_native_projectile_hit_fx(_element: String, _dark_ball: bool) -> bool: return true
	func emit_native_projectile_hit_fx(_request: Dictionary) -> void: pass
	func emit_native_parts(_origin: Vector2, _color: String, _count: int) -> void: pass

class Target extends Node2D:
	var hp := 10000.0
	var radius := 15.0
	var iframes := 0.0
	var state := "idle"
	var packets: Array = []
	func receive_damage(amount: int, kind := "phys", _direction := Vector2.ZERO, _impulse := 0.0) -> bool:
		packets.append({"amount": amount, "kind": kind})
		return true

func _initialize() -> void:
	paused = true
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	checks += 1
	if not condition:
		failures += 1
		print("DARK_ARCHER_FAIL ", label)

func _run() -> void:
	var source: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))
	var factory := FACTORY.new()
	_check(factory.unsupported_reason(source.records[9]).is_empty(), "exact order9 admitted")
	if not factory.unsupported_reason(source.records[9]).is_empty():
		_finish()
		return
	var world := TechnicalWorld.new()
	root.add_child(world)
	var before := JSON.stringify(source)
	var report: Dictionary = factory.consume_atomic(source, world)
	_check(report.supported_count == 11 and report.unsupported_count == 5 and JSON.stringify(source) == before, "eleven consumers, frozen source unchanged")
	world.actors = report.instances
	for enemy in world.actors: world.add_child(enemy)
	var matches: Array = world.actors.filter(func(enemy: Node) -> bool: return enemy.get("source_order") == 9)
	_check(matches.size() == 1, "one exact dark archer")
	var actor: Node2D = matches[0]
	var target := Target.new()
	world.add_child(target)
	actor.set_player(target)
	_check(actor.get_script().resource_path == "res://scripts/enemy_ch1_dark_archer.gd" and actor.el == 3 and actor.hp == 875 and actor.attack == 31, "actual source dark profile, not name-based ice substitution")
	_check(actor.read_native_normal_enemy_hurte_fields(world).get("ready") == true, "real dedicated hurtE owner")
	_check(actor._projectile_ticks == 272.19979790970683 and actor.st2 == 46.095641534775496, "original constructor clocks")
	for sample in [[701.0, 1.0, 1.2], [650.0, 0.0, 1.2], [400.0, -0.5, 1.2], [70.0, -0.5, -0.6], [20.0, 0.0, -0.6]]:
		actor.position = Vector2(1000, 1000)
		target.position = actor.position + Vector2(float(sample[0]), 0)
		var expected: Vector2 = actor.position + Vector2.RIGHT * float(actor.data.speed_pixels_per_tick) * float(sample[1])
		expected += Vector2.RIGHT * float(actor.data.speed_pixels_per_tick) * float(sample[2])
		actor._physics_process(1.0 / 60.0)
		_check(actor.position == expected, "source distance movement " + str(sample[0]))
	_check(target.packets.is_empty(), "no fabricated type21 contact/freeze")
	target.position = actor.position + Vector2(500, 0)
	actor._projectile_ticks = 0
	actor._physics_process(1.0 / 60.0)
	_check(actor.charge_ticks == 60 and actor._projectile_ticks == 240, "source charge60/cooldown240")
	actor._physics_process(1.0)
	var shots := get_nodes_in_group("dark_enemy_projectiles")
	_check(shots.size() == 1 and world.samples == 1, "exactly one shared RNG speed sample and dark birth")
	if not shots.is_empty():
		var shot: Node2D = shots[0]
		_check(shot.damage == 62 and shot.life_ticks == 240 and shot.speed == 550 and shot.source_caller == "etype21_dark_burst", "original normalized dark62/life240/speed500+U100")
		var camera := Camera2D.new()
		target.add_child(camera)
		camera.make_current()
		camera.reset_smoothing()
		shot.global_position = target.global_position - Vector2(5, 0)
		shot.heading = Vector2.RIGHT
		shot._physics_process(1.0 / 60.0)
		_check(target.packets.size() == 1 and target.packets[0].amount == 80 and target.packets[0].kind == "magic", "real dark kernel contact trunc62x1.3=80 magic")
	for field in ["hp", "element_id", "spawn_position"]:
		var mutated: Dictionary = source.records[9].duplicate(true)
		if field == "spawn_position": mutated[field][0] += 1
		else: mutated[field] += 1
		_check(not factory.unsupported_reason(mutated).is_empty(), "no alias for mutated " + field)
	_check(actor.apply_native_normal_enemy_hp_write({"field": "hp", "value": 800}).get("applied") == true and actor.hp == 800, "actual HP owner write")
	world.free()
	await process_frame
	_finish()

func _finish() -> void:
	print("DARK_ARCHER_RESULT ", JSON.stringify({"checks": checks, "failures": failures}))
	quit(1 if failures else 0)
