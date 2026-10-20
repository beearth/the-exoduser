extends SceneTree
## P1-002.G — 검기(kiSlash) 피해의 원본 hurtE 경로 회귀 (실제 Main 부팅).
## 대상: 첫 스테이지 hurtE owner 일반 적 6마리 — generic eye_mass 2(etype4 el3 dark)
##       + 전용 4종(flesh etype0 el0 / spine etype4 el0 / ice etype4 el2 / hive etype1 el4).
## 경로: 공개 request_attack()(activeLMBSk='kiSlash') → crescent_requested → main 스폰
##       → crescent.gd 충돌 루프 → native_normal_enemy_hurte(opts {poiseHit, kbMult .5,
##       noImpact, _kiFull}). atkEl=0 (원본 c.el=0 고정).
## 원본 밸런스 전제: kiSlash Lv1 = 84×/타(44543 b12.0) → 스타터에서 1스테이지 일반몹
## (쉴드875+HP875)을 **한 타에 처치** — 매 적중 = 쉴드 875 전액 흡수 + HP 오버플로 +
## 포이즈 붕괴(amt=잔여>875) + 처치 파이프라인이 한 outcome에 모두 발생한다.
## (부분 흡수·비처치 타·그로기 후속타 ×1.5는 이 수치에서 도달 불가 — weapon 프로필
##  E/F 테스트가 그 경로를 커버. 수치는 원본 그대로, 임의 변경 없음.)
## F에서 배운 하니스 규칙 유지: 모든 대기 후 request 직전 같은 프레임 재배치·재조준,
## 거부 즉시 release, 스윙별 진단 로그, dry 상한 8 (완화 없음).
## 테스트 소유 개입(forced_actor_fields 집계): activeLMBSk 직접 기록, 배치/조준, P.hp 회복.
## Main 부팅 그룹은 격리 사용자 폴더(USERDIR) 필수 — 아니면 SKIP.

const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const USERDIR = "EXODUSER-P1002G-Isolated-20261020"
# QA-002: 테스트 소유 입력. 제품 RNG 호출 순서는 변경하지 않는다.
const QA002_TEST_SEED = 20261020
const GROUPS = ["setup", "combat", "per_enemy_coverage"]
const TARGETS: Array = [
	{"group": "eye_mass_01", "id": "ch1_start_eye_mass_01", "el": 3, "poise_route": "owner_core", "contact_safe": false},
	{"group": "eye_mass_02", "id": "ch1_start_eye_mass_02", "el": 3, "poise_route": "owner_core", "contact_safe": false},
	{"group": "flesh_crawler", "id": "ch1_initial_015", "el": 0, "poise_route": "v3_field_call", "contact_safe": false},
	{"group": "spine_beast", "id": "ch1_initial_014", "el": 0, "poise_route": "owner_core", "contact_safe": false},
	{"group": "ice_soul_flame", "id": "ch1_initial_009", "el": 2, "poise_route": "owner_core", "contact_safe": false},
	{"group": "hive_bloater", "id": "ch1_initial_016", "el": 4, "poise_route": "owner_core", "contact_safe": true}]
const CAST_GAP := 120.0 # 검기 비행 250px 안·근접 접촉 반경 밖

var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var forced_actor_fields = 0
var hurte_outcomes: Array = []
var halts: Array = []
var crescent_spawns: Array = []
var swing_log: Array = []
var reject_events: Array = []
var player_damage_count: int = 0
var tracked: Dictionary = {}
var stat_crit: float = 0.0
var stat_crit_dmg: float = 1.5
var full_charge_done := false

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
			print("P1002G_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P1002G_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P1002G_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields,
		"public_attack_api_used": true, "fallback_paths_used": false,
		"public_play_evidence": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P1002G_FAIL ", current_group, " ", label)

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
	elif kind == "native_hurte_halt":
		halts.append(data.duplicate(true))
	elif kind == "crescent_spawned":
		crescent_spawns.append(data.duplicate(true))
	elif kind in ["stamina_insufficient", "attack_parameters_rejected", "active_lmb_rejected", "player_died"]:
		reject_events.append({"kind": kind, "data": data.duplicate(true)})
	elif kind == "player_damage":
		player_damage_count += 1

func _find_enemy(id: String) -> Node:
	for enemy in active_main.get("world").get_enemies():
		if is_instance_valid(enemy) and str(enemy.get("data")["id"]) == id:
			return enemy
	return null

# ── 원본 공식 재계산 (owner 값 기반 기대치 — E/F 테스트와 동일) ──
func _lck_total() -> float:
	var state: Node = active_main.get("source_state")
	var stats: Dictionary = state.read_current_stats()
	var inventory: Dictionary = state.read_current_inventory()
	var p: Dictionary = state.read_current_p()
	var lck: float = float(stats.get("lck", 0)) + float(FORMULA.js_to_int32(float(p.get("lv", 1)) * 0.5))
	for slot in inventory["equipped"]:
		var item: Variant = inventory["equipped"][slot]
		if item is Dictionary and (item.get("bLck") is int or item.get("bLck") is float):
			lck += float(item["bLck"])
	return lck

func _expected_stat_crit() -> float:
	var state: Node = active_main.get("source_state")
	var passives: Dictionary = state.read_current_passives()
	var inventory: Dictionary = state.read_current_inventory()
	var crit: float = _lck_total() * 0.025 + float(passives.get("pCrit", 0)) * 1.5
	for slot in ["ring1", "ring2", "necklace"]:
		var item: Variant = inventory["equipped"].get(slot)
		if item is Dictionary and (item.get("critRate") is int or item.get("critRate") is float):
			crit += float(item["critRate"])
	return crit

func _expected_stat_crit_dmg() -> float:
	var passives: Dictionary = active_main.get("source_state").read_current_passives()
	return 1.5 + _lck_total() * 0.002 + float(passives.get("pCrit", 0)) * 0.08

func _heal_player() -> void:
	var p: Dictionary = active_main.get("source_state").read_current_p()
	if float(p.get("hp", 0)) < float(p.get("mhp", 0)):
		p["hp"] = p.get("mhp", 350)
		active_main.get("player").set("hp", float(p.get("mhp", 350)))
		forced_actor_fields += 1

func _pick_stand(enemy: Node, gap: float) -> Vector2:
	var world: Node = active_main.get("world")
	var best: Vector2 = enemy.global_position + Vector2(-gap, 0)
	var best_score: float = -INF
	for i in range(8):
		var stand: Vector2 = enemy.global_position + Vector2.from_angle(TAU * float(i) / 8.0) * gap
		if world.has_method("can_move") and not world.can_move(stand, 15.0):
			continue
		var nearest: float = INF
		for other in world.get_enemies():
			if other == enemy or not is_instance_valid(other) or other.get("alive") != true:
				continue
			nearest = minf(nearest, stand.distance_to(other.global_position) - float(other.get("radius")))
		if nearest > best_score:
			best_score = nearest
			best = stand
	return best

func _place_for_cast(player: Node2D, enemy: Node) -> void:
	# request 직전 같은 프레임의 배치·조준 — _attack_direction=facing 래치(player.gd:599/679).
	var stand: Vector2 = _pick_stand(enemy, CAST_GAP)
	player.global_position = stand
	player.set("facing", (enemy.global_position - stand).normalized())
	forced_actor_fields += 2

func _test_setup() -> void:
	var booted: bool = await _boot_main()
	if not booted:
		return
	stat_crit = _expected_stat_crit()
	stat_crit_dmg = _expected_stat_crit_dmg()
	observations["expected_stat_crit"] = stat_crit
	observations["expected_stat_crit_dmg"] = stat_crit_dmg
	for target in TARGETS:
		var enemy: Node = _find_enemy(target["id"])
		_check(is_instance_valid(enemy), "enemy spawned: " + str(target["id"]))
		if not is_instance_valid(enemy):
			continue
		_check(float(enemy.get("eShield")) == 875.0 and float(enemy.get("eShieldMax")) == 875.0,
			"mkEn eShield=mhp installed (875): " + str(target["group"]))
		var fields: Dictionary = enemy.read_native_normal_enemy_hurte_fields(active_main.get("world"))
		_check(fields.get("ready") == true and int(fields.get("el", -1)) == int(target["el"]),
			"hurtE owner fields ready + el match: " + str(target["group"]))
		tracked[enemy.get_instance_id()] = {"target": target, "node": enemy,
			"absorbed_seen": false, "overflow_seen": false, "killed_checked": false,
			"stagger_checked": false, "hits": 0}
	# 로드아웃: kiSlash LMB (공개 셀렉터 부재 — State P 직접 기록, 한계 기록).
	var p: Dictionary = active_main.get("source_state").read_current_p()
	p["activeLMBSk"] = "kiSlash"
	forced_actor_fields += 1
	var selection: Dictionary = active_main.get("player").get_native_attack_selection_snapshot()
	_check(selection.get("ready") == true and selection.get("emit_ki_slash") == true,
		"kiSlash LMB route selected (emit_ki_slash)")
	# 공격 방향 결정 근거 실측 (F와 동일 관측).
	var probe: Node2D = active_main.get("player")
	probe.set("facing", Vector2.RIGHT)
	forced_actor_fields += 1
	await physics_frame
	observations["aim_basis"] = {
		"pointer_provider_bound": probe.get("_native_ground_pointer_bound") == true,
		"facing_write_survives_frame": (probe.get("facing") as Vector2).distance_to(Vector2.RIGHT) < 0.001}
	# c.dmg 공식 대조용 파라미터.
	var parameters: Dictionary = probe.get_native_attack_parameters()
	_check(parameters.get("ready") == true, "attack parameters ready")
	observations["melee_ref"] = parameters.get("melee_ref")

func _alive_tracked() -> Array:
	var out: Array = []
	for id in tracked:
		var entry: Dictionary = tracked[id]
		if is_instance_valid(entry["node"]) and entry["node"].get("alive") == true:
			out.append(entry)
	return out

func _test_combat() -> void:
	if not is_instance_valid(active_main) or tracked.is_empty():
		return
	var casts = 0
	var dry_casts = 0
	while _alive_tracked().size() > 0 and casts < 60 and dry_casts < 8:
		var player: Node2D = active_main.get("player")
		var target_entry: Dictionary = _alive_tracked()[0]
		var best: float = INF
		for entry in _alive_tracked():
			var distance: float = player.global_position.distance_to(entry["node"].global_position)
			if distance < best:
				best = distance
				target_entry = entry
		casts += 1
		var verified: bool = await _cast_and_verify(target_entry)
		if verified:
			dry_casts = 0
		else:
			dry_casts += 1
	_check(_alive_tracked().size() == 0, "all 6 hurtE-owner enemies killed by kiSlash (casts=%d)" % casts)
	observations["total_casts"] = casts
	observations["swing_log"] = swing_log
	if _alive_tracked().size() > 0:
		observations["reject_events_tail"] = reject_events.slice(maxi(0, reject_events.size() - 6))

func _cast_and_verify(target_entry: Dictionary) -> bool:
	var player: Node2D = active_main.get("player")
	var enemy: Node = target_entry["node"]
	_heal_player()
	# 사전 스냅샷: 추적 전원 + G.
	var pre: Dictionary = {}
	for id in tracked:
		var node: Node = tracked[id]["node"]
		if is_instance_valid(node):
			pre[id] = {"alive": node.get("alive") == true, "shield": float(node.get("eShield")),
				"hp": float(node.get("hp")), "poise": float(node.get("poise")),
				"stun": float(node.get("_stun_ticks")), "max_poise": float(node.get("max_poise")),
				"regen_fraction": float((node.get("data") as Dictionary).get("poise_regen_fraction", 0.0))}
	var g_before: Dictionary = (active_main.get("source_state").read_current_g() as Dictionary).duplicate(true)
	var before_outcomes: int = hurte_outcomes.size()
	var before_halts: int = halts.size()
	var before_rejects: int = reject_events.size()
	var diag: Dictionary = {"t": str(target_entry["target"]["group"])}
	if player.get("state") != "idle":
		for i in range(240):
			await physics_frame
			_heal_player()
			if player.get("state") == "idle":
				break
	_place_for_cast(player, enemy)
	var accepted: bool = player.request_attack()
	if not accepted:
		player.release_attack()
		for i in range(600):
			await physics_frame
			_heal_player()
			if player.get("state") == "idle" and float(player.get("stamina")) >= 30.0:
				break
		_place_for_cast(player, enemy)
		accepted = player.request_attack()
		if not accepted:
			player.release_attack()
	diag["accepted"] = accepted
	diag["dist"] = snappedf((enemy.global_position - player.global_position).length(), 0.1)
	diag["p_state"] = str(player.get("state"))
	diag["stamina"] = snappedf(float(player.get("stamina")), 0.1)
	if not accepted:
		diag["reject_count"] = reject_events.size() - before_rejects
		diag["rejects"] = reject_events.slice(before_rejects, mini(reject_events.size(), before_rejects + 2))
		swing_log.append(diag)
		return false
	# 3타 홀드(windup): 1회는 풀차지(130f, _kiFull 커버) — 그 외 즉시 발사.
	if player.get("state") == "windup":
		var hold_frames: int = 130 if not full_charge_done else 1
		diag["windup_hold"] = hold_frames
		for i in range(hold_frames):
			await physics_frame
			_heal_player()
		if hold_frames >= 130:
			full_charge_done = true
		# 포인터가 facing을 덮어썼으므로 release 직전 같은 프레임 재조준 (_begin_swing이 재래치).
		player.set("facing", (enemy.global_position - player.global_position).normalized())
		forced_actor_fields += 1
		player.release_attack()
	for i in range(300):
		await physics_frame
		if hurte_outcomes.size() > before_outcomes:
			break
	player.release_attack()
	for i in range(300):
		if player.get("state") == "idle":
			break
		await physics_frame
		_heal_player()
	# 검기 잔여 비행 소진 대기(관통 추가 적중 수집).
	for i in range(30):
		await physics_frame
	var new_outcomes: Array = hurte_outcomes.slice(before_outcomes)
	diag["outcomes"] = new_outcomes.size()
	diag["halts"] = halts.size() - before_halts
	swing_log.append(diag)
	if new_outcomes.is_empty():
		return false
	var killed_in_swing = 0
	var potion_mats_in_swing = 0
	for outcome in new_outcomes:
		# G is global: include every completed kiSlash kill, also untracked factory actors.
		if outcome.get("ok") == true and outcome.get("killed") == true:
			killed_in_swing += 1
			potion_mats_in_swing += _potion_hp_from_draws(outcome.get("rng_draws", []))
		var id: int = int(outcome.get("enemy_id", 0))
		if not tracked.has(id) or not pre.has(id) or pre[id]["alive"] != true:
			continue
		var entry: Dictionary = tracked[id]
		var node: Node = entry["node"]
		entry["hits"] += 1
		var tag: String = str(entry["target"]["group"]) + " hit " + str(entry["hits"])
		_check(outcome.get("ok") == true, "hurtE completed without halt (%s): %s" % [tag, str(outcome.get("reason", ""))])
		if outcome.get("ok") != true:
			observations["halt_outcome_" + str(entry["target"]["group"])] = outcome
			continue
		_check(str(outcome.get("source")) == "kiSlash", "outcome source kiSlash (%s)" % tag)
		# 원본 재계산: elMul(0,el)=1 → statStr(1) → 크리(42316) → 그로기 ×1.5(42336, 사전 스턴시).
		var expected: int = int(outcome.get("base_damage"))
		var expect_crit: bool = float(outcome.get("crit_roll")) * 100.0 < stat_crit
		_check(outcome.get("is_crit") == expect_crit, "crit decision matches rand draw (%s)" % tag)
		if expect_crit:
			expected = FORMULA.js_to_int32(float(expected) * stat_crit_dmg)
		if pre[id]["stun"] > 20.0:
			expected = FORMULA.js_to_int32(float(expected) * 1.5)
		var shield_before: float = pre[id]["shield"]
		var absorbed: float = minf(shield_before, float(expected))
		var overflow: int = expected - int(absorbed)
		_check(absf(float(node.get("eShield")) - (shield_before - absorbed)) < 0.0001,
			"eShield absorbed exactly (%s: %s-%s)" % [tag, shield_before, absorbed])
		_check(absf(float(node.get("hp")) - (pre[id]["hp"] - float(overflow))) < 0.0001,
			"hp reduced only by shield overflow (%s: overflow %d)" % [tag, overflow])
		if absorbed > 0.0:
			entry["absorbed_seen"] = true
		if overflow > 0:
			entry["overflow_seen"] = true
		# ── 42486~42498 포이즈: amt = 잔여 dmg × psM(1) ──
		var poise_amt: int = overflow
		if poise_amt <= 0:
			_check(absf(float(node.get("poise")) - pre[id]["poise"]) < 0.0001 or float(node.get("poise")) > pre[id]["poise"],
				"poise untouched on full absorb (%s)" % tag)
			_check(outcome.get("staggered") != true, "no stagger on zero poise amt (%s)" % tag)
		else:
			var expected_poise: float = maxf(0.0, pre[id]["poise"] - float(poise_amt))
			var regen_chunk: float = floorf(pre[id]["max_poise"] * pre[id]["regen_fraction"])
			var after_poise: float = float(node.get("poise"))
			_check(absf(after_poise - expected_poise) < 0.0001 \
				or absf(after_poise - minf(pre[id]["max_poise"], expected_poise + regen_chunk)) < 0.0001,
				"poise reduced by residual dmg (%s: %s -> %s, expect %s)" % [tag, pre[id]["poise"], after_poise, expected_poise])
			var should_stagger: bool = pre[id]["poise"] - float(poise_amt) <= 0.0
			_check((outcome.get("staggered") == true) == should_stagger,
				"stagger iff poise crossed zero (%s)" % tag)
			if should_stagger:
				entry["stagger_checked"] = true
				_check(float(node.get("_stun_ticks")) > 150.0, "stun 180 set on stagger (%s)" % tag)
				var g_now: Dictionary = active_main.get("source_state").read_current_g()
				_check(int(g_now.get("slowMo", 0)) == 20, "G.slowMo=20 written on stagger (19996) (%s)" % tag)
				var route_expected: String = str(entry["target"]["poise_route"])
				var route_found: String = ""
				for row in outcome.get("journal", []):
					if str(row.get("op")) == "poise_hit":
						route_found = str(row.get("data", {}).get("route"))
				_check(route_found == route_expected, "poise owner route %s (%s, got %s)" % [route_expected, tag, route_found])
		var draws: Array = outcome.get("rng_draws", [])
		if node.get("alive") == true:
			_check(draws.size() == 1 and str(draws[0]["purpose"]) == "crit",
				"rand consumed exactly once (crit) on non-kill (%s)" % tag)
		else:
			_verify_kill(entry, node, outcome, draws, tag)
	if killed_in_swing > 0:
		var g: Dictionary = active_main.get("source_state").read_current_g()
		_check(int(g.get("kills")) == int(g_before.get("kills", 0)) + killed_in_swing, "G.kills +%d (42702)" % killed_in_swing)
		_check(int(g.get("_stageKills", 0)) == int(g_before.get("_stageKills", 0)) + killed_in_swing, "G._stageKills +%d" % killed_in_swing)
		_check(int(g.get("combo")) == int(g_before.get("combo", 0)) + killed_in_swing, "G.combo +%d (42714)" % killed_in_swing)
		var expected_timer: int = int(g_before.get("comboTimer", 0))
		var expected_chain: int = int(g_before.get("_chainCnt", 0))
		for i in range(killed_in_swing):
			expected_timer = mini(1200, expected_timer + 60)
			expected_chain = 0 if expected_chain + 1 >= 5 else expected_chain + 1
		_check(int(g.get("comboTimer")) == expected_timer, "G.comboTimer +60/kill capped (42715)")
		_check(int(g.get("_chainCnt", 0)) == expected_chain, "G._chainCnt chain rule (42756)")
		_check(int(g.get("mats")) == int(g_before.get("mats", 0)) + 4 * killed_in_swing + potion_mats_in_swing,
			"G.mats +4/kill + 물약hp 전환 (43103/28253)")
	return true

func _verify_kill(entry: Dictionary, node: Node, outcome: Dictionary, draws: Array, tag: String) -> void:
	var el: int = int(entry["target"]["el"])
	_check(str(node.get("state")) == "dead", "enemy state dead (%s)" % tag)
	var purposes: Array = []
	for draw in draws:
		purposes.append(str(draw["purpose"]))
	observations["kill_rng_" + str(entry["target"]["group"])] = purposes
	var revive_roll_index: int = purposes.find("normal_revive")
	_check(revive_roll_index != -1, "normal mob revive roll consumed (42633) (%s)" % tag)
	var revived: bool = purposes.has("revive_as_ghoul")
	if revive_roll_index != -1:
		var revive_value: float = float(draws[revive_roll_index]["value"])
		_check(revived == (revive_value < 0.5), "ghoul roll iff revive success (%s)" % tag)
		var native: Dictionary = node.get("data")["native_final"]
		_check((native.get("_revived") == true) == revived, "revive bookkeeping recorded, resurrection UNPORTED (%s)" % tag)
	var expected_order: Array = ["crit", "normal_revive"]
	if revived:
		expected_order.append("revive_as_ghoul")
	expected_order.append_array(["gore_common_or_rare", "gore_piece_index", "gore_large_extra"])
	if el != 0:
		expected_order.append("death_zone")
	expected_order.append_array(["potion_gate", "potion_type"])
	# P2-001c: 43110 rollDrop 이식 — 접두 고정 + drop:* 꼬리 (게이트 롤 최소 1회).
	_check(purposes.slice(0, expected_order.size()) == expected_order,
		"kill-hit rand prefix matches source (%s: got %s)" % [tag, str(purposes)])
	var drop_tail: Array = purposes.slice(expected_order.size())
	var tail_ok := drop_tail.size() >= 1 and str(drop_tail[0]) == "drop:drop_gate"
	for tail_purpose in drop_tail:
		if not str(tail_purpose).begins_with("drop:"):
			tail_ok = false
	_check(tail_ok, "rollDrop rolls follow prefix (first=drop_gate) (%s: got %s)" % [tag, str(drop_tail)])
	entry["killed_checked"] = true

func _test_per_enemy_coverage() -> void:
	if tracked.is_empty():
		return
	for id in tracked:
		var entry: Dictionary = tracked[id]
		var group: String = str(entry["target"]["group"])
		_check(entry["absorbed_seen"] == true, "%s: shield absorb observed" % group)
		_check(entry["overflow_seen"] == true, "%s: shield->HP overflow observed" % group)
		_check(entry["killed_checked"] == true, "%s: kill pipeline verified" % group)
		_check(entry["stagger_checked"] == true, "%s: poise stagger verified (one-shot residual > 875)" % group)
		observations["hits_" + group] = entry["hits"]
	# flesh v3 호출 스택 정리 + 레거시 유예 미사용 확인.
	var world: Node = active_main.get("world")
	_check((world.get("_native_normal_enemy_field_calls") as Array).is_empty(),
		"v3 field-call stack empty after combat")
	for id in tracked:
		var node: Node = tracked[id]["node"]
		if is_instance_valid(node) and "_pending_poise_amount" in node:
			_check(float(node.get("_pending_poise_amount")) == 0.0,
				"no legacy deferred poise (%s)" % str(tracked[id]["target"]["group"]))
	# 풀차지(_kiFull) 1회 수행 확인 + c.dmg 공식 대조 (crescent_spawned ↔ 원본 16841).
	_check(full_charge_done, "one full-charge (tier3, _kiFull) cast exercised")
	var parameters: Dictionary = active_main.get("player").get_native_attack_parameters()
	var formula_checked := 0
	for spawn in crescent_spawns:
		var tier: int = int(spawn.get("tier", 0))
		var expected_damage: int = FORMULA.js_to_int32(float(parameters.melee_ref) * 7.0 \
			* float(parameters.stat_str) * float(parameters.p_atk_mul) * 12.0 * pow(2.0, tier))
		if int(spawn.get("damage", -1)) == expected_damage:
			formula_checked += 1
	_check(formula_checked == crescent_spawns.size() and crescent_spawns.size() > 0,
		"c.dmg formula matches source 16841 for all casts (%d/%d, lv1 skMul=12.0)" % [formula_checked, crescent_spawns.size()])
	var full_charges: int = 0
	for spawn in crescent_spawns:
		if int(spawn.get("tier", 0)) == 3:
			full_charges += 1
	_check(full_charges >= 1, "tier3 crescent spawned (x8 damage)")
	observations["halt_count"] = halts.size()
	_check(halts.size() == 0, "no native_hurte_halt emitted across combat")
	observations["cast_damages"] = []
	for spawn in crescent_spawns:
		(observations["cast_damages"] as Array).append({"step": spawn.get("step"), "tier": spawn.get("tier"), "damage": spawn.get("damage")})

static func _potion_hp_from_draws(draws: Array) -> int:
	# P2-001c: 43093 potion_type 롤 <1/3 → 'hp' → addPotion이 G.mats +1 (28253).
	for draw in draws:
		if str(draw.get("purpose")) == "potion_type":
			return 1 if int(float(draw.get("value", 1.0)) * 3.0) == 0 else 0
	return 0
