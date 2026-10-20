extends SceneTree
const USERDIR="EXODUSER-map11-11-Isolated-20261021"
const Runtime=preload("res://scripts/maps/map11/field_runtime.gd")
const Holes=preload("res://scripts/native_spawn_hole_system.gd")
class GateFixture extends Node:
 var provider: Node2D
 var calls: int=0
 func bind_provider(p: Node2D) -> bool:
  provider=p; return p.get_node("Markers/Boss") is Marker2D
 func enter(p: Node, _options: Dictionary) -> Dictionary:
  calls+=1; return {"status":"READY" if p==provider else "NOT_READY"}
 func leave(p: Node) -> bool:
  calls+=1; return p==provider
var checks: int=0
var failures: int=0
func _initialize() -> void: call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok: failures+=1; printerr("RUNTIME_FAIL ",label)
func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR or not OS.get_user_data_dir().contains(USERDIR): quit(2); return
 print("ISOLATION ",OS.get_user_data_dir())
 var p=Runtime.new(); root.add_child(p); await physics_frame
 check(p.runtime_ready(),"runtime ready")
 check(p.describe().revision is String,"consumer revision string")
 check(p.get_node("FieldMarkers").get_child_count()==14,"all original field anchors")
 for label in ["Entry","Boss","Exit","Return"]: check(p.get_node("Markers/"+label) is Marker2D,"gate marker "+label)
 check(p.anchors("*").size()==22,"field and arena anchor union")
 check(p.region_sites().regions.size()==4,"four regions")
 var manifest: Dictionary=p.spawn_budget_manifest()
 var total: int=0
 for h in p.anchors("hole"):
  var group: Dictionary={}
  for g in manifest.groups:
   if g.hole_id==h.id: group=g
  check(group.total==Holes.spawn_hole_count(h.size,0),"source planned count")
  total+=group.total
  var req: Dictionary={"hole_id":h.id,"spawn_group_id":group.spawn_group_id,"region_id":h.region_id,"revision":manifest.revision,"radius":15,"etype":0}
  var result: Dictionary=p.spawn_sites("hole",req)
  check(result.get("ready")==true and p.region_at(result.position)==h.region_id,"spawn legal region")
  req.radius=10000
  check(not p.spawn_sites("hole",req).ready,"oversized actor rejected")
 check(total==32,"four S holes planned denominator 32")
 check(not p.can_move(Vector2(-1800,-550),15),"static mass")
 check(not p.line_of_sight(Vector2(-2800,-550),Vector2(-800,-550)),"LOS blocked")
 check(p.sweep_fraction(Vector2(-2800,-550),Vector2(-800,-550),15)<1,"sweep blocks tunneling")
 var motion:=CharacterBody2D.new(); var shape:=CollisionShape2D.new(); var circle:=CircleShape2D.new(); circle.radius=15; shape.shape=circle; motion.add_child(shape); root.add_child(motion); motion.position=Vector2(-2800,-550)
 await physics_frame
 check(motion.move_and_collide(Vector2(2000,0),true)!=null,"physics collider agrees")
 motion.position=Vector2(-700,3900)
 check(motion.move_and_collide(Vector2(0,400),true)!=null,"field outer collider")
 motion.position=Runtime.ARENA_OFFSET+Vector2(1600,0)
 check(motion.move_and_collide(Vector2(200,0),true)!=null,"arena outer collider")
 check(p.can_move(Runtime.ARENA_OFFSET,1600,"arena"),"arena approved R1700")
 check(not p.line_of_sight(Vector2.ZERO,Runtime.ARENA_OFFSET),"no LOS through disconnected gate")
 var transition: Dictionary=p.transition_sites()
 check(transition.arena_entry==p.get_node("Markers/Entry") and transition.field_gate==p.get_node("FieldMarkers/Gate"),"field-arena contract")
 check(p.gate_contact(transition.field_gate.global_position,"enter"),"entry contact")
 check(p.gate_contact(transition.arena_exit.global_position,"leave"),"exit contact")
 check(not p.gate_contact(Vector2.ZERO,"enter"),"no remote enter")
 var consumer=GateFixture.new(); root.add_child(consumer)
 check(p.bind_gate_consumer(consumer),"gate callback bind fixture")
 check(p.request_gate_enter(Vector2.ZERO,{}).status=="NOT_READY" and consumer.calls==0,"remote entry no writer")
 check(p.request_gate_enter(transition.field_gate.global_position,{}).status=="READY","delegated entry")
 check(p.request_gate_leave(transition.arena_exit.global_position) and consumer.calls==2,"delegated exit")
 var metrics: Dictionary={}; check(p.legacy_boss_metrics(metrics) and metrics=={"mw":128,"mh":108,"T":40},"source boss extent preserved")
 var setup: int=Time.get_ticks_usec()
 var key: String=p.prepare_flow("map11.field.gate",15)
 print("FLOW_PREPARE_US ",Time.get_ticks_usec()-setup)
 check(not key.is_empty(),"flow cache prepared")
 check(p.prepare_flow("map11.field.gate",15)==key,"cache reuse")
 var out: Dictionary={}; var point:=Vector2(-2600,1350); var arrived: bool=false
 check(p.sweep_fraction(point,transition.field_gate.global_position,15)<1,"flow detour actually required")
 for i in range(6000):
  if not p.flow_query(key,point,out): break
  if point.distance_to(transition.field_gate.global_position)<3: arrived=true; break
  var next: Vector2=point.move_toward(out.waypoint,10)
  if p.sweep_fraction(point,next,15)!=1: break
  point=next
 check(arrived,"flow traverses field to gate without wall tunneling")
 check(not p.flow_query(key,Vector2(-1800,-550),out) and out.status=="INVALID_QUERY","blocked flow origin")
 check(not p.flow_query("missing",Vector2.ZERO,out) and out.status=="NOT_READY","unprepared flow")
 check(p.prepare_flow("missing",15).is_empty(),"unknown target")
 # Benchmark once: prepared query+LOS+sweep, no wall-clock render FPS claim.
 var start: int=Time.get_ticks_usec(); var n: int=2000
 for i in range(n):
  p.flow_query(key,Vector2(-2600,1350),out)
  p.line_of_sight(Vector2(0,1300),Vector2(0,3700))
  p.sweep_fraction(Vector2(0,3700),Vector2(0,3690),15)
 var elapsed: int=Time.get_ticks_usec()-start
 print("QUERY_BENCH ",JSON.stringify({"iterations":n,"elapsed_us":elapsed,"us_per_bundle":float(elapsed)/n,"budget_frame_us":8333.333,"nodes":p._flows[key].node_count()}))
 var gate_marker: Marker2D=p.get_node("FieldMarkers/Gate")
 gate_marker.position+=Vector2(1,0)
 check(not p.runtime_ready(),"marker mutation stale")
 gate_marker.position-=Vector2(1,0)
 p.position=Vector2(10,0)
 check(not p.runtime_ready() and not p.flow_query(key,Vector2.ZERO,out),"transform drift stale")
 p.position=Vector2.ZERO; p.retire()
 check(not p.runtime_ready() and not p.can_move(Vector2.ZERO,15),"retired fail closed")
 motion.free(); consumer.free(); p.free()
 print("RUNTIME_RESULT ",JSON.stringify({"checks":checks,"failures":failures}))
 quit(0 if failures==0 else 1)
