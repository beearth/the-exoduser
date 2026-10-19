extends Node

## Native wait owner for canonical source `_waitObjSprites(timeout)`
## (game.html:18787-18800). One request == one source Promise.
##
## Completion reported here is SOURCE WAIT completion only (source `r()`):
## it never means Texture READY or full stage READY. `texture_ready` and
## `full_stage_ready` are always false in every packet.
##
## Required bindings (no defaults, no fabricated image state). publisher_owner is
## the bound provider OBJECT itself (is_same), never a string label:
##   obj_provider.get_source_obj_spr_publication() -> Dictionary
##       {publisher_owner: obj_provider, source_publication_kind: String,
##        obj_spr: Dictionary}            # current _OBJ_SPR, read every check
##   globals_provider.capture_source_extra_img_globals() -> Dictionary
##       {publisher_owner: globals_provider, source_publication_kind,
##        globals: {<name>: {present: bool, value: Variant}}}
##                                         # read ONCE per request (_extraImgs)
##   image_authority.read_source_image_field(image, field: String) -> Dictionary
##       {publisher_owner: image_authority, image_reference: image (is_same),
##        field, field_present: true, value, source_publication_kind,
##        native_publication_state: "LOADING"|"LOADED"|"ERROR",
##        image_identity: optional diagnostic only}
##   field_present=false means the raw field is NOT PUBLISHED => NOT_READY; a
##   declared null/false/0/"" value (field_present=true) keeps JS falsy meaning.
##   A source_publication_kind string alone does not prove an actual publisher.
##
## Clocks: source timeout uses system wall ms (Date.now equivalent); the 50 ms
## poll uses Time.get_ticks_usec() deadlines. Timer callbacks are never trusted
## as proof that 50 ms elapsed.

signal wait_finished(packet: Dictionary)

const SOURCE_REF := "game.html:18787-18800 _waitObjSprites(timeout)"
const PACKET_SCHEMA := "fdg.source_object_sprite_wait_owner.packet.v1"
const POLL_INTERVAL_USEC := 50000
const MIN_TIMER_WAIT_SEC := 0.001
const QUERY_LOG_LIMIT := 1024

const PUBLICATION_ACTUAL := "ACTUAL_SOURCE_PUBLICATION"
const PUBLICATION_CONSTRUCTOR := "CONSTRUCTOR_PROTOCOL"
const PUBLICATION_KINDS := [PUBLICATION_ACTUAL, PUBLICATION_CONSTRUCTOR]
const NATIVE_PUBLICATION_STATES := ["LOADING", "LOADED", "ERROR"]
const FIELD_RECORD_KEYS := [
	"publisher_owner", "image_reference", "field", "field_present",
	"source_publication_kind", "native_publication_state",
]

# Source `_extraImgs` construction order; `_bossGateImgs` is spread and
# `_GROUND_TILES` contributes exactly GROUND_TILE_KEYS in this order.
const EXTRA_GLOBAL_ORDER := [
	"_bossRoomBg", "_bossGateImgs", "_impSpr", "_skullWallImg",
	"_wallEdgeImg", "_pathBgImg", "_voidVistaImg", "_GROUND_TILES",
]
const GROUND_TILE_KEYS := [
	"gt_soil", "gt_ch2", "gt_ch3", "gt_hellwinter",
	"gt_ch4", "gt_ch5", "gt_ch6", "gt_ch7",
]

const TERMINAL_SOURCE_RESOLVED := "SOURCE_RESOLVED"
const TERMINAL_NOT_READY := "NOT_READY"
const TERMINAL_CANCELLED := "CANCELLED"
const TERMINAL_DISPOSED := "DISPOSED"
const CAUSE_DONE := "DONE"
const CAUSE_TIMEOUT := "TIMEOUT"

const VERDICT_ACTUAL := "ACTUAL_PUBLICATION_DECLARED_BY_ALL_READS"
const VERDICT_UNVERIFIED := "UNVERIFIED_CONSTRUCTOR_PROTOCOL_PRESENT"
const VERDICT_NONE := "NO_PUBLICATION_READ"


class WaitHandle extends RefCounted:
	signal finished(packet: Dictionary)
	var request_id: int = 0
	var timeout_ms: Variant = null
	var is_terminal: bool = false
	var packet: Dictionary = {}
	var _owner_ref: WeakRef = null

	func cancel(reason: String = "CALLER_CANCEL") -> bool:
		if is_terminal or _owner_ref == null:
			return false
		var owner_node: Object = _owner_ref.get_ref()
		if owner_node == null:
			return false
		return owner_node.cancel_wait(request_id, reason)


class WaitRequest extends RefCounted:
	var request_id: int = 0
	var handle: WaitHandle = null
	var timeout_ms: Variant = null
	var obj_provider: Object = null
	var globals_provider: Object = null
	var image_authority: Object = null
	var t0_wall_ms: int = 0
	var wall_reads: int = 0
	var wall_comparisons: Array = []
	var extras: Array = []
	var extra_labels: Array = []
	var begin_mono_us: int = 0
	var check_mono_us: Array = []
	var checks: int = 0
	var query_counts: Dictionary = {
		"obj_publication_reads": 0, "global_capture_reads": 0,
		"obj.complete": 0, "obj.naturalWidth": 0,
		"extra.src": 0, "extra.complete": 0, "extra.naturalWidth": 0,
	}
	var query_log: Array = []
	var query_log_truncated: bool = false
	var kinds_seen: Dictionary = {}
	var owners_seen: Dictionary = {}
	var polls: Array = []
	var active_timer: Timer = null
	var timers_created: int = 0
	var timer_callbacks: int = 0
	var timers_freed: int = 0  # queue_free() requests issued, not observed destruction
	var early_wakes: int = 0
	var ignore_time_scale_supported: bool = false
	var terminal: bool = false


var _obj_provider: Object = null
var _globals_provider: Object = null
var _image_authority: Object = null
var _pending: Dictionary = {}
var _next_request_id: int = 0


func bind_source_providers(obj_provider: Object, globals_provider: Object, image_authority: Object) -> void:
	_obj_provider = obj_provider
	_globals_provider = globals_provider
	_image_authority = image_authority


## Awaitable form: `var packet: Dictionary = await owner.wait_obj_sprites(8000)`.
func wait_obj_sprites(timeout_ms: Variant) -> Dictionary:
	var handle := begin_wait(timeout_ms)
	if handle.is_terminal:
		return handle.packet
	return await handle.finished


## Starts one independent source wait. The first source check runs synchronously,
## so callers must inspect `handle.is_terminal` before awaiting `handle.finished`.
func begin_wait(timeout_ms: Variant) -> WaitHandle:
	_next_request_id += 1
	var req := WaitRequest.new()
	req.request_id = _next_request_id
	req.begin_mono_us = Time.get_ticks_usec()
	req.timeout_ms = timeout_ms
	req.obj_provider = _obj_provider
	req.globals_provider = _globals_provider
	req.image_authority = _image_authority
	var handle := WaitHandle.new()
	handle.request_id = req.request_id
	handle.timeout_ms = timeout_ms
	handle._owner_ref = weakref(self)
	req.handle = handle

	var binding_gap := _binding_gap(req)
	if binding_gap != "":
		_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": binding_gap})
		return handle
	# Source order: `const t0=Date.now()` precedes `_extraImgs` construction.
	req.t0_wall_ms = _read_wall_ms(req)
	var capture_gap := _capture_extra_refs(req)
	if capture_gap != "":
		_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": capture_gap})
		return handle
	_pending[req.request_id] = req
	_run_source_check(req)
	return handle


func cancel_wait(request_id: int, reason: String = "CALLER_CANCEL") -> bool:
	if not _pending.has(request_id):
		return false
	_terminate(_pending[request_id], TERMINAL_CANCELLED, {"adapter_reason": reason})
	return true


## Native adapter teardown: terminates pending requests as DISPOSED (not source
## completion), frees their poll timers, leaves providers/images untouched.
## Does not latch: later begin_wait() calls work normally while in the tree.
func dispose_pending(reason: String = "OWNER_DISPOSE") -> int:
	var count := 0
	for request_id in _pending.keys():
		_terminate(_pending[request_id], TERMINAL_DISPOSED, {"adapter_reason": reason})
		count += 1
	return count


func get_pending_count() -> int:
	return _pending.size()


func get_active_poll_timer_count() -> int:
	var count := 0
	for request_id in _pending:
		var req: WaitRequest = _pending[request_id]
		if req.active_timer != null and is_instance_valid(req.active_timer):
			count += 1
	return count


func _exit_tree() -> void:
	dispose_pending("OWNER_EXIT_TREE")


static func describe_public_api() -> Dictionary:
	return {
		"script": "godot/port_modules/source_object_sprite_wait_owner/producer.gd",
		"node": "extends Node (no _process/_physics_process driver)",
		"bind": "bind_source_providers(obj_provider: Object, globals_provider: Object, image_authority: Object) -> void",
		"begin": "begin_wait(timeout_ms: int|float) -> WaitHandle",
		"await": "wait_obj_sprites(timeout_ms: int|float) -> Dictionary (coroutine)",
		"cancel": "cancel_wait(request_id: int, reason: String = \"CALLER_CANCEL\") -> bool",
		"dispose": "dispose_pending(reason: String = \"OWNER_DISPOSE\") -> int",
		"owner_signal": "wait_finished(packet: Dictionary)",
		"handle_fields": ["request_id: int", "timeout_ms", "is_terminal: bool", "packet: Dictionary", "signal finished(packet: Dictionary)", "cancel(reason: String) -> bool"],
		"packet_terminal": [TERMINAL_SOURCE_RESOLVED, TERMINAL_NOT_READY, TERMINAL_CANCELLED, TERMINAL_DISPOSED],
		"packet_status": ["SOURCE_WAIT_COMPLETED", "UNVERIFIED_SOURCE_WAIT_COMPLETED", "SOURCE_WAIT_TIMED_OUT", "UNVERIFIED_SOURCE_WAIT_TIMED_OUT", "NOT_READY", "CANCELLED", "DISPOSED"],
		"packet_receipt_owner": "authority_owner: this wait Node (+ authority_owner_instance_id, owner_in_tree); proves only this wait body ran",
		"never_true": ["texture_ready", "full_stage_ready"],
		"default_timeout": "none (caller supplies; source caller passes 8000)",
	}


# --- pure policy helpers (literal-checkable; not elapsed-time proof) ---------

static func source_timeout_exceeded(now_wall_ms: int, t0_wall_ms: int, timeout_ms: Variant) -> bool:
	return (now_wall_ms - t0_wall_ms) > timeout_ms


static func poll_deadline_policy(now_us: int, deadline_us: int) -> Dictionary:
	if now_us >= deadline_us:
		return {"run_source_check": true, "remaining_us": 0}
	return {"run_source_check": false, "remaining_us": deadline_us - now_us}


static func js_truthy(v: Variant) -> bool:
	var t := typeof(v)
	if t == TYPE_NIL:
		return false
	if t == TYPE_BOOL:
		return v
	if t == TYPE_INT:
		return v != 0
	if t == TYPE_FLOAT:
		return not (is_nan(v) or v == 0.0)
	if t == TYPE_STRING or t == TYPE_STRING_NAME:
		return String(v) != ""
	if t == TYPE_OBJECT:
		return is_instance_valid(v)
	return true


## JS `for...in` order on an ordinary object: array-index keys ascending, then
## remaining string keys in insertion order. Returns the original keys.
static func js_for_in_key_order(keys: Array) -> Array:
	var index_keys: Array = []
	var other_keys: Array = []
	for k in keys:
		if _is_js_array_index(str(k)):
			index_keys.append(k)
		else:
			other_keys.append(k)
	index_keys.sort_custom(func(a, b): return str(a).to_int() < str(b).to_int())
	return index_keys + other_keys


static func _is_js_array_index(s: String) -> bool:
	if s.is_empty() or s.length() > 10:
		return false
	for c in s:
		if c < "0" or c > "9":
			return false
	if s.length() > 1 and s[0] == "0":
		return false
	return s.to_int() < 4294967295


static func _has_method(o: Object, method: String) -> bool:
	return o != null and is_instance_valid(o) and o.has_method(method)


static func _is_live_reference(v: Variant) -> bool:
	if typeof(v) == TYPE_NIL:
		return false
	if typeof(v) == TYPE_OBJECT:
		return is_instance_valid(v)
	return true


# --- binding / capture --------------------------------------------------------

func _binding_gap(req: WaitRequest) -> String:
	if not is_inside_tree():
		return "OWNER_NOT_IN_TREE"
	var tt := typeof(req.timeout_ms)
	if tt != TYPE_INT and tt != TYPE_FLOAT:
		return "TIMEOUT_NOT_NUMERIC_NO_DEFAULT"
	if not _has_method(req.obj_provider, "get_source_obj_spr_publication"):
		return "OBJ_SPR_PROVIDER_MISSING"
	if not _has_method(req.globals_provider, "capture_source_extra_img_globals"):
		return "GLOBAL_CAPTURE_PROVIDER_MISSING"
	if not _has_method(req.image_authority, "read_source_image_field"):
		return "IMAGE_STATE_AUTHORITY_MISSING"
	return ""


func _accept_publication_header(req: WaitRequest, pub: Dictionary, label: String, bound_provider: Object) -> String:
	for key in ["publisher_owner", "source_publication_kind"]:
		if not pub.has(key):
			return "%s_PUBLICATION_OMITTED_KEY:%s" % [label, key]
	if not is_same(pub["publisher_owner"], bound_provider):
		return label + "_PUBLISHER_OWNER_NOT_BOUND_PROVIDER"
	if not PUBLICATION_KINDS.has(pub["source_publication_kind"]):
		return label + "_PUBLICATION_KIND_UNKNOWN"
	req.kinds_seen[pub["source_publication_kind"]] = true
	req.owners_seen["%s:%d" % [label, bound_provider.get_instance_id()]] = true
	return ""


## Builds the request-private `_extraImgs` copy once. Later replacement of the
## source globals/arrays is not visible; the captured image objects' evolving
## published fields still are (fields are read through image_authority).
func _capture_extra_refs(req: WaitRequest) -> String:
	req.query_counts["global_capture_reads"] += 1
	var pub: Variant = req.globals_provider.call("capture_source_extra_img_globals")
	if typeof(pub) != TYPE_DICTIONARY:
		return "GLOBAL_CAPTURE_PUBLICATION_NOT_DICTIONARY"
	var gap := _accept_publication_header(req, pub, "GLOBAL_CAPTURE", req.globals_provider)
	if gap != "":
		return gap
	if not pub.has("globals") or typeof(pub["globals"]) != TYPE_DICTIONARY:
		return "GLOBAL_CAPTURE_PUBLICATION_OMITTED_KEY:globals"
	var globals: Dictionary = pub["globals"]
	var refs: Array = []
	var labels: Array = []
	for name in EXTRA_GLOBAL_ORDER:
		if not globals.has(name):
			return "GLOBAL_CAPTURE_FIELD_OMITTED:" + name
		var entry: Variant = globals[name]
		if typeof(entry) != TYPE_DICTIONARY or not entry.has("present") or typeof(entry["present"]) != TYPE_BOOL:
			return "GLOBAL_CAPTURE_ENTRY_INCOMPLETE:" + name
		if not entry["present"]:
			return "SOURCE_REFERENCEERROR_EQUIVALENT:" + name
		if not entry.has("value"):
			return "GLOBAL_CAPTURE_VALUE_OMITTED:" + name
		var value: Variant = entry["value"]
		if name == "_bossGateImgs":
			if typeof(value) != TYPE_ARRAY:
				return "SOURCE_TYPEERROR_EQUIVALENT_SPREAD_NOT_ITERABLE:_bossGateImgs"
			var gates: Array = value
			for i in gates.size():
				refs.append(gates[i])
				labels.append("_bossGateImgs[%d]" % i)
		elif name == "_GROUND_TILES":
			if typeof(value) != TYPE_DICTIONARY:
				return "SOURCE_TYPEERROR_EQUIVALENT_GROUND_TILES_NOT_INDEXABLE"
			var tiles: Dictionary = value
			for key in GROUND_TILE_KEYS:
				# Missing key == source `undefined`, allowed only on a published dictionary.
				refs.append(tiles.get(key, null))
				labels.append("_GROUND_TILES['%s']" % key)
		else:
			refs.append(value)
			labels.append(name)
	req.extras = refs
	req.extra_labels = labels
	return ""


func _read_current_obj_spr(req: WaitRequest) -> Dictionary:
	req.query_counts["obj_publication_reads"] += 1
	var pub: Variant = req.obj_provider.call("get_source_obj_spr_publication")
	if typeof(pub) != TYPE_DICTIONARY:
		return {"gap": "OBJ_SPR_PUBLICATION_NOT_DICTIONARY"}
	var gap := _accept_publication_header(req, pub, "OBJ_SPR", req.obj_provider)
	if gap != "":
		return {"gap": gap}
	if not pub.has("obj_spr"):
		return {"gap": "OBJ_SPR_PUBLICATION_OMITTED_KEY:obj_spr"}
	if typeof(pub["obj_spr"]) != TYPE_DICTIONARY:
		return {"gap": "OBJ_SPR_NOT_DICTIONARY"}
	return {"gap": "", "obj_spr": pub["obj_spr"]}


func _read_field(req: WaitRequest, im: Variant, phase: String, field: String) -> Dictionary:
	req.query_counts[phase + "." + field] += 1
	var at_us := Time.get_ticks_usec()
	var rec: Variant = req.image_authority.call("read_source_image_field", im, field)
	var gap := _accept_field_record(req, im, field, rec)
	var entry := {"check": req.checks, "phase": phase, "field": field, "at_us": at_us, "gap": gap}
	if typeof(rec) == TYPE_DICTIONARY:
		entry["image_identity"] = str(rec.get("image_identity", ""))
		entry["field_present"] = rec.get("field_present")
		var present: Variant = rec.get("field_present")
		entry["value"] = str(rec.get("value")) if typeof(present) == TYPE_BOOL and present else "undefined"
		entry["native_publication_state"] = rec.get("native_publication_state")
		entry["source_publication_kind"] = rec.get("source_publication_kind")
	if req.query_log.size() < QUERY_LOG_LIMIT:
		req.query_log.append(entry)
	else:
		req.query_log_truncated = true
	if gap != "":
		return {"gap": gap}
	return {"gap": "", "value": rec["value"]}


func _accept_field_record(req: WaitRequest, im: Variant, field: String, rec: Variant) -> String:
	if typeof(rec) != TYPE_DICTIONARY:
		return "FIELD_STATE_RECORD_NOT_DICTIONARY:" + field
	for key in FIELD_RECORD_KEYS:
		if not rec.has(key):
			return "FIELD_STATE_RECORD_OMITTED_KEY:%s:%s" % [field, key]
	if str(rec["field"]) != field:
		return "FIELD_STATE_RECORD_FIELD_MISMATCH:" + field
	if not is_same(rec["publisher_owner"], req.image_authority):
		return "FIELD_STATE_PUBLISHER_OWNER_NOT_BOUND_AUTHORITY:" + field
	if not is_same(rec["image_reference"], im):
		return "FIELD_STATE_IMAGE_REFERENCE_MISMATCH:" + field
	if not PUBLICATION_KINDS.has(rec["source_publication_kind"]):
		return "FIELD_STATE_PUBLICATION_KIND_UNKNOWN:" + field
	if not NATIVE_PUBLICATION_STATES.has(rec["native_publication_state"]):
		return "FIELD_STATE_NATIVE_PUBLICATION_STATE_UNKNOWN:" + field
	if typeof(rec["field_present"]) != TYPE_BOOL:
		return "FIELD_STATE_PRESENCE_NOT_BOOL:" + field
	# Unpublished raw field is missing authority, never coerced to JS undefined/falsy.
	if not rec["field_present"]:
		return "FIELD_STATE_NOT_PUBLISHED:" + field
	if not rec.has("value"):
		return "FIELD_STATE_VALUE_OMITTED:" + field
	req.kinds_seen[rec["source_publication_kind"]] = true
	req.owners_seen["IMAGE_AUTHORITY:%d" % req.image_authority.get_instance_id()] = true
	return ""


func _read_wall_ms(req: WaitRequest) -> int:
	req.wall_reads += 1
	return int(floor(Time.get_unix_time_from_system() * 1000.0))


# --- source check -------------------------------------------------------------

func _run_source_check(req: WaitRequest) -> void:
	if req.terminal:
		return
	req.checks += 1
	req.check_mono_us.append(Time.get_ticks_usec())
	var obj_read := _read_current_obj_spr(req)
	if req.terminal:
		return
	if obj_read["gap"] != "":
		_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": obj_read["gap"]})
		return
	var obj_spr: Dictionary = obj_read["obj_spr"]
	var done := true
	# for(const k in _OBJ_SPR){const im=_OBJ_SPR[k];if(!im.complete&&!im.naturalWidth){done=false;break}}
	for k in js_for_in_key_order(obj_spr.keys()):
		var im: Variant = obj_spr[k]
		if not _is_live_reference(im):
			_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": "SOURCE_TYPEERROR_EQUIVALENT_OBJ_ENTRY_NULL:%s" % str(k)})
			return
		var complete := _read_field(req, im, "obj", "complete")
		if req.terminal:
			return
		if complete["gap"] != "":
			_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": complete["gap"]})
			return
		if js_truthy(complete["value"]):
			continue
		var width := _read_field(req, im, "obj", "naturalWidth")
		if req.terminal:
			return
		if width["gap"] != "":
			_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": width["gap"]})
			return
		if not js_truthy(width["value"]):
			done = false
			break
	# if(done){for(const im of _extraImgs){if(im&&im.src&&!im.complete&&!im.naturalWidth){done=false;break}}}
	if done:
		for im in req.extras:
			if not js_truthy(im):
				continue
			var src := _read_field(req, im, "extra", "src")
			if req.terminal:
				return
			if src["gap"] != "":
				_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": src["gap"]})
				return
			if not js_truthy(src["value"]):
				continue
			var complete := _read_field(req, im, "extra", "complete")
			if req.terminal:
				return
			if complete["gap"] != "":
				_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": complete["gap"]})
				return
			if js_truthy(complete["value"]):
				continue
			var width := _read_field(req, im, "extra", "naturalWidth")
			if req.terminal:
				return
			if width["gap"] != "":
				_terminate(req, TERMINAL_NOT_READY, {"not_ready_reason": width["gap"]})
				return
			if not js_truthy(width["value"]):
				done = false
				break
	# if(done||Date.now()-t0>timeout)r(); else setTimeout(check,50);
	if done:
		_terminate(req, TERMINAL_SOURCE_RESOLVED, {"resolve_cause": CAUSE_DONE})
		return
	var now_wall := _read_wall_ms(req)
	var exceeded := source_timeout_exceeded(now_wall, req.t0_wall_ms, req.timeout_ms)
	req.wall_comparisons.append({
		"check": req.checks, "wall_ms": now_wall,
		"elapsed_ms": now_wall - req.t0_wall_ms, "exceeded": exceeded,
	})
	if exceeded:
		_terminate(req, TERMINAL_SOURCE_RESOLVED, {"resolve_cause": CAUSE_TIMEOUT})
		return
	_schedule_poll(req)


# --- 50 ms poll with monotonic deadline --------------------------------------

func _schedule_poll(req: WaitRequest) -> void:
	# Stamped after the failed check, like setTimeout(check,50) issued after check().
	var scheduled_us := Time.get_ticks_usec()
	var poll := {
		"index": req.polls.size(), "after_check": req.checks,
		"scheduled_us": scheduled_us, "deadline_us": scheduled_us + POLL_INTERVAL_USEC,
		"arms": [], "wakes": [], "early_wakes": 0, "check_us": -1,
	}
	req.polls.append(poll)
	_arm_poll_timer(req, poll, POLL_INTERVAL_USEC)


func _arm_poll_timer(req: WaitRequest, poll: Dictionary, wait_us: int) -> void:
	var timer := Timer.new()
	timer.name = "SourceObjSpriteWaitPoll_r%d_p%d_a%d" % [req.request_id, poll["index"], poll["arms"].size()]
	timer.one_shot = true
	timer.autostart = false
	timer.process_mode = Node.PROCESS_MODE_ALWAYS
	req.ignore_time_scale_supported = "ignore_time_scale" in timer
	if req.ignore_time_scale_supported:
		timer.set("ignore_time_scale", true)
	var wait_sec := maxf(float(wait_us) / 1000000.0, MIN_TIMER_WAIT_SEC)
	timer.wait_time = wait_sec
	timer.timeout.connect(_on_poll_timer_timeout.bind(req, poll, timer), CONNECT_ONE_SHOT)
	add_child(timer)
	req.active_timer = timer
	req.timers_created += 1
	poll["arms"].append({"armed_us": Time.get_ticks_usec(), "wait_us": wait_us, "wait_time_sec": wait_sec})
	timer.start()


func _on_poll_timer_timeout(req: WaitRequest, poll: Dictionary, timer: Timer) -> void:
	var now_us := Time.get_ticks_usec()
	req.timer_callbacks += 1
	_release_timer(req, timer)
	if req.terminal:
		return
	poll["wakes"].append(now_us)
	var policy := poll_deadline_policy(now_us, poll["deadline_us"])
	if not policy["run_source_check"]:
		# Early wake (e.g. heavy frame delta): wait out the remaining real time on
		# a fresh isolated timer; no query, no check, original deadline kept.
		poll["early_wakes"] += 1
		req.early_wakes += 1
		_arm_poll_timer(req, poll, policy["remaining_us"])
		return
	poll["check_us"] = now_us
	_run_source_check(req)


func _release_timer(req: WaitRequest, timer: Timer) -> void:
	if req.active_timer == timer:
		req.active_timer = null
	if timer != null and is_instance_valid(timer):
		timer.stop()
		timer.queue_free()
		req.timers_freed += 1


# --- terminal -----------------------------------------------------------------

func _terminate(req: WaitRequest, terminal: String, info: Dictionary) -> void:
	if req.terminal:
		return
	req.terminal = true
	var terminal_us := Time.get_ticks_usec()
	var pending_timer_cleaned := false
	if req.active_timer != null:
		_release_timer(req, req.active_timer)
		pending_timer_cleaned = true
	_pending.erase(req.request_id)
	var packet := _build_packet(req, terminal, info, terminal_us, pending_timer_cleaned)
	var handle := req.handle
	handle.is_terminal = true
	handle.packet = packet
	handle.finished.emit(packet)
	wait_finished.emit(packet)


func _publication_verdict(req: WaitRequest) -> String:
	if req.kinds_seen.is_empty():
		return VERDICT_NONE
	if req.kinds_seen.has(PUBLICATION_CONSTRUCTOR):
		return VERDICT_UNVERIFIED
	return VERDICT_ACTUAL


func _status_for(req: WaitRequest, terminal: String, cause: String) -> String:
	if terminal == TERMINAL_SOURCE_RESOLVED:
		var actual := _publication_verdict(req) == VERDICT_ACTUAL
		if cause == CAUSE_DONE:
			return "SOURCE_WAIT_COMPLETED" if actual else "UNVERIFIED_SOURCE_WAIT_COMPLETED"
		return "SOURCE_WAIT_TIMED_OUT" if actual else "UNVERIFIED_SOURCE_WAIT_TIMED_OUT"
	if terminal == TERMINAL_NOT_READY:
		return "NOT_READY"
	if terminal == TERMINAL_CANCELLED:
		return "CANCELLED"
	return "DISPOSED"


func _build_packet(req: WaitRequest, terminal: String, info: Dictionary, terminal_us: int, pending_timer_cleaned: bool) -> Dictionary:
	var cause: String = info.get("resolve_cause", "")
	return {
		"schema": PACKET_SCHEMA,
		"source_ref": SOURCE_REF,
		"request_id": req.request_id,
		# Proves only that THIS wait body ran; not an actual image publication.
		"authority_owner": self,
		"authority_owner_instance_id": get_instance_id(),
		"owner_in_tree": is_inside_tree(),
		"terminal": terminal,
		"status": _status_for(req, terminal, cause),
		"source_resolved": terminal == TERMINAL_SOURCE_RESOLVED,
		"resolve_cause": cause,
		"not_ready_reason": info.get("not_ready_reason", ""),
		"adapter_reason": info.get("adapter_reason", ""),
		"texture_ready": false,
		"full_stage_ready": false,
		"publication_verdict": _publication_verdict(req),
		"publication_kinds_seen": req.kinds_seen.keys(),
		"publisher_owners_seen": req.owners_seen.keys(),
		"timeout_ms": req.timeout_ms,
		"t0_wall_ms": req.t0_wall_ms if req.wall_reads > 0 else null,
		"wall_reads": req.wall_reads,
		"wall_comparisons": req.wall_comparisons.duplicate(true),
		"begin_mono_us": req.begin_mono_us,
		"terminal_mono_us": terminal_us,
		"checks": req.checks,
		"check_mono_us": req.check_mono_us.duplicate(),
		"query_counts": req.query_counts.duplicate(),
		"query_log": req.query_log.duplicate(true),
		"query_log_truncated": req.query_log_truncated,
		"extra_refs_captured": req.extras.size(),
		"extra_ref_labels": req.extra_labels.duplicate(),
		"polls": req.polls.duplicate(true),
		"timers": {
			"created": req.timers_created,
			"callbacks": req.timer_callbacks,
			"freed": req.timers_freed,
			"early_wakes": req.early_wakes,
			"pending_timer_cleaned_at_terminal": pending_timer_cleaned,
			"process_mode": "PROCESS_MODE_ALWAYS",
			"ignore_time_scale_supported": req.ignore_time_scale_supported,
			"ignore_time_scale": req.ignore_time_scale_supported,
		},
	}
