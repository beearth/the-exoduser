extends SceneTree
const USERDIR := "EXODUSER-qa-007b-Isolated-20261020"
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
const READER = preload("res://port_modules/save_adapter/source_slot_reader.gd")
var checks := 0
var failures := 0

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("QA007B_TRANSPORT_FAIL ", label)

func pending_files() -> Array:
	var files: Array = []
	for file in DirAccess.get_files_at(OS.get_user_data_dir()):
		if file.begins_with("qa007-oracle-"): files.append(file)
	files.sort()
	return files

func _initialize() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		quit(2)
		return
	var fixture := ProjectSettings.globalize_path("res://../tools/qa007b_transport_fixture.cjs")
	var before := pending_files()
	var packet := TRANSPORT.execute_file(TRANSPORT.node_binary(), fixture, "normal")
	check(packet.code == 0 and packet.data is Dictionary, "file transport succeeds despite invalid stdout")
	check(packet.diagnostics.contains("???") and packet.diagnostics.contains("not JSON"), "corrupted/chunked console is actually present")
	if packet.data is Dictionary:
		check(packet.data.text == "한글 가😀 끝", "UTF-8 Korean and supplementary character intact")
		check(packet.data.nested == [0.0, false, null, "따옴표\"\\\n"], "nested values and escapes intact")
		var parsed: Dictionary = READER.parse_fixture_json(packet.data.json.raw)
		check(parsed.status == "READY", "original slot reader parses ASCII Unicode escapes")
		check(parsed.get("value") == packet.data.json.expected and parsed.get("value") == {"x":"가😀"}, "strict_json_boundaries JSON.x exact match through UTF-8 file")
	check(pending_files() == before, "success removes only its temporary output")
	for mode in ["missing", "malformed", "failed"]:
		var rejected := TRANSPORT.execute_file(TRANSPORT.node_binary(), fixture, mode)
		check(rejected.code != 0 and rejected.data == null, mode + " cannot fall back to console or claim success")
		check(pending_files() == before, mode + " leaves no temporary output")
	var document := JSON.stringify({"x":"가😀", "nested":[false,null,"끝"]})
	var expected: Variant = JSON.parse_string(document)
	for split in range(1, document.length()):
		check(TRANSPORT.decode_output([document.left(split), document.substr(split)]) == expected, "every split boundary " + str(split))
	var broken: Variant = TRANSPORT.decode_output(['{"x":', '"???"}'])
	check(broken is Dictionary and broken.x == "???" and broken != {"x":"가😀"}, "joining cannot repair a valid but codepage-corrupted Unicode value")
	check(TRANSPORT.decode_output(['{"x":','???}']) == null, "invalid corrupted console JSON rejected")
	print("QA007B_TRANSPORT_RESULT ", JSON.stringify({"checks":checks,"failures":failures,"skipped":[]}))
	quit(0 if failures == 0 else 1)
