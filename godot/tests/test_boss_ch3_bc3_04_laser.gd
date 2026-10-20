extends SceneTree
## BC3-04: compact native-source differential; no combat owner or scene boots.
const Laser=preload("res://scripts/native_ch3_boss_laser.gd")
const Start=preload("res://scripts/native_ch3_boss_new_start.gd")
const USERDIR="EXODUSER-bc3-04-Isolated-20261020"
const HASH="4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
var assertions:=0
var failures:=0
var label:="startup"
var source_path:=""
var node_bin:=""
var summary: Dictionary={}
func check(ok: bool,message: String) -> void:
 assertions+=1
 if not ok:failures+=1;printerr("BC3_04_FAIL ",label," ",message)
func _initialize() -> void:
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--source-game="):source_path=arg.trim_prefix("--source-game=")
  if arg.begins_with("--node-bin="):node_bin=arg.trim_prefix("--node-bin=")
 call_deferred("run")
func run() -> void:
 check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false) and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"actual isolated userdir")
 check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"explicit --node-bin")
 check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"explicit source SHA")
 if failures>0:finish();return
 var target: String=OS.get_user_data_dir().path_join("bc3-04-원문-fixture.json")
 if FileAccess.file_exists(target):DirAccess.remove_absolute(target)
 var output: Array=[]
 var code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc3_04_source_oracle.cjs"),source_path,target]),output,true)
 check(code==0,"Node exit0 "+"".join(output).left(200))
 if code!=0:finish();return
 check(FileAccess.file_exists(target),"fresh UTF-8 fixture")
 var data: Variant=decode(JSON.parse_string(FileAccess.get_file_as_string(target)))
 if not data is Dictionary:check(false,"fixture dictionary");finish();return
 summary=data["summary"]
 check(data["source_only"] and data["game_sha256"]==HASH and summary["cases"]==data["cases"].size(),"source inventory")
 check(Laser.source_receipt()["ready"] and not Laser.source_receipt()["live_combat_connected"] and not Laser.source_receipt()["parry_execution_verified"],"readonly receipt")
 seed(20261020);var expected_next:=randi();seed(20261020)
 for row: Dictionary in data["cases"]:
  label=row["name"]+" si"+str(row["si"])
  var got: Dictionary=consume(row)
  check(got.get("status")=="READY" and got.get("done",false),"source case completes")
  if got.get("status")!="READY":continue
  for key in ["enemy","player","globals","cursor","wall_reads"]:check(equivalent(got[key],row["expected"][key]),"exact source "+key)
  if not equivalent(got["all_events"],row["expected"]["events"]):
   var a: Array=got["all_events"];var b: Array=row["expected"]["events"];var at:=0
   while at<mini(a.size(),b.size()) and equivalent(a[at],b[at]):at+=1
   check(false,"event order at "+str(at)+" got="+(JSON.stringify(a[at]) if at<a.size() else "END").left(250)+" expected="+(JSON.stringify(b[at]) if at<b.size() else "END").left(250))
  else:check(true,"complete writes/commands/RNG order")
  check(got["contacts"]==row["responses"].size() and got["helpers"]==row["helpers"].size(),"all protected/pitch readbacks consumed")
 _start_boundary()
 _five_faults()
 check(randi()==expected_next and root.get_child_count()==0,"no global RNG or Main/scene/owner boots")
 finish()
func consume(row: Dictionary) -> Dictionary:
 var initial: String=JSON.stringify([row["enemy"],row["player"],row["options"]])
 var begun: Dictionary=Laser.begin_tick(row["si"],row["enemy"],row["sp"],row["player"],row["options"])
 if begun["status"]!="READY":return begun
 var token: Dictionary=begun["continuation"];var response: Variant=null
 var events: Array=[];var cursor: Array=[0];var walls:=0;var contacts:=0;var helpers:=0
 var globals: Dictionary={"_flashT":row["options"]["flash_t"],"shake":row["options"]["global_shake"],"_flashCol":"old"}
 var result: Dictionary={}
 for guard in 4096:
  var before: String=JSON.stringify(token) if guard==0 else ""
  result=Laser.next_tick(token,response,func(_tag: String) -> Variant:
   var u: Variant=row["units"][cursor[0]%row["units"].size()];cursor[0]+=1;return u)
  if guard==0:check(JSON.stringify(token)==before,"continuation input immutable")
  if result["status"]!="READY":check(false,"NOT_READY:"+str(result.get("reason")));return result
  events.append_array(result["events"])
  for event: Dictionary in result["events"]:
   if event["kind"]=="global_write":globals[event["field"]]=event["value"]
  if result["done"]:break
  var cmd: Dictionary=result["command"]
  check(cmd["executed"]==false and not result["full_tick_complete"],"unexecuted owner packet only")
  response={"ack":true}
  match cmd["command"]:
   "isW":walls+=1;response["value"]=row["wall_at"]>0 and walls==row["wall_at"]
   "isPWin":response["value"]=row["parry"]
   "hurtP","doParry","_poiseHit":
    if contacts>=row["responses"].size():check(false,"source contact response missing");return {"status":"NOT_READY"}
    var authority: Dictionary=row["responses"][contacts]
    check(equivalent(cmd,authority["command"]),"exact protected owner request")
    response["enemy_after"]=authority["enemy_after"];response["player_after"]=authority["player_after"]
    cursor[0]=authority["cursor_after"];contacts+=1
   "_r":
    if helpers>=row["helpers"].size():check(false,"source pitch response missing");return {"status":"NOT_READY"}
    response["value"]=row["helpers"][helpers]["value"];cursor[0]=row["helpers"][helpers]["cursor_after"];helpers+=1
   _:
    # Only the fixture text recipe resolves here. No UI/SFX/effect runtime call.
    if cmd["command"]=="addTxt":
     var copy: Dictionary=cmd.duplicate(true)
     copy["args"][2]="translated:"+copy["args"][2]["args"][0]
     events[-1]["value"]=copy
    cursor[0]+=row["nested"]
  token=result["continuation"]
 check(JSON.stringify([row["enemy"],row["player"],row["options"]])==initial,"input actor/player/options preserved")
 result["all_events"]=events;result["globals"]=globals;result["cursor"]=cursor[0];result["wall_reads"]=walls;result["contacts"]=contacts;result["helpers"]=helpers
 return result
func enemy() -> Dictionary:return {"s":"bossLaser","st2":0,"x":10,"y":20,"r":44,"facing":0,"atk":46,"el":2,"col":"#3388ff","laserAng":0,"laserLen":35}
func player() -> Dictionary:return {"x":20,"y":20,"r":12,"iframes":0,"s":"idle","mhp":999,"kb":{"x":0,"y":0}}
func options() -> Dictionary:return {"flash_t":0,"global_shake":0,"shake":100}
func packet_named(name: String) -> Dictionary:
 var token: Dictionary=Laser.begin_tick(10,enemy(),0,player(),options())["continuation"];var response: Variant=null
 for i in 20:
  var result: Dictionary=Laser.next_tick(token,response,func(_tag: String):return .25)
  if result["status"]!="READY" or result.get("done",false):return {}
  if result["command"]["command"]==name:return result
  response={"ack":true,"value":false};token=result["continuation"]
 return {}
func _start_boundary() -> void:
 label="BC3-03 laser start / post-shared clock"
 var e: Dictionary=enemy();e["s"]="idle"
 var begun: Dictionary=Start.begin_start(10,"laser",e,100,0)
 check(begun["status"]=="READY","adopted start dependency ready")
 if begun["status"]!="READY":return
 var token: Dictionary=begun["continuation"];var result: Dictionary={};var response: Variant=null
 for i in 8:
  result=Start.next_start(token,response,func(_tag: String):return .25)
  if result.get("done",false):break
  token=result["continuation"];response={"ack":true}
 check(result.get("done",false) and result["enemy"]["s"]=="bossLaserWind","start produces owned wind input")
 var tick: Dictionary=Laser.begin_tick(10,result["enemy"],1,player(),options())
 check(tick["status"]=="READY" and tick["continuation"]["enemy"]["st2"]==result["enemy"]["st2"],"no duplicate clock decrement")
func _five_faults() -> void:
 label="five fault classes"
 var e: Dictionary=enemy();e.erase("laserAng")
 check(Laser.begin_tick(10,e,1,player(),options())["status"]=="NOT_READY","1 incomplete source snapshot")
 var t: Dictionary=Laser.begin_tick(10,enemy(),0,player(),options())["continuation"];t["_chapter_source_hash"]="wrong"
 check(Laser.next_tick(t)["status"]=="NOT_READY","2 catalog provenance token")
 t=Laser.begin_tick(10,enemy(),0,player(),options())["continuation"];t["step"]="window"
 check(Laser.next_tick(t)["status"]=="NOT_READY","2 premature checkpoint rejected without script error")
 var wall: Dictionary=packet_named("isW")
 check(not wall.is_empty() and Laser.next_tick(wall["continuation"],{"ack":true})["status"]=="NOT_READY","3 missing wall readback")
 var damage: Dictionary=packet_named("hurtP")
 check(not damage.is_empty() and Laser.next_tick(damage["continuation"],{"ack":true})["status"]=="NOT_READY","4 missing protected full readback")
 e=enemy();e["s"]="bossLaserWind"
 t=Laser.begin_tick(10,e,1,player(),options())["continuation"]
 var bad: Dictionary=Laser.next_tick(t,null,func(_tag: String):return 1.0)
 check(bad["status"]=="NOT_READY" and bad["enemy"]==null and bad["player"]==null and bad["command"]==null,"5 invalid RNG has no partial packet")
func finish() -> void:
 print("BC3_04_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skip":0,"oracle_summary":summary,"live_combat_verified":false,"damage_execution_verified":false,"parry_execution_verified":false,"full_tick_complete":false,"userdir":OS.get_user_data_dir()}))
 quit(0 if failures==0 else 1)

func equivalent(a: Variant,b: Variant) -> bool:
 if (a is int or a is float) and (b is int or b is float):
  if is_nan(float(a)) and is_nan(float(b)): return true
  if b is int: return a==b
  return absf(float(a)-float(b))<=1e-12*maxf(1.0,absf(float(b))) # Adopted BC06/BC2-03 numeric contract, not increased.
 if a is Dictionary and b is Dictionary:
  if a.size()!=b.size(): return false
  for key in b:
   if not a.has(key) or not equivalent(a[key],b[key]): return false
  return true
 if a is Array and b is Array:
  if a.size()!=b.size(): return false
  for i in range(a.size()):
   if not equivalent(a[i],b[i]): return false
  return true
 return a==b

func decode(value: Variant) -> Variant:
 if value is Dictionary:
  if value.size()==1 and value.has("integer"): return int(value["integer"])
  if value.size()==1 and value.has("binary64"): return str(value["binary64"]).hex_decode().decode_double(0)
  var result: Dictionary={}
  for key: String in value: result[key]=decode(value[key])
  return result
 if value is Array:
  var result: Array=[]
  for item: Variant in value: result.append(decode(item))
  return result
 return value
