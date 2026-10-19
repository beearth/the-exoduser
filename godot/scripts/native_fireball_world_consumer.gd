extends RefCounted
## One source pProjs pass, called by the actual World after enemy births.
## Native epoch is a once-only ownership token, never source gc_t/dt_sp.
const Flight = preload("res://port_modules/fireball_flight_source/producer.gd")
const AFFIX = preload("res://port_modules/equipment_affix_reader/producer.gd")
var _main: WeakRef
var _world: WeakRef
var _flight: RefCounted = Flight.new()
var _bound_owner: WeakRef
var _last_epoch: int = -1
var _release_count: int = 0
var _processing: bool = false
var _release_fields: Variant
var _blocked: Dictionary = {}
var _last: Dictionary = {"status":"NOT_CONFIGURED"}
var _steps: int = 0
var _passes: int = 0

func configure(main: Node, world: Node) -> bool:
	if _main!=null or not is_instance_valid(main) or not is_instance_valid(world) or main.get("world")!=world or world.get_parent()!=main:
		return false
	_main=weakref(main)
	_world=weakref(world)
	return true

func _owner_error(owner_world: Node) -> String:
	var main: Variant=_main.get_ref() if _main!=null else null
	var world: Variant=_world.get_ref() if _world!=null else null
	if not is_instance_valid(main) or not is_instance_valid(world) or owner_world!=world or world.get_parent()!=main or main.get("world")!=world or main.is_queued_for_deletion() or world.is_queued_for_deletion() or not main.is_inside_tree() or not world.is_inside_tree() or main.get_tree()!=world.get_tree():
		return "actual_fireball_world_consumer_owner_lost"
	if world.get_tree().paused:
		return "actual_fireball_world_paused"
	return ""

func advance_native(owner_world: Node) -> void:
	var error: String=_owner_error(owner_world)
	if not error.is_empty():
		_last={"status":"NOT_READY","reason":error}
		return
	var main: Node=_main.get_ref()
	var world: Node=_world.get_ref()
	var packets: Variant=world.read_native_player_projectiles(main)
	if not packets is Array:
		_last={"status":"NOT_READY","reason":"actual_world_packet_registry_unbound"}
		return
	if packets.is_empty():
		_last={"status":"NO_PACKETS","ready":false,"full_skill_complete":false}
		return
	var epoch: Variant=world.get_native_runtime_snapshot().get("clock_updates")
	if not epoch is int or epoch<0:
		_last={"status":"NOT_READY","reason":"actual_native_epoch_unbound"}
		return
	if epoch==_last_epoch:
		return
	var dependency: Dictionary=main.read_native_fireball_flight_dependencies()
	if dependency.get("ready")!=true:
		_last={"status":"NOT_READY","dependency":dependency.duplicate()}
		return
	if dependency.get("native_epoch")!=epoch:
		_last={"status":"NOT_READY","reason":"source_context_not_current_native_phase"}
		return
	var owner: Variant=dependency.get("owner")
	if not is_instance_valid(owner):
		_last={"status":"NOT_READY","reason":"actual_fireball_damage_owner_lost"}
		return
	if _bound_owner==null or _bound_owner.get_ref()!=owner:
		var bindings: Dictionary=dependency.bindings.duplicate()
		bindings["release_projectile"]=Callable(world,"_record_native_fireball_projectile_release")
		if not _flight.configure(bindings):
			_last={"status":"NOT_READY","reason":"actual_fireball_flight_binding_rejected"}
			return
		_bound_owner=weakref(owner)
	var begun: Dictionary=world.begin_native_player_projectile_iteration(main)
	if begun.get("ready")!=true:
		_last={"status":"NOT_READY","reason":begun.get("reason")}
		return
	if not is_same(begun.packets,packets):
		world.finish_native_player_projectile_iteration(main,packets.size())
		_last={"status":"NOT_READY","reason":"actual_registry_identity_changed"}
		return
	_last_epoch=epoch
	_passes+=1
	var read_index: int=0
	var write_index: int=0
	var results: Array=[]
	# Source35176 reads length on every condition, including synchronous appends.
	while read_index<packets.size():
		var packet: Variant=packets[read_index]
		if not packet is RefCounted or not packet.get("fields") is Dictionary:
			write_index=_keep_tail(packets,read_index,write_index)
			results.append({"slot":read_index,"status":"UNSUPPORTED_PACKET_HANDLE"})
			break
		var fields: Dictionary=packet.fields
		var key: int=packet.get_instance_id()
		var blocked: Variant=_blocked.get(key)
		if blocked is Dictionary and blocked.reference.get_ref()==packet:
			packets[write_index]=packet
			write_index+=1
			read_index+=1
			continue
		if fields.get("fireball")!=true or _source_truthy(fields.get("fireBeamProj")):
			# Other kinds remain owned by their existing/future actual consumer.
			packets[write_index]=packet
			write_index+=1
			read_index+=1
			continue
		var context: Dictionary=dependency.context.duplicate()
		context["slot_index"]=read_index
		_release_count=0
		_release_fields=null
		_processing=true
		var outcome: Variant=_flight.step(fields,context)
		_processing=false
		_steps+=1
		if not outcome is Dictionary:
			_blocked[key]={"reference":weakref(packet),"reason":"source_step_return_not_dictionary"}
			write_index=_keep_tail(packets,read_index,write_index)
			results.append({"slot":read_index,"status":"UNKNOWN_RESULT"})
			break
		var status: String=str(outcome.get("status","UNKNOWN"))
		results.append({"slot":read_index,"status":status,"events":outcome.get("events",[])})
		if status in ["DEAD_DISTANCE_EXPLODED","DEAD_WALL_EXPLODED","HIT_RELEASED"]:
			if _release_count!=1 or not is_same(_release_fields,fields):
				_blocked[key]={"reference":weakref(packet),"reason":"source_release_identity_or_count"}
				write_index=_keep_tail(packets,read_index,write_index)
				results.append({"slot":read_index,"status":"RELEASE_MISMATCH"})
				break
			# Only HIT invokes source _recyclePProj. The source dead branch
			# drops without recycle. No game callback/read follows its release.
			var retired: Dictionary=world.retire_native_player_projectile(main,packet,status=="HIT_RELEASED")
			if retired.get("ready")!=true:
				_blocked[key]={"reference":weakref(packet),"reason":"source_retire_rejected"}
				write_index=_keep_tail(packets,read_index,write_index)
				break
		elif status in ["FLYING","NOT_READY"] and _release_count==0:
			packets[write_index]=packet
			write_index+=1
		else:
			# A partial/unknown operation can already have damaged an enemy.
			# Keep all effects and the packet; never re-run that step or return it.
			_blocked[key]={"reference":weakref(packet),"reason":status,"outcome":outcome}
			write_index=_keep_tail(packets,read_index,write_index)
			break
		read_index+=1
	var finished: bool=world.finish_native_player_projectile_iteration(main,write_index)
	var pass_status: String="PARTIAL" if not _blocked.is_empty() else "SOURCE_PASS_FINISHED"
	if pass_status!="PARTIAL":
		for result in results:
			if result.get("status") not in ["FLYING","HIT_RELEASED","DEAD_DISTANCE_EXPLODED","DEAD_WALL_EXPLODED"]:
				pass_status="NOT_READY"
	_last={"status":pass_status if finished else "COMPACTION_NOT_READY","native_epoch":epoch,
		"source_gc_t":dependency.context.gc_t,"results":results,"survivors":write_index,
		"blocked":_blocked.size(),"source_array_identity":is_same(packets,world.read_native_player_projectiles(main)),
		"full_skill_complete":false}

func record_native_release(fields: Dictionary) -> void:
	if not _processing:return
	_release_count+=1
	_release_fields=fields

func _keep_tail(packets: Array, read_index: int, write_index: int) -> int:
	while read_index<packets.size():
		packets[write_index]=packets[read_index]
		write_index+=1
		read_index+=1
	return write_index

static func _source_truthy(value: Variant) -> bool:
	return AFFIX.js_truthy(value)

func get_snapshot() -> Dictionary:
	var main: Variant=_main.get_ref() if _main!=null else null
	var world: Variant=_world.get_ref() if _world!=null else null
	var mounted: bool=is_instance_valid(main) and is_instance_valid(world) and world.get_parent()==main
	var dependency: Dictionary=main.read_native_fireball_flight_dependencies() if mounted else {"ready":false,"missing":["actual_world_consumer_unbound"]}
	return {"mounted":mounted,"producer_configured":_flight.is_ready(),
		"readiness":{"ready":dependency.get("ready")==true,"missing":dependency.get("missing",[])},
		"last":_last.duplicate(true),"passes":_passes,"steps":_steps,"blocked":_blocked.size(),
		"source_clock_equivalence_claim":false,"visual_bound":false,"full_skill_complete":false}
