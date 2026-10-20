extends RefCounted
## Test-only transport; see docs/engine/orders/reports/qa-007_REPORT.md for setup.

static func node_binary() -> String:
	var binary := OS.get_environment("EXODUSER_NODE_BIN")
	if binary.is_empty(): binary = "node"
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--node-bin="): binary = arg.trim_prefix("--node-bin=")
	return binary

static func decode_output(output: Array) -> Variant:
	# OS.execute may split one JSON document across any number of chunks.
	var parser := JSON.new()
	return parser.data if parser.parse("".join(output)) == OK else null

static func execute_file(binary: String, oracle: String, source: String) -> Dictionary:
	var file := OS.get_user_data_dir().path_join("qa007-oracle-%s-%s.json" % [OS.get_process_id(), Time.get_ticks_usec()])
	var output: Array = []
	var code := OS.execute(binary, PackedStringArray([oracle, source, file]), output, true)
	var data: Variant = null
	if code == 0:
		if FileAccess.file_exists(file):
			# Node writes explicit UTF-8 bytes; no Windows console codepage decoding.
			data = JSON.parse_string(FileAccess.get_file_as_string(file))
		else:
			code = ERR_FILE_NOT_FOUND
	if FileAccess.file_exists(file):
		var removal := DirAccess.remove_absolute(file)
		if removal != OK: code = removal
	return {"code": code, "data": data, "diagnostics": "".join(output)}
