extends Node2D
## 1-1 WM collection. No Player damage/movement/parry implementation.
signal presentation_requested(index: int,event: Dictionary)
signal final_death(index: int)
signal protected_contact_requested(index: int,request: Dictionary)
const MODEL=preload("res://scripts/native_demo11_worm_model.gd")
const VIEW=preload("res://scripts/native_demo11_worm_view.gd")
var _main: Node
var _world: Node2D
var _g: Dictionary
var _provider: Node2D
var _markers: Array=[]
var _records: Array=[]
var _views: Array=[]
var _frame: Dictionary={"ready":false}
var _serial: int=-1
var _hit_owner: Node
var _pc_contact: Callable
var _aggro: Callable
var _aggro_bound:=false
var _blocked: Dictionary={}
var _quarantine: Dictionary={}
var _index: int=-1
var _busy:=false
var _born:=0
var _reason: String="provider_required"
static func install_native_boot(main: Node) -> Node2D:
 if not is_instance_valid(main.get("native_demo_boss_projectiles")):return null
 var service:=new();service.name="Demo11Worms";main.world.add_child(service)
 service._main=main;service._world=main.world
 var g: Variant=main.source_state.read_current_g()
 if not g is Dictionary or not main.world.register_native_phase_consumer(service,service.advance_phase) or not main.native_demo_boss_projectiles.bind_field_auxiliary(service,service.read_projectile_frame,service.read_aggro):service.free();return null
 service._g=g
 return service
func _live() -> bool:
 return is_instance_valid(_main) and _main.get("native_demo_worms")==self and get_parent()==_world and _main.world==_world and is_same(_main.source_state.read_current_g(),_g)
func _provider_live() -> bool:
 if not is_instance_valid(_provider) or not _world.is_ancestor_of(_provider):return false
 for marker in _markers:
  if not is_instance_valid(marker) or not _provider.is_ancestor_of(marker):return false
 return true
func bind_provider(provider: Node2D, markers: Array) -> bool:
 if not _live() or is_instance_valid(_provider) or not is_instance_valid(provider) or not _world.is_ancestor_of(provider) or markers.size()!=4:return false
 var seen: Dictionary={}
 for marker in markers:
  if not marker is Marker2D or not provider.is_ancestor_of(marker) or not marker.global_position.is_finite() or seen.has(marker.get_instance_id()):return false
  seen[marker.get_instance_id()]=true
 _provider=provider;_markers=markers.duplicate();_reason="awaiting_tick";return true
func bind_hit_owner(owner: Node) -> bool:
 if not _live() or is_instance_valid(_hit_owner) or not is_instance_valid(owner) or not _main.is_ancestor_of(owner):return false
 _hit_owner=owner;return true
func bind_protected_contact(owner: Node,handler: Callable) -> bool:
 if not _live() or _pc_contact.is_valid() or not is_instance_valid(owner) or not _main.is_ancestor_of(owner) or not handler.is_valid() or handler.get_object()!=owner:return false
 _pc_contact=handler;return true
func bind_aggro_reader(owner: Node,handler: Callable) -> bool:
 if not _live() or _aggro.is_valid() or not is_instance_valid(owner) or not _main.is_ancestor_of(owner) or not handler.is_valid() or handler.get_object()!=owner:return false
 _aggro=handler;_aggro_bound=true;return true
func read_aggro(at: Vector2) -> Dictionary:
 if not _live():return {"ready":false}
 if _aggro_bound and not _aggro.is_valid():return {"ready":false}
 if _aggro.is_valid():
  var r: Variant=_aggro.call(at)
  if not r is Dictionary or r.get("ready")!=true or not r.get("active") is bool:return {"ready":false}
  if r.active and (not r.get("target") is Node2D or not is_instance_valid(r.target) or not _main.is_ancestor_of(r.target)):return {"ready":false}
  return r
 for key in ["_voidScarecrow","_explodeScarecrow"]:
  if _g.get(key) is Dictionary and _g[key].get("aggroOn",false):return {"ready":false,"reason":"actual_aggro_owner_required"}
 return {"ready":true,"active":false}
func _player() -> Dictionary:
 var p: Dictionary=_main.source_state.read_current_p().duplicate(true)
 p.x=_main.player.global_position.x;p.y=_main.player.global_position.y;p.r=_main.player.radius;p.iframes=_main.player.iframes;p.s=_main.player.state
 return p
func _rng() -> float:return _world.sample_native_random_unit()
func _wall(at: Vector2) -> bool:return _world.is_world_blocked(at)
func advance_phase(sp: float,_native_frame: float,_enemies: Array) -> void:
 _frame={"ready":false}
 if not _live() or not _provider_live():return
 if _world.map_data.is_empty():_reason="actual_map_required";return
 if _g.get("stage")!=0 or _g.get("_bossArena",false):clear_family();return
 if not _g.get("on",false) or get_tree().paused:return
 var lesson: Dictionary=_main.read_native_normal_enemy_lesson_status()
 if lesson.get("ready")!=true or lesson.get("active")!=false:return
 var serial: int=int(_world.get_native_projectile_fx_context().frame_reset_epoch)
 if serial<=_serial:return
 _serial=serial
 if _g.get("_wmStage")!=0:_g._wmStage=0;_g._worms=null
 if _g.get("_worms")==null:
  _records=[];_g._worms=_records
  var level: float=float(_main.source_state.read_current_p().lv)
  for i in 4:
   var w: Dictionary=MODEL.initial(_markers[i].global_position,level)
   _records.append(w)
   var view: Node2D=VIEW.new();view.name="Worm%d"%i;view.record=w;add_child(view);view.global_position=Vector2(w.x,w.y);_views.append(view)
 if not is_same(_g.get("_worms"),_records):_reason="actual_collection_replaced";return
 var context: Dictionary={"lesson_active":false,"qa_storage_active":false,"aggro_active":false}
 _frame={"ready":true,"serial":serial,"sp":sp,"context":context,"player":_player()}
 var camera: Camera2D=get_viewport().get_camera_2d()
 var center: Vector2=camera.global_position if is_instance_valid(camera) else _main.player.global_position
 var size: Vector2=get_viewport_rect().size
 _busy=true
 for i in _records.size():
  if _records[i]==null or _quarantine.has(i):continue
  var proposed: Dictionary=_records[i].duplicate(true)
  var p: Dictionary=_player()
  var c: Dictionary={"camera":center,"viewport":size,"bonfire":_g.get("_bonfire"),"can_shoot":absf(proposed.x-center.x)<=maxf(0,size.x/2-64) and absf(proposed.y-center.y)<=maxf(0,size.y/2-64)}
  _index=i
  var result: Dictionary=MODEL.advance(proposed,p,c,_rng,_wall,_contact if _pc_contact.is_valid() else Callable())
  if not result.ready:
   _blocked[i]=result.get("reason","")
   if result.get("reason")=="PC_contact_receipt_invalid":_quarantine[i]=true
   continue
  _blocked.erase(i)
  _records[i].merge(proposed,true)
  for event in result.events:
   if event.kind=="shot":
    var receipt: Variant=_main.native_demo_boss_projectiles.birth_field_projectile(self,event.props,_frame)
    if receipt is Dictionary and receipt.get("ack")==true and receipt.get("projectile_result") is Dictionary:_born+=1
    else:_reason="actual_registry_birth_required"
   presentation_requested.emit(i,event)
  if is_instance_valid(_views[i]):_views[i].global_position=Vector2(proposed.x,proposed.y);_views[i].queue_redraw()
 _index=-1;_busy=false
 _frame.player=_player()
func _contact(request: Dictionary) -> Variant:
 protected_contact_requested.emit(_index,request.duplicate(true))
 var r: Variant=_pc_contact.call(request)
 if not r is Dictionary or r.get("ack")!=true or not r.get("committed") is bool:return null
 var p: Variant=r.get("player_after")
 var actual: Dictionary=_player()
 if not p is Dictionary:return null
 for key in ["x","y","r","iframes","s","hp"]:
  if p.get(key)!=actual.get(key):return null
 return r
func _admit_hit(owner: Node) -> bool:
 return _live() and _provider_live() and not _busy and owner==_hit_owner and is_instance_valid(owner) and _main.is_ancestor_of(owner) and _g.get("on",false) and _g.get("stage")==0 and not _g.get("_bossArena",false) and not get_tree().paused
func apply_hit(owner: Node,index: int,damage: float) -> Dictionary:
 if not _admit_hit(owner) or index<0 or index>=_records.size() or not is_finite(damage) or _records[index]==null:return {"accepted":false}
 var w: Dictionary=_records[index]
 if not MODEL.can_hit(w) or not MODEL.apply_hit(w,damage):return {"accepted":false}
 presentation_requested.emit(index,{"kind":"hit","hp":w.hp})
 if w.hp<=0:
  _records[index]=null
  if is_instance_valid(_views[index]):_views[index].queue_free()
  final_death.emit(index)
 return {"accepted":true,"hp":w.hp,"dead":w.hp<=0,"rewards_written":false}
func hurt_at(owner: Node,at: Vector2,radius: float,damage: float,hit_set: Dictionary,parry_shot: bool=false) -> int:
 if not _admit_hit(owner) or not at.is_finite() or not is_finite(radius) or radius<0 or not is_finite(damage):return 0
 var count:=0
 for i in _records.size():
  var w: Variant=_records[i]
  if w==null or not MODEL.can_hit(w) or not is_instance_valid(_views[i]) or hit_set.has(_views[i]) or at.distance_to(Vector2(w.x,w.y))>=radius+w.r:continue
  hit_set[_views[i]]=true # G18748 hitSet precedes hitCd rejection.
  var r: Dictionary=apply_hit(owner,i,damage)
  if r.accepted or parry_shot:count+=1
  if parry_shot:presentation_requested.emit(i,{"kind":"parry_hit_fx"})
 return count
func clear_family() -> void:
 _main.native_demo_boss_projectiles.retire_field_projectiles(self)
 _records.clear();_g._worms=_records
 for view in _views:
  if is_instance_valid(view):view.queue_free()
 _views.clear();_blocked.clear();_quarantine.clear();_frame={"ready":false}
func read_projectile_frame() -> Dictionary:
 return _frame if _live() and not _g.get("_bossArena",false) and _g.get("on",false) else {"ready":false}
func read_targets() -> Array:return _views.filter(func(v):return is_instance_valid(v) and not v.is_queued_for_deletion())
func snapshot() -> Dictionary:return {"provider_bound":is_instance_valid(_provider),"serial":_serial,"born":_born,"blocked":_blocked.duplicate(),"quarantined":_quarantine.size(),"reason":_reason,"full_combat_ready":false}
