class_name ExoduserFleshCrawler
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

const PHYSICAL_PROJECTILE = preload("res://scripts/enemy_projectile_physical.gd")
# P1-002.F: hurtE owner API 공용 구현 + 이 적의 원본 st2 대응 필드명.
const HURTE_OWNER = preload("res://scripts/native_dedicated_enemy_hurte_owner.gd")
const BAR_LAYOUT = preload("res://scripts/native_enemy_bar_layout.gd")
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
const HURTE_CONTACT_FIELD := "st2"

var data: Dictionary = {}
var world: Node2D
var player: Node2D
var spawn_position = Vector2.ZERO
var hp = 0
# One current maximum-HP owner; the legacy name is an alias, not a snapshot.
var mhp = 0
var max_hp:
	get: return mhp
	set(value): mhp = value
var attack = 0
var radius = 0.0
var etype = 0
const SOURCE_ELEMENT_NAMES := ["physical", "fire", "ice", "dark", "lightning", "holy", "earth"]
var el: int = -1
var element: String:
	get: return SOURCE_ELEMENT_NAMES[el] if el >= 0 and el < SOURCE_ELEMENT_NAMES.size() else ""
	set(value): el = SOURCE_ELEMENT_NAMES.find(value)
var elite = 0
var mods: Array = []
var aura: Variant = null
var native_flags: Dictionary = {}
var initial_timers: Dictionary = {}
var source_order = -1
var alive = true
var state = "idle"
var alerted = false
var facing = 0.0
var eShield = 0.0
var eShieldMax = 0.0
# P2-001l — 가시덫 감속(37471) 수용: native_skill_slots._spike_trap_tick(412~)이 모든
# 적에서 `_spike_slow`를 읽으므로(부재 시 런타임 오류) enemy.gd(45·334·188)와 동일 계약.
var _spike_slow := 0.0
var _spike_slow_lv := 1
var eRes: Array = []
var poise = 0.0
var max_poise = 0.0
var charge_ticks = 0.0
var native_frame = 0.0
var _projectile_ticks = 0.0
# Source mkEn.st2: native ticks. Every admitted idle/recover consumer uses this
# same field. The inherited type7 spelling keeps its existing behaviour.
var st2 := 0.0
var _contact_ticks: float:
	get: return st2
	set(value): st2 = value
var _source_normal_fields_configured := false
var _hit_stun = 0.0
var _stun_ticks = 0.0
var _poise_regen = 0.0
# mkEn/record15 omit this key. Presence is owned separately from its value;
# the source writes it only when a poise break actually happens.
var _maxStunned: Variant = null
var _source_max_stunned_present := false
var _hit_flash = 0.0
var _spawn_ticks = 0.0
var _separation_ticks = 0.0
var _walk_distance = 0.0
var _move_hold = 0.0
var _moving = false
var _knockback = Vector2.ZERO
var _pending_poise_amount = 0.0
var _rng = RandomNumberGenerator.new()
var _body: Sprite2D
var _walk: Sprite2D
var _base_textures: Dictionary = {}
var _walk_textures: Dictionary = {}

func configure(value: Dictionary, owner_world: Node2D) -> void:
	data = value.duplicate(true)
	world = owner_world
	spawn_position = Vector2(float(data["spawn_position"][0]), float(data["spawn_position"][1]))
	position = spawn_position
	hp = int(data["hp"])
	mhp = data["native_final"]["mhp"]
	attack = int(data["attack"])
	radius = float(data["radius"])
	etype = int(data["etype"])
	element = str(data["element"])
	var source_el: Variant = data.get("element_id")
	if (source_el is int or source_el is float) and is_finite(float(source_el)) and float(source_el) == float(el):
		el = int(source_el)
	else:
		el = -1
	elite = int(data["elite"])
	mods = data["mods"].duplicate(true)
	aura = data["aura"]
	native_flags = data["native_flags"].duplicate(true)
	initial_timers = data["initial_timers"].duplicate(true)
	source_order = int(data["order"])
	facing = float(data["facing"])
	eShield = float(data["eShield"])
	eShieldMax = float(data["eShieldMax"])
	eRes = data["eRes"].duplicate(true)
	poise = float(data["poise"])
	max_poise = float(data["max_poise"])
	st2 = float(data["native_final"]["st2"])
	_projectile_ticks = float(data["initial_projectile_ticks"])
	_poise_regen = float(initial_timers["poiseR"])
	_spawn_ticks = float(data["initial_spawn_fade_ticks"])
	charge_ticks = float(initial_timers["chargeT"])
	var native: Dictionary = data["native_final"]
	state = str(native["s"])
	alive = bool(native["alive"])
	_stun_ticks = float(native["stunned"])
	_source_max_stunned_present = native.has("_maxStunned")
	_maxStunned = native["_maxStunned"] if _source_max_stunned_present else null
	_knockback = Vector2(float(native["kb"]["x"]), float(native["kb"]["y"]))
	_rng.seed = int(data["factory_random_seed"])
	_source_normal_fields_configured = _source_normal_fields_domain_current()

func _ready() -> void:
	name = str(data["id"])
	process_mode = Node.PROCESS_MODE_PAUSABLE
	add_to_group("enemies")
	collision_layer = 4
	collision_mask = 1 # Terrain/props only; source normal enemies do not block player bodies.
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	z_index = clampi(int(global_position.y / 4.0), -2000, 4000)
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = radius
	shape.shape = circle
	add_child(shape)
	var animation: Dictionary = data["animation"]
	for direction in animation["base_textures"]:
		_base_textures[direction] = load(animation["base_textures"][direction])
		_walk_textures[direction] = load(animation["walk_textures"][direction])
	_body = _make_sprite("Body", float(animation["draw_height"]) / 256.0)
	_walk = _make_sprite("WalkOverlay", float(animation["draw_height"]) / 256.0)
	_update_animation()
	telemetry_event.emit("enemy_spawn", {"id": data["id"], "order": source_order, "etype": etype, "element": element, "position": [position.x, position.y], "hp": hp, "radius": radius, "native_speed": data["speed_pixels_per_tick"], "facing": facing, "consumer_profile": data["ai_profile"]})

func _make_sprite(sprite_name: String, draw_scale: float) -> Sprite2D:
	var sprite = Sprite2D.new()
	sprite.name = sprite_name
	sprite.region_enabled = true
	sprite.centered = true
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.scale = Vector2.ONE * draw_scale
	add_child(sprite)
	return sprite

func set_player(value: Node2D) -> void:
	player = value

func _physics_process(delta: float) -> void:
	if not alive:
		return
	var ticks = delta * float(data["native_tick_rate"])
	native_frame += ticks
	_spawn_ticks = maxf(0.0, _spawn_ticks - ticks)
	_hit_flash = maxf(0.0, _hit_flash - ticks)
	_hit_stun = maxf(0.0, _hit_stun - ticks)
	_stun_ticks = maxf(0.0, _stun_ticks - ticks)
	var before = global_position
	# PC-SPAWN-PARITY V-03: 원본 적 루프 벽 끼임 구조(G34427~34431)와 updateE 첫머리
	# _pushOutWall(G38591)을 타일 기준 그대로. 커튼 링 4번(3679,7829)은 r>10이면 아래 타일벽에
	# 걸려(스폰은 canMv(…,10)) 원본에서 +80px 밀려난 뒤 추적한다 — 이 경로가 없으면 제자리에 멈췄다.
	_src_wall_stuck_rescue()
	_src_push_out_wall()
	if _knockback.length_squared() > 0.02:
		_move_native(_knockback, ticks)
		_knockback *= pow(0.85, ticks)
	# Native updateE checks hit stun before its stunned/charge-cancel branch.
	if _hit_stun > 0.0:
		_finish_motion(before, ticks)
		return
	if _stun_ticks > 0.0:
		if charge_ticks > 0.0:
			charge_ticks = 0.0
			telemetry_event.emit("enemy_charge_cancel", {"id": data["id"], "reason": "stunned"})
		_finish_motion(before, ticks)
		return
	# Source ordinary enemies regenerate; only its boss branch resets at stun end.
	if poise < max_poise:
		_poise_regen += ticks
		if _poise_regen >= float(data["poise_regen_ticks"]):
			poise = minf(max_poise, poise + floorf(max_poise * float(data["poise_regen_fraction"])))
			_poise_regen = 0.0
	if not is_instance_valid(player):
		_finish_motion(before, ticks)
		return
	var distance = global_position.distance_to(player.global_position)
	if not alerted and distance < float(data["aggro_range"]) and world.has_line_of_sight(global_position, player.global_position):
		alerted = true
		telemetry_event.emit("enemy_aggro", {"id": data["id"], "distance": distance})
	if alerted and distance < float(data["aggro_range"]):
		facing = (player.global_position - global_position).angle()
	if alerted and state in ["idle", "recover"] and distance > float(data["pursuit_stop_distance"]):
		_src_ff_move(ticks, 1.0) # G38689 ETYPE_RANGE<=400 → _ffMoveE(e,sp,1)
		distance = global_position.distance_to(player.global_position)
	# Committed charge advances before the non-alerted far-return gate.
	if charge_ticks > 0.0:
		charge_ticks -= ticks
		if charge_ticks <= 0.0:
			charge_ticks = 0.0
			_fire_projectile()
	if (not alerted and distance > 400.0) or float(player.get("hp")) <= 0.0:
		_finish_motion(before, ticks)
		return
	st2 -= ticks
	if state == "idle":
		var native_speed: float = float(data["speed_pixels_per_tick"])
		if _spike_slow > 0.0: # 34398 — 가시덫 감속 소비(enemy.gd 188~190 동일)
			_spike_slow = maxf(0.0, _spike_slow - ticks)
			native_speed *= 1.0 - minf(0.95, 0.91 + 0.02 * float(_spike_slow_lv - 1))
		_move_native(Vector2.from_angle(facing) * native_speed * float(data["idle_movement_multiplier"]), ticks)
		_apply_separation(ticks)
		# Source uses the distance sampled before direct idle movement.
		if distance < radius + float(player.get("radius")) + float(data["contact_extra_radius"]) and float(player.get("iframes")) <= 0.0 and st2 <= 0.0:
			var amount = int(attack * float(data["contact_damage_multiplier"]))
			player.receive_damage(amount)
			st2 = float(data["contact_cooldown_min_ticks"]) + floorf(_rng.randf() * float(data["contact_cooldown_random_ticks"]))
			telemetry_event.emit("enemy_contact", {"id": data["id"], "damage_request": amount, "cooldown_ticks": st2})
		if charge_ticks <= 0.0:
			_projectile_ticks -= ticks
			if _projectile_ticks <= 0.0 and distance < float(data["projectile_range"]):
				_projectile_ticks = float(data["projectile_cooldown_ticks"])
				charge_ticks = float(data["projectile_charge_ticks"])
				telemetry_event.emit("enemy_charge", {"id": data["id"], "ticks": charge_ticks, "position": [global_position.x, global_position.y], "bean": "normal", "parry_class": "physical"})
	elif state == "recover" and st2 <= 0.0:
		state = "idle"
		st2 = 15.0 + _rng.randf() * 15.0
	# eCircle/ticket windup has no admitted entry in this consumer.
	_finish_motion(before, ticks)

func _move_native(per_tick: Vector2, ticks: float) -> void:
	if per_tick.is_zero_approx():
		return
	if world.can_move(global_position + per_tick * ticks, radius):
		velocity = per_tick * 60.0
		move_and_slide()
	else:
		velocity = Vector2.ZERO

# ── 원본 탄 차징 경고(PC-SPAWN-PARITY V-03 항목 4) ──
# G20101~20105: e._projChargeT>0 → _drawShootCharge(x,y,r,1-T/60,col,1,physical) + 물리면
# _drawProjectileChargeLabel('물리탄 차징 · E로 패링'). 링 R=r+10, 바탕 #080808 α.28 w5,
# 물리 = 흰색 α1 w6 둥근 끝 / 그 외 = col α(.8+prog*.2) w3.5. 라벨 cy=y-r-25, 상자 (글자폭+14)×20,
# 채움 rgba(5,8,13,.92)·테두리 #f4f4f4 1.5, 글자 흰색 bold 13px "Noto Sans KR"(G24098~24110).
var _src_shot_warning: Node2D
class _SrcShotWarning extends Node2D:
	static var _shot_label_font: SystemFont
	var actor: Node2D
	func _draw() -> void:
		if not is_instance_valid(actor) or actor.get("alive") != true:
			return
		var ticks: float = float(actor.get("charge_ticks"))
		if ticks <= 0.0:
			return
		var r: float = float(actor.get("radius"))
		var prog: float = clampf(1.0 - ticks / 60.0, 0.0, 1.0)
		var physical: bool = int(actor.get("el")) == 0
		var ring_r := r + 10.0
		draw_arc(Vector2.ZERO, ring_r, 0.0, TAU, 64, Color(8.0 / 255.0, 8.0 / 255.0, 8.0 / 255.0, 0.28), 5.0, true)
		if prog > 0.0:
			var start := -PI / 2.0
			var end := start + TAU * prog
			if physical:
				draw_arc(Vector2.ZERO, ring_r, start, end, 64, Color.WHITE, 6.0, true)
				draw_circle(Vector2.from_angle(start) * ring_r, 3.0, Color.WHITE)
				draw_circle(Vector2.from_angle(end) * ring_r, 3.0, Color.WHITE)
			else:
				var data: Dictionary = actor.get("data")
				var col := Color(str(data.get("native_final", {}).get("col", "#ff6644")))
				col.a = 0.8 + prog * 0.2
				draw_arc(Vector2.ZERO, ring_r, start, end, 64, col, 3.5, true)
		if not physical:
			return
		if _shot_label_font == null:
			_shot_label_font = SystemFont.new()
			_shot_label_font.font_names = PackedStringArray(["Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"])
			_shot_label_font.font_weight = 700
		var label: String = UI.text("물리탄 차징 · E로 패링")
		var width: float = _shot_label_font.get_string_size(label, HORIZONTAL_ALIGNMENT_LEFT, -1, 13).x
		var cy := -r - 25.0
		var rect := Rect2(Vector2(-(width + 14.0) * 0.5, cy - 10.0), Vector2(width + 14.0, 20.0))
		draw_rect(rect, Color(5.0 / 255.0, 8.0 / 255.0, 13.0 / 255.0, 0.92))
		draw_rect(rect, Color("#f4f4f4"), false, 1.5)
		var baseline := cy + (_shot_label_font.get_ascent(13) - _shot_label_font.get_descent(13)) * 0.5
		draw_string(_shot_label_font, Vector2(-width * 0.5, baseline), label, HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color.WHITE)

# ── 원본 이동 보조(PC-SPAWN-PARITY V-03) ──
var _src_last_fd := Vector2.ZERO      # e._lastFdx/_lastFdy
var _src_has_last_fd := false         # e._lastFdx!==undefined
var _src_stuck_ticks := 0.0           # e._stuckT

func _src_tile_grid_active() -> bool:
	# 원본 G.map은 현재 공간의 격자다. MAP11 아레나(오프셋 공간)에서는 필드 타일을 쓰지 않는다.
	if not is_instance_valid(world) or not world.get("map_data") is Dictionary:
		return false
	if world.get("_native_map11_selected") == true:
		var scene: Variant = world.get("_native_map11_scene")
		return is_instance_valid(scene) and scene.get("active_space") == "field"
	return true

func _src_tile_wall(point: Vector2) -> bool:
	# G32109 _eWallStuck / G31721 _isWallTile: 타일(=1)과 맵 밖만 벽(맵 오브젝트 제외).
	var map_data: Variant = world.get("map_data") if is_instance_valid(world) else null
	if not map_data is Dictionary:
		return false
	var size: float = float(map_data.get("tile_size", 40.0))
	var tx := int(floor(point.x / size))
	var ty := int(floor(point.y / size))
	if tx < 0 or ty < 0 or tx >= 200 or ty >= 200:
		return true
	return int(map_data["tiles"][ty * 200 + tx]) == 1

func _src_tile_free(point: Vector2, r: float) -> bool:
	# G31722 _canMvTile
	return not _src_tile_wall(point + Vector2(-r, -r)) and not _src_tile_wall(point + Vector2(r, -r)) 		and not _src_tile_wall(point + Vector2(-r, r)) and not _src_tile_wall(point + Vector2(r, r))

func _src_wall_stuck_rescue() -> void:
	# G34427~34431: 중심+4코너 중 하나라도 타일벽이면 T×1..5, 8방향 순서로 중심 타일이 벽이 아닌 곳으로.
	if not _src_tile_grid_active():
		return
	var p := global_position
	if not (_src_tile_wall(p) or _src_tile_wall(p + Vector2(-radius, -radius)) or _src_tile_wall(p + Vector2(radius, -radius)) 			or _src_tile_wall(p + Vector2(-radius, radius)) or _src_tile_wall(p + Vector2(radius, radius))):
		return
	var size: float = float(world.get("map_data").get("tile_size", 40.0))
	for ring in range(1, 6):
		for d in range(8):
			var to := p + Vector2.from_angle(d * PI / 4.0) * size * ring
			if not _src_tile_wall(to):
				global_position = to
				_knockback = Vector2.ZERO
				return
	# 원본은 비보스면 여기서 즉사 처리(G34435) — 이 액터 사망 경로 미연결이라 제자리 유지(관측 기록용).
	telemetry_event.emit("enemy_wall_stuck_unrescued", {"id": data.get("id"), "position": [p.x, p.y]})

func _src_push_out_wall() -> void:
	# G31724 _pushOutWall: d=T..T*5 (T/2 간격) × 8방향, _canMvTile 통과 첫 지점.
	if not _src_tile_grid_active() or _src_tile_free(global_position, radius):
		return
	var size: float = float(world.get("map_data").get("tile_size", 40.0))
	var d := size
	while d <= size * 5.0:
		for a in range(8):
			var to := global_position + Vector2(cos(PI / 4.0 * a), sin(PI / 4.0 * a)) * d
			if _src_tile_free(to, radius):
				global_position = to
				return
		d += size / 2.0

func _src_try_move(to: Vector2, r: float) -> bool:
	if world.can_move(to, r):
		global_position = to
		return true
	return false

func _src_ff_move(ticks: float, multiplier: float) -> void:
	# G31909~31952 _ffMoveE(e,sp,spdMul): 흐름장 → (없으면) 마지막 방향 → 플레이어 직선. 두 축 → x축 → y축,
	# 막히면 ±45°×4 우회(0.8배), 30틱 넘게 막히면 r−2·±22.5°×8, 90틱 넘으면 플레이어 쪽 s×2..6 이동.
	var fd: Vector2 = world.get_path_direction(global_position)
	var dir: Vector2
	if not fd.is_zero_approx():
		dir = fd
		_src_last_fd = fd
		_src_has_last_fd = true
	elif _src_has_last_fd:
		dir = _src_last_fd
	else:
		dir = Vector2.from_angle((player.global_position - global_position).angle())
	var step: float = float(data["speed_pixels_per_tick"]) * ticks * multiplier
	var at := global_position
	var to := at + dir * step
	if _src_try_move(to, radius):
		_src_stuck_ticks = 0.0
	elif _src_try_move(Vector2(to.x, at.y), radius):
		_src_last_fd = Vector2(dir.x, 0.0); _src_has_last_fd = true; _src_stuck_ticks = 0.0
	elif _src_try_move(Vector2(at.x, to.y), radius):
		_src_last_fd = Vector2(0.0, dir.y); _src_has_last_fd = true; _src_stuck_ticks = 0.0
	else:
		_src_stuck_ticks += ticks
		var esc_ang := atan2(dir.y, dir.x)
		var esc := step * 0.8
		var escaped := false
		for i in range(1, 5):
			if escaped: break
			for a in [esc_ang + i * PI / 4.0, esc_ang - i * PI / 4.0]:
				if _src_try_move(at + Vector2(cos(a), sin(a)) * esc, radius):
					_src_last_fd = Vector2(cos(a), sin(a)); _src_has_last_fd = true; escaped = true
					break
		if not escaped and _src_stuck_ticks > 30.0:
			var small_r := maxf(2.0, radius - 2.0)
			for i in range(1, 9):
				if escaped: break
				for a in [esc_ang + i * PI / 8.0, esc_ang - i * PI / 8.0]:
					if _src_try_move(at + Vector2(cos(a), sin(a)) * esc, small_r):
						_src_last_fd = Vector2(cos(a), sin(a)); _src_has_last_fd = true; escaped = true
						break
		if not escaped and _src_stuck_ticks > 90.0 and step > 0.0:
			var tp_ang := (player.global_position - at).angle()
			var tp_d := step * 2.0
			while tp_d <= step * 6.0:
				if _src_try_move(at + Vector2(cos(tp_ang), sin(tp_ang)) * tp_d, radius):
					_src_stuck_ticks = 0.0
					break
				tp_d += step
		if escaped:
			_src_stuck_ticks = 0.0

func _apply_separation(ticks: float) -> void:
	if _separation_ticks > 0.0:
		_separation_ticks -= ticks
		return
	var push = Vector2.ZERO
	var origin = global_position
	var cutoff_squared = pow(radius * 4.4, 2.0)
	for other in world.get_enemies():
		if other == self or not is_instance_valid(other) or not bool(other.get("alive")):
			continue
		var difference = origin - other.global_position
		var distance_squared = difference.length_squared()
		if distance_squared > cutoff_squared:
			continue
		var minimum = radius + float(other.get("radius")) + 4.0
		if distance_squared > 0.01 and distance_squared < minimum * minimum:
			var distance = sqrt(distance_squared)
			push += difference / distance * ((minimum - distance) / minimum) * 1.5
	_move_native(push, ticks)
	_separation_ticks = 3.0

func _finish_motion(before: Vector2, ticks: float) -> void:
	var travelled = before.distance_to(global_position)
	_walk_distance += travelled
	if travelled * travelled > 0.25:
		_moving = true
		_move_hold = 3.0
	elif _move_hold > 0.0:
		_move_hold -= ticks
	else:
		_moving = false
	velocity = Vector2.ZERO
	z_index = clampi(int(global_position.y / 4.0), -2000, 4000)
	_update_animation()
	queue_redraw()

func _fire_projectile() -> void:
	if not alive or not is_instance_valid(player):
		return
	var aim = (player.global_position - global_position).normalized()
	facing = aim.angle()
	var shot = PHYSICAL_PROJECTILE.new()
	shot.configure(global_position, aim, data["projectile"].duplicate(true), player, world, native_frame)
	shot.telemetry_event.connect(_forward_event)
	world.add_child(shot)
	telemetry_event.emit("enemy_projectile_birth", {"id": data["id"], "position": [global_position.x, global_position.y], "aim": [aim.x, aim.y], "life_ticks": shot.life_ticks, "damage": shot.damage, "native_dtype": "parry", "parry_class": "physical"})

func _forward_event(kind: String, value: Dictionary) -> void:
	telemetry_event.emit(kind, value)

func receive_poise_damage(amount: float) -> void:
	# Existing crescent sends its poise request before HP damage. Defer until
	# that same packet has passed the native modifier and eShield stages.
	if alive and amount > 0.0:
		_pending_poise_amount += amount

func receive_damage(amount: int, direction: Vector2, source: String, opts: Dictionary = {}) -> void:
	var pending = _pending_poise_amount
	_pending_poise_amount = 0.0
	if not alive or amount <= 0:
		return
	var is_dot = bool(opts.get("dot", false))
	var damage = int(amount * (1.5 if _stun_ticks > 0.0 and not is_dot else 1.0))
	var absorbed = 0.0
	if (not is_dot or bool(opts.get("shieldHit", false))) and eShieldMax > 0.0 and eShield > 0.0:
		absorbed = minf(eShield, damage)
		eShield = maxf(0.0, eShield - damage)
		damage = maxi(0, int(damage - absorbed))
	if damage > 0:
		alerted = true
		if not is_dot:
			if state == "recover":
				state = "idle"
				st2 = 0.0
			elif state == "idle":
				st2 = minf(st2, 5.0)
		hp -= damage
		_hit_flash = 6.0
		if state == "idle":
			_hit_stun = float(data["hit_stun_ticks"])
		if not is_dot and not bool(opts.get("noKB", false)) and not direction.is_zero_approx():
			var kb_multiplier = float(opts.get("kbMult", 0.5 if source == "kiSlash" else 1.0))
			var magic_scale = 0.2 if bool(opts.get("magic", false)) else 1.0
			_knockback += direction.normalized() * minf(damage * 0.25 * kb_multiplier * magic_scale, 15.0 * kb_multiplier * magic_scale)
	if not is_dot and (pending > 0.0 or bool(opts.get("poiseHit", false))):
		var poise_multiplier = float(opts.get("poiseMult", pending / amount if pending > 0.0 else 1.0))
		_apply_poise(int(damage * poise_multiplier))
	telemetry_event.emit("enemy_damage", {"id": data["id"], "raw_amount": amount, "amount": damage, "absorbed": absorbed, "eShield": eShield, "hp": hp, "source": source, "poise": poise})
	if hp <= 0:
		alive = false
		state = "dead"
		charge_ticks = 0.0
		collision_layer = 0
		collision_mask = 0
		velocity = Vector2.ZERO
		if _body:
			_body.modulate.a = 0.5
			_walk.visible = false
		telemetry_event.emit("enemy_death", {"id": data["id"], "position": [global_position.x, global_position.y]})
	queue_redraw()

func _apply_poise(amount: int) -> void:
	if amount <= 0:
		return
	poise = maxf(0.0, poise - amount)
	_poise_regen = 0.0
	if poise <= 0.0:
		_stun_ticks = maxf(_stun_ticks, 180.0)
		if _source_normal_fields_configured:
			_record_native_normal_stun_max(180.0)
		telemetry_event.emit("enemy_stagger", {"id": data["id"], "ticks": _stun_ticks})

func _update_animation() -> void:
	if not _body or not alive:
		return
	var animation: Dictionary = data["animation"]
	var direction_index = posmod(roundi(fposmod(facing, TAU) / (PI / 4.0)), 8)
	var direction: String = animation["direction_angle_sectors"][direction_index]
	_body.texture = _base_textures[direction]
	_body.region_rect = _rect(animation["base_rect"])
	_walk.texture = _walk_textures[direction]
	var frame = posmod(int(floor(_walk_distance / float(animation["walk_pixels_per_frame"]))), 4)
	_walk.region_rect = _rect(animation["walk_frame_rects"][frame])
	_walk.visible = _moving
	var spawn_alpha = maxf(0.0, 1.0 - _spawn_ticks / 20.0) if _spawn_ticks > 0.0 else 1.0
	_body.modulate = Color(1.0 + _hit_flash / 6.0, 1.0, 1.0, spawn_alpha)
	_walk.modulate = _body.modulate

func _rect(value: Array) -> Rect2:
	return Rect2(float(value[0]), float(value[1]), float(value[2]), float(value[3]))

func get_snapshot() -> Dictionary:
	return {"id": data["id"], "order": source_order, "etype": etype, "element": element, "state": state, "alive": alive, "alerted": alerted, "hp": hp, "max_hp": max_hp, "eShield": eShield, "eShieldMax": eShieldMax, "poise": poise, "max_poise": max_poise, "charge_ticks": charge_ticks, "projectile_ticks": _projectile_ticks, "contact_ticks": _contact_ticks, "hit_stun_ticks": _hit_stun, "stun_ticks": _stun_ticks, "poise_regen_ticks": _poise_regen, "walk_distance": _walk_distance, "native_frame": native_frame, "facing": facing, "position": [position.x, position.y], "knockback": [_knockback.x, _knockback.y], "pending_poise_amount": _pending_poise_amount}

func _draw() -> void:
	if not alive:
		return
	# 차징 경고(링·라벨)는 원본처럼 적 몸 위 별도 패스(_drawEnemyShotWarnings G20097~)로 그린다.
	if not is_instance_valid(_src_shot_warning):
		_src_shot_warning = _SrcShotWarning.new()
		_src_shot_warning.name = "SourceShotWarning"
		_src_shot_warning.actor = self
		_src_shot_warning.z_as_relative = false
		_src_shot_warning.z_index = 4001
		add_child(_src_shot_warning)
	_src_shot_warning.queue_redraw()
	# P2-001a: 에너지 바 — 원본 drawEn(53961~53969) 규칙 그대로 (enemy.gd와 동일 공용 레이아웃).
	for bar in BAR_LAYOUT.build(radius, float(hp), float(mhp), eShield, eShieldMax,
			_stun_ticks, (_maxStunned if _source_max_stunned_present else null)):
		draw_rect(bar["rect"], bar["color"])

# Current fields of the exact factory-admitted normal actor. This is deliberately
# a partial field authority: absent/unported status lifetimes are not JS zero.
func read_native_source_damage_fields(caller: Node) -> Dictionary:
	var error := _source_normal_fields_error(caller)
	if not error.is_empty(): return {"ready": false, "reason": error}
	var report: Dictionary = {"ready": true, "scope": "CURRENT_TYPE%d_FIELDS_PARTIAL" % etype, "full_hurtE_ready": false,
		"source_clock_ready": false, "view": {"alive": alive, "hp": hp, "mhp": mhp,
			"etype": etype, "elite": elite, "el": el, "s": state, "st2": st2,
			"x": global_position.x, "y": global_position.y, "r": radius,
			"mods": mods.duplicate(true), "eShield": eShield, "eShieldMax": eShieldMax,
			"eRes": eRes.duplicate(true), "stunned": _stun_ticks, "_alerted": alerted,
			"_hitFlash": _hit_flash, "_hitStun": _hit_stun, "poise": poise,
			"maxPoise": max_poise, "poiseR": _poise_regen,
			"kb": {"x": _knockback.x, "y": _knockback.y}},
		"legacy_pending_poise": _pending_poise_amount,
		"unowned": ["source_update_clock", "remaining_optional_status_lifetimes",
			"shared_rng_and_vfx", "source_poise_break_tail", "normal_kill_pipeline"]}
	if _source_max_stunned_present:
		report["view"]["_maxStunned"] = _maxStunned
	return report

func _source_normal_fields_domain_current() -> bool:
	# game.html:31164 poise=maxPoise=_hp; 19973-20001 non-boss branch, exact type0 factory actor only.
	return data.get("id") == "ch1_initial_015" and source_order == 14 and etype == 0 and elite == 0 and el == 0 and element == "physical" and data.get("element") == "physical" and mods.is_empty() and get_script().resource_path == "res://scripts/enemy_melee_flesh_crawler.gd"

func _source_normal_fields_error(caller: Node) -> String:
	if not _source_normal_fields_configured: return "exact_normal_factory_actor_not_owned"
	if not is_instance_valid(world) or caller != world or is_queued_for_deletion() or not is_inside_tree(): return "actual_actor_world_lost"
	if world.is_queued_for_deletion() or not world.is_inside_tree() or get_parent() != world or get_tree() != world.get_tree(): return "actual_actor_world_lost"
	if not world.has_method("get_native_world_identity") or not world.get_native_world_identity().has(self): return "actual_actor_registry_lost"
	if not _source_normal_fields_domain_current(): return "current_normal_actor_domain_changed"
	return ""

# Not an HP setter: only the active, same-World source-prefix owner can apply a
# source-located field item. There is no receive_damage call, multiplier, poise
# deferral, extra alive gate or kill/render fallback in this route.
func commit_native_source_damage_field(owner: RefCounted, item: Dictionary) -> Dictionary:
	if not _source_normal_fields_error(world).is_empty() or not world.has_method("is_native_normal_enemy_field_call_current") or not world.is_native_normal_enemy_field_call_current(owner, self): return {"applied": false, "reason": "actual_source_field_call_not_current"}
	if not owner.is_applying_item(self, item): return {"applied": false, "reason": "source_field_item_not_current"}
	var field: Variant = item.get("field")
	var line: Variant = item.get("line")
	var value: Variant = item.get("value")
	if not field is String or not line is int: return {"applied": false, "reason": "source_field_item_shape"}
	var number: bool = (value is int or value is float) and is_finite(float(value))
	match field:
		"eShield":
			if line != 42347 or not number or value < 0 or value > eShield: return {"applied": false, "reason": "source_shield_write_outside_contract"}
			eShield = value
		"_alerted":
			if line != 42380 or not value is bool or not value: return {"applied": false, "reason": "source_alert_write_outside_contract"}
			alerted = true
		"s":
			if line != 42382 or not value is String or value != "idle" or state != "recover": return {"applied": false, "reason": "source_recover_transition_not_current"}
			state = "idle"
		"st2":
			if line != 42382 or not number or state != "idle": return {"applied": false, "reason": "source_st2_write_outside_contract"}
			if value == 0 and owner.follows_recover_transition(): st2 = 0.0
			elif value == 5 and st2 > 5: st2 = 5.0
			else: return {"applied": false, "reason": "source_st2_write_outside_contract"}
		"hp":
			if line != 42383 or not number or value > hp: return {"applied": false, "reason": "source_hp_write_outside_contract"}
			hp = value
		"_hitFlash":
			if not number or not ((line == 42394 and value == 4) or (line == 42412 and value == 6)): return {"applied": false, "reason": "source_flash_write_outside_contract"}
			_hit_flash = value
		"_hitStun":
			if line != 42414 or not number or value != 8 or state != "idle": return {"applied": false, "reason": "source_hit_stun_write_outside_contract"}
			_hit_stun = value
		_:
			return {"applied": false, "reason": "source_field_owner_unbound:" + field}
	return {"applied": true}

func _record_native_normal_stun_max(stun_time: float) -> bool:
	# This 0 is the original (known-absent key || 0), never an unknown owner.
	var previous: Variant = _maxStunned if _source_max_stunned_present else 0.0
	if not (previous is int or previous is float) or not is_finite(float(previous)): return false
	_maxStunned = maxf(float(previous), stun_time)
	_source_max_stunned_present = true
	return true

# Only the actual same-World poise callback enters this atomic normal branch.
# The deferred legacy request queue is neither consumed nor cleared here.
func apply_native_source_poise_hit(owner: RefCounted, amount: Variant) -> Dictionary:
	if not _source_normal_fields_error(world).is_empty() or not world.is_native_normal_enemy_field_call_current(owner, self) or not owner.is_applying_poise(self): return {"ready": false, "reason": "actual_source_poise_call_not_current", "poise_core_applied": false, "source_body_returned": false}
	if typeof(amount) != TYPE_INT: return {"ready": false, "reason": "source_poise_42490_amount_not_int", "poise_core_applied": false, "source_body_returned": false}
	# Source 19973 returns false without changing poiseR or any stun field.
	if not alive or amount <= 0:
		return {"ready": true, "source_return": false, "source_body_returned": true, "source_branch_entered": true, "poise_core_applied": false}
	if _pending_poise_amount != 0.0: return {"ready": false, "reason": "legacy_deferred_poise_pending", "poise_core_applied": false, "source_body_returned": false}
	if not is_finite(poise): return {"ready": false, "reason": "current_source_poise_fields_unsupported", "poise_core_applied": false, "source_body_returned": false}
	# Stun/max-stun are read only on the breaking branch in the original.
	if poise - amount <= 0.0:
		if not is_finite(_stun_ticks): return {"ready": false, "reason": "current_source_poise_fields_unsupported", "poise_core_applied": false, "source_body_returned": false}
		if _source_max_stunned_present and (not (_maxStunned is int or _maxStunned is float) or not is_finite(float(_maxStunned))): return {"ready": false, "reason": "current_source_max_stunned_unsupported", "poise_core_applied": false, "source_body_returned": false}
	# R19976-19982: same actual poise, regen, stun and max-stun lifetime.
	poise -= amount
	_poise_regen = 0.0
	if poise > 0.0:
		return {"ready": true, "source_return": false, "source_body_returned": true, "source_branch_entered": true, "poise_core_applied": true}
	poise = 0.0
	_stun_ticks = maxf(_stun_ticks, 180.0)
	_record_native_normal_stun_max(180.0)
	# The source has NOT returned true yet. Do not fabricate current _uqScCtx,
	# unique refunds, sound/text, slowMo or the 14 presentation RNG draws.
	return {"ready": false, "reason": "source_poise_sky_context_unbound_19985",
		"source_body_returned": false, "source_branch_entered": true,
		"poise_core_applied": true, "core_staggered": true, "next_source_line": 19985}

# Consume only the source-located momentum increment. Actor existence/ownership
# is separate from alive: hurtE can enqueue this after self-nested death.
# No damage API, heading normalization, KB formula, cap, damping or clock here.
func commit_native_source_kb_add(owner: RefCounted, item: Dictionary) -> Dictionary:
	if not _source_normal_fields_error(world).is_empty() or not world.is_native_normal_enemy_field_call_current(owner, self) or not owner.is_applying_item(self, item): return {"applied": false, "reason": "actual_source_kb_item_not_current"}
	if not item.get("kind") is String or item["kind"] != "enemy.kb_add" or typeof(item.get("line")) != TYPE_INT or item["line"] != 42482 or not item.get("data") is Dictionary: return {"applied": false, "reason": "source_kb_request_outside_contract"}
	var payload: Dictionary = item["data"]
	var x: Variant = payload.get("x")
	var y: Variant = payload.get("y")
	if not (x is int or x is float) or not (y is int or y is float) or not is_finite(float(x)) or not is_finite(float(y)): return {"applied": false, "reason": "source_kb_increment_not_numeric_finite"}
	var increment := Vector2(float(x), float(y))
	if not increment.is_finite() or not _knockback.is_finite(): return {"applied": false, "reason": "source_kb_vector_not_representable"}
	var combined: Vector2 = _knockback + increment
	if not combined.is_finite(): return {"applied": false, "reason": "source_kb_sum_not_representable"}
	_knockback = combined
	return {"applied": true}
# ═══ P1-002.F: 기본 근접 hurtE 경로의 적 측 owner API (generic enemy.gd와 동일 계약) ═══
# 공용 구현: native_dedicated_enemy_hurte_owner.gd. 기존 receive_damage·고유 경로는 유지.
func read_native_normal_enemy_hurte_fields(caller_world: Node) -> Dictionary:
	return HURTE_OWNER.read_fields(self, caller_world)

func apply_native_normal_enemy_field_write(field: String, value: Variant) -> Dictionary:
	if field == "spike_slow": # P2-001l — 37471 e._spikeSlow=max(,90) (enemy.gd 334~338 동일)
		if not (value is Array and value.size() == 2):
			return {"applied": false, "reason": "native_enemy_spike_slow_value_unsupported"}
		_spike_slow = maxf(_spike_slow, float(value[0]))
		_spike_slow_lv = int(value[1])
		return {"applied": true, "field": field, "applied_value": value}
	return HURTE_OWNER.apply_field_write(self, HURTE_CONTACT_FIELD, field, value)

func apply_native_normal_enemy_bookkeeping(fields: Dictionary) -> Dictionary:
	return HURTE_OWNER.apply_bookkeeping(self, fields)

# PC-COMBAT-KILL(2026-10-22): 42490 포이즈 — 원본 _poiseHit(19973~19983) 비보스 코어.
# v3 exact domain actor(ch1_initial_015)는 기존 v3 field call만 쓴다(이중 owner 금지 — 여기서 거부).
# 그 밖의 flesh_crawler 본체 actor(커튼 5링·Group-A a_0/a_5/a_6·자연 소환)는 v3 domain이 의도적으로
# 닫혀 있어(Mac 계약 v3_exact_initial_domain_not_weakened) 그동안 42490에서 정지했다 — 같은 공용 코어
# (native_dedicated_enemy_hurte_owner.apply_poise_core, spine/ice/hive와 동일)로 적용한다.
func apply_native_normal_enemy_poise_core(amount: int) -> Dictionary:
	if _source_normal_fields_configured:
		return {"applied": false, "reason": "v3_domain_actor_uses_source_field_call"}
	if _pending_poise_amount != 0.0:
		return {"applied": false, "reason": "legacy_deferred_poise_pending"}
	var result: Dictionary = HURTE_OWNER.apply_poise_core(self, amount)
	if result.get("staggered") == true:
		_maxStunned = data["native_final"]["_maxStunned"]
		_source_max_stunned_present = true
	return result

func apply_native_normal_enemy_hp_write(write: Dictionary) -> Dictionary:
	return HURTE_OWNER.apply_hp_write(self, write)

func apply_native_normal_enemy_death_write() -> Dictionary:
	return HURTE_OWNER.apply_death_write(self)

func report_native_normal_enemy_hurte_event(kind: String, payload: Dictionary) -> void:
	telemetry_event.emit(kind, payload)

func add_native_knockback(value: Vector2) -> void:
	if alive and value.is_finite(): _knockback += value

# PCI-10 (PC-LIFE-PACK 2026-10-21): 시체 부활 writer(G38949–38950). 공용 구현 HURTE_OWNER.apply_corpse_revive.
func apply_native_enemy_corpse_revive(caller_world: Node) -> Dictionary:
	return HURTE_OWNER.apply_corpse_revive(self, caller_world, "st2")
