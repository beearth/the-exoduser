extends SceneTree
## BC2-05: exact source VM -> self-owned UTF-8 fixture, no stdout data protocol.
const Rain = preload("res://scripts/native_ch2_boss_bean_rain.gd")
const USERDIR = "EXODUSER-bc2-05-Isolated-20261020"
const HASH = preload("res://source_snapshot/snapshot.gd").SHA256
var assertions := 0
var failures := 0
var label := "startup"
var source_path := ""
var node_bin := ""
var summary: Dictionary = {}
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_path = ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func check(ok: bool,message: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		printerr("BC2_05_FAIL ",label," ",message)
func restore_bits(target: Dictionary,bits: Dictionary) -> void:
	for key: String in bits: target[key]=bits[key].hex_decode().decode_double(0)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"isolated settings and actual path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game exact current bytes required")
	if failures>0: finish();return
	var target: String=OS.get_user_data_dir().path_join("bc2-05-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array=[]
	var code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc2_05_source_oracle.cjs"),source_path,target]),output,true)
	check(code==0,"Node exit0: "+"".join(output).left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture required")
	if failures>0: finish();return
	var data: Variant=JSON.parse_string(FileAccess.get_file_as_string(target))
	check(data is Dictionary,"UTF-8 JSON decoded")
	if not data is Dictionary: finish();return
	check(data["source_only"] and data["game_sha256"]==HASH,"independent source receipt")
	summary=data["summary"]
	check(summary["cases"]==data["cases"].size(),"fixture inventory")
	check(Rain.source_receipt()["ready"] and Rain.source_receipt()["states"]==["bossBeanRainWind","bossBeanRain"],"two owned states ready")
	for row: Dictionary in data["cases"]:
		label=row["name"]+" si"+str(row["si"])+" "+row["enemy"]["s"]+" phase"+str(row["enemy"]["_bossPhase"])+" brT"+str(row["enemy"]["_brT"])
		row["units"]=[]
		for bits: String in row["unit_bits"]: row["units"].append(bits.hex_decode().decode_double(0))
		for key: String in ["enemy","player","options"]: restore_bits(row[key],row["input_bits"][key])
		row["sp"]=row["input_bits"]["sp"].hex_decode().decode_double(0)
		var result: Dictionary=consume(row)
		check(result["status"]=="READY","source case READY")
		if result["status"]!="READY": continue
		check(result.get("done",false),"driver reached end")
		for key: String in ["enemy","player","globals","cursor"]: check(equivalent(result[key],row["expected"][key]),"source "+key)
		check(equivalent(result["all_events"],row["expected"]["events"]),"full source write/RNG/projectile/collision order")
	_boundaries()
	finish()
func consume(row: Dictionary) -> Dictionary:
	var before: Dictionary=row["enemy"].duplicate(true)
	var p_before: Dictionary=row["player"].duplicate(true)
	var started: Dictionary=Rain.begin_tick(int(row["si"]),row["enemy"],row["sp"],row["player"],row["options"])
	check(started["status"]=="READY","begin READY")
	if started["status"]!="READY": return started
	var token: Dictionary=started["continuation"]
	var response: Variant=null
	var events: Array=[]
	var cursor: Array=[0]
	var result: Dictionary={}
	var globals: Dictionary={"shake":71}
	for guard in range(20):
		var t_before: Dictionary=token.duplicate(true)
		result=Rain.next_tick(token,response,func(_tag: String) -> Variant:
			var u: Variant=row["units"][cursor[0]%row["units"].size()];cursor[0]+=1;return u)
		check(equivalent(token,t_before),"caller token immutable")
		if result["status"]!="READY": return result
		check(result["full_tick_complete"]==false,"not complete updateE")
		events.append_array(result["events"])
		for event: Dictionary in result["events"]:
			if event["kind"]=="global_write": globals[event["field"]]=event["value"]
		if result["done"]: break
		var cmd: Dictionary=result["command"]
		check(cmd["executed"]==false,"request remains unexecuted")
		response={"ack":true} # Fixture only, no real spawn/parry/damage.
		if cmd["command"]=="canMv": response["value"]=row["collision"]
		else:
			if cmd["command"]=="_spawnBossProjectile":
				check(cmd.get("actor_ref")=="boss" and cmd.get("source_undefined_fields") is Array,"explicit raw source props protocol")
				for field: String in cmd.get("source_undefined_fields",[]): check(not cmd["args"][0].has(field),"source undefined transported separately "+field)
			cursor[0]+=int(row["nested"])
		token=result["continuation"]
	check(equivalent(row["enemy"],before) and equivalent(row["player"],p_before),"input snapshots immutable")
	result["all_events"]=events;result["globals"]=globals;result["cursor"]=cursor[0]
	return result
func _enemy(state: String="bossBeanRain") -> Dictionary:
	return {"s":state,"st2":0,"x":10,"y":20,"r":44,"facing":0,"speed":1.25,"atk":46,"el":0,"col":"#abcdef","_bossPhase":0,"_brT":4,"_brDur":137.5}
func _player() -> Dictionary: return {"x":100,"y":200,"r":12,"iframes":0,"s":"idle"}
func _boundaries() -> void:
	label="input / RNG / owner / collision boundaries"
	for si in [-1,0,3,10,34]: check(Rain.begin_tick(si,_enemy(),1,_player(),{"shake":100})["status"]=="NOT_READY","CH2 stage guard")
	check(Rain.begin_tick(4,_enemy("bossVortex"),1,_player(),{"shake":100})["status"]=="NOT_READY","other state owner")
	for key: String in ["_brT","_brDur","speed","_bossPhase","col"]:
		var e: Dictionary=_enemy();e.erase(key);check(Rain.begin_tick(4,e,1,_player(),{"shake":100})["status"]=="NOT_READY","required actor field "+key)
	for phase in [-1,5,INF,NAN]:
		var e: Dictionary=_enemy();e["_bossPhase"]=phase;check(Rain.begin_tick(4,e,1,_player(),{"shake":100})["status"]=="NOT_READY","owned phase range")
	check(Rain.begin_tick(4,_enemy(),1,_player())["reason"]=="option_reader_missing","explicit active options")
	var wind: Dictionary=Rain.begin_tick(4,_enemy("bossBeanRainWind"),1,_player())["continuation"]
	check(Rain.next_tick(wind)["reason"]=="rng_provider_missing","missing wind RNG")
	for unit in [-.1,1.0,null,"0.5",INF,NAN]: check(Rain.next_tick(wind,null,func(_tag: String) -> Variant: return unit)["status"]=="NOT_READY","invalid wind RNG")
	var transitioned: Dictionary=Rain.next_tick(wind,null,func(_tag: String) -> Variant: return 0.0)
	check(transitioned["enemy"]["st2"]==137.5 and transitioned["enemy"]["s"]=="bossBeanRain","wind reads duration; no extra clock decrement")
	var token: Dictionary=Rain.begin_tick(4,_enemy(),1,_player(),{"shake":100})["continuation"]
	check(Rain.next_tick(token)["reason"]=="rng_provider_missing","active missing RNG")
	for bad_index in range(6):
		var counter: Array=[0];var t: Dictionary=token.duplicate(true);var reply: Variant=null;var got: Dictionary={}
		for guard in range(5):
			got=Rain.next_tick(t,reply,func(_tag: String) -> Variant:
				var u: float=1.0 if counter[0]==bad_index else 0.5;counter[0]+=1;return u)
			if got["status"]!="READY": break
			t=got["continuation"];reply={"ack":true}
		check(got["status"]=="NOT_READY" and got["enemy"]==null and got["command"]==null,"every firing RNG site rejects invalid input")
	var first: Dictionary=Rain.next_tick(token,null,func(_tag: String) -> Variant: return 0.5)
	check(first["command"]["command"]=="_spawnBossProjectile","raw projectile boundary")
	for reply in [null,{}, {"ack":false},true]: check(Rain.next_tick(first["continuation"],reply)["reason"]=="owner_ack_missing","no synthetic spawn ack")
	var nofire: Dictionary=_enemy();nofire["_brT"]=0
	var move: Dictionary=Rain.next_tick(Rain.begin_tick(4,nofire,1,_player(),{"shake":100})["continuation"])
	check(move["command"]["command"]=="canMv" and move["enemy"]["_brT"]==1,"no firing RNG on closed gate")
	check(Rain.next_tick(move["continuation"],{"ack":true})["reason"]=="collision_result_missing","collision bool required")
	for key: String in ["owner","si","version","_chapter_catalog_path","_chapter_source_hash","_chapter_catalog","step","pending","index"]:
		var bad: Dictionary=token.duplicate(true)
		match key:
			"si": bad[key]=3
			"version": bad[key]=2
			"_chapter_catalog": bad.erase(key)
			_: bad[key]="wrong"
		check(Rain.next_tick(bad)["status"]=="NOT_READY","bad token "+key)
	check(Rain.next_tick({})["status"]=="NOT_READY","manufactured continuation rejected")
func finish() -> void:
	print("BC2_05_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_summary":summary,"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
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
