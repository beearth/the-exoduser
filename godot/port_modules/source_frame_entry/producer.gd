extends RefCounted
# source frame entry / _acc prefix — pure producer + carrier of source frame vars (candidate, not integrated)
# TASK CLAUDE8-SKILL-SOURCE-FRAME-ENTRY-ACC-PREFIX-20261017
# Source: official frame packet 846a889c (inline only), source hash at reads NOT_RECORDED.
# Reuses an injected prefix v2 instance (52e1ec05) for _dtSp / render_front / scheduler arithmetic.
# Never reads a clock, window, OPT, G or World itself; every input comes from the caller.
# All phase/input/witness APIs here are ABSTRACT CANDIDATES; actual binding is ENGINE's.

const SCHEMA := "exoduser.godot.source-frame-entry.v3"

# entry clamp literals (packet entry)
const FRAME_TIME_MAX := 50
const FRAME_TIME_MIN := 0
# required timestamp scope for this producer (abstract); the current ENGINE sample scope
# LAST_NATIVE_PLATFORM_RENDER_INPUT_ONLY is explicitly not accepted
const SCOPE_SOURCE_RAF := "SOURCE_RAF_CALLBACK"
# native render callback branch (ENGINE wrapper contract); authority stays with the wrapper
const SCOPE_SOURCE_NATIVE := "SOURCE_NATIVE_RENDER_CALLBACK"
const NATIVE_CLOCK_DOMAIN := "godot_engine_monotonic_milliseconds"

const F_TIMESTAMP := "timestamp"
const F_FPS_CAP := "fps_cap"
const F_GAP_FRAME_CALLBACKS := "gap_frame_callbacks"
const F_PREV_TS_INIT := "prev_ts_init"
const F_GAP_LOOP_BOOKKEEPING := "gap_loop_bookkeeping"
const F_HIDDEN := "document_hidden"
const F_RAW_FRAME_TIME := "raw_frame_time"
const F_GAP_DEBUG_HITCH := "gap_debug_hitch"
const F_CLAMP := "clamp"
const F_GAP_SPEED_OVERRIDE := "gap_speed_override"
const F_GAP_FRAME_PAUSE_ACC := "gap_frame_pause_step_acc"
const F_GAP_ADAPTIVE_CAP := "gap_adaptive_acc_cap"
const F_GAP_HYSTERESIS_ATMOS := "gap_fps_hysteresis_atmos"
const F_RENDER_FRONT := "render_front"
const F_SCHEDULER := "scheduler"

const ORDER := [F_TIMESTAMP, F_FPS_CAP, F_GAP_FRAME_CALLBACKS, F_PREV_TS_INIT, F_GAP_LOOP_BOOKKEEPING,
	F_HIDDEN, F_RAW_FRAME_TIME, F_GAP_DEBUG_HITCH, F_CLAMP, F_GAP_SPEED_OVERRIDE, F_GAP_FRAME_PAUSE_ACC,
	F_GAP_ADAPTIVE_CAP, F_GAP_HYSTERESIS_ATMOS, F_RENDER_FRONT, F_SCHEDULER]

const PREFIX_METHODS := ["declare_dt_sp", "read_dt_sp", "render_front", "sched_should_step",
	"sched_before_update", "sched_after_update", "read_update_state"]

var _prefix: RefCounted = null

# carrier-held source vars (60460-60467 literals). Unknown decls stay unknown (null + flag).
var _declared := false
var _now: float = 0.0
var _acc: float = 0.0
var _prev_ts: float = 0.0
var _game_time: float = 0.0
var _last_loop_ts_known := false
var _last_loop_ts: float = 0.0
var _fps_cap_interval_known := false
var _fps_cap_interval: float = 0.0

# per-frame cursor
var _in_frame := false
var _last_token: Variant = null
var _next_index := 0
var _returned_at := ""
var _not_ready_at := ""
var _requests: Array = []
var _timestamp: float = 0.0
var _raw_frame_time: Variant = null
var _frame_time: Variant = null

# scheduler state within the frame
var _sched_open := false
var _sched_done := false
var _iteration := 0
var _awaiting_update_return := false
var _did_update_set_this_frame := false


# ---------- configuration / declaration ----------

func configure(prefix: RefCounted) -> Dictionary:
	if _prefix != null:
		return _nr("already_configured")
	if prefix == null:
		return _nr("prefix_missing")
	for m in PREFIX_METHODS:
		if not prefix.has_method(m):
			return _nr("prefix_method_missing_" + m)
	_prefix = prefix
	return {"status": "OK"}


# let _now=0,...; let _dtSp=1; const PHYS_STEP=1000/60; let _acc=0,_prevTs=0,_gameTime=0;
# Literal source initial values (not provider fallbacks). _dtSp lives in the prefix holder.
func declare() -> Dictionary:
	if _prefix == null:
		return _nr("not_configured")
	if _declared:
		return _nr("already_declared")
	var dt: Dictionary = _prefix.read_dt_sp()
	var dt_note := "prefix_already_declared"
	if dt.get("status") != "OK":
		var d: Dictionary = _prefix.declare_dt_sp()
		if d.get("status") != "OK":
			return _nr("prefix_declare_dt_sp_failed")
		dt_note = "declared_via_prefix"
	_declared = true
	_now = 0.0
	_acc = 0.0
	_prev_ts = 0.0
	_game_time = 0.0
	return {"status": "OK", "dt_sp": dt_note,
		"unknown_declarations": ["_lastLoopTs", "_fpsCapInterval", "_didUpdate", "_perfLast (performance.now at decl)"]}


func is_ready() -> bool:
	return _prefix != null and _declared


# ---------- frame ----------

# token: abstract per-callback freshness token (int or String) from the actual Main caller.
func begin_frame(token: Variant) -> Dictionary:
	if not is_ready():
		return _nr("not_ready")
	if _in_frame:
		return _nr("previous_frame_not_ended")
	if typeof(token) != TYPE_INT and typeof(token) != TYPE_STRING:
		return _nr("frame_token_missing")
	if typeof(token) == typeof(_last_token) and token == _last_token:
		return _nr("frame_token_stale")
	_last_token = token
	_in_frame = true
	_next_index = 0
	_returned_at = ""
	_not_ready_at = ""
	_requests = []
	_raw_frame_time = null
	_frame_time = null
	_sched_open = false
	_sched_done = false
	_iteration = 0
	_awaiting_update_return = false
	_did_update_set_this_frame = false
	return {"status": "OK"}


func end_frame() -> Dictionary:
	if not _in_frame:
		return _nr("not_in_frame")
	_in_frame = false
	return read_frame_state()


# if(!timestamp)timestamp=performance.now();
# obs: {scope, timestamp (RAF arg, may be falsy), performance_now (needed only when timestamp falsy)}
func phase_timestamp(obs: Dictionary) -> Dictionary:
	var c := _enter(F_TIMESTAMP)
	if c.status != "OK":
		return c
	var scope: Variant = obs.get("scope")
	if typeof(scope) != TYPE_STRING:
		return _halt_nr(F_TIMESTAMP, "timestamp_scope_not_source_raf_callback")
	if scope == SCOPE_SOURCE_NATIVE:
		# native branch: token must be the current open frame token, exact clock domain, numeric timestamp
		var tok: Variant = obs.get("callback_token")
		if typeof(tok) != TYPE_STRING or typeof(_last_token) != TYPE_STRING or tok != _last_token:
			return _halt_nr(F_TIMESTAMP, "native_callback_token_not_current_frame")
		var dom: Variant = obs.get("clock_domain")
		if typeof(dom) != TYPE_STRING or dom != NATIVE_CLOCK_DOMAIN:
			return _halt_nr(F_TIMESTAMP, "native_clock_domain_mismatch")
		if not _is_num(obs.get("timestamp")):
			return _halt_nr(F_TIMESTAMP, "native_timestamp_not_number")
	elif scope != SCOPE_SOURCE_RAF:
		return _halt_nr(F_TIMESTAMP, "timestamp_scope_not_source_raf_callback")
	var ts: Variant = obs.get("timestamp")
	if not _js_truthy(ts):
		ts = obs.get("performance_now")
		if not _is_num(ts):
			return _halt_nr(F_TIMESTAMP, "performance_now_missing")
	elif not _is_num(ts):
		return _halt_nr(F_TIMESTAMP, "timestamp_not_number")
	_timestamp = float(ts)
	var r := _cont(F_TIMESTAMP)
	r["timestamp"] = _timestamp
	return r


# if(OPT.fpsCap){ _fpsCapInterval=1000/OPT.fpsCap; const _elapsed=timestamp-_lastLoopTs;
#   if(_elapsed<_fpsCapInterval-1){requestAnimationFrame(loop);return} }
# _lastLoopTs=timestamp;
# opt: the actual current OPT Dictionary (Services.read_current_options()); not an empty default.
func phase_fps_cap(opt: Variant) -> Dictionary:
	var c := _enter(F_FPS_CAP)
	if c.status != "OK":
		return c
	if typeof(opt) != TYPE_DICTIONARY:
		return _halt_nr(F_FPS_CAP, "opt_missing")
	var cap: Variant = opt.get("fpsCap")
	if _js_truthy(cap):
		if not _is_num(cap):
			return _halt_nr(F_FPS_CAP, "fps_cap_not_number")
		_fps_cap_interval = 1000.0 / float(cap)
		_fps_cap_interval_known = true
		if not _last_loop_ts_known:
			return _halt_nr(F_FPS_CAP, "last_loop_ts_initial_declaration_unknown")
		var elapsed := _timestamp - _last_loop_ts
		if elapsed < _fps_cap_interval - 1:
			_requests.append("requestAnimationFrame(loop)")
			return _ret(F_FPS_CAP)
	_last_loop_ts = _timestamp
	_last_loop_ts_known = true
	var r := _cont(F_FPS_CAP)
	r["last_loop_ts"] = _last_loop_ts
	return r


# OWNER GAP: source frame callbacks/resets, _sfxFrameReset, gamepad and profiling bodies
func phase_gap_frame_callbacks(receipt: Variant) -> Dictionary:
	return _gap(F_GAP_FRAME_CALLBACKS, receipt)


# if(!_prevTs)_prevTs=timestamp;
func phase_prev_ts_init() -> Dictionary:
	var c := _enter(F_PREV_TS_INIT)
	if c.status != "OK":
		return c
	if not _js_truthy(_prev_ts):
		_prev_ts = _timestamp
	var r := _cont(F_PREV_TS_INIT)
	r["prev_ts"] = _prev_ts
	return r


# OWNER GAP: loop-running/performance bookkeeping
func phase_gap_loop_bookkeeping(receipt: Variant) -> Dictionary:
	return _gap(F_GAP_LOOP_BOOKKEEPING, receipt)


# if(document.hidden){_prevTs=0;requestAnimationFrame(loop);return}
# hidden: bool from the actual Main.read_native_document_hidden() for this callback.
func phase_document_hidden(hidden: Variant) -> Dictionary:
	var c := _enter(F_HIDDEN)
	if c.status != "OK":
		return c
	if typeof(hidden) != TYPE_BOOL:
		return _halt_nr(F_HIDDEN, "document_hidden_unknown")
	if hidden:
		_prev_ts = 0.0
		_requests.append("requestAnimationFrame(loop)")
		return _ret(F_HIDDEN)
	return _cont(F_HIDDEN)


# const _rawFrameTime=timestamp-_prevTs;_prevTs=timestamp;
func phase_raw_frame_time() -> Dictionary:
	var c := _enter(F_RAW_FRAME_TIME)
	if c.status != "OK":
		return c
	_raw_frame_time = _timestamp - _prev_ts
	_prev_ts = _timestamp
	var r := _cont(F_RAW_FRAME_TIME)
	r["raw_frame_time"] = _raw_frame_time
	return r


# OWNER GAP: optional debug-hitch body
func phase_gap_debug_hitch(receipt: Variant) -> Dictionary:
	return _gap(F_GAP_DEBUG_HITCH, receipt)


# let frameTime=_rawFrameTime; if(frameTime>50)frameTime=50; if(frameTime<0)frameTime=0;
func phase_clamp() -> Dictionary:
	var c := _enter(F_CLAMP)
	if c.status != "OK":
		return c
	var ft: float = _raw_frame_time
	if ft > FRAME_TIME_MAX:
		ft = FRAME_TIME_MAX
	if ft < FRAME_TIME_MIN:
		ft = FRAME_TIME_MIN
	_frame_time = ft
	var r := _cont(F_CLAMP)
	r["frame_time"] = ft
	return r


# OWNER GAPS after clamp (no current absence / multiplier 1 / normal mode is invented):
# window._btSpeedMul!==undefined ; window._btFramePause/_btFrameStep (frame pause/step/acc producer) ;
# IS_MOBILE/_prof.u<=8 adaptive accumulator cap ; FPS hysteresis/atmos/remaining bookkeeping
func phase_gap_speed_override(receipt: Variant) -> Dictionary:
	return _gap(F_GAP_SPEED_OVERRIDE, receipt)


func phase_gap_frame_pause_step_acc(receipt: Variant) -> Dictionary:
	return _gap(F_GAP_FRAME_PAUSE_ACC, receipt)


func phase_gap_adaptive_acc_cap(receipt: Variant) -> Dictionary:
	return _gap(F_GAP_ADAPTIVE_CAP, receipt)


func phase_gap_fps_hysteresis_atmos(receipt: Variant) -> Dictionary:
	return _gap(F_GAP_HYSTERESIS_ATMOS, receipt)


# 61848 _dtSp=1;_impPerFrame=0;_txtPerFrame=0;  (delegated to prefix v2 holder)
func phase_render_front() -> Dictionary:
	var c := _enter(F_RENDER_FRONT)
	if c.status != "OK":
		return c
	var rf: Dictionary = _prefix.render_front()
	if rf.get("status") != "OK":
		return _halt_nr(F_RENDER_FRONT, "prefix_render_front_" + str(rf.get("reason")))
	var r := _cont(F_RENDER_FRONT)
	r["prefix"] = rf
	return r


# ---------- 61875 scheduler ----------
# acc_witness: {"acc": number} = the actual _acc at 61875 after the real owner bodies above
# (acc production is in unknown bodies; this producer never computes it from frameTime).
func sched_enter(acc_witness: Variant) -> Dictionary:
	var c := _enter(F_SCHEDULER)
	if c.status != "OK":
		return c
	# one entry at the source position: an open or in-flight scheduler is not re-entered
	if _sched_open or _awaiting_update_return:
		return _nr("scheduler_already_entered")
	if typeof(acc_witness) != TYPE_DICTIONARY or not _is_num(acc_witness.get("acc")):
		return _halt_nr(F_SCHEDULER, "acc_at_scheduler_unknown")
	_acc = float(acc_witness["acc"])
	_sched_open = true
	return {"status": "OK", "acc": _acc}


# while(_acc>=PHYS_STEP)  -> step:false closes the loop (scheduler phase complete)
func sched_check() -> Dictionary:
	var c := _sched_guard(false)
	if c.status != "OK":
		return c
	var s: Dictionary = _prefix.sched_should_step(_acc)
	if s.get("status") != "OK":
		return _halt_nr(F_SCHEDULER, "prefix_sched_should_step_" + str(s.get("reason")))
	if s.get("step") == false:
		_sched_open = false
		_sched_done = true
		_next_index += 1
		return {"status": "OK", "step": false, "acc": _acc, "did_update_set_this_frame": _did_update_set_this_frame}
	return {"status": "OK", "step": true, "acc": _acc, "iteration": _iteration + 1}


# _gameTime+=PHYS_STEP; _now=_gameTime;   then the caller runs the actual update() once
func sched_before_update() -> Dictionary:
	var c := _sched_guard(false)
	if c.status != "OK":
		return c
	var s: Dictionary = _prefix.sched_should_step(_acc)
	if s.get("step") != true:
		return _nr("sched_step_not_due")
	var b: Dictionary = _prefix.sched_before_update(_game_time)
	if b.get("status") != "OK":
		return _halt_nr(F_SCHEDULER, "prefix_sched_before_update_" + str(b.get("reason")))
	_game_time = float(b["game_time"])
	_now = float(b["now"])
	_iteration += 1
	_awaiting_update_return = true
	return {"status": "OK", "iteration": _iteration, "game_time": _game_time, "now": _now}


# update(); _acc-=PHYS_STEP; _didUpdate=true;
# witness: {"iteration": int (this iteration), "update_returned": true, "kind": "early_return"|"full_body"}
# guaranteed by the actual owner for the same call. Prefix sp/end_update alone is not a witness.
func sched_after_update(witness: Variant) -> Dictionary:
	var c := _sched_guard(true)
	if c.status != "OK":
		return c
	if typeof(witness) != TYPE_DICTIONARY:
		return _nr("update_return_witness_missing")
	if typeof(witness.get("iteration")) != TYPE_INT or witness.get("iteration") != _iteration:
		return _nr("update_return_witness_other_iteration")
	if typeof(witness.get("update_returned")) != TYPE_BOOL or witness.get("update_returned") != true:
		return _nr("update_return_not_witnessed")
	var kind: Variant = witness.get("kind")
	if typeof(kind) != TYPE_STRING or (kind != "early_return" and kind != "full_body"):
		return _nr("update_return_kind_unknown")
	var st: Dictionary = _prefix.read_update_state()
	if st.get("in_update") != false:
		return _nr("prefix_update_still_open")
	if st.get("not_ready_at") != "":
		return _nr("prefix_update_not_ready_at_" + str(st.get("not_ready_at")))
	if kind == "early_return" and st.get("returned_at") == "":
		return _nr("witness_early_return_but_prefix_not_returned")
	if kind == "full_body" and (st.get("returned_at") != "" or st.get("next_phase") != "done"):
		return _nr("witness_full_body_but_prefix_did_not_reach_sp")
	var a: Dictionary = _prefix.sched_after_update(_acc)
	if a.get("status") != "OK":
		return _halt_nr(F_SCHEDULER, "prefix_sched_after_update_" + str(a.get("reason")))
	_acc = float(a["acc"])
	_did_update_set_this_frame = true
	_awaiting_update_return = false
	return {"status": "OK", "iteration": _iteration, "acc": _acc, "did_update": true}


func read_frame_state() -> Dictionary:
	return {
		"in_frame": _in_frame,
		"applied_phases": ORDER.slice(0, _next_index),
		"next_phase": ORDER[_next_index] if _next_index < ORDER.size() else "done",
		"returned_at": _returned_at,
		"not_ready_at": _not_ready_at,
		"requests": _requests.duplicate(),
		"timestamp": _timestamp if _next_index > 0 else null,
		"raw_frame_time": _raw_frame_time,
		"frame_time": _frame_time,
		"prev_ts": _prev_ts,
		"last_loop_ts": _last_loop_ts if _last_loop_ts_known else null,
		"fps_cap_interval": _fps_cap_interval if _fps_cap_interval_known else null,
		"acc": _acc,
		"game_time": _game_time,
		"now": _now,
		"sched_open": _sched_open,
		"sched_done": _sched_done,
		"iteration": _iteration,
		"awaiting_update_return": _awaiting_update_return,
		"did_update_set_this_frame": _did_update_set_this_frame,
		"tail_after_61875": "NR (not in packet)",
	}


# ---------- internals ----------

func _enter(phase: String) -> Dictionary:
	if not _in_frame:
		return _nr("not_in_frame")
	if _returned_at != "":
		return _nr("frame_already_returned_at_" + _returned_at)
	if _not_ready_at != "":
		return _nr("frame_halted_not_ready_at_" + _not_ready_at)
	if _next_index >= ORDER.size() or ORDER[_next_index] != phase:
		return _nr("phase_order_expected_" + (ORDER[_next_index] if _next_index < ORDER.size() else "done"))
	return {"status": "OK"}


func _sched_guard(need_awaiting: bool) -> Dictionary:
	if not _in_frame:
		return _nr("not_in_frame")
	if _not_ready_at != "":
		return _nr("frame_halted_not_ready_at_" + _not_ready_at)
	if not _sched_open:
		return _nr("scheduler_not_open")
	if need_awaiting != _awaiting_update_return:
		return _nr("update_return_pending" if _awaiting_update_return else "no_update_in_flight")
	return {"status": "OK"}


# abstract owner gap receipt {completed:true, returned:bool}; absent -> NR at that slot (never skip)
func _gap(phase: String, receipt: Variant) -> Dictionary:
	var c := _enter(phase)
	if c.status != "OK":
		return c
	if typeof(receipt) != TYPE_DICTIONARY:
		return _halt_nr(phase, "owner_gap_no_receipt")
	if typeof(receipt.get("completed")) != TYPE_BOOL or receipt.get("completed") != true:
		return _halt_nr(phase, "owner_gap_receipt_not_completed")
	if typeof(receipt.get("returned")) != TYPE_BOOL:
		return _halt_nr(phase, "owner_gap_receipt_returned_unknown")
	if receipt.get("returned") == true:
		return _ret(phase)
	return _cont(phase)


func _cont(phase: String) -> Dictionary:
	_next_index += 1
	return {"status": "CONTINUE", "phase": phase}


func _ret(phase: String) -> Dictionary:
	_next_index += 1
	_returned_at = phase
	return {"status": "RETURNED", "phase": phase, "requests": _requests.duplicate()}


func _halt_nr(phase: String, why: String) -> Dictionary:
	_not_ready_at = phase
	return {"status": "PARTIAL_NOT_READY" if _next_index > 0 else "NOT_READY",
		"phase": phase, "reason": why, "applied_phases": ORDER.slice(0, _next_index)}


func _nr(why: String) -> Dictionary:
	return {"status": "NOT_READY", "reason": why}


func _is_num(v: Variant) -> bool:
	return typeof(v) == TYPE_INT or typeof(v) == TYPE_FLOAT


func _js_truthy(v: Variant) -> bool:
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
		_:
			return true
