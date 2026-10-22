extends RefCounted
## DEMO11-43 consumer ABI v1. MAP11 plan b085407d §7 (API shapes are proposals).
## No coordinates, RNG, actor factory, private clock or damage writer owned here.
const Holes = preload("res://scripts/native_spawn_hole_system.gd")
var _provider: Node2D
var _spawn: Node2D
var _regions: Node
var _world: Node2D
var _context: Dictionary = {}
var _groups: Dictionary = {}
var _origins: Dictionary = {}
var _bound := false
var _requests := 0

static func _number(v: Variant) -> bool:
 return (v is int or v is float) and is_finite(float(v))
static func _id(v: Variant) -> bool:
 return v is String and not v.is_empty()
func _no(reason: String) -> Dictionary:
 return {"ready":false,"reason":reason}
func configure(provider: Node2D, spawn: Node2D, regions: Node) -> Dictionary:
 if _bound:return _no("already_bound")
 if not is_instance_valid(provider) or not provider.is_inside_tree() or not is_instance_valid(spawn) or not is_instance_valid(regions):return _no("missing_live_owners")
 # Reflection checks once at binding, never in request/kill/tick paths.
 for method in ["describe","anchors","region_sites","spawn_budget_manifest","spawn_sites","region_at"]:
  if not provider.has_method(method):return _no("missing_provider_"+method)
 if spawn.get_script()!=Holes or not spawn._configured or not regions.has_method("install_stage_spawn_budget"):return _no("actual_P3_owners_required")
 var world: Node2D=spawn.world
 if provider!=world and not world.is_ancestor_of(provider):return _no("provider_outside_actual_world")
 var d: Variant=provider.describe()
 if not d is Dictionary or d.get("content_valid")!=true or d.get("runtime_ready")!=true or not _id(d.get("stage_id")) or not _id(d.get("map_instance_id")) or not _id(d.get("revision")):return _no("provider_not_ready")
 if d.get("stage_index")!=0:return _no("stage0_only")
 var anchors: Variant=provider.anchors("hole")
 var manifest: Variant=provider.spawn_budget_manifest()
 var sites: Variant=provider.region_sites()
 if not anchors is Array or not manifest is Dictionary or not sites is Dictionary or manifest.get("revision")!=d.revision or not manifest.get("groups") is Array:return _no("invalid_manifest")
 if not sites.get("regions") is Array or sites.regions.size()!=4 or not sites.get("gate_region_id") is int or sites.gate_region_id not in range(4):return _no("invalid_region_sites")
 var ids: Dictionary={}
 var fb_ids: Dictionary={}
 for r in sites.regions:
  if not r is Dictionary or not r.get("id") is int or r.id not in range(4) or ids.has(r.id) or not r.get("fb_index") is int or r.fb_index not in range(4) or fb_ids.has(r.fb_index):return _no("invalid_region_ids")
  for label in ["name_ko","name_en"]:
   if not _id(r.get(label)):return _no("missing_region_label")
  ids[r.id]=true;fb_ids[r.fb_index]=true
 var by_id: Dictionary={}
 for a in anchors:
  if not a is Dictionary or not _id(a.get("id")) or by_id.has(a.id) or not a.get("marker") is Marker2D:return _no("invalid_hole_marker")
  var marker: Marker2D=a.marker
  if not is_instance_valid(marker) or not provider.is_ancestor_of(marker) or not marker.is_inside_tree() or not marker.global_position.is_finite():return _no("stale_hole_marker")
  if not a.get("region_id") is int or not ids.has(a.region_id) or provider.region_at(marker.global_position)!=a.region_id:return _no("hole_region_mismatch")
  if not _number(a.get("size")) or a.size<=0 or not a.get("room") is int:return _no("invalid_hole_shape")
  by_id[a.id]=a
 var groups: Dictionary={}
 var holes: Array=[]
 var totals: Array=[0,0,0,0]
 var used: Dictionary={}
 for b in manifest.groups:
  if not b is Dictionary or not _id(b.get("spawn_group_id")) or groups.has(b.spawn_group_id) or not _id(b.get("hole_id")) or not by_id.has(b.hole_id) or used.has(b.hole_id):return _no("invalid_budget_group")
  var a: Dictionary=by_id[b.hole_id]
  # G31030 / G60709–60710: reuse the same planned hole count, never actual actor count.
  var total: int=Holes.spawn_hole_count(float(a.size),0)
  if not b.get("total") is int or b.total!=total or b.get("region_id")!=a.region_id:return _no("budget_policy_mismatch")
  var row: Dictionary={"hole_id":a.id,"spawn_group_id":b.spawn_group_id,"region_id":a.region_id,"total":total,"marker":a.marker}
  groups[b.spawn_group_id]=row;used[a.id]=true;totals[a.region_id]+=total
  var point: Vector2=a.marker.global_position
  holes.append({"x":point.x,"y":point.y,"size":a.size,"room":a.room,"timer":null,"alive":0,"site_id":a.id,"spawn_group_id":b.spawn_group_id,"region_id":a.region_id})
 if used.size()!=by_id.size():return _no("unbudgeted_hole")
 if not regions.can_bind_stage_spawn(spawn):return _no("region_owner_not_current")
 # Both owners preflight before the first write. No retries/rollback of a committed prefix.
 var receipt: Dictionary=spawn.install_stage_marker_holes(holes)
 if not receipt.get("applied",false):return _no("spawn_writer_rejected:"+str(receipt.get("reason")))
 _provider=provider;_spawn=spawn;_regions=regions;_world=world
 _context={"stage_id":d.stage_id,"map_instance_id":d.map_instance_id,"revision":d.revision}
 _groups=groups;_bound=true
 var region_receipt: Dictionary=regions.install_stage_spawn_budget(self,sites,totals)
 if region_receipt.get("applied")!=true:return {"ready":false,"reason":"region_writer_rejected","spawn_prefix_committed":true}
 return {"ready":true,"groups":groups.size(),"total":totals.reduce(func(a,b):return a+b,0),"actor_registration":"DEFERRED","scheduler":"HOLD_etype_consumer"}
func is_current() -> bool:
 if not _bound or not is_instance_valid(_provider) or not _provider.is_inside_tree() or not is_instance_valid(_world) or not is_instance_valid(_spawn) or not is_instance_valid(_regions):return false
 if _provider!=_world and not _world.is_ancestor_of(_provider):return false
 var d: Variant=_provider.describe()
 return d is Dictionary and d.get("content_valid")==true and d.get("runtime_ready")==true and d.get("stage_index")==0 and d.get("stage_id")==_context.stage_id and d.get("map_instance_id")==_context.map_instance_id and d.get("revision")==_context.revision and _regions.can_use_stage_spawn(self,_spawn)
func region_at(point: Vector2) -> int:
 if not point.is_finite() or not is_current():return -1
 var result: Variant=_provider.region_at(point)
 return int(result) if result is int and result in range(4) else -1
func request_spawn(group_id: String, request: Dictionary) -> Dictionary:
 if not is_current():return _no("stale_stage_context")
 if not _groups.has(group_id):return _no("unknown_spawn_group")
 var group: Dictionary=_groups[group_id]
 var marker: Variant=group.marker
 if not is_instance_valid(marker) or not marker.is_inside_tree() or not _provider.is_ancestor_of(marker) or _provider.region_at(marker.global_position)!=group.region_id:return _no("stale_marker")
 if not request.get("etype") is int or not _number(request.get("radius")) or request.radius<=0:return _no("invalid_owner_request")
 var query: Dictionary=request.duplicate(true)
 query.merge({"hole_id":group.hole_id,"spawn_group_id":group_id,"region_id":group.region_id,"revision":_context.revision},true)
 _requests+=1
 var result: Variant=_provider.spawn_sites("hole",query)
 if not is_current():return _no("stage_changed_during_query")
 if not result is Dictionary or result.get("ready")!=true:return _no("spawn_sites_not_ready")
 if result.get("revision")!=_context.revision or result.get("site_id")!=group.hole_id or result.get("region_id")!=group.region_id or not result.get("position") is Vector2 or not result.position.is_finite():return _no("invalid_spawn_site_receipt")
 # Positions come only from the provider. The provider owns geometry/radius legality;
 # etype selection/RNG/constructor/ens registration remain with the future owner.
 return {"ready":true,"position":result.position,"site_id":group.hole_id,"spawn_group_id":group_id,"region_id":group.region_id,"revision":_context.revision}
func register_actor_origin(actor: Node2D, group_id: String) -> Dictionary:
 if not is_current() or not _groups.has(group_id):return _no("stale_or_unknown_origin")
 if not is_instance_valid(actor) or actor.get_parent()!=_world or not _world.get_enemies().has(actor) or actor.get("alive")!=true:return _no("actor_not_live_registered")
 var data: Variant=actor.get("data")
 if not data is Dictionary or not data.get("native_final",{}) is Dictionary:return _no("missing_native_actor_identity")
 var key: int=actor.get_instance_id()
 if _origins.has(key):return _no("origin_already_bound")
 _origins[key]={"actor":weakref(actor),"group":group_id,"region_id":_groups[group_id].region_id,"counted":false}
 return {"ready":true}
func record_actor_kill(actor: Node2D) -> Dictionary:
 if not is_current() or not is_instance_valid(actor):return {"applied":false,"reason":"stage_context_not_current"}
 var key: int=actor.get_instance_id()
 if not _origins.has(key):return _record_unoriginated_kill(actor)
 var row: Dictionary=_origins[key]
 if row.actor.get_ref()!=actor or row.counted or actor.get_parent()!=_world or not _world.get_enemies().has(actor) or actor.get("alive")!=false or not _number(actor.get("hp")) or actor.get("hp")>0:return {"applied":false,"reason":"not_first_registered_death"}
 var data: Variant=actor.get("data")
 if not data is Dictionary:return {"applied":false,"reason":"invalid_native_actor"}
 var native: Variant=data.get("native_final",{})
 if not native is Dictionary or native.get("ib",false):return {"applied":false,"reason":"boss_or_invalid_actor"}
 # G60725–60732 home attribution: origin region ID survives movement, no x/T40.
 var result: Dictionary=_regions.record_stage_origin_kill(self,int(row.region_id))
 if result.get("applied")==true:row.counted=true
 return result
# INTEG-15b Mac 인수: 소환굴 origin이 없는 비보스 actor
# (커튼 5링 63425~63432 mkEn 등)도 원본 _regKill(60730~60733; dee094fd snapshot)은 스폰 위치(_homeX/_homeY=mkEn 인자
# x,y 31210, 없으면 현재 x,y)로 지역 kills++ 한다. 위치→지역은 provider.region_at만 쓴다. 1회만 센다.
var _unoriginated_counted: Dictionary = {}
func _record_unoriginated_kill(actor: Node2D) -> Dictionary:
 var key: int=actor.get_instance_id()
 if _unoriginated_counted.has(key) or actor.get_parent()!=_world or not _world.get_enemies().has(actor) or actor.get("alive")!=false or not _number(actor.get("hp")) or actor.get("hp")>0:return {"applied":false,"reason":"not_first_unoriginated_death"}
 var data: Variant=actor.get("data")
 if not data is Dictionary or not data.get("native_final",{}) is Dictionary or data.native_final.get("ib",false):return {"applied":false,"reason":"boss_or_invalid_actor"}
 var home: Vector2=actor.global_position
 var native: Dictionary=data.native_final
 var requested: Variant=data.get("requested_spawn_position")
 if _number(native.get("_homeX")) and _number(native.get("_homeY")):home=Vector2(float(native._homeX),float(native._homeY))
 elif requested is Array and requested.size()==2 and _number(requested[0]) and _number(requested[1]):home=Vector2(float(requested[0]),float(requested[1]))
 var region_id: Variant=_provider.region_at(home)
 if not region_id is int or region_id not in range(4):return {"applied":false,"reason":"unoriginated_home_outside_regions"}
 var result: Dictionary=_regions.record_stage_origin_kill(self,region_id)
 if result.get("applied")==true:_unoriginated_counted[key]=true
 return result
func snapshot() -> Dictionary:
 return {"bound":_bound,"context":_context.duplicate(),"groups":_groups.size(),"origins":_origins.size(),"site_requests":_requests,"actual_etype_registration":false,"dynamic_budget_changes":"HOLD_owner_receipts"}

# C15 only: retain the parent's Marker origin and source offset/safePt. No budget growth.
func request_split_child(parent: Node2D, requested: Vector2) -> Dictionary:
 if not is_current() or not is_instance_valid(parent) or parent.etype!=15 or not _origins.has(parent.get_instance_id()):return _no("split_parent_origin_not_current")
 var origin: Dictionary=_origins[parent.get_instance_id()]
 if origin.actor.get_ref()!=parent or parent.get_parent()!=_world:return _no("split_parent_identity_lost")
 var group: Dictionary=_groups[origin.group]
 if not is_instance_valid(group.marker) or not group.marker.is_inside_tree():return _no("split_marker_lost")
 var point: Vector2=requested
 if not _world.can_move(point,10.0):
  var safe: Variant=_world.native_safe_point(point.x,point.y,10.0)
  if not safe is Dictionary:return {"ready":false,"mken_null":true,"reason":"source_mkEn_null"}
  point=Vector2(safe.x,safe.y)
 return {"ready":true,"position":point,"spawn_group_id":origin.group,"region_id":origin.region_id,"revision":_context.revision,"split_parent":parent}
