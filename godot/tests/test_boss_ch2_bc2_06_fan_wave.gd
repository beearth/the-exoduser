extends SceneTree
## Exact source VM / UTF-8 file; no live owner calls. Fixture responses are not combat proof.
const Wave = preload("res://scripts/native_ch2_boss_fan_wave.gd")
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const USERDIR = "EXODUSER-bc2-06-Isolated-20261020"
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
		printerr("BC2_06_FAIL ",label," ",message)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"isolated actual path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game exact bytes required")
	if failures>0: finish();return
	var target: String=OS.get_user_data_dir().path_join("bc2-06-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array=[]
	var code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc2_06_source_oracle.cjs"),source_path,target]),output,true)
	check(code==0,"Node exit0: "+"".join(output).left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture required")
	if failures>0: finish();return
	var data: Variant=JSON.parse_string(FileAccess.get_file_as_string(target))
	check(data is Dictionary,"UTF-8 JSON decoded")
	if not data is Dictionary: finish();return
	check(data["source_only"] and data["game_sha256"]==HASH,"independent source receipt")
	summary=data["summary"]
	check(summary["cases"]==data["cases"].size(),"fixture inventory")
	check(Wave.source_receipt()["ready"] and Wave.source_receipt()["states"]==["bossFanWaveAim"],"one owned state ready")
	for row: Dictionary in data["cases"]:
		label=row["name"]+" si"+str(row["si"])+" t"+str(row["enemy"]["st2"])
		row["units"]=[]
		for bits: String in row["unit_bits"]: row["units"].append(bits.hex_decode().decode_double(0))
		for entry: Dictionary in row["input_bits"]:
			var holder: Variant=row
			for i in range(entry["path"].size()-1): holder=holder[entry["path"][i]]
			holder[entry["path"][-1]]=entry["bits"].hex_decode().decode_double(0)
		var result: Dictionary=consume(row)
		check(result["status"]=="READY","source case READY")
		if result["status"]!="READY": continue
		check(result.get("done",false),"driver reached end")
		for key: String in ["enemy","player","query_entities","cursor"]: check(equivalent(result[key],row["expected"][key]),"source "+key)
		check(equivalent(result["all_events"],row["expected"]["events"]),"full source write/RNG/query/helper order")
	_boundaries()
	finish()
func consume(row: Dictionary) -> Dictionary:
	var before: Dictionary=row["enemy"].duplicate(true)
	var pb: Dictionary=row["player"].duplicate(true)
	var qb: Dictionary=row["query"].duplicate(true)
	var started: Dictionary=Wave.begin_tick(int(row["si"]),row["enemy"],row["sp"],row["player"])
	check(started["status"]=="READY","begin READY")
	if started["status"]!="READY": return started
	var token: Dictionary=started["continuation"]
	var response: Variant=null
	var events: Array=[]
	var cursor: Array=[0]
	var result: Dictionary={}
	var contacts: int=0
	for guard in range(40):
		var t_before: Dictionary=token.duplicate(true)
		result=Wave.next_tick(token,response,func(_tag: String) -> Variant:
			var unit: Variant=row["units"][cursor[0]%row["units"].size()];cursor[0]+=1;return unit)
		check(equivalent(token,t_before),"caller token immutable")
		if result["status"]!="READY": return result
		check(result["full_tick_complete"]==false,"not complete updateE")
		var normalized: Array=result["events"].duplicate(true)
		for event: Dictionary in normalized:
			if event["kind"]=="command" and event["value"]["command"]=="resolve_fan_wave_contact": event["value"]["args"]=[]
		events.append_array(normalized)
		if result["done"]: break
		var cmd: Dictionary=result["command"]
		check(cmd["executed"]==false,"request unexecuted")
		response={"ack":true}
		if cmd["command"]=="resolve_fan_wave_contact":
			check(contacts<row["responses"].size(),"source contact response exists")
			if contacts>=row["responses"].size(): return {"status":"NOT_READY"}
			var authority: Dictionary=row["responses"][contacts]
			verify_contact(cmd,authority)
			response["enemy_after"]=authority["enemy_after"];response["player_after"]=authority["player_after"]
			cursor[0]=int(authority["cursor_after"]);contacts+=1
		elif cmd["command"]=="shQuery":
			response["ids"]=row["query"]["ids"];response["entities"]=row["query"]["entities"]
		else: cursor[0]+=int(row["nested"])
		token=result["continuation"]
	check(contacts==row["responses"].size(),"all original contacts consumed")
	check(equivalent(row["enemy"],before) and equivalent(row["player"],pb) and equivalent(row["query"],qb),"all caller snapshots immutable")
	result["all_events"]=events;result["cursor"]=cursor[0]
	return result
func verify_contact(cmd: Dictionary,a: Dictionary) -> void:
	var d: Dictionary=cmd["args"][0]
	var e: Dictionary=a["enemy_before"]
	check(equivalent(d.keys().size(),7) and d["source_lines"]==[40586,40589] and d["actor_ref"]=="boss" and d["combat_verified"]==false,"protected descriptor envelope")
	check(d["requires"]==["isPWin","hurtP","boss_hurtE","doParry","poise_owner"],"shared protected owners")
	var f: Dictionary=d["hurtP_formula"]
	check(f["element"]==e["el"] and f["elemental_provider"]=="elMul(e.el,ar().el)" and f["rounding"]=="ToInt32_before_and_after_elemental" and f["raw_damage"]==Common._i32(e["atk"]*2.5),"raw ToInt32 before element")
	var parry: Dictionary=d["parry_formula"]
	check(parry["multiplier"]==3 and parry["stunned"]==60 and parry["poise"]==20 and equivalent(parry["angle"],e["facing"]+PI) and parry["formula"]=="ToInt32((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))*multiplier*pParryDmg())","reused CH1 parry recipe")
	check(d["knockback"]==15,"player KB recipe magnitude")
	var trace: Array=a["trace"]
	if a["parry"]:
		check(trace.map(func(t: Dictionary) -> String: return t["command"])==["wp","wp","enhMulAtk","pParryDmg","hurtE","doParry","_poiseHit"],"original parry helper order")
		var damage: int=Common._i32((a["player_before"]["baseAtk"]+trace[0]["value"]["atk"]+trace[2]["value"])*parry["multiplier"]*trace[3]["value"])
		check(trace[4]["args"][0]==damage and equivalent(trace[4]["args"][1],parry["angle"]) and a["stunned_at_hurtE"]==parry["stunned"] and equivalent(trace[6]["args"],[parry["poise"]]),"raw source parry formula/stun/poise")
		check(a["bank_at_doParry"]==a["player_before"].get("parryBank",0)+damage,"raw source bank addition")
	else:
		check(trace.map(func(t: Dictionary) -> String: return t["command"])==["elMul","hurtP"] and equivalent(trace[0]["args"],[f["element"],3]),"original damage order and element args")
		check(equivalent(trace[1]["args"],[Common._i32(f["raw_damage"]*trace[0]["value"])]),"actual source double truncation; no options argument")
		var post: Dictionary=a["hurtP_after"]
		var angle: float=atan2(post["player"]["y"]-post["enemy"]["y"],post["player"]["x"]-post["enemy"]["x"])
		check(equivalent(a["player_after"]["kb"],{"x":post["player"]["kb"]["x"]+cos(angle)*d["knockback"],"y":post["player"]["kb"]["y"]+sin(angle)*d["knockback"]}),"source KB uses post-hurtP position and adds 15")
func _enemy() -> Dictionary: return {"s":"bossFanWaveAim","st2":0,"x":0,"y":0,"r":44,"facing":0,"atk":46,"el":0,"_fwAng":0,"_fwR":500}
func _player() -> Dictionary: return {"x":100,"y":0,"r":12,"iframes":0,"s":"idle","kb":{"x":0,"y":0}}
func _boundaries() -> void:
	label="input / RNG / owner / query boundaries"
	for si in [-1,0,3,10,34]: check(Wave.begin_tick(si,_enemy(),1,_player())["status"]=="NOT_READY","CH2 guard")
	var e: Dictionary=_enemy();e["s"]="bossBeanRain"
	check(Wave.begin_tick(6,e,1,_player())["status"]=="NOT_READY","other owner rejected")
	for key: String in ["_fwAng","x","atk"]:
		e=_enemy();e.erase(key);check(Wave.begin_tick(6,e,1,_player())["status"]=="NOT_READY","required field "+key)
	for angle in [INF,NAN,PI*129]:
		e=_enemy();e["_fwAng"]=angle;check(Wave.begin_tick(6,e,1,_player())["status"]=="NOT_READY","nonfinite / unsupported huge angle")
	var p: Dictionary=_player();p.erase("kb");check(Wave.begin_tick(6,_enemy(),1,p)["status"]=="NOT_READY","player KB snapshot")
	var token: Dictionary=Wave.begin_tick(6,_enemy(),1,_player())["continuation"]
	check(Wave.next_tick(token)["reason"]=="rng_provider_missing","explicit RNG")
	for unit in [-.1,1.0,null,".5",INF,NAN]: check(Wave.next_tick(token,null,func(_tag: String) -> Variant: return unit)["status"]=="NOT_READY","invalid RNG")
	for key: String in ["owner","si","version","_chapter_catalog_path","_chapter_source_hash","_chapter_catalog","step","pending","index","query_ids","query_entities"]:
		var bad: Dictionary=token.duplicate(true)
		match key:
			"si": bad[key]=3
			"version": bad[key]=2
			"_chapter_catalog": bad.erase(key)
			_: bad[key]="wrong"
		check(Wave.next_tick(bad)["status"]=="NOT_READY","bad token "+key)
	var got: Dictionary=Wave.next_tick(token,null,func(_tag: String) -> Variant: return 0.0)
	check(got["command"]["command"]=="SFX.detonate","wind gate consumed before firing")
	for reply in [null,{}, {"ack":false},true]: check(Wave.next_tick(got["continuation"],reply)["reason"]=="owner_ack_missing","explicit ack")
	got=Wave.next_tick(got["continuation"],{"ack":true})
	got=Wave.next_tick(got["continuation"],{"ack":true})
	check(got["command"]["command"]=="resolve_fan_wave_contact","contact boundary")
	for reply in [{"ack":true},{"ack":true,"enemy_after":_enemy()},{"ack":true,"enemy_after":{},"player_after":_player()}]: check(Wave.next_tick(got["continuation"],reply)["reason"]=="protected_contact_readback_missing","complete owner readback required")
	got=Wave.next_tick(got["continuation"],{"ack":true,"enemy_after":_enemy(),"player_after":_player()})
	check(got["command"]["command"]=="shQuery","query after contact")
	for reply in [{"ack":true},{"ack":true,"ids":["x"],"entities":{}},{"ack":true,"ids":[1],"entities":{}},{"ack":true,"ids":["x"],"entities":{"x":{}}}]: check(Wave.next_tick(got["continuation"],reply)["reason"]=="ordered_query_snapshot_missing","explicit ordered snapshot")
	for site in range(3):
		var draws: Array=[0];var t: Dictionary=token.duplicate(true);t["step"]="particles";t["width"]=PI*.5;t["radius"]=500;t["index"]=0
		var invalid: Dictionary=Wave.next_tick(t,null,func(_tag: String) -> Variant:
			var value: float=1.0 if draws[0]==site else .5;draws[0]+=1;return value)
		check(invalid["status"]=="NOT_READY" and invalid["enemy"]==null and invalid["command"]==null,"every particle RNG rejects invalid without partial packet")
	check(Wave.next_tick({})["status"]=="NOT_READY","manufactured continuation")
func finish() -> void:
	print("BC2_06_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_summary":summary,"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
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
