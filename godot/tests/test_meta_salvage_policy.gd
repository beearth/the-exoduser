extends SceneTree
## META-03: independent source goldens + actual outputs for a JS-body oracle.
## No Main, live inventory/wallet, RNG, saving or product writer fixture.
const POLICY = preload("res://scripts/native_meta_salvage_policy.gd")
const ENHANCEMENT = preload("res://scripts/native_meta_enhancement_policy.gd")
const USERDIR := "EXODUSER-meta-03-Isolated-20261020"
const BASES := [1000, 2000, 10000, 20000, 50000, 50000]
const GOLDEN := [
	[{}, 1000],
	[{"rarity": 2, "enh": 1}, 10001],
	[{"rarity": 2, "enh": 10}, 10015],
	[{"rarity": 2, "enh": 100}, 10656],
	[{"rarity": 4, "enh": 1}, 50002],
	[{"rarity": 0, "enh": 0.5}, 1000],
	[{"rarity": 2, "enh": 0.5}, 10001],
	[{"rarity": 2, "enh": 1.5}, 10002],
	[{"rarity": 2, "enh": 100, "_enhRefund": 10}, 10656],
	[{"rarity": 2, "enh": 100, "_enhRefund": 656}, 10656],
	[{"rarity": 2, "enh": 100, "_enhRefund": 2000}, 12000],
	[{"rarity": 2, "enh": 0, "_enhRefund": -1}, 10000],
	[{"rarity": 2, "enh": 100, "tier": 3}, 10662],
	[{"rarity": 2, "enh": 100, "tier": 0.25, "_enhRefund": 1234.5}, 11235],
	[{"rarity": 2, "enh": 0, "tier": 0.25}, 10000.5],
	[{"enh": -2, "tier": -3}, 994],
	[{"rarity": 4, "enh": 200000}, -244539796],
	[{"rarity": 4, "enh": 300000}, 523181658],
	[{"rarity": 0, "enh": 300000}, -1763538171],
	[{"rarity": 4, "enh": 200000, "_enhRefund": 0.5}, 50000.5],
	[{"rarity": 4, "enh": 200000, "_enhRefund": -1}, -244539796],
	[{"rarity": 2, "enh": 0, "_enhRefund": 3000000000}, 3000010000],
	[{"rarity": "4", "enh": 1}, 1000],
	[{"rarity": true, "enh": 1}, 1000],
	[{"rarity": null, "enh": 1}, 1000],
	[{"rarity": 4.5, "enh": 1}, 1000],
	[{"rarity": -1, "enh": 1}, 1000],
	[{"rarity": 4.0, "enh": 1}, 50002],
	[{"rarity": 5, "enh": 100}, 51202],
]
var assertions := 0
var failures := 0
var goldens: Array = []
func _initialize() -> void:
	call_deferred("_run")
func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("META03_FAIL ", label)
func _run() -> void:
	if ProjectSettings.get_setting("application/config/use_custom_user_dir", false) != true or ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		push_error("META03 requires isolated override")
		quit(2)
		return
	_check(OS.get_user_data_dir().get_file() == USERDIR, "isolated user directory")
	for rarity in range(6):
		_check(POLICY.salvage_value({"rarity": rarity}) == BASES[rarity], "base rarity%d" % rarity)
	for index in range(GOLDEN.size()):
		var item: Dictionary = GOLDEN[index][0].duplicate(true)
		var before: Dictionary = item.duplicate(true)
		var value: float = POLICY.salvage_value(item)
		_check(value == GOLDEN[index][1], "source golden%d: %s != %s" % [index, str(value), str(GOLDEN[index][1])])
		_check(item == before, "input untouched golden%d" % index)
		goldens.append({"item": item, "value": value})
	_check(POLICY.legacy_enh_refund(1, 2) == 1 and POLICY.legacy_enh_refund(10, 2) == 15 and POLICY.legacy_enh_refund(100, 2) == 656, "legacy accumulated refunds")
	_check(POLICY.legacy_enh_refund(200000, 4) == -244589796, "signed32 negative wrap, not int64")
	_check(POLICY.legacy_enh_refund(1, 2) != ENHANCEMENT.enh_cost(0, 2).cost * 0.5, "legacy differs from current enhancement spend50%")
	# Read-only reuse of META-02. Export actual results; JS oracle owns expectations.
	var levels: Array = range(201)
	levels.append_array([527, 831, 1000, 9999])
	var samples: Array = []
	for enh in levels:
		for rarity in range(6):
			var item := {"enh": enh, "rarity": rarity, "tier": int(enh) % 7}
			samples.append({"item": item, "value": POLICY.salvage_value(item), "legacy_refund": POLICY.legacy_enh_refund(enh, rarity)})
	print("META03_GOLDEN_ACTUALS ", JSON.stringify(goldens))
	print("META03_SAMPLE_ACTUALS ", JSON.stringify(samples))
	print("META03_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "skipped": [],
		"golden_samples": goldens.size(), "numeric_samples": samples.size(), "userdir": OS.get_user_data_dir(),
		"main_booted": false, "product_caller_connected": false, "save_io": false, "input_mutation": false}))
	quit(1 if failures else 0)
