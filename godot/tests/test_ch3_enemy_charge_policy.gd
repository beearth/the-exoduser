extends SceneTree
## Original JS trigger and common FSM oracle, UTF-8 receipt, explicit Node.
const Policy = preload("res://scripts/native_ch3_enemy_charge_policy.gd")
const Common = preload("res://scripts/enemy_mod_m29.gd")
const USERDIR = "EXODUSER-ec3-06-Isolated-20261020"
const SOURCE_SHA = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const PROBE = r"""
const fs=require('node:fs'),readline=require('node:readline'),crypto=require('node:crypto'),vm=require('node:vm');
(async()=>{
 const lines=[];let n=0;const hash=crypto.createHash('sha256');
 const stream=fs.createReadStream(process.argv[2]);stream.on('data',x=>hash.update(x));
 for await(const line of readline.createInterface({input:stream,crlfDelay:Infinity})){++n;if(n>=39358&&n<=39365||n>=40519&&n<=40538)lines.push([n,line]);}
 const block=lines.filter(x=>x[0]<=39365).map(x=>x[1]).join('\n')+'\n';
 const common=lines.filter(x=>x[0]>=40519).map(x=>x[1]).join('\n');
 const pin=crypto.createHash('sha256').update(block).digest('hex');
 if(pin!=='c396cb68e2edc032eb901bec516199144d18e6649b714b62859a362461f91793')throw Error('trigger source pin changed');
 const clone=x=>structuredClone(x), rows=[],steps=[];
 const run=new vm.Script('(function(){'+block+'})()');
 for(const s of ['idle','stun','eChargeWind'])for(const t of [-2,0,.25,1,2.5])for(const sp of [0,.25,1,2.5])for(const d of [0,30-2**-40,30,30+2**-40,100,1200-2**-30,1200,1200+2**-30])for(const clear of [false,true])for(const r of [0,14,30]){
  const actor={etype:43,ib:false,s,x:16,y:-8,r,atk:10,el:3,col:'#882211',_ddLungeT:t,_ddLungeCd:95,st2:77,echDx:0,echDy:1,facing:1,_chgVisLen:321,modT:{eliteBusy:77},sentinel:[7,8]};
  const e=clone(actor),P={x:116,y:-8},calls=[],commands=[];
  run.runInNewContext({e,P,sp,d,Math,_chgPathClear:(view,len)=>{calls.push({actor:clone(view),length:len});return clear},_T:x=>x,addTxt:(x,y,text,col,life)=>commands.push({kind:'text',x,y,text,col,life}),SFX:{charge:()=>commands.push({kind:'sfx_charge'})}});
  rows.push({actor,player:P,sp,d,clear,expected:e,calls,commands});
 }
 const runCommon=new vm.Script('(function(){e.st2-=sp;switch(e.s){'+common+'}})()');
 for(const s of ['eChargeWind','eCharge'])for(const st2 of [90,68.95,67.95,67.95-2**-40,67.95+2**-40,1,0])for(const sp of [0,1,.25])for(const blocked of [false,true]){
  const actor={etype:43,ib:false,s,x:0,y:0,r:14,atk:10,el:3,col:'#882211',_ddLungeT:95,_ddLungeCd:95,st2,echDx:0,echDy:1,facing:1,_chgVisLen:321,_chgAimMax:90,_chgDur:15,_chgSpd:42,_chgLen:644};
  const e=clone(actor),P={x:1000,y:0,r:15,iframes:100,s:'idle'},moves=[];
  const math=Object.create(Math);math.random=()=>1;
  runCommon.runInNewContext({e,P,sp,Math:math,isW:()=>false,canMv:(x,y,r)=>{moves.push([x,y,r]);return !blocked},dst:(x,y,a,b)=>Math.hypot(x-a,y-b),poolPart:()=>{}});
  steps.push({actor,player:P,sp,blocked,expected:e,moves});
 }
 const encode=x=>{if(typeof x==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(x);return {'$f64':b.toString('base64')}}if(Array.isArray(x))return x.map(encode);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,encode(v)]));return x};
 fs.writeFileSync(process.argv[3],JSON.stringify(encode({source_sha256:hash.digest('hex'),block_sha256:pin,common_sha256:crypto.createHash('sha256').update(common).digest('hex'),rows,steps})),'utf8');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
"""
var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
var common_cases: int = 0
var node_bin: String = ""
var policy = Policy.new()
class PathProbe extends RefCounted:
	var calls: Array = []
	var clear: bool = true
	func check(view: Dictionary, length: float) -> bool:
		calls.append({"actor":view.duplicate(true),"length":length})
		view._ddLungeT = 9999 # detached view, never a writer into policy input
		return clear
class Movement extends RefCounted:
	var calls: Array = []
	var blocked: bool = false
	func check(x: float,y: float,r: float) -> bool:
		calls.append([x,y,r])
		return not blocked
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func _check(ok: bool,label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("EC3_06_FAIL ",label)
func _same(a: Variant,b: Variant,label: String) -> void:
	_check(_equal(a,b),label)
func _equal(a: Variant,b: Variant) -> bool:
	if (a is float or a is int) and (b is float or b is int):
		return float(a) == float(b)
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size(): return false
		for key in b:
			if not a.has(key) or not _equal(a[key],b[key]): return false
		return true
	if a is Array and b is Array:
		if a.size() != b.size(): return false
		for i in range(a.size()):
			if not _equal(a[i],b[i]): return false
		return true
	return typeof(a) == typeof(b) and a == b
func _decode(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size() == 1 and value.has("$f64"):
			return Marshalls.base64_to_raw(value["$f64"]).decode_double(0)
		var result: Dictionary = {}
		for key in value: result[key] = _decode(value[key])
		return result
	if value is Array:
		var result: Array = []
		for item in value: result.append(_decode(item))
		return result
	return value
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC3_06_INVALID_ISOLATION")
		quit(2)
		return
	_check(not node_bin.is_empty(),"explicit --node-bin required")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		for row in oracle.rows: _compare_trigger(row)
		for row in oracle.steps: _compare_common(row)
		_diagnostics(oracle.rows[0].actor)
	print("EC3_06_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"trigger_cases":oracle_cases,"common_cases":common_cases,"tolerance":0,"skipped":[],"product_connected":false}))
	quit(0 if failures == 0 and oracle_cases > 0 and common_cases > 0 else 1)
func _oracle() -> Dictionary:
	var helper: String = OS.get_user_data_dir().path_join("ec3-06-source-oracle.cjs")
	var receipt: String = OS.get_user_data_dir().path_join("ec3-06-source-oracle.json")
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	_check(not FileAccess.file_exists(helper) and not FileAccess.file_exists(receipt),"no temporary overwrite")
	if failures > 0: return {}
	_check(DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir()) == OK,"isolated directory")
	var file: FileAccess = FileAccess.open(helper,FileAccess.WRITE)
	_check(file != null,"UTF8 helper")
	if file == null: return {}
	file.store_string(PROBE)
	file.close()
	var output: Array = []
	var code: int = OS.execute(node_bin,PackedStringArray([helper,source,receipt]),output,true)
	_check(code == 0,"source oracle exit0: "+"\n".join(output).left(600))
	var data: Variant = JSON.parse_string(FileAccess.get_file_as_string(receipt)) if FileAccess.file_exists(receipt) else null
	_check(DirAccess.remove_absolute(helper) == OK,"helper removed")
	_check(DirAccess.remove_absolute(receipt) == OK,"receipt removed")
	_check(data is Dictionary and data.get("rows",[]).size() == 2880 and data.get("steps",[]).size() == 84,"source case census")
	if not data is Dictionary: return {}
	_check(data.source_sha256 == SOURCE_SHA,"latest main full source SHA (streaming)")
	_check(data.block_sha256 == "c396cb68e2edc032eb901bec516199144d18e6649b714b62859a362461f91793" and data.common_sha256 == "81078d9bf859d5899e7c3ac7f760776673766d39c576e3dbcbdee923b02f2073","trigger/common exact source block pins")
	return _decode(data)
func _compare_trigger(row: Dictionary) -> void:
	oracle_cases += 1
	var input: Dictionary = row.actor.duplicate(true)
	input.etype = int(input.etype)
	var snapshot: Dictionary = input.duplicate(true)
	var clock: Dictionary = policy.advance_trigger_clocks(input,row.sp)
	_check(clock.status == "READY","clock ready")
	if clock.status != "READY": return
	_same(clock.idle_entered,input.s == "idle","outer idle admission once")
	var probe = PathProbe.new()
	probe.clear = row.clear
	var result: Dictionary = policy.plan_triggers(clock.actor,row.player,row.d,clock.idle_entered,probe.check)
	_check(result.status == "READY","trigger ready")
	if result.status != "READY": return
	_same(result.actor,row.expected,"G39358-65 actor exact "+str(oracle_cases))
	_same(result.commands,row.commands,"G39363-64 command order")
	_same(probe.calls,row.calls,"short-circuit path length/reset order")
	_same(input,snapshot,"caller snapshot immutable")
	_same(result.product_connected,false,"receipt is not product writer")
	# Do not seed or tick shared M29 modT, nor erase cached _chgVisLen.
	_same(result.actor.modT,snapshot.modT,"elite lock untouched")
func _compare_common(row: Dictionary) -> void:
	common_cases += 1
	var actor: Dictionary = row.actor.duplicate(true)
	var movement = Movement.new()
	movement.blocked = row.blocked
	var common = Common.new()
	_check(common.configure({"can_move":movement.check,"is_wall":func(_x: float,_y: float) -> bool: return false,"element_multiplier":func(_el: Variant) -> float: return 1.0}),"existing common configured")
	var result: Dictionary = common.step_charge(actor,row.sp,row.player,true)
	_same(result.error,"","common no error")
	_same(actor,row.expected,"G40519-38 existing common exact "+str(common_cases))
	_same(movement.calls,row.moves,"existing common canMv calls")
func _diagnostics(base: Dictionary) -> void:
	var a: Dictionary = base.duplicate(true)
	a.etype = 43
	a.s = "idle"
	a._ddLungeT = 0.0
	var p: Dictionary = {"x":116.0,"y":-8.0}
	_same(policy.plan_triggers(a,p,100,true,Callable()).reason,"source_path_clear_unbound","due missing source predicate halts")
	for d in [30.0,1200.0]:
		_same(policy.plan_triggers(a,p,d,true,Callable()).status,"READY","strict distance short circuit")
	a._ddLungeT = 1.0
	_same(policy.plan_triggers(a,p,100,true,Callable()).status,"READY","positive timer short circuit")
	a._ddLungeT = 0.0
	_same(policy.plan_triggers(a,p,100,false,Callable()).status,"READY","idle entry false short circuit")
	_same(policy.plan_triggers(a,p,100,true,func(_v: Dictionary,_l: float) -> Variant: return 1).reason,"invalid_source_path_clear_result","predicate bool contract")
	for etype in [29,42,44]:
		a.etype = etype
		_same(policy.advance_trigger_clocks(a,1).reason,"unsupported_etype","dedicated43 admission")
	a.etype = 43
	for ticks in [-1.0,INF,NAN]:
		_same(policy.advance_trigger_clocks(a,ticks).reason,"invalid_elapsed_ticks","invalid tick halted")
	for key in ["x","y","r","_ddLungeT","_ddLungeCd"]:
		var missing: Dictionary = a.duplicate(true)
		missing.erase(key)
		_check(policy.advance_trigger_clocks(missing,1).status == "NOT_READY","missing actual field "+key)
	# Enter from this adapter, consume the SAME tick exactly once in common.
	var triggered: Dictionary = policy.plan_triggers(a,p,100,true,func(_v: Dictionary,_l: float) -> bool: return true)
	var entered: Dictionary = triggered.actor
	var common = Common.new()
	common.configure({"can_move":func(_x: float,_y: float,_r: float) -> bool: return true,"is_wall":func(_x: float,_y: float) -> bool: return false,"element_multiplier":func(_el: Variant) -> float: return 1.0})
	common.step_charge(entered,1,p,true)
	_same(entered.st2,89.0,"same-tick owner common decrement once")
	_same(entered._chgDur,15,"43 duration not M29 18")
	_same(entered._chgSpd,42,"43 speed not M29 32")
	_same(entered._chgLen,630.0+float(a.r),"43 length not M29 640+r")
