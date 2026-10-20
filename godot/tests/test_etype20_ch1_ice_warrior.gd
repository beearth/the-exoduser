extends SceneTree

const FACTORY = preload("res://scripts/enemy_factory.gd")
const SOURCE = "res://data/encounters.json"
const USERDIR = "EXODUSER-P2008A-Isolated-20261020"
const ORDERS = [4, 10, 12]
var checks := 0
var failures := 0
var only_motion := false

class TechnicalWorld extends Node2D:
	var actors: Array = []
	var line_of_sight := true
	func can_move(_point: Vector2, _radius: float) -> bool:
		return true
	func has_line_of_sight(_from: Vector2, _to: Vector2) -> bool:
		return line_of_sight
	func get_path_direction(_point: Vector2) -> Vector2:
		return Vector2.RIGHT
	func get_enemies() -> Array:
		return actors
	func get_native_world_identity() -> Array:
		return actors

class Target extends Node2D:
	var hp := 350.0
	var radius := 15.0
	var iframes := 0.0
	var damage_requests: Array = []
	func receive_damage(amount: int, _type := "phys", _direction := Vector2.ZERO, _impulse := 0.0) -> bool:
		damage_requests.append(amount)
		return true

func _initialize() -> void:
	paused = true
	only_motion = OS.get_cmdline_user_args().has("--only=motion")
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	if only_motion and label != "source flow 1 + idle 1.6 movement":
		return
	checks += 1
	if not condition:
		failures += 1
		print("P2008A_FAIL ", label)

func _run() -> void:
	var source: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(SOURCE))
	var before := JSON.stringify(source)
	var factory = FACTORY.new()
	var world := TechnicalWorld.new()
	root.add_child(world)
	var report: Dictionary = factory.consume_atomic(source, world)
	_check(report.get("valid") == true, "canonical source accepted")
	_check(report.get("supported_count") == 11 and report.get("unsupported_count") == 5,
		"three exact etype20 records added, 11 supported and 5 unsupported")
	_check(JSON.stringify(source) == before, "source export remains immutable")
	world.actors = report.get("instances", [])
	for actor in world.actors:
		world.add_child(actor)
	for order in ORDERS:
		var matches: Array = world.actors.filter(func(actor: Node) -> bool: return actor.get("source_order") == order)
		_check(matches.size() == 1, "etype20 actor order %d admitted exactly once" % order)
		if matches.is_empty():
			continue
		var actor: Node2D = matches[0]
		var record: Dictionary = source["records"][order]
		_check(actor.get_script().resource_path == "res://scripts/enemy_melee_ch1_ice_warrior.gd", "dedicated consumer, not type0 AI")
		_check(actor.hp == record.hp and actor.mhp == record.native_final.mhp and actor.attack == record.attack,
			"source HP/mhp/ATK retained")
		_check(actor.radius == record.radius and actor.el == record.element_id and actor.elite == record.elite,
			"source radius/element/elite retained")
		_check(actor.st2 == record.initial_idle_ticks and actor._projectile_ticks == record.initial_projectile_ticks
			and actor.native_frame == 0.0, "registration consumes no clock or RNG")
		var body: Sprite2D = actor.get_node("Body")
		_check(body.region_rect == Rect2(record.animation.column * 256, 0, 256, 256), "correct native atlas cell")
		var fields: Dictionary = actor.read_native_normal_enemy_hurte_fields(world)
		_check(fields.get("ready") == true and fields.get("etype") == 20 and fields.get("el") == record.element_id,
			"dedicated actual hurtE owner API")
		var target := Target.new()
		target.position = actor.position + Vector2(600, 0)
		world.add_child(target)
		actor.set_player(target)
		var origin := actor.global_position
		actor._physics_process(1.0 / 60.0)
		var expected_position: Vector2 = origin + Vector2.RIGHT * float(record.speed_pixels_per_tick)
		expected_position += Vector2.RIGHT * float(record.speed_pixels_per_tick) * 1.6
		_check(actor.global_position == expected_position, "source flow 1 + idle 1.6 movement")
		if only_motion:
			target.free()
			continue
		_check(actor.alerted and actor.native_frame == 1.0, "LOS aggros at source distance, native60 clock")
		actor._hit_stun = 2.0
		origin = actor.global_position
		actor._physics_process(1.0 / 60.0)
		_check(actor.global_position == origin, "hit-stun suppresses AI after timer decrement")
		actor._hit_stun = 0.0
		target.position = actor.position
		var projectile_before: float = actor._projectile_ticks
		for frame in range(360):
			actor._physics_process(1.0 / 60.0)
		_check(target.damage_requests.is_empty(), "source _meleeET excludes20: no invented contact/freeze damage")
		_check(actor._projectile_ticks == projectile_before and actor.charge_ticks == 0.0,
			"source _noProjEtypes20 keeps projCd9999; no phantom timer/shot")
		_check(actor.apply_native_normal_enemy_poise_core(1).get("applied") == true, "public poise helper accepted")
		var damage_write: Dictionary = actor.apply_native_normal_enemy_hp_write({"field": "hp", "value": actor.hp - 10})
		_check(damage_write.get("applied") == true and actor.hp == record.hp - 10, "actual HP owner write")
		_check(actor.apply_native_normal_enemy_death_write().get("applied") == true and not actor.alive
			and not body.visible and actor.collision_layer == 0, "actual death owner hides sprite and collision")
		target.free()
	world.free()
	await process_frame
	await process_frame
	print("P2008A_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "source_count":16,
		"supported": report.get("supported_count"), "unsupported": report.get("unsupported_count")}))
	quit(1 if failures > 0 else 0)
