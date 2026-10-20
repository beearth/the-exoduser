extends SceneTree
## P2-005d — 얼음보주(Ctrl) 발동 회귀 (실제 Main 부팅).
## 근거: 게이트 12916~12923(_ioActive 차단·재입력 파쇄·mp>=mpCost(31992: 50×dpsMul×pMagicCost)·_ioCd)·
## activateIceOrb 46756~46764(_ioBon=useMp×2·P.s='iceOrb'·무적=34889s !P._ioActive 게이트들)·
## 자동 파쇄 36695(120f)·activateIceShatter 46766~46822(칼날 4+lv×4·base=~~(magicRef×statInt×
## pMagicMul×_skMul(8))+_ioBon·칼날/파쇄 30%·쿨 max(600,1200−60(lv−1)))·칼날 히트 35581~35585
## (비보스 빙결스턴 30·_iceShardRes+0.10·관통 95%)·냉기 프리즌 42446~42460(게이지 100 → _frozen 180).
const USERDIR = "EXODUSER-P2005D-Isolated-20261020"
const GROUPS = ["cast_state_invuln_and_block", "auto_shatter_blades_and_freeze", "freeze_trigger_direct"]
const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
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
var cast_mp_spent := 0.0

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2005DIO_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2005DIO_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2005DIO_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2005DIO_FAIL ", current_group, " ", label)

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

func _test_cast_state_invuln_and_block() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var player: Node2D = active_main.get("player")
	var state: Node = active_main.get("source_state")
	# 가장 가까운 적 +X축 80px 앞에 배치 (칼날 i=0 경로)
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
	var mp_before: float = float(state.read_current_p().get("mp"))
	var cost_mul: Variant = active_main.read_native_fireball_magic_cost()
	var expected_cost: int = FORMULA.js_to_int32(50.0 * 1.0 * float(cost_mul)) # lv1: dpsMul=1
	_adapter().cast_ice_orb()
	var snap: Dictionary = _adapter().get_native_skill_slots_snapshot()
	_check(snap.get("io_active") == true, "보주 활성 (46758)")
	_check(str(player.get("state")) == "iceOrb", "P.s='iceOrb' (46759)")
	var mp_after: float = float(state.read_current_p().get("mp"))
	cast_mp_spent = mp_before - mp_after
	_check(absf(cast_mp_spent - float(expected_cost)) < 0.01,
		"MP 비용 %d 소비 (31992 mpCost·useMp) spent=%.1f" % [expected_cost, cast_mp_spent])
	var hp_before: float = float(player.get("hp"))
	player.receive_damage(60, "phys")
	_check(float(player.get("hp")) == hp_before, "보주 중 무적 — 피해 0 (34889s !P._ioActive)")
	var log_before: int = (snap.get("cast_log") as Array).size()
	_adapter().cast_spike_trap() # 12917 차단
	var log_list: Array = _adapter().get_native_skill_slots_snapshot().get("cast_log")
	_check(log_list.size() == log_before + 1 and log_list[-1].get("reason") == "ice_orb_active",
		"보주 중 타 스킬 차단 (12917)")
	_check(int(state.read_current_g().get("mats")) == 1000, "차단된 가시덫 비용 미소비")
	observations["cast"] = {"mp_spent": cast_mp_spent, "expected_cost": expected_cost}

func _test_auto_shatter_blades_and_freeze() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var player: Node2D = active_main.get("player")
	var target: Node2D = null
	var best := 1e18
	for c in active_main.get("world").get_enemies():
		if is_instance_valid(c) and c.get("alive") == true:
			var d: float = c.global_position.distance_to(player.global_position)
			if d < best:
				best = d
				target = c
	var before_n: int = hurte_outcomes.size()
	# 120f 자동 파쇄 (36695) — 보주는 1그룹에서 활성 상태로 이월됨
	var auto_fired := false
	for i in range(130):
		await physics_frame
		if _adapter().get("io_cd") > 0.0:
			auto_fired = true
			break
	_check(auto_fired and _adapter().get("_io_active") == false, "120f 자동 파쇄 (36695)")
	_check(str(player.get("state")) == "idle", "파쇄 후 상태 복구 P.s='idle' (46819)")
	var snap: Dictionary = _adapter().get_native_skill_slots_snapshot()
	_check(absf(float(snap.get("io_cd")) - 1200.0) < 130.0,
		"쿨 1200f(lv1) 설정 (46820) cd=" + str(snap.get("io_cd")))
	# 피해식: base=~~(magicRef×1×pMagicMul×8)+_ioBon(=spent×2) → 칼날/파쇄=~~(base×0.3)
	var bundle: Dictionary = active_main.get("source_providers").get_provider_bundle()
	var base_dmg: int = FORMULA.js_to_int32(float(bundle.reference.magic_ref().value) \
		* float(bundle.formula.p_magic_mul().value) * 8.0) + int(cast_mp_spent * 2.0)
	var expected_piece: int = maxi(1, FORMULA.js_to_int32(float(base_dmg) * 0.3))
	var log_list: Array = snap.get("cast_log")
	var shatter_log: Dictionary = {}
	for entry in log_list:
		if entry.get("skill") == "iceShatter":
			shatter_log = entry
	_check(not shatter_log.is_empty() and int(shatter_log.get("blades", 0)) == 8,
		"칼날 4+lv×4=8발 (46770) got " + str(shatter_log.get("blades")))
	_check(int(shatter_log.get("base_dmg", -1)) == base_dmg and int(shatter_log.get("blade_dmg", -1)) == expected_piece,
		"피해식 base=%d·칼날 30%%=%d (46771~46772) got %s" % [base_dmg, expected_piece, str(shatter_log)])
	# 파쇄 AoE + 칼날 히트 (hurtE 경유)
	for i in range(30):
		await physics_frame
	var aoe_hits := 0
	var blade_hits := 0
	for outcome in hurte_outcomes.slice(before_n):
		if outcome.get("source") == "iceShatter":
			aoe_hits += 1
		elif outcome.get("source") == "iceOrbBlade":
			blade_hits += 1
	_check(aoe_hits >= 1, "파쇄 AoE hurtE ≥1 (46790, r=105) n=" + str(aoe_hits))
	_check(blade_hits >= 1, "칼날 hurtE ≥1 (35407) n=" + str(blade_hits))
	# 냉기 프리즌(42446~42456): 쉴드 흡수 후 잔여 dmg만 게이지 축적(42348 dmg−=absorb →
	# dmg==0이면 42354 블록 미진입 — 쉴드 잔존 적은 게이지 0이 원본 동일).
	if is_instance_valid(target) and target.get("alive") == true and expected_piece >= 100:
		if float(target.get("eShield")) <= 0.0:
			_check(float(target.get("_frozen")) > 0.0 or float(target.get("_frozen_immune")) > 0.0
				or float(target.get("_freeze_gauge")) > 0.0,
				"쉴드 소진 후 냉기 프리즌 게이지/발동 (42453) frozen=%s gauge=%s" % [str(target.get("_frozen")), str(target.get("_freeze_gauge"))])
		else:
			_check(float(target.get("_freeze_gauge")) == 0.0 and float(target.get("_frozen")) == 0.0,
				"쉴드 잔존 중 게이지 0 (원본 42348 흡수 후 dmg=0) shield=" + str(target.get("eShield")))
		_check(float(target.get("_ice_shard_res")) > 0.0 or blade_hits == 0,
			"얼음파편 저항깎기 +0.10 (35584) got " + str(target.get("_ice_shard_res")))
	# 쿨 중 재시전 거부 (12922)
	var log_before2: int = (log_list as Array).size()
	_adapter().cast_ice_orb()
	var log2: Array = _adapter().get_native_skill_slots_snapshot().get("cast_log")
	_check(log2.size() == log_before2 + 1 and log2[-1].get("rejected") == true,
		"쿨다운 게이트: 재시전 거부 (12922 _ioCd)")
	var cds: Dictionary = _adapter().read_native_slot_cooldowns()
	_check(cds.has("skSlotCT") and float(cds["skSlotCT"]["pct"]) > 0.85,
		"HUD sweep skSlotCT 공급 " + str(cds.get("skSlotCT")))
	observations["shatter"] = {"log": shatter_log, "aoe": aoe_hits, "blades": blade_hits,
		"frozen": target.get("_frozen") if is_instance_valid(target) else null}

func _test_freeze_trigger_direct() -> void:
	# 42446~42460 직접 증명: 쉴드를 EL.P 집행자 히트로 소진 → EL.I 히트로 게이지 100 즉발 →
	# _frozen=180·행동불가 → 빙결 중 추가 EL.I는 게이트 스킵(42446) → 해동 후 면역(38647).
	if not await _boot_main():
		_check(false, "boot")
		return
	var victim: Node2D = null
	for c in active_main.get("world").get_enemies():
		if is_instance_valid(c) and c.get("alive") == true and float(c.get("eShield")) > 0.0:
			victim = c
			break
	if victim == null:
		_check(false, "no shielded enemy")
		return
	var guard := 0
	while float(victim.get("eShield")) > 0.0 and victim.get("alive") == true and guard < 20:
		guard += 1
		NORMAL_HURTE.new().execute(active_main, active_main.get("world"), victim,
			mini(400, int(float(victim.get("eShield")) + 1.0)), 0.0, 0, {"noImpact": true})
	if victim.get("alive") != true:
		_check(false, "victim died while stripping shield")
		return
	_check(float(victim.get("eShield")) <= 0.0, "쉴드 소진 (관측 준비)")
	var outcome: Dictionary = NORMAL_HURTE.new().execute(active_main, active_main.get("world"), victim,
		150, 0.0, 2, {"iceBlade": true, "magic": true})
	_check(float(victim.get("_frozen")) > 170.0,
		"EL.I 150 → 게이지 100 즉발·_frozen=180 (42447~42455) got " + str(victim.get("_frozen")))
	var frozen_now: float = float(victim.get("_frozen"))
	NORMAL_HURTE.new().execute(active_main, active_main.get("world"), victim,
		150, 0.0, 2, {"iceBlade": true, "magic": true})
	_check(float(victim.get("_freeze_gauge")) == 0.0 and absf(float(victim.get("_frozen")) - frozen_now) < 0.01,
		"빙결 중 추가 EL.I 게이트 스킵 (42446)")
	var moved_before: Vector2 = victim.global_position
	for i in range(30):
		await physics_frame
	_check(victim.global_position.distance_to(moved_before) < 0.5, "빙결 중 행동불가 (38644~38648)")
	for i in range(170):
		await physics_frame
		if float(victim.get("_frozen")) <= 0.0:
			break
	_check(float(victim.get("_frozen")) <= 0.0 and float(victim.get("_frozen_immune")) > 0.0,
		"해동 후 프리즌 면역 (38647, 일반 120f) immune=" + str(victim.get("_frozen_immune")))
	observations["freeze"] = {"outcome_ok": outcome.get("ok"), "immune": victim.get("_frozen_immune")}
