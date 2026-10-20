extends SceneTree
## Registry-only test; source snapshot is independently compared with actual JS.
const USERDIR := "EXODUSER-sk-s02-Isolated-20261020"
const CATALOG = preload("res://port_modules/skill_management_source/catalog.gd")
const FUSION = preload("res://port_modules/fusion_star_source/producer.gd")
var assertions := 0
var failures := 0

func _initialize() -> void:
	ProjectSettings.set_setting("application/config/use_custom_user_dir", true)
	ProjectSettings.set_setting("application/config/custom_user_dir_name", USERDIR)
	call_deferred("_run")

func _run() -> void:
	_check(ProjectSettings.get_setting("application/config/use_custom_user_dir") == true, "custom user dir")
	_check(ProjectSettings.get_setting("application/config/custom_user_dir_name") == USERDIR, "exact user dir")
	_check(OS.get_user_data_dir().get_file() == USERDIR, "actual OS user path")
	if failures > 0:
		_finish()
		return
	var inputs: Dictionary = {}
	for action in InputMap.get_actions():
		inputs[action] = InputMap.action_get_events(action)
	var packet: Dictionary = CATALOG.read_catalog()
	_check(packet.status == "READY", "catalog ready")
	if packet.status != "READY":
		_finish()
		return
	var data: Dictionary = packet.value
	var sizes := {"categories":9,"recommendations":15,"hierarchy":4,"icons":84,
		"skills":55,"slot_definitions":8,"gem_groups":32,"fusion_pairs":32,"skill_multipliers":37}
	_check(data.keys() == sizes.keys(), "all source table names and order")
	for key in sizes:
		_check(data[key].size() == sizes[key], "source registry count: " + key)
	var ids: Array = []
	for skill in data.skills:
		_check(not ids.has(skill.id), "unique source skill id " + skill.id)
		ids.append(skill.id)
		var read: Dictionary = CATALOG.read_skill(skill.id)
		_check(read.status == "READY" and read.found and read.value == skill, "full definition: " + skill.id)
		_check(not is_same(read.value, skill), "skill return is fresh")
		read.value.name = "caller mutation"
		_check(CATALOG.read_skill(skill.id).value.name == skill.name, "lookup mutation isolated")
	for key in data.slot_definitions:
		var read: Dictionary = CATALOG.read_slot_definition(key)
		_check(read.status == "READY" and read.found and read.value == data.slot_definitions[key], "slot " + key)
		read.value.skills.append("caller mutation")
		_check(not CATALOG.read_slot_definition(key).value.skills.has("caller mutation"), "nested slot copy")
	for key in data.icons:
		_check(CATALOG.read_icon_definition(key).value == data.icons[key], "icon alias " + key)
	for key in data.skill_multipliers:
		var read: Dictionary = CATALOG.read_multiplier_definition(key)
		_check(read.status == "READY" and read.found and read.value == data.skill_multipliers[key], "coefficients " + key)
		read.value.b = -999
		_check(CATALOG.read_multiplier_definition(key).value.b == data.skill_multipliers[key].b, "coefficient copy")
	_check(data.fusion_pairs.keys() == FUSION.FUSE_PAIRS.keys(), "existing fusion recipe order reused")
	_check(data.gem_groups.keys() == FUSION.GEM_GROUP_STAR.keys(), "source gem declaration order reused")
	for key in data.fusion_pairs:
		var members: Dictionary = CATALOG.read_fusion_members(key)
		_check(members.status == "READY" and members.found and members.value == FUSION.FUSE_PAIRS[key], "members " + key)
		members.value.append("caller mutation")
		_check(not FUSION.FUSE_PAIRS[key].has("caller mutation"), "fusion authority immutable")
		var gem: Dictionary = CATALOG.read_gem_group(key).value
		_check(gem.skills == FUSION.FUSE_PAIRS[key], "gem membership uses existing owner")
		_check(gem.has("star") == (FUSION.GEM_GROUP_STAR[key] != null), "missing star remains absent")
		if gem.has("star"):
			_check(gem.star == FUSION.GEM_GROUP_STAR[key], "explicit star override " + key)
		gem.skills.clear()
		gem.minLv = -999
		_check(CATALOG.read_gem_group(key).value.skills == FUSION.FUSE_PAIRS[key], "nested gem copy")
	_check(CATALOG.read_skill("maliceHunt").value.cd == 300, "metadata cd is not cast cooldown")
	_check(CATALOG.read_skill("voidScarecrow").value.cd == 600, "metadata cd600 retained")
	_check(not CATALOG.read_skill("chargeBoost").value.has("cd"), "missing cd not defaulted")
	_check(CATALOG.read_gem_group("timeStep").value.minLv == 500, "minLv metadata retained without gate")
	_check(CATALOG.read_gem_group("stormBeam").value.star == 4 and CATALOG.read_fusion_members("stormBeam").value.size() == 6,
		"star override and member count kept distinct")
	_test_unknown_and_unsupported()
	# Mutate every table from one snapshot. Future snapshots retain all source data.
	var stable := JSON.stringify(CATALOG.read_catalog().value)
	for key in data:
		data[key].clear()
	_check(JSON.stringify(CATALOG.read_catalog().value) == stable, "all returned tables isolated")
	var ranges: Dictionary = CATALOG.read_source_ranges()
	ranges.skills.start_line = -1
	_check(CATALOG.read_source_ranges().skills.start_line == 44161, "source range copy")
	var readonly = CATALOG.new()
	for forbidden in ["configure", "fuse_star", "_canFuse", "_execFuse", "cast_giant_slam", "save"]:
		_check(not readonly.has_method(forbidden), "no live behavior API " + forbidden)
	_check(root.get_child_count() == 0, "no Main or actor nodes")
	_check(InputMap.get_actions() == inputs.keys(), "input actions unchanged")
	for action in inputs:
		_check(InputMap.action_get_events(action) == inputs[action], "input bindings unchanged")
	# Independent Node VM comparator consumes this entire payload, not generated fixtures.
	var complete: Dictionary = CATALOG.read_catalog().value
	print("SK_S02_SOURCE_SNAPSHOT ", JSON.stringify(complete))
	var key_order: Dictionary = {}
	for key in complete:
		if complete[key] is Dictionary:
			key_order[key] = complete[key].keys()
	print("SK_S02_SOURCE_KEY_ORDER ", JSON.stringify(key_order))
	_finish()

func _test_unknown_and_unsupported() -> void:
	var reader = CATALOG.new() # Object.call requires an instance even for static methods.
	var methods := ["read_skill", "read_slot_definition", "read_icon_definition", "read_multiplier_definition", "read_fusion_members", "read_gem_group"]
	for method in methods:
		for unknown in ["", "__missing__", "not-a-skill"]:
			var packet: Dictionary = reader.call(method, unknown)
			_check(packet.status == "READY" and packet.found == false and packet.value == null, "unknown id explicitly null")
		for raw in [null, true, 1, 1.0, &"giantSlam", [], {}, Vector2.ZERO]:
			var packet: Dictionary = reader.call(method, raw)
			_check(packet.status == "NOT_READY" and not packet.has("value") and packet.reason == "unsupported_id_carrier", "unsupported id does not invent definition")
			_check(is_same(packet.input, raw), "unsupported raw carrier preserved")

func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("SK_S02_FAIL ", label)

func _finish() -> void:
	print("SK_S02_RESULT ", JSON.stringify({"assertions":assertions,"failures":failures,
		"skipped":[],"user_dir":OS.get_user_data_dir(),"main_boots":0}))
	quit(1 if failures > 0 else 0)
