extends SceneTree
## bc-integ-01: untouched-source VM, real CH2 bridge, test-only CH3 catalog reader.
## No protected helper is executed by product packets. Baselines are accepted
## pre-change module bytes provided by CLI, never a relaxed expected result.
const Move=preload("res://scripts/native_ch1_boss_movement_states.gd")
const Spawn=preload("res://scripts/native_ch1_boss_spawn_contract.gd")
const Shared=preload("res://scripts/native_ch1_boss_catalog.gd")
const Bridge=preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const USERDIR="EXODUSER-bc-integ-01-Isolated-20261020"
const GAME_SHA256=preload("res://source_snapshot/snapshot.gd").SHA256
const MOVE_BEFORE="c8e73bbc31c4f55c1952dbd4057c40eabd98b70057272fc5a7784fc96a4abc2f"
const SPAWN_BEFORE="e7159c70ba57b9b6a700bd89a32cc616d02c2676eb1780a83068c4d57a17d734"
# These readers are fixture data only, not a new production CH3/4/5/6/7 catalog.
# Values are independently checked against original STG/HELL_THEMES by Node.
class SourceFixture extends RefCounted:
	static func source_receipt() -> Dictionary: return preload("res://scripts/native_ch1_boss_catalog.gd").source_receipt()
	static func boss_for_stage(si: int) -> Dictionary:
		if si<0 or si>=35: return {"supported":false}
		var hell: int=0 if si<4 else (1 if si<10 else (2 if si<14 else (3 if si<21 else (4 if si<26 else (5 if si<32 else 6)))))
		return {"supported":true,"si":si,"hell":hell,"element_id":[0,0,2,1,3,3,3][hell],"etype":0,"ib":true}
	static func phase_by_index(p: int) -> Dictionary: return preload("res://scripts/native_ch1_boss_catalog.gd").phase_by_index(p)
	static func move_by_id(id: String) -> Dictionary: return preload("res://scripts/native_ch1_boss_catalog.gd").move_by_id(id)
	static func combos_for_stage(_si: int,_p: int) -> Array: return []
class Ch3Fixture extends SourceFixture:
	static func boss_for_stage(si: int) -> Dictionary:
		return {"supported":false} if si<10 or si>13 else {"supported":true,"si":si,"hell":2,"element_id":2,"etype":0,"ib":true}
class InvalidElement extends SourceFixture:
	static func boss_for_stage(_si: int) -> Dictionary: return {"supported":true,"element_id":7,"hell":2}
class NegativeElement extends SourceFixture:
	static func boss_for_stage(_si: int) -> Dictionary: return {"supported":true,"element_id":-1,"hell":2}
class FloatElement extends SourceFixture:
	static func boss_for_stage(_si: int) -> Dictionary: return {"supported":true,"element_id":2.0,"hell":2}
class MissingElement extends SourceFixture:
	static func boss_for_stage(_si: int) -> Dictionary: return {"supported":true,"hell":2}
var assertions: int=0
var failures: int=0
var scenario: String="isolation"
var original_integer_paths: Dictionary={}
var source_events: int=0
var source_draws: int=0
var source_contacts: int=0
var baseline_move: Variant
var baseline_spawn: Variant
var source_cases: int=0
var source_path: String=""
var node_bin: String=""
var baseline_move_path: String=""
var baseline_spawn_path: String=""
func _initialize() -> void:
	for arg: String in OS.get_cmdline_user_args():
		if arg.begins_with("--source-game="): source_path = ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
		if arg.begins_with("--baseline-bc08="): baseline_move_path=arg.trim_prefix("--baseline-bc08=")
		if arg.begins_with("--baseline-bc02="): baseline_spawn_path=arg.trim_prefix("--baseline-bc02=")
	call_deferred("_run")
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"exact isolated userdir")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==GAME_SHA256,"latest main source bytes")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"explicit --node-bin")
	check(not baseline_move_path.is_empty() and FileAccess.get_sha256(baseline_move_path)==MOVE_BEFORE,"accepted BC08 baseline bytes")
	check(not baseline_spawn_path.is_empty() and FileAccess.get_sha256(baseline_spawn_path)==SPAWN_BEFORE,"main BC02 baseline bytes")
	if failures: finish();return
	baseline_move=load(baseline_move_path)
	baseline_spawn=load(baseline_spawn_path)
	check(baseline_move is GDScript and baseline_spawn is GDScript,"baseline scripts load")
	if failures: finish();return
	var output_path: String=OS.get_user_data_dir().path_join("oracle.json")
	if FileAccess.file_exists(output_path): DirAccess.remove_absolute(output_path)
	var output: Array=[]
	var exit_code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc_integ_01_source_oracle.cjs"),source_path,output_path]),output,true)
	check(exit_code==0,"untouched-source Node VM: "+"".join(output))
	check(FileAccess.file_exists(output_path),"UTF-8 output file exists")
	if failures: finish();return
	var decoded: Variant=restore(JSON.parse_string(FileAccess.get_file_as_string(output_path)))
	check(decoded is Dictionary and decoded.has("cases") and decoded.has("spawns"),"oracle payload")
	if failures: finish();return
	_test_spawns(decoded["spawns"])
	source_cases=decoded["cases"].size()
	check(source_cases==3617,"complete independent movement matrix")
	for row: Dictionary in decoded["cases"]:
		original_integer_paths=row["integer_paths"]
		scenario=row["name"]+":"+row["enemy"]["s"]+":si"+str(row["si"])
		var result: Dictionary=consume(row)
		check(result["status"]=="READY" and result.get("done",false),"READY/done: "+str(result.get("reason")))
		if result["status"]!="READY": continue
		check(equivalent(result["enemy"],row["expected"]["enemy"],"/enemy"),"all actor fields")
		check(equivalent(result["player"],row["expected"]["player"],"/player"),"complete owner readback preserved")
		check(equivalent(result["all_events"],row["expected"]["events"],"/events"),"exact source writes/requests/RNG order and sites")
		check(equivalent(result["globals"],row["expected"]["globals"],"/globals"),"authored global writes only")
		check(result["cursor"]==row["expected"]["cursor"],"nested owner RNG interleaving")
		check(result["contacts"]==row["responses"].size(),"request count")
		source_events+=result["all_events"].size()
		source_contacts+=result["contacts"]
		for event: Dictionary in result["all_events"]:
			if event["kind"]=="rng": source_draws+=1
	_test_boundaries()
	finish()
func restore(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size()==1 and value.has("__f64"): return value["__f64"].hex_decode().decode_double(0)
		var result: Dictionary={}
		for key in value: result[key]=restore(value[key])
		return result
	if value is Array:
		var result: Array=[]
		for item in value: result.append(restore(item))
		return result
	return value
func provider_for(si: int) -> Variant:
	return null if si<4 else (Bridge if si<10 else (Ch3Fixture if si<14 else SourceFixture))
func spawn_request(si: int) -> Dictionary:
	return {"si":si,"difficulty_index":5,"room":0,"x":12.5,"y":20.25,"player_level":100,"stage_diff_offset":0}
func _test_spawns(rows: Array) -> void:
	check(rows.size()==35,"all original stage elements")
	for row: Dictionary in rows:
		var si: int=int(row["si"])
		scenario="spawn si"+str(si)
		var draws: Array=[]
		var packet: Dictionary=Spawn.build_spawn_packet(spawn_request(si),func(tag: String) -> float: draws.append(tag);return 0.5,func(_x: float,_y: float,_r: float) -> bool: return true,Callable(),provider_for(si))
		check(packet["status"]=="READY","source boss spawn ready")
		if packet["status"]!="READY": continue
		check(packet["fields"]["el"]==row["element"],"original STG.be")
		check(packet["fields"]["col"]==row["col"],"original mkEn ELC[el]")
		check(draws.size()==6,"no added RNG")
		var before: Dictionary=baseline_spawn.build_spawn_packet(spawn_request(si),func(_tag: String) -> float: return 0.5,func(_x: float,_y: float,_r: float) -> bool: return true,Callable(),provider_for(si))
		if si<10: check(var_to_bytes(packet)==var_to_bytes(before),"CH1/CH2 packet bytes unchanged")
		else:
			before["fields"]["col"]=row["col"]
			check(var_to_bytes(packet)==var_to_bytes(before),"only original col changes for elemental bosses")
	for provider in [InvalidElement,NegativeElement,FloatElement,MissingElement]:
		var calls: Array=[]
		var rejected: Dictionary=Spawn.build_spawn_packet(spawn_request(10),func(tag: String) -> float: calls.append(tag);return 0.5,func(_x: float,_y: float,_r: float) -> bool: calls.append("collision");return true,Callable(),provider)
		check(rejected["status"]=="NOT_READY" and rejected["reason"]=="boss_element_unsupported","invalid element rejected")
		check(calls.is_empty(),"invalid element consumes no RNG/read")
func consume(row: Dictionary) -> Dictionary:
	var before: Dictionary=row.duplicate(true)
	var started: Dictionary=Move.begin_tick(int(row["si"]),row["checkpoint"],row["enemy"],row["sp"],row["player"],row["context"],provider_for(int(row["si"])))
	check(started["status"]=="READY","begin source snapshot")
	if started["status"]!="READY": return started
	var baseline_token: Dictionary={}
	if row["si"]<4:
		var baseline_started: Dictionary=baseline_move.begin_tick(int(row["si"]),row["checkpoint"],row["enemy"],row["sp"],row["player"],row["context"])
		check(var_to_bytes(started)==var_to_bytes(baseline_started),"CH1 default begin bytes")
		baseline_token=baseline_started["continuation"]
	var token: Dictionary=started["continuation"]
	var response: Variant=null
	var events: Array=[]
	var cursor: Array=[0]
	var contacts: int=0
	var collision: int=0
	var globals: Dictionary={"shake":71,"_flashT":99,"_flashCol":"keep"}
	var result: Dictionary={}
	for guard in range(40):
		var token_before: Dictionary=token.duplicate(true)
		var prior_cursor: int=cursor[0]
		result=Move.next_tick(token,response,func(_tag: String) -> Variant:
			var u: Variant=row["units"][cursor[0]%row["units"].size()]
			cursor[0]+=1
			return u)
		if row["si"]<4:
			var baseline_cursor: Array=[prior_cursor]
			var baseline_result: Dictionary=baseline_move.next_tick(baseline_token,response,func(_tag: String) -> Variant:
				var u: Variant=row["units"][baseline_cursor[0]%row["units"].size()]
				baseline_cursor[0]+=1
				return u)
			check(var_to_bytes(result)==var_to_bytes(baseline_result),"CH1 default next bytes, including continuation")
			check(cursor[0]==baseline_cursor[0],"CH1 byte baseline RNG cursor")
			baseline_token=baseline_result.get("continuation",{}) if baseline_result.get("continuation")!=null else {}
		check(token==token_before,"continuation read-only")
		if result["status"]!="READY": return result
		check(result["full_tick_complete"]==false,"no full tick/combat claim")
		events.append_array(result["events"])
		for event: Dictionary in result["events"]:
			if event["kind"]=="global_write": globals[event["field"]]=event["value"]
		if result["done"]: break
		var command: Dictionary=result["command"]
		check(command["executed"]==false,"unexecuted request")
		response={"ack":true}
		match command["command"]:
			"canMv":
				response["value"]=row["collision"][collision%row["collision"].size()]
				collision+=1
			"_ffDir": response["value"]=row["flow"]
			"_T": response["value"]="translated:"+command["args"][0]
			"resolve_boss_movement_contact":
				check(contacts<row["responses"].size(),"source owner readback exists")
				if contacts>=row["responses"].size(): return {"status":"NOT_READY","reason":"fixture_missing"}
				var authority: Dictionary=row["responses"][contacts]
				response["enemy_after"]=authority["enemy_after"]
				response["player_after"]=authority["player_after"]
				cursor[0]=int(authority["cursor_after"])
				contacts+=1
			_: cursor[0]+=int(row["nested"])
		token=result["continuation"]
	check(row==before,"all source inputs read-only")
	result["all_events"]=events
	result["globals"]=globals
	result["cursor"]=cursor[0]
	result["contacts"]=contacts
	return result
func equivalent(a: Variant,b: Variant,path: String="") -> bool:
	if a is Dictionary and b is Dictionary:
		if a.size()!=b.size(): return false
		for key in b:
			if not a.has(key) or not equivalent(a[key],b[key],path+"/"+str(key)): return false
		return true
	if a is Array and b is Array:
		if a.size()!=b.size(): return false
		for i in range(b.size()):
			if not equivalent(a[i],b[i],path+"/"+str(i)): return false
		return true
	if (a is int or a is float) and (b is int or b is float):
		if original_integer_paths.has(path): return a==b
		return abs(float(a)-float(b))<=1e-12*maxf(1.0,abs(float(b)))
	return typeof(a)==typeof(b) and a==b

func _test_boundaries() -> void:
	scenario="chapter arguments and continuations"
	var e: Dictionary={"ib":true,"etype":0,"s":"bossChargeWind","x":0,"y":0,"r":44,"st2":18,"facing":0,"atk":46,"el":2,"col":"#3388ff"}
	var p: Dictionary={"x":0,"y":100,"r":12,"iframes":0,"s":"idle"}
	for si in [-1,0,3,4,9,10,13,14,35]:
		var default_result: Dictionary=Move.begin_tick(si,"state",e,1,p)
		check(var_to_bytes(default_result)==var_to_bytes(baseline_move.begin_tick(si,"state",e,1,p)),"default stage success/error bytes "+str(si))
		var result: Dictionary=Move.begin_tick(si,"state",e,1,p,{},Bridge)
		check((result["status"]=="READY")== (si>=4 and si<=9),"real CH2 stage boundary "+str(si))
		if result["status"]!="READY": continue
		var token: Dictionary=result["continuation"]
		var next: Dictionary=Move.next_tick(token)
		check(next["status"]=="READY" and next["done"] and next["enemy"]["facing"]==PI/2,"non-druid real si tracks at18")
		for field: String in ["_chapter_catalog","_chapter_catalog_path","_chapter_source_hash"]:
			var tampered: Dictionary=token.duplicate(true)
			tampered.erase(field)
			check(Move.next_tick(tampered)["status"]=="NOT_READY","missing chapter binding "+field)
		for field: String in ["_chapter_catalog_path","_chapter_source_hash"]:
			var tampered: Dictionary=token.duplicate(true)
			tampered[field]="forged"
			check(Move.next_tick(tampered)["status"]=="NOT_READY","forged chapter binding "+field)
		var moved: Dictionary=token.duplicate(true)
		moved["si"]=0
		check(Move.next_tick(moved)["status"]=="NOT_READY","CH2 continuation rejects CH1 si")
		moved=token.duplicate(true)
		moved["_chapter_catalog"]=null
		check(Move.next_tick(moved)["status"]=="NOT_READY","explicit null cannot impersonate bound provider")
	for provider in [false,1,{},"chapter3",Spawn]:
		check(Move.begin_tick(10,"state",e,1,p,{},provider)["status"]=="NOT_READY","invalid provider denied")
	var default_token: Dictionary=Move.begin_tick(0,"state",e,1,p)["continuation"]
	for si in [-1,4,10,35]:
		var bad: Dictionary=default_token.duplicate(true)
		bad["si"]=si
		check(var_to_bytes(Move.next_tick(bad))==var_to_bytes(baseline_move.next_tick(bad)),"CH1 invalid next bytes "+str(si))
	for si in [-1,0,3,4,9,10,13,14,35]:
		var boundary: Dictionary=Move.begin_tick(si,"state",e,1,p,{},Ch3Fixture)
		check((boundary["status"]=="READY")==(si>=10 and si<=13),"CH3 fixture chapter boundary "+str(si))
	for si in [10,11,12,13]:
		var result: Dictionary=Move.begin_tick(si,"state",e,1,p,{},Ch3Fixture)
		check(result["status"]=="READY","CH3 explicit fixture accepted")
		var next: Dictionary=Move.next_tick(result["continuation"])
		check(next["status"]=="READY" and next["done"] and next["enemy"]["facing"]==PI/2,"CH3 does not alias druid lock")
func check(ok: bool,message: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		printerr("BC_INTEG_01_FAIL ",scenario," ",message)
func finish() -> void:
	print("BC_INTEG_01_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"source_cases":source_cases,"source_events":source_events,"source_rng_draws":source_draws,"protected_contact_requests":source_contacts,"damage_or_parry_evidence":false,"userdir":OS.get_user_data_dir()}))
	quit(0 if failures==0 else 1)
