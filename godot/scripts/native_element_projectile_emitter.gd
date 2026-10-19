class_name ExoduserNativeElementProjectileEmitter
extends Node

signal telemetry_event(kind: String, data: Dictionary)

# Only the newly authored caller translation/birth bridge. Existing kernels,
# original bitmap resources and World clock/phase driver are not replaced here.
const ELEMENTS = ["physical", "fire", "ice", "dark", "lightning", "holy"]
const LEGACY_PROFILE_PATHS = {
	0: "res://data/etype0_physical_flesh_crawler.json",
	2: "res://data/etype4_ice_soul_flame.json",
	4: "res://data/etype1_lightning_hive_bloater.json"
}
const REQUIRED_TEXTURES = [
	"res://assets/enemy/proj_phys_mouth.png",
	"res://assets/vfx/water_blue_projectile_sheet.png",
	"res://assets/vfx/Water_ImpactWater_Sheet.png",
	"res://assets/vfx/proj_bolt_comet.png",
	"res://assets/vfx/Lightning_ImpactLightning_Sheet.png",
	"res://assets/vfx/Lightning_Lightning_FBF_4x3.png",
	"res://assets/vfx/Fire_FBF_4x4.png",
	"res://assets/vfx/Light_ImpactLight_Sheet.png",
	"res://assets/vfx/Dark_MediumImpact.png",
	"res://assets/vfx/Dark_DarkSmoke_FBF_4x4.png"
]
const RAW_KEYS = ["x", "y", "vx", "vy", "dmg", "el", "friendly", "life", "ml", "col", "sz", "_commit", "fireMagic", "waterBean", "gbBean", "redBean", "blackBean", "blueBean"]
var _world: Node2D
var _target: Node2D
var _configured = false
var _error = "not_configured"
var _legacy_profiles: Dictionary = {}
var _required_resources: Dictionary = {}
var _pending: Array = []
var _deliveries: Array = []
var _append_order = 0
var _metrics = {"raw_requests": 0, "normalized21_requests": 0, "accepted": 0, "rejected": 0,
	"queued_external": 0, "birth_phases": 0, "explicit_birth_calls": 0, "birth_phase_rejections": 0,
	"world_speed_samples": 0, "legacy_kernel_speed_samples": 0, "supplied21_speed_samples": 0,
	"spawn_parts_calls": 0}

func configure(world: Node2D, target: Node2D) -> bool:
	if _configured or not is_instance_valid(world) or not is_instance_valid(target):
		return _reject("invalid_owner_or_target")
	for method in ["is_world_blocked", "get_native_frame", "get_native_projectile_fx_context", "sample_native_random_unit", "supports_native_projectile_hit_fx", "emit_native_projectile_hit_fx", "emit_native_parts"]:
		if not world.has_method(method):
			return _reject("missing_world_" + method)
	for method in ["receive_damage", "apply_native_burn", "apply_native_freeze_slow", "get_native_element_multiplier"]:
		if not target.has_method(method):
			return _reject("missing_target_" + method)
	if not target.has_signal("native_idle_status_tick"):
		return _reject("missing_actual_electric_idle_clock")
	for el in [0, 2, 4]:
		# Existing P/I/L kernels store contact damage at birth. This new adapter
		# admits the current original no-armor native slice, never fabricated gear.
		var multiplier: Variant = target.get_native_element_multiplier(el)
		if not _number(multiplier) or float(multiplier) != 1.0:
			return _reject("unsupported_legacy_target_armor_slice")
	for el in ["fire", "holy", "dark"]:
		if world.supports_native_projectile_hit_fx(el, el == "dark") != true:
			return _reject("required_actual_hit_fx_not_ready:" + el)
	for path in REQUIRED_TEXTURES:
		if not ResourceLoader.exists(path, "Texture2D"):
			return _reject("missing_required_original:" + path)
		var original = ResourceLoader.load(path, "Texture2D") as Texture2D
		if original == null:
			return _reject("unreadable_required_original:" + path)
		_required_resources[path] = original
	if not ResourceLoader.exists("res://assets/fonts/NotoSansKR.ttf", "FontFile"):
		return _reject("missing_existing_native_font")
	var font = ResourceLoader.load("res://assets/fonts/NotoSansKR.ttf", "FontFile") as Font
	if font == null:
		return _reject("unreadable_existing_native_font")
	_required_resources["res://assets/fonts/NotoSansKR.ttf"] = font
	var profiles: Dictionary = {}
	for el in LEGACY_PROFILE_PATHS:
		var loaded = _load_legacy_profile(LEGACY_PROFILE_PATHS[el], el)
		if loaded.is_empty():
			return false
		profiles[el] = loaded
	_world = world
	_target = target
	_legacy_profiles = profiles
	if _actual_clock().is_empty():
		return _reject("missing_actual_native_clock")
	_configured = true
	_error = ""
	return true

func supports_source_actor(etype: int, element: int) -> bool:
	return _configured and ((etype == 3 and element >= 0 and element <= 5) or (etype == 7 and element == 0) or (etype == 21 and element == 3))

func create_type7_teleport() -> Node2D:
	# New subtype only. Parent still calls the unchanged original configure API.
	var teleport = Type7TeleportBirthQueue.new()
	teleport.source_birth_sink = weakref(self)
	return teleport

func emit(actor: Node2D, raw_packet: Dictionary) -> bool:
	_metrics.raw_requests += 1
	if not _configured or not is_instance_valid(actor):
		return _reject("unconfigured_raw_caller")
	var identity = _actor_identity(actor)
	if identity.is_empty():
		return _reject("missing_actual_actor_identity")
	var etype = int(identity["etype"])
	var element = int(identity["element"])
	if etype not in [3, 7] or not supports_source_actor(etype, element):
		return _reject("unsupported_raw_source_actor")
	var error = _raw_error(raw_packet, identity)
	if not error.is_empty():
		return _reject(error)
	var clock = _actual_clock()
	if clock.is_empty() or not _providers_live():
		return _reject("required_live_clock_or_fx_lost")
	var origin = Vector2(float(raw_packet["x"]), float(raw_packet["y"]))
	var aim = Vector2(float(raw_packet["vx"]), float(raw_packet["vy"]))
	var profile = _raw_profile(raw_packet, etype, element)
	if profile.is_empty():
		return false
	if not _create_birth(origin, aim, profile, element, etype, raw_packet, clock, "raw_charged"):
		return false
	# type7 already calls its actual original parts callback after this consumer.
	if etype == 3:
		var color = "#ff2e22" if element == 1 else "#317cec" if element == 2 else "#a44cff" if element == 3 else str(identity["col"])
		_world.emit_native_parts(origin, color, 3 if element in [1, 2, 3] else 2)
		_metrics.spawn_parts_calls += 1
	return true

func emit_normalized_type21(actor: Node2D, origin: Vector2, heading: Vector2, profile: Dictionary) -> bool:
	_metrics.normalized21_requests += 1
	if not _configured or not is_instance_valid(actor) or not origin.is_finite() or not heading.is_finite() or heading.length_squared() <= 0.0:
		return _reject("invalid_normalized21_birth")
	var identity = _actor_identity(actor)
	if identity.is_empty() or int(identity["etype"]) != 21 or int(identity["element"]) != 3:
		return _reject("wrong_normalized21_actor")
	if not _normalized21_valid(profile):
		return _reject("unsupported_normalized21_profile")
	var clock = _actual_clock()
	if clock.is_empty() or not _providers_live():
		return _reject("required_live_clock_or_fx_lost")
	# This owner already performed its one speed sample. Never sample it again.
	if not _create_birth(origin, heading, profile.duplicate(true), 3, 21, {}, clock, "owner_normalized21"):
		return false
	_metrics.supplied21_speed_samples += 1
	_world.emit_native_parts(origin, "#a44cff", 3)
	_metrics.spawn_parts_calls += 1
	return true

func queue_existing_birth(shot: Node2D, source_global_position: Vector2, actual_global_frame: float) -> bool:
	# For the NEW TP subclass only; it retains frozen TP configure/profile/visuals.
	if not _configured or not is_instance_valid(shot) or shot.get_parent() != _world or not source_global_position.is_finite() or not is_finite(actual_global_frame):
		return _reject("invalid_existing_birth")
	if shot.is_physics_processing() or not shot.has_method("consume_birth_phase") or not shot.has_method("get_bridge_snapshot"):
		return _reject("existing_birth_missing_disabled_explicit_bridge")
	var before: Variant = shot.get_bridge_snapshot()
	if not (before is Dictionary) or int(before.get("birth_explicit_phase_calls", -1)) != 0:
		return _reject("existing_birth_already_consumed")
	for entry in _pending:
		if entry["shot"].get_ref() == shot:
			return _reject("duplicate_pending_birth")
	var clock = _actual_clock()
	if clock.is_empty() or float(clock["frame"]) != actual_global_frame:
		return _reject("existing_birth_not_actual_frame")
	_append_pending(shot, source_global_position, actual_global_frame, 7, "queued_teleport", {})
	_metrics.queued_external += 1
	return true

func advance_birth_phase(ticks: float, actual_global_frame: float) -> void:
	# World late driver: OLD priority1 shots -> this pending phase2 -> postFX3.
	var clock = _actual_clock()
	if not _configured or not is_finite(ticks) or ticks <= 0.0 or not is_finite(actual_global_frame) or clock.is_empty() or float(clock["frame"]) != actual_global_frame or float(clock["ticks"]) != ticks:
		_error = "invalid_actual_birth_phase"
		_metrics.birth_phase_rejections += 1
		return
	_metrics.birth_phases += 1
	var pending = _pending
	_pending = []
	for entry in pending:
		var shot: Node2D = entry["shot"].get_ref()
		if not is_instance_valid(shot) or shot.is_queued_for_deletion():
			continue
		if float(entry["frame"]) != actual_global_frame:
			_error = "pending_source_frame_mismatch"
			_metrics.birth_phase_rejections += 1
			shot.queue_free()
			continue
		shot.consume_birth_phase(ticks)
		var snapshot: Dictionary = shot.get_bridge_snapshot()
		if int(snapshot.get("birth_explicit_phase_calls", -1)) != 1:
			_error = "required_explicit_birth_not_consumed"
			_metrics.birth_phase_rejections += 1
			shot.queue_free()
			continue
		_metrics.explicit_birth_calls += 1
		entry["last_snapshot"] = snapshot.duplicate(true)
		telemetry_event.emit("native_source_projectile_birth", _delivery_snapshot(entry))
		if entry.has("teleport_source"):
			var teleport: Node2D = entry["teleport_source"].get_ref()
			if is_instance_valid(teleport):
				teleport.notify_source_birth_delivered(snapshot)
		if not shot.is_queued_for_deletion():
			shot.call_deferred("set_physics_process", true)

func _queue_teleport_birth(shot: Node2D, origin: Vector2, frame: float, teleport: Node2D) -> bool:
	if not queue_existing_birth(shot, origin, frame):
		return false
	var entry: Dictionary = _pending.back()
	entry["teleport_source"] = weakref(teleport)
	return true

func _create_birth(origin: Vector2, aim: Vector2, profile: Dictionary, element: int, etype: int, raw: Dictionary, clock: Dictionary, source_kind: String) -> bool:
	var shot: Node2D
	match element:
		0: shot = PhysicalBirth.new()
		1: shot = FireBirth.new()
		2: shot = IceBirth.new()
		3: shot = DarkBirth.new()
		4: shot = LightningBirth.new()
		5: shot = HolyBirth.new()
		_: return _reject("unsupported_element_no_substitute")
	var birth_frame = float(clock["frame"]) - float(clock["ticks"])
	var local_origin = _world.to_local(origin)
	var result: Variant = shot.configure(local_origin, aim, profile, _target, _world, birth_frame)
	if element in [1, 3, 5] and result != true:
		shot.free()
		return _reject("required_kernel_configure_rejected")
	shot.attach_delivery({"initial_source_global_position": origin, "constructor_birth_frame": birth_frame,
		"release_native_frame": clock["frame"], "birth_ticks": clock["ticks"], "etype": etype,
		"element_id": element, "source_kind": source_kind, "raw_packet": raw.duplicate(true),
		"normalized_profile": profile.duplicate(true), "world": weakref(_world)})
	shot.set_physics_process(false)
	shot.telemetry_event.connect(_forward_kernel_event)
	_world.add_child(shot)
	shot.set_physics_process(false)
	if shot.is_queued_for_deletion():
		return _reject("required_kernel_ready_rejected")
	_append_pending(shot, origin, float(clock["frame"]), etype, source_kind, profile)
	_metrics.accepted += 1
	return true

func _append_pending(shot: Node2D, origin: Vector2, frame: float, etype: int, source_kind: String, profile: Dictionary) -> void:
	_append_order += 1
	var entry = {"shot": weakref(shot), "origin": origin, "frame": frame, "etype": etype, "source_kind": source_kind,
		"append_order": _append_order, "profile": profile.duplicate(true), "last_snapshot": shot.get_bridge_snapshot()}
	_pending.append(entry)
	_deliveries.append(entry)

func _raw_profile(raw: Dictionary, etype: int, el: int) -> Dictionary:
	var raw_damage = int(raw["dmg"])
	var normalized = int(raw_damage * 2)
	if el == 0:
		normalized = int(normalized * 0.5)
	var profile: Dictionary = _legacy_profiles[el].duplicate(true) if el in [0, 2, 4] else {}
	profile.merge({"element": ELEMENTS[el], "element_id": el, "size": float(raw["sz"]) * 2.0,
		"radius": 5.2, "contact_margin": float(raw["sz"]) * 6.0 + 4.0,
		"life_ticks": float(raw["life"]), "max_life_ticks": float(raw["ml"]),
		"commit": true, "drop_exempt": true, "homing": true, "friendly": false,
		"redBean": el == 0, "blackBean": false, "blueBean": false,
		"gbBean": el == 3, "waterBean": el == 2, "fireMagic": el == 1,
		"parry_class": "physical" if el == 0 else "magic", "native_dtype": "parry" if el == 0 else "magic",
		"normalized_damage": normalized, "raw_damage": raw_damage}, true)
	if el in [0, 2, 4]:
		profile["base_damage"] = raw_damage
		profile["contact_damage"] = normalized
		# I/L's existing configure already makes its one randf_range birth sample.
		if el in [2, 4]:
			_metrics.legacy_kernel_speed_samples += 1
		else:
			# Literal source min==max physical speed still evaluates its rand() once.
			if not _sample_unit_valid():
				return {}
	else:
		var unit: Variant = _world.sample_native_random_unit()
		if not _number(unit) or float(unit) < 0.0 or float(unit) >= 1.0:
			_reject("invalid_actual_speed_unit")
			return {}
		_metrics.world_speed_samples += 1
		profile["base_damage"] = normalized
		profile["speed_pixels_per_second"] = 500.0 + float(unit) * 100.0
		if el == 3:
			profile["source_caller"] = "etype3_charged_dark"
	return profile

func _sample_unit_valid() -> bool:
	var unit: Variant = _world.sample_native_random_unit()
	if not _number(unit) or float(unit) < 0.0 or float(unit) >= 1.0:
		return _reject("invalid_actual_physical_speed_unit")
	_metrics.world_speed_samples += 1
	return true

func _raw_error(raw: Dictionary, identity: Dictionary) -> String:
	for key in raw:
		if key not in RAW_KEYS:
			return "unknown_raw_field:" + str(key)
	for key in ["x", "y", "vx", "vy", "dmg", "el", "life", "ml", "sz"]:
		if not _number(raw.get(key)):
			return "missing_finite_raw:" + key
	for key in ["friendly", "_commit"]:
		if not (raw.get(key) is bool):
			return "missing_raw_bool:" + key
	for key in ["fireMagic", "waterBean", "gbBean", "redBean", "blackBean", "blueBean"]:
		if raw.has(key) and not (raw[key] is bool):
			return "invalid_raw_bool:" + key
	var el = int(identity["element"])
	var etype = int(identity["etype"])
	var life = 60.0 if etype == 3 else 240.0
	var size = 1.6 if el in [1, 2, 3] else 1.5
	var multiplier = 1.2 if el in [1, 2] else 1.0 if el == 3 else 0.8
	var speed = 3.3 if el == 3 else 3.2 if el in [1, 2] else 3.0
	if float(raw["el"]) != float(el) or raw.get("friendly") != false or raw.get("_commit") != true:
		return "wrong_raw_identity_or_commit"
	if float(raw["life"]) != life or float(raw["ml"]) != life or float(raw["sz"]) != size:
		return "wrong_raw_source_life_or_size"
	if float(raw["dmg"]) != float(int(float(identity["attack"]) * multiplier)) or float(raw["dmg"]) < 1.0 or float(raw["dmg"]) > 1073741823.0:
		return "wrong_raw_source_damage"
	var aim = Vector2(float(raw["vx"]), float(raw["vy"]))
	if aim.length_squared() <= 0.0 or absf(aim.length() - speed) > 0.0001:
		return "wrong_raw_source_velocity"
	if raw.get("fireMagic", false) != (el == 1) or raw.get("waterBean", false) != (el == 2) or raw.get("gbBean", false) != (el == 3):
		return "wrong_raw_bean_flags"
	for flag in ["redBean", "blackBean", "blueBean"]:
		if raw.get(flag, false) != false:
			return "foreign_raw_bean_flag"
	var color = "#ff2e22" if el == 1 else "#317cec" if el == 2 else "#a44cff" if el == 3 else ["#bbbbbb", "", "", "", "#ffee00", "#ff88cc"][el]
	if str(raw.get("col", "")) != color:
		return "wrong_raw_source_color"
	return ""

func _normalized21_valid(profile: Dictionary) -> bool:
	if profile.get("source_caller") != "etype21_dark_burst" or profile.get("element") != "dark" or profile.get("parry_class") != "magic" or profile.get("native_dtype") != "magic":
		return false
	for key in ["base_damage", "life_ticks", "size", "speed_pixels_per_second"]:
		if not _number(profile.get(key)):
			return false
	if float(profile["base_damage"]) <= 0.0 or float(profile["base_damage"]) != floor(float(profile["base_damage"])) or float(profile["life_ticks"]) != 240.0 or float(profile["size"]) != 3.2 or float(profile["speed_pixels_per_second"]) < 500.0 or float(profile["speed_pixels_per_second"]) > 600.0:
		return false
	if profile.get("gbBean", false) != true or profile.get("fireMagic", false) != false:
		return false
	for flag in ["redBean", "blackBean", "waterBean", "blueBean", "friendly"]:
		if not (profile.get(flag, false) is bool) or profile.get(flag, false) != false:
			return false
	return true

func _actor_identity(actor: Node2D) -> Dictionary:
	var source: Dictionary = {}
	if actor.has_method("get_snapshot"):
		var snapshot: Variant = actor.get_snapshot()
		if snapshot is Dictionary and snapshot.get("native") is Dictionary:
			source = snapshot["native"]
	var actor_data: Dictionary = {}
	var attack: Variant = null
	var element_name = ""
	var etype: Variant = source.get("etype")
	for item in actor.get_property_list():
		if item["name"] == "data":
			var value: Variant = actor.get("data")
			if value is Dictionary: actor_data = value
		elif item["name"] == "attack": attack = actor.get("attack")
		elif item["name"] == "etype": etype = actor.get("etype")
		elif item["name"] == "element": element_name = str(actor.get("element"))
	if not _number(etype): etype = actor_data.get("etype")
	if not _number(attack): attack = source.get("atk", actor_data.get("attack"))
	var element: Variant = source.get("el", actor_data.get("element_id"))
	if not _number(element) and element_name in ELEMENTS: element = ELEMENTS.find(element_name)
	var original: Dictionary = actor_data.get("native_final", {})
	var color = str(source.get("col", original.get("col", "")))
	if not _number(etype) or not _number(element) or not _number(attack) or float(attack) <= 0.0 or color.is_empty():
		return {}
	if float(etype) != floor(float(etype)) or float(element) != floor(float(element)) or int(element) < 0 or int(element) > 5:
		return {}
	return {"etype": int(etype), "element": int(element), "attack": float(attack), "col": color}

func _load_legacy_profile(path: String, el: int) -> Dictionary:
	if not FileAccess.file_exists(path):
		_reject("missing_required_legacy_profile:" + path)
		return {}
	var parsed = JSON.new()
	if parsed.parse(FileAccess.get_file_as_string(path)) != OK or not (parsed.data is Dictionary):
		_reject("invalid_required_legacy_profile:" + path)
		return {}
	var runtime: Variant = parsed.data.get("runtime")
	if not (runtime is Dictionary) or not (runtime.get("projectile") is Dictionary):
		_reject("missing_legacy_projectile_contract:" + path)
		return {}
	var profile: Dictionary = runtime["projectile"].duplicate(true)
	for key in ["animation", "radius", "contact_margin", "life_decay_per_tick", "speed_pixels_per_second", "homing_radians_per_tick", "homing_until_life", "player_knockback_pixels_per_tick"]:
		if not profile.has(key):
			_reject("missing_legacy_profile_field:" + key)
			return {}
	if profile.get("element") != ELEMENTS[el] or not (profile["animation"] is Dictionary) or not (profile["speed_pixels_per_second"] is Array):
		_reject("wrong_required_legacy_profile_identity")
		return {}
	return profile

func _actual_clock() -> Dictionary:
	if not is_instance_valid(_world): return {}
	var frame: Variant = _world.get_native_frame()
	var context: Variant = _world.get_native_projectile_fx_context()
	if not _number(frame) or not (context is Dictionary) or not _number(context.get("dt_sp")) or float(context["dt_sp"]) <= 0.0:
		return {}
	return {"frame": float(frame), "ticks": float(context["dt_sp"])}

func _providers_live() -> bool:
	return is_instance_valid(_target) and is_instance_valid(_world) and _world.supports_native_projectile_hit_fx("fire", false) == true and _world.supports_native_projectile_hit_fx("holy", false) == true and _world.supports_native_projectile_hit_fx("dark", true) == true

func _delivery_snapshot(entry: Dictionary) -> Dictionary:
	var shot: Node2D = entry["shot"].get_ref()
	if is_instance_valid(shot): entry["last_snapshot"] = shot.get_bridge_snapshot()
	var result: Dictionary = entry["last_snapshot"].duplicate(true)
	result.merge({"source_kind": entry["source_kind"], "source_actor_etype": entry["etype"], "source_append_order": entry["append_order"], "initial_source_global_position": [entry["origin"].x, entry["origin"].y], "actual_release_global_frame": entry["frame"]}, true)
	return result

func _forward_kernel_event(kind: String, data: Dictionary) -> void:
	telemetry_event.emit(kind, data)

func _reject(reason: String) -> bool:
	_error = reason
	_metrics.rejected += 1
	telemetry_event.emit("native_source_projectile_rejected", {"reason": reason})
	return false

func get_last_error() -> String:
	return _error

func get_snapshot() -> Dictionary:
	var deliveries: Array = []
	for entry in _deliveries: deliveries.append(_delivery_snapshot(entry))
	return {"configured": _configured, "error": _error, "metrics": _metrics.duplicate(true), "required_resources_preflighted": _required_resources.size(), "pending_births": _pending.size(), "deliveries": deliveries, "private_clock": false, "old_kernel_parity_reverified": false, "full_q_e_parry_ported": false, "gear_pipeline_ported": false}

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

class DeliveryState extends RefCounted:
	var metadata: Dictionary = {}
	var birth_prephase: Dictionary = {}
	var birth_explicit_phase_calls = 0
	var explicit_native_ticks = 0.0
	var auto_physics_calls = 0
	var last_snapshot: Dictionary = {}

	func attach(shot: Node2D, value: Dictionary) -> void:
		metadata = value.duplicate(true)
		capture(shot)

	func begin(shot: Node2D, ticks: float) -> bool:
		if birth_explicit_phase_calls != 0 or not is_finite(ticks) or ticks <= 0.0:
			return false
		birth_prephase = {"native_frame": shot.get("native_frame"), "life_ticks": shot.get("life_ticks"), "global_position": [shot.global_position.x, shot.global_position.y], "local_position": [shot.position.x, shot.position.y], "birth_explicit_phase_calls": 0, "auto_physics_calls": auto_physics_calls}
		birth_explicit_phase_calls += 1
		explicit_native_ticks += ticks
		return true

	func capture(shot: Node2D) -> void:
		var reference: Variant = metadata.get("world")
		var world: Node2D = reference.get_ref() if reference is WeakRef else null
		var frame = world.get_native_frame() if is_instance_valid(world) else null
		last_snapshot = {"initial_source_global_position": metadata.get("initial_source_global_position", Vector2.ZERO), "constructor_birth_frame": metadata.get("constructor_birth_frame"), "actual_global_frame_readonly": frame, "native_frame": shot.get("native_frame"), "life_ticks": shot.get("life_ticks"), "position_global": [shot.global_position.x, shot.global_position.y], "position_local": [shot.position.x, shot.position.y], "heading": shot.get("heading"), "speed": shot.get("speed"), "damage": shot.get("damage"), "birth_prephase": birth_prephase.duplicate(true), "birth_explicit_phase_calls": birth_explicit_phase_calls, "explicit_native_ticks": explicit_native_ticks, "auto_physics_calls": auto_physics_calls, "source_kind": metadata.get("source_kind"), "normalized_profile": metadata.get("normalized_profile", {}).duplicate(true), "raw_packet": metadata.get("raw_packet", {}).duplicate(true), "observer_position_writes": 0, "owner_independent": true}

	func snapshot(shot: Node2D) -> Dictionary:
		capture(shot)
		return last_snapshot.duplicate(true)

class Type7TeleportBirthQueue extends "res://scripts/native_type7_teleport.gd":
	var source_birth_sink: WeakRef
	var source_birth_error = ""

	func _deliver_shot(global_origin: Vector2, heading: Vector2, ticks: float, native_frame: float) -> void:
		var sink: Node = source_birth_sink.get_ref() if source_birth_sink != null else null
		if not is_instance_valid(sink):
			source_birth_error = "required_common_birth_sink_lost"
			telemetry_event.emit("type7_source_birth_rejected", {"reason": source_birth_error})
			return
		var shot = DeliveredPhysicalShot.new()
		shot.configure(_world.to_local(global_origin), heading, _profile["queued_projectile"], _target, _world, native_frame - ticks)
		# Keep original frozen TP producer metadata, not observer physics writes.
		shot.birth_position = global_origin
		shot.bridge_global_origin = global_origin
		shot.release_native_frame = native_frame
		shot.set_physics_process(false)
		shot.telemetry_event.connect(_forward_event)
		_world.add_child(shot)
		shot.set_physics_process(false)
		if not sink._queue_teleport_birth(shot, global_origin, native_frame, self):
			source_birth_error = "required_common_birth_queue_rejected"
			shot.queue_free()
			telemetry_event.emit("type7_source_birth_rejected", {"reason": source_birth_error})
			return
		_deliveries.append(shot)

	func notify_source_birth_delivered(snapshot: Dictionary) -> void:
		telemetry_event.emit("type7_shot_delivered", snapshot.duplicate(true))

class PhysicalBirth extends "res://scripts/enemy_projectile_physical.gd":
	var delivery_state = DeliveryState.new()

	func _ready() -> void:
		super._ready()
		set_physics_process(false)

	func attach_delivery(value: Dictionary) -> void:
		delivery_state.attach(self, value)

	func consume_birth_phase(ticks: float) -> bool:
		if not delivery_state.begin(self, ticks): return false
		super._physics_process(ticks / 60.0)
		delivery_state.capture(self)
		return true

	func _physics_process(delta: float) -> void:
		delivery_state.auto_physics_calls += 1
		super._physics_process(delta)
		delivery_state.capture(self)

	func get_bridge_snapshot() -> Dictionary:
		return delivery_state.snapshot(self)

class FireBirth extends "res://scripts/enemy_projectile_fire.gd":
	var delivery_state = DeliveryState.new()

	func _ready() -> void:
		super._ready()
		set_physics_process(false)

	func attach_delivery(value: Dictionary) -> void:
		delivery_state.attach(self, value)

	func consume_birth_phase(ticks: float) -> bool:
		if not delivery_state.begin(self, ticks): return false
		super._physics_process(ticks / 60.0)
		delivery_state.capture(self)
		return true

	func _physics_process(delta: float) -> void:
		delivery_state.auto_physics_calls += 1
		super._physics_process(delta)
		delivery_state.capture(self)

	func get_bridge_snapshot() -> Dictionary:
		return delivery_state.snapshot(self)

class IceBirth extends "res://scripts/enemy_projectile_ice.gd":
	var delivery_state = DeliveryState.new()

	func _ready() -> void:
		super._ready()
		set_physics_process(false)

	func attach_delivery(value: Dictionary) -> void:
		delivery_state.attach(self, value)

	func consume_birth_phase(ticks: float) -> bool:
		if not delivery_state.begin(self, ticks): return false
		super._physics_process(ticks / 60.0)
		delivery_state.capture(self)
		return true

	func _physics_process(delta: float) -> void:
		delivery_state.auto_physics_calls += 1
		super._physics_process(delta)
		delivery_state.capture(self)

	func get_bridge_snapshot() -> Dictionary:
		return delivery_state.snapshot(self)

class DarkBirth extends "res://scripts/enemy_projectile_dark.gd":
	var delivery_state = DeliveryState.new()

	func _ready() -> void:
		super._ready()
		set_physics_process(false)

	func attach_delivery(value: Dictionary) -> void:
		delivery_state.attach(self, value)

	func consume_birth_phase(ticks: float) -> bool:
		if not delivery_state.begin(self, ticks): return false
		super._physics_process(ticks / 60.0)
		delivery_state.capture(self)
		return true

	func _physics_process(delta: float) -> void:
		delivery_state.auto_physics_calls += 1
		super._physics_process(delta)
		delivery_state.capture(self)

	func get_bridge_snapshot() -> Dictionary:
		return delivery_state.snapshot(self)

class LightningBirth extends "res://scripts/enemy_projectile_lightning.gd":
	var delivery_state = DeliveryState.new()

	func _ready() -> void:
		super._ready()
		set_physics_process(false)

	func attach_delivery(value: Dictionary) -> void:
		delivery_state.attach(self, value)

	func consume_birth_phase(ticks: float) -> bool:
		if not delivery_state.begin(self, ticks): return false
		super._physics_process(ticks / 60.0)
		delivery_state.capture(self)
		return true

	func _physics_process(delta: float) -> void:
		delivery_state.auto_physics_calls += 1
		super._physics_process(delta)
		delivery_state.capture(self)

	func get_bridge_snapshot() -> Dictionary:
		return delivery_state.snapshot(self)

class HolyBirth extends "res://scripts/enemy_projectile_holy.gd":
	var delivery_state = DeliveryState.new()

	func _ready() -> void:
		super._ready()
		set_physics_process(false)

	func attach_delivery(value: Dictionary) -> void:
		delivery_state.attach(self, value)

	func consume_birth_phase(ticks: float) -> bool:
		if not delivery_state.begin(self, ticks): return false
		super._physics_process(ticks / 60.0)
		delivery_state.capture(self)
		return true

	func _physics_process(delta: float) -> void:
		delivery_state.auto_physics_calls += 1
		super._physics_process(delta)
		delivery_state.capture(self)

	func get_bridge_snapshot() -> Dictionary:
		return delivery_state.snapshot(self)
