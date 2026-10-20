extends SceneTree

const FACTORY = preload("res://scripts/enemy_factory.gd")

func _initialize() -> void:
	var factory = FACTORY.new()
	var source: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/encounters.json"))
	var checks := 0
	var failures := 0
	for order in [4, 10, 11, 12]:
		for field in ["element_id", "hp", "spawn_position"]:
			var record: Dictionary = source["records"][order].duplicate(true)
			if field == "spawn_position":
				record[field][0] += 1
			else:
				record[field] += 1
			checks += 1
			if factory.unsupported_reason(record).is_empty():
				failures += 1
				print("P2008A_ADMISSION_FAIL order%d changed %s" % [order, field])
	for order in [2, 3, 5, 6, 7, 9]:
		checks += 1
		if factory.unsupported_reason(source["records"][order]).is_empty():
			failures += 1
			print("P2008A_ADMISSION_FAIL unported order%d aliased" % order)
	print("P2008A_ADMISSION_RESULT ", JSON.stringify({"checks": checks, "failures": failures}))
	quit(1 if failures > 0 else 0)
