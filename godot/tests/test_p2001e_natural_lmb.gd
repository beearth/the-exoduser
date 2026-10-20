extends SceneTree
## P2-001e — 자연 기본값 좌클릭 경로 + 새 게임 초기화 회귀 (실제 Main 부팅).
## 근거(원본 game.html):
##  - 신규 좌클릭 기본 = kiSlash (mkP 29028 activeLMBSk:'kiSlash')
##  - 좌클릭 1회 = 검기+평타 이중 히트: 33055 wSwing 진입+_fireKiSlashCrescent,
##    33356~33363 wSwing st2<=3 교차 시 hitArc 무조건 호출 (activeLMBSk 무관)
##  - 검기 피해(16817): ~~(meleeRef×7.0×statStr×pAtkMul×_skMul('kiSlash')) —
##    신규: meleeRef=wp.atk+baseAtk15 (28770), statStr=1 (27993), pAtkMul=0.7 (28017,
##    패시브 0 실측 — P2-001e 웹 실측 web_inputs.json), _skMul=12.0 (44556 b)
##  - 평타 피해: 33362 ~~(((baseAtk+wp.atk+enh)+15)*6) → hitArc 37608
##    ~~(base×pAtkMul×pMeleeMul)+P._atkBon, _atkBon=~~(_lastCost×1.5)=15
##    (33053, kiSlash ST 비용 10 — 31985)
##  - 새 게임: G.mats=_loadSharedMats()||1000 (63956) → 공유 저장소 미이식=1000,
##    initStage 31567 P.hp=P.mhp; P.st=P.mst; P.mp=P.mmp; P.shield=P.mshield
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const USERDIR = "EXODUSER-P2001E-Isolated-20261020"
# QA-002: 테스트 소유 입력. 제품 RNG 호출 순서는 변경하지 않는다.
const QA002_TEST_SEED = 20261020
const GROUPS = ["new_run_init_refill_and_mats", "natural_lmb_dual_hit_values"]

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
			print("P2001E_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001E_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2001E_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001E_FAIL ", current_group, " ", label)

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
	if active_main.get("world").get("ready_for_player") != true:
		_check(false, "actual World ready_for_player")
		return false
	active_main.get("player").telemetry_event.connect(func(kind, data):
		if kind == "native_hurte": hurte_outcomes.append(data.duplicate(true)))
	return true

func _alive_enemies_by_distance() -> Array:
	var player: Node2D = active_main.get("player")
	var list: Array = []
	for candidate in active_main.get("world").get_enemies():
		if is_instance_valid(candidate) and candidate.get("alive") == true:
			list.append(candidate)
	list.sort_custom(func(a, b):
		return a.global_position.distance_to(player.global_position) \
			< b.global_position.distance_to(player.global_position))
	return list

# ── ① 새 게임 초기화: 자원 풀충전(31567)·악의 1000(63956)·기본 LMB kiSlash(29028) ──
func _test_new_run_init_refill_and_mats() -> void:
	if not await _boot_main():
		return
	var state: Node = active_main.get("source_state")
	var player: Node2D = active_main.get("player")
	var p: Dictionary = state.read_current_p()
	_check(str(p.get("activeLMBSk")) == "kiSlash", "신규 기본 LMB = kiSlash (29028) — 강제 없음")
	_check(str(p.get("activeRMBSk")) == "maliceSwipe", "신규 기본 RMB = maliceSwipe (29029)")
	var mhp: float = float(p.get("mhp", 0))
	_check(mhp >= 350.0, "mhp 파생 완료(시작 장비 bonusHp 반영) mhp=" + str(mhp))
	_check(float(p.get("hp", 0)) == mhp, "P.hp=P.mhp 풀충전 (31567)")
	_check(float(player.get("hp")) == float(player.get("max_hp")), "플레이어 노드 hp=max_hp (31567)")
	_check(float(p.get("st", 0)) == float(p.get("mst", -1)), "P.st=P.mst 풀충전 (31567)")
	_check(float(p.get("mp", 0)) == float(p.get("mmp", -1)), "P.mp=P.mmp 풀충전 (31567)")
	var mshield: float = float(p.get("mshield", 0))
	_check(mshield >= 100.0, "mshield 파생(100+INT·장비 bonusShield — 27966) mshield=" + str(mshield))
	_check(float(p.get("shield", -1)) == mshield, "P.shield=P.mshield 풀충전 (31567)")
	var g: Dictionary = state.read_current_g()
	_check(int(g.get("mats", -1)) == 1000, "새 게임 악의 = 1000 (63956 _loadSharedMats()||1000)")
	observations["init"] = {"mhp": mhp, "mshield": mshield, "mats": g.get("mats"),
		"activeLMBSk": p.get("activeLMBSk")}

# ── ② 자연 좌클릭 1회 = kiSlash+weapon 정확히 2히트, 피해값 원본 공식 일치 ──
func _test_natural_lmb_dual_hit_values() -> void:
	if not await _boot_main():
		return
	# 검기 기대피해 < 1750(875쉴드+875hp)이어야 평타가 시체가 아닌 생존 적에 적용된다.
	# 시작 무기 atk 롤(max(1,~~(50·r²)))이 15 이하(=검기 ≤1764... 14 이하로 제한)일 때까지
	# 재부팅 표본 추출 — P(atk≤14)≈53%라 8회 내 실패 확률 ~0.3%.
	for reboot in range(8):
		var wa: float = float(((active_main.get("source_state").read_current_inventory() 			.get("equipped", {}) as Dictionary).get("weapon", {}) as Dictionary).get("atk", 99))
		if (wa + 15.0) * 7.0 * 0.7 * 12.0 < 1750.0:
			break
		observations["reboot_%d" % reboot] = {"wp_atk": wa}
		_cleanup()
		hurte_outcomes.clear()
		if not await _boot_main():
			return
	var state: Node = active_main.get("source_state")
	var player: Node2D = active_main.get("player")
	var weapon: Dictionary = (state.read_current_inventory().get("equipped", {}) as Dictionary).get("weapon", {})
	var wp_atk: float = float(weapon.get("atk", 0))
	_check((wp_atk + 15.0) * 7.0 * 0.7 * 12.0 < 1750.0, "생존 가능 롤 확보(검기 기대 < 1750)")
	var enh: int = int(weapon.get("enh", 0))
	_check(wp_atk >= 1.0, "시작 무기 atk 롤 존재(mkItem 15922 max(1,~~(50·r²))) atk=" + str(wp_atk))
	_check(enh == 0, "시작 무기 enh=0 (신규)")
	var base_atk: float = float(state.read_current_p().get("baseAtk", 0))
	_check(base_atk == 15.0, "P.baseAtk=15 (27926, G.on 이전)")
	# 기대값 (원본 공식 그대로 — 신규 statStr=1, pAtkMul=0.7, pMeleeMul=1, _skMul b=12)
	var melee_ref: float = wp_atk + base_atk # 28770 (enh0·flat0·STR0·lvB0)
	var ki_expected: int = FORMULA.js_to_int32(melee_ref * 7.0 * 1.0 * 0.7 * 12.0) # 16817
	var arc_base: int = FORMULA.js_to_int32(((base_atk + wp_atk + 0.0) + 15.0) * 6.0) # 33362
	var weapon_expected: int = FORMULA.js_to_int32(float(arc_base) * 0.7 * 1.0) + 15 # 37608 + _atkBon 15
	observations["expected"] = {"wp_atk": wp_atk, "ki": ki_expected, "weapon": weapon_expected}
	var verified := false
	for attempt in range(6):
		var enemies: Array = _alive_enemies_by_distance()
		if enemies.is_empty():
			break
		var target: Node2D = enemies[0]
		for i in range(300):
			if player.get("state") == "idle" and float(player.get("stamina")) >= 30.0:
				break
			await physics_frame
		var stand: Vector2 = target.global_position + Vector2(-(47.0 + float(target.get("radius")) - 8.0), 0)
		player.global_position = stand
		player.set("facing", (target.global_position - stand).normalized())
		forced_actor_fields += 2
		var before: int = hurte_outcomes.size()
		if not player.request_attack():
			player.release_attack()
			continue
		if player.get("state") == "windup":
			player.release_attack()
		# 검기(즉시 중첩)와 평타(st2<=3 교차)가 모두 적용될 때까지 수집 — 조기 반환 없음.
		for i in range(100):
			await physics_frame
		player.release_attack()
		var mine: Array = []
		for outcome in hurte_outcomes.slice(before):
			if int(outcome.get("enemy_id", 0)) == target.get_instance_id():
				mine.append(outcome)
		if mine.size() != 2:
			observations["attempt_%d" % attempt] = {"hits": mine.size()}
			continue
		var any_crit := false
		for outcome in mine:
			if outcome.get("is_crit") == true:
				any_crit = true
		if any_crit:
			observations["attempt_%d" % attempt] = {"crit_retry": true}
			continue
		var by_source: Dictionary = {}
		for outcome in mine:
			by_source[str(outcome.get("source"))] = outcome
		_check(by_source.has("kiSlash") and by_source.has("weapon"),
			"1요청 = kiSlash+weapon 정확히 2히트 (33055+33363) sources=" + str(by_source.keys()))
		if by_source.has("kiSlash"):
			_check(int(by_source["kiSlash"].get("base_damage", -1)) == ki_expected,
				"검기 피해 = ~~(meleeRef×7×1×0.7×12) = %d (실측 %s)" % [ki_expected, str(by_source["kiSlash"].get("base_damage"))])
		if by_source.has("weapon"):
			_check(int(by_source["weapon"].get("base_damage", -1)) == weapon_expected,
				"평타 피해 = ~~(~~((baseAtk+atk+15)×6)×0.7)+15 = %d (실측 %s)" % [weapon_expected, str(by_source["weapon"].get("base_damage"))])
		observations["measured"] = {"attempt": attempt,
			"ki": by_source.get("kiSlash", {}).get("base_damage"),
			"weapon": by_source.get("weapon", {}).get("base_damage")}
		verified = true
		break
	_check(verified, "비크리 2히트 표본 확보(6회 내)")
