extends SceneTree
## Exact source VM / UTF-8 file; no live owner calls. Fixture responses are not combat proof.
const Bash = preload("res://scripts/native_ch2_boss_shield_bash.gd")
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const USERDIR = "EXODUSER-bc2-07-Isolated-20261020"
const HASH = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
var assertions := 0
var failures := 0
var label := "startup"
var source_path := ""
var node_bin := ""
var summary: Dictionary = {}
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_path=arg.trim_prefix("--source-game=")
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func check(ok: bool,message: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		printerr("BC2_07_FAIL ",label," ",message)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"isolated actual path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game exact bytes required")
	if failures>0: finish();return
	var target: String=OS.get_user_data_dir().path_join("bc2-07-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array=[]
	var code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc2_07_source_oracle.cjs"),source_path,target]),output,true)
	check(code==0,"Node exit0: "+"".join(output).left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture required")
	if failures>0: finish();return
	var data: Variant=JSON.parse_string(FileAccess.get_file_as_string(target))
	check(data is Dictionary,"UTF-8 JSON decoded")
	if not data is Dictionary: finish();return
	check(data["source_only"] and data["game_sha256"]==HASH,"independent source receipt")
	summary=data["summary"]
	check(summary["cases"]==data["cases"].size(),"fixture inventory")
	check(Bash.source_receipt()["ready"] and Bash.source_receipt()["states"]==["bossSBashWind","bossSBash"],"two owned states ready")
	for row: Dictionary in data["cases"]:
		label=row["name"]+" si"+str(row["si"])+" t"+str(row["enemy"]["st2"])
		for entry: Dictionary in row["input_bits"]:
			var holder: Variant=row
			for i in range(entry["path"].size()-1): holder=holder[entry["path"][i]]
			holder[entry["path"][-1]]=entry["bits"].hex_decode().decode_double(0)
		var result: Dictionary=consume(row)
		check(result["status"]=="READY","source case READY")
		if result["status"]!="READY": continue
		check(result.get("done",false),"driver reached end")
		for key: String in ["enemy","player","cursor"]: check(equivalent(result[key],row["expected"][key]),"source "+key)
		check(equivalent(result["all_events"],row["expected"]["events"]),"full source writes/collision/contact/helper order")
	_boundaries()
	finish()
func consume(row: Dictionary) -> Dictionary:
	var before: Dictionary=row["enemy"].duplicate(true)
	var pb: Dictionary=row["player"].duplicate(true)
	var started: Dictionary=Bash.begin_tick(int(row["si"]),row["enemy"],row["sp"],row["player"])
	check(started["status"]=="READY","begin READY")
	if started["status"]!="READY": return started
	var token: Dictionary=started["continuation"]
	var response: Variant=null
	var events: Array=[]
	var cursor: int=0
	var result: Dictionary={}
	var contacts: int=0
	var collision_reads: int=0
	for guard in range(5):
		var t_before: Dictionary=token.duplicate(true)
		result=Bash.next_tick(token,response)
		check(equivalent(token,t_before),"caller token immutable")
		if result["status"]!="READY": return result
		check(result["full_tick_complete"]==false and result["rng_ledger"].is_empty(),"not complete updateE; no direct switch RNG")
		var normalized: Array=result["events"].duplicate(true)
		for event: Dictionary in normalized:
			if event["kind"]=="command" and event["value"]["command"]=="resolve_shield_bash_contact": event["value"]["args"]=[]
		events.append_array(normalized)
		if result["done"]: break
		var cmd: Dictionary=result["command"]
		check(cmd["executed"]==false,"request unexecuted")
		response={"ack":true}
		if cmd["command"]=="resolve_shield_bash_contact":
			check(contacts<row["responses"].size(),"source contact response exists")
			if contacts>=row["responses"].size(): return {"status":"NOT_READY"}
			var a: Dictionary=row["responses"][contacts]
			verify_contact(cmd,a)
			response["enemy_after"]=a["enemy_after"];response["player_after"]=a["player_after"]
			cursor=int(a["cursor_after"]);contacts+=1
		elif cmd["command"]=="canMv":
			response["value"]=row["owner"].get("collision",true);collision_reads+=1
			check(collision_reads==1,"exactly one XY collision; no fallback")
		else: cursor+=int(row["nested"])
		token=result["continuation"]
	check(contacts==row["responses"].size(),"all original contacts consumed")
	check(equivalent(row["enemy"],before) and equivalent(row["player"],pb),"all caller snapshots immutable")
	result["all_events"]=events;result["cursor"]=cursor
	return result
func verify_contact(cmd: Dictionary,a: Dictionary) -> void:
	var d: Dictionary=cmd["args"][0]
	var e: Dictionary=a["enemy_before"]
	var p: Dictionary=a["player_before"]
	check(d.size()==10 and d["family"]=="shield_bash_2" and d["source_lines"]==[41344,41348] and d["actor_ref"]=="boss" and d["combat_verified"]==false,"protected descriptor envelope")
	check(d["requires"]==["isPWin","hurtP","boss_hurtE","doParry","poise_owner"],"shared protected owners")
	check(d["charge_rule"]=="isPWin first; otherwise charge skips damage/KB/stun but contact recovers30","parry before charge exclusion")
	var f: Dictionary=d["hurtP_formula"]
	check(f["atk"]==e["atk"] and f["element"]==e["el"] and f["multiplier"]==1.8 and f["elemental_provider"]=="elMul(e.el,ar().el)" and f["rounding"]=="ToInt32_after_elemental","raw damage recipe; no early truncation")
	var parry: Dictionary=d["parry_formula"]
	check(parry["multiplier"]==3 and parry["stunned"]==60 and parry["poise"]==25 and equivalent(parry["angle"],e["_sbAng"]+PI) and parry["formula"]=="ToInt32((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))*multiplier*pParryDmg())","reused parry recipe with locked angle/poise25")
	check(d["knockback"]==10,"player KB recipe magnitude")
	var stun: Dictionary=d["stun_formula"]
	check(stun.size()==4 and stun["base"]==45 and stun["resistance_cap"]==.5 and stun["resistance_provider"]=="_eqAffix('stunRes')" and stun["formula"]=="max(P.stunned||0,ToInt32(45*(1-min(.5,_eqAffix('stunRes')))))","protected stunRes recipe")
	var trace: Array=a["trace"]
	if a["parry"]:
		check(trace.map(func(t: Dictionary) -> String: return t["command"])==["wp","wp","enhMulAtk","pParryDmg","hurtE","doParry","_poiseHit"],"original parry helper order, including charge+parry")
		var damage: int=Common._i32((p["baseAtk"]+trace[0]["value"]["atk"]+trace[2]["value"])*parry["multiplier"]*trace[3]["value"])
		check(trace[4]["args"][0]==damage and equivalent(trace[4]["args"][1],parry["angle"]) and a["stunned_at_hurtE"]==parry["stunned"] and equivalent(trace[6]["args"],[parry["poise"]]),"raw source parry formula/stun/poise")
		check(a["bank_at_doParry"]==_or_zero(p.get("parryBank"))+damage,"raw source bank fallback/addition")
		var after: Dictionary=a["doParry_enemy"]
		check(equivalent(trace[5]["args"],[after["atk"],after["x"],after["y"],false,after["el"]]),"doParry fresh reads after hurtE owner")
	elif p["s"]=="charge":
		check(trace.is_empty() and equivalent(a["player_after"],p) and equivalent(a["enemy_after"],e),"charge skips protected effects but still contact termination")
	else:
		check(trace.map(func(t: Dictionary) -> String: return t["command"])==["elMul","hurtP","_eqAffix"] and equivalent(trace[0]["args"],[f["element"],3]),"original damage then stunRes helper order")
		check(equivalent(trace[1]["args"],[Common._i32(f["atk"]*f["multiplier"]*trace[0]["value"])]),"actual source ToInt32 AFTER element; no options")
		var post: Dictionary=a["hurtP_after"]
		var angle: float=atan2(post["player"]["y"]-post["enemy"]["y"],post["player"]["x"]-post["enemy"]["x"])
		check(equivalent(a["player_after"]["kb"],{"x":post["player"]["kb"]["x"]+cos(angle)*d["knockback"],"y":post["player"]["kb"]["y"]+sin(angle)*d["knockback"]}),"source post-hurtP additive KB10")
		check(trace[2]["args"]==["stunRes"] and a["player_after"]["stunned"]==maxf(_or_zero(post["player"].get("stunned")),Common._i32(stun["base"]*(1-minf(stun["resistance_cap"],trace[2]["value"])))),"source stun cap/truncation/max; no lower resistance clamp")
func _or_zero(value: Variant) -> float: return 0 if value==null else float(value)
func _enemy(state: String="bossSBash") -> Dictionary: return {"s":state,"st2":0,"x":0,"y":0,"r":44,"facing":1.75,"atk":46,"el":0,"_sbAng":0}
func _player() -> Dictionary: return {"x":50,"y":0,"r":12,"iframes":0,"s":"idle","kb":{"x":0,"y":0}}
func _boundaries() -> void:
	label="input / collision / owner boundaries"
	for si in [-1,0,3,10,34]: check(Bash.begin_tick(si,_enemy(),1,_player())["status"]=="NOT_READY","CH2 guard")
	check(Bash.begin_tick(8,_enemy("bossFanWaveAim"),1,_player())["status"]=="NOT_READY","other state owner")
	for key: String in ["_sbAng","x","atk"]:
		var e: Dictionary=_enemy();e.erase(key);check(Bash.begin_tick(8,e,1,_player())["status"]=="NOT_READY","required actor field")
	for value in [INF,NAN,"0",null]:
		var e: Dictionary=_enemy();e["_sbAng"]=value;check(Bash.begin_tick(8,e,1,_player())["status"]=="NOT_READY","numeric locked angle")
	for value in [INF,NAN]: check(Bash.begin_tick(8,_enemy(),value,_player())["status"]=="NOT_READY","finite speed clock")
	var p: Dictionary=_player();p.erase("kb");check(Bash.begin_tick(8,_enemy(),1,p)["status"]=="NOT_READY","full KB snapshot")
	var token: Dictionary=Bash.begin_tick(8,_enemy(),1,_player())["continuation"]
	for key: String in ["owner","si","version","kind","_chapter_catalog_path","_chapter_source_hash","_chapter_catalog","step","pending"]:
		var bad: Dictionary=token.duplicate(true)
		match key:
			"si": bad[key]=3
			"version": bad[key]=2
			"_chapter_catalog": bad.erase(key)
			_: bad[key]="wrong"
		check(Bash.next_tick(bad)["status"]=="NOT_READY","bad token "+key)
	var got: Dictionary=Bash.next_tick(token)
	check(got["command"]["command"]=="canMv","move before contact")
	for reply in [null,{}, {"ack":false},true]: check(Bash.next_tick(got["continuation"],reply)["reason"]=="owner_ack_missing","explicit ack")
	for value in [null,0,1,"true"]: check(Bash.next_tick(got["continuation"],{"ack":true,"value":value})["reason"]=="collision_result_missing","collision bool")
	got=Bash.next_tick(got["continuation"],{"ack":true,"value":false})
	check(got["command"]["command"]=="resolve_shield_bash_contact" and got["enemy"]["x"]==0,"blocked move still checks contact")
	for reply in [{"ack":true},{"ack":true,"enemy_after":_enemy()},{"ack":true,"enemy_after":{},"player_after":_player()}]: check(Bash.next_tick(got["continuation"],reply)["reason"]=="protected_contact_readback_missing","complete owner readback")
	var owner: Dictionary=_enemy();owner["s"]="ownerChanged";owner["st2"]=-1
	got=Bash.next_tick(got["continuation"],{"ack":true,"enemy_after":owner,"player_after":_player()})
	check(got["done"] and got["enemy"]["s"]=="recover" and got["enemy"]["st2"]==30,"contact takes priority over expired owner timer")
	var wind: Dictionary=Bash.next_tick(Bash.begin_tick(8,_enemy("bossSBashWind"),2,_player())["continuation"])
	check(wind["command"]["command"]=="SFX.block" and wind["enemy"]["s"]=="bossSBash" and wind["enemy"]["st2"]==18,"wind fixed18; no same-tick dash or extra clock decrement")
	check(Bash.next_tick({})["status"]=="NOT_READY","manufactured continuation")
func finish() -> void:
	print("BC2_07_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_summary":summary,"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
	quit(0 if failures==0 else 1)

func equivalent(a: Variant,b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):
		if is_nan(float(a)) and is_nan(float(b)): return true
		return absf(float(a)-float(b))<=1e-12*maxf(1.0,absf(float(b)))
	if a is Dictionary and b is Dictionary:
		if a.size()!=b.size(): return false
		for key in b:
			if not a.has(key) or not equivalent(a[key],b[key]): return false
		return true
	if a is Array and b is Array:
		if a.size()!=b.size(): return false
		for i in range(a.size()):
			if not equivalent(a[i],b[i]): return false
		return true
	return a==b
