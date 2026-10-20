extends SceneTree
## P1-002.E — 기본 무기 근접 1타 hurtE 회귀 (실제 Main 부팅).
## 대상: 첫 스테이지 generic enemy.gd 일반 적(ch1_start_eye_mass_01; etype4, el=3, eShield=mhp=875).
## 경로: player.request_attack()(공개 API) → swing → _melee_contact → native_normal_enemy_hurte.
## 테스트 소유 개입(한계 기록): ① activeLMBSk='weapon' — 공개 로드아웃 셀렉터 부재로
## State P에 직접 기록 ② 스윙 전 플레이어 위치/시선 배치(순간이동) — 둘 다
## forced_actor_fields로 집계. 공격 자체는 공개 API, 피해 적용은 제품 경로만 사용.
## 기대값은 원본 공식(game.html 37608~43116)을 owner 값으로 재계산해 비교한다.
## Main 부팅 그룹은 격리 사용자 폴더(USERDIR) 필수 — 아니면 SKIP.

const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const USERDIR = "EXODUSER-P1002E-Isolated-20261019"
const GROUPS = ["providers_ready", "shield_absorb_hits", "overflow_and_kill_pipeline"]

var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var forced_actor_fields = 0
var hurte_outcomes: Array = []
var melee_resolved: Array = []
var halts: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P1002E_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P1002E_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P1002E_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields,
		"public_attack_api_used": true, "fallback_paths_used": false,
		"public_play_evidence": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P1002E_FAIL ", current_group, " ", label)

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
	for i in range(8):
		await physics_frame
	var world: Variant = active_main.get("world")
	if not is_instance_valid(world) or world.get("ready_for_player") != true:
		_check(false, "actual World ready_for_player")
		return false
	var player: Variant = active_main.get("player")
	player.telemetry_event.connect(_on_player_event)
	return true

func _on_player_event(kind: String, data: Dictionary) -> void:
	if kind == "native_hurte":
		hurte_outcomes.append(data.duplicate(true))
	elif kind == "melee_contact_resolved":
		melee_resolved.append(data.duplicate(true))
	elif kind == "native_hurte_halt":
		halts.append(data.duplicate(true))

func _eye_mass() -> Node:
	for enemy in active_main.get("world").get_enemies():
		if is_instance_valid(enemy) and str(enemy.get("data")["id"]) == "ch1_start_eye_mass_01":
			return enemy
	return null

# ── 원본 공식 재계산 (owner 값 기반 기대치) ──
func _expected_stat_crit() -> float:
	var state: Node = active_main.get("source_state")
	var stats: Dictionary = state.read_current_stats()
	var passives: Dictionary = state.read_current_passives()
	var inventory: Dictionary = state.read_current_inventory()
	var p: Dictionary = state.read_current_p()
	var lck: float = float(stats.get("lck", 0)) + float(FORMULA.js_to_int32(float(p.get("lv", 1)) * 0.5))
	for slot in inventory["equipped"]:
		var item: Variant = inventory["equipped"][slot]
		if item is Dictionary and (item.get("bLck") is int or item.get("bLck") is float):
			lck += float(item["bLck"])
	var crit: float = lck * 0.025 + float(passives.get("pCrit", 0)) * 1.5
	for slot in ["ring1", "ring2", "necklace"]:
		var item: Variant = inventory["equipped"].get(slot)
		if item is Dictionary and (item.get("critRate") is int or item.get("critRate") is float):
			crit += float(item["critRate"])
	return crit # 어픽스 critRate·crystal: 스타터 rarity0 = 0 (어픽스 배열 비었음을 별도 검증)

func _expected_stat_crit_dmg() -> float:
	var state: Node = active_main.get("source_state")
	var stats: Dictionary = state.read_current_stats()
	var passives: Dictionary = state.read_current_passives()
	var inventory: Dictionary = state.read_current_inventory()
	var p: Dictionary = state.read_current_p()
	var lck: float = float(stats.get("lck", 0)) + float(FORMULA.js_to_int32(float(p.get("lv", 1)) * 0.5))
	for slot in inventory["equipped"]:
		var item: Variant = inventory["equipped"][slot]
		if item is Dictionary and (item.get("bLck") is int or item.get("bLck") is float):
			lck += float(item["bLck"])
	return 1.5 + lck * 0.002 + float(passives.get("pCrit", 0)) * 0.08

func _swing_once(enemy: Node) -> Dictionary:
	# 적 투사체 피격으로 스윙이 취소되면 _melee_contact가 발생하지 않는다 —
	# 제품 결함이 아니라 교전 타이밍이므로 최대 3회 재시도한다.
	for attempt in range(3):
		var outcome: Dictionary = await _swing_attempt(enemy)
		if not outcome.is_empty():
			return outcome
	return {}

func _swing_attempt(enemy: Node) -> Dictionary:
	var player: Node2D = active_main.get("player")
	# 테스트 소유 배치: 사거리 내·접촉 밖(≈기본 사거리 47 + r) — 한계 기록.
	var stand: Vector2 = enemy.global_position + Vector2(-(47.0 + float(enemy.get("radius")) - 8.0), 0)
	player.global_position = stand
	player.set("facing", Vector2.RIGHT)
	forced_actor_fields += 2
	var before_outcomes: int = hurte_outcomes.size()
	if player.get("state") != "idle":
		for i in range(240):
			await physics_frame
			if player.get("state") == "idle":
				break
	var accepted: bool = player.request_attack()
	if not accepted:
		# 스태미나 부족 등 — 회복 대기 후 1회 재시도.
		for i in range(300):
			await physics_frame
			player.global_position = stand
			if player.get("state") == "idle" and float(player.get("stamina")) >= 10.0:
				break
		accepted = player.request_attack()
	if not accepted:
		return {}
	for i in range(300):
		await physics_frame
		if hurte_outcomes.size() > before_outcomes:
			break
	player.release_attack()
	# 스윙 종료까지 대기 (다음 request_attack을 위해 idle 복귀).
	for i in range(300):
		if player.get("state") == "idle":
			break
		await physics_frame
	if hurte_outcomes.size() <= before_outcomes:
		return {}
	return hurte_outcomes[-1]

func _test_providers_ready() -> void:
	var booted: bool = await _boot_main()
	if not booted:
		return
	var providers: Dictionary = active_main.get_native_normal_enemy_damage_provider_callbacks()
	_check(providers.size() == 12, "actual Main exposes 12 normal-enemy providers")
	var statuses: Dictionary = {}
	for key in ["eq_affix", "u_eq", "p_atk_mul", "melee_ref", "parry_lesson_active", "stat_str", "p_dot_pool", "l_eq", "rand", "el_mul", "play_time"]:
		var result: Variant
		match key:
			"eq_affix": result = providers[key].call("critRate")
			"u_eq": result = providers[key].call("_uAxeLeech")
			"l_eq": result = providers[key].call("_lGloveElem")
			"el_mul": result = providers[key].call(0, 3)
			_: result = providers[key].call()
		statuses[key] = str(result.get("status")) if result is Dictionary else "NON_DICT"
	var view: Variant = providers["player_view"].call()
	statuses["player_view"] = "READY" if view is Dictionary else "NOT_READY"
	observations["provider_statuses"] = statuses
	for key in ["eq_affix", "u_eq", "p_atk_mul", "melee_ref", "parry_lesson_active", "stat_str", "l_eq", "rand", "el_mul", "player_view"]:
		_check(statuses[key] == "READY", "path provider READY: " + key)
	# play_time: 이 경로에서 읽지 않음(42328·42664 선행 조건 단락) — 현 상태만 기록.
	observations["play_time_not_read_on_path"] = statuses["play_time"]
	var target: Node = _eye_mass()
	_check(is_instance_valid(target), "generic enemy.gd eye_mass_01 spawned")
	if is_instance_valid(target):
		_check(float(target.get("eShield")) == 875.0 and float(target.get("eShieldMax")) == 875.0,
			"mkEn eShield=mhp installed on generic enemy (875)")
		_check(int(target.get("hp")) == 875, "eye_mass hp 875")
	# 로드아웃: 기본 근접 LMB (공개 셀렉터 부재 — State P 직접 기록, 한계 기록).
	var p: Dictionary = active_main.get("source_state").read_current_p()
	p["activeLMBSk"] = "weapon"
	forced_actor_fields += 1
	var selection: Dictionary = active_main.get("player").get_native_attack_selection_snapshot()
	_check(selection.get("ready") == true and selection.get("route") == "basic_melee",
		"basic_melee LMB route selected (cost 5)")

func _test_shield_absorb_hits() -> void:
	if not is_instance_valid(active_main):
		return
	var enemy: Node = _eye_mass()
	if not is_instance_valid(enemy):
		_check(false, "eye_mass available")
		return
	var world: Node = active_main.get("world")
	var stat_crit: float = _expected_stat_crit()
	var stat_crit_dmg: float = _expected_stat_crit_dmg()
	observations["expected_stat_crit"] = stat_crit
	observations["expected_stat_crit_dmg"] = stat_crit_dmg
	var hits = 0
	while float(enemy.get("eShield")) > 0.0 and hits < 20:
		var shield_before: float = float(enemy.get("eShield"))
		var hp_before: float = float(enemy.get("hp"))
		var draws_before: int = int(world.get("_native_random_draw_count"))
		var outcome: Dictionary = await _swing_once(enemy)
		if outcome.is_empty():
			_check(false, "swing produced native_hurte outcome (hit %d)" % hits)
			return
		hits += 1
		_check(outcome.get("ok") == true, "hurtE completed without halt (hit %d): %s" % [hits, str(outcome.get("reason", ""))])
		if outcome.get("ok") != true:
			observations["halt_outcome"] = outcome
			return
		var base: int = int(melee_resolved[-1]["damage"])
		_check(base == int(outcome.get("base_damage")), "hitArc damage matches telemetry (hit %d)" % hits)
		# 원본 재계산: elMul(0,3)=1 → statStr(1) → (크리면 ×statCritDmg) → 쉴드 흡수.
		var expected: int = FORMULA.js_to_int32(float(FORMULA.js_to_int32(float(base) * 1.0)) * 1.0)
		var roll: float = float(outcome.get("crit_roll"))
		var expect_crit: bool = roll * 100.0 < stat_crit
		_check(outcome.get("is_crit") == expect_crit, "crit decision matches rand draw (hit %d)" % hits)
		_check(absf(float(outcome.get("stat_crit")) - stat_crit) < 0.0001, "statCrit matches source formula (hit %d)" % hits)
		if expect_crit:
			expected = FORMULA.js_to_int32(float(expected) * stat_crit_dmg)
		var absorbed: float = minf(shield_before, float(expected))
		var overflow: int = expected - int(absorbed)
		_check(absf(float(enemy.get("eShield")) - (shield_before - absorbed)) < 0.0001,
			"eShield absorbed exactly (hit %d: %s-%s)" % [hits, shield_before, absorbed])
		_check(absf(float(enemy.get("hp")) - (hp_before - float(overflow))) < 0.0001,
			"hp reduced only by shield overflow (hit %d: overflow %d)" % [hits, overflow])
		if overflow == 0:
			_check(float(enemy.get("hp")) == hp_before, "hp untouched while shield holds (hit %d)" % hits)
		# RNG: 비처치 타 = 크리 판정 1회만 (etype4는 피격음 RNG 없음·어픽스 0 → 추가 소비 없음).
		var draws: Array = outcome.get("rng_draws", [])
		if float(enemy.get("hp")) > 0.0:
			_check(draws.size() == 1 and str(draws[0]["purpose"]) == "crit",
				"rand provider consumed exactly once (crit) on non-kill hit %d" % hits)
			_check(int(world.get("_native_random_draw_count")) - draws_before >= 1, "world draw counter advanced (hit %d)" % hits)
	_check(hits >= 3, "shield required multiple hits (875 vs per-hit) — got %d" % hits)
	observations["shield_phase_hits"] = hits

func _test_overflow_and_kill_pipeline() -> void:
	if not is_instance_valid(active_main):
		return
	var enemy: Node = _eye_mass()
	if not is_instance_valid(enemy):
		_check(false, "eye_mass available")
		return
	var state: Node = active_main.get("source_state")
	var stat_crit: float = _expected_stat_crit()
	var stat_crit_dmg: float = _expected_stat_crit_dmg()
	var hits = 0
	while enemy.get("alive") == true and hits < 30:
		var shield_before: float = float(enemy.get("eShield"))
		var hp_before: float = float(enemy.get("hp"))
		var g_before: Dictionary = (state.read_current_g() as Dictionary).duplicate(true)
		var outcome: Dictionary = await _swing_once(enemy)
		if outcome.is_empty():
			_check(false, "swing produced native_hurte outcome (kill phase hit %d)" % hits)
			return
		hits += 1
		_check(outcome.get("ok") == true, "hurtE completed without halt (kill phase %d): %s" % [hits, str(outcome.get("reason", ""))])
		if outcome.get("ok") != true:
			observations["halt_outcome_kill"] = outcome
			return
		var base: int = int(outcome.get("base_damage"))
		var expected: int = FORMULA.js_to_int32(float(FORMULA.js_to_int32(float(base) * 1.0)) * 1.0)
		if float(outcome.get("crit_roll")) * 100.0 < stat_crit:
			expected = FORMULA.js_to_int32(float(expected) * stat_crit_dmg)
		var absorbed: float = minf(shield_before, float(expected))
		var overflow: int = expected - int(absorbed)
		_check(absf(float(enemy.get("hp")) - (hp_before - float(overflow))) < 0.0001,
			"hp follows source arithmetic (kill phase %d)" % hits)
		if enemy.get("alive") != true:
			# ── 처치 파이프라인 검증 ──
			var g: Dictionary = state.read_current_g()
			_check(int(g.get("kills")) == int(g_before.get("kills", 0)) + 1, "G.kills incremented (42702)")
			_check(int(g.get("_stageKills", 0)) == int(g_before.get("_stageKills", 0)) + 1, "G._stageKills incremented (42702)")
			_check(int(g.get("combo")) == int(g_before.get("combo", 0)) + 1, "G.combo incremented (42714)")
			_check(int(g.get("comboTimer")) == mini(1200, int(g_before.get("comboTimer", 0)) + 60), "G.comboTimer +60 capped (42715)")
			_check(int(g.get("_chainCnt", 0)) == (0 if int(g_before.get("_chainCnt", 0)) + 1 >= 5 else int(g_before.get("_chainCnt", 0)) + 1), "G._chainCnt chain rule (42756)")
			var potion_mats := 0
			for draw0 in outcome.get("rng_draws", []):
				if str(draw0.get("purpose")) == "potion_type" and int(float(draw0.get("value", 1.0)) * 3.0) == 0:
					potion_mats = 1 # P2-001c: 물약 hp → G.mats +1 (28253)
			_check(int(g.get("mats")) == int(g_before.get("mats", 0)) + 4 + potion_mats, "G.mats +4(+물약hp) (43103/28253)")
			_check(str(enemy.get("state")) == "dead", "enemy state dead")
			# RNG: 크리1 + 부활1(+구울1) + 고어3(r≥18) + 장판1(el=3≠P) + 물약2 = 8 또는 9.
			var draws: Array = outcome.get("rng_draws", [])
			var purposes: Array = []
			for draw in draws:
				purposes.append(str(draw["purpose"]))
			observations["kill_rng_draws"] = purposes
			var revive_roll_index: int = purposes.find("normal_revive")
			_check(revive_roll_index != -1, "normal mob revive roll consumed (42633)")
			var revived: bool = purposes.has("revive_as_ghoul")
			if revive_roll_index != -1:
				var revive_value: float = float(draws[revive_roll_index]["value"])
				_check(revived == (revive_value < 0.5), "ghoul roll consumed iff revive roll succeeded")
				var native: Dictionary = enemy.get("data")["native_final"]
				_check((native.get("_revived") == true) == revived, "revive bookkeeping flags recorded (resurrection UNPORTED)")
			var expected_order: Array = ["crit", "normal_revive"]
			if revived:
				expected_order.append("revive_as_ghoul")
			expected_order.append_array(["gore_common_or_rare", "gore_piece_index", "gore_large_extra", "death_zone", "potion_gate", "potion_type"])
			# P2-001c: 43110 rollDrop 이식으로 처치 롤 뒤에 drop:* 롤이 이어진다 —
			# 접두 순서는 기존 고정, 꼬리는 전부 drop:* (게이트 롤 최소 1회).
			_check(purposes.slice(0, expected_order.size()) == expected_order,
				"kill-hit rand prefix matches source (got %s)" % str(purposes))
			var drop_tail: Array = purposes.slice(expected_order.size())
			var tail_ok := drop_tail.size() >= 1
			for tail_purpose in drop_tail:
				if not str(tail_purpose).begins_with("drop:"):
					tail_ok = false
			_check(tail_ok and str(drop_tail[0]) == "drop:drop_gate" if drop_tail.size() >= 1 else false,
				"rollDrop rolls follow (first=drop_gate 32018) — got %s" % str(drop_tail))
			observations["kill_hits_total"] = hits
			observations["final_g"] = {"kills": g.get("kills"), "mats": g.get("mats"), "combo": g.get("combo"), "_chainCnt": g.get("_chainCnt"), "rifts": (g.get("rifts") as Array).size()}
			return
	_check(false, "enemy was killed within 30 hits")
