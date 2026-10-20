extends SceneTree

const CRESCENT = preload("res://scripts/crescent.gd")
const USERDIR = "EXODUSER-P2008A-FIX-Isolated-20261020"
const ORDERS = [4, 10, 12]
var checks := 0
var failures := 0
var outcomes: Array = []
var halts: Array = []
var observations: Array = []

func _initialize() -> void: call_deferred("_run")

func _check(value: bool, label: String) -> void:
	checks += 1
	if not value:
		failures += 1
		print("ICE_POISE_FAIL ", label)

func _on_player_event(kind: String, packet: Dictionary) -> void:
	if kind == "native_hurte": outcomes.append(packet.duplicate(true))
	if kind == "native_hurte_halt": halts.append(packet.duplicate(true))

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		quit(2)
		return
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12): await physics_frame
	var world: Node2D = main.world
	var player: Node2D = main.player
	player.telemetry_event.connect(_on_player_event)
	for order in ORDERS:
		var matches: Array = world.get_enemies().filter(func(enemy: Node) -> bool: return enemy.get("source_order") == order)
		_check(matches.size() == 1, "actual source order%d exists" % order)
		if matches.is_empty(): continue
		var enemy: Node2D = matches[0]
		_check(enemy.poise == 875 and enemy.max_poise == 875 and enemy._poise_regen == 0.0, "original poise875/max875/poiseR0 order%d" % order)
		var native_guard: Dictionary = enemy.read_native_source_damage_fields(world)
		_check(native_guard.get("ready") == false, "type0 field authority not broadened order%d" % order)
		var origin: Vector2 = player.global_position + Vector2(64, 0)
		_check(world.can_move(origin, enemy.radius), "near-player fixture point is walkable order%d" % order)
		var old_position: Vector2 = enemy.global_position
		enemy.global_position = origin
		var shield_write: Dictionary = enemy.apply_native_normal_enemy_field_write("eShield", 0.0)
		_check(shield_write.get("applied") == true, "explicit shield-zero fixture through actual owner")
		enemy._poise_regen = 37.0
		var before_hp: float = enemy.hp
		var before_poise: float = enemy.poise
		var before_outcomes := outcomes.size()
		var before_halts := halts.size()
		var crescent := CRESCENT.new()
		world.add_child(crescent)
		_check(crescent.configure(player, 1, 0.0, Vector2.RIGHT, player.get("combat")), "actual crescent source configure")
		crescent.damage = 100
		crescent.set_physics_process(false)
		crescent._physics_process(1.0 / 60.0)
		_check(outcomes.size() == before_outcomes + 1, "actual near collision emits one hurtE result order%d" % order)
		if outcomes.size() > before_outcomes:
			var result: Dictionary = outcomes[-1]
			_check(result.get("ok") == true and halts.size() == before_halts, "near-hit hurtE completes with halt0 order%d reason=%s" % [order, result.get("reason", "")])
			var damage: float = before_hp - float(enemy.hp)
			_check(damage > 0.0 and enemy.alive, "fixture crosses shield to nonlethal HP damage order%d" % order)
			_check(enemy.poise == before_poise - damage and enemy.max_poise == 875, "source19976 poise reduced once by actual residual damage order%d" % order)
			_check(enemy._poise_regen == 0.0, "source19977 resets poiseR order%d" % order)
			var routes: Array = result.get("journal", []).filter(func(row: Dictionary) -> bool: return row.get("op") == "poise_hit")
			_check(routes.size() == 1 and routes[0].data.route == "owner_core" and routes[0].data.amt == int(damage), "one core owner and exact original amount order%d" % order)
			_check(world.get("_native_normal_enemy_field_calls").is_empty() and enemy._pending_poise_amount == 0.0, "no field-call or deferred second owner order%d" % order)
			observations.append({"order": order, "damage": damage, "poise_before": before_poise, "poise_after": enemy.poise, "reason": result.get("reason", ""), "halt_delta": halts.size() - before_halts})
		crescent.free()
		var core: Dictionary = enemy.apply_native_normal_enemy_poise_core(int(enemy.poise) - 100)
		_check(core.get("applied") == true and core.get("staggered") == false and enemy.poise == 100.0, "original nonbreaking core subtracts once order%d" % order)
		enemy._poise_regen = 37.0
		var no_entry: Dictionary = enemy.apply_native_normal_enemy_poise_core(0)
		_check(no_entry.get("entered") == false and enemy.poise == 100.0 and enemy._poise_regen == 37.0, "amt0 leaves poiseR unchanged order%d" % order)
		enemy.apply_native_normal_enemy_field_write("hit_stun", 0.0)
		enemy._poise_regen = 199.0
		enemy.set_player(null)
		enemy._physics_process(1.0 / 60.0)
		_check(enemy.poise == 231.0 and enemy.max_poise == 875.0 and enemy._poise_regen == 0.0, "source regen200 adds trunc875x.15=131 order%d" % order)
		enemy.set_player(player)
		var broken: Dictionary = enemy.apply_native_normal_enemy_poise_core(231)
		_check(broken.get("staggered") == true and enemy.poise == 0.0 and enemy._poise_regen == 0.0, "source break floors poise0/resetR order%d" % order)
		_check(enemy._stun_ticks == 180.0 and enemy._maxStunned == 180.0 and enemy._source_max_stunned_present, "original normal stun/max180 with live bar owner order%d" % order)
		enemy.global_position = old_position
	_check(halts.is_empty(), "zero native_hurte_halt across all three exact profiles")
	main.queue_free()
	await process_frame
	await process_frame
	print("ICE_POISE_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "halt_count": halts.size(), "observations": observations, "fixture_base_damage": 100, "fixture_shield": 0, "actual_collision": true, "public_input": false}))
	quit(1 if failures else 0)
