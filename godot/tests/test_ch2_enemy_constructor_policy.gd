extends SceneTree
## EC2-02 numeric constructor projection; exact original JS oracle, no Main/actor.
const Policy = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
const USERDIR = "EXODUSER-ec2-02-Isolated-20261020"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8');
function between(a,b){let i=raw.indexOf(a);if(i<0)throw Error(a);let j=raw.indexOf(b,i+a.length);if(j<0)throw Error(b);return raw.slice(i,j);}
function line(a){let i=raw.indexOf(a);if(i<0)throw Error(a);return raw.slice(i,raw.indexOf('\\n',i)+1);}
const c=vm.createContext({window:{},OPT:{diff:5},P:{lv:1},G:{_stageDiffOff:0},canMv:()=>true,safePt:()=>{throw Error('outside collision fixture')},_useGPU:false,_useGL:false,_assignMobSkin:()=>{}});
const extract=line('const DIFF_LV_OFF=')+line('const DIFF_MUL=')+line('const EL=')+line('const ETYPE_ERES=')+line('const ELC=')+
 between('const ETYPE_HP=','//               근접:')+
 between('const CHAPTER_STAGES=[','const TOTAL_STAGES=')+line('const TOTAL_STAGES=')+between('const SI_TO_HELL=new','// 대표맵=')+
 'const HELL_THEMES=Array.from({length:7},()=>[{}]),HELL_BOSSES=Array.from({length:7},()=>["fixture"]);const _CH1_OPENING_EXCLUDED_ET=new Set();\\n'+
 between('const STG=[];','let G={on:false')+
 between('const RARE_ETYPE=','// ═══ 장별 몬스터 스폰 풀')+
 between('const ELITE_TIERS=','// 적이 플레이어에게 데미지를 줄 때')+
 between('function _enemyHpPacing(lv)','// 쉴드+원거리 포메이션 스폰');
vm.runInContext(extract,c,{timeout:1000});
vm.runInContext('var noProj=window._noProjEtypes;Object.defineProperty(globalThis,"_noProjEtypes",{get:()=>window._noProjEtypes});var baseElite=rollElite,baseMods=rollMods,baseAura=rollAura;var events=[],used=[],provided=[],input=[],forceTier=null;Math.random=()=>{if(!input.length)throw Error("exhausted");let x=input.shift();used.push(x);return x};rollElite=(stage)=>{let at=used.length,v=forceTier===null?baseElite(stage):forceTier;events.push({kind:"elite",stage,tier:-1,at,draws:used.length-at,value:v});return v};rollMods=(tier,stage)=>{let at=used.length,v=baseMods(tier,stage);events.push({kind:"mods",stage,tier,at,draws:used.length-at,value:v});return v};rollAura=(tier,stage)=>{let at=used.length,v=baseAura(tier,stage);events.push({kind:"aura",stage,tier,at,draws:used.length-at,value:v});return v}',c);
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return {$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v;}
const cases=[];let seed=20261020;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const timerNames=Array.from(raw.slice(raw.indexOf('// ═══ 2장 벌레굴 전용 ═══'),raw.indexOf('_bossOrbitAng:Math.random()')).matchAll(/(_[A-Za-z]+):/g),x=>x[1]);
const keys=['etype','ib','lv','hp','mhp','atk','baseAtk','speed','baseSpd','r','poise','maxPoise','poiseR','eShield','eShieldMax','eShieldRegenT','elite','mods','aura','projCd','st2','facing','projT','bossPatT',...timerNames,'_bossOrbitAng','_erraticAng'];
function add(ctx,prefix=[],label='natural',forced=null){
 const values=[...prefix,...Array.from({length:40},rnd)];c.input=values.slice();c.used=[];c.events=[];c.forceTier=forced;c.P.lv=ctx.player_level;c.OPT.diff=ctx.difficulty;c.G._stageDiffOff=ctx.stage_difficulty_offset;
 const e=vm.runInContext('mkEn(100,200,'+ctx.stage+','+ctx.etype+',false,undefined,7)',c,{timeout:1000});
 const fields=Object.fromEntries(keys.map(k=>{if(!(k in e))throw Error('missing '+k);return[k,e[k]]}));fields.stage=ctx.stage;
 const cat=JSON.parse(vm.runInContext('JSON.stringify({hp:ETYPE_HP['+ctx.etype+'],atk:ETYPE_ATK['+ctx.etype+'],raw_speed:_ETYPE_SPD_RAW['+ctx.etype+'],speed:ETYPE_SPD['+ctx.etype+'],r:ETYPE_R['+ctx.etype+'],poise:ETYPE_POISE['+ctx.etype+'],shield:ETYPE_SHIELD['+ctx.etype+'],range:ETYPE_RANGE['+ctx.etype+'],col:ETYPE_COL['+ctx.etype+']})',c));
 cases.push({context:ctx,label,forced:forced!==null,values,used:c.used,events:c.events,fields,catalog:cat});
}
for(let stage=4;stage<=9;stage++)for(let etype=30;etype<=39;etype++){
 for(let difficulty=0;difficulty<=10;difficulty++)for(const player_level of [1,500,501])add({stage,etype,difficulty,player_level,stage_difficulty_offset:0});
 for(const player_level of [-10,0,10,499,1200,1.5])add({stage,etype,difficulty:5,player_level,stage_difficulty_offset:-.25});
 for(const [label,prefix]of [['normal',[.9]],['magic',[.02,.999]],['rare',[.019999,0,0]],['rare-M02',[.0,.5,1.5/9]],['elite-boundary',[.1]]])add({stage,etype,difficulty:5,player_level:1,stage_difficulty_offset:0},prefix,label);
 add({stage,etype,difficulty:10,player_level:501,stage_difficulty_offset:100},[.2,.6,1.5/9],'synthetic-champion',3);
}
// Explicit 500 transition, clamp and offset cases independent of the broad matrix.
for(const lv of [1,9,10,499.999999,500,500.000001,501,1500])add({stage:4,etype:32,difficulty:5,player_level:lv,stage_difficulty_offset:0},[.9],'hp-edge');
process.stdout.write(JSON.stringify({sha256:crypto.createHash('sha256').update(raw).digest('hex'),cases:pack(cases),timerNames}));
"""

class Stream extends RefCounted:
	var values: Array
	var used: Array = []
	var overflow: bool = false
	func _init(input: Array) -> void:
		values = input.duplicate(true)
	func sample() -> Variant:
		if used.size() >= values.size():
			overflow = true
			return NAN
		var value: Variant = values[used.size()]
		used.append(value)
		return value

class SourceFixture extends RefCounted:
	var expected: Array
	var stream: Stream
	var actual: Array = []
	var bad: bool = false
	func _init(events: Array, rng: Stream) -> void:
		expected = events.duplicate(true)
		stream = rng
	func consume(kind: String, tier: int, stage: int, random_unit: Callable) -> Variant:
		if actual.size() >= expected.size():
			bad = true
			return null
		var row: Dictionary = expected[actual.size()]
		var event := {"kind":kind,"tier":tier,"stage":stage,"at":stream.used.size(),"draws":row.draws,"value":row.value}
		actual.append(event)
		if row.kind != kind or row.tier != tier or row.stage != stage or row.at != stream.used.size():
			bad = true
		for index in range(int(row.draws)):
			random_unit.call()
		return int(row.value) if kind == "elite" else row.value
	func elite(stage: int, random_unit: Callable) -> Variant:
		return consume("elite",-1,stage,random_unit)
	func mods(tier: int, stage: int, random_unit: Callable) -> Variant:
		return consume("mods",tier,stage,random_unit)
	func aura(tier: int, stage: int, random_unit: Callable) -> Variant:
		return consume("aura",tier,stage,random_unit)
	func bindings() -> Dictionary:
		return {"elite":elite,"mods":mods,"aura":aura}

var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
var source_sha: String = ""
var node_bin: String = "node"
var policy: RefCounted = Policy.new()

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("EC2_02_FAIL ", label)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC2_02_INVALID_ISOLATION")
		quit(2)
		return
	var oracle: Dictionary = _oracle()
	if not oracle.is_empty():
		for row in oracle.cases:
			_compare(row)
		_test_literal_counts(oracle.cases)
	_test_refusals()
	print("EC2_02_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"source_sha256":source_sha,"skipped":[],"complete_actor":false,"public_play_evidence":false}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)

func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec2-02-source-oracle.cjs")
	_check(FileAccess.file_exists(source) and not FileAccess.file_exists(helper),"source exists / no helper overwrite")
	if failures > 0:
		return {}
	_check(DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir()) == OK,"isolated directory")
	var file: FileAccess = FileAccess.open(helper,FileAccess.WRITE)
	_check(file != null,"source helper create")
	if file == null:
		return {}
	file.store_string(SOURCE_PROBE)
	file.close()
	var output: Array = []
	var code: int = OS.execute(node_bin,PackedStringArray([helper,source]),output,true)
	_check(DirAccess.remove_absolute(helper) == OK,"own helper removed")
	_check(code == 0,"original source probe exit0")
	if code != 0:
		printerr("\n".join(output).left(1600))
		return {}
	var result: Variant = JSON.parse_string("\n".join(output))
	_check(result is Dictionary and result.get("cases",[]).size() > 0,"structured oracle nonempty")
	if not result is Dictionary:
		return {}
	source_sha = FileAccess.get_sha256(source)
	_check(result.sha256 == source_sha,"exact source bytes")
	result.cases = _unpack(result.cases)
	return result

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

func _same(actual: Variant, expected: Variant) -> bool:
	if (typeof(actual) == TYPE_INT or typeof(actual) == TYPE_FLOAT) and (typeof(expected) == TYPE_INT or typeof(expected) == TYPE_FLOAT):
		return float(actual) == float(expected)
	if actual is Dictionary and expected is Dictionary:
		if actual.size() != expected.size():
			return false
		for key in expected:
			if not actual.has(key) or not _same(actual[key],expected[key]):
				return false
		return true
	if actual is Array and expected is Array:
		if actual.size() != expected.size():
			return false
		for index in range(actual.size()):
			if not _same(actual[index],expected[index]):
				return false
		return true
	return actual == expected

func _compare(row: Dictionary) -> void:
	var rng := Stream.new(row["values"])
	var fixture := SourceFixture.new(row.events,rng)
	var before: Dictionary = row.duplicate(true)
	var result: Dictionary = policy.call("build",row.context,rng.sample,fixture.bindings())
	var label: String = JSON.stringify(row.context) + " " + row.label
	_check(result.status == "READY", "ready " + label)
	if result.status != "READY":
		return
	_check(result.fields.size() == row.fields.size(),"exact field set " + label)
	for key in row.fields:
		_check(_same(result.fields.get(key),row.fields[key]),"field " + key + " " + label + " got=" + str(result.fields.get(key)) + " expected=" + str(row.fields[key]))
	_check(_same(result.catalog,row.catalog),"separate catalog " + label)
	_check(_same(rng.used,row.used) and result.draws == row.used.size() and not rng.overflow,"exact draw sequence/count " + label)
	_check(_same(fixture.actual,row.events) and not fixture.bad,"source callback order/arguments/indices " + label)
	_check(_same(row,before) and _same(rng.values,row["values"]),"all inputs unchanged " + label)
	_check(result.complete_actor == false,"projection not actor")
	oracle_cases += 1

func _test_literal_counts(cases: Array) -> void:
	var seen: Dictionary = {}
	for row in cases:
		if row.label != "normal":
			continue
		var etype: int = int(row.context.etype)
		var special: int = 0 if etype in [31,33] else 4 if etype in [35,38] else 6 if etype == 39 else 2
		_check(row.used.size() == 9 + special,"source nonelite literal draws")
		seen["%s:%s" % [row.context.stage,etype]] = true
	_check(seen.size() == 60,"all ten types × six stages")
	var example: Array = cases.filter(func(row: Dictionary) -> bool: return row.label == "normal" and row.context.stage == 4 and row.context.etype == 32)
	_check(example.size() == 1 and example[0].fields.hp == 945 and example[0].fields.atk == 31 and example[0].fields.poise == 945 and example[0].fields.eShield == 945,"design L1 si4: final HP945/ATK31/defense945, not catalog96/18/40/60")

func _test_refusals() -> void:
	var context := {"stage":4,"etype":30,"difficulty":5,"player_level":1,"stage_difficulty_offset":0}
	var rng := Stream.new([0.5])
	var fixture := SourceFixture.new([],rng)
	for field in context:
		for bad in [null,true,"1",NAN,INF]:
			var input: Dictionary = context.duplicate(true)
			input[field] = bad
			var result: Dictionary = policy.call("build",input,rng.sample,fixture.bindings())
			_check(result.status == "NOT_READY" and result.draws == 0 and rng.used.is_empty(),"invalid context no RNG")
	for field in ["stage","etype","difficulty"]:
		var input: Dictionary = context.duplicate(true)
		input[field] = 4.5
		_check(policy.call("build",input,rng.sample,fixture.bindings()).status == "NOT_READY","nonintegral identity refused")
	for input in [context.merged({"stage":0},true),context.merged({"stage":10},true),context.merged({"etype":29},true),context.merged({"etype":40},true),context.merged({"difficulty":11},true)]:
		_check(policy.call("build",input,rng.sample,fixture.bindings()).draws == 0,"out of scope no RNG")
	_check(policy.call("build",context,Callable(),fixture.bindings()).status == "NOT_READY","invalid provider")
	for key in ["elite","mods","aura"]:
		var bindings: Dictionary = fixture.bindings()
		bindings.erase(key)
		_check(policy.call("build",context,rng.sample,bindings).draws == 0,"missing common source no default")
	_check(rng.used.is_empty(),"all preflight refusals sampled zero")
	for bad in [null,true,"0.5",-0.1,1.0,NAN,INF]:
		var broken := Stream.new([0.5,bad])
		var callbacks := SourceFixture.new([{ "kind":"elite","tier":-1,"stage":4,"at":0,"draws":1,"value":0}],broken)
		var result: Dictionary = policy.call("build",context,broken.sample,callbacks.bindings())
		_check(result.status == "NOT_READY" and result.reason == "invalid_random_sample" and result.draws == 2 and broken.used.size() == 2,"bad sample consumed, no repair/rewind")
	_check(policy.call("catalog_for",29).is_empty() and policy.call("catalog_for",40).is_empty(),"no foreign catalog")

	# Diagnose invalid common-provider results without inventing default selections.
	var bindings := {"elite":func(_s, _r): return 0,"mods":func(_t, _s, _r): return [],"aura":func(_t, _s, _r): return null}
	for bad in [-1,4,1.5,"1",null,true]:
		bindings.elite = func(_s, _r): return bad
		var result: Dictionary = policy.call("build",context,rng.sample,bindings)
		_check(result.status == "NOT_READY" and result.reason == "invalid_source_elite" and result.draws == 0,"invalid elite not replaced")
	bindings.elite = func(_s, _r): return 1
	for bad in [null,"M02",[1],["M02",true]]:
		bindings.mods = func(_t, _s, _r): return bad
		_check(policy.call("build",context,rng.sample,bindings).reason == "invalid_source_mods","invalid mods not replaced")
	bindings.elite = func(_s, _r): return 2
	bindings.mods = func(_t, _s, _r): return ["M02"]
	bindings.aura = func(_t, _s, _r): return false
	var aura_rng := Stream.new([0.1,0.2,0.3,0.4])
	var aura_result: Dictionary = policy.call("build",context,aura_rng.sample,bindings)
	_check(aura_result.reason == "invalid_source_aura" and aura_result.draws == 4 and aura_rng.used.size() == 4,"aura diagnosed at exact literal site")
	for position in [0,9,14]:
		var sequence: Array = []
		sequence.resize(position)
		sequence.fill(0.5)
		sequence.append(NAN)
		var late := Stream.new(sequence)
		var callbacks := SourceFixture.new([{"kind":"elite","tier":-1,"stage":4,"at":0,"draws":1,"value":0}],late)
		var result: Dictionary = policy.call("build",context.merged({"etype":39},true),late.sample,callbacks.bindings())
		_check(result.status == "NOT_READY" and result.draws == position+1 and late.used.size() == position+1 and not late.overflow,"late RNG fault retains consumed prefix")
	var catalog: Dictionary = policy.call("catalog_for",30)
	catalog.hp = -999
	_check(policy.call("catalog_for",30).hp == 22,"catalog result cannot mutate later calls")
