extends SceneTree
var failures:=0
var checks:=0
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("PARITY_FAIL ",label)
func run() -> void:
 check(OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-parity-capture-Isolated-"),"isolated storage")
 if failures:quit(2);return
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in range(8):await physics_frame
 check(main.world.ready_for_player,"world startup "+main.world.get_native_startup_error())
 var p: Node=main.read_native_map11_provider()
 check(is_instance_valid(p),"provider")
 if not is_instance_valid(p):quit(1);return
 check(p.runtime_ready(),"runtime ready")
 check(main.world.get_start_position()==Vector2(4020,7420),"source spawn 31566-31568")
 check(main.camera.zoom==Vector2.ONE and main.camera.offset==Vector2.ZERO,"source camera 35738-35741")
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
 # MAP03: compare all directions against the verbatim browser Worker, including tie/diagonal rules.
 for point in [Vector2(4020,7420),Vector2(4020,7380),Vector2(4100,3250),Vector2(4020,1020)]:
  web_flow.prepare(point)
  var expected:=FileAccess.get_file_as_bytes("res://tests/parity_map03/flow_%d_%d.f32"%[point.x,point.y]).to_float32_array()
  check(expected.size()==80000,"web Worker oracle complete")
  for cell in range(40000):
   var actual: Vector2=web_flow.direction(Vector2((cell%200)*40+20,(cell/200)*40+20))
   check(actual.distance_to(Vector2(expected[cell*2],expected[cell*2+1]))<.000001,"original Worker direction %d"%cell)

 check(p.field.can_move(Vector2(4020,7420),15),"start can move")
 check(not p.field.can_move(Vector2(4020,180),15),"source system gate circle blocks north path")
 check(p.field.can_move(Vector2(4020,300),15),"source gate approach remains open")
 check(not p.field.can_move(Vector2(-1,7420),0),"world bound")
 var scene: Node=main.world.get_node("Map11ProductScene")
 check(scene.get_node_or_null("WorldClarity")==null,"concept clarity disconnected")
 check(scene.field_view._chunks.size()==64,"64 source chunks")
 check(scene.field_view._props.size()==36,"36 source hand props")
 var pool: Node=scene.field_view._chunk_pool
 check(pool.textures.size()==75,"fixed 25 triplet GPU slots")
 check(pool.resident_bytes<=100000000,"chunk VRAM cap")
 for point in [Vector2(4020,7420),Vector2(5220,3220),Vector2(5620,5220),Vector2(4020,1020),Vector2(4100,3250)]:
  pool.advance(point,Vector2(1920,1080),true)
  for cell in range(64):
   check((pool.ground[cell].texture!=null)==(pool.wanted[cell]==1),"only visible + ring resident")
   check(not ResourceLoader.has_cached(str(data.chunks[cell].texture)),"original fallback not loaded")
 check(is_instance_valid(main.native_natural_enemies),"actual natural provider installed")
 var holes: Node=main.world.get_node("NativeSpawnHoleSystem")
 check(holes.holes.size()==14,"actual hole consumer count")
 for point in [Vector2(5220,3220),Vector2(5620,5220),Vector2(4020,1020)]:
  var found: bool=false
  for h in holes.holes:
   if Vector2(h.x,h.y)==point:found=true
  check(found,"reported source hole anchor "+str(point))
 for chunk in scene.field_view._chunks:
  check(chunk.region_rect.size==Vector2(1334,1334),"1440p source-sized core")
  check((chunk.region_rect.size*chunk.scale).is_equal_approx(Vector2(1000,1000)),"unchanged chunk world extent")
 var candidate_paths: Array=JSON.parse_string(FileAccess.get_file_as_string("res://tests/map11_33_candidates.json"))
 var loaded_concept: Array=[]
 for path in candidate_paths:
  if not ("target_frames" in path or "target30" in path or "target32" in path or "upscale01" in path or "finish33" in path or "tour_25d" in path):continue
  if ResourceLoader.has_cached("res://"+str(path)):loaded_concept.append(path)
 check(loaded_concept.is_empty(),"no concept texture cached "+str(loaded_concept))
 var details: Node=scene.field_view._details
 check(details.faces.size()==61,"source mass-face count")
 var oracle: Array=details.data.transformOracle
 for sample in oracle:
  var matched: bool=false
  for rig in details.rigs:
   if rig.id!=sample.type:continue
   matched=true
   details.render_at(float(sample.now),Rect2(0,0,8000,8000))
   var indices: Array=[]
   if sample.type=="m_c1tree":indices=[[0,0],[1,1],[2,2],[3,3],[4,4],[5,5],[6,6]]
   elif sample.type=="m_c1camp":indices=[[0,0],[1,1],[2,2],[3,3],[4,4]]
   elif sample.type=="m_c1gtoxicf":indices=[[0,0],[1,1],[2,2]]
   else:indices=[[0,0]]
   for pair in indices:
    var op: Dictionary=sample.ops[pair[0]]
    var node: Node=rig.body.get_child(pair[1])
    if not (node is Sprite2D):node=node.get_child(0)
    var sprite: Sprite2D=node
    var a: Array=op.args
    var offset: int=4 if a.size()==8 else 0
    var destination:=Vector2(a[offset],a[offset+1])
    var extent:=Vector2(a[offset+2],a[offset+3])
    var m: Array=op.matrix
    var transform:=Transform2D(Vector2(m[0],m[1]),Vector2(m[2],m[3]),Vector2(m[4],m[5]))
    check((sprite.global_transform*Vector2.ZERO).distance_to(transform*destination)<.25,"browser draw origin "+sample.type+str(sample.now)+str(pair))
    check((sprite.global_transform*sprite.texture.get_size()).distance_to(transform*(destination+extent))<.25,"browser draw extent "+sample.type+str(sample.now)+str(pair))
  check(matched,"source effect rig "+sample.type)
 var lighting: Node=main.get_node("NativeScreenLighting")
 lighting._process(0.0)
 check(lighting._half_view.size==Vector2i(960,540),"source C/2 actual render target")
 check(lighting._static_lights.size()==12,"original two prop and ten moat lights")
 check(is_instance_valid(lighting._iris_color),"original iris color stamp consumer")
 check(lighting._fog_gl.get_index()>lighting._filter_rect.get_index(),"DOM fog after canvas CSS")
 main.queue_free()
 for i in range(4):await process_frame
 print("PARITY_MAP_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"totals":totals}))
 quit(1 if failures else 0)
