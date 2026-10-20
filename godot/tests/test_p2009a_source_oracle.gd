extends SceneTree

var checks := 0
var failures := 0

func _initialize() -> void:
	var path: String = OS.get_environment("P2009A_ORACLE")
	if path.is_empty():
		print("P2009A_ORACLE_MISSING run tools/verify-p2009a-feedback.cjs first and set P2009A_ORACLE")
		quit(2)
		return
	var oracle: Variant = JSON.parse_string(FileAccess.get_file_as_string(path))
	if not oracle is Dictionary:
		quit(2)
		return
	var effect: Node2D = load("res://scripts/native_level_up_vfx.gd").new()
	effect.active = true
	effect.strength = 1.06
	for entry in oracle.cases:
		if OS.get_environment("P2009A_ORACLE_AUDIO_ONLY") == "1":
			break
		effect.age = float(entry.age)
		var actual: Array = effect.build_plan(entry.front, entry.reduced)
		check(actual.size() == entry.calls.size(), "source stamp count age %s front %s reduced %s" % [entry.age, entry.front, entry.reduced])
		for index in range(mini(actual.size(), entry.calls.size())):
			for field in ["cell", "x", "y", "w", "h", "alpha"]:
				check(absf(float(actual[index][field]) - float(entry.calls[index][field])) < 0.00001, "source stamp value %s age %s" % [field, entry.age])
	var audio: Script = load("res://scripts/native_feedback_audio.gd")
	for key in ["levelup", "pickup"]:
		var plan: Array = audio.source_plan(key)
		check(plan.size() == oracle.audio[key].size(), key + " source layer count")
		for index in range(mini(plan.size(), oracle.audio[key].size())):
			check(plan[index][0] == oracle.audio[key][index][0], key + " layer kind")
			for field in range(1, 8):
				check(absf(float(plan[index][field]) - float(oracle.audio[key][index][field])) < 0.000001, key + " source synthesis parameter")
	effect.free()
	print("P2009A_ORACLE_RESULT ", JSON.stringify({"assertions": checks, "failures": failures, "cases": oracle.cases.size(), "source": oracle.source}))
	quit(1 if failures else 0)

func check(value: bool, label: String) -> void:
	checks += 1
	if not value:
		failures += 1
		print("P2009A_ORACLE_FAIL ", label)
