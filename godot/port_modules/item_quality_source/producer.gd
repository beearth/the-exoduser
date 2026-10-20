extends RefCounted
## IT-01: readonly quality/socket arithmetic; no Main, inventory, clock, RNG or IO.
## Source: origin/main 9528ea35b429498fcf42fe3723008219ed0ed7e1 game.html:
## 15305 _qTier; 15308-15316 Q_GRADES/_qGradeOf/_qGemMul;
## 15319 _crFuseQ; 15322-15331 socketMul/socketResonant.
## Partial JS input support: finite native numbers and null/missing q only.
## Unsupported coercions fail explicitly; source save values are never repaired.

const READY := "READY"
const NOT_READY := "NOT_READY"
const Q_GRADES := [
	{"id": "bronze", "ko": "동", "en": "Bronze", "min": 1, "col": "#d19a5c"},
	{"id": "silver", "ko": "은", "en": "Silver", "min": 41, "col": "#e7edf3"},
	{"id": "gold", "ko": "금", "en": "Gold", "min": 81, "col": "#f2d388"},
]


func quality(q: Variant = null) -> Dictionary:
	var number: Dictionary = _number_or(q, 50.0)
	if not number.ready:
		return _unsupported("quality:" + number.reason)
	var value: float = clampf(number.value, 1.0, 100.0)
	var grade: Dictionary = _grade(value)
	return {"status": READY, "ready": true, "q": value,
		"tier": 10 - int(floor((value - 1.0) / 10.0)),
		"grade_id": grade.id, "ko": grade.ko, "en": grade.en, "color": grade.col,
		"gem_multiplier": 0.75 + 0.5 * value / 100.0}


func fused_quality(list: Variant) -> Dictionary:
	if list == null:
		return _fused(50.0)
	if not list is Array:
		return _unsupported("fuse:list_not_array")
	if list.is_empty():
		return _fused(50.0)
	var total: float = 0.0
	for i in range(list.size()):
		var crystal: Variant = list[i]
		if crystal != null and not crystal is Dictionary:
			return _unsupported("fuse:crystal_not_dictionary@" + str(i))
		var raw: Variant = crystal.get("q") if crystal is Dictionary else null
		var number: Dictionary = _number_or(raw, 50.0)
		if not number.ready:
			return _unsupported("fuse:" + number.reason + "@" + str(i))
		total += clampf(number.value, 1.0, 100.0)
	# Each clamped term is positive: JS Math.round(mean) = floor(mean + .5).
	return _fused(clampf(floor(total / list.size() + 0.5), 1.0, 100.0))


func socket(item: Variant, index: int) -> Dictionary:
	if item == null:
		return _socket(1.0, false)
	if not item is Dictionary:
		return _unsupported("socket:item_not_dictionary")
	var crystals: Variant = item.get("crystals")
	if not crystals is Array or index < 0 or index >= crystals.size():
		return _socket(1.0, false)
	var crystal: Variant = crystals[index]
	# Original !cr branch precedes all socketQ reads, including malformed values.
	if crystal == null or (crystal is bool and not crystal) \
			or ((crystal is int or crystal is float) and crystal == 0) \
			or (crystal is String and crystal.is_empty()):
		return _socket(1.0, false)
	if not crystal is Dictionary:
		return _unsupported("socket:crystal_not_dictionary")
	var socket_q: Variant = item.get("socketQ")
	var raw: Variant = socket_q[index] if socket_q is Array and index < socket_q.size() else null
	var number: Dictionary = _number_or(raw, 1.0)
	if not number.ready:
		return _unsupported("socket:socket_q:" + number.reason)
	var crystal_quality: Dictionary = quality(crystal.get("q"))
	if not crystal_quality.ready:
		return _unsupported("socket:crystal_q:" + crystal_quality.reason)
	var q: float = clampf(number.value, 1.0, 100.0)
	var same_grade: bool = _grade(q).id == crystal_quality.grade_id
	var multiplier: float = 1.0 + (q - 1.0) / 99.0 * (2.0 if same_grade else 1.0)
	# Display predicate uses raw q>1, whereas multiplier clamps q first.
	var resonant: bool = number.value > 1.0 and _grade(clampf(number.value, 1.0, 100.0)).id == crystal_quality.grade_id
	return _socket(multiplier, resonant)


func _number_or(raw: Variant, fallback: float) -> Dictionary:
	if raw == null:
		return {"ready": true, "value": fallback}
	if typeof(raw) != TYPE_INT and typeof(raw) != TYPE_FLOAT:
		return {"ready": false, "reason": "unsupported_number_type:" + type_string(typeof(raw))}
	if not is_finite(float(raw)):
		return {"ready": false, "reason": "non_finite_number"}
	return {"ready": true, "value": fallback if raw == 0 else float(raw)}


func _grade(q: float) -> Dictionary:
	var grade: Dictionary = Q_GRADES[0]
	for candidate: Dictionary in Q_GRADES:
		if q >= candidate.min:
			grade = candidate
	return grade


func _unsupported(reason: String) -> Dictionary:
	return {"status": NOT_READY, "ready": false, "reason": reason}


func _fused(q: float) -> Dictionary:
	return {"status": READY, "ready": true, "q": q}


func _socket(multiplier: float, resonant: bool) -> Dictionary:
	return {"status": READY, "ready": true, "multiplier": multiplier, "resonant": resonant}
