extends Node
## Native async owner for canonical game.html:12093-12113 `_prepareStartMapView`.
##
## The owner executes the source steps itself against injected public services:
## fallback writer, enabled reader, view-ID provider, preload call, current cache
## holder, document visibility (reader + genuine Signal), localizer, boot loading
## writer, warning sink. It never invents `_ch1StartOuterEnabled`, the view-ID
## formula, the CH1 cache loader, map geometry, camera or the fallback terrain.
##
## A SOURCE_RETURNED result only means the source function body returned along
## the named path. It is not full-map / Texture / GPU / Main / stage / G.on
## readiness.
##
## Usage: add to a SceneTree, `configure(bindings)`, then
## `var result: Dictionary = await run_prepare_start_map_view()`.

const SOURCE := "game.html:12093-12113 _prepareStartMapView"
const LOADING_PERCENT := 98
const TEXT_KO := "시작 화면 준비 중..."
const TEXT_EN := "Preparing starting view..."
const DEADLINE_USEC := 12000 * 1000
const POLL_USEC := 30 * 1000
const POLL_SEC := 0.03
const WARNING := "[START MAP] Initial view unavailable; using the stable terrain fallback."

const CALLABLE_KEYS := [
	"fallback_writer", "enabled", "localize", "set_boot_loading", "view_ids",
	"preload_view", "current_cache", "document_hidden", "warn",
]
const SIGNAL_KEY := "visibility_changed"

const STATUS_RETURNED := "SOURCE_RETURNED"
const STATUS_NOT_READY := "NOT_READY"
const STATUS_STOPPED := "STOPPED"

var _bindings := {}
var _configured := false
var _signal: Signal
var _listener := Callable()
var _listener_connected := false
var _disconnect_cause := ""
var _running := false
var _cancel_requested := false
var _exited_during_run := false
var _tree: SceneTree = null
var _deadline_usec := -1
var _cache_fault := ""
var _listener_fault := ""
var _active := {}


func _init() -> void:
	_listener = Callable(self, "_on_visibility_changed")


func _notification(what: int) -> void:
	if what == NOTIFICATION_EXIT_TREE:
		if _running:
			_exited_during_run = true
		_disconnect_listener("owner_exit_tree")
	elif what == NOTIFICATION_PREDELETE:
		_disconnect_listener("owner_predelete")


## Validates and stores bindings. Returns {status: CONFIGURED|NOT_READY, reason}.
func configure(bindings: Dictionary) -> Dictionary:
	if _running:
		return {"status": STATUS_NOT_READY, "reason": "RUNNING"}
	var bad := _validate(bindings)
	if bad != "":
		_configured = false
		_bindings = {}
		_signal = Signal()
		return {"status": STATUS_NOT_READY, "reason": bad}
	_bindings = bindings.duplicate()
	_signal = bindings[SIGNAL_KEY]
	_configured = true
	return {"status": "CONFIGURED", "reason": ""}


## Requests a lifecycle stop. The own listener is removed immediately; the
## pending run returns STOPPED/CANCELLED after its current timer wait.
func cancel() -> void:
	if not _running:
		return
	_cancel_requested = true
	_disconnect_listener("cancel")


func is_running() -> bool:
	return _running


## Current source `deadline` in Time.get_ticks_usec() units, -1 when idle.
func current_deadline_usec() -> int:
	return _deadline_usec


func run_prepare_start_map_view() -> Dictionary:
	var r := _new_result()
	if _running:
		return _nr(r, "ALREADY_RUNNING")
	if not _configured:
		return _nr(r, "NOT_CONFIGURED")
	var bad := _validate(_bindings)
	if bad != "":
		return _nr(r, bad)
	if not is_inside_tree():
		return _nr(r, "OWNER_NOT_IN_TREE")
	_running = true
	_cancel_requested = false
	_exited_during_run = false
	_cache_fault = ""
	_listener_fault = ""
	_disconnect_cause = ""
	_tree = get_tree()
	_active = r
	var started := Time.get_ticks_usec()
	var out: Dictionary = await _body(r)
	# finally{document.removeEventListener('visibilitychange',visibleAgain)}
	_disconnect_listener("run_end")
	out["listener"]["disconnect_cause"] = _disconnect_cause
	out["elapsed_usec"] = Time.get_ticks_usec() - started
	out["final_deadline_usec"] = _deadline_usec
	_deadline_usec = -1
	_tree = null
	_active = {}
	_running = false
	return out


func _body(r: Dictionary) -> Dictionary:
	# 12094 _ch1StartOuterBootFallback=false;
	if not _write_fallback(r, false):
		return _nr(r, "FALLBACK_WRITER_NACK:false")
	# 12095 if(!_ch1StartOuterEnabled())return;
	var enabled = _read_enabled(r)
	if typeof(enabled) != TYPE_BOOL:
		return _nr(r, "INVALID_ENABLED")
	if not enabled:
		return _returned(r, "DISABLED_AT_ENTRY")
	# 12096 setBootLoading(98,_L('시작 화면 준비 중...','Preparing starting view...'));
	r["trace"].append("L")
	var label = _bindings["localize"].call(TEXT_KO, TEXT_EN)
	if typeof(label) != TYPE_STRING:
		return _nr(r, "INVALID_LOCALIZED_TEXT")
	r["trace"].append("setBootLoading")
	if not _applied(_bindings["set_boot_loading"].call(LOADING_PERCENT, label)):
		return _nr(r, "SET_BOOT_LOADING_NACK")
	# 12097 let deadline=performance.now()+12000;
	_deadline_usec = Time.get_ticks_usec() + DEADLINE_USEC
	r["initial_deadline_usec"] = _deadline_usec
	r["trace"].append("deadline")
	# 12098-12099 document.addEventListener('visibilitychange',visibleAgain);
	if not is_instance_valid(_signal.get_object()):
		return _nr(r, "INVALID_BINDING:" + SIGNAL_KEY)
	if _signal.is_connected(_listener):
		return _nr(r, "LISTENER_ALREADY_CONNECTED")
	if _signal.connect(_listener) != OK:
		return _nr(r, "LISTENER_CONNECT_FAILED")
	_listener_connected = true
	r["listener"]["connected"] = true
	r["trace"].append("connect")
	# 12101 while(_ch1StartOuterEnabled()){
	while true:
		enabled = _read_enabled(r)
		if typeof(enabled) != TYPE_BOOL:
			return _nr(r, "INVALID_ENABLED")
		if not enabled:
			return _returned(r, "DISABLED_IN_LOOP")
		r["cycles"] += 1
		# 12102 const ids=_ch1StartOuterViewIds();
		r["trace"].append("ids")
		var ids = _bindings["view_ids"].call()
		if typeof(ids) != TYPE_ARRAY:
			return _nr(r, "INVALID_VIEW_IDS")
		# 12103 _preloadCh1StartOuter();  (source ignores the return)
		r["trace"].append("preload")
		r["preload_calls"] += 1
		r["preload_last_ignored_return"] = _bindings["preload_view"].call()
		# 12104 if(ids.every(id=>_ch1StartOuterCache[id]?.status==='ready'))return;
		var every := true
		for id in ids:
			var st = _cache_status(r, id)
			if _cache_fault != "":
				return _nr(r, _cache_fault)
			if not (typeof(st) == TYPE_STRING and st == "ready"):
				every = false
				break
		if every:
			return _returned(r, "READY_EMPTY_IDS" if ids.is_empty() else "READY")
		# 12105 ids.some(...==='error')||(!document.hidden&&performance.now()>=deadline)
		var any_error := false
		for id in ids:
			var st = _cache_status(r, id)
			if _cache_fault != "":
				return _nr(r, _cache_fault)
			if typeof(st) == TYPE_STRING and st == "error":
				any_error = true
				break
		var timed_out := false
		if not any_error:
			r["trace"].append("hidden")
			var hidden = _bindings["document_hidden"].call()
			if typeof(hidden) != TYPE_BOOL:
				return _nr(r, "INVALID_DOCUMENT_HIDDEN")
			if not hidden:
				r["trace"].append("clock")
				timed_out = Time.get_ticks_usec() >= _deadline_usec
		if any_error or timed_out:
			# 12106-12108
			if not _write_fallback(r, true):
				return _nr(r, "FALLBACK_WRITER_NACK:true")
			r["trace"].append("warn")
			if not _applied(_bindings["warn"].call(WARNING)):
				return _nr(r, "WARN_NACK")
			return _returned(r, "FALLBACK_ERROR" if any_error else "FALLBACK_TIMEOUT")
		# 12110 await new Promise(resolve=>setTimeout(resolve,30));
		var stop: String = await _wait_poll(r)
		if stop != "":
			return _stop(r, stop)
		if _listener_fault != "":
			return _nr(r, _listener_fault)
	return r


## Real SceneTreeTimer 30 ms (process_always, ignore_time_scale), then a real
## monotonic guard: an early timer signal is followed by process_frame waits
## until the 30 ms boundary has really elapsed.
func _wait_poll(r: Dictionary) -> String:
	r["trace"].append("timer")
	r["timer_waits"] += 1
	var start := Time.get_ticks_usec()
	var due := start + POLL_USEC
	await _tree.create_timer(POLL_SEC, true, false, true).timeout
	if Time.get_ticks_usec() < due:
		r["early_timer_signals"] += 1
		while Time.get_ticks_usec() < due:
			r["early_frame_waits"] += 1
			await _tree.process_frame
	var elapsed := Time.get_ticks_usec() - start
	if r["min_poll_elapsed_usec"] < 0 or elapsed < r["min_poll_elapsed_usec"]:
		r["min_poll_elapsed_usec"] = elapsed
	if _cancel_requested:
		return "CANCELLED"
	if _exited_during_run or not is_inside_tree():
		return "OWNER_EXITED_TREE"
	return ""


## visibleAgain=()=>{if(!document.hidden)deadline=performance.now()+12000}
func _on_visibility_changed() -> void:
	if not _running:
		return
	_active["trace"].append("listener.hidden")
	_active["listener"]["events"] += 1
	var hidden = _bindings["document_hidden"].call()
	if typeof(hidden) != TYPE_BOOL:
		_listener_fault = "INVALID_DOCUMENT_HIDDEN_IN_LISTENER"
		return
	if not hidden:
		_deadline_usec = Time.get_ticks_usec() + DEADLINE_USEC
		_active["deadline_resets"] += 1
		_active["trace"].append("deadline.reset")


func _write_fallback(r: Dictionary, value: bool) -> bool:
	r["trace"].append("fallback=" + str(value))
	var receipt = _bindings["fallback_writer"].call(value)
	var ok := _applied(receipt)
	r["fallback_writes"].append({"value": value, "applied": ok})
	return ok


func _read_enabled(r: Dictionary):
	r["trace"].append("enabled")
	return _bindings["enabled"].call()


## `_ch1StartOuterCache[id]?.status` without key/status normalization.
## Absent entry, null entry, primitive entry or missing status => null (JS undefined).
func _cache_status(r: Dictionary, id):
	r["trace"].append("cache:" + str(id))
	var cache = _bindings["current_cache"].call()
	if typeof(cache) == TYPE_NIL:
		_cache_fault = "SOURCE_CACHE_NULL"
		return null
	if typeof(cache) != TYPE_DICTIONARY:
		_cache_fault = "INVALID_CACHE_AUTHORITY"
		return null
	var entry = cache.get(id)
	match typeof(entry):
		TYPE_DICTIONARY:
			return entry.get("status")
		TYPE_OBJECT:
			return entry.get("status") if is_instance_valid(entry) else null
	return null


func _disconnect_listener(cause: String) -> void:
	if not _listener_connected:
		return
	_listener_connected = false
	if is_instance_valid(_signal.get_object()) and _signal.is_connected(_listener):
		_signal.disconnect(_listener)
	_disconnect_cause = cause
	if not _active.is_empty():
		_active["listener"]["disconnected"] = true


func _validate(b: Dictionary) -> String:
	for k in CALLABLE_KEYS:
		if not b.has(k):
			return "MISSING_BINDING:" + k
		var c = b[k]
		if typeof(c) != TYPE_CALLABLE or not (c as Callable).is_valid():
			return "INVALID_BINDING:" + k
	if not b.has(SIGNAL_KEY):
		return "MISSING_BINDING:" + SIGNAL_KEY
	if typeof(b[SIGNAL_KEY]) != TYPE_SIGNAL:
		return "INVALID_BINDING:" + SIGNAL_KEY
	var s: Signal = b[SIGNAL_KEY]
	var o = s.get_object()
	if not is_instance_valid(o) or not o.has_signal(s.get_name()):
		return "INVALID_BINDING:" + SIGNAL_KEY
	for info in o.get_signal_list():
		if info["name"] == s.get_name() and info["args"].size() != 0:
			return "INVALID_BINDING:" + SIGNAL_KEY + ":ARGS"
	return ""


func _applied(receipt) -> bool:
	return typeof(receipt) == TYPE_DICTIONARY \
		and typeof(receipt.get("status")) == TYPE_STRING \
		and receipt["status"] == "APPLIED"


func _new_result() -> Dictionary:
	return {
		"source": SOURCE,
		"status": "",
		"return_path": "",
		"reason": "",
		"trace": [],
		"cycles": 0,
		"preload_calls": 0,
		"preload_last_ignored_return": null,
		"fallback_writes": [],
		"timer_waits": 0,
		"early_timer_signals": 0,
		"early_frame_waits": 0,
		"min_poll_elapsed_usec": -1,
		"deadline_resets": 0,
		"initial_deadline_usec": -1,
		"final_deadline_usec": -1,
		"elapsed_usec": 0,
		"listener": {"connected": false, "disconnected": false, "disconnect_cause": "", "events": 0},
		"claims": {
			"full_map_ready": false, "texture_ready": false, "gpu_ready": false,
			"native_main_ready": false, "stage_ready": false, "g_on": false,
		},
	}


func _nr(r: Dictionary, reason: String) -> Dictionary:
	r["status"] = STATUS_NOT_READY
	r["reason"] = reason
	return r


func _stop(r: Dictionary, reason: String) -> Dictionary:
	r["status"] = STATUS_STOPPED
	r["reason"] = reason
	return r


func _returned(r: Dictionary, path: String) -> Dictionary:
	r["status"] = STATUS_RETURNED
	r["return_path"] = path
	return r
