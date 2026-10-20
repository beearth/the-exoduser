class_name ExoduserEnemyFactory
extends RefCounted

# Each consumer has a separate source/skin/element admission gate. Unported
# records remain data; they never inherit another consumer's art or AI.
const ENEMY_SCRIPT = preload("res://scripts/enemy.gd")
const FLESH_SCRIPT = preload("res://scripts/enemy_melee_flesh_crawler.gd")
const SPINE_SCRIPT = preload("res://scripts/enemy_tank_physical_spine_beast.gd")
const ICE_SOUL_SCRIPT = preload("res://scripts/enemy_tank_ice_soul_flame.gd")
const HIVE_LIGHTNING_SCRIPT = preload("res://scripts/enemy_archer_lightning_hive_bloater.gd")
const ICE_WARRIOR_SCRIPT = preload("res://scripts/enemy_melee_ch1_ice_warrior.gd")
const ICE_WARRIOR_CONFIG_FILE = "res://data/etype20_ch1_ice_warrior.json"
const HIVE_LIGHTNING_CONFIG_FILE = "res://data/etype1_lightning_hive_bloater.json"
const HIVE_LIGHTNING_PROFILE = "native_ch1_etype1_lightning_hive_bloater_v1"
const HIVE_LIGHTNING_CONFIG_SCHEMA = "exoduser.godot.etype1-lightning-hive-bloater.v1"
const ICE_SOUL_CONFIG_FILE = "res://data/etype4_ice_soul_flame.json"
const ICE_SOUL_PROFILE = "native_ch1_etype4_ice_soul_flame_v1"
const ICE_SOUL_CONFIG_SCHEMA = "exoduser.godot.etype4-ice-soul-flame.v1"
const SPINE_CONFIG_FILE = "res://data/etype4_physical_spine_beast.json"
const SPINE_PROFILE = "native_ch1_etype4_physical_spine_beast_v1"
const SPINE_CONFIG_SCHEMA = "exoduser.godot.etype4-physical-spine-beast.v1"
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
var _spine_config: Variant = JSON.parse_string(FileAccess.get_file_as_string(SPINE_CONFIG_FILE))
var _ice_soul_config: Variant = JSON.parse_string(FileAccess.get_file_as_string(ICE_SOUL_CONFIG_FILE))
var _hive_lightning_config: Variant = JSON.parse_string(FileAccess.get_file_as_string(HIVE_LIGHTNING_CONFIG_FILE))
var _ice_warrior_config: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(ICE_WARRIOR_CONFIG_FILE))
var _ice_warrior_source: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))

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
		if _is_ice_warrior_target(record):
			if record["runtime"] != null or record["support"]["runtime_supported"] != false:
				errors.append(label + ": ice warrior source snapshot must remain unsupported/runtime=null")
			for group in ["base_textures", "walk_textures"]:
				for path in record["animation"][group].values():
					if not ResourceLoader.exists(path):
						errors.append(label + ": required original ice warrior texture missing: " + path)
		elif _is_flesh_target(record):
			# The old export declares this unported. Preserve that snapshot;
			# admission belongs to this separate, source-derived consumer config.
			if record["runtime"] != null or record["support"]["runtime_supported"] != false:
				errors.append("%s: flesh source snapshot must remain unported/runtime=null" % label)
			_validate_flesh_config(record, label, errors)
		elif _is_spine_target(record):
			if record["runtime"] != null or record["support"]["runtime_supported"] != false:
				errors.append("%s: spine source snapshot must remain unported/runtime=null" % label)
			_validate_spine_config(record, label, errors)
		elif _is_ice_soul_target(record):
			if record["runtime"] != null or record["support"]["runtime_supported"] != false:
				errors.append("%s: ice soul source snapshot must remain unported/runtime=null" % label)
			_validate_ice_soul_config(record, label, errors)
		elif _is_hive_lightning_target(record):
			if record["runtime"] != null or record["support"]["runtime_supported"] != false:
				errors.append("%s: hive lightning source snapshot must remain unported/runtime=null" % label)
			_validate_hive_lightning_config(record, label, errors)
		else:
			_validate_runtime(record, label, errors)
	elif record["runtime"] != null or record["support"]["runtime_supported"] != false:
		errors.append("%s: unported profile must have runtime=null and runtime_supported=false" % label)

func unsupported_reason(record: Dictionary) -> String:
	if _is_ice_warrior_target(record) or _is_flesh_target(record) or _is_spine_target(record) or _is_ice_soul_target(record) or _is_hive_lightning_target(record):
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

func _is_ice_warrior_target(record: Dictionary) -> bool:
	if _ice_warrior_config.get("schema") != "exoduser.godot.etype20-ch1-ice-warrior.v1" or not _json_equal(_ice_warrior_config.get("orders"), [4, 10, 12]):
		return false
	if _ice_warrior_config.get("source_sha256") != "91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa" or FileAccess.get_sha256("res://data/encounters.json") != _ice_warrior_config["source_sha256"]:
		return false
	var order: Variant = record.get("order")
	if not _integer(order) or not [4, 10, 12].has(int(order)):
		return false
	return _json_equal(record, _ice_warrior_source["records"][int(order)])

func _is_flesh_target(record: Dictionary) -> bool:
	var animation: Variant = record.get("animation")
	return record.get("id") == "ch1_initial_015" and record.get("order") == 14 and record.get("etype") == 0 and record.get("element") == "physical" and record.get("element_id") == 0 and animation is Dictionary and animation.get("skin") == "flesh_crawler" and animation.get("kind") == "native-ch1-eight-direction-atlas" and record.get("elite") == 0 and _json_equal(record.get("mods"), []) and record.get("aura") == null and _json_equal(record.get("spawn_position"), [3888.7242834487565, 244.62260903114446])

func _is_spine_target(record: Dictionary) -> bool:
	var animation: Variant = record.get("animation")
	return record.get("id") == "ch1_initial_014" and record.get("order") == 13 and record.get("etype") == 4 and record.get("element") == "physical" and record.get("element_id") == 0 and animation is Dictionary and animation.get("skin") == "spine_beast" and animation.get("kind") == "native-ch1-eight-direction-atlas" and record.get("elite") == 0 and _json_equal(record.get("mods"), []) and record.get("aura") == null and _json_equal(record.get("spawn_position"), [3878.7467967160046, 340])

func _is_ice_soul_target(record: Dictionary) -> bool:
	var animation: Variant = record.get("animation")
	return record.get("id") == "ch1_initial_009" and record.get("order") == 8 and record.get("etype") == 4 and record.get("element") == "ice" and record.get("element_id") == 2 and animation is Dictionary and animation.get("skin") == "soul_flame" and animation.get("kind") == "native-ch1-eight-direction-atlas" and record.get("elite") == 0 and _json_equal(record.get("mods"), []) and record.get("aura") == null and _json_equal(record.get("spawn_position"), [4191.995760537684, 340])

func _is_hive_lightning_target(record: Dictionary) -> bool:
	var animation: Variant = record.get("animation")
	return record.get("id") == "ch1_initial_016" and record.get("order") == 15 and record.get("etype") == 1 and record.get("element") == "lightning" and record.get("element_id") == 4 and animation is Dictionary and animation.get("skin") == "hive_bloater" and animation.get("kind") == "native-ch1-eight-direction-atlas" and record.get("elite") == 0 and _json_equal(record.get("mods"), []) and record.get("aura") == null and _json_equal(record.get("spawn_position"), [4125.581107525944, 263.29083522849453])

func _validate_hive_lightning_config(record: Dictionary, label: String, errors: Array) -> void:
	var config_label = label + ".consumer_config"
	if not _has_keys(_hive_lightning_config, ["schema", "target", "runtime", "native_source_contract", "assets", "scope"], config_label, errors):
		return
	if _hive_lightning_config["schema"] != HIVE_LIGHTNING_CONFIG_SCHEMA or not _finite_json(_hive_lightning_config):
		errors.append(config_label + ": schema/finite JSON contract required")
	if not _has_keys(_hive_lightning_config["target"], ["id", "order", "etype", "element", "element_id", "skin", "elite", "mods", "aura", "spawn_position"], config_label + ".target", errors):
		return
	for key in _hive_lightning_config["target"]:
		var expected: Variant = record["animation"].get("skin") if key == "skin" else record.get(key)
		if not _json_equal(_hive_lightning_config["target"][key], expected):
			errors.append(config_label + ".target." + key + ": exact source target required")
	var required = ["id", "order", "name", "etype", "element", "element_id", "stage", "level", "difficulty", "spawn_position", "requested_spawn_position", "hp", "attack", "radius", "speed_pixels_per_tick", "native_tick_rate", "poise", "max_poise", "poise_regen_ticks", "poise_regen_fraction", "initial_idle_ticks", "initial_projectile_ticks", "projectile_cooldown_ticks", "initial_facing", "elite", "mods", "aura", "initial_spawn_fade_ticks", "initial_timers", "aggro_range", "hit_stun_ticks", "projectile_charge_ticks", "projectile_range", "windup_ticks", "attack_ticks", "recovery_ticks", "factory_random_seed", "ai_profile", "facing", "eShield", "eShieldMax", "eRes", "native_flags", "native_type_traits", "movement", "natural_contact_damage", "animation", "native_final", "projectile"]
	if not _has_keys(_hive_lightning_config["runtime"], required, config_label + ".runtime", errors):
		return
	var runtime: Dictionary = _hive_lightning_config["runtime"]
	for key in required:
		if record.has(key) and key not in ["animation", "native_final"] and not _json_equal(runtime[key], record[key]):
			errors.append(config_label + ".runtime." + key + ": source value changed")
	if runtime["ai_profile"] != HIVE_LIGHTNING_PROFILE or not _json_equal(runtime["facing"], record["initial_facing"]):
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
	var traits = {"etype": 1, "undead": false, "source": "game.html:25106", "antiRevive_applies": false, "full_equipment_modifiers_ported": false}
	if not _json_equal(runtime["native_type_traits"], traits) or runtime["natural_contact_damage"] != null:
		errors.append(config_label + ": type1 is not undead and has no natural melee contact")
	var movement = {"ranged_ideal_min": 390, "ranged_ideal_max": 510, "flow_multiplier": 1, "ranged_retreat_multiplier": 0.5, "ranged_retreat_stop_distance": 30, "idle_retreat_below": 80, "idle_advance_above": 200, "idle_retreat_multiplier": 0.6, "idle_advance_multiplier": 1.2, "ranged_retreat_collision": "point-isW", "idle_collision": "canMv-radius", "recompute_distance_after_ranged_stage": true, "recompute_distance_after_idle_stage": false, "flow_axis_fallback": true, "neighbor_query_multiplier": 4.4, "separation_extra_radius": 4, "separation_force_multiplier": 1.5, "separation_cooldown_ticks": 3}
	if not _json_equal(runtime["movement"], movement):
		errors.append(config_label + ".movement: exact ordered two-stage native type1 movement required")
	if not runtime["animation"] is Dictionary or not runtime["projectile"] is Dictionary:
		errors.append(config_label + ": animation/projectile dictionaries required")
		return
	var animation: Dictionary = runtime["animation"]
	for key in record["animation"]:
		if key != "resources_copied" and not _json_equal(animation.get(key), record["animation"][key]):
			errors.append(config_label + ".animation." + key + ": source atlas contract changed")
	var atlas = {"resources_copied": true, "base_rect": [1024, 0, 256, 256], "walk_frame_rects": [[4096, 0, 256, 256], [4352, 0, 256, 256], [4608, 0, 256, 256], [4864, 0, 256, 256]], "direction_angle_sectors": ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"], "base_and_walk_overlay": true, "texture_filter": "nearest"}
	for key in atlas:
		if not _json_equal(animation.get(key), atlas[key]):
			errors.append(config_label + ".animation." + key + ": exact hive atlas layout required")
	var projectile: Dictionary = runtime["projectile"]
	var fixed = {"element": "lightning", "element_id": 4, "bean": "normal", "parry_class": "magic", "native_dtype": "magic", "native_birth_position": "actor-center", "base_damage": 24, "contact_damage": 48, "size": 3, "radius": 5.2, "contact_margin": 13, "life_ticks": 180, "max_life_ticks": 180, "life_decay_per_tick": 0.667, "speed_pixels_per_second": [500, 600], "homing_radians_per_tick": 0.00655, "homing_until_life": 30, "homing": true, "commit": true, "drop_exempt": true, "friendly": false, "redBean": false, "blackBean": false, "blueBean": false, "gbBean": false, "waterBean": false, "fireMagic": false, "fromRainbow": false, "mine": false, "bomb": false, "player_knockback_pixels_per_tick": 2, "camera_cull_distance": 2500, "camera_cull_before_life_decay": true, "nonred_near_camera_life_extension": true, "expired_near_camera_life_ticks": 1, "alpha": 1, "col": "#ffee00"}
	for key in fixed:
		if not _json_equal(projectile.get(key), fixed[key]):
			errors.append(config_label + ".projectile." + key + ": exact normal EL.L projectile required")
	var electric = {"duration_ticks": 30, "append_rule": "max(existing or0,30)", "idle_only": true, "decrement_clamps_zero": false, "after_hurtP_even_if_rejected": true, "gameplay_effect": null, "active_modern_sprite_electric_overlay": false, "node_name": "NativeElectricCounter", "snapshot_field": "electric_ticks", "decrement_signal": "native_idle_status_tick(ticks:float)", "signal_owner": "parent minimal read-only Player publisher", "own_physics_process": false, "missing_signal_is_explicit_scope_error": true}
	if not _json_equal(projectile.get("electric_timer"), electric):
		errors.append(config_label + ".projectile.electric_timer: exact idle-only unclamped visual counter required")
	var comet = {"texture": "res://assets/vfx/proj_bolt_comet.png", "columns": 8, "rows": 1, "cell_size": [254, 137], "flight_frames": 8, "initial_phase": 0, "phase_increment_per_visible_render": 0.12, "width": 123.2, "height": 66.4503937007874, "draw_rect": [-76.384, -33.2251968503937, 123.2, 66.4503937007874], "horizontal_center_offset_fraction": -0.12, "tint": {"operation": "source-atop", "color": "#ffee00", "alpha": 0.65}, "alpha": 1}
	if not projectile.get("animation") is Dictionary or not projectile.get("impact") is Dictionary:
		errors.append(config_label + ".projectile: comet/impact metadata required")
		return
	for key in comet:
		if not _json_equal(projectile["animation"].get(key), comet[key]):
			errors.append(config_label + ".projectile.animation." + key + ": exact original comet consumer required")
	var impact = {"requested_ticks": 48, "duration_ticks": 66, "radius": 60, "native_tick_rate": 60, "origin": "actual projectile contact world position", "independent_world_sibling": true, "frame_rule": "min(frames-1,trunc(phase*frames))", "size_rule": "radius * size_multiplier * sqrt(min(1,phase*3))", "alpha_rule": "max(0,1-.5*age/66)*alpha_multiplier"}
	for key in impact:
		if not _json_equal(projectile["impact"].get(key), impact[key]):
			errors.append(config_label + ".projectile.impact." + key + ": exact native lightning boom required")
	var layers = [{"texture": "res://assets/vfx/Lightning_ImpactLightning_Sheet.png", "columns": 4, "rows": 4, "cell_size": [128, 128], "frames": 16, "phase_delay_fraction": 0, "phase_rescale": 1, "size_multiplier": 3, "alpha_multiplier": 1, "phase_rule": "clamp(age/66,0,1)"}, {"texture": "res://assets/vfx/Lightning_Lightning_FBF_4x3.png", "columns": 4, "rows": 3, "cell_size": [128, 170], "frames": 12, "phase_delay_fraction": 0.04, "phase_rescale": 0.96, "size_multiplier": 3.4, "alpha_multiplier": 0.8, "phase_rule": "clamp(max(0,age/66-.04)/.96,0,1)", "start_delay_ticks": 2.64, "unused_bottom_pixels": 2}]
	if not _json_equal(projectile["impact"].get("layers"), layers):
		errors.append(config_label + ".projectile.impact.layers: exact original cells/phase required")
	if not _hive_lightning_config["assets"] is Array or _hive_lightning_config["assets"].size() != 19:
		errors.append(config_label + ".assets: original body16 and new exact VFX3 resources required")
	else:
		for asset in _hive_lightning_config["assets"]:
			if not asset is Dictionary or not asset.get("resource") is String or not ResourceLoader.exists(asset["resource"]):
				errors.append(config_label + ".assets: required original resource missing")
	var player_script: Script = load("res://scripts/player.gd")
	var idle_signal_present = false
	if player_script != null:
		for signal_info in player_script.get_script_signal_list():
			if signal_info.get("name") == "native_idle_status_tick":
				idle_signal_present = true
	if not idle_signal_present:
		errors.append(config_label + ": original entered-idle status observation seam required")

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

func _validate_spine_config(record: Dictionary, label: String, errors: Array) -> void:
	var config_label = label + ".consumer_config"
	if not _has_keys(_spine_config, ["schema", "target", "runtime", "native_source_contract", "assets", "scope"], config_label, errors):
		return
	if _spine_config["schema"] != SPINE_CONFIG_SCHEMA or not _finite_json(_spine_config):
		errors.append(config_label + ": schema/finite JSON contract required")
	if not _has_keys(_spine_config["target"], ["id", "order", "etype", "element", "element_id", "skin", "elite", "mods", "aura", "spawn_position"], config_label + ".target", errors):
		return
	for key in _spine_config["target"]:
		var expected: Variant = record["animation"].get("skin") if key == "skin" else record.get(key)
		if not _json_equal(_spine_config["target"][key], expected):
			errors.append(config_label + ".target." + key + ": exact source target required")
	var required = ["id", "order", "name", "etype", "element", "element_id", "stage", "level", "difficulty", "spawn_position", "requested_spawn_position", "hp", "attack", "radius", "speed_pixels_per_tick", "native_tick_rate", "poise", "max_poise", "poise_regen_ticks", "poise_regen_fraction", "initial_idle_ticks", "initial_projectile_ticks", "projectile_cooldown_ticks", "initial_facing", "elite", "mods", "aura", "initial_spawn_fade_ticks", "initial_timers", "aggro_range", "pursuit_stop_distance", "idle_movement_multiplier", "contact_extra_radius", "contact_damage_multiplier", "contact_cooldown_min_ticks", "contact_cooldown_random_ticks", "hit_stun_ticks", "projectile_charge_ticks", "projectile_range", "windup_ticks", "attack_ticks", "recovery_ticks", "factory_random_seed", "facing", "ai_profile", "animation", "projectile", "eShield", "eShieldMax", "eRes", "native_flags", "native_final", "native_type_traits"]
	if not _has_keys(_spine_config["runtime"], required, config_label + ".runtime", errors):
		return
	var runtime: Dictionary = _spine_config["runtime"]
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
	# This raw consumer preserves type4's undead trait, without inventing a
	# nonzero equipment bonus or treating its tank label as an armor formula.
	var traits = {"undead": true, "source_undead_set": "game.html:25106", "source_antiRevive_bonus": "game.html:42800", "baseline_antiRevive": 0, "nonzero_antiRevive_modifier_ported_by_this_unit": false}
	if not _json_equal(runtime["native_type_traits"], traits):
		errors.append(config_label + ".native_type_traits: exact raw undead/no-affix scope required")
	if runtime["ai_profile"] != SPINE_PROFILE or not _json_equal(runtime["facing"], record["initial_facing"]):
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
	var fixed_animation = {"resources_copied": true, "base_rect": [1280, 0, 256, 256], "walk_frame_rects": [[5120, 0, 256, 256], [5376, 0, 256, 256], [5632, 0, 256, 256], [5888, 0, 256, 256]], "direction_angle_sectors": ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"], "base_and_walk_overlay": true, "texture_filter": "nearest"}
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
	if not _spine_config["assets"] is Array or _spine_config["assets"].size() != 17:
		errors.append(config_label + ".assets: seventeen original resources required")
	else:
		for asset in _spine_config["assets"]:
			if not asset is Dictionary or not asset.get("resource") is String or not ResourceLoader.exists(asset["resource"]):
				errors.append(config_label + ".assets: source resource missing")
	for key in ["hp", "radius", "poise_regen_ticks", "contact_cooldown_random_ticks"]:
		if not _number(runtime[key]) or float(runtime[key]) <= 0.0:
			errors.append(config_label + "." + key + ": positive value required")

func _validate_ice_soul_config(record: Dictionary, label: String, errors: Array) -> void:
	var config_label = label + ".consumer_config"
	if not _has_keys(_ice_soul_config, ["schema", "target", "runtime", "native_source_contract", "assets", "scope"], config_label, errors):
		return
	if _ice_soul_config["schema"] != ICE_SOUL_CONFIG_SCHEMA or not _finite_json(_ice_soul_config):
		errors.append(config_label + ": schema/finite JSON contract required")
	if not _has_keys(_ice_soul_config["target"], ["id", "order", "etype", "element", "element_id", "skin", "elite", "mods", "aura", "spawn_position"], config_label + ".target", errors):
		return
	for key in _ice_soul_config["target"]:
		var expected: Variant = record["animation"].get("skin") if key == "skin" else record.get(key)
		if not _json_equal(_ice_soul_config["target"][key], expected):
			errors.append(config_label + ".target." + key + ": exact source target required")
	var required = ["id", "order", "name", "etype", "element", "element_id", "stage", "level", "difficulty", "spawn_position", "requested_spawn_position", "hp", "attack", "radius", "speed_pixels_per_tick", "native_tick_rate", "poise", "max_poise", "poise_regen_ticks", "poise_regen_fraction", "initial_idle_ticks", "initial_projectile_ticks", "projectile_cooldown_ticks", "initial_facing", "elite", "mods", "aura", "initial_spawn_fade_ticks", "initial_timers", "aggro_range", "pursuit_stop_distance", "idle_movement_multiplier", "contact_extra_radius", "contact_damage_multiplier", "contact_cooldown_min_ticks", "contact_cooldown_random_ticks", "hit_stun_ticks", "projectile_charge_ticks", "projectile_range", "windup_ticks", "attack_ticks", "recovery_ticks", "factory_random_seed", "facing", "ai_profile", "animation", "projectile", "eShield", "eShieldMax", "eRes", "native_flags", "native_final", "native_type_traits"]
	if not _has_keys(_ice_soul_config["runtime"], required, config_label + ".runtime", errors):
		return
	var runtime: Dictionary = _ice_soul_config["runtime"]
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
	# This raw consumer preserves type4's undead trait, without inventing a
	# nonzero equipment bonus or treating its tank label as an armor formula.
	var traits = {"undead": true, "source_undead_set": "game.html:25106", "source_antiRevive_bonus": "game.html:42800", "baseline_antiRevive": 0, "nonzero_antiRevive_modifier_ported_by_this_unit": false}
	if not _json_equal(runtime["native_type_traits"], traits):
		errors.append(config_label + ".native_type_traits: exact raw undead/no-affix scope required")
	if runtime["ai_profile"] != ICE_SOUL_PROFILE or not _json_equal(runtime["facing"], record["initial_facing"]):
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
	var fixed_animation = {"resources_copied": true, "base_rect": [768, 0, 256, 256], "walk_frame_rects": [[3072, 0, 256, 256], [3328, 0, 256, 256], [3584, 0, 256, 256], [3840, 0, 256, 256]], "direction_angle_sectors": ["east", "south-east", "south", "south-west", "west", "north-west", "north", "north-east"], "base_and_walk_overlay": true, "texture_filter": "nearest"}
	for key in fixed_animation:
		if not _json_equal(animation.get(key), fixed_animation[key]):
			errors.append(config_label + ".animation." + key + ": unsupported atlas layout")
	if not _has_keys(runtime["projectile"], ["animation", "impact", "freeze_slow"], config_label + ".projectile", errors):
		return
	var fixed_projectile = {"element": "ice", "element_id": 2, "parry_class": "magic", "native_dtype": "magic", "native_birth_position": "actor-center", "base_damage": int(record["attack"] * 1.2), "contact_damage": int(record["attack"] * 1.2) * 2, "size": 3.2, "radius": 5.2, "contact_margin": 13.6, "life_ticks": 120, "life_decay_per_tick": 0.667, "speed_pixels_per_second": [500, 600], "homing_radians_per_tick": 0.00655, "homing_until_life": 30, "waterBean": true, "redBean": false, "homing": true, "commit": true, "drop_exempt": true, "player_knockback_pixels_per_tick": 2, "camera_cull_distance": 2500, "camera_cull_before_life_decay": true, "nonred_near_camera_life_extension": true, "expired_near_camera_life_ticks": 1, "portable_export_dependency_packaged": true}
	for key in fixed_projectile:
		if not _json_equal(runtime["projectile"].get(key), fixed_projectile[key]):
			errors.append(config_label + ".projectile." + key + ": unsupported water projectile")
	for flag in ["blackBean", "blueBean", "fromRainbow", "gbBean", "friendly", "noParry", "_druidPoison"]:
		if runtime["projectile"].get(flag, false) != false:
			errors.append(config_label + ".projectile." + flag + ": unported flag")
	var fixed_groups = {
		"animation": {"texture": "res://assets/vfx/water_blue_projectile_sheet.png", "external_original_file": false, "packaged_original_copy": true, "columns": 4, "rows": 2, "flight_frames": 8, "height": 44.8, "width": 84, "native_scale": 2.8, "native_draw_rect": [-45.36, -22.4, 84, 44.8]},
		"impact": {"texture": "res://assets/vfx/Water_ImpactWater_Sheet.png", "external_original_file": false, "packaged_original_copy": true, "columns": 4, "rows": 4, "frames": 16, "radius": 72, "duration_ticks": 66, "max_draw_size": 216},
		"freeze_slow": {"duration_ticks": 60, "movement_multiplier": 0.5, "decrement_only_native_player_state": "idle", "decrement_before_movement": true, "uninterrupted_idle_half_speed_updates": 59, "full_speed_on_idle_update": 60, "non_idle_timer_frozen": true, "independent_of_hurtP_acceptance_after_outer_contact": true}
	}
	for group in fixed_groups:
		if not runtime["projectile"][group] is Dictionary:
			errors.append(config_label + ".projectile." + group + ": Dictionary required")
			continue
		for key in fixed_groups[group]:
			if not _json_equal(runtime["projectile"][group].get(key), fixed_groups[group][key]):
				errors.append(config_label + ".projectile." + group + "." + key + ": source contract changed")
	for path in ["res://assets/vfx/water_blue_projectile_sheet.png", "res://assets/vfx/Water_ImpactWater_Sheet.png"]:
		if not ResourceLoader.exists(path, "Texture2D"):
			errors.append(config_label + ".projectile: required packaged original texture missing: " + path)
	if not _ice_soul_config["assets"] is Array or _ice_soul_config["assets"].size() != 18:
		errors.append(config_label + ".assets: sixteen reused body and two original water resources required")
	else:
		for asset in _ice_soul_config["assets"]:
			if not asset is Dictionary or not asset.get("resource") is String:
				errors.append(config_label + ".assets: invalid dependency")
			elif not ResourceLoader.exists(asset["resource"]):
				errors.append(config_label + ".assets: required body/water resource missing")
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
			var spine = _is_spine_target(record)
			var ice_soul = _is_ice_soul_target(record)
			var hive_lightning = _is_hive_lightning_target(record)
			var ice_warrior = _is_ice_warrior_target(record)
			var enemy: CharacterBody2D
			var runtime: Dictionary
			if ice_warrior:
				enemy = ICE_WARRIOR_SCRIPT.new()
				runtime = ICE_WARRIOR_SCRIPT.build_runtime(record)
			elif hive_lightning:
				enemy = HIVE_LIGHTNING_SCRIPT.new()
				runtime = _hive_lightning_config["runtime"]
			elif ice_soul:
				enemy = ICE_SOUL_SCRIPT.new()
				runtime = _ice_soul_config["runtime"]
			elif spine:
				enemy = SPINE_SCRIPT.new()
				runtime = _spine_config["runtime"]
			elif flesh:
				enemy = FLESH_SCRIPT.new()
				runtime = _flesh_config["runtime"]
			else:
				enemy = ENEMY_SCRIPT.new()
				runtime = record["runtime"]
			enemy.configure(runtime.duplicate(true), owner_world)
			if ice_warrior:
				report["records"][-1]["consumer_profile"] = ICE_WARRIOR_SCRIPT.PROFILE
				report["records"][-1]["source_support"] = record["support"].duplicate(true)
				report["records"][-1]["consumer_config"] = ICE_WARRIOR_CONFIG_FILE
			elif flesh or spine or ice_soul or hive_lightning:
				report["records"][-1]["consumer_profile"] = HIVE_LIGHTNING_PROFILE if hive_lightning else (ICE_SOUL_PROFILE if ice_soul else (SPINE_PROFILE if spine else FLESH_PROFILE))
				report["records"][-1]["source_support"] = record["support"].duplicate(true)
				report["records"][-1]["consumer_config"] = HIVE_LIGHTNING_CONFIG_FILE if hive_lightning else (ICE_SOUL_CONFIG_FILE if ice_soul else (SPINE_CONFIG_FILE if spine else FLESH_CONFIG_FILE))
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

# DEMO11-etype-b registration extension. Old registration and consumer unchanged.
const DEMO11_ETYPE_B_REGISTRATIONS = {
	8:preload("res://scripts/native_demo11_etype_b_actor.gd"),
	9:preload("res://scripts/native_demo11_etype_b_actor.gd"),
	10:preload("res://scripts/native_demo11_etype_b_actor.gd"),
	11:preload("res://scripts/native_demo11_etype_b_actor.gd"),
	12:preload("res://scripts/native_demo11_etype_b_actor.gd")}
func create_demo11_etype_b(runtime: Dictionary, world: Node2D) -> Dictionary:
	if not DEMO11_ETYPE_B_REGISTRATIONS.has(runtime.get("etype")) or runtime.get("ai_profile")!="demo11_group_b_v1":
		return {"ready":false,"reason":"outside_B_registration"}
	var actor: CharacterBody2D=DEMO11_ETYPE_B_REGISTRATIONS[runtime.etype].new()
	actor.configure(runtime,world)
	if not actor.is_native_registry_ready(): actor.free();return {"ready":false,"reason":"B_profile_rejected"}
	var result: Dictionary=world.register_summoned_enemy(actor)
	if not result.get("valid",false): actor.free();return {"ready":false,"reason":"B_world_registration_rejected","errors":result.get("errors")}
	return {"ready":true,"registered":true,"actor":actor,"full_combat_ready":false}

# DEMO11-etype-f registration only; existing entries/consumer byte-preserved.
const DEMO11_ETYPE_F_REGISTRATIONS = {
	26:preload("res://scripts/native_demo11_etype_f_actor.gd"),
	27:preload("res://scripts/native_demo11_etype_f_actor.gd"),
	28:preload("res://scripts/native_demo11_etype_f_actor.gd")}
func create_demo11_etype_f(runtime: Dictionary, world: Node2D) -> Dictionary:
	if not DEMO11_ETYPE_F_REGISTRATIONS.has(runtime.get("etype")) or runtime.get("ai_profile")!="demo11_group_f_v1":
		return {"ready":false,"reason":"outside_F_registration"}
	var actor: CharacterBody2D=DEMO11_ETYPE_F_REGISTRATIONS[runtime.etype].new()
	actor.configure(runtime,world)
	if not actor.is_native_registry_ready(): actor.free();return {"ready":false,"reason":"F_profile_rejected"}
	var result: Dictionary=world.register_summoned_enemy(actor)
	if not result.get("valid",false): actor.free();return {"ready":false,"reason":"F_world_registration_rejected","errors":result.get("errors")}
	return {"ready":true,"registered":true,"actor":actor,"full_combat_ready":false}
