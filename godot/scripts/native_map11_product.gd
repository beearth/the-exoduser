extends Node
## MAP11 transport only. Combat completion/locks remain PC encounter authority.
var _main: WeakRef
var _provider: WeakRef
var _sites: Dictionary={}
var _space := "field"
var _transitions := 0
var _last: Dictionary={}
var _gate_owner: WeakRef
func configure(main: Node) -> bool:
 if _main!=null or not is_instance_valid(main.world) or not main.world.get("map11_provider") is Node:return false
 var provider: Node=main.world.map11_provider
 if not provider.runtime_ready() or main.read_native_demo_policy().get("stage")!=0:return false
 _main=weakref(main);_provider=weakref(provider);_sites=provider.transition_sites()
 process_physics_priority=2
 return true
func provider() -> Node:
 return _provider.get_ref() if _provider!=null and is_instance_valid(_provider.get_ref()) else null
func current() -> bool:
 var p:=provider()
 return p!=null and p.runtime_ready() and _main!=null and is_instance_valid(_main.get_ref()) and _main.get_ref().world.map11_provider==p
func snapshot() -> Dictionary:
 return {"status":"READY" if current() else "NOT_READY","space":_space,"transitions":_transitions,"last":_last.duplicate(true),"provider":provider(),"combat_completion":"NOT_READY_PC_INTERFACE","gate_owner_bound":_gate_owner!=null}
func bind_gate_owner(owner: Node) -> bool:
 if not current() or _gate_owner!=null or not provider().bind_gate_consumer(owner):return false
 _gate_owner=weakref(owner);return true
func _physics_process(_delta: float) -> void:
 if not current() or get_tree().paused:return
 var main: Node=_main.get_ref()
 if not main.source_state.read_current_g().get("on",false):return
 var route: String="enter" if _space=="field" else "leave"
 if provider().gate_contact(main.player.global_position,route):request_transition(route)
func request_transition(route: String) -> Dictionary:
 if not current() or get_tree().paused:return {"status":"NOT_READY","reason":"provider_or_pause"}
 var main: Node=_main.get_ref()
 if route not in ["enter","leave"] or (route=="enter")!=(_space=="field"):return {"status":"REJECTED","reason":"route"}
 if not provider().gate_contact(main.player.global_position,route):return {"status":"REJECTED","reason":"not_at_gate"}
 if _gate_owner==null and route=="leave" and main.source_state.read_current_g().get("bossAlive",true)!=false:
  return {"status":"NOT_READY","reason":"PC_FINAL_DEFEAT_REVIVE_INTERFACE_PENDING"}
 if _gate_owner!=null:
  if not is_instance_valid(_gate_owner.get_ref()):return {"status":"NOT_READY","reason":"gate_owner_retired"}
  if route=="enter":
   var options: Dictionary=main.source_initialization_services.read_current_options()
   var g: Dictionary=main.source_state.read_current_g()
   if not options.get("diff") is int:return {"status":"NOT_READY","reason":"actual_difficulty_required"}
   var receipt: Dictionary=provider().request_gate_enter(main.player.global_position,{"difficulty_index":options.diff,"stage_diff_offset":g.get("_stageDiffOff",0),"room":0})
   if receipt.get("status")!="READY":return receipt
  elif not provider().request_gate_leave(main.player.global_position):return {"status":"NOT_READY","reason":"gate_owner_leave"}
 var destination: Marker2D=_sites.arena_entry if route=="enter" else _sites.field_return
 var next: String="arena" if route=="enter" else "field"
 if not provider().can_move(destination.global_position,main.player.radius,next):return {"status":"NOT_READY","reason":"destination_blocked"}
 if not main.world.activate_map11_space(next):return {"status":"NOT_READY","reason":"space"}
 if _gate_owner!=null:
  # The encounter owner is the sole transport writer when delegated. Read back.
  if main.player.global_position!=destination.global_position or main.source_state.read_current_g().get("_bossArena")!=(next=="arena"):
   main.world.activate_map11_space(_space);return {"status":"NOT_READY","reason":"gate_owner_readback"}
 else:
  var committed: Dictionary=main.source_state.commit_native_map11_transport(main,provider(),destination,next)
  if not committed.get("applied",false):
   main.world.activate_map11_space(_space);return committed
 _space=next
 main.player.reset_physics_interpolation()
 main.camera.global_position=destination.global_position;main.camera.reset_physics_interpolation();main.camera.reset_smoothing()
 _transitions+=1;_last={"status":"READY","route":route,"anchor":destination.get_meta("anchor_id",str(destination.name)),"space":next,"combat_ready":false}
 return _last.duplicate(true)
