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
## 맵 전제(INTEG-9 2026-10-22): 대상은 기존 맵 부팅 배치 적이다. MAP11 기본 ON은 부팅 직후 빈 필드라
##   Main 메타 `native_map11="off"`(= `--map11=off`)로 기존 맵 부팅을 **명시**하고 부팅 맵 단정 1개를 둔다
##   (test_pc_final_death 방식). CLI --map11=on이면 그 단정이 실패로 드러낸다. 판정 기준은 그대로다.

const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const USERDIR = "EXODUSER-P1002F-Isolated-20261020"
# QA-002: 테스트 소유 입력. 제품 RNG 호출 순서는 변경하지 않는다.
const QA002_TEST_SEED = 20261020
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
# 스윙별 진단 로그: 미적중 원인(거부 사유·조준각·플레이어 상태·피격 수)을 남긴다.
var swing_log: Array = []
var reject_events: Array = []
var player_damage_count: int = 0

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
	active_main.set_meta("native_map11", "off") # 기존 맵 부팅 명시(머리말 맵 전제)
	root.add_child(active_main)
	for i in range(8):
		await physics_frame
	_check(active_main.read_native_map11_provider() == null, "legacy map booted explicitly (map11 off)")
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
	elif kind in ["stamina_insufficient", "attack_parameters_rejected", "active_lmb_rejected", "player_died"]:
		reject_events.append({"kind": kind, "data": data.duplicate(true)})
	elif kind == "player_damage":
		player_damage_count += 1

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

# request 직전 같은 프레임의 배치·조준: 대상의 현재 좌표 기준으로만 계산한다.
func _place_for_swing(player: Node2D, enemy: Node, gap: float) -> void:
	var stand: Vector2 = _pick_stand(enemy, gap)
	player.global_position = stand
	player.set("facing", (enemy.global_position - stand).normalized())
	forced_actor_fields += 2

# 배치 후보 8방위 중 이동 가능하고 다른 살아있는 적(추적 외 포함)에서 가장 먼 지점.
# 수렴한 무리 속에 서면 스윙 시작 2틱 안 피격 스태거(제품 정상 동작)로 접촉이 취소된다.
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
	# 공격 방향 결정 근거 실측: _attack_direction=facing(request 시점, player.gd:599),
	# facing의 포인터 덮어쓰기(707~712)가 이 headless 런에서 발화하는지 기록.
	var probe: Node2D = active_main.get("player")
	probe.set("facing", Vector2.RIGHT)
	forced_actor_fields += 1
	await physics_frame
	var facing_after: Vector2 = probe.get("facing")
	observations["aim_basis"] = {
		"pointer_provider_bound": probe.get("_native_ground_pointer_bound") == true,
		"mouse_world": [snappedf(probe.get_global_mouse_position().x, 0.1), snappedf(probe.get_global_mouse_position().y, 0.1)],
		"player_pos": [snappedf(probe.global_position.x, 0.1), snappedf(probe.global_position.y, 0.1)],
		"facing_write_survives_frame": facing_after.distance_to(Vector2.RIGHT) < 0.001}

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
	observations["swing_log"] = swing_log
	if _alive_tracked().size() > 0:
		observations["reject_events_tail"] = reject_events.slice(maxi(0, reject_events.size() - 10))

func _swing_and_verify(target_entry: Dictionary) -> bool:
	var player: Node2D = active_main.get("player")
	var enemy: Node = target_entry["node"]
	_heal_player()
	var r: float = float(enemy.get("radius"))
	var contact_safe: bool = bool(target_entry["target"]["contact_safe"])
	var gap: float = (r + 15.0) if contact_safe else (47.0 + r - 8.0)
	# 사전 스냅샷: 추적 4종 전원 + G.
	var pre: Dictionary = {}
	for id in tracked:
		var node: Node = tracked[id]["node"]
		if is_instance_valid(node):
			pre[id] = {"alive": node.get("alive") == true, "shield": float(node.get("eShield")),
				"hp": float(node.get("hp"))}
	var g_before: Dictionary = (active_main.get("source_state").read_current_g() as Dictionary).duplicate(true)
	var before_outcomes: int = hurte_outcomes.size()
	var before_halts: int = halts.size()
	var before_rejects: int = reject_events.size()
	var before_damage: int = player_damage_count
	var diag: Dictionary = {"t": str(target_entry["target"]["group"])}
	if player.get("state") != "idle":
		for i in range(240):
			await physics_frame
			_heal_player()
			if player.get("state") == "idle":
				break
	# 배치·조준은 모든 대기가 끝난 뒤 request 직전 같은 프레임에 — 대기 중 원거리 적
	# (hive 후퇴 AI)이 거리를 벌리므로 대기 전에 계산한 좌표를 재사용하면 사거리 밖이
	# 된다(인수 2차 실패 실측: dist 147~172·aim_err 135°). 스윙 방향의 근거(aim_basis
	# 실측): facing은 headless에서도 매 프레임 마우스 위치로 덮어써지지만(707~712,
	# facing_write_survives_frame=false), 기본 근접 방향은 request_attack 시점에
	# _attack_direction=facing으로 래치되고(599) swing 상태에서 갱신되지 않으므로
	# (782는 windup 전용), facing 기록과 request를 같은 프레임에 하면 그 값이 스윙
	# 방향이 된다 — 적중 스윙 aim_err=0.0이 증거 (개입은 forced_actor_fields 집계).
	_place_for_swing(player, enemy, gap)
	var accepted: bool = player.request_attack()
	if not accepted:
		# 거부 즉시 release — 홀드(_weapon_held)가 남으면 제품의 홀드 자동 재공격이
		# 스태미나가 5가 될 때마다 바로 소비해 영원히 회복 대기 상태가 된다
		# (diag2 실측: stamina_insufficient 수백 회·stamina ~1.5 고정).
		player.release_attack()
		for i in range(600):
			await physics_frame
			_heal_player()
			if player.get("state") == "idle" and float(player.get("stamina")) >= 20.0:
				break
		# 회복 대기 직후에도 request 직전 현재 좌표로 재배치·재조준 (좌표 재사용 금지).
		_place_for_swing(player, enemy, gap)
		accepted = player.request_attack()
		if not accepted:
			player.release_attack()
	# 진단: 요청 수락 여부·조준각(요청 시점 _attack_direction과 적 방향의 각도)·거리.
	diag["accepted"] = accepted
	var attack_direction: Vector2 = player.get("_attack_direction")
	var offset0: Vector2 = enemy.global_position - player.global_position
	diag["aim_err_deg"] = snappedf(rad_to_deg(absf(attack_direction.angle_to(offset0))), 0.1)
	diag["dist"] = snappedf(offset0.length(), 0.1)
	diag["p_state"] = str(player.get("state"))
	diag["p_hp"] = float(player.get("hp"))
	diag["stamina"] = snappedf(float(player.get("stamina")), 0.1)
	if not accepted:
		diag["reject_count"] = reject_events.size() - before_rejects
		diag["rejects"] = reject_events.slice(before_rejects, mini(reject_events.size(), before_rejects + 2))
		diag["dmg_during"] = player_damage_count - before_damage
		swing_log.append(diag)
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
		_heal_player()
	var new_outcomes: Array = hurte_outcomes.slice(before_outcomes)
	diag["outcomes"] = new_outcomes.size()
	diag["halts"] = halts.size() - before_halts
	diag["dmg_during"] = player_damage_count - before_damage
	diag["p_state_end"] = str(player.get("state"))
	swing_log.append(diag)
	if new_outcomes.is_empty():
		return false
	# ── 이 스윙의 모든 추적 대상 outcome 검증 (교차타 포함) ──
	var killed_in_swing = 0
	var potion_mats_in_swing = 0
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
			potion_mats_in_swing += _potion_hp_from_draws(draws)
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

static func _potion_hp_from_draws(draws: Array) -> int:
	# P2-001c: 43093 potion_type 롤 <1/3 → 'hp' → addPotion이 G.mats +1 (28253).
	for draw in draws:
		if str(draw.get("purpose")) == "potion_type":
			return 1 if int(float(draw.get("value", 1.0)) * 3.0) == 0 else 0
	return 0
