extends SceneTree
## Current web provider runtime contract. Legacy concept geometry has separate field tests.
const USERDIR="EXODUSER-map11-11-Isolated-20261021"
const Runtime=preload("res://scripts/maps/map11/field_runtime.gd")
class GateFixture extends Node:
 var provider: Node2D
 var calls:=0
 func bind_provider(p: Node2D) -> bool:
  provider=p;return p.get_node("Markers/Boss") is Marker2D
 func enter(p: Node,_options: Dictionary) -> Dictionary:
  calls+=1;return {"status":"READY" if p==provider else "NOT_READY"}
 func leave(p: Node) -> bool:
  calls+=1;return p==provider
var checks:=0
var failures:=0
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;printerr("RUNTIME_FAIL ",label)
func run() -> void:
 if OS.get_user_data_dir().get_file()!=USERDIR:quit(2);return
 var p:=Runtime.new();root.add_child(p);await physics_frame
 check(p.runtime_ready(),"current runtime ready")
 check(p.describe().revision is String,"revision published")
 # game.html 30491-30599 source placement is 14 holes, not concept's four S holes.
 check(p.get_node("WebMarkers").get_child_count()==22,"4 field +14 holes +4 fieldboss markers")
 check(p.anchors("*").size()==22 and p.anchors("hole").size()==14,"field+arena anchor union22; holes14")
 for label in ["Entry","Boss","Exit","Return"]:check(p.get_node("Markers/"+label) is Marker2D,"persistent arena "+label)
 check(p.get_node("WebMarkers/Start").position==Vector2(4020,7420),"source south start")
 check(p.get_node("WebMarkers/Gate").position==Vector2(4020,220),"source north gate")
 check(p.region_sites().regions.size()==4,"source quadrant regions")
 var manifest: Dictionary=p.spawn_budget_manifest()
 var total:=0
 for h in p.anchors("hole"):
  var group: Dictionary={}
  for row in manifest.groups:
   if row.hole_id==h.id:group=row
  total+=int(group.total)
  check(group.total==(8 if h.size<=0.3 else 15),"source si0 ceil(ceil(base*.5)*.3) exact")
  var req: Dictionary={"hole_id":h.id,"spawn_group_id":group.spawn_group_id,"region_id":h.region_id,"revision":manifest.revision,"radius":15,"etype":0}
  var result: Dictionary=p.spawn_sites("hole",req)
  # Source placement validates tiles; prop ellipses may make a marker illegal.
  var legal: bool=p.can_move(h.marker.global_position,15)
  check(result.ready==legal,"spawn admission matches actual collision "+h.id)
  if legal:check(result.position==h.marker.global_position and p.region_at(result.position)==h.region_id,"exact marker and region")
  req.radius=10000;check(not p.spawn_sites("hole",req).ready,"oversized actor fails closed")
 check(total==168,"source planned denominator168")
 check(not p.can_move(Vector2(20,20),15),"source outside forest solid")
 check(not p.line_of_sight(Vector2(4020,7420),Vector2(20,20)),"LOS source tiles")
 check(p.sweep_fraction(Vector2(4020,7420),Vector2(20,20),15)<1,"sweep prevents tunneling")
 check(p.can_move(Runtime.ARENA_OFFSET,1600,"arena"),"rectangular arena clearance")
 check(p.can_move(Runtime.ARENA_OFFSET+Vector2(2000,0),15,"arena"),"web rectangle extends beyond old R1700")
 check(not p.can_move(Runtime.ARENA_OFFSET+Vector2(2460,0),15,"arena"),"rectangle positive boundary")
 check(not p.line_of_sight(Vector2(4020,7420),Runtime.ARENA_OFFSET),"disconnected spaces no LOS")
 # Actual physical arena wall remains supplied by runtime, field physics by World.
 var body:=CharacterBody2D.new();var shape:=CollisionShape2D.new();var circle:=CircleShape2D.new();circle.radius=15;shape.shape=circle;body.add_child(shape);root.add_child(body)
 body.position=Runtime.ARENA_OFFSET+Vector2(2400,0);await physics_frame
 check(body.move_and_collide(Vector2(100,0),true)!=null,"rectangle physical wall agrees")
 var sites: Dictionary=p.transition_sites()
 check(sites.field_gate==p.get_node("WebMarkers/Gate") and sites.arena_entry==p.get_node("Markers/Entry"),"current persistent transition markers")
 check(p.gate_contact(sites.field_gate.global_position,"enter"),"gate contact")
 check(p.gate_contact(sites.arena_exit.global_position,"leave"),"exit contact")
 check(not p.gate_contact(Vector2.ZERO,"enter"),"remote contact denied")
 var consumer:=GateFixture.new();root.add_child(consumer)
 check(p.bind_gate_consumer(consumer) and not p.bind_gate_consumer(consumer),"single callback owner")
 check(p.request_gate_enter(Vector2.ZERO,{}).status=="NOT_READY" and consumer.calls==0,"remote enter no writer")
 check(p.request_gate_enter(sites.field_gate.global_position,{}).status=="READY","delegated entry")
 check(p.request_gate_leave(sites.arena_exit.global_position) and consumer.calls==2,"delegated exit")
 var metrics: Dictionary={};check(p.legacy_boss_metrics(metrics) and metrics=={"mw":128,"mh":108,"T":40},"source extent unchanged")
 # North gate marker is INSIDE source gate object r100 at (4020,160).
 # Flow must refuse that blocked destination; use legal Start for positive route test.
 check(p.prepare_flow("map11.field.gate",15).is_empty(),"blocked source gate flow refused")
 var key: String=p.prepare_flow("map11.field.start",15)
 check(not key.is_empty() and p.prepare_flow("map11.field.start",15)==key,"legal flow prepared and cached")
 var point:=Vector2(4020,7260);var out: Dictionary={};var arrived:=false
 for i in range(200):
  if Vector2i(point/40)==Vector2i(100,185):arrived=true;break
  if not p.flow_query(key,point,out):break
  var next: Vector2=point.move_toward(out.waypoint,2)
  if p.sweep_fraction(point,next,15)!=1:break
  point=next
 check(arrived,"source 40px flow reaches target cell without wall tunneling")
 check(not p.flow_query(key,Vector2(20,20),out) and out.status=="INVALID_QUERY","solid origin rejected")
 check(not p.flow_query("missing",Vector2.ZERO,out) and out.status=="NOT_READY","unknown flow rejected")
 check(p.prepare_flow("missing",15).is_empty(),"unknown target refused")
 var gate: Marker2D=sites.field_gate;gate.position+=Vector2(1,0)
 check(not p.runtime_ready(),"marker drift stale");gate.position-=Vector2(1,0)
 p.position=Vector2(10,0)
 check(not p.runtime_ready() and not p.flow_query(key,point,out),"transform drift fail closed")
 p.position=Vector2.ZERO;p.retire()
 check(not p.runtime_ready() and not p.can_move(Vector2(4020,7420),15),"retirement fail closed")
 body.free();consumer.free();p.free()
 print("RUNTIME_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"visual_QA":false}))
 quit(1 if failures else 0)
