extends RefCounted
## Detached calculation of game.html 3771-3908 / 3499-3530 only.
## Protected Q/E helpers are observed handoffs, never new implementations.
const JS = preload("res://port_modules/save_adapter/source_player_restore.gd")
const GRAPH = preload("res://port_modules/save_adapter/source_inventory_restore.gd")
const NUMBER = preload("res://port_modules/save_adapter/source_shared_store.gd")
const STAGES := ["skills", "fused", "mastery", "fusion_repair", "active", "protected_qe", "active_ct", "protected_active_sync", "slots", "sanitize_numbers", "protected_wing", "sanitize_fused"]
const ACTIVE := ["activeLMBSk", "activeChargeSk", "activeMagicSk", "activeQSk", "activeCtSk", "activeBowSk", "activeRMBSk"]
const FIXED_KICK := ["bladeShot", "fanShot", "omniBeam", "bladeDash", "ghostWalk", "iceOrb", "timeWarp"]
const FIXED_AUTO := ["bladeShot", "fanShot", "omniBeam", "bladeDash", "shieldThrow", "blastShot", "ghostWalk", "iceOrb", "timeWarp", "chainSlam", "chainAssault", "chainSlash", "needleShot", "peaceShield", "hellRay", "blueShot", "burstLoop", "holyDome", "fireball", "arcLaser", "ltnChaser"]
var _graph := GRAPH.new()
var _number := NUMBER.new()
var _held := ""
var _tables := {}
var _by_id := {}

func _receipt(status: String, reason: String, trace: Array = [], failed: String = "", state: Dictionary = {}) -> Dictionary:
	return {"status": status, "reason": reason, "trace": trace, "failed_stage": failed,
		"partial_snapshot": _copy(state), "partial_apply_authorized": false, "calculation_only": true,
		"write_authorized": false, "storage_io": false, "network": false, "restore_connected": false,
		"full_restore_verified": false, "connection_status": "HOLD",
		"pending": ["skill/fusion/growth owner tables and protected handoff acceptance", "State/Main restore writer", "applyStats/initStage and final display readback"]}
func _copy(value: Variant) -> Variant:
	return _graph._clone(value, [], [])
func _true(value: Variant) -> bool:
	return JS._truthy(value)
func _num(value: Variant) -> float:
	var receipt: Dictionary = _number._coerced_number(value)
	if receipt.status != "READY": _held = receipt.reason; return NAN
	return receipt.value
func _key(value: Variant) -> String:
	if value is Dictionary or value is Array: _held = "property_key_coercion_unproven"; return ""
	if (value is int or value is float) and is_finite(float(value)) and (float(value) != floor(float(value)) or absf(float(value)) > 9007199254740991):
		_held = "numeric_property_key_format_unproven"; return ""
	return JS._string(value)
func _id(value: Variant, id: String) -> bool:
	return value is String and value == id
func _learned(p: Dictionary, id: Variant) -> bool:
	var key := _key(id)
	# Absent is JS undefined, not Number(null). Both fail >=1.
	return p.skills.has(key) and _num(p.skills[key]) >= 1
func _default(skills: Dictionary, id: String) -> void:
	if not _true(skills.get(id)): skills[id] = 1
func _same(a: Variant, b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):
		if is_nan(float(a)) or is_nan(float(b)): return is_nan(float(a)) and is_nan(float(b))
		if a == 0 and b == 0: return PackedFloat64Array([float(a)]).to_byte_array() == PackedFloat64Array([float(b)]).to_byte_array()
		return a == b
	if typeof(a) != typeof(b): return false
	if a is Dictionary:
		if a.size() != b.size(): return false
		for key in a:
			if not b.has(key) or not _same(a[key], b[key]): return false
		return true
	if a is Array:
		if a.size() != b.size(): return false
		for i in a.size():
			if not _same(a[i], b[i]): return false
		return true
	return a == b
func _safe_keys(value: Variant) -> bool:
	if value is Dictionary:
		for key in value:
			if key in ["__proto__", "constructor", "prototype", "toString", "valueOf", "hasOwnProperty"] or not _safe_keys(value[key]): return false
	elif value is Array:
		for item in value:
			if not _safe_keys(item): return false
	return true
func _table_shape(t: Dictionary) -> bool:
	if not t.get("skills") is Array or not t.get("prof_cap") is int and not t.get("prof_cap") is float: return false
	for key in ["pairs", "groups", "slot_defs", "absorbed"]:
		if not t.get(key) is Dictionary: return false
		for id in t[key]:
			if not t[key][id] is Array: return false
			for item in t[key][id]:
				if not item is String: return false
	if not is_finite(float(t.prof_cap)) or float(t.prof_cap) < 0: return false
	var ids := {}
	for sk in t.skills:
		if not sk is Dictionary or not sk.get("id") is String or not sk.get("cat") is String or ids.has(sk.id): return false
		for key in ["act", "ult", "fixed"]:
			if not sk.get(key) is bool: return false
		ids[sk.id] = true
	for key in t.pairs:
		if not t.absorbed.has(key): return false
	return not t.skills.is_empty() and t.slot_defs.has("magic") and t.slot_defs.has("ct")

# current is the snapshot AT 3771, after preceding player/items/shared units.
# Tables and observations must be supplied by their owners. No auto IO/defaults.
func calculate(serialized: Variant, current: Dictionary, source_tables: Dictionary, observations: Dictionary = {}) -> Dictionary:
	_held = ""; _by_id = {}; _tables = source_tables
	if not _true(serialized): return _receipt("REJECTED", "source_falsy_payload")
	if not serialized is Dictionary: return _receipt("HOLD", "payload_not_object")
	if not _true(serialized.get("player")): return _receipt("REJECTED", "source_no_player_metadata_is_not_full_restore")
	if not serialized.player is Dictionary: return _receipt("HOLD", "player_carrier_unproven_not_new_game")
	if not _graph._graph_supported({"d": serialized, "current": current, "tables": source_tables, "observations": observations}, []): return _receipt("HOLD", "cyclic_or_non_json_graph")
	if not _safe_keys({"d": serialized, "current": current, "tables": source_tables, "observations": observations}): return _receipt("HOLD", "prototype_semantics_unproven")
	if not _table_shape(source_tables): return _receipt("HOLD", "source_owner_tables_absent_or_malformed")
	for sk in _tables.skills: _by_id[sk.id] = sk
	if not current.get("player") is Dictionary or not current.get("game") is Dictionary or not current.get("skill_slots") is Array or not current.has("ult_slot"): return _receipt("HOLD", "current_owner_snapshot_absent")
	if not current.player.get("skills") is Dictionary or current.skill_slots.size() < 6: return _receipt("HOLD", "current_skills_or_slots_unproven")
	var graph: Dictionary = _copy({"serialized": serialized, "state": current})
	var d: Dictionary = graph.serialized; var state: Dictionary = graph.state
	var trace := []
	for stage in STAGES:
		var stage_before: Dictionary = _copy(state)
		if stage.begins_with("protected_"):
			var boundary := _handoff(stage, state, observations.get(stage))
			if boundary != "READY": return _receipt(boundary, _held, trace, stage, state)
		else:
			_stage(stage, d, state)
			if not _held.is_empty(): return _receipt("HOLD", _held, trace, stage, stage_before)
		trace.append({"stage": stage, "state": _copy(state)})
	var result := _receipt("READY", "detached_sequence_with_supplied_protected_observations", trace)
	result["plan"] = {"state": state, "serialized": d}
	return result

func _handoff(stage: String, state: Dictionary, raw: Variant) -> String:
	if not raw is Dictionary or not raw.get("before") is Dictionary or not raw.get("after") is Dictionary or raw.get("state") not in ["returned", "source_throw"]:
		_held = "protected_owner_observation_absent:" + stage; return "HOLD"
	if not _same(state, raw.before): _held = "protected_before_snapshot_stale:" + stage; return "HOLD"
	var allowed := [["player", "activeRMBSk"], ["player", "activeQSk"]]
	if stage == "protected_active_sync":
		allowed = []
		for key in ACTIVE: allowed.append(["player", key])
	elif stage == "protected_wing":
		allowed = [["player", "skills", "maliceSwipe"], ["player", "skills", "shieldThrow"], ["player", "_fused", "shieldFuse"], ["player", "activeRMBSk"]]
	var candidate: Dictionary = _copy(state)
	for path in allowed:
		var parent: Variant = candidate; var source_parent: Variant = raw.after
		for i in path.size() - 1:
			if not parent is Dictionary or not source_parent is Dictionary or not parent.get(path[i]) is Dictionary or not source_parent.get(path[i]) is Dictionary:
				_held = "protected_observation_shape:" + stage; return "HOLD"
			parent = parent[path[i]]; source_parent = source_parent[path[i]]
		var key: String = path[-1]
		if source_parent.has(key):
			if source_parent[key] is Dictionary or source_parent[key] is Array:
				_held = "protected_leaf_carrier_unproven:" + stage; return "HOLD"
			parent[key] = source_parent[key]
		else: parent.erase(key)
	if not _same(candidate, raw.after): _held = "protected_observation_changes_unowned_fields:" + stage; return "HOLD"
	# Replay only observed leaf values into the detached graph, retaining d.fused
	# and mastery references. Caller objects and protected live writers stay untouched.
	for path in allowed:
		var parent: Variant = state; var observed: Variant = candidate
		for i in path.size() - 1: parent = parent[path[i]]; observed = observed[path[i]]
		if observed.has(path[-1]): parent[path[-1]] = _copy(observed[path[-1]])
		else: parent.erase(path[-1])
	if raw.state == "source_throw": _held = "observed_protected_source_exception:" + stage; return "SOURCE_THROW"
	return "READY"

func _stage(stage: String, d: Dictionary, state: Dictionary) -> void:
	var p: Dictionary = state.player
	var skills: Dictionary = p.skills
	match stage:
		"skills":
			if _true(d.get("skills")):
				if not d.skills is Dictionary: _held = "saved_skills_carrier_unproven"; return
				for key in _graph._js_keys(d.skills):
					if _by_id.has(key): skills[key] = d.skills[key]
				if _true(d.skills.get("chargeStock")) or _true(d.skills.get("chargeRange")):
					var range_value := _num(JS._or(d.skills.get("chargeRange"), 0))
					skills["chargeBoost"] = NAN if is_nan(range_value) else maxf(1, range_value)
		"fused":
			p["_fused"] = JS._or(d.get("fused"), {})
			if not p._fused is Dictionary: _held = "saved_fused_carrier_unproven"
		"mastery":
			for pair in [["skProf", "_skProf"], ["fuseProfSec", "_fuseProfSec"], ["cardProf", "_cardProf"], ["catProf", "_catProf"]]:
				p[pair[1]] = JS._or(d.get(pair[0]), {})
				if not p[pair[1]] is Dictionary: _held = "saved_mastery_carrier_unproven:" + pair[0]; return
			for key in _graph._js_keys(p._skProf):
				if _num(p._skProf[key]) > _tables.prof_cap: p._skProf[key] = _tables.prof_cap
		"fusion_repair": _fusion(p)
		"active": _active(d, p)
		"active_ct":
			if _true(d.get("activeCtSk")): p["activeCtSk"] = d.activeCtSk
			if not _true(p.get("activeCtSk")): p["activeCtSk"] = "ghostWalk"
			if not _id(p.activeCtSk, "ghostWalk") and not _learned(p, p.activeCtSk) and p.activeCtSk not in _tables.slot_defs.ct: p["activeCtSk"] = "ghostWalk"
			if _id(p.activeCtSk, "ghostWalk") and _true(p._fused.get("timeStep")) and _learned(p, "timeWarp"): p["activeCtSk"] = "timeWarp"
		"slots": _slots(d, state)
		"sanitize_numbers":
			p["sp"] = _int_floor(p.get("sp"), 0, 0)
			p["ap"] = _int_floor(p.get("ap"), 0, 0)
			state.game["mats"] = _int_floor(state.game.get("mats"), 0, 0)
			for key in _graph._js_keys(skills): skills[key] = _int_floor(skills[key], 0, 0)
		"sanitize_fused":
			for key in _graph._js_keys(p._fused):
				if not _true(p._fused[key]): p._fused.erase(key); continue
				var ids: Array = _tables.groups.get(key, [])
				if ids.is_empty(): ids = _tables.pairs.get(key, [])
				if ids.is_empty(): p._fused.erase(key); continue
				for id in ids: skills[id] = _int_floor(JS._or(skills.get(id), 1), 1, 1)
func _int_floor(value: Variant, fallback: float, minimum: float) -> float:
	var n := _num(value)
	var floored: float = floor(n) if is_finite(n) else fallback
	# JS Math.max(+0, -0) is +0; Godot maxf may retain its second -0.
	return minimum if floored <= minimum else floored
func _fused_lmb(p: Dictionary) -> bool:
	return (_true(p._fused.get("whirlDet")) or _true(p._fused.get("slamStorm")) or _true(p._fused.get("stormBeam"))) and _learned(p, "whirlwind")
func _fusion(p: Dictionary) -> void:
	var sk: Dictionary = p.skills; var fused: Dictionary = p._fused
	_default(sk, "kiSlash")
	if not _true(p.get("activeLMBSk")) or (_id(p.activeLMBSk, "whirlwind") and not _true(sk.get("whirlwind"))): p["activeLMBSk"] = "kiSlash"
	if _fused_lmb(p): p["activeLMBSk"] = "whirlwind"
	if _true(fused.get("dimHalf")): fused.erase("dimHalf")
	if _true(sk.get("galeSlash")): sk.erase("galeSlash")
	if _id(p.get("activeChargeSk"), "galeSlash"): p["activeChargeSk"] = "charge"
	for pair in [["elemFuse", "sixFuse"], ["slamStorm", "whirlDet"]]:
		if _true(fused.get(pair[0])) and not _true(fused.get(pair[1])): fused[pair[1]] = true
	if _true(fused.get("stormBurst")):
		if not _true(fused.get("stormBeam")): fused["stormBeam"] = true
		_default(sk, "burstLoop")
	if _true(fused.get("stormBeam")):
		for id in ["slamStorm", "whirlDet", "elemFuse", "sixFuse"]:
			if not _true(fused.get(id)): fused[id] = true
		for id in ["whirlwind", "detonate", "giantSlam", "fanShot", "omniBeam", "elemMissile", "peaceShield", "hellRay"]: _default(sk, id)
	if p.has("lv") and _num(p.lv) >= 300: _default(sk, "blueShot")
	if p.has("lv") and _num(p.lv) >= 700: _default(sk, "burstLoop")
	# Source single forward pass, deliberately not transitive closure.
	for row in [["elecRepent", "boneStorm", ["boneWall", "hellRay"]], ["holyIce", "holyFuse", ["iceStorm"]], ["holyWeak1", "holyIce", ["weakPhys"]], ["holyWeak2", "holyWeak1", ["weakMag"]], ["holyWeak3", "holyWeak2", ["weakPj"]], ["holyWeak4", "holyWeak3", ["weakRev"]]]:
		if _true(fused.get(row[0])):
			if not _true(fused.get(row[1])): fused[row[1]] = true
			for id in row[2]: _default(sk, id)
	for id in ["holyFlame", "holyRevive", "holyApex", "weakFuse2", "weakFuse3", "weakFuse4"]: fused.erase(id)
	for pair in [["dimBlast", "dimRush"], ["dimRush", "dimThunder"], ["dimThunder", "dimSlam"], ["dimSlam", "dimBreach"]]:
		if _true(fused.get(pair[0])) and not _true(fused.get(pair[1])): fused[pair[1]] = true
	for key in _graph._js_keys(_tables.pairs):
		if _true(fused.get(key)):
			for id in _tables.pairs[key]: _default(sk, id)
func _active(d: Dictionary, p: Dictionary) -> void:
	if _true(d.get("activeChargeSk")): p["activeChargeSk"] = d.activeChargeSk
	if _id(p.get("activeChargeSk"), "quakeStride"): p["activeChargeSk"] = "charge"
	if not _id(p.get("activeChargeSk"), "charge") and not _learned(p, p.get("activeChargeSk")): p["activeChargeSk"] = "charge"
	if _true(d.get("activeBowSk")): p["activeBowSk"] = d.activeBowSk
	if not _true(p.get("activeBowSk")) or p.activeBowSk in ["maliceMortar", "ghostXbowTurret"]: p["activeBowSk"] = "normal"
	if not _id(p.activeBowSk, "normal") and not _learned(p, p.activeBowSk): p["activeBowSk"] = "normal"
	if _id(p.activeBowSk, "fanShot") and (_true(p._fused.get("sixFuse")) or _true(p._fused.get("elemFuse")) or _true(p._fused.get("stormBeam"))): p["activeBowSk"] = "normal"
	for id in ["spikeTrap", "holyDome", "giantSlam"]: _default(p.skills, id)
	if _true(d.get("activeTechSk")): p["activeTechSk"] = d.activeTechSk
	if not _true(p.get("activeTechSk")) or _id(p.activeTechSk, "spikeTrap"): p["activeTechSk"] = "giantSlam"
	if not _id(p.activeTechSk, "giantSlam") and not _learned(p, p.activeTechSk): p["activeTechSk"] = "giantSlam"
	if _true(d.get("activeMagicSk")): p["activeMagicSk"] = d.activeMagicSk
	if not _true(p.get("activeMagicSk")) or _id(p.activeMagicSk, "fanShot"): p["activeMagicSk"] = "fireball"
	if not _id(p.activeMagicSk, "fireball") and not _learned(p, p.activeMagicSk) and p.activeMagicSk not in _tables.slot_defs.magic: p["activeMagicSk"] = "fireball"
	if _true(d.get("activeLMBSk")): p["activeLMBSk"] = d.activeLMBSk
	if not _true(p.get("activeLMBSk")): p["activeLMBSk"] = "whirlwind"
	if _fused_lmb(p): p["activeLMBSk"] = "whirlwind"
func _absorbed(p: Dictionary) -> Array:
	var ids := []
	for key in _graph._js_keys(_tables.pairs):
		if _true(p._fused.get(key)):
			for id in _tables.absorbed[key]:
				if id not in ids: ids.append(id)
	return ids
func _area(id: Variant) -> bool:
	var sk: Dictionary = _by_id.get(_key(id), {})
	return not sk.is_empty() and sk.cat == "tech" and sk.act and not sk.fixed
func _rage(id: Variant) -> bool:
	return id in ["giantSlam", "giantSlam2"] or _by_id.get(_key(id), {}).get("cat") == "rage"
func _can(id: Variant, index: int) -> bool:
	var sk: Dictionary = _by_id.get(_key(id), {})
	if sk.is_empty() or not sk.act or sk.ult or sk.fixed: return false
	if _area(id): return index == 5
	if _rage(id): return index == 4
	return index >= 0 and index < 4
func _find(id: Variant, slots: Array) -> int:
	if id in slots: return -1
	if _area(id): return 5 if slots[5] == null and _can(id, 5) else -1
	if _rage(id): return 4 if slots[4] == null and _can(id, 4) else -1
	for i in 4:
		if slots[i] == null and _can(id, i): return i
	return -1
func _repair(slots: Array) -> void:
	var displaced := []
	for i in [5, 4]:
		if _true(slots[i]) and not _can(slots[i], i): displaced.append(slots[i]); slots[i] = null
	for i in 4:
		var id: Variant = slots[i]
		if not _true(id) or _can(id, i): continue
		slots[i] = null
		if _area(id) and not _true(slots[5]): slots[5] = id
		elif _rage(id) and not _true(slots[4]): slots[4] = id
	for id in displaced:
		if not _true(id) or id in slots: continue
		if _area(id) and not _true(slots[5]): slots[5] = id; continue
		if _rage(id) and not _true(slots[4]): slots[4] = id; continue
		for i in 4:
			if slots[i] == null and _can(id, i): slots[i] = id; break
func _slots(d: Dictionary, state: Dictionary) -> void:
	var p: Dictionary = state.player; var sk: Dictionary = p.skills; var slots: Array = state.skill_slots
	if d.get("skillSlots") is Array:
		for i in 6: slots[i] = JS._or(d.skillSlots[i] if i < d.skillSlots.size() else null, null)
	if _true(d.get("ultSlot")): state["ult_slot"] = d.ultSlot
	if _true(sk.get("chainStun")) and not _true(sk.get("chainAssault")): sk["chainAssault"] = sk.chainStun; sk.erase("chainStun")
	if _true(p._skProf.get("chainStun")): p._skProf["chainAssault"] = p._skProf.chainStun; p._skProf.erase("chainStun")
	if _learned(p, "chainAssault"): _default(sk, "chainSlam")
	if _learned(p, "chainSlam"): _default(sk, "chainAssault")
	var absorbed := _absorbed(p)
	for i in 6:
		if _true(slots[i]) and (not _learned(p, slots[i]) or slots[i] in absorbed): slots[i] = null
	if _true(state.ult_slot) and not _learned(p, state.ult_slot): state["ult_slot"] = null
	for i in 6:
		if slots[i] in FIXED_KICK: slots[i] = null
	_repair(slots)
	for def in _tables.skills:
		var id: String = def.id
		if def.act and not def.ult and _learned(p, id) and id not in absorbed and id not in FIXED_AUTO and id not in slots:
			var index := _find(id, slots)
			if index >= 0: slots[index] = id
