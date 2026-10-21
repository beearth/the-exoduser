extends CharacterBody2D
## PC-BOSS-CORE (2026-10-22) — 1-1 보스 전투 몸체(PC 소유).
##
## World 레지스트리(`register_summoned_enemy`)에 들어가 ① World 물리 위상의 보스 틱 지점,
## ② 플레이어 근접·석궁(normalBow)·스킬·기검참이 찾는 hurtE 대상이 된다. 상태는 소유하지 않고
## PC core 의 정본 E(보스 공간 Dictionary)를 읽고 쓴다. 표시(스프라이트·텔레그래프)는 Mac 보스 뷰 소유라
## 여기서는 아무것도 그리지 않는다.
## hurtE owner API 7종: read_native_normal_enemy_hurte_fields / apply_native_normal_enemy_field_write /
## apply_native_normal_enemy_bookkeeping / apply_native_normal_enemy_hp_write /
## apply_native_normal_enemy_death_write / report_native_normal_enemy_hurte_event / add_native_knockback
## + 보스 포이즈 코어(19972–19983) apply_native_normal_enemy_poise_core.

signal telemetry_event(kind: String, data: Dictionary)

var core: Node
var world: Node2D
var player: Node2D
var data: Dictionary = {}
var _ready_flag := false

## 다른 시스템(근접 판정·HUD·펫 등)이 읽는 공통 프로퍼티 — 정본 E에서 읽는다.
var hp: float:
	get: return float(_e().get("hp", 0))
var mhp: float:
	get: return float(_e().get("mhp", 1))
var max_hp: float:
	get: return float(_e().get("mhp", 1))
var alive: bool:
	get: return _e().get("alive") == true
var state: String:
	get: return str(_e().get("s", ""))
var radius: float:
	get: return core.world_length(float(_e().get("r", 44))) if is_instance_valid(core) else 44.0
var etype: int:
	get: return int(_e().get("etype", 0))
var elite: int:
	get: return int(_e().get("elite", 0))
var mods: Array:
	get: return _e().get("mods", []) if _e().get("mods") is Array else []
var eShield: float:
	get: return float(_e().get("eShield", 0))
var eShieldMax: float:
	get: return float(_e().get("eShieldMax", 0))
var poise: float:
	get: return float(_e().get("poise", 0))
var max_poise: float:
	get: return float(_e().get("maxPoise", 0))
var facing: float:
	get: return float(_e().get("facing", 0))
var attack: float:
	get: return float(_e().get("atk", 0))
var element: String:
	get: return "physical"

func configure_boss(owner_core: Node, owner_world: Node2D, enemy: Dictionary) -> void:
	core = owner_core
	world = owner_world
	name = "Demo11BossBody"
	data = {"id": "demo11_boss_si0", "native_final": enemy, "level": int(enemy.get("lv", 1)), "element_id": int(enemy.get("el", 0)),
		"ai_profile": "pc_boss_core_v1"}
	collision_layer = 0
	collision_mask = 0
	visible = false
	_ready_flag = true

func _e() -> Dictionary:
	return data.get("native_final", {}) if data.get("native_final") is Dictionary else {}

func set_player(value: Node2D) -> bool:
	player = value
	return is_instance_valid(value)

func is_native_registry_ready() -> bool:
	return _ready_flag and is_instance_valid(core)

func _physics_process(_delta: float) -> void:
	pass # World 위상만이 보스 시계를 진행한다(register 시 비활성화됨).

## World.advance_native_owner_phase → 보스 틱
func advance_native_phase(ticks: float, _frame: float, _enemies: Array) -> void:
	if is_instance_valid(core):
		core.advance_boss_tick(self, ticks)

func _owner_current(caller_world: Variant = null) -> bool:
	if not _ready_flag or not is_instance_valid(core) or not is_inside_tree() or is_queued_for_deletion():
		return false
	if not is_instance_valid(world) or get_parent() != world:
		return false
	if caller_world != null and caller_world != world:
		return false
	return core.is_boss_body_current(self)

func read_native_normal_enemy_hurte_fields(caller_world: Node) -> Dictionary:
	if not _owner_current(caller_world):
		return {"ready": false, "reason": "boss_body_owner_not_current"}
	var n: Dictionary = _e()
	return {"ready": true, "alive": n.get("alive") == true, "hp": n.get("hp"), "mhp": n.get("mhp"),
		"eShield": float(n.get("eShield", 0.0)), "eShieldMax": float(n.get("eShieldMax", 0.0)),
		"eRes": (n.get("eRes", [0, 0, 0, 0, 0, 0, 0]) as Array).duplicate(), "etype": int(n.get("etype", 0)),
		"el": int(n.get("el", 0)), "elite": int(n.get("elite", 0)), "mods": (n.get("mods", []) as Array).duplicate(),
		"ib": n.get("ib") == true, "stunned": float(n.get("stunned", 0.0)), "state": str(n.get("s", "")),
		"lv": int(n.get("lv", 1)), "radius": radius, "reviveIframes": float(n.get("reviveIframes", 0.0)),
		"_revived": n.get("_revived") == true, "_isGhoul": n.get("_isGhoul") == true, "_isDecoy": n.get("_isDecoy") == true,
		"_aDefM": n.get("_aDefM"), "_shockStk": float(n.get("_shockStk", 0.0)), "_cursed": float(n.get("_cursed", 0.0)),
		"_frozen": float(n.get("_frozen", 0.0)), "_frozenImmune": float(n.get("_frozenImmune", 0.0)),
		"_iceShardRes": float(n.get("_iceShardRes", 0.0)), "bleed": float(n.get("bleed", 0.0)),
		"bleedT": float(n.get("bleedT", 0.0)), "_weakPhys": float(n.get("_weakPhys", 0.0)), "_weakPj": float(n.get("_weakPj", 0.0)),
		"_shockDR": float(n.get("_shockDR", 0.0)), "_blinkWeak": float(n.get("_blinkWeak", 0.0)),
		"_pImmune": float(n.get("_pImmune", 0.0)), "_mgActive": n.get("_mgActive") == true, "_bcActive": n.get("_bcActive") == true}

func apply_native_normal_enemy_field_write(field: String, value: Variant) -> Dictionary:
	if not _owner_current():
		return {"applied": false, "reason": "boss_body_owner_not_current"}
	var n: Dictionary = _e()
	match field:
		"eShield": # 42346~42348
			if not _num(value): return {"applied": false, "reason": "boss_shield_value_unsupported"}
			n.eShield = maxf(0.0, float(value))
		"alerted": # 42380 e._alerted=true
			if not value is bool: return {"applied": false, "reason": "boss_alerted_value_unsupported"}
			n._alerted = value
		"hit_flash": # 42412 e._hitFlash=6
			if not _num(value): return {"applied": false, "reason": "boss_flash_value_unsupported"}
			n._hitFlash = float(value)
		"stunned": # 지옥강타 등 e.stunned=Math.max(e.stunned,v)
			if not _num(value): return {"applied": false, "reason": "boss_stunned_value_unsupported"}
			n.stunned = maxf(float(n.get("stunned", 0)), float(value))
		"freeze_hit": # 42446~42458 보스: _freezeMax 500, 축적 30%
			if not value is Array or (value as Array).size() != 1 or not _num(value[0]):
				return {"applied": false, "reason": "boss_freeze_value_unsupported"}
			if float(n.get("_frozen", 0)) > 0.0 or float(n.get("_frozenImmune", 0)) > 0.0:
				return {"applied": true, "field": field, "triggered": false, "skipped": true}
			if not _truthy(n.get("_freezeMax")): n._freezeMax = 500.0
			var add: float = float(value[0]) * 0.3 * (1.0 + float(n.get("_iceShardRes", 0.0)))
			n._freezeGauge = minf(float(n._freezeMax), float(n.get("_freezeGauge", 0.0)) + add)
			if float(n._freezeGauge) >= float(n._freezeMax):
				n._frozen = 180.0
				n._freezeGauge = 0.0
				return {"applied": true, "field": field, "triggered": true, "gauge": 0.0}
			return {"applied": true, "field": field, "triggered": false, "gauge": n._freezeGauge}
		"ice_shard_res":
			n._iceShardRes = minf(1.0, float(n.get("_iceShardRes", 0.0)) + 0.10)
		"spike_slow": # 37471 e._spikeSlow=max(,90), lv
			if not value is Array or (value as Array).size() != 2: return {"applied": false, "reason": "boss_spike_slow_value_unsupported"}
			n._spikeSlow = maxf(float(n.get("_spikeSlow", 0.0)), float(value[0]))
			n._spikeSlowLv = int(value[1])
		_:
			return {"applied": false, "reason": "boss_hurte_field_unsupported:" + field}
	return {"applied": true, "field": field, "applied_value": value}

func apply_native_normal_enemy_bookkeeping(fields: Dictionary) -> Dictionary:
	if not _owner_current():
		return {"applied": false, "reason": "boss_body_owner_not_current"}
	for key in fields:
		if key not in ["reviveIframes"]:
			return {"applied": false, "reason": "boss_bookkeeping_field_unsupported:" + str(key)}
	var n: Dictionary = _e()
	for key in fields: n[key] = fields[key]
	return {"applied": true, "count": fields.size()}

func apply_native_normal_enemy_hp_write(write: Dictionary) -> Dictionary:
	var report := {"status": "NOT_READY", "applied": false, "owner": self}
	if not _owner_current():
		report.reason = "boss_body_owner_not_current"
		return report
	if write.get("field") != "hp" or not _num(write.get("value")):
		report.reason = "boss_hp_write_unsupported"
		return report
	_e().hp = write.value
	report.status = "APPLIED"
	report.applied = true
	report.field = "hp"
	report.applied_value = write.value
	return report

## 42702 e.alive=false (원본은 s를 바꾸지 않는다)
func apply_native_normal_enemy_death_write() -> Dictionary:
	if not _owner_current():
		return {"applied": false, "reason": "boss_body_owner_not_current"}
	var n: Dictionary = _e()
	if n.get("alive") != true:
		return {"applied": false, "reason": "boss_already_dead"}
	n.alive = false
	telemetry_event.emit("enemy_death", {"id": data.id, "position": [global_position.x, global_position.y], "boss": true})
	return {"applied": true}

## 19972–19983 _poiseHit 코어(보스): _pImmune>0 거절, stun 90, _maxStunned, _pImmune=300
func apply_native_normal_enemy_poise_core(amount: int) -> Dictionary:
	if not _owner_current():
		return {"applied": false, "reason": "boss_body_owner_not_current"}
	var n: Dictionary = _e()
	if n.get("alive") != true or amount <= 0:
		return {"applied": true, "staggered": false, "entered": false}
	if float(n.get("_pImmune", 0.0)) > 0.0:
		return {"applied": true, "staggered": false, "entered": false, "boss_immune": true}
	n.poise = float(n.get("poise", 0)) - float(amount)
	n.poiseR = 0
	if float(n.poise) <= 0.0:
		n.poise = 0
		n.stunned = maxf(float(n.get("stunned", 0.0)), 90.0)
		n._maxStunned = maxf(float(n.get("_maxStunned", 0.0)) if _num(n.get("_maxStunned")) else 0.0, 90.0)
		n._pImmune = 300
		return {"applied": true, "staggered": true, "entered": true}
	return {"applied": true, "staggered": false, "entered": true}

func report_native_normal_enemy_hurte_event(kind: String, payload: Dictionary) -> void:
	telemetry_event.emit(kind, payload)
	if is_instance_valid(core): core.observe_boss_hurte_event(kind, payload)

## 42472 e.kb+=cos/sin×amt — 보스 공간 단위(넉백량은 보스 공간 값이라 변환 없음, contract §7)
func add_native_knockback(value: Vector2) -> void:
	if not _owner_current(): return
	var n: Dictionary = _e()
	var kb: Dictionary = n.kb if n.get("kb") is Dictionary else {"x": 0, "y": 0}
	kb.x = float(kb.get("x", 0)) + value.x
	kb.y = float(kb.get("y", 0)) + value.y
	n.kb = kb

## 보스 사망 분기(42515–42649) 진입점 — executor 가 ib 처치 시 호출
func resolve_native_boss_death(executor: Object, ctx: Dictionary) -> Dictionary:
	if not _owner_current():
		return {"ok": false, "reason": "boss_body_owner_not_current"}
	return core.resolve_boss_death(self, executor, ctx)

func publish_native_boss_death_event(ctx: Dictionary) -> Dictionary:
	return core.publish_boss_death(self, ctx) if is_instance_valid(core) else {"published": false, "reason": "core_lost"}

static func _num(v: Variant) -> bool:
	return (v is int or v is float) and is_finite(float(v))

static func _truthy(v: Variant) -> bool:
	if v == null: return false
	if v is bool: return v
	if v is int or v is float: return float(v) != 0.0 and not is_nan(float(v))
	return true
