extends SceneTree
## NEW actual emitter/World/F-H-D/hitFX integration only. No old suite replay.
## PacketOwner is a fresh source-input constructor fixture, not an admitted
## type3 actor or natural summon/charge proof. World, Player, kernels, phase
## drivers and hitFX provider are the actual production consumers.
## No product private clock/HP/state/position writes after construction.

const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")
const EmitterScript = preload("res://scripts/native_element_projectile_emitter.gd")
const GROUPS = ["raw_six_world_birth", "native_fhd_contacts", "native_hitfx_lifecycle", "emitter_atomic_rejections"]
const ELEMENT_NAMES = ["physical", "fire", "ice", "dark", "lightning", "holy"]
const RAW_DAMAGE = [24, 37, 37, 31, 24, 24]
const NORMALIZED_DAMAGE = [24, 74, 74, 62, 48, 48]

class PacketOwner extends Node2D:
	var etype: int
	var element: String
	var attack = 31
	var data: Dictionary
	var element_id: int
	var source_origin: Vector2
	var direction: Vector2
	var observed_phases: Array = []
	var emit_results: Array = []
	var emitter: Node
	var emitted = false

	func _init(el: int, origin: Vector2, aim: Vector2, actual_emitter: Node, actor_type: int = 3) -> void:
		etype = actor_type
		element_id = el
		element = ["physical", "fire", "ice", "dark", "lightning", "holy"][el]
		source_origin = origin
		direction = aim.normalized()
		emitter = actual_emitter
		data = {"etype": etype, "attack": attack, "element_id": el, "native_final": {"col": "#66ee66"}}

	func get_snapshot() -> Dictionary:
		return {"native": {"etype": etype, "el": element_id, "atk": attack, "col": "#66ee66"}, "constructor_packet_fixture": true}

	func get_source_packet() -> Dictionary:
		# Source projectile-normalization supplement: fresh _fireChargedProj
		# inputs BEFORE spawnProj normalization. No supplied final speed/sample.
		var size = 1.6 if element_id in [1, 2, 3] else 1.5
		var velocity_size = 3.3 if element_id == 3 else 3.2 if element_id in [1, 2] else 3.0
		var multiplier = 1.2 if element_id in [1, 2] else 1.0 if element_id == 3 else 0.8
		var color = ["#bbbbbb", "#ff2e22", "#317cec", "#a44cff", "#ffee00", "#ff88cc"][element_id]
		var packet = {"x": source_origin.x, "y": source_origin.y, "vx": direction.x * velocity_size, "vy": direction.y * velocity_size, "dmg": int(attack * multiplier), "el": element_id, "friendly": false, "life": 60, "ml": 60, "sz": size, "col": color, "_commit": true}
		if element_id == 1: packet["fireMagic"] = true
		elif element_id == 2: packet["waterBean"] = true
		elif element_id == 3: packet["gbBean"] = true
		return packet

	func advance_request(ticks: float, frame: float, identity: Variant) -> void:
		if emitted:
			return
		emitted = true
		# Capture the actual phase arguments; never write a product clock.
		observed_phases.append({"ticks": ticks, "frame": frame, "identity": identity})
		emit_results.append(emitter.emit(self, get_source_packet()))

class FxRequestOwner extends Node2D:
	var actual_world: Node2D
	var origin: Vector2
	var emitted = false
	var phases: Array = []

	func _init(world: Node2D, source_origin: Vector2) -> void:
		actual_world = world
		origin = source_origin

	func advance_request(ticks: float, frame: float, identity: Variant) -> void:
		if emitted:
			return
		emitted = true
		phases.append({"ticks": ticks, "frame": frame, "identity": identity})
		# A bounded actual World hitFX request fixture. F/H/D contact coupling
		# is exercised separately through real new kernels and real Player.
		for index in range(13):
			var element = "holy" if index == 12 else "fire"
			actual_world.emit_native_projectile_hit_fx({"element": element, "element_id": 5 if element == "holy" else 1, "position": origin, "target_position": origin, "dark_ball": false, "redBean": false})

class PhaseStopper extends Node:
	var condition: Callable
	var maximum_updates: int
	var updates = 0
	var stopped = false
	var timed_out = false

	func _init(predicate: Callable, limit: int) -> void:
		condition = predicate
		maximum_updates = limit
		process_mode = Node.PROCESS_MODE_PAUSABLE
		process_physics_priority = 100

	func _physics_process(_delta: float) -> void:
		updates += 1
		if condition.call() == true:
			stopped = true
			get_tree().paused = true
		elif updates >= maximum_updates:
			timed_out = true
			get_tree().paused = true

var _only: Array = []
var _ledger_path = ""
var _group = ""
var _failures = 0
var _passed: Array = []
var _executed: Array = []
var _observations: Dictionary = {}
var _automatic_fixture_updates = 0
var _explicit_product_physics_calls = 0

func _initialize() -> void:
	paused = true
	for action in ["move_left", "move_right", "move_up", "move_down", "weapon", "cancel_charge"]:
		if not InputMap.has_action(action): InputMap.add_action(action)
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			_only = Array(argument.trim_prefix("--only=").split(","))
		elif argument.begins_with("--ledger="):
			_ledger_path = argument.trim_prefix("--ledger=")
	call_deferred("_run")

func _run() -> void:
	for selected in _only:
		_expect(GROUPS.has(selected), "unknown --only group must fail: " + str(selected))
	for name in GROUPS:
		if not _only.is_empty() and not _only.has(name): continue
		_group = name
		_executed.append(name)
		var before = _failures
		match name:
			"raw_six_world_birth": await _raw_six_world_birth()
			"native_fhd_contacts": await _native_fhd_contacts()
			"native_hitfx_lifecycle": await _native_hitfx_lifecycle()
			"emitter_atomic_rejections": _emitter_atomic_rejections()
		if _failures == before:
			_passed.append(name)
			print("PASS ", name)
		else:
			print("FAIL ", name)
	var result = {"executed_groups": _executed, "passing_groups": _passed, "failed_assertions": _failures, "only": _only, "automatic_fixture_physics_updates": _automatic_fixture_updates, "explicit_product_physics_method_calls": _explicit_product_physics_calls, "live_app_inputs": 0, "product_private_clock_or_HP_or_state_or_position_writes": 0, "source_or_PNG_rehash_copy": 0, "old_suite_replay": 0, "public_play_evidence": false, "performance_evidence": false, "whole_JS_RNG_stream_equivalence": false, "full_Q_E_or_gear_parity": false, "observations": _observations}
	if not _ledger_path.is_empty():
		var ledger = FileAccess.open(_ledger_path, FileAccess.WRITE)
		if ledger == null:
			_failures += 1
			result["failed_assertions"] = _failures
			printerr("ASSERT_FAIL ledger destination could not be opened: ", _ledger_path)
		else:
			ledger.store_string(JSON.stringify(_plain(result), "\t") + "\n")
			ledger.close()
	var summary = result.duplicate()
	summary.erase("observations")
	summary["observation_groups"] = _observations.keys()
	summary["ledger_path"] = _ledger_path
	print("GODOT_NATIVE_ELEMENT_RESULT ", JSON.stringify(_plain(summary)))
	quit(0 if _failures == 0 else 1)

func _expect(condition: bool, label: String) -> bool:
	if not condition:
		_failures += 1
		printerr("ASSERT_FAIL [%s] %s" % [_group, label])
	return condition

func _near(actual: float, expected: float, label: String, tolerance: float = 0.0001) -> void:
	_expect(absf(actual - expected) <= tolerance, "%s actual=%s expected=%s" % [label, actual, expected])

func _point(value: Variant) -> Vector2:
	if value is Vector2: return value
	if value is Array and value.size() == 2: return Vector2(float(value[0]), float(value[1]))
	return Vector2(INF, INF)

func _plain(value: Variant) -> Variant:
	if value is Vector2: return [value.x, value.y]
	if value is Color: return value.to_html(true)
	if value is Dictionary:
		var result: Dictionary = {}
		for key in value: result[str(key)] = _plain(value[key])
		return result
	if value is Array:
		var result: Array = []
		for item in value: result.append(_plain(item))
		return result
	if value is Object: return "object_reference_observed_not_serialized"
	return value

func _fixture(translation: Vector2 = Vector2.ZERO, with_emitter: bool = true, initial_hp: int = 350) -> Dictionary:
	paused = true
	var world = WorldScript.new()
	# Constructor-only transformed parent exercises the birth adapter's actual
	# local/global separation; it is not a map geometry/pixel parity claim.
	world.position = translation
	world.process_mode = Node.PROCESS_MODE_PAUSABLE
	root.add_child(world)
	_expect(world.ready_for_player, "actual World completed its original ready path")
	var start: Vector2 = world.get_start_position()
	var player = PlayerScript.new()
	player.position = world.to_local(start)
	player.hp = initial_hp # constructor export only, before tree/lifecycle
	player.set_world(world)
	world.add_child(player)
	world.set_player(player)
	var camera = Camera2D.new()
	camera.position = world.to_local(start)
	world.add_child(camera)
	camera.make_current()
	var fx: Node = world.get_node_or_null("NativeProjectileHitEffects")
	_expect(is_instance_valid(fx) and fx.get_snapshot().get("configured", false), "actual World-owned hitFX is configured")
	var emitter: Node
	if with_emitter:
		emitter = EmitterScript.new()
		_expect(emitter.configure(world, player), "actual emitter configure succeeds")
		world.add_child(emitter)
		_expect(world.bind_native_projectile_emitter(emitter), "actual World binds its actual child emitter")
	var events: Array = []
	player.telemetry_event.connect(func(kind: String, data: Dictionary):
		events.append({"kind": kind, "data": data.duplicate(true), "native_frame": world.get_native_frame(), "native_knockback": player.get_native_knockback(), "player_snapshot": player.get_snapshot()}))
	if is_instance_valid(emitter):
		emitter.telemetry_event.connect(func(kind: String, data: Dictionary):
			events.append({"kind": kind, "data": data.duplicate(true), "native_frame": world.get_native_frame(), "native_knockback": player.get_native_knockback(), "player_snapshot": player.get_snapshot()}))
	return {"world": world, "player": player, "fx": fx, "emitter": emitter, "start": start, "events": events, "identity": world.get_native_world_identity()}

func _add_packet_owner(f: Dictionary, element: int, origin: Vector2, direction: Vector2, register_phase: bool = true, actor_type: int = 3) -> PacketOwner:
	var owner = PacketOwner.new(element, origin, direction, f["emitter"], actor_type)
	owner.position = f["world"].to_local(origin)
	f["world"].add_child(owner)
	if register_phase:
		_expect(f["world"].register_native_phase_consumer(owner, owner.advance_request), "actual World registers the fresh request owner")
	return owner

func _run_actual_until(f: Dictionary, condition: Callable, limit: int = 100) -> void:
	var stopper = PhaseStopper.new(condition, limit)
	f["world"].add_child(stopper)
	paused = false
	var deadline = Time.get_ticks_msec() + 5000
	while not stopper.stopped and not stopper.timed_out and Time.get_ticks_msec() < deadline:
		await process_frame
	paused = true
	_automatic_fixture_updates += stopper.updates
	_expect(stopper.stopped and not stopper.timed_out, "actual SceneTree phase predicate completed before its bounded deadline")
	stopper.free()

func _dispose(f: Dictionary) -> void:
	paused = true
	f["world"].free()

func _events_of(f: Dictionary, kind: String) -> Array:
	var found: Array = []
	for event in f["events"]:
		if event["kind"] == kind: found.append(event)
	return found

func _raw_six_world_birth() -> void:
	var f = _fixture(Vector2(37.0, -22.0))
	var world: Node2D = f["world"]
	var start: Vector2 = f["start"]
	var direction = Vector2.RIGHT
	var origin = start - direction * 80.0
	if not world.can_move(origin, 5.2):
		for candidate in [Vector2.UP, Vector2.DOWN, Vector2.LEFT]:
			if world.can_move(start - candidate * 80.0, 5.2):
				direction = candidate
				origin = start - candidate * 80.0
				break
	_expect(world.can_move(origin, 5.2), "constructor packet origin uses an actually open source-map point")
	var owners: Array = []
	for el in range(6): owners.append(_add_packet_owner(f, el, origin, direction))
	await _run_actual_until(f, func(): return f["emitter"].get_snapshot()["metrics"]["explicit_birth_calls"] == 6, 8)
	var first: Dictionary = f["emitter"].get_snapshot()
	_expect(first["pending_births"] == 0 and first["deliveries"].size() == 6, "all six births are actual appended deliveries, with no pending remainder")
	_expect(first["metrics"]["accepted"] == 6 and first["metrics"]["rejected"] == 0, "all six exact source packets are admitted")
	_expect(first["metrics"]["world_speed_samples"] == 4 and first["metrics"]["legacy_kernel_speed_samples"] == 2, "P/F/D/H source speed draws and I/L inherited birth samples have separate routes")
	_expect(is_same(f["identity"], world.get_native_world_identity()) and is_same(world.get_enemies(), world.get_native_world_identity()), "actual World publishes its stable registry reference token")
	_expect(world.get_native_runtime_snapshot()["initial_encounter_report_unchanged"], "new request owners never rewrite the original encounter report")
	var first_records: Array = []
	for index in range(first["deliveries"].size()):
		var d: Dictionary = first["deliveries"][index]
		var profile: Dictionary = d["normalized_profile"]
		var owner: PacketOwner = owners[index]
		_expect(owner.emit_results == [true], "exact source request emitted once for element " + str(index))
		_expect(is_same(owner.observed_phases[0]["identity"], f["identity"]), "owner receives the actual World reference token")
		_expect(d["source_append_order"] == index + 1 and profile["element_id"] == index, "source order and element survive the real emitter")
		_near(float(d["raw_packet"]["dmg"]), RAW_DAMAGE[index], "source raw damage")
		_near(float(profile["normalized_damage"]), NORMALIZED_DAMAGE[index], "normalization doubles damage, then only redBean halves it")
		_near(float(d["damage"]), NORMALIZED_DAMAGE[index], "actual kernel base damage")
		_near(float(profile["size"]), 3.2 if index in [1, 2, 3] else 3.0, "size doubles exactly")
		_near(float(profile["radius"]), 5.2, "source projectile radius")
		_near(float(profile["contact_margin"]), 13.6 if index in [1, 2, 3] else 13.0, "source contact margin")
		_near(float(profile["life_ticks"]), 60.0, "type3 life stays60")
		_near(float(d["life_ticks"]), 59.333, "actual first source birth phase decrements life once")
		_expect(d["birth_explicit_phase_calls"] == 1 and d["auto_physics_calls"] == 0, "explicit birth precedes every automatic call")
		_near(float(d["explicit_native_ticks"]), 1.0, "one actual native tick in the birth phase")
		_near(float(d["constructor_birth_frame"]), float(d["actual_release_global_frame"]) - 1.0, "constructor clock uses actual release minus actual birth tick")
		_near(float(d["native_frame"]), float(d["actual_release_global_frame"]), "first source consumption reaches actual release frame")
		_near(float(d["actual_global_frame_readonly"]), world.get_native_frame(), "bridge reads actual World clock")
		_near(float(d["birth_prephase"]["life_ticks"]), 60.0, "prephase remains unconsumed")
		_expect(_point(d["initial_source_global_position"]).distance_to(origin) < 0.0001, "source-global origin stays independent of the transformed world")
		_expect(_point(d["birth_prephase"]["global_position"]).distance_to(origin) < 0.0001, "actual ready position has no double world offset")
		_expect(_point(d["position_local"]).distance_to(world.to_local(_point(d["position_global"]))) < 0.0001, "live local/global coordinates agree with the actual parent")
		var speed = float(d["speed"])
		_expect(_near_speed(speed, index), "per-element source speed is300 or500..600")
		_expect(_point(d["position_global"]).distance_to(origin + direction * speed / 60.0) < 0.001, "actual birth movement uses one source tick")
		_expect(d["observer_position_writes"] == 0 and d["owner_independent"], "bridge reports no observer position writes and independent ownership")
		first_records.append(d.duplicate(true))
	await _run_actual_until(f, func():
		var deliveries: Array = f["emitter"].get_snapshot()["deliveries"]
		return deliveries.size() == 6 and deliveries.all(func(item): return int(item["auto_physics_calls"]) >= 1), 8)
	var after: Dictionary = f["emitter"].get_snapshot()
	for delivery in after["deliveries"]:
		_expect(delivery["birth_explicit_phase_calls"] == 1 and delivery["auto_physics_calls"] == 1, "next actual automatic callback advances once without a second birth consumption")
		_near(float(delivery["life_ticks"]), 58.666, "next automatic callback independently decrements life once")
		_near(float(delivery["native_frame"]), world.get_native_frame(), "automatic kernel clock agrees with actual World frame")
	_observations[_group] = {"first_birth": first_records, "after_first_auto": after, "world": world.get_native_runtime_snapshot(), "constructor_request_fixture_only": true}
	_dispose(f)

func _near_speed(speed: float, element: int) -> bool:
	return absf(speed - 300.0) < 0.0001 if element == 0 else speed >= 500.0 and speed <= 600.0

func _native_fhd_contacts() -> void:
	var records: Array = []
	for element in [1, 5, 3]:
		var f = _fixture()
		var origin: Vector2 = f["start"] - Vector2(5.0, 0.0)
		_expect(f["world"].can_move(origin, 5.2), "actual contact constructor origin is clear")
		_add_packet_owner(f, element, origin, Vector2.RIGHT)
		await _run_actual_until(f, func(): return _events_of(f, "enemy_projectile_hit").size() == 1, 8)
		var hits = _events_of(f, "enemy_projectile_hit")
		var damage_events = _events_of(f, "player_damage")
		_expect(hits.size() == 1 and damage_events.size() == 1, "new kernel actually calls the actual Player exactly once")
		if hits.is_empty() or damage_events.is_empty():
			_dispose(f)
			continue
		var expected = 80 if element == 3 else 74 if element == 1 else 48
		var hit: Dictionary = hits[0]
		var damage: Dictionary = damage_events[0]["data"]
		_expect(damage["raw_amount"] == expected and damage["amount"] == expected and damage["damage_type"] == "magic", "F/H normalized damage and D trunc62x1.3 consume the actual magic damage authority")
		_expect(hit["player_snapshot"]["hp"] == 350 - expected, "actual native HP changes by the accepted request")
		_expect(hit["player_snapshot"]["poise"] == 3, "actual accepted ordinary hurtP consumes one player poise")
		var impulse: Vector2 = hit["native_knockback"]
		if element == 3:
			_near(impulse.length(), float(expected) / 350.0 * 30.0, "D preserves ordinary hurtP generic impulse, no projectile override")
			_expect(hit["data"]["native_knockback"] == 0.0, "D adds no separate packet knockback")
		else:
			_expect(impulse.distance_to(Vector2(2.0, 0.0)) < 0.0001, "F/H accepted hit uses heading-times2 instead of generic KB")
		_expect(hit["data"]["poison_appended"] == false and hit["data"]["burn_appended"] == false, "new F/H/D contact invents no poison/burn")
		_expect(hit["player_snapshot"]["burn_stacks"].is_empty() and hit["player_snapshot"]["freeze_slow_ticks"] == 0.0, "actual Player receives no unrelated burn or ice status")
		var fx: Dictionary = f["fx"].get_snapshot()
		_expect(fx["metrics"]["hits"] == 1 and fx["booms"].size() == 1, "actual World hitFX provider receives the new onhit request")
		if not fx["booms"].is_empty():
			var boom: Dictionary = fx["booms"][0]
			_expect(boom["element"] == ELEMENT_NAMES[element] and boom["layers"] == (2 if element == 3 else 1), "new original hit texture layers follow the actual element")
			_near(float(boom["duration"]), 66.0, "requested48 hitFX gets actual66 lifetime")
			_near(float(boom["age"]), 1.0, "new hitFX ages in its later actual post phase")
		_expect(fx["metrics"]["dark_texts"] == (1 if element == 3 else 0), "D native text effect is actually isolated from F/H")
		records.append({"element": ELEMENT_NAMES[element], "damage": damage, "hit": hit, "fx": fx, "emitter": f["emitter"].get_snapshot()})
		_dispose(f)
	# Constructor HP0 makes actual hurtP reject at its existing front guard.
	# The original outer projectile gate still requests hitFX after that call.
	var dead = _fixture(Vector2.ZERO, true, 0)
	_add_packet_owner(dead, 1, dead["start"] - Vector2(5.0, 0.0), Vector2.RIGHT)
	await _run_actual_until(dead, func(): return _events_of(dead, "enemy_projectile_hit").size() == 1, 8)
	_expect(_events_of(dead, "player_damage").is_empty(), "constructor HP0 is internally rejected by actual hurtP")
	_expect(dead["player"].get_native_knockback() == Vector2.ZERO, "rejected hurtP does not apply heading KB")
	_expect(dead["fx"].get_snapshot()["metrics"]["hits"] == 1, "original posthit FX is independent of hurtP acceptance")
	records.append({"constructor_HP0_internal_rejection": true, "events": dead["events"], "fx": dead["fx"].get_snapshot()})
	_observations[_group] = records
	_dispose(dead)

func _native_hitfx_lifecycle() -> void:
	var f = _fixture(Vector2.ZERO, false)
	var owner = FxRequestOwner.new(f["world"], f["start"])
	f["world"].add_child(owner)
	_expect(f["world"].register_native_phase_consumer(owner, owner.advance_request), "actual World registers bounded hitFX source requests")
	await _run_actual_until(f, func(): return f["fx"].get_snapshot()["metrics"]["hits"] == 13, 8)
	var first: Dictionary = f["fx"].get_snapshot()
	var born_frame: float = f["world"].get_native_frame()
	_expect(first["booms"].size() == 12, "source hitFX pool admits its exact12 active slots")
	if first["booms"].size() == 12:
		_expect(first["booms"][0]["element"] == "holy", "full pool source replacement uses slot0 for the13th hit")
		for index in range(1, 12): _expect(first["booms"][index]["element"] == "fire", "other full-pool slots preserve their source request")
	for boom in first["booms"]:
		_near(float(boom["age"]), 1.0, "owner-born FX receives one actual post step")
		_near(float(boom["duration"]), 66.0, "each source request48 has actual66 duration")
	_expect(not first["particles"].is_empty() and first["metrics"]["particles_born"] > 0, "actual original parts are created before their lifetime is tested")
	for particle in first["particles"]:
		_expect(float(particle["life"]) > 0.0 and float(particle["maximum_life"]) >= 12.0 and float(particle["maximum_life"]) < 24.0, "source particle has its actual12..24tick born lifetime")
	_expect(first["blast_lights"].size() == 13, "actual source hit requests produce their separate light pool entries")
	for light in first["blast_lights"]:
		_near(float(light["maximum_life"]), 21.0, "source12-parts light born lifetime")
		_near(float(light["life"]), 20.0, "actual same-frame light post step")
	var paused_frame: float = f["world"].get_native_frame()
	for frame in range(3): await process_frame
	_near(f["world"].get_native_frame(), paused_frame, "public SceneTree pause freezes actual World clock")
	_expect(f["fx"].get_snapshot()["booms"] == first["booms"], "pause freezes the actual hitFX pool age")
	await _run_actual_until(f, func(): return f["world"].get_native_frame() >= born_frame + 64.0, 70)
	var before_expiry: Dictionary = f["fx"].get_snapshot()
	_expect(before_expiry["booms"].size() == 12, "age65 remains alive, no early request48 expiry")
	for boom in before_expiry["booms"]: _near(float(boom["age"]), 65.0, "actual source age before expiry")
	_expect(before_expiry["particles"].is_empty() and before_expiry["blast_lights"].is_empty(), "actual short particle and light lifetimes expire before the66tick boom")
	await _run_actual_until(f, func(): return f["world"].get_native_frame() >= born_frame + 65.0, 4)
	var expired: Dictionary = f["fx"].get_snapshot()
	_expect(expired["booms"].is_empty(), "actual age66 recycles every hitFX pool slot")
	_expect(expired["metrics"]["hits"] == 13, "expiry and pause create no new hit request")
	_expect(is_same(owner.phases[0]["identity"], f["identity"]), "FX request dispatch observes actual World identity")
	_observations[_group] = {"first": first, "age65": before_expiry, "age66": expired, "world": f["world"].get_native_runtime_snapshot(), "request_fixture_only": true, "pixel_quality_verified": false}
	_dispose(f)

func _emitter_atomic_rejections() -> void:
	var f = _fixture()
	var owner = _add_packet_owner(f, 0, f["start"] - Vector2(5.0, 0.0), Vector2.RIGHT, false)
	var source = owner.get_source_packet()
	var malformed: Array = []
	for entry in [["dmg", 25], ["life", 120], ["sz", 1.6], ["_commit", false], ["blackBean", true], ["unexpected", 1], ["vx", NAN], ["el", 1]]:
		var packet = source.duplicate(true)
		packet[entry[0]] = entry[1]
		malformed.append(packet)
	var before_children: int = f["world"].get_child_count()
	var before_clock: Dictionary = f["world"].get_native_runtime_snapshot()
	var before_fx: Dictionary = f["fx"].get_snapshot()
	var errors: Array = []
	for packet in malformed:
		_expect(not f["emitter"].emit(owner, packet), "malformed constructor raw packet is explicitly rejected")
		errors.append(f["emitter"].get_last_error())
		_expect(f["world"].get_child_count() == before_children, "invalid raw has no partial projectile child")
	var after: Dictionary = f["emitter"].get_snapshot()
	_expect(after["pending_births"] == 0 and after["deliveries"].is_empty() and after["metrics"]["accepted"] == 0, "invalid raw leaves no pending birth/delivery/accepted actor")
	_expect(after["metrics"]["rejected"] == malformed.size(), "every intentional rejection is counted, not hidden")
	_expect(f["world"].get_native_runtime_snapshot() == before_clock, "invalid raw consumes no source clock or random draw")
	_expect(f["fx"].get_snapshot()["metrics"] == before_fx["metrics"], "invalid raw emits no partial source hitFX/parts")
	_expect(f["player"].get_snapshot()["hp"] == 350 and f["player"].get_native_knockback() == Vector2.ZERO, "invalid raw never changes actual target damage/KB")
	var invalid_world = Node2D.new()
	var rejected_emitter = EmitterScript.new()
	_expect(not rejected_emitter.configure(invalid_world, f["player"]), "constructor world missing actual required providers rejects configure")
	_expect(not rejected_emitter.get_snapshot()["configured"] and rejected_emitter.get_child_count() == 0, "missing provider leaves emitter unconfigured with no partial child")
	_observations[_group] = {"intentional_rejection_errors": errors, "emitter": after, "invalid_provider_error": rejected_emitter.get_last_error(), "world_before": before_clock, "world_after": f["world"].get_native_runtime_snapshot(), "no_actual_scene_ticks": true}
	rejected_emitter.free()
	invalid_world.free()
	_dispose(f)
