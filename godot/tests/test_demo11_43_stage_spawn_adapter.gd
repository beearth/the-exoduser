extends SceneTree
const USERDIR = "EXODUSER-demo11-43-Isolated-20261021"
const Regions=preload("res://scripts/native_regions.gd")
var checks:=0
var failures:=0
var observations: Dictionary={}
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("DEMO1143_FAIL ",label)
class Provider extends Node2D:
 var revision="fixture-r1"
 var content_valid=true
 var runtime_ready=true
 var groups: Array=[]
 var rows: Array=[]
 var bad_site=false
 var query_count=0
 var context_id="fixture-new-map"
 func describe() -> Dictionary:
  return {"stage_id":"demo11-fixture","stage_index":0,"map_instance_id":context_id,"revision":revision,"content_valid":content_valid,"runtime_ready":runtime_ready}
 func anchors(_role: String) -> Array:return rows
 func region_sites() -> Dictionary:
  var sites: Array=[]
  for i in range(4):sites.append({"id":i,"fb_index":[2,3,0,1][i],"name_ko":"fixture-"+str(i),"name_en":"fixture-"+str(i)})
  return {"regions":sites,"gate_region_id":1}
 func spawn_budget_manifest() -> Dictionary:return {"revision":revision,"groups":groups}
 func region_at(point: Vector2) -> int:
  for a in rows:
   if is_instance_valid(a.marker) and point.distance_to(a.marker.global_position)<1:return a.region_id
  return 1
 func spawn_sites(kind: String,request: Dictionary) -> Dictionary:
  query_count+=1
  for a in rows:
   if a.id==request.hole_id:
    return {"ready":kind=="hole","revision":revision,"position":a.marker.global_position+Vector2(request.radius,0),"region_id":a.region_id,"site_id":"wrong" if bad_site else a.id}
  return {"ready":false}
func _initialize() -> void:call_deferred("run")
func run() -> void:
 check(OS.get_user_data_dir().ends_with(USERDIR),"actual isolated directory")
 var main=load("res://scenes/main.tscn").instantiate()
 root.add_child(main)
 await physics_frame
 var spawn=main.world.get_node("NativeSpawnHoleSystem")
 var regions=main.get_node("NativeRegions")
 var g: Dictionary=main.source_state.read_current_g()
 var provider=Provider.new()
 main.world.add_child(provider)
 for i in range(3):
  var marker=Marker2D.new();provider.add_child(marker)
  marker.position=Vector2(321+i*83,456+i*71) # New test authoring, never web coordinates.
  var size: float=0.3 if i==0 else 0.5
  var rid: int=[0,2,3][i]
  provider.rows.append({"id":"fixture-hole-"+str(i),"marker":marker,"region_id":rid,"room":-1,"size":size})
  provider.groups.append({"hole_id":"fixture-hole-"+str(i),"spawn_group_id":"fixture-group-"+str(i),"region_id":rid,"total":8 if i==0 else 15})
 var holes_before: Array=g.spawnHoles
 var regions_before: Array=g._regions
 var rng_before: int=spawn._metrics.rng_calls
 provider.runtime_ready=false
 check(not main.bind_native_spawn_stage_provider(provider).ready,"not ready rejected")
 check(is_same(g.spawnHoles,holes_before) and is_same(g._regions,regions_before),"rejection writes nothing")
 provider.runtime_ready=true;provider.groups[0].total=9
 check(not main.bind_native_spawn_stage_provider(provider).ready,"wrong planned total rejected")
 provider.groups[0].total=8
 var saved: Marker2D=provider.rows[0].marker
 provider.rows[0].marker=Vector2.ZERO
 check(not main.bind_native_spawn_stage_provider(provider).ready,"raw coordinates cannot replace Marker")
 provider.rows[0].marker=saved
 provider.rows.append(provider.rows[0])
 check(not main.bind_native_spawn_stage_provider(provider).ready,"duplicate stable ID rejected")
 provider.rows.pop_back()
 check(main.bind_native_spawn_stage_provider(provider).ready,"actual Main/P3 owner binding")
 var adapter: RefCounted=main.native_stage_spawn_adapter
 check(adapter.is_current(),"live context")
 check(g._regions.map(func(r):return r.total)==[8,0,15,15],"explicit region IDs not world quadrants")
 check(g._regGateIdx==1 and g._regions.map(func(r):return r.fbIdx)==[2,3,0,1],"provider gate and FB IDs")
 check(g._totalSpawned==38 and is_same(g.spawnHoles,spawn.holes),"single actual spawn total and array")
 check(spawn.holes[0].x==saved.global_position.x and spawn.holes[0].y==saved.global_position.y,"only Marker world positions used")
 check(not spawn.active and not spawn.is_physics_processing(),"etype registration deferred; legacy scheduler disabled")
 check(spawn._metrics.rng_calls==rng_before,"binding consumes no RNG")
 var holes_after: Array=g.spawnHoles
 spawn.advance_native(1.0)
 check(spawn._game_frame==0 and is_same(g.spawnHoles,holes_after),"legacy native tick cannot bypass deferred consumer")
 check(not spawn.install_placement().get("applied",false),"legacy placement cannot overwrite Marker budget")
 check(not regions.initialize_stage().ready,"legacy region init cannot reset provider progress")
 check(not main.bind_native_spawn_stage_provider(provider).ready,"second bind cannot reset kills or denominator")
 var progress: Dictionary=g.duplicate(true)
 progress.on=true;progress._fbDone=false;progress._fbSpawned=false
 progress._regions[0].kills=7
 Regions.tick_regions(progress,Vector2(-900,-800),15,2)
 check(not progress._regions[0].cleared,"unspawned FB still blocks provider region clear")
 check(progress._regCurIdx==2,"region entry uses supplied ID not T40 quadrants")
 progress._fbDone=true
 Regions.tick_regions(progress,Vector2(-900,-800),30,2)
 check(progress._regions[0].cleared and not progress._regions[2].cleared,"existing 80 percent policy reused")
 var request={"etype":3,"radius":17.0,"owner_sample":0.25}
 var sites: Dictionary=adapter.request_spawn("fixture-group-0",request)
 check(sites.ready and sites.position==saved.global_position+Vector2(17,0),"provider candidate provenance")
 check(not request.has("hole_id"),"caller request not mutated")
 check(not adapter.request_spawn("missing",request).ready,"missing group no origin fallback")
 check(not adapter.request_spawn("fixture-group-0",{"etype":3,"radius":-1}).ready,"invalid radius rejected")
 provider.bad_site=true
 check(not adapter.request_spawn("fixture-group-0",request).ready,"wrong site receipt rejected")
 provider.bad_site=false;provider.revision="fixture-r2"
 check(not adapter.request_spawn("fixture-group-0",request).ready,"revision invalidates handles")
 provider.revision="fixture-r1";provider.context_id="replaced-map"
 check(not adapter.is_current(),"map instance replacement rejected")
 provider.context_id="fixture-new-map"
 var actor: Node2D
 for e in main.world.get_enemies():
  if e.get("alive")==true and e.get("hp")!=null:actor=e;break
 check(is_instance_valid(actor),"actual existing World actor fixture")
 if is_instance_valid(actor):
  check(adapter.register_actor_origin(actor,"fixture-group-0").ready,"origin can bind only to already registered actor")
  check(not adapter.register_actor_origin(actor,"fixture-group-2").ready,"origin immutable")
  check(not regions.record_actor_kill(actor).applied,"living actor rejected")
  actor.global_position=Vector2(-900,-800) # Death location no longer determines region.
  actor.hp=0;actor.alive=false
  check(regions.record_actor_kill(actor).applied,"existing region death hook routes to origin")
  check(g._regions[0].kills==1 and g._regions[1].kills==0,"home region ID survives actor movement")
  check(not regions.record_actor_kill(actor).applied and g._regions[0].kills==1,"duplicate death cannot count twice")
 var outsider=Node2D.new()
 check(not adapter.register_actor_origin(outsider,"fixture-group-0").ready,"unregistered actor rejected")
 outsider.free()
 # Exactly one fixed-N wall-clock benchmark of the adapter's spawn-site tick.
 # Fixture provider; no actor factory, map rendering or 120fps game claim.
 if failures==0:
  var samples: Array[int]=[]
  var start: int=Time.get_ticks_usec()
  for n in range(10000):
   var tick_start: int=Time.get_ticks_usec()
   for i in range(3):
    var result: Dictionary=adapter.request_spawn("fixture-group-"+str(i),request)
    if not result.ready:failures+=1
   samples.append(Time.get_ticks_usec()-tick_start)
  var elapsed: int=Time.get_ticks_usec()-start
  samples.sort()
  observations.benchmark={"ticks":10000,"site_queries_per_tick":3,"elapsed_us":elapsed,"mean_us":float(elapsed)/10000,"p95_us":samples[9499],"p99_us":samples[9899],"max_us":samples[-1],"budget_us":1000000.0/120,"scope":"adapter candidate tick fixture, not full game"}
  check(samples[9899]<1000000.0/120,"adapter p99 within 120fps frame budget")
 check(g._regions.map(func(r):return r.total)==[8,0,15,15] and g._totalSpawned==38,"requests and kills never change planned denominator")
 check(spawn._metrics.rng_calls==rng_before,"requests own no private/shared RNG draw")
 observations.adapter=adapter.snapshot()
 provider.remove_child(saved);saved.free()
 check(not adapter.request_spawn("fixture-group-0",request).ready,"freed Marker rejected")
 # Stop real scene audio before freeing; no user storage API is invoked.
 stop_audio(main)
 main.free()
 await process_frame
 await create_timer(0.15).timeout
 print("DEMO1143_RESULT "+JSON.stringify({"assertions":checks,"failures":failures,"observations":observations,"fixture_not_actual_etype_registration":true}))
 quit(1 if failures else 0)
func stop_audio(node: Node) -> void:
 if node is AudioStreamPlayer or node is AudioStreamPlayer2D:node.stop()
 for child in node.get_children():stop_audio(child)
