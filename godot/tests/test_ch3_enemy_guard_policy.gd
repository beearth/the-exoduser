extends SceneTree
## Pure calculation + dictionary-only command consumer fixture; no actual Player.
const Policy = preload("res://scripts/native_ch3_enemy_guard_policy.gd")
const Catalog = preload("res://scripts/native_ch3_enemy_catalog_policy.gd")
const USERDIR = "EXODUSER-ec3-04-Isolated-20261020"
const SOURCE_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const BLOCK_SHA256 = "48c917b48221179057b342667db5f1dd74a3ba6a1fa3faa04d2ed3843b8353dd"
const HURT_SHA256 = "1fab0a1f9cee51ab27ff2e39e03deb3e7e6c6a405db133b23b700e2c9ba81b7f"
const PREFIX_SHA256 = "5df1251ce9999fc9e34ba54eb228b679092923a2dea763e318d7f173874f551b"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8'),hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const start=raw.indexOf("  if(e.etype===41&&e.s==='idle'){");const end=raw.indexOf('  // 타락기사 방어',start);if(start<0||end<0)throw Error('guard boundaries');const block=raw.slice(start,end);
const hurt='  if(e.etype===41&&e._dkGuarding){dmg=~~(dmg*.5)}';if(!raw.includes(hurt))throw Error('hurt boundary');
const prefix=raw.slice(raw.indexOf(hurt),raw.indexOf('  if(!isDot){',raw.indexOf(hurt)));
const c=vm.createContext({});vm.runInContext('Math.random=()=>sample();function tick(e,P,d,sp){'+block+';return e}function hurtGate(e,dmg){'+hurt+';return dmg}function hurtPrefix(e,dmg,opts){'+prefix+';return dmg}',c);
let seed=20261020;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const nearby=(x,inc)=>{const b=Buffer.alloc(8);b.writeDoubleLE(x);b.writeBigUInt64LE(b.readBigUInt64LE()+(inc?1n:-1n));return b.readDoubleLE()};
const clone=x=>JSON.parse(JSON.stringify(x));
const owned=e=>Object.fromEntries(['_dkGuardT','_dkSlashT','_dkGuarding','s','st2','_telegraphT'].filter(k=>Object.hasOwn(e,k)).map(k=>[k,e[k]]));
let events,used,atDamage,reenter;
c.sample=()=>{if(used.length)throw Error('unexpected extra RNG');used.push(c.u);return c.u};
c._T=x=>x;c.addTxt=(x,y,text_key,col,life)=>events.push({kind:'addTxt',x,y,text_key,col,life});c.addParts=(x,y,col,count)=>events.push({kind:'addParts',x,y,col,count});c.shake=amount=>events.push({kind:'shake',amount});
c.hurtP=dmg=>{atDamage=clone(c.e);events.push({kind:'hurtP',dmg});if(reenter){Object.assign(c.e,{x:-200,y:300,col:'#new',s:'hurt',st2:7,_dkGuarding:false});Object.assign(c.p,{x:321,y:-123})}};
function run(actor,context,u,mutation,label){
 c.e=clone(actor);c.p={x:context.px,y:context.py};events=[];used=[];atDamage=null;reenter=mutation;c.u=u;
 c.tick(c.e,c.p,context.d,context.sp);
 return {actor:clone(actor),context,u,reenter:mutation,label,fields:owned(atDamage||c.e),commands:events,after:clone(c.e),used,atDamage};
}
const base=()=>({etype:41,s:'idle',x:10,y:20,atk:18,col:'#442233',st2:9,_dkGuardT:5,_dkGuardCd:170,_dkSlashT:4,_dkSlashCd:120,_dkGuarding:false,untouched:{sentinel:[42]}});
const cases=[];
for(const gt of [-1,0,1,2,90])for(const st of [-1,0,1,2,50])for(const sp of [0,.5,1,2,135])for(const guard of [false,true])for(const d of [0,nearby(45,false),45,nearby(45,true),nearby(1200,false),1200,nearby(1200,true)]){
 const e=base();e._dkGuardT=gt;e._dkSlashT=st;e._dkGuarding=guard;cases.push(run(e,{d,sp,px:100,py:200},[0,.5,1-Number.EPSILON/2][cases.length%3],false,'boundary'));
}
const attacks=[0,1,2.5,-1,-2.5,2147483647,2147483648,4294967296,1e20,Number.MAX_VALUE];
for(let i=0;i<500;i++){
 const e=base();e._dkGuardT=rnd()*200-80;e._dkSlashT=rnd()*80-40;e._dkGuarding=rnd()<.5;e._dkGuardCd=rnd()*250;e._dkSlashCd=rnd()*200;e.atk=attacks[i%attacks.length];if(i%2===0)e._telegraphT=rnd()*100;
 cases.push(run(e,{d:rnd()*1250,sp:rnd()*150,px:rnd()*500-250,py:rnd()*500-250},rnd(),i%3===0,'random'));
}
for(const s of ['windup','hurt','dead','recover'])for(const guard of [false,true]){const e=base();e.s=s;e._dkGuarding=guard;e._dkGuardT=-1;e._dkSlashT=-1;cases.push(run(e,{d:1,sp:200,px:100,py:200},.5,true,'non-idle'))}
// Explicit reentry fixtures: callback changes actor/P between hurtP and FX.
for(const guard of [false,true])for(const d of [0,44]){const e=base();e._dkGuarding=guard;e._dkGuardT=0;e._dkSlashT=0;cases.push(run(e,{d,sp:1,px:100,py:200},.5,true,'reentry'))}
const chains=[];for(let k=0;k<8;k++){let e=base();e._dkGuardT=k;e._dkSlashT=k/2;const chain=[];for(let i=0;i<80;i++){if(i%4===0)e.s='idle';else if(i%4===1)e.s='hurt';const row=run(e,{d:[100,44,45,1199,1200][i%5],sp:[1,.5,2][i%3],px:100,py:200},rnd(),false,'chain');chain.push(row);e=clone(row.after)}chains.push(chain)}
const gates=[];for(const etype of [0,20,40,41,42,47,49,90])for(const guard of [false,true])for(const dmg of [-4294967297,-2147483649,-19.9,-3,-1,0,1,3,19.9,2147483647,2147483648,4294967295,4294967296,4294967297,9007199254740991,1e20]){const e={etype,_dkGuarding:guard};gates.push({actor:e,dmg,value:c.hurtGate(e,dmg)})}
const suffix=[];for(const guard of [false,true])for(const dmg of [1,19,201,1000])for(const mhp of [100,1000]){const e={etype:41,_dkGuarding:guard,mhp};suffix.push({actor:e,dmg,before:c.hurtGate(e,dmg),after:c.hurtPrefix(e,dmg,{parryBlueBean:true})})}
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v}
fs.writeFileSync(process.argv[3],JSON.stringify({sha256:hash(raw),block_sha256:hash(block),hurt_sha256:hash(hurt),prefix_sha256:hash(prefix),cases:pack(cases),chains:pack(chains),gates:pack(gates),suffix:pack(suffix)}),'utf8');
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

var policy: RefCounted = Policy.new()
var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
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
		printerr("EC3_04_FAIL ",label)
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
		printerr("EC3_04_INVALID_ISOLATION")
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
				# Explicit external FSM transitions in the source fixture, not step.
				state.s = row.actor.s
				_same(state,row.actor,"sequential source input")
				state = _compare(row,state)
		for gate in oracle.gates:
			var result: Dictionary = policy.hurt_damage_projection(gate.actor,gate.dmg)
			_same(result,{"status":"READY","value":gate.value,"applied":gate.actor.etype == 41 and gate.actor._dkGuarding,"source_line":42156,"complete_hurte":false},"original guard trunc exact")
		for suffix in oracle.suffix:
			var result: Dictionary = policy.hurt_damage_projection(suffix.actor,suffix.dmg)
			_same(result.value,suffix.before,"guard is before source parry suffix")
			_check(suffix.after >= suffix.before,"original suffix cannot be pre-scaled by guard")
			if suffix.actor._dkGuarding and suffix.dmg == 19.0 and suffix.actor.mhp == 1000.0:
				_same([result.value,suffix.after],[9.0,100.0],"guard19->9 then source parry floor100, not50")
	_golden()
	_diagnostics()
	print("EC3_04_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"hurt_site_cases":256,"suffix_cases":16,"source_sha256":source_sha,"skipped":[],"full_tick":false,"product_connected":false,"numeric_tolerance":0}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)
func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec3-04-source-oracle.cjs")
	var receipt: String = OS.get_user_data_dir().path_join("ec3-04-source-oracle.json")
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
	_check(data.sha256 == source_sha and data.block_sha256 == BLOCK_SHA256 and data.hurt_sha256 == HURT_SHA256 and data.prefix_sha256 == PREFIX_SHA256,"original source/guard/hurt/suffix pins")
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

func _consume_fixture(actor: Dictionary, context: Dictionary, result: Dictionary, reenter: bool) -> Dictionary:
	# Dictionary-only semantic witness. No Node, actual hurtP, Main/World writer.
	var e: Dictionary = actor.duplicate(true)
	e.merge(result.fields,true) # MUST precede damage; never replay after callback.
	var p: Dictionary = {"x":context.px,"y":context.py}
	var events: Array = []
	var at_damage: Variant = null
	for cmd in result.commands:
		match cmd.kind:
			"hurtP":
				at_damage = e.duplicate(true)
				events.append(cmd.duplicate(true))
				if reenter:
					e.merge({"x":-200.0,"y":300.0,"col":"#new","s":"hurt","st2":7.0,"_dkGuarding":false},true)
					p.merge({"x":321.0,"y":-123.0},true)
			"addParts":
				_same([cmd.position_ref,cmd.color_ref],["player","actor.col"],"late bound parts source refs")
				events.append({"kind":"addParts","x":p.x,"y":p.y,"col":e.col,"count":cmd.count})
			"addTxt":
				_same(cmd.position_ref,"actor","late bound text source ref")
				events.append({"kind":"addTxt","x":e.x,"y":e.y+cmd.offset_y,"text_key":cmd.text_key,"col":cmd.col,"life":cmd.life})
			"shake":
				events.append(cmd.duplicate(true))
			_:
				_check(false,"unrecognized command")
	return {"events":events,"after":e,"atDamage":at_damage}
func _compare(row: Dictionary, actor_override: Dictionary = {}) -> Dictionary:
	oracle_cases += 1
	var actor: Dictionary = row.actor.duplicate(true) if actor_override.is_empty() else actor_override.duplicate(true)
	var before: Dictionary = actor.duplicate(true)
	var context: Dictionary = row.context.duplicate(true)
	var stream := Stream.new([row.u])
	var result: Dictionary = policy.step(actor,context,stream.sample)
	_check(result.status == "READY","source case ready "+str(oracle_cases))
	if result.status != "READY":
		return actor
	_same(result.fields,row.fields,"original state/timers before immediate request")
	_same(stream.used,row.used,"actual RNG consumption order")
	_check(result.draws == row.used.size() and not stream.overflow,"draw count/no overconsumption")
	_check(not result.full_tick and not result.product_connected,"partial scope only")
	_same(result.fields_timing,"before_commands","state applied before immediate hurtP")
	var consumed: Dictionary = _consume_fixture(actor,context,result,row.reenter)
	_same(consumed.events,row.commands,"original ordered hurtP/FX calls exact")
	_same(consumed.after,row.after,"reentry state never overwritten by stale projection")
	_same(consumed.atDamage,row.atDamage,"source state visible inside immediate hurtP")
	_same(actor,before,"caller actor immutable")
	_same(context,row.context,"caller context immutable")
	_check(not result.fields.has("hp") and not result.fields.has("poise") and not result.fields.has("x") and not result.fields.has("facing"),"no actual damage/movement/angle authority")
	return consumed.after
func _actor() -> Dictionary:
	return {"etype":41,"s":"idle","x":10.0,"y":20.0,"col":"#442233","atk":18.0,"st2":9.0,"_dkGuardT":5.0,"_dkGuardCd":170.0,"_dkSlashT":4.0,"_dkSlashCd":120.0,"_dkGuarding":false}
func _context(d: float = 100.0,sp: float = 1.0) -> Dictionary:
	return {"d":d,"sp":sp,"px":100.0,"py":200.0}
func _golden() -> void:
	var e: Dictionary = _actor()
	e._dkGuarding = true
	var stream := Stream.new([0.5])
	var r: Dictionary = policy.step(e,_context(),stream.sample)
	_same([r.fields._dkGuardT,r.fields._dkSlashT],[3.0,3.0],"guard T5->3 double / slash4->3 single")
	_check(stream.used.is_empty() and r.commands.is_empty(),"active guard no draw/no invented counter")
	e._dkGuarding = false
	e._dkGuardT = 1.0
	e._dkSlashT = 1.0
	r = policy.step(e,_context(44.0),stream.sample)
	_same([r.fields._dkGuardT,r.fields._dkGuarding,r.fields._dkSlashT],[109.0,true,120.0],"entry90+40*.5 then -1, simultaneous slash")
	_same([r.fields.s,r.fields.st2,r.fields._telegraphT],["windup",18.0,20.0],"windup fields before damage request")
	_same(r.commands.map(func(v: Dictionary) -> String: return v.kind),["hurtP","addParts","addTxt","shake"],"immediate damage first; no delayed callback")
	_same(r.commands[0],{"kind":"hurtP","dmg":23},"1.3x trunc23, no magic/angle options")
	_check(not r.fields.has("counter") and not r.fields.has("eShield"),"no frontal shield/counter invented")
	# Fresh streams for independent source entry cases.
	for d in [45.0,1200.0]:
		stream = Stream.new([0.5])
		r = policy.step(e,_context(d),stream.sample)
		_check(r.commands.is_empty(),"strict slash d boundary")
		_check(r.draws == (0 if d == 1200.0 else 1),"strict guard d1200 boundary")
	stream = Stream.new([0.0])
	r = policy.step(e,_context(44.0,135.0),stream.sample)
	_same([r.fields._dkGuardT,r.fields._dkGuarding],[170.0,false],"entry expires same tick and Cd assigned once")
	_check(r.commands.size() == 4 and r.fields._dkSlashT == 120.0,"expired guard does not cancel simultaneous slash")
	for s in ["windup","hurt","dead","recover"]:
		e.s = s
		e._dkGuarding = true
		stream = Stream.new([0.5])
		r = policy.step(e,_context(0.0,135.0),stream.sample)
		_same([r.fields._dkGuardT,r.fields._dkSlashT,r.fields._dkGuarding,r.fields.s,r.fields.st2],[e._dkGuardT,e._dkSlashT,true,s,e.st2],"non-idle entire block frozen")
		_check(r.commands.is_empty() and stream.used.is_empty(),"non-idle no RNG/damage")
		_same(policy.hurt_damage_projection(e,19.0).value,9,"hurt guard independent of idle/facing")
	var init_stream := Stream.new([0.2,0.4,0.6,0.8,0.5])
	var init: Dictionary = Catalog.new().build({"stage":10,"etype":41},init_stream.sample)
	_same([init.fields._dkGuardCd,init.fields._dkGuardT,init.fields._dkSlashCd,init.fields._dkSlashT],[160.0,96.0,124.0,56.0],"reuse EC3-02 four init draws")
	e = _actor()
	e.merge(init.fields,true)
	e._dkGuardT = 1.0
	e._dkSlashT = 1.0
	r = policy.step(e,_context(44.0),init_stream.sample)
	_same([r.fields._dkGuardT,r.fields._dkSlashT],[109.0,124.0],"initializer to guard/slash same RNG stream")
	_same(init_stream.used,[0.2,0.4,0.6,0.8,0.5],"no reseed/extra draw")
	e.merge(r.fields,true)
	for angle in [-PI,0.0,PI]:
		e.facing = angle
		_same(policy.hurt_damage_projection(e,-3.0).value,-1,"half trunc toward0, no frontal angle condition")
func _diagnostics() -> void:
	for bad in [null,true,false,"0.5",-0.1,1.0,NAN,INF,-INF]:
		var stream := Stream.new([bad])
		var e: Dictionary = _actor()
		e._dkGuardT = 0.0
		e._dkSlashT = 0.0
		var before: Dictionary = e.duplicate(true)
		var r: Dictionary = policy.step(e,_context(44.0),stream.sample)
		_check(r.status == "NOT_READY" and r.reason == "invalid_random_sample" and r.draws == 1,"invalid sample consumed once")
		_check(not r.has("fields") and not r.has("commands"),"no partial slash on invalid guard draw")
		_same(e,before,"failed draw no actual actor writes")
	var stream := Stream.new([0.5])
	for key in ["atk","st2","_dkGuardT","_dkGuardCd","_dkSlashT","_dkSlashCd"]:
		for bad in [null,true,"1",NAN,INF]:
			var e: Dictionary = _actor()
			e[key] = bad
			var r: Dictionary = policy.step(e,_context(),stream.sample)
			_check(r.status == "NOT_READY" and r.draws == 0 and not r.has("fields"),"invalid actor "+key)
	for key in ["d","sp"]:
		for bad in [null,true,"1",NAN,INF,-1.0]:
			var c: Dictionary = _context()
			c[key] = bad
			var r: Dictionary = policy.step(_actor(),c,stream.sample)
			_check(r.status == "NOT_READY" and r.draws == 0,"invalid context "+key)
	for etype in [0,20,40,42,47,49,41.5]:
		var e: Dictionary = _actor()
		e.etype = etype
		_check(policy.step(e,_context(),stream.sample).reason == "unsupported_etype","no other actor admission")
	for key in ["s","_dkGuarding","_telegraphT"]:
		var e: Dictionary = _actor()
		e[key] = null
		_check(policy.step(e,_context(),stream.sample).status == "NOT_READY","bad state/optional telegraph")
	_check(stream.used.is_empty(),"invalid inputs consume no RNG")
	_check(policy.step(_actor(),_context(),Callable()).reason == "invalid_random_callable","missing RNG")
	for bad in [{},{"etype":true},{"etype":41},{"etype":41,"_dkGuarding":1}]:
		_check(policy.hurt_damage_projection(bad,19.0).status == "NOT_READY","bad hurt actor")
	for bad in [null,true,"19",NAN,INF]:
		_check(policy.hurt_damage_projection(_actor(),bad).reason == "invalid_damage","bad damage")
	_same(policy.hurt_damage_projection({"etype":40},19.9).value,19.9,"unrelated type no trunc/fallback guard")
	# Position/color are symbolic read dependencies; no writer binding fabricated.
	var minimal: Dictionary = _actor()
	for key in ["x","y","col"]:
		minimal.erase(key)
	_check(policy.step(minimal,{"d":45.0,"sp":1.0},stream.sample).status == "READY","pure state does not require unused position/color snapshot")
