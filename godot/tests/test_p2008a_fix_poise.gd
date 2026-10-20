extends SceneTree
## P2-008a-FIX: actual Main/World, exact three profiles, explicit damage/state fixtures.
const HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const USERDIR := "EXODUSER-p2-008a-fix-Isolated-20261020"
var checks := 0
var failures := 0
var rows: Array = []
func _initialize() -> void:
	seed(20261020)
	call_deferred("_run")
func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("P2008A_FIX_FAIL ", label)
func invoke(world: Node, enemy: Node, amount: int) -> Dictionary:
	var call: Variant = world.begin_native_normal_enemy_field_call(enemy)
	check(call != null, "same-world invocation available order%d" % enemy.source_order)
	if call == null: return {}
	var result: Dictionary = call.poise_hit({"kind": "poise_hit", "line": 42490, "amt": amount,
		"commit": {"from": call.get_cursors(), "enemy_writes": [], "owner_requests": [], "presentation": [], "events": []}})
	check(world.end_native_normal_enemy_field_call(call), "same-world invocation closed")
	return result
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		push_error("P2008A_FIX isolation required")
		quit(2)
		return
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(8): await physics_frame
	var world: Node = main.get("world")
	var tested := 0
	for enemy in world.get_enemies():
		enemy.set_physics_process(false) # fixture clock stopped; no product timer/AI edits.
		if enemy.get("etype") != 20: continue
		tested += 1
		check(enemy.poise == 875.0 and enemy.max_poise == 875.0, "31164 exact final poise875 order%d" % enemy.source_order)
		check(enemy.read_native_source_damage_fields(world).get("ready") == true, "exact profile admitted")
		check(enemy.read_native_source_damage_fields(main).get("ready") == false, "foreign caller rejected")
		var original_type: int = enemy.etype
		enemy.etype = 21
		check(world.begin_native_normal_enemy_field_call(enemy) == null, "unadmitted etype rejected")
		enemy.etype = original_type
		var original_el: int = enemy.el
		enemy.el = (original_el + 1) % 7
		check(world.begin_native_normal_enemy_field_call(enemy) == null, "changed element rejected")
		enemy.el = original_el
		var original_elite: int = enemy.elite
		enemy.elite += 1
		check(world.begin_native_normal_enemy_field_call(enemy) == null, "changed elite rejected")
		enemy.elite = original_elite
		enemy.mods.append("M01")
		check(world.begin_native_normal_enemy_field_call(enemy) == null, "changed mods rejected")
		enemy.mods.clear()
		var original_order: int = enemy.source_order
		enemy.source_order = 11
		check(world.begin_native_normal_enemy_field_call(enemy) == null, "foreign order rejected")
		enemy.source_order = original_order
		var original_id: String = enemy.data.id
		enemy.data.id = "foreign_actor"
		check(world.begin_native_normal_enemy_field_call(enemy) == null, "foreign id rejected")
		enemy.data.id = original_id
		enemy._pending_poise_amount = 1.0
		check(world.begin_native_normal_enemy_field_call(enemy) == null, "legacy pending guard retained")
		enemy._pending_poise_amount = 0.0
		# Source 19974 no-entry leaves regen/stun/max-stun untouched.
		enemy._poise_regen = 17.0
		var noentry: Dictionary = invoke(world, enemy, 0)
		check(noentry.get("ok") == true and noentry.get("staggered") == false and enemy.poise == 875.0 and enemy._poise_regen == 17.0 and not enemy._source_max_stunned_present, "19974 amount0 no writes")
		enemy.alive = false
		noentry = invoke(world, enemy, 100)
		check(noentry.get("ok") == true and enemy.poise == 875.0 and enemy._poise_regen == 17.0, "19974 dead no writes")
		enemy.alive = true
		var nonbreak: Dictionary = invoke(world, enemy, 100)
		check(nonbreak.get("ok") == true and nonbreak.get("staggered") == false and enemy.poise == 775.0 and enemy._poise_regen == 0.0 and not enemy._source_max_stunned_present, "19976-19978 nonbreak exact writes")
		var breaking: Dictionary = invoke(world, enemy, 775)
		check(breaking.get("ok") == false and breaking.get("reason") == "source_poise_sky_context_unbound_19985" and breaking.get("core_staggered") == true and breaking.get("next_source_line") == 19985, "unowned tail still halts direct field call")
		check(enemy.poise == 0.0 and enemy._poise_regen == 0.0 and enemy._stun_ticks == 180.0 and enemy._maxStunned == 180.0 and enemy._source_max_stunned_present, "19979-19982 break exact writes")
		# Full actual hurtE must consume this source core and run its existing tail.
		# Explicit fixtures: shield0 / poise10 / existing stun240,max300 / regen17.
		enemy.eShield = 0.0
		enemy.poise = 10.0
		enemy._poise_regen = 17.0
		enemy._stun_ticks = 240.0
		enemy._maxStunned = 300.0
		var resolver = HURTE.new()
		var outcome: Dictionary = resolver.execute(main, world, enemy, 100, 0.0, 0, {"_lessonAttack": "weapon", "poiseHit": true})
		check(outcome.get("ok") == true, "actual hurtE42490+tail accepts order%d: %s" % [enemy.source_order, str(outcome.get("reason"))])
		check(enemy.poise == 0.0 and enemy._poise_regen == 0.0 and enemy._stun_ticks == 240.0 and enemy._maxStunned == 300.0, "Math.max preserves larger stun/max via actual hurtE")
		check(enemy._pending_poise_amount == 0.0, "no deferred poise")
		rows.append({"order": enemy.source_order, "outcome": outcome})
	check(tested == 3, "all three exact profiles tested")
	check(world.get("_native_normal_enemy_field_calls").is_empty(), "field-call stack empty")
	main.queue_free()
	await process_frame
	await process_frame
	print("P2008A_FIX_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "profiles": rows, "public_player_input": false, "explicit_fixture_writes": true}))
	quit(1 if failures else 0)
