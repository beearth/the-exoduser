extends SceneTree
var failures:=0
var checks:=0
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("PARITY_FAIL ",label)
func run() -> void:
 check(OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-MAP-01-"),"isolated storage")
 if failures:quit(2);return
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in range(8):await physics_frame
 check(main.world.ready_for_player,"world startup "+main.world.get_native_startup_error())
 var p: Node=main.read_native_map11_provider()
 check(is_instance_valid(p),"provider")
 if not is_instance_valid(p):quit(1);return
 check(p.runtime_ready(),"runtime ready")
 check(main.world.get_start_position()==Vector2(4020,7420),"source spawn 31564-31566")
 check(main.camera.zoom==Vector2.ONE and main.camera.offset==Vector2.ZERO,"source camera 35736-35739")
 check(p.anchors("hole").size()==14,"source hole count")
 var totals: Array[int]=[0,0,0,0]
 for row in p.spawn_budget_manifest().groups:totals[row.region_id]+=row.total
 check(totals==[23,60,53,32],"source regional totals "+str(totals))
 var data: Dictionary=p.field.data
 for y in range(200):
  for x in range(200):
   if int(data.tiles[y*200+x])==1:
    check(not p.field.can_move(Vector2(x*40+20,y*40+20),0),"wall sample")
 var web_flow=preload("res://scripts/maps/map11/web_flow.gd").new();web_flow.configure(data);web_flow.prepare(Vector2(4020,7420))
 check(web_flow.direction(Vector2(4020,7380))==Vector2.DOWN,"source flow tie order toward start")
 check(web_flow.distance.size()==40000,"40px source grid")
 check(p.field.can_move(Vector2(4020,7420),15),"start can move")
 check(not p.field.can_move(Vector2(-1,7420),0),"world bound")
 var scene: Node=main.world.get_node("Map11ProductScene")
 check(scene.get_node_or_null("WorldClarity")==null,"concept clarity disconnected")
 check(scene.field_view._chunks.size()==64,"64 source chunks")
 check(scene.field_view._props.size()==36,"36 source hand props")
 var candidate_paths: Array=JSON.parse_string(FileAccess.get_file_as_string("res://tests/map11_33_candidates.json"))
 var loaded_concept: Array=[]
 for path in candidate_paths:
  if not ("target_frames" in path or "target30" in path or "target32" in path or "upscale01" in path or "finish33" in path or "tour_25d" in path):continue
  if ResourceLoader.has_cached("res://"+str(path)):loaded_concept.append(path)
 check(loaded_concept.is_empty(),"no concept texture cached "+str(loaded_concept))
 main.queue_free()
 for i in range(4):await process_frame
 print("PARITY_MAP_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"totals":totals}))
 quit(1 if failures else 0)
