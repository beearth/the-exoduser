extends SceneTree
## SV-CONTRACT: 읽기 전용 원본 5생산자 key/type 계약. 제품 수집기·복원기 아님.
## 기준: FDG_SOURCE_TRACE_SAVE_20261020.md 부록 C; 최신 checkout game.html.
## 원본 pin19a71357: Cloud3543-3575, Local63905-63931, Web64062-64088,
## Demo62131-62159, Demo50061996-62017, passiveQueue51219-51221.
## Node는 원본 object 표현식/helper만 vm 평가한다. dbSave 본문/IO/Main 실행0.

const USERDIR := "EXODUSER-sv-contract-Isolated-20261020"
const PROFILES := ["cloud", "local", "web", "demo", "demo500"]
const CASES := ["populated", "defaults", "queue_limit", "extended_arrays", "json_carriers"]
const PLAYER_NUMBERS := "lv exp maxExp sp ap baseAtk baseDef mpR stR hp mhp mp mmp st mst speed shield mshield"
const PLAYER_EXTRA := "transLvDate transLvCount apBossCleared goddessGift"
const ROOT_COMMON := "player inv stats passives qslots game bagMax hellCleared storage upgrades potLv skills fused skProf activeChargeSk activeBowSk activeMagicSk activeLMBSk activeRMBSk activeQSk activeCtSk skillSlots ultSlot charIdx"
const ROOT_EXTRA := "grit gritCostModeV2 crystalBag crystalDust stoneBag fuseProfSec cardProf catProf activeTechSk"
const GAME_FULL := "stage kills mats irisSz taRecords clearRecords comboMax playTime cutsceneDone"
const FIXTURE_TIME := 1700000000123

# Test-only Node program. No network, save directory or user storage is exposed to vm.
const SOURCE_PROBE := """
const fs = require('node:fs'), vm = require('node:vm'), crypto = require('node:crypto');
const path = process.argv[2];
const bytes = fs.readFileSync(path), html = bytes.toString('utf8');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const line = n => html.slice(0,n).split('\\n').length;
// Balanced source scanner: quoted strings/comments are opaque; no HTML execution.
function walk(start, limit, delimiter, endBrace=false) {
  let depth=0, quote=null, begin=start, parts=[];
  for(let i=start;i<limit;i++) {
    const c=html[i];
    if(quote) { if(c==='\\\\'){i++;continue;} if(c===quote)quote=null; continue; }
    if(c==='"'||c==="'"||c==='`'){quote=c;continue;}
    if(c==='/'&&html[i+1]==='/'){const e=html.indexOf('\\n',i+2);i=e<0?limit:e;continue;}
    if(c==='/'&&html[i+1]==='*'){const e=html.indexOf('*/',i+2);if(e<0)throw Error('unclosed comment');i=e+1;continue;}
    if('{[('.includes(c))depth++;
    if('}])'.includes(c)){depth--;if(endBrace&&depth===0)return i;}
    if(c===delimiter&&depth===0){parts.push([begin,i]);begin=i+1;}
  }
  if(endBrace)throw Error('unclosed source block');
  parts.push([begin,limit]);return parts;
}
function properties(open,prefix='',flatten=true) {
  const close=walk(open,html.length,null,true), out={};
  for(let [a,b] of walk(open+1,close,',')) {
    let text=html.slice(a,b);const skip=text.match(/^(?:\\s|\\/\\*[\\s\\S]*?\\*\\/|\\/\\/[^\\n]*\\n)*/)[0].length;
    a+=skip;text=html.slice(a,b).trim();if(!text)continue;
    const m=text.match(/^([A-Za-z_$][\\w$]*)\\s*:/);if(!m)throw Error('unsupported property '+text);
    const key=prefix+m[1], valueStart=a+m[0].length, value=html.slice(valueStart,b).trim();
    if(flatten&&['player','inv','game'].includes(m[1])&&value[0]==='{') {
      const nested=properties(html.indexOf('{',valueStart),key+'.',false);
      for(const p in nested){if(p in out)throw Error('duplicate '+p);out[p]=nested[p];}
    } else { if(key in out)throw Error('duplicate '+key);out[key]={expression:value.replace(/\\s+/g,' '),line:line(a)}; }
  }
  return out;
}
const descriptors=[
 ['cloud','async function dbSave(){','const saveData='],
 ['local','const _SLOT=','const saveData='],
 ['web','const _LS_KEY=','const saveData='],
 ['demo','async function _startDemoNew(){','const sd='],
 ['demo500',"const _D5K='hellsave_demo500'",'const sd=']
];
const found=descriptors.map(([id,anchor,decl])=>{
 const at=html.indexOf(anchor);if(at<0)throw Error('missing anchor '+id);
 const declaration=html.indexOf(decl,at);if(declaration<0)throw Error('missing literal '+id);
 const open=html.indexOf('{',declaration+decl.length), close=walk(open,html.length,null,true);
 const expression=html.slice(open,close+1);
 return {id,expression,start_line:line(open),end_line:line(close),sha256:sha(expression),fields:properties(open)};
});
const helperAt=html.indexOf('function _passiveQueueItems(){');if(helperAt<0)throw Error('missing queue helper');
const helperOpen=html.indexOf('{',helperAt), helperEnd=walk(helperOpen,html.length,null,true);
const helper=html.slice(helperAt,helperEnd+1);
function bindings(kind) {
 const P={lv:7,exp:33,maxExp:12345,sp:17,ap:9,_transLvDate:'2026-10-20',_transLvCount:1,
 _apBossCleared:[1],_goddessGift:['gift'],_lvStatMigrated:true,baseAtk:8,baseDef:2,mpR:0,stR:.28,
 hp:120,mhp:350,mp:60,mmp:160,st:90,mst:200,speed:2.6,shield:10,mshield:20,maskOn:false,
 _passiveQueue:['pAtk','unknown','pMagic','pAtk',1,null],skills:{kiSlash:1,spikeTrap:1},
 _fused:{shieldFuse:true},_skProf:{kiSlash:25},_fuseProfSec:{shieldFuse:2},_cardProf:{one:3},_catProf:{one:4},
 activeChargeSk:'charge',activeBowSk:'normal',activeTechSk:'giantSlam',activeMagicSk:'fireball',
 activeLMBSk:'kiSlash',activeRMBSk:'maliceSwipe',activeQSk:'parry',activeCtSk:'iceOrb',x:4020,rage:99};
 const equipped={};for(const key of 'weapon shield boots armor helmet bow gloves pants belt necklace ring1 ring2 cape bracelet headband ossuary headband2'.split(' '))equipped[key]=null;
 const item={id:7,custom:{flag:false},socketQ:[1,100],crystals:[{id:'atk',q:50}],_gx:0,_gy:2};equipped.weapon=item;
 const data={P,G:{stage:2,kills:41,mats:4321,_irisSz:27,_taRecords:{2:{t:17}},_clearRecords:{2:{t:17,s:88,r:'A'}},comboMax:11,playTime:777,_cutsceneDone:true,hellCleared:[0,1],stageTime:90},
 INV:{bag:[item],equipped,ossCollect:{iron_warlord_skull:{r:2,t:1}},selected:7},
 STATS:{str:12,dex:0,int:0,vit:0,lck:0},PASSIVES:{pAtk:1,pMagic:0,pFortify:0},_grit:3,
 QSLOTS:[{type:'hp',count:1},{type:null,count:0},{type:null,count:0},{type:null,count:0}],BAG_MAX:432,
 CRYSTAL_BAG:[{id:'atk',q:50,star:0,enh:0}],CRYSTAL_DUST:71,STONE_BAG:[{q:1},{q:100}],
 UPGRADES:{hp:1,atk:0,def:0,mp:0,st:0,spd:0},POT_LV:{hp:2},
 SKILL_SLOTS:['spikeTrap',null,null,null,'giantSlam','holyDome'],ULT_SLOT:null,_charIdx:0};
 if(kind==='defaults') {
   for(const key of Object.keys(P))if(typeof P[key]==='number')P[key]=0;
   for(const key of ['_transLvDate','_apBossCleared','_goddessGift','_lvStatMigrated','_fused','_skProf','_fuseProfSec','_cardProf','_catProf'])delete P[key];
   for(const key of Object.keys(P))if(key.startsWith('active'))P[key]='';
   P._passiveQueue={wrong:true};data.INV.ossCollect=null;
   for(const key of ['_irisSz','_taRecords','_clearRecords','comboMax','playTime','_cutsceneDone','hellCleared'])delete data.G[key];
 } else if(kind==='queue_limit')P._passiveQueue=[...Array(300).fill('pAtk'),'unknown',1,null];
 else if(kind==='extended_arrays'){data.QSLOTS.push({type:null,count:0,extra:false});data.SKILL_SLOTS.push(null);data.BAG_MAX='432';}
 else if(kind==='json_carriers') {
   item.carriers=[undefined,NaN,null,false,0,''];item.omitted=undefined;item.explicitNull=null;
   item.flag=false;item.zero=0;item.empty='';item.maxSafe=Number.MAX_SAFE_INTEGER;
 }
 return data;
}
const samples=[];
for(const kind of ['populated','defaults','queue_limit','extended_arrays','json_carriers']) {
 for(const producer of found) {
   const data=bindings(kind),before=JSON.stringify(data);
   const context=vm.createContext({...data,Date:{now:()=>1700000000123}});
   const value=vm.runInContext(helper+';('+producer.expression+')',context,{timeout:1000});
   samples.push({kind,profile:producer.id,payload:JSON.parse(JSON.stringify(value)),input_unchanged:before===JSON.stringify(data)});
 }
}
console.log(JSON.stringify({node:process.version,source_sha256:sha(bytes),source_unchanged:sha(fs.readFileSync(path))===sha(bytes),
 producers:found.map(({expression,...rest})=>rest),helper:{start_line:line(helperAt),end_line:line(helperEnd),sha256:sha(helper)},samples,
 main_booted:false,save_functions_executed:false,network_exposed:false,storage_exposed:false}));
"""

var checks: int = 0
var failures: int = 0
var group: String = "setup"
var groups: Array[Dictionary] = []
var node_bin: String = "node"
var probe: Dictionary = {}
var source_path: String
var trace_path: String

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("SV_CONTRACT_FAIL ", group, " ", label)

func _run() -> void:
	if not OS.get_user_data_dir().contains(USERDIR):
		printerr("SV_CONTRACT_INVALID_ISOLATION ", OS.get_user_data_dir())
		quit(2)
		return
	source_path = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	trace_path = ProjectSettings.globalize_path("res://../docs/engine/FDG_SOURCE_TRACE_SAVE_20261020.md").simplify_path()
	_check(FileAccess.file_exists(source_path) and FileAccess.file_exists(trace_path), "checkout source and merged trace exist")
	if failures > 0:
		quit(2)
		return
	# macOS OS.execute command construction must not receive inline JS metacharacters.
	# Only this isolated QA helper is written; no game save or product file is written.
	var helper_path: String = OS.get_user_data_dir().path_join("sv-contract-source-probe.cjs")
	_check(not FileAccess.file_exists(helper_path), "do not replace an existing QA helper")
	if failures > 0:
		quit(2)
		return
	var directory_error: Error = DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir())
	_check(directory_error == OK, "create only isolated QA directory")
	var helper_file: FileAccess = FileAccess.open(helper_path, FileAccess.WRITE)
	_check(helper_file != null, "create isolated temporary source probe")
	if helper_file == null:
		quit(2)
		return
	helper_file.store_string(SOURCE_PROBE)
	helper_file.close()
	var output: Array = []
	var code: int = OS.execute(node_bin, PackedStringArray([helper_path, source_path]), output, true)
	var removal_error: Error = DirAccess.remove_absolute(helper_path)
	_check(removal_error == OK and not FileAccess.file_exists(helper_path), "remove only owned temporary QA helper")
	_check(code == 0, "read-only source probe exits0: " + str(code))
	if code != 0:
		printerr("SV_CONTRACT_PROBE_ERROR ", "\n".join(output).left(3000))
		quit(2)
		return
	var decoded: Variant = JSON.parse_string("\n".join(output))
	_check(decoded is Dictionary, "source probe returns structured JSON")
	if failures > 0:
		printerr("SV_CONTRACT_PROBE_ERROR ", "\n".join(output).left(3000))
		quit(2)
		return
	probe = decoded
	for method in ["source_and_appendix", "key_sets_and_types", "producer_differences", "defaults_and_queue", "dynamic_items_and_json", "read_only_and_detector_controls"]:
		group = method
		var before: int = checks
		var failed_before: int = failures
		call("_test_" + method)
		groups.append({"group": method, "checks": checks-before, "failures": failures-failed_before})
		print("SV_CONTRACT_GROUP ", JSON.stringify(groups.back()))
	var provenance: Array = []
	for producer in probe.producers:
		provenance.append({"profile":producer.id,"start_line":producer.start_line,"end_line":producer.end_line,"sha256":producer.sha256,"flattened_fields":producer.fields.size()})
	print("SV_CONTRACT_RESULT ", JSON.stringify({"checks":checks,"failures":failures,"groups":groups,
		"profiles":PROFILES.size(),"cases":CASES.size(),"source_payload_evaluations":probe.samples.size(),
		"source_path":source_path,"source_sha256":probe.source_sha256,"trace_sha256":FileAccess.get_sha256(trace_path),
		"source_provenance":provenance,"helper":probe.helper,"node":probe.node,"userdir":OS.get_user_data_dir(),
		"main_booted":false,"product_code_changed":false,"save_restore_executed":false,
		"fixture_evidence_only":true,"runtime_persistence_proven":false}))
	quit(0 if failures == 0 and checks > 0 else 1)

func _words(text: String) -> Array:
	return Array(text.split(" ", false))

func _same_keys(value: Variant, expected: Array) -> bool:
	if not value is Dictionary or value.size() != expected.size():
		return false
	for key in expected:
		if not value.has(key):
			return false
	return true

func _json_equal(a: Variant, b: Variant) -> bool:
	# JSON has one Number type; bool is distinct. No approximate comparison.
	if (a is int or a is float) and (b is int or b is float):
		return float(a) == float(b)
	if typeof(a) != typeof(b):
		return false
	if a is Array:
		if a.size() != b.size():
			return false
		for i in range(a.size()):
			if not _json_equal(a[i],b[i]):
				return false
		return true
	if a is Dictionary:
		if not _same_keys(a,b.keys()):
			return false
		for key in a:
			if not _json_equal(a[key],b[key]):
				return false
		return true
	return a == b

func _root_keys(profile: String) -> Array:
	var keys: Array = _words(ROOT_COMMON)
	if profile != "demo500":
		keys.append_array(_words(ROOT_EXTRA))
	if profile != "cloud":
		keys.append("ts")
	return keys

func _player_keys(profile: String) -> Array:
	var keys: Array = _words(PLAYER_NUMBERS)
	keys.append_array(["passiveQueue", "maskOn"])
	if profile != "demo500":
		keys.append_array(_words(PLAYER_EXTRA))
	if profile == "cloud":
		keys.append("_lvStatMigrated")
	return keys

func _flatten(payload: Dictionary) -> Array:
	var paths: Array = []
	for key in payload:
		if key in ["player", "inv", "game"] and payload[key] is Dictionary:
			for sub in payload[key]:
				paths.append(key + "." + sub)
		else:
			paths.append(key)
	return paths

func _sample(kind: String, profile: String) -> Dictionary:
	for sample in probe.samples:
		if sample.kind == kind and sample.profile == profile:
			return sample.payload
	return {}

func _typed(value: Variant, type_id: int, label: String) -> void:
	_check(typeof(value) == type_id, label + " type=" + type_string(typeof(value)))

func _number(value: Variant, label: String) -> void:
	_check((value is int or value is float) and is_finite(float(value)), label + " is JSON Number")

func _test_source_and_appendix() -> void:
	_check(probe.producers.size() == 5 and probe.samples.size() == 25, "five actual literals, five cases each")
	var appendix: Dictionary = {}
	for profile in PROFILES:
		appendix[profile] = {}
	var active: bool = false
	for line in FileAccess.get_file_as_string(trace_path).split("\n"):
		if line.begins_with("## 부록 C."):
			active = true
		elif active and line.begins_with("## "):
			break
		elif active and line.begins_with("| `"):
			# Markdown escapes | inside code spans; retain profile column boundaries.
			var cells: PackedStringArray = line.replace("\\|", "\uE000").split("|")
			_check(cells.size() == 8, "appendixC has path + five producer cells")
			if cells.size() != 8:
				continue
			var path: String = cells[1].strip_edges().trim_prefix("`").trim_suffix("`")
			for index in range(5):
				var cell: String = cells[index+2].strip_edges().replace("\uE000", "|")
				if cell == "—":
					continue
				var finish: int = cell.rfind("` @")
				_check(finish > 0, "appendix expression and recorded source line: " + path)
				if finish > 0:
					appendix[PROFILES[index]][path] = cell.substr(1,finish-1)
	var union: Dictionary = {}
	var source_lines: PackedStringArray = FileAccess.get_file_as_string(source_path).split("\n")
	for producer in probe.producers:
		var expected: Dictionary = appendix[producer.id]
		_check(_same_keys(producer.fields, expected.keys()), producer.id + " literal field paths equal merged appendixC")
		_check(producer.fields.size() == (49 if producer.id == "demo500" else 67), producer.id + " independent field count")
		_check(int(producer.start_line) > 0 and int(producer.end_line) >= int(producer.start_line), "actual current source range")
		for path in producer.fields:
			union[path] = true
			var field: Dictionary = producer.fields[path]
			var actual_expr: String = str(field.expression).replace(" ", "").replace("\t", "").replace("\n", "")
			var expected_expr: String = str(expected.get(path,"<absent>")).replace(" ", "").replace("\t", "")
			_check(actual_expr == expected_expr, producer.id + ":" + path + " source expression unchanged")
			var n: int = int(field.line)
			_check(n >= int(producer.start_line) and n <= int(producer.end_line) and n <= source_lines.size(), producer.id + ":" + path + " current source line")
	_check(union.size() == 68, "union68 distinct paths; container keys expanded only once")
	_check(int(probe.helper.start_line) > 0 and int(probe.helper.end_line) >= int(probe.helper.start_line), "queue helper source provenance")

func _test_key_sets_and_types() -> void:
	for kind in CASES:
		for profile in PROFILES:
			var payload: Dictionary = _sample(kind,profile)
			var label: String = kind + "/" + profile
			_check(_same_keys(payload,_root_keys(profile)), label + " exact root key set")
			_check(_same_keys(payload.get("player"),_player_keys(profile)), label + " exact player key set")
			_check(_same_keys(payload.get("inv"),["bag","equipped","ossCollect"]), label + " exact inv key set")
			_check(_same_keys(payload.get("game"),_words("stage kills mats cutsceneDone" if profile == "demo500" else GAME_FULL)), label + " exact game key set")
			_check(_flatten(payload).size() == (49 if profile == "demo500" else 67), label + " flattened key count")
			if payload.is_empty():
				continue
			for key in ["player","inv","stats","passives","game","storage","upgrades","potLv","skills","fused","skProf"]:
				_typed(payload[key],TYPE_DICTIONARY,label+":"+key)
			for key in ["qslots","hellCleared","skillSlots"]:
				_typed(payload[key],TYPE_ARRAY,label+":"+key)
			for key in _words("activeChargeSk activeBowSk activeMagicSk activeLMBSk activeRMBSk activeQSk activeCtSk"):
				_typed(payload[key],TYPE_STRING,label+":"+key)
			_typed(payload.ultSlot,TYPE_NIL,label+":ultSlot")
			_number(payload.charIdx,label+":charIdx")
			if kind == "extended_arrays":
				_typed(payload.bagMax,TYPE_STRING,label+":bagMax raw string")
			else:
				_number(payload.bagMax,label+":bagMax")
			for key in _words(PLAYER_NUMBERS):
				_number(payload.player[key],label+":player."+key)
			_typed(payload.player.passiveQueue,TYPE_ARRAY,label+":passiveQueue")
			_typed(payload.player.maskOn,TYPE_BOOL,label+":maskOn")
			for key in ["stage","kills","mats"]:
				_number(payload.game[key],label+":game."+key)
			_typed(payload.game.cutsceneDone,TYPE_BOOL,label+":cutsceneDone")
			for key in ["bag","equipped","ossCollect"]:
				_typed(payload.inv[key],TYPE_ARRAY if key == "bag" else TYPE_DICTIONARY,label+":inv."+key)
			if profile != "cloud":
				_number(payload.ts,label+":ts")
			else:
				_typed(payload.player._lvStatMigrated,TYPE_BOOL,label+":_lvStatMigrated")
			if profile != "demo500":
				for key in ["grit","gritCostModeV2","crystalDust"]:
					_number(payload[key],label+":"+key)
				for key in ["crystalBag","stoneBag"]:
					_typed(payload[key],TYPE_ARRAY,label+":"+key)
				for key in ["fuseProfSec","cardProf","catProf"]:
					_typed(payload[key],TYPE_DICTIONARY,label+":"+key)
				_typed(payload.activeTechSk,TYPE_STRING,label+":activeTechSk")
				_typed(payload.player.transLvDate,TYPE_NIL if kind == "defaults" else TYPE_STRING,label+":transLvDate")
				_number(payload.player.transLvCount,label+":transLvCount")
				for key in ["apBossCleared","goddessGift"]:
					_typed(payload.player[key],TYPE_ARRAY,label+":player."+key)
				for key in ["taRecords","clearRecords"]:
					_typed(payload.game[key],TYPE_DICTIONARY,label+":game."+key)
				for key in ["irisSz","comboMax","playTime"]:
					_number(payload.game[key],label+":game."+key)

func _test_producer_differences() -> void:
	for profile in PROFILES:
		var p: Dictionary = _sample("populated",profile)
		_check(p.storage.is_empty(),profile+" storage{}; no embedded shared stash")
		_check(p.game.mats == (4321 if profile in ["demo","demo500"] else 0),profile+" original shared-mats distinction")
		_check(not p.player.has("x") and not p.player.has("rage") and not p.inv.has("selected") and not p.game.has("stageTime"),profile+" runtime fields omitted")
		_check(p.inv.equipped.size() == 17 and p.inv.bag.size() == 1,profile+" nested equipment remains complete")
		_check(p.player.passiveQueue == ["pAtk","pMagic","pAtk"],profile+" queue known-own-key filtering/order/duplicates")
		_check(p.activeRMBSk == "maliceSwipe" and p.activeQSk == "parry",profile+" protected saved selectors copied only")
		if profile == "cloud":
			_check(not p.has("ts") and p.player._lvStatMigrated == true,"cloud-only marker and absent ts")
		else:
			_check(p.ts == FIXTURE_TIME and not p.player.has("_lvStatMigrated"),profile+" timestamp and no cloud marker")
		if profile != "demo500":
			_check(p.grit == 3 and p.gritCostModeV2 == 1,profile+" raw grit/v2 constant preserved")
		else:
			for key in _words(ROOT_EXTRA):
				_check(not p.has(key),"demo500 intentionally omits "+key)

func _test_defaults_and_queue() -> void:
	for profile in PROFILES:
		var p: Dictionary = _sample("defaults",profile)
		_check(p.player.ap == 0 and p.player.hp == 0 and p.player.maskOn == false,profile+" collector literal does not restore/refill values")
		_check(p.player.passiveQueue.is_empty() and p.inv.ossCollect.is_empty(),profile+" wrong queue shape and empty ossCollect")
		for key in ["fused","skProf"]:
			_check(p[key].is_empty(),profile+" missing optional map fallback "+key)
		_check(p.activeLMBSk == "whirlwind" and p.activeRMBSk == "shieldBlock" and p.activeCtSk == "ghostWalk",profile+" exact empty-selector defaults (no combat calls)")
		_check(p.activeMagicSk == ("arcLaser" if profile == "demo500" else "fireball"),profile+" distinct magic default")
		_check(p.activeQSk == ("peaceShield" if profile == "demo500" else "parry"),profile+" protected Q default observed only")
		if profile != "demo500":
			_check(p.player.transLvDate == null and p.player.transLvCount == 0,profile+" date/count fallback")
			_check(p.player.apBossCleared.is_empty() and p.player.goddessGift.is_empty(),profile+" empty optional arrays")
			_check(p.game.irisSz == 20 and p.game.comboMax == 0 and p.game.playTime == 0 and p.game.cutsceneDone == false,profile+" original game defaults")
			_check(p.game.taRecords.is_empty() and p.game.clearRecords.is_empty(),profile+" record map defaults")
		else:
			_check(p.game.cutsceneDone == true,"demo500 cutsceneDone always true")
		var queue: Array = _sample("queue_limit",profile).player.passiveQueue
		_check(queue.size() == 260 and queue.all(func(v: Variant) -> bool: return v == "pAtk"),profile+" queue cap260")
		var extended: Dictionary = _sample("extended_arrays",profile)
		_check(extended.qslots.size() == 5 and extended.skillSlots.size() == 7,profile+" no collector array truncation")
		_check(extended.bagMax == "432",profile+" no bagMax numeric coercion")

func _test_dynamic_items_and_json() -> void:
	for profile in PROFILES:
		var p: Dictionary = _sample("json_carriers",profile)
		var item: Dictionary = p.inv.bag[0]
		_check(item.custom == {"flag":false} and item._gx == 0 and item._gy == 2,profile+" opaque nested/coordinate fields retained")
		_check(_json_equal(item.socketQ,[1,100]) and _json_equal(item.crystals,[{"id":"atk","q":50}]),profile+" crystal/socket fields unmodified")
		_check(not item.has("omitted") and item.has("explicitNull") and item.explicitNull == null,profile+" JSON object undefined omission versus null")
		_check(_json_equal(item.carriers,[null,null,null,false,0,""]),profile+" JSON array undefined/NaN/null/false/0/empty carriers")
		_typed(item.flag,TYPE_BOOL,profile+":opaque false")
		_number(item.zero,profile+":opaque zero")
		_typed(item.empty,TYPE_STRING,profile+":opaque empty string")
		_check(item.maxSafe == 9007199254740991,profile+" MAX_SAFE_INTEGER carrier")
		_check(p.inv.equipped.weapon == item,profile+" both persisted item values agree after JSON parse (not identity claim)")

func _test_read_only_and_detector_controls() -> void:
	_check(probe.source_unchanged == true and probe.source_sha256 == FileAccess.get_sha256(source_path),"latest checkout source bytes unchanged")
	_check(probe.main_booted == false and probe.save_functions_executed == false and probe.network_exposed == false and probe.storage_exposed == false,"no Main/admission/save/restore/network/user IO exposure")
	for sample in probe.samples:
		_check(sample.input_unchanged == true,sample.kind+"/"+sample.profile+" fixture remains unchanged")
	var good: Dictionary = _sample("populated","local")
	_check(_same_keys(good,_root_keys("local")),"positive validator control")
	var missing: Dictionary = good.duplicate(true)
	missing.erase("bagMax")
	_check(not _same_keys(missing,_root_keys("local")),"negative control rejects missing key")
	var extra: Dictionary = good.duplicate(true)
	extra["inventedSaveVersion"] = 1
	_check(not _same_keys(extra,_root_keys("local")),"negative control rejects extra key (RAM only)")
	var wrong_type: Dictionary = good.duplicate(true)
	wrong_type["qslots"] = {}
	_check(typeof(wrong_type.qslots) != TYPE_ARRAY,"negative control detects array-to-object type drift")
	_check(_json_equal([1],JSON.parse_string("[1]")),"JSON Number comparator accepts int/float representations")
	_check(not _json_equal([false],[0]) and not _json_equal([null],[0]),"JSON comparator keeps bool/null distinct from Number")
	_check(not _json_equal([1,100],[1,101]),"JSON comparator rejects numeric value drift exactly")
