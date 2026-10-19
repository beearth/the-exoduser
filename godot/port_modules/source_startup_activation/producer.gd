extends RefCounted
## Source startup activation producer (first slice).
##
## Source (canonical game.html):
##   64483  if(_bossTestReq>=0){G._cutsceneDone=true;G.on=true;if(P)P.iframes=300}
##   64484  else if(G.stage===0){ _startIntroCutscene() }  -> guide -> 63808 G.on=true;P.iframes=600
##   64486  }else{
##   64487    G.on=true;P.iframes=300;
##
## Every call reads the bound current G / current P / boss request readers and the
## required completion providers, builds a read-only plan, and hands ONE ordered
## packet (G.on first, then the conditional P.iframes) to the bound sink. The sink
## owns the real writes; this helper never writes G or P itself. There is no
## once/frame/dedup/sticky gate: each call re-reads all providers.
##
## Completion packet contracts below are the PROPOSED REQUIRED INTEGRATION
## CONTRACT. No actual postStage (64466..64481) or intro curtain (63738..63808)
## owner provider exists yet; until ENGINE binds one, these branches stay NOT_READY.
## authority_owner identity is interface provenance only, not a source gameplay rule.

# --- bindings (Callables passed to _init) ---
const BINDING_CURRENT_G := "current_g"
const BINDING_CURRENT_P := "current_p"
const BINDING_BOSS_REQUEST := "boss_request"
const BINDING_POST_STAGE := "post_stage_completion"
const BINDING_INTRO_CURTAIN := "intro_curtain_completion"
const BINDING_SINK := "sink"

# --- proposed completion packet contracts ---
const CONTRACT_POST_STAGE := "fdg.source_startup_activation.post_stage_completion.v1"
const POST_STAGE_SOURCE_OWNER := "game.html:64466-64481 boot continuation postStage"
const POST_STAGE_BOUNDARIES := [
	"game.html:64466-64474 if(_bossTestReq<0) sprite/map wait",
	"game.html:64475 stage BGM gate",
	"game.html:64476 await _prepareStartMapView()",
	"game.html:64477 setBootLoading(100)",
	"game.html:64478 hideBootLoading()",
	"game.html:64479 _dbReady=true",
	"game.html:64480 startAutoSave()",
	"game.html:64481 _rootRiftViewScheduleBootSave()",
]
const CONTRACT_INTRO_CURTAIN := "fdg.source_startup_activation.intro_curtain_completion.v1"
const INTRO_CURTAIN_SOURCE_OWNER := "game.html:63738-63743 _finishIntroGuide -> _openIntroCurtain"
const INTRO_CURTAIN_BOUNDARIES := [
	"game.html:63673-63689 _startIntro guide path",
	"game.html:63739-63740 _finishIntroGuide state.done=true",
	"game.html:63743 _finishIntroGuide calls _openIntroCurtain()",
	"game.html:63806-63807 _openIntroCurtain entry",
]

# --- branches / packet identity (distinct per branch) ---
const BRANCH_BOSS_300 := "BOSS_300"
const BRANCH_NONZERO_300 := "NONZERO_300"
const BRANCH_INTRO_600 := "INTRO_600"

const KIND_BOSS_300 := "source_startup_activation.boss_request_300"
const KIND_NONZERO_300 := "source_startup_activation.nonzero_stage_300"
const KIND_INTRO_600 := "source_startup_activation.intro_curtain_600"

const SOURCE_BOSS_300 := "game.html:64483 if(_bossTestReq>=0)"
const SOURCE_NONZERO_300 := "game.html:64486-64487 else (G.stage!==0)"
const SOURCE_INTRO_600 := "game.html:63808 _openIntroCurtain"

const WRITE_SOURCE_BOSS_300 := "G.on=true;if(P)P.iframes=300"
const WRITE_SOURCE_NONZERO_300 := "G.on=true;P.iframes=300"
const WRITE_SOURCE_INTRO_600 := "G.on=true;P.iframes=600"

## Exact source line of each write; both commands of a packet share it.
const WRITE_ANCHOR_BOSS_300 := "game.html:64483"
const WRITE_ANCHOR_NONZERO_300 := "game.html:64487"
const WRITE_ANCHOR_INTRO_600 := "game.html:63808"

const EXPR_G_ON := "G.on=true"
const EXPR_P_IFRAMES_300 := "P.iframes=300"
const EXPR_P_IFRAMES_600 := "P.iframes=600"

# --- residual gaps carried on each packet (not emitted as commands) ---
const RESIDUAL_BOSS_300 := [
	"game.html:64483 G._cutsceneDone=true precedes G.on; predecessor/caller owned, not emitted",
]
const RESIDUAL_NONZERO_300 := [
	"game.html:64488 if(G._bonfire)G._bonfire.t=300 not emitted",
	"game.html:64489 _DROP_PREVIEW spawn not emitted",
]
const RESIDUAL_INTRO_600 := [
	"game.html:63809-63815 HUD on/cam/room+corridor spawn not emitted",
	"game.html:63308-63317 _startIntroCutscene immediate 300 shortcuts unowned by this slice",
]

# --- statuses ---
const STATUS_READY := "READY"
const STATUS_NOT_READY := "NOT_READY"
const STATUS_SINK_APPLIED := "SINK_APPLIED"
const STATUS_SINK_REJECTED := "SINK_REJECTED"
const STATUS_SINK_RECEIPT_INVALID := "SINK_RECEIPT_INVALID"

## Sink receipt `status` values the producer relays (diagnostic only).
const SINK_RECEIPT_APPLIED := "APPLIED"
const SINK_RECEIPT_REJECTED := "REJECTED"

# --- NOT_READY reasons ---
const REASON_MISSING_BINDING_PREFIX := "MISSING_BINDING:"
const REASON_SOURCE_G_NULL := "SOURCE_G_NULL"
const REASON_INVALID_G_AUTHORITY := "INVALID_G_AUTHORITY"
const REASON_INVALID_P_AUTHORITY := "INVALID_P_AUTHORITY"
const REASON_SOURCE_P_NULL_NONBOSS := "SOURCE_P_NULL_NONBOSS"
const REASON_INVALID_BOSS_REQUEST := "INVALID_BOSS_REQUEST"
const REASON_POST_STAGE_PREFIX := "POST_STAGE_COMPLETION"
const REASON_INTRO_CURTAIN_PREFIX := "INTRO_CURTAIN_COMPLETION"
const REASON_POST_STAGE_BOSS_REQUEST_MISMATCH := "POST_STAGE_COMPLETION_BOSS_REQUEST_MISMATCH"
# Completion reasons are <PREFIX> + one of these suffixes, checked in this order.
const SUFFIX_PROVIDER_OWNER_NULL := "_PROVIDER_OWNER_NULL"
const SUFFIX_PENDING := "_PENDING"
const SUFFIX_NOT_STRUCTURED := "_NOT_STRUCTURED"
const SUFFIX_CONTRACT_MISMATCH := "_CONTRACT_MISMATCH"
const SUFFIX_SOURCE_OWNER_MISMATCH := "_SOURCE_OWNER_MISMATCH"
const SUFFIX_BOUNDARIES_MISMATCH := "_BOUNDARIES_MISMATCH"
const SUFFIX_AUTHORITY_OWNER_MISSING := "_AUTHORITY_OWNER_MISSING"
const SUFFIX_AUTHORITY_OWNER_MISMATCH := "_AUTHORITY_OWNER_MISMATCH"
const SUFFIX_AUTHORITY_G_MISMATCH := "_AUTHORITY_G_MISMATCH"
const SUFFIX_AUTHORITY_P_MISMATCH := "_AUTHORITY_P_MISMATCH"

const _REQUIRED_BINDINGS := [
	BINDING_CURRENT_G, BINDING_CURRENT_P, BINDING_BOSS_REQUEST, BINDING_POST_STAGE, BINDING_SINK,
]

var _bindings: Dictionary = {}
# Strong refs to RefCounted binding owners so bound Callables stay valid.
var _owners: Array = []


func _init(bindings: Dictionary = {}) -> void:
	_bindings = bindings.duplicate()
	for key in _bindings:
		if _bindings[key] is Callable:
			var c: Callable = _bindings[key]
			if c.get_object() is RefCounted:
				_owners.append(c.get_object())


## Reads all current providers and returns a read-only plan. Never calls the sink.
func plan() -> Dictionary:
	var reads: Array = []
	for name in _REQUIRED_BINDINGS:
		if not _has_binding(name):
			return _not_ready(REASON_MISSING_BINDING_PREFIX + name, "", reads, {}, null)

	var g = _call(BINDING_CURRENT_G)
	reads.append(BINDING_CURRENT_G)
	if typeof(g) == TYPE_NIL:
		return _not_ready(REASON_SOURCE_G_NULL, "", reads, {}, null)
	if not (g is Dictionary or g is Object):
		return _not_ready(REASON_INVALID_G_AUTHORITY, "", reads, {}, null)

	var p = _call(BINDING_CURRENT_P)
	reads.append(BINDING_CURRENT_P)
	if typeof(p) != TYPE_NIL and not (p is Dictionary or p is Object):
		return _not_ready(REASON_INVALID_P_AUTHORITY, "", reads, {}, null)
	var before := _before(g, p)

	var boss = _call(BINDING_BOSS_REQUEST)
	reads.append(BINDING_BOSS_REQUEST)
	# Source _bossTestReq is an integral Number >= -1 (3855); no fallback.
	if not _is_normalized_boss_request(boss):
		return _not_ready(REASON_INVALID_BOSS_REQUEST, "", reads, before, null)

	var post = _call(BINDING_POST_STAGE)
	reads.append(BINDING_POST_STAGE)
	var why := _completion_reason(REASON_POST_STAGE_PREFIX, post, BINDING_POST_STAGE,
		CONTRACT_POST_STAGE, POST_STAGE_SOURCE_OWNER, POST_STAGE_BOUNDARIES, g, p)
	if why != "":
		return _not_ready(why, "", reads, before, boss)
	var post_d: Dictionary = post
	if not _same_number(post_d.get("boss_request_observed"), boss):
		return _not_ready(REASON_POST_STAGE_BOSS_REQUEST_MISMATCH, "", reads, before, boss)

	# 64483: boss request first.
	if boss >= 0:
		return _ready_plan(BRANCH_BOSS_300, g, p, reads, before, boss)

	# 64484: strict G.stage===0 (absent/false/null/"0" are not numeric 0).
	var stage := _read_field(g, "stage")
	reads.append("G.stage")
	if stage["present"] and _is_source_strict_zero(stage["value"]):
		if not _has_binding(BINDING_INTRO_CURTAIN):
			return _not_ready(REASON_MISSING_BINDING_PREFIX + BINDING_INTRO_CURTAIN,
				BRANCH_INTRO_600, reads, before, boss)
		var intro = _call(BINDING_INTRO_CURTAIN)
		reads.append(BINDING_INTRO_CURTAIN)
		why = _completion_reason(REASON_INTRO_CURTAIN_PREFIX, intro, BINDING_INTRO_CURTAIN,
			CONTRACT_INTRO_CURTAIN, INTRO_CURTAIN_SOURCE_OWNER, INTRO_CURTAIN_BOUNDARIES, g, p)
		if why != "":
			return _not_ready(why, BRANCH_INTRO_600, reads, before, boss)
		if typeof(p) == TYPE_NIL:
			return _not_ready(REASON_SOURCE_P_NULL_NONBOSS, BRANCH_INTRO_600, reads, before, boss)
		return _ready_plan(BRANCH_INTRO_600, g, p, reads, before, boss)

	# 64486..64487: else.
	if typeof(p) == TYPE_NIL:
		return _not_ready(REASON_SOURCE_P_NULL_NONBOSS, BRANCH_NONZERO_300, reads, before, boss)
	return _ready_plan(BRANCH_NONZERO_300, g, p, reads, before, boss)


## plan() then, only when READY, exactly one sink call with the ordered packet.
func activate() -> Dictionary:
	var the_plan := plan()
	if the_plan["status"] != STATUS_READY:
		return _ro({
			"status": the_plan["status"],
			"reason": the_plan["reason"],
			"plan": the_plan,
			"sink_invocations": 0,
			"sink_receipt": null,
		})
	var sink: Callable = _bindings[BINDING_SINK]
	var receipt = sink.call(the_plan["packet"])
	var status := STATUS_SINK_RECEIPT_INVALID
	var reason := ""
	if receipt is Dictionary:
		var receipt_d: Dictionary = receipt
		var s = receipt_d.get("status")
		if _is_string(s, SINK_RECEIPT_APPLIED):
			status = STATUS_SINK_APPLIED
		elif _is_string(s, SINK_RECEIPT_REJECTED):
			status = STATUS_SINK_REJECTED
			reason = str(receipt_d.get("reason", ""))
	return _ro({
		"status": status,
		"reason": reason,
		"plan": the_plan,
		"sink_invocations": 1,
		"sink_receipt": receipt,
	})


func _has_binding(name: String) -> bool:
	if not _bindings.has(name) or not (_bindings[name] is Callable):
		return false
	var c: Callable = _bindings[name]
	return c.is_valid()


func _call(name: String) -> Variant:
	var c: Callable = _bindings[name]
	return c.call()


func _bound_owner(name: String) -> Object:
	var c: Callable = _bindings[name]
	return c.get_object()


func _ready_plan(branch: String, g, p, reads: Array, before: Dictionary, boss) -> Dictionary:
	var kind := ""
	var source := ""
	var write_source := ""
	var anchor := ""
	var p_expr := ""
	var p_value := 0
	var residual: Array = []
	match branch:
		BRANCH_BOSS_300:
			kind = KIND_BOSS_300
			source = SOURCE_BOSS_300
			write_source = WRITE_SOURCE_BOSS_300
			anchor = WRITE_ANCHOR_BOSS_300
			p_expr = EXPR_P_IFRAMES_300
			p_value = 300
			residual = RESIDUAL_BOSS_300
		BRANCH_NONZERO_300:
			kind = KIND_NONZERO_300
			source = SOURCE_NONZERO_300
			write_source = WRITE_SOURCE_NONZERO_300
			anchor = WRITE_ANCHOR_NONZERO_300
			p_expr = EXPR_P_IFRAMES_300
			p_value = 300
			residual = RESIDUAL_NONZERO_300
		BRANCH_INTRO_600:
			kind = KIND_INTRO_600
			source = SOURCE_INTRO_600
			write_source = WRITE_SOURCE_INTRO_600
			anchor = WRITE_ANCHOR_INTRO_600
			p_expr = EXPR_P_IFRAMES_600
			p_value = 600
			residual = RESIDUAL_INTRO_600
	var commands: Array = [_command(0, "G", "on", true, EXPR_G_ON, anchor, write_source)]
	var p_skipped := false
	# Only the boss branch has the source if(P) guard.
	if typeof(p) != TYPE_NIL:
		commands.append(_command(1, "P", "iframes", p_value, p_expr, anchor, write_source))
	else:
		p_skipped = true
	commands.make_read_only()
	var packet := _ro({
		"kind": kind,
		"source": source,
		"write_source": write_source,
		"write_anchor": anchor,
		"branch": branch,
		"boss_request": boss,
		"target_g": g,
		"target_p": p,
		"p_guard": "if(P)" if branch == BRANCH_BOSS_300 else "none",
		"p_write_skipped_by_source_guard": p_skipped,
		# `writes` is the same Array as `commands`; a sink consumes one, never both.
		"commands": commands,
		"writes": commands,
		"residual_gaps": residual,
	})
	reads.make_read_only()
	return _ro({
		"status": STATUS_READY,
		"reason": "",
		"branch": branch,
		"branch_candidate": branch,
		"boss_request": boss,
		"reads": reads,
		"before": before,
		"packet": packet,
	})


func _not_ready(reason: String, candidate: String, reads: Array, before: Dictionary, boss) -> Dictionary:
	reads.make_read_only()
	if not before.is_read_only():
		before.make_read_only()
	return _ro({
		"status": STATUS_NOT_READY,
		"reason": reason,
		"branch": "",
		"branch_candidate": candidate,
		"boss_request": boss,
		"reads": reads,
		"before": before,
		"packet": null,
	})


func _command(seq: int, target: String, field: String, value, expr: String,
		anchor: String, write_source: String) -> Dictionary:
	return _ro({
		"seq": seq,
		"target": target,
		"field": field,
		"value": value,
		"expr": expr,
		"source_anchor": anchor,
		"write_source": write_source,
	})


func _before(g, p) -> Dictionary:
	return _ro({
		"G.on": _ro(_read_field(g, "on")),
		"G._cutsceneDone": _ro(_read_field(g, "_cutsceneDone")),
		"G.stage": _ro(_read_field(g, "stage")),
		"P.iframes": _ro(_read_field(p, "iframes")),
	})


func _completion_reason(prefix: String, pkt, binding: String, contract: String, owner: String,
		boundaries: Array, g, p) -> String:
	var provider_owner := _bound_owner(binding)
	if provider_owner == null:
		return prefix + SUFFIX_PROVIDER_OWNER_NULL
	if typeof(pkt) == TYPE_NIL:
		return prefix + SUFFIX_PENDING
	if typeof(pkt) != TYPE_DICTIONARY:
		return prefix + SUFFIX_NOT_STRUCTURED
	var d: Dictionary = pkt
	if not _is_string(d.get("contract"), contract):
		return prefix + SUFFIX_CONTRACT_MISMATCH
	if not _is_string(d.get("source_owner"), owner):
		return prefix + SUFFIX_SOURCE_OWNER_MISMATCH
	var b = d.get("completed_boundaries")
	if typeof(b) != TYPE_ARRAY or b != boundaries:
		return prefix + SUFFIX_BOUNDARIES_MISMATCH
	var packet_owner = d.get("authority_owner")
	if typeof(packet_owner) != TYPE_OBJECT or packet_owner == null:
		return prefix + SUFFIX_AUTHORITY_OWNER_MISSING
	if not is_same(packet_owner, provider_owner):
		return prefix + SUFFIX_AUTHORITY_OWNER_MISMATCH
	if not d.has("authority_g") or not is_same(d["authority_g"], g):
		return prefix + SUFFIX_AUTHORITY_G_MISMATCH
	if not d.has("authority_p") or not is_same(d["authority_p"], p):
		return prefix + SUFFIX_AUTHORITY_P_MISMATCH
	return ""


static func _read_field(holder, field: String) -> Dictionary:
	if typeof(holder) == TYPE_NIL:
		return {"present": false, "holder": "null"}
	if holder is Dictionary:
		var d: Dictionary = holder
		if d.has(field):
			return {"present": true, "holder": "Dictionary", "value": d[field], "type": typeof(d[field])}
		return {"present": false, "holder": "Dictionary"}
	if holder is Object:
		for prop in (holder as Object).get_property_list():
			if prop["name"] == field:
				var v = (holder as Object).get(field)
				return {"present": true, "holder": "Object", "value": v, "type": typeof(v)}
		return {"present": false, "holder": "Object"}
	return {"present": false, "holder": "invalid"}


## JS Number domain of _bossTestReq after 3855: integral and >= -1.
## int, or finite float with an integral value. bool/null/String are malformed.
static func _is_normalized_boss_request(v) -> bool:
	match typeof(v):
		TYPE_INT:
			return v >= -1
		TYPE_FLOAT:
			return is_finite(v) and v == floor(v) and v >= -1.0
	return false


## Numeric equality across int/float (JS Number); non-numbers never match.
static func _same_number(a, b) -> bool:
	var ta := typeof(a)
	var tb := typeof(b)
	if (ta != TYPE_INT and ta != TYPE_FLOAT) or (tb != TYPE_INT and tb != TYPE_FLOAT):
		return false
	return float(a) == float(b)


## JS `x===0`: only a numeric zero. bool/null/String/absent never match.
static func _is_source_strict_zero(v) -> bool:
	match typeof(v):
		TYPE_INT:
			return v == 0
		TYPE_FLOAT:
			return v == 0.0
	return false


static func _is_string(v, s: String) -> bool:
	return typeof(v) == TYPE_STRING and v == s


static func _ro(d: Dictionary) -> Dictionary:
	d.make_read_only()
	return d
