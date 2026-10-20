extends SceneTree
## BC3-01r: independent current game.html oracle; no live combat evidence.
const Catalog = preload("res://scripts/native_ch3_boss_catalog.gd")
const Shared = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const USERDIR = "EXODUSER-bc3-01r-Isolated-20261020"
const HASH = "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
var assertions := 0
var failures := 0
var node_bin := ""
var source_game := ""
var fixture_path := ""
var expected: Dictionary = {}

func _initialize() -> void:
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="): node_bin=arg.trim_prefix("--node-bin=")
		if arg.begins_with("--source-game="): source_game=arg.trim_prefix("--source-game=")
	call_deferred("_run")

func check(ok: bool, label: String) -> void:
	assertions+=1
	if not ok:
		failures+=1
		printerr("BC3_01R_FAIL ",label)

func _run() -> void:
	check(ProjectSettings.get_setting("application/config/use_custom_user_dir",false)==true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name","")==USERDIR \
		and OS.get_user_data_dir().get_file()==USERDIR,"isolated settings and actual userdir")
	check(not node_bin.is_empty() and FileAccess.file_exists(node_bin),"explicit --node-bin")
	check(not source_game.is_empty() and FileAccess.get_sha256(source_game)==HASH,"explicit latest --source-game bytes")
	if failures>0: finish(); return
	fixture_path=OS.get_user_data_dir().path_join("bc3-01r-원본-fixture.json")
	if FileAccess.file_exists(fixture_path): DirAccess.remove_absolute(fixture_path)
	var output: Array = []
	var exit_code: int = OS.execute(node_bin,PackedStringArray([
		ProjectSettings.globalize_path("res://tests/bc3_01_source_oracle.cjs"),source_game,fixture_path]),output,true)
	var joined: String = "".join(output)
	check(exit_code==0,"original-only Node oracle: "+joined.left(500))
	check(FileAccess.file_exists(fixture_path),"fresh UTF-8 fixture")
	if failures>0: finish(); return
	var raw: Variant = JSON.parse_string(FileAccess.get_file_as_string(fixture_path))
	var summary: Variant = JSON.parse_string(joined.strip_edges())
	check(raw is Dictionary and summary is Dictionary,"UTF-8 file and joined output parse")
	if not raw is Dictionary or not summary is Dictionary: finish(); return
	var decoded: Variant = _decode(raw)
	check(decoded is Dictionary,"typed integer/binary64 oracle decode")
	if not decoded is Dictionary: finish(); return
	expected=decoded
	check(expected["source_game_sha256"]==HASH and summary.get("source_only")==true,"independent receipt")
	check(expected["moves"].size()==37 and expected["combos"].size()==44,"oracle union sizes")
	var before: Dictionary = Catalog._read_shared()
	check(before["moves"].size()==30 and before["combos"].size()==36,"real CH2 public API supplies 30/36")
	seed(31012026)
	var expected_rand: int = randi()
	seed(31012026)
	var nodes_before: int = int(Performance.get_monitor(Performance.OBJECT_NODE_COUNT))
	_registration()
	_copy_isolation()
	_dependency_failures(before)
	check(randi()==expected_rand,"catalog queries and failure fixtures consume no shared RNG")
	check(int(Performance.get_monitor(Performance.OBJECT_NODE_COUNT))==nodes_before,"no scene nodes created")
	_verify(Catalog._read_shared(),before,"CH2 unchanged after queries/fixtures")
	check(Context.resolve(Catalog).get("ready")==true,"existing explicit chapter context accepts receipt")
	var body: String = FileAccess.get_file_as_string("res://scripts/native_ch3_boss_catalog.gd")
	for forbidden: String in ["FileAccess","DirAccess","OS.","HTTPRequest","randf(","randi(","seed(",
		"Node.new","SceneTree","user://","func _process","func _physics_process"]:
		check(not body.contains(forbidden),"no runtime/IO/RNG entry "+forbidden)
	finish()

func _decode(value: Variant) -> Variant:
	if value is Dictionary:
		if value.size()==1 and value.has("integer"):
			check(value["integer"] is String and value["integer"].is_valid_int(),"integer transport")
			return int(value["integer"])
		if value.size()==1 and value.has("binary64"):
			var bytes: PackedByteArray = str(value["binary64"]).hex_decode()
			check(bytes.size()==8,"binary64 transport")
			return bytes.decode_double(0) if bytes.size()==8 else NAN
		var result: Dictionary = {}
		for key: String in value: result[key]=_decode(value[key])
		return result
	if value is Array:
		var result: Array = []
		for item: Variant in value: result.append(_decode(item))
		return result
	return value

func _verify(actual: Variant, wanted: Variant, label: String) -> void:
	check(typeof(actual)==typeof(wanted),label+" type")
	if typeof(actual)!=typeof(wanted): return
	if wanted is Dictionary:
		check(actual.size()==wanted.size(),label+" key count")
		for key: Variant in wanted:
			check(actual.has(key),label+" key "+str(key))
			if actual.has(key): _verify(actual[key],wanted[key],label+"."+str(key))
	elif wanted is Array:
		check(actual.size()==wanted.size(),label+" length")
		for i in range(mini(actual.size(),wanted.size())): _verify(actual[i],wanted[i],label+"["+str(i)+"]")
	elif wanted is float:
		var a: PackedByteArray = PackedByteArray();a.resize(8);a.encode_double(0,actual)
		var b: PackedByteArray = PackedByteArray();b.resize(8);b.encode_double(0,wanted)
		check(a==b,label+" exact binary64")
	else: check(actual==wanted,label+" exact value")

func _registration() -> void:
	var receipt: Dictionary = Catalog.source_receipt()
	check(receipt.get("ready")==true and receipt.get("status")=="READY","ready receipt")
	check(receipt["source_game_sha256"]==HASH and receipt["source_main"]=="249c26fad989071a94c19128e524ce0bbcb2c8c9","source and main receipt")
	check(receipt["dependency_sha"]=="a3b5391c54bb62b9f784bf2acac12bfbd2747192","adopted dependency SHA")
	for pair: Array in [["global_move_count",59],["global_combo_count",68],["phase_count",5],
		["ch3_union_count",37],["common_move_count",30],["new_move_count",7],["combo_union_count",44],
		["common_combo_count",36],["new_combo_count",8],["max_ch3_source_idx",56]]:
		check(receipt.get(pair[0])==pair[1],"receipt "+str(pair[0]))
	check(not receipt["live_combat_connected"] and not receipt["save_io"] and receipt["rng_draws"]==0,"registration-only scope")
	_verify(receipt["move_manifest"],expected["manifest"],"global59 manifest passed through")
	_verify(receipt["stages"],[10,11,12,13],"stage receipt")
	for row in range(4):
		var si: int = 10+row
		var boss: Dictionary = Catalog.boss_for_stage(si)
		_verify(boss,expected["stages"][row],"boss and Set insertion order si"+str(si))
		var wanted_moves: Array = []
		for move: Dictionary in expected["moves"]:
			if expected["stages"][row]["move_ids"].has(move["id"]): wanted_moves.append(move)
		_verify(Catalog.moves_for_stage(si),wanted_moves,"all13 fields in global ordinal order si"+str(si))
		for phase in range(5):
			_verify(Catalog.combos_for_stage(si,phase),expected["stage_combos"][row][phase],"all combo fields si%d phase%d"%[si,phase])
	for move: Dictionary in expected["moves"]:
		_verify(Catalog.move_by_id(move["id"]),move,"union by id "+move["id"])
	for phase in range(5): _verify(Catalog.phase_by_index(phase),expected["phases"][phase],"all8 phase fields "+str(phase))
	for si in [-2147483648,-1,0,9,14,34,35,2147483647]:
		_verify(Catalog.boss_for_stage(si),{"supported":false,"reason":"unsupported_chapter_stage","si":si},"unsupported stage")
		check(Catalog.moves_for_stage(si).is_empty() and Catalog.combos_for_stage(si,0).is_empty(),"unsupported stage arrays")
	for phase in [-2147483648,-1,5,2147483647]:
		check(Catalog.phase_by_index(phase).is_empty() and Catalog.combos_for_stage(10,phase).is_empty(),"unsupported phase")
	for id: String in ["","unknown","cageTrap","tailSwipe","burrowStrike","poisonTrail","wallPush","meteor","burstCounter"]:
		check(Catalog.move_by_id(id).is_empty(),"excluded CH3 id "+id)
	check(Catalog.move_by_id("delaySlash")["combo"].has("swordWave") and Catalog.move_by_id("tidalWipe")["combo"].has("wallPush"),"out-of-Set combo hints preserved")
	check(Catalog.move_by_id("beanStorm")["idx"]==17 and Catalog.move_by_id("beanStorm")["source_ordinal"]==18,"idx not ordinal")

func _copy_isolation() -> void:
	var boss: Dictionary = Catalog.boss_for_stage(10);boss["move_ids"].clear()
	_verify(Catalog.boss_for_stage(10),expected["stages"][0],"boss detached")
	var moves: Array = Catalog.moves_for_stage(13)
	moves[0]["combo"].clear();moves[0]["range"][0]=-999;moves.clear()
	_verify(Catalog.moves_for_stage(13)[0],expected["moves"][0],"moves detached")
	var move: Dictionary = Catalog.move_by_id("laser");move["phase"].clear();move["tags"].clear()
	_verify(Catalog.move_by_id("laser"),_expected_move("laser"),"own move detached")
	var phase: Dictionary = Catalog.phase_by_index(0);phase["hp"].clear()
	_verify(Catalog.phase_by_index(0),expected["phases"][0],"shared phase detached")
	var combos: Array = Catalog.combos_for_stage(13,4)
	combos[0]["seq"].clear();combos[0]["phase"].clear();combos.clear()
	_verify(Catalog.combos_for_stage(13,4),expected["stage_combos"][3][4],"combos detached")
	var receipt: Dictionary = Catalog.source_receipt()
	receipt["move_manifest"][0]["id"]="bad";receipt["stages"].clear();receipt["source_ranges"]["moves"].clear()
	_verify(Catalog.source_receipt()["move_manifest"],expected["manifest"],"receipt nested manifest detached")
	_verify(Catalog.boss_for_stage(11),expected["stages"][1],"cross-stage detached")

func _expected_move(id: String) -> Dictionary:
	for move: Dictionary in expected["moves"]:
		if move["id"]==id: return move
	return {}

func _reject(snapshot: Dictionary, label: String) -> void:
	var before: String = var_to_str(snapshot)
	var result: Dictionary = Catalog._assemble_snapshot(snapshot)
	check(result.get("ready")==false and result.get("status")=="NOT_READY" \
		and str(result.get("reason","")).begins_with("dependency_unready:"),"dependency failure explicit "+label)
	check(not result.has("moves") and not result.has("phases") and not result.has("combos"),"no partial data "+label)
	check(var_to_str(snapshot)==before,"failure input unchanged "+label)

func _dependency_failures(original: Dictionary) -> void:
	for key: String in ["receipt","moves","phases","combos"]:
		var snap: Dictionary = original.duplicate(true);snap.erase(key);_reject(snap,"missing "+key)
	for key: String in ["ready","source_game_sha256","global_move_count","global_combo_count","phase_count","move_manifest"]:
		var snap: Dictionary = original.duplicate(true);snap["receipt"].erase(key);_reject(snap,"receipt "+key)
	var unready: Dictionary = original.duplicate(true);unready["receipt"]["ready"]=false;_reject(unready,"receipt false")
	var wrong_hash: Dictionary = original.duplicate(true);wrong_hash["receipt"]["source_game_sha256"]="wrong";_reject(wrong_hash,"hash mismatch")
	for key: String in ["id","idx","source_ordinal","source_line"]:
		var snap: Dictionary = original.duplicate(true);snap["receipt"]["move_manifest"][0].erase(key);_reject(snap,"manifest "+key)
	var manifest: Dictionary = original.duplicate(true);manifest["receipt"]["move_manifest"][58]["idx"]=999;_reject(manifest,"unowned manifest identity changed")
	for key: String in ["id","idx","source_ordinal","source_line","tele","rec","canFeint","canDelay","range","phase","combo","tags","cd"]:
		var snap: Dictionary = original.duplicate(true);snap["moves"]["slashCombo"].erase(key);_reject(snap,"move "+key)
	for id: String in expected["common_ids"]:
		var snap: Dictionary = original.duplicate(true);snap["moves"].erase(id);_reject(snap,"common move missing "+id)
	var wrong: Dictionary = original.duplicate(true);wrong["moves"]["slashCombo"]["idx"]=999;_reject(wrong,"move identity")
	var nonfinite: Dictionary = original.duplicate(true);nonfinite["moves"]["slashCombo"]["tele"]=NAN;_reject(nonfinite,"move nonfinite")
	var bad_range: Dictionary = original.duplicate(true);bad_range["moves"]["slashCombo"]["range"]=[1];_reject(bad_range,"range shape")
	var bad_phase: Dictionary = original.duplicate(true);bad_phase["moves"]["slashCombo"]["phase"]=[5];_reject(bad_phase,"phase member")
	for key: String in ["hp","spdM","teleM","cdM","comboC","feintC","delayC","label"]:
		var snap: Dictionary = original.duplicate(true);snap["phases"][0].erase(key);_reject(snap,"phase "+key)
	for ordinal: int in expected["common_combo_ordinals"]:
		var snap: Dictionary = original.duplicate(true);snap["combos"].erase(ordinal);_reject(snap,"common combo missing "+str(ordinal))
	for key: String in ["seq","phase","source_ordinal","source_line"]:
		var snap: Dictionary = original.duplicate(true);snap["combos"][0].erase(key);_reject(snap,"combo "+key)
	var conflict: Dictionary = original.duplicate(true);conflict["combos"][0]["seq"]=["not_common"];_reject(conflict,"unowned combo move")
	var read_error: Dictionary = original.duplicate(true);read_error["error"]="conflicting_common_combo";_reject(read_error,"conflicting public retrieval")
	# Different source ordinals may have equal sequences; only repeat retrieval is collapsed.
	var repeated: Dictionary = original.duplicate(true)
	repeated["combos"][3]["seq"]=repeated["combos"][0]["seq"].duplicate()
	var repeated_before: String = var_to_str(repeated)
	var assembled: Dictionary = Catalog._assemble_snapshot(repeated)
	check(assembled.get("ready")==true and assembled["combos"].size()==44,"equal seq different ordinals retained")
	check(assembled["combos"][0]["source_ordinal"]==0 and assembled["combos"][1]["source_ordinal"]==3 \
		and assembled["combos"][0]["seq"]==assembled["combos"][1]["seq"],"ordinal order and no seq dedup")
	check(var_to_str(repeated)==repeated_before,"valid assembly input unchanged")

func finish() -> void:
	if not fixture_path.is_empty() and FileAccess.file_exists(fixture_path): DirAccess.remove_absolute(fixture_path)
	print("BC3_01R_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skip":0,
		"stages":4,"union_moves":37,"new_moves":7,"combo_union":44,"new_combos":8,
		"userdir":OS.get_user_data_dir(),"live_combat_verified":false}))
	quit(0 if failures==0 else 1)
