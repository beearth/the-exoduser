extends SceneTree
## S05a-e run only on this script's own fixtures. No State/P/G owner binding.
const USERDIR := "EXODUSER-sk-s05-Isolated-20261020"
const S = preload("res://port_modules/skill_management_source/core_support.gd")
const LEARN = preload("res://port_modules/skill_management_source/learn.gd")
const UP = preload("res://port_modules/skill_management_source/upgrade.gd")
const FUSE = preload("res://port_modules/skill_management_source/fuse_commit.gd")
const REFUND = preload("res://port_modules/skill_management_source/refund.gd")
const BATCH = preload("res://port_modules/skill_management_source/batch_recommend.gd")
var assertions := 0
var failures := 0
var oracle_rows := 0
var groups: Dictionary = {}
var active_group := "isolation"

func _initialize() -> void:
	ProjectSettings.set_setting("application/config/use_custom_user_dir",true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name",USERDIR)
	call_deferred("_run")

func _run() -> void:
	_check(OS.get_user_data_dir().get_file() == USERDIR,"actual isolated directory")
	_check(ProjectSettings.get_setting("application/config/use_custom_user_dir") == true,"custom directory enabled")
	if failures:
		_finish()
		return
	var actions: Dictionary = {}
	for action in InputMap.get_actions(): actions[action] = InputMap.action_get_events(action)
	active_group = "S05a_learn"
	_test_learn()
	active_group = "S05b_upgrade"
	_test_upgrade()
	active_group = "S05c_fuse"
	_test_fuse()
	active_group = "S05d_refund"
	_test_refund()
	active_group = "S05e_batch_recommend"
	_test_batch_recommend()
	active_group = "boundaries_purity"
	_test_boundaries()
	_check(root.get_child_count() == 0,"no Main/actor nodes")
	_check(InputMap.get_actions() == actions.keys(),"no input actions registered")
	for action in actions: _check(InputMap.action_get_events(action) == actions[action],"input unchanged " + action)
	_finish()

func _fixture(level: int = 0, player_level: int = 999, sp: int = 9999, mats: int = 9999) -> Dictionary:
	var p := {"skills":{},"_fused":{},"lv":player_level,"sp":sp,
		"activeLMBSk":"kiSlash","activeRMBSk":"maliceSwipe","activeChargeSk":"charge","activeMagicSk":"fireball",
		"activeQSk":"parry","activeCtSk":"ghostWalk","activeBowSk":"normal","activeTechSk":"giantSlam"}
	for sk in S.CATALOG.SKILLS: p.skills[sk.id] = level
	return {"p":p,"g":{"mats":mats},"slots":[null,null,null,null,null,null],"ultimate":null}

func _test_learn() -> void:
	for sk in S.CATALOG.SKILLS:
		for resource_case in range(5):
			var f := _fixture()
			if resource_case == 1: f.p.sp = sk.spCost - 1
			elif resource_case == 2: f.p.sp = sk.spCost
			elif resource_case == 3: f.g.mats = S.mal_cost(sk.get("matCost",0)) - 1
			elif resource_case == 4: f.g.mats = S.mal_cost(sk.get("matCost",0))
			_emit("learn_gate",[sk.id,f])
			for mode in ["ui","direct","auto"]: _emit("learn",[sk.id,f,mode])
		var owned := _fixture(2)
		_emit("learn",[sk.id,owned,"auto"])
		_emit("learn",[sk.id,owned,"ui"])
	for id in ["blueShot","ghostXbowTurret","timeWarp","burstLoop"]:
		for level in [299,300,499,500,699,700]:
			var f := _fixture(0,level)
			for mode in ["ui","direct","auto"]: _emit("learn",[id,f,mode])
	var chain := _fixture()
	var result := LEARN.preview("chainAssault",chain,"direct")
	_check(result.value.fixture.p.skills.chainSlam == 1,"chainAssault supplements chainSlam")
	_check(result.value.fixture.p.skills.chainAssault == 1,"chainAssault acquired")
	var req := _fixture(0,1)
	_check(not LEARN.ui_gate("blueShot",req).value,"UI checks reqLv")
	_check(LEARN.preview("blueShot",req,"direct").value.applied,"direct source bypasses reqLv")
	var zero := _fixture(0,1,0,0)
	_check(LEARN.preview("chainSlash",zero,"direct").value.applied,"zero-cost direct acquisition")
	var absorbed := _fixture()
	absorbed.p._fused["elemFuse"] = true
	absorbed.slots = ["fanShot","omniBeam","elemMissile",null,null,null]
	_emit("learn",["spikeTrap",absorbed,"direct"])

func _test_upgrade() -> void:
	for sk in S.CATALOG.SKILLS:
		for level in [1,8,9,19,20]:
			for player_level in [49,50,949,950]:
				var f := _fixture(0,player_level,1,0)
				f.p.skills[sk.id] = level
				_emit("context",[sk.id,f])
				_emit("upgrade",[sk.id,f,"ui"])
				_emit("upgrade",[sk.id,f,"direct"])
	for key in S.PAIRS.FUSE_PAIRS:
		var f := _fixture(9,499)
		f.p._fused[key] = true
		for id in S.members(key):
			for funds in [0,2,3,4,6,8]:
				f.p.sp = funds
				_emit("context",[id,f])
				_emit("upgrade",[id,f,"ui"])
				_emit("upgrade",[id,f,"direct"])
		var unequal := _fixture(9,999)
		unequal.p._fused[key] = true
		unequal.p.skills[S.members(key)[0]] = 1
		for id in S.members(key): _emit("upgrade",[id,unequal,"direct"])
	var all := _fixture(1)
	for key in S.PAIRS.FUSE_PAIRS: all.p._fused[key] = true
	for sk in S.CATALOG.SKILLS: _emit("context",[sk.id,all])
	var storm := _fixture(1,1,4,0)
	storm.p._fused["stormBeam"] = true
	_check(UP.context("whirlwind",storm).value.fuse_display_cost == 4,"storm display uses star4")
	_check(not UP.preview("whirlwind",storm,"direct").value.applied,"storm actual six-member cost cannot use4SP")
	storm.p.sp = 6
	_check(UP.preview("whirlwind",storm,"direct").value.applied,"direct fused upgrade does not check player lock")
	_check(not UP.preview("whirlwind",storm,"ui").value.applied,"UI context does check player lock")
	var siege := _fixture(1,999,2,0)
	siege.p._fused["siegeGhost"] = true
	_check(UP.context("ghostXbowTurret",siege).value.fuse_display_cost == 3,"siege display star3")
	_check(UP.preview("ghostXbowTurret",siege,"direct").value.applied,"siege actual member-count2")
	_check(not UP.preview("ghostXbowTurret",siege,"ui").value.applied,"siege displayed3 gate preserved")
	var f := _fixture(0,50,0,0)
	f.p.skills["spikeTrap"] = 1
	_emit("upgrade",["spikeTrap",f,"direct"])

func _test_fuse() -> void:
	for key in S.PAIRS.FUSE_PAIRS:
		for level in [1,9,20]:
			for funds in [S.star(key)*3-1,S.star(key)*3,S.star(key)*3+1]:
				var f := _fixture(0,1,funds,0)
				var ids := S.members(key)
				for id in ids: f.p.skills[id] = level
				for i in range(6): f.slots[i] = ids[i % ids.size()]
				f.ultimate = ids[-1]
				_emit("fuse",[key,f,"guarded",false])
				_emit("fuse",[key,f,"direct",false])
				_emit("fuse",[key,f,"guarded",true])
		var f := _fixture(0)
		_emit("fuse",[key,f,"guarded",false])
		_emit("fuse",[key,f,"direct",false])
		for id in S.members(key): f.p.skills[id] = 1
		f.p._fused[key] = true
		_emit("fuse",[key,f,"guarded",false])
		_emit("fuse",[key,f,"direct",false])
	var f := _fixture(20,999,5,0)
	var before: Dictionary = f.duplicate(true)
	_check(not FUSE.preview("whirlDet",f,"direct").value.applied,"refund cannot fund upfront SP gate")
	_check(f == before,"failed upfront gate has no borrowed writes")
	_emit("fuse",["unknown",_fixture(),"direct",false])
	var storm := FUSE.preview("stormBeam",_fixture(1),"guarded")
	_check(storm.value.fixture.p.skills.hellRay == 1 and storm.value.fixture.p.skills.peaceShield == 1,"storm unlocks both hidden skills")
	_check(storm.value.fixture.p.activeMagicSk == "fireball","fixed active never enters applicable fixture patch")
	_check(storm.value.protected_active_proposals.activeMagicSk == "hellRay","source fixed change is a data proposal")

func _test_refund() -> void:
	for sk in S.CATALOG.SKILLS:
		for level in [0,1,2,10,20]:
			var f := _fixture(0,999,0,0)
			f.p.skills[sk.id] = level
			f.slots = [sk.id,null,sk.id,null,null,null]
			f.ultimate = sk.id
			_emit("minus",[sk.id,f])
			_emit("reset",[sk.id,f,false])
			_emit("reset",[sk.id,f,true])
	for key in S.PAIRS.FUSE_PAIRS:
		var f := _fixture(9,999,0,0)
		f.p._fused[key] = true
		for id in S.members(key):
			_emit("minus",[id,f])
			if key != "shieldFuse":
				_emit("reset",[id,f,false])
				_emit("reset",[id,f,true])
		var unequal: Dictionary = f.duplicate(true)
		unequal.p.skills[S.members(key)[0]] = 1
		for id in S.members(key): _emit("minus",[id,unequal])
		if key != "shieldFuse": _emit("reset",[S.members(key)[-1],unequal,true])
	var overlap := _fixture(9,999,0,0)
	overlap.p._fused["infernoSlam"] = true
	overlap.p._fused["pillarSlam"] = true
	overlap.p._fused["unknownFlag"] = true
	_emit("minus",["giantSlam2",overlap])
	_emit("reset",["giantSlam2",overlap,false])
	_emit("reset",["giantSlam2",overlap,true])
	var all := _fixture(9,999,0,0)
	for key in S.PAIRS.FUSE_PAIRS: all.p._fused[key] = true
	for id in ["chargeBoost","whirlwind","holyDome","giantSlam2","maliceHunt","voidScarecrow"]:
		_emit("minus",[id,all])
		_emit("reset",[id,all,true])
	var base := _fixture(0)
	base.p.skills["spikeTrap"] = 1
	_check(not REFUND.reset_preview("spikeTrap",base,true).value.applied,"free base Lv1 retained")
	base.p.skills["spikeTrap"] = 3
	var reset := REFUND.reset_preview("spikeTrap",base,true)
	_check(reset.value.fixture.p.skills.spikeTrap == 1 and reset.value.fixture.p.sp == base.p.sp + 2,"free base returns upgrades only")
	_check(reset.value.fixture.g.mats == base.g.mats,"normal reset returns no malice")
	var shield := _fixture(2)
	shield.p._fused["shieldFuse"] = true
	_nr(REFUND.reset_preview("maliceSwipe",shield,true),"protected wing-strike reset HOLD")

func _test_batch_recommend() -> void:
	for player_level in [1,49,50,449,949,950]:
		for funds in [0,1,2,10,100,9999]:
			_emit("batch",[_fixture(1,player_level,funds,0)])
	for key in S.PAIRS.FUSE_PAIRS:
		for funds in [2,8,100,9999]:
			var f := _fixture(1,999,funds,0)
			f.p._fused[key] = true
			_emit("batch",[f])
	var all := _fixture(1)
	for key in S.PAIRS.FUSE_PAIRS: all.p._fused[key] = true
	_emit("batch",[all])
	for player_level in [1,299,300,499,500,699,700,999]:
		for funds in [0,10,100,500,9999]:
			for mats in [0,49,50,9999]:
				var f := _fixture(0,player_level,funds,mats)
				for demo in [false,true]: _emit("recommend",[f,demo])
	var picked := _fixture()
	picked.p.skills["lavaSummon"] = 1
	_emit("recommend",[picked,false])
	var result := BATCH.recommend_preview(_fixture(),false)
	var again: Dictionary = BATCH.recommend_preview(_shadow(result.value),false)
	_check(again.value.details.learned == 0 and again.value.details.fused == 0,"repeat recommendation adds no cost")
	_check(again.value.fixture.p.sp == result.value.fixture.p.sp,"repeat SP unchanged")
	_check(again.value.fixture.g.mats == result.value.fixture.g.mats,"repeat malice unchanged")
	_emit("recommend",[_shadow(result.value),false])
	_check(result.value.details.learned > 0 and result.value.details.fused > 0,"recommend has real learning and fusions")
	_check(result.value.fixture.p.skills.blackStar == 1,"pick first ultimate when none owned")
	var large := _fixture(20,999,9007199254740991,9007199254740991)
	_emit("recommend",[large,false])
	_emit("reset",["darkPillar",large,true])
	_emit("fuse",["dimBlast",large,"direct",false])

func _test_boundaries() -> void:
	var f := _fixture()
	for bad in [null,{}, {"p":{},"g":{},"slots":[],"ultimate":null}]: _nr(LEARN.preview("spikeTrap",bad),"missing fixture state")
	for bad in [null,&"spikeTrap","constructor","unknown"]: _nr(LEARN.preview(bad,f),"unsupported/unregistered ID")
	for value in [-1,21,1.5,"1",true,NAN,INF]:
		var bad: Dictionary = f.duplicate(true)
		bad.p.skills["spikeTrap"] = value
		_nr(UP.context("spikeTrap",bad),"unsupported level")
	var bad: Dictionary = f.duplicate(true)
	bad.p.skills = {&"spikeTrap":1}
	_nr(LEARN.preview("spikeTrap",bad),"StringName skill map")
	bad = f.duplicate(true)
	bad.p._fused = {"whirlDet":1}
	_nr(FUSE.preview("whirlDet",bad),"nonbool completed flag")
	var before: Dictionary = f.duplicate(true)
	var skills_ref: Dictionary = f.p.skills
	var fused_ref: Dictionary = f.p._fused
	var slots_ref: Array = f.slots
	for call in [LEARN.preview("spikeTrap",f),FUSE.preview("stormBeam",f,"direct"),REFUND.reset_preview("darkPillar",f,true),BATCH.recommend_preview(f)]:
		_check(call.status == "READY","copy packet ready")
		for field in S.ACTIVE_FIELDS: _check(call.value.fixture.p.get(field) == f.p.get(field),"protected field unchanged " + field)
		call.value.fixture.p.skills.clear()
		call.value.fixture.slots[0] = "mutated"
		call.value.protected_active_proposals.clear()
	_check(f == before,"borrowed fixture unchanged despite output edits")
	_check(is_same(f.p.skills,skills_ref) and is_same(f.p._fused,fused_ref) and is_same(f.slots,slots_ref),"borrowed nested identity unchanged")

func _shadow(value: Dictionary) -> Dictionary:
	var f: Dictionary = value.fixture.duplicate(true)
	for field in value.protected_active_proposals: f.p[field] = value.protected_active_proposals[field]
	return f # Owned oracle fixture only; no actual owner is ever bound.

func _emit(method: String,args: Array) -> Variant:
	var result: Dictionary
	match method:
		"learn_gate": result = LEARN.ui_gate.callv(args)
		"learn": result = LEARN.preview.callv(args)
		"context": result = UP.context.callv(args)
		"upgrade": result = UP.preview.callv(args)
		"fuse": result = FUSE.preview.callv(args)
		"minus": result = REFUND.minus_preview.callv(args)
		"reset": result = REFUND.reset_preview.callv(args)
		"batch": result = BATCH.batch_preview.callv(args)
		"recommend": result = BATCH.recommend_preview.callv(args)
	_check(result.get("status") == "READY","oracle ready " + method)
	if result.get("status") != "READY":
		printerr("SK_S05_UNREADY ",JSON.stringify(result))
		return null
	var value: Variant = result.value
	if method not in ["learn_gate","context"]:
		value = {"fixture":_shadow(result.value)}
		if method == "batch": value["counts"] = result.value.details
		if method == "recommend": value["counts"] = result.value.details
	oracle_rows += 1
	# Preserve actual _fused key insertion order for minus/reset tie tests.
	var row := {"method":method,"args":args,"value":value}
	if method not in ["learn_gate","context"]:
		var sp_bits := PackedByteArray()
		var mat_bits := PackedByteArray()
		sp_bits.resize(8)
		mat_bits.resize(8)
		sp_bits.encode_double(0,float(value.fixture.p.sp))
		mat_bits.encode_double(0,float(value.fixture.g.mats))
		row["currency_bits"] = {"sp":sp_bits.hex_encode(),"mats":mat_bits.hex_encode()}
	print("SK_S05_ORACLE_ROW ",JSON.stringify(row,"",false))
	return value

func _check(ok: bool,label: String) -> void:
	assertions += 1
	groups[active_group] = groups.get(active_group,0) + 1
	if not ok:
		failures += 1
		printerr("SK_S05_FAIL ",label)

func _nr(packet: Dictionary,label: String) -> void:
	_check(packet.get("status") == "NOT_READY" and packet.has("reason") and not packet.has("value"),label)

func _finish() -> void:
	print("SK_S05_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_rows":oracle_rows,"groups":groups,"skipped":[],"main_boots":0,"user_dir":OS.get_user_data_dir()}))
	quit(0 if failures == 0 else 1)
