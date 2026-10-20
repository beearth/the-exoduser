extends RefCounted
## QS-01: pure potion arithmetic, not an automatic-use/runtime owner.
## Source: 9528ea35b429498fcf42fe3723008219ed0ed7e1/game.html
## POT.hp 27677-27679; potHeal 28072; enhanced heal 35894/35903;
## auto cooldown 35898-35902. No Player/G/INV writes, clock, IO or RNG.

const AffixReader = preload("res://port_modules/equipment_affix_reader/producer.gd")
const Formula = preload("res://port_modules/combat_stat_formula/producer.gd")
const JS_SAFE_INTEGER_MAX: int = 9007199254740991
const HP_DEFINITION = {
	"name": "악의 추출", "emoji": "👿", "col": "#33cc66", "colG": "#66ff99",
	"base": 100, "per": 20,
	"desc": "악의를 소모해 지옥의 힘으로 회복합니다 (+100 HP)"
}

# Only its pure ToNumber helper is used; no inventory reader is bound.
var _coerce = AffixReader.new()


func hp_definition() -> Dictionary:
	return HP_DEFINITION.duplicate(true)


func pot_heal(level: Variant) -> Dictionary:
	if not _source_number(level):
		return _unsupported("unsupported_level", level)
	var lv: float = float(level)
	# game.html:28072 -- no level cap or rounding in the source function.
	return _ready(100.0 if lv <= 0.0 else (150.0 if lv == 1.0 else lv * 100.0))


func enhanced_heal(level: Variant, potion_power: Variant) -> Dictionary:
	var base: Dictionary = pot_heal(level)
	if base["status"] != "READY":
		return base
	if not _source_number(potion_power):
		return _unsupported("unsupported_potion_power", potion_power)
	# game.html:35894/35903 -- ~~ is JS ToInt32, not a native int cast.
	return _ready(Formula.js_to_int32(float(base["value"]) * (1.0 + float(potion_power))))


func auto_cooldown(gloves_raw: Variant, gloves_present: bool,
		belt_raw: Variant, belt_present: bool,
		p_regen_raw: Variant, p_regen_present: bool,
		potion_cd_affix_raw: Variant = 0, potion_cd_affix_present: bool = true) -> Dictionary:
	if gloves_present and not _source_scalar(gloves_raw):
		return _unsupported("unsupported_gloves_pot_cd", gloves_raw)
	# game.html:35899 -- unary + precedes ||0, then Math.min.
	var gloves: float = _coerce.js_to_number(gloves_raw, gloves_present)
	gloves = _source_min(_number_or_zero(gloves), 0.2)
	if belt_present and not _source_scalar(belt_raw):
		return _unsupported("unsupported_belt_pot_cd", belt_raw)
	var belt: float = _coerce.js_to_number(belt_raw, belt_present)
	belt = _source_min(_number_or_zero(belt), 0.2)
	if p_regen_present and not _source_scalar(p_regen_raw):
		return _unsupported("unsupported_p_regen", p_regen_raw)
	# game.html:35901 -- multiplication coerces, but there is NO ||0 here.
	var regen: float = _source_min(_coerce.js_to_number(p_regen_raw, p_regen_present) * 0.03, 0.3)
	if potion_cd_affix_present and not _source_scalar(potion_cd_affix_raw):
		return _unsupported("unsupported_potion_cd_red", potion_cd_affix_raw)
	# game.html:28228-28231. The original uses Math.min without a lower clamp;
	# retain its signed value and left-to-right subtraction exactly.
	var potion_cd_affix: float = _source_min(_coerce.js_to_number(potion_cd_affix_raw, potion_cd_affix_present), 0.2)
	# G35898-35902 plus G28228-28231 -- preserve signed wrap and ~~ conversion.
	var frames: int = Formula.js_to_int32(420.0 * ((((1.0 - gloves) - belt) - regen) - potion_cd_affix))
	return _ready(maxi(6, frames))


static func _source_number(value: Variant) -> bool:
	if typeof(value) == TYPE_INT:
		return value >= -JS_SAFE_INTEGER_MAX and value <= JS_SAFE_INTEGER_MAX
	return typeof(value) == TYPE_FLOAT # Includes source Number NaN and infinities.


static func _source_scalar(value: Variant) -> bool:
	return typeof(value) in [TYPE_NIL, TYPE_BOOL, TYPE_STRING] or _source_number(value)


static func _number_or_zero(value: float) -> float:
	return 0.0 if is_nan(value) or value == 0.0 else value


static func _source_min(left: float, right: float) -> float:
	# Godot's minf must not erase JS Math.min's NaN propagation.
	return NAN if is_nan(left) or is_nan(right) else minf(left, right)


static func _ready(value: Variant) -> Dictionary:
	return {"status": "READY", "value": value}


static func _unsupported(reason: String, raw: Variant) -> Dictionary:
	# Preserve unsupported references; no invented numeric fallback or copy.
	return {"status": "NOT_READY", "reason": reason, "raw": raw}
