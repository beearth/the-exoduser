extends RefCounted
## BC04: ordinary CH1 _bossAI through the _bossStartPattern call boundary only.
## Input snapshots are never mutated. The caller owns applying the returned packet.
## No actor, global RNG, clock, player-stat counter, save or World connection.

const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const Utility = preload("res://scripts/native_ch1_boss_utility.gd")


static func source_receipt() -> Dictionary:
	return {"source_main": "e556b617190c325ca39f5add04357f5dea5ca87e",
		"game_sha256": "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4",
		"source_lines": [38373, 38442], "dependency": "BC03 349ec241c12e403499a4b063a94e692fdd396543",
		"demo_last_stage": 0, "finale_requires_stage": 3, "live_selection_connected": false}


## rng(tag)->unit [0,1). NOT_READY packets have no applicable next state, even if
## a provider already consumed a draw; rng_ledger preserves those attempts.
## Array null cooldown entries denote JS absent slots (not numeric zero).
static func select_tick(si: int, enemy: Dictionary, sp: float, distance: float,
		ps: Variant, rng: Callable = Callable(), boss_debug: bool = false) -> Dictionary:
	var ctx: Dictionary = {"rng": rng, "ledger": [], "error": ""}
	if not Catalog.boss_for_stage(si).get("supported", false): return _failed(ctx, "unsupported_chapter_stage")
	if not is_finite(sp) or not is_finite(distance): return _failed(ctx, "non_finite_tick")
	if not enemy.get("_bossPhase") is int: return _failed(ctx, "phase_missing")
	var phase: int = enemy["_bossPhase"]
	var ph: Dictionary = Catalog.phase_by_index(phase)
	if ph.is_empty(): return _failed(ctx, "unsupported_phase")
	if not _number(enemy.get("stunned")) or not enemy.get("s") is String:
		return _failed(ctx, "actor_gate_shape_missing")
	var e: Dictionary = enemy.duplicate(true)
	var stats: Variant = ps.duplicate(true) if ps is Dictionary else ps
	var cds: Variant = e.get("_moveCDs")
	if cds != null:
		if not cds is Array: return _failed(ctx, "cooldown_shape_unsupported")
		for i in range(mini(59, cds.size())):
			if cds[i] == null: continue
			if not _number(cds[i]): return _failed(ctx, "cooldown_value_unsupported")
			if cds[i] > 0: cds[i] -= sp # No clamp, and idx59/60 are not decremented.
	if e["stunned"] > 0 or e["s"] != "idle": return _ready(ctx, e, stats, "actor_gate")
	e["_combatSt"] = "approach" if distance > 180 - phase * 20 + 30 else ("retreat" if distance < 50 else "engage")
	if not _number(e.get("bossPatT")): return _failed(ctx, "pattern_timer_missing")
	e["bossPatT"] -= sp
	if e["bossPatT"] > 0 or distance > 500 or distance < 20:
		return _ready(ctx, e, stats, "timer_or_distance_gate")
	if stats != null:
		if not stats is Dictionary: return _failed(ctx, "player_stats_shape_unsupported")
		# JS missing avgDist propagates NaN, rather than inventing a zero history.
		if stats.has("avgDist") and not _number(stats["avgDist"], false): return _failed(ctx, "average_distance_unsupported")
		stats["avgDist"] = stats.get("avgDist", NAN) * 0.95 + distance * 0.05
	var seq: Variant = e.get("_comboSeq")
	if seq != null and not seq is Array: return _failed(ctx, "combo_shape_unsupported")
	var combo_idx: Variant = e.get("_comboIdx", NAN)
	if not _number(combo_idx, false): return _failed(ctx, "combo_index_unsupported")
	var history: Variant = e.get("_lastMoves")
	if history != null and not history is Array: return _failed(ctx, "history_shape_unsupported")
	if history is Array:
		for id in history:
			if not id is String: return _failed(ctx, "history_id_unsupported")
	var streak: Variant = e.get("_meleeStreak", 0)
	if streak != null and not _number(streak): return _failed(ctx, "streak_shape_unsupported")
	# Current source _DEMO_LAST_STAGE=0 makes _isDruidFinale impossible at si3.
	# A future finale route requires its own provider, not an ordinary AI fallback.
	if seq is Array and combo_idx < seq.size():
		var next_id: Variant = null
		if combo_idx >= 0 and floor(float(combo_idx)) == combo_idx: next_id = seq[int(combo_idx)]
		var move: Dictionary = Catalog.move_by_id(next_id) if next_id is String else {}
		var cd_ok: bool = cds == null
		if not move.is_empty() and cds is Array and move["idx"] < cds.size():
			var cd: Variant = cds[move["idx"]]
			if cd != null:
				if not _number(cd): return _failed(ctx, "combo_cooldown_unsupported")
				cd_ok = cd <= 0
		if not move.is_empty() and move["phase"].has(phase) \
				and Catalog.boss_for_stage(si)["move_ids"].has(next_id) and cd_ok:
			e["_comboIdx"] = combo_idx + 1
			_write_cd(e, move, ph)
			var unit: Variant = _draw(ctx, "combo_timer", 38396)
			if ctx["error"] != "": return _failed(ctx)
			e["bossPatT"] = int(6 + unit * 6)
			_record(e, move)
			return _start(ctx, e, stats, "combo", move, ph, distance, true)
		e["_comboSeq"] = null
		e["_comboIdx"] = 0
	var scores: Array = []
	# Non-CH1 registrations fail the source Set gate; retain all 59 score slots.
	for entry: Dictionary in Catalog.source_receipt()["move_manifest"]:
		var move: Dictionary = Catalog.move_by_id(entry["id"])
		if move.is_empty():
			scores.append(-1.0)
			continue
		var score_rng: Callable = func(_tag: String) -> Variant: return _draw(ctx, "boss_score", 37693)
		var scored: Dictionary = Utility.evaluate_move(si, move, distance, stats, phase, e, score_rng)
		if scored["status"] != "READY": return _failed(ctx, scored["reason"])
		scores.append(scored["score"])
	var roulette_rng: Callable = func(_tag: String) -> Variant: return _draw(ctx, "roulette", 38419)
	var picked: Dictionary = pick_top_six(scores, roulette_rng)
	if picked["status"] != "READY": return _failed(ctx, picked["reason"])
	if picked["ordinal"] < 0:
		var unit: Variant = _draw(ctx, "no_positive_timer", 38410)
		if ctx["error"] != "": return _failed(ctx)
		e["bossPatT"] = 10 + unit * 10
		return _ready(ctx, e, stats, "no_positive_score")
	var best: Dictionary = Catalog.move_by_id(Catalog.source_receipt()["move_manifest"][picked["ordinal"]]["id"])
	if boss_debug: e["_dbgScores"] = scores
	_record(e, best)
	_write_cd(e, best, ph)
	if not _number(e.get("bossPatCd")): return _failed(ctx, "pattern_cooldown_missing")
	var unit: Variant = _draw(ctx, "pattern_timer", 38430)
	if ctx["error"] != "": return _failed(ctx)
	e["bossPatT"] = (e["bossPatCd"] + unit * 15) * ph["cdM"]
	unit = _draw(ctx, "combo_gate", 38432)
	if ctx["error"] != "": return _failed(ctx)
	if unit < ph["comboC"]:
		var combos: Array = []
		for combo: Dictionary in Catalog.combos_for_stage(si, phase):
			if combo["seq"][0] == best["id"]: combos.append(combo)
		if not combos.is_empty():
			unit = _draw(ctx, "combo_choice", 38435)
			if ctx["error"] != "": return _failed(ctx)
			e["_comboSeq"] = combos[int(unit * combos.size())]["seq"].duplicate()
			e["_comboIdx"] = 1
	return _start(ctx, e, stats, "selected", best, ph, distance, false)


## Same 59-slot score table as _bossAI. Stable source ordinal breaks sort ties.
## Separated so exact ties, .001 weight floor and top-six exclusion can be tested.
static func pick_top_six(scores: Array, rng: Callable = Callable()) -> Dictionary:
	var ctx: Dictionary = {"rng": rng, "ledger": [], "error": ""}
	if scores.size() != 59: return _failed(ctx, "source_score_count_mismatch")
	var best: int = -1
	var best_score: float = -1.0
	var candidates: Array = []
	for i in range(scores.size()):
		if not _number(scores[i]): return _failed(ctx, "score_shape_unsupported")
		if scores[i] > best_score:
			best = i
			best_score = scores[i]
		if scores[i] > 0: candidates.append({"ordinal": i, "score": scores[i]})
	if best < 0 or best_score <= 0: return {"status": "READY", "ordinal": -1, "rng_ledger": []}
	if candidates.size() > 1:
		candidates.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
			return a["score"] > b["score"] if a["score"] != b["score"] else a["ordinal"] < b["ordinal"])
		var top_n: int = mini(6, candidates.size())
		var total: float = 0.0
		for i in range(top_n):
			candidates[i]["weight"] = maxf(0.001, candidates[i]["score"])
			total += candidates[i]["weight"]
		var unit: Variant = _draw(ctx, "roulette", 38419)
		if ctx["error"] != "": return _failed(ctx)
		var r: float = unit * total
		for i in range(top_n):
			r -= candidates[i]["weight"]
			if r <= 0:
				best = candidates[i]["ordinal"]
				best_score = candidates[i]["score"]
				break
	return {"status": "READY", "ordinal": best, "score": best_score, "rng_ledger": ctx["ledger"]}


static func _start(ctx: Dictionary, e: Dictionary, ps: Variant, outcome: String,
		move: Dictionary, ph: Dictionary, distance: float, combo: bool) -> Dictionary:
	e["_feinting"] = false
	if move["canFeint"]:
		var unit: Variant = _draw(ctx, "feint", 38399 if combo else 38438)
		if ctx["error"] != "": return _failed(ctx)
		e["_feinting"] = unit < ph["feintC"]
	var delay: int = 0
	if move["canDelay"] > 0:
		var unit: Variant = _draw(ctx, "delay", 38400 if combo else 38440)
		if ctx["error"] != "": return _failed(ctx)
		if unit < ph["delayC"]: delay = int(move["tele"] * move["canDelay"])
	var result: Dictionary = _ready(ctx, e, ps, outcome)
	result["start_pattern"] = {"command": "_bossStartPattern", "move_id": move["id"],
		"distance": distance, "phase": e["_bossPhase"], "extra_delay": delay}
	return result


static func _record(e: Dictionary, move: Dictionary) -> void:
	if e.get("_lastMoves") is Array:
		e["_lastMoves"].append(move["id"])
		if e["_lastMoves"].size() > 5: e["_lastMoves"].pop_front() # Shift once, not truncate.
	e["_meleeStreak"] = 0 if move["tags"].has("ranged") else (e.get("_meleeStreak", 0) if e.get("_meleeStreak") != null else 0) + 1


static func _write_cd(e: Dictionary, move: Dictionary, ph: Dictionary) -> void:
	if e.get("_moveCDs") is Array:
		if e["_moveCDs"].size() <= move["idx"]: e["_moveCDs"].resize(move["idx"] + 1)
		e["_moveCDs"][move["idx"]] = move["cd"] * ph["cdM"]


static func _draw(ctx: Dictionary, tag: String, line: int) -> Variant:
	if not ctx["rng"].is_valid():
		ctx["error"] = "rng_provider_missing"
		return null
	var unit: Variant = ctx["rng"].call(tag)
	ctx["ledger"].append({"field": tag, "source_line": line, "unit": unit})
	if not _number(unit) or unit < 0 or unit >= 1:
		ctx["error"] = "rng_unit_invalid"
		return null
	return unit


static func _number(value: Variant, finite: bool = true) -> bool:
	return (value is int or value is float) and (not finite or is_finite(float(value)))


static func _failed(ctx: Dictionary, reason: String = "") -> Dictionary:
	return {"status": "NOT_READY", "reason": reason if reason != "" else ctx["error"],
		"enemy": null, "player_stats": null, "start_pattern": null, "rng_ledger": ctx["ledger"]}


static func _ready(ctx: Dictionary, e: Dictionary, ps: Variant, outcome: String) -> Dictionary:
	return {"status": "READY", "outcome": outcome, "enemy": e, "player_stats": ps,
		"start_pattern": null, "rng_ledger": ctx["ledger"]}
