extends SceneTree
## Exact source VM / UTF-8 file; no live owner calls. Fixture responses are not combat proof.
const Spiral = preload("res://scripts/native_ch2_boss_spiral_queue.gd")
const Start = preload("res://scripts/native_ch2_boss_new_start.gd")
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const USERDIR = "EXODUSER-bc2-08-Isolated-20261020"
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
		printerr("BC2_08_FAIL ",label," ",message)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"isolated actual path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game exact bytes required")
	if failures>0: finish();return
	var target: String=OS.get_user_data_dir().path_join("bc2-08-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array=[]
	var code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc2_08_source_oracle.cjs"),source_path,target]),output,true)
	check(code==0,"Node exit0: "+"".join(output).left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture required")
	if failures>0: finish();return
	var data: Variant=JSON.parse_string(FileAccess.get_file_as_string(target))
	check(data is Dictionary,"UTF-8 JSON decoded")
	if not data is Dictionary: finish();return
	check(data["source_only"] and data["game_sha256"]==HASH,"independent source receipt")
	summary=data["summary"]
	check(summary["cases"]==data["cases"].size(),"fixture inventory")
	check(Spiral.source_receipt()["ready"] and Spiral.source_receipt()["source_range"]==[37057,37057],"consumer ready / original range")
	for row: Dictionary in data["cases"]:
		label=row["name"]+" si"+str(row["si"])+" sp"+str(row["sp"])
		for entry: Dictionary in row["input_bits"]:
			var holder: Variant=row
			for i in range(entry["path"].size()-1): holder=holder[entry["path"][i]]
			holder[entry["path"][-1]]=entry["bits"].hex_decode().decode_double(0)
		var result: Dictionary=consume(row)
		check(result["status"]=="READY","source case READY")
		if result["status"]!="READY": continue
		check(result.get("done",false),"driver reached end")
		for key: String in ["queue","cursor"]: check(equivalent(result[key],row["expected"][key]),"source "+key)
		check(equivalent(result["all_events"],row["expected"]["events"]),"full clock/reset/spawn/compaction order")
		check(row["expected"]["draws"]==0 and row["expected"]["global_writes"]==0,"source consumer no direct RNG / G assignment")
		_draw(row["queue"],row["draw_before"])
		_draw(result["queue"],row["draw_after"])
	for row: Dictionary in data["draw_cases"]:
		for entry: Dictionary in row["input_bits"]:
			var holder: Variant=row
			for i in range(entry["path"].size()-1): holder=holder[entry["path"][i]]
			holder[entry["path"][-1]]=entry["bits"].hex_decode().decode_double(0)
		_draw(row["queue"],row["expected"])
	_initializers(data["initializers"])
	_boundaries()
	finish()
func consume(row: Dictionary) -> Dictionary:
	var before: Variant=row["queue"].duplicate(true) if row["queue"] is Dictionary else null
	var started: Dictionary=Spiral.begin_tick(int(row["si"]),row["queue"],row["sp"])
	check(started["status"]=="READY","begin READY")
	if started["status"]!="READY": return started
	var token: Dictionary=started["continuation"]
	var response: Variant=null
	var events: Array=[]
	var cursor: int=0
	var result: Dictionary={}
	for guard in range(512):
		var t_before: Dictionary=token.duplicate(true)
		result=Spiral.next_tick(token,response)
		check(equivalent(token,t_before),"caller continuation immutable")
		if result["status"]!="READY": return result
		check(result["full_tick_complete"]==false and result["rng_ledger"].is_empty(),"no complete updateE / consumer RNG")
		check(not result.has("enemy") and not result.has("player"),"no actor/player authority")
		events.append_array(result["events"])
		if result["done"]: break
		var cmd: Dictionary=result["command"]
		check(cmd["command"]=="spawnProj" and cmd["executed"]==false,"direct raw spawnProj request only")
		check(cmd["args"][0].get("_commit")==true and not cmd["args"][0].has("src") and not cmd["args"][0].has("_druidPoison"),"commit retained; no boss wrapper/postprocess")
		cursor+=int(row["nested"])
		response={"ack":true}
		token=result["continuation"]
	check(equivalent(row["queue"],before),"caller queue/entry/src snapshots immutable")
	result["all_events"]=events;result["cursor"]=cursor
	return result
func _draw(queue: Variant, expected: Dictionary) -> void:
	var before: Variant=queue.duplicate(true) if queue is Dictionary else null
	for repeated in range(2):
		var result: Dictionary=Spiral.draw_requests(9,queue,expected["label"])
		check(result["status"]=="READY","readonly draw READY")
		if result["status"]!="READY": return
		check(equivalent(result["commands"],expected["commands"]),"original G20107 draw boundary / radius / localized label")
		check(result["rng_ledger"].is_empty() and result["full_tick_complete"]==false,"no draw consumption / full update")
		check(equivalent(queue,before),"repeated draw cannot advance t/nextShot/queue/actor")
		check(expected["label_reads"]*2==result["commands"].size(),"label read only for eligible charge")
func _initializers(rows: Array) -> void:
	label="BC2-03 readonly initializer reuse / physical60+nextShot"
	for row: Dictionary in rows:
		var before: Dictionary=row["enemy"].duplicate(true)
		var started: Dictionary=Start.begin_start(int(row["si"]),"spiralBullet",row["enemy"],200,int(row["phase"]),0,row["context"])
		check(started["status"]=="READY","existing initializer READY")
		if started["status"]!="READY": continue
		var token: Dictionary=started["continuation"]
		var reply: Variant=null
		var draws: Array=[0]
		var unit: float=row["unit_bits"].hex_decode().decode_double(0)
		var payload: Dictionary={}
		for guard in range(10):
			var result: Dictionary=Start.next_start(token,reply,func(_tag: String) -> float: draws[0]+=1;return unit)
			check(result["status"]=="READY","existing initializer packet")
			if result["status"]!="READY" or result["done"]: break
			var cmd: Dictionary=result["command"]
			check(cmd["executed"]==false,"initializer queue/helper remains request")
			if cmd["command"]=="append_global_queue" and cmd["args"][0]=="_spiralBullets": payload=cmd["args"][1]
			token=result["continuation"];reply={"ack":true}
		check(draws[0]==1 and equivalent(row["enemy"],before),"exact initializer RNG/input immutable")
		check(equivalent(payload,row["queue_entry"]),"original initializer payload; no duplicate new factory")
		var result: Dictionary=Spiral.next_tick(Spiral.begin_tick(9,{"ids":["a"],"entries":{"a":payload}},1)["continuation"])
		check(result["done"] and result["command"]==null and result["queue"]["entries"]["a"]["t"]==1 and result["queue"]["entries"]["a"]["nextShot"]==60,"new consumer accepts old physical packet; no premature draw/request")
func _entry() -> Dictionary: return {"x":10,"y":20,"t":119,"windup":60,"maxT":240,"arms":3,"dir":1,"baseAng":.25,"dmg":55,"el":0,"col":"#bbbbbb","src":{"actor_ref":"boss"},"interval":6,"nextShot":1}
func _queue() -> Dictionary: return {"ids":["a"],"entries":{"a":_entry()}}
func _boundaries() -> void:
	label="queue / owner / cursor boundaries"
	for si in [-1,0,3,10,34]: check(Spiral.begin_tick(si,_queue(),1)["status"]=="NOT_READY","CH2 guard")
	for bad in [[],{}, {"ids":["a"],"entries":{}},{"ids":[1],"entries":{}}]: check(Spiral.begin_tick(9,bad,1)["status"]=="NOT_READY","snapshot schema")
	for key: String in ["t","arms","dmg","col","interval","nextShot"]:
		var q: Dictionary=_queue();q["entries"]["a"].erase(key);check(Spiral.begin_tick(9,q,1)["status"]=="NOT_READY","entry required field")
	for value in [INF,NAN,"3",65]:
		var q: Dictionary=_queue();q["entries"]["a"]["arms"]=value;check(Spiral.begin_tick(9,q,1)["status"]=="NOT_READY","finite bounded arms")
	for value in [INF,NAN]: check(Spiral.begin_tick(9,_queue(),value)["status"]=="NOT_READY","finite sp")
	var token: Dictionary=Spiral.begin_tick(9,_queue(),1)["continuation"]
	for key: String in ["owner","si","version","_chapter_catalog_path","_chapter_source_hash","_chapter_catalog","step","pending","index","arm"]:
		var bad: Dictionary=token.duplicate(true)
		match key:
			"si": bad[key]=3
			"version": bad[key]=2
			"_chapter_catalog": bad.erase(key)
			_: bad[key]="wrong"
		check(Spiral.next_tick(bad)["status"]=="NOT_READY","bad continuation "+key)
	for key: String in ["index","write_index","arm"]:
		var bad: Dictionary=token.duplicate(true);bad[key]=-1;check(Spiral.next_tick(bad)["status"]=="NOT_READY","negative cursor")
	var got: Dictionary=Spiral.next_tick(token)
	check(got["command"]["command"]=="spawnProj" and got["queue"]["entries"]["a"]["nextShot"]==6,"interval reset before first arm")
	for reply in [null,{}, {"ack":false},true]: check(Spiral.next_tick(got["continuation"],reply)["reason"]=="owner_ack_missing","no synthetic spawn ack")
	var broken: Dictionary=got["continuation"].duplicate(true);broken.erase("rotation")
	check(Spiral.next_tick(broken,{"ack":true})["reason"]=="spiral_queue_rotation_missing","cached rotation required")
	var draw_queue: Dictionary=_queue();draw_queue["entries"]["a"]["t"]=59
	check(Spiral.draw_requests(9,draw_queue)["reason"]=="localized_label_reader_missing","explicit localization reader")
	check(Spiral.draw_requests(9,null)["commands"].is_empty(),"absent draw never requests label")
	check(Spiral.next_tick({})["status"]=="NOT_READY","manufactured continuation")
func finish() -> void:
	print("BC2_08_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_summary":summary,"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
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
