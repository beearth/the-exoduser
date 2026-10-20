extends RefCounted
## DEMO11-24. G15131-15174 roll eligibility; G27902-27966/G16425 applyStats.
## Observe the accepted transaction's SINGLE PC refresh. No second apply, formula,
## damage dispatch, INV owner, clocks, RNG or actor/resource writes. Cache token restored.
const ROUTES = "res://data/demo11_equipment_effect_routes.json"
static var _routes: Dictionary = {}
static func routes() -> Dictionary:
	if _routes.is_empty():
		var packet: Variant=JSON.parse_string(FileAccess.get_file_as_string(ROUTES))
		if packet is Dictionary:
			for row in packet.get("rows",[]): _routes[str(row.id)]=row
	return _routes
static func observe(main: Node, inventory: Dictionary, refresh: Dictionary) -> Dictionary:
	var out: Dictionary={"status":"NOT_READY","ids":{},"source":"game.html:15131-15174;27902-27966;16425-16432","extra_refresh_calls":0}
	if not is_instance_valid(main) or refresh.get("committed")!=true or refresh.get("mode")!="equipment_refresh":
		out.reason="accepted_equipment_refresh_required"; return out
	if not is_same(inventory,main.source_state.read_current_inventory()):
		out.reason="foreign_inventory"; return out
	var bundle: Dictionary=main.source_providers.get_provider_bundle()
	var reader: Variant=bundle.get("affix")
	if not is_instance_valid(reader): out.reason="affix_owner_missing"; return out
	var cache: Dictionary=reader.capture_affix_cache_token()
	for slot in preload("res://port_modules/equipment_affix_reader/producer.gd").SLOT_NAMES:
		var item: Variant=inventory.get("equipped",{}).get(slot)
		if not item is Dictionary or not item.get("affixes") is Array: continue
		for affix in item.affixes:
			if not affix is Dictionary: continue
			var id: String=str(affix.get("id",""))
			if out.ids.has(id): continue
			var route: Dictionary=routes().get(id,{})
			var sum: Dictionary=reader.eq_affix(id)
			var system: bool=is_instance_valid(main.get("source_system_affixes")) and id in main.source_system_affixes.IDS
			var ready: bool=(route.get("route")=="equipment_refresh" or system) and sum.get("status")=="READY"
			out.ids[id]={"status":"READY" if ready else "NOT_READY","consumer":"game_system_cached" if system else route.get("route","not_demo_roll_candidate"),"scope":"system_component_only" if system else "applyStats_or_protected",
				"value":sum.get("value"),"source_line":route.get("source_line"),
				"reason":"" if ready else "PC_hurtE_protected" if route.get("route")=="hurtE" else "consumer_not_verified"}
	reader.restore_affix_cache_token(cache)
	out.ready_ids=[];out.not_ready_ids=[]
	for id in out.ids:
		if out.ids[id].status=="READY":out.ready_ids.append(id)
		else:out.not_ready_ids.append(id)
	out.status="READY" if out.not_ready_ids.is_empty() else "PARTIAL"
	out.refresh_serial=refresh.get("pass_serial")
	out.before=refresh.get("before",{}).duplicate(true)
	out.after=refresh.get("after",{}).duplicate(true)
	return out
