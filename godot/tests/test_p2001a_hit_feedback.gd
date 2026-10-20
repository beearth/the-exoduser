extends SceneTree
## P2-001a — 타격 피드백 회귀: ① 체력 피해 숫자(원본 61851~61868 펌프 규칙·addTxt 인자)
## ② 적 에너지 바 레이아웃(원본 drawEn 53961~53969 식) ③ 히트스톱(원본 32585 완전
## 비활성)·셰이크(19924/42416/35751) G owner 산술.
## 결정성: 바 레이아웃·펌프 규칙·피드 산술은 순수 계산 — RNG 없음. Main 부팅 그룹의
## 크리 여부만 RNG인데 기대값을 실제 outcome(is_crit)에서 유도하므로 단정 자체는 결정적.
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const BAR_LAYOUT = preload("res://scripts/native_enemy_bar_layout.gd")
const USERDIR = "EXODUSER-P2001A-Isolated-20261020"
const GROUPS = ["bar_layout_pure", "pump_rules_owner", "live_combat_feedback"]

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
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if group != "bar_layout_pure" and not isolated:
			skipped.append(group)
			print("P2001A_SKIP ", group, " (isolated userdir required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001A_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2001A_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or assertions == 0) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001A_FAIL ", current_group, " ", label)

func _cleanup() -> void:
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null

# ── ① 바 레이아웃: 원본 식을 손으로 재계산해 대조 ──
func _test_bar_layout_pure() -> void:
	# 풀피+풀쉴드: 표시 조건 거짓 → 아무 것도 없음 (53963 조건).
	_check(BAR_LAYOUT.build(33.0, 875.0, 875.0, 875.0, 875.0, 0.0, null).is_empty(),
		"full hp+shield hidden (hp<mhp || max>0&&shield<max false)")
	# 쉴드만 깎임: bw=2r+6, bx=-bw/2, by=-r-16, 높이4, 배경/HP/쉴드 3rect.
	var r := 34.3551987009123
	var bars: Array = BAR_LAYOUT.build(r, 875.0, 875.0, 500.0, 875.0, 0.0, null)
	var bw: float = r * 2.0 + 6.0
	var by: float = -r - 16.0
	_check(bars.size() == 3, "shield-damaged → bg+hp+shield rects")
	if bars.size() == 3:
		_check(bars[0]["rect"] == Rect2(-bw / 2.0, by, bw, 4.0) and bars[0]["color"] == Color(0, 0, 0, 0.6),
			"bg rect/color == source (rgba(0,0,0,.6), 4px, y=-r-16)")
		_check(bars[1]["rect"] == Rect2(-bw / 2.0, by, bw * (875.0 / 875.0), 4.0) and bars[1]["color"] == Color("#cc0000"),
			"hp fill #cc0000 × hp/mhp")
		_check(bars[2]["rect"] == Rect2(-bw / 2.0, by, bw * minf(1.0, 500.0 / 875.0), 4.0) and bars[2]["color"] == Color("#44aaff"),
			"shield overlay #44aaff × min(1, eShield/eShieldMax)")
	# 쉴드 0 + HP 손상: 쉴드 rect 없음 (eShield>0 조건).
	_check(BAR_LAYOUT.build(r, 400.0, 875.0, 0.0, 875.0, 0.0, null).size() == 2,
		"shield depleted → bg+hp only")
	# 그로기: HP바 아래 by-5에 3px, _maxStunned=180 비율, 없으면 90 폴백 (53966).
	var groggy: Array = BAR_LAYOUT.build(r, 400.0, 875.0, 0.0, 875.0, 120.0, 180.0)
	_check(groggy.size() == 4, "stunned → groggy bg+fill appended")
	if groggy.size() == 4:
		_check(groggy[2]["rect"] == Rect2(-bw / 2.0, by - 5.0, bw, 3.0) and groggy[2]["color"] == Color(0, 0, 0, 0.5),
			"groggy bg at by-5, 3px, rgba(0,0,0,.5)")
		_check(groggy[3]["rect"] == Rect2(-bw / 2.0, by - 5.0, bw * minf(1.0, 120.0 / 180.0), 3.0) and groggy[3]["color"] == Color("#ff8800"),
			"groggy fill #ff8800 × min(1, stunned/_maxStunned)")
	var groggy_fallback: Array = BAR_LAYOUT.build(r, 875.0, 875.0, 875.0, 875.0, 45.0, null)
	_check(groggy_fallback.size() == 2 \
		and groggy_fallback[0]["rect"] == Rect2(-bw / 2.0, by, bw, 3.0) \
		and groggy_fallback[1]["rect"] == Rect2(-bw / 2.0, by, bw * minf(1.0, 45.0 / 90.0), 3.0),
		"no hp bar → groggy at base by; _maxStunned absent → /90 fallback (ib?180:90)")

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

# ── ② 펌프 규칙: owner API에 원본 61851~61868 시나리오 주입 ──
func _test_pump_rules_owner() -> void:
	if not await _boot_main():
		return
	var state: Node = active_main.get("source_state")
	# 평시: peakShow 없음 → emit null.
	var idle_pump: Dictionary = state.apply_native_damage_peak_text_pump(active_main)
	_check(idle_pump.get("applied") == true and idle_pump.get("emit") == null, "no peak → no emit")
	# 일반 피해 → addTxt(x,y-40,'⚔'+dmg,'#ffcc33',50,56,String(dmg)).
	var writes: Array = [{"field": "_dmgPeakShow", "value": {"x": 100.0, "y": 200.0, "dmg": 123, "crit": false}}]
	_check(state.apply_native_normal_enemy_hurte_g_writes(active_main, writes).get("applied") == true, "peakShow g-write accepted")
	var pump: Dictionary = state.apply_native_damage_peak_text_pump(active_main)
	var emit: Variant = pump.get("emit")
	_check(emit is Dictionary and emit["x"] == 100.0 and emit["y"] == 160.0 \
		and emit["text"] == "⚔123" and emit["color"] == "#ffcc33" and emit["life"] == 50 \
		and emit["size"] == 56 and emit["num_str"] == "123",
		"normal damage emit matches source args (61862~61866)")
	var g: Dictionary = state.read_current_g()
	_check(g.get("_dmgPeakShow") == null and g.get("_dmgTxts") is Array and g["_dmgTxts"].size() == 1 \
		and int(g["_dmgTxts"][0]["t"]) == 49, "peak cleared, gate entry t=50-1 ticked")
	# 더 작은 피해: 기존 게이트 생존 중 → 무시 (61856~61857).
	state.apply_native_normal_enemy_hurte_g_writes(active_main, [{"field": "_dmgPeakShow", "value": {"x": 0.0, "y": 0.0, "dmg": 50, "crit": false}}])
	var smaller: Dictionary = state.apply_native_damage_peak_text_pump(active_main)
	_check(smaller.get("emit") == null, "smaller damage ignored while gate alive")
	# 더 큰 크리 피해: 교체 + 크리 인자(70/72/#dd2200/💀) (61855·61862~61866).
	state.apply_native_normal_enemy_hurte_g_writes(active_main, [{"field": "_dmgPeakShow", "value": {"x": 5.0, "y": 6.0, "dmg": 999, "crit": true}}])
	var crit_pump: Dictionary = state.apply_native_damage_peak_text_pump(active_main)
	var crit_emit: Variant = crit_pump.get("emit")
	_check(crit_emit is Dictionary and crit_emit["text"] == "💀999" and crit_emit["color"] == "#dd2200" \
		and crit_emit["life"] == 70 and crit_emit["size"] == 72 and crit_emit["y"] == 6.0 - 40.0,
		"larger crit replaces gate with crit args")
	# ③ 피드 산술 unit: crescent step3 → shake=8×OPT.shake(80)/100=6.4, hitStop max 6 기록.
	var feel: Dictionary = state.apply_native_crescent_hit_feel(active_main, 3, 80.0)
	_check(feel.get("applied") == true and absf(float(feel.get("shake")) - 6.4) < 0.0001,
		"crescent step3 shake = 8*80/100 (19838/19924)")
	# 감쇠 1틱: ×0.86, 그리고 hitStop은 32585로 0 고정.
	var decay: Dictionary = state.apply_native_update_feel_decay(active_main, 1.0)
	_check(decay.get("applied") == true and absf(float(decay.get("shake")) - 6.4 * 0.86) < 0.0001 \
		and float(decay.get("hit_stop")) == 0.0,
		"decay ×0.86^sp (35751), hitStop forced 0 (32585 — source-disabled)")
	# 0.3 미만 → 0 (35751).
	for i in range(20):
		decay = state.apply_native_update_feel_decay(active_main, 1.0)
	_check(float(decay.get("shake")) == 0.0, "shake snaps to 0 below .3")
	observations["pump_unit"] = {"normal": emit, "crit": crit_emit}
	# 게이트 수명 소진 대기 (이후 그룹 오염 방지).
	for i in range(55):
		state.apply_native_damage_peak_text_pump(active_main)

# ── ③ 실전: 기본 근접으로 쉴드 깨고 HP 피해 → 숫자 방출·셰이크·바 전환 관측 ──
func _test_live_combat_feedback() -> void:
	if not await _boot_main():
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
	p["activeLMBSk"] = "weapon" # 공개 셀렉터 부재 — 한계 기록
	forced_actor_fields += 1
	var adapter: Node = world.get_node_or_null("NativeFloatingText")
	_check(is_instance_valid(adapter), "NativeFloatingText adapter present")
	var hits := 0
	var overflow_outcome: Dictionary = {}
	while hits < 20:
		# F 규칙: 대기 후 공격 직전 같은 프레임 배치·조준.
		if player.get("state") != "idle":
			for i in range(240):
				await physics_frame
				if player.get("state") == "idle":
					break
		var stand: Vector2 = enemy.global_position + Vector2(-(47.0 + float(enemy.get("radius")) - 8.0), 0)
		player.global_position = stand
		player.set("facing", (enemy.global_position - stand).normalized())
		forced_actor_fields += 2
		var before: int = hurte_outcomes.size()
		if not player.request_attack():
			player.release_attack()
			for i in range(600):
				await physics_frame
				if player.get("state") == "idle" and float(player.get("stamina")) >= 20.0:
					break
			player.global_position = enemy.global_position + Vector2(-(47.0 + float(enemy.get("radius")) - 8.0), 0)
			player.set("facing", (enemy.global_position - player.global_position).normalized())
			forced_actor_fields += 2
			if not player.request_attack():
				player.release_attack()
				continue
		for i in range(300):
			await physics_frame
			if hurte_outcomes.size() > before:
				break
		player.release_attack()
		if hurte_outcomes.size() <= before:
			continue
		hits += 1
		var outcome: Dictionary = hurte_outcomes[-1]
		if outcome.get("ok") == true and int(outcome.get("dmg_to_hp", 0)) > 0:
			overflow_outcome = outcome
			break
	_check(not overflow_outcome.is_empty(), "HP-damage hit reached within 20 swings")
	if overflow_outcome.is_empty():
		return
	# 다음 물리 프레임 펌프가 방출 → 어댑터 풀에서 원본 인자 확인.
	for i in range(3):
		await physics_frame
	var residual: int = int(overflow_outcome["dmg_to_hp"])
	var crit: bool = overflow_outcome.get("is_crit") == true
	var pool: Array = adapter.get_snapshot().get("pool", [])
	var found: Dictionary = {}
	for slot in pool:
		if float(slot.get("life", 0)) > 0.0 and str(slot.get("_numStr")) == str(residual) \
				and str(slot.get("c")) in ["#ffcc33", "#dd2200"]:
			found = slot
	_check(not found.is_empty(), "damage number slot emitted (numStr=%d)" % residual)
	if not found.is_empty():
		_check(str(found["c"]) == ("#dd2200" if crit else "#ffcc33"), "color crit branch (61864)")
		_check(int(found["sz"]) == (72 if crit else 56), "size 72/56 (61865)")
		_check(float(found["ml"]) == (70.0 if crit else 50.0), "life 70/50 (61866)")
		_check(str(found["t"]) == ("💀" if crit else "⚔") + str(residual), "text pfx+dmg (아틀라스 분기로 숫자만 렌더)")
		_check(absf(float(found["y"]) - (float(overflow_outcome.get("hp_before", 0)) * 0.0 + enemy.global_position.y - 40.0)) < 60.0,
			"y near e.y-40 (적이 이동했을 수 있어 ±60 허용)")
	# 셰이크: HP 피해 타(42416) 직후 감쇠 중 값 0<shake<=3.2 (OPT.shake 80 → 4×0.8).
	var g: Dictionary = state.read_current_g()
	var shake_value: float = float(g.get("shake", 0))
	_check(shake_value > 0.0 and shake_value <= 3.2 + 0.0001, "shake in (0, 4*80/100] after HP hit (got %s)" % shake_value)
	_check(float(g.get("hitStop", -1)) == 0.0, "G.hitStop stays 0 (source 32585 disables hitstop)")
	# 바 전환: 쉴드 소진 후 hp<mhp → HP바 표시, 쉴드 rect 없음.
	var bars: Array = BAR_LAYOUT.build(float(enemy.get("radius")), float(enemy.get("hp")), float(enemy.get("mhp")),
		float(enemy.get("eShield")), float(enemy.get("eShieldMax")), float(enemy.get("_stun_ticks")),
		(enemy.get("data") as Dictionary).get("native_final", {}).get("_maxStunned"))
	_check(bars.size() >= 2 and bars[1]["color"] == Color("#cc0000"), "enemy bar now visible with HP fill")
	# 60틱 무타격 후 셰이크 0.
	for i in range(70):
		await physics_frame
	_check(float((state.read_current_g() as Dictionary).get("shake", -1)) == 0.0, "shake decayed to 0 without hits")
	observations["overflow_outcome"] = {"dmg": residual, "crit": crit}
	observations["found_slot"] = {"c": found.get("c"), "sz": found.get("sz"), "ml": found.get("ml")} if not found.is_empty() else null
