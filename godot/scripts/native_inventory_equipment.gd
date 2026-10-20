extends RefCounted
## G16272-16380. TI00/01 + accepted forge prefix, then one PC equipment refresh.
## No ticking, actor/resource writes, formula copies, UI or persistence.
const Contract = preload("res://scripts/native_inventory_contract.gd")
const Layout = preload("res://scripts/native_inventory_layout.gd")
const FRESH_BAG_MAX := 300 # G16180; accepted native fresh-run owner has no restored capacity yet.
const Affix = preload("res://port_modules/equipment_affix_reader/producer.gd")
var _main: WeakRef
var _state: WeakRef
var _reader = Contract.new()
var _transfer_active := false
var _old: Dictionary = {}
var _next: Dictionary = {}
var _last: Dictionary = {}
func configure(main: Node, state: Node) -> bool:
	if _main != null or not _reader.bind_source_state(state): return false
	_main=weakref(main); _state=weakref(state)
	return true
func is_bound_to(main: Node, state: Node) -> bool:
	return _main!=null and _state!=null and _main.get_ref()==main and _state.get_ref()==state
func owns_transfer_handoff(old: Dictionary, item: Dictionary) -> bool:
	return _transfer_active and is_same(old,_old) and is_same(item,_next)
func _reject(reason: String) -> Dictionary: return {"applied":false,"reason":reason,"unchanged":true}
func _index(bag: Array, item: Dictionary) -> int:
	for i in bag.size():
		if is_same(bag[i],item): return i
	return -1
func _remember(objects: Array, value: Variant) -> void:
	if not (value is Dictionary or value is Array): return
	for entry in objects:
		if is_same(entry.ref,value): return
	objects.append({"ref":value,"values":value.duplicate()})
func _restore(objects: Array) -> void:
	for entry in objects:
		entry.ref.clear()
		if entry.ref is Dictionary: entry.ref.merge(entry.values)
		else: entry.ref.append_array(entry.values)
func execute(operation: String, item: Dictionary, target: String, inv: Dictionary, wallet: Dictionary, gems: Array) -> Dictionary:
	var main: Node=_main.get_ref()
	var state: Node=_state.get_ref()
	if not is_same(_reader.read_current_inventory(),inv): return _reject("current_INV_lost")
	var slots: Array=_reader.source_slot_names()
	var bag: Array=inv.bag
	var equipped: Dictionary=inv.equipped
	var old: Variant=null
	var slot := target
	var index := -1
	if operation=="equip":
		index=_index(bag,item)
		if index<0: return _reject("item_not_in_actual_bag")
		if item.get("slot")=="bonePart": return _reject("bone_codex_owner_not_adopted")
		for current in equipped.values():
			if is_same(current,item): return _reject("item_already_equipped")
		var req: Variant=item.get("reqLv")
		if Affix.js_truthy(req):
			if not (req is int or req is float) or not is_finite(float(req)): return _reject("unsupported_required_level")
			if float(state.read_current_p().lv)<float(req): return _reject("required_level") # G16296
		slot=str(item.get("slot",""))
		if slot in ["headband","headband2"]:
			if not target.is_empty():
				if target not in ["headband","headband2"]: return _reject("invalid_earring_target")
				slot=target
			elif not Affix.js_truthy(equipped.headband): slot="headband"
			elif not Affix.js_truthy(equipped.headband2): slot="headband2"
		elif not target.is_empty() and target!=slot: return _reject("invalid_target")
		if slot not in slots: return _reject("unsupported_slot")
		old=equipped[slot]
		if old!=null and not old is Dictionary: return _reject("unsupported_old_item")
		if old is Dictionary and (not (wallet.get("mats") is int or wallet.get("mats") is float) or not is_finite(float(wallet.mats))): return _reject("unsupported_wallet")
		if old is Dictionary and old.get("crystals")!=null and not old.crystals is Array: return _reject("unsupported_old_crystals")
		if item.get("crystals")!=null and not item.crystals is Array: return _reject("unsupported_new_crystals")
		var sockets: Variant=item.get("socketCount",0)
		if not (sockets is int or sockets is float) or not is_finite(float(sockets)) or sockets<0 or sockets!=floor(sockets): return _reject("unsupported_sockets")
	elif operation=="unequip":
		if slot not in slots or not equipped[slot] is Dictionary: return _reject("empty_or_unknown_slot")
		item=equipped[slot]
	else: return _reject("unknown_operation")
	# Snapshot only transaction-owned mutable containers; references stay actual.
	var journal: Array=[]
	for value in [inv,bag,equipped,gems,item,old]: _remember(journal,value)
	for entry in equipped.values(): _remember(journal,entry) # lazy source legendary item-field restoration
	for entry in [item,old]:
		if entry is Dictionary:
			_remember(journal,entry.get("crystals")); _remember(journal,entry.get("socketQ"))
	var had_mats: bool=wallet.has("mats")
	var mats: Variant=wallet.get("mats")
	var cache: Dictionary=main.capture_native_equipment_caches(self)
	if cache.is_empty(): return _reject("cache_owner_not_ready")
	var attack_before: Dictionary=main.read_native_attack_parameters()
	var defense_before: Variant=main.player.read_native_source_initialization_fields().baseDef
	var transfer: Dictionary={}
	var failure := ""
	if operation=="equip":
		if old is Dictionary:
			_old=old; _next=item; _transfer_active=true
			transfer=state.apply_native_forge_transfer_prefix(main,old,item)
			_transfer_active=false; _old={}; _next={}
			if transfer.get("status")!="READY" or not transfer.get("continue_equip",false): failure=str(transfer.get("reason","forge_transfer_rejected"))
			if failure.is_empty(): _transfer_crystals(old,item,gems)
			if failure.is_empty():
				old._gx=item.get("_gx"); old._gy=item.get("_gy")
				if Layout.source_item_size(old)!=Layout.source_item_size(item): old._gx=null; old._gy=null
				bag.append(old)
		if failure.is_empty():
			equipped[slot]=item; item.slot=slot
			var next_bag: Array=[]
			for entry in bag:
				if not is_same(entry,item): next_bag.append(entry)
			inv.bag=next_bag # G16355 creates a fresh filtered Array
			if old is Dictionary and old.get("_gx")==null:
				var size: Array=Layout.source_item_size(old)
				var pos: Variant=Layout.find_space(next_bag,size[0],size[1],-1,old,FRESH_BAG_MAX)
				if pos!=null: old._gx=pos.x; old._gy=pos.y
	else:
		bag.append(item)
		var size: Array=Layout.source_item_size(item)
		var pos: Variant=Layout.find_space(bag,size[0],size[1],bag.size()-1,Layout.ITEM_FROM_SKIP,FRESH_BAG_MAX)
		if pos==null: failure="bag_no_space"
		else: item._gx=pos.x; item._gy=pos.y; equipped[slot]=null
	var receipt: Dictionary={}
	if failure.is_empty():
		receipt=main.request_native_runtime_stat_refresh("equipment_refresh",operation+":"+slot)
		if receipt.get("committed")!=true: failure=str(receipt.get("reason","runtime_refresh_failed"))
	if not failure.is_empty():
		_restore(journal)
		if had_mats: wallet.mats=mats
		else: wallet.erase("mats")
		main.restore_native_equipment_caches(self,cache)
		_last={"applied":false,"unchanged":true,"reason":failure,"refresh":receipt,"operation":operation,"slot":slot}
		return _last.duplicate(true)
	_last={"applied":true,"reason":"","operation":operation,"slot":slot,"refresh":receipt,
		"transfer":transfer,"before_attack":attack_before,"before_defense":defense_before,"attack_readback":main.read_native_attack_parameters(),
		"defense_readback":main.player.read_native_source_initialization_fields().baseDef,
		"unported":["inventory UI wiring","equip SFX/lesson callbacks","dbSaveForce"]}
	_last["effects"]=preload("res://scripts/native_equipment_effect_consumption.gd").observe(main,inv,receipt)
	return _last.duplicate(true)
func _transfer_crystals(old: Dictionary, item: Dictionary, gems: Array) -> void:
	if not old.get("crystals") is Array or old.crystals.is_empty(): return
	if not Affix.js_truthy(item.get("socketCount")): item.socketCount=0
	if not Affix.js_truthy(item.get("crystals")):
		item.crystals=[]; item.crystals.resize(int(item.socketCount)); item.crystals.fill(null)
	if not item.get("socketQ") is Array:
		item.socketQ=[]; item.socketQ.resize(item.crystals.size()); item.socketQ.fill(1)
	for ci in old.crystals.size():
		var crystal: Variant=old.crystals[ci]
		if not Affix.js_truthy(crystal): continue
		var placed := false
		for ni in item.crystals.size():
			if not Affix.js_truthy(item.crystals[ni]): item.crystals[ni]=crystal; placed=true; break
		if not placed:
			if gems.size()>=9999: continue # G16338 leaves that crystal on old
			gems.append(crystal)
		old.crystals[ci]=null
func get_snapshot() -> Dictionary:
	return {"bound":_main!=null,"last":_last.duplicate(true),"tick_path":false,"save_connected":false}
