extends RefCounted
## EC5-01: latest main game.html 16633–16666, 30969–31022.
## Reuses the EC2-01 API/diagnostic/selection format as a separate chapter leaf; reads no unmerged EC2/EC3 follow-ups.
## CH5 si21..25 only. Returns choices; no actor, registry, State or RNG ownership.
## Element values are original EL ids (14333), not translated display names.
const POOL = [[0,4],[1,2],[2,10],[3,4],[4,3],[5,6],[6,3],[7,7],[8,2],[9,1],[10,3],[11,2],[12,6],[13,2],[14,10],[15,3],[16,6],[17,1],[18,3],[19,2],[60,10],[61,10],[62,4],[63,8],[64,8],[65,10],[66,2],[67,6],[68,2],[69,1],[47,10]]
# 30991 global _RANGED_ET intersected with CH5 pool; 11/47 are not ranged.
const RANGED = [1,7,8,9,13,16,17,66]

func pick_etype(stage: int, random_unit: Callable) -> Dictionary:
	var guard: Dictionary = _guard(stage, random_unit)
	if not guard.is_empty():
		return guard
	var first: Dictionary = _sample(random_unit, 0)
	if first.status != "READY":
		return first
	if first.value < 0.5:
		var ranged_pool: Array = []
		var ranged_total: float = 0.0
		for entry in POOL:
			if entry[0] in RANGED:
				ranged_pool.append(entry)
				ranged_total += entry[1]
		var draw: Dictionary = _sample(random_unit, 1)
		if draw.status != "READY":
			return draw
		var roll: float = draw.value * ranged_total
		var cumulative: float = 0.0
		for entry in ranged_pool:
			cumulative += entry[1]
			if roll < cumulative:
				return _ready(entry[0], 2)
		return _ready(ranged_pool[-1][0], 2)
	# 30986–30989: sum weight/total in source order, never integer remapping.
	var total: float = 0.0
	for entry in POOL:
		total += entry[1]
	var cdf: Array = []
	var cumulative: float = 0.0
	for entry in POOL:
		cumulative += float(entry[1]) / total
		cdf.append([entry[0], cumulative])
	# 31010–31015: twelve whole-CDF attempts; ranged rejects still consume RNG.
	for attempt in range(12):
		var draw: Dictionary = _sample(random_unit, attempt + 1)
		if draw.status != "READY":
			return draw
		var etype: int = cdf[-1][0]
		for entry in cdf:
			if draw.value < entry[1]:
				etype = entry[0]
				break
		if etype not in RANGED:
			return _ready(etype, attempt + 2)
	return _ready(2, 13)

func pick_element(stage: int, random_unit: Callable) -> Dictionary:
	var guard: Dictionary = _guard(stage, random_unit)
	if not guard.is_empty():
		return guard
	var first: Dictionary = _sample(random_unit, 0)
	if first.status != "READY":
		return first
	# 30985 / 31017–31022: D .45, otherwise uniform P/F/I/D/L/H (E excluded).
	if first.value < 0.45:
		return _ready(3, 1)
	var draw: Dictionary = _sample(random_unit, 1)
	if draw.status != "READY":
		return draw
	return _ready(int(draw.value * 6.0), 2)

func _guard(stage: int, random_unit: Callable) -> Dictionary:
	if stage < 21 or stage > 25:
		return _not_ready("unsupported_stage", 0)
	if not random_unit.is_valid():
		return _not_ready("invalid_random_callable", 0)
	return {}

func _sample(random_unit: Callable, consumed: int) -> Dictionary:
	var value: Variant = random_unit.call()
	# Contract diagnosis only: never clamp/retry/replace an invalid provider sample.
	if typeof(value) != TYPE_INT and typeof(value) != TYPE_FLOAT:
		return _not_ready("invalid_random_sample", consumed + 1)
	var number: float = float(value)
	if not is_finite(number) or number < 0.0 or number >= 1.0:
		return _not_ready("invalid_random_sample", consumed + 1)
	return {"status": "READY", "value": number, "draws": consumed + 1}

func _ready(value: int, draws: int) -> Dictionary:
	return {"status": "READY", "value": value, "draws": draws}

func _not_ready(reason: String, draws: int) -> Dictionary:
	return {"status": "NOT_READY", "reason": reason, "draws": draws}
