extends RefCounted
## Pure queue policy: latest main e556b617 game.html:51219-51233,51251-51260.
## Callers supply the current PASSIVES own-key snapshot and PASSIVE_DEF, not a
## second registry. Numeric ranks/AP domain; no JS string/object coercion.
## Returned snapshots never write State, save data, UI or stats. The caller may
## request its existing applyStats only when recalculation_required is true.
const POINT_POLICY = preload("res://scripts/native_meta_point_policy.gd")
const QUEUE_LIMIT := 260

static func items(raw_queue: Variant, passives: Dictionary) -> Array:
	# Source 51220: filter first, then slice; duplicates and FIFO order survive.
	var queue: Array = []
	if raw_queue is Array:
		for key in raw_queue:
			if key is String and passives.has(key):
				queue.append(key)
				if queue.size() == QUEUE_LIMIT: break
	return queue

static func _definition(key: Variant, definitions: Array) -> Variant:
	for definition in definitions:
		if typeof(key) == TYPE_STRING and definition["key"] == key: return definition
	return null

static func _rank(passives: Dictionary, key: String) -> float:
	var rank := float(passives.get(key, 0))
	return 0.0 if is_nan(rank) else rank # Source PASSIVES[key] || 0, numeric domain.

static func process(raw_queue: Variant, passives: Dictionary, ap: float, definitions: Array) -> Dictionary:
	var queue := items(raw_queue, passives)
	var ranks := passives.duplicate()
	var balance := ap
	var invested := 0
	while not queue.is_empty():
		var key: String = queue[0]
		var definition: Variant = _definition(key, definitions)
		var rank := _rank(ranks, key)
		# Source 51226: remove missing-definition/max heads even with no AP.
		if definition == null or rank >= definition["max"]:
			queue.pop_front()
			continue
		var cost := POINT_POLICY.rank_cost(rank)
		if (0.0 if is_nan(balance) else balance) < cost: break
		# Source 51229: AP deduction -> rank increment -> shift -> invested.
		balance -= cost
		ranks[key] = rank + 1
		queue.pop_front()
		invested += 1
	# Source 51231-51233: queue assignment always; applyStats only if invested.
	return {"queue": queue, "passives": ranks, "ap": balance, "invested": invested,
		"recalculation_required": invested > 0}

static func enqueue(raw_queue: Variant, passives: Dictionary, definitions: Array, key: Variant, amount: Variant) -> Variant:
	var definition: Variant = _definition(key, definitions)
	var queue := items(raw_queue, passives)
	# Source 51254: reject without committing even the sanitized queue.
	if definition == null or not POINT_POLICY._valid_count(amount) or amount < 1: return null
	if _rank(passives, key) + queue.count(key) + amount > definition["max"]: return null
	for i in range(int(amount)): queue.append(key)
	# No extra post-append cap: source 51255-51256 doesn't add one. With current
	# 26 keys/max10 a valid state totals at most260; reads still truncate legacy.
	return queue

static func cancel(raw_queue: Variant, passives: Dictionary, index: Variant) -> Variant:
	var queue := items(raw_queue, passives)
	if not POINT_POLICY._valid_count(index) or index >= queue.size(): return null
	queue.remove_at(int(index)) # 51259: index into the filtered/truncated view.
	return queue
