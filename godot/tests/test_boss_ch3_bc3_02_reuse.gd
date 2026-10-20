extends SceneTree
## BC3-02: independently execute original JS through an argument-supplied Node.
## UTF-8 result file + joined OS.execute output; no output[0] assumption.
const Reuse = preload("res://scripts/native_ch3_boss_reuse.gd")
const Bridge = preload("res://scripts/native_ch3_boss_catalog.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const Spawn = preload("res://scripts/native_ch1_boss_spawn_contract.gd")
const CommonUtility=preload("res://scripts/native_ch1_boss_utility.gd")
const CommonSelector=preload("res://scripts/native_ch1_boss_selector.gd")
const CommonPhase=preload("res://scripts/native_ch1_boss_phase.gd")
const CommonStart=preload("res://scripts/native_ch1_boss_pattern_start.gd")
const CommonMelee=preload("res://scripts/native_ch1_boss_melee_states.gd")
const Movement=preload("res://scripts/native_ch1_boss_movement_states.gd")
const Ch2=preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Start = Reuse
const Melee = Reuse
const Default = preload("res://scripts/native_ch1_boss_catalog.gd")
const USERDIR = "EXODUSER-bc3-02-Isolated-20261020"
const HASH = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
class WrongSource:
	extends RefCounted
	static func source_receipt() -> Dictionary:
		var result: Dictionary = preload("res://scripts/native_ch3_boss_catalog.gd").source_receipt()
		result["source_game_sha256"]="wrong"
		return result
	static func boss_for_stage(_si: int) -> Dictionary: return {}
	static func move_by_id(_id: String) -> Dictionary: return {}
	static func phase_by_index(_phase: int) -> Dictionary: return {}
	static func combos_for_stage(_si: int,_phase: int) -> Array: return []
class Lookalike:
	extends RefCounted
	static func source_receipt() -> Dictionary: return preload("res://scripts/native_ch3_boss_catalog.gd").source_receipt()
	static func boss_for_stage(si: int) -> Dictionary: return preload("res://scripts/native_ch3_boss_catalog.gd").boss_for_stage(si)
	static func move_by_id(id: String) -> Dictionary: return preload("res://scripts/native_ch3_boss_catalog.gd").move_by_id(id)
	static func phase_by_index(p: int) -> Dictionary: return preload("res://scripts/native_ch3_boss_catalog.gd").phase_by_index(p)
	static func combos_for_stage(si: int,p: int) -> Array: return preload("res://scripts/native_ch3_boss_catalog.gd").combos_for_stage(si,p)
var assertions := 0
var failures := 0
var source_path := ""
var node_bin := ""
var label := "startup"
var oracle_counts: Dictionary = {}
var seen: Dictionary={}
var inspected_tokens: int=0

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_path=arg.trim_prefix("--source-game=")
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
	call_deferred("_run")
func check(ok: bool,message: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		printerr("BC3_02_FAIL ",label," ",message)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true 		and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR 		and OS.get_user_data_dir().get_file()==USERDIR,"isolated settings and actual path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin executable argument required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game current bytes required")
	if failures>0: finish(); return
	var target: String = OS.get_user_data_dir().path_join("bc3-02-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array = []
	var exit_code: int = OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc3_02_source_oracle.cjs"),source_path,target]),output,true)
	var joined: String = "".join(output)
	check(exit_code==0,"Node source oracle exit0: "+joined.left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture written")
	if failures>0: finish(); return
	var decoded: Variant = restore(JSON.parse_string(FileAccess.get_file_as_string(target)))
	var summary: Variant = JSON.parse_string(joined.strip_edges())
	check(decoded is Dictionary and summary is Dictionary,"UTF-8 file and all output chunks parse")
	if not decoded is Dictionary or not summary is Dictionary: finish(); return
	check(decoded.get("game_sha256")==HASH and decoded.get("source_only")==true,"source receipt independent")
	oracle_counts=summary["cases"]
	check(Reuse.source_receipt()["ready"]==true,"chapter provider ready")
	check(Bridge.source_receipt()["move_manifest"]==Default.source_receipt()["move_manifest"],"global59 manifest preserved")
	check(Reuse.source_receipt()["shared_start_count"]==21 and Reuse.source_receipt()["other_start_owner_required"]==16,"owned start boundary")
	print("BC3_02_PROGRESS _spawn")
	_spawn(decoded["units"]["bc02"])
	print("BC3_02_PROGRESS _score")
	_score(decoded["units"]["bc03"])
	print("BC3_02_PROGRESS _select")
	_select(decoded["units"]["bc04"])
	print("BC3_02_PROGRESS _phase")
	_phase(decoded["units"]["bc05"])
	print("BC3_02_PROGRESS _start")
	_start(decoded["units"]["bc06"])
	print("BC3_02_PROGRESS _melee")
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
			var unit: Variant=data["random_units"][cursor[0]];cursor[0]+=1;return unit,
			func(_x: float,_y: float,_r: float) -> bool: return row["placement"]=="clear",
			func(_x: float,_y: float,_r: float) -> Variant: return {"x":56.25,"y":98.5} if row["placement"]=="safe" else null)
		if row["fields"]==null:
			check(result["status"]=="REJECTED" and result["fields"].is_empty(),"original blocked spawn rejection")
			check(cursor[0]==0 and equivalent(result["placement_reads"],row["placement_reads"]),"blocked spawn reads; zero RNG")
			continue
		check(result["status"]=="READY","spawn READY")
		if result["status"]!="READY": continue
		check(result["fields"]["el"]==2 and result["fields"]["col"]=="#3388ff" and result["fields"]["dropTier"]==3,"actual CH3 element/color/dropTier")
		for key: String in row["fields"]:
			check(equivalent(result["fields"].get(key),row["fields"][key]),"field "+key)
		for key: String in ["hp","mhp","atk","baseAtk","_revPts","_maxRevPts"]:
			check(result["fields"][key]==row["fields"][key],"exact discrete "+key)
		if once("spawn"+str(request["si"])):
			var direct_cursor: Array=[0]
			var direct: Dictionary=Spawn.build_spawn_packet(request,func(_tag: String) -> Variant:
				var unit: Variant=data["random_units"][direct_cursor[0]];direct_cursor[0]+=1;return unit,
				func(_x: float,_y: float,_r: float) -> bool: return row["placement"]=="clear",Callable(),Bridge)
			check(exact(result,direct) and cursor[0]==direct_cursor[0],"spawn exact explicit-catalog delegation")
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
		if once("score"+str(row[0])):
			var direct_calls: Array=[]
			var direct: Dictionary=CommonUtility.evaluate_move(int(row[0]),move,row[2],data["ps"][int(row[4])],int(row[3]),data["enemies"][int(row[5])],func(tag: String) -> Variant: direct_calls.append(tag);return row[6],Bridge)
			check(exact(result,direct) and calls==direct_calls,"score exact explicit-catalog delegation")
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
		if row["expected"]["start_pattern"]!=null and once("select"+str(row["si"])):
			var direct_cursor: Array=[0]
			var direct: Dictionary=CommonSelector.select_tick(int(row["si"]),enemy,row["sp"],row["d"],row["ps"],func(_tag: String) -> Variant:
				var u: Variant=row["units"][direct_cursor[0]%row["units"].size()];direct_cursor[0]+=1;return u,row["debug"],Bridge)
			check(exact(result,direct) and cursor[0]==direct_cursor[0],"selector exact explicit-catalog delegation")
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
		if once("phase:"+row["method"]):
			var direct: Dictionary
			if row["method"]=="phase": direct=CommonPhase.phase_transition(int(row["si"]),enemy,Bridge)
			else: direct=CommonPhase.clock_step(int(row["si"]),row["method"],enemy,row["sp"],row["context"],func(_tag: String) -> Variant: return row["unit"],Bridge)
			check(exact(packet,direct),"phase/clock exact explicit-catalog delegation")
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
	label="real catalog / stages / future provider ownership"
	check(Context.resolve(Bridge)["ready"] and Context.resolve(null)["catalog"]==Default,"CH3 valid; default still CH1")
	check(Context.resolve(WrongSource)["ready"]==false,"wrong source provider denied")
	var e: Dictionary={"ib":true,"etype":0,"s":"bossChargeWind","x":0,"y":0,"r":44,"st2":18,"facing":0,"atk":46,"el":2,"col":"#3388ff","_bossPhase":1}
	var p: Dictionary={"x":0,"y":100,"r":12,"facing":0,"iframes":0,"s":"idle"}
	for si in [-1,0,3,4,9,14,34,35]:
		var draws: Array=[]
		var rng: Callable=func(tag: String) -> float: draws.append(tag);return 0.5
		check(Reuse.build_spawn_packet({"si":si,"difficulty_index":5,"room":0,"x":0,"y":0,"player_level":100,"stage_diff_offset":0},rng,func(_x: float,_y: float,_r: float) -> bool: draws.append("collision");return true)["status"]=="NOT_READY","spawn stage boundary "+str(si))
		check(Reuse.evaluate_move(si,{"id":"charge"},100,null,0,{},rng)["status"]=="NOT_READY","score stage boundary")
		check(Reuse.select_tick(si,{},1,100,null,rng)["status"]=="NOT_READY","selector stage boundary")
		check(Reuse.phase_transition(si,{})["status"]=="NOT_READY","phase stage boundary")
		check(Reuse.clock_step(si,"telegraph",{},1,{},rng)["status"]=="NOT_READY","clock stage boundary")
		check(Reuse.begin_phase_effects(si,e,p)["status"]=="NOT_READY","phase effects stage boundary")
		check(Reuse.begin_start(si,"charge",{},100,0)["status"]=="NOT_READY","start stage boundary")
		check(Reuse.begin_tick(si,e,1,p)["status"]=="NOT_READY","melee stage boundary")
		check(draws.is_empty(),"unsupported stage reads/RNG0")
	for id: String in ["vortex","beanRain","fanWave","laser","shieldBash2","fireRain","shockGrid","donutSlam","crossWipe","safeCorner","tidalWipe","teleStrike","delaySlash","perilThrust","spiralBullet","gravityWell"]:
		var result: Dictionary=Reuse.begin_start(13,id,{"x":0,"y":0},100,4)
		check(result["status"]=="NOT_READY" and result["reason"]=="pattern_start_owner_required","registered start keeps its actual owner "+id)
	for id: String in ["poisonTrail","wallPush","tailSwipe","burrowStrike","cageTrap","missing"]:
		check(Reuse.begin_start(13,id,{"x":0,"y":0},100,4)["status"]=="NOT_READY","outside CH3 catalog not manufactured "+id)
	for si in [10,11,12,13]:
		var begun: Dictionary=Reuse.begin_phase_effects(si,e,p)
		check(begun["status"]=="READY","phase effects begin")
		if begun["status"]!="READY": continue
		check(exact(begun,CommonPhase.begin_phase_effects(si,e,p,Bridge)),"phase effects begin exact delegation")
		var token: Dictionary=begun["continuation"]
		check(Reuse.owns_continuation(token) and token["si"]==si and token["_chapter_catalog"]==Bridge,"effects actual CH3 binding")
		var step: Dictionary=Reuse.phase_effect_step(token,null,func(_tag: String) -> float: return 0.5)
		check(exact(step,CommonPhase.phase_effect_step(token,null,func(_tag: String) -> float: return 0.5)),"effects next exact delegation")
		check(step["status"]=="READY" and step["command"]["executed"]==false,"phase effects is an unexecuted request")
		var movement: Dictionary=Movement.begin_tick(si,"state",e,1,p,{},Bridge)
		check(movement["status"]=="READY" and Reuse.owns_continuation(movement["continuation"]),"future BC08 token exact actual CH3 provider")
		check(Movement.next_tick(movement["continuation"])["enemy"]["facing"]==PI/2,"actual si avoids druid last18-frame lock")
		check(Reuse.next_tick(movement["continuation"])["status"]=="NOT_READY","ownership does not reinterpret future movement as melee")
		for field: String in ["_chapter_catalog","_chapter_catalog_path","_chapter_source_hash"]:
			var wrong: Dictionary=token.duplicate(true);wrong.erase(field)
			check(not Reuse.owns_continuation(wrong),"missing provider binding "+field)
			deny_all(wrong)
		for field: String in ["_chapter_catalog_path","_chapter_source_hash"]:
			var wrong: Dictionary=token.duplicate(true);wrong[field]="forged"
			check(not Reuse.owns_continuation(wrong),"forged binding "+field)
			deny_all(wrong)
		for provider in [null,Default,Ch2,WrongSource,Lookalike]:
			var wrong: Dictionary=token.duplicate(true)
			wrong["_chapter_catalog"]=provider
			wrong["_chapter_catalog_path"]=provider.resource_path if provider!=null else ""
			check(not Reuse.owns_continuation(wrong),"other script is not this CH3 provider")
			deny_all(wrong)
		for other_si in [9,14,-1,10.0,"10",true]:
			var wrong: Dictionary=token.duplicate(true);wrong["si"]=other_si
			check(not Reuse.owns_continuation(wrong),"foreign stage continuation")
			deny_all(wrong)
		var future: Dictionary={"si":si,"version":99,"future_state":{"unowned":true}}
		Context.bind(future,Bridge)
		var before: Dictionary=future.duplicate(true)
		check(Reuse.owns_continuation(future) and exact(future,before),"future ownership inspection only; input immutable")
		deny_all(future)
	check(Context.resolve(Lookalike)["ready"],"lookalike has valid source data but a different identity")
	deny_all({})
	var started: Dictionary=Reuse.begin_start(10,"burst",{"x":0,"y":0},100,0)
	var first: Dictionary=Reuse.next_start(started["continuation"])
	check(first["status"]=="READY" and first["command"]["executed"]==false,"start request is not execution")
	check(Reuse.next_start(first["continuation"])["status"]=="NOT_READY","actual owner acknowledgment required")
	var slash: Dictionary=e.duplicate(true)
	slash.merge({"s":"bossSlash","st2":5,"_slashIdx":0,"_slashCnt":3},true)
	var front: Dictionary=p.duplicate(true);front["x"]=100;front["y"]=0
	var hit: Dictionary=Reuse.next_tick(Reuse.begin_tick(10,slash,1,front,{"shake":100,"hit_stop":100})["continuation"])
	check(hit["command"]["command"]=="canMv","melee collision remains a reader request")
	hit=Reuse.next_tick(hit["continuation"],{"ack":true,"value":true})
	check(hit["command"]["command"]=="resolve_boss_melee_contact","protected contact remains an owner request")
	check(Reuse.next_tick(hit["continuation"],{"ack":true})["status"]=="NOT_READY","no fabricated hurtP/parry readback")
func deny_all(token: Dictionary) -> void:
	var before: Dictionary=token.duplicate(true)
	var calls: Array=[]
	var rng: Callable=func(tag: String) -> float: calls.append(tag);return 0.5
	check(Reuse.next_start(token,null,rng)["status"]=="NOT_READY","invalid start continuation")
	check(Reuse.next_tick(token,null,rng)["status"]=="NOT_READY","invalid melee continuation")
	check(Reuse.phase_effect_step(token,null,rng)["status"]=="NOT_READY","invalid effects continuation")
	check(calls.is_empty() and exact(token,before),"invalid token RNG0 and immutable")
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
	print("BC3_02_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_cases":oracle_counts,"userdir":OS.get_user_data_dir(),"live_combat_verified":false,"inspected_ch3_tokens":inspected_tokens}))
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
	check(Reuse.owns_continuation(token) and token["_chapter_catalog"]==Bridge and token["si"]==si,"start real CH3 provider/si")
	inspected_tokens+=1
	if once("begin_start"):
		check(exact(result,CommonStart.begin_start(si,id,enemy,d,phase,extra,context,Bridge)),"start begin exact delegation")
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
		if once("next_start"):
			var direct_cursor: Array=[0]
			var direct: Dictionary=CommonStart.next_start(token,response,func(_tag: String) -> Variant:
				var u: Variant=units[direct_cursor[0]%units.size()];direct_cursor[0]+=1;return u)
			check(exact(result,direct),"start next exact delegation")
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
	check(Reuse.owns_continuation(token) and token["_chapter_catalog"]==Bridge and token["si"]==int(row["si"]),"melee real CH3 provider/si")
	inspected_tokens+=1
	if once("begin_melee"):
		check(exact(started,CommonMelee.begin_tick(int(row["si"]),row["enemy"],row["sp"],row["player"],row["options"],Bridge)),"melee begin exact delegation")
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
		if once("next_melee"):
			var direct_cursor: Array=[0]
			var direct: Dictionary=CommonMelee.next_tick(token,response,func(_tag: String) -> Variant:
				var u: Variant=row["units"][direct_cursor[0]%row["units"].size()];direct_cursor[0]+=1;return u)
			check(exact(result,direct),"melee next exact delegation")
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

func once(key: String) -> bool:
	if seen.has(key): return false
	seen[key]=true
	return true
func restore(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size()==1 and value.has("__int"): return value["__int"].to_int()
		if value.size()==1 and value.has("__f64"): return value["__f64"].hex_decode().decode_double(0)
		var result: Dictionary={}
		for key in value: result[key]=restore(value[key])
		return result
	if value is Array:
		var result: Array=[]
		for item in value: result.append(restore(item))
		return result
	return value
## Full pass-through comparison: exact Variant types, key order, float bits,
## and object identity for the existing immutable catalog Script reference.
func exact(a: Variant,b: Variant) -> bool:
	if typeof(a)!=typeof(b): return false
	if a is Dictionary:
		if a.keys()!=b.keys(): return false
		for key in a:
			if not exact(a[key],b[key]): return false
		return true
	if a is Array:
		if a.size()!=b.size(): return false
		for i in range(a.size()):
			if not exact(a[i],b[i]): return false
		return true
	if a is float: return PackedFloat64Array([a]).to_byte_array()==PackedFloat64Array([b]).to_byte_array()
	return is_same(a,b) if a is Object else a==b
