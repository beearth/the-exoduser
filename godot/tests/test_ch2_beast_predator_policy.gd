extends SceneTree
## EC2-06 source oracle via explicit Node argument and temporary UTF8 receipt.
const Policy = preload("res://scripts/native_ch2_beast_predator_policy.gd")
const USERDIR = "EXODUSER-ec2-06-Isolated-20261020"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8');
function block(marker){const i=raw.indexOf(marker);if(i<0)throw Error(marker);const begin=raw.indexOf('{',i);let n=0,q='';for(let k=begin;k<raw.length;k++){let x=raw[k];if(q){if(x==='\\\\'){k++;continue}if(x===q)q='';continue}if(x==='"'||x==="'"){q=x;continue}if(x==='{')n++;if(x==='}'&&!--n)return raw.slice(i,k+1);}throw Error('block');}
const clone=v=>JSON.parse(JSON.stringify(v));
const c=vm.createContext({_T:s=>s});
const nativeHypot=Math.hypot;
c.distance=(kind,args,value)=>{c.queries.push({kind,args,value});return value};
c.hypot=(x,y)=>c.distance('hypot',[x,y],nativeHypot(x,y));
vm.runInContext(block('function dst(')+';const nativeDst=dst;dst=(...args)=>distance("dst",args,nativeDst(...args));Math.hypot=(x,y)=>hypot(x,y);Math.random=()=>draw();',c);
c.draw=()=>{if(c.cursor>=c.stream.length)throw Error('random exhaustion');const value=c.stream[c.cursor++];c.events.push({kind:'random',value});return value};
c.addTxt=(x,y,text,col,life)=>c.events.push({kind:'text',x,y,text,col,life});
c.addParts=(x,y,col,count)=>{c.events.push({kind:'parts',x,y,col,count});for(let i=0;i<c.fxDraws;i++)c.draw()};
c.shake=amount=>c.events.push({kind:'shake',amount});
c.SFX={charge:()=>{c.events.push({kind:'sfx_charge'});if(c.fxDraws)c.draw()},groggy:()=>c.events.push({kind:'sfx_groggy'})};
c.canMv=(x,y,r)=>{c.events.push({kind:'can_move',x,y,r});return c.clear};
c.setTimeout=(fn,delay_ms)=>{c.events.push({kind:'schedule_beast_hit',index:c.callbacks.length,delay_ms});c.callbacks.push(fn)};
c.hurtP=damage=>{c.events.push({kind:'hurt_player',damage});if(c.hurtMutates){c.P.x+=7;c.P.y-=9;c.e.x-=5;c.e.y+=3;c.e.atk+=99;c.e.col='#abcdef';c.e.dead=true;c.e.stunned=22}};
const fns={};for(const type of [35,36,37])fns[type]=vm.runInContext('(function(){'+block("if(e.etype==="+type+"&&e.s==='idle')")+'})',c);
function base(type){return {etype:type,ib:false,s:'idle',x:100.25,y:-20.5,r:20,facing:.3,speed:.625,atk:31,baseAtk:31,hp:50,mhp:100,dead:false,stunned:0,col:'#123456',_beastComboT:0,_beastComboCd:133.5,_beastRoarT:0,_beastRoarCd:333.5,_serpentZigT:0,_serpentZigCd:91.5,_predStealthT:0,_predStealthCd:223.5,_predCorpseHeal:.3,unrelated:{keep:[1,2]}}}
function setup(actor,{player={x:150.25,y:-20.5,facing:0},sp=1,d=30,now=0,clear=true,stream=[0,0],fxDraws=0,hurtMutates=false,allies}={}){
 c.e=clone(actor);c.P=clone(player);c.sp=sp;c.d=d;c._now=now;c.clear=clear;c.stream=[...stream,...Array.from({length:128},(_,i)=>(i%7)/8)];c.cursor=0;c.events=[];c.queries=[];c.callbacks=[];c.fxDraws=fxDraws;c.hurtMutates=hurtMutates;
 c.ens=allies?clone(allies):[];
 if(actor.etype===35)c.ens=[c.e,{x:actor.x+199.999999,y:actor.y,atk:31,_aSpdM:0,dead:false,alive:false},{x:actor.x+200,y:actor.y,atk:99,dead:false},{x:actor.x+1,y:actor.y,atk:-31,_aSpdM:.5,dead:true},{x:actor.x,y:actor.y+1,atk:2147483648,dead:false}];
}
const cases=[];
function add(type,extra={},opts={}){
 const actor={...base(type),...extra};setup(actor,opts);
 const input={actor:clone(actor),player:clone(c.P),sp:c.sp,d:c.d,now:c._now,clear:c.clear,stream:clone(c.stream),fxDraws:c.fxDraws,hurtMutates:c.hurtMutates,allies:clone(c.ens)};
 fns[type]();cases.push({...input,after:clone(c.e),afterPlayer:clone(c.P),afterAllies:clone(c.ens),events:clone(c.events),queries:clone(c.queries),draws:c.cursor});
}
for(const s of ['idle','recover'])for(const combo of [0,1,2])for(const roar of [0,1,2])for(const d of [40-1e-10,40,1200])for(const distance of [799.999999,800])add(35,{s,_beastComboT:combo,_beastRoarT:roar},{sp:1,d,player:{x:100.25+distance,y:-20.5,facing:0},fxDraws:2});
for(const s of ['idle','recover'])for(const timer of [0,1,2])for(const sp of [0,.25,1])for(const d of [0,50-1e-10,50,1200-1e-10,1200])for(const pair of [[0,0],[.1,.05],[.999,.999]])for(const clear of [true,false])add(36,{s,_serpentZigT:timer,_aSpdM:timer===0?0:timer===1?.5:undefined},{sp,d,now:sp,clear,stream:pair,hurtMutates:true,fxDraws:2});
for(const s of ['idle','recover'])for(const timer of [0,1,2])for(const cloaked of [false,true])for(const boosted of [false,true])for(const clear of [true,false])for(const d of [1199.999999,1200])for(const u of [0,.01]){
 const actor=base(37),player={x:150.25,y:-20.5,facing:0};
 const x=clear&&d<1200?player.x-30:actor.x;
 add(37,{s,_predStealthT:timer,_cloaked:cloaked,_predAtkBoost:boosted},{sp:1,d,clear,player,stream:[u],allies:[{x,y:actor.y,dead:false},{x:x+60,y:actor.y,dead:true},{x:x+10,y:actor.y,dead:true,ib:true},{x:x+20,y:actor.y,dead:true}],fxDraws:0});
}
for(const rate of [-1,0,.3])for(const hp of [0,99,100])for(const sp of [0,2])for(const face of [0,.5])add(37,{_predCorpseHeal:rate,hp},{sp,d:100,player:{x:120.25,y:-20.5,facing:face},stream:[0,0],fxDraws:2,allies:[{x:110.25,y:-20.5,dead:true},{x:100.25,y:-20.5,dead:true}]});
for(const sp of [10,20])add(36,{_aSpdM:null},{sp,d:20,now:.125,stream:[.999,.999],hurtMutates:false});
const callbacks=[];
for(const index of [0,1,2])for(const guard of [{},{dead:true},{hp:0},{stunned:1},{s:'recover'}])for(const atk of [10,101,-31,2147483648])for(const distance of [59.999999,60])for(const hurtMutates of [false,true]){
 setup(base(35),{d:0});fns[35]();
 Object.assign(c.e,guard,{atk});c.P={x:c.e.x+distance,y:c.e.y,facing:0};c.hurtMutates=hurtMutates;c.fxDraws=2;c.events=[];c.queries=[];c.cursor=0;
 const input={index,actor:clone(c.e),player:clone(c.P),stream:clone(c.stream),fxDraws:c.fxDraws,hurtMutates};
 c.callbacks[index]();callbacks.push({...input,after:clone(c.e),afterPlayer:clone(c.P),events:clone(c.events),queries:clone(c.queries),draws:c.cursor});
}
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v;}
fs.writeFileSync(process.argv[3],JSON.stringify({sha256:crypto.createHash('sha256').update(raw).digest('hex'),cases:pack(cases),callbacks:pack(callbacks)}),'utf8');
"""
class Fixture extends RefCounted:
	var parent: Dictionary
	var player: Dictionary
	var allies: Array
	var events: Array = []
	var values: Array
	var cursor: int = 0
	var queries: Array
	var query_cursor: int = 0
	var fx_draws: int
	var hurt_mutates: bool
	var clear: bool
	var owner: Variant
	func _init(test: Variant, row: Dictionary) -> void:
		owner = test
		parent = row.actor.duplicate(true)
		parent.etype = int(parent.etype)
		player = row.player.duplicate(true)
		allies = row.get("allies",[]).duplicate(true)
		values = row.stream.duplicate(true)
		queries = row.queries.duplicate(true)
		fx_draws = int(row.fxDraws)
		hurt_mutates = row.hurtMutates
		clear = row.get("clear",true)
	func sample() -> Variant:
		if cursor >= values.size():
			return null
		var value: Variant = values[cursor]
		cursor += 1
		events.append({"kind":"random","value":value})
		return value
	func move(x: float,y: float,r: float) -> bool:
		events.append({"kind":"can_move","x":x,"y":y,"r":r})
		return clear
	func distance(kind: String,args: Array) -> float:
		owner._check(query_cursor < queries.size(),"fresh distance source site exists")
		if query_cursor >= queries.size():
			return NAN
		var query: Dictionary = queries[query_cursor]
		query_cursor += 1
		owner._same(query.kind,kind,"distance site kind")
		owner._same(args,query.args,"distance current actor/player coordinates")
		return float(query.value)
	func apply(commands: Array) -> void:
		for command in commands:
			events.append(command.duplicate(true))
			match command.kind:
				"parts":
					for i in range(fx_draws):
						sample()
				"sfx_charge":
					if fx_draws > 0:
						sample()
				"hurt_player":
					if hurt_mutates:
						player.x += 7
						player.y -= 9
						parent.x -= 5
						parent.y += 3
						parent.atk += 99
						parent.col = "#abcdef"
						parent.dead = true
						parent.stunned = 22

var policy: RefCounted = Policy.new()
var assertions: int = 0
var failures: int = 0
var oracle_cases: int = 0
var callback_cases: int = 0
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
		printerr("EC2_06_FAIL ",label)
func _same(a: Variant, b: Variant, label: String) -> void:
	var error: String = _mismatch(a,b)
	_check(error.is_empty(),label+" "+error)
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

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC2_06_INVALID_ISOLATION")
		quit(2)
		return
	_check(not node_bin.is_empty(),"explicit --node-bin required")
	var oracle: Dictionary = _oracle() if not node_bin.is_empty() else {}
	if not oracle.is_empty():
		for row in oracle.cases:
			_compare(row)
		for row in oracle.callbacks:
			_compare_callback(row)
		_test_contracts(oracle)
		_test_refusals(oracle.cases[0].actor)
	print("EC2_06_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"oracle_cases":oracle_cases,"callback_cases":callback_cases,"source_sha256":source_sha,"skipped":[],"product_connected":false,"public_play_evidence":false}))
	quit(0 if failures == 0 and oracle_cases > 0 and callback_cases > 0 else 1)

func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec2-06-source-oracle.cjs")
	var result_path: String = OS.get_user_data_dir().path_join("ec2-06-source-oracle.json")
	_check(FileAccess.file_exists(source) and not FileAccess.file_exists(helper) and not FileAccess.file_exists(result_path),"source/no temporary overwrite")
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
	_check(DirAccess.remove_absolute(helper) == OK,"temporary helper removed")
	_check(DirAccess.remove_absolute(result_path) == OK,"temporary UTF8 result removed")
	_check(data is Dictionary and data.get("cases",[]).size() > 0 and data.get("callbacks",[]).size() > 0,"structured oracle")
	if not data is Dictionary:
		return {}
	source_sha = FileAccess.get_sha256(source)
	_check(data.sha256 == source_sha,"source bytes SHA")
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
func _take(f: Fixture, result: Dictionary) -> bool:
	_check(result.status == "READY" and not result.product_connected,"pure policy ready")
	if result.status != "READY":
		return false
	f.parent = result.actor
	f.apply(result.commands)
	return true

func _compare(row: Dictionary) -> void:
	oracle_cases += 1
	var input: Dictionary = row.actor.duplicate(true)
	var f := Fixture.new(self,row)
	var clock: Dictionary = policy.advance_clocks(f.parent,row.sp)
	if not _take(f,clock):
		return
	var idle: bool = clock.idle_entered
	match int(f.parent.etype):
		35:
			if not _take(f,policy.plan_combo(f.parent,row.d,idle)):
				return
			var distance: float = NAN
			if idle and f.parent._beastRoarT <= 0:
				distance = f.distance("dst",[f.parent.x,f.parent.y,f.player.x,f.player.y])
			var roar: Dictionary = policy.plan_roar(f.parent,distance,idle)
			if not _take(f,roar):
				return
			if roar.scan_allies:
				for i in range(f.allies.size()):
					var ally: Dictionary = f.parent if i == 0 else f.allies[i]
					var gap: float = NAN
					if ally.get("dead") != true and i != 0:
						gap = f.distance("hypot",[float(ally.x)-float(f.parent.x),float(ally.y)-float(f.parent.y)])
					var result: Dictionary = policy.plan_roar_ally(f.parent,ally,i==0,gap,true)
					_check(result.status == "READY","roar ally ready")
					f.allies[i] = result.ally
					f.apply(result.commands)
			f.allies[0] = f.parent.duplicate(true)
		36:
			if not _take(f,policy.plan_zig(f.parent,row.d,row.sp,row.now,idle,f.move)):
				return
			var poison: Dictionary = policy.plan_serpent_poison(f.parent,f.player,row.d,row.sp,idle,f.sample)
			_check(poison.status == "READY","poison ready")
			f.player = poison.player
			if not _take(f,poison):
				return
			var tail: Dictionary = policy.plan_serpent_tail(f.parent,row.d,row.sp,idle,f.sample)
			if not _take(f,tail):
				return
			if tail.phase == "after_tail_hurt":
				if not _take(f,policy.finish_tail_hit(f.parent,f.player)):
					return
		37:
			if not _take(f,policy.plan_stealth(f.parent,row.d,idle)):
				return
			if not _take(f,policy.plan_ambush(f.parent,f.player,row.d,idle,f.move)):
				return
			var scan: Dictionary = policy.plan_corpse_scan(f.parent,row.sp,idle,f.sample)
			if not _take(f,scan):
				return
			if scan.scan_corpses:
				for i in range(f.allies.size()):
					var corpse: Dictionary = f.allies[i]
					var distance: float = NAN
					if corpse.get("dead") == true:
						distance = f.distance("hypot",[float(corpse.x)-float(f.parent.x),float(corpse.y)-float(f.parent.y)])
					var result: Dictionary = policy.plan_corpse_candidate(f.parent,corpse,distance,true)
					if not _take(f,result):
						return
					f.allies[i] = result.corpse
					if result.matched:
						break
	_verify(f,row)
	_same(row.actor,input,"input actor unchanged")

func _verify(f: Fixture,row: Dictionary) -> void:
	_same(f.parent,row.after,"source actor copy")
	_same(f.player,row.afterPlayer,"source player request copy")
	if row.has("afterAllies"):
		_same(f.allies,row.afterAllies,"source ally/corpse copies/order")
	_same(f.events,row.events,"exact command/independent RNG/site order")
	_check(f.cursor == int(row.draws) and f.query_cursor == row.queries.size(),"exact draw/current-distance site counts")

func _compare_callback(row: Dictionary) -> void:
	callback_cases += 1
	var f := Fixture.new(self,row)
	var gap: float = NAN
	if not f.parent.dead and f.parent.hp > 0 and f.parent.stunned == 0:
		gap = f.distance("hypot",[float(f.player.x)-float(f.parent.x),float(f.player.y)-float(f.parent.y)])
	var result: Dictionary = policy.plan_combo_hit(f.parent,gap,int(row.index))
	if not _take(f,result):
		return
	if result.phase == "after_combo_hurt":
		if not _take(f,policy.finish_combo_hit(f.parent,f.player,int(row.index))):
			return
	_verify(f,row)

func _test_contracts(oracle: Dictionary) -> void:
	var scheduled: int = 0
	var blocked_ambush: int = 0
	var corpse_used: int = 0
	var independent_double_hit: int = 0
	for row in oracle.cases:
		var poison: bool = false
		var tail: bool = false
		for event in row.events:
			if event.kind == "schedule_beast_hit":
				scheduled += 1
				_check(event.delay_ms == event.index*250,"0/250/500 callback request only")
			if event.kind == "text" and event.text == "독!":
				poison = true
			if event.kind == "hurt_player":
				tail = true
		if poison and tail:
			independent_double_hit += 1
		if row.actor.etype == 37:
			if not row.clear and row.after.s == "windup":
				blocked_ambush += 1
				_check(row.after.st2 == 12 and row.after._cloaked == false,"failed move still windup12/decloak")
			var used: int = 0
			for corpse in row.afterAllies:
				if corpse.x == -9999 and corpse.y == -9999:
					used += 1
			_check(used <= 1,"first corpse only")
			corpse_used += used
	_check(scheduled > 0 and blocked_ambush > 0 and corpse_used > 0 and independent_double_hit > 0,"source coverage schedule/failure/corpse/independent")
	_check(oracle.callbacks.size() == callback_cases and callback_cases > 0,"callbacks executed manually, not real elapsed timer")

func _test_refusals(source: Dictionary) -> void:
	var actor: Dictionary = source.duplicate(true)
	actor.etype = int(actor.etype)
	for key in ["etype","ib","s","x","atk","_beastComboT"]:
		var bad: Dictionary = actor.duplicate(true)
		bad.erase(key)
		_check(policy.advance_clocks(bad,1).status == "NOT_READY","missing context "+key)
	for sp in [-1.0,INF,NAN]:
		_check(policy.advance_clocks(actor,sp).status == "NOT_READY","bad clock")
	_check(policy.plan_combo_hit(actor,10,-1).status == "NOT_READY","bad callback index")
	_check(policy.plan_combo_hit(actor,NAN,0).status == "NOT_READY","fresh distance required when callback guard passes")
	_check(policy.finish_combo_hit(actor,{},0).status == "NOT_READY","fresh post-hurt player required")
	_check(policy.plan_roar(actor,NAN,true).status == "NOT_READY","fresh roar distance required")
	var serpent: Dictionary = actor.duplicate(true)
	serpent.etype = 36
	_check(policy.plan_zig(serpent,1,1,0,true,Callable()).status == "NOT_READY","movement binding required")
	_check(policy.plan_zig(serpent,1200,1,0,true,Callable()).status == "READY","ineligible movement binding not needed")
	_check(policy.plan_serpent_tail(serpent,1,1,true,Callable()).status == "NOT_READY","tail RNG required")
	_check(policy.plan_serpent_tail(serpent,50,1,true,Callable()).status == "READY","distance50 no draw")
	var predator: Dictionary = actor.duplicate(true)
	predator.etype = 37
	predator._cloaked = true
	_check(policy.plan_ambush(predator,{"x":0,"y":0,"facing":0},1,true,Callable()).status == "NOT_READY","ambush movement required")
	_check(policy.plan_corpse_scan(predator,1,true,Callable()).status == "NOT_READY","corpse RNG required")
	predator._predCorpseHeal = 0
	_check(policy.plan_corpse_scan(predator,1,true,Callable()).status == "READY","zero heal no draw")
