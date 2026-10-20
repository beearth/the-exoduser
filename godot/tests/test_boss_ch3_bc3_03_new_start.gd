extends SceneTree
## BC3-03: actual source VM -> self-owned UTF-8 fixture -> Godot comparison.
const Start = preload("res://scripts/native_ch3_boss_new_start.gd")
const Bridge = preload("res://scripts/native_ch3_boss_catalog.gd")
const USERDIR = "EXODUSER-bc3-03-Isolated-20261020"
const HASH = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
var assertions := 0
var failures := 0
var label := "startup"
var source_path := ""
var node_bin := ""
var summary: Dictionary = {}
var language := "ko"
func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_path=arg.trim_prefix("--source-game=")
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func check(ok: bool,message: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		printerr("BC3_03_FAIL ",label," ",message)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"isolated settings and actual user path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game exact current bytes required")
	if failures>0: finish();return
	var target: String=OS.get_user_data_dir().path_join("bc3-03-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array=[]
	var exit_code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc3_03_source_oracle.cjs"),source_path,target]),output,true)
	check(exit_code==0,"Node oracle exit0: "+"".join(output).left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture required")
	if failures>0: finish();return
	var data: Variant=decode(JSON.parse_string(FileAccess.get_file_as_string(target)))
	check(data is Dictionary,"UTF-8 fixture decoded")
	if not data is Dictionary: finish();return
	check(data.get("source_only")==true and data.get("game_sha256")==HASH,"independent source receipt")
	summary=data["summary"]
	check(summary["ids"]==7 and summary["cases"]==data["cases"].size(),"case inventory")
	check(Start.source_receipt()["ready"] and Start.source_receipt()["start_ids"]==data["ids"],"seven owned starts")
	check(Start.source_receipt()["state_cases"]==4 and Start.source_receipt()["queue_cases"]==3,"four state families / three queues")
	seed(3032026)
	var next_random: int=randi()
	seed(3032026)
	for row: Dictionary in data["cases"]:
		label=row["name"]+" si"+str(row["si"])+" "+row["id"]+" phase"+str(row["phase"])
		var units: Array=row["units"]
		language=row["context"].get("lang","ko")
		var result: Dictionary=consume_start(int(row["si"]),row["id"],row["enemy"],row["d"],int(row["phase"]),row["extra"],row["context"],units,row["collision"],row["safe"],row["initial_queues"],int(row["nested"]))
		check(result["status"]=="READY","start READY")
		if result["status"]!="READY": continue
		check(result.get("done",false),"start driver reached end")
		for key: String in ["enemy","queues","cursor"]: check(equivalent(result[key],row["expected"][key]),"source "+key)
		check(equivalent(result["all_events"],row["expected"]["events"]),"complete source write/command/RNG order")
		check(result["enemy"]["_atkParryable"]==data["parry"].has(row["id"]),"source parry classification only")
	_boundaries()
	check(randi()==next_random,"no shared RNG consumed")
	var body: String=FileAccess.get_file_as_string("res://scripts/native_ch3_boss_new_start.gd")
	for forbidden: String in ["FileAccess","DirAccess","OS.","randf(","randi(","seed(","SceneTree","Node.new","func _process","func _physics_process"]:
		check(not body.contains(forbidden),"no runtime IO/RNG/scene entry "+forbidden)
	finish()
func _enemy() -> Dictionary:
	return {"x":10,"y":20,"r":44,"atk":46,"el":2,"col":"#abcdef","_bossPhase":4,"ib":true}
func _context() -> Dictionary:
	return {"player_x":100,"player_y":200,"map_width":128,"map_height":108}
func _boundaries() -> void:
	label="input/ack/RNG/provenance boundaries"
	for si in [-1,0,9,14,34]: check(Start.begin_start(si,"laser",_enemy(),100,0)["status"]=="NOT_READY","stage unsupported")
	for id: String in ["missing","charge","cageTrap","vortex","spiralBullet","tailSwipe"]:
		check(Start.begin_start(10,id,_enemy(),100,0)["status"]=="NOT_READY","other owner not completed")
	for phase in [-1,5]: check(Start.begin_start(10,"laser",_enemy(),100,phase)["status"]=="NOT_READY","phase unsupported")
	for key: String in ["x","y"]:
		var e: Dictionary=_enemy();e.erase(key)
		check(Start.begin_start(10,"laser",e,100,0)["status"]=="NOT_READY","actor position required")
	for value in ["bad",-1,5,INF,NAN]:
		var e: Dictionary=_enemy();e["_bossPhase"]=value
		check(Start.begin_start(10,"tidalWipe",e,100,0,0,_context())["status"]=="NOT_READY","actor phase bounded")
	check(Start.begin_start(10,"laser",_enemy(),100,0)["reason"]=="actor_facing_missing","laser facing snapshot required")
	for id: String in ["teleStrike","delaySlash","perilThrust","gravityWell"]:
		check(Start.begin_start(10,id,_enemy(),100,0)["reason"]=="player_position_reader_missing","player reader required")
	for id: String in ["safeCorner","tidalWipe"]:
		check(Start.begin_start(10,id,_enemy(),100,0,0,{"map_width":"bad"})["status"]=="NOT_READY","map shape")
	var token: Dictionary=Start.begin_start(13,"teleStrike",_enemy(),100,0,0,_context())["continuation"]
	check(Start.next_start(token)["reason"]=="rng_provider_missing","tele RNG required")
	for unit in [-0.1,1.0,null,"0.5",INF,NAN]:
		var got: Dictionary=Start.next_start(token,null,func(_tag: String) -> Variant: return unit)
		check(got["status"]=="NOT_READY" and got["reason"]=="rng_unit_invalid","invalid unit rejected")
		check(got["enemy"]==null and got["command"]==null and got["continuation"]==null,"no partial failure packet")
	for key: String in ["owner","id","si","version","_chapter_catalog_path","_chapter_source_hash","_chapter_catalog","pc","pending"]:
		var bad: Dictionary=token.duplicate(true)
		match key:
			"si": bad[key]=9
			"pc": bad[key]=-1
			"version": bad[key]=2
			"_chapter_catalog": bad.erase(key)
			_: bad[key]="wrong"
		check(Start.next_start(bad)["status"]=="NOT_READY","token rejected "+key)
	var first: Dictionary=Start.next_start(token,null,func(_tag: String) -> Variant: return 0.5)
	check(first["command"]["command"]=="canMv" and first["rng_ledger"].size()==2,"two draws then collision request")
	var before: Dictionary=first["continuation"].duplicate(true)
	for reply in [null,{}, {"ack":false},true]:
		check(Start.next_start(first["continuation"],reply)["reason"]=="owner_ack_missing","explicit ack required")
		check(equivalent(before,first["continuation"]),"bad ack input immutable")
	check(Start.next_start(first["continuation"],{"ack":true})["reason"]=="collision_result_missing","typed collision readback required")
	var safe: Dictionary=Start.next_start(first["continuation"],{"ack":true,"value":false})
	check(safe["command"]["command"]=="safePt","collision false requests safe point")
	check(Start.next_start(safe["continuation"],{"ack":true})["reason"]=="safe_point_result_missing","explicit null vs absent safe point")
	check(Start.next_start(safe["continuation"],{"ack":true,"value":{}})["reason"]=="safe_point_shape_unsupported","safe point shape")
	var ensured: Dictionary=Start.next_start(Start.begin_start(10,"safeCorner",_enemy(),100,0,0,_context())["continuation"])
	check(ensured["command"]["command"]=="ensure_global_queue" and ensured["rng_ledger"].is_empty(),"ensure before safe quadrant RNG")
	check(Start.next_start(ensured["continuation"],{"ack":true})["reason"]=="rng_provider_missing","RNG required after ensure ack")
	var altered: Dictionary=token.duplicate(true);altered["program"]=[{"op":"unknown"}]
	check(Start.next_start(altered)["reason"]=="new_start_operation_unsupported","unknown op rejected")
	check(Start.next_start({})["status"]=="NOT_READY","fabricated token rejected")
func finish() -> void:
	print("BC3_03_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_summary":summary,"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
	quit(0 if failures==0 else 1)

func equivalent(a: Variant,b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):
		if is_nan(float(a)) and is_nan(float(b)): return true
		if b is int: return a==b
		return absf(float(a)-float(b))<=1e-12*maxf(1.0,absf(float(b))) # Adopted BC06/BC2-03 numeric contract, not increased.
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
func consume_start(si: int, id: String, enemy: Dictionary, d: float, phase: int, extra: float,
		context: Dictionary, units: Array, collision: bool=true, safe: Variant=null,
		initial_queues: Dictionary={}, nested: int=0) -> Dictionary:
	var before: Dictionary = enemy.duplicate(true)
	var context_before: Dictionary = context.duplicate(true)
	var result: Dictionary = Start.begin_start(si,id,enemy,d,phase,extra,context)
	check(equivalent(enemy,before) and equivalent(context,context_before),"begin inputs read-only")
	if result["status"]!="READY": return result
	var token: Dictionary = result["continuation"]
	var response: Variant = null
	var events: Array = []
	var queues: Dictionary = initial_queues.duplicate(true)
	var cursor: Array = [0]
	for guard in range(100):
		var token_before: Dictionary = token.duplicate(true)
		result = Start.next_start(token,response,func(_tag: String) -> Variant:
			var unit: Variant = units[cursor[0]%units.size()]
			cursor[0]+=1
			return unit)
		check(equivalent(token,token_before),"continuation input read-only")
		if result["status"]!="READY": return result
		check(result["full_tick_complete"]==false,"no full combat tick claim")
		events.append_array(resolve(result["events"]))
		if result["done"]: break
		var command: Dictionary = result["command"]
		check(command["executed"]==false,"request never marked executed")
		response={"ack":true} # Contract fixture acknowledgment, not actual owner success.
		match command["command"]:
			"canMv": response["value"]=collision
			"safePt": response["value"]=safe
			"ensure_global_queue":
				if not queues.has(command["args"][0]): queues[command["args"][0]]=[]
			"append_global_queue": queues[command["args"][0]].append(command["args"][1].duplicate(true))
		if command["command"] not in ["canMv","safePt","ensure_global_queue","append_global_queue"]: cursor[0]+=nested
		token=result["continuation"]
	result["all_events"]=events
	result["queues"]=queues
	result["cursor"]=cursor[0]
	check(equivalent(enemy,before) and equivalent(context,context_before),"end inputs read-only")
	return result

func resolve(value: Variant) -> Variant:
	if value is Dictionary:
		if value.has("concat"):
			var text := ""
			for item: Variant in value["concat"]: text+=str(resolve(item))
			return text
		if value.get("call")=="_L": return value["args"][1] if language=="en" else value["args"][0]
		if value.get("call")=="_T":
			var text: String = "translated:"+value["args"][0]
			if value.has("replace_first"):
				var pair: Array = value["replace_first"]
				var at: int = text.find(pair[0])
				if at>=0: text=text.substr(0,at)+pair[1]+text.substr(at+pair[0].length())
			return text
		var result: Dictionary = {}
		for key in value: result[key]=resolve(value[key])
		return result
	if value is Array:
		var result: Array = []
		for item in value: result.append(resolve(item))
		return result
	return value

func decode(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size()==1 and value.has("integer"): return int(value["integer"])
		if value.size()==1 and value.has("binary64"): return str(value["binary64"]).hex_decode().decode_double(0)
		var result: Dictionary={}
		for key: String in value: result[key]=decode(value[key])
		return result
	if value is Array:
		var result: Array=[]
		for item: Variant in value: result.append(decode(item))
		return result
	return value
