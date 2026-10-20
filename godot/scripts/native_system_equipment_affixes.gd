extends RefCounted
## DEMO11-24b: value cache, not a second INV/formula/regen/cooldown owner.
## Rebuilt only at boot or accepted runtime refresh. Tick readers never rebuild.
const IDS=["lckFlatR","mpCostRed","dropRate","stCostRed","skillCdRed","potionPower","potionCdRed","lckFlatN","expBonus","lifeHealPow","skillBoost","cooldownRed","helmCooldown","endCooldownAll"]
var _main: WeakRef
var _values: Dictionary={}
var _ready:=false
var rebuilds:=0
var source_queries:=0
var cached_reads:=0
var served: Dictionary={}
func rebuild(main: Node) -> Dictionary:
	if not is_instance_valid(main) or main.get_script()==null or main.get_script().resource_path!="res://scripts/main.gd" or main.get("source_system_affixes")!=self:return {"status":"NOT_READY","reason":"foreign_owner"}
	if not is_instance_valid(main.source_state) or not is_instance_valid(main.source_providers):return {"status":"NOT_READY","reason":"owner_not_live"}
	if _main!=null and _main.get_ref()!=main:return {"status":"NOT_READY","reason":"foreign_main"}
	_main=weakref(main)
	var bundle: Dictionary=main.source_providers.get_provider_bundle()
	var reader: Variant=bundle.get("affix")
	if not is_instance_valid(reader):return {"status":"NOT_READY","reason":"reader_missing"}
	var token: Dictionary=reader.capture_affix_cache_token()
	var staged: Dictionary={}
	for id in IDS:
		staged[id]=reader.eq_affix(id);source_queries+=1
	reader.restore_affix_cache_token(token)
	for id in IDS:
		if staged[id].get("status")!="READY":_ready=false;return {"status":"NOT_READY","reason":"source_affix_unready:"+id}
	_values=staged;_ready=true;rebuilds+=1
	return {"status":"READY","ids":IDS.duplicate(),"rebuilds":rebuilds}
func eq_affix(id: Variant) -> Dictionary:
	cached_reads+=1
	served[id]=int(served.get(id,0))+1
	if not _ready or _main==null or not is_instance_valid(_main.get_ref()):return {"status":"NOT_READY","reason":"equipment_cache_not_warmed"}
	if not _values.has(id):return {"status":"NOT_READY","reason":"system_id_not_admitted"}
	return _values[id].duplicate()
func get_snapshot() -> Dictionary:
	return {"ready":_ready,"rebuilds":rebuilds,"source_queries":source_queries,"cached_reads":cached_reads,"served":served.duplicate(),"ids":IDS.duplicate()}
