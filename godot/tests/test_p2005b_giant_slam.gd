extends SceneTree
## P2-005b — 지옥강타 1(Space) 발동 회귀 (실제 Main 부팅).
## 근거: 게이트 13010(ST50=_COST_BASE 31960×배수 1·악의 10=_malCost(20) 28081·_gslCd),
## activateGiantSlam 46448~46470(비용·쿨 1800−12(lv−1)·dmg=~~(meleeRef×1×skMul20×rageMul1)),
## _gSlamHit 46527~(×pAtkMul·elMul·hurtE opts {kbMult:0,noPoise,noImpact}·kb8·
## 일반몹 stunned max(,60)·poise≤0 풀스턴), HUD sweep 44136(conic+초 텍스트).
const USERDIR = "EXODUSER-P2005B-Isolated-20261020"
# QA-002: 테스트 소유 입력. 제품 RNG 호출 순서는 변경하지 않는다.
const QA002_TEST_SEED = 20261020
const GROUPS = ["cast_costs_and_damage", "cooldown_gate_and_hud_sweep"]
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")

var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var forced_actor_fields = 0
var hurte_outcomes: Array = []

func _initialize() -> void:
	seed(QA002_TEST_SEED) # 프로세스당 1회; Main 재부팅은 같은 스트림을 이어간다.
	observations["qa002_test_seed"] = QA002_TEST_SEED
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2005B_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2005B_GROUP ", JSON.stringify(row))
	_cleanup()
	# QA-002: AudioServer mix/main-thread 청소 기회만 제공한다(제품 오디오 조작 없음).
	for _frame in range(12):
		await process_frame
	print("P2005B_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2005B_FAIL ", current_group, " ", label)

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
	if active_main.get("world").get("ready_for_player") != true:
		return false
	active_main.get("player").telemetry_event.connect(func(kind, data):
		if kind == "native_hurte": hurte_outcomes.append(data.duplicate(true)))
	return true

func _adapter() -> Node:
	return active_main.get("world").get_node("NativeSkillSlots")

func _test_cast_costs_and_damage() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var player: Node2D = active_main.get("player")
	var state: Node = active_main.get("source_state")
	# 적 무리 옆으로 이동 (관측 하니스 재배치 — r500 내 다수)
	var target: Node2D = null
	var best := 1e18
	for c in active_main.get("world").get_enemies():
		if is_instance_valid(c) and c.get("alive") == true:
			var d: float = c.global_position.distance_to(player.global_position)
			if d < best:
				best = d
				target = c
	player.global_position = target.global_position + Vector2(-80, 0)
	forced_actor_fields += 1
	for i in range(10):
		await physics_frame
	var st_before: float = float(player.get("stamina"))
	var mats_before: int = int(state.read_current_g().get("mats"))
	var parameters: Dictionary = active_main.read_native_attack_parameters()
	var expected_dmg: int = FORMULA.js_to_int32(FORMULA.js_to_int32(float(parameters["melee_ref"]) * 20.0) \
		* float(parameters["p_atk_mul"]))
	var shield_before: float = float(target.get("eShield"))
	var hp_before: float = float(target.get("hp"))
	var before_n: int = hurte_outcomes.size()
	_adapter().cast_giant_slam()
	var st_after_cast: float = float(player.get("stamina")) # 리젠 전 즉시 관측
	for i in range(6):
		await physics_frame
	var snap: Dictionary = _adapter().get_native_skill_slots_snapshot()
	_check(st_after_cast == st_before - 50.0, "ST 50 소비 (useStPct 31991) st=" + str(st_after_cast))
	_check(int(state.read_current_g().get("mats")) == mats_before - 10, "악의 10 소비 (_malCost(20) 46454)")
	_check(float(snap.get("gsl_cd")) > 1790.0, "쿨 1800f 설정 (46456) cd=" + str(snap.get("gsl_cd")))
	var mine: Array = []
	for outcome in hurte_outcomes.slice(before_n):
		if outcome.get("source") == "giantSlam":
			mine.append(outcome)
	_check(mine.size() >= 1, "반경 500 내 hurtE 경유 히트 ≥1 (46545) n=" + str(mine.size()))
	var target_hit: Dictionary = {}
	for outcome in mine:
		if int(outcome.get("enemy_id", 0)) == target.get_instance_id():
			target_hit = outcome
	_check(not target_hit.is_empty(), "대상 적 히트 포함")
	if not target_hit.is_empty():
		_check(int(target_hit.get("base_damage", -1)) == expected_dmg,
			"피해식 ~~(~~(meleeRef×20)×pAtkMul) = %d (46470·46529) got %s" % [expected_dmg, str(target_hit.get("base_damage"))])
		if target_hit.get("is_crit") != true and is_instance_valid(target) and target.get("alive") == true:
			var absorbed: float = shield_before - float(target.get("eShield"))
			var hp_loss: float = hp_before - float(target.get("hp"))
			_check(absf((absorbed + hp_loss) - expected_dmg) < 1.0,
				"쉴드+HP 합산 피해 일치 (비크리) %.0f" % (absorbed + hp_loss))
		if is_instance_valid(target) and target.get("alive") == true:
			# 60 적용 후 관측까지 6프레임 감소분 허용
			_check(float(target.get("_stun_ticks")) >= 50.0, "일반몹 미니스턴 60 적용 (46556·8668) t=" + str(target.get("_stun_ticks")))
	_check(int(snap.get("waves")) >= 0 and (snap.get("cast_log") as Array).size() >= 1
		and (snap.get("cast_log") as Array)[-1].get("hits") == mine.size(), "웨이브·캐스트 로그 기록")
	observations["cast"] = snap.get("cast_log")

func _test_cooldown_gate_and_hud_sweep() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var adapter: Node = _adapter()
	var cds: Dictionary = adapter.read_native_slot_cooldowns()
	_check(cds.has("skSlot1") and float(cds["skSlot1"]["pct"]) > 0.98 \
		and str(cds["skSlot1"]["text"]).ends_with("s"),
		"HUD sweep 공급: Space 슬롯 pct≈1·'N.Ns' (44136) " + str(cds.get("skSlot1")))
	var log_before: int = (adapter.get_native_skill_slots_snapshot().get("cast_log") as Array).size()
	adapter.cast_giant_slam() # 쿨 중 재시전 → 거부
	var log_list: Array = adapter.get_native_skill_slots_snapshot().get("cast_log")
	_check(log_list.size() == log_before + 1 and log_list[-1].get("rejected") == true,
		"쿨다운 게이트: 재시전 거부 (13010 _gslCd)")
	# HUD 셀에 sweep 반영 (30Hz 갱신 1주기 대기)
	for i in range(6):
		await physics_frame
	var hud: Node = active_main.get("hud")
	var cell: Control = hud.get_node("PublicHUD/NativeSkillBar/NativeSlot_skSlot1")
	var sweep: Control = cell.get_node("Sweep")
	_check(float(sweep.get_meta("pct", 0.0)) > 0.9, "슬롯 sweep pct 적용 " + str(sweep.get_meta("pct")))
	observations["cooldown"] = cds
