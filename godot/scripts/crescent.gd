extends Area2D
## Native kiSlash: world-owned, unlimited piercing, independent of cast lifetime.

# P2-007a — 원본 2026-10-11 "실버+블랙"(game.html 16739~16753): 1·2·3타 모두 같은 실버 시트
# (assets/vfx/ki_slash_silver_sheet.png 바이트 복사), 색 변환 폐지(_kiSlashPalette 16743 → 0),
# 칼날 뒤 검은 잉크 층(_kiSlashShadowSurface 16745, 일반 합성) + 칼날은 가산(lighter/GL ONE,ONE).
const SHEET = preload("res://assets/vfx/ki_slash_silver_sheet.png")
const ADDITIVE = preload("res://assets/vfx/radiant.gdshader")
const INK = preload("res://assets/vfx/ki_slash_ink.gdshader")
const HIT_EFFECT = preload("res://scripts/hit_effect.gd")
# P1-002.G: 검기 피해도 원본 hurtE(game.html:19837) 경로 — 실행자·owner API 계약은 player.gd와 공유.
const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const PLAYER_SCRIPT = preload("res://scripts/player.gd")
@export var damage: int = 0
@export var radius: float = 55.0
@export var life_frames: float = 0.0
@export var initial_life_frames: float = 0.0
@export var charge_scale: float = 1.0
var step: int = 1
var direction := Vector2.RIGHT
var _speed: float = 840.0
var _width: float = 192.0
var _palette: int = 0
var _world: Node
var _player: WeakRef
var _combat: Dictionary = {}
var _hits: Dictionary = {}
var _configured: bool = false
var _sprites: Array[AnimatedSprite2D] = []
var _ink: AnimatedSprite2D
var _trail: Array[Vector2] = []
var _trail_head: int = 0

func configure(player: Node2D, requested_step: int, charge_frames: float, requested_direction: Vector2, combat: Dictionary) -> bool:
	var parameters: Dictionary = player.get_native_attack_parameters() if player.has_method("get_native_attack_parameters") else {"ready":false}
	if parameters.get("ready")!=true: return false
	_combat = combat
	var skill: Dictionary = combat.get("kiSlash", {})
	step = clampi(requested_step, 1, 3)
	direction = requested_direction.normalized() if requested_direction.length_squared() > 0.0 else Vector2.RIGHT
	global_position = player.global_position
	reset_physics_interpolation()
	rotation = direction.angle()
	_player = weakref(player)
	if player.has_method("get_combat_world"):
		_world = player.get_combat_world()
	var level: int = int(player.get("ki_slash_level"))
	var tier: int = mini(3, int(floor(maxf(0.0, charge_frames) / float(skill.get("charge_step_ticks", 40.0))))) if step == 3 else 0
	charge_scale = 1.0 + tier * float(skill.get("charge_scale_per_tier", 0.4))
	var multiplier: float = pow(2.0, tier)
	var skill_multiplier: float = float(skill.get("skill_base", 12.0)) + (level - 1) * float(skill.get("skill_growth", 10.08)) * float(skill.get("skill_growth_factor", 0.5))
	damage = preload("res://port_modules/combat_stat_formula/producer.gd").js_to_int32(float(parameters.melee_ref) * float(skill.get("damage_coefficient", 7.0)) * float(parameters.stat_str) * float(parameters.p_atk_mul) * skill_multiplier * multiplier)
	var radii: Array = skill.get("collision_radii", [55.0, 55.0, 120.0])
	var distances: Array = skill.get("base_distances", [250.0, 300.0, 350.0])
	var widths: Array = skill.get("visual_widths", [192.0, 192.0, 252.0])
	radius = float(radii[step - 1]) * charge_scale
	_width = float(widths[step - 1]) * charge_scale
	var speed_per_tick: float = float(skill.get("projectile_speed_per_tick", 14.0))
	_speed = speed_per_tick * 60.0
	initial_life_frames = floor((float(distances[step - 1]) + (level - 1) * float(skill.get("distance_per_level", 15.0))) / speed_per_tick)
	life_frames = initial_life_frames
	# 16743 _kiSlashPalette(c){return 0} — 단계·캐릭터 무관 단일 실버(구 3타 hue150·실버테일 분기 폐지).
	_palette = 0
	_trail.clear()
	for index in range(5):
		_trail.append(global_position)
	_configured = true
	if is_node_ready():
		_apply_collision()
		_update_visual()
	_notify("crescent_spawned", {"step": step, "damage": damage, "radius": radius, "life_frames": life_frames, "tier": tier})
	return true

func _ready() -> void:
	add_to_group("player_crescents")
	add_to_group("crescents")
	process_mode = Node.PROCESS_MODE_PAUSABLE
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	collision_layer = 8
	collision_mask = 4
	monitoring = true
	monitorable = false
	var shape_node := CollisionShape2D.new()
	shape_node.name = "HitShape"
	shape_node.shape = CircleShape2D.new()
	add_child(shape_node)
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	frames.add_animation("slash")
	frames.set_animation_loop("slash", false)
	for index in range(9):
		var atlas := AtlasTexture.new()
		atlas.atlas = SHEET
		atlas.region = Rect2((index % 3) * 418, int(index / 3) * 418, 418, 418)
		frames.add_frame("slash", atlas)
	# 19210~19215: 잉크 층을 칼날보다 먼저(아래) — 일반 합성, 1.14배, alpha×.9.
	_ink = AnimatedSprite2D.new()
	_ink.name = "Ink"
	_ink.sprite_frames = frames
	_ink.animation = "slash"
	_ink.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	var ink_material := ShaderMaterial.new()
	ink_material.shader = INK
	_ink.material = ink_material
	add_child(_ink)
	for index in range(4):
		var sprite := AnimatedSprite2D.new()
		sprite.sprite_frames = frames
		sprite.animation = "slash"
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		var material := ShaderMaterial.new()
		material.shader = ADDITIVE
		sprite.material = material
		add_child(sprite)
		_sprites.append(sprite)
	z_as_relative = false
	z_index = clampi(int(global_position.y / 4.0) + 1, -4096, 4095)
	if _configured:
		_apply_collision()
		_update_visual()

func _apply_collision() -> void:
	var circle: CircleShape2D = get_node("HitShape").shape
	circle.radius = radius

func _physics_process(delta: float) -> void:
	if not _configured:
		return
	# This order matches updateCrescents: expire BEFORE movement, then wall/targets.
	life_frames -= delta * 60.0
	if life_frames <= 0.0:
		_notify("crescent_expired", {"step": step, "hits": _hits.size()})
		queue_free()
		return
	global_position += direction * _speed * delta
	z_index = clampi(int(global_position.y / 4.0) + 1, -4096, 4095)
	_trail_head = (_trail_head + 1) % 5
	_trail[_trail_head] = global_position
	if _center_in_wall():
		_notify("crescent_wall", {"position": global_position})
		queue_free()
		return
	# Native circular center-distance contract avoids broadphase/callback one-tick lag.
	# The actual Area2D shape remains available for Godot tooling/collision inspection.
	for candidate in _enemies():
		if not is_instance_valid(candidate) or not candidate is Node2D or not candidate.has_method("receive_damage"):
			continue
		var enemy: Node2D = candidate
		if _hits.has(enemy.get_instance_id()) or _enemy_dead(enemy):
			continue
		var enemy_radius: float = float(enemy.get("radius")) if "radius" in enemy else 15.0
		if global_position.distance_to(enemy.global_position) >= radius + enemy_radius or not _has_los(enemy.global_position):
			continue
		_hits[enemy.get_instance_id()] = true
		var hit_direction: Vector2 = (enemy.global_position - global_position).normalized()
		if _has_native_hurte_owner_api(enemy):
			# P1-002.G: 원본 19837 hurtE — opts {poiseHit:true, kbMult:0.5, noImpact:true,
			# _kiFull: step3 풀차지(chargeScale>=2.2)}. atkEl은 c.el=0 (spawnCrescent 16802,
			# _fireKiSlashCrescent가 el 0 고정 전달). ang=atan2(e-c) (검기 위치 기준).
			# 정지(NOT_READY/미이식 활성) 시 단순화 경로 폴백 금지 — 정지 지점까지만 적용.
			var main: Node = _world.get_parent() if is_instance_valid(_world) else null
			var ki_full: bool = step == 3 and charge_scale >= 2.2 - 1e-6
			var outcome: Dictionary = NORMAL_HURTE.new().execute(main, _world, enemy, damage,
				(enemy.global_position - global_position).angle(), 0,
				{"poiseHit": true, "kbMult": 0.5, "noImpact": true, "_lessonAttack": "kiSlash",
					"_lessonFullCharge": ki_full, "_kiFull": ki_full})
			outcome["enemy_id"] = enemy.get_instance_id()
			outcome["base_damage"] = damage
			outcome["step"] = step
			_notify("native_hurte", outcome)
			if outcome.get("ok") != true:
				_notify("native_hurte_halt", outcome)
		else:
			# hurtE owner 미보유 적: 기존 경로 유지 (레거시 포이즈 유예 + receive_damage).
			if enemy.has_method("receive_poise_damage"):
				enemy.receive_poise_damage(damage)
			enemy.receive_damage(damage, hit_direction, "kiSlash")
		# P2-001a — 19838~19840: 적중마다 step3=G.hitStop max 6+shake(8) / 그 외 hitStop max 3.
		# (히트스톱은 소비자 32585가 원본대로 완전 비활성 — G 기록만 유효.)
		var feel_main: Node = _world.get_parent() if is_instance_valid(_world) else null
		if is_instance_valid(feel_main) and feel_main.has_method("apply_native_crescent_hit_feel"):
			var feel: Dictionary = feel_main.apply_native_crescent_hit_feel(step)
			if feel.get("applied") != true:
				_notify("native_crescent_feel_refused", {"reason": feel.get("reason"), "step": step})
		_play_hit(enemy.global_position)
		_notify("crescent_hit", {"step": step, "damage": damage, "enemy_id": enemy.get_instance_id(), "tier": int(round((charge_scale - 1.0) / 0.4)), "hit_stop_ticks": 6 if step == 3 else 3, "shake": 8 if step == 3 else 0})
	_update_visual()

func _has_native_hurte_owner_api(enemy: Node) -> bool:
	for method in PLAYER_SCRIPT.NORMAL_HURTE_OWNER_METHODS:
		if not enemy.has_method(method):
			return false
	return true

func _enemies() -> Array:
	if is_instance_valid(_world) and _world.has_method("get_enemies"):
		return _world.get_enemies()
	return get_tree().get_nodes_in_group("enemies")

func _enemy_dead(enemy: Node) -> bool:
	if "alive" in enemy and not bool(enemy.get("alive")):
		return true
	return "hp" in enemy and int(enemy.get("hp")) <= 0

func _center_in_wall() -> bool:
	var query := PhysicsPointQueryParameters2D.new()
	query.position = global_position
	query.collision_mask = 1
	query.collide_with_areas = false
	return not get_world_2d().direct_space_state.intersect_point(query, 1).is_empty()

func _has_los(target: Vector2) -> bool:
	var query := PhysicsRayQueryParameters2D.create(global_position, target, 1)
	query.collide_with_areas = false
	return get_world_2d().direct_space_state.intersect_ray(query).is_empty()

func _play_hit(point: Vector2) -> void:
	var skill: Dictionary = _combat.get("kiSlash", {})
	var widths: Array = skill.get("hit_widths", [140.0, 140.0, 184.0])
	var effect = HIT_EFFECT.new()
	get_parent().add_child(effect)
	effect.configure(point, direction, float(widths[step - 1]) * charge_scale, _palette, float(skill.get("hit_frame_ticks", 3.0)), true) # 19380 잉크 층 동반

func _update_visual() -> void:
	if _sprites.is_empty():
		return
	var progress: float = clampf(1.0 - life_frames / maxf(1.0, initial_life_frames), 0.0, 1.0)
	var frame: int = mini(8, int(floor(progress * 9.0)))
	var opacity: float = minf(1.0, (1.0 - progress) * 2.5)
	if is_instance_valid(_ink):
		_ink.frame = frame
		_ink.position = Vector2.ZERO
		_ink.scale = Vector2.ONE * (_width * 1.14 / 418.0)
		_ink.modulate.a = opacity * 0.9
	for index in range(4):
		var sprite: AnimatedSprite2D = _sprites[index]
		sprite.frame = frame
		var material: ShaderMaterial = sprite.material
		material.set_shader_parameter("hue_degrees", 0.0) # 16744 색 변환 폐지(동일 참조)
		if index < 2:
			var previous: Vector2 = _trail[posmod(_trail_head - (2 - index) * 2, 5)]
			sprite.position = to_local(previous)
			sprite.scale = Vector2.ONE * (_width * 0.9 / 418.0)
			sprite.modulate.a = opacity * (0.08 if index == 0 else 0.18)
		else:
			sprite.position = Vector2.ZERO
			sprite.scale = Vector2.ONE * (_width * (1.08 if index == 2 else 1.0) / 418.0)
			sprite.modulate.a = opacity * ((0.3 if step == 3 else 0.18) if index == 2 else 1.0)

func _notify(kind: String, data: Dictionary) -> void:
	if _player == null:
		return
	var player = _player.get_ref()
	if is_instance_valid(player):
		player.emit_signal("telemetry_event", kind, data)
