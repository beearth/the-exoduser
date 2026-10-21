extends SceneTree
## Exact main source VM oracle; external node path and UTF-8 temp payload.
const ControlPacket=preload("res://scripts/native_ch1_boss_control_states.gd")
const USERDIR="EXODUSER-bc10-Isolated-20261020"
const GAME_SHA256=preload("res://source_snapshot/snapshot.gd").SHA256
const ORACLE_JS: String="'use strict';\nconst fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');\nconst argv=process.argv.slice(2), arg=k=>{const a=argv.find(x=>x.startsWith(k+'='));if(!a)throw Error('missing '+k);return a.slice(k.length+1)};\nconst source=fs.readFileSync(arg('--source-game'),'utf8'),sha=crypto.createHash('sha256').update(source).digest('hex');\nif(sha!=='" + preload("res://source_snapshot/snapshot.gd").SHA256 + "')throw Error('source hash mismatch');\nconst lines=source.split('\\n');\n// Exact source statements; ONLY boundary wrappers/stubs. No GDScript input.\nlet grab=lines.slice(40836,40867).join('\\n'),burrow=lines.slice(41046,41072).join('\\n');\ngrab=grab.replace('    P.x=e.x+', '    control(()=>{P.x=e.x+').replace('    P.kb.x=0;P.kb.y=0;', '    P.kb.x=0;P.kb.y=0;},40854,40855);');\ngrab=grab.replace('      const _ta=e._grabAng;','      control(()=>{const _ta=e._grabAng;').replace('P.iframes=30;addTxt','P.iframes=30;},40863,40864);addTxt');\nburrow=burrow.replace('        if(isPWin()){','        contact(()=>{if(isPWin()){').replace('P.kb.y+=Math.sin(_ka)*14;}','P.kb.y+=Math.sin(_ka)*14;} });');\nif(!grab.includes('control(()=>')||!burrow.includes('contact(()=>'))throw Error('wrapper anchor mismatch');\nconst program=new vm.Script('switch(e.s){\\n'+grab+'\\n'.repeat(41047-40867)+burrow+'\\n}',{filename:'game-bc10.js',lineOffset:40835});\nconst clone=x=>structuredClone(x),rows=[];\nfunction run(input){\n const row=clone(input),events=[],responses=[],commands=[];let mute=false,assignments=[],rngIndex=0,collisionIndex=0;\n const line=()=>{const m=new Error().stack.match(/game-bc10.js:(\\d+):/);if(!m)throw Error('missing source line');return +m[1]};\n const e0=clone(row.enemy),p0=clone(row.player);\n const e=new Proxy(e0,{set(t,k,v){t[k]=v;if(!mute)events.push({kind:'write',field:k,value:clone(v),source_line:line()});return true}});\n const p=new Proxy(p0,{set(t,k,v){t[k]=v;if(mute)assignments.push({path:k,value:clone(v)});else throw Error('unwrapped P write '+k);return true}});\n p0.kb=new Proxy(p0.kb,{set(t,k,v){t[k]=v;if(mute)assignments.push({path:'kb.'+k,value:v});else throw Error('unwrapped KB');return true}});\n const snapshot=()=>({enemy_after:clone(e0),player_after:JSON.parse(JSON.stringify(p0))});\n // structuredClone cannot clone p0.kb Proxy, so snapshot via UTF-8 JSON shape.\n const snap=()=>({enemy_after:clone(e0),player_after:JSON.parse(JSON.stringify(p0))});\n function emit(name,args,l=line(),response={ack:true}){events.push({kind:'command',command:name,args:clone(args),source_line:l});commands.push(name);responses.push(clone(response));}\n const math=Object.create(Math);math.random=()=>{const unit=row.units[rngIndex++%row.units.length];if(!mute)events.push({kind:'rng',unit,source_line:line()});return unit;};\n const globals=new Proxy({shake:0},{set(t,k,v){t[k]=v;if(!mute)events.push({kind:'global_write',field:k,value:v,source_line:line()});return true}});\n function hurtP(damage,options){if(mute)return; const l=line();if(row.owner_mutate){mute=true;p.iframes=17;p.x+=7;e._grabAng+=.2;e.atk+=1;mute=false;}emit('resolve_boss_grab_damage',[damage,options??null],l,{ack:true,...snap()});}\n const ctx={e,P:p,sp:row.sp,G:globals,OPT:{shake:row.context.shake},Math:math,\n dst:(a,b,c,d)=>Math.sqrt((a-c)*(a-c)+(b-d)*(b-d)),canMv:(...args)=>{const value=row.collisions[collisionIndex++]??false;emit('canMv',args,line(),{ack:true,value});return value},\n poolPart:(...a)=>emit('poolPart',a),addTxt:(...a)=>{if(!mute)emit('addTxt',a)},addParts:(...a)=>{if(!mute)emit('addParts',a)},\n _T:s=>{if(mute)return s;emit('_T',[s],line(),{ack:true,value:s});return s},\n SFX:{groggy:()=>emit('SFX.groggy',[]),detonate:()=>emit('SFX.detonate',[])},shake:(...a)=>emit('shake',a),_addBlastLight:(...a)=>emit('_addBlastLight',a),\n _isDruidFinale:()=>false,elMul:()=>row.el_multiplier,ar:()=>({el:0}),hurtP,\n isPWin:()=>row.parry,wp:()=>({atk:10,enh:0}),enhMulAtk:()=>0,pParryDmg:()=>1,\n hurtE:()=>{},doParry:()=>{},_poiseHit:()=>{},\n control(fn,first,last){mute=true;assignments=[];fn();mute=false;emit('apply_boss_player_control',assignments,first,{ack:true,...snap()});},\n contact(fn){mute=true;assignments=[];fn();mute=false;emit('resolve_boss_erupt_contact',[],41068,{ack:true,...snap()});}\n };\n if(row.context.vfx_available)ctx.playVFXAng=(...a)=>emit('playVFXAng',a);\n program.runInNewContext(ctx,{timeout:1000});\n return {input:row,expected:{...snap(),events,responses,rng_count:rngIndex},integer_paths:[]};\n}\nfunction base(s,st2=0,si=0){return {si,sp:1,enemy:{s,st2,x:10,y:-5,r:44,speed:.5,facing:.25,atk:46,el:0,_grabAng:.7,_teleOx:10,_teleOy:-5,_diveTx:110,_diveTy:35,_underMax:45,_eruptMax:40,_eruptHit:false,iframes:0,stunned:0,sentinel:{keep:7}},player:{s:'idle',x:90,y:15,r:14,iframes:0,kb:{x:3,y:-2},poison:2,_webSlow:10,baseAtk:20,parryBank:0,sentinel:{keep:9}},context:{druid_finale:false,vfx_available:true,shake:75},collisions:[true],units:[.75,.25,.125],el_multiplier:1.25,parry:false,owner_mutate:false};}\nfunction add(r){rows.push(run(r));}\nfor(let si=0;si<4;si++)for(const sp of [.5,1,2])for(const st of [1,0,-.5])for(const collision of [[true],[false,true],[false,false,true],[false,false,false]]){const r=base('bossGrabWind',st,si);r.sp=sp;r.collisions=collision;add(r);}\nfor(const gate of [.6,.6000001,.5]){const r=base('bossGrabWind');r.units=[gate,.25];add(r);}\nfor(const distance of [257.999,258,258.001])for(const ifr of [0,1])for(const state of ['idle','charge']){const r=base('bossGrabWind');r.enemy.speed=0;r.player.x=10+distance;r.player.y=-5;r.player.iframes=ifr;r.player.s=state;add(r);}\nfor(const st of [60,59,50,10,9,.5,0,-.5,-10])for(const ifr of [0,.1,30])for(const mult of [.5,1,1.25]){const r=base('bossGrab',st);r.player.iframes=ifr;r.el_multiplier=mult;add(r);}\nfor(const st of [10,0,-10]){const r=base('bossGrab',st);r.owner_mutate=true;add(r);}\nfor(const si of [0,3])for(const st of [1,0,-1])for(const gate of [.499999,.5])for(const vfx of [false,true])for(const iframe of [0,75]){const r=base('bossDruidDive',st,si);r.units=[gate,.25,.75];r.context.vfx_available=vfx;r.enemy.iframes=iframe;add(r);}\nfor(const si of [0,3])for(const sp of [.5,1,2])for(const st of [45,44.5,22,1,0,-1])for(const max of [0,45,90]){const r=base('bossDruidUnder',st,si);r.sp=sp;r.enemy._underMax=max;r.context.vfx_available=st!==0;add(r);}\nfor(const st of [40,32.0001,32,31.5,1,0,-1])for(const hit of [false,true])for(const d of [163.999,164,164.001])for(const state of ['idle','charge'])for(const ifr of [0,1]){const r=base('bossDruidErupt',st);r.enemy._eruptHit=hit;r.player.x=r.enemy.x+d;r.player.y=r.enemy.y;r.player.s=state;r.player.iframes=ifr;r.context.vfx_available=st!==0;add(r);}\nfor(const parry of [false,true]){const r=base('bossDruidErupt',32,3);r.parry=parry;add(r);}\n// Genuine source sequence fixtures: st2 is decremented by the external clock only.\nfor(const sp of [.5,1,2]){\n let r=base('bossGrab',60);r.sp=sp;r.sequence='grab-'+sp;\n while(r.enemy.s==='bossGrab'){add(r);const end=rows.at(-1).expected;r.enemy=clone(end.enemy_after);r.player=clone(end.player_after);r.enemy.st2-=sp;}\n r=base('bossDruidDive',0,3);r.sp=sp;r.sequence='burrow-'+sp;\n for(let n=0;n<200;n++){add(r);const end=rows.at(-1).expected;r.enemy=clone(end.enemy_after);r.player=clone(end.player_after);if(r.enemy.s==='recover')break;r.enemy.st2-=sp;}\n}\nfunction intpaths(v,path=[],out=[]){if(typeof v==='number'&&Number.isInteger(v))out.push(path);else if(v&&typeof v==='object')for(const [k,x] of Object.entries(v))intpaths(x,[...path,k],out);return out;}\nfor(const r of rows)r.integer_paths=intpaths(r.expected);\nconst report={sha,source_ranges:[[40837,40867],[41047,41072]],cases:rows.length,rows,live_execution:false};\nfs.writeFileSync(arg('--out-json'),JSON.stringify(report),'utf8');\nconsole.log(JSON.stringify({cases:rows.length,source_sha:sha,live_execution:false}));\n"
var assertions: int=0
var failures: int=0
var units: Array=[]
var rng_index: int=0
var source_game: String=ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
var node_bin: String=""
var temp_root: String=""
var rows: Array=[]
var exact_paths: Dictionary={}
var case_name: String=""

func _initialize() -> void:
	for arg: String in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_game = ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
	call_deferred("_run")

func _run() -> void:
	var isolated: bool=ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR
	check(isolated,"exact isolated project and actual OS userdir")
	if not isolated: finish(2);return
	check(not source_game.is_empty() and FileAccess.get_sha256(source_game)==GAME_SHA256,"immutable snapshot source hash")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"explicit node path argument")
	if failures: finish(2);return
	temp_root=OS.get_user_data_dir().path_join("bc10-"+str(Time.get_ticks_usec()))
	check(DirAccess.make_dir_recursive_absolute(temp_root)==OK,"unique temporary UTF-8 oracle directory")
	var js_path: String=temp_root.path_join("oracle.cjs")
	var out_path: String=temp_root.path_join("oracle.json")
	var file: FileAccess=FileAccess.open(js_path,FileAccess.WRITE)
	check(file!=null,"temporary oracle writer")
	if file==null: finish(2);return
	file.store_string(ORACLE_JS);file.close()
	var output: Array=[]
	var code: int=OS.execute(node_bin,[js_path,"--source-game="+source_game,"--out-json="+out_path],output,true)
	# Transport payload is Node fs.writeFileSync(...,'utf8'), never output[0].
	var log_file: FileAccess=FileAccess.open(temp_root.path_join("node-output.utf8.txt"),FileAccess.WRITE)
	if log_file!=null: log_file.store_string("\n".join(output));log_file.close()
	check(code==0,"independent exact-source Node oracle exit zero")
	check(FileAccess.file_exists(out_path),"UTF-8 oracle payload exists")
	if code!=0 or not FileAccess.file_exists(out_path): finish(2);return
	var data: Variant=JSON.parse_string(FileAccess.get_file_as_string(out_path))
	check(data is Dictionary and data.get("sha")==GAME_SHA256 and data.get("live_execution")==false,"oracle source and non-live receipt")
	if not data is Dictionary or not data.get("rows") is Array: finish(2);return
	rows=data["rows"]
	check(rows.size()==1083 and data["cases"]==rows.size(),"source fixture case count")
	for i in rows.size():
		case_name=str(i)+":"+rows[i]["input"]["enemy"]["s"]
		_run_row(rows[i])
	case_name="guards_and_boundaries"
	_guards()
	case_name="receipt"
	var receipt: Dictionary=ControlPacket.source_receipt()
	check(receipt["game_sha256"]==GAME_SHA256,"receipt hash")
	for key in ["live_combat_connected","damage_or_parry_execution_verified","forced_player_writer_verified","iframe_immunity_verified","full_tick_complete"]:
		check(receipt[key]==false,"receipt never claims actual "+key)
	finish(0 if failures==0 else 1)

func _draw(_tag: String) -> Variant:
	var result: Variant=units[rng_index%units.size()]
	rng_index+=1
	return result

func _run_row(row: Dictionary) -> void:
	var input: Dictionary=row["input"]
	var enemy: Dictionary=input["enemy"].duplicate(true)
	var player: Dictionary=input["player"].duplicate(true)
	var before_enemy: Dictionary=enemy.duplicate(true)
	var before_player: Dictionary=player.duplicate(true)
	var context: Dictionary=input["context"].duplicate(true)
	var result: Dictionary=ControlPacket.begin_tick(int(input["si"]),enemy,input["sp"],player,context)
	check(result.get("status")=="READY","begin valid source snapshot")
	if result.get("status")!="READY": return
	units=input["units"];rng_index=0
	var events: Array=[]
	var commands: int=0
	var token: Dictionary=result["continuation"]
	var response: Variant=null
	for _n in 80:
		result=ControlPacket.next_tick(token,response,_draw)
		check(result.get("status")=="READY","continuation valid: "+str(result.get("reason","")))
		if result.get("status")!="READY": return
		check(result.get("full_tick_complete")==false,"switch fragment does not claim full tick")
		for event: Dictionary in result["events"]:
			if event["kind"]=="command": events.append(_normalize(event["value"],input))
			elif event["kind"]=="rng": events.append({"kind":"rng","unit":event["value"]["unit"],"source_line":event["value"]["source_line"]})
			else: events.append(event)
		if result["done"]: break
		check(result["command"]["executed"]==false,"command unexecuted")
		if commands>=row["expected"]["responses"].size(): check(false,"unexpected extra command");return
		response=row["expected"]["responses"][commands].duplicate(true)
		commands+=1;token=result["continuation"]
	check(result.get("done")==true,"bounded switch termination")
	check(commands==row["expected"]["responses"].size(),"exact authority/FX call count")
	check(rng_index==int(row["expected"]["rng_count"]),"exact source RNG draws")
	var actual: Dictionary={"enemy_after":result.get("enemy"),"player_after":result.get("player"),"events":events,"rng_count":rng_index}
	# Integer mask is captured in Node BEFORE Godot's JSON float parsing.
	exact_paths={}
	for path: Array in row["integer_paths"]: exact_paths[JSON.stringify(path)]=true
	var expected: Dictionary=row["expected"].duplicate(true)
	expected.erase("responses") # Readback fixtures are inputs, not implementation results.
	_compare(actual,expected,[])
	check(enemy==before_enemy and player==before_player and context==input["context"],"caller snapshots remain byte-shape immutable")

func _normalize(command: Dictionary, input: Dictionary) -> Dictionary:
	var name: String=command["command"]
	var args: Array=command["args"].duplicate(true)
	if name=="apply_boss_player_control":
		check(args[0]["writer_verified"]==false,"position and KB request is not live proof")
		args=args[0]["assignments"]
	elif name=="resolve_boss_grab_damage":
		var d: Dictionary=args[0]
		check(d["rounding"]=="ToInt32(atk*multiplier*elMul(e.el,ar().el))","grab truncation AFTER elemental multiplier")
		check(d["combat_verified"]==false,"damage request not actual damage")
		check(d["element"]==input["enemy"]["el"],"original element preserved")
		args=[_i32(d["atk"]*d["multiplier"]*input["el_multiplier"]),d["options"]]
	elif name=="resolve_boss_erupt_contact":
		var d: Dictionary=args[0]
		check(d["raw_damage"]==_i32(input["enemy"]["atk"]*2.2),"erupt raw truncation occurs BEFORE elMul")
		check(d["poison_add"]==4 and d["web_slow_min"]==90 and d["knockback_add"]==14,"source status/knockback recipe")
		check(d["parry_multiplier"]==4 and d["stunned"]==60 and d["poise"]==20,"protected parry recipe only")
		check(d["combat_verified"]==false,"erupt protected owner not executed")
		args=[]
	return {"kind":"command","command":name,"args":args,"source_line":command["source_line"]}

func _compare(actual: Variant, expected: Variant, path: Array) -> void:
	if expected is Dictionary:
		check(actual is Dictionary,"dictionary at "+str(path))
		if not actual is Dictionary: return
		check(actual.size()==expected.size(),"dictionary key count at "+str(path))
		for key in expected:
			check(actual.has(key),"key "+str(path)+"/"+key)
			if actual.has(key): _compare(actual[key],expected[key],path+[key])
	elif expected is Array:
		check(actual is Array and actual.size()==expected.size(),"array length at "+str(path))
		if actual is Array:
			for i in mini(actual.size(),expected.size()): _compare(actual[i],expected[i],path+[str(i)])
	elif (expected is int or expected is float) and (actual is int or actual is float):
		if exact_paths.has(JSON.stringify(path)): check(actual==expected,"exact source integer "+str(path)+" expected="+str(expected)+" actual="+str(actual))
		else: check(absf(float(actual)-float(expected))<=1e-10*maxf(1,absf(float(expected))),"source float "+str(path)+" expected="+str(expected)+" actual="+str(actual))
	else: check(actual==expected,"source literal "+str(path)+" expected="+str(expected)+" actual="+str(actual))

func _guards() -> void:
	var input: Dictionary=rows[0]["input"].duplicate(true)
	var e: Dictionary=input["enemy"]
	var p: Dictionary=input["player"]
	var c: Dictionary=input["context"]
	check(ControlPacket.begin_tick(4,e,1,p,c)["status"]=="NOT_READY","unsupported stage")
	var bad: Dictionary=e.duplicate(true);bad["s"]="idle"
	check(ControlPacket.begin_tick(0,bad,1,p,c)["status"]=="NOT_READY","no invented dispatch")
	bad=e.duplicate(true);bad.erase("speed")
	check(ControlPacket.begin_tick(0,bad,1,p,c)["status"]=="NOT_READY","missing speed not guessed")
	check(ControlPacket.begin_tick(0,e,NAN,p,c)["status"]=="NOT_READY","NaN clock rejected")
	check(ControlPacket.next_tick({})["status"]=="NOT_READY","malformed token")
	var began: Dictionary=ControlPacket.begin_tick(0,e,1,p,c)
	check(ControlPacket.next_tick(began["continuation"],{})["status"]=="NOT_READY","unsolicited response")
	units=[.75,.25];rng_index=0
	var move: Dictionary=ControlPacket.next_tick(began["continuation"],null,_draw)
	check(ControlPacket.next_tick(move["continuation"])["status"]=="NOT_READY","collision ack required")
	check(ControlPacket.next_tick(move["continuation"],{"ack":true,"value":1})["status"]=="NOT_READY","collision bool required")
	check(move["enemy"]["x"]==e["x"],"no movement before collision response")
	bad=e.duplicate(true);bad["s"]="bossGrab";bad["st2"]=0
	began=ControlPacket.begin_tick(0,bad,1,p,c)
	var control: Dictionary=ControlPacket.next_tick(began["continuation"])
	check(control["command"]["command"]=="apply_boss_player_control","forced position command precedes damage")
	check(control["player"]==p,"position remains unapplied before owner readback")
	for response in [{"ack":true},{"ack":true,"enemy_after":bad,"player_after":{}},{"ack":true,"enemy_after":{},"player_after":p}]:
		check(ControlPacket.next_tick(control["continuation"],response)["status"]=="NOT_READY","ack/partial owner data cannot advance")
	var partial: Dictionary=p.duplicate(true);partial["sentinel"]={}
	check(ControlPacket.next_tick(control["continuation"],{"ack":true,"enemy_after":bad,"player_after":partial})["status"]=="NOT_READY","nested snapshot completeness")
	for kind in ["bossDruidDive","bossDruidUnder","bossDruidErupt"]:
		bad=e.duplicate(true);bad["s"]=kind
		check(ControlPacket.begin_tick(0,bad,1,p,{})["status"]=="NOT_READY","explicit finale predicate reader")
		var finale: Dictionary=c.duplicate(true);finale["druid_finale"]=true
		check(ControlPacket.begin_tick(3,bad,1,p,finale)["status"]=="NOT_READY","finale outside scope")
		check(ControlPacket.begin_tick(1,bad,1,p,c)["status"]=="NOT_READY","no burrow added to si1")
		check(ControlPacket.begin_tick(2,bad,1,p,c)["status"]=="NOT_READY","no burrow added to si2")
	bad=e.duplicate(true);bad["s"]="bossDruidUnder";bad["_underMax"]="45"
	check(ControlPacket.begin_tick(0,bad,1,p,c)["status"]=="NOT_READY","unsupported JS coercion not guessed")
	# Repeat the SAME pending token: deterministic, caller token and input untouched.
	var before: Dictionary=control["continuation"].duplicate(true)
	check(ControlPacket.next_tick(control["continuation"])["status"]=="NOT_READY" and control["continuation"]==before,"invalid response consumes nothing")

func _i32(v: float) -> int:
	var n: float=fmod(floor(v) if v>=0 else ceil(v),4294967296.0)
	if n<0: n+=4294967296.0
	if n>=2147483648.0: n-=4294967296.0
	return int(n)
func check(ok: bool, label: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		if failures<=80: print("BC10_FAIL ",case_name," ",label)
func finish(code: int) -> void:
	print("BC10_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"source_cases":rows.size(),"skipped":[],"live_combat_verified":false,"temp_utf8":temp_root}))
	quit(code)
