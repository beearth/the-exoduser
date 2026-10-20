extends SceneTree
const Policy = preload("res://scripts/native_ch3_enemy_phase_policy.gd")
const Catalog = preload("res://scripts/native_ch3_enemy_catalog_policy.gd")
const USERDIR = "EXODUSER-ec3-03-Isolated-20261020"
const SOURCE_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const BLOCK_SHA256 = "c4e332b65a6b554dab5e23e1f688b1506cafbfc9cd6b6d8b8352cb4366874b95"
const HURT_SHA256 = "45b2a3771bf13a71a006f7c21368e51d0513893837671756add66718c406c7c7"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8'), hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const start=raw.indexOf("  if(e.etype===40&&e.s==='idle'){");const end=raw.indexOf('  // ── 41:',start);
if(start<0||end<0)throw Error('block boundaries');const block=raw.slice(start,end);
const hurt='  if(e.etype===40&&e._wraithPhasing){return;}';if(!raw.includes(hurt))throw Error('hurt boundary');
const c=vm.createContext({});vm.runInContext('Math.random=()=>sample();function tick(e,P,d,sp){'+block+';return e}function hurtGate(e){'+hurt+';return "continue"}',c);
let seed=20261020;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const nearby=(x,inc)=>{const b=Buffer.alloc(8);b.writeDoubleLE(x);b.writeBigUInt64LE(b.readBigUInt64LE()+(inc?1n:-1n));return b.readDoubleLE()};
let events,used,checks,allow;
c.sample=()=>{if(used.length)throw Error('unexpected second RNG');used.push(c.u);return c.u};
c.canMv=(x,y,r)=>{const allowed=allow[checks.length]??true;const v={kind:'move',site:c.e._wraithPhasing?'phase':'ordinary',x,y,r,allowed};checks.push([x,y,r]);events.push(v);return allowed};
c._T=x=>x;c.addTxt=(x,y,text_key,col,life)=>events.push({kind:'addTxt',x,y,text_key,col,life});
c.addParts=(x,y,col,count)=>events.push({kind:'addParts',x,y,col,count});
c.eProjAt=(e,angle,speed,dmg_mul,el,life,col,size)=>events.push({kind:'eProjAt',angle,speed,dmg_mul,...(el===undefined?{}:{el}),life,col,size});
function run(actor,context,u,permissions,label){
 const before=JSON.parse(JSON.stringify(actor));c.e=JSON.parse(JSON.stringify(actor));events=[];used=[];checks=[];allow=permissions;c.u=u;
 c.tick(c.e,{x:context.px,y:context.py},context.d,context.sp);
 return {actor:before,context,u,allow:permissions,label,fields:{_wraithPhaseT:c.e._wraithPhaseT,_wraithPhasing:c.e._wraithPhasing},position:{x:c.e.x,y:c.e.y},commands:events,checks,used,hurt_before:c.hurtGate(before)!=='continue',hurt_after:c.hurtGate(c.e)!=='continue'};
}
const base=()=>({etype:40,s:'idle',x:10,y:20,speed:2,r:10,_wraithPhaseT:5,_wraithPhaseCd:260,_wraithPhasing:false,el:2,untouched:{sentinel:[42]}});
const cases=[];
const ds=[0,nearby(30,false),30,nearby(30,true),nearby(50,false),50,nearby(50,true),nearby(1200,false),1200,nearby(1200,true)];
for(const t of [-61,-60,0,1,2,60])for(const sp of [0,1,65])for(const phase of [false,true])for(const d of ds)for(const a of [[true,true],[false,true],[true,false],[false,false]]){
 const e=base();e._wraithPhaseT=t;e._wraithPhasing=phase;
 cases.push(run(e,{d,sp,px:100,py:20},[0,.5,1-Number.EPSILON/2][cases.length%3],a,'axes-boundary'));
}
for(let i=0;i<600;i++){
 const e=base();e.x=rnd()*200-100;e.y=rnd()*200-100;e.speed=rnd()*10;e.r=rnd()*30;e._wraithPhaseT=rnd()*120-60;e._wraithPhasing=rnd()<.5;e._wraithPhaseCd=rnd()*300;
 const ms=[undefined,null,false,true,0,.25,1.5,-1];const m=ms[i%ms.length];if(m!==undefined)e._aSpdM=m;
 if(i%3===0)delete e.el;else if(i%3===1)e.el=null;
 cases.push(run(e,{d:rnd()*1250,sp:rnd()*90,px:rnd()*200-100,py:rnd()*200-100},rnd(),[rnd()<.5,rnd()<.5],'trigonometric'));
}
for(const s of ['hurt','eShootWind','dead','move'])for(const phase of [false,true]){const e=base();e.s=s;e._wraithPhasing=phase;cases.push(run(e,{d:1,sp:10,px:100,py:20},.5,[true,true],'non-idle'))}
// Replay multiple ticks using original projected state, not reset each tick.
const chains=[];
for(let k=0;k<8;k++){
 let e=base();e._wraithPhaseT=k;e._wraithPhaseCd=8+k;const chain=[];
 for(let i=0;i<80;i++){const row=run(e,{d:[100,49,30,29,1200][i%5],sp:[1,.5,2][i%3],px:100,py:20},rnd(),[i%3!==0,i%4!==0],'chain');chain.push(row);e={...e,...row.fields,...row.position}}
 chains.push(chain);
}
const gates=[];for(const etype of [0,20,39,40,41,47,49,90])for(const phase of [false,true]){const e={etype,_wraithPhasing:phase};gates.push({actor:e,value:c.hurtGate(e)!=='continue'})}
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v}
fs.writeFileSync(process.argv[3],JSON.stringify({sha256:hash(raw),block_sha256:hash(block),hurt_sha256:hash(hurt),cases:pack(cases),chains:pack(chains),gates:pack(gates)}),'utf8');
"""
class Stream extends RefCounted:
	var values: Array
	var used: Array = []
	var overflow: bool = false
	func _init(sequence: Array) -> void:
		values = sequence.duplicate(true)
	func sample() -> Variant:
		if used.size() >= values.size():
			overflow = true
			return NAN
		var value: Variant = values[used.size()]
		used.append(value)
		return value

class Collision extends RefCounted:
	var permissions: Array
	var calls: Array = []
	func _init(values: Array) -> void:
		permissions = values.duplicate()
	func query(x: float,y: float,r: float) -> Variant:
		var value: Variant = permissions[calls.size()] if calls.size() < permissions.size() else true
		calls.append([x,y,r])
		return value
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
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func _check(ok: bool,label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("EC3_03_FAIL ",label)
func _same(a: Variant,b: Variant,label: String,transcendental: bool = false) -> void:
	_check(_equal(a,b,transcendental),label+" actual="+str(a).left(220)+" expected="+str(b).left(220))
func _equal(a: Variant,b: Variant,transcendental: bool = false,coordinate: String = "") -> bool:
	if (a is float or a is int) and (b is float or b is int):
		if not transcendental:
			return float(a) == float(b)
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
		printerr("EC3_03_INVALID_ISOLATION")
		quit(2)
		return
	_check(not node_bin.is_empty(),"explicit --node-bin required")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		for row in oracle.cases:
			_compare(row)
		for chain in oracle.chains:
			var state: Dictionary = chain[0].actor.duplicate(true)
			for row in chain:
				_same(state,row.actor,"sequential source input")
				state = _compare(row,state)
		for gate in oracle.gates:
			_same(policy.hurt_return_request(gate.actor),{"status":"READY","return_requested":gate.value,"source_line":42154,"complete_hurte":false},"original hurt site gating")
	_golden()
	_diagnostics()
	print("EC3_03_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"source_sha256":source_sha,"skipped":[],"max_trig_absolute_error":max_trig_error,"max_trig_epsilon_units":max_trig_epsilon_units,"full_tick":false,"product_connected":false}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)
func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec3-03-source-oracle.cjs")
	var receipt: String = OS.get_user_data_dir().path_join("ec3-03-source-oracle.json")
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
	_check(data is Dictionary and data.get("cases",[]).size() > 0,"structured source oracle")
	if not data is Dictionary:
		return {}
	_check(data.sha256 == source_sha and data.block_sha256 == BLOCK_SHA256 and data.hurt_sha256 == HURT_SHA256,"original source/phase/hurt pins")
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

func _compare(row: Dictionary, actor_override: Dictionary = {}) -> Dictionary:
	oracle_cases += 1
	var actor: Dictionary = row.actor.duplicate(true) if actor_override.is_empty() else actor_override.duplicate(true)
	var before: Dictionary = actor.duplicate(true)
	var context: Dictionary = row.context.duplicate(true)
	var stream := Stream.new([row.u])
	var collision := Collision.new(row.allow)
	var result: Dictionary = policy.step(actor,context,stream.sample,collision.query)
	_check(result.status == "READY", "source case ready "+str(oracle_cases))
	if result.status != "READY":
		return actor
	var trig: bool = row.label == "trigonometric"
	geometry_scale = 1.0
	if trig:
		var raw: Variant = actor.get("_aSpdM")
		var m: float = 1.0 if raw == null or (raw is bool and not raw) or ((raw is int or raw is float) and float(raw) == 0.0) else float(raw)
		# At most phase1.5 + ordinary1.0 displacement in one source block.
		for v in [actor.x,actor.y,context.px,context.py,float(actor.speed)*m*float(context.sp)*2.5]:
			geometry_scale = maxf(geometry_scale,absf(float(v)))
		# A second aim from the first moved position is ill-conditioned near P.
		# atan2 gradient norm=1/r; propagate the first XY error through it.
		# Factor2 bounds the vector norm of independent XY errors (sqrt(2)).
		angle_scale = 1.0
		var moves: Array = row.commands.filter(func(v: Dictionary) -> bool: return v.kind == "move")
		if moves.size() == 2 and moves[0].allowed:
			var dx: float = context.px-moves[0].x
			var dy: float = context.py-moves[0].y
			var gap: float = sqrt(dx*dx+dy*dy)
			_check(gap > 0.0,"random-angle fixture avoids singular second aim")
			if gap > 0.0:
				angle_scale = maxf(1.0,2.0*geometry_scale/gap)
				geometry_scale *= 1.0+2.0*absf(float(actor.speed)*m*float(context.sp))/gap
	_same(result.fields,row.fields,"phase timers/flags exact")
	_same(result.position,row.position,"projected position",trig)
	_same(result.commands,row.commands,"ordered source commands",trig)
	_same(collision.calls,row.checks,"canMv arguments/order",trig)
	_same(stream.used,row.used,"RNG exact values/order")
	_check(result.draws == row.used.size() and not stream.overflow,"draw count/no overconsumption")
	_same(actor,before,"caller actor immutable")
	_same(context,row.context,"caller context immutable")
	_check(not result.full_tick and not result.product_connected,"no full tick/actual writer")
	_same(policy.hurt_return_request(actor).return_requested,row.hurt_before,"hurt before phase step")
	actor.merge(result.fields,true)
	actor.merge(result.position,true)
	_same(policy.hurt_return_request(actor).return_requested,row.hurt_after,"hurt after phase step")
	return actor

func _actor() -> Dictionary:
	return {"etype":40,"s":"idle","x":0.0,"y":0.0,"speed":2.0,"r":10.0,"_wraithPhaseT":5.0,"_wraithPhaseCd":260.0,"_wraithPhasing":false,"el":2}
func _context(d: float = 100.0,sp: float = 1.0) -> Dictionary:
	return {"d":d,"sp":sp,"px":100.0,"py":0.0}
func _golden() -> void:
	var stream := Stream.new([0.5])
	var collision := Collision.new([true,true])
	var e: Dictionary = _actor()
	e._wraithPhasing = true
	var r: Dictionary = policy.step(e,_context(),stream.sample,collision.query)
	_same(r.fields,{"_wraithPhaseT":3.0,"_wraithPhasing":true},"golden double decrement T5->3")
	_check(stream.used.is_empty() and collision.calls.size() == 1,"existing phase no RNG/single move")
	e._wraithPhasing = false
	e._wraithPhaseT = 1.0
	r = policy.step(e,_context(),stream.sample,collision.query)
	_same(r.fields,{"_wraithPhaseT":74.0,"_wraithPhasing":true},"golden entry60+30*.5 then same tick -1")
	e._wraithPhaseT = 2.0
	e._wraithPhasing = true
	collision = Collision.new([true,true])
	r = policy.step(e,_context(49.0),stream.sample,collision.query)
	_same(r.position,{"x":5.0,"y":0.0},"golden release phase3+ordinary2 movement")
	_same(r.fields,{"_wraithPhaseT":260.0,"_wraithPhasing":false},"golden release Cd assigned no final decrement")
	_same(r.commands.map(func(v: Dictionary) -> String: return v.kind),["move","eProjAt","addTxt","addParts","move"],"golden release exact effect order")
	_same(r.commands[1],{"kind":"eProjAt","angle":0.0,"speed":5.0,"dmg_mul":1.5,"el":2,"life":60,"col":"#aa66ff","size":2},"golden projectile request raw multiplier")
	_check(r.commands[2].x == 3.0 and r.commands[4].x == 5.0,"shot/text before ordinary move")
	for d in [30.0,50.0,1200.0]:
		collision = Collision.new([true,true])
		r = policy.step(e,_context(d),stream.sample,collision.query)
		_check(r.commands.size() == (4 if d == 30.0 else 2 if d == 50.0 else 1),"golden strict distance "+str(d))
	# Cached source d is deliberately different from recomputed current distance.
	e._wraithPhaseT = 10.0
	r = policy.step(e,_context(30.0),stream.sample,collision.query)
	_check(r.fields._wraithPhasing and r.fields._wraithPhaseT == 8.0,"d==30 does not force phase exit")
	var init_stream := Stream.new([0.25,0.75,0.5])
	var init: Dictionary = Catalog.new().build({"stage":10,"etype":40},init_stream.sample)
	_same([init.fields._wraithPhaseT,init.fields._wraithPhaseCd],[135.0,300.0],"reuse EC3-02 initializer")
	e.merge(init.fields,true)
	e._wraithPhaseT = 1.0
	r = policy.step(e,_context(),init_stream.sample,collision.query)
	_same(r.fields,{"_wraithPhaseT":74.0,"_wraithPhasing":true},"initializer then source phase RNG stream")
	_same(init_stream.used,[0.25,0.75,0.5],"no reseed/extra initializer draws")

func _diagnostics() -> void:
	for bad in [null,true,false,"0.5",-0.1,1.0,NAN,INF,-INF]:
		var stream := Stream.new([bad])
		var collision := Collision.new([true,true])
		var e: Dictionary = _actor()
		e._wraithPhaseT = 0.0
		var r: Dictionary = policy.step(e,_context(),stream.sample,collision.query)
		_check(r.status == "NOT_READY" and r.reason == "invalid_random_sample" and r.draws == 1,"invalid sample counts consumed")
		_check(not r.has("fields") and not r.has("commands") and collision.calls.is_empty(),"no speculative commands on RNG failure")
	var stream := Stream.new([0.5])
	var collision := Collision.new([true])
	for key in ["x","y","speed","r","_wraithPhaseT","_wraithPhaseCd"]:
		for bad in [null,true,"1",NAN,INF]:
			var e: Dictionary = _actor()
			e[key] = bad
			var r: Dictionary = policy.step(e,_context(),stream.sample,collision.query)
			_check(r.status == "NOT_READY" and r.draws == 0 and not r.has("fields"),"bad actor "+key)
	for key in ["d","sp","px","py"]:
		for bad in [null,true,"1",NAN,INF]:
			var c: Dictionary = _context()
			c[key] = bad
			var r: Dictionary = policy.step(_actor(),c,stream.sample,collision.query)
			_check(r.status == "NOT_READY" and r.draws == 0,"bad context "+key)
	for type_id in [0,20,39,41,47,49,40.5]:
		var e: Dictionary = _actor()
		e.etype = type_id
		_check(policy.step(e,_context(),stream.sample,collision.query).reason == "unsupported_etype","no other actor admission")
	_check(stream.used.is_empty() and collision.calls.is_empty(),"bad context no callback/RNG calls")
	_check(policy.step(_actor(),_context(),Callable(),collision.query).reason == "invalid_random_callable","missing random binding")
	_check(policy.step(_actor(),_context(),stream.sample,Callable()).reason == "invalid_can_move_callable","missing canMv binding")
	for bad in [null,0,1,"yes"]:
		stream = Stream.new([0.5])
		var bad_collision := Collision.new([bad])
		var e: Dictionary = _actor()
		e._wraithPhaseT = 0.0
		var r: Dictionary = policy.step(e,_context(),stream.sample,bad_collision.query)
		_check(r.status == "NOT_READY" and r.reason == "invalid_can_move_result" and r.draws == 1,"late invalid canMv reports actual RNG")
		_check(not r.has("fields") and not r.has("commands"),"late failure never returns partial commands")
	var late_collision := Collision.new([true,null])
	var e: Dictionary = _actor()
	e._wraithPhasing = true
	e._wraithPhaseT = 2.0
	var before: Dictionary = e.duplicate(true)
	var r: Dictionary = policy.step(e,_context(49.0),stream.sample,late_collision.query)
	_check(r.status == "NOT_READY" and late_collision.calls.size() == 2 and not r.has("commands"),"second movement failure not fake ready")
	_same(e,before,"failure leaves actual actor untouched")
	for bad in [{},{"etype":true},{"etype":40},{"etype":40,"_wraithPhasing":1}]:
		_check(policy.hurt_return_request(bad).status == "NOT_READY","invalid hurt request")
