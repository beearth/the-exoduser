extends SceneTree
## EC2-01 independent oracle: execute only original literal tables + roll functions.
## No game boot, fixture actor or product State writes.
const Policy = preload("res://scripts/native_ch2_enemy_spawn_policy.gd")
const USERDIR = "EXODUSER-ec2-01-Isolated-20261020"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8');
function between(a,b){let i=raw.indexOf(a);if(i<0)throw Error(a);let j=raw.indexOf(b,i+a.length);if(j<0)throw Error(b);return raw.slice(i,j);}
const chapters=between('const CHAPTER_STAGES=[','const TOTAL_STAGES=');
const total=between('const TOTAL_STAGES=','// ── 데모');
const mapping=between('const SI_TO_HELL=new','// 대표맵=');
const el=between('const EL={','const ETYPE_ERES=');
const start=raw.indexOf('const HELL_SPAWN=['),end=raw.indexOf('function rollEl(si){',start);
if(start<0||end<0)throw Error('source functions missing');
const finish=raw.indexOf('\\n}',end)+2;if(finish<end)throw Error('rollEl end');
const context=vm.createContext({});
vm.runInContext(chapters+total+mapping+el+raw.slice(start,finish),context,{timeout:1000});
const tables=JSON.parse(vm.runInContext('JSON.stringify({pool:HELL_SPAWN[1],cdf:_HELL_CDF[1],ranged:HELL_SPAWN[1].filter(p=>_RANGED_ET.has(p[0])),el:HELL_EL[1],mapping:Array.from(SI_TO_HELL)})',context));
const cases=[];function bits(n){const b=Buffer.alloc(8);b.writeDoubleLE(n);return b.toString('base64');}
function add(stage,kind,values,label){
 context.inputs=values.slice();context.used=[];
 vm.runInContext('Math.random=()=>{if(!inputs.length)throw Error("oracle RNG exhausted");const x=inputs.shift();used.push(x);return x}',context);
 const value=vm.runInContext((kind==='etype'?'rollEtype':'rollEl')+'('+stage+')',context,{timeout:1000});
 cases.push({stage,kind,values,label,value,used:Array.from(context.used),draws:context.used.length,samples64:values.map(bits),used64:Array.from(context.used,bits)});
}
let state=20261020;
function next(){state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;}
for(let stage=4;stage<=9;stage++){
 const gold=[['etype',[0,0]],['etype',[0,5/38]],['etype',[0,.999999]],['etype',[.5,0]],['etype',[.5,...Array(12).fill(6.5/178)]],['element',[.399999]],['element',[.4,0]],['element',[.4,2/6]],['element',[.4,.999999]]];
 gold.forEach(([k,v],i)=>add(stage,k,v,'gold-'+i));
 // Middle of every CDF interval, and exact threshold +/- epsilon.
 let lo=0;
 for(const [et,hi]of tables.cdf){
   add(stage,'etype',[.5,(lo+hi)/2,...Array(12).fill(0)],'cdf-mid-'+et);
   for(const r of [hi-1e-12,hi,hi+1e-12])if(r>=0&&r<1)add(stage,'etype',[.5,r,...Array(12).fill(0)],'cdf-edge-'+et);
   lo=hi;
 }
 let sum=0;
 for(const [et,w]of tables.ranged){
   add(stage,'etype',[0,(sum+w/2)/38],'ranged-mid-'+et);sum+=w;
   for(const r of [sum/38-1e-12,sum/38,sum/38+1e-12])if(r>=0&&r<1)add(stage,'etype',[0,r],'ranged-edge-'+et);
 }
 for(const r of [.5-1e-12,.5,.5+1e-12])add(stage,'etype',[r,0],'branch');
 for(let n=0;n<12;n++)add(stage,'etype',[.5,...Array(n).fill(6.5/178),0],'reject-'+n);
 for(const r of [.4-1e-12,.4,.4+1e-12])add(stage,'element',[r,0],'element-branch');
 for(let n=0;n<=6;n++)for(const r of [n/6-1e-12,n/6,n/6+1e-12])if(r>=0&&r<1)add(stage,'element',[.4,r],'element-edge-'+n);
 for(let n=0;n<100;n++){
   add(stage,'etype',Array.from({length:13},next),'stream-'+n);
   add(stage,'element',[next(),next()],'stream-'+n);
 }
}
process.stdout.write(JSON.stringify({sha256:crypto.createHash('sha256').update(raw).digest('hex'),tables,cases}));
"""

class ScriptedRandom extends RefCounted:
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

var assertions: int = 0
var failures: int = 0
var policy: RefCounted = Policy.new()
var node_bin: String = "node"
var oracle_cases: int = 0
var source_sha: String = ""
var decimal_transport_shifts: int = 0

func _initialize() -> void:
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--node-bin="):
			node_bin = argument.trim_prefix("--node-bin=")
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		printerr("EC2_01_FAIL ", label)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		printerr("EC2_01_INVALID_ISOLATION")
		quit(2)
		return
	var oracle: Dictionary = _load_oracle()
	if not oracle.is_empty():
		_test_tables(oracle.tables)
		for row in oracle.cases:
			_compare(row)
		_test_fixed_goldens(oracle.cases)
	_test_diagnostics()
	print("EC2_01_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "oracle_cases": oracle_cases, "source_sha256": source_sha, "decimal_transport_shifts": decimal_transport_shifts, "skipped": [], "public_play_evidence": false}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)

func _load_oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	_check(FileAccess.file_exists(source), "latest checkout original exists")
	var helper: String = OS.get_user_data_dir().path_join("ec2-01-source-oracle.cjs")
	_check(not FileAccess.file_exists(helper), "never replace an existing helper")
	if failures > 0:
		return {}
	_check(DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir()) == OK, "isolated directory")
	var file: FileAccess = FileAccess.open(helper, FileAccess.WRITE)
	_check(file != null, "temporary isolated source helper")
	if file == null:
		return {}
	file.store_string(SOURCE_PROBE)
	file.close()
	var output: Array = []
	var code: int = OS.execute(node_bin, PackedStringArray([helper, source]), output, true)
	_check(DirAccess.remove_absolute(helper) == OK, "owned helper removed")
	_check(code == 0, "original-only JS probe exit0: " + "\n".join(output).left(1000) if code != 0 else "original-only JS probe exit0")
	if code != 0:
		return {}
	var decoded: Variant = JSON.parse_string("\n".join(output))
	_check(decoded is Dictionary and decoded.get("cases", []).size() > 0, "nonempty structured source oracle")
	if not decoded is Dictionary:
		return {}
	source_sha = FileAccess.get_sha256(source)
	_check(decoded.sha256 == source_sha, "oracle reads exact checkout bytes")
	return decoded

func _test_tables(tables: Dictionary) -> void:
	_check(tables.pool.size() == Policy.POOL.size(), "original pool size")
	for index in range(tables.pool.size()):
		_check(float(tables.pool[index][0]) == float(Policy.POOL[index][0]) and float(tables.pool[index][1]) == float(Policy.POOL[index][1]), "original weight pair/order %d" % index)
	var total: int = 0
	var ranged: Array = []
	var ranged_total: int = 0
	for pair in tables.pool:
		total += int(pair[1])
		_check(not (int(pair[0]) >= 20 and int(pair[0]) <= 29), "CH1 exclusive 20..29 absent")
	for pair in tables.ranged:
		ranged.append(int(pair[0]))
		ranged_total += int(pair[1])
	_check(tables.pool.size() == 31 and total == 178, "CH2 pool31 weight178")
	_check(ranged == Policy.RANGED and ranged.size() == 9 and ranged_total == 38, "ranged9 weight38")
	_check(31 not in ranged and 47 in tables.pool.map(func(p: Array) -> int: return int(p[0])), "31 not ranged / 47 present")
	_check(tables.el[0] == 0 and tables.el[1] == 0.4, "original theme P bias .4")
	for stage in range(4, 10):
		_check(tables.mapping[stage] == 1, "original stage→hell %d" % stage)

func _compare(row: Dictionary) -> void:
	# Godot JSON decimal parsing can move a boundary by one ULP. Transport
	# provider samples as original binary64, preserving the strict source test.
	var values: Array = []
	for encoded in row.samples64:
		values.append(Marshalls.base64_to_raw(encoded).decode_double(0))
	for index in range(values.size()):
		if float(row["values"][index]) != values[index]:
			decimal_transport_shifts += 1
	var rng := ScriptedRandom.new(values)
	var result: Dictionary = policy.call("pick_" + row.kind, int(row.stage), rng.sample)
	var label: String = "%d %s %s" % [row.stage, row.kind, row.label]
	_check(result.status == "READY" and result.get("value") == row.value, "source value " + label)
	var used64: Array = []
	for value in rng.used:
		used64.append(Marshalls.raw_to_base64(PackedFloat64Array([value]).to_byte_array()))
	_check(result.draws == row.draws and used64 == row.used64 and not rng.overflow, "exact RNG consumption " + label)
	_check(rng.values == values and row.samples64.size() == values.size(), "input unchanged " + label)
	oracle_cases += 1

func _test_fixed_goldens(cases: Array) -> void:
	var expected := [[1,2],[7,2],[38,2],[0,2],[2,13],[0,1],[0,2],[2,2],[5,2]]
	var count: int = 0
	var seen: Dictionary = {}
	for row in cases:
		if not row.label.begins_with("gold-"):
			continue
		var index: int = int(row.label.trim_prefix("gold-"))
		_check([int(row.value), int(row.draws)] == expected[index], "source agrees with design golden")
		count += 1
		seen["%s:%s" % [row.stage,index]] = true
	_check(count == 54 and seen.size() == 54, "nine fixed goldens × six stages")
	# All ten new etypes must appear in non-rejected original interval cases.
	for stage in range(4,10):
		for etype in range(30,40):
			var found: bool = false
			for row in cases:
				if int(row.stage) == stage and row.kind == "etype" and int(row.value) == etype:
					found = true
			_check(found, "new etype selectable %d/%d" % [stage,etype])

func _test_diagnostics() -> void:
	for method in ["pick_etype", "pick_element"]:
		for stage in [-1,0,3,10,34]:
			var rng := ScriptedRandom.new([0.0])
			var result: Dictionary = policy.call(method, stage, rng.sample)
			_check(result == {"status":"NOT_READY", "reason":"unsupported_stage", "draws":0} and rng.used.is_empty(), "unsupported stage no sample")
		var invalid: Dictionary = policy.call(method, 4, Callable())
		_check(invalid == {"status":"NOT_READY", "reason":"invalid_random_callable", "draws":0}, "invalid callable no sample")
		for bad in [null,true,"0.2",-0.001,1.0,INF,NAN]:
			for prefix in [[],[0.5]]:
				var rng := ScriptedRandom.new(prefix + [bad])
				var result: Dictionary = policy.call(method, 9, rng.sample)
				_check(result == {"status":"NOT_READY", "reason":"invalid_random_sample", "draws":prefix.size()+1}, "invalid sample no repair/rewind")
				_check(rng.used.size() == prefix.size()+1 and not rng.overflow, "invalid samples consumed exactly once")
	# Late rejection failure must retain all already-consumed draws.
	var late := ScriptedRandom.new([0.5,6.5/178,6.5/178,NAN])
	_check(policy.call("pick_etype", 4, late.sample) == {"status":"NOT_READY", "reason":"invalid_random_sample", "draws":4} and late.used.size() == 4, "late failure no rewind")
