extends SceneTree
## PC-BOSS-CORE (2026-10-22) — 1-1 보스 전투 owner 실제 Main 부팅(MAP11 기본) 회귀.
## 입장: 실제 P3 gate(지역 cleared·_fbDone fixture 입력) → main.enter_native_demo_arena(실제 provider) — DEMO11-44 테스트와 같은 경로.
## A 자연 전투: 보스 상태·시계·패턴·피해를 주입하지 않는다. 플레이어는 handle_native_input_event(이동·조준·weapon)만 쓴다.
## B 사망 흐름: 보스 정본 E 의 HP/쉴드/부활력을 fixture 로 낮춘 뒤(명시) 실제 플레이어 공격으로 처치 → PCI-11·encounter.
const USERDIR := "EXODUSER-pc-boss-core-Isolated-20261022"
var assertions := 0
var failures := 0
var main: Node
var finals: Array = []
var pendings: Array = []
var cancels: Array = []

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("PCBOSS_FAIL ", label)

func _initialize() -> void:
	create_timer(float(_arg("watchdog", "600"))).timeout.connect(func(): print("PCBOSS_WATCHDOG"); quit(2))
	call_deferred("_run")

func _arg(name: String, fallback: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--" + name + "="): return a.trim_prefix("--" + name + "=")
	return fallback

func _on_death(payload: Dictionary) -> void:
	match str(payload.get("event")):
		"final_death": finals.append(payload.duplicate())
		"revival_pending": pendings.append(payload.duplicate())
		"cancel": cancels.append(payload.duplicate())

func _boss_world() -> Vector2:
	var core: Node = main.native_demo_boss_core
	return core.body.global_position if is_instance_valid(core.body) else Vector2.ZERO

func _press(action: String, pressed: bool) -> Dictionary:
	var ev := InputEventAction.new()
	ev.action = action
	ev.pressed = pressed
	return main.player.handle_native_input_event(ev)

func _aim_at(world_pos: Vector2) -> void:
	var cam: Camera2D = main.get("camera")
	var vp: Vector2 = root.get_visible_rect().size
	var zoom: Vector2 = cam.zoom if is_instance_valid(cam) else Vector2.ONE
	var center: Vector2 = cam.get_screen_center_position() if is_instance_valid(cam) else main.player.global_position
	var mm := InputEventMouseMotion.new()
	mm.position = vp * 0.5 + (world_pos - center) * zoom
	main.player.handle_native_input_event(mm)

## 보스를 향해 걷고 사거리 안이면 weapon 연타. 반환: 이 구간의 근접 hurtE 적용 수
func _fight(ticks: int, stop_dist: float, label: String, stop_on_exchange := false, stop_on_death := false, protect := false) -> Dictionary:
	var held := {}
	var melee := 0
	var states := {}
	var hits_before: int = int(main.native_demo_boss_core.counters.boss_hits)
	var deaths_before: int = int(main.native_demo_boss_core.counters.deaths)
	for t in range(ticks):
		var bp := _boss_world()
		var to: Vector2 = bp - main.player.global_position
		_aim_at(bp)
		var want := {"move_right": to.x > 30, "move_left": to.x < -30, "move_down": to.y > 30, "move_up": to.y < -30}
		var close: bool = to.length() < stop_dist
		for k in want:
			var on: bool = want[k] and not close
			if held.get(k, false) != on:
				_press(k, on)
				held[k] = on
		if protect: main.player.iframes = maxf(main.player.iframes, 10.0) # fixture(B): 사망 흐름 검증 동안 플레이어 생존
		if close and t % 12 == 0:
			_press("weapon", true)
		elif close and t % 12 == 4:
			_press("weapon", false)
		await physics_frame
		var s: String = str(main.native_demo_boss_actor.snapshot().enemy.get("s", ""))
		states[s] = int(states.get(s, 0)) + 1
		if main.player.hp <= 0: break
		if stop_on_exchange and int(main.native_demo_boss_core.counters.boss_hits) > hits_before + 2 and main.player.hp < main.player.max_hp * 0.6: break
		if stop_on_death and (main.native_demo_boss_core.E.get("alive") != true or int(main.native_demo_boss_core.counters.deaths) > deaths_before): break
	for k in held:
		if held[k]: _press(k, false)
	_press("weapon", false)
	var hits_after: int = int(main.native_demo_boss_core.counters.boss_hits)
	print("PCBOSS_FIGHT ", label, " ", JSON.stringify({"states": states, "boss_hits": hits_after - hits_before, "php": main.player.hp,
		"core": main.native_demo_boss_core.snapshot().counters}))
	return {"states": states, "hits": hits_after - hits_before}

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	check(not ("--map11=off" in OS.get_cmdline_user_args()), "map11_default_on")
	var ticks: int = int(_arg("ticks", "300"))
	main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_intro_boot", "intro")
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	main.source_intro_sequence.finish_native_guide()
	main.source_state.read_current_g().on = true
	for i in range(65): await physics_frame
	main.source_intro_sequence.lesson_flow.skip_all()
	var core: Node = main.get("native_demo_boss_core")
	check(is_instance_valid(core), "core_installed")
	check(core.snapshot().adopted == false, "core_dormant_before_spawn")
	var sub: Dictionary = main.subscribe_native_final_enemy_death(Callable(self, "_on_death"), {"subscriber": main, "events": ["final_death", "revival_pending", "cancel"]})
	check(sub.get("accepted") == true, "pci11_subscribe")
	# ── 실제 gate 경로 입장(DEMO11-44 fixture와 동일 입력) ──
	var provider: Node2D = main.read_native_map11_provider()
	check(is_instance_valid(provider), "map11_provider")
	var g: Dictionary = main.source_state.read_current_g()
	g.on = true; g._fbDone = true; g.bossAlive = true
	for region in g._regions: region.cleared = true
	var regions: Node = main.get_node("NativeRegions")
	regions.set("_last_frame", -1.0); regions._physics_process(0)
	var entered: Dictionary = main.enter_native_demo_arena(provider, {"room": 0, "difficulty_index": 5, "stage_diff_offset": 0})
	print("PCBOSS_ENTER ", JSON.stringify({"status": entered.get("status"), "core": entered.get("pc_boss_core"), "phase": main.native_demo_encounter.snapshot().phase}))
	check(entered.get("status") == "READY" and main.native_demo_encounter.snapshot().phase == "arena", "real_arena_entry")
	check(entered.get("pc_boss_core", {}).get("adopted") == true, "core_adopted")
	var actor: Node = main.native_demo_boss_actor
	check(main.world.get_enemies().has(core.body), "boss_body_in_world_registry")
	var start: Vector2 = _boss_world()
	# ── A1: 자연 AI 관측(입력 없음) ──
	var states: Dictionary = {}
	var max_move := 0.0
	var php0: float = main.player.hp
	var min_d_a1 := 1e9
	for t in range(ticks):
		await physics_frame
		var s: String = str(actor.snapshot().enemy.get("s", ""))
		states[s] = int(states.get(s, 0)) + 1
		max_move = maxf(max_move, _boss_world().distance_to(start))
		min_d_a1 = minf(min_d_a1, _boss_world().distance_to(main.player.global_position))
		if t % 300 == 0:
			print("PCBOSS_LIVE ", t, " ", JSON.stringify({"s": s, "ticks": actor.snapshot().ticks_completed, "reason": actor.snapshot().reason, "core_err": core.snapshot().error, "php": main.player.hp}))
	var snap: Dictionary = actor.snapshot()
	print("PCBOSS_STATES ", JSON.stringify(states))
	check(snap.ticks_completed >= ticks - 2, "boss_ticks_completed_every_frame:%d" % snap.ticks_completed)
	check(snap.reason == "" and core.snapshot().error == "", "no_actor_or_core_error:%s/%s" % [snap.reason, core.snapshot().error])
	check(max_move > 1.0, "boss_moved")
	# PC-BOSS-CHASE(2026-10-22): 원본은 d≤500 전에는 패턴을 시작하지 않는다(_bossAI 38387 `d>500` return). 입구(1960px)에서
	# 비어그로 접근은 facing 에 따라 0.64~2.24px/틱이라 진입 300틱 안에는 원본도 어떤 facing 이든 idle 만 나온다
	# (tests/pc_boss_chase_oracle.cjs sweep). → A1 은 "사거리 밖이면 idle 만"을 단정하고, 패턴 상태 수는 실제 교전(A2)까지 합쳐 센다.
	check(min_d_a1 <= 500.0 or states.keys() == ["idle"], "A1_no_pattern_before_range_source_38387:%s/%.1f" % [JSON.stringify(states), min_d_a1])
	var php_after_a1: float = main.player.hp
	if main.player.hp > 0: main.player.hp = main.player.max_hp # fixture: A2 전 체력만 복구(보스 상태 미변경)
	# ── A2: 실제 입력 근접 전투 ──
	var fight: Dictionary = await _fight(int(_arg("fight_ticks", "900")), 70.0, "A2", true)
	var all_states: Dictionary = states.duplicate()
	for k in fight.states: all_states[k] = int(all_states.get(k, 0)) + int(fight.states[k])
	check(all_states.size() >= 3, "boss_pattern_states:%s" % JSON.stringify(all_states))
	var cs: Dictionary = core.snapshot()
	print("PCBOSS_CORE_A ", JSON.stringify(cs))
	check(cs.error == "" and actor.snapshot().reason == "", "A2_no_core_or_actor_error:%s/%s" % [cs.error, actor.snapshot().reason])
	check(int(cs.counters.not_ready) == 0, "A2_actor_never_stalled:%d" % int(cs.counters.not_ready))
	check(int(cs.counters.boss_hits) > 0, "player_damage_reaches_boss")
	check(float(cs.boss.eShield) < float(cs.boss.mhp) or float(cs.boss.hp) < float(cs.boss.mhp), "boss_shield_or_hp_reduced")
	check(float(cs.counters.player_damage) > 0 or main.player.hp < php0, "boss_damage_reaches_player")
	# ── B: 사망 흐름(fixture: 정본 E 수치만) — 1차 즉시 부활 ──
	check(main.player.hp > 0, "player_alive_before_B")
	if main.player.hp <= 0:
		print("PCBOSS_NOTE player_dead_before_B")
	else:
		main.player.hp = main.player.max_hp
		var E: Dictionary = core.E
		# _bossPhase=4: HP 하한(38236–38245 phase 하한)이 fixture HP 를 되돌리지 않게 한다
		E.hp = 30.0; E.eShield = 0.0; E._revPts = 200.0; E.deaths = 0; E._bossPhase = 4
		var before_deaths: int = int(core.counters.deaths)
		await _fight(600, 70.0, "B1", false, true, true)
		for i in range(3): await physics_frame
		print("PCBOSS_B1 ", JSON.stringify(core.snapshot().boss))
		check(int(core.counters.deaths) > before_deaths, "B1_lethal_hit_reached_death_branch")
		check(int(core.counters.immediate_revives) >= 1 and core.E.alive == true and float(core.E.hp) == float(core.E.mhp), "B1_immediate_revive_full_hp")
		check(finals.is_empty(), "B1_no_final_publish")
		# ── B2: 부활력 소진 → 폴백 확률 0 → 완전 사망 ──
		main.player.hp = main.player.max_hp
		E.hp = 30.0; E.eShield = 0.0; E._revPts = 10.0; E.reviveIframes = 0.0; E._bossPhase = 4
		await _fight(600, 70.0, "B2", false, true, true)
		var waited := 0
		while core.E.get("alive") == false and float(core.E.get("_reviveTimer", 0)) > 0 and waited < 400:
			main.player.iframes = maxf(main.player.iframes, 10.0) # fixture: 판정 대기 중 플레이어 생존(보스 상태 미변경)
			await physics_frame
			waited += 1
		for i in range(40):
			main.player.iframes = maxf(main.player.iframes, 10.0)
			await physics_frame
		print("PCBOSS_B2_LIFE ", JSON.stringify({"php": main.player.hp, "life": main.read_native_player_life_phase(), "waited": waited}))
		print("PCBOSS_B2 ", JSON.stringify({"boss": core.snapshot().boss, "finals": finals.size(), "pendings": pendings.size(), "phase": main.native_demo_encounter.snapshot().phase}))
		check(core.E.get("alive") == false, "B2_boss_dead")
		check(finals.size() == 1, "B2_final_death_published_once:%d" % finals.size())
		check(finals.size() == 1 and finals[0].actor == actor and finals[0].stage == 0, "B2_final_payload_actor_stage")
		check(main.native_demo_encounter.snapshot().phase == "exit", "B2_encounter_exit_opened:" + str(main.native_demo_encounter.snapshot().phase))
		var records: Array = main.source_state.read_native_drop_records()
		var chest := false
		for r in records: if r.get("type") == "chest": chest = true
		check(chest, "B2_reward_chest_record")
		await _fight(120, 70.0, "B3", false, false, true)
		check(finals.size() == 1, "B3_no_duplicate_final")
	print("PCBOSS_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "ticks": actor.snapshot().ticks_completed,
		"player_hp_start": php0, "player_hp_after_a1": php_after_a1, "max_move": max_move, "finals": finals.size(), "pendings": pendings.size(),
		"cancels": cancels.size(), "core": core.snapshot()}))
	main.free()
	quit(1 if failures else 0)
