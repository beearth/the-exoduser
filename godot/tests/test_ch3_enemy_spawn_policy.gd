extends SceneTree
## EC3-01: original roll functions only; no actor/World/State or product RNG owner.
const Policy = preload("res://scripts/native_ch3_enemy_spawn_policy.gd")
const USERDIR = "EXODUSER-ec3-01-Isolated-20261020"
const SOURCE_SHA256 = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const FUNCTION_SHA256 = {"rollEtype": "b816226c2ae3db962ca2d82dc4730ab8817e6cbc314a42509dea6ee791f23d71", "rollEl": "84f0a33ae64d8d6a47eaaa8d46dd0084c315c3ac4b999a549593b6f6d55efbd6", "literals": "efb24d2f80a6e6f22057177c85fd920f73b47a4e0b27bfe1f28e11eb39f7e99c"}
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8');
function between(a,b){const i=raw.indexOf(a),j=raw.indexOf(b,i+a.length);if(i<0||j<0)throw Error('missing source '+a);return raw.slice(i,j)}
function fn(marker){const i=raw.indexOf(marker),j=raw.indexOf('\\n}',i);if(i<0||j<0)throw Error(marker);return raw.slice(i,j+2)}
const typeSource=fn('function rollEtype(si){'),elSource=fn('function rollEl(si){');
const literals=between('const CHAPTER_STAGES=[','const TOTAL_STAGES=')+between('const TOTAL_STAGES=','// ── 데모')+between('const SI_TO_HELL=new','// 대표맵=')+between('const EL={','const ETYPE_ERES=')+between('const HELL_SPAWN=[','function rollEtype(si){');
const c=vm.createContext({});vm.runInContext(literals+typeSource+elSource,c,{timeout:1000});
const tables=JSON.parse(vm.runInContext('JSON.stringify({pool:HELL_SPAWN[2],cdf:_HELL_CDF[2],ranged:HELL_SPAWN[2].filter(p=>_RANGED_ET.has(p[0])),el:HELL_EL[2],mapping:Array.from(SI_TO_HELL)})',c));
function adjacent(value,direction){if(value===0)return direction>0?Number.MIN_VALUE:-Number.MIN_VALUE;const b=Buffer.alloc(8);b.writeDoubleLE(value);b.writeBigUInt64LE(b.readBigUInt64LE()+BigInt(direction));return b.readDoubleLE()}
const edges=value=>[adjacent(value,-1),value,adjacent(value,1)].filter(x=>x>=0&&x<1);
const bits=value=>{const b=Buffer.alloc(8);b.writeDoubleLE(value);return b.toString('base64')};
const cases=[];
function add(stage,kind,values,label){c.inputs=values.slice();c.used=[];vm.runInContext('Math.random=()=>{if(!inputs.length)throw Error("oracle random exhaustion");const x=inputs.shift();used.push(x);return x}',c);const value=vm.runInContext((kind==='etype'?'rollEtype':'rollEl')+'('+stage+')',c,{timeout:1000});cases.push({stage,kind,values,label,value,used:Array.from(c.used),used64:Array.from(c.used,bits),draws:c.used.length})}
let state=20261020;function next(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296}
for(let stage=10;stage<=13;stage++){
 const gold=[['etype',[0,0]],['etype',[0,2/28]],['etype',[0,.999999]],['etype',[.5,0]],['etype',[.5,...Array(12).fill(6/136)]],['element',[.449999]],['element',[.45,0]],['element',[.45,2/6]],['element',[.45,.999999]]];gold.forEach(([k,v],i)=>add(stage,k,v,'gold-'+i));
 let lo=0;for(const [et,hi]of tables.cdf){add(stage,'etype',[.5,(lo+hi)/2,...Array(12).fill(0)],'cdf-mid-'+et);for(const value of edges(hi))add(stage,'etype',[.5,value,...Array(12).fill(0)],'cdf-edge-'+et);lo=hi}
 let sum=0;for(const[et,w]of tables.ranged){add(stage,'etype',[0,(sum+w/2)/28],'ranged-mid-'+et);sum+=w;for(const value of edges(sum/28))add(stage,'etype',[0,value],'ranged-edge-'+et)}
 for(const value of edges(.5))add(stage,'etype',[value,0],'type-branch');
 for(let n=0;n<=12;n++)add(stage,'etype',[.5,...Array(n).fill(6/136),0],'reject-'+n);
 for(const value of edges(.45))add(stage,'element',[value,0],'element-branch');
 for(let n=0;n<=6;n++)for(const value of edges(n/6))add(stage,'element',[.45,value],'element-edge-'+n);
 for(let n=0;n<100;n++){add(stage,'etype',Array.from({length:13},next),'stream-'+n);add(stage,'element',[next(),next()],'stream-'+n)}
}
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v}
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
fs.writeFileSync(process.argv[3],JSON.stringify({sha256:hash(raw),function_sha256:{rollEtype:hash(typeSource),rollEl:hash(elSource),literals:hash(literals)},tables:pack(tables),cases:pack(cases)}),'utf8');
"""
class ScriptedRandom extends RefCounted:
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
func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("EC3_01_FAIL ",label)
func _same(a: Variant,b: Variant,label: String) -> void:
	var error: String = _mismatch(a,b)
	_check(error.is_empty(),label+" "+error)
func _mismatch(a: Variant,b: Variant,path: String = "") -> String:
	if (typeof(a) == TYPE_INT or typeof(a) == TYPE_FLOAT) and (typeof(b) == TYPE_INT or typeof(b) == TYPE_FLOAT):
		return "" if float(a) == float(b) else path+" numeric mismatch"
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
		printerr("EC3_01_INVALID_ISOLATION")
		quit(2)
		return
	_check(not node_bin.is_empty(),"explicit --node-bin required")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		_test_tables(oracle.tables)
		for row in oracle.cases:
			_compare(row)
		_test_coverage(oracle.cases)
	_test_diagnostics()
	print("EC3_01_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"source_sha256":source_sha,"skipped":[],"product_connected":false,"public_play_evidence":false}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)
func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec3-01-source-oracle.cjs")
	var result_path: String = OS.get_user_data_dir().path_join("ec3-01-source-oracle.json")
	_check(FileAccess.file_exists(source) and not FileAccess.file_exists(helper) and not FileAccess.file_exists(result_path),"source/no temporary overwrite")
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
	var code: int = OS.execute(node_bin,PackedStringArray([helper,source,result_path]),output,true)
	_check(code == 0,"source probe exit0: "+"\n".join(output).left(600))
	var data: Variant = JSON.parse_string(FileAccess.get_file_as_string(result_path)) if FileAccess.file_exists(result_path) else null
	_check(DirAccess.remove_absolute(helper) == OK,"helper removed")
	_check(DirAccess.remove_absolute(result_path) == OK,"UTF8 receipt removed")
	_check(data is Dictionary and data.get("cases",[]).size() > 0,"structured source oracle")
	if not data is Dictionary:
		return {}
	_check(data.sha256 == source_sha,"oracle reads pinned source bytes")
	_same(data.function_sha256,FUNCTION_SHA256,"literal and original function pins")
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

func _test_tables(tables: Dictionary) -> void:
	_same(Policy.POOL,tables.pool,"every original pair/order")
	_check(tables.pool.size() == 30,"30 pool entries")
	var total: int = 0
	for pair in tables.pool:
		total += int(pair[1])
		_check(not (pair[0] >= 20 and pair[0] <= 39) and pair[0] < 90,"no CH1/2 exclusive or named insertion")
	var ranged: Array = []
	var ranged_total: int = 0
	for pair in tables.ranged:
		ranged.append(int(pair[0]))
		ranged_total += int(pair[1])
	_same(Policy.RANGED,ranged,"R set preserves original pool order")
	_check(total == 136 and ranged.size() == 11 and ranged_total == 28 and total-ranged_total == 108,"exact total/R/nonR weights")
	_check(11 not in ranged and 47 not in ranged and [47,14] in Policy.POOL,"common47 retained, 11/47 not R")
	_same(tables.el,[2,0.45],"source I bias .45")
	for stage in range(10,14):
		_check(tables.mapping[stage] == 2,"source stage/hell map")

func _compare(row: Dictionary) -> void:
	oracle_cases += 1
	var before: Array = row["values"].duplicate(true)
	var rng := ScriptedRandom.new(row["values"])
	var result: Dictionary = policy.call("pick_"+row.kind,int(row.stage),rng.sample)
	_same(result,{"status":"READY","value":int(row.value),"draws":int(row.draws)},"source value/count "+row.label)
	_same(rng.used,row.used,"exact source consumed binary64 sequence "+row.label)
	var actual_bits: Array = []
	for value in rng.used:
		actual_bits.append(Marshalls.raw_to_base64(PackedFloat64Array([value]).to_byte_array()))
	_same(actual_bits,row.used64,"source consumed binary64 bits "+row.label)
	_check(not rng.overflow and rng.used.size() == int(row.draws),"no extra samples")
	_same(row["values"],before,"caller input unchanged")
	_same(rng.values,before,"provider sequence unchanged")

func _test_coverage(cases: Array) -> void:
	var golden: Array = [[1,2],[7,2],[48,2],[0,2],[2,13],[2,1],[0,2],[2,2],[5,2]]
	var fixed: int = 0
	var seen: Dictionary = {}
	for row in cases:
		if row.label.begins_with("gold-"):
			var index: int = int(row.label.trim_prefix("gold-"))
			_same([row.value,row.draws],golden[index],"source agrees with accepted golden")
			seen[str(int(row.stage))+":"+str(index)] = true
			fixed += 1
	_check(fixed == 36 and seen.size() == 36,"nine fixed goldens x four stages")
	for stage in range(10,14):
		var selected: Dictionary = {}
		var rejects: Dictionary = {}
		for row in cases:
			if int(row.stage) != stage:
				continue
			if row.kind == "etype":
				selected[int(row.value)] = true
			if row.label.begins_with("reject-"):
				rejects[int(row.label.trim_prefix("reject-"))] = true
		_check(selected.size() == 30,"all30 etypes selectable per stage")
		for pair in Policy.POOL:
			_check(selected.has(pair[0]),"every pool type observed")
		_check(rejects.size() == 13,"zero through12 consecutive reject cases")

func _test_diagnostics() -> void:
	for method in ["pick_etype","pick_element"]:
		for stage in [-1,0,4,9,14,34]:
			var rng := ScriptedRandom.new([0.0])
			_same(policy.call(method,stage,rng.sample),{"status":"NOT_READY","reason":"unsupported_stage","draws":0},"unsupported stage")
			_check(rng.used.is_empty(),"no fallback or RNG on unsupported stage")
		_same(policy.call(method,10,Callable()),{"status":"NOT_READY","reason":"invalid_random_callable","draws":0},"unbound Callable")
		for bad in [null,true,false,"0.2",[],{},-0.01,1.0,INF,-INF,NAN]:
			for prefix in [[],[0.5]]:
				var rng := ScriptedRandom.new(prefix+[bad])
				_same(policy.call(method,13,rng.sample),{"status":"NOT_READY","reason":"invalid_random_sample","draws":prefix.size()+1},"bad sample no repair/READY value")
				_check(rng.used.size() == prefix.size()+1 and not rng.overflow,"bad sample consumed once")
		for stage in range(10,14):
			var integers := ScriptedRandom.new([0,0])
			var result: Dictionary = policy.call(method,stage,integers.sample)
			_check(result.status == "READY" and result.value == (1 if method == "pick_etype" else 2),"integer0 sample valid")
	for stage in range(10,14):
		for valid_before in range(13):
			var prefix: Array = []
			if valid_before > 0:
				prefix.append(0.5)
				for i in range(valid_before-1):
					prefix.append(6.0/136.0)
			var rng := ScriptedRandom.new(prefix+[NAN])
			_same(policy.pick_etype(stage,rng.sample),{"status":"NOT_READY","reason":"invalid_random_sample","draws":valid_before+1},"late failure retains every attempted draw")
			_check(rng.used.size() == valid_before+1 and not rng.overflow,"late failure not rewound")
