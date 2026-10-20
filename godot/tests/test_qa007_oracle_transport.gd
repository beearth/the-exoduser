extends SceneTree
const USERDIR := "EXODUSER-qa-007-Isolated-20261020"
const TRANSPORT = preload("res://tests/qa007/oracle_transport.gd")
var checks := 0
var failures := 0

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		printerr("QA007_TRANSPORT_FAIL ", label)

func _initialize() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR:
		quit(2)
		return
	var document := JSON.stringify({"원문": "가😀\\\"\n\t", "nested": [{"x": 1}, false, null], "last": "끝"})
	var expected: Variant = JSON.parse_string(document)
	for split in range(1, document.length()):
		check(TRANSPORT.decode_output([document.left(split), document.substr(split)]) == expected, "every two-chunk boundary " + str(split))
	var chunks: Array = []
	for character in document: chunks.append(character)
	check(TRANSPORT.decode_output(chunks) == expected, "one character per chunk")
	check(TRANSPORT.decode_output([document, " false"]) == null, "extra JSON document rejected")
	check(TRANSPORT.decode_output([document.left(document.length() - 1)]) == null, "truncation rejected")
	check(TRANSPORT.decode_output([]) == null, "empty output rejected")
	print("QA007_TRANSPORT_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "skipped": []}))
	quit(0 if failures == 0 else 1)
