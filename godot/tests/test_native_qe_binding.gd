extends SceneTree

# New integration oracle: actual World/Player/Camera, fixture-only suppliers.
# No Main, input events, live HP/poise/state/timer writes, or manual physics.
const PLAYER := preload("res://scripts/player.gd")
const WORLD := preload("res://scripts/world.gd")
const ADAPTER := preload("res://scripts/native_combat_qe_adapter.gd")
const PRODUCER := preload("res://port_modules/combat_qe/producer.gd")

const GROUPS := ["unbound_damage_once", "atomic_provider_gate", "q_expire_reduce",
	"shield_stun_order", "q_reflect_once", "e_black_guard", "actual_clock_rejections",
	"q_positive_iframe_reflect", "black_q_atomic_gate", "dead_player_world_burst_clock",
	"peace_shield_admission_hold"]
var _checks = 0
var _failures = 0
var _group = ""
var _ledger: Array[Dictionary] = []

class FixtureStats extends RefCounted:
	var provided: Dictionary
	func _init(values: Dictionary) -> void:
		provided = values.duplicate(true)
	func read_native_qe_stats(_player: Node2D) -> Dictionary:
		return {"provided": provided.duplicate(true), "missing": {}}

class FixtureResources extends RefCounted:
	var player: Node2D
	var values: Dictionary
	var debit_calls = 0
	func _init(actual_player: Node2D, overrides: Dictionary = {}) -> void:
		player = actual_player
		values = {"mana": 100.0, "max_mana": 100.0, "active_q_skill": "sBlock",
			"detonate_lv": 0, "shield_st_cost": 24.0, "release_r": 140.0}
		for key in overrides:
			values[key] = overrides[key]
	func get_native_qe_player() -> Node2D:
		return player
	func read_native_qe_resources() -> Dictionary:
		return values.duplicate(true)
	func spend_native_qe_mana(amount: float) -> bool:
		if float(values["mana"]) < amount:
			return false
		debit_calls += 1
		values["mana"] = float(values["mana"]) - amount
		return true

class FixtureServices extends RefCounted:
	var bursts = 0
	var expired = 0
	var poise_calls: Array = []
	var stun_calls: Array = []
	var reflects: Array = []
	func readiness() -> bool:
		return true
	func spawn_burst(_ring) -> void:
		bursts += 1
	func on_burst_expire(_ring) -> void:
		expired += 1
	func apply_poise(enemy: Object, amount: int) -> void:
		poise_calls.append({"enemy": enemy, "amount": amount})
	func apply_stun(enemy: Object, frames: int) -> void:
		stun_calls.append({"enemy": enemy, "frames": frames})
	func on_parry_reflect(proj: Object, damage: int) -> void:
		reflects.append({"projectile": proj, "damage": damage})

class FixtureContact extends RefCounted:
	var ptype: int
	var dmg: float
	var source_enemy: Node2D
	var blue_bean = false
	var parry_blue_bean = false
	var homing = false
	var magic = false
	var friendly = false
	var col = "#aa4422"
	var black_bean = true
	var from_rainbow = true
	var vx = 3.0
	var vy = 4.0
	var life = 60.0
	var ml = 60.0
	var aoe_r = 10.0
	var aoe_dmg = 5.0
	func _init(type_value: int, source_damage: float, enemy: Node2D = null) -> void:
		ptype = type_value
		dmg = source_damage
		source_enemy = enemy
		black_bean = type_value == PRODUCER.ProjType.BLACKBEAN
		from_rainbow = black_bean
	func snapshot() -> Dictionary:
		return {"ptype": ptype, "dmg": dmg, "blue_bean": blue_bean,
			"parry_blue_bean": parry_blue_bean, "homing": homing, "magic": magic,
			"friendly": friendly, "col": col, "black_bean": black_bean,
			"from_rainbow": from_rainbow, "vx": vx, "vy": vy, "life": life,
			"ml": ml, "aoe_r": aoe_r, "aoe_dmg": aoe_dmg}

class EventRecorder extends RefCounted:
	var events: Array[Dictionary] = []
	func receive_event(kind: String, payload: Dictionary) -> void:
		events.append({"kind": kind, "payload": payload.duplicate(true)})
	func count(kind: String) -> int:
		var total = 0
		for event in events:
			if event["kind"] == kind:
				total += 1
		return total

func _initialize() -> void:
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon"]:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
	call_deferred("_run")

func _run() -> void:
	var selected: Array = GROUPS.duplicate()
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			selected = Array(argument.trim_prefix("--only=").split(",", false))
	for id in selected:
		if not GROUPS.has(id):
			push_error("Unknown new QE group: " + str(id))
			quit(2)
			return
		_group = id
		var before_checks = _checks
		var before_failures = _failures
		var started = Time.get_ticks_msec()
		var observation: Dictionary = await call("_test_" + id)
		var result = {"group": id, "checks": _checks - before_checks,
			"failures": _failures - before_failures,
			"elapsed_ms": Time.get_ticks_msec() - started, "observation": observation}
		_ledger.append(result)
		print("QE_GROUP_RESULT " + JSON.stringify(result))
	print("QE_SUITE_RESULT " + JSON.stringify({"groups": selected.size(),
		"checks": _checks, "failures": _failures, "ledger": _ledger,
		"scope": "actual World/Player/Camera; fixture-only stats/resources/services/facade; Main/input/real supplier admission not exercised",
		"manual_physics": false, "live_core_setters": false}))
	quit(0 if _failures == 0 else 1)

func _check(condition: bool, label: String) -> bool:
	_checks += 1
	if not condition:
		_failures += 1
		push_error("QE_ASSERT_FAIL " + _group + ": " + label)
	return condition

func _fixture_stats() -> Dictionary:
	# Explicit constructor fixture values, not a Main-backed stat provider.
	return {"shield_cd_red": 0.0, "block_base": 0.5, "q_shield_mp_cost": 10.0,
		"parry_bonus": 0.0, "parry_dmg_mul": 1.0, "leg_shield_parry": 1.0,
		"parry_scale": 150.0, "p_atk_mul": 1.0}

func _make_scene(bind: bool = true, resource_overrides: Dictionary = {}) -> Dictionary:
	# Provision while this fresh test tree is paused. World.set_player needs
	# completed map_data; Player's authored start position is constructor-only.
	paused = true
	var holder = Node2D.new()
	holder.name = "QEIntegrationFixture"
	holder.process_mode = Node.PROCESS_MODE_PAUSABLE
	var world = WORLD.new()
	var camera = Camera2D.new()
	camera.enabled = true
	holder.add_child(camera)
	root.add_child(holder)
	holder.add_child(world)
	var player = PLAYER.new()
	player.position = world.get_start_position()
	player.set_world(world)
	camera.reparent(player, false)
	holder.add_child(player)
	world.set_player(player)
	var source_actor = Node2D.new()
	source_actor.name = "FixtureSourceActorIdentity"
	holder.add_child(source_actor)
	var recorder = EventRecorder.new()
	player.telemetry_event.connect(recorder.receive_event)
	paused = false
	var deadline = Time.get_ticks_msec() + 6000
	while (not world.ready_for_player or world.get_native_frame() <= 0.0) and Time.get_ticks_msec() < deadline:
		await process_frame
	var scene = {"holder": holder, "player": player, "world": world, "camera": camera,
		"source_actor": source_actor, "recorder": recorder,
		"stats": FixtureStats.new(_fixture_stats()),
		"resources": FixtureResources.new(player, resource_overrides), "services": FixtureServices.new(),
		"adapter": ADAPTER.new()}
	_check(world.ready_for_player and world.get_native_frame() > 0.0, "actual World ready and naturally published clock")
	_check(player.get_combat_world() == world and world.player == player, "public actual Player/World identity")
	if bind:
		var descriptor = _descriptor(scene)
		_check(scene.adapter.configure(player, world, scene.stats, scene.resources, descriptor), "fixture-backed adapter configure")
		_check(world.bind_native_player_combat_qe(scene.adapter), "actual World public bind")
		_check(player.get_native_combat_qe_snapshot().get("ready") == true, "actual Player binding snapshot")
	return scene

func _descriptor(scene: Dictionary) -> Dictionary:
	return {"schema": "exoduser.godot.qe-services.v1",
		"readiness": Callable(scene.services, "readiness"),
		"projectile_sink": scene.services, "enemy_sink": scene.services,
		"impact_sink": scene.services, "hit_sink": scene.player}

func _destroy(scene: Dictionary) -> void:
	scene.holder.queue_free()
	await process_frame

func _wait_window(scene: Dictionary) -> bool:
	var deadline = Time.get_ticks_msec() + 6000
	while float(scene.adapter.get_snapshot()["sb_parry_t"]) > 0.0 and Time.get_ticks_msec() < deadline:
		await process_frame
	return _check(float(scene.adapter.get_snapshot()["sb_parry_t"]) == 0.0, "Q window expires through actual World frames")

func _wait_idle(scene: Dictionary) -> bool:
	var deadline = Time.get_ticks_msec() + 8000
	while scene.player.state != "idle" and Time.get_ticks_msec() < deadline:
		await process_frame
	return _check(scene.player.state == "idle", "actual Player state returns to idle naturally")

func _test_unbound_damage_once() -> Dictionary:
	var s = await _make_scene(false)
	var p = s.player
	var proj = FixtureContact.new(PRODUCER.ProjType.MAGIC, 200.0)
	var first: Dictionary = p.receive_native_projectile_contact(proj, 200, "phys", Vector2.RIGHT, 2.0)
	_check(first.get("accepted") == true and p.hp == 236, "unbound raw200 once cap115 then physical DR gives114")
	var second: Dictionary = p.receive_native_projectile_contact(proj, 120, "magic", Vector2.RIGHT, 2.0)
	_check(second.get("accepted") == true and p.hp == 121, "unbound magic120 once cap115 gives115")
	_check(s.recorder.count("player_damage") == 2 and p.poise == 2, "one HP and ordinary poise commit per contact")
	_check(p.get_native_combat_qe_snapshot().get("bound") == false, "new public contact keeps unbound scope")
	var out = {"hp": p.hp, "poise": p.poise, "damage_events": s.recorder.count("player_damage")}
	await _destroy(s)
	return out

func _test_atomic_provider_gate() -> Dictionary:
	var s = await _make_scene(false)
	var rejected: Array = []
	for kind in ["missing_stat", "null_stat", "bool_stat", "nan_stat", "missing_resource",
		"null_shield_cost", "bool_shield_cost", "nan_shield_cost", "negative_shield_cost", "null_sink"]:
		var supplied = _fixture_stats()
		var overrides: Dictionary = {}
		match kind:
			"missing_stat": supplied.erase("block_base")
			"null_stat": supplied["block_base"] = null
			"bool_stat": supplied["block_base"] = true
			"nan_stat": supplied["block_base"] = NAN
			"null_shield_cost": overrides["shield_st_cost"] = null
			"bool_shield_cost": overrides["shield_st_cost"] = true
			"nan_shield_cost": overrides["shield_st_cost"] = NAN
			"negative_shield_cost": overrides["shield_st_cost"] = -1.0
		var stats = FixtureStats.new(supplied)
		var resources = FixtureResources.new(s.player, overrides)
		if kind == "missing_resource": resources.values.erase("mana")
		var descriptor = _descriptor(s)
		if kind == "null_sink": descriptor["impact_sink"] = null
		var adapter = ADAPTER.new()
		var before: Dictionary = s.player.get_snapshot()
		var children = s.world.get_child_count()
		var frame = s.world.get_native_frame()
		_check(not adapter.configure(s.player, s.world, stats, resources, descriptor), kind + " configure rejects")
		_check(s.player.get_snapshot() == before and s.world.get_child_count() == children and s.world.get_native_frame() == frame, kind + " leaves actual Player/World unchanged")
		_check(resources.debit_calls == 0 and not s.world.bind_native_player_combat_qe(adapter), kind + " no resource debit or partial public bind")
		rejected.append(kind)
	await _destroy(s)
	return {"rejected_constructor_variants": rejected, "actual_main_supplier": false}

func _test_q_expire_reduce() -> Dictionary:
	var s = await _make_scene()
	var start: Dictionary = s.adapter.get_snapshot()
	var request: Dictionary = s.adapter.request_q()
	_check(request.get("accepted") == true and s.player.state == "sBlock", "public Q enters actual Player shield state")
	_check(s.resources.values["mana"] == 90.0 and s.resources.debit_calls == 1, "Q commits fixture MP exactly once")
	await _wait_window(s)
	var clock: Dictionary = s.adapter.get_snapshot()
	_check(clock["clock_calls"] - start["clock_calls"] == clock["last_native_epoch"] - start["last_native_epoch"], "one QE advance per actual World epoch")
	var proj = FixtureContact.new(PRODUCER.ProjType.MAGIC, 400.0, s.source_actor)
	var hit: Dictionary = s.player.receive_native_projectile_contact(proj, 100, "phys", Vector2.RIGHT, 2.0)
	var after: Dictionary = s.adapter.get_snapshot()
	_check(hit.get("accepted") == true and not hit.get("reflected", true), "expired Q contact follows raw reduction pipeline")
	_check(after["last_contact_result"]["reduced"]["dmg"] == 97, "shield reduces raw100 rather than carrier400")
	_check(s.player.hp == 254 and hit["damage_applied"] == 96, "raw97 has physical DR applied once")
	_check(after["last_contact_result"]["reduced"]["poise_after"] == 3 and s.player.poise == 2, "shield initial penalty then separate ordinary tail penalty")
	_check(s.recorder.count("player_damage") == 1 and s.recorder.count("player_stunned") == 0, "single HP event and no invented stun")
	var out = {"hp": s.player.hp, "poise": s.player.poise, "reduced": after["last_contact_result"]["reduced"], "clock_calls": clock["clock_calls"]}
	await _destroy(s)
	return out

func _test_shield_stun_order() -> Dictionary:
	var s = await _make_scene()
	for _i in range(3):
		s.player.receive_damage(2, "magic", Vector2.RIGHT, 1.0)
	_check(s.player.poise == 1 and s.player.hp == 344, "three ordinary public hits naturally prepare poise1")
	var hurt_frame = s.world.get_native_frame()
	await _wait_idle(s)
	_check(s.world.get_native_frame() - hurt_frame >= 6.0, "stagger uses natural six native ticks")
	_check(s.adapter.request_q().get("accepted") == true, "Q entered after natural stagger completion")
	await _wait_window(s)
	var proj = FixtureContact.new(PRODUCER.ProjType.MAGIC, 100.0, s.source_actor)
	var hit: Dictionary = s.player.receive_native_projectile_contact(proj, 100, "phys", Vector2.RIGHT, 2.0)
	var reduced: Dictionary = s.adapter.get_snapshot()["last_contact_result"]["reduced"]
	_check(reduced["stunned"] == true and reduced["poise_after"] == 0, "initial shield penalty returns poise0 stun")
	_check(hit.get("accepted") == true and s.player.hp == 248, "initial stun still allows one same-contact HP commit")
	_check(s.player.state == "pStun" and s.player.poise == 0, "Player synchronizes pStun before ordinary HP tail")
	_check(s.recorder.count("player_stunned") == 1 and s.recorder.count("player_damage") == 4, "one source stun event and one contact damage event")
	var out = {"hp": s.player.hp, "poise": s.player.poise, "state": s.player.state, "stun_events": s.recorder.count("player_stunned"), "scoped_stun_ticks": 240.0, "original_ccRes_provider": false}
	await _destroy(s)
	return out

func _test_q_reflect_once() -> Dictionary:
	var s = await _make_scene()
	_check(s.adapter.request_q().get("accepted") == true, "public Q activation")
	var proj = FixtureContact.new(PRODUCER.ProjType.MAGIC, 400.0, s.source_actor)
	var kb: Vector2 = s.player.get_native_knockback()
	var hit: Dictionary = s.player.receive_native_projectile_contact(proj, 2, "magic", Vector2.RIGHT, 2.0)
	_check(hit.get("reflected") == true and hit["damage_applied"] == 0 and s.player.hp == 350, "active Q reflection bypasses HP commit")
	_check(s.player.get_native_knockback() == kb and s.recorder.count("player_damage") == 0, "reflection adds no Player KB or duplicate damage event")
	_check(s.services.poise_calls.size() == 1 and s.services.stun_calls.size() == 1 and s.services.reflects.size() == 1, "enemy/impact sinks execute once")
	_check(s.services.poise_calls[0]["enemy"] == s.source_actor and s.services.poise_calls[0]["amount"] == 20 and s.services.stun_calls[0]["frames"] == 60, "exact fixture source identity and enemy reaction")
	_check(proj.dmg == 300.0 and proj.blue_bean and proj.parry_blue_bean and proj.homing and proj.magic and proj.friendly and proj.col == "#00e5ff", "ordinary source formula uses carrier400 to300, not raw2 floor112")
	var out = {"hp": s.player.hp, "source_carrier_damage_after": proj.dmg, "enemy_sink_calls": [s.services.poise_calls.size(), s.services.stun_calls.size()], "production_projectile_birth": false}
	await _destroy(s)
	return out

func _test_e_black_guard() -> Dictionary:
	var s = await _make_scene()
	var request: Dictionary = s.adapter.request_e(2.0)
	_check(request.get("accepted") == true and s.player.stamina == 176.0 and s.player.state == "sBash", "E consumes actual Player ST via fixture cost24")
	var snapshot: Dictionary = s.adapter.get_snapshot()
	_check(snapshot["sbash_st2"] == 20.0 and snapshot["q_magic_mode"] == false and snapshot["e_movement_and_completion_ready"] == false, "E window and Q-only distinction without full-E claim")
	var proj = FixtureContact.new(PRODUCER.ProjType.BLACKBEAN, 400.0, s.source_actor)
	var before: Dictionary = proj.snapshot()
	var hit: Dictionary = s.player.receive_native_projectile_contact(proj, 100, "phys", Vector2.RIGHT, 2.0)
	_check(hit.get("accepted") == true and not hit.get("reflected", true) and s.player.hp == 251, "blackBean E contact stays ordinary raw damage")
	_check(proj.snapshot() == before, "E black guard preserves source carrier")
	_check(s.services.poise_calls.is_empty() and s.services.stun_calls.is_empty() and s.services.reflects.is_empty(), "E cannot invoke black Q reflection sinks")
	var out = {"hp": s.player.hp, "stamina": s.player.stamina, "carrier_unchanged": proj.snapshot() == before, "black_q_carrier_production": false}
	await _destroy(s)
	return out

func _test_actual_clock_rejections() -> Dictionary:
	var s = await _make_scene()
	_check(s.adapter.request_q().get("accepted") == true, "Q clock fixture active")
	await process_frame
	var before: Dictionary = s.adapter.get_snapshot()
	var context: Dictionary = s.world.get_native_projectile_fx_context()
	var frame: float = s.world.get_native_frame()
	var ticks: float = context["dt_sp"]
	var ens: Array = s.world.get_native_world_identity()
	_check(not s.adapter.advance_native(ticks, frame, ens.duplicate()), "copied ens reference rejected")
	_check(not s.adapter.advance_native(ticks, frame - 1.0, ens), "stale frame rejected")
	_check(not s.adapter.advance_native(ticks + 0.125, frame, ens), "mismatched actual delta rejected")
	_check(not s.adapter.advance_native(ticks, frame, ens), "already consumed actual frame duplicate rejected")
	_check(s.adapter.get_snapshot()["clock_calls"] == before["clock_calls"] and s.adapter.get_snapshot()["sb_parry_t"] == before["sb_parry_t"], "invalid clock inputs cause no extra QE advancement")
	paused = true
	await process_frame
	await process_frame
	_check(s.world.get_native_frame() == frame, "actual paused tree stops World clock")
	_check(not s.adapter.advance_native(ticks, frame, ens), "paused public advance rejected")
	var stopped: Dictionary = s.adapter.get_snapshot()
	_check(stopped["clock_calls"] == before["clock_calls"] and stopped["sb_parry_t"] == before["sb_parry_t"], "pause does not advance shield timers")
	paused = false
	var out = {"clock_calls_before": before["clock_calls"], "clock_calls_after_invalid": stopped["clock_calls"], "new_rejections": stopped["clock_rejections"] - before["clock_rejections"], "observer_clock_writes": false}
	await _destroy(s)
	return out

func _test_q_positive_iframe_reflect() -> Dictionary:
	var s = await _make_scene()
	for _i in range(4):
		s.player.receive_damage(2, "magic", Vector2.RIGHT, 1.0)
	_check(s.player.state == "pStun" and s.player.poise == 0 and s.player.hp == 342, "public damage naturally enters source stun")
	var stun_frame: float = s.world.get_native_frame()
	await _wait_idle(s)
	_check(s.world.get_native_frame() - stun_frame >= 240.0 and s.player.iframes > 0.0 and s.player.poise == 4, "natural stun completion exposes source positive iframe window")
	_check(s.adapter.request_q().get("accepted") == true, "Q enters during actual positive iframes")
	var proj = FixtureContact.new(PRODUCER.ProjType.PHYSICAL, 400.0, s.source_actor)
	var kb: Vector2 = s.player.get_native_knockback()
	var hit: Dictionary = s.player.receive_native_projectile_contact(proj, 100, "phys", Vector2.RIGHT, 2.0)
	_check(hit.get("accepted") == true and hit.get("reflected") == true and s.player.hp == 342, "only active Q reflection bypasses intake iframe gate")
	_check(s.player.get_native_knockback() == kb and s.recorder.count("player_damage") == 4 and s.services.reflects.size() == 1, "positive-iframe Q contact adds no raw HP/KB commit")
	_check(s.adapter.release_shield().get("accepted") == true and s.adapter.request_e().get("accepted") == true, "public release then E changes mode during same actual iframe window")
	var e_proj = FixtureContact.new(PRODUCER.ProjType.PHYSICAL, 400.0, s.source_actor)
	var e_before: Dictionary = e_proj.snapshot()
	var e_hit: Dictionary = s.player.receive_native_projectile_contact(e_proj, 100, "phys", Vector2.RIGHT, 2.0)
	_check(e_hit.get("accepted") == false and e_hit.get("reason") == "player_damage_gate", "E cannot bypass positive iframe admission")
	_check(e_proj.snapshot() == e_before and s.player.hp == 342 and s.player.poise == 4 and s.services.reflects.size() == 1, "iframe-rejected E contact leaves carrier and actual HP/poise unchanged")
	var out = {"native_ticks_to_stun_end": s.world.get_native_frame() - stun_frame, "actual_iframes": s.player.iframes, "hp": s.player.hp, "source_fsm_setup": "four public receive_damage calls; no live setters"}
	await _destroy(s)
	return out

func _test_black_q_atomic_gate() -> Dictionary:
	var s = await _make_scene()
	_check(s.adapter.request_q().get("accepted") == true, "Q active for unadopted black carrier boundary")
	var proj = FixtureContact.new(PRODUCER.ProjType.BLACKBEAN, 400.0, s.source_actor)
	var before: Dictionary = proj.snapshot()
	var player_before: Dictionary = s.player.get_snapshot()
	var bank = s.adapter.get_snapshot()["parry_bank"]
	var hit: Dictionary = s.player.receive_native_projectile_contact(proj, 100, "magic", Vector2.RIGHT, 2.0)
	_check(hit.get("accepted") == false and hit.get("reflected") == false, "BLACK Q production-unadopted path rejects")
	_check(proj.snapshot() == before and s.player.get_snapshot() == player_before and s.adapter.get_snapshot()["parry_bank"] == bank, "BLACK Q gate precedes carrier Player and bank mutations")
	_check(s.services.poise_calls.is_empty() and s.services.stun_calls.is_empty() and s.services.reflects.is_empty(), "BLACK Q gate calls no fixture reaction sink")
	_check(s.adapter.get_snapshot()["blackbean_reflection_ready"] == false, "BLACK success never promoted to ready")
	var out = {"rejection": hit, "blackbean_reflection_ready": false, "source_carrier_unchanged": proj.snapshot() == before}
	await _destroy(s)
	return out

func _test_dead_player_world_burst_clock() -> Dictionary:
	var s = await _make_scene()
	_check(s.adapter.request_q().get("accepted") == true and s.services.bursts == 1, "actual Q produces world burst before death")
	for _i in range(4):
		s.player.receive_damage(200, "magic", Vector2.RIGHT, 1.0)
	_check(s.player.hp == 0 and s.player.state == "dead", "four ordinary public damage calls naturally kill actual Player")
	var before: Dictionary = s.adapter.get_snapshot()
	var death_frame: float = s.world.get_native_frame()
	var deadline = Time.get_ticks_msec() + 6000
	while s.services.expired == 0 and Time.get_ticks_msec() < deadline:
		await process_frame
	var after: Dictionary = s.adapter.get_snapshot()
	_check(s.world.get_native_frame() > death_frame and after["clock_calls"] > before["clock_calls"], "actual World and QE clock continue for dead Player")
	_check(s.services.expired == 1 and after["burst"].is_empty(), "original world burst naturally expires once after owner death")
	_check(s.player.hp == 0 and s.player.state == "dead" and s.services.reflects.is_empty(), "world burst clock does not resurrect or recall owner")
	var out = {"hp": s.player.hp, "world_ticks_after_death": s.world.get_native_frame() - death_frame, "clock_calls_after_death": after["clock_calls"] - before["clock_calls"], "expiry_calls": s.services.expired}
	await _destroy(s)
	return out

func _test_peace_shield_admission_hold() -> Dictionary:
	var observations: Array = []
	for constructor_mana in [0.0, 12.0]:
		var s = await _make_scene(true, {"active_q_skill": "peaceShield", "mana": constructor_mana})
		var before: Dictionary = s.player.get_snapshot()
		var resources_before: Dictionary = s.resources.read_native_qe_resources()
		var bank_before = s.adapter.get_snapshot()["parry_bank"]
		var request: Dictionary = s.adapter.request_q()
		var snapshot: Dictionary = s.adapter.get_snapshot()
		_check(request.get("accepted") == false and request.get("error") == "peace_shield_full_runtime_not_adopted", "peace Q is explicitly held for constructor MP" + str(constructor_mana))
		_check(snapshot["ready"] == true and snapshot["peace_shield_ready"] == false, "structural binding readiness does not adopt peace state machine")
		_check(s.player.get_snapshot() == before and s.player.state == "idle" and s.player.stamina == 200.0, "peace admission rejection leaves actual Player unchanged")
		_check(s.resources.read_native_qe_resources() == resources_before and s.resources.debit_calls == 0, "peace rejection does not commit fixture MP")
		_check(s.services.bursts == 0 and snapshot["burst"].is_empty() and snapshot["parry_bank"] == bank_before and bank_before == 0, "peace rejection produces no burst or bank mutation")
		observations.append({"constructor_mana": constructor_mana, "state": s.player.state,
			"stamina": s.player.stamina, "mana": s.resources.values["mana"], "debit_calls": s.resources.debit_calls,
			"bursts": s.services.bursts, "bank": snapshot["parry_bank"], "structural_ready": snapshot["ready"],
			"peace_shield_ready": snapshot["peace_shield_ready"], "rejection": request.get("error")})
		await _destroy(s)
	return {"constructor_cases": observations, "actual_main_suppliers": false}
