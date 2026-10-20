extends SceneTree
## META-01 pure policy only. No Main/State fixture and no product caller patch.
## Golden values: actual game.html _calcMaxExp, f84e26ee0:43128-43133.
## Run with --log-file <own output path>; Main is never booted, override not needed.
const CURVE = preload("res://scripts/native_source_meta_exp_curve.gd")
const USERDIR = "EXODUSER-meta-01-Isolated-20261020"
const GOLDEN = [
	[1, 17], [2, 20], [3, 23], [5, 28], [10, 45], [50, 278],
	[99, 830], [100, 845], [500, 22688], [998, 141839], [999, 142258],
	[1000, 5010000], [1001, 5040000], [1002, 5090000],
	[1461, 2139440000], [1462, 2148690000], [1500, 2515010000],
]

var assertions := 0
var failures := 0

func _initialize() -> void:
	# Pure test has no user:// IO. Keep even its reported path task-isolated.
	ProjectSettings.set_setting("application/config/use_custom_user_dir", true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name", USERDIR)
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("META01_FAIL ", label)

func _run() -> void:
	_check(OS.get_user_data_dir().get_file() == USERDIR, "task user directory")
	for pair in GOLDEN:
		var actual: int = CURVE.required_exp(pair[0])
		_check(actual == pair[1], "level %d: expected %d, actual %d" % [pair[0], pair[1], actual])
	_check(CURVE.required_exp(1461) < 2147483647 and CURVE.required_exp(1462) > 2147483647,
		"1461/1462 straddle signed32 without wrapping")
	# Export actual module outputs for an external comparison with the extracted JS
	# function, rather than duplicating its formula as a second GDScript oracle.
	var values: Array[int] = []
	var increasing := true
	var previous := 0
	for level in range(1, 1501):
		var value: int = CURVE.required_exp(level)
		increasing = increasing and value > previous
		values.append(value)
		previous = value
	_check(increasing, "positive, strictly increasing over verified levels 1..1500")
	print("META01_CURVE_VALUES ", JSON.stringify(values))
	print("META01_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"skipped": [], "golden_samples": GOLDEN.size(), "source_compare_values": values.size(),
		"isolated_directory": OS.get_user_data_dir(), "main_booted": false,
		"product_caller_connected": false, "save_io": false}))
	quit(1 if failures > 0 else 0)
