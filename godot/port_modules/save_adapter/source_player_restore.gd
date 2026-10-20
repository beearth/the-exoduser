extends RefCounted
## Detached calculation only. Source: game.html 3597-3623, 3685-3715,
## 43128-43134. No owner binding, save IO, atlas or protected rage writer.
## Caller supplies current caps/allocations; never substitute mkP defaults.

static func calculate(serialized: Variant, current: Dictionary) -> Dictionary:
	if not _truthy(serialized): return _receipt("REJECTED", "source_falsy_payload")
	if not serialized is Dictionary: return _receipt("HOLD", "payload_not_object")
	if not _truthy(serialized.get("player")): return _receipt("REJECTED", "source_no_player")
	if not serialized.player is Dictionary: return _receipt("HOLD", "player_not_object")
	for key in ["player", "stats", "passives"]:
		if not current.get(key) is Dictionary: return _receipt("HOLD", "current_owner_snapshot_absent:" + key)
	for key in ["mhp", "mmp", "mst"]:
		if not current.player.has(key): return _receipt("HOLD", "current_cap_absent:" + key)
	for key in ["stats", "passives", "skills"]:
		if _truthy(serialized.get(key)) and not serialized[key] is Dictionary:
			return _receipt("HOLD", "allocation_not_object:" + key)
	# Object coercion and non-JSON Godot carriers are not silently normalized.
	if not _json_carrier(serialized) or not _json_carrier(current): return _receipt("HOLD", "non_json_carrier")
	var pd: Dictionary = serialized.player
	var coercions: Array = [pd.get("lv"), serialized.get("grit"), current.passives.get("pShield")]
	for key in ["sp", "ap"]:
		coercions.append(pd.get(key))
	if _truthy(serialized.get("passives")): coercions.append_array(serialized.passives.values())
	if _truthy(serialized.get("skills")):
		coercions.append(serialized.skills.get("humanity")); coercions.append(serialized.skills.get("demonRevive"))
	var cap: Variant = _or(pd.get("maxExp"), 15)
	var overflow: bool = not (_number(_or(pd.get("lv"), 1)) < 1000 or (_numeric(cap) and is_finite(float(cap)) and float(cap) > 0))
	if overflow: coercions.append(pd.get("exp"))
	for value in coercions:
		if not _coercible(value): return _receipt("HOLD", "numeric_coercion_unproven")
	# JS Number-to-string uses its own exponent/rounding rules. Only the exact
	# bounded integer domain used by these legacy refunds is accepted for concat.
	var p: Dictionary = current.player.duplicate(true)
	p["lv"] = _or(pd.get("lv"), 1)
	p["exp"] = maxf(0, _number(_or(_number(pd.get("exp")), 0))) if overflow else _or(pd.get("exp"), 0)
	var trans_level: float = _number(pd.get("lv")) - 999 if overflow else 0.0
	p["maxExp"] = floor(5000000 + trans_level * trans_level * 10000) if overflow else cap
	for pair in [["transLvDate", "_transLvDate", null], ["transLvCount", "_transLvCount", 0], ["apBossCleared", "_apBossCleared", []], ["goddessGift", "_goddessGift", []]]:
		p[pair[1]] = _or(pd.get(pair[0]), pair[2])
	p["sp"] = _or(pd.get("sp"), 0); p["ap"] = _or(pd.get("ap"), 0)
	p["_passiveQueue"] = pd.passiveQueue if pd.get("passiveQueue") is Array else []
	for pair in [["baseAtk", 8], ["baseDef", 2], ["mpR", 0], ["stR", 0.28]]: p[pair[0]] = _or(pd.get(pair[0]), pair[1])
	for pair in [["hp", "mhp", 350], ["mp", "mmp", 80], ["st", "mst", 100]]:
		p[pair[0]] = _or(pd.get(pair[0]), p[pair[1]])
		p[pair[1]] = _or(pd.get(pair[1]), pair[2])
	for pair in [["speed", 2.6], ["shield", 0], ["mshield", 0]]: p[pair[0]] = _or(pd.get(pair[0]), pair[1])
	var stats: Dictionary = current.stats.duplicate(true)
	if _truthy(serialized.get("stats")):
		for key in serialized.stats: stats[key] = _or(serialized.stats[key], 0)
	var passives: Dictionary = current.passives.duplicate(true)
	if _truthy(serialized.get("passives")):
		for key in serialized.passives:
			if passives.has(key): passives[key] = _or(_number(serialized.passives[key]), 0)
	var refunds := {"pShield": 0.0, "pDef": 0.0, "grit": 0.0}
	var shield_lv: int = maxi(0, _int32(_or(passives.get("pShield"), 0)))
	if shield_lv > 0:
		refunds.pShield = _passive_refund(shield_lv)
		if not _concat_safe(p.ap, refunds.pShield): return _receipt("HOLD", "ap_concat_number_format_unproven")
		p["ap"] = _add(_or(p.ap, 0), refunds.pShield)
		passives.pShield = 0
	var saved_passives: Dictionary = serialized.passives if serialized.get("passives") is Dictionary else {}
	var def_lv: int = maxi(0, _int32(_or(saved_passives.get("pDef"), 0)))
	if def_lv > 0:
		refunds.pDef = _passive_refund(def_lv)
		if not _concat_safe(p.ap, refunds.pDef): return _receipt("HOLD", "ap_concat_number_format_unproven")
		p["ap"] = _add(_or(p.ap, 0), refunds.pDef)
	var skills: Variant = serialized.get("skills")
	if skills is Dictionary:
		skills = skills.duplicate(true)
		for pair in [["humanity", "pHuman"], ["demonRevive", "pDemon"]]:
			if _number(skills.get(pair[0])) > 0 and not _truthy(passives.get(pair[1])):
				passives[pair[1]] = minf(10, _number(skills[pair[0]])); skills.erase(pair[0])
	var raw: Variant = _or(serialized.get("grit"), 0)
	var grit: float = _number(raw)
	if grit > 0 and not _truthy(serialized.get("gritCostModeV2")):
		refunds.grit = maxf(0, grit * 3 + ((grit - 1) * grit) / 2 - grit)
		if refunds.grit > 0:
			if not _concat_safe(p.sp, refunds.grit): return _receipt("HOLD", "sp_concat_number_format_unproven")
			p["sp"] = _add(p.sp, refunds.grit)
	var result := _receipt("READY", "detached_source_calculation")
	result.plan = {"player": p, "stats": stats, "passives": passives, "skills": skills, "raw_grit": raw}
	result.refunds = refunds
	# Break all nested references, including truthy metadata/queue values.
	return result.duplicate(true)

static func _receipt(status: String, reason: String) -> Dictionary:
	return {"status": status, "reason": reason, "calculation_only": true, "write_authorized": false,
		"restore_connected": false, "storage_io": false, "network": false, "full_restore_verified": false,
		"pending": ["character atlas selection", "rage/mask/atlas protected writers", "actor HP/ST and authority MP writer handoff", "remaining dbRestore tail"]}

static func _numeric(value: Variant) -> bool: return value is int or value is float
static func _truthy(value: Variant) -> bool:
	if value == null: return false
	if value is bool: return value
	if _numeric(value): return value != 0 and not is_nan(float(value))
	if value is String: return not value.is_empty()
	return true
static func _or(value: Variant, fallback: Variant) -> Variant: return value if _truthy(value) else fallback
static func _json_carrier(value: Variant, depth: int = 0) -> bool:
	if depth > 64: return false
	if value is Dictionary:
		for key in value:
			if not key is String or not _json_carrier(value[key], depth + 1): return false
		return true
	if value is Array:
		for item in value:
			if not _json_carrier(item, depth + 1): return false
		return true
	return value == null or value is bool or value is String or _numeric(value)
static func _coercible(value: Variant) -> bool:
	if value is Dictionary: return false
	if value is Array:
		for item in value:
			if not _coercible(item): return false
	# Avoid inventing JS shortest-roundtrip spelling for arbitrary numeric arrays.
		return _array_string_safe(value)
	if value is String:
		# Long radix inputs need correctly rounded arbitrary-precision parsing.
		# Keep this calculation within its proved exact integer domain instead.
		var text: String = _trim_js(value).to_lower()
		for pair in [["0x", 13], ["0b", 53], ["0o", 17]]:
			if text.begins_with(pair[0]) and text.length() - 2 > pair[1]: return false
	return true
static func _array_string_safe(value: Array) -> bool:
	for item in value:
		if _numeric(item) and (not is_finite(float(item)) or absf(float(item)) > 9007199254740991.0 or float(item) != floor(float(item))): return false
		if item is Array and not _array_string_safe(item): return false
	return true
static func _primitive(value: Variant) -> Variant:
	if not value is Array: return value
	var parts := PackedStringArray()
	for item in value: parts.append("" if item == null else _string(_primitive(item)))
	return ",".join(parts)
static func _string(value: Variant) -> String:
	if value == null: return "null"
	if value is bool: return "true" if value else "false"
	if _numeric(value):
		if is_nan(float(value)): return "NaN"
		if is_inf(float(value)): return "Infinity" if value > 0 else "-Infinity"
		if value == floor(float(value)) and absf(float(value)) <= 9007199254740991.0: return str(int(value))
	return str(value)
static func _number(value: Variant) -> float:
	value = _primitive(value)
	if value == null: return 0.0
	if value is bool: return 1.0 if value else 0.0
	if _numeric(value): return float(value)
	if not value is String: return NAN
	var text: String = _trim_js(value)
	if text.is_empty(): return 0.0
	if text in ["Infinity", "+Infinity", "-Infinity"]: return -INF if text == "-Infinity" else INF
	for pair in [["0x", 16, "0123456789abcdef"], ["0b", 2, "01"], ["0o", 8, "01234567"]]:
		if text.to_lower().begins_with(pair[0]):
			var digits: String = text.substr(2).to_lower()
			if digits.is_empty(): return NAN
			var total := 0.0
			for digit in digits:
				var index: int = pair[2].find(digit)
				if index < 0: return NAN
				total = total * pair[1] + index
			return total
	var grammar := RegEx.new()
	grammar.compile("^[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[eE][+-]?[0-9]+)?$")
	return text.to_float() if grammar.search(text) != null else NAN
static func _trim_js(value: String) -> String:
	var whitespace := " \t\n\r\u000b\u000c\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff"
	var text := value
	while not text.is_empty() and whitespace.contains(text.left(1)): text = text.substr(1)
	while not text.is_empty() and whitespace.contains(text.right(1)): text = text.left(-1)
	return text
static func _int32(value: Variant) -> int:
	var number: float = _number(value)
	if not is_finite(number) or number == 0: return 0
	var modulo: float = fmod(floor(absf(number)) * (-1 if number < 0 else 1), 4294967296.0)
	if modulo < 0: modulo += 4294967296.0
	return int(modulo - 4294967296.0 if modulo >= 2147483648.0 else modulo)
static func _passive_refund(level: int) -> float:
	var costs := [1, 1, 1, 2, 2, 2, 3, 3, 3]
	var total := 0.0
	for i in mini(level, costs.size()): total += costs[i]
	return total + maxi(0, level - costs.size()) * 5.0
static func _concat_safe(a: Variant, b: Variant) -> bool:
	var left: Variant = _primitive(a)
	return not left is String or (is_finite(float(b)) and b == floor(float(b)) and absf(float(b)) <= 9007199254740991.0)
static func _add(a: Variant, b: Variant) -> Variant:
	a = _primitive(a); b = _primitive(b)
	return _string(a) + _string(b) if a is String or b is String else _number(a) + _number(b)
