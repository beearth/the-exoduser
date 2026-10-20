extends RefCounted
## DEMO11-19r. Allocation transaction; derived writes only through PC Main API.
const POINT = preload("res://scripts/native_meta_point_policy.gd")
const QUEUE = preload("res://scripts/native_meta_passive_queue.gd")
const BOOT = preload("res://port_modules/native_new_run_bootstrap_source/producer.gd")
const CAPS := {"str":500,"dex":500,"int":500,"vit":500,"lck":500} # G27697
const READBACK := ["hp","mhp","st","mst","mp","mmp","shield","mshield","hpR","stR","mpR","speed","_oocSpeed","baseDef","baseAtk","maxPoise","poise","poiseR","_effStats","_crystalStats"]
var _main: WeakRef
var _state: WeakRef
var _busy := false
var _last: Dictionary = {}
func configure(main: Node,state: Node) -> void:
 _main=weakref(main)
 _state=weakref(state)
func is_busy() -> bool:return _busy
static func definitions() -> Array:
 # All 26 original PASSIVE_DEF rows G27699-27726 have max10. Canonical keys
 # come from the existing bootstrap, never from arbitrary restored extra keys.
 var result: Array=[]
 for key in BOOT.source_boot_passives()["values"]:result.append({"key":key,"max":10})
 return result
func snapshot() -> Dictionary:
 var main: Node=_main.get_ref()
 var state: Node=_state.get_ref()
 var raw: Object=main.source_providers.get_provider("raw_grit")
 var p: Dictionary=state.read_current_p()
 return {"stats":state.read_current_stats().duplicate(true),"passives":state.read_current_passives().duplicate(true),
  "grit":raw.read_raw().raw,"sp":p.sp,"ap":p.get("ap",0),"queue":QUEUE.items(p.get("_passiveQueue"),state.read_current_passives()),
  "raw_queue":p.get("_passiveQueue"),"queue_present":p.has("_passiveQueue")}.duplicate(true)
func last_receipt() -> Dictionary:return _last.duplicate(true)
func _reject(reason: String) -> Dictionary:return {"applied":false,"status":"REJECTED","reason":reason,"unchanged":true}
func _assign(value: Dictionary, preserve_raw_queue: bool=false) -> void:
 var main: Node=_main.get_ref()
 var state: Node=_state.get_ref()
 var stats: Dictionary=state.read_current_stats()
 var passives: Dictionary=state.read_current_passives()
 var p: Dictionary=state.read_current_p()
 stats.clear();stats.merge(value.stats,true)
 passives.clear();passives.merge(value.passives,true)
 p.sp=value.sp;p.ap=value.ap
 main.source_providers.get_provider("raw_grit").current_container()["_grit"]=value.grit
 if preserve_raw_queue:
  if value.queue_present:p["_passiveQueue"]=value.raw_queue.duplicate(true) if value.raw_queue is Array else value.raw_queue
  else:p.erase("_passiveQueue")
 else:p["_passiveQueue"]=value.queue.duplicate(true)
func _derived() -> Dictionary:
 var result: Dictionary={}
 var p: Dictionary=_state.get_ref().read_current_p()
 for key in READBACK:result[key]=p.get(key)
 return result.duplicate(true)
func _receipt_valid(receipt: Dictionary) -> bool:
 if receipt.get("status")!="READY" or receipt.get("ready")!=true or receipt.get("committed")!=true or receipt.get("free_refill")!=false:return false
 var current:=_derived()
 if receipt.get("after")!=current:return false
 var fields: Variant=receipt.get("committed_fields")
 if not fields is Dictionary:return false
 for owner in ["actor","resources","state"]:
  if not fields.get(owner) is Array or fields[owner].is_empty():return false
  for field in fields[owner]:
   if not current.has(field) or not receipt.after.has(field):return false
 return true
func execute(command: Dictionary) -> Dictionary:
 if _busy:return _reject("growth_reentrant")
 var before:=snapshot()
 var next:=before.duplicate(true)
 var action: String=str(command.get("action",""))
 var key: Variant=command.get("key")
 var amount: Variant=command.get("amount")
 var refresh:=false
 var invested:=0
 var value: Variant=null
 var defs:=definitions()
 match action:
  "stat":
   if key not in ["str","dex","int","lck","grit"]:return _reject("stat_key")
   value=POINT.stat_change(float(before.grit if key=="grit" else before.stats[key]),INF if key=="grit" else float(CAPS[key]),float(before.sp),amount)
   if value==null:return _reject("stat_change")
   if key=="grit":next.grit=value.value
   else:next.stats[key]=value.value
   next.sp=value.points;refresh=true
  "passive":
   if not key is String or not BOOT.source_boot_passives()["values"].has(key):return _reject("passive_key")
   value=POINT.passive_change(float(before.passives[key]),10,float(before.ap),amount)
   if value==null:return _reject("passive_change")
   next.passives[key]=value.value;next.ap=value.points;refresh=true
  "plan":
   value=POINT.evaluate_plan(command.get("plan"),before,CAPS,defs)
   if value==null or value.changes==0:return _reject("stale_or_empty_plan")
   next.merge(value,true)
   next.queue=[]
   for queue_key in before.queue:
    if next.passives[queue_key]>=before.passives[queue_key]:next.queue.append(queue_key)
   var queued: Dictionary=QUEUE.process(next.queue,next.passives,float(next.ap),defs)
   next.queue=queued.queue;next.passives=queued.passives;next.ap=queued.ap;invested=int(queued.invested)
   refresh=true
  "reset":
   var totals: Dictionary=POINT.refund_totals(before.stats,before.passives,float(before.grit))
   if totals.sp==0 and totals.ap==0:return _reject("no_allocations")
   for k in next.stats:next.stats[k]=0
   for k in next.passives:next.passives[k]=0
   next.grit=0;next.sp+=totals.sp;next.ap+=totals.ap;refresh=true
  "queue_add":
   value=QUEUE.enqueue(before.raw_queue,before.passives,defs,key,amount)
   if value==null:return _reject("queue_add")
   next.queue=value
  "queue_cancel":
   value=QUEUE.cancel(before.raw_queue,before.passives,command.get("index"))
   if value==null:return _reject("queue_cancel")
   next.queue=value
  "process_queue":
   var queued: Dictionary=QUEUE.process(before.raw_queue,before.passives,float(before.ap),defs)
   next.queue=queued.queue;next.passives=queued.passives;next.ap=queued.ap
   invested=int(queued.invested);refresh=queued.recalculation_required
  _:return _reject("growth_action")
 _busy=true
 var derived_before:=_derived()
 # Direct stat/passive/reset source callbacks do not sanitize or change queue.
 var keep_raw: bool=action in ["stat","passive","reset"]
 _assign(next,keep_raw)
 var receipt: Dictionary={}
 if refresh:
  receipt=_main.get_ref().request_native_runtime_stat_refresh("apply_stats","growth:"+action)
  if not _receipt_valid(receipt):
   _assign(before,true)
   var unchanged: bool=_derived()==derived_before and snapshot()==before
   _busy=false
   _last={"applied":false,"status":"NOT_READY" if unchanged else "INCONSISTENT","reason":receipt.get("reason","refresh_readback_invalid"),"unchanged":unchanged,"refresh":receipt.duplicate(true)}
   return _last.duplicate(true)
 _busy=false
 _last={"applied":true,"status":"READY","reason":"","action":action,"invested":invested,"refresh":receipt.duplicate(true),"after":snapshot(),"save_requested":action!="process_queue","save_committed":false}
 return _last.duplicate(true)
