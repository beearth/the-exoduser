extends SceneTree
## P2-001h — 인트로 커튼 오픈 시퀀스 회귀 (실제 Main 부팅).
## 검증: begin(커튼 닫힘·iframes 9999·bonfire 0) → finish(_openIntroCurtain 63411~63441):
## 5마리 오각 링(반경 580·각 2πi/5−π/2·etype0·flesh crawler 스크립트), mkEn RNG 소비
## 순서(rollElite→[rollMods]→spd→r→st2→facing→projT→bossPatT→_bossOrbitAng→_erraticAng)와 필드 유도 일치,
## 매직 엘리트 경로(hp×2·atk×1.3·scale×1.08·projCd 192), bonfire t300/r280 감쇠·push-out,
## 커튼 OPENING→DONE(+900ms 정리), 스폰된 적이 P1-002 hurtE owner 경로로 피격되는지.
const SequenceScript = preload("res://scripts/native_intro_curtain_sequence.gd")
const USERDIR = "EXODUSER-P2001H-Isolated-20261020"
const GROUPS = ["begin_and_finish_spawn", "bonfire_and_curtain_lifecycle", "hurte_path_on_spawned"]

var active_main: Node
var sequence: Node2D
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var hurte_outcomes: Array = []

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2001H_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2001H_GROUP ", JSON.stringify(row))
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	print("P2001H_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2001H_FAIL ", current_group, " ", label)

func _close(a: float, b: float, eps: float = 1e-6) -> bool:
	return absf(a - b) <= eps

func _boot() -> bool:
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

func _test_begin_and_finish_spawn() -> void:
	if not await _boot():
		return
	var world: Node2D = active_main.get("world")
	var player: Node2D = active_main.get("player")
	var view: Control = active_main.get_native_intro_curtain_view()
	_check(view != null, "actual curtain view service READY")
	sequence = SequenceScript.new()
	sequence.name = "NativeIntroCurtainSequence"
	_check(sequence.configure(world, player, view, active_main.get("source_state")), "sequence configure")
	world.add_child(sequence)
	var enemies_before: int = world.get_enemies().size()
	_check(enemies_before >= 1, "installed encounter actors present before intro")
	# begin (63277~63293 커튼 소유 구간)
	var begun: Dictionary = sequence.begin_native_intro()
	_check(begun.get("applied") == true, "begin applied")
	_check(world.get_enemies().is_empty(), "63279 ens.length=0 — installed actors cleared at intro begin")
	_check(sequence.get("phase") == "guide", "phase guide after begin")
	_check(float(player.get("iframes")) == 9999.0, "P.iframes=9999 (63283)")
	_check(view.phase == view.Phase.CLOSED, "curtain CLOSED shown (63289~63291)")
	var snap0: Dictionary = sequence.get_snapshot()
	_check(float(snap0["bonfire"]["t"]) == 0.0 and snap0["bonfire"]["active"] == false,
		"bonfire.t=0 at intro begin (63282)")
	_check(snap0["intro_flag"] == true and snap0["on_flag"] == false, "G._intro/G.on mirrors (63283)")
	var g0: Variant = active_main.get("source_state").read_current_g()
	_check(g0 is Dictionary and g0.get("on") == false and g0.get("_intro") == true,
		"state G: _intro=true/on=false at begin (63283, owner API)")
	# 63352 250ms 쓰로틀: begin 직후 advance는 거부
	_check(sequence.advance_native_guide().get("applied") != true, "guide advance throttled 250ms (63352)")
	# finish → _openIntroCurtain
	var finished: Dictionary = sequence.finish_native_guide()
	_check(finished.get("applied") == true, "finish applied")
	_check(int(finished.get("spawned", 0)) == 5, "5 ring enemies spawned (63426~63432)")
	_check(int(finished.get("purge_candidates", -1)) == 0, "500px purge candidates 0 (63422, nearest 888px)")
	_check(float(player.get("iframes")) == 600.0, "P.iframes=600 (63413)")
	var g1: Variant = active_main.get("source_state").read_current_g()
	_check(g1 is Dictionary and g1.get("on") == true,
		"state G.on=true at curtain open (63413) — update clock g_on(32580)/stageTime 개방")
	_check(world.get_enemies().size() == 5, "world registry exactly 5 (ring only — 원본 stage0 초기 구성)")
	var snap: Dictionary = sequence.get_snapshot()
	var journal: Array = snap["spawn_journal"]
	_check(journal.size() == 5, "spawn journal 5 entries")
	var magic := 0
	var p0: Vector2 = player.global_position
	for i in range(journal.size()):
		var entry: Dictionary = journal[i]
		var ring_index: int = int(entry["ring_index"])
		var req := Vector2(entry["requested"][0], entry["requested"][1])
		var expected_angle: float = TAU * float(ring_index) / 5.0 - PI * 0.5
		_check(_close(req.distance_to(p0), 580.0, 0.001), "ring radius 580 (63425) #%d" % i)
		var diff: float = wrapf((req - p0).angle() - expected_angle, -PI, PI)
		_check(absf(diff) < 0.001, "ring angle 2*PI*i/5-PI/2 (63426) #%d" % i)
		# RNG 소비 순서 + 필드 유도 (mkEn 31120~)
		var draws: Array = entry["draws"]
		var elite: int = int(entry["elite"])
		var expected_purposes: Array = ["rollElite"]
		if elite > 0:
			expected_purposes.append("rollMods_attack")
			magic += 1
		expected_purposes.append_array(["spd", "r", "st2", "facing", "projT", "bossPatT", "_bossOrbitAng", "_erraticAng"])
		var purposes: Array = []
		for d in draws:
			purposes.append(d["purpose"])
		_check(purposes == expected_purposes, "mkEn draw order #%d" % i)
		var by_purpose: Dictionary = {}
		for d in draws:
			by_purpose[d["purpose"]] = float(d["value"])
		var scale_mul: float = 1.08 if elite == 1 else 1.0
		_check(_close(float(entry["radius"]), (10.0 + by_purpose["r"] * 2.0) * 2.0 * scale_mul),
			"r=(ETYPE_R[0]+u*2)*2*scaleMul (31140) #%d" % i)
		_check(_close(float(entry["speed"]), (0.39 + by_purpose["spd"] * 0.08) * 1.5),
			"spd=(ETYPE_SPD[0]+u*.08)*1.5 (31138) #%d" % i)
		_check(_close(float(entry["st2"]), 30.0 + by_purpose["st2"] * 50.0), "st2=30+u*50 (31149) #%d" % i)
		_check(_close(float(entry["facing"]), by_purpose["facing"] * TAU), "facing=u*2PI (31149) #%d" % i)
		_check(_close(float(entry["projT"]), 180.0 + by_purpose["projT"] * 120.0), "projT=180+u*120 (31152) #%d" % i)
		_check(_close(float(entry["bossPatT"]), 30.0 + by_purpose["bossPatT"] * 20.0), "bossPatT=30+u*20 (31156) #%d" % i)
		_check(elite == (1 if by_purpose["rollElite"] < 0.03 else 0), "rollElite hell0 magic 0.03 (31063/ELITE_PROB[0]) #%d" % i)
		var expected_hp: int = 1751 if elite == 1 else 875
		_check(int(entry["hp"]) == expected_hp, "hp lv1 875/magic 1751 (31146~31148) #%d" % i)
		_check(int(entry["atk"]) == (40 if elite == 1 else 31), "atk 31/magic 40 (31153~31154) #%d" % i)
		_check(int(entry["projCd"]) == (192 if elite == 1 else 240), "projCd 240/magic 192 (31159~31160) #%d" % i)
		if elite == 1:
			_check(entry["mods"].size() == 1 and str(entry["mods"][0]) in ["M29", "M30"],
				"magic mods from hell0 attacks (31072) #%d" % i)
	_check(int(snap["metrics"]["rng_calls"]) == 5 * 9 + magic,
		"rng calls = 5x9 + magic (rollElite+spd+r+st2+facing+projT+bossPatT+_bossOrbitAng+_erraticAng, 31120~; P3-002 정정)")
	observations["magic_elites"] = magic
	observations["rng_calls"] = snap["metrics"]["rng_calls"]
	# 등록된 실제 적 노드 필드 == journal
	for enemy in world.get_enemies():
		if not str(enemy.get("data")["id"]).begins_with("ch1_curtain_ring_"):
			continue
		var id: String = str(enemy.get("data")["id"])
		var entry: Dictionary = {}
		for candidate in journal:
			if candidate["id"] == id:
				entry = candidate
		_check(not entry.is_empty(), "journal entry for node " + id)
		if entry.is_empty():
			continue
		_check(int(enemy.get("etype")) == 0, "etype0 (63430 mkEn etype=0) " + id)
		_check(int(enemy.get("hp")) == int(entry["hp"]) and float(enemy.get("eShield")) == float(entry["hp"]),
			"node hp/eShield == mkEn (eShield=hp 31177) " + id)
		_check(_close(float(enemy.get("radius")), float(entry["radius"])), "node radius == mkEn " + id)
		var script: Script = enemy.get_script()
		_check(script != null and script.resource_path == "res://scripts/enemy_melee_flesh_crawler.gd",
			"actual etype0 consumer script " + id)

func _test_bonfire_and_curtain_lifecycle() -> void:
	if not is_instance_valid(sequence):
		return
	var world: Node2D = active_main.get("world")
	var view: Control = active_main.get_native_intro_curtain_view()
	var snap: Dictionary = sequence.get_snapshot()
	_check(snap["phase"] == "opening", "phase opening after finish")
	_check(float(snap["bonfire"]["t"]) <= 300.0 and float(snap["bonfire"]["t"]) > 290.0
		and float(snap["bonfire"]["r"]) == 280.0 and snap["bonfire"]["active"] == true,
		"bonfire t:300 r:280 reset (63433)")
	_check(snap["barrier_texture"] == true, "bonfire_barrier.png loaded (18977/55323)")
	_check(view.phase == view.Phase.OPENING or view.phase == view.Phase.DONE, "curtain opening (63434)")
	# push-out: 스폰 적 1마리를 결계 안으로 이동 → 다음 틱 경계(280+r) 밖
	var target: Node2D = null
	for enemy in world.get_enemies():
		if str(enemy.get("data")["id"]).begins_with("ch1_curtain_ring_"):
			target = enemy
			break
	_check(target != null, "spawned ring enemy available")
	if target != null:
		var center := Vector2(snap["bonfire"]["x"], snap["bonfire"]["y"])
		target.global_position = center + Vector2(10, 0)
		await physics_frame
		await physics_frame
		var dist: float = target.global_position.distance_to(center)
		# 밀어낸 뒤에도 적 자체 추격 이동(틱당 speed≈0.59~0.65)이 프레임마다 안쪽으로
		# 한 걸음 들어오고 다음 틱 다시 밀려난다(웹 34424 매 프레임 push와 동일 균형).
		_check(dist >= 280.0 + float(target.get("radius")) - 3.0,
			"bonfire push-out holds r+clearance boundary (34424/31732~)")
	# 감쇠: 60틱 ≈ t-60 (34413 t-=sp)
	var t0: float = float(sequence.get_snapshot()["bonfire"]["t"])
	for i in range(60):
		await physics_frame
	var t1: float = float(sequence.get_snapshot()["bonfire"]["t"])
	_check(t0 - t1 >= 55.0 and t0 - t1 <= 70.0, "bonfire decay 1/tick at 60Hz (34413)")
	# +900ms 정리 (63436~63440) — 벽시계 대기
	await create_timer(1.2).timeout
	await physics_frame
	var snap2: Dictionary = sequence.get_snapshot()
	_check(snap2["phase"] == "done" and snap2["intro_flag"] == false, "dispose at +900ms (63436~63440)")
	var g2: Variant = active_main.get("source_state").read_current_g()
	_check(g2 is Dictionary and g2.get("_intro") == null and g2.get("on") == true,
		"state G: _intro=null, on stays true after dispose (63440)")
	_check(view.phase == view.Phase.HIDDEN, "curtain hidden after dispose")
	observations["bonfire_pushes"] = snap2["metrics"]["bonfire_pushes"]

func _test_hurte_path_on_spawned() -> void:
	if not is_instance_valid(sequence):
		return
	var world: Node2D = active_main.get("world")
	var player: Node2D = active_main.get("player")
	var p: Dictionary = active_main.get("source_state").read_current_p()
	p["activeLMBSk"] = "weapon"
	var target: Node2D = null
	for enemy in world.get_enemies():
		if str(enemy.get("data")["id"]).begins_with("ch1_curtain_ring_") and enemy.get("alive") == true:
			target = enemy
			break
	_check(target != null, "alive ring enemy for hurte")
	if target == null:
		return
	var got_hit := false
	for attempt in range(6):
		if player.get("state") != "idle":
			for i in range(240):
				await physics_frame
				if player.get("state") == "idle":
					break
		var stand: Vector2 = target.global_position + Vector2(-(47.0 + float(target.get("radius")) - 8.0), 0)
		player.global_position = stand
		player.set("facing", (target.global_position - stand).normalized())
		var before: int = hurte_outcomes.size()
		if not player.request_attack():
			player.release_attack()
			for i in range(600):
				await physics_frame
				if player.get("state") == "idle" and float(player.get("stamina")) >= 30.0:
					break
			continue
		if player.get("state") == "windup":
			player.set("facing", (target.global_position - player.global_position).normalized())
			player.release_attack()
		for i in range(300):
			await physics_frame
			if hurte_outcomes.size() > before:
				break
		player.release_attack()
		for outcome in hurte_outcomes.slice(before):
			if int(outcome.get("enemy_id", 0)) == target.get_instance_id() and outcome.get("applied") == true:
				got_hit = true
				_check(outcome.get("ok") == true, "hurte owner pipeline ok on curtain enemy")
				_check(float(outcome.get("shield_before", 0)) > float(outcome.get("shield_after", -1))
					or float(outcome.get("hp_before", 0)) > float(outcome.get("hp_after", -1)),
					"curtain enemy takes shield/hp damage via owner API (P1-002 F)")
		if got_hit:
			break
	_check(got_hit, "spawned enemy reachable through native hurte owner path")
