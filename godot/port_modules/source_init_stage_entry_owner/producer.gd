extends RefCounted
##
## source_init_stage_entry_owner/producer.gd — 원 `initStage(si)` 진입부 실행 owner (owned subset only).
##
## 원 R(canonical game.html, 읽기전용):
##   17050  const TOTAL_STAGES=35;
##   32196  _cancelHellgunnerBlood();_cancelHellgunnerLeap();
##   32197  _rootRiftInvalidate('init-stage');
##   32198  _resetInteractInput();
##   32199  G._playerPortalPair=null;
##   32200  if(window._parryLesson){window._parryLesson.finish();window._parryLesson.seen=false;}
##   32201  G._druidVictory=null;G._druidFinaleBoss=null;G._druidActCue=null;
##   32202  if(si>=TOTAL_STAGES)si=TOTAL_STAGES-1;
##   32204  if(_bossTestReq>=0){ …boss arena branch… return; }
##   32213  G.stage=si;
##   32214~32217  _skinSeqIdx / _load8DirAtlas(1) / ens·projs·pProjs·worldItems·MAP_OBJS·G.parts… (unowned gap)
##   32217  … G._fireZones=[]; … (이후 tail 은 unowned)
##
## 소유: 위 predecessor callback 4개의 원 순서 호출, lesson 분기, 같은 G 에 대한 portal/druid/stage/fireZones 쓰기 명령.
## G 쓰기는 주입된 단일 sink(StageEntryGSink 또는 동일 계약)만 한다. producer 는 G 를 직접 읽거나 쓰지 않는다.
## 미소유: boss 분기 본문, 32214~32217 gap, fireZones 이후 tail, 맵/spawn/Player/camera/HUD/atlas/G.on.
## 실패 시 그 원 호출 지점에서 멈추고 성공 prefix 를 보존한다(rollback/preflight/all-or-none 없음).
## gap 은 services.stage_gap_owner 실제 Callable 1회 호출로만 넘는다. metadata receipt/row 입력은 받지 않는다.
## source_entry_applied 는 실제 gap owner 완료 + fireZones 쓰기까지 끝났을 때만 true. 그 전 prefix 는 applied_prefix 진단.
## 인스턴스 1개 = initStage 호출 1회(execution episode) 수명. 전역 stage dedup/frame gate 가 아니며 G·공유 tick 에
## dedup flag 를 쓰지 않는다. 새 initStage 호출은 새 owner 인스턴스로 실행한다.
## 어떤 결과도 stage 완료·initStage 전체 ACK·G.on·startup on 을 뜻하지 않는다.

const SCHEMA := "exoduser.godot.source-init-stage-entry-owner.v1"
const SINK_COMMAND_SCHEMA := "exoduser.godot.source-init-stage-entry-sink-command.v1"
const SOURCE_INIT_STAGE := "game.html:32195 initStage(si)"
const SOURCE_TOTAL_STAGES := "game.html:17050 const TOTAL_STAGES=35"
const TOTAL_STAGES := 35

const STATUS_NOT_READY := "NOT_READY"
const STATUS_PARTIAL_PENDING_GAP := "PARTIAL_PENDING_GAP"
const STATUS_PARTIAL_TAIL_PENDING := "PARTIAL_ENTRY_APPLIED_TAIL_PENDING"
const STATUS_ALREADY_STARTED := "ALREADY_STARTED"
const STATUS_NOT_PENDING_GAP := "NOT_PENDING_GAP"
const STATUS_RECEIPT_INPUT_REJECTED := "RECEIPT_INPUT_REJECTED"
const POSITIVE_GAP_PATH := "UNVERIFIED_MISSING_ACTUAL_GAP_OWNER"

## services 키. callback 은 adapter envelope 를 반환한다(아래 CALL_*).
const SVC_HELLGUNNER_BLOOD := "cancel_hellgunner_blood"    # () -> envelope
const SVC_HELLGUNNER_LEAP := "cancel_hellgunner_leap"      # () -> envelope
const SVC_ROOT_RIFT := "root_rift_invalidate"              # (reason:String='init-stage') -> envelope
const SVC_INTERACT_INPUT := "reset_interact_input"         # () -> envelope
const SVC_LESSON_HOLDER := "parry_lesson_holder"           # parry_lesson_source/producer.gd 인스턴스
const SVC_LESSON_RESTORATION := "parry_lesson_finish_restoration"  # () -> envelope. parry-lesson.js:687-697
const SVC_BOSS_TEST_REQ := "boss_test_req"                 # () -> {status:READY, value:number, authority}
const SVC_STAGE_GAP_OWNER := "stage_gap_owner"             # (context:Dictionary) -> gap envelope. 32214~32217 실제 본문

## gap owner binding seam (proposed). Callable.get_object() 가 아래 메서드로 자기 binding 을 선언해야 한다.
const GAP_SOURCE := "game.html:32214~32217"
const GAP_BINDING_METHOD := "get_source_init_stage_gap_binding"
const GAP_BINDING_IMPLEMENTATION := "actual_source_body"
const GAP_CONTEXT_SCHEMA := "exoduser.godot.source-init-stage-gap-context.v1"

## adapter call envelope. 원 함수 반환값은 무시하며(source_return 은 기록만), 이 status 는 native binding seam 의
## 호출 완료/미준비/예외 구분이다. 원 source 의 ACK 가 아니다.
const CALL_COMPLETED := "CALLED"
const CALL_NOT_READY := "NOT_READY"
const CALL_THREW := "THREW"
const CALL_STATUSES := [CALL_COMPLETED, CALL_NOT_READY, CALL_THREW]

## boss request 권위. 현재 값 또는 진짜 provider 가 선언한 source boot 기본값만 허용한다.
const BOSS_AUTH_CURRENT := "CURRENT"
const BOSS_AUTH_DECLARED_BOOT_DEFAULT := "DECLARED_SOURCE_BOOT_DEFAULT"

## parry_lesson_source 권위 문자열(같은 공개 holder 의 AUTH_* 값).
const LESSON_AUTH_CURRENT := "CURRENT_LESSON"
const LESSON_AUTH_DECLARED_FALSY := ["SOURCE_PROPERTY_UNCREATED", "SOURCE_PROPERTY_UNSET", "SOURCE_PROPERTY_FALSY"]
const LESSON_HOLDER_METHODS := ["get_authority", "get_current_lesson_reference", "adopt_finish_state_projection", "js_truthy"]

const ROOT_RIFT_REASON := "init-stage"

## sink command id (owned write subset)
const WRITE_PORTAL := "player_portal_pair"
const WRITE_DRUID := "druid_reset"
const WRITE_STAGE := "stage"
const WRITE_FIRE_ZONES := "fire_zones"

const BOSS_BRANCH_UNOWNED := [
	{"source": "game.html:32205", "expr": "G.stage=_bossTestReq"},
	{"source": "game.html:32206", "expr": "_load8DirAtlas(1)"},
	{"source": "game.html:32207", "expr": "if(!G.map){G.map=[[4]];G.mw=1;G.mh=1;G.rooms=[];G.exits=[]}"},
	{"source": "game.html:32208", "expr": "_enterBossArena()"},
	{"source": "game.html:32209", "expr": "G._cutsceneDone=true;G.on=true"},
	{"source": "game.html:32210", "expr": "if(P)P.iframes=300"},
	{"source": "game.html:32211", "expr": "return"},
]

## G.stage(32213) 와 G._fireZones(32217) 사이 원 순서 unowned 단계 24.
const GAP_STEPS := [
	{"id": "skin_seq_idx_reset", "source": "game.html:32214", "expr": "_skinSeqIdx=0"},
	{"id": "load_8dir_atlas", "source": "game.html:32216", "expr": "_load8DirAtlas(1)"},
	{"id": "ens_reset", "source": "game.html:32217", "expr": "ens=[]"},
	{"id": "projs_recycle", "source": "game.html:32217", "expr": "for(…)_recycleProj(projs[_i]);projs.length=0"},
	{"id": "pprojs_recycle", "source": "game.html:32217", "expr": "for(…)_recyclePProj(pProjs[_ri]);pProjs.length=0"},
	{"id": "world_items_reset", "source": "game.html:32217", "expr": "worldItems=[]"},
	{"id": "map_objs_reset", "source": "game.html:32217", "expr": "MAP_OBJS=[]"},
	{"id": "g_parts_reset", "source": "game.html:32217", "expr": "G.parts=[]"},
	{"id": "g_txts_reset", "source": "game.html:32217", "expr": "G.txts=[]"},
	{"id": "g_hit_stop_reset", "source": "game.html:32217", "expr": "G.hitStop=0"},
	{"id": "g_slow_mo_reset", "source": "game.html:32217", "expr": "G.slowMo=0"},
	{"id": "g_cur_room_reset", "source": "game.html:32217", "expr": "G.curRoom=0"},
	{"id": "g_flash_t_reset", "source": "game.html:32217", "expr": "G._flashT=0"},
	{"id": "g_flash_col_reset", "source": "game.html:32217", "expr": "G._flashCol='#ffffff'"},
	{"id": "g_chroma_t_reset", "source": "game.html:32217", "expr": "G._chromaT=0"},
	{"id": "esp_cache_clear", "source": "game.html:32217", "expr": "_eSpCache.clear()"},
	{"id": "impacts_reset", "source": "game.html:32217", "expr": "_impacts=[]"},
	{"id": "vfx_anims_clear", "source": "game.html:32217", "expr": "_vfxAnims.length=0"},
	{"id": "fire_exps_clear", "source": "game.html:32217", "expr": "_fireExps.length=0"},
	{"id": "g_eb_bomb_reset", "source": "game.html:32217", "expr": "G._ebBomb=null"},
	{"id": "g_mm_bomb_reset", "source": "game.html:32217", "expr": "G._mmBomb=null"},
	{"id": "g_gs_bombs_reset", "source": "game.html:32217", "expr": "G._gsBombs=[]"},
	{"id": "g_bs_bombs_reset", "source": "game.html:32217", "expr": "G._bsBombs=[]"},
	{"id": "g_bone_walls_reset", "source": "game.html:32217", "expr": "G._boneWalls=[]"},
]

## G._fireZones 이후 unowned tail. 32222 이후 본문은 이 owner 범위 밖이며 열거하지 않는다.
const TAIL_STEPS := [
	{"id": "g_thunder_stakes_reset", "source": "game.html:32217", "expr": "G._thunderStakes=null"},
	{"id": "p_ts_aiming_reset", "source": "game.html:32217", "expr": "P._tsAiming=false"},
	{"id": "g_st_projs_reset", "source": "game.html:32217", "expr": "G._stProjs=[]"},
	{"id": "g_gw_lightning_reset", "source": "game.html:32217", "expr": "G._gwLightning=null"},
	{"id": "sh_dirty_set", "source": "game.html:32217", "expr": "_shDirty=true"},
	{"id": "eye_objs_clear", "source": "game.html:32217", "expr": "_eyeObjs.length=0"},
	{"id": "eye_inited_reset", "source": "game.html:32217", "expr": "_eyeInited=false"},
	{"id": "death_decals_clear", "source": "game.html:32217", "expr": "if(typeof _clearDeathDecals==='function')_clearDeathDecals()"},
	{"id": "boss_pattern_arrays_reset", "source": "game.html:32218~32221", "expr": "G._spiralBullets=[]…G._cageTraps=[]"},
	{"id": "init_stage_remainder", "source": "game.html:32222~", "expr": "initStage 나머지(맵/spawn/Player/camera 등) — 범위 밖"},
]

var _services: Dictionary = {}
var _sink: Callable = Callable()
var _owners: Array[Object] = []   # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 유지
var _episode := 0
var _started := false
var _resumed := false
var _ledger: Array = []
var _applied: Array = []
var _stop_reason := ""
var _stop_at := ""
var _si_input: Variant = null
var _si_clamped: Variant = null
var _boss_value: Variant = null
var _boss_branch := false
var _entry_published := false
var _gap_owner_record: Dictionary = {}
var _result: Dictionary = {"schema": SCHEMA, "status": STATUS_NOT_READY, "reason": "not_run",
	"stage_complete": false, "full_init_stage_ack": false, "g_on_written": false, "startup_on": false}


## services: SVC_* → Callable / holder. sink: Callable(command:Dictionary) -> {accepted:bool, reason?}.
## 생성 시 검사·호출 없음(preflight 없음). 누락은 원 호출 지점에서 NOT_READY 로 보고한다.
func _init(services: Dictionary, sink: Callable) -> void:
	_services = services.duplicate()
	_sink = sink
	_episode = get_instance_id()
	for v in _services.values():
		_retain(v)
	_retain(sink)


func _retain(v: Variant) -> void:
	if v is Callable:
		var o: Object = (v as Callable).get_object()
		if o is RefCounted and not _owners.has(o):
			_owners.append(o)


# ───────────────────────── static descriptors ─────────────────────────

static func gap_step_ids() -> Array[String]:
	var out: Array[String] = []
	for s in GAP_STEPS:
		out.append(String(s["id"]))
	return out


static func tail_step_ids() -> Array[String]:
	var out: Array[String] = []
	for s in TAIL_STEPS:
		out.append(String(s["id"]))
	return out


## 실제 Main 연결 상태. 이 owner 는 actual Main 에 설치되어 있지 않고 native service 다수가 없다.
static func actual_main_binding_report() -> Dictionary:
	return {
		"schema": SCHEMA, "status": STATUS_NOT_READY, "installed_in_actual_main": false,
		"missing": [
			SVC_HELLGUNNER_BLOOD, SVC_HELLGUNNER_LEAP, SVC_ROOT_RIFT, SVC_INTERACT_INPUT,
			SVC_LESSON_RESTORATION, SVC_BOSS_TEST_REQ + " (actual Main current/declared-default binding)",
			SVC_STAGE_GAP_OWNER + " (actual 32214~32217 body owner; none exists)",
			"current G sink installation over native_source_new_run_state.read_current_g",
			"owner for unowned tail after G._fireZones",
		],
		"positive_gap_path": POSITIVE_GAP_PATH,
		"public_candidates": [
			"parry_lesson_source/producer.gd (holder; Main binding unproven)",
			"native_source_new_run_state.gd read_current_g() (same G reader)",
		],
		"stage_complete": false, "startup_on": false,
	}


# ───────────────────────── run ─────────────────────────

## 이 episode 에서 단 1회. 원 initStage(si) 진입부를 32213 G.stage 까지 실행한다.
## 정상 종료는 PARTIAL_PENDING_GAP(전체 stage 완료 아님). 실패/boss 분기는 NOT_READY + 보존 prefix.
func run_entry(si: Variant) -> Dictionary:
	if _started:
		return {"schema": SCHEMA, "status": STATUS_ALREADY_STARTED, "reason": "single_shot", "episode": _episode,
			"stage_complete": false, "full_init_stage_ack": false}
	_started = true
	_si_input = si
	if not _callback(SVC_HELLGUNNER_BLOOD, "game.html:32196", []):
		return _finish(STATUS_NOT_READY)
	if not _callback(SVC_HELLGUNNER_LEAP, "game.html:32196", []):
		return _finish(STATUS_NOT_READY)
	if not _callback(SVC_ROOT_RIFT, "game.html:32197", [ROOT_RIFT_REASON]):
		return _finish(STATUS_NOT_READY)
	if not _callback(SVC_INTERACT_INPUT, "game.html:32198", []):
		return _finish(STATUS_NOT_READY)
	if not _sink_write(WRITE_PORTAL, "game.html:32199", [["_playerPortalPair", null]]):
		return _finish(STATUS_NOT_READY)
	if not _parry_lesson_branch():
		return _finish(STATUS_NOT_READY)
	if not _sink_write(WRITE_DRUID, "game.html:32201",
			[["_druidVictory", null], ["_druidFinaleBoss", null], ["_druidActCue", null]]):
		return _finish(STATUS_NOT_READY)
	if not _upper_clamp(si):
		return _finish(STATUS_NOT_READY)
	if not _boss_gate():
		return _finish(STATUS_NOT_READY)
	if not _sink_write(WRITE_STAGE, "game.html:32213", [["stage", _si_clamped]]):
		return _finish(STATUS_NOT_READY)
	return _finish(STATUS_PARTIAL_PENDING_GAP, "owned_prefix_applied_gap_32214_32217_pending")


## PARTIAL_PENDING_GAP 이후 이 episode 에서 단 1회. services.stage_gap_owner 실제 Callable 을 정확히 1회 invoke 한다.
## receipt/row/flag 인자는 받지 않는다: 인자가 주어지면 상태 변경 없이 RECEIPT_INPUT_REJECTED.
## 검사: Callable 유효·arity1 → get_object() 유효(Node 면 inside_tree·미queued) → owner 의 binding 선언
## {source:GAP_SOURCE, steps:GAP 24 ids, implementation:"actual_source_body"} → sink 공개 readonly
## read_current_same_g(episode) 의 현재 same G → invoke(context{episode,g,source,steps}) →
## 반환 {status:"CALLED", episode, source, g(is_same)} → 호출 후 같은 G 재확인 → fireZones sink 쓰기.
## 어느 하나라도 실패하면 즉시 NOT_READY(terminal). G.stage 까지 prefix 보존, fireZones 쓰기 0, source_entry_applied=false.
func resume_after_gap(receipt_input: Variant = null) -> Dictionary:
	if typeof(receipt_input) != TYPE_NIL:
		return {"schema": SCHEMA, "status": STATUS_RECEIPT_INPUT_REJECTED, "reason": "metadata_receipt_not_accepted",
			"episode": _episode, "source_entry_applied": false, "stage_complete": false, "full_init_stage_ack": false}
	if not _started or _resumed or str(_result.get("status", "")) != STATUS_PARTIAL_PENDING_GAP:
		return {"schema": SCHEMA, "status": STATUS_NOT_PENDING_GAP, "reason": "no_pending_gap", "episode": _episode,
			"source_entry_applied": false, "stage_complete": false, "full_init_stage_ack": false}
	_resumed = true
	if not _invoke_gap_owner():
		return _finish(STATUS_NOT_READY)
	if not _sink_write(WRITE_FIRE_ZONES, "game.html:32217", [["_fireZones", []]]):
		return _finish(STATUS_NOT_READY)
	_entry_published = true
	return _finish(STATUS_PARTIAL_TAIL_PENDING, "owned_entry_subset_applied_tail_unowned")


# ───────────────────────── getters (방어 복사) ─────────────────────────

func last_result() -> Dictionary:
	return _result.duplicate(true)


func ledger() -> Array:
	return _ledger.duplicate(true)


func episode() -> int:
	return _episode


# ───────────────────────── steps ─────────────────────────

func _callback(id: String, source: String, args: Array) -> bool:
	var entry := {"id": id, "source": source, "kind": "callback", "args": args.duplicate()}
	var c: Variant = _services.get(id)
	if not (c is Callable) or not (c as Callable).is_valid():
		return _fail_entry(entry, "service_missing:" + id)
	return _invoke(entry, c as Callable, args)


## adapter envelope 해석. 반환이 Dictionary{status:String}이 아니면(스크립트 오류 null 포함) 프로토콜 위반으로 정지.
func _invoke(entry: Dictionary, cb: Callable, args: Array) -> bool:
	var id := String(entry["id"])
	if cb.get_argument_count() != args.size():
		return _fail_entry(entry, "service_arity:" + id)
	var r: Variant = cb.callv(args)
	if not (r is Dictionary) or not ((r as Dictionary).get("status") is String):
		return _fail_entry(entry, "service_protocol_invalid:" + id)
	var st := String((r as Dictionary)["status"])
	var why := str((r as Dictionary).get("reason", ""))
	match st:
		CALL_COMPLETED:
			entry["outcome"] = CALL_COMPLETED
			entry["source_return_ignored"] = true
			_ledger.append(entry)
			return true
		CALL_NOT_READY:
			return _fail_entry(entry, "service_not_ready:%s:%s" % [id, why])
		CALL_THREW:
			return _fail_entry(entry, "service_threw:%s:%s" % [id, why])
	return _fail_entry(entry, "service_protocol_invalid:" + id)


func _sink_write(id: String, source: String, fields: Array) -> bool:
	var keys: Array = []
	for f in fields:
		keys.append(f[0])
	var entry := {"id": id, "source": source, "kind": "owned_sink_write", "fields": keys}
	if not _sink.is_valid():
		return _fail_entry(entry, "sink_missing")
	var cmd := {"schema": SINK_COMMAND_SCHEMA, "episode": _episode, "id": id, "source": source, "fields": fields}
	var ack: Variant = _sink.call(cmd)
	if not (ack is Dictionary) or typeof((ack as Dictionary).get("accepted")) != TYPE_BOOL:
		return _fail_entry(entry, "sink_protocol_invalid:" + id)
	if not bool((ack as Dictionary)["accepted"]):
		return _fail_entry(entry, "sink_rejected:%s:%s" % [id, str((ack as Dictionary).get("reason", ""))])
	entry["outcome"] = "ACCEPTED"
	_ledger.append(entry)
	_applied.append(id)
	return true


## 32200: if(window._parryLesson){window._parryLesson.finish();window._parryLesson.seen=false;}
## window._parryLesson 은 원처럼 세 번(조건/finish/seen) 현재 holder 에서 읽는다.
func _parry_lesson_branch() -> bool:
	var entry := {"id": "parry_lesson", "source": "game.html:32200", "kind": "lesson_branch"}
	var holder: Variant = _services.get(SVC_LESSON_HOLDER)
	if typeof(holder) != TYPE_OBJECT or not is_instance_valid(holder):
		return _fail_entry(entry, "parry_lesson_holder_missing")
	for m in LESSON_HOLDER_METHODS:
		if not (holder as Object).has_method(m):
			return _fail_entry(entry, "parry_lesson_holder_api_missing:" + String(m))
	var auth := str(holder.get_authority())
	entry["authority"] = auth
	if LESSON_AUTH_DECLARED_FALSY.has(auth):
		entry["outcome"] = "branch_skipped_declared_falsy"
		_ledger.append(entry)
		return true
	if auth != LESSON_AUTH_CURRENT:
		return _fail_entry(entry, "parry_lesson_authority_missing:" + auth)
	var lesson: Variant = holder.get_current_lesson_reference()
	if typeof(lesson) == TYPE_NIL:
		return _fail_entry(entry, "parry_lesson_current_not_live")
	# finish(): parry-lesson.js:686 `if(!this.active)return;` → 687-697 외부 복원 → 698 상태
	var active := _lesson_read(lesson, "active")
	var t: Variant = holder.js_truthy(active["value"]) if active["present"] else false
	if typeof(t) != TYPE_BOOL:
		return _fail_entry(entry, "parry_lesson_active_unsupported_type")
	if bool(t):
		var restore: Variant = _services.get(SVC_LESSON_RESTORATION)
		if not (restore is Callable) or not (restore as Callable).is_valid():
			return _fail_entry(entry, "service_missing:" + SVC_LESSON_RESTORATION)
		var sub := {"id": SVC_LESSON_RESTORATION, "source": "parry-lesson.js:687-697", "kind": "callback", "args": []}
		if not _invoke(sub, restore as Callable, []):
			_stop_at = "parry_lesson"
			return false
		var fin: Variant = holder.adopt_finish_state_projection()
		if not (fin is Dictionary) or not bool((fin as Dictionary).get("ready", false)) \
				or String((fin as Dictionary).get("outcome", "")) != "finish_state_written":
			var why := str((fin as Dictionary).get("outcome", (fin as Dictionary).get("reason", ""))) if fin is Dictionary else "invalid"
			return _fail_entry(entry, "parry_lesson_finish_state_not_written:" + why)
		entry["finish"] = "finish_state_written"
	else:
		entry["finish"] = "finish_guard_returned"
	var current: Variant = holder.get_current_lesson_reference()
	if typeof(current) == TYPE_NIL:
		return _fail_entry(entry, "parry_lesson_absent_at_seen_assignment")
	if not _lesson_write_seen_false(current):
		return _fail_entry(entry, "parry_lesson_seen_unwritable")
	entry["seen_assigned"] = false
	entry["outcome"] = "finish_and_seen_false"
	_ledger.append(entry)
	return true


## 32202: 상한만 clamp. 하한/소수/정수화 없음. 숫자 아닌 si 는 JS 강제변환을 재현하지 않고 정지.
func _upper_clamp(si: Variant) -> bool:
	var entry := {"id": "stage_upper_clamp", "source": "game.html:32202", "kind": "source_expr"}
	var t := typeof(si)
	if t != TYPE_INT and t != TYPE_FLOAT:
		return _fail_entry(entry, "si_unsupported_type:%d" % t)
	var over: bool = si >= TOTAL_STAGES   # NaN → false (원과 동일), +INF → true
	_si_clamped = TOTAL_STAGES - 1 if over else si
	entry["clamped"] = over
	entry["outcome"] = "EVALUATED"
	_ledger.append(entry)
	return true


## 32204: if(_bossTestReq>=0){…return;} — 분기 본문은 미소유. 참이면 NOT_READY unowned_boss_branch.
func _boss_gate() -> bool:
	var entry := {"id": "boss_test_gate", "source": "game.html:32204", "kind": "source_gate"}
	var c: Variant = _services.get(SVC_BOSS_TEST_REQ)
	if not (c is Callable) or not (c as Callable).is_valid() or (c as Callable).get_argument_count() != 0:
		return _fail_entry(entry, "boss_test_req_missing")
	var env: Variant = (c as Callable).call()
	if not (env is Dictionary):
		return _fail_entry(entry, "boss_test_req_protocol_invalid")
	var e: Dictionary = env
	if str(e.get("status", "")) != "READY":
		return _fail_entry(entry, "boss_test_req_not_ready:" + str(e.get("reason", "")))
	var auth := str(e.get("authority", ""))
	if auth != BOSS_AUTH_CURRENT and auth != BOSS_AUTH_DECLARED_BOOT_DEFAULT:
		return _fail_entry(entry, "boss_test_req_authority_invalid:" + auth)
	var v: Variant = e.get("value")
	if typeof(v) != TYPE_INT and typeof(v) != TYPE_FLOAT:
		return _fail_entry(entry, "boss_test_req_unsupported:%d" % typeof(v))
	_boss_value = v
	entry["authority"] = auth
	entry["value"] = v
	if v >= 0:   # NaN 은 false (원과 동일)
		_boss_branch = true
		return _fail_entry(entry, "unowned_boss_branch")
	entry["outcome"] = "NORMAL_BRANCH"
	_ledger.append(entry)
	return true


## 32214~32217 gap: 실제 owner Callable 1회 invoke. 이 모듈은 gap 본문을 구현하지 않는다.
func _invoke_gap_owner() -> bool:
	var entry := {"id": "unowned_gap", "source": GAP_SOURCE, "kind": "gap_owner_callback",
		"positive_path": POSITIVE_GAP_PATH}
	var c: Variant = _services.get(SVC_STAGE_GAP_OWNER)
	if not (c is Callable) or not (c as Callable).is_valid():
		return _fail_entry(entry, "stage_gap_owner_missing")
	var cb: Callable = c
	if cb.get_argument_count() != 1:
		return _fail_entry(entry, "stage_gap_owner_arity")
	var owner: Object = cb.get_object()
	if owner == null or not is_instance_valid(owner):
		return _fail_entry(entry, "stage_gap_owner_object_missing")
	if owner is Node and (not (owner as Node).is_inside_tree() or (owner as Node).is_queued_for_deletion()):
		return _fail_entry(entry, "stage_gap_owner_lifecycle_invalid")
	if not owner.has_method(GAP_BINDING_METHOD):
		return _fail_entry(entry, "stage_gap_owner_binding_undeclared")
	var binding: Variant = owner.call(GAP_BINDING_METHOD)
	if not (binding is Dictionary) or str((binding as Dictionary).get("source", "")) != GAP_SOURCE \
			or str((binding as Dictionary).get("implementation", "")) != GAP_BINDING_IMPLEMENTATION \
			or not ((binding as Dictionary).get("steps") is Array) \
			or (binding as Dictionary)["steps"] != Array(gap_step_ids()):
		return _fail_entry(entry, "stage_gap_owner_binding_invalid")
	var g: Variant = _sink_current_same_g()
	if typeof(g) != TYPE_DICTIONARY:
		return _fail_entry(entry, "current_same_g_unavailable_before_gap")
	var context := {"schema": GAP_CONTEXT_SCHEMA, "episode": _episode, "g": g, "source": GAP_SOURCE,
		"steps": Array(gap_step_ids())}
	entry["invoked"] = true
	var r: Variant = cb.call(context)
	if not (r is Dictionary) or not ((r as Dictionary).get("status") is String):
		return _fail_entry(entry, "stage_gap_owner_protocol_invalid")
	var e: Dictionary = r
	var st := String(e["status"])
	if st == CALL_NOT_READY:
		return _fail_entry(entry, "stage_gap_owner_not_ready:" + str(e.get("reason", "")))
	if st == CALL_THREW:
		return _fail_entry(entry, "stage_gap_owner_threw:" + str(e.get("reason", "")))
	if st != CALL_COMPLETED or typeof(e.get("episode")) != TYPE_INT or int(e["episode"]) != _episode \
			or str(e.get("source", "")) != GAP_SOURCE or typeof(e.get("g")) != TYPE_DICTIONARY \
			or not is_same(e["g"], g):
		return _fail_entry(entry, "stage_gap_owner_protocol_invalid")
	var after: Variant = _sink_current_same_g()
	if typeof(after) != TYPE_DICTIONARY or not is_same(after, g):
		return _fail_entry(entry, "current_g_identity_changed_during_gap")
	entry["outcome"] = CALL_COMPLETED
	_gap_owner_record = {"owner_class": owner.get_class(), "invoked": true, "status": CALL_COMPLETED}
	_ledger.append(entry)
	return true


## 주입 sink 의 owner 가 StageEntryGSink 공개 readonly read_current_same_g 를 제공할 때만 G 를 얻는다.
func _sink_current_same_g() -> Variant:
	if not _sink.is_valid():
		return null
	var so: Object = _sink.get_object()
	if so == null or not is_instance_valid(so) or not so.has_method("read_current_same_g"):
		return null
	return so.call("read_current_same_g", _episode)


# ───────────────────────── internals ─────────────────────────

func _fail_entry(entry: Dictionary, reason: String) -> bool:
	entry["outcome"] = "STOPPED"
	entry["reason"] = reason
	_ledger.append(entry)
	_stop_reason = reason
	_stop_at = String(entry["id"])
	return false


func _finish(status: String, reason: String = "") -> Dictionary:
	_result = {
		"schema": SCHEMA, "status": status, "reason": reason if status != STATUS_NOT_READY else _stop_reason,
		"episode": _episode, "stopped_at": _stop_at if status == STATUS_NOT_READY else "",
		"source": SOURCE_INIT_STAGE, "total_stages_source": SOURCE_TOTAL_STAGES,
		"ledger": _ledger.duplicate(true), "applied_prefix": _applied.duplicate(),
		"source_entry_applied": _entry_published,
		"pending_gap": gap_step_ids() if status == STATUS_PARTIAL_PENDING_GAP else [],
		"unowned_tail": tail_step_ids() if status == STATUS_PARTIAL_TAIL_PENDING else [],
		"unowned_boss_branch": BOSS_BRANCH_UNOWNED.duplicate(true) if _boss_branch else [],
		"gap_owner": _gap_owner_record.duplicate(true), "positive_gap_path": POSITIVE_GAP_PATH,
		"si_input": _si_input, "si_after_upper_clamp": _si_clamped, "boss_test_req": _boss_value,
		"stage_complete": false, "full_init_stage_ack": false, "g_on_written": false, "startup_on": false,
		"rollback": false, "atomic": false, "main_binding_proven": false,
	}
	return last_result()


static func _obj_has(o: Object, key: String) -> bool:
	for p in o.get_property_list():
		if String(p.name) == key:
			return true
	return false


## {present, value} — JS 속성 접근. 없는 속성은 undefined(present=false).
static func _lesson_read(lesson: Variant, key: String) -> Dictionary:
	if lesson is Dictionary:
		return {"present": (lesson as Dictionary).has(key), "value": (lesson as Dictionary).get(key)}
	if typeof(lesson) == TYPE_OBJECT and is_instance_valid(lesson) and _obj_has(lesson, key):
		return {"present": true, "value": (lesson as Object).get(key)}
	return {"present": false, "value": null}


static func _lesson_write_seen_false(lesson: Variant) -> bool:
	if lesson is Dictionary:
		(lesson as Dictionary)["seen"] = false
		return typeof((lesson as Dictionary)["seen"]) == TYPE_BOOL and not bool((lesson as Dictionary)["seen"])
	if typeof(lesson) == TYPE_OBJECT and is_instance_valid(lesson) and _obj_has(lesson, "seen"):
		(lesson as Object).set("seen", false)
		var v: Variant = (lesson as Object).get("seen")
		return typeof(v) == TYPE_BOOL and not bool(v)
	return false


# ───────────────────────── source-backed G sink ─────────────────────────

## 단일 G sink. 주입된 current G reader(실제 Main 은 native_source_new_run_state.read_current_g)를 쓰기마다 1회 읽고,
## 같은 episode 안에서 처음 읽은 G 와 is_same 이 아니면 거절한다. 허용 command 4종 외 쓰기 없음.
class StageEntryGSink extends RefCounted:
	const SPEC := {
		"player_portal_pair": ["_playerPortalPair"],
		"druid_reset": ["_druidVictory", "_druidFinaleBoss", "_druidActCue"],
		"stage": ["stage"],
		"fire_zones": ["_fireZones"],
	}
	var _reader: Callable
	var _reader_owner: Object = null
	var _episode := 0
	var _pinned: Variant = null
	var counts := {"accepted": 0, "rejected": 0, "g_reads": 0}

	func _init(current_g_reader: Callable) -> void:
		_reader = current_g_reader
		var o: Object = current_g_reader.get_object()
		if o is RefCounted:
			_reader_owner = o

	func as_sink() -> Callable:
		return consume

	func pinned_g_is(candidate: Variant) -> bool:
		return typeof(_pinned) == TYPE_DICTIONARY and typeof(candidate) == TYPE_DICTIONARY and is_same(_pinned, candidate)

	## 공개 readonly: reader 를 1회 읽어 이 episode 에서 이미 쓴 같은 G 이면 그 참조, 아니면 null. pin/쓰기 없음.
	func read_current_same_g(episode: int) -> Variant:
		if episode != _episode or typeof(_pinned) != TYPE_DICTIONARY or not _reader.is_valid():
			return null
		var g: Variant = _reader.call()
		counts["g_reads"] += 1
		if typeof(g) != TYPE_DICTIONARY or not is_same(g, _pinned):
			return null
		return g

	func _reject(reason: String) -> Dictionary:
		counts["rejected"] += 1
		return {"accepted": false, "reason": reason}

	func _value_invalid(id: String, v: Variant) -> String:
		match id:
			"stage":
				if typeof(v) == TYPE_INT:
					return ""
				if typeof(v) == TYPE_FLOAT:
					return "stage_value_unsupported:nonfinite" if (is_nan(v) or is_inf(v)) else ""
				return "stage_value_unsupported:type%d" % typeof(v)
			"fire_zones":
				return "" if (v is Array and (v as Array).is_empty()) else "fire_zones_value_not_empty_array"
		return "" if typeof(v) == TYPE_NIL else "value_not_null"

	func consume(command: Variant) -> Dictionary:
		if not (command is Dictionary):
			return _reject("command_not_dictionary")
		var c: Dictionary = command
		var id := str(c.get("id", ""))
		if not SPEC.has(id):
			return _reject("command_id_unowned:" + id)
		if typeof(c.get("episode")) != TYPE_INT:
			return _reject("command_episode_missing")
		if not (c.get("fields") is Array):
			return _reject("command_fields_missing")
		var fields: Array = c["fields"]
		var keys: Array = SPEC[id]
		if fields.size() != keys.size():
			return _reject("command_fields_mismatch")
		for i in fields.size():
			if not (fields[i] is Array) or (fields[i] as Array).size() != 2 or str(fields[i][0]) != String(keys[i]):
				return _reject("command_fields_mismatch")
			var why := _value_invalid(id, fields[i][1])
			if not why.is_empty():
				return _reject(why)
		if not _reader.is_valid():
			return _reject("current_g_reader_missing")
		var g: Variant = _reader.call()
		counts["g_reads"] += 1
		if typeof(g) != TYPE_DICTIONARY:
			return _reject("current_g_unavailable")
		if int(c["episode"]) != _episode:
			_episode = int(c["episode"])
			_pinned = null
		if typeof(_pinned) == TYPE_DICTIONARY and not is_same(_pinned, g):
			return _reject("current_g_identity_changed")
		_pinned = g
		var gd: Dictionary = g
		var written: Array = []
		for i in fields.size():
			var k := String(keys[i])
			if id == "fire_zones":
				var arr: Array = []
				gd[k] = arr
				if not is_same(gd[k], arr):
					return _reject("write_verify_failed:" + k)
			else:
				var v: Variant = fields[i][1]
				gd[k] = v
				if not gd.has(k) or typeof(gd[k]) != typeof(v) or (typeof(v) != TYPE_NIL and gd[k] != v):
					return _reject("write_verify_failed:" + k)
			written.append(k)
		counts["accepted"] += 1
		return {"accepted": true, "id": id, "writes": written}
