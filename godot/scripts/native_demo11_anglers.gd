extends Node2D
const COMMON=preload("res://scripts/native_fieldboss_common.gd")
## G32143,60973–61141,20060–20093. Native World remains sole frame owner.
signal presentation_requested(index: int, event: Dictionary)
signal pc_interaction_requested(request: Dictionary)
signal family_defeated
const MODEL=preload("res://scripts/native_demo11_angler_model.gd")
const VIEW=preload("res://scripts/native_demo11_angler_view.gd")
var _main: Node
var _world: Node2D
var _state: Node
var _g: Dictionary
var _provider: Node2D
var _markers: Array=[]
var _views: Array=[]
var _warnings: Array=[]
var _pc_owner: Node
var _pc_interaction: Callable
var _last_pc: Dictionary={}
var _blocked: Dictionary={}
var _player_frame: Dictionary={"x":0.0,"y":0.0,"r":0.0,"iframes":0.0,"s":"idle"}
var _context: Dictionary={"lesson_active":false,"qa_storage_active":false,"aggro_active":false}
var _frame: Dictionary={"ready":false,"serial":-1,"sp":0.0}
var _serial: int=-1
var _births:=0
var _cancelled:=0
var profile_enabled:=false
var profile_calls:=0
var profile_max_us:=0
var profile_total_us:=0
var _reason: String="provider_required"
static func install_native_boot(main: Node) -> Node2D:
 var family:=new()
 family.name="Demo11Anglers"
 main.world.add_child(family)
 family._main=main;family._world=main.world;family._state=main.source_state
 var registry: Node=main.get("native_demo_boss_projectiles")
 if not is_instance_valid(registry):family.free();return null
 var g: Variant=main.source_state.read_current_g()
 if not g is Dictionary or not main.world.register_native_phase_consumer(family,family.advance_phase,family.advance_warnings) or not main.native_demo_boss_projectiles.bind_field_source(family,family.read_projectile_frame):
  family.free();return null
 family._g=g
 if not g.has("_fbDone"):g["_fbDone"]=false # G31569 new-run default; never reset an existing clear.
 return family
func _live() -> bool:
 return COMMON.collection_live(_main,self,_world,_g,"native_demo_anglers",_state,true)
func bind_provider(provider: Node2D,markers: Array) -> bool:
 if not _live() or is_instance_valid(_provider) or not COMMON.markers_valid(_world,provider,markers,4):return false
 _provider=provider;_markers=markers.duplicate();_reason="awaiting_live_tick"
 return true
func bind_pc_source(owner: Node,event: StringName,interaction: Callable=Callable()) -> bool:
 if not _live() or is_instance_valid(_pc_owner) or not is_instance_valid(owner) or not _main.is_ancestor_of(owner) or not owner.has_signal(event):return false
 if interaction.is_valid() and interaction.get_object()!=owner:return false
 if owner.connect(event,_pc_readback)!=OK:return false
 _pc_owner=owner;_pc_interaction=interaction
 return true
func bind_pc_interaction(owner: Node,handler: Callable) -> bool:
 if owner!=_pc_owner or not is_instance_valid(owner) or _pc_interaction.is_valid() or not handler.is_valid() or handler.get_object()!=owner:return false
 _pc_interaction=handler
 return true
func _pc_readback(index: int,hp: float,final_death: bool,serial: int) -> void:
 if not _live() or _g.get("stage")!=0 or _g.get("_bossArena",false) or not is_instance_valid(_pc_owner) or not _main.is_ancestor_of(_pc_owner) or index<0 or index>=4 or not _g.get("_fieldBosses") is Array or not is_finite(hp) or serial<=int(_last_pc.get(index,-1)):return
 var fb: Variant=_g._fieldBosses[index]
 if not fb is Dictionary or hp<0 or hp>fb.mhp or (final_death and hp!=0) or (not final_death and hp==0):return
 _last_pc[index]=serial
 _blocked.erase(index)
 fb.hp=hp # PC-owned HP readback only; no damage/HP formula or hitCd grant here.
 if not final_death:return
 fb.alive=false;_g._fieldBosses[index]=null
 if is_same(_g.get("_fieldBoss"),fb):_g._fieldBoss=null
 if is_instance_valid(_views[index]):_views[index].queue_free()
 var any_alive: bool=false
 for other in _g._fieldBosses:
  if other is Dictionary:any_alive=true
 if not any_alive:_g._fbDone=true;family_defeated.emit()
func _provider_live() -> bool:
 return COMMON.provider_current(_world,_provider,_markers)
func _rng() -> float:return _world.sample_native_random_unit()
func _clear() -> void:
 _main.native_demo_boss_projectiles.retire_field_projectiles(self)
 _g._fieldBoss=null;_g._fieldBosses=null
 COMMON.free_views(_views);_warnings.clear();_frame.ready=false
func advance_phase(sp: float,native_frame: float,enemies: Array) -> void:
 if not profile_enabled:_advance_phase(sp,native_frame,enemies);return
 var started:=Time.get_ticks_usec()
 _advance_phase(sp,native_frame,enemies)
 var elapsed:=Time.get_ticks_usec()-started
 profile_calls+=1;profile_total_us+=elapsed;profile_max_us=maxi(profile_max_us,elapsed)
func _advance_phase(sp: float,_native_frame: float,_enemies: Array) -> void:
 _frame.ready=false
 if not _live() or not _provider_live():return
 if _g.get("stage")!=0 or _g.get("_bossArena",false):_clear();return
 if not _g.get("on",false) or get_tree().paused:return
 var lesson: Dictionary=_main.read_native_normal_enemy_lesson_status()
 if lesson.get("ready")!=true or lesson.get("active")!=false:_reason="lesson_guard";return
 var serial: int=int(_world._native_clock_updates)
 if not COMMON.fresh_serial(serial,_serial):return
 _serial=serial
 if _g.get("_fbStage")!=0:
  _g._fbStage=0;_g._fbSpawned=false;_g._fbAnnounced=false;_clear()
 if not _g.get("_fbSpawned",false) and not _g.get("_fbDone",false):
  _g._fieldBosses=[]
  var level: float=float(_state.read_current_p().lv)
  for i in 4:
   var fb: Dictionary=MODEL.make(_markers[i].global_position,level,MODEL.ELEMENTS[i])
   _g._fieldBosses.append(fb)
   var view: Node2D=VIEW.new();view.name="Angler%d"%i;view.record=fb;view.set_meta("field_index",i);add_child(view);view.global_position=Vector2(fb.x,fb.y);_views.append(view)
  _g._fbSpawned=true
 var p: Dictionary=_player_frame
 p.x=_main.player.global_position.x;p.y=_main.player.global_position.y;p.r=_main.player.radius;p.iframes=_main.player.iframes;p.s=_main.player.state
 for key in ["_voidScarecrow","_explodeScarecrow"]:
  if _g.get(key) is Dictionary and _g[key].get("aggroOn",false):_reason="actual_aggro_reader_required";return
 _frame.ready=true;_frame.serial=serial;_frame.sp=sp;_frame.context=_context;_frame.player=p
 if not _g.get("_fieldBosses") is Array:return
 _g._fieldBoss=null
 var camera: Camera2D=get_viewport().get_camera_2d()
 var center: Vector2=camera.global_position if is_instance_valid(camera) else _main.player.global_position
 var viewport: Vector2=get_viewport_rect().size
 for i in 4:
  var fb: Variant=_g._fieldBosses[i]
  if not fb is Dictionary or fb.hp<=0:continue
  if str(_blocked.get(i,"")).ends_with("readback_required"):continue
  if _g._fieldBoss==null:_g._fieldBoss=fb
  # MODEL.tick returns without state/RNG writes for sleeping actors beyond 1000.
  # Preserve selection/serial/PC guards, but avoid an empty result/events allocation
  # and unchanged visual redraw for that exact dormant case.
  if fb.asleep and Vector2(fb.x,fb.y).distance_squared_to(_main.player.global_position)>1000000.0:continue
  var can_shoot: bool=absf(fb.x-center.x)<=maxf(0,viewport.x/2-64) and absf(fb.y-center.y)<=maxf(0,viewport.y/2-64)
  p.x=_main.player.global_position.x;p.y=_main.player.global_position.y;p.iframes=_main.player.iframes;p.s=_main.player.state
  var result: Dictionary=MODEL.tick(fb,p,can_shoot,_rng,_interaction if _pc_interaction.is_valid() else Callable())
  if not result.ready:_blocked[i]=result.get("reason","");continue
  _blocked.erase(i)
  for event in result.events:
   if event.kind=="wake":
    if not _g.get("_fbAnnounced",false):_g._fbAnnounced=true;presentation_requested.emit(i,{"kind":"announce","source_line":61072})
   elif event.kind=="energy":_birth(event.props)
   elif event.kind=="warning":_warnings.append({"owner":fb,"t":60.0,"x":fb.x,"y":fb.y,"props":event.props})
   presentation_requested.emit(i,event.duplicate(true))
  if is_instance_valid(_views[i]):_views[i].global_position=Vector2(fb.x,fb.y);_views[i].queue_redraw()
 _reason=""
func _interaction(request: Dictionary) -> Variant:
 pc_interaction_requested.emit(request.duplicate(true))
 var response: Variant=_pc_interaction.call(request) if _pc_interaction.is_valid() else null
 if request.kind=="body" and response is Dictionary and response.get("ack")==true:
  var after: Variant=response.get("player")
  if not COMMON.readback_matches(after,{"x":_main.player.global_position.x,"y":_main.player.global_position.y,"r":_main.player.radius,"iframes":_main.player.iframes,"s":_main.player.state},["x","y","r","iframes","s"]):return null
 return response
func _birth(props: Dictionary) -> bool:
 var receipt: Variant=_main.native_demo_boss_projectiles.birth_field_projectile(self,props,_frame)
 if not receipt is Dictionary or receipt.get("ack")!=true:_reason="actual_registry_birth_required";return false
 if receipt.get("projectile_result") is Dictionary:_births+=1
 return true
func advance_warnings(sp: float,_native_frame: float,_enemies: Array) -> void:
 if not _live() or _frame.get("ready")!=true:return
 var retained: Array=[]
 for warning in _warnings:
  var fb: Dictionary=warning.owner
  if not fb.get("alive",false) or float(fb.get("stunned",0))>0 or float(fb.get("_frozen",0))>0:_cancelled+=1;continue
  warning.t-=sp
  if warning.t>0:retained.append(warning);continue
  var props: Dictionary=warning.props.duplicate(true)
  props.x+=fb.x-warning.x;props.y+=fb.y-warning.y;props._commit=true
  _birth(props)
 _warnings=retained
func read_projectile_frame() -> Dictionary:
 return _frame if _live() and not _g.get("_bossArena",false) and _g.get("on",false) else {"ready":false}
func read_targets() -> Array:
 return COMMON.current_targets(_views)
func snapshot() -> Dictionary:
 return {"profile_calls":profile_calls,"profile_max_us":profile_max_us,"profile_total_us":profile_total_us,"provider_bound":is_instance_valid(_provider),"serial":_serial,"births":_births,"warnings":_warnings.size(),"cancelled":_cancelled,"blocked":_blocked.duplicate(true),"reason":_reason,"pc_bound":is_instance_valid(_pc_owner),"damage_parry_verified":false}
