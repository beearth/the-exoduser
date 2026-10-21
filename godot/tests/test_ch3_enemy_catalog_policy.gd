extends SceneTree
## EC3-02: literal slice only; source mkEn is an isolated JS fixture, not Godot actor.
const Policy = preload("res://scripts/native_ch3_enemy_catalog_policy.gd")
const Constructor = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
const USERDIR = "EXODUSER-ec3-02-Isolated-20261020"
const SOURCE_SHA256 = preload("res://source_snapshot/snapshot.gd").SHA256
const FIELD_SHA256 = "31221a11f3cdd18e3e5cc9db723685e663e207b69faa136fa24f3f28a55d680a"
const CATALOG_SHA256 = "2dbfc1df07aa9d46f52e8336d8c2a9b240bfaf10844cd5b52ef7dc024b3a5e41"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8');
function between(a,b){const i=raw.indexOf(a),j=raw.indexOf(b,i+a.length);if(i<0||j<0)throw Error(a);return raw.slice(i,j)}
function line(a){const i=raw.indexOf(a);if(i<0)throw Error(a);return raw.slice(i,raw.indexOf('\\n',i)+1)}
const block=between('    _wraithPhaseT:','    // ═══ 4장 고통의 화염지대 전용');
const names=Array.from(block.matchAll(/(_[A-Za-z0-9]+):/g),x=>x[1]);if(names.length!==38)throw Error('field count');
const literalPin=between('const ETYPE_HP=','//               근접:');
let constructor=between('function _enemyHpPacing(lv)','// 쉴드+원거리 포메이션 스폰');
const start='_wraithPhaseT:etype===40?(120+Math.random()*60):9999,';
const end='_erraticT:etype===50?(30+Math.random()*30):9999,';
if(!constructor.includes(start)||!constructor.includes(end))throw Error('literal boundary');
// Read-only instrumentation: zero RNG, no changed field expression. Observe the
// exact source stream boundary; do not move the block to a new constructor site.
constructor=constructor.replace(start,"_wraithPhaseT:(mark('start'),etype===40?(120+Math.random()*60):9999),").replace(end,"_erraticT:(mark('end'),etype===50?(30+Math.random()*30):9999),");
const c=vm.createContext({window:{},OPT:{diff:5},P:{lv:1},G:{_stageDiffOff:0},canMv:()=>true,safePt:()=>{throw Error('outside admission fixture')},_useGPU:false,_useGL:false,_assignMobSkin:()=>{}});
const extract=line('const DIFF_LV_OFF=')+line('const DIFF_MUL=')+line('const EL=')+line('const ETYPE_ERES=')+line('const ELC=')+literalPin+
 between('const CHAPTER_STAGES=[','const TOTAL_STAGES=')+line('const TOTAL_STAGES=')+between('const SI_TO_HELL=new','// 대표맵=')+
 'const HELL_THEMES=Array.from({length:7},()=>[{}]),HELL_BOSSES=Array.from({length:7},()=>["fixture"]);const _CH1_OPENING_EXCLUDED_ET=new Set();\\n'+between('const STG=[];','let G={on:false')+
 between('const RARE_ETYPE=','// ═══ 장별 몬스터 스폰 풀')+between('const ELITE_TIERS=','// 적이 플레이어에게 데미지를 줄 때')+constructor;
vm.runInContext(extract,c,{timeout:1000});
vm.runInContext('Object.defineProperty(globalThis,"_noProjEtypes",{get:()=>window._noProjEtypes});var realElite=rollElite;rollElite=(si)=>forced===null?realElite(si):forced;Math.random=()=>draw()',c);
c.draw=()=>{if(c.used.length>=c.inputs.length)throw Error('exhausted');const v=c.inputs[c.used.length];c.used.push(v);return v};
c.mark=site=>c.marks.push({site,at:c.used.length});
let seed=20261020;function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
const bits=v=>{const b=Buffer.alloc(8);b.writeDoubleLE(v);return b.toString('base64')};
const cases=[];
for(let stage=10;stage<=13;stage++)for(let etype=40;etype<=49;etype++)for(const tier of [null,0,1,2,3])for(const pattern of ['zero','half','upper','ramp','random']){
 const values=Array.from({length:80},(_,i)=>pattern==='zero'?0:pattern==='half'?.5:pattern==='upper'?1-Number.EPSILON/2:pattern==='ramp'?(i%16)/16:rnd());
 c.inputs=values.slice();c.used=[];c.marks=[];c.forced=tier;
 const e=vm.runInContext('mkEn(100,200,'+stage+','+etype+',false,undefined,7)',c,{timeout:1000});
 const prefix=c.marks[0].at,endAt=c.marks[1].at;if(c.marks[0].site!=='start'||c.marks[1].site!=='end')throw Error('mark order');
 const fields=Object.fromEntries(names.map(k=>[k,e[k]]));
 const catalog=JSON.parse(vm.runInContext('JSON.stringify({hp:ETYPE_HP['+etype+'],atk:ETYPE_ATK['+etype+'],raw_speed:_ETYPE_SPD_RAW['+etype+'],speed:ETYPE_SPD['+etype+'],r:ETYPE_R['+etype+'],poise:ETYPE_POISE['+etype+'],shield:ETYPE_SHIELD['+etype+'],range:ETYPE_RANGE['+etype+'],col:ETYPE_COL['+etype+']})',c));
 cases.push({context:{stage,etype},pattern,tier,values,used:c.used.slice(),used64:c.used.map(bits),prefix,fieldDraws:endAt-prefix,suffix:c.used.length-endAt,fields,catalog,originalActorSpeed:e.speed,originalActorHp:e.hp});
}
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v}
fs.writeFileSync(process.argv[3],JSON.stringify({sha256:hash(raw),field_sha256:hash(block),catalog_sha256:hash(literalPin),fieldNames:names,cases:pack(cases)}),'utf8');
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
		printerr("EC3_02_FAIL ",label)
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
		printerr("EC3_02_INVALID_ISOLATION")
		quit(2)
		return
	_check(not node_bin.is_empty(),"explicit --node-bin required")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		_same(oracle.fieldNames,Policy.FIELDS.map(func(row: Array) -> String: return row[0]),"source all38 field names/order")
		for row in oracle.cases:
			_compare(row)
		_test_catalog_contracts(oracle)
	_test_diagnostics()
	print("EC3_02_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"owned_fields":Policy.FIELDS.size(),"source_sha256":source_sha,"skipped":[],"complete_actor":false,"product_connected":false,"public_play_evidence":false}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)

func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH).simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec3-02-source-oracle.cjs")
	var receipt: String = OS.get_user_data_dir().path_join("ec3-02-source-oracle.json")
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
	_check(data.sha256 == source_sha and data.field_sha256 == FIELD_SHA256 and data.catalog_sha256 == CATALOG_SHA256,"original source/literal/catalog pins")
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

func _compare(row: Dictionary) -> void:
	oracle_cases += 1
	var context: Dictionary = row.context.duplicate(true)
	var before: Dictionary = context.duplicate(true)
	var stream := Stream.new(row["values"])
	# Fixture replay of observed original core draws, NOT a Godot CH3 core.
	var outside := Constructor.Draws.new(stream.sample)
	for i in range(int(row.prefix)):
		outside.sample()
	var result: Dictionary = policy.build(context,stream.sample)
	_check(result.status == "READY" and result.complete_actor == false,"partial projection ready")
	if result.status != "READY":
		return
	_same(result.fields,row.fields,"original38 literal values")
	_same(result.fields.keys(),row.fields.keys(),"literal insertion order")
	_same(result.catalog,row.catalog,"original catalog10/zero SPD mapping")
	_check(result.draws == int(row.fieldDraws) and result.fields.size() == 38,"only matching dedicated draws/38 fields")
	_check(stream.used.size() == int(row.prefix+row.fieldDraws),"correct position after original orbit draw")
	for i in range(int(row.suffix)):
		outside.sample()
	_same(stream.used,row.used,"whole original numeric fixture sequence")
	var bits: Array = []
	for value in stream.used:
		bits.append(Marshalls.raw_to_base64(PackedFloat64Array([value]).to_byte_array()))
	_same(bits,row.used64,"entire original consumed binary64 bits")
	_check(not stream.overflow and outside.error.is_empty() and row.suffix == 1,"suffix erratic draw left to owner")
	_same(context,before,"context immutable")
	_same(stream.values,row["values"],"provider input immutable")
	_check(not result.fields.has("hp") and not result.fields.has("_wildChargeCd") and not result.fields.has("_bossOrbitAng") and not result.fields.has("_erraticAng"),"no HP/CH2/surrounding field authority")

func _test_catalog_contracts(oracle: Dictionary) -> void:
	_check(Policy.CATALOG.size() == 10 and Policy.FIELDS.size() == 38,"catalog10/fields38")
	var counts: Array = [2,4,3,2,2,2,4,3,4,6]
	for etype in range(40,50):
		var stream := Stream.new([0.0,0.0,0.0,0.0,0.0,0.0])
		var result: Dictionary = policy.build({"stage":10,"etype":etype},stream.sample)
		_check(result.status == "READY" and result.draws == counts[etype-40],"matching draws only per type")
		_check(result.fields._wraithPhasing == false and result.fields._dkGuarding == false and result.fields._wdSwoopOx == 0 and result.fields._wdSwoopOy == 0,"unconditional literal flags/coords")
		_check(result.fields._adPhase == (0 if etype == 49 else -1),"phase nonmatching -1")
		_check(result.fields._torBleed == (0.4 if etype == 44 else 0),"conditional bleed literal, no draw")
	_check(policy.catalog_for(44).r == 10,"source44 radius10, catalog doc radius8 differs")
	_check(policy.catalog_for(46).raw_speed == 0 and policy.catalog_for(46).speed == 0,"46 distinct zero mapping, not .2 floor")
	_check(policy.catalog_for(41).shield == 70 and policy.catalog_for(46).shield == 80,"catalog percentages only, not generated shield")
	var source_jitter: int = 0
	for row in oracle.cases:
		if row.context.etype == 46 and row.originalActorSpeed > 0:
			source_jitter += 1
	_check(source_jitter > 0,"source46 constructor jitter exists outside this catalog; no Godot speed construction claim")
	var core := Constructor.new()
	var stream := Stream.new([0.5])
	var refused: Dictionary = core.build({"stage":10,"etype":40,"difficulty":5,"player_level":1,"stage_difficulty_offset":0},stream.sample,{})
	_check(refused.status == "NOT_READY" and refused.reason == "unsupported_stage" and stream.used.is_empty(),"EC2-02 full-core guard unchanged, no type33/stage4 coercion")

func _test_diagnostics() -> void:
	for stage in [-1,0,4,9,14]:
		var stream := Stream.new([0.0])
		_same(policy.build({"stage":stage,"etype":40},stream.sample),{"status":"NOT_READY","reason":"unsupported_stage","draws":0,"complete_actor":false},"unsupported stage")
		_check(stream.used.is_empty(),"no RNG on bad stage")
	for etype in [0,30,39,50,99]:
		var stream := Stream.new([0.0])
		_same(policy.build({"stage":10,"etype":etype},stream.sample),{"status":"NOT_READY","reason":"unsupported_etype","draws":0,"complete_actor":false},"unsupported type")
		_check(policy.catalog_for(etype).is_empty() and stream.used.is_empty(),"catalog/domain no fallback")
	for key in ["stage","etype"]:
		for bad in [null,true,"10",NAN,INF,10.5]:
			var context: Dictionary = {"stage":10,"etype":40}
			context[key] = bad
			var stream := Stream.new([0.0])
			_check(policy.build(context,stream.sample).status == "NOT_READY" and stream.used.is_empty(),"malformed context no RNG")
	_same(policy.build({"stage":10,"etype":40},Callable()),{"status":"NOT_READY","reason":"invalid_random_callable","draws":0,"complete_actor":false},"unbound RNG")
	var counts: Array = [2,4,3,2,2,2,4,3,4,6]
	for etype in range(40,50):
		for offset in range(counts[etype-40]):
			for bad in [null,true,"0",-0.01,1.0,NAN,INF,-INF]:
				var prefix: Array = []
				prefix.resize(offset)
				prefix.fill(0.5)
				var stream := Stream.new(prefix+[bad])
				_same(policy.build({"stage":13,"etype":etype},stream.sample),{"status":"NOT_READY","reason":"invalid_random_sample","draws":offset+1,"complete_actor":false},"EC2 Draws rejects bad sample at exact literal site")
				_check(stream.used.size() == offset+1 and not stream.overflow,"no rewind/extra sample after failure")
