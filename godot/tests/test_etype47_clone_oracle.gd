extends SceneTree

const RECIPE = preload("res://scripts/native_shadow_clone_recipe.gd")
var spec: Dictionary = {}
var draws := 0
var checks := 0
var failures := 0

func _unit() -> float:
	var result := float(spec.second) if draws == 1 and spec.has("second") else float(spec.u)
	draws += 1
	return result

func _can_move(_point: Vector2, _radius: float) -> bool: return not spec.get("blocked", false)
func _safe_point(_x: float, _y: float, _radius: float) -> Variant: return spec.get("safe")

func _equal(left: Variant, right: Variant) -> bool:
	if left is float or left is int:
		return (right is float or right is int) and absf(float(left) - float(right)) <= maxf(0.000000001, absf(float(right)) * 0.000000000001)
	return JSON.stringify(left) == JSON.stringify(right)

func _check(value: bool, label: String) -> void:
	checks += 1
	if not value:
		failures += 1
		print("CLONE_ORACLE_FAIL ", label)

func _initialize() -> void:
	var fixture: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://tests/fixtures/type47_discarded_clone_oracle.json"))
	for entry in fixture.cases:
		spec = entry.spec
		draws = 0
		var context := {"stage": 0, "difficulty": spec.diff, "player_level": spec.level, "stage_difficulty_offset": 0}
		var result: Dictionary = RECIPE.build(3969.25, 494.75, context, _unit, _can_move, _safe_point)
		_check(draws == entry.draws, spec.name + ": exact constructor RNG count")
		if entry.expected == null:
			_check(result.valid == false, "null constructor honestly stops, no fake clone")
			continue
		_check(result.valid and not result.registered and not result.room_present, spec.name + ": no registry or fabricated room")
		for key in entry.expected:
			_check(_equal(result.get(key), entry.expected[key]), spec.name + ": " + key + " actual=" + str(result.get(key)) + " expected=" + str(entry.expected[key]))
	print("CLONE_ORACLE_RESULT ", JSON.stringify({"checks": checks, "failures": failures, "cases": fixture.cases.size()}))
	quit(1 if failures else 0)
