extends SceneTree
## P1-002.F — 첫 스테이지 전용 스크립트 적 4종의 기본 근접 hurtE 회귀 (실제 Main 부팅).
## 대상: ch1_initial_015(flesh_crawler etype0 el0) / ch1_initial_014(spine_beast etype4 el0)
##       / ch1_initial_009(ice_soul_flame etype4 el2) / ch1_initial_016(hive_bloater etype1 el4).
## 경로: player.request_attack()(공개 API) → swing → _melee_contact →
##       native_normal_enemy_hurte (전용 적 owner API = native_dedicated_enemy_hurte_owner).
## 구조: 4종이 서로 인접 스폰·플레이어로 수렴하므로 근접 호(arc)가 여러 마리를 함께
## 때린다 — 매 스윙마다 추적 4종 전원의 사전 상태를 스냅샷하고, 그 스윙에서 발생한
## 모든 추적 대상 outcome(교차타 포함)을 검증한다. 적별 커버리지(전량흡수≥2·오버플로≥1·
## 처치 파이프라인·RNG 순서/횟수)는 마지막 그룹에서 합산 판정.
## 적별 RNG 기대: 비처치 1회=crit / 처치: crit+부활(+구울)+고어3(전원 r≥18)
##   +사망장판(el≠0: ice/hive)+물약2 → flesh/spine 7(부활실패)/8, ice/hive 8/9.
## 테스트 소유 개입(한계 기록, forced_actor_fields 집계): activeLMBSk='weapon' 직접 기록,
## 스윙 전 플레이어 배치, 교전 지속용 P.hp 회복(어픽스 전부 0 — 산술 무영향).
## Main 부팅 그룹은 격리 사용자 폴더(USERDIR) 필수 — 아니면 SKIP.

const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const USERDIR = "EXODUSER-P1002F-Isolated-20261020"
const GROUPS = ["setup", "combat", "per_enemy_coverage"]
const TARGETS: Array = [
	{"group": "flesh_crawler", "id": "ch1_initial_015", "script": "res://scripts/enemy_melee_flesh_crawler.gd",
		"etype": 0, "el": 0, "contact_safe": false, "v3_field_owner": true},
	{"group": "spine_beast", "id": "ch1_initial_014", "script": "res://scripts/enemy_tank_physical_spine_beast.gd",
		"etype": 4, "el": 0, "contact_safe": false, "v3_field_owner": false},
	{"group": "ice_soul_flame", "id": "ch1_initial_009", "script": "res://scripts/enemy_tank_ice_soul_flame.gd",
		"etype": 4, "el": 2, "contact_safe": false, "v3_field_owner": false},
	{"group": "hive_bloater", "id": "ch1_initial_016", "script": "res://scripts/enemy_archer_lightning_hive_bloater.gd",
		"etype": 1, "el": 4, "contact_safe": true, "v3_field_owner": false}]

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
var tracked: Dictionary = {} # enemy_id → {target, node, poise0, full_absorb, overflow_hits, killed_checked, kill_rng_ok, hits}
var stat_crit: float = 0.0
var stat_crit_dmg: float = 1.5

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P1002F_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P1002F_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P1002F_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields,
		"public_attack_api_used": true, "fallback_paths_used": false,
		"public_play_evidence": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P1002F_FAIL ", current_group, " ", label)

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

func _find_enemy(id: String) -> Node:
	for enemy in active_main.get("world").get_enemies():
		if is_instance_valid(enemy) and str(enemy.get("data")["id"]) == id:
			return enemy
	return null

# ── 원본 공식 재계산 (owner 값 기반 기대치 — E 테스트와 동일) ──
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
	# 테스트 소유 개입: 4연속 교전 지속용 P.hp 회복 (한계 기록).
	var p: Dictionary = active_main.get("source_state").read_current_p()
	if float(p.get("hp", 0)) < float(p.get("mhp", 0)):
		p["hp"] = p.get("mhp", 350)
		active_main.get("player").set("hp", float(p.get("mhp", 350)))
		forced_actor_fields += 1

func _test_setup() -> void:
	var booted: bool = await _boot_main()
	if not booted:
		return
	var providers: Dictionary = active_main.get_native_normal_enemy_damage_provider_callbacks()
	_check(providers.size() == 12, "actual Main exposes 12 normal-enemy providers")
	stat_crit = _expected_stat_crit()
	stat_crit_dmg = _expected_stat_crit_dmg()
	observations["expected_stat_crit"] = stat_crit
	observations["expected_stat_crit_dmg"] = stat_crit_dmg
	for target in TARGETS:
		var enemy: Node = _find_enemy(target["id"])
		_check(is_instance_valid(enemy), "dedicated enemy spawned: " + str(target["id"]))
		if not is_instance_valid(enemy):
			continue
		_check(str(enemy.get_script().resource_path) == str(target["script"]),
			"dedicated script bound: " + str(target["group"]))
		_check(float(enemy.get("eShield")) == 875.0 and float(enemy.get("eShieldMax")) == 875.0,
			"mkEn eShield=mhp installed (875): " + str(target["group"]))
		var fields: Dictionary = enemy.read_native_normal_enemy_hurte_fields(active_main.get("world"))
		_check(fields.get("ready") == true, "hurtE owner fields ready: " + str(target["group"]))
		_check(int(fields.get("etype", -1)) == int(target["etype"]) and int(fields.get("el", -1)) == int(target["el"]),
			"owner fields etype/el match record: " + str(target["group"]))
		_check(float(fields.get("radius", 0.0)) >= 18.0, "r>=18 (gore large roll): " + str(target["group"]))
		if bool(target["v3_field_owner"]):
			var v3: Dictionary = enemy.read_native_source_damage_fields(active_main.get("world"))
			_check(v3.get("ready") == true, "v3 field-owner route intact: " + str(target["group"]))
		var snapshot: Variant = enemy.get_snapshot() if enemy.has_method("get_snapshot") else null
		_check(snapshot is Dictionary and snapshot.get("id") == target["id"],
			"dedicated get_snapshot intact: " + str(target["group"]))
		tracked[enemy.get_instance_id()] = {"target": target, "node": enemy,
			"poise0": float(enemy.get("poise")), "full_absorb": 0, "overflow_hits": 0,
			"killed_checked": false, "hits": 0}
	# 로드아웃: 기본 근접 LMB (공개 셀렉터 부재 — State P 직접 기록, 한계 기록).
	var p: Dictionary = active_main.get("source_state").read_current_p()
	p["activeLMBSk"] = "weapon"
	forced_actor_fields += 1
	var selection: Dictionary = active_main.get("player").get_native_attack_selection_snapshot()
	_check(selection.get("ready") == true and selection.get("route") == "basic_melee",
		"basic_melee LMB route selected")

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
	var swings = 0
	var dry_swings = 0
	while _alive_tracked().size() > 0 and swings < 60 and dry_swings < 8:
		# 목표: 살아있는 추적 적 중 플레이어에서 가장 가까운 것.
		var player: Node2D = active_main.get("player")
		var target_entry: Dictionary = _alive_tracked()[0]
		var best: float = INF
		for entry in _alive_tracked():
			var distance: float = player.global_position.distance_to(entry["node"].global_position)
			if distance < best:
				best = distance
				target_entry = entry
		swings += 1
		var verified: bool = await _swing_and_verify(target_entry)
		if verified:
			dry_swings = 0
		else:
			dry_swings += 1
	_check(_alive_tracked().size() == 0, "all 4 dedicated enemies killed (swings=%d)" % swings)
	observations["total_swings"] = swings

func _swing_and_verify(target_entry: Dictionary) -> bool:
	var player: Node2D = active_main.get("player")
	var enemy: Node = target_entry["node"]
	_heal_player()
	var r: float = float(enemy.get("radius"))
	var contact_safe: bool = bool(target_entry["target"]["contact_safe"])
	var gap: float = (r + 15.0) if contact_safe else (47.0 + r - 8.0)
	var stand: Vector2 = enemy.global_position + Vector2(-gap, 0)
	player.global_position = stand
	player.set("facing", Vector2.RIGHT)
	forced_actor_fields += 2
	# 사전 스냅샷: 추적 4종 전원 + G.
	var pre: Dictionary = {}
	for id in tracked:
		var node: Node = tracked[id]["node"]
		if is_instance_valid(node):
			pre[id] = {"alive": node.get("alive") == true, "shield": float(node.get("eShield")),
				"hp": float(node.get("hp"))}
	var g_before: Dictionary = (active_main.get("source_state").read_current_g() as Dictionary).duplicate(true)
	var before_outcomes: int = hurte_outcomes.size()
	if player.get("state") != "idle":
		for i in range(240):
			await physics_frame
			if player.get("state") == "idle":
				break
	var accepted: bool = player.request_attack()
	if not accepted:
		for i in range(300):
			await physics_frame
			player.global_position = stand
			if player.get("state") == "idle" and float(player.get("stamina")) >= 10.0:
				break
		accepted = player.request_attack()
	if not accepted:
		return false
	for i in range(300):
		await physics_frame
		if hurte_outcomes.size() > before_outcomes:
			break
	player.release_attack()
	for i in range(300):
		if player.get("state") == "idle":
			break
		await physics_frame
	var new_outcomes: Array = hurte_outcomes.slice(before_outcomes)
	if new_outcomes.is_empty():
		return false
	# ── 이 스윙의 모든 추적 대상 outcome 검증 (교차타 포함) ──
	var killed_in_swing = 0
	for outcome in new_outcomes:
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
		# 원본 재계산: elMul(0,el)=1(물리 공격 전 조합 1) → statStr(1) → (크리면 ×statCritDmg).
		var expected: int = int(outcome.get("base_damage"))
		var expect_crit: bool = float(outcome.get("crit_roll")) * 100.0 < stat_crit
		_check(outcome.get("is_crit") == expect_crit, "crit decision matches rand draw (%s)" % tag)
		if expect_crit:
			expected = FORMULA.js_to_int32(float(expected) * stat_crit_dmg)
		var shield_before: float = pre[id]["shield"]
		var hp_before: float = pre[id]["hp"]
		var absorbed: float = minf(shield_before, float(expected))
		var overflow: int = expected - int(absorbed)
		_check(absf(float(node.get("eShield")) - (shield_before - absorbed)) < 0.0001,
			"eShield absorbed exactly (%s: %s-%s)" % [tag, shield_before, absorbed])
		_check(absf(float(node.get("hp")) - (hp_before - float(overflow))) < 0.0001,
			"hp reduced only by shield overflow (%s: overflow %d)" % [tag, overflow])
		if overflow == 0:
			entry["full_absorb"] += 1
			_check(float(node.get("hp")) == hp_before, "hp untouched while shield holds (%s)" % tag)
		else:
			entry["overflow_hits"] += 1
		var draws: Array = outcome.get("rng_draws", [])
		if node.get("alive") == true:
			# 비처치 타: rand provider 소비는 크리 1회뿐 (피격음 랜덤은 오디오 전용 RNG — 추적표 42191행).
			_check(draws.size() == 1 and str(draws[0]["purpose"]) == "crit",
				"rand consumed exactly once (crit) on non-kill (%s)" % tag)
		else:
			killed_in_swing += 1
			_verify_kill(entry, node, outcome, draws, tag)
	# ── G 카운터: 이 스윙의 추적 처치 수만큼 원본 규칙대로 순차 증가 ──
	if killed_in_swing > 0:
		var g: Dictionary = active_main.get("source_state").read_current_g()
		_check(int(g.get("kills")) == int(g_before.get("kills", 0)) + killed_in_swing, "G.kills +%d (42702)" % killed_in_swing)
		_check(int(g.get("_stageKills", 0)) == int(g_before.get("_stageKills", 0)) + killed_in_swing, "G._stageKills +%d (42702)" % killed_in_swing)
		_check(int(g.get("combo")) == int(g_before.get("combo", 0)) + killed_in_swing, "G.combo +%d (42714)" % killed_in_swing)
		var expected_timer: int = int(g_before.get("comboTimer", 0))
		var expected_chain: int = int(g_before.get("_chainCnt", 0))
		for i in range(killed_in_swing):
			expected_timer = mini(1200, expected_timer + 60)
			expected_chain = 0 if expected_chain + 1 >= 5 else expected_chain + 1
		_check(int(g.get("comboTimer")) == expected_timer, "G.comboTimer +60/kill capped (42715)")
		_check(int(g.get("_chainCnt", 0)) == expected_chain, "G._chainCnt chain rule (42756)")
		_check(int(g.get("mats")) == int(g_before.get("mats", 0)) + 4 * killed_in_swing, "G.mats +4/kill (43103)")
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
		_check(revived == (revive_value < 0.5), "ghoul roll consumed iff revive roll succeeded (%s)" % tag)
		var native: Dictionary = node.get("data")["native_final"]
		_check((native.get("_revived") == true) == revived, "revive bookkeeping recorded, resurrection UNPORTED (%s)" % tag)
	var expected_order: Array = ["crit", "normal_revive"]
	if revived:
		expected_order.append("revive_as_ghoul")
	expected_order.append_array(["gore_common_or_rare", "gore_piece_index", "gore_large_extra"])
	if el != 0:
		expected_order.append("death_zone")
	expected_order.append_array(["potion_gate", "potion_type"])
	_check(purposes == expected_order, "kill-hit rand order matches source (%s: got %s)" % [tag, str(purposes)])
	var expected_count: int = (8 if revived else 7) + (1 if el != 0 else 0)
	_check(draws.size() == expected_count, "kill-hit rand count %d (el=%d, revived=%s) (%s)" % [expected_count, el, str(revived), tag])
	entry["killed_checked"] = true

func _test_per_enemy_coverage() -> void:
	if tracked.is_empty():
		return
	for id in tracked:
		var entry: Dictionary = tracked[id]
		var group: String = str(entry["target"]["group"])
		_check(entry["full_absorb"] >= 2, "%s: shield full-absorb hits >=2 (got %d)" % [group, entry["full_absorb"]])
		_check(entry["overflow_hits"] >= 1, "%s: shield->HP overflow observed (got %d)" % [group, entry["overflow_hits"]])
		_check(entry["killed_checked"] == true, "%s: kill pipeline verified" % group)
		var node: Node = entry["node"]
		if is_instance_valid(node):
			# 기존 전용 동작 유지: 기본 근접은 포이즈 피해 0 (원본 42486 poiseHit=false).
			_check(float(node.get("poise")) >= float(entry["poise0"]) - 0.0001,
				"%s: poise untouched by basic melee" % group)
			_check(float(node.get("_pending_poise_amount")) == 0.0, "%s: no deferred poise left" % group)
		observations["hits_" + group] = entry["hits"]
	observations["halt_count"] = halts.size()
	_check(halts.size() == 0, "no native_hurte_halt emitted across combat")
