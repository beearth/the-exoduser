extends Node
## Explicit source file-init/current-state holder for one newly constructed Player.
## SOURCE_BOOT inputs stay unchanged. No bootstrap run, external ack, formula,
## actor writes, grit reset, stage publication, save IO or automatic clock.

const BOOTSTRAP = preload("res://port_modules/native_new_run_bootstrap_source/producer.gd")
const STARTER_FACTORY = preload("res://port_modules/starter_item_factory_source/producer.gd")
const SOURCE_RESOURCES = preload("res://scripts/native_source_resource_authority.gd")
const EXP_GATE = preload("res://scripts/native_meta_exp_gate_policy.gd")
const EXP_CURVE = preload("res://scripts/native_source_meta_exp_curve.gd")
signal native_level_up_handoff(packet: Dictionary)
const CLAIM_META = "native_source_new_run_state_owner"
const INITIALIZED_META = "native_source_new_run_state_initialized"
const RESOURCE_FIELDS = ["st", "mst", "stR", "mp", "mmp", "mpR"]
const LINEAGE = "new_run/source_file_init_owned_state"
const MISSING_MAIN_STEPS = ["actual_starter_15_equipment_and_10_bag",
	"resource_parameters_apply_stats_and_recalc_st", "hp_parameters_and_hpR",
	"full_bootstrap_external_steps_and_stage_publication"]
const INITIALIZATION_PACKET_SOURCES = {
	"apply_stats_effective_stats": "game.html:28566-28570",
	"apply_stats_base_attack_early": "game.html:28587-28588",
	"apply_stats_base_attack_crystal": "game.html:28602",
	"apply_stats_health_initial": "game.html:28567-28592",
	"apply_stats_health_crystal_mhp": "game.html:28601",
	"apply_stats_health_crystal_hpR": "game.html:28605",
	"apply_stats_health_fortify": "game.html:28616-28617",
	"apply_stats_def_speed_early": "game.html:28583-28590",
	"apply_stats_def_speed_crystal": "game.html:28603-28604",
	"apply_stats_def_speed_armor": "game.html:28619-28620",
	"apply_stats_poise_init": "game.html:28584-28586",
	"apply_stats_shield": "game.html:28622-28623",
	"apply_stats_resource_parameters": "game.html:28564-28614",
	"recalc_st_resource_parameters": "game.html:16933-16940"}
const INITIALIZATION_WRITE_SOURCES = {
	"apply_stats_effective_stats": {"_effStats": ["game.html:28570"]},
	"apply_stats_base_attack_early": {"baseAtk": ["game.html:28588"]},
	"apply_stats_base_attack_crystal": {"baseAtk": ["game.html:28602"]},
	"apply_stats_health_initial": {"mhp": ["game.html:28582"], "hpR": ["game.html:28592"]},
	"apply_stats_health_crystal_mhp": {"mhp": ["game.html:28601"], "hp": ["game.html:28601"]},
	"apply_stats_health_crystal_hpR": {"hpR": ["game.html:28605"]},
	"apply_stats_health_fortify": {"mhp": ["game.html:28617"], "hp": ["game.html:28617"]},
	"apply_stats_def_speed_early": {"baseDef": ["game.html:28583"], "speed": ["game.html:28589"], "_oocSpeed": ["game.html:28590"]},
	"apply_stats_def_speed_crystal": {"baseDef": ["game.html:28603"], "speed": ["game.html:28604"]},
	"apply_stats_def_speed_armor": {"baseDef": ["game.html:28620"]},
	"apply_stats_poise_init": {"maxPoise": ["game.html:28584"], "poise": ["game.html:28585"], "poiseR": ["game.html:28586"]},
	"apply_stats_shield": {"mshield": ["game.html:28622"], "shield": ["game.html:28623"]},
	"apply_stats_resource_parameters": {"stR": ["game.html:28591", "game.html:28607", "game.html:28614"],
		"mmp": ["game.html:28593", "game.html:28608", "game.html:28611"],
		"mpR": ["game.html:28594", "game.html:28606", "game.html:28611"],
		"mp": ["game.html:28608", "game.html:28611"], "_crystalStats": ["game.html:28600"]},
	"recalc_st_resource_parameters": {"mst": ["game.html:16939"], "st": ["game.html:16939"]}}
const INITIALIZATION_ACTOR_FIELDS = ["hp", "mhp", "baseDef", "speed", "maxPoise", "poise", "poiseR"]
const INITIALIZATION_PASS_KINDS = ["apply_stats_health_initial", "apply_stats_health_crystal_mhp",
	"apply_stats_health_crystal_hpR", "apply_stats_health_fortify", "apply_stats_def_speed_early",
	"apply_stats_def_speed_crystal", "apply_stats_def_speed_armor"]
const INITIALIZATION_HEALTH_KINDS = ["apply_stats_health_initial", "apply_stats_health_crystal_mhp",
	"apply_stats_health_crystal_hpR", "apply_stats_health_fortify"]

var _player: Node2D
var _world: Node
var _resources: Node
var _g: Dictionary = {}
var _stats: Dictionary = {}
var _passives: Dictionary = {}
var _inventory: Dictionary = {}
var _p: Dictionary = {}
var _source_packets: Dictionary = {}
var _initialized = false
var _initializing = false
var _last_error = "not_initialized"
var _initial_starter_attempted = false
var _initial_starter_running = false
var _initial_starter_completed = false
var _initial_starter_result: Dictionary = {}
var _initial_starter_ledger: Dictionary = {}
var _initial_starter_equipped_count = 0
var _initial_starter_bag_count = 0
var _source_initializer: WeakRef
var _source_initializer_world_parent: WeakRef
var _source_initializer_world_had_parent = false
var _source_initializer_state_parent: WeakRef
var _source_initializer_state_had_parent = false
var _source_initializer_bound = false
var _source_initializer_binding = false
var _source_initializer_committing = false
var _source_initializer_seen: Array = []
var _source_initializer_writes: Array[Dictionary] = []
var _source_initializer_rejections = 0

func _init() -> void:
	set_process(false)
	set_physics_process(false)

static func source_boot_p() -> Dictionary:
	# Original mkP literal, game.html:29655-29669. hpR is absent before applyStats.
	# This packet describes the constructor; it never claims current/derived.
	return {"status": "SOURCE_BOOT", "source": "game.html:29655-29669 mkP()",
		"phase": "pre_applyStats", "current": false, "derived": false,
		"values": {
			"x": 0, "y": 0, "r": 15, "hp": 350, "mhp": 350,
			"st": 200, "mst": 200, "stR": 0.28, "mp": 160, "mmp": 160, "mpR": 0,
			"lv": 1, "exp": 0, "maxExp": 15, "sp": 0, "ap": 0,
			"baseAtk": 8, "baseDef": 2, "speed": 2.6, "facing": 0,
			"s": "idle", "st2": 0, "atkArc": 0, "swProg": 0,
			"iframes": 0, "combo": 0, "comboT": 0, "blockFlash": 0, "blockPushT": 0,
			"chargeDx": 0, "chargeDy": 0, "chargeSpd": 0, "chargeHits": null,
			"chargeKills": 0, "chargeCd": 0, "chargeStocks": 1, "maxChargeStocks": 1,
			"kb": {"x": 0, "y": 0}, "shield": 0, "mshield": 0,
			"shieldRegenT": 0, "wwAng": 0, "rage": 0,
			"activeChargeSk": "charge", "activeBowSk": "normal",
			"activeTechSk": "giantSlam", "activeMagicSk": "fireball",
			"activeLMBSk": "kiSlash", "activeRMBSk": "maliceSwipe",
			"activeQSk": "parry", "activeCtSk": "ghostWalk",
			"skills": {"kiSlash": 1, "fireball": 1, "bladeDash": 1,
				"maliceSwipe": 1, "shieldThrow": 1},
			"_fused": {"shieldFuse": true}, "maskOn": true}}

func initialize_new_run(player: Node2D, world: Node, source_resources: Node) -> bool:
	if _initialized or _initializing:
		return _fail("already_initialized_or_reentrant")
	_initializing = true
	var error = _constructor_error(player, world, source_resources)
	if not error.is_empty():
		_initializing = false
		return _fail(error)
	# Use original producers; do not mutate their SOURCE_BOOT/current=false packets.
	var packets = {
		"g_file_init": BOOTSTRAP.source_boot_g(),
		"stats_file_init": BOOTSTRAP.source_boot_stats(),
		"passives_file_init": BOOTSTRAP.source_boot_passives(),
		"inventory_fresh_reset": BOOTSTRAP.source_fresh_reset_inv(),
		"stats_fresh_reset": BOOTSTRAP.source_fresh_reset_stats(),
		"p_constructor": source_boot_p()}
	for key in packets:
		var packet: Dictionary = packets[key]
		if packet.get("status") != "SOURCE_BOOT" or packet.get("current") != false \
				or packet.get("derived") != false or not packet.get("values") is Dictionary:
			_initializing = false
			return _fail("invalid_original_constructor_packet:" + key)
	# The constructors above have no callbacks. Validate again before installation.
	error = _constructor_error(player, world, source_resources)
	if not error.is_empty():
		_initializing = false
		return _fail(error)
	_player = player
	_world = world
	_resources = source_resources
	_source_packets = packets.duplicate(true)
	_g = packets["g_file_init"]["values"].duplicate(true)
	# P2-001e — 새 게임 G 할당(63956): G.mats=_loadSharedMats()||1000. 공유 악의
	# 저장소(_loadSharedMats 48527, localStorage)는 미이식 → 0||1000 = 기본 1000 경로.
	_g["mats"] = 1000
	_stats = packets["stats_fresh_reset"]["values"].duplicate(true)
	_passives = packets["passives_file_init"]["values"].duplicate(true)
	_inventory = packets["inventory_fresh_reset"]["values"].duplicate(true)
	_p = packets["p_constructor"]["values"].duplicate(true)
	_player.set_meta(CLAIM_META, weakref(self))
	# Persistent even if this holder is later freed. No silent second initializer.
	_player.set_meta(INITIALIZED_META, true)
	_initialized = true
	_initializing = false
	_last_error = ""
	return true

func get_native_new_run_player() -> Node2D:
	return _player if _live(_player) else null

func get_native_new_run_world() -> Node:
	return _world if _live(_world) else null

func is_native_new_run_state_ready() -> bool:
	return _current_error().is_empty() and is_inside_tree() \
		and _player.is_inside_tree() and _world.is_inside_tree() \
		and get_parent() == _world and get_tree() == _world.get_tree() \
		and _player.get_tree() == _world.get_tree() and _world.get("player") == _player \
		and _resources.is_native_source_resources_ready()

func read_current_g() -> Variant:
	return _g if _current_error().is_empty() else null

func read_current_stats() -> Variant:
	return _stats if _current_error().is_empty() else null

func read_current_passives() -> Variant:
	return _passives if _current_error().is_empty() else null

func read_current_inventory() -> Variant:
	return _inventory if _current_error().is_empty() else null

func commit_native_q_fields(owner: Node, fields: Dictionary) -> bool:
	if not _current_error().is_empty() or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_state")!=self or owner.get("world")!=_world or get_tree().paused:
		return false
	for field in fields:
		if field=="_qDetonateFired":
			if not fields[field] is bool:return false
		elif field not in ["_sbCd","_sbHoldT","_sbReleaseR","_sbParryT","parryT","st2","parryBank","_sdHold","_kgChg","_kgTier","_sBashChgMul","_atkBon","_stWingT","_stCd"] or not (fields[field] is int or fields[field] is float) or not is_finite(float(fields[field])):
			return false
	for field in fields:_p[field]=fields[field]
	return true

func commit_native_e_wave_state(owner: Node, waves: Array, counter: int) -> bool:
	if not _current_error().is_empty() or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_state")!=self or owner.get("world")!=_world or get_tree().paused or counter<0 or counter>20:return false
	_g["_stProjs"]=waves
	_g["_gcT"]=counter
	return true

# ═══ P1-002.E: 기본 근접 hurtE의 G 효과 owner 쓰기 ═══
# hurtE가 갱신하는 G 필드만 화이트리스트로 허용 (42357/42388/42702/42714/42756/43103).
const NORMAL_HURTE_G_NUMERIC: Array[String] = ["kills", "_stageKills", "combo",
	"comboTimer", "comboMax", "_chainCnt", "_chainT", "mats",
	"slowMo"] # P1-002.G: 그로기 슬로모(19996) — 소비자 미이식, G 기록만
const NORMAL_HURTE_G_DICT: Array[String] = ["_dmgPeak", "_dmgPeakShow"]

# P2-005c — G._fireZones 커밋(45517 push·46713 push·37389s 틱/만료 재배열).
# 존은 lazy 생성(45516 if(!G._fireZones)G._fireZones=[]) — 부트 '_fireZones 부재' 단정 보존.
# 리젠 단계(holy_dome_*_source)·main Q쿨(1683)·향후 소비자는 이 키를 읽기만 한다.
func commit_native_fire_zones(owner: Node, zones: Array) -> bool:
	if not _feel_owner_current(owner):
		return false
	for zone in zones:
		if not zone is Dictionary:
			return false
	_g["_fireZones"] = zones
	return true


func apply_native_normal_enemy_hurte_g_writes(owner: Node, writes: Array) -> Dictionary:
	if not _current_error().is_empty() or not is_instance_valid(owner) \
			or owner != _player.get_parent() or owner.get("source_state") != self \
			or owner.get("world") != _world or get_tree().paused:
		return {"applied": false, "reason": "actual_normal_hurte_g_owner_not_current"}
	for write in writes:
		if not write is Dictionary or not write.get("field") is String or not write.has("value"):
			return {"applied": false, "reason": "normal_hurte_g_write_shape"}
		var field: String = write["field"]
		var value: Variant = write["value"]
		if field == "rifts_append":
			if not value is Dictionary or not _g.get("rifts") is Array:
				return {"applied": false, "reason": "normal_hurte_g_rifts_unsupported"}
		elif field in NORMAL_HURTE_G_NUMERIC:
			if not (value is int or value is float) or not is_finite(float(value)):
				return {"applied": false, "reason": "normal_hurte_g_value_unsupported:" + field}
		elif field in NORMAL_HURTE_G_DICT:
			if not value is Dictionary:
				return {"applied": false, "reason": "normal_hurte_g_value_unsupported:" + field}
		else:
			return {"applied": false, "reason": "normal_hurte_g_field_unsupported:" + field}
	for write in writes:
		if write["field"] == "rifts_append":
			_g["rifts"].append(write["value"])
		else:
			_g[write["field"]] = write["value"]
	return {"applied": true, "count": writes.size()}

# ═══ P2-001h: 인트로 커튼 시퀀스 G owner — 원본 63283 G._intro=true;G.on=false /
# 63413 G.on=true / 63440 G._intro=null. stage0 흐름에서 G.on 점등은 커튼 오픈 소관:
# update clock(P1-002.D)의 phase_g_on(32580 if(!G.on)return)과 G.stageTime 진행이
# 이 쓰기부터 열린다. 파일 초기값 on=false(bootstrap source_boot_g)와 초기화 계약
# "pre-stage on=false"는 시퀀스 미기동 상태 그대로 유효하다.
func apply_native_intro_curtain_g_writes(owner: Node, step: String) -> Dictionary:
	if not _current_error().is_empty() or not is_instance_valid(owner) 			or not owner.is_inside_tree() or get_tree().paused 			or owner.get("world") != _world or owner.get("player") != _player:
		return {"applied": false, "reason": "intro_curtain_g_owner_not_current"}
	var script: Script = owner.get_script() as Script
	if script == null or script.resource_path != "res://scripts/native_intro_curtain_sequence.gd":
		return {"applied": false, "reason": "intro_curtain_g_owner_script_mismatch"}
	match step:
		"begin":   # 63283 G._intro=true;G.on=false
			_g["_intro"] = true
			_g["on"] = false
		"open":    # 63413 G.on=true
			_g["on"] = true
		"dispose": # 63440 G._intro=null
			_g["_intro"] = null
		_:
			return {"applied": false, "reason": "intro_curtain_g_step_unsupported:" + step}
	return {"applied": true, "on": _g.get("on"), "intro": _g.get("_intro")}

# ═══ P3-002: 소환굴 G owner — genFromTemplate 30681 G.spawnHoles=spawnHoles · 30625
# G._totalSpawned=Σ_spawnHoleCount · 35690 완료 shake(5+~~(size*9))(19924 G.shake=max(G.shake,
# n*OPT.shake/100)). spawnHoles는 원본처럼 한 배열(소환 시스템이 원소 갱신·splice)이다.
func apply_native_spawn_hole_g_writes(owner: Node, writes: Dictionary) -> Dictionary:
	if not _current_error().is_empty() or not is_instance_valid(owner) \
			or not owner.is_inside_tree() or get_tree().paused \
			or owner.get("world") != _world or owner.get("player") != _player:
		return {"applied": false, "reason": "spawn_hole_g_owner_not_current"}
	var script: Script = owner.get_script() as Script
	if script == null or script.resource_path != "res://scripts/native_spawn_hole_system.gd":
		return {"applied": false, "reason": "spawn_hole_g_owner_script_mismatch"}
	for field in writes:
		var value: Variant = writes[field]
		match field:
			"spawnHoles":
				if not value is Array:
					return {"applied": false, "reason": "spawn_hole_g_value_unsupported:spawnHoles"}
			"_totalSpawned":
				if not value is int or value < 0:
					return {"applied": false, "reason": "spawn_hole_g_value_unsupported:_totalSpawned"}
			"shake":
				if not (value is int or value is float) or not is_finite(float(value)) or float(value) < 0.0:
					return {"applied": false, "reason": "spawn_hole_g_value_unsupported:shake"}
			_:
				return {"applied": false, "reason": "spawn_hole_g_field_unsupported:" + str(field)}
	for field in writes:
		if field == "shake":
			_g["shake"] = maxf(_feel_num(_g.get("shake")), float(writes[field]))
		else:
			_g[field] = writes[field]
	return {"applied": true, "count": writes.size()}

# ═══ P2-001a: 타격 피드백 G owner — 피해 숫자 펌프·히트스톱(원본 비활성)·셰이크 ═══
# 프레임 예산 카운터(원본 전역 _txtPerFrame/_impPerFrame, 61848 리셋·42397 증가·25415 증가).
# 임팩트 시스템 미이식 → _imp_per_frame는 리셋만 되고 0 유지(원문 min(4,12-0)=4).
const SRC_TXT_BUDGET := 12 # 25413 _TXT_BUDGET
var _txt_per_frame: int = 0
var _imp_per_frame: int = 0

func _feel_owner_current(owner: Node) -> bool:
	return _current_error().is_empty() and is_instance_valid(owner) \
		and owner == _player.get_parent() and owner.get("source_state") == self \
		and owner.get("world") == _world and not get_tree().paused

static func _feel_num(value: Variant) -> float:
	return float(value) if (value is int or value is float) and is_finite(float(value)) else 0.0

# frame() 61848 카운터 리셋 + 61851~61868 단발뎀 텍스트 펌프 + _dmgTxts 수명 틱.
# 반환 emit = addTxt(x, y-40, pfx+dmg, col, crit?70:50, crit?72:56, String(dmg)) 요청 1건 | null.
func apply_native_damage_peak_text_pump(owner: Node) -> Dictionary:
	if not _feel_owner_current(owner):
		return {"applied": false, "reason": "actual_feel_g_owner_not_current"}
	_txt_per_frame = 0 # 61848 _txtPerFrame=0
	_imp_per_frame = 0 # 61848 _impPerFrame=0
	var emit: Variant = null
	var peak: Variant = _g.get("_dmgPeakShow")
	if peak is Dictionary:
		if not _g.get("_dmgTxts") is Array:
			_g["_dmgTxts"] = []
		var gate: Array = _g["_dmgTxts"]
		if gate.size() >= 1: # 기존 것보다 크면 교체, 아니면 무시 (61855~61858)
			if _feel_num(peak.get("dmg")) > _feel_num(gate[0].get("dmg")):
				gate.clear()
			else:
				peak = null
	if peak is Dictionary:
		var crit: bool = peak.get("crit") == true
		var dmg: int = int(_feel_num(peak.get("dmg")))
		_g["_dmgTxts"].append({"dmg": peak.get("dmg"), "t": 50, "crit": crit}) # _life=50 (0.83초)
		emit = {"x": _feel_num(peak.get("x")), "y": _feel_num(peak.get("y")) - 40.0,
			"text": ("💀" if crit else "⚔") + str(dmg), # sz>=28 + numStr → 아틀라스 숫자만 렌더(44520 분기)
			"color": "#dd2200" if crit else "#ffcc33",
			"life": 70 if crit else 50, "size": 72 if crit else 56, "num_str": str(dmg)}
	_g["_dmgPeakShow"] = null
	if _g.get("_dmgTxts") is Array: # 61869 수명 틱·압축
		var kept: Array = []
		for entry in _g["_dmgTxts"]:
			entry["t"] = _feel_num(entry.get("t")) - 1
			if _feel_num(entry["t"]) > 0.0:
				kept.append(entry)
		_g["_dmgTxts"] = kept
	return {"applied": true, "emit": emit}

# hurtE dmg>0 블록의 42397(_txtPerFrame++)·42398(_overBudget)·42416(히트스톱/셰이크).
# 42399~42411 피 파티클·42417 임팩트는 미이식(해당 표 기록) — 카운터·G 쓰기만 소유.
func apply_native_hurte_hit_feel(owner: Node, opt_shake: float) -> Dictionary:
	if not _feel_owner_current(owner) or not is_finite(opt_shake):
		return {"applied": false, "reason": "actual_feel_g_owner_not_current"}
	_txt_per_frame += 1 # 42397
	var over_budget: bool = _txt_per_frame > SRC_TXT_BUDGET # 42398
	# 42415: G._flashCol='#ffffff'; G._flashT=0.08 (화면 플래시 — 소비자 55113, P2-001b).
	_g["_flashCol"] = "#ffffff"
	_g["_flashT"] = 0.08
	if not over_budget: # 42416
		if not (_feel_num(_g.get("_noHitStopT")) > 0.0):
			_g["hitStop"] = maxf(_feel_num(_g.get("hitStop")), 5.0)
		var shake_n: float = minf(4.0, 12.0 - float(_imp_per_frame))
		_g["shake"] = maxf(_feel_num(_g.get("shake")), shake_n * opt_shake / 100.0) # shake() 19924
	return {"applied": true, "over_budget": over_budget, "shake": _g.get("shake", 0)}

# P2-001b — 25415: _addImpact 진입의 _impPerFrame++ (실카운트). noFlash 인자는
# 호출부(42418)가 증가 전 값으로 계산하므로 pre/post 둘 다 반환한다.
func increment_native_impact_counter(owner: Node) -> Dictionary:
	if not _feel_owner_current(owner):
		return {"applied": false, "reason": "actual_feel_g_owner_not_current"}
	var pre: int = _imp_per_frame
	_imp_per_frame += 1
	return {"applied": true, "pre": pre, "post": _imp_per_frame}

# P2-001b — 55113: 화면 플래시 감쇠 `G._flashT-=_dtSp` (렌더 프레임마다, 소비자 측).
func apply_native_screen_flash_decay(owner: Node, dt: float) -> Dictionary:
	if not _feel_owner_current(owner) or not is_finite(dt) or dt <= 0.0:
		return {"applied": false, "reason": "actual_feel_g_owner_not_current"}
	if _feel_num(_g.get("_flashT")) > 0.0:
		_g["_flashT"] = _feel_num(_g["_flashT"]) - dt
	return {"applied": true, "flash_t": _g.get("_flashT", 0)}

# updateCrescents 19838~19840: step3 → G.hitStop=max(,6)+shake(8), 그 외 G.hitStop=max(,3).
# P2-005c — 19924 shake(n): G.shake=max(G.shake, n×OPT.shake/100). OPT.shake 기본 100.
# 플래시·히트스톱 없는 순수 셰이크(스킬 시전 연출: spikeTrap shake(4)·holyDome shake(3)).
func apply_native_skill_shake(owner: Node, n: float) -> Dictionary:
	if not _feel_owner_current(owner) or not is_finite(n):
		return {"applied": false, "reason": "actual_feel_g_owner_not_current"}
	_g["shake"] = maxf(_feel_num(_g.get("shake")), n * 100.0 / 100.0)
	return {"applied": true, "shake": _g.get("shake", 0)}


func apply_native_crescent_hit_feel(owner: Node, step: int, opt_shake: float) -> Dictionary:
	if not _feel_owner_current(owner) or not is_finite(opt_shake):
		return {"applied": false, "reason": "actual_feel_g_owner_not_current"}
	if step == 3:
		_g["hitStop"] = maxf(_feel_num(_g.get("hitStop")), 6.0)
		_g["shake"] = maxf(_feel_num(_g.get("shake")), 8.0 * opt_shake / 100.0)
	else:
		_g["hitStop"] = maxf(_feel_num(_g.get("hitStop")), 3.0)
	return {"applied": true, "shake": _g.get("shake", 0), "hit_stop": _g.get("hitStop")}

# update 32584~32586(히트스톱 소비 — 원문 32585 `G.hitStop=0` 완전 비활성 그대로)
# + 35751 셰이크 감쇠(_hsActive 상시 false → sp 사용).
func apply_native_update_feel_decay(owner: Node, sp: float) -> Dictionary:
	if not _feel_owner_current(owner) or not is_finite(sp) or sp <= 0.0:
		return {"applied": false, "reason": "actual_feel_g_owner_not_current"}
	if _feel_num(_g.get("_noHitStopT")) > 0.0: # 32584
		_g["hitStop"] = 0
		_g["slowMo"] = 0
		_g["_noHitStopT"] = _feel_num(_g["_noHitStopT"]) - sp
	_g["hitStop"] = 0 # 32585 히트스톱 완전 비활성 (디아블로/POE 스타일 — 원문 주석)
	if _feel_num(_g.get("hitStop")) > 12.0: # 32586 (위 줄로 도달 불가 — 원문 유지)
		_g["hitStop"] = 12
	if _feel_num(_g.get("shake")) > 0.0: # 35751
		_g["shake"] = _feel_num(_g["shake"]) * pow(0.86, sp)
		if _feel_num(_g["shake"]) < 0.3:
			_g["shake"] = 0
	return {"applied": true, "shake": _g.get("shake", 0), "hit_stop": _g.get("hitStop", 0)}

# ═══ P2-001c: 처치 보상 owner — addPotion(28250)·addExp(43134)·드랍 레코드 ═══
var _native_drop_records: Array = []
# 결정/소켓석 최소 owner (원본 CRYSTAL_BAG/STONE_BAG — 캡 9999, HUD/합성 소비자는 미이식).
var _native_crystal_bag: Array = []
var _native_stone_bag: Array = []

func apply_native_drop_bags(owner: Node, crystal: Variant, stone: Variant) -> Dictionary:
	if not _feel_owner_current(owner):
		return {"applied": false, "reason": "actual_reward_owner_not_current"}
	if crystal is Dictionary:
		_native_crystal_bag.append(crystal)
	if stone is Dictionary:
		_native_stone_bag.append(stone)
	return {"applied": true, "crystal_bag": _native_crystal_bag.size(), "stone_bag": _native_stone_bag.size()}

func read_native_reward_bags() -> Dictionary:
	return {"crystal": _native_crystal_bag, "stone": _native_stone_bag} if _current_error().is_empty() else {}

# addPotion(type,count) — 28250~28263. 'hp' → 즉시 악의 전환(G.mats), 그 외는 POT에
# 없어 버림(원문 2026-10-10 폐지 주석). 반환 texts는 원문 addTxt 인자.
# P2-001e — initStage 진입 자원 풀충전(31567): hp/st/mp는 자원 authority 경유,
# 쉴드는 P dict 소유(P.shield=P.mshield). 31567의 나머지(s='idle'/iframes 360/kb 리셋/
# 상태이상 클리어)는 신규 부팅 경로에선 초기값과 동일 — 스테이지 '전환' 소비자는 미이식 기록.
func apply_native_stage_entry_refill(owner: Node) -> Dictionary:
	if not _feel_owner_current(owner):
		return {"applied": false, "reason": "actual_stage_entry_owner_not_current"}
	var refill: Dictionary = _resources.commit_native_stage_entry_refill(owner)
	if refill.get("accepted") != true:
		return {"applied": false, "reason": str(refill.get("reason"))}
	_p["hp"] = refill["hp"]
	_p["st"] = refill["st"]
	_p["mp"] = refill["mp"]
	_p["shield"] = _p.get("mshield", 0)
	return {"applied": true, "hp": _p["hp"], "st": _p["st"], "mp": _p["mp"],
		"shield": _p["shield"], "mshield": _p.get("mshield", 0),
		"unported": ["initStage_31567_나머지(상태리셋)·스테이지전환_재호출"]}

# P2-005a — 새 게임 시작 스킬·슬롯 (로컬 새 게임 경로 63993~64014):
# ① 난이도 시작 스킬 63994~63998 — _diffSigned()=OPT.diff(5)−5=0 → <1/<2/<3 전부 참:
#    giantSlam(+SKILL_SLOTS[4])·holyDome(+[5])·spikeTrap
# ② 기본 강제 64002~64007 — _ensureBaseWingStrike(3483: maliceSwipe/shieldThrow≥1·
#    _fused.shieldFuse=true·activeRMBSk='maliceSwipe') + kiSlash/spikeTrap/holyDome/
#    giantSlam/iceOrb ≥1
# ③ 새 게임 슬롯 64010~64014 — activeCtSk='iceOrb', SKILL_SLOTS에서 holyDome/giantSlam
#    제거 후 _fs(0,'spikeTrap')/_fs(4,'giantSlam')/_fs(5,'holyDome')
# SKILL_SLOTS(27681 전역 6칸)·ULT_SLOT(27682 null)의 포트 보관처 = 이 P dict의
# "skillSlots"/"ultSlot" (원본 전역 — 소유 위치 기록). 스킬 발동 로직은 범위 밖:
# 지급·표시 전용이며 미구현 스킬 키는 기존대로 무반응(player space_rage_slot_not_connected).
# P2-005b — 스킬 시전 악의 소비 (46454: G.mats -= _malCost(20)=10). 게이트는 호출측.
# DEMO11-16: one live cost entry. Material validation precedes resource writes.
func commit_native_skill_dispatch_cost(owner: Node, st_cost: float, mp_cost: float, mats_cost: int) -> Dictionary:
	if not _feel_owner_current(owner) or mats_cost < 0 or int(_feel_num(_g.get("mats"))) < mats_cost:
		return {"accepted":false,"reason":"skill_dispatch_material_or_owner_gate"}
	var spent: Dictionary = _resources.commit_native_skill_dispatch_spend(owner,st_cost,mp_cost)
	if spent.get("accepted") != true: return spent
	_g["mats"] = int(_feel_num(_g.get("mats"))) - mats_cost
	return {"accepted":true,"st_spent":st_cost,"mp_spent":mp_cost,"mats_spent":mats_cost}


# DEMO11-17: event-driven skill ledger; no caller-supplied applicable patch.
var _skill_management_busy := false
var _skill_management_serial := 0
var _skill_management_committed: Dictionary = {}

func read_native_skill_management_snapshot() -> Dictionary:
	var actual: Variant=read_current_p()
	if not actual is Dictionary: return {}
	const S=preload("res://port_modules/skill_management_source/core_support.gd")
	var p: Dictionary={}
	for key in ["lv","sp","skills","_fused","exp","maxExp"]+S.ACTIVE_FIELDS:
		if actual.has(key): p[key]=actual[key]
	return {"p":p.duplicate(true),"g":{"mats":_g.get("mats")},
		"slots":actual.get("skillSlots",[]).duplicate(true),"ultimate":actual.get("ultSlot")}

# DEMO11-18: readonly fusion model is rooted in this actual State and demo boot.
func read_native_skill_fusion(owner: Node, key: String) -> Dictionary:
	if not _current_error().is_empty() or not is_instance_valid(owner) or owner!=_player.get_parent() \
		or owner.get("source_state")!=self or owner.get("world")!=_world:
		return {"status":"NOT_READY","reason":"actual_fusion_owner_unavailable"}
	var boot: Dictionary=owner.read_native_demo_policy()
	if boot.get("status")!="READY" or boot.get("demo")!=true or boot.get("build_target")!="demo":
		return {"status":"NOT_READY","reason":"actual_demo_fusion_policy_required"}
	return preload("res://scripts/native_skill_fusion.gd").inspect(key,read_native_skill_management_snapshot())


func commit_native_skill_management(owner: Node, command: Dictionary) -> Dictionary:
	var rejected: Dictionary={"accepted":false,"committed":false,"prefix":[]}
	# Source K/L handlers have no G.paused guard. UI data transactions may run
	# while the SceneTree is paused; combat/resource spend APIs keep their guards.
	if _skill_management_busy or not _current_error().is_empty() or not is_instance_valid(owner) \
		or owner != _player.get_parent() or owner.get("source_state") != self or owner.get("world") != _world:
		rejected["reason"]="actual_skill_management_owner_or_reentry_gate";return rejected
	for key in command:
		if key not in ["request_id","action","skill_id","confirmed"]:
			rejected["reason"]="unsupported_command_field";return rejected
	var id: Variant=command.get("request_id")
	if not id is String or id.is_empty() or id.length()>96 or not command.get("action") is String \
		or not command.get("skill_id") is String or not command.get("confirmed",false) is bool:
		rejected["reason"]="invalid_skill_command";return rejected
	if _skill_management_committed.has(id):
		var old: Dictionary=_skill_management_committed[id]
		if old.command!=command: rejected["reason"]="request_id_conflict";return rejected
		var replay: Dictionary=old.result.duplicate(true);replay["replayed"]=true;return replay
	const LEARN=preload("res://port_modules/skill_management_source/learn.gd")
	const UP=preload("res://port_modules/skill_management_source/upgrade.gd")
	const REFUND=preload("res://port_modules/skill_management_source/refund.gd")
	const S=preload("res://port_modules/skill_management_source/core_support.gd")
	_skill_management_busy=true
	var before: Dictionary=read_native_skill_management_snapshot()
	var prepared: Dictionary=S.prepare(before)
	if prepared.status!="READY":
		_skill_management_busy=false;rejected["reason"]=prepared.reason;return rejected
	var plan: Dictionary
	match command.action:
		"learn_up":
			plan=UP.preview(command.skill_id,before,"ui") if S.lv(before.get("p",{}),command.skill_id)>=1 else LEARN.preview(command.skill_id,before,"ui")
		"fuse":
			var live: Dictionary=read_native_skill_fusion(owner,command.skill_id)
			plan=preload("res://scripts/native_skill_fusion.gd").preview(command.skill_id,before) if live.status=="READY" else live
		"minus": plan=REFUND.minus_preview(command.skill_id,before)
		"reset": plan=REFUND.reset_preview(command.skill_id,before,command.get("confirmed",false))
		_:
			_skill_management_busy=false;rejected["reason"]="unsupported_skill_action";return rejected
	if plan.get("status")!="READY" or not plan.value.applied:
		_skill_management_busy=false
		rejected["reason"]=plan.get("reason",plan.get("value",{}).get("branch","policy_not_ready"))
		rejected["policy"]=plan.duplicate(true);return rejected
	var value: Dictionary=plan.value
	# Only approved policy projections can reach the live writer. XP/lv/AP/HP and
	# combat bodies are never replaced by the copied fixture.
	for field in value.protected_active_proposals:
		if not S.ACTIVE_FIELDS.has(field) or not S.supported_id(value.protected_active_proposals[field]):
			_skill_management_busy=false;rejected["reason"]="unsupported_active_projection";return rejected
	(_p["skills"] as Dictionary).assign(value.fixture.p.skills)
	_p["sp"]=value.fixture.p.sp
	_g["mats"]=value.fixture.g.mats
	(_p["_fused"] as Dictionary).assign(value.fixture.p._fused)
	for field in value.protected_active_proposals: _p[field]=value.protected_active_proposals[field]
	(_p["skillSlots"] as Array).assign(value.fixture.slots)
	_p["ultSlot"]=value.fixture.ultimate
	_skill_management_serial+=1
	var result: Dictionary={"accepted":true,"committed":true,"status":"COMMITTED","request_id":id,
		"serial":_skill_management_serial,"branch":value.branch,"before":before,
		"after":read_native_skill_management_snapshot(),"active_proposals":value.protected_active_proposals.duplicate(true),
		"prefix":["ledger","active_selection","slots"],"runtime_writer":"actual_current_State","saved":false}
	if command.action=="fuse" or value.branch in ["fusion_reset","fusion_minus","fusion_upgraded"]:
		result["fusion_combat_handoff"]={"status":"HOLD","damage_execution":false,"shield_execution":false,
			"requested":command.skill_id,"fusion_key":command.skill_id if command.action=="fuse" else value.details.get("key",value.details.get("fusion_key")),
			"source":"_execFuse / _skResetSkill ledger boundary; combat owner not called"}
	_skill_management_committed[id]={"command":command.duplicate(true),"result":result.duplicate(true)}
	if _skill_management_committed.size()>32: _skill_management_committed.erase(_skill_management_committed.keys()[0])
	_skill_management_busy=false
	return result


func apply_native_skill_cast_cost(owner: Node, mats_cost: int) -> Dictionary:
	if not _feel_owner_current(owner) or mats_cost < 0:
		return {"applied": false, "reason": "actual_skill_cost_owner_not_current"}
	var mats: int = int(_feel_num(_g.get("mats")))
	if mats < mats_cost:
		return {"applied": false, "reason": "insufficient_mats"}
	_g["mats"] = mats - mats_cost
	return {"applied": true, "mats": _g["mats"], "spent": mats_cost}


func apply_native_new_game_starting_skills(owner: Node) -> Dictionary:
	if not _feel_owner_current(owner):
		return {"applied": false, "reason": "actual_starting_skills_owner_not_current"}
	var skills: Dictionary = _p["skills"]
	skills["maliceSwipe"] = maxi(1, int(_feel_num(skills.get("maliceSwipe"))))
	skills["shieldThrow"] = maxi(1, int(_feel_num(skills.get("shieldThrow"))))
	(_p["_fused"] as Dictionary)["shieldFuse"] = true
	_p["activeRMBSk"] = "maliceSwipe"
	for skill_id in ["kiSlash", "spikeTrap", "holyDome", "giantSlam", "iceOrb"]:
		if int(_feel_num(skills.get(skill_id))) < 1:
			skills[skill_id] = 1
	_p["activeCtSk"] = "iceOrb"
	_p["skillSlots"] = ["spikeTrap", null, null, null, "giantSlam", "holyDome"]
	_p["ultSlot"] = null # 27682 — 신규 필살기 미배정
	return {"applied": true, "skills": skills.keys(), "skill_slots": _p["skillSlots"],
		"active_ct": _p["activeCtSk"],
		"unported": ["스킬 발동 로직(spikeTrap/giantSlam/holyDome/iceOrb 실행자 — 지급·표시만)",
			"난이도 ≠0 분기(63994~63998 — 부호 난이도 0 고정 경로)"]}

func apply_native_add_potion(owner: Node, type: String, count: int) -> Dictionary:
	if not _feel_owner_current(owner) or count < 1:
		return {"applied": false, "reason": "actual_reward_owner_not_current"}
	if type == "hp":
		_g["mats"] = int(_feel_num(_g.get("mats"))) + count
		# SFX.pickup: 오디오 에셋 미복사 — 미이식 기록 (보고 목록).
		return {"applied": true, "accepted": true, "mats": _g["mats"],
			"texts": [{"dx": 0.0, "dy": -20.0, "text": "+%d" % count, "color": "#cc66ff", "life": 25}],
			"unported": ["SFX.pickup"]}
	return {"applied": true, "accepted": false} # POT에 'hp'만 존재(27677) → 버림

# addExp(v) — 43134~43176. v는 호출측(실행자)이 43140~43144(1/3·expBonus)까지 적용한
# 최종값. 레벨업: sp+3/2렙당 ap+1(43153~43155), 20% 회복(43160 — 자원 authority 경유),
# 300/700 스킬 해금(43169~43171). 미이식: SFX.levelup·showPH·_levelUpVfx(연출),
# DEMO11-20: demo defaults true like G16646. DEMO11-01 supplies the actual
# build mode through configure_native_demo_exp_mode once its owner is current.
# Save/UI effects are explicit handoffs; no serializer, IO or passive investment.
var _native_demo_exp_mode := true
var _native_add_exp_active := false
var _native_level_up_serial := 0
var _native_level_up_last: Dictionary = {}

func configure_native_demo_exp_mode(owner: Node, demo_mode: bool) -> bool:
	if not _feel_owner_current(owner) or _native_add_exp_active:
		return false
	_native_demo_exp_mode = demo_mode
	return true

func read_native_level_up_handoff() -> Dictionary:
	return _native_level_up_last.duplicate(true) if _current_error().is_empty() else {}

func _native_exp_result(levels: int, ap_gain: int, texts: Array, gate_reason: String) -> Dictionary:
	return {"applied": true, "exp": _p.get("exp"), "lv": _p.get("lv"), "max_exp": _p.get("maxExp"),
		"levels": levels, "ap_gain": ap_gain, "sp": _p.get("sp"), "ap": _p.get("ap"), "texts": texts,
		"demo_mode": _native_demo_exp_mode, "gate_reason": gate_reason,
		"handoff": _native_level_up_last.duplicate(true) if levels > 0 else {},
		"unported": ["SFX.levelup", "showPH_LEVEL_UP", "_levelUpVfx", "dbSaveForce_IO:DEMO11-06_owner_pending", "passive_queue:DEMO11-19_owner_pending"]}

func apply_native_add_exp(owner: Node, final_value: int) -> Dictionary:
	if not _feel_owner_current(owner) or final_value < 0 or _native_add_exp_active:
		return {"applied": false, "reason": "actual_reward_owner_not_current"}
	_native_add_exp_active = true
	# Only demo cap adoption: the pre-existing non-demo transcendence HOLD below
	# remains unchanged. No new daily clock or date/count writes in this unit.
	if _native_demo_exp_mode:
		var entry: Dictionary = EXP_GATE.entry_gate(_p, true, "")
		_p["exp"] = entry["state"]["exp"]
		if not entry["allowed"]:
			_native_add_exp_active = false
			return _native_exp_result(0, 0, [], str(entry["reason"]))
	_p["exp"] = int(_feel_num(_p.get("exp"))) + final_value
	var levels := 0
	var ap_gain := 0
	var gate_reason := ""
	while int(_feel_num(_p.get("exp"))) >= int(_feel_num(_p.get("maxExp"))):
		if _native_demo_exp_mode:
			var loop: Dictionary = EXP_GATE.loop_gate(_p, true, "")
			_p["exp"] = loop["state"]["exp"]
			if not loop["allowed"]:
				gate_reason = str(loop["reason"])
				break
		# 1000렙 초월 게이트(43138/43148): lv<1000 구간 — 미도달. 도달 시 미이식 정지.
		if int(_feel_num(_p.get("lv"))) >= 1000:
			_native_add_exp_active = false
			return {"applied": false, "reason": "unported_branch_active:transcend_level_gate"}
		_p["lv"] = int(_feel_num(_p.get("lv"))) + 1
		levels += 1
		_p["exp"] = int(_feel_num(_p.get("exp"))) - int(_feel_num(_p.get("maxExp")))
		var lv: float = _feel_num(_p.get("lv"))
		_p["maxExp"] = EXP_CURVE.required_exp(int(lv))
		_p["sp"] = int(_feel_num(_p.get("sp"))) + 3
		if int(lv) % 2 == 0:
			_p["ap"] = int(_feel_num(_p.get("ap"))) + 1
			ap_gain += 1
	var texts: Array = []
	if levels > 0:
		var heal: Dictionary = _resources.commit_native_level_up_heal(owner) if _resources.has_method("commit_native_level_up_heal") else {"accepted": false}
		if heal.get("accepted") != true:
			_native_add_exp_active = false
			return {"applied": false, "reason": "level_heal_authority_refused"}
		var demonic := _feel_num(_passives.get("pDemon")) > _feel_num(_passives.get("pHuman"))
		var level_color := "#d38aff" if demonic else "#ffdd00"
		var lv_text: String = "SP +%d" % (levels * 3)
		if ap_gain > 0:
			lv_text += " AP +%d" % ap_gain
		texts.append({"dx": 0.0, "dy": -40.0, "text": lv_text, "color": level_color, "life": 60}) # G43161–43165
		for unlock in [[300, "blueShot"], [700, "burstLoop"], [700, "voidScarecrow"]]: # 43169~43171
			if int(_feel_num(_p.get("lv"))) >= int(unlock[0]) and not (_p.get("skills") as Dictionary).has(unlock[1]):
				(_p["skills"] as Dictionary)[unlock[1]] = 1
		_native_level_up_serial += 1
		_native_level_up_last = {"serial": _native_level_up_serial, "lv": _p["lv"],
			"exp": _p["exp"], "maxExp": _p["maxExp"], "sp": _p["sp"], "ap": _p["ap"],
			"levels": levels, "heal": heal.duplicate(true),
			"presentation": {"title": "TRANSCEND!" if int(_p["lv"]) > 1000 else "LEVEL UP!",
				"color": level_color, "duration_ms": 2500, "demonic": demonic, "source_line": 43162},
			"save": {"requested": true, "committed": false, "method": "dbSaveForce", "source_line": 43171}}
		# Once after recovery/unlocks, even for multi-level XP. Signal observers
		# receive detached data and cannot reenter addExp or change mode mid-grant.
		native_level_up_handoff.emit(_native_level_up_last.duplicate(true))
	_native_add_exp_active = false
	return _native_exp_result(levels, ap_gain, texts, gate_reason)

# rollDrop 레코드 owner — 원본 worldItems(_wiPush 16721: 20개 초과 시 최저 rarity 축출).
func append_native_drop_records(owner: Node, records: Array) -> Dictionary:
	if not _feel_owner_current(owner):
		return {"applied": false, "reason": "actual_reward_owner_not_current"}
	for record in records:
		_native_drop_records.append(record)
		while _native_drop_records.size() > 20: # _wiPush 축출 규칙
			var min_index := 0
			var min_rarity := INF
			for i in range(_native_drop_records.size()):
				var item: Variant = (_native_drop_records[i] as Dictionary).get("item")
				var rarity: float = float((item as Dictionary).get("rarity", 0)) if item is Dictionary else -1.0
				if rarity < min_rarity:
					min_rarity = rarity
					min_index = i
			_native_drop_records[min_index] = _native_drop_records[-1]
			_native_drop_records.resize(_native_drop_records.size() - 1)
	return {"applied": true, "count": _native_drop_records.size()}

func read_native_drop_records() -> Array:
	return _native_drop_records if _current_error().is_empty() else []

func read_current_p() -> Variant:
	if not _current_error().is_empty():
		return null
	var parameters: Dictionary = _resources.read_current_resource_parameters()
	if not _parameters_valid(parameters):
		return null
	# Sync actual fields into the same owned P reference. Never refill a resource
	# or write Player fields; remaining source fields retain the installed literal.
	_p["hp"] = _player.hp
	_p["mhp"] = _player.max_hp
	_p["r"] = _player.radius
	_p["s"] = _player.state
	_p["x"] = _player.global_position.x
	_p["y"] = _player.global_position.y
	_p["iframes"] = _player.iframes
	_p["facing"] = (_player.facing as Vector2).angle()
	for field in RESOURCE_FIELDS:
		_p[field] = parameters["values"][field]
	# Preserve raw mkP key absence until its original approved initialization write.
	if _player.has_method("read_native_source_initialization_fields"):
		var actual: Variant = _player.read_native_source_initialization_fields()
		if actual is Dictionary:
			for field in INITIALIZATION_ACTOR_FIELDS:
				if _p.has(field) and actual.has(field):
					_p[field] = actual[field]
	return _p

func bind_native_source_initialization(owner: Object) -> bool:
	if _source_initializer_bound or _source_initializer_binding or _source_initializer_committing:
		return _fail("source_initializer_already_bound_or_reentrant")
	_source_initializer_binding = true
	var error = _source_initialization_lifecycle_error()
	if error.is_empty() and not _live(owner):
		error = "source_initializer_owner_missing"
	if error.is_empty():
		for method in ["get_native_source_initialization_player", "get_native_source_initialization_world",
				"get_native_source_initialization_write_tag", "is_native_source_initialization_active"]:
			if not owner.has_method(method):
				error = "source_initializer_contract_missing:" + method
				break
	if error.is_empty() and (owner.get_native_source_initialization_player() != _player \
			or owner.get_native_source_initialization_world() != _world):
		error = "source_initializer_actor_world_mismatch"
	if not error.is_empty():
		_source_initializer_binding = false
		return _fail(error)
	_source_initializer = weakref(owner)
	_source_initializer_world_had_parent = _world.get_parent() != null
	_source_initializer_world_parent = weakref(_world.get_parent()) if _source_initializer_world_had_parent else null
	_source_initializer_state_had_parent = get_parent() != null
	_source_initializer_state_parent = weakref(get_parent()) if _source_initializer_state_had_parent else null
	_source_initializer_bound = true
	_source_initializer_binding = false
	return true

func commit_native_source_initialization_write(packet: Dictionary, write_index: int) -> bool:
	if _source_initializer_binding or _source_initializer_committing:
		return _reject_initialization_write("source_initializer_reentrant")
	_source_initializer_committing = true
	var error = _source_initialization_write_error(packet, write_index)
	if not error.is_empty():
		_source_initializer_committing = false
		return _reject_initialization_write(error)
	var write: Dictionary = packet["writes"][write_index]
	var field: String = write["field"]
	var value: Variant = write["value"]
	var accepted = false
	if INITIALIZATION_ACTOR_FIELDS.has(field):
		accepted = _player.has_method("commit_native_source_initialization_field") \
			and _player.commit_native_source_initialization_field(field, value)
		if accepted:
			var actual: Variant = _player.read_native_source_initialization_fields()
			accepted = actual is Dictionary and actual.has(field) and actual[field] == value
			if accepted:
				_p[field] = actual[field]
	elif RESOURCE_FIELDS.has(field):
		accepted = _resources.commit_native_source_initialization_write(packet, write_index)
		if accepted:
			var parameters: Dictionary = _resources.read_current_resource_parameters()
			accepted = _parameters_valid(parameters) and parameters["values"][field] == value
			if accepted:
				_p[field] = parameters["values"][field]
	else:
		# Dictionary fields are fresh owned source values, not fallback defaults.
		_p[field] = value.duplicate(true) if value is Dictionary else value
		accepted = _p[field] == value
	if not accepted:
		_source_initializer_committing = false
		return _reject_initialization_write("source_initializer_destination_rejected:" + field)
	var tag = _initialization_tag(packet, write)
	_source_initializer_seen.append(tag.duplicate())
	_source_initializer_writes.append({"kind": tag["kind"], "pass_id": tag["pass_id"],
		"field": field, "source": write["source"], "write_index": write_index,
		"value": value.duplicate(true) if value is Dictionary else value})
	_source_initializer_committing = false
	_last_error = ""
	return true

func _source_initialization_lifecycle_error() -> String:
	var error = _current_error()
	if not error.is_empty():
		return error
	if _initializing or _initial_starter_running or _player.is_inside_tree() \
			or _player.is_node_ready() or _player.get_parent() != null:
		return "source_initializer_requires_new_unparented_pre_tree_player"
	if _world.is_inside_tree() and _world.get_tree().paused:
		return "source_initializer_world_paused"
	if _source_initializer_bound:
		if _source_initializer_world_had_parent:
			if not _live(_source_initializer_world_parent) \
					or not _live(_source_initializer_world_parent.get_ref()) \
					or _world.get_parent() != _source_initializer_world_parent.get_ref():
				return "source_initializer_world_reparented"
		elif _world.get_parent() != null:
			return "source_initializer_world_reparented"
		if _source_initializer_state_had_parent:
			if not _live(_source_initializer_state_parent) \
					or not _live(_source_initializer_state_parent.get_ref()) \
					or get_parent() != _source_initializer_state_parent.get_ref():
				return "source_initializer_holder_reparented"
		elif get_parent() != null:
			return "source_initializer_holder_reparented"
	return ""

func _source_initialization_write_error(packet: Dictionary, write_index: int) -> String:
	var error = _source_initialization_lifecycle_error()
	if not error.is_empty():
		return error
	if not _source_initializer_bound or not _live(_source_initializer):
		return "source_initializer_unbound"
	var owner: Variant = _source_initializer.get_ref()
	if not _live(owner) or owner.get_native_source_initialization_player() != _player \
			or owner.get_native_source_initialization_world() != _world:
		return "source_initializer_owner_lost_or_mismatched"
	var active: Variant = owner.is_native_source_initialization_active()
	if not active is bool or not active:
		return "source_initializer_not_in_synchronous_write_phase"
	var kind: Variant = packet.get("kind")
	if not kind is String or not INITIALIZATION_PACKET_SOURCES.has(kind) \
			or packet.get("source") != INITIALIZATION_PACKET_SOURCES[kind]:
		return "source_initializer_packet_kind_or_source_denied"
	if INITIALIZATION_PASS_KINDS.has(kind) \
			and (not packet.get("pass_id") is int or packet["pass_id"] < 1):
		return "source_initializer_original_pass_id_missing"
	if not INITIALIZATION_PASS_KINDS.has(kind) and packet.has("pass_id"):
		return "source_initializer_no_pass_packet_was_modified"
	if not packet.get("writes") is Array or write_index < 0 or write_index >= packet["writes"].size():
		return "source_initializer_write_index_invalid"
	var write: Variant = packet["writes"][write_index]
	if not write is Dictionary or not write.get("field") is String \
			or not write.get("source") is String or not write.has("value"):
		return "source_initializer_original_write_missing"
	var field: String = write["field"]
	var whitelist: Dictionary = INITIALIZATION_WRITE_SOURCES[kind]
	if not whitelist.has(field) or not whitelist[field].has(write["source"]):
		return "source_initializer_field_or_anchor_denied"
	if field == "_effStats":
		if not _initialization_numeric_object(write["value"], ["str", "dex", "int", "vit", "lck"]):
			return "source_initializer_effective_stats_invalid"
	elif field == "_crystalStats":
		if not _initialization_numeric_object(write["value"], SOURCE_RESOURCES.PARAMETERS.CR_INIT_KEYS):
			return "source_initializer_crystal_stats_invalid"
	elif not _number(write["value"]):
		return "source_initializer_numeric_value_invalid"
	var tag = _initialization_tag(packet, write)
	var actual_tag: Variant = owner.get_native_source_initialization_write_tag()
	if not actual_tag is Dictionary or actual_tag.size() != tag.size():
		return "source_initializer_tag_invalid"
	for key in tag:
		if not actual_tag.has(key) or actual_tag[key] != tag[key]:
			return "source_initializer_tag_mismatch:" + key
	if _source_initializer_seen.has(tag):
		return "source_initializer_duplicate_write"
	if INITIALIZATION_HEALTH_KINDS.has(kind) or kind == "apply_stats_effective_stats":
		if not write.get("before_present") is bool \
				or write["before_present"] != _p.has(field) or not write.has("before"):
			return "source_initializer_before_presence_mismatch"
		var current: Variant = read_current_p()
		if not current is Dictionary:
			return "source_initializer_current_player_lost"
		if write["before_present"] and current[field] != write["before"]:
			return "source_initializer_before_value_mismatch"
	if not _live(owner):
		return "source_initializer_owner_lost_during_validation"
	return _source_initialization_lifecycle_error()

# PC-RUNTIME-STATS — runtime applyStats batch sink for the P-dict fields that
# have no actor/resource owner. Constructor seam above is unchanged. Only the
# actual Main-owned refresh module, inside its synchronous commit window.
const RUNTIME_STAT_REFRESH_PATH = "res://scripts/native_source_player_runtime_stat_refresh.gd"
const RUNTIME_STAT_REFRESH_P_FIELDS = ["_effStats", "baseAtk", "hpR", "_oocSpeed", "_crystalStats", "mshield", "shield"]
var _runtime_stat_commits := 0

func validate_native_runtime_stat_refresh(owner: Node, refresh: Object, fields: Dictionary) -> String:
	var error := _current_error()
	if not error.is_empty():
		return error
	if _initializing or _source_initializer_committing or not is_instance_valid(owner) \
			or owner != _player.get_parent() or owner.get("source_state") != self or owner.get("world") != _world:
		return "state_runtime_refresh_owner_mismatch"
	if not _live(refresh) or refresh.get_script() == null \
			or refresh.get_script().resource_path != RUNTIME_STAT_REFRESH_PATH \
			or owner.get("source_runtime_stat_refresh") != refresh:
		return "state_runtime_refresh_module_mismatch"
	var window: Variant = refresh.is_native_runtime_stat_refresh_committing(owner)
	if not window is bool or not window:
		return "state_runtime_refresh_not_in_commit_window"
	for field in fields:
		if field not in RUNTIME_STAT_REFRESH_P_FIELDS:
			return "state_runtime_refresh_field_denied:" + str(field)
		var value: Variant = fields[field]
		if field == "_effStats":
			if not _initialization_numeric_object(value, ["str", "dex", "int", "vit", "lck"]):
				return "state_runtime_refresh_effective_stats_invalid"
		elif field == "_crystalStats":
			if not _initialization_numeric_object(value, SOURCE_RESOURCES.PARAMETERS.CR_INIT_KEYS):
				return "state_runtime_refresh_crystal_stats_invalid"
		elif not _number(value):
			return "state_runtime_refresh_value_invalid:" + str(field)
	if fields.has("shield") and float(fields["shield"]) > float(fields.get("mshield", _p.get("mshield", 0))):
		return "state_runtime_refresh_shield_above_mshield"
	return ""

func commit_native_runtime_stat_refresh(owner: Node, refresh: Object, fields: Dictionary) -> Dictionary:
	var error := validate_native_runtime_stat_refresh(owner, refresh, fields)
	if not error.is_empty():
		return {"accepted": false, "reason": error}
	for field in fields:
		var value: Variant = fields[field]
		_p[field] = value.duplicate(true) if value is Dictionary else value
	_runtime_stat_commits += 1
	return {"accepted": true, "fields": fields.keys(), "commits": _runtime_stat_commits}

static func _initialization_tag(packet: Dictionary, write: Dictionary) -> Dictionary:
	return {"field": write["field"], "source": write["source"], "kind": packet["kind"],
		"pass_id": packet["pass_id"] if packet.has("pass_id") else 1}

static func _initialization_numeric_object(value: Variant, keys: Array) -> bool:
	if not value is Dictionary or value.keys() != keys:
		return false
	for key in keys:
		if not _number(value[key]):
			return false
	return true

func _reject_initialization_write(error: String) -> bool:
	_source_initializer_rejections += 1
	return _fail(error)

func run_native_initial_starter_items(random_unit: Callable, now_ms: Callable) -> Dictionary:
	if _initial_starter_attempted:
		return {"status": "ALREADY_ATTEMPTED", "reason": "initial_starter_once_claim",
			"result": _initial_starter_result.duplicate(true)}
	# Any first attempt is sticky, including invalid bindings or partial failure.
	# No source RNG/clock has been called at this point.
	_initial_starter_attempted = true
	var error = _starter_context_error()
	if error.is_empty() and (not random_unit.is_valid() or not now_ms.is_valid()):
		error = "initial_starter_provider_missing"
	if error.is_empty():
		error = _starter_inventory_error(true)
	if not error.is_empty():
		return _finish_starter_error(error)
	var factory = STARTER_FACTORY.new({"random_unit": random_unit, "now_ms": now_ms,
		"player_level": Callable(self, "_read_owned_player_level"),
		"equip_slot": Callable(self, "_equip_initial_starter_slot"),
		"append_bag": Callable(self, "_append_initial_starter_bag")})
	_initial_starter_running = true
	# Original order: mkItem x15, equip x15, then (mkItem -> bag) x10.
	# The original producer owns RNG/Date.now/UID and item formulas unchanged.
	var result: Dictionary = factory.run_new_game_starter_items()
	_initial_starter_running = false
	_initial_starter_ledger = factory.get_ledger()
	_initial_starter_result = result
	_initial_starter_completed = result.get("status") == STARTER_FACTORY.READY \
		and _initial_starter_equipped_count == 15 and _initial_starter_bag_count == 10 \
		and _starter_context_error().is_empty()
	if not _initial_starter_completed and result.get("status") == STARTER_FACTORY.READY:
		_initial_starter_result = {"status": STARTER_FACTORY.NOT_READY,
			"reason": "initial_starter_completion_or_lifecycle_mismatch",
			"equipped": result.get("equipped", []), "bag": result.get("bag", []),
			"factory_result": result}
	_last_error = "" if _initial_starter_completed else String(_initial_starter_result.get("reason", ""))
	# Preserve factory item references in the initial result as well as INV.
	# get_snapshot/repeated-attempt reporting provide isolated history copies.
	return _initial_starter_result

func _read_owned_player_level() -> Variant:
	if not _initial_starter_running or not _starter_context_error().is_empty():
		# null means original P.lv undefined and could synthesize a level fallback.
		# A lost actual holder must instead fail the producer's provider shape gate.
		return {"status": "NOT_READY", "reason": "initial_starter_current_player_lost"}
	return _p["lv"]

func _equip_initial_starter_slot(slot: String, item: Dictionary) -> bool:
	if not _initial_starter_running or not _starter_context_error().is_empty() \
			or not _starter_inventory_error(false).is_empty():
		return false
	var equipped: Dictionary = _inventory["equipped"]
	if not equipped.has(slot) or item.get("slot") != slot:
		return false
	equipped[slot] = item
	if not is_same(equipped[slot], item):
		return false
	_initial_starter_equipped_count += 1
	return true

func _append_initial_starter_bag(item: Dictionary) -> bool:
	if not _initial_starter_running or not _starter_context_error().is_empty() \
			or not _starter_inventory_error(false).is_empty():
		return false
	var bag: Array = _inventory["bag"]
	bag.append(item)
	if not is_same(bag.back(), item):
		return false
	_initial_starter_bag_count += 1
	return true

func _starter_context_error() -> String:
	var error = _current_error()
	if not error.is_empty():
		return error
	if _player.is_inside_tree() or _player.is_node_ready():
		return "initial_starter_player_already_entered_tree"
	if not _number(_p.get("lv")):
		return "initial_starter_current_player_level_missing"
	return ""

func _starter_inventory_error(require_reset: bool) -> String:
	if not _inventory.get("equipped") is Dictionary or not _inventory.get("bag") is Array:
		return "initial_starter_actual_inventory_missing"
	var equipped: Dictionary = _inventory["equipped"]
	if equipped.size() != BOOTSTRAP.EQUIPPED_SLOTS.size():
		return "initial_starter_actual_17_slots_missing"
	for slot in BOOTSTRAP.EQUIPPED_SLOTS:
		if not equipped.has(slot):
			return "initial_starter_actual_slot_missing:" + slot
		if require_reset and equipped[slot] != null:
			return "initial_starter_inventory_already_equipped"
	if require_reset and not _inventory["bag"].is_empty():
		return "initial_starter_inventory_bag_not_reset"
	return ""

func _finish_starter_error(error: String) -> Dictionary:
	_last_error = error
	_initial_starter_result = {"status": STARTER_FACTORY.NOT_READY,
		"reason": error, "equipped": [], "bag": []}
	return _initial_starter_result

func _missing_main_steps() -> Array:
	var missing = MISSING_MAIN_STEPS.duplicate()
	if _initial_starter_completed:
		missing.erase("actual_starter_15_equipment_and_10_bag")
	return missing

func get_snapshot() -> Dictionary:
	var error = _current_error()
	return {"initialized": _initialized, "ready": is_native_new_run_state_ready(),
		"error": error if not error.is_empty() else _last_error,
		"lineage": LINEAGE, "current_installed": error.is_empty(),
		"phase": "source_initialization_partial" if not _source_initializer_writes.is_empty() else "pre_applyStats",
		"main_initialization_ready": false,
		"main_full_ready": false, "derived_parameters_ready": false,
		"missing_main_steps": _missing_main_steps(),
		"source_boot_inputs": _source_packets.duplicate(true),
		"current_g": _copy_current(read_current_g()),
		"current_stats": _copy_current(read_current_stats()),
		"current_passives": _copy_current(read_current_passives()),
		"current_inventory": _copy_current(read_current_inventory()),
		"current_p": _copy_current(read_current_p()),
		"hpR_present": _p.has("hpR"), "fire_zones_present": _g.has("_fireZones"),
		"initial_starter_attempted": _initial_starter_attempted,
		"initial_starter_running": _initial_starter_running,
		"initial_starter_completed": _initial_starter_completed,
		"initial_starter_result": _initial_starter_result.duplicate(true),
		"initial_starter_ledger": _initial_starter_ledger.duplicate(true),
		"initial_starter_equipped_count": _initial_starter_equipped_count,
		"initial_starter_bag_count": _initial_starter_bag_count,
		"source_initializer_bound": _source_initializer_bound,
		"source_initializer_committing": _source_initializer_committing,
		"source_initializer_writes": _source_initializer_writes.duplicate(true),
		"source_initializer_rejections": _source_initializer_rejections,
		"source_initializer_remaining_source_scope": ["original prefix single loop/lvB1", "full G/stage/FRESH bootstrap"],
		"raw_grit_owned": false, "bootstrap_run": false,
		"external_steps_accepted": 0, "stage_published": false,
		"automatic_physics": false, "automatic_input": false,
		"restore_fallback": false, "missing_upstream_manufactured": false}

func _constructor_error(player: Node2D, world: Node, resources: Node) -> String:
	if not _live(self) or not _live(player) or not _live(world) or not _live(resources):
		return "missing_live_new_run_nodes"
	if player.is_inside_tree() or player.is_node_ready():
		return "player_already_entered_tree"
	if player.has_meta(CLAIM_META) or player.has_meta(INITIALIZED_META):
		return "player_already_has_new_run_state"
	if get_parent() != null and get_parent() != world:
		return "holder_has_foreign_parent"
	if not player.has_method("get_combat_world") or player.get_combat_world() != world:
		return "new_run_player_world_mismatch"
	if world.get("player") != null and world.get("player") != player:
		return "world_has_other_player"
	return _actual_fields_error(player, world, resources)

func _current_error() -> String:
	if not _initialized or not _live(self) or not _live(_player) \
			or not _live(_world) or not _live(_resources):
		return "missing_initialized_new_run_state"
	if get_parent() != null and get_parent() != _world:
		return "holder_reparented"
	var initialized_claim: Variant = _player.get_meta(INITIALIZED_META, null)
	if not initialized_claim is bool or not initialized_claim:
		return "new_run_initialized_claim_missing"
	var claim: Variant = _player.get_meta(CLAIM_META, null)
	if not _live(claim) or not claim is WeakRef or claim.get_ref() != self:
		return "new_run_actor_claim_mismatch"
	if not _player.has_method("get_combat_world") or _player.get_combat_world() != _world:
		return "current_player_world_mismatch"
	if _world.get("player") != null and _world.get("player") != _player:
		return "world_has_other_player"
	# Once the actual actor enters the Tree, every read requires live same-Tree
	# placement. The pre-Tree constructor read seam does not become a fallback.
	if _player.is_inside_tree():
		if not is_inside_tree() or not _world.is_inside_tree() \
				or get_parent() != _world or get_tree() != _world.get_tree() \
				or _player.get_tree() != _world.get_tree() or _world.get("player") != _player \
				or not _resources.is_native_source_resources_ready():
			return "current_tree_ownership_mismatch"
	elif _player.is_node_ready():
		return "player_removed_from_tree"
	return _actual_fields_error(_player, _world, _resources)

static func _actual_fields_error(player: Node2D, world: Node, resources: Node) -> String:
	if resources.get_script() != SOURCE_RESOURCES \
			or resources.get_native_regen_player() != player or resources.get_native_regen_world() != world:
		return "actual_resource_authority_mismatch"
	if resources.get_parent() != null and resources.get_parent() != world:
		return "resource_authority_reparented"
	if not player.get("state") is String or not player.global_position.is_finite() \
			or not player.get("facing") is Vector2 or not player.facing.is_finite():
		return "missing_current_actual_player_state"
	for field in ["hp", "max_hp", "radius", "iframes"]:
		if not _number(player.get(field)):
			return "missing_current_actual_player_field:" + field
	if not _parameters_valid(resources.read_current_resource_parameters()):
		return "current_source_resources_not_ready"
	return ""

static func _parameters_valid(packet: Dictionary) -> bool:
	if packet.get("status") != "READY" or packet.get("current") != true \
			or not packet.get("values") is Dictionary:
		return false
	for field in RESOURCE_FIELDS:
		if not _number(packet["values"].get(field)):
			return false
	return true

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _copy_current(value: Variant) -> Variant:
	return value.duplicate(true) if value is Dictionary else null

func _fail(error: String) -> bool:
	_last_error = error
	return false

# Only these fixed fireball actions delegate this owner's current P reference.
# No copied P, arbitrary field writer, Q/E method reuse or source G boot write.
func owns_native_fireball_fields(resources: Node, current: Dictionary) -> bool:
	return is_native_new_run_state_ready() and resources==_resources and is_same(current,_p)

func apply_native_fireball_start(owner: Node, request: Dictionary) -> Dictionary:
	var current: Variant=read_current_p()
	if not current is Dictionary:return {"accepted":false,"reason":"actual_fireball_current_p_not_ready"}
	var result: Dictionary=_resources.apply_native_fireball_start(owner,self,current,request)
	if result.get("accepted")==true:_native_fireball_last_phase_frame=_world.get_native_frame()
	return result

func apply_native_fireball_finish(owner: Node, request: Dictionary) -> Dictionary:
	var current: Variant=read_current_p()
	if not current is Dictionary:return {"accepted":false,"reason":"actual_fireball_current_p_not_ready"}
	return _resources.apply_native_fireball_finish(owner,self,current,request)

func apply_native_fireball_recover_idle(owner: Node, request: Dictionary) -> Dictionary:
	var current: Variant=read_current_p()
	if not current is Dictionary:return {"accepted":false,"reason":"actual_fireball_current_p_not_ready"}
	return _resources.apply_native_fireball_recover_idle(owner,self,current,request)

var _native_fireball_last_phase_frame: float=-1.0

func advance_native_fireball_clock(owner: Node, ticks: float, frame: float) -> bool:
	if not is_native_new_run_state_ready() or not is_instance_valid(owner) or owner!=_player.get_parent() or owner.get("source_state")!=self or owner.get("world")!=_world or get_tree().paused:
		return false
	if not is_finite(ticks) or ticks<=0.0 or not is_finite(frame) or frame!=_world.get_native_frame() or ticks!=_world.get_native_projectile_fx_context().dt_sp or frame==_native_fireball_last_phase_frame:
		return false
	if _player.state not in ["magicCast","magicRecover"] or not _number(_p.get("st2")) or not is_finite(float(_p.st2)):return false
	_native_fireball_last_phase_frame=frame
	_p["st2"]=float(_p.st2)-ticks
	return true

# No domain reads: identity/lifecycle gate used even on Main cache hits.
func is_native_main_legendary_owner_current(main: Node) -> bool:
	if not _initialized or not _live(main) or main.is_queued_for_deletion() \
			or main.get_script() == null or main.get_script().resource_path != "res://scripts/main.gd":
		return false
	for node in [self, _player, _world, _resources]:
		if not _live(node) or node.is_queued_for_deletion(): return false
	if main.get("source_state") != self or main.get("player") != _player \
			or main.get("world") != _world or main.get("source_resources") != _resources \
			or _world.get_parent() != main: return false
	if _player.get_meta(INITIALIZED_META, false) != true: return false
	var claim: Variant = _player.get_meta(CLAIM_META, null)
	if not claim is WeakRef or claim.get_ref() != self: return false
	if get_parent() != null and get_parent() != _world: return false
	if _resources.get_parent() != null and _resources.get_parent() != _world: return false
	if _world.get("player") != null and _world.get("player") != _player: return false
	if _player.is_inside_tree():
		for node in [self, _world, _resources, main]:
			if not node.is_inside_tree() or node.get_tree() != _player.get_tree(): return false
		if get_parent() != _world or _resources.get_parent() != _world or _world.get("player") != _player: return false
	elif _player.is_node_ready(): return false
	return true

func read_native_legendary_inventory(main: Node, formula: RefCounted,
		services: RefCounted, providers: RefCounted) -> Dictionary:
	if not is_native_main_legendary_owner_current(main) \
			or not main.can_bind_native_source_legendary_formula(formula, services, self, providers):
		return {"status":"NOT_READY","reason":"legendary_inventory_owner_mismatch"}
	var error := _current_error()
	if not error.is_empty(): return {"status":"NOT_READY","reason":error}
	return {"status":"READY","value":_inventory}

func restore_native_legendary_item_stat(main: Node, expected_inventory: Dictionary,
		slot: String, expected_item: Dictionary, expected_special: Dictionary) -> Dictionary:
	if not is_native_main_legendary_owner_current(main):
		return {"status":"NOT_READY","reason":"legendary_restore_owner_mismatch","writes":0}
	var error := _current_error()
	if not error.is_empty(): return {"status":"NOT_READY","reason":error,"writes":0}
	if not is_same(expected_inventory, _inventory):
		return {"status":"NOT_READY","reason":"legendary_restore_inventory_replaced","writes":0}
	if not main.is_native_source_legendary_write_current(self, expected_inventory, slot, expected_item, expected_special):
		return {"status":"NOT_READY","reason":"legendary_restore_outside_owned_query","writes":0}
	var equipped: Variant = _inventory.get("equipped")
	if not equipped is Dictionary or not is_same(equipped.get(slot), expected_item):
		return {"status":"NOT_READY","reason":"legendary_restore_item_replaced","writes":0}
	var special: Variant = expected_item.get("legendarySpecial")
	if not special is Dictionary or not is_same(special, expected_special):
		return {"status":"NOT_READY","reason":"legendary_restore_special_replaced","writes":0}
	var stat: Variant = special.get("stat")
	if not main._source_legendary_truthy(stat):
		return {"status":"NOT_READY","reason":"legendary_restore_stat_condition_changed","writes":0}
	var key_result: Dictionary = main.source_legendary_property_key(stat)
	if key_result.get("status") != "READY":
		return {"status":"UNSUPPORTED_OPERAND","reason":key_result["reason"],"raw":stat,"writes":0}
	var key: String = key_result["key"]
	if expected_item.has(key):
		return {"status":"NOT_READY","reason":"legendary_restore_field_already_defined","writes":0}
	if not special.has("val"):
		return {"status":"UNSUPPORTED_OPERAND","reason":"JS_undefined_legacy_value_unrepresented","raw":special,"writes":0}
	expected_item[key] = special["val"]
	return {"status":"READY","writes":1,"item":expected_item,"field":key,"value":expected_item[key]}

func is_native_play_time_owner_current(main: Node, expected_player: Node,
		expected_world: Node, expected_resources: Node, raw_g: Variant = null,
		require_g_identity: bool = false) -> bool:
	if typeof(_initialized) != TYPE_BOOL or not _initialized:
		return false
	if not is_same(_player, expected_player) or not is_same(_world, expected_world) \
			or not is_same(_resources, expected_resources):
		return false
	for candidate in [self, main, _player, _world, _resources]:
		if not candidate is Node or not is_instance_valid(candidate) \
				or candidate.is_queued_for_deletion() or not candidate.is_inside_tree():
			return false
	var live_tree: SceneTree = main.get_tree()
	for candidate in [self, _player, _world, _resources]:
		if not is_same(candidate.get_tree(), live_tree):
			return false
	if not is_same(_world.get_parent(), main) or not is_same(get_parent(), _world) \
			or not is_same(_resources.get_parent(), _world):
		return false
	var initialized_claim: Variant = _player.get_meta(INITIALIZED_META, null)
	if typeof(initialized_claim) != TYPE_BOOL or not initialized_claim:
		return false
	var claim: Variant = _player.get_meta(CLAIM_META, null)
	if not claim is WeakRef or not is_instance_valid(claim) \
			or not is_same(claim.get_ref(), self):
		return false
	if require_g_identity and (not raw_g is Dictionary or not is_same(_g, raw_g)):
		return false
	return true


func read_native_normal_enemy_play_time(main: Node, services: RefCounted) -> Dictionary:
	var prefix: Array = []
	var observation: Dictionary = {
		"status": "NOT_READY",
		"source": "native.State._g.playTime",
		"reason": "native_play_time_owner_not_current",
		"raw_owner": self,
		"raw_main": main,
		"raw_services": services,
		"query_prefix": prefix,
	}
	if not is_instance_valid(main) or not is_instance_valid(services) \
			or not main.is_native_source_play_time_context_current(services, self):
		return observation
	var observed_g: Dictionary = _g
	observation["raw_g"] = observed_g
	var present: bool = observed_g.has("playTime")
	observation["present"] = present
	prefix.append({"kind": "presence", "key": "playTime", "present": present})
	var raw_value: Variant
	var raw_reason: String = "native_play_time_field_unresolved"
	if present:
		raw_value = observed_g["playTime"]
		observation["raw_value"] = raw_value
		observation["raw_type"] = typeof(raw_value)
		prefix.append({"kind": "value", "key": "playTime", "raw_value": raw_value})
		raw_reason = ""
		if typeof(raw_value) == TYPE_INT:
			if raw_value < -9007199254740991 or raw_value > 9007199254740991:
				raw_reason = "unsupported_native_play_time_integer"
		elif typeof(raw_value) == TYPE_FLOAT:
			if not is_finite(raw_value):
				raw_reason = "unsupported_native_play_time_non_finite"
		else:
			raw_reason = "unsupported_native_play_time_type"
	observation["reason"] = "native_play_time_observation_pending_validation"
	if not main.is_native_source_play_time_context_current(services, self, observed_g, true):
		return {
			"status": "NOT_READY",
			"source": "native.State._g.playTime",
			"reason": "native_play_time_owner_changed_after_observation",
			"read_result": observation,
			"raw_g": observed_g,
			"query_prefix": prefix,
		}
	if not raw_reason.is_empty():
		observation["reason"] = raw_reason
		return observation
	observation["status"] = "READY"
	observation["reason"] = ""
	observation["value"] = raw_value
	return observation


## source update() clock owner_writes sink — applies "G.<key>" 1:1 into the same
## owned _g reference (never a new Dictionary). Caller-identity gate mirrors
## read_native_normal_enemy_play_time via Main.is_native_source_play_time_context_current,
## including _g identity against the raw_g the producer phases observed.
## A malformed entry, nested target or non-finite / non-number value rejects the
## whole batch before any write (no partial application, no coercion).
func apply_native_source_update_clock_writes(main: Node, services: RefCounted,
		writes: Array, raw_g: Variant = null) -> Dictionary:
	var receipt: Dictionary = {
		"status": "NOT_READY",
		"source": "native.State._g.source_update_clock_writes",
		"reason": "native_play_time_owner_not_current",
		"applied": [],
	}
	if not is_instance_valid(main) or not is_instance_valid(services) \
			or not main.is_native_source_play_time_context_current(services, self,
					raw_g if raw_g != null else _g, true):
		return receipt
	var planned: Array = []
	for write in writes:
		if not write is Dictionary or not write.has("value"):
			receipt["reason"] = "update_clock_write_malformed"
			return receipt
		var target: Variant = write.get("target")
		if not target is String or not (target as String).begins_with("G.") \
				or (target as String).length() <= 2 \
				or (target as String).substr(2).contains("."):
			receipt["reason"] = "update_clock_write_target_not_single_g_key"
			return receipt
		var value: Variant = write["value"]
		if (typeof(value) != TYPE_INT and typeof(value) != TYPE_FLOAT) \
				or not is_finite(float(value)):
			receipt["reason"] = "update_clock_write_value_not_finite_number"
			return receipt
		planned.append({"key": (target as String).substr(2), "value": value})
	for item in planned:
		_g[item["key"]] = item["value"]
		(receipt["applied"] as Array).append(item)
	receipt["status"] = "READY"
	receipt["reason"] = ""
	receipt["writes"] = planned.size()
	return receipt

# DEMO11-25 — potion-only State entry. G27684/28071, fresh G63950/63952.
# Separate runtime values, not P/INV/save schema extensions.
var _auto_potion_cd: float = 0.0
var _auto_potion_level: int = 0

func read_native_potion_runtime() -> Dictionary:
	return {"cd":_auto_potion_cd,"level":_auto_potion_level}

func is_native_potion_owner_current(owner: Node) -> bool:
	return _feel_owner_current(owner) and not owner.is_queued_for_deletion() \
		and owner.get_script() != null and owner.get_script().resource_path == "res://scripts/main.gd" \
		and is_instance_valid(owner.get("source_potion")) and _resources.is_native_source_resources_ready()

func commit_native_auto_potion(owner: Node, field: String, value: Variant) -> Dictionary:
	if not is_native_potion_owner_current(owner): return {"accepted":false,"reason":"potion_owner_not_current"}
	if field == "stats": # G35910: conditional statistics only, no invented domains.
		if _g.get("_pStats") is Dictionary:
			_g._pStats["_hC"] = float(_g._pStats.get("_hC", NAN)) + 1.0
		if _g.get("_sStats") is Dictionary:
			_g._sStats["potions"] = float(_g._sStats.get("potions", NAN)) + 1.0
		return {"accepted":true}
	if not (value is int or value is float) or not is_finite(float(value)): return {"accepted":false,"reason":"unsupported_potion_number"}
	match field:
		"cd": _auto_potion_cd = float(value) # G35893/35902; negative CD allowed
		"mats":
			if not (_g.get("mats") is int or _g.get("mats") is float) or float(value) != float(_g.mats)-1.0 or float(_g.mats)<=0.0: return {"accepted":false}
			_g.mats = value # G35897, no _malCost transform
		"hp":
			var receipt: Dictionary = _resources.commit_native_auto_potion_hp(owner,self,float(value))
			if receipt.get("accepted") != true: return receipt
			_p.hp = receipt.hp # actual HP readback, not a second HP owner
		_: return {"accepted":false}
	return {"accepted":true}

# DEMO11-27: forge-only authority. Shop transactions are permitted while its UI pauses gameplay.
const FORGE_TRANSACTION = preload("res://scripts/native_meta_enhancement_transaction.gd")
var _forge_committing = false

func _forge_owner_current(owner: Node) -> bool:
	return _current_error().is_empty() and is_instance_valid(owner) and not owner.is_queued_for_deletion() \
		and owner == _player.get_parent() and owner.get("source_state") == self and owner.get("world") == _world \
		and owner.get_script() != null and owner.get_script().resource_path == "res://scripts/main.gd" \
		and is_instance_valid(owner.get("source_forge")) and owner.source_forge.is_bound_to(owner,self)

func apply_native_forge_enhance(owner: Node, item: Dictionary) -> Dictionary:
	if _forge_committing or not _forge_owner_current(owner) or not owner.source_forge.owns_selection(item):
		return {"status":"NOT_READY","reason":"forge_owner_or_selection_not_current"}
	_forge_committing = true
	var result: Dictionary = FORGE_TRANSACTION.attempt(item,_g,Callable(_world,"sample_native_random_unit"))
	_forge_committing = false
	return result

func apply_native_forge_transfer_prefix(owner: Node, old: Dictionary, item: Dictionary) -> Dictionary:
	# This entry is for the actual equip owner, not an independent forge transfer button.
	if _forge_committing or not _forge_owner_current(owner) or not _equipment_owner_current(owner) \
			or not _equipment_committing or not owner.source_equipment.owns_transfer_handoff(old,item):
		return {"status":"NOT_READY","reason":"actual_equip_continuation_not_bound"}
	_forge_committing = true
	var result: Dictionary = FORGE_TRANSACTION.transfer_prefix(old,item,_g)
	_forge_committing = false
	return result

func apply_native_forge_potion_upgrade(owner: Node) -> Dictionary:
	if _forge_committing or not _forge_owner_current(owner): return {"status":"NOT_READY","reason":"forge_owner_not_current"}
	# G50694-50705: single selection only; modifier-key stale batch callbacks are not introduced.
	var lv: int = _auto_potion_level
	var cost: int = FORGE_TRANSACTION.Policy.malice_cost(float((lv+1)*5))
	if lv>=10 or float(_p.get("lv",1))<float((lv+1)*100):
		return {"status":"READY","paid":false,"reason":"potion_level_gate"}
	if float(_g.mats)<float(cost): return {"status":"READY","paid":false,"reason":"insufficient_malice","cost":cost}
	_forge_committing = true
	_auto_potion_level += 1 # G50705 level write precedes the malice debit
	_g.mats -= cost
	_forge_committing = false
	return {"status":"READY","paid":true,"level":_auto_potion_level,"cost":cost,"remaining":_g.mats,
		"unported":["dbSaveNow, source flash/particle feedback"]}

# DEMO11-22r: one actual INV/wallet owner, synchronous UI event transaction.
var _equipment_committing := false
func _equipment_owner_current(owner: Node) -> bool:
	return _current_error().is_empty() and is_instance_valid(owner) and not owner.is_queued_for_deletion() \
		and owner == _player.get_parent() and owner.get("source_state") == self and owner.get("world") == _world \
		and owner.get_script() != null and owner.get_script().resource_path == "res://scripts/main.gd" \
		and is_instance_valid(owner.get("source_equipment")) \
		and owner.source_equipment.get_script().resource_path == "res://scripts/native_inventory_equipment.gd" \
		and owner.source_equipment.is_bound_to(owner,self)
func is_native_equipment_transaction_active() -> bool: return _equipment_committing
func apply_native_equipment_transaction(owner: Node, operation: String, item: Dictionary, slot: String) -> Dictionary:
	if _equipment_committing or not _equipment_owner_current(owner):
		return {"applied":false,"reason":"equipment_owner_or_reentry_rejected"}
	_equipment_committing = true
	var result: Dictionary = owner.source_equipment.execute(operation,item,slot,_inventory,_g,_native_crystal_bag)
	_equipment_committing = false
	return result
