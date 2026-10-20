extends SceneTree
const USERDIR := "EXODUSER-demo11-19r-Isolated-20261021"
const OWNER=preload("res://scripts/native_demo_growth_owner.gd")
const POINT=preload("res://scripts/native_meta_point_policy.gd")
const CURVE=preload("res://scripts/native_source_meta_exp_curve.gd")
var checks:=0
var failures:=0
var main: Node
var state: Node
var cases: Array=[]
var actuals: Array=[]
var level_events: Array=[]
func equal(a: Variant, b: Variant) -> bool:
 if (a is int or a is float) and (b is int or b is float):
  return (is_nan(float(a)) and is_nan(float(b))) or float(a) == float(b)
 if typeof(a) != typeof(b): return false
 if a is Dictionary:
  if a.size() != b.size(): return false
  for key in a:
   if not b.has(key) or not equal(a[key], b[key]): return false
  return true
 if a is Array:
  if a.size() != b.size(): return false
  for i in range(a.size()):
   if not equal(a[i], b[i]): return false
  return true
 return a == b
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("DEMO1119R_FAIL ",label)
func argument(key: String) -> String:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with(key+"="):return arg.substr(key.length()+1)
 return ""
func fixture(extra: Dictionary={}) -> void:
 var stats: Dictionary=state.read_current_stats()
 for key in stats:stats[key]=0
 var passives: Dictionary=state.read_current_passives()
 for key in passives:passives[key]=0
 var p: Dictionary=state.read_current_p()
 p.sp=20;p.ap=20;p.erase("_passiveQueue")
 main.source_providers.get_provider("raw_grit").current_container()["_grit"]=0
 for key in extra.get("stats",{}):stats[key]=extra.stats[key]
 for key in extra.get("passives",{}):passives[key]=extra.passives[key]
 for key in ["sp","ap"]:
  if extra.has(key):p[key]=extra[key]
 if extra.has("queue"):p._passiveQueue=extra.queue.duplicate(true)
 if extra.has("grit"):main.source_providers.get_provider("raw_grit").current_container()["_grit"]=extra.grit
 var receipt: Dictionary=main.request_native_runtime_stat_refresh("apply_stats","test_fixture")
 check(receipt.status=="READY","fixture actual PC refresh")
func run_case(name: String,command: Dictionary,extra: Dictionary={}) -> void:
 fixture(extra)
 var before: Dictionary=main.read_native_growth()
 var stats: Dictionary=state.read_current_stats()
 var passives: Dictionary=state.read_current_passives()
 cases.append({"name":name,"command":command.duplicate(true),"before":before})
 var result: Dictionary=main.request_native_growth(command)
 actuals.append({"after":main.read_native_growth(),"result":result.duplicate(true)})
 check(is_same(stats,state.read_current_stats()) and is_same(passives,state.read_current_passives()),name+" original allocation identities")
 if result.get("applied")==true and not result.get("refresh",{}).is_empty():
  var r: Dictionary=result.refresh
  check(r.status=="READY" and r.committed and not r.free_refill,name+" actual PC receipt")
  var current: Dictionary=state.read_current_p()
  for owner in ["actor","resources","state"]:
   check(not r.committed_fields[owner].is_empty(),name+" committed owner "+owner)
   for field in r.committed_fields[owner]:check(current[field]==r.after[field],name+" committed readback "+field)
func _on_level(packet: Dictionary) -> void:
 level_events.append({"handoff":packet.duplicate(true),"growth":main.read_native_growth(),"p":state.read_current_p().duplicate(true)})
 check(main.request_native_growth({"action":"reset"}).applied==false,"UI transaction cannot reenter active XP handoff")
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolated userdir")
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in 8:await physics_frame
 state=main.source_state
 paused=true # Real UI allocations must work during pause.
 check(OWNER.definitions().size()==26,"canonical26 passive definitions")
 for row in [
  ["str+",{"action":"stat","key":"str","amount":1},{}],
  ["dexcap",{"action":"stat","key":"dex","amount":1},{"stats":{"dex":499}}],
  ["dexover",{"action":"stat","key":"dex","amount":1},{"stats":{"dex":500}}],
  ["negative",{"action":"stat","key":"str","amount":-1},{}],
  ["refundstat",{"action":"stat","key":"str","amount":-1},{"stats":{"str":2}}],
  ["poorSP",{"action":"stat","key":"int","amount":1},{"sp":0}],
  ["grit",{"action":"stat","key":"grit","amount":3},{}],
  ["passive",{"action":"passive","key":"pFortify","amount":1},{}],
  ["rank9",{"action":"passive","key":"pFortify","amount":1},{"passives":{"pFortify":9}}],
  ["rankmax",{"action":"passive","key":"pFortify","amount":1},{"passives":{"pFortify":10}}],
  ["rankrefund",{"action":"passive","key":"pFortify","amount":-1},{"passives":{"pFortify":10}}],
  ["poorAP",{"action":"passive","key":"pFortify","amount":1},{"ap":0}],
  ["enqueue",{"action":"queue_add","key":"pFortify","amount":2},{}],
  ["enqueueover",{"action":"queue_add","key":"pFortify","amount":2},{"passives":{"pFortify":9}}],
  ["cancel",{"action":"queue_cancel","index":0},{"queue":["pFortify","pVital"]}],
  ["cancelbad",{"action":"queue_cancel","index":2},{"queue":["pFortify"]}],
  ["fifo",{"action":"process_queue"},{"ap":4,"queue":["pFortify","pFortify","pFortify","pFortify","pVital"]}],
  ["headblock",{"action":"process_queue"},{"ap":1,"passives":{"pFortify":9},"queue":["pFortify","pVital"]}],
  ["maxhead",{"action":"process_queue"},{"ap":1,"passives":{"pFortify":10},"queue":["pFortify","pVital"]}],
  ["sanitize",{"action":"process_queue"},{"queue":["bad",1,"pFortify"],"ap":1}],
  ["resetlegacy",{"action":"reset"},{"stats":{"str":3,"vit":4},"passives":{"pFortify":10},"grit":2,"queue":["pVital"]}],
  ["resetempty",{"action":"reset"},{}]]:
  run_case(row[0],row[1],row[2])
 fixture({"passives":{"pFortify":2},"queue":["pFortify","pVital"]})
 var plan: Dictionary=POINT.create_plan(main.read_native_growth())
 plan.stats.str=3;plan.passives.pFortify=1;plan.grit=2
 run_case("plan",{"action":"plan","plan":plan},{"passives":{"pFortify":2},"queue":["pFortify","pVital"]})
 var plan_fields: Dictionary={}
 for field in OWNER.READBACK:plan_fields[field]=state.read_current_p()[field].duplicate(true) if state.read_current_p()[field] is Dictionary else state.read_current_p()[field]
 var repeated: Dictionary=main.request_native_runtime_stat_refresh("apply_stats","test_plan_second_original_pass")
 check(repeated.status=="READY" and repeated.after==plan_fields,"original plan second applyStats is idempotent for stats/passive/grit/queue fixture")
 var stale: Dictionary=plan.duplicate(true);stale.base.grit=99
 run_case("staleplan",{"action":"plan","plan":stale})
 # Original callback oracle, copied only as bytes from bounded source functions.
 var path:=ProjectSettings.globalize_path("user://growth-cases.json")
 var out:=ProjectSettings.globalize_path("user://growth-oracle.json")
 var f:=FileAccess.open(path,FileAccess.WRITE);f.store_string(JSON.stringify(cases));f.close()
 var chunks: Array=[]
 var code:=OS.execute(argument("--node-bin"),PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_19r_source_oracle.mjs"),"--source-game="+ProjectSettings.globalize_path("res://../game.html"),"--cases-file="+path,"--out-file="+out]),chunks,true)
 var joined:=""
 for chunk in chunks:joined+=str(chunk)
 check(code==0,"original callback oracle "+joined.left(200))
 var expected: Variant=JSON.parse_string(FileAccess.get_file_as_string(out)) if code==0 else null
 check(expected is Dictionary and expected.rows.size()==cases.size(),"complete source cases")
 if expected is Dictionary:
  check(equal(expected.definitions,OWNER.definitions()),"all source26 keys/max equal existing bootstrap")
  for i in cases.size():
   check(equal(actuals[i].after,expected.rows[i].after),cases[i].name+" allocation/FIFO/refund source exact")
   var native_calls: int=0 if actuals[i].result.get("refresh",{}).is_empty() else 1
   check(native_calls==(1 if expected.rows[i].refresh>0 else 0),cases[i].name+" refresh only actual derived change; plan coalesces two identical final passes")
 # Real PC late producer rejection: not a fake refresh fixture.
 fixture({"queue":["pFortify"],"ap":1})
 var p: Dictionary=state.read_current_p();var old_shield: Variant=p.shield
 state.get("_p").shield="bad-shield"
 var before: Dictionary=main.read_native_growth();var derived_before: Dictionary=state.read_current_p().duplicate(true)
 var failed: Dictionary=main.request_native_growth({"action":"passive","key":"pFortify","amount":1})
 check(not failed.applied and failed.unchanged,"late actual PC failure rolls back allocations")
 check(main.read_native_growth()==before and state.read_current_p()==derived_before,"late failure all real P/resources/points unchanged")
 state.get("_p").shield=old_shield
 var stranger:=Node.new()
 check(not state.apply_native_growth(stranger,{"action":"reset"}).applied,"foreign owner rejected")
 stranger.free()
 # XP: even level AP -> FIFO -> apply_stats -> heal(new caps) -> display/save.
 fixture({"ap":0,"queue":["pFortify"]})
 p=state.read_current_p();p.lv=1;p.exp=14;p.maxExp=15;p.sp=0;p.ap=0
 main.player.hp=10;p.hp=10
 var old_max: float=main.player.max_hp
 state.native_level_up_handoff.connect(_on_level)
 paused=false
 var xp: Dictionary=state.apply_native_add_exp(main,1)
 paused=true
 check(xp.applied and xp.levels==1,"actual XP owner accepted")
 check(main.read_native_growth().passives.pFortify==1 and main.read_native_growth().ap==0 and main.read_native_growth().queue.is_empty(),"even-level AP auto-invested before handoff")
 check(main.player.max_hp>old_max,"queue refresh updated actual maxHP")
 var healed: float=minf(main.player.max_hp,10+floorf(main.player.max_hp*0.2))
 check(main.player.hp==healed,"level heal uses new actual cap once")
 check(level_events.size()==1 and level_events[0].growth.passives.pFortify==1 and level_events[0].p.hp==healed,"display/save handoff after queue/refresh/heal")
 # XP rollback on actual PC refusal before heal; no partial XP/AP/queue commit.
 fixture({"ap":0,"queue":["pFortify"]})
 p=state.read_current_p();p.lv=1;p.exp=14;p.maxExp=15;p.sp=0;p.ap=0
 old_shield=p.shield;state.get("_p").shield="bad-shield"
 before=main.read_native_growth();derived_before=state.read_current_p().duplicate(true)
 var events_before:=level_events.size()
 paused=false;xp=state.apply_native_add_exp(main,1);paused=true
 check(not xp.applied and xp.growth.unchanged,"XP sees actual PC refusal")
 check(state.read_current_p()==derived_before and main.read_native_growth()==before,"XP points/level/queue/derived rollback exact")
 check(level_events.size()==events_before,"failure emits no display/save handoff")
 state.get("_p").shield=old_shield
 check(main.hud.get("_status_text").text.begins_with("SP "),"existing HUD minimum point/queue confirmation")
 paused=false;main.queue_free()
 for i in 16:await process_frame
 await create_timer(0.2).timeout
 print("DEMO1119R_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"source_cases":cases.size(),"real_PC_refusal_cases":2,"save_io":false}))
 quit(1 if failures else 0)
