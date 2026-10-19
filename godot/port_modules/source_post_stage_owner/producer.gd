extends Node
## Source postStage boot continuation owner (first slice).
##
## Source (canonical game.html 64466..64481, after initStage at 64464):
##   64466  if(_bossTestReq<0){
##   64467    setBootLoading(90,_T('맵 에셋 로딩...'));
##   64468    await _waitObjSprites(8000);
##   64469    await new Promise(r=>setTimeout(r,0));
##   64470    if(_bootMapBuildPromise){
##   64471      setBootLoading(97,_T('맵 캐시 생성 중...'));
##   64472      await _bootMapBuildPromise;
##   64473    }
##   64474  }
##   64475  if(!(_forceCutscene||(G.stage===0&&!G._cutsceneDone)))BGM.play(BGM.stageKey(G.stage));
##   64476  await _prepareStartMapView();
##   64477  setBootLoading(100,'완료');
##   64478  hideBootLoading();
##   64479  _dbReady=true;
##   64480  startAutoSave();
##   64481  _rootRiftViewScheduleBootSave();
##
## This Node invokes the bound actual services in that order and awaits each async
## seam. It never writes G/P, never builds world/data, never implements the bodies of
## _waitObjSprites / _prepareStartMapView / save timers. completion() publishes the
## source_startup_activation post_stage packet only after every step returned a
## structured success; pending/missing/failure/stop leaves it null. Completed side
## effects are kept (no rollback). No once/frame/global gate: each run_post_stage()
## re-reads every reader. Upstream Main initStage binding does not exist: main_ready=false.

const Startup := preload("res://port_modules/source_startup_activation/producer.gd")

const STATUS_COMPLETED := "COMPLETED"
const STATUS_NOT_READY := "NOT_READY"

const SPRITE_WAIT_MS := 8000
const LABEL_ASSETS := "맵 에셋 로딩..."
const LABEL_CACHE := "맵 캐시 생성 중..."
const LABEL_DONE := "완료"

# Peer source_object_sprite_wait_owner.wait_obj_sprites(timeout_ms) packet (actual-declared only).
const WAIT_SCHEMA := "fdg.source_object_sprite_wait_owner.packet.v1"
const WAIT_SOURCE_REF := "game.html:18787-18800 _waitObjSprites(timeout)"
const WAIT_TERMINAL := "SOURCE_RESOLVED"
const WAIT_STATUSES := ["SOURCE_WAIT_COMPLETED", "SOURCE_WAIT_TIMED_OUT"]
const WAIT_VERDICT := "ACTUAL_PUBLICATION_DECLARED_BY_ALL_READS"

# Peer prepare owner run_prepare_start_map_view() result.
const PREPARE_STATUS := "SOURCE_RETURNED"
const PREPARE_RETURN_PATHS := ["DISABLED_AT_ENTRY", "DISABLED_IN_LOOP", "READY", "READY_EMPTY_IDS", "FALLBACK_ERROR", "FALLBACK_TIMEOUT"]

## binding name -> exact argument count of the bound Callable.
const SERVICES := {
	"current_g": 0,
	"current_p": 0,
	"boss_request": 0,
	"force_cutscene": 0,
	"localize": 1,
	"set_boot_loading": 2,
	"wait_obj_sprites": 1,
	"boot_map_build_promise": 0,
	"await_boot_map_build": 1,
	"bgm_stage_key": 1,
	"bgm_play": 1,
	"prepare_start_map_view": 0,
	"hide_boot_loading": 0,
	"set_db_ready": 1,
	"start_auto_save": 0,
	"schedule_boot_save": 0,
}

# Step ids (completed_prefix entries), source order.
const STEP_BOSS_READ := "64466 read _bossTestReq"
const STEP_LOADING_90 := "64467 setBootLoading(90)"
const STEP_WAIT_SPRITES := "64468 await _waitObjSprites(8000)"
const STEP_TIMEOUT_0 := "64469 await setTimeout(0)"
const STEP_PROMISE_READ := "64470 read _bootMapBuildPromise"
const STEP_LOADING_97 := "64471 setBootLoading(97)"
const STEP_AWAIT_PROMISE := "64472 await _bootMapBuildPromise"
const STEP_BGM_GATE := "64475 BGM gate"
const STEP_BGM_PLAY := "64475 BGM.play(BGM.stageKey(G.stage))"
const STEP_PREPARE_VIEW := "64476 await _prepareStartMapView()"
const STEP_LOADING_100 := "64477 setBootLoading(100)"
const STEP_HIDE := "64478 hideBootLoading()"
const STEP_DB_READY := "64479 _dbReady=true"
const STEP_AUTOSAVE := "64480 startAutoSave()"
const STEP_BOOT_SAVE := "64481 _rootRiftViewScheduleBootSave()"

var _bindings: Dictionary = {}
var _holds: Array = []          # strong refs to RefCounted callback owners
var _completion = null
var _running := false
var _prefix: Array = []


func configure(bindings: Dictionary) -> Dictionary:
	_bindings = {}
	_holds = []
	_completion = null
	var missing: Array = []
	var invalid: Array = []
	for key in SERVICES:
		var c = bindings.get(key)
		if not c is Callable:
			missing.append(key)
			continue
		var reason := _callable_problem(key, c)
		if reason != "":
			invalid.append(reason)
			continue
		_bindings[key] = c
		var cb_owner = (c as Callable).get_object()
		if cb_owner is RefCounted:
			_holds.append(cb_owner)
	return {
		"status": "CONFIGURED" if missing.is_empty() and invalid.is_empty() else STATUS_NOT_READY,
		"missing": missing,
		"invalid": invalid,
		"main_ready": false,
	}


## Bound provider for source_startup_activation `post_stage_completion`.
func completion():
	if _stopped():
		return null
	return _completion


func run_post_stage() -> Dictionary:
	if _running:
		return {"status": STATUS_NOT_READY, "reason": "RUN_IN_PROGRESS", "completed_prefix": [], "completion": null, "main_ready": false}
	_completion = null
	_prefix = []
	if _stopped():
		return _nr("NOT_IN_TREE")
	_running = true
	var r := await _run()
	_running = false
	return r


func _run() -> Dictionary:
	# Fundamental readers: G (non-null), P (null allowed only if actually null), boss.
	var g_read := _read_g()
	if g_read.has("reason"):
		return _nr(g_read.reason)
	var g0 = g_read.value
	var p_read := _read_p()
	if p_read.has("reason"):
		return _nr(p_read.reason)
	var p0 = p_read.value
	var boss_r := _call_sync("boss_request", [])
	if boss_r.has("reason"):
		return _nr(boss_r.reason)
	var boss = boss_r.value
	if not _is_boss_request(boss):
		return _nr("INVALID_BOSS_REQUEST")
	_prefix.append(STEP_BOSS_READ)

	if float(boss) < 0.0:
		var label_r := _localize(LABEL_ASSETS)
		if label_r.has("reason"):
			return _nr(label_r.reason)
		var s := _applied("set_boot_loading", [90, label_r.value], STEP_LOADING_90)
		if s != "":
			return _nr(s)

		var w := await _call_async("wait_obj_sprites", [SPRITE_WAIT_MS])
		if w.has("reason"):
			return _nr(w.reason)
		# Peer source_object_sprite_wait_owner packet. Source-authoritative timeout also
		# continues (source awaits then proceeds). Constructor UNVERIFIED_* is rejected
		# even with source_resolved=true. Texture/stage readiness is not required.
		var wv = w.value
		if not _is_source_wait(wv, (_bindings["wait_obj_sprites"] as Callable).get_object()):
			return _nr("WAIT_OBJ_SPRITES_NOT_SOURCE_RESOLVED:" + _status_of(wv))
		_prefix.append(STEP_WAIT_SPRITES)
		if _stopped():
			return _nr("OWNER_STOPPED")

		# setTimeout(0): actual SceneTree timer, no artificial clock.
		if not is_inside_tree():
			return _nr("NOT_IN_TREE")
		await get_tree().create_timer(0.0).timeout
		_prefix.append(STEP_TIMEOUT_0)
		if _stopped():
			return _nr("OWNER_STOPPED")

		# Dynamic global, queried only now (after sprite wait + timer 0).
		var pr := _call_sync("boot_map_build_promise", [])
		if pr.has("reason"):
			return _nr(pr.reason)
		var promise = pr.value
		_prefix.append(STEP_PROMISE_READ)
		if _truthy(promise):
			var cache_r := _localize(LABEL_CACHE)
			if cache_r.has("reason"):
				return _nr(cache_r.reason)
			s = _applied("set_boot_loading", [97, cache_r.value], STEP_LOADING_97)
			if s != "":
				return _nr(s)
			var a := await _call_async("await_boot_map_build", [promise])
			if a.has("reason"):
				return _nr(a.reason)
			if not a.value is Dictionary or a.value.get("status") != "RESOLVED":
				return _nr("BOOT_MAP_BUILD_NOT_RESOLVED:" + _status_of(a.value))
			_prefix.append(STEP_AWAIT_PROMISE)
			if _stopped():
				return _nr("OWNER_STOPPED")

	# 64475: _forceCutscene and current G re-read after the waits.
	var f := _call_sync("force_cutscene", [])
	if f.has("reason"):
		return _nr(f.reason)
	g_read = _read_g()
	if g_read.has("reason"):
		return _nr(g_read.reason)
	if not is_same(g_read.value, g0):
		return _nr("CURRENT_G_CHANGED")
	var stage_f: Dictionary = _field(g0, "stage")
	var done_f: Dictionary = _field(g0, "_cutsceneDone")
	if stage_f.has("reason") or done_f.has("reason"):
		return _nr("INVALID_G_AUTHORITY")
	var stage_zero: bool = stage_f.present and _is_strict_zero(stage_f.value)
	var cutscene_done: bool = done_f.present and _truthy(done_f.value)
	var hold_bgm: bool = _truthy(f.value) or (stage_zero and not cutscene_done)
	_prefix.append(STEP_BGM_GATE)
	if not hold_bgm:
		var key_r := _call_sync("bgm_stage_key", [stage_f.get("value")])
		if key_r.has("reason"):
			return _nr(key_r.reason)
		if not key_r.value is String:
			return _nr("BGM_STAGE_KEY_NOT_STRING")
		var s2 := _applied("bgm_play", [key_r.value], STEP_BGM_PLAY)
		if s2 != "":
			return _nr(s2)

	var v := await _call_async("prepare_start_map_view", [])
	if v.has("reason"):
		return _nr(v.reason)
	# Peer prepare owner: run_prepare_start_map_view() -> SOURCE_RETURNED + source return path.
	# Its readiness claims (full_map/texture/gpu/native_main/stage/g_on) are not required.
	if not v.value is Dictionary or v.value.get("status") != PREPARE_STATUS \
			or not PREPARE_RETURN_PATHS.has(v.value.get("return_path")):
		return _nr("PREPARE_START_MAP_VIEW_NOT_RETURNED:" + _status_of(v.value))
	_prefix.append(STEP_PREPARE_VIEW)
	if _stopped():
		return _nr("OWNER_STOPPED")

	var s3 := _applied("set_boot_loading", [100, LABEL_DONE], STEP_LOADING_100)
	if s3 != "":
		return _nr(s3)
	s3 = _applied("hide_boot_loading", [], STEP_HIDE)
	if s3 != "":
		return _nr(s3)
	s3 = _applied("set_db_ready", [true], STEP_DB_READY)
	if s3 != "":
		return _nr(s3)
	s3 = _scheduled("start_auto_save", STEP_AUTOSAVE)
	if s3 != "":
		return _nr(s3)
	s3 = _scheduled("schedule_boot_save", STEP_BOOT_SAVE)
	if s3 != "":
		return _nr(s3)

	# Completion authority: same current G/P as observed at start.
	g_read = _read_g()
	if g_read.has("reason"):
		return _nr(g_read.reason)
	if not is_same(g_read.value, g0):
		return _nr("CURRENT_G_CHANGED")
	p_read = _read_p()
	if p_read.has("reason"):
		return _nr(p_read.reason)
	if not is_same(p_read.value, p0):
		return _nr("CURRENT_P_CHANGED")
	if _stopped():
		return _nr("OWNER_STOPPED")

	var pkt := {
		"contract": Startup.CONTRACT_POST_STAGE,
		"source_owner": Startup.POST_STAGE_SOURCE_OWNER,
		"completed_boundaries": Startup.POST_STAGE_BOUNDARIES.duplicate(),
		"authority_owner": self,
		"authority_g": g0,
		"authority_p": p0,
		"boss_request_observed": boss,
	}
	pkt.make_read_only()
	_completion = pkt
	return {
		"status": STATUS_COMPLETED,
		"reason": "",
		"completed_prefix": _prefix.duplicate(),
		"completion": pkt,
		"main_ready": false,
	}


# --- service invocation ---

func _callable_problem(key: String, c: Callable) -> String:
	if not c.is_valid():
		return "INVALID_BINDING:" + key
	if c.get_object() == null:
		return "BINDING_OWNER_NULL:" + key
	if c.get_argument_count() != SERVICES[key]:
		return "BINDING_ARITY:" + key
	return ""


func _service(key: String) -> Dictionary:
	if not _bindings.has(key):
		return {"reason": "MISSING_BINDING:" + key}
	var c: Callable = _bindings[key]
	if not c.is_valid() or not is_instance_valid(c.get_object()):
		return {"reason": "BINDING_OWNER_FREED:" + key}
	return {"callable": c}


func _call_sync(key: String, args: Array) -> Dictionary:
	var s := _service(key)
	if s.has("reason"):
		return s
	return {"value": (s.callable as Callable).callv(args)}


func _call_async(key: String, args: Array) -> Dictionary:
	var s := _service(key)
	if s.has("reason"):
		return s
	var value = await (s.callable as Callable).callv(args)
	if _stopped():
		return {"reason": "OWNER_STOPPED"}
	return {"value": value}


func _localize(text: String) -> Dictionary:
	var r := _call_sync("localize", [text])
	if r.has("reason"):
		return r
	if not r.value is String:
		return {"reason": "LOCALIZE_NOT_STRING"}
	return r


## Synchronous mutator: requires structured {"status": "APPLIED"}; bare bool is not owner completion.
func _applied(key: String, args: Array, step: String) -> String:
	var r := _call_sync(key, args)
	if r.has("reason"):
		return r.reason
	if not r.value is Dictionary or r.value.get("status") != "APPLIED":
		return key.to_upper() + "_NOT_APPLIED:" + _status_of(r.value)
	_prefix.append(step)
	return ""


## Save lifecycle owner registration: {ready:true, status:"SCHEDULED", id, due_ms, ticketed}.
## Registration only; not save completion.
func _scheduled(key: String, step: String) -> String:
	var r := _call_sync(key, [])
	if r.has("reason"):
		return r.reason
	var v = r.value
	if not v is Dictionary or v.get("ready") != true or v.get("status") != "SCHEDULED" \
			or not v.has("id") or not v.has("due_ms") or not v.get("ticketed") is bool:
		return key.to_upper() + "_NOT_SCHEDULED:" + _status_of(v)
	_prefix.append(step)
	return ""


func _read_g() -> Dictionary:
	var r := _call_sync("current_g", [])
	if r.has("reason"):
		return r
	if typeof(r.value) == TYPE_NIL:
		return {"reason": "SOURCE_G_NULL"}
	if not (r.value is Dictionary or r.value is Object):
		return {"reason": "INVALID_G_AUTHORITY"}
	return r


func _read_p() -> Dictionary:
	var r := _call_sync("current_p", [])
	if r.has("reason"):
		return r
	if typeof(r.value) != TYPE_NIL and not (r.value is Dictionary or r.value is Object):
		return {"reason": "INVALID_P_AUTHORITY"}
	return r


func _stopped() -> bool:
	return not is_instance_valid(self) or is_queued_for_deletion() or not is_inside_tree()


func _nr(reason: String) -> Dictionary:
	_completion = null
	return {
		"status": STATUS_NOT_READY,
		"reason": reason,
		"completed_prefix": _prefix.duplicate(),
		"completion": null,
		"main_ready": false,
	}


# --- JS semantics / local readers ---

## _bossTestReq domain (game.html:3855): int, or finite integral float, >= -1. bool/null/String rejected.
static func _is_boss_request(v) -> bool:
	if v is int:
		return v >= -1
	if v is float:
		return is_finite(v) and v == floor(v) and v >= -1.0
	return false


## Property presence on the actual G holder: {present, value}; {reason} if holder invalid.
static func _field(holder, field: String) -> Dictionary:
	if holder is Dictionary:
		var d: Dictionary = holder
		if d.has(field):
			return {"present": true, "value": d[field]}
		return {"present": false}
	if holder is Object:
		if not is_instance_valid(holder):
			return {"reason": "freed"}
		for prop in (holder as Object).get_property_list():
			if prop["name"] == field:
				return {"present": true, "value": (holder as Object).get(field)}
		return {"present": false}
	return {"reason": "invalid"}


## Peer packet must come from the bound wait owner: same Object, valid Node inside tree.
static func _is_source_wait(v, bound_owner) -> bool:
	if not v is Dictionary:
		return false
	var d: Dictionary = v
	var pkt_owner = d.get("authority_owner")
	if not is_instance_valid(bound_owner) or not bound_owner is Node:
		return false
	if typeof(pkt_owner) != TYPE_OBJECT or not is_same(pkt_owner, bound_owner):
		return false
	if not (bound_owner as Node).is_inside_tree() or d.get("owner_in_tree") != true:
		return false
	return d.get("schema") == WAIT_SCHEMA and d.get("source_ref") == WAIT_SOURCE_REF \
		and d.get("terminal") == WAIT_TERMINAL and d.get("source_resolved") == true \
		and WAIT_STATUSES.has(d.get("status")) and d.get("publication_verdict") == WAIT_VERDICT


static func _status_of(v) -> String:
	if v is Dictionary:
		if v.has("reason"):
			return str(v.get("status", "NO_STATUS")) + ":" + str(v["reason"])
		if v.has("not_ready_reason"):
			return str(v.get("status", "NO_STATUS")) + ":" + str(v["not_ready_reason"])
		return str(v.get("status", "NO_STATUS"))
	return type_string(typeof(v))


## JS `x===0` for Number: int 0 or float 0.0 (bool/String/null are not).
static func _is_strict_zero(v) -> bool:
	return (v is int and v == 0) or (v is float and v == 0.0)


## JS truthiness.
static func _truthy(v) -> bool:
	match typeof(v):
		TYPE_NIL:
			return false
		TYPE_BOOL:
			return v
		TYPE_INT:
			return v != 0
		TYPE_FLOAT:
			return v != 0.0 and not is_nan(v)
		TYPE_STRING, TYPE_STRING_NAME:
			return String(v) != ""
		TYPE_OBJECT:
			return is_instance_valid(v)
	return true
