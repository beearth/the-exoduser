extends SceneTree
## Pure META-02 tests. No Main/State, RNG injection, wallet or equipment fixture.
## Golden costs are source-derived; exported actuals are also compared to real JS.
const POLICY = preload("res://scripts/native_meta_enhancement_policy.gd")
const USERDIR = "EXODUSER-meta-02-Isolated-20261020"
const RAW_CASES = [[-2, 20000], [-1, 24750], [0, 30000], [0.0001, 30001],
	[0.5, 32625], [1, 35250], [2, 40500], [100, 555000], [1000, 5280000],
	[9999, 52524750], [1000000, 5250030000]]
const MALICE_CASES = [[-5, 0], [0, 0], [0.0001, 1], [1, 1], [1.2, 1],
	[2, 1], [2.01, 2], [3, 2], [5, 3], [4294967298, 2147483649]]
const TRANSFER_CASES = [[-1, 0], [0, 0], [0.0001, 1], [0.001, 1], [0.002, 1],
	[0.002001, 2], [1, 500], [100, 50000], [1000, 500000]]
const FLAT_CASES = [[-2, -0.5], [0, 0], [0.5, 0.125], [1, 0.25], [100, 25], [1000, 250]]
const INITIAL_COSTS = [7500, 10500, 15000, 19500, 27000, 27000]
const RARITY_CASES = [
	["ordinary", 0, 0], ["magic", 1, 1], ["rare", 2, 2], ["heroic", 3, 3],
	["legendary", 4, 4], ["unique", 5, 4], ["integral_float", 2.0, 2],
	["numeric_string", "4", 0], ["bool", true, 0], ["null", null, 0],
	["fraction", 2.5, 0], ["negative", -1, 0], ["infinity", INF, 0],
	["nan", NAN, 0], ["huge_float", 1.0e20, 4], ["array", [], 0], ["dictionary", {}, 0],
]

var assertions := 0
var failures := 0

func _initialize() -> void:
	# Main is not booted. Runner also sets the task-isolated override for every run.
	ProjectSettings.set_setting("application/config/use_custom_user_dir", true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name", USERDIR)
	call_deferred("_run")

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("META02_FAIL ", label)

func _near(actual: float, expected: float) -> bool:
	return absf(actual - expected) <= 1.0e-10 * maxf(1.0, absf(expected))

func _run() -> void:
	_check(OS.get_user_data_dir().get_file() == USERDIR, "task user directory")
	for pair in RAW_CASES:
		_check(POLICY.enh_cost_raw(pair[0]) == pair[1], "raw " + str(pair[0]))
	var malice_actuals: Array = []
	for pair in MALICE_CASES:
		var actual: int = POLICY.malice_cost(pair[0])
		_check(actual == pair[1], "discount " + str(pair[0]))
		malice_actuals.append({"value": pair[0], "cost": actual})
	_check(_near(POLICY.enh_rate(0), 99.0) and _near(POLICY.enh_rate(1), 98.01), "percent units")
	_check(POLICY.enh_rate(526) > 0.5 and POLICY.enh_rate(526.5) == 0.5,
		"fractional floor crossing is not enhancement integer truncation")
	for enh in [527, 831, 1000, 9999]:
		_check(POLICY.enh_rate(enh) == 0.5 and POLICY.enh_cost(enh, 2)["rate"] == 0.005,
			"minimum percent/fraction " + str(enh))
	_check(POLICY.enh_rate(-2) > 100.0, "no added success-percent upper cap")
	for rarity in range(INITIAL_COSTS.size()):
		var quote: Dictionary = POLICY.enh_cost(0, rarity)
		_check(quote["cost"] == INITIAL_COSTS[rarity] and _near(quote["rate"], 0.99),
			"initial quote rarity " + str(rarity))
	_check(POLICY.enh_cost(0.5, 2)["cost"] == 16313, "fractional enhancement retained")
	_check(POLICY.enh_cost(0.0001, 2)["cost"] == 15001, "ceil boundary retained")
	_check(POLICY.enh_cost(1000000, 2)["cost"] == 2625015000, "cost above signed32, no 9999 cap")
	var rarity_actuals: Array = []
	for row in RARITY_CASES:
		var economy: int = POLICY.item_economy_rarity(row[1])
		var quote: Dictionary = POLICY.enh_cost(0, row[1])
		_check(economy == row[2] and quote["cost"] == INITIAL_COSTS[int(row[2])],
			"typed rarity " + str(row[0]))
		rarity_actuals.append({"id": row[0], "economy": economy, "quote": quote})
	for pair in FLAT_CASES:
		_check(_near(POLICY.enh_mul(pair[0]), pair[1]) and _near(POLICY.enh_mul_atk(pair[0]), pair[1]),
			"linear DEF/ATK flat " + str(pair[0]))
	for pair in TRANSFER_CASES:
		_check(POLICY.xfer_cost(pair[0]) == pair[1], "transfer " + str(pair[0]))
	# Actual results only, not a second GDScript copy of the source formula.
	var samples: Array = range(1001)
	samples.append_array([-2, -1, 0.0001, 0.002001, 0.5, 526.5, 9999, 1000000])
	var numeric_actuals: Array = []
	for enh in samples:
		var quotes: Array = []
		for rarity in range(6):
			quotes.append(POLICY.enh_cost(enh, rarity))
		numeric_actuals.append({"enh": enh, "raw": POLICY.enh_cost_raw(enh),
			"rate_percent": POLICY.enh_rate(enh), "def_flat": POLICY.enh_mul(enh),
			"atk_flat": POLICY.enh_mul_atk(enh), "transfer": POLICY.xfer_cost(enh), "quotes": quotes})
	print("META02_NUMERIC_VALUES ", JSON.stringify(numeric_actuals))
	print("META02_RARITY_VALUES ", JSON.stringify(rarity_actuals))
	print("META02_MALICE_VALUES ", JSON.stringify(malice_actuals))
	print("META02_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures,
		"skipped": [], "numeric_samples": numeric_actuals.size(), "rarity_samples": rarity_actuals.size(),
		"isolated_directory": OS.get_user_data_dir(), "main_booted": false,
		"product_caller_connected": false, "wallet_or_equipment_write": false, "save_io": false,
		"js_nonnumeric_coercion_supported": false}))
	quit(1 if failures > 0 else 0)
