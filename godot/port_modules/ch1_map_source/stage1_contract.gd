extends RefCounted
## CH1-03 source-only contract. No World/Main, IO, RNG state or runtime ownership.
## Native game.html17972-17987/18172-18177/30042-30085/30218-30694.
const SCHEMA := "exoduser.ch1-area-source.v1"
const GAME_SHA := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const TILE_SHA := "c7994170661e29348e27bdad098020edcb761a11943e68bdea60f9d744236dc1"
const MASK_SHA := "c540f7be7e05019d9ada9d0d08a1dea55d4f2e7e73f5d023c476f7f676cf7adf"
const GEOMETRY_FILE := "assets/map/ch1/geometry/ch1_si1_geometry.js"
const HANDS := [
 ["m_c1tree",83,80,"LANDMARK","tree"],["m_c1camp",49,122,"LANDMARK","central"],
 ["m_c1altar",151,91,"LANDMARK","tree"],["m_c1pool",49,151,"LANDMARK","toxic"],
 ["m_c1cocoon",151,136,"LANDMARK","cocoon"],["m_c1sroot",91,180,"GAMEPLAY","start"],
 ["m_c1sbone",85,162,"GAMEPLAY","south"],["m_c1spod",138,158,"GAMEPLAY","south"],
 ["m_c1sroot",129,128,"GAMEPLAY","cocoon"],["m_c1sbone",79,109,"GAMEPLAY","central"],
 ["m_c1spod",128,83,"GAMEPLAY","tree"],["m_c1sbone",116,43,"GAMEPLAY","north"]]
const HOLES := [
 [3380,6740,0.5,1,100],[5460,6060,0.3,1,50],[1780,6060,0.5,1,100],
 [5820,5700,0.3,1,50],[2780,3820,0.5,1,100],[4580,2580,0.5,1,100],
 [2380,2780,0.3,1,50],[4860,3860,0.5,1,100],[3780,6220,0.3,1,50],
 [3380,3420,0.55,1,100],[4820,1900,0.8,1,100],[4020,5540,0.3,-1,50],[4020,4140,0.3,-1,50]]

static func number(v: Variant) -> bool:
 return (v is int or v is float) and is_finite(float(v))
static func integer(v: Variant) -> bool:
 return number(v) and float(v)==floor(float(v))
static func numbers(v: Variant, expected: Array) -> bool:
 if not v is Array or v.size()!=expected.size():return false
 for i in expected.size():
  if not number(v[i]) or float(v[i])!=float(expected[i]):return false
 return true
static func literal(v: Variant, expected: Variant) -> bool:
 if expected is String:return v is String and v==expected
 if expected is bool:return v is bool and v==expected
 if number(expected):return number(v) and float(v)==float(expected)
 return false
static func point(v: Variant) -> bool:
 return v is Array and v.size()==2 and integer(v[0]) and integer(v[1]) and v[0]>=0 and v[0]<200 and v[1]>=0 and v[1]<200
static func hex(v: Variant, size: int) -> bool:
 if not v is String or v.length()!=size:return false
 for c in v:
  if not c in "0123456789abcdef":return false
 return true
static func digest(bytes: PackedByteArray) -> String:
 var hash:=HashingContext.new()
 hash.start(HashingContext.HASH_SHA256)
 hash.update(bytes)
 return hash.finish().hex_encode()
static func fail(raw: Variant, reason: String) -> Dictionary:
 return {"status":"NOT_READY","reason":reason,"raw":raw,"scope":"source_snapshot_only"}
static func read_area(raw: Variant) -> Dictionary:
 return validate_area(raw)
static func validate_area(raw: Variant) -> Dictionary:
 var reason:=error(raw)
 if not reason.is_empty():return fail(raw,reason)
 return {"status":"READY","value":raw,"scope":"source_snapshot_only","runtime_bound":false,
  "visual_verified":false,"source_only_stage":1,"full_stage_ready":false,
  "provenance_validation":"declared pins/record formats; no source file reads"}

static func error(raw: Variant) -> String:
 if not raw is Dictionary:return "snapshot_not_dictionary"
 if not literal(raw.get("schema"),SCHEMA) or not integer(raw.get("stage")) or raw.stage!=1:return "unsupported_schema_or_stage"
 var grid: Variant=raw.get("grid")
 if not grid is Dictionary or not numbers([grid.get("width"),grid.get("height"),grid.get("tile_size")],[200,200,40]):return "grid_missing_or_invalid"
 var source: Variant=raw.get("source")
 if not source is Dictionary or not literal(source.get("game_sha256"),GAME_SHA) or not hex(source.get("main_sha"),40) \
   or not hex(source.get("extraction_head"),40) or not literal(source.get("selection"),"default empty URL → _getFixedMapForStage(1) → _cloneField11(1) → genFromTemplate"):return "source_provenance_missing"
 var files: Variant=source.get("files")
 var symbols: Variant=source.get("symbols")
 if not files is Dictionary or not symbols is Dictionary:return "source_records_missing"
 for file in ["game.html","maps_data.js","assets/map/ch1/production_finish/layout.js",GEOMETRY_FILE]:
  if not hex(files.get(file),64):return "source_file_hash_missing"
 if files["game.html"]!=GAME_SHA:return "source_game_pin_mismatch"
 for name in ["_CH1S1","_MAP_COMPOSE.1","_OBJ_META","_CH_DECO.0","_cloneField11","_getFixedMapForStage","genFromTemplate","initStage.start_position","_spawnHoleCount","_regionInit"]:
  var symbol: Variant=symbols.get(name)
  if not symbol is Dictionary or not literal(symbol.get("file"),"game.html") or not hex(symbol.get("sha256"),64) \
    or not integer(symbol.get("line")) or not integer(symbol.get("end")) or symbol.line<1 or symbol.end<symbol.line:return "source_symbol_missing"
 if not numbers(raw.get("start_tile"),[100,185]) or not numbers(raw.get("start_world"),[4020,7420]) \
   or not numbers(raw.get("exit_center_tile"),[100,33]):return "start_or_exit_center_mismatch"
 for key in ["boss_gate","exits"]:
  var entries: Variant=raw.get(key)
  if not entries is Array or entries.size()!=3:return "gate_or_exit_missing"
  for i in 3:
   if not entries[i] is Dictionary or not numbers([entries[i].get("x"),entries[i].get("y")],[99+i,31 if key=="boss_gate" else 33]):return "gate_or_exit_mismatch"
 var rooms: Variant=raw.get("rooms")
 if not rooms is Array or rooms.size()!=6:return "rooms_missing"
 var centers: Array=[[100,185],[100,155],[100,120],[80,85],[120,50],[100,18]]
 for i in rooms.size():
  if not rooms[i] is Dictionary or not numbers([rooms[i].get("cx"),rooms[i].get("cy")],centers[i]):return "room_center_mismatch"
 var hands: Variant=raw.get("hand_props_raw")
 if not hands is Array or hands.size()!=12:return "hand_props_missing"
 for i in 12:
  var h: Variant=hands[i]
  if not h is Dictionary or h.size()!=5 or not literal(h.get("id"),HANDS[i][0]) or not numbers([h.get("x"),h.get("y")],[HANDS[i][1],HANDS[i][2]]) \
    or not literal(h.get("role"),HANDS[i][3]) or not literal(h.get("region"),HANDS[i][4]):return "ordered_raw_hand_mismatch"
 var meta: Variant=raw.get("initial_obj_meta")
 var deco: Variant=raw.get("ch1_deco_raw")
 if not meta is Dictionary or meta.size()!=77 or not deco is Array or deco.size()!=110:return "raw_catalog_missing"
 for key in meta:
  if not key is String or not meta[key] is Dictionary:return "initial_meta_invalid"
 for d in deco:
  if not d is Dictionary or not d.get("id") is String or not d.get("file") is String:return "deco_invalid"
 var chapters: Variant=raw.get("chapter_stages")
 if not chapters is Array or chapters.size()!=7:return "chapter_stages_missing"
 for i in 7:
  if not chapters[i] is Dictionary or not integer(chapters[i].get("stages")) or chapters[i].stages!=[4,6,4,7,5,6,3][i]:return "chapter_stages_mismatch"
 var holes: Variant=raw.get("spawn_holes_final")
 if not holes is Array or holes.size()!=13 or not integer(raw.get("total_spawned")) or raw.total_spawned!=1000 \
   or not numbers(raw.get("region_totals"),[250,300,250,200]):return "hole_totals_mismatch"
 var generation: Variant=raw.get("generation")
 if not generation is Dictionary or not integer(generation.get("seed")) or generation.seed<0 or generation.seed>4294967295 \
   or not integer(generation.get("random_draws")) or generation.random_draws!=14 \
   or not literal(generation.get("random_algorithm"),"LCG uint32: imul(1664525)+1013904223; /4294967296") \
   or not literal(generation.get("timer_basis"),"seeded source VM observation only; not browser boot RNG"):return "seed_evidence_missing"
 # Mathematical replay of the supplied seed; no global/local RNG is advanced.
 var state:=int(generation.seed)
 var timers: Array=[]
 for i in 14:
  state=(state*1664525+1013904223)&0xffffffff
  timers.append(600.0+float(state)/4294967296.0*60.0)
 if not integer(generation.get("random_final_state")) or generation.random_final_state!=state:return "seed_final_state_mismatch"
 var totals: Array=[0,0,0,0]
 for i in 13:
  var h: Variant=holes[i]
  if not h is Dictionary or not numbers([h.get("x"),h.get("y"),h.get("size"),h.get("room"),h.get("count")],HOLES[i]) \
    or not number(h.get("timer")):return "ordered_source_hole_mismatch"
  var slot: int=i if i<8 else i+1 # source candidate #8 is removed AFTER its timer draw.
  if absf(float(h.timer)-timers[slot])>0.00000001:return "source_timer_mismatch"
  var quadrant: int=(0 if h.y<4000 else 2)+(0 if h.x<4000 else 1)
  totals[quadrant]+=int(h.count)
 if not numbers(raw.region_totals,totals):return "region_sum_mismatch"
 var geometry: Variant=raw.get("source_geometry")
 if not geometry is Dictionary or not integer(geometry.get("stage")) or geometry.stage!=1 or not numbers(geometry.get("size"),[200,200]):return "geometry_missing"
 var regions: Variant=geometry.get("regions")
 if not regions is Array or regions.size()!=7:return "geometry_regions_missing"
 for i in 7:
  if not regions[i] is Dictionary or not literal(regions[i].get("id"),["start","south","toxic","cocoon","central","tree","north"][i]) \
    or not regions[i].get("label") is String or not numbers(regions[i].get("center"),[[100,185],[115,158],[49,151],[151,136],[86,110],[98,80],[110,38]][i]):return "geometry_region_mismatch"
 var mask: Variant=geometry.get("mask")
 var rle: Variant=geometry.get("editor_tile_rle")
 if not mask is Array or mask.size()!=40000 or not rle is Array or rle.size()!=930 or not hex(geometry.get("editor_tile_rle_sha256"),64):return "geometry_source_grids_missing"
 var mask_bytes:=PackedByteArray()
 mask_bytes.resize(40000)
 for i in 40000:
  if not integer(mask[i]) or not int(mask[i]) in [0,1]:return "geometry_mask_invalid"
  mask_bytes[i]=int(mask[i])
 if not literal(geometry.get("mask_sha256"),MASK_SHA) or digest(mask_bytes)!=MASK_SHA:return "geometry_mask_hash_mismatch"
 var offset:=0
 for i in range(0,rle.size(),2):
  if not integer(rle[i]) or not int(rle[i]) in [1,2] or not integer(rle[i+1]) or rle[i+1]<=0 or offset+rle[i+1]>40000:return "editor_rle_invalid"
  for j in int(rle[i+1]):
   if int(mask[offset+j])!=(1 if rle[i]==1 else 0):return "editor_rle_mask_mismatch"
  offset+=int(rle[i+1])
 if offset!=40000:return "editor_rle_coverage_mismatch"
 for field in ["landmarks","bypassPaths","routeAnchors","treeBypasses"]:
  if not geometry.get(field) is Dictionary:return "geometry_metadata_missing"
 if not geometry.get("spine") is Array or geometry.spine.size()!=15 or not geometry.get("widthSamples") is Array \
   or geometry.widthSamples.size()!=5 or not literal(geometry.get("treeBlockRadius"),9):return "geometry_metadata_missing"
 var landmark_values: Dictionary={"start":[100,185],"toxic":[49,151],"cocoon":[151,136],"camp":[49,122],"altar":[151,91],"tree":[83,80],"gate":[100,33],"bossCenter":[100,18]}
 if geometry.landmarks.size()!=8:return "geometry_landmarks_invalid"
 for key in landmark_values:
  if not numbers(geometry.landmarks.get(key),landmark_values[key]):return "geometry_landmarks_invalid"
 for p in geometry.spine:
  if not point(p):return "geometry_spine_invalid"
 for sample in geometry.widthSamples:
  if not sample is Dictionary or not sample.get("id") is String:return "geometry_width_samples_invalid"
  for key in ["x","y","min","max"]:
   if not number(sample.get(key)):return "geometry_width_samples_invalid"
  if sample.min<=0 or sample.max<sample.min:return "geometry_width_samples_invalid"
 for side in ["left","right"]:
  var bypass: Variant=geometry.bypassPaths.get(side)
  var stats: Variant=geometry.treeBypasses.get(side)
  if not bypass is Array or bypass.size()!=(6 if side=="left" else 5):return "geometry_bypass_invalid"
  for p in bypass:
   if not point(p):return "geometry_bypass_invalid"
  if not stats is Dictionary or not number(stats.get("width")) or not number(stats.get("length")) or stats.width<=0 or stats.length<=0:return "geometry_bypass_stats_invalid"
 if geometry.routeAnchors.size()!=4:return "geometry_route_anchors_invalid"
 for key in ["south","central","treeSouth","treeNorth"]:
  if not point(geometry.routeAnchors.get(key)):return "geometry_route_anchors_invalid"
 var tiles: Variant=raw.get("tiles")
 if not tiles is Array or tiles.size()!=40000:return "runtime_tiles_incomplete"
 var bytes:=PackedByteArray()
 bytes.resize(40000)
 var counts: Array=[0,0,0,0,0]
 for i in 40000:
  if not integer(tiles[i]) or tiles[i]<0 or tiles[i]>4:return "runtime_tile_invalid"
  bytes[i]=int(tiles[i]);counts[int(tiles[i])]+=1
 if counts!=[13588,25590,3,0,819] or not literal(raw.get("runtime_tile_sha256"),TILE_SHA) or digest(bytes)!=TILE_SHA:return "runtime_tile_hash_or_counts_mismatch"
 var scope: Variant=raw.get("scope")
 if not scope is Dictionary or not literal(scope.get("runtime_bound"),false) or not literal(scope.get("visual_verified"),false) \
   or not literal(scope.get("save_access"),0) or not number(scope.get("save_access")) or not literal(scope.get("init_map_objects_executed"),false):return "source_scope_mismatch"
 for field in ["final_map_objects","effective_prop_positions","prop_colliders"]:
  if not literal(scope.get(field),"NOT_OBSERVED"):return "unsupported_runtime_claim"
 var undefined_paths: Variant=raw.get("undefined_paths")
 if not undefined_paths is Array or not undefined_paths.is_empty():return "undefined_carrier_unsupported"
 var environment: Variant=raw.get("environment_refs")
 if not environment is Array or environment.size()!=10:return "environment_refs_missing"
 for entry in environment:
  if not entry is Dictionary or not entry.get("src") is String or not entry.get("file") is String or not integer(entry.get("line")) \
    or not hex(entry.get("sha256"),64) or not literal(files.get(entry.file),entry.sha256):return "environment_ref_invalid"
 return ""
