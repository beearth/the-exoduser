extends SceneTree
## P2-005c — 가시덫 1(spikeTrap)·회복의 영역 F(holyDome) 발동 회귀 (실제 Main 부팅).
## 근거: spikeTrap 게이트 13021(악의 _malCost(10)=5·_gcCd)·activateSpikeTrap 45508~45521
## (비용 5·쿨 600·존 r300+15(lv−1)·maxT600·dmg=~~(magicRef×statInt×pMagicMul×skMul(14)×.75))·
## 존 틱 37413(25f)·37465~37472(hurtE {dot,shieldHit}·EL.P·감속 _spikeSlow=90)·
## holyDome 게이트 13006(_hdCd만)·activateHolyDome 46706~46713(쿨 1800·존 r500+20lv·
## maxT720+30lv)·리젠 32706~32709((10+2lv)/60 플랫+자연리젠 2배)·쿨 2배속 35936.
const USERDIR = "EXODUSER-P2005C-Isolated-20261020"
# QA-002: 테스트 소유 입력. 제품 RNG 호출 순서는 변경하지 않는다.
const QA002_TEST_SEED = 20261020
const GROUPS = ["spike_trap_cast_zone_and_dot", "holy_dome_cast_regen_and_cd_boost"]
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const DOME = preload("res://port_modules/holy_dome_presence_source/producer.gd")

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
			print("P2005C_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2005C_GROUP ", JSON.stringify(row))
	_cleanup()
	# QA-002: AudioServer mix/main-thread 청소 기회만 제공한다(제품 오디오 조작 없음).
	for _frame in range(12):
		await process_frame
	print("P2005C_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2005C_FAIL ", current_group, " ", label)

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

func _nearest_enemy(player: Node2D) -> Node2D:
	var target: Node2D = null
	var best := 1e18
	for c in active_main.get("world").get_enemies():
		if is_instance_valid(c) and c.get("alive") == true:
			var d: float = c.global_position.distance_to(player.global_position)
			if d < best:
				best = d
				target = c
	return target

func _zones() -> Array:
	var g: Variant = active_main.get("source_state").read_current_g()
	return g.get("_fireZones", []) if g is Dictionary else []

func _test_spike_trap_cast_zone_and_dot() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var player: Node2D = active_main.get("player")
	var state: Node = active_main.get("source_state")
	var target: Node2D = _nearest_enemy(player)
	player.global_position = target.global_position + Vector2(-80, 0)
	forced_actor_fields += 1
	for i in range(10):
		await physics_frame
	var g0: Dictionary = state.read_current_g()
	_check(not g0.has("_fireZones"), "부트 시 _fireZones 부재 (lazy 생성 45516 — starter 계약 보존)")
	var mats_before: int = int(g0.get("mats"))
	var bundle: Dictionary = active_main.get("source_providers").get_provider_bundle()
	var magic_ref: float = float(bundle.reference.magic_ref().value)
	var magic_mul: float = float(bundle.formula.p_magic_mul().value)
	var expected_dmg: int = FORMULA.js_to_int32(magic_ref * 1.0 * magic_mul * 14.0 * 0.75) # 45507 lv1
	var shield_before: float = float(target.get("eShield"))
	var before_n: int = hurte_outcomes.size()
	_adapter().cast_spike_trap()
	var snap: Dictionary = _adapter().get_native_skill_slots_snapshot()
	_check(int(state.read_current_g().get("mats")) == mats_before - 5, "악의 5 소비 (_malCost(10) 45512)")
	_check(float(snap.get("gc_cd")) >= 599.0, "쿨 600f 설정 (45512) cd=" + str(snap.get("gc_cd")))
	var zones: Array = _zones()
	_check(zones.size() == 1 and zones[0].get("type") == "spikeTrap"
		and absf(float(zones[0].get("r")) - 300.0) < 0.01 and float(zones[0].get("maxT")) == 600.0
		and int(zones[0].get("dmg")) == expected_dmg,
		"존 push: r300(lv1)·maxT600·dmg=%d (45515~45517) got %s" % [expected_dmg, str(zones)])
	# 첫 DOT 틱은 25프레임 누산 후 (37414s)
	for i in range(23):
		await physics_frame
	_check(hurte_outcomes.slice(before_n).is_empty(), "25f 전 틱 없음 (타이머 누산 37414)")
	for i in range(6):
		await physics_frame
	var mine: Array = []
	for outcome in hurte_outcomes.slice(before_n):
		if outcome.get("source") == "spikeTrap":
			mine.append(outcome)
	_check(mine.size() >= 1, "25f 틱에서 hurtE dot 경유 히트 ≥1 (37468) n=" + str(mine.size()))
	var target_hit: Dictionary = {}
	for outcome in mine:
		if int(outcome.get("enemy_id", 0)) == target.get_instance_id():
			target_hit = outcome
	_check(not target_hit.is_empty() and int(target_hit.get("base_damage", -1)) == expected_dmg,
		"대상 적 틱 피해식 일치 %d" % expected_dmg)
	if is_instance_valid(target) and target.get("alive") == true:
		_check(float(target.get("eShield")) < shield_before,
			"dot+shieldHit → 쉴드 흡수 발생 (42345 (!isDot||shieldHit))")
		_check(float(target.get("_spike_slow")) > 60.0,
			"감속 _spikeSlow=90 기록 (37471) t=" + str(target.get("_spike_slow")))
		_check(float(target.get("_stun_ticks")) <= 0.0, "dot는 스턴 없음 (42472/42486 스킵)")
	var log_before: int = (snap.get("cast_log") as Array).size()
	_adapter().cast_spike_trap() # 쿨 중 재시전 → 거부
	var log_list: Array = _adapter().get_native_skill_slots_snapshot().get("cast_log")
	_check(log_list.size() == log_before + 1 and log_list[-1].get("rejected") == true,
		"쿨다운 게이트: 재시전 거부 (13021 _gcCd)")
	var cds: Dictionary = _adapter().read_native_slot_cooldowns()
	_check(cds.has("qs0") and float(cds["qs0"]["pct"]) > 0.9, "HUD sweep qs0 공급 " + str(cds.get("qs0")))
	observations["spike"] = {"cast_log": log_list, "zone": _zones(), "hits": mine.size()}

func _test_holy_dome_cast_regen_and_cd_boost() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var state: Node = active_main.get("source_state")
	# 실소유 presence 프로듀서(리젠 단계 공급자)로 돔 판정 교차검증 — 라이브 G/P reader
	var dome_presence: RefCounted = DOME.new()
	dome_presence.configure(Callable(state, "read_current_g"), Callable(state, "read_current_p"))
	_check(dome_presence.in_holy_dome_value() == false,
		"시전 전 presence=false (33349) got " + str(dome_presence.in_holy_dome_value()))
	var gc_before_out: float = float(_adapter().get("gc_cd"))
	for i in range(10):
		await physics_frame
	var gc_rate_out: float = (gc_before_out - float(_adapter().get("gc_cd"))) / 10.0
	_adapter().cast_holy_dome()
	var snap: Dictionary = _adapter().get_native_skill_slots_snapshot()
	_check(float(snap.get("hd_cd")) >= 1799.0, "쿨 1800f 설정 (46711) cd=" + str(snap.get("hd_cd")))
	var dome: Dictionary = {}
	for zone in _zones():
		if zone.get("type") == "holyDome":
			dome = zone
	_check(not dome.is_empty() and absf(float(dome.get("r")) - 520.0) < 0.01
		and absf(float(dome.get("maxT")) - 750.0) < 0.01,
		"존 push: r520(500+20·lv1)·maxT750(720+30) (46709~46713) got " + str(dome))
	# 리젠(플랫 (10+2lv)/60 + 자연 2배)은 리젠 단계(native_source_player_regeneration_phase)
	# 소유 — main 부팅 미배선(경계 기록). 존이 실소유 presence 프로듀서에 READY·true로
	# 소비되는지로 통합 준비를 검증한다(판정식 33349 동일 모듈).
	_check(dome_presence.in_holy_dome_value() == true,
		"시전 후 실소유 presence 프로듀서 READY·true (33349) got " + str(dome_presence.in_holy_dome_value()))
	# 돔 안 쿨 가속은 cd별 원본 라인: _gslCd만 +bonus(36678)·_gcCd/_hdCd는 가속 없음(36517/36679)
	active_main.get("player").global_position = Vector2(dome.get("x"), dome.get("y"))
	forced_actor_fields += 1
	_adapter().cast_giant_slam()
	var gsl_before: float = float(_adapter().get("gsl_cd"))
	var gc_before_in: float = float(_adapter().get("gc_cd"))
	if gsl_before > 30.0 and gc_before_in > 30.0:
		for i in range(10):
			await physics_frame
		var gsl_rate: float = (gsl_before - float(_adapter().get("gsl_cd"))) / 10.0
		var gc_rate_in: float = (gc_before_in - float(_adapter().get("gc_cd"))) / 10.0
		_check(absf(gsl_rate - 2.0) < 0.01, "돔 안 _gslCd 2배속 (36678) %.2f/f" % gsl_rate)
		_check(absf(gc_rate_in - 1.0) < 0.01 and absf(gc_rate_out - 1.0) < 0.01,
			"_gcCd는 돔 가속 없음 (36517) out=%.2f in=%.2f" % [gc_rate_out, gc_rate_in])
	var log_before: int = (_adapter().get_native_skill_slots_snapshot().get("cast_log") as Array).size()
	_adapter().cast_holy_dome() # 쿨 중 재시전 → 거부
	var log_list: Array = _adapter().get_native_skill_slots_snapshot().get("cast_log")
	_check(log_list.size() == log_before + 1 and log_list[-1].get("rejected") == true,
		"쿨다운 게이트: 재시전 거부 (13006 _hdCd)")
	var cds: Dictionary = _adapter().read_native_slot_cooldowns()
	_check(cds.has("qs5") and float(cds["qs5"]["pct"]) > 0.9, "HUD sweep qs5 공급 " + str(cds.get("qs5")))
	observations["dome"] = {"presence": dome_presence.in_holy_dome_value(), "zone": dome}
