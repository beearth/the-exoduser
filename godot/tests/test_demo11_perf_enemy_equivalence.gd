extends SceneTree
const USERDIR="EXODUSER-demo11-perf-enemy-Isolated-20261021"
const WORLD=preload("res://scripts/world.gd")
const OLD=preload("res://tests/fixtures/demo11_perf_collision_reference.gd")
const OLD_SEPARATION=preload("res://tests/fixtures/demo11_perf_separation_reference.gd")
var checks:=0
var failures:=0
class Registry extends Node2D:
 var rows: Array=[]
 func get_enemies() -> Array:return rows
class Peer extends Node2D:
 var alive=true
 var radius=20.0
class Candidate extends "res://scripts/enemy_melee_flesh_crawler.gd":
 var recorded:=Vector2.ZERO
 func _move_native(push: Vector2,_ticks: float) -> void:recorded=push
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("ENEMY_EQ_FAIL ",label)
func run() -> void:
 check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
 var before:=OLD.new();var after:=WORLD.new()
 var data: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/map.json"))
 before.map_data=data;after.map_data=data
 var rng:=RandomNumberGenerator.new();rng.seed=20261021
 for i in 3000:
  var point:=Vector2(rng.randf_range(-10,8010),rng.randf_range(-10,8010));var rad:=rng.randf_range(0,80)
  check(before.is_world_blocked(point)==after.is_world_blocked(point),"point_"+str(i))
  check(before.can_move(point,rad)==after.can_move(point,rad),"four_ordered_corners_"+str(i))
 for prop in data.prop_colliders:
  var center:=Vector2(prop.position[0],prop.position[1]);var r:=Vector2(prop.radii[0],prop.radii[1])
  for scale in [.999999,1.0,1.000001]:
   for d in [Vector2.LEFT,Vector2.RIGHT,Vector2.UP,Vector2.DOWN]:
    var point: Vector2=center+r*d*scale
    check(before.is_world_blocked(point)==after.is_world_blocked(point),"ellipse_edge")
 # Query data stays live: no stale immutable-cache assumption after in-place edits.
 data.prop_colliders.append({"position":[101.25,201.75],"radii":[13.5,17.25]})
 for point in [Vector2(101.25,201.75),Vector2(115,201.75),Vector2(-.1,20),Vector2(8000,20)]:check(before.can_move(point,0)==after.can_move(point,0),"live_data_edit_and_bounds")
 var registry:=Registry.new();var old:=OLD_SEPARATION.new();var candidate:=Candidate.new()
 old.world=registry;candidate.world=registry;old.radius=20;candidate.radius=20
 # Same ordered list, includes self, dead actor, coincident centres and tiny distances.
 var peers: Array=[]
 for i in 60:
  var peer:=Peer.new();peer.position=Vector2(rng.randf_range(-100,100),rng.randf_range(-100,100));peer.radius=rng.randf_range(1,40);peer.alive=i%7!=0;peers.append(peer)
 for i in 120:
  var at:=Vector2(rng.randf_range(-30,30),rng.randf_range(-30,30));old.position=at;candidate.position=at
  old._separation_ticks=0;candidate._separation_ticks=0
  registry.rows=[old]+peers;old._apply_separation(.5)
  registry.rows=[candidate]+peers;candidate._apply_separation(.5)
  check(old.recorded==candidate.recorded and old._separation_ticks==candidate._separation_ticks,"exact_separation_vector_order_"+str(i))
  old._apply_separation(.5);candidate._apply_separation(.5)
  check(old._separation_ticks==candidate._separation_ticks,"separation_cooldown_"+str(i))
 for peer in peers:peer.free()
 registry.free();old.free();candidate.free();before.free();after.free()
 print("ENEMY_EQ_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"skip":0,"seed":20261021,"oracle":"exact baseline c09196b5 function bodies; replay snapshots additionally compare before/after"}))
 quit(1 if failures else 0)
