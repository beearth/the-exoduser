extends SceneTree
## EC4-03: source-site projection only, not a common movement/attack writer.
const Policy = preload("res://scripts/native_ch4_enemy_erratic_policy.gd")
const Catalog = preload("res://scripts/native_ch4_enemy_catalog_policy.gd")
const USERDIR = "EXODUSER-ec4-03-Isolated-20261020"
const SOURCE_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const BLOCK_SHA256 = "b637fe161e3450717893a0231ee23b53f3941ab7158e0b4a82b89c7271b89587"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const i=raw.indexOf("  if(e.etype===50&&e.s==='idle'){"),j=raw.indexOf('  // ═══ 51:',i);
if(i<0||j<0)throw Error('source boundary');const block=raw.slice(i,j);
const c=vm.createContext({});vm.runInContext('Math.random=()=>sample();function tick(e,d,sp,_now){'+block+';return e}',c);
let used,trace,checks,values,allowed;
c.sample=()=>{if(used.length>=values.length)throw Error('unexpected RNG');const value=values[used.length];used.push(value);trace.push({kind:'rng',value});return value};
c.canMv=(x,y,r)=>{checks.push({x,y,r});trace.push({kind:'canMv',x,y,r,allowed});return allowed};
const clone=v=>JSON.parse(JSON.stringify(v));
const base=()=>({etype:50,s:'idle',x:10,y:-20,r:10,speed:2,facing:0,_erraticT:1,_erraticAng:0,untouched:{sentinel:[42]}});
const projection=e=>Object.fromEntries(['_erraticT','_erraticAng','s','_telegraphT','st2'].filter(k=>Object.hasOwn(e,k)).map(k=>[k,e[k]]));
let seed=20261020;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
function near(v,up){if(v===0)return up?Number.MIN_VALUE:-Number.MIN_VALUE;const b=Buffer.alloc(8);b.writeDoubleLE(v);b.writeBigUInt64LE(b.readBigUInt64LE()+((up===(v>0))?1n:-1n));return b.readDoubleLE()}
function run(e,context,input,permission,label){
 const actor=clone(e);c.e=clone(e);used=[];trace=[];checks=[];values=input.slice();allowed=permission;
 c.tick(c.e,context.d,context.sp,context.raw_now);
 return {actor,context,values,allow:permission,label,fields:projection(c.e),position:{x:c.e.x,y:c.e.y},commands:checks.map(p=>({kind:'move',site:'erratic',...p,allowed})),checks,trace,used,nextValue:values[used.length]};
}
const cases=[];
for(const r of [0,10,300]){
 const ds=[...new Set([0,...[50,250,30+r].flatMap(v=>[near(v,false),v,near(v,true)])])];
 for(const t of [-1,0,1,2])for(const sp of [0,1,34])for(const d of ds)for(const a of [true,false])for(const pattern of ['zero','upper','ordered','random']){
  const e=base();Object.assign(e,{r,_erraticT:t});
  const values=Array.from({length:8},(_,k)=>pattern==='zero'?0:pattern==='upper'?near(1,false):pattern==='ordered'?[.125,.875,.001,.975,.25,.75,.4,.6][k]:rnd());
  cases.push(run(e,{d,sp,raw_now:[0,1000,1e9,-1000][cases.length%4]},values,a,'strict-distance/timer-'+pattern));
 }
}
for(const sp of [0,.5,1,10,100/3,34]){
 const p=.03*sp;const us=[0,near(1,false),...[near(p,false),p,near(p,true)].filter(v=>v>=0&&v<1)];
 for(const u of [...new Set(us)])for(const a of [true,false]){const e=base();e._erraticT=1000;cases.push(run(e,{d:0,sp,raw_now:1000},[u,.725,.9,.1,.2],a,'strict-probability'))}
}
for(let k=0;k<20;k++)for(const u of [near(k/20,false),k/20,near(k/20,true)].filter(v=>v>=0&&v<1))for(const expired of [false,true]){
 const e=base();e._erraticT=expired?1:100;cases.push(run(e,{d:0,sp:1,raw_now:0},expired?[.125,.875,0,u,.7]:[0,u,.7,.8],true,'duration-int32-boundary'));
}
for(let k=0;k<800;k++){
 const e=base();Object.assign(e,{x:rnd()*2e6-1e6,y:rnd()*2e6-1e6,speed:rnd()*10,r:rnd()*300,facing:rnd()*12-6,_erraticT:rnd()*100-50,_erraticAng:rnd()*Math.PI*2});
 const ms=[undefined,null,false,true,0,-0,.25,1.5,-1];if(ms[k%ms.length]!==undefined)e._aSpdM=ms[k%ms.length];
 if(k%3===0){e._telegraphT=null;e.st2=null}else if(k%3===1){e._telegraphT=7;e.st2=19}
 cases.push(run(e,{d:rnd()*400,sp:rnd()*40,raw_now:rnd()*2e9-1e9},Array.from({length:8},rnd),rnd()<.5,'trigonometric'));
}
for(const s of ['windup','hurt','dead','eShootWind'])for(const t of [-1,0,1]){const e=base();Object.assign(e,{s,_erraticT:t,st2:null});cases.push(run(e,{d:0,sp:34,raw_now:1000},[.1,.2,.3,.4,.5],true,'non-idle'))}
const chains=[];
for(let k=0;k<8;k++){
 let e=base();e.r=0;e._erraticT=k;const chain=[];
 for(let n=0;n<40;n++){const row=run(e,{d:[49,50,250,300,200][n%5],sp:[.5,1,10][n%3],raw_now:n*1000/60+k},Array.from({length:8},rnd),n%3!==0,'chain');chain.push(row);e={...e,...row.fields,...row.position}}
 chains.push(chain);
}
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v}
fs.writeFileSync(process.argv[3],JSON.stringify({sha256:hash(raw),block_sha256:hash(block),transport:'원본 한글·UTF-8 🔥',count:cases.length+chains.flat().length,cases:pack(cases),chains:pack(chains)}),'utf8');
"""
class Stream extends RefCounted:
	var values: Array
	var used: Array = []
	var trace: Array
	var overflow: bool = false
	func _init(sequence: Array, events: Array = []) -> void:
		values = sequence.duplicate(true)
		trace = events
	func sample() -> Variant:
		if used.size() >= values.size():
			overflow = true
			return NAN
		var value: Variant = values[used.size()]
		used.append(value)
		trace.append({"kind":"rng","value":value})
		return value
class Collision extends RefCounted:
	var permission: Variant
	var calls: Array = []
	var trace: Array
	func _init(value: Variant, events: Array = []) -> void:
		permission = value
		trace = events
	func query(x: float,y: float,r: float) -> Variant:
		calls.append({"x":x,"y":y,"r":r})
		trace.append({"kind":"canMv","x":x,"y":y,"r":r,"allowed":permission})
		return permission
var policy: RefCounted = Policy.new()
var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
var source_sha: String = ""
var node_bin: String = ""
var geometry_scale: float = 1.0
var angle_scale: float = 1.0
var max_trig_error: float = 0.0
var max_trig_epsilon_units: float = 0.0
var audit: FileAccess
var source_ref: String = "G39510–39518; EC3-03 API/Draws contract"
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func _check(ok: bool,label: String) -> void:
	assertions += 1
	if audit != null:
		audit.store_line(JSON.stringify({"id":assertions,"source":source_ref,"label":label,"ok":ok}))
	if not ok:
		failures += 1
		printerr("EC4_03_FAIL ",label)
func _same(a: Variant,b: Variant,label: String,transcendental: bool = false) -> void:
	_check(_equal(a,b,transcendental),label+" actual="+str(a).left(220)+" expected="+str(b).left(220))
func _equal(a: Variant,b: Variant,transcendental: bool = false,coordinate: String = "") -> bool:
	if (a is float or a is int) and (b is float or b is int):
		if not transcendental:
			return PackedFloat64Array([float(a)]).to_byte_array() == PackedFloat64Array([float(b)]).to_byte_array()
		# Forward absolute error is scaled by INPUT coordinates/displacement,
		# not the final XY: subtractive cancellation can make output near zero.
		# Angle uses a dimensionless bound, including propagated XY error on re-aim.
		var scale: float = maxf(angle_scale,maxf(absf(a),absf(b))) if coordinate == "angle" else geometry_scale
		var error: float = absf(float(a)-float(b))
		max_trig_error = maxf(max_trig_error,error)
		max_trig_epsilon_units = maxf(max_trig_epsilon_units,error/(2.220446049250313e-16*scale))
		return error <= 8.0*2.220446049250313e-16*scale
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size():
			return false
		for key in b:
			if not a.has(key) or not _equal(a[key],b[key],transcendental and key in ["x","y","angle"],str(key)):
				return false
		return true
	if a is Array and b is Array:
		if a.size() != b.size():
			return false
		for i in range(a.size()):
			if not _equal(a[i],b[i],transcendental,coordinate):
				return false
		return true
	return typeof(a) == typeof(b) and a == b
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC4_03_INVALID_ISOLATION")
		quit(2)
		return
	DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir())
	audit = FileAccess.open(OS.get_user_data_dir().path_join("ec4-03-assertions.jsonl"),FileAccess.WRITE)
	_check(audit != null,"assertion evidence writable")
	_check(not node_bin.is_empty(),"explicit --node-bin required")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		for row in oracle.cases:
			_compare(row)
		_check(oracle.chains.size() == 8,"source chains complete")
		for chain in oracle.chains:
			var state: Dictionary = chain[0].actor.duplicate(true)
			var budget: float = 0.0
			_check(chain.size() == 40,"source chain length40")
			for row in chain:
				budget += absf(float(state.speed)*float(row.context.sp))
				state = _compare(row,state,budget)
	_golden()
	_diagnostics()
	print("EC4_03_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"source_sha256":source_sha,"skipped":[],"max_trig_absolute_error":max_trig_error,"max_trig_epsilon_units":max_trig_epsilon_units,"full_tick":false,"product_connected":false}))
	if audit != null:
		audit.close()
	quit(0 if failures == 0 and oracle_cases == 4174 else 1)
func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec4-03-source-oracle.cjs")
	var receipt: String = OS.get_user_data_dir().path_join("ec4-03-source-oracle.json")
	_check(FileAccess.file_exists(source) and not FileAccess.file_exists(helper) and not FileAccess.file_exists(receipt),"source/no temporary overwrite")
	if failures > 0:
		return {}
	source_sha = FileAccess.get_sha256(source)
	_check(source_sha == SOURCE_SHA256,"latest main source pin")
	if failures > 0:
		return {}
	_check(DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir()) == OK,"isolated directory")
	var file: FileAccess = FileAccess.open(helper,FileAccess.WRITE)
	_check(file != null,"temporary helper UTF8")
	if file == null:
		return {}
	file.store_string(SOURCE_PROBE)
	file.close()
	var output: Array = []
	var code: int = OS.execute(node_bin,PackedStringArray([helper,source,receipt]),output,true)
	_check(code == 0,"source probe exit0: "+"\n".join(output).left(600))
	var data: Variant = JSON.parse_string(FileAccess.get_file_as_string(receipt)) if FileAccess.file_exists(receipt) else null
	_check(DirAccess.remove_absolute(helper) == OK,"helper removed")
	_check(DirAccess.remove_absolute(receipt) == OK,"UTF8 receipt removed")
	_check(data is Dictionary and data.get("cases",[]).size() == 3854 and data.get("count") == 4174,"structured source oracle")
	if not data is Dictionary:
		return {}
	_check(data.sha256 == source_sha and data.block_sha256 == BLOCK_SHA256,"G39510–39518 original source/block pins")
	_check(data.get("transport") == "원본 한글·UTF-8 🔥","UTF-8 Korean/emoji receipt")
	return _unpack(data)
func _unpack(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size() == 1 and value.has("$f64"):
			return Marshalls.base64_to_raw(value["$f64"]).decode_double(0)
		var result: Dictionary = {}
		for key in value:
			result[key] = _unpack(value[key])
		return result
	if value is Array:
		var result: Array = []
		for item in value:
			result.append(_unpack(item))
		return result
	return value

func _compare(row: Dictionary, override_actor: Dictionary = {}, chain_budget: float = 0.0) -> Dictionary:
	oracle_cases += 1
	source_ref = "G39510–39518 / "+row.label+" / case"+str(oracle_cases)
	var actor: Dictionary = row.actor.duplicate(true) if override_actor.is_empty() else override_actor.duplicate(true)
	var before: Dictionary = actor.duplicate(true)
	var context: Dictionary = row.context.duplicate(true)
	var raw: Variant = actor.get("_aSpdM")
	var m: float = 1.0 if raw == null or (raw is bool and not raw) or ((raw is int or raw is float) and float(raw) == 0.0) else float(raw)
	geometry_scale = maxf(1.0,maxf(absf(actor.x),maxf(absf(actor.y),absf(float(actor.speed)*m*float(context.sp))+chain_budget)))
	_same(actor,row.actor,"sequential source input; XY forward error only",true)
	var trace: Array = []
	var stream := Stream.new(row["values"],trace)
	var collision := Collision.new(row.allow,trace)
	var result: Dictionary = policy.step(actor,context,stream.sample,collision.query)
	_check(result.status == "READY","source case ready")
	if result.status != "READY":
		return actor
	_same(result.fields,row.fields,"G39511/39512/39518 exact fields including absent/null")
	_same(result.position,row.position,"G39514–39516 projected XY",true)
	_same(result.commands,row.commands,"G39516 ordered move request",true)
	_same(collision.calls,row.checks,"G39516 canMv XY/r arguments",true)
	_same(trace,row.trace,"G39512/39516/39518 RNG/canMv interleaving",true)
	_same(stream.used,row.used,"exact consumed RNG samples")
	_check(result.draws == row.used.size() and not stream.overflow,"actual draw count and no overconsumption")
	_same(actor,before,"actor immutable")
	_same(context,row.context,"context immutable")
	_same(stream.values,row["values"],"provider input immutable")
	_check(not result.full_tick and not result.product_connected,"no common tail or actual writer")
	_same(stream.sample(),row.nextValue,"owner next RNG sentinel untouched")
	actor.merge(result.fields,true)
	actor.merge(result.position,true)
	return actor
func _actor() -> Dictionary:
	return {"etype":50,"s":"idle","x":0.0,"y":0.0,"speed":2.0,"r":10.0,"facing":0.0,"_erraticT":1.0,"_erraticAng":0.0}
func _context(d: float = 100.0,sp: float = 1.0,raw_now: float = 0.0) -> Dictionary:
	return {"d":d,"sp":sp,"raw_now":raw_now}
func _golden() -> void:
	source_ref = "G31300 EC4-02 + G39511–39518 exact golden"
	var trace: Array = []
	var stream := Stream.new([0.25,0.5,0.125,0.75,0.0,0.95,0.42],trace)
	var init: Dictionary = Catalog.new().build({"stage":14,"etype":50},stream.sample)
	_same([init.fields._erraticT,init.fields._erraticAng],[37.5,PI],"initializer timer then angle")
	var e: Dictionary = _actor()
	e.merge(init.fields,true)
	e._erraticT = 1.0
	var collision := Collision.new(false,trace)
	var r: Dictionary = policy.step(e,_context(0.0),stream.sample,collision.query)
	_same(r.fields,{"_erraticT":52.5,"_erraticAng":PI*0.25,"s":"windup","_telegraphT":20,"st2":29},"expiry angle then timer then probability then duration")
	_same(r.position,{"x":0.0,"y":0.0},"blocked movement still attacks")
	_same(stream.used,[0.25,0.5,0.125,0.75,0.0,0.95],"shared stream initialization+step, no reseed")
	_same(stream.sample(),0.42,"shared owner tail")
	e = _actor()
	e._erraticT = 20.0
	e.facing = PI*0.5
	geometry_scale = 2.0
	r = policy.step(e,_context(50.0),Stream.new([0.0]).sample,Collision.new(true).query)
	_same(r.position,{"x":0.0,"y":2.0},"d50 uses facing+raw time sine, not erratic angle",true)
	r = policy.step(e,_context(250.0),Stream.new([0.0]).sample,Collision.new(true).query)
	_check(r.commands.is_empty() and r.draws == 0 and r.fields._erraticT == 19,"d250 excludes movement, timer still decrements")
	r = policy.step(e,_context(40.0),Stream.new([0.0]).sample,Collision.new(true).query)
	_check(r.draws == 0 and r.fields.s == "idle","d==30+r excludes even probability draw")
	r = policy.step(e,_context(0.0,0.0),Stream.new([0.0,0.5]).sample,Collision.new(true).query)
	_check(r.draws == 1 and r.fields.s == "idle","sp0 near consumes probability but strict0<0 false")
	r = policy.step(e,_context(0.0,34.0),Stream.new([0.0,0.5,0.999,0.0]).sample,Collision.new(false).query)
	_check(r.draws == 4 and r.fields.s == "windup" and r.fields.st2 == 10,"probability above1 not clamped or retried")
func _diagnostics() -> void:
	source_ref = "EC3-03 read-only callback/API guard; G39511–39518 literal draw sites"
	for offset in range(4):
		for bad in [null,true,false,"0",-0.1,1.0,NAN,INF,-INF]:
			var values: Array = []
			values.resize(offset)
			values.fill(0.0)
			var stream := Stream.new(values+[bad,0.9])
			var collision := Collision.new(true)
			var e: Dictionary = _actor()
			var before: Dictionary = e.duplicate(true)
			var r: Dictionary = policy.step(e,_context(0.0),stream.sample,collision.query)
			_check(r.status == "NOT_READY" and r.reason == "invalid_random_sample" and r.draws == offset+1,"bad RNG at each of four literal sites")
			_check(not r.has("fields") and not r.has("commands") and stream.used.size() == offset+1 and not stream.overflow,"no partial receipt/extra sample")
			_check(collision.calls.size() == (0 if offset < 2 else 1),"late RNG failure keeps prior read-only collision count")
			_same(e,before,"failure leaves actor unchanged")
	var stream := Stream.new([0.5])
	var collision := Collision.new(true)
	for key in ["x","y","speed","r","facing","_erraticT","_erraticAng"]:
		for bad in [null,true,"1",NAN,INF,-INF]:
			var e: Dictionary = _actor()
			e[key] = bad
			var r: Dictionary = policy.step(e,_context(),stream.sample,collision.query)
			_check(r.status == "NOT_READY" and r.draws == 0,"bad finite actor "+key)
	for key in ["d","sp","raw_now"]:
		for bad in [null,true,"1",NAN,INF,-INF]:
			var c: Dictionary = _context()
			c[key] = bad
			_check(policy.step(_actor(),c,stream.sample,collision.query).status == "NOT_READY","bad context "+key)
	for etype in [0,40,49,51,59,50.5,true]:
		var e: Dictionary = _actor()
		e.etype = etype
		_check(policy.step(e,_context(),stream.sample,collision.query).reason == "unsupported_etype","no other etype admission")
	for bad in ["bad",[],{},NAN,INF]:
		var e: Dictionary = _actor()
		e._aSpdM = bad
		_check(policy.step(e,_context(),stream.sample,collision.query).reason == "invalid_speed_multiplier","explicit finite/boolean/null multiplier domain")
	_check(stream.used.is_empty() and collision.calls.is_empty(),"invalid inputs have no callbacks")
	_check(policy.step(_actor(),_context(),Callable(),collision.query).reason == "invalid_random_callable","missing RNG binding")
	_check(policy.step(_actor(),_context(),stream.sample,Callable()).reason == "invalid_can_move_callable","missing canMv binding")
	for bad in [null,0,1,"yes"]:
		var rng := Stream.new([0.125,0.75,0.0,0.5])
		var r: Dictionary = policy.step(_actor(),_context(0.0),rng.sample,Collision.new(bad).query)
		_check(r.status == "NOT_READY" and r.reason == "invalid_can_move_result" and r.draws == 2 and not r.has("commands"),"invalid canMv after two refresh draws; attack not evaluated")
	for c in [_context(-1.0),_context(0.0,-1.0)]:
		_check(policy.step(_actor(),c,stream.sample,collision.query).reason == "negative_geometry_or_step","negative geometry/step rejected")
	var e: Dictionary = _actor()
	e.r = -1
	_check(policy.step(e,_context(),stream.sample,collision.query).reason == "negative_geometry_or_step","negative radius")
	e = _actor()
	e._erraticT = 1000.0 # Isolate overflow from the earlier timer/RNG branch.
	e.speed = 1e308
	e._aSpdM = 100.0
	_check(policy.step(e,_context(),stream.sample,collision.query).reason == "nonfinite_move","overflow projection rejected before callback")

	_check(stream.used.is_empty() and collision.calls.is_empty(),"overflow fixture has no refresh RNG or collision callback")

	e = _actor()
	e._erraticT = -9000000000000000000
	var huge: Dictionary = policy.step(e,{"d":300,"sp":9000000000000000000,"raw_now":0},Stream.new([0.125,0.75]).sample,Collision.new(true).query)
	_check(huge.status == "READY" and huge.draws == 2 and huge.fields._erraticT == 52.5,"G39511 integer inputs use JS double subtraction, no Int64 wrap")
