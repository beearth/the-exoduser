extends RefCounted
## Pure quote policy: game.html:28077-28104,28185-28186 at origin/main 284d7faf.
## Numeric domain: finite numbers with finite rate math and costs within JS safe integers.
## No numeric strings/null/bool/object coercion or NaN/Infinity support is claimed.
## Fractional/negative numeric inputs are not rounded/clamped as enhancement levels.
## Rarity is the exception: preserve the source's Number.isInteger type predicate.
## No RNG, wallet/equipment writes, State/Main/UI binding, or persistence.

const MALICE_COST_MULTIPLIER := 0.5
const RARITY_MULTIPLIERS := [0.5, 0.7, 1.0, 1.3, 1.8]

static func enh_rate(enh: float) -> float:
	# Percent. enh_cost.rate below is the fraction used for a success decision.
	return maxf(0.5, 99.0 * pow(0.99, enh))

static func malice_cost(value: float) -> int:
	# Finite numeric subset of Number(value)||0; other JS coercions are unported.
	if value <= 0.0:
		return 0
	return maxi(1, ceili(value * MALICE_COST_MULTIPLIER))

static func enh_cost_raw(enh: float) -> int:
	return maxi(20000, ceili((20000.0 + enh * 3500.0) * 1.5))

static func item_economy_rarity(rarity: Variant) -> int:
	# Do not coerce "4"/true/2.5 into a valid numeric integer rarity.
	if typeof(rarity) == TYPE_INT:
		return mini(int(rarity), 4) if int(rarity) >= 0 else 0
	if typeof(rarity) == TYPE_FLOAT:
		var number := float(rarity)
		if is_finite(number) and number >= 0.0 and floor(number) == number:
			return int(minf(number, 4.0))
	return 0

static func enh_cost(enh: float, rarity: Variant) -> Dictionary:
	var multiplier: float = RARITY_MULTIPLIERS[item_economy_rarity(rarity)]
	# raw ceil -> rarity multiply/ceil -> discount/ceil: keep the source order.
	return {"rate": enh_rate(enh) / 100.0,
		"cost": malice_cost(ceil(float(enh_cost_raw(enh)) * multiplier))}

static func enh_mul(enh: float) -> float:
	return enh * 0.25

static func enh_mul_atk(enh: float) -> float:
	return enh * 0.25

static func xfer_cost(enh: float) -> int:
	return malice_cost(ceil(enh * 1000.0))
