extends SceneTree
## All snapshots belong to this fixture. No real P/G, live slots, input or save writer.
const USERDIR := "EXODUSER-sk-s04-Isolated-20261020"
const RULES = preload("res://port_modules/skill_management_source/slot_rules.gd")
const CATALOG = preload("res://port_modules/skill_management_source/catalog.gd")
const FUSION = preload("res://port_modules/fusion_star_source/producer.gd")
var assertions := 0
var failures := 0
var oracle_rows := 0
var reader = RULES.new()

func _initialize() -> void:
	ProjectSettings.set_setting("application/config/use_custom_user_dir", true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name", USERDIR)
	call_deferred("_run")

func _run() -> void:
	_check(ProjectSettings.get_setting("application/config/use_custom_user_dir") == true, "isolation enabled")
	_check(ProjectSettings.get_setting("application/config/custom_user_dir_name") == USERDIR, "exact setting")
	_check(OS.get_user_data_dir().get_file() == USERDIR, "actual isolated user folder")
	if failures > 0:
		_finish()
		return
	var actions: Dictionary = {}
	for action in InputMap.get_actions(): actions[action] = InputMap.action_get_events(action)
	_test_assignment()
	_test_repair()
	_test_models()
	_test_boundaries_and_copy()
	_check(root.get_child_count() == 0, "no Main/actor nodes")
	_check(InputMap.get_actions() == actions.keys(), "no input registrations")
	for action in actions: _check(InputMap.action_get_events(action) == actions[action], "input unchanged " + action)
	print("SK_S04_DEFINITIONS ", JSON.stringify(RULES.read_definitions().value))
	_finish()

func _ids() -> Array:
	var ids: Array = []
	for sk in CATALOG.SKILLS: ids.append(sk.id)
	for id in ["charge", "parry", "normal", "shieldBlock", "unknown", ""]:
		if not ids.has(id): ids.append(id)
	return ids

func _player(level: int = 1) -> Dictionary:
	var p := {"skills":{}, "_fused":{}, "sp":0, "lv":1}
	for id in _ids(): p.skills[id] = level
	for s in RULES.SLOTS:
		if s.kind == "fixed": p[s.v] = null
	return p

func _test_assignment() -> void:
	var layouts := [[null,null,null,null,null,null], ["darkPillar","thunderStake","voidScarecrow","ancestorSummon",null,null],
		["spikeTrap",null,null,null,null,null], ["","",null,null,"",""],
		["giantSlam","giantSlam2","holyDome","holyPrison",null,null],
		[null,null,null,null,"giantSlam","holyDome"], [null,null,null,null,"spikeTrap","spikeTrap"]]
	for id in _ids():
		_emit("is_area", [id])
		_emit("is_rage", [id])
		for index in [-1, 0, 0.5, 1, 2, 3, 3.5, 4, 5, 6]: _emit("can_assign", [id,index])
		for slots in layouts: _emit("find_auto", [id,slots])
	_check(RULES.find_auto("spikeTrap", layouts[1]).value == -1, "four ordinary full")
	_check(RULES.find_auto("holyDome", layouts[5]).value == -1, "dedicated area occupied")
	_check(RULES.find_auto("giantSlam2", layouts[5]).value == -1, "dedicated rage occupied")
	_check(RULES.find_auto("spikeTrap", layouts[3]).value == 2, "only null is auto empty")
	_check(RULES.find_auto("spikeTrap", layouts[6]).value == -1, "duplicate anywhere blocks auto")

func _test_repair() -> void:
	var explicit := [
		[null,null,null,null,"holyDome","giantSlam"],
		["holyDome","holyPrison","giantSlam","giantSlam2","spikeTrap","darkPillar"],
		["spikeTrap","darkPillar","thunderStake","voidScarecrow","explodeScarecrow","ancestorSummon"],
		["spikeTrap","spikeTrap",null,null,null,null],
		["unknown","fireball","blackStar","",null,null],
		[null,null,null,null,"","holyDome"]]
	for slots in explicit: _emit("repair_preview", [slots])
	_check(RULES.repair_preview(explicit[0]).value == {"slots":[null,null,null,null,"giantSlam","holyDome"],"changed":true}, "F Space reversed source repair")
	_check(RULES.repair_preview(explicit[2]).value.slots == ["spikeTrap","darkPillar","thunderStake","voidScarecrow",null,null], "overflow drops displaced")
	_check(RULES.repair_preview(explicit[3]).value.changed == false, "valid ordinary duplicates preserved by repair")
	_check(RULES.repair_preview(explicit[5]).value.changed == false, "falsy dedicated string remains unchanged")
	var values := [null, "", "unknown", "spikeTrap", "giantSlam", "giantSlam2", "holyDome", "holyPrison", "fireball", "blackStar"]
	for seed in range(640):
		var slots: Array = []
		var n := seed * 7919 + 17
		for j in range(6):
			slots.append(values[n % values.size()])
			n = int(n / values.size()) + (j + 1) * 137
		var before: Array = slots.duplicate(true)
		var result: Variant = _emit("repair_preview", [slots])
		_check(slots == before, "repair input immutable")
		if result is Dictionary:
			_check(RULES.repair_preview(result.slots).value.changed == false, "repair idempotent")

func _test_models() -> void:
	var states: Array = [_player(0), _player(1), _player(2)]
	for key in FUSION.FUSE_PAIRS:
		var p := _player(1)
		p["_fused"][key] = true
		states.append(p)
	for flags in [["elemFuse","stormBurst"], ["elemFuse","stormBeam"], ["dimRush"], ["stormBurst"]]:
		var p := _player(0)
		for key in flags: p["_fused"][key] = true
		states.append(p)
	var cumulative := _player(1)
	for key in FUSION.FUSE_PAIRS:
		cumulative["_fused"][key] = true
		states.append(cumulative.duplicate(true))
	var selected := _player(1)
	for slot in RULES.SLOTS:
		if slot.kind == "fixed": selected[slot.v] = CATALOG.SLOT_DEFINITIONS[slot.def].skills[-1]
	states.append(selected)
	selected = selected.duplicate(true)
	selected["_fused"]["dimBreach"] = "yes"
	selected["_fused"]["stormBurst"] = 1
	states.append(selected)
	var slots := ["spikeTrap",null,"",null,"giantSlam","holyDome"]
	for i in range(states.size()):
		var p: Dictionary = states[i]
		for slot in RULES.SLOTS:
			_emit("slot_eligible", [slot.k,p])
			_emit("slot_value", [slot.k,p,slots,"blackStar"])
			if i in [0,1,2,3,34,35,36]:
				for id in _ids(): _emit("can_equip", [slot.k,id,p])
		for tab in CATALOG.SLOT_DEFINITIONS: _emit("fixed_popup", [tab,p])
		for index in range(6): _emit("numeric_popup_candidates", [index,p])
	var p := _player(1)
	for slot in RULES.SLOTS:
		if slot.kind == "fixed": continue
		for id in _ids(): _emit("equip_preview", [slot.k,id,p,[id,id,null,id,null,id],null])
	var empty := _player(0)
	var orphan := _player(0)
	orphan["_fused"]["dimRush"] = true
	_check(not RULES.fixed_popup("charge",orphan).value.fused, "isDimBreach checks dimBreach only")
	orphan["_fused"]["dimBreach"] = true
	_check(RULES.fixed_popup("charge",orphan).value.fusion_host == "chargeBoost", "lower key keeps original charge host precedence")
	_check(RULES.can_equip("Shift", "charge", empty).value, "unregistered fixed charge accepted")
	_check(RULES.can_equip("E", "fireball", empty).value, "fixed free fireball")
	_check(not RULES.can_equip("RMB", "maliceSwipe", empty).value, "nonfree fixed must be learned")
	_check(RULES.slot_eligible("E", empty).value.has("burstLoop"), "hidden reqLv visible before learned")
	_check(not RULES.slot_eligible("E", empty).value.has("hellRay"), "hidden no reqLv absent before learned")
	p["_fused"]["elemFuse"] = true
	p["_fused"]["stormBurst"] = true
	_check(RULES.slot_eligible("E", p).value.has("omniBeam"), "Forge isAbsorbed exception preserved")
	_check(not RULES.fixed_popup("magic", p).value.options.any(func(o): return o.id == "omniBeam"), "legacy union hides omniBeam host")
	p = _player(1)
	p["_fused"]["shieldFuse"] = true
	_check(RULES.slot_eligible("RMB",p).value.has("maliceSwipe"), "host is not absorbed without L fused branch")
	p["_fused"]["sixFuse"] = true
	_check(not RULES.slot_eligible("E",p).value.has("omniBeam"), "absorbed removed from Forge tray")
	_check(RULES.can_equip("E","omniBeam",p).value, "fixed canEquip itself does not check absorption")
	var model: Dictionary = RULES.read_model(p, slots, null)
	_check(model.status == "READY" and model.value.size() == 13, "13 slot model")
	_check(model.value[4].slot.k == "F" and model.value[12].slot.idx == 4, "Forge order vs numeric order")
	_check(not model.value.any(func(row): return row.slot.get("def") == "bow"), "Forge no T bow slot")
	for slot in RULES.SLOTS: _emit("slot_value", [slot.k,_player(1),[null,null,null,null,null,null],null])

func _test_boundaries_and_copy() -> void:
	var p := _player(1)
	for args in [[null,0], [&"spikeTrap",0], ["constructor",0], ["spikeTrap","0"], ["spikeTrap",true], ["spikeTrap",NAN]]:
		_nr(RULES.can_assign.callv(args), "unsupported assignment")
	for bad in [null, [], [null,null,null,null,null], [null,null,null,null,null,1], [null,null,null,null,null,&"spikeTrap"]]:
		_nr(RULES.repair_preview(bad), "invalid slots not empty default")
		_nr(RULES.find_auto("spikeTrap",bad), "invalid auto state")
	_nr(RULES.slot_value("missing",p,[],null), "unknown slot NR")
	_nr(RULES.slot_eligible("E",null), "missing P NR")
	_nr(RULES.can_equip("1","spikeTrap",null), "missing P NR")
	_nr(RULES.fixed_popup("magic",{}), "legacy missing skills NR")
	_nr(RULES.numeric_popup_candidates(0,{}), "legacy numeric missing skills NR")
	for field in ["skills", "_fused"]:
		var bad: Dictionary = p.duplicate(true)
		bad[field] = {&"spikeTrap":1}
		_nr(RULES.slot_eligible("1",bad) if field == "_fused" else RULES.can_equip("1","spikeTrap",bad), "StringName map keys NR")
	var bad := _player(1)
	bad["skills"]["spikeTrap"] = "1"
	_nr(RULES.can_equip("1","spikeTrap",bad), "numeric coercion not guessed")
	var slots := ["spikeTrap","spikeTrap",null,null,null,null]
	var before: Dictionary = p.duplicate(true)
	var skills_ref: Dictionary = p.skills
	var fused_ref: Dictionary = p._fused
	var before_slots: Array = slots.duplicate(true)
	var snapshot: Dictionary = RULES.read_model(p,slots,null)
	snapshot.value[0].slot["k"] = "mutated"
	snapshot.value[0].eligible.clear()
	var defs: Dictionary = RULES.read_definitions()
	defs.value[0]["idx"] = 99
	_check(RULES.read_definitions().value[0].idx == 0, "nested definition copy")
	var planned: Dictionary = RULES.equip_preview("3","spikeTrap",p,slots,null)
	_check(planned.value.slots == [null,null,"spikeTrap",null,null,null], "preview removes duplicates before setting target")
	planned.value.slots[2] = "changed"
	for key in ["Q","E","Shift","Ctrl","LMB","RMB"]: _nr(RULES.equip_preview(key,"spikeTrap",p,slots,null), "fixed writer protected")
	_check(p == before and slots == before_slots, "all borrowed fixtures unmodified")
	_check(is_same(p.skills, skills_ref) and is_same(p._fused, fused_ref), "nested input identity retained")
	_check(RULES.slot_value("Q",{},[],null).value == null, "unassigned fixed source fallback null")

func _emit(method: String, args: Array) -> Variant:
	var packet: Dictionary = reader.callv(method,args)
	_check(packet.get("status") == "READY", "oracle packet " + method)
	if packet.get("status") != "READY": return null
	oracle_rows += 1
	print("SK_S04_ORACLE_ROW ", JSON.stringify({"method":method,"args":args,"value":packet.value}))
	return packet.value

func _nr(packet: Dictionary, label: String) -> void:
	_check(packet.get("status") == "NOT_READY" and packet.has("reason") and not packet.has("value"),label)

func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("SK_S04_FAIL ",label)

func _finish() -> void:
	print("SK_S04_RESULT ", JSON.stringify({"assertions":assertions,"failures":failures,"oracle_rows":oracle_rows,"skipped":[],"main_boots":0,"user_dir":OS.get_user_data_dir()}))
	quit(0 if failures == 0 else 1)
