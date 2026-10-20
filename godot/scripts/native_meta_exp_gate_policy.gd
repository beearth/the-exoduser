extends RefCounted
## Pure META-06 policy, main e556b617 game.html:16644-16648,43122-43155.
## Snapshots use source runtime field names; no State/save writer or real clock.
## lv is integral; exp/maxExp are finite numeric; count is numeric or absent.
## NaN count follows source comparison/||0 behavior. Arbitrary
## JS string/object coercion for these numbers is outside this API's domain.
const DEMO_LEVEL_CAP := 100
const TRANSCEND_LEVEL := 1000

static func date_key(local_year: int, local_month: int, local_day: int) -> String:
	# 43122: injected LOCAL civil fields, month is1-based; no UTC conversion.
	# Source pads month/day, not year. The owner supplies a valid local date.
	return str(local_year) + "-%02d-%02d" % [local_month, local_day]

static func transcendence_gate(state: Dictionary, today: String) -> Dictionary:
	var next := state.duplicate()
	var date: Variant = next.get("_transLvDate")
	# 43125: absent/falsy/different date resets count before the comparison.
	if not date is String or date.is_empty() or date != today:
		next["_transLvDate"] = today
		next["_transLvCount"] = 0
	# Absent count with an already-current date: JS undefined<1 is false.
	return {"allowed": float(next.get("_transLvCount", NAN)) < 1.0, "state": next}

static func _gate(state: Dictionary, demo: bool, today: String, in_loop: bool) -> Dictionary:
	var next := state.duplicate()
	var reason := ""
	# 43137/43147: demo gate precedes daily gate, so blocked demo does not reset
	# the date/count. Entry runs even when no level is affordable.
	if next["lv"] >= DEMO_LEVEL_CAP and demo:
		reason = "demo"
	elif next["lv"] >= TRANSCEND_LEVEL:
		var daily := transcendence_gate(next, today)
		next = daily["state"]
		if not daily["allowed"]: reason = "daily"
	if not reason.is_empty():
		# 43137-43138 use min; 43147-43148 assign maxExp-1 directly.
		next["exp"] = float(next["maxExp"]) - 1.0 if in_loop else minf(float(next["exp"]), float(next["maxExp"]) - 1.0)
	return {"allowed": reason.is_empty(), "reason": reason, "state": next}

static func entry_gate(state: Dictionary, demo: bool, today: String) -> Dictionary:
	return _gate(state, demo, today, false)

static func loop_gate(state: Dictionary, demo: bool, today: String) -> Dictionary:
	# Caller invokes this only after exp>=maxExp, before increment/deduction.
	# Request a fresh local day at EVERY daily check, not once per XP grant.
	return _gate(state, demo, today, true)

static func after_level_up(state: Dictionary) -> Dictionary:
	# 43154: lv is already incremented; 999->1000 does not consume a daily
	# allowance. Date reset belongs to the gate, not this post-increment step.
	var next := state.duplicate()
	if next["lv"] > TRANSCEND_LEVEL:
		var count := float(next.get("_transLvCount", 0))
		next["_transLvCount"] = (0.0 if is_nan(count) else count) + 1.0
	return next
