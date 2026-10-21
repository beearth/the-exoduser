extends RefCounted
## BC03: game.html:37650-37699 numeric utility only, no selection or actor writes.
## move and enemy are snapshots supplied by their source owners (BC01/BC02).
## ps is a read-only Dictionary or null; Q/E/player-stat counters are never written.

const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const CatalogContext = preload("res://scripts/native_boss_catalog_context.gd")
const _FACE_MOVES = ["jump", "charge", "slashCombo", "sweep", "tailSwipe", "beanStorm"]


static func source_receipt() -> Dictionary:
	return {"source_main": "284d7faf49295b2f5061937a47ce96038032ed3c",
		"game_sha256": preload("res://source_snapshot/snapshot.gd").SHA256,
		"source_lines": [37650, 37699], "rng_line": 37693,
		"dependency": "BC02 3d510c2b400f26342dcf5e9899a38034fd1e7c0a",
		"face_moves": _FACE_MOVES.duplicate(true), "live_selection_connected": false}


## rng("boss_score")->numeric unit in [0,1). Gates return READY with -1/0 and no draw.
## Invalid/missing source shape returns NOT_READY with null score, not a neutral score.
## Null catalog owns si0..3; an explicit chapter catalog supplies its own stage Set.
## move is the same source metadata argument as _bossScore.
static func evaluate_move(si: int, move: Dictionary, distance: float, ps: Variant,
		phase: int, enemy: Dictionary, rng: Callable = Callable(), chapter_catalog: Variant = null) -> Dictionary:
	var resolved: Dictionary = CatalogContext.resolve(chapter_catalog)
	if not resolved["ready"]: return _not_ready(resolved["reason"])
	var data_catalog: Variant = resolved["catalog"]
	var boss: Dictionary = data_catalog.boss_for_stage(si)
	if not boss.get("supported", false): return _not_ready("unsupported_chapter_stage")
	if not move.get("id") is String: return _not_ready("move_id_missing")
	var id: String = move["id"]
	if id == "cageTrap": return _gate(-1.0, "cageTrap")
	if not move.get("phase") is Array: return _not_ready("move_phase_missing")
	if not move["phase"].has(phase): return _gate(-1.0, "phase")
	if not boss["move_ids"].has(id): return _gate(-1.0, "moveset")
	if not move.get("idx") is int or move["idx"] < 0: return _not_ready("move_idx_missing")
	var cds: Variant = enemy.get("_moveCDs")
	if cds != null:
		if not cds is Array: return _not_ready("cooldown_shape_unsupported")
		# JS out-of-range/hole > 0 is false, including idx60 in the original 59 array.
		if move["idx"] < cds.size() and cds[move["idx"]] != null:
			var cd: Variant = cds[move["idx"]]
			if not _numeric(cd): return _not_ready("cooldown_value_unsupported")
			if cd > 0: return _gate(0.0, "cooldown")
	if not is_finite(distance): return _not_ready("non_finite_distance")
	var bounds: Variant = move.get("range")
	if not bounds is Array or bounds.size() < 2 or not _numeric(bounds[0]) or not _numeric(bounds[1]):
		return _not_ready("move_range_missing")
	if not is_finite(float(bounds[0])) or not is_finite(float(bounds[1])):
		return _not_ready("non_finite_move_range")
	if not move.get("tags") is Array or not move.get("canFeint") is bool:
		return _not_ready("move_tags_or_feint_missing")
	var tags: Array = move["tags"]
	var history: Variant = enemy.get("_lastMoves")
	if history != null and not history is Array: return _not_ready("history_shape_unsupported")
	if history is Array:
		for entry in history:
			if not entry is String: return _not_ready("history_id_unsupported")
	if ps != null and not ps is Dictionary: return _not_ready("player_stats_shape_unsupported")
	if ps is Dictionary:
		for key in ["parryRate", "dashRate", "healRate", "kiteRate", "aggroRate"]:
			if ps.has(key) and not _numeric(ps[key]): return _not_ready("player_stat_unsupported:" + key)
	var seq: Variant = enemy.get("_comboSeq")
	if seq != null and not seq is Array: return _not_ready("combo_shape_unsupported")
	var combo_idx: Variant = enemy.get("_comboIdx", NAN)
	if not _numeric(combo_idx): return _not_ready("combo_index_unsupported")
	var streak: Variant = enemy.get("_meleeStreak", 0)
	if streak == null: streak = 0 # numeric/absent source ||0; no state default is written.
	if not _numeric(streak): return _not_ready("streak_shape_unsupported")
	var mid: float = (float(bounds[0]) + float(bounds[1])) / 2.0
	var span: float = maxf(1.0, (float(bounds[1]) - float(bounds[0])) / 2.0)
	var normalized: float = (distance - mid) / span
	var dist_fit: float = exp(-normalized * normalized)
	var repeat_pen: float = 1.0
	if history is Array:
		for i in range(history.size()):
			if history[i] != id: continue
			var age: int = history.size() - 1 - i
			if age <= 0: repeat_pen *= 0.15
			elif age == 1: repeat_pen *= 0.28
			elif age == 2: repeat_pen *= 0.45
			else: repeat_pen *= 0.70
	var counter: float = 0.0
	if ps is Dictionary:
		if ps.get("parryRate", NAN) > 0.4 and move["canFeint"]: counter += 0.5
		if ps.get("dashRate", NAN) > 0.5 and tags.has("aoe"): counter += 0.3
		if ps.get("healRate", NAN) > 0.3 and tags.has("gap-close"): counter += 0.4
		if ps.get("kiteRate", NAN) > 0.3 and tags.has("gap-close"): counter += 0.5
		if ps.get("kiteRate", NAN) > 0.3 and tags.has("cc"): counter += 0.4
		if ps.get("aggroRate", NAN) > 0.5 and tags.has("punish"): counter += 0.5
		if ps.get("aggroRate", NAN) > 0.5 and tags.has("aoe"): counter += 0.3
	if enemy.get("_combatSt") == "retreat" and tags.has("gap-close"): counter += 0.6
	if enemy.get("_combatSt") == "approach" and tags.has("ranged"): counter += 0.4
	if enemy.get("_combatSt") == "engage" and (tags.has("melee") or tags.has("aoe")): counter += 0.3
	if distance < 130.0 and id in ["slashCombo", "slam", "sweep"]: counter += 0.8
	if distance < 80.0 and id == "slashCombo": counter += 0.6
	if distance > 100.0 and distance < 1200.0 and id == "teleStrike": counter += 0.7
	var combo: float = 0.0
	# Negative/fractional source array properties are absent; never Godot reverse indexing.
	if seq is Array and is_finite(float(combo_idx)) and combo_idx >= 0 \
			and floor(float(combo_idx)) == combo_idx and combo_idx < seq.size() and seq[int(combo_idx)] == id:
		combo = 2.4
	var phase_pref: float = 0.0
	if phase >= 3 and tags.has("aoe"): phase_pref += 0.3
	if phase >= 3 and tags.has("multi-hit"): phase_pref += 0.2
	if phase <= 1 and tags.has("utility"): phase_pref += 0.2
	# In JS [] is truthy: missing/null history differs from an explicitly empty array.
	var novelty: float = 0.35 if history is Array and not history.has(id) else 0.0
	if not rng.is_valid(): return _not_ready("rng_provider_missing")
	var u: Variant = rng.call("boss_score")
	if not _numeric(u) or not is_finite(float(u)) or u < 0 or u >= 1:
		return {"status": "NOT_READY", "reason": "rng_unit_invalid", "score": null,
			"rng_ledger": [{"field": "boss_score", "source_line": 37693, "unit": u}]}
	var score: float = (dist_fit * 1.0 + repeat_pen * 0.6 + counter * 0.7 \
		+ combo * 1.2 + phase_pref * 0.5 + novelty) * (0.85 + u * 0.3)
	if si == 2 and _FACE_MOVES.has(id): score += 2.0
	if (si == 0 or si == 3) and streak >= 3 and (tags.has("ranged") or tags.has("ambush")):
		score *= 3.0
	return {"status": "READY", "score": score, "gate": "",
		"rng_ledger": [{"field": "boss_score", "source_line": 37693, "unit": u}],
		"terms": {"distance_fit": dist_fit, "repeat_penalty": repeat_pen,
			"counter_adjust": counter, "combo_bonus": combo, "phase_preference": phase_pref, "novelty": novelty}}


static func _numeric(value: Variant) -> bool:
	return value is int or value is float


static func _gate(score: float, reason: String) -> Dictionary:
	return {"status": "READY", "score": score, "gate": reason, "rng_ledger": []}


static func _not_ready(reason: String) -> Dictionary:
	return {"status": "NOT_READY", "score": null, "reason": reason, "rng_ledger": []}
