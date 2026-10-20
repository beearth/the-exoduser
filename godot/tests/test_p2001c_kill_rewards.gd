extends SceneTree
## P2-001c — 처치 보상 회귀: ① rollDrop/mkItem 모듈의 RNG 소비 순서·횟수(수계산 대조)
## ② addExp 증가식·레벨업 경계(43134/43128)·addPotion 조건(28250) ③ 실전 처치에서
## exp/mats/드랍 레코드/드랍 롤 꼬리/사망 사운드 디스패치.
## 결정성: ①②는 스크립트 주입 RNG·고정 수치 — 완전 결정적. ③은 기대값을 실제
## outcome/G에서 유도 — 단정 결정적. (5회 불필요 근거: 비결정 요소는 ③의 크리/부활
## 분기뿐이고 모두 적응형 단정.)
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const DROP_SOURCE = preload("res://port_modules/kill_reward/drop_item_source.gd")
const USERDIR = "EXODUSER-P2001C-Isolated-20261020"
# QA-002: 테스트 소유 입력. 제품 RNG 호출 순서는 변경하지 않는다.
const QA002_TEST_SEED = 20261020
const GROUPS = ["drop_module_pure", "reward_owner_units", "live_kill_rewards"]

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
		if group != "drop_module_pure" and not isolated:
			skipped.append(group)
			print("P2001C_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001C_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2001C_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or assertions == 0) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001C_FAIL ", current_group, " ", label)

func _cleanup() -> void:
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null

class ScriptedRng:
	var values: Array
	var default_value: float
	var draws: Array = []
	func _init(scripted: Array, fallback: float) -> void:
		values = scripted.duplicate()
		default_value = fallback
	func next(tag: Variant) -> Variant:
		var value: float = default_value
		if draws.size() < values.size():
			value = float(values[draws.size()])
		draws.append({"tag": str(tag), "value": value})
		return value

# ── ① 모듈 순수 검증 — RNG 소비 순서/횟수 수계산 대조 ──
func _test_drop_module_pure() -> void:
	# (a) 전부 미발동: normal 게이트 0.9>0.45, bone 0.9>0.02, crystal 0.9>0.15, stone 0.9>0.015 → 4롤.
	var rng_a := ScriptedRng.new([0.9, 0.9, 0.9, 0.9], 0.9)
	var dropper_a := DROP_SOURCE.new(Callable(rng_a, "next"))
	var enemy := {"ib": false, "etype": 4, "elite": 0, "drop_tier": 0, "x": 100.0, "y": 200.0}
	var ctx := {"stage": 0, "drop_bonus": 1.0, "min_pick_rar": 0, "min_pick_lv_thr": -1, "plv": 1,
		"crystal_bag_len": 0, "crystal_bag_max": 9999, "stone_bag_len": 0, "stone_bag_max": 9999}
	var result_a: Dictionary = dropper_a.roll_drop(enemy, ctx)
	_check(rng_a.draws.size() == 4, "all-miss path: 4 rolls (gate/bone/crystal/stone) got %d" % rng_a.draws.size())
	_check((result_a["world_items"] as Array).is_empty() and result_a["crystal"] == null and result_a["stone"] == null,
		"all-miss path: no outputs")
	_check(str(rng_a.draws[0]["tag"]) == "drop_gate" and str(rng_a.draws[1]["tag"]) == "bone_gate" \
		and str(rng_a.draws[2]["tag"]) == "crystal_gate" and str(rng_a.draws[3]["tag"]) == "stone_gate",
		"roll order 32018→32037→32049→32070")
	# (b) 무기 rarity0 드롭: 고정 소비 수 수계산 = 게이트1+rarity1+slot1+el1
	#   + mkItem(atk1 + base테이블28 + id1 + 무기분기3 + 임플리싯1 = 34) + 지터2 + 꼬리게이트3 = 43.
	var rng_b := ScriptedRng.new([0.0, 0.0, 0.0, 0.0], 0.9) # gate통과·rarity0·slot=weapon·el=0, 이후 0.9
	var dropper_b := DROP_SOURCE.new(Callable(rng_b, "next"))
	var result_b: Dictionary = dropper_b.roll_drop(enemy, ctx)
	_check(rng_b.draws.size() == 43, "weapon rarity0 path: exactly 43 rolls (hand-counted 15894~16166) got %d" % rng_b.draws.size())
	_check((result_b["world_items"] as Array).size() == 1, "one world item dropped")
	if (result_b["world_items"] as Array).size() == 1:
		var item: Dictionary = (result_b["world_items"] as Array)[0]["item"]
		_check(str(item["slot"]) == "weapon" and int(item["rarity"]) == 0 and int(item["el"]) == 0,
			"item slot/rarity/el from rolls")
		_check((DROP_SOURCE.load_tables()["WTYPES"] as Dictionary).has(str(item.get("wtype"))), "wtype from WTYPES")
		_check(str(item.get("name", "")) != "" and int(item.get("atk", 0)) >= 1, "weapon name/atk populated")
		_check(int(item.get("reqLv", -1)) == 0 and int(item.get("socketCount", -1)) == 0 \
			and (item.get("affixes") as Array).is_empty(), "reqLv0/socket0/affix0 (rarity0, 16117/16147/16149)")
		_check(item.get("_implicitStat") != null, "implicit applied (16119~)")
	# (c) rarity1 무기: rollAffixes maxCount=2 — 어픽스 2개(가중치+값 롤), 수 소비 >43.
	var rng_c := ScriptedRng.new([0.0, 0.70, 0.0, 0.0], 0.5) # rarity roll 0.70×100.04=70.03 → acc 65<70.03<87 → rarity1
	var dropper_c := DROP_SOURCE.new(Callable(rng_c, "next"))
	var result_c: Dictionary = dropper_c.roll_drop(enemy, ctx)
	var item_c: Dictionary = (result_c["world_items"] as Array)[0]["item"] if not (result_c["world_items"] as Array).is_empty() else {}
	_check(int(item_c.get("rarity", -1)) == 1, "rarity weights: 0.70 → rarity1 (65/22 경계)")
	_check((item_c.get("affixes") as Array).size() <= 2 and (item_c.get("affixes") as Array).size() >= 1,
		"rarity1 affix count <= maxCount 2 (15144)")
	_check(rng_c.draws.size() > 43, "rarity1 consumes more rolls than rarity0 (affix rolls)")
	# (d) 결정 드롭 분기: 게이트 미스 후 crystal 0.1 → id/star/quality 소비, star 규칙(0.8 경계).
	var rng_d := ScriptedRng.new([0.9, 0.9, 0.1, 0.5, 0.9, 0.5, 0.9], 0.9)
	var dropper_d := DROP_SOURCE.new(Callable(rng_d, "next"))
	var result_d: Dictionary = dropper_d.roll_drop(enemy, ctx)
	_check(rng_d.draws.size() == 7, "crystal-only path: 7 rolls got %d" % rng_d.draws.size())
	_check(result_d["crystal"] is Dictionary and int((result_d["crystal"] as Dictionary)["star"]) == 1 \
		and int((result_d["crystal"] as Dictionary)["q"]) == 51,
		"crystal star(0.9>=0.8→1)/quality(1+⌊0.5×100⌋=51) per 32059/15304")
	_check((result_d["texts"] as Array).size() == 1, "crystal pickup text emitted")
	observations["pure_draw_tags_b"] = []
	for draw in rng_b.draws.slice(0, 12):
		(observations["pure_draw_tags_b"] as Array).append(draw["tag"])

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
	if active_main.get("world").get("ready_for_player") != true:
		_check(false, "actual World ready_for_player")
		return false
	active_main.get("player").telemetry_event.connect(func(kind, data):
		if kind == "native_hurte": hurte_outcomes.append(data.duplicate(true)))
	return true

# ── ② owner 단위: addExp 레벨업 경계·addPotion 조건 ──
func _test_reward_owner_units() -> void:
	if not await _boot_main():
		return
	var state: Node = active_main.get("source_state")
	# 사망 사운드 에셋: 설치자 성공 = 전 샘플 디코딩 (8 공격 + 21 사망 = 29).
	var audio: Dictionary = active_main.call("read_native_attack_audio_settings")
	_check(audio.get("ready") == true, "audio settings ready (all samples incl. death decoded)")
	# addPotion: hp → mats+1 / st·mp → 버림 (28250~28263).
	var g: Dictionary = state.read_current_g()
	var mats_before: int = int(g.get("mats", 0))
	var potion_hp: Dictionary = state.apply_native_add_potion(active_main, "hp", 1)
	_check(potion_hp.get("applied") == true and potion_hp.get("accepted") == true \
		and int(state.read_current_g().get("mats")) == mats_before + 1, "addPotion('hp') → G.mats +1 (28253)")
	var potion_st: Dictionary = state.apply_native_add_potion(active_main, "st", 1)
	_check(potion_st.get("applied") == true and potion_st.get("accepted") == false \
		and int(state.read_current_g().get("mats")) == mats_before + 1, "addPotion('st') → 버림 (POT 27677 hp only)")
	# addExp 경계: lv1 exp0 maxExp15(mkP) + 20 → lv2, exp5, maxExp=_calcMaxExp(2)=20, sp+3, ap+1.
	var p: Dictionary = state.read_current_p()
	_check(int(p.get("lv")) == 1 and int(p.get("exp")) == 0 and int(p.get("maxExp")) == 15,
		"boot P lv1/exp0/maxExp15 (mkP 29655)")
	var player: Node2D = active_main.get("player")
	player.hp = 100.0 # 레벨업 20% 회복 관측용 (테스트 소유 개입)
	forced_actor_fields += 1
	var exp_result: Dictionary = state.apply_native_add_exp(active_main, 20)
	p = state.read_current_p()
	_check(exp_result.get("applied") == true and int(exp_result.get("levels")) == 1, "20exp → 1 level-up")
	_check(int(p.get("lv")) == 2 and int(p.get("exp")) == 5 and int(p.get("maxExp")) == 20,
		"level boundary: exp 20-15=5, maxExp=_calcMaxExp(2)=~~(20.2×1.001^2)=20 (43128)")
	_check(int(p.get("sp")) == 3 and int(p.get("ap")) == 1, "SP+3, AP+1(짝수렙) (43153~43155)")
	_check(absf(float(player.hp) - (100.0 + float(int(player.max_hp * 0.2)))) < 0.0001,
		"level-up heal hp+~~(mhp×.2) (43160, authority 경유)")
	observations["exp_unit"] = {"lv": p.get("lv"), "exp": p.get("exp"), "maxExp": p.get("maxExp"),
		"unported": exp_result.get("unported")}

# ── ③ 실전: 기본 근접 처치 → exp/mats/드랍 레코드/롤 꼬리/사망 사운드 ──
func _test_live_kill_rewards() -> void:
	if not is_instance_valid(active_main):
		return
	var state: Node = active_main.get("source_state")
	var world: Node = active_main.get("world")
	var player: Node2D = active_main.get("player")
	var enemy: Node = null
	for candidate in world.get_enemies():
		if is_instance_valid(candidate) and str(candidate.get("data")["id"]) == "ch1_start_eye_mass_01":
			enemy = candidate
	if not is_instance_valid(enemy):
		_check(false, "eye_mass_01 available")
		return
	var p: Dictionary = state.read_current_p()
	p["activeLMBSk"] = "weapon"
	forced_actor_fields += 1
	var dispatches_before: int = int(active_main.get("_death_sound_dispatches"))
	var killed_outcome: Dictionary = {}
	var swings := 0
	while killed_outcome.is_empty() and swings < 25:
		swings += 1
		if float(p.get("hp", 0)) < float(p.get("mhp", 0)):
			p["hp"] = p.get("mhp", 350)
			player.set("hp", float(p.get("mhp", 350)))
			forced_actor_fields += 1
		if player.get("state") != "idle":
			for i in range(240):
				await physics_frame
				if player.get("state") == "idle":
					break
		var stand: Vector2 = enemy.global_position + Vector2(-(47.0 + float(enemy.get("radius")) - 8.0), 0)
		player.global_position = stand
		player.set("facing", (enemy.global_position - stand).normalized())
		forced_actor_fields += 2
		var g_before: Dictionary = (state.read_current_g() as Dictionary).duplicate(true)
		var p_before: Dictionary = (state.read_current_p() as Dictionary).duplicate(true)
		var before: int = hurte_outcomes.size()
		if not player.request_attack():
			player.release_attack()
			for i in range(600):
				await physics_frame
				if player.get("state") == "idle" and float(player.get("stamina")) >= 20.0:
					break
			continue
		for i in range(300):
			await physics_frame
			if hurte_outcomes.size() > before:
				break
		player.release_attack()
		for outcome in hurte_outcomes.slice(before):
			if int(outcome.get("enemy_id", 0)) != enemy.get_instance_id():
				continue
			_check(outcome.get("ok") == true, "hurtE ok (swing %d): %s" % [swings, str(outcome.get("reason", ""))])
			if outcome.get("ok") != true:
				observations["halt"] = outcome
				return
			if outcome.get("killed") != true:
				continue
			killed_outcome = outcome
			# ── 보상 검증 ──
			var journal: Array = outcome.get("journal", [])
			var by_op: Dictionary = {}
			for row in journal:
				by_op[str(row.get("op"))] = row.get("data")
			var g_now: Dictionary = state.read_current_g()
			var p_now: Dictionary = state.read_current_p()
			# exp: raw=js(max(5, js(lv×.4))×comboBonus), v=js(raw/3) — lv1·어픽스0.
			var combo_bonus: float = 1.0 + float(FORMULA.js_to_int32(float(g_now.get("combo")) / 100.0)) * 0.05
			var expected_raw: int = FORMULA.js_to_int32(5.0 * combo_bonus)
			var expected_value: int = FORMULA.js_to_int32(float(expected_raw) / 3.0)
			_check(by_op.has("add_exp") and int((by_op["add_exp"] as Dictionary)["value"]) == expected_value,
				"addExp value = js(js(max(5,⌊lv×.4⌋)×comboBonus)/3) = %d (43112~43144)" % expected_value)
			_check(int(p_now.get("exp")) == int(p_before.get("exp")) + expected_value,
				"P.exp increased by addExp value")
			# mats: +4(43103) + potion hp면 +1(28253).
			var potion_data: Dictionary = by_op.get("potion_applied", {})
			var expected_mats: int = int(g_before.get("mats", 0)) + 4 + (1 if potion_data.get("accepted") == true else 0)
			_check(int(g_now.get("mats")) == expected_mats, "G.mats +4(+포션hp시 +1) = %d" % expected_mats)
			_check((str(potion_data.get("type")) == "hp") == (potion_data.get("accepted") == true),
				"potion accepted iff type hp (POT 27677)")
			# 드랍 롤 꼬리: potion_type 뒤 drop:drop_gate부터.
			var purposes: Array = []
			for draw in outcome.get("rng_draws", []):
				purposes.append(str(draw["purpose"]))
			var potion_index: int = purposes.find("potion_type")
			_check(potion_index >= 0 and purposes.size() > potion_index + 1 \
				and str(purposes[potion_index + 1]) == "drop:drop_gate",
				"rollDrop tail starts with drop:drop_gate after potion rolls (43110)")
			# 드랍 레코드·가방 owner 일치.
			var drop_data: Dictionary = by_op.get("roll_drop", {})
			_check(state.read_native_drop_records().size() >= int(drop_data.get("items", 0)) \
				and state.read_native_drop_records().size() <= 20,
				"drop records owner consistent (cap 20 — _wiPush 16721)")
			var bags: Dictionary = state.read_native_reward_bags()
			_check(((bags["crystal"] as Array).size() >= 1) == (drop_data.get("crystal") == true),
				"crystal bag matches journal")
			observations["kill_journal"] = {"add_exp": by_op.get("add_exp"), "roll_drop": drop_data,
				"potion": potion_data}
			break
	_check(not killed_outcome.is_empty(), "enemy killed within 25 swings")
	_check(int(active_main.get("_death_sound_dispatches")) > dispatches_before,
		"death sound dispatched on kill (24805~)")
	observations["death_sound_dispatches"] = active_main.get("_death_sound_dispatches")
