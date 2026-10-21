extends RefCounted
## PC-COMBAT-PACK-B PCI-02 — bind 프로토콜 actor(현재 type3_native_binding.gd)의 공용 hurtE field owner 구현.
## actor의 원본 필드 dict(get_native_modifier_state() = 실제 `_native`)에 hurtE 본문 쓰기를 위임 실행한다.
## 새 상태를 소유하지 않는다. 모든 호출은 Main 서비스(native_combat_pack_b.gd)의 live binding을 먼저 확인한다(O(1)).
## 근거 행(game.html): 42112 alive/hp, 42120 reviveIframes, 42345~42348 eShield, 42380 e._alerted,
## 42382 즉시반격(recover→idle+st2=0 / idle&&st2>5→5), 42383 hp, 42412 _hitFlash, 42414 _hitStun,
## 42472 kb(+=), 42490 _poiseHit 코어(type3 apply_native_source_poise_core 재사용), 42702 사망 확정.
## 미이식(쓰기 거절 → executor가 그 지점에서 정지): freeze_hit(42446 냉기 게이지 — type3 owner 미이식).

static func owner_current(actor: Node, service: Variant, token: Variant) -> bool:
	return service != null and token is String and not (token as String).is_empty() \
		and service.is_native_hurte_binding_live(actor, token)

static func read_fields(actor: Node, caller_world: Node, service: Variant, token: Variant) -> Dictionary:
	if not owner_current(actor, service, token):
		return {"ready": false, "reason": "native_bound_hurte_owner_not_bound_or_stale"}
	var world: Variant = actor.call("_world")
	if caller_world != world:
		return {"ready": false, "reason": "native_bound_hurte_owner_world_mismatch"}
	var n: Dictionary = actor.get_native_modifier_state()
	return {"ready": true, "alive": n.get("alive") == true, "hp": n.get("hp"), "mhp": n.get("mhp"),
		"eShield": float(n.get("eShield", 0.0)), "eShieldMax": float(n.get("eShieldMax", 0.0)),
		"eRes": (n.get("eRes", []) as Array).duplicate(), "etype": int(n.get("etype", 3)), "el": int(n.get("el", 0)),
		"elite": int(n.get("elite", 0)), "mods": (n.get("mods", []) as Array).duplicate(),
		"ib": n.get("ib") == true, "stunned": float(n.get("stunned", 0.0)), "state": str(n.get("s", "")),
		"lv": int(n.get("lv", 1)), "radius": float(n.get("r", 0.0)),
		"reviveIframes": float(n.get("reviveIframes", 0.0)), "_revived": n.get("_revived") == true,
		"_isGhoul": n.get("_isGhoul") == true, "_isDecoy": n.get("_isDecoy") == true, "_aDefM": n.get("_aDefM"),
		"_shockStk": float(n.get("_shockStk", 0.0)), "_cursed": float(n.get("_cursed", 0.0)),
		"_frozen": float(n.get("_frozen", 0.0)), "bleed": float(n.get("bleed", 0.0)), "bleedT": float(n.get("bleedT", 0.0)),
		"_weakPhys": float(n.get("_weakPhys", 0.0)), "_weakPj": float(n.get("_weakPj", 0.0)),
		"_shockDR": float(n.get("_shockDR", 0.0)), "_blinkWeak": float(n.get("_blinkWeak", 0.0)),
		"_splitDone": n.get("_splitDone") == true}

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func apply_field_write(actor: Node, service: Variant, token: Variant, field: String, value: Variant) -> Dictionary:
	if not owner_current(actor, service, token):
		return {"applied": false, "reason": "native_bound_hurte_owner_not_bound_or_stale"}
	var n: Dictionary = actor.get_native_modifier_state()
	match field:
		"eShield":
			if not _number(value): return {"applied": false, "reason": "native_enemy_shield_value_unsupported"}
			n["eShield"] = maxf(0.0, float(value))
		"alerted":
			if not value is bool: return {"applied": false, "reason": "native_enemy_alerted_value_unsupported"}
			n["_alerted"] = value
		"contact_clamp":
			if not _number(value): return {"applied": false, "reason": "native_enemy_contact_value_unsupported"}
			if str(n.get("s")) == "recover":
				n["s"] = "idle"
				n["st2"] = 0.0
			elif str(n.get("s")) == "idle" and float(n.get("st2", 0.0)) > float(value):
				n["st2"] = float(value)
		"hit_flash":
			if not _number(value): return {"applied": false, "reason": "native_enemy_flash_value_unsupported"}
			n["_hitFlash"] = float(value)
		"hit_stun":
			if not _number(value): return {"applied": false, "reason": "native_enemy_stun_value_unsupported"}
			n["_hitStun"] = float(value)
		_:
			return {"applied": false, "reason": "native_bound_hurte_field_unsupported:" + field}
	return {"applied": true, "field": field, "applied_value": value}

static func apply_bookkeeping(actor: Node, service: Variant, token: Variant, fields: Dictionary) -> Dictionary:
	if not owner_current(actor, service, token):
		return {"applied": false, "reason": "native_bound_hurte_owner_not_bound_or_stale"}
	var allowed: Array = ["reviveIframes", "_revived", "_reviveTimer", "_reviveX", "_reviveY", "_reviveAsGhoul"]
	for field in fields:
		if field not in allowed:
			return {"applied": false, "reason": "native_enemy_bookkeeping_field_unsupported:" + str(field)}
	var n: Dictionary = actor.get_native_modifier_state()
	for field in fields:
		n[field] = fields[field]
	return {"applied": true, "count": fields.size()}

static func apply_hp_write(actor: Node, service: Variant, token: Variant, write: Dictionary) -> Dictionary:
	if not owner_current(actor, service, token):
		return {"applied": false, "status": "NOT_READY", "reason": "native_bound_hurte_owner_not_bound_or_stale"}
	if write.get("field") != "hp" or not _number(write.get("value")):
		return {"applied": false, "status": "NOT_READY", "reason": "native_enemy_hp_write_unsupported"}
	actor.get_native_modifier_state()["hp"] = write.value
	return {"applied": true, "status": "APPLIED", "field": "hp", "applied_value": write.value}

static func apply_death_write(actor: Node, service: Variant, token: Variant) -> Dictionary:
	if not owner_current(actor, service, token):
		return {"applied": false, "reason": "native_bound_hurte_owner_not_bound_or_stale"}
	var n: Dictionary = actor.get_native_modifier_state()
	if n.get("alive") != true:
		return {"applied": false, "reason": "native_enemy_already_dead"}
	# type3_summoned_actor.receive_damage 사망 블록과 같은 actor 측 효과(기존 탄·FX 보존).
	n["alive"] = false
	n["s"] = "dead"
	actor.call("_cancel_charge")
	actor.set("collision_layer", 0)
	actor.emit_signal("telemetry_event", "type3_death", {"existing_projectiles_preserved": true, "owner": "pc_hurte"})
	actor.call("_update_body")
	return {"applied": true}

static func apply_knockback(actor: Node, service: Variant, token: Variant, value: Vector2) -> void:
	if not owner_current(actor, service, token) or not value.is_finite():
		return
	var n: Dictionary = actor.get_native_modifier_state()
	if n.get("alive") != true:
		return
	var kb: Dictionary = n["kb"]
	kb["x"] = float(kb["x"]) + value.x
	kb["y"] = float(kb["y"]) + value.y

static func apply_poise_core(actor: Node, service: Variant, token: Variant, amount: int) -> Dictionary:
	if not owner_current(actor, service, token):
		return {"applied": false, "reason": "native_bound_hurte_owner_not_bound_or_stale"}
	var core: Dictionary = actor.apply_native_source_poise_core(float(amount))
	if core.get("ready") != true:
		return {"applied": false, "reason": "native_enemy_poise_core_not_ready:" + str(core.get("reason"))}
	return {"applied": true, "staggered": core.get("staggered") == true, "entered": core.get("entered") == true}
