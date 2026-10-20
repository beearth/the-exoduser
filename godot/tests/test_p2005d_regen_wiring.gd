extends SceneTree
## P2-005d — 자연 회복 단계 부팅 배선 회귀 (실제 Main 부팅).
## 근거: 원본 update 내 회복 블록(현 game.html 행): 32705~32707 돔 판정 _inHolyDome/_hdMul,
## 32709 플랫 (10+lv×2)/60×_fuseMul, 32711~32712 _mpr/_str=(P.mpR|stR+장비합)×p*RegenMul×_hdMul,
## 32715~32717 HP 자연(idle /8, 그 외 /16), 32717~32720 ST/MP 대입(idle /8·그 외 /16·beam mp×.5,
## 레슨 ch2 게이트). 소유권: Player 레거시 0.28 경로는 바인딩 시 비활성(player.gd 731 분기).
const USERDIR = "EXODUSER-P2005D-Isolated-20261020"
const GROUPS = ["wiring_and_natural_rates", "holy_dome_flat_and_double"]

var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var forced_actor_fields = 0

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2005D_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2005D_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2005D_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2005D_FAIL ", current_group, " ", label)

func _cleanup() -> void:
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null

func _boot_main() -> bool:
	if is_instance_valid(active_main):
		return true
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return false
	active_main = packed.instantiate()
	root.add_child(active_main)
	for i in range(12):
		await physics_frame
	return active_main.get("world").get("ready_for_player") == true

func _test_wiring_and_natural_rates() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var player: Node2D = active_main.get("player")
	var snapshot: Dictionary = player.get_native_resource_regeneration_snapshot()
	_check(snapshot.get("bound") == true, "Player에 리젠 단계 바인딩 (레거시 0.28 비활성 분기 731)")
	_check(snapshot.get("ready") == true, "단계 READY (fail-closed 아님) " + str(snapshot.get("error", "")))
	var counts: Variant = snapshot.get("counts")
	_check(counts is Dictionary and int(counts.get("clock_admitted", 0)) > 0,
		"World 클럭으로 실제 진행 admitted=" + str(counts.get("clock_admitted") if counts is Dictionary else null))
	# 자연 ST 속도 = 원본 식 (_str/8 idle): rates 공급자(실소유)에서 기대값
	var rates: Dictionary = active_main.get("source_providers").get_provider("rates").read_source_rates()
	_check(str(rates.get("status")) == "READY", "rates 공급자 READY")
	var st_rate: float = float(rates["value"]["_str_pre_holy"])
	var mp_rate: float = float(rates["value"]["_mpr_pre_holy"])
	active_main.get("source_resources").commit_native_skill_stamina_spend(active_main, 100.0)
	var st_0: float = float(player.get("stamina"))
	var frames := 60
	for i in range(frames):
		await physics_frame
	var gain: float = float(player.get("stamina")) - st_0
	var per_frame: float = gain / float(frames)
	# idle=/8, 이동/공격 섞이면 /16 — 하니스는 입력 없음 → idle 가정. 레거시였다면 0.28/8=0.035/f.
	_check(absf(per_frame - st_rate / 8.0) < st_rate / 8.0 * 0.25 + 0.0005,
		"ST 자연 속도=원본 _str/8 (32718) 기대 %.5f/f 실측 %.5f/f" % [st_rate / 8.0, per_frame])
	_check(absf(per_frame - 0.28 / 8.0) > 0.01, "레거시 0.28/8 속도 아님 (이중/구경로 배제)")
	observations["natural"] = {"st_rate": st_rate, "mp_rate": mp_rate, "per_frame": per_frame,
		"snapshot_counts": counts}

func _test_holy_dome_flat_and_double() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var player: Node2D = active_main.get("player")
	var adapter: Node = active_main.get("world").get_node("NativeSkillSlots")
	var rates: Dictionary = active_main.get("source_providers").get_provider("rates").read_source_rates()
	var st_rate: float = float(rates["value"]["_str_pre_holy"])
	active_main.get("source_resources").commit_native_skill_stamina_spend(active_main, 150.0)
	# 돔 밖 기준 측정
	var st_0: float = float(player.get("stamina"))
	for i in range(40):
		await physics_frame
	var gain_out: float = (float(player.get("stamina")) - st_0) / 40.0
	# 돔 시전 (lv1: 플랫 (10+2)/60=0.2/f, 자연 ×2)
	adapter.cast_holy_dome()
	for i in range(3):
		await physics_frame
	var st_1: float = float(player.get("stamina"))
	for i in range(40):
		await physics_frame
	var gain_in: float = (float(player.get("stamina")) - st_1) / 40.0
	var expected_in: float = st_rate * 2.0 / 8.0 + 0.2 # 32709+32712(_hdMul)+32718
	_check(absf(gain_in - expected_in) < expected_in * 0.25,
		"돔 안 ST=플랫 0.2/f+자연×2 (32709·32712) 기대 %.4f/f 실측 %.4f/f (밖 %.4f/f)" % [expected_in, gain_in, gain_out])
	_check(gain_in > gain_out + 0.15, "돔 안이 밖보다 플랫만큼 빠름")
	# HP: 피해 후 돔 안에서 플랫로 회복 (hp_sink=authority 단일 경로)
	var hp_0: float = float(player.get("hp"))
	player.receive_damage(60, "magic")
	var hp_1: float = float(player.get("hp"))
	_check(hp_1 < hp_0, "피해 적용(관측 전제)")
	for i in range(40):
		await physics_frame
	var hp_gain: float = (float(player.get("hp")) - hp_1) / 40.0
	_check(hp_gain >= 0.15, "돔 안 HP 플랫 회복 ≥0.2/f 근사 (32709) 실측 %.4f/f" % hp_gain)
	observations["dome"] = {"gain_out": gain_out, "gain_in": gain_in, "expected_in": expected_in,
		"hp_gain": hp_gain}
