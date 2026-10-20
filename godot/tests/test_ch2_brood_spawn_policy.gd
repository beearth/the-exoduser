extends SceneTree
## EC2-05 pure brood continuation, source oracle via explicit Node and UTF8 file.
const Policy = preload("res://scripts/native_ch2_brood_spawn_policy.gd")
const Gas = preload("res://scripts/native_ch2_poison_zone_policy.gd")
const Constructor = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
const USERDIR = "EXODUSER-ec2-05-Isolated-20261020"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8');
function block(marker){const i=raw.indexOf(marker);if(i<0)throw Error(marker);const begin=raw.indexOf('{',i);let n=0,q='';for(let k=begin;k<raw.length;k++){let x=raw[k];if(q){if(x==='\\\\'){k++;continue}if(x===q)q='';continue}if(x==='"'||x==="'"){q=x;continue}if(x==='{')n++;if(x==='}'&&!--n)return raw.slice(i,k+1);}throw Error('block');}
const branch=block("if(e.etype===38&&e.s==='idle')");
const clone=v=>JSON.parse(JSON.stringify(v));
const c=vm.createContext({_T:s=>s,EL:{P:0,D:3}});
c.events=[];c.draws=[];
vm.runInContext('Math.random=()=>draw()',c);
c.draw=()=>{if(c.cursor>=c.stream.length)throw Error('random exhaustion');const value=c.stream[c.cursor++];c.draws.push(value);c.events.push({kind:'random',value});return value};
c.addTxt=(x,y,text,col,life)=>c.events.push({kind:'text',x,y,text,col,life});
c.addParts=(x,y,col,count)=>c.events.push({kind:'parts',x,y,col,count});
c.SFX={magic:gain=>c.events.push({kind:'sfx_magic',gain})};
c._spawnBossProjectile=(e,packet)=>c.events.push({kind:'spawn_boss_projectile',packet:clone(packet)});
c.mkEn=(x,y,stage,etype,ib,el,room)=>{
 const request={kind:'mk_en',x,y,stage,etype,ib,el,room};c.events.push(clone(request));
 const index=c.calls++, rolls=[];
 for(let i=0;i<c.consumption[index];i++)rolls.push(c.draw());
 const child=c.outcomes[index]?{id:index,request:clone(request),rolls}:null;
 if(c.mutate){c.e.x+=13.5;c.e.y-=7.25;c.e.el=(index+3)%7;c.e._ri=17+index;c.G.stage=c.G.stage===4?9:4;c.e.s='recover';c.e.atk+=5;c.e._broodGasT=0;c.e._broodSpawnT=999;}
 return child;
};
const step=vm.runInContext('(function(){'+branch+'})',c);
const cases=[];
function add({s='idle',timer=0,sp=1,length=199,u=.5,stage=4,el=0,ri=7,mode='all',consumption=[0,1,5],mutate=false,d=100,gasT=0,elMissing=false,riMissing=false}={}){
 const actor={etype:38,ib:false,s,x:123.25,y:-72.5,room:99,atk:31,_broodSpawnT:timer,_broodSpawnCd:233.5,_broodGasT:gasT,_broodGasCd:301.25,el,_ri:ri,unrelated:{keep:[1,2]}};
 if(elMissing)delete actor.el;if(riMissing)delete actor._ri;
 const stream=[u,...Array.from({length:64},(_,i)=>[0,.999999999,.5,.25,.75,.125,.875][i%7])];
 const outcomes=mode==='none'?[false,false,false]:mode==='mixed'?[true,false,true]:[true,true,true];
 c.e=clone(actor);c.G={stage};c.sp=sp;c.d=d;c.stream=stream;c.cursor=0;c.draws=[];c.events=[];c.calls=0;c.outcomes=outcomes;c.consumption=consumption;c.mutate=mutate;
 c.ens=Array.from({length},(_,i)=>({alive:false,dead:true,id:-i}));
 c.ens.push=(child)=>{c.events.push({kind:'append_enemy',actor:clone(child)});return Array.prototype.push.call(c.ens,child)};
 step();
 cases.push({actor:clone(actor),stage,sp,length,stream,outcomes,consumption,mutate,d,after:clone(c.e),afterStage:c.G.stage,events:clone(c.events),draws:clone(c.draws),calls:c.calls,afterLength:c.ens.length});
}
for(const s of ['idle','recover'])for(const timer of [-1,0,.5,2])for(const sp of [0,.25,2.5])for(const length of [0,198,199,200,201])for(const u of [0,.5])for(const mode of ['all','none','mixed'])add({s,timer,sp,length,u,mode});
for(const u of [0,.5-Number.EPSILON,.5,.9999999999999999])for(const stage of [4,5,6,7,8,9])for(const el of [undefined,null,0,1,2,3,4,5,6])for(const ri of [undefined,null,-1,0,17])add({u,stage,el,ri,elMissing:el===undefined,riMissing:ri===undefined,consumption:[2,0,3],gasT:10});
for(const mutate of [false,true])for(const mode of ['all','none','mixed'])for(const u of [0,.5])for(const d of [0,1200-1e-10,1200,9999])add({mutate,mode,u,d});
// Constructor RNG consumption is external: this row mirrors the EC2-02 numeric
// projection's eight draws, NOT the complete mkEn/skin/admission algorithm.
add({u:0,consumption:[8,8,8],mode:'all',gasT:10});
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v;}
const result={sha256:crypto.createHash('sha256').update(raw).digest('hex'),cases:pack(cases)};
fs.writeFileSync(process.argv[3],JSON.stringify(result),'utf8');
"""
class RandomFixture extends RefCounted:
	var values: Array
	var index: int = 0
	var events: Array = []
	func _init(sequence: Array) -> void:
		values = sequence.duplicate(true)
	func sample() -> Variant:
		if index >= values.size():
			return null
		var value: Variant = values[index]
		index += 1
		events.append({"kind":"random","value":value})
		return value

var policy: RefCounted = Policy.new()
var gas: RefCounted = Gas.new()
var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
var constructor_requests: int = 0
var source_sha: String = ""
var node_bin: String = ""

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("EC2_05_FAIL ",label)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC2_05_INVALID_ISOLATION")
		quit(2)
		return
	_check(not node_bin.is_empty(),"explicit --node-bin argument required")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		for row in oracle.cases:
			_compare(row)
		_test_source_contracts(oracle)
	_test_constructor_dependency()
	_test_refusals()
	print("EC2_05_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"fixture_constructor_requests":constructor_requests,"source_sha256":source_sha,"skipped":[],"product_connected":false,"public_play_evidence":false}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)

func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec2-05-source-oracle.cjs")
	var output_file: String = OS.get_user_data_dir().path_join("ec2-05-source-oracle.json")
	_check(FileAccess.file_exists(source) and not FileAccess.file_exists(helper) and not FileAccess.file_exists(output_file),"source/no temporary overwrite")
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
	var code: int = OS.execute(node_bin,PackedStringArray([helper,source,output_file]),output,true)
	_check(code == 0,"source probe exit0: "+"\n".join(output).left(500))
	var data: Variant = JSON.parse_string(FileAccess.get_file_as_string(output_file)) if FileAccess.file_exists(output_file) else null
	_check(DirAccess.remove_absolute(helper) == OK,"helper removed")
	_check(DirAccess.remove_absolute(output_file) == OK,"UTF8 receipt removed")
	_check(data is Dictionary and data.get("cases",[]).size() > 0,"structured UTF8 oracle")
	if not data is Dictionary:
		return {}
	source_sha = FileAccess.get_sha256(source)
	_check(data.sha256 == source_sha,"exact source bytes")
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

func _mismatch(a: Variant, b: Variant, path: String = "") -> String:
	if (typeof(a) == TYPE_INT or typeof(a) == TYPE_FLOAT) and (typeof(b) == TYPE_INT or typeof(b) == TYPE_FLOAT):
		return "" if float(a) == float(b) else path+" actual="+str(a)+" expected="+str(b)
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size():
			return path+" dictionary size"
		for key in b:
			if not a.has(key):
				return path+" missing "+str(key)
			var error: String = _mismatch(a[key],b[key],path+"/"+str(key))
			if not error.is_empty():
				return error
		return ""
	if a is Array and b is Array:
		if a.size() != b.size():
			return path+" array size actual="+str(a.size())+" expected="+str(b.size())
		for i in range(a.size()):
			var error: String = _mismatch(a[i],b[i],path+"/"+str(i))
			if not error.is_empty():
				return error
		return ""
	return "" if typeof(a) == typeof(b) and a == b else path+" type/value mismatch"

func _same(a: Variant, b: Variant, label: String) -> void:
	var error: String = _mismatch(a,b)
	_check(error.is_empty(),label+" "+error)

func _actor(row: Dictionary) -> Dictionary:
	var a: Dictionary = row.actor.duplicate(true)
	a.etype = int(a.etype)
	if a.has("el") and a.el != null:
		a.el = int(a.el)
	if a.has("_ri") and a._ri != null:
		a._ri = int(a._ri)
	return a

func _compare(row: Dictionary) -> void:
	oracle_cases += 1
	var actor: Dictionary = _actor(row)
	var frozen: Dictionary = actor.duplicate(true)
	var random := RandomFixture.new(row.stream)
	var clocks: Dictionary = policy.advance_spawn_clock(actor,row.sp)
	_check(clocks.status == "READY","spawn clock ready")
	var gas_clock: Dictionary = gas.advance_emitter_clock(clocks.actor,row.sp)
	_check(gas_clock.status == "READY","existing gas clock ready")
	var begin: Dictionary = policy.begin_batch(gas_clock.actor,int(row.length),clocks.idle_entered,random.sample)
	_check(begin.status == "READY" and not begin.product_connected and not begin.complete_actor,"pure batch ready")
	var parent: Dictionary = begin.actor
	var batch: Dictionary = begin.batch
	var stage: int = int(row.stage)
	var length: int = int(row.length)
	var calls: int = 0
	while batch.phase == "coordinates":
		var frozen_batch: Dictionary = batch.duplicate(true)
		var frozen_parent: Dictionary = parent.duplicate(true)
		var child_plan: Dictionary = policy.plan_child(batch,parent,stage,random.sample)
		_check(child_plan.status == "READY" and child_plan.commands.size() == 1,"one constructor request")
		_same(batch,frozen_batch,"child continuation input immutable")
		_same(parent,frozen_parent,"current actor input immutable")
		var request: Dictionary = child_plan.commands[0]
		random.events.append(request.duplicate(true))
		constructor_requests += 1
		var rolls: Array = []
		for i in range(int(row.consumption[calls])):
			rolls.append(random.sample())
		var child: Variant = {"id":calls,"request":request.duplicate(true),"rolls":rolls} if row.outcomes[calls] else null
		if row.mutate:
			parent.x += 13.5
			parent.y -= 7.25
			parent.el = (calls+3)%7
			parent._ri = 17+calls
			stage = 9 if stage == 4 else 4
			parent.s = "recover"
			parent.atk += 5
			parent._broodGasT = 0
			parent._broodSpawnT = 999
		var resume: Dictionary = policy.resume_child(child_plan.batch,child)
		_check(resume.status == "READY","constructor return resumed")
		random.events.append_array(resume.commands)
		length += resume.commands.size()
		calls += 1
		batch = resume.batch
	if batch.phase == "presentation":
		var finish: Dictionary = policy.finish_batch(batch,parent)
		_check(finish.status == "READY" and finish.batch.phase == "complete","presentation after attempts")
		random.events.append_array(finish.commands)
		batch = finish.batch
	var emission: Dictionary = gas.plan_emission(parent,row.d,clocks.idle_entered)
	_check(emission.status == "READY","gas site after brood")
	random.events.append_array(emission.commands)
	_same(actor,frozen,"original actor unchanged")
	_same(emission.actor,row.after,"source complete branch actor")
	_same(random.events,row.events,"source exact event/RNG/constructor/push/gas order")
	_same(random.values.slice(0,random.index),row.draws,"source consumed draw sequence")
	_check(calls == int(row.calls) and length == int(row.afterLength) and stage == int(row.afterStage),"source attempts/length/stage")

func _test_source_contracts(oracle: Dictionary) -> void:
	var overshoot: int = 0
	var rejected: int = 0
	var missing_region: int = 0
	var null_region: int = 0
	var changed_parent: int = 0
	for row in oracle.cases:
		if row.afterLength > 200:
			overshoot += 1
		if row.calls > 0 and row.afterLength == row.length:
			rejected += 1
		if row.mutate and row.calls > 0:
			changed_parent += 1
		for event in row.events:
			if event.kind == "mk_en":
				_check(event.etype == 33 and event.ib == false,"type33 nonboss only")
				if not event.has("room"):
					missing_region += 1
				elif event.room == null:
					null_region += 1
	_check(overshoot > 0,"source batch can exceed cap")
	_check(rejected > 0,"source all constructors rejected coverage")
	_check(missing_region > 0,"source undefined region coverage")
	_check(null_region > 0,"source null region coverage")
	_check(changed_parent > 0,"source fresh context coverage")

func _zero_elite(_stage: int, _rng: Callable) -> int:
	return 0
func _no_mods(_tier: int, _stage: int, _rng: Callable) -> Array:
	return []
func _no_aura(_tier: int, _stage: int, _rng: Callable) -> Variant:
	return null

func _test_constructor_dependency() -> void:
	var constructor := Constructor.new()
	var values: Array = [0.0]
	for i in range(40):
		values.append(float(i)/40.0)
	var random := RandomFixture.new(values)
	var actor: Dictionary = _actor({"actor":{"etype":38,"ib":false,"s":"idle","x":10.0,"y":20.0,"_broodSpawnT":0,"_broodSpawnCd":180,"el":0,"room":99}})
	var begin: Dictionary = policy.begin_batch(actor,199,true,random.sample)
	var batch: Dictionary = begin.batch
	var receipts: Array = []
	while batch.phase == "coordinates":
		var request: Dictionary = policy.plan_child(batch,begin.actor,4,random.sample)
		receipts.append(request.commands[0])
		var built: Dictionary = constructor.build({"stage":4,"etype":33,"difficulty":5,"player_level":1,"stage_difficulty_offset":0},random.sample,{"elite":_zero_elite,"mods":_no_mods,"aura":_no_aura})
		_check(built.status == "READY" and built.draws == 8 and built.complete_actor == false,"reuse EC2-02 numeric33 only, eight draws")
		batch = policy.resume_child(request.batch,{"numeric_projection":built.fields}).batch
	_check(random.index == 21 and receipts.size() == 2,"shared stream 1+2+8+2+8, no batch preallocation")
	_check(receipts[0].x == 10.0+(values[1]-0.5)*40.0 and receipts[1].x == 10.0+(values[11]-0.5)*40.0,"constructor consumes between coordinate pairs")
	_check(not receipts[0].has("room") and receipts[0].el == 0,"_ri absent not replaced by room99")

func _test_refusals() -> void:
	var actor: Dictionary = {"etype":38,"ib":false,"s":"idle","x":0,"y":0,"_broodSpawnT":0,"_broodSpawnCd":180}
	var random := RandomFixture.new([0.0,0.5,0.5])
	for key in ["etype","ib","s","x","_broodSpawnT","_broodSpawnCd"]:
		var broken: Dictionary = actor.duplicate(true)
		broken.erase(key)
		_check(policy.advance_spawn_clock(broken,1).status == "NOT_READY","missing required "+key)
	for value in [-1.0,INF,NAN]:
		_check(policy.advance_spawn_clock(actor,value).status == "NOT_READY","invalid elapsed")
	for value in [-1.0,1.0,NAN,INF,"0",true,null]:
		var bad := RandomFixture.new([value])
		_check(policy.begin_batch(actor,199,true,bad.sample).status == "NOT_READY" and bad.index == 1,"invalid random")
	_check(policy.begin_batch(actor,199,true,Callable()).status == "NOT_READY","eligible RNG required")
	_check(policy.begin_batch(actor,200,true,Callable()).status == "READY","capped no RNG needed")
	_check(policy.begin_batch(actor,199,false,Callable()).status == "READY","nonidle no RNG needed")
	_check(policy.begin_batch(actor,-1,true,random.sample).status == "NOT_READY","invalid array length")
	var begin: Dictionary = policy.begin_batch(actor,199,true,random.sample)
	_check(policy.plan_child(begin.batch,actor,3,random.sample).status == "NOT_READY","stage boundary")
	_check(policy.plan_child(begin.batch,actor,4,Callable()).status == "NOT_READY","coordinates RNG unbound")
	var request: Dictionary = policy.plan_child(begin.batch,actor,4,random.sample)
	for invalid in [false,0,[],"actor"]:
		_check(policy.resume_child(request.batch,invalid).status == "NOT_READY","malformed constructor return")
	var empty_object: Dictionary = policy.resume_child(request.batch,{})
	_check(empty_object.commands.size() == 1,"empty object JS truthy push")
	var none: Dictionary = policy.resume_child(request.batch,null)
	_check(none.commands.is_empty() and none.batch.index == 1,"null skips push but advances loop")
	_check(policy.plan_child(request.batch,actor,4,random.sample).status == "NOT_READY","cannot draw next child before constructor")
	_check(policy.finish_batch(begin.batch,actor).status == "NOT_READY","cannot present before attempts")
	_check(policy.resume_child(begin.batch,null).status == "NOT_READY","cannot accept before request")
	_same(actor,{"etype":38,"ib":false,"s":"idle","x":0,"y":0,"_broodSpawnT":0,"_broodSpawnCd":180},"refusals preserve source view")
