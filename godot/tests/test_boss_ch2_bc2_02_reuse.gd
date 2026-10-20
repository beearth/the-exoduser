extends SceneTree
## BC2-02: independently execute original JS through an argument-supplied Node.
## UTF-8 result file + joined OS.execute output; no output[0] assumption.
const Reuse = preload("res://scripts/native_ch2_boss_reuse.gd")
const Bridge = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const Spawn = preload("res://scripts/native_ch1_boss_spawn_contract.gd")
const Start = Reuse
const Melee = Reuse
const Default = preload("res://scripts/native_ch1_boss_catalog.gd")
const USERDIR = "EXODUSER-bc2-02-Isolated-20261020"
const HASH = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
class WrongSource:
	extends RefCounted
	static func source_receipt() -> Dictionary:
		var result: Dictionary = preload("res://scripts/native_ch2_boss_catalog_bridge.gd").source_receipt()
		result["source_game_sha256"]="wrong"
		return result
	static func boss_for_stage(_si: int) -> Dictionary: return {}
	static func move_by_id(_id: String) -> Dictionary: return {}
	static func phase_by_index(_phase: int) -> Dictionary: return {}
	static func combos_for_stage(_si: int,_phase: int) -> Array: return []
var assertions := 0
var failures := 0
var source_path := ""
var node_bin := ""
var label := "startup"
var oracle_counts: Dictionary = {}

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_path=arg.trim_prefix("--source-game=")
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func check(ok: bool,message: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		printerr("BC2_02_FAIL ",label," ",message)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true 		and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR 		and OS.get_user_data_dir().get_file()==USERDIR,"isolated settings and actual path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin executable argument required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game current bytes required")
	if failures>0: finish(); return
	var target: String = OS.get_user_data_dir().path_join("bc2-02-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array = []
	var exit_code: int = OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc2_02_source_oracle.cjs"),source_path,target]),output,true)
	var joined: String = "".join(output)
	check(exit_code==0,"Node source oracle exit0: "+joined.left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture written")
	if failures>0: finish(); return
	var decoded: Variant = JSON.parse_string(FileAccess.get_file_as_string(target))
	var summary: Variant = JSON.parse_string(joined.strip_edges())
	check(decoded is Dictionary and summary is Dictionary,"UTF-8 file and all output chunks parse")
	if not decoded is Dictionary or not summary is Dictionary: finish(); return
	check(decoded.get("game_sha256")==HASH and decoded.get("source_only")==true,"source receipt independent")
	oracle_counts=summary["cases"]
	# Restore exact numeric transport; JSON does not preserve RNG binary boundaries.
	for unit_name: String in ["bc04","bc06","bc07"]:
		for row: Dictionary in decoded["units"][unit_name]["cases"]:
			if row.has("unit_bits"):
				var exact: Array=[]
				for bits: String in row["unit_bits"]: exact.append(bits.hex_decode().decode_double(0))
				row["units"]=exact
	for row: Dictionary in decoded["units"]["bc05"]["cases"]:
		if row.has("scalar_unit_bits"): row["unit"]=row["scalar_unit_bits"].hex_decode().decode_double(0)
	check(Reuse.source_receipt()["ready"]==true,"chapter provider ready")
	check(Bridge.source_receipt()["move_manifest"]==Default.source_receipt()["move_manifest"],"global59 manifest preserved")
	check(Reuse.source_receipt()["shared_start_count"]==22 and Reuse.source_receipt()["new_start_owner_required"]==10,"owned start boundary")
	_spawn(decoded["units"]["bc02"])
	_score(decoded["units"]["bc03"])
	_select(decoded["units"]["bc04"])
	_phase(decoded["units"]["bc05"])
	_start(decoded["units"]["bc06"])
	_melee(decoded["units"]["bc07"])
	_boundaries()
	finish()
func _spawn(data: Dictionary) -> void:
	for row: Dictionary in data["cases"]:
		label="spawn si"+str(row["request"]["si"])
		var request: Dictionary = row["request"].duplicate(true)
		for key: String in ["si","difficulty_index","room"]: request[key]=int(request[key])
		var cursor: Array=[0]
		var result: Dictionary=Reuse.build_spawn_packet(request,func(_tag: String) -> Variant:
			var unit: Variant=data["random_unit_bits"][cursor[0]].hex_decode().decode_double(0);cursor[0]+=1;return unit,
			func(_x: float,_y: float,_r: float) -> bool: return row["placement"]=="clear",
			func(_x: float,_y: float,_r: float) -> Variant: return {"x":56.25,"y":98.5} if row["placement"]=="safe" else null)
		check(result["status"]=="READY","spawn READY")
		if result["status"]!="READY": continue
		for key: String in row["fields"]:
			check(equivalent(result["fields"].get(key),row["fields"][key]),"field "+key)
		for key: String in ["hp","mhp","atk","baseAtk","_revPts","_maxRevPts"]:
			check(result["fields"][key]==row["fields"][key],"exact discrete "+key)
		check(cursor[0]==row["draw_values"].size(),"six draw count")
		check(equivalent(result["placement_reads"],row["placement_reads"]),"placement read order")
func _score(data: Dictionary) -> void:
	for row: Array in data["cases"]:
		label="score si"+str(row[0])+" move"+str(row[1])+" phase"+str(row[3])
		var move: Dictionary=data["moves"][int(row[1])].duplicate(true);move["idx"]=int(move["idx"])
		var integer_phases: Array=[]
		for phase_value in move["phase"]: integer_phases.append(int(phase_value))
		move["phase"]=integer_phases
		var calls: Array=[]
		var result: Dictionary=Reuse.evaluate_move(int(row[0]),move,row[2],data["ps"][int(row[4])],int(row[3]),data["enemies"][int(row[5])],func(tag: String) -> Variant: calls.append(tag);return row[6])
		check(result["status"]=="READY","score READY")
		if result["status"]!="READY": continue
		check(equivalent(result["score"],row[7]),"source score")
		check(calls.size()==row[8],"gate and draw count")
func _select(data: Dictionary) -> void:
	for row: Dictionary in data["cases"]:
		label="select si"+str(row["si"])+" "+row["name"]
		var enemy: Dictionary=row["enemy"].duplicate(true);enemy["_bossPhase"]=int(enemy["_bossPhase"])
		var before: Dictionary=enemy.duplicate(true);var cursor: Array=[0]
		var result: Dictionary=Reuse.select_tick(int(row["si"]),enemy,row["sp"],row["d"],row["ps"],func(_tag: String) -> Variant:
			var unit: Variant=row["units"][cursor[0]%row["units"].size()];cursor[0]+=1;return unit,row["debug"])
		check(result["status"]=="READY","selector READY")
		if result["status"]!="READY": continue
		for key: String in ["enemy","player_stats","rng_ledger"]:
			check(equivalent(result[key],row["expected"][key]),"source "+key)
		check(equivalent(result.get("start_pattern"),row["expected"]["start_pattern"]),"source start request")
		check(cursor[0]==row["expected"]["rng_ledger"].size(),"source callback count")
		check(equivalent(enemy,before),"selector input immutable")
func _phase(data: Dictionary) -> void:
	for row: Dictionary in data["cases"]:
		label="phase si"+str(row["si"])+" "+row["method"]
		var enemy: Dictionary=row["enemy"].duplicate(true);enemy["_bossPhase"]=int(enemy["_bossPhase"])
		var calls: Array=[];var packet: Dictionary
		if row["method"]=="phase": packet=Reuse.phase_transition(int(row["si"]),enemy)
		else: packet=Reuse.clock_step(int(row["si"]),row["method"],enemy,row["sp"],row["context"],func(tag: String) -> Variant: calls.append(tag);return row["unit"])
		check(packet["status"]=="READY","phase READY")
		if packet["status"]!="READY": continue
		for field: String in ["enemy","write_keys","commands","rng_ledger","continuation_required"]:
			check(equivalent(packet[field],row["expected"][field]),"source "+field)
		check(packet["full_tick_complete"]==false,"not live combat")
		check(calls.size()==row["expected"]["rng_ledger"].size(),"source callback count")
func _start(data: Dictionary) -> void:
	for row: Dictionary in data["cases"]:
		label="start si"+str(row["si"])+" "+row["id"]
		var result: Dictionary=consume_start(int(row["si"]),row["id"],row["enemy"],row["d"],int(row["phase"]),row["extra"],row["context"],row["units"],row["collision"],row["safe"],row["initial_queues"],int(row["nested"]))
		check(result["status"]=="READY","start READY")
		if result["status"]!="READY": continue
		for field: String in ["enemy","queues","cursor"]: check(equivalent(result[field],row["expected"][field]),"source "+field)
		check(equivalent(result["all_events"],row["expected"]["events"]),"source complete event order")
func _melee(data: Dictionary) -> void:
	for row: Dictionary in data["cases"]:
		label="melee si"+str(row["si"])+" "+row["enemy"]["s"]
		var result: Dictionary=consume_melee(row)
		check(result["status"]=="READY","melee READY")
		if result["status"]!="READY": continue
		for field: String in ["enemy","player","globals","cursor"]: check(equivalent(result[field],row["expected"][field]),"source "+field)
		check(equivalent(result["all_events"],row["expected"]["events"]),"source complete event order")
func _boundaries() -> void:
	label="provider and continuation boundaries"
	check(Context.resolve(null)["catalog"]==Default,"null default remains CH1")
	check(Context.resolve({})["ready"]==false,"provider shape missing")
	check(Context.resolve(Default)["ready"],"explicit CH1 data provider valid")
	check(Context.resolve(WrongSource)["ready"]==false,"source mismatch rejected")
	var draws: Array=[]
	check(Spawn.build_spawn_packet({"si":4,"difficulty_index":5,"room":0},func(tag: String) -> Variant: draws.append(tag);return 0.5,func(_x: float,_y: float,_r: float) -> bool: return true,Callable(),WrongSource)["status"]=="NOT_READY","invalid provider not applied")
	check(draws.is_empty(),"invalid provider consumes no RNG")
	for si in [-1,0,3,10,34]:
		check(Reuse.phase_transition(si,{})["status"]=="NOT_READY","CH2 entry stage rejected")
	for id: String in ["vortex","beanRain","fanWave","spiralBullet","wallPush","shieldBash2","fireRain","shockGrid","donutSlam","crossWipe"]:
		var result: Dictionary=Reuse.begin_start(9,id,{"x":0,"y":0},100,4)
		check(result["status"]=="NOT_READY" and result["reason"]=="pattern_start_owner_required","new start stays unowned "+id)
	var e: Dictionary={"x":0,"y":0,"r":44,"atk":46,"el":0,"_bossPhase":1}
	var p: Dictionary={"x":100,"y":100,"facing":0,"iframes":0,"s":"idle"}
	var start: Dictionary=Reuse.begin_phase_effects(4,e,p)
	check(start["status"]=="READY","phase effect chapter token bound")
	if start["status"]=="READY":
		var token: Dictionary=start["continuation"]
		check(token["si"]==4 and token["_chapter_catalog"]==Bridge,"real stage and provider retained")
		check(Reuse.phase_effect_step(token,null,func(_tag: String) -> Variant: return 0.5).get("command",{}).get("executed",true)==false,"effect request unexecuted")
		var wrong: Dictionary=token.duplicate(true);wrong["_chapter_source_hash"]="wrong"
		check(Reuse.phase_effect_step(wrong)["status"]=="NOT_READY","token source binding")
		wrong=token.duplicate(true);wrong["_chapter_catalog_path"]="wrong"
		check(Reuse.phase_effect_step(wrong)["status"]=="NOT_READY","token provider binding")
		wrong=token.duplicate(true);wrong.erase("_chapter_catalog")
		check(Reuse.phase_effect_step(wrong)["status"]=="NOT_READY","missing token context")
	var started: Dictionary=Reuse.begin_start(4,"burst",{"x":0,"y":0},100,0)
	var step: Dictionary=Reuse.next_start(started["continuation"])
	check(step["status"]=="READY" and step["command"]["executed"]==false,"common start command unexecuted")
	check(Reuse.next_start(step["continuation"])["status"]=="NOT_READY","no synthetic owner ack")
	check(Reuse.next_start({})["status"]=="NOT_READY" and Reuse.next_tick({})["status"]=="NOT_READY","no manufactured continuation")
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
func finish() -> void:
	print("BC2_02_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_cases":oracle_counts,"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
	quit(0 if failures==0 else 1)

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


func consume_melee(row: Dictionary) -> Dictionary:
	var before: Dictionary=row["enemy"].duplicate(true)
	var player_before: Dictionary=row["player"].duplicate(true)
	var started: Dictionary=Melee.begin_tick(int(row["si"]),row["enemy"],row["sp"],row["player"],row["options"])
	check(started["status"]=="READY","begin valid source snapshot")
	if started["status"]!="READY": return started
	var token: Dictionary=started["continuation"]
	var response: Variant=null
	var events: Array=[]
	var cursor: Array=[0]
	var contacts: int=0
	var globals: Dictionary={"shake":71,"hitStop":99}
	var result: Dictionary={}
	for guard in range(80):
		var token_before: Dictionary=token.duplicate(true)
		result=Melee.next_tick(token,response,func(_tag: String) -> Variant:
			var u: Variant=row["units"][cursor[0]%row["units"].size()]
			cursor[0]+=1
			return u)
		check(equivalent(token,token_before),"continuation input read-only")
		if result["status"]!="READY": return result
		check(result["full_tick_complete"]==false,"not a complete updateE or actual damage proof")
		events.append_array(result["events"])
		for event: Dictionary in result["events"]:
			if event["kind"]=="global_write": globals[event["field"]]=event["value"]
		if result["done"]: break
		var command: Dictionary=result["command"]
		check(command["executed"]==false,"requests remain unexecuted")
		response={"ack":true}
		if command["command"]=="canMv": response["value"]=row["collision"]
		elif command["command"]=="resolve_boss_melee_contact":
			check(contacts<row["responses"].size(),"original protected owner readback exists")
			if contacts>=row["responses"].size(): return {"status":"NOT_READY","reason":"fixture_contact_missing"}
			var authority: Dictionary=row["responses"][contacts]
			response["enemy_after"]=authority["enemy_after"]
			response["player_after"]=authority["player_after"]
			cursor[0]=int(authority["cursor_after"])
			contacts+=1
		else: cursor[0]+=int(row["nested"])
		token=result["continuation"]
	check(equivalent(row["enemy"],before) and equivalent(row["player"],player_before),"actor/player inputs read-only")
	result["all_events"]=events
	result["globals"]=globals
	result["cursor"]=cursor[0]
	result["contacts"]=contacts
	return result
