extends RefCounted
## SV-COLLECT: detached, read-only projection of the five original object literals.
## game.html:3543-3575,63905-63931,64062-64088,62131-62159,61996-62017.
## No owner installation, save call, JSON encoding, IO, migration or Q/E writer.
## Readers are current owner Callables, called once per collection (no await).
## Native Main currently lacks save_globals ownership: HOLD, never a partial save.

const PROFILES := ["cloud", "local", "web", "demo", "demo500"]
const DOMAIN_READERS := ["current_p", "current_g", "current_inventory", "current_stats", "current_passives", "save_globals"]
const PLAYER_DIRECT := "lv exp maxExp sp baseAtk baseDef mpR stR hp mhp mp mmp st mst speed shield mshield maskOn"
const ACTIVE := {"activeChargeSk": "charge", "activeBowSk": "normal", "activeTechSk": "giantSlam", "activeMagicSk": "fireball", "activeLMBSk": "whirlwind", "activeRMBSk": "shieldBlock", "activeQSk": "parry", "activeCtSk": "ghostWalk"}
const GAME_DEFAULTS := {"irisSz": ["_irisSz", 20], "taRecords": ["_taRecords", {}], "clearRecords": ["_clearRecords", {}], "comboMax": ["comboMax", 0], "playTime": ["playTime", 0], "cutsceneDone": ["_cutsceneDone", false]}
const ROOT_ORDER := "player inv stats passives grit gritCostModeV2 qslots game bagMax hellCleared storage crystalBag crystalDust stoneBag upgrades potLv skills fused skProf fuseProfSec cardProf catProf activeChargeSk activeBowSk activeTechSk activeMagicSk activeLMBSk activeRMBSk activeQSk activeCtSk skillSlots ultSlot charIdx"
const PLAYER_ORDER := "lv exp maxExp sp ap passiveQueue transLvDate transLvCount apBossCleared goddessGift _lvStatMigrated baseAtk baseDef mpR stR hp mhp mp mmp st mst speed shield mshield maskOn"

## Optional read-only binding to the existing same Player/World owner bundle.
## No constructors or fallback globals. Callers of collect() may also supply their
## own proven current readers; fixture readiness is not Main integration evidence.
static func current_readers(state: Node, providers: Object, save_globals: Callable = Callable()) -> Dictionary:
	if not is_instance_valid(state) or not is_instance_valid(providers): return {}
	for name in ["is_native_new_run_state_ready", "get_native_new_run_player", "get_native_new_run_world", "read_native_reward_bags"]:
		if not state.has_method(name): return {}
	for name in ["is_native_source_providers_ready", "get_native_source_player", "get_native_source_world", "get_provider_bundle"]:
		if not providers.has_method(name): return {}
	if not state.is_native_new_run_state_ready() or not providers.is_native_source_providers_ready(): return {}
	if state.get_native_new_run_player() != providers.get_native_source_player() or state.get_native_new_run_world() != providers.get_native_source_world(): return {}
	var bundle: Dictionary = providers.get_provider_bundle()
	var readers: Dictionary = {}
	for key in DOMAIN_READERS:
		if bundle.has(key): readers[key] = bundle[key]
	var raw: Variant = bundle.get("raw_grit")
	if is_instance_valid(raw) and raw.has_method("read_raw"): readers.raw_grit = Callable(raw, "read_raw")
	readers.reward_bags = Callable(state, "read_native_reward_bags")
	if save_globals.is_valid(): readers.save_globals = save_globals
	return readers

## save_globals reads QSLOTS/BAG_MAX/UPGRADES/POT_LV/SKILL_SLOTS/ULT_SLOT/_charIdx,
## plus CRYSTAL_DUST outside demo500. It is deliberately not synthesized here.
## raw_grit returns the existing raw holder's {ready,raw}, not derived gritTotal.
## reward_bags returns State.read_native_reward_bags()'s {crystal,stone}.
static func collect(readers: Dictionary, profile: String, timestamp_ms: Variant = null) -> Dictionary:
	if not PROFILES.has(profile):
		return _hold(profile, ["unknown_profile"], [])
	var names: Array = DOMAIN_READERS.duplicate()
	if profile != "demo500":
		names.append_array(["raw_grit", "reward_bags"])
	var domains: Dictionary = {}
	var missing: Array = []
	var read_names: Array = []
	for name in names:
		var reader: Variant = readers.get(name)
		if not reader is Callable or not reader.is_valid() or reader.get_argument_count() != 0:
			missing.append("reader:" + name)
			continue
		var value: Variant = reader.call()
		read_names.append(name)
		if not value is Dictionary:
			missing.append("domain:" + name)
		else:
			domains[name] = value
	# Callable object loss during another synchronous reader is not a valid receipt.
	for name in read_names:
		if not (readers[name] as Callable).is_valid():
			missing.append("owner_lost:" + name)
	if profile != "cloud" and not (timestamp_ms is int or timestamp_ms is float):
		missing.append("timestamp_ms")
	if not missing.is_empty():
		return _hold(profile, missing, read_names)
	var p: Dictionary = domains.current_p
	var g: Dictionary = domains.current_g
	var inv: Dictionary = domains.current_inventory
	var globals: Dictionary = domains.save_globals
	_require(p, Array(PLAYER_DIRECT.split(" ")), "P", missing)
	_require(g, ["stage", "kills"] + (["mats"] if profile in ["demo", "demo500"] else []), "G", missing)
	_require(inv, ["bag", "equipped"], "INV", missing)
	_require(globals, ["QSLOTS", "BAG_MAX", "UPGRADES", "POT_LV", "SKILL_SLOTS", "ULT_SLOT", "_charIdx"], "globals", missing)
	if profile != "demo500":
		_require(globals, ["CRYSTAL_DUST"], "globals", missing)
		var raw: Dictionary = domains.raw_grit
		if raw.get("ready") != true or not raw.has("raw"):
			missing.append("raw_grit:not_ready")
		_require(domains.reward_bags, ["crystal", "stone"], "reward_bags", missing)
	if not missing.is_empty():
		return _hold(profile, missing, read_names)
	var player: Dictionary = {}
	for key in PLAYER_DIRECT.split(" "):
		player[key] = p[key]
	player.ap = _or(p.get("ap"), 0)
	# Exact original helper 51219-51221: PASSIVES own keys, strings only, <=260.
	var queue: Array = []
	if p.get("_passiveQueue") is Array:
		for key in p._passiveQueue:
			if (key is String or key is StringName) and domains.current_passives.has(key):
				queue.append(str(key))
				if queue.size() == 260:
					break
	player.passiveQueue = queue
	if profile != "demo500":
		for pair in [["transLvDate", "_transLvDate", null], ["transLvCount", "_transLvCount", 0], ["apBossCleared", "_apBossCleared", []], ["goddessGift", "_goddessGift", []]]:
			player[pair[0]] = _or(p.get(pair[1]), pair[2])
	if profile == "cloud":
		player._lvStatMigrated = _or(p.get("_lvStatMigrated"), false)
	var game: Dictionary = {"stage": g.stage, "kills": g.kills, "mats": g.mats if profile in ["demo", "demo500"] else 0}
	if profile != "demo500":
		for key in GAME_DEFAULTS:
			var pair: Array = GAME_DEFAULTS[key]
			game[key] = _or(g.get(pair[0]), pair[1])
	else:
		game.cutsceneDone = true
	var payload: Dictionary = {"player": player, "inv": {"bag": inv.bag, "equipped": inv.equipped, "ossCollect": _or(inv.get("ossCollect"), {})}, "stats": domains.current_stats, "passives": domains.current_passives, "qslots": globals.QSLOTS, "game": game, "bagMax": globals.BAG_MAX, "hellCleared": _or(g.get("hellCleared"), []), "storage": {}}
	# Object spreads accept native JSON objects/arrays/scalars. String spread is held
	# (UTF-16 enumerable indices need a separate native representation contract).
	for pair in [["upgrades", globals.UPGRADES], ["potLv", globals.POT_LV], ["skills", p.get("skills")]]:
		var spread: Dictionary = _spread(pair[1])
		if not spread.ready:
			missing.append("unsupported_spread:" + pair[0])
		else:
			payload[pair[0]] = spread.value
	for pair in [["fused", "_fused"], ["skProf", "_skProf"]]:
		payload[pair[0]] = _or(p.get(pair[1]), {})
	if profile != "demo500":
		payload.grit = domains.raw_grit.raw
		payload.gritCostModeV2 = 1
		payload.crystalBag = domains.reward_bags.crystal
		payload.stoneBag = domains.reward_bags.stone
		payload.crystalDust = globals.CRYSTAL_DUST
		for pair in [["fuseProfSec", "_fuseProfSec"], ["cardProf", "_cardProf"], ["catProf", "_catProf"]]:
			payload[pair[0]] = _or(p.get(pair[1]), {})
	for key in ACTIVE:
		if profile == "demo500" and key == "activeTechSk":
			continue
		var fallback: String = ACTIVE[key]
		if profile == "demo500" and key == "activeMagicSk": fallback = "arcLaser"
		if profile == "demo500" and key == "activeQSk": fallback = "peaceShield"
		payload[key] = _or(p.get(key), fallback)
	# Demo literals use [...SKILL_SLOTS]; unlike the three direct-assignment
	# profiles, a non-iterable object/null must never become a READY payload.
	# Native Unicode string iteration is unproven here, so hold it as well.
	if profile in ["demo", "demo500"] and not globals.SKILL_SLOTS is Array:
		missing.append("unsupported_iterable:skillSlots")
	payload.skillSlots = globals.SKILL_SLOTS
	payload.ultSlot = globals.ULT_SLOT
	payload.charIdx = globals._charIdx
	if profile != "cloud": payload.ts = timestamp_ms
	var issue: String = _carrier_issue(payload, [], "payload")
	if not issue.is_empty(): missing.append(issue)
	if not missing.is_empty(): return _hold(profile, missing, read_names)
	payload.player = _source_order(player, PLAYER_ORDER)
	payload = _source_order(payload, ("ts " if profile != "cloud" else "") + ROOT_ORDER)
	return {"status": "READY", "profile": profile, "payload": _detach(payload), "missing": [], "readers_called": read_names, "write_authorized": false, "main_connected": false}

static func _require(value: Dictionary, keys: Array, label: String, missing: Array) -> void:
	for key in keys:
		if not value.has(key): missing.append(label + "." + str(key))

static func _truthy(value: Variant) -> bool:
	if value == null: return false
	if value is bool: return value
	if value is int or value is float: return value != 0 and not is_nan(float(value))
	if value is String or value is StringName: return not str(value).is_empty()
	return true # JS empty arrays/objects are truthy.

static func _or(value: Variant, fallback: Variant) -> Variant:
	return value if _truthy(value) else fallback

static func _spread(value: Variant) -> Dictionary:
	if value is Dictionary: return {"ready": true, "value": value}
	if value is Array:
		var out: Dictionary = {}
		for index in value.size(): out[str(index)] = value[index]
		return {"ready": true, "value": out}
	if value == null or value is bool or value is int or value is float:
		return {"ready": true, "value": {}}
	return {"ready": false}

## HOLD unsupported native carriers/cycles instead of dropping keys or inventing
## JSON rules. Number values (including nonfinite) are preserved; no encoder here.
static func _carrier_issue(value: Variant, ancestors: Array, path: String) -> String:
	if value == null or value is bool or value is int or value is float or value is String or value is StringName:
		return ""
	if not (value is Array or value is Dictionary): return "unsupported_carrier:" + path
	for ancestor in ancestors:
		if is_same(ancestor, value): return "cyclic_carrier:" + path
	var stack: Array = ancestors.duplicate()
	stack.append(value)
	var keys: Array = value.keys() if value is Dictionary else range(value.size())
	for key in keys:
		if value is Dictionary and not (key is String or key is StringName): return "nonstring_key:" + path
		var issue: String = _carrier_issue(value[key], stack, path + "." + str(key))
		if not issue.is_empty(): return issue
	return ""

## Native StringName is a string carrier, including keys created by d.field = ...
## Build detached standard strings/arrays/objects without mutating the owner.
static func _detach(value: Variant) -> Variant:
	if value is Dictionary:
		var out: Dictionary = {}
		for key in value: out[str(key)] = _detach(value[key])
		return out
	if value is Array:
		var out: Array = []
		for entry in value: out.append(_detach(entry))
		return out
	return str(value) if value is StringName else value

static func _source_order(value: Dictionary, order: String) -> Dictionary:
	var out: Dictionary = {}
	for key in order.split(" "):
		if value.has(key): out[key] = value[key]
	# Never hide unexpected fields from contract tests by dropping them.
	for key in value:
		if not out.has(key): out[key] = value[key]
	return out

static func _hold(profile: String, missing: Array, read_names: Array) -> Dictionary:
	return {"status": "HOLD", "profile": profile, "payload": null, "missing": missing, "readers_called": read_names, "write_authorized": false, "main_connected": false}
