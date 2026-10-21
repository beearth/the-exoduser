extends SceneTree
## BC2-04: source VM -> self-owned UTF-8 fixture -> pure state packet comparison.
const Vortex = preload("res://scripts/native_ch2_boss_vortex.gd")
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const USERDIR = "EXODUSER-bc2-04-Isolated-20261020"
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
		printerr("BC2_04_FAIL ",label," ",message)
func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR and OS.get_user_data_dir().get_file()==USERDIR,"isolated settings and actual path")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"--node-bin required")
	check(not source_path.is_empty() and FileAccess.get_sha256(source_path)==HASH,"--source-game exact bytes required")
	if failures>0: finish();return
	var target: String=OS.get_user_data_dir().path_join("bc2-04-원본-fixture.json")
	if FileAccess.file_exists(target): DirAccess.remove_absolute(target)
	var output: Array=[]
	var code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/bc2_04_source_oracle.cjs"),source_path,target]),output,true)
	check(code==0,"Node exit0: "+"".join(output).left(300))
	check(FileAccess.file_exists(target),"fresh UTF-8 fixture exists")
	if failures>0: finish();return
	var data: Variant=JSON.parse_string(FileAccess.get_file_as_string(target))
	check(data is Dictionary,"UTF-8 JSON decode")
	if not data is Dictionary: finish();return
	check(data["game_sha256"]==HASH and data["source_only"],"independent source receipt")
	summary=data["summary"]
	check(summary["cases"]==data["cases"].size(),"fixture inventory")
	check(Vortex.source_receipt()["ready"] and Vortex.source_receipt()["states"]==["bossVortexWind","bossVortex"],"owned states ready")
	for row: Dictionary in data["cases"]:
		label=row["name"]+" si"+str(row["si"])+" "+row["enemy"]["s"]+" t"+str(row["enemy"]["st2"])
		row["units"]=[]
		for bits: String in row["unit_bits"]: row["units"].append(bits.hex_decode().decode_double(0))
		var result: Dictionary=consume(row)
		check(result["status"]=="READY","source case READY")
		if result["status"]!="READY": continue
		check(result.get("done",false),"driver reached end")
		for key: String in ["enemy","player","globals","cursor","collision_reads"]:
			check(equivalent(result[key],row["expected"][key]),"source "+key)
		check(equivalent(result["all_events"],row["expected"]["events"]),"complete source write/query/KB/damage/particle/RNG order")
		check(result["contacts"]==row["responses"].size(),"all protected fixture readbacks consumed")
	_boundaries()
	finish()
func consume(row: Dictionary) -> Dictionary:
	var enemy_before: Dictionary=row["enemy"].duplicate(true)
	var player_before: Dictionary=row["player"].duplicate(true)
	var started: Dictionary=Vortex.begin_tick(int(row["si"]),row["enemy"],row["sp"],row["player"],row["options"])
	check(started["status"]=="READY","begin READY")
	if started["status"]!="READY": return started
	var token: Dictionary=started["continuation"]
	var response: Variant=null
	var events: Array=[]
	var cursor: Array=[0]
	var collisions: int=0
	var contacts: int=0
	var globals: Dictionary={"shake":71}
	var result: Dictionary={}
	for guard in range(40):
		var before: Dictionary=token.duplicate(true)
		result=Vortex.next_tick(token,response,func(_tag: String) -> Variant:
			var u: Variant=row["units"][cursor[0]%row["units"].size()];cursor[0]+=1;return u)
		check(equivalent(token,before),"caller continuation immutable")
		if result["status"]!="READY": return result
		check(result["full_tick_complete"]==false,"no complete updateE claim")
		events.append_array(result["events"])
		for event: Dictionary in result["events"]:
			if event["kind"]=="global_write": globals[event["field"]]=event["value"]
		if result["done"]: break
		var cmd: Dictionary=result["command"]
		check(cmd["executed"]==false,"request unexecuted")
		response={"ack":true} # Fixture ack only, never actual owner success.
		if cmd["command"]=="canMv":
			check(collisions<row["collisions"].size(),"source collision read available")
			response["value"]=row["collisions"][collisions];collisions+=1
		elif cmd["command"]=="resolve_vortex_damage":
			check(contacts<row["responses"].size(),"source protected readback exists")
			if contacts>=row["responses"].size(): return {"status":"NOT_READY","reason":"fixture_damage_missing"}
			var authority: Dictionary=row["responses"][contacts]
			check(equivalent(cmd,authority["command"]),"exact protected formula/options descriptor")
			var formula: Dictionary=cmd["args"][0]["hurtP_formula"]
			check(Common._i32(formula["atk"]*formula["multiplier"]*authority["element_multiplier"])==authority["resolved_damage"],"source ToInt32 AFTER elMul (fixture owner only)")
			response["enemy_after"]=authority["enemy_after"]
			response["player_after"]=authority["player_after"]
			cursor[0]=int(authority["cursor_after"]);contacts+=1
		else: cursor[0]+=int(row["nested"])
		token=result["continuation"]
	check(equivalent(row["enemy"],enemy_before) and equivalent(row["player"],player_before),"actor/player input snapshots immutable")
	result["all_events"]=events;result["globals"]=globals;result["cursor"]=cursor[0];result["contacts"]=contacts;result["collision_reads"]=collisions
	return result
func _enemy(state: String="bossVortex") -> Dictionary:
	return {"x":10,"y":20,"r":44,"facing":0,"st2":0,"atk":46,"el":0,"speed":0,"_bossPhase":2,"s":state}
func _player() -> Dictionary:
	return {"x":30,"y":20,"r":12,"iframes":0,"s":"idle","kb":{"x":0,"y":0}}
func _options() -> Dictionary: return {"now_msec":12345.5,"shake":100}
func _boundaries() -> void:
	label="input / owner / RNG / clock boundaries"
	for si in [-1,0,3,10,34]: check(Vortex.begin_tick(si,_enemy(),1,_player(),_options())["status"]=="NOT_READY","CH2 stage guard")
	check(Vortex.begin_tick(4,_enemy("recover"),1,_player(),_options())["status"]=="NOT_READY","state owner guard")
	for key: String in ["speed","_bossPhase","x"]:
		var e: Dictionary=_enemy();e.erase(key);check(Vortex.begin_tick(4,e,1,_player(),_options())["status"]=="NOT_READY","full actor snapshot required")
	var p: Dictionary=_player();p.erase("kb");check(Vortex.begin_tick(4,_enemy(),1,p,_options())["status"]=="NOT_READY","full KB snapshot required")
	check(Vortex.begin_tick(4,_enemy(),1,_player())["reason"]=="clock_or_option_reader_missing","explicit time/options required")
	var wind: Dictionary=Vortex.begin_tick(4,_enemy("bossVortexWind"),2,_player())["continuation"]
	check(wind["enemy"]["st2"]==0,"shared st2 clock not decremented again")
	check(Vortex.next_tick(wind)["reason"]=="rng_provider_missing","wind missing RNG")
	for unit in [-.1,1.0,null,"0.5",INF,NAN]:
		var got: Dictionary=Vortex.next_tick(wind,null,func(_tag: String) -> Variant: return unit)
		check(got["status"]=="NOT_READY" and got["enemy"]==null and got["player"]==null and got["command"]==null,"invalid RNG has no partial packet")
	var token: Dictionary=Vortex.begin_tick(4,_enemy(),1,_player(),_options())["continuation"]
	for key: String in ["owner","si","version","_chapter_catalog_path","_chapter_source_hash","_chapter_catalog","step","pending"]:
		var bad: Dictionary=token.duplicate(true)
		match key:
			"si": bad[key]=3
			"version": bad[key]=2
			"_chapter_catalog": bad.erase(key)
			_: bad[key]="wrong"
		check(Vortex.next_tick(bad)["status"]=="NOT_READY","bad token rejected "+key)
	var first: Dictionary=Vortex.next_tick(token)
	check(first["command"]["command"]=="canMv","collision is first active request")
	for reply in [null,{}, {"ack":false},true]: check(Vortex.next_tick(first["continuation"],reply)["reason"]=="owner_ack_missing","no synthetic ack")
	check(Vortex.next_tick(first["continuation"],{"ack":true})["reason"]=="collision_result_missing","explicit collision value required")
	var hit: Dictionary=Vortex.next_tick(first["continuation"],{"ack":true,"value":true})
	check(hit["command"]["command"]=="resolve_vortex_damage","explicit protected boundary")
	for reply in [{"ack":true},{"ack":true,"enemy_after":_enemy()},{"ack":true,"enemy_after":{},"player_after":_player()}]:
		check(Vortex.next_tick(hit["continuation"],reply)["reason"]=="protected_damage_owner_readback_missing","no fabricated damage readback")
	check(Vortex.next_tick({})["status"]=="NOT_READY","manufactured continuation rejected")
func finish() -> void:
	print("BC2_04_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"oracle_summary":summary,"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
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
