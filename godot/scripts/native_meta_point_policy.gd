extends RefCounted
## Pure stat-panel-ui.js:4-23,256-274 and game.html:27894-27896 at main284d7faf.
## Numeric allocation domain: finite numbers, except +INF max for uncapped grit.
## No Number/string/null coercion for allocation values. Amount type predicates and
## evaluatePlan safe-integer guards are preserved, not added to direct transactions.
## No State/raw-grit writer, point/queue writes, UI, clock, RNG or persistence.

const RANK_COSTS := [1, 1, 1, 2, 2, 2, 3, 3, 3, 5]
const MAX_SAFE_INTEGER := 9007199254740991

static func _number(value: Variant) -> bool:
	return value is int or value is float

static func _integer(value: Variant) -> bool:
	return _number(value) and is_finite(float(value)) and floorf(float(value)) == float(value)

static func _valid_count(value: Variant) -> bool:
	return _integer(value) and value >= 0 and value <= MAX_SAFE_INTEGER

static func _strict_equal(a: Variant, b: Variant) -> bool:
	if _number(a) and _number(b):
		return float(a) == float(b)
	return typeof(a) == typeof(b) and is_same(a, b)

static func _same_values(a: Dictionary, b: Dictionary) -> bool:
	if a.size() != b.size(): return false
	for key in a:
		if not b.has(key) or not _strict_equal(a[key], b[key]): return false
	return true

static func rank_cost(rank: Variant) -> int:
	# Finite numeric rank indexes only; non-index numeric values use source ||5.
	return RANK_COSTS[int(rank)] if _integer(rank) and rank >= 0 and rank < RANK_COSTS.size() else 5

static func stat_change(value: float, maximum: float, points: float, amount: Variant) -> Variant:
	if not _integer(amount) or amount == 0: return null
	var step := float(amount)
	if value + step < 0.0 or value + step > maximum or points - step < 0.0: return null
	return {"value": value + step, "points": points - step}

static func passive_change(value: float, maximum: float, points: float, amount: Variant) -> Variant:
	if not _number(amount) or (amount != 1 and amount != -1): return null
	var next := value + float(amount)
	var balance := points - (rank_cost(value) if amount > 0 else -rank_cost(next))
	return null if next < 0.0 or next > maximum or balance < 0.0 else {"value": next, "points": balance}

static func grit_cost() -> int:
	return 1

static func grit_batch_cost(amount: float) -> float:
	return maxf(0.0, amount)

static func refund_totals(stats: Dictionary, passives: Dictionary, grit: float) -> Dictionary:
	var sp := grit
	for value in stats.values(): sp += float(value)
	var ap := 0.0
	for level in passives.values():
		var ranks := maxf(0.0, ceil(float(level)))
		for rank in range(int(minf(ranks, RANK_COSTS.size()))): ap += rank_cost(rank)
		ap += maxf(0.0, ranks - RANK_COSTS.size()) * 5.0
	return {"sp": sp, "ap": ap}

static func create_plan(state: Dictionary) -> Dictionary:
	var base := {"stats": state["stats"].duplicate(), "passives": state["passives"].duplicate(), "grit": state.get("grit", 0)}
	return {"base": base, "stats": base["stats"].duplicate(), "passives": base["passives"].duplicate(), "grit": base["grit"]}

static func evaluate_plan(plan: Variant, live: Dictionary, caps: Dictionary, defs: Array) -> Variant:
	# Structured plan/live/caps/defs is the API shape, as in the source panel.
	if plan == null: return null
	var grit: Variant = live.get("grit", 0)
	var base: Dictionary = plan["base"]
	if not _same_values(base["stats"], live["stats"]) or not _same_values(base["passives"], live["passives"]) or not _strict_equal(base["grit"], grit): return null
	var stats: Dictionary = plan["stats"]
	var passives: Dictionary = plan["passives"]
	if stats.size() != live["stats"].size() or passives.size() != live["passives"].size(): return null
	for key in stats:
		if not live["stats"].has(key): return null
	for key in passives:
		if not live["passives"].has(key): return null
	if not _valid_count(plan["grit"]) or not _valid_count(live["sp"]) or not _valid_count(live["ap"]): return null
	for key in stats:
		if not _valid_count(stats[key]) or not caps.has(key) or stats[key] > maxf(float(caps[key]), float(live["stats"][key])): return null
	var limits := {}
	for definition in defs: limits[definition["key"]] = definition["max"]
	for key in passives:
		if not _valid_count(passives[key]) or passives[key] > maxf(float(limits.get(key, 0)), float(live["passives"][key])): return null
	var before := refund_totals(live["stats"], live["passives"], grit)
	var after := refund_totals(stats, passives, plan["grit"])
	# Preserve JS left-to-right float arithmetic; validate only final balances.
	var sp: float = float(live["sp"]) + before["sp"] - after["sp"]
	var ap: float = float(live["ap"]) + before["ap"] - after["ap"]
	if not _valid_count(sp) or not _valid_count(ap): return null
	var changes := 0
	for key in stats:
		if not _strict_equal(stats[key], live["stats"][key]): changes += 1
	for key in passives:
		if not _strict_equal(passives[key], live["passives"][key]): changes += 1
	if not _strict_equal(plan["grit"], grit): changes += 1
	var result := live.duplicate()
	result.merge({"stats": stats.duplicate(), "passives": passives.duplicate(), "grit": plan["grit"], "sp": sp, "ap": ap,
		"changes": changes, "spentSP": float(live["sp"]) - sp, "spentAP": float(live["ap"]) - ap}, true)
	return result
