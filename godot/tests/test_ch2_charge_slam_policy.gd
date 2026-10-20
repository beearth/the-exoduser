extends SceneTree
## EC2-04 dedicated triggers; no real actor/factory/world or common reimplementation.
const Policy = preload("res://scripts/native_ch2_charge_slam_policy.gd")
const M29 = preload("res://scripts/enemy_mod_m29.gd")
const USERDIR = "EXODUSER-ec2-04-Isolated-20261020"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8');
function block(marker){const i=raw.indexOf(marker);if(i<0)throw Error(marker);const begin=raw.indexOf('{',i);let n=0,q='';for(let k=begin;k<raw.length;k++){let x=raw[k];if(q){if(x==='\\\\'){k++;continue}if(x===q)q='';continue}if(x==='"'||x==="'"){q=x;continue}if(x==='{')n++;if(x==='}'&&!--n)return raw.slice(i,k+1);}throw Error('block');}
function line(marker){const i=raw.indexOf(marker);if(i<0)throw Error(marker);return raw.slice(i,raw.indexOf('\\n',i)+1);}
const clone=v=>JSON.parse(JSON.stringify(v));
const c=vm.createContext({_T:s=>s});
vm.runInContext(line('const EL={')+line('const ELC=')+block('function dst(')+block('function _beanRoll(')+block('function _eMouthXY(')+block('function eProjAt('),c);
c.commands=[];c.receipts=[];c.pathCalls=[];
c.addTxt=(x,y,text,col,life)=>c.commands.push({kind:'text',x,y,text,col,life});
c.SFX={charge:()=>c.commands.push({kind:'sfx_charge'}),groggy:()=>c.commands.push({kind:'sfx_groggy'})};
c.shake=amount=>c.commands.push({kind:'shake',amount});
c.addParts=(x,y,col,count)=>c.commands.push({kind:'parts',x,y,col,count});
c._chgPathClear=(e,length)=>{c.pathCalls.push({actor:clone(e),length});return c.clear;};
c._beanOriginal=c._beanRoll;c._beanRoll=(...args)=>{c.bean=c._beanOriginal(...args);return c.bean};
c._emitEnemyShot=(e,p)=>c.receipts.push({packet:clone(p),bean:clone(c.bean),actor_state:e.s});
c._projOriginal=c.eProjAt;c.eProjAt=(e,angle,speed,requested_multiplier,el,life,col,sz)=>{c.commands.push({kind:'e_proj_at',angle,speed,requested_multiplier,el,life,col,sz});c._projOriginal(e,angle,speed,requested_multiplier,el,life,col,sz)};
vm.runInContext('Math.random=()=>{throw Error("unexpected trigger RNG")}',c);
const fns={};
for(const etype of [30,32,39]){
 const fields=etype===30?['_wildChargeT']:etype===32?['_boulderSlamT']:['_elderChargeT','_elderSlamT'];
 const clock=fields.map(f=>{const m='e.'+f+'-=sp;',i=raw.indexOf(m);if(i<0)throw Error(f);return raw.slice(i,i+m.length)}).join('');
 const branch=etype===30?block('if(e._wildChargeT<=0&&d<1200'):etype===32?block('if(e._boulderSlamT<=0&&d<100)'):block('if(e._elderChargeT<=0&&d>100&&d<1200)')+block('if(e._elderSlamT<=0&&d<120)');
 fns[etype]=vm.runInContext('(function(){clockActor=JSON.parse(JSON.stringify(e));if(e.etype==='+etype+'&&e.s===\\'idle\\'){'+clock+'clockActor=JSON.parse(JSON.stringify(e));Object.assign(e,prefix);'+branch+'}})',c);
}
const cases=[];
function add(etype,s,timer,slam,sp,d,clear,player={x:200.25,y:-80.75},extra={},prefix={}){
 const actor={etype,ib:false,s,x:100.25,y:-80.75,r:20,atk:31,el:0,facing:.3,st2:123,echDx:-1,echDy:0,unrelated:{keep:[9,8]},...extra};
 if(etype===30)Object.assign(actor,{_wildChargeT:timer,_wildChargeCd:73.5});
 if(etype===32)Object.assign(actor,{_boulderSlamT:timer,_boulderSlamCd:233.5});
 if(etype===39)Object.assign(actor,{_elderChargeT:timer,_elderChargeCd:173.5,_elderSlamT:slam,_elderSlamCd:333.5,_elderRoarT:777});
 c.e=clone(actor);c.P=clone(player);c.prefix=prefix;c.sp=sp;c.d=d;c.clear=clear;c.commands=[];c.receipts=[];c.pathCalls=[];fns[etype]();
 cases.push({actor,player,prefix,sp,d,clear,clock:clone(c.clockActor),after:clone(c.e),commands:c.commands,receipts:c.receipts,pathCalls:c.pathCalls});
}
for(const etype of [30,32,39])for(const s of ['idle','recover'])for(const timer of [-1,0,.5,2])for(const sp of [0,.25,1,2.5])for(const d of [0,40,40+1e-10,80-1e-10,80,100-1e-10,100,100+1e-10,110,120-1e-10,120,1200-1e-10,1200])for(const clear of [true,false])add(etype,s,timer,timer,sp,d,clear);
for(const etype of [30,32,39])for(const player of [{x:100.25,y:30.75},{x:-20.5,y:-333.25},{x:100.25,y:-80.75},{x:900.25,y:-80.75}])for(const d of [50,79,99,110,121])add(etype,'idle',0,0,1,d,true,player);
for(const timer of [0,2])for(const slam of [0,2])for(const d of [50,99,100,110,120,121])add(39,'idle',timer,slam,1,d,true);
for(const el of [0,1,2,3,4,5,6])for(const atk of [0,31,31.9,-31,2147483648,1e18])add(39,'idle',0,0,1,50,true,undefined,{el,atk});
add(39,'idle',0,0,1,110,true,undefined,{}, {s:'windup',facing:1.25,atk:99,x:123,y:456});
for(const speed of [0,17,42])add(39,'idle',0,99,1,200,true,undefined,{_chgSpd:speed,_chgDur:7,_chgAimMax:3});
add(30,'idle',0,0,1,50,true,undefined,{_chgSpd:999,_chgDur:99,_chgAimMax:1});
for(const etype of [30,32,39])for(const el of [undefined,null])for(const d of [50,110])add(etype,'idle',0,0,1,d,true,undefined,{el});
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v;}
// Source eCharge first statement ONLY: common execution remains existing M29.
const speedLine='const spd=(e._chgSpd||5)*sp;';if(!raw.includes(speedLine))throw Error('common charge prefix');
const speedProbe=vm.runInContext('(function(){'+speedLine+'return spd})',c);
const defaults=[];for(const row of cases){if(row.after.s==='eCharge'){c.e=row.after;c.sp=1;defaults.push({has_speed:Object.hasOwn(c.e,'_chgSpd'),speed:speedProbe(),st2:c.e.st2});}}
process.stdout.write(JSON.stringify({sha256:crypto.createHash('sha256').update(raw).digest('hex'),cases:pack(cases),defaults:pack(defaults)}));
"""
class PathFixture extends RefCounted:
	var calls: Array = []
	var clear: Variant
	func _init(value: Variant) -> void:
		clear = value
	func check(actor: Dictionary, length: float) -> Variant:
		calls.append({"actor":actor.duplicate(true),"length":length})
		return clear

var policy: RefCounted = Policy.new()
var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
var js_receipts: int = 0
var source_sha: String = ""
var node_bin: String = "node"

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="):
			node_bin = arg.trim_prefix("--node-bin=")
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("EC2_04_FAIL ",label)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC2_04_INVALID_ISOLATION")
		quit(2)
		return
	var oracle: Dictionary = _oracle()
	if not oracle.is_empty():
		for row in oracle.cases:
			_compare(row)
		_test_source_contracts(oracle)
	_test_existing_common_dependency()
	_test_refusals()
	print("EC2_04_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"js_only_projectile_receipts":js_receipts,"source_sha256":source_sha,"skipped":[],"product_connected":false,"public_play_evidence":false}))
	quit(0 if failures == 0 and oracle_cases > 0 else 1)

func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec2-04-source-oracle.cjs")
	_check(FileAccess.file_exists(source) and not FileAccess.file_exists(helper),"source/no helper overwrite")
	if failures > 0:
		return {}
	_check(DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir()) == OK,"isolated directory")
	var file: FileAccess = FileAccess.open(helper,FileAccess.WRITE)
	_check(file != null,"temporary helper")
	if file == null:
		return {}
	file.store_string(SOURCE_PROBE)
	file.close()
	var output: Array = []
	var code: int = OS.execute(node_bin,PackedStringArray([helper,source]),output,true)
	_check(DirAccess.remove_absolute(helper) == OK,"helper removed")
	_check(code == 0,"source probe exit0")
	if code != 0:
		printerr("\n".join(output).left(1800))
		return {}
	var data: Variant = JSON.parse_string("\n".join(output))
	_check(data is Dictionary and data.get("cases",[]).size() > 0,"structured source oracle")
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
			return path+" array size"
		for i in range(a.size()):
			var error: String = _mismatch(a[i],b[i],path+"/"+str(i))
			if not error.is_empty():
				return error
		return ""
	return "" if a == b else path+" value"

func _compare(row: Dictionary) -> void:
	var before: Dictionary = row.duplicate(true)
	var actor: Dictionary = row.actor.duplicate(true)
	actor.etype = int(actor.etype)
	if actor.has("el") and actor.el != null:
		actor.el = int(actor.el)
	var fixture := PathFixture.new(row.clear)
	var clock: Dictionary = policy.call("advance_trigger_clocks",actor,float(row.sp))
	var label: String = "%d d=%s t=%s" % [actor.etype,row.d,row.sp]
	_check(clock.status == "READY","clock ready "+label)
	if clock.status != "READY":
		return
	var error: String = _mismatch(clock.actor,row.clock)
	_check(error.is_empty(),"clock "+label+" "+error)
	var fresh: Dictionary = clock.actor.merged(row.prefix,true)
	var result: Dictionary = policy.call("plan_triggers",fresh,row.player,float(row.d),clock.idle_entered,fixture.check)
	_check(result.status == "READY","plan ready "+label)
	if result.status != "READY":
		return
	error = _mismatch(result.actor,row.after)
	_check(error.is_empty(),"actor "+label+" "+error)
	error = _mismatch(result.commands,row.commands)
	_check(error.is_empty(),"commands "+label+" "+error)
	_check(_mismatch(fixture.calls,row.pathCalls).is_empty(),"source conditional path call/view/length "+label)
	_check(_mismatch(row,before).is_empty(),"all oracle inputs unchanged "+label)
	_check(result.product_connected == false and result.common_consumers_required == true,"no actual consumers")
	oracle_cases += 1

func _test_source_contracts(oracle: Dictionary) -> void:
	var overwritten: int = 0
	var simultaneous: int = 0
	var absent_elements: int = 0
	var null_elements: int = 0
	for row in oracle.cases:
		if not row.actor.has("el"):
			absent_elements += 1
			_check(not row.after.has("el"),"source undefined element stays absent")
		elif row.actor.el == null:
			null_elements += 1
			_check(row.after.has("el") and row.after.el == null,"explicit source null stays present")
		var shots: Array = row.commands.filter(func(command: Dictionary) -> bool: return command.kind == "e_proj_at")
		_check(shots.size() == row.receipts.size(),"source common receipt per request")
		for i in range(shots.size()):
			if shots[i].get("el") == 0:
				_check(row.receipts[i].bean.dmgM == 1.2,"original P bean overrides requested coefficient")
				if shots[i].requested_multiplier != 1.2:
					overwritten += 1
			_check(row.receipts[i].actor_state == "eSlamWind","source eProjAt uses bean branch, not eShootWind bypass")
			js_receipts += 1
		if row.actor.etype == 39 and row.clock._elderChargeT <= 0 and row.clock._elderSlamT <= 0 and row.d > 100 and row.d < 120 and row.actor.s == "idle":
			_check(row.after.s == "eSlamWind" and row.after.st2 == 55 and row.after._elderChargeT == row.actor._elderChargeCd and row.after._elderSlamT == row.actor._elderSlamCd,"independent charge then slam, both cooldowns consumed")
			simultaneous += 1
	_check(overwritten > 0 and simultaneous > 0,"source overwrite coverage nonempty")
	_check(absent_elements == 6 and null_elements == 6,"all three dedicated types preserve both nonnumeric source elements")
	var default_rows: Array = oracle.defaults.filter(func(row: Dictionary) -> bool: return row.has_speed == false)
	_check(default_rows.size() > 0,"source direct39 absent _chgSpd")
	for row in default_rows:
		_check(row.speed == 5 and row.st2 == 30,"source direct39 default speed5/30 ticks, no invented windup")

func _test_existing_common_dependency() -> void:
	var shared: RefCounted = M29.new()
	_check(shared.configure({"can_move":func(_x,_y,_r): return true,"is_wall":func(_x,_y): return false,"element_multiplier":func(_el): return 1.0,"random":func(): return 0.5}),"existing M29 dependency configured on fixture only")
	var player := {"x":10000.0,"y":10000.0,"r":10.0,"iframes":1.0,"state":"idle","parry_window":false}
	var hound := {"etype":30,"ib":false,"s":"idle","x":0.0,"y":0.0,"r":20.0,"atk":31,"el":0,"facing":0.0,"col":"#884422","_wildChargeT":0,"_wildChargeCd":70}
	var path := PathFixture.new(true)
	var plan: Dictionary = policy.call("plan_triggers",hound,{"x":100.0,"y":0.0},100.0,true,path.check)
	var raw: Dictionary = plan.actor
	_check(raw.st2 == 90 and raw._chgDur == 17 and raw._chgSpd == 42 and raw._chgLen == 734,"source type30 entry fields")
	var vertical_player: Dictionary = player.merged({"x":0.0,"y":10000.0},true)
	var locked: Dictionary = raw.duplicate(true)
	locked.st2 = 90.0 * 0.755
	shared.step_charge(locked,1.0,vertical_player,false)
	_check(locked.facing == 0.0,"existing common locks at exactly 90×.755")
	var tracking: Dictionary = raw.duplicate(true)
	tracking.st2 = 90.0 * 0.755 + 1e-9
	shared.step_charge(tracking,1.0,vertical_player,false)
	_check(tracking.facing == PI / 2.0,"existing common reaims only above lock threshold")
	raw.st2 = 0 # explicit test fixture at the common wind exit, not live actor progress
	shared.step_charge(raw,1.0,player,false)
	_check(raw.s == "eCharge" and raw.st2 == 17,"existing common wind consumes type30 duration17")
	shared.step_charge(raw,1.0,player,true)
	_check(raw.x == 42 and raw.y == 0 and raw.st2 == 16,"existing shared movement consumes42 without new sweep implementation")
	var elder := {"etype":39,"ib":false,"s":"idle","x":0.0,"y":0.0,"r":25.0,"atk":31,"el":0,"facing":0.0,"col":"#441100","_elderChargeT":0,"_elderChargeCd":170,"_elderSlamT":999,"_elderSlamCd":330}
	plan = policy.call("plan_triggers",elder,{"x":200.0,"y":0.0},200.0,true,Callable())
	raw = plan.actor
	_check(raw.s == "eCharge" and raw.st2 == 30 and not raw.has("_chgSpd") and not raw.has("_chgAimMax"),"39 stays direct with no added speed/wind fields")
	shared.step_charge(raw,1.0,player,true)
	_check(raw.x == 5 and raw.st2 == 29,"existing common default speed5")

func _test_refusals() -> void:
	var actor := {"etype":30,"ib":false,"s":"idle","x":0,"y":0,"r":20,"atk":31,"el":0,"facing":0,"_wildChargeT":0,"_wildChargeCd":70}
	var player := {"x":100,"y":0}
	var path := PathFixture.new(true)
	for key in actor:
		if key == "el":
			continue # source holes may pass undefined; absent key is preserved
		var missing: Dictionary = actor.duplicate(true)
		missing.erase(key)
		_check(policy.call("advance_trigger_clocks",missing,1.0).status == "NOT_READY","missing actor read no fallback")
	for bad in [-1.0,NAN,INF]:
		_check(policy.call("advance_trigger_clocks",actor,bad).status == "NOT_READY","invalid ticks")
		_check(policy.call("plan_triggers",actor,player,bad,true,path.check).status == "NOT_READY","invalid distance")
	_check(policy.call("plan_triggers",actor,{},100.0,true,path.check).status == "NOT_READY","missing player")
	_check(policy.call("plan_triggers",actor,player,100.0,true,Callable()).reason == "source_path_clear_unbound","no fake clear path")
	for bad in [null,1,"true"]:
		var invalid := PathFixture.new(bad)
		_check(policy.call("plan_triggers",actor,player,100.0,true,invalid.check).reason == "invalid_source_path_clear_result","invalid source predicate no default")
	_check(policy.call("plan_triggers",actor,player,40.0,true,Callable()).status == "READY","unreached path predicate unnecessary")
	for etype in [0,29,31,33,38,40]:
		_check(policy.call("advance_trigger_clocks",actor.merged({"etype":etype},true),1.0).status == "NOT_READY","no other actor support")

	for bad_element in ["0",true,-1,7,1.5]:
		_check(policy.call("advance_trigger_clocks",actor.merged({"el":bad_element},true),1.0).status == "NOT_READY","invalid element is not silently P0")
