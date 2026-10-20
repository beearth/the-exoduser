extends RefCounted
## SK-S01: readonly SP accounting, no P/G, registry, actor, UI or save access.
## Source: main 9528ea35b429498fcf42fe3723008219ed0ed7e1,
## game.html:3913-3930. Caller max-level policy is not a calculation clamp.
## Partial carrier support: integral finite Number values, levels 0..20,
## gem count 0..7, spCost missing or 0..15. Other carriers return NOT_READY.
const SOURCE_REF := "game.html:3913-3930@9528ea35b429498fcf42fe3723008219ed0ed7e1"
const UP_SP_TABLE := [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]


static func skill_up_sp_cost(cur_lv: Variant) -> Dictionary:
	var input := {"cur_lv": cur_lv}
	if not _supported_integer(cur_lv, 20):
		return _not_ready("unsupported_cur_lv", input)
	return _ready(_source_up_sp_cost(int(cur_lv)), input)


static func fuse_up_sp_cost(cur_lv: Variant, gem_count: Variant) -> Dictionary:
	var input := {"cur_lv": cur_lv, "gem_count": gem_count}
	if not _supported_integer(cur_lv, 20):
		return _not_ready("unsupported_cur_lv", input)
	if not _supported_integer(gem_count, 7):
		return _not_ready("unsupported_gem_count", input)
	var base: int = _source_up_sp_cost(int(cur_lv))
	var star: int = int(gem_count) if gem_count != 0 else 2 # gemCnt||2
	var raw: int = base + (star - 1)
	if cur_lv >= 9:
		return _ready(8 if star >= 4 else (6 if star >= 2 else raw), input)
	return _ready(raw, input)


static func skill_spent_sp(skill: Variant, skill_lv: Variant) -> Dictionary:
	var input := {"skill": skill, "skill_lv": skill_lv}
	# Validate the supported carrier before evaluating the original early return.
	if not _supported_integer(skill_lv, 20):
		return _not_ready("unsupported_skill_lv", input)
	if skill != null and not skill is Dictionary:
		return _not_ready("unsupported_skill", input)
	# Source: !sk || slv<=0. Do not read spCost for a zero-level Dictionary.
	if skill == null or skill_lv <= 0:
		return _ready(0, input)
	# StringName keys alias String keys in Godot; that carrier is not JS support.
	for key in skill:
		if key is StringName and key == &"spCost":
			return _not_ready("unsupported_sp_cost_key", input)
	var spent: Variant = skill.get("spCost", 0)
	if not _supported_integer(spent, 15):
		return _not_ready("unsupported_sp_cost", input)
	var total: int = int(spent) # spCost||0 for supported numeric/missing fields
	for lv in range(1, int(skill_lv)):
		total += _source_up_sp_cost(lv)
	return _ready(total, input)


static func _source_up_sp_cost(cur_lv: int) -> int:
	var next_lv: int = cur_lv + 1
	var value: int = UP_SP_TABLE[maxi(1, mini(10, next_lv))]
	return value if value != 0 else 1


static func _supported_integer(value: Variant, maximum: int) -> bool:
	if value is int:
		return value >= 0 and value <= maximum
	if value is float:
		return is_finite(value) and value >= 0.0 and value <= float(maximum) \
			and value == floor(value)
	return false


static func _ready(value: int, input: Dictionary) -> Dictionary:
	return {"status": "READY", "value": value, "input": input}


static func _not_ready(reason: String, input: Dictionary) -> Dictionary:
	return {"status": "NOT_READY", "reason": reason, "input": input}
