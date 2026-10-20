extends SceneTree
const Policy = preload("res://scripts/native_ch4_amalgam_split_policy.gd")
const Catalog = preload("res://scripts/native_ch4_enemy_catalog_policy.gd")
const USERDIR = "EXODUSER-ec4-04-Isolated-20261020"
const SOURCE_SHA = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const AI_SHA = "bcacdcb0d2ca7ce377ba3423bc578fd06fe29683fd4cad28cee7301b0d019f2c"
const DEATH_SHA = "c2fef205bee9aa83eb8509ca6a165b2c3c71b78f0bd23811003c1ce24193f9c8"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto'),readline=require('node:readline');
(async()=>{
 const stream=fs.createReadStream(process.argv[2]),hash=crypto.createHash('sha256');stream.on('data',x=>hash.update(x));
 const rl=readline.createInterface({input:stream,crlfDelay:Infinity});let n=0,ai=[],death=[];
 for await(const line of rl){n++;if(n>=39521&&n<=39523)ai.push(line);if(n>=42827&&n<=42835)death.push(line)}
 const aiBlock=ai.join('\\n')+'\\n',deathBlock=death.join('\\n')+'\\n',sha=s=>crypto.createHash('sha256').update(s).digest('hex');
 if(!aiBlock.includes("e.etype===51&&e.s==='idle'")||!deathBlock.includes('ne.hp=~~(ne.hp*.35)'))throw Error('pinned source boundary');
 const c=vm.createContext({_T:x=>x});vm.runInContext('Math.random=()=>sample();function trigger(e,d){'+aiBlock+';return e}function death(e){'+deathBlock+'}',c);
 const clone=structuredClone,base=()=>({etype:51,s:'idle',x:12.25,y:-18.5,r:20,hp:9000,col:'#aa2211',el:0,room:7,_ri:99});
 const near=(x,up)=>{const b=Buffer.alloc(8);b.writeDoubleLE(x);b.writeBigUInt64LE(b.readBigUInt64LE()+(up?1n:-1n));return b.readDoubleLE()};
 const triggers=[];for(const s of ['idle','windup','dead'])for(const r of [0,10,35])for(const d of [near(35+r,false),35+r,near(35+r,true)]){const e=base();Object.assign(e,{s,r,_amalgCleave:false});const before=clone(e);c.trigger(e,d);triggers.push({actor:before,d,fields:e.s!==s?{_telegraphT:e._telegraphT,s:e.s,st2:e.st2}:{}})}
 let events,used,steps,active,options,values;
 c.sample=()=>{const value=values[used.length];if(value===undefined)throw Error('stream exhaustion');used.push(value);events.push({kind:'random',value});return value};
 c.mkEn=(...args)=>{
  const index=steps.length,request={kind:'mk_en',x:args[0],y:args[1],stage:args[2],etype:args[3],ib:args[4],argc:args.length};
  if(args[5]!==undefined)request.el=args[5];if(args[6]!==undefined)request.room=args[6];events.push(clone(request));
  const step={parent_at_coordinates:clone(c.e),stage:c.G.stage,request:clone(request),constructor_cost:options.costs[index],parts_cost:options.parts[index]};steps.push(step);
  for(let k=0;k<step.constructor_cost;k++)c.sample();
  if(options.mutate){c.e.x+=3.25;c.e.y-=2.5;c.e.r=7+index*13;c.e.col='#ctor'+index;c.e.el=index===0?null:0;c.e.room=100+index;c.G.stage=index===0?20:14;c.e._amalgSplit=true;c.e.etype=99;}
  const child=index===options.null_at?null:{id:index,x:args[0],y:args[1],hp:options.hp+index*17,mhp:888,eShield:444,eShieldMax:444,r:99,speed:options.speed,baseSpd:123,poise:777,maxPoise:778,elite:3,mods:['M02'],aura:'warCry',other:{keep:[9]}};
  step.returned_child=clone(child);step.parent_at_post=clone(c.e);return child;
 };
 c.addParts=(x,y,col,count)=>{const event={kind:'parts',x,y,count};if(col!==undefined)event.col=col;events.push(event);const step=steps.at(-1);for(let k=0;k<step.parts_cost;k++)c.sample();if(options.mutate){c.e.x+=2;c.e.y+=1;c.e.col='#parts';c.G.stage=15;}step.parent_after_parts=clone(c.e)};
 c.addTxt=(x,y,text_key,col,life)=>events.push({kind:'text',x,y,text_key,col,life});
 function run(config={}){
  const e=base();options={null_at:-1,costs:[0,0],parts:[0,0],mutate:false,hp:1000.5,speed:2.25,...config};
  if(options.mode==='missing'){delete e.el;delete e.room;delete e.col}else if(options.mode==='null'){e.el=null;e.room=null;e.col=null}else if(options.mode==='zero'){e.el=0;e.room=0}
  if('flag'in options)e._amalgSplit=options.flag;
  if(options.radius!==undefined)e.r=options.radius;
  values=Array.from({length:32},(_,i)=>[.125,.875,0,.9999999999999999,.25,.75,.5,.375][i%8]);events=[];used=[];steps=[];c.e=e;c.G={stage:14};c.ens=[];
  c.ens.push=child=>{events.push({kind:'append_enemy',actor:clone(child)});const step=steps.at(-1);step.appended_child=clone(child);Array.prototype.push.call(c.ens,child);if(options.mutate){child.x+=.5;child.y-=.25;c.e.col='#append';}step.child_after_append=clone(child);step.parent_after_append=clone(c.e);return c.ens.length};
  const before=clone(e);let failure=null;
  try{c.death(e)}catch(err){if(err.name!=='TypeError')throw err;failure={name:err.name,source_line:42831,write_site:'ne.hp'};events.push({kind:'source_failure',...failure})}
  return {actor:before,options,values,steps,events:clone(events),used:clone(used),nextValue:values[used.length],failure,final_parent:clone(e),final_stage:c.G.stage};
 }
 const deaths=[];
 for(const null_at of [-1,0,1])for(const costs of [[0,0],[1,3]])for(const mutate of [false,true])for(const mode of ['missing','null','zero','normal'])deaths.push(run({null_at,costs,parts:costs[0]?[2,1]:[0,0],mutate,mode}));
 for(const flag of [null,false,0,'',true,1,'x',[],{},NaN])deaths.push(run({flag}));
 const hps=[-9,0,2,19.99999,1000.5,6e9,1e10],rs=[0,5,near(25/3,false),25/3,near(25/3,true),20,1e10];
 for(let k=0;k<hps.length;k++)deaths.push(run({hp:hps[k],radius:rs[k],speed:k%2?-.25:0}));
 function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v}
 fs.writeFileSync(process.argv[3],JSON.stringify({source_sha256:hash.digest('hex'),ai_sha256:sha(aiBlock),death_sha256:sha(deathBlock),transport:'UTF-8 한글 🔥',triggers:pack(triggers),deaths:pack(deaths)}),'utf8');
})().catch(e=>{console.error(e.stack);process.exitCode=1});
"""
class Stream extends RefCounted:
	var values: Array
	var used: Array = []
	var events: Array
	func _init(v: Array, e: Array = []) -> void:
		values = v.duplicate(true)
		events = e
	func sample() -> Variant:
		var value: Variant = values[used.size()] if used.size() < values.size() else NAN
		used.append(value)
		events.append({"kind":"random","value":value})
		return value
var policy: RefCounted = Policy.new()
var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
var node_bin: String = ""
var site: String = "G39521–39523/G42827–42835 API"
var sites: Dictionary = {}
var geometry_scale: float = 1.0
var max_xy_error: float = 0.0
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func _check(ok: bool, label: String) -> void:
	assertions += 1
	sites[site] = sites.get(site,0)+1
	if not ok:
		failures += 1
		printerr("EC4_04_FAIL ",site," ",label)
func _same(a: Variant,b: Variant,label: String,xy: bool = false) -> void:
	_check(_equal(a,b,xy),label)
func _equal(a: Variant,b: Variant,xy: bool = false) -> bool:
	if (a is int or a is float) and (b is int or b is float):
		if xy:
			var delta: float = absf(float(a)-float(b))
			max_xy_error = maxf(max_xy_error,delta)
			return delta <= 8.0*2.220446049250313e-16*geometry_scale
		return PackedFloat64Array([float(a)]).to_byte_array() == PackedFloat64Array([float(b)]).to_byte_array()
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size():
			return false
		for key in b:
			if not a.has(key) or not _equal(a[key],b[key],xy and key in ["x","y"]):
				return false
		return true
	if a is Array and b is Array:
		if a.size() != b.size():
			return false
		for i in range(a.size()):
			if not _equal(a[i],b[i],xy):
				return false
		return true
	return typeof(a) == typeof(b) and a == b
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC4_04_INVALID_ISOLATION")
		quit(2)
		return
	_check(not node_bin.is_empty(),"explicit --node-bin")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		for row in oracle.triggers:
			oracle_cases += 1
			site = "G39521–39523"
			var before: Dictionary = row.actor.duplicate(true)
			var result: Dictionary = policy.trigger(row.actor,row.d)
			_check(result.status == "READY" and not result.full_tick and not result.product_connected,"pure trigger only")
			_same(result.fields,row.fields,"strict 35+r/idle, _amalgCleave false does not gate")
			_same(row.actor,before,"trigger input immutable")
		for row in oracle.deaths:
			oracle_cases += 1
			_death(row)
	_golden_and_diagnostics()
	print("EC4_04_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"sites":sites,"max_xy_absolute_error":max_xy_error,"execution":"HOLD","product_connected":false,"skipped":[]}))
	quit(0 if failures == 0 and oracle_cases == 92 else 1)
func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html")
	DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir())
	var helper: String = OS.get_user_data_dir().path_join("source-probe.cjs")
	var receipt: String = OS.get_user_data_dir().path_join("source-probe.json")
	_check(FileAccess.get_sha256(source) == SOURCE_SHA and not FileAccess.file_exists(helper) and not FileAccess.file_exists(receipt),"source pin/no overwrite")
	if failures > 0:
		return {}
	var f: FileAccess = FileAccess.open(helper,FileAccess.WRITE)
	_check(f != null,"UTF8 helper writable")
	if f == null:
		return {}
	f.store_string(SOURCE_PROBE)
	f.close()
	var output: Array = []
	var code: int = OS.execute(node_bin,PackedStringArray([helper,source,receipt]),output,true)
	_check(code == 0,"source streaming oracle exit0 "+"\n".join(output).left(400))
	var data: Variant = JSON.parse_string(FileAccess.get_file_as_string(receipt)) if FileAccess.file_exists(receipt) else null
	_check(DirAccess.remove_absolute(helper) == OK and DirAccess.remove_absolute(receipt) == OK,"owned temporaries removed")
	_check(data is Dictionary,"structured receipt")
	if not data is Dictionary:
		return {}
	_check(data.source_sha256 == SOURCE_SHA and data.ai_sha256 == AI_SHA and data.death_sha256 == DEATH_SHA,"source/3line AI/9line death pins")
	_check(data.transport == "UTF-8 한글 🔥" and data.triggers.size() == 27 and data.deaths.size() == 65,"UTF8/full compact corpus")
	return _unpack(data)
func _unpack(v: Variant) -> Variant:
	if v is Dictionary:
		if v.size() == 1 and v.has("$f64"):
			return Marshalls.base64_to_raw(v["$f64"]).decode_double(0)
		var out: Dictionary = {}
		for k in v:
			out[k] = _unpack(v[k])
		return out
	if v is Array:
		var out: Array = []
		for item in v:
			out.append(_unpack(item))
		return out
	return v
func _planned(result: Dictionary) -> bool:
	var ok: bool = result.get("status") == "PLAN" and result.get("execution") == "HOLD" and result.get("product_connected") == false and result.get("complete_actor") == false
	_check(ok,"data-only PLAN/HOLD, no actor support")
	return ok
func _death(row: Dictionary) -> void:
	site = "G42827–42835"
	var events: Array = []
	var stream := Stream.new(row["values"],events)
	var before: Dictionary = row.actor.duplicate(true)
	var result: Dictionary = policy.begin_death(row.actor)
	if not _planned(result):
		return
	var batch: Dictionary = result.batch
	_same(row.actor,before,"outer gate input immutable")
	for step in row.steps:
		site = "G42829–42830"
		geometry_scale = maxf(26.0,maxf(absf(step.parent_at_coordinates.x),absf(step.parent_at_coordinates.y)))
		var snapshot: Dictionary = step.parent_at_coordinates.duplicate(true)
		result = policy.plan_child(batch,step.parent_at_coordinates,int(step.stage),stream.sample)
		if not _planned(result):
			return
		_check(result.draws == 2 and result.commands.size() == 1,"only two coordinate draws, no next child prefetch")
		_same(result.commands[0],step.request,"seven mkEn args, direct el/room, no cap/canMv",true)
		_same(step.parent_at_coordinates,snapshot,"coordinate input immutable")
		events.append(result.commands[0].duplicate(true))
		batch = result.batch
		for i in range(int(step.constructor_cost)):
			stream.sample() # Explicit external owner fixture, NOT a native constructor.
		site = "G42831"
		var receipt_before: Variant = step.returned_child.duplicate(true) if step.returned_child is Dictionary else null
		result = policy.resume_constructor(batch,step.returned_child,step.parent_at_post)
		_same(step.returned_child,receipt_before,"constructor receipt immutable")
		if step.returned_child == null:
			_check(result.status == "SOURCE_FAILURE" and result.source_line == 42831 and result.write_site == "ne.hp" and result.batch.phase == "halted" and result.commands.is_empty(),"null dereference aborts, not null skip")
			events.append({"kind":"source_failure","name":"TypeError","source_line":42831,"write_site":"ne.hp"})
			_same(events,row.events,"exact prefix retained, no later push/parts/child/text",true)
			_same(stream.used,row.used,"failed constructor owner RNG still consumed")
			_same(stream.sample(),row.nextValue,"failure owner tail")
			return
		if not _planned(result):
			return
		_same(result.commands,[{"kind":"append_enemy","actor":step.appended_child}],"child HP35%, parent r, shields0/speed1.3; other stats preserved")
		events.append(result.commands[0].duplicate(true))
		batch = result.batch
		site = "G42832"
		result = policy.resume_append(batch,step.child_after_append,step.parent_after_append)
		if not _planned(result):
			return
		events.append(result.commands[0].duplicate(true))
		batch = result.batch
		for i in range(int(step.parts_cost)):
			stream.sample() # FX fixture runs before the next coordinate pair.
		result = policy.resume_parts(batch)
		if not _planned(result):
			return
		batch = result.batch
	if batch.phase == "presentation":
		site = "G42834"
		result = policy.finish_batch(batch,row.final_parent)
		if not _planned(result):
			return
		events.append(result.commands[0].duplicate(true))
		batch = result.batch
	_check(batch.phase == "complete","no recheck of outer flag/type during active two-child loop")
	_same(events,row.events,"constructor/append/parts/next child/text ordering",true)
	_same(stream.used,row.used,"whole owner-interleaved RNG trace")
	_same(stream.sample(),row.nextValue,"owner next sentinel")
func _golden_and_diagnostics() -> void:
	site = "G31301/G39521/G42827–42835 API guards"
	var init: Dictionary = Catalog.new().build({"stage":14,"etype":51},Stream.new([0.5]).sample)
	var parent: Dictionary = {"etype":51,"s":"idle","r":20,"x":0,"y":0}
	parent.merge(init.fields,true)
	_check(policy.begin_death(parent).batch.phase == "coordinates","EC4-02 false split initializer starts death plan")
	_same(policy.trigger(parent,54.0).fields,{"_telegraphT":20,"s":"windup","st2":20},"windup20, no omnidirectional attack added")
	var batch: Dictionary = policy.begin_death(parent).batch
	for offset in range(2):
		for bad in [null,true,"0",-0.01,1.0,NAN,INF]:
			var rng := Stream.new(([0.5] if offset else [])+[bad,0.9])
			var r: Dictionary = policy.plan_child(batch,parent,14,rng.sample)
			_check(r.status == "NOT_READY" and r.reason == "invalid_random_sample" and r.draws == offset+1 and rng.used.size() == offset+1,"bad coordinate sample, actual consumption/no rewind")
	_check(policy.plan_child(batch,parent,14,Callable()).reason == "invalid_random_callable","unbound owner RNG")
	var planned: Dictionary = policy.plan_child(batch,parent,14,Stream.new([0.1,0.2,0.3,0.4]).sample)
	_check(policy.resume_constructor(planned.batch,{},parent).status == "NOT_READY","missing full constructor receipt not fake success")
	for phase in ["coordinates","await_constructor","await_append","await_parts","presentation"]:
		var bad: Dictionary = {"phase":phase,"count":3,"index":0}
		_check(policy.plan_child(bad,parent,14,Stream.new([0.1]).sample).status == "NOT_READY","wrong continuation/count cannot precompute")
	var failure: Dictionary = policy.resume_constructor(planned.batch,null,parent)
	var tail := Stream.new([0.1,0.2])
	_check(policy.plan_child(failure.batch,parent,14,tail.sample).status == "NOT_READY" and tail.used.is_empty() and policy.finish_batch(failure.batch,parent).status == "NOT_READY","halt cannot resume second child or presentation")
