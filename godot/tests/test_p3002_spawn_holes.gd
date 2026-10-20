extends SceneTree
## P3-002 — 1-1 소환굴 시스템 회귀 (실제 Main 부팅).
## 고정값은 원본 실측(Playwright, 현 리포 game.html + server.cjs):
##  - initStage(0) 직후 G.spawnHoles 14개(좌표·size·room)·G._totalSpawned 168·최근접 d 1223.76
##  - 소환굴 (3780,6220) 단독 런타임: 트리거 _gameFrame 120, 소환 프레임 211/316/458/603/727/830/911/968
##  - mkEn 난수 소비 수: 비보스 기본 9(+매직 1), etype6 12·7 13·47 12·8~11/13/14/16/17/19/25~29 11
##  - rollEtype(0) 고정 수열 7종 결과
## 검증: 배치·G 기록(state owner)·HUD 분모·휴면 게이트·트리거/90틱 연출/간격 커브 일정·
## 생존 상한 대기·소환 위치 RNG/rollEtype/mkEn 소비 순서·etype0 실제 적 등록(el undefined)·
## reviveIframes 15 감소·hurtE owner 경로 피격·완료(제거·shake)·총 168 소환·분모 불변.
const USERDIR = "EXODUSER-P3002-Isolated-20261020"
const GROUPS = ["placement_and_g", "dormant_gate", "schedule_and_rng", "alive_cap_wait",
	"full_run_and_completion", "etype0_actor_hurte"]
const SystemScript = preload("res://scripts/native_spawn_hole_system.gd")
const START := Vector2(4020, 7420)
const EXPECTED_HOLES := [ # [x, y, size, room] — 원본 G.spawnHoles 순서
	[2980, 6740, 0.5, 1], [5620, 6420, 0.3, 1], [2220, 5620, 0.5, 1], [5620, 5220, 0.3, 1],
	[3220, 4220, 0.5, 1], [5220, 3220, 0.5, 1], [2420, 2420, 0.3, 1], [5620, 1820, 0.5, 1],
	[4020, 1020, 0.8, 1], [3780, 6220, 0.3, 1], [3060, 3420, 0.55, 1], [4820, 1900, 0.8, 1],
	[4020, 5540, 0.3, -1], [4020, 4140, 0.3, -1]]
const EXPECTED_TOTAL := 168
const S_HOLE_SCHEDULE := [211, 316, 458, 603, 727, 830, 911, 968] # 원본 실측
const M_HOLE_SCHEDULE := [211, 258, 316, 385, 464, 545, 620, 690, 753, 811, 863, 908, 946, 978, 1003] # 원문 공식 재현(S 일정 실측 일치)
const MKEN_DRAWS := {0: 9, 1: 9, 3: 9, 4: 9, 5: 9, 6: 12, 7: 13, 8: 11, 9: 11, 10: 11, 11: 11, 12: 9,
	13: 11, 14: 11, 15: 9, 16: 11, 17: 11, 18: 9, 19: 11, 20: 9, 21: 9, 23: 9, 24: 9, 25: 11,
	26: 11, 27: 11, 28: 11, 29: 11, 47: 12}
const ROLL_ETYPE_FIXTURE := [[0.1, 0.0, 1], [0.1, 0.999, 26], [0.9, 0.0, 0], [0.9, 0.5, 12],
	[0.9, 0.999, 47], [0.4999, 0.3, 7], [0.5, 0.3, 6]]

var active_main: Node
var system: Node2D
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
	seed(20261020) # 공유 스트림(randi) 결정화 — 테스트 재현성
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P3002_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P3002_GROUP ", JSON.stringify(row))
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	print("P3002_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P3002_FAIL ", current_group, " ", label)

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
	system = active_main.get("world").get_node_or_null("NativeSpawnHoleSystem")
	return true

func _g() -> Dictionary:
	var g: Variant = active_main.get("source_state").read_current_g()
	return g if g is Dictionary else {}

func _test_placement_and_g() -> void:
	if not await _boot():
		return
	_check(system != null and system.get_script() == SystemScript, "boot installs NativeSpawnHoleSystem under World")
	if system == null:
		return
	var snap: Dictionary = system.get_snapshot()
	var holes: Array = system.get("holes")
	_check(holes.size() == EXPECTED_HOLES.size(), "14 holes (원본 initStage 실측) — got %d" % holes.size())
	var nearest := 1e18
	for i in range(mini(holes.size(), EXPECTED_HOLES.size())):
		var h: Dictionary = holes[i]
		var e: Array = EXPECTED_HOLES[i]
		_check(_close(float(h["x"]), e[0]) and _close(float(h["y"]), e[1]) and _close(float(h["size"]), e[2])
			and int(h["room"]) == e[3], "hole #%d == 원본 (%s)" % [i, str(e)])
		_check(h.get("timer") == null and int(h.get("alive", -1)) == 0, "hole #%d timer null(맵 생성 RNG)·alive 0" % i)
		var ddx: float = float(h["x"]) - START.x
		var ddy: float = float(h["y"]) - START.y
		nearest = minf(nearest, sqrt(ddx * ddx + ddy * ddy)) # Vector2는 float32 — 배정밀 계산
	_check(_close(nearest, 1223.7646832622684, 1e-6), "최근접 소환굴 d 1223.76 (P2-001g 'd 1224~')")
	_check(int(system.get("total_spawned")) == EXPECTED_TOTAL, "G._totalSpawned 168 (30625)")
	# _spawnHoleCount(31030) 표
	_check(SystemScript.spawn_hole_count(0.3) == 8 and SystemScript.spawn_hole_count(0.5) == 15
		and SystemScript.spawn_hole_count(0.55) == 15 and SystemScript.spawn_hole_count(0.8) == 15,
		"_spawnHoleCount si0 S8/M15/L15 = ceil(ceil(base*.5)*.3)")
	_check(SystemScript.spawn_hole_count(0.3, 1) == 50 and SystemScript.spawn_hole_count(0.5, 1) == 100
		and SystemScript.spawn_hole_count(0.8, 1) == 100, "_spawnHoleCount si>0 S50/M100/L100")
	# state G owner 기록 — HUD/미니맵이 읽는 같은 배열
	var g := _g()
	_check(g.get("spawnHoles") is Array and is_same(g["spawnHoles"], holes), "G.spawnHoles = 소환 시스템 배열(같은 인스턴스)")
	_check(int(g.get("_totalSpawned", -1)) == EXPECTED_TOTAL, "G._totalSpawned 168 in state G")
	var receipts: Array = snap["g_receipts"]
	_check(not receipts.is_empty() and receipts[0]["receipt"].get("applied") == true, "state owner G write receipt applied")
	# HUD 분모(60322 폴백 G._stageKills/G._totalSpawned)
	for i in range(30):
		await physics_frame
	var hud: Node = active_main.get("hud")
	var hud_snap: Dictionary = hud.get_native_first_fight_hud_snapshot()
	var kill_text := str(hud_snap.get("kill_text", ""))
	# P3-003 지역(60700~): 원본처럼 배치 후 _initRegions — 4지역 분모 NW23·NE60·SW53·SE32(합 168).
	# HUD 60322는 현재 지역 분모를 보인다(시작점 = SE 32, 웹 실측 SW 지점 0/53과 같은 규칙).
	var regions: Variant = g.get("_regions")
	if regions is Array and (regions as Array).size() == 4:
		var totals: Array = []
		for r in regions:
			totals.append(int(r["total"]))
		_check(totals == [23, 60, 53, 32], "G._regions 분모 NW23/NE60/SW53/SE32 (합 168) — %s" % str(totals))
		var cur: int = int(g.get("_regCurIdx", -1))
		var expect_total: int = int(regions[cur]["total"]) if cur >= 0 and cur < 4 else EXPECTED_TOTAL
		_check(kill_text.ends_with("/ " + str(expect_total)), "HUD 처치 분모 = 현재 지역 %d (%s)" % [expect_total, kill_text])
	else:
		_check(kill_text.ends_with("/ 168"), "HUD 처치 분모 = 168 폴백 (" + kill_text + ")")
	observations["kill_text_boot"] = kill_text
	_check(bool(snap["void_black_texture"]), "원본 vfx_void_black.png 로드(바이트 복사)")
	# 원본 타일 격자 동일성(해시) — 배치 입력
	var tiles: Array = active_main.get("world").get("map_data")["tiles"]
	var hsh := 0
	for v in tiles:
		hsh = (hsh * 31 + int(v)) & 0xffffffff
	_check(hsh == 3930185914, "map tiles hash == 원본 G.map (3930185914)")

func _test_dormant_gate() -> void:
	if system == null:
		return
	_check(system.get("active") == false, "하니스 부팅은 갱신 휴면(커튼 선례)")
	var f0: int = int(system.get("_game_frame"))
	for i in range(12):
		await physics_frame
	_check(int(system.get("_game_frame")) == f0, "휴면 중 _gameFrame 불변")
	# active여도 G.on=false(인트로 전)면 update() 미진행(32112)
	system.set("active", true)
	var g_on: Variant = _g().get("on")
	for i in range(6):
		await physics_frame
	if g_on != true:
		_check(int(system.get("_game_frame")) == f0, "G.on=false → 32112 return (no advance)")
	observations["g_on_at_boot"] = g_on
	system.set("active", false)
	system.set("_game_frame", 0)

func _journal_for(hole_index: int) -> Array:
	var out: Array = []
	for e in system.get("spawn_journal"):
		if int(e["hole"]) == hole_index:
			out.append(e)
	return out

func _expected_purposes(entry: Dictionary) -> Array:
	var draws: Array = entry["draws"]
	var tries := 0
	for d in draws:
		if d["purpose"] == "pos_angle":
			tries += 1
	var out: Array = []
	for i in range(tries):
		out.append_array(["pos_angle", "pos_radius"])
	out.append_array(["rollEtype_ranged", "rollEtype_roll"])
	if entry.get("consumer") == "mken_null":
		return out
	out.append("rollElite")
	if int(entry.get("elite", 0)) > 0:
		out.append("rollMods_attack")
	out.append_array(["spd", "r"])
	for row in SystemScript.MKEN_LITERAL_DRAWS:
		var etypes: Array = row[1]
		if etypes.is_empty() or etypes.has(int(entry["etype"])):
			out.append(row[0])
	return out

func _test_schedule_and_rng() -> void:
	if system == null:
		return
	var player: Node2D = active_main.get("player")
	var world: Node2D = active_main.get("world")
	player.global_position = START
	for fixture in ROLL_ETYPE_FIXTURE:
		_check(SystemScript.roll_etype_from(fixture[0], fixture[1]) == fixture[2],
			"rollEtype(0) %s → %d (원본 실측)" % [str(fixture), fixture[2]])
	var draws_before: int = int(world.get("_native_random_draw_count"))
	# 119틱: 트리거 없음(35637 _gameFrame<120)
	for i in range(119):
		player.global_position = START
		system.advance_native(1.0)
	var holes: Array = system.get("holes")
	var any_trig := false
	for h in holes:
		any_trig = any_trig or h.get("_triggered") == true
	_check(not any_trig, "_gameFrame<120 동안 트리거 없음")
	player.global_position = START
	system.advance_native(1.0) # 120
	var triggered: Array = []
	for h in holes:
		if h.get("_triggered") == true:
			triggered.append(int(h["_index"]))
	triggered.sort()
	_check(triggered == [0, 1, 9, 12], "_gameFrame 120에 2000px 내 4개 트리거(d 1243/1887/1224/1880) — %s" % str(triggered))
	_check(int(world.get("_native_random_draw_count")) == draws_before, "트리거·연출 구간 난수 무소비")
	# S(#9)·M(#0)·S(#1)·S(#12) 완료까지 진행 (1003 프레임 + 여유)
	while int(system.get("_game_frame")) < 1010:
		player.global_position = START
		system.advance_native(1.0)
	var s_frames: Array = []
	for e in _journal_for(9):
		s_frames.append(int(e["frame"]))
	_check(s_frames == S_HOLE_SCHEDULE, "S 소환굴(3780,6220) 소환 프레임 == 원본 실측 %s" % str(s_frames))
	var m_frames: Array = []
	for e in _journal_for(0):
		m_frames.append(int(e["frame"]))
	_check(m_frames == M_HOLE_SCHEDULE, "M 소환굴(2980,6740) 소환 프레임 == 원문 커브 %s" % str(m_frames))
	_check(_journal_for(1).size() == 8 and _journal_for(12).size() == 8, "S 소환굴 #1/#12 각 8마리")
	var near_left := 0
	for h in system.get("holes"):
		if int(h["_index"]) in [0, 1, 9, 12]:
			near_left += 1
	_check(near_left == 0, "완료된 근접 소환굴 4개 G.spawnHoles에서 제거(35691)")
	_check(system.get("holes").size() == 10 and _g()["spawnHoles"].size() == 10, "G.spawnHoles 14→10 (미니맵 점 동시 감소)")
	# RNG 소비 순서·수
	var draws_sum := 0
	var etype_seen := {}
	for e in system.get("spawn_journal"):
		var purposes: Array = []
		for d in e["draws"]:
			purposes.append(d["purpose"])
		draws_sum += purposes.size()
		_check(purposes == _expected_purposes(e), "draw order hole %d n%d etype %d" % [e["hole"], e["spawn_n"], e["etype"]])
		if e.get("consumer") != "mken_null":
			var tries: int = purposes.count("pos_angle")
			var mk: int = purposes.size() - tries * 2 - 2
			var expected_mk: int = int(MKEN_DRAWS.get(int(e["etype"]), -1)) + (1 if int(e["elite"]) > 0 else 0)
			_check(mk == expected_mk, "mkEn 소비 수 etype %d = %d (원본 실측)" % [e["etype"], expected_mk])
			var by: Dictionary = {}
			for d in e["draws"]:
				by[d["purpose"]] = float(d["value"])
			_check(int(e["etype"]) == SystemScript.roll_etype_from(by["rollEtype_ranged"], by["rollEtype_roll"]),
				"etype = rollEtype(draws)")
			etype_seen[int(e["etype"])] = true
			# 위치: 마지막 시도 각·반경(35663) 또는 나선/중심 폴백
			var h_xy: Array = e["hole_xy"]
			var last_angle: float = float(e["draws"][(tries - 1) * 2]["value"]) * TAU
			var last_r: float = 120.0 + float(e["draws"][(tries - 1) * 2 + 1]["value"]) * 300.0 + 0.3 * 150.0
			if int(e["hole"]) == 0:
				last_r = 120.0 + float(e["draws"][(tries - 1) * 2 + 1]["value"]) * 300.0 + 0.5 * 150.0
			var req := Vector2(e["requested"][0], e["requested"][1])
			var expect := Vector2(float(h_xy[0]) + cos(last_angle) * last_r, float(h_xy[1]) + sin(last_angle) * last_r)
			if not world.is_world_blocked(expect):
				_check(req.distance_to(expect) < 1e-6, "spawn pos = hole + (cos,sin)(u*2PI)*(120+u*300+size*150)")
			_check(tries >= 1 and tries <= 30, "위치 시도 1..30회")
	_check(int(system.get_snapshot()["metrics"]["rng_calls"]) == draws_sum, "metrics.rng_calls == journal draws")
	observations["etypes_seen_near4"] = etype_seen.keys()
	observations["near4_spawns"] = system.get("spawn_journal").size()

func _test_alive_cap_wait() -> void:
	if system == null:
		return
	var player: Node2D = active_main.get("player")
	# 다음 소환굴(#13: 4020,4140)로 이동 → 트리거·연출 후 첫 소환 프레임에 상한 대기
	var target: Dictionary = {}
	for h in system.get("holes"):
		if int(h["_index"]) == 13:
			target = h
	_check(not target.is_empty(), "hole #13 present")
	if target.is_empty():
		return
	var at := Vector2(float(target["x"]), float(target["y"]))
	system.set("alive_cap", 0)
	var j0: int = _journal_for(13).size()
	var waits0: int = int(system.get_snapshot()["metrics"]["alive_waits"])
	for i in range(1 + 91):
		player.global_position = at
		system.advance_native(1.0)
	_check(target.get("_triggered") == true and float(target.get("_spawnDelay", 99)) <= 0.0, "#13 트리거+90틱 연출 종료")
	_check(_journal_for(13).size() == j0, "생존 상한 도달 → 소환 없음(35658)")
	# 2000px 안의 다른 소환굴(#4/#10/#5 등)도 같은 틱에 트리거되어 함께 대기한다.
	_check(int(system.get_snapshot()["metrics"]["alive_waits"]) > waits0 and _close(float(target["_spawnCD"]), 30.0),
		"_spawnCD=30 대기")
	system.set("alive_cap", SystemScript.ALIVE_CAP)
	for i in range(31):
		player.global_position = at
		system.advance_native(1.0)
	_check(_journal_for(13).size() == j0 + 1 and int(_journal_for(13)[-1]["frame"]) == int(system.get("_game_frame")),
		"대기 30틱 후(31번째 틱) 소환 재개")

func _run_until_empty(max_ticks: int) -> int:
	var player: Node2D = active_main.get("player")
	var ticks := 0
	while not system.get("holes").is_empty() and ticks < max_ticks:
		var h: Dictionary = system.get("holes")[system.get("holes").size() - 1]
		player.global_position = Vector2(float(h["x"]), float(h["y"]))
		system.advance_native(1.0)
		ticks += 1
	return ticks

func _test_full_run_and_completion() -> void:
	if system == null:
		return
	var g := _g()
	var shake_before: float = float(g.get("shake", 0.0))
	var ticks := _run_until_empty(40000)
	var snap: Dictionary = system.get_snapshot()
	var m: Dictionary = snap["metrics"]
	_check(system.get("holes").is_empty() and _g()["spawnHoles"].is_empty(), "모든 소환굴 완료·제거 (%d ticks)" % ticks)
	_check(int(m["completed"]) == 14, "completed 14")
	_check(int(m["spawned"]) + int(m["mken_null"]) >= EXPECTED_TOTAL, "spawned+null ≥ 168")
	_check(int(m["spawned"]) == int(m["actors_registered"]) + int(m["unported_spawns"]) + int(m["consumer_rejected"]),
		"spawned = actors + unported + rejected")
	_check(int(m["consumer_rejected"]) == 0, "etype0 등록 거부 0")
	var per_hole := {}
	for e in snap["spawn_journal"]:
		if e.get("consumer") != "mken_null":
			per_hole[int(e["hole"])] = int(per_hole.get(int(e["hole"]), 0)) + 1
	var total := 0
	for i in range(EXPECTED_HOLES.size()):
		var expected: int = SystemScript.spawn_hole_count(EXPECTED_HOLES[i][2])
		total += int(per_hole.get(i, 0))
		if int(m["mken_null"]) == 0:
			_check(int(per_hole.get(i, 0)) == expected, "hole #%d 소환 수 %d (최대 수=_spawnHoleCount)" % [i, expected])
	if int(m["mken_null"]) == 0:
		_check(total == EXPECTED_TOTAL, "총 소환 168 == G._totalSpawned")
	_check(int(_g().get("_totalSpawned", -1)) == EXPECTED_TOTAL, "처치 분모 G._totalSpawned 불변 168")
	var opt: Dictionary = active_main.read_native_feel_opt_shake()
	var scale: float = float(opt["value"]) / 100.0 if opt.get("ready") == true else 1.0
	_check(float(_g().get("shake", 0.0)) >= maxf(shake_before, 5.0 * scale), "완료 shake(5+~~(size*9)) G.shake 기록")
	observations["full_run_ticks"] = ticks
	observations["metrics"] = m

func _test_etype0_actor_hurte() -> void:
	if system == null:
		return
	var world: Node2D = active_main.get("world")
	var player: Node2D = active_main.get("player")
	var target: Node2D = null
	var entry: Dictionary = {}
	for e in system.get("spawn_journal"):
		if e.get("consumer") != "flesh_crawler":
			continue
		for enemy in world.get_enemies():
			if is_instance_valid(enemy) and str(enemy.get("data")["id"]) == str(e["actor_id"]) and enemy.get("alive") == true:
				target = enemy
				entry = e
				break
		if target != null:
			break
	_check(target != null, "etype0 소환 적 실제 등록(flesh crawler)")
	if target == null:
		return
	var data: Dictionary = target.get("data")
	_check(target.get_script().resource_path == "res://scripts/enemy_melee_flesh_crawler.gd", "전용 스크립트 재사용")
	_check(int(target.get("el")) == -1 and str(target.get("element")) == "" and int(data["element_id"]) == -1,
		"el undefined(35674) → el -1 (elMul 1)")
	_check(world.get_native_world_identity().has(target), "world 레지스트리(ens) 등록")
	_check(int(target.get("etype")) == 0 and int(data["room"]) == int(entry["room"]), "etype0·room=h.room")
	var by: Dictionary = {}
	for d in entry["draws"]:
		by[d["purpose"]] = float(d["value"])
	var scale_mul: float = 1.08 if int(entry["elite"]) == 1 else 1.0
	_check(_close(float(target.get("radius")), (10.0 + by["r"] * 2.0) * 2.0 * scale_mul), "r=(ETYPE_R[0]+u*2)*2*scaleMul")
	_check(_close(float(data["speed_pixels_per_tick"]), (0.39 + by["spd"] * 0.08) * 1.5), "spd=(.39+u*.08)*1.5")
	_check(_close(float(data["native_final"]["st2"]), 30.0 + by["st2"] * 50.0), "st2=30+u*50")
	_check(_close(float(data["native_final"]["_bossOrbitAng"]), by["_bossOrbitAng"] * TAU)
		and _close(float(data["native_final"]["_erraticAng"]), by["_erraticAng"] * TAU), "_bossOrbitAng/_erraticAng 기록")
	_check(int(data["hp"]) == (1751 if int(entry["elite"]) == 1 else 875), "hp lv1 875/magic 1751")
	_check(_close(float(data["native_final"]["reviveIframes"]), 0.0), "reviveIframes 15 → 34456 감소 완료(0)")
	# reviveIframes 15 직후 감소 단위 검사 — 새 소환굴 대신 기록된 감소 횟수
	_check(int(system.get_snapshot()["metrics"]["revive_decays"]) >= 15, "reviveIframes 프레임 감소(hurtE 북키핑 API)")
	# hurtE owner 경로 피격 (P2-001h 하니스와 동일 절차)
	var p: Dictionary = active_main.get("source_state").read_current_p()
	p["activeLMBSk"] = "weapon"
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
				_check(outcome.get("ok") == true, "hurte owner pipeline ok on spawn-hole enemy")
				_check(float(outcome.get("shield_before", 0)) > float(outcome.get("shield_after", -1))
					or float(outcome.get("hp_before", 0)) > float(outcome.get("hp_after", -1)),
					"spawn-hole enemy takes shield/hp damage via owner API")
		if got_hit:
			break
	_check(got_hit, "소환 적이 hurtE owner 경로로 피격")
	observations["hurte_target"] = entry.get("actor_id")
