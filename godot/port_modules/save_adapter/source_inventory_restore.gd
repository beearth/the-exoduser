extends RefCounted
## Readonly restoration calculation: game.html 3628-3683, 3735, 3753-3769.
## No live INV/storage binding, IO, effects, item generation or migration policy.
const JS = preload("res://port_modules/save_adapter/source_player_restore.gd")
const LEGACY_IDS := {
	"cr_atk": "cr_blood_oath", "cr_crit": "cr_hunter_eye", "cr_cdmg": "cr_ruin_heart", "cr_fire": "cr_cinder_crown",
	"cr_ice": "cr_frost_fang", "cr_dark": "cr_night_seed", "cr_light": "cr_storm_nerve", "cr_holy": "cr_dawn_relic",
	"cr_hp": "cr_martyr_tear", "cr_def": "cr_iron_vow", "cr_eDef": "cr_ward_stone", "cr_spd": "cr_ash_wing",
	"cr_hpReg": "cr_living_root", "cr_drop": "cr_grave_lantern", "cr_st": "cr_last_breath", "cr_mp": "cr_deep_well",
	"cr_stReg": "cr_pulse_reed", "cr_mpReg": "cr_oracle_pupil"}
const REPAIR_NAMES := {"bracelet": ["낡은 팔찌", "은 팔찌", "흑요석 팔찌", "미스릴 팔찌", "천벌의 팔찌"],
	"headband": ["낡은 귀걸이", "은사 귀걸이", "흑요석 귀걸이", "미스릴 귀걸이", "천벌의 귀걸이"]}
const POTION_KEYS := ["hp"] # Source POT declaration, game.html 27677-27679.
const PROTOTYPE_KEYS := ["__proto__", "constructor", "toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__"]
var _error := ""
var _tables: Dictionary = {}

func calculate(serialized: Variant, current: Dictionary, source_tables: Dictionary) -> Dictionary:
	_error = ""
	_tables = source_tables
	if not JS._truthy(serialized): return _receipt("REJECTED", "source_falsy_payload")
	if not serialized is Dictionary: return _receipt("HOLD", "payload_not_object")
	if not JS._truthy(serialized.get("player")): return _receipt("REJECTED", "source_no_player")
	if not serialized.player is Dictionary: return _receipt("HOLD", "player_carrier_unproven")
	for key in ["inventory", "storage_before", "storage_after", "upgrades", "pot_levels"]:
		if not current.has(key): return _receipt("HOLD", "current_snapshot_absent:" + key)
	if not current.inventory is Dictionary or not current.inventory.get("bag") is Array or not current.inventory.get("equipped") is Dictionary:
		return _receipt("HOLD", "current_inventory_shape")
	if current.storage_before != null and not current.storage_before is Dictionary: return _receipt("HOLD", "pre_rebind_storage_shape")
	if not current.storage_after is Dictionary: return _receipt("HOLD", "authoritative_post_rebind_storage_absent")
	if not current.pot_levels is Dictionary: return _receipt("HOLD", "current_pot_levels_shape")
	for key in ["SLOT_NAMES", "SLOT_EMOJI", "RARITY_MUL"]:
		if not _tables.get(key) is Array: return _receipt("HOLD", "source_table_absent:" + key)
	for key in ["WTYPES", "BOWTYPES", "_WP_MOD"]:
		if not _tables.get(key) is Dictionary: return _receipt("HOLD", "source_table_absent:" + key)
	if _tables.SLOT_NAMES.size() != 17 or _tables.SLOT_EMOJI.size() != 17 or not _tables._WP_MOD.get("0") is Array:
		return _receipt("HOLD", "source_table_shape")
	if not _graph_supported({"payload": serialized, "current": current, "tables": _tables}, []):
		return _receipt("HOLD", "non_json_or_cyclic_graph")
	var graph: Dictionary = _clone({"payload": serialized, "current": current}, [], [])
	var d: Dictionary = graph.payload
	var inv: Dictionary = graph.current.inventory
	var before: Variant = graph.current.storage_before
	var after: Dictionary = graph.current.storage_after
	if JS._truthy(d.get("inv")):
		if not d.inv is Dictionary: return _receipt("HOLD", "saved_inventory_not_object")
		inv["bag"] = JS._or(d.inv.get("bag"), [])
		var empty_equipped := {}
		for slot in _tables.SLOT_NAMES: empty_equipped[slot] = null
		inv["equipped"] = JS._or(d.inv.get("equipped"), empty_equipped)
		if not inv.bag is Array or not inv.equipped is Dictionary: return _receipt("HOLD", "saved_bag_or_equipped_shape")
		for slot in ["belt", "bracelet", "ossuary"]:
			if not inv.equipped.has(slot): inv.equipped[slot] = null
		var oss: Variant = d.inv.get("ossCollect")
		inv["ossCollect"] = oss if JS._truthy(oss) and (oss is Dictionary or oss is Array) else {}
		_each(inv.bag, _fix_br); _fix_br(inv.equipped.get("bracelet"))
		if before is Dictionary and JS._truthy(before.get("items")):
			if not before.items is Array: return _receipt("HOLD", "pre_rebind_items_not_array")
			_each(before.items, _fix_br)
		for slot in ["headband", "headband2"]:
			if not inv.equipped.has(slot): inv.equipped[slot] = null
		_each(inv.bag, _fix_repair); _fix_repair(inv.equipped.get("bracelet")); _fix_repair(inv.equipped.get("headband"))
		for fix in [_fix_shield, _fix_bow, _fix_affixes, _fix_speed, _fix_name]:
			_each(inv.bag, fix)
			for slot in _tables.SLOT_NAMES:
				if _error.is_empty(): fix.call(inv.equipped.get(slot))
	inv["selected"] = null
	var raw_bag_max: Variant = d.get("bagMax")
	var bag_max: Variant = 300 if is_nan(_number(raw_bag_max)) else JS._or(raw_bag_max, 300)
	# Shared-storage load/migration/clamp is deliberately outside this calculator.
	# Caller supplies the authoritative post-rebind snapshot; never d.storage.
	var crystals: Variant = JS._or(d.get("crystalBag"), [])
	if not crystals is Array: return _receipt("HOLD", "crystal_bag_not_array")
	var dust: Variant = JS._or(d.get("crystalDust"), 0)
	var stones: Array = []
	if d.get("stoneBag") is Array:
		for stone in d.stoneBag:
			if stone is Dictionary and JS._numeric(stone.get("q")) and stone.q >= 1 and stone.q <= 100: stones.append(stone)
	_each(crystals, _migrate_cr)
	_each(inv.bag, _fix_cr)
	for slot in _tables.SLOT_NAMES:
		if _error.is_empty(): _fix_cr(inv.equipped.get(slot))
	for key in _js_keys(after):
		if after[key] is Array: _each(after[key], _fix_cr)
	var upgrades: Variant = JS._or(d.get("upgrades"), graph.current.upgrades)
	var pot_levels: Dictionary = graph.current.pot_levels
	if JS._truthy(d.get("potLv")):
		if not d.potLv is Dictionary: return _receipt("HOLD", "pot_levels_enumeration_unproven")
		for key in _js_keys(d.potLv):
			if key in PROTOTYPE_KEYS: return _receipt("HOLD", "inherited_potion_key_unproven")
			if key in POTION_KEYS: pot_levels[key] = d.potLv[key]
	if not _error.is_empty(): return _receipt("HOLD", _error)
	var result := _receipt("READY", "detached_item_calculation")
	result["plan"] = {"inventory": inv, "storage_before": before, "storage_after": after, "bag_max": bag_max,
		"crystal_bag": crystals, "crystal_dust": dust, "stone_bag": stones, "upgrades": upgrades, "pot_levels": pot_levels}
	return result

func _receipt(status: String, reason: String) -> Dictionary:
	return {"status": status, "reason": reason, "calculation_only": true, "write_authorized": false, "restore_connected": false,
		"storage_io": false, "network": false, "full_restore_verified": false,
		"pending": ["shared-store authority/rebind and legacy storage transfer", "live inventory/bag owner handoff", "remaining dbRestore tail"]}
func _item(value: Variant) -> bool:
	if not _error.is_empty() or not JS._truthy(value): return false
	if not value is Dictionary: _error = "truthy_item_not_object"; return false
	return true
func _each(list: Array, fix: Callable) -> void:
	# JS forEach snapshots length and skips positions removed by an earlier call.
	for i in list.size():
		if not _error.is_empty(): return
		if i < list.size(): fix.call(list[i])
func _string_is(value: Variant, expected: String) -> bool:
	return value is String and value == expected
func _number(value: Variant) -> float:
	if not JS._coercible(value): _error = "numeric_coercion_unproven"; return NAN
	return JS._number(value)
func _key(value: Variant) -> String:
	if not JS._coercible(value): _error = "property_key_coercion_unproven"; return ""
	var primitive: Variant = JS._primitive(value)
	if JS._numeric(primitive) and (not is_finite(float(primitive)) or absf(float(primitive)) > 9007199254740991.0 or float(primitive) != floor(float(primitive))):
		_error = "property_number_format_unproven"; return ""
	return JS._string(primitive)
func _lookup(table: Variant, value: Variant) -> Variant:
	var key := _key(value)
	if key in PROTOTYPE_KEYS: _error = "inherited_property_unproven"; return null
	if table is Dictionary: return table.get(key)
	if table is Array:
		if key == "length": return table.size()
		if key.is_valid_int() and str(key.to_int()) == key and key.to_int() >= 0 and key.to_int() < table.size(): return table[key.to_int()]
	return null
func _fix_br(it: Variant) -> void:
	if _item(it) and _string_is(it.get("slot"), "bracelet") and not JS._truthy(it.get("brType")): it["brType"] = "demon"
func _fix_repair(it: Variant) -> void:
	if not _item(it) or not _string_is(it.get("name"), "???"): return
	var slot_names: Variant = _lookup(REPAIR_NAMES, it.get("slot"))
	if not slot_names is Array: return
	if not it.slot is String: _error = "repair_slot_coercion_unproven"; return
	var tier: Variant = JS._or(it.get("tier"), 0)
	var index: float = minf(_number(tier), 4)
	if not is_finite(index) or index < 0 or index != floor(index): _error = "undefined_repair_name_unproven"; return
	var slot: String = it.slot
	var names: Variant = JS._or(_lookup({"0": slot_names}, JS._or(it.get("el"), 0)), slot_names)
	it["name"] = names[int(index)]
	var slot_index: int = _tables.SLOT_NAMES.find(slot)
	if slot_index < 0: _error = "source_slot_table_incomplete"; return
	it["emoji"] = _tables.SLOT_EMOJI[slot_index]
	if not JS._truthy(it.get("def")) and slot == "bracelet":
		it["def"] = JS._add(1, tier); it["eDef"] = JS._add(1, tier); it["bonusHp"] = 5 + _number(tier) * 5
	if not JS._truthy(it.get("eDef")) and slot == "headband":
		it["eDef"] = 2 + _number(tier) * 2; it["mpRegen"] = JS._add(1, tier)
func _fix_shield(it: Variant) -> void:
	if not _item(it) or not _string_is(it.get("slot"), "shield") or not JS._truthy(it.get("name")): return
	if not it.name is String: _error = "source_shield_name_would_throw"; return
	it["name"] = it.name.replace("방패", "견갑")
func _fix_bow(it: Variant) -> void:
	if _item(it) and JS._truthy(it.get("btype")) and not JS._truthy(_lookup(_tables.BOWTYPES, it.btype)):
		it["btype"] = "crossbow"; it["name"] = "석궁"; it["emoji"] = "⚙️"
func _fix_affixes(it: Variant) -> void:
	if not _item(it): return
	if not JS._truthy(it.get("affixes")): it["affixes"] = []
	if not it.affixes is Array: _error = "affixes_non_array_unproven"; return
	var prefix: Variant = it.get("prefix")
	if prefix is Dictionary and JS._truthy(prefix.get("name")) and it.affixes.is_empty():
		it.affixes.append({"id": "legacy", "tier": 0, "value": JS._or(prefix.get("val"), 0)})
	var suffix: Variant = it.get("suffix")
	if suffix is Dictionary and JS._truthy(suffix.get("name")):
		for affix in it.affixes:
			if affix == null: _error = "source_suffix_find_would_throw"; return
			if affix is Dictionary and _string_is(affix.get("id"), "legacySuf"): return
		it.affixes.append({"id": "legacySuf", "tier": 0, "value": JS._or(suffix.get("val"), 0)})
func _fix_speed(it: Variant) -> void:
	if not _item(it) or not _string_is(it.get("slot"), "weapon") or not JS._truthy(it.get("wtype")): return
	if _number(JS._or(it.get("_spdMig"), 0)) < 3:
		var rm: Variant = JS._or(_lookup(_tables.RARITY_MUL, JS._or(it.get("rarity"), 0)), 1)
		it["spd"] = floor(0.45 * _number(rm) * 100 + 0.5) / 100.0
		it["_spdMig"] = 3
func _fix_name(it: Variant) -> void:
	if not _item(it) or not _string_is(it.get("slot"), "weapon") or not JS._truthy(it.get("wtype")): return
	var weapon: Variant = _lookup(_tables.WTYPES, it.wtype)
	if not JS._truthy(weapon) or JS._truthy(it.get("uniqueArt")): return
	if _number(JS._or(it.get("_nameMig"), 0)) < 1:
		var mods: Variant = JS._or(_lookup(_tables._WP_MOD, JS._or(it.get("el"), 0)), _tables._WP_MOD["0"])
		var index: float = minf(_number(JS._or(it.get("tier"), 0)), 4)
		# Noninteger/negative property lookup falls back to the first modifier.
		var modifier: Variant = _lookup(mods, index) if is_finite(index) and index == floor(index) else null
		it["name"] = str(JS._or(modifier, mods[0])) + " " + str(weapon.name)
		it["_nameMig"] = 1
func _migrate_cr(cr: Variant) -> void:
	if not _item(cr): return
	var legacy: Variant = _lookup(LEGACY_IDS, cr.get("id"))
	if JS._truthy(legacy): cr["id"] = legacy
	var q: float = _number(cr.get("q"))
	if not (q >= 1 and q <= 100): cr["q"] = 50
func _fix_cr(it: Variant) -> void:
	if not _item(it): return
	if not it.has("socketCount"): it["socketCount"] = 0; it["crystals"] = []
	if it.get("crystals") is Array: _each(it.crystals, _migrate_cr)
	var n: int = it.crystals.size() if it.get("crystals") is Array else 0
	if not it.get("socketQ") is Array: it["socketQ"] = []
	for i in n:
		var q: float = _number(it.socketQ[i] if i < it.socketQ.size() else null)
		if not (q >= 1 and q <= 100):
			if i == it.socketQ.size(): it.socketQ.append(1)
			else: it.socketQ[i] = 1
	if it.socketQ.size() > n: it.socketQ.resize(n)
func _graph_supported(value: Variant, parents: Array) -> bool:
	if parents.size() > 64: return false
	if value is Array or value is Dictionary:
		for parent in parents:
			if is_same(parent, value): return false
		var next: Array = parents.duplicate(); next.append(value)
		if value is Dictionary:
			for key in value:
				if not key is String or not _graph_supported(value[key], next): return false
		else:
			for item in value:
				if not _graph_supported(item, next): return false
		return true
	return value == null or value is String or value is bool or JS._numeric(value)
func _clone(value: Variant, originals: Array, copies: Array) -> Variant:
	if not value is Array and not value is Dictionary: return value
	for i in originals.size():
		if is_same(originals[i], value): return copies[i]
	var copy: Variant = [] if value is Array else {}
	originals.append(value); copies.append(copy)
	if value is Array:
		for item in value: copy.append(_clone(item, originals, copies))
	else:
		for key in value: copy[key] = _clone(value[key], originals, copies)
	return copy
func _js_keys(value: Dictionary) -> Array:
	var integers: Array = []; var rest: Array = []
	for key in value:
		if key.is_valid_int() and str(key.to_int()) == key and key.to_int() >= 0 and key.to_int() < 4294967295: integers.append(key.to_int())
		else: rest.append(key)
	integers.sort()
	var result: Array = []
	for key in integers: result.append(str(key))
	result.append_array(rest)
	return result
