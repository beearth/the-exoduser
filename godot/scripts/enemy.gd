class_name ExoduserEnemy
extends CharacterBody2D

signal telemetry_event(kind: String, data: Dictionary)

const ENEMY_PROJECTILE = preload("res://scripts/enemy_projectile.gd")
const BAR_LAYOUT = preload("res://scripts/native_enemy_bar_layout.gd")

var data: Dictionary = {}
var _native_hp_actor_script: WeakRef = weakref(get_script())
var _native_hp_bound_world: WeakRef
var _native_hp_bound_world_script: WeakRef
var _native_hp_bound_main: WeakRef
var _native_hp_bound_main_script: WeakRef

var world: Node2D
var player: Node2D
var spawn_position = Vector2.ZERO
var hp = 875
var max_hp = 875
var mhp = 875
var poise = 875.0
var max_poise = 875.0
var radius = 34.0
var attack = 31
var etype = 4
var element = "dark"
var elite = 0
var mods: Array = []
var aura: Variant = null
var native_flags: Dictionary = {}
var initial_timers: Dictionary = {}
var source_order = -1
var alive = true
var state = "idle"
var alerted = false
var facing = PI * 0.5
var charge_ticks = 0.0
var _projectile_ticks = 240.0
var _contact_ticks = 0.0
var _hit_stun = 0.0
var _stun_ticks = 0.0
# P2-005c — 가시덫 감속(37471 e._spikeSlow=90·lv / 34398 소비: _aSpdM×=(1−slowPct),
# slowPct=_spikeTrapSlowPct 45506=min(.95,.91+.02(lv−1)) / 38613 kb도 동일 감쇠).
var _spike_slow := 0.0
var _spike_slow_lv := 1
# P2-005d — 냉기 프리즌(42446~42460·38644~38657): 게이지·빙결·면역·얼음파편 저항깎기.
# _iceResDown(아이스스톰 디버프)은 미이식 — 축적 배율 1 고정 기록.
var _freeze_gauge := 0.0
var _freeze_max := 0.0
var _frozen := 0.0
var _frozen_immune := 0.0
var _ice_shard_res := 0.0
var _poise_regen = 0.0
var _hit_flash = 0.0
var _motion_ms = 0.0
var _rng = RandomNumberGenerator.new()
var _body: Sprite2D
var _moving = false
var _knockback = Vector2.ZERO
# P1-002.E: mkEn은 모든 적에게 eShield=mhp를 부여(game.html:31178) — native_final이 owner 값.
var eShield = 0.0
var eShieldMax = 0.0
var e_res: Array = [0, 0, 0, 0, 0, 0, 0]

func configure(value: Dictionary, owner_world: Node2D) -> void:
	data = value
	world = owner_world
	_native_hp_bound_world = weakref(owner_world)
	var bound_world_script: Script = owner_world.get_script()
	_native_hp_bound_world_script = weakref(bound_world_script) if bound_world_script != null else null
	var bound_main: Node = owner_world.get_parent()
	_native_hp_bound_main = weakref(bound_main) if bound_main != null else null
	var bound_main_script: Script = bound_main.get_script() if bound_main != null else null
	_native_hp_bound_main_script = weakref(bound_main_script) if bound_main_script != null else null
	spawn_position = Vector2(float(data["spawn_position"][0]), float(data["spawn_position"][1]))
	position = spawn_position
	hp = int(data["hp"])
	max_hp = hp
	mhp = hp
	poise = float(data["poise"])
	max_poise = float(data.get("max_poise", hp))
	attack = int(data["attack"])
	etype = int(data.get("etype", 4))
	element = str(data.get("element", "dark"))
	elite = int(data.get("elite", 0))
	mods = data.get("mods", []).duplicate(true)
	aura = data.get("aura")
	native_flags = data.get("native_flags", {}).duplicate(true)
	initial_timers = data.get("initial_timers", {}).duplicate(true)
	source_order = int(data.get("order", -1))
	facing = float(data.get("facing", PI * 0.5))
	radius = float(data["radius"])
	_contact_ticks = float(data["initial_idle_ticks"])
	_projectile_ticks = float(data["initial_projectile_ticks"])
	_poise_regen = float(initial_timers.get("poiseR", 0.0))
	charge_ticks = float(initial_timers.get("chargeT", 0.0))
	var native: Dictionary = data.get("native_final", {})
	eShield = float(native.get("eShield", 0.0))
	eShieldMax = float(native.get("eShieldMax", 0.0))
	var native_res: Variant = native.get("eRes")
	if native_res is Array:
		e_res = native_res.duplicate(true)
	state = str(native.get("s", "idle"))
	alive = bool(native.get("alive", true))
	_hit_stun = float(native.get("stunned", 0.0))
	var native_kb: Dictionary = native.get("kb", {})
	_knockback = Vector2(float(native_kb.get("x", 0.0)), float(native_kb.get("y", 0.0)))
	_rng.seed = int(data["factory_random_seed"])

func _ready() -> void:
	name = str(data["id"])
	add_to_group("enemies")
	collision_layer = 4
	collision_mask = 1 # Terrain/props only; source normal enemies do not block player bodies.
	physics_interpolation_mode = Node.PHYSICS_INTERPOLATION_MODE_ON
	z_as_relative = false
	var shape = CollisionShape2D.new()
	var circle = CircleShape2D.new()
	circle.radius = radius
	shape.shape = circle
	add_child(shape)
	_body = Sprite2D.new()
	_body.texture = load(data["animation"]["texture"])
	_body.hframes = 4
	_body.vframes = 8
	_body.scale = Vector2.ONE * (float(data["animation"]["draw_height"]) / 256.0)
	_body.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	add_child(_body)
	var decor:=preload("res://scripts/native_enemy_source_decor.gd").new()
	decor.name="SourceEnemyDecor";add_child(decor);decor.configure(self)
	_update_animation()
	telemetry_event.emit("enemy_spawn", {"id": data["id"], "order": source_order, "etype": etype, "element": element, "position": [position.x, position.y], "hp": hp, "radius": radius, "native_speed": data["speed_pixels_per_tick"], "facing": facing})

func set_player(value: Node2D) -> void:
	player = value
	if is_node_ready() and is_instance_valid(_body):
		_update_animation()

func _physics_process(delta: float) -> void:
	if not alive or not is_instance_valid(player):
		return
	var ticks = delta * 60.0
	_motion_ms += delta * 1000.0
	_hit_flash = maxf(0.0, _hit_flash - ticks)
	if _frozen > 0.0: # 38644~38649 프리즌: 행동불가 (파란 틴트·_cancelProjCharge 상당=charge 리셋)
		charge_ticks = 0.0
		_frozen = maxf(0.0, _frozen - ticks)
		if _frozen == 0.0:
			_freeze_gauge = 0.0
			_frozen_immune = 300.0 if (data.get("native_final", {}) as Dictionary).get("ib") == true else 120.0
		velocity = Vector2.ZERO
		_update_animation()
		queue_redraw()
		return
	if _frozen_immune > 0.0: # 38651
		_frozen_immune = maxf(0.0, _frozen_immune - ticks)
	if _ice_shard_res > 0.0: # 38653 — ~5초에 10% 회복
		_ice_shard_res = maxf(0.0, _ice_shard_res - 0.002 * ticks)
	if _freeze_gauge > 0.0: # 38657 — 안 맞으면 자연 감소
		_freeze_gauge = maxf(0.0, _freeze_gauge - ticks * 0.3)
	if _knockback.length_squared() > 0.02:
		var next = global_position + _knockback * ticks
		if world.can_move(next, radius):
			velocity = _knockback * 60.0
			move_and_slide()
		else:
			_knockback = Vector2.ZERO
		_knockback *= pow(0.85, ticks)
	_hit_stun = maxf(0.0, _hit_stun - ticks)
	if _stun_ticks > 0.0:
		_stun_ticks = maxf(0.0, _stun_ticks - ticks)
		charge_ticks = 0.0
		if _stun_ticks == 0.0:
			poise = float(max_hp)
		velocity = Vector2.ZERO
		_update_animation()
		queue_redraw()
		return
	if _hit_stun > 0.0:
		velocity = Vector2.ZERO
		_update_animation()
		queue_redraw()
		return
	if poise < max_hp:
		_poise_regen += ticks
		if _poise_regen >= float(data["poise_regen_ticks"]):
			poise = minf(float(max_hp), poise + floorf(max_hp * float(data["poise_regen_fraction"])))
			_poise_regen = 0.0
	var distance = global_position.distance_to(player.global_position)
	if not alerted and distance < float(data["aggro_range"]) and world.has_line_of_sight(global_position, player.global_position):
		alerted = true
		telemetry_event.emit("enemy_aggro", {"id": data["id"], "distance": distance})
	if alerted and distance < float(data["aggro_range"]):
		facing = (player.global_position - global_position).angle()
	# Charge decrements independently of idle/contact cooldown; born projectiles own their lifetime.
	if charge_ticks > 0.0:
		charge_ticks = maxf(0.0, charge_ticks - ticks)
		if charge_ticks == 0.0:
			_fire_projectile()
	if not alerted and distance > 400.0:
		velocity = Vector2.ZERO
		_moving = false
		_update_animation()
		queue_redraw()
		return
	if player.get("hp") != null and float(player.get("hp")) <= 0.0:
		velocity = Vector2.ZERO
		return
	_contact_ticks -= ticks
	var to_player = Vector2.from_angle(facing)
	var native_speed = float(data["speed_pixels_per_tick"])
	if _spike_slow > 0.0: # 34398 — 가시덫 감속 소비(틱 감소 + 속도 (1−slowPct))
		_spike_slow = maxf(0.0, _spike_slow - 1.0)
		native_speed *= 1.0 - minf(0.95, 0.91 + 0.02 * float(_spike_slow_lv - 1))
	var movement = to_player * native_speed * float(data["idle_movement_multiplier"])
	if alerted and distance > float(data["pursuit_stop_distance"]):
		movement += world.get_path_direction(global_position) * native_speed
	velocity = movement * 60.0
	var before = global_position
	if world.can_move(global_position + velocity * delta, radius):
		move_and_slide()
	else:
		velocity = Vector2.ZERO
	_moving = before.distance_squared_to(global_position) > 0.25
	z_index = clampi(int(global_position.y / 4.0), -2000, 4000)
	distance = global_position.distance_to(player.global_position)
	var player_radius = float(player.get("radius")) if player.get("radius") != null else 15.0
	if distance < radius + player_radius + float(data["contact_extra_radius"]) and _contact_ticks <= 0.0:
		var amount = int(attack * float(data["contact_damage_multiplier"]))
		player.receive_damage(amount)
		_contact_ticks = float(data["contact_cooldown_min_ticks"]) + _rng.randi_range(0, int(data["contact_cooldown_random_ticks"]) - 1)
		telemetry_event.emit("enemy_contact", {"id": data["id"], "damage_request": amount, "cooldown_ticks": _contact_ticks})
	if charge_ticks <= 0.0:
		_projectile_ticks -= ticks
		if _projectile_ticks <= 0.0 and distance < float(data["projectile_range"]):
			_projectile_ticks = float(data["projectile_cooldown_ticks"])
			charge_ticks = float(data["projectile_charge_ticks"])
			telemetry_event.emit("enemy_charge", {"id": data["id"], "ticks": charge_ticks, "position": [global_position.x, global_position.y]})
	_update_animation()
	queue_redraw()

func _fire_projectile() -> void:
	if not is_instance_valid(player) or not alive:
		return
	var shot = ENEMY_PROJECTILE.new()
	var aim = (player.global_position - global_position).normalized()
	shot.configure(global_position, aim, attack * 2, player, world, _rng.randf_range(500.0, 600.0))
	shot.telemetry_event.connect(_forward_event)
	world.add_child(shot)
	telemetry_event.emit("enemy_projectile_birth", {"id": data["id"], "position": [global_position.x, global_position.y], "aim": [aim.x, aim.y], "life_ticks": 120.0, "damage": attack * 2, "contact_damage_request": int(attack * 2 * 1.3)})

func _forward_event(kind: String, value: Dictionary) -> void:
	telemetry_event.emit(kind, value)

func _native_enemy_hp_owner_is_current() -> bool:
	var bound_world: Variant = _native_hp_bound_world.get_ref() if _native_hp_bound_world != null else null
	var bound_main: Variant = _native_hp_bound_main.get_ref() if _native_hp_bound_main != null else null
	var actor_script: Variant = _native_hp_actor_script.get_ref() if _native_hp_actor_script != null else null
	var world_script: Variant = _native_hp_bound_world_script.get_ref() if _native_hp_bound_world_script != null else null
	var main_script: Variant = _native_hp_bound_main_script.get_ref() if _native_hp_bound_main_script != null else null
	if not is_inside_tree() or is_queued_for_deletion() or not actor_script is Script \
			or not is_same(actor_script, get_script()):
		return false
	if not bound_world is Node2D or not is_instance_valid(bound_world) \
			or bound_world.is_queued_for_deletion() or not bound_world.is_inside_tree() \
			or not world_script is Script \
			or not is_same(world_script, bound_world.get_script()) \
			or not is_same(world, bound_world) or not is_same(get_parent(), bound_world) \
			or not is_same(get_tree(), bound_world.get_tree()):
		return false
	if not bound_main is Node or not is_instance_valid(bound_main) \
			or bound_main.is_queued_for_deletion() or not bound_main.is_inside_tree() \
			or not main_script is Script \
			or not is_same(main_script, bound_main.get_script()) \
			or not is_same(bound_world.get_parent(), bound_main) \
			or not is_same(get_tree(), bound_main.get_tree()) \
			or not is_same(bound_main.get("world"), bound_world):
		return false
	return true

func apply_native_normal_enemy_hp_write(write: Dictionary) -> Dictionary:
	# This is the real native HP field owner, not a result cursor or a shadow view.
	var report := {"status":"NOT_READY", "applied":false, "owner":self,
		"owner_script":get_script(), "world":world, "write":write}
	if not _native_enemy_hp_owner_is_current():
		report["reason"] = "native_enemy_hp_owner_not_current"
		return report
	var field: Variant = write.get("field")
	if typeof(field) != TYPE_STRING or field != "hp":
		report["reason"] = "native_enemy_write_field_unsupported"
		return report
	if not write.has("value"):
		report["reason"] = "native_enemy_hp_value_missing"
		return report
	var value: Variant = write["value"]
	if typeof(value) != TYPE_INT and typeof(value) != TYPE_FLOAT:
		report["reason"] = "native_enemy_hp_value_unsupported"
		return report
	if typeof(value) == TYPE_FLOAT and not is_finite(value):
		report["reason"] = "native_enemy_hp_non_finite"
		return report
	hp = value
	report["status"] = "APPLIED"
	report["applied"] = true
	report["field"] = "hp"
	report["applied_value"] = value
	return report

# ═══ P1-002.E: 기본 근접 hurtE 경로의 적 측 owner API ═══
# 읽기: hurtE가 참조하는 적 필드의 현재 값. 쓰기 전 스냅샷 용도.
func read_native_normal_enemy_hurte_fields(caller_world: Node) -> Dictionary:
	if caller_world != world or not _native_enemy_hp_owner_is_current():
		return {"ready": false, "reason": "native_enemy_hurte_owner_not_current"}
	var native: Dictionary = data.get("native_final", {})
	return {"ready": true, "alive": alive, "hp": hp, "mhp": mhp,
		"eShield": eShield, "eShieldMax": eShieldMax, "eRes": e_res.duplicate(),
		"etype": etype, "el": int(native.get("el", 0)), "elite": elite,
		"mods": mods.duplicate(), "ib": native.get("ib") == true,
		"stunned": _stun_ticks, "state": state, "lv": int(data.get("level", 1)),
		"radius": radius, "reviveIframes": float(native.get("reviveIframes", 0.0)),
		"_revived": native.get("_revived") == true, "_isGhoul": native.get("_isGhoul") == true,
		"_isDecoy": native.get("_isDecoy") == true, "_aDefM": native.get("_aDefM"),
		"_shockStk": float(native.get("_shockStk", 0.0)), "_cursed": float(native.get("_cursed", 0.0)),
		"_frozen": _frozen, "_frozenImmune": _frozen_immune, "_iceShardRes": _ice_shard_res,
		"bleed": float(native.get("bleed", 0.0)),
		"bleedT": float(native.get("bleedT", 0.0)), "_weakPhys": float(native.get("_weakPhys", 0.0)),
		"_shockDR": float(native.get("_shockDR", 0.0)), "_blinkWeak": float(native.get("_blinkWeak", 0.0))}

# hurtE 본문의 개별 적 필드 쓰기 (화이트리스트·순서는 호출자 journal이 보존).
func apply_native_normal_enemy_field_write(field: String, value: Variant) -> Dictionary:
	if not _native_enemy_hp_owner_is_current():
		return {"applied": false, "reason": "native_enemy_hurte_owner_not_current"}
	match field:
		"eShield": # 42346~42348
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_shield_value_unsupported"}
			eShield = maxf(0.0, float(value))
			queue_redraw()
		"alerted": # 42380
			if not value is bool:
				return {"applied": false, "reason": "native_enemy_alerted_value_unsupported"}
			alerted = value
		"contact_clamp": # 42382 — generic enemy.gd의 st2 대응 필드는 _contact_ticks
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_contact_value_unsupported"}
			_contact_ticks = minf(_contact_ticks, float(value))
		"hit_flash": # 42412
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_flash_value_unsupported"}
			_hit_flash = float(value)
		"hit_stun": # 42414
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_stun_value_unsupported"}
			_hit_stun = float(value)
		"stunned": # P2-005b — 지옥강타 1 스턴(46556~46560): e.stunned=Math.max(e.stunned, v)
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_stunned_value_unsupported"}
			_stun_ticks = maxf(_stun_ticks, float(value))
		"freeze_hit": # P2-005d — 42446~42458: value=[dmg]. 게이트·축적·발동을 적이 소유.
			if not value is Array or (value as Array).size() != 1 \
					or not (value[0] is int or value[0] is float) or not is_finite(float(value[0])):
				return {"applied": false, "reason": "native_enemy_freeze_value_unsupported"}
			if _frozen > 0.0 or _frozen_immune > 0.0: # 42446 (e._frozen||0)<=0&&(e._frozenImmune||0)<=0
				return {"applied": true, "field": field, "triggered": false, "skipped": true}
			var frozen_boss: bool = (data.get("native_final", {}) as Dictionary).get("ib") == true
			if _freeze_max <= 0.0: # 42447 e._freezeMax=e.ib?500:100
				_freeze_max = 500.0 if frozen_boss else 100.0
			# 42449~42451: _iceResMul=1(아이스스톰 미이식 기록)·_iceShardMul=1+_iceShardRes·보스 30%
			var freeze_add: float = (float(value[0]) * 0.3 if frozen_boss else float(value[0])) \
				* (1.0 + _ice_shard_res)
			_freeze_gauge = minf(_freeze_max, _freeze_gauge + freeze_add)
			if _freeze_gauge >= _freeze_max: # 42453~42456
				_frozen = 180.0
				_freeze_gauge = 0.0
				queue_redraw()
				return {"applied": true, "field": field, "triggered": true, "gauge": 0.0}
			return {"applied": true, "field": field, "triggered": false, "gauge": _freeze_gauge}
		"ice_shard_res": # P2-005d — 35584: e._iceShardRes=min(1, +0.10)
			_ice_shard_res = minf(1.0, _ice_shard_res + 0.10)
		"spike_slow": # P2-005c — 가시덫(37471): e._spikeSlow=max(,90), value=[틱, lv]
			if not value is Array or (value as Array).size() != 2:
				return {"applied": false, "reason": "native_enemy_spike_slow_value_unsupported"}
			_spike_slow = maxf(_spike_slow, float(value[0]))
			_spike_slow_lv = int(value[1])
		_:
			return {"applied": false, "reason": "native_enemy_hurte_field_unsupported:" + field}
	return {"applied": true, "field": field, "applied_value": value}

# native_final 북키핑 (부활 플래그·부활 무적 등 — 동작 미이식, 기록만 소유).
func apply_native_normal_enemy_bookkeeping(fields: Dictionary) -> Dictionary:
	if not _native_enemy_hp_owner_is_current():
		return {"applied": false, "reason": "native_enemy_hurte_owner_not_current"}
	var native: Variant = data.get("native_final")
	if not native is Dictionary:
		return {"applied": false, "reason": "native_enemy_final_record_missing"}
	var allowed: Array = ["reviveIframes", "_revived", "_reviveTimer", "_reviveX", "_reviveY", "_reviveAsGhoul"]
	for field in fields:
		if field not in allowed:
			return {"applied": false, "reason": "native_enemy_bookkeeping_field_unsupported:" + str(field)}
	for field in fields:
		native[field] = fields[field]
	return {"applied": true, "count": fields.size()}

# 42702: e.alive=false — receive_damage 사망 블록과 동일한 적 측 확정.
func apply_native_normal_enemy_death_write() -> Dictionary:
	if not _native_enemy_hp_owner_is_current():
		return {"applied": false, "reason": "native_enemy_hurte_owner_not_current"}
	if not alive:
		return {"applied": false, "reason": "native_enemy_already_dead"}
	alive = false
	state = "dead"
	charge_ticks = 0.0
	velocity = Vector2.ZERO
	collision_layer = 0
	collision_mask = 0
	# P2-001b: 원본은 사망 즉시 본체 렌더 제외(drawEn alive 게이트) — 시체(_addCorpse)가
	# 대체한다. 기존 '어두운 반투명 모듈레이트'는 원본과 달라 제거 (hurtE 경로 전용;
	# receive_damage 레거시 경로는 killer 파이프라인/시체가 없어 기존 연출 유지).
	if is_instance_valid(_body):
		_body.visible = false
	telemetry_event.emit("enemy_death", {"id": data["id"], "position": [global_position.x, global_position.y]})
	queue_redraw()
	return {"applied": true}

# P1-002.G: 42490 포이즈 — 원본 _poiseHit(game.html:19973~19983) 코어의 적 측 owner.
# 연출 꼬리(19985~)는 hurtE 실행자 소관. 레거시 receive_poise_damage와 별개 경로.
func apply_native_normal_enemy_poise_core(amount: int) -> Dictionary:
	if not _native_enemy_hp_owner_is_current():
		return {"applied": false, "reason": "native_enemy_hurte_owner_not_current"}
	if not alive or amount <= 0: # 19974: 상태 무변경 false
		return {"applied": true, "staggered": false, "entered": false}
	poise = poise - float(amount)
	_poise_regen = 0.0
	if poise <= 0.0:
		poise = 0.0
		_stun_ticks = maxf(_stun_ticks, 180.0)
		var native: Variant = data.get("native_final")
		if native is Dictionary:
			var previous: float = 0.0
			if native.get("_maxStunned") is int or native.get("_maxStunned") is float:
				previous = float(native["_maxStunned"])
			native["_maxStunned"] = maxf(previous, 180.0)
		return {"applied": true, "staggered": true, "entered": true}
	return {"applied": true, "staggered": false, "entered": true}

# hurtE 실행자가 적 명의의 telemetry를 내보낼 때 사용 (오디오 소비자 등 기존 배선 호환).
func report_native_normal_enemy_hurte_event(kind: String, payload: Dictionary) -> void:
	telemetry_event.emit(kind, payload)

func receive_damage(amount: int, direction: Vector2, source: String, source_options: Dictionary = {}) -> void:
	if not alive or amount <= 0:
		return
	if source=="parryBlueBean" and source_options.get("parryBlueBean")==true:
		# R42751: minimum 10% max HP, not a 0.1 damage multiplier.
		amount=maxi(amount,int(mhp*0.10))
	alerted = true
	_contact_ticks = minf(_contact_ticks, 5.0)
	var hp_write: Dictionary = apply_native_normal_enemy_hp_write({"field":"hp", "value":hp - amount})
	if hp_write.get("applied") != true:
		return
	_hit_flash = 6.0
	_hit_stun = float(data["hit_stun_ticks"])
	if source == "weapon" and not direction.is_zero_approx():
		_knockback += direction.normalized() * minf(amount * 0.25, 15.0)
	# The native player attack owns poise amount. Damage is not silently reused as poise damage.
	telemetry_event.emit("enemy_damage", {"id": data["id"], "amount": amount, "hp": hp, "source": source, "direction": [direction.x, direction.y]})
	if hp <= 0:
		alive = false
		state = "dead"
		charge_ticks = 0.0
		velocity = Vector2.ZERO
		collision_layer = 0
		collision_mask = 0
		_body.modulate = Color(0.45, 0.32, 0.34, 0.5)
		telemetry_event.emit("enemy_death", {"id": data["id"], "position": [global_position.x, global_position.y]})
	queue_redraw()

func add_native_knockback(value: Vector2) -> void:
	if alive and value.is_finite():_knockback+=value

func receive_native_e_wave(amount: int, direction: Vector2, level: float) -> Dictionary:
	if not alive or not direction.is_finite():return {"accepted":false}
	var before: float=hp
	var native: Dictionary=data.get("native_final",{})
	if native.get("ib")==true:return {"accepted":false,"reason":"boss_hurtE_not_adopted"}
	receive_damage(amount,direction,"shield_wave")
	_knockback+=direction*(30.0+level*3.0)
	if native.get("boss")==true:poise=maxf(0.0,poise-30.0)
	elif not native.get("_groggy",false):
		native["_groggy"]=true
		native["groggyT"]=90.0
		native["s"]="hit"
	return {"accepted":true,"hp_before":before,"hp_after":hp,"kb_add":direction*(30.0+level*3.0),"poise":poise,"groggy_bookkeeping":native.get("_groggy",false)}

func receive_native_e_slam(amount: int, direction: Vector2, stun_ticks: float) -> Dictionary:
	if not alive:return {"accepted":false}
	var before: float = hp
	var poise_before: float = poise
	receive_damage(amount,direction,"shield_bash",{"noPoise":true,"noImpact":true,"kbMult":1.5})
	_knockback+=direction*8.0
	if alive:_stun_ticks=maxf(_stun_ticks,stun_ticks)
	return {"accepted":true,"hp_before":before,"hp_after":hp,"poise_before":poise_before,"poise_after":poise,"stunned":_stun_ticks,"kb_add":direction*8.0}

func receive_poise_damage(amount: float) -> void:
	if not alive or amount <= 0:
		return
	poise = maxf(0.0, poise - amount)
	_poise_regen = 0.0
	if poise <= 0:
		_stun_ticks = 180.0
		charge_ticks = 0.0
		telemetry_event.emit("enemy_stagger", {"id": data["id"], "ticks": _stun_ticks})

func _update_animation() -> void:
	if not _body or not alive:
		return
	var angle = facing
	var direction = posmod(roundi(angle / (PI / 4.0)), 8)
	if data.get("native_final",{}).get("_ch1StartMedium")==true \
			and data["animation"].get("kind")=="native-medium-sheet":
		# R _drawCh1StartMediumEyeMass always looks toward the living P.
		# This angle selects artwork only; never write the AI's facing field.
		var player_hp: Variant=player.get("hp") if is_instance_valid(player) else null
		if (player_hp is int or player_hp is float) and player_hp>0:
			angle=atan2(player.global_position.y-global_position.y,player.global_position.x-global_position.x)
		# Source normalizes to [0,TAU) before JS Math.round (ties toward +inf).
		direction=posmod(int(floor(fposmod(angle,TAU)/(PI/4.0)+0.5)),8)
	var row = int(data["animation"]["native_direction_rows"][direction])
	var column = 2 + posmod(int(_motion_ms / 120.0), 2) if _moving else 0
	_body.frame = row * 4 + column
	_body.modulate = Color(1,1,1,.6 if _stun_ticks>0 else 1.0)

func _draw() -> void:
	if not alive:
		return
	# Native contact uses its cooldown; only the real 60-tick projectile has a charge cue.
	if charge_ticks > 0.0:
		var progress = 1.0 - charge_ticks / float(data["projectile_charge_ticks"])
		draw_arc(Vector2.ZERO, radius + 13.0, -PI * 0.5, -PI * 0.5 + TAU * progress, 48, Color(0.64, 0.3, 1.0, 0.85), 3.0, true)
		if is_instance_valid(player):
			var aim = (player.global_position - global_position).normalized()
			draw_line(aim * radius, aim * (radius + 42.0), Color(0.65, 0.38, 0.9, 0.5), 2.0, true)
	# P2-001a: 에너지 바 — 원본 drawEn(53961~53969) 규칙 그대로 (폭 2r+6, y=-r-16,
	# 피해 전 숨김, HP #cc0000 + 쉴드 #44aaff 덮어그리기, 그로기 #ff8800 3px).
	for bar in BAR_LAYOUT.build(radius, float(hp), float(mhp), eShield, eShieldMax,
			_stun_ticks, data.get("native_final", {}).get("_maxStunned")):
		draw_rect(bar["rect"], Color(bar["color"],bar["color"].a*_body.modulate.a))

# ═══ PCI-10 (PC-LIFE-PACK 2026-10-21): 주술사 시체 부활 writer G38949–38950 — 같은 노드 복귀. ═══
# generic 상태기계에는 recover가 없어(P1-002.E 추적표 42382) s='recover';st2=60을 state 표기 +
# _hit_stun 60틱(행동 정지)으로 매핑한다. 사망 쓰기가 끈 충돌/본체 표시는 _ready 값으로 복원.
func apply_native_enemy_corpse_revive(caller_world: Node) -> Dictionary:
	if caller_world != world or not _native_enemy_hp_owner_is_current():
		return {"applied": false, "reason": "native_enemy_revive_owner_not_current"}
	if alive:
		return {"applied": false, "reason": "native_enemy_revive_not_dead"}
	var native: Variant = data.get("native_final")
	if not native is Dictionary:
		return {"applied": false, "reason": "native_enemy_revive_fields_missing"}
	var hp_value: int = int(float(mhp) * 0.5) # ~~(mhp*.5)
	alive = true
	hp = hp_value
	eShield = 0.0
	eShieldMax = 0.0
	state = "recover"
	_hit_stun = 60.0
	_stun_ticks = 0.0
	poise = max_poise
	native["reviveIframes"] = 0.0
	collision_layer = 4
	collision_mask = 1 # Terrain/props only; source normal enemies do not block player bodies.
	if is_instance_valid(_body):
		_body.visible = true
		_body.modulate = Color.WHITE
	telemetry_event.emit("enemy_revived", {"id": data["id"], "hp": hp_value, "source_line": 38949})
	queue_redraw()
	return {"applied": true, "hp": hp_value, "recover_field": "_hit_stun"}
