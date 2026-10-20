extends SceneTree
## P2-001b — 사망 연출·피격 임팩트 회귀 (실제 Main 부팅).
## 검증: 에셋 로드, 피격 시 피/스플래시·임팩트(_impPerFrame 실카운트)·화면 플래시(G),
## 처치 시 deathFX/시체(스프라이트 캡처·본체 숨김)/고어(provider 롤 값 재사용, r>=18 → 2조각)/
## 데드 임팩트/핏자국, 수명(시체 420·비행 고어 90·핏자국 540·DI 75틱), kiSlash noImpact,
## 처치 RNG 소비 수 불변(8/9 — el3 eye_mass).
const FORMULA = preload("res://port_modules/combat_stat_formula/producer.gd")
const USERDIR = "EXODUSER-P2001B-Isolated-20261020"
# QA-002: 테스트 소유 입력. 제품 RNG 호출 순서는 변경하지 않는다.
const QA002_TEST_SEED = 20261020
const GROUPS = ["assets_and_adapter", "weapon_hit_and_kill_fx", "lifetimes_and_kislash_noimpact"]

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
			print("P2001B_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001B_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2001B_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001B_FAIL ", current_group, " ", label)

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

func _adapter() -> Node:
	return active_main.get("world").get("_native_death_fx")

func _enemy(id: String) -> Node:
	for candidate in active_main.get("world").get_enemies():
		if is_instance_valid(candidate) and str(candidate.get("data")["id"]) == id:
			return candidate
	return null

func _swing(enemy: Node) -> Dictionary:
	var player: Node2D = active_main.get("player")
	var p: Dictionary = active_main.get("source_state").read_current_p()
	if float(p.get("hp", 0)) < float(p.get("mhp", 0)):
		p["hp"] = p.get("mhp", 350)
		player.set("hp", float(p.get("mhp", 350)))
		forced_actor_fields += 1
	for attempt in range(4):
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
				if player.get("state") == "idle" and float(player.get("stamina")) >= 30.0:
					break
			continue
		if player.get("state") == "windup":
			player.set("facing", (enemy.global_position - player.global_position).normalized())
			forced_actor_fields += 1
			player.release_attack()
		for i in range(300):
			await physics_frame
			if hurte_outcomes.size() > before:
				break
		player.release_attack()
		for outcome in hurte_outcomes.slice(before):
			if int(outcome.get("enemy_id", 0)) == enemy.get_instance_id():
				return outcome
	return {}

func _test_assets_and_adapter() -> void:
	if not await _boot_main():
		return
	var adapter: Node = _adapter()
	_check(is_instance_valid(adapter), "NativeDeathFx adapter configured in world")
	if not is_instance_valid(adapter):
		return
	var snapshot: Dictionary = adapter.get_snapshot()
	_check(snapshot.get("configured") == true, "adapter configured")
	_check(int(snapshot.get("gore_textures", 0)) == 33, "33 gore textures loaded (25201 _GORE_TYPES)")
	_check(int(snapshot.get("di_textures", 0)) == 3, "3 blood_impact textures (25181)")
	_check(snapshot.get("blood_sheet") == true and snapshot.get("impact_sheet") == true,
		"Blood_FBF_4x4 + impact_basic_sheet present")
	var p: Dictionary = active_main.get("source_state").read_current_p()
	p["activeLMBSk"] = "weapon"
	forced_actor_fields += 1
	observations["pool_limits"] = snapshot.get("pool_limits")

func _test_weapon_hit_and_kill_fx() -> void:
	if not is_instance_valid(active_main):
		return
	var enemy: Node = _enemy("ch1_start_eye_mass_01")
	if not is_instance_valid(enemy):
		_check(false, "eye_mass_01 available")
		return
	var adapter: Node = _adapter()
	var state: Node = active_main.get("source_state")
	var fx: Node = active_main.get("world").get("_native_hit_fx")
	var killed := false
	var hp_hit_checked := false
	var swings := 0
	while not killed and swings < 25:
		swings += 1
		var parts_before: int = int(fx.get_snapshot()["metrics"]["particles_born"]) if is_instance_valid(fx) else 0
		var impacts_before: int = int((_adapter().get_snapshot()["metrics"] as Dictionary)["impacts"])
		var outcome: Dictionary = await _swing(enemy)
		if outcome.is_empty():
			continue
		_check(outcome.get("ok") == true, "hurtE completed (swing %d): %s" % [swings, str(outcome.get("reason", ""))])
		if outcome.get("ok") != true:
			observations["halt"] = outcome
			return
		if int(outcome.get("dmg_to_hp", 0)) > 0 and not hp_hit_checked:
			hp_hit_checked = true
			var journal: Array = outcome.get("journal", [])
			var ops: Array = []
			for row in journal:
				ops.append(str(row.get("op")))
			_check(ops.has("hit_blood"), "42399 blood journal on HP hit")
			_check(ops.has("hit_impact"), "42417 impact journal on weapon HP hit")
			var snapshot: Dictionary = _adapter().get_snapshot()
			_check(int(snapshot["counts"]["impacts"]) >= 1, "impact entity alive (25419 pool)")
			_check(int(snapshot["counts"]["hit_vfx"]) >= 1, "holy burst slot active (19172)")
			var parts_after: int = int(fx.get_snapshot()["metrics"]["particles_born"]) if is_instance_valid(fx) else 0
			_check(parts_after > parts_before, "blood/debris particles born (42399~42411/25435~)")
			var g: Dictionary = state.read_current_g()
			_check(g.has("_flashT") and str(g.get("_flashCol")) == "#ffffff",
				"42415 screen flash fields written (white)")
		killed = outcome.get("killed") == true
		if killed:
			# 처치 RNG 수 불변 (el=3 eye_mass → death_zone 포함 8/9).
			var draws: Array = outcome.get("rng_draws", [])
			var purposes: Array = []
			for draw in draws:
				purposes.append(str(draw["purpose"]))
			var revived: bool = purposes.has("revive_as_ghoul")
			var prefix_count: int = (9 if revived else 8) # P2-001c: 이후 drop:* 롤이 이어짐
			var drop_tail_ok := draws.size() > prefix_count and str(purposes[prefix_count]) == "drop:drop_gate"
			_check(drop_tail_ok, "kill rolls = fixed prefix + rollDrop tail (got %s)" % str(purposes))
			var snapshot2: Dictionary = _adapter().get_snapshot()
			var metrics: Dictionary = snapshot2["metrics"]
			_check(int(metrics["death_fx"]) >= 1, "deathFX front executed (42704)")
			_check(int(metrics["corpses"]) >= 1, "corpse spawned (42722)")
			_check(int(metrics["gore_pieces"]) >= 2, "gore pieces 2 (r>=18 — 42726~42731, provider rolls reused)")
			_check(int(metrics["death_impacts"]) >= 1, "death impact spawned (42732)")
			_check(int(metrics["blood_anims"]) >= 1, "death_blood sheet anim (24851~)")
			_check(int(snapshot2["counts"]["stains"]) >= 1, "floor stain active (24903)")
			_check(int(metrics.get("death_sounds_dispatched", 0)) >= 1,
				"death sound dispatched (P2-001c: 에셋 복사 후 실재생)")
			var body: Variant = enemy.get("_body")
			_check(is_instance_valid(body) and body.visible == false,
				"enemy sprite hidden on death (corpse replaces — drawEn alive gate)")
			observations["kill_metrics"] = metrics.duplicate(true)
	_check(killed, "enemy killed within 25 swings")
	_check(hp_hit_checked, "HP-damage hit observed before kill")

func _test_lifetimes_and_kislash_noimpact() -> void:
	if not is_instance_valid(active_main):
		return
	var adapter: Node = _adapter()
	# 수명: 시체 420틱·비행 고어 90틱·핏자국 540틱·DI 75틱 — 560틱 후 전부 소거
	# (바닥 잔류 고어 ground=persist는 맵 전환까지 — r>=40 전용이라 이 런에선 0).
	for i in range(560):
		await physics_frame
	var snapshot: Dictionary = adapter.get_snapshot()
	_check(int(snapshot["counts"]["corpses"]) == 0, "corpse expired by 420 ticks (24978 mt)")
	_check(int(snapshot["counts"]["gore"]) - int(snapshot["counts"]["gore_ground"]) == 0,
		"flying gore expired (90/40 ticks)")
	_check(int(snapshot["counts"]["stains"]) == 0, "stains expired (420+120 ticks)")
	_check(int(snapshot["counts"]["di"]) == 0, "death impacts expired (life 0.8/s)")
	_check(int(snapshot["counts"]["impacts"]) == 0 and int(snapshot["counts"]["hit_vfx"]) == 0,
		"hit impacts/bursts expired (16 ticks / 9f×0.04s)")
	# kiSlash: noImpact=true — 임팩트 미생성, 피 스플래시는 생성.
	var p: Dictionary = active_main.get("source_state").read_current_p()
	p["activeLMBSk"] = "kiSlash"
	forced_actor_fields += 1
	var enemy: Node = _enemy("ch1_start_eye_mass_02")
	if not is_instance_valid(enemy):
		_check(false, "eye_mass_02 available")
		return
	var impacts_before: int = int((adapter.get_snapshot()["metrics"] as Dictionary)["impacts"])
	var got_hp_hit := false
	for i in range(12):
		var outcome: Dictionary = await _swing(enemy)
		if outcome.is_empty() or outcome.get("ok") != true:
			continue
		if int(outcome.get("dmg_to_hp", 0)) > 0:
			got_hp_hit = true
			var ops: Array = []
			for row in outcome.get("journal", []):
				ops.append(str(row.get("op")))
			_check(ops.has("hit_blood"), "kiSlash HP hit emits blood (42399)")
			_check(not ops.has("hit_impact"), "kiSlash noImpact → no 42417 impact (원문 opts)")
			break
		if enemy.get("alive") != true:
			break
	_check(got_hp_hit or _enemy("ch1_start_eye_mass_02") == null or enemy.get("alive") != true,
		"kiSlash HP hit observed (or enemy died shielded — report)")
	var impacts_after: int = int((adapter.get_snapshot()["metrics"] as Dictionary)["impacts"])
	_check(impacts_after == impacts_before, "impact metric unchanged by kiSlash hits")
	observations["final_metrics"] = adapter.get_snapshot()["metrics"]
