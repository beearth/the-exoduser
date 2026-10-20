extends RefCounted
## P1-002.F — 전용 스크립트 일반 적 4종(flesh_crawler/spine_beast/ice_soul_flame/
## hive_bloater)의 기본 근접 hurtE owner API 공용 구현.
##
## generic enemy.gd(P1-002.E)와 같은 계약을 각 전용 적 노드 위에서 수행한다.
## 전용 적은 자기 필드(eShield/alerted/상태기계/_hit_*)의 owner이고, 이 헬퍼는
## 그 필드에 대한 hurtE 쓰기를 위임받아 실행할 뿐 새 상태를 소유하지 않는다.
## 각 적의 고유 동작(기존 receive_damage, flesh_crawler v3 field-owner 경로 등)은
## 건드리지 않는다 — 이 API는 추가 경로이며 기존 경로를 대체하지 않는다.
##
## 42382 즉시반격은 원문 전체(recover→idle+ct=0 / idle&&ct>5→5)를 구현한다.
## generic enemy.gd는 상태기계에 recover가 없어 clamp 매핑만 갖지만(추적표 42382행),
## 전용 적 4종은 recover 상태를 실제로 가지므로 원문 그대로다.
## 근거 표: docs/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md §전용 스크립트 적.

# ── 실제 owner 검사: 월드에 등록된 살아있는(트리상) 그 노드인가 ──
static func owner_current(enemy: Node) -> bool:
	if not is_instance_valid(enemy) or enemy.is_queued_for_deletion() or not enemy.is_inside_tree():
		return false
	var world: Variant = enemy.get("world")
	if not world is Node2D or not is_instance_valid(world) or world.is_queued_for_deletion() \
			or not world.is_inside_tree() or enemy.get_parent() != world \
			or enemy.get_tree() != world.get_tree():
		return false
	if not world.has_method("get_native_world_identity") or not world.get_native_world_identity().has(enemy):
		return false
	return true

# ── 읽기: hurtE가 참조하는 적 필드의 현재 값 (enemy.gd read와 동일 shape) ──
static func read_fields(enemy: Node, caller_world: Node) -> Dictionary:
	if caller_world != enemy.get("world") or not owner_current(enemy):
		return {"ready": false, "reason": "native_enemy_hurte_owner_not_current"}
	var data: Dictionary = enemy.get("data")
	var native: Dictionary = data.get("native_final", {})
	return {"ready": true, "alive": enemy.get("alive"), "hp": enemy.get("hp"),
		"mhp": enemy.get("mhp"),
		"eShield": enemy.get("eShield"), "eShieldMax": enemy.get("eShieldMax"),
		"eRes": (enemy.get("eRes") as Array).duplicate(),
		# el: 전용 적 runtime config의 native_final에는 el 키가 없다 — factory가
		# encounters record(native_final.el)와 동일함을 검증하는 top-level element_id가
		# 이 적의 el owner 값이다 (flesh_crawler의 el 변수도 여기서 파생).
		"etype": enemy.get("etype"), "el": int(data.get("element_id", native.get("el", 0))),
		"elite": enemy.get("elite"),
		"mods": (enemy.get("mods") as Array).duplicate(), "ib": native.get("ib") == true,
		"stunned": enemy.get("_stun_ticks"), "state": enemy.get("state"),
		"lv": int(data.get("level", 1)),
		"radius": enemy.get("radius"), "reviveIframes": float(native.get("reviveIframes", 0.0)),
		"_revived": native.get("_revived") == true, "_isGhoul": native.get("_isGhoul") == true,
		"_isDecoy": native.get("_isDecoy") == true, "_aDefM": native.get("_aDefM"),
		"_shockStk": float(native.get("_shockStk", 0.0)), "_cursed": float(native.get("_cursed", 0.0)),
		"_frozen": float(native.get("_frozen", 0.0)), "bleed": float(native.get("bleed", 0.0)),
		"bleedT": float(native.get("bleedT", 0.0)), "_weakPhys": float(native.get("_weakPhys", 0.0)),
		"_shockDR": float(native.get("_shockDR", 0.0)), "_blinkWeak": float(native.get("_blinkWeak", 0.0))}

# ── hurtE 본문의 개별 적 필드 쓰기. contact_field는 적별 st2 대응 필드명:
#    flesh_crawler="st2", spine/ice="_contact_ticks", hive_bloater="_state_ticks". ──
static func apply_field_write(enemy: Node, contact_field: String, field: String, value: Variant) -> Dictionary:
	if not owner_current(enemy):
		return {"applied": false, "reason": "native_enemy_hurte_owner_not_current"}
	match field:
		"eShield": # 42346~42348
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_shield_value_unsupported"}
			enemy.set("eShield", maxf(0.0, float(value)))
			enemy.queue_redraw()
		"alerted": # 42380
			if not value is bool:
				return {"applied": false, "reason": "native_enemy_alerted_value_unsupported"}
			enemy.set("alerted", value)
		"contact_clamp": # 42382 원문: recover→idle+ct=0 / idle&&ct>5→ct=5
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_contact_value_unsupported"}
			if str(enemy.get("state")) == "recover":
				enemy.set("state", "idle")
				enemy.set(contact_field, 0.0)
			elif str(enemy.get("state")) == "idle":
				enemy.set(contact_field, minf(float(enemy.get(contact_field)), float(value)))
		"hit_flash": # 42412
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_flash_value_unsupported"}
			enemy.set("_hit_flash", float(value))
		"hit_stun": # 42414
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "native_enemy_stun_value_unsupported"}
			enemy.set("_hit_stun", float(value))
		_:
			return {"applied": false, "reason": "native_enemy_hurte_field_unsupported:" + field}
	return {"applied": true, "field": field, "applied_value": value}

# ── native_final 북키핑 (부활 플래그·부활 무적 — 동작 미이식, 기록만 소유) ──
static func apply_bookkeeping(enemy: Node, fields: Dictionary) -> Dictionary:
	if not owner_current(enemy):
		return {"applied": false, "reason": "native_enemy_hurte_owner_not_current"}
	var native: Variant = (enemy.get("data") as Dictionary).get("native_final")
	if not native is Dictionary:
		return {"applied": false, "reason": "native_enemy_final_record_missing"}
	var allowed: Array = ["reviveIframes", "_revived", "_reviveTimer", "_reviveX", "_reviveY", "_reviveAsGhoul"]
	for field in fields:
		if field not in allowed:
			return {"applied": false, "reason": "native_enemy_bookkeeping_field_unsupported:" + str(field)}
	for field in fields:
		native[field] = fields[field]
	return {"applied": true, "count": fields.size()}

# ── P1-002.G: 42490 포이즈 — 원본 _poiseHit(19973~19983) 코어 (spine/ice/hive 전용;
#    flesh_crawler는 기존 v3 field-owner 계약 apply_native_source_poise_hit 경로) ──
static func apply_poise_core(enemy: Node, amount: int) -> Dictionary:
	if not owner_current(enemy):
		return {"applied": false, "reason": "native_enemy_hurte_owner_not_current"}
	if enemy.get("alive") != true or amount <= 0: # 19974: 상태 무변경 false
		return {"applied": true, "staggered": false, "entered": false}
	enemy.set("poise", float(enemy.get("poise")) - float(amount))
	enemy.set("_poise_regen", 0.0)
	if float(enemy.get("poise")) <= 0.0:
		enemy.set("poise", 0.0)
		enemy.set("_stun_ticks", maxf(float(enemy.get("_stun_ticks")), 180.0))
		var native: Variant = (enemy.get("data") as Dictionary).get("native_final")
		if native is Dictionary:
			var previous: float = 0.0
			if native.get("_maxStunned") is int or native.get("_maxStunned") is float:
				previous = float(native["_maxStunned"])
			native["_maxStunned"] = maxf(previous, 180.0)
		return {"applied": true, "staggered": true, "entered": true}
	return {"applied": true, "staggered": false, "entered": true}

# ── 42383: HP 쓰기 (enemy.gd apply_native_normal_enemy_hp_write와 동일 계약) ──
static func apply_hp_write(enemy: Node, write: Dictionary) -> Dictionary:
	var report := {"status": "NOT_READY", "applied": false, "owner": enemy,
		"owner_script": enemy.get_script(), "world": enemy.get("world"), "write": write}
	if not owner_current(enemy):
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
	enemy.set("hp", value)
	report["status"] = "APPLIED"
	report["applied"] = true
	report["field"] = "hp"
	report["applied_value"] = value
	return report

# ── 42702: 사망 확정 — 각 전용 적 receive_damage 사망 블록과 동일한 적 측 효과 ──
static func apply_death_write(enemy: Node) -> Dictionary:
	if not owner_current(enemy):
		return {"applied": false, "reason": "native_enemy_hurte_owner_not_current"}
	if enemy.get("alive") != true:
		return {"applied": false, "reason": "native_enemy_already_dead"}
	enemy.set("alive", false)
	enemy.set("state", "dead")
	enemy.set("charge_ticks", 0.0)
	enemy.set("velocity", Vector2.ZERO)
	enemy.set("collision_layer", 0)
	enemy.set("collision_mask", 0)
	# P2-001b: 원본은 사망 즉시 본체 렌더 제외 — 시체가 대체 (위 enemy.gd 주석과 동일).
	var body: Variant = enemy.get("_body")
	if is_instance_valid(body):
		body.visible = false
	var walk: Variant = enemy.get("_walk")
	if is_instance_valid(walk):
		walk.visible = false
	enemy.emit_signal("telemetry_event", "enemy_death",
		{"id": (enemy.get("data") as Dictionary)["id"], "position": [enemy.global_position.x, enemy.global_position.y]})
	enemy.queue_redraw()
	return {"applied": true}
