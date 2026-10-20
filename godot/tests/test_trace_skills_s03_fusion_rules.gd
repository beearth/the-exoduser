extends SceneTree
## Explicit fixture dictionaries only. This test does not bind a real P/G owner.
const USERDIR := "EXODUSER-sk-s03-Isolated-20261020"
const RULES = preload("res://port_modules/skill_management_source/fusion_rules.gd")
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
	_check(ProjectSettings.get_setting("application/config/custom_user_dir_name") == USERDIR, "exact isolation setting")
	_check(OS.get_user_data_dir().get_file() == USERDIR, "actual OS isolated path")
	if failures > 0:
		_finish()
		return
	var input_actions: Dictionary = {}
	for action in InputMap.get_actions(): input_actions[action] = InputMap.action_get_events(action)
	_test_gates()
	_test_state_matrix()
	_test_mastery()
	_test_boundaries()
	_test_copy_and_purity()
	_check(root.get_child_count() == 0, "no Main/actor nodes")
	_check(InputMap.get_actions() == input_actions.keys(), "no input registration")
	for action in input_actions:
		_check(InputMap.action_get_events(action) == input_actions[action], "binding unchanged " + action)
	print("SK_S03_SOURCE_METADATA ", JSON.stringify(RULES.read_rules_catalog()))
	_finish()

func _test_gates() -> void:
	var full_count := 0
	var demo_count := 0
	for key in FUSION.FUSE_PAIRS:
		var player := {"skills":{}, "_fused":{}, "lv":1, "sp":0, "_catProf":{}, "_fuseProfSec":{}}
		for member in FUSION.FUSE_PAIRS[key]: player.skills[member] = 1
		var full: Variant = _emit("can_fuse", [key,player,false])
		var demo: Variant = _emit("can_fuse", [key,player,true])
		if full == true: full_count += 1
		if demo == true: demo_count += 1
		_check(full == true, "no minLv/SP/mastery/predecessor gate " + key)
		for member in FUSION.FUSE_PAIRS[key]:
			player.skills.erase(member)
			_emit("can_fuse", [key,player,false])
			for level in [0, 0.5, -1, 1, 2]:
				player.skills[member] = level
				_emit("can_fuse", [key,player,false])
			player.skills[member] = 1
		player._fused[key] = true
		_check(_emit("can_fuse", [key,player,false]) == false, "completed fusion rejected " + key)
		_emit("can_fuse", [key,player,true])
		_emit("get_absorbed", [key])
		_emit("fusion_names", [key])
		_emit("card_proficiency", [key,player])
		_emit("fuse_proficiency", [key,player])
		_emit("card_proficiency_hms", [key,player])
		_emit("required_proficiency", [key])
	_check(full_count == 32 and demo_count == 22, "32 full and22 demo allowed")
	_check(RULES.can_fuse("__missing__", null, 17).value == false, "unknown stops before state/demo validation")
	_check(RULES.can_fuse("timeStep", null, true).value == false, "demo gate precedes missing P")
	_check(RULES.can_fuse("dimBreach", {"_fused":{"dimBreach":true}}, false).value == false, "completed precedes missing skills")
	var short := {"skills":{"chargeBoost":0, "magicBlink":"unsupported"}, "_fused":{}}
	_check(RULES.can_fuse("dimBreach", short).value == false, "first unlearned member short circuits later invalid value")
	_check(RULES.can_fuse("dimBreach", {"skills":{"chargeBoost":1,"magicBlink":1}, "_fused":{}}).value, "no predecessor/minLv/mastery enforcement")

func _test_state_matrix() -> void:
	var skills: Array = []
	for skill in CATALOG.SKILLS: skills.append(skill.id)
	skills.append_array(["meleeAttack","shieldBash","__missing__"])
	var states: Array = [{}, {"__unregistered__":true}]
	var prefix: Dictionary = {}
	for key in FUSION.FUSE_PAIRS:
		states.append({key:true})
		prefix[key] = true
		states.append(prefix.duplicate())
	# All eight host exception combinations, including elemFuse+stormBurst without stormBeam.
	for mask in range(8):
		var fused := {}
		for i in range(3): fused[["elemFuse","stormBeam","stormBurst"][i]] = bool(mask & (1 << i))
		states.append(fused)
	for fused in states:
		var player := {"skills":{}, "_fused":fused, "isDemoTest":false}
		var before := JSON.stringify(player)
		_emit("get_all_absorbed", [player])
		for id in skills:
			_emit("get_fuse_key", [id,player])
			_emit("fused_star", [id,player])
			_emit("is_absorbed", [id,player])
		_check(JSON.stringify(player) == before, "borrowed P unchanged after matrix row")
		_check(is_same(player._fused, fused), "borrowed fused identity unchanged")
	for id in skills: _emit("innate_star", [id])
	_check(RULES.get_absorbed("bladeEcho").value.is_empty(), "bladeEcho omission preserved")
	_check(not RULES.is_absorbed("bladeDash", {"_fused":{"bladeEcho":true}}).value, "bladeEcho does not invent absorption")
	var host := {"_fused":{"elemFuse":true,"stormBurst":true}}
	_check(RULES.get_all_absorbed(host).value.has("omniBeam"), "all absorbed still lists omniBeam")
	_check(not RULES.is_absorbed("omniBeam",host).value, "host override checks stormBeam only")
	host["_fused"]["stormBeam"] = true
	_check(RULES.is_absorbed("omniBeam",host).value, "stormBeam removes host exemption")
	_check(RULES.get_fuse_key("chargeBoost", {"_fused":{"dimBlast":true}}).value == "dimBreach", "source display omission of dimBlast preserved")
	_check(RULES.is_fused("__unregistered__", {"_fused":{"__unregistered__":true}}).value, "isFused does not filter registry")
	for scalar in [null,false,0,"",true,1,"yes",[],{}]:
		_emit("is_fused", ["dimBreach",{"_fused":{"dimBreach":scalar}}])
	for scalar in [null,false,0,""]:
		_emit("get_all_absorbed", [{"_fused":scalar}])
		_emit("fused_star", ["giantSlam",{"_fused":scalar}])
	var normal := {"_fused":{"holyWeak4":true}, "isDemoTest":false}
	var shown: Dictionary = RULES.display_star("weakRev", normal).value
	_check(shown.star == 7 and shown.count == 6 and shown.text == "★★★★★★" and shown.color == "#ffcc00", "star7 has six golden glyphs")
	for demo_test in [false,true]:
		normal.isDemoTest = demo_test
		for id in skills: _emit("display_star", [id,normal])

func _test_mastery() -> void:
	var prof := {"phys":10.5,"magic":25,"bow":9.9,"def":600,"move":0,"tech":599.9,"rage":9999,"summon":10000,"ult":-10}
	var player := {"_catProf":prof,"_skProf":{"__missing__":17.5,"giantSlam":9999},"_fused":{}}
	var ids: Array = []
	for skill in CATALOG.SKILLS: ids.append(skill.id)
	ids.append_array(["meleeAttack","shieldBash","__missing__"])
	for id in ids:
		for method in ["skill_proficiency","proficiency_level","proficiency_multiplier","proficiency_maxed"]:
			_emit(method,[id,player])
		_emit("proficiency_cap",[id])
	for key in FUSION.FUSE_PAIRS:
		_emit("card_proficiency",[key,player])
		_emit("fuse_proficiency",[key,player])
		_emit("card_proficiency_hms",[key,player])
	for seconds in [-10.5, 0, 9.9, 10, 599.9,600,9998.9,9999,10000,21474836480.0]:
		var p := {"_catProf":{"phys":seconds}}
		for method in ["skill_proficiency","proficiency_level","proficiency_multiplier","proficiency_maxed"]:
			_emit(method,["meleeAttack",p])
	for raw in [null,{},false,0,""]:
		_emit("skill_proficiency",["giantSlam",raw])
		_emit("card_proficiency",["stormBeam",raw])
	_check(RULES.skill_proficiency("giantSlam",player).value == 9999, "known rage skill uses category")
	_check(RULES.skill_proficiency("__missing__",player).value == 17.5, "unknown skill legacy fallback")
	_check(RULES.card_proficiency("__missing__",null).value == 0, "unknown card has no P read")
	_check(RULES.get_fuse_key("__missing__",null).value == null, "unknown display candidate has no P read")

func _test_boundaries() -> void:
	var key_methods := {"innate_star":[],"get_absorbed":[],"fusion_names":[],"proficiency_cap":[],"required_proficiency":[],
		"is_fused":[{}],"get_fuse_key":[{}],"fused_star":[{}],"is_absorbed":[{}],"display_star":[{}],
		"skill_proficiency":[{}],"card_proficiency":[{}],"can_fuse":[{},false]}
	for method in key_methods:
		for raw in [null,true,1,1.0,&"giantSlam",[],{},Vector2.ZERO,"__proto__","constructor"]:
			var args: Array = [raw]
			args.append_array(key_methods[method])
			var result: Dictionary = reader.callv(method,args)
			_check(result.status == "NOT_READY", "unsupported id " + method)
	for raw in [null,true,1,"truthy",[],Vector2.ZERO]:
		_check(RULES.get_all_absorbed(raw).status == "NOT_READY", "P unavailable is not neutral []")
		_check(RULES.can_fuse("dimBreach",raw).status == "NOT_READY", "P unavailable is not canFuse false")
	for raw in [true,1,"truthy",[]]:
		_check(RULES.get_all_absorbed({"_fused":raw}).status == "NOT_READY", "truthy unsupported fused container")
	for level in [true,"1",[],{},NAN,INF,-INF]:
		var p := {"skills":{"chargeBoost":level,"magicBlink":1}}
		_check(RULES.can_fuse("dimBreach",p).status == "NOT_READY", "unsupported used skill level")
	_check(RULES.can_fuse("dimBreach",{},"demo").status == "NOT_READY", "demo carrier not coerced")
	_check(RULES.get_all_absorbed({"_fused":{&"dimBreach":true}}).status == "NOT_READY", "StringName state key unsupported")
	_check(RULES.skill_proficiency("giantSlam", {"_catProf":{"rage":"600"}}).status == "NOT_READY", "proficiency string unsupported")
	_check(RULES.display_star("giantSlam", {"isDemoTest":1}).status == "NOT_READY", "demo-test carrier unsupported")

func _test_copy_and_purity() -> void:
	var metadata: Dictionary = RULES.read_rules_catalog()
	_check(metadata.demo_allowed.size() == 22 and metadata.absorption.size() == 31, "source32 recipes and31 absorption entries")
	metadata.demo_allowed.clear()
	metadata.absorption.dimBreach.append("caller")
	metadata.names_ko.bladeEcho = "caller"
	_check(RULES.read_rules_catalog().demo_allowed.size() == 22, "demo copy")
	_check(RULES.get_absorbed("dimBreach").value == ["magicBlink"], "nested absorption copy")
	_check(RULES.fusion_names("bladeEcho").value.ko == "추적전격", "name copy")
	var result: Array = RULES.get_all_absorbed({"_fused":{"stormBeam":true}}).value
	result.clear()
	_check(RULES.get_all_absorbed({"_fused":{"stormBeam":true}}).value.size() == 5, "union return copy")
	var player := {"skills":{"chargeBoost":1,"magicBlink":1},"_fused":{},"sentinel":{"nested":[1,2,3]}}
	var original := JSON.stringify(player)
	var nested: Dictionary = player.sentinel
	for i in range(10):
		_check(RULES.can_fuse("dimBreach",player).value, "repeat pure call")
	_check(JSON.stringify(player) == original and is_same(nested,player.sentinel), "nested caller state unchanged")
	for forbidden in ["configure","_execFuse","cast_giant_slam","save","_addSkProf","_addFuseProfTick"]:
		_check(not reader.has_method(forbidden), "no mutation/owner API " + forbidden)

func _emit(method: String, args: Array) -> Variant:
	var packet: Dictionary = reader.callv(method,args)
	_check(packet.status == "READY", "supported fixture " + method)
	if packet.status != "READY": return null
	oracle_rows += 1
	var row := {"method":method,"args":args,"value":packet.value}
	if packet.value is int or packet.value is float:
		var bytes := PackedByteArray()
		bytes.resize(8)
		bytes.encode_double(0, float(packet.value))
		row["number_bits"] = bytes.hex_encode()
	print("SK_S03_ORACLE_ROW ",JSON.stringify(row))
	return packet.value

func _check(value: bool, label: String) -> void:
	assertions += 1
	if not value:
		failures += 1
		printerr("SK_S03_FAIL ",label)

func _finish() -> void:
	print("SK_S03_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_rows":oracle_rows,
		"skipped":[],"main_boots":0,"user_dir":OS.get_user_data_dir()}))
	quit(1 if failures else 0)
