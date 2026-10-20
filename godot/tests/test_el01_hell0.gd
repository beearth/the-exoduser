extends SceneTree
const USERDIR = "EXODUSER-el-01-Isolated-20261021"
const Selector=preload("res://port_modules/elite_spawn_rules_source/producer.gd")
const Order=preload("res://port_modules/elite_owner_attack_order/producer.gd")
const M29=preload("res://scripts/enemy_mod_m29.gd")
const M30=preload("res://scripts/native_m30_modifier.gd")
const Recipe=preload("res://scripts/type3_spawn_recipe.gd")
var checks:=0
var failures:=0
var observations: Dictionary={}
class Stream extends RefCounted:
 var values: Array
 var cursor:=0
 var labels: Array=[]
 func _init(v: Array) -> void:values=v.duplicate()
 func next() -> Variant:
  if cursor>=values.size():return null
  var v: Variant=values[cursor];cursor+=1;return v
 func purpose(label: String) -> Variant:
  labels.append(label);return next()
class Owner extends Node2D:
 var alive=true
 var attack=40
 var mods: Array=[]
class Target extends Node2D:
 var iframes=0.0
 var state="idle"
 var packets: Array=[]
 func receive_damage(n: int,kind: String) -> void:packets.append([n,kind])
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("EL01_FAIL ",label)
func same(a: Variant,b: Variant) -> bool:
 if (a is int or a is float) and (b is int or b is float):return float(a)==float(b)
 if a is Dictionary and b is Dictionary:
  if a.size()!=b.size():return false
  for k in a:
   if not b.has(k) or not same(a[k],b[k]):return false
  return true
 if a is Array and b is Array:
  if a.size()!=b.size():return false
  for i in range(a.size()):
   if not same(a[i],b[i]):return false
  return true
 return a==b
func _initialize() -> void:call_deferred("run")
func run() -> void:
 check(OS.get_user_data_dir().ends_with(USERDIR),"actual isolated directory")
 var opts: Dictionary={}
 for arg in OS.get_cmdline_user_args():
  var i:=arg.find("=")
  if i>=0:opts[arg.substr(0,i)]=arg.substr(i+1)
 var node: String=opts.get("--node-bin","")
 var oracle_path: String=opts.get("--oracle-out",OS.get_user_data_dir().path_join("el01-oracle.json"))
 var constructor_path: String=opts.get("--constructor-out",OS.get_user_data_dir().path_join("type3-oracle.json"))
 var source: String=ProjectSettings.globalize_path("res://../game.html")
 var output: Array=[]
 var args: PackedStringArray=[ProjectSettings.globalize_path("res://tools/export_el01_hell0_oracle.mjs"),"--source-game="+source,"--output="+oracle_path,"--constructor-output="+constructor_path]
 if opts.has("--acorn-root"):args.append("--acorn-root="+str(opts["--acorn-root"]))
 if node.is_empty():check(false,"explicit --node-bin required");finish();return
 var exit: int=OS.execute(node,args,output,true)
 check(exit==0,"Node source oracle execution (UTF-8 file; joined diagnostics)")
 if exit!=0:print("EL01_ORACLE_ERROR ","".join(output).left(1400));finish();return
 var oracle: Variant=JSON.parse_string(FileAccess.get_file_as_string(oracle_path))
 check(oracle is Dictionary,"UTF8 oracle JSON")
 if not oracle is Dictionary:finish();return
 check(oracle.source.sha256==FileAccess.get_sha256(source),"latest pinned game bytes")
 var catalog=Selector.new().read_catalog()
 for key in ["tiers","mods","auras"]:check(same(catalog[key],oracle.catalog[key]),"source catalog "+key)
 for c in oracle.cases:
  var stream=Stream.new(c.draws);var selector=Selector.new()
  selector.configure(stream.next)
  var result: Dictionary
  match c.kind:
   "elite":result=selector.roll_elite(int(c.stage))
   "mods":result=selector.roll_mods(int(c.tier),int(c.stage))
   "aura":result=selector.roll_aura(int(c.tier),int(c.stage))
  check(result.status=="READY" and same(result.value,c.value),"selection source value "+str(checks))
  check(result.draws==c.rng_count and stream.cursor==c.rng_count,"selection RNG cursor "+str(checks))
 for c in oracle.constructors:
  var stream=Stream.new(c.draws);var recipe=Recipe.new()
  recipe.configure(stream.next,func(_x,_y,_r):return c.moveTo==null,func(_x,_y,_r):return c.moveTo)
  var result: Dictionary=recipe.build_child(c.x,c.y,c.context,int(c.el))
  check(result.valid,"actual type3 constructor "+c.name)
  if result.valid:
   for key in c.result:check(same(result.recipe.get(key),c.result[key]),"constructor "+c.name+":"+key)
   check(stream.cursor==c.rng_count,"constructor source RNG count "+c.name)
 for c in oracle.forced:
  var raw: Dictionary=c.raw.duplicate(true)
  var mods: Array=raw.mods
  var result: Dictionary=Selector.apply_forced_constructor(raw,c.role)
  check(result.status=="READY" and same(raw,c.result),"source forced "+c.role+":"+str(c.raw.mhp))
  check(is_same(raw.mods,mods) and result.draws==0,"forced keeps mods ref; RNG0")
 var profile: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/m30_burst.json"))
 for c in oracle.phases:phase(c,profile)
 negatives(profile)
 observations={"selection_cases":oracle.cases.size(),"constructor_cases":oracle.constructors.size(),"forced_cases":oracle.forced.size(),"owner_phase_cases":oracle.phases.size(),"source_sha256":oracle.source.sha256,"oracle_utf8":oracle_path,"PC_actual_parry_connected":false,"natural_actor_admission":false}
 finish()
func phase(c: Dictionary,profile: Dictionary) -> void:
 var raw: Dictionary=c.raw.duplicate(true)
 var actor=Owner.new();actor.mods=raw.mods
 var target=Target.new();target.position=Vector2(c.distance,0)
 var world=Node2D.new()
 var k29: RefCounted
 var k30: Node
 if raw.mods.has("M29"):
  k29=M29.new();k29.configure({"can_move":func(_x,_y,_r):return true,"is_wall":func(_x,_y):return false,"element_multiplier":func(_el):return 1.0})
 if raw.mods.has("M30"):
  k30=M30.new();check(k30.configure(actor,target,world,raw.modT,profile),"real M30 configured")
 var result: Dictionary=Order.advance(raw,c.ticks,c.distance,{"x":float(target.position.x),"y":0.0},k29,k30)
 check(result.status=="READY" and result.lock_ticks==1,"one owner decrement")
 var expected: Dictionary=c.result.raw
 for key in ["s","st2","modT","facing","echDx","echDy","_chgAimMax","_chgDur","_chgSpd","_chgLen","_chgVisLen"]:
  if expected.has(key):check(same(raw.get(key),expected[key]),"phase source field "+key)
 if k30!=null:
  check(same(k30.get_snapshot().zones,expected.get("_eliteZones",[])),"birth zone same-tick age and target position")
  k30.free()
 check(same(target.packets,c.result.damage),"zone damage requests unchanged")
 actor.free();target.free();world.free()
func negatives(profile: Dictionary) -> void:
 var stream=Stream.new([0.0,.5,.6]);var s=Selector.new()
 check(s.configure(stream.next) and not s.configure(stream.next),"configure once")
 check(s.roll_elite(4).status=="NOT_READY" and stream.cursor==0,"later hell rejected RNG0")
 check(s.roll_mods(-1,0).status=="NOT_READY" and stream.cursor==0,"bad tier RNG0")
 check(s.roll_mods(0,0).value==[] and s.roll_aura(1,0).value==null and stream.cursor==0,"tier0 mods and tier1 aura zero draws")
 var catalog=s.read_catalog();catalog.mods.clear()
 check(s.read_catalog().mods.size()==6,"catalog defensive copy")
 var bad=Stream.new([0.5,1.0,.1]);var b=Selector.new();b.configure(bad.next)
 var failed: Dictionary=b.roll_mods(3,0)
 check(failed.status=="NOT_READY" and failed.draws==2 and bad.cursor==2,"invalid mid-stream no clamp/retry")
 var ordered=Stream.new([0.0,.5,.7]);var prefix: Dictionary=Selector.constructor_prefix(0,false,ordered.purpose)
 check(prefix.status=="READY" and ordered.labels==["rollElite","rollMods_attack"] and ordered.cursor==2,"constructor labels and prefix ordering")
 check(ordered.next()==.7,"speed remains next RNG read")
 var excluded=Stream.new([])
 check(Selector.constructor_prefix(0,true,excluded.purpose).draws==0 and excluded.cursor==0,"boss/rare exclusion RNG0")
 check(Selector.apply_forced_constructor(null,"escort").status=="NOT_READY","null source postassignment failure explicit")
 var raw={"mhp":10,"mods":["M30"],"aura":"warCry","eShield":7}
 var before=raw.duplicate(true)
 check(Selector.apply_forced_constructor(raw,"gate_guard").status=="NOT_READY" and same(raw,before),"bad forced preflight writes0")
 var missing={"mods":["M29"],"modT":{"eliteBusy":5.0,"eliteCharge":539.0,"eliteRing":479.0}}
 check(Order.advance(missing,1,150,{"x":150,"y":0},null,null).status=="NOT_READY" and missing.modT.eliteBusy==5,"missing actual M29 consumer NOT_READY writes0")
 var unsupported={"mods":["M31"],"modT":{"eliteBusy":5.0,"eliteCharge":0.0,"eliteRing":0.0}}
 check(Order.advance(unsupported,1,150,{},null,null).status=="NOT_READY" and unsupported.modT.eliteBusy==5,"later chapter modifier never activated")
 # A helper belonging to another enemy must not mutate either lock.
 var actor=Owner.new();actor.mods=["M30"]
 var target=Target.new();var world=Node2D.new();var kernel=M30.new()
 var owned={"eliteBusy":5.0,"eliteRing":0.0,"eliteCharge":0.0}
 kernel.configure(actor,target,world,owned,profile)
 var foreign={"mods":["M30"],"modT":owned.duplicate()}
 check(Order.advance(foreign,1,150,{},null,kernel).status=="NOT_READY" and foreign.modT.eliteBusy==5 and owned.eliteBusy==5,"different enemy lock refused before writes")
 kernel.free();actor.free();target.free();world.free()
func finish() -> void:
 print("EL01_RESULT "+JSON.stringify({"assertions":checks,"failures":failures,"observations":observations}))
 quit(1 if failures else 0)
