extends RefCounted
## Admission/identity only. All prices come from the existing META-03 policy.
const POLICY = preload("res://scripts/native_meta_salvage_policy.gd")
const JS = preload("res://port_modules/save_adapter/source_player_restore.gd")
const MAX_SAFE := 9007199254740991
static func contains_ref(values: Array, item: Dictionary) -> bool:
	for value in values:
		if value is Dictionary and is_same(value,item): return true
	return false
static func value_of(item: Dictionary) -> Dictionary:
	for key in ["enh","tier","_enhRefund"]:
		if item.has(key) and (not (item[key] is int or item[key] is float) or not is_finite(float(item[key]))): return {"ready":false,"reason":"unsupported_numeric"}
	# Operational admission, not a price/level clamp. Never run an unbounded loop.
	if float(item.get("enh",0))>1000000: return {"ready":false,"reason":"legacy_loop_budget"}
	var value := POLICY.salvage_value(item)
	return {"ready":is_finite(value) and absf(value)<=MAX_SAFE,"value":value}
static func eligible(inv: Dictionary, item: Dictionary, junk_only: bool = false) -> bool:
	if JS._truthy(item.get("fav")) or (junk_only and not JS._truthy(item.get("junk"))) or not contains_ref(inv.bag,item) or contains_ref(inv.equipped.values(),item): return false
	var priced := value_of(item)
	return priced.ready and priced.value>=0

static func manual(inv: Dictionary, refs: Array, junk_only: bool = false) -> Dictionary:
	var chosen := []
	var total := 0.0
	for item in refs:
		if item is Dictionary and not contains_ref(chosen,item) and eligible(inv,item,junk_only):
			chosen.append(item); total+=value_of(item).value
	if chosen.is_empty() or not is_finite(total) or total>MAX_SAFE: return {"ready":false,"reason":"no_eligible_items"}
	return {"ready":true,"items":chosen,"total":total}
static func auto_value(item: Dictionary, filters: Dictionary, pickup_failed: bool) -> Dictionary:
	if JS._truthy(item.get("fav")): return {"ready":false,"reason":"locked"}
	for key in ["rarity","reqLv"]:
		if item.has(key) and (not (item[key] is int or item[key] is float) or not is_finite(float(item[key]))): return {"ready":false,"reason":"unsupported_pick_number"}
	var rarity: float=float(item.get("rarity",NAN)) # JS undefined comparisons are false.
	var level: float=float(item.get("reqLv",0))
	var below: bool=rarity<float(filters.min_pick_rar) or level<float(filters.min_pick_lv_thr)
	if not below and (not pickup_failed or rarity>=4): return {"ready":false,"reason":"normal_pickup_or_legendary_full"}
	var result := value_of(item)
	if result.ready: result.value=maxf(1,result.value) # G41450/41458 only, not manual.
	return result
