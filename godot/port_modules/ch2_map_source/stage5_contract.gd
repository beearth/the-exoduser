extends RefCounted
## CH2-03 si5 source only: pure validation, no IO/Node/RNG/runtime owner.
## Shared CH2 catalog/asset/room pins belong to the admitted stage4 contract.
const CH1 = preload("res://port_modules/ch1_map_source/stage1_contract.gd")
const Shared = preload("res://port_modules/ch2_map_source/stage4_contract.gd")
const SCHEMA := "exoduser.ch2-area-source.v1"
const GAME_SHA := Shared.GAME_SHA
const TILE_SHA := "5b40eb67c1aa3fd6ad407f9af06db91f549456bcd9c7d91ed31265c5a3a3b87e"
const SYMBOLS = {"T":{"file":"game.html","line":16631,"end":16631,"sha256":"d59eced1ded07f84c145592f65bdf854358e009c5cd705f5215bf18697fed103"},"TOTAL_STAGES":{"file":"game.html","line":16642,"end":16642,"sha256":"9f14025af0065b30e47e23ebb3b491d39ae8ed17d33739e5ff3827ffb3634953"},"CHAPTER_STAGES":{"file":"game.html","line":16633,"end":16641,"sha256":"8891e0b3139efbef7cb81a34dfafb58254179954707350c96311ffd5636c98e9"},"_stageTestReq":{"file":"game.html","line":3466,"end":3466,"sha256":"0b55c61df00c2a3f7c68747c45e7b6fe0514b10fe1cfd0ddf3590e57fe46e43a"},"_mapTestReq":{"file":"game.html","line":3465,"end":3465,"sha256":"6c615771192f87fb8fbbd34255a0388ddd44126181f357f9b255c9e76a1bd094"},"_classicMap":{"file":"game.html","line":3469,"end":3469,"sha256":"92a52bca28b1d1cb9c2ffb6e6f87eafcac6bf935d79409bba9e23c2072893e03"},"_MAP_QA_MODE":{"file":"game.html","line":3470,"end":3470,"sha256":"e2e645be5329a59465c35d93132af75631ced957d63ce876364d0009287ff930"},"_DIABLO_FIELD_QA":{"file":"game.html","line":3471,"end":3471,"sha256":"3b2c28e599d5b5c534ed077e169e5c4bcce2b1e69379c172ed1cf85e8aa8573a"},"_fdgProjectiveTextureGate":{"file":"game.html","line":4746,"end":4746,"sha256":"a207b178ae66a58acbb8bd1c686c9da980f1fe83749e822125174f2534461ce4"},"_FDG_RUINED_FOREST_FIRST":{"file":"game.html","line":4747,"end":4747,"sha256":"2a10bc3fdd393a66716408327768925323952e8a548e689d9b31a623e1464da7"},"MAP_ALL_FLOOR":{"file":"game.html","line":30217,"end":30217,"sha256":"fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa"},"SPAWN_HOLE":{"file":"game.html","line":31029,"end":31029,"sha256":"1ccea0b8a0bc7045e1d71a8752d0aaf2c0a828b2d20852b6755df39f8c6713d5"},"_REG_DIRS_KO":{"file":"game.html","line":60688,"end":60688,"sha256":"6e34c82a5a9490c2696ff15a8bdee556d18b674d1b651c0c8f318b6958641afb"},"_REG_DIRS_EN":{"file":"game.html","line":60689,"end":60689,"sha256":"6c95142a75fb88a0f13633e67fdf73901d5d59f991ffbb5a75f43fbb8d793b60"},"_REG_CH1_KO":{"file":"game.html","line":60690,"end":60690,"sha256":"41e6acf7ec0ddd97c1b14c9282c63fbf1716cc667458e7f5a62c8b236ccd0302"},"_REG_CH1_EN":{"file":"game.html","line":60691,"end":60691,"sha256":"29575dc13e05eff25267a402011faeadf7fbb99097dcc287dcd250fe3dbaede7"},"_REG_FB_TO_REG":{"file":"game.html","line":60694,"end":60694,"sha256":"1b928d7b68dcb31d8fc4e1f464e3657806dd31847e900e102fe7820a9b085d80"},"stage_index_arrays":{"file":"game.html","line":16658,"end":16667,"sha256":"bb68183648fa4310b6f053af521031960f2a9e963129b54355c1b6389d6e3216"},"stage_face_dungeon":{"file":"game.html","line":16668,"end":16675,"sha256":"71b677315ffb6c330d76f8857b8158281d01e6cb2839d0463fb15cb82fe3bce6"},"_MAP_COMPOSE.absent.5":{"file":"game.html","line":18118,"end":18207,"sha256":"c391ea0ee33da474a4a999eca7be281897bf7f7ae633290998c76a4bbb92c186"},"_OBJ_META":{"file":"game.html","line":18392,"end":18426,"sha256":"82449e9c92065c0ab08bc61b6ced27b9764cc0cc5f07be89dd7a61efe1da15fc"},"_CH_DECO.1":{"file":"game.html","line":17638,"end":17692,"sha256":"48887f3fd60d3ada86410167155f0c8698a408d5c969e36c192b758a4361c36e"},"_wantPlateTest":{"file":"game.html","line":3475,"end":3475,"sha256":"6252bdd9a47b29ffee3f2e10d429768edf169bea3dbc439a68ec3b3d1b6f676e"},"_isFaceMap":{"file":"game.html","line":16675,"end":16675,"sha256":"0d737b2e7ddcf23e21830c5cb1b3494fcf2b2e42c8c460207d5db9748c054376"},"_isDungeonMap":{"file":"game.html","line":16676,"end":16676,"sha256":"b77a5b53d9be68a53308a638f0bac0f25571b9c1bcb5a58709c1fbc4d79eb6f5"},"mkRng":{"file":"game.html","line":29556,"end":29559,"sha256":"c74098c60d18aa9b633a637592e212270d63d4e9b9e43df81e635a6b9168d065"},"_rleEncodeGrid":{"file":"game.html","line":29928,"end":29932,"sha256":"40f329fbac442ca0b38fad42f469bfe165340f754ba6aa92095ff87be0cdb952"},"_buildCh1StartForestRLE":{"file":"game.html","line":29971,"end":29986,"sha256":"28caed8b821d9e5c30047823b039e42cc88ae25f445072f0550a0f53d16225db"},"_paintPathDisk":{"file":"game.html","line":29987,"end":29992,"sha256":"b579f89df7e2dbaeea93bcf52f9916d087d4a24a4ea080db4988f0bd988d168f"},"_paintPathSeg":{"file":"game.html","line":29993,"end":29996,"sha256":"04d0626aca8adc7a779e72e8315ac8e1e033df27c6be5071c28a3ceb5c7cb9bc"},"_buildWalkPathRLE":{"file":"game.html","line":29997,"end":30007,"sha256":"d05c76ade7dc09e6f2d1e790b72af882a9710de92533d8a32facd28f30810fbd"},"_buildBasinRLE":{"file":"game.html","line":30008,"end":30020,"sha256":"2d570c8f4064f3ff4f1d6766ee0f8ff824fe8236adaec35c0ddfdbe2deaeb78c"},"_buildColRectRLE":{"file":"game.html","line":30035,"end":30041,"sha256":"3f28ea34a381b8b88eaac917f477fea8027aaed5be97b9f5e20f1685df42ead4"},"_cloneField11":{"file":"game.html","line":30042,"end":30085,"sha256":"d26f2f4b43ee281e13d176ed5651670498d46ecb09bb5e2d7fd7c55cc4b8e616"},"_getFixedMapForStage":{"file":"game.html","line":30135,"end":30147,"sha256":"a63c3cb93b59e0751729610dc163855606bb41a6bc1839d5ecd85feb5400c690"},"_tCarveCircle":{"file":"game.html","line":29037,"end":29044,"sha256":"aec27b9c4e506c8be80ce8411ad52fae1795f6ae399b36492b5eefa071bd3374"},"_tCarveEllipse":{"file":"game.html","line":29045,"end":29051,"sha256":"5b68cdcb042ca9258f6005516341da9aac0d0ecd36b66d63849c5b68ccb98b8a"},"_tCarveRect":{"file":"game.html","line":29052,"end":29057,"sha256":"0b60ed9400e29fe28b34bce5d1aad8222a283119e51ec76cf032f60eaa25e76f"},"_tCarveCross":{"file":"game.html","line":29058,"end":29070,"sha256":"f47dc8ca89744dc13d9e7f9756d7c3bb0374d0a7b93e938e8becdb885ca7cd69"},"_tCarveCorridor":{"file":"game.html","line":29071,"end":29117,"sha256":"603da06fecc0a91ed74fea7cd5f8e7f628833f06bc0b7493f68d1506dc6c1bef"},"_tCaveSmooth":{"file":"game.html","line":29118,"end":29129,"sha256":"6197aaae8348389a2655542843de6fee6fc7a84f381b789e439093b5bf948f8f"},"_tBossDistMap":{"file":"game.html","line":29138,"end":29146,"sha256":"6c7ae9d33a94fff9403eb0ce0ca2c13f1e927ac54e3336d65f78f2e0ed714e7b"},"_tseed":{"file":"game.html","line":26473,"end":26473,"sha256":"cbec39520ab3e318228a166eb1869cbe2bccd5667cb376e56f65fe9c3f9e1815"},"_applyCh1StartNorthGate":{"file":"game.html","line":30021,"end":30027,"sha256":"9bae0a90422beeef9ecaae99893ae82b589bd12a42e5cf9696667e87f91e0a18"},"_applyHellWinterNorthGate":{"file":"game.html","line":30028,"end":30034,"sha256":"7612112d63902e0ce43efc0d5b153090bf0a8a7f287c0d713974fe0049659cc9"},"_spawnHoleCount":{"file":"game.html","line":31030,"end":31030,"sha256":"2df8140e22cd52fd550b5bd8d879d310e227d364d8c30791261b58a6cf7a6a1f"},"_cacheExitCenter":{"file":"game.html","line":19793,"end":19793,"sha256":"5dba8f4c496c5840254479d292d4652b84121ae5a115555838b2a18951d89ef1"},"genFromTemplate":{"file":"game.html","line":30218,"end":30694,"sha256":"a71d895cc30de270f2146ea2aa44b8da520d65eafac19c043b4c12094647957d"},"_regionFbAlive":{"file":"game.html","line":60719,"end":60724,"sha256":"f93e40789d4cae0deb80c2ce9ec669b0117a8da6d7c2eec7cfc26b08bf4752ee"},"_regionIdxAt":{"file":"game.html","line":60696,"end":60696,"sha256":"5d193c43981afa0497a6de111d0fa54eddba47929025b8cbed4371f8fb37a336"},"_regionInit":{"file":"game.html","line":60697,"end":60718,"sha256":"94ffd97b032d3dfe35a8ab306f75b7323bc2f5e391c684475c0ab037b8097e9f"},"initStage.start_position":{"file":"game.html","line":31564,"end":31566,"sha256":"71f7a032cd6f272110488e0adf7fd47b52f5b799a2a7d8be0ee116090c64ea7a"},"EL":{"file":"game.html","line":14333,"end":14333,"sha256":"60bb41cacfe8407ccf122df5a789413edfcd2d418140d00412e2db051cf385aa"},"HELL_THEMES":{"file":"game.html","line":16679,"end":16687,"sha256":"61f2ac554fc4fc6fc52af79a760885fb5bc7b85e7fc0593fcd210c4cb715ef20"},"HELL_BOSSES":{"file":"game.html","line":16688,"end":16696,"sha256":"0359df1166dc48e785574d5d1456cfcb3202637fc6f111b2e4520a4942e8c384"},"STG.construction":{"file":"game.html","line":16697,"end":16713,"sha256":"dbea2ebe74c7733e6f34b210fa0e07dfd9d6e16577704abe5990e7e95a902a16"},"_traceCh2AuthoredFloor":{"file":"game.html","line":11408,"end":11425,"sha256":"ce0ba1552e06e6dd6091e3cdfbdbe4cad8751b726ebfdc9e51ff457eb9b0d286"},"_paintCh2OrganicFloorDetail":{"file":"game.html","line":11426,"end":11468,"sha256":"27eef38a793e6ec53446aeefc02a09b3690f59b58f06f4eb5eae5a476dbdaa44"},"_traceCh2OrganicFloorSide":{"file":"game.html","line":11469,"end":11489,"sha256":"552a880de5a301f4d0a7a1c4f1e342772afc6f78a8f58d9961e096cc0a11289e"},"_paintCh2OrganicCollisionRim":{"file":"game.html","line":11490,"end":11505,"sha256":"c7e4c6ee83e0dec3927cd3630e806a14e0d29d3b85224f7b37cd1b7288b03d9a"},"_paintCh2OrganicFloorHalo":{"file":"game.html","line":11506,"end":11517,"sha256":"99354b717c78a61fc00173e7d8b23d6d17c49fbc54db7191079b58375f05c11f"},"_fillPathBg":{"file":"game.html","line":11915,"end":11947,"sha256":"b052fb4b79982226a4ab31999a32272fce625d623456dec10c1a7a5dda8d6302"}}
const PATH = {"spec":null,"empty":null,"editor_tile_rle":[1,40000],"editor_tile_rle_sha256":"6b380a8d39be723c9d4e0482841be22a5eb963afb62aef3bafa3c5e0377299d7"}
const DESCRIPTOR = {"n":"WORM NEST","kr":"벌레굴 2구역","w":"#2e3018","f":"#0e1008","ac":"#aacc44","bn":"점액 괴수","be":0,"monLv":200,"hell":1,"hellFloor":1,"isHellBoss":false,"chapter":1}
const UNDEFINED_PATHS = ["/hand_props_raw","/source_path/spec","/source_path/empty","/compose_raw"]
const FIELDS = ["schema","stage","source","grid","tiles","rooms","exits","boss_gate","start_tile","start_world","hand_props_raw","initial_obj_meta","ch2_deco_raw","chapter_stages","spawn_holes_final","total_spawned","exit_center_tile","source_path","compose_raw","stage_descriptor","asset_refs","runtime_tile_sha256","region_totals","environment_refs","undefined_paths","generation","scope"]
const HOLES = [[2820,6380,0.5,1,100,1],[5060,5900,0.3,1,50,2],[2020,4900,0.5,1,100,3],[3660,3980,0.5,1,100,4],[5860,2780,0.5,1,100,5],[2300,2180,0.3,1,50,6],[5220,1260,0.5,1,100,7],[3780,6220,0.3,1,50,9],[3060,3420,0.55,1,100,10],[4820,1900,0.8,1,100,11],[4020,5540,0.3,-1,50,12]]

static func same(value: Variant, expected: Variant) -> bool:
 if expected == null:return value == null
 if expected is Dictionary:
  if not value is Dictionary or value.size()!=expected.size():return false
  for key in expected:
   if not value.has(key) or not same(value[key],expected[key]):return false
  return true
 if expected is Array:
  if not value is Array or value.size()!=expected.size():return false
  for i in expected.size():
   if not same(value[i],expected[i]):return false
  return true
 return CH1.literal(value,expected)

static func read_area(raw: Variant) -> Dictionary:
 return validate_area(raw)

static func validate_area(raw: Variant) -> Dictionary:
 var reason:=error(raw)
 if not reason.is_empty():return {"status":"NOT_READY","reason":reason,"raw":raw,"scope":"source_snapshot_only"}
 return {"status":"READY","value":raw,"scope":"source_snapshot_only","source_only_stage":5,
  "runtime_bound":false,"full_stage_ready":false,"visual_verified":false,
  "provenance_validation":"declared source pins; no source file reads"}

static func error(raw: Variant) -> String:
 if not raw is Dictionary:return "snapshot_not_dictionary"
 if raw.size()!=FIELDS.size():return "snapshot_field_set_mismatch"
 for field in FIELDS:
  if not raw.has(field):return "snapshot_field_missing"
 if not CH1.literal(raw.schema,SCHEMA) or not CH1.integer(raw.stage) or raw.stage!=5:return "unsupported_schema_or_stage"
 if not same(raw.grid,{"width":200,"height":200,"tile_size":40}):return "grid_mismatch"
 var source: Variant=raw.source
 if not source is Dictionary or source.size()!=6 or not CH1.hex(source.get("main_sha"),40) or not CH1.hex(source.get("extraction_head"),40) \
   or not CH1.literal(source.get("game_sha256"),GAME_SHA):return "source_provenance_missing"
 if not CH1.literal(source.get("selection"),"default empty URL → _getFixedMapForStage(5) → _cloneField11(5) → genFromTemplate"):return "source_selection_mismatch"
 if not same(source.get("files"),Shared.FILES) or not same(source.get("symbols"),SYMBOLS):return "source_records_mismatch"
 if not same(raw.initial_obj_meta,Shared.META) or not same(raw.ch2_deco_raw,Shared.DECO) or not same(raw.asset_refs,Shared.ASSETS):return "shared_ch2_catalog_mismatch"
 if raw.hand_props_raw!=null or raw.compose_raw!=null or not same(raw.undefined_paths,UNDEFINED_PATHS):return "absent_source_carrier_mismatch"
 if not same(raw.source_path,PATH):return "default_floor_or_absent_path_mismatch"
 if not same(raw.stage_descriptor,DESCRIPTOR):return "stage_descriptor_mismatch"
 if not same(raw.chapter_stages,Shared.CHAPTERS) or not same(raw.rooms,Shared.ROOMS):return "chapter_or_rooms_mismatch"
 if not CH1.numbers(raw.start_tile,[100,185]) or not CH1.numbers(raw.start_world,[4020,7420]) or not CH1.numbers(raw.exit_center_tile,[100,7]):return "start_or_exit_center_mismatch"
 for key in ["boss_gate","exits"]:
  var entries: Variant=raw[key]
  if not entries is Array or entries.size()!=3:return "gate_or_exit_missing"
  for i in 3:
   if not same(entries[i],{"x":99+i,"y":5 if key=="boss_gate" else 7}):return "gate_or_exit_mismatch"
 var tiles: Variant=raw.tiles
 if not tiles is Array or tiles.size()!=40000:return "runtime_tiles_incomplete"
 var bytes:=PackedByteArray()
 bytes.resize(40000)
 var counts: Array=[0,0,0,0,0]
 for i in 40000:
  if not CH1.integer(tiles[i]) or tiles[i]<0 or tiles[i]>4:return "runtime_tile_invalid"
  bytes[i]=int(tiles[i]);counts[int(tiles[i])]+=1
 if counts!=[38986,36,3,0,975] or not CH1.literal(raw.runtime_tile_sha256,TILE_SHA) or CH1.digest(bytes)!=TILE_SHA:return "runtime_tile_hash_or_counts_mismatch"
 var generation: Variant=raw.generation
 if not generation is Dictionary or generation.size()!=5 or not CH1.integer(generation.get("seed")) or generation.seed<0 or generation.seed>4294967295 \
   or not CH1.literal(generation.get("random_draws"),12) \
   or not CH1.literal(generation.get("random_algorithm"),"LCG uint32: imul(1664525)+1013904223; /4294967296") \
   or not CH1.literal(generation.get("timer_basis"),"seeded source VM observation only; not browser boot RNG"):return "seed_evidence_missing"
 # Replay arithmetic only. Draw8 belongs to a culled hole, not the final hole8.
 var state:=int(generation.seed)
 var timers: Array=[]
 for i in 12:
  state=(state*1664525+1013904223)&0xffffffff
  timers.append(600.0+float(state)/4294967296.0*60.0)
 if not CH1.integer(generation.get("random_final_state")) or generation.random_final_state!=state:return "seed_final_state_mismatch"
 var holes: Variant=raw.spawn_holes_final
 if not holes is Array or holes.size()!=11 or not CH1.literal(raw.total_spawned,900):return "hole_totals_mismatch"
 var totals: Array=[0,0,0,0]
 for i in 11:
  var h: Variant=holes[i]
  if not h is Dictionary or h.size()!=7:return "source_hole_shape_mismatch"
  if not CH1.numbers([h.get("x"),h.get("y"),h.get("size"),h.get("room"),h.get("count")],HOLES[i].slice(0,5)) \
    or not CH1.number(h.get("timer")) or not CH1.literal(h.get("alive"),0):return "ordered_source_hole_mismatch"
  if absf(float(h.timer)-timers[HOLES[i][5]-1])>0.00000001:return "source_timer_mismatch"
  totals[(0 if h.y<4000 else 2)+(0 if h.x<4000 else 1)]+=int(h.count)
 if not CH1.numbers(raw.region_totals,[250,300,250,100]) or not CH1.numbers(raw.region_totals,totals):return "region_sum_mismatch"
 if not same(raw.scope,{"runtime_bound":false,"visual_verified":false,"save_access":0,"init_map_objects_executed":false,
  "final_map_objects":"NOT_OBSERVED","effective_prop_positions":"NOT_OBSERVED","prop_colliders":"NOT_OBSERVED",
  "region_projection":"original _regionInit in isolated VM; no runtime owner bound"}):return "source_scope_mismatch"
 if not same(raw.environment_refs,[{"src":"maps_data.js","file":"maps_data.js","line":62,"sha256":Shared.FILES["maps_data.js"]}]):return "environment_refs_mismatch"
 return ""
