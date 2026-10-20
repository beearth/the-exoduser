extends RefCounted
## Fieldboss shared mechanics only. Family AI/HP/reward/clock order stays at caller.
## Registry is still DEMO11-35's one actual pool, never a second owner.
## Stored liveness refs use Variant: freed Nodes must reach is_instance_valid.
static func i32(value: float) -> int:
 if not is_finite(value):return 0
 var n: float=fposmod(floor(value) if value>=0 else ceil(value),4294967296.0)
 return int(n-4294967296.0 if n>=2147483648.0 else n)
static func fire_i32(value: float) -> int:
 var v: float=fmod(value,4294967296.0)
 v=ceil(v) if v<0 else floor(v)
 if v<0:v+=4294967296.0
 return int(v-4294967296.0 if v>=2147483648.0 else v)
static func number(v: Variant) -> bool:return (v is int or v is float) and is_finite(float(v))
static func valid_player(value: Variant) -> bool:
 if not value is Dictionary or not value.get("s") is String:return false
 for k in ["x","y","r","iframes"]:
  if not value.get(k) is float and not value.get(k) is int:return false
  if not is_finite(float(value[k])):return false
 return value.r>=0
static func collection_live(main: Variant,service: Node,world: Variant,g: Dictionary,property: String,state: Variant=null,pin_state: bool=false) -> bool:
 return is_instance_valid(main) and main.get(property)==service and service.get_parent()==world and main.world==world and (not pin_state or main.source_state==state) and is_same(main.source_state.read_current_g(),g)
static func fire_live(main: Variant,service: Node) -> bool:
 return is_instance_valid(main) and is_instance_valid(main.world) and not main.is_queued_for_deletion() and service.is_inside_tree() and service.get_parent()==main.world and main.world.get_parent()==main
static func markers_valid(world: Node,provider: Node2D,markers: Array,count: int) -> bool:
 if not is_instance_valid(provider) or not world.is_ancestor_of(provider) or markers.size()!=count:return false
 var seen: Dictionary={}
 for marker in markers:
  if not marker is Marker2D or not provider.is_ancestor_of(marker) or seen.has(marker.get_instance_id()) or not marker.global_position.is_finite():return false
  seen[marker.get_instance_id()]=true
 return true
static func provider_current(world: Node,provider: Variant,markers: Array) -> bool:
 if not is_instance_valid(provider) or not world.is_ancestor_of(provider):return false
 for marker in markers:
  if not is_instance_valid(marker) or not provider.is_ancestor_of(marker):return false
 return true
static func named_markers(provider: Node2D,names: Array) -> Array:
 var markers: Array=[]
 for key in names:
  var marker: Node=provider.get_node_or_null("Markers/"+key)
  if not marker is Marker2D or not marker.global_position.is_finite():return []
  markers.append(marker)
 return markers
static func named_provider_current(world: Node,provider: Variant,markers: Array,names: Array) -> bool:
 if not is_instance_valid(provider) or not world.is_ancestor_of(provider) or provider.is_queued_for_deletion():return false
 for i in range(names.size()):
  if not is_instance_valid(markers[i]) or provider.get_node_or_null("Markers/"+names[i])!=markers[i] or not markers[i].is_inside_tree():return false
 return true
static func handler_owned(main: Node,owner: Node,handler: Callable) -> bool:
 return is_instance_valid(owner) and main.is_ancestor_of(owner) and handler.is_valid() and handler.get_object()==owner
static func player_snapshot(main: Node) -> Dictionary:
 var p: Dictionary=main.source_state.read_current_p().duplicate(true)
 p.x=main.player.global_position.x;p.y=main.player.global_position.y;p.r=main.player.radius;p.iframes=main.player.iframes;p.s=main.player.state
 return p
static func readback_matches(value: Variant,actual: Dictionary,keys: Array) -> bool:
 if not value is Dictionary:return false
 for key in keys:
  if value.get(key)!=actual.get(key):return false
 return true
static func current_targets(views: Array) -> Array:
 return views.filter(func(view):return is_instance_valid(view) and not view.is_queued_for_deletion())
static func free_views(views: Array,clear: bool=true) -> void:
 for view in views:
  if is_instance_valid(view):view.queue_free()
 if clear:views.clear()
static func hit_owner_admitted(main: Variant,owner: Node,expected: Variant,busy: bool,provider_live: bool,g: Dictionary,reject_queued: bool=false) -> bool:
 return provider_live and not busy and owner==expected and is_instance_valid(owner) and (not reject_queued or not owner.is_queued_for_deletion()) and main.is_ancestor_of(owner) and g.get("on",false) and g.get("stage")==0 and not g.get("_bossArena",false) and not main.get_tree().paused
static func hit_cd8(record: Dictionary,damage: float,fire: bool=false) -> void:
 record.hp-=maxi(1,fire_i32(damage) if fire else i32(damage));record.hitCd=8
static func fresh_serial(serial: int,previous: int) -> bool:return serial>previous
# FD's continuation/pump and native World's frame are deliberately not converted.
# They only share serial comparison and validation helpers, never a new clock.
static func birth_fire(registry: Node,props: Dictionary,frame: Dictionary) -> Variant:
 return registry._birth_request({"command":"spawnProj_owner","args":[props],"frame":frame})
static func bind_field_source(registry: Node, owner: Node, reader: Callable) -> bool:
 if is_instance_valid(registry._field_owner) or not is_instance_valid(owner) or owner.get_parent()!=registry._world or not reader.is_valid() or reader.get_object()!=owner:return false
 registry._field_owner=owner;registry._field_reader=reader
 return true
# DEMO11-33 auxiliary source: same global registry/drop/RNG, real owner identity.

static func bind_field_auxiliary(registry: Node, owner: Node, reader: Callable, aggro: Callable=Callable()) -> bool:
 if not is_instance_valid(owner) or owner.get_parent()!=registry._world or not reader.is_valid() or reader.get_object()!=owner or owner==registry._field_owner or registry._field_aux.has(owner):return false
 if aggro.is_valid() and aggro.get_object()!=owner:return false
 registry._field_aux[owner]={"reader":reader,"aggro":aggro}
 return true

static func _field_registered(registry: Node, owner: Node) -> bool:
 return is_instance_valid(owner) and owner.get_parent()==registry._world and (owner==registry._field_owner or registry._field_aux.has(owner))

static func _field_context(registry: Node, owner: Node, at: Vector2, base: Dictionary) -> Variant:
 if not registry._field_aux.has(owner) or not registry._field_aux[owner].aggro.is_valid():return base
 var context: Dictionary=base.duplicate(true)
 if registry._field_aux.has(owner) and registry._field_aux[owner].aggro.is_valid():
  var response: Variant=registry._field_aux[owner].aggro.call(at)
  if not response is Dictionary or response.get("ready")!=true or not response.get("active") is bool:return null
  context.aggro_active=response.active
  if response.active:
   var target: Variant=response.get("target")
   if not target is Node2D or not is_instance_valid(target) or not target.is_inside_tree():return null
   context.aggro_target_node=target;context.aggro_target={"x":target.global_position.x,"y":target.global_position.y}
 return context

static func birth_field_projectile(registry: Node, owner: Node, props: Dictionary, frame: Dictionary) -> Variant:
 if not registry._field_registered(owner):return null
 var context: Variant=registry._field_context(owner,Vector2(props.get("x",0),props.get("y",0)),frame.get("context",{}))
 if not context is Dictionary:return null
 var input: Dictionary=frame.duplicate(true);input.context=context
 return registry._birth_request({"command":"spawnProj_owner","args":[props],"frame":input,"field_source":true,"field_owner":owner})

static func retire_field_projectiles(registry: Node, owner: Node) -> int:
 if not registry._field_registered(owner):return 0
 var count:=0
 for id in registry._entries.keys():
  var entry: Dictionary=registry._entries[id]
  if entry.get("field_owner")==owner and is_instance_valid(entry.node):entry.node._end("field_arena_handoff");count+=1
 return count


static func advance_field_clock(registry: Node) -> bool:
 var field_frame: Dictionary=registry._field_reader.call() if is_instance_valid(registry._field_owner) and registry._field_reader.is_valid() else {"ready":false}
 for owner in registry._field_aux.keys():
  if not registry._field_registered(owner):registry._field_aux.erase(owner);continue
  var candidate: Dictionary=registry._field_aux[owner].reader.call()
  if candidate.get("ready")!=true:continue
  if field_frame.get("ready")==true and (candidate.get("serial")!=field_frame.get("serial") or candidate.get("sp")!=field_frame.get("sp")):registry._error="field_native_clock_mismatch";return true
  field_frame=candidate
 if field_frame.get("ready")==true:
  if registry._clock_owner!=registry._field_owner:registry._serial=-1;registry._clock_owner=registry._field_owner
  registry.advance_source_frame(field_frame)
  return true
 return false
