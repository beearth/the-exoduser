extends RefCounted
##
## native_new_run_bootstrap_source/producer.gd — 원 새 실행(세이브 없음) 부트의 source constructor + 순서 명령 producer.
## TASK native_new_run_bootstrap_source.
##
## 원 R(canonical game.html, 읽기전용):
##   G file-init (@17122~17126)  let G={on:false,paused:false,…,_playerPortalPair:null}   — 40키, 이 순서
##   STATS file-init (@28268)    let STATS={str:0,dex:0,int:0,vit:0,lck:0};
##   PASSIVES file-init (@28300) let PASSIVES={};PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0)
##                               → player_passives_source.source_boot_passives() 재사용(26키 중복 정의 0)
##   _grit file-init (@28556)    let _grit=0;   — provenance 는 player_grit_source.source_boot_grit() 소유(여기서 호출/preload 0).
##                               새 실행 reset 없음. 이 모듈은 grit 호출/reset/설치 명령 0
##   fresh reset (@64386~64395)  P=mkP(); INV.bag=[];INV.equipped={17 null};INV.selected=null;INV.ossCollect={};
##                               QSLOTS…POT_LV (@64388~64391); STATS={…0}; for(const k in PASSIVES)PASSIVES[k]=0;
##                               BAG_MAX=300;invFilter=…; G.on=false;G.stage=_stageTestReq>=0?_stageTestReq:0;G.kills=0;
##                               G.mats=_loadSharedMats()||1000;G.exits=[];_cacheExitCenter();G.bossAlive=true;G._bossRef=null;
##                               G._crT=0;G.atkTickets=0;_hudT=0;_hudAlive=0;G.rifts=[];G.spawnHoles=[];G._chainCnt=0;G._chainT=0;
##                               G._bossArena=false;G._bossLoadPhase=0;G._bossLoadFade=0;G._bfxBolt=null;G.hellCleared=[];
##                               STORAGE={};STORAGE._synced=false;_getStore();
##   !_loaded 분기 (@64421~64437): _parryLesson?.resetForNewCharacter(); G._cutsceneDone=false; defaultItems 장착;
##                               starter bag mkItem×10; recalcSt(); 난이도 시작 스킬
##   공통 (@64441~64453): 기본 스킬 강제, (!_loaded) 슬롯 배정 / atlas 대기 (@64455~64457) / applyStats (@64458)
##   test override (@64459~64460): if(_stageTestReq>=0)G.stage=…; if(_bossTestReq>=0)G.stage=…;
##   HUD on/updateQS/updateSkSlot (@64461~64462) / initStage(G.stage) (@64463~64465, _bootMapBuildDefer 1→0)
##   initStage 의 G._fireZones=[] (@32217) 은 stage publisher 단계 — G literal/fresh reset 이 아니다.
##
## 이 모듈이 직접 만드는 것: SOURCE_BOOT constructor packet(current=false) 과 순서 명령. 실제 쓰기는 sink 가 한다.
## G 는 literal 교체가 아니라 같은 G 에 대한 필드 대입 subset. STATS 는 원처럼 새 객체 rebind, PASSIVES 는 현재 키 in-place 0.
## 외부(실행 0, sink 의 external handler 필요): mkP 본문, QSLOTS/potion/UPGRADES, BAG_MAX/invFilter, _cacheExitCenter,
## _hudT/_hudAlive, STORAGE, parry lesson, defaultItems/mkItem/RNG, recalcSt/applyStats, 스킬, atlas, HUD, initStage.
## loaded 복원 분기·testchar 분기는 제외. restore 실패/null 을 새 실행으로 자동 대체하지 않는다(caller 의 명시 결정 필요).
## 롤백/원자성 없음: 외부 거절 시 그 단계에서 멈추고 이미 수락된 prefix 를 보고한다.

const Passives := preload("res://port_modules/player_passives_source/producer.gd")

const SOURCE_BOOT := "SOURCE_BOOT"
const SOURCE_COMMAND := "SOURCE_COMMAND"
const SOURCE_PROVENANCE := "SOURCE_PROVENANCE"
const PREFLIGHT_OK := "PREFLIGHT_OK"
const NOT_READY := "NOT_READY"
const LOADED_BRANCH_EXCLUDED := "LOADED_BRANCH_EXCLUDED"
const STOPPED := "STOPPED"
const SEQUENCE_ACKNOWLEDGED := "SEQUENCE_ACKNOWLEDGED"
const ALREADY_RAN := "ALREADY_RAN"

const BRANCH_FRESH := "fresh_no_save"
const BRANCH_LOADED := "loaded"

const PROVIDER_MK_P := "mk_p"                        # () -> 실제 새 P (Dictionary/Object). 원 mkP authority
const PROVIDER_SHARED_MATS := "load_shared_mats"     # () -> 원 _loadSharedMats() 반환 (number/null/false)
const PROVIDER_STAGE_TEST_REQ := "stage_test_req"    # () -> 원 _stageTestReq (number)
const PROVIDER_BOSS_TEST_REQ := "boss_test_req"      # () -> 원 _bossTestReq (number)
const REQUIRED_PROVIDERS: Array[String] = [
	PROVIDER_MK_P, PROVIDER_SHARED_MATS, PROVIDER_STAGE_TEST_REQ, PROVIDER_BOSS_TEST_REQ,
]

const MATS_FALLBACK := 1000   # G.mats=_loadSharedMats()||1000

const EQUIPPED_SLOTS: Array[String] = [
	"weapon", "shield", "boots", "armor", "helmet", "bow", "gloves", "pants", "necklace",
	"ring1", "ring2", "cape", "belt", "bracelet", "headband", "ossuary", "headband2",
]
const STATS_KEYS: Array[String] = ["str", "dex", "int", "vit", "lck"]

const PHASE_FILE_INIT := "file_init"
const PHASE_FRESH_RESET := "fresh_reset"          # @64386~64395 (원: 세이브 조회 전 무조건 실행)
const PHASE_NEW_GAME := "new_game_branch"         # @64421~64437 (!_loaded)
const PHASE_COMMON := "post_branch_common"        # @64441~64462
const PHASE_STAGE := "stage_publisher"            # @64463~64465 initStage

const KIND_INSTALL_P := "install_p"
const KIND_INV_RESET := "inv_reset"
const KIND_STATS_REBIND := "stats_rebind"
const KIND_PASSIVES_ZERO := "passives_zero_current_keys"
const KIND_G_ASSIGN := "g_assign"
const KIND_EXTERNAL := "external_barrier"
const KIND_INIT_STAGE := "init_stage"

## 원 순서. conditional 단계는 조건이 거짓이면 dispatch 하지 않고 skipped 로 기록한다.
const STEPS := [
	{"id": "install_p", "kind": KIND_INSTALL_P, "phase": PHASE_FRESH_RESET, "source": "game.html:64386", "expr": "P=mkP()", "owner": "mkP authority (provider mk_p)"},
	{"id": "inv_reset", "kind": KIND_INV_RESET, "phase": PHASE_FRESH_RESET, "source": "game.html:64387", "expr": "INV.bag=[];INV.equipped={…17 null};INV.selected=null;INV.ossCollect={}", "owner": "this module (values) / sink (write)"},
	{"id": "qslots_potion_upgrades", "kind": KIND_EXTERNAL, "phase": PHASE_FRESH_RESET, "source": "game.html:64388~64391", "expr": "QSLOTS=[…];qsCooldown=[0,0,0,0];autoPotCd=0;UPGRADES={…};POT_LV={hp:0}", "owner": "quickslot/potion/upgrades"},
	{"id": "stats_reset", "kind": KIND_STATS_REBIND, "phase": PHASE_FRESH_RESET, "source": "game.html:64392", "expr": "STATS={str:0,dex:0,int:0,vit:0,lck:0}", "owner": "this module (values) / sink (rebind)"},
	{"id": "passives_reset", "kind": KIND_PASSIVES_ZERO, "phase": PHASE_FRESH_RESET, "source": "game.html:64393", "expr": "for(const k in PASSIVES)PASSIVES[k]=0", "owner": "sink (current key set)"},
	{"id": "bag_max_inv_filter", "kind": KIND_EXTERNAL, "phase": PHASE_FRESH_RESET, "source": "game.html:64394", "expr": "BAG_MAX=300;invFilter={slot:null,rarity:null,el:null}", "owner": "inventory UI"},
	{"id": "g_reset_head", "kind": KIND_G_ASSIGN, "phase": PHASE_FRESH_RESET, "source": "game.html:64395", "expr": "G.on=false;G.stage=_stageTestReq>=0?_stageTestReq:0;G.kills=0;G.mats=_loadSharedMats()||1000;G.exits=[]", "owner": "this module (values) / sink (same G)"},
	{"id": "cache_exit_center", "kind": KIND_EXTERNAL, "phase": PHASE_FRESH_RESET, "source": "game.html:64395 → 20252", "expr": "_cacheExitCenter()", "owner": "world exits"},
	{"id": "g_reset_boss", "kind": KIND_G_ASSIGN, "phase": PHASE_FRESH_RESET, "source": "game.html:64395", "expr": "G.bossAlive=true;G._bossRef=null;G._crT=0;G.atkTickets=0", "owner": "this module (values) / sink (same G)"},
	{"id": "hud_counters", "kind": KIND_EXTERNAL, "phase": PHASE_FRESH_RESET, "source": "game.html:64395", "expr": "_hudT=0;_hudAlive=0", "owner": "HUD"},
	{"id": "g_reset_tail", "kind": KIND_G_ASSIGN, "phase": PHASE_FRESH_RESET, "source": "game.html:64395", "expr": "G.rifts=[];G.spawnHoles=[];G._chainCnt=0;G._chainT=0;G._bossArena=false;G._bossLoadPhase=0;G._bossLoadFade=0;G._bfxBolt=null;G.hellCleared=[]", "owner": "this module (values) / sink (same G)"},
	{"id": "storage_reset", "kind": KIND_EXTERNAL, "phase": PHASE_FRESH_RESET, "source": "game.html:64395", "expr": "STORAGE={};STORAGE._synced=false;_getStore()", "owner": "storage"},
	{"id": "parry_lesson_reset", "kind": KIND_EXTERNAL, "phase": PHASE_NEW_GAME, "source": "game.html:64423", "expr": "window._parryLesson?.resetForNewCharacter()", "owner": "parry lesson (optional chaining)", "optional": true},
	{"id": "g_cutscene", "kind": KIND_G_ASSIGN, "phase": PHASE_NEW_GAME, "source": "game.html:64424", "expr": "G._cutsceneDone=false", "owner": "this module (values) / sink (same G)"},
	{"id": "default_items_equip", "kind": KIND_EXTERNAL, "phase": PHASE_NEW_GAME, "source": "game.html:64425", "expr": "const _di=defaultItems();for(const it of _di)INV.equipped[it.slot]=it", "owner": "items (defaultItems)"},
	{"id": "starter_bag", "kind": KIND_EXTERNAL, "phase": PHASE_NEW_GAME, "source": "game.html:64426~64430", "expr": "INV.bag.push(mkItem(…)) — weapon×4(dagger/hammer/axe/spear), armor, shield, helmet, boots, cape, bow(crossbow)", "owner": "items (mkItem/RNG)"},
	{"id": "recalc_st", "kind": KIND_EXTERNAL, "phase": PHASE_NEW_GAME, "source": "game.html:64431", "expr": "recalcSt()", "owner": "player resource parameters"},
	{"id": "difficulty_starting_skills", "kind": KIND_EXTERNAL, "phase": PHASE_NEW_GAME, "source": "game.html:64432~64437", "expr": "_diffSigned() → P.skills.giantSlam/holyDome/spikeTrap, SKILL_SLOTS[4/5]", "owner": "skills"},
	{"id": "ensure_base_skills", "kind": KIND_EXTERNAL, "phase": PHASE_COMMON, "source": "game.html:64441~64446", "expr": "_ensureBaseWingStrike(P); if(!P.skills.kiSlash)…iceOrb=1", "owner": "skills"},
	{"id": "new_game_skill_slots", "kind": KIND_EXTERNAL, "phase": PHASE_COMMON, "source": "game.html:64448~64453", "expr": "if(!_loaded){P.activeCtSk='iceOrb'; SKILL_SLOTS 정리; _fs(0,'spikeTrap');_fs(4,'giantSlam');_fs(5,'holyDome')}", "owner": "skills"},
	{"id": "boot_atlas_wait", "kind": KIND_EXTERNAL, "phase": PHASE_COMMON, "source": "game.html:64455~64457", "expr": "setBootLoading(75…); await _mobAtlas.ready (≤5000ms); setBootLoading(80…)", "owner": "boot loader / atlas"},
	{"id": "apply_stats", "kind": KIND_EXTERNAL, "phase": PHASE_COMMON, "source": "game.html:64458", "expr": "applyStats()", "owner": "player resource parameters / ENGINE"},
	{"id": "stage_test_override", "kind": KIND_G_ASSIGN, "phase": PHASE_COMMON, "source": "game.html:64459", "expr": "if(_stageTestReq>=0)G.stage=_stageTestReq", "owner": "this module (values) / sink (same G)", "conditional": true},
	{"id": "boss_test_override", "kind": KIND_G_ASSIGN, "phase": PHASE_COMMON, "source": "game.html:64460", "expr": "if(_bossTestReq>=0)G.stage=_bossTestReq", "owner": "this module (values) / sink (same G)", "conditional": true},
	{"id": "hud_show_update_slots", "kind": KIND_EXTERNAL, "phase": PHASE_COMMON, "source": "game.html:64461~64462", "expr": "[hud…globeMP].classList.add('on'); updateQS(); updateSkSlot()", "owner": "UI"},
	{"id": "init_stage", "kind": KIND_INIT_STAGE, "phase": PHASE_STAGE, "source": "game.html:64463~64465 → 32195", "expr": "_bootMapBuildDefer=1; initStage(G.stage); _bootMapBuildDefer=0", "owner": "stage publisher (ENGINE)"},
]

var _providers: Dictionary = {}
var _sink: Callable = Callable()
var _owners: Array[Object] = []   # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 유지
var _ran := false
var _dispatch_count := 0
var _committed: Array[Dictionary] = []
var _result: Dictionary = {"status": NOT_READY, "reason": "not_run", "current": false, "main_ready": false}


# ───────────────────────── source constructor packets (현재 아님) ─────────────────────────

static func _boot_packet(source: String, phase: String, values: Dictionary) -> Dictionary:
	return {"status": SOURCE_BOOT, "source": source, "phase": phase, "current": false, "derived": false, "values": values}

## 원 @17122~17126 G literal. 매 호출 새 할당(중첩 cam/배열/객체 포함). ticket 키는 literal 메타데이터일 뿐 소비자 없음.
static func _g_literal() -> Dictionary:
	return {
		"on": false, "paused": false, "stage": 0, "kills": 0, "mats": 0, "cam": {"x": 0, "y": 0}, "shake": 0, "parts": [], "txts": [],
		"forgeOpen": false, "forgeTab": "upgrade", "forgeExpanded": false, "forgeSort": null, "rooms": [], "curRoom": 0, "map": null,
		"mw": 0, "mh": 0, "hitStop": 0, "slowMo": 0, "stageCleared": false, "_stageDiffOff": 0, "exits": [], "bossAlive": true,
		"_chainCnt": 0, "_chainT": 0, "rifts": [], "spawnHoles": [], "atkTickets": 0, "maxAtkTickets": 3, "_irisSz": 20,
		"combo": 0, "comboTimer": 0, "comboMax": 0, "stageTime": 0,
		"_zones": null, "_curZone": 0, "_zoneState": {}, "_portals": null, "_playerPortalPair": null,
	}

static func _stats_zero() -> Dictionary:
	return {"str": 0, "dex": 0, "int": 0, "vit": 0, "lck": 0}

static func _inv_reset_values() -> Dictionary:
	var eq := {}
	for s in EQUIPPED_SLOTS:
		eq[s] = null
	return {"bag": [], "equipped": eq, "selected": null, "ossCollect": {}}

static func source_boot_g() -> Dictionary:
	return _boot_packet("game.html:17122~17126 let G={…}", PHASE_FILE_INIT, _g_literal())

static func source_boot_stats() -> Dictionary:
	return _boot_packet("game.html:28268 let STATS={…}", PHASE_FILE_INIT, _stats_zero())

## 26키는 player_passives_source(Formula.PASSIVE_DEF_KEYS) 소유 — 여기서 다시 정의하지 않는다.
static func source_boot_passives() -> Dictionary:
	return _boot_packet("game.html:28300 PASSIVE_DEF.forEach(p=>PASSIVES[p.key]=0) via player_passives_source.source_boot_passives()", PHASE_FILE_INIT, Passives.source_boot_passives())

static func source_fresh_reset_inv() -> Dictionary:
	return _boot_packet("game.html:64387 INV.*", PHASE_FRESH_RESET, _inv_reset_values())

static func source_fresh_reset_stats() -> Dictionary:
	return _boot_packet("game.html:64392 STATS={…}", PHASE_FRESH_RESET, _stats_zero())

## G._fireZones=[] 는 initStage(stage publisher) 소유. G literal/fresh reset 에 없고 G._zones/M30._zones 의 alias 가 아니다.
static func source_fire_zones_provenance() -> Dictionary:
	return {
		"status": SOURCE_PROVENANCE, "source": "game.html:32217 initStage(si)", "expr": "G._fireZones=[]", "phase": PHASE_STAGE,
		"target": "same G", "in_g_file_init": false, "in_fresh_reset": false, "not_alias_of": ["G._zones", "M30._zones"],
		"implemented_here": false, "current": false,
	}

static func plan() -> Array:
	var out: Array = []
	for i in STEPS.size():
		var s: Dictionary = (STEPS[i] as Dictionary).duplicate(true)
		s["index"] = i
		s["optional"] = s.get("optional", false)
		s["conditional"] = s.get("conditional", false)
		s["external"] = s["kind"] == KIND_EXTERNAL or s["kind"] == KIND_INSTALL_P or s["kind"] == KIND_INIT_STAGE
		out.append(s)
	return out

static func external_step_ids() -> Array[String]:
	var out: Array[String] = []
	for s in STEPS:
		if s["kind"] == KIND_EXTERNAL:
			out.append(s["id"])
	return out


# ───────────────────────── configure / preflight ─────────────────────────

## providers: REQUIRED_PROVIDERS → Callable. sink: Callable(command: Dictionary) -> bool | {accepted: bool, …}
func configure(providers: Dictionary, sink: Callable) -> bool:
	if _ran:
		return false
	_providers = providers.duplicate()
	_sink = sink
	_owners.clear()
	for c in _providers.values():
		_retain(c)
	_retain(sink)
	return true

func _retain(c: Variant) -> void:
	if c is Callable:
		var o: Object = (c as Callable).get_object()
		if o is RefCounted and not _owners.has(o):
			_owners.append(o)

func _missing() -> Array[String]:
	var out: Array[String] = []
	for k in REQUIRED_PROVIDERS:
		var c: Variant = _providers.get(k)
		if not (c is Callable) or not (c as Callable).is_valid():
			out.append(k)
	if not _sink.is_valid():
		out.append("sink")
	return out

## 쓰기 전 검사. decision 은 caller 가 명시한 {branch: "fresh_no_save"} 만 새 실행으로 인정한다.
func readiness(decision: Variant) -> Dictionary:
	var r := {"status": PREFLIGHT_OK, "reason": "", "branch": "", "missing": [], "current": false, "main_ready": false}
	if not (decision is Dictionary) or not ((decision as Dictionary).get("branch") is String):
		r["status"] = NOT_READY
		r["reason"] = "decision_not_explicit"
		return r
	var b: String = (decision as Dictionary)["branch"]
	r["branch"] = b
	if b == BRANCH_LOADED:
		r["status"] = LOADED_BRANCH_EXCLUDED
		r["reason"] = "loaded_restore_branch_excluded"
		return r
	if b != BRANCH_FRESH:
		r["status"] = NOT_READY
		r["reason"] = "decision_not_explicit_fresh"
		return r
	var m := _missing()
	if not m.is_empty():
		r["status"] = NOT_READY
		r["reason"] = "missing_providers"
		r["missing"] = m
	return r


# ───────────────────────── provider reads (원 값 그대로) ─────────────────────────

static func _is_number(v: Variant) -> bool:
	return typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT

func _test_req(key: String) -> Dictionary:
	var v: Variant = (_providers[key] as Callable).call()
	if not _is_number(v):
		return {"ok": false, "reason": "provider_unsupported:" + key}
	return {"ok": true, "value": v}

## _loadSharedMats()||1000 — falsy(0/-0/NaN/null/false) 만 1000. 그 외 숫자는 raw. 다른 타입은 미지원.
func _mats() -> Dictionary:
	var v: Variant = (_providers[PROVIDER_SHARED_MATS] as Callable).call()
	match typeof(v):
		TYPE_NIL:
			return {"ok": true, "value": MATS_FALLBACK, "fallback": true}
		TYPE_BOOL:
			if v == false:
				return {"ok": true, "value": MATS_FALLBACK, "fallback": true}
		TYPE_INT:
			return {"ok": true, "value": MATS_FALLBACK if v == 0 else v, "fallback": v == 0}
		TYPE_FLOAT:
			var f: float = v
			var falsy := f == 0.0 or is_nan(f)
			return {"ok": true, "value": MATS_FALLBACK if falsy else v, "fallback": falsy}
	return {"ok": false, "reason": "provider_unsupported:" + PROVIDER_SHARED_MATS}

func _g_fields(id: String) -> Dictionary:
	match id:
		"g_reset_head":
			var st := _test_req(PROVIDER_STAGE_TEST_REQ)
			if not st["ok"]:
				return st
			var m := _mats()
			if not m["ok"]:
				return m
			var stage: Variant = st["value"] if st["value"] >= 0 else 0
			return {"ok": true, "fields": [["on", false], ["stage", stage], ["kills", 0], ["mats", m["value"]], ["exits", []]],
				"meta": {"stage_test_req": st["value"], "mats_fallback": m["fallback"]}}
		"g_reset_boss":
			return {"ok": true, "fields": [["bossAlive", true], ["_bossRef", null], ["_crT", 0], ["atkTickets", 0]]}
		"g_reset_tail":
			return {"ok": true, "fields": [["rifts", []], ["spawnHoles", []], ["_chainCnt", 0], ["_chainT", 0], ["_bossArena", false],
				["_bossLoadPhase", 0], ["_bossLoadFade", 0], ["_bfxBolt", null], ["hellCleared", []]]}
		"g_cutscene":
			return {"ok": true, "fields": [["_cutsceneDone", false]]}
		"stage_test_override", "boss_test_override":
			var key := PROVIDER_STAGE_TEST_REQ if id == "stage_test_override" else PROVIDER_BOSS_TEST_REQ
			var q := _test_req(key)
			if not q["ok"]:
				return q
			if not (q["value"] >= 0):
				return {"ok": true, "skipped": true, "meta": {key: q["value"]}}
			return {"ok": true, "fields": [["stage", q["value"]]], "meta": {key: q["value"]}}
	return {"ok": false, "reason": "unknown_g_step:" + id}


# ───────────────────────── public G assignment plan (읽기전용, 현재 아님) ─────────────────────────

## 공개 step id → 같은 _g_fields 의 내부 segment id (원 순서). g_initial_reset 은 @64395 의 세 조각 alias.
const PUBLIC_G_STEPS := {
	"g_initial_reset": ["g_reset_head", "g_reset_boss", "g_reset_tail"],
	"g_cutscene": ["g_cutscene"],
	"stage_test_override": ["stage_test_override"],
	"boss_test_override": ["boss_test_override"],
}
## 공개 step 별로 실제 context 가 줘야 하는 provider. 없는 것은 중립값으로 채우지 않는다.
const PUBLIC_G_PROVIDERS := {
	"g_initial_reset": [PROVIDER_STAGE_TEST_REQ, PROVIDER_SHARED_MATS],
	"g_cutscene": [],
	"stage_test_override": [PROVIDER_STAGE_TEST_REQ],
	"boss_test_override": [PROVIDER_BOSS_TEST_REQ],
}

static func _step_index(id: String) -> int:
	for i in STEPS.size():
		if STEPS[i]["id"] == id:
			return i
	return -1

static func _g_segment_packet(id: String, g: Dictionary) -> Dictionary:
	var i := _step_index(id)
	var s: Dictionary = STEPS[i]
	var pk := {
		"status": SOURCE_COMMAND, "current": false, "main_ready": false, "index": i, "id": id, "kind": s["kind"], "phase": s["phase"],
		"source": s["source"], "expr": s["expr"], "owner": s["owner"], "target": "same G",
		"conditional": s.get("conditional", false), "skipped": g.get("skipped", false), "fields": g.get("fields", []),
	}
	if g.has("meta"):
		pk["meta"] = g["meta"]
	return pk

## actual_context = {decision: {branch: "fresh_no_save"}, providers: {<PUBLIC_G_PROVIDERS[step_id]> → Callable() -> 원 값}}
## provider 는 인자 0 Callable 이어야 한다(아니면 NOT_READY provider_nonzero_arity:<key>, 호출 0).
## 읽기전용: self 의 _providers/_sink/_owners/_ran/_dispatch_count/_committed/_result 를 읽지도 쓰지도 않는다.
## 같은 스크립트의 임시 인스턴스(격리 resolver scope)에 이번 호출 provider 만 묶어 기존 _g_fields 를 그대로 호출한다
## — 재진입 호출도 서로 다른 scope 라 provider 복원 문제가 없다. G 쓰기/외부 barrier 실행 0.
## g_initial_reset 의 fields 는 원 순서 평탄화지만 원 phase 는 segment 사이에 외부 단계가 끼어 있다(order/interleaves).
func plan_g_assignment(step_id: Variant, actual_context: Variant) -> Dictionary:
	var r := {"status": NOT_READY, "reason": "", "step_id": step_id, "branch": "", "missing": [], "current": false, "main_ready": false}
	if not (step_id is String) or not PUBLIC_G_STEPS.has(step_id):
		r["reason"] = "unsupported_g_step"
		return r
	if not (actual_context is Dictionary):
		r["reason"] = "context_not_dictionary"
		return r
	var ctx: Dictionary = actual_context
	var decision: Variant = ctx.get("decision")
	if not (decision is Dictionary) or not ((decision as Dictionary).get("branch") is String):
		r["reason"] = "decision_not_explicit"
		return r
	var b: String = (decision as Dictionary)["branch"]
	r["branch"] = b
	if b == BRANCH_LOADED:
		r["status"] = LOADED_BRANCH_EXCLUDED
		r["reason"] = "loaded_restore_branch_excluded"
		return r
	if b != BRANCH_FRESH:
		r["reason"] = "decision_not_explicit_fresh"
		return r
	var given: Variant = ctx.get("providers", {})
	var bound := {}
	var missing: Array[String] = []
	for k in PUBLIC_G_PROVIDERS[step_id]:
		var c: Variant = (given as Dictionary).get(k) if given is Dictionary else null
		if c is Callable and (c as Callable).is_valid():
			bound[k] = c
		else:
			missing.append(k)
	if not missing.is_empty():
		r["reason"] = "missing_providers"
		r["missing"] = missing
		return r
	# 원 source reader 는 인자 0 (bind 된 인자는 get_argument_count 에서 이미 빠짐). 호출 전 거절 — SCRIPT ERROR 0.
	for k in bound:
		if (bound[k] as Callable).get_argument_count() != 0:
			r["reason"] = "provider_nonzero_arity:" + k
			return r
	var scope = get_script().new()
	scope._providers = bound
	var ids: Array = PUBLIC_G_STEPS[step_id]
	var segments: Array = []
	var fields: Array = []
	var meta := {}
	for seg_id in ids:
		var g: Dictionary = scope._g_fields(seg_id)
		if not g["ok"]:
			r["reason"] = g["reason"]
			return r
		var seg := _g_segment_packet(seg_id, g)
		segments.append(seg)
		fields.append_array((seg["fields"] as Array).duplicate(true))
		if seg.has("meta"):
			meta.merge(seg["meta"])
	var i0 := _step_index(ids[0])
	var i1 := _step_index(ids[ids.size() - 1])
	var order: Array = []
	var interleaves: Array = []
	for i in range(i0, i1 + 1):
		var s: Dictionary = STEPS[i]
		var e := {"index": i, "id": s["id"], "kind": s["kind"], "source": s["source"], "expr": s["expr"], "owner": s["owner"]}
		if s["kind"] == KIND_G_ASSIGN:
			e["segment"] = ids.find(s["id"])
		else:
			e["implemented_here"] = false
			e["between"] = [STEPS[i - 1]["id"], STEPS[i + 1]["id"]]
			interleaves.append(e.duplicate(true))
		order.append(e)
	r["status"] = SOURCE_COMMAND
	r["target"] = "same G"
	r["phase"] = STEPS[i0]["phase"]
	r["segments"] = segments
	r["fields"] = fields
	r["meta"] = meta
	r["skipped"] = segments.size() == 1 and segments[0]["skipped"]
	r["order"] = order
	r["interleaves"] = interleaves
	r["apply_contract"] = "single_segment" if interleaves.is_empty() else "per_segment_interleaved"
	if i1 + 1 < STEPS.size():
		var n: Dictionary = STEPS[i1 + 1]
		r["followed_by"] = {"index": i1 + 1, "id": n["id"], "kind": n["kind"], "source": n["source"], "expr": n["expr"], "external": n["kind"] != KIND_G_ASSIGN}
	r["applied"] = false
	r["sink"] = "pending_engine"
	return r


# ───────────────────────── run ─────────────────────────

func _command(i: int) -> Dictionary:
	var s: Dictionary = STEPS[i]
	var cmd := {
		"status": SOURCE_COMMAND, "current": false, "index": i, "id": s["id"], "kind": s["kind"], "phase": s["phase"],
		"source": s["source"], "expr": s["expr"], "owner": s["owner"], "optional": s.get("optional", false),
	}
	match s["kind"]:
		KIND_INSTALL_P:
			var p: Variant = (_providers[PROVIDER_MK_P] as Callable).call()
			# freed Object 는 typeof==TYPE_OBJECT 이지만 is_instance_valid=false — 역참조 전에 거절
			if typeof(p) == TYPE_OBJECT:
				if not is_instance_valid(p):
					return {"ok": false, "reason": "mk_p_returned_freed_object"}
			elif typeof(p) != TYPE_DICTIONARY:
				return {"ok": false, "reason": "mk_p_returned_unsupported"}
			return {"ok": true, "command": cmd, "p": p}
		KIND_INV_RESET:
			cmd["values"] = _inv_reset_values()
		KIND_STATS_REBIND:
			cmd["values"] = _stats_zero()
			cmd["mode"] = "rebind"
		KIND_PASSIVES_ZERO:
			cmd["mode"] = "in_place_current_keys"
		KIND_G_ASSIGN:
			var g := _g_fields(s["id"])
			if not g["ok"]:
				return g
			if g.get("skipped", false):
				return {"ok": true, "skipped": true, "meta": g.get("meta", {})}
			cmd["fields"] = g["fields"]
			cmd["target"] = "same G"
			if g.has("meta"):
				cmd["meta"] = g["meta"]
		KIND_INIT_STAGE:
			cmd["arg_expr"] = "G.stage"
			cmd["boot_map_build_defer"] = [1, 0]
			cmd["publishes"] = [source_fire_zones_provenance()]
		KIND_EXTERNAL:
			cmd["implemented_here"] = false
	return {"ok": true, "command": cmd}

static func _ack_ok(ack: Variant) -> bool:
	if typeof(ack) == TYPE_BOOL:
		return ack
	if ack is Dictionary:
		var a: Variant = (ack as Dictionary).get("accepted")
		return typeof(a) == TYPE_BOOL and a
	return false

static func _copy(v: Variant) -> Variant:
	return v.duplicate(true) if (v is Dictionary or v is Array) else v

## 단 1회. 명시 fresh 결정 + providers/sink 사전 검사 후 원 순서대로 sink 에 dispatch.
## 외부 거절/공급 실패 → 그 단계에서 STOPPED, 이미 수락된 prefix 유지(롤백 0). 전부 수락돼도 current/main_ready=false.
func run(decision: Variant) -> Dictionary:
	if _ran:
		return {"status": ALREADY_RAN, "reason": "single_shot", "current": false, "main_ready": false}
	var pre := readiness(decision)
	var res := {
		"status": pre["status"], "reason": pre["reason"], "branch": pre["branch"], "missing": pre["missing"],
		"decision": _copy(decision), "committed": [], "skipped": [], "failed_step": "", "remaining": [],
		"current": false, "main_ready": false, "rollback": false, "atomic": false,
		"external_gaps": external_step_ids(),
	}
	if pre["status"] != PREFLIGHT_OK:
		_result = res
		return last_result()
	_ran = true
	var skipped: Array = []
	for i in STEPS.size():
		var id: String = STEPS[i]["id"]
		var built := _command(i)
		if built["ok"] and built.get("skipped", false):
			skipped.append({"index": i, "id": id, "meta": _copy(built.get("meta", {}))})
			continue
		var reason := ""
		var ack: Variant = null
		if not built["ok"]:
			reason = built["reason"]
		elif not _sink.is_valid():
			reason = "sink_invalid"
		else:
			var cmd: Dictionary = (built["command"] as Dictionary).duplicate(true)
			if built.has("p"):
				cmd["p"] = built["p"]   # 실제 새 P 참조(복사 금지)
			_dispatch_count += 1
			ack = _sink.call(cmd)
			if not _ack_ok(ack):
				reason = "sink_rejected"
		if reason != "":
			res["status"] = STOPPED
			res["reason"] = reason
			res["failed_step"] = id
			for j in range(i + 1, STEPS.size()):
				(res["remaining"] as Array).append(STEPS[j]["id"])
			if ack != null:
				res["failed_ack"] = _copy(ack)
			break
		_committed.append({"index": i, "id": id, "kind": STEPS[i]["kind"], "source": STEPS[i]["source"], "ack": _copy(ack)})
	res["committed"] = _committed.duplicate(true)
	res["skipped"] = skipped
	if res["status"] == PREFLIGHT_OK:
		res["status"] = SEQUENCE_ACKNOWLEDGED
		res["reason"] = "all_steps_acknowledged_through_init_stage"
	_result = res
	return last_result()


# ───────────────────────── getters (방어 복사) ─────────────────────────

func last_result() -> Dictionary:
	return _result.duplicate(true)

func status() -> String:
	return _result["status"]

func committed_steps() -> Array:
	return _committed.duplicate(true)

func dispatch_count() -> int:
	return _dispatch_count

func has_run() -> bool:
	return _ran


# ───────────────────────── state sink (holder 계약) ─────────────────────────

## 사적 constructor: source file-init G/STATS/PASSIVES 로 새 holder. 실제 current 설치가 아니다(origin 으로 구분).
static func construct_private_state_sink() -> SourceStateSink:
	return SourceStateSink.new(_g_literal(), _stats_zero(), Passives.source_boot_passives(), {}, "private_source_constructor")

## caller 의 실제 G/STATS/PASSIVES/INV 참조를 그대로 보유(same G 정체성 유지, 복사 0). P 는 비어 있어야 한다.
static func bind_state_sink(g: Dictionary, stats: Dictionary, passives: Dictionary, inv: Dictionary) -> SourceStateSink:
	return SourceStateSink.new(g, stats, passives, inv, "caller_bound")


class SourceStateSink extends RefCounted:
	var origin: String
	var g: Dictionary
	var stats: Dictionary
	var passives: Dictionary
	var inv: Dictionary
	var p: Variant = null
	var external_handlers: Dictionary = {}   # step id / "init_stage" → Callable(command) -> bool | {accepted}
	var consumed_ids: Array[String] = []

	func _init(g_ref: Dictionary, stats_ref: Dictionary, passives_ref: Dictionary, inv_ref: Dictionary, origin_label: String) -> void:
		g = g_ref
		stats = stats_ref
		passives = passives_ref
		inv = inv_ref
		origin = origin_label

	func set_external_handler(id: String, handler: Callable) -> void:
		external_handlers[id] = handler

	func as_sink() -> Callable:
		return consume

	static func _fresh(v: Variant) -> Variant:
		return v.duplicate(true) if (v is Dictionary or v is Array) else v

	func _reject(reason: String) -> Dictionary:
		return {"accepted": false, "reason": reason}

	func _external(id: String, command: Dictionary) -> Dictionary:
		var h: Variant = external_handlers.get(id)
		if not (h is Callable) or not (h as Callable).is_valid():
			return _reject("external_handler_missing:" + id)
		var a: Variant = (h as Callable).call(command)
		var ok: bool = (typeof(a) == TYPE_BOOL and a) or (a is Dictionary and typeof((a as Dictionary).get("accepted")) == TYPE_BOOL and a["accepted"])
		if not ok:
			return _reject("external_rejected:" + id)
		return {"accepted": true, "external": id}

	func consume(command: Dictionary) -> Dictionary:
		var r: Dictionary
		match command.get("kind"):
			KIND_INSTALL_P:
				if p != null:
					return _reject("actor_already_present")
				var np: Variant = command.get("p")
				if not (typeof(np) == TYPE_DICTIONARY or (typeof(np) == TYPE_OBJECT and is_instance_valid(np))):
					return _reject("p_missing_or_freed")
				p = np
				r = {"accepted": true}
			KIND_INV_RESET:
				var v: Dictionary = command["values"]
				for k in ["bag", "equipped", "selected", "ossCollect"]:
					inv[k] = _fresh(v[k])
				r = {"accepted": true}
			KIND_STATS_REBIND:
				stats = (command["values"] as Dictionary).duplicate(true)   # 원 STATS={…} 는 새 객체
				r = {"accepted": true, "rebound": true}
			KIND_PASSIVES_ZERO:
				var keys: Array = passives.keys()
				for k in keys:
					passives[k] = 0.0
				r = {"accepted": true, "zeroed_keys": keys}
			KIND_G_ASSIGN:
				for pair in command["fields"]:
					g[pair[0]] = _fresh(pair[1])
				r = {"accepted": true}
			KIND_INIT_STAGE:
				var c := command.duplicate(true)
				c["stage"] = g.get("stage")
				r = _external("init_stage", c)
			KIND_EXTERNAL:
				r = _external(command["id"], command)
			_:
				return _reject("unsupported_kind")
		if r["accepted"]:
			consumed_ids.append(command["id"])
		return r
