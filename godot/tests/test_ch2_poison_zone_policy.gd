extends SceneTree
## Pure source-branch command/state parity; no real Player/World damage or birth.
const Policy = preload("res://scripts/native_ch2_poison_zone_policy.gd")
const USERDIR = "EXODUSER-ec2-03-Isolated-20261020"
const SOURCE_PROBE = """
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const raw=fs.readFileSync(process.argv[2],'utf8');
function between(a,b){const i=raw.indexOf(a),j=raw.indexOf(b,i+a.length);if(i<0||j<0)throw Error(a);return raw.slice(i,j);}
function block(marker){const i=raw.indexOf(marker);if(i<0)throw Error(marker);const begin=raw.indexOf('{',i);let n=0,quote='';for(let k=begin;k<raw.length;k++){let ch=raw[k];if(quote){if(ch==='\\\\'){k++;continue}if(ch===quote)quote='';continue}if(ch==='"'||ch==="'"){quote=ch;continue}if(ch==='{')n++;if(ch==='}'&&!--n)return raw.slice(i,k+1);}throw Error('unclosed '+marker);}
const clone=v=>JSON.parse(JSON.stringify(v));
const c=vm.createContext({window:{},G:{stage:4},projs:[],_projFree:[],_eProjDropCnt:0,_ancestorTargetForEnemy:()=>null,_emitEnemyShot:()=>{throw Error('stationary zone routed to warning')},_T:s=>s});
vm.runInContext(between('const EL={','const ETYPE_ERES=')+block('function elMul(')+block('function dst(')+block('function _mkProj(')+block('function _prepareDarkSphere(')+block('function _projectileParryClass(')+block('function _spawnBossProjectile(')+block('function spawnProj('),c);
c.events=[];c.normalized=[];c.postClock={};
c._spawnOriginal=c._spawnBossProjectile;
c._spawnBossProjectile=(e,props)=>{c.events.push({kind:'spawn_boss_projectile',packet:clone(props)});const p=c._spawnOriginal(e,props);c.normalized.push(clone(p));return p;};
c.addTxt=(x,y,text,col,life)=>c.events.push({kind:'text',x,y,text,col,life});
c.SFX={magic:gain=>c.events.push({kind:'sfx_magic',gain})};
vm.runInContext('Math.random=()=>{throw Error("unexpected source RNG")}',c);
const emitFns={};
for(const etype of [34,38]){
 const field=etype===34?'_poisonZoneT':'_broodGasT';
 const clock=raw.slice(raw.indexOf('e.'+field+'-=sp;'),raw.indexOf('e.'+field+'-=sp;')+('e.'+field+'-=sp;').length);
 const branch=block('if(e.'+field+'<=0&&d<'+(etype===34?'300':'1200')+')');
 emitFns[etype]=vm.runInContext('(function(){clockActor=JSON.parse(JSON.stringify(e));if(e.etype==='+etype+'&&e.s===\\'idle\\'){'+clock+'clockActor=JSON.parse(JSON.stringify(e));Object.assign(e,postClock);'+branch+'}})',c);
}
const emit=[];
function addEmit(etype,s,timer,sp,d,atk,postClock={}){const field=etype===34?'_poisonZoneT':'_broodGasT',cd=etype===34?'_poisonZoneCd':'_broodGasCd';const actor={etype,ib:false,s,x:100.25,y:-80.75,atk,[field]:timer,[cd]:217.25,unrelated:{keep:[9,8]}};c.e=clone(actor);c.postClock=postClock;c.sp=sp;c.d=d;c.events=[];c.normalized=[];emitFns[etype]();emit.push({actor,postClock,sp,d,clock:c.clockActor,after:clone(c.e),commands:c.events,normalized:c.normalized});}
for(const etype of [34,38]){
 const limit=etype===34?300:1200;
 for(const s of ['idle','windup','dead'])for(const timer of [-1,0,.5,1,10])for(const sp of [0,.25,1,2.5])for(const d of [0,limit-1e-12,limit,limit+1e-12,2000])addEmit(etype,s,timer,sp,d,31.9);
 for(const atk of [0,1,-31.9,2147483648,4294967296,1e18,1e308])addEmit(etype,'idle',0,1,0,atk);
}
addEmit(38,'idle',0,1,0,31,{x:333.5,y:-222.25,atk:99,s:'windup'});
const tickBranch=block('if(p.poisonZone){');
const tickFn=vm.runInContext('(function(){let completed=false;for(let once=0;once<1;once++){'+tickBranch+'completed=true;}return completed?"fallthrough":"continue_projectiles"})',c);
const tick=[];const rowLife=[];
function baseZone(etype){return{x:0,y:0,vx:0,vy:0,dmg:etype===34?12:15,el:3,friendly:false,life:etype===34?300:400,ml:etype===34?300:400,col:etype===34?'#33aa22':'#556633',sz:etype===34?8:12,poisonZone:true,_tickCd:0,_tickRate:etype===34?30:25};}
function addTick(etype,changes={},state={},sp=1,mutate={},label='matrix',store=true){
 const zone={...baseZone(etype),...changes};const player={x:0,y:0,iframes:0,s:'idle',poison:0,armor:0,...state};
 c.p=clone(zone);c.sp=sp;c.P=clone(player);c.ar=()=>({el:c.P.armor});c.events=[];let poison=player.poison;let recordPoison=true;
 Object.defineProperty(c.P,'poison',{enumerable:true,configurable:true,get:()=>poison,set:v=>{poison=v;if(recordPoison)c.events.push({kind:'set_player_poison',value:v});}});
 c.addParts=(x,y,col,count)=>c.events.push({kind:'parts',x,y,col,count});c._recycleProj=()=>c.events.push({kind:'recycle_projectile'});
 let atDamage=null,afterHurt=null;
 c._hurtProjectilePlayer=(p,damage,opts)=>{atDamage={zone:clone(p),player:clone(c.P)};c.events.push({kind:'hurt_projectile_player',damage,opts:clone(opts)});recordPoison=false;Object.assign(c.P,mutate.player||{});Object.assign(p,mutate.zone||{});recordPoison=true;afterHurt={zone:clone(p),player:clone(c.P)};return mutate.refused?false:undefined;};
 const view={distance:Math.sqrt((player.x-zone.x)**2+(player.y-zone.y)**2),iframes:player.iframes,state:player.s,element_multiplier:vm.runInContext('elMul(p.el,ar().el)',c)};
 const flow=tickFn();const row={etype,zone,player,view,sp,mutate,label,atDamage,afterHurt,after:clone(c.p),playerAfter:clone(c.P),commands:c.events,flow};if(store)tick.push(row);return row;
}
for(const etype of [34,38]){
 const r=etype===34?40:60;
 for(const life of [300,.0001,0,-1,-900])for(const cd of [31,1,0,-.5])for(const sp of [0,.5,1,31])for(const d of [0,r-1e-12,r,r+1e-12])addTick(etype,{life,_tickCd:cd},{x:d},sp);
 for(const d of [0,r-1e-12,r,r+1e-12])for(const iframes of [-1,0,1])for(const s of ['idle','charge','fallen','dead','sBlock','sBash'])for(const armor of [0,3,4,5,6])addTick(etype,{},{x:d,iframes,s,armor});
 for(const dmg of [0,-31,2147483647,-2147483648,1e18,1e308])for(const armor of [0,3,4,5])addTick(etype,{dmg},{armor},1,{},'damage-int32');
 addTick(etype,{life:0},{poison:9},1,{player:{x:7,y:11,poison:41},refused:true},'fresh-player-refused');
 addTick(etype,{life:0},{},1,{zone:{life:10}},'life-restored-after-hurt');
 addTick(etype,{life:10},{},1,{zone:{life:-1}},'life-expired-after-hurt');
 addTick(etype,{_tickRate:0},{poison:null},1,{},'zero-rate-fallback');
 addTick(etype,{_tickRate:-2},{poison:-3},1,{},'negative-rate-truthy');
 addTick(etype,{vx:10,vy:-3},{},1,{},'zero-velocity');
 // A common-prefix fixture decrements life exactly once before each branch.
 let zone=baseZone(etype);let frames=0,hits=0;
 while(true){zone.life-=.667;const row=addTick(etype,zone,{},1,{},'sequence-'+frames);zone=clone(row.after);frames++;hits+=row.atDamage?1:0;if(row.flow==='continue_projectiles')break;if(frames>1000)throw Error('lifetime');}
 rowLife.push({etype,frames,hits});
}
function pack(v){if(typeof v==='number'){const b=Buffer.alloc(8);b.writeDoubleLE(v);return{$f64:b.toString('base64')}}if(Array.isArray(v))return v.map(pack);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,pack(x)]));return v;}
process.stdout.write(JSON.stringify({sha256:crypto.createHash('sha256').update(raw).digest('hex'),emit:pack(emit),tick:pack(tick),lifetimes:rowLife}));
"""
var policy: RefCounted = Policy.new()
var assertions: int = 0
var failures: int = 0
var emission_cases: int = 0
var tick_cases: int = 0
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
		printerr("EC2_03_FAIL ",label)

func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir",false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name","") != USERDIR:
		printerr("EC2_03_INVALID_ISOLATION")
		quit(2)
		return
	var oracle: Dictionary = _oracle()
	if not oracle.is_empty():
		for row in oracle.emit:
			_emission(row)
		for row in oracle.tick:
			_tick(row)
		for row in oracle.lifetimes:
			_check(row.frames == (450 if row.etype == 34 else 600),"source life .667 prefix fixture")
		_test_source_coverage(oracle)
	_test_refusals()
	print("EC2_03_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"emission_cases":emission_cases,"tick_cases":tick_cases,"source_sha256":source_sha,"skipped":[],"product_connected":false,"public_play_evidence":false}))
	quit(0 if failures == 0 and emission_cases > 0 and tick_cases > 0 else 1)

func _oracle() -> Dictionary:
	var source: String = ProjectSettings.globalize_path("res://../game.html").simplify_path()
	var helper: String = OS.get_user_data_dir().path_join("ec2-03-source-oracle.cjs")
	_check(FileAccess.file_exists(source) and not FileAccess.file_exists(helper),"exact source / no helper overwrite")
	if failures > 0:
		return {}
	_check(DirAccess.make_dir_recursive_absolute(OS.get_user_data_dir()) == OK,"isolated directory")
	var file: FileAccess = FileAccess.open(helper,FileAccess.WRITE)
	_check(file != null,"isolated helper")
	if file == null:
		return {}
	file.store_string(SOURCE_PROBE)
	file.close()
	var output: Array = []
	var code: int = OS.execute(node_bin,PackedStringArray([helper,source]),output,true)
	_check(DirAccess.remove_absolute(helper) == OK,"remove own helper")
	_check(code == 0,"source probe exit0")
	if code != 0:
		printerr("\n".join(output).left(1800))
		return {}
	var raw: Variant = JSON.parse_string("\n".join(output))
	_check(raw is Dictionary and raw.get("emit",[]).size() > 0 and raw.get("tick",[]).size() > 0,"nonempty structured source oracle")
	if not raw is Dictionary:
		return {}
	source_sha = FileAccess.get_sha256(source)
	_check(raw.sha256 == source_sha,"oracle source hash")
	return _unpack(raw)

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

func _same(a: Variant, b: Variant) -> bool:
	if (typeof(a) == TYPE_INT or typeof(a) == TYPE_FLOAT) and (typeof(b) == TYPE_INT or typeof(b) == TYPE_FLOAT):
		return float(a) == float(b)
	if a is Dictionary and b is Dictionary:
		if a.size() != b.size():
			return false
		for key in b:
			if not a.has(key) or not _same(a[key],b[key]):
				return false
		return true
	if a is Array and b is Array:
		if a.size() != b.size():
			return false
		for i in range(a.size()):
			if not _same(a[i],b[i]):
				return false
		return true
	return a == b

func _emission(row: Dictionary) -> void:
	var actor: Dictionary = row.actor.duplicate(true)
	actor.etype = int(actor.etype)
	var before: Dictionary = actor.duplicate(true)
	var clock: Dictionary = policy.call("advance_emitter_clock",actor,float(row.sp))
	_check(clock.status == "READY" and _same(clock.actor,row.clock),"source own clock / idle guard")
	if clock.status != "READY":
		return
	var result: Dictionary = policy.call("plan_emission",clock.actor.merged(row.postClock,true),float(row.d),clock.idle_entered)
	_check(result.status == "READY" and _same(result.actor,row.after),"source timer reset")
	_check(_same(result.commands,row.commands),"source raw packet / text / sfx order")
	_check(_same(actor,before) and result.product_connected == false,"emitter input unchanged / no consumer claim")
	for index in range(row.normalized.size()):
		var raw: Dictionary = result.commands[0].packet
		var normalized: Dictionary = row.normalized[index]
		_check(normalized.dmg == raw.dmg and normalized.sz == raw.sz and normalized.vx == 0 and normalized.vy == 0,"original stationary birth no moving multipliers")
		_check(normalized.parryClass == "forbidden" and normalized._druidPoison == false,"original classifier / nonboss birth")
	emission_cases += 1

func _tick(row: Dictionary) -> void:
	var before: Dictionary = row.duplicate(true)
	var etype: int = int(row.etype)
	var result: Dictionary = policy.call("plan_contact",etype,row.zone,row.view,float(row.sp))
	var label: String = "%d %s" % [etype,row.label]
	_check(result.status == "READY","contact ready " + label)
	if result.status != "READY":
		return
	var commands: Array = result.commands.duplicate(true)
	var final_zone: Dictionary = result.zone
	var flow: String
	if row.atDamage != null:
		_check(result.phase == "after_hurt_required" and not result.has("flow"),"expiry deferred until hurt returns " + label)
		_check(_same(result.zone,row.atDamage.zone),"exact pre-hurt zone " + label)
		var finish: Dictionary = policy.call("finish_contact",etype,row.afterHurt.zone,row.afterHurt.player)
		_check(finish.status == "READY","fresh post-hurt finish " + label)
		if finish.status != "READY":
			return
		commands.append_array(finish.commands)
		final_zone = finish.zone
		flow = finish.flow
	else:
		_check(result.phase == "branch_complete","no contact no resume " + label)
		flow = result.flow
	_check(_same(final_zone,row.after),"source zone fields " + label)
	_check(_same(commands,row.commands),"damage→poison→presentation→expire order " + label)
	_check(flow == row.flow,"continue / fallthrough " + label)
	_check(_same(row,before) and result.product_connected == false,"tick inputs unchanged / no actual writes " + label)
	tick_cases += 1

func _test_source_coverage(oracle: Dictionary) -> void:
	for etype in [34,38]:
		_check(policy.call("radius",etype).value == (40 if etype == 34 else 60),"original radius size×5")
		for label in ["fresh-player-refused","life-restored-after-hurt","life-expired-after-hurt","zero-rate-fallback","negative-rate-truthy","zero-velocity"]:
			var rows: Array = oracle.tick.filter(func(row: Dictionary) -> bool: return row.etype == etype and row.label == label)
			_check(rows.size() == 1 and rows[0].atDamage != null,"explicit source edge " + label)
		var refused: Array = oracle.tick.filter(func(row: Dictionary) -> bool: return row.etype == etype and row.label == "fresh-player-refused")
		_check(refused[0].playerAfter.poison == 43 and refused[0].playerAfter.x == 7,"poison after refused hurt uses fresh player")

func _test_refusals() -> void:
	var actor := {"etype":34,"ib":false,"s":"idle","x":0,"y":0,"atk":31,"_poisonZoneT":0,"_poisonZoneCd":200}
	for key in actor:
		var missing: Dictionary = actor.duplicate(true)
		missing.erase(key)
		_check(policy.call("advance_emitter_clock",missing,1.0).status == "NOT_READY","missing actor field no defaults")
	for bad in [-1.0,NAN,INF]:
		_check(policy.call("advance_emitter_clock",actor,bad).status == "NOT_READY","invalid elapsed")
		_check(policy.call("plan_emission",actor,bad,true).status == "NOT_READY","invalid distance")
	for change in [{"etype":35},{"etype":38},{"ib":true},{"atk":"31"}]:
		_check(policy.call("plan_emission",actor.merged(change,true),0.0,true).status == "NOT_READY","foreign or incomplete actor")
	var zone := {"x":0,"y":0,"vx":0,"vy":0,"dmg":12,"el":3,"friendly":false,"life":0,"ml":300,"col":"#33aa22","sz":8,"poisonZone":true,"_tickCd":0,"_tickRate":30}
	var view := {"distance":0,"iframes":0,"state":"idle","element_multiplier":1}
	for key in zone:
		if key == "ml":
			continue # the source branch does not read ml
		var missing: Dictionary = zone.duplicate(true)
		missing.erase(key)
		_check(policy.call("plan_contact",34,missing,view,1.0).status == "NOT_READY","missing zone read no defaults")
	for key in view:
		var missing: Dictionary = view.duplicate(true)
		missing.erase(key)
		_check(policy.call("plan_contact",34,zone,missing,1.0).status == "NOT_READY","missing contact owner view")
	for etype in [0,33,35,39,90]:
		_check(policy.call("plan_contact",etype,zone,view,1.0).status == "NOT_READY" and policy.call("radius",etype).status == "NOT_READY","no other zones/kernels")
	_check(policy.call("finish_contact",34,zone,{}).status == "NOT_READY","post-hurt position cannot be invented")
	_check(policy.call("finish_contact",34,zone,{"x":0,"y":0,"poison":"2"}).status == "NOT_READY","invalid poison domain")
	_check(policy.call("finish_contact",34,zone,{"x":0,"y":0}).commands[0].value == 2,"source undefined poison fallback0")
