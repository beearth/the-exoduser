extends RefCounted
## Pure salvageVal port: origin/main 284d7faf game.html:28187-28201.
## The same legacy refund is recorded during equip transfer at 16302-16318.
## Domain: absent or finite numeric enh/tier/_enhRefund; finite legacy totals
## within JS safe-integer precision. Numeric strings/null/bool coercion is unported.
## Rarity alone follows the source's Number.isInteger predicate via META-02.
## No item/wallet writes, State/UI binding, RNG, clock or persistence.

const ENHANCEMENT = preload("res://scripts/native_meta_enhancement_policy.gd")
const JS_NUMBER = preload("res://port_modules/combat_stat_formula/producer.gd")
const BASE_VALUES := [1000, 2000, 10000, 20000, 50000]

static func legacy_enh_refund(enh: float, rarity: Variant) -> int:
	if enh <= 0.0:
		return 0
	var multiplier: float = ENHANCEMENT.RARITY_MULTIPLIERS[ENHANCEMENT.item_economy_rarity(rarity)]
	var total_cost := 0.0
	var i := 0
	# Keep i < enh: fractional positive enh also visits its final partial level.
	while i < enh:
		total_cost += ceil(maxf(1.0, ceil((1.0 + float(i) * 0.15) * 1.5)) * multiplier)
		i += 1
	# Source ~~ is signed32, including wrap. Do not replace with floor/int64/clamp.
	return JS_NUMBER.js_to_int32(total_cost * 0.5)

static func salvage_value(item: Dictionary) -> float:
	# Missing source keys are undefined: enh||0, tier||0, undefined>0 is false.
	# Present numeric values retain their sign/fraction; no nonnumeric fallback.
	var enh: float = item.get("enh", 0.0)
	var tier: float = item.get("tier", 0.0)
	var recorded: float = item.get("_enhRefund", 0.0)
	var rarity: Variant = item.get("rarity")
	var refund := float(legacy_enh_refund(enh, rarity))
	if recorded > 0.0:
		refund = maxf(refund, recorded)
	return float(BASE_VALUES[ENHANCEMENT.item_economy_rarity(rarity)]) + refund + tier * 2.0
