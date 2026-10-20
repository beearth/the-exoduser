extends SceneTree
## EC3-05: original source oracle + dictionary-only acknowledged owner fixture.
const Policy = preload("res://scripts/native_ch3_enemy_absorb_policy.gd")
const Catalog = preload("res://scripts/native_ch3_enemy_catalog_policy.gd")
const USERDIR = "EXODUSER-ec3-05-Isolated-20261020"
const SOURCE_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const BLOCK_SHA256 = "dcb62cfb5f57b97a05fca17a4121aa3d710cb01cf6309361978a09ce331ace0b"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const a=raw.indexOf("  if(e.etype===42&&e.s==='idle'){");const b=raw.indexOf('  // ── 43:',a);if(a<0||b<0)throw Error('boundaries');const block=raw.slice(a,b);
const elAt=raw.indexOf('const EL=');if(elAt<0)throw Error('EL declaration');const elSource=raw.slice(elAt,raw.indexOf(';',elAt)+1);
const c=vm.createContext({});vm.runInContext(elSource+'const nativeHypot=Math.hypot;Math.hypot=(x,y)=>observeHypot(x,y,nativeHypot(x,y));Math.random=()=>sample();function tick(e,ens,P,d,sp){'+block+'}',c);
const clone=x=>JSON.parse(JSON.stringify(x));const snap=e=>Object.fromEntries(Object.entries(e).filter(([k,v])=>typeof v!=='function'));
let events,queries,used,actor,pool,order,options,lengthReads,currentRef,proxies,fireEvents,phase,distanceMode;
c._T=x=>x;c.sample=()=>{if(used.length)throw Error('extra draw');used.push(c.u);return c.u};
c.observeHypot=(dx,dy,value)=>{distanceMode=false;queries.push({kind:'hypot',dx,dy,value});return value};
c.addParts=(x,y,col,count)=>events.push({kind:'addParts',x,y,col,count});
c.eProjAt=(e,angle,speed,dmg_mul,el,life,col,size)=>{fireEvents.push({op:'eProjAt',angle,speed,dmg_mul,el,life,col,size});if(options.mutate_fire){actor.x=77;actor.y=-88}};
c.addTxt=(x,y,text_key,col,life)=>fireEvents.push({op:'addTxt',x,y,text_key,col,life});
function proxy(ref){if(proxies[ref])return proxies[ref];return proxies[ref]=new Proxy(pool[ref],{
 get(t,k){if(k==='dead'){const present=Object.hasOwn(t,k),v=t[k];queries.push({kind:'dead',ref,value:{present,...(present?{value:v}:{})}});distanceMode=!!v}if(distanceMode&&(k==='x'||k==='y'))queries.push({kind:'coordinate',ref,axis:k,value:t[k]});return t[k]},
 set(t,k,v){if(k==='hp'&&ref==='actor')queries.push({kind:'actor',purpose:'heal',value:clone(snap(actor))});
  if(k==='_swFire')events.push({kind:'bind_fire'});else if(k==='x'||k==='y')events.push({kind:'corpse_field',ref,field:k,value:v});else events.push({kind:'actor_field',field:k,value:v});t[k]=v;return true}
 })}
function run(input){
 actor=clone(input.actor);pool=clone(input.pool);pool.actor=actor;order=input.refs.slice();options=input.options||{};events=[];queries=[];used=[];lengthReads=0;proxies={};phase='tick';distanceMode=false;fireEvents=[];c.u=input.u;
 const ens=new Proxy([], {get(t,k){if(k==='length'){lengthReads++;if(lengthReads===2){if(options.grow)order.push(options.grow);if(options.shift)order.shift()}queries.push({kind:'length',value:order.length});return order.length}if(/^\\d+$/.test(String(k))){const i=Number(k);currentRef=order[i];queries.push({kind:'entry',index:i,value:currentRef});if(!currentRef)throw Error('null source entry');return proxy(currentRef)}return Reflect.get(t,k)}});
 c.tick(proxy('actor'),ens,{x:input.context.px,y:input.context.py},input.context.d,input.context.sp);
 const tickEvents=events.slice(),finalActor=clone(snap(actor)),finalPool=Object.fromEntries(Object.entries(pool).map(([k,v])=>[k,clone(snap(v))]));
 const fires=[];if(typeof actor._swFire==='function')for(const f of input.fire_targets||[]){Object.assign(actor,{x:f.ex,y:f.ey});Object.assign(c.currentP,{x:f.px,y:f.py});fireEvents=[];actor._swFire();fires.push({context:f,events:fireEvents.slice()})}
 return {...input,queries,events:tickEvents,used,after:finalActor,pool_after:finalPool,refs_after:order.slice(),bound:typeof actor._swFire==='function',fires};
}
// The original callback closes over tick's P. Keep the same object and move it
// before invocation; do not replace it with a new captured target.
const oldRun=c.tick;c.tick=(e,ens,P,d,sp)=>{c.currentP=P;return oldRun(e,ens,P,d,sp)};
let seed=20261020;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const next=(v,up)=>{const b=Buffer.alloc(8);b.writeDoubleLE(v);b.writeBigUInt64LE(b.readBigUInt64LE()+(up?1n:-1n));return b.readDoubleLE()};
const base=()=>({etype:42,s:'idle',x:0,y:0,hp:10,mhp:100,st2:9,_fmAbsorbCd:0,_fmSpitT:0,_fmSpitCd:220,alive:true});
const targets=[{ex:20,ey:30,px:120,py:30},{ex:-20,ey:30,px:-20,py:130},{ex:20,ey:-30,px:-80,py:-30},{ex:20,ey:30,px:20,py:-70}];
const inputs=[];
for(const absorb of [0,1,5])for(const spit of [0,1,5])for(const sp of [0,1,2])for(const d of [0,60,next(60,true),100,next(1200,false),1200])for(const layout of ['empty','absent','false','near','edge','below','above','first','farthen','self']){
 const e=base();e._fmAbsorbCd=absorb;e._fmSpitT=spit;
 let pool={},refs=[];if(layout==='absent'){pool={a:{alive:false,x:1,y:0}};refs=['a']}else if(layout==='false'){pool={a:{dead:false,x:1,y:0}};refs=['a']}else if(layout==='self'){e.dead=true;refs=['actor']}else if(layout!=='empty'){
  const x={near:1,edge:80,below:next(80,false),above:next(80,true),first:79,farthen:81}[layout];pool={a:{dead:true,x,y:0},b:{dead:true,x:1,y:0}};refs=layout==='first'||layout==='farthen'?['a','b']:['a'];
 }
 inputs.push({actor:e,context:{d,sp,px:100,py:0},u:[0,.5,1-Number.EPSILON/2][inputs.length%3],pool,refs,options:{mutate_fire:inputs.length%2===0},fire_targets:targets,label:layout});
}
for(const dead of [false,0,1,-1,null,'','dead',[],{}]){const e=base();inputs.push({actor:e,context:{d:100,sp:1,px:100,py:0},u:.5,pool:{a:{dead,x:3,y:4}},refs:['a'],options:{},fire_targets:targets,label:'truthiness'})}
for(const option of [{grow:'b'},{shift:true}]){const e=base();inputs.push({actor:e,context:{d:100,sp:1,px:100,py:0},u:.5,pool:{a:{dead:false,x:0,y:0},b:{dead:true,x:3,y:4}},refs:option.grow?['a']:['a','b'],options:option,fire_targets:targets,label:'dynamic-length'})}
for(const hp of [0,99,100,120,-10])for(const mhp of [0,1,6,7,99,100,21474836480]){const e=base();e.hp=hp;e.mhp=mhp;inputs.push({actor:e,context:{d:100,sp:1,px:100,py:0},u:.5,pool:{a:{dead:true,x:3,y:4}},refs:['a'],options:{},fire_targets:targets,label:'heal-trunc-clamp'})}
for(const s of ['hurt','eShootWind','dead','recover']){const e=base();e.s=s;inputs.push({actor:e,context:{d:100,sp:10,px:100,py:0},u:.5,pool:{a:{dead:true,x:3,y:4}},refs:['a'],options:{},fire_targets:targets,label:'non-idle'})}
for(let i=0;i<180;i++){const e=base();e.x=rnd()*200-100;e.y=rnd()*200-100;e.hp=rnd()*200;e.mhp=rnd()*200;e._fmAbsorbCd=rnd()*3-1;e._fmSpitT=rnd()*3-1;const pool={},refs=[];for(let j=0;j<5;j++){const id='r'+j;pool[id]={dead:rnd()<.6,x:e.x+rnd()*160-80,y:e.y+rnd()*160-80};refs.push(id)}inputs.push({actor:e,context:{d:rnd()*1250,sp:rnd()*3,px:0,py:0},u:rnd(),pool,refs,options:{},fire_targets:targets,label:'random'})}
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v}
const cases=inputs.map(run);
const chains=[];
for(const layout of ['first','farthen','self','absent']){
 let prior=inputs.find(x=>x.label===layout);prior=clone(prior);prior.context={d:0,sp:200,px:100,py:0};prior.fire_targets=[];prior.options={};
 const chain=[];for(let i=0;i<10;i++){prior.u=(i%3)/3;const row=run(prior);chain.push(row);prior={...prior,actor:row.after,pool:row.pool_after,refs:row.refs_after}}
 chains.push(chain);
}
fs.writeFileSync(process.argv[3],JSON.stringify({sha256:hash(raw),block_sha256:hash(block),cases:pack(cases),chains:pack(chains)}),'utf8');
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

class OwnerFixture extends RefCounted:
	var actor: Dictionary
	var pool: Dictionary
	var refs: Array
	var row: Dictionary
	var events: Array = []
	var queries: Array = []
	var hypots: Array
	var hypot_index: int = 0
	var length_reads: int = 0
	var bound: bool = false
	var player_reads: int = 0
	var current_player: Dictionary = {}
	func _init(source: Dictionary) -> void:
		row = source.duplicate(true)
		actor = row.actor.duplicate(true)
		pool = row.pool.duplicate(true)
		pool.actor = actor # Preserve the original ens entry alias, including self.
		refs = row.refs.duplicate()
		hypots = row.get("queries",[]).filter(func(v: Dictionary) -> bool: return v.kind == "hypot")
	func readers() -> Dictionary:
		return {"length":read_length,"entry":read_entry,"dead":read_dead,"coordinate":read_coordinate,"actor":read_actor,"hypot":source_hypot}
	func read_length() -> int:
		length_reads += 1
		if length_reads == 2:
			if row.options.has("grow"):
				refs.append(row.options.grow)
			if row.options.get("shift",false):
				refs.pop_front()
		queries.append({"kind":"length","value":refs.size()})
		return refs.size()
	func read_entry(index: int) -> String:
		var ref: String = refs[index]
		queries.append({"kind":"entry","index":index,"value":ref})
		return ref
	func read_dead(ref: String) -> Dictionary:
		var value: Dictionary = {"present":pool[ref].has("dead")}
		if value.present:
			value.value = pool[ref].dead
		queries.append({"kind":"dead","ref":ref,"value":value.duplicate(true)})
		return value
	func read_coordinate(ref: String,axis: String) -> float:
		var value: float = pool[ref][axis]
		queries.append({"kind":"coordinate","ref":ref,"axis":axis,"value":value})
		return value
	func read_actor(purpose: String) -> Dictionary:
		var value: Dictionary = actor.duplicate(true)
		queries.append({"kind":"actor","purpose":purpose,"value":value.duplicate(true)})
		return value
	func source_hypot(dx: float,dy: float) -> float:
		# Replay ORIGINAL Math.hypot result at its observed site, not a new
		# Godot geometry formula. Exact argument/query checks remain mandatory.
		var value: float = hypots[hypot_index].value if hypot_index < hypots.size() else NAN
		hypot_index += 1
		queries.append({"kind":"hypot","dx":dx,"dy":dy,"value":value})
		return value
	func acknowledge(cmd: Dictionary) -> Dictionary:
		var receipt: Dictionary = {"ack":true,"seq":cmd.seq,"op":cmd.op}
		if cmd.op in ["actor_fields","arm_spit"]:
			for key in cmd.fields:
				events.append({"kind":"actor_field","field":key,"value":cmd.fields[key]})
				actor[key] = cmd.fields[key]
			receipt.applied = true
			if cmd.op == "arm_spit":
				bound = true
				events.append({"kind":"bind_fire"})
				receipt.fire_binding = cmd.fire_binding.duplicate()
		elif cmd.op == "corpse_field":
			pool[cmd.ref][cmd.field] = cmd.value
			events.append({"kind":"corpse_field","ref":cmd.ref,"field":cmd.field,"value":cmd.value})
			receipt.applied = true
			receipt.ref = cmd.ref
			receipt.corpse_after = pool[cmd.ref].duplicate(true)
		elif cmd.op == "addParts":
			events.append({"kind":"addParts","x":actor.x,"y":actor.y,"col":cmd.col,"count":cmd.count})
			receipt.executed = true
		receipt.actor_after = actor.duplicate(true)
		return receipt
	func read_player() -> Dictionary:
		player_reads += 1
		return current_player.duplicate()

var policy: RefCounted = Policy.new()
var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
var fire_cases: int = 0
var source_sha: String = ""
var node_bin: String = ""
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func _check(ok: bool,label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("EC3_05_FAIL ",label)
func _same(a: Variant,b: Variant,label: String) -> void:
	var error: String = _mismatch(a,b)
	_check(error.is_empty(),label+" "+error)
func _mismatch(a: Variant,b: Variant,path: String = "") -> String:
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
			return path+" array size"
		for i in range(a.size()):
			var error: String = _mismatch(a[i],b[i],path+"/"+str(i))
			if not error.is_empty():
				return error
		return ""
	return "" if typeof(a) == typeof(b) and a == b else path+" type/value mismatch"

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC3_05_INVALID_ISOLATION")
		quit(2)
		return
	_check(not node_bin.is_empty(),"explicit --node-bin required")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		for row in oracle.cases:
			_compare(row)
		for chain in oracle.chains:
			var owner: OwnerFixture = null
			for row in chain:
				if owner != null:
					_same(owner.actor,row.actor,"next tick actor state")
					_same(owner.pool,row.pool,"next tick corpse fields; no consumed flag invented")
				owner = _compare(row,owner)
	_golden()
	_diagnostics()
	print("EC3_05_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"fire_cases":fire_cases,"source_sha256":source_sha,"skipped":[],"full_tick":false,"product_connected":false,"hypot_provider":"source oracle receipt; actual binding HOLD","numeric_tolerance":0}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)
func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec3-05-source-oracle.cjs")
	var receipt: String = OS.get_user_data_dir().path_join("ec3-05-source-oracle.json")
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
	_check(data.sha256 == source_sha and data.block_sha256 == BLOCK_SHA256,"original source/absorb block pins")
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

func _drive(owner: OwnerFixture, stream: Stream) -> Dictionary:
	var before: Dictionary = owner.actor.duplicate(true)
	var result: Dictionary = policy.begin(owner.actor,owner.row.context)
	_same(owner.actor,before,"begin caller immutable")
	var requests: int = 0
	while result.status == "READY" and not result.done and requests < 30:
		requests += 1
		var token: Dictionary = result.continuation
		var token_before: Dictionary = token.duplicate(true)
		var ack: Dictionary = owner.acknowledge(result.command)
		result = policy.resume(token,ack,stream.sample,owner.readers())
		_same(token,token_before,"resume token immutable")
	_check(result.status == "READY" and result.get("done",false),"acknowledged sequence done: "+str(result.get("reason")))
	return result
func _compare(row: Dictionary, previous: OwnerFixture = null) -> OwnerFixture:
	oracle_cases += 1
	var before: Dictionary = row.duplicate(true)
	var owner: OwnerFixture = OwnerFixture.new(row) if previous == null else previous
	if previous != null:
		owner.row = row.duplicate(true)
		owner.events = []
		owner.queries = []
		owner.hypots = row.queries.filter(func(v: Dictionary) -> bool: return v.kind == "hypot")
		owner.hypot_index = 0
		owner.length_reads = 0
	var stream := Stream.new([row.u])
	var result: Dictionary = _drive(owner,stream)
	if result.status != "READY":
		return owner
	_same(owner.events,row.events,"original ordered field writes/FX/binding")
	_same(owner.queries,row.queries,"fresh ens length/entry/dead/positions/HP queries")
	_same(owner.actor,row.after,"actor source readback")
	_same(result.actor,row.after,"done returns the final confirmed actor snapshot")
	_same(owner.pool,row.pool_after,"corpse remains in original registry, coordinates only")
	_same(owner.refs,row.refs_after,"original current ens order")
	_same(stream.used,row.used,"own RNG exact consumption")
	_check(result.draws == stream.used.size() and not stream.overflow,"draw count/no overconsumption")
	_check(owner.bound == row.bound and owner.player_reads == 0,"deferred callback, no entry P read")
	_check(owner.hypot_index == owner.hypots.size(),"every source hypot receipt consumed at original site")
	_check(not result.full_tick and not result.product_connected,"no actual actor/registry/HP writer adoption")
	_same(row,before,"source fixture inputs immutable")
	for fire in row.fires:
		fire_cases += 1
		owner.actor.x = fire.context.ex
		owner.actor.y = fire.context.ey
		owner.current_player = {"x":fire.context.px,"y":fire.context.py}
		var saved: Dictionary = owner.actor.duplicate(true)
		var packet: Dictionary = policy.fire(owner.actor,owner.read_player)
		_same(owner.actor,saved,"fire actor immutable")
		_check(packet.status == "READY" and packet.commands.size() == 2 and packet.draws == 0,"deferred shot packet")
		if packet.status != "READY":
			continue
		var events: Array = []
		events.append(packet.commands[0].duplicate(true))
		if row.options.get("mutate_fire",false):
			owner.actor.x = 77.0
			owner.actor.y = -88.0
		var txt: Dictionary = packet.commands[1]
		_same(txt.position_ref,"actor","FX reads actor AFTER projectile request")
		events.append({"op":"addTxt","x":owner.actor.x,"y":owner.actor.y+txt.offset_y,"text_key":txt.text_key,"col":txt.col,"life":txt.life})
		_same(events,fire.events,"original callback current aim and late FX values exact")
	_check(owner.player_reads == row.fires.size(),"exactly one CURRENT P read per callback")
	return owner
func _fixture() -> Dictionary:
	return {"actor":{"etype":42,"s":"idle","x":0.0,"y":0.0,"hp":10.0,"mhp":100.0,"st2":9.0,"_fmAbsorbCd":0.0,"_fmSpitT":0.0,"_fmSpitCd":220.0},"context":{"d":100.0,"sp":1.0},"pool":{"a":{"dead":true,"x":3.0,"y":4.0},"b":{"dead":true,"x":1.0,"y":0.0}},"refs":["a","b"],"queries":[{"kind":"hypot","value":5.0}],"options":{}}
func _golden() -> void:
	var owner := OwnerFixture.new(_fixture())
	var stream := Stream.new([0.5])
	var r: Dictionary = _drive(owner,stream)
	_same([owner.actor.hp,owner.actor._fmAbsorbCd,owner.actor._fmSpitT],[25.0,210.0,220.0],"golden 15% heal / 180+60*.5 / SpitCd reset")
	_same([owner.pool.a.x,owner.pool.a.y,owner.pool.b.x],[-9999.0,-9999.0,1.0],"first matching corpse, not closest")
	_same(owner.refs,["a","b"],"no registry removal")
	_same([owner.actor.s,owner.actor.st2,owner.actor._swChargeEl],["eShootWind",60.0,3],"60 tick D windup")
	_check(owner.events.size() == 12 and owner.bound,"clock2+reset+hp+corpseXY+parts+arm4+binding")
	for hp in [99.0,100.0,120.0]:
		var f: Dictionary = _fixture()
		f.actor.hp = hp
		owner = OwnerFixture.new(f)
		r = _drive(owner,Stream.new([0.0]))
		_same(owner.actor.hp,100.0,"full/overfull HP still clamp per original")
		_same(owner.pool.a.x,-9999.0,"even full HP consumes corpse coordinates")
	var init_stream := Stream.new([0.25,0.5,0.75,0.5])
	var init: Dictionary = Catalog.new().build({"stage":10,"etype":42},init_stream.sample)
	_same([init.fields._fmAbsorbCd,init.fields._fmSpitCd,init.fields._fmSpitT],[195.0,240.0,110.0],"EC3-02 three ordered initial draws")
	var f: Dictionary = _fixture()
	f.actor.merge(init.fields,true)
	f.actor._fmAbsorbCd = 0.0
	f.actor._fmSpitT = 0.0
	owner = OwnerFixture.new(f)
	r = _drive(owner,init_stream)
	_same([owner.actor._fmAbsorbCd,owner.actor._fmSpitT],[210.0,240.0],"initializer then same-stream absorb/spit")
	_same(init_stream.used,[0.25,0.5,0.75,0.5],"no reseed/unowned draw")
func _diagnostics() -> void:
	for key in ["etype","x","y","hp","mhp","st2","_fmAbsorbCd","_fmSpitT","_fmSpitCd"]:
		for bad in [null,true,"1",NAN,INF]:
			var f: Dictionary = _fixture()
			f.actor[key] = bad
			_check(policy.begin(f.actor,f.context).status == "NOT_READY","invalid actor "+key)
	for key in ["d","sp"]:
		for bad in [null,true,"1",NAN,INF,-1.0]:
			var f: Dictionary = _fixture()
			f.context[key] = bad
			_check(policy.begin(f.actor,f.context).status == "NOT_READY","invalid context "+key)
	var f: Dictionary = _fixture()
	for etype in [20,40,41,43,47,49,42.5]:
		f.actor.etype = etype
		_check(policy.begin(f.actor,f.context).status == "NOT_READY","other type admission denied")
	for bad in [null,true,".5",-0.1,1.0,NAN,INF]:
		var owner := OwnerFixture.new(_fixture())
		var first: Dictionary = policy.begin(owner.actor,owner.row.context)
		var ack: Dictionary = owner.acknowledge(first.command)
		var stream := Stream.new([bad])
		var r: Dictionary = policy.resume(first.continuation,ack,stream.sample,owner.readers())
		_check(r.status == "NOT_READY" and r.reason == "invalid_random_sample" and r.draws == 1 and not r.has("command"),"late RNG failure preserves consumed count, no heal")
		_same([owner.actor._fmAbsorbCd,owner.actor._fmSpitT,owner.actor.hp],[-1.0,-1.0,10.0],"already ACKed clock prefix is not rolled back or hidden")
	var owner := OwnerFixture.new(_fixture())
	var first: Dictionary = policy.begin(owner.actor,owner.row.context)
	var stream := Stream.new([0.5])
	_check(policy.resume(first.continuation,{},stream.sample,owner.readers()).reason == "owner_ack_missing_or_stale","no ACK cannot advance")
	var ack: Dictionary = owner.acknowledge(first.command)
	for key in ["ack","seq","op","applied","actor_after"]:
		var bad_ack: Dictionary = ack.duplicate(true)
		bad_ack.erase(key)
		_check(policy.resume(first.continuation,bad_ack,stream.sample,owner.readers()).status == "NOT_READY","required receipt "+key)
	var wrong: Dictionary = ack.duplicate(true)
	wrong.actor_after._fmSpitT = 99.0
	_check(policy.resume(first.continuation,wrong,stream.sample,owner.readers()).reason == "actor_write_readback_mismatch","lying clock readback rejected")
	_check(stream.used.is_empty(),"invalid ACK before RNG")
	var reset: Dictionary = policy.resume(first.continuation,ack,stream.sample,owner.readers())
	ack = owner.acknowledge(reset.command)
	_check(policy.resume(reset.continuation,ack,stream.sample,{}).reason == "missing_reader_length","missing actual registry binding not fallback")
	for bad in [null,true,-1.0,NAN,INF]:
		var readers: Dictionary = owner.readers()
		readers.hypot = func(_x: float,_y: float) -> Variant: return bad
		_check(policy.resume(reset.continuation,ack,stream.sample,readers).reason == "invalid_source_hypot","invalid source math receipt")
	var heal: Dictionary = policy.resume(reset.continuation,ack,stream.sample,owner.readers())
	var heal_ack: Dictionary = owner.acknowledge(heal.command)
	var xwrite: Dictionary = policy.resume(heal.continuation,heal_ack,stream.sample,owner.readers())
	ack = owner.acknowledge(xwrite.command)
	wrong = ack.duplicate(true)
	wrong.ref = "other"
	_check(policy.resume(xwrite.continuation,wrong,stream.sample,owner.readers()).reason == "corpse_write_unconfirmed","wrong corpse identity rejected")
	wrong = ack.duplicate(true)
	wrong.corpse_after.x = 0.0
	_check(policy.resume(xwrite.continuation,wrong,stream.sample,owner.readers()).reason == "corpse_write_unconfirmed","unapplied x cannot reach y/FX")
	var ywrite: Dictionary = policy.resume(xwrite.continuation,ack,stream.sample,owner.readers())
	ack = owner.acknowledge(ywrite.command)
	var parts: Dictionary = policy.resume(ywrite.continuation,ack,stream.sample,owner.readers())
	ack = owner.acknowledge(parts.command)
	wrong = ack.duplicate(true)
	wrong.executed = false
	_check(policy.resume(parts.continuation,wrong,stream.sample,owner.readers()).reason == "effect_unconfirmed","no FX ACK cannot arm spit")
	var arm: Dictionary = policy.resume(parts.continuation,ack,stream.sample,owner.readers())
	ack = owner.acknowledge(arm.command)
	wrong = ack.duplicate(true)
	wrong.erase("fire_binding")
	_check(policy.resume(arm.continuation,wrong,stream.sample,owner.readers()).reason == "fire_binding_unconfirmed","windup without binding not accepted")
	for bad in [{},{"owner":"other"},{"owner":Policy.OWNER,"e":null,"pending":{}}]:
		_check(policy.resume(bad,{},stream.sample,{}).status == "NOT_READY","invalid continuation")
	_check(policy.fire(_fixture().actor,Callable()).status == "NOT_READY","missing current P callback")
	_check(policy.fire(_fixture().actor,func() -> Dictionary: return {}).status == "NOT_READY","current P fields missing")
