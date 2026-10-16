extends RefCounted
## Source fireball phase consumed only after the actual Player physics step.
## World supplies frame/dt; no independent timer, state copy or source G write.
const CastSource=preload("res://port_modules/fireball_cast_source/producer.gd")
var _main: WeakRef
var _cast: RefCounted
var _last_frame: float=-1.0
var _last: Dictionary={"status":"NOT_READY","reason":"not_configured"}

func configure(main: Node) -> bool:
	if _main!=null or not is_instance_valid(main) or main.get_script()==null or main.get_script().resource_path!="res://scripts/main.gd":return false
	var candidate=CastSource.new()
	if not candidate.configure(main.get_native_fireball_bindings()):return false
	_main=weakref(main)
	_cast=candidate
	return true

func advance_native(ticks: float,frame: float,entered_state: String) -> void:
	var main: Variant=_main.get_ref() if _main!=null else null
	if not is_instance_valid(main) or main.is_queued_for_deletion() or not main.is_inside_tree() or main.get_tree().paused:return
	var player: Variant=main.get("player")
	var world: Variant=main.get("world")
	var holder: Variant=main.get("source_state")
	if not is_instance_valid(player) or not is_instance_valid(world) or not is_instance_valid(holder) or world.get("player")!=player or player.hp<=0.0 or player.get_native_character_profile_snapshot().get("ready")!=true:return
	if not is_finite(ticks) or ticks<=0.0 or frame!=world.get_native_frame() or ticks!=world.get_native_projectile_fx_context().dt_sp or frame==_last_frame:return
	_last_frame=frame
	# Source switches on the entered case. A legacy recover/stun which became
	# idle during this tick must not gain a second idle-input pass in that tick.
	if entered_state not in ["idle","bowRecover","magicCast","magicRecover"]:
		_last={"status":"DEFERRED_NATIVE_PHASE","reason":"entered_native_case_has_no_magic_dispatch"}
		return
	var held: Dictionary=player.get_native_input_snapshot().held
	if player.state not in ["magicCast","magicRecover"] and not held.get("native_magic",false):return
	if player.state in ["magicCast","magicRecover"]:
		if not holder.advance_native_fireball_clock(main,ticks,frame):
			_last={"status":"NOT_READY","reason":"actual_fireball_phase_clock_rejected"}
			return
	if player.state=="magicCast":
		_last=_cast.tick_cast()
	elif player.state=="magicRecover":
		# Source Q recovery branch belongs to the existing Q owner. Its current
		# native gate does not yet admit this new state; do not rewrite that gate.
		if held.get("parry",false):
			_last={"status":"DEFERRED_OTHER_OWNER","reason":"magic_recover_q_branch_unported"}
			return
		_last=_cast.request("magicRecover")
	elif player.state in ["idle","bowRecover"]:
		# Higher-priority native input already ran in Player's existing phase.
		_last=_cast.request(player.state,false)

func get_snapshot() -> Dictionary:
	return {"producer_bound":is_instance_valid(_cast) and _cast.is_ready(),
		"last":_last.duplicate(true),"scope":"NATIVE_FIREBALL_OWNER_PARTIAL",
		"full_skill_complete":false,"gamepad_supported":false}
