extends RefCounted
## CH1-05 pure stage2 snapshot composition. No RNG, IO, nodes or gameplay-owner binding.
const C = preload("res://port_modules/ch1_map_source/stage1_contract.gd")
const GAME_SHA = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const TILE_SHA = "5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e"
const OBJECT_SHA = "6a65accc4f2a42fa2bd55ed7844a61f497b360ca16dc69f453a4e832a9be4278"
const COMPOSE = {"lm":[{"id":"m_penta_circle","x":0.72,"y":0.38,"sz":400},{"id":"m_eye_tree","x":0.74,"y":0.42,"sz":380},{"id":"m_flesh_ball","x":0.5,"y":0.62,"sz":520}],"mega":[{"id":"m_mega_head","x":0.28,"y":0.35,"sz":980}],"lgMul":1,"lgDist":720,"scMul":1,"largeBias":["m_ctree","m_flesh","m_penta","m_eye_tree"],"uni":["m_flesh_ball","m_penta_circle","m_flesh_maw","m_eye_tree","m_skull_altar"],"empty":[{"x":0.5,"y":0.88,"r":420},{"x":0.5,"y":0.14,"r":380},{"x":0.5,"y":0.48,"r":700}],"groves":[{"x":0.28,"y":0.35,"r":900},{"x":0.72,"y":0.38,"r":900},{"x":0.5,"y":0.62,"r":800}]}
const RETIRED = ["tombstone","m_tomb","m_root","m_c5tomb","m_c7tomb","weapon_pile","m_wpile","m_c5wpile","m_rotten_tree","m_vine_pillar","m_c7vine","rotten_tree","vine_pillar","m_rtree","m_vpillar","m_moss","m_ash","m_mud","m_crack","acid_pool","poison_puddle","flesh_pile","meat_stake","m_acid","m_puddle","m_flesh","m_meat","m_c6flesh","m_c6meat","spider_web","m_web","m_c2web","m_c2seamWeb","m_leaf"]
const HOLES = [[3300,7260,0.5,1,100],[5500,6500,0.3,1,50],[1620,5100,0.5,1,100],[6020,5300,0.3,1,50],[2860,3900,0.5,1,100],[5140,3700,0.5,1,100],[1740,2340,0.3,1,50],[6180,2180,0.5,1,100],[3780,6220,0.3,1,50],[3060,3420,0.55,1,100],[4820,1900,0.8,1,100],[4020,5540,0.3,-1,50],[4020,4140,0.3,-1,50]]
const PHASES = {"large":37,"landmark":3,"mega":1,"unique":5,"provided_floor":16,"scatter":89,"normal":140,"editor":1}
const PHASE_ORDER = ["large","landmark","mega","unique","provided_floor","scatter","normal","editor"]

# JSON decodes numeric tokens as float. Compare native numeric values recursively,
# retaining strict booleans/strings/keys and rejecting all value changes.
static func same(actual: Variant,expected: Variant) -> bool:
 if expected is Dictionary:
  if not actual is Dictionary or actual.size()!=expected.size():return false
  for key in expected:
   if not actual.has(key) or not same(actual[key],expected[key]):return false
  return true
 if expected is Array:
  if not actual is Array or actual.size()!=expected.size():return false
  for i in expected.size():
   if not same(actual[i],expected[i]):return false
  return true
 if expected==null:return actual==null
 return C.literal(actual,expected)

static func valid_carrier(value: Variant) -> bool:
 if not value is String or value.length()!=64:return false
 for character in value:
  if not character in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/":return false
 return Marshalls.base64_to_raw(value).size()==48

static func is_retired(id: String) -> bool:
 return id in RETIRED

static func fail(reason: String) -> Dictionary:
 return {"status":"NOT_READY","reason":reason,"scope":"stage2_observed_composition","full_stage_ready":false}

static func validate(raw: Variant, bundle: Variant) -> String:
 if not raw is Dictionary or not bundle is Dictionary:return "dictionary_required"
 if not C.literal(raw.get("schema"),"exoduser.ch1-area-source.v1") or not C.literal(raw.get("stage"),2):return "source_stage_schema"
 if not same(raw.get("grid"),{"width":200,"height":200,"tile_size":40}):return "source_grid"
 if not raw.get("source") is Dictionary or not C.literal(raw.source.get("game_sha256"),GAME_SHA):return "source_pin"
 if not C.literal(raw.get("runtime_tile_sha256"),TILE_SHA):return "tile_pin"
 if not raw.get("tiles") is Array or raw.tiles.size()!=40000:return "tiles_missing"
 var bytes:=PackedByteArray()
 var counts: Array=[0,0,0,0,0]
 for v in raw.tiles:
  if not C.integer(v) or v<0 or v>4:return "tile_invalid"
  bytes.append(int(v))
  counts[int(v)]+=1
 if counts!=[38986,36,3,0,975] or C.digest(bytes)!=TILE_SHA:return "tile_hash_counts"
 if not C.numbers(raw.get("start_world"),[4020,7420]) or not C.numbers(raw.get("start_tile"),[100,185]):return "start"
 if not same(raw.get("boss_gate"),[{"x":99,"y":5},{"x":100,"y":5},{"x":101,"y":5}]) or not same(raw.get("exits"),[{"x":99,"y":7},{"x":100,"y":7},{"x":101,"y":7}]):return "gate_exit"
 if not same(raw.get("template_tile_rle"),[1,40000]) or not same(raw.get("composition_raw"),COMPOSE):return "source_composition"
 if raw.get("hand_props_raw")!=null or raw.get("undefined_paths")!=["/hand_props_raw"]:return "absent_hand_carrier"
 if not raw.get("source_state") is Dictionary or not C.literal(raw.source_state.get("is_tile_rle"),true):return "RLE_source_state"
 if not same(raw.source_state.get("initial_map_objects"),[{"type":"boss_gate_col","x":4020,"y":160}]):return "generator_object_input"
 if not C.literal(raw.get("total_spawned"),1000) or not C.numbers(raw.get("region_totals"),[250,300,250,200]):return "P3_denominator"
 if not raw.get("spawn_holes_final") is Array or raw.spawn_holes_final.size()!=13:return "holes_missing"
 for i in 13:
  var h: Variant=raw.spawn_holes_final[i]
  if not h is Dictionary:return "hole_type"
  if not C.numbers([h.get("x"),h.get("y"),h.get("size"),h.get("room"),h.get("count")],HOLES[i]):return "hole_order_values"
 if not C.literal(bundle.get("schema"),"exoduser.ch1-area-resources.v1") or not C.literal(bundle.get("stage"),2):return "resource_stage_schema"
 if not bundle.get("source") is Dictionary or not C.literal(bundle.source.get("game_sha256"),GAME_SHA) or not C.literal(bundle.source.get("source_snapshot_tile_sha256"),TILE_SHA):return "resource_source_pin"
 if not same(bundle.get("composition_raw"),COMPOSE) or not same(bundle.get("retired_types"),RETIRED):return "compose_retired_set"
 if not C.literal(bundle.get("object_sha256"),OBJECT_SHA) or not bundle.get("object_payload") is String:return "object_pin"
 if C.digest(bundle.object_payload.to_utf8_buffer())!=OBJECT_SHA:return "object_payload_hash"
 var decoded: Variant=JSON.parse_string(bundle.object_payload)
 if not decoded is Array or decoded.size()!=292 or decoded!=bundle.get("raw_objects"):return "raw_object_order"
 if not bundle.get("props") is Array or bundle.props.size()!=292:return "prop_count"
 for i in 292:
  var p: Variant=bundle.props[i]
  if not p is Dictionary or not C.literal(p.get("source_index"),i) or p.get("type")!=decoded[i].get("type"):return "prop_source_index"
  if p.get("x")!=decoded[i].get("x") or p.get("y")!=decoded[i].get("y"):return "prop_source_anchor"
  if not C.literal(p.get("retired"),is_retired(p.type)):return "retired_flag"
 if not same(bundle.get("phase_counts"),PHASES) or not bundle.get("phase_pushes") is Array or bundle.phase_pushes.size()!=292:return "phase_counts"
 var index:=0
 for phase in PHASE_ORDER:
  for i in int(PHASES[phase]):
   var entry: Variant=bundle.phase_pushes[index]
   if not entry is Dictionary or not C.literal(entry.get("phase"),phase) or not entry.get("object") is Dictionary:return "source_phase_order"
   index+=1
 if not bundle.get("assets") is Array or bundle.assets.size()!=51:return "asset_count"
 if not bundle.get("colliders") is Array or bundle.colliders.size()!=47:return "collider_count"
 for collider in bundle.colliders:
  if not collider is Dictionary or is_retired(str(collider.get("id"))) or not valid_carrier(collider.get("f64")):return "collider_carrier"
 if not same(bundle.get("wall_rects"),[[90,13,3,3],[110,13,3,3],[90,23,3,3],[110,23,3,3]]):return "wall_union"
 if not bundle.get("floor") is Dictionary or not bundle.floor.get("alpha") is Array or bundle.floor.alpha.size()!=40000:return "floor_mask"
 if C.digest(PackedByteArray(bundle.floor.alpha))!=bundle.floor.get("alpha_sha256"):return "floor_mask_hash"
 if not bundle.get("scope") is Dictionary:return "scope"
 for field in ["main_bound","real_player_bound","spawn_holes_bound","region_progress_bound","transition_bound","physical_prop_shapes","stage0_hill"]:
  if not C.literal(bundle.scope.get(field),false):return "unsupported_owner_claim"
 return ""

static func assemble(raw: Variant, bundle: Variant) -> Dictionary:
 var error:=validate(raw,bundle)
 if not error.is_empty():return fail(error)
 # Passes preserve source insertion order. Only final publication applies the source layer/y stable sort.
 var passes: Array=[]
 var ordered: Array=[]
 var ordinal:=0
 var metadata: Dictionary={}
 for p in bundle.props:
  metadata[p.type]=p.get("metadata",{})
 for phase in PHASE_ORDER:
  var pass_objects: Array=[]
  for i in int(PHASES[phase]):
   var object: Dictionary=bundle.phase_pushes[ordinal].object
   pass_objects.append(object)
   var layer: Variant=metadata.get(object.type,{}).get("_renderLayer")
   ordered.append({"object":object,"ordinal":ordinal,"layer":0 if layer==null else layer})
   ordinal+=1
  passes.append({"id":phase,"objects":pass_objects})
 ordered.sort_custom(func(a: Dictionary,b: Dictionary)->bool:
  if a.layer!=b.layer:return a.layer<b.layer
  if a.object.y!=b.object.y:return a.object.y<b.object.y
  return a.ordinal<b.ordinal)
 var objects: Array=[]
 for entry in ordered:objects.append(entry.object)
 if objects!=bundle.raw_objects:return fail("final_publication_order")
 return {"status":"READY","passes":passes,"objects":objects,"props":bundle.props,"raw":raw,"bundle":bundle,
  "scope":"stage2_observed_composition","live_random_placement":false,"main_bound":false,"full_stage_ready":false}
