extends RefCounted
## DEMO11-06b. Native IO + accepted SV calculations + stopped-scene commit.
const Store = preload("res://port_modules/save_adapter/demo_local_storage.gd")
const SharedStore = preload("res://port_modules/save_adapter/demo_shared_local_storage.gd")
const Shared = preload("res://port_modules/save_adapter/source_shared_store.gd")
const Collector = preload("res://port_modules/save_adapter/source_save_collector.gd")
const PlayerRestore = preload("res://port_modules/save_adapter/source_player_restore.gd")
const InventoryRestore = preload("res://port_modules/save_adapter/source_inventory_restore.gd")
const Flow = preload("res://port_modules/save_adapter/demo_restore_flow.gd")
const Items = preload("res://port_modules/item_armor_element/source_item_catalog.gd")
const Skills = preload("res://port_modules/skill_management_source/catalog.gd")
const Fusion = preload("res://port_modules/skill_management_source/fusion_rules.gd")
var store := Store.new()
var shared := SharedStore.new()
var saved: Dictionary = {}
var mode := "UNOPENED"
var last: Dictionary = {}
var _serial := 0
var _busy := false
var _committed := false
var _start_authorized := false
var _owner: WeakRef

func _fail(reason: String) -> Dictionary:
	last={"status":"HOLD","reason":reason,"start_authorized":false}
	return last.duplicate(true)

func open_boot() -> Dictionary:
	if mode != "UNOPENED": return _fail("boot_already_selected")
	if not store.open_store().ready or not shared.open_store().ready: return _fail("namespace_or_store_unavailable")
	var row := store.read_json("hellsave_demo")
	if not row.ready: return _fail("save_read_failed:"+str(row.get("reason")))
	if not row.found:
		mode="FRESH"
	else:
		if not row.value is Dictionary: return _fail("save_not_object")
		saved=row.value.duplicate(true)
		if not saved.has("player"):
			# Only the source's newly created metadata-only character is fresh.
			if not saved.has("charIdx") or saved.keys().any(func(k): return k not in ["charIdx","ts"]): return _fail("not_character_metadata")
			mode="FRESH"
		elif not saved.player is Dictionary: return _fail("invalid_player_not_fresh")
		else: mode="LOADED"
	if saved.has("charIdx") and saved.charIdx != 0: return _fail("character_atlas_not_adopted")
	_start_authorized=mode=="FRESH"
	last={"status":mode,"start_authorized":_start_authorized}
	return last.duplicate(true)

static func item_tables() -> Dictionary:
	return {"SLOT_NAMES":Items.SLOT_NAMES,"SLOT_EMOJI":Items.SLOT_EMOJI,"RARITY_MUL":Items.RARITY_MUL,"WTYPES":Items.WTYPES,"BOWTYPES":Items.BOWTYPES,"_WP_MOD":Items.WP_MOD}

static func skill_tables() -> Dictionary:
	var skills := []
	for s in Skills.SKILLS: skills.append({"id":s.id,"cat":s.cat,"act":s.get("act",false),"ult":s.get("ult",false),"fixed":s.get("fixed",false)})
	var slots := {}
	for k in Skills.SLOT_DEFINITIONS: slots[k]=Skills.SLOT_DEFINITIONS[k].skills
	var groups := {}
	for k in Skills.GEM_METADATA: groups[k]=Skills.read_gem_group(k).value.skills
	var absorbed := {}
	for k in Skills.FUSION.FUSE_PAIRS: absorbed[k]=Fusion.get_absorbed(k).value
	return {"skills":skills,"pairs":Skills.FUSION.FUSE_PAIRS,"groups":groups,"slot_defs":slots,"absorbed":absorbed,"prof_cap":Fusion.PROFICIENCY_CAP}

func _read_shared() -> Dictionary:
	var s := shared.get_item(Shared.STORAGE_KEY)
	var m := shared.get_item(Shared.MATS_KEY)
	if not s.ready or not m.ready: return {"status":"HOLD","reason":"shared_read_error"}
	# Native failures/corruption never become an empty successful fresh store.
	if s.found and not shared._validate_raw(Shared.STORAGE_KEY,s.raw).ready: return {"status":"HOLD","reason":"shared_storage_corrupt"}
	if m.found and not shared._validate_raw(Shared.MATS_KEY,m.raw).ready: return {"status":"HOLD","reason":"shared_mats_corrupt"}
	return {"status":"READY","storage_raw":s.get("raw"),"mats_raw":m.get("raw")}

func _write(io: RefCounted, key: String, raw: String) -> Dictionary:
	_serial+=1
	var id := "session-"+str(_serial)
	var response: Dictionary=io.begin_set(id,key,raw)
	if response.get("status")=="PENDING": response=io.run_request(id)
	io.release_receipt(id)
	return response

func plan_shared(d: Dictionary, current_mats: Variant) -> Dictionary:
	var reads := _read_shared()
	if reads.status!="READY": return reads
	var policy := Shared.new()
	policy.native_number_decoder=preload("res://port_modules/save_adapter/native_json_number.gd").decode
	var mats := policy.read_mats("browser_origin",{"state":"value","value":reads.mats_raw})
	var storage := policy.read_storage("browser_origin",{"state":"value","value":reads.storage_raw})
	if mats.status!="READY" or storage.status!="READY": return {"status":"HOLD","reason":"shared_policy_error"}
	var predicted_mats: float = float(mats.value)
	if d.get("game") is Dictionary:
		var n := policy._coerced_number(d.game.get("mats"))
		if n.status!="READY": return n
		predicted_mats=minf(Shared.MAX_SAFE,maxf(predicted_mats,maxf(0,floor(float(PlayerRestore._or(n.value,0))))))
	var legacy: Variant=null
	if d.get("storage") is Dictionary: legacy=d.storage.get("0")
	elif d.get("storage") is Array and not d.storage.is_empty(): legacy=d.storage[0]
	var predicted_store: Array=storage.value.duplicate(true)
	if legacy is Array and not legacy.is_empty() and predicted_store.is_empty(): predicted_store=legacy.slice(0,Shared.STORAGE_MAX)
	var observations := {"mode":"browser_origin","mats_reads":[{"state":"value","value":reads.mats_raw},{"state":"value","value":str(int(predicted_mats))}],"storage_reads":[{"state":"value","value":reads.storage_raw},{"state":"value","value":JSON.stringify(predicted_store,"",false,true)}]}
	# No legacy branch consumes its first observation: supply the post-rebind
	# read there. A truthy nonempty legacy array consumes both.
	if not (legacy is Array and not legacy.is_empty()): observations.storage_reads.pop_front()
	return policy.plan_restore(d,{"mats":current_mats},observations)

func _persist_shared(plan: Dictionary) -> Dictionary:
	for intent in plan.intents:
		var key: String=Shared.MATS_KEY if intent.kind=="mats" else Shared.STORAGE_KEY
		var value: Variant=intent.normalized if intent.kind=="mats" else intent.value
		var raw := str(int(value)) if intent.kind=="mats" else JSON.stringify(value,"",false,true)
		var receipt := _write(shared,key,raw)
		if receipt.get("committed")!=true: return _fail("shared_commit_failed:"+str(receipt.get("reason")))
	var readback := _read_shared()
	if readback.status!="READY": return _fail("shared_readback_failed")
	var policy := Shared.new()
	policy.native_number_decoder=preload("res://port_modules/save_adapter/native_json_number.gd").decode
	var actual := policy.read_mats("browser_origin",{"state":"value","value":readback.mats_raw})
	var items := policy.read_storage("browser_origin",{"state":"value","value":readback.storage_raw})
	if actual.status!="READY" or items.status!="READY" or actual.value!=plan.plan.mats or items.value!=plan.plan.storage["0"]: return _fail("shared_readback_mismatch")
	return {"status":"READY"}

func restore_stopped(owner: Node, handoffs: Dictionary = {}) -> Dictionary:
	if _busy or _committed or mode!="LOADED": return _fail("restore_not_admitted")
	_busy=true
	var result := _restore(owner,handoffs)
	_busy=false
	last=result.duplicate(true)
	return last.duplicate(true)

func _restore(owner: Node, handoffs: Dictionary) -> Dictionary:
	var state: Node=owner.get("source_state")
	if not is_instance_valid(state) or not state.is_native_new_run_state_ready(): return _fail("state_not_ready")
	var globals: Variant=state.read_native_demo11_save_globals()
	if not globals is Dictionary: return _fail("save_globals_absent")
	var player := PlayerRestore.calculate(saved,{"player":state.read_current_p(),"stats":state.read_current_stats(),"passives":state.read_current_passives()})
	if player.status!="READY": return _fail("player:"+str(player.reason))
	var d := saved.duplicate(true)
	d.skills=player.plan.skills
	if not d.get("game") is Dictionary or d.game.get("stage",0)!=0: return _fail("demo_stage_invalid")
	var shared_plan := plan_shared(d,state.read_current_g().mats)
	if shared_plan.status!="READY": return _fail("shared:"+str(shared_plan.get("reason")))
	var inv := InventoryRestore.new().calculate(d,{"inventory":state.read_current_inventory(),"storage_before":state.read_native_demo11_storage(),"storage_after":shared_plan.plan.storage,"upgrades":globals.UPGRADES,"pot_levels":globals.POT_LV},item_tables())
	if inv.status!="READY": return _fail("inventory:"+str(inv.reason))
	var game: Dictionary=state.read_current_g().duplicate(true)
	game.stage=0; game.kills=PlayerRestore._or(d.game.get("kills"),0); game.mats=shared_plan.plan.mats; game.on=false
	for field in Collector.GAME_DEFAULTS:
		var pair: Array=Collector.GAME_DEFAULTS[field]
		game[pair[0]]=PlayerRestore._or(d.game.get(field),pair[1])
	game.hellCleared=PlayerRestore._or(d.get("hellCleared"),[])
	var flow := Flow.new().prepare(d,{"player":player.plan.player,"game":game,"skill_slots":[null,null,null,null,null,null],"ult_slot":null},skill_tables(),handoffs)
	if flow.status not in ["READY","PC_INTERFACE_WAIT"]: return _fail("skills:"+str(flow.get("reason")))
	flow.state.player.skillSlots=flow.state.skill_slots
	flow.state.player.ultSlot=flow.state.ult_slot
	flow.state.player.maskOn=d.player.get("maskOn",true)
	globals.BAG_MAX=inv.plan.bag_max; globals.UPGRADES=inv.plan.upgrades; globals.POT_LV=inv.plan.pot_levels; globals.CRYSTAL_DUST=inv.plan.crystal_dust
	if d.has("qslots"):
		var qs: Array=d.qslots if d.qslots is Array else []
		globals.QSLOTS=[]
		for i in maxi(4,qs.size()):
			var q: Variant=qs[i] if i<qs.size() else null
			globals.QSLOTS.append(q.duplicate(true) if q is Dictionary and (not PlayerRestore._truthy(q.get("type")) or q.type=="hp") else {"type":null,"count":0})
	var plan := {"player":flow.state.player,"game":flow.state.game,"stats":player.plan.stats,"passives":player.plan.passives,"inventory":inv.plan.inventory,"globals":globals,"storage":inv.plan.storage_after,"crystal_bag":inv.plan.crystal_bag,"stone_bag":inv.plan.stone_bag,"raw_grit":player.plan.raw_grit}
	# Validate the entire stopped-scene plan before any shared IO or live write.
	var validation: Dictionary=state.validate_native_demo11_loaded(owner,plan)
	if not validation.accepted: return _fail("precommit:"+str(validation.reason))
	var persisted := _persist_shared(shared_plan)
	if persisted.status!="READY": return persisted
	var commit: Dictionary=state.commit_native_demo11_loaded_once(owner,plan)
	if not commit.accepted: return _fail("commit:"+str(commit.reason))
	_committed=true
	_start_authorized=false # Main must finish applyStats/initStage/start first.
	return {"status":flow.status,"pending":flow.pending,"protected_trace":flow.protected_trace,"protected_ready":flow.start_authorized,"start_authorized":false,"committed":true,"resources":commit.resources,"readback":commit.readback,"protected_saved_fields":{"activeRMBSk":saved.get("activeRMBSk"),"activeQSk":saved.get("activeQSk")}}

func prepare_current_save(owner: Node) -> Dictionary:
	if _busy or not _start_authorized or mode not in ["FRESH","LOADED"]: return _fail("save_not_admitted")
	var state: Node=owner.get("source_state")
	var readers := Collector.current_readers(state,owner.get("source_providers"),Callable(state,"read_native_demo11_save_globals"))
	var collection := Collector.collect(readers,"demo",int(Time.get_unix_time_from_system()*1000.0))
	if collection.status!="READY": return _fail("collector_hold:"+str(collection.missing))
	var stash: Dictionary=state.read_native_demo11_storage()
	if not stash.get("0") is Array: return _fail("shared_current_absent")
	var mats: Variant=collection.payload.game.mats
	var s := _write(shared,Shared.STORAGE_KEY,JSON.stringify(stash["0"],"",false,true))
	if s.get("committed")!=true: return _fail("shared_save_failed")
	if not (mats is int or mats is float) or not is_finite(float(mats)): return _fail("shared_mats_invalid")
	s=_write(shared,Shared.MATS_KEY,str(int(maxf(0,minf(floor(float(mats)),Shared.MAX_SAFE)))))
	if s.get("committed")!=true: return _fail("shared_mats_save_failed")
	# Explicit native JSON encoding; no wrapper/encryption/schema replacement.
	var raw := JSON.stringify(collection.payload,"",false,true)
	return {"ready":true,"context":{"raw_json":raw}}

func initialize_fresh_shared(owner: Node) -> Dictionary:
	if mode!="FRESH": return _fail("not_fresh")
	var state: Node=owner.get("source_state")
	var plan := plan_shared({"player":{},"game":{"mats":0},"storage":{}},0)
	if plan.status!="READY": return _fail("fresh_shared_read_failed")
	var persisted := _persist_shared(plan)
	if persisted.status!="READY": return persisted
	return state.install_native_demo11_fresh_shared(owner,plan.plan)

func save_current(owner: Node) -> Dictionary:
	var prepared := prepare_current_save(owner)
	if prepared.get("ready")!=true: return prepared
	return _write(store,"hellsave_demo",prepared.context.raw_json)

func block_start() -> void: _start_authorized=false
func _clock() -> Dictionary: return {"ready":true,"ms":Time.get_unix_time_from_system()*1000.0}
func _lifecycle_state() -> Dictionary:
	var owner: Variant=_owner.get_ref() if _owner!=null else null
	if not is_instance_valid(owner) or not _start_authorized: return {"ready":false}
	var state: Variant=owner.get("source_state")
	if not is_instance_valid(state) or not state.is_native_new_run_state_ready(): return {"ready":false}
	return {"ready":true,"on":state.read_current_g().get("on",false),"db_ready":true,"saving":_busy,"save_debounce":false,"pending_force":false,"save_now_pending":false}
func _lifecycle_slot() -> Dictionary: return {"ready":true,"value":"hellsave_demo"}
func _lifecycle_rift() -> Dictionary: return {"ready":true,"enabled":false,"save_state_ready":true}
func _lifecycle_collect() -> Dictionary:
	var owner: Variant=_owner.get_ref() if _owner!=null else null
	if not is_instance_valid(owner): return {"ready":true,"context":{}}
	var result := prepare_current_save(owner)
	# Known admission/IO failure must settle the lifecycle event, not create a
	# stranded unknown ticket or retry host IO on every frame.
	return result if result.get("ready")==true else {"ready":true,"context":{"failed":result}}
func start_lifecycle(owner: Node, clock: Callable = Callable()) -> Dictionary:
	if not _start_authorized or _owner!=null: return _fail("lifecycle_not_admitted")
	_owner=weakref(owner)
	var configured := store.configure_lifecycle({"clock":clock if clock.is_valid() else Callable(self,"_clock"),"current_state":Callable(self,"_lifecycle_state"),"current_collector":Callable(self,"_lifecycle_collect"),"current_slot":Callable(self,"_lifecycle_slot"),"current_rift":Callable(self,"_lifecycle_rift")})
	if not configured.ready: return configured
	store.start_auto_save()
	return store.schedule_boot_save()
func poll() -> Dictionary:
	return store.poll() if _start_authorized and _owner!=null else {"ready":false,"status":"STOPPED"}

func authorize_loaded_start(owner: Node) -> Dictionary:
	if _busy or not _committed or _start_authorized or mode!="LOADED": return _fail("loaded_start_not_admitted")
	if not owner.source_state.authorize_native_demo11_loaded_start(owner): return _fail("loaded_start_owner_rejected")
	_start_authorized=true
	return {"status":"LOADED","start_authorized":true,"committed":true}
