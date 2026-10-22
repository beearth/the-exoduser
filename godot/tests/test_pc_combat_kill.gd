extends SceneTree
## PC-COMBAT-KILL (2026-10-22) — 시작 필드 적이 실제로 죽는지 + 보행 canMv 회귀 (실제 Main 부팅).
## 원인: 42490 kiSlash 포이즈(poiseHit)는 flesh_crawler면 무조건 v3 field call로 갔고, 그 domain은 exact factory actor
##   (ch1_initial_015) 1종이라, 커튼 5링(63425~63432)·Group-A a_0/a_5/a_6·자연 소환 etype0이
##   source_field_call_unavailable로 정지 → 42383 HP 쓰기 뒤라 hp<=0·alive=true 좀비가 남았다.
##   etype6은 42136 SPECIAL_HIT_ETYPES에 묶여 피해 자체가 0이었다(원본 42167~42170 방패 경감만 있음).
## 보행: 원본은 canMv(x,y,P.r)만 본다(G33022~33028 축 분리, G32762 넉백 두 축 함께).
##   일반 적 몸체(layer 4) 접촉은 원본에 없다(보스 34349 밀어내기만).
## 테스트 소유 개입(기록): 피격 위치 배치(적 1마리 위치 1회), 플레이어 배치(벽 앞), hurtE 직접 호출
##   (crescent.gd 19837 opts 프로필 그대로, 피해량은 시험값). 사망·HP 주입 없음.
const SequenceScript = preload("res://scripts/native_intro_curtain_sequence.gd")
const NORMAL_HURTE = preload("res://scripts/native_normal_enemy_hurte.gd")
const FLESH_SCRIPT = preload("res://scripts/enemy_melee_flesh_crawler.gd")
const FIXTURE = preload("res://tests/demo11_etype_a_fixture.gd")
const USERDIR = "EXODUSER-demo11-pc-combat-kill-Isolated-20261022"
const GROUPS = ["curtain_ring_kislash_kill", "walk_canmv", "group_a_domain_and_etype6", "domain_negative"]
const KI_OPTS := {"poiseHit": true, "kbMult": 0.5, "noImpact": true, "_lessonAttack": "kiSlash",
	"_lessonFullCharge": false, "_kiFull": false}

var active_main: Node
var sequence: Node2D
var fixture: RefCounted
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("PCKILL_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("PCKILL_GROUP ", JSON.stringify(row))
	_free_main()
	if fixture != null:
		fixture.close()
		fixture = null
	for _frame in range(12):
		await process_frame
	print("PCKILL_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"fallback_paths_used": false, "damage_or_death_injected": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("PCKILL_FAIL ", current_group, " ", label)

func _free_main() -> void:
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null
	sequence = null

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
	return true

func _journal_route(outcome: Dictionary) -> String:
	for row in outcome.get("journal", []):
		if row is Dictionary and int(row.get("line", 0)) == 42490 and str(row.get("op", "")) == "poise_hit":
			return str((row.get("data", {}) as Dictionary).get("route", ""))
	return ""

func _no_zombies(world: Node) -> bool:
	for e in world.get_enemies():
		if is_instance_valid(e) and "hp" in e and float(e.get("hp")) <= 0.0 and e.get("alive") == true:
			return false
	return true

func _hit(main: Node, enemy: Node, dmg: int, ang: float) -> Dictionary:
	return NORMAL_HURTE.new().execute(main, main.get("world"), enemy, dmg, ang, 0, KI_OPTS.duplicate())

# ── 1: 실제 커튼 오픈 5링 → kiSlash hurtE 2타(비치사·치사) ──
func _test_curtain_ring_kislash_kill() -> void:
	if not await _boot():
		return
	var world: Node2D = active_main.get("world")
	var player: Node2D = active_main.get("player")
	observations["map11_provider"] = active_main.read_native_map11_provider() != null
	sequence = SequenceScript.new()
	sequence.name = "NativeIntroCurtainSequence"
	_check(sequence.configure(world, player, active_main.get_native_intro_curtain_view(), active_main.get("source_state")), "sequence configure")
	world.add_child(sequence)
	_check(sequence.begin_native_intro().get("applied") == true, "intro begin applied")
	var finished: Dictionary = sequence.finish_native_guide()
	_check(int(finished.get("spawned", 0)) == 5, "5 ring enemies spawned (63426~63432)")
	var ring: Array = []
	for e in world.get_enemies():
		if str(e.get("data")["id"]).begins_with("ch1_curtain_ring_"):
			ring.append(e)
	_check(ring.size() == 5, "registry has 5 ring actors")
	if ring.is_empty():
		return
	for e in ring:
		_check(e.get("_source_normal_fields_configured") == false, "ring stays outside v3 exact domain (Mac contract) " + str(e.get("data")["id"]))
	var target: Node2D = ring[0]
	var call: Variant = world.begin_native_normal_enemy_field_call(target)
	_check(call == null, "v3 field call stays unavailable for curtain ring (exact domain not weakened)")
	if call != null:
		world.end_native_normal_enemy_field_call(call)
	_check(target.has_method("apply_native_normal_enemy_poise_core"), "curtain ring exposes common poise core owner (19973~19983)")
	var hp0: float = float(target.get("hp"))
	var sh0: float = float(target.get("eShield"))
	# 31184 eShield=_hp (매직 엘리트면 ×2 — 링 RNG). 비치사 1타 = 쉴드 전액 + HP 25.
	_check(hp0 > 25.0 and sh0 == hp0 and float(target.get("mhp")) == hp0, "ring eShield == HP == mhp (31146~31184)")
	var first_dmg: int = int(sh0) + 25
	var g: Dictionary = active_main.get("source_state").read_current_g()
	var kills0: int = int(g.get("kills", 0))
	var first: Dictionary = _hit(active_main, target, first_dmg, 0.0)
	observations["ring_first_hit"] = {"ok": first.get("ok"), "reason": first.get("reason", ""), "absorbed": first.get("absorbed"), "dmg_to_hp": first.get("dmg_to_hp")}
	_check(first.get("ok") == true and first.get("applied") == true, "non-lethal kiSlash hit applied (no 42490 halt)")
	_check(_journal_route(first) == "owner_core", "poise 42490 via common owner core (no halt)")
	_check(float(first.get("absorbed", -1)) == sh0 and int(first.get("dmg_to_hp", -1)) == 25, "eShield absorbs all, overflow 25 to HP")
	_check(float(target.get("hp")) == hp0 - 25.0 and target.get("alive") == true, "HP-25 alive after first hit")
	var second: Dictionary = _hit(active_main, target, 5000, 0.0)
	observations["ring_second_hit"] = {"ok": second.get("ok"), "reason": second.get("reason", ""), "killed": second.get("killed")}
	_check(second.get("ok") == true and second.get("killed") == true, "lethal kiSlash hit runs kill pipeline")
	_check(target.get("alive") == false, "actor death committed (alive=false)")
	g = active_main.get("source_state").read_current_g()
	_check(int(g.get("kills", 0)) == kills0 + 1, "G.kills +1 from actual kill pipeline")
	# 남은 링 전부 같은 경로로 처치 — 정지·좀비 0.
	var halted := 0
	# 마지막 1마리는 보행 그룹의 실제 일반 적 몸체로 남긴다.
	for i in range(1, ring.size() - 1):
		var e: Node = ring[i]
		var r: Dictionary = _hit(active_main, e, 5000, 0.0)
		if r.get("ok") != true:
			halted += 1
			print("PCKILL_HALT ", r.get("halted_at"), " ", r.get("reason"))
		elif e.get("alive") == true:
			# 부활 무적(42121) 등 원본 조기 반환은 처치가 아니다 — 같은 입력을 다시 1회.
			r = _hit(active_main, e, 5000, 0.0)
	_check(halted == 0, "no hurtE halt on any ring actor")
	_check(_no_zombies(world), "no hp<=0 && alive actor (zombie invariant)")

# ── 2: 보행 canMv — 일반 적 몸체 비차단 / 벽 canMv 축 분리 ──
func _test_walk_canmv() -> void:
	if not is_instance_valid(active_main):
		return
	var world: Node2D = active_main.get("world")
	var player: Node2D = active_main.get("player")
	# 34413/34424 모닥불(t300,r280) push-out이 끝난 뒤의 실제 접근 상황에서 측정한다.
	for i in range(600):
		if not is_instance_valid(sequence) or float(sequence.get_snapshot()["bonfire"]["t"]) <= 0.0:
			break
		await physics_frame
	_check(is_instance_valid(sequence) and float(sequence.get_snapshot()["bonfire"]["t"]) <= 0.0, "bonfire push-out expired before walk")
	var blocker: Node2D = null
	for e in world.get_enemies():
		if is_instance_valid(e) and e.get("alive") == true:
			blocker = e
			break
	var per_tick: float = float(player.get("_movement_speed")) / 60.0
	var ticks_per_frame: float = 60.0 / float(Engine.physics_ticks_per_second)
	var release := func():
		for a in ["move_up", "move_down", "move_left", "move_right"]:
			var ev := InputEventAction.new(); ev.action = a; ev.pressed = false
			player.handle_native_input_event(ev)
	var hold := func(action: String):
		var ev := InputEventAction.new(); ev.action = action; ev.pressed = true
		return player.handle_native_input_event(ev)
	if blocker != null:
		# 테스트 배치: 살아있는 링 1마리를 플레이어 북쪽 70px(경로상, 몸체 비겹침)에 1회 둔다.
		blocker.global_position = player.global_position + Vector2(0, -70)
		var y0: float = player.global_position.y
		var x0: float = player.global_position.x
		hold.call("move_up")
		var n := 0
		for i in range(40):
			await physics_frame
			if player.get("state") == "idle":
				n += 1
		release.call()
		var moved: float = y0 - player.global_position.y
		observations["walk_through_enemy"] = {"moved": moved, "idle_frames": n, "per_tick": per_tick}
		_check(moved >= per_tick * ticks_per_frame * float(n) * 0.95, "normal enemy body does not block walking (no layer-4 move_and_slide)")
		_check(absf(player.global_position.x - x0) < 0.001, "pure north input keeps x (no slide deflection)")
	# 벽: 현재 위치에서 canMv가 막히는 가장 가까운 축 방향을 찾는다.
	var here: Vector2 = player.global_position
	var radius: float = float(player.get("radius"))
	var best_dir := Vector2.ZERO
	var best_d := INF
	for d in [Vector2.LEFT, Vector2.RIGHT, Vector2.UP, Vector2.DOWN]:
		for k in range(1, 800):
			if not world.can_move(here + d * k, radius):
				if k < best_d:
					best_d = k
					best_dir = d
				break
	_check(best_d < INF, "a canMv wall exists on an axis")
	if best_d == INF:
		return
	# 테스트 배치: 벽 앞 (best_d-12)px 까지 플레이어를 옮긴다(이동 판정 대상만).
	player.global_position = here + best_dir * maxf(0.0, best_d - 12.0)
	var action: String = {Vector2.LEFT: "move_left", Vector2.RIGHT: "move_right", Vector2.UP: "move_up", Vector2.DOWN: "move_down"}[best_dir]
	var side: String = "move_down" if best_dir.x != 0.0 else "move_right"
	hold.call(action)
	hold.call(side)
	var start: Vector2 = player.global_position
	var inside_wall := false
	for i in range(40):
		await physics_frame
		if not world.can_move(player.global_position, radius):
			inside_wall = true
	release.call()
	var along: float = (player.global_position - start).dot(best_dir)
	var lateral: float = (player.global_position - start).dot(Vector2(best_dir.y, best_dir.x).abs())
	observations["walk_wall"] = {"dir": str(best_dir), "wall_at": best_d, "along": along, "lateral": lateral}
	_check(not inside_wall, "player never enters canMv-blocked position")
	_check(along <= 12.0 + 0.001, "wall axis movement stops at canMv boundary")
	_check(absf(lateral) > per_tick, "other axis keeps moving while wall axis is blocked (axis-separated canMv)")

# ── 3: Group-A a_0/a_5/a_6 실제 등록 actor — v3 domain + etype6 방패 42167 ──
func _test_group_a_domain_and_etype6() -> void:
	_free_main()
	fixture = FIXTURE.new()
	var ready: bool = await _setup_group_a(fixture)
	_check(ready and fixture.actors.size() == 5, "actual Group-A cohort registered (0,1,4,5,6)")
	if not ready:
		print("PCKILL_GROUP_A_SETUP ", JSON.stringify(observations.get("group_a_setup", {})).left(1500))
		return
	var main: Node = fixture.main
	var world: Node = main.world
	for i in range(4):
		await physics_frame
	for a in fixture.actors:
		if int(a.etype) in [0, 5, 6]:
			_check(a.get("_source_normal_fields_configured") == false, "v3 exact domain not weakened etype%d %s" % [a.etype, (a.get_script() as Script).resource_path.get_file()])
	# 부활 무적(Group-A 생성 reviveIframes=15) 소진까지 원본 phase clock 대기.
	for i in range(240):
		var pending := false
		for a in fixture.actors:
			if float(a.data.native_final.get("reviveIframes", 0.0)) > 0.0:
				pending = true
		if not pending:
			break
		await physics_frame
	for a in fixture.actors:
		if int(a.etype) in [0, 5]:
			var r: Dictionary = _hit(main, a, 900, 0.0)
			_check(r.get("ok") == true and r.get("applied") == true, "etype%d kiSlash hit applied (no halt) reason=%s" % [a.etype, str(r.get("reason", ""))])
			_check(_journal_route(r) == "owner_core", "etype%d poise via common owner core" % a.etype)
		elif int(a.etype) == 6:
			var sa: float = float(a.data.native_final.shieldAng)
			var sh_before: float = float(a.eShield)
			var hp_before: float = float(a.hp)
			# 정면(shDiff=0): ang+π == shieldAng
			var blocked: Dictionary = _hit(main, a, 900, wrapf(sa - PI, -PI, PI))
			observations["etype6_blocked"] = {"ok": blocked.get("ok"), "reason": blocked.get("reason", ""), "absorbed": blocked.get("absorbed"), "dmg_to_hp": blocked.get("dmg_to_hp")}
			_check(blocked.get("ok") == true and blocked.get("applied") == true, "etype6 hit applied (42136 halt removed)")
			_check(float(blocked.get("absorbed", 0)) + float(blocked.get("dmg_to_hp", 0)) == 270.0, "42168 front shield dmg ×0.3 (900→270)")
			_check(float(a.eShield) + float(a.hp) == sh_before + hp_before - 270.0, "etype6 pools reduced by 270")
			var sh_mid: float = float(a.eShield)
			var hp_mid: float = float(a.hp)
			# 등 뒤(shDiff=π): 경감 없음
			var open: Dictionary = _hit(main, a, 900, wrapf(sa, -PI, PI))
			_check(open.get("ok") == true, "etype6 rear hit applied")
			_check(float(a.eShield) + float(a.hp) == sh_mid + hp_mid - 900.0, "rear hit not reduced (|shDiff|>=π/3)")
			var lethal: Dictionary = _hit(main, a, 999999, wrapf(sa, -PI, PI))
			_check(lethal.get("ok") == true and lethal.get("killed") == true and a.alive == false, "etype6 actor dies through kill pipeline")
	_check(_no_zombies(world), "no zombie in Group-A cohort")

# ── 4: v3 exact actor는 v3 경로 유지(이중 owner 금지) — 공용 코어는 거부 ──
func _test_domain_negative() -> void:
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://data/etype0_physical_flesh_crawler.json"))
	_check(parsed is Dictionary and parsed.get("runtime") is Dictionary, "etype0 template loads")
	if not parsed is Dictionary:
		return
	var template: Dictionary = parsed["runtime"]
	var probe: CharacterBody2D = FLESH_SCRIPT.new()
	probe.configure(template.duplicate(true), null)
	_check(probe.get("_source_normal_fields_configured") == true, "exact factory actor ch1_initial_015 keeps v3 domain")
	var refused: Dictionary = probe.apply_native_normal_enemy_poise_core(10)
	_check(refused.get("applied") == false and refused.get("reason") == "v3_domain_actor_uses_source_field_call", "v3 actor refuses common core (single owner)")
	probe.free()
	var other: Dictionary = template.duplicate(true)
	other["id"] = "ch1_curtain_ring_99"
	probe = FLESH_SCRIPT.new()
	probe.configure(other, null)
	_check(probe.get("_source_normal_fields_configured") == false, "non-exact actor not admitted to v3 (domain unchanged)")
	probe.free()

# demo11_etype_a_fixture.setup와 같은 실제 marker cohort(main.request_native_etype_a_spawn).
# 차이: 기존 맵 부팅을 명시(native_map11=off — 기본 MAP11 provider가 이미 바인딩된 부팅에서는
# 테스트 provider 바인딩이 거부된다). 그 외 단계·레시피는 픽스처 그대로 호출한다.
func _setup_group_a(f: RefCounted) -> bool:
	f.main = load("res://scenes/main.tscn").instantiate()
	f.main.set_meta("native_map11", "off")
	root.add_child(f.main)
	for i in range(8):
		await physics_frame
	f.main.set_process(false)
	f.main.player.set_physics_process(false)
	f.provider = FIXTURE.Provider.new(); f.provider.world = f.main.world; f.main.world.add_child(f.provider)
	for i in range(4):
		var at: Vector2 = f.main.player.global_position + Vector2(-300 + i * 200, -300)
		if not f.main.world.can_move(at, 40):
			var safe: Variant = f.main.world.native_safe_point(at.x, at.y, 40)
			if safe == null:
				observations["group_a_setup"] = {"step": "safe_point", "i": i}
				return false
			at = Vector2(safe.x, safe.y)
		var marker := Marker2D.new(); marker.global_position = at; f.provider.add_child(marker)
		f.provider.rows.append({"id": "cohort-hole-" + str(i), "marker": marker, "region_id": i, "room": -1, "size": .3})
		f.provider.groups.append({"hole_id": "cohort-hole-" + str(i), "spawn_group_id": "cohort-group-" + str(i), "region_id": i, "total": 8})
	var bound: Dictionary = f.main.bind_native_spawn_stage_provider(f.provider)
	if not bound.get("ready", false):
		observations["group_a_setup"] = {"step": "bind", "result": bound}
		return false
	f.holes = f.main.world.get_node("NativeSpawnHoleSystem")
	f.main.source_state.read_current_g().on = true
	var types: Array = [0, 1, 4, 5, 6]
	for i in range(5):
		var result: Dictionary = f.main.request_native_etype_a_spawn(f.holes, "cohort-group-" + str(i % 4), FIXTURE.recipe(types[i], 2 if i == 4 else 1))
		f.receipts.append(result)
		if not result.get("ready", false):
			observations["group_a_setup"] = {"step": "spawn", "etype": types[i], "result": str(result).left(600)}
			return false
		f.actors.append(result.actor)
	return true
