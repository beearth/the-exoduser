class_name ExoduserEnemyFactory
extends RefCounted

# Each consumer has a separate source/skin/element admission gate. Unported
# records remain data; they never inherit another consumer's art or AI.
const ENEMY_SCRIPT = preload("res://scripts/enemy.gd")
const FLESH_SCRIPT = preload("res://scripts/enemy_melee_flesh_crawler.gd")
const FLESH_CONFIG_FILE = "res://data/etype0_physical_flesh_crawler.json"
const FLESH_PROFILE = "native_ch1_etype0_physical_flesh_crawler_v1"
const FLESH_CONFIG_SCHEMA = "exoduser.godot.etype0-physical-flesh-crawler.v1"
const SCHEMA = "exoduser.godot.ch1-native-encounters.v1"
const KNOWN_ETYPES = [0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 47]
const MEDIUM_PROFILE = "native_medium_dark_v1"
const MEDIUM_TEXTURE = "res://assets/enemy/ch1_1_eye_slime_8dir_4frame_clean.png"
const RECORD_KEYS = ["id", "order", "spawn_group", "name", "stage", "level", "difficulty", "etype", "element", "element_id", "spawn_position", "requested_spawn_position", "hp", "attack", "radius", "speed_pixels_per_tick", "native_tick_rate", "poise", "max_poise", "poise_regen_ticks", "poise_regen_fraction", "initial_idle_ticks", "initial_projectile_ticks", "projectile_cooldown_ticks", "initial_facing", "elite", "mods", "aura", "initial_spawn_fade_ticks", "initial_timers", "aggro_range", "pursuit_stop_distance", "idle_movement_multiplier", "contact_extra_radius", "contact_damage_multiplier", "contact_cooldown_min_ticks", "contact_cooldown_random_ticks", "hit_stun_ticks", "projectile_charge_ticks", "projectile_range", "windup_ticks", "attack_ticks", "recovery_ticks", "animation", "factory_random_seed", "native_arguments", "native_call_site", "native_factory", "native_final", "rng_begin", "rng_end", "support", "runtime"]
const NUMBER_KEYS = ["stage", "level", "etype", "element_id", "hp", "attack", "radius", "speed_pixels_per_tick", "native_tick_rate", "poise", "max_poise", "poise_regen_ticks", "poise_regen_fraction", "initial_idle_ticks", "initial_projectile_ticks", "projectile_cooldown_ticks", "initial_facing", "elite", "initial_spawn_fade_ticks", "aggro_range", "pursuit_stop_distance", "idle_movement_multiplier", "contact_extra_radius", "contact_damage_multiplier", "contact_cooldown_min_ticks", "contact_cooldown_random_ticks", "hit_stun_ticks", "projectile_charge_ticks", "projectile_range", "attack_ticks", "recovery_ticks", "factory_random_seed", "rng_begin", "rng_end"]
const FINAL_FIELDS = {"etype": "etype", "element_id": "el", "hp": "hp", "attack": "atk", "radius": "r", "speed_pixels_per_tick": "speed", "poise": "poise", "max_poise": "maxPoise", "initial_idle_ticks": "st2", "initial_projectile_ticks": "projT", "projectile_cooldown_ticks": "projCd", "initial_facing": "facing", "elite": "elite", "mods": "mods", "aura": "aura", "initial_spawn_fade_ticks": "_spawnT"}

var _flesh_config: Variant = JSON.parse_string(FileAccess.get_file_as_string(FLESH_CONFIG_FILE))

func validate_source(source: Variant) -> Dictionary:
	var errors: Array = []
	if not _has_keys(source, ["schema", "stage", "time_ticks", "initial_count", "record_count", "source", "scope", "records"], "source", errors):
		return {"valid": false, "errors": errors}
	if source["schema"] != SCHEMA:
		errors.append("source.schema: unsupported schema")
	if not _finite_json(source):
		errors.append("source: all numeric leaves must be finite JSON values")
	if not _has_keys(source["source"], ["known_etypes", "source_stable", "game_sha256_before", "game_sha256_after"], "source.source", errors) or not source["scope"] is Dictionary or not source["records"] is Array:
		errors.append("source: metadata/scope/records shape is invalid")
		return {"valid": false, "errors": errors}
	var registry: Variant = source["source"]["known_etypes"]
	if not registry is Array or not _json_equal(registry, KNOWN_ETYPES):
		errors.append("source.source.known_etypes: must match the canonical active mkEn registry")
	if source["source"]["source_stable"] != true or not source["source"]["game_sha256_before"] is String or source["source"]["game_sha256_before"].is_empty() or source["source"]["game_sha256_before"] != source["source"]["game_sha256_after"]:
		errors.append("source.source: stable before/after source receipt required")
	var records: Array = source["records"]
	for key in ["initial_count", "record_count"]:
		if not _integer(source[key]) or source[key] != records.size():
			errors.append("source.%s: must equal records.size()" % key)
	if not _integer(source["stage"]) or not _integer(source["time_ticks"]) or source["stage"] != 0 or source["time_ticks"] != 0:
		errors.append("source: this consumer requires CH1 stage0 at native time0")
	var ids: Dictionary = {}
	for index in range(records.size()):
		_validate_record(records[index], index, ids, errors)
	return {"valid": errors.is_empty(), "errors": errors}

func _validate_record(value: Variant, index: int, ids: Dictionary, errors: Array) -> void:
	var label = "records[%d]" % index
	if not _has_keys(value, RECORD_KEYS, label, errors):
		return
	var record: Dictionary = value
	for key in ["id", "spawn_group", "name", "difficulty", "element", "native_call_site"]:
		if not record[key] is String or record[key].is_empty():
			errors.append("%s.%s: nonempty string required" % [label, key])
	if record["id"] is String:
		if ids.has(record["id"]):
			errors.append("%s.id: duplicate id" % label)
		ids[record["id"]] = true
	if not _integer(record["order"]) or record["order"] != index:
		errors.append("%s.order: must match its array index" % label)
	for key in NUMBER_KEYS:
		if not _number(record[key]):
			errors.append("%s.%s: finite number required" % [label, key])
	for key in ["stage", "level", "element_id", "hp", "attack", "native_tick_rate", "elite", "factory_random_seed", "rng_begin", "rng_end"]:
		if not _integer(record[key]):
			errors.append("%s.%s: integral value required" % [label, key])
	if not _known_etype(record["etype"]):
		errors.append("%s.etype: unregistered/nonintegral type" % label)
	for key in ["spawn_position", "requested_spawn_position"]:
		if not _vector_pair(record[key]):
			errors.append("%s.%s: finite pair required" % [label, key])
	for key in ["native_factory", "native_final", "initial_timers", "animation", "support"]:
		if not record[key] is Dictionary:
			errors.append("%s.%s: Dictionary required" % [label, key])
	if not record["mods"] is Array or not record["native_arguments"] is Array or record["native_arguments"].size() != 7:
		errors.append("%s: mods/native_arguments shape is invalid" % label)
	if not (record["windup_ticks"] == null or _number(record["windup_ticks"])):
		errors.append("%s.windup_ticks: number or null required" % label)
	if not record["native_factory"] is Dictionary or not record["native_final"] is Dictionary or not record["support"] is Dictionary or not record["animation"] is Dictionary or not record["initial_timers"] is Dictionary:
		return
	var native: Dictionary = record["native_final"]
	for key in ["x", "y", "mhp", "alive", "s", "stunned", "kb"]:
		if not native.has(key) or not record["native_factory"].has(key):
			errors.append("%s: native clones require %s" % [label, key])
	for key in FINAL_FIELDS:
		var native_key: String = FINAL_FIELDS[key]
		if not native.has(native_key) or not record["native_factory"].has(native_key) or not _json_equal(record[key], native.get(native_key)):
			errors.append("%s.%s: must preserve native_final.%s" % [label, key, native_key])
	if _vector_pair(record["spawn_position"]) and not _json_equal(record["spawn_position"], [native.get("x"), native.get("y")]):
		errors.append("%s.spawn_position: must preserve native_final x/y" % label)
	for key in record["initial_timers"]:
		if not _number(record["initial_timers"][key]) or record["initial_timers"][key] != native.get(key):
			errors.append("%s.initial_timers.%s: must preserve native_final" % [label, key])
	_has_keys(record["initial_timers"], ["poiseR", "st2", "projCd", "projT", "chargeT", "_spawnT"], label + ".initial_timers", errors)
	if not _has_keys(record["support"], ["runtime_supported", "ai_profile", "reason", "native_type_known", "full_native_enemy_system"], label + ".support", errors):
		return
	if not record["support"]["runtime_supported"] is bool or record["support"]["native_type_known"] != true or not record["support"]["ai_profile"] is String or not record["support"]["reason"] is String:
		errors.append("%s.support: invalid support declaration" % label)
	var reason = unsupported_reason(record)
	if reason.is_empty():
		if _is_flesh_target(record):
			# The old export declares this unported. Preserve that snapshot;
			# admission belongs to this separate, source-derived consumer config.
			if record["runtime"] != null or record["support"]["runtime_supported"] != false:
				errors.append("%s: flesh source snapshot must remain unported/runtime=null" % label)
			_validate_flesh_config(record, label, errors)
		else:
			_validate_runtime(record, label, errors)
	elif record["runtime"] != null or record["support"]["runtime_supported"] != false:
		errors.append("%s: unported profile must have runtime=null and runtime_supported=false" % label)

func unsupported_reason(record: Dictionary) -> String:
	if _is_flesh_target(record):
		return ""
	if record.get("etype") != 4:
		return "native_type_ai_not_ported"
	if record.get("element") != "dark" or record.get("element_id") != 3:
		return "native_element_not_ported"
	var native: Dictionary = record.get("native_final", {})
	var animation: Dictionary = record.get("animation", {})
	if native.get("_ch1StartMedium") != true or animation.get("kind") != "native-medium-sheet" or animation.get("texture") != MEDIUM_TEXTURE:
		return "native_skin_not_ported"
	if record.get("elite") != 0 or not _json_equal(record.get("mods"), []) or record.get("aura") != null:
		return "native_elite_modifier_not_ported"
	if record["support"].get("ai_profile") != MEDIUM_PROFILE:
		return "native_ai_profile_not_ported"
	return ""

func _is_flesh_target(record: Dictionary) -> bool:
	var animation: Variant = record.get("animation")
	return record.get("id") == "ch1_initial_015" and record.get("order") == 14 and record.get("etype") == 0 and record.get("element") == "physical" and record.get("element_id") == 0 and animation is Dictionary and animation.get("skin") == "flesh_crawler" and animation.get("kind") == "native-ch1-eight-direction-atlas" and record.get("elite") == 0 and _json_equal(record.get("mods"), []) and record.get("aura") == null and _json_equal(record.get("spawn_position"), [3888.7242834487565, 244.62260903114446])

func _validate_flesh_config(record: Dictionary, label: String, errors: Array) -> void:
	var config_label = label + ".consumer_config"
	if not _has_keys(_flesh_config, ["schema", "target", "runtime", "native_source_contract", "assets", "scope"], config_label, errors):
		return
	if _flesh_config["schema"] != FLESH_CONFIG_SCHEMA or not _finite_json(_flesh_config):
		errors.append(config_label + ": schema/finite JSON contract required")
	if not _has_keys(_flesh_config["target"], ["id", "order", "etype", "element", "element_id", "skin", "elite", "mods", "aura", "spawn_position"], config_label + ".target", errors):
		return
	for key in _flesh_config["target"]:
		var expected: Variant = record["animation"].get("skin") if key == "skin" else record.get(key)
		if not _json_equal(_flesh_config["target"][key], expected):
			errors.append(config_label + ".target." + key + ": exact source target required")
	var required = ["id", "order", "name", "etype", "element", "element_id", "stage", "level", "difficulty", "spawn_position", "requested_spawn_position", "hp", "attack", "radius", "speed_pixels_per_tick", "native_tick_rate", "poise", "max_poise", "poise_regen_ticks", "poise_regen_fraction", "initial_idle_ticks", "initial_projectile_ticks", "projectile_cooldown_ticks", "initial_facing", "elite", "mods", "aura", "initial_spawn_fade_ticks", "initial_timers", "aggro_range", "pursuit_stop_distance", "idle_movement_multiplier", "contact_extra_radius", "contact_damage_multiplier", "contact_cooldown_min_ticks", "contact_cooldown_random_ticks", "hit_stun_ticks", "projectile_charge_ticks", "projectile_range", "windup_ticks", "attack_ticks", "recovery_ticks", "factory_random_seed", "facing", "ai_profile", "animation", "projectile", "eShield", "eShieldMax", "eRes", "native_flags", "native_final"]
	if not _has_keys(_flesh_config["runtime"], required, config_label + ".runtime", errors):
		return
	var runtime: Dictionary = _flesh_config["runtime"]
	var numeric_shape_valid = true
	for key in NUMBER_KEYS:
		if runtime.has(key) and not _number(runtime[key]):
			errors.append(config_label + ".runtime." + key + ": finite number required")
			numeric_shape_valid = false
	if not _number(record["attack"]) or not numeric_shape_valid:
		return
	for key in required:
		if record.has(key) and key not in ["animation", "native_final"] and not _json_equal(runtime[key], record[key]):
			errors.append(config_label + ".runtime." + key + ": source value changed")
	if runtime["ai_profile"] != FLESH_PROFILE or not _json_equal(runtime["facing"], record["initial_facing"]):
		errors.append(config_label + ": unsupported consumer/facing")
	for group in ["native_final", "native_flags"]:
		if not runtime[group] is Dictionary:
			errors.append(config_label + "." + group + ": Dictionary required")
			continue
		for key in runtime[group]:
			if not _json_equal(runtime[group][key], record["native_final"].get(key)):
				errors.append(config_label + "." + group + "." + key + ": native_final value changed")
	for key in ["eShield", "eShieldMax", "eRes"]:
		if not _json_equal(runtime[key], record["native_final"].get(key)):
			errors.append(config_label + "." + key + ": native shield/resistance changed")
	if not _has_keys(runtime["native_final"], ["s", "alive", "stunned", "kb"], config_label + ".native_final", errors):
		return
	if not _has_keys(runtime["native_final"]["kb"], ["x", "y"], config_label + ".native_final.kb", errors):
		return
	if not _has_keys(runtime["animation"], ["base_rect", "walk_frame_rects", "direction_angle_sectors", "base_and_walk_overlay", "texture_filter"], config_label + ".animation", errors):
		return
	var animation: Dictionary = runtime["animation"]
	for key in record["animation"]:
		if key != "resources_copied" and not _json_equal(animation.get(key), record["animation"][key]):
			errors.append(config_label + ".animation." + key + ": source atlas contract changed")
	var fixed_animation = {"resources_copied": true, "base_rect": [1536, 0, 256, 256], "walk_frame_rects": [[6144, 0, 256, 256], [6400, 0, 256, 256], [6656, 0, 256, 256], [6912, 0, 256, 256]], "direction_angle_sectors": ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"], "base_and_walk_overlay": true, "texture_filter": "nearest"}
	for key in fixed_animation:
		if not _json_equal(animation.get(key), fixed_animation[key]):
			errors.append(config_label + ".animation." + key + ": unsupported atlas layout")
	if not _has_keys(runtime["projectile"], ["animation"], config_label + ".projectile", errors):
		return
	var fixed_projectile = {"element": "physical", "element_id": 0, "parry_class": "physical", "native_dtype": "parry", "native_birth_position": "actor-center", "base_damage": int(record["attack"] * 0.8), "contact_damage": int(record["attack"] * 0.8), "size": 3.0, "radius": 5.2, "contact_margin": 13, "life_ticks": 120, "life_decay_per_tick": 0.667, "speed_pixels_per_second": [300, 300], "homing_radians_per_tick": 0.00109083, "homing_until_life": 30, "redBean": true, "homing": true, "commit": true, "drop_exempt": true, "player_knockback_pixels_per_tick": 2}
	for key in fixed_projectile:
		if not _json_equal(runtime["projectile"].get(key), fixed_projectile[key]):
			errors.append(config_label + ".projectile." + key + ": unsupported physical projectile")
	var projectile_animation = {"texture": "res://assets/enemy/proj_phys_mouth.png", "cell_size": [768, 384], "columns": 8, "rows": 3, "row_frame_counts": [8, 6, 6], "flight_row": 0, "flight_frames": 8, "native_pivot": [0.5, 0.5], "height": 67.914, "width": 135.828}
	if not runtime["projectile"]["animation"] is Dictionary:
		errors.append(config_label + ".projectile.animation: Dictionary required")
	else:
		for key in projectile_animation:
			if not _json_equal(runtime["projectile"]["animation"].get(key), projectile_animation[key]):
				errors.append(config_label + ".projectile.animation." + key + ": unsupported mouth layout")
	if not _flesh_config["assets"] is Array or _flesh_config["assets"].size() != 17:
		errors.append(config_label + ".assets: seventeen original resources required")
	else:
		for asset in _flesh_config["assets"]:
			if not asset is Dictionary or not asset.get("resource") is String or not ResourceLoader.exists(asset["resource"]):
				errors.append(config_label + ".assets: source resource missing")
	for key in ["hp", "radius", "poise_regen_ticks", "contact_cooldown_random_ticks"]:
		if not _number(runtime[key]) or float(runtime[key]) <= 0.0:
			errors.append(config_label + "." + key + ": positive value required")

func _validate_runtime(record: Dictionary, label: String, errors: Array) -> void:
	if not _has_keys(record["runtime"], ["facing", "native_flags", "projectile"], label + ".runtime", errors):
		return
	var runtime: Dictionary = record["runtime"]
	for key in RECORD_KEYS:
		if key != "runtime" and (not runtime.has(key) or not _json_equal(runtime[key], record[key])):
			errors.append("%s.runtime.%s: must preserve its source record" % [label, key])
	if runtime["facing"] != record["initial_facing"] or record["support"]["runtime_supported"] != true:
		errors.append("%s.runtime: invalid facing/support" % label)
	if not runtime["native_flags"] is Dictionary or not runtime["projectile"] is Dictionary:
		errors.append("%s.runtime: flags/projectile Dictionary required" % label)
	else:
		_has_keys(runtime["native_flags"], ["_ch1StartMedium", "_firstShot", "_mob8dir", "_mobCh", "_mob8Col", "_mob8Row"], label + ".runtime.native_flags", errors)
		for key in runtime["native_flags"]:
			if not _json_equal(runtime["native_flags"][key], record["native_final"].get(key)):
				errors.append("%s.runtime.native_flags.%s: must preserve native_final" % [label, key])
		var fixed_projectile = {"element": "dark", "parry_class": "magic", "native_birth_position": "actor-center", "size": 3.2, "contact_margin": 13.6, "life_ticks": 120, "life_decay_per_tick": 0.667, "speed_pixels_per_second": [500, 600], "homing_radians_per_tick": 0.00655, "homing_until_life": 30}
		for key in fixed_projectile:
			if not _json_equal(runtime["projectile"].get(key), fixed_projectile[key]):
				errors.append("%s.runtime.projectile.%s: unsupported dark projectile profile" % [label, key])
		if _number(record["attack"]) and (runtime["projectile"].get("base_damage") != record["attack"] * 2 or runtime["projectile"].get("contact_damage") != int(record["attack"] * 2 * 1.3)):
			errors.append("%s.runtime.projectile: damage must derive from native attack" % label)
	var animation: Dictionary = record["animation"]
	var fixed_animation = {"columns": 4, "rows": 8, "cell_size": [256, 256], "native_direction_rows": [2, 3, 4, 5, 6, 7, 0, 1], "idle_column": 0, "attack_column": 1, "walk_columns": [2, 3], "walk_frame_ms": 120, "native_pivot": [0.5, 0.5]}
	for key in fixed_animation:
		if not _json_equal(animation.get(key), fixed_animation[key]):
			errors.append("%s.animation.%s: unsupported medium layout" % [label, key])
	if not _number(animation.get("draw_height")) or float(animation.get("draw_height", 0)) <= 0 or not ResourceLoader.exists(MEDIUM_TEXTURE):
		errors.append("%s.animation: positive draw_height and existing medium texture required" % label)
	for key in ["hp", "radius", "poise_regen_ticks", "contact_cooldown_random_ticks"]:
		if not _number(record[key]) or float(record[key]) <= 0:
			errors.append("%s.%s: positive value required" % [label, key])
	if record["hp"] != record["native_final"].get("mhp") or record["max_poise"] != record["hp"] or record["native_tick_rate"] != 60 or record["stage"] != 0 or record["level"] != 1 or record["difficulty"] != "NORMAL":
		errors.append("%s: this consumer requires the initial raw NORMAL/Lv1/60Hz medium profile" % label)
	if record["native_final"].get("s") != "idle" or record["native_final"].get("alive") != true:
		errors.append("%s: supported initial actor must be alive/idle" % label)
	if not _number(record["native_final"].get("stunned")) or not _has_keys(record["native_final"].get("kb"), ["x", "y"], label + ".native_final.kb", errors):
		errors.append("%s: finite native stun/knockback required" % label)
	elif not _number(record["native_final"]["kb"]["x"]) or not _number(record["native_final"]["kb"]["y"]):
		errors.append("%s.native_final.kb: finite x/y required" % label)

func consume_atomic(source: Variant, owner_world: Node2D) -> Dictionary:
	var validation = validate_source(source)
	if not validation["valid"]:
		return validation
	var report = {"valid": true, "errors": [], "installed": false, "schema": SCHEMA, "source_count": source["records"].size(), "supported_count": 0, "unsupported_count": 0, "records": [], "source": source["source"].duplicate(true), "instances": []}
	for record in source["records"]:
		var reason = unsupported_reason(record)
		var supported = reason.is_empty()
		report["records"].append({"order": record["order"], "id": record["id"], "etype": record["etype"], "status": "supported" if supported else "unsupported", "reason": "" if supported else reason, "record": record.duplicate(true)})
		if supported:
			var flesh = _is_flesh_target(record)
			var enemy: CharacterBody2D = FLESH_SCRIPT.new() if flesh else ENEMY_SCRIPT.new()
			var runtime: Dictionary = _flesh_config["runtime"] if flesh else record["runtime"]
			enemy.configure(runtime.duplicate(true), owner_world)
			if flesh:
				report["records"][-1]["consumer_profile"] = FLESH_PROFILE
				report["records"][-1]["source_support"] = record["support"].duplicate(true)
				report["records"][-1]["consumer_config"] = FLESH_CONFIG_FILE
			report["instances"].append(enemy)
			report["supported_count"] += 1
		else:
			report["unsupported_count"] += 1
	return report

func _has_keys(value: Variant, keys: Array, label: String, errors: Array) -> bool:
	if not value is Dictionary:
		errors.append(label + ": Dictionary required")
		return false
	var complete = true
	for key in keys:
		if not value.has(key):
			errors.append("%s.%s: required field missing" % [label, key])
			complete = false
	return complete

func _number(value: Variant) -> bool:
	return (typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT) and is_finite(float(value))

func _integer(value: Variant) -> bool:
	return _number(value) and float(value) == floorf(float(value))

func _known_etype(value: Variant) -> bool:
	# JSON numbers are floats. Check the complete domain before converting, so
	# fractions, NaN and oversized values cannot alias a registered integer.
	return _integer(value) and float(value) >= 0.0 and float(value) <= 47.0 and KNOWN_ETYPES.has(int(value))

func _json_equal(left: Variant, right: Variant) -> bool:
	# Compare without normalizing or mutating the canonical record. Godot's
	# container equality distinguishes JSON floats from authored integer leaves.
	if typeof(left) == TYPE_INT or typeof(left) == TYPE_FLOAT or typeof(right) == TYPE_INT or typeof(right) == TYPE_FLOAT:
		return _number(left) and _number(right) and float(left) == float(right)
	if typeof(left) != typeof(right):
		return false
	if left is Array:
		if left.size() != right.size():
			return false
		for index in range(left.size()):
			if not _json_equal(left[index], right[index]):
				return false
		return true
	if left is Dictionary:
		if left.size() != right.size():
			return false
		for key in left:
			if not right.has(key) or not _json_equal(left[key], right[key]):
				return false
		return true
	return left == right

func _vector_pair(value: Variant) -> bool:
	return value is Array and value.size() == 2 and _number(value[0]) and _number(value[1])

func _finite_json(value: Variant) -> bool:
	if typeof(value) == TYPE_INT or typeof(value) == TYPE_FLOAT:
		return _number(value)
	if value is Array:
		for item in value:
			if not _finite_json(item):
				return false
	elif value is Dictionary:
		for key in value:
			if not key is String or not _finite_json(value[key]):
				return false
	elif value != null and not value is String and not value is bool:
		return false
	return true
