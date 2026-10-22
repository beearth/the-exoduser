extends CharacterBody2D

const NativeArmorElementScript = preload("res://port_modules/item_armor_element/producer.gd")
var _native_armor_element: RefCounted

var _native_ground_pointer_bound := false
var _native_ground_pointer: Callable
var _native_pointer_screen: Variant = null

func bind_native_ground_pointer(provider: Callable) -> bool:
	if not provider.is_valid() or provider.get_argument_count() != 0 or _native_ground_pointer.is_valid():
		return false
	_native_ground_pointer = provider
	_native_ground_pointer_bound = true
	return true

func unbind_native_ground_pointer(provider: Callable) -> bool:
	if _native_ground_pointer != provider: return false
	_native_ground_pointer = Callable()
	_native_ground_pointer_bound = false
	return true
## Small native combat consumer; this is not the full inventory/save/parry runtime.

signal crescent_requested(step: int, charge_frames: float, direction: Vector2)
signal stats_changed
signal telemetry_event(kind: String, data: Dictionary)
signal native_idle_status_tick(ticks: float)
signal native_fireball_phase_tick(ticks: float, frame: float, entered_state: String)
var _native_magic_input_kind: String=""

const SOURCE_PLAYER_CLIP = preload("res://port_modules/character_clip/player_clip.gd")
var _current_attack_tempo: Dictionary = {}
var _native_attack_audio_serial := 0

const HIT_EFFECT = preload("res://scripts/hit_effect.gd")
# P1-002.E/F: 기본 근접 hurtE 실행자 + hurtE owner API 계약 (스크립트 동일성 비교 대신
# 메서드 존재로 식별하고, 실제 owner 검사는 실행자의 read_native_normal_enemy_hurte_fields
# owner-current 게이트가 수행한다 — 통과 못 하면 정지, 단순화 경로 폴백 없음).
const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const NORMAL_HURTE_OWNER_METHODS: Array[String] = ["read_native_normal_enemy_hurte_fields",
	"apply_native_normal_enemy_field_write", "apply_native_normal_enemy_bookkeeping",
	"apply_native_normal_enemy_hp_write", "apply_native_normal_enemy_death_write",
	"report_native_normal_enemy_hurte_event", "add_native_knockback"]
const SLASH_SHEET = preload("res://assets/vfx/ki_slash_silver_sheet.png") # P2-007a 16753 실버 시트(차지 19246 surfaces[2]=동일 참조)
const ADDITIVE = preload("res://assets/vfx/radiant.gdshader")
const DIRECTIONS: Array[String] = ["south", "south-east", "east", "north-east", "north", "north-west", "west", "south-west"]
const NATIVE_BURN_MAX_STACKS = 10
const NATIVE_BURN_DURATION_TICKS = 600.0
const NATIVE_BURN_INTERVAL_TICKS = 30.0
const NATIVE_BURN_POOL_DIVISOR = 20.0
@export var hp: float = 350.0
@export var max_hp: float = 350.0
@export var stamina: float = 200.0
@export var max_stamina: float = 200.0
@export var melee_ref: float = 8.0
@export var stat_str: float = 1.0
@export var attack_multiplier: float = 0.7
@export var ki_slash_level: int = 1
@export var charge_frames: float = 0.0
@export var combo_step: int = 0
@export var visual_scale: float = 2.5
@export var radius: float = 15.0
@export var base_def: float = 2.0
@export var energy_def: float = 0.0
@export var iframes: float = 0.0
@export var poise: int = 4
@export var max_poise: int = 4
var state: String = "idle"
var facing := Vector2.RIGHT
var combat: Dictionary = {}
var _world: Node
var _sprite: AnimatedSprite2D
var _charge_sprites: Array[AnimatedSprite2D] = []
var _charge_marks: Node2D
var _weapon_held: bool = false
var _accessibility_hold: bool = false
var _native_input_held: Dictionary = {}
var _blocked_until_release: bool = false
var _was_wall_contact: bool = false
var _state_left: float = 0.0
var _combo_left: float = 0.0
var _crescent_cooldown: float = 0.0
var _clock_frames: float = 0.0
var _walk_distance: float = 0.0
var _attack_direction := Vector2.RIGHT
var _atk_bonus: int = 0
var _melee_contact_done: bool = false
var _was_moving: bool = false
var _walk_visual_direction := Vector2.RIGHT
# SpriteAnimator.create starts idle at spd8. A later play('idle',48)
# resets f/t; directions within idle do not restart the same clip.
var _idle_visual := {"mode":"idle","frame":0,"ticks":0.0,"interval":8.0}
var _idle_visual_last_clock := 0.0
var _movement_speed: float = 156.0
var _stamina_regen_base: float = 0.28
var _recovery_ticks: float = 53.0
var _charge_step: float = 40.0
var _charge_max: float = 120.0
var _swing_ticks: float = 5.0
var _knockback := Vector2.ZERO
var _native_burns: Array[Dictionary] = []
var _native_freeze_slow_ticks = 0.0
var _native_combat_qe: Object
var _native_q_control: Object
var _native_resource_regeneration: Object
var _native_resource_regeneration_bound: bool = false
var _native_attack_selection_bound := false
var _native_attack_selection_reader: Callable
var _native_character_selection_requested := false
var _native_character_selection_reader: Callable
var _native_character_profile: Dictionary = {}
var _native_source_resources: Object
var _native_source_resources_bound: bool = false

# Source initialization is a one-owner constructor seam, not a live actor setter.
var _native_source_initialization_owner: WeakRef
var _native_source_initialization_world: WeakRef
var _native_source_initialization_world_parent: WeakRef
var _native_source_initialization_bound: bool = false
var _native_source_initialization_busy: bool = false
var _native_source_initialization_written_tags: Dictionary = {}
var _native_source_speed_initialized: bool = false
var _native_source_speed_per_tick: Variant = null
var _native_source_poise_r: Variant = null
var _native_source_poise_r_initialized: bool = false

func set_world(world: Node) -> void:
	_world = world

# ═══ PC-MOVE-SKILLS (2026-10-22) — Shift 사슬·방향+Space 전격이동 owner(native_move_skills.gd) 결합 ═══
# 원본 S16b(G32155–32576)·switch 소비(G32985/33032/33747/33943/34333/34341)·keydown/keyup(G13225–13372)의
# 호출 위치만 이 파일에 둔다. 수치·순서는 owner가 보유. 미결합이면 기존 동작 그대로.
const NATIVE_MOVE_SKILLS_PATH := "res://scripts/native_move_skills.gd"
var _native_move_skills: Node = null
var _dash_clip := {"anim": "", "f": 0, "t": 0.0, "done": false}

func bind_native_move_skills(owner: Node) -> bool:
	if is_instance_valid(_native_move_skills) or not is_instance_valid(owner) or owner.get_script() == null \
			or owner.get_script().resource_path != NATIVE_MOVE_SKILLS_PATH or not owner.is_configured():
		return false
	_native_move_skills = owner
	return true

func get_native_move_skills() -> Node:
	return _native_move_skills if is_instance_valid(_native_move_skills) else null

## _aimDir() G19790 — 플레이어 조준 각도(이 파일의 _physics_process 조준 계산과 같은 원천)
func read_native_aim_angle() -> float:
	var aim: Vector2 = get_global_mouse_position() - global_position
	if _native_ground_pointer_bound:
		var pointer: Variant = _native_ground_pointer.call() if _native_ground_pointer.is_valid() else null
		aim = pointer.world - global_position if pointer is Dictionary and pointer.get("ready") == true and pointer.get("world") is Vector2 else Vector2.ZERO
	if aim.length_squared() > 1.0:
		return aim.angle()
	return facing.angle()

## owner 전용 상태 쓰기: P.s='bladeDash'(G45456) / 착지 복귀 idle·sBlock(G45408–45413)
func apply_native_move_skill_state(next_state: String) -> bool:
	if not is_instance_valid(_native_move_skills) or next_state not in ["bladeDash", "idle", "sBlock"]:
		return false
	if next_state == "bladeDash" and state in ["windup", "swing", "recover"]:
		charge_frames = 0.0
		_accessibility_hold = false
	state = next_state
	stats_changed.emit()
	return true

## 경직·기절 탈출(G34333/G34336/G34341/G34343)
func apply_native_move_skill_escape(kind: String) -> bool:
	if not is_instance_valid(_native_move_skills):
		return false
	match kind:
		"stagger": # P.s='idle';P.st2=0
			state = "idle"; _state_left = 0.0
		"stagger_blade": # P.st2=0 → activateBladeDash
			_state_left = 0.0
		"pStun": # P.s='idle';P.iframes=30;P.poise=4;P.poiseR=0
			state = "idle"; iframes = 30.0; poise = 4; _native_source_poise_r = 0.0
		"pStun_blade": # P.poise=4;P.poiseR=0 → activateBladeDash
			poise = 4; _native_source_poise_r = 0.0
		_:
			return false
	stats_changed.emit()
	return true

func _move_skills_block_idle_actions() -> bool:
	return is_instance_valid(_native_move_skills) and state == "idle" and _native_move_skills.blocks_idle_actions()

func get_combat_world() -> Node:
	return _world

func bind_native_combat_qe(adapter: Object) -> bool:
	if is_instance_valid(_native_combat_qe) or is_instance_valid(_native_q_control) or not is_instance_valid(adapter):
		return false
	for method in ["get_native_qe_player", "get_native_qe_world", "is_native_qe_ready", "allows_native_qe_iframe_reflection", "advance_native", "resolve_native_contact", "get_snapshot"]:
		if not adapter.has_method(method):
			return false
	if adapter.get_native_qe_player() != self or adapter.get_native_qe_world() != _world:
		return false
	var ready: Variant = adapter.is_native_qe_ready()
	if not ready is bool or not ready:
		return false
	_native_combat_qe = adapter
	return true

func get_native_combat_qe_snapshot() -> Dictionary:
	return _native_combat_qe.get_snapshot() if is_instance_valid(_native_combat_qe) else {"ready": false, "bound": false}

func bind_native_q_control(adapter: Object) -> bool:
	if is_instance_valid(_native_combat_qe) or is_instance_valid(_native_q_control) or not is_instance_valid(adapter) or adapter.get_script()!=preload("res://scripts/native_combat_qe_adapter.gd"):return false
	if adapter.get_native_qe_player()!=self or adapter.get_native_qe_world()!=_world or not adapter.is_native_q_control_ready():return false
	_native_q_control=adapter
	return true

func get_native_q_control_snapshot() -> Dictionary:
	return _native_q_control.get_q_control_snapshot() if is_instance_valid(_native_q_control) else {"ready":false,"scope":"Q_CONTROL_PARTIAL","reason":"not_bound"}

func bind_native_resource_regeneration(adapter: Object) -> bool:
	if _native_resource_regeneration_bound or not is_instance_valid(adapter):
		return false
	for method in ["get_native_regen_player", "get_native_regen_world", "is_native_regen_ready", "advance_native", "get_snapshot"]:
		if not adapter.has_method(method):
			return false
	if adapter.get_native_regen_player() != self or adapter.get_native_regen_world() != _world:
		return false
	var ready: Variant = adapter.is_native_regen_ready()
	if not ready is bool or not ready:
		return false
	_native_resource_regeneration = adapter
	_native_resource_regeneration_bound = true
	return true

func get_native_resource_regeneration_snapshot() -> Dictionary:
	if is_instance_valid(_native_resource_regeneration):
		var snapshot: Dictionary = _native_resource_regeneration.get_snapshot().duplicate(true)
		snapshot["bound"] = _native_resource_regeneration_bound
		return snapshot
	return {"ready": false, "bound": _native_resource_regeneration_bound}

func bind_native_source_resources(authority: Object) -> bool:
	if _native_source_resources_bound or not is_instance_valid(authority):
		return false
	for method in ["get_native_regen_player", "get_native_regen_world", "is_native_source_resources_ready", "read_native_regen_state", "read_current_resource_parameters", "get_snapshot"]:
		if not authority.has_method(method):
			return false
	if authority.get_native_regen_player() != self or authority.get_native_regen_world() != _world:
		return false
	var ready: Variant = authority.is_native_source_resources_ready()
	if not ready is bool or not ready:
		return false
	_native_source_resources = authority
	_native_source_resources_bound = true
	return true

func get_native_source_resource_authority() -> Object:
	return _native_source_resources if is_instance_valid(_native_source_resources) else null

func get_native_source_resources_snapshot() -> Dictionary:
	if is_instance_valid(_native_source_resources):
		var snapshot: Dictionary = _native_source_resources.get_snapshot().duplicate(true)
		snapshot["bound"] = _native_source_resources_bound
		return snapshot
	return {"ready": false, "bound": _native_source_resources_bound}

func bind_native_source_initialization(owner: Object) -> bool:
	if _native_source_initialization_bound or _native_source_initialization_busy \
			or not _native_source_initialization_constructor_ready() or not is_instance_valid(owner):
		return false
	for method in ["get_native_source_initialization_player", "get_native_source_initialization_world", "get_native_source_initialization_write_tag"]:
		if not owner.has_method(method):
			return false
	if owner is Node and owner.is_queued_for_deletion():
		return false
	_native_source_initialization_busy = true
	var same_actor_world: bool = owner.get_native_source_initialization_player() == self \
		and owner.get_native_source_initialization_world() == _world
	if not same_actor_world or not _native_source_initialization_constructor_ready() or not is_instance_valid(owner):
		_native_source_initialization_busy = false
		return false
	_native_source_initialization_owner = weakref(owner)
	_native_source_initialization_world = weakref(_world)
	_native_source_initialization_world_parent = weakref(_world.get_parent()) if _world.get_parent() != null else null
	_native_source_initialization_bound = true
	_native_source_initialization_busy = false
	return true

func commit_native_source_initialization_field(field: String, value: Variant) -> bool:
	if _native_source_initialization_busy or not _native_source_initialization_binding_live() \
			or not (value is int or value is float) or not is_finite(float(value)):
		return false
	if field not in ["hp", "mhp", "baseDef", "speed", "maxPoise", "poise", "poiseR"]:
		return false
	if field in ["maxPoise", "poise"] and float(value) != 4.0:
		return false
	if field == "poiseR" and float(value) != 0.0:
		return false
	if field == "speed" and not is_finite(float(value) * 60.0):
		return false
	_native_source_initialization_busy = true
	var owner: Object = _native_source_initialization_owner.get_ref()
	var identities_match: bool = owner.get_native_source_initialization_player() == self \
		and owner.get_native_source_initialization_world() == _world
	var tag: Variant = owner.get_native_source_initialization_write_tag() if identities_match else null
	if not _native_source_initialization_binding_live() or not _native_source_initialization_tag_allowed(field, tag):
		_native_source_initialization_busy = false
		return false
	var key: String = "%s|%s|%s|%d" % [field, tag["source"], tag["kind"], int(tag["pass_id"])]
	if _native_source_initialization_written_tags.has(key):
		_native_source_initialization_busy = false
		return false
	# No callback, await, event or signal occurs between admission and write.
	match field:
		"hp": hp = float(value)
		"mhp": max_hp = float(value)
		"baseDef": base_def = float(value)
		"speed":
			_native_source_speed_per_tick = value
			_movement_speed = float(value) * 60.0
			_native_source_speed_initialized = true
		"maxPoise": max_poise = int(value)
		"poise": poise = int(value)
		"poiseR":
			_native_source_poise_r = value
			_native_source_poise_r_initialized = true
	_native_source_initialization_written_tags[key] = true
	_native_source_initialization_busy = false
	return true

func read_native_source_initialization_fields() -> Dictionary:
	# Only the actual actor is read. The initial missing poiseR is not defaulted.
	var fields: Dictionary = {"hp": hp, "mhp": max_hp, "baseDef": base_def,
		"speed": _native_source_speed_per_tick if _native_source_speed_initialized else _movement_speed / 60.0,
		"maxPoise": max_poise, "poise": poise}
	if _native_source_poise_r_initialized:
		fields["poiseR"] = _native_source_poise_r
	return fields

func get_native_source_initialization_snapshot() -> Dictionary:
	return {"bound": _native_source_initialization_bound,
		"constructor_write_ready": _native_source_initialization_binding_live(),
		"fields": read_native_source_initialization_fields(),
		"source_speed_initialized": _native_source_speed_initialized,
		"source_poise_r_initialized": _native_source_poise_r_initialized,
		"committed_source_writes": _native_source_initialization_written_tags.size(),
		"live_actor_writes": false, "owns_clock": false}

# PC-RUNTIME-STATS — runtime applyStats batch sink. Separate from the
# constructor seam above (whose pre-Tree guard is unchanged). Only the actual
# Main-owned refresh module may write, and only inside its synchronous commit
# window. No signal/callback between validation and the writes.
const RUNTIME_STAT_REFRESH_PATH = "res://scripts/native_source_player_runtime_stat_refresh.gd"
const RUNTIME_STAT_REFRESH_FIELDS = ["hp", "mhp", "baseDef", "speed", "maxPoise", "poise", "poiseR"]
var _native_runtime_stat_commits := 0

func validate_native_runtime_stat_refresh(owner: Node, refresh: Object, fields: Dictionary) -> String:
	if not is_inside_tree() or is_queued_for_deletion() or not is_instance_valid(owner) \
			or owner != get_parent() or owner.get("player") != self or not is_instance_valid(_world) \
			or owner.get("world") != _world or _world.get("player") != self:
		return "player_runtime_refresh_owner_mismatch"
	if not is_instance_valid(refresh) or refresh.get_script() == null \
			or refresh.get_script().resource_path != RUNTIME_STAT_REFRESH_PATH \
			or owner.get("source_runtime_stat_refresh") != refresh:
		return "player_runtime_refresh_module_mismatch"
	var window: Variant = refresh.is_native_runtime_stat_refresh_committing(owner)
	if not window is bool or not window:
		return "player_runtime_refresh_not_in_commit_window"
	for field in fields:
		if field not in RUNTIME_STAT_REFRESH_FIELDS:
			return "player_runtime_refresh_field_denied:" + str(field)
		var value: Variant = fields[field]
		if not (value is int or value is float) or not is_finite(float(value)):
			return "player_runtime_refresh_value_invalid:" + str(field)
	if fields.has("maxPoise") and float(fields["maxPoise"]) != 4.0:
		return "player_runtime_refresh_max_poise_constant"
	if fields.has("speed") and not is_finite(float(fields["speed"]) * 60.0):
		return "player_runtime_refresh_speed_non_finite"
	if fields.has("hp") and float(fields["hp"]) > float(fields.get("mhp", max_hp)):
		return "player_runtime_refresh_hp_above_mhp"
	return ""

func commit_native_runtime_stat_refresh(owner: Node, refresh: Object, fields: Dictionary) -> Dictionary:
	var error := validate_native_runtime_stat_refresh(owner, refresh, fields)
	if not error.is_empty():
		return {"accepted": false, "reason": error}
	for field in fields:
		var value: Variant = fields[field]
		match field:
			"hp": hp = float(value)
			"mhp": max_hp = float(value)
			"baseDef": base_def = float(value)
			"speed":
				_native_source_speed_per_tick = value
				_movement_speed = float(value) * 60.0
				_native_source_speed_initialized = true
			"maxPoise": max_poise = int(value)
			"poise": poise = int(value)
			"poiseR":
				_native_source_poise_r = value
				_native_source_poise_r_initialized = true
	_native_runtime_stat_commits += 1
	return {"accepted": true, "fields": fields.keys(), "commits": _native_runtime_stat_commits}

func _native_source_initialization_constructor_ready() -> bool:
	if is_inside_tree() or is_node_ready() or get_parent() != null or is_queued_for_deletion() \
			or not is_instance_valid(_world) or _world.is_queued_for_deletion():
		return false
	if _world.is_inside_tree() and _world.get_tree().paused:
		return false
	var has_player: bool = false
	for property in _world.get_property_list():
		if property["name"] == "player":
			has_player = true
			break
	if not has_player:
		return false
	var world_player: Variant = _world.get("player")
	return typeof(world_player) == TYPE_NIL or (is_instance_valid(world_player) and world_player == self)

func _native_source_initialization_binding_live() -> bool:
	if not _native_source_initialization_bound or not _native_source_initialization_constructor_ready() \
			or not is_instance_valid(_native_source_initialization_owner) or not is_instance_valid(_native_source_initialization_world):
		return false
	var owner: Variant = _native_source_initialization_owner.get_ref()
	if not is_instance_valid(owner) or not is_instance_valid(_native_source_initialization_world.get_ref()) \
			or _native_source_initialization_world.get_ref() != _world:
		return false
	if owner is Node and owner.is_queued_for_deletion():
		return false
	if _native_source_initialization_world_parent != null:
		var original_parent: Variant = _native_source_initialization_world_parent.get_ref()
		if not is_instance_valid(original_parent) or _world.get_parent() != original_parent:
			return false
	elif _world.get_parent() != null:
		return false
	return true

func _native_source_initialization_tag_allowed(field: String, tag: Variant) -> bool:
	if not tag is Dictionary or tag.size() != 4 or tag.get("field") != field \
			or not tag.get("source") is String or not tag.get("kind") is String:
		return false
	var pass_id: Variant = tag.get("pass_id")
	if not (pass_id is int or pass_id is float) or not is_finite(float(pass_id)) \
			or float(pass_id) < 1.0 or floor(float(pass_id)) != float(pass_id):
		return false
	var approved: Dictionary = {
		"mhp": {"game.html:28582": "apply_stats_health_initial", "game.html:28601": "apply_stats_health_crystal_mhp", "game.html:28617": "apply_stats_health_fortify"},
		"hp": {"game.html:28601": "apply_stats_health_crystal_mhp", "game.html:28617": "apply_stats_health_fortify"},
		"baseDef": {"game.html:28583": "apply_stats_def_speed_early", "game.html:28603": "apply_stats_def_speed_crystal", "game.html:28620": "apply_stats_def_speed_armor"},
		"speed": {"game.html:28589": "apply_stats_def_speed_early", "game.html:28604": "apply_stats_def_speed_crystal"},
		"maxPoise": {"game.html:28584": "apply_stats_poise_init"},
		"poise": {"game.html:28585": "apply_stats_poise_init"},
		"poiseR": {"game.html:28586": "apply_stats_poise_init"},
	}
	return approved.has(field) and approved[field].get(tag["source"]) == tag["kind"]

func set_combat(data: Dictionary) -> void:
	combat = data
	if is_node_ready():
		_apply_combat_values()

func _ready() -> void:
	motion_mode = CharacterBody2D.MOTION_MODE_FLOATING
	collision_layer = 2
	collision_mask = 1 | 4
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	var input_window: Window = get_window()
	if input_window != null and not input_window.window_input.is_connected(_track_held_input_while_paused):
		input_window.window_input.connect(_track_held_input_while_paused)
	if combat.is_empty():
		var decoded = JSON.parse_string(FileAccess.get_file_as_string("res://data/combat.json"))
		if decoded is Dictionary:
			combat = decoded
	_apply_combat_values()
	var body_shape := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = radius
	body_shape.shape = circle
	add_child(body_shape)
	_build_sprite()
	_build_charge_display()
	_update_display()
	stats_changed.emit()

func _apply_combat_values() -> void:
	var profile: Dictionary = combat.get("player", {})
	var skill: Dictionary = combat.get("kiSlash", {})
	if not _native_source_speed_initialized:
		_movement_speed = float(profile.get("movement_per_tick", 2.6)) * 60.0
	_stamina_regen_base = float(profile.get("stamina_regen_base", 0.28))
	_charge_step = float(skill.get("charge_step_ticks", 40.0))
	_charge_max = float(skill.get("charge_max_ticks", 120.0))
	_swing_ticks = float(skill.get("swing_ticks", 5.0))
	_recovery_ticks = maxf(1.0, floor(float(skill.get("recovery_numerator", 16.0)) / (float(skill.get("weapon_speed_fallback", 0.3)) * float(skill.get("dex_multiplier", 1.0)) * (1.0 + float(skill.get("attack_speed_affix_sum", 0.0))))))

func _unhandled_input(event: InputEvent) -> void:
	if _native_attack_selection_bound:
		if handle_native_input_event(event).get("handled")==true:
			get_viewport().set_input_as_handled()
		return
	if event is InputEventKey and event.pressed and not event.echo and event.physical_keycode == KEY_SPACE:
		if _accessibility_hold:
			release_attack()
		elif combo_step == 2 and state == "idle":
			if request_attack() and state == "windup":
				_accessibility_hold = true
				telemetry_event.emit("accessibility_charge_hold", {"input": "Space", "native_lmb_hold": false})
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("cancel_charge"):
		cancel_attack()
		get_viewport().set_input_as_handled()
	elif event.is_action_pressed("weapon"):
		_weapon_held = true
		if not _native_lesson_blocks_action("weapon"): # P2-001l
			request_attack()
	elif event.is_action_released("weapon"):
		if not _accessibility_hold:
			release_attack()

## P2-001l — 레슨 allows 입력 게이트(원본 14290 isAct/isJust 래핑 상응): 레슨 활성 중
## 단계 허용 외 입력만 차단. 전투 판정 로직은 불변 — 입력 게이트 1곳.
func _native_lesson_blocks_action(action: String) -> bool:
	var main: Node = get_parent()
	if main == null:
		return false
	var sequence: Variant = main.get("source_intro_sequence")
	if not is_instance_valid(sequence):
		return false
	var flow: Variant = sequence.get("lesson_flow")
	if not is_instance_valid(flow) or flow.get("active") != true or not flow.has_method("allows_native_action"):
		return false
	return not flow.allows_native_action(action)

func handle_native_input_event(event: InputEvent) -> Dictionary:
	var result := {"handled":false,"accepted":false,"reason":"unmapped_event"}
	if not _native_attack_selection_bound or not is_inside_tree() or get_tree().paused:
		result.reason="native_input_not_live_or_paused"
		return result
	if is_instance_valid(_native_move_skills):
		if event is InputEventMouseMotion or event is InputEventMouseButton:
			_native_move_skills.handle_mouse_modifier(event) # G13384/G13394 sticky-keys Shift 잔류 해제
		elif event is InputEventKey:
			# keydown G13225–13249 / keyup G13336–13371: 같은 키의 다른 바인딩(Space 슬롯)보다 먼저
			var move: Dictionary = _native_move_skills.handle_key(event, Callable(self, "_native_lesson_blocks_action"))
			if move.get("consumed") == true:
				return {"handled":true,"accepted":true,"action":"move_skill","reason":str(move.get("reason",""))}
	if event is InputEventMouseMotion and event.position.is_finite():
		_native_pointer_screen=event.position
		return {"handled":true,"accepted":true,"action":"aim"}
	for action in ["move_left","move_right","move_up","move_down","weapon","parry","shield_bash","rage_slot","native_magic"]:
		if not event.is_action(action): continue
		result.handled=true
		result.action=action
		if _native_lesson_blocks_action(action): # P2-001l 레슨 입력 제한(32 allows)
			_native_input_held[action]=false
			result.reason="parry_lesson_input_locked"
			return result
		if event is InputEventKey and event.echo:
			result.reason="key_repeat_ignored"
			return result
		var pressed: bool = event.is_pressed()
		var was_held: bool = _native_input_held.get(action,false)
		_native_input_held[action]=pressed
		if action.begins_with("move_"):
			result.accepted=true
		elif action=="weapon":
			if pressed: result.accepted=request_attack()
			else:
				release_attack()
				result.accepted=true
		elif action=="native_magic":
			result.accepted=event is InputEventMouseButton
			if result.accepted:_native_magic_input_kind="keyboard_mouse"
			else:
				_native_input_held[action]=false
				_native_magic_input_kind=""
			result.command={"accepted":result.accepted,"deferred_to_native_physics":true}
		elif action=="parry":
			var command: Dictionary
			if is_instance_valid(_native_q_control) and _native_q_control.is_native_q_control_ready():command={"accepted":true,"deferred_to_native_physics":true}
			else:command=_request_native_q_input() if pressed else (_native_combat_qe.release_shield() if is_instance_valid(_native_combat_qe) and state in ["sBlock","peaceShield"] else {"accepted":true})
			result.accepted=command.get("accepted")==true
			result.command=command
			if not result.accepted and command.get("reason")=="native_q_owner_not_ready":
				telemetry_event.emit("native_input_unavailable",{"action":action,"reason":command.reason})
		elif action=="shield_bash":
			var command: Dictionary = {"accepted":true}
			if pressed and _move_skills_block_idle_actions(): # G33042 사슬기동 중 idle 행동 차단(isJust('shield') 미도달)
				command={"accepted":false,"reason":"chain_movement_blocks_idle_actions"}
			elif pressed:
				command=_native_q_control.queue_e_control_press() if is_instance_valid(_native_q_control) and not was_held else {"accepted":false,"reason":"e_owner_not_ready_or_held_repeat"}
			result.command=command
			result.accepted=command.get("accepted")==true
			if not result.accepted:telemetry_event.emit("native_input_unavailable",{"action":action,"reason":command.get("reason")})
		elif action=="rage_slot" and is_instance_valid(_native_move_skills):
			# G13284 Space 슬롯(SKILL_SLOTS[4]): 전격이동 트리거(G13246, 위 handle_key) 다음 순위.
			# 사슬기동 중엔 차단, 그 외에는 실제 슬롯 owner(NativeSkillSlots._unhandled_input)로 넘긴다.
			if pressed and _native_move_skills.blocks_space_slot():
				result.reason="space_slot_blocked_during_chain_movement"
				return result
			result.handled=false
			result.accepted=false
			result.reason="space_slot_deferred_to_skill_slot_owner"
			return result
		elif pressed:
			result.reason="space_rage_slot_not_connected"
			telemetry_event.emit("native_input_unavailable",{"action":action,"reason":result.reason})
			return result
		result.reason="" if result.accepted else "action_not_admitted"
		return result
	return result

## PC-INPUT-PARITY — 원본 keydown/keyup(G13214 `K[e.code]=true;KH[e.code]=true` / G13330 `KH[e.code]=false`)은
## G.paused와 무관하게 눌림 상태를 갱신한다. Godot은 PAUSABLE Player가 일시정지 동안 입력을 못 받아,
## 인벤토리·성장창 등 일시정지 패널을 연 사이 뗀 이동키가 닫은 뒤에도 눌린 채 남았다(계속 걷기).
## 일시정지 중에만 이동 눌림(누름·반복·뗌)과 패링 뗌을 기록한다. 발동(공격·패링 시작·스킬)은 하지 않는다.
func _track_held_input_while_paused(event: InputEvent) -> void:
	if not _native_attack_selection_bound or not is_inside_tree() or not get_tree().paused:
		return
	if not event is InputEventKey:
		return
	for action in ["move_left","move_right","move_up","move_down"]:
		if event.is_action(action):
			_native_input_held[action]=event.is_pressed()
	if event.is_action("parry") and not event.is_pressed():
		_native_input_held["parry"]=false

func clear_native_input_states() -> void:
	_native_input_held.clear()
	_native_magic_input_kind=""
	_weapon_held=false
	_accessibility_hold=false

func get_native_input_snapshot() -> Dictionary:
	return {"authority":"native_explicit_defaults_from_R","source_saved_bindings_restored":false,"held":_native_input_held.duplicate(),"weapon_held":_weapon_held,"magic_input_kind":_native_magic_input_kind}

func _request_native_q_input() -> Dictionary:
	var owner: Object = _native_combat_qe if is_instance_valid(_native_combat_qe) else _native_q_control
	if not is_instance_valid(owner) or (not owner.is_native_qe_ready() and not owner.is_native_q_control_ready()):
		return {"accepted":false,"reason":"native_q_owner_not_ready"}
	if _move_skills_block_idle_actions(): # G33042 사슬기동 중 행동 차단 (isAct('parry') 미도달)
		return {"accepted":false,"reason":"chain_movement_blocks_idle_actions"}
	if state in ["windup","swing","recover"]:
		var selection: Dictionary = get_native_attack_selection_snapshot()
		var p: Variant = _native_attack_selection_reader.call() if _native_attack_selection_reader.is_valid() else null
		if selection.get("emit_ki_slash")!=true or not p is Dictionary or not p.get("skills") is Dictionary:
			return {"accepted":false,"reason":"q_cancel_requires_current_ki"}
		if p.get("activeQSk")=="peaceShield" and float(p.skills.get("peaceShield",0))>=1.0:
			return {"accepted":false,"reason":"peace_shield_full_runtime_not_adopted"}
		if owner.shield_cd>0.0 or owner.mana<10.0:
			return {"accepted":false,"reason":"source_q_cost_or_cooldown_gate"}
		cancel_attack()
		_blocked_until_release=false
	return owner.request_q() if owner==_native_combat_qe else owner.request_q_control()

func _notification(what: int) -> void:
	if what==NOTIFICATION_APPLICATION_FOCUS_OUT:
		clear_native_input_states()
		if is_instance_valid(_native_move_skills):
			_native_move_skills.clear_held_input() # G13373 _clearHeldInput: 쉬프트 홀드 무장 해제

func bind_native_attack_selection(reader: Callable) -> bool:
	if _native_attack_selection_bound or not reader.is_valid() or reader.get_argument_count() != 0 or reader.get_method() != "read_current_p":
		return false
	var owner: Object = reader.get_object()
	if not owner is Node or owner.get_script() == null or owner.get_script().resource_path != "res://scripts/native_source_new_run_state.gd" or owner.get_parent() != _world:
		return false
	_native_attack_selection_reader=reader
	_native_attack_selection_bound=true
	return true

func get_native_attack_selection_snapshot() -> Dictionary:
	var result := {"ready":false,"castable":false,"emit_ki_slash":false,"reason":"source_lmb_not_bound",
		"skill":null,"selection_present":false,"level":null,"weapon_cost":null,"route":null}
	if not _native_attack_selection_bound: return result
	if not _native_attack_selection_reader.is_valid():
		result.reason="current_source_lmb_owner_lost"
		return result
	var owner: Object = _native_attack_selection_reader.get_object()
	var main: Node = get_parent()
	if not is_inside_tree() or not is_instance_valid(owner) or not owner is Node or owner.is_queued_for_deletion() or not owner.is_inside_tree() or owner.get_parent() != _world or not is_instance_valid(main) or main.is_queued_for_deletion() or main.get("source_state") != owner or main.get("player") != self or main.get("world") != _world or owner.get_script() == null or owner.get_script().resource_path != "res://scripts/native_source_new_run_state.gd":
		result.reason="current_source_lmb_owner_lost"
		return result
	if _native_character_selection_requested and get_native_character_profile_snapshot().get("ready")!=true:
		result.reason="current_character_selection_not_ready"
		return result
	var current: Variant = _native_attack_selection_reader.call()
	if not current is Dictionary:
		result.reason="current_source_p_not_ready"
		return result
	result.selection_present=current.has("activeLMBSk")
	var selection: Variant = current.get("activeLMBSk")
	result.skill=selection if selection == null or selection is String or selection is StringName or selection is int or selection is float or selection is bool else "non_scalar_selection"
	var ki_selected: bool = (selection is String or selection is StringName) and str(selection)=="kiSlash"
	if not ki_selected:
		# Original R stCost('weapon') else5 + ordinary wSwing. This is not
		# a KiSlash fallback; the separate whirlwind-held owner remains a gap.
		result.ready=true
		result.castable=true
		result.weapon_cost=5.0
		result.route="basic_melee"
		result.held_skill_owner_gap="whirlwind" if (selection is String or selection is StringName) and str(selection)=="whirlwind" else null
		result.reason=""
		return result
	if not current.get("skills") is Dictionary:
		result.reason="current_ki_slash_skills_not_ready"
		return result
	var raw: Variant = current.skills.get("kiSlash")
	# Preserve the source's explicit P.skills.kiSlash || 1, including 0/null.
	var level: Variant = 1 if raw == null or (raw is bool and not raw) or ((raw is int or raw is float) and (float(raw)==0.0 or is_nan(float(raw)))) or (raw is String and raw.is_empty()) else raw
	if level is bool: level=1 if level else 0
	if not (level is int or level is float) or not is_finite(float(level)) or float(level) != floor(float(level)):
		result.reason="current_ki_slash_level_not_numeric"
		return result
	result.ready=true
	result.castable=true
	result.emit_ki_slash=true
	result.level=int(level)
	result.weapon_cost=10.0+(float(level)-1.0)*2.0
	result.route="kiSlash"
	result.reason=""
	return result

func get_native_attack_parameters() -> Dictionary:
	if not _native_attack_selection_bound:
		return {"ready":true,"authority":"standalone_prototype","melee_ref":melee_ref,"stat_str":stat_str,"p_atk_mul":attack_multiplier,"p_melee_mul":1.0,"basic_base_damage":int(floor((melee_ref+15.0)*6.0)),"basic_range":50.0,"basic_arc":0.95}
	if get_native_attack_selection_snapshot().get("ready")!=true:
		return {"ready":false,"reason":"current_attack_source_selection_not_ready"}
	var main: Node = get_parent()
	if not is_instance_valid(main) or main.is_queued_for_deletion() or not main.has_method("read_native_attack_parameters"):
		return {"ready":false,"reason":"actual_main_attack_parameters_missing"}
	return main.read_native_attack_parameters()

func get_native_attack_tempo() -> Dictionary:
	if not _native_attack_selection_bound:
		return {"ready":true,"authority":"standalone_prototype","swing_ticks":_swing_ticks,"recovery_ticks":_recovery_ticks,"render_recovery_ticks":_recovery_ticks,"render_windup_ticks":10,"e_render_recovery_ticks":28}
	var main: Node=get_parent()
	if not is_instance_valid(main) or main.is_queued_for_deletion() or not main.has_method("read_native_attack_tempo"):return {"ready":false,"reason":"actual_tempo_main_not_ready"}
	return main.read_native_attack_tempo()

func get_native_attack_tempo_snapshot() -> Dictionary:
	return {"sampled":not _current_attack_tempo.is_empty(),"tempo":_current_attack_tempo.duplicate(),"state":state,"state_left":_state_left,"recovery_at_entry":_recovery_ticks,"sprite_frame":_sprite.frame if is_instance_valid(_sprite) else null}

func _withdraw_native_attack_tempo() -> void:
	if state not in ["windup","swing","recover"]:return
	var previous: String=state
	state="idle"
	_state_left=0.0
	charge_frames=0.0
	_atk_bonus=0
	_blocked_until_release=true
	telemetry_event.emit("attack_tempo_withdrawn",{"previous_state":previous,"reason":_current_attack_tempo.get("reason")})

func request_attack() -> bool:
	_weapon_held = true
	if hp <= 0 or state != "idle" or _blocked_until_release:
		return false
	if _move_skills_block_idle_actions(): # G33042 사슬기동 중 행동 차단 (isAct('weapon') 미도달)
		return false
	var selection: Dictionary = get_native_attack_selection_snapshot() if _native_attack_selection_bound else {}
	if _native_attack_selection_bound and selection.get("ready") != true:
		_blocked_until_release=true
		telemetry_event.emit("active_lmb_rejected",selection)
		return false
	var is_ki_slash: bool = not _native_attack_selection_bound or selection.get("emit_ki_slash") == true
	var parameters: Dictionary = get_native_attack_parameters()
	if parameters.get("ready")!=true:
		telemetry_event.emit("attack_parameters_rejected",parameters)
		return false
	if _native_attack_selection_bound and is_ki_slash: ki_slash_level=int(selection.level)
	var cost: float = float(selection.weapon_cost) if _native_attack_selection_bound else attack_cost()
	if stamina < cost:
		telemetry_event.emit("stamina_insufficient", {"required": cost, "stamina": stamina})
		return false
	stamina -= cost
	telemetry_event.emit("attack_stamina_spent",{"cost":cost,"after":stamina})
	_atk_bonus = int(floor(cost * 1.5))
	_attack_direction = facing
	if is_ki_slash and combo_step == 2 and _combo_left > 0.0:
		state = "windup"
		charge_frames = 0.0
		_state_left = 999.0
		telemetry_event.emit("charge_started", {"step": 3, "cost": cost})
	else:
		if not _begin_swing((combo_step % 3) + 1, 0.0):
			stats_changed.emit()
			return false
	stats_changed.emit()
	return true

func release_attack() -> void:
	_weapon_held = false
	_accessibility_hold = false
	_blocked_until_release = false
	if state == "windup" and hp > 0:
		var held_frames: float = charge_frames
		charge_frames = 0.0
		_begin_swing(3, held_frames)
		stats_changed.emit()

func cancel_attack() -> bool:
	if hp <= 0 or state not in ["windup", "swing", "recover"]:
		return false
	var cancelled_state: String = state
	# The prototype ports cancellation only. No shield/parry/cost/cooldown is claimed.
	if state == "windup":
		combo_step = 0
		_combo_left = 0.0
	state = "idle"
	_state_left = 0.0
	charge_frames = 0.0
	_accessibility_hold = false
	_atk_bonus = 0
	_blocked_until_release = true
	telemetry_event.emit("attack_cancelled", {"previous_state": cancelled_state, "q_scope": "cancel_only", "emitted_crescents_preserved": true})
	stats_changed.emit()
	return true

func attack_cost() -> float:
	if _native_attack_selection_bound:
		var current: Dictionary = get_native_attack_selection_snapshot()
		return float(current.weapon_cost) if current.get("ready") == true else INF
	var skill: Dictionary = combat.get("kiSlash", {})
	return float(skill.get("cost_base", 10.0)) + (ki_slash_level - 1) * float(skill.get("cost_per_level", 2.0))

func is_charging() -> bool:
	return state == "windup" and hp > 0

func charge_tier() -> int:
	return mini(3, int(floor(maxf(0.0, charge_frames) / _charge_step)))

func _begin_swing(step: int, held_frames: float) -> bool:
	var parameters: Dictionary = get_native_attack_parameters()
	if parameters.get("ready")!=true:
		if state=="windup": cancel_attack()
		telemetry_event.emit("attack_parameters_rejected",parameters)
		return false
	var selection: Dictionary = get_native_attack_selection_snapshot() if _native_attack_selection_bound else {}
	if _native_attack_selection_bound and selection.get("ready") != true:
		_blocked_until_release=true
		if state=="windup": cancel_attack()
		telemetry_event.emit("active_lmb_rejected",selection)
		return false
	var is_ki_slash: bool = not _native_attack_selection_bound or selection.get("emit_ki_slash") == true
	if _native_attack_selection_bound and is_ki_slash: ki_slash_level=int(selection.level)
	var tempo: Dictionary=parameters.get("tempo",{}) if _native_attack_selection_bound else get_native_attack_tempo()
	if tempo.get("ready")!=true:
		_current_attack_tempo=tempo
		_withdraw_native_attack_tempo()
		return false
	_current_attack_tempo=tempo
	_swing_ticks=float(tempo.swing_ticks)
	_native_attack_audio_serial+=1
	state = "swing"
	_state_left = _swing_ticks
	telemetry_event.emit("attack_tempo_started",{"swing_ticks":_swing_ticks,"tempo":tempo.duplicate()})
	_melee_contact_done = false
	_attack_direction = facing
	if is_ki_slash:
		combo_step = step
		var skill: Dictionary = combat.get("kiSlash", {})
		_combo_left = float(skill.get("combo_ticks", 120.0))
		_crescent_cooldown = 20.0 if step == 3 else 12.0
		_request_native_attack_sound("start",step)
		crescent_requested.emit(step, held_frames, _attack_direction)
		telemetry_event.emit("kiSlash_fired", {"step": step, "charge_frames": held_frames, "direction": _attack_direction})
	else:
		_request_native_attack_sound("start",0)
		telemetry_event.emit("basic_melee_started", {"source_selection":selection.get("skill"),"weapon_cost":selection.get("weapon_cost"),"ki_slash_emitted":false})
	return true

func _physics_process(delta: float) -> void:
	var fireball_entered_state: String=state
	var ticks: float = delta * 60.0
	_clock_frames += ticks
	if is_instance_valid(_native_move_skills):
		_native_move_skills.advance_pre(ticks) # G32155–32576 S16b 사슬/전격 블록 (iframes 감소 G32775 앞)
	iframes = maxf(0.0, iframes - ticks)
	if is_instance_valid(_native_move_skills):
		_native_move_skills.advance_post_iframes() # G32784–32786
	if is_instance_valid(_native_combat_qe) and is_instance_valid(_world):
		var context: Dictionary = _world.get_native_projectile_fx_context()
		_native_combat_qe.advance_native(context["dt_sp"], _world.get_native_frame(), _world.get_native_world_identity())
	elif is_instance_valid(_native_q_control) and is_instance_valid(_world):
		var context: Dictionary = _world.get_native_projectile_fx_context()
		_native_q_control.advance_q_control(context.dt_sp,_world.get_native_frame(),_world.get_native_world_identity())
	if hp <= 0:
		velocity = Vector2.ZERO
		return
	var aim: Vector2 = get_global_mouse_position() - global_position
	if _native_ground_pointer_bound:
		var pointer: Variant = _native_ground_pointer.call() if _native_ground_pointer.is_valid() else null
		aim = pointer.world - global_position if pointer is Dictionary and pointer.get("ready") == true and pointer.get("world") is Vector2 else Vector2.ZERO
	if aim.length_squared() > 1.0:
		facing = aim.normalized()
	if _native_attack_selection_bound and (is_instance_valid(_native_combat_qe) or is_instance_valid(_native_q_control)):
		if _native_input_held.get("parry",false) and state in ["idle","windup","swing","recover","sRecover"]:
			_request_native_q_input()
		elif not _native_input_held.get("parry",false) and state in ["sBlock","peaceShield"] and is_instance_valid(_native_combat_qe):
			_native_combat_qe.release_shield()
	if _native_attack_selection_bound and state in ["windup","swing","recover","sDraw","kiGather","sBash","sRecover"]:
		_current_attack_tempo=get_native_attack_tempo()
		if _current_attack_tempo.get("ready")!=true:_withdraw_native_attack_tempo()
	var began_attack_in_physics: bool=false
	var held: bool = _weapon_held or _accessibility_hold or (Input.is_action_pressed("weapon") if not _native_attack_selection_bound else false)
	if not held:
		_blocked_until_release = false
	if state == "idle" and held and not _blocked_until_release:
		began_attack_in_physics=request_attack()
	if is_instance_valid(_native_q_control) and is_instance_valid(_world):
		var context: Dictionary = _world.get_native_projectile_fx_context()
		_native_q_control.advance_e_control(context.dt_sp,_world.get_native_frame(),_world.get_native_world_identity())
	var before_stamina: float = stamina
	if _native_resource_regeneration_bound:
		# A lost supplier must stop regeneration rather than revive the partial
		# fallback or apply both source and prototype rates in the same tick.
		if is_instance_valid(_native_resource_regeneration) and is_instance_valid(_world):
			var context: Dictionary = _world.get_native_projectile_fx_context()
			_native_resource_regeneration.advance_native(context["dt_sp"], _world.get_native_frame(), _world.get_native_world_identity())
	else:
		var divisor: float = 8.0 if state == "idle" else 16.0
		stamina = minf(max_stamina, stamina + _stamina_regen_base / divisor * ticks)
	var move_input: Vector2 = Vector2(float(_native_input_held.get("move_right",false))-float(_native_input_held.get("move_left",false)),float(_native_input_held.get("move_down",false))-float(_native_input_held.get("move_up",false))).normalized() if _native_attack_selection_bound else Input.get_vector("move_left", "move_right", "move_up", "move_down")
	# switch(P.s)는 case 선택 시점 상태로 한 번 갈린다: 이동 owner가 이 틱에 상태를 바꿔도(착지→idle,
	# 경직 탈출→idle) 보행·idle 체크포인트는 다음 틱부터다(G32987 switch / G34333 break).
	var switch_state: String = state
	if is_instance_valid(_native_move_skills):
		switch_state = _native_move_skills.advance_state(ticks) # G32985 이동 틱 + case bladeDash(G33943)·stagger(G34333)·pStun(G34341)
	if switch_state in GIANT_SLAM_STATES:
		_advance_native_giant_slam_state(ticks)
	var speed_scale: float = 1.0 if switch_state == "idle" else (0.0 if switch_state in ["stagger", "pStun", "iceOrb", "bladeDash"] else (0.35 if switch_state in GIANT_SLAM_STATES else 0.8)) # P2-005d: 33040 얼음보주 전행동 차단 / PC-MOVE-SKILLS: case 'bladeDash'는 보행 없음
	if is_instance_valid(_native_q_control) and _native_q_control.is_native_q_control_ready() and (state=="sBlock" or _native_q_control.q_movement_scale==0.0):speed_scale=_native_q_control.q_movement_scale
	# Native _freezeSlow is consumed inside the entered idle case, before
	# its positive-value half-speed check. Attack/stun/recovery clocks freeze it.
	if state == "idle" and switch_state == "idle":
		# Native status components observe the actual entered idle checkpoint.
		native_idle_status_tick.emit(ticks)
		_native_freeze_slow_ticks = maxf(0.0, _native_freeze_slow_ticks - ticks)
		if _native_freeze_slow_ticks > 0.0:
			speed_scale *= 0.5
	velocity = move_input * _movement_speed * speed_scale
	if is_instance_valid(_native_q_control):
		var e_move: Dictionary = _native_q_control.get_native_e_movement(move_input,_movement_speed)
		if e_move.owned:velocity=e_move.velocity
	var previous_position: Vector2 = global_position
	var wall_contact: bool = false
	if is_instance_valid(_world) and _world.has_method("can_move"):
		# PC-COMBAT-KILL/보행: 원본 이동은 물리 바디가 아니라 canMv(x,y,P.r)만 본다.
		#  G32762 넉백: nx=P.x+kb.x*.5*sp, ny=… → canMv(nx,ny) 통과 시에만 두 축 함께, 그 뒤 kb*=.65**sp.
		#  G33022~33028 보행: ms=(P.speed+bt().spd)*sp → canMv(nx,P.y)면 x, 이어 canMv(P.x,ny)면 y (축 분리).
		# 일반 적 몸체(layer 4)·근사 물리벽(rect/원/언덕 shape)과의 move_and_slide 접촉은 원본에 없다
		# (플레이어-적 밀어내기는 보스 e.ib 34349만 — native_demo11_boss_core._push_player_out_of_body).
		if absf(_knockback.x) > 0.1 or absf(_knockback.y) > 0.1:
			var kb_to: Vector2 = global_position + _knockback * 0.5 * ticks
			if _world.can_move(kb_to, radius):
				global_position = kb_to
			_knockback *= pow(0.65, ticks)
		var walk_step: Vector2 = velocity * delta
		if walk_step.x != 0.0:
			var to_x := Vector2(global_position.x + walk_step.x, global_position.y)
			if _world.can_move(to_x, radius): global_position = to_x
			else: wall_contact = true
		if walk_step.y != 0.0:
			var to_y := Vector2(global_position.x, global_position.y + walk_step.y)
			if _world.can_move(to_y, radius): global_position = to_y
			else: wall_contact = true
	else:
		# World/canMv owner가 없는 독립 프로토타입 경로만 종전 물리 이동을 유지한다.
		if absf(_knockback.x) > 0.1 or absf(_knockback.y) > 0.1:
			velocity += _knockback * 0.5 * 60.0
			_knockback *= pow(0.65, ticks)
		var mask_saved: int = collision_mask
		if is_instance_valid(_native_move_skills) and _native_move_skills.passes_through_enemies():
			collision_mask = 1
		move_and_slide()
		collision_mask = mask_saved
		for index in range(get_slide_collision_count()):
			var contact: KinematicCollision2D = get_slide_collision(index)
			var collider = contact.get_collider()
			if collider is CollisionObject2D and (collider.collision_layer & 1) != 0:
				wall_contact = true
	if wall_contact and not _was_wall_contact:
		telemetry_event.emit("wall_contact", {"position": global_position, "velocity": velocity, "collisions": get_slide_collision_count()})
	_was_wall_contact = wall_contact
	if is_instance_valid(_native_q_control) and is_instance_valid(_world):_native_q_control.finish_e_control(_world.get_native_frame())
	if is_instance_valid(_native_move_skills):
		_native_move_skills.advance_state_after_move() # G33032–33039 idle(보행 뒤)·G33747 sBlock 트리거 소비
	var moved: float = global_position.distance_to(previous_position)
	_walk_distance += moved
	_was_moving = moved > 0.001
	# Original _walkFacing follows the actual completed displacement, while
	# facing remains the independent pointer/attack direction.
	if _was_moving:
		_walk_visual_direction = (global_position - previous_position).normalized()
	if state == "idle" and switch_state == "idle":
		# The native _rbBurn loop belongs to the entered idle case. Walking
		# keeps this state; other cases returning to idle wait until next tick.
		_tick_native_burns(ticks)
	elif state == "windup":
		_attack_direction = facing
		var previous_tier: int = charge_tier()
		charge_frames = minf(_charge_max, charge_frames + ticks)
		if charge_tier() > previous_tier:
			telemetry_event.emit("charge_tier", {"tier": charge_tier(), "frames": charge_frames, "multiplier": pow(2.0, charge_tier())})
			if charge_tier() == 3:
				_full_charge_flash()
		if not held:
			release_attack()
	elif state == "swing" and not began_attack_in_physics:
		_state_left -= ticks
		if not _melee_contact_done and _swing_ticks - _state_left >= 2.0:
			_melee_contact_done = true
			_melee_contact()
		if _state_left <= 0.0:
			var tempo: Dictionary=get_native_attack_tempo()
			if tempo.get("ready")!=true:
				_current_attack_tempo=tempo
				_withdraw_native_attack_tempo()
			else:
				_current_attack_tempo=tempo
				_recovery_ticks=float(tempo.recovery_ticks)
				state = "recover"
				_state_left = _recovery_ticks
				telemetry_event.emit("attack_recovery_started",{"recovery_ticks":_recovery_ticks,"tempo":tempo.duplicate()})
	elif state == "recover":
		_state_left -= ticks
		if _state_left <= 0.0:
			state = "idle"
			telemetry_event.emit("attack_recovered",{"recovery_at_entry":_recovery_ticks})
	elif state in ["stagger", "pStun"]:
		_state_left -= ticks
		if _state_left <= 0.0:
			if state == "pStun":
				poise = max_poise
				iframes = 60.0
				telemetry_event.emit("player_stun_ended", {"poise": poise, "iframes": iframes})
			state = "idle"
			stats_changed.emit()
	if _crescent_cooldown > 0.0:
		_crescent_cooldown -= ticks
	if _combo_left > 0.0:
		_combo_left -= ticks
		if _combo_left <= 0.0:
			combo_step = 0
	if stamina != before_stamina or state == "windup":
		stats_changed.emit()
	var magic_blocked: bool = _move_skills_block_idle_actions() and fireball_entered_state == "idle" # G33042: 사슬기동 중 isHeld('beam') 미도달
	if is_instance_valid(_world) and not magic_blocked and (_native_input_held.get("native_magic",false) or fireball_entered_state in ["magicCast","magicRecover"] or state in ["magicCast","magicRecover"]):
		var fireball_context: Dictionary=_world.get_native_projectile_fx_context()
		native_fireball_phase_tick.emit(fireball_context.dt_sp,_world.get_native_frame(),fireball_entered_state)

# PC-SKILL-STATES — 거인강타 상태(원본 46460 P.s='gSlamWindup';P.st2=10 / 33949~33960):
# case gSlamWindup|gSlam1|gSlamRecover — 보행 (P.speed+bt().spd)×sp×.35, st2 소진 시
# Windup→gSlam1(st2 10)→gSlamRecover(st2 12)→idle. 피해는 시전 즉시(46462 '즉시 히트')라 스킬 슬롯이 이미 처리.
# 이 상태 동안 공격·다른 슬롯은 state!=idle 게이트로 막힌다(원본과 같음).
const GIANT_SLAM_STATES: Array[String] = ["gSlamWindup", "gSlam1", "gSlamRecover"]
var _gsl_st2: float = 0.0
func enter_native_giant_slam_state() -> bool:
	if hp <= 0.0 or state in ["fallen", "dead"]:
		return false
	state = "gSlamWindup"
	_gsl_st2 = 10.0
	stats_changed.emit()
	return true

func _advance_native_giant_slam_state(ticks: float) -> void:
	_gsl_st2 -= ticks # 32792 P.st2-=sp
	if state == "gSlamWindup" and _gsl_st2 <= 0.0:
		state = "gSlam1"; _gsl_st2 = 10.0
	elif state == "gSlam1" and _gsl_st2 <= 0.0:
		state = "gSlamRecover"; _gsl_st2 = 12.0
	elif state == "gSlamRecover" and _gsl_st2 <= 0.0:
		state = "idle"

# P2-005d — 얼음보주 상태 전환(46758 P.s='iceOrb' / 46819 P.s='idle'): 소유=스킬 슬롯 어댑터,
# idle↔iceOrb 왕복만 허용. 상태 'iceOrb'는 이동 0(741)·공격 차단(state!=idle 579)·피격 무적(876).
func set_native_ice_orb_state(active: bool) -> bool:
	if active:
		if state != "idle" and state not in GIANT_SLAM_STATES: # 46758 P.s='iceOrb'는 거인강타 상태도 덮어쓴다
			return false
		state = "iceOrb"
	else:
		if state != "iceOrb":
			return false
		state = "idle"
	stats_changed.emit()
	return true

func receive_damage(amount: int, damage_type: String = "phys", source_direction: Vector2 = Vector2.ZERO, native_knockback_strength: float = -1.0) -> void:
	_apply_native_damage(amount, amount, damage_type, source_direction, native_knockback_strength)

func get_native_e_control_snapshot() -> Dictionary:
	return _native_q_control.get_e_control_snapshot() if is_instance_valid(_native_q_control) else {"ready":false,"scope":"E_CONTROL_PARTIAL","reason":"e_owner_not_bound"}

func try_native_q_projectile_reflection(projectile: Node, distance: float) -> Dictionary:
	if hp<=0.0 or not is_instance_valid(_native_q_control):return {"reflected":false,"reason":"actual_q_owner_not_ready"}
	return _native_q_control.resolve_q_control_projectile(projectile,distance)

func receive_native_projectile_contact(projectile: Object, raw_amount: int, damage_type: String = "phys", source_direction: Vector2 = Vector2.ZERO, native_knockback_strength: float = -1.0) -> Dictionary:
	# Contact admission precedes every QE mutation. Original carrier damage is
	# distinct from raw_amount (the projectile's resolved hurtP request).
	if hp <= 0:
		return {"accepted": false, "reflected": false, "reason": "player_damage_gate"}
	# Source Q-active reflection can be admitted during an existing iframe.
	# This exception never bypasses the HP pipeline's ordinary damage gate.
	if iframes > 0.0:
		var q_admission: Variant = _native_combat_qe.allows_native_qe_iframe_reflection() if is_instance_valid(_native_combat_qe) else false
		if not q_admission is bool or not q_admission:
			return {"accepted": false, "reflected": false, "reason": "player_damage_gate"}
	if not is_instance_valid(projectile) or raw_amount < 0:
		return {"accepted": false, "reflected": false, "reason": "invalid_projectile_contact"}
	var reduced_amount = raw_amount
	var reaction = 0
	if is_instance_valid(_native_combat_qe):
		var result: Dictionary = _native_combat_qe.resolve_native_contact(projectile, raw_amount, false)
		if result.get("ready") != true or result.get("accepted") != true:
			return {"accepted": false, "reflected": false, "reason": result.get("error", "qe_contact_not_ready")}
		reaction = int(result["reaction"])
		if reaction == 2: # CombatQEProducer.Reaction.PARRY_REFLECT_BLUE
			return {"accepted": true, "reflected": true, "reaction": reaction, "damage_applied": 0}
		if result.get("reduced") is Dictionary:
			var reduced: Dictionary = result["reduced"]
			reduced_amount = int(reduced["dmg"])
			# The shield failure already consumed its initial poise penalty.
			# Enter pStun now so the later ordinary-hit guard keeps source order.
			if reduced["stunned"]:
				_enter_native_hit_stun()
	var hp_before = hp
	_apply_native_damage(reduced_amount, raw_amount, damage_type, source_direction, native_knockback_strength)
	return {"accepted": true, "reflected": false, "reaction": reaction, "damage_applied": hp_before - hp}

func _apply_native_damage(amount: int, raw_amount: int, damage_type: String, source_direction: Vector2, native_knockback_strength: float) -> void:
	if hp <= 0 or iframes > 0.0:
		return
	if state == "iceOrb": # P2-005d — 34889s 전 피격 경로의 !P._ioActive 무적 게이트
		return
	if not is_instance_valid(_native_combat_qe) and is_instance_valid(_native_q_control) and state=="sBlock" and damage_type in ["phys","magic","parry"]:
		var q_reaction: Dictionary = _native_q_control.resolve_q_control_damage(amount,false)
		if q_reaction.get("ready")==true:
			amount=int(q_reaction.reduced.dmg)
			if q_reaction.reduced.stunned:_enter_native_hit_stun()
	var defence: float = energy_def if damage_type in ["magic", "parry"] else base_def
	var reduction: float = minf(0.75, defence / (defence + 2500.0))
	var capped: int = mini(amount, int(floor(max_hp * 0.33)))
	var final_damage: int = maxi(maxi(1, int(floor(max_hp * 0.005))), int(floor(capped * (1.0 - reduction))))
	hp = maxf(0.0, hp - final_damage)
	# Literal native non-DOT hurtP resets iframe to zero AFTER its cap calculation.
	# Do not invent ordinary-hit/cap invulnerability from the earlier stale doc note.
	iframes = 0.0
	if state != "pStun":
		poise = maxi(0, poise - 1)
		if poise <= 0:
			_enter_native_hit_stun()
		elif not is_charging():
			state = "stagger"
			_state_left = 6.0
	# Native projectile opts.knockback replaces the generic impulse calculation;
	# both paths add their impulse only after the existing hurtP acceptance gates.
	var strength: float = native_knockback_strength if native_knockback_strength >= 0.0 else clampf(float(final_damage) / max_hp * 30.0, 1.0, 12.0)
	var push: Vector2 = source_direction.normalized() if source_direction.length_squared() > 0.0 else Vector2.from_angle(randf() * TAU)
	_knockback += push * strength
	telemetry_event.emit("player_damage", {"raw_amount": raw_amount, "amount": final_damage, "damage_type": damage_type, "hp": hp, "poise": poise, "iframes": iframes, "charging_preserved": is_charging(), "defence": defence})
	if hp == 0:
		state = "dead"
		charge_frames = 0.0
		_weapon_held = false
		_accessibility_hold = false
		velocity = Vector2.ZERO
		telemetry_event.emit("player_died", {"emitted_crescents_preserved": true})
	stats_changed.emit()

func _enter_native_hit_stun() -> void:
	state = "pStun"
	_state_left = 240.0
	charge_frames = 0.0
	combo_step = 0
	_combo_left = 0.0
	_accessibility_hold = false
	telemetry_event.emit("player_stunned", {"ticks": 240.0, "charge_interrupted": true, "emitted_crescents_preserved": true})

func apply_native_posthurt_knockback(impulse: Vector2) -> void:
	# The source teleport landing adds this impulse after hurtP, independently
	# of hurtP acceptance. Preserve its existing default impulse and guards.
	_knockback += impulse

func get_native_knockback() -> Vector2:
	return _knockback

func bind_native_armor_inventory(reader: Callable) -> bool:
	if _native_armor_element != null or not reader.is_valid() or reader.get_argument_count() != 0:
		return false
	var provider = NativeArmorElementScript.new()
	if not provider.configure_inventory_reader(reader):
		return false
	_native_armor_element = provider
	return true

func get_native_element_multiplier(attacker_element_id: int) -> float:
	# The provider reads current INV.equipped.armor on every hit, without copies.
	# Unbound, missing, null or lost inventory keeps the existing neutral1.
	return _native_armor_element.get_native_element_multiplier(attacker_element_id) if is_instance_valid(_native_armor_element) else 1.0

func get_snapshot() -> Dictionary:
	return {"attack_tempo":get_native_attack_tempo_snapshot(),"hp": hp, "max_hp": max_hp, "stamina": stamina, "max_stamina": max_stamina, "state": state, "combo_step": combo_step, "charge_frames": charge_frames, "charge_tier": charge_tier(), "damage_multiplier": pow(2.0, charge_tier()), "position": global_position, "melee_ref": melee_ref, "q_scope": ("Q_CONTROL_PARTIAL" if get_native_q_control_snapshot().get("ready") == true else "Q_CONTROL_NOT_READY") if is_instance_valid(_native_q_control) else "cancel_only", "accessibility_hold": _accessibility_hold, "poise": poise, "max_poise": max_poise, "iframes": iframes, "base_def": base_def, "energy_def": energy_def, "burn_stacks": get_native_burn_snapshot(), "freeze_slow_ticks": get_native_freeze_slow_ticks()}

func apply_native_freeze_slow(duration_ticks: float) -> bool:
	# Water-bean posthit applies independently after hurtP, including a lethal
	# or internally rejected request. This does not change state or hurtP gates.
	var previous = _native_freeze_slow_ticks
	_native_freeze_slow_ticks = maxf(_native_freeze_slow_ticks, duration_ticks)
	var extended = _native_freeze_slow_ticks > previous
	telemetry_event.emit("native_freeze_slow_applied", {"requested_ticks": duration_ticks, "previous_ticks": previous, "remaining_ticks": _native_freeze_slow_ticks, "extended": extended})
	stats_changed.emit()
	return extended

func get_native_freeze_slow_ticks() -> float:
	return _native_freeze_slow_ticks

func apply_native_burn(total_damage: float) -> bool:
	# Called after the existing redBean generic-contact path, independently
	# of hurtP acceptance or lethal HP damage. Source cap ignores new stacks.
	if _native_burns.size() >= NATIVE_BURN_MAX_STACKS:
		return false
	_native_burns.append({"total": total_damage, "t": NATIVE_BURN_DURATION_TICKS, "tick": 0.0})
	telemetry_event.emit("native_burn_applied", {"total": total_damage, "t": NATIVE_BURN_DURATION_TICKS, "tick": 0.0, "stack_count": _native_burns.size()})
	stats_changed.emit()
	return true

func get_native_burn_snapshot() -> Array[Dictionary]:
	return _native_burns.duplicate(true)

func _tick_native_burns(ticks: float) -> void:
	var surviving: Array[Dictionary] = []
	# Do not re-check state after an earlier stack kills the player: the
	# entered native idle loop still consumes each remaining stack's clock.
	for index in range(_native_burns.size()):
		var burn: Dictionary = _native_burns[index]
		burn["t"] = float(burn["t"]) - ticks
		burn["tick"] = float(burn["tick"]) + ticks
		if float(burn["t"]) <= 0.0:
			telemetry_event.emit("native_burn_expired", {"index": index, "total": burn["total"], "t": burn["t"], "tick": burn["tick"]})
			continue
		if float(burn["tick"]) >= NATIVE_BURN_INTERVAL_TICKS:
			# Exactly one request; source resets to zero rather than retaining
			# overshoot or synthesizing a while-loop of scheduled pulses.
			burn["tick"] = 0.0
			var raw_damage: int = maxi(1, int(float(burn["total"]) / NATIVE_BURN_POOL_DIVISOR))
			var hp_damage: int = _receive_native_burn_damage(raw_damage)
			telemetry_event.emit("native_burn_pulse", {"index": index, "total": burn["total"], "t": burn["t"], "tick": burn["tick"], "raw_amount": raw_damage, "amount": hp_damage, "accepted": hp_damage > 0, "dot": true, "burn": true, "src": "화상"})
		surviving.append(burn)
	_native_burns = surviving

func _receive_native_burn_damage(amount: int) -> int:
	if hp <= 0 or state in ["fallen", "dead"] or iframes > 0.0:
		return 0
	# Raw/no-equipment native hurtP opts={dot:true,burn:true,src:'화상'}.
	# Keep direct-hit receive_damage and all of its consumers unchanged.
	var reduction: float = minf(0.75, base_def / (base_def + 2500.0))
	var capped: int = mini(amount, int(floor(max_hp * 0.33)))
	var final_damage: int = maxi(maxi(1, int(floor(max_hp * 0.005))), int(floor(capped * (1.0 - reduction))))
	hp = maxf(0.0, hp - final_damage)
	iframes = 0.0
	# DOT skips poise, stagger/stun, knockback, bite and attack cancellation.
	telemetry_event.emit("player_damage", {"raw_amount": amount, "amount": final_damage, "damage_type": "phys", "hp": hp, "poise": poise, "iframes": iframes, "charging_preserved": is_charging(), "defence": base_def, "dot": true, "burn": true, "src": "화상"})
	if hp == 0:
		# Existing terminal-death consumer; full fallen/revival remains absent.
		# Retain the burn array, as native die does, and stop future idle ticks.
		state = "dead"
		_weapon_held = false
		_accessibility_hold = false
		velocity = Vector2.ZERO
		telemetry_event.emit("player_died", {"emitted_crescents_preserved": true, "dot": true, "burn": true, "burn_stacks_retained": true})
	stats_changed.emit()
	return final_damage

func _melee_contact() -> void:
	if not is_instance_valid(_world) or not _world.has_method("get_enemies"):
		_atk_bonus = 0
		return
	var parameters: Dictionary = get_native_attack_parameters()
	if parameters.get("ready")!=true:
		_atk_bonus=0
		telemetry_event.emit("attack_parameters_rejected",parameters)
		return
	_request_native_attack_sound("hit_arc",0)
	# R wSwing -> hitArc weapon; current base/weapon, then current passive mul.
	var amount: int = preload("res://port_modules/combat_stat_formula/producer.gd").js_to_int32(float(parameters.basic_base_damage)*float(parameters.p_atk_mul)*float(parameters.p_melee_mul)) + _atk_bonus
	_atk_bonus = 0
	telemetry_event.emit("melee_contact_resolved",{"damage":amount,"range":parameters.basic_range,"arc":parameters.basic_arc,"authority":parameters.get("authority")})
	# P1-002.E/F: hurtE owner API를 가진 일반 적(generic enemy.gd + 전용 4종)은
	# 원본 hurtE(42110~) 경로. 그 외(hurtE owner 미보유)는 기존 receive_damage 경로
	# 유지. hurtE 경로가 정지(NOT_READY/owner 불일치/미이식 분기 활성)하면 단순화
	# 경로로 폴백하지 않는다 — 그 타격은 정지 지점까지만 적용.
	var main: Node = get_parent()
	var attack_element: Dictionary = {}
	for candidate in _world.get_enemies():
		if not is_instance_valid(candidate) or not candidate is Node2D:
			continue
		var enemy: Node2D = candidate
		if "hp" in enemy and int(enemy.get("hp")) <= 0:
			continue
		var target_radius: float = float(enemy.get("radius")) if "radius" in enemy else 15.0
		var offset: Vector2 = enemy.global_position - global_position
		if offset.length() <= float(parameters.basic_range) + target_radius and absf(_attack_direction.angle_to(offset)) < float(parameters.basic_arc):
			if _has_native_hurte_owner_api(enemy):
				if attack_element.is_empty():
					attack_element = NORMAL_HURTE.resolve_basic_attack_element(main)
				if attack_element.get("ready") != true:
					telemetry_event.emit("native_hurte_halt", attack_element)
					continue
				# 원본 37617 opts 그대로 (P1-002.G: opts는 실행자 인자).
				var outcome: Dictionary = NORMAL_HURTE.new().execute(main, _world, enemy, amount, offset.angle(), int(attack_element.value),
					{"kbMult": 1.0, "poiseMult": 1.5, "noPoise": false, "poiseHit": false, "poiseSkill": false, "_lessonAttack": "weapon"})
				outcome["enemy_id"] = enemy.get_instance_id()
				outcome["base_damage"] = amount
				telemetry_event.emit("native_hurte", outcome)
			elif enemy.has_method("receive_damage"):
				enemy.receive_damage(amount, offset.normalized(), "weapon")
				telemetry_event.emit("melee_hit", {"damage": amount, "enemy_id": enemy.get_instance_id()})

func _has_native_hurte_owner_api(enemy: Node) -> bool:
	for method in NORMAL_HURTE_OWNER_METHODS:
		if not enemy.has_method(method):
			return false
	return true

func _full_charge_flash() -> void:
	var flash = HIT_EFFECT.new()
	get_parent().add_child(flash)
	flash.configure(global_position, _attack_direction, 627.0 * 0.26, 2, 2.0)

func _native_character_definition(index: int) -> Dictionary:
	if index != 0 and index != 1: return {}
	var silver: bool = index==1
	var clocks := ["6","5","3","1","12","11","9","7"]
	var paths: Array = []
	for direction in range(8):
		paths.append("res://assets/player_silvertail/"+clocks[direction]+".png" if silver else "res://assets/player/"+DIRECTIONS[direction]+".png")
	return {"index":index,"id":"exoduser_silvertail" if silver else "exoduser_warrior",
		"name":"실버테일" if silver else "엑소듀서 전사","body_paths":paths,
		"idle_frames":2,"walk_frames":4 if silver else 8,"source_attack_frames":4 if silver else 8,
		"source_attack_offset":6 if silver else 10,"attack_frames":9,
		"attack_path":"res://assets/player_silvertail/attack-spin-v2.png" if silver else "res://assets/player/attack-bat-v1.png",
		"attack_layout":"silver_spin_3x3" if silver else "warrior_bat_rows",
		"attack_size":Vector2(240,240) if silver else Vector2(720,640),
		"scale":1.3 if silver else 2.0,"body_anchor":Vector2(24,47),"attack_anchor":Vector2(40,58),
		"body_offset":Vector2(-24,-24),"attack_offset":Vector2(-40,-35),
		"camera_facing_artwork":true,"source_storage_restored":false,
		"source_frame_layout":"R CHAR_LIST + player-attack-remaster.js/warrior-bat-swing.js",
		"contact_basis":"native contact alignment of approved body48/remaster80 artwork; not source physics height",
		"color_processing_parity_verified":false,"quality_24_unique_frames_verified":false}

func get_native_character_choices() -> Array:
	var choices: Array = []
	for index in range(2):
		var profile: Dictionary = _native_character_definition(index)
		var available: bool = ResourceLoader.exists(profile.attack_path,"Texture2D")
		for path in profile.body_paths: available=available and ResourceLoader.exists(path,"Texture2D")
		choices.append({"index":index,"id":profile.id,"name":profile.name,"available":available,
			"reason":"" if available else "approved_source_profile_resources_missing"})
	return choices

func apply_native_character_selection(reader: Callable) -> Dictionary:
	if not reader.is_valid() or reader.get_argument_count()!=0 or reader.get_method()!="read_native_character_selection" or reader.get_object()!=get_parent():
		return {"ready":false,"reason":"actual_native_selection_reader_missing"}
	var selected: Variant = reader.call()
	if not selected is Dictionary or selected.get("ready")!=true or not selected.get("index") is int:
		return {"ready":false,"reason":"explicit_native_selection_not_ready"}
	var profile: Dictionary = _native_character_definition(selected.index)
	if profile.is_empty(): return {"ready":false,"reason":"unsupported_native_character"}
	_native_character_selection_requested=true
	_native_character_selection_reader=reader
	var sources: Array[Texture2D] = []
	for path in profile.body_paths:
		var texture: Texture2D = ResourceLoader.load(path,"Texture2D") as Texture2D
		var needed: float = (2+profile.walk_frames+profile.source_attack_frames)*48
		if texture==null or texture.get_height()!=48 or texture.get_width()<needed:
			_sprite.visible=false
			return {"ready":false,"reason":"approved_body_strip_not_ready","resource":path}
		sources.append(texture)
	var attack: Texture2D = ResourceLoader.load(profile.attack_path,"Texture2D") as Texture2D
	if attack==null or attack.get_size()!=profile.attack_size:
		_sprite.visible=false
		return {"ready":false,"reason":"approved_attack_remaster_not_ready","resource":profile.attack_path}
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	for direction_index in range(8):
		for mode in ["idle","walk","source_attack","attack"]:
			var animation: StringName = StringName(mode+"_"+DIRECTIONS[direction_index])
			frames.add_animation(animation)
			frames.set_animation_loop(animation,mode in ["idle","walk"])
			frames.set_animation_speed(animation,60.0/(48.0 if mode=="idle" else 8.0))
			var count: int = profile[mode+"_frames"]
			for frame in range(count):
				var atlas := AtlasTexture.new()
				if mode=="attack":
					atlas.atlas=attack
					if profile.index==1:
						var cell: int = 8 if direction_index==0 and frame==8 else posmod(8-direction_index+frame,8)
						atlas.region=Rect2((cell%3)*80,floori(float(cell)/3.0)*80,80,80)
					else: atlas.region=Rect2(frame*80,direction_index*80,80,80)
				else:
					atlas.atlas=sources[direction_index]
					var offset: int = 0 if mode=="idle" else (2 if mode=="walk" else profile.source_attack_offset)
					atlas.region=Rect2((offset+frame)*48,0,48,48)
				frames.add_frame(animation,atlas)
	_add_native_dash_flight_frames(frames,"res://assets/player_silvertail/dash-flight-v1.png" if profile.index==1 else "res://assets/player/dash-flight-v1.png")
	var fresh: Variant = reader.call()
	if not fresh is Dictionary or fresh.get("ready")!=true or fresh.get("index")!=profile.index:
		_sprite.visible=false
		return {"ready":false,"reason":"native_selection_changed_during_profile_load"}
	_native_character_profile=profile
	_sprite.sprite_frames=frames
	visual_scale=float(profile.scale)
	_sprite.scale=Vector2.ONE*visual_scale
	_idle_visual={"mode":"idle","frame":0,"ticks":0.0,"interval":8.0}
	_idle_visual_last_clock=_clock_frames
	_update_display()
	return get_native_character_profile_snapshot()

func get_native_character_profile_snapshot() -> Dictionary:
	var result := {"ready":false,"selection_applied":_native_character_selection_requested,"index":null,
		"reason":"explicit_native_character_not_selected","source_storage_restored":false}
	if not _native_character_selection_requested: return result
	if not _native_character_selection_reader.is_valid() or not is_inside_tree() or is_queued_for_deletion() or not is_instance_valid(_sprite) or _sprite.is_queued_for_deletion() or _sprite.get_parent()!=self:
		result.reason="native_character_selection_owner_lost"
		return result
	var current: Variant = _native_character_selection_reader.call()
	if not current is Dictionary or current.get("ready")!=true or _native_character_profile.is_empty() or current.get("index")!=_native_character_profile.index:
		result.reason="native_character_profile_not_synchronized"
		return result
	result=_native_character_profile.duplicate(true)
	result.ready=true
	result.selection_applied=true
	result.reason=""
	result.authority="native_explicit_ui_selection"
	return result

func _build_sprite() -> void:
	_sprite = AnimatedSprite2D.new()
	_sprite.name = "Warrior"
	_sprite.centered = false
	_sprite.scale = Vector2.ONE * visual_scale
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	var attack: Texture2D = load("res://assets/player/attack-bat-v1.png")
	for direction_index in range(8):
		var dir: String = DIRECTIONS[direction_index]
		var source: Texture2D = load("res://assets/player/" + dir + ".png")
		for mode in ["idle", "walk", "source_attack", "attack"]:
			var animation: StringName = StringName(mode + "_" + dir)
			frames.add_animation(animation)
			frames.set_animation_loop(animation, mode in ["idle", "walk"])
			var count: int = 2 if mode == "idle" else (9 if mode == "attack" else 8)
			var offset: int = 0 if mode == "idle" else (2 if mode == "walk" else 10)
			frames.set_animation_speed(animation, 60.0 / (48.0 if mode == "idle" else 8.0))
			for index in range(count):
				var atlas := AtlasTexture.new()
				atlas.atlas = attack if mode == "attack" else source
				atlas.region = Rect2(index * 80, direction_index * 80, 80, 80) if mode == "attack" else Rect2((offset + index) * 48, 0, 48, 48)
				frames.add_frame(animation, atlas)
	_add_native_dash_flight_frames(frames, "res://assets/player/dash-flight-v1.png")
	_sprite.sprite_frames = frames
	add_child(_sprite)

## WarriorDashFlight.apply (warrior-dash-flight.js): 384×512 시트, 행=s,se,e,ne,n,nw,w,sw(=DIRECTIONS), 64px×6프레임.
## dash_start=0~1, dash_fly=2~3, dash_land=4~5 — 프레임 선택은 _native_dash_pose가 한다.
func _add_native_dash_flight_frames(frames: SpriteFrames, path: String) -> void:
	if not ResourceLoader.exists(path, "Texture2D"):
		return
	var sheet: Texture2D = load(path)
	if sheet == null or sheet.get_size() != Vector2(384, 512):
		return # 원본도 크기가 다르면 기존 아틀라스 유지
	for direction_index in range(8):
		var animation: StringName = StringName("dash_" + DIRECTIONS[direction_index])
		frames.add_animation(animation)
		frames.set_animation_loop(animation, false)
		frames.set_animation_speed(animation, 60.0 / 4.0) # _apSpd 4 — 표시는 _apply_native_dash_pose가 프레임을 직접 고른다
		for index in range(6):
			var atlas := AtlasTexture.new()
			atlas.atlas = sheet
			atlas.region = Rect2(index * 64, direction_index * 64, 64, 64)
			frames.add_frame(animation, atlas)

func get_native_projection_metadata() -> Dictionary:
	# Read the selected native consumer and recorded source anchor; never use
	# transparent frame padding as the actor's ground contact.
	if not is_inside_tree() or not is_instance_valid(_sprite) or _sprite.is_queued_for_deletion() or _sprite.get_parent() != self or not _sprite.is_inside_tree() or _sprite.sprite_frames == null:
		return {"ready":false,"reason":"current_player_sprite_not_live"}
	var frames: SpriteFrames = _sprite.sprite_frames
	if not frames.has_animation(_sprite.animation) or _sprite.frame < 0 or _sprite.frame >= frames.get_frame_count(_sprite.animation):
		return {"ready":false,"reason":"current_player_frame_invalid"}
	var texture: Texture2D = frames.get_frame_texture(_sprite.animation,_sprite.frame)
	if texture == null: return {"ready":false,"reason":"current_player_texture_missing"}
	var size: Vector2 = texture.get_size()
	var selected: Dictionary = get_native_character_profile_snapshot()
	if _native_character_selection_requested and selected.get("ready")!=true:
		return {"ready":false,"reason":"current_character_projection_not_ready"}
	var profile: Dictionary = selected if selected.get("ready")==true else combat.get("player",{})
	var raw: Variant = profile.get("attack_anchor" if str(_sprite.animation).begins_with("attack_") else "body_anchor")
	if raw is Vector2: raw=[raw.x,raw.y]
	if not raw is Array or raw.size() != 2:
		return {"ready":false,"reason":"source_projection_anchor_missing"}
	for value in raw:
		if not (value is int or value is float) or not is_finite(float(value)):
			return {"ready":false,"reason":"source_projection_anchor_invalid"}
	var anchor := Vector2(float(raw[0]),float(raw[1]))
	if not size.is_finite() or size.x <= 0 or size.y <= 0 or anchor.x < 0 or anchor.y < 0 or anchor.x > size.x or anchor.y > size.y:
		return {"ready":false,"reason":"source_projection_anchor_outside_frame"}
	var display_anchor := Vector2(size.x-anchor.x if _sprite.flip_h else anchor.x,size.y-anchor.y if _sprite.flip_v else anchor.y)
	var local_foot: Vector2 = display_anchor+_sprite.offset-(size*0.5 if _sprite.centered else Vector2.ZERO)
	var world_foot: Vector2 = _sprite.to_global(local_foot)
	if not world_foot.is_finite() or not _sprite.global_scale.is_finite():
		return {"ready":false,"reason":"source_projection_transform_invalid"}
	return {"ready":true,"source":_sprite,"texture":texture,"frame_size":size,
		"source_anchor":anchor,"display_anchor":display_anchor,"world_foot":world_foot,
		"animation":str(_sprite.animation),"frame":_sprite.frame,"offset":_sprite.offset,
		"scale":_sprite.global_scale,"centered":_sprite.centered,"flip_h":_sprite.flip_h,"flip_v":_sprite.flip_v,
		"camera_facing_artwork":selected.get("ready")==true,"texture_filter":_sprite.texture_filter}

func _build_charge_display() -> void:
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	frames.add_animation("charge")
	for index in range(3):
		var atlas := AtlasTexture.new()
		atlas.atlas = SLASH_SHEET
		atlas.region = Rect2(index * 418, 0, 418, 418)
		frames.add_frame("charge", atlas)
	for index in range(2):
		var sprite := AnimatedSprite2D.new()
		sprite.sprite_frames = frames
		sprite.animation = "charge"
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		var material := ShaderMaterial.new()
		material.shader = ADDITIVE
		material.set_shader_parameter("hue_degrees", 0.0) # P2-007a 16744 색 변환 폐지
		sprite.material = material
		sprite.z_index = 10
		add_child(sprite)
		_charge_sprites.append(sprite)
	_charge_marks = Node2D.new()
	_charge_marks.z_index = 11
	_charge_marks.draw.connect(_draw_charge_marks)
	add_child(_charge_marks)

func _process(_delta: float) -> void:
	_update_display()

func _update_display() -> void:
	if _sprite == null:
		return
	var selected: Dictionary = get_native_character_profile_snapshot()
	if _native_character_selection_requested and selected.get("ready")!=true:
		_sprite.visible=false
		_idle_visual_last_clock=_clock_frames
		return
	_sprite.visible=true
	if state in GIANT_SLAM_STATES:
		_apply_giant_slam_display(selected)
		return
	var walking: bool = state == "idle" and _was_moving and hp > 0
	var dash_pose: Dictionary = _native_dash_pose(walking)
	if dash_pose.get("active") == true:
		_apply_native_dash_pose(dash_pose, selected)
		return
	_sprite.position = Vector2.ZERO
	_sprite.scale = Vector2.ONE * visual_scale
	_record_native_move_trail(false)
	var direction: Vector2 = _attack_direction if state in ["swing", "recover", "windup"] else (_walk_visual_direction if walking else facing)
	var direction_index: int = posmod(int(round((PI / 2.0 - direction.angle()) / (PI / 4.0))), 8)
	var mode: String = "attack" if state in ["windup", "swing", "recover","sDraw","kiGather","sBash","sRecover"] else ("walk" if walking else "idle")
	var animation: StringName = StringName(mode + "_" + DIRECTIONS[direction_index])
	if not _sprite.sprite_frames.has_animation(animation) or _sprite.sprite_frames.get_frame_count(animation)<=0:
		_sprite.visible=false
		_idle_visual_last_clock=_clock_frames
		return
	# Read the existing 60Hz owner once. Render-only calls with the same
	# clock cannot consume time again; no wall timer or independent clock.
	var visual_ticks: float=maxf(0.0,_clock_frames-_idle_visual_last_clock)
	_idle_visual_last_clock=_clock_frames
	if _idle_visual.mode!=mode:
		_idle_visual.mode=mode
		_idle_visual.frame=0
		_idle_visual.ticks=0.0
		_idle_visual.interval=48.0 if mode=="idle" else (12.0 if mode=="walk" else 8.0)
	if _sprite.animation != animation:
		_sprite.animation = animation
	# Native center stays P. Both source feet align at P.y + 23*visual_scale.
	_sprite.offset = (selected.attack_offset if mode=="attack" else selected.body_offset) if selected.get("ready")==true else (Vector2(-40,-35) if mode=="attack" else Vector2(-24,-24))
	if mode == "attack":
		if state in ["sDraw","kiGather","sBash","sRecover"]:
			var e_status: Dictionary = get_native_e_control_snapshot()
			var e_fields: Dictionary = e_status.get("fields",{}) if e_status.get("fields") is Dictionary else {}
			var left: float = float(e_fields.get("st2",0.0))
			if selected.get("ready")==true and selected.index==0:_sprite.frame=_native_warrior_e_frame(left)
			else:_sprite.frame=mini(6,maxi(0,int((20.0-left)*0.35))) if state=="sBash" else (7 if state=="sRecover" else 0)
		else:_sprite.frame = _attack_frame()
	elif mode == "walk":
		var walk_count: int = int(selected.walk_frames) if selected.get("ready")==true else 8
		_sprite.frame = posmod(int(floor(_walk_distance * walk_count / 256.0)),walk_count)
	elif state=="idle" and hp>0:
		# Source update adds its supplied step, then advances at most one cell.
		# Initial spd8 survives play('idle',48) while the base mode is unchanged.
		if visual_ticks>0.0:
			_idle_visual.ticks+=visual_ticks
			if _idle_visual.ticks>=_idle_visual.interval:
				_idle_visual.ticks-=_idle_visual.interval
				_idle_visual.frame=(int(_idle_visual.frame)+1)%_sprite.sprite_frames.get_frame_count(animation)
		_sprite.frame=int(_idle_visual.frame)
	else:
		# Other unported poses keep their existing presentation path.
		_sprite.frame=int(floor(_clock_frames/48.0))%2
	_sprite.modulate = Color(0.65, 0.65, 0.65, 1.0) if hp <= 0 else Color.WHITE
	for sprite in _charge_sprites:
		sprite.visible = is_charging()
	_charge_marks.visible = is_charging()
	if is_charging():
		var tier: int = charge_tier()
		var pulse: float = 1.0 + sin(_clock_frames / 60.0 * 25.0) * 0.035
		var width: float = (78.0 + tier * 13.0 + 4.0 * fmod(charge_frames, _charge_step) / _charge_step) * pulse
		for index in range(2):
			var sprite: AnimatedSprite2D = _charge_sprites[index]
			sprite.frame = int(floor(_clock_frames / 7.0)) % 3
			sprite.rotation = _attack_direction.angle()
			sprite.scale = Vector2(width * (0.96 if index == 0 else 0.82), width * (1.0 if index == 0 else 0.86)) / 418.0
			sprite.modulate.a = (0.24 + 0.08 * tier) if index == 0 else (0.58 + 0.08 * tier)
		_charge_marks.queue_redraw()

# Source G10570–10573 / G12024 / G58645: skill pose reads existing state only.
func _apply_giant_slam_display(selected: Dictionary) -> void:
	var direction_index: int = posmod(int(round((PI / 2.0 - facing.angle()) / (PI / 4.0))), 8)
	var recovering: bool = state == "gSlamRecover"
	var animation: StringName = StringName(("idle_" if recovering else "source_attack_") + DIRECTIONS[direction_index])
	_sprite.animation = animation
	var elapsed: float = (12.0 if recovering else (10.0 if state == "gSlamWindup" else 20.0)) - _gsl_st2
	_sprite.frame = posmod(int(floor(maxf(0.0, elapsed) / 8.0)), _sprite.sprite_frames.get_frame_count(animation))
	_sprite.position = Vector2(0, -18)
	_sprite.scale = Vector2.ONE * visual_scale
	_sprite.offset = selected.body_offset if selected.get("ready")==true else Vector2(-24,-24)
	_sprite.modulate = Color.WHITE
	_idle_visual_last_clock = _clock_frames
	_record_native_move_trail(false)
	for sprite in _charge_sprites:sprite.visible=false
	_charge_marks.visible=false

# ── PC-MOVE-SKILLS 렌더 (drawP atlas 분기 G58589–58716) ──
# MOTION.ez(4) elastic-out LUT (G3348–3381: N=256 Float32 LUT + 선형 보간)
static var _motion_elastic_lut: PackedFloat32Array = PackedFloat32Array()

static func _motion_elastic(t: float) -> float:
	if _motion_elastic_lut.is_empty():
		_motion_elastic_lut.resize(257)
		var c4: float = TAU / 3.0
		for i in range(257):
			var x: float = float(i) / 256.0
			_motion_elastic_lut[i] = 0.0 if x <= 0.0 else (1.0 if x >= 1.0 else pow(2.0, -10.0 * x) * sin((x * 10.0 - 0.75) * c4) + 1.0)
	if t <= 0.0: return _motion_elastic_lut[0]
	if t >= 1.0: return _motion_elastic_lut[256]
	var f: float = t * 256.0
	var i: int = int(f)
	var r: float = f - float(i)
	return _motion_elastic_lut[i] + (_motion_elastic_lut[i + 1] - _motion_elastic_lut[i]) * r

## G58590–58600 애니 선택 + WarriorDashFlight.direction/landing
func _native_dash_pose(walking: bool) -> Dictionary:
	if not is_instance_valid(_native_move_skills) or hp <= 0:
		return {"active": false}
	var pose: Dictionary = _native_move_skills.read_pose()
	var anim := ""
	if pose.harp_active and not pose.dash_active:
		anim = "dash_start" if int(pose.dash_phase) == 1 else "dash_fly"
	elif pose.dash_active:
		anim = "dash_fly"
	elif float(pose.harp_land_t) > 0.0 and state == "idle" and not walking: # WarriorDashFlight.landing(true,P.s,_apMv)
		anim = "dash_land"
	elif state == "bladeDash":
		anim = "dodge" # _P_ANIM_MAP.bladeDash='dodge' → 8방향 idle 프레임(G10571)
	if anim.is_empty():
		_dash_clip.anim = ""
		return {"active": false}
	var dir_angle: float = facing.angle()
	if anim.begins_with("dash"):
		var dv: Vector2 = pose.dash_v
		var hv: Vector2 = pose.harp_v
		if (pose.dash_active or float(pose.harp_land_t) > 0.0) and dv != Vector2.ZERO: dir_angle = dv.angle()
		elif pose.harp_active and hv != Vector2.ZERO: dir_angle = hv.angle()
	var lift: float = 0.0
	if anim.begins_with("dash") and pose.dash_active:
		lift = -12.0 * sin(PI * clampf(float(pose.dash_left) / maxf(1e-9, float(pose.pull_dur)), 0.0, 1.0))
	return {"active": true, "anim": anim, "dir_angle": dir_angle, "lift": lift, "bd_st2": float(pose.bd_st2)}

## SpriteAnimator.play/update (G10429–10432): spd 4(사슬)/8(dodge), dash_fly만 loop
func _apply_native_dash_pose(pose: Dictionary, selected: Dictionary) -> void:
	var anim: String = pose.anim
	var visual_ticks: float = maxf(0.0, _clock_frames - _idle_visual_last_clock)
	_idle_visual_last_clock = _clock_frames
	var spd: float = 4.0 if anim.begins_with("dash") else 8.0
	var count: int = 2
	if _dash_clip.anim != anim: # play(): 다른 애니면 f/t 초기화 → 같은 렌더에서 update() 1회
		_dash_clip = {"anim": anim, "f": 0, "t": 0.0, "done": false}
	if not _dash_clip.done:
		_dash_clip.t = float(_dash_clip.t) + visual_ticks
		if float(_dash_clip.t) >= spd:
			_dash_clip.t = float(_dash_clip.t) - spd
			_dash_clip.f = int(_dash_clip.f) + 1
			if int(_dash_clip.f) >= count:
				if anim == "dash_fly" or anim == "dodge": _dash_clip.f = 0
				else:
					_dash_clip.f = count - 1
					_dash_clip.done = true
	if anim == "dash_start" and _dash_clip.done:
		_native_move_skills.set_dash_phase_from_render(2) # G58621
	var direction_index: int = posmod(int(round((PI / 2.0 - pose.dir_angle) / (PI / 4.0))), 8)
	var base: String = "dash" if anim.begins_with("dash") else "idle"
	var animation := StringName(base + "_" + DIRECTIONS[direction_index])
	if not _sprite.sprite_frames.has_animation(animation):
		animation = StringName("idle_" + DIRECTIONS[direction_index])
		base = "idle"
	if _sprite.animation != animation:
		_sprite.animation = animation
	var offset_frame: int = {"dash_start": 0, "dash_fly": 2, "dash_land": 4}.get(anim, 0) if base == "dash" else 0
	_sprite.frame = mini(offset_frame + int(_dash_clip.f), _sprite.sprite_frames.get_frame_count(animation) - 1)
	_sprite.offset = Vector2(-32, -32) if base == "dash" else ((selected.body_offset if selected.get("ready") == true else Vector2(-24, -24)))
	_sprite.modulate = Color.WHITE
	_sprite.visible = true
	if anim == "dodge":
		# bladeDash 스쿼시 G58677–58682: MOTION.squash((12−st2)/12, .22), 발밑 고정 translate
		var k: float = (1.0 - _motion_elastic((12.0 - float(pose.bd_st2)) / 12.0)) * 0.22
		var sx: float = 1.0 + k
		var sy: float = 1.0 - k
		_sprite.scale = Vector2(visual_scale * sx, visual_scale * sy)
		_sprite.position = Vector2(0, visual_scale * 48.0 * (1.0 - sy) * 0.5)
	else:
		_sprite.scale = Vector2.ONE * visual_scale
		_sprite.position = Vector2(0, float(pose.lift))
	for sprite in _charge_sprites: sprite.visible = false
	_charge_marks.visible = false
	_record_native_move_trail(true)

## [잔상] G58713–58716: 이동기술 중 렌더 프레임마다 스냅샷(최대 8), 비활성 시 비움
func _record_native_move_trail(active: bool) -> void:
	if not is_instance_valid(_native_move_skills):
		return
	if not active:
		_native_move_skills.clear_trail()
		return
	var tex: Texture2D = _sprite.sprite_frames.get_frame_texture(_sprite.animation, _sprite.frame)
	_native_move_skills.push_trail({"pos": global_position, "texture": tex, "offset": _sprite.offset,
		"scale": Vector2.ONE * visual_scale, "bright": state == "bladeDash"})

func _attack_frame() -> int:
	var selected: Dictionary = get_native_character_profile_snapshot()
	var tempo: Dictionary=_current_attack_tempo if _native_attack_selection_bound else get_native_attack_tempo()
	if tempo.get("ready")!=true:return 0
	var recovery: float=float(tempo.render_recovery_ticks)
	if selected.get("ready")==true and selected.index==1:
		if state=="windup":return 0
		var duration: float=maxf(1.0,recovery)
		var elapsed: float=5.0-_state_left if state=="swing" else 5.0+duration-_state_left
		return mini(8,int(floor(clampf(elapsed/(5.0+duration)*1.5,0.0,1.0)*9.0)))
	var source_state: String={"windup":"wWindup","swing":"wSwing","recover":"wRecover"}.get(state,"wRecover")
	return SOURCE_PLAYER_CLIP.bat_frame(source_state,_state_left,float(tempo.render_windup_ticks),recovery)

func _native_warrior_e_frame(left: float) -> int:
	if state not in ["sBash","sRecover"]:return 0
	if _current_attack_tempo.get("ready")!=true:return 0
	# R warrior-bat-swing.js frame/baseFrame sBash duration20, speed.85.
	var recovery: float=maxf(1.0,float(_current_attack_tempo.e_render_recovery_ticks))
	if state=="sRecover" and left<=0.0:return 8
	var elapsed: float=recovery-left
	var delay: float=20.0*(1.0/0.85-1.0)
	if state=="sBash" or elapsed<delay:
		var t: float=(20.0-left)*0.85 if state=="sBash" else (20.0+elapsed)*0.85
		return 0 if t<2.0 else (1 if t<4.0 else (2 if t<7.0 else (3 if t<8.0 else (4 if t<11.0 else (5 if t<14.0 else 6)))))
	var progress: float=clampf(1.0-left/maxf(0.001,recovery-delay),0.0,1.0)
	return 6 if progress<0.45 else (7 if progress<0.8 else 8)

func _draw_charge_marks() -> void:
	var width: float = 78.0 + charge_tier() * 13.0 + 4.0 * fmod(charge_frames, _charge_step) / _charge_step
	var transform := Transform2D(_attack_direction.angle(), Vector2.ZERO)
	for index in range(3):
		var point := Vector2(-width * 0.23 + index * 12.0, width * 0.29)
		_charge_marks.draw_line(transform * point, transform * (point + Vector2(9, -12)), Color("fff4df") if index < charge_tier() else Color("8c3445"), 4.0 if index < charge_tier() else 2.0, true)

func _request_native_attack_sound(phase: String, step: int) -> void:
	if not _native_attack_selection_bound:return
	var main: Node=get_parent()
	if is_instance_valid(main) and not main.is_queued_for_deletion() and main.has_method("request_native_attack_sound"):
		main.request_native_attack_sound(self,phase,step,_native_attack_audio_serial)

# ═══ PCI-01 (PC-LIFE-PACK 2026-10-21) — 생명주기 sink. 기존 HP0 블록·피해 경로 수정0. ═══
# 등록된 Main.source_player_life 모듈의 동기 commit 창 안에서만 수락한다(임의 iframe setter 아님):
# iframes는 원본 op 값 집합(0/120/300/9999)만, state는 생명주기 결과 상태만 허용.
const PLAYER_LIFE_PATH = "res://scripts/native_source_player_life.gd"
const PLAYER_LIFE_IFRAMES = [0.0, 120.0, 300.0, 9999.0] # G43870 / G43727·G43854 / G63521 / G43731
const PLAYER_LIFE_FIELDS = ["state", "iframes", "state_left", "knockback_zero", "dot_slow_clear"]
var _native_player_life_commits := 0

func read_native_player_life_fields() -> Dictionary:
	return {"state": state, "iframes": iframes, "state_left": _state_left, "knockback": _knockback,
		"burns": _native_burns.duplicate(true), "freeze_slow": _native_freeze_slow_ticks}

func validate_native_player_life_commit(owner: Node, life: Object, fields: Dictionary) -> String:
	if not is_inside_tree() or is_queued_for_deletion() or not is_instance_valid(owner) \
			or owner != get_parent() or owner.get("player") != self or not is_instance_valid(_world) \
			or owner.get("world") != _world or _world.get("player") != self:
		return "player_life_owner_mismatch"
	if not is_instance_valid(life) or life.get_script() == null \
			or life.get_script().resource_path != PLAYER_LIFE_PATH or owner.get("source_player_life") != life:
		return "player_life_module_mismatch"
	var window: Variant = life.is_native_player_life_committing(owner)
	if not window is bool or not window:
		return "player_life_not_in_commit_window"
	if fields.has("restore_snapshot"):
		return "" if fields.size() == 1 and fields["restore_snapshot"] is Dictionary else "player_life_restore_shape"
	for field in fields:
		if field not in PLAYER_LIFE_FIELDS:
			return "player_life_field_denied:" + str(field)
	if fields.has("state") and (not fields["state"] is String or String(fields["state"]).is_empty()):
		return "player_life_state_invalid"
	if fields.has("iframes") and (not (fields["iframes"] is float or fields["iframes"] is int) \
			or float(fields["iframes"]) not in PLAYER_LIFE_IFRAMES):
		return "player_life_iframes_not_source_value"
	if fields.has("state_left") and float(fields["state_left"]) != 0.0:
		return "player_life_state_left_only_zero"
	for flag in ["knockback_zero", "dot_slow_clear"]:
		if fields.has(flag) and fields[flag] != true:
			return "player_life_flag_invalid:" + flag
	return ""

func commit_native_player_life(owner: Node, life: Object, fields: Dictionary) -> Dictionary:
	var error := validate_native_player_life_commit(owner, life, fields)
	if not error.is_empty():
		return {"accepted": false, "reason": error}
	if fields.has("restore_snapshot"):
		var snap: Dictionary = fields["restore_snapshot"]
		state = str(snap["state"])
		iframes = float(snap["iframes"])
		_state_left = float(snap["state_left"])
		_knockback = snap["knockback"]
		_native_burns.assign(snap["burns"])
		_native_freeze_slow_ticks = snap["freeze_slow"]
		return {"accepted": true, "restored": true}
	# 순서 무관한 독립 필드 대입. 시그널/콜백 0(관찰은 life 모듈이 commit 뒤 1회 발행).
	if fields.has("state"): state = String(fields["state"])
	if fields.has("iframes"): iframes = float(fields["iframes"])
	if fields.has("state_left"): _state_left = 0.0
	if fields.has("knockback_zero"): _knockback = Vector2.ZERO
	if fields.has("dot_slow_clear"):
		# G63455 burnT/_rbBurn/_freezeSlow… — Godot 대응 필드: 화상 스택·빙결 둔화.
		_native_burns.clear()
		_native_freeze_slow_ticks = 0.0
	_native_player_life_commits += 1
	return {"accepted": true, "fields": fields.keys(), "commits": _native_player_life_commits}
