extends RefCounted
## DEMO11-17: actual State ledger followed by optional PC UI/presentation handoff.
## This is demand-driven; no frame callbacks, combat execution or save IO.
var _main: WeakRef
var _state: WeakRef
var _handoff: Callable
var _busy := false
var _completed: Dictionary = {}

func configure(main: Node, state: Node) -> bool:
	if _main != null or not is_instance_valid(main) or main.get("source_state") != state:
		return false
	_main=weakref(main);_state=weakref(state)
	return true

func bind_handoff(receiver: Callable) -> bool:
	var main: Node=_main.get_ref() if _main != null else null
	var target: Object=receiver.get_object()
	if _busy or _handoff.is_valid() or not receiver.is_valid() or receiver.get_argument_count()!=1 \
		or not target is Node or not is_instance_valid(main) or not main.is_ancestor_of(target): return false
	_handoff=receiver
	return true

func request(command: Dictionary) -> Dictionary:
	if _busy: return {"accepted":false,"committed":false,"reason":"skill_transaction_in_progress","prefix":[]}
	var main: Node=_main.get_ref() if _main != null else null
	var state: Node=_state.get_ref() if _state != null else null
	if not is_instance_valid(main) or not is_instance_valid(state) or main.get("source_state")!=state \
		or not main.is_inside_tree() or not state.is_inside_tree() or state.read_native_skill_management_snapshot().is_empty():
		return {"accepted":false,"committed":false,"reason":"skill_owner_lost","prefix":[]}
	var id: Variant=command.get("request_id")
	if id is String and _completed.has(id):
		var prior: Dictionary=_completed[id]
		if prior.command!=command: return {"accepted":false,"committed":false,"reason":"request_id_conflict","prefix":[]}
		var replay: Dictionary=prior.result.duplicate(true);replay["replayed"]=true
		return replay
	_busy=true
	var result: Dictionary=state.commit_native_skill_management(main,command)
	if result.get("committed",false):
		# Original final render/update/save helpers run after ledger/selection/slots.
		# Refusal here retains the committed prefix and must never debit on retry.
		if _handoff.is_valid():
			var reply: Variant=_handoff.call(result.duplicate(true))
			if not reply is Dictionary or reply.get("accepted")!=true:
				result["accepted"]=false;result["status"]="COMMITTED_HANDOFF_FAILED"
				result["handoff"]={"accepted":false,"reason":"post_commit_handoff_refused_or_invalid"}
			else: result["handoff"]=reply.duplicate(true)
		else:
			result["handoff"]={"accepted":false,"reason":"presentation_owner_unbound","pending":["renderSkillPanel","updateSkSlot","updateQS","dbSaveForce_IO"]}
		result["current"]=state.read_native_skill_management_snapshot()
		_completed[id]={"command":command.duplicate(true),"result":result.duplicate(true)}
		if _completed.size()>32: _completed.erase(_completed.keys()[0])
	_busy=false
	return result
