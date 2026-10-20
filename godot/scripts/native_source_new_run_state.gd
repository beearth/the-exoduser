extends Node
## Explicit source file-init/current-state holder for one newly constructed Player.
## SOURCE_BOOT inputs stay unchanged. No bootstrap run, external ack, formula,
## actor writes, grit reset, stage publication, save IO or automatic clock.

const BOOTSTRAP = preload("res://port_modules/native_new_run_bootstrap_source/producer.gd")
const STARTER_FACTORY = preload("res://port_modules/starter_item_factory_source/producer.gd")
const SOURCE_RESOURCES = preload("res://scripts/native_source_resource_authority.gd")
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
