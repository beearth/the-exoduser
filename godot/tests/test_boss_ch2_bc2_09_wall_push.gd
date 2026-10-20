extends SceneTree
## Exact source VM / UTF-8 file; no live owner calls. Fixture responses are not combat proof.
const Wall = preload("res://scripts/native_ch2_boss_wall_push.gd")
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const USERDIR = "EXODUSER-bc2-09-Isolated-20261020"
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
		printerr("BC2_09_FAIL ",label," ",message)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"isolated actual path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game exact bytes required")
	if failures>0: finish();return
	var target: String=OS.get_user_data_dir().path_join("bc2-09-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array=[]
	var code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc2_09_source_oracle.cjs"),source_path,target]),output,true)
	check(code==0,"Node exit0: "+"".join(output).left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture required")
	if failures>0: finish();return
	var data: Variant=JSON.parse_string(FileAccess.get_file_as_string(target))
	check(data is Dictionary,"UTF-8 JSON decoded")
	if not data is Dictionary: finish();return
	check(data["source_only"] and data["game_sha256"]==HASH,"independent source receipt")
	summary=data["summary"]
	check(summary["cases"]==data["cases"].size(),"fixture inventory")
	check(Wall.source_receipt()["ready"] and Wall.source_receipt()["source_range"]==[37077,37077],"consumer ready / original range")
	for row: Dictionary in data["cases"]:
		label=row["name"]
		for entry: Dictionary in row["input_bits"]:
			var holder: Variant=row
			for i in range(entry["path"].size()-1): holder=holder[entry["path"][i]]
			holder[entry["path"][-1]]=entry["bits"].hex_decode().decode_double(0)
		var result: Dictionary=consume(row)
		check(result["status"]=="READY","source case READY")
		if result["status"]!="READY": continue
		check(result.get("done",false),"driver end")
		for key: String in ["queue","player","cursor"]: check(equivalent(result[key],row["expected"][key]),"source "+key)
		check(equivalent(result["all_events"],row["expected"]["events"]),"exact move→hit→KB/SFX→trim source order")
	_boundaries()
	finish()
func consume(row: Dictionary) -> Dictionary:
	var qb: Variant=row["queue"].duplicate(true) if row["queue"] is Dictionary else null
	var pb: Dictionary=row["player"].duplicate(true)
	var start: Dictionary=Wall.begin_tick(int(row["si"]),row["queue"],row["sp"],row["player"])
	check(start["status"]=="READY","begin")
	if start["status"]!="READY": return start
	var token: Dictionary=start["continuation"]
	var reply: Variant=null
	var events: Array=[]
	var cursor: int=0
	var contacts: int=0
	var result: Dictionary={}
	for guard in range(32):
		var tb: Dictionary=token.duplicate(true)
		result=Wall.next_tick(token,reply)
		check(equivalent(token,tb),"caller token immutable")
		if result["status"]!="READY": return result
		check(not result["full_tick_complete"] and result["rng_ledger"].is_empty(),"not full update / no direct RNG")
		var normalized: Array=result["events"].duplicate(true)
		for event: Dictionary in normalized:
			if event["kind"]=="command" and event["value"]["command"]=="resolve_wall_push_damage": event["value"]["args"]=[]
		events.append_array(normalized)
		if result["done"]: break
		var cmd: Dictionary=result["command"]
		check(cmd["executed"]==false,"request unexecuted")
		reply={"ack":true}
		if cmd["command"]=="resolve_wall_push_damage":
			check(contacts<row["responses"].size(),"source owner response")
			if contacts>=row["responses"].size(): return {"status":"NOT_READY"}
			var a: Dictionary=row["responses"][contacts]
			var f: Dictionary=cmd["args"][0]
			check(f["elemental_provider"]=="elMul(wp2.el,ar().el)" and f["rounding"]=="ToInt32_after_elemental" and f["options_omitted"] and not f["charge_excluded"] and not f["combat_verified"],"protected descriptor")
			check(equivalent(a["element_read"]["args"],[f["element"],3]) and equivalent(a["resolved_damage"],[Common._i32(f["raw_damage"]*a["element_read"]["multiplier"])]),"actual source element/ToInt32/options")
			reply["entry_after"]=a["entry_after"];reply["player_after"]=a["player_after"]
			cursor=int(a["cursor_after"]);contacts+=1
		else: cursor+=int(row["nested"])
		token=result["continuation"]
	check(contacts==row["responses"].size(),"all source contacts")
	check(equivalent(row["queue"],qb) and equivalent(row["player"],pb),"all input snapshots immutable")
	result["all_events"]=events;result["cursor"]=cursor
	return result
func _queue() -> Dictionary:
	return {"ids":["a"],"entries":{"a":{"x":0,"y":0,"ang":0,"t":0,"maxT":60,"dist":0,"maxDist":2000,"w":1300,"spd":35,"dmg":55,"el":0,"hit":false}}}
func _player() -> Dictionary: return {"x":35,"y":0,"r":12,"iframes":0,"s":"charge","kb":{"x":2,"y":3}}
func _boundaries() -> void:
	label="schema / owner / token boundaries"
	for si in [-1,0,3,10,34]: check(Wall.begin_tick(si,_queue(),1,_player())["status"]=="NOT_READY","chapter guard")
	for q in [[],{}, {"ids":["x"],"entries":{}},{"ids":[1],"entries":{}}]: check(Wall.begin_tick(8,q,1,_player())["status"]=="NOT_READY","queue schema")
	for key: String in ["ang","w","hit","maxDist","dmg"]:
		var q: Dictionary=_queue();q["entries"]["a"].erase(key);check(Wall.begin_tick(8,q,1,_player())["status"]=="NOT_READY","required entry field")
	for sp in [INF,NAN]: check(Wall.begin_tick(8,_queue(),sp,_player())["status"]=="NOT_READY","finite sp")
	var token: Dictionary=Wall.begin_tick(8,_queue(),1,_player())["continuation"]
	for key: String in ["owner","version","si","_chapter_catalog","_chapter_catalog_path","_chapter_source_hash","step","pending","index"]:
		var bad: Dictionary=token.duplicate(true)
		match key:
			"version": bad[key]=2
			"si": bad[key]=3
			_: bad[key]="wrong"
		check(Wall.next_tick(bad)["status"]=="NOT_READY","bad token")
	var hit: Dictionary=Wall.next_tick(token)
	check(hit["command"]["command"]=="resolve_wall_push_damage" and hit["queue"]["entries"]["a"]["hit"],"charge contact writes hit before damage")
	for reply in [null,{}, {"ack":false},true]: check(Wall.next_tick(hit["continuation"],reply)["reason"]=="owner_ack_missing","explicit ack")
	for reply in [{"ack":true},{"ack":true,"entry_after":{}},{"ack":true,"entry_after":_queue()["entries"]["a"],"player_after":{}}]: check(Wall.next_tick(hit["continuation"],reply)["reason"]=="protected_damage_readback_missing","complete owner snapshots")
	check(Wall.next_tick({})["status"]=="NOT_READY","manufactured token")
func finish() -> void:
	print("BC2_09_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_summary":summary,"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
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
